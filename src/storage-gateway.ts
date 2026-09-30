import { StorageGatewayClient } from "@aws-sdk/client-storagegateway";
import { getClient } from "./client";
import { wrapAwsError } from "./exceptions";

/** Metadata for a Storage Gateway. */
export type GatewayResult = {
  gatewayArn: string;
  gatewayId?: string;
  gatewayName?: string;
  gatewayType?: string;
  gatewayState?: string;
  gatewayTimezone?: string;
  extra?: Record<string, unknown>;
};

/** Metadata for an NFS file share. */
export type FileShareResult = {
  fileShareArn: string;
  fileShareId?: string;
  fileShareStatus?: string;
  gatewayArn?: string;
  locationArn?: string;
  role?: string;
  path?: string;
  extra?: Record<string, unknown>;
};

/** Metadata for a stored iSCSI volume. */
export type VolumeResult = {
  volumeArn: string;
  volumeId?: string;
  volumeType?: string;
  volumeStatus?: string;
  volumeSizeInBytes?: number;
  extra?: Record<string, unknown>;
};

/** Metadata for a volume snapshot. */
export type SnapshotResult = {
  snapshotId: string;
  volumeArn?: string;
  snapshotDescription?: string;
  extra?: Record<string, unknown>;
};

/** Result of add_cache. */
export type AddCacheResult = {
  gatewayArn?: string;
};

/** Result of add_tags_to_resource. */
export type AddTagsToResourceResult = {
  resourceArn?: string;
};

/** Result of add_upload_buffer. */
export type AddUploadBufferResult = {
  gatewayArn?: string;
};

/** Result of add_working_storage. */
export type AddWorkingStorageResult = {
  gatewayArn?: string;
};

/** Result of assign_tape_pool. */
export type AssignTapePoolResult = {
  tapeArn?: string;
};

/** Result of associate_file_system. */
export type AssociateFileSystemResult = {
  fileSystemAssociationArn?: string;
};

/** Result of attach_volume. */
export type AttachVolumeResult = {
  volumeArn?: string;
  targetArn?: string;
};

/** Result of cancel_archival. */
export type CancelArchivalResult = {
  tapeArn?: string;
};

/** Result of cancel_cache_report. */
export type CancelCacheReportResult = {
  cacheReportArn?: string;
};

/** Result of cancel_retrieval. */
export type CancelRetrievalResult = {
  tapeArn?: string;
};

/** Result of create_cached_iscsi_volume. */
export type CreateCachedIscsiVolumeResult = {
  volumeArn?: string;
  targetArn?: string;
};

/** Result of create_smb_file_share. */
export type CreateSmbFileShareResult = {
  fileShareArn?: string;
};

/** Result of create_snapshot_from_volume_recovery_point. */
export type CreateSnapshotFromVolumeRecoveryPointResult = {
  snapshotId?: string;
  volumeArn?: string;
  volumeRecoveryPointTime?: string;
};

/** Result of create_stored_iscsi_volume. */
export type CreateStoredIscsiVolumeResult = {
  volumeArn?: string;
  volumeSizeInBytes?: number;
  targetArn?: string;
};

/** Result of create_tape_pool. */
export type CreateTapePoolResult = {
  poolArn?: string;
};

/** Result of create_tape_with_barcode. */
export type CreateTapeWithBarcodeResult = {
  tapeArn?: string;
};

/** Result of create_tapes. */
export type CreateTapesResult = {
  tapeArNs?: string[];
};

/** Result of delete_automatic_tape_creation_policy. */
export type DeleteAutomaticTapeCreationPolicyResult = {
  gatewayArn?: string;
};

/** Result of delete_bandwidth_rate_limit. */
export type DeleteBandwidthRateLimitResult = {
  gatewayArn?: string;
};

/** Result of delete_cache_report. */
export type DeleteCacheReportResult = {
  cacheReportArn?: string;
};

/** Result of delete_chap_credentials. */
export type DeleteChapCredentialsResult = {
  targetArn?: string;
  initiatorName?: string;
};

/** Result of delete_snapshot_schedule. */
export type DeleteSnapshotScheduleResult = {
  volumeArn?: string;
};

/** Result of delete_tape. */
export type DeleteTapeResult = {
  tapeArn?: string;
};

/** Result of delete_tape_archive. */
export type DeleteTapeArchiveResult = {
  tapeArn?: string;
};

/** Result of delete_tape_pool. */
export type DeleteTapePoolResult = {
  poolArn?: string;
};

/** Result of delete_volume. */
export type DeleteVolumeResult = {
  volumeArn?: string;
};

/** Result of describe_availability_monitor_test. */
export type DescribeAvailabilityMonitorTestResult = {
  gatewayArn?: string;
  status?: string;
  startTime?: string;
};

/** Result of describe_bandwidth_rate_limit. */
export type DescribeBandwidthRateLimitResult = {
  gatewayArn?: string;
  averageUploadRateLimitInBitsPerSec?: number;
  averageDownloadRateLimitInBitsPerSec?: number;
};

/** Result of describe_bandwidth_rate_limit_schedule. */
export type DescribeBandwidthRateLimitScheduleResult = {
  gatewayArn?: string;
  bandwidthRateLimitIntervals?: Record<string, unknown>[];
};

/** Result of describe_cache. */
export type DescribeCacheResult = {
  gatewayArn?: string;
  diskIds?: string[];
  cacheAllocatedInBytes?: number;
  cacheUsedPercentage?: number;
  cacheDirtyPercentage?: number;
  cacheHitPercentage?: number;
  cacheMissPercentage?: number;
};

/** Result of describe_cache_report. */
export type DescribeCacheReportResult = {
  cacheReportInfo?: Record<string, unknown>;
};

/** Result of describe_cached_iscsi_volumes. */
export type DescribeCachedIscsiVolumesResult = {
  cachediScsiVolumes?: Record<string, unknown>[];
};

/** Result of describe_chap_credentials. */
export type DescribeChapCredentialsResult = {
  chapCredentials?: Record<string, unknown>[];
};

/** Result of describe_file_system_associations. */
export type DescribeFileSystemAssociationsResult = {
  fileSystemAssociationInfoList?: Record<string, unknown>[];
};

/** Result of describe_maintenance_start_time. */
export type DescribeMaintenanceStartTimeResult = {
  gatewayArn?: string;
  hourOfDay?: number;
  minuteOfHour?: number;
  dayOfWeek?: number;
  dayOfMonth?: number;
  timezone?: string;
  softwareUpdatePreferences?: Record<string, unknown>;
};

/** Result of describe_smb_file_shares. */
export type DescribeSmbFileSharesResult = {
  smbFileShareInfoList?: Record<string, unknown>[];
};

/** Result of describe_smb_settings. */
export type DescribeSmbSettingsResult = {
  gatewayArn?: string;
  domainName?: string;
  activeDirectoryStatus?: string;
  smbGuestPasswordSet?: boolean;
  smbSecurityStrategy?: string;
  fileSharesVisible?: boolean;
  smbLocalGroups?: Record<string, unknown>;
};

/** Result of describe_snapshot_schedule. */
export type DescribeSnapshotScheduleResult = {
  volumeArn?: string;
  startAt?: number;
  recurrenceInHours?: number;
  description?: string;
  timezone?: string;
  tags?: Record<string, unknown>[];
};

/** Result of describe_tape_archives. */
export type DescribeTapeArchivesResult = {
  tapeArchives?: Record<string, unknown>[];
  marker?: string;
};

/** Result of describe_tape_recovery_points. */
export type DescribeTapeRecoveryPointsResult = {
  gatewayArn?: string;
  tapeRecoveryPointInfos?: Record<string, unknown>[];
  marker?: string;
};

/** Result of describe_tapes. */
export type DescribeTapesResult = {
  tapes?: Record<string, unknown>[];
  marker?: string;
};

/** Result of describe_upload_buffer. */
export type DescribeUploadBufferResult = {
  gatewayArn?: string;
  diskIds?: string[];
  uploadBufferUsedInBytes?: number;
  uploadBufferAllocatedInBytes?: number;
};

/** Result of describe_vtl_devices. */
export type DescribeVtlDevicesResult = {
  gatewayArn?: string;
  vtlDevices?: Record<string, unknown>[];
  marker?: string;
};

/** Result of describe_working_storage. */
export type DescribeWorkingStorageResult = {
  gatewayArn?: string;
  diskIds?: string[];
  workingStorageUsedInBytes?: number;
  workingStorageAllocatedInBytes?: number;
};

/** Result of detach_volume. */
export type DetachVolumeResult = {
  volumeArn?: string;
};

/** Result of disable_gateway. */
export type DisableGatewayResult = {
  gatewayArn?: string;
};

/** Result of disassociate_file_system. */
export type DisassociateFileSystemResult = {
  fileSystemAssociationArn?: string;
};

/** Result of evict_files_failing_upload. */
export type EvictFilesFailingUploadResult = {
  notificationId?: string;
};

/** Result of join_domain. */
export type JoinDomainResult = {
  gatewayArn?: string;
  activeDirectoryStatus?: string;
};

/** Result of list_automatic_tape_creation_policies. */
export type ListAutomaticTapeCreationPoliciesResult = {
  automaticTapeCreationPolicyInfos?: Record<string, unknown>[];
};

/** Result of list_cache_reports. */
export type ListCacheReportsResult = {
  cacheReportList?: Record<string, unknown>[];
  marker?: string;
};

/** Result of list_file_system_associations. */
export type ListFileSystemAssociationsResult = {
  marker?: string;
  nextMarker?: string;
  fileSystemAssociationSummaryList?: Record<string, unknown>[];
};

/** Result of list_local_disks. */
export type ListLocalDisksResult = {
  gatewayArn?: string;
  disks?: Record<string, unknown>[];
};

/** Result of list_tags_for_resource. */
export type ListTagsForResourceResult = {
  resourceArn?: string;
  marker?: string;
  tags?: Record<string, unknown>[];
};

/** Result of list_tape_pools. */
export type ListTapePoolsResult = {
  poolInfos?: Record<string, unknown>[];
  marker?: string;
};

/** Result of list_tapes. */
export type ListTapesResult = {
  tapeInfos?: Record<string, unknown>[];
  marker?: string;
};

/** Result of list_volume_initiators. */
export type ListVolumeInitiatorsResult = {
  initiators?: string[];
};

/** Result of list_volume_recovery_points. */
export type ListVolumeRecoveryPointsResult = {
  gatewayArn?: string;
  volumeRecoveryPointInfos?: Record<string, unknown>[];
};

/** Result of notify_when_uploaded. */
export type NotifyWhenUploadedResult = {
  fileShareArn?: string;
  notificationId?: string;
};

/** Result of refresh_cache. */
export type RefreshCacheResult = {
  fileShareArn?: string;
  notificationId?: string;
};

/** Result of remove_tags_from_resource. */
export type RemoveTagsFromResourceResult = {
  resourceArn?: string;
};

/** Result of reset_cache. */
export type ResetCacheResult = {
  gatewayArn?: string;
};

/** Result of retrieve_tape_archive. */
export type RetrieveTapeArchiveResult = {
  tapeArn?: string;
};

/** Result of retrieve_tape_recovery_point. */
export type RetrieveTapeRecoveryPointResult = {
  tapeArn?: string;
};

/** Result of set_local_console_password. */
export type SetLocalConsolePasswordResult = {
  gatewayArn?: string;
};

/** Result of set_smb_guest_password. */
export type SetSmbGuestPasswordResult = {
  gatewayArn?: string;
};

/** Result of start_availability_monitor_test. */
export type StartAvailabilityMonitorTestResult = {
  gatewayArn?: string;
};

/** Result of start_cache_report. */
export type StartCacheReportResult = {
  cacheReportArn?: string;
};

/** Result of start_gateway. */
export type StartGatewayResult = {
  gatewayArn?: string;
};

/** Result of update_automatic_tape_creation_policy. */
export type UpdateAutomaticTapeCreationPolicyResult = {
  gatewayArn?: string;
};

/** Result of update_bandwidth_rate_limit. */
export type UpdateBandwidthRateLimitResult = {
  gatewayArn?: string;
};

/** Result of update_bandwidth_rate_limit_schedule. */
export type UpdateBandwidthRateLimitScheduleResult = {
  gatewayArn?: string;
};

/** Result of update_chap_credentials. */
export type UpdateChapCredentialsResult = {
  targetArn?: string;
  initiatorName?: string;
};

/** Result of update_file_system_association. */
export type UpdateFileSystemAssociationResult = {
  fileSystemAssociationArn?: string;
};

/** Result of update_gateway_information. */
export type UpdateGatewayInformationResult = {
  gatewayArn?: string;
  gatewayName?: string;
};

/** Result of update_gateway_software_now. */
export type UpdateGatewaySoftwareNowResult = {
  gatewayArn?: string;
};

/** Result of update_maintenance_start_time. */
export type UpdateMaintenanceStartTimeResult = {
  gatewayArn?: string;
};

/** Result of update_smb_file_share. */
export type UpdateSmbFileShareResult = {
  fileShareArn?: string;
};

/** Result of update_smb_file_share_visibility. */
export type UpdateSmbFileShareVisibilityResult = {
  gatewayArn?: string;
};

/** Result of update_smb_local_groups. */
export type UpdateSmbLocalGroupsResult = {
  gatewayArn?: string;
};

/** Result of update_smb_security_strategy. */
export type UpdateSmbSecurityStrategyResult = {
  gatewayArn?: string;
};

/** Result of update_snapshot_schedule. */
export type UpdateSnapshotScheduleResult = {
  volumeArn?: string;
};

/** Result of update_vtl_device_type. */
export type UpdateVtlDeviceTypeResult = {
  vtlDeviceArn?: string;
};

/** Activate a Storage Gateway and return the gateway ARN. */
export async function activateGateway(): Promise<string> {
  try {
    // TODO: implement activate_gateway
    throw new Error("activate_gateway not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "activate_gateway failed");
  }
}

/** Describe a single Storage Gateway. */
export async function describeGatewayInformation(gatewayArn: string): Promise<GatewayResult> {
  try {
    // TODO: implement describe_gateway_information
    throw new Error("describe_gateway_information not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_gateway_information failed");
  }
}

/** List all Storage Gateways in the account. */
export async function listGateways(): Promise<GatewayResult[]> {
  try {
    // TODO: implement list_gateways
    throw new Error("list_gateways not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_gateways failed");
  }
}

/** Delete a Storage Gateway. */
export async function deleteGateway(gatewayArn: string): Promise<string> {
  try {
    // TODO: implement delete_gateway
    throw new Error("delete_gateway not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_gateway failed");
  }
}

/** Shut down a Storage Gateway. */
export async function shutdownGateway(gatewayArn: string): Promise<string> {
  try {
    // TODO: implement shutdown_gateway
    throw new Error("shutdown_gateway not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "shutdown_gateway failed");
  }
}

/** Create an NFS file share on a file gateway. */
export async function createNfsFileShare(): Promise<FileShareResult> {
  try {
    // TODO: implement create_nfs_file_share
    throw new Error("create_nfs_file_share not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_nfs_file_share failed");
  }
}

/** Describe one or more NFS file shares. */
export async function describeNfsFileShares(fileShareArns: string[]): Promise<FileShareResult[]> {
  try {
    // TODO: implement describe_nfs_file_shares
    throw new Error("describe_nfs_file_shares not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_nfs_file_shares failed");
  }
}

/** Update an NFS file share. */
export async function updateNfsFileShare(fileShareArn: string): Promise<FileShareResult> {
  try {
    // TODO: implement update_nfs_file_share
    throw new Error("update_nfs_file_share not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_nfs_file_share failed");
  }
}

/** Delete a file share. */
export async function deleteFileShare(fileShareArn: string): Promise<string> {
  try {
    // TODO: implement delete_file_share
    throw new Error("delete_file_share not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_file_share failed");
  }
}

/** List file shares, optionally filtered by gateway. */
export async function listFileShares(): Promise<FileShareResult[]> {
  try {
    // TODO: implement list_file_shares
    throw new Error("list_file_shares not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_file_shares failed");
  }
}

/** List gateway volumes. */
export async function listVolumes(): Promise<VolumeResult[]> {
  try {
    // TODO: implement list_volumes
    throw new Error("list_volumes not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_volumes failed");
  }
}

/** Describe stored iSCSI volumes. */
export async function describeStoredIscsiVolumes(volumeArns: string[]): Promise<VolumeResult[]> {
  try {
    // TODO: implement describe_stored_iscsi_volumes
    throw new Error("describe_stored_iscsi_volumes not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_stored_iscsi_volumes failed");
  }
}

/** Create a snapshot of a gateway volume. */
export async function createSnapshot(volumeArn: string): Promise<SnapshotResult> {
  try {
    // TODO: implement create_snapshot
    throw new Error("create_snapshot not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_snapshot failed");
  }
}

/** Describe snapshots for a volume. */
export async function describeSnapshots(volumeArn: string): Promise<SnapshotResult[]> {
  try {
    // TODO: implement describe_snapshots
    throw new Error("describe_snapshots not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_snapshots failed");
  }
}

/** Add cache. */
export async function addCache(gatewayArn: string, diskIds: string[], regionName?: string): Promise<AddCacheResult> {
  try {
    // TODO: implement add_cache
    throw new Error("add_cache not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "add_cache failed");
  }
}

/** Add tags to resource. */
export async function addTagsToResource(resourceArn: string, tags: Record<string, unknown>[], regionName?: string): Promise<AddTagsToResourceResult> {
  try {
    // TODO: implement add_tags_to_resource
    throw new Error("add_tags_to_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "add_tags_to_resource failed");
  }
}

/** Add upload buffer. */
export async function addUploadBuffer(gatewayArn: string, diskIds: string[], regionName?: string): Promise<AddUploadBufferResult> {
  try {
    // TODO: implement add_upload_buffer
    throw new Error("add_upload_buffer not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "add_upload_buffer failed");
  }
}

/** Add working storage. */
export async function addWorkingStorage(gatewayArn: string, diskIds: string[], regionName?: string): Promise<AddWorkingStorageResult> {
  try {
    // TODO: implement add_working_storage
    throw new Error("add_working_storage not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "add_working_storage failed");
  }
}

/** Assign tape pool. */
export async function assignTapePool(tapeArn: string, poolId: string): Promise<AssignTapePoolResult> {
  try {
    // TODO: implement assign_tape_pool
    throw new Error("assign_tape_pool not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "assign_tape_pool failed");
  }
}

/** Associate file system. */
export async function associateFileSystem(userName: string, password: string, clientToken: string, gatewayArn: string, locationArn: string): Promise<AssociateFileSystemResult> {
  try {
    // TODO: implement associate_file_system
    throw new Error("associate_file_system not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "associate_file_system failed");
  }
}

/** Attach volume. */
export async function attachVolume(gatewayArn: string, volumeArn: string, networkInterfaceId: string): Promise<AttachVolumeResult> {
  try {
    // TODO: implement attach_volume
    throw new Error("attach_volume not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "attach_volume failed");
  }
}

/** Cancel archival. */
export async function cancelArchival(gatewayArn: string, tapeArn: string, regionName?: string): Promise<CancelArchivalResult> {
  try {
    // TODO: implement cancel_archival
    throw new Error("cancel_archival not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "cancel_archival failed");
  }
}

/** Cancel cache report. */
export async function cancelCacheReport(cacheReportArn: string, regionName?: string): Promise<CancelCacheReportResult> {
  try {
    // TODO: implement cancel_cache_report
    throw new Error("cancel_cache_report not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "cancel_cache_report failed");
  }
}

/** Cancel retrieval. */
export async function cancelRetrieval(gatewayArn: string, tapeArn: string, regionName?: string): Promise<CancelRetrievalResult> {
  try {
    // TODO: implement cancel_retrieval
    throw new Error("cancel_retrieval not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "cancel_retrieval failed");
  }
}

/** Create cached iscsi volume. */
export async function createCachedIscsiVolume(gatewayArn: string, volumeSizeInBytes: number, targetName: string, networkInterfaceId: string, clientToken: string): Promise<CreateCachedIscsiVolumeResult> {
  try {
    // TODO: implement create_cached_iscsi_volume
    throw new Error("create_cached_iscsi_volume not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_cached_iscsi_volume failed");
  }
}

/** Create smb file share. */
export async function createSmbFileShare(clientToken: string, gatewayArn: string, role: string, locationArn: string): Promise<CreateSmbFileShareResult> {
  try {
    // TODO: implement create_smb_file_share
    throw new Error("create_smb_file_share not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_smb_file_share failed");
  }
}

/** Create snapshot from volume recovery point. */
export async function createSnapshotFromVolumeRecoveryPoint(volumeArn: string, snapshotDescription: string): Promise<CreateSnapshotFromVolumeRecoveryPointResult> {
  try {
    // TODO: implement create_snapshot_from_volume_recovery_point
    throw new Error("create_snapshot_from_volume_recovery_point not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_snapshot_from_volume_recovery_point failed");
  }
}

/** Create stored iscsi volume. */
export async function createStoredIscsiVolume(gatewayArn: string, diskId: string, preserveExistingData: boolean, targetName: string, networkInterfaceId: string): Promise<CreateStoredIscsiVolumeResult> {
  try {
    // TODO: implement create_stored_iscsi_volume
    throw new Error("create_stored_iscsi_volume not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_stored_iscsi_volume failed");
  }
}

/** Create tape pool. */
export async function createTapePool(poolName: string, storageClass: string): Promise<CreateTapePoolResult> {
  try {
    // TODO: implement create_tape_pool
    throw new Error("create_tape_pool not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_tape_pool failed");
  }
}

/** Create tape with barcode. */
export async function createTapeWithBarcode(gatewayArn: string, tapeSizeInBytes: number, tapeBarcode: string): Promise<CreateTapeWithBarcodeResult> {
  try {
    // TODO: implement create_tape_with_barcode
    throw new Error("create_tape_with_barcode not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_tape_with_barcode failed");
  }
}

/** Create tapes. */
export async function createTapes(gatewayArn: string, tapeSizeInBytes: number, clientToken: string, numTapesToCreate: number, tapeBarcodePrefix: string): Promise<CreateTapesResult> {
  try {
    // TODO: implement create_tapes
    throw new Error("create_tapes not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_tapes failed");
  }
}

/** Delete automatic tape creation policy. */
export async function deleteAutomaticTapeCreationPolicy(gatewayArn: string, regionName?: string): Promise<DeleteAutomaticTapeCreationPolicyResult> {
  try {
    // TODO: implement delete_automatic_tape_creation_policy
    throw new Error("delete_automatic_tape_creation_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_automatic_tape_creation_policy failed");
  }
}

/** Delete bandwidth rate limit. */
export async function deleteBandwidthRateLimit(gatewayArn: string, bandwidthType: string, regionName?: string): Promise<DeleteBandwidthRateLimitResult> {
  try {
    // TODO: implement delete_bandwidth_rate_limit
    throw new Error("delete_bandwidth_rate_limit not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_bandwidth_rate_limit failed");
  }
}

/** Delete cache report. */
export async function deleteCacheReport(cacheReportArn: string, regionName?: string): Promise<DeleteCacheReportResult> {
  try {
    // TODO: implement delete_cache_report
    throw new Error("delete_cache_report not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_cache_report failed");
  }
}

/** Delete chap credentials. */
export async function deleteChapCredentials(targetArn: string, initiatorName: string, regionName?: string): Promise<DeleteChapCredentialsResult> {
  try {
    // TODO: implement delete_chap_credentials
    throw new Error("delete_chap_credentials not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_chap_credentials failed");
  }
}

/** Delete snapshot schedule. */
export async function deleteSnapshotSchedule(volumeArn: string, regionName?: string): Promise<DeleteSnapshotScheduleResult> {
  try {
    // TODO: implement delete_snapshot_schedule
    throw new Error("delete_snapshot_schedule not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_snapshot_schedule failed");
  }
}

/** Delete tape. */
export async function deleteTape(gatewayArn: string, tapeArn: string): Promise<DeleteTapeResult> {
  try {
    // TODO: implement delete_tape
    throw new Error("delete_tape not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_tape failed");
  }
}

/** Delete tape archive. */
export async function deleteTapeArchive(tapeArn: string): Promise<DeleteTapeArchiveResult> {
  try {
    // TODO: implement delete_tape_archive
    throw new Error("delete_tape_archive not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_tape_archive failed");
  }
}

/** Delete tape pool. */
export async function deleteTapePool(poolArn: string, regionName?: string): Promise<DeleteTapePoolResult> {
  try {
    // TODO: implement delete_tape_pool
    throw new Error("delete_tape_pool not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_tape_pool failed");
  }
}

/** Delete volume. */
export async function deleteVolume(volumeArn: string, regionName?: string): Promise<DeleteVolumeResult> {
  try {
    // TODO: implement delete_volume
    throw new Error("delete_volume not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_volume failed");
  }
}

/** Describe availability monitor test. */
export async function describeAvailabilityMonitorTest(gatewayArn: string, regionName?: string): Promise<DescribeAvailabilityMonitorTestResult> {
  try {
    // TODO: implement describe_availability_monitor_test
    throw new Error("describe_availability_monitor_test not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_availability_monitor_test failed");
  }
}

/** Describe bandwidth rate limit. */
export async function describeBandwidthRateLimit(gatewayArn: string, regionName?: string): Promise<DescribeBandwidthRateLimitResult> {
  try {
    // TODO: implement describe_bandwidth_rate_limit
    throw new Error("describe_bandwidth_rate_limit not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_bandwidth_rate_limit failed");
  }
}

/** Describe bandwidth rate limit schedule. */
export async function describeBandwidthRateLimitSchedule(gatewayArn: string, regionName?: string): Promise<DescribeBandwidthRateLimitScheduleResult> {
  try {
    // TODO: implement describe_bandwidth_rate_limit_schedule
    throw new Error("describe_bandwidth_rate_limit_schedule not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_bandwidth_rate_limit_schedule failed");
  }
}

/** Describe cache. */
export async function describeCache(gatewayArn: string, regionName?: string): Promise<DescribeCacheResult> {
  try {
    // TODO: implement describe_cache
    throw new Error("describe_cache not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_cache failed");
  }
}

/** Describe cache report. */
export async function describeCacheReport(cacheReportArn: string, regionName?: string): Promise<DescribeCacheReportResult> {
  try {
    // TODO: implement describe_cache_report
    throw new Error("describe_cache_report not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_cache_report failed");
  }
}

/** Describe cached iscsi volumes. */
export async function describeCachedIscsiVolumes(volumeArNs: string[], regionName?: string): Promise<DescribeCachedIscsiVolumesResult> {
  try {
    // TODO: implement describe_cached_iscsi_volumes
    throw new Error("describe_cached_iscsi_volumes not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_cached_iscsi_volumes failed");
  }
}

/** Describe chap credentials. */
export async function describeChapCredentials(targetArn: string, regionName?: string): Promise<DescribeChapCredentialsResult> {
  try {
    // TODO: implement describe_chap_credentials
    throw new Error("describe_chap_credentials not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_chap_credentials failed");
  }
}

/** Describe file system associations. */
export async function describeFileSystemAssociations(fileSystemAssociationArnList: string[], regionName?: string): Promise<DescribeFileSystemAssociationsResult> {
  try {
    // TODO: implement describe_file_system_associations
    throw new Error("describe_file_system_associations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_file_system_associations failed");
  }
}

/** Describe maintenance start time. */
export async function describeMaintenanceStartTime(gatewayArn: string, regionName?: string): Promise<DescribeMaintenanceStartTimeResult> {
  try {
    // TODO: implement describe_maintenance_start_time
    throw new Error("describe_maintenance_start_time not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_maintenance_start_time failed");
  }
}

/** Describe smb file shares. */
export async function describeSmbFileShares(fileShareArnList: string[], regionName?: string): Promise<DescribeSmbFileSharesResult> {
  try {
    // TODO: implement describe_smb_file_shares
    throw new Error("describe_smb_file_shares not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_smb_file_shares failed");
  }
}

/** Describe smb settings. */
export async function describeSmbSettings(gatewayArn: string, regionName?: string): Promise<DescribeSmbSettingsResult> {
  try {
    // TODO: implement describe_smb_settings
    throw new Error("describe_smb_settings not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_smb_settings failed");
  }
}

/** Describe snapshot schedule. */
export async function describeSnapshotSchedule(volumeArn: string, regionName?: string): Promise<DescribeSnapshotScheduleResult> {
  try {
    // TODO: implement describe_snapshot_schedule
    throw new Error("describe_snapshot_schedule not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_snapshot_schedule failed");
  }
}

/** Describe tape archives. */
export async function describeTapeArchives(): Promise<DescribeTapeArchivesResult> {
  try {
    // TODO: implement describe_tape_archives
    throw new Error("describe_tape_archives not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_tape_archives failed");
  }
}

/** Describe tape recovery points. */
export async function describeTapeRecoveryPoints(gatewayArn: string): Promise<DescribeTapeRecoveryPointsResult> {
  try {
    // TODO: implement describe_tape_recovery_points
    throw new Error("describe_tape_recovery_points not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_tape_recovery_points failed");
  }
}

/** Describe tapes. */
export async function describeTapes(gatewayArn: string): Promise<DescribeTapesResult> {
  try {
    // TODO: implement describe_tapes
    throw new Error("describe_tapes not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_tapes failed");
  }
}

/** Describe upload buffer. */
export async function describeUploadBuffer(gatewayArn: string, regionName?: string): Promise<DescribeUploadBufferResult> {
  try {
    // TODO: implement describe_upload_buffer
    throw new Error("describe_upload_buffer not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_upload_buffer failed");
  }
}

/** Describe vtl devices. */
export async function describeVtlDevices(gatewayArn: string): Promise<DescribeVtlDevicesResult> {
  try {
    // TODO: implement describe_vtl_devices
    throw new Error("describe_vtl_devices not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_vtl_devices failed");
  }
}

/** Describe working storage. */
export async function describeWorkingStorage(gatewayArn: string, regionName?: string): Promise<DescribeWorkingStorageResult> {
  try {
    // TODO: implement describe_working_storage
    throw new Error("describe_working_storage not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_working_storage failed");
  }
}

/** Detach volume. */
export async function detachVolume(volumeArn: string): Promise<DetachVolumeResult> {
  try {
    // TODO: implement detach_volume
    throw new Error("detach_volume not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "detach_volume failed");
  }
}

/** Disable gateway. */
export async function disableGateway(gatewayArn: string, regionName?: string): Promise<DisableGatewayResult> {
  try {
    // TODO: implement disable_gateway
    throw new Error("disable_gateway not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disable_gateway failed");
  }
}

/** Disassociate file system. */
export async function disassociateFileSystem(fileSystemAssociationArn: string): Promise<DisassociateFileSystemResult> {
  try {
    // TODO: implement disassociate_file_system
    throw new Error("disassociate_file_system not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disassociate_file_system failed");
  }
}

/** Evict files failing upload. */
export async function evictFilesFailingUpload(fileShareArn: string): Promise<EvictFilesFailingUploadResult> {
  try {
    // TODO: implement evict_files_failing_upload
    throw new Error("evict_files_failing_upload not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "evict_files_failing_upload failed");
  }
}

/** Join domain. */
export async function joinDomain(gatewayArn: string, domainName: string, userName: string, password: string): Promise<JoinDomainResult> {
  try {
    // TODO: implement join_domain
    throw new Error("join_domain not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "join_domain failed");
  }
}

/** List automatic tape creation policies. */
export async function listAutomaticTapeCreationPolicies(): Promise<ListAutomaticTapeCreationPoliciesResult> {
  try {
    // TODO: implement list_automatic_tape_creation_policies
    throw new Error("list_automatic_tape_creation_policies not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_automatic_tape_creation_policies failed");
  }
}

/** List cache reports. */
export async function listCacheReports(): Promise<ListCacheReportsResult> {
  try {
    // TODO: implement list_cache_reports
    throw new Error("list_cache_reports not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_cache_reports failed");
  }
}

/** List file system associations. */
export async function listFileSystemAssociations(): Promise<ListFileSystemAssociationsResult> {
  try {
    // TODO: implement list_file_system_associations
    throw new Error("list_file_system_associations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_file_system_associations failed");
  }
}

/** List local disks. */
export async function listLocalDisks(gatewayArn: string, regionName?: string): Promise<ListLocalDisksResult> {
  try {
    // TODO: implement list_local_disks
    throw new Error("list_local_disks not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_local_disks failed");
  }
}

/** List tags for resource. */
export async function listTagsForResource(resourceArn: string): Promise<ListTagsForResourceResult> {
  try {
    // TODO: implement list_tags_for_resource
    throw new Error("list_tags_for_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_tags_for_resource failed");
  }
}

/** List tape pools. */
export async function listTapePools(): Promise<ListTapePoolsResult> {
  try {
    // TODO: implement list_tape_pools
    throw new Error("list_tape_pools not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_tape_pools failed");
  }
}

/** List tapes. */
export async function listTapes(): Promise<ListTapesResult> {
  try {
    // TODO: implement list_tapes
    throw new Error("list_tapes not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_tapes failed");
  }
}

/** List volume initiators. */
export async function listVolumeInitiators(volumeArn: string, regionName?: string): Promise<ListVolumeInitiatorsResult> {
  try {
    // TODO: implement list_volume_initiators
    throw new Error("list_volume_initiators not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_volume_initiators failed");
  }
}

/** List volume recovery points. */
export async function listVolumeRecoveryPoints(gatewayArn: string, regionName?: string): Promise<ListVolumeRecoveryPointsResult> {
  try {
    // TODO: implement list_volume_recovery_points
    throw new Error("list_volume_recovery_points not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_volume_recovery_points failed");
  }
}

/** Notify when uploaded. */
export async function notifyWhenUploaded(fileShareArn: string, regionName?: string): Promise<NotifyWhenUploadedResult> {
  try {
    // TODO: implement notify_when_uploaded
    throw new Error("notify_when_uploaded not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "notify_when_uploaded failed");
  }
}

/** Refresh cache. */
export async function refreshCache(fileShareArn: string): Promise<RefreshCacheResult> {
  try {
    // TODO: implement refresh_cache
    throw new Error("refresh_cache not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "refresh_cache failed");
  }
}

/** Remove tags from resource. */
export async function removeTagsFromResource(resourceArn: string, tagKeys: string[], regionName?: string): Promise<RemoveTagsFromResourceResult> {
  try {
    // TODO: implement remove_tags_from_resource
    throw new Error("remove_tags_from_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "remove_tags_from_resource failed");
  }
}

/** Reset cache. */
export async function resetCache(gatewayArn: string, regionName?: string): Promise<ResetCacheResult> {
  try {
    // TODO: implement reset_cache
    throw new Error("reset_cache not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "reset_cache failed");
  }
}

/** Retrieve tape archive. */
export async function retrieveTapeArchive(tapeArn: string, gatewayArn: string, regionName?: string): Promise<RetrieveTapeArchiveResult> {
  try {
    // TODO: implement retrieve_tape_archive
    throw new Error("retrieve_tape_archive not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "retrieve_tape_archive failed");
  }
}

/** Retrieve tape recovery point. */
export async function retrieveTapeRecoveryPoint(tapeArn: string, gatewayArn: string, regionName?: string): Promise<RetrieveTapeRecoveryPointResult> {
  try {
    // TODO: implement retrieve_tape_recovery_point
    throw new Error("retrieve_tape_recovery_point not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "retrieve_tape_recovery_point failed");
  }
}

/** Set local console password. */
export async function setLocalConsolePassword(gatewayArn: string, localConsolePassword: string, regionName?: string): Promise<SetLocalConsolePasswordResult> {
  try {
    // TODO: implement set_local_console_password
    throw new Error("set_local_console_password not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "set_local_console_password failed");
  }
}

/** Set smb guest password. */
export async function setSmbGuestPassword(gatewayArn: string, password: string, regionName?: string): Promise<SetSmbGuestPasswordResult> {
  try {
    // TODO: implement set_smb_guest_password
    throw new Error("set_smb_guest_password not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "set_smb_guest_password failed");
  }
}

/** Start availability monitor test. */
export async function startAvailabilityMonitorTest(gatewayArn: string, regionName?: string): Promise<StartAvailabilityMonitorTestResult> {
  try {
    // TODO: implement start_availability_monitor_test
    throw new Error("start_availability_monitor_test not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_availability_monitor_test failed");
  }
}

/** Start cache report. */
export async function startCacheReport(fileShareArn: string, role: string, locationArn: string, bucketRegion: string, clientToken: string): Promise<StartCacheReportResult> {
  try {
    // TODO: implement start_cache_report
    throw new Error("start_cache_report not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_cache_report failed");
  }
}

/** Start gateway. */
export async function startGateway(gatewayArn: string, regionName?: string): Promise<StartGatewayResult> {
  try {
    // TODO: implement start_gateway
    throw new Error("start_gateway not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_gateway failed");
  }
}

/** Update automatic tape creation policy. */
export async function updateAutomaticTapeCreationPolicy(automaticTapeCreationRules: Record<string, unknown>[], gatewayArn: string, regionName?: string): Promise<UpdateAutomaticTapeCreationPolicyResult> {
  try {
    // TODO: implement update_automatic_tape_creation_policy
    throw new Error("update_automatic_tape_creation_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_automatic_tape_creation_policy failed");
  }
}

/** Update bandwidth rate limit. */
export async function updateBandwidthRateLimit(gatewayArn: string): Promise<UpdateBandwidthRateLimitResult> {
  try {
    // TODO: implement update_bandwidth_rate_limit
    throw new Error("update_bandwidth_rate_limit not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_bandwidth_rate_limit failed");
  }
}

/** Update bandwidth rate limit schedule. */
export async function updateBandwidthRateLimitSchedule(gatewayArn: string, bandwidthRateLimitIntervals: Record<string, unknown>[], regionName?: string): Promise<UpdateBandwidthRateLimitScheduleResult> {
  try {
    // TODO: implement update_bandwidth_rate_limit_schedule
    throw new Error("update_bandwidth_rate_limit_schedule not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_bandwidth_rate_limit_schedule failed");
  }
}

/** Update chap credentials. */
export async function updateChapCredentials(targetArn: string, secretToAuthenticateInitiator: string, initiatorName: string): Promise<UpdateChapCredentialsResult> {
  try {
    // TODO: implement update_chap_credentials
    throw new Error("update_chap_credentials not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_chap_credentials failed");
  }
}

/** Update file system association. */
export async function updateFileSystemAssociation(fileSystemAssociationArn: string): Promise<UpdateFileSystemAssociationResult> {
  try {
    // TODO: implement update_file_system_association
    throw new Error("update_file_system_association not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_file_system_association failed");
  }
}

/** Update gateway information. */
export async function updateGatewayInformation(gatewayArn: string): Promise<UpdateGatewayInformationResult> {
  try {
    // TODO: implement update_gateway_information
    throw new Error("update_gateway_information not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_gateway_information failed");
  }
}

/** Update gateway software now. */
export async function updateGatewaySoftwareNow(gatewayArn: string, regionName?: string): Promise<UpdateGatewaySoftwareNowResult> {
  try {
    // TODO: implement update_gateway_software_now
    throw new Error("update_gateway_software_now not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_gateway_software_now failed");
  }
}

/** Update maintenance start time. */
export async function updateMaintenanceStartTime(gatewayArn: string): Promise<UpdateMaintenanceStartTimeResult> {
  try {
    // TODO: implement update_maintenance_start_time
    throw new Error("update_maintenance_start_time not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_maintenance_start_time failed");
  }
}

/** Update smb file share. */
export async function updateSmbFileShare(fileShareArn: string): Promise<UpdateSmbFileShareResult> {
  try {
    // TODO: implement update_smb_file_share
    throw new Error("update_smb_file_share not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_smb_file_share failed");
  }
}

/** Update smb file share visibility. */
export async function updateSmbFileShareVisibility(gatewayArn: string, fileSharesVisible: boolean, regionName?: string): Promise<UpdateSmbFileShareVisibilityResult> {
  try {
    // TODO: implement update_smb_file_share_visibility
    throw new Error("update_smb_file_share_visibility not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_smb_file_share_visibility failed");
  }
}

/** Update smb local groups. */
export async function updateSmbLocalGroups(gatewayArn: string, smbLocalGroups: Record<string, unknown>, regionName?: string): Promise<UpdateSmbLocalGroupsResult> {
  try {
    // TODO: implement update_smb_local_groups
    throw new Error("update_smb_local_groups not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_smb_local_groups failed");
  }
}

/** Update smb security strategy. */
export async function updateSmbSecurityStrategy(gatewayArn: string, smbSecurityStrategy: string, regionName?: string): Promise<UpdateSmbSecurityStrategyResult> {
  try {
    // TODO: implement update_smb_security_strategy
    throw new Error("update_smb_security_strategy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_smb_security_strategy failed");
  }
}

/** Update snapshot schedule. */
export async function updateSnapshotSchedule(volumeArn: string, startAt: number, recurrenceInHours: number): Promise<UpdateSnapshotScheduleResult> {
  try {
    // TODO: implement update_snapshot_schedule
    throw new Error("update_snapshot_schedule not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_snapshot_schedule failed");
  }
}

/** Update vtl device type. */
export async function updateVtlDeviceType(vtlDeviceArn: string, deviceType: string, regionName?: string): Promise<UpdateVtlDeviceTypeResult> {
  try {
    // TODO: implement update_vtl_device_type
    throw new Error("update_vtl_device_type not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_vtl_device_type failed");
  }
}
