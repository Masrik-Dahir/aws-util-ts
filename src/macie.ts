import { MacieClient } from "@aws-sdk/client-macie2";
import { getClient } from "./client";
import { wrapAwsError } from "./exceptions";

/** Metadata for an Amazon Macie session. */
export type MacieSessionResult = {
  createdAt?: string;
  findingPublishingFrequency?: string;
  serviceRole?: string;
  status?: string;
  updatedAt?: string;
  extra?: Record<string, unknown>;
};

/** An Amazon Macie classification job. */
export type ClassificationJobResult = {
  jobId?: string;
  name?: string;
  jobType?: string;
  jobStatus?: string;
  createdAt?: string;
  bucketDefinitions?: Record<string, unknown>[];
  extra?: Record<string, unknown>;
};

/** An Amazon Macie finding. */
export type FindingResult = {
  findingId?: string;
  findingType?: string;
  severityScore?: number;
  title?: string;
  description?: string;
  accountId?: string;
  region?: string;
  extra?: Record<string, unknown>;
};

/** An Amazon Macie findings filter. */
export type FindingsFilterResult = {
  filterId?: string;
  name?: string;
  action?: string;
  arn?: string;
  extra?: Record<string, unknown>;
};

/** S3 bucket information from Macie. */
export type BucketInfo = {
  bucketName?: string;
  accountId?: string;
  classifiableObjectCount?: number;
  classifiableSizeInBytes?: number;
  extra?: Record<string, unknown>;
};

/** Aggregated S3 bucket statistics from Macie. */
export type BucketStatistics = {
  bucketsCount?: number;
  classifiableObjectCount?: number;
  classifiableSizeInBytes?: number;
  extra?: Record<string, unknown>;
};

/** Result of batch_get_custom_data_identifiers. */
export type BatchGetCustomDataIdentifiersResult = {
  customDataIdentifiers?: Record<string, unknown>[];
  notFoundIdentifierIds?: string[];
};

/** Result of batch_update_automated_discovery_accounts. */
export type BatchUpdateAutomatedDiscoveryAccountsResult = {
  errors?: Record<string, unknown>[];
};

/** Result of create_allow_list. */
export type CreateAllowListResult = {
  arn?: string;
  id?: string;
};

/** Result of create_custom_data_identifier. */
export type CreateCustomDataIdentifierResult = {
  customDataIdentifierId?: string;
};

/** Result of create_invitations. */
export type CreateInvitationsResult = {
  unprocessedAccounts?: Record<string, unknown>[];
};

/** Result of create_member. */
export type CreateMemberResult = {
  arn?: string;
};

/** Result of decline_invitations. */
export type DeclineInvitationsResult = {
  unprocessedAccounts?: Record<string, unknown>[];
};

/** Result of delete_invitations. */
export type DeleteInvitationsResult = {
  unprocessedAccounts?: Record<string, unknown>[];
};

/** Result of describe_organization_configuration. */
export type DescribeOrganizationConfigurationResult = {
  autoEnable?: boolean;
  maxAccountLimitReached?: boolean;
};

/** Result of get_administrator_account. */
export type GetAdministratorAccountResult = {
  administrator?: Record<string, unknown>;
};

/** Result of get_allow_list. */
export type GetAllowListResult = {
  arn?: string;
  createdAt?: string;
  criteria?: Record<string, unknown>;
  description?: string;
  id?: string;
  name?: string;
  status?: Record<string, unknown>;
  tags?: Record<string, unknown>;
  updatedAt?: string;
};

/** Result of get_automated_discovery_configuration. */
export type GetAutomatedDiscoveryConfigurationResult = {
  autoEnableOrganizationMembers?: string;
  classificationScopeId?: string;
  disabledAt?: string;
  firstEnabledAt?: string;
  lastUpdatedAt?: string;
  sensitivityInspectionTemplateId?: string;
  status?: string;
};

/** Result of get_classification_export_configuration. */
export type GetClassificationExportConfigurationResult = {
  configuration?: Record<string, unknown>;
};

/** Result of get_classification_scope. */
export type GetClassificationScopeResult = {
  id?: string;
  name?: string;
  s3?: Record<string, unknown>;
};

/** Result of get_custom_data_identifier. */
export type GetCustomDataIdentifierResult = {
  arn?: string;
  createdAt?: string;
  deleted?: boolean;
  description?: string;
  id?: string;
  ignoreWords?: string[];
  keywords?: string[];
  maximumMatchDistance?: number;
  name?: string;
  regex?: string;
  severityLevels?: Record<string, unknown>[];
  tags?: Record<string, unknown>;
};

/** Result of get_finding_statistics. */
export type GetFindingStatisticsResult = {
  countsByGroup?: Record<string, unknown>[];
};

/** Result of get_findings_publication_configuration. */
export type GetFindingsPublicationConfigurationResult = {
  securityHubConfiguration?: Record<string, unknown>;
};

/** Result of get_invitations_count. */
export type GetInvitationsCountResult = {
  invitationsCount?: number;
};

/** Result of get_master_account. */
export type GetMasterAccountResult = {
  master?: Record<string, unknown>;
};

/** Result of get_member. */
export type GetMemberResult = {
  accountId?: string;
  administratorAccountId?: string;
  arn?: string;
  email?: string;
  invitedAt?: string;
  masterAccountId?: string;
  relationshipStatus?: string;
  tags?: Record<string, unknown>;
  updatedAt?: string;
};

/** Result of get_resource_profile. */
export type GetResourceProfileResult = {
  profileUpdatedAt?: string;
  sensitivityScore?: number;
  sensitivityScoreOverridden?: boolean;
  statistics?: Record<string, unknown>;
};

/** Result of get_reveal_configuration. */
export type GetRevealConfigurationResult = {
  configuration?: Record<string, unknown>;
  retrievalConfiguration?: Record<string, unknown>;
};

/** Result of get_sensitive_data_occurrences. */
export type GetSensitiveDataOccurrencesResult = {
  error?: string;
  sensitiveDataOccurrences?: Record<string, unknown>;
  status?: string;
};

/** Result of get_sensitive_data_occurrences_availability. */
export type GetSensitiveDataOccurrencesAvailabilityResult = {
  code?: string;
  reasons?: string[];
};

/** Result of get_sensitivity_inspection_template. */
export type GetSensitivityInspectionTemplateResult = {
  description?: string;
  excludes?: Record<string, unknown>;
  includes?: Record<string, unknown>;
  name?: string;
  sensitivityInspectionTemplateId?: string;
};

/** Result of get_usage_statistics. */
export type GetUsageStatisticsResult = {
  nextToken?: string;
  records?: Record<string, unknown>[];
  timeRange?: string;
};

/** Result of get_usage_totals. */
export type GetUsageTotalsResult = {
  timeRange?: string;
  usageTotals?: Record<string, unknown>[];
};

/** Result of list_allow_lists. */
export type ListAllowListsResult = {
  allowLists?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_automated_discovery_accounts. */
export type ListAutomatedDiscoveryAccountsResult = {
  items?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_classification_scopes. */
export type ListClassificationScopesResult = {
  classificationScopes?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_custom_data_identifiers. */
export type ListCustomDataIdentifiersResult = {
  items?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_invitations. */
export type ListInvitationsResult = {
  invitations?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_managed_data_identifiers. */
export type ListManagedDataIdentifiersResult = {
  items?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_members. */
export type ListMembersResult = {
  members?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_organization_admin_accounts. */
export type ListOrganizationAdminAccountsResult = {
  adminAccounts?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_resource_profile_artifacts. */
export type ListResourceProfileArtifactsResult = {
  artifacts?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_resource_profile_detections. */
export type ListResourceProfileDetectionsResult = {
  detections?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_sensitivity_inspection_templates. */
export type ListSensitivityInspectionTemplatesResult = {
  nextToken?: string;
  sensitivityInspectionTemplates?: Record<string, unknown>[];
};

/** Result of list_tags_for_resource. */
export type ListTagsForResourceResult = {
  tags?: Record<string, unknown>;
};

/** Result of put_classification_export_configuration. */
export type PutClassificationExportConfigurationResult = {
  configuration?: Record<string, unknown>;
};

/** Result of run_custom_data_identifier. */
export type RunCustomDataIdentifierResult = {
  matchCount?: number;
};

/** Result of search_resources. */
export type SearchResourcesResult = {
  matchingResources?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of update_allow_list. */
export type UpdateAllowListResult = {
  arn?: string;
  id?: string;
};

/** Result of update_reveal_configuration. */
export type UpdateRevealConfigurationResult = {
  configuration?: Record<string, unknown>;
  retrievalConfiguration?: Record<string, unknown>;
};

/** Enable Amazon Macie in the account. */
export async function enableMacie(): Promise<void> {
  try {
    // TODO: implement enable_macie
    throw new Error("enable_macie not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "enable_macie failed");
  }
}

/** Disable Amazon Macie in the account. */
export async function disableMacie(): Promise<void> {
  try {
    // TODO: implement disable_macie
    throw new Error("disable_macie not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disable_macie failed");
  }
}

/** Get the current Macie session status. */
export async function getMacieSession(): Promise<MacieSessionResult> {
  try {
    // TODO: implement get_macie_session
    throw new Error("get_macie_session not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_macie_session failed");
  }
}

/** Update the Macie session configuration. */
export async function updateMacieSession(): Promise<void> {
  try {
    // TODO: implement update_macie_session
    throw new Error("update_macie_session not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_macie_session failed");
  }
}

/** Create a Macie classification job. */
export async function createClassificationJob(name: string, jobType: string): Promise<ClassificationJobResult> {
  try {
    // TODO: implement create_classification_job
    throw new Error("create_classification_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_classification_job failed");
  }
}

/** Describe a Macie classification job. */
export async function describeClassificationJob(jobId: string): Promise<ClassificationJobResult> {
  try {
    // TODO: implement describe_classification_job
    throw new Error("describe_classification_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_classification_job failed");
  }
}

/** List Macie classification jobs. */
export async function listClassificationJobs(): Promise<ClassificationJobResult[]> {
  try {
    // TODO: implement list_classification_jobs
    throw new Error("list_classification_jobs not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_classification_jobs failed");
  }
}

/** Update a Macie classification job status. */
export async function updateClassificationJob(jobId: string): Promise<void> {
  try {
    // TODO: implement update_classification_job
    throw new Error("update_classification_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_classification_job failed");
  }
}

/** Cancel a Macie classification job. */
export async function cancelClassificationJob(jobId: string): Promise<void> {
  try {
    // TODO: implement cancel_classification_job
    throw new Error("cancel_classification_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "cancel_classification_job failed");
  }
}

/** List Macie finding IDs. */
export async function listFindings(): Promise<string[]> {
  try {
    // TODO: implement list_findings
    throw new Error("list_findings not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_findings failed");
  }
}

/** Get details for specific Macie findings. */
export async function getFindings(findingIds: string[]): Promise<FindingResult[]> {
  try {
    // TODO: implement get_findings
    throw new Error("get_findings not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_findings failed");
  }
}

/** List Macie findings filters. */
export async function listFindingsFilters(): Promise<FindingsFilterResult[]> {
  try {
    // TODO: implement list_findings_filters
    throw new Error("list_findings_filters not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_findings_filters failed");
  }
}

/** Create a Macie findings filter. */
export async function createFindingsFilter(name: string, action: string): Promise<FindingsFilterResult> {
  try {
    // TODO: implement create_findings_filter
    throw new Error("create_findings_filter not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_findings_filter failed");
  }
}

/** Get a Macie findings filter. */
export async function getFindingsFilter(filterId: string): Promise<FindingsFilterResult> {
  try {
    // TODO: implement get_findings_filter
    throw new Error("get_findings_filter not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_findings_filter failed");
  }
}

/** Update a Macie findings filter. */
export async function updateFindingsFilter(filterId: string): Promise<FindingsFilterResult> {
  try {
    // TODO: implement update_findings_filter
    throw new Error("update_findings_filter not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_findings_filter failed");
  }
}

/** Delete a Macie findings filter. */
export async function deleteFindingsFilter(filterId: string): Promise<void> {
  try {
    // TODO: implement delete_findings_filter
    throw new Error("delete_findings_filter not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_findings_filter failed");
  }
}

/** Describe S3 buckets monitored by Macie. */
export async function describeBuckets(): Promise<BucketInfo[]> {
  try {
    // TODO: implement describe_buckets
    throw new Error("describe_buckets not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_buckets failed");
  }
}

/** Get aggregated S3 bucket statistics from Macie. */
export async function getBucketStatistics(): Promise<BucketStatistics> {
  try {
    // TODO: implement get_bucket_statistics
    throw new Error("get_bucket_statistics not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_bucket_statistics failed");
  }
}

/** Accept invitation. */
export async function acceptInvitation(invitationId: string): Promise<void> {
  try {
    // TODO: implement accept_invitation
    throw new Error("accept_invitation not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "accept_invitation failed");
  }
}

/** Batch get custom data identifiers. */
export async function batchGetCustomDataIdentifiers(): Promise<BatchGetCustomDataIdentifiersResult> {
  try {
    // TODO: implement batch_get_custom_data_identifiers
    throw new Error("batch_get_custom_data_identifiers not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_get_custom_data_identifiers failed");
  }
}

/** Batch update automated discovery accounts. */
export async function batchUpdateAutomatedDiscoveryAccounts(): Promise<BatchUpdateAutomatedDiscoveryAccountsResult> {
  try {
    // TODO: implement batch_update_automated_discovery_accounts
    throw new Error("batch_update_automated_discovery_accounts not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_update_automated_discovery_accounts failed");
  }
}

/** Create allow list. */
export async function createAllowList(clientToken: string, criteria: Record<string, unknown>, name: string): Promise<CreateAllowListResult> {
  try {
    // TODO: implement create_allow_list
    throw new Error("create_allow_list not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_allow_list failed");
  }
}

/** Create custom data identifier. */
export async function createCustomDataIdentifier(name: string, regex: string): Promise<CreateCustomDataIdentifierResult> {
  try {
    // TODO: implement create_custom_data_identifier
    throw new Error("create_custom_data_identifier not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_custom_data_identifier failed");
  }
}

/** Create invitations. */
export async function createInvitations(accountIds: string[]): Promise<CreateInvitationsResult> {
  try {
    // TODO: implement create_invitations
    throw new Error("create_invitations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_invitations failed");
  }
}

/** Create member. */
export async function createMember(account: Record<string, unknown>): Promise<CreateMemberResult> {
  try {
    // TODO: implement create_member
    throw new Error("create_member not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_member failed");
  }
}

/** Create sample findings. */
export async function createSampleFindings(): Promise<void> {
  try {
    // TODO: implement create_sample_findings
    throw new Error("create_sample_findings not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_sample_findings failed");
  }
}

/** Decline invitations. */
export async function declineInvitations(accountIds: string[], regionName?: string): Promise<DeclineInvitationsResult> {
  try {
    // TODO: implement decline_invitations
    throw new Error("decline_invitations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "decline_invitations failed");
  }
}

/** Delete allow list. */
export async function deleteAllowList(id: string): Promise<void> {
  try {
    // TODO: implement delete_allow_list
    throw new Error("delete_allow_list not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_allow_list failed");
  }
}

/** Delete custom data identifier. */
export async function deleteCustomDataIdentifier(id: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_custom_data_identifier
    throw new Error("delete_custom_data_identifier not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_custom_data_identifier failed");
  }
}

/** Delete invitations. */
export async function deleteInvitations(accountIds: string[], regionName?: string): Promise<DeleteInvitationsResult> {
  try {
    // TODO: implement delete_invitations
    throw new Error("delete_invitations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_invitations failed");
  }
}

/** Delete member. */
export async function deleteMember(id: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_member
    throw new Error("delete_member not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_member failed");
  }
}

/** Describe organization configuration. */
export async function describeOrganizationConfiguration(regionName?: string): Promise<DescribeOrganizationConfigurationResult> {
  try {
    // TODO: implement describe_organization_configuration
    throw new Error("describe_organization_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_organization_configuration failed");
  }
}

/** Disable organization admin account. */
export async function disableOrganizationAdminAccount(adminAccountId: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement disable_organization_admin_account
    throw new Error("disable_organization_admin_account not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disable_organization_admin_account failed");
  }
}

/** Disassociate from administrator account. */
export async function disassociateFromAdministratorAccount(regionName?: string): Promise<void> {
  try {
    // TODO: implement disassociate_from_administrator_account
    throw new Error("disassociate_from_administrator_account not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disassociate_from_administrator_account failed");
  }
}

/** Disassociate from master account. */
export async function disassociateFromMasterAccount(regionName?: string): Promise<void> {
  try {
    // TODO: implement disassociate_from_master_account
    throw new Error("disassociate_from_master_account not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disassociate_from_master_account failed");
  }
}

/** Disassociate member. */
export async function disassociateMember(id: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement disassociate_member
    throw new Error("disassociate_member not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disassociate_member failed");
  }
}

/** Enable organization admin account. */
export async function enableOrganizationAdminAccount(adminAccountId: string): Promise<void> {
  try {
    // TODO: implement enable_organization_admin_account
    throw new Error("enable_organization_admin_account not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "enable_organization_admin_account failed");
  }
}

/** Get administrator account. */
export async function getAdministratorAccount(regionName?: string): Promise<GetAdministratorAccountResult> {
  try {
    // TODO: implement get_administrator_account
    throw new Error("get_administrator_account not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_administrator_account failed");
  }
}

/** Get allow list. */
export async function getAllowList(id: string, regionName?: string): Promise<GetAllowListResult> {
  try {
    // TODO: implement get_allow_list
    throw new Error("get_allow_list not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_allow_list failed");
  }
}

/** Get automated discovery configuration. */
export async function getAutomatedDiscoveryConfiguration(regionName?: string): Promise<GetAutomatedDiscoveryConfigurationResult> {
  try {
    // TODO: implement get_automated_discovery_configuration
    throw new Error("get_automated_discovery_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_automated_discovery_configuration failed");
  }
}

/** Get classification export configuration. */
export async function getClassificationExportConfiguration(regionName?: string): Promise<GetClassificationExportConfigurationResult> {
  try {
    // TODO: implement get_classification_export_configuration
    throw new Error("get_classification_export_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_classification_export_configuration failed");
  }
}

/** Get classification scope. */
export async function getClassificationScope(id: string, regionName?: string): Promise<GetClassificationScopeResult> {
  try {
    // TODO: implement get_classification_scope
    throw new Error("get_classification_scope not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_classification_scope failed");
  }
}

/** Get custom data identifier. */
export async function getCustomDataIdentifier(id: string, regionName?: string): Promise<GetCustomDataIdentifierResult> {
  try {
    // TODO: implement get_custom_data_identifier
    throw new Error("get_custom_data_identifier not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_custom_data_identifier failed");
  }
}

/** Get finding statistics. */
export async function getFindingStatistics(groupBy: string): Promise<GetFindingStatisticsResult> {
  try {
    // TODO: implement get_finding_statistics
    throw new Error("get_finding_statistics not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_finding_statistics failed");
  }
}

/** Get findings publication configuration. */
export async function getFindingsPublicationConfiguration(regionName?: string): Promise<GetFindingsPublicationConfigurationResult> {
  try {
    // TODO: implement get_findings_publication_configuration
    throw new Error("get_findings_publication_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_findings_publication_configuration failed");
  }
}

/** Get invitations count. */
export async function getInvitationsCount(regionName?: string): Promise<GetInvitationsCountResult> {
  try {
    // TODO: implement get_invitations_count
    throw new Error("get_invitations_count not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_invitations_count failed");
  }
}

/** Get master account. */
export async function getMasterAccount(regionName?: string): Promise<GetMasterAccountResult> {
  try {
    // TODO: implement get_master_account
    throw new Error("get_master_account not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_master_account failed");
  }
}

/** Get member. */
export async function getMember(id: string, regionName?: string): Promise<GetMemberResult> {
  try {
    // TODO: implement get_member
    throw new Error("get_member not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_member failed");
  }
}

/** Get resource profile. */
export async function getResourceProfile(resourceArn: string, regionName?: string): Promise<GetResourceProfileResult> {
  try {
    // TODO: implement get_resource_profile
    throw new Error("get_resource_profile not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_resource_profile failed");
  }
}

/** Get reveal configuration. */
export async function getRevealConfiguration(regionName?: string): Promise<GetRevealConfigurationResult> {
  try {
    // TODO: implement get_reveal_configuration
    throw new Error("get_reveal_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_reveal_configuration failed");
  }
}

/** Get sensitive data occurrences. */
export async function getSensitiveDataOccurrences(findingId: string, regionName?: string): Promise<GetSensitiveDataOccurrencesResult> {
  try {
    // TODO: implement get_sensitive_data_occurrences
    throw new Error("get_sensitive_data_occurrences not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_sensitive_data_occurrences failed");
  }
}

/** Get sensitive data occurrences availability. */
export async function getSensitiveDataOccurrencesAvailability(findingId: string, regionName?: string): Promise<GetSensitiveDataOccurrencesAvailabilityResult> {
  try {
    // TODO: implement get_sensitive_data_occurrences_availability
    throw new Error("get_sensitive_data_occurrences_availability not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_sensitive_data_occurrences_availability failed");
  }
}

/** Get sensitivity inspection template. */
export async function getSensitivityInspectionTemplate(id: string, regionName?: string): Promise<GetSensitivityInspectionTemplateResult> {
  try {
    // TODO: implement get_sensitivity_inspection_template
    throw new Error("get_sensitivity_inspection_template not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_sensitivity_inspection_template failed");
  }
}

/** Get usage statistics. */
export async function getUsageStatistics(): Promise<GetUsageStatisticsResult> {
  try {
    // TODO: implement get_usage_statistics
    throw new Error("get_usage_statistics not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_usage_statistics failed");
  }
}

/** Get usage totals. */
export async function getUsageTotals(): Promise<GetUsageTotalsResult> {
  try {
    // TODO: implement get_usage_totals
    throw new Error("get_usage_totals not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_usage_totals failed");
  }
}

/** List allow lists. */
export async function listAllowLists(): Promise<ListAllowListsResult> {
  try {
    // TODO: implement list_allow_lists
    throw new Error("list_allow_lists not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_allow_lists failed");
  }
}

/** List automated discovery accounts. */
export async function listAutomatedDiscoveryAccounts(): Promise<ListAutomatedDiscoveryAccountsResult> {
  try {
    // TODO: implement list_automated_discovery_accounts
    throw new Error("list_automated_discovery_accounts not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_automated_discovery_accounts failed");
  }
}

/** List classification scopes. */
export async function listClassificationScopes(): Promise<ListClassificationScopesResult> {
  try {
    // TODO: implement list_classification_scopes
    throw new Error("list_classification_scopes not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_classification_scopes failed");
  }
}

/** List custom data identifiers. */
export async function listCustomDataIdentifiers(): Promise<ListCustomDataIdentifiersResult> {
  try {
    // TODO: implement list_custom_data_identifiers
    throw new Error("list_custom_data_identifiers not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_custom_data_identifiers failed");
  }
}

/** List invitations. */
export async function listInvitations(): Promise<ListInvitationsResult> {
  try {
    // TODO: implement list_invitations
    throw new Error("list_invitations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_invitations failed");
  }
}

/** List managed data identifiers. */
export async function listManagedDataIdentifiers(): Promise<ListManagedDataIdentifiersResult> {
  try {
    // TODO: implement list_managed_data_identifiers
    throw new Error("list_managed_data_identifiers not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_managed_data_identifiers failed");
  }
}

/** List members. */
export async function listMembers(): Promise<ListMembersResult> {
  try {
    // TODO: implement list_members
    throw new Error("list_members not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_members failed");
  }
}

/** List organization admin accounts. */
export async function listOrganizationAdminAccounts(): Promise<ListOrganizationAdminAccountsResult> {
  try {
    // TODO: implement list_organization_admin_accounts
    throw new Error("list_organization_admin_accounts not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_organization_admin_accounts failed");
  }
}

/** List resource profile artifacts. */
export async function listResourceProfileArtifacts(resourceArn: string): Promise<ListResourceProfileArtifactsResult> {
  try {
    // TODO: implement list_resource_profile_artifacts
    throw new Error("list_resource_profile_artifacts not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_resource_profile_artifacts failed");
  }
}

/** List resource profile detections. */
export async function listResourceProfileDetections(resourceArn: string): Promise<ListResourceProfileDetectionsResult> {
  try {
    // TODO: implement list_resource_profile_detections
    throw new Error("list_resource_profile_detections not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_resource_profile_detections failed");
  }
}

/** List sensitivity inspection templates. */
export async function listSensitivityInspectionTemplates(): Promise<ListSensitivityInspectionTemplatesResult> {
  try {
    // TODO: implement list_sensitivity_inspection_templates
    throw new Error("list_sensitivity_inspection_templates not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_sensitivity_inspection_templates failed");
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

/** Put classification export configuration. */
export async function putClassificationExportConfiguration(configuration: Record<string, unknown>, regionName?: string): Promise<PutClassificationExportConfigurationResult> {
  try {
    // TODO: implement put_classification_export_configuration
    throw new Error("put_classification_export_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_classification_export_configuration failed");
  }
}

/** Put findings publication configuration. */
export async function putFindingsPublicationConfiguration(): Promise<void> {
  try {
    // TODO: implement put_findings_publication_configuration
    throw new Error("put_findings_publication_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_findings_publication_configuration failed");
  }
}

/** Run custom data identifier. */
export async function runCustomDataIdentifier(regex: string, sampleText: string): Promise<RunCustomDataIdentifierResult> {
  try {
    // TODO: implement run_custom_data_identifier
    throw new Error("run_custom_data_identifier not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "run_custom_data_identifier failed");
  }
}

/** Search resources. */
export async function searchResources(): Promise<SearchResourcesResult> {
  try {
    // TODO: implement search_resources
    throw new Error("search_resources not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "search_resources failed");
  }
}

/** Tag resource. */
export async function tagResource(resourceArn: string, tags: Record<string, unknown>, regionName?: string): Promise<void> {
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

/** Update allow list. */
export async function updateAllowList(criteria: Record<string, unknown>, id: string, name: string): Promise<UpdateAllowListResult> {
  try {
    // TODO: implement update_allow_list
    throw new Error("update_allow_list not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_allow_list failed");
  }
}

/** Update automated discovery configuration. */
export async function updateAutomatedDiscoveryConfiguration(status: string): Promise<void> {
  try {
    // TODO: implement update_automated_discovery_configuration
    throw new Error("update_automated_discovery_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_automated_discovery_configuration failed");
  }
}

/** Update classification scope. */
export async function updateClassificationScope(id: string): Promise<void> {
  try {
    // TODO: implement update_classification_scope
    throw new Error("update_classification_scope not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_classification_scope failed");
  }
}

/** Update member session. */
export async function updateMemberSession(id: string, status: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement update_member_session
    throw new Error("update_member_session not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_member_session failed");
  }
}

/** Update organization configuration. */
export async function updateOrganizationConfiguration(autoEnable: boolean, regionName?: string): Promise<void> {
  try {
    // TODO: implement update_organization_configuration
    throw new Error("update_organization_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_organization_configuration failed");
  }
}

/** Update resource profile. */
export async function updateResourceProfile(resourceArn: string): Promise<void> {
  try {
    // TODO: implement update_resource_profile
    throw new Error("update_resource_profile not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_resource_profile failed");
  }
}

/** Update resource profile detections. */
export async function updateResourceProfileDetections(resourceArn: string): Promise<void> {
  try {
    // TODO: implement update_resource_profile_detections
    throw new Error("update_resource_profile_detections not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_resource_profile_detections failed");
  }
}

/** Update reveal configuration. */
export async function updateRevealConfiguration(configuration: Record<string, unknown>): Promise<UpdateRevealConfigurationResult> {
  try {
    // TODO: implement update_reveal_configuration
    throw new Error("update_reveal_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_reveal_configuration failed");
  }
}

/** Update sensitivity inspection template. */
export async function updateSensitivityInspectionTemplate(id: string): Promise<void> {
  try {
    // TODO: implement update_sensitivity_inspection_template
    throw new Error("update_sensitivity_inspection_template not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_sensitivity_inspection_template failed");
  }
}
