import { LightsailClient } from "@aws-sdk/client-lightsail";
import { getClient } from "./client";
import { wrapAwsError } from "./exceptions";

/** Metadata for a Lightsail instance. */
export type InstanceResult = {
  name: string;
  arn?: string;
  state?: string;
  blueprintId?: string;
  bundleId?: string;
  publicIpAddress?: string;
  privateIpAddress?: string;
  regionName?: string;
  extra?: Record<string, unknown>;
};

/** Metadata for a Lightsail instance snapshot. */
export type SnapshotResult = {
  name: string;
  arn?: string;
  state?: string;
  fromInstanceName?: string;
  createdAt?: string;
  extra?: Record<string, unknown>;
};

/** Metadata for a Lightsail managed database. */
export type DatabaseResult = {
  name: string;
  arn?: string;
  state?: string;
  engine?: string;
  engineVersion?: string;
  masterUsername?: string;
  masterEndpoint?: Record<string, unknown>;
  extra?: Record<string, unknown>;
};

/** Metadata for a Lightsail static IP. */
export type StaticIpResult = {
  name: string;
  arn?: string;
  ipAddress?: string;
  isAttached?: boolean;
  attachedTo?: string;
  state?: string;
  extra?: Record<string, unknown>;
};

/** Result of attach_certificate_to_distribution. */
export type AttachCertificateToDistributionResult = {
  operation?: Record<string, unknown>;
};

/** Result of attach_disk. */
export type AttachDiskResult = {
  operations?: Record<string, unknown>[];
};

/** Result of attach_instances_to_load_balancer. */
export type AttachInstancesToLoadBalancerResult = {
  operations?: Record<string, unknown>[];
};

/** Result of attach_load_balancer_tls_certificate. */
export type AttachLoadBalancerTlsCertificateResult = {
  operations?: Record<string, unknown>[];
};

/** Result of attach_static_ip. */
export type AttachStaticIpResult = {
  operations?: Record<string, unknown>[];
};

/** Result of close_instance_public_ports. */
export type CloseInstancePublicPortsResult = {
  operation?: Record<string, unknown>;
};

/** Result of copy_snapshot. */
export type CopySnapshotResult = {
  operations?: Record<string, unknown>[];
};

/** Result of create_bucket. */
export type CreateBucketResult = {
  bucket?: Record<string, unknown>;
  operations?: Record<string, unknown>[];
};

/** Result of create_bucket_access_key. */
export type CreateBucketAccessKeyResult = {
  accessKey?: Record<string, unknown>;
  operations?: Record<string, unknown>[];
};

/** Result of create_certificate. */
export type CreateCertificateResult = {
  certificate?: Record<string, unknown>;
  operations?: Record<string, unknown>[];
};

/** Result of create_cloud_formation_stack. */
export type CreateCloudFormationStackResult = {
  operations?: Record<string, unknown>[];
};

/** Result of create_contact_method. */
export type CreateContactMethodResult = {
  operations?: Record<string, unknown>[];
};

/** Result of create_container_service. */
export type CreateContainerServiceResult = {
  containerService?: Record<string, unknown>;
};

/** Result of create_container_service_deployment. */
export type CreateContainerServiceDeploymentResult = {
  containerService?: Record<string, unknown>;
};

/** Result of create_container_service_registry_login. */
export type CreateContainerServiceRegistryLoginResult = {
  registryLogin?: Record<string, unknown>;
};

/** Result of create_disk. */
export type CreateDiskResult = {
  operations?: Record<string, unknown>[];
};

/** Result of create_disk_from_snapshot. */
export type CreateDiskFromSnapshotResult = {
  operations?: Record<string, unknown>[];
};

/** Result of create_disk_snapshot. */
export type CreateDiskSnapshotResult = {
  operations?: Record<string, unknown>[];
};

/** Result of create_distribution. */
export type CreateDistributionResult = {
  distribution?: Record<string, unknown>;
  operation?: Record<string, unknown>;
};

/** Result of create_domain. */
export type CreateDomainResult = {
  operation?: Record<string, unknown>;
};

/** Result of create_domain_entry. */
export type CreateDomainEntryResult = {
  operation?: Record<string, unknown>;
};

/** Result of create_gui_session_access_details. */
export type CreateGuiSessionAccessDetailsResult = {
  resourceName?: string;
  status?: string;
  percentageComplete?: number;
  failureReason?: string;
  sessions?: Record<string, unknown>[];
};

/** Result of create_instances_from_snapshot. */
export type CreateInstancesFromSnapshotResult = {
  operations?: Record<string, unknown>[];
};

/** Result of create_key_pair. */
export type CreateKeyPairResult = {
  keyPair?: Record<string, unknown>;
  publicKeyBase64?: string;
  privateKeyBase64?: string;
  operation?: Record<string, unknown>;
};

/** Result of create_load_balancer. */
export type CreateLoadBalancerResult = {
  operations?: Record<string, unknown>[];
};

/** Result of create_load_balancer_tls_certificate. */
export type CreateLoadBalancerTlsCertificateResult = {
  operations?: Record<string, unknown>[];
};

/** Result of create_relational_database. */
export type CreateRelationalDatabaseResult = {
  operations?: Record<string, unknown>[];
};

/** Result of create_relational_database_from_snapshot. */
export type CreateRelationalDatabaseFromSnapshotResult = {
  operations?: Record<string, unknown>[];
};

/** Result of create_relational_database_snapshot. */
export type CreateRelationalDatabaseSnapshotResult = {
  operations?: Record<string, unknown>[];
};

/** Result of delete_alarm. */
export type DeleteAlarmResult = {
  operations?: Record<string, unknown>[];
};

/** Result of delete_auto_snapshot. */
export type DeleteAutoSnapshotResult = {
  operations?: Record<string, unknown>[];
};

/** Result of delete_bucket. */
export type DeleteBucketResult = {
  operations?: Record<string, unknown>[];
};

/** Result of delete_bucket_access_key. */
export type DeleteBucketAccessKeyResult = {
  operations?: Record<string, unknown>[];
};

/** Result of delete_certificate. */
export type DeleteCertificateResult = {
  operations?: Record<string, unknown>[];
};

/** Result of delete_contact_method. */
export type DeleteContactMethodResult = {
  operations?: Record<string, unknown>[];
};

/** Result of delete_disk. */
export type DeleteDiskResult = {
  operations?: Record<string, unknown>[];
};

/** Result of delete_disk_snapshot. */
export type DeleteDiskSnapshotResult = {
  operations?: Record<string, unknown>[];
};

/** Result of delete_distribution. */
export type DeleteDistributionResult = {
  operation?: Record<string, unknown>;
};

/** Result of delete_domain. */
export type DeleteDomainResult = {
  operation?: Record<string, unknown>;
};

/** Result of delete_domain_entry. */
export type DeleteDomainEntryResult = {
  operation?: Record<string, unknown>;
};

/** Result of delete_key_pair. */
export type DeleteKeyPairResult = {
  operation?: Record<string, unknown>;
};

/** Result of delete_known_host_keys. */
export type DeleteKnownHostKeysResult = {
  operations?: Record<string, unknown>[];
};

/** Result of delete_load_balancer. */
export type DeleteLoadBalancerResult = {
  operations?: Record<string, unknown>[];
};

/** Result of delete_load_balancer_tls_certificate. */
export type DeleteLoadBalancerTlsCertificateResult = {
  operations?: Record<string, unknown>[];
};

/** Result of delete_relational_database. */
export type DeleteRelationalDatabaseResult = {
  operations?: Record<string, unknown>[];
};

/** Result of delete_relational_database_snapshot. */
export type DeleteRelationalDatabaseSnapshotResult = {
  operations?: Record<string, unknown>[];
};

/** Result of detach_certificate_from_distribution. */
export type DetachCertificateFromDistributionResult = {
  operation?: Record<string, unknown>;
};

/** Result of detach_disk. */
export type DetachDiskResult = {
  operations?: Record<string, unknown>[];
};

/** Result of detach_instances_from_load_balancer. */
export type DetachInstancesFromLoadBalancerResult = {
  operations?: Record<string, unknown>[];
};

/** Result of detach_static_ip. */
export type DetachStaticIpResult = {
  operations?: Record<string, unknown>[];
};

/** Result of disable_add_on. */
export type DisableAddOnResult = {
  operations?: Record<string, unknown>[];
};

/** Result of download_default_key_pair. */
export type DownloadDefaultKeyPairResult = {
  publicKeyBase64?: string;
  privateKeyBase64?: string;
  createdAt?: string;
};

/** Result of enable_add_on. */
export type EnableAddOnResult = {
  operations?: Record<string, unknown>[];
};

/** Result of export_snapshot. */
export type ExportSnapshotResult = {
  operations?: Record<string, unknown>[];
};

/** Result of get_active_names. */
export type GetActiveNamesResult = {
  activeNames?: string[];
  nextPageToken?: string;
};

/** Result of get_alarms. */
export type GetAlarmsResult = {
  alarms?: Record<string, unknown>[];
  nextPageToken?: string;
};

/** Result of get_auto_snapshots. */
export type GetAutoSnapshotsResult = {
  resourceName?: string;
  resourceType?: string;
  autoSnapshots?: Record<string, unknown>[];
};

/** Result of get_blueprints. */
export type GetBlueprintsResult = {
  blueprints?: Record<string, unknown>[];
  nextPageToken?: string;
};

/** Result of get_bucket_access_keys. */
export type GetBucketAccessKeysResult = {
  accessKeys?: Record<string, unknown>[];
};

/** Result of get_bucket_bundles. */
export type GetBucketBundlesResult = {
  bundles?: Record<string, unknown>[];
};

/** Result of get_bucket_metric_data. */
export type GetBucketMetricDataResult = {
  metricName?: string;
  metricData?: Record<string, unknown>[];
};

/** Result of get_buckets. */
export type GetBucketsResult = {
  buckets?: Record<string, unknown>[];
  nextPageToken?: string;
  accountLevelBpaSync?: Record<string, unknown>;
};

/** Result of get_bundles. */
export type GetBundlesResult = {
  bundles?: Record<string, unknown>[];
  nextPageToken?: string;
};

/** Result of get_certificates. */
export type GetCertificatesResult = {
  certificates?: Record<string, unknown>[];
  nextPageToken?: string;
};

/** Result of get_cloud_formation_stack_records. */
export type GetCloudFormationStackRecordsResult = {
  cloudFormationStackRecords?: Record<string, unknown>[];
  nextPageToken?: string;
};

/** Result of get_contact_methods. */
export type GetContactMethodsResult = {
  contactMethods?: Record<string, unknown>[];
};

/** Result of get_container_api_metadata. */
export type GetContainerApiMetadataResult = {
  metadata?: Record<string, unknown>[];
};

/** Result of get_container_images. */
export type GetContainerImagesResult = {
  containerImages?: Record<string, unknown>[];
};

/** Result of get_container_log. */
export type GetContainerLogResult = {
  logEvents?: Record<string, unknown>[];
  nextPageToken?: string;
};

/** Result of get_container_service_deployments. */
export type GetContainerServiceDeploymentsResult = {
  deployments?: Record<string, unknown>[];
};

/** Result of get_container_service_metric_data. */
export type GetContainerServiceMetricDataResult = {
  metricName?: string;
  metricData?: Record<string, unknown>[];
};

/** Result of get_container_service_powers. */
export type GetContainerServicePowersResult = {
  powers?: Record<string, unknown>[];
};

/** Result of get_container_services. */
export type GetContainerServicesResult = {
  containerServices?: Record<string, unknown>[];
};

/** Result of get_cost_estimate. */
export type GetCostEstimateResult = {
  resourcesBudgetEstimate?: Record<string, unknown>[];
};

/** Result of get_disk. */
export type GetDiskResult = {
  disk?: Record<string, unknown>;
};

/** Result of get_disk_snapshot. */
export type GetDiskSnapshotResult = {
  diskSnapshot?: Record<string, unknown>;
};

/** Result of get_disk_snapshots. */
export type GetDiskSnapshotsResult = {
  diskSnapshots?: Record<string, unknown>[];
  nextPageToken?: string;
};

/** Result of get_disks. */
export type GetDisksResult = {
  disks?: Record<string, unknown>[];
  nextPageToken?: string;
};

/** Result of get_distribution_bundles. */
export type GetDistributionBundlesResult = {
  bundles?: Record<string, unknown>[];
};

/** Result of get_distribution_latest_cache_reset. */
export type GetDistributionLatestCacheResetResult = {
  status?: string;
  createTime?: string;
};

/** Result of get_distribution_metric_data. */
export type GetDistributionMetricDataResult = {
  metricName?: string;
  metricData?: Record<string, unknown>[];
};

/** Result of get_distributions. */
export type GetDistributionsResult = {
  distributions?: Record<string, unknown>[];
  nextPageToken?: string;
};

/** Result of get_domain. */
export type GetDomainResult = {
  domain?: Record<string, unknown>;
};

/** Result of get_domains. */
export type GetDomainsResult = {
  domains?: Record<string, unknown>[];
  nextPageToken?: string;
};

/** Result of get_export_snapshot_records. */
export type GetExportSnapshotRecordsResult = {
  exportSnapshotRecords?: Record<string, unknown>[];
  nextPageToken?: string;
};

/** Result of get_instance_access_details. */
export type GetInstanceAccessDetailsResult = {
  accessDetails?: Record<string, unknown>;
};

/** Result of get_instance_metric_data. */
export type GetInstanceMetricDataResult = {
  metricName?: string;
  metricData?: Record<string, unknown>[];
};

/** Result of get_instance_port_states. */
export type GetInstancePortStatesResult = {
  portStates?: Record<string, unknown>[];
};

/** Result of get_instance_snapshot. */
export type GetInstanceSnapshotResult = {
  instanceSnapshot?: Record<string, unknown>;
};

/** Result of get_instance_state. */
export type GetInstanceStateResult = {
  state?: Record<string, unknown>;
};

/** Result of get_key_pair. */
export type GetKeyPairResult = {
  keyPair?: Record<string, unknown>;
};

/** Result of get_key_pairs. */
export type GetKeyPairsResult = {
  keyPairs?: Record<string, unknown>[];
  nextPageToken?: string;
};

/** Result of get_load_balancer. */
export type GetLoadBalancerResult = {
  loadBalancer?: Record<string, unknown>;
};

/** Result of get_load_balancer_metric_data. */
export type GetLoadBalancerMetricDataResult = {
  metricName?: string;
  metricData?: Record<string, unknown>[];
};

/** Result of get_load_balancer_tls_certificates. */
export type GetLoadBalancerTlsCertificatesResult = {
  tlsCertificates?: Record<string, unknown>[];
};

/** Result of get_load_balancer_tls_policies. */
export type GetLoadBalancerTlsPoliciesResult = {
  tlsPolicies?: Record<string, unknown>[];
  nextPageToken?: string;
};

/** Result of get_load_balancers. */
export type GetLoadBalancersResult = {
  loadBalancers?: Record<string, unknown>[];
  nextPageToken?: string;
};

/** Result of get_operation. */
export type GetOperationResult = {
  operation?: Record<string, unknown>;
};

/** Result of get_operations. */
export type GetOperationsResult = {
  operations?: Record<string, unknown>[];
  nextPageToken?: string;
};

/** Result of get_operations_for_resource. */
export type GetOperationsForResourceResult = {
  operations?: Record<string, unknown>[];
  nextPageCount?: string;
  nextPageToken?: string;
};

/** Result of get_regions. */
export type GetRegionsResult = {
  regions?: Record<string, unknown>[];
};

/** Result of get_relational_database. */
export type GetRelationalDatabaseResult = {
  relationalDatabase?: Record<string, unknown>;
};

/** Result of get_relational_database_blueprints. */
export type GetRelationalDatabaseBlueprintsResult = {
  blueprints?: Record<string, unknown>[];
  nextPageToken?: string;
};

/** Result of get_relational_database_bundles. */
export type GetRelationalDatabaseBundlesResult = {
  bundles?: Record<string, unknown>[];
  nextPageToken?: string;
};

/** Result of get_relational_database_events. */
export type GetRelationalDatabaseEventsResult = {
  relationalDatabaseEvents?: Record<string, unknown>[];
  nextPageToken?: string;
};

/** Result of get_relational_database_log_events. */
export type GetRelationalDatabaseLogEventsResult = {
  resourceLogEvents?: Record<string, unknown>[];
  nextBackwardToken?: string;
  nextForwardToken?: string;
};

/** Result of get_relational_database_log_streams. */
export type GetRelationalDatabaseLogStreamsResult = {
  logStreams?: string[];
};

/** Result of get_relational_database_master_user_password. */
export type GetRelationalDatabaseMasterUserPasswordResult = {
  masterUserPassword?: string;
  createdAt?: string;
};

/** Result of get_relational_database_metric_data. */
export type GetRelationalDatabaseMetricDataResult = {
  metricName?: string;
  metricData?: Record<string, unknown>[];
};

/** Result of get_relational_database_parameters. */
export type GetRelationalDatabaseParametersResult = {
  parameters?: Record<string, unknown>[];
  nextPageToken?: string;
};

/** Result of get_relational_database_snapshot. */
export type GetRelationalDatabaseSnapshotResult = {
  relationalDatabaseSnapshot?: Record<string, unknown>;
};

/** Result of get_relational_database_snapshots. */
export type GetRelationalDatabaseSnapshotsResult = {
  relationalDatabaseSnapshots?: Record<string, unknown>[];
  nextPageToken?: string;
};

/** Result of get_relational_databases. */
export type GetRelationalDatabasesResult = {
  relationalDatabases?: Record<string, unknown>[];
  nextPageToken?: string;
};

/** Result of get_setup_history. */
export type GetSetupHistoryResult = {
  setupHistory?: Record<string, unknown>[];
  nextPageToken?: string;
};

/** Result of get_static_ips. */
export type GetStaticIpsResult = {
  staticIps?: Record<string, unknown>[];
  nextPageToken?: string;
};

/** Result of import_key_pair. */
export type ImportKeyPairResult = {
  operation?: Record<string, unknown>;
};

/** Result of is_vpc_peered. */
export type IsVpcPeeredResult = {
  isPeered?: boolean;
};

/** Result of open_instance_public_ports. */
export type OpenInstancePublicPortsResult = {
  operation?: Record<string, unknown>;
};

/** Result of peer_vpc. */
export type PeerVpcResult = {
  operation?: Record<string, unknown>;
};

/** Result of put_alarm. */
export type PutAlarmResult = {
  operations?: Record<string, unknown>[];
};

/** Result of put_instance_public_ports. */
export type PutInstancePublicPortsResult = {
  operation?: Record<string, unknown>;
};

/** Result of reboot_relational_database. */
export type RebootRelationalDatabaseResult = {
  operations?: Record<string, unknown>[];
};

/** Result of register_container_image. */
export type RegisterContainerImageResult = {
  containerImage?: Record<string, unknown>;
};

/** Result of reset_distribution_cache. */
export type ResetDistributionCacheResult = {
  status?: string;
  createTime?: string;
  operation?: Record<string, unknown>;
};

/** Result of run_alarm. */
export type RunAlarmResult = {
  operations?: Record<string, unknown>[];
};

/** Result of send_contact_method_verification. */
export type SendContactMethodVerificationResult = {
  operations?: Record<string, unknown>[];
};

/** Result of set_ip_address_type. */
export type SetIpAddressTypeResult = {
  operations?: Record<string, unknown>[];
};

/** Result of set_resource_access_for_bucket. */
export type SetResourceAccessForBucketResult = {
  operations?: Record<string, unknown>[];
};

/** Result of setup_instance_https. */
export type SetupInstanceHttpsResult = {
  operations?: Record<string, unknown>[];
};

/** Result of start_gui_session. */
export type StartGuiSessionResult = {
  operations?: Record<string, unknown>[];
};

/** Result of start_relational_database. */
export type StartRelationalDatabaseResult = {
  operations?: Record<string, unknown>[];
};

/** Result of stop_gui_session. */
export type StopGuiSessionResult = {
  operations?: Record<string, unknown>[];
};

/** Result of stop_relational_database. */
export type StopRelationalDatabaseResult = {
  operations?: Record<string, unknown>[];
};

/** Result of tag_resource. */
export type TagResourceResult = {
  operations?: Record<string, unknown>[];
};

/** Result of unpeer_vpc. */
export type UnpeerVpcResult = {
  operation?: Record<string, unknown>;
};

/** Result of untag_resource. */
export type UntagResourceResult = {
  operations?: Record<string, unknown>[];
};

/** Result of update_bucket. */
export type UpdateBucketResult = {
  bucket?: Record<string, unknown>;
  operations?: Record<string, unknown>[];
};

/** Result of update_bucket_bundle. */
export type UpdateBucketBundleResult = {
  operations?: Record<string, unknown>[];
};

/** Result of update_container_service. */
export type UpdateContainerServiceResult = {
  containerService?: Record<string, unknown>;
};

/** Result of update_distribution. */
export type UpdateDistributionResult = {
  operation?: Record<string, unknown>;
};

/** Result of update_distribution_bundle. */
export type UpdateDistributionBundleResult = {
  operation?: Record<string, unknown>;
};

/** Result of update_domain_entry. */
export type UpdateDomainEntryResult = {
  operations?: Record<string, unknown>[];
};

/** Result of update_instance_metadata_options. */
export type UpdateInstanceMetadataOptionsResult = {
  operation?: Record<string, unknown>;
};

/** Result of update_load_balancer_attribute. */
export type UpdateLoadBalancerAttributeResult = {
  operations?: Record<string, unknown>[];
};

/** Result of update_relational_database. */
export type UpdateRelationalDatabaseResult = {
  operations?: Record<string, unknown>[];
};

/** Result of update_relational_database_parameters. */
export type UpdateRelationalDatabaseParametersResult = {
  operations?: Record<string, unknown>[];
};

/** Create one or more Lightsail instances. */
export async function createInstances(instanceNames: string[]): Promise<InstanceResult[]> {
  try {
    // TODO: implement create_instances
    throw new Error("create_instances not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_instances failed");
  }
}

/** Get details for a single Lightsail instance. */
export async function getInstance(instanceName: string): Promise<InstanceResult> {
  try {
    // TODO: implement get_instance
    throw new Error("get_instance not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_instance failed");
  }
}

/** List all Lightsail instances. */
export async function getInstances(): Promise<InstanceResult[]> {
  try {
    // TODO: implement get_instances
    throw new Error("get_instances not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_instances failed");
  }
}

/** Delete a Lightsail instance. */
export async function deleteInstance(instanceName: string): Promise<void> {
  try {
    // TODO: implement delete_instance
    throw new Error("delete_instance not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_instance failed");
  }
}

/** Start a stopped Lightsail instance. */
export async function startInstance(instanceName: string): Promise<void> {
  try {
    // TODO: implement start_instance
    throw new Error("start_instance not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_instance failed");
  }
}

/** Stop a running Lightsail instance. */
export async function stopInstance(instanceName: string): Promise<void> {
  try {
    // TODO: implement stop_instance
    throw new Error("stop_instance not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "stop_instance failed");
  }
}

/** Reboot a Lightsail instance. */
export async function rebootInstance(instanceName: string): Promise<void> {
  try {
    // TODO: implement reboot_instance
    throw new Error("reboot_instance not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "reboot_instance failed");
  }
}

/** Create a snapshot of a Lightsail instance. */
export async function createInstanceSnapshot(instanceName: string, snapshotName: string): Promise<SnapshotResult> {
  try {
    // TODO: implement create_instance_snapshot
    throw new Error("create_instance_snapshot not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_instance_snapshot failed");
  }
}

/** List all Lightsail instance snapshots. */
export async function getInstanceSnapshots(): Promise<SnapshotResult[]> {
  try {
    // TODO: implement get_instance_snapshots
    throw new Error("get_instance_snapshots not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_instance_snapshots failed");
  }
}

/** Delete a Lightsail instance snapshot. */
export async function deleteInstanceSnapshot(snapshotName: string): Promise<void> {
  try {
    // TODO: implement delete_instance_snapshot
    throw new Error("delete_instance_snapshot not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_instance_snapshot failed");
  }
}

/** Create a Lightsail managed database. */
export async function createDatabase(databaseName: string): Promise<DatabaseResult> {
  try {
    // TODO: implement create_database
    throw new Error("create_database not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_database failed");
  }
}

/** Get details for a single Lightsail managed database. */
export async function getDatabase(databaseName: string): Promise<DatabaseResult> {
  try {
    // TODO: implement get_database
    throw new Error("get_database not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_database failed");
  }
}

/** List all Lightsail managed databases. */
export async function getDatabases(): Promise<DatabaseResult[]> {
  try {
    // TODO: implement get_databases
    throw new Error("get_databases not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_databases failed");
  }
}

/** Delete a Lightsail managed database. */
export async function deleteDatabase(databaseName: string): Promise<void> {
  try {
    // TODO: implement delete_database
    throw new Error("delete_database not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_database failed");
  }
}

/** Allocate a Lightsail static IP. */
export async function allocateStaticIp(staticIpName: string): Promise<StaticIpResult> {
  try {
    // TODO: implement allocate_static_ip
    throw new Error("allocate_static_ip not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "allocate_static_ip failed");
  }
}

/** Get details for a Lightsail static IP. */
export async function getStaticIp(staticIpName: string): Promise<StaticIpResult> {
  try {
    // TODO: implement get_static_ip
    throw new Error("get_static_ip not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_static_ip failed");
  }
}

/** Release a Lightsail static IP. */
export async function releaseStaticIp(staticIpName: string): Promise<void> {
  try {
    // TODO: implement release_static_ip
    throw new Error("release_static_ip not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "release_static_ip failed");
  }
}

/** Attach certificate to distribution. */
export async function attachCertificateToDistribution(distributionName: string, certificateName: string, regionName?: string): Promise<AttachCertificateToDistributionResult> {
  try {
    // TODO: implement attach_certificate_to_distribution
    throw new Error("attach_certificate_to_distribution not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "attach_certificate_to_distribution failed");
  }
}

/** Attach disk. */
export async function attachDisk(diskName: string, instanceName: string, diskPath: string): Promise<AttachDiskResult> {
  try {
    // TODO: implement attach_disk
    throw new Error("attach_disk not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "attach_disk failed");
  }
}

/** Attach instances to load balancer. */
export async function attachInstancesToLoadBalancer(loadBalancerName: string, instanceNames: string[], regionName?: string): Promise<AttachInstancesToLoadBalancerResult> {
  try {
    // TODO: implement attach_instances_to_load_balancer
    throw new Error("attach_instances_to_load_balancer not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "attach_instances_to_load_balancer failed");
  }
}

/** Attach load balancer tls certificate. */
export async function attachLoadBalancerTlsCertificate(loadBalancerName: string, certificateName: string, regionName?: string): Promise<AttachLoadBalancerTlsCertificateResult> {
  try {
    // TODO: implement attach_load_balancer_tls_certificate
    throw new Error("attach_load_balancer_tls_certificate not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "attach_load_balancer_tls_certificate failed");
  }
}

/** Attach static ip. */
export async function attachStaticIp(staticIpName: string, instanceName: string, regionName?: string): Promise<AttachStaticIpResult> {
  try {
    // TODO: implement attach_static_ip
    throw new Error("attach_static_ip not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "attach_static_ip failed");
  }
}

/** Close instance public ports. */
export async function closeInstancePublicPorts(portInfo: Record<string, unknown>, instanceName: string, regionName?: string): Promise<CloseInstancePublicPortsResult> {
  try {
    // TODO: implement close_instance_public_ports
    throw new Error("close_instance_public_ports not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "close_instance_public_ports failed");
  }
}

/** Copy snapshot. */
export async function copySnapshot(targetSnapshotName: string, sourceRegion: string): Promise<CopySnapshotResult> {
  try {
    // TODO: implement copy_snapshot
    throw new Error("copy_snapshot not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "copy_snapshot failed");
  }
}

/** Create bucket. */
export async function createBucket(bucketName: string, bundleId: string): Promise<CreateBucketResult> {
  try {
    // TODO: implement create_bucket
    throw new Error("create_bucket not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_bucket failed");
  }
}

/** Create bucket access key. */
export async function createBucketAccessKey(bucketName: string, regionName?: string): Promise<CreateBucketAccessKeyResult> {
  try {
    // TODO: implement create_bucket_access_key
    throw new Error("create_bucket_access_key not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_bucket_access_key failed");
  }
}

/** Create certificate. */
export async function createCertificate(certificateName: string, domainName: string): Promise<CreateCertificateResult> {
  try {
    // TODO: implement create_certificate
    throw new Error("create_certificate not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_certificate failed");
  }
}

/** Create cloud formation stack. */
export async function createCloudFormationStack(instances: Record<string, unknown>[], regionName?: string): Promise<CreateCloudFormationStackResult> {
  try {
    // TODO: implement create_cloud_formation_stack
    throw new Error("create_cloud_formation_stack not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_cloud_formation_stack failed");
  }
}

/** Create contact method. */
export async function createContactMethod(protocol: string, contactEndpoint: string, regionName?: string): Promise<CreateContactMethodResult> {
  try {
    // TODO: implement create_contact_method
    throw new Error("create_contact_method not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_contact_method failed");
  }
}

/** Create container service. */
export async function createContainerService(serviceName: string, power: string, scale: number): Promise<CreateContainerServiceResult> {
  try {
    // TODO: implement create_container_service
    throw new Error("create_container_service not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_container_service failed");
  }
}

/** Create container service deployment. */
export async function createContainerServiceDeployment(serviceName: string): Promise<CreateContainerServiceDeploymentResult> {
  try {
    // TODO: implement create_container_service_deployment
    throw new Error("create_container_service_deployment not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_container_service_deployment failed");
  }
}

/** Create container service registry login. */
export async function createContainerServiceRegistryLogin(regionName?: string): Promise<CreateContainerServiceRegistryLoginResult> {
  try {
    // TODO: implement create_container_service_registry_login
    throw new Error("create_container_service_registry_login not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_container_service_registry_login failed");
  }
}

/** Create disk. */
export async function createDisk(diskName: string, availabilityZone: string, sizeInGb: number): Promise<CreateDiskResult> {
  try {
    // TODO: implement create_disk
    throw new Error("create_disk not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_disk failed");
  }
}

/** Create disk from snapshot. */
export async function createDiskFromSnapshot(diskName: string, availabilityZone: string, sizeInGb: number): Promise<CreateDiskFromSnapshotResult> {
  try {
    // TODO: implement create_disk_from_snapshot
    throw new Error("create_disk_from_snapshot not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_disk_from_snapshot failed");
  }
}

/** Create disk snapshot. */
export async function createDiskSnapshot(diskSnapshotName: string): Promise<CreateDiskSnapshotResult> {
  try {
    // TODO: implement create_disk_snapshot
    throw new Error("create_disk_snapshot not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_disk_snapshot failed");
  }
}

/** Create distribution. */
export async function createDistribution(distributionName: string, origin: Record<string, unknown>, defaultCacheBehavior: Record<string, unknown>, bundleId: string): Promise<CreateDistributionResult> {
  try {
    // TODO: implement create_distribution
    throw new Error("create_distribution not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_distribution failed");
  }
}

/** Create domain. */
export async function createDomain(domainName: string): Promise<CreateDomainResult> {
  try {
    // TODO: implement create_domain
    throw new Error("create_domain not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_domain failed");
  }
}

/** Create domain entry. */
export async function createDomainEntry(domainName: string, domainEntry: Record<string, unknown>, regionName?: string): Promise<CreateDomainEntryResult> {
  try {
    // TODO: implement create_domain_entry
    throw new Error("create_domain_entry not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_domain_entry failed");
  }
}

/** Create gui session access details. */
export async function createGuiSessionAccessDetails(resourceName: string, regionName?: string): Promise<CreateGuiSessionAccessDetailsResult> {
  try {
    // TODO: implement create_gui_session_access_details
    throw new Error("create_gui_session_access_details not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_gui_session_access_details failed");
  }
}

/** Create instances from snapshot. */
export async function createInstancesFromSnapshot(instanceNames: string[], availabilityZone: string, bundleId: string): Promise<CreateInstancesFromSnapshotResult> {
  try {
    // TODO: implement create_instances_from_snapshot
    throw new Error("create_instances_from_snapshot not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_instances_from_snapshot failed");
  }
}

/** Create key pair. */
export async function createKeyPair(keyPairName: string): Promise<CreateKeyPairResult> {
  try {
    // TODO: implement create_key_pair
    throw new Error("create_key_pair not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_key_pair failed");
  }
}

/** Create load balancer. */
export async function createLoadBalancer(loadBalancerName: string, instancePort: number): Promise<CreateLoadBalancerResult> {
  try {
    // TODO: implement create_load_balancer
    throw new Error("create_load_balancer not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_load_balancer failed");
  }
}

/** Create load balancer tls certificate. */
export async function createLoadBalancerTlsCertificate(loadBalancerName: string, certificateName: string, certificateDomainName: string): Promise<CreateLoadBalancerTlsCertificateResult> {
  try {
    // TODO: implement create_load_balancer_tls_certificate
    throw new Error("create_load_balancer_tls_certificate not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_load_balancer_tls_certificate failed");
  }
}

/** Create relational database. */
export async function createRelationalDatabase(relationalDatabaseName: string, relationalDatabaseBlueprintId: string, relationalDatabaseBundleId: string, masterDatabaseName: string, masterUsername: string): Promise<CreateRelationalDatabaseResult> {
  try {
    // TODO: implement create_relational_database
    throw new Error("create_relational_database not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_relational_database failed");
  }
}

/** Create relational database from snapshot. */
export async function createRelationalDatabaseFromSnapshot(relationalDatabaseName: string): Promise<CreateRelationalDatabaseFromSnapshotResult> {
  try {
    // TODO: implement create_relational_database_from_snapshot
    throw new Error("create_relational_database_from_snapshot not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_relational_database_from_snapshot failed");
  }
}

/** Create relational database snapshot. */
export async function createRelationalDatabaseSnapshot(relationalDatabaseName: string, relationalDatabaseSnapshotName: string): Promise<CreateRelationalDatabaseSnapshotResult> {
  try {
    // TODO: implement create_relational_database_snapshot
    throw new Error("create_relational_database_snapshot not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_relational_database_snapshot failed");
  }
}

/** Delete alarm. */
export async function deleteAlarm(alarmName: string, regionName?: string): Promise<DeleteAlarmResult> {
  try {
    // TODO: implement delete_alarm
    throw new Error("delete_alarm not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_alarm failed");
  }
}

/** Delete auto snapshot. */
export async function deleteAutoSnapshot(resourceName: string, date: string, regionName?: string): Promise<DeleteAutoSnapshotResult> {
  try {
    // TODO: implement delete_auto_snapshot
    throw new Error("delete_auto_snapshot not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_auto_snapshot failed");
  }
}

/** Delete bucket. */
export async function deleteBucket(bucketName: string): Promise<DeleteBucketResult> {
  try {
    // TODO: implement delete_bucket
    throw new Error("delete_bucket not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_bucket failed");
  }
}

/** Delete bucket access key. */
export async function deleteBucketAccessKey(bucketName: string, accessKeyId: string, regionName?: string): Promise<DeleteBucketAccessKeyResult> {
  try {
    // TODO: implement delete_bucket_access_key
    throw new Error("delete_bucket_access_key not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_bucket_access_key failed");
  }
}

/** Delete certificate. */
export async function deleteCertificate(certificateName: string, regionName?: string): Promise<DeleteCertificateResult> {
  try {
    // TODO: implement delete_certificate
    throw new Error("delete_certificate not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_certificate failed");
  }
}

/** Delete contact method. */
export async function deleteContactMethod(protocol: string, regionName?: string): Promise<DeleteContactMethodResult> {
  try {
    // TODO: implement delete_contact_method
    throw new Error("delete_contact_method not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_contact_method failed");
  }
}

/** Delete container image. */
export async function deleteContainerImage(serviceName: string, image: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_container_image
    throw new Error("delete_container_image not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_container_image failed");
  }
}

/** Delete container service. */
export async function deleteContainerService(serviceName: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_container_service
    throw new Error("delete_container_service not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_container_service failed");
  }
}

/** Delete disk. */
export async function deleteDisk(diskName: string): Promise<DeleteDiskResult> {
  try {
    // TODO: implement delete_disk
    throw new Error("delete_disk not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_disk failed");
  }
}

/** Delete disk snapshot. */
export async function deleteDiskSnapshot(diskSnapshotName: string, regionName?: string): Promise<DeleteDiskSnapshotResult> {
  try {
    // TODO: implement delete_disk_snapshot
    throw new Error("delete_disk_snapshot not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_disk_snapshot failed");
  }
}

/** Delete distribution. */
export async function deleteDistribution(): Promise<DeleteDistributionResult> {
  try {
    // TODO: implement delete_distribution
    throw new Error("delete_distribution not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_distribution failed");
  }
}

/** Delete domain. */
export async function deleteDomain(domainName: string, regionName?: string): Promise<DeleteDomainResult> {
  try {
    // TODO: implement delete_domain
    throw new Error("delete_domain not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_domain failed");
  }
}

/** Delete domain entry. */
export async function deleteDomainEntry(domainName: string, domainEntry: Record<string, unknown>, regionName?: string): Promise<DeleteDomainEntryResult> {
  try {
    // TODO: implement delete_domain_entry
    throw new Error("delete_domain_entry not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_domain_entry failed");
  }
}

/** Delete key pair. */
export async function deleteKeyPair(keyPairName: string): Promise<DeleteKeyPairResult> {
  try {
    // TODO: implement delete_key_pair
    throw new Error("delete_key_pair not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_key_pair failed");
  }
}

/** Delete known host keys. */
export async function deleteKnownHostKeys(instanceName: string, regionName?: string): Promise<DeleteKnownHostKeysResult> {
  try {
    // TODO: implement delete_known_host_keys
    throw new Error("delete_known_host_keys not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_known_host_keys failed");
  }
}

/** Delete load balancer. */
export async function deleteLoadBalancer(loadBalancerName: string, regionName?: string): Promise<DeleteLoadBalancerResult> {
  try {
    // TODO: implement delete_load_balancer
    throw new Error("delete_load_balancer not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_load_balancer failed");
  }
}

/** Delete load balancer tls certificate. */
export async function deleteLoadBalancerTlsCertificate(loadBalancerName: string, certificateName: string): Promise<DeleteLoadBalancerTlsCertificateResult> {
  try {
    // TODO: implement delete_load_balancer_tls_certificate
    throw new Error("delete_load_balancer_tls_certificate not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_load_balancer_tls_certificate failed");
  }
}

/** Delete relational database. */
export async function deleteRelationalDatabase(relationalDatabaseName: string): Promise<DeleteRelationalDatabaseResult> {
  try {
    // TODO: implement delete_relational_database
    throw new Error("delete_relational_database not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_relational_database failed");
  }
}

/** Delete relational database snapshot. */
export async function deleteRelationalDatabaseSnapshot(relationalDatabaseSnapshotName: string, regionName?: string): Promise<DeleteRelationalDatabaseSnapshotResult> {
  try {
    // TODO: implement delete_relational_database_snapshot
    throw new Error("delete_relational_database_snapshot not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_relational_database_snapshot failed");
  }
}

/** Detach certificate from distribution. */
export async function detachCertificateFromDistribution(distributionName: string, regionName?: string): Promise<DetachCertificateFromDistributionResult> {
  try {
    // TODO: implement detach_certificate_from_distribution
    throw new Error("detach_certificate_from_distribution not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "detach_certificate_from_distribution failed");
  }
}

/** Detach disk. */
export async function detachDisk(diskName: string, regionName?: string): Promise<DetachDiskResult> {
  try {
    // TODO: implement detach_disk
    throw new Error("detach_disk not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "detach_disk failed");
  }
}

/** Detach instances from load balancer. */
export async function detachInstancesFromLoadBalancer(loadBalancerName: string, instanceNames: string[], regionName?: string): Promise<DetachInstancesFromLoadBalancerResult> {
  try {
    // TODO: implement detach_instances_from_load_balancer
    throw new Error("detach_instances_from_load_balancer not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "detach_instances_from_load_balancer failed");
  }
}

/** Detach static ip. */
export async function detachStaticIp(staticIpName: string, regionName?: string): Promise<DetachStaticIpResult> {
  try {
    // TODO: implement detach_static_ip
    throw new Error("detach_static_ip not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "detach_static_ip failed");
  }
}

/** Disable add on. */
export async function disableAddOn(addOnType: string, resourceName: string, regionName?: string): Promise<DisableAddOnResult> {
  try {
    // TODO: implement disable_add_on
    throw new Error("disable_add_on not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disable_add_on failed");
  }
}

/** Download default key pair. */
export async function downloadDefaultKeyPair(regionName?: string): Promise<DownloadDefaultKeyPairResult> {
  try {
    // TODO: implement download_default_key_pair
    throw new Error("download_default_key_pair not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "download_default_key_pair failed");
  }
}

/** Enable add on. */
export async function enableAddOn(resourceName: string, addOnRequest: Record<string, unknown>, regionName?: string): Promise<EnableAddOnResult> {
  try {
    // TODO: implement enable_add_on
    throw new Error("enable_add_on not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "enable_add_on failed");
  }
}

/** Export snapshot. */
export async function exportSnapshot(sourceSnapshotName: string, regionName?: string): Promise<ExportSnapshotResult> {
  try {
    // TODO: implement export_snapshot
    throw new Error("export_snapshot not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "export_snapshot failed");
  }
}

/** Get active names. */
export async function getActiveNames(): Promise<GetActiveNamesResult> {
  try {
    // TODO: implement get_active_names
    throw new Error("get_active_names not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_active_names failed");
  }
}

/** Get alarms. */
export async function getAlarms(): Promise<GetAlarmsResult> {
  try {
    // TODO: implement get_alarms
    throw new Error("get_alarms not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_alarms failed");
  }
}

/** Get auto snapshots. */
export async function getAutoSnapshots(resourceName: string, regionName?: string): Promise<GetAutoSnapshotsResult> {
  try {
    // TODO: implement get_auto_snapshots
    throw new Error("get_auto_snapshots not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_auto_snapshots failed");
  }
}

/** Get blueprints. */
export async function getBlueprints(): Promise<GetBlueprintsResult> {
  try {
    // TODO: implement get_blueprints
    throw new Error("get_blueprints not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_blueprints failed");
  }
}

/** Get bucket access keys. */
export async function getBucketAccessKeys(bucketName: string, regionName?: string): Promise<GetBucketAccessKeysResult> {
  try {
    // TODO: implement get_bucket_access_keys
    throw new Error("get_bucket_access_keys not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_bucket_access_keys failed");
  }
}

/** Get bucket bundles. */
export async function getBucketBundles(): Promise<GetBucketBundlesResult> {
  try {
    // TODO: implement get_bucket_bundles
    throw new Error("get_bucket_bundles not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_bucket_bundles failed");
  }
}

/** Get bucket metric data. */
export async function getBucketMetricData(bucketName: string, metricName: string, startTime: string, endTime: string, period: number, statistics: string[], unit: string, regionName?: string): Promise<GetBucketMetricDataResult> {
  try {
    // TODO: implement get_bucket_metric_data
    throw new Error("get_bucket_metric_data not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_bucket_metric_data failed");
  }
}

/** Get buckets. */
export async function getBuckets(): Promise<GetBucketsResult> {
  try {
    // TODO: implement get_buckets
    throw new Error("get_buckets not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_buckets failed");
  }
}

/** Get bundles. */
export async function getBundles(): Promise<GetBundlesResult> {
  try {
    // TODO: implement get_bundles
    throw new Error("get_bundles not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_bundles failed");
  }
}

/** Get certificates. */
export async function getCertificates(): Promise<GetCertificatesResult> {
  try {
    // TODO: implement get_certificates
    throw new Error("get_certificates not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_certificates failed");
  }
}

/** Get cloud formation stack records. */
export async function getCloudFormationStackRecords(): Promise<GetCloudFormationStackRecordsResult> {
  try {
    // TODO: implement get_cloud_formation_stack_records
    throw new Error("get_cloud_formation_stack_records not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_cloud_formation_stack_records failed");
  }
}

/** Get contact methods. */
export async function getContactMethods(): Promise<GetContactMethodsResult> {
  try {
    // TODO: implement get_contact_methods
    throw new Error("get_contact_methods not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_contact_methods failed");
  }
}

/** Get container api metadata. */
export async function getContainerApiMetadata(regionName?: string): Promise<GetContainerApiMetadataResult> {
  try {
    // TODO: implement get_container_api_metadata
    throw new Error("get_container_api_metadata not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_container_api_metadata failed");
  }
}

/** Get container images. */
export async function getContainerImages(serviceName: string, regionName?: string): Promise<GetContainerImagesResult> {
  try {
    // TODO: implement get_container_images
    throw new Error("get_container_images not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_container_images failed");
  }
}

/** Get container log. */
export async function getContainerLog(serviceName: string, containerName: string): Promise<GetContainerLogResult> {
  try {
    // TODO: implement get_container_log
    throw new Error("get_container_log not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_container_log failed");
  }
}

/** Get container service deployments. */
export async function getContainerServiceDeployments(serviceName: string, regionName?: string): Promise<GetContainerServiceDeploymentsResult> {
  try {
    // TODO: implement get_container_service_deployments
    throw new Error("get_container_service_deployments not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_container_service_deployments failed");
  }
}

/** Get container service metric data. */
export async function getContainerServiceMetricData(serviceName: string, metricName: string, startTime: string, endTime: string, period: number, statistics: string[], regionName?: string): Promise<GetContainerServiceMetricDataResult> {
  try {
    // TODO: implement get_container_service_metric_data
    throw new Error("get_container_service_metric_data not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_container_service_metric_data failed");
  }
}

/** Get container service powers. */
export async function getContainerServicePowers(regionName?: string): Promise<GetContainerServicePowersResult> {
  try {
    // TODO: implement get_container_service_powers
    throw new Error("get_container_service_powers not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_container_service_powers failed");
  }
}

/** Get container services. */
export async function getContainerServices(): Promise<GetContainerServicesResult> {
  try {
    // TODO: implement get_container_services
    throw new Error("get_container_services not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_container_services failed");
  }
}

/** Get cost estimate. */
export async function getCostEstimate(resourceName: string, startTime: string, endTime: string, regionName?: string): Promise<GetCostEstimateResult> {
  try {
    // TODO: implement get_cost_estimate
    throw new Error("get_cost_estimate not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_cost_estimate failed");
  }
}

/** Get disk. */
export async function getDisk(diskName: string, regionName?: string): Promise<GetDiskResult> {
  try {
    // TODO: implement get_disk
    throw new Error("get_disk not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_disk failed");
  }
}

/** Get disk snapshot. */
export async function getDiskSnapshot(diskSnapshotName: string, regionName?: string): Promise<GetDiskSnapshotResult> {
  try {
    // TODO: implement get_disk_snapshot
    throw new Error("get_disk_snapshot not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_disk_snapshot failed");
  }
}

/** Get disk snapshots. */
export async function getDiskSnapshots(): Promise<GetDiskSnapshotsResult> {
  try {
    // TODO: implement get_disk_snapshots
    throw new Error("get_disk_snapshots not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_disk_snapshots failed");
  }
}

/** Get disks. */
export async function getDisks(): Promise<GetDisksResult> {
  try {
    // TODO: implement get_disks
    throw new Error("get_disks not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_disks failed");
  }
}

/** Get distribution bundles. */
export async function getDistributionBundles(regionName?: string): Promise<GetDistributionBundlesResult> {
  try {
    // TODO: implement get_distribution_bundles
    throw new Error("get_distribution_bundles not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_distribution_bundles failed");
  }
}

/** Get distribution latest cache reset. */
export async function getDistributionLatestCacheReset(): Promise<GetDistributionLatestCacheResetResult> {
  try {
    // TODO: implement get_distribution_latest_cache_reset
    throw new Error("get_distribution_latest_cache_reset not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_distribution_latest_cache_reset failed");
  }
}

/** Get distribution metric data. */
export async function getDistributionMetricData(distributionName: string, metricName: string, startTime: string, endTime: string, period: number, unit: string, statistics: string[], regionName?: string): Promise<GetDistributionMetricDataResult> {
  try {
    // TODO: implement get_distribution_metric_data
    throw new Error("get_distribution_metric_data not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_distribution_metric_data failed");
  }
}

/** Get distributions. */
export async function getDistributions(): Promise<GetDistributionsResult> {
  try {
    // TODO: implement get_distributions
    throw new Error("get_distributions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_distributions failed");
  }
}

/** Get domain. */
export async function getDomain(domainName: string, regionName?: string): Promise<GetDomainResult> {
  try {
    // TODO: implement get_domain
    throw new Error("get_domain not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_domain failed");
  }
}

/** Get domains. */
export async function getDomains(): Promise<GetDomainsResult> {
  try {
    // TODO: implement get_domains
    throw new Error("get_domains not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_domains failed");
  }
}

/** Get export snapshot records. */
export async function getExportSnapshotRecords(): Promise<GetExportSnapshotRecordsResult> {
  try {
    // TODO: implement get_export_snapshot_records
    throw new Error("get_export_snapshot_records not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_export_snapshot_records failed");
  }
}

/** Get instance access details. */
export async function getInstanceAccessDetails(instanceName: string): Promise<GetInstanceAccessDetailsResult> {
  try {
    // TODO: implement get_instance_access_details
    throw new Error("get_instance_access_details not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_instance_access_details failed");
  }
}

/** Get instance metric data. */
export async function getInstanceMetricData(instanceName: string, metricName: string, period: number, startTime: string, endTime: string, unit: string, statistics: string[], regionName?: string): Promise<GetInstanceMetricDataResult> {
  try {
    // TODO: implement get_instance_metric_data
    throw new Error("get_instance_metric_data not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_instance_metric_data failed");
  }
}

/** Get instance port states. */
export async function getInstancePortStates(instanceName: string, regionName?: string): Promise<GetInstancePortStatesResult> {
  try {
    // TODO: implement get_instance_port_states
    throw new Error("get_instance_port_states not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_instance_port_states failed");
  }
}

/** Get instance snapshot. */
export async function getInstanceSnapshot(instanceSnapshotName: string, regionName?: string): Promise<GetInstanceSnapshotResult> {
  try {
    // TODO: implement get_instance_snapshot
    throw new Error("get_instance_snapshot not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_instance_snapshot failed");
  }
}

/** Get instance state. */
export async function getInstanceState(instanceName: string, regionName?: string): Promise<GetInstanceStateResult> {
  try {
    // TODO: implement get_instance_state
    throw new Error("get_instance_state not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_instance_state failed");
  }
}

/** Get key pair. */
export async function getKeyPair(keyPairName: string, regionName?: string): Promise<GetKeyPairResult> {
  try {
    // TODO: implement get_key_pair
    throw new Error("get_key_pair not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_key_pair failed");
  }
}

/** Get key pairs. */
export async function getKeyPairs(): Promise<GetKeyPairsResult> {
  try {
    // TODO: implement get_key_pairs
    throw new Error("get_key_pairs not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_key_pairs failed");
  }
}

/** Get load balancer. */
export async function getLoadBalancer(loadBalancerName: string, regionName?: string): Promise<GetLoadBalancerResult> {
  try {
    // TODO: implement get_load_balancer
    throw new Error("get_load_balancer not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_load_balancer failed");
  }
}

/** Get load balancer metric data. */
export async function getLoadBalancerMetricData(loadBalancerName: string, metricName: string, period: number, startTime: string, endTime: string, unit: string, statistics: string[], regionName?: string): Promise<GetLoadBalancerMetricDataResult> {
  try {
    // TODO: implement get_load_balancer_metric_data
    throw new Error("get_load_balancer_metric_data not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_load_balancer_metric_data failed");
  }
}

/** Get load balancer tls certificates. */
export async function getLoadBalancerTlsCertificates(loadBalancerName: string, regionName?: string): Promise<GetLoadBalancerTlsCertificatesResult> {
  try {
    // TODO: implement get_load_balancer_tls_certificates
    throw new Error("get_load_balancer_tls_certificates not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_load_balancer_tls_certificates failed");
  }
}

/** Get load balancer tls policies. */
export async function getLoadBalancerTlsPolicies(): Promise<GetLoadBalancerTlsPoliciesResult> {
  try {
    // TODO: implement get_load_balancer_tls_policies
    throw new Error("get_load_balancer_tls_policies not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_load_balancer_tls_policies failed");
  }
}

/** Get load balancers. */
export async function getLoadBalancers(): Promise<GetLoadBalancersResult> {
  try {
    // TODO: implement get_load_balancers
    throw new Error("get_load_balancers not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_load_balancers failed");
  }
}

/** Get operation. */
export async function getOperation(operationId: string, regionName?: string): Promise<GetOperationResult> {
  try {
    // TODO: implement get_operation
    throw new Error("get_operation not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_operation failed");
  }
}

/** Get operations. */
export async function getOperations(): Promise<GetOperationsResult> {
  try {
    // TODO: implement get_operations
    throw new Error("get_operations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_operations failed");
  }
}

/** Get operations for resource. */
export async function getOperationsForResource(resourceName: string): Promise<GetOperationsForResourceResult> {
  try {
    // TODO: implement get_operations_for_resource
    throw new Error("get_operations_for_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_operations_for_resource failed");
  }
}

/** Get regions. */
export async function getRegions(): Promise<GetRegionsResult> {
  try {
    // TODO: implement get_regions
    throw new Error("get_regions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_regions failed");
  }
}

/** Get relational database. */
export async function getRelationalDatabase(relationalDatabaseName: string, regionName?: string): Promise<GetRelationalDatabaseResult> {
  try {
    // TODO: implement get_relational_database
    throw new Error("get_relational_database not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_relational_database failed");
  }
}

/** Get relational database blueprints. */
export async function getRelationalDatabaseBlueprints(): Promise<GetRelationalDatabaseBlueprintsResult> {
  try {
    // TODO: implement get_relational_database_blueprints
    throw new Error("get_relational_database_blueprints not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_relational_database_blueprints failed");
  }
}

/** Get relational database bundles. */
export async function getRelationalDatabaseBundles(): Promise<GetRelationalDatabaseBundlesResult> {
  try {
    // TODO: implement get_relational_database_bundles
    throw new Error("get_relational_database_bundles not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_relational_database_bundles failed");
  }
}

/** Get relational database events. */
export async function getRelationalDatabaseEvents(relationalDatabaseName: string): Promise<GetRelationalDatabaseEventsResult> {
  try {
    // TODO: implement get_relational_database_events
    throw new Error("get_relational_database_events not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_relational_database_events failed");
  }
}

/** Get relational database log events. */
export async function getRelationalDatabaseLogEvents(relationalDatabaseName: string, logStreamName: string): Promise<GetRelationalDatabaseLogEventsResult> {
  try {
    // TODO: implement get_relational_database_log_events
    throw new Error("get_relational_database_log_events not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_relational_database_log_events failed");
  }
}

/** Get relational database log streams. */
export async function getRelationalDatabaseLogStreams(relationalDatabaseName: string, regionName?: string): Promise<GetRelationalDatabaseLogStreamsResult> {
  try {
    // TODO: implement get_relational_database_log_streams
    throw new Error("get_relational_database_log_streams not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_relational_database_log_streams failed");
  }
}

/** Get relational database master user password. */
export async function getRelationalDatabaseMasterUserPassword(relationalDatabaseName: string): Promise<GetRelationalDatabaseMasterUserPasswordResult> {
  try {
    // TODO: implement get_relational_database_master_user_password
    throw new Error("get_relational_database_master_user_password not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_relational_database_master_user_password failed");
  }
}

/** Get relational database metric data. */
export async function getRelationalDatabaseMetricData(relationalDatabaseName: string, metricName: string, period: number, startTime: string, endTime: string, unit: string, statistics: string[], regionName?: string): Promise<GetRelationalDatabaseMetricDataResult> {
  try {
    // TODO: implement get_relational_database_metric_data
    throw new Error("get_relational_database_metric_data not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_relational_database_metric_data failed");
  }
}

/** Get relational database parameters. */
export async function getRelationalDatabaseParameters(relationalDatabaseName: string): Promise<GetRelationalDatabaseParametersResult> {
  try {
    // TODO: implement get_relational_database_parameters
    throw new Error("get_relational_database_parameters not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_relational_database_parameters failed");
  }
}

/** Get relational database snapshot. */
export async function getRelationalDatabaseSnapshot(relationalDatabaseSnapshotName: string, regionName?: string): Promise<GetRelationalDatabaseSnapshotResult> {
  try {
    // TODO: implement get_relational_database_snapshot
    throw new Error("get_relational_database_snapshot not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_relational_database_snapshot failed");
  }
}

/** Get relational database snapshots. */
export async function getRelationalDatabaseSnapshots(): Promise<GetRelationalDatabaseSnapshotsResult> {
  try {
    // TODO: implement get_relational_database_snapshots
    throw new Error("get_relational_database_snapshots not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_relational_database_snapshots failed");
  }
}

/** Get relational databases. */
export async function getRelationalDatabases(): Promise<GetRelationalDatabasesResult> {
  try {
    // TODO: implement get_relational_databases
    throw new Error("get_relational_databases not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_relational_databases failed");
  }
}

/** Get setup history. */
export async function getSetupHistory(resourceName: string): Promise<GetSetupHistoryResult> {
  try {
    // TODO: implement get_setup_history
    throw new Error("get_setup_history not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_setup_history failed");
  }
}

/** Get static ips. */
export async function getStaticIps(): Promise<GetStaticIpsResult> {
  try {
    // TODO: implement get_static_ips
    throw new Error("get_static_ips not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_static_ips failed");
  }
}

/** Import key pair. */
export async function importKeyPair(keyPairName: string, publicKeyBase64: string, regionName?: string): Promise<ImportKeyPairResult> {
  try {
    // TODO: implement import_key_pair
    throw new Error("import_key_pair not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "import_key_pair failed");
  }
}

/** Is vpc peered. */
export async function isVpcPeered(regionName?: string): Promise<IsVpcPeeredResult> {
  try {
    // TODO: implement is_vpc_peered
    throw new Error("is_vpc_peered not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "is_vpc_peered failed");
  }
}

/** Open instance public ports. */
export async function openInstancePublicPorts(portInfo: Record<string, unknown>, instanceName: string, regionName?: string): Promise<OpenInstancePublicPortsResult> {
  try {
    // TODO: implement open_instance_public_ports
    throw new Error("open_instance_public_ports not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "open_instance_public_ports failed");
  }
}

/** Peer vpc. */
export async function peerVpc(regionName?: string): Promise<PeerVpcResult> {
  try {
    // TODO: implement peer_vpc
    throw new Error("peer_vpc not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "peer_vpc failed");
  }
}

/** Put alarm. */
export async function putAlarm(alarmName: string, metricName: string, monitoredResourceName: string, comparisonOperator: string, threshold: number, evaluationPeriods: number): Promise<PutAlarmResult> {
  try {
    // TODO: implement put_alarm
    throw new Error("put_alarm not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_alarm failed");
  }
}

/** Put instance public ports. */
export async function putInstancePublicPorts(portInfos: Record<string, unknown>[], instanceName: string, regionName?: string): Promise<PutInstancePublicPortsResult> {
  try {
    // TODO: implement put_instance_public_ports
    throw new Error("put_instance_public_ports not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_instance_public_ports failed");
  }
}

/** Reboot relational database. */
export async function rebootRelationalDatabase(relationalDatabaseName: string, regionName?: string): Promise<RebootRelationalDatabaseResult> {
  try {
    // TODO: implement reboot_relational_database
    throw new Error("reboot_relational_database not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "reboot_relational_database failed");
  }
}

/** Register container image. */
export async function registerContainerImage(serviceName: string, label: string, digest: string, regionName?: string): Promise<RegisterContainerImageResult> {
  try {
    // TODO: implement register_container_image
    throw new Error("register_container_image not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "register_container_image failed");
  }
}

/** Reset distribution cache. */
export async function resetDistributionCache(): Promise<ResetDistributionCacheResult> {
  try {
    // TODO: implement reset_distribution_cache
    throw new Error("reset_distribution_cache not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "reset_distribution_cache failed");
  }
}

/** Run alarm. */
export async function runAlarm(alarmName: string, state: string, regionName?: string): Promise<RunAlarmResult> {
  try {
    // TODO: implement run_alarm
    throw new Error("run_alarm not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "run_alarm failed");
  }
}

/** Send contact method verification. */
export async function sendContactMethodVerification(protocol: string, regionName?: string): Promise<SendContactMethodVerificationResult> {
  try {
    // TODO: implement send_contact_method_verification
    throw new Error("send_contact_method_verification not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "send_contact_method_verification failed");
  }
}

/** Set ip address type. */
export async function setIpAddressType(resourceType: string, resourceName: string, ipAddressType: string): Promise<SetIpAddressTypeResult> {
  try {
    // TODO: implement set_ip_address_type
    throw new Error("set_ip_address_type not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "set_ip_address_type failed");
  }
}

/** Set resource access for bucket. */
export async function setResourceAccessForBucket(resourceName: string, bucketName: string, access: string, regionName?: string): Promise<SetResourceAccessForBucketResult> {
  try {
    // TODO: implement set_resource_access_for_bucket
    throw new Error("set_resource_access_for_bucket not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "set_resource_access_for_bucket failed");
  }
}

/** Setup instance https. */
export async function setupInstanceHttps(instanceName: string, emailAddress: string, domainNames: string[], certificateProvider: string, regionName?: string): Promise<SetupInstanceHttpsResult> {
  try {
    // TODO: implement setup_instance_https
    throw new Error("setup_instance_https not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "setup_instance_https failed");
  }
}

/** Start gui session. */
export async function startGuiSession(resourceName: string, regionName?: string): Promise<StartGuiSessionResult> {
  try {
    // TODO: implement start_gui_session
    throw new Error("start_gui_session not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_gui_session failed");
  }
}

/** Start relational database. */
export async function startRelationalDatabase(relationalDatabaseName: string, regionName?: string): Promise<StartRelationalDatabaseResult> {
  try {
    // TODO: implement start_relational_database
    throw new Error("start_relational_database not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_relational_database failed");
  }
}

/** Stop gui session. */
export async function stopGuiSession(resourceName: string, regionName?: string): Promise<StopGuiSessionResult> {
  try {
    // TODO: implement stop_gui_session
    throw new Error("stop_gui_session not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "stop_gui_session failed");
  }
}

/** Stop relational database. */
export async function stopRelationalDatabase(relationalDatabaseName: string): Promise<StopRelationalDatabaseResult> {
  try {
    // TODO: implement stop_relational_database
    throw new Error("stop_relational_database not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "stop_relational_database failed");
  }
}

/** Tag resource. */
export async function tagResource(resourceName: string, tags: Record<string, unknown>[]): Promise<TagResourceResult> {
  try {
    // TODO: implement tag_resource
    throw new Error("tag_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "tag_resource failed");
  }
}

/** Unpeer vpc. */
export async function unpeerVpc(regionName?: string): Promise<UnpeerVpcResult> {
  try {
    // TODO: implement unpeer_vpc
    throw new Error("unpeer_vpc not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "unpeer_vpc failed");
  }
}

/** Untag resource. */
export async function untagResource(resourceName: string, tagKeys: string[]): Promise<UntagResourceResult> {
  try {
    // TODO: implement untag_resource
    throw new Error("untag_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "untag_resource failed");
  }
}

/** Update bucket. */
export async function updateBucket(bucketName: string): Promise<UpdateBucketResult> {
  try {
    // TODO: implement update_bucket
    throw new Error("update_bucket not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_bucket failed");
  }
}

/** Update bucket bundle. */
export async function updateBucketBundle(bucketName: string, bundleId: string, regionName?: string): Promise<UpdateBucketBundleResult> {
  try {
    // TODO: implement update_bucket_bundle
    throw new Error("update_bucket_bundle not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_bucket_bundle failed");
  }
}

/** Update container service. */
export async function updateContainerService(serviceName: string): Promise<UpdateContainerServiceResult> {
  try {
    // TODO: implement update_container_service
    throw new Error("update_container_service not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_container_service failed");
  }
}

/** Update distribution. */
export async function updateDistribution(distributionName: string): Promise<UpdateDistributionResult> {
  try {
    // TODO: implement update_distribution
    throw new Error("update_distribution not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_distribution failed");
  }
}

/** Update distribution bundle. */
export async function updateDistributionBundle(): Promise<UpdateDistributionBundleResult> {
  try {
    // TODO: implement update_distribution_bundle
    throw new Error("update_distribution_bundle not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_distribution_bundle failed");
  }
}

/** Update domain entry. */
export async function updateDomainEntry(domainName: string, domainEntry: Record<string, unknown>, regionName?: string): Promise<UpdateDomainEntryResult> {
  try {
    // TODO: implement update_domain_entry
    throw new Error("update_domain_entry not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_domain_entry failed");
  }
}

/** Update instance metadata options. */
export async function updateInstanceMetadataOptions(instanceName: string): Promise<UpdateInstanceMetadataOptionsResult> {
  try {
    // TODO: implement update_instance_metadata_options
    throw new Error("update_instance_metadata_options not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_instance_metadata_options failed");
  }
}

/** Update load balancer attribute. */
export async function updateLoadBalancerAttribute(loadBalancerName: string, attributeName: string, attributeValue: string, regionName?: string): Promise<UpdateLoadBalancerAttributeResult> {
  try {
    // TODO: implement update_load_balancer_attribute
    throw new Error("update_load_balancer_attribute not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_load_balancer_attribute failed");
  }
}

/** Update relational database. */
export async function updateRelationalDatabase(relationalDatabaseName: string): Promise<UpdateRelationalDatabaseResult> {
  try {
    // TODO: implement update_relational_database
    throw new Error("update_relational_database not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_relational_database failed");
  }
}

/** Update relational database parameters. */
export async function updateRelationalDatabaseParameters(relationalDatabaseName: string, parameters: Record<string, unknown>[], regionName?: string): Promise<UpdateRelationalDatabaseParametersResult> {
  try {
    // TODO: implement update_relational_database_parameters
    throw new Error("update_relational_database_parameters not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_relational_database_parameters failed");
  }
}
