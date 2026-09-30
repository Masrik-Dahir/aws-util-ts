import { MemorydbClient } from "@aws-sdk/client-memorydb";
import { getClient } from "./client";
import { wrapAwsError } from "./exceptions";

/** Metadata for a MemoryDB cluster. */
export type ClusterResult = {
  name: string;
  status: string;
  nodeType: string;
  engine?: string;
  engineVersion?: string;
  numShards?: number;
  aclName?: string;
  subnetGroupName?: string;
  extra?: Record<string, unknown>;
};

/** Metadata for a MemoryDB snapshot. */
export type SnapshotResult = {
  name: string;
  status: string;
  clusterName?: string;
  source?: string;
  extra?: Record<string, unknown>;
};

/** Metadata for a MemoryDB user. */
export type UserResult = {
  name: string;
  status: string;
  accessString?: string;
  aclNames?: string[];
  extra?: Record<string, unknown>;
};

/** Metadata for a MemoryDB ACL. */
export type AclResult = {
  name: string;
  status: string;
  userNames?: string[];
  extra?: Record<string, unknown>;
};

/** Metadata for a MemoryDB subnet group. */
export type SubnetGroupResult = {
  name: string;
  description?: string;
  vpcId?: string;
  subnetIds?: string[];
  extra?: Record<string, unknown>;
};

/** Result of batch_update_cluster. */
export type BatchUpdateClusterResult = {
  processedClusters?: Record<string, unknown>[];
  unprocessedClusters?: Record<string, unknown>[];
};

/** Result of create_multi_region_cluster. */
export type CreateMultiRegionClusterResult = {
  multiRegionCluster?: Record<string, unknown>;
};

/** Result of create_parameter_group. */
export type CreateParameterGroupResult = {
  parameterGroup?: Record<string, unknown>;
};

/** Result of delete_multi_region_cluster. */
export type DeleteMultiRegionClusterResult = {
  multiRegionCluster?: Record<string, unknown>;
};

/** Result of delete_parameter_group. */
export type DeleteParameterGroupResult = {
  parameterGroup?: Record<string, unknown>;
};

/** Result of delete_subnet_group. */
export type DeleteSubnetGroupResult = {
  subnetGroup?: Record<string, unknown>;
};

/** Result of describe_engine_versions. */
export type DescribeEngineVersionsResult = {
  nextToken?: string;
  engineVersions?: Record<string, unknown>[];
};

/** Result of describe_events. */
export type DescribeEventsResult = {
  nextToken?: string;
  events?: Record<string, unknown>[];
};

/** Result of describe_multi_region_clusters. */
export type DescribeMultiRegionClustersResult = {
  nextToken?: string;
  multiRegionClusters?: Record<string, unknown>[];
};

/** Result of describe_multi_region_parameter_groups. */
export type DescribeMultiRegionParameterGroupsResult = {
  nextToken?: string;
  multiRegionParameterGroups?: Record<string, unknown>[];
};

/** Result of describe_multi_region_parameters. */
export type DescribeMultiRegionParametersResult = {
  nextToken?: string;
  multiRegionParameters?: Record<string, unknown>[];
};

/** Result of describe_parameter_groups. */
export type DescribeParameterGroupsResult = {
  nextToken?: string;
  parameterGroups?: Record<string, unknown>[];
};

/** Result of describe_parameters. */
export type DescribeParametersResult = {
  nextToken?: string;
  parameters?: Record<string, unknown>[];
};

/** Result of describe_reserved_nodes. */
export type DescribeReservedNodesResult = {
  nextToken?: string;
  reservedNodes?: Record<string, unknown>[];
};

/** Result of describe_reserved_nodes_offerings. */
export type DescribeReservedNodesOfferingsResult = {
  nextToken?: string;
  reservedNodesOfferings?: Record<string, unknown>[];
};

/** Result of describe_service_updates. */
export type DescribeServiceUpdatesResult = {
  nextToken?: string;
  serviceUpdates?: Record<string, unknown>[];
};

/** Result of failover_shard. */
export type FailoverShardResult = {
  cluster?: Record<string, unknown>;
};

/** Result of list_allowed_multi_region_cluster_updates. */
export type ListAllowedMultiRegionClusterUpdatesResult = {
  scaleUpNodeTypes?: string[];
  scaleDownNodeTypes?: string[];
};

/** Result of list_allowed_node_type_updates. */
export type ListAllowedNodeTypeUpdatesResult = {
  scaleUpNodeTypes?: string[];
  scaleDownNodeTypes?: string[];
};

/** Result of list_tags. */
export type ListTagsResult = {
  tagList?: Record<string, unknown>[];
};

/** Result of purchase_reserved_nodes_offering. */
export type PurchaseReservedNodesOfferingResult = {
  reservedNode?: Record<string, unknown>;
};

/** Result of reset_parameter_group. */
export type ResetParameterGroupResult = {
  parameterGroup?: Record<string, unknown>;
};

/** Result of tag_resource. */
export type TagResourceResult = {
  tagList?: Record<string, unknown>[];
};

/** Result of untag_resource. */
export type UntagResourceResult = {
  tagList?: Record<string, unknown>[];
};

/** Result of update_multi_region_cluster. */
export type UpdateMultiRegionClusterResult = {
  multiRegionCluster?: Record<string, unknown>;
};

/** Result of update_parameter_group. */
export type UpdateParameterGroupResult = {
  parameterGroup?: Record<string, unknown>;
};

/** Result of update_subnet_group. */
export type UpdateSubnetGroupResult = {
  subnetGroup?: Record<string, unknown>;
};

/** Create a new MemoryDB cluster. */
export async function createCluster(clusterName: string): Promise<ClusterResult> {
  try {
    // TODO: implement create_cluster
    throw new Error("create_cluster not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_cluster failed");
  }
}

/** Describe one or more MemoryDB clusters. */
export async function describeClusters(): Promise<ClusterResult[]> {
  try {
    // TODO: implement describe_clusters
    throw new Error("describe_clusters not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_clusters failed");
  }
}

/** Update an existing MemoryDB cluster. */
export async function updateCluster(clusterName: string): Promise<ClusterResult> {
  try {
    // TODO: implement update_cluster
    throw new Error("update_cluster not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_cluster failed");
  }
}

/** Delete a MemoryDB cluster. */
export async function deleteCluster(clusterName: string): Promise<void> {
  try {
    // TODO: implement delete_cluster
    throw new Error("delete_cluster not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_cluster failed");
  }
}

/** Create a MemoryDB snapshot. */
export async function createSnapshot(snapshotName: string): Promise<SnapshotResult> {
  try {
    // TODO: implement create_snapshot
    throw new Error("create_snapshot not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_snapshot failed");
  }
}

/** Describe one or more MemoryDB snapshots. */
export async function describeSnapshots(): Promise<SnapshotResult[]> {
  try {
    // TODO: implement describe_snapshots
    throw new Error("describe_snapshots not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_snapshots failed");
  }
}

/** Copy a MemoryDB snapshot. */
export async function copySnapshot(sourceSnapshotName: string, targetSnapshotName: string): Promise<SnapshotResult> {
  try {
    // TODO: implement copy_snapshot
    throw new Error("copy_snapshot not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "copy_snapshot failed");
  }
}

/** Delete a MemoryDB snapshot. */
export async function deleteSnapshot(snapshotName: string): Promise<void> {
  try {
    // TODO: implement delete_snapshot
    throw new Error("delete_snapshot not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_snapshot failed");
  }
}

/** Create a MemoryDB user. */
export async function createUser(userName: string): Promise<UserResult> {
  try {
    // TODO: implement create_user
    throw new Error("create_user not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_user failed");
  }
}

/** Describe one or more MemoryDB users. */
export async function describeUsers(): Promise<UserResult[]> {
  try {
    // TODO: implement describe_users
    throw new Error("describe_users not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_users failed");
  }
}

/** Update a MemoryDB user. */
export async function updateUser(userName: string): Promise<UserResult> {
  try {
    // TODO: implement update_user
    throw new Error("update_user not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_user failed");
  }
}

/** Delete a MemoryDB user. */
export async function deleteUser(userName: string): Promise<void> {
  try {
    // TODO: implement delete_user
    throw new Error("delete_user not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_user failed");
  }
}

/** Create a MemoryDB ACL. */
export async function createAcl(aclName: string): Promise<AclResult> {
  try {
    // TODO: implement create_acl
    throw new Error("create_acl not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_acl failed");
  }
}

/** Describe one or more MemoryDB ACLs. */
export async function describeAcls(): Promise<AclResult[]> {
  try {
    // TODO: implement describe_acls
    throw new Error("describe_acls not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_acls failed");
  }
}

/** Update a MemoryDB ACL. */
export async function updateAcl(aclName: string): Promise<AclResult> {
  try {
    // TODO: implement update_acl
    throw new Error("update_acl not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_acl failed");
  }
}

/** Delete a MemoryDB ACL. */
export async function deleteAcl(aclName: string): Promise<void> {
  try {
    // TODO: implement delete_acl
    throw new Error("delete_acl not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_acl failed");
  }
}

/** Create a MemoryDB subnet group. */
export async function createSubnetGroup(subnetGroupName: string): Promise<SubnetGroupResult> {
  try {
    // TODO: implement create_subnet_group
    throw new Error("create_subnet_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_subnet_group failed");
  }
}

/** Describe one or more MemoryDB subnet groups. */
export async function describeSubnetGroups(): Promise<SubnetGroupResult[]> {
  try {
    // TODO: implement describe_subnet_groups
    throw new Error("describe_subnet_groups not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_subnet_groups failed");
  }
}

/** Poll until a MemoryDB cluster reaches the target status. */
export async function waitForCluster(clusterName: string): Promise<ClusterResult> {
  try {
    // TODO: implement wait_for_cluster
    throw new Error("wait_for_cluster not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "wait_for_cluster failed");
  }
}

/** Batch update cluster. */
export async function batchUpdateCluster(clusterNames: string[]): Promise<BatchUpdateClusterResult> {
  try {
    // TODO: implement batch_update_cluster
    throw new Error("batch_update_cluster not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_update_cluster failed");
  }
}

/** Create multi region cluster. */
export async function createMultiRegionCluster(multiRegionClusterNameSuffix: string, nodeType: string): Promise<CreateMultiRegionClusterResult> {
  try {
    // TODO: implement create_multi_region_cluster
    throw new Error("create_multi_region_cluster not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_multi_region_cluster failed");
  }
}

/** Create parameter group. */
export async function createParameterGroup(parameterGroupName: string, family: string): Promise<CreateParameterGroupResult> {
  try {
    // TODO: implement create_parameter_group
    throw new Error("create_parameter_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_parameter_group failed");
  }
}

/** Delete multi region cluster. */
export async function deleteMultiRegionCluster(multiRegionClusterName: string, regionName?: string): Promise<DeleteMultiRegionClusterResult> {
  try {
    // TODO: implement delete_multi_region_cluster
    throw new Error("delete_multi_region_cluster not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_multi_region_cluster failed");
  }
}

/** Delete parameter group. */
export async function deleteParameterGroup(parameterGroupName: string, regionName?: string): Promise<DeleteParameterGroupResult> {
  try {
    // TODO: implement delete_parameter_group
    throw new Error("delete_parameter_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_parameter_group failed");
  }
}

/** Delete subnet group. */
export async function deleteSubnetGroup(subnetGroupName: string, regionName?: string): Promise<DeleteSubnetGroupResult> {
  try {
    // TODO: implement delete_subnet_group
    throw new Error("delete_subnet_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_subnet_group failed");
  }
}

/** Describe engine versions. */
export async function describeEngineVersions(): Promise<DescribeEngineVersionsResult> {
  try {
    // TODO: implement describe_engine_versions
    throw new Error("describe_engine_versions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_engine_versions failed");
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

/** Describe multi region clusters. */
export async function describeMultiRegionClusters(): Promise<DescribeMultiRegionClustersResult> {
  try {
    // TODO: implement describe_multi_region_clusters
    throw new Error("describe_multi_region_clusters not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_multi_region_clusters failed");
  }
}

/** Describe multi region parameter groups. */
export async function describeMultiRegionParameterGroups(): Promise<DescribeMultiRegionParameterGroupsResult> {
  try {
    // TODO: implement describe_multi_region_parameter_groups
    throw new Error("describe_multi_region_parameter_groups not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_multi_region_parameter_groups failed");
  }
}

/** Describe multi region parameters. */
export async function describeMultiRegionParameters(multiRegionParameterGroupName: string): Promise<DescribeMultiRegionParametersResult> {
  try {
    // TODO: implement describe_multi_region_parameters
    throw new Error("describe_multi_region_parameters not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_multi_region_parameters failed");
  }
}

/** Describe parameter groups. */
export async function describeParameterGroups(): Promise<DescribeParameterGroupsResult> {
  try {
    // TODO: implement describe_parameter_groups
    throw new Error("describe_parameter_groups not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_parameter_groups failed");
  }
}

/** Describe parameters. */
export async function describeParameters(parameterGroupName: string): Promise<DescribeParametersResult> {
  try {
    // TODO: implement describe_parameters
    throw new Error("describe_parameters not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_parameters failed");
  }
}

/** Describe reserved nodes. */
export async function describeReservedNodes(): Promise<DescribeReservedNodesResult> {
  try {
    // TODO: implement describe_reserved_nodes
    throw new Error("describe_reserved_nodes not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_reserved_nodes failed");
  }
}

/** Describe reserved nodes offerings. */
export async function describeReservedNodesOfferings(): Promise<DescribeReservedNodesOfferingsResult> {
  try {
    // TODO: implement describe_reserved_nodes_offerings
    throw new Error("describe_reserved_nodes_offerings not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_reserved_nodes_offerings failed");
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

/** Failover shard. */
export async function failoverShard(clusterName: string, shardName: string, regionName?: string): Promise<FailoverShardResult> {
  try {
    // TODO: implement failover_shard
    throw new Error("failover_shard not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "failover_shard failed");
  }
}

/** List allowed multi region cluster updates. */
export async function listAllowedMultiRegionClusterUpdates(multiRegionClusterName: string, regionName?: string): Promise<ListAllowedMultiRegionClusterUpdatesResult> {
  try {
    // TODO: implement list_allowed_multi_region_cluster_updates
    throw new Error("list_allowed_multi_region_cluster_updates not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_allowed_multi_region_cluster_updates failed");
  }
}

/** List allowed node type updates. */
export async function listAllowedNodeTypeUpdates(clusterName: string, regionName?: string): Promise<ListAllowedNodeTypeUpdatesResult> {
  try {
    // TODO: implement list_allowed_node_type_updates
    throw new Error("list_allowed_node_type_updates not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_allowed_node_type_updates failed");
  }
}

/** List tags. */
export async function listTags(resourceArn: string, regionName?: string): Promise<ListTagsResult> {
  try {
    // TODO: implement list_tags
    throw new Error("list_tags not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_tags failed");
  }
}

/** Purchase reserved nodes offering. */
export async function purchaseReservedNodesOffering(reservedNodesOfferingId: string): Promise<PurchaseReservedNodesOfferingResult> {
  try {
    // TODO: implement purchase_reserved_nodes_offering
    throw new Error("purchase_reserved_nodes_offering not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "purchase_reserved_nodes_offering failed");
  }
}

/** Reset parameter group. */
export async function resetParameterGroup(parameterGroupName: string): Promise<ResetParameterGroupResult> {
  try {
    // TODO: implement reset_parameter_group
    throw new Error("reset_parameter_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "reset_parameter_group failed");
  }
}

/** Tag resource. */
export async function tagResource(resourceArn: string, tags: Record<string, unknown>[], regionName?: string): Promise<TagResourceResult> {
  try {
    // TODO: implement tag_resource
    throw new Error("tag_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "tag_resource failed");
  }
}

/** Untag resource. */
export async function untagResource(resourceArn: string, tagKeys: string[], regionName?: string): Promise<UntagResourceResult> {
  try {
    // TODO: implement untag_resource
    throw new Error("untag_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "untag_resource failed");
  }
}

/** Update multi region cluster. */
export async function updateMultiRegionCluster(multiRegionClusterName: string): Promise<UpdateMultiRegionClusterResult> {
  try {
    // TODO: implement update_multi_region_cluster
    throw new Error("update_multi_region_cluster not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_multi_region_cluster failed");
  }
}

/** Update parameter group. */
export async function updateParameterGroup(parameterGroupName: string, parameterNameValues: Record<string, unknown>[], regionName?: string): Promise<UpdateParameterGroupResult> {
  try {
    // TODO: implement update_parameter_group
    throw new Error("update_parameter_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_parameter_group failed");
  }
}

/** Update subnet group. */
export async function updateSubnetGroup(subnetGroupName: string): Promise<UpdateSubnetGroupResult> {
  try {
    // TODO: implement update_subnet_group
    throw new Error("update_subnet_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_subnet_group failed");
  }
}
