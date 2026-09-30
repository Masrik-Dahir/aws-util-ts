/**
 * aws-util/data-flow-etl — Multi-service ETL and data-flow utilities.
 *
 * Combines S3 + DynamoDB + Kinesis + Firehose + Glue + Athena + CloudWatch + SNS
 * to provide high-level data-movement, transformation, archival, and partitioning
 * operations for serverless data pipelines.
 *
 * All async functions obtain clients via {@link getClient} and wrap errors
 * through {@link wrapAwsError}.
 *
 * @example
 * ```ts
 * import {
 *   s3EventToDynamodb,
 *   dynamodbStreamToS3Archive,
 *   s3CsvToDynamodbBulk,
 *   crossRegionS3Replicator,
 * } from "./data-flow-etl.js";
 *
 * const result = await s3EventToDynamodb("my-bucket", "data.json", "my-table");
 * const archive = await dynamodbStreamToS3Archive(records, "archive-bucket");
 * ```
 *
 * @module
 */

import { z } from "zod";
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  CopyObjectCommand,
} from "@aws-sdk/client-s3";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  BatchWriteCommand,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";
import {
  KinesisClient,
  GetShardIteratorCommand,
  GetRecordsCommand,
  ListShardsCommand,
} from "@aws-sdk/client-kinesis";
import {
  FirehoseClient,
  PutRecordBatchCommand,
} from "@aws-sdk/client-firehose";
import {
  GlueClient,
  BatchCreatePartitionCommand,
  GetTableCommand,
} from "@aws-sdk/client-glue";
import {
  AthenaClient,
  StartQueryExecutionCommand,
  GetQueryExecutionCommand,
} from "@aws-sdk/client-athena";
import {
  CloudWatchClient,
  PutMetricDataCommand,
} from "@aws-sdk/client-cloudwatch";
import {
  SNSClient,
  PublishCommand,
} from "@aws-sdk/client-sns";
import { getClient } from "./client.js";
import {
  wrapAwsError,
  AwsTimeoutError,
  AwsServiceError,
} from "./exceptions.js";

// ---------------------------------------------------------------------------
// Zod schemas & inferred types
// ---------------------------------------------------------------------------

/** Schema for the result of loading S3 data into DynamoDB. */
export const S3ToDynamoDBResultSchema = z.object({
  itemsWritten: z.number(),
  bucket: z.string(),
  key: z.string(),
});

/** S3-to-DynamoDB result. */
export type S3ToDynamoDBResult = z.infer<
  typeof S3ToDynamoDBResultSchema
>;

/** Schema for the result of indexing stream records into OpenSearch. */
export const StreamToOpenSearchResultSchema = z.object({
  indexed: z.number(),
  failed: z.number(),
});

/** Stream-to-OpenSearch result. */
export type StreamToOpenSearchResult = z.infer<
  typeof StreamToOpenSearchResultSchema
>;

/** Schema for the result of archiving stream records to S3. */
export const StreamToS3ResultSchema = z.object({
  recordsArchived: z.number(),
  s3Key: z.string(),
});

/** Stream-to-S3 result. */
export type StreamToS3Result = z.infer<
  typeof StreamToS3ResultSchema
>;

/** Schema for the result of loading CSV data into DynamoDB. */
export const CSVToDynamoDBResultSchema = z.object({
  rowsProcessed: z.number(),
  rowsFailed: z.number(),
});

/** CSV-to-DynamoDB result. */
export type CSVToDynamoDBResult = z.infer<
  typeof CSVToDynamoDBResultSchema
>;

/** Schema for the result of transferring Kinesis records to Firehose. */
export const KinesisToFirehoseResultSchema = z.object({
  recordsTransferred: z.number(),
});

/** Kinesis-to-Firehose result. */
export type KinesisToFirehoseResult = z.infer<
  typeof KinesisToFirehoseResultSchema
>;

/** Schema for the result of cross-region S3 replication. */
export const CrossRegionReplicateResultSchema = z.object({
  sourceBucket: z.string(),
  destBucket: z.string(),
  key: z.string(),
  replicated: z.boolean(),
});

/** Cross-region replication result. */
export type CrossRegionReplicateResult = z.infer<
  typeof CrossRegionReplicateResultSchema
>;

/** Schema for an ETL status tracking record. */
export const ETLStatusRecordSchema = z.object({
  pipelineId: z.string(),
  stepName: z.string(),
  status: z.string(),
  timestamp: z.string(),
  metadata: z.record(z.unknown()).optional(),
});

/** An ETL status record. */
export type ETLStatusRecord = z.infer<typeof ETLStatusRecordSchema>;

/** Schema for the result of a multipart upload. */
export const MultipartUploadResultSchema = z.object({
  bucket: z.string(),
  key: z.string(),
  uploadId: z.string(),
  partsUploaded: z.number(),
});

/** Multipart upload result. */
export type MultipartUploadResult = z.infer<
  typeof MultipartUploadResultSchema
>;

/** Schema for the result of a partition management operation. */
export const PartitionResultSchema = z.object({
  database: z.string(),
  table: z.string(),
  partitionsAdded: z.number(),
});

/** Partition result. */
export type PartitionResult = z.infer<typeof PartitionResultSchema>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Get a cached S3Client for the given region.
 */
function s3(region?: string): S3Client {
  return getClient(S3Client, region);
}

/**
 * Get a cached DynamoDB DocumentClient for the given region.
 */
function ddb(region?: string): DynamoDBDocumentClient {
  return DynamoDBDocumentClient.from(
    getClient(DynamoDBClient, region),
  );
}

/**
 * Get a cached KinesisClient for the given region.
 */
function kinesis(region?: string): KinesisClient {
  return getClient(KinesisClient, region);
}

/**
 * Get a cached FirehoseClient for the given region.
 */
function firehose(region?: string): FirehoseClient {
  return getClient(FirehoseClient, region);
}

/**
 * Get a cached GlueClient for the given region.
 */
function glue(region?: string): GlueClient {
  return getClient(GlueClient, region);
}

/**
 * Get a cached AthenaClient for the given region.
 */
function athena(region?: string): AthenaClient {
  return getClient(AthenaClient, region);
}

/**
 * Get a cached CloudWatchClient for the given region.
 */
function cw(region?: string): CloudWatchClient {
  return getClient(CloudWatchClient, region);
}

/**
 * Get a cached SNSClient for the given region.
 */
function sns(region?: string): SNSClient {
  return getClient(SNSClient, region);
}

/**
 * Read an S3 object body as a UTF-8 string.
 */
async function readS3Body(
  bucket: string,
  key: string,
  region?: string,
): Promise<string> {
  const resp = await s3(region).send(
    new GetObjectCommand({ Bucket: bucket, Key: key }),
  );

  const body = resp.Body;
  if (!body) {
    return "";
  }

  // SDK v3 Body is a Readable stream or a web ReadableStream
  if (typeof (body as NodeJS.ReadableStream).read === "function") {
    const chunks: Uint8Array[] = [];
    for await (const chunk of body as AsyncIterable<Uint8Array>) {
      chunks.push(chunk);
    }
    const buffer = new Uint8Array(
      chunks.reduce((acc, c) => acc + c.length, 0),
    );
    let offset = 0;
    for (const chunk of chunks) {
      buffer.set(chunk, offset);
      offset += chunk.length;
    }
    return new TextDecoder().decode(buffer);
  }

  return String(body);
}

/**
 * Parse a simple CSV string into an array of records.
 *
 * Assumes first line is headers. Does not handle quoted commas.
 */
function parseCSV(
  csv: string,
): Array<Record<string, string>> {
  const lines = csv.trim().split("\n");
  if (lines.length < 2) {
    return [];
  }

  const headers = lines[0].split(",").map((h) => h.trim());
  const records: Array<Record<string, string>> = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim());
    const record: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      record[headers[j]] = values[j] ?? "";
    }
    records.push(record);
  }

  return records;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Load a JSON file from S3 into a DynamoDB table.
 *
 * Reads the S3 object, parses it as a JSON array of items, optionally transforms
 * each item, and batch-writes them to DynamoDB.
 *
 * @param bucket - The S3 bucket name.
 * @param key - The S3 object key.
 * @param tableName - The DynamoDB table name.
 * @param transformFn - Optional function to transform each item before writing.
 * @param region - AWS region override.
 * @returns The number of items written and source location.
 */
export async function s3EventToDynamodb(
  bucket: string,
  key: string,
  tableName: string,
  transformFn?: (item: Record<string, unknown>) => Record<string, unknown>,
  region?: string,
): Promise<S3ToDynamoDBResult> {
  let body: string;
  try {
    body = await readS3Body(bucket, key, region);
  } catch (err: unknown) {
    throw wrapAwsError(
      err,
      `s3EventToDynamodb: read s3://${bucket}/${key}`,
    );
  }

  let items: Record<string, unknown>[];
  try {
    const parsed = JSON.parse(body);
    items = Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    throw new AwsServiceError(
      `s3EventToDynamodb: failed to parse JSON from s3://${bucket}/${key}`,
    );
  }

  // Apply optional transform
  if (transformFn) {
    items = items.map(transformFn);
  }

  // Batch write in chunks of 25
  let written = 0;
  const client = ddb(region);

  for (let i = 0; i < items.length; i += 25) {
    const batch = items.slice(i, i + 25);
    try {
      await client.send(
        new BatchWriteCommand({
          RequestItems: {
            [tableName]: batch.map((item) => ({
              PutRequest: { Item: item },
            })),
          },
        }),
      );
      written += batch.length;
    } catch (err: unknown) {
      throw wrapAwsError(
        err,
        `s3EventToDynamodb: batch write failed at offset ${i}`,
      );
    }
  }

  return S3ToDynamoDBResultSchema.parse({
    itemsWritten: written,
    bucket,
    key,
  });
}

/**
 * Index DynamoDB stream records into OpenSearch via HTTP PUT.
 *
 * Each record is indexed as a document. Uses the global `fetch` API
 * to make HTTP requests to the OpenSearch endpoint.
 *
 * @param records - DynamoDB stream event records.
 * @param opensearchEndpoint - The OpenSearch domain endpoint URL.
 * @param indexName - The OpenSearch index name.
 * @param idKey - The attribute name to use as the document ID (default `"id"`).
 * @param _region - AWS region override (reserved for future signing).
 * @returns Count of indexed and failed records.
 */
export async function dynamodbStreamToOpensearch(
  records: Record<string, unknown>[],
  opensearchEndpoint: string,
  indexName: string,
  idKey?: string,
  _region?: string,
): Promise<StreamToOpenSearchResult> {
  const key = idKey ?? "id";
  let indexed = 0;
  let failed = 0;

  const endpoint = opensearchEndpoint.replace(/\/$/, "");

  for (const record of records) {
    const dynamodb = record["dynamodb"] as
      | Record<string, unknown>
      | undefined;
    const newImage =
      (dynamodb?.["NewImage"] as Record<string, unknown>) ?? {};
    const docId = String(newImage[key] ?? `auto-${Date.now()}-${indexed}`);

    try {
      const resp = await fetch(
        `${endpoint}/${indexName}/_doc/${docId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newImage),
        },
      );

      if (resp.ok) {
        indexed++;
      } else {
        failed++;
      }
    } catch {
      failed++;
    }
  }

  return StreamToOpenSearchResultSchema.parse({ indexed, failed });
}

/**
 * Archive DynamoDB stream records as JSONL to S3.
 *
 * Serializes each record as a newline-delimited JSON line and writes
 * the result to S3 under the given prefix.
 *
 * @param records - DynamoDB stream event records.
 * @param bucket - The S3 bucket for archival.
 * @param prefix - Optional S3 key prefix (default `"archive/"`).
 * @param region - AWS region override.
 * @returns The number of archived records and S3 key.
 */
export async function dynamodbStreamToS3Archive(
  records: Record<string, unknown>[],
  bucket: string,
  prefix?: string,
  region?: string,
): Promise<StreamToS3Result> {
  const effectivePrefix = prefix ?? "archive/";
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const s3Key = `${effectivePrefix}${timestamp}.jsonl`;

  const jsonl = records
    .map((r) => JSON.stringify(r))
    .join("\n");

  try {
    await s3(region).send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: s3Key,
        Body: jsonl,
        ContentType: "application/x-ndjson",
      }),
    );
  } catch (err: unknown) {
    throw wrapAwsError(
      err,
      `dynamodbStreamToS3Archive: write s3://${bucket}/${s3Key}`,
    );
  }

  return StreamToS3ResultSchema.parse({
    recordsArchived: records.length,
    s3Key,
  });
}

/**
 * Parse a CSV file from S3 and bulk-load rows into DynamoDB.
 *
 * Reads the CSV, parses it into records using the header row, optionally
 * remaps columns, and batch-writes to DynamoDB.
 *
 * @param bucket - The S3 bucket containing the CSV.
 * @param key - The S3 object key of the CSV file.
 * @param tableName - The DynamoDB table name.
 * @param columnMapping - Optional map from CSV column names to DynamoDB attribute names.
 * @param region - AWS region override.
 * @returns Count of processed and failed rows.
 */
export async function s3CsvToDynamodbBulk(
  bucket: string,
  key: string,
  tableName: string,
  columnMapping?: Record<string, string>,
  region?: string,
): Promise<CSVToDynamoDBResult> {
  let csvContent: string;
  try {
    csvContent = await readS3Body(bucket, key, region);
  } catch (err: unknown) {
    throw wrapAwsError(
      err,
      `s3CsvToDynamodbBulk: read s3://${bucket}/${key}`,
    );
  }

  const rows = parseCSV(csvContent);
  let rowsProcessed = 0;
  let rowsFailed = 0;
  const client = ddb(region);

  // Apply column mapping if provided
  const mappedRows = rows.map((row) => {
    if (!columnMapping) {
      return row;
    }
    const mapped: Record<string, string> = {};
    for (const [csvCol, val] of Object.entries(row)) {
      const ddbAttr = columnMapping[csvCol] ?? csvCol;
      mapped[ddbAttr] = val;
    }
    return mapped;
  });

  // Batch write in chunks of 25
  for (let i = 0; i < mappedRows.length; i += 25) {
    const batch = mappedRows.slice(i, i + 25);
    try {
      await client.send(
        new BatchWriteCommand({
          RequestItems: {
            [tableName]: batch.map((item) => ({
              PutRequest: { Item: item },
            })),
          },
        }),
      );
      rowsProcessed += batch.length;
    } catch {
      rowsFailed += batch.length;
    }
  }

  return CSVToDynamoDBResultSchema.parse({
    rowsProcessed,
    rowsFailed,
  });
}

/**
 * Read records from a Kinesis stream and forward them to a Firehose delivery stream.
 *
 * Optionally transforms each record before forwarding.
 *
 * @param streamName - The Kinesis stream name.
 * @param deliveryStream - The Firehose delivery stream name.
 * @param transformFn - Optional function to transform record data.
 * @param shardIteratorType - Shard iterator type (default `"TRIM_HORIZON"`).
 * @param maxRecords - Maximum records to read per GetRecords call (default 100).
 * @param region - AWS region override.
 * @returns The number of records transferred.
 */
export async function kinesisToFirehoseTransformer(
  streamName: string,
  deliveryStream: string,
  transformFn?: (data: string) => string,
  shardIteratorType?: string,
  maxRecords?: number,
  region?: string,
): Promise<KinesisToFirehoseResult> {
  const iteratorType = shardIteratorType ?? "TRIM_HORIZON";
  const limit = maxRecords ?? 100;
  let recordsTransferred = 0;

  try {
    // List shards
    const shardsResp = await kinesis(region).send(
      new ListShardsCommand({ StreamName: streamName }),
    );

    for (const shard of shardsResp.Shards ?? []) {
      // Get shard iterator
      const iterResp = await kinesis(region).send(
        new GetShardIteratorCommand({
          StreamName: streamName,
          ShardId: shard.ShardId,
          ShardIteratorType: iteratorType as
            | "AT_SEQUENCE_NUMBER"
            | "AFTER_SEQUENCE_NUMBER"
            | "TRIM_HORIZON"
            | "LATEST"
            | "AT_TIMESTAMP",
        }),
      );

      let iterator = iterResp.ShardIterator;
      if (!iterator) {
        continue;
      }

      // Read records
      const recordsResp = await kinesis(region).send(
        new GetRecordsCommand({
          ShardIterator: iterator,
          Limit: limit,
        }),
      );

      const kinesisRecords = recordsResp.Records ?? [];
      if (kinesisRecords.length === 0) {
        continue;
      }

      // Transform and forward to Firehose in batches of 500
      for (let i = 0; i < kinesisRecords.length; i += 500) {
        const batch = kinesisRecords.slice(i, i + 500);
        const firehoseRecords = batch.map((r) => {
          const data = r.Data
            ? new TextDecoder().decode(r.Data)
            : "";
          const transformed = transformFn ? transformFn(data) : data;
          return {
            Data: new TextEncoder().encode(transformed + "\n"),
          };
        });

        await firehose(region).send(
          new PutRecordBatchCommand({
            DeliveryStreamName: deliveryStream,
            Records: firehoseRecords,
          }),
        );

        recordsTransferred += batch.length;
      }
    }
  } catch (err: unknown) {
    throw wrapAwsError(
      err,
      `kinesisToFirehoseTransformer(${streamName} -> ${deliveryStream})`,
    );
  }

  return KinesisToFirehoseResultSchema.parse({
    recordsTransferred,
  });
}

/**
 * Copy an S3 object to another bucket in a different region.
 *
 * Performs a cross-region copy using the destination region's S3 client.
 * Optionally sends an SNS notification upon completion.
 *
 * @param sourceBucket - The source S3 bucket name.
 * @param sourceKey - The source S3 object key.
 * @param destBucket - The destination S3 bucket name.
 * @param destRegion - The destination AWS region.
 * @param destKey - Optional destination key (defaults to source key).
 * @param snsTopicArn - Optional SNS topic ARN for completion notification.
 * @param sourceRegion - Optional source AWS region.
 * @returns The replication result.
 */
export async function crossRegionS3Replicator(
  sourceBucket: string,
  sourceKey: string,
  destBucket: string,
  destRegion: string,
  destKey?: string,
  snsTopicArn?: string,
  sourceRegion?: string,
): Promise<CrossRegionReplicateResult> {
  const effectiveDestKey = destKey ?? sourceKey;

  try {
    // Use the destination region client for the copy
    const destS3 = s3(destRegion);
    await destS3.send(
      new CopyObjectCommand({
        Bucket: destBucket,
        Key: effectiveDestKey,
        CopySource: `${sourceBucket}/${sourceKey}`,
      }),
    );

    // Optional SNS notification
    if (snsTopicArn) {
      await sns(sourceRegion).send(
        new PublishCommand({
          TopicArn: snsTopicArn,
          Subject: "Cross-Region S3 Replication Complete",
          Message: JSON.stringify({
            sourceBucket,
            sourceKey,
            destBucket,
            destKey: effectiveDestKey,
            destRegion,
          }),
        }),
      );
    }

    return CrossRegionReplicateResultSchema.parse({
      sourceBucket,
      destBucket,
      key: effectiveDestKey,
      replicated: true,
    });
  } catch (err: unknown) {
    throw wrapAwsError(
      err,
      `crossRegionS3Replicator(${sourceBucket}/${sourceKey} -> ${destBucket}/${effectiveDestKey})`,
    );
  }
}

/**
 * Track ETL pipeline step status in DynamoDB with optional CloudWatch metrics.
 *
 * Writes a status record to DynamoDB and optionally emits a CloudWatch
 * custom metric for monitoring.
 *
 * @param tableName - The DynamoDB table for status records.
 * @param pipelineId - The pipeline identifier.
 * @param stepName - The step name.
 * @param status - The step status (e.g. `"RUNNING"`, `"COMPLETED"`, `"FAILED"`).
 * @param metadata - Optional metadata to store with the record.
 * @param metricNamespace - Optional CloudWatch namespace for metrics.
 * @param region - AWS region override.
 * @returns The status record that was written.
 */
export async function etlStatusTracker(
  tableName: string,
  pipelineId: string,
  stepName: string,
  status: string,
  metadata?: Record<string, unknown>,
  metricNamespace?: string,
  region?: string,
): Promise<ETLStatusRecord> {
  const timestamp = new Date().toISOString();
  const record = ETLStatusRecordSchema.parse({
    pipelineId,
    stepName,
    status,
    timestamp,
    metadata,
  });

  try {
    await ddb(region).send(
      new PutCommand({
        TableName: tableName,
        Item: {
          pk: `${pipelineId}#${stepName}`,
          ...record,
        },
      }),
    );
  } catch (err: unknown) {
    throw wrapAwsError(
      err,
      `etlStatusTracker: write status for ${pipelineId}/${stepName}`,
    );
  }

  // Optional CloudWatch metric
  if (metricNamespace) {
    try {
      await cw(region).send(
        new PutMetricDataCommand({
          Namespace: metricNamespace,
          MetricData: [
            {
              MetricName: "ETLStepStatus",
              Dimensions: [
                { Name: "PipelineId", Value: pipelineId },
                { Name: "StepName", Value: stepName },
              ],
              Value: status === "COMPLETED" ? 1 : 0,
              Unit: "Count",
            },
          ],
        }),
      );
    } catch {
      // Best-effort metric emission
    }
  }

  return record;
}

/**
 * Upload data to S3 using multipart upload for large objects.
 *
 * Splits the data into parts of the specified size and uploads them
 * in sequence, then completes the multipart upload.
 *
 * @param bucket - The S3 bucket name.
 * @param key - The S3 object key.
 * @param data - The raw data to upload.
 * @param partSize - Part size in bytes (default 5 MB).
 * @param contentType - Optional content type (default `"application/octet-stream"`).
 * @param metadata - Optional S3 object metadata.
 * @param region - AWS region override.
 * @returns The multipart upload result.
 */
export async function s3MultipartUploadManager(
  bucket: string,
  key: string,
  data: Uint8Array,
  partSize?: number,
  contentType?: string,
  metadata?: Record<string, string>,
  region?: string,
): Promise<MultipartUploadResult> {
  const effectivePartSize = partSize ?? 5 * 1024 * 1024; // 5 MB default

  let uploadId: string;

  try {
    const createResp = await s3(region).send(
      new CreateMultipartUploadCommand({
        Bucket: bucket,
        Key: key,
        ContentType: contentType ?? "application/octet-stream",
        Metadata: metadata,
      }),
    );

    uploadId = createResp.UploadId ?? "";
    if (!uploadId) {
      throw new AwsServiceError(
        "s3MultipartUploadManager: no UploadId returned",
      );
    }
  } catch (err: unknown) {
    throw wrapAwsError(
      err,
      `s3MultipartUploadManager: create upload for s3://${bucket}/${key}`,
    );
  }

  const parts: Array<{ ETag: string; PartNumber: number }> = [];
  let partNumber = 1;

  try {
    for (let offset = 0; offset < data.length; offset += effectivePartSize) {
      const end = Math.min(offset + effectivePartSize, data.length);
      const partData = data.slice(offset, end);

      const uploadResp = await s3(region).send(
        new UploadPartCommand({
          Bucket: bucket,
          Key: key,
          UploadId: uploadId,
          PartNumber: partNumber,
          Body: partData,
        }),
      );

      parts.push({
        ETag: uploadResp.ETag ?? "",
        PartNumber: partNumber,
      });

      partNumber++;
    }

    // Complete the multipart upload
    await s3(region).send(
      new CompleteMultipartUploadCommand({
        Bucket: bucket,
        Key: key,
        UploadId: uploadId,
        MultipartUpload: { Parts: parts },
      }),
    );
  } catch (err: unknown) {
    throw wrapAwsError(
      err,
      `s3MultipartUploadManager: upload parts for s3://${bucket}/${key}`,
    );
  }

  return MultipartUploadResultSchema.parse({
    bucket,
    key,
    uploadId,
    partsUploaded: parts.length,
  });
}

/**
 * Add partitions to an AWS Glue table for data lake management.
 *
 * Uses the Glue BatchCreatePartition API to register new partitions
 * pointing to the specified S3 location.
 *
 * @param database - The Glue catalog database name.
 * @param table - The Glue table name.
 * @param s3Location - The S3 base location for partition data.
 * @param partitionValues - Array of partition value maps (one per partition).
 * @param region - AWS region override.
 * @returns The partition operation result.
 */
export async function dataLakePartitionManager(
  database: string,
  table: string,
  s3Location: string,
  partitionValues: Array<Record<string, string>>,
  region?: string,
): Promise<PartitionResult> {
  try {
    // Get the table's storage descriptor to use for partitions
    const tableResp = await glue(region).send(
      new GetTableCommand({
        DatabaseName: database,
        Name: table,
      }),
    );

    const storageDescriptor =
      tableResp.Table?.StorageDescriptor ?? {};

    const partitionInputs = partitionValues.map((pv) => {
      const values = Object.values(pv);
      const partitionPath = Object.entries(pv)
        .map(([k, v]) => `${k}=${v}`)
        .join("/");
      return {
        Values: values,
        StorageDescriptor: {
          ...storageDescriptor,
          Location: `${s3Location.replace(/\/$/, "")}/${partitionPath}`,
        },
      };
    });

    await glue(region).send(
      new BatchCreatePartitionCommand({
        DatabaseName: database,
        TableName: table,
        PartitionInputList: partitionInputs,
      }),
    );

    return PartitionResultSchema.parse({
      database,
      table,
      partitionsAdded: partitionValues.length,
    });
  } catch (err: unknown) {
    throw wrapAwsError(
      err,
      `dataLakePartitionManager(${database}.${table})`,
    );
  }
}

/**
 * Repair partitions for a Glue table by running MSCK REPAIR TABLE via Athena.
 *
 * Starts an Athena query execution and polls until completion.
 *
 * @param database - The Glue catalog database name.
 * @param table - The Glue table name.
 * @param region - AWS region override.
 * @returns The partition repair result.
 */
// ---------------------------------------------------------------------------
// Extended data-flow-etl schemas
// ---------------------------------------------------------------------------

/** Schema for an MSK topic to S3 archiver result. */
export const MskTopicToS3ArchiverResultSchema = z.object({
  topic: z.string(),
  s3Bucket: z.string(),
  s3Key: z.string(),
  messagesArchived: z.number(),
  success: z.boolean(),
});
/** MSK topic to S3 archiver result. */
export type MskTopicToS3ArchiverResult = z.infer<typeof MskTopicToS3ArchiverResultSchema>;

/** Schema for an MSK schema registry enforcer result. */
export const MskSchemaRegistryEnforcerResultSchema = z.object({
  registryArn: z.string(),
  topicsChecked: z.number(),
  topicsNonCompliant: z.array(z.string()),
  schemasRegistered: z.number(),
  compliant: z.boolean(),
});
/** MSK schema registry enforcer result. */
export type MskSchemaRegistryEnforcerResult = z.infer<typeof MskSchemaRegistryEnforcerResultSchema>;

/** Schema for a DocumentDB change stream to SQS result. */
export const DocumentdbChangeStreamToSqsResultSchema = z.object({
  clusterEndpoint: z.string(),
  database: z.string(),
  collection: z.string(),
  queueUrl: z.string(),
  eventsForwarded: z.number(),
});
/** DocumentDB change stream to SQS result. */
export type DocumentdbChangeStreamToSqsResult = z.infer<typeof DocumentdbChangeStreamToSqsResultSchema>;

/** Schema for a Neptune graph backup to S3 result. */
export const NeptuneGraphBackupToS3ResultSchema = z.object({
  clusterIdentifier: z.string(),
  snapshotId: z.string(),
  s3Bucket: z.string(),
  s3Key: z.string(),
  success: z.boolean(),
});
/** Neptune graph backup to S3 result. */
export type NeptuneGraphBackupToS3Result = z.infer<typeof NeptuneGraphBackupToS3ResultSchema>;

/** Schema for a Keyspaces TTL enforcer result. */
export const KeyspacesTtlEnforcerResultSchema = z.object({
  keyspace: z.string(),
  table: z.string(),
  ttlEnabled: z.boolean(),
  defaultTtlSeconds: z.number(),
  success: z.boolean(),
});
/** Keyspaces TTL enforcer result. */
export type KeyspacesTtlEnforcerResult = z.infer<typeof KeyspacesTtlEnforcerResultSchema>;

// ---------------------------------------------------------------------------
// Extended data-flow-etl functions
// ---------------------------------------------------------------------------

/** Consume MSK (Kafka) topic messages and archive them to S3 as JSONL. */
export async function mskTopicToS3Archiver(
  bootstrapBrokers: string,
  topic: string,
  s3Bucket: string,
  s3Prefix: string,
  maxMessages?: number,
  region?: string,
): Promise<MskTopicToS3ArchiverResult> {
  try {
    // TODO: implement mskTopicToS3Archiver
    throw new Error("mskTopicToS3Archiver not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "mskTopicToS3Archiver failed");
  }
}

/** Enforce Glue Schema Registry schemas on MSK topics and auto-register missing schemas. */
export async function mskSchemaRegistryEnforcer(
  registryArn: string,
  bootstrapBrokers: string,
  topics: string[],
  schemaFormat?: "AVRO" | "JSON" | "PROTOBUF",
  region?: string,
): Promise<MskSchemaRegistryEnforcerResult> {
  try {
    // TODO: implement mskSchemaRegistryEnforcer
    throw new Error("mskSchemaRegistryEnforcer not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "mskSchemaRegistryEnforcer failed");
  }
}

/** Tail a DocumentDB collection change stream and forward events to SQS. */
export async function documentdbChangeStreamToSqs(
  clusterEndpoint: string,
  clusterPort: number,
  database: string,
  collection: string,
  queueUrl: string,
  credentialsSecret: string,
  batchSize?: number,
  region?: string,
): Promise<DocumentdbChangeStreamToSqsResult> {
  try {
    // TODO: implement documentdbChangeStreamToSqs
    throw new Error("documentdbChangeStreamToSqs not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "documentdbChangeStreamToSqs failed");
  }
}

/** Create a Neptune cluster snapshot and export metadata to S3. */
export async function neptuneGraphBackupToS3(
  clusterIdentifier: string,
  s3Bucket: string,
  s3Prefix?: string,
  region?: string,
): Promise<NeptuneGraphBackupToS3Result> {
  try {
    // TODO: implement neptuneGraphBackupToS3
    throw new Error("neptuneGraphBackupToS3 not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "neptuneGraphBackupToS3 failed");
  }
}

/** Enable TTL on an Amazon Keyspaces table and set a default TTL value. */
export async function keyspacesTtlEnforcer(
  keyspace: string,
  table: string,
  defaultTtlSeconds: number,
  region?: string,
): Promise<KeyspacesTtlEnforcerResult> {
  try {
    // TODO: implement keyspacesTtlEnforcer
    throw new Error("keyspacesTtlEnforcer not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "keyspacesTtlEnforcer failed");
  }
}

export async function repairPartitions(
  database: string,
  table: string,
  region?: string,
): Promise<PartitionResult> {
  const query = `MSCK REPAIR TABLE \`${database}\`.\`${table}\``;

  let queryExecutionId: string;

  try {
    const startResp = await athena(region).send(
      new StartQueryExecutionCommand({
        QueryString: query,
        QueryExecutionContext: { Database: database },
        ResultConfiguration: {
          OutputLocation: `s3://aws-athena-query-results-${region ?? "us-east-1"}/repair/`,
        },
      }),
    );

    queryExecutionId = startResp.QueryExecutionId ?? "";
  } catch (err: unknown) {
    throw wrapAwsError(
      err,
      `repairPartitions: start query for ${database}.${table}`,
    );
  }

  // Poll for completion
  const maxWait = 120_000;
  const startTime = Date.now();

  while (true) {
    if (Date.now() - startTime > maxWait) {
      throw new AwsTimeoutError(
        `repairPartitions(${database}.${table}): query timed out`,
      );
    }

    try {
      const statusResp = await athena(region).send(
        new GetQueryExecutionCommand({
          QueryExecutionId: queryExecutionId,
        }),
      );

      const state =
        statusResp.QueryExecution?.Status?.State ?? "UNKNOWN";

      if (state === "SUCCEEDED") {
        return PartitionResultSchema.parse({
          database,
          table,
          partitionsAdded: 0, // MSCK REPAIR doesn't report count
        });
      }

      if (state === "FAILED" || state === "CANCELLED") {
        const reason =
          statusResp.QueryExecution?.Status
            ?.StateChangeReason ?? "unknown";
        throw new AwsServiceError(
          `repairPartitions(${database}.${table}): query ${state} — ${reason}`,
        );
      }
    } catch (err: unknown) {
      if (err instanceof AwsServiceError) {
        throw err;
      }
      throw wrapAwsError(
        err,
        `repairPartitions: poll for ${database}.${table}`,
      );
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
}
