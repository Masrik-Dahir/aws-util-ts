/**
 * aws-util/kinesis — High-level Amazon Kinesis Data Streams utilities.
 *
 * Provides typed helpers for putting and getting records, describing and
 * listing streams, and consuming all shards for a specified duration.
 *
 * All functions obtain a KinesisClient via {@link getClient} and wrap errors
 * through {@link wrapAwsError}.
 *
 * @example
 * ```ts
 * import { putRecord, describeStream, consumeStream } from "./kinesis.js";
 *
 * const result = await putRecord("my-stream", { event: "click" }, "user-123");
 * console.log(result.sequenceNumber);
 *
 * await consumeStream("my-stream", async (records) => {
 *   for (const r of records) console.log(r.partitionKey, r.data);
 * });
 * ```
 *
 * @module
 */

import { z } from "zod";
import {
  KinesisClient,
  PutRecordCommand,
  PutRecordsCommand,
  GetRecordsCommand,
  GetShardIteratorCommand,
  DescribeStreamCommand,
  ListStreamsCommand,
  ListShardsCommand,
} from "@aws-sdk/client-kinesis";
import { getClient } from "./client.js";
import { wrapAwsError } from "./exceptions.js";

// ---------------------------------------------------------------------------
// Zod schemas & inferred types
// ---------------------------------------------------------------------------

/** Schema for a Kinesis record. */
export const KinesisRecordSchema = z.object({
  sequenceNumber: z.string(),
  partitionKey: z.string(),
  data: z.instanceof(Uint8Array),
  approximateArrivalTimestamp: z.date().optional(),
});

/** A Kinesis record. */
export type KinesisRecord = z.infer<typeof KinesisRecordSchema>;

/** Schema for the result of a put operation. */
export const KinesisPutResultSchema = z.object({
  sequenceNumber: z.string(),
  shardId: z.string(),
});

/** Result of {@link putRecord}. */
export type KinesisPutResult = z.infer<typeof KinesisPutResultSchema>;

/** Schema for a Kinesis stream descriptor. */
export const KinesisStreamSchema = z.object({
  streamName: z.string(),
  streamArn: z.string().optional(),
  streamStatus: z.string().optional(),
  shardCount: z.number().optional(),
});

/** A Kinesis stream descriptor. */
export type KinesisStream = z.infer<typeof KinesisStreamSchema>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Get a cached KinesisClient for the given region.
 */
function kinesis(region?: string): KinesisClient {
  return getClient(KinesisClient, region);
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
 * Put a single record into a Kinesis stream.
 *
 * Objects are automatically serialized to JSON. Strings and Uint8Array values
 * are sent as-is.
 *
 * @param streamName - The name of the Kinesis stream.
 * @param data - Record data (string, Uint8Array, or JSON-serializable object).
 * @param partitionKey - Partition key for shard selection.
 * @param region - AWS region override.
 * @returns The sequence number and shard ID of the put record.
 */
export async function putRecord(
  streamName: string,
  data: string | Uint8Array | object,
  partitionKey: string,
  region?: string,
): Promise<KinesisPutResult> {
  try {
    const res = await kinesis(region).send(
      new PutRecordCommand({
        StreamName: streamName,
        Data: serializeData(data),
        PartitionKey: partitionKey,
      }),
    );
    return KinesisPutResultSchema.parse({
      sequenceNumber: res.SequenceNumber,
      shardId: res.ShardId,
    });
  } catch (err: unknown) {
    throw wrapAwsError(err, `putRecord(${streamName})`);
  }
}

/**
 * Put multiple records into a Kinesis stream in a single batch.
 *
 * @param streamName - The name of the Kinesis stream.
 * @param records - Array of records, each with `data` and `partitionKey`.
 * @param region - AWS region override.
 * @returns Success and failure counts along with individual results.
 */
export async function putRecords(
  streamName: string,
  records: Array<{
    data: string | Uint8Array | object;
    partitionKey: string;
  }>,
  region?: string,
): Promise<{
  successCount: number;
  failedCount: number;
  records: KinesisPutResult[];
}> {
  try {
    const res = await kinesis(region).send(
      new PutRecordsCommand({
        StreamName: streamName,
        Records: records.map((r) => ({
          Data: serializeData(r.data),
          PartitionKey: r.partitionKey,
        })),
      }),
    );

    const results: KinesisPutResult[] = [];
    let successCount = 0;
    let failedCount = res.FailedRecordCount ?? 0;

    for (const record of res.Records ?? []) {
      if (record.SequenceNumber && record.ShardId) {
        results.push(
          KinesisPutResultSchema.parse({
            sequenceNumber: record.SequenceNumber,
            shardId: record.ShardId,
          }),
        );
        successCount++;
      }
    }

    return { successCount, failedCount, records: results };
  } catch (err: unknown) {
    throw wrapAwsError(err, `putRecords(${streamName})`);
  }
}

/**
 * Get records from a Kinesis shard using a shard iterator.
 *
 * @param shardIterator - The shard iterator obtained from GetShardIterator.
 * @param limit - Maximum number of records to return (default 100).
 * @param region - AWS region override.
 * @returns The records and an optional next shard iterator for continued reading.
 */
export async function getRecords(
  shardIterator: string,
  limit?: number,
  region?: string,
): Promise<{
  records: KinesisRecord[];
  nextShardIterator?: string;
}> {
  try {
    const res = await kinesis(region).send(
      new GetRecordsCommand({
        ShardIterator: shardIterator,
        Limit: limit ?? 100,
      }),
    );

    const records: KinesisRecord[] = (res.Records ?? []).map((r) =>
      KinesisRecordSchema.parse({
        sequenceNumber: r.SequenceNumber,
        partitionKey: r.PartitionKey,
        data: r.Data ?? new Uint8Array(),
        approximateArrivalTimestamp: r.ApproximateArrivalTimestamp,
      }),
    );

    return {
      records,
      nextShardIterator: res.NextShardIterator,
    };
  } catch (err: unknown) {
    throw wrapAwsError(err, "getRecords");
  }
}

/**
 * Describe a Kinesis stream.
 *
 * @param streamName - The name of the Kinesis stream.
 * @param region - AWS region override.
 * @returns The stream descriptor.
 */
export async function describeStream(
  streamName: string,
  region?: string,
): Promise<KinesisStream> {
  try {
    const res = await kinesis(region).send(
      new DescribeStreamCommand({ StreamName: streamName }),
    );
    const desc = res.StreamDescription!;
    return KinesisStreamSchema.parse({
      streamName: desc.StreamName,
      streamArn: desc.StreamARN,
      streamStatus: desc.StreamStatus,
      shardCount: desc.Shards?.length,
    });
  } catch (err: unknown) {
    throw wrapAwsError(err, `describeStream(${streamName})`);
  }
}

/**
 * List all Kinesis streams in the account, auto-paginating through all pages.
 *
 * @param region - AWS region override.
 * @returns An array of stream names.
 */
export async function listStreams(
  region?: string,
): Promise<string[]> {
  const results: string[] = [];
  let nextToken: string | undefined;

  try {
    do {
      const res = await kinesis(region).send(
        new ListStreamsCommand({ NextToken: nextToken }),
      );
      for (const name of res.StreamNames ?? []) {
        results.push(name);
      }
      nextToken = res.HasMoreStreams ? res.NextToken : undefined;
    } while (nextToken);
  } catch (err: unknown) {
    throw wrapAwsError(err, "listStreams");
  }

  return results;
}

/**
 * Consume all shards of a Kinesis stream for a specified duration.
 *
 * Opens a shard iterator for every shard and polls them in round-robin
 * fashion, calling the handler with each batch of records. Runs for
 * `duration` milliseconds (default 60 000 = 1 minute).
 *
 * @param streamName - The name of the Kinesis stream.
 * @param handler - Async callback invoked with each batch of records.
 * @param shardIteratorType - Iterator type (default `"LATEST"`).
 * @param duration - How long to consume in milliseconds (default 60 000).
 * @param region - AWS region override.
 * @returns The total number of records consumed.
 */
export async function consumeStream(
  streamName: string,
  handler: (records: KinesisRecord[]) => Promise<void>,
  shardIteratorType?: string,
  duration?: number,
  region?: string,
): Promise<number> {
  const effectiveDuration = duration ?? 60_000;
  const effectiveIteratorType = shardIteratorType ?? "LATEST";
  const client = kinesis(region);
  let totalRecords = 0;

  try {
    // List all shards
    const shardIds: string[] = [];
    let nextToken: string | undefined;
    do {
      const res = await client.send(
        new ListShardsCommand({
          StreamName: nextToken ? undefined : streamName,
          NextToken: nextToken,
        }),
      );
      for (const shard of res.Shards ?? []) {
        if (shard.ShardId) {
          shardIds.push(shard.ShardId);
        }
      }
      nextToken = res.NextToken;
    } while (nextToken);

    // Get initial shard iterators
    const iterators: (string | undefined)[] = await Promise.all(
      shardIds.map(async (shardId) => {
        const res = await client.send(
          new GetShardIteratorCommand({
            StreamName: streamName,
            ShardId: shardId,
            ShardIteratorType: effectiveIteratorType as
              | "AT_SEQUENCE_NUMBER"
              | "AFTER_SEQUENCE_NUMBER"
              | "TRIM_HORIZON"
              | "LATEST"
              | "AT_TIMESTAMP",
          }),
        );
        return res.ShardIterator;
      }),
    );

    // Poll all shards until the duration expires
    const deadline = Date.now() + effectiveDuration;

    while (Date.now() < deadline) {
      let anyActive = false;

      for (let i = 0; i < iterators.length; i++) {
        if (!iterators[i]) {
          continue;
        }
        anyActive = true;

        const res = await client.send(
          new GetRecordsCommand({
            ShardIterator: iterators[i],
            Limit: 100,
          }),
        );

        const records: KinesisRecord[] = (res.Records ?? []).map((r) =>
          KinesisRecordSchema.parse({
            sequenceNumber: r.SequenceNumber,
            partitionKey: r.PartitionKey,
            data: r.Data ?? new Uint8Array(),
            approximateArrivalTimestamp: r.ApproximateArrivalTimestamp,
          }),
        );

        if (records.length > 0) {
          await handler(records);
          totalRecords += records.length;
        }

        iterators[i] = res.NextShardIterator;
      }

      if (!anyActive) {
        break;
      }

      // Brief pause to avoid aggressive polling
      const remaining = deadline - Date.now();
      if (remaining > 0) {
        await new Promise((resolve) =>
          setTimeout(resolve, Math.min(1_000, remaining)),
        );
      }
    }
  } catch (err: unknown) {
    throw wrapAwsError(err, `consumeStream(${streamName})`);
  }

  return totalRecords;
}

// ---------------------------------------------------------------------------
// Additional types (auto-generated)
// ---------------------------------------------------------------------------

/** Result of describe_account_settings. */
export type DescribeAccountSettingsResult = {
  minimumThroughputBillingCommitment?: Record<string, unknown>;
};

/** Result of describe_limits. */
export type DescribeLimitsResult = {
  shardLimit?: number | undefined;
  openShardCount?: number | undefined;
  onDemandStreamCount?: number | undefined;
  onDemandStreamCountLimit?: number | undefined;
};

/** Result of describe_stream_consumer. */
export type DescribeStreamConsumerResult = {
  consumerDescription?: Record<string, unknown>;
};

/** Result of describe_stream_summary. */
export type DescribeStreamSummaryResult = {
  streamDescriptionSummary?: Record<string, unknown>;
};

/** Result of disable_enhanced_monitoring. */
export type DisableEnhancedMonitoringResult = {
  streamName?: string | undefined;
  currentShardLevelMetrics?: string[];
  desiredShardLevelMetrics?: string[];
  streamArn?: string | undefined;
};

/** Result of enable_enhanced_monitoring. */
export type EnableEnhancedMonitoringResult = {
  streamName?: string | undefined;
  currentShardLevelMetrics?: string[];
  desiredShardLevelMetrics?: string[];
  streamArn?: string | undefined;
};

/** Result of get_resource_policy. */
export type GetResourcePolicyResult = {
  policy?: string | undefined;
};

/** Result of get_shard_iterator. */
export type GetShardIteratorResult = {
  shardIterator?: string | undefined;
};

/** Result of list_shards. */
export type ListShardsResult = {
  shards?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_stream_consumers. */
export type ListStreamConsumersResult = {
  consumers?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_tags_for_resource. */
export type ListTagsForResourceResult = {
  tags?: Record<string, unknown>[];
};

/** Result of list_tags_for_stream. */
export type ListTagsForStreamResult = {
  tags?: Record<string, unknown>[];
  hasMoreTags?: boolean | undefined;
};

/** Result of register_stream_consumer. */
export type RegisterStreamConsumerResult = {
  consumer?: Record<string, unknown>;
};

/** Result of subscribe_to_shard. */
export type SubscribeToShardResult = {
  eventStream?: Record<string, unknown>;
};

/** Result of update_account_settings. */
export type UpdateAccountSettingsResult = {
  minimumThroughputBillingCommitment?: Record<string, unknown>;
};

/** Result of update_shard_count. */
export type UpdateShardCountResult = {
  streamName?: string | undefined;
  currentShardCount?: number | undefined;
  targetShardCount?: number | undefined;
  streamArn?: string | undefined;
};

/** Result of update_stream_warm_throughput. */
export type UpdateStreamWarmThroughputResult = {
  streamArn?: string | undefined;
  streamName?: string | undefined;
  warmThroughput?: Record<string, unknown>;
};


// ---------------------------------------------------------------------------
// Additional functions (auto-generated)
// ---------------------------------------------------------------------------

/** Add tags to stream. */
export async function addTagsToStream(tags: Record<string, unknown>): Promise<void> {
  try {
    // TODO: implement add_tags_to_stream
    throw new Error("add_tags_to_stream not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "add_tags_to_stream failed");
  }
}

/** Create stream. */
export async function createStream(streamName: string): Promise<void> {
  try {
    // TODO: implement create_stream
    throw new Error("create_stream not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_stream failed");
  }
}

/** Decrease stream retention period. */
export async function decreaseStreamRetentionPeriod(retentionPeriodHours: number): Promise<void> {
  try {
    // TODO: implement decrease_stream_retention_period
    throw new Error("decrease_stream_retention_period not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "decrease_stream_retention_period failed");
  }
}

/** Delete resource policy. */
export async function deleteResourcePolicy(resourceArn: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_resource_policy
    throw new Error("delete_resource_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_resource_policy failed");
  }
}

/** Delete stream. */
export async function deleteStream(): Promise<void> {
  try {
    // TODO: implement delete_stream
    throw new Error("delete_stream not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_stream failed");
  }
}

/** Deregister stream consumer. */
export async function deregisterStreamConsumer(): Promise<void> {
  try {
    // TODO: implement deregister_stream_consumer
    throw new Error("deregister_stream_consumer not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "deregister_stream_consumer failed");
  }
}

/** Describe account settings. */
export async function describeAccountSettings(regionName?: string | undefined): Promise<DescribeAccountSettingsResult> {
  try {
    // TODO: implement describe_account_settings
    throw new Error("describe_account_settings not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_account_settings failed");
  }
}

/** Describe limits. */
export async function describeLimits(regionName?: string | undefined): Promise<DescribeLimitsResult> {
  try {
    // TODO: implement describe_limits
    throw new Error("describe_limits not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_limits failed");
  }
}

/** Describe stream consumer. */
export async function describeStreamConsumer(): Promise<DescribeStreamConsumerResult> {
  try {
    // TODO: implement describe_stream_consumer
    throw new Error("describe_stream_consumer not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_stream_consumer failed");
  }
}

/** Describe stream summary. */
export async function describeStreamSummary(): Promise<DescribeStreamSummaryResult> {
  try {
    // TODO: implement describe_stream_summary
    throw new Error("describe_stream_summary not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_stream_summary failed");
  }
}

/** Disable enhanced monitoring. */
export async function disableEnhancedMonitoring(shardLevelMetrics: string[]): Promise<DisableEnhancedMonitoringResult> {
  try {
    // TODO: implement disable_enhanced_monitoring
    throw new Error("disable_enhanced_monitoring not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disable_enhanced_monitoring failed");
  }
}

/** Enable enhanced monitoring. */
export async function enableEnhancedMonitoring(shardLevelMetrics: string[]): Promise<EnableEnhancedMonitoringResult> {
  try {
    // TODO: implement enable_enhanced_monitoring
    throw new Error("enable_enhanced_monitoring not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "enable_enhanced_monitoring failed");
  }
}

/** Get resource policy. */
export async function getResourcePolicy(resourceArn: string, regionName?: string | undefined): Promise<GetResourcePolicyResult> {
  try {
    // TODO: implement get_resource_policy
    throw new Error("get_resource_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_resource_policy failed");
  }
}

/** Get shard iterator. */
export async function getShardIterator(shardId: string, shardIteratorType: string): Promise<GetShardIteratorResult> {
  try {
    // TODO: implement get_shard_iterator
    throw new Error("get_shard_iterator not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_shard_iterator failed");
  }
}

/** Increase stream retention period. */
export async function increaseStreamRetentionPeriod(retentionPeriodHours: number): Promise<void> {
  try {
    // TODO: implement increase_stream_retention_period
    throw new Error("increase_stream_retention_period not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "increase_stream_retention_period failed");
  }
}

/** List shards. */
export async function listShards(): Promise<ListShardsResult> {
  try {
    // TODO: implement list_shards
    throw new Error("list_shards not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_shards failed");
  }
}

/** List stream consumers. */
export async function listStreamConsumers(streamArn: string): Promise<ListStreamConsumersResult> {
  try {
    // TODO: implement list_stream_consumers
    throw new Error("list_stream_consumers not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_stream_consumers failed");
  }
}

/** List tags for resource. */
export async function listTagsForResource(resourceArn: string, regionName?: string | undefined): Promise<ListTagsForResourceResult> {
  try {
    // TODO: implement list_tags_for_resource
    throw new Error("list_tags_for_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_tags_for_resource failed");
  }
}

/** List tags for stream. */
export async function listTagsForStream(): Promise<ListTagsForStreamResult> {
  try {
    // TODO: implement list_tags_for_stream
    throw new Error("list_tags_for_stream not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_tags_for_stream failed");
  }
}

/** Merge shards. */
export async function mergeShards(shardToMerge: string, adjacentShardToMerge: string): Promise<void> {
  try {
    // TODO: implement merge_shards
    throw new Error("merge_shards not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "merge_shards failed");
  }
}

/** Put resource policy. */
export async function putResourcePolicy(resourceArn: string, policy: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement put_resource_policy
    throw new Error("put_resource_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_resource_policy failed");
  }
}

/** Register stream consumer. */
export async function registerStreamConsumer(streamArn: string, consumerName: string): Promise<RegisterStreamConsumerResult> {
  try {
    // TODO: implement register_stream_consumer
    throw new Error("register_stream_consumer not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "register_stream_consumer failed");
  }
}

/** Remove tags from stream. */
export async function removeTagsFromStream(tagKeys: string[]): Promise<void> {
  try {
    // TODO: implement remove_tags_from_stream
    throw new Error("remove_tags_from_stream not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "remove_tags_from_stream failed");
  }
}

/** Split shard. */
export async function splitShard(shardToSplit: string, newStartingHashKey: string): Promise<void> {
  try {
    // TODO: implement split_shard
    throw new Error("split_shard not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "split_shard failed");
  }
}

/** Start stream encryption. */
export async function startStreamEncryption(encryptionType: string, keyId: string): Promise<void> {
  try {
    // TODO: implement start_stream_encryption
    throw new Error("start_stream_encryption not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_stream_encryption failed");
  }
}

/** Stop stream encryption. */
export async function stopStreamEncryption(encryptionType: string, keyId: string): Promise<void> {
  try {
    // TODO: implement stop_stream_encryption
    throw new Error("stop_stream_encryption not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "stop_stream_encryption failed");
  }
}

/** Subscribe to shard. */
export async function subscribeToShard(consumerArn: string, shardId: string, startingPosition: Record<string, unknown>, regionName?: string | undefined): Promise<SubscribeToShardResult> {
  try {
    // TODO: implement subscribe_to_shard
    throw new Error("subscribe_to_shard not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "subscribe_to_shard failed");
  }
}

/** Tag resource. */
export async function tagResource(tags: Record<string, unknown>, resourceArn: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement tag_resource
    throw new Error("tag_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "tag_resource failed");
  }
}

/** Untag resource. */
export async function untagResource(tagKeys: string[], resourceArn: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement untag_resource
    throw new Error("untag_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "untag_resource failed");
  }
}

/** Update account settings. */
export async function updateAccountSettings(minimumThroughputBillingCommitment: Record<string, unknown>, regionName?: string | undefined): Promise<UpdateAccountSettingsResult> {
  try {
    // TODO: implement update_account_settings
    throw new Error("update_account_settings not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_account_settings failed");
  }
}

/** Update max record size. */
export async function updateMaxRecordSize(maxRecordSizeInKiB: number): Promise<void> {
  try {
    // TODO: implement update_max_record_size
    throw new Error("update_max_record_size not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_max_record_size failed");
  }
}

/** Update shard count. */
export async function updateShardCount(targetShardCount: number, scalingType: string): Promise<UpdateShardCountResult> {
  try {
    // TODO: implement update_shard_count
    throw new Error("update_shard_count not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_shard_count failed");
  }
}

/** Update stream mode. */
export async function updateStreamMode(streamArn: string, streamModeDetails: Record<string, unknown>): Promise<void> {
  try {
    // TODO: implement update_stream_mode
    throw new Error("update_stream_mode not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_stream_mode failed");
  }
}

/** Update stream warm throughput. */
export async function updateStreamWarmThroughput(warmThroughputMiBps: number): Promise<UpdateStreamWarmThroughputResult> {
  try {
    // TODO: implement update_stream_warm_throughput
    throw new Error("update_stream_warm_throughput not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_stream_warm_throughput failed");
  }
}
