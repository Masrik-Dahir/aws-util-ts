/**
 * aws-util/testing-dev — Multi-service testing and development utilities.
 *
 * Provides typed helpers for generating mock Lambda event payloads,
 * seeding DynamoDB tables for tests, running integration test harnesses,
 * generating mock event sources, recording Lambda invocations, and
 * snapshot-testing against S3-stored baselines.
 *
 * Multi-service: Lambda + CloudFormation + DynamoDB + SQS + S3 + SNS.
 *
 * All async functions obtain clients via {@link getClient} and wrap errors
 * through {@link wrapAwsError}.
 *
 * @example
 * ```ts
 * import {
 *   lambdaEventGenerator,
 *   localDynamodbSeeder,
 *   integrationTestHarness,
 *   mockEventSource,
 *   lambdaInvokeRecorder,
 *   snapshotTester,
 * } from "./testing-dev.js";
 *
 * const event = lambdaEventGenerator("api_gateway", { name: "test" });
 * const seeded = await localDynamodbSeeder("my-table", [{ id: "1" }]);
 * const results = await integrationTestHarness([
 *   { name: "basic", test: async () => { expect(true).toBe(true); } },
 * ]);
 * ```
 *
 * @module
 */

import { z } from "zod";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  BatchWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import {
  LambdaClient,
  InvokeCommand,
} from "@aws-sdk/client-lambda";
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getClient } from "./client.js";
import { wrapAwsError } from "./exceptions.js";

// ---------------------------------------------------------------------------
// Zod schemas & inferred types
// ---------------------------------------------------------------------------

/** Schema for a generated Lambda event result. */
export const LambdaEventResultSchema = z.object({
  eventType: z.string(),
  event: z.record(z.string(), z.unknown()),
});

/** A generated Lambda event result. */
export type LambdaEventResult = z.infer<typeof LambdaEventResultSchema>;

/** Schema for a DynamoDB seeder result. */
export const DynamoDBSeederResultSchema = z.object({
  tableName: z.string(),
  itemsSeeded: z.number(),
});

/** A DynamoDB seeder result. */
export type DynamoDBSeederResult = z.infer<typeof DynamoDBSeederResultSchema>;

/** Schema for an integration test result. */
export const IntegrationTestResultSchema = z.object({
  testName: z.string(),
  passed: z.boolean(),
  duration: z.number(),
  error: z.string().optional(),
});

/** An integration test result. */
export type IntegrationTestResult = z.infer<
  typeof IntegrationTestResultSchema
>;

/** Schema for a mock event source result. */
export const MockEventSourceResultSchema = z.object({
  sourceType: z.string(),
  eventsGenerated: z.number(),
});

/** A mock event source result. */
export type MockEventSourceResult = z.infer<
  typeof MockEventSourceResultSchema
>;

/** Schema for a Lambda invoke recorder result. */
export const InvokeRecordResultSchema = z.object({
  functionName: z.string(),
  invocations: z.number(),
  results: z.array(
    z.object({
      statusCode: z.number(),
      payload: z.unknown(),
    }),
  ),
});

/** A Lambda invoke recorder result. */
export type InvokeRecordResult = z.infer<typeof InvokeRecordResultSchema>;

/** Schema for a snapshot test result. */
export const SnapshotTestResultSchema = z.object({
  testName: z.string(),
  matched: z.boolean(),
  diff: z.string().optional(),
});

/** A snapshot test result. */
export type SnapshotTestResult = z.infer<typeof SnapshotTestResultSchema>;

// ---------------------------------------------------------------------------
// Trigger-type union
// ---------------------------------------------------------------------------

/** Supported Lambda trigger types for event generation. */
export type LambdaTriggerType =
  | "api_gateway"
  | "sqs"
  | "sns"
  | "s3"
  | "eventbridge"
  | "dynamodb_stream"
  | "kinesis"
  | "scheduled";

// ---------------------------------------------------------------------------
// Internal helpers — mock event templates
// ---------------------------------------------------------------------------

/**
 * Build a mock API Gateway v2 (HTTP) proxy event.
 */
function buildApiGatewayEvent(
  body?: Record<string, unknown>,
): Record<string, unknown> {
  return {
    version: "2.0",
    routeKey: "$default",
    rawPath: "/",
    rawQueryString: "",
    headers: { "content-type": "application/json" },
    requestContext: {
      accountId: "123456789012",
      apiId: "api-id",
      domainName: "id.execute-api.us-east-1.amazonaws.com",
      http: {
        method: "POST",
        path: "/",
        protocol: "HTTP/1.1",
        sourceIp: "127.0.0.1",
        userAgent: "TestAgent/1.0",
      },
      requestId: "request-id",
      routeKey: "$default",
      stage: "$default",
      time: new Date().toISOString(),
      timeEpoch: Date.now(),
    },
    body: body ? JSON.stringify(body) : null,
    isBase64Encoded: false,
  };
}

/**
 * Build a mock SQS event.
 */
function buildSqsEvent(
  body?: Record<string, unknown>,
  sourceArn?: string,
): Record<string, unknown> {
  return {
    Records: [
      {
        messageId: "msg-001",
        receiptHandle: "receipt-handle",
        body: body ? JSON.stringify(body) : "{}",
        attributes: {
          ApproximateReceiveCount: "1",
          SentTimestamp: String(Date.now()),
          SenderId: "123456789012",
          ApproximateFirstReceiveTimestamp: String(Date.now()),
        },
        messageAttributes: {},
        md5OfBody: "md5",
        eventSource: "aws:sqs",
        eventSourceARN:
          sourceArn ?? "arn:aws:sqs:us-east-1:123456789012:test-queue",
        awsRegion: "us-east-1",
      },
    ],
  };
}

/**
 * Build a mock SNS event.
 */
function buildSnsEvent(
  body?: Record<string, unknown>,
  sourceArn?: string,
): Record<string, unknown> {
  return {
    Records: [
      {
        EventVersion: "1.0",
        EventSubscriptionArn:
          sourceArn ?? "arn:aws:sns:us-east-1:123456789012:test-topic:sub-id",
        EventSource: "aws:sns",
        Sns: {
          SignatureVersion: "1",
          Timestamp: new Date().toISOString(),
          Signature: "EXAMPLE",
          SigningCertUrl: "https://example.com/cert",
          MessageId: "msg-001",
          Message: body ? JSON.stringify(body) : "{}",
          MessageAttributes: {},
          Type: "Notification",
          UnsubscribeUrl: "https://example.com/unsub",
          TopicArn:
            sourceArn ?? "arn:aws:sns:us-east-1:123456789012:test-topic",
          Subject: "Test",
        },
      },
    ],
  };
}

/**
 * Build a mock S3 event.
 */
function buildS3Event(
  body?: Record<string, unknown>,
  sourceArn?: string,
): Record<string, unknown> {
  return {
    Records: [
      {
        eventVersion: "2.1",
        eventSource: "aws:s3",
        awsRegion: "us-east-1",
        eventTime: new Date().toISOString(),
        eventName: "ObjectCreated:Put",
        s3: {
          s3SchemaVersion: "1.0",
          configurationId: "config-id",
          bucket: {
            name: body?.["bucket"] ?? "test-bucket",
            arn:
              sourceArn ??
              "arn:aws:s3:::test-bucket",
          },
          object: {
            key: body?.["key"] ?? "test-key",
            size: body?.["size"] ?? 1024,
            eTag: "etag",
          },
        },
      },
    ],
  };
}

/**
 * Build a mock EventBridge event.
 */
function buildEventBridgeEvent(
  body?: Record<string, unknown>,
  sourceArn?: string,
): Record<string, unknown> {
  return {
    version: "0",
    id: "event-id",
    "detail-type": body?.["detailType"] ?? "TestEvent",
    source: sourceArn ?? "test.source",
    account: "123456789012",
    time: new Date().toISOString(),
    region: "us-east-1",
    resources: [],
    detail: body ?? {},
  };
}

/**
 * Build a mock DynamoDB Streams event.
 */
function buildDynamoDbStreamEvent(
  body?: Record<string, unknown>,
  sourceArn?: string,
): Record<string, unknown> {
  return {
    Records: [
      {
        eventID: "event-001",
        eventName: "INSERT",
        eventVersion: "1.1",
        eventSource: "aws:dynamodb",
        awsRegion: "us-east-1",
        eventSourceARN:
          sourceArn ??
          "arn:aws:dynamodb:us-east-1:123456789012:table/test/stream/2024",
        dynamodb: {
          Keys: body?.["keys"] ?? { id: { S: "1" } },
          NewImage: body?.["newImage"] ?? { id: { S: "1" } },
          StreamViewType: "NEW_AND_OLD_IMAGES",
          SequenceNumber: "100000000000000000001",
          SizeBytes: 50,
        },
      },
    ],
  };
}

/**
 * Build a mock Kinesis event.
 */
function buildKinesisEvent(
  body?: Record<string, unknown>,
  sourceArn?: string,
): Record<string, unknown> {
  const data = body ? JSON.stringify(body) : "{}";
  const encoded =
    typeof Buffer !== "undefined"
      ? Buffer.from(data).toString("base64")
      : data;
  return {
    Records: [
      {
        kinesis: {
          kinesisSchemaVersion: "1.0",
          partitionKey: "partition-key",
          sequenceNumber: "100000000000000000001",
          data: encoded,
          approximateArrivalTimestamp: Date.now() / 1000,
        },
        eventSource: "aws:kinesis",
        eventVersion: "1.0",
        eventID: "shardId-000000000000:100000000000000000001",
        eventName: "aws:kinesis:record",
        invokeIdentityArn: "arn:aws:iam::123456789012:role/test-role",
        awsRegion: "us-east-1",
        eventSourceARN:
          sourceArn ??
          "arn:aws:kinesis:us-east-1:123456789012:stream/test-stream",
      },
    ],
  };
}

/**
 * Build a mock scheduled (CloudWatch Events / EventBridge Scheduler) event.
 */
function buildScheduledEvent(
  body?: Record<string, unknown>,
  sourceArn?: string,
): Record<string, unknown> {
  return {
    version: "0",
    id: "scheduled-event-id",
    "detail-type": "Scheduled Event",
    source: "aws.events",
    account: "123456789012",
    time: new Date().toISOString(),
    region: "us-east-1",
    resources: [
      sourceArn ??
        "arn:aws:events:us-east-1:123456789012:rule/test-rule",
    ],
    detail: body ?? {},
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generate a mock Lambda event payload for a given trigger type.
 *
 * This is a **synchronous** helper — no AWS calls are made. It constructs
 * a realistic event structure that matches the shape Lambda receives from
 * the specified event source.
 *
 * @param triggerType - The type of event source trigger.
 * @param body - Optional body / detail to embed in the event.
 * @param sourceArn - Optional source ARN to use in the event.
 * @returns A validated {@link LambdaEventResult}.
 *
 * @example
 * ```ts
 * const evt = lambdaEventGenerator("sqs", { orderId: "123" });
 * console.log(evt.event.Records); // SQS-style Records array
 * ```
 */
export function lambdaEventGenerator(
  triggerType: LambdaTriggerType,
  body?: Record<string, unknown>,
  sourceArn?: string,
): LambdaEventResult {
  const builders: Record<
    LambdaTriggerType,
    (
      b?: Record<string, unknown>,
      a?: string,
    ) => Record<string, unknown>
  > = {
    api_gateway: buildApiGatewayEvent,
    sqs: buildSqsEvent,
    sns: buildSnsEvent,
    s3: buildS3Event,
    eventbridge: buildEventBridgeEvent,
    dynamodb_stream: buildDynamoDbStreamEvent,
    kinesis: buildKinesisEvent,
    scheduled: buildScheduledEvent,
  };

  const builder = builders[triggerType];
  const event = builder(body, sourceArn);

  return LambdaEventResultSchema.parse({
    eventType: triggerType,
    event,
  });
}

/**
 * Seed a DynamoDB table with items using batch writes.
 *
 * Useful for test setup — splits items into batches of 25 (the DynamoDB
 * BatchWriteItem limit) and writes them all.
 *
 * @param tableName - The DynamoDB table name.
 * @param items - Array of items to write.
 * @param region - Optional AWS region.
 * @returns A validated {@link DynamoDBSeederResult}.
 *
 * @example
 * ```ts
 * const result = await localDynamodbSeeder("users", [
 *   { id: "1", name: "Alice" },
 *   { id: "2", name: "Bob" },
 * ]);
 * console.log(result.itemsSeeded); // 2
 * ```
 */
export async function localDynamodbSeeder(
  tableName: string,
  items: Record<string, unknown>[],
  region?: string,
): Promise<DynamoDBSeederResult> {
  try {
    const raw = getClient(DynamoDBClient, region);
    const ddb = DynamoDBDocumentClient.from(raw);
    const batchSize = 25;
    let seeded = 0;

    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const requests = batch.map((item) => ({
        PutRequest: { Item: item },
      }));

      await ddb.send(
        new BatchWriteCommand({
          RequestItems: { [tableName]: requests },
        }),
      );
      seeded += batch.length;
    }

    return DynamoDBSeederResultSchema.parse({
      tableName,
      itemsSeeded: seeded,
    });
  } catch (err) {
    throw wrapAwsError(err, "localDynamodbSeeder failed");
  }
}

/**
 * Run an integration test harness with setup/test/teardown lifecycle.
 *
 * Each test entry can optionally provide `setup` and `teardown` hooks.
 * The harness executes each test sequentially, capturing pass/fail status
 * and duration. Teardown runs even if the test fails.
 *
 * @param tests - Array of test descriptors.
 * @returns Array of validated {@link IntegrationTestResult} objects.
 *
 * @example
 * ```ts
 * const results = await integrationTestHarness([
 *   {
 *     name: "create-item",
 *     setup: async () => { await seedTable(); },
 *     test: async () => { await verifyItem(); },
 *     teardown: async () => { await cleanupTable(); },
 *   },
 * ]);
 * ```
 */
export async function integrationTestHarness(
  tests: Array<{
    name: string;
    setup?: () => Promise<void>;
    test: () => Promise<void>;
    teardown?: () => Promise<void>;
  }>,
): Promise<IntegrationTestResult[]> {
  const results: IntegrationTestResult[] = [];

  for (const entry of tests) {
    const start = Date.now();
    let passed = true;
    let error: string | undefined;

    try {
      if (entry.setup) {
        await entry.setup();
      }
      await entry.test();
    } catch (err) {
      passed = false;
      error = err instanceof Error ? err.message : String(err);
    } finally {
      try {
        if (entry.teardown) {
          await entry.teardown();
        }
      } catch {
        // Teardown errors are swallowed to avoid masking test errors
      }
    }

    const duration = Date.now() - start;
    results.push(
      IntegrationTestResultSchema.parse({
        testName: entry.name,
        passed,
        duration,
        error,
      }),
    );
  }

  return results;
}

/**
 * Generate N mock events for a given source type.
 *
 * This is a **synchronous** helper — no AWS calls are made. Each event
 * is based on the optional `template` merged with an auto-incremented
 * `eventIndex` field.
 *
 * @param sourceType - The event source type identifier.
 * @param count - Number of events to generate (default 10).
 * @param template - Optional base template for each event.
 * @returns A validated {@link MockEventSourceResult}.
 *
 * @example
 * ```ts
 * const result = mockEventSource("order-created", 5, { region: "us-east-1" });
 * console.log(result.eventsGenerated); // 5
 * ```
 */
export function mockEventSource(
  sourceType: string,
  count?: number,
  template?: Record<string, unknown>,
): MockEventSourceResult {
  const n = count ?? 10;
  // Generate events (the events themselves are produced for the caller
  // to use; the result reports how many were generated).
  const _events: Record<string, unknown>[] = [];
  for (let i = 0; i < n; i++) {
    _events.push({
      ...template,
      eventIndex: i,
      sourceType,
      timestamp: new Date().toISOString(),
    });
  }

  return MockEventSourceResultSchema.parse({
    sourceType,
    eventsGenerated: n,
  });
}

/**
 * Invoke a Lambda function with each payload and record the results.
 *
 * Payloads are invoked sequentially. Each invocation's status code and
 * decoded response payload are captured.
 *
 * @param functionName - The Lambda function name or ARN.
 * @param payloads - Array of payloads to invoke with.
 * @param region - Optional AWS region.
 * @returns A validated {@link InvokeRecordResult}.
 *
 * @example
 * ```ts
 * const record = await lambdaInvokeRecorder("my-fn", [
 *   { action: "create" },
 *   { action: "delete" },
 * ]);
 * console.log(record.invocations); // 2
 * ```
 */
export async function lambdaInvokeRecorder(
  functionName: string,
  payloads: unknown[],
  region?: string,
): Promise<InvokeRecordResult> {
  try {
    const lambda = getClient(LambdaClient, region);
    const results: Array<{ statusCode: number; payload: unknown }> = [];

    for (const payload of payloads) {
      const encoder = new TextEncoder();
      const response = await lambda.send(
        new InvokeCommand({
          FunctionName: functionName,
          Payload: encoder.encode(JSON.stringify(payload)),
        }),
      );

      let decoded: unknown = null;
      if (response.Payload) {
        const decoder = new TextDecoder();
        const raw = decoder.decode(response.Payload);
        try {
          decoded = JSON.parse(raw);
        } catch {
          decoded = raw;
        }
      }

      results.push({
        statusCode: response.StatusCode ?? 0,
        payload: decoded,
      });
    }

    return InvokeRecordResultSchema.parse({
      functionName,
      invocations: results.length,
      results,
    });
  } catch (err) {
    throw wrapAwsError(err, "lambdaInvokeRecorder failed");
  }
}

/**
 * Compare an actual value against a stored S3 snapshot.
 *
 * On first run (snapshot does not exist), stores the actual value as the
 * baseline snapshot and returns `matched: true`. On subsequent runs,
 * fetches the stored snapshot from S3 and compares it to the actual value
 * using JSON serialisation.
 *
 * @param testName - Human-readable name of the snapshot test.
 * @param actual - The current value to compare.
 * @param snapshotBucket - S3 bucket holding snapshots.
 * @param snapshotKey - S3 key for the snapshot.
 * @param region - Optional AWS region.
 * @returns A validated {@link SnapshotTestResult}.
 *
 * @example
 * ```ts
 * const snap = await snapshotTester(
 *   "user-list",
 *   users,
 *   "test-snapshots",
 *   "snapshots/user-list.json",
 * );
 * console.log(snap.matched); // true if unchanged
 * ```
 */
export async function snapshotTester(
  testName: string,
  actual: unknown,
  snapshotBucket: string,
  snapshotKey: string,
  region?: string,
): Promise<SnapshotTestResult> {
  try {
    const s3 = getClient(S3Client, region);
    const actualJson = JSON.stringify(actual, null, 2);

    let storedJson: string | undefined;

    try {
      const response = await s3.send(
        new GetObjectCommand({
          Bucket: snapshotBucket,
          Key: snapshotKey,
        }),
      );
      storedJson = await response.Body?.transformToString();
    } catch (err) {
      // If snapshot doesn't exist, we treat this as first run
      const code =
        err != null && typeof err === "object"
          ? (err as Record<string, unknown>)["name"]
          : undefined;
      if (code !== "NoSuchKey" && code !== "NotFound") {
        throw err;
      }
    }

    // First run — store the snapshot as baseline
    if (storedJson === undefined) {
      await s3.send(
        new PutObjectCommand({
          Bucket: snapshotBucket,
          Key: snapshotKey,
          Body: actualJson,
          ContentType: "application/json",
        }),
      );
      return SnapshotTestResultSchema.parse({
        testName,
        matched: true,
      });
    }

    // Compare
    const matched = actualJson === storedJson;
    let diff: string | undefined;
    if (!matched) {
      diff = `Expected:\n${storedJson}\n\nActual:\n${actualJson}`;
    }

    return SnapshotTestResultSchema.parse({
      testName,
      matched,
      diff,
    });
  } catch (err) {
    throw wrapAwsError(err, "snapshotTester failed");
  }
}
