/**
 * aws-util/rds — High-level Amazon RDS utilities.
 *
 * Provides typed, ergonomic wrappers around the AWS SDK v3 RDS client for
 * common operations: describing DB instances, starting/stopping, snapshot
 * management, polling for status, and restoring from snapshots.
 *
 * All functions obtain an RDSClient via {@link getClient} and wrap errors
 * through {@link wrapAwsError}.
 *
 * @module
 */

import { z } from "zod";
import {
  RDSClient,
  DescribeDBInstancesCommand,
  StartDBInstanceCommand,
  StopDBInstanceCommand,
  CreateDBSnapshotCommand,
  DeleteDBSnapshotCommand,
  DescribeDBSnapshotsCommand,
  RestoreDBInstanceFromDBSnapshotCommand,
} from "@aws-sdk/client-rds";
import { getClient } from "./client.js";
import {
  wrapAwsError,
  AwsServiceError,
  AwsTimeoutError,
} from "./exceptions.js";

// ---------------------------------------------------------------------------
// Zod schemas & inferred types
// ---------------------------------------------------------------------------

/** Schema for an RDS endpoint sub-object. */
const RDSEndpointSchema = z.object({
  address: z.string(),
  port: z.number(),
});

/** Schema for an RDS DB instance. */
export const RDSInstanceSchema = z.object({
  dbInstanceId: z.string(),
  dbInstanceClass: z.string(),
  engine: z.string(),
  engineVersion: z.string().optional(),
  status: z.string(),
  endpoint: RDSEndpointSchema.optional(),
  availabilityZone: z.string().optional(),
});
/** Metadata for an RDS DB instance. */
export type RDSInstance = z.infer<typeof RDSInstanceSchema>;

/** Schema for an RDS DB snapshot. */
export const RDSSnapshotSchema = z.object({
  snapshotId: z.string(),
  dbInstanceId: z.string(),
  engine: z.string(),
  status: z.string(),
  snapshotCreateTime: z.date().optional(),
  allocatedStorage: z.number().optional(),
});
/** Metadata for an RDS DB snapshot. */
export type RDSSnapshot = z.infer<typeof RDSSnapshotSchema>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Get a cached RDSClient for the given region.
 */
function rds(region?: string): RDSClient {
  return getClient(RDSClient, region);
}

// ---------------------------------------------------------------------------
// Describe / Get DB instances
// ---------------------------------------------------------------------------

/**
 * Describe one or more RDS DB instances.
 *
 * When `dbInstanceId` is provided, only that single instance is described.
 * Otherwise all instances visible to the caller are returned (paginated).
 *
 * @param dbInstanceId - Optional specific DB instance identifier.
 * @param region - AWS region override.
 * @returns An array of {@link RDSInstance} objects.
 */
export async function describeDbInstances(
  dbInstanceId?: string,
  region?: string,
): Promise<RDSInstance[]> {
  const instances: RDSInstance[] = [];
  let marker: string | undefined;

  try {
    do {
      const resp = await rds(region).send(
        new DescribeDBInstancesCommand({
          DBInstanceIdentifier: dbInstanceId,
          Marker: marker,
        }),
      );

      for (const db of resp.DBInstances ?? []) {
        const endpoint = db.Endpoint;
        instances.push(
          RDSInstanceSchema.parse({
            dbInstanceId: db.DBInstanceIdentifier ?? "",
            dbInstanceClass: db.DBInstanceClass ?? "",
            engine: db.Engine ?? "",
            engineVersion: db.EngineVersion ?? undefined,
            status: db.DBInstanceStatus ?? "unknown",
            endpoint:
              endpoint?.Address && endpoint?.Port
                ? { address: endpoint.Address, port: endpoint.Port }
                : undefined,
            availabilityZone: db.AvailabilityZone ?? undefined,
          }),
        );
      }

      marker = resp.Marker;
    } while (marker);
  } catch (err) {
    throw wrapAwsError(err, "describeDbInstances");
  }

  return instances;
}

/**
 * Fetch a single RDS DB instance by identifier.
 *
 * @param dbInstanceId - The DB instance identifier.
 * @param region - AWS region override.
 * @returns The {@link RDSInstance}, or `null` if not found.
 */
export async function getDbInstance(
  dbInstanceId: string,
  region?: string,
): Promise<RDSInstance | null> {
  try {
    const results = await describeDbInstances(dbInstanceId, region);
    return results.length > 0 ? results[0] : null;
  } catch (err) {
    // Treat DBInstanceNotFound as null
    if (
      err != null &&
      typeof err === "object" &&
      "errorCode" in err &&
      (err as Record<string, unknown>).errorCode ===
        "DBInstanceNotFoundFault"
    ) {
      return null;
    }
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Instance lifecycle
// ---------------------------------------------------------------------------

/**
 * Start a stopped RDS DB instance.
 *
 * @param dbInstanceId - The DB instance identifier.
 * @param region - AWS region override.
 */
export async function startDbInstance(
  dbInstanceId: string,
  region?: string,
): Promise<void> {
  try {
    await rds(region).send(
      new StartDBInstanceCommand({
        DBInstanceIdentifier: dbInstanceId,
      }),
    );
  } catch (err) {
    throw wrapAwsError(
      err,
      `startDbInstance ${dbInstanceId}`,
    );
  }
}

/**
 * Stop a running RDS DB instance.
 *
 * Stopped instances are not billed for compute but still incur storage costs.
 *
 * @param dbInstanceId - The DB instance identifier.
 * @param region - AWS region override.
 */
export async function stopDbInstance(
  dbInstanceId: string,
  region?: string,
): Promise<void> {
  try {
    await rds(region).send(
      new StopDBInstanceCommand({
        DBInstanceIdentifier: dbInstanceId,
      }),
    );
  } catch (err) {
    throw wrapAwsError(
      err,
      `stopDbInstance ${dbInstanceId}`,
    );
  }
}

// ---------------------------------------------------------------------------
// Snapshot operations
// ---------------------------------------------------------------------------

/**
 * Create a manual snapshot of an RDS DB instance.
 *
 * @param dbInstanceId - Source DB instance identifier.
 * @param snapshotId - Identifier for the new snapshot.
 * @param region - AWS region override.
 * @returns The newly created {@link RDSSnapshot}.
 */
export async function createDbSnapshot(
  dbInstanceId: string,
  snapshotId: string,
  region?: string,
): Promise<RDSSnapshot> {
  try {
    const resp = await rds(region).send(
      new CreateDBSnapshotCommand({
        DBInstanceIdentifier: dbInstanceId,
        DBSnapshotIdentifier: snapshotId,
      }),
    );
    const snap = resp.DBSnapshot;
    return RDSSnapshotSchema.parse({
      snapshotId: snap?.DBSnapshotIdentifier ?? snapshotId,
      dbInstanceId: snap?.DBInstanceIdentifier ?? dbInstanceId,
      engine: snap?.Engine ?? "",
      status: snap?.Status ?? "creating",
      snapshotCreateTime: snap?.SnapshotCreateTime ?? undefined,
      allocatedStorage: snap?.AllocatedStorage ?? undefined,
    });
  } catch (err) {
    throw wrapAwsError(
      err,
      `createDbSnapshot ${dbInstanceId} -> ${snapshotId}`,
    );
  }
}

/**
 * Delete a manual RDS DB snapshot.
 *
 * @param snapshotId - The snapshot identifier to delete.
 * @param region - AWS region override.
 */
export async function deleteDbSnapshot(
  snapshotId: string,
  region?: string,
): Promise<void> {
  try {
    await rds(region).send(
      new DeleteDBSnapshotCommand({
        DBSnapshotIdentifier: snapshotId,
      }),
    );
  } catch (err) {
    throw wrapAwsError(
      err,
      `deleteDbSnapshot ${snapshotId}`,
    );
  }
}

/**
 * List RDS DB snapshots, optionally filtered by instance or snapshot ID.
 *
 * @param dbInstanceId - Filter to snapshots of a specific DB instance.
 * @param snapshotId - Filter to a specific snapshot identifier.
 * @param region - AWS region override.
 * @returns An array of {@link RDSSnapshot} objects.
 */
export async function describeDbSnapshots(
  dbInstanceId?: string,
  snapshotId?: string,
  region?: string,
): Promise<RDSSnapshot[]> {
  const snapshots: RDSSnapshot[] = [];
  let marker: string | undefined;

  try {
    do {
      const resp = await rds(region).send(
        new DescribeDBSnapshotsCommand({
          DBInstanceIdentifier: dbInstanceId,
          DBSnapshotIdentifier: snapshotId,
          Marker: marker,
        }),
      );

      for (const snap of resp.DBSnapshots ?? []) {
        snapshots.push(
          RDSSnapshotSchema.parse({
            snapshotId: snap.DBSnapshotIdentifier ?? "",
            dbInstanceId: snap.DBInstanceIdentifier ?? "",
            engine: snap.Engine ?? "",
            status: snap.Status ?? "unknown",
            snapshotCreateTime:
              snap.SnapshotCreateTime ?? undefined,
            allocatedStorage:
              snap.AllocatedStorage ?? undefined,
          }),
        );
      }

      marker = resp.Marker;
    } while (marker);
  } catch (err) {
    throw wrapAwsError(err, "describeDbSnapshots");
  }

  return snapshots;
}

// ---------------------------------------------------------------------------
// Polling / wait helpers
// ---------------------------------------------------------------------------

/**
 * Poll until an RDS DB instance reaches a target status.
 *
 * @param dbInstanceId - The DB instance identifier to monitor.
 * @param targetStatus - Status to wait for (e.g. `"available"`, `"stopped"`).
 * @param timeout - Maximum time to wait in milliseconds (default 1200000).
 * @param pollInterval - Pause between polls in milliseconds (default 20000).
 * @param region - AWS region override.
 * @returns The {@link RDSInstance} once it reaches the target status.
 * @throws {AwsTimeoutError} If the instance does not reach the status in time.
 * @throws {AwsServiceError} If the instance is not found.
 */
export async function waitForDbInstance(
  dbInstanceId: string,
  targetStatus: string,
  timeout = 1_200_000,
  pollInterval = 20_000,
  region?: string,
): Promise<RDSInstance> {
  const deadline = Date.now() + timeout;

  while (true) {
    const instance = await getDbInstance(dbInstanceId, region);
    if (instance === null) {
      throw new AwsServiceError(
        `DB instance ${dbInstanceId} not found`,
      );
    }
    if (instance.status === targetStatus) {
      return instance;
    }
    if (Date.now() >= deadline) {
      throw new AwsTimeoutError(
        `DB instance ${dbInstanceId} did not reach status ` +
          `"${targetStatus}" within ${timeout}ms ` +
          `(current: "${instance.status}")`,
      );
    }
    await new Promise((resolve) => setTimeout(resolve, pollInterval));
  }
}

/**
 * Poll until an RDS snapshot reaches a target status.
 *
 * @param snapshotId - The snapshot identifier to monitor.
 * @param timeout - Maximum time to wait in milliseconds (default 1800000).
 * @param pollInterval - Pause between polls in milliseconds (default 30000).
 * @param region - AWS region override.
 * @returns The {@link RDSSnapshot} once it reaches `"available"` status.
 * @throws {AwsTimeoutError} If the snapshot does not become available in time.
 * @throws {AwsServiceError} If the snapshot is not found.
 */
export async function waitForSnapshot(
  snapshotId: string,
  timeout = 1_800_000,
  pollInterval = 30_000,
  region?: string,
): Promise<RDSSnapshot> {
  const deadline = Date.now() + timeout;

  while (true) {
    const snapshots = await describeDbSnapshots(
      undefined,
      snapshotId,
      region,
    );
    if (snapshots.length === 0) {
      throw new AwsServiceError(
        `Snapshot ${snapshotId} not found`,
      );
    }
    const snap = snapshots[0];
    if (snap.status === "available") {
      return snap;
    }
    if (Date.now() >= deadline) {
      throw new AwsTimeoutError(
        `Snapshot ${snapshotId} did not reach status "available" ` +
          `within ${timeout}ms (current: "${snap.status}")`,
      );
    }
    await new Promise((resolve) => setTimeout(resolve, pollInterval));
  }
}

// ---------------------------------------------------------------------------
// Restore from snapshot
// ---------------------------------------------------------------------------

/**
 * Restore an RDS DB instance from a snapshot.
 *
 * The returned instance will initially be in `"creating"` status. Use
 * {@link waitForDbInstance} to wait for `"available"`.
 *
 * @param dbInstanceId - Identifier for the new DB instance.
 * @param snapshotId - Identifier of the source snapshot.
 * @param dbInstanceClass - Instance class (e.g. `"db.t3.medium"`). If
 *   omitted, uses the snapshot's original class.
 * @param region - AWS region override.
 * @returns The newly created {@link RDSInstance}.
 */
export async function restoreDbFromSnapshot(
  dbInstanceId: string,
  snapshotId: string,
  dbInstanceClass?: string,
  region?: string,
): Promise<RDSInstance> {
  try {
    const resp = await rds(region).send(
      new RestoreDBInstanceFromDBSnapshotCommand({
        DBInstanceIdentifier: dbInstanceId,
        DBSnapshotIdentifier: snapshotId,
        DBInstanceClass: dbInstanceClass,
      }),
    );
    const db = resp.DBInstance;
    const endpoint = db?.Endpoint;
    return RDSInstanceSchema.parse({
      dbInstanceId: db?.DBInstanceIdentifier ?? dbInstanceId,
      dbInstanceClass: db?.DBInstanceClass ?? dbInstanceClass ?? "",
      engine: db?.Engine ?? "",
      engineVersion: db?.EngineVersion ?? undefined,
      status: db?.DBInstanceStatus ?? "creating",
      endpoint:
        endpoint?.Address && endpoint?.Port
          ? { address: endpoint.Address, port: endpoint.Port }
          : undefined,
      availabilityZone: db?.AvailabilityZone ?? undefined,
    });
  } catch (err) {
    throw wrapAwsError(
      err,
      `restoreDbFromSnapshot ${snapshotId} -> ${dbInstanceId}`,
    );
  }
}

// ---------------------------------------------------------------------------
// Additional types (auto-generated)
// ---------------------------------------------------------------------------

/** Result of add_source_identifier_to_subscription. */
export type AddSourceIdentifierToSubscriptionResult = {
  eventSubscription?: Record<string, unknown>;
};

/** Result of apply_pending_maintenance_action. */
export type ApplyPendingMaintenanceActionResult = {
  resourcePendingMaintenanceActions?: Record<string, unknown>;
};

/** Result of authorize_db_security_group_ingress. */
export type AuthorizeDbSecurityGroupIngressResult = {
  dbSecurityGroup?: Record<string, unknown>;
};

/** Result of backtrack_db_cluster. */
export type BacktrackDbClusterResult = {
  dbClusterIdentifier?: string | undefined;
  backtrackIdentifier?: string | undefined;
  backtrackTo?: string | undefined;
  backtrackedFrom?: string | undefined;
  backtrackRequestCreationTime?: string | undefined;
  status?: string | undefined;
};

/** Result of cancel_export_task. */
export type CancelExportTaskResult = {
  exportTaskIdentifier?: string | undefined;
  sourceArn?: string | undefined;
  exportOnly?: string[];
  snapshotTime?: string | undefined;
  taskStartTime?: string | undefined;
  taskEndTime?: string | undefined;
  s3Bucket?: string | undefined;
  s3Prefix?: string | undefined;
  iamRoleArn?: string | undefined;
  kmsKeyId?: string | undefined;
  status?: string | undefined;
  percentProgress?: number | undefined;
  totalExtractedDataInGb?: number | undefined;
  failureCause?: string | undefined;
  warningMessage?: string | undefined;
  sourceType?: string | undefined;
};

/** Result of copy_db_cluster_parameter_group. */
export type CopyDbClusterParameterGroupResult = {
  dbClusterParameterGroup?: Record<string, unknown>;
};

/** Result of copy_db_cluster_snapshot. */
export type CopyDbClusterSnapshotResult = {
  dbClusterSnapshot?: Record<string, unknown>;
};

/** Result of copy_db_parameter_group. */
export type CopyDbParameterGroupResult = {
  dbParameterGroup?: Record<string, unknown>;
};

/** Result of copy_db_snapshot. */
export type CopyDbSnapshotResult = {
  dbSnapshot?: Record<string, unknown>;
};

/** Result of copy_option_group. */
export type CopyOptionGroupResult = {
  optionGroup?: Record<string, unknown>;
};

/** Result of create_blue_green_deployment. */
export type CreateBlueGreenDeploymentResult = {
  blueGreenDeployment?: Record<string, unknown>;
};

/** Result of create_custom_db_engine_version. */
export type CreateCustomDbEngineVersionResult = {
  engine?: string | undefined;
  majorEngineVersion?: string | undefined;
  engineVersion?: string | undefined;
  databaseInstallationFilesS3BucketName?: string | undefined;
  databaseInstallationFilesS3Prefix?: string | undefined;
  customDbEngineVersionManifest?: string | undefined;
  dbParameterGroupFamily?: string | undefined;
  dbEngineDescription?: string | undefined;
  dbEngineVersionArn?: string | undefined;
  dbEngineVersionDescription?: string | undefined;
  defaultCharacterSet?: Record<string, unknown>;
  image?: Record<string, unknown>;
  dbEngineMediaType?: string | undefined;
  kmsKeyId?: string | undefined;
  createTime?: string | undefined;
  supportedCharacterSets?: Record<string, unknown>[];
  supportedNcharCharacterSets?: Record<string, unknown>[];
  validUpgradeTarget?: Record<string, unknown>[];
  supportedTimezones?: Record<string, unknown>[];
  exportableLogTypes?: string[];
  supportsLogExportsToCloudwatchLogs?: boolean | undefined;
  supportsReadReplica?: boolean | undefined;
  supportedEngineModes?: string[];
  supportedFeatureNames?: string[];
  status?: string | undefined;
  supportsParallelQuery?: boolean | undefined;
  supportsGlobalDatabases?: boolean | undefined;
  tagList?: Record<string, unknown>[];
  supportsBabelfish?: boolean | undefined;
  supportsLimitlessDatabase?: boolean | undefined;
  supportsCertificateRotationWithoutRestart?: boolean | undefined;
  supportedCaCertificateIdentifiers?: string[];
  supportsLocalWriteForwarding?: boolean | undefined;
  supportsIntegrations?: boolean | undefined;
  serverlessV2FeaturesSupport?: Record<string, unknown>;
};

/** Result of create_db_cluster. */
export type CreateDbClusterResult = {
  dbCluster?: Record<string, unknown>;
};

/** Result of create_db_cluster_endpoint. */
export type CreateDbClusterEndpointResult = {
  dbClusterEndpointIdentifier?: string | undefined;
  dbClusterIdentifier?: string | undefined;
  dbClusterEndpointResourceIdentifier?: string | undefined;
  endpoint?: string | undefined;
  status?: string | undefined;
  endpointType?: string | undefined;
  customEndpointType?: string | undefined;
  staticMembers?: string[];
  excludedMembers?: string[];
  dbClusterEndpointArn?: string | undefined;
};

/** Result of create_db_cluster_parameter_group. */
export type CreateDbClusterParameterGroupResult = {
  dbClusterParameterGroup?: Record<string, unknown>;
};

/** Result of create_db_cluster_snapshot. */
export type CreateDbClusterSnapshotResult = {
  dbClusterSnapshot?: Record<string, unknown>;
};

/** Result of create_db_instance. */
export type CreateDbInstanceResult = {
  dbInstance?: Record<string, unknown>;
};

/** Result of create_db_instance_read_replica. */
export type CreateDbInstanceReadReplicaResult = {
  dbInstance?: Record<string, unknown>;
};

/** Result of create_db_parameter_group. */
export type CreateDbParameterGroupResult = {
  dbParameterGroup?: Record<string, unknown>;
};

/** Result of create_db_proxy. */
export type CreateDbProxyResult = {
  dbProxy?: Record<string, unknown>;
};

/** Result of create_db_proxy_endpoint. */
export type CreateDbProxyEndpointResult = {
  dbProxyEndpoint?: Record<string, unknown>;
};

/** Result of create_db_security_group. */
export type CreateDbSecurityGroupResult = {
  dbSecurityGroup?: Record<string, unknown>;
};

/** Result of create_db_shard_group. */
export type CreateDbShardGroupResult = {
  dbShardGroupResourceId?: string | undefined;
  dbShardGroupIdentifier?: string | undefined;
  dbClusterIdentifier?: string | undefined;
  maxAcu?: number | undefined;
  minAcu?: number | undefined;
  computeRedundancy?: number | undefined;
  status?: string | undefined;
  publiclyAccessible?: boolean | undefined;
  endpoint?: string | undefined;
  dbShardGroupArn?: string | undefined;
  tagList?: Record<string, unknown>[];
};

/** Result of create_db_subnet_group. */
export type CreateDbSubnetGroupResult = {
  dbSubnetGroup?: Record<string, unknown>;
};

/** Result of create_event_subscription. */
export type CreateEventSubscriptionResult = {
  eventSubscription?: Record<string, unknown>;
};

/** Result of create_global_cluster. */
export type CreateGlobalClusterResult = {
  globalCluster?: Record<string, unknown>;
};

/** Result of create_integration. */
export type CreateIntegrationResult = {
  sourceArn?: string | undefined;
  targetArn?: string | undefined;
  integrationName?: string | undefined;
  integrationArn?: string | undefined;
  kmsKeyId?: string | undefined;
  additionalEncryptionContext?: Record<string, unknown>;
  status?: string | undefined;
  tags?: Record<string, unknown>[];
  dataFilter?: string | undefined;
  description?: string | undefined;
  createTime?: string | undefined;
  errors?: Record<string, unknown>[];
};

/** Result of create_option_group. */
export type CreateOptionGroupResult = {
  optionGroup?: Record<string, unknown>;
};

/** Result of create_tenant_database. */
export type CreateTenantDatabaseResult = {
  tenantDatabase?: Record<string, unknown>;
};

/** Result of delete_blue_green_deployment. */
export type DeleteBlueGreenDeploymentResult = {
  blueGreenDeployment?: Record<string, unknown>;
};

/** Result of delete_custom_db_engine_version. */
export type DeleteCustomDbEngineVersionResult = {
  engine?: string | undefined;
  majorEngineVersion?: string | undefined;
  engineVersion?: string | undefined;
  databaseInstallationFilesS3BucketName?: string | undefined;
  databaseInstallationFilesS3Prefix?: string | undefined;
  customDbEngineVersionManifest?: string | undefined;
  dbParameterGroupFamily?: string | undefined;
  dbEngineDescription?: string | undefined;
  dbEngineVersionArn?: string | undefined;
  dbEngineVersionDescription?: string | undefined;
  defaultCharacterSet?: Record<string, unknown>;
  image?: Record<string, unknown>;
  dbEngineMediaType?: string | undefined;
  kmsKeyId?: string | undefined;
  createTime?: string | undefined;
  supportedCharacterSets?: Record<string, unknown>[];
  supportedNcharCharacterSets?: Record<string, unknown>[];
  validUpgradeTarget?: Record<string, unknown>[];
  supportedTimezones?: Record<string, unknown>[];
  exportableLogTypes?: string[];
  supportsLogExportsToCloudwatchLogs?: boolean | undefined;
  supportsReadReplica?: boolean | undefined;
  supportedEngineModes?: string[];
  supportedFeatureNames?: string[];
  status?: string | undefined;
  supportsParallelQuery?: boolean | undefined;
  supportsGlobalDatabases?: boolean | undefined;
  tagList?: Record<string, unknown>[];
  supportsBabelfish?: boolean | undefined;
  supportsLimitlessDatabase?: boolean | undefined;
  supportsCertificateRotationWithoutRestart?: boolean | undefined;
  supportedCaCertificateIdentifiers?: string[];
  supportsLocalWriteForwarding?: boolean | undefined;
  supportsIntegrations?: boolean | undefined;
  serverlessV2FeaturesSupport?: Record<string, unknown>;
};

/** Result of delete_db_cluster. */
export type DeleteDbClusterResult = {
  dbCluster?: Record<string, unknown>;
};

/** Result of delete_db_cluster_automated_backup. */
export type DeleteDbClusterAutomatedBackupResult = {
  dbClusterAutomatedBackup?: Record<string, unknown>;
};

/** Result of delete_db_cluster_endpoint. */
export type DeleteDbClusterEndpointResult = {
  dbClusterEndpointIdentifier?: string | undefined;
  dbClusterIdentifier?: string | undefined;
  dbClusterEndpointResourceIdentifier?: string | undefined;
  endpoint?: string | undefined;
  status?: string | undefined;
  endpointType?: string | undefined;
  customEndpointType?: string | undefined;
  staticMembers?: string[];
  excludedMembers?: string[];
  dbClusterEndpointArn?: string | undefined;
};

/** Result of delete_db_cluster_snapshot. */
export type DeleteDbClusterSnapshotResult = {
  dbClusterSnapshot?: Record<string, unknown>;
};

/** Result of delete_db_instance. */
export type DeleteDbInstanceResult = {
  dbInstance?: Record<string, unknown>;
};

/** Result of delete_db_instance_automated_backup. */
export type DeleteDbInstanceAutomatedBackupResult = {
  dbInstanceAutomatedBackup?: Record<string, unknown>;
};

/** Result of delete_db_proxy. */
export type DeleteDbProxyResult = {
  dbProxy?: Record<string, unknown>;
};

/** Result of delete_db_proxy_endpoint. */
export type DeleteDbProxyEndpointResult = {
  dbProxyEndpoint?: Record<string, unknown>;
};

/** Result of delete_db_shard_group. */
export type DeleteDbShardGroupResult = {
  dbShardGroupResourceId?: string | undefined;
  dbShardGroupIdentifier?: string | undefined;
  dbClusterIdentifier?: string | undefined;
  maxAcu?: number | undefined;
  minAcu?: number | undefined;
  computeRedundancy?: number | undefined;
  status?: string | undefined;
  publiclyAccessible?: boolean | undefined;
  endpoint?: string | undefined;
  dbShardGroupArn?: string | undefined;
  tagList?: Record<string, unknown>[];
};

/** Result of delete_event_subscription. */
export type DeleteEventSubscriptionResult = {
  eventSubscription?: Record<string, unknown>;
};

/** Result of delete_global_cluster. */
export type DeleteGlobalClusterResult = {
  globalCluster?: Record<string, unknown>;
};

/** Result of delete_integration. */
export type DeleteIntegrationResult = {
  sourceArn?: string | undefined;
  targetArn?: string | undefined;
  integrationName?: string | undefined;
  integrationArn?: string | undefined;
  kmsKeyId?: string | undefined;
  additionalEncryptionContext?: Record<string, unknown>;
  status?: string | undefined;
  tags?: Record<string, unknown>[];
  dataFilter?: string | undefined;
  description?: string | undefined;
  createTime?: string | undefined;
  errors?: Record<string, unknown>[];
};

/** Result of delete_tenant_database. */
export type DeleteTenantDatabaseResult = {
  tenantDatabase?: Record<string, unknown>;
};

/** Result of describe_account_attributes. */
export type DescribeAccountAttributesResult = {
  accountQuotas?: Record<string, unknown>[];
};

/** Result of describe_blue_green_deployments. */
export type DescribeBlueGreenDeploymentsResult = {
  blueGreenDeployments?: Record<string, unknown>[];
  marker?: string | undefined;
};

/** Result of describe_certificates. */
export type DescribeCertificatesResult = {
  defaultCertificateForNewLaunches?: string | undefined;
  certificates?: Record<string, unknown>[];
  marker?: string | undefined;
};

/** Result of describe_db_cluster_automated_backups. */
export type DescribeDbClusterAutomatedBackupsResult = {
  marker?: string | undefined;
  dbClusterAutomatedBackups?: Record<string, unknown>[];
};

/** Result of describe_db_cluster_backtracks. */
export type DescribeDbClusterBacktracksResult = {
  marker?: string | undefined;
  dbClusterBacktracks?: Record<string, unknown>[];
};

/** Result of describe_db_cluster_endpoints. */
export type DescribeDbClusterEndpointsResult = {
  marker?: string | undefined;
  dbClusterEndpoints?: Record<string, unknown>[];
};

/** Result of describe_db_cluster_parameter_groups. */
export type DescribeDbClusterParameterGroupsResult = {
  marker?: string | undefined;
  dbClusterParameterGroups?: Record<string, unknown>[];
};

/** Result of describe_db_cluster_parameters. */
export type DescribeDbClusterParametersResult = {
  parameters?: Record<string, unknown>[];
  marker?: string | undefined;
};

/** Result of describe_db_cluster_snapshot_attributes. */
export type DescribeDbClusterSnapshotAttributesResult = {
  dbClusterSnapshotAttributesResult?: Record<string, unknown>;
};

/** Result of describe_db_cluster_snapshots. */
export type DescribeDbClusterSnapshotsResult = {
  marker?: string | undefined;
  dbClusterSnapshots?: Record<string, unknown>[];
};

/** Result of describe_db_clusters. */
export type DescribeDbClustersResult = {
  marker?: string | undefined;
  dbClusters?: Record<string, unknown>[];
};

/** Result of describe_db_engine_versions. */
export type DescribeDbEngineVersionsResult = {
  marker?: string | undefined;
  dbEngineVersions?: Record<string, unknown>[];
};

/** Result of describe_db_instance_automated_backups. */
export type DescribeDbInstanceAutomatedBackupsResult = {
  marker?: string | undefined;
  dbInstanceAutomatedBackups?: Record<string, unknown>[];
};

/** Result of describe_db_log_files. */
export type DescribeDbLogFilesResult = {
  describeDbLogFiles?: Record<string, unknown>[];
  marker?: string | undefined;
};

/** Result of describe_db_major_engine_versions. */
export type DescribeDbMajorEngineVersionsResult = {
  dbMajorEngineVersions?: Record<string, unknown>[];
  marker?: string | undefined;
};

/** Result of describe_db_parameter_groups. */
export type DescribeDbParameterGroupsResult = {
  marker?: string | undefined;
  dbParameterGroups?: Record<string, unknown>[];
};

/** Result of describe_db_parameters. */
export type DescribeDbParametersResult = {
  parameters?: Record<string, unknown>[];
  marker?: string | undefined;
};

/** Result of describe_db_proxies. */
export type DescribeDbProxiesResult = {
  dbProxies?: Record<string, unknown>[];
  marker?: string | undefined;
};

/** Result of describe_db_proxy_endpoints. */
export type DescribeDbProxyEndpointsResult = {
  dbProxyEndpoints?: Record<string, unknown>[];
  marker?: string | undefined;
};

/** Result of describe_db_proxy_target_groups. */
export type DescribeDbProxyTargetGroupsResult = {
  targetGroups?: Record<string, unknown>[];
  marker?: string | undefined;
};

/** Result of describe_db_proxy_targets. */
export type DescribeDbProxyTargetsResult = {
  targets?: Record<string, unknown>[];
  marker?: string | undefined;
};

/** Result of describe_db_recommendations. */
export type DescribeDbRecommendationsResult = {
  dbRecommendations?: Record<string, unknown>[];
  marker?: string | undefined;
};

/** Result of describe_db_security_groups. */
export type DescribeDbSecurityGroupsResult = {
  marker?: string | undefined;
  dbSecurityGroups?: Record<string, unknown>[];
};

/** Result of describe_db_shard_groups. */
export type DescribeDbShardGroupsResult = {
  dbShardGroups?: Record<string, unknown>[];
  marker?: string | undefined;
};

/** Result of describe_db_snapshot_attributes. */
export type DescribeDbSnapshotAttributesResult = {
  dbSnapshotAttributesResult?: Record<string, unknown>;
};

/** Result of describe_db_snapshot_tenant_databases. */
export type DescribeDbSnapshotTenantDatabasesResult = {
  marker?: string | undefined;
  dbSnapshotTenantDatabases?: Record<string, unknown>[];
};

/** Result of describe_db_subnet_groups. */
export type DescribeDbSubnetGroupsResult = {
  marker?: string | undefined;
  dbSubnetGroups?: Record<string, unknown>[];
};

/** Result of describe_engine_default_cluster_parameters. */
export type DescribeEngineDefaultClusterParametersResult = {
  engineDefaults?: Record<string, unknown>;
};

/** Result of describe_engine_default_parameters. */
export type DescribeEngineDefaultParametersResult = {
  engineDefaults?: Record<string, unknown>;
};

/** Result of describe_event_categories. */
export type DescribeEventCategoriesResult = {
  eventCategoriesMapList?: Record<string, unknown>[];
};

/** Result of describe_event_subscriptions. */
export type DescribeEventSubscriptionsResult = {
  marker?: string | undefined;
  eventSubscriptionsList?: Record<string, unknown>[];
};

/** Result of describe_events. */
export type DescribeEventsResult = {
  marker?: string | undefined;
  events?: Record<string, unknown>[];
};

/** Result of describe_export_tasks. */
export type DescribeExportTasksResult = {
  marker?: string | undefined;
  exportTasks?: Record<string, unknown>[];
};

/** Result of describe_global_clusters. */
export type DescribeGlobalClustersResult = {
  marker?: string | undefined;
  globalClusters?: Record<string, unknown>[];
};

/** Result of describe_integrations. */
export type DescribeIntegrationsResult = {
  marker?: string | undefined;
  integrations?: Record<string, unknown>[];
};

/** Result of describe_option_group_options. */
export type DescribeOptionGroupOptionsResult = {
  optionGroupOptions?: Record<string, unknown>[];
  marker?: string | undefined;
};

/** Result of describe_option_groups. */
export type DescribeOptionGroupsResult = {
  optionGroupsList?: Record<string, unknown>[];
  marker?: string | undefined;
};

/** Result of describe_orderable_db_instance_options. */
export type DescribeOrderableDbInstanceOptionsResult = {
  orderableDbInstanceOptions?: Record<string, unknown>[];
  marker?: string | undefined;
};

/** Result of describe_pending_maintenance_actions. */
export type DescribePendingMaintenanceActionsResult = {
  pendingMaintenanceActions?: Record<string, unknown>[];
  marker?: string | undefined;
};

/** Result of describe_reserved_db_instances. */
export type DescribeReservedDbInstancesResult = {
  marker?: string | undefined;
  reservedDbInstances?: Record<string, unknown>[];
};

/** Result of describe_reserved_db_instances_offerings. */
export type DescribeReservedDbInstancesOfferingsResult = {
  marker?: string | undefined;
  reservedDbInstancesOfferings?: Record<string, unknown>[];
};

/** Result of describe_source_regions. */
export type DescribeSourceRegionsResult = {
  marker?: string | undefined;
  sourceRegions?: Record<string, unknown>[];
};

/** Result of describe_tenant_databases. */
export type DescribeTenantDatabasesResult = {
  marker?: string | undefined;
  tenantDatabases?: Record<string, unknown>[];
};

/** Result of describe_valid_db_instance_modifications. */
export type DescribeValidDbInstanceModificationsResult = {
  validDbInstanceModificationsMessage?: Record<string, unknown>;
};

/** Result of disable_http_endpoint. */
export type DisableHttpEndpointResult = {
  resourceArn?: string | undefined;
  httpEndpointEnabled?: boolean | undefined;
};

/** Result of download_db_log_file_portion. */
export type DownloadDbLogFilePortionResult = {
  logFileData?: string | undefined;
  marker?: string | undefined;
  additionalDataPending?: boolean | undefined;
};

/** Result of enable_http_endpoint. */
export type EnableHttpEndpointResult = {
  resourceArn?: string | undefined;
  httpEndpointEnabled?: boolean | undefined;
};

/** Result of failover_db_cluster. */
export type FailoverDbClusterResult = {
  dbCluster?: Record<string, unknown>;
};

/** Result of failover_global_cluster. */
export type FailoverGlobalClusterResult = {
  globalCluster?: Record<string, unknown>;
};

/** Result of list_tags_for_resource. */
export type ListTagsForResourceResult = {
  tagList?: Record<string, unknown>[];
};

/** Result of modify_activity_stream. */
export type ModifyActivityStreamResult = {
  kmsKeyId?: string | undefined;
  kinesisStreamName?: string | undefined;
  status?: string | undefined;
  mode?: string | undefined;
  engineNativeAuditFieldsIncluded?: boolean | undefined;
  policyStatus?: string | undefined;
};

/** Result of modify_certificates. */
export type ModifyCertificatesResult = {
  certificate?: Record<string, unknown>;
};

/** Result of modify_current_db_cluster_capacity. */
export type ModifyCurrentDbClusterCapacityResult = {
  dbClusterIdentifier?: string | undefined;
  pendingCapacity?: number | undefined;
  currentCapacity?: number | undefined;
  secondsBeforeTimeout?: number | undefined;
  timeoutAction?: string | undefined;
};

/** Result of modify_custom_db_engine_version. */
export type ModifyCustomDbEngineVersionResult = {
  engine?: string | undefined;
  majorEngineVersion?: string | undefined;
  engineVersion?: string | undefined;
  databaseInstallationFilesS3BucketName?: string | undefined;
  databaseInstallationFilesS3Prefix?: string | undefined;
  customDbEngineVersionManifest?: string | undefined;
  dbParameterGroupFamily?: string | undefined;
  dbEngineDescription?: string | undefined;
  dbEngineVersionArn?: string | undefined;
  dbEngineVersionDescription?: string | undefined;
  defaultCharacterSet?: Record<string, unknown>;
  image?: Record<string, unknown>;
  dbEngineMediaType?: string | undefined;
  kmsKeyId?: string | undefined;
  createTime?: string | undefined;
  supportedCharacterSets?: Record<string, unknown>[];
  supportedNcharCharacterSets?: Record<string, unknown>[];
  validUpgradeTarget?: Record<string, unknown>[];
  supportedTimezones?: Record<string, unknown>[];
  exportableLogTypes?: string[];
  supportsLogExportsToCloudwatchLogs?: boolean | undefined;
  supportsReadReplica?: boolean | undefined;
  supportedEngineModes?: string[];
  supportedFeatureNames?: string[];
  status?: string | undefined;
  supportsParallelQuery?: boolean | undefined;
  supportsGlobalDatabases?: boolean | undefined;
  tagList?: Record<string, unknown>[];
  supportsBabelfish?: boolean | undefined;
  supportsLimitlessDatabase?: boolean | undefined;
  supportsCertificateRotationWithoutRestart?: boolean | undefined;
  supportedCaCertificateIdentifiers?: string[];
  supportsLocalWriteForwarding?: boolean | undefined;
  supportsIntegrations?: boolean | undefined;
  serverlessV2FeaturesSupport?: Record<string, unknown>;
};

/** Result of modify_db_cluster. */
export type ModifyDbClusterResult = {
  dbCluster?: Record<string, unknown>;
};

/** Result of modify_db_cluster_endpoint. */
export type ModifyDbClusterEndpointResult = {
  dbClusterEndpointIdentifier?: string | undefined;
  dbClusterIdentifier?: string | undefined;
  dbClusterEndpointResourceIdentifier?: string | undefined;
  endpoint?: string | undefined;
  status?: string | undefined;
  endpointType?: string | undefined;
  customEndpointType?: string | undefined;
  staticMembers?: string[];
  excludedMembers?: string[];
  dbClusterEndpointArn?: string | undefined;
};

/** Result of modify_db_cluster_parameter_group. */
export type ModifyDbClusterParameterGroupResult = {
  dbClusterParameterGroupName?: string | undefined;
};

/** Result of modify_db_cluster_snapshot_attribute. */
export type ModifyDbClusterSnapshotAttributeResult = {
  dbClusterSnapshotAttributesResult?: Record<string, unknown>;
};

/** Result of modify_db_instance. */
export type ModifyDbInstanceResult = {
  dbInstance?: Record<string, unknown>;
};

/** Result of modify_db_parameter_group. */
export type ModifyDbParameterGroupResult = {
  dbParameterGroupName?: string | undefined;
};

/** Result of modify_db_proxy. */
export type ModifyDbProxyResult = {
  dbProxy?: Record<string, unknown>;
};

/** Result of modify_db_proxy_endpoint. */
export type ModifyDbProxyEndpointResult = {
  dbProxyEndpoint?: Record<string, unknown>;
};

/** Result of modify_db_proxy_target_group. */
export type ModifyDbProxyTargetGroupResult = {
  dbProxyTargetGroup?: Record<string, unknown>;
};

/** Result of modify_db_recommendation. */
export type ModifyDbRecommendationResult = {
  dbRecommendation?: Record<string, unknown>;
};

/** Result of modify_db_shard_group. */
export type ModifyDbShardGroupResult = {
  dbShardGroupResourceId?: string | undefined;
  dbShardGroupIdentifier?: string | undefined;
  dbClusterIdentifier?: string | undefined;
  maxAcu?: number | undefined;
  minAcu?: number | undefined;
  computeRedundancy?: number | undefined;
  status?: string | undefined;
  publiclyAccessible?: boolean | undefined;
  endpoint?: string | undefined;
  dbShardGroupArn?: string | undefined;
  tagList?: Record<string, unknown>[];
};

/** Result of modify_db_snapshot. */
export type ModifyDbSnapshotResult = {
  dbSnapshot?: Record<string, unknown>;
};

/** Result of modify_db_snapshot_attribute. */
export type ModifyDbSnapshotAttributeResult = {
  dbSnapshotAttributesResult?: Record<string, unknown>;
};

/** Result of modify_db_subnet_group. */
export type ModifyDbSubnetGroupResult = {
  dbSubnetGroup?: Record<string, unknown>;
};

/** Result of modify_event_subscription. */
export type ModifyEventSubscriptionResult = {
  eventSubscription?: Record<string, unknown>;
};

/** Result of modify_global_cluster. */
export type ModifyGlobalClusterResult = {
  globalCluster?: Record<string, unknown>;
};

/** Result of modify_integration. */
export type ModifyIntegrationResult = {
  sourceArn?: string | undefined;
  targetArn?: string | undefined;
  integrationName?: string | undefined;
  integrationArn?: string | undefined;
  kmsKeyId?: string | undefined;
  additionalEncryptionContext?: Record<string, unknown>;
  status?: string | undefined;
  tags?: Record<string, unknown>[];
  dataFilter?: string | undefined;
  description?: string | undefined;
  createTime?: string | undefined;
  errors?: Record<string, unknown>[];
};

/** Result of modify_option_group. */
export type ModifyOptionGroupResult = {
  optionGroup?: Record<string, unknown>;
};

/** Result of modify_tenant_database. */
export type ModifyTenantDatabaseResult = {
  tenantDatabase?: Record<string, unknown>;
};

/** Result of promote_read_replica. */
export type PromoteReadReplicaResult = {
  dbInstance?: Record<string, unknown>;
};

/** Result of promote_read_replica_db_cluster. */
export type PromoteReadReplicaDbClusterResult = {
  dbCluster?: Record<string, unknown>;
};

/** Result of purchase_reserved_db_instances_offering. */
export type PurchaseReservedDbInstancesOfferingResult = {
  reservedDbInstance?: Record<string, unknown>;
};

/** Result of reboot_db_cluster. */
export type RebootDbClusterResult = {
  dbCluster?: Record<string, unknown>;
};

/** Result of reboot_db_instance. */
export type RebootDbInstanceResult = {
  dbInstance?: Record<string, unknown>;
};

/** Result of reboot_db_shard_group. */
export type RebootDbShardGroupResult = {
  dbShardGroupResourceId?: string | undefined;
  dbShardGroupIdentifier?: string | undefined;
  dbClusterIdentifier?: string | undefined;
  maxAcu?: number | undefined;
  minAcu?: number | undefined;
  computeRedundancy?: number | undefined;
  status?: string | undefined;
  publiclyAccessible?: boolean | undefined;
  endpoint?: string | undefined;
  dbShardGroupArn?: string | undefined;
  tagList?: Record<string, unknown>[];
};

/** Result of register_db_proxy_targets. */
export type RegisterDbProxyTargetsResult = {
  dbProxyTargets?: Record<string, unknown>[];
};

/** Result of remove_from_global_cluster. */
export type RemoveFromGlobalClusterResult = {
  globalCluster?: Record<string, unknown>;
};

/** Result of remove_source_identifier_from_subscription. */
export type RemoveSourceIdentifierFromSubscriptionResult = {
  eventSubscription?: Record<string, unknown>;
};

/** Result of reset_db_cluster_parameter_group. */
export type ResetDbClusterParameterGroupResult = {
  dbClusterParameterGroupName?: string | undefined;
};

/** Result of reset_db_parameter_group. */
export type ResetDbParameterGroupResult = {
  dbParameterGroupName?: string | undefined;
};

/** Result of restore_db_cluster_from_s3. */
export type RestoreDbClusterFromS3Result = {
  dbCluster?: Record<string, unknown>;
};

/** Result of restore_db_cluster_from_snapshot. */
export type RestoreDbClusterFromSnapshotResult = {
  dbCluster?: Record<string, unknown>;
};

/** Result of restore_db_cluster_to_point_in_time. */
export type RestoreDbClusterToPointInTimeResult = {
  dbCluster?: Record<string, unknown>;
};

/** Result of restore_db_instance_from_db_snapshot. */
export type RestoreDbInstanceFromDbSnapshotResult = {
  dbInstance?: Record<string, unknown>;
};

/** Result of restore_db_instance_from_s3. */
export type RestoreDbInstanceFromS3Result = {
  dbInstance?: Record<string, unknown>;
};

/** Result of restore_db_instance_to_point_in_time. */
export type RestoreDbInstanceToPointInTimeResult = {
  dbInstance?: Record<string, unknown>;
};

/** Result of revoke_db_security_group_ingress. */
export type RevokeDbSecurityGroupIngressResult = {
  dbSecurityGroup?: Record<string, unknown>;
};

/** Result of start_activity_stream. */
export type StartActivityStreamResult = {
  kmsKeyId?: string | undefined;
  kinesisStreamName?: string | undefined;
  status?: string | undefined;
  mode?: string | undefined;
  engineNativeAuditFieldsIncluded?: boolean | undefined;
  applyImmediately?: boolean | undefined;
};

/** Result of start_db_cluster. */
export type StartDbClusterResult = {
  dbCluster?: Record<string, unknown>;
};

/** Result of start_db_instance_automated_backups_replication. */
export type StartDbInstanceAutomatedBackupsReplicationResult = {
  dbInstanceAutomatedBackup?: Record<string, unknown>;
};

/** Result of start_export_task. */
export type StartExportTaskResult = {
  exportTaskIdentifier?: string | undefined;
  sourceArn?: string | undefined;
  exportOnly?: string[];
  snapshotTime?: string | undefined;
  taskStartTime?: string | undefined;
  taskEndTime?: string | undefined;
  s3Bucket?: string | undefined;
  s3Prefix?: string | undefined;
  iamRoleArn?: string | undefined;
  kmsKeyId?: string | undefined;
  status?: string | undefined;
  percentProgress?: number | undefined;
  totalExtractedDataInGb?: number | undefined;
  failureCause?: string | undefined;
  warningMessage?: string | undefined;
  sourceType?: string | undefined;
};

/** Result of stop_activity_stream. */
export type StopActivityStreamResult = {
  kmsKeyId?: string | undefined;
  kinesisStreamName?: string | undefined;
  status?: string | undefined;
};

/** Result of stop_db_cluster. */
export type StopDbClusterResult = {
  dbCluster?: Record<string, unknown>;
};

/** Result of stop_db_instance_automated_backups_replication. */
export type StopDbInstanceAutomatedBackupsReplicationResult = {
  dbInstanceAutomatedBackup?: Record<string, unknown>;
};

/** Result of switchover_blue_green_deployment. */
export type SwitchoverBlueGreenDeploymentResult = {
  blueGreenDeployment?: Record<string, unknown>;
};

/** Result of switchover_global_cluster. */
export type SwitchoverGlobalClusterResult = {
  globalCluster?: Record<string, unknown>;
};

/** Result of switchover_read_replica. */
export type SwitchoverReadReplicaResult = {
  dbInstance?: Record<string, unknown>;
};


// ---------------------------------------------------------------------------
// Additional functions (auto-generated)
// ---------------------------------------------------------------------------

/** Add role to db cluster. */
export async function addRoleToDbCluster(dbClusterIdentifier: string, roleArn: string): Promise<void> {
  try {
    // TODO: implement add_role_to_db_cluster
    throw new Error("add_role_to_db_cluster not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "add_role_to_db_cluster failed");
  }
}

/** Add role to db instance. */
export async function addRoleToDbInstance(dbInstanceIdentifier: string, roleArn: string, featureName: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement add_role_to_db_instance
    throw new Error("add_role_to_db_instance not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "add_role_to_db_instance failed");
  }
}

/** Add source identifier to subscription. */
export async function addSourceIdentifierToSubscription(subscriptionName: string, sourceIdentifier: string, regionName?: string | undefined): Promise<AddSourceIdentifierToSubscriptionResult> {
  try {
    // TODO: implement add_source_identifier_to_subscription
    throw new Error("add_source_identifier_to_subscription not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "add_source_identifier_to_subscription failed");
  }
}

/** Add tags to resource. */
export async function addTagsToResource(resourceName: string, tags: Record<string, unknown>[], regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement add_tags_to_resource
    throw new Error("add_tags_to_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "add_tags_to_resource failed");
  }
}

/** Apply pending maintenance action. */
export async function applyPendingMaintenanceAction(resourceIdentifier: string, applyAction: string, optInType: string, regionName?: string | undefined): Promise<ApplyPendingMaintenanceActionResult> {
  try {
    // TODO: implement apply_pending_maintenance_action
    throw new Error("apply_pending_maintenance_action not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "apply_pending_maintenance_action failed");
  }
}

/** Authorize db security group ingress. */
export async function authorizeDbSecurityGroupIngress(dbSecurityGroupName: string): Promise<AuthorizeDbSecurityGroupIngressResult> {
  try {
    // TODO: implement authorize_db_security_group_ingress
    throw new Error("authorize_db_security_group_ingress not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "authorize_db_security_group_ingress failed");
  }
}

/** Backtrack db cluster. */
export async function backtrackDbCluster(dbClusterIdentifier: string, backtrackTo: string): Promise<BacktrackDbClusterResult> {
  try {
    // TODO: implement backtrack_db_cluster
    throw new Error("backtrack_db_cluster not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "backtrack_db_cluster failed");
  }
}

/** Cancel export task. */
export async function cancelExportTask(exportTaskIdentifier: string, regionName?: string | undefined): Promise<CancelExportTaskResult> {
  try {
    // TODO: implement cancel_export_task
    throw new Error("cancel_export_task not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "cancel_export_task failed");
  }
}

/** Copy db cluster parameter group. */
export async function copyDbClusterParameterGroup(sourceDbClusterParameterGroupIdentifier: string, targetDbClusterParameterGroupIdentifier: string, targetDbClusterParameterGroupDescription: string): Promise<CopyDbClusterParameterGroupResult> {
  try {
    // TODO: implement copy_db_cluster_parameter_group
    throw new Error("copy_db_cluster_parameter_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "copy_db_cluster_parameter_group failed");
  }
}

/** Copy db cluster snapshot. */
export async function copyDbClusterSnapshot(sourceDbClusterSnapshotIdentifier: string, targetDbClusterSnapshotIdentifier: string): Promise<CopyDbClusterSnapshotResult> {
  try {
    // TODO: implement copy_db_cluster_snapshot
    throw new Error("copy_db_cluster_snapshot not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "copy_db_cluster_snapshot failed");
  }
}

/** Copy db parameter group. */
export async function copyDbParameterGroup(sourceDbParameterGroupIdentifier: string, targetDbParameterGroupIdentifier: string, targetDbParameterGroupDescription: string): Promise<CopyDbParameterGroupResult> {
  try {
    // TODO: implement copy_db_parameter_group
    throw new Error("copy_db_parameter_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "copy_db_parameter_group failed");
  }
}

/** Copy db snapshot. */
export async function copyDbSnapshot(sourceDbSnapshotIdentifier: string, targetDbSnapshotIdentifier: string): Promise<CopyDbSnapshotResult> {
  try {
    // TODO: implement copy_db_snapshot
    throw new Error("copy_db_snapshot not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "copy_db_snapshot failed");
  }
}

/** Copy option group. */
export async function copyOptionGroup(sourceOptionGroupIdentifier: string, targetOptionGroupIdentifier: string, targetOptionGroupDescription: string): Promise<CopyOptionGroupResult> {
  try {
    // TODO: implement copy_option_group
    throw new Error("copy_option_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "copy_option_group failed");
  }
}

/** Create blue green deployment. */
export async function createBlueGreenDeployment(blueGreenDeploymentName: string, source: string): Promise<CreateBlueGreenDeploymentResult> {
  try {
    // TODO: implement create_blue_green_deployment
    throw new Error("create_blue_green_deployment not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_blue_green_deployment failed");
  }
}

/** Create custom db engine version. */
export async function createCustomDbEngineVersion(engine: string, engineVersion: string): Promise<CreateCustomDbEngineVersionResult> {
  try {
    // TODO: implement create_custom_db_engine_version
    throw new Error("create_custom_db_engine_version not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_custom_db_engine_version failed");
  }
}

/** Create db cluster. */
export async function createDbCluster(dbClusterIdentifier: string, engine: string): Promise<CreateDbClusterResult> {
  try {
    // TODO: implement create_db_cluster
    throw new Error("create_db_cluster not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_db_cluster failed");
  }
}

/** Create db cluster endpoint. */
export async function createDbClusterEndpoint(dbClusterIdentifier: string, dbClusterEndpointIdentifier: string, endpointType: string): Promise<CreateDbClusterEndpointResult> {
  try {
    // TODO: implement create_db_cluster_endpoint
    throw new Error("create_db_cluster_endpoint not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_db_cluster_endpoint failed");
  }
}

/** Create db cluster parameter group. */
export async function createDbClusterParameterGroup(dbClusterParameterGroupName: string, dbParameterGroupFamily: string, description: string): Promise<CreateDbClusterParameterGroupResult> {
  try {
    // TODO: implement create_db_cluster_parameter_group
    throw new Error("create_db_cluster_parameter_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_db_cluster_parameter_group failed");
  }
}

/** Create db cluster snapshot. */
export async function createDbClusterSnapshot(dbClusterSnapshotIdentifier: string, dbClusterIdentifier: string): Promise<CreateDbClusterSnapshotResult> {
  try {
    // TODO: implement create_db_cluster_snapshot
    throw new Error("create_db_cluster_snapshot not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_db_cluster_snapshot failed");
  }
}

/** Create db instance. */
export async function createDbInstance(dbInstanceIdentifier: string, dbInstanceClass: string, engine: string): Promise<CreateDbInstanceResult> {
  try {
    // TODO: implement create_db_instance
    throw new Error("create_db_instance not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_db_instance failed");
  }
}

/** Create db instance read replica. */
export async function createDbInstanceReadReplica(dbInstanceIdentifier: string): Promise<CreateDbInstanceReadReplicaResult> {
  try {
    // TODO: implement create_db_instance_read_replica
    throw new Error("create_db_instance_read_replica not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_db_instance_read_replica failed");
  }
}

/** Create db parameter group. */
export async function createDbParameterGroup(dbParameterGroupName: string, dbParameterGroupFamily: string, description: string): Promise<CreateDbParameterGroupResult> {
  try {
    // TODO: implement create_db_parameter_group
    throw new Error("create_db_parameter_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_db_parameter_group failed");
  }
}

/** Create db proxy. */
export async function createDbProxy(dbProxyName: string, engineFamily: string, roleArn: string, vpcSubnetIds: string[]): Promise<CreateDbProxyResult> {
  try {
    // TODO: implement create_db_proxy
    throw new Error("create_db_proxy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_db_proxy failed");
  }
}

/** Create db proxy endpoint. */
export async function createDbProxyEndpoint(dbProxyName: string, dbProxyEndpointName: string, vpcSubnetIds: string[]): Promise<CreateDbProxyEndpointResult> {
  try {
    // TODO: implement create_db_proxy_endpoint
    throw new Error("create_db_proxy_endpoint not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_db_proxy_endpoint failed");
  }
}

/** Create db security group. */
export async function createDbSecurityGroup(dbSecurityGroupName: string, dbSecurityGroupDescription: string): Promise<CreateDbSecurityGroupResult> {
  try {
    // TODO: implement create_db_security_group
    throw new Error("create_db_security_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_db_security_group failed");
  }
}

/** Create db shard group. */
export async function createDbShardGroup(dbShardGroupIdentifier: string, dbClusterIdentifier: string, maxAcu: number): Promise<CreateDbShardGroupResult> {
  try {
    // TODO: implement create_db_shard_group
    throw new Error("create_db_shard_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_db_shard_group failed");
  }
}

/** Create db subnet group. */
export async function createDbSubnetGroup(dbSubnetGroupName: string, dbSubnetGroupDescription: string, subnetIds: string[]): Promise<CreateDbSubnetGroupResult> {
  try {
    // TODO: implement create_db_subnet_group
    throw new Error("create_db_subnet_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_db_subnet_group failed");
  }
}

/** Create event subscription. */
export async function createEventSubscription(subscriptionName: string, snsTopicArn: string): Promise<CreateEventSubscriptionResult> {
  try {
    // TODO: implement create_event_subscription
    throw new Error("create_event_subscription not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_event_subscription failed");
  }
}

/** Create global cluster. */
export async function createGlobalCluster(globalClusterIdentifier: string): Promise<CreateGlobalClusterResult> {
  try {
    // TODO: implement create_global_cluster
    throw new Error("create_global_cluster not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_global_cluster failed");
  }
}

/** Create integration. */
export async function createIntegration(sourceArn: string, targetArn: string, integrationName: string): Promise<CreateIntegrationResult> {
  try {
    // TODO: implement create_integration
    throw new Error("create_integration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_integration failed");
  }
}

/** Create option group. */
export async function createOptionGroup(optionGroupName: string, engineName: string, majorEngineVersion: string, optionGroupDescription: string): Promise<CreateOptionGroupResult> {
  try {
    // TODO: implement create_option_group
    throw new Error("create_option_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_option_group failed");
  }
}

/** Create tenant database. */
export async function createTenantDatabase(dbInstanceIdentifier: string, tenantDbName: string, masterUsername: string): Promise<CreateTenantDatabaseResult> {
  try {
    // TODO: implement create_tenant_database
    throw new Error("create_tenant_database not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_tenant_database failed");
  }
}

/** Delete blue green deployment. */
export async function deleteBlueGreenDeployment(blueGreenDeploymentIdentifier: string): Promise<DeleteBlueGreenDeploymentResult> {
  try {
    // TODO: implement delete_blue_green_deployment
    throw new Error("delete_blue_green_deployment not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_blue_green_deployment failed");
  }
}

/** Delete custom db engine version. */
export async function deleteCustomDbEngineVersion(engine: string, engineVersion: string, regionName?: string | undefined): Promise<DeleteCustomDbEngineVersionResult> {
  try {
    // TODO: implement delete_custom_db_engine_version
    throw new Error("delete_custom_db_engine_version not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_custom_db_engine_version failed");
  }
}

/** Delete db cluster. */
export async function deleteDbCluster(dbClusterIdentifier: string): Promise<DeleteDbClusterResult> {
  try {
    // TODO: implement delete_db_cluster
    throw new Error("delete_db_cluster not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_db_cluster failed");
  }
}

/** Delete db cluster automated backup. */
export async function deleteDbClusterAutomatedBackup(dbClusterResourceId: string, regionName?: string | undefined): Promise<DeleteDbClusterAutomatedBackupResult> {
  try {
    // TODO: implement delete_db_cluster_automated_backup
    throw new Error("delete_db_cluster_automated_backup not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_db_cluster_automated_backup failed");
  }
}

/** Delete db cluster endpoint. */
export async function deleteDbClusterEndpoint(dbClusterEndpointIdentifier: string, regionName?: string | undefined): Promise<DeleteDbClusterEndpointResult> {
  try {
    // TODO: implement delete_db_cluster_endpoint
    throw new Error("delete_db_cluster_endpoint not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_db_cluster_endpoint failed");
  }
}

/** Delete db cluster parameter group. */
export async function deleteDbClusterParameterGroup(dbClusterParameterGroupName: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_db_cluster_parameter_group
    throw new Error("delete_db_cluster_parameter_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_db_cluster_parameter_group failed");
  }
}

/** Delete db cluster snapshot. */
export async function deleteDbClusterSnapshot(dbClusterSnapshotIdentifier: string, regionName?: string | undefined): Promise<DeleteDbClusterSnapshotResult> {
  try {
    // TODO: implement delete_db_cluster_snapshot
    throw new Error("delete_db_cluster_snapshot not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_db_cluster_snapshot failed");
  }
}

/** Delete db instance. */
export async function deleteDbInstance(dbInstanceIdentifier: string): Promise<DeleteDbInstanceResult> {
  try {
    // TODO: implement delete_db_instance
    throw new Error("delete_db_instance not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_db_instance failed");
  }
}

/** Delete db instance automated backup. */
export async function deleteDbInstanceAutomatedBackup(): Promise<DeleteDbInstanceAutomatedBackupResult> {
  try {
    // TODO: implement delete_db_instance_automated_backup
    throw new Error("delete_db_instance_automated_backup not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_db_instance_automated_backup failed");
  }
}

/** Delete db parameter group. */
export async function deleteDbParameterGroup(dbParameterGroupName: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_db_parameter_group
    throw new Error("delete_db_parameter_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_db_parameter_group failed");
  }
}

/** Delete db proxy. */
export async function deleteDbProxy(dbProxyName: string, regionName?: string | undefined): Promise<DeleteDbProxyResult> {
  try {
    // TODO: implement delete_db_proxy
    throw new Error("delete_db_proxy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_db_proxy failed");
  }
}

/** Delete db proxy endpoint. */
export async function deleteDbProxyEndpoint(dbProxyEndpointName: string, regionName?: string | undefined): Promise<DeleteDbProxyEndpointResult> {
  try {
    // TODO: implement delete_db_proxy_endpoint
    throw new Error("delete_db_proxy_endpoint not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_db_proxy_endpoint failed");
  }
}

/** Delete db security group. */
export async function deleteDbSecurityGroup(dbSecurityGroupName: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_db_security_group
    throw new Error("delete_db_security_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_db_security_group failed");
  }
}

/** Delete db shard group. */
export async function deleteDbShardGroup(dbShardGroupIdentifier: string, regionName?: string | undefined): Promise<DeleteDbShardGroupResult> {
  try {
    // TODO: implement delete_db_shard_group
    throw new Error("delete_db_shard_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_db_shard_group failed");
  }
}

/** Delete db subnet group. */
export async function deleteDbSubnetGroup(dbSubnetGroupName: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_db_subnet_group
    throw new Error("delete_db_subnet_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_db_subnet_group failed");
  }
}

/** Delete event subscription. */
export async function deleteEventSubscription(subscriptionName: string, regionName?: string | undefined): Promise<DeleteEventSubscriptionResult> {
  try {
    // TODO: implement delete_event_subscription
    throw new Error("delete_event_subscription not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_event_subscription failed");
  }
}

/** Delete global cluster. */
export async function deleteGlobalCluster(globalClusterIdentifier: string, regionName?: string | undefined): Promise<DeleteGlobalClusterResult> {
  try {
    // TODO: implement delete_global_cluster
    throw new Error("delete_global_cluster not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_global_cluster failed");
  }
}

/** Delete integration. */
export async function deleteIntegration(integrationIdentifier: string, regionName?: string | undefined): Promise<DeleteIntegrationResult> {
  try {
    // TODO: implement delete_integration
    throw new Error("delete_integration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_integration failed");
  }
}

/** Delete option group. */
export async function deleteOptionGroup(optionGroupName: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_option_group
    throw new Error("delete_option_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_option_group failed");
  }
}

/** Delete tenant database. */
export async function deleteTenantDatabase(dbInstanceIdentifier: string, tenantDbName: string): Promise<DeleteTenantDatabaseResult> {
  try {
    // TODO: implement delete_tenant_database
    throw new Error("delete_tenant_database not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_tenant_database failed");
  }
}

/** Deregister db proxy targets. */
export async function deregisterDbProxyTargets(dbProxyName: string): Promise<void> {
  try {
    // TODO: implement deregister_db_proxy_targets
    throw new Error("deregister_db_proxy_targets not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "deregister_db_proxy_targets failed");
  }
}

/** Describe account attributes. */
export async function describeAccountAttributes(regionName?: string | undefined): Promise<DescribeAccountAttributesResult> {
  try {
    // TODO: implement describe_account_attributes
    throw new Error("describe_account_attributes not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_account_attributes failed");
  }
}

/** Describe blue green deployments. */
export async function describeBlueGreenDeployments(): Promise<DescribeBlueGreenDeploymentsResult> {
  try {
    // TODO: implement describe_blue_green_deployments
    throw new Error("describe_blue_green_deployments not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_blue_green_deployments failed");
  }
}

/** Describe certificates. */
export async function describeCertificates(): Promise<DescribeCertificatesResult> {
  try {
    // TODO: implement describe_certificates
    throw new Error("describe_certificates not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_certificates failed");
  }
}

/** Describe db cluster automated backups. */
export async function describeDbClusterAutomatedBackups(): Promise<DescribeDbClusterAutomatedBackupsResult> {
  try {
    // TODO: implement describe_db_cluster_automated_backups
    throw new Error("describe_db_cluster_automated_backups not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_db_cluster_automated_backups failed");
  }
}

/** Describe db cluster backtracks. */
export async function describeDbClusterBacktracks(dbClusterIdentifier: string): Promise<DescribeDbClusterBacktracksResult> {
  try {
    // TODO: implement describe_db_cluster_backtracks
    throw new Error("describe_db_cluster_backtracks not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_db_cluster_backtracks failed");
  }
}

/** Describe db cluster endpoints. */
export async function describeDbClusterEndpoints(): Promise<DescribeDbClusterEndpointsResult> {
  try {
    // TODO: implement describe_db_cluster_endpoints
    throw new Error("describe_db_cluster_endpoints not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_db_cluster_endpoints failed");
  }
}

/** Describe db cluster parameter groups. */
export async function describeDbClusterParameterGroups(): Promise<DescribeDbClusterParameterGroupsResult> {
  try {
    // TODO: implement describe_db_cluster_parameter_groups
    throw new Error("describe_db_cluster_parameter_groups not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_db_cluster_parameter_groups failed");
  }
}

/** Describe db cluster parameters. */
export async function describeDbClusterParameters(dbClusterParameterGroupName: string): Promise<DescribeDbClusterParametersResult> {
  try {
    // TODO: implement describe_db_cluster_parameters
    throw new Error("describe_db_cluster_parameters not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_db_cluster_parameters failed");
  }
}

/** Describe db cluster snapshot attributes. */
export async function describeDbClusterSnapshotAttributes(dbClusterSnapshotIdentifier: string, regionName?: string | undefined): Promise<DescribeDbClusterSnapshotAttributesResult> {
  try {
    // TODO: implement describe_db_cluster_snapshot_attributes
    throw new Error("describe_db_cluster_snapshot_attributes not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_db_cluster_snapshot_attributes failed");
  }
}

/** Describe db cluster snapshots. */
export async function describeDbClusterSnapshots(): Promise<DescribeDbClusterSnapshotsResult> {
  try {
    // TODO: implement describe_db_cluster_snapshots
    throw new Error("describe_db_cluster_snapshots not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_db_cluster_snapshots failed");
  }
}

/** Describe db clusters. */
export async function describeDbClusters(): Promise<DescribeDbClustersResult> {
  try {
    // TODO: implement describe_db_clusters
    throw new Error("describe_db_clusters not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_db_clusters failed");
  }
}

/** Describe db engine versions. */
export async function describeDbEngineVersions(): Promise<DescribeDbEngineVersionsResult> {
  try {
    // TODO: implement describe_db_engine_versions
    throw new Error("describe_db_engine_versions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_db_engine_versions failed");
  }
}

/** Describe db instance automated backups. */
export async function describeDbInstanceAutomatedBackups(): Promise<DescribeDbInstanceAutomatedBackupsResult> {
  try {
    // TODO: implement describe_db_instance_automated_backups
    throw new Error("describe_db_instance_automated_backups not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_db_instance_automated_backups failed");
  }
}

/** Describe db log files. */
export async function describeDbLogFiles(dbInstanceIdentifier: string): Promise<DescribeDbLogFilesResult> {
  try {
    // TODO: implement describe_db_log_files
    throw new Error("describe_db_log_files not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_db_log_files failed");
  }
}

/** Describe db major engine versions. */
export async function describeDbMajorEngineVersions(): Promise<DescribeDbMajorEngineVersionsResult> {
  try {
    // TODO: implement describe_db_major_engine_versions
    throw new Error("describe_db_major_engine_versions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_db_major_engine_versions failed");
  }
}

/** Describe db parameter groups. */
export async function describeDbParameterGroups(): Promise<DescribeDbParameterGroupsResult> {
  try {
    // TODO: implement describe_db_parameter_groups
    throw new Error("describe_db_parameter_groups not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_db_parameter_groups failed");
  }
}

/** Describe db parameters. */
export async function describeDbParameters(dbParameterGroupName: string): Promise<DescribeDbParametersResult> {
  try {
    // TODO: implement describe_db_parameters
    throw new Error("describe_db_parameters not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_db_parameters failed");
  }
}

/** Describe db proxies. */
export async function describeDbProxies(): Promise<DescribeDbProxiesResult> {
  try {
    // TODO: implement describe_db_proxies
    throw new Error("describe_db_proxies not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_db_proxies failed");
  }
}

/** Describe db proxy endpoints. */
export async function describeDbProxyEndpoints(): Promise<DescribeDbProxyEndpointsResult> {
  try {
    // TODO: implement describe_db_proxy_endpoints
    throw new Error("describe_db_proxy_endpoints not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_db_proxy_endpoints failed");
  }
}

/** Describe db proxy target groups. */
export async function describeDbProxyTargetGroups(dbProxyName: string): Promise<DescribeDbProxyTargetGroupsResult> {
  try {
    // TODO: implement describe_db_proxy_target_groups
    throw new Error("describe_db_proxy_target_groups not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_db_proxy_target_groups failed");
  }
}

/** Describe db proxy targets. */
export async function describeDbProxyTargets(dbProxyName: string): Promise<DescribeDbProxyTargetsResult> {
  try {
    // TODO: implement describe_db_proxy_targets
    throw new Error("describe_db_proxy_targets not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_db_proxy_targets failed");
  }
}

/** Describe db recommendations. */
export async function describeDbRecommendations(): Promise<DescribeDbRecommendationsResult> {
  try {
    // TODO: implement describe_db_recommendations
    throw new Error("describe_db_recommendations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_db_recommendations failed");
  }
}

/** Describe db security groups. */
export async function describeDbSecurityGroups(): Promise<DescribeDbSecurityGroupsResult> {
  try {
    // TODO: implement describe_db_security_groups
    throw new Error("describe_db_security_groups not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_db_security_groups failed");
  }
}

/** Describe db shard groups. */
export async function describeDbShardGroups(): Promise<DescribeDbShardGroupsResult> {
  try {
    // TODO: implement describe_db_shard_groups
    throw new Error("describe_db_shard_groups not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_db_shard_groups failed");
  }
}

/** Describe db snapshot attributes. */
export async function describeDbSnapshotAttributes(dbSnapshotIdentifier: string, regionName?: string | undefined): Promise<DescribeDbSnapshotAttributesResult> {
  try {
    // TODO: implement describe_db_snapshot_attributes
    throw new Error("describe_db_snapshot_attributes not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_db_snapshot_attributes failed");
  }
}

/** Describe db snapshot tenant databases. */
export async function describeDbSnapshotTenantDatabases(): Promise<DescribeDbSnapshotTenantDatabasesResult> {
  try {
    // TODO: implement describe_db_snapshot_tenant_databases
    throw new Error("describe_db_snapshot_tenant_databases not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_db_snapshot_tenant_databases failed");
  }
}

/** Describe db subnet groups. */
export async function describeDbSubnetGroups(): Promise<DescribeDbSubnetGroupsResult> {
  try {
    // TODO: implement describe_db_subnet_groups
    throw new Error("describe_db_subnet_groups not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_db_subnet_groups failed");
  }
}

/** Describe engine default cluster parameters. */
export async function describeEngineDefaultClusterParameters(dbParameterGroupFamily: string): Promise<DescribeEngineDefaultClusterParametersResult> {
  try {
    // TODO: implement describe_engine_default_cluster_parameters
    throw new Error("describe_engine_default_cluster_parameters not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_engine_default_cluster_parameters failed");
  }
}

/** Describe engine default parameters. */
export async function describeEngineDefaultParameters(dbParameterGroupFamily: string): Promise<DescribeEngineDefaultParametersResult> {
  try {
    // TODO: implement describe_engine_default_parameters
    throw new Error("describe_engine_default_parameters not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_engine_default_parameters failed");
  }
}

/** Describe event categories. */
export async function describeEventCategories(): Promise<DescribeEventCategoriesResult> {
  try {
    // TODO: implement describe_event_categories
    throw new Error("describe_event_categories not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_event_categories failed");
  }
}

/** Describe event subscriptions. */
export async function describeEventSubscriptions(): Promise<DescribeEventSubscriptionsResult> {
  try {
    // TODO: implement describe_event_subscriptions
    throw new Error("describe_event_subscriptions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_event_subscriptions failed");
  }
}

/** Describe events. */
export async function describeEvents(): Promise<DescribeEventsResult> {
  try {
    // TODO: implement describe_events
    throw new Error("describe_events not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_events failed");
  }
}

/** Describe export tasks. */
export async function describeExportTasks(): Promise<DescribeExportTasksResult> {
  try {
    // TODO: implement describe_export_tasks
    throw new Error("describe_export_tasks not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_export_tasks failed");
  }
}

/** Describe global clusters. */
export async function describeGlobalClusters(): Promise<DescribeGlobalClustersResult> {
  try {
    // TODO: implement describe_global_clusters
    throw new Error("describe_global_clusters not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_global_clusters failed");
  }
}

/** Describe integrations. */
export async function describeIntegrations(): Promise<DescribeIntegrationsResult> {
  try {
    // TODO: implement describe_integrations
    throw new Error("describe_integrations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_integrations failed");
  }
}

/** Describe option group options. */
export async function describeOptionGroupOptions(engineName: string): Promise<DescribeOptionGroupOptionsResult> {
  try {
    // TODO: implement describe_option_group_options
    throw new Error("describe_option_group_options not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_option_group_options failed");
  }
}

/** Describe option groups. */
export async function describeOptionGroups(): Promise<DescribeOptionGroupsResult> {
  try {
    // TODO: implement describe_option_groups
    throw new Error("describe_option_groups not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_option_groups failed");
  }
}

/** Describe orderable db instance options. */
export async function describeOrderableDbInstanceOptions(engine: string): Promise<DescribeOrderableDbInstanceOptionsResult> {
  try {
    // TODO: implement describe_orderable_db_instance_options
    throw new Error("describe_orderable_db_instance_options not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_orderable_db_instance_options failed");
  }
}

/** Describe pending maintenance actions. */
export async function describePendingMaintenanceActions(): Promise<DescribePendingMaintenanceActionsResult> {
  try {
    // TODO: implement describe_pending_maintenance_actions
    throw new Error("describe_pending_maintenance_actions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_pending_maintenance_actions failed");
  }
}

/** Describe reserved db instances. */
export async function describeReservedDbInstances(): Promise<DescribeReservedDbInstancesResult> {
  try {
    // TODO: implement describe_reserved_db_instances
    throw new Error("describe_reserved_db_instances not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_reserved_db_instances failed");
  }
}

/** Describe reserved db instances offerings. */
export async function describeReservedDbInstancesOfferings(): Promise<DescribeReservedDbInstancesOfferingsResult> {
  try {
    // TODO: implement describe_reserved_db_instances_offerings
    throw new Error("describe_reserved_db_instances_offerings not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_reserved_db_instances_offerings failed");
  }
}

/** Describe source regions. */
export async function describeSourceRegions(): Promise<DescribeSourceRegionsResult> {
  try {
    // TODO: implement describe_source_regions
    throw new Error("describe_source_regions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_source_regions failed");
  }
}

/** Describe tenant databases. */
export async function describeTenantDatabases(): Promise<DescribeTenantDatabasesResult> {
  try {
    // TODO: implement describe_tenant_databases
    throw new Error("describe_tenant_databases not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_tenant_databases failed");
  }
}

/** Describe valid db instance modifications. */
export async function describeValidDbInstanceModifications(dbInstanceIdentifier: string, regionName?: string | undefined): Promise<DescribeValidDbInstanceModificationsResult> {
  try {
    // TODO: implement describe_valid_db_instance_modifications
    throw new Error("describe_valid_db_instance_modifications not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_valid_db_instance_modifications failed");
  }
}

/** Disable http endpoint. */
export async function disableHttpEndpoint(resourceArn: string, regionName?: string | undefined): Promise<DisableHttpEndpointResult> {
  try {
    // TODO: implement disable_http_endpoint
    throw new Error("disable_http_endpoint not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disable_http_endpoint failed");
  }
}

/** Download db log file portion. */
export async function downloadDbLogFilePortion(dbInstanceIdentifier: string, logFileName: string): Promise<DownloadDbLogFilePortionResult> {
  try {
    // TODO: implement download_db_log_file_portion
    throw new Error("download_db_log_file_portion not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "download_db_log_file_portion failed");
  }
}

/** Enable http endpoint. */
export async function enableHttpEndpoint(resourceArn: string, regionName?: string | undefined): Promise<EnableHttpEndpointResult> {
  try {
    // TODO: implement enable_http_endpoint
    throw new Error("enable_http_endpoint not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "enable_http_endpoint failed");
  }
}

/** Failover db cluster. */
export async function failoverDbCluster(dbClusterIdentifier: string): Promise<FailoverDbClusterResult> {
  try {
    // TODO: implement failover_db_cluster
    throw new Error("failover_db_cluster not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "failover_db_cluster failed");
  }
}

/** Failover global cluster. */
export async function failoverGlobalCluster(globalClusterIdentifier: string, targetDbClusterIdentifier: string): Promise<FailoverGlobalClusterResult> {
  try {
    // TODO: implement failover_global_cluster
    throw new Error("failover_global_cluster not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "failover_global_cluster failed");
  }
}

/** List tags for resource. */
export async function listTagsForResource(resourceName: string): Promise<ListTagsForResourceResult> {
  try {
    // TODO: implement list_tags_for_resource
    throw new Error("list_tags_for_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_tags_for_resource failed");
  }
}

/** Modify activity stream. */
export async function modifyActivityStream(): Promise<ModifyActivityStreamResult> {
  try {
    // TODO: implement modify_activity_stream
    throw new Error("modify_activity_stream not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_activity_stream failed");
  }
}

/** Modify certificates. */
export async function modifyCertificates(): Promise<ModifyCertificatesResult> {
  try {
    // TODO: implement modify_certificates
    throw new Error("modify_certificates not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_certificates failed");
  }
}

/** Modify current db cluster capacity. */
export async function modifyCurrentDbClusterCapacity(dbClusterIdentifier: string): Promise<ModifyCurrentDbClusterCapacityResult> {
  try {
    // TODO: implement modify_current_db_cluster_capacity
    throw new Error("modify_current_db_cluster_capacity not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_current_db_cluster_capacity failed");
  }
}

/** Modify custom db engine version. */
export async function modifyCustomDbEngineVersion(engine: string, engineVersion: string): Promise<ModifyCustomDbEngineVersionResult> {
  try {
    // TODO: implement modify_custom_db_engine_version
    throw new Error("modify_custom_db_engine_version not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_custom_db_engine_version failed");
  }
}

/** Modify db cluster. */
export async function modifyDbCluster(dbClusterIdentifier: string): Promise<ModifyDbClusterResult> {
  try {
    // TODO: implement modify_db_cluster
    throw new Error("modify_db_cluster not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_db_cluster failed");
  }
}

/** Modify db cluster endpoint. */
export async function modifyDbClusterEndpoint(dbClusterEndpointIdentifier: string): Promise<ModifyDbClusterEndpointResult> {
  try {
    // TODO: implement modify_db_cluster_endpoint
    throw new Error("modify_db_cluster_endpoint not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_db_cluster_endpoint failed");
  }
}

/** Modify db cluster parameter group. */
export async function modifyDbClusterParameterGroup(dbClusterParameterGroupName: string, parameters: Record<string, unknown>[], regionName?: string | undefined): Promise<ModifyDbClusterParameterGroupResult> {
  try {
    // TODO: implement modify_db_cluster_parameter_group
    throw new Error("modify_db_cluster_parameter_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_db_cluster_parameter_group failed");
  }
}

/** Modify db cluster snapshot attribute. */
export async function modifyDbClusterSnapshotAttribute(dbClusterSnapshotIdentifier: string, attributeName: string): Promise<ModifyDbClusterSnapshotAttributeResult> {
  try {
    // TODO: implement modify_db_cluster_snapshot_attribute
    throw new Error("modify_db_cluster_snapshot_attribute not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_db_cluster_snapshot_attribute failed");
  }
}

/** Modify db instance. */
export async function modifyDbInstance(dbInstanceIdentifier: string): Promise<ModifyDbInstanceResult> {
  try {
    // TODO: implement modify_db_instance
    throw new Error("modify_db_instance not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_db_instance failed");
  }
}

/** Modify db parameter group. */
export async function modifyDbParameterGroup(dbParameterGroupName: string, parameters: Record<string, unknown>[], regionName?: string | undefined): Promise<ModifyDbParameterGroupResult> {
  try {
    // TODO: implement modify_db_parameter_group
    throw new Error("modify_db_parameter_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_db_parameter_group failed");
  }
}

/** Modify db proxy. */
export async function modifyDbProxy(dbProxyName: string): Promise<ModifyDbProxyResult> {
  try {
    // TODO: implement modify_db_proxy
    throw new Error("modify_db_proxy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_db_proxy failed");
  }
}

/** Modify db proxy endpoint. */
export async function modifyDbProxyEndpoint(dbProxyEndpointName: string): Promise<ModifyDbProxyEndpointResult> {
  try {
    // TODO: implement modify_db_proxy_endpoint
    throw new Error("modify_db_proxy_endpoint not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_db_proxy_endpoint failed");
  }
}

/** Modify db proxy target group. */
export async function modifyDbProxyTargetGroup(targetGroupName: string, dbProxyName: string): Promise<ModifyDbProxyTargetGroupResult> {
  try {
    // TODO: implement modify_db_proxy_target_group
    throw new Error("modify_db_proxy_target_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_db_proxy_target_group failed");
  }
}

/** Modify db recommendation. */
export async function modifyDbRecommendation(recommendationId: string): Promise<ModifyDbRecommendationResult> {
  try {
    // TODO: implement modify_db_recommendation
    throw new Error("modify_db_recommendation not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_db_recommendation failed");
  }
}

/** Modify db shard group. */
export async function modifyDbShardGroup(dbShardGroupIdentifier: string): Promise<ModifyDbShardGroupResult> {
  try {
    // TODO: implement modify_db_shard_group
    throw new Error("modify_db_shard_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_db_shard_group failed");
  }
}

/** Modify db snapshot. */
export async function modifyDbSnapshot(dbSnapshotIdentifier: string): Promise<ModifyDbSnapshotResult> {
  try {
    // TODO: implement modify_db_snapshot
    throw new Error("modify_db_snapshot not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_db_snapshot failed");
  }
}

/** Modify db snapshot attribute. */
export async function modifyDbSnapshotAttribute(dbSnapshotIdentifier: string, attributeName: string): Promise<ModifyDbSnapshotAttributeResult> {
  try {
    // TODO: implement modify_db_snapshot_attribute
    throw new Error("modify_db_snapshot_attribute not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_db_snapshot_attribute failed");
  }
}

/** Modify db subnet group. */
export async function modifyDbSubnetGroup(dbSubnetGroupName: string, subnetIds: string[]): Promise<ModifyDbSubnetGroupResult> {
  try {
    // TODO: implement modify_db_subnet_group
    throw new Error("modify_db_subnet_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_db_subnet_group failed");
  }
}

/** Modify event subscription. */
export async function modifyEventSubscription(subscriptionName: string): Promise<ModifyEventSubscriptionResult> {
  try {
    // TODO: implement modify_event_subscription
    throw new Error("modify_event_subscription not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_event_subscription failed");
  }
}

/** Modify global cluster. */
export async function modifyGlobalCluster(globalClusterIdentifier: string): Promise<ModifyGlobalClusterResult> {
  try {
    // TODO: implement modify_global_cluster
    throw new Error("modify_global_cluster not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_global_cluster failed");
  }
}

/** Modify integration. */
export async function modifyIntegration(integrationIdentifier: string): Promise<ModifyIntegrationResult> {
  try {
    // TODO: implement modify_integration
    throw new Error("modify_integration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_integration failed");
  }
}

/** Modify option group. */
export async function modifyOptionGroup(optionGroupName: string): Promise<ModifyOptionGroupResult> {
  try {
    // TODO: implement modify_option_group
    throw new Error("modify_option_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_option_group failed");
  }
}

/** Modify tenant database. */
export async function modifyTenantDatabase(dbInstanceIdentifier: string, tenantDbName: string): Promise<ModifyTenantDatabaseResult> {
  try {
    // TODO: implement modify_tenant_database
    throw new Error("modify_tenant_database not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_tenant_database failed");
  }
}

/** Promote read replica. */
export async function promoteReadReplica(dbInstanceIdentifier: string): Promise<PromoteReadReplicaResult> {
  try {
    // TODO: implement promote_read_replica
    throw new Error("promote_read_replica not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "promote_read_replica failed");
  }
}

/** Promote read replica db cluster. */
export async function promoteReadReplicaDbCluster(dbClusterIdentifier: string, regionName?: string | undefined): Promise<PromoteReadReplicaDbClusterResult> {
  try {
    // TODO: implement promote_read_replica_db_cluster
    throw new Error("promote_read_replica_db_cluster not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "promote_read_replica_db_cluster failed");
  }
}

/** Purchase reserved db instances offering. */
export async function purchaseReservedDbInstancesOffering(reservedDbInstancesOfferingId: string): Promise<PurchaseReservedDbInstancesOfferingResult> {
  try {
    // TODO: implement purchase_reserved_db_instances_offering
    throw new Error("purchase_reserved_db_instances_offering not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "purchase_reserved_db_instances_offering failed");
  }
}

/** Reboot db cluster. */
export async function rebootDbCluster(dbClusterIdentifier: string, regionName?: string | undefined): Promise<RebootDbClusterResult> {
  try {
    // TODO: implement reboot_db_cluster
    throw new Error("reboot_db_cluster not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "reboot_db_cluster failed");
  }
}

/** Reboot db instance. */
export async function rebootDbInstance(dbInstanceIdentifier: string): Promise<RebootDbInstanceResult> {
  try {
    // TODO: implement reboot_db_instance
    throw new Error("reboot_db_instance not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "reboot_db_instance failed");
  }
}

/** Reboot db shard group. */
export async function rebootDbShardGroup(dbShardGroupIdentifier: string, regionName?: string | undefined): Promise<RebootDbShardGroupResult> {
  try {
    // TODO: implement reboot_db_shard_group
    throw new Error("reboot_db_shard_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "reboot_db_shard_group failed");
  }
}

/** Register db proxy targets. */
export async function registerDbProxyTargets(dbProxyName: string): Promise<RegisterDbProxyTargetsResult> {
  try {
    // TODO: implement register_db_proxy_targets
    throw new Error("register_db_proxy_targets not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "register_db_proxy_targets failed");
  }
}

/** Remove from global cluster. */
export async function removeFromGlobalCluster(globalClusterIdentifier: string, dbClusterIdentifier: string, regionName?: string | undefined): Promise<RemoveFromGlobalClusterResult> {
  try {
    // TODO: implement remove_from_global_cluster
    throw new Error("remove_from_global_cluster not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "remove_from_global_cluster failed");
  }
}

/** Remove role from db cluster. */
export async function removeRoleFromDbCluster(dbClusterIdentifier: string, roleArn: string): Promise<void> {
  try {
    // TODO: implement remove_role_from_db_cluster
    throw new Error("remove_role_from_db_cluster not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "remove_role_from_db_cluster failed");
  }
}

/** Remove role from db instance. */
export async function removeRoleFromDbInstance(dbInstanceIdentifier: string, roleArn: string, featureName: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement remove_role_from_db_instance
    throw new Error("remove_role_from_db_instance not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "remove_role_from_db_instance failed");
  }
}

/** Remove source identifier from subscription. */
export async function removeSourceIdentifierFromSubscription(subscriptionName: string, sourceIdentifier: string, regionName?: string | undefined): Promise<RemoveSourceIdentifierFromSubscriptionResult> {
  try {
    // TODO: implement remove_source_identifier_from_subscription
    throw new Error("remove_source_identifier_from_subscription not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "remove_source_identifier_from_subscription failed");
  }
}

/** Remove tags from resource. */
export async function removeTagsFromResource(resourceName: string, tagKeys: string[], regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement remove_tags_from_resource
    throw new Error("remove_tags_from_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "remove_tags_from_resource failed");
  }
}

/** Reset db cluster parameter group. */
export async function resetDbClusterParameterGroup(dbClusterParameterGroupName: string): Promise<ResetDbClusterParameterGroupResult> {
  try {
    // TODO: implement reset_db_cluster_parameter_group
    throw new Error("reset_db_cluster_parameter_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "reset_db_cluster_parameter_group failed");
  }
}

/** Reset db parameter group. */
export async function resetDbParameterGroup(dbParameterGroupName: string): Promise<ResetDbParameterGroupResult> {
  try {
    // TODO: implement reset_db_parameter_group
    throw new Error("reset_db_parameter_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "reset_db_parameter_group failed");
  }
}

/** Restore db cluster from s3. */
export async function restoreDbClusterFromS3(dbClusterIdentifier: string, engine: string, masterUsername: string, sourceEngine: string, sourceEngineVersion: string, s3BucketName: string, s3IngestionRoleArn: string): Promise<RestoreDbClusterFromS3Result> {
  try {
    // TODO: implement restore_db_cluster_from_s3
    throw new Error("restore_db_cluster_from_s3 not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "restore_db_cluster_from_s3 failed");
  }
}

/** Restore db cluster from snapshot. */
export async function restoreDbClusterFromSnapshot(dbClusterIdentifier: string, snapshotIdentifier: string, engine: string): Promise<RestoreDbClusterFromSnapshotResult> {
  try {
    // TODO: implement restore_db_cluster_from_snapshot
    throw new Error("restore_db_cluster_from_snapshot not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "restore_db_cluster_from_snapshot failed");
  }
}

/** Restore db cluster to point in time. */
export async function restoreDbClusterToPointInTime(dbClusterIdentifier: string): Promise<RestoreDbClusterToPointInTimeResult> {
  try {
    // TODO: implement restore_db_cluster_to_point_in_time
    throw new Error("restore_db_cluster_to_point_in_time not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "restore_db_cluster_to_point_in_time failed");
  }
}

/** Restore db instance from db snapshot. */
export async function restoreDbInstanceFromDbSnapshot(dbInstanceIdentifier: string): Promise<RestoreDbInstanceFromDbSnapshotResult> {
  try {
    // TODO: implement restore_db_instance_from_db_snapshot
    throw new Error("restore_db_instance_from_db_snapshot not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "restore_db_instance_from_db_snapshot failed");
  }
}

/** Restore db instance from s3. */
export async function restoreDbInstanceFromS3(dbInstanceIdentifier: string, dbInstanceClass: string, engine: string, sourceEngine: string, sourceEngineVersion: string, s3BucketName: string, s3IngestionRoleArn: string): Promise<RestoreDbInstanceFromS3Result> {
  try {
    // TODO: implement restore_db_instance_from_s3
    throw new Error("restore_db_instance_from_s3 not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "restore_db_instance_from_s3 failed");
  }
}

/** Restore db instance to point in time. */
export async function restoreDbInstanceToPointInTime(targetDbInstanceIdentifier: string): Promise<RestoreDbInstanceToPointInTimeResult> {
  try {
    // TODO: implement restore_db_instance_to_point_in_time
    throw new Error("restore_db_instance_to_point_in_time not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "restore_db_instance_to_point_in_time failed");
  }
}

/** Revoke db security group ingress. */
export async function revokeDbSecurityGroupIngress(dbSecurityGroupName: string): Promise<RevokeDbSecurityGroupIngressResult> {
  try {
    // TODO: implement revoke_db_security_group_ingress
    throw new Error("revoke_db_security_group_ingress not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "revoke_db_security_group_ingress failed");
  }
}

/** Start activity stream. */
export async function startActivityStream(resourceArn: string, mode: string, kmsKeyId: string): Promise<StartActivityStreamResult> {
  try {
    // TODO: implement start_activity_stream
    throw new Error("start_activity_stream not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_activity_stream failed");
  }
}

/** Start db cluster. */
export async function startDbCluster(dbClusterIdentifier: string, regionName?: string | undefined): Promise<StartDbClusterResult> {
  try {
    // TODO: implement start_db_cluster
    throw new Error("start_db_cluster not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_db_cluster failed");
  }
}

/** Start db instance automated backups replication. */
export async function startDbInstanceAutomatedBackupsReplication(sourceDbInstanceArn: string): Promise<StartDbInstanceAutomatedBackupsReplicationResult> {
  try {
    // TODO: implement start_db_instance_automated_backups_replication
    throw new Error("start_db_instance_automated_backups_replication not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_db_instance_automated_backups_replication failed");
  }
}

/** Start export task. */
export async function startExportTask(exportTaskIdentifier: string, sourceArn: string, s3BucketName: string, iamRoleArn: string, kmsKeyId: string): Promise<StartExportTaskResult> {
  try {
    // TODO: implement start_export_task
    throw new Error("start_export_task not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_export_task failed");
  }
}

/** Stop activity stream. */
export async function stopActivityStream(resourceArn: string): Promise<StopActivityStreamResult> {
  try {
    // TODO: implement stop_activity_stream
    throw new Error("stop_activity_stream not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "stop_activity_stream failed");
  }
}

/** Stop db cluster. */
export async function stopDbCluster(dbClusterIdentifier: string, regionName?: string | undefined): Promise<StopDbClusterResult> {
  try {
    // TODO: implement stop_db_cluster
    throw new Error("stop_db_cluster not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "stop_db_cluster failed");
  }
}

/** Stop db instance automated backups replication. */
export async function stopDbInstanceAutomatedBackupsReplication(sourceDbInstanceArn: string, regionName?: string | undefined): Promise<StopDbInstanceAutomatedBackupsReplicationResult> {
  try {
    // TODO: implement stop_db_instance_automated_backups_replication
    throw new Error("stop_db_instance_automated_backups_replication not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "stop_db_instance_automated_backups_replication failed");
  }
}

/** Switchover blue green deployment. */
export async function switchoverBlueGreenDeployment(blueGreenDeploymentIdentifier: string): Promise<SwitchoverBlueGreenDeploymentResult> {
  try {
    // TODO: implement switchover_blue_green_deployment
    throw new Error("switchover_blue_green_deployment not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "switchover_blue_green_deployment failed");
  }
}

/** Switchover global cluster. */
export async function switchoverGlobalCluster(globalClusterIdentifier: string, targetDbClusterIdentifier: string, regionName?: string | undefined): Promise<SwitchoverGlobalClusterResult> {
  try {
    // TODO: implement switchover_global_cluster
    throw new Error("switchover_global_cluster not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "switchover_global_cluster failed");
  }
}

/** Switchover read replica. */
export async function switchoverReadReplica(dbInstanceIdentifier: string, regionName?: string | undefined): Promise<SwitchoverReadReplicaResult> {
  try {
    // TODO: implement switchover_read_replica
    throw new Error("switchover_read_replica not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "switchover_read_replica failed");
  }
}
