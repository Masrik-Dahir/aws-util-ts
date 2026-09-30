import { RedshiftServerlessClient } from "@aws-sdk/client-redshift-serverless";
import { getClient } from "./client";
import { wrapAwsError } from "./exceptions";

/** Metadata for a Redshift Serverless namespace. */
export type NamespaceResult = {
  namespaceName: string;
  namespaceId?: string;
  namespaceArn?: string;
  status?: string;
  adminUsername?: string;
  dbName?: string;
  creationDate?: string;
  iamRoles?: string[];
  extra?: Record<string, unknown>;
};

/** Metadata for a Redshift Serverless workgroup. */
export type WorkgroupResult = {
  workgroupName: string;
  workgroupId?: string;
  workgroupArn?: string;
  status?: string;
  namespaceName?: string;
  baseCapacity?: number;
  creationDate?: string;
  endpoint?: Record<string, unknown>;
  extra?: Record<string, unknown>;
};

/** Result of convert_recovery_point_to_snapshot. */
export type ConvertRecoveryPointToSnapshotResult = {
  snapshot?: Record<string, unknown>;
};

/** Result of create_custom_domain_association. */
export type CreateCustomDomainAssociationResult = {
  customDomainCertificateArn?: string;
  customDomainCertificateExpiryTime?: string;
  customDomainName?: string;
  workgroupName?: string;
};

/** Result of create_endpoint_access. */
export type CreateEndpointAccessResult = {
  endpoint?: Record<string, unknown>;
};

/** Result of create_reservation. */
export type CreateReservationResult = {
  reservation?: Record<string, unknown>;
};

/** Result of create_scheduled_action. */
export type CreateScheduledActionResult = {
  scheduledAction?: Record<string, unknown>;
};

/** Result of create_snapshot. */
export type CreateSnapshotResult = {
  snapshot?: Record<string, unknown>;
};

/** Result of create_snapshot_copy_configuration. */
export type CreateSnapshotCopyConfigurationResult = {
  snapshotCopyConfiguration?: Record<string, unknown>;
};

/** Result of create_usage_limit. */
export type CreateUsageLimitResult = {
  usageLimit?: Record<string, unknown>;
};

/** Result of delete_endpoint_access. */
export type DeleteEndpointAccessResult = {
  endpoint?: Record<string, unknown>;
};

/** Result of delete_scheduled_action. */
export type DeleteScheduledActionResult = {
  scheduledAction?: Record<string, unknown>;
};

/** Result of delete_snapshot. */
export type DeleteSnapshotResult = {
  snapshot?: Record<string, unknown>;
};

/** Result of delete_snapshot_copy_configuration. */
export type DeleteSnapshotCopyConfigurationResult = {
  snapshotCopyConfiguration?: Record<string, unknown>;
};

/** Result of delete_usage_limit. */
export type DeleteUsageLimitResult = {
  usageLimit?: Record<string, unknown>;
};

/** Result of get_credentials. */
export type GetCredentialsResult = {
  dbPassword?: string;
  dbUser?: string;
  expiration?: string;
  nextRefreshTime?: string;
};

/** Result of get_custom_domain_association. */
export type GetCustomDomainAssociationResult = {
  customDomainCertificateArn?: string;
  customDomainCertificateExpiryTime?: string;
  customDomainName?: string;
  workgroupName?: string;
};

/** Result of get_endpoint_access. */
export type GetEndpointAccessResult = {
  endpoint?: Record<string, unknown>;
};

/** Result of get_recovery_point. */
export type GetRecoveryPointResult = {
  recoveryPoint?: Record<string, unknown>;
};

/** Result of get_reservation. */
export type GetReservationResult = {
  reservation?: Record<string, unknown>;
};

/** Result of get_reservation_offering. */
export type GetReservationOfferingResult = {
  reservationOffering?: Record<string, unknown>;
};

/** Result of get_resource_policy. */
export type GetResourcePolicyResult = {
  resourcePolicy?: Record<string, unknown>;
};

/** Result of get_scheduled_action. */
export type GetScheduledActionResult = {
  scheduledAction?: Record<string, unknown>;
};

/** Result of get_snapshot. */
export type GetSnapshotResult = {
  snapshot?: Record<string, unknown>;
};

/** Result of get_table_restore_status. */
export type GetTableRestoreStatusResult = {
  tableRestoreStatus?: Record<string, unknown>;
};

/** Result of get_track. */
export type GetTrackResult = {
  track?: Record<string, unknown>;
};

/** Result of get_usage_limit. */
export type GetUsageLimitResult = {
  usageLimit?: Record<string, unknown>;
};

/** Result of list_custom_domain_associations. */
export type ListCustomDomainAssociationsResult = {
  associations?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_endpoint_access. */
export type ListEndpointAccessResult = {
  endpoints?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_managed_workgroups. */
export type ListManagedWorkgroupsResult = {
  managedWorkgroups?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_recovery_points. */
export type ListRecoveryPointsResult = {
  nextToken?: string;
  recoveryPoints?: Record<string, unknown>[];
};

/** Result of list_reservation_offerings. */
export type ListReservationOfferingsResult = {
  nextToken?: string;
  reservationOfferingsList?: Record<string, unknown>[];
};

/** Result of list_reservations. */
export type ListReservationsResult = {
  nextToken?: string;
  reservationsList?: Record<string, unknown>[];
};

/** Result of list_scheduled_actions. */
export type ListScheduledActionsResult = {
  nextToken?: string;
  scheduledActions?: Record<string, unknown>[];
};

/** Result of list_snapshot_copy_configurations. */
export type ListSnapshotCopyConfigurationsResult = {
  nextToken?: string;
  snapshotCopyConfigurations?: Record<string, unknown>[];
};

/** Result of list_snapshots. */
export type ListSnapshotsResult = {
  nextToken?: string;
  snapshots?: Record<string, unknown>[];
};

/** Result of list_table_restore_status. */
export type ListTableRestoreStatusResult = {
  nextToken?: string;
  tableRestoreStatuses?: Record<string, unknown>[];
};

/** Result of list_tags_for_resource. */
export type ListTagsForResourceResult = {
  tags?: Record<string, unknown>[];
};

/** Result of list_tracks. */
export type ListTracksResult = {
  nextToken?: string;
  tracks?: Record<string, unknown>[];
};

/** Result of list_usage_limits. */
export type ListUsageLimitsResult = {
  nextToken?: string;
  usageLimits?: Record<string, unknown>[];
};

/** Result of put_resource_policy. */
export type PutResourcePolicyResult = {
  resourcePolicy?: Record<string, unknown>;
};

/** Result of restore_from_recovery_point. */
export type RestoreFromRecoveryPointResult = {
  namespace?: Record<string, unknown>;
  recoveryPointId?: string;
};

/** Result of restore_from_snapshot. */
export type RestoreFromSnapshotResult = {
  namespace?: Record<string, unknown>;
  ownerAccount?: string;
  snapshotName?: string;
};

/** Result of restore_table_from_recovery_point. */
export type RestoreTableFromRecoveryPointResult = {
  tableRestoreStatus?: Record<string, unknown>;
};

/** Result of restore_table_from_snapshot. */
export type RestoreTableFromSnapshotResult = {
  tableRestoreStatus?: Record<string, unknown>;
};

/** Result of update_custom_domain_association. */
export type UpdateCustomDomainAssociationResult = {
  customDomainCertificateArn?: string;
  customDomainCertificateExpiryTime?: string;
  customDomainName?: string;
  workgroupName?: string;
};

/** Result of update_endpoint_access. */
export type UpdateEndpointAccessResult = {
  endpoint?: Record<string, unknown>;
};

/** Result of update_scheduled_action. */
export type UpdateScheduledActionResult = {
  scheduledAction?: Record<string, unknown>;
};

/** Result of update_snapshot. */
export type UpdateSnapshotResult = {
  snapshot?: Record<string, unknown>;
};

/** Result of update_snapshot_copy_configuration. */
export type UpdateSnapshotCopyConfigurationResult = {
  snapshotCopyConfiguration?: Record<string, unknown>;
};

/** Result of update_usage_limit. */
export type UpdateUsageLimitResult = {
  usageLimit?: Record<string, unknown>;
};

/** Create a Redshift Serverless namespace. */
export async function createNamespace(namespaceName: string): Promise<NamespaceResult> {
  try {
    // TODO: implement create_namespace
    throw new Error("create_namespace not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_namespace failed");
  }
}

/** Get a Redshift Serverless namespace. */
export async function getNamespace(namespaceName: string): Promise<NamespaceResult> {
  try {
    // TODO: implement get_namespace
    throw new Error("get_namespace not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_namespace failed");
  }
}

/** List all Redshift Serverless namespaces. */
export async function listNamespaces(): Promise<NamespaceResult[]> {
  try {
    // TODO: implement list_namespaces
    throw new Error("list_namespaces not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_namespaces failed");
  }
}

/** Delete a Redshift Serverless namespace. */
export async function deleteNamespace(namespaceName: string): Promise<NamespaceResult> {
  try {
    // TODO: implement delete_namespace
    throw new Error("delete_namespace not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_namespace failed");
  }
}

/** Update a Redshift Serverless namespace. */
export async function updateNamespace(namespaceName: string): Promise<NamespaceResult> {
  try {
    // TODO: implement update_namespace
    throw new Error("update_namespace not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_namespace failed");
  }
}

/** Create a Redshift Serverless workgroup. */
export async function createWorkgroup(workgroupName: string): Promise<WorkgroupResult> {
  try {
    // TODO: implement create_workgroup
    throw new Error("create_workgroup not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_workgroup failed");
  }
}

/** Get a Redshift Serverless workgroup. */
export async function getWorkgroup(workgroupName: string): Promise<WorkgroupResult> {
  try {
    // TODO: implement get_workgroup
    throw new Error("get_workgroup not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_workgroup failed");
  }
}

/** List all Redshift Serverless workgroups. */
export async function listWorkgroups(): Promise<WorkgroupResult[]> {
  try {
    // TODO: implement list_workgroups
    throw new Error("list_workgroups not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_workgroups failed");
  }
}

/** Delete a Redshift Serverless workgroup. */
export async function deleteWorkgroup(workgroupName: string): Promise<WorkgroupResult> {
  try {
    // TODO: implement delete_workgroup
    throw new Error("delete_workgroup not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_workgroup failed");
  }
}

/** Update a Redshift Serverless workgroup. */
export async function updateWorkgroup(workgroupName: string): Promise<WorkgroupResult> {
  try {
    // TODO: implement update_workgroup
    throw new Error("update_workgroup not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_workgroup failed");
  }
}

/** Convert recovery point to snapshot. */
export async function convertRecoveryPointToSnapshot(recoveryPointId: string, snapshotName: string): Promise<ConvertRecoveryPointToSnapshotResult> {
  try {
    // TODO: implement convert_recovery_point_to_snapshot
    throw new Error("convert_recovery_point_to_snapshot not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "convert_recovery_point_to_snapshot failed");
  }
}

/** Create custom domain association. */
export async function createCustomDomainAssociation(customDomainCertificateArn: string, customDomainName: string, workgroupName: string, regionName?: string): Promise<CreateCustomDomainAssociationResult> {
  try {
    // TODO: implement create_custom_domain_association
    throw new Error("create_custom_domain_association not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_custom_domain_association failed");
  }
}

/** Create endpoint access. */
export async function createEndpointAccess(endpointName: string, subnetIds: string[], workgroupName: string): Promise<CreateEndpointAccessResult> {
  try {
    // TODO: implement create_endpoint_access
    throw new Error("create_endpoint_access not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_endpoint_access failed");
  }
}

/** Create reservation. */
export async function createReservation(capacity: number, offeringId: string): Promise<CreateReservationResult> {
  try {
    // TODO: implement create_reservation
    throw new Error("create_reservation not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_reservation failed");
  }
}

/** Create scheduled action. */
export async function createScheduledAction(namespaceName: string, roleArn: string, schedule: Record<string, unknown>, scheduledActionName: string, targetAction: Record<string, unknown>): Promise<CreateScheduledActionResult> {
  try {
    // TODO: implement create_scheduled_action
    throw new Error("create_scheduled_action not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_scheduled_action failed");
  }
}

/** Create snapshot. */
export async function createSnapshot(namespaceName: string, snapshotName: string): Promise<CreateSnapshotResult> {
  try {
    // TODO: implement create_snapshot
    throw new Error("create_snapshot not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_snapshot failed");
  }
}

/** Create snapshot copy configuration. */
export async function createSnapshotCopyConfiguration(destinationRegion: string, namespaceName: string): Promise<CreateSnapshotCopyConfigurationResult> {
  try {
    // TODO: implement create_snapshot_copy_configuration
    throw new Error("create_snapshot_copy_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_snapshot_copy_configuration failed");
  }
}

/** Create usage limit. */
export async function createUsageLimit(amount: number, resourceArn: string, usageType: string): Promise<CreateUsageLimitResult> {
  try {
    // TODO: implement create_usage_limit
    throw new Error("create_usage_limit not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_usage_limit failed");
  }
}

/** Delete custom domain association. */
export async function deleteCustomDomainAssociation(customDomainName: string, workgroupName: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_custom_domain_association
    throw new Error("delete_custom_domain_association not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_custom_domain_association failed");
  }
}

/** Delete endpoint access. */
export async function deleteEndpointAccess(endpointName: string, regionName?: string): Promise<DeleteEndpointAccessResult> {
  try {
    // TODO: implement delete_endpoint_access
    throw new Error("delete_endpoint_access not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_endpoint_access failed");
  }
}

/** Delete resource policy. */
export async function deleteResourcePolicy(resourceArn: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_resource_policy
    throw new Error("delete_resource_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_resource_policy failed");
  }
}

/** Delete scheduled action. */
export async function deleteScheduledAction(scheduledActionName: string, regionName?: string): Promise<DeleteScheduledActionResult> {
  try {
    // TODO: implement delete_scheduled_action
    throw new Error("delete_scheduled_action not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_scheduled_action failed");
  }
}

/** Delete snapshot. */
export async function deleteSnapshot(snapshotName: string, regionName?: string): Promise<DeleteSnapshotResult> {
  try {
    // TODO: implement delete_snapshot
    throw new Error("delete_snapshot not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_snapshot failed");
  }
}

/** Delete snapshot copy configuration. */
export async function deleteSnapshotCopyConfiguration(snapshotCopyConfigurationId: string, regionName?: string): Promise<DeleteSnapshotCopyConfigurationResult> {
  try {
    // TODO: implement delete_snapshot_copy_configuration
    throw new Error("delete_snapshot_copy_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_snapshot_copy_configuration failed");
  }
}

/** Delete usage limit. */
export async function deleteUsageLimit(usageLimitId: string, regionName?: string): Promise<DeleteUsageLimitResult> {
  try {
    // TODO: implement delete_usage_limit
    throw new Error("delete_usage_limit not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_usage_limit failed");
  }
}

/** Get credentials. */
export async function getCredentials(): Promise<GetCredentialsResult> {
  try {
    // TODO: implement get_credentials
    throw new Error("get_credentials not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_credentials failed");
  }
}

/** Get custom domain association. */
export async function getCustomDomainAssociation(customDomainName: string, workgroupName: string, regionName?: string): Promise<GetCustomDomainAssociationResult> {
  try {
    // TODO: implement get_custom_domain_association
    throw new Error("get_custom_domain_association not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_custom_domain_association failed");
  }
}

/** Get endpoint access. */
export async function getEndpointAccess(endpointName: string, regionName?: string): Promise<GetEndpointAccessResult> {
  try {
    // TODO: implement get_endpoint_access
    throw new Error("get_endpoint_access not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_endpoint_access failed");
  }
}

/** Get recovery point. */
export async function getRecoveryPoint(recoveryPointId: string, regionName?: string): Promise<GetRecoveryPointResult> {
  try {
    // TODO: implement get_recovery_point
    throw new Error("get_recovery_point not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_recovery_point failed");
  }
}

/** Get reservation. */
export async function getReservation(reservationId: string, regionName?: string): Promise<GetReservationResult> {
  try {
    // TODO: implement get_reservation
    throw new Error("get_reservation not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_reservation failed");
  }
}

/** Get reservation offering. */
export async function getReservationOffering(offeringId: string, regionName?: string): Promise<GetReservationOfferingResult> {
  try {
    // TODO: implement get_reservation_offering
    throw new Error("get_reservation_offering not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_reservation_offering failed");
  }
}

/** Get resource policy. */
export async function getResourcePolicy(resourceArn: string, regionName?: string): Promise<GetResourcePolicyResult> {
  try {
    // TODO: implement get_resource_policy
    throw new Error("get_resource_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_resource_policy failed");
  }
}

/** Get scheduled action. */
export async function getScheduledAction(scheduledActionName: string, regionName?: string): Promise<GetScheduledActionResult> {
  try {
    // TODO: implement get_scheduled_action
    throw new Error("get_scheduled_action not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_scheduled_action failed");
  }
}

/** Get snapshot. */
export async function getSnapshot(): Promise<GetSnapshotResult> {
  try {
    // TODO: implement get_snapshot
    throw new Error("get_snapshot not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_snapshot failed");
  }
}

/** Get table restore status. */
export async function getTableRestoreStatus(tableRestoreRequestId: string, regionName?: string): Promise<GetTableRestoreStatusResult> {
  try {
    // TODO: implement get_table_restore_status
    throw new Error("get_table_restore_status not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_table_restore_status failed");
  }
}

/** Get track. */
export async function getTrack(trackName: string, regionName?: string): Promise<GetTrackResult> {
  try {
    // TODO: implement get_track
    throw new Error("get_track not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_track failed");
  }
}

/** Get usage limit. */
export async function getUsageLimit(usageLimitId: string, regionName?: string): Promise<GetUsageLimitResult> {
  try {
    // TODO: implement get_usage_limit
    throw new Error("get_usage_limit not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_usage_limit failed");
  }
}

/** List custom domain associations. */
export async function listCustomDomainAssociations(): Promise<ListCustomDomainAssociationsResult> {
  try {
    // TODO: implement list_custom_domain_associations
    throw new Error("list_custom_domain_associations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_custom_domain_associations failed");
  }
}

/** List endpoint access. */
export async function listEndpointAccess(): Promise<ListEndpointAccessResult> {
  try {
    // TODO: implement list_endpoint_access
    throw new Error("list_endpoint_access not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_endpoint_access failed");
  }
}

/** List managed workgroups. */
export async function listManagedWorkgroups(): Promise<ListManagedWorkgroupsResult> {
  try {
    // TODO: implement list_managed_workgroups
    throw new Error("list_managed_workgroups not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_managed_workgroups failed");
  }
}

/** List recovery points. */
export async function listRecoveryPoints(): Promise<ListRecoveryPointsResult> {
  try {
    // TODO: implement list_recovery_points
    throw new Error("list_recovery_points not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_recovery_points failed");
  }
}

/** List reservation offerings. */
export async function listReservationOfferings(): Promise<ListReservationOfferingsResult> {
  try {
    // TODO: implement list_reservation_offerings
    throw new Error("list_reservation_offerings not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_reservation_offerings failed");
  }
}

/** List reservations. */
export async function listReservations(): Promise<ListReservationsResult> {
  try {
    // TODO: implement list_reservations
    throw new Error("list_reservations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_reservations failed");
  }
}

/** List scheduled actions. */
export async function listScheduledActions(): Promise<ListScheduledActionsResult> {
  try {
    // TODO: implement list_scheduled_actions
    throw new Error("list_scheduled_actions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_scheduled_actions failed");
  }
}

/** List snapshot copy configurations. */
export async function listSnapshotCopyConfigurations(): Promise<ListSnapshotCopyConfigurationsResult> {
  try {
    // TODO: implement list_snapshot_copy_configurations
    throw new Error("list_snapshot_copy_configurations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_snapshot_copy_configurations failed");
  }
}

/** List snapshots. */
export async function listSnapshots(): Promise<ListSnapshotsResult> {
  try {
    // TODO: implement list_snapshots
    throw new Error("list_snapshots not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_snapshots failed");
  }
}

/** List table restore status. */
export async function listTableRestoreStatus(): Promise<ListTableRestoreStatusResult> {
  try {
    // TODO: implement list_table_restore_status
    throw new Error("list_table_restore_status not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_table_restore_status failed");
  }
}

/** List tags for resource. */
export async function listTagsForResource(resourceArn: string, regionName?: string): Promise<ListTagsForResourceResult> {
  try {
    // TODO: implement list_tags_for_resource
    throw new Error("list_tags_for_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_tags_for_resource failed");
  }
}

/** List tracks. */
export async function listTracks(): Promise<ListTracksResult> {
  try {
    // TODO: implement list_tracks
    throw new Error("list_tracks not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_tracks failed");
  }
}

/** List usage limits. */
export async function listUsageLimits(): Promise<ListUsageLimitsResult> {
  try {
    // TODO: implement list_usage_limits
    throw new Error("list_usage_limits not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_usage_limits failed");
  }
}

/** Put resource policy. */
export async function putResourcePolicy(policy: string, resourceArn: string, regionName?: string): Promise<PutResourcePolicyResult> {
  try {
    // TODO: implement put_resource_policy
    throw new Error("put_resource_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_resource_policy failed");
  }
}

/** Restore from recovery point. */
export async function restoreFromRecoveryPoint(namespaceName: string, recoveryPointId: string, workgroupName: string, regionName?: string): Promise<RestoreFromRecoveryPointResult> {
  try {
    // TODO: implement restore_from_recovery_point
    throw new Error("restore_from_recovery_point not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "restore_from_recovery_point failed");
  }
}

/** Restore from snapshot. */
export async function restoreFromSnapshot(namespaceName: string, workgroupName: string): Promise<RestoreFromSnapshotResult> {
  try {
    // TODO: implement restore_from_snapshot
    throw new Error("restore_from_snapshot not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "restore_from_snapshot failed");
  }
}

/** Restore table from recovery point. */
export async function restoreTableFromRecoveryPoint(namespaceName: string, newTableName: string, recoveryPointId: string, sourceDatabaseName: string, sourceTableName: string, workgroupName: string): Promise<RestoreTableFromRecoveryPointResult> {
  try {
    // TODO: implement restore_table_from_recovery_point
    throw new Error("restore_table_from_recovery_point not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "restore_table_from_recovery_point failed");
  }
}

/** Restore table from snapshot. */
export async function restoreTableFromSnapshot(namespaceName: string, newTableName: string, snapshotName: string, sourceDatabaseName: string, sourceTableName: string, workgroupName: string): Promise<RestoreTableFromSnapshotResult> {
  try {
    // TODO: implement restore_table_from_snapshot
    throw new Error("restore_table_from_snapshot not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "restore_table_from_snapshot failed");
  }
}

/** Tag resource. */
export async function tagResource(resourceArn: string, tags: Record<string, unknown>[], regionName?: string): Promise<void> {
  try {
    // TODO: implement tag_resource
    throw new Error("tag_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "tag_resource failed");
  }
}

/** Untag resource. */
export async function untagResource(resourceArn: string, tagKeys: string[], regionName?: string): Promise<void> {
  try {
    // TODO: implement untag_resource
    throw new Error("untag_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "untag_resource failed");
  }
}

/** Update custom domain association. */
export async function updateCustomDomainAssociation(customDomainCertificateArn: string, customDomainName: string, workgroupName: string, regionName?: string): Promise<UpdateCustomDomainAssociationResult> {
  try {
    // TODO: implement update_custom_domain_association
    throw new Error("update_custom_domain_association not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_custom_domain_association failed");
  }
}

/** Update endpoint access. */
export async function updateEndpointAccess(endpointName: string): Promise<UpdateEndpointAccessResult> {
  try {
    // TODO: implement update_endpoint_access
    throw new Error("update_endpoint_access not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_endpoint_access failed");
  }
}

/** Update scheduled action. */
export async function updateScheduledAction(scheduledActionName: string): Promise<UpdateScheduledActionResult> {
  try {
    // TODO: implement update_scheduled_action
    throw new Error("update_scheduled_action not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_scheduled_action failed");
  }
}

/** Update snapshot. */
export async function updateSnapshot(snapshotName: string): Promise<UpdateSnapshotResult> {
  try {
    // TODO: implement update_snapshot
    throw new Error("update_snapshot not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_snapshot failed");
  }
}

/** Update snapshot copy configuration. */
export async function updateSnapshotCopyConfiguration(snapshotCopyConfigurationId: string): Promise<UpdateSnapshotCopyConfigurationResult> {
  try {
    // TODO: implement update_snapshot_copy_configuration
    throw new Error("update_snapshot_copy_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_snapshot_copy_configuration failed");
  }
}

/** Update usage limit. */
export async function updateUsageLimit(usageLimitId: string): Promise<UpdateUsageLimitResult> {
  try {
    // TODO: implement update_usage_limit
    throw new Error("update_usage_limit not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_usage_limit failed");
  }
}
