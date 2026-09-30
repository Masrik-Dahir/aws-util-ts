/**
 * aws-util/sqs — High-level Amazon SQS utilities.
 *
 * Provides typed helpers for sending, receiving, draining, and managing SQS
 * queues including FIFO support, DLQ replay, large-batch chunking, and
 * predicate-based polling.
 *
 * @example
 * ```ts
 * import { sendMessage, receiveMessages } from "./sqs.js";
 *
 * await sendMessage("https://sqs.us-east-1.amazonaws.com/123/my-queue", {
 *   action: "process",
 * });
 * const msgs = await receiveMessages(
 *   "https://sqs.us-east-1.amazonaws.com/123/my-queue",
 * );
 * ```
 *
 * @module
 */

import { z } from "zod";
import {
  SQSClient,
  GetQueueUrlCommand,
  SendMessageCommand,
  SendMessageBatchCommand,
  ReceiveMessageCommand,
  DeleteMessageCommand,
  DeleteMessageBatchCommand,
  PurgeQueueCommand,
  GetQueueAttributesCommand,
  type QueueAttributeName,
} from "@aws-sdk/client-sqs";
import { getClient } from "./client.js";
import {
  wrapAwsError,
  AwsValidationError,
} from "./exceptions.js";

// ---------------------------------------------------------------------------
// Zod schemas
// ---------------------------------------------------------------------------

/** Schema for a received SQS message. */
export const SQSMessageSchema = z.object({
  messageId: z.string(),
  receiptHandle: z.string(),
  body: z.string(),
  attributes: z.record(z.string()).default({}),
  messageAttributes: z.record(z.unknown()).default({}),
});

/** A single SQS message as returned by {@link receiveMessages}. */
export type SQSMessage = z.infer<typeof SQSMessageSchema>;

/** Schema for the result of a send operation. */
export const SendMessageResultSchema = z.object({
  messageId: z.string(),
  sequenceNumber: z.string().optional(),
});

/** Result of {@link sendMessage} or an individual entry in {@link sendBatch}. */
export type SendMessageResult = z.infer<typeof SendMessageResultSchema>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Parse the body of an SQS message as JSON.
 *
 * @param msg - The SQS message whose body should be parsed.
 * @returns The parsed JSON value.
 * @throws {SyntaxError} If the body is not valid JSON.
 */
export function sqsMessageBodyAsJson(msg: SQSMessage): unknown {
  return JSON.parse(msg.body);
}

/**
 * Serialize a message body: objects are JSON-stringified, strings pass through.
 */
function serializeBody(body: string | object): string {
  return typeof body === "string" ? body : JSON.stringify(body);
}

/**
 * Build an SQS client for the given region.
 */
function sqs(region?: string): SQSClient {
  return getClient(SQSClient, region);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Resolve the URL for an SQS queue by its name.
 *
 * @param queueName - The name of the queue.
 * @param region - AWS region override.
 * @returns The fully-qualified queue URL.
 */
export async function getQueueUrl(
  queueName: string,
  region?: string,
): Promise<string> {
  try {
    const res = await sqs(region).send(
      new GetQueueUrlCommand({ QueueName: queueName }),
    );
    return res.QueueUrl!;
  } catch (err: unknown) {
    throw wrapAwsError(err, `getQueueUrl(${queueName})`);
  }
}

/**
 * Send a single message to an SQS queue.
 *
 * Objects are automatically serialized to JSON. For FIFO queues, supply
 * `messageGroupId` and optionally `messageDeduplicationId`.
 *
 * @param queueUrl - The queue URL.
 * @param body - Message body (string or JSON-serializable object).
 * @param delaySeconds - Delivery delay in seconds (0-900).
 * @param messageGroupId - FIFO message group ID.
 * @param messageDeduplicationId - FIFO deduplication ID.
 * @param region - AWS region override.
 * @returns The message ID and optional sequence number.
 */
export async function sendMessage(
  queueUrl: string,
  body: string | object,
  delaySeconds?: number,
  messageGroupId?: string,
  messageDeduplicationId?: string,
  region?: string,
): Promise<SendMessageResult> {
  try {
    const res = await sqs(region).send(
      new SendMessageCommand({
        QueueUrl: queueUrl,
        MessageBody: serializeBody(body),
        DelaySeconds: delaySeconds,
        MessageGroupId: messageGroupId,
        MessageDeduplicationId: messageDeduplicationId,
      }),
    );
    return SendMessageResultSchema.parse({
      messageId: res.MessageId,
      sequenceNumber: res.SequenceNumber,
    });
  } catch (err: unknown) {
    throw wrapAwsError(err, "sendMessage");
  }
}

/**
 * Send a batch of up to 10 messages to an SQS queue.
 *
 * @param queueUrl - The queue URL.
 * @param messages - Array of message bodies (max 10).
 * @param region - AWS region override.
 * @returns An array of send results, one per message.
 * @throws {AwsValidationError} If more than 10 messages are provided.
 */
export async function sendBatch(
  queueUrl: string,
  messages: (string | object)[],
  region?: string,
): Promise<SendMessageResult[]> {
  if (messages.length > 10) {
    throw new AwsValidationError(
      "sendBatch: SQS batch limit is 10 messages",
    );
  }
  try {
    const entries = messages.map((msg, i) => ({
      Id: String(i),
      MessageBody: serializeBody(msg),
    }));
    const res = await sqs(region).send(
      new SendMessageBatchCommand({
        QueueUrl: queueUrl,
        Entries: entries,
      }),
    );
    if (res.Failed && res.Failed.length > 0) {
      const codes = res.Failed.map((f) => f.Code).join(", ");
      throw new AwsValidationError(
        `sendBatch: ${res.Failed.length} message(s) failed: ${codes}`,
      );
    }
    return (res.Successful ?? []).map((s) =>
      SendMessageResultSchema.parse({
        messageId: s.MessageId,
        sequenceNumber: s.SequenceNumber,
      }),
    );
  } catch (err: unknown) {
    throw wrapAwsError(err, "sendBatch");
  }
}

/**
 * Receive messages from an SQS queue.
 *
 * @param queueUrl - The queue URL.
 * @param maxNumber - Maximum messages to receive (1-10, default 10).
 * @param waitSeconds - Long-poll wait time in seconds (0-20, default 0).
 * @param visibilityTimeout - Visibility timeout override in seconds.
 * @param region - AWS region override.
 * @returns An array of received messages (may be empty).
 */
export async function receiveMessages(
  queueUrl: string,
  maxNumber?: number,
  waitSeconds?: number,
  visibilityTimeout?: number,
  region?: string,
): Promise<SQSMessage[]> {
  try {
    const res = await sqs(region).send(
      new ReceiveMessageCommand({
        QueueUrl: queueUrl,
        MaxNumberOfMessages: maxNumber ?? 10,
        WaitTimeSeconds: waitSeconds ?? 0,
        VisibilityTimeout: visibilityTimeout,
        AttributeNames: ["All"],
        MessageSystemAttributeNames: ["All"],
        MessageAttributeNames: ["All"],
      }),
    );
    return (res.Messages ?? []).map((m) =>
      SQSMessageSchema.parse({
        messageId: m.MessageId,
        receiptHandle: m.ReceiptHandle,
        body: m.Body,
        attributes: m.Attributes ?? {},
        messageAttributes: m.MessageAttributes ?? {},
      }),
    );
  } catch (err: unknown) {
    throw wrapAwsError(err, "receiveMessages");
  }
}

/**
 * Delete a single message from an SQS queue.
 *
 * @param queueUrl - The queue URL.
 * @param receiptHandle - The receipt handle of the message to delete.
 * @param region - AWS region override.
 */
export async function deleteMessage(
  queueUrl: string,
  receiptHandle: string,
  region?: string,
): Promise<void> {
  try {
    await sqs(region).send(
      new DeleteMessageCommand({
        QueueUrl: queueUrl,
        ReceiptHandle: receiptHandle,
      }),
    );
  } catch (err: unknown) {
    throw wrapAwsError(err, "deleteMessage");
  }
}

/**
 * Delete a batch of up to 10 messages from an SQS queue.
 *
 * @param queueUrl - The queue URL.
 * @param receiptHandles - Receipt handles to delete (max 10).
 * @param region - AWS region override.
 * @throws {AwsValidationError} If more than 10 handles are provided.
 */
export async function deleteBatch(
  queueUrl: string,
  receiptHandles: string[],
  region?: string,
): Promise<void> {
  if (receiptHandles.length > 10) {
    throw new AwsValidationError(
      "deleteBatch: SQS batch limit is 10 messages",
    );
  }
  try {
    const entries = receiptHandles.map((rh, i) => ({
      Id: String(i),
      ReceiptHandle: rh,
    }));
    await sqs(region).send(
      new DeleteMessageBatchCommand({
        QueueUrl: queueUrl,
        Entries: entries,
      }),
    );
  } catch (err: unknown) {
    throw wrapAwsError(err, "deleteBatch");
  }
}

/**
 * Purge all messages from an SQS queue.
 *
 * This operation deletes every message in the queue. It can only be called
 * once every 60 seconds.
 *
 * @param queueUrl - The queue URL.
 * @param region - AWS region override.
 */
export async function purgeQueue(
  queueUrl: string,
  region?: string,
): Promise<void> {
  try {
    await sqs(region).send(
      new PurgeQueueCommand({ QueueUrl: queueUrl }),
    );
  } catch (err: unknown) {
    throw wrapAwsError(err, "purgeQueue");
  }
}

/**
 * Continuously receive, process, and delete messages until the queue is empty.
 *
 * Polling stops after two consecutive empty receives.
 *
 * @param queueUrl - The queue URL.
 * @param handler - Async callback invoked for each message.
 * @param batchSize - Messages per receive call (1-10, default 10).
 * @param maxMessages - Stop after processing this many messages (default unlimited).
 * @param visibilityTimeout - Visibility timeout in seconds.
 * @param waitSeconds - Long-poll wait time in seconds (default 5).
 * @param region - AWS region override.
 * @returns The total number of messages processed.
 */
export async function drainQueue(
  queueUrl: string,
  handler: (msg: SQSMessage) => Promise<void>,
  batchSize?: number,
  maxMessages?: number,
  visibilityTimeout?: number,
  waitSeconds?: number,
  region?: string,
): Promise<number> {
  let processed = 0;
  let emptyPolls = 0;
  const effectiveBatchSize = batchSize ?? 10;
  const effectiveWait = waitSeconds ?? 5;

  while (emptyPolls < 2) {
    if (maxMessages !== undefined && processed >= maxMessages) {
      break;
    }

    const msgs = await receiveMessages(
      queueUrl,
      effectiveBatchSize,
      effectiveWait,
      visibilityTimeout,
      region,
    );

    if (msgs.length === 0) {
      emptyPolls++;
      continue;
    }
    emptyPolls = 0;

    for (const msg of msgs) {
      if (maxMessages !== undefined && processed >= maxMessages) {
        break;
      }
      await handler(msg);
      await deleteMessage(queueUrl, msg.receiptHandle, region);
      processed++;
    }
  }

  return processed;
}

/**
 * Move messages from a dead-letter queue back to a target queue.
 *
 * Receives messages from the DLQ, re-sends them to the target, then deletes
 * them from the DLQ. Stops after two consecutive empty polls or after
 * `maxMessages` have been replayed.
 *
 * @param dlqUrl - The dead-letter queue URL.
 * @param targetUrl - The destination queue URL.
 * @param maxMessages - Maximum messages to replay (default unlimited).
 * @param region - AWS region override.
 * @returns The total number of messages replayed.
 */
export async function replayDlq(
  dlqUrl: string,
  targetUrl: string,
  maxMessages?: number,
  region?: string,
): Promise<number> {
  let replayed = 0;
  let emptyPolls = 0;

  while (emptyPolls < 2) {
    if (maxMessages !== undefined && replayed >= maxMessages) {
      break;
    }

    const msgs = await receiveMessages(dlqUrl, 10, 5, undefined, region);

    if (msgs.length === 0) {
      emptyPolls++;
      continue;
    }
    emptyPolls = 0;

    for (const msg of msgs) {
      if (maxMessages !== undefined && replayed >= maxMessages) {
        break;
      }
      await sendMessage(targetUrl, msg.body, undefined, undefined, undefined, region);
      await deleteMessage(dlqUrl, msg.receiptHandle, region);
      replayed++;
    }
  }

  return replayed;
}

/**
 * Send an arbitrarily large list of messages, auto-chunked into batches of 10.
 *
 * @param queueUrl - The queue URL.
 * @param messages - Array of message bodies (any length).
 * @param region - AWS region override.
 * @returns The total number of messages sent.
 */
export async function sendLargeBatch(
  queueUrl: string,
  messages: (string | object)[],
  region?: string,
): Promise<number> {
  let sent = 0;

  for (let i = 0; i < messages.length; i += 10) {
    const chunk = messages.slice(i, i + 10);
    const results = await sendBatch(queueUrl, chunk, region);
    sent += results.length;
  }

  return sent;
}

/**
 * Poll a queue until a message matching a predicate arrives or a timeout elapses.
 *
 * When `deleteOnMatch` is true (the default), the matched message is deleted
 * from the queue before returning.
 *
 * @param queueUrl - The queue URL.
 * @param predicate - Optional filter; defaults to matching any message.
 * @param timeout - Maximum time to wait in milliseconds (default 30 000).
 * @param pollInterval - Pause between polls in milliseconds (default 1 000).
 * @param visibilityTimeout - Visibility timeout in seconds for received messages.
 * @param deleteOnMatch - Whether to delete the matched message (default true).
 * @param region - AWS region override.
 * @returns The first matching message, or `null` if the timeout elapses.
 */
export async function waitForMessage(
  queueUrl: string,
  predicate?: (msg: SQSMessage) => boolean,
  timeout?: number,
  pollInterval?: number,
  visibilityTimeout?: number,
  deleteOnMatch?: boolean,
  region?: string,
): Promise<SQSMessage | null> {
  const effectiveTimeout = timeout ?? 30_000;
  const effectivePollInterval = pollInterval ?? 1_000;
  const effectiveDeleteOnMatch = deleteOnMatch ?? true;
  const deadline = Date.now() + effectiveTimeout;

  while (Date.now() < deadline) {
    const msgs = await receiveMessages(
      queueUrl,
      10,
      0,
      visibilityTimeout,
      region,
    );

    for (const msg of msgs) {
      if (!predicate || predicate(msg)) {
        if (effectiveDeleteOnMatch) {
          await deleteMessage(queueUrl, msg.receiptHandle, region);
        }
        return msg;
      }
    }

    const remaining = deadline - Date.now();
    if (remaining <= 0) {
      break;
    }
    await new Promise((resolve) =>
      setTimeout(resolve, Math.min(effectivePollInterval, remaining)),
    );
  }

  return null;
}

/**
 * Retrieve queue attributes such as message counts and ARN.
 *
 * @param queueUrl - The queue URL.
 * @param attributes - Attribute names to fetch (default `["All"]`).
 * @param region - AWS region override.
 * @returns A record of attribute names to their string values.
 */
export async function getQueueAttributes(
  queueUrl: string,
  attributes?: string[],
  region?: string,
): Promise<Record<string, string>> {
  try {
    const res = await sqs(region).send(
      new GetQueueAttributesCommand({
        QueueUrl: queueUrl,
        AttributeNames: (attributes ?? ["All"]) as QueueAttributeName[],
      }),
    );
    return res.Attributes ?? {};
  } catch (err: unknown) {
    throw wrapAwsError(err, "getQueueAttributes");
  }
}

// ---------------------------------------------------------------------------
// Additional types (auto-generated)
// ---------------------------------------------------------------------------

/** Result of cancel_message_move_task. */
export type CancelMessageMoveTaskResult = {
  approximateNumberOfMessagesMoved?: number | undefined;
};

/** Result of change_message_visibility_batch. */
export type ChangeMessageVisibilityBatchResult = {
  successful?: Record<string, unknown>[];
  failed?: Record<string, unknown>[];
};

/** Result of create_queue. */
export type CreateQueueResult = {
  queueUrl?: string | undefined;
};

/** Result of delete_message_batch. */
export type DeleteMessageBatchResult = {
  successful?: Record<string, unknown>[];
  failed?: Record<string, unknown>[];
};

/** Result of list_dead_letter_source_queues. */
export type ListDeadLetterSourceQueuesResult = {
  queueUrls?: string[];
  nextToken?: string | undefined;
};

/** Result of list_message_move_tasks. */
export type ListMessageMoveTasksResult = {
  results?: Record<string, unknown>[];
};

/** Result of list_queue_tags. */
export type ListQueueTagsResult = {
  tags?: Record<string, unknown>;
};

/** Result of list_queues. */
export type ListQueuesResult = {
  queueUrls?: string[];
  nextToken?: string | undefined;
};

/** Result of receive_message. */
export type ReceiveMessageResult = {
  messages?: Record<string, unknown>[];
};

/** Result of send_message_batch. */
export type SendMessageBatchResult = {
  successful?: Record<string, unknown>[];
  failed?: Record<string, unknown>[];
};

/** Result of start_message_move_task. */
export type StartMessageMoveTaskResult = {
  taskHandle?: string | undefined;
};


// ---------------------------------------------------------------------------
// Additional functions (auto-generated)
// ---------------------------------------------------------------------------

/** Add permission. */
export async function addPermission(queueUrl: string, label: string, awsAccountIds: string[], actions: string[], regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement add_permission
    throw new Error("add_permission not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "add_permission failed");
  }
}

/** Cancel message move task. */
export async function cancelMessageMoveTask(taskHandle: string, regionName?: string | undefined): Promise<CancelMessageMoveTaskResult> {
  try {
    // TODO: implement cancel_message_move_task
    throw new Error("cancel_message_move_task not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "cancel_message_move_task failed");
  }
}

/** Change message visibility. */
export async function changeMessageVisibility(queueUrl: string, receiptHandle: string, visibilityTimeout: number, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement change_message_visibility
    throw new Error("change_message_visibility not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "change_message_visibility failed");
  }
}

/** Change message visibility batch. */
export async function changeMessageVisibilityBatch(queueUrl: string, entries: Record<string, unknown>[], regionName?: string | undefined): Promise<ChangeMessageVisibilityBatchResult> {
  try {
    // TODO: implement change_message_visibility_batch
    throw new Error("change_message_visibility_batch not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "change_message_visibility_batch failed");
  }
}

/** Create queue. */
export async function createQueue(queueName: string): Promise<CreateQueueResult> {
  try {
    // TODO: implement create_queue
    throw new Error("create_queue not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_queue failed");
  }
}

/** Delete message batch. */
export async function deleteMessageBatch(queueUrl: string, entries: Record<string, unknown>[], regionName?: string | undefined): Promise<DeleteMessageBatchResult> {
  try {
    // TODO: implement delete_message_batch
    throw new Error("delete_message_batch not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_message_batch failed");
  }
}

/** Delete queue. */
export async function deleteQueue(queueUrl: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_queue
    throw new Error("delete_queue not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_queue failed");
  }
}

/** List dead letter source queues. */
export async function listDeadLetterSourceQueues(queueUrl: string): Promise<ListDeadLetterSourceQueuesResult> {
  try {
    // TODO: implement list_dead_letter_source_queues
    throw new Error("list_dead_letter_source_queues not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_dead_letter_source_queues failed");
  }
}

/** List message move tasks. */
export async function listMessageMoveTasks(sourceArn: string): Promise<ListMessageMoveTasksResult> {
  try {
    // TODO: implement list_message_move_tasks
    throw new Error("list_message_move_tasks not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_message_move_tasks failed");
  }
}

/** List queue tags. */
export async function listQueueTags(queueUrl: string, regionName?: string | undefined): Promise<ListQueueTagsResult> {
  try {
    // TODO: implement list_queue_tags
    throw new Error("list_queue_tags not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_queue_tags failed");
  }
}

/** List queues. */
export async function listQueues(): Promise<ListQueuesResult> {
  try {
    // TODO: implement list_queues
    throw new Error("list_queues not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_queues failed");
  }
}

/** Receive message. */
export async function receiveMessage(queueUrl: string): Promise<ReceiveMessageResult> {
  try {
    // TODO: implement receive_message
    throw new Error("receive_message not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "receive_message failed");
  }
}

/** Remove permission. */
export async function removePermission(queueUrl: string, label: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement remove_permission
    throw new Error("remove_permission not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "remove_permission failed");
  }
}

/** Send message batch. */
export async function sendMessageBatch(queueUrl: string, entries: Record<string, unknown>[], regionName?: string | undefined): Promise<SendMessageBatchResult> {
  try {
    // TODO: implement send_message_batch
    throw new Error("send_message_batch not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "send_message_batch failed");
  }
}

/** Set queue attributes. */
export async function setQueueAttributes(queueUrl: string, attributes: Record<string, unknown>, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement set_queue_attributes
    throw new Error("set_queue_attributes not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "set_queue_attributes failed");
  }
}

/** Start message move task. */
export async function startMessageMoveTask(sourceArn: string): Promise<StartMessageMoveTaskResult> {
  try {
    // TODO: implement start_message_move_task
    throw new Error("start_message_move_task not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_message_move_task failed");
  }
}

/** Tag queue. */
export async function tagQueue(queueUrl: string, tags: Record<string, unknown>, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement tag_queue
    throw new Error("tag_queue not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "tag_queue failed");
  }
}

/** Untag queue. */
export async function untagQueue(queueUrl: string, tagKeys: string[], regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement untag_queue
    throw new Error("untag_queue not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "untag_queue failed");
  }
}
