/**
 * aws-util/lambda-middleware — Lambda event parsing, middleware, and request/response helpers.
 *
 * Multi-service module combining Lambda + DynamoDB + SQS + CloudWatch + SSM
 * to provide idempotency, batch processing, middleware chaining, timeout guards,
 * cold-start tracking, CORS helpers, event parsing, and feature flags.
 *
 * All async functions obtain clients via {@link getClient} and wrap errors
 * through {@link wrapAwsError}.
 *
 * @example
 * ```ts
 * import {
 *   idempotentHandler,
 *   batchProcessor,
 *   lambdaResponse,
 *   parseEvent,
 *   evaluateFeatureFlag,
 * } from "./lambda-middleware.js";
 *
 * const handler = idempotentHandler("idempotency-table")(async (event) => {
 *   return { statusCode: 200, body: "ok" };
 * });
 *
 * const result = await batchProcessor(
 *   async (record) => JSON.parse(record.body as string),
 *   records,
 * );
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
  SendMessageBatchCommand,
} from "@aws-sdk/client-sqs";
import {
  CloudWatchClient,
  PutMetricDataCommand,
} from "@aws-sdk/client-cloudwatch";
import {
  SSMClient,
  GetParameterCommand,
} from "@aws-sdk/client-ssm";
import { getClient } from "./client.js";
import { wrapAwsError, AwsServiceError } from "./exceptions.js";

// ---------------------------------------------------------------------------
// Zod schemas & inferred types — Lambda event types
// ---------------------------------------------------------------------------

/** Schema for an API Gateway proxy event. */
export const APIGatewayEventSchema = z.object({
  httpMethod: z.string(),
  path: z.string(),
  headers: z.record(z.string()).nullable().default({}),
  queryStringParameters: z.record(z.string()).nullable().default({}),
  pathParameters: z.record(z.string()).nullable().default({}),
  body: z.string().nullable().default(null),
  isBase64Encoded: z.boolean().default(false),
  requestContext: z.record(z.unknown()).default({}),
});

/** An API Gateway proxy event. */
export type APIGatewayEvent = z.infer<typeof APIGatewayEventSchema>;

/** Schema for a single SQS record. */
export const SQSRecordSchema = z.object({
  messageId: z.string(),
  receiptHandle: z.string(),
  body: z.string(),
  attributes: z.record(z.string()).default({}),
  messageAttributes: z.record(z.unknown()).default({}),
});

/** A single SQS record. */
export type SQSRecord = z.infer<typeof SQSRecordSchema>;

/** Schema for an SQS event containing multiple records. */
export const SQSEventSchema = z.object({
  Records: z.array(SQSRecordSchema),
});

/** An SQS event. */
export type SQSEvent = z.infer<typeof SQSEventSchema>;

/** Schema for the SNS message detail within a record. */
export const SNSMessageDetailSchema = z.object({
  Type: z.string(),
  MessageId: z.string(),
  TopicArn: z.string(),
  Subject: z.string().nullable().default(null),
  Message: z.string(),
  Timestamp: z.string(),
});

/** SNS message detail. */
export type SNSMessageDetail = z.infer<typeof SNSMessageDetailSchema>;

/** Schema for a single SNS record. */
export const SNSRecordSchema = z.object({
  EventSource: z.string(),
  Sns: SNSMessageDetailSchema,
});

/** A single SNS record. */
export type SNSRecord = z.infer<typeof SNSRecordSchema>;

/** Schema for an SNS event containing multiple records. */
export const SNSEventSchema = z.object({
  Records: z.array(SNSRecordSchema),
});

/** An SNS event. */
export type SNSEvent = z.infer<typeof SNSEventSchema>;

/** Schema for a single S3 event record. */
export const S3EventRecordSchema = z.object({
  eventSource: z.string(),
  eventName: z.string(),
  s3: z.object({
    bucket: z.object({ name: z.string() }),
    object: z.object({
      key: z.string(),
      size: z.number().optional(),
    }),
  }),
});

/** A single S3 event record. */
export type S3EventRecord = z.infer<typeof S3EventRecordSchema>;

/** Schema for an S3 event containing multiple records. */
export const S3EventSchema = z.object({
  Records: z.array(S3EventRecordSchema),
});

/** An S3 event. */
export type S3Event = z.infer<typeof S3EventSchema>;

/** Schema for an EventBridge event. */
export const EventBridgeEventSchema = z.object({
  version: z.string().default("0"),
  id: z.string(),
  source: z.string(),
  "detail-type": z.string(),
  detail: z.record(z.unknown()).default({}),
  time: z.string().optional(),
  region: z.string().optional(),
  account: z.string().optional(),
});

/** An EventBridge event. */
export type EventBridgeEvent = z.infer<typeof EventBridgeEventSchema>;

/** Schema for a single DynamoDB stream record. */
export const DynamoDBStreamRecordSchema = z.object({
  eventID: z.string(),
  eventName: z.string(),
  dynamodb: z
    .object({
      Keys: z.record(z.unknown()).optional(),
      NewImage: z.record(z.unknown()).optional(),
      OldImage: z.record(z.unknown()).optional(),
    })
    .default({}),
});

/** A single DynamoDB stream record. */
export type DynamoDBStreamRecord = z.infer<
  typeof DynamoDBStreamRecordSchema
>;

/** Schema for a DynamoDB stream event containing multiple records. */
export const DynamoDBStreamEventSchema = z.object({
  Records: z.array(DynamoDBStreamRecordSchema),
});

/** A DynamoDB stream event. */
export type DynamoDBStreamEvent = z.infer<
  typeof DynamoDBStreamEventSchema
>;

/** Schema for a single Kinesis record. */
export const KinesisRecordSchema = z.object({
  kinesis: z.object({
    data: z.string(),
    sequenceNumber: z.string(),
    partitionKey: z.string(),
  }),
  eventID: z.string(),
});

/** A single Kinesis record. */
export type KinesisRecord = z.infer<typeof KinesisRecordSchema>;

/** Schema for a Kinesis event containing multiple records. */
export const KinesisEventSchema = z.object({
  Records: z.array(KinesisRecordSchema),
});

/** A Kinesis event. */
export type KinesisEvent = z.infer<typeof KinesisEventSchema>;

// ---------------------------------------------------------------------------
// Zod schemas & inferred types — utility result types
// ---------------------------------------------------------------------------

/** Schema for an idempotency record stored in DynamoDB. */
export const IdempotencyRecordSchema = z.object({
  id: z.string(),
  result: z.unknown(),
  expiresAt: z.number(),
});

/** An idempotency record. */
export type IdempotencyRecord = z.infer<typeof IdempotencyRecordSchema>;

/** Schema for the result of batch processing. */
export const BatchProcessingResultSchema = z.object({
  successful: z.number(),
  failed: z.number(),
  errors: z.array(
    z.object({
      index: z.number(),
      error: z.string(),
    }),
  ),
});

/** Batch processing result. */
export type BatchProcessingResult = z.infer<
  typeof BatchProcessingResultSchema
>;

/** Schema for an API Gateway response. */
export const APIGatewayResponseSchema = z.object({
  statusCode: z.number(),
  headers: z.record(z.string()).default({}),
  body: z.string(),
  isBase64Encoded: z.boolean().default(false),
});

/** An API Gateway response. */
export type APIGatewayResponse = z.infer<
  typeof APIGatewayResponseSchema
>;

/** Schema for a feature flag evaluation result. */
export const FeatureFlagResultSchema = z.object({
  flagName: z.string(),
  enabled: z.boolean(),
  value: z.string().optional(),
});

/** A feature flag evaluation result. */
export type FeatureFlagResult = z.infer<typeof FeatureFlagResultSchema>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Get a cached DynamoDB DocumentClient for the given region.
 */
function ddb(region?: string): DynamoDBDocumentClient {
  return DynamoDBDocumentClient.from(
    getClient(DynamoDBClient, region),
  );
}

/**
 * Get a cached SQS client for the given region.
 */
function sqs(region?: string): SQSClient {
  return getClient(SQSClient, region);
}

/**
 * Get a cached CloudWatch client for the given region.
 */
function cw(region?: string): CloudWatchClient {
  return getClient(CloudWatchClient, region);
}

/**
 * Get a cached SSM client for the given region.
 */
function ssm(region?: string): SSMClient {
  return getClient(SSMClient, region);
}

/**
 * Compute a simple deterministic hash of a JSON-serializable value.
 *
 * Uses a basic DJB2a hash for speed in Lambda environments.
 *
 * @param data - The data to hash.
 * @returns A hex string representing the hash.
 */
function simpleHash(data: unknown): string {
  const str = JSON.stringify(data);
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
  }
  // Convert to unsigned 32-bit and hex
  return (hash >>> 0).toString(16);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Return a decorator function that adds DynamoDB-backed idempotency to a Lambda handler.
 *
 * The decorator hashes the incoming event and checks DynamoDB for a cached result.
 * If found and not expired, it returns the cached result. Otherwise, it invokes
 * the handler and stores the result with a TTL.
 *
 * @param tableName - The DynamoDB table name for idempotency records.
 * @param ttlSeconds - TTL in seconds for cached results (default 3600).
 * @param region - AWS region override.
 * @returns A wrapper function that accepts a handler and returns an idempotent handler.
 */
export function idempotentHandler(
  tableName: string,
  ttlSeconds?: number,
  region?: string,
): (
  handler: (event: Record<string, unknown>) => Promise<unknown>,
) => (event: Record<string, unknown>) => Promise<unknown> {
  const ttl = ttlSeconds ?? 3600;

  return (
    handler: (event: Record<string, unknown>) => Promise<unknown>,
  ) => {
    return async (event: Record<string, unknown>): Promise<unknown> => {
      const eventHash = simpleHash(event);
      const client = ddb(region);

      try {
        // Check for existing idempotency record
        const existing = await client.send(
          new GetCommand({
            TableName: tableName,
            Key: { id: eventHash },
          }),
        );

        if (existing.Item) {
          const record = IdempotencyRecordSchema.parse(existing.Item);
          const now = Math.floor(Date.now() / 1000);
          if (record.expiresAt > now) {
            return record.result;
          }
        }
      } catch (err: unknown) {
        throw wrapAwsError(err, "idempotentHandler: lookup failed");
      }

      // Execute the handler
      const result = await handler(event);

      try {
        // Store the result
        const expiresAt = Math.floor(Date.now() / 1000) + ttl;
        await client.send(
          new PutCommand({
            TableName: tableName,
            Item: { id: eventHash, result, expiresAt },
          }),
        );
      } catch (err: unknown) {
        throw wrapAwsError(err, "idempotentHandler: store failed");
      }

      return result;
    };
  };
}

/**
 * Process an array of records with a handler, collecting successes and failures.
 *
 * Each record is processed independently. Failed records do not abort the batch.
 *
 * @param handler - Async function to process a single record.
 * @param records - Array of records to process.
 * @returns A summary of successful and failed processing attempts.
 */
export async function batchProcessor(
  handler: (record: Record<string, unknown>) => Promise<unknown>,
  records: Record<string, unknown>[],
): Promise<BatchProcessingResult> {
  let successful = 0;
  let failed = 0;
  const errors: Array<{ index: number; error: string }> = [];

  for (let i = 0; i < records.length; i++) {
    try {
      await handler(records[i]);
      successful++;
    } catch (err: unknown) {
      failed++;
      const message =
        err instanceof Error ? err.message : String(err);
      errors.push({ index: i, error: message });
    }
  }

  return BatchProcessingResultSchema.parse({
    successful,
    failed,
    errors,
  });
}

/**
 * Compose an array of middleware functions around a handler.
 *
 * Middlewares are applied in order so that the first middleware in the array
 * is the outermost wrapper. Each middleware receives `(event, next)` where
 * `next` is the rest of the chain.
 *
 * @param handler - The innermost handler function.
 * @param middlewares - Array of middleware functions `(event, next) => result`.
 * @returns A composed handler function.
 */
export function middlewareChain(
  handler: (event: Record<string, unknown>) => Promise<unknown>,
  middlewares: Array<
    (
      event: Record<string, unknown>,
      next: (event: Record<string, unknown>) => Promise<unknown>,
    ) => Promise<unknown>
  >,
): (event: Record<string, unknown>) => Promise<unknown> {
  let composed = handler;

  // Apply middlewares in reverse so the first middleware is outermost
  for (let i = middlewares.length - 1; i >= 0; i--) {
    const mw = middlewares[i];
    const next = composed;
    composed = (event: Record<string, unknown>) => mw(event, next);
  }

  return composed;
}

/**
 * Process items with a Lambda timeout guard, requeueing unprocessed items to SQS.
 *
 * Iterates through items, checking the remaining Lambda execution time before
 * each item. When the remaining time drops below the buffer, unprocessed items
 * are sent to the specified SQS queue.
 *
 * @param handler - Async function to process a single item.
 * @param items - Array of items to process.
 * @param context - Lambda context object with `getRemainingTimeInMillis()`.
 * @param queueUrl - SQS queue URL for requeueing unprocessed items.
 * @param bufferMs - Time buffer in milliseconds before timeout (default 5000).
 * @param region - AWS region override.
 * @returns Count of processed and requeued items.
 */
export async function lambdaTimeoutGuard(
  handler: (item: Record<string, unknown>) => Promise<unknown>,
  items: Record<string, unknown>[],
  context: { getRemainingTimeInMillis: () => number },
  queueUrl: string,
  bufferMs?: number,
  region?: string,
): Promise<{ processed: number; requeued: number }> {
  const buffer = bufferMs ?? 5000;
  let processed = 0;
  const toRequeue: Record<string, unknown>[] = [];

  for (let i = 0; i < items.length; i++) {
    if (context.getRemainingTimeInMillis() <= buffer) {
      // Not enough time — requeue remaining items
      toRequeue.push(...items.slice(i));
      break;
    }

    try {
      await handler(items[i]);
      processed++;
    } catch (err: unknown) {
      // Still count as attempted; requeue the failed item
      toRequeue.push(items[i]);
    }
  }

  // Send requeued items to SQS in batches of 10
  if (toRequeue.length > 0) {
    const client = sqs(region);
    for (let i = 0; i < toRequeue.length; i += 10) {
      const batch = toRequeue.slice(i, i + 10);
      try {
        await client.send(
          new SendMessageBatchCommand({
            QueueUrl: queueUrl,
            Entries: batch.map((item, idx) => ({
              Id: `requeue-${i + idx}`,
              MessageBody: JSON.stringify(item),
            })),
          }),
        );
      } catch (err: unknown) {
        throw wrapAwsError(
          err,
          "lambdaTimeoutGuard: requeue failed",
        );
      }
    }
  }

  return { processed, requeued: toRequeue.length };
}

/**
 * Return a decorator that emits a CloudWatch metric on Lambda cold start.
 *
 * The decorator tracks cold start state via a closure. The metric is emitted
 * only on the first invocation of the decorated handler.
 *
 * @param functionName - The Lambda function name for the metric dimension.
 * @param namespace - CloudWatch metric namespace (default `"Lambda/ColdStart"`).
 * @param region - AWS region override.
 * @returns A wrapper function that accepts a handler and returns a cold-start-tracked handler.
 */
export function coldStartTracker(
  functionName: string,
  namespace?: string,
  region?: string,
): (
  handler: (event: Record<string, unknown>) => Promise<unknown>,
) => (event: Record<string, unknown>) => Promise<unknown> {
  const ns = namespace ?? "Lambda/ColdStart";
  let isColdStart = true;

  return (
    handler: (event: Record<string, unknown>) => Promise<unknown>,
  ) => {
    return async (event: Record<string, unknown>): Promise<unknown> => {
      if (isColdStart) {
        isColdStart = false;
        try {
          await cw(region).send(
            new PutMetricDataCommand({
              Namespace: ns,
              MetricData: [
                {
                  MetricName: "ColdStart",
                  Dimensions: [
                    {
                      Name: "FunctionName",
                      Value: functionName,
                    },
                  ],
                  Value: 1,
                  Unit: "Count",
                },
              ],
            }),
          );
        } catch (err: unknown) {
          // Log but don't fail the handler for a metric emission failure
          throw wrapAwsError(
            err,
            "coldStartTracker: metric emission failed",
          );
        }
      }

      return handler(event);
    };
  };
}

/**
 * Build an API Gateway proxy response object.
 *
 * This is a synchronous helper that constructs a properly formatted response
 * with optional CORS headers.
 *
 * @param statusCode - HTTP status code (default 200).
 * @param body - Response body (objects are JSON-serialized).
 * @param headers - Additional response headers.
 * @param cors - Whether to include CORS headers (default `false`).
 * @param allowedOrigins - CORS allowed origins (default `"*"`).
 * @returns A formatted API Gateway response object.
 */
export function lambdaResponse(
  statusCode?: number,
  body?: unknown,
  headers?: Record<string, string>,
  cors?: boolean,
  allowedOrigins?: string,
): APIGatewayResponse {
  const effectiveHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(headers ?? {}),
  };

  if (cors) {
    effectiveHeaders["Access-Control-Allow-Origin"] =
      allowedOrigins ?? "*";
    effectiveHeaders["Access-Control-Allow-Credentials"] = "true";
  }

  const bodyStr =
    body === undefined || body === null
      ? ""
      : typeof body === "string"
        ? body
        : JSON.stringify(body);

  return APIGatewayResponseSchema.parse({
    statusCode: statusCode ?? 200,
    headers: effectiveHeaders,
    body: bodyStr,
    isBase64Encoded: false,
  });
}

/**
 * Build an API Gateway CORS preflight (OPTIONS) response.
 *
 * This is a synchronous helper for returning a properly formatted
 * CORS preflight response.
 *
 * @param allowedOrigins - Allowed origins header value (default `"*"`).
 * @param allowedMethods - Allowed methods header value (default `"GET,POST,PUT,DELETE,OPTIONS"`).
 * @param allowedHeaders - Allowed headers header value (default `"Content-Type,Authorization"`).
 * @param maxAge - Access-Control-Max-Age in seconds (default 86400).
 * @returns A formatted API Gateway CORS preflight response.
 */
export function corsPreflight(
  allowedOrigins?: string,
  allowedMethods?: string,
  allowedHeaders?: string,
  maxAge?: number,
): APIGatewayResponse {
  return APIGatewayResponseSchema.parse({
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": allowedOrigins ?? "*",
      "Access-Control-Allow-Methods":
        allowedMethods ?? "GET,POST,PUT,DELETE,OPTIONS",
      "Access-Control-Allow-Headers":
        allowedHeaders ?? "Content-Type,Authorization",
      "Access-Control-Max-Age": String(maxAge ?? 86400),
    },
    body: "",
    isBase64Encoded: false,
  });
}

/**
 * Parse a raw Lambda event into a typed schema based on the event source.
 *
 * Delegates to the appropriate Zod schema for validation and type coercion.
 *
 * @param event - The raw Lambda event object.
 * @param source - The event source type.
 * @returns The parsed and validated event.
 * @throws {AwsServiceError} If the event does not match the expected schema.
 */
export function parseEvent(
  event: Record<string, unknown>,
  source:
    | "api_gateway"
    | "sqs"
    | "sns"
    | "s3"
    | "eventbridge"
    | "dynamodb_stream"
    | "kinesis",
): unknown {
  const schemas: Record<string, z.ZodSchema> = {
    api_gateway: APIGatewayEventSchema,
    sqs: SQSEventSchema,
    sns: SNSEventSchema,
    s3: S3EventSchema,
    eventbridge: EventBridgeEventSchema,
    dynamodb_stream: DynamoDBStreamEventSchema,
    kinesis: KinesisEventSchema,
  };

  const schema = schemas[source];
  if (!schema) {
    throw new AwsServiceError(
      `parseEvent: unknown source "${source}"`,
    );
  }

  const result = schema.safeParse(event);
  if (!result.success) {
    throw new AwsServiceError(
      `parseEvent(${source}): validation failed — ${result.error.message}`,
    );
  }

  return result.data;
}

/**
 * Evaluate a single feature flag stored as an SSM parameter.
 *
 * The parameter is expected at `{ssmPrefix}/{flagName}`. The value is
 * interpreted as: `"true"` or `"1"` means enabled; anything else means
 * disabled. Any other non-boolean value is also returned as-is in the
 * `value` field for richer flag payloads.
 *
 * @param flagName - The feature flag name.
 * @param ssmPrefix - The SSM parameter path prefix (default `/feature-flags`).
 * @param region - AWS region override.
 * @returns The feature flag evaluation result.
 */
export async function evaluateFeatureFlag(
  flagName: string,
  ssmPrefix?: string,
  region?: string,
): Promise<FeatureFlagResult> {
  const prefix = ssmPrefix ?? "/feature-flags";
  const paramName = `${prefix}/${flagName}`;

  try {
    const resp = await ssm(region).send(
      new GetParameterCommand({ Name: paramName }),
    );

    const rawValue = resp.Parameter?.Value ?? "";
    const enabled =
      rawValue.toLowerCase() === "true" || rawValue === "1";

    return FeatureFlagResultSchema.parse({
      flagName,
      enabled,
      value: rawValue || undefined,
    });
  } catch (err: unknown) {
    // If the parameter doesn't exist, treat as disabled
    if (
      err != null &&
      typeof err === "object" &&
      "name" in err &&
      (err as Record<string, unknown>)["name"] ===
        "ParameterNotFound"
    ) {
      return FeatureFlagResultSchema.parse({
        flagName,
        enabled: false,
        value: undefined,
      });
    }
    throw wrapAwsError(
      err,
      `evaluateFeatureFlag(${flagName})`,
    );
  }
}

/**
 * Evaluate multiple feature flags stored as SSM parameters.
 *
 * Fetches each flag concurrently via {@link evaluateFeatureFlag}.
 *
 * @param flagNames - Array of feature flag names to evaluate.
 * @param ssmPrefix - The SSM parameter path prefix (default `/feature-flags`).
 * @param region - AWS region override.
 * @returns A map of flag names to their evaluation results.
 */
export async function evaluateFeatureFlags(
  flagNames: string[],
  ssmPrefix?: string,
  region?: string,
): Promise<Record<string, FeatureFlagResult>> {
  const results = await Promise.all(
    flagNames.map((name) =>
      evaluateFeatureFlag(name, ssmPrefix, region),
    ),
  );

  const resultMap: Record<string, FeatureFlagResult> = {};
  for (const result of results) {
    resultMap[result.flagName] = result;
  }

  return resultMap;
}
