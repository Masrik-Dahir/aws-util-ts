/**
 * aws-util/messaging — Multi-service messaging and notification utilities.
 *
 * Provides typed helpers for multi-channel notifications (SNS, SQS, SES,
 * EventBridge), event deduplication via DynamoDB conditional writes,
 * SNS filter policy management, SQS FIFO message sequencing, and
 * batch notification digesting.
 *
 * Multi-service: SNS + SQS + SES + DynamoDB + EventBridge.
 *
 * All async functions obtain clients via {@link getClient} and wrap errors
 * through {@link wrapAwsError}.
 *
 * @example
 * ```ts
 * import {
 *   multiChannelNotifier,
 *   eventDeduplicator,
 *   snsFilterPolicyManager,
 *   sqsFifoSequencer,
 *   batchNotificationDigester,
 * } from "./messaging.js";
 *
 * const result = await multiChannelNotifier("Hello!", [
 *   { type: "sns", target: "arn:aws:sns:us-east-1:123:topic" },
 *   { type: "ses", target: "user@example.com", subject: "Alert" },
 * ]);
 * ```
 *
 * @module
 */

import { z } from "zod";
import {
  SNSClient,
  PublishCommand,
  SetSubscriptionAttributesCommand,
} from "@aws-sdk/client-sns";
import {
  SQSClient,
  SendMessageCommand,
} from "@aws-sdk/client-sqs";
import {
  SESClient,
  SendEmailCommand,
} from "@aws-sdk/client-ses";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";
import {
  EventBridgeClient,
  PutEventsCommand,
} from "@aws-sdk/client-eventbridge";
import { getClient } from "./client.js";
import { wrapAwsError } from "./exceptions.js";

// ---------------------------------------------------------------------------
// Zod schemas & inferred types
// ---------------------------------------------------------------------------

/** Schema for a notification channel configuration. */
export const ChannelConfigSchema = z.object({
  type: z.enum(["sns", "sqs", "ses", "eventbridge"]),
  target: z.string(),
  subject: z.string().optional(),
});

/** A notification channel configuration. */
export type ChannelConfig = z.infer<typeof ChannelConfigSchema>;

/** Schema for a single channel delivery result. */
export const ChannelResultSchema = z.object({
  channel: z.string(),
  success: z.boolean(),
  messageId: z.string().optional(),
  error: z.string().optional(),
});

/** A single channel delivery result. */
export type ChannelResult = z.infer<typeof ChannelResultSchema>;

/** Schema for the multi-channel notifier aggregate result. */
export const MultiChannelNotifierResultSchema = z.object({
  results: z.array(ChannelResultSchema),
  sent: z.number(),
  failed: z.number(),
});

/** Multi-channel notifier aggregate result. */
export type MultiChannelNotifierResult = z.infer<
  typeof MultiChannelNotifierResultSchema
>;

/** Schema for an event deduplication result. */
export const EventDeduplicationResultSchema = z.object({
  eventId: z.string(),
  isDuplicate: z.boolean(),
  firstSeenAt: z.string().optional(),
});

/** An event deduplication result. */
export type EventDeduplicationResult = z.infer<
  typeof EventDeduplicationResultSchema
>;

/** Schema for a filter policy management result. */
export const FilterPolicyResultSchema = z.object({
  subscriptionArn: z.string(),
  filterPolicy: z.record(z.string(), z.unknown()),
});

/** A filter policy management result. */
export type FilterPolicyResult = z.infer<typeof FilterPolicyResultSchema>;

/** Schema for a FIFO message result. */
export const FifoMessageResultSchema = z.object({
  messageId: z.string(),
  sequenceNumber: z.string(),
});

/** A FIFO message result. */
export type FifoMessageResult = z.infer<typeof FifoMessageResultSchema>;

/** Schema for a digest event. */
export const DigestEventSchema = z.object({
  source: z.string(),
  message: z.string(),
  timestamp: z.string(),
});

/** A digest event. */
export type DigestEvent = z.infer<typeof DigestEventSchema>;

/** Schema for a digest flush result. */
export const DigestFlushResultSchema = z.object({
  digestsSent: z.number(),
  eventsProcessed: z.number(),
});

/** A digest flush result. */
export type DigestFlushResult = z.infer<typeof DigestFlushResultSchema>;

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Send a message to a single SNS topic.
 */
async function sendToSns(
  message: string,
  target: string,
  subject: string | undefined,
  region?: string,
): Promise<ChannelResult> {
  try {
    const sns = getClient(SNSClient, region);
    const response = await sns.send(
      new PublishCommand({
        TopicArn: target,
        Message: message,
        Subject: subject,
      }),
    );
    return {
      channel: `sns:${target}`,
      success: true,
      messageId: response.MessageId,
    };
  } catch (err) {
    return {
      channel: `sns:${target}`,
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * Send a message to a single SQS queue.
 */
async function sendToSqs(
  message: string,
  target: string,
  region?: string,
): Promise<ChannelResult> {
  try {
    const sqs = getClient(SQSClient, region);
    const response = await sqs.send(
      new SendMessageCommand({
        QueueUrl: target,
        MessageBody: message,
      }),
    );
    return {
      channel: `sqs:${target}`,
      success: true,
      messageId: response.MessageId,
    };
  } catch (err) {
    return {
      channel: `sqs:${target}`,
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * Send an email via SES.
 */
async function sendToSes(
  message: string,
  target: string,
  subject: string | undefined,
  region?: string,
): Promise<ChannelResult> {
  try {
    const ses = getClient(SESClient, region);
    const response = await ses.send(
      new SendEmailCommand({
        Destination: { ToAddresses: [target] },
        Message: {
          Subject: { Data: subject ?? "Notification" },
          Body: { Text: { Data: message } },
        },
        Source: target, // uses target as source for simplicity
      }),
    );
    return {
      channel: `ses:${target}`,
      success: true,
      messageId: response.MessageId,
    };
  } catch (err) {
    return {
      channel: `ses:${target}`,
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * Send a message to EventBridge.
 */
async function sendToEventBridge(
  message: string,
  target: string,
  region?: string,
): Promise<ChannelResult> {
  try {
    const eb = getClient(EventBridgeClient, region);
    const response = await eb.send(
      new PutEventsCommand({
        Entries: [
          {
            Source: "aws-util.messaging",
            DetailType: "Notification",
            Detail: JSON.stringify({ message }),
            EventBusName: target,
          },
        ],
      }),
    );
    const entry = response.Entries?.[0];
    if (entry?.ErrorCode) {
      return {
        channel: `eventbridge:${target}`,
        success: false,
        error: `${entry.ErrorCode}: ${entry.ErrorMessage ?? ""}`,
      };
    }
    return {
      channel: `eventbridge:${target}`,
      success: true,
      messageId: entry?.EventId,
    };
  } catch (err) {
    return {
      channel: `eventbridge:${target}`,
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Send a message to multiple notification channels concurrently.
 *
 * Supports SNS topics, SQS queues, SES email, and EventBridge event buses.
 * Each channel is attempted independently — individual channel failures do
 * not prevent delivery to other channels.
 *
 * @param message - The notification message body.
 * @param channels - Array of channel configurations.
 * @param region - Optional AWS region.
 * @returns A validated {@link MultiChannelNotifierResult}.
 *
 * @example
 * ```ts
 * const result = await multiChannelNotifier("Deploy complete!", [
 *   { type: "sns", target: "arn:aws:sns:us-east-1:123:deploys" },
 *   { type: "sqs", target: "https://sqs.us-east-1.amazonaws.com/123/queue" },
 *   { type: "ses", target: "ops@example.com", subject: "Deploy Alert" },
 * ]);
 * ```
 */
export async function multiChannelNotifier(
  message: string,
  channels: ChannelConfig[],
  region?: string,
): Promise<MultiChannelNotifierResult> {
  const promises = channels.map((ch) => {
    switch (ch.type) {
      case "sns":
        return sendToSns(message, ch.target, ch.subject, region);
      case "sqs":
        return sendToSqs(message, ch.target, region);
      case "ses":
        return sendToSes(message, ch.target, ch.subject, region);
      case "eventbridge":
        return sendToEventBridge(message, ch.target, region);
    }
  });

  const results = await Promise.all(promises);
  const sent = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  return MultiChannelNotifierResultSchema.parse({
    results,
    sent,
    failed,
  });
}

/**
 * Deduplicate events using DynamoDB conditional writes.
 *
 * Attempts a conditional `PutItem` that succeeds only if the event ID
 * does not already exist. If the write succeeds, the event is new. If
 * it fails with `ConditionalCheckFailedException`, the event is a duplicate.
 * An optional TTL is set for automatic cleanup.
 *
 * @param eventId - Unique event identifier.
 * @param tableName - DynamoDB table name for deduplication records.
 * @param ttlSeconds - Optional TTL in seconds (default 86400 = 24h).
 * @param region - Optional AWS region.
 * @returns A validated {@link EventDeduplicationResult}.
 *
 * @example
 * ```ts
 * const dedup = await eventDeduplicator("order-123", "event-dedup", 3600);
 * if (dedup.isDuplicate) {
 *   console.log("Already processed");
 * }
 * ```
 */
export async function eventDeduplicator(
  eventId: string,
  tableName: string,
  ttlSeconds?: number,
  region?: string,
): Promise<EventDeduplicationResult> {
  try {
    const ttl = ttlSeconds ?? 86400;
    const now = new Date().toISOString();
    const expiresAt = Math.floor(Date.now() / 1000) + ttl;
    const raw = getClient(DynamoDBClient, region);
    const ddb = DynamoDBDocumentClient.from(raw);

    try {
      await ddb.send(
        new PutCommand({
          TableName: tableName,
          Item: {
            eventId,
            firstSeenAt: now,
            expiresAt,
          },
          ConditionExpression: "attribute_not_exists(eventId)",
        }),
      );

      return EventDeduplicationResultSchema.parse({
        eventId,
        isDuplicate: false,
        firstSeenAt: now,
      });
    } catch (condErr) {
      const code =
        condErr != null && typeof condErr === "object"
          ? (condErr as Record<string, unknown>)["name"]
          : undefined;
      if (code === "ConditionalCheckFailedException") {
        return EventDeduplicationResultSchema.parse({
          eventId,
          isDuplicate: true,
        });
      }
      throw condErr;
    }
  } catch (err) {
    throw wrapAwsError(err, "eventDeduplicator failed");
  }
}

/**
 * Set or update an SNS subscription filter policy.
 *
 * Uses `SetSubscriptionAttributes` to apply the given filter policy
 * to the specified subscription.
 *
 * @param subscriptionArn - The SNS subscription ARN.
 * @param filterPolicy - The filter policy object.
 * @param region - Optional AWS region.
 * @returns A validated {@link FilterPolicyResult}.
 *
 * @example
 * ```ts
 * const result = await snsFilterPolicyManager(
 *   "arn:aws:sns:us-east-1:123:topic:sub-id",
 *   { eventType: ["order_created", "order_updated"] },
 * );
 * ```
 */
export async function snsFilterPolicyManager(
  subscriptionArn: string,
  filterPolicy: Record<string, unknown>,
  region?: string,
): Promise<FilterPolicyResult> {
  try {
    const sns = getClient(SNSClient, region);

    await sns.send(
      new SetSubscriptionAttributesCommand({
        SubscriptionArn: subscriptionArn,
        AttributeName: "FilterPolicy",
        AttributeValue: JSON.stringify(filterPolicy),
      }),
    );

    return FilterPolicyResultSchema.parse({
      subscriptionArn,
      filterPolicy,
    });
  } catch (err) {
    throw wrapAwsError(err, "snsFilterPolicyManager failed");
  }
}

/**
 * Send a message to an SQS FIFO queue with ordering and deduplication.
 *
 * Automatically handles `MessageGroupId` for ordering and optional
 * `MessageDeduplicationId`. If the body is an object, it is serialised
 * to JSON.
 *
 * @param queueUrl - The SQS FIFO queue URL.
 * @param body - Message body (string or object).
 * @param messageGroupId - The FIFO message group ID for ordering.
 * @param deduplicationId - Optional deduplication ID.
 * @param region - Optional AWS region.
 * @returns A validated {@link FifoMessageResult}.
 *
 * @example
 * ```ts
 * const result = await sqsFifoSequencer(
 *   "https://sqs.us-east-1.amazonaws.com/123/queue.fifo",
 *   { orderId: "123", action: "process" },
 *   "order-123",
 * );
 * ```
 */
export async function sqsFifoSequencer(
  queueUrl: string,
  body: string | object,
  messageGroupId: string,
  deduplicationId?: string,
  region?: string,
): Promise<FifoMessageResult> {
  try {
    const sqs = getClient(SQSClient, region);
    const messageBody =
      typeof body === "string" ? body : JSON.stringify(body);

    const input: Record<string, unknown> = {
      QueueUrl: queueUrl,
      MessageBody: messageBody,
      MessageGroupId: messageGroupId,
    };
    if (deduplicationId) {
      input["MessageDeduplicationId"] = deduplicationId;
    }

    const response = await sqs.send(
      new SendMessageCommand(
        input as {
          QueueUrl: string;
          MessageBody: string;
          MessageGroupId: string;
          MessageDeduplicationId?: string;
        },
      ),
    );

    return FifoMessageResultSchema.parse({
      messageId: response.MessageId ?? "",
      sequenceNumber: response.SequenceNumber ?? "",
    });
  } catch (err) {
    throw wrapAwsError(err, "sqsFifoSequencer failed");
  }
}

/**
 * Group events into digests and send a summary per group to channels.
 *
 * Events are grouped by the specified `groupBy` field (defaults to
 * `"source"`). Each group is formatted into a digest message and sent
 * to all configured channels via {@link multiChannelNotifier}.
 *
 * @param events - Array of digest events to process.
 * @param channels - Array of channel configurations.
 * @param groupBy - Field name to group by (default "source").
 * @param region - Optional AWS region.
 * @returns A validated {@link DigestFlushResult}.
 *
 * @example
 * ```ts
 * const result = await batchNotificationDigester(
 *   [
 *     { source: "orders", message: "New order", timestamp: "..." },
 *     { source: "orders", message: "Order shipped", timestamp: "..." },
 *     { source: "alerts", message: "CPU high", timestamp: "..." },
 *   ],
 *   [{ type: "sns", target: "arn:aws:sns:us-east-1:123:digest" }],
 * );
 * console.log(result.digestsSent); // 2 (one per group)
 * ```
 */
export async function batchNotificationDigester(
  events: DigestEvent[],
  channels: ChannelConfig[],
  groupBy?: string,
  region?: string,
): Promise<DigestFlushResult> {
  try {
    const field = groupBy ?? "source";
    const groups: Record<string, DigestEvent[]> = {};

    for (const event of events) {
      const key =
        (event as unknown as Record<string, string>)[field] ??
        "default";
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(event);
    }

    let digestsSent = 0;

    for (const [groupKey, groupEvents] of Object.entries(groups)) {
      const lines = groupEvents.map(
        (e) => `[${e.timestamp}] ${e.source}: ${e.message}`,
      );
      const digestMessage =
        `Digest for "${groupKey}" ` +
        `(${groupEvents.length} events):\n` +
        lines.join("\n");

      await multiChannelNotifier(digestMessage, channels, region);
      digestsSent++;
    }

    return DigestFlushResultSchema.parse({
      digestsSent,
      eventsProcessed: events.length,
    });
  } catch (err) {
    throw wrapAwsError(err, "batchNotificationDigester failed");
  }
}
