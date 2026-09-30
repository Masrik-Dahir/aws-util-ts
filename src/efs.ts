import { EfsClient } from "@aws-sdk/client-efs";
import { getClient } from "./client";
import { wrapAwsError } from "./exceptions";

/** Metadata for an EFS file system. */
export type FileSystemResult = {
  fileSystemId: string;
  fileSystemArn?: string;
  creationTime?: string;
  lifeCycleState: string;
  performanceMode?: string;
  throughputMode?: string;
  encrypted?: boolean;
  sizeInBytes?: Record<string, unknown>;
  tags?: Record<string, unknown>;
  extra?: Record<string, unknown>;
};

/** Metadata for an EFS mount target. */
export type MountTargetResult = {
  mountTargetId: string;
  fileSystemId: string;
  subnetId: string;
  lifeCycleState: string;
  ipAddress?: string;
  availabilityZoneName?: string;
  extra?: Record<string, unknown>;
};

/** Metadata for an EFS access point. */
export type AccessPointResult = {
  accessPointId: string;
  accessPointArn?: string;
  fileSystemId: string;
  name?: string;
  posixUser?: Record<string, unknown>;
  rootDirectory?: Record<string, unknown>;
  lifeCycleState?: string;
  extra?: Record<string, unknown>;
};

/** Result of create_replication_configuration. */
export type CreateReplicationConfigurationResult = {
  sourceFileSystemId?: string;
  sourceFileSystemRegion?: string;
  sourceFileSystemArn?: string;
  originalSourceFileSystemArn?: string;
  creationTime?: string;
  destinations?: Record<string, unknown>[];
  sourceFileSystemOwnerId?: string;
};

/** Result of describe_account_preferences. */
export type DescribeAccountPreferencesResult = {
  resourceIdPreference?: Record<string, unknown>;
  nextToken?: string;
};

/** Result of describe_backup_policy. */
export type DescribeBackupPolicyResult = {
  backupPolicy?: Record<string, unknown>;
};

/** Result of describe_replication_configurations. */
export type DescribeReplicationConfigurationsResult = {
  replications?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of describe_tags. */
export type DescribeTagsResult = {
  marker?: string;
  tags?: Record<string, unknown>[];
  nextMarker?: string;
};

/** Result of put_account_preferences. */
export type PutAccountPreferencesResult = {
  resourceIdPreference?: Record<string, unknown>;
};

/** Result of put_backup_policy. */
export type PutBackupPolicyResult = {
  backupPolicy?: Record<string, unknown>;
};

/** Result of update_file_system_protection. */
export type UpdateFileSystemProtectionResult = {
  replicationOverwriteProtection?: string;
};

/** Create an EFS file system. */
export async function createFileSystem(): Promise<FileSystemResult> {
  try {
    // TODO: implement create_file_system
    throw new Error("create_file_system not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_file_system failed");
  }
}

/** Describe one or more EFS file systems. */
export async function describeFileSystems(): Promise<FileSystemResult[]> {
  try {
    // TODO: implement describe_file_systems
    throw new Error("describe_file_systems not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_file_systems failed");
  }
}

/** Update an EFS file system's throughput configuration. */
export async function updateFileSystem(fileSystemId: string): Promise<FileSystemResult> {
  try {
    // TODO: implement update_file_system
    throw new Error("update_file_system not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_file_system failed");
  }
}

/** Delete an EFS file system. */
export async function deleteFileSystem(fileSystemId: string): Promise<void> {
  try {
    // TODO: implement delete_file_system
    throw new Error("delete_file_system not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_file_system failed");
  }
}

/** Create an EFS mount target in a subnet. */
export async function createMountTarget(fileSystemId: string): Promise<MountTargetResult> {
  try {
    // TODO: implement create_mount_target
    throw new Error("create_mount_target not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_mount_target failed");
  }
}

/** Describe EFS mount targets. */
export async function describeMountTargets(): Promise<MountTargetResult[]> {
  try {
    // TODO: implement describe_mount_targets
    throw new Error("describe_mount_targets not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_mount_targets failed");
  }
}

/** Delete an EFS mount target. */
export async function deleteMountTarget(mountTargetId: string): Promise<void> {
  try {
    // TODO: implement delete_mount_target
    throw new Error("delete_mount_target not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_mount_target failed");
  }
}

/** List security groups for a mount target. */
export async function describeMountTargetSecurityGroups(mountTargetId: string): Promise<string[]> {
  try {
    // TODO: implement describe_mount_target_security_groups
    throw new Error("describe_mount_target_security_groups not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_mount_target_security_groups failed");
  }
}

/** Replace security groups on a mount target. */
export async function modifyMountTargetSecurityGroups(mountTargetId: string): Promise<void> {
  try {
    // TODO: implement modify_mount_target_security_groups
    throw new Error("modify_mount_target_security_groups not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_mount_target_security_groups failed");
  }
}

/** Create an EFS access point. */
export async function createAccessPoint(fileSystemId: string): Promise<AccessPointResult> {
  try {
    // TODO: implement create_access_point
    throw new Error("create_access_point not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_access_point failed");
  }
}

/** Describe EFS access points. */
export async function describeAccessPoints(): Promise<AccessPointResult[]> {
  try {
    // TODO: implement describe_access_points
    throw new Error("describe_access_points not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_access_points failed");
  }
}

/** Delete an EFS access point. */
export async function deleteAccessPoint(accessPointId: string): Promise<void> {
  try {
    // TODO: implement delete_access_point
    throw new Error("delete_access_point not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_access_point failed");
  }
}

/** Set lifecycle policies on an EFS file system. */
export async function putLifecycleConfiguration(fileSystemId: string): Promise<Record<string, unknown>[]> {
  try {
    // TODO: implement put_lifecycle_configuration
    throw new Error("put_lifecycle_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_lifecycle_configuration failed");
  }
}

/** Retrieve lifecycle policies for an EFS file system. */
export async function describeLifecycleConfiguration(fileSystemId: string): Promise<Record<string, unknown>[]> {
  try {
    // TODO: implement describe_lifecycle_configuration
    throw new Error("describe_lifecycle_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_lifecycle_configuration failed");
  }
}

/** Set a resource policy on an EFS file system. */
export async function putFileSystemPolicy(fileSystemId: string): Promise<Record<string, unknown>> {
  try {
    // TODO: implement put_file_system_policy
    throw new Error("put_file_system_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_file_system_policy failed");
  }
}

/** Retrieve the resource policy for an EFS file system. */
export async function describeFileSystemPolicy(fileSystemId: string): Promise<Record<string, unknown>> {
  try {
    // TODO: implement describe_file_system_policy
    throw new Error("describe_file_system_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_file_system_policy failed");
  }
}

/** Delete the resource policy from an EFS file system. */
export async function deleteFileSystemPolicy(fileSystemId: string): Promise<void> {
  try {
    // TODO: implement delete_file_system_policy
    throw new Error("delete_file_system_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_file_system_policy failed");
  }
}

/** Add or overwrite tags on an EFS resource. */
export async function tagResource(resourceId: string): Promise<void> {
  try {
    // TODO: implement tag_resource
    throw new Error("tag_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "tag_resource failed");
  }
}

/** List tags on an EFS resource. */
export async function listTagsForResource(resourceId: string): Promise<Record<string, unknown>> {
  try {
    // TODO: implement list_tags_for_resource
    throw new Error("list_tags_for_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_tags_for_resource failed");
  }
}

/** Poll until an EFS file system reaches the desired lifecycle state. */
export async function waitForFileSystem(fileSystemId: string): Promise<FileSystemResult> {
  try {
    // TODO: implement wait_for_file_system
    throw new Error("wait_for_file_system not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "wait_for_file_system failed");
  }
}

/** Create replication configuration. */
export async function createReplicationConfiguration(sourceFileSystemId: string, destinations: Record<string, unknown>[], regionName?: string): Promise<CreateReplicationConfigurationResult> {
  try {
    // TODO: implement create_replication_configuration
    throw new Error("create_replication_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_replication_configuration failed");
  }
}

/** Create tags. */
export async function createTags(fileSystemId: string, tags: Record<string, unknown>[], regionName?: string): Promise<void> {
  try {
    // TODO: implement create_tags
    throw new Error("create_tags not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_tags failed");
  }
}

/** Delete replication configuration. */
export async function deleteReplicationConfiguration(sourceFileSystemId: string): Promise<void> {
  try {
    // TODO: implement delete_replication_configuration
    throw new Error("delete_replication_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_replication_configuration failed");
  }
}

/** Delete tags. */
export async function deleteTags(fileSystemId: string, tagKeys: string[], regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_tags
    throw new Error("delete_tags not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_tags failed");
  }
}

/** Describe account preferences. */
export async function describeAccountPreferences(): Promise<DescribeAccountPreferencesResult> {
  try {
    // TODO: implement describe_account_preferences
    throw new Error("describe_account_preferences not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_account_preferences failed");
  }
}

/** Describe backup policy. */
export async function describeBackupPolicy(fileSystemId: string, regionName?: string): Promise<DescribeBackupPolicyResult> {
  try {
    // TODO: implement describe_backup_policy
    throw new Error("describe_backup_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_backup_policy failed");
  }
}

/** Describe replication configurations. */
export async function describeReplicationConfigurations(): Promise<DescribeReplicationConfigurationsResult> {
  try {
    // TODO: implement describe_replication_configurations
    throw new Error("describe_replication_configurations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_replication_configurations failed");
  }
}

/** Describe tags. */
export async function describeTags(fileSystemId: string): Promise<DescribeTagsResult> {
  try {
    // TODO: implement describe_tags
    throw new Error("describe_tags not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_tags failed");
  }
}

/** Put account preferences. */
export async function putAccountPreferences(resourceIdType: string, regionName?: string): Promise<PutAccountPreferencesResult> {
  try {
    // TODO: implement put_account_preferences
    throw new Error("put_account_preferences not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_account_preferences failed");
  }
}

/** Put backup policy. */
export async function putBackupPolicy(fileSystemId: string, backupPolicy: Record<string, unknown>, regionName?: string): Promise<PutBackupPolicyResult> {
  try {
    // TODO: implement put_backup_policy
    throw new Error("put_backup_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_backup_policy failed");
  }
}

/** Untag resource. */
export async function untagResource(resourceId: string, tagKeys: string[], regionName?: string): Promise<void> {
  try {
    // TODO: implement untag_resource
    throw new Error("untag_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "untag_resource failed");
  }
}

/** Update file system protection. */
export async function updateFileSystemProtection(fileSystemId: string): Promise<UpdateFileSystemProtectionResult> {
  try {
    // TODO: implement update_file_system_protection
    throw new Error("update_file_system_protection not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_file_system_protection failed");
  }
}
