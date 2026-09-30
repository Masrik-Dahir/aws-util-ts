/**
 * aws-util/database-migration — Database migration and failover utilities.
 *
 * Multi-service module combining DynamoDB + S3 + RDS + Route53 + Secrets
 * Manager to provide DynamoDB table migration with optional transforms
 * and RDS blue/green orchestration with DNS switching.
 *
 * All functions obtain clients via {@link getClient} and wrap errors
 * through {@link wrapAwsError}.
 *
 * @example
 * ```ts
 * import {
 *   dynamodbTableMigrator,
 *   rdsBlueGreenOrchestrator,
 * } from "./database-migration.js";
 *
 * const migration = await dynamodbTableMigrator(
 *   "orders-v1",
 *   "orders-v2",
 *   (item) => ({ ...item, version: 2 }),
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
  BatchWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import {
  RDSClient,
  CreateDBSnapshotCommand,
  DescribeDBSnapshotsCommand,
  RestoreDBInstanceFromDBSnapshotCommand,
  DescribeDBInstancesCommand,
} from "@aws-sdk/client-rds";
import {
  Route53Client,
  ChangeResourceRecordSetsCommand,
} from "@aws-sdk/client-route-53";
import { getClient } from "./client.js";
import {
  wrapAwsError,
  AwsTimeoutError,
} from "./exceptions.js";

// ---------------------------------------------------------------------------
// Zod schemas & inferred types
// ---------------------------------------------------------------------------

/** Schema for DynamoDB table migration results. */
export const TableMigrationResultSchema = z.object({
  sourceTable: z.string(),
  targetTable: z.string(),
  itemsMigrated: z.number(),
  status: z.string(),
});

/** Result of a DynamoDB table migration. */
export type TableMigrationResult = z.infer<
  typeof TableMigrationResultSchema
>;

/** Schema for RDS blue/green orchestration results. */
export const RDSBlueGreenResultSchema = z.object({
  sourceInstance: z.string(),
  targetInstance: z.string(),
  status: z.string(),
  endpoint: z.string().optional(),
});

/** Result of an RDS blue/green orchestration. */
export type RDSBlueGreenResult = z.infer<
  typeof RDSBlueGreenResultSchema
>;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Migrate data between DynamoDB tables.
 *
 * Scans all items from the source table, optionally applies a transform
 * function, then batch-writes to the target table. Handles pagination
 * of the source scan and chunking for batch writes.
 *
 * @param sourceTable - Source DynamoDB table name.
 * @param targetTable - Target DynamoDB table name.
 * @param transformFn - Optional function to transform each item during migration.
 * @param batchSize - Batch write size (max 25). Defaults to 25.
 * @param region - AWS region. Defaults to SDK default.
 * @returns Migration result with item count and status.
 *
 * @example
 * ```ts
 * const result = await dynamodbTableMigrator(
 *   "users-v1",
 *   "users-v2",
 *   (item) => ({ ...item, migratedAt: new Date().toISOString() }),
 * );
 * ```
 */
export async function dynamodbTableMigrator(
  sourceTable: string,
  targetTable: string,
  transformFn?: (
    item: Record<string, unknown>,
  ) => Record<string, unknown>,
  batchSize?: number,
  region?: string,
): Promise<TableMigrationResult> {
  try {
    const ddb = DynamoDBDocumentClient.from(
      getClient(DynamoDBClient, region),
    );
    const maxBatch = Math.min(batchSize ?? 25, 25);
    let itemsMigrated = 0;
    let lastEvaluatedKey:
      | Record<string, unknown>
      | undefined;

    do {
      // Scan source table
      const scanResp = await ddb.send(
        new ScanCommand({
          TableName: sourceTable,
          ExclusiveStartKey: lastEvaluatedKey,
        }),
      );

      const items = scanResp.Items ?? [];
      lastEvaluatedKey = scanResp.LastEvaluatedKey as
        | Record<string, unknown>
        | undefined;

      // Process items in batches
      for (let i = 0; i < items.length; i += maxBatch) {
        const batch = items.slice(i, i + maxBatch);
        const writeRequests = batch.map((item) => {
          const transformed = transformFn
            ? transformFn(item as Record<string, unknown>)
            : item;
          return { PutRequest: { Item: transformed } };
        });

        await ddb.send(
          new BatchWriteCommand({
            RequestItems: {
              [targetTable]: writeRequests,
            },
          }),
        );

        itemsMigrated += batch.length;
      }
    } while (lastEvaluatedKey);

    const result: TableMigrationResult = {
      sourceTable,
      targetTable,
      itemsMigrated,
      status: "COMPLETED",
    };
    return TableMigrationResultSchema.parse(result);
  } catch (err) {
    throw wrapAwsError(err, "dynamodbTableMigrator failed");
  }
}

/**
 * Orchestrate an RDS blue/green deployment.
 *
 * Creates a snapshot of the source instance (or uses a provided snapshot),
 * restores to a new target instance, waits for the target to become
 * available, and optionally switches a Route53 DNS record to point at
 * the new instance endpoint.
 *
 * @param sourceInstanceId - Source RDS instance identifier.
 * @param targetInstanceId - Target RDS instance identifier.
 * @param snapshotId - Optional snapshot ID to use. A new one is created if omitted.
 * @param switchDns - Optional Route53 DNS switch config.
 * @param region - AWS region. Defaults to SDK default.
 * @returns Orchestration result with status and endpoint.
 *
 * @example
 * ```ts
 * const result = await rdsBlueGreenOrchestrator(
 *   "prod-db",
 *   "prod-db-green",
 *   undefined,
 *   { hostedZoneId: "Z1234", recordName: "db.example.com" },
 * );
 * ```
 */
export async function rdsBlueGreenOrchestrator(
  sourceInstanceId: string,
  targetInstanceId: string,
  snapshotId?: string,
  switchDns?: { hostedZoneId: string; recordName: string },
  region?: string,
): Promise<RDSBlueGreenResult> {
  try {
    const rds = getClient(RDSClient, region);

    // Step 1: Create snapshot if not provided
    const effectiveSnapshotId =
      snapshotId ??
      `${sourceInstanceId}-bg-${Date.now()}`;

    if (!snapshotId) {
      await rds.send(
        new CreateDBSnapshotCommand({
          DBSnapshotIdentifier: effectiveSnapshotId,
          DBInstanceIdentifier: sourceInstanceId,
        }),
      );

      // Wait for snapshot to be available
      const snapshotStart = Date.now();
      const snapshotTimeout = 600_000; // 10 minutes
      while (Date.now() - snapshotStart < snapshotTimeout) {
        const descResp = await rds.send(
          new DescribeDBSnapshotsCommand({
            DBSnapshotIdentifier: effectiveSnapshotId,
          }),
        );
        const status =
          descResp.DBSnapshots?.[0]?.Status ?? "unknown";
        if (status === "available") {
          break;
        }
        if (status === "failed") {
          throw new Error(
            `Snapshot ${effectiveSnapshotId} creation failed`,
          );
        }
        await new Promise((r) => setTimeout(r, 10_000));
      }
    }

    // Step 2: Restore to target instance
    await rds.send(
      new RestoreDBInstanceFromDBSnapshotCommand({
        DBInstanceIdentifier: targetInstanceId,
        DBSnapshotIdentifier: effectiveSnapshotId,
      }),
    );

    // Step 3: Wait for target instance to become available
    const instanceStart = Date.now();
    const instanceTimeout = 900_000; // 15 minutes
    let endpoint: string | undefined;

    while (Date.now() - instanceStart < instanceTimeout) {
      const descResp = await rds.send(
        new DescribeDBInstancesCommand({
          DBInstanceIdentifier: targetInstanceId,
        }),
      );
      const instance = descResp.DBInstances?.[0];
      const status = instance?.DBInstanceStatus ?? "unknown";

      if (status === "available") {
        endpoint =
          instance?.Endpoint?.Address ?? undefined;
        break;
      }
      if (status === "failed") {
        throw new Error(
          `Target instance ${targetInstanceId} restoration failed`,
        );
      }
      await new Promise((r) => setTimeout(r, 15_000));
    }

    if (!endpoint) {
      throw new AwsTimeoutError(
        `Target instance ${targetInstanceId} did not become available`,
      );
    }

    // Step 4: Switch DNS if configured
    if (switchDns) {
      const r53 = getClient(Route53Client, region);
      await r53.send(
        new ChangeResourceRecordSetsCommand({
          HostedZoneId: switchDns.hostedZoneId,
          ChangeBatch: {
            Changes: [
              {
                Action: "UPSERT",
                ResourceRecordSet: {
                  Name: switchDns.recordName,
                  Type: "CNAME",
                  TTL: 60,
                  ResourceRecords: [
                    { Value: endpoint },
                  ],
                },
              },
            ],
            Comment: `Blue/green switch to ${targetInstanceId}`,
          },
        }),
      );
    }

    const result: RDSBlueGreenResult = {
      sourceInstance: sourceInstanceId,
      targetInstance: targetInstanceId,
      status: "COMPLETED",
      endpoint,
    };
    return RDSBlueGreenResultSchema.parse(result);
  } catch (err) {
    throw wrapAwsError(
      err,
      "rdsBlueGreenOrchestrator failed",
    );
  }
}
