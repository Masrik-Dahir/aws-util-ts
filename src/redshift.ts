import { RedshiftClient } from "@aws-sdk/client-redshift";
import { getClient } from "./client";
import { wrapAwsError } from "./exceptions";

/** Metadata for a Redshift cluster. */
export type ClusterResult = {
  clusterIdentifier: string;
  nodeType: string;
  clusterStatus: string;
  dbName?: string;
  masterUsername?: string;
  endpointAddress?: string;
  endpointPort?: number;
  numberOfNodes?: number;
  publiclyAccessible?: boolean;
  encrypted?: boolean;
  vpcId?: string;
  availabilityZone?: string;
  tags?: Record<string, unknown>;
};

/** Metadata for a Redshift cluster snapshot. */
export type SnapshotResult = {
  snapshotIdentifier: string;
  clusterIdentifier: string;
  status: string;
  snapshotType: string;
  nodeType?: string;
  numberOfNodes?: number;
  dbName?: string;
  createTime?: Date;
  encrypted?: boolean;
};

/** Metadata for a Redshift cluster parameter group. */
export type ParameterGroupResult = {
  parameterGroupName: string;
  parameterGroupFamily: string;
  description: string;
};

/** Metadata for a Redshift cluster subnet group. */
export type SubnetGroupResult = {
  clusterSubnetGroupName: string;
  description: string;
  vpcId?: string;
  subnetIds?: string[];
  status?: string;
};

/** Redshift audit-logging status. */
export type LoggingStatus = {
  loggingEnabled: boolean;
  bucketName?: string;
  s3KeyPrefix?: string;
};

/** Result of accept_reserved_node_exchange. */
export type AcceptReservedNodeExchangeResult = {
  exchangedReservedNode?: Record<string, unknown>;
};

/** Result of add_partner. */
export type AddPartnerResult = {
  databaseName?: string;
  partnerName?: string;
};

/** Result of associate_data_share_consumer. */
export type AssociateDataShareConsumerResult = {
  dataShareArn?: string;
  producerArn?: string;
  allowPubliclyAccessibleConsumers?: boolean;
  dataShareAssociations?: Record<string, unknown>[];
  managedBy?: string;
  dataShareType?: string;
};

/** Result of authorize_cluster_security_group_ingress. */
export type AuthorizeClusterSecurityGroupIngressResult = {
  clusterSecurityGroup?: Record<string, unknown>;
};

/** Result of authorize_data_share. */
export type AuthorizeDataShareResult = {
  dataShareArn?: string;
  producerArn?: string;
  allowPubliclyAccessibleConsumers?: boolean;
  dataShareAssociations?: Record<string, unknown>[];
  managedBy?: string;
  dataShareType?: string;
};

/** Result of authorize_endpoint_access. */
export type AuthorizeEndpointAccessResult = {
  grantor?: string;
  grantee?: string;
  clusterIdentifier?: string;
  authorizeTime?: string;
  clusterStatus?: string;
  status?: string;
  allowedAllVpCs?: boolean;
  allowedVpCs?: string[];
  endpointCount?: number;
};

/** Result of authorize_snapshot_access. */
export type AuthorizeSnapshotAccessResult = {
  snapshot?: Record<string, unknown>;
};

/** Result of batch_delete_cluster_snapshots. */
export type BatchDeleteClusterSnapshotsResult = {
  resources?: string[];
  errors?: Record<string, unknown>[];
};

/** Result of batch_modify_cluster_snapshots. */
export type BatchModifyClusterSnapshotsResult = {
  resources?: string[];
  errors?: Record<string, unknown>[];
};

/** Result of cancel_resize. */
export type CancelResizeResult = {
  targetNodeType?: string;
  targetNumberOfNodes?: number;
  targetClusterType?: string;
  status?: string;
  importTablesCompleted?: string[];
  importTablesInProgress?: string[];
  importTablesNotStarted?: string[];
  avgResizeRateInMegaBytesPerSecond?: number;
  totalResizeDataInMegaBytes?: number;
  progressInMegaBytes?: number;
  elapsedTimeInSeconds?: number;
  estimatedTimeToCompletionInSeconds?: number;
  resizeType?: string;
  message?: string;
  targetEncryptionType?: string;
  dataTransferProgressPercent?: number;
};

/** Result of copy_cluster_snapshot. */
export type CopyClusterSnapshotResult = {
  snapshot?: Record<string, unknown>;
};

/** Result of create_authentication_profile. */
export type CreateAuthenticationProfileResult = {
  authenticationProfileName?: string;
  authenticationProfileContent?: string;
};

/** Result of create_cluster_security_group. */
export type CreateClusterSecurityGroupResult = {
  clusterSecurityGroup?: Record<string, unknown>;
};

/** Result of create_custom_domain_association. */
export type CreateCustomDomainAssociationResult = {
  customDomainName?: string;
  customDomainCertificateArn?: string;
  clusterIdentifier?: string;
  customDomainCertExpiryTime?: string;
};

/** Result of create_endpoint_access. */
export type CreateEndpointAccessResult = {
  clusterIdentifier?: string;
  resourceOwner?: string;
  subnetGroupName?: string;
  endpointStatus?: string;
  endpointName?: string;
  endpointCreateTime?: string;
  port?: number;
  address?: string;
  vpcSecurityGroups?: Record<string, unknown>[];
  vpcEndpoint?: Record<string, unknown>;
};

/** Result of create_event_subscription. */
export type CreateEventSubscriptionResult = {
  eventSubscription?: Record<string, unknown>;
};

/** Result of create_hsm_client_certificate. */
export type CreateHsmClientCertificateResult = {
  hsmClientCertificate?: Record<string, unknown>;
};

/** Result of create_hsm_configuration. */
export type CreateHsmConfigurationResult = {
  hsmConfiguration?: Record<string, unknown>;
};

/** Result of create_integration. */
export type CreateIntegrationResult = {
  integrationArn?: string;
  integrationName?: string;
  sourceArn?: string;
  targetArn?: string;
  status?: string;
  errors?: Record<string, unknown>[];
  createTime?: string;
  description?: string;
  kmsKeyId?: string;
  additionalEncryptionContext?: Record<string, unknown>;
  tags?: Record<string, unknown>[];
};

/** Result of create_redshift_idc_application. */
export type CreateRedshiftIdcApplicationResult = {
  redshiftIdcApplication?: Record<string, unknown>;
};

/** Result of create_scheduled_action. */
export type CreateScheduledActionResult = {
  scheduledActionName?: string;
  targetAction?: Record<string, unknown>;
  schedule?: string;
  iamRole?: string;
  scheduledActionDescription?: string;
  state?: string;
  nextInvocations?: string[];
  startTime?: string;
  endTime?: string;
};

/** Result of create_snapshot_copy_grant. */
export type CreateSnapshotCopyGrantResult = {
  snapshotCopyGrant?: Record<string, unknown>;
};

/** Result of create_snapshot_schedule. */
export type CreateSnapshotScheduleResult = {
  scheduleDefinitions?: string[];
  scheduleIdentifier?: string;
  scheduleDescription?: string;
  tags?: Record<string, unknown>[];
  nextInvocations?: string[];
  associatedClusterCount?: number;
  associatedClusters?: Record<string, unknown>[];
};

/** Result of create_usage_limit. */
export type CreateUsageLimitResult = {
  usageLimitId?: string;
  clusterIdentifier?: string;
  featureType?: string;
  limitType?: string;
  amount?: number;
  period?: string;
  breachAction?: string;
  tags?: Record<string, unknown>[];
};

/** Result of deauthorize_data_share. */
export type DeauthorizeDataShareResult = {
  dataShareArn?: string;
  producerArn?: string;
  allowPubliclyAccessibleConsumers?: boolean;
  dataShareAssociations?: Record<string, unknown>[];
  managedBy?: string;
  dataShareType?: string;
};

/** Result of delete_authentication_profile. */
export type DeleteAuthenticationProfileResult = {
  authenticationProfileName?: string;
};

/** Result of delete_endpoint_access. */
export type DeleteEndpointAccessResult = {
  clusterIdentifier?: string;
  resourceOwner?: string;
  subnetGroupName?: string;
  endpointStatus?: string;
  endpointName?: string;
  endpointCreateTime?: string;
  port?: number;
  address?: string;
  vpcSecurityGroups?: Record<string, unknown>[];
  vpcEndpoint?: Record<string, unknown>;
};

/** Result of delete_integration. */
export type DeleteIntegrationResult = {
  integrationArn?: string;
  integrationName?: string;
  sourceArn?: string;
  targetArn?: string;
  status?: string;
  errors?: Record<string, unknown>[];
  createTime?: string;
  description?: string;
  kmsKeyId?: string;
  additionalEncryptionContext?: Record<string, unknown>;
  tags?: Record<string, unknown>[];
};

/** Result of delete_partner. */
export type DeletePartnerResult = {
  databaseName?: string;
  partnerName?: string;
};

/** Result of deregister_namespace. */
export type DeregisterNamespaceResult = {
  status?: string;
};

/** Result of describe_account_attributes. */
export type DescribeAccountAttributesResult = {
  accountAttributes?: Record<string, unknown>[];
};

/** Result of describe_authentication_profiles. */
export type DescribeAuthenticationProfilesResult = {
  authenticationProfiles?: Record<string, unknown>[];
};

/** Result of describe_cluster_db_revisions. */
export type DescribeClusterDbRevisionsResult = {
  marker?: string;
  clusterDbRevisions?: Record<string, unknown>[];
};

/** Result of describe_cluster_parameter_groups. */
export type DescribeClusterParameterGroupsResult = {
  marker?: string;
  parameterGroups?: Record<string, unknown>[];
};

/** Result of describe_cluster_parameters. */
export type DescribeClusterParametersResult = {
  parameters?: Record<string, unknown>[];
  marker?: string;
};

/** Result of describe_cluster_security_groups. */
export type DescribeClusterSecurityGroupsResult = {
  marker?: string;
  clusterSecurityGroups?: Record<string, unknown>[];
};

/** Result of describe_cluster_subnet_groups. */
export type DescribeClusterSubnetGroupsResult = {
  marker?: string;
  clusterSubnetGroups?: Record<string, unknown>[];
};

/** Result of describe_cluster_tracks. */
export type DescribeClusterTracksResult = {
  maintenanceTracks?: Record<string, unknown>[];
  marker?: string;
};

/** Result of describe_cluster_versions. */
export type DescribeClusterVersionsResult = {
  marker?: string;
  clusterVersions?: Record<string, unknown>[];
};

/** Result of describe_custom_domain_associations. */
export type DescribeCustomDomainAssociationsResult = {
  marker?: string;
  associations?: Record<string, unknown>[];
};

/** Result of describe_data_shares. */
export type DescribeDataSharesResult = {
  dataShares?: Record<string, unknown>[];
  marker?: string;
};

/** Result of describe_data_shares_for_consumer. */
export type DescribeDataSharesForConsumerResult = {
  dataShares?: Record<string, unknown>[];
  marker?: string;
};

/** Result of describe_data_shares_for_producer. */
export type DescribeDataSharesForProducerResult = {
  dataShares?: Record<string, unknown>[];
  marker?: string;
};

/** Result of describe_default_cluster_parameters. */
export type DescribeDefaultClusterParametersResult = {
  defaultClusterParameters?: Record<string, unknown>;
};

/** Result of describe_endpoint_access. */
export type DescribeEndpointAccessResult = {
  endpointAccessList?: Record<string, unknown>[];
  marker?: string;
};

/** Result of describe_endpoint_authorization. */
export type DescribeEndpointAuthorizationResult = {
  endpointAuthorizationList?: Record<string, unknown>[];
  marker?: string;
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

/** Result of describe_hsm_client_certificates. */
export type DescribeHsmClientCertificatesResult = {
  marker?: string;
  hsmClientCertificates?: Record<string, unknown>[];
};

/** Result of describe_hsm_configurations. */
export type DescribeHsmConfigurationsResult = {
  marker?: string;
  hsmConfigurations?: Record<string, unknown>[];
};

/** Result of describe_inbound_integrations. */
export type DescribeInboundIntegrationsResult = {
  marker?: string;
  inboundIntegrations?: Record<string, unknown>[];
};

/** Result of describe_integrations. */
export type DescribeIntegrationsResult = {
  marker?: string;
  integrations?: Record<string, unknown>[];
};

/** Result of describe_node_configuration_options. */
export type DescribeNodeConfigurationOptionsResult = {
  nodeConfigurationOptionList?: Record<string, unknown>[];
  marker?: string;
};

/** Result of describe_orderable_cluster_options. */
export type DescribeOrderableClusterOptionsResult = {
  orderableClusterOptions?: Record<string, unknown>[];
  marker?: string;
};

/** Result of describe_partners. */
export type DescribePartnersResult = {
  partnerIntegrationInfoList?: Record<string, unknown>[];
};

/** Result of describe_redshift_idc_applications. */
export type DescribeRedshiftIdcApplicationsResult = {
  redshiftIdcApplications?: Record<string, unknown>[];
  marker?: string;
};

/** Result of describe_reserved_node_exchange_status. */
export type DescribeReservedNodeExchangeStatusResult = {
  reservedNodeExchangeStatusDetails?: Record<string, unknown>[];
  marker?: string;
};

/** Result of describe_reserved_node_offerings. */
export type DescribeReservedNodeOfferingsResult = {
  marker?: string;
  reservedNodeOfferings?: Record<string, unknown>[];
};

/** Result of describe_reserved_nodes. */
export type DescribeReservedNodesResult = {
  marker?: string;
  reservedNodes?: Record<string, unknown>[];
};

/** Result of describe_resize. */
export type DescribeResizeResult = {
  targetNodeType?: string;
  targetNumberOfNodes?: number;
  targetClusterType?: string;
  status?: string;
  importTablesCompleted?: string[];
  importTablesInProgress?: string[];
  importTablesNotStarted?: string[];
  avgResizeRateInMegaBytesPerSecond?: number;
  totalResizeDataInMegaBytes?: number;
  progressInMegaBytes?: number;
  elapsedTimeInSeconds?: number;
  estimatedTimeToCompletionInSeconds?: number;
  resizeType?: string;
  message?: string;
  targetEncryptionType?: string;
  dataTransferProgressPercent?: number;
};

/** Result of describe_scheduled_actions. */
export type DescribeScheduledActionsResult = {
  marker?: string;
  scheduledActions?: Record<string, unknown>[];
};

/** Result of describe_snapshot_copy_grants. */
export type DescribeSnapshotCopyGrantsResult = {
  marker?: string;
  snapshotCopyGrants?: Record<string, unknown>[];
};

/** Result of describe_snapshot_schedules. */
export type DescribeSnapshotSchedulesResult = {
  snapshotSchedules?: Record<string, unknown>[];
  marker?: string;
};

/** Result of describe_storage. */
export type DescribeStorageResult = {
  totalBackupSizeInMegaBytes?: number;
  totalProvisionedStorageInMegaBytes?: number;
};

/** Result of describe_table_restore_status. */
export type DescribeTableRestoreStatusResult = {
  tableRestoreStatusDetails?: Record<string, unknown>[];
  marker?: string;
};

/** Result of describe_tags. */
export type DescribeTagsResult = {
  taggedResources?: Record<string, unknown>[];
  marker?: string;
};

/** Result of describe_usage_limits. */
export type DescribeUsageLimitsResult = {
  usageLimits?: Record<string, unknown>[];
  marker?: string;
};

/** Result of disable_snapshot_copy. */
export type DisableSnapshotCopyResult = {
  cluster?: Record<string, unknown>;
};

/** Result of disassociate_data_share_consumer. */
export type DisassociateDataShareConsumerResult = {
  dataShareArn?: string;
  producerArn?: string;
  allowPubliclyAccessibleConsumers?: boolean;
  dataShareAssociations?: Record<string, unknown>[];
  managedBy?: string;
  dataShareType?: string;
};

/** Result of enable_snapshot_copy. */
export type EnableSnapshotCopyResult = {
  cluster?: Record<string, unknown>;
};

/** Result of failover_primary_compute. */
export type FailoverPrimaryComputeResult = {
  cluster?: Record<string, unknown>;
};

/** Result of get_cluster_credentials. */
export type GetClusterCredentialsResult = {
  dbUser?: string;
  dbPassword?: string;
  expiration?: string;
};

/** Result of get_cluster_credentials_with_iam. */
export type GetClusterCredentialsWithIamResult = {
  dbUser?: string;
  dbPassword?: string;
  expiration?: string;
  nextRefreshTime?: string;
};

/** Result of get_identity_center_auth_token. */
export type GetIdentityCenterAuthTokenResult = {
  token?: string;
  expirationTime?: string;
};

/** Result of get_reserved_node_exchange_configuration_options. */
export type GetReservedNodeExchangeConfigurationOptionsResult = {
  marker?: string;
  reservedNodeConfigurationOptionList?: Record<string, unknown>[];
};

/** Result of get_reserved_node_exchange_offerings. */
export type GetReservedNodeExchangeOfferingsResult = {
  marker?: string;
  reservedNodeOfferings?: Record<string, unknown>[];
};

/** Result of get_resource_policy. */
export type GetResourcePolicyResult = {
  resourcePolicy?: Record<string, unknown>;
};

/** Result of list_recommendations. */
export type ListRecommendationsResult = {
  recommendations?: Record<string, unknown>[];
  marker?: string;
};

/** Result of modify_aqua_configuration. */
export type ModifyAquaConfigurationResult = {
  aquaConfiguration?: Record<string, unknown>;
};

/** Result of modify_authentication_profile. */
export type ModifyAuthenticationProfileResult = {
  authenticationProfileName?: string;
  authenticationProfileContent?: string;
};

/** Result of modify_cluster_db_revision. */
export type ModifyClusterDbRevisionResult = {
  cluster?: Record<string, unknown>;
};

/** Result of modify_cluster_iam_roles. */
export type ModifyClusterIamRolesResult = {
  cluster?: Record<string, unknown>;
};

/** Result of modify_cluster_maintenance. */
export type ModifyClusterMaintenanceResult = {
  cluster?: Record<string, unknown>;
};

/** Result of modify_cluster_parameter_group. */
export type ModifyClusterParameterGroupResult = {
  parameterGroupName?: string;
  parameterGroupStatus?: string;
};

/** Result of modify_cluster_snapshot. */
export type ModifyClusterSnapshotResult = {
  snapshot?: Record<string, unknown>;
};

/** Result of modify_cluster_subnet_group. */
export type ModifyClusterSubnetGroupResult = {
  clusterSubnetGroup?: Record<string, unknown>;
};

/** Result of modify_custom_domain_association. */
export type ModifyCustomDomainAssociationResult = {
  customDomainName?: string;
  customDomainCertificateArn?: string;
  clusterIdentifier?: string;
  customDomainCertExpiryTime?: string;
};

/** Result of modify_endpoint_access. */
export type ModifyEndpointAccessResult = {
  clusterIdentifier?: string;
  resourceOwner?: string;
  subnetGroupName?: string;
  endpointStatus?: string;
  endpointName?: string;
  endpointCreateTime?: string;
  port?: number;
  address?: string;
  vpcSecurityGroups?: Record<string, unknown>[];
  vpcEndpoint?: Record<string, unknown>;
};

/** Result of modify_event_subscription. */
export type ModifyEventSubscriptionResult = {
  eventSubscription?: Record<string, unknown>;
};

/** Result of modify_integration. */
export type ModifyIntegrationResult = {
  integrationArn?: string;
  integrationName?: string;
  sourceArn?: string;
  targetArn?: string;
  status?: string;
  errors?: Record<string, unknown>[];
  createTime?: string;
  description?: string;
  kmsKeyId?: string;
  additionalEncryptionContext?: Record<string, unknown>;
  tags?: Record<string, unknown>[];
};

/** Result of modify_redshift_idc_application. */
export type ModifyRedshiftIdcApplicationResult = {
  redshiftIdcApplication?: Record<string, unknown>;
};

/** Result of modify_scheduled_action. */
export type ModifyScheduledActionResult = {
  scheduledActionName?: string;
  targetAction?: Record<string, unknown>;
  schedule?: string;
  iamRole?: string;
  scheduledActionDescription?: string;
  state?: string;
  nextInvocations?: string[];
  startTime?: string;
  endTime?: string;
};

/** Result of modify_snapshot_copy_retention_period. */
export type ModifySnapshotCopyRetentionPeriodResult = {
  cluster?: Record<string, unknown>;
};

/** Result of modify_snapshot_schedule. */
export type ModifySnapshotScheduleResult = {
  scheduleDefinitions?: string[];
  scheduleIdentifier?: string;
  scheduleDescription?: string;
  tags?: Record<string, unknown>[];
  nextInvocations?: string[];
  associatedClusterCount?: number;
  associatedClusters?: Record<string, unknown>[];
};

/** Result of modify_usage_limit. */
export type ModifyUsageLimitResult = {
  usageLimitId?: string;
  clusterIdentifier?: string;
  featureType?: string;
  limitType?: string;
  amount?: number;
  period?: string;
  breachAction?: string;
  tags?: Record<string, unknown>[];
};

/** Result of pause_cluster. */
export type PauseClusterResult = {
  cluster?: Record<string, unknown>;
};

/** Result of purchase_reserved_node_offering. */
export type PurchaseReservedNodeOfferingResult = {
  reservedNode?: Record<string, unknown>;
};

/** Result of put_resource_policy. */
export type PutResourcePolicyResult = {
  resourcePolicy?: Record<string, unknown>;
};

/** Result of register_namespace. */
export type RegisterNamespaceResult = {
  status?: string;
};

/** Result of reject_data_share. */
export type RejectDataShareResult = {
  dataShareArn?: string;
  producerArn?: string;
  allowPubliclyAccessibleConsumers?: boolean;
  dataShareAssociations?: Record<string, unknown>[];
  managedBy?: string;
  dataShareType?: string;
};

/** Result of reset_cluster_parameter_group. */
export type ResetClusterParameterGroupResult = {
  parameterGroupName?: string;
  parameterGroupStatus?: string;
};

/** Result of resize_cluster. */
export type ResizeClusterResult = {
  cluster?: Record<string, unknown>;
};

/** Result of restore_table_from_cluster_snapshot. */
export type RestoreTableFromClusterSnapshotResult = {
  tableRestoreStatus?: Record<string, unknown>;
};

/** Result of resume_cluster. */
export type ResumeClusterResult = {
  cluster?: Record<string, unknown>;
};

/** Result of revoke_cluster_security_group_ingress. */
export type RevokeClusterSecurityGroupIngressResult = {
  clusterSecurityGroup?: Record<string, unknown>;
};

/** Result of revoke_endpoint_access. */
export type RevokeEndpointAccessResult = {
  grantor?: string;
  grantee?: string;
  clusterIdentifier?: string;
  authorizeTime?: string;
  clusterStatus?: string;
  status?: string;
  allowedAllVpCs?: boolean;
  allowedVpCs?: string[];
  endpointCount?: number;
};

/** Result of revoke_snapshot_access. */
export type RevokeSnapshotAccessResult = {
  snapshot?: Record<string, unknown>;
};

/** Result of rotate_encryption_key. */
export type RotateEncryptionKeyResult = {
  cluster?: Record<string, unknown>;
};

/** Result of update_partner_status. */
export type UpdatePartnerStatusResult = {
  databaseName?: string;
  partnerName?: string;
};

/** Create a new Redshift cluster. */
export async function createCluster(clusterIdentifier: string, nodeType: string, masterUsername: string, masterUserPassword: string, dbName: string, clusterType: string, numberOfNodes: number, publiclyAccessible: boolean, encrypted: boolean, tags?: Record<string, unknown>, regionName?: string): Promise<ClusterResult> {
  try {
    // TODO: implement create_cluster
    throw new Error("create_cluster not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_cluster failed");
  }
}

/** Describe one or all Redshift clusters. */
export async function describeClusters(clusterIdentifier?: string, regionName?: string): Promise<ClusterResult[]> {
  try {
    // TODO: implement describe_clusters
    throw new Error("describe_clusters not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_clusters failed");
  }
}

/** Delete a Redshift cluster. */
export async function deleteCluster(clusterIdentifier: string, skipFinalSnapshot: boolean, finalSnapshotIdentifier?: string, regionName?: string): Promise<ClusterResult> {
  try {
    // TODO: implement delete_cluster
    throw new Error("delete_cluster not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_cluster failed");
  }
}

/** Modify an existing Redshift cluster. */
export async function modifyCluster(clusterIdentifier: string, regionName?: string): Promise<ClusterResult> {
  try {
    // TODO: implement modify_cluster
    throw new Error("modify_cluster not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_cluster failed");
  }
}

/** Reboot a Redshift cluster. */
export async function rebootCluster(clusterIdentifier: string, regionName?: string): Promise<ClusterResult> {
  try {
    // TODO: implement reboot_cluster
    throw new Error("reboot_cluster not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "reboot_cluster failed");
  }
}

/** Create a manual snapshot of a Redshift cluster. */
export async function createClusterSnapshot(snapshotIdentifier: string, clusterIdentifier: string, tags?: Record<string, unknown>, regionName?: string): Promise<SnapshotResult> {
  try {
    // TODO: implement create_cluster_snapshot
    throw new Error("create_cluster_snapshot not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_cluster_snapshot failed");
  }
}

/** List Redshift cluster snapshots. */
export async function describeClusterSnapshots(clusterIdentifier?: string, snapshotIdentifier?: string, snapshotType: string, regionName?: string): Promise<SnapshotResult[]> {
  try {
    // TODO: implement describe_cluster_snapshots
    throw new Error("describe_cluster_snapshots not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_cluster_snapshots failed");
  }
}

/** Delete a manual Redshift cluster snapshot. */
export async function deleteClusterSnapshot(snapshotIdentifier: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_cluster_snapshot
    throw new Error("delete_cluster_snapshot not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_cluster_snapshot failed");
  }
}

/** Restore a Redshift cluster from a snapshot. */
export async function restoreFromClusterSnapshot(clusterIdentifier: string, snapshotIdentifier: string, nodeType?: string, numberOfNodes?: number, publiclyAccessible: boolean, regionName?: string): Promise<ClusterResult> {
  try {
    // TODO: implement restore_from_cluster_snapshot
    throw new Error("restore_from_cluster_snapshot not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "restore_from_cluster_snapshot failed");
  }
}

/** Create a Redshift cluster parameter group. */
export async function createClusterParameterGroup(parameterGroupName: string, parameterGroupFamily: string, description: string, tags?: Record<string, unknown>, regionName?: string): Promise<ParameterGroupResult> {
  try {
    // TODO: implement create_cluster_parameter_group
    throw new Error("create_cluster_parameter_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_cluster_parameter_group failed");
  }
}

/** Create a Redshift cluster subnet group. */
export async function createClusterSubnetGroup(clusterSubnetGroupName: string, description: string, subnetIds: string[], tags?: Record<string, unknown>, regionName?: string): Promise<SubnetGroupResult> {
  try {
    // TODO: implement create_cluster_subnet_group
    throw new Error("create_cluster_subnet_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_cluster_subnet_group failed");
  }
}

/** Get the audit-logging status for a Redshift cluster. */
export async function describeLoggingStatus(clusterIdentifier: string, regionName?: string): Promise<LoggingStatus> {
  try {
    // TODO: implement describe_logging_status
    throw new Error("describe_logging_status not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_logging_status failed");
  }
}

/** Enable audit logging for a Redshift cluster. */
export async function enableLogging(clusterIdentifier: string, bucketName: string, s3KeyPrefix?: string, regionName?: string): Promise<LoggingStatus> {
  try {
    // TODO: implement enable_logging
    throw new Error("enable_logging not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "enable_logging failed");
  }
}

/** Disable audit logging for a Redshift cluster. */
export async function disableLogging(clusterIdentifier: string, regionName?: string): Promise<LoggingStatus> {
  try {
    // TODO: implement disable_logging
    throw new Error("disable_logging not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disable_logging failed");
  }
}

/** Poll until a Redshift cluster reaches the desired status. */
export async function waitForCluster(clusterIdentifier: string, targetStatus: string, timeout: number, pollInterval: number, regionName?: string): Promise<ClusterResult> {
  try {
    // TODO: implement wait_for_cluster
    throw new Error("wait_for_cluster not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "wait_for_cluster failed");
  }
}

/** Accept reserved node exchange. */
export async function acceptReservedNodeExchange(reservedNodeId: string, targetReservedNodeOfferingId: string, regionName?: string): Promise<AcceptReservedNodeExchangeResult> {
  try {
    // TODO: implement accept_reserved_node_exchange
    throw new Error("accept_reserved_node_exchange not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "accept_reserved_node_exchange failed");
  }
}

/** Add partner. */
export async function addPartner(accountId: string, clusterIdentifier: string, databaseName: string, partnerName: string, regionName?: string): Promise<AddPartnerResult> {
  try {
    // TODO: implement add_partner
    throw new Error("add_partner not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "add_partner failed");
  }
}

/** Associate data share consumer. */
export async function associateDataShareConsumer(dataShareArn: string): Promise<AssociateDataShareConsumerResult> {
  try {
    // TODO: implement associate_data_share_consumer
    throw new Error("associate_data_share_consumer not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "associate_data_share_consumer failed");
  }
}

/** Authorize cluster security group ingress. */
export async function authorizeClusterSecurityGroupIngress(clusterSecurityGroupName: string): Promise<AuthorizeClusterSecurityGroupIngressResult> {
  try {
    // TODO: implement authorize_cluster_security_group_ingress
    throw new Error("authorize_cluster_security_group_ingress not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "authorize_cluster_security_group_ingress failed");
  }
}

/** Authorize data share. */
export async function authorizeDataShare(dataShareArn: string, consumerIdentifier: string): Promise<AuthorizeDataShareResult> {
  try {
    // TODO: implement authorize_data_share
    throw new Error("authorize_data_share not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "authorize_data_share failed");
  }
}

/** Authorize endpoint access. */
export async function authorizeEndpointAccess(account: string): Promise<AuthorizeEndpointAccessResult> {
  try {
    // TODO: implement authorize_endpoint_access
    throw new Error("authorize_endpoint_access not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "authorize_endpoint_access failed");
  }
}

/** Authorize snapshot access. */
export async function authorizeSnapshotAccess(accountWithRestoreAccess: string): Promise<AuthorizeSnapshotAccessResult> {
  try {
    // TODO: implement authorize_snapshot_access
    throw new Error("authorize_snapshot_access not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "authorize_snapshot_access failed");
  }
}

/** Batch delete cluster snapshots. */
export async function batchDeleteClusterSnapshots(identifiers: Record<string, unknown>[], regionName?: string): Promise<BatchDeleteClusterSnapshotsResult> {
  try {
    // TODO: implement batch_delete_cluster_snapshots
    throw new Error("batch_delete_cluster_snapshots not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_delete_cluster_snapshots failed");
  }
}

/** Batch modify cluster snapshots. */
export async function batchModifyClusterSnapshots(snapshotIdentifierList: string[]): Promise<BatchModifyClusterSnapshotsResult> {
  try {
    // TODO: implement batch_modify_cluster_snapshots
    throw new Error("batch_modify_cluster_snapshots not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_modify_cluster_snapshots failed");
  }
}

/** Cancel resize. */
export async function cancelResize(clusterIdentifier: string, regionName?: string): Promise<CancelResizeResult> {
  try {
    // TODO: implement cancel_resize
    throw new Error("cancel_resize not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "cancel_resize failed");
  }
}

/** Copy cluster snapshot. */
export async function copyClusterSnapshot(sourceSnapshotIdentifier: string, targetSnapshotIdentifier: string): Promise<CopyClusterSnapshotResult> {
  try {
    // TODO: implement copy_cluster_snapshot
    throw new Error("copy_cluster_snapshot not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "copy_cluster_snapshot failed");
  }
}

/** Create authentication profile. */
export async function createAuthenticationProfile(authenticationProfileName: string, authenticationProfileContent: string, regionName?: string): Promise<CreateAuthenticationProfileResult> {
  try {
    // TODO: implement create_authentication_profile
    throw new Error("create_authentication_profile not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_authentication_profile failed");
  }
}

/** Create cluster security group. */
export async function createClusterSecurityGroup(clusterSecurityGroupName: string, description: string): Promise<CreateClusterSecurityGroupResult> {
  try {
    // TODO: implement create_cluster_security_group
    throw new Error("create_cluster_security_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_cluster_security_group failed");
  }
}

/** Create custom domain association. */
export async function createCustomDomainAssociation(customDomainName: string, customDomainCertificateArn: string, clusterIdentifier: string, regionName?: string): Promise<CreateCustomDomainAssociationResult> {
  try {
    // TODO: implement create_custom_domain_association
    throw new Error("create_custom_domain_association not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_custom_domain_association failed");
  }
}

/** Create endpoint access. */
export async function createEndpointAccess(endpointName: string, subnetGroupName: string): Promise<CreateEndpointAccessResult> {
  try {
    // TODO: implement create_endpoint_access
    throw new Error("create_endpoint_access not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_endpoint_access failed");
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

/** Create hsm client certificate. */
export async function createHsmClientCertificate(hsmClientCertificateIdentifier: string): Promise<CreateHsmClientCertificateResult> {
  try {
    // TODO: implement create_hsm_client_certificate
    throw new Error("create_hsm_client_certificate not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_hsm_client_certificate failed");
  }
}

/** Create hsm configuration. */
export async function createHsmConfiguration(hsmConfigurationIdentifier: string, description: string, hsmIpAddress: string, hsmPartitionName: string, hsmPartitionPassword: string, hsmServerPublicCertificate: string): Promise<CreateHsmConfigurationResult> {
  try {
    // TODO: implement create_hsm_configuration
    throw new Error("create_hsm_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_hsm_configuration failed");
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

/** Create redshift idc application. */
export async function createRedshiftIdcApplication(idcInstanceArn: string, redshiftIdcApplicationName: string, idcDisplayName: string, iamRoleArn: string): Promise<CreateRedshiftIdcApplicationResult> {
  try {
    // TODO: implement create_redshift_idc_application
    throw new Error("create_redshift_idc_application not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_redshift_idc_application failed");
  }
}

/** Create scheduled action. */
export async function createScheduledAction(scheduledActionName: string, targetAction: Record<string, unknown>, schedule: string, iamRole: string): Promise<CreateScheduledActionResult> {
  try {
    // TODO: implement create_scheduled_action
    throw new Error("create_scheduled_action not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_scheduled_action failed");
  }
}

/** Create snapshot copy grant. */
export async function createSnapshotCopyGrant(snapshotCopyGrantName: string): Promise<CreateSnapshotCopyGrantResult> {
  try {
    // TODO: implement create_snapshot_copy_grant
    throw new Error("create_snapshot_copy_grant not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_snapshot_copy_grant failed");
  }
}

/** Create snapshot schedule. */
export async function createSnapshotSchedule(): Promise<CreateSnapshotScheduleResult> {
  try {
    // TODO: implement create_snapshot_schedule
    throw new Error("create_snapshot_schedule not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_snapshot_schedule failed");
  }
}

/** Create tags. */
export async function createTags(resourceName: string, tags: Record<string, unknown>[], regionName?: string): Promise<void> {
  try {
    // TODO: implement create_tags
    throw new Error("create_tags not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_tags failed");
  }
}

/** Create usage limit. */
export async function createUsageLimit(clusterIdentifier: string, featureType: string, limitType: string, amount: number): Promise<CreateUsageLimitResult> {
  try {
    // TODO: implement create_usage_limit
    throw new Error("create_usage_limit not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_usage_limit failed");
  }
}

/** Deauthorize data share. */
export async function deauthorizeDataShare(dataShareArn: string, consumerIdentifier: string, regionName?: string): Promise<DeauthorizeDataShareResult> {
  try {
    // TODO: implement deauthorize_data_share
    throw new Error("deauthorize_data_share not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "deauthorize_data_share failed");
  }
}

/** Delete authentication profile. */
export async function deleteAuthenticationProfile(authenticationProfileName: string, regionName?: string): Promise<DeleteAuthenticationProfileResult> {
  try {
    // TODO: implement delete_authentication_profile
    throw new Error("delete_authentication_profile not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_authentication_profile failed");
  }
}

/** Delete cluster parameter group. */
export async function deleteClusterParameterGroup(parameterGroupName: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_cluster_parameter_group
    throw new Error("delete_cluster_parameter_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_cluster_parameter_group failed");
  }
}

/** Delete cluster security group. */
export async function deleteClusterSecurityGroup(clusterSecurityGroupName: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_cluster_security_group
    throw new Error("delete_cluster_security_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_cluster_security_group failed");
  }
}

/** Delete cluster subnet group. */
export async function deleteClusterSubnetGroup(clusterSubnetGroupName: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_cluster_subnet_group
    throw new Error("delete_cluster_subnet_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_cluster_subnet_group failed");
  }
}

/** Delete custom domain association. */
export async function deleteCustomDomainAssociation(clusterIdentifier: string, customDomainName: string, regionName?: string): Promise<void> {
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

/** Delete event subscription. */
export async function deleteEventSubscription(subscriptionName: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_event_subscription
    throw new Error("delete_event_subscription not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_event_subscription failed");
  }
}

/** Delete hsm client certificate. */
export async function deleteHsmClientCertificate(hsmClientCertificateIdentifier: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_hsm_client_certificate
    throw new Error("delete_hsm_client_certificate not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_hsm_client_certificate failed");
  }
}

/** Delete hsm configuration. */
export async function deleteHsmConfiguration(hsmConfigurationIdentifier: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_hsm_configuration
    throw new Error("delete_hsm_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_hsm_configuration failed");
  }
}

/** Delete integration. */
export async function deleteIntegration(integrationArn: string, regionName?: string): Promise<DeleteIntegrationResult> {
  try {
    // TODO: implement delete_integration
    throw new Error("delete_integration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_integration failed");
  }
}

/** Delete partner. */
export async function deletePartner(accountId: string, clusterIdentifier: string, databaseName: string, partnerName: string, regionName?: string): Promise<DeletePartnerResult> {
  try {
    // TODO: implement delete_partner
    throw new Error("delete_partner not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_partner failed");
  }
}

/** Delete redshift idc application. */
export async function deleteRedshiftIdcApplication(redshiftIdcApplicationArn: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_redshift_idc_application
    throw new Error("delete_redshift_idc_application not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_redshift_idc_application failed");
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
export async function deleteScheduledAction(scheduledActionName: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_scheduled_action
    throw new Error("delete_scheduled_action not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_scheduled_action failed");
  }
}

/** Delete snapshot copy grant. */
export async function deleteSnapshotCopyGrant(snapshotCopyGrantName: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_snapshot_copy_grant
    throw new Error("delete_snapshot_copy_grant not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_snapshot_copy_grant failed");
  }
}

/** Delete snapshot schedule. */
export async function deleteSnapshotSchedule(scheduleIdentifier: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_snapshot_schedule
    throw new Error("delete_snapshot_schedule not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_snapshot_schedule failed");
  }
}

/** Delete tags. */
export async function deleteTags(resourceName: string, tagKeys: string[], regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_tags
    throw new Error("delete_tags not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_tags failed");
  }
}

/** Delete usage limit. */
export async function deleteUsageLimit(usageLimitId: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_usage_limit
    throw new Error("delete_usage_limit not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_usage_limit failed");
  }
}

/** Deregister namespace. */
export async function deregisterNamespace(namespaceIdentifier: Record<string, unknown>, consumerIdentifiers: string[], regionName?: string): Promise<DeregisterNamespaceResult> {
  try {
    // TODO: implement deregister_namespace
    throw new Error("deregister_namespace not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "deregister_namespace failed");
  }
}

/** Describe account attributes. */
export async function describeAccountAttributes(): Promise<DescribeAccountAttributesResult> {
  try {
    // TODO: implement describe_account_attributes
    throw new Error("describe_account_attributes not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_account_attributes failed");
  }
}

/** Describe authentication profiles. */
export async function describeAuthenticationProfiles(): Promise<DescribeAuthenticationProfilesResult> {
  try {
    // TODO: implement describe_authentication_profiles
    throw new Error("describe_authentication_profiles not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_authentication_profiles failed");
  }
}

/** Describe cluster db revisions. */
export async function describeClusterDbRevisions(): Promise<DescribeClusterDbRevisionsResult> {
  try {
    // TODO: implement describe_cluster_db_revisions
    throw new Error("describe_cluster_db_revisions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_cluster_db_revisions failed");
  }
}

/** Describe cluster parameter groups. */
export async function describeClusterParameterGroups(): Promise<DescribeClusterParameterGroupsResult> {
  try {
    // TODO: implement describe_cluster_parameter_groups
    throw new Error("describe_cluster_parameter_groups not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_cluster_parameter_groups failed");
  }
}

/** Describe cluster parameters. */
export async function describeClusterParameters(parameterGroupName: string): Promise<DescribeClusterParametersResult> {
  try {
    // TODO: implement describe_cluster_parameters
    throw new Error("describe_cluster_parameters not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_cluster_parameters failed");
  }
}

/** Describe cluster security groups. */
export async function describeClusterSecurityGroups(): Promise<DescribeClusterSecurityGroupsResult> {
  try {
    // TODO: implement describe_cluster_security_groups
    throw new Error("describe_cluster_security_groups not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_cluster_security_groups failed");
  }
}

/** Describe cluster subnet groups. */
export async function describeClusterSubnetGroups(): Promise<DescribeClusterSubnetGroupsResult> {
  try {
    // TODO: implement describe_cluster_subnet_groups
    throw new Error("describe_cluster_subnet_groups not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_cluster_subnet_groups failed");
  }
}

/** Describe cluster tracks. */
export async function describeClusterTracks(): Promise<DescribeClusterTracksResult> {
  try {
    // TODO: implement describe_cluster_tracks
    throw new Error("describe_cluster_tracks not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_cluster_tracks failed");
  }
}

/** Describe cluster versions. */
export async function describeClusterVersions(): Promise<DescribeClusterVersionsResult> {
  try {
    // TODO: implement describe_cluster_versions
    throw new Error("describe_cluster_versions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_cluster_versions failed");
  }
}

/** Describe custom domain associations. */
export async function describeCustomDomainAssociations(): Promise<DescribeCustomDomainAssociationsResult> {
  try {
    // TODO: implement describe_custom_domain_associations
    throw new Error("describe_custom_domain_associations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_custom_domain_associations failed");
  }
}

/** Describe data shares. */
export async function describeDataShares(): Promise<DescribeDataSharesResult> {
  try {
    // TODO: implement describe_data_shares
    throw new Error("describe_data_shares not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_data_shares failed");
  }
}

/** Describe data shares for consumer. */
export async function describeDataSharesForConsumer(): Promise<DescribeDataSharesForConsumerResult> {
  try {
    // TODO: implement describe_data_shares_for_consumer
    throw new Error("describe_data_shares_for_consumer not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_data_shares_for_consumer failed");
  }
}

/** Describe data shares for producer. */
export async function describeDataSharesForProducer(): Promise<DescribeDataSharesForProducerResult> {
  try {
    // TODO: implement describe_data_shares_for_producer
    throw new Error("describe_data_shares_for_producer not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_data_shares_for_producer failed");
  }
}

/** Describe default cluster parameters. */
export async function describeDefaultClusterParameters(parameterGroupFamily: string): Promise<DescribeDefaultClusterParametersResult> {
  try {
    // TODO: implement describe_default_cluster_parameters
    throw new Error("describe_default_cluster_parameters not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_default_cluster_parameters failed");
  }
}

/** Describe endpoint access. */
export async function describeEndpointAccess(): Promise<DescribeEndpointAccessResult> {
  try {
    // TODO: implement describe_endpoint_access
    throw new Error("describe_endpoint_access not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_endpoint_access failed");
  }
}

/** Describe endpoint authorization. */
export async function describeEndpointAuthorization(): Promise<DescribeEndpointAuthorizationResult> {
  try {
    // TODO: implement describe_endpoint_authorization
    throw new Error("describe_endpoint_authorization not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_endpoint_authorization failed");
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

/** Describe hsm client certificates. */
export async function describeHsmClientCertificates(): Promise<DescribeHsmClientCertificatesResult> {
  try {
    // TODO: implement describe_hsm_client_certificates
    throw new Error("describe_hsm_client_certificates not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_hsm_client_certificates failed");
  }
}

/** Describe hsm configurations. */
export async function describeHsmConfigurations(): Promise<DescribeHsmConfigurationsResult> {
  try {
    // TODO: implement describe_hsm_configurations
    throw new Error("describe_hsm_configurations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_hsm_configurations failed");
  }
}

/** Describe inbound integrations. */
export async function describeInboundIntegrations(): Promise<DescribeInboundIntegrationsResult> {
  try {
    // TODO: implement describe_inbound_integrations
    throw new Error("describe_inbound_integrations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_inbound_integrations failed");
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

/** Describe node configuration options. */
export async function describeNodeConfigurationOptions(actionType: string): Promise<DescribeNodeConfigurationOptionsResult> {
  try {
    // TODO: implement describe_node_configuration_options
    throw new Error("describe_node_configuration_options not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_node_configuration_options failed");
  }
}

/** Describe orderable cluster options. */
export async function describeOrderableClusterOptions(): Promise<DescribeOrderableClusterOptionsResult> {
  try {
    // TODO: implement describe_orderable_cluster_options
    throw new Error("describe_orderable_cluster_options not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_orderable_cluster_options failed");
  }
}

/** Describe partners. */
export async function describePartners(accountId: string, clusterIdentifier: string): Promise<DescribePartnersResult> {
  try {
    // TODO: implement describe_partners
    throw new Error("describe_partners not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_partners failed");
  }
}

/** Describe redshift idc applications. */
export async function describeRedshiftIdcApplications(): Promise<DescribeRedshiftIdcApplicationsResult> {
  try {
    // TODO: implement describe_redshift_idc_applications
    throw new Error("describe_redshift_idc_applications not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_redshift_idc_applications failed");
  }
}

/** Describe reserved node exchange status. */
export async function describeReservedNodeExchangeStatus(): Promise<DescribeReservedNodeExchangeStatusResult> {
  try {
    // TODO: implement describe_reserved_node_exchange_status
    throw new Error("describe_reserved_node_exchange_status not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_reserved_node_exchange_status failed");
  }
}

/** Describe reserved node offerings. */
export async function describeReservedNodeOfferings(): Promise<DescribeReservedNodeOfferingsResult> {
  try {
    // TODO: implement describe_reserved_node_offerings
    throw new Error("describe_reserved_node_offerings not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_reserved_node_offerings failed");
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

/** Describe resize. */
export async function describeResize(clusterIdentifier: string, regionName?: string): Promise<DescribeResizeResult> {
  try {
    // TODO: implement describe_resize
    throw new Error("describe_resize not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_resize failed");
  }
}

/** Describe scheduled actions. */
export async function describeScheduledActions(): Promise<DescribeScheduledActionsResult> {
  try {
    // TODO: implement describe_scheduled_actions
    throw new Error("describe_scheduled_actions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_scheduled_actions failed");
  }
}

/** Describe snapshot copy grants. */
export async function describeSnapshotCopyGrants(): Promise<DescribeSnapshotCopyGrantsResult> {
  try {
    // TODO: implement describe_snapshot_copy_grants
    throw new Error("describe_snapshot_copy_grants not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_snapshot_copy_grants failed");
  }
}

/** Describe snapshot schedules. */
export async function describeSnapshotSchedules(): Promise<DescribeSnapshotSchedulesResult> {
  try {
    // TODO: implement describe_snapshot_schedules
    throw new Error("describe_snapshot_schedules not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_snapshot_schedules failed");
  }
}

/** Describe storage. */
export async function describeStorage(regionName?: string): Promise<DescribeStorageResult> {
  try {
    // TODO: implement describe_storage
    throw new Error("describe_storage not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_storage failed");
  }
}

/** Describe table restore status. */
export async function describeTableRestoreStatus(): Promise<DescribeTableRestoreStatusResult> {
  try {
    // TODO: implement describe_table_restore_status
    throw new Error("describe_table_restore_status not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_table_restore_status failed");
  }
}

/** Describe tags. */
export async function describeTags(): Promise<DescribeTagsResult> {
  try {
    // TODO: implement describe_tags
    throw new Error("describe_tags not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_tags failed");
  }
}

/** Describe usage limits. */
export async function describeUsageLimits(): Promise<DescribeUsageLimitsResult> {
  try {
    // TODO: implement describe_usage_limits
    throw new Error("describe_usage_limits not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_usage_limits failed");
  }
}

/** Disable snapshot copy. */
export async function disableSnapshotCopy(clusterIdentifier: string, regionName?: string): Promise<DisableSnapshotCopyResult> {
  try {
    // TODO: implement disable_snapshot_copy
    throw new Error("disable_snapshot_copy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disable_snapshot_copy failed");
  }
}

/** Disassociate data share consumer. */
export async function disassociateDataShareConsumer(dataShareArn: string): Promise<DisassociateDataShareConsumerResult> {
  try {
    // TODO: implement disassociate_data_share_consumer
    throw new Error("disassociate_data_share_consumer not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disassociate_data_share_consumer failed");
  }
}

/** Enable snapshot copy. */
export async function enableSnapshotCopy(clusterIdentifier: string, destinationRegion: string): Promise<EnableSnapshotCopyResult> {
  try {
    // TODO: implement enable_snapshot_copy
    throw new Error("enable_snapshot_copy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "enable_snapshot_copy failed");
  }
}

/** Failover primary compute. */
export async function failoverPrimaryCompute(clusterIdentifier: string, regionName?: string): Promise<FailoverPrimaryComputeResult> {
  try {
    // TODO: implement failover_primary_compute
    throw new Error("failover_primary_compute not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "failover_primary_compute failed");
  }
}

/** Get cluster credentials. */
export async function getClusterCredentials(dbUser: string): Promise<GetClusterCredentialsResult> {
  try {
    // TODO: implement get_cluster_credentials
    throw new Error("get_cluster_credentials not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_cluster_credentials failed");
  }
}

/** Get cluster credentials with iam. */
export async function getClusterCredentialsWithIam(): Promise<GetClusterCredentialsWithIamResult> {
  try {
    // TODO: implement get_cluster_credentials_with_iam
    throw new Error("get_cluster_credentials_with_iam not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_cluster_credentials_with_iam failed");
  }
}

/** Get identity center auth token. */
export async function getIdentityCenterAuthToken(clusterIds: string[], regionName?: string): Promise<GetIdentityCenterAuthTokenResult> {
  try {
    // TODO: implement get_identity_center_auth_token
    throw new Error("get_identity_center_auth_token not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_identity_center_auth_token failed");
  }
}

/** Get reserved node exchange configuration options. */
export async function getReservedNodeExchangeConfigurationOptions(actionType: string): Promise<GetReservedNodeExchangeConfigurationOptionsResult> {
  try {
    // TODO: implement get_reserved_node_exchange_configuration_options
    throw new Error("get_reserved_node_exchange_configuration_options not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_reserved_node_exchange_configuration_options failed");
  }
}

/** Get reserved node exchange offerings. */
export async function getReservedNodeExchangeOfferings(reservedNodeId: string): Promise<GetReservedNodeExchangeOfferingsResult> {
  try {
    // TODO: implement get_reserved_node_exchange_offerings
    throw new Error("get_reserved_node_exchange_offerings not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_reserved_node_exchange_offerings failed");
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

/** List recommendations. */
export async function listRecommendations(): Promise<ListRecommendationsResult> {
  try {
    // TODO: implement list_recommendations
    throw new Error("list_recommendations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_recommendations failed");
  }
}

/** Modify aqua configuration. */
export async function modifyAquaConfiguration(clusterIdentifier: string): Promise<ModifyAquaConfigurationResult> {
  try {
    // TODO: implement modify_aqua_configuration
    throw new Error("modify_aqua_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_aqua_configuration failed");
  }
}

/** Modify authentication profile. */
export async function modifyAuthenticationProfile(authenticationProfileName: string, authenticationProfileContent: string, regionName?: string): Promise<ModifyAuthenticationProfileResult> {
  try {
    // TODO: implement modify_authentication_profile
    throw new Error("modify_authentication_profile not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_authentication_profile failed");
  }
}

/** Modify cluster db revision. */
export async function modifyClusterDbRevision(clusterIdentifier: string, revisionTarget: string, regionName?: string): Promise<ModifyClusterDbRevisionResult> {
  try {
    // TODO: implement modify_cluster_db_revision
    throw new Error("modify_cluster_db_revision not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_cluster_db_revision failed");
  }
}

/** Modify cluster iam roles. */
export async function modifyClusterIamRoles(clusterIdentifier: string): Promise<ModifyClusterIamRolesResult> {
  try {
    // TODO: implement modify_cluster_iam_roles
    throw new Error("modify_cluster_iam_roles not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_cluster_iam_roles failed");
  }
}

/** Modify cluster maintenance. */
export async function modifyClusterMaintenance(clusterIdentifier: string): Promise<ModifyClusterMaintenanceResult> {
  try {
    // TODO: implement modify_cluster_maintenance
    throw new Error("modify_cluster_maintenance not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_cluster_maintenance failed");
  }
}

/** Modify cluster parameter group. */
export async function modifyClusterParameterGroup(parameterGroupName: string, parameters: Record<string, unknown>[], regionName?: string): Promise<ModifyClusterParameterGroupResult> {
  try {
    // TODO: implement modify_cluster_parameter_group
    throw new Error("modify_cluster_parameter_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_cluster_parameter_group failed");
  }
}

/** Modify cluster snapshot. */
export async function modifyClusterSnapshot(snapshotIdentifier: string): Promise<ModifyClusterSnapshotResult> {
  try {
    // TODO: implement modify_cluster_snapshot
    throw new Error("modify_cluster_snapshot not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_cluster_snapshot failed");
  }
}

/** Modify cluster snapshot schedule. */
export async function modifyClusterSnapshotSchedule(clusterIdentifier: string): Promise<void> {
  try {
    // TODO: implement modify_cluster_snapshot_schedule
    throw new Error("modify_cluster_snapshot_schedule not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_cluster_snapshot_schedule failed");
  }
}

/** Modify cluster subnet group. */
export async function modifyClusterSubnetGroup(clusterSubnetGroupName: string, subnetIds: string[]): Promise<ModifyClusterSubnetGroupResult> {
  try {
    // TODO: implement modify_cluster_subnet_group
    throw new Error("modify_cluster_subnet_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_cluster_subnet_group failed");
  }
}

/** Modify custom domain association. */
export async function modifyCustomDomainAssociation(customDomainName: string, customDomainCertificateArn: string, clusterIdentifier: string, regionName?: string): Promise<ModifyCustomDomainAssociationResult> {
  try {
    // TODO: implement modify_custom_domain_association
    throw new Error("modify_custom_domain_association not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_custom_domain_association failed");
  }
}

/** Modify endpoint access. */
export async function modifyEndpointAccess(endpointName: string): Promise<ModifyEndpointAccessResult> {
  try {
    // TODO: implement modify_endpoint_access
    throw new Error("modify_endpoint_access not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_endpoint_access failed");
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

/** Modify integration. */
export async function modifyIntegration(integrationArn: string): Promise<ModifyIntegrationResult> {
  try {
    // TODO: implement modify_integration
    throw new Error("modify_integration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_integration failed");
  }
}

/** Modify redshift idc application. */
export async function modifyRedshiftIdcApplication(redshiftIdcApplicationArn: string): Promise<ModifyRedshiftIdcApplicationResult> {
  try {
    // TODO: implement modify_redshift_idc_application
    throw new Error("modify_redshift_idc_application not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_redshift_idc_application failed");
  }
}

/** Modify scheduled action. */
export async function modifyScheduledAction(scheduledActionName: string): Promise<ModifyScheduledActionResult> {
  try {
    // TODO: implement modify_scheduled_action
    throw new Error("modify_scheduled_action not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_scheduled_action failed");
  }
}

/** Modify snapshot copy retention period. */
export async function modifySnapshotCopyRetentionPeriod(clusterIdentifier: string, retentionPeriod: number): Promise<ModifySnapshotCopyRetentionPeriodResult> {
  try {
    // TODO: implement modify_snapshot_copy_retention_period
    throw new Error("modify_snapshot_copy_retention_period not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_snapshot_copy_retention_period failed");
  }
}

/** Modify snapshot schedule. */
export async function modifySnapshotSchedule(scheduleIdentifier: string, scheduleDefinitions: string[], regionName?: string): Promise<ModifySnapshotScheduleResult> {
  try {
    // TODO: implement modify_snapshot_schedule
    throw new Error("modify_snapshot_schedule not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_snapshot_schedule failed");
  }
}

/** Modify usage limit. */
export async function modifyUsageLimit(usageLimitId: string): Promise<ModifyUsageLimitResult> {
  try {
    // TODO: implement modify_usage_limit
    throw new Error("modify_usage_limit not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_usage_limit failed");
  }
}

/** Pause cluster. */
export async function pauseCluster(clusterIdentifier: string, regionName?: string): Promise<PauseClusterResult> {
  try {
    // TODO: implement pause_cluster
    throw new Error("pause_cluster not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "pause_cluster failed");
  }
}

/** Purchase reserved node offering. */
export async function purchaseReservedNodeOffering(reservedNodeOfferingId: string): Promise<PurchaseReservedNodeOfferingResult> {
  try {
    // TODO: implement purchase_reserved_node_offering
    throw new Error("purchase_reserved_node_offering not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "purchase_reserved_node_offering failed");
  }
}

/** Put resource policy. */
export async function putResourcePolicy(resourceArn: string, policy: string, regionName?: string): Promise<PutResourcePolicyResult> {
  try {
    // TODO: implement put_resource_policy
    throw new Error("put_resource_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_resource_policy failed");
  }
}

/** Register namespace. */
export async function registerNamespace(namespaceIdentifier: Record<string, unknown>, consumerIdentifiers: string[], regionName?: string): Promise<RegisterNamespaceResult> {
  try {
    // TODO: implement register_namespace
    throw new Error("register_namespace not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "register_namespace failed");
  }
}

/** Reject data share. */
export async function rejectDataShare(dataShareArn: string, regionName?: string): Promise<RejectDataShareResult> {
  try {
    // TODO: implement reject_data_share
    throw new Error("reject_data_share not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "reject_data_share failed");
  }
}

/** Reset cluster parameter group. */
export async function resetClusterParameterGroup(parameterGroupName: string): Promise<ResetClusterParameterGroupResult> {
  try {
    // TODO: implement reset_cluster_parameter_group
    throw new Error("reset_cluster_parameter_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "reset_cluster_parameter_group failed");
  }
}

/** Resize cluster. */
export async function resizeCluster(clusterIdentifier: string): Promise<ResizeClusterResult> {
  try {
    // TODO: implement resize_cluster
    throw new Error("resize_cluster not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "resize_cluster failed");
  }
}

/** Restore table from cluster snapshot. */
export async function restoreTableFromClusterSnapshot(clusterIdentifier: string, snapshotIdentifier: string, sourceDatabaseName: string, sourceTableName: string, newTableName: string): Promise<RestoreTableFromClusterSnapshotResult> {
  try {
    // TODO: implement restore_table_from_cluster_snapshot
    throw new Error("restore_table_from_cluster_snapshot not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "restore_table_from_cluster_snapshot failed");
  }
}

/** Resume cluster. */
export async function resumeCluster(clusterIdentifier: string, regionName?: string): Promise<ResumeClusterResult> {
  try {
    // TODO: implement resume_cluster
    throw new Error("resume_cluster not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "resume_cluster failed");
  }
}

/** Revoke cluster security group ingress. */
export async function revokeClusterSecurityGroupIngress(clusterSecurityGroupName: string): Promise<RevokeClusterSecurityGroupIngressResult> {
  try {
    // TODO: implement revoke_cluster_security_group_ingress
    throw new Error("revoke_cluster_security_group_ingress not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "revoke_cluster_security_group_ingress failed");
  }
}

/** Revoke endpoint access. */
export async function revokeEndpointAccess(): Promise<RevokeEndpointAccessResult> {
  try {
    // TODO: implement revoke_endpoint_access
    throw new Error("revoke_endpoint_access not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "revoke_endpoint_access failed");
  }
}

/** Revoke snapshot access. */
export async function revokeSnapshotAccess(accountWithRestoreAccess: string): Promise<RevokeSnapshotAccessResult> {
  try {
    // TODO: implement revoke_snapshot_access
    throw new Error("revoke_snapshot_access not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "revoke_snapshot_access failed");
  }
}

/** Rotate encryption key. */
export async function rotateEncryptionKey(clusterIdentifier: string, regionName?: string): Promise<RotateEncryptionKeyResult> {
  try {
    // TODO: implement rotate_encryption_key
    throw new Error("rotate_encryption_key not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "rotate_encryption_key failed");
  }
}

/** Update partner status. */
export async function updatePartnerStatus(accountId: string, clusterIdentifier: string, databaseName: string, partnerName: string, status: string): Promise<UpdatePartnerStatusResult> {
  try {
    // TODO: implement update_partner_status
    throw new Error("update_partner_status not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_partner_status failed");
  }
}
