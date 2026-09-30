import { NeptuneClient } from "@aws-sdk/client-neptune";
import { getClient } from "./client";
import { wrapAwsError } from "./exceptions";

/** Metadata for a Neptune DB cluster. */
export type NeptuneCluster = {
  dbClusterIdentifier: string;
  status: string;
  engine: string;
  engineVersion: string;
  endpoint?: string;
  readerEndpoint?: string;
  port?: number;
  multiAz?: boolean;
  storageEncrypted?: boolean;
  extra?: Record<string, unknown>;
};

/** Metadata for a Neptune DB instance. */
export type NeptuneInstance = {
  dbInstanceIdentifier: string;
  dbInstanceClass: string;
  engine: string;
  engineVersion: string;
  status: string;
  endpointAddress?: string;
  endpointPort?: number;
  availabilityZone?: string;
  dbClusterIdentifier?: string;
  extra?: Record<string, unknown>;
};

/** Metadata for a Neptune DB cluster snapshot. */
export type NeptuneClusterSnapshot = {
  dbClusterSnapshotIdentifier: string;
  dbClusterIdentifier: string;
  status: string;
  engine: string;
  engineVersion: string;
  snapshotType?: string;
  allocatedStorage?: number;
  extra?: Record<string, unknown>;
};

/** Result of add_source_identifier_to_subscription. */
export type AddSourceIdentifierToSubscriptionResult = {
  eventSubscription?: Record<string, unknown>;
};

/** Result of apply_pending_maintenance_action. */
export type ApplyPendingMaintenanceActionResult = {
  resourcePendingMaintenanceActions?: Record<string, unknown>;
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

/** Result of create_db_cluster_endpoint. */
export type CreateDbClusterEndpointResult = {
  dbClusterEndpointIdentifier?: string;
  dbClusterIdentifier?: string;
  dbClusterEndpointResourceIdentifier?: string;
  endpoint?: string;
  status?: string;
  endpointType?: string;
  customEndpointType?: string;
  staticMembers?: string[];
  excludedMembers?: string[];
  dbClusterEndpointArn?: string;
};

/** Result of create_db_cluster_parameter_group. */
export type CreateDbClusterParameterGroupResult = {
  dbClusterParameterGroup?: Record<string, unknown>;
};

/** Result of create_db_parameter_group. */
export type CreateDbParameterGroupResult = {
  dbParameterGroup?: Record<string, unknown>;
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

/** Result of delete_db_cluster_endpoint. */
export type DeleteDbClusterEndpointResult = {
  dbClusterEndpointIdentifier?: string;
  dbClusterIdentifier?: string;
  dbClusterEndpointResourceIdentifier?: string;
  endpoint?: string;
  status?: string;
  endpointType?: string;
  customEndpointType?: string;
  staticMembers?: string[];
  excludedMembers?: string[];
  dbClusterEndpointArn?: string;
};

/** Result of delete_db_cluster_snapshot. */
export type DeleteDbClusterSnapshotResult = {
  dbClusterSnapshot?: Record<string, unknown>;
};

/** Result of delete_event_subscription. */
export type DeleteEventSubscriptionResult = {
  eventSubscription?: Record<string, unknown>;
};

/** Result of delete_global_cluster. */
export type DeleteGlobalClusterResult = {
  globalCluster?: Record<string, unknown>;
};

/** Result of describe_db_cluster_endpoints. */
export type DescribeDbClusterEndpointsResult = {
  marker?: string;
  dbClusterEndpoints?: Record<string, unknown>[];
};

/** Result of describe_db_cluster_parameter_groups. */
export type DescribeDbClusterParameterGroupsResult = {
  marker?: string;
  dbClusterParameterGroups?: Record<string, unknown>[];
};

/** Result of describe_db_cluster_parameters. */
export type DescribeDbClusterParametersResult = {
  parameters?: Record<string, unknown>[];
  marker?: string;
};

/** Result of describe_db_cluster_snapshot_attributes. */
export type DescribeDbClusterSnapshotAttributesResult = {
  dbClusterSnapshotAttributesResult?: Record<string, unknown>;
};

/** Result of describe_db_engine_versions. */
export type DescribeDbEngineVersionsResult = {
  marker?: string;
  dbEngineVersions?: Record<string, unknown>[];
};

/** Result of describe_db_parameter_groups. */
export type DescribeDbParameterGroupsResult = {
  marker?: string;
  dbParameterGroups?: Record<string, unknown>[];
};

/** Result of describe_db_parameters. */
export type DescribeDbParametersResult = {
  parameters?: Record<string, unknown>[];
  marker?: string;
};

/** Result of describe_db_subnet_groups. */
export type DescribeDbSubnetGroupsResult = {
  marker?: string;
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
  marker?: string;
  eventSubscriptionsList?: Record<string, unknown>[];
};

/** Result of describe_events. */
export type DescribeEventsResult = {
  marker?: string;
  events?: Record<string, unknown>[];
};

/** Result of describe_global_clusters. */
export type DescribeGlobalClustersResult = {
  marker?: string;
  globalClusters?: Record<string, unknown>[];
};

/** Result of describe_orderable_db_instance_options. */
export type DescribeOrderableDbInstanceOptionsResult = {
  orderableDbInstanceOptions?: Record<string, unknown>[];
  marker?: string;
};

/** Result of describe_pending_maintenance_actions. */
export type DescribePendingMaintenanceActionsResult = {
  pendingMaintenanceActions?: Record<string, unknown>[];
  marker?: string;
};

/** Result of describe_valid_db_instance_modifications. */
export type DescribeValidDbInstanceModificationsResult = {
  validDbInstanceModificationsMessage?: Record<string, unknown>;
};

/** Result of failover_global_cluster. */
export type FailoverGlobalClusterResult = {
  globalCluster?: Record<string, unknown>;
};

/** Result of list_tags_for_resource. */
export type ListTagsForResourceResult = {
  tagList?: Record<string, unknown>[];
};

/** Result of modify_db_cluster_endpoint. */
export type ModifyDbClusterEndpointResult = {
  dbClusterEndpointIdentifier?: string;
  dbClusterIdentifier?: string;
  dbClusterEndpointResourceIdentifier?: string;
  endpoint?: string;
  status?: string;
  endpointType?: string;
  customEndpointType?: string;
  staticMembers?: string[];
  excludedMembers?: string[];
  dbClusterEndpointArn?: string;
};

/** Result of modify_db_cluster_parameter_group. */
export type ModifyDbClusterParameterGroupResult = {
  dbClusterParameterGroupName?: string;
};

/** Result of modify_db_cluster_snapshot_attribute. */
export type ModifyDbClusterSnapshotAttributeResult = {
  dbClusterSnapshotAttributesResult?: Record<string, unknown>;
};

/** Result of modify_db_parameter_group. */
export type ModifyDbParameterGroupResult = {
  dbParameterGroupName?: string;
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

/** Result of promote_read_replica_db_cluster. */
export type PromoteReadReplicaDbClusterResult = {
  dbCluster?: Record<string, unknown>;
};

/** Result of reboot_db_instance. */
export type RebootDbInstanceResult = {
  dbInstance?: Record<string, unknown>;
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
  dbClusterParameterGroupName?: string;
};

/** Result of reset_db_parameter_group. */
export type ResetDbParameterGroupResult = {
  dbParameterGroupName?: string;
};

/** Result of restore_db_cluster_from_snapshot. */
export type RestoreDbClusterFromSnapshotResult = {
  dbCluster?: Record<string, unknown>;
};

/** Result of restore_db_cluster_to_point_in_time. */
export type RestoreDbClusterToPointInTimeResult = {
  dbCluster?: Record<string, unknown>;
};

/** Result of start_db_cluster. */
export type StartDbClusterResult = {
  dbCluster?: Record<string, unknown>;
};

/** Result of stop_db_cluster. */
export type StopDbClusterResult = {
  dbCluster?: Record<string, unknown>;
};

/** Result of switchover_global_cluster. */
export type SwitchoverGlobalClusterResult = {
  globalCluster?: Record<string, unknown>;
};

/** Create a Neptune DB cluster. */
export async function createDbCluster(dbClusterIdentifier: string, engine: string): Promise<NeptuneCluster> {
  try {
    // TODO: implement create_db_cluster
    throw new Error("create_db_cluster not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_db_cluster failed");
  }
}

/** Describe Neptune DB clusters. */
export async function describeDbClusters(dbClusterIdentifier?: string): Promise<NeptuneCluster[]> {
  try {
    // TODO: implement describe_db_clusters
    throw new Error("describe_db_clusters not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_db_clusters failed");
  }
}

/** Modify a Neptune DB cluster. */
export async function modifyDbCluster(dbClusterIdentifier: string): Promise<NeptuneCluster> {
  try {
    // TODO: implement modify_db_cluster
    throw new Error("modify_db_cluster not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_db_cluster failed");
  }
}

/** Delete a Neptune DB cluster. */
export async function deleteDbCluster(dbClusterIdentifier: string): Promise<void> {
  try {
    // TODO: implement delete_db_cluster
    throw new Error("delete_db_cluster not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_db_cluster failed");
  }
}

/** Create a Neptune DB instance. */
export async function createDbInstance(dbInstanceIdentifier: string, dbInstanceClass: string, engine: string): Promise<NeptuneInstance> {
  try {
    // TODO: implement create_db_instance
    throw new Error("create_db_instance not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_db_instance failed");
  }
}

/** Describe Neptune DB instances. */
export async function describeDbInstances(dbInstanceIdentifier?: string): Promise<NeptuneInstance[]> {
  try {
    // TODO: implement describe_db_instances
    throw new Error("describe_db_instances not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_db_instances failed");
  }
}

/** Modify a Neptune DB instance. */
export async function modifyDbInstance(dbInstanceIdentifier: string): Promise<NeptuneInstance> {
  try {
    // TODO: implement modify_db_instance
    throw new Error("modify_db_instance not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_db_instance failed");
  }
}

/** Delete a Neptune DB instance. */
export async function deleteDbInstance(dbInstanceIdentifier: string): Promise<void> {
  try {
    // TODO: implement delete_db_instance
    throw new Error("delete_db_instance not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_db_instance failed");
  }
}

/** Create a Neptune DB cluster snapshot. */
export async function createDbClusterSnapshot(dbClusterSnapshotIdentifier: string, dbClusterIdentifier: string): Promise<NeptuneClusterSnapshot> {
  try {
    // TODO: implement create_db_cluster_snapshot
    throw new Error("create_db_cluster_snapshot not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_db_cluster_snapshot failed");
  }
}

/** Describe Neptune DB cluster snapshots. */
export async function describeDbClusterSnapshots(dbClusterIdentifier?: string): Promise<NeptuneClusterSnapshot[]> {
  try {
    // TODO: implement describe_db_cluster_snapshots
    throw new Error("describe_db_cluster_snapshots not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_db_cluster_snapshots failed");
  }
}

/** Initiate a failover for a Neptune DB cluster. */
export async function failoverDbCluster(dbClusterIdentifier: string): Promise<NeptuneCluster> {
  try {
    // TODO: implement failover_db_cluster
    throw new Error("failover_db_cluster not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "failover_db_cluster failed");
  }
}

/** Poll until a Neptune DB cluster reaches the desired status. */
export async function waitForDbCluster(dbClusterIdentifier: string, targetStatus: string): Promise<NeptuneCluster> {
  try {
    // TODO: implement wait_for_db_cluster
    throw new Error("wait_for_db_cluster not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "wait_for_db_cluster failed");
  }
}

/** Add role to db cluster. */
export async function addRoleToDbCluster(dbClusterIdentifier: string, roleArn: string): Promise<void> {
  try {
    // TODO: implement add_role_to_db_cluster
    throw new Error("add_role_to_db_cluster not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "add_role_to_db_cluster failed");
  }
}

/** Add source identifier to subscription. */
export async function addSourceIdentifierToSubscription(subscriptionName: string, sourceIdentifier: string, regionName?: string): Promise<AddSourceIdentifierToSubscriptionResult> {
  try {
    // TODO: implement add_source_identifier_to_subscription
    throw new Error("add_source_identifier_to_subscription not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "add_source_identifier_to_subscription failed");
  }
}

/** Add tags to resource. */
export async function addTagsToResource(resourceName: string, tags: Record<string, unknown>[], regionName?: string): Promise<void> {
  try {
    // TODO: implement add_tags_to_resource
    throw new Error("add_tags_to_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "add_tags_to_resource failed");
  }
}

/** Apply pending maintenance action. */
export async function applyPendingMaintenanceAction(resourceIdentifier: string, applyAction: string, optInType: string, regionName?: string): Promise<ApplyPendingMaintenanceActionResult> {
  try {
    // TODO: implement apply_pending_maintenance_action
    throw new Error("apply_pending_maintenance_action not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "apply_pending_maintenance_action failed");
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

/** Create db parameter group. */
export async function createDbParameterGroup(dbParameterGroupName: string, dbParameterGroupFamily: string, description: string): Promise<CreateDbParameterGroupResult> {
  try {
    // TODO: implement create_db_parameter_group
    throw new Error("create_db_parameter_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_db_parameter_group failed");
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

/** Delete db cluster endpoint. */
export async function deleteDbClusterEndpoint(dbClusterEndpointIdentifier: string, regionName?: string): Promise<DeleteDbClusterEndpointResult> {
  try {
    // TODO: implement delete_db_cluster_endpoint
    throw new Error("delete_db_cluster_endpoint not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_db_cluster_endpoint failed");
  }
}

/** Delete db cluster parameter group. */
export async function deleteDbClusterParameterGroup(dbClusterParameterGroupName: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_db_cluster_parameter_group
    throw new Error("delete_db_cluster_parameter_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_db_cluster_parameter_group failed");
  }
}

/** Delete db cluster snapshot. */
export async function deleteDbClusterSnapshot(dbClusterSnapshotIdentifier: string, regionName?: string): Promise<DeleteDbClusterSnapshotResult> {
  try {
    // TODO: implement delete_db_cluster_snapshot
    throw new Error("delete_db_cluster_snapshot not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_db_cluster_snapshot failed");
  }
}

/** Delete db parameter group. */
export async function deleteDbParameterGroup(dbParameterGroupName: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_db_parameter_group
    throw new Error("delete_db_parameter_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_db_parameter_group failed");
  }
}

/** Delete db subnet group. */
export async function deleteDbSubnetGroup(dbSubnetGroupName: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_db_subnet_group
    throw new Error("delete_db_subnet_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_db_subnet_group failed");
  }
}

/** Delete event subscription. */
export async function deleteEventSubscription(subscriptionName: string, regionName?: string): Promise<DeleteEventSubscriptionResult> {
  try {
    // TODO: implement delete_event_subscription
    throw new Error("delete_event_subscription not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_event_subscription failed");
  }
}

/** Delete global cluster. */
export async function deleteGlobalCluster(globalClusterIdentifier: string, regionName?: string): Promise<DeleteGlobalClusterResult> {
  try {
    // TODO: implement delete_global_cluster
    throw new Error("delete_global_cluster not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_global_cluster failed");
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
export async function describeDbClusterSnapshotAttributes(dbClusterSnapshotIdentifier: string, regionName?: string): Promise<DescribeDbClusterSnapshotAttributesResult> {
  try {
    // TODO: implement describe_db_cluster_snapshot_attributes
    throw new Error("describe_db_cluster_snapshot_attributes not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_db_cluster_snapshot_attributes failed");
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

/** Describe global clusters. */
export async function describeGlobalClusters(): Promise<DescribeGlobalClustersResult> {
  try {
    // TODO: implement describe_global_clusters
    throw new Error("describe_global_clusters not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_global_clusters failed");
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

/** Describe valid db instance modifications. */
export async function describeValidDbInstanceModifications(dbInstanceIdentifier: string, regionName?: string): Promise<DescribeValidDbInstanceModificationsResult> {
  try {
    // TODO: implement describe_valid_db_instance_modifications
    throw new Error("describe_valid_db_instance_modifications not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_valid_db_instance_modifications failed");
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
export async function modifyDbClusterParameterGroup(dbClusterParameterGroupName: string, parameters: Record<string, unknown>[], regionName?: string): Promise<ModifyDbClusterParameterGroupResult> {
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

/** Modify db parameter group. */
export async function modifyDbParameterGroup(dbParameterGroupName: string, parameters: Record<string, unknown>[], regionName?: string): Promise<ModifyDbParameterGroupResult> {
  try {
    // TODO: implement modify_db_parameter_group
    throw new Error("modify_db_parameter_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_db_parameter_group failed");
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

/** Promote read replica db cluster. */
export async function promoteReadReplicaDbCluster(dbClusterIdentifier: string, regionName?: string): Promise<PromoteReadReplicaDbClusterResult> {
  try {
    // TODO: implement promote_read_replica_db_cluster
    throw new Error("promote_read_replica_db_cluster not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "promote_read_replica_db_cluster failed");
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

/** Remove from global cluster. */
export async function removeFromGlobalCluster(globalClusterIdentifier: string, dbClusterIdentifier: string, regionName?: string): Promise<RemoveFromGlobalClusterResult> {
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

/** Remove source identifier from subscription. */
export async function removeSourceIdentifierFromSubscription(subscriptionName: string, sourceIdentifier: string, regionName?: string): Promise<RemoveSourceIdentifierFromSubscriptionResult> {
  try {
    // TODO: implement remove_source_identifier_from_subscription
    throw new Error("remove_source_identifier_from_subscription not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "remove_source_identifier_from_subscription failed");
  }
}

/** Remove tags from resource. */
export async function removeTagsFromResource(resourceName: string, tagKeys: string[], regionName?: string): Promise<void> {
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
export async function restoreDbClusterToPointInTime(dbClusterIdentifier: string, sourceDbClusterIdentifier: string): Promise<RestoreDbClusterToPointInTimeResult> {
  try {
    // TODO: implement restore_db_cluster_to_point_in_time
    throw new Error("restore_db_cluster_to_point_in_time not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "restore_db_cluster_to_point_in_time failed");
  }
}

/** Start db cluster. */
export async function startDbCluster(dbClusterIdentifier: string, regionName?: string): Promise<StartDbClusterResult> {
  try {
    // TODO: implement start_db_cluster
    throw new Error("start_db_cluster not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_db_cluster failed");
  }
}

/** Stop db cluster. */
export async function stopDbCluster(dbClusterIdentifier: string, regionName?: string): Promise<StopDbClusterResult> {
  try {
    // TODO: implement stop_db_cluster
    throw new Error("stop_db_cluster not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "stop_db_cluster failed");
  }
}

/** Switchover global cluster. */
export async function switchoverGlobalCluster(globalClusterIdentifier: string, targetDbClusterIdentifier: string, regionName?: string): Promise<SwitchoverGlobalClusterResult> {
  try {
    // TODO: implement switchover_global_cluster
    throw new Error("switchover_global_cluster not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "switchover_global_cluster failed");
  }
}
