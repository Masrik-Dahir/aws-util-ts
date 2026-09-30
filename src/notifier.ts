/**
 * aws-util/notifier — Multi-service notification orchestration via SNS + SES + SQS.
 *
 * Provides typed helpers for sending alerts across multiple channels
 * (SNS topics, SES emails, SQS queues), broadcasting to fan-out targets,
 * wrapping functions with exception-triggered notifications, and resolving
 * SSM-based channel configuration.
 *
 * All functions obtain clients via {@link getClient} and wrap errors
 * through {@link wrapAwsError}.
 *
 * @example
 * ```ts
 * import { sendAlert, broadcast, notifyOnException } from "./notifier.js";
 *
 * const results = await sendAlert("Server down!", [
 *   { type: "sns", target: "arn:aws:sns:us-east-1:123:alerts" },
 *   { type: "ses", target: "admin@example.com", subject: "Alert" },
 *   { type: "sqs", target: "https://sqs.us-east-1.amazonaws.com/123/dlq" },
 * ]);
 *
 * const safeHandler = await notifyOnException(handler, [
 *   { type: "sns", target: topicArn },
 * ]);
 * ```
 *
 * @module
 */

import { z } from "zod";
import {
  SNSClient,
  PublishCommand,
} from "@aws-sdk/client-sns";
import {
  SESClient,
  SendEmailCommand,
} from "@aws-sdk/client-ses";
import {
  SQSClient,
  SendMessageCommand,
} from "@aws-sdk/client-sqs";
import {
  SSMClient,
  GetParameterCommand,
} from "@aws-sdk/client-ssm";
import { getClient } from "./client.js";
import { wrapAwsError } from "./exceptions.js";

// ---------------------------------------------------------------------------
// Zod schemas & inferred types
// ---------------------------------------------------------------------------

/** Schema for the result of a single notification send. */
export const NotificationResultSchema = z.object({
  channel: z.string(),
  success: z.boolean(),
  messageId: z.string().optional(),
  error: z.string().optional(),
});

/** Result of sending a notification to a single channel. */
export type NotificationResult = z.infer<typeof NotificationResultSchema>;

/** Schema for the result of a broadcast operation. */
export const BroadcastResultSchema = z.object({
  results: z.array(NotificationResultSchema),
  successCount: z.number(),
  failureCount: z.number(),
});

/** Result of a broadcast operation across multiple channels. */
export type BroadcastResult = z.infer<typeof BroadcastResultSchema>;

// ---------------------------------------------------------------------------
// Channel type
// ---------------------------------------------------------------------------

/** A notification channel descriptor. */
export interface NotificationChannel {
  type: "sns" | "ses" | "sqs";
  target: string;
  subject?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Get a cached SNSClient for the given region.
 */
function sns(region?: string): SNSClient {
  return getClient(SNSClient, region);
}

/**
 * Get a cached SESClient for the given region.
 */
function ses(region?: string): SESClient {
  return getClient(SESClient, region);
}

/**
 * Get a cached SQSClient for the given region.
 */
function sqs(region?: string): SQSClient {
  return getClient(SQSClient, region);
}

/**
 * Get a cached SSMClient for the given region.
 */
function ssm(region?: string): SSMClient {
  return getClient(SSMClient, region);
}

/**
 * Send a message to a single SNS topic.
 */
async function sendToSns(
  topicArn: string,
  message: string,
  subject?: string,
  region?: string,
): Promise<NotificationResult> {
  try {
    const resp = await sns(region).send(
      new PublishCommand({
        TopicArn: topicArn,
        Message: message,
        Subject: subject,
      }),
    );
    return {
      channel: `sns:${topicArn}`,
      success: true,
      messageId: resp.MessageId,
    };
  } catch (err) {
    const wrapped = wrapAwsError(err);
    return {
      channel: `sns:${topicArn}`,
      success: false,
      error: wrapped.message,
    };
  }
}

/**
 * Send an email via SES.
 */
async function sendToSes(
  emailAddress: string,
  message: string,
  subject?: string,
  region?: string,
): Promise<NotificationResult> {
  try {
    const resp = await ses(region).send(
      new SendEmailCommand({
        Source: emailAddress,
        Destination: { ToAddresses: [emailAddress] },
        Message: {
          Subject: { Data: subject ?? "Notification" },
          Body: { Text: { Data: message } },
        },
      }),
    );
    return {
      channel: `ses:${emailAddress}`,
      success: true,
      messageId: resp.MessageId,
    };
  } catch (err) {
    const wrapped = wrapAwsError(err);
    return {
      channel: `ses:${emailAddress}`,
      success: false,
      error: wrapped.message,
    };
  }
}

/**
 * Send a message to an SQS queue.
 */
async function sendToSqs(
  queueUrl: string,
  message: string,
  region?: string,
): Promise<NotificationResult> {
  try {
    const resp = await sqs(region).send(
      new SendMessageCommand({
        QueueUrl: queueUrl,
        MessageBody: message,
      }),
    );
    return {
      channel: `sqs:${queueUrl}`,
      success: true,
      messageId: resp.MessageId,
    };
  } catch (err) {
    const wrapped = wrapAwsError(err);
    return {
      channel: `sqs:${queueUrl}`,
      success: false,
      error: wrapped.message,
    };
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Send an alert message to multiple notification channels concurrently.
 *
 * Each channel is attempted independently. Failures on one channel do not
 * prevent delivery to other channels.
 *
 * @param message - The alert message body.
 * @param channels - Array of channel descriptors (SNS, SES, or SQS).
 * @param region - AWS region override.
 * @returns Array of notification results, one per channel.
 */
export async function sendAlert(
  message: string,
  channels: NotificationChannel[],
  region?: string,
): Promise<NotificationResult[]> {
  const promises = channels.map((channel) => {
    switch (channel.type) {
      case "sns":
        return sendToSns(channel.target, message, channel.subject, region);
      case "ses":
        return sendToSes(channel.target, message, channel.subject, region);
      case "sqs":
        return sendToSqs(channel.target, message, region);
    }
  });

  return Promise.all(promises);
}

/**
 * Wrap an async function with exception-triggered notification.
 *
 * Returns a new function with the same signature. If the original function
 * throws, the error message is sent to all specified channels before the
 * error is re-thrown.
 *
 * @param fn - The async function to wrap.
 * @param channels - Channels to notify on exception.
 * @param region - AWS region override.
 * @returns A wrapped function that notifies on exception.
 */
export async function notifyOnException<
  TArgs extends unknown[],
  TReturn,
>(
  fn: (...args: TArgs) => Promise<TReturn>,
  channels: NotificationChannel[],
  region?: string,
): Promise<(...args: TArgs) => Promise<TReturn>> {
  return async (...args: TArgs): Promise<TReturn> => {
    try {
      return await fn(...args);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : String(err);
      const alertMessage = `Exception caught: ${errorMessage}`;

      // Fire-and-forget: notify all channels but don't let notification
      // failures mask the original error
      try {
        await sendAlert(alertMessage, channels, region);
      } catch {
        // Swallow notification errors to preserve original exception
      }

      throw err;
    }
  };
}

/**
 * Broadcast a message to multiple SNS topics, SQS queues, and email addresses.
 *
 * Fan-out to all specified targets concurrently. Returns aggregated results
 * with success and failure counts.
 *
 * @param message - The message body to broadcast.
 * @param topicArns - SNS topic ARNs to publish to.
 * @param queueUrls - SQS queue URLs to send to (optional).
 * @param emailAddresses - Email addresses to send via SES (optional).
 * @param region - AWS region override.
 * @returns Aggregated broadcast results.
 */
export async function broadcast(
  message: string,
  topicArns: string[],
  queueUrls?: string[],
  emailAddresses?: string[],
  region?: string,
): Promise<BroadcastResult> {
  const channels: NotificationChannel[] = [];

  for (const arn of topicArns) {
    channels.push({ type: "sns", target: arn });
  }
  for (const url of queueUrls ?? []) {
    channels.push({ type: "sqs", target: url });
  }
  for (const email of emailAddresses ?? []) {
    channels.push({ type: "ses", target: email });
  }

  const results = await sendAlert(message, channels, region);

  const successCount = results.filter((r) => r.success).length;
  const failureCount = results.filter((r) => !r.success).length;

  return BroadcastResultSchema.parse({
    results,
    successCount,
    failureCount,
  });
}

/**
 * Resolve SSM parameter placeholders in channel targets, then send notifications.
 *
 * Channel config is a map of channel descriptors like:
 * ```json
 * {
 *   "sns:alerts": "${ssm:/app/prod/alert-topic-arn}",
 *   "sqs:deadletter": "${ssm:/app/prod/dlq-url}",
 *   "ses:admin": "admin@example.com"
 * }
 * ```
 *
 * Keys are `type:label` strings. Values may contain `${ssm:...}` placeholders
 * that are resolved before sending.
 *
 * @param message - The message body to send.
 * @param channelConfig - Map of channel descriptors to target values.
 * @param region - AWS region override.
 * @returns Array of notification results.
 */
export async function resolveAndNotify(
  message: string,
  channelConfig: Record<string, string>,
  region?: string,
): Promise<NotificationResult[]> {
  const ssmPattern = /\$\{ssm:([^}]+)\}/g;

  // Collect all SSM references
  const ssmRefs = new Set<string>();
  for (const value of Object.values(channelConfig)) {
    for (const match of value.matchAll(ssmPattern)) {
      ssmRefs.add(match[1]);
    }
  }

  // Resolve all SSM parameters concurrently
  const ssmValues = new Map<string, string>();
  if (ssmRefs.size > 0) {
    const fetches = Array.from(ssmRefs).map(async (paramName) => {
      try {
        const resp = await ssm(region).send(
          new GetParameterCommand({
            Name: paramName,
            WithDecryption: true,
          }),
        );
        ssmValues.set(paramName, resp.Parameter?.Value ?? "");
      } catch (err) {
        throw wrapAwsError(
          err,
          `Failed to resolve SSM parameter ${paramName}`,
        );
      }
    });
    await Promise.all(fetches);
  }

  // Build channels with resolved targets
  const channels: NotificationChannel[] = [];
  for (const [descriptor, rawTarget] of Object.entries(channelConfig)) {
    const resolved = rawTarget.replace(
      ssmPattern,
      (_match, paramName: string) => ssmValues.get(paramName) ?? "",
    );

    const colonIndex = descriptor.indexOf(":");
    const channelType = (
      colonIndex >= 0 ? descriptor.substring(0, colonIndex) : descriptor
    ) as "sns" | "ses" | "sqs";

    if (
      channelType === "sns" ||
      channelType === "ses" ||
      channelType === "sqs"
    ) {
      channels.push({ type: channelType, target: resolved });
    }
  }

  return sendAlert(message, channels, region);
}

// ---------------------------------------------------------------------------
// Additional functions (auto-generated)
// ---------------------------------------------------------------------------

/** Decorator that sends an alert whenever the wrapped function raises. */
export async function notifyOnException(snsTopicArn?: string | undefined, fromEmail?: string | undefined, toEmails?: string[], queueUrl?: string | undefined, regionName?: string | undefined): Promise<Callable> {
  try {
    // TODO: implement notify_on_exception
    throw new Error("notify_on_exception not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "notify_on_exception failed");
  }
}
