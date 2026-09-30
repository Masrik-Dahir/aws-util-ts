/**
 * aws-util/resilience — Multi-service resilience patterns.
 *
 * Provides typed helpers for building resilient serverless architectures
 * using DynamoDB-backed circuit breakers, retry with exponential backoff,
 * DLQ monitoring with SNS alerting, poison-pill quarantine to S3/DynamoDB,
 * Lambda destination routing, graceful degradation with DynamoDB caching,
 * and timeout sentinels.
 *
 * Multi-service: Lambda + DynamoDB + SQS + SNS + S3.
 *
 * All functions obtain clients via {@link getClient} and wrap errors
 * through {@link wrapAwsError}.
 *
 * @example
 * ```ts
 * import {
 *   circuitBreaker,
 *   retryWithBackoff,
 *   dlqMonitorAndAlert,
 *   gracefulDegradation,
 * } from "./resilience.js";
 *
 * const result = await circuitBreaker(
 *   () => fetch("https://api.example.com"),
 *   "my-api",
 *   "circuit-breaker-table",
 * );
 *
 * const withRetry = retryWithBackoff(3, 100, 5000);
 * const retried = await withRetry(() => fetch("https://api.example.com"));
 * ```
 *
 * @module
 */

import { z } from "zod";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";
import {
  SQSClient,
  GetQueueAttributesCommand,
} from "@aws-sdk/client-sqs";
import {
  SNSClient,
  PublishCommand,
} from "@aws-sdk/client-sns";
import {
  S3Client,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import {
  LambdaClient,
  PutFunctionEventInvokeConfigCommand,
} from "@aws-sdk/client-lambda";
import { getClient } from "./client.js";
import { wrapAwsError } from "./exceptions.js";

// ---------------------------------------------------------------------------
// Zod schemas & inferred types
// ---------------------------------------------------------------------------

/** Schema for circuit breaker state persisted in DynamoDB. */
export const CircuitBreakerStateSchema = z.object({
  circuitName: z.string(),
  state: z.enum(["closed", "open", "half_open"]),
  failureCount: z.number(),
  lastFailureTime: z.number().optional(),
});

/** Circuit breaker state persisted in DynamoDB. */
export type CircuitBreakerState = z.infer<typeof CircuitBreakerStateSchema>;

/** Schema for the result of a circuit breaker invocation. */
export const CircuitBreakerResultSchema = z.object({
  success: z.boolean(),
  result: z.unknown().optional(),
  circuitState: CircuitBreakerStateSchema,
});

/** Result of a circuit breaker invocation. */
export type CircuitBreakerResult = z.infer<typeof CircuitBreakerResultSchema>;

/** Schema for the result of a retry-with-backoff invocation. */
export const RetryResultSchema = z.object({
  success: z.boolean(),
  result: z.unknown().optional(),
  attempts: z.number(),
  lastError: z.string().optional(),
});

/** Result of a retry-with-backoff invocation. */
export type RetryResult = z.infer<typeof RetryResultSchema>;

/** Schema for the result of a DLQ monitoring check. */
export const DLQMonitorResultSchema = z.object({
  queueUrl: z.string(),
  messageCount: z.number(),
  alerted: z.boolean(),
});

/** Result of a DLQ monitoring check. */
export type DLQMonitorResult = z.infer<typeof DLQMonitorResultSchema>;

/** Schema for the result of poison pill processing. */
export const PoisonPillResultSchema = z.object({
  processed: z.number(),
  quarantined: z.number(),
});

/** Result of poison pill processing. */
export type PoisonPillResult = z.infer<typeof PoisonPillResultSchema>;

/** Schema for a Lambda destination configuration. */
export const LambdaDestinationConfigSchema = z.object({
  functionName: z.string(),
  onSuccessArn: z.string().optional(),
  onFailureArn: z.string().optional(),
});

/** Lambda destination configuration. */
export type LambdaDestinationConfig = z.infer<
  typeof LambdaDestinationConfigSchema
>;

/** Schema for the result of graceful degradation. */
export const GracefulDegradationResultSchema = z.object({
  fromCache: z.boolean(),
  result: z.unknown(),
  error: z.string().optional(),
});

/** Result of graceful degradation. */
export type GracefulDegradationResult = z.infer<
  typeof GracefulDegradationResultSchema
>;

/** Schema for the result of a timeout sentinel. */
export const TimeoutSentinelResultSchema = z.object({
  completed: z.boolean(),
  result: z.unknown().optional(),
  timedOut: z.boolean(),
});

/** Result of a timeout sentinel. */
export type TimeoutSentinelResult = z.infer<
  typeof TimeoutSentinelResultSchema
>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Internal cache of DynamoDBDocumentClient instances keyed by region.
 */
const docClientCache = new Map<string, DynamoDBDocumentClient>();

/**
 * Get a DynamoDBDocumentClient for the given region.
 */
function docClient(region?: string): DynamoDBDocumentClient {
  const key = region ?? "__default__";
  const cached = docClientCache.get(key);
  if (cached) {
    return cached;
  }
  const raw = getClient(DynamoDBClient, region);
  const doc = DynamoDBDocumentClient.from(raw, {
    marshallOptions: { removeUndefinedValues: true },
  });
  docClientCache.set(key, doc);
  return doc;
}

/**
 * Get a cached SQSClient for the given region.
 */
function sqs(region?: string): SQSClient {
  return getClient(SQSClient, region);
}

/**
 * Get a cached SNSClient for the given region.
 */
function sns(region?: string): SNSClient {
  return getClient(SNSClient, region);
}

/**
 * Get a cached S3Client for the given region.
 */
function s3(region?: string): S3Client {
  return getClient(S3Client, region);
}

/**
 * Get a cached LambdaClient for the given region.
 */
function lambda(region?: string): LambdaClient {
  return getClient(LambdaClient, region);
}

/**
 * Sleep for a given number of milliseconds.
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * DynamoDB-backed circuit breaker for protecting downstream calls.
 *
 * Reads the circuit state from a DynamoDB table, checks whether the
 * circuit is open or half-open, executes the function if allowed, and
 * updates the state accordingly. When the circuit is open and the
 * recovery timeout has not elapsed, the call is rejected immediately.
 *
 * @param fn - The async function to protect.
 * @param circuitName - Unique name for this circuit breaker.
 * @param tableName - DynamoDB table storing circuit state (PK: `circuitName`).
 * @param failureThreshold - Number of failures before opening the circuit (default 5).
 * @param recoveryTimeout - Seconds to wait before trying half-open (default 60).
 * @param region - AWS region override.
 * @returns The circuit breaker result with success flag, result, and circuit state.
 */
export async function circuitBreaker(
  fn: () => Promise<unknown>,
  circuitName: string,
  tableName: string,
  failureThreshold?: number,
  recoveryTimeout?: number,
  region?: string,
): Promise<CircuitBreakerResult> {
  const threshold = failureThreshold ?? 5;
  const recovery = recoveryTimeout ?? 60;
  const ddb = docClient(region);

  // Read current state from DynamoDB
  let state: CircuitBreakerState;
  try {
    const resp = await ddb.send(
      new GetCommand({
        TableName: tableName,
        Key: { circuitName },
      }),
    );
    if (resp.Item) {
      state = CircuitBreakerStateSchema.parse(resp.Item);
    } else {
      state = {
        circuitName,
        state: "closed",
        failureCount: 0,
      };
    }
  } catch (err) {
    throw wrapAwsError(
      err,
      `Failed to read circuit breaker state for ${circuitName}`,
    );
  }

  const now = Math.floor(Date.now() / 1000);

  // If circuit is open, check if recovery timeout has elapsed
  if (state.state === "open") {
    const lastFail = state.lastFailureTime ?? 0;
    if (now - lastFail < recovery) {
      // Still open — reject immediately
      return CircuitBreakerResultSchema.parse({
        success: false,
        circuitState: state,
      });
    }
    // Recovery timeout elapsed — transition to half_open
    state = { ...state, state: "half_open" };
  }

  // Attempt to execute the function
  try {
    const result = await fn();

    // Success — reset circuit to closed
    const newState: CircuitBreakerState = {
      circuitName,
      state: "closed",
      failureCount: 0,
    };

    try {
      await ddb.send(
        new PutCommand({
          TableName: tableName,
          Item: newState,
        }),
      );
    } catch (err) {
      throw wrapAwsError(
        err,
        `Failed to update circuit breaker state for ${circuitName}`,
      );
    }

    return CircuitBreakerResultSchema.parse({
      success: true,
      result,
      circuitState: newState,
    });
  } catch {
    // Failure — increment failure count
    const newCount = state.failureCount + 1;
    const newState: CircuitBreakerState = {
      circuitName,
      state: newCount >= threshold ? "open" : state.state === "half_open" ? "open" : "closed",
      failureCount: newCount,
      lastFailureTime: now,
    };

    try {
      await ddb.send(
        new PutCommand({
          TableName: tableName,
          Item: newState,
        }),
      );
    } catch (putErr) {
      throw wrapAwsError(
        putErr,
        `Failed to update circuit breaker state for ${circuitName}`,
      );
    }

    return CircuitBreakerResultSchema.parse({
      success: false,
      circuitState: newState,
    });
  }
}

/**
 * Create a retry-with-backoff wrapper function.
 *
 * Returns a decorator-like function that wraps an async operation with
 * exponential backoff and jitter. Each retry doubles the delay (up to
 * `maxDelay`) with a random jitter factor.
 *
 * @param maxRetries - Maximum number of retry attempts (default 3).
 * @param baseDelay - Base delay in milliseconds (default 100).
 * @param maxDelay - Maximum delay in milliseconds (default 5000).
 * @param retryableExceptions - Error names/messages to retry on (default: all errors).
 * @returns A wrapper function that executes the given function with retries.
 */
export function retryWithBackoff(
  maxRetries?: number,
  baseDelay?: number,
  maxDelay?: number,
  retryableExceptions?: string[],
): <T>(fn: () => Promise<T>) => Promise<RetryResult> {
  const retries = maxRetries ?? 3;
  const base = baseDelay ?? 100;
  const max = maxDelay ?? 5000;
  const retryable = retryableExceptions
    ? new Set(retryableExceptions)
    : undefined;

  return async <T>(fn: () => Promise<T>): Promise<RetryResult> => {
    let lastError: string | undefined;

    for (let attempt = 1; attempt <= retries + 1; attempt++) {
      try {
        const result = await fn();
        return RetryResultSchema.parse({
          success: true,
          result,
          attempts: attempt,
        });
      } catch (err) {
        const errMsg =
          err instanceof Error ? err.message : String(err);
        const errName = err instanceof Error ? err.name : "";
        lastError = errMsg;

        // Check if this error is retryable
        if (retryable) {
          const isRetryable =
            retryable.has(errName) ||
            [...retryable].some((r) => errMsg.includes(r));
          if (!isRetryable) {
            return RetryResultSchema.parse({
              success: false,
              attempts: attempt,
              lastError,
            });
          }
        }

        // If we've exhausted retries, return failure
        if (attempt > retries) {
          return RetryResultSchema.parse({
            success: false,
            attempts: attempt,
            lastError,
          });
        }

        // Exponential backoff with jitter
        const delay = Math.min(
          base * Math.pow(2, attempt - 1),
          max,
        );
        const jitter = delay * (0.5 + Math.random() * 0.5);
        await sleep(jitter);
      }
    }

    return RetryResultSchema.parse({
      success: false,
      attempts: retries + 1,
      lastError,
    });
  };
}

/**
 * Monitor a dead-letter queue and alert via SNS if depth exceeds a threshold.
 *
 * Queries the approximate number of messages in the given SQS queue and
 * publishes an SNS notification if it exceeds the threshold.
 *
 * @param queueUrl - The SQS queue URL to monitor.
 * @param topicArn - The SNS topic ARN for alert notifications.
 * @param threshold - Message count threshold for alerting (default 10).
 * @param region - AWS region override.
 * @returns The monitoring result with message count and alert status.
 */
export async function dlqMonitorAndAlert(
  queueUrl: string,
  topicArn: string,
  threshold?: number,
  region?: string,
): Promise<DLQMonitorResult> {
  const maxMessages = threshold ?? 10;

  let messageCount: number;
  try {
    const resp = await sqs(region).send(
      new GetQueueAttributesCommand({
        QueueUrl: queueUrl,
        AttributeNames: ["ApproximateNumberOfMessages"],
      }),
    );
    messageCount = parseInt(
      resp.Attributes?.ApproximateNumberOfMessages ?? "0",
      10,
    );
  } catch (err) {
    throw wrapAwsError(
      err,
      `Failed to get queue attributes for ${queueUrl}`,
    );
  }

  let alerted = false;
  if (messageCount >= maxMessages) {
    try {
      await sns(region).send(
        new PublishCommand({
          TopicArn: topicArn,
          Subject: `DLQ Alert: ${queueUrl}`,
          Message: JSON.stringify({
            queueUrl,
            messageCount,
            threshold: maxMessages,
            timestamp: new Date().toISOString(),
          }),
        }),
      );
      alerted = true;
    } catch (err) {
      throw wrapAwsError(
        err,
        `Failed to publish DLQ alert to ${topicArn}`,
      );
    }
  }

  return DLQMonitorResultSchema.parse({
    queueUrl,
    messageCount,
    alerted,
  });
}

/**
 * Handle poison-pill messages by quarantining them to S3 and/or DynamoDB.
 *
 * Iterates over SQS records, checks the approximate receive count, and
 * quarantines messages that have exceeded the maximum receive count by
 * storing them in S3 and/or recording them in a DynamoDB table.
 *
 * @param records - Array of SQS message records with `messageId`, `body`, and optional `attributes`.
 * @param maxReceiveCount - Maximum receive count before quarantine (default 3).
 * @param quarantineBucket - S3 bucket for quarantined messages.
 * @param quarantineTable - DynamoDB table for quarantine metadata.
 * @param quarantinePrefix - S3 key prefix for quarantined messages (default `"poison-pills/"`).
 * @param region - AWS region override.
 * @returns The processing result with counts of processed and quarantined messages.
 */
export async function poisonPillHandler(
  records: Record<string, unknown>[],
  maxReceiveCount?: number,
  quarantineBucket?: string,
  quarantineTable?: string,
  quarantinePrefix?: string,
  region?: string,
): Promise<PoisonPillResult> {
  const maxCount = maxReceiveCount ?? 3;
  const prefix = quarantinePrefix ?? "poison-pills/";
  let quarantined = 0;

  for (const record of records) {
    const attributes =
      (record.attributes as Record<string, string>) ?? {};
    const receiveCount = parseInt(
      attributes.ApproximateReceiveCount ?? "1",
      10,
    );

    if (receiveCount >= maxCount) {
      const messageId =
        (record.messageId as string) ?? `unknown-${Date.now()}`;
      const body = (record.body as string) ?? JSON.stringify(record);

      // Quarantine to S3
      if (quarantineBucket) {
        try {
          await s3(region).send(
            new PutObjectCommand({
              Bucket: quarantineBucket,
              Key: `${prefix}${messageId}.json`,
              Body: JSON.stringify({
                messageId,
                body,
                attributes,
                quarantinedAt: new Date().toISOString(),
              }),
              ContentType: "application/json",
            }),
          );
        } catch (err) {
          throw wrapAwsError(
            err,
            `Failed to quarantine message ${messageId} to S3`,
          );
        }
      }

      // Record in DynamoDB
      if (quarantineTable) {
        try {
          await docClient(region).send(
            new PutCommand({
              TableName: quarantineTable,
              Item: {
                messageId,
                body,
                receiveCount,
                quarantinedAt: new Date().toISOString(),
              },
            }),
          );
        } catch (err) {
          throw wrapAwsError(
            err,
            `Failed to record quarantined message ${messageId} in DynamoDB`,
          );
        }
      }

      quarantined++;
    }
  }

  return PoisonPillResultSchema.parse({
    processed: records.length,
    quarantined,
  });
}

/**
 * Configure Lambda destination routing for async invocations.
 *
 * Sets the on-success and/or on-failure destinations for a Lambda
 * function's asynchronous invocation configuration using
 * `PutFunctionEventInvokeConfigCommand`.
 *
 * @param functionName - The Lambda function name or ARN.
 * @param onSuccessArn - ARN of the on-success destination (SNS, SQS, Lambda, or EventBridge).
 * @param onFailureArn - ARN of the on-failure destination.
 * @param qualifier - Lambda function version or alias (default `"$LATEST"`).
 * @param region - AWS region override.
 * @returns The destination configuration result.
 */
export async function lambdaDestinationRouter(
  functionName: string,
  onSuccessArn?: string,
  onFailureArn?: string,
  qualifier?: string,
  region?: string,
): Promise<LambdaDestinationConfig> {
  try {
    await lambda(region).send(
      new PutFunctionEventInvokeConfigCommand({
        FunctionName: functionName,
        Qualifier: qualifier ?? "$LATEST",
        DestinationConfig: {
          OnSuccess: onSuccessArn
            ? { Destination: onSuccessArn }
            : undefined,
          OnFailure: onFailureArn
            ? { Destination: onFailureArn }
            : undefined,
        },
      }),
    );
  } catch (err) {
    throw wrapAwsError(
      err,
      `Failed to configure destinations for ${functionName}`,
    );
  }

  return LambdaDestinationConfigSchema.parse({
    functionName,
    onSuccessArn,
    onFailureArn,
  });
}

/**
 * Execute a function with graceful degradation via DynamoDB caching.
 *
 * Attempts to execute the primary function. On success, the result is
 * cached in DynamoDB. On failure, the function falls back to the cached
 * result if one exists.
 *
 * @param fn - The primary async function to execute.
 * @param cacheTable - DynamoDB table name for the result cache.
 * @param cacheKey - Cache key for this operation.
 * @param region - AWS region override.
 * @returns The degradation result indicating whether the response came from cache.
 */
export async function gracefulDegradation(
  fn: () => Promise<unknown>,
  cacheTable: string,
  cacheKey: string,
  region?: string,
): Promise<GracefulDegradationResult> {
  const ddb = docClient(region);

  try {
    const result = await fn();

    // Cache the successful result
    try {
      await ddb.send(
        new PutCommand({
          TableName: cacheTable,
          Item: {
            cacheKey,
            result: JSON.stringify(result),
            cachedAt: new Date().toISOString(),
          },
        }),
      );
    } catch {
      // Caching failure is non-fatal; the primary operation succeeded
    }

    return GracefulDegradationResultSchema.parse({
      fromCache: false,
      result,
    });
  } catch (primaryErr) {
    const errorMsg =
      primaryErr instanceof Error
        ? primaryErr.message
        : String(primaryErr);

    // Attempt to read cached result
    try {
      const cached = await ddb.send(
        new GetCommand({
          TableName: cacheTable,
          Key: { cacheKey },
        }),
      );

      if (cached.Item?.result) {
        const parsed = JSON.parse(cached.Item.result as string);
        return GracefulDegradationResultSchema.parse({
          fromCache: true,
          result: parsed,
          error: errorMsg,
        });
      }
    } catch {
      // Cache read failed — fall through to error
    }

    return GracefulDegradationResultSchema.parse({
      fromCache: false,
      result: null,
      error: errorMsg,
    });
  }
}

/**
 * Execute a function with a timeout sentinel using AbortController.
 *
 * Races the provided function against a timeout. If the function does
 * not complete within the specified timeout, the result indicates a
 * timeout occurred.
 *
 * @param fn - The async function to execute with a timeout guard.
 * @param timeoutSeconds - Timeout in seconds (default 30).
 * @returns The sentinel result indicating completion or timeout.
 */
// ---------------------------------------------------------------------------
// Extended resilience schemas
// ---------------------------------------------------------------------------

/** Schema for a distributed lock manager result. */
export const DistributedLockResultSchema = z.object({
  lockKey: z.string(),
  lockId: z.string(),
  acquired: z.boolean(),
  ttlSeconds: z.number(),
  expiresAt: z.string(),
});
/** Distributed lock manager result. */
export type DistributedLockResult = z.infer<typeof DistributedLockResultSchema>;

// ---------------------------------------------------------------------------
// Extended resilience functions
// ---------------------------------------------------------------------------

/** Acquire or release a distributed lock backed by DynamoDB with TTL. */
export async function distributedLockManager(
  tableName: string,
  lockKey: string,
  action: "acquire" | "release",
  ttlSeconds?: number,
  lockId?: string,
  region?: string,
): Promise<DistributedLockResult> {
  const ddb = docClient(region);
  try {
    // TODO: implement distributedLockManager
    throw new Error("distributedLockManager not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "distributedLockManager failed");
  }
}

export async function timeoutSentinel(
  fn: () => Promise<unknown>,
  timeoutSeconds?: number,
): Promise<TimeoutSentinelResult> {
  const timeout = (timeoutSeconds ?? 30) * 1000;

  const timeoutPromise = new Promise<"TIMEOUT">((resolve) => {
    const timer = setTimeout(() => resolve("TIMEOUT"), timeout);
    // Prevent the timer from keeping the process alive
    if (typeof timer === "object" && "unref" in timer) {
      (timer as NodeJS.Timeout).unref();
    }
  });

  try {
    const raceResult = await Promise.race([
      fn().then((result) => ({ type: "result" as const, result })),
      timeoutPromise,
    ]);

    if (raceResult === "TIMEOUT") {
      return TimeoutSentinelResultSchema.parse({
        completed: false,
        timedOut: true,
      });
    }

    return TimeoutSentinelResultSchema.parse({
      completed: true,
      result: raceResult.result,
      timedOut: false,
    });
  } catch {
    return TimeoutSentinelResultSchema.parse({
      completed: false,
      timedOut: false,
    });
  }
}
