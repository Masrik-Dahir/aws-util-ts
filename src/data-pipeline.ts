/**
 * aws-util/data-pipeline — Multi-service data pipeline orchestration.
 *
 * Combines S3, Glue, Athena, Kinesis, DynamoDB, and SQS to provide
 * high-level ETL and data-movement utilities: run Glue then query,
 * export Athena results to S3, load S3 data into DynamoDB or SQS,
 * snapshot Kinesis streams to S3, and parallel exports.
 *
 * All functions obtain clients via {@link getClient} and wrap errors
 * through {@link wrapAwsError}.
 *
 * @example
 * ```ts
 * import { runGlueThenQuery, exportQueryToS3Json, s3JsonToDynamodb } from "./data-pipeline.js";
 *
 * const { glueRun, queryResult } = await runGlueThenQuery(
 *   "my-etl-job",
 *   "SELECT * FROM processed_data LIMIT 100",
 *   "my_database",
 * );
 *
 * await exportQueryToS3Json(
 *   "SELECT * FROM events",
 *   "analytics_db",
 *   "my-bucket",
 *   "exports/events.json",
 * );
 * ```
 *
 * @module
 */

import { z } from "zod";
import {
  GlueClient,
  StartJobRunCommand,
  GetJobRunCommand,
} from "@aws-sdk/client-glue";
import {
  AthenaClient,
  StartQueryExecutionCommand,
  GetQueryExecutionCommand,
  GetQueryResultsCommand,
} from "@aws-sdk/client-athena";
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import {
  KinesisClient,
  GetShardIteratorCommand,
  GetRecordsCommand,
  ListShardsCommand,
} from "@aws-sdk/client-kinesis";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  BatchWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import {
  SQSClient,
  SendMessageBatchCommand,
} from "@aws-sdk/client-sqs";
import { getClient } from "./client.js";
import {
  wrapAwsError,
  AwsTimeoutError,
  AwsServiceError,
} from "./exceptions.js";

// ---------------------------------------------------------------------------
// Zod schemas & inferred types
// ---------------------------------------------------------------------------

/** Schema for a pipeline operation result. */
export const PipelineResultSchema = z.object({
  status: z.string(),
  recordsProcessed: z.number().optional(),
  outputLocation: z.string().optional(),
  error: z.string().optional(),
});

/** Result of a pipeline operation. */
export type PipelineResult = z.infer<typeof PipelineResultSchema>;

/** Schema for an Athena query result. */
export const AthenaQueryResultSchema = z.object({
  queryExecutionId: z.string(),
  rows: z.array(z.record(z.string(), z.string())),
  outputLocation: z.string().optional(),
});

/** Result of an Athena query with parsed rows. */
export type AthenaQueryResult = z.infer<typeof AthenaQueryResultSchema>;

/** Schema for a Glue job run result. */
export const GlueJobRunResultSchema = z.object({
  jobName: z.string(),
  runId: z.string(),
  status: z.string(),
  error: z.string().optional(),
});

/** Result of a Glue job run. */
export type GlueJobRunResult = z.infer<typeof GlueJobRunResultSchema>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function glue(region?: string): GlueClient {
  return getClient(GlueClient, region);
}

function athena(region?: string): AthenaClient {
  return getClient(AthenaClient, region);
}

function s3(region?: string): S3Client {
  return getClient(S3Client, region);
}

function kinesis(region?: string): KinesisClient {
  return getClient(KinesisClient, region);
}

function ddbDoc(region?: string): DynamoDBDocumentClient {
  return DynamoDBDocumentClient.from(getClient(DynamoDBClient, region));
}

function sqs(region?: string): SQSClient {
  return getClient(SQSClient, region);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Glue job terminal states. */
const GLUE_TERMINAL_STATES = new Set([
  "SUCCEEDED",
  "FAILED",
  "STOPPED",
  "TIMEOUT",
  "ERROR",
]);

/** Athena query terminal states. */
const ATHENA_TERMINAL_STATES = new Set([
  "SUCCEEDED",
  "FAILED",
  "CANCELLED",
]);

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
  // Node.js Readable stream from S3
  const chunks: Uint8Array[] = [];
  for await (const chunk of body as AsyncIterable<Uint8Array>) {
    chunks.push(
      chunk instanceof Uint8Array ? chunk : new TextEncoder().encode(String(chunk)),
    );
  }
  return new TextDecoder().decode(concatUint8Arrays(chunks));
}

/**
 * Concatenate multiple Uint8Arrays into one.
 */
function concatUint8Arrays(arrays: Uint8Array[]): Uint8Array {
  const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}

/**
 * Wait for a Glue job run to complete.
 */
async function waitForGlueJob(
  jobName: string,
  runId: string,
  timeout: number,
  region?: string,
): Promise<GlueJobRunResult> {
  const deadline = Date.now() + timeout;
  const pollInterval = 10_000;

  while (Date.now() < deadline) {
    try {
      const resp = await glue(region).send(
        new GetJobRunCommand({ JobName: jobName, RunId: runId }),
      );
      const state = resp.JobRun?.JobRunState ?? "UNKNOWN";

      if (GLUE_TERMINAL_STATES.has(state)) {
        return GlueJobRunResultSchema.parse({
          jobName,
          runId,
          status: state,
          error: resp.JobRun?.ErrorMessage,
        });
      }
    } catch (err) {
      throw wrapAwsError(err, `Failed to poll Glue job ${jobName}`);
    }

    await sleep(pollInterval);
  }

  throw new AwsTimeoutError(
    `Glue job ${jobName} run ${runId} did not complete within ${timeout}ms`,
  );
}

/**
 * Run an Athena query and wait for results.
 */
async function runAthenaQuery(
  query: string,
  database?: string,
  outputLocation?: string,
  timeout?: number,
  region?: string,
): Promise<AthenaQueryResult> {
  const maxWait = timeout ?? 300_000;
  const pollInterval = 3_000;

  let queryExecutionId: string;

  try {
    const startResp = await athena(region).send(
      new StartQueryExecutionCommand({
        QueryString: query,
        QueryExecutionContext: database
          ? { Database: database }
          : undefined,
        ResultConfiguration: outputLocation
          ? { OutputLocation: outputLocation }
          : undefined,
      }),
    );
    queryExecutionId = startResp.QueryExecutionId ?? "";
  } catch (err) {
    throw wrapAwsError(err, "Failed to start Athena query");
  }

  // Poll for completion
  const deadline = Date.now() + maxWait;
  let resultOutputLocation: string | undefined;

  while (Date.now() < deadline) {
    try {
      const execResp = await athena(region).send(
        new GetQueryExecutionCommand({
          QueryExecutionId: queryExecutionId,
        }),
      );
      const state =
        execResp.QueryExecution?.Status?.State ?? "UNKNOWN";
      resultOutputLocation =
        execResp.QueryExecution?.ResultConfiguration?.OutputLocation;

      if (state === "SUCCEEDED") {
        break;
      }
      if (state === "FAILED" || state === "CANCELLED") {
        throw new AwsServiceError(
          `Athena query ${queryExecutionId} ${state}: ${execResp.QueryExecution?.Status?.StateChangeReason ?? "unknown"}`,
        );
      }
    } catch (err) {
      if (err instanceof AwsServiceError) {
        throw err;
      }
      throw wrapAwsError(
        err,
        `Failed to poll Athena query ${queryExecutionId}`,
      );
    }

    await sleep(pollInterval);
  }

  if (Date.now() >= deadline) {
    throw new AwsTimeoutError(
      `Athena query ${queryExecutionId} did not complete within ${maxWait}ms`,
    );
  }

  // Fetch results
  const rows: Record<string, string>[] = [];
  let nextToken: string | undefined;
  let headers: string[] | undefined;

  try {
    do {
      const resultsResp = await athena(region).send(
        new GetQueryResultsCommand({
          QueryExecutionId: queryExecutionId,
          NextToken: nextToken,
        }),
      );

      const resultRows = resultsResp.ResultSet?.Rows ?? [];
      for (let i = 0; i < resultRows.length; i++) {
        const row = resultRows[i];
        const values = (row.Data ?? []).map(
          (d) => d.VarCharValue ?? "",
        );

        if (!headers) {
          // First row is headers
          headers = values;
          continue;
        }

        const record: Record<string, string> = {};
        for (let j = 0; j < headers.length; j++) {
          record[headers[j]] = values[j] ?? "";
        }
        rows.push(record);
      }

      nextToken = resultsResp.NextToken;
    } while (nextToken);
  } catch (err) {
    throw wrapAwsError(
      err,
      `Failed to fetch Athena results for ${queryExecutionId}`,
    );
  }

  return AthenaQueryResultSchema.parse({
    queryExecutionId,
    rows,
    outputLocation: resultOutputLocation,
  });
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Run a Glue ETL job, wait for completion, then execute an Athena query.
 *
 * Starts the Glue job with optional arguments, waits for it to succeed,
 * then runs the Athena query and returns both results.
 *
 * @param jobName - The Glue job name.
 * @param query - The Athena SQL query to run after the Glue job completes.
 * @param database - The Athena database name (optional).
 * @param outputLocation - S3 output location for Athena results (optional).
 * @param jobArgs - Additional Glue job arguments (optional).
 * @param glueTimeout - Glue job timeout in ms (default 1800000 = 30 min).
 * @param athenaTimeout - Athena query timeout in ms (default 300000 = 5 min).
 * @param region - AWS region override.
 * @returns Both the Glue run result and the Athena query result.
 */
export async function runGlueThenQuery(
  jobName: string,
  query: string,
  database?: string,
  outputLocation?: string,
  jobArgs?: Record<string, string>,
  glueTimeout?: number,
  athenaTimeout?: number,
  region?: string,
): Promise<{ glueRun: GlueJobRunResult; queryResult: AthenaQueryResult }> {
  // Start Glue job
  let runId: string;
  try {
    const resp = await glue(region).send(
      new StartJobRunCommand({
        JobName: jobName,
        Arguments: jobArgs,
      }),
    );
    runId = resp.JobRunId ?? "";
  } catch (err) {
    throw wrapAwsError(err, `Failed to start Glue job ${jobName}`);
  }

  // Wait for Glue job
  const glueRun = await waitForGlueJob(
    jobName,
    runId,
    glueTimeout ?? 1_800_000,
    region,
  );

  if (glueRun.status !== "SUCCEEDED") {
    throw new AwsServiceError(
      `Glue job ${jobName} did not succeed: ${glueRun.status} - ${glueRun.error ?? ""}`,
    );
  }

  // Run Athena query
  const queryResult = await runAthenaQuery(
    query,
    database,
    outputLocation,
    athenaTimeout ?? 300_000,
    region,
  );

  return { glueRun, queryResult };
}

/**
 * Run an Athena query and export the results as JSON to S3.
 *
 * Executes the query, reads all result rows, serializes them as a JSON
 * array, and uploads to the specified S3 location.
 *
 * @param query - The Athena SQL query.
 * @param database - The Athena database name.
 * @param s3Bucket - The destination S3 bucket.
 * @param s3Key - The destination S3 key.
 * @param outputLocation - S3 output location for Athena intermediate results.
 * @param region - AWS region override.
 * @returns A pipeline result with the output location and record count.
 */
export async function exportQueryToS3Json(
  query: string,
  database: string,
  s3Bucket: string,
  s3Key: string,
  outputLocation?: string,
  region?: string,
): Promise<PipelineResult> {
  // Run query
  const queryResult = await runAthenaQuery(
    query,
    database,
    outputLocation,
    300_000,
    region,
  );

  // Write JSON to S3
  const jsonContent = JSON.stringify(queryResult.rows, null, 2);
  try {
    await s3(region).send(
      new PutObjectCommand({
        Bucket: s3Bucket,
        Key: s3Key,
        Body: jsonContent,
        ContentType: "application/json",
      }),
    );
  } catch (err) {
    throw wrapAwsError(
      err,
      `Failed to write query results to s3://${s3Bucket}/${s3Key}`,
    );
  }

  return PipelineResultSchema.parse({
    status: "SUCCEEDED",
    recordsProcessed: queryResult.rows.length,
    outputLocation: `s3://${s3Bucket}/${s3Key}`,
  });
}

/**
 * Read a JSON array from S3 and batch-write the items to DynamoDB.
 *
 * The S3 object must contain a JSON array of objects. Items are written
 * in batches of 25 (DynamoDB BatchWriteItem limit).
 *
 * @param bucket - The source S3 bucket.
 * @param key - The source S3 key containing a JSON array.
 * @param tableName - The target DynamoDB table name.
 * @param region - AWS region override.
 * @returns A pipeline result with the number of records processed.
 */
export async function s3JsonToDynamodb(
  bucket: string,
  key: string,
  tableName: string,
  region?: string,
): Promise<PipelineResult> {
  // Read JSON from S3
  let items: Record<string, unknown>[];
  try {
    const resp = await s3(region).send(
      new GetObjectCommand({ Bucket: bucket, Key: key }),
    );
    const body = await streamToString(resp.Body);
    items = JSON.parse(body) as Record<string, unknown>[];
  } catch (err) {
    throw wrapAwsError(
      err,
      `Failed to read JSON from s3://${bucket}/${key}`,
    );
  }

  if (!Array.isArray(items)) {
    throw new AwsServiceError(
      `S3 object s3://${bucket}/${key} does not contain a JSON array`,
    );
  }

  // Batch write to DynamoDB in chunks of 25
  const batchSize = 25;
  let processed = 0;

  try {
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
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
      processed += batch.length;
    }
  } catch (err) {
    throw wrapAwsError(
      err,
      `Failed to batch write to DynamoDB table ${tableName}`,
    );
  }

  return PipelineResultSchema.parse({
    status: "SUCCEEDED",
    recordsProcessed: processed,
    outputLocation: `dynamodb://${tableName}`,
  });
}

/**
 * Read a JSONL file from S3 and send each line as a message to SQS.
 *
 * Messages are sent in batches of 10 (SQS SendMessageBatch limit).
 *
 * @param bucket - The source S3 bucket.
 * @param key - The source S3 key containing JSONL data.
 * @param queueUrl - The target SQS queue URL.
 * @param region - AWS region override.
 * @returns A pipeline result with the number of records processed.
 */
export async function s3JsonlToSqs(
  bucket: string,
  key: string,
  queueUrl: string,
  region?: string,
): Promise<PipelineResult> {
  // Read JSONL from S3
  let lines: string[];
  try {
    const resp = await s3(region).send(
      new GetObjectCommand({ Bucket: bucket, Key: key }),
    );
    const body = await streamToString(resp.Body);
    lines = body
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  } catch (err) {
    throw wrapAwsError(
      err,
      `Failed to read JSONL from s3://${bucket}/${key}`,
    );
  }

  // Send to SQS in batches of 10
  const batchSize = 10;
  let processed = 0;

  try {
    for (let i = 0; i < lines.length; i += batchSize) {
      const batch = lines.slice(i, i + batchSize);
      const entries = batch.map((line, index) => ({
        Id: String(i + index),
        MessageBody: line,
      }));

      await sqs(region).send(
        new SendMessageBatchCommand({
          QueueUrl: queueUrl,
          Entries: entries,
        }),
      );
      processed += batch.length;
    }
  } catch (err) {
    throw wrapAwsError(err, `Failed to send messages to SQS ${queueUrl}`);
  }

  return PipelineResultSchema.parse({
    status: "SUCCEEDED",
    recordsProcessed: processed,
    outputLocation: queueUrl,
  });
}

/**
 * Consume records from a Kinesis stream for a specified duration and write to S3.
 *
 * Reads from all shards concurrently and collects records as JSON lines.
 * The collected data is uploaded to S3 as a single JSONL file.
 *
 * @param streamName - The Kinesis stream name.
 * @param bucket - The destination S3 bucket.
 * @param keyPrefix - The S3 key prefix for the output file.
 * @param duration - Duration to consume in ms (default 60000 = 1 min).
 * @param region - AWS region override.
 * @returns A pipeline result with the number of records captured.
 */
export async function kinesisToS3Snapshot(
  streamName: string,
  bucket: string,
  keyPrefix: string,
  duration?: number,
  region?: string,
): Promise<PipelineResult> {
  const consumeDuration = duration ?? 60_000;
  const deadline = Date.now() + consumeDuration;

  // List all shards
  let shardIds: string[];
  try {
    const shardsResp = await kinesis(region).send(
      new ListShardsCommand({ StreamName: streamName }),
    );
    shardIds = (shardsResp.Shards ?? []).map((s) => s.ShardId ?? "");
  } catch (err) {
    throw wrapAwsError(
      err,
      `Failed to list shards for stream ${streamName}`,
    );
  }

  // Get shard iterators
  const iteratorPromises = shardIds.map(async (shardId) => {
    try {
      const resp = await kinesis(region).send(
        new GetShardIteratorCommand({
          StreamName: streamName,
          ShardId: shardId,
          ShardIteratorType: "TRIM_HORIZON",
        }),
      );
      return resp.ShardIterator ?? "";
    } catch (err) {
      throw wrapAwsError(
        err,
        `Failed to get shard iterator for ${shardId}`,
      );
    }
  });

  let iterators = await Promise.all(iteratorPromises);
  const allRecords: string[] = [];

  // Consume records from all shards
  while (Date.now() < deadline) {
    const nextIterators: string[] = [];

    for (const iterator of iterators) {
      if (!iterator) {
        continue;
      }

      try {
        const resp = await kinesis(region).send(
          new GetRecordsCommand({ ShardIterator: iterator, Limit: 100 }),
        );

        for (const record of resp.Records ?? []) {
          if (record.Data) {
            const decoded = new TextDecoder().decode(record.Data);
            allRecords.push(decoded);
          }
        }

        if (resp.NextShardIterator) {
          nextIterators.push(resp.NextShardIterator);
        }
      } catch (err) {
        throw wrapAwsError(
          err,
          `Failed to get records from stream ${streamName}`,
        );
      }
    }

    iterators = nextIterators;
    if (iterators.length === 0) {
      break;
    }

    await sleep(1_000);
  }

  // Write to S3
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const s3Key = `${keyPrefix}${streamName}-${timestamp}.jsonl`;
  const content = allRecords.join("\n");

  try {
    await s3(region).send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: s3Key,
        Body: content,
        ContentType: "application/x-ndjson",
      }),
    );
  } catch (err) {
    throw wrapAwsError(
      err,
      `Failed to write Kinesis snapshot to s3://${bucket}/${s3Key}`,
    );
  }

  return PipelineResultSchema.parse({
    status: "SUCCEEDED",
    recordsProcessed: allRecords.length,
    outputLocation: `s3://${bucket}/${s3Key}`,
  });
}

/**
 * Run multiple {@link exportQueryToS3Json} operations concurrently.
 *
 * Each export specifies a query, database, and S3 destination. All exports
 * are executed in parallel.
 *
 * @param exports - Array of export specifications.
 * @param outputLocation - Shared Athena output location for intermediate results.
 * @param region - AWS region override.
 * @returns Array of pipeline results, one per export.
 */
export async function parallelExport(
  exports: Array<{
    query: string;
    database: string;
    s3Bucket: string;
    s3Key: string;
  }>,
  outputLocation?: string,
  region?: string,
): Promise<PipelineResult[]> {
  const promises = exports.map((exp) =>
    exportQueryToS3Json(
      exp.query,
      exp.database,
      exp.s3Bucket,
      exp.s3Key,
      outputLocation,
      region,
    ),
  );

  return Promise.all(promises);
}

// ---------------------------------------------------------------------------
// Additional types (auto-generated)
// ---------------------------------------------------------------------------

/** Outcome of a Glue job execution triggered by :func:`run_glue_job`. */
export type GlueJobRun = {
  jobName: string;
  runId: string;
  state: string;
  errorMessage?: string | undefined;
  executionTimeSeconds?: number | undefined;
};


// ---------------------------------------------------------------------------
// Additional functions (auto-generated)
// ---------------------------------------------------------------------------

/** Start a Glue ETL job and wait for it to finish. */
export async function runGlueJob(jobName: string, arguments?: Record<string, unknown>, timeoutMinutes: number, pollInterval: number, regionName?: string | undefined): Promise<GlueJobRun> {
  try {
    // TODO: implement run_glue_job
    throw new Error("run_glue_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "run_glue_job failed");
  }
}

/** Execute an Athena SQL query and wait for it to complete. */
export async function runAthenaQuery(query: string, database: string, outputLocation: string, workgroup: string, timeoutSeconds: number, pollInterval: number, regionName?: string | undefined): Promise<AthenaQueryResult> {
  try {
    // TODO: implement run_athena_query
    throw new Error("run_athena_query not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "run_athena_query failed");
  }
}

/** Fetch all rows from a completed Athena query as a list of dicts. */
export async function fetchAthenaResults(queryExecutionId: string, regionName?: string | undefined): Promise<Record<string, unknown>[]> {
  try {
    // TODO: implement fetch_athena_results
    throw new Error("fetch_athena_results not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "fetch_athena_results failed");
  }
}
