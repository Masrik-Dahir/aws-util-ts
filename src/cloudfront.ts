import { CloudfrontClient } from "@aws-sdk/client-cloudfront";
import { getClient } from "./client";
import { wrapAwsError } from "./exceptions";

/** A CloudFront distribution summary. */
export type DistributionResult = {
  id: string;
  arn: string;
  domainName: string;
  status: string;
  lastModifiedTime?: string;
  origins?: Record<string, unknown>[];
  enabled?: boolean;
  comment?: string;
  etag?: string;
  extra?: Record<string, unknown>;
};

/** A CloudFront cache invalidation. */
export type InvalidationResult = {
  id: string;
  distributionId: string;
  status: string;
  createTime?: string;
  paths?: string[];
  extra?: Record<string, unknown>;
};

/** A CloudFront origin access control. */
export type OriginAccessControlResult = {
  id: string;
  name: string;
  signingProtocol?: string;
  signingBehavior?: string;
  originType?: string;
  extra?: Record<string, unknown>;
};

/** A CloudFront cache policy. */
export type CachePolicyResult = {
  id: string;
  name: string;
  comment?: string;
  minTtl?: number;
  maxTtl?: number;
  defaultTtl?: number;
  extra?: Record<string, unknown>;
};

/** Result of associate_distribution_tenant_web_acl. */
export type AssociateDistributionTenantWebAclResult = {
  id?: string;
  webAclArn?: string;
  eTag?: string;
};

/** Result of associate_distribution_web_acl. */
export type AssociateDistributionWebAclResult = {
  id?: string;
  webAclArn?: string;
  eTag?: string;
};

/** Result of copy_distribution. */
export type CopyDistributionResult = {
  distribution?: Record<string, unknown>;
  location?: string;
  eTag?: string;
};

/** Result of create_anycast_ip_list. */
export type CreateAnycastIpListResult = {
  anycastIpList?: Record<string, unknown>;
  eTag?: string;
};

/** Result of create_cache_policy. */
export type CreateCachePolicyResult = {
  cachePolicy?: Record<string, unknown>;
  location?: string;
  eTag?: string;
};

/** Result of create_cloud_front_origin_access_identity. */
export type CreateCloudFrontOriginAccessIdentityResult = {
  cloudFrontOriginAccessIdentity?: Record<string, unknown>;
  location?: string;
  eTag?: string;
};

/** Result of create_connection_group. */
export type CreateConnectionGroupResult = {
  connectionGroup?: Record<string, unknown>;
  eTag?: string;
};

/** Result of create_continuous_deployment_policy. */
export type CreateContinuousDeploymentPolicyResult = {
  continuousDeploymentPolicy?: Record<string, unknown>;
  location?: string;
  eTag?: string;
};

/** Result of create_distribution_tenant. */
export type CreateDistributionTenantResult = {
  distributionTenant?: Record<string, unknown>;
  eTag?: string;
};

/** Result of create_distribution_with_tags. */
export type CreateDistributionWithTagsResult = {
  distribution?: Record<string, unknown>;
  location?: string;
  eTag?: string;
};

/** Result of create_field_level_encryption_config. */
export type CreateFieldLevelEncryptionConfigResult = {
  fieldLevelEncryption?: Record<string, unknown>;
  location?: string;
  eTag?: string;
};

/** Result of create_field_level_encryption_profile. */
export type CreateFieldLevelEncryptionProfileResult = {
  fieldLevelEncryptionProfile?: Record<string, unknown>;
  location?: string;
  eTag?: string;
};

/** Result of create_function. */
export type CreateFunctionResult = {
  functionSummary?: Record<string, unknown>;
  location?: string;
  eTag?: string;
};

/** Result of create_invalidation_for_distribution_tenant. */
export type CreateInvalidationForDistributionTenantResult = {
  location?: string;
  invalidation?: Record<string, unknown>;
};

/** Result of create_key_group. */
export type CreateKeyGroupResult = {
  keyGroup?: Record<string, unknown>;
  location?: string;
  eTag?: string;
};

/** Result of create_key_value_store. */
export type CreateKeyValueStoreResult = {
  keyValueStore?: Record<string, unknown>;
  eTag?: string;
  location?: string;
};

/** Result of create_monitoring_subscription. */
export type CreateMonitoringSubscriptionResult = {
  monitoringSubscription?: Record<string, unknown>;
};

/** Result of create_origin_request_policy. */
export type CreateOriginRequestPolicyResult = {
  originRequestPolicy?: Record<string, unknown>;
  location?: string;
  eTag?: string;
};

/** Result of create_public_key. */
export type CreatePublicKeyResult = {
  publicKey?: Record<string, unknown>;
  location?: string;
  eTag?: string;
};

/** Result of create_realtime_log_config. */
export type CreateRealtimeLogConfigResult = {
  realtimeLogConfig?: Record<string, unknown>;
};

/** Result of create_response_headers_policy. */
export type CreateResponseHeadersPolicyResult = {
  responseHeadersPolicy?: Record<string, unknown>;
  location?: string;
  eTag?: string;
};

/** Result of create_streaming_distribution. */
export type CreateStreamingDistributionResult = {
  streamingDistribution?: Record<string, unknown>;
  location?: string;
  eTag?: string;
};

/** Result of create_streaming_distribution_with_tags. */
export type CreateStreamingDistributionWithTagsResult = {
  streamingDistribution?: Record<string, unknown>;
  location?: string;
  eTag?: string;
};

/** Result of create_vpc_origin. */
export type CreateVpcOriginResult = {
  vpcOrigin?: Record<string, unknown>;
  location?: string;
  eTag?: string;
};

/** Result of delete_vpc_origin. */
export type DeleteVpcOriginResult = {
  vpcOrigin?: Record<string, unknown>;
  eTag?: string;
};

/** Result of describe_function. */
export type DescribeFunctionResult = {
  functionSummary?: Record<string, unknown>;
  eTag?: string;
};

/** Result of describe_key_value_store. */
export type DescribeKeyValueStoreResult = {
  keyValueStore?: Record<string, unknown>;
  eTag?: string;
};

/** Result of disassociate_distribution_tenant_web_acl. */
export type DisassociateDistributionTenantWebAclResult = {
  id?: string;
  eTag?: string;
};

/** Result of disassociate_distribution_web_acl. */
export type DisassociateDistributionWebAclResult = {
  id?: string;
  eTag?: string;
};

/** Result of get_anycast_ip_list. */
export type GetAnycastIpListResult = {
  anycastIpList?: Record<string, unknown>;
  eTag?: string;
};

/** Result of get_cache_policy. */
export type GetCachePolicyResult = {
  cachePolicy?: Record<string, unknown>;
  eTag?: string;
};

/** Result of get_cache_policy_config. */
export type GetCachePolicyConfigResult = {
  cachePolicyConfig?: Record<string, unknown>;
  eTag?: string;
};

/** Result of get_cloud_front_origin_access_identity. */
export type GetCloudFrontOriginAccessIdentityResult = {
  cloudFrontOriginAccessIdentity?: Record<string, unknown>;
  eTag?: string;
};

/** Result of get_cloud_front_origin_access_identity_config. */
export type GetCloudFrontOriginAccessIdentityConfigResult = {
  cloudFrontOriginAccessIdentityConfig?: Record<string, unknown>;
  eTag?: string;
};

/** Result of get_connection_group. */
export type GetConnectionGroupResult = {
  connectionGroup?: Record<string, unknown>;
  eTag?: string;
};

/** Result of get_connection_group_by_routing_endpoint. */
export type GetConnectionGroupByRoutingEndpointResult = {
  connectionGroup?: Record<string, unknown>;
  eTag?: string;
};

/** Result of get_continuous_deployment_policy. */
export type GetContinuousDeploymentPolicyResult = {
  continuousDeploymentPolicy?: Record<string, unknown>;
  eTag?: string;
};

/** Result of get_continuous_deployment_policy_config. */
export type GetContinuousDeploymentPolicyConfigResult = {
  continuousDeploymentPolicyConfig?: Record<string, unknown>;
  eTag?: string;
};

/** Result of get_distribution_config. */
export type GetDistributionConfigResult = {
  distributionConfig?: Record<string, unknown>;
  eTag?: string;
};

/** Result of get_distribution_tenant. */
export type GetDistributionTenantResult = {
  distributionTenant?: Record<string, unknown>;
  eTag?: string;
};

/** Result of get_distribution_tenant_by_domain. */
export type GetDistributionTenantByDomainResult = {
  distributionTenant?: Record<string, unknown>;
  eTag?: string;
};

/** Result of get_field_level_encryption. */
export type GetFieldLevelEncryptionResult = {
  fieldLevelEncryption?: Record<string, unknown>;
  eTag?: string;
};

/** Result of get_field_level_encryption_config. */
export type GetFieldLevelEncryptionConfigResult = {
  fieldLevelEncryptionConfig?: Record<string, unknown>;
  eTag?: string;
};

/** Result of get_field_level_encryption_profile. */
export type GetFieldLevelEncryptionProfileResult = {
  fieldLevelEncryptionProfile?: Record<string, unknown>;
  eTag?: string;
};

/** Result of get_field_level_encryption_profile_config. */
export type GetFieldLevelEncryptionProfileConfigResult = {
  fieldLevelEncryptionProfileConfig?: Record<string, unknown>;
  eTag?: string;
};

/** Result of get_function. */
export type GetFunctionResult = {
  functionCode?: Uint8Array;
  eTag?: string;
  contentType?: string;
};

/** Result of get_invalidation_for_distribution_tenant. */
export type GetInvalidationForDistributionTenantResult = {
  invalidation?: Record<string, unknown>;
};

/** Result of get_key_group. */
export type GetKeyGroupResult = {
  keyGroup?: Record<string, unknown>;
  eTag?: string;
};

/** Result of get_key_group_config. */
export type GetKeyGroupConfigResult = {
  keyGroupConfig?: Record<string, unknown>;
  eTag?: string;
};

/** Result of get_managed_certificate_details. */
export type GetManagedCertificateDetailsResult = {
  managedCertificateDetails?: Record<string, unknown>;
};

/** Result of get_monitoring_subscription. */
export type GetMonitoringSubscriptionResult = {
  monitoringSubscription?: Record<string, unknown>;
};

/** Result of get_origin_access_control_config. */
export type GetOriginAccessControlConfigResult = {
  originAccessControlConfig?: Record<string, unknown>;
  eTag?: string;
};

/** Result of get_origin_request_policy. */
export type GetOriginRequestPolicyResult = {
  originRequestPolicy?: Record<string, unknown>;
  eTag?: string;
};

/** Result of get_origin_request_policy_config. */
export type GetOriginRequestPolicyConfigResult = {
  originRequestPolicyConfig?: Record<string, unknown>;
  eTag?: string;
};

/** Result of get_public_key. */
export type GetPublicKeyResult = {
  publicKey?: Record<string, unknown>;
  eTag?: string;
};

/** Result of get_public_key_config. */
export type GetPublicKeyConfigResult = {
  publicKeyConfig?: Record<string, unknown>;
  eTag?: string;
};

/** Result of get_realtime_log_config. */
export type GetRealtimeLogConfigResult = {
  realtimeLogConfig?: Record<string, unknown>;
};

/** Result of get_resource_policy. */
export type GetResourcePolicyResult = {
  resourceArn?: string;
  policyDocument?: string;
};

/** Result of get_response_headers_policy. */
export type GetResponseHeadersPolicyResult = {
  responseHeadersPolicy?: Record<string, unknown>;
  eTag?: string;
};

/** Result of get_response_headers_policy_config. */
export type GetResponseHeadersPolicyConfigResult = {
  responseHeadersPolicyConfig?: Record<string, unknown>;
  eTag?: string;
};

/** Result of get_streaming_distribution. */
export type GetStreamingDistributionResult = {
  streamingDistribution?: Record<string, unknown>;
  eTag?: string;
};

/** Result of get_streaming_distribution_config. */
export type GetStreamingDistributionConfigResult = {
  streamingDistributionConfig?: Record<string, unknown>;
  eTag?: string;
};

/** Result of get_vpc_origin. */
export type GetVpcOriginResult = {
  vpcOrigin?: Record<string, unknown>;
  eTag?: string;
};

/** Result of list_anycast_ip_lists. */
export type ListAnycastIpListsResult = {
  anycastIpLists?: Record<string, unknown>;
};

/** Result of list_cache_policies. */
export type ListCachePoliciesResult = {
  cachePolicyList?: Record<string, unknown>;
};

/** Result of list_cloud_front_origin_access_identities. */
export type ListCloudFrontOriginAccessIdentitiesResult = {
  cloudFrontOriginAccessIdentityList?: Record<string, unknown>;
};

/** Result of list_conflicting_aliases. */
export type ListConflictingAliasesResult = {
  conflictingAliasesList?: Record<string, unknown>;
};

/** Result of list_connection_groups. */
export type ListConnectionGroupsResult = {
  nextMarker?: string;
  connectionGroups?: Record<string, unknown>[];
};

/** Result of list_continuous_deployment_policies. */
export type ListContinuousDeploymentPoliciesResult = {
  continuousDeploymentPolicyList?: Record<string, unknown>;
};

/** Result of list_distribution_tenants. */
export type ListDistributionTenantsResult = {
  nextMarker?: string;
  distributionTenantList?: Record<string, unknown>[];
};

/** Result of list_distribution_tenants_by_customization. */
export type ListDistributionTenantsByCustomizationResult = {
  nextMarker?: string;
  distributionTenantList?: Record<string, unknown>[];
};

/** Result of list_distributions_by_anycast_ip_list_id. */
export type ListDistributionsByAnycastIpListIdResult = {
  distributionList?: Record<string, unknown>;
};

/** Result of list_distributions_by_cache_policy_id. */
export type ListDistributionsByCachePolicyIdResult = {
  distributionIdList?: Record<string, unknown>;
};

/** Result of list_distributions_by_connection_mode. */
export type ListDistributionsByConnectionModeResult = {
  distributionList?: Record<string, unknown>;
};

/** Result of list_distributions_by_key_group. */
export type ListDistributionsByKeyGroupResult = {
  distributionIdList?: Record<string, unknown>;
};

/** Result of list_distributions_by_origin_request_policy_id. */
export type ListDistributionsByOriginRequestPolicyIdResult = {
  distributionIdList?: Record<string, unknown>;
};

/** Result of list_distributions_by_owned_resource. */
export type ListDistributionsByOwnedResourceResult = {
  distributionList?: Record<string, unknown>;
};

/** Result of list_distributions_by_realtime_log_config. */
export type ListDistributionsByRealtimeLogConfigResult = {
  distributionList?: Record<string, unknown>;
};

/** Result of list_distributions_by_response_headers_policy_id. */
export type ListDistributionsByResponseHeadersPolicyIdResult = {
  distributionIdList?: Record<string, unknown>;
};

/** Result of list_distributions_by_vpc_origin_id. */
export type ListDistributionsByVpcOriginIdResult = {
  distributionIdList?: Record<string, unknown>;
};

/** Result of list_distributions_by_web_acl_id. */
export type ListDistributionsByWebAclIdResult = {
  distributionList?: Record<string, unknown>;
};

/** Result of list_domain_conflicts. */
export type ListDomainConflictsResult = {
  domainConflicts?: Record<string, unknown>[];
  nextMarker?: string;
};

/** Result of list_field_level_encryption_configs. */
export type ListFieldLevelEncryptionConfigsResult = {
  fieldLevelEncryptionList?: Record<string, unknown>;
};

/** Result of list_field_level_encryption_profiles. */
export type ListFieldLevelEncryptionProfilesResult = {
  fieldLevelEncryptionProfileList?: Record<string, unknown>;
};

/** Result of list_functions. */
export type ListFunctionsResult = {
  functionList?: Record<string, unknown>;
};

/** Result of list_invalidations_for_distribution_tenant. */
export type ListInvalidationsForDistributionTenantResult = {
  invalidationList?: Record<string, unknown>;
};

/** Result of list_key_groups. */
export type ListKeyGroupsResult = {
  keyGroupList?: Record<string, unknown>;
};

/** Result of list_key_value_stores. */
export type ListKeyValueStoresResult = {
  keyValueStoreList?: Record<string, unknown>;
};

/** Result of list_origin_request_policies. */
export type ListOriginRequestPoliciesResult = {
  originRequestPolicyList?: Record<string, unknown>;
};

/** Result of list_public_keys. */
export type ListPublicKeysResult = {
  publicKeyList?: Record<string, unknown>;
};

/** Result of list_realtime_log_configs. */
export type ListRealtimeLogConfigsResult = {
  realtimeLogConfigs?: Record<string, unknown>;
};

/** Result of list_response_headers_policies. */
export type ListResponseHeadersPoliciesResult = {
  responseHeadersPolicyList?: Record<string, unknown>;
};

/** Result of list_streaming_distributions. */
export type ListStreamingDistributionsResult = {
  streamingDistributionList?: Record<string, unknown>;
};

/** Result of list_tags_for_resource. */
export type ListTagsForResourceResult = {
  tags?: Record<string, unknown>;
};

/** Result of list_vpc_origins. */
export type ListVpcOriginsResult = {
  vpcOriginList?: Record<string, unknown>;
};

/** Result of publish_function. */
export type PublishFunctionResult = {
  functionSummary?: Record<string, unknown>;
};

/** Result of put_resource_policy. */
export type PutResourcePolicyResult = {
  resourceArn?: string;
};

/** Result of run_function. */
export type RunFunctionResult = {
  runResult?: Record<string, unknown>;
};

/** Result of update_anycast_ip_list. */
export type UpdateAnycastIpListResult = {
  anycastIpList?: Record<string, unknown>;
  eTag?: string;
};

/** Result of update_cache_policy. */
export type UpdateCachePolicyResult = {
  cachePolicy?: Record<string, unknown>;
  eTag?: string;
};

/** Result of update_cloud_front_origin_access_identity. */
export type UpdateCloudFrontOriginAccessIdentityResult = {
  cloudFrontOriginAccessIdentity?: Record<string, unknown>;
  eTag?: string;
};

/** Result of update_connection_group. */
export type UpdateConnectionGroupResult = {
  connectionGroup?: Record<string, unknown>;
  eTag?: string;
};

/** Result of update_continuous_deployment_policy. */
export type UpdateContinuousDeploymentPolicyResult = {
  continuousDeploymentPolicy?: Record<string, unknown>;
  eTag?: string;
};

/** Result of update_distribution_tenant. */
export type UpdateDistributionTenantResult = {
  distributionTenant?: Record<string, unknown>;
  eTag?: string;
};

/** Result of update_distribution_with_staging_config. */
export type UpdateDistributionWithStagingConfigResult = {
  distribution?: Record<string, unknown>;
  eTag?: string;
};

/** Result of update_domain_association. */
export type UpdateDomainAssociationResult = {
  domain?: string;
  resourceId?: string;
  eTag?: string;
};

/** Result of update_field_level_encryption_config. */
export type UpdateFieldLevelEncryptionConfigResult = {
  fieldLevelEncryption?: Record<string, unknown>;
  eTag?: string;
};

/** Result of update_field_level_encryption_profile. */
export type UpdateFieldLevelEncryptionProfileResult = {
  fieldLevelEncryptionProfile?: Record<string, unknown>;
  eTag?: string;
};

/** Result of update_function. */
export type UpdateFunctionResult = {
  functionSummary?: Record<string, unknown>;
  eTag?: string;
};

/** Result of update_key_group. */
export type UpdateKeyGroupResult = {
  keyGroup?: Record<string, unknown>;
  eTag?: string;
};

/** Result of update_key_value_store. */
export type UpdateKeyValueStoreResult = {
  keyValueStore?: Record<string, unknown>;
  eTag?: string;
};

/** Result of update_origin_access_control. */
export type UpdateOriginAccessControlResult = {
  originAccessControl?: Record<string, unknown>;
  eTag?: string;
};

/** Result of update_origin_request_policy. */
export type UpdateOriginRequestPolicyResult = {
  originRequestPolicy?: Record<string, unknown>;
  eTag?: string;
};

/** Result of update_public_key. */
export type UpdatePublicKeyResult = {
  publicKey?: Record<string, unknown>;
  eTag?: string;
};

/** Result of update_realtime_log_config. */
export type UpdateRealtimeLogConfigResult = {
  realtimeLogConfig?: Record<string, unknown>;
};

/** Result of update_response_headers_policy. */
export type UpdateResponseHeadersPolicyResult = {
  responseHeadersPolicy?: Record<string, unknown>;
  eTag?: string;
};

/** Result of update_streaming_distribution. */
export type UpdateStreamingDistributionResult = {
  streamingDistribution?: Record<string, unknown>;
  eTag?: string;
};

/** Result of update_vpc_origin. */
export type UpdateVpcOriginResult = {
  vpcOrigin?: Record<string, unknown>;
  eTag?: string;
};

/** Result of verify_dns_configuration. */
export type VerifyDnsConfigurationResult = {
  dnsConfigurationList?: Record<string, unknown>[];
};

/** Create a new CloudFront distribution. */
export async function createDistribution(): Promise<DistributionResult> {
  try {
    // TODO: implement create_distribution
    throw new Error("create_distribution not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_distribution failed");
  }
}

/** Fetch a CloudFront distribution by ID. */
export async function getDistribution(distributionId: string): Promise<DistributionResult> {
  try {
    // TODO: implement get_distribution
    throw new Error("get_distribution not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_distribution failed");
  }
}

/** List all CloudFront distributions in the account. */
export async function listDistributions(): Promise<DistributionResult[]> {
  try {
    // TODO: implement list_distributions
    throw new Error("list_distributions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_distributions failed");
  }
}

/** Update an existing CloudFront distribution. */
export async function updateDistribution(distributionId: string): Promise<DistributionResult> {
  try {
    // TODO: implement update_distribution
    throw new Error("update_distribution not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_distribution failed");
  }
}

/** Delete a CloudFront distribution. */
export async function deleteDistribution(distributionId: string): Promise<void> {
  try {
    // TODO: implement delete_distribution
    throw new Error("delete_distribution not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_distribution failed");
  }
}

/** Create a cache invalidation for a CloudFront distribution. */
export async function createInvalidation(distributionId: string): Promise<InvalidationResult> {
  try {
    // TODO: implement create_invalidation
    throw new Error("create_invalidation not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_invalidation failed");
  }
}

/** Fetch a specific invalidation. */
export async function getInvalidation(distributionId: string, invalidationId: string): Promise<InvalidationResult> {
  try {
    // TODO: implement get_invalidation
    throw new Error("get_invalidation not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_invalidation failed");
  }
}

/** List all invalidations for a CloudFront distribution. */
export async function listInvalidations(distributionId: string): Promise<InvalidationResult[]> {
  try {
    // TODO: implement list_invalidations
    throw new Error("list_invalidations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_invalidations failed");
  }
}

/** Create a CloudFront origin access control (OAC). */
export async function createOriginAccessControl(name: string): Promise<OriginAccessControlResult> {
  try {
    // TODO: implement create_origin_access_control
    throw new Error("create_origin_access_control not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_origin_access_control failed");
  }
}

/** Fetch an origin access control by ID. */
export async function getOriginAccessControl(oacId: string): Promise<OriginAccessControlResult> {
  try {
    // TODO: implement get_origin_access_control
    throw new Error("get_origin_access_control not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_origin_access_control failed");
  }
}

/** List all origin access controls. */
export async function listOriginAccessControls(): Promise<OriginAccessControlResult[]> {
  try {
    // TODO: implement list_origin_access_controls
    throw new Error("list_origin_access_controls not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_origin_access_controls failed");
  }
}

/** Delete an origin access control. */
export async function deleteOriginAccessControl(oacId: string): Promise<void> {
  try {
    // TODO: implement delete_origin_access_control
    throw new Error("delete_origin_access_control not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_origin_access_control failed");
  }
}

/** Poll until a distribution reaches the target status. */
export async function waitForDistribution(distributionId: string): Promise<DistributionResult> {
  try {
    // TODO: implement wait_for_distribution
    throw new Error("wait_for_distribution not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "wait_for_distribution failed");
  }
}

/** Create a cache invalidation and poll until it completes. */
export async function invalidateAndWait(distributionId: string): Promise<InvalidationResult> {
  try {
    // TODO: implement invalidate_and_wait
    throw new Error("invalidate_and_wait not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "invalidate_and_wait failed");
  }
}

/** Associate alias. */
export async function associateAlias(targetDistributionId: string, alias: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement associate_alias
    throw new Error("associate_alias not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "associate_alias failed");
  }
}

/** Associate distribution tenant web acl. */
export async function associateDistributionTenantWebAcl(id: string, webAclArn: string): Promise<AssociateDistributionTenantWebAclResult> {
  try {
    // TODO: implement associate_distribution_tenant_web_acl
    throw new Error("associate_distribution_tenant_web_acl not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "associate_distribution_tenant_web_acl failed");
  }
}

/** Associate distribution web acl. */
export async function associateDistributionWebAcl(id: string, webAclArn: string): Promise<AssociateDistributionWebAclResult> {
  try {
    // TODO: implement associate_distribution_web_acl
    throw new Error("associate_distribution_web_acl not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "associate_distribution_web_acl failed");
  }
}

/** Copy distribution. */
export async function copyDistribution(primaryDistributionId: string, callerReference: string): Promise<CopyDistributionResult> {
  try {
    // TODO: implement copy_distribution
    throw new Error("copy_distribution not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "copy_distribution failed");
  }
}

/** Create anycast ip list. */
export async function createAnycastIpList(name: string, ipCount: number): Promise<CreateAnycastIpListResult> {
  try {
    // TODO: implement create_anycast_ip_list
    throw new Error("create_anycast_ip_list not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_anycast_ip_list failed");
  }
}

/** Create cache policy. */
export async function createCachePolicy(cachePolicyConfig: Record<string, unknown>, regionName?: string): Promise<CreateCachePolicyResult> {
  try {
    // TODO: implement create_cache_policy
    throw new Error("create_cache_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_cache_policy failed");
  }
}

/** Create cloud front origin access identity. */
export async function createCloudFrontOriginAccessIdentity(cloudFrontOriginAccessIdentityConfig: Record<string, unknown>, regionName?: string): Promise<CreateCloudFrontOriginAccessIdentityResult> {
  try {
    // TODO: implement create_cloud_front_origin_access_identity
    throw new Error("create_cloud_front_origin_access_identity not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_cloud_front_origin_access_identity failed");
  }
}

/** Create connection group. */
export async function createConnectionGroup(name: string): Promise<CreateConnectionGroupResult> {
  try {
    // TODO: implement create_connection_group
    throw new Error("create_connection_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_connection_group failed");
  }
}

/** Create continuous deployment policy. */
export async function createContinuousDeploymentPolicy(continuousDeploymentPolicyConfig: Record<string, unknown>, regionName?: string): Promise<CreateContinuousDeploymentPolicyResult> {
  try {
    // TODO: implement create_continuous_deployment_policy
    throw new Error("create_continuous_deployment_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_continuous_deployment_policy failed");
  }
}

/** Create distribution tenant. */
export async function createDistributionTenant(distributionId: string, name: string, domains: Record<string, unknown>[]): Promise<CreateDistributionTenantResult> {
  try {
    // TODO: implement create_distribution_tenant
    throw new Error("create_distribution_tenant not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_distribution_tenant failed");
  }
}

/** Create distribution with tags. */
export async function createDistributionWithTags(distributionConfigWithTags: Record<string, unknown>, regionName?: string): Promise<CreateDistributionWithTagsResult> {
  try {
    // TODO: implement create_distribution_with_tags
    throw new Error("create_distribution_with_tags not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_distribution_with_tags failed");
  }
}

/** Create field level encryption config. */
export async function createFieldLevelEncryptionConfig(fieldLevelEncryptionConfig: Record<string, unknown>, regionName?: string): Promise<CreateFieldLevelEncryptionConfigResult> {
  try {
    // TODO: implement create_field_level_encryption_config
    throw new Error("create_field_level_encryption_config not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_field_level_encryption_config failed");
  }
}

/** Create field level encryption profile. */
export async function createFieldLevelEncryptionProfile(fieldLevelEncryptionProfileConfig: Record<string, unknown>, regionName?: string): Promise<CreateFieldLevelEncryptionProfileResult> {
  try {
    // TODO: implement create_field_level_encryption_profile
    throw new Error("create_field_level_encryption_profile not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_field_level_encryption_profile failed");
  }
}

/** Create function. */
export async function createFunction(name: string, functionConfig: Record<string, unknown>, functionCode: Uint8Array, regionName?: string): Promise<CreateFunctionResult> {
  try {
    // TODO: implement create_function
    throw new Error("create_function not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_function failed");
  }
}

/** Create invalidation for distribution tenant. */
export async function createInvalidationForDistributionTenant(id: string, invalidationBatch: Record<string, unknown>, regionName?: string): Promise<CreateInvalidationForDistributionTenantResult> {
  try {
    // TODO: implement create_invalidation_for_distribution_tenant
    throw new Error("create_invalidation_for_distribution_tenant not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_invalidation_for_distribution_tenant failed");
  }
}

/** Create key group. */
export async function createKeyGroup(keyGroupConfig: Record<string, unknown>, regionName?: string): Promise<CreateKeyGroupResult> {
  try {
    // TODO: implement create_key_group
    throw new Error("create_key_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_key_group failed");
  }
}

/** Create key value store. */
export async function createKeyValueStore(name: string): Promise<CreateKeyValueStoreResult> {
  try {
    // TODO: implement create_key_value_store
    throw new Error("create_key_value_store not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_key_value_store failed");
  }
}

/** Create monitoring subscription. */
export async function createMonitoringSubscription(distributionId: string, monitoringSubscription: Record<string, unknown>, regionName?: string): Promise<CreateMonitoringSubscriptionResult> {
  try {
    // TODO: implement create_monitoring_subscription
    throw new Error("create_monitoring_subscription not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_monitoring_subscription failed");
  }
}

/** Create origin request policy. */
export async function createOriginRequestPolicy(originRequestPolicyConfig: Record<string, unknown>, regionName?: string): Promise<CreateOriginRequestPolicyResult> {
  try {
    // TODO: implement create_origin_request_policy
    throw new Error("create_origin_request_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_origin_request_policy failed");
  }
}

/** Create public key. */
export async function createPublicKey(publicKeyConfig: Record<string, unknown>, regionName?: string): Promise<CreatePublicKeyResult> {
  try {
    // TODO: implement create_public_key
    throw new Error("create_public_key not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_public_key failed");
  }
}

/** Create realtime log config. */
export async function createRealtimeLogConfig(endPoints: Record<string, unknown>[], fields: string[], name: string, samplingRate: number, regionName?: string): Promise<CreateRealtimeLogConfigResult> {
  try {
    // TODO: implement create_realtime_log_config
    throw new Error("create_realtime_log_config not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_realtime_log_config failed");
  }
}

/** Create response headers policy. */
export async function createResponseHeadersPolicy(responseHeadersPolicyConfig: Record<string, unknown>, regionName?: string): Promise<CreateResponseHeadersPolicyResult> {
  try {
    // TODO: implement create_response_headers_policy
    throw new Error("create_response_headers_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_response_headers_policy failed");
  }
}

/** Create streaming distribution. */
export async function createStreamingDistribution(streamingDistributionConfig: Record<string, unknown>, regionName?: string): Promise<CreateStreamingDistributionResult> {
  try {
    // TODO: implement create_streaming_distribution
    throw new Error("create_streaming_distribution not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_streaming_distribution failed");
  }
}

/** Create streaming distribution with tags. */
export async function createStreamingDistributionWithTags(streamingDistributionConfigWithTags: Record<string, unknown>, regionName?: string): Promise<CreateStreamingDistributionWithTagsResult> {
  try {
    // TODO: implement create_streaming_distribution_with_tags
    throw new Error("create_streaming_distribution_with_tags not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_streaming_distribution_with_tags failed");
  }
}

/** Create vpc origin. */
export async function createVpcOrigin(vpcOriginEndpointConfig: Record<string, unknown>): Promise<CreateVpcOriginResult> {
  try {
    // TODO: implement create_vpc_origin
    throw new Error("create_vpc_origin not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_vpc_origin failed");
  }
}

/** Delete anycast ip list. */
export async function deleteAnycastIpList(id: string, ifMatch: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_anycast_ip_list
    throw new Error("delete_anycast_ip_list not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_anycast_ip_list failed");
  }
}

/** Delete cache policy. */
export async function deleteCachePolicy(id: string): Promise<void> {
  try {
    // TODO: implement delete_cache_policy
    throw new Error("delete_cache_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_cache_policy failed");
  }
}

/** Delete cloud front origin access identity. */
export async function deleteCloudFrontOriginAccessIdentity(id: string): Promise<void> {
  try {
    // TODO: implement delete_cloud_front_origin_access_identity
    throw new Error("delete_cloud_front_origin_access_identity not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_cloud_front_origin_access_identity failed");
  }
}

/** Delete connection group. */
export async function deleteConnectionGroup(id: string, ifMatch: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_connection_group
    throw new Error("delete_connection_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_connection_group failed");
  }
}

/** Delete continuous deployment policy. */
export async function deleteContinuousDeploymentPolicy(id: string): Promise<void> {
  try {
    // TODO: implement delete_continuous_deployment_policy
    throw new Error("delete_continuous_deployment_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_continuous_deployment_policy failed");
  }
}

/** Delete distribution tenant. */
export async function deleteDistributionTenant(id: string, ifMatch: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_distribution_tenant
    throw new Error("delete_distribution_tenant not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_distribution_tenant failed");
  }
}

/** Delete field level encryption config. */
export async function deleteFieldLevelEncryptionConfig(id: string): Promise<void> {
  try {
    // TODO: implement delete_field_level_encryption_config
    throw new Error("delete_field_level_encryption_config not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_field_level_encryption_config failed");
  }
}

/** Delete field level encryption profile. */
export async function deleteFieldLevelEncryptionProfile(id: string): Promise<void> {
  try {
    // TODO: implement delete_field_level_encryption_profile
    throw new Error("delete_field_level_encryption_profile not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_field_level_encryption_profile failed");
  }
}

/** Delete function. */
export async function deleteFunction(name: string, ifMatch: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_function
    throw new Error("delete_function not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_function failed");
  }
}

/** Delete key group. */
export async function deleteKeyGroup(id: string): Promise<void> {
  try {
    // TODO: implement delete_key_group
    throw new Error("delete_key_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_key_group failed");
  }
}

/** Delete key value store. */
export async function deleteKeyValueStore(name: string, ifMatch: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_key_value_store
    throw new Error("delete_key_value_store not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_key_value_store failed");
  }
}

/** Delete monitoring subscription. */
export async function deleteMonitoringSubscription(distributionId: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_monitoring_subscription
    throw new Error("delete_monitoring_subscription not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_monitoring_subscription failed");
  }
}

/** Delete origin request policy. */
export async function deleteOriginRequestPolicy(id: string): Promise<void> {
  try {
    // TODO: implement delete_origin_request_policy
    throw new Error("delete_origin_request_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_origin_request_policy failed");
  }
}

/** Delete public key. */
export async function deletePublicKey(id: string): Promise<void> {
  try {
    // TODO: implement delete_public_key
    throw new Error("delete_public_key not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_public_key failed");
  }
}

/** Delete realtime log config. */
export async function deleteRealtimeLogConfig(): Promise<void> {
  try {
    // TODO: implement delete_realtime_log_config
    throw new Error("delete_realtime_log_config not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_realtime_log_config failed");
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

/** Delete response headers policy. */
export async function deleteResponseHeadersPolicy(id: string): Promise<void> {
  try {
    // TODO: implement delete_response_headers_policy
    throw new Error("delete_response_headers_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_response_headers_policy failed");
  }
}

/** Delete streaming distribution. */
export async function deleteStreamingDistribution(id: string): Promise<void> {
  try {
    // TODO: implement delete_streaming_distribution
    throw new Error("delete_streaming_distribution not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_streaming_distribution failed");
  }
}

/** Delete vpc origin. */
export async function deleteVpcOrigin(id: string, ifMatch: string, regionName?: string): Promise<DeleteVpcOriginResult> {
  try {
    // TODO: implement delete_vpc_origin
    throw new Error("delete_vpc_origin not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_vpc_origin failed");
  }
}

/** Describe function. */
export async function describeFunction(name: string): Promise<DescribeFunctionResult> {
  try {
    // TODO: implement describe_function
    throw new Error("describe_function not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_function failed");
  }
}

/** Describe key value store. */
export async function describeKeyValueStore(name: string, regionName?: string): Promise<DescribeKeyValueStoreResult> {
  try {
    // TODO: implement describe_key_value_store
    throw new Error("describe_key_value_store not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_key_value_store failed");
  }
}

/** Disassociate distribution tenant web acl. */
export async function disassociateDistributionTenantWebAcl(id: string): Promise<DisassociateDistributionTenantWebAclResult> {
  try {
    // TODO: implement disassociate_distribution_tenant_web_acl
    throw new Error("disassociate_distribution_tenant_web_acl not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disassociate_distribution_tenant_web_acl failed");
  }
}

/** Disassociate distribution web acl. */
export async function disassociateDistributionWebAcl(id: string): Promise<DisassociateDistributionWebAclResult> {
  try {
    // TODO: implement disassociate_distribution_web_acl
    throw new Error("disassociate_distribution_web_acl not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disassociate_distribution_web_acl failed");
  }
}

/** Get anycast ip list. */
export async function getAnycastIpList(id: string, regionName?: string): Promise<GetAnycastIpListResult> {
  try {
    // TODO: implement get_anycast_ip_list
    throw new Error("get_anycast_ip_list not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_anycast_ip_list failed");
  }
}

/** Get cache policy. */
export async function getCachePolicy(id: string, regionName?: string): Promise<GetCachePolicyResult> {
  try {
    // TODO: implement get_cache_policy
    throw new Error("get_cache_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_cache_policy failed");
  }
}

/** Get cache policy config. */
export async function getCachePolicyConfig(id: string, regionName?: string): Promise<GetCachePolicyConfigResult> {
  try {
    // TODO: implement get_cache_policy_config
    throw new Error("get_cache_policy_config not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_cache_policy_config failed");
  }
}

/** Get cloud front origin access identity. */
export async function getCloudFrontOriginAccessIdentity(id: string, regionName?: string): Promise<GetCloudFrontOriginAccessIdentityResult> {
  try {
    // TODO: implement get_cloud_front_origin_access_identity
    throw new Error("get_cloud_front_origin_access_identity not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_cloud_front_origin_access_identity failed");
  }
}

/** Get cloud front origin access identity config. */
export async function getCloudFrontOriginAccessIdentityConfig(id: string, regionName?: string): Promise<GetCloudFrontOriginAccessIdentityConfigResult> {
  try {
    // TODO: implement get_cloud_front_origin_access_identity_config
    throw new Error("get_cloud_front_origin_access_identity_config not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_cloud_front_origin_access_identity_config failed");
  }
}

/** Get connection group. */
export async function getConnectionGroup(identifier: string, regionName?: string): Promise<GetConnectionGroupResult> {
  try {
    // TODO: implement get_connection_group
    throw new Error("get_connection_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_connection_group failed");
  }
}

/** Get connection group by routing endpoint. */
export async function getConnectionGroupByRoutingEndpoint(routingEndpoint: string, regionName?: string): Promise<GetConnectionGroupByRoutingEndpointResult> {
  try {
    // TODO: implement get_connection_group_by_routing_endpoint
    throw new Error("get_connection_group_by_routing_endpoint not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_connection_group_by_routing_endpoint failed");
  }
}

/** Get continuous deployment policy. */
export async function getContinuousDeploymentPolicy(id: string, regionName?: string): Promise<GetContinuousDeploymentPolicyResult> {
  try {
    // TODO: implement get_continuous_deployment_policy
    throw new Error("get_continuous_deployment_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_continuous_deployment_policy failed");
  }
}

/** Get continuous deployment policy config. */
export async function getContinuousDeploymentPolicyConfig(id: string, regionName?: string): Promise<GetContinuousDeploymentPolicyConfigResult> {
  try {
    // TODO: implement get_continuous_deployment_policy_config
    throw new Error("get_continuous_deployment_policy_config not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_continuous_deployment_policy_config failed");
  }
}

/** Get distribution config. */
export async function getDistributionConfig(id: string, regionName?: string): Promise<GetDistributionConfigResult> {
  try {
    // TODO: implement get_distribution_config
    throw new Error("get_distribution_config not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_distribution_config failed");
  }
}

/** Get distribution tenant. */
export async function getDistributionTenant(identifier: string, regionName?: string): Promise<GetDistributionTenantResult> {
  try {
    // TODO: implement get_distribution_tenant
    throw new Error("get_distribution_tenant not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_distribution_tenant failed");
  }
}

/** Get distribution tenant by domain. */
export async function getDistributionTenantByDomain(domain: string, regionName?: string): Promise<GetDistributionTenantByDomainResult> {
  try {
    // TODO: implement get_distribution_tenant_by_domain
    throw new Error("get_distribution_tenant_by_domain not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_distribution_tenant_by_domain failed");
  }
}

/** Get field level encryption. */
export async function getFieldLevelEncryption(id: string, regionName?: string): Promise<GetFieldLevelEncryptionResult> {
  try {
    // TODO: implement get_field_level_encryption
    throw new Error("get_field_level_encryption not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_field_level_encryption failed");
  }
}

/** Get field level encryption config. */
export async function getFieldLevelEncryptionConfig(id: string, regionName?: string): Promise<GetFieldLevelEncryptionConfigResult> {
  try {
    // TODO: implement get_field_level_encryption_config
    throw new Error("get_field_level_encryption_config not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_field_level_encryption_config failed");
  }
}

/** Get field level encryption profile. */
export async function getFieldLevelEncryptionProfile(id: string, regionName?: string): Promise<GetFieldLevelEncryptionProfileResult> {
  try {
    // TODO: implement get_field_level_encryption_profile
    throw new Error("get_field_level_encryption_profile not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_field_level_encryption_profile failed");
  }
}

/** Get field level encryption profile config. */
export async function getFieldLevelEncryptionProfileConfig(id: string, regionName?: string): Promise<GetFieldLevelEncryptionProfileConfigResult> {
  try {
    // TODO: implement get_field_level_encryption_profile_config
    throw new Error("get_field_level_encryption_profile_config not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_field_level_encryption_profile_config failed");
  }
}

/** Get function. */
export async function getFunction(name: string): Promise<GetFunctionResult> {
  try {
    // TODO: implement get_function
    throw new Error("get_function not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_function failed");
  }
}

/** Get invalidation for distribution tenant. */
export async function getInvalidationForDistributionTenant(distributionTenantId: string, id: string, regionName?: string): Promise<GetInvalidationForDistributionTenantResult> {
  try {
    // TODO: implement get_invalidation_for_distribution_tenant
    throw new Error("get_invalidation_for_distribution_tenant not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_invalidation_for_distribution_tenant failed");
  }
}

/** Get key group. */
export async function getKeyGroup(id: string, regionName?: string): Promise<GetKeyGroupResult> {
  try {
    // TODO: implement get_key_group
    throw new Error("get_key_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_key_group failed");
  }
}

/** Get key group config. */
export async function getKeyGroupConfig(id: string, regionName?: string): Promise<GetKeyGroupConfigResult> {
  try {
    // TODO: implement get_key_group_config
    throw new Error("get_key_group_config not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_key_group_config failed");
  }
}

/** Get managed certificate details. */
export async function getManagedCertificateDetails(identifier: string, regionName?: string): Promise<GetManagedCertificateDetailsResult> {
  try {
    // TODO: implement get_managed_certificate_details
    throw new Error("get_managed_certificate_details not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_managed_certificate_details failed");
  }
}

/** Get monitoring subscription. */
export async function getMonitoringSubscription(distributionId: string, regionName?: string): Promise<GetMonitoringSubscriptionResult> {
  try {
    // TODO: implement get_monitoring_subscription
    throw new Error("get_monitoring_subscription not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_monitoring_subscription failed");
  }
}

/** Get origin access control config. */
export async function getOriginAccessControlConfig(id: string, regionName?: string): Promise<GetOriginAccessControlConfigResult> {
  try {
    // TODO: implement get_origin_access_control_config
    throw new Error("get_origin_access_control_config not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_origin_access_control_config failed");
  }
}

/** Get origin request policy. */
export async function getOriginRequestPolicy(id: string, regionName?: string): Promise<GetOriginRequestPolicyResult> {
  try {
    // TODO: implement get_origin_request_policy
    throw new Error("get_origin_request_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_origin_request_policy failed");
  }
}

/** Get origin request policy config. */
export async function getOriginRequestPolicyConfig(id: string, regionName?: string): Promise<GetOriginRequestPolicyConfigResult> {
  try {
    // TODO: implement get_origin_request_policy_config
    throw new Error("get_origin_request_policy_config not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_origin_request_policy_config failed");
  }
}

/** Get public key. */
export async function getPublicKey(id: string, regionName?: string): Promise<GetPublicKeyResult> {
  try {
    // TODO: implement get_public_key
    throw new Error("get_public_key not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_public_key failed");
  }
}

/** Get public key config. */
export async function getPublicKeyConfig(id: string, regionName?: string): Promise<GetPublicKeyConfigResult> {
  try {
    // TODO: implement get_public_key_config
    throw new Error("get_public_key_config not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_public_key_config failed");
  }
}

/** Get realtime log config. */
export async function getRealtimeLogConfig(): Promise<GetRealtimeLogConfigResult> {
  try {
    // TODO: implement get_realtime_log_config
    throw new Error("get_realtime_log_config not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_realtime_log_config failed");
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

/** Get response headers policy. */
export async function getResponseHeadersPolicy(id: string, regionName?: string): Promise<GetResponseHeadersPolicyResult> {
  try {
    // TODO: implement get_response_headers_policy
    throw new Error("get_response_headers_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_response_headers_policy failed");
  }
}

/** Get response headers policy config. */
export async function getResponseHeadersPolicyConfig(id: string, regionName?: string): Promise<GetResponseHeadersPolicyConfigResult> {
  try {
    // TODO: implement get_response_headers_policy_config
    throw new Error("get_response_headers_policy_config not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_response_headers_policy_config failed");
  }
}

/** Get streaming distribution. */
export async function getStreamingDistribution(id: string, regionName?: string): Promise<GetStreamingDistributionResult> {
  try {
    // TODO: implement get_streaming_distribution
    throw new Error("get_streaming_distribution not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_streaming_distribution failed");
  }
}

/** Get streaming distribution config. */
export async function getStreamingDistributionConfig(id: string, regionName?: string): Promise<GetStreamingDistributionConfigResult> {
  try {
    // TODO: implement get_streaming_distribution_config
    throw new Error("get_streaming_distribution_config not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_streaming_distribution_config failed");
  }
}

/** Get vpc origin. */
export async function getVpcOrigin(id: string, regionName?: string): Promise<GetVpcOriginResult> {
  try {
    // TODO: implement get_vpc_origin
    throw new Error("get_vpc_origin not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_vpc_origin failed");
  }
}

/** List anycast ip lists. */
export async function listAnycastIpLists(): Promise<ListAnycastIpListsResult> {
  try {
    // TODO: implement list_anycast_ip_lists
    throw new Error("list_anycast_ip_lists not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_anycast_ip_lists failed");
  }
}

/** List cache policies. */
export async function listCachePolicies(): Promise<ListCachePoliciesResult> {
  try {
    // TODO: implement list_cache_policies
    throw new Error("list_cache_policies not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_cache_policies failed");
  }
}

/** List cloud front origin access identities. */
export async function listCloudFrontOriginAccessIdentities(): Promise<ListCloudFrontOriginAccessIdentitiesResult> {
  try {
    // TODO: implement list_cloud_front_origin_access_identities
    throw new Error("list_cloud_front_origin_access_identities not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_cloud_front_origin_access_identities failed");
  }
}

/** List conflicting aliases. */
export async function listConflictingAliases(distributionId: string, alias: string): Promise<ListConflictingAliasesResult> {
  try {
    // TODO: implement list_conflicting_aliases
    throw new Error("list_conflicting_aliases not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_conflicting_aliases failed");
  }
}

/** List connection groups. */
export async function listConnectionGroups(): Promise<ListConnectionGroupsResult> {
  try {
    // TODO: implement list_connection_groups
    throw new Error("list_connection_groups not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_connection_groups failed");
  }
}

/** List continuous deployment policies. */
export async function listContinuousDeploymentPolicies(): Promise<ListContinuousDeploymentPoliciesResult> {
  try {
    // TODO: implement list_continuous_deployment_policies
    throw new Error("list_continuous_deployment_policies not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_continuous_deployment_policies failed");
  }
}

/** List distribution tenants. */
export async function listDistributionTenants(): Promise<ListDistributionTenantsResult> {
  try {
    // TODO: implement list_distribution_tenants
    throw new Error("list_distribution_tenants not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_distribution_tenants failed");
  }
}

/** List distribution tenants by customization. */
export async function listDistributionTenantsByCustomization(): Promise<ListDistributionTenantsByCustomizationResult> {
  try {
    // TODO: implement list_distribution_tenants_by_customization
    throw new Error("list_distribution_tenants_by_customization not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_distribution_tenants_by_customization failed");
  }
}

/** List distributions by anycast ip list id. */
export async function listDistributionsByAnycastIpListId(anycastIpListId: string): Promise<ListDistributionsByAnycastIpListIdResult> {
  try {
    // TODO: implement list_distributions_by_anycast_ip_list_id
    throw new Error("list_distributions_by_anycast_ip_list_id not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_distributions_by_anycast_ip_list_id failed");
  }
}

/** List distributions by cache policy id. */
export async function listDistributionsByCachePolicyId(cachePolicyId: string): Promise<ListDistributionsByCachePolicyIdResult> {
  try {
    // TODO: implement list_distributions_by_cache_policy_id
    throw new Error("list_distributions_by_cache_policy_id not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_distributions_by_cache_policy_id failed");
  }
}

/** List distributions by connection mode. */
export async function listDistributionsByConnectionMode(connectionMode: string): Promise<ListDistributionsByConnectionModeResult> {
  try {
    // TODO: implement list_distributions_by_connection_mode
    throw new Error("list_distributions_by_connection_mode not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_distributions_by_connection_mode failed");
  }
}

/** List distributions by key group. */
export async function listDistributionsByKeyGroup(keyGroupId: string): Promise<ListDistributionsByKeyGroupResult> {
  try {
    // TODO: implement list_distributions_by_key_group
    throw new Error("list_distributions_by_key_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_distributions_by_key_group failed");
  }
}

/** List distributions by origin request policy id. */
export async function listDistributionsByOriginRequestPolicyId(originRequestPolicyId: string): Promise<ListDistributionsByOriginRequestPolicyIdResult> {
  try {
    // TODO: implement list_distributions_by_origin_request_policy_id
    throw new Error("list_distributions_by_origin_request_policy_id not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_distributions_by_origin_request_policy_id failed");
  }
}

/** List distributions by owned resource. */
export async function listDistributionsByOwnedResource(resourceArn: string): Promise<ListDistributionsByOwnedResourceResult> {
  try {
    // TODO: implement list_distributions_by_owned_resource
    throw new Error("list_distributions_by_owned_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_distributions_by_owned_resource failed");
  }
}

/** List distributions by realtime log config. */
export async function listDistributionsByRealtimeLogConfig(): Promise<ListDistributionsByRealtimeLogConfigResult> {
  try {
    // TODO: implement list_distributions_by_realtime_log_config
    throw new Error("list_distributions_by_realtime_log_config not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_distributions_by_realtime_log_config failed");
  }
}

/** List distributions by response headers policy id. */
export async function listDistributionsByResponseHeadersPolicyId(responseHeadersPolicyId: string): Promise<ListDistributionsByResponseHeadersPolicyIdResult> {
  try {
    // TODO: implement list_distributions_by_response_headers_policy_id
    throw new Error("list_distributions_by_response_headers_policy_id not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_distributions_by_response_headers_policy_id failed");
  }
}

/** List distributions by vpc origin id. */
export async function listDistributionsByVpcOriginId(vpcOriginId: string): Promise<ListDistributionsByVpcOriginIdResult> {
  try {
    // TODO: implement list_distributions_by_vpc_origin_id
    throw new Error("list_distributions_by_vpc_origin_id not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_distributions_by_vpc_origin_id failed");
  }
}

/** List distributions by web acl id. */
export async function listDistributionsByWebAclId(webAclId: string): Promise<ListDistributionsByWebAclIdResult> {
  try {
    // TODO: implement list_distributions_by_web_acl_id
    throw new Error("list_distributions_by_web_acl_id not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_distributions_by_web_acl_id failed");
  }
}

/** List domain conflicts. */
export async function listDomainConflicts(domain: string, domainControlValidationResource: Record<string, unknown>): Promise<ListDomainConflictsResult> {
  try {
    // TODO: implement list_domain_conflicts
    throw new Error("list_domain_conflicts not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_domain_conflicts failed");
  }
}

/** List field level encryption configs. */
export async function listFieldLevelEncryptionConfigs(): Promise<ListFieldLevelEncryptionConfigsResult> {
  try {
    // TODO: implement list_field_level_encryption_configs
    throw new Error("list_field_level_encryption_configs not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_field_level_encryption_configs failed");
  }
}

/** List field level encryption profiles. */
export async function listFieldLevelEncryptionProfiles(): Promise<ListFieldLevelEncryptionProfilesResult> {
  try {
    // TODO: implement list_field_level_encryption_profiles
    throw new Error("list_field_level_encryption_profiles not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_field_level_encryption_profiles failed");
  }
}

/** List functions. */
export async function listFunctions(): Promise<ListFunctionsResult> {
  try {
    // TODO: implement list_functions
    throw new Error("list_functions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_functions failed");
  }
}

/** List invalidations for distribution tenant. */
export async function listInvalidationsForDistributionTenant(id: string): Promise<ListInvalidationsForDistributionTenantResult> {
  try {
    // TODO: implement list_invalidations_for_distribution_tenant
    throw new Error("list_invalidations_for_distribution_tenant not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_invalidations_for_distribution_tenant failed");
  }
}

/** List key groups. */
export async function listKeyGroups(): Promise<ListKeyGroupsResult> {
  try {
    // TODO: implement list_key_groups
    throw new Error("list_key_groups not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_key_groups failed");
  }
}

/** List key value stores. */
export async function listKeyValueStores(): Promise<ListKeyValueStoresResult> {
  try {
    // TODO: implement list_key_value_stores
    throw new Error("list_key_value_stores not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_key_value_stores failed");
  }
}

/** List origin request policies. */
export async function listOriginRequestPolicies(): Promise<ListOriginRequestPoliciesResult> {
  try {
    // TODO: implement list_origin_request_policies
    throw new Error("list_origin_request_policies not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_origin_request_policies failed");
  }
}

/** List public keys. */
export async function listPublicKeys(): Promise<ListPublicKeysResult> {
  try {
    // TODO: implement list_public_keys
    throw new Error("list_public_keys not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_public_keys failed");
  }
}

/** List realtime log configs. */
export async function listRealtimeLogConfigs(): Promise<ListRealtimeLogConfigsResult> {
  try {
    // TODO: implement list_realtime_log_configs
    throw new Error("list_realtime_log_configs not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_realtime_log_configs failed");
  }
}

/** List response headers policies. */
export async function listResponseHeadersPolicies(): Promise<ListResponseHeadersPoliciesResult> {
  try {
    // TODO: implement list_response_headers_policies
    throw new Error("list_response_headers_policies not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_response_headers_policies failed");
  }
}

/** List streaming distributions. */
export async function listStreamingDistributions(): Promise<ListStreamingDistributionsResult> {
  try {
    // TODO: implement list_streaming_distributions
    throw new Error("list_streaming_distributions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_streaming_distributions failed");
  }
}

/** List tags for resource. */
export async function listTagsForResource(resource: string, regionName?: string): Promise<ListTagsForResourceResult> {
  try {
    // TODO: implement list_tags_for_resource
    throw new Error("list_tags_for_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_tags_for_resource failed");
  }
}

/** List vpc origins. */
export async function listVpcOrigins(): Promise<ListVpcOriginsResult> {
  try {
    // TODO: implement list_vpc_origins
    throw new Error("list_vpc_origins not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_vpc_origins failed");
  }
}

/** Publish function. */
export async function publishFunction(name: string, ifMatch: string, regionName?: string): Promise<PublishFunctionResult> {
  try {
    // TODO: implement publish_function
    throw new Error("publish_function not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "publish_function failed");
  }
}

/** Put resource policy. */
export async function putResourcePolicy(resourceArn: string, policyDocument: string, regionName?: string): Promise<PutResourcePolicyResult> {
  try {
    // TODO: implement put_resource_policy
    throw new Error("put_resource_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_resource_policy failed");
  }
}

/** Run function. */
export async function runFunction(name: string, ifMatch: string, eventObject: Uint8Array): Promise<RunFunctionResult> {
  try {
    // TODO: implement run_function
    throw new Error("run_function not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "run_function failed");
  }
}

/** Tag resource. */
export async function tagResource(resource: string, tags: Record<string, unknown>, regionName?: string): Promise<void> {
  try {
    // TODO: implement tag_resource
    throw new Error("tag_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "tag_resource failed");
  }
}

/** Untag resource. */
export async function untagResource(resource: string, tagKeys: Record<string, unknown>, regionName?: string): Promise<void> {
  try {
    // TODO: implement untag_resource
    throw new Error("untag_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "untag_resource failed");
  }
}

/** Update anycast ip list. */
export async function updateAnycastIpList(id: string, ifMatch: string): Promise<UpdateAnycastIpListResult> {
  try {
    // TODO: implement update_anycast_ip_list
    throw new Error("update_anycast_ip_list not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_anycast_ip_list failed");
  }
}

/** Update cache policy. */
export async function updateCachePolicy(cachePolicyConfig: Record<string, unknown>, id: string): Promise<UpdateCachePolicyResult> {
  try {
    // TODO: implement update_cache_policy
    throw new Error("update_cache_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_cache_policy failed");
  }
}

/** Update cloud front origin access identity. */
export async function updateCloudFrontOriginAccessIdentity(cloudFrontOriginAccessIdentityConfig: Record<string, unknown>, id: string): Promise<UpdateCloudFrontOriginAccessIdentityResult> {
  try {
    // TODO: implement update_cloud_front_origin_access_identity
    throw new Error("update_cloud_front_origin_access_identity not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_cloud_front_origin_access_identity failed");
  }
}

/** Update connection group. */
export async function updateConnectionGroup(id: string, ifMatch: string): Promise<UpdateConnectionGroupResult> {
  try {
    // TODO: implement update_connection_group
    throw new Error("update_connection_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_connection_group failed");
  }
}

/** Update continuous deployment policy. */
export async function updateContinuousDeploymentPolicy(continuousDeploymentPolicyConfig: Record<string, unknown>, id: string): Promise<UpdateContinuousDeploymentPolicyResult> {
  try {
    // TODO: implement update_continuous_deployment_policy
    throw new Error("update_continuous_deployment_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_continuous_deployment_policy failed");
  }
}

/** Update distribution tenant. */
export async function updateDistributionTenant(id: string, ifMatch: string): Promise<UpdateDistributionTenantResult> {
  try {
    // TODO: implement update_distribution_tenant
    throw new Error("update_distribution_tenant not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_distribution_tenant failed");
  }
}

/** Update distribution with staging config. */
export async function updateDistributionWithStagingConfig(id: string): Promise<UpdateDistributionWithStagingConfigResult> {
  try {
    // TODO: implement update_distribution_with_staging_config
    throw new Error("update_distribution_with_staging_config not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_distribution_with_staging_config failed");
  }
}

/** Update domain association. */
export async function updateDomainAssociation(domain: string, targetResource: Record<string, unknown>): Promise<UpdateDomainAssociationResult> {
  try {
    // TODO: implement update_domain_association
    throw new Error("update_domain_association not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_domain_association failed");
  }
}

/** Update field level encryption config. */
export async function updateFieldLevelEncryptionConfig(fieldLevelEncryptionConfig: Record<string, unknown>, id: string): Promise<UpdateFieldLevelEncryptionConfigResult> {
  try {
    // TODO: implement update_field_level_encryption_config
    throw new Error("update_field_level_encryption_config not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_field_level_encryption_config failed");
  }
}

/** Update field level encryption profile. */
export async function updateFieldLevelEncryptionProfile(fieldLevelEncryptionProfileConfig: Record<string, unknown>, id: string): Promise<UpdateFieldLevelEncryptionProfileResult> {
  try {
    // TODO: implement update_field_level_encryption_profile
    throw new Error("update_field_level_encryption_profile not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_field_level_encryption_profile failed");
  }
}

/** Update function. */
export async function updateFunction(name: string, ifMatch: string, functionConfig: Record<string, unknown>, functionCode: Uint8Array, regionName?: string): Promise<UpdateFunctionResult> {
  try {
    // TODO: implement update_function
    throw new Error("update_function not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_function failed");
  }
}

/** Update key group. */
export async function updateKeyGroup(keyGroupConfig: Record<string, unknown>, id: string): Promise<UpdateKeyGroupResult> {
  try {
    // TODO: implement update_key_group
    throw new Error("update_key_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_key_group failed");
  }
}

/** Update key value store. */
export async function updateKeyValueStore(name: string, comment: string, ifMatch: string, regionName?: string): Promise<UpdateKeyValueStoreResult> {
  try {
    // TODO: implement update_key_value_store
    throw new Error("update_key_value_store not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_key_value_store failed");
  }
}

/** Update origin access control. */
export async function updateOriginAccessControl(originAccessControlConfig: Record<string, unknown>, id: string): Promise<UpdateOriginAccessControlResult> {
  try {
    // TODO: implement update_origin_access_control
    throw new Error("update_origin_access_control not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_origin_access_control failed");
  }
}

/** Update origin request policy. */
export async function updateOriginRequestPolicy(originRequestPolicyConfig: Record<string, unknown>, id: string): Promise<UpdateOriginRequestPolicyResult> {
  try {
    // TODO: implement update_origin_request_policy
    throw new Error("update_origin_request_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_origin_request_policy failed");
  }
}

/** Update public key. */
export async function updatePublicKey(publicKeyConfig: Record<string, unknown>, id: string): Promise<UpdatePublicKeyResult> {
  try {
    // TODO: implement update_public_key
    throw new Error("update_public_key not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_public_key failed");
  }
}

/** Update realtime log config. */
export async function updateRealtimeLogConfig(): Promise<UpdateRealtimeLogConfigResult> {
  try {
    // TODO: implement update_realtime_log_config
    throw new Error("update_realtime_log_config not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_realtime_log_config failed");
  }
}

/** Update response headers policy. */
export async function updateResponseHeadersPolicy(responseHeadersPolicyConfig: Record<string, unknown>, id: string): Promise<UpdateResponseHeadersPolicyResult> {
  try {
    // TODO: implement update_response_headers_policy
    throw new Error("update_response_headers_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_response_headers_policy failed");
  }
}

/** Update streaming distribution. */
export async function updateStreamingDistribution(streamingDistributionConfig: Record<string, unknown>, id: string): Promise<UpdateStreamingDistributionResult> {
  try {
    // TODO: implement update_streaming_distribution
    throw new Error("update_streaming_distribution not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_streaming_distribution failed");
  }
}

/** Update vpc origin. */
export async function updateVpcOrigin(vpcOriginEndpointConfig: Record<string, unknown>, id: string, ifMatch: string, regionName?: string): Promise<UpdateVpcOriginResult> {
  try {
    // TODO: implement update_vpc_origin
    throw new Error("update_vpc_origin not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_vpc_origin failed");
  }
}

/** Verify dns configuration. */
export async function verifyDnsConfiguration(identifier: string): Promise<VerifyDnsConfigurationResult> {
  try {
    // TODO: implement verify_dns_configuration
    throw new Error("verify_dns_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "verify_dns_configuration failed");
  }
}
