import { ElasticacheClient } from "@aws-sdk/client-elasticache";
import { getClient } from "./client";
import { wrapAwsError } from "./exceptions";

/** Metadata for an ElastiCache cache cluster. */
export type CacheClusterResult = {
  cacheClusterId: string;
  cacheClusterStatus: string;
  cacheNodeType: string;
  engine: string;
  engineVersion: string;
  numCacheNodes: number;
  preferredAvailabilityZone?: string;
  cacheSubnetGroupName?: string;
  extra?: Record<string, unknown>;
};

/** Metadata for an ElastiCache replication group. */
export type ReplicationGroupResult = {
  replicationGroupId: string;
  description: string;
  status: string;
  memberClusters?: string[];
  nodeGroups?: Record<string, unknown>[];
  automaticFailover?: string;
  extra?: Record<string, unknown>;
};

/** Metadata for an ElastiCache cache subnet group. */
export type CacheSubnetGroupResult = {
  name: string;
  description: string;
  vpcId: string;
  subnets?: string[];
  extra?: Record<string, unknown>;
};

/** Metadata for an ElastiCache snapshot. */
export type SnapshotResult = {
  snapshotName: string;
  cacheClusterId?: string;
  replicationGroupId?: string;
  snapshotStatus: string;
  extra?: Record<string, unknown>;
};

/** Result of authorize_cache_security_group_ingress. */
export type AuthorizeCacheSecurityGroupIngressResult = {
  cacheSecurityGroup?: Record<string, unknown>;
};

/** Result of batch_apply_update_action. */
export type BatchApplyUpdateActionResult = {
  processedUpdateActions?: Record<string, unknown>[];
  unprocessedUpdateActions?: Record<string, unknown>[];
};

/** Result of batch_stop_update_action. */
export type BatchStopUpdateActionResult = {
  processedUpdateActions?: Record<string, unknown>[];
  unprocessedUpdateActions?: Record<string, unknown>[];
};

/** Result of complete_migration. */
export type CompleteMigrationResult = {
  replicationGroup?: Record<string, unknown>;
};

/** Result of copy_serverless_cache_snapshot. */
export type CopyServerlessCacheSnapshotResult = {
  serverlessCacheSnapshot?: Record<string, unknown>;
};

/** Result of copy_snapshot. */
export type CopySnapshotResult = {
  snapshot?: Record<string, unknown>;
};

/** Result of create_cache_parameter_group. */
export type CreateCacheParameterGroupResult = {
  cacheParameterGroup?: Record<string, unknown>;
};

/** Result of create_cache_security_group. */
export type CreateCacheSecurityGroupResult = {
  cacheSecurityGroup?: Record<string, unknown>;
};

/** Result of create_global_replication_group. */
export type CreateGlobalReplicationGroupResult = {
  globalReplicationGroup?: Record<string, unknown>;
};

/** Result of create_serverless_cache. */
export type CreateServerlessCacheResult = {
  serverlessCache?: Record<string, unknown>;
};

/** Result of create_serverless_cache_snapshot. */
export type CreateServerlessCacheSnapshotResult = {
  serverlessCacheSnapshot?: Record<string, unknown>;
};

/** Result of create_user. */
export type CreateUserResult = {
  userId?: string;
  userName?: string;
  status?: string;
  engine?: string;
  minimumEngineVersion?: string;
  accessString?: string;
  userGroupIds?: string[];
  authentication?: Record<string, unknown>;
  arn?: string;
};

/** Result of create_user_group. */
export type CreateUserGroupResult = {
  userGroupId?: string;
  status?: string;
  engine?: string;
  userIds?: string[];
  minimumEngineVersion?: string;
  pendingChanges?: Record<string, unknown>;
  replicationGroups?: string[];
  serverlessCaches?: string[];
  arn?: string;
};

/** Result of decrease_node_groups_in_global_replication_group. */
export type DecreaseNodeGroupsInGlobalReplicationGroupResult = {
  globalReplicationGroup?: Record<string, unknown>;
};

/** Result of decrease_replica_count. */
export type DecreaseReplicaCountResult = {
  replicationGroup?: Record<string, unknown>;
};

/** Result of delete_global_replication_group. */
export type DeleteGlobalReplicationGroupResult = {
  globalReplicationGroup?: Record<string, unknown>;
};

/** Result of delete_serverless_cache. */
export type DeleteServerlessCacheResult = {
  serverlessCache?: Record<string, unknown>;
};

/** Result of delete_serverless_cache_snapshot. */
export type DeleteServerlessCacheSnapshotResult = {
  serverlessCacheSnapshot?: Record<string, unknown>;
};

/** Result of delete_user. */
export type DeleteUserResult = {
  userId?: string;
  userName?: string;
  status?: string;
  engine?: string;
  minimumEngineVersion?: string;
  accessString?: string;
  userGroupIds?: string[];
  authentication?: Record<string, unknown>;
  arn?: string;
};

/** Result of delete_user_group. */
export type DeleteUserGroupResult = {
  userGroupId?: string;
  status?: string;
  engine?: string;
  userIds?: string[];
  minimumEngineVersion?: string;
  pendingChanges?: Record<string, unknown>;
  replicationGroups?: string[];
  serverlessCaches?: string[];
  arn?: string;
};

/** Result of describe_cache_engine_versions. */
export type DescribeCacheEngineVersionsResult = {
  marker?: string;
  cacheEngineVersions?: Record<string, unknown>[];
};

/** Result of describe_cache_parameter_groups. */
export type DescribeCacheParameterGroupsResult = {
  marker?: string;
  cacheParameterGroups?: Record<string, unknown>[];
};

/** Result of describe_cache_parameters. */
export type DescribeCacheParametersResult = {
  marker?: string;
  parameters?: Record<string, unknown>[];
  cacheNodeTypeSpecificParameters?: Record<string, unknown>[];
};

/** Result of describe_cache_security_groups. */
export type DescribeCacheSecurityGroupsResult = {
  marker?: string;
  cacheSecurityGroups?: Record<string, unknown>[];
};

/** Result of describe_engine_default_parameters. */
export type DescribeEngineDefaultParametersResult = {
  engineDefaults?: Record<string, unknown>;
};

/** Result of describe_events. */
export type DescribeEventsResult = {
  marker?: string;
  events?: Record<string, unknown>[];
};

/** Result of describe_global_replication_groups. */
export type DescribeGlobalReplicationGroupsResult = {
  marker?: string;
  globalReplicationGroups?: Record<string, unknown>[];
};

/** Result of describe_reserved_cache_nodes. */
export type DescribeReservedCacheNodesResult = {
  marker?: string;
  reservedCacheNodes?: Record<string, unknown>[];
};

/** Result of describe_reserved_cache_nodes_offerings. */
export type DescribeReservedCacheNodesOfferingsResult = {
  marker?: string;
  reservedCacheNodesOfferings?: Record<string, unknown>[];
};

/** Result of describe_serverless_cache_snapshots. */
export type DescribeServerlessCacheSnapshotsResult = {
  nextToken?: string;
  serverlessCacheSnapshots?: Record<string, unknown>[];
};

/** Result of describe_serverless_caches. */
export type DescribeServerlessCachesResult = {
  nextToken?: string;
  serverlessCaches?: Record<string, unknown>[];
};

/** Result of describe_service_updates. */
export type DescribeServiceUpdatesResult = {
  marker?: string;
  serviceUpdates?: Record<string, unknown>[];
};

/** Result of describe_update_actions. */
export type DescribeUpdateActionsResult = {
  marker?: string;
  updateActions?: Record<string, unknown>[];
};

/** Result of describe_user_groups. */
export type DescribeUserGroupsResult = {
  userGroups?: Record<string, unknown>[];
  marker?: string;
};

/** Result of describe_users. */
export type DescribeUsersResult = {
  users?: Record<string, unknown>[];
  marker?: string;
};

/** Result of disassociate_global_replication_group. */
export type DisassociateGlobalReplicationGroupResult = {
  globalReplicationGroup?: Record<string, unknown>;
};

/** Result of export_serverless_cache_snapshot. */
export type ExportServerlessCacheSnapshotResult = {
  serverlessCacheSnapshot?: Record<string, unknown>;
};

/** Result of failover_global_replication_group. */
export type FailoverGlobalReplicationGroupResult = {
  globalReplicationGroup?: Record<string, unknown>;
};

/** Result of increase_node_groups_in_global_replication_group. */
export type IncreaseNodeGroupsInGlobalReplicationGroupResult = {
  globalReplicationGroup?: Record<string, unknown>;
};

/** Result of increase_replica_count. */
export type IncreaseReplicaCountResult = {
  replicationGroup?: Record<string, unknown>;
};

/** Result of list_allowed_node_type_modifications. */
export type ListAllowedNodeTypeModificationsResult = {
  scaleUpModifications?: string[];
  scaleDownModifications?: string[];
};

/** Result of modify_cache_parameter_group. */
export type ModifyCacheParameterGroupResult = {
  cacheParameterGroupName?: string;
};

/** Result of modify_cache_subnet_group. */
export type ModifyCacheSubnetGroupResult = {
  cacheSubnetGroup?: Record<string, unknown>;
};

/** Result of modify_global_replication_group. */
export type ModifyGlobalReplicationGroupResult = {
  globalReplicationGroup?: Record<string, unknown>;
};

/** Result of modify_replication_group_shard_configuration. */
export type ModifyReplicationGroupShardConfigurationResult = {
  replicationGroup?: Record<string, unknown>;
};

/** Result of modify_serverless_cache. */
export type ModifyServerlessCacheResult = {
  serverlessCache?: Record<string, unknown>;
};

/** Result of modify_user. */
export type ModifyUserResult = {
  userId?: string;
  userName?: string;
  status?: string;
  engine?: string;
  minimumEngineVersion?: string;
  accessString?: string;
  userGroupIds?: string[];
  authentication?: Record<string, unknown>;
  arn?: string;
};

/** Result of modify_user_group. */
export type ModifyUserGroupResult = {
  userGroupId?: string;
  status?: string;
  engine?: string;
  userIds?: string[];
  minimumEngineVersion?: string;
  pendingChanges?: Record<string, unknown>;
  replicationGroups?: string[];
  serverlessCaches?: string[];
  arn?: string;
};

/** Result of purchase_reserved_cache_nodes_offering. */
export type PurchaseReservedCacheNodesOfferingResult = {
  reservedCacheNode?: Record<string, unknown>;
};

/** Result of rebalance_slots_in_global_replication_group. */
export type RebalanceSlotsInGlobalReplicationGroupResult = {
  globalReplicationGroup?: Record<string, unknown>;
};

/** Result of remove_tags_from_resource. */
export type RemoveTagsFromResourceResult = {
  tagList?: Record<string, unknown>[];
};

/** Result of reset_cache_parameter_group. */
export type ResetCacheParameterGroupResult = {
  cacheParameterGroupName?: string;
};

/** Result of revoke_cache_security_group_ingress. */
export type RevokeCacheSecurityGroupIngressResult = {
  cacheSecurityGroup?: Record<string, unknown>;
};

/** Result of run_failover. */
export type RunFailoverResult = {
  replicationGroup?: Record<string, unknown>;
};

/** Result of run_migration. */
export type RunMigrationResult = {
  replicationGroup?: Record<string, unknown>;
};

/** Result of start_migration. */
export type StartMigrationResult = {
  replicationGroup?: Record<string, unknown>;
};

/** Create a new ElastiCache cache cluster. */
export async function createCacheCluster(cacheClusterId: string): Promise<CacheClusterResult> {
  try {
    // TODO: implement create_cache_cluster
    throw new Error("create_cache_cluster not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_cache_cluster failed");
  }
}

/** Describe one or more cache clusters. */
export async function describeCacheClusters(): Promise<CacheClusterResult[]> {
  try {
    // TODO: implement describe_cache_clusters
    throw new Error("describe_cache_clusters not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_cache_clusters failed");
  }
}

/** Modify an existing cache cluster. */
export async function modifyCacheCluster(cacheClusterId: string): Promise<CacheClusterResult> {
  try {
    // TODO: implement modify_cache_cluster
    throw new Error("modify_cache_cluster not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_cache_cluster failed");
  }
}

/** Delete a cache cluster. */
export async function deleteCacheCluster(cacheClusterId: string): Promise<void> {
  try {
    // TODO: implement delete_cache_cluster
    throw new Error("delete_cache_cluster not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_cache_cluster failed");
  }
}

/** Reboot specific nodes in a cache cluster. */
export async function rebootCacheCluster(cacheClusterId: string): Promise<CacheClusterResult> {
  try {
    // TODO: implement reboot_cache_cluster
    throw new Error("reboot_cache_cluster not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "reboot_cache_cluster failed");
  }
}

/** Create a new replication group. */
export async function createReplicationGroup(replicationGroupId: string): Promise<ReplicationGroupResult> {
  try {
    // TODO: implement create_replication_group
    throw new Error("create_replication_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_replication_group failed");
  }
}

/** Describe one or more replication groups. */
export async function describeReplicationGroups(): Promise<ReplicationGroupResult[]> {
  try {
    // TODO: implement describe_replication_groups
    throw new Error("describe_replication_groups not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_replication_groups failed");
  }
}

/** Modify an existing replication group. */
export async function modifyReplicationGroup(replicationGroupId: string): Promise<ReplicationGroupResult> {
  try {
    // TODO: implement modify_replication_group
    throw new Error("modify_replication_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_replication_group failed");
  }
}

/** Delete a replication group. */
export async function deleteReplicationGroup(replicationGroupId: string): Promise<void> {
  try {
    // TODO: implement delete_replication_group
    throw new Error("delete_replication_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_replication_group failed");
  }
}

/** Create a cache subnet group. */
export async function createCacheSubnetGroup(name: string): Promise<CacheSubnetGroupResult> {
  try {
    // TODO: implement create_cache_subnet_group
    throw new Error("create_cache_subnet_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_cache_subnet_group failed");
  }
}

/** Describe one or more cache subnet groups. */
export async function describeCacheSubnetGroups(): Promise<CacheSubnetGroupResult[]> {
  try {
    // TODO: implement describe_cache_subnet_groups
    throw new Error("describe_cache_subnet_groups not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_cache_subnet_groups failed");
  }
}

/** Create a snapshot of a cache cluster or replication group. */
export async function createSnapshot(snapshotName: string): Promise<SnapshotResult> {
  try {
    // TODO: implement create_snapshot
    throw new Error("create_snapshot not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_snapshot failed");
  }
}

/** Describe one or more snapshots. */
export async function describeSnapshots(): Promise<SnapshotResult[]> {
  try {
    // TODO: implement describe_snapshots
    throw new Error("describe_snapshots not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_snapshots failed");
  }
}

/** Delete a snapshot. */
export async function deleteSnapshot(snapshotName: string): Promise<void> {
  try {
    // TODO: implement delete_snapshot
    throw new Error("delete_snapshot not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_snapshot failed");
  }
}

/** List tags for an ElastiCache resource. */
export async function listTagsForResource(arn: string): Promise<Record<string, unknown>> {
  try {
    // TODO: implement list_tags_for_resource
    throw new Error("list_tags_for_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_tags_for_resource failed");
  }
}

/** Add tags to an ElastiCache resource. */
export async function addTagsToResource(arn: string): Promise<void> {
  try {
    // TODO: implement add_tags_to_resource
    throw new Error("add_tags_to_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "add_tags_to_resource failed");
  }
}

/** Poll until a cache cluster reaches the target status. */
export async function waitForCacheCluster(cacheClusterId: string): Promise<CacheClusterResult> {
  try {
    // TODO: implement wait_for_cache_cluster
    throw new Error("wait_for_cache_cluster not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "wait_for_cache_cluster failed");
  }
}

/** Poll until a replication group reaches the target status. */
export async function waitForReplicationGroup(replicationGroupId: string): Promise<ReplicationGroupResult> {
  try {
    // TODO: implement wait_for_replication_group
    throw new Error("wait_for_replication_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "wait_for_replication_group failed");
  }
}

/** Get or create a cache cluster (idempotent). */
export async function ensureCacheCluster(cacheClusterId: string): Promise<unknown> {
  try {
    // TODO: implement ensure_cache_cluster
    throw new Error("ensure_cache_cluster not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "ensure_cache_cluster failed");
  }
}

/** Get or create a replication group (idempotent). */
export async function ensureReplicationGroup(replicationGroupId: string): Promise<unknown> {
  try {
    // TODO: implement ensure_replication_group
    throw new Error("ensure_replication_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "ensure_replication_group failed");
  }
}

/** Authorize cache security group ingress. */
export async function authorizeCacheSecurityGroupIngress(cacheSecurityGroupName: string, ec2SecurityGroupName: string, ec2SecurityGroupOwnerId: string, regionName?: string): Promise<AuthorizeCacheSecurityGroupIngressResult> {
  try {
    // TODO: implement authorize_cache_security_group_ingress
    throw new Error("authorize_cache_security_group_ingress not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "authorize_cache_security_group_ingress failed");
  }
}

/** Batch apply update action. */
export async function batchApplyUpdateAction(serviceUpdateName: string): Promise<BatchApplyUpdateActionResult> {
  try {
    // TODO: implement batch_apply_update_action
    throw new Error("batch_apply_update_action not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_apply_update_action failed");
  }
}

/** Batch stop update action. */
export async function batchStopUpdateAction(serviceUpdateName: string): Promise<BatchStopUpdateActionResult> {
  try {
    // TODO: implement batch_stop_update_action
    throw new Error("batch_stop_update_action not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_stop_update_action failed");
  }
}

/** Complete migration. */
export async function completeMigration(replicationGroupId: string): Promise<CompleteMigrationResult> {
  try {
    // TODO: implement complete_migration
    throw new Error("complete_migration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "complete_migration failed");
  }
}

/** Copy serverless cache snapshot. */
export async function copyServerlessCacheSnapshot(sourceServerlessCacheSnapshotName: string, targetServerlessCacheSnapshotName: string): Promise<CopyServerlessCacheSnapshotResult> {
  try {
    // TODO: implement copy_serverless_cache_snapshot
    throw new Error("copy_serverless_cache_snapshot not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "copy_serverless_cache_snapshot failed");
  }
}

/** Copy snapshot. */
export async function copySnapshot(sourceSnapshotName: string, targetSnapshotName: string): Promise<CopySnapshotResult> {
  try {
    // TODO: implement copy_snapshot
    throw new Error("copy_snapshot not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "copy_snapshot failed");
  }
}

/** Create cache parameter group. */
export async function createCacheParameterGroup(cacheParameterGroupName: string, cacheParameterGroupFamily: string, description: string): Promise<CreateCacheParameterGroupResult> {
  try {
    // TODO: implement create_cache_parameter_group
    throw new Error("create_cache_parameter_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_cache_parameter_group failed");
  }
}

/** Create cache security group. */
export async function createCacheSecurityGroup(cacheSecurityGroupName: string, description: string): Promise<CreateCacheSecurityGroupResult> {
  try {
    // TODO: implement create_cache_security_group
    throw new Error("create_cache_security_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_cache_security_group failed");
  }
}

/** Create global replication group. */
export async function createGlobalReplicationGroup(globalReplicationGroupIdSuffix: string, primaryReplicationGroupId: string): Promise<CreateGlobalReplicationGroupResult> {
  try {
    // TODO: implement create_global_replication_group
    throw new Error("create_global_replication_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_global_replication_group failed");
  }
}

/** Create serverless cache. */
export async function createServerlessCache(serverlessCacheName: string, engine: string): Promise<CreateServerlessCacheResult> {
  try {
    // TODO: implement create_serverless_cache
    throw new Error("create_serverless_cache not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_serverless_cache failed");
  }
}

/** Create serverless cache snapshot. */
export async function createServerlessCacheSnapshot(serverlessCacheSnapshotName: string, serverlessCacheName: string): Promise<CreateServerlessCacheSnapshotResult> {
  try {
    // TODO: implement create_serverless_cache_snapshot
    throw new Error("create_serverless_cache_snapshot not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_serverless_cache_snapshot failed");
  }
}

/** Create user. */
export async function createUser(userId: string, userName: string, engine: string, accessString: string): Promise<CreateUserResult> {
  try {
    // TODO: implement create_user
    throw new Error("create_user not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_user failed");
  }
}

/** Create user group. */
export async function createUserGroup(userGroupId: string, engine: string): Promise<CreateUserGroupResult> {
  try {
    // TODO: implement create_user_group
    throw new Error("create_user_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_user_group failed");
  }
}

/** Decrease node groups in global replication group. */
export async function decreaseNodeGroupsInGlobalReplicationGroup(globalReplicationGroupId: string, nodeGroupCount: number, applyImmediately: boolean): Promise<DecreaseNodeGroupsInGlobalReplicationGroupResult> {
  try {
    // TODO: implement decrease_node_groups_in_global_replication_group
    throw new Error("decrease_node_groups_in_global_replication_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "decrease_node_groups_in_global_replication_group failed");
  }
}

/** Decrease replica count. */
export async function decreaseReplicaCount(replicationGroupId: string, applyImmediately: boolean): Promise<DecreaseReplicaCountResult> {
  try {
    // TODO: implement decrease_replica_count
    throw new Error("decrease_replica_count not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "decrease_replica_count failed");
  }
}

/** Delete cache parameter group. */
export async function deleteCacheParameterGroup(cacheParameterGroupName: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_cache_parameter_group
    throw new Error("delete_cache_parameter_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_cache_parameter_group failed");
  }
}

/** Delete cache security group. */
export async function deleteCacheSecurityGroup(cacheSecurityGroupName: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_cache_security_group
    throw new Error("delete_cache_security_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_cache_security_group failed");
  }
}

/** Delete cache subnet group. */
export async function deleteCacheSubnetGroup(cacheSubnetGroupName: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_cache_subnet_group
    throw new Error("delete_cache_subnet_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_cache_subnet_group failed");
  }
}

/** Delete global replication group. */
export async function deleteGlobalReplicationGroup(globalReplicationGroupId: string, retainPrimaryReplicationGroup: boolean, regionName?: string): Promise<DeleteGlobalReplicationGroupResult> {
  try {
    // TODO: implement delete_global_replication_group
    throw new Error("delete_global_replication_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_global_replication_group failed");
  }
}

/** Delete serverless cache. */
export async function deleteServerlessCache(serverlessCacheName: string): Promise<DeleteServerlessCacheResult> {
  try {
    // TODO: implement delete_serverless_cache
    throw new Error("delete_serverless_cache not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_serverless_cache failed");
  }
}

/** Delete serverless cache snapshot. */
export async function deleteServerlessCacheSnapshot(serverlessCacheSnapshotName: string, regionName?: string): Promise<DeleteServerlessCacheSnapshotResult> {
  try {
    // TODO: implement delete_serverless_cache_snapshot
    throw new Error("delete_serverless_cache_snapshot not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_serverless_cache_snapshot failed");
  }
}

/** Delete user. */
export async function deleteUser(userId: string, regionName?: string): Promise<DeleteUserResult> {
  try {
    // TODO: implement delete_user
    throw new Error("delete_user not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_user failed");
  }
}

/** Delete user group. */
export async function deleteUserGroup(userGroupId: string, regionName?: string): Promise<DeleteUserGroupResult> {
  try {
    // TODO: implement delete_user_group
    throw new Error("delete_user_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_user_group failed");
  }
}

/** Describe cache engine versions. */
export async function describeCacheEngineVersions(): Promise<DescribeCacheEngineVersionsResult> {
  try {
    // TODO: implement describe_cache_engine_versions
    throw new Error("describe_cache_engine_versions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_cache_engine_versions failed");
  }
}

/** Describe cache parameter groups. */
export async function describeCacheParameterGroups(): Promise<DescribeCacheParameterGroupsResult> {
  try {
    // TODO: implement describe_cache_parameter_groups
    throw new Error("describe_cache_parameter_groups not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_cache_parameter_groups failed");
  }
}

/** Describe cache parameters. */
export async function describeCacheParameters(cacheParameterGroupName: string): Promise<DescribeCacheParametersResult> {
  try {
    // TODO: implement describe_cache_parameters
    throw new Error("describe_cache_parameters not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_cache_parameters failed");
  }
}

/** Describe cache security groups. */
export async function describeCacheSecurityGroups(): Promise<DescribeCacheSecurityGroupsResult> {
  try {
    // TODO: implement describe_cache_security_groups
    throw new Error("describe_cache_security_groups not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_cache_security_groups failed");
  }
}

/** Describe engine default parameters. */
export async function describeEngineDefaultParameters(cacheParameterGroupFamily: string): Promise<DescribeEngineDefaultParametersResult> {
  try {
    // TODO: implement describe_engine_default_parameters
    throw new Error("describe_engine_default_parameters not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_engine_default_parameters failed");
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

/** Describe global replication groups. */
export async function describeGlobalReplicationGroups(): Promise<DescribeGlobalReplicationGroupsResult> {
  try {
    // TODO: implement describe_global_replication_groups
    throw new Error("describe_global_replication_groups not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_global_replication_groups failed");
  }
}

/** Describe reserved cache nodes. */
export async function describeReservedCacheNodes(): Promise<DescribeReservedCacheNodesResult> {
  try {
    // TODO: implement describe_reserved_cache_nodes
    throw new Error("describe_reserved_cache_nodes not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_reserved_cache_nodes failed");
  }
}

/** Describe reserved cache nodes offerings. */
export async function describeReservedCacheNodesOfferings(): Promise<DescribeReservedCacheNodesOfferingsResult> {
  try {
    // TODO: implement describe_reserved_cache_nodes_offerings
    throw new Error("describe_reserved_cache_nodes_offerings not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_reserved_cache_nodes_offerings failed");
  }
}

/** Describe serverless cache snapshots. */
export async function describeServerlessCacheSnapshots(): Promise<DescribeServerlessCacheSnapshotsResult> {
  try {
    // TODO: implement describe_serverless_cache_snapshots
    throw new Error("describe_serverless_cache_snapshots not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_serverless_cache_snapshots failed");
  }
}

/** Describe serverless caches. */
export async function describeServerlessCaches(): Promise<DescribeServerlessCachesResult> {
  try {
    // TODO: implement describe_serverless_caches
    throw new Error("describe_serverless_caches not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_serverless_caches failed");
  }
}

/** Describe service updates. */
export async function describeServiceUpdates(): Promise<DescribeServiceUpdatesResult> {
  try {
    // TODO: implement describe_service_updates
    throw new Error("describe_service_updates not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_service_updates failed");
  }
}

/** Describe update actions. */
export async function describeUpdateActions(): Promise<DescribeUpdateActionsResult> {
  try {
    // TODO: implement describe_update_actions
    throw new Error("describe_update_actions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_update_actions failed");
  }
}

/** Describe user groups. */
export async function describeUserGroups(): Promise<DescribeUserGroupsResult> {
  try {
    // TODO: implement describe_user_groups
    throw new Error("describe_user_groups not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_user_groups failed");
  }
}

/** Describe users. */
export async function describeUsers(): Promise<DescribeUsersResult> {
  try {
    // TODO: implement describe_users
    throw new Error("describe_users not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_users failed");
  }
}

/** Disassociate global replication group. */
export async function disassociateGlobalReplicationGroup(globalReplicationGroupId: string, replicationGroupId: string, replicationGroupRegion: string, regionName?: string): Promise<DisassociateGlobalReplicationGroupResult> {
  try {
    // TODO: implement disassociate_global_replication_group
    throw new Error("disassociate_global_replication_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disassociate_global_replication_group failed");
  }
}

/** Export serverless cache snapshot. */
export async function exportServerlessCacheSnapshot(serverlessCacheSnapshotName: string, s3BucketName: string, regionName?: string): Promise<ExportServerlessCacheSnapshotResult> {
  try {
    // TODO: implement export_serverless_cache_snapshot
    throw new Error("export_serverless_cache_snapshot not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "export_serverless_cache_snapshot failed");
  }
}

/** Failover global replication group. */
export async function failoverGlobalReplicationGroup(globalReplicationGroupId: string, primaryRegion: string, primaryReplicationGroupId: string, regionName?: string): Promise<FailoverGlobalReplicationGroupResult> {
  try {
    // TODO: implement failover_global_replication_group
    throw new Error("failover_global_replication_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "failover_global_replication_group failed");
  }
}

/** Increase node groups in global replication group. */
export async function increaseNodeGroupsInGlobalReplicationGroup(globalReplicationGroupId: string, nodeGroupCount: number, applyImmediately: boolean): Promise<IncreaseNodeGroupsInGlobalReplicationGroupResult> {
  try {
    // TODO: implement increase_node_groups_in_global_replication_group
    throw new Error("increase_node_groups_in_global_replication_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "increase_node_groups_in_global_replication_group failed");
  }
}

/** Increase replica count. */
export async function increaseReplicaCount(replicationGroupId: string, applyImmediately: boolean): Promise<IncreaseReplicaCountResult> {
  try {
    // TODO: implement increase_replica_count
    throw new Error("increase_replica_count not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "increase_replica_count failed");
  }
}

/** List allowed node type modifications. */
export async function listAllowedNodeTypeModifications(): Promise<ListAllowedNodeTypeModificationsResult> {
  try {
    // TODO: implement list_allowed_node_type_modifications
    throw new Error("list_allowed_node_type_modifications not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_allowed_node_type_modifications failed");
  }
}

/** Modify cache parameter group. */
export async function modifyCacheParameterGroup(cacheParameterGroupName: string, parameterNameValues: Record<string, unknown>[], regionName?: string): Promise<ModifyCacheParameterGroupResult> {
  try {
    // TODO: implement modify_cache_parameter_group
    throw new Error("modify_cache_parameter_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_cache_parameter_group failed");
  }
}

/** Modify cache subnet group. */
export async function modifyCacheSubnetGroup(cacheSubnetGroupName: string): Promise<ModifyCacheSubnetGroupResult> {
  try {
    // TODO: implement modify_cache_subnet_group
    throw new Error("modify_cache_subnet_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_cache_subnet_group failed");
  }
}

/** Modify global replication group. */
export async function modifyGlobalReplicationGroup(globalReplicationGroupId: string, applyImmediately: boolean): Promise<ModifyGlobalReplicationGroupResult> {
  try {
    // TODO: implement modify_global_replication_group
    throw new Error("modify_global_replication_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_global_replication_group failed");
  }
}

/** Modify replication group shard configuration. */
export async function modifyReplicationGroupShardConfiguration(replicationGroupId: string, nodeGroupCount: number, applyImmediately: boolean): Promise<ModifyReplicationGroupShardConfigurationResult> {
  try {
    // TODO: implement modify_replication_group_shard_configuration
    throw new Error("modify_replication_group_shard_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_replication_group_shard_configuration failed");
  }
}

/** Modify serverless cache. */
export async function modifyServerlessCache(serverlessCacheName: string): Promise<ModifyServerlessCacheResult> {
  try {
    // TODO: implement modify_serverless_cache
    throw new Error("modify_serverless_cache not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_serverless_cache failed");
  }
}

/** Modify user. */
export async function modifyUser(userId: string): Promise<ModifyUserResult> {
  try {
    // TODO: implement modify_user
    throw new Error("modify_user not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_user failed");
  }
}

/** Modify user group. */
export async function modifyUserGroup(userGroupId: string): Promise<ModifyUserGroupResult> {
  try {
    // TODO: implement modify_user_group
    throw new Error("modify_user_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_user_group failed");
  }
}

/** Purchase reserved cache nodes offering. */
export async function purchaseReservedCacheNodesOffering(reservedCacheNodesOfferingId: string): Promise<PurchaseReservedCacheNodesOfferingResult> {
  try {
    // TODO: implement purchase_reserved_cache_nodes_offering
    throw new Error("purchase_reserved_cache_nodes_offering not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "purchase_reserved_cache_nodes_offering failed");
  }
}

/** Rebalance slots in global replication group. */
export async function rebalanceSlotsInGlobalReplicationGroup(globalReplicationGroupId: string, applyImmediately: boolean, regionName?: string): Promise<RebalanceSlotsInGlobalReplicationGroupResult> {
  try {
    // TODO: implement rebalance_slots_in_global_replication_group
    throw new Error("rebalance_slots_in_global_replication_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "rebalance_slots_in_global_replication_group failed");
  }
}

/** Remove tags from resource. */
export async function removeTagsFromResource(resourceName: string, tagKeys: string[], regionName?: string): Promise<RemoveTagsFromResourceResult> {
  try {
    // TODO: implement remove_tags_from_resource
    throw new Error("remove_tags_from_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "remove_tags_from_resource failed");
  }
}

/** Reset cache parameter group. */
export async function resetCacheParameterGroup(cacheParameterGroupName: string): Promise<ResetCacheParameterGroupResult> {
  try {
    // TODO: implement reset_cache_parameter_group
    throw new Error("reset_cache_parameter_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "reset_cache_parameter_group failed");
  }
}

/** Revoke cache security group ingress. */
export async function revokeCacheSecurityGroupIngress(cacheSecurityGroupName: string, ec2SecurityGroupName: string, ec2SecurityGroupOwnerId: string, regionName?: string): Promise<RevokeCacheSecurityGroupIngressResult> {
  try {
    // TODO: implement revoke_cache_security_group_ingress
    throw new Error("revoke_cache_security_group_ingress not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "revoke_cache_security_group_ingress failed");
  }
}

/** Run failover. */
export async function runFailover(replicationGroupId: string, nodeGroupId: string, regionName?: string): Promise<RunFailoverResult> {
  try {
    // TODO: implement run_failover
    throw new Error("run_failover not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "run_failover failed");
  }
}

/** Run migration. */
export async function runMigration(replicationGroupId: string, customerNodeEndpointList: Record<string, unknown>[], regionName?: string): Promise<RunMigrationResult> {
  try {
    // TODO: implement run_migration
    throw new Error("run_migration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "run_migration failed");
  }
}

/** Start migration. */
export async function startMigration(replicationGroupId: string, customerNodeEndpointList: Record<string, unknown>[], regionName?: string): Promise<StartMigrationResult> {
  try {
    // TODO: implement start_migration
    throw new Error("start_migration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_migration failed");
  }
}
