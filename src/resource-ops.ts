/**
 * aws-util/resource-ops — Multi-service resource operations.
 *
 * Provides typed helpers for cross-service operational tasks: DLQ
 * reprocessing, DynamoDB backups to S3, SSM-to-Lambda env sync, stale
 * ECR image cleanup, Athena partition repair, S3 inventory to DynamoDB,
 * cross-account S3 copy, secret rotation with notification, Lambda
 * invocation with secrets, and S3 key publishing to SQS.
 *
 * All functions obtain clients via {@link getClient} and wrap errors
 * through {@link wrapAwsError}.
 *
 * @example
 * ```ts
 * import { reprocessSqsDlq, backupDynamodbToS3, syncSsmParamsToLambdaEnv } from "./resource-ops.js";
 *
 * await reprocessSqsDlq(dlqUrl, mainQueueUrl);
 * await backupDynamodbToS3("my-table", "backup-bucket");
 * await syncSsmParamsToLambdaEnv("/app/prod/", "my-function");
 * ```
 *
 * @module
 */

import { z } from "zod";
import {
  SQSClient,
  ReceiveMessageCommand,
  SendMessageCommand,
  DeleteMessageCommand,
  SendMessageBatchCommand,
} from "@aws-sdk/client-sqs";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  BatchWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import {
  S3Client,
  PutObjectCommand,
  CopyObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import {
  SSMClient,
  GetParametersByPathCommand,
} from "@aws-sdk/client-ssm";
import {
  LambdaClient,
  UpdateFunctionConfigurationCommand,
  GetFunctionConfigurationCommand,
  InvokeCommand,
} from "@aws-sdk/client-lambda";
import {
  ECRClient,
  DescribeImagesCommand,
  BatchDeleteImageCommand,
} from "@aws-sdk/client-ecr";
import {
  SNSClient,
  PublishCommand,
} from "@aws-sdk/client-sns";
import {
  AthenaClient,
  StartQueryExecutionCommand,
  GetQueryExecutionCommand,
} from "@aws-sdk/client-athena";
import {
  STSClient,
  AssumeRoleCommand,
} from "@aws-sdk/client-sts";
import {
  SecretsManagerClient,
  GetSecretValueCommand,
  RotateSecretCommand,
} from "@aws-sdk/client-secrets-manager";
import { getClient } from "./client.js";
import {
  wrapAwsError,
  AwsServiceError,
  AwsTimeoutError,
} from "./exceptions.js";

// ---------------------------------------------------------------------------
// Zod schemas & inferred types
// ---------------------------------------------------------------------------

/** Schema for the result of a DLQ reprocess operation. */
export const DLQReprocessResultSchema = z.object({
  processed: z.number(),
  failed: z.number(),
});

/** Result of {@link reprocessSqsDlq}. */
export type DLQReprocessResult = z.infer<typeof DLQReprocessResultSchema>;

/** Schema for the result of a secret rotation with notification. */
export const RotationResultSchema = z.object({
  secretArn: z.string(),
  notified: z.boolean(),
});

/** Result of {@link rotateSecretAndNotify}. */
export type RotationResult = z.infer<typeof RotationResultSchema>;

/** Schema for the result of an S3 inventory to DynamoDB operation. */
export const S3InventoryResultSchema = z.object({
  itemsWritten: z.number(),
  bucket: z.string(),
});

/** Result of {@link s3InventoryToDynamodb}. */
export type S3InventoryResult = z.infer<typeof S3InventoryResultSchema>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sqsClient(region?: string): SQSClient {
  return getClient(SQSClient, region);
}

function ddbDoc(region?: string): DynamoDBDocumentClient {
  return DynamoDBDocumentClient.from(getClient(DynamoDBClient, region));
}

function s3Client(region?: string): S3Client {
  return getClient(S3Client, region);
}

function ssmClient(region?: string): SSMClient {
  return getClient(SSMClient, region);
}

function lambdaClient(region?: string): LambdaClient {
  return getClient(LambdaClient, region);
}

function ecrClient(region?: string): ECRClient {
  return getClient(ECRClient, region);
}

function snsClient(region?: string): SNSClient {
  return getClient(SNSClient, region);
}

function athenaClient(region?: string): AthenaClient {
  return getClient(AthenaClient, region);
}

function stsClient(region?: string): STSClient {
  return getClient(STSClient, region);
}

function smClient(region?: string): SecretsManagerClient {
  return getClient(SecretsManagerClient, region);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Collect a readable stream body into a string.
 */
async function streamToString(body: unknown): Promise<string> {
  if (typeof body === "string") {
    return body;
  }
  if (body instanceof Uint8Array) {
    return new TextDecoder().decode(body);
  }
  const chunks: Uint8Array[] = [];
  for await (const chunk of body as AsyncIterable<Uint8Array>) {
    chunks.push(
      chunk instanceof Uint8Array
        ? chunk
        : new TextEncoder().encode(String(chunk)),
    );
  }
  const totalLength = chunks.reduce((sum, arr) => sum + arr.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const arr of chunks) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return new TextDecoder().decode(result);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Reprocess messages from an SQS dead-letter queue to a target queue.
 *
 * Receives messages from the DLQ in batches, forwards them to the target
 * queue, and deletes them from the DLQ on successful send.
 *
 * @param dlqUrl - The dead-letter queue URL.
 * @param targetUrl - The target queue URL to forward messages to.
 * @param maxMessages - Maximum messages to process (default 100).
 * @param region - AWS region override.
 * @returns The count of successfully processed and failed messages.
 */
export async function reprocessSqsDlq(
  dlqUrl: string,
  targetUrl: string,
  maxMessages?: number,
  region?: string,
): Promise<DLQReprocessResult> {
  const limit = maxMessages ?? 100;
  let processed = 0;
  let failed = 0;

  try {
    while (processed + failed < limit) {
      const batchSize = Math.min(10, limit - processed - failed);
      const receiveResp = await sqsClient(region).send(
        new ReceiveMessageCommand({
          QueueUrl: dlqUrl,
          MaxNumberOfMessages: batchSize,
          WaitTimeSeconds: 1,
        }),
      );

      const messages = receiveResp.Messages ?? [];
      if (messages.length === 0) {
        break;
      }

      for (const msg of messages) {
        try {
          await sqsClient(region).send(
            new SendMessageCommand({
              QueueUrl: targetUrl,
              MessageBody: msg.Body ?? "",
              MessageAttributes: msg.MessageAttributes as
                | Record<
                    string,
                    {
                      DataType: string;
                      StringValue?: string;
                      BinaryValue?: Uint8Array;
                    }
                  >
                | undefined,
            }),
          );

          await sqsClient(region).send(
            new DeleteMessageCommand({
              QueueUrl: dlqUrl,
              ReceiptHandle: msg.ReceiptHandle,
            }),
          );

          processed++;
        } catch {
          failed++;
        }
      }
    }
  } catch (err) {
    throw wrapAwsError(err, "Failed to reprocess DLQ messages");
  }

  return DLQReprocessResultSchema.parse({ processed, failed });
}

/**
 * Back up a DynamoDB table to S3 as a JSON file.
 *
 * Scans all items from the table and uploads them as a JSON array to S3.
 *
 * @param tableName - The DynamoDB table name to back up.
 * @param s3Bucket - The destination S3 bucket.
 * @param s3Key - The destination S3 key (defaults to `backups/{tableName}/{timestamp}.json`).
 * @param region - AWS region override.
 * @returns The number of items backed up and the S3 key used.
 */
export async function backupDynamodbToS3(
  tableName: string,
  s3Bucket: string,
  s3Key?: string,
  region?: string,
): Promise<{ itemCount: number; s3Key: string }> {
  const items: Record<string, unknown>[] = [];
  let lastEvaluatedKey: Record<string, unknown> | undefined;

  try {
    do {
      const resp = await ddbDoc(region).send(
        new ScanCommand({
          TableName: tableName,
          ExclusiveStartKey: lastEvaluatedKey,
        }),
      );
      items.push(...(resp.Items ?? []));
      lastEvaluatedKey = resp.LastEvaluatedKey;
    } while (lastEvaluatedKey);
  } catch (err) {
    throw wrapAwsError(
      err,
      `Failed to scan DynamoDB table ${tableName}`,
    );
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const key =
    s3Key ?? `backups/${tableName}/${timestamp}.json`;

  try {
    await s3Client(region).send(
      new PutObjectCommand({
        Bucket: s3Bucket,
        Key: key,
        Body: JSON.stringify(items, null, 2),
        ContentType: "application/json",
      }),
    );
  } catch (err) {
    throw wrapAwsError(
      err,
      `Failed to upload backup to s3://${s3Bucket}/${key}`,
    );
  }

  return { itemCount: items.length, s3Key: key };
}

/**
 * Sync SSM parameters to a Lambda function's environment variables.
 *
 * Reads all parameters under the given path and merges them into the
 * Lambda function's environment configuration. Parameter names are
 * converted to env var keys by taking the last path segment and
 * uppercasing it.
 *
 * @param paramPath - The SSM parameter path prefix.
 * @param functionName - The Lambda function name or ARN.
 * @param region - AWS region override.
 * @returns The number of parameters synced.
 */
export async function syncSsmParamsToLambdaEnv(
  paramPath: string,
  functionName: string,
  region?: string,
): Promise<{ synced: number }> {
  // Get SSM parameters
  const params: Record<string, string> = {};
  let nextToken: string | undefined;

  try {
    do {
      const resp = await ssmClient(region).send(
        new GetParametersByPathCommand({
          Path: paramPath,
          Recursive: true,
          WithDecryption: true,
          NextToken: nextToken,
        }),
      );
      for (const param of resp.Parameters ?? []) {
        if (param.Name && param.Value !== undefined) {
          // Convert /app/prod/db-host -> DB_HOST
          const parts = param.Name.split("/");
          const key = parts[parts.length - 1]
            .toUpperCase()
            .replace(/-/g, "_");
          params[key] = param.Value;
        }
      }
      nextToken = resp.NextToken;
    } while (nextToken);
  } catch (err) {
    throw wrapAwsError(
      err,
      `Failed to get SSM parameters under ${paramPath}`,
    );
  }

  // Get current Lambda environment
  try {
    const current = await lambdaClient(region).send(
      new GetFunctionConfigurationCommand({
        FunctionName: functionName,
      }),
    );
    const existing = current.Environment?.Variables ?? {};
    const merged = { ...existing, ...params };

    await lambdaClient(region).send(
      new UpdateFunctionConfigurationCommand({
        FunctionName: functionName,
        Environment: { Variables: merged },
      }),
    );
  } catch (err) {
    throw wrapAwsError(
      err,
      `Failed to update Lambda environment for ${functionName}`,
    );
  }

  return { synced: Object.keys(params).length };
}

/**
 * Delete stale (oldest) images from an ECR repository, keeping the N most recent.
 *
 * Images are sorted by push date; the newest `keepCount` images are retained
 * and all others are deleted.
 *
 * @param repositoryName - The ECR repository name.
 * @param keepCount - Number of most recent images to keep (default 10).
 * @param region - AWS region override.
 * @returns The number of images deleted.
 */
export async function deleteStaleEcrImages(
  repositoryName: string,
  keepCount?: number,
  region?: string,
): Promise<{ deleted: number }> {
  const keep = keepCount ?? 10;

  try {
    const resp = await ecrClient(region).send(
      new DescribeImagesCommand({
        repositoryName,
      }),
    );

    const images = resp.imageDetails ?? [];
    if (images.length <= keep) {
      return { deleted: 0 };
    }

    // Sort by push date descending (newest first)
    images.sort((a, b) => {
      const aTime = a.imagePushedAt?.getTime() ?? 0;
      const bTime = b.imagePushedAt?.getTime() ?? 0;
      return bTime - aTime;
    });

    // Images to delete are those beyond the keepCount
    const toDelete = images.slice(keep);
    const imageIds = toDelete
      .map((img) => ({
        imageDigest: img.imageDigest,
      }))
      .filter(
        (id): id is { imageDigest: string } =>
          id.imageDigest !== undefined,
      );

    if (imageIds.length === 0) {
      return { deleted: 0 };
    }

    // Batch delete in chunks of 100 (ECR limit)
    let deleted = 0;
    for (let i = 0; i < imageIds.length; i += 100) {
      const batch = imageIds.slice(i, i + 100);
      const deleteResp = await ecrClient(region).send(
        new BatchDeleteImageCommand({
          repositoryName,
          imageIds: batch,
        }),
      );
      deleted += deleteResp.imageIds?.length ?? 0;
    }

    return { deleted };
  } catch (err) {
    throw wrapAwsError(
      err,
      `Failed to delete stale ECR images from ${repositoryName}`,
    );
  }
}

/**
 * Rebuild Athena table partitions using `MSCK REPAIR TABLE`.
 *
 * @param database - The Athena/Glue database name.
 * @param tableName - The table name to repair partitions for.
 * @param region - AWS region override.
 */
export async function rebuildAthenaPartitions(
  database: string,
  tableName: string,
  region?: string,
): Promise<void> {
  const query = `MSCK REPAIR TABLE \`${database}\`.\`${tableName}\``;

  let queryExecutionId: string;
  try {
    const resp = await athenaClient(region).send(
      new StartQueryExecutionCommand({
        QueryString: query,
        QueryExecutionContext: { Database: database },
      }),
    );
    queryExecutionId = resp.QueryExecutionId ?? "";
  } catch (err) {
    throw wrapAwsError(
      err,
      `Failed to start MSCK REPAIR TABLE for ${database}.${tableName}`,
    );
  }

  // Wait for completion
  const deadline = Date.now() + 300_000;
  while (Date.now() < deadline) {
    try {
      const resp = await athenaClient(region).send(
        new GetQueryExecutionCommand({
          QueryExecutionId: queryExecutionId,
        }),
      );
      const state = resp.QueryExecution?.Status?.State ?? "UNKNOWN";

      if (state === "SUCCEEDED") {
        return;
      }
      if (state === "FAILED" || state === "CANCELLED") {
        throw new AwsServiceError(
          `MSCK REPAIR TABLE ${state}: ${resp.QueryExecution?.Status?.StateChangeReason ?? "unknown"}`,
        );
      }
    } catch (err) {
      if (err instanceof AwsServiceError) {
        throw err;
      }
      throw wrapAwsError(
        err,
        `Failed to poll MSCK REPAIR TABLE for ${database}.${tableName}`,
      );
    }

    await sleep(3_000);
  }

  throw new AwsTimeoutError(
    `MSCK REPAIR TABLE for ${database}.${tableName} did not complete within 5 minutes`,
  );
}

/**
 * List all S3 objects under a prefix and write an inventory to DynamoDB.
 *
 * Each inventory item includes the key, size, last modified date, and ETag.
 *
 * @param bucket - The S3 bucket to inventory.
 * @param prefix - The S3 key prefix to scan.
 * @param tableName - The DynamoDB table to write inventory items to.
 * @param region - AWS region override.
 * @returns The number of items written and the bucket name.
 */
export async function s3InventoryToDynamodb(
  bucket: string,
  prefix: string,
  tableName: string,
  region?: string,
): Promise<S3InventoryResult> {
  const items: Record<string, unknown>[] = [];
  let continuationToken: string | undefined;

  try {
    do {
      const resp = await s3Client(region).send(
        new ListObjectsV2Command({
          Bucket: bucket,
          Prefix: prefix,
          ContinuationToken: continuationToken,
        }),
      );

      for (const obj of resp.Contents ?? []) {
        items.push({
          bucket,
          key: obj.Key ?? "",
          size: obj.Size ?? 0,
          lastModified: obj.LastModified?.toISOString() ?? "",
          etag: obj.ETag ?? "",
        });
      }

      continuationToken = resp.NextContinuationToken;
    } while (continuationToken);
  } catch (err) {
    throw wrapAwsError(
      err,
      `Failed to list S3 objects in s3://${bucket}/${prefix}`,
    );
  }

  // Batch write to DynamoDB in chunks of 25
  try {
    for (let i = 0; i < items.length; i += 25) {
      const batch = items.slice(i, i + 25);
      const putRequests = batch.map((item) => ({
        PutRequest: { Item: item },
      }));

      await ddbDoc(region).send(
        new BatchWriteCommand({
          RequestItems: {
            [tableName]: putRequests,
          },
        }),
      );
    }
  } catch (err) {
    throw wrapAwsError(
      err,
      `Failed to write S3 inventory to DynamoDB table ${tableName}`,
    );
  }

  return S3InventoryResultSchema.parse({
    itemsWritten: items.length,
    bucket,
  });
}

/**
 * Copy an S3 object across accounts by assuming a cross-account role.
 *
 * Assumes the given IAM role to obtain temporary credentials, then uses
 * those credentials to copy the object between buckets.
 *
 * @param sourceBucket - The source S3 bucket.
 * @param sourceKey - The source S3 object key.
 * @param destBucket - The destination S3 bucket.
 * @param destKey - The destination S3 object key.
 * @param roleArn - The IAM role ARN to assume for cross-account access.
 * @param region - AWS region override.
 */
export async function crossAccountS3Copy(
  sourceBucket: string,
  sourceKey: string,
  destBucket: string,
  destKey: string,
  roleArn: string,
  region?: string,
): Promise<void> {
  // Assume cross-account role
  let credentials: {
    accessKeyId: string;
    secretAccessKey: string;
    sessionToken: string;
  };

  try {
    const assumeResp = await stsClient(region).send(
      new AssumeRoleCommand({
        RoleArn: roleArn,
        RoleSessionName: "aws-util-cross-account-copy",
        DurationSeconds: 900,
      }),
    );

    const creds = assumeResp.Credentials;
    if (
      !creds?.AccessKeyId ||
      !creds?.SecretAccessKey ||
      !creds?.SessionToken
    ) {
      throw new AwsServiceError(
        "Failed to obtain credentials from assumed role",
      );
    }

    credentials = {
      accessKeyId: creds.AccessKeyId,
      secretAccessKey: creds.SecretAccessKey,
      sessionToken: creds.SessionToken,
    };
  } catch (err) {
    if (err instanceof AwsServiceError) {
      throw err;
    }
    throw wrapAwsError(err, `Failed to assume role ${roleArn}`);
  }

  // Create an S3 client with the assumed-role credentials
  const crossAccountS3 = new S3Client({
    region,
    credentials,
  });

  try {
    await crossAccountS3.send(
      new CopyObjectCommand({
        Bucket: destBucket,
        Key: destKey,
        CopySource: `${sourceBucket}/${sourceKey}`,
      }),
    );
  } catch (err) {
    throw wrapAwsError(
      err,
      `Failed to copy s3://${sourceBucket}/${sourceKey} to s3://${destBucket}/${destKey}`,
    );
  }
}

/**
 * Rotate a Secrets Manager secret and notify via SNS.
 *
 * Triggers secret rotation and publishes a notification to the specified
 * SNS topic.
 *
 * @param secretName - The secret name or ARN to rotate.
 * @param topicArn - The SNS topic ARN for rotation notification.
 * @param region - AWS region override.
 * @returns The secret ARN and whether notification was sent.
 */
export async function rotateSecretAndNotify(
  secretName: string,
  topicArn: string,
  region?: string,
): Promise<RotationResult> {
  let secretArn: string;

  try {
    const resp = await smClient(region).send(
      new RotateSecretCommand({ SecretId: secretName }),
    );
    secretArn = resp.ARN ?? secretName;
  } catch (err) {
    throw wrapAwsError(
      err,
      `Failed to rotate secret ${secretName}`,
    );
  }

  let notified = false;
  try {
    await snsClient(region).send(
      new PublishCommand({
        TopicArn: topicArn,
        Subject: "Secret Rotation Notification",
        Message: JSON.stringify({
          event: "SecretRotation",
          secretArn,
          timestamp: new Date().toISOString(),
        }),
      }),
    );
    notified = true;
  } catch {
    // Notification failure is non-fatal
    notified = false;
  }

  return RotationResultSchema.parse({ secretArn, notified });
}

/**
 * Invoke a Lambda function with a secret value injected into the payload.
 *
 * Retrieves the secret from Secrets Manager and includes it in the Lambda
 * invocation payload under the specified key.
 *
 * @param functionName - The Lambda function name or ARN.
 * @param secretName - The secret name or ARN.
 * @param payloadKey - The key under which to inject the secret (default `"secret"`).
 * @param region - AWS region override.
 * @returns The Lambda invocation response payload.
 */
export async function lambdaInvokeWithSecret(
  functionName: string,
  secretName: string,
  payloadKey?: string,
  region?: string,
): Promise<unknown> {
  const key = payloadKey ?? "secret";

  // Get secret value
  let secretValue: string;
  try {
    const resp = await smClient(region).send(
      new GetSecretValueCommand({ SecretId: secretName }),
    );
    secretValue = resp.SecretString ?? "";
  } catch (err) {
    throw wrapAwsError(
      err,
      `Failed to get secret ${secretName} for Lambda invocation`,
    );
  }

  // Build payload
  let secretData: unknown;
  try {
    secretData = JSON.parse(secretValue);
  } catch {
    secretData = secretValue;
  }

  const payload = { [key]: secretData };

  // Invoke Lambda
  try {
    const resp = await lambdaClient(region).send(
      new InvokeCommand({
        FunctionName: functionName,
        Payload: new TextEncoder().encode(JSON.stringify(payload)),
      }),
    );

    if (resp.Payload) {
      const text = new TextDecoder().decode(resp.Payload);
      try {
        return JSON.parse(text);
      } catch {
        return text;
      }
    }
    return undefined;
  } catch (err) {
    throw wrapAwsError(
      err,
      `Failed to invoke Lambda ${functionName} with secret`,
    );
  }
}

/**
 * List all S3 object keys under a prefix and publish them to an SQS queue.
 *
 * Each key is sent as a JSON message with the bucket and key fields.
 * Messages are sent in batches of 10.
 *
 * @param bucket - The S3 bucket to list.
 * @param prefix - The S3 key prefix to scan.
 * @param queueUrl - The SQS queue URL to publish to.
 * @param region - AWS region override.
 * @returns The number of keys published.
 */
// ---------------------------------------------------------------------------
// Extended resource-ops schemas
// ---------------------------------------------------------------------------

/** Schema for an SES suppression list manager result. */
export const SesSuppressionListManagerResultSchema = z.object({
  action: z.string(),
  emailAddresses: z.array(z.string()),
  processed: z.number(),
  reason: z.string().optional(),
  success: z.boolean(),
});
/** SES suppression list manager result. */
export type SesSuppressionListManagerResult = z.infer<typeof SesSuppressionListManagerResultSchema>;

// ---------------------------------------------------------------------------
// Extended resource-ops functions
// ---------------------------------------------------------------------------

/** Add or remove email addresses from the SES account-level suppression list. */
export async function sesSuppressionListManager(
  action: "add" | "remove" | "list",
  emailAddresses?: string[],
  reason?: "BOUNCE" | "COMPLAINT",
  region?: string,
): Promise<SesSuppressionListManagerResult> {
  try {
    // TODO: implement sesSuppressionListManager
    throw new Error("sesSuppressionListManager not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "sesSuppressionListManager failed");
  }
}

export async function publishS3KeysToSqs(
  bucket: string,
  prefix: string,
  queueUrl: string,
  region?: string,
): Promise<{ published: number }> {
  const keys: string[] = [];
  let continuationToken: string | undefined;

  try {
    do {
      const resp = await s3Client(region).send(
        new ListObjectsV2Command({
          Bucket: bucket,
          Prefix: prefix,
          ContinuationToken: continuationToken,
        }),
      );

      for (const obj of resp.Contents ?? []) {
        if (obj.Key) {
          keys.push(obj.Key);
        }
      }
      continuationToken = resp.NextContinuationToken;
    } while (continuationToken);
  } catch (err) {
    throw wrapAwsError(
      err,
      `Failed to list S3 keys in s3://${bucket}/${prefix}`,
    );
  }

  // Send in batches of 10
  let published = 0;
  try {
    for (let i = 0; i < keys.length; i += 10) {
      const batch = keys.slice(i, i + 10);
      const entries = batch.map((key, index) => ({
        Id: String(i + index),
        MessageBody: JSON.stringify({ bucket, key }),
      }));

      await sqsClient(region).send(
        new SendMessageBatchCommand({
          QueueUrl: queueUrl,
          Entries: entries,
        }),
      );
      published += batch.length;
    }
  } catch (err) {
    throw wrapAwsError(
      err,
      `Failed to publish S3 keys to SQS ${queueUrl}`,
    );
  }

  return { published };
}
