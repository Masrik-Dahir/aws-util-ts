/**
 * aws-util/dynamodb — High-level Amazon DynamoDB utilities.
 *
 * Provides typed, ergonomic wrappers around the AWS SDK v3 DynamoDB
 * DocumentClient for common operations: CRUD, queries, scans, batch
 * read/write, transactions, and atomic counters.
 *
 * All functions obtain a DynamoDBClient via {@link getClient}, wrap it in
 * a DynamoDBDocumentClient for simplified marshalling, and wrap errors
 * through {@link wrapAwsError}.
 *
 * @module
 */

import { z } from "zod";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
  QueryCommand,
  ScanCommand,
  BatchGetCommand,
  BatchWriteCommand,
  TransactWriteCommand,
  TransactGetCommand,
} from "@aws-sdk/lib-dynamodb";
import type {
  TransactWriteCommandInput,
  TransactGetCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { getClient } from "./client.js";
import { wrapAwsError } from "./exceptions.js";

// ---------------------------------------------------------------------------
// Zod schemas & inferred types
// ---------------------------------------------------------------------------

/**
 * Schema for a DynamoDB primary key expressed with named key attributes.
 *
 * Use {@link dynamoKeyToDict} to convert into the `Record<string, unknown>`
 * format expected by the DocumentClient.
 */
export const DynamoKeySchema = z.object({
  partitionKey: z.string(),
  partitionValue: z.unknown(),
  sortKey: z.string().optional(),
  sortValue: z.unknown().optional(),
});
/** A DynamoDB primary key with named partition (and optional sort) key. */
export type DynamoKey = z.infer<typeof DynamoKeySchema>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Convert a {@link DynamoKey} or a plain `Record` into the key dictionary
 * format expected by DocumentClient commands.
 *
 * If the input is already a plain `Record<string, unknown>` it is returned
 * as-is. If it is a {@link DynamoKey}, the named fields are mapped to a
 * dictionary `{ [partitionKey]: partitionValue, [sortKey]: sortValue }`.
 *
 * @param key - A DynamoKey object or a plain key record.
 * @returns A key dictionary suitable for DocumentClient commands.
 */
function dynamoKeyToDict(
  key: DynamoKey | Record<string, unknown>,
): Record<string, unknown> {
  // If the object has the DynamoKey shape, convert it
  if (
    "partitionKey" in key &&
    "partitionValue" in key &&
    typeof (key as DynamoKey).partitionKey === "string"
  ) {
    const dk = key as DynamoKey;
    const result: Record<string, unknown> = {
      [dk.partitionKey]: dk.partitionValue,
    };
    if (dk.sortKey !== undefined && dk.sortValue !== undefined) {
      result[dk.sortKey] = dk.sortValue;
    }
    return result;
  }
  // Already a plain dict
  return key as Record<string, unknown>;
}

/**
 * Internal cache of DynamoDBDocumentClient instances keyed by region.
 * Each is backed by a raw DynamoDBClient obtained through getClient.
 */
const docClientCache = new Map<string, DynamoDBDocumentClient>();

/**
 * Get a DynamoDBDocumentClient for the given region.
 *
 * Uses the cached raw DynamoDBClient from getClient and wraps it in a
 * DocumentClient with `marshallOptions.removeUndefinedValues = true`.
 */
function docClient(region?: string): DynamoDBDocumentClient {
  const cacheKey = region ?? "__default__";
  const existing = docClientCache.get(cacheKey);
  if (existing) {
    return existing;
  }
  const raw = getClient(DynamoDBClient, region);
  const doc = DynamoDBDocumentClient.from(raw, {
    marshallOptions: {
      removeUndefinedValues: true,
    },
  });
  docClientCache.set(cacheKey, doc);
  return doc;
}

// ---------------------------------------------------------------------------
// Single-item CRUD
// ---------------------------------------------------------------------------

/**
 * Get a single item from a DynamoDB table by primary key.
 *
 * @param tableName - The DynamoDB table name.
 * @param key - The primary key as a {@link DynamoKey} or plain record.
 * @param consistentRead - Use strongly consistent reads (default `false`).
 * @param region - AWS region override.
 * @returns The item as a record, or `null` if not found.
 */
export async function getItem(
  tableName: string,
  key: DynamoKey | Record<string, unknown>,
  consistentRead = false,
  region?: string,
): Promise<Record<string, unknown> | null> {
  try {
    const resp = await docClient(region).send(
      new GetCommand({
        TableName: tableName,
        Key: dynamoKeyToDict(key),
        ConsistentRead: consistentRead,
      }),
    );
    return (resp.Item as Record<string, unknown>) ?? null;
  } catch (err) {
    throw wrapAwsError(err, `getItem ${tableName}`);
  }
}

/**
 * Put (create or overwrite) an item in a DynamoDB table.
 *
 * @param tableName - The DynamoDB table name.
 * @param item - The full item to write.
 * @param condition - Optional ConditionExpression to apply.
 * @param region - AWS region override.
 */
export async function putItem(
  tableName: string,
  item: Record<string, unknown>,
  condition?: string,
  region?: string,
): Promise<void> {
  try {
    await docClient(region).send(
      new PutCommand({
        TableName: tableName,
        Item: item,
        ...(condition
          ? { ConditionExpression: condition }
          : {}),
      }),
    );
  } catch (err) {
    throw wrapAwsError(err, `putItem ${tableName}`);
  }
}

/**
 * Update specific attributes of an item in a DynamoDB table.
 *
 * Builds a SET expression from the `updates` record, using aliased
 * attribute names (`#attr_0`, `#attr_1`, ...) and values (`:val_0`,
 * `:val_1`, ...) to avoid reserved-word collisions.
 *
 * @param tableName - The DynamoDB table name.
 * @param key - The primary key as a {@link DynamoKey} or plain record.
 * @param updates - A record of attribute names to their new values.
 * @param region - AWS region override.
 * @returns The updated item attributes (ALL_NEW).
 */
export async function updateItem(
  tableName: string,
  key: DynamoKey | Record<string, unknown>,
  updates: Record<string, unknown>,
  region?: string,
): Promise<Record<string, unknown>> {
  const entries = Object.entries(updates);
  if (entries.length === 0) {
    // Nothing to update; just return the current item
    const current = await getItem(tableName, key, false, region);
    return current ?? {};
  }

  const expressionParts: string[] = [];
  const expressionNames: Record<string, string> = {};
  const expressionValues: Record<string, unknown> = {};

  entries.forEach(([attr, val], i) => {
    const nameAlias = `#attr_${i}`;
    const valueAlias = `:val_${i}`;
    expressionParts.push(`${nameAlias} = ${valueAlias}`);
    expressionNames[nameAlias] = attr;
    expressionValues[valueAlias] = val;
  });

  const updateExpression = `SET ${expressionParts.join(", ")}`;

  try {
    const resp = await docClient(region).send(
      new UpdateCommand({
        TableName: tableName,
        Key: dynamoKeyToDict(key),
        UpdateExpression: updateExpression,
        ExpressionAttributeNames: expressionNames,
        ExpressionAttributeValues: expressionValues,
        ReturnValues: "ALL_NEW",
      }),
    );
    return (resp.Attributes as Record<string, unknown>) ?? {};
  } catch (err) {
    throw wrapAwsError(err, `updateItem ${tableName}`);
  }
}

/**
 * Delete a single item from a DynamoDB table by primary key.
 *
 * @param tableName - The DynamoDB table name.
 * @param key - The primary key as a {@link DynamoKey} or plain record.
 * @param condition - Optional ConditionExpression to apply.
 * @param region - AWS region override.
 */
export async function deleteItem(
  tableName: string,
  key: DynamoKey | Record<string, unknown>,
  condition?: string,
  region?: string,
): Promise<void> {
  try {
    await docClient(region).send(
      new DeleteCommand({
        TableName: tableName,
        Key: dynamoKeyToDict(key),
        ...(condition
          ? { ConditionExpression: condition }
          : {}),
      }),
    );
  } catch (err) {
    throw wrapAwsError(err, `deleteItem ${tableName}`);
  }
}

// ---------------------------------------------------------------------------
// Query & Scan
// ---------------------------------------------------------------------------

/**
 * Query a DynamoDB table or index, auto-paginating through all results.
 *
 * @param tableName - The DynamoDB table name.
 * @param keyCondition - A KeyConditionExpression string
 *   (e.g. `"pk = :pk AND begins_with(sk, :prefix)"`).
 * @param expressionValues - ExpressionAttributeValues as a plain record
 *   (e.g. `{ ":pk": "user#123", ":prefix": "order#" }`).
 * @param filterExpression - Optional FilterExpression to apply after the key
 *   condition.
 * @param indexName - Optional Global or Local secondary index name.
 * @param limit - Maximum number of items to return (across all pages).
 *   `undefined` means no limit.
 * @param scanIndexForward - Sort order for the sort key. `true` (default)
 *   for ascending, `false` for descending.
 * @param region - AWS region override.
 * @returns An array of matching items.
 */
export async function query(
  tableName: string,
  keyCondition: string,
  expressionValues: Record<string, unknown>,
  filterExpression?: string,
  indexName?: string,
  limit?: number,
  scanIndexForward = true,
  region?: string,
): Promise<Record<string, unknown>[]> {
  const results: Record<string, unknown>[] = [];
  let exclusiveStartKey: Record<string, unknown> | undefined;

  try {
    do {
      const pageLimit =
        limit !== undefined ? limit - results.length : undefined;
      const resp = await docClient(region).send(
        new QueryCommand({
          TableName: tableName,
          KeyConditionExpression: keyCondition,
          ExpressionAttributeValues: expressionValues,
          ...(filterExpression
            ? { FilterExpression: filterExpression }
            : {}),
          ...(indexName ? { IndexName: indexName } : {}),
          ...(pageLimit !== undefined ? { Limit: pageLimit } : {}),
          ScanIndexForward: scanIndexForward,
          ExclusiveStartKey: exclusiveStartKey,
        }),
      );

      const items = (resp.Items ?? []) as Record<string, unknown>[];
      results.push(...items);

      exclusiveStartKey = resp.LastEvaluatedKey as
        | Record<string, unknown>
        | undefined;

      // Stop if we have enough items
      if (limit !== undefined && results.length >= limit) {
        break;
      }
    } while (exclusiveStartKey);
  } catch (err) {
    throw wrapAwsError(err, `query ${tableName}`);
  }

  return limit !== undefined ? results.slice(0, limit) : results;
}

/**
 * Scan a DynamoDB table or index, auto-paginating through all results.
 *
 * @param tableName - The DynamoDB table name.
 * @param filterExpression - Optional FilterExpression to apply.
 * @param expressionValues - Optional ExpressionAttributeValues as a plain
 *   record.
 * @param indexName - Optional Global or Local secondary index name.
 * @param limit - Maximum number of items to return. `undefined` means no
 *   limit.
 * @param region - AWS region override.
 * @returns An array of matching items.
 */
export async function scan(
  tableName: string,
  filterExpression?: string,
  expressionValues?: Record<string, unknown>,
  indexName?: string,
  limit?: number,
  region?: string,
): Promise<Record<string, unknown>[]> {
  const results: Record<string, unknown>[] = [];
  let exclusiveStartKey: Record<string, unknown> | undefined;

  try {
    do {
      const pageLimit =
        limit !== undefined ? limit - results.length : undefined;
      const resp = await docClient(region).send(
        new ScanCommand({
          TableName: tableName,
          ...(filterExpression
            ? { FilterExpression: filterExpression }
            : {}),
          ...(expressionValues
            ? { ExpressionAttributeValues: expressionValues }
            : {}),
          ...(indexName ? { IndexName: indexName } : {}),
          ...(pageLimit !== undefined ? { Limit: pageLimit } : {}),
          ExclusiveStartKey: exclusiveStartKey,
        }),
      );

      const items = (resp.Items ?? []) as Record<string, unknown>[];
      results.push(...items);

      exclusiveStartKey = resp.LastEvaluatedKey as
        | Record<string, unknown>
        | undefined;

      if (limit !== undefined && results.length >= limit) {
        break;
      }
    } while (exclusiveStartKey);
  } catch (err) {
    throw wrapAwsError(err, `scan ${tableName}`);
  }

  return limit !== undefined ? results.slice(0, limit) : results;
}

// ---------------------------------------------------------------------------
// Batch operations
// ---------------------------------------------------------------------------

/**
 * Batch-get multiple items from a DynamoDB table.
 *
 * Automatically retries unprocessed keys (exponential backoff) to handle
 * throughput limits.
 *
 * @param tableName - The DynamoDB table name.
 * @param keys - Array of primary keys (each a {@link DynamoKey} or plain
 *   record).
 * @param region - AWS region override.
 * @returns An array of retrieved items.
 */
export async function batchGet(
  tableName: string,
  keys: Array<DynamoKey | Record<string, unknown>>,
  region?: string,
): Promise<Record<string, unknown>[]> {
  if (keys.length === 0) {
    return [];
  }

  const results: Record<string, unknown>[] = [];
  // BatchGetItem supports max 100 keys per request
  const batchSize = 100;

  try {
    for (let i = 0; i < keys.length; i += batchSize) {
      let requestKeys = keys
        .slice(i, i + batchSize)
        .map((k) => dynamoKeyToDict(k));

      let retries = 0;
      const maxRetries = 5;

      while (requestKeys.length > 0 && retries <= maxRetries) {
        const resp = await docClient(region).send(
          new BatchGetCommand({
            RequestItems: {
              [tableName]: {
                Keys: requestKeys,
              },
            },
          }),
        );

        const items = resp.Responses?.[tableName] ?? [];
        results.push(
          ...(items as Record<string, unknown>[]),
        );

        // Handle unprocessed keys
        const unprocessed =
          resp.UnprocessedKeys?.[tableName]?.Keys;
        if (unprocessed && unprocessed.length > 0) {
          requestKeys =
            unprocessed as Record<string, unknown>[];
          retries++;
          // Exponential backoff: 50ms, 100ms, 200ms, 400ms, 800ms
          await new Promise((resolve) =>
            setTimeout(resolve, 50 * Math.pow(2, retries - 1)),
          );
        } else {
          break;
        }
      }
    }
  } catch (err) {
    throw wrapAwsError(err, `batchGet ${tableName}`);
  }

  return results;
}

/**
 * Batch-write (put) multiple items to a DynamoDB table.
 *
 * Items are written in chunks of 25 (the DynamoDB API limit).
 * Unprocessed items are retried with exponential backoff.
 *
 * @param tableName - The DynamoDB table name.
 * @param items - Array of items to write.
 * @param region - AWS region override.
 */
export async function batchWrite(
  tableName: string,
  items: Record<string, unknown>[],
  region?: string,
): Promise<void> {
  if (items.length === 0) {
    return;
  }

  const chunkSize = 25;

  try {
    for (let i = 0; i < items.length; i += chunkSize) {
      let writeRequests = items
        .slice(i, i + chunkSize)
        .map((item) => ({ PutRequest: { Item: item } }));

      let retries = 0;
      const maxRetries = 5;

      while (writeRequests.length > 0 && retries <= maxRetries) {
        const resp = await docClient(region).send(
          new BatchWriteCommand({
            RequestItems: {
              [tableName]: writeRequests,
            },
          }),
        );

        // Handle unprocessed items
        const unprocessed =
          resp.UnprocessedItems?.[tableName];
        if (unprocessed && unprocessed.length > 0) {
          writeRequests = unprocessed as Array<{
            PutRequest: { Item: Record<string, unknown> };
          }>;
          retries++;
          await new Promise((resolve) =>
            setTimeout(resolve, 50 * Math.pow(2, retries - 1)),
          );
        } else {
          break;
        }
      }
    }
  } catch (err) {
    throw wrapAwsError(err, `batchWrite ${tableName}`);
  }
}

// ---------------------------------------------------------------------------
// Transactions
// ---------------------------------------------------------------------------

/**
 * Execute a transactional write across one or more DynamoDB tables.
 *
 * Accepts the full `TransactItems` array from the AWS SDK. Each item
 * can be a Put, Update, Delete, or ConditionCheck.
 *
 * @param operations - The TransactItems array as defined by
 *   `TransactWriteCommandInput["TransactItems"]`.
 * @param region - AWS region override.
 */
export async function transactWrite(
  operations: NonNullable<
    TransactWriteCommandInput["TransactItems"]
  >,
  region?: string,
): Promise<void> {
  try {
    await docClient(region).send(
      new TransactWriteCommand({
        TransactItems: operations,
      }),
    );
  } catch (err) {
    throw wrapAwsError(err, "transactWrite");
  }
}

/**
 * Execute a transactional get across one or more DynamoDB tables.
 *
 * Returns one result per requested item. Items that don't exist are
 * returned as `null`.
 *
 * @param items - The TransactItems array as defined by
 *   `TransactGetCommandInput["TransactItems"]`.
 * @param region - AWS region override.
 * @returns An array of items (or `null` for missing items), in the same
 *   order as the input.
 */
export async function transactGet(
  items: NonNullable<TransactGetCommandInput["TransactItems"]>,
  region?: string,
): Promise<Array<Record<string, unknown> | null>> {
  try {
    const resp = await docClient(region).send(
      new TransactGetCommand({
        TransactItems: items,
      }),
    );
    return (resp.Responses ?? []).map((r) =>
      r.Item ? (r.Item as Record<string, unknown>) : null,
    );
  } catch (err) {
    throw wrapAwsError(err, "transactGet");
  }
}

// ---------------------------------------------------------------------------
// Atomic helpers
// ---------------------------------------------------------------------------

/**
 * Atomically increment (or decrement) a numeric attribute on an item.
 *
 * Uses an ADD expression, which creates the attribute with the given
 * amount if it doesn't already exist.
 *
 * @param tableName - The DynamoDB table name.
 * @param key - The primary key as a {@link DynamoKey} or plain record.
 * @param attribute - The numeric attribute to increment.
 * @param amount - The amount to add (default 1). Use negative values to
 *   decrement.
 * @param region - AWS region override.
 * @returns The new value of the attribute after the increment.
 */
export async function atomicIncrement(
  tableName: string,
  key: DynamoKey | Record<string, unknown>,
  attribute: string,
  amount = 1,
  region?: string,
): Promise<number> {
  try {
    const resp = await docClient(region).send(
      new UpdateCommand({
        TableName: tableName,
        Key: dynamoKeyToDict(key),
        UpdateExpression: "ADD #attr :amt",
        ExpressionAttributeNames: { "#attr": attribute },
        ExpressionAttributeValues: { ":amt": amount },
        ReturnValues: "ALL_NEW",
      }),
    );
    const attrs = resp.Attributes as Record<string, unknown>;
    return (attrs?.[attribute] as number) ?? amount;
  } catch (err) {
    throw wrapAwsError(
      err,
      `atomicIncrement ${tableName}.${attribute}`,
    );
  }
}

/**
 * Put an item only if the partition key does not already exist.
 *
 * Uses a ConditionExpression of `attribute_not_exists(partitionKey)`.
 * Returns `true` if the item was created, `false` if it already existed
 * (ConditionalCheckFailedException).
 *
 * @param tableName - The DynamoDB table name.
 * @param item - The full item to write.
 * @param partitionKey - The name of the partition key attribute (used in the
 *   condition expression).
 * @param region - AWS region override.
 * @returns `true` if created, `false` if the item already exists.
 */
export async function putIfNotExists(
  tableName: string,
  item: Record<string, unknown>,
  partitionKey: string,
  region?: string,
): Promise<boolean> {
  try {
    await docClient(region).send(
      new PutCommand({
        TableName: tableName,
        Item: item,
        ConditionExpression: "attribute_not_exists(#pk)",
        ExpressionAttributeNames: { "#pk": partitionKey },
      }),
    );
    return true;
  } catch (err: unknown) {
    const record = err as Record<string, unknown>;
    const name =
      typeof record["name"] === "string" ? record["name"] : "";
    if (name === "ConditionalCheckFailedException") {
      return false;
    }
    throw wrapAwsError(err, `putIfNotExists ${tableName}`);
  }
}

// ---------------------------------------------------------------------------
// Additional types (auto-generated)
// ---------------------------------------------------------------------------

/** Result of batch_execute_statement. */
export type BatchExecuteStatementResult = {
  responses?: Record<string, unknown>[];
  consumedCapacity?: Record<string, unknown>[];
};

/** Result of batch_get_item. */
export type BatchGetItemResult = {
  responses?: Record<string, unknown>;
  unprocessedKeys?: Record<string, unknown>;
  consumedCapacity?: Record<string, unknown>[];
};

/** Result of batch_write_item. */
export type BatchWriteItemResult = {
  unprocessedItems?: Record<string, unknown>;
  itemCollectionMetrics?: Record<string, unknown>;
  consumedCapacity?: Record<string, unknown>[];
};

/** Result of create_backup. */
export type CreateBackupResult = {
  backupDetails?: Record<string, unknown>;
};

/** Result of create_global_table. */
export type CreateGlobalTableResult = {
  globalTableDescription?: Record<string, unknown>;
};

/** Result of create_table. */
export type CreateTableResult = {
  tableDescription?: Record<string, unknown>;
};

/** Result of delete_backup. */
export type DeleteBackupResult = {
  backupDescription?: Record<string, unknown>;
};

/** Result of delete_resource_policy. */
export type DeleteResourcePolicyResult = {
  revisionId?: string | undefined;
};

/** Result of delete_table. */
export type DeleteTableResult = {
  tableDescription?: Record<string, unknown>;
};

/** Result of describe_backup. */
export type DescribeBackupResult = {
  backupDescription?: Record<string, unknown>;
};

/** Result of describe_continuous_backups. */
export type DescribeContinuousBackupsResult = {
  continuousBackupsDescription?: Record<string, unknown>;
};

/** Result of describe_contributor_insights. */
export type DescribeContributorInsightsResult = {
  tableName?: string | undefined;
  indexName?: string | undefined;
  contributorInsightsRuleList?: string[];
  contributorInsightsStatus?: string | undefined;
  lastUpdateDateTime?: string | undefined;
  failureException?: Record<string, unknown>;
  contributorInsightsMode?: string | undefined;
};

/** Result of describe_endpoints. */
export type DescribeEndpointsResult = {
  endpoints?: Record<string, unknown>[];
};

/** Result of describe_export. */
export type DescribeExportResult = {
  exportDescription?: Record<string, unknown>;
};

/** Result of describe_global_table. */
export type DescribeGlobalTableResult = {
  globalTableDescription?: Record<string, unknown>;
};

/** Result of describe_global_table_settings. */
export type DescribeGlobalTableSettingsResult = {
  globalTableName?: string | undefined;
  replicaSettings?: Record<string, unknown>[];
};

/** Result of describe_import. */
export type DescribeImportResult = {
  importTableDescription?: Record<string, unknown>;
};

/** Result of describe_kinesis_streaming_destination. */
export type DescribeKinesisStreamingDestinationResult = {
  tableName?: string | undefined;
  kinesisDataStreamDestinations?: Record<string, unknown>[];
};

/** Result of describe_limits. */
export type DescribeLimitsResult = {
  accountMaxReadCapacityUnits?: number | undefined;
  accountMaxWriteCapacityUnits?: number | undefined;
  tableMaxReadCapacityUnits?: number | undefined;
  tableMaxWriteCapacityUnits?: number | undefined;
};

/** Result of describe_table. */
export type DescribeTableResult = {
  table?: Record<string, unknown>;
};

/** Result of describe_table_replica_auto_scaling. */
export type DescribeTableReplicaAutoScalingResult = {
  tableAutoScalingDescription?: Record<string, unknown>;
};

/** Result of describe_time_to_live. */
export type DescribeTimeToLiveResult = {
  timeToLiveDescription?: Record<string, unknown>;
};

/** Result of disable_kinesis_streaming_destination. */
export type DisableKinesisStreamingDestinationResult = {
  tableName?: string | undefined;
  streamArn?: string | undefined;
  destinationStatus?: string | undefined;
  enableKinesisStreamingConfiguration?: Record<string, unknown>;
};

/** Result of enable_kinesis_streaming_destination. */
export type EnableKinesisStreamingDestinationResult = {
  tableName?: string | undefined;
  streamArn?: string | undefined;
  destinationStatus?: string | undefined;
  enableKinesisStreamingConfiguration?: Record<string, unknown>;
};

/** Result of execute_statement. */
export type ExecuteStatementResult = {
  items?: Record<string, unknown>[];
  nextToken?: string | undefined;
  consumedCapacity?: Record<string, unknown>;
  lastEvaluatedKey?: Record<string, unknown>;
};

/** Result of execute_transaction. */
export type ExecuteTransactionResult = {
  responses?: Record<string, unknown>[];
  consumedCapacity?: Record<string, unknown>[];
};

/** Result of export_table_to_point_in_time. */
export type ExportTableToPointInTimeResult = {
  exportDescription?: Record<string, unknown>;
};

/** Result of get_resource_policy. */
export type GetResourcePolicyResult = {
  policy?: string | undefined;
  revisionId?: string | undefined;
};

/** Result of import_table. */
export type ImportTableResult = {
  importTableDescription?: Record<string, unknown>;
};

/** Result of list_backups. */
export type ListBackupsResult = {
  backupSummaries?: Record<string, unknown>[];
  lastEvaluatedBackupArn?: string | undefined;
};

/** Result of list_contributor_insights. */
export type ListContributorInsightsResult = {
  contributorInsightsSummaries?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_exports. */
export type ListExportsResult = {
  exportSummaries?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_global_tables. */
export type ListGlobalTablesResult = {
  globalTables?: Record<string, unknown>[];
  lastEvaluatedGlobalTableName?: string | undefined;
};

/** Result of list_imports. */
export type ListImportsResult = {
  importSummaryList?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_tables. */
export type ListTablesResult = {
  tableNames?: string[];
  lastEvaluatedTableName?: string | undefined;
};

/** Result of list_tags_of_resource. */
export type ListTagsOfResourceResult = {
  tags?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of put_resource_policy. */
export type PutResourcePolicyResult = {
  revisionId?: string | undefined;
};

/** Result of restore_table_from_backup. */
export type RestoreTableFromBackupResult = {
  tableDescription?: Record<string, unknown>;
};

/** Result of restore_table_to_point_in_time. */
export type RestoreTableToPointInTimeResult = {
  tableDescription?: Record<string, unknown>;
};

/** Result of transact_get_items. */
export type TransactGetItemsResult = {
  consumedCapacity?: Record<string, unknown>[];
  responses?: Record<string, unknown>[];
};

/** Result of transact_write_items. */
export type TransactWriteItemsResult = {
  consumedCapacity?: Record<string, unknown>[];
  itemCollectionMetrics?: Record<string, unknown>;
};

/** Result of update_continuous_backups. */
export type UpdateContinuousBackupsResult = {
  continuousBackupsDescription?: Record<string, unknown>;
};

/** Result of update_contributor_insights. */
export type UpdateContributorInsightsResult = {
  tableName?: string | undefined;
  indexName?: string | undefined;
  contributorInsightsStatus?: string | undefined;
  contributorInsightsMode?: string | undefined;
};

/** Result of update_global_table. */
export type UpdateGlobalTableResult = {
  globalTableDescription?: Record<string, unknown>;
};

/** Result of update_global_table_settings. */
export type UpdateGlobalTableSettingsResult = {
  globalTableName?: string | undefined;
  replicaSettings?: Record<string, unknown>[];
};

/** Result of update_kinesis_streaming_destination. */
export type UpdateKinesisStreamingDestinationResult = {
  tableName?: string | undefined;
  streamArn?: string | undefined;
  destinationStatus?: string | undefined;
  updateKinesisStreamingConfiguration?: Record<string, unknown>;
};

/** Result of update_table. */
export type UpdateTableResult = {
  tableDescription?: Record<string, unknown>;
};

/** Result of update_table_replica_auto_scaling. */
export type UpdateTableReplicaAutoScalingResult = {
  tableAutoScalingDescription?: Record<string, unknown>;
};

/** Result of update_time_to_live. */
export type UpdateTimeToLiveResult = {
  timeToLiveSpecification?: Record<string, unknown>;
};


// ---------------------------------------------------------------------------
// Additional functions (auto-generated)
// ---------------------------------------------------------------------------

/** Update an item using a raw DynamoDB update expression. */
export async function updateItemRaw(tableName: string, key: DynamoKey | dict[str, Any], updateExpression: string, expressionAttributeNames?: Record<string, unknown>, expressionAttributeValues?: Record<string, unknown>, conditionExpression?: unknown | undefined, returnValues: string, regionName?: string | undefined): Promise<Record<string, unknown>> {
  try {
    // TODO: implement update_item_raw
    throw new Error("update_item_raw not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_item_raw failed");
  }
}

/** Batch execute statement. */
export async function batchExecuteStatement(statements: Record<string, unknown>[]): Promise<BatchExecuteStatementResult> {
  try {
    // TODO: implement batch_execute_statement
    throw new Error("batch_execute_statement not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_execute_statement failed");
  }
}

/** Batch get item. */
export async function batchGetItem(requestItems: Record<string, unknown>): Promise<BatchGetItemResult> {
  try {
    // TODO: implement batch_get_item
    throw new Error("batch_get_item not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_get_item failed");
  }
}

/** Batch write item. */
export async function batchWriteItem(requestItems: Record<string, unknown>): Promise<BatchWriteItemResult> {
  try {
    // TODO: implement batch_write_item
    throw new Error("batch_write_item not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_write_item failed");
  }
}

/** Create backup. */
export async function createBackup(tableName: string, backupName: string, regionName?: string | undefined): Promise<CreateBackupResult> {
  try {
    // TODO: implement create_backup
    throw new Error("create_backup not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_backup failed");
  }
}

/** Create global table. */
export async function createGlobalTable(globalTableName: string, replicationGroup: Record<string, unknown>[], regionName?: string | undefined): Promise<CreateGlobalTableResult> {
  try {
    // TODO: implement create_global_table
    throw new Error("create_global_table not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_global_table failed");
  }
}

/** Create table. */
export async function createTable(attributeDefinitions: Record<string, unknown>[], tableName: string, keySchema: Record<string, unknown>[]): Promise<CreateTableResult> {
  try {
    // TODO: implement create_table
    throw new Error("create_table not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_table failed");
  }
}

/** Delete backup. */
export async function deleteBackup(backupArn: string, regionName?: string | undefined): Promise<DeleteBackupResult> {
  try {
    // TODO: implement delete_backup
    throw new Error("delete_backup not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_backup failed");
  }
}

/** Delete resource policy. */
export async function deleteResourcePolicy(resourceArn: string): Promise<DeleteResourcePolicyResult> {
  try {
    // TODO: implement delete_resource_policy
    throw new Error("delete_resource_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_resource_policy failed");
  }
}

/** Delete table. */
export async function deleteTable(tableName: string, regionName?: string | undefined): Promise<DeleteTableResult> {
  try {
    // TODO: implement delete_table
    throw new Error("delete_table not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_table failed");
  }
}

/** Describe backup. */
export async function describeBackup(backupArn: string, regionName?: string | undefined): Promise<DescribeBackupResult> {
  try {
    // TODO: implement describe_backup
    throw new Error("describe_backup not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_backup failed");
  }
}

/** Describe continuous backups. */
export async function describeContinuousBackups(tableName: string, regionName?: string | undefined): Promise<DescribeContinuousBackupsResult> {
  try {
    // TODO: implement describe_continuous_backups
    throw new Error("describe_continuous_backups not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_continuous_backups failed");
  }
}

/** Describe contributor insights. */
export async function describeContributorInsights(tableName: string): Promise<DescribeContributorInsightsResult> {
  try {
    // TODO: implement describe_contributor_insights
    throw new Error("describe_contributor_insights not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_contributor_insights failed");
  }
}

/** Describe endpoints. */
export async function describeEndpoints(regionName?: string | undefined): Promise<DescribeEndpointsResult> {
  try {
    // TODO: implement describe_endpoints
    throw new Error("describe_endpoints not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_endpoints failed");
  }
}

/** Describe export. */
export async function describeExport(exportArn: string, regionName?: string | undefined): Promise<DescribeExportResult> {
  try {
    // TODO: implement describe_export
    throw new Error("describe_export not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_export failed");
  }
}

/** Describe global table. */
export async function describeGlobalTable(globalTableName: string, regionName?: string | undefined): Promise<DescribeGlobalTableResult> {
  try {
    // TODO: implement describe_global_table
    throw new Error("describe_global_table not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_global_table failed");
  }
}

/** Describe global table settings. */
export async function describeGlobalTableSettings(globalTableName: string, regionName?: string | undefined): Promise<DescribeGlobalTableSettingsResult> {
  try {
    // TODO: implement describe_global_table_settings
    throw new Error("describe_global_table_settings not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_global_table_settings failed");
  }
}

/** Describe import. */
export async function describeImport(importArn: string, regionName?: string | undefined): Promise<DescribeImportResult> {
  try {
    // TODO: implement describe_import
    throw new Error("describe_import not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_import failed");
  }
}

/** Describe kinesis streaming destination. */
export async function describeKinesisStreamingDestination(tableName: string, regionName?: string | undefined): Promise<DescribeKinesisStreamingDestinationResult> {
  try {
    // TODO: implement describe_kinesis_streaming_destination
    throw new Error("describe_kinesis_streaming_destination not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_kinesis_streaming_destination failed");
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

/** Describe table. */
export async function describeTable(tableName: string, regionName?: string | undefined): Promise<DescribeTableResult> {
  try {
    // TODO: implement describe_table
    throw new Error("describe_table not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_table failed");
  }
}

/** Describe table replica auto scaling. */
export async function describeTableReplicaAutoScaling(tableName: string, regionName?: string | undefined): Promise<DescribeTableReplicaAutoScalingResult> {
  try {
    // TODO: implement describe_table_replica_auto_scaling
    throw new Error("describe_table_replica_auto_scaling not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_table_replica_auto_scaling failed");
  }
}

/** Describe time to live. */
export async function describeTimeToLive(tableName: string, regionName?: string | undefined): Promise<DescribeTimeToLiveResult> {
  try {
    // TODO: implement describe_time_to_live
    throw new Error("describe_time_to_live not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_time_to_live failed");
  }
}

/** Disable kinesis streaming destination. */
export async function disableKinesisStreamingDestination(tableName: string, streamArn: string): Promise<DisableKinesisStreamingDestinationResult> {
  try {
    // TODO: implement disable_kinesis_streaming_destination
    throw new Error("disable_kinesis_streaming_destination not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disable_kinesis_streaming_destination failed");
  }
}

/** Enable kinesis streaming destination. */
export async function enableKinesisStreamingDestination(tableName: string, streamArn: string): Promise<EnableKinesisStreamingDestinationResult> {
  try {
    // TODO: implement enable_kinesis_streaming_destination
    throw new Error("enable_kinesis_streaming_destination not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "enable_kinesis_streaming_destination failed");
  }
}

/** Execute statement. */
export async function executeStatement(statement: string): Promise<ExecuteStatementResult> {
  try {
    // TODO: implement execute_statement
    throw new Error("execute_statement not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "execute_statement failed");
  }
}

/** Execute transaction. */
export async function executeTransaction(transactStatements: Record<string, unknown>[]): Promise<ExecuteTransactionResult> {
  try {
    // TODO: implement execute_transaction
    throw new Error("execute_transaction not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "execute_transaction failed");
  }
}

/** Export table to point in time. */
export async function exportTableToPointInTime(tableArn: string, s3Bucket: string): Promise<ExportTableToPointInTimeResult> {
  try {
    // TODO: implement export_table_to_point_in_time
    throw new Error("export_table_to_point_in_time not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "export_table_to_point_in_time failed");
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

/** Import table. */
export async function importTable(s3BucketSource: Record<string, unknown>, inputFormat: string, tableCreationParameters: Record<string, unknown>): Promise<ImportTableResult> {
  try {
    // TODO: implement import_table
    throw new Error("import_table not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "import_table failed");
  }
}

/** List backups. */
export async function listBackups(): Promise<ListBackupsResult> {
  try {
    // TODO: implement list_backups
    throw new Error("list_backups not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_backups failed");
  }
}

/** List contributor insights. */
export async function listContributorInsights(): Promise<ListContributorInsightsResult> {
  try {
    // TODO: implement list_contributor_insights
    throw new Error("list_contributor_insights not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_contributor_insights failed");
  }
}

/** List exports. */
export async function listExports(): Promise<ListExportsResult> {
  try {
    // TODO: implement list_exports
    throw new Error("list_exports not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_exports failed");
  }
}

/** List global tables. */
export async function listGlobalTables(): Promise<ListGlobalTablesResult> {
  try {
    // TODO: implement list_global_tables
    throw new Error("list_global_tables not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_global_tables failed");
  }
}

/** List imports. */
export async function listImports(): Promise<ListImportsResult> {
  try {
    // TODO: implement list_imports
    throw new Error("list_imports not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_imports failed");
  }
}

/** List tables. */
export async function listTables(): Promise<ListTablesResult> {
  try {
    // TODO: implement list_tables
    throw new Error("list_tables not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_tables failed");
  }
}

/** List tags of resource. */
export async function listTagsOfResource(resourceArn: string): Promise<ListTagsOfResourceResult> {
  try {
    // TODO: implement list_tags_of_resource
    throw new Error("list_tags_of_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_tags_of_resource failed");
  }
}

/** Put resource policy. */
export async function putResourcePolicy(resourceArn: string, policy: string): Promise<PutResourcePolicyResult> {
  try {
    // TODO: implement put_resource_policy
    throw new Error("put_resource_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_resource_policy failed");
  }
}

/** Restore table from backup. */
export async function restoreTableFromBackup(targetTableName: string, backupArn: string): Promise<RestoreTableFromBackupResult> {
  try {
    // TODO: implement restore_table_from_backup
    throw new Error("restore_table_from_backup not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "restore_table_from_backup failed");
  }
}

/** Restore table to point in time. */
export async function restoreTableToPointInTime(targetTableName: string): Promise<RestoreTableToPointInTimeResult> {
  try {
    // TODO: implement restore_table_to_point_in_time
    throw new Error("restore_table_to_point_in_time not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "restore_table_to_point_in_time failed");
  }
}

/** Tag resource. */
export async function tagResource(resourceArn: string, tags: Record<string, unknown>[], regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement tag_resource
    throw new Error("tag_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "tag_resource failed");
  }
}

/** Transact get items. */
export async function transactGetItems(transactItems: Record<string, unknown>[]): Promise<TransactGetItemsResult> {
  try {
    // TODO: implement transact_get_items
    throw new Error("transact_get_items not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "transact_get_items failed");
  }
}

/** Transact write items. */
export async function transactWriteItems(transactItems: Record<string, unknown>[]): Promise<TransactWriteItemsResult> {
  try {
    // TODO: implement transact_write_items
    throw new Error("transact_write_items not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "transact_write_items failed");
  }
}

/** Untag resource. */
export async function untagResource(resourceArn: string, tagKeys: string[], regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement untag_resource
    throw new Error("untag_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "untag_resource failed");
  }
}

/** Update continuous backups. */
export async function updateContinuousBackups(tableName: string, pointInTimeRecoverySpecification: Record<string, unknown>, regionName?: string | undefined): Promise<UpdateContinuousBackupsResult> {
  try {
    // TODO: implement update_continuous_backups
    throw new Error("update_continuous_backups not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_continuous_backups failed");
  }
}

/** Update contributor insights. */
export async function updateContributorInsights(tableName: string, contributorInsightsAction: string): Promise<UpdateContributorInsightsResult> {
  try {
    // TODO: implement update_contributor_insights
    throw new Error("update_contributor_insights not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_contributor_insights failed");
  }
}

/** Update global table. */
export async function updateGlobalTable(globalTableName: string, replicaUpdates: Record<string, unknown>[], regionName?: string | undefined): Promise<UpdateGlobalTableResult> {
  try {
    // TODO: implement update_global_table
    throw new Error("update_global_table not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_global_table failed");
  }
}

/** Update global table settings. */
export async function updateGlobalTableSettings(globalTableName: string): Promise<UpdateGlobalTableSettingsResult> {
  try {
    // TODO: implement update_global_table_settings
    throw new Error("update_global_table_settings not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_global_table_settings failed");
  }
}

/** Update kinesis streaming destination. */
export async function updateKinesisStreamingDestination(tableName: string, streamArn: string): Promise<UpdateKinesisStreamingDestinationResult> {
  try {
    // TODO: implement update_kinesis_streaming_destination
    throw new Error("update_kinesis_streaming_destination not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_kinesis_streaming_destination failed");
  }
}

/** Update table. */
export async function updateTable(tableName: string): Promise<UpdateTableResult> {
  try {
    // TODO: implement update_table
    throw new Error("update_table not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_table failed");
  }
}

/** Update table replica auto scaling. */
export async function updateTableReplicaAutoScaling(tableName: string): Promise<UpdateTableReplicaAutoScalingResult> {
  try {
    // TODO: implement update_table_replica_auto_scaling
    throw new Error("update_table_replica_auto_scaling not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_table_replica_auto_scaling failed");
  }
}

/** Update time to live. */
export async function updateTimeToLive(tableName: string, timeToLiveSpecification: Record<string, unknown>, regionName?: string | undefined): Promise<UpdateTimeToLiveResult> {
  try {
    // TODO: implement update_time_to_live
    throw new Error("update_time_to_live not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_time_to_live failed");
  }
}
