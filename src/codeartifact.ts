import { CodeartifactClient } from "@aws-sdk/client-codeartifact";
import { getClient } from "./client";
import { wrapAwsError } from "./exceptions";

/** A CodeArtifact domain. */
export type DomainResult = {
  name: string;
  arn: string;
  owner?: string;
  status?: string;
  createdTime?: string;
  encryptionKey?: string;
  repositoryCount?: number;
  assetSizeBytes?: number;
  extra?: Record<string, unknown>;
};

/** A CodeArtifact repository. */
export type RepositoryResult = {
  name: string;
  arn: string;
  domainName?: string;
  domainOwner?: string;
  description?: string;
  administratorAccount?: string;
  upstreams?: Record<string, unknown>[];
  externalConnections?: Record<string, unknown>[];
  extra?: Record<string, unknown>;
};

/** A CodeArtifact package summary. */
export type PackageResult = {
  format: string;
  namespace?: string;
  package: string;
  originConfiguration?: Record<string, unknown>;
  extra?: Record<string, unknown>;
};

/** A CodeArtifact package version. */
export type PackageVersionResult = {
  format: string;
  namespace?: string;
  package: string;
  version: string;
  status?: string;
  revision?: string;
  extra?: Record<string, unknown>;
};

/** An authorization token for a CodeArtifact domain. */
export type AuthorizationTokenResult = {
  authorizationToken: string;
  expiration?: string;
};

/** A repository endpoint URL. */
export type EndpointResult = {
  repositoryEndpoint: string;
};

/** Result of an external connection operation. */
export type ExternalConnectionResult = {
  repository: RepositoryResult;
};

/** Result of copy_package_versions. */
export type CopyPackageVersionsResult = {
  successfulVersions?: Record<string, unknown>;
  failedVersions?: Record<string, unknown>;
};

/** Result of create_package_group. */
export type CreatePackageGroupResult = {
  packageGroup?: Record<string, unknown>;
};

/** Result of delete_domain_permissions_policy. */
export type DeleteDomainPermissionsPolicyResult = {
  policy?: Record<string, unknown>;
};

/** Result of delete_package. */
export type DeletePackageResult = {
  deletedPackage?: Record<string, unknown>;
};

/** Result of delete_package_group. */
export type DeletePackageGroupResult = {
  packageGroup?: Record<string, unknown>;
};

/** Result of delete_package_versions. */
export type DeletePackageVersionsResult = {
  successfulVersions?: Record<string, unknown>;
  failedVersions?: Record<string, unknown>;
};

/** Result of delete_repository_permissions_policy. */
export type DeleteRepositoryPermissionsPolicyResult = {
  policy?: Record<string, unknown>;
};

/** Result of describe_package_group. */
export type DescribePackageGroupResult = {
  packageGroup?: Record<string, unknown>;
};

/** Result of dispose_package_versions. */
export type DisposePackageVersionsResult = {
  successfulVersions?: Record<string, unknown>;
  failedVersions?: Record<string, unknown>;
};

/** Result of get_associated_package_group. */
export type GetAssociatedPackageGroupResult = {
  packageGroup?: Record<string, unknown>;
  associationType?: string;
};

/** Result of get_domain_permissions_policy. */
export type GetDomainPermissionsPolicyResult = {
  policy?: Record<string, unknown>;
};

/** Result of get_package_version_asset. */
export type GetPackageVersionAssetResult = {
  asset?: Uint8Array;
  assetName?: string;
  packageVersion?: string;
  packageVersionRevision?: string;
};

/** Result of get_package_version_readme. */
export type GetPackageVersionReadmeResult = {
  format?: string;
  namespace?: string;
  package?: string;
  version?: string;
  versionRevision?: string;
  readme?: string;
};

/** Result of get_repository_permissions_policy. */
export type GetRepositoryPermissionsPolicyResult = {
  policy?: Record<string, unknown>;
};

/** Result of list_allowed_repositories_for_group. */
export type ListAllowedRepositoriesForGroupResult = {
  allowedRepositories?: string[];
  nextToken?: string;
};

/** Result of list_associated_packages. */
export type ListAssociatedPackagesResult = {
  packages?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_package_groups. */
export type ListPackageGroupsResult = {
  packageGroups?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_package_version_assets. */
export type ListPackageVersionAssetsResult = {
  format?: string;
  namespace?: string;
  package?: string;
  version?: string;
  versionRevision?: string;
  nextToken?: string;
  assets?: Record<string, unknown>[];
};

/** Result of list_package_version_dependencies. */
export type ListPackageVersionDependenciesResult = {
  format?: string;
  namespace?: string;
  package?: string;
  version?: string;
  versionRevision?: string;
  nextToken?: string;
  dependencies?: Record<string, unknown>[];
};

/** Result of list_repositories_in_domain. */
export type ListRepositoriesInDomainResult = {
  repositories?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_sub_package_groups. */
export type ListSubPackageGroupsResult = {
  packageGroups?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_tags_for_resource. */
export type ListTagsForResourceResult = {
  tags?: Record<string, unknown>[];
};

/** Result of publish_package_version. */
export type PublishPackageVersionResult = {
  format?: string;
  namespace?: string;
  package?: string;
  version?: string;
  versionRevision?: string;
  status?: string;
  asset?: Record<string, unknown>;
};

/** Result of put_domain_permissions_policy. */
export type PutDomainPermissionsPolicyResult = {
  policy?: Record<string, unknown>;
};

/** Result of put_package_origin_configuration. */
export type PutPackageOriginConfigurationResult = {
  originConfiguration?: Record<string, unknown>;
};

/** Result of put_repository_permissions_policy. */
export type PutRepositoryPermissionsPolicyResult = {
  policy?: Record<string, unknown>;
};

/** Result of update_package_group. */
export type UpdatePackageGroupResult = {
  packageGroup?: Record<string, unknown>;
};

/** Result of update_package_group_origin_configuration. */
export type UpdatePackageGroupOriginConfigurationResult = {
  packageGroup?: Record<string, unknown>;
  allowedRepositoryUpdates?: Record<string, unknown>;
};

/** Result of update_package_versions_status. */
export type UpdatePackageVersionsStatusResult = {
  successfulVersions?: Record<string, unknown>;
  failedVersions?: Record<string, unknown>;
};

/** Result of update_repository. */
export type UpdateRepositoryResult = {
  repository?: Record<string, unknown>;
};

/** Create a CodeArtifact domain. */
export async function createDomain(domain: string): Promise<DomainResult> {
  try {
    // TODO: implement create_domain
    throw new Error("create_domain not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_domain failed");
  }
}

/** Describe a CodeArtifact domain. */
export async function describeDomain(domain: string): Promise<DomainResult> {
  try {
    // TODO: implement describe_domain
    throw new Error("describe_domain not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_domain failed");
  }
}

/** List CodeArtifact domains. */
export async function listDomains(): Promise<DomainResult[]> {
  try {
    // TODO: implement list_domains
    throw new Error("list_domains not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_domains failed");
  }
}

/** Delete a CodeArtifact domain. */
export async function deleteDomain(domain: string): Promise<DomainResult> {
  try {
    // TODO: implement delete_domain
    throw new Error("delete_domain not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_domain failed");
  }
}

/** Create a CodeArtifact repository. */
export async function createRepository(domain: string, repository: string): Promise<RepositoryResult> {
  try {
    // TODO: implement create_repository
    throw new Error("create_repository not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_repository failed");
  }
}

/** Describe a CodeArtifact repository. */
export async function describeRepository(domain: string, repository: string): Promise<RepositoryResult> {
  try {
    // TODO: implement describe_repository
    throw new Error("describe_repository not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_repository failed");
  }
}

/** List CodeArtifact repositories. */
export async function listRepositories(): Promise<RepositoryResult[]> {
  try {
    // TODO: implement list_repositories
    throw new Error("list_repositories not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_repositories failed");
  }
}

/** Delete a CodeArtifact repository. */
export async function deleteRepository(domain: string, repository: string): Promise<RepositoryResult> {
  try {
    // TODO: implement delete_repository
    throw new Error("delete_repository not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_repository failed");
  }
}

/** List packages in a CodeArtifact repository. */
export async function listPackages(domain: string, repository: string): Promise<PackageResult[]> {
  try {
    // TODO: implement list_packages
    throw new Error("list_packages not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_packages failed");
  }
}

/** Describe a package in a CodeArtifact repository. */
export async function describePackage(domain: string, repository: string, format: string, package: string): Promise<PackageResult> {
  try {
    // TODO: implement describe_package
    throw new Error("describe_package not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_package failed");
  }
}

/** List versions of a package in a CodeArtifact repository. */
export async function listPackageVersions(domain: string, repository: string, format: string, package: string): Promise<PackageVersionResult[]> {
  try {
    // TODO: implement list_package_versions
    throw new Error("list_package_versions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_package_versions failed");
  }
}

/** Describe a specific package version. */
export async function describePackageVersion(domain: string, repository: string, format: string, package: string, packageVersion: string): Promise<PackageVersionResult> {
  try {
    // TODO: implement describe_package_version
    throw new Error("describe_package_version not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_package_version failed");
  }
}

/** Get an authorization token for a CodeArtifact domain. */
export async function getAuthorizationToken(domain: string): Promise<AuthorizationTokenResult> {
  try {
    // TODO: implement get_authorization_token
    throw new Error("get_authorization_token not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_authorization_token failed");
  }
}

/** Get the endpoint URL for a CodeArtifact repository. */
export async function getRepositoryEndpoint(domain: string, repository: string, format: string): Promise<EndpointResult> {
  try {
    // TODO: implement get_repository_endpoint
    throw new Error("get_repository_endpoint not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_repository_endpoint failed");
  }
}

/** Associate an external connection with a repository. */
export async function associateExternalConnection(domain: string, repository: string, externalConnection: string): Promise<ExternalConnectionResult> {
  try {
    // TODO: implement associate_external_connection
    throw new Error("associate_external_connection not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "associate_external_connection failed");
  }
}

/** Disassociate an external connection from a repository. */
export async function disassociateExternalConnection(domain: string, repository: string, externalConnection: string): Promise<ExternalConnectionResult> {
  try {
    // TODO: implement disassociate_external_connection
    throw new Error("disassociate_external_connection not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disassociate_external_connection failed");
  }
}

/** Copy package versions. */
export async function copyPackageVersions(domain: string, sourceRepository: string, destinationRepository: string, format: string, package: string): Promise<CopyPackageVersionsResult> {
  try {
    // TODO: implement copy_package_versions
    throw new Error("copy_package_versions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "copy_package_versions failed");
  }
}

/** Create package group. */
export async function createPackageGroup(domain: string, packageGroup: string): Promise<CreatePackageGroupResult> {
  try {
    // TODO: implement create_package_group
    throw new Error("create_package_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_package_group failed");
  }
}

/** Delete domain permissions policy. */
export async function deleteDomainPermissionsPolicy(domain: string): Promise<DeleteDomainPermissionsPolicyResult> {
  try {
    // TODO: implement delete_domain_permissions_policy
    throw new Error("delete_domain_permissions_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_domain_permissions_policy failed");
  }
}

/** Delete package. */
export async function deletePackage(domain: string, repository: string, format: string, package: string): Promise<DeletePackageResult> {
  try {
    // TODO: implement delete_package
    throw new Error("delete_package not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_package failed");
  }
}

/** Delete package group. */
export async function deletePackageGroup(domain: string, packageGroup: string): Promise<DeletePackageGroupResult> {
  try {
    // TODO: implement delete_package_group
    throw new Error("delete_package_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_package_group failed");
  }
}

/** Delete package versions. */
export async function deletePackageVersions(domain: string, repository: string, format: string, package: string, versions: string[]): Promise<DeletePackageVersionsResult> {
  try {
    // TODO: implement delete_package_versions
    throw new Error("delete_package_versions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_package_versions failed");
  }
}

/** Delete repository permissions policy. */
export async function deleteRepositoryPermissionsPolicy(domain: string, repository: string): Promise<DeleteRepositoryPermissionsPolicyResult> {
  try {
    // TODO: implement delete_repository_permissions_policy
    throw new Error("delete_repository_permissions_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_repository_permissions_policy failed");
  }
}

/** Describe package group. */
export async function describePackageGroup(domain: string, packageGroup: string): Promise<DescribePackageGroupResult> {
  try {
    // TODO: implement describe_package_group
    throw new Error("describe_package_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_package_group failed");
  }
}

/** Dispose package versions. */
export async function disposePackageVersions(domain: string, repository: string, format: string, package: string, versions: string[]): Promise<DisposePackageVersionsResult> {
  try {
    // TODO: implement dispose_package_versions
    throw new Error("dispose_package_versions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "dispose_package_versions failed");
  }
}

/** Get associated package group. */
export async function getAssociatedPackageGroup(domain: string, format: string, package: string): Promise<GetAssociatedPackageGroupResult> {
  try {
    // TODO: implement get_associated_package_group
    throw new Error("get_associated_package_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_associated_package_group failed");
  }
}

/** Get domain permissions policy. */
export async function getDomainPermissionsPolicy(domain: string): Promise<GetDomainPermissionsPolicyResult> {
  try {
    // TODO: implement get_domain_permissions_policy
    throw new Error("get_domain_permissions_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_domain_permissions_policy failed");
  }
}

/** Get package version asset. */
export async function getPackageVersionAsset(domain: string, repository: string, format: string, package: string, packageVersion: string, asset: string): Promise<GetPackageVersionAssetResult> {
  try {
    // TODO: implement get_package_version_asset
    throw new Error("get_package_version_asset not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_package_version_asset failed");
  }
}

/** Get package version readme. */
export async function getPackageVersionReadme(domain: string, repository: string, format: string, package: string, packageVersion: string): Promise<GetPackageVersionReadmeResult> {
  try {
    // TODO: implement get_package_version_readme
    throw new Error("get_package_version_readme not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_package_version_readme failed");
  }
}

/** Get repository permissions policy. */
export async function getRepositoryPermissionsPolicy(domain: string, repository: string): Promise<GetRepositoryPermissionsPolicyResult> {
  try {
    // TODO: implement get_repository_permissions_policy
    throw new Error("get_repository_permissions_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_repository_permissions_policy failed");
  }
}

/** List allowed repositories for group. */
export async function listAllowedRepositoriesForGroup(domain: string, packageGroup: string, originRestrictionType: string): Promise<ListAllowedRepositoriesForGroupResult> {
  try {
    // TODO: implement list_allowed_repositories_for_group
    throw new Error("list_allowed_repositories_for_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_allowed_repositories_for_group failed");
  }
}

/** List associated packages. */
export async function listAssociatedPackages(domain: string, packageGroup: string): Promise<ListAssociatedPackagesResult> {
  try {
    // TODO: implement list_associated_packages
    throw new Error("list_associated_packages not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_associated_packages failed");
  }
}

/** List package groups. */
export async function listPackageGroups(domain: string): Promise<ListPackageGroupsResult> {
  try {
    // TODO: implement list_package_groups
    throw new Error("list_package_groups not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_package_groups failed");
  }
}

/** List package version assets. */
export async function listPackageVersionAssets(domain: string, repository: string, format: string, package: string, packageVersion: string): Promise<ListPackageVersionAssetsResult> {
  try {
    // TODO: implement list_package_version_assets
    throw new Error("list_package_version_assets not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_package_version_assets failed");
  }
}

/** List package version dependencies. */
export async function listPackageVersionDependencies(domain: string, repository: string, format: string, package: string, packageVersion: string): Promise<ListPackageVersionDependenciesResult> {
  try {
    // TODO: implement list_package_version_dependencies
    throw new Error("list_package_version_dependencies not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_package_version_dependencies failed");
  }
}

/** List repositories in domain. */
export async function listRepositoriesInDomain(domain: string): Promise<ListRepositoriesInDomainResult> {
  try {
    // TODO: implement list_repositories_in_domain
    throw new Error("list_repositories_in_domain not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_repositories_in_domain failed");
  }
}

/** List sub package groups. */
export async function listSubPackageGroups(domain: string, packageGroup: string): Promise<ListSubPackageGroupsResult> {
  try {
    // TODO: implement list_sub_package_groups
    throw new Error("list_sub_package_groups not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_sub_package_groups failed");
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

/** Publish package version. */
export async function publishPackageVersion(domain: string, repository: string, format: string, package: string, packageVersion: string, assetContent: Uint8Array, assetName: string, assetSha256: string): Promise<PublishPackageVersionResult> {
  try {
    // TODO: implement publish_package_version
    throw new Error("publish_package_version not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "publish_package_version failed");
  }
}

/** Put domain permissions policy. */
export async function putDomainPermissionsPolicy(domain: string, policyDocument: string): Promise<PutDomainPermissionsPolicyResult> {
  try {
    // TODO: implement put_domain_permissions_policy
    throw new Error("put_domain_permissions_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_domain_permissions_policy failed");
  }
}

/** Put package origin configuration. */
export async function putPackageOriginConfiguration(domain: string, repository: string, format: string, package: string, restrictions: Record<string, unknown>): Promise<PutPackageOriginConfigurationResult> {
  try {
    // TODO: implement put_package_origin_configuration
    throw new Error("put_package_origin_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_package_origin_configuration failed");
  }
}

/** Put repository permissions policy. */
export async function putRepositoryPermissionsPolicy(domain: string, repository: string, policyDocument: string): Promise<PutRepositoryPermissionsPolicyResult> {
  try {
    // TODO: implement put_repository_permissions_policy
    throw new Error("put_repository_permissions_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_repository_permissions_policy failed");
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

/** Update package group. */
export async function updatePackageGroup(domain: string, packageGroup: string): Promise<UpdatePackageGroupResult> {
  try {
    // TODO: implement update_package_group
    throw new Error("update_package_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_package_group failed");
  }
}

/** Update package group origin configuration. */
export async function updatePackageGroupOriginConfiguration(domain: string, packageGroup: string): Promise<UpdatePackageGroupOriginConfigurationResult> {
  try {
    // TODO: implement update_package_group_origin_configuration
    throw new Error("update_package_group_origin_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_package_group_origin_configuration failed");
  }
}

/** Update package versions status. */
export async function updatePackageVersionsStatus(domain: string, repository: string, format: string, package: string, versions: string[], targetStatus: string): Promise<UpdatePackageVersionsStatusResult> {
  try {
    // TODO: implement update_package_versions_status
    throw new Error("update_package_versions_status not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_package_versions_status failed");
  }
}

/** Update repository. */
export async function updateRepository(domain: string, repository: string): Promise<UpdateRepositoryResult> {
  try {
    // TODO: implement update_repository
    throw new Error("update_repository not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_repository failed");
  }
}
