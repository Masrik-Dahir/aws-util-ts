import { CodestarConnectionsClient } from "@aws-sdk/client-codestar-connections";
import { getClient } from "./client";
import { wrapAwsError } from "./exceptions";

/** A CodeStar connection. */
export type ConnectionResult = {
  connectionName?: string;
  connectionArn: string;
  providerType?: string;
  ownerAccountId?: string;
  connectionStatus?: string;
  hostArn?: string;
  extra?: Record<string, unknown>;
};

/** A CodeStar host. */
export type HostResult = {
  name?: string;
  hostArn: string;
  providerType?: string;
  providerEndpoint?: string;
  status?: string;
  vpcConfiguration?: Record<string, unknown>;
  extra?: Record<string, unknown>;
};

/** A resource tag. */
export type TagResult = {
  key: string;
  value: string;
};

/** Result of create_repository_link. */
export type CreateRepositoryLinkResult = {
  repositoryLinkInfo?: Record<string, unknown>;
};

/** Result of create_sync_configuration. */
export type CreateSyncConfigurationResult = {
  syncConfiguration?: Record<string, unknown>;
};

/** Result of get_repository_link. */
export type GetRepositoryLinkResult = {
  repositoryLinkInfo?: Record<string, unknown>;
};

/** Result of get_repository_sync_status. */
export type GetRepositorySyncStatusResult = {
  latestSync?: Record<string, unknown>;
};

/** Result of get_resource_sync_status. */
export type GetResourceSyncStatusResult = {
  desiredState?: Record<string, unknown>;
  latestSuccessfulSync?: Record<string, unknown>;
  latestSync?: Record<string, unknown>;
};

/** Result of get_sync_blocker_summary. */
export type GetSyncBlockerSummaryResult = {
  syncBlockerSummary?: Record<string, unknown>;
};

/** Result of get_sync_configuration. */
export type GetSyncConfigurationResult = {
  syncConfiguration?: Record<string, unknown>;
};

/** Result of list_repository_links. */
export type ListRepositoryLinksResult = {
  repositoryLinks?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_repository_sync_definitions. */
export type ListRepositorySyncDefinitionsResult = {
  repositorySyncDefinitions?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_sync_configurations. */
export type ListSyncConfigurationsResult = {
  syncConfigurations?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of update_repository_link. */
export type UpdateRepositoryLinkResult = {
  repositoryLinkInfo?: Record<string, unknown>;
};

/** Result of update_sync_blocker. */
export type UpdateSyncBlockerResult = {
  resourceName?: string;
  parentResourceName?: string;
  syncBlocker?: Record<string, unknown>;
};

/** Result of update_sync_configuration. */
export type UpdateSyncConfigurationResult = {
  syncConfiguration?: Record<string, unknown>;
};

/** Create a CodeStar connection. */
export async function createConnection(connectionName: string): Promise<string> {
  try {
    // TODO: implement create_connection
    throw new Error("create_connection not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_connection failed");
  }
}

/** Get details of a CodeStar connection. */
export async function getConnection(connectionArn: string): Promise<ConnectionResult> {
  try {
    // TODO: implement get_connection
    throw new Error("get_connection not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_connection failed");
  }
}

/** List CodeStar connections. */
export async function listConnections(): Promise<ConnectionResult[]> {
  try {
    // TODO: implement list_connections
    throw new Error("list_connections not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_connections failed");
  }
}

/** Delete a CodeStar connection. */
export async function deleteConnection(connectionArn: string): Promise<void> {
  try {
    // TODO: implement delete_connection
    throw new Error("delete_connection not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_connection failed");
  }
}

/** Create a CodeStar host. */
export async function createHost(name: string, providerType: string, providerEndpoint: string): Promise<string> {
  try {
    // TODO: implement create_host
    throw new Error("create_host not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_host failed");
  }
}

/** Get details of a CodeStar host. */
export async function getHost(hostArn: string): Promise<HostResult> {
  try {
    // TODO: implement get_host
    throw new Error("get_host not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_host failed");
  }
}

/** List CodeStar hosts. */
export async function listHosts(): Promise<HostResult[]> {
  try {
    // TODO: implement list_hosts
    throw new Error("list_hosts not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_hosts failed");
  }
}

/** Delete a CodeStar host. */
export async function deleteHost(hostArn: string): Promise<void> {
  try {
    // TODO: implement delete_host
    throw new Error("delete_host not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_host failed");
  }
}

/** Tag a CodeStar Connections resource. */
export async function tagResource(resourceArn: string, tags: Record<string, unknown>[]): Promise<void> {
  try {
    // TODO: implement tag_resource
    throw new Error("tag_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "tag_resource failed");
  }
}

/** List tags for a CodeStar Connections resource. */
export async function listTagsForResource(resourceArn: string): Promise<TagResult[]> {
  try {
    // TODO: implement list_tags_for_resource
    throw new Error("list_tags_for_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_tags_for_resource failed");
  }
}

/** Create repository link. */
export async function createRepositoryLink(connectionArn: string, ownerId: string, repositoryName: string): Promise<CreateRepositoryLinkResult> {
  try {
    // TODO: implement create_repository_link
    throw new Error("create_repository_link not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_repository_link failed");
  }
}

/** Create sync configuration. */
export async function createSyncConfiguration(branch: string, configFile: string, repositoryLinkId: string, resourceName: string, roleArn: string, syncType: string): Promise<CreateSyncConfigurationResult> {
  try {
    // TODO: implement create_sync_configuration
    throw new Error("create_sync_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_sync_configuration failed");
  }
}

/** Delete repository link. */
export async function deleteRepositoryLink(repositoryLinkId: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_repository_link
    throw new Error("delete_repository_link not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_repository_link failed");
  }
}

/** Delete sync configuration. */
export async function deleteSyncConfiguration(syncType: string, resourceName: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_sync_configuration
    throw new Error("delete_sync_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_sync_configuration failed");
  }
}

/** Get repository link. */
export async function getRepositoryLink(repositoryLinkId: string, regionName?: string): Promise<GetRepositoryLinkResult> {
  try {
    // TODO: implement get_repository_link
    throw new Error("get_repository_link not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_repository_link failed");
  }
}

/** Get repository sync status. */
export async function getRepositorySyncStatus(branch: string, repositoryLinkId: string, syncType: string, regionName?: string): Promise<GetRepositorySyncStatusResult> {
  try {
    // TODO: implement get_repository_sync_status
    throw new Error("get_repository_sync_status not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_repository_sync_status failed");
  }
}

/** Get resource sync status. */
export async function getResourceSyncStatus(resourceName: string, syncType: string, regionName?: string): Promise<GetResourceSyncStatusResult> {
  try {
    // TODO: implement get_resource_sync_status
    throw new Error("get_resource_sync_status not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_resource_sync_status failed");
  }
}

/** Get sync blocker summary. */
export async function getSyncBlockerSummary(syncType: string, resourceName: string, regionName?: string): Promise<GetSyncBlockerSummaryResult> {
  try {
    // TODO: implement get_sync_blocker_summary
    throw new Error("get_sync_blocker_summary not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_sync_blocker_summary failed");
  }
}

/** Get sync configuration. */
export async function getSyncConfiguration(syncType: string, resourceName: string, regionName?: string): Promise<GetSyncConfigurationResult> {
  try {
    // TODO: implement get_sync_configuration
    throw new Error("get_sync_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_sync_configuration failed");
  }
}

/** List repository links. */
export async function listRepositoryLinks(): Promise<ListRepositoryLinksResult> {
  try {
    // TODO: implement list_repository_links
    throw new Error("list_repository_links not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_repository_links failed");
  }
}

/** List repository sync definitions. */
export async function listRepositorySyncDefinitions(repositoryLinkId: string, syncType: string, regionName?: string): Promise<ListRepositorySyncDefinitionsResult> {
  try {
    // TODO: implement list_repository_sync_definitions
    throw new Error("list_repository_sync_definitions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_repository_sync_definitions failed");
  }
}

/** List sync configurations. */
export async function listSyncConfigurations(repositoryLinkId: string, syncType: string): Promise<ListSyncConfigurationsResult> {
  try {
    // TODO: implement list_sync_configurations
    throw new Error("list_sync_configurations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_sync_configurations failed");
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

/** Update host. */
export async function updateHost(hostArn: string): Promise<void> {
  try {
    // TODO: implement update_host
    throw new Error("update_host not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_host failed");
  }
}

/** Update repository link. */
export async function updateRepositoryLink(repositoryLinkId: string): Promise<UpdateRepositoryLinkResult> {
  try {
    // TODO: implement update_repository_link
    throw new Error("update_repository_link not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_repository_link failed");
  }
}

/** Update sync blocker. */
export async function updateSyncBlocker(id: string, syncType: string, resourceName: string, resolvedReason: string, regionName?: string): Promise<UpdateSyncBlockerResult> {
  try {
    // TODO: implement update_sync_blocker
    throw new Error("update_sync_blocker not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_sync_blocker failed");
  }
}

/** Update sync configuration. */
export async function updateSyncConfiguration(resourceName: string, syncType: string): Promise<UpdateSyncConfigurationResult> {
  try {
    // TODO: implement update_sync_configuration
    throw new Error("update_sync_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_sync_configuration failed");
  }
}
