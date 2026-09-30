/**
 * aws-util/firehose — High-level Amazon Kinesis Data Firehose utilities.
 *
 * Provides typed helpers for putting records (single and batch), listing
 * and describing delivery streams, and batch-put with automatic retry of
 * failed records.
 *
 * All functions obtain a FirehoseClient via {@link getClient} and wrap
 * errors through {@link wrapAwsError}.
 *
 * @example
 * ```ts
 * import { putRecord, putRecordBatchWithRetry } from "./firehose.js";
 *
 * await putRecord("my-stream", { event: "pageview", url: "/home" });
 *
 * const results = await putRecordBatchWithRetry("my-stream", [
 *   { action: "click" },
 *   { action: "scroll" },
 * ]);
 * console.log(`${results.successCount} sent, ${results.failedCount} failed`);
 * ```
 *
 * @module
 */

import { z } from "zod";
import {
  FirehoseClient,
  PutRecordCommand,
  PutRecordBatchCommand,
  ListDeliveryStreamsCommand,
  DescribeDeliveryStreamCommand,
} from "@aws-sdk/client-firehose";
import { getClient } from "./client.js";
import {
  wrapAwsError,
  AwsValidationError,
} from "./exceptions.js";

// ---------------------------------------------------------------------------
// Zod schemas & inferred types
// ---------------------------------------------------------------------------

/** Schema for a Firehose delivery stream descriptor. */
export const DeliveryStreamSchema = z.object({
  deliveryStreamName: z.string(),
  deliveryStreamArn: z.string().optional(),
  deliveryStreamStatus: z.string().optional(),
  deliveryStreamType: z.string().optional(),
});

/** A Firehose delivery stream descriptor. */
export type DeliveryStream = z.infer<typeof DeliveryStreamSchema>;

/** Schema for the result of a single put-record operation. */
export const FirehosePutResultSchema = z.object({
  recordId: z.string(),
  encrypted: z.boolean().optional(),
});

/** Result of {@link putRecord}. */
export type FirehosePutResult = z.infer<typeof FirehosePutResultSchema>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Get a cached FirehoseClient for the given region.
 */
function firehose(region?: string): FirehoseClient {
  return getClient(FirehoseClient, region);
}

/**
 * Serialize record data to a Uint8Array.
 */
function serializeData(data: string | Uint8Array | object): Uint8Array {
  if (data instanceof Uint8Array) {
    return data;
  }
  const str = typeof data === "string" ? data : JSON.stringify(data);
  return new TextEncoder().encode(str);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Put a single record to a Firehose delivery stream.
 *
 * Objects are automatically serialized to JSON. Strings and Uint8Array values
 * are sent as-is.
 *
 * @param deliveryStreamName - The name of the delivery stream.
 * @param data - Record data (string, Uint8Array, or JSON-serializable object).
 * @param region - AWS region override.
 * @returns The record ID and encryption status.
 */
export async function putRecord(
  deliveryStreamName: string,
  data: string | Uint8Array | object,
  region?: string,
): Promise<FirehosePutResult> {
  try {
    const res = await firehose(region).send(
      new PutRecordCommand({
        DeliveryStreamName: deliveryStreamName,
        Record: { Data: serializeData(data) },
      }),
    );
    return FirehosePutResultSchema.parse({
      recordId: res.RecordId,
      encrypted: res.Encrypted,
    });
  } catch (err: unknown) {
    throw wrapAwsError(err, `putRecord(${deliveryStreamName})`);
  }
}

/**
 * Put a batch of records to a Firehose delivery stream.
 *
 * Firehose limits batches to 500 records. This function enforces that limit.
 *
 * @param deliveryStreamName - The name of the delivery stream.
 * @param records - Array of record data items (max 500).
 * @param region - AWS region override.
 * @returns Success and failure counts.
 * @throws {AwsValidationError} If more than 500 records are provided.
 */
export async function putRecordBatch(
  deliveryStreamName: string,
  records: (string | Uint8Array | object)[],
  region?: string,
): Promise<{ successCount: number; failedCount: number }> {
  if (records.length > 500) {
    throw new AwsValidationError(
      "putRecordBatch: Firehose batch limit is 500 records",
    );
  }

  try {
    const res = await firehose(region).send(
      new PutRecordBatchCommand({
        DeliveryStreamName: deliveryStreamName,
        Records: records.map((r) => ({ Data: serializeData(r) })),
      }),
    );

    const failedCount = res.FailedPutCount ?? 0;
    const successCount = records.length - failedCount;

    return { successCount, failedCount };
  } catch (err: unknown) {
    throw wrapAwsError(err, `putRecordBatch(${deliveryStreamName})`);
  }
}

/**
 * Put a batch of records to a Firehose delivery stream with automatic retry
 * of failed records.
 *
 * On each attempt, only the records that failed in the previous batch are
 * re-sent. Retries use exponential backoff (1s, 2s, 4s, ...).
 *
 * @param deliveryStreamName - The name of the delivery stream.
 * @param records - Array of record data items.
 * @param maxRetries - Maximum number of retry attempts (default 3).
 * @param region - AWS region override.
 * @returns Cumulative success and failure counts.
 */
export async function putRecordBatchWithRetry(
  deliveryStreamName: string,
  records: (string | Uint8Array | object)[],
  maxRetries?: number,
  region?: string,
): Promise<{ successCount: number; failedCount: number }> {
  const effectiveMaxRetries = maxRetries ?? 3;
  let pendingRecords = records;
  let totalSuccess = 0;
  let totalFailed = 0;

  for (let attempt = 0; attempt <= effectiveMaxRetries; attempt++) {
    // Process in chunks of 500
    const nextPending: (string | Uint8Array | object)[] = [];

    for (let i = 0; i < pendingRecords.length; i += 500) {
      const chunk = pendingRecords.slice(i, i + 500);

      try {
        const res = await firehose(region).send(
          new PutRecordBatchCommand({
            DeliveryStreamName: deliveryStreamName,
            Records: chunk.map((r) => ({ Data: serializeData(r) })),
          }),
        );

        const results = res.RequestResponses ?? [];
        for (let j = 0; j < results.length; j++) {
          if (results[j].ErrorCode) {
            nextPending.push(chunk[j]);
          } else {
            totalSuccess++;
          }
        }
      } catch (err: unknown) {
        throw wrapAwsError(
          err,
          `putRecordBatchWithRetry(${deliveryStreamName})`,
        );
      }
    }

    if (nextPending.length === 0) {
      return { successCount: totalSuccess, failedCount: 0 };
    }

    pendingRecords = nextPending;

    // Backoff before retry (skip on last attempt)
    if (attempt < effectiveMaxRetries) {
      const delay = Math.pow(2, attempt) * 1_000;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // Exhausted retries — remaining records are failures
  totalFailed = pendingRecords.length;
  return { successCount: totalSuccess, failedCount: totalFailed };
}

/**
 * List all Firehose delivery streams in the account, auto-paginating.
 *
 * @param region - AWS region override.
 * @returns An array of delivery stream names.
 */
export async function listDeliveryStreams(
  region?: string,
): Promise<string[]> {
  const results: string[] = [];
  let hasMore = true;
  let exclusiveStartName: string | undefined;

  try {
    while (hasMore) {
      const res = await firehose(region).send(
        new ListDeliveryStreamsCommand({
          ExclusiveStartDeliveryStreamName: exclusiveStartName,
        }),
      );
      const names = res.DeliveryStreamNames ?? [];
      results.push(...names);
      hasMore = res.HasMoreDeliveryStreams ?? false;
      if (hasMore && names.length > 0) {
        exclusiveStartName = names[names.length - 1];
      }
    }
  } catch (err: unknown) {
    throw wrapAwsError(err, "listDeliveryStreams");
  }

  return results;
}

/**
 * Describe a Firehose delivery stream.
 *
 * @param deliveryStreamName - The name of the delivery stream.
 * @param region - AWS region override.
 * @returns The delivery stream descriptor.
 */
export async function describeDeliveryStream(
  deliveryStreamName: string,
  region?: string,
): Promise<DeliveryStream> {
  try {
    const res = await firehose(region).send(
      new DescribeDeliveryStreamCommand({
        DeliveryStreamName: deliveryStreamName,
      }),
    );
    const desc = res.DeliveryStreamDescription!;
    return DeliveryStreamSchema.parse({
      deliveryStreamName: desc.DeliveryStreamName,
      deliveryStreamArn: desc.DeliveryStreamARN,
      deliveryStreamStatus: desc.DeliveryStreamStatus,
      deliveryStreamType: desc.DeliveryStreamType,
    });
  } catch (err: unknown) {
    throw wrapAwsError(
      err,
      `describeDeliveryStream(${deliveryStreamName})`,
    );
  }
}

// ---------------------------------------------------------------------------
// Additional types (auto-generated)
// ---------------------------------------------------------------------------

/** Result of create_delivery_stream. */
export type CreateDeliveryStreamResult = {
  deliveryStreamArn?: string | undefined;
};

/** Result of list_tags_for_delivery_stream. */
export type ListTagsForDeliveryStreamResult = {
  tags?: Record<string, unknown>[];
  hasMoreTags?: boolean | undefined;
};


// ---------------------------------------------------------------------------
// Additional functions (auto-generated)
// ---------------------------------------------------------------------------

/** Create delivery stream. */
export async function createDeliveryStream(deliveryStreamName: string): Promise<CreateDeliveryStreamResult> {
  try {
    // TODO: implement create_delivery_stream
    throw new Error("create_delivery_stream not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_delivery_stream failed");
  }
}

/** Delete delivery stream. */
export async function deleteDeliveryStream(deliveryStreamName: string): Promise<void> {
  try {
    // TODO: implement delete_delivery_stream
    throw new Error("delete_delivery_stream not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_delivery_stream failed");
  }
}

/** List tags for delivery stream. */
export async function listTagsForDeliveryStream(deliveryStreamName: string): Promise<ListTagsForDeliveryStreamResult> {
  try {
    // TODO: implement list_tags_for_delivery_stream
    throw new Error("list_tags_for_delivery_stream not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_tags_for_delivery_stream failed");
  }
}

/** Start delivery stream encryption. */
export async function startDeliveryStreamEncryption(deliveryStreamName: string): Promise<void> {
  try {
    // TODO: implement start_delivery_stream_encryption
    throw new Error("start_delivery_stream_encryption not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_delivery_stream_encryption failed");
  }
}

/** Stop delivery stream encryption. */
export async function stopDeliveryStreamEncryption(deliveryStreamName: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement stop_delivery_stream_encryption
    throw new Error("stop_delivery_stream_encryption not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "stop_delivery_stream_encryption failed");
  }
}

/** Tag delivery stream. */
export async function tagDeliveryStream(deliveryStreamName: string, tags: Record<string, unknown>[], regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement tag_delivery_stream
    throw new Error("tag_delivery_stream not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "tag_delivery_stream failed");
  }
}

/** Untag delivery stream. */
export async function untagDeliveryStream(deliveryStreamName: string, tagKeys: string[], regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement untag_delivery_stream
    throw new Error("untag_delivery_stream not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "untag_delivery_stream failed");
  }
}

/** Update destination. */
export async function updateDestination(deliveryStreamName: string, currentDeliveryStreamVersionId: string, destinationId: string): Promise<void> {
  try {
    // TODO: implement update_destination
    throw new Error("update_destination not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_destination failed");
  }
}
