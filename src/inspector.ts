import { InspectorClient } from "@aws-sdk/client-inspector2";
import { getClient } from "./client";
import { wrapAwsError } from "./exceptions";

/** Inspector configuration for an account. */
export type ConfigurationResult = {
  ecrConfiguration?: Record<string, unknown>;
  ec2Configuration?: Record<string, unknown>;
  extra?: Record<string, unknown>;
};

/** Inspector account status. */
export type AccountStatusResult = {
  accountId?: string;
  state?: Record<string, unknown>;
  resourceState?: Record<string, unknown>;
  extra?: Record<string, unknown>;
};

/** An Amazon Inspector finding. */
export type FindingResult = {
  findingArn?: string;
  awsAccountId?: string;
  findingType?: string;
  severity?: string;
  status?: string;
  title?: string;
  description?: string;
  extra?: Record<string, unknown>;
};

/** Status of a findings report. */
export type ReportStatusResult = {
  reportId?: string;
  status?: string;
  errorCode?: string;
  errorMessage?: string;
  destination?: Record<string, unknown>;
  extra?: Record<string, unknown>;
};

/** Status of an SBOM export. */
export type SbomExportResult = {
  reportId?: string;
  status?: string;
  errorCode?: string;
  errorMessage?: string;
  s3Destination?: Record<string, unknown>;
  extra?: Record<string, unknown>;
};

/** Inspector coverage for a resource. */
export type CoverageResult = {
  resourceId?: string;
  resourceType?: string;
  accountId?: string;
  scanStatus?: Record<string, unknown>;
  extra?: Record<string, unknown>;
};

/** Inspector member account. */
export type MemberResult = {
  accountId?: string;
  relationshipStatus?: string;
  delegatedAdminAccountId?: string;
  updatedAt?: string;
  extra?: Record<string, unknown>;
};

/** Result of associate_member. */
export type AssociateMemberResult = {
  accountId?: string;
};

/** Result of batch_associate_code_security_scan_configuration. */
export type BatchAssociateCodeSecurityScanConfigurationResult = {
  failedAssociations?: Record<string, unknown>[];
  successfulAssociations?: Record<string, unknown>[];
};

/** Result of batch_disassociate_code_security_scan_configuration. */
export type BatchDisassociateCodeSecurityScanConfigurationResult = {
  failedAssociations?: Record<string, unknown>[];
  successfulAssociations?: Record<string, unknown>[];
};

/** Result of batch_get_code_snippet. */
export type BatchGetCodeSnippetResult = {
  codeSnippetResults?: Record<string, unknown>[];
  errors?: Record<string, unknown>[];
};

/** Result of batch_get_finding_details. */
export type BatchGetFindingDetailsResult = {
  findingDetails?: Record<string, unknown>[];
  errors?: Record<string, unknown>[];
};

/** Result of batch_get_free_trial_info. */
export type BatchGetFreeTrialInfoResult = {
  accounts?: Record<string, unknown>[];
  failedAccounts?: Record<string, unknown>[];
};

/** Result of batch_get_member_ec2_deep_inspection_status. */
export type BatchGetMemberEc2DeepInspectionStatusResult = {
  accountIds?: Record<string, unknown>[];
  failedAccountIds?: Record<string, unknown>[];
};

/** Result of batch_update_member_ec2_deep_inspection_status. */
export type BatchUpdateMemberEc2DeepInspectionStatusResult = {
  accountIds?: Record<string, unknown>[];
  failedAccountIds?: Record<string, unknown>[];
};

/** Result of cancel_findings_report. */
export type CancelFindingsReportResult = {
  reportId?: string;
};

/** Result of cancel_sbom_export. */
export type CancelSbomExportResult = {
  reportId?: string;
};

/** Result of create_cis_scan_configuration. */
export type CreateCisScanConfigurationResult = {
  scanConfigurationArn?: string;
};

/** Result of create_code_security_integration. */
export type CreateCodeSecurityIntegrationResult = {
  integrationArn?: string;
  status?: string;
  authorizationUrl?: string;
};

/** Result of create_code_security_scan_configuration. */
export type CreateCodeSecurityScanConfigurationResult = {
  scanConfigurationArn?: string;
};

/** Result of create_filter. */
export type CreateFilterResult = {
  arn?: string;
};

/** Result of delete_cis_scan_configuration. */
export type DeleteCisScanConfigurationResult = {
  scanConfigurationArn?: string;
};

/** Result of delete_code_security_integration. */
export type DeleteCodeSecurityIntegrationResult = {
  integrationArn?: string;
};

/** Result of delete_code_security_scan_configuration. */
export type DeleteCodeSecurityScanConfigurationResult = {
  scanConfigurationArn?: string;
};

/** Result of delete_filter. */
export type DeleteFilterResult = {
  arn?: string;
};

/** Result of describe_organization_configuration. */
export type DescribeOrganizationConfigurationResult = {
  autoEnable?: Record<string, unknown>;
  maxAccountLimitReached?: boolean;
};

/** Result of disable_delegated_admin_account. */
export type DisableDelegatedAdminAccountResult = {
  delegatedAdminAccountId?: string;
};

/** Result of disassociate_member. */
export type DisassociateMemberResult = {
  accountId?: string;
};

/** Result of enable_delegated_admin_account. */
export type EnableDelegatedAdminAccountResult = {
  delegatedAdminAccountId?: string;
};

/** Result of get_cis_scan_report. */
export type GetCisScanReportResult = {
  url?: string;
  status?: string;
};

/** Result of get_cis_scan_result_details. */
export type GetCisScanResultDetailsResult = {
  scanResultDetails?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of get_clusters_for_image. */
export type GetClustersForImageResult = {
  cluster?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of get_code_security_integration. */
export type GetCodeSecurityIntegrationResult = {
  integrationArn?: string;
  name?: string;
  typeValue?: string;
  status?: string;
  statusReason?: string;
  createdOn?: string;
  lastUpdateOn?: string;
  tags?: Record<string, unknown>;
  authorizationUrl?: string;
};

/** Result of get_code_security_scan. */
export type GetCodeSecurityScanResult = {
  scanId?: string;
  resource?: Record<string, unknown>;
  accountId?: string;
  status?: string;
  statusReason?: string;
  createdAt?: string;
  updatedAt?: string;
  lastCommitId?: string;
};

/** Result of get_code_security_scan_configuration. */
export type GetCodeSecurityScanConfigurationResult = {
  scanConfigurationArn?: string;
  name?: string;
  configuration?: Record<string, unknown>;
  level?: string;
  scopeSettings?: Record<string, unknown>;
  createdAt?: string;
  lastUpdatedAt?: string;
  tags?: Record<string, unknown>;
};

/** Result of get_delegated_admin_account. */
export type GetDelegatedAdminAccountResult = {
  delegatedAdmin?: Record<string, unknown>;
};

/** Result of get_ec2_deep_inspection_configuration. */
export type GetEc2DeepInspectionConfigurationResult = {
  packagePaths?: string[];
  orgPackagePaths?: string[];
  status?: string;
  errorMessage?: string;
};

/** Result of get_encryption_key. */
export type GetEncryptionKeyResult = {
  kmsKeyId?: string;
};

/** Result of list_account_permissions. */
export type ListAccountPermissionsResult = {
  permissions?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_cis_scan_configurations. */
export type ListCisScanConfigurationsResult = {
  scanConfigurations?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_cis_scan_results_aggregated_by_checks. */
export type ListCisScanResultsAggregatedByChecksResult = {
  checkAggregations?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_cis_scan_results_aggregated_by_target_resource. */
export type ListCisScanResultsAggregatedByTargetResourceResult = {
  targetResourceAggregations?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_cis_scans. */
export type ListCisScansResult = {
  scans?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_code_security_integrations. */
export type ListCodeSecurityIntegrationsResult = {
  integrations?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_code_security_scan_configuration_associations. */
export type ListCodeSecurityScanConfigurationAssociationsResult = {
  associations?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_code_security_scan_configurations. */
export type ListCodeSecurityScanConfigurationsResult = {
  configurations?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_coverage_statistics. */
export type ListCoverageStatisticsResult = {
  countsByGroup?: Record<string, unknown>[];
  totalCounts?: number;
  nextToken?: string;
};

/** Result of list_delegated_admin_accounts. */
export type ListDelegatedAdminAccountsResult = {
  delegatedAdminAccounts?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_filters. */
export type ListFiltersResult = {
  filters?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_tags_for_resource. */
export type ListTagsForResourceResult = {
  tags?: Record<string, unknown>;
};

/** Result of list_usage_totals. */
export type ListUsageTotalsResult = {
  nextToken?: string;
  totals?: Record<string, unknown>[];
};

/** Result of search_vulnerabilities. */
export type SearchVulnerabilitiesResult = {
  vulnerabilities?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of start_code_security_scan. */
export type StartCodeSecurityScanResult = {
  scanId?: string;
  status?: string;
};

/** Result of update_cis_scan_configuration. */
export type UpdateCisScanConfigurationResult = {
  scanConfigurationArn?: string;
};

/** Result of update_code_security_integration. */
export type UpdateCodeSecurityIntegrationResult = {
  integrationArn?: string;
  status?: string;
};

/** Result of update_code_security_scan_configuration. */
export type UpdateCodeSecurityScanConfigurationResult = {
  scanConfigurationArn?: string;
};

/** Result of update_ec2_deep_inspection_configuration. */
export type UpdateEc2DeepInspectionConfigurationResult = {
  packagePaths?: string[];
  orgPackagePaths?: string[];
  status?: string;
  errorMessage?: string;
};

/** Result of update_filter. */
export type UpdateFilterResult = {
  arn?: string;
};

/** Result of update_organization_configuration. */
export type UpdateOrganizationConfigurationResult = {
  autoEnable?: Record<string, unknown>;
};

/** Enable Amazon Inspector for the specified resource types. */
export async function enable(resourceTypes: string[]): Promise<Record<string, unknown>> {
  try {
    // TODO: implement enable
    throw new Error("enable not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "enable failed");
  }
}

/** Disable Amazon Inspector for the specified resource types. */
export async function disable(resourceTypes: string[]): Promise<Record<string, unknown>> {
  try {
    // TODO: implement disable
    throw new Error("disable not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disable failed");
  }
}

/** Get the current Inspector configuration. */
export async function getConfiguration(): Promise<ConfigurationResult> {
  try {
    // TODO: implement get_configuration
    throw new Error("get_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_configuration failed");
  }
}

/** Update the Inspector configuration. */
export async function updateConfiguration(): Promise<void> {
  try {
    // TODO: implement update_configuration
    throw new Error("update_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_configuration failed");
  }
}

/** Get Inspector status for multiple accounts. */
export async function batchGetAccountStatus(accountIds: string[]): Promise<AccountStatusResult[]> {
  try {
    // TODO: implement batch_get_account_status
    throw new Error("batch_get_account_status not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_get_account_status failed");
  }
}

/** List Inspector findings. */
export async function listFindings(): Promise<FindingResult[]> {
  try {
    // TODO: implement list_findings
    throw new Error("list_findings not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_findings failed");
  }
}

/** List finding aggregations. */
export async function listFindingAggregations(aggregationType: string): Promise<Record<string, unknown>[]> {
  try {
    // TODO: implement list_finding_aggregations
    throw new Error("list_finding_aggregations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_finding_aggregations failed");
  }
}

/** Get the status of a findings report. */
export async function getFindingsReportStatus(reportId: string): Promise<ReportStatusResult> {
  try {
    // TODO: implement get_findings_report_status
    throw new Error("get_findings_report_status not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_findings_report_status failed");
  }
}

/** Create a findings report. */
export async function createFindingsReport(): Promise<string> {
  try {
    // TODO: implement create_findings_report
    throw new Error("create_findings_report not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_findings_report failed");
  }
}

/** Get the status of an SBOM export. */
export async function getSbomExport(reportId: string): Promise<SbomExportResult> {
  try {
    // TODO: implement get_sbom_export
    throw new Error("get_sbom_export not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_sbom_export failed");
  }
}

/** Create an SBOM export. */
export async function createSbomExport(): Promise<string> {
  try {
    // TODO: implement create_sbom_export
    throw new Error("create_sbom_export not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_sbom_export failed");
  }
}

/** List Inspector coverage for resources. */
export async function listCoverage(): Promise<CoverageResult[]> {
  try {
    // TODO: implement list_coverage
    throw new Error("list_coverage not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_coverage failed");
  }
}

/** List Inspector member accounts. */
export async function listMembers(): Promise<MemberResult[]> {
  try {
    // TODO: implement list_members
    throw new Error("list_members not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_members failed");
  }
}

/** Get details for a specific member account. */
export async function getMember(accountId: string): Promise<MemberResult> {
  try {
    // TODO: implement get_member
    throw new Error("get_member not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_member failed");
  }
}

/** Associate member. */
export async function associateMember(accountId: string, regionName?: string): Promise<AssociateMemberResult> {
  try {
    // TODO: implement associate_member
    throw new Error("associate_member not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "associate_member failed");
  }
}

/** Batch associate code security scan configuration. */
export async function batchAssociateCodeSecurityScanConfiguration(associateConfigurationRequests: Record<string, unknown>[], regionName?: string): Promise<BatchAssociateCodeSecurityScanConfigurationResult> {
  try {
    // TODO: implement batch_associate_code_security_scan_configuration
    throw new Error("batch_associate_code_security_scan_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_associate_code_security_scan_configuration failed");
  }
}

/** Batch disassociate code security scan configuration. */
export async function batchDisassociateCodeSecurityScanConfiguration(disassociateConfigurationRequests: Record<string, unknown>[], regionName?: string): Promise<BatchDisassociateCodeSecurityScanConfigurationResult> {
  try {
    // TODO: implement batch_disassociate_code_security_scan_configuration
    throw new Error("batch_disassociate_code_security_scan_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_disassociate_code_security_scan_configuration failed");
  }
}

/** Batch get code snippet. */
export async function batchGetCodeSnippet(findingArns: string[], regionName?: string): Promise<BatchGetCodeSnippetResult> {
  try {
    // TODO: implement batch_get_code_snippet
    throw new Error("batch_get_code_snippet not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_get_code_snippet failed");
  }
}

/** Batch get finding details. */
export async function batchGetFindingDetails(findingArns: string[], regionName?: string): Promise<BatchGetFindingDetailsResult> {
  try {
    // TODO: implement batch_get_finding_details
    throw new Error("batch_get_finding_details not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_get_finding_details failed");
  }
}

/** Batch get free trial info. */
export async function batchGetFreeTrialInfo(accountIds: string[], regionName?: string): Promise<BatchGetFreeTrialInfoResult> {
  try {
    // TODO: implement batch_get_free_trial_info
    throw new Error("batch_get_free_trial_info not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_get_free_trial_info failed");
  }
}

/** Batch get member ec2 deep inspection status. */
export async function batchGetMemberEc2DeepInspectionStatus(): Promise<BatchGetMemberEc2DeepInspectionStatusResult> {
  try {
    // TODO: implement batch_get_member_ec2_deep_inspection_status
    throw new Error("batch_get_member_ec2_deep_inspection_status not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_get_member_ec2_deep_inspection_status failed");
  }
}

/** Batch update member ec2 deep inspection status. */
export async function batchUpdateMemberEc2DeepInspectionStatus(accountIds: Record<string, unknown>[], regionName?: string): Promise<BatchUpdateMemberEc2DeepInspectionStatusResult> {
  try {
    // TODO: implement batch_update_member_ec2_deep_inspection_status
    throw new Error("batch_update_member_ec2_deep_inspection_status not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_update_member_ec2_deep_inspection_status failed");
  }
}

/** Cancel findings report. */
export async function cancelFindingsReport(reportId: string, regionName?: string): Promise<CancelFindingsReportResult> {
  try {
    // TODO: implement cancel_findings_report
    throw new Error("cancel_findings_report not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "cancel_findings_report failed");
  }
}

/** Cancel sbom export. */
export async function cancelSbomExport(reportId: string, regionName?: string): Promise<CancelSbomExportResult> {
  try {
    // TODO: implement cancel_sbom_export
    throw new Error("cancel_sbom_export not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "cancel_sbom_export failed");
  }
}

/** Create cis scan configuration. */
export async function createCisScanConfiguration(scanName: string, securityLevel: string, schedule: Record<string, unknown>, targets: Record<string, unknown>): Promise<CreateCisScanConfigurationResult> {
  try {
    // TODO: implement create_cis_scan_configuration
    throw new Error("create_cis_scan_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_cis_scan_configuration failed");
  }
}

/** Create code security integration. */
export async function createCodeSecurityIntegration(name: string, typeValue: string): Promise<CreateCodeSecurityIntegrationResult> {
  try {
    // TODO: implement create_code_security_integration
    throw new Error("create_code_security_integration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_code_security_integration failed");
  }
}

/** Create code security scan configuration. */
export async function createCodeSecurityScanConfiguration(name: string, level: string, configuration: Record<string, unknown>): Promise<CreateCodeSecurityScanConfigurationResult> {
  try {
    // TODO: implement create_code_security_scan_configuration
    throw new Error("create_code_security_scan_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_code_security_scan_configuration failed");
  }
}

/** Create filter. */
export async function createFilter(action: string, filterCriteria: Record<string, unknown>, name: string): Promise<CreateFilterResult> {
  try {
    // TODO: implement create_filter
    throw new Error("create_filter not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_filter failed");
  }
}

/** Delete cis scan configuration. */
export async function deleteCisScanConfiguration(scanConfigurationArn: string, regionName?: string): Promise<DeleteCisScanConfigurationResult> {
  try {
    // TODO: implement delete_cis_scan_configuration
    throw new Error("delete_cis_scan_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_cis_scan_configuration failed");
  }
}

/** Delete code security integration. */
export async function deleteCodeSecurityIntegration(integrationArn: string, regionName?: string): Promise<DeleteCodeSecurityIntegrationResult> {
  try {
    // TODO: implement delete_code_security_integration
    throw new Error("delete_code_security_integration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_code_security_integration failed");
  }
}

/** Delete code security scan configuration. */
export async function deleteCodeSecurityScanConfiguration(scanConfigurationArn: string, regionName?: string): Promise<DeleteCodeSecurityScanConfigurationResult> {
  try {
    // TODO: implement delete_code_security_scan_configuration
    throw new Error("delete_code_security_scan_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_code_security_scan_configuration failed");
  }
}

/** Delete filter. */
export async function deleteFilter(arn: string, regionName?: string): Promise<DeleteFilterResult> {
  try {
    // TODO: implement delete_filter
    throw new Error("delete_filter not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_filter failed");
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

/** Disable delegated admin account. */
export async function disableDelegatedAdminAccount(delegatedAdminAccountId: string, regionName?: string): Promise<DisableDelegatedAdminAccountResult> {
  try {
    // TODO: implement disable_delegated_admin_account
    throw new Error("disable_delegated_admin_account not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disable_delegated_admin_account failed");
  }
}

/** Disassociate member. */
export async function disassociateMember(accountId: string, regionName?: string): Promise<DisassociateMemberResult> {
  try {
    // TODO: implement disassociate_member
    throw new Error("disassociate_member not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disassociate_member failed");
  }
}

/** Enable delegated admin account. */
export async function enableDelegatedAdminAccount(delegatedAdminAccountId: string): Promise<EnableDelegatedAdminAccountResult> {
  try {
    // TODO: implement enable_delegated_admin_account
    throw new Error("enable_delegated_admin_account not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "enable_delegated_admin_account failed");
  }
}

/** Get cis scan report. */
export async function getCisScanReport(scanArn: string): Promise<GetCisScanReportResult> {
  try {
    // TODO: implement get_cis_scan_report
    throw new Error("get_cis_scan_report not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_cis_scan_report failed");
  }
}

/** Get cis scan result details. */
export async function getCisScanResultDetails(scanArn: string, targetResourceId: string, accountId: string): Promise<GetCisScanResultDetailsResult> {
  try {
    // TODO: implement get_cis_scan_result_details
    throw new Error("get_cis_scan_result_details not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_cis_scan_result_details failed");
  }
}

/** Get clusters for image. */
export async function getClustersForImage(filter: Record<string, unknown>): Promise<GetClustersForImageResult> {
  try {
    // TODO: implement get_clusters_for_image
    throw new Error("get_clusters_for_image not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_clusters_for_image failed");
  }
}

/** Get code security integration. */
export async function getCodeSecurityIntegration(integrationArn: string): Promise<GetCodeSecurityIntegrationResult> {
  try {
    // TODO: implement get_code_security_integration
    throw new Error("get_code_security_integration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_code_security_integration failed");
  }
}

/** Get code security scan. */
export async function getCodeSecurityScan(resource: Record<string, unknown>, scanId: string, regionName?: string): Promise<GetCodeSecurityScanResult> {
  try {
    // TODO: implement get_code_security_scan
    throw new Error("get_code_security_scan not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_code_security_scan failed");
  }
}

/** Get code security scan configuration. */
export async function getCodeSecurityScanConfiguration(scanConfigurationArn: string, regionName?: string): Promise<GetCodeSecurityScanConfigurationResult> {
  try {
    // TODO: implement get_code_security_scan_configuration
    throw new Error("get_code_security_scan_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_code_security_scan_configuration failed");
  }
}

/** Get delegated admin account. */
export async function getDelegatedAdminAccount(regionName?: string): Promise<GetDelegatedAdminAccountResult> {
  try {
    // TODO: implement get_delegated_admin_account
    throw new Error("get_delegated_admin_account not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_delegated_admin_account failed");
  }
}

/** Get ec2 deep inspection configuration. */
export async function getEc2DeepInspectionConfiguration(regionName?: string): Promise<GetEc2DeepInspectionConfigurationResult> {
  try {
    // TODO: implement get_ec2_deep_inspection_configuration
    throw new Error("get_ec2_deep_inspection_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_ec2_deep_inspection_configuration failed");
  }
}

/** Get encryption key. */
export async function getEncryptionKey(scanType: string, resourceType: string, regionName?: string): Promise<GetEncryptionKeyResult> {
  try {
    // TODO: implement get_encryption_key
    throw new Error("get_encryption_key not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_encryption_key failed");
  }
}

/** List account permissions. */
export async function listAccountPermissions(): Promise<ListAccountPermissionsResult> {
  try {
    // TODO: implement list_account_permissions
    throw new Error("list_account_permissions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_account_permissions failed");
  }
}

/** List cis scan configurations. */
export async function listCisScanConfigurations(): Promise<ListCisScanConfigurationsResult> {
  try {
    // TODO: implement list_cis_scan_configurations
    throw new Error("list_cis_scan_configurations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_cis_scan_configurations failed");
  }
}

/** List cis scan results aggregated by checks. */
export async function listCisScanResultsAggregatedByChecks(scanArn: string): Promise<ListCisScanResultsAggregatedByChecksResult> {
  try {
    // TODO: implement list_cis_scan_results_aggregated_by_checks
    throw new Error("list_cis_scan_results_aggregated_by_checks not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_cis_scan_results_aggregated_by_checks failed");
  }
}

/** List cis scan results aggregated by target resource. */
export async function listCisScanResultsAggregatedByTargetResource(scanArn: string): Promise<ListCisScanResultsAggregatedByTargetResourceResult> {
  try {
    // TODO: implement list_cis_scan_results_aggregated_by_target_resource
    throw new Error("list_cis_scan_results_aggregated_by_target_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_cis_scan_results_aggregated_by_target_resource failed");
  }
}

/** List cis scans. */
export async function listCisScans(): Promise<ListCisScansResult> {
  try {
    // TODO: implement list_cis_scans
    throw new Error("list_cis_scans not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_cis_scans failed");
  }
}

/** List code security integrations. */
export async function listCodeSecurityIntegrations(): Promise<ListCodeSecurityIntegrationsResult> {
  try {
    // TODO: implement list_code_security_integrations
    throw new Error("list_code_security_integrations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_code_security_integrations failed");
  }
}

/** List code security scan configuration associations. */
export async function listCodeSecurityScanConfigurationAssociations(scanConfigurationArn: string): Promise<ListCodeSecurityScanConfigurationAssociationsResult> {
  try {
    // TODO: implement list_code_security_scan_configuration_associations
    throw new Error("list_code_security_scan_configuration_associations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_code_security_scan_configuration_associations failed");
  }
}

/** List code security scan configurations. */
export async function listCodeSecurityScanConfigurations(): Promise<ListCodeSecurityScanConfigurationsResult> {
  try {
    // TODO: implement list_code_security_scan_configurations
    throw new Error("list_code_security_scan_configurations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_code_security_scan_configurations failed");
  }
}

/** List coverage statistics. */
export async function listCoverageStatistics(): Promise<ListCoverageStatisticsResult> {
  try {
    // TODO: implement list_coverage_statistics
    throw new Error("list_coverage_statistics not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_coverage_statistics failed");
  }
}

/** List delegated admin accounts. */
export async function listDelegatedAdminAccounts(): Promise<ListDelegatedAdminAccountsResult> {
  try {
    // TODO: implement list_delegated_admin_accounts
    throw new Error("list_delegated_admin_accounts not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_delegated_admin_accounts failed");
  }
}

/** List filters. */
export async function listFilters(): Promise<ListFiltersResult> {
  try {
    // TODO: implement list_filters
    throw new Error("list_filters not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_filters failed");
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

/** List usage totals. */
export async function listUsageTotals(): Promise<ListUsageTotalsResult> {
  try {
    // TODO: implement list_usage_totals
    throw new Error("list_usage_totals not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_usage_totals failed");
  }
}

/** Reset encryption key. */
export async function resetEncryptionKey(scanType: string, resourceType: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement reset_encryption_key
    throw new Error("reset_encryption_key not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "reset_encryption_key failed");
  }
}

/** Search vulnerabilities. */
export async function searchVulnerabilities(filterCriteria: Record<string, unknown>): Promise<SearchVulnerabilitiesResult> {
  try {
    // TODO: implement search_vulnerabilities
    throw new Error("search_vulnerabilities not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "search_vulnerabilities failed");
  }
}

/** Send cis session health. */
export async function sendCisSessionHealth(scanJobId: string, sessionToken: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement send_cis_session_health
    throw new Error("send_cis_session_health not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "send_cis_session_health failed");
  }
}

/** Send cis session telemetry. */
export async function sendCisSessionTelemetry(scanJobId: string, sessionToken: string, messages: Record<string, unknown>[], regionName?: string): Promise<void> {
  try {
    // TODO: implement send_cis_session_telemetry
    throw new Error("send_cis_session_telemetry not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "send_cis_session_telemetry failed");
  }
}

/** Start cis session. */
export async function startCisSession(scanJobId: string, message: Record<string, unknown>, regionName?: string): Promise<void> {
  try {
    // TODO: implement start_cis_session
    throw new Error("start_cis_session not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_cis_session failed");
  }
}

/** Start code security scan. */
export async function startCodeSecurityScan(resource: Record<string, unknown>): Promise<StartCodeSecurityScanResult> {
  try {
    // TODO: implement start_code_security_scan
    throw new Error("start_code_security_scan not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_code_security_scan failed");
  }
}

/** Stop cis session. */
export async function stopCisSession(scanJobId: string, sessionToken: string, message: Record<string, unknown>, regionName?: string): Promise<void> {
  try {
    // TODO: implement stop_cis_session
    throw new Error("stop_cis_session not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "stop_cis_session failed");
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

/** Update cis scan configuration. */
export async function updateCisScanConfiguration(scanConfigurationArn: string): Promise<UpdateCisScanConfigurationResult> {
  try {
    // TODO: implement update_cis_scan_configuration
    throw new Error("update_cis_scan_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_cis_scan_configuration failed");
  }
}

/** Update code security integration. */
export async function updateCodeSecurityIntegration(integrationArn: string, details: Record<string, unknown>, regionName?: string): Promise<UpdateCodeSecurityIntegrationResult> {
  try {
    // TODO: implement update_code_security_integration
    throw new Error("update_code_security_integration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_code_security_integration failed");
  }
}

/** Update code security scan configuration. */
export async function updateCodeSecurityScanConfiguration(scanConfigurationArn: string, configuration: Record<string, unknown>, regionName?: string): Promise<UpdateCodeSecurityScanConfigurationResult> {
  try {
    // TODO: implement update_code_security_scan_configuration
    throw new Error("update_code_security_scan_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_code_security_scan_configuration failed");
  }
}

/** Update ec2 deep inspection configuration. */
export async function updateEc2DeepInspectionConfiguration(): Promise<UpdateEc2DeepInspectionConfigurationResult> {
  try {
    // TODO: implement update_ec2_deep_inspection_configuration
    throw new Error("update_ec2_deep_inspection_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_ec2_deep_inspection_configuration failed");
  }
}

/** Update encryption key. */
export async function updateEncryptionKey(kmsKeyId: string, scanType: string, resourceType: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement update_encryption_key
    throw new Error("update_encryption_key not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_encryption_key failed");
  }
}

/** Update filter. */
export async function updateFilter(filterArn: string): Promise<UpdateFilterResult> {
  try {
    // TODO: implement update_filter
    throw new Error("update_filter not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_filter failed");
  }
}

/** Update org ec2 deep inspection configuration. */
export async function updateOrgEc2DeepInspectionConfiguration(orgPackagePaths: string[], regionName?: string): Promise<void> {
  try {
    // TODO: implement update_org_ec2_deep_inspection_configuration
    throw new Error("update_org_ec2_deep_inspection_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_org_ec2_deep_inspection_configuration failed");
  }
}

/** Update organization configuration. */
export async function updateOrganizationConfiguration(autoEnable: Record<string, unknown>, regionName?: string): Promise<UpdateOrganizationConfigurationResult> {
  try {
    // TODO: implement update_organization_configuration
    throw new Error("update_organization_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_organization_configuration failed");
  }
}
