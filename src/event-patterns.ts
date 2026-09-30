/**
 * aws-util/event-patterns — Event-driven architecture patterns.
 *
 * Multi-service module combining DynamoDB + SNS + SQS + EventBridge + S3
 * to provide transactional outbox processing, dead-letter queue escalation
 * chains, and event sourcing storage.
 *
 * All functions obtain clients via {@link getClient} and wrap errors
 * through {@link wrapAwsError}.
 *
 * @example
 * ```ts
 * import {
 *   transactionalOutboxProcessor,
 *   dlqEscalationChain,
 *   eventSourcingStore,
 * } from "./event-patterns.js";
 *
 * const outbox = await transactionalOutboxProcessor(
 *   "outbox-table",
 *   "arn:aws:sns:us-east-1:123456789012:events",
 * );
 * ```
 *
 * @module
 */

import { z } from "zod";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  UpdateCommand,
  PutCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import {
  SNSClient,
  PublishCommand,
} from "@aws-sdk/client-sns";
import {
  SQSClient,
  GetQueueAttributesCommand,
} from "@aws-sdk/client-sqs";
import { getClient } from "./client.js";
import { wrapAwsError } from "./exceptions.js";

// ---------------------------------------------------------------------------
// Zod schemas & inferred types
// ---------------------------------------------------------------------------

/** Schema for transactional outbox processor results. */
export const OutboxProcessorResultSchema = z.object({
  processed: z.number(),
  published: z.number(),
  failed: z.number(),
});

/** Result of outbox processing. */
export type OutboxProcessorResult = z.infer<
  typeof OutboxProcessorResultSchema
>;

/** Schema for DLQ escalation chain results. */
export const DLQEscalationResultSchema = z.object({
  queueUrl: z.string(),
  messageCount: z.number(),
  escalationLevel: z.number(),
  notified: z.boolean(),
});

/** Result of DLQ escalation. */
export type DLQEscalationResult = z.infer<
  typeof DLQEscalationResultSchema
>;

/** Schema for event sourcing store results. */
export const EventSourcingResultSchema = z.object({
  eventId: z.string(),
  aggregateId: z.string(),
  eventType: z.string(),
  version: z.number(),
  stored: z.boolean(),
});

/** Result of event sourcing store operation. */
export type EventSourcingResult = z.infer<
  typeof EventSourcingResultSchema
>;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Process a transactional outbox table.
 *
 * Scans a DynamoDB outbox table for unprocessed events, publishes each
 * to the specified SNS topic, then marks them as processed. This
 * implements the transactional outbox pattern for reliable event
 * publishing.
 *
 * @param tableName - DynamoDB outbox table name.
 * @param topicArn - SNS topic ARN to publish events to.
 * @param batchSize - Maximum number of items to process. Defaults to 25.
 * @param region - AWS region. Defaults to SDK default.
 * @returns Processing result with counts of processed, published, and failed.
 *
 * @example
 * ```ts
 * const result = await transactionalOutboxProcessor(
 *   "orders-outbox",
 *   "arn:aws:sns:us-east-1:123456789012:order-events",
 *   50,
 * );
 * ```
 */
export async function transactionalOutboxProcessor(
  tableName: string,
  topicArn: string,
  batchSize?: number,
  region?: string,
): Promise<OutboxProcessorResult> {
  try {
    const ddb = DynamoDBDocumentClient.from(
      getClient(DynamoDBClient, region),
    );
    const sns = getClient(SNSClient, region);
    const limit = batchSize ?? 25;

    // Scan for unprocessed outbox items
    const scanResp = await ddb.send(
      new ScanCommand({
        TableName: tableName,
        FilterExpression:
          "attribute_not_exists(processed) OR processed = :f",
        ExpressionAttributeValues: { ":f": false },
        Limit: limit,
      }),
    );

    const items = scanResp.Items ?? [];
    let published = 0;
    let failed = 0;

    for (const item of items) {
      try {
        await sns.send(
          new PublishCommand({
            TopicArn: topicArn,
            Message: JSON.stringify(item),
            MessageAttributes: {
              eventType: {
                DataType: "String",
                StringValue:
                  String(item["eventType"] ?? "unknown"),
              },
            },
          }),
        );

        // Mark as processed
        await ddb.send(
          new UpdateCommand({
            TableName: tableName,
            Key: { id: item["id"] },
            UpdateExpression:
              "SET processed = :t, processedAt = :now",
            ExpressionAttributeValues: {
              ":t": true,
              ":now": new Date().toISOString(),
            },
          }),
        );

        published += 1;
      } catch (_itemErr) {
        failed += 1;
      }
    }

    const result: OutboxProcessorResult = {
      processed: items.length,
      published,
      failed,
    };
    return OutboxProcessorResultSchema.parse(result);
  } catch (err) {
    throw wrapAwsError(
      err,
      "transactionalOutboxProcessor failed",
    );
  }
}

/**
 * Escalation chain for dead-letter queues.
 *
 * Checks the approximate message count of a DLQ and escalates through
 * a chain of SNS topics based on configurable thresholds. Higher
 * message counts trigger higher escalation levels.
 *
 * @param queueUrl - SQS queue URL (DLQ).
 * @param escalationTopics - Ordered list of SNS topic ARNs for escalation.
 * @param thresholds - Message count thresholds for each escalation level.
 * @param region - AWS region. Defaults to SDK default.
 * @returns Escalation result with current level and notification status.
 *
 * @example
 * ```ts
 * const result = await dlqEscalationChain(
 *   "https://sqs.us-east-1.amazonaws.com/123456789012/my-dlq",
 *   [
 *     "arn:aws:sns:...:low-priority",
 *     "arn:aws:sns:...:medium-priority",
 *     "arn:aws:sns:...:high-priority",
 *   ],
 *   [10, 100, 1000],
 * );
 * ```
 */
export async function dlqEscalationChain(
  queueUrl: string,
  escalationTopics: string[],
  thresholds: number[],
  region?: string,
): Promise<DLQEscalationResult> {
  try {
    const sqs = getClient(SQSClient, region);
    const sns = getClient(SNSClient, region);

    // Get approximate message count
    const attrResp = await sqs.send(
      new GetQueueAttributesCommand({
        QueueUrl: queueUrl,
        AttributeNames: ["ApproximateNumberOfMessages"],
      }),
    );

    const messageCount = parseInt(
      attrResp.Attributes?.["ApproximateNumberOfMessages"] ??
        "0",
      10,
    );

    // Determine escalation level
    let escalationLevel = 0;
    for (let i = 0; i < thresholds.length; i++) {
      if (messageCount >= thresholds[i]) {
        escalationLevel = i + 1;
      }
    }

    // Send notification if escalation is needed
    let notified = false;
    if (escalationLevel > 0 && escalationLevel <= escalationTopics.length) {
      const topicArn = escalationTopics[escalationLevel - 1];
      await sns.send(
        new PublishCommand({
          TopicArn: topicArn,
          Subject: `DLQ Escalation Level ${escalationLevel}: ${queueUrl}`,
          Message: JSON.stringify(
            {
              queueUrl,
              messageCount,
              escalationLevel,
              threshold: thresholds[escalationLevel - 1],
            },
            null,
            2,
          ),
        }),
      );
      notified = true;
    }

    const result: DLQEscalationResult = {
      queueUrl,
      messageCount,
      escalationLevel,
      notified,
    };
    return DLQEscalationResultSchema.parse(result);
  } catch (err) {
    throw wrapAwsError(err, "dlqEscalationChain failed");
  }
}

/**
 * Store an event in an event sourcing table.
 *
 * Appends a versioned event to a DynamoDB event store table using a
 * conditional put to enforce version ordering. The aggregate's current
 * version is queried first, and the new event is written with version + 1.
 *
 * @param tableName - DynamoDB event store table name.
 * @param aggregateId - Aggregate identifier (partition key).
 * @param eventType - Type of the event (e.g. "OrderCreated").
 * @param eventData - Event payload data.
 * @param region - AWS region. Defaults to SDK default.
 * @returns Event sourcing result with event ID and version.
 *
 * @example
 * ```ts
 * const result = await eventSourcingStore(
 *   "event-store",
 *   "order-123",
 *   "OrderCreated",
 *   { customerId: "cust-456", total: 99.99 },
 * );
 * ```
 */
export async function eventSourcingStore(
  tableName: string,
  aggregateId: string,
  eventType: string,
  eventData: Record<string, unknown>,
  region?: string,
): Promise<EventSourcingResult> {
  try {
    const ddb = DynamoDBDocumentClient.from(
      getClient(DynamoDBClient, region),
    );

    // Query for the latest version of this aggregate
    const queryResp = await ddb.send(
      new QueryCommand({
        TableName: tableName,
        KeyConditionExpression: "aggregateId = :aid",
        ExpressionAttributeValues: { ":aid": aggregateId },
        ScanIndexForward: false,
        Limit: 1,
      }),
    );

    const latestVersion =
      queryResp.Items?.[0]?.["version"] !== undefined
        ? Number(queryResp.Items[0]["version"])
        : 0;
    const newVersion = latestVersion + 1;
    const eventId = `${aggregateId}-${newVersion}-${Date.now()}`;

    // Conditional put to enforce version ordering
    await ddb.send(
      new PutCommand({
        TableName: tableName,
        Item: {
          aggregateId,
          version: newVersion,
          eventId,
          eventType,
          eventData,
          timestamp: new Date().toISOString(),
        },
        ConditionExpression:
          "attribute_not_exists(aggregateId) AND attribute_not_exists(version)",
      }),
    );

    const result: EventSourcingResult = {
      eventId,
      aggregateId,
      eventType,
      version: newVersion,
      stored: true,
    };
    return EventSourcingResultSchema.parse(result);
  } catch (err) {
    throw wrapAwsError(err, "eventSourcingStore failed");
  }
}
