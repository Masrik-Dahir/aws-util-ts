import { FsxClient } from "@aws-sdk/client-fsx";
import { getClient } from "./client";
import { wrapAwsError } from "./exceptions";

/** Metadata for an FSx file system. */
export type FileSystemResult = {
  fileSystemId: string;
  fileSystemType?: string;
  lifecycle?: string;
  storageCapacity?: number;
  storageType?: string;
  subnetIds?: string[];
  dnsName?: string;
  resourceArn?: string;
  tags?: Record<string, unknown>;
  extra?: Record<string, unknown>;
};

/** Metadata for an FSx backup. */
export type BackupResult = {
  backupId: string;
  lifecycle?: string;
  backupType?: string;
  fileSystem?: Record<string, unknown>;
  resourceArn?: string;
  tags?: Record<string, unknown>;
  extra?: Record<string, unknown>;
};

/** Metadata for an FSx volume. */
export type VolumeResult = {
  volumeId: string;
  name?: string;
  lifecycle?: string;
  volumeType?: string;
  fileSystemId?: string;
  resourceArn?: string;
  tags?: Record<string, unknown>;
  extra?: Record<string, unknown>;
};

/** Metadata for an FSx data-repository association. */
export type DataRepositoryAssociationResult = {
  associationId: string;
  fileSystemId?: string;
  fileSystemPath?: string;
  dataRepositoryPath?: string;
  lifecycle?: string;
  resourceArn?: string;
  tags?: Record<string, unknown>;
  extra?: Record<string, unknown>;
};

/** Metadata for an FSx data-repository task. */
export type DataRepositoryTaskResult = {
  taskId: string;
  lifecycle?: string;
  taskType?: string;
  fileSystemId?: string;
  resourceArn?: string;
  tags?: Record<string, unknown>;
  extra?: Record<string, unknown>;
};

/** Metadata for an FSx file-system alias. */
export type FileSystemAliasResult = {
  name?: string;
  lifecycle?: string;
  extra?: Record<string, unknown>;
};

/** Result of copy_snapshot_and_update_volume. */
export type CopySnapshotAndUpdateVolumeResult = {
  volumeId?: string;
  lifecycle?: string;
  administrativeActions?: Record<string, unknown>[];
};

/** Result of create_and_attach_s3_access_point. */
export type CreateAndAttachS3AccessPointResult = {
  s3AccessPointAttachment?: Record<string, unknown>;
};

/** Result of create_file_cache. */
export type CreateFileCacheResult = {
  fileCache?: Record<string, unknown>;
};

/** Result of create_file_system_from_backup. */
export type CreateFileSystemFromBackupResult = {
  fileSystem?: Record<string, unknown>;
};

/** Result of create_snapshot. */
export type CreateSnapshotResult = {
  snapshot?: Record<string, unknown>;
};

/** Result of create_storage_virtual_machine. */
export type CreateStorageVirtualMachineResult = {
  storageVirtualMachine?: Record<string, unknown>;
};

/** Result of create_volume_from_backup. */
export type CreateVolumeFromBackupResult = {
  volume?: Record<string, unknown>;
};

/** Result of delete_data_repository_association. */
export type DeleteDataRepositoryAssociationResult = {
  associationId?: string;
  lifecycle?: string;
  deleteDataInFileSystem?: boolean;
};

/** Result of delete_file_cache. */
export type DeleteFileCacheResult = {
  fileCacheId?: string;
  lifecycle?: string;
};

/** Result of delete_snapshot. */
export type DeleteSnapshotResult = {
  snapshotId?: string;
  lifecycle?: string;
};

/** Result of delete_storage_virtual_machine. */
export type DeleteStorageVirtualMachineResult = {
  storageVirtualMachineId?: string;
  lifecycle?: string;
};

/** Result of describe_file_caches. */
export type DescribeFileCachesResult = {
  fileCaches?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of describe_s3_access_point_attachments. */
export type DescribeS3AccessPointAttachmentsResult = {
  s3AccessPointAttachments?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of describe_shared_vpc_configuration. */
export type DescribeSharedVpcConfigurationResult = {
  enableFsxRouteTableUpdatesFromParticipantAccounts?: string;
};

/** Result of describe_snapshots. */
export type DescribeSnapshotsResult = {
  snapshots?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of describe_storage_virtual_machines. */
export type DescribeStorageVirtualMachinesResult = {
  storageVirtualMachines?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of detach_and_delete_s3_access_point. */
export type DetachAndDeleteS3AccessPointResult = {
  lifecycle?: string;
  name?: string;
};

/** Result of list_tags_for_resource. */
export type ListTagsForResourceResult = {
  tags?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of release_file_system_nfs_v3_locks. */
export type ReleaseFileSystemNfsV3LocksResult = {
  fileSystem?: Record<string, unknown>;
};

/** Result of restore_volume_from_snapshot. */
export type RestoreVolumeFromSnapshotResult = {
  volumeId?: string;
  lifecycle?: string;
  administrativeActions?: Record<string, unknown>[];
};

/** Result of start_misconfigured_state_recovery. */
export type StartMisconfiguredStateRecoveryResult = {
  fileSystem?: Record<string, unknown>;
};

/** Result of update_data_repository_association. */
export type UpdateDataRepositoryAssociationResult = {
  association?: Record<string, unknown>;
};

/** Result of update_file_cache. */
export type UpdateFileCacheResult = {
  fileCache?: Record<string, unknown>;
};

/** Result of update_shared_vpc_configuration. */
export type UpdateSharedVpcConfigurationResult = {
  enableFsxRouteTableUpdatesFromParticipantAccounts?: string;
};

/** Result of update_snapshot. */
export type UpdateSnapshotResult = {
  snapshot?: Record<string, unknown>;
};

/** Result of update_storage_virtual_machine. */
export type UpdateStorageVirtualMachineResult = {
  storageVirtualMachine?: Record<string, unknown>;
};

/** Create an FSx file system. */
export async function createFileSystem(): Promise<FileSystemResult> {
  try {
    // TODO: implement create_file_system
    throw new Error("create_file_system not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_file_system failed");
  }
}

/** Describe one or more FSx file systems. */
export async function describeFileSystems(): Promise<FileSystemResult[]> {
  try {
    // TODO: implement describe_file_systems
    throw new Error("describe_file_systems not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_file_systems failed");
  }
}

/** Update an FSx file system. */
export async function updateFileSystem(fileSystemId: string): Promise<FileSystemResult> {
  try {
    // TODO: implement update_file_system
    throw new Error("update_file_system not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_file_system failed");
  }
}

/** Delete an FSx file system. */
export async function deleteFileSystem(fileSystemId: string): Promise<Record<string, unknown>> {
  try {
    // TODO: implement delete_file_system
    throw new Error("delete_file_system not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_file_system failed");
  }
}

/** Create an FSx backup. */
export async function createBackup(): Promise<BackupResult> {
  try {
    // TODO: implement create_backup
    throw new Error("create_backup not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_backup failed");
  }
}

/** Describe FSx backups. */
export async function describeBackups(): Promise<BackupResult[]> {
  try {
    // TODO: implement describe_backups
    throw new Error("describe_backups not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_backups failed");
  }
}

/** Delete an FSx backup. */
export async function deleteBackup(backupId: string): Promise<Record<string, unknown>> {
  try {
    // TODO: implement delete_backup
    throw new Error("delete_backup not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_backup failed");
  }
}

/** Copy an FSx backup. */
export async function copyBackup(sourceBackupId: string): Promise<BackupResult> {
  try {
    // TODO: implement copy_backup
    throw new Error("copy_backup not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "copy_backup failed");
  }
}

/** Restore an FSx file system from a backup. */
export async function restoreFileSystemFromBackup(backupId: string): Promise<FileSystemResult> {
  try {
    // TODO: implement restore_file_system_from_backup
    throw new Error("restore_file_system_from_backup not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "restore_file_system_from_backup failed");
  }
}

/** Describe aliases for an FSx file system. */
export async function describeFileSystemAliases(fileSystemId: string): Promise<FileSystemAliasResult[]> {
  try {
    // TODO: implement describe_file_system_aliases
    throw new Error("describe_file_system_aliases not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_file_system_aliases failed");
  }
}

/** Associate DNS aliases with an FSx file system. */
export async function associateFileSystemAliases(fileSystemId: string): Promise<FileSystemAliasResult[]> {
  try {
    // TODO: implement associate_file_system_aliases
    throw new Error("associate_file_system_aliases not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "associate_file_system_aliases failed");
  }
}

/** Disassociate DNS aliases from an FSx file system. */
export async function disassociateFileSystemAliases(fileSystemId: string): Promise<FileSystemAliasResult[]> {
  try {
    // TODO: implement disassociate_file_system_aliases
    throw new Error("disassociate_file_system_aliases not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disassociate_file_system_aliases failed");
  }
}

/** Create an FSx volume. */
export async function createVolume(): Promise<VolumeResult> {
  try {
    // TODO: implement create_volume
    throw new Error("create_volume not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_volume failed");
  }
}

/** Describe FSx volumes. */
export async function describeVolumes(): Promise<VolumeResult[]> {
  try {
    // TODO: implement describe_volumes
    throw new Error("describe_volumes not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_volumes failed");
  }
}

/** Update an FSx volume. */
export async function updateVolume(volumeId: string): Promise<VolumeResult> {
  try {
    // TODO: implement update_volume
    throw new Error("update_volume not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_volume failed");
  }
}

/** Delete an FSx volume. */
export async function deleteVolume(volumeId: string): Promise<Record<string, unknown>> {
  try {
    // TODO: implement delete_volume
    throw new Error("delete_volume not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_volume failed");
  }
}

/** Create a data-repository association for an FSx file system. */
export async function createDataRepositoryAssociation(fileSystemId: string): Promise<DataRepositoryAssociationResult> {
  try {
    // TODO: implement create_data_repository_association
    throw new Error("create_data_repository_association not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_data_repository_association failed");
  }
}

/** Describe FSx data-repository associations. */
export async function describeDataRepositoryAssociations(): Promise<DataRepositoryAssociationResult[]> {
  try {
    // TODO: implement describe_data_repository_associations
    throw new Error("describe_data_repository_associations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_data_repository_associations failed");
  }
}

/** Create a data-repository task for an FSx file system. */
export async function createDataRepositoryTask(fileSystemId: string): Promise<DataRepositoryTaskResult> {
  try {
    // TODO: implement create_data_repository_task
    throw new Error("create_data_repository_task not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_data_repository_task failed");
  }
}

/** Describe FSx data-repository tasks. */
export async function describeDataRepositoryTasks(): Promise<DataRepositoryTaskResult[]> {
  try {
    // TODO: implement describe_data_repository_tasks
    throw new Error("describe_data_repository_tasks not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_data_repository_tasks failed");
  }
}

/** Cancel a running data-repository task. */
export async function cancelDataRepositoryTask(taskId: string): Promise<Record<string, unknown>> {
  try {
    // TODO: implement cancel_data_repository_task
    throw new Error("cancel_data_repository_task not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "cancel_data_repository_task failed");
  }
}

/** Poll until an FSx file system reaches the desired lifecycle state. */
export async function waitForFileSystem(fileSystemId: string): Promise<FileSystemResult> {
  try {
    // TODO: implement wait_for_file_system
    throw new Error("wait_for_file_system not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "wait_for_file_system failed");
  }
}

/** Copy snapshot and update volume. */
export async function copySnapshotAndUpdateVolume(volumeId: string, sourceSnapshotArn: string): Promise<CopySnapshotAndUpdateVolumeResult> {
  try {
    // TODO: implement copy_snapshot_and_update_volume
    throw new Error("copy_snapshot_and_update_volume not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "copy_snapshot_and_update_volume failed");
  }
}

/** Create and attach s3 access point. */
export async function createAndAttachS3AccessPoint(name: string, typeValue: string): Promise<CreateAndAttachS3AccessPointResult> {
  try {
    // TODO: implement create_and_attach_s3_access_point
    throw new Error("create_and_attach_s3_access_point not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_and_attach_s3_access_point failed");
  }
}

/** Create file cache. */
export async function createFileCache(fileCacheType: string, fileCacheTypeVersion: string, storageCapacity: number, subnetIds: string[]): Promise<CreateFileCacheResult> {
  try {
    // TODO: implement create_file_cache
    throw new Error("create_file_cache not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_file_cache failed");
  }
}

/** Create file system from backup. */
export async function createFileSystemFromBackup(backupId: string, subnetIds: string[]): Promise<CreateFileSystemFromBackupResult> {
  try {
    // TODO: implement create_file_system_from_backup
    throw new Error("create_file_system_from_backup not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_file_system_from_backup failed");
  }
}

/** Create snapshot. */
export async function createSnapshot(name: string, volumeId: string): Promise<CreateSnapshotResult> {
  try {
    // TODO: implement create_snapshot
    throw new Error("create_snapshot not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_snapshot failed");
  }
}

/** Create storage virtual machine. */
export async function createStorageVirtualMachine(fileSystemId: string, name: string): Promise<CreateStorageVirtualMachineResult> {
  try {
    // TODO: implement create_storage_virtual_machine
    throw new Error("create_storage_virtual_machine not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_storage_virtual_machine failed");
  }
}

/** Create volume from backup. */
export async function createVolumeFromBackup(backupId: string, name: string): Promise<CreateVolumeFromBackupResult> {
  try {
    // TODO: implement create_volume_from_backup
    throw new Error("create_volume_from_backup not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_volume_from_backup failed");
  }
}

/** Delete data repository association. */
export async function deleteDataRepositoryAssociation(associationId: string): Promise<DeleteDataRepositoryAssociationResult> {
  try {
    // TODO: implement delete_data_repository_association
    throw new Error("delete_data_repository_association not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_data_repository_association failed");
  }
}

/** Delete file cache. */
export async function deleteFileCache(fileCacheId: string): Promise<DeleteFileCacheResult> {
  try {
    // TODO: implement delete_file_cache
    throw new Error("delete_file_cache not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_file_cache failed");
  }
}

/** Delete snapshot. */
export async function deleteSnapshot(snapshotId: string): Promise<DeleteSnapshotResult> {
  try {
    // TODO: implement delete_snapshot
    throw new Error("delete_snapshot not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_snapshot failed");
  }
}

/** Delete storage virtual machine. */
export async function deleteStorageVirtualMachine(storageVirtualMachineId: string): Promise<DeleteStorageVirtualMachineResult> {
  try {
    // TODO: implement delete_storage_virtual_machine
    throw new Error("delete_storage_virtual_machine not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_storage_virtual_machine failed");
  }
}

/** Describe file caches. */
export async function describeFileCaches(): Promise<DescribeFileCachesResult> {
  try {
    // TODO: implement describe_file_caches
    throw new Error("describe_file_caches not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_file_caches failed");
  }
}

/** Describe s3 access point attachments. */
export async function describeS3AccessPointAttachments(): Promise<DescribeS3AccessPointAttachmentsResult> {
  try {
    // TODO: implement describe_s3_access_point_attachments
    throw new Error("describe_s3_access_point_attachments not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_s3_access_point_attachments failed");
  }
}

/** Describe shared vpc configuration. */
export async function describeSharedVpcConfiguration(regionName?: string): Promise<DescribeSharedVpcConfigurationResult> {
  try {
    // TODO: implement describe_shared_vpc_configuration
    throw new Error("describe_shared_vpc_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_shared_vpc_configuration failed");
  }
}

/** Describe snapshots. */
export async function describeSnapshots(): Promise<DescribeSnapshotsResult> {
  try {
    // TODO: implement describe_snapshots
    throw new Error("describe_snapshots not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_snapshots failed");
  }
}

/** Describe storage virtual machines. */
export async function describeStorageVirtualMachines(): Promise<DescribeStorageVirtualMachinesResult> {
  try {
    // TODO: implement describe_storage_virtual_machines
    throw new Error("describe_storage_virtual_machines not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_storage_virtual_machines failed");
  }
}

/** Detach and delete s3 access point. */
export async function detachAndDeleteS3AccessPoint(name: string): Promise<DetachAndDeleteS3AccessPointResult> {
  try {
    // TODO: implement detach_and_delete_s3_access_point
    throw new Error("detach_and_delete_s3_access_point not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "detach_and_delete_s3_access_point failed");
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

/** Release file system nfs v3 locks. */
export async function releaseFileSystemNfsV3Locks(fileSystemId: string): Promise<ReleaseFileSystemNfsV3LocksResult> {
  try {
    // TODO: implement release_file_system_nfs_v3_locks
    throw new Error("release_file_system_nfs_v3_locks not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "release_file_system_nfs_v3_locks failed");
  }
}

/** Restore volume from snapshot. */
export async function restoreVolumeFromSnapshot(volumeId: string, snapshotId: string): Promise<RestoreVolumeFromSnapshotResult> {
  try {
    // TODO: implement restore_volume_from_snapshot
    throw new Error("restore_volume_from_snapshot not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "restore_volume_from_snapshot failed");
  }
}

/** Start misconfigured state recovery. */
export async function startMisconfiguredStateRecovery(fileSystemId: string): Promise<StartMisconfiguredStateRecoveryResult> {
  try {
    // TODO: implement start_misconfigured_state_recovery
    throw new Error("start_misconfigured_state_recovery not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_misconfigured_state_recovery failed");
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

/** Update data repository association. */
export async function updateDataRepositoryAssociation(associationId: string): Promise<UpdateDataRepositoryAssociationResult> {
  try {
    // TODO: implement update_data_repository_association
    throw new Error("update_data_repository_association not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_data_repository_association failed");
  }
}

/** Update file cache. */
export async function updateFileCache(fileCacheId: string): Promise<UpdateFileCacheResult> {
  try {
    // TODO: implement update_file_cache
    throw new Error("update_file_cache not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_file_cache failed");
  }
}

/** Update shared vpc configuration. */
export async function updateSharedVpcConfiguration(): Promise<UpdateSharedVpcConfigurationResult> {
  try {
    // TODO: implement update_shared_vpc_configuration
    throw new Error("update_shared_vpc_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_shared_vpc_configuration failed");
  }
}

/** Update snapshot. */
export async function updateSnapshot(name: string, snapshotId: string): Promise<UpdateSnapshotResult> {
  try {
    // TODO: implement update_snapshot
    throw new Error("update_snapshot not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_snapshot failed");
  }
}

/** Update storage virtual machine. */
export async function updateStorageVirtualMachine(storageVirtualMachineId: string): Promise<UpdateStorageVirtualMachineResult> {
  try {
    // TODO: implement update_storage_virtual_machine
    throw new Error("update_storage_virtual_machine not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_storage_virtual_machine failed");
  }
}
