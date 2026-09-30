import { QuicksightClient } from "@aws-sdk/client-quicksight";
import { getClient } from "./client";
import { wrapAwsError } from "./exceptions";

/** Metadata for a QuickSight dashboard. */
export type DashboardResult = {
  dashboardId: string;
  name: string;
  arn?: string;
  status?: number;
  requestId?: string;
};

/** Metadata for a QuickSight dataset. */
export type DataSetResult = {
  datasetId: string;
  name: string;
  arn?: string;
  status?: number;
  requestId?: string;
};

/** Metadata for a QuickSight analysis. */
export type AnalysisResult = {
  analysisId: string;
  name: string;
  arn?: string;
  status?: number;
  requestId?: string;
};

/** Metadata for a QuickSight data source. */
export type DataSourceResult = {
  dataSourceId: string;
  name: string;
  arn?: string;
  status?: number;
  requestId?: string;
};

/** Metadata for a QuickSight user. */
export type QuickSightUser = {
  userName?: string;
  email?: string;
  role?: string;
  arn?: string;
  identityType?: string;
  active?: boolean;
  principalId?: string;
};

/** Result of batch_create_topic_reviewed_answer. */
export type BatchCreateTopicReviewedAnswerResult = {
  topicId?: string;
  topicArn?: string;
  succeededAnswers?: Record<string, unknown>[];
  invalidAnswers?: Record<string, unknown>[];
  status?: number;
  requestId?: string;
};

/** Result of batch_delete_topic_reviewed_answer. */
export type BatchDeleteTopicReviewedAnswerResult = {
  topicId?: string;
  topicArn?: string;
  succeededAnswers?: Record<string, unknown>[];
  invalidAnswers?: Record<string, unknown>[];
  requestId?: string;
  status?: number;
};

/** Result of cancel_ingestion. */
export type CancelIngestionResult = {
  arn?: string;
  ingestionId?: string;
  requestId?: string;
  status?: number;
};

/** Result of create_account_customization. */
export type CreateAccountCustomizationResult = {
  arn?: string;
  awsAccountId?: string;
  namespace?: string;
  accountCustomization?: Record<string, unknown>;
  requestId?: string;
  status?: number;
};

/** Result of create_account_subscription. */
export type CreateAccountSubscriptionResult = {
  signupResponse?: Record<string, unknown>;
  status?: number;
  requestId?: string;
};

/** Result of create_action_connector. */
export type CreateActionConnectorResult = {
  arn?: string;
  creationStatus?: string;
  actionConnectorId?: string;
  requestId?: string;
  status?: number;
};

/** Result of create_brand. */
export type CreateBrandResult = {
  requestId?: string;
  brandDetail?: Record<string, unknown>;
  brandDefinition?: Record<string, unknown>;
};

/** Result of create_custom_permissions. */
export type CreateCustomPermissionsResult = {
  status?: number;
  arn?: string;
  requestId?: string;
};

/** Result of create_data_set. */
export type CreateDataSetResult = {
  arn?: string;
  dataSetId?: string;
  ingestionArn?: string;
  ingestionId?: string;
  requestId?: string;
  status?: number;
};

/** Result of create_folder. */
export type CreateFolderResult = {
  status?: number;
  arn?: string;
  folderId?: string;
  requestId?: string;
};

/** Result of create_folder_membership. */
export type CreateFolderMembershipResult = {
  status?: number;
  folderMember?: Record<string, unknown>;
  requestId?: string;
};

/** Result of create_group. */
export type CreateGroupResult = {
  group?: Record<string, unknown>;
  requestId?: string;
  status?: number;
};

/** Result of create_group_membership. */
export type CreateGroupMembershipResult = {
  groupMember?: Record<string, unknown>;
  requestId?: string;
  status?: number;
};

/** Result of create_iam_policy_assignment. */
export type CreateIamPolicyAssignmentResult = {
  assignmentName?: string;
  assignmentId?: string;
  assignmentStatus?: string;
  policyArn?: string;
  identities?: Record<string, unknown>;
  requestId?: string;
  status?: number;
};

/** Result of create_ingestion. */
export type CreateIngestionResult = {
  arn?: string;
  ingestionId?: string;
  ingestionStatus?: string;
  requestId?: string;
  status?: number;
};

/** Result of create_namespace. */
export type CreateNamespaceResult = {
  arn?: string;
  name?: string;
  capacityRegion?: string;
  creationStatus?: string;
  identityStore?: string;
  requestId?: string;
  status?: number;
};

/** Result of create_refresh_schedule. */
export type CreateRefreshScheduleResult = {
  status?: number;
  requestId?: string;
  scheduleId?: string;
  arn?: string;
};

/** Result of create_role_membership. */
export type CreateRoleMembershipResult = {
  requestId?: string;
  status?: number;
};

/** Result of create_template. */
export type CreateTemplateResult = {
  arn?: string;
  versionArn?: string;
  templateId?: string;
  creationStatus?: string;
  status?: number;
  requestId?: string;
};

/** Result of create_template_alias. */
export type CreateTemplateAliasResult = {
  templateAlias?: Record<string, unknown>;
  status?: number;
  requestId?: string;
};

/** Result of create_theme. */
export type CreateThemeResult = {
  arn?: string;
  versionArn?: string;
  themeId?: string;
  creationStatus?: string;
  status?: number;
  requestId?: string;
};

/** Result of create_theme_alias. */
export type CreateThemeAliasResult = {
  themeAlias?: Record<string, unknown>;
  status?: number;
  requestId?: string;
};

/** Result of create_topic. */
export type CreateTopicResult = {
  arn?: string;
  topicId?: string;
  refreshArn?: string;
  requestId?: string;
  status?: number;
};

/** Result of create_topic_refresh_schedule. */
export type CreateTopicRefreshScheduleResult = {
  topicId?: string;
  topicArn?: string;
  datasetArn?: string;
  status?: number;
  requestId?: string;
};

/** Result of create_vpc_connection. */
export type CreateVpcConnectionResult = {
  arn?: string;
  vpcConnectionId?: string;
  creationStatus?: string;
  availabilityStatus?: string;
  requestId?: string;
  status?: number;
};

/** Result of delete_account_custom_permission. */
export type DeleteAccountCustomPermissionResult = {
  requestId?: string;
  status?: number;
};

/** Result of delete_account_customization. */
export type DeleteAccountCustomizationResult = {
  requestId?: string;
  status?: number;
};

/** Result of delete_account_subscription. */
export type DeleteAccountSubscriptionResult = {
  requestId?: string;
  status?: number;
};

/** Result of delete_action_connector. */
export type DeleteActionConnectorResult = {
  arn?: string;
  actionConnectorId?: string;
  requestId?: string;
  status?: number;
};

/** Result of delete_analysis. */
export type DeleteAnalysisResult = {
  status?: number;
  arn?: string;
  analysisId?: string;
  deletionTime?: string;
  requestId?: string;
};

/** Result of delete_brand. */
export type DeleteBrandResult = {
  requestId?: string;
};

/** Result of delete_brand_assignment. */
export type DeleteBrandAssignmentResult = {
  requestId?: string;
};

/** Result of delete_custom_permissions. */
export type DeleteCustomPermissionsResult = {
  status?: number;
  arn?: string;
  requestId?: string;
};

/** Result of delete_data_set. */
export type DeleteDataSetResult = {
  arn?: string;
  dataSetId?: string;
  requestId?: string;
  status?: number;
};

/** Result of delete_data_set_refresh_properties. */
export type DeleteDataSetRefreshPropertiesResult = {
  requestId?: string;
  status?: number;
};

/** Result of delete_data_source. */
export type DeleteDataSourceResult = {
  arn?: string;
  dataSourceId?: string;
  requestId?: string;
  status?: number;
};

/** Result of delete_default_q_business_application. */
export type DeleteDefaultQBusinessApplicationResult = {
  requestId?: string;
  status?: number;
};

/** Result of delete_folder. */
export type DeleteFolderResult = {
  status?: number;
  arn?: string;
  folderId?: string;
  requestId?: string;
};

/** Result of delete_folder_membership. */
export type DeleteFolderMembershipResult = {
  status?: number;
  requestId?: string;
};

/** Result of delete_group. */
export type DeleteGroupResult = {
  requestId?: string;
  status?: number;
};

/** Result of delete_group_membership. */
export type DeleteGroupMembershipResult = {
  requestId?: string;
  status?: number;
};

/** Result of delete_iam_policy_assignment. */
export type DeleteIamPolicyAssignmentResult = {
  assignmentName?: string;
  requestId?: string;
  status?: number;
};

/** Result of delete_identity_propagation_config. */
export type DeleteIdentityPropagationConfigResult = {
  requestId?: string;
  status?: number;
};

/** Result of delete_namespace. */
export type DeleteNamespaceResult = {
  requestId?: string;
  status?: number;
};

/** Result of delete_refresh_schedule. */
export type DeleteRefreshScheduleResult = {
  status?: number;
  requestId?: string;
  scheduleId?: string;
  arn?: string;
};

/** Result of delete_role_custom_permission. */
export type DeleteRoleCustomPermissionResult = {
  requestId?: string;
  status?: number;
};

/** Result of delete_role_membership. */
export type DeleteRoleMembershipResult = {
  requestId?: string;
  status?: number;
};

/** Result of delete_template. */
export type DeleteTemplateResult = {
  requestId?: string;
  arn?: string;
  templateId?: string;
  status?: number;
};

/** Result of delete_template_alias. */
export type DeleteTemplateAliasResult = {
  status?: number;
  templateId?: string;
  aliasName?: string;
  arn?: string;
  requestId?: string;
};

/** Result of delete_theme. */
export type DeleteThemeResult = {
  arn?: string;
  requestId?: string;
  status?: number;
  themeId?: string;
};

/** Result of delete_theme_alias. */
export type DeleteThemeAliasResult = {
  aliasName?: string;
  arn?: string;
  requestId?: string;
  status?: number;
  themeId?: string;
};

/** Result of delete_topic. */
export type DeleteTopicResult = {
  arn?: string;
  topicId?: string;
  requestId?: string;
  status?: number;
};

/** Result of delete_topic_refresh_schedule. */
export type DeleteTopicRefreshScheduleResult = {
  topicId?: string;
  topicArn?: string;
  datasetArn?: string;
  status?: number;
  requestId?: string;
};

/** Result of delete_user_by_principal_id. */
export type DeleteUserByPrincipalIdResult = {
  requestId?: string;
  status?: number;
};

/** Result of delete_user_custom_permission. */
export type DeleteUserCustomPermissionResult = {
  requestId?: string;
  status?: number;
};

/** Result of delete_vpc_connection. */
export type DeleteVpcConnectionResult = {
  arn?: string;
  vpcConnectionId?: string;
  deletionStatus?: string;
  availabilityStatus?: string;
  requestId?: string;
  status?: number;
};

/** Result of describe_account_custom_permission. */
export type DescribeAccountCustomPermissionResult = {
  customPermissionsName?: string;
  requestId?: string;
  status?: number;
};

/** Result of describe_account_customization. */
export type DescribeAccountCustomizationResult = {
  arn?: string;
  awsAccountId?: string;
  namespace?: string;
  accountCustomization?: Record<string, unknown>;
  requestId?: string;
  status?: number;
};

/** Result of describe_account_settings. */
export type DescribeAccountSettingsResult = {
  accountSettings?: Record<string, unknown>;
  requestId?: string;
  status?: number;
};

/** Result of describe_account_subscription. */
export type DescribeAccountSubscriptionResult = {
  accountInfo?: Record<string, unknown>;
  status?: number;
  requestId?: string;
};

/** Result of describe_action_connector. */
export type DescribeActionConnectorResult = {
  actionConnector?: Record<string, unknown>;
  requestId?: string;
  status?: number;
};

/** Result of describe_action_connector_permissions. */
export type DescribeActionConnectorPermissionsResult = {
  arn?: string;
  actionConnectorId?: string;
  permissions?: Record<string, unknown>[];
  requestId?: string;
  status?: number;
};

/** Result of describe_analysis. */
export type DescribeAnalysisResult = {
  analysis?: Record<string, unknown>;
  status?: number;
  requestId?: string;
};

/** Result of describe_analysis_definition. */
export type DescribeAnalysisDefinitionResult = {
  analysisId?: string;
  name?: string;
  errors?: Record<string, unknown>[];
  resourceStatus?: string;
  themeArn?: string;
  definition?: Record<string, unknown>;
  status?: number;
  requestId?: string;
};

/** Result of describe_analysis_permissions. */
export type DescribeAnalysisPermissionsResult = {
  analysisId?: string;
  analysisArn?: string;
  permissions?: Record<string, unknown>[];
  status?: number;
  requestId?: string;
};

/** Result of describe_asset_bundle_export_job. */
export type DescribeAssetBundleExportJobResult = {
  jobStatus?: string;
  downloadUrl?: string;
  errors?: Record<string, unknown>[];
  arn?: string;
  createdTime?: string;
  assetBundleExportJobId?: string;
  awsAccountId?: string;
  resourceArns?: string[];
  includeAllDependencies?: boolean;
  exportFormat?: string;
  cloudFormationOverridePropertyConfiguration?: Record<string, unknown>;
  requestId?: string;
  status?: number;
  includePermissions?: boolean;
  includeTags?: boolean;
  validationStrategy?: Record<string, unknown>;
  warnings?: Record<string, unknown>[];
  includeFolderMemberships?: boolean;
  includeFolderMembers?: string;
};

/** Result of describe_asset_bundle_import_job. */
export type DescribeAssetBundleImportJobResult = {
  jobStatus?: string;
  errors?: Record<string, unknown>[];
  rollbackErrors?: Record<string, unknown>[];
  arn?: string;
  createdTime?: string;
  assetBundleImportJobId?: string;
  awsAccountId?: string;
  assetBundleImportSource?: Record<string, unknown>;
  overrideParameters?: Record<string, unknown>;
  failureAction?: string;
  requestId?: string;
  status?: number;
  overridePermissions?: Record<string, unknown>;
  overrideTags?: Record<string, unknown>;
  overrideValidationStrategy?: Record<string, unknown>;
  warnings?: Record<string, unknown>[];
};

/** Result of describe_brand. */
export type DescribeBrandResult = {
  requestId?: string;
  brandDetail?: Record<string, unknown>;
  brandDefinition?: Record<string, unknown>;
};

/** Result of describe_brand_assignment. */
export type DescribeBrandAssignmentResult = {
  requestId?: string;
  brandArn?: string;
};

/** Result of describe_brand_published_version. */
export type DescribeBrandPublishedVersionResult = {
  requestId?: string;
  brandDetail?: Record<string, unknown>;
  brandDefinition?: Record<string, unknown>;
};

/** Result of describe_custom_permissions. */
export type DescribeCustomPermissionsResult = {
  status?: number;
  customPermissions?: Record<string, unknown>;
  requestId?: string;
};

/** Result of describe_dashboard_definition. */
export type DescribeDashboardDefinitionResult = {
  dashboardId?: string;
  errors?: Record<string, unknown>[];
  name?: string;
  resourceStatus?: string;
  themeArn?: string;
  definition?: Record<string, unknown>;
  status?: number;
  requestId?: string;
  dashboardPublishOptions?: Record<string, unknown>;
};

/** Result of describe_dashboard_permissions. */
export type DescribeDashboardPermissionsResult = {
  dashboardId?: string;
  dashboardArn?: string;
  permissions?: Record<string, unknown>[];
  status?: number;
  requestId?: string;
  linkSharingConfiguration?: Record<string, unknown>;
};

/** Result of describe_dashboard_snapshot_job. */
export type DescribeDashboardSnapshotJobResult = {
  awsAccountId?: string;
  dashboardId?: string;
  snapshotJobId?: string;
  userConfiguration?: Record<string, unknown>;
  snapshotConfiguration?: Record<string, unknown>;
  arn?: string;
  jobStatus?: string;
  createdTime?: string;
  lastUpdatedTime?: string;
  requestId?: string;
  status?: number;
};

/** Result of describe_dashboard_snapshot_job_result. */
export type DescribeDashboardSnapshotJobResultResult = {
  arn?: string;
  jobStatus?: string;
  createdTime?: string;
  lastUpdatedTime?: string;
  result?: Record<string, unknown>;
  errorInfo?: Record<string, unknown>;
  requestId?: string;
  status?: number;
};

/** Result of describe_dashboards_qa_configuration. */
export type DescribeDashboardsQaConfigurationResult = {
  dashboardsQaStatus?: string;
  requestId?: string;
  status?: number;
};

/** Result of describe_data_set. */
export type DescribeDataSetResult = {
  dataSet?: Record<string, unknown>;
  requestId?: string;
  status?: number;
};

/** Result of describe_data_set_permissions. */
export type DescribeDataSetPermissionsResult = {
  dataSetArn?: string;
  dataSetId?: string;
  permissions?: Record<string, unknown>[];
  requestId?: string;
  status?: number;
};

/** Result of describe_data_set_refresh_properties. */
export type DescribeDataSetRefreshPropertiesResult = {
  requestId?: string;
  status?: number;
  dataSetRefreshProperties?: Record<string, unknown>;
};

/** Result of describe_data_source. */
export type DescribeDataSourceResult = {
  dataSource?: Record<string, unknown>;
  requestId?: string;
  status?: number;
};

/** Result of describe_data_source_permissions. */
export type DescribeDataSourcePermissionsResult = {
  dataSourceArn?: string;
  dataSourceId?: string;
  permissions?: Record<string, unknown>[];
  requestId?: string;
  status?: number;
};

/** Result of describe_default_q_business_application. */
export type DescribeDefaultQBusinessApplicationResult = {
  requestId?: string;
  status?: number;
  applicationId?: string;
};

/** Result of describe_folder. */
export type DescribeFolderResult = {
  status?: number;
  folder?: Record<string, unknown>;
  requestId?: string;
};

/** Result of describe_folder_permissions. */
export type DescribeFolderPermissionsResult = {
  status?: number;
  folderId?: string;
  arn?: string;
  permissions?: Record<string, unknown>[];
  requestId?: string;
  nextToken?: string;
};

/** Result of describe_folder_resolved_permissions. */
export type DescribeFolderResolvedPermissionsResult = {
  status?: number;
  folderId?: string;
  arn?: string;
  permissions?: Record<string, unknown>[];
  requestId?: string;
  nextToken?: string;
};

/** Result of describe_group. */
export type DescribeGroupResult = {
  group?: Record<string, unknown>;
  requestId?: string;
  status?: number;
};

/** Result of describe_group_membership. */
export type DescribeGroupMembershipResult = {
  groupMember?: Record<string, unknown>;
  requestId?: string;
  status?: number;
};

/** Result of describe_iam_policy_assignment. */
export type DescribeIamPolicyAssignmentResult = {
  iamPolicyAssignment?: Record<string, unknown>;
  requestId?: string;
  status?: number;
};

/** Result of describe_ingestion. */
export type DescribeIngestionResult = {
  ingestion?: Record<string, unknown>;
  requestId?: string;
  status?: number;
};

/** Result of describe_ip_restriction. */
export type DescribeIpRestrictionResult = {
  awsAccountId?: string;
  ipRestrictionRuleMap?: Record<string, unknown>;
  vpcIdRestrictionRuleMap?: Record<string, unknown>;
  vpcEndpointIdRestrictionRuleMap?: Record<string, unknown>;
  enabled?: boolean;
  requestId?: string;
  status?: number;
};

/** Result of describe_key_registration. */
export type DescribeKeyRegistrationResult = {
  awsAccountId?: string;
  keyRegistration?: Record<string, unknown>[];
  qDataKey?: Record<string, unknown>;
  requestId?: string;
  status?: number;
};

/** Result of describe_namespace. */
export type DescribeNamespaceResult = {
  namespace?: Record<string, unknown>;
  requestId?: string;
  status?: number;
};

/** Result of describe_q_personalization_configuration. */
export type DescribeQPersonalizationConfigurationResult = {
  personalizationMode?: string;
  requestId?: string;
  status?: number;
};

/** Result of describe_quick_sight_q_search_configuration. */
export type DescribeQuickSightQSearchConfigurationResult = {
  qSearchStatus?: string;
  requestId?: string;
  status?: number;
};

/** Result of describe_refresh_schedule. */
export type DescribeRefreshScheduleResult = {
  refreshSchedule?: Record<string, unknown>;
  status?: number;
  requestId?: string;
  arn?: string;
};

/** Result of describe_role_custom_permission. */
export type DescribeRoleCustomPermissionResult = {
  customPermissionsName?: string;
  requestId?: string;
  status?: number;
};

/** Result of describe_template. */
export type DescribeTemplateResult = {
  template?: Record<string, unknown>;
  status?: number;
  requestId?: string;
};

/** Result of describe_template_alias. */
export type DescribeTemplateAliasResult = {
  templateAlias?: Record<string, unknown>;
  status?: number;
  requestId?: string;
};

/** Result of describe_template_definition. */
export type DescribeTemplateDefinitionResult = {
  name?: string;
  templateId?: string;
  errors?: Record<string, unknown>[];
  resourceStatus?: string;
  themeArn?: string;
  definition?: Record<string, unknown>;
  status?: number;
  requestId?: string;
};

/** Result of describe_template_permissions. */
export type DescribeTemplatePermissionsResult = {
  templateId?: string;
  templateArn?: string;
  permissions?: Record<string, unknown>[];
  requestId?: string;
  status?: number;
};

/** Result of describe_theme. */
export type DescribeThemeResult = {
  theme?: Record<string, unknown>;
  status?: number;
  requestId?: string;
};

/** Result of describe_theme_alias. */
export type DescribeThemeAliasResult = {
  themeAlias?: Record<string, unknown>;
  status?: number;
  requestId?: string;
};

/** Result of describe_theme_permissions. */
export type DescribeThemePermissionsResult = {
  themeId?: string;
  themeArn?: string;
  permissions?: Record<string, unknown>[];
  requestId?: string;
  status?: number;
};

/** Result of describe_topic. */
export type DescribeTopicResult = {
  arn?: string;
  topicId?: string;
  topic?: Record<string, unknown>;
  requestId?: string;
  status?: number;
  customInstructions?: Record<string, unknown>;
};

/** Result of describe_topic_permissions. */
export type DescribeTopicPermissionsResult = {
  topicId?: string;
  topicArn?: string;
  permissions?: Record<string, unknown>[];
  status?: number;
  requestId?: string;
};

/** Result of describe_topic_refresh. */
export type DescribeTopicRefreshResult = {
  refreshDetails?: Record<string, unknown>;
  requestId?: string;
  status?: number;
};

/** Result of describe_topic_refresh_schedule. */
export type DescribeTopicRefreshScheduleResult = {
  topicId?: string;
  topicArn?: string;
  datasetArn?: string;
  refreshSchedule?: Record<string, unknown>;
  status?: number;
  requestId?: string;
};

/** Result of describe_vpc_connection. */
export type DescribeVpcConnectionResult = {
  vpcConnection?: Record<string, unknown>;
  requestId?: string;
  status?: number;
};

/** Result of generate_embed_url_for_anonymous_user. */
export type GenerateEmbedUrlForAnonymousUserResult = {
  embedUrl?: string;
  status?: number;
  requestId?: string;
  anonymousUserArn?: string;
};

/** Result of generate_embed_url_for_registered_user. */
export type GenerateEmbedUrlForRegisteredUserResult = {
  embedUrl?: string;
  status?: number;
  requestId?: string;
};

/** Result of generate_embed_url_for_registered_user_with_identity. */
export type GenerateEmbedUrlForRegisteredUserWithIdentityResult = {
  embedUrl?: string;
  status?: number;
  requestId?: string;
};

/** Result of get_dashboard_embed_url. */
export type GetDashboardEmbedUrlResult = {
  embedUrl?: string;
  status?: number;
  requestId?: string;
};

/** Result of get_flow_metadata. */
export type GetFlowMetadataResult = {
  arn?: string;
  flowId?: string;
  name?: string;
  description?: string;
  publishState?: string;
  userCount?: number;
  runCount?: number;
  createdTime?: string;
  lastUpdatedTime?: string;
  requestId?: string;
  status?: number;
};

/** Result of get_flow_permissions. */
export type GetFlowPermissionsResult = {
  arn?: string;
  flowId?: string;
  permissions?: Record<string, unknown>[];
  requestId?: string;
  status?: number;
};

/** Result of get_session_embed_url. */
export type GetSessionEmbedUrlResult = {
  embedUrl?: string;
  status?: number;
  requestId?: string;
};

/** Result of list_action_connectors. */
export type ListActionConnectorsResult = {
  actionConnectorSummaries?: Record<string, unknown>[];
  nextToken?: string;
  requestId?: string;
  status?: number;
};

/** Result of list_asset_bundle_export_jobs. */
export type ListAssetBundleExportJobsResult = {
  assetBundleExportJobSummaryList?: Record<string, unknown>[];
  nextToken?: string;
  requestId?: string;
  status?: number;
};

/** Result of list_asset_bundle_import_jobs. */
export type ListAssetBundleImportJobsResult = {
  assetBundleImportJobSummaryList?: Record<string, unknown>[];
  nextToken?: string;
  requestId?: string;
  status?: number;
};

/** Result of list_brands. */
export type ListBrandsResult = {
  nextToken?: string;
  brands?: Record<string, unknown>[];
};

/** Result of list_custom_permissions. */
export type ListCustomPermissionsResult = {
  status?: number;
  customPermissionsList?: Record<string, unknown>[];
  nextToken?: string;
  requestId?: string;
};

/** Result of list_dashboard_versions. */
export type ListDashboardVersionsResult = {
  dashboardVersionSummaryList?: Record<string, unknown>[];
  nextToken?: string;
  status?: number;
  requestId?: string;
};

/** Result of list_data_sets. */
export type ListDataSetsResult = {
  dataSetSummaries?: Record<string, unknown>[];
  nextToken?: string;
  requestId?: string;
  status?: number;
};

/** Result of list_flows. */
export type ListFlowsResult = {
  flowSummaryList?: Record<string, unknown>[];
  nextToken?: string;
  requestId?: string;
  status?: number;
};

/** Result of list_folder_members. */
export type ListFolderMembersResult = {
  status?: number;
  folderMemberList?: Record<string, unknown>[];
  nextToken?: string;
  requestId?: string;
};

/** Result of list_folders. */
export type ListFoldersResult = {
  status?: number;
  folderSummaryList?: Record<string, unknown>[];
  nextToken?: string;
  requestId?: string;
};

/** Result of list_folders_for_resource. */
export type ListFoldersForResourceResult = {
  status?: number;
  folders?: string[];
  nextToken?: string;
  requestId?: string;
};

/** Result of list_group_memberships. */
export type ListGroupMembershipsResult = {
  groupMemberList?: Record<string, unknown>[];
  nextToken?: string;
  requestId?: string;
  status?: number;
};

/** Result of list_groups. */
export type ListGroupsResult = {
  groupList?: Record<string, unknown>[];
  nextToken?: string;
  requestId?: string;
  status?: number;
};

/** Result of list_iam_policy_assignments. */
export type ListIamPolicyAssignmentsResult = {
  iamPolicyAssignments?: Record<string, unknown>[];
  nextToken?: string;
  requestId?: string;
  status?: number;
};

/** Result of list_iam_policy_assignments_for_user. */
export type ListIamPolicyAssignmentsForUserResult = {
  activeAssignments?: Record<string, unknown>[];
  requestId?: string;
  nextToken?: string;
  status?: number;
};

/** Result of list_identity_propagation_configs. */
export type ListIdentityPropagationConfigsResult = {
  services?: Record<string, unknown>[];
  nextToken?: string;
  status?: number;
  requestId?: string;
};

/** Result of list_ingestions. */
export type ListIngestionsResult = {
  ingestions?: Record<string, unknown>[];
  nextToken?: string;
  requestId?: string;
  status?: number;
};

/** Result of list_namespaces. */
export type ListNamespacesResult = {
  namespaces?: Record<string, unknown>[];
  nextToken?: string;
  requestId?: string;
  status?: number;
};

/** Result of list_refresh_schedules. */
export type ListRefreshSchedulesResult = {
  refreshSchedules?: Record<string, unknown>[];
  status?: number;
  requestId?: string;
};

/** Result of list_role_memberships. */
export type ListRoleMembershipsResult = {
  membersList?: string[];
  nextToken?: string;
  requestId?: string;
  status?: number;
};

/** Result of list_tags_for_resource. */
export type ListTagsForResourceResult = {
  tags?: Record<string, unknown>[];
  requestId?: string;
  status?: number;
};

/** Result of list_template_aliases. */
export type ListTemplateAliasesResult = {
  templateAliasList?: Record<string, unknown>[];
  status?: number;
  requestId?: string;
  nextToken?: string;
};

/** Result of list_template_versions. */
export type ListTemplateVersionsResult = {
  templateVersionSummaryList?: Record<string, unknown>[];
  nextToken?: string;
  status?: number;
  requestId?: string;
};

/** Result of list_templates. */
export type ListTemplatesResult = {
  templateSummaryList?: Record<string, unknown>[];
  nextToken?: string;
  status?: number;
  requestId?: string;
};

/** Result of list_theme_aliases. */
export type ListThemeAliasesResult = {
  themeAliasList?: Record<string, unknown>[];
  status?: number;
  requestId?: string;
  nextToken?: string;
};

/** Result of list_theme_versions. */
export type ListThemeVersionsResult = {
  themeVersionSummaryList?: Record<string, unknown>[];
  nextToken?: string;
  status?: number;
  requestId?: string;
};

/** Result of list_themes. */
export type ListThemesResult = {
  themeSummaryList?: Record<string, unknown>[];
  nextToken?: string;
  status?: number;
  requestId?: string;
};

/** Result of list_topic_refresh_schedules. */
export type ListTopicRefreshSchedulesResult = {
  topicId?: string;
  topicArn?: string;
  refreshSchedules?: Record<string, unknown>[];
  status?: number;
  requestId?: string;
};

/** Result of list_topic_reviewed_answers. */
export type ListTopicReviewedAnswersResult = {
  topicId?: string;
  topicArn?: string;
  answers?: Record<string, unknown>[];
  status?: number;
  requestId?: string;
};

/** Result of list_topics. */
export type ListTopicsResult = {
  topicsSummaries?: Record<string, unknown>[];
  nextToken?: string;
  requestId?: string;
  status?: number;
};

/** Result of list_user_groups. */
export type ListUserGroupsResult = {
  groupList?: Record<string, unknown>[];
  nextToken?: string;
  requestId?: string;
  status?: number;
};

/** Result of list_vpc_connections. */
export type ListVpcConnectionsResult = {
  vpcConnectionSummaries?: Record<string, unknown>[];
  nextToken?: string;
  requestId?: string;
  status?: number;
};

/** Result of predict_qa_results. */
export type PredictQaResultsResult = {
  primaryResult?: Record<string, unknown>;
  additionalResults?: Record<string, unknown>[];
  requestId?: string;
  status?: number;
};

/** Result of put_data_set_refresh_properties. */
export type PutDataSetRefreshPropertiesResult = {
  requestId?: string;
  status?: number;
};

/** Result of restore_analysis. */
export type RestoreAnalysisResult = {
  status?: number;
  arn?: string;
  analysisId?: string;
  requestId?: string;
  restorationFailedFolderArns?: string[];
};

/** Result of search_action_connectors. */
export type SearchActionConnectorsResult = {
  nextToken?: string;
  requestId?: string;
  status?: number;
  actionConnectorSummaries?: Record<string, unknown>[];
};

/** Result of search_analyses. */
export type SearchAnalysesResult = {
  analysisSummaryList?: Record<string, unknown>[];
  nextToken?: string;
  status?: number;
  requestId?: string;
};

/** Result of search_dashboards. */
export type SearchDashboardsResult = {
  dashboardSummaryList?: Record<string, unknown>[];
  nextToken?: string;
  status?: number;
  requestId?: string;
};

/** Result of search_data_sets. */
export type SearchDataSetsResult = {
  dataSetSummaries?: Record<string, unknown>[];
  nextToken?: string;
  status?: number;
  requestId?: string;
};

/** Result of search_data_sources. */
export type SearchDataSourcesResult = {
  dataSourceSummaries?: Record<string, unknown>[];
  nextToken?: string;
  status?: number;
  requestId?: string;
};

/** Result of search_flows. */
export type SearchFlowsResult = {
  flowSummaryList?: Record<string, unknown>[];
  nextToken?: string;
  requestId?: string;
  status?: number;
};

/** Result of search_folders. */
export type SearchFoldersResult = {
  status?: number;
  folderSummaryList?: Record<string, unknown>[];
  nextToken?: string;
  requestId?: string;
};

/** Result of search_groups. */
export type SearchGroupsResult = {
  groupList?: Record<string, unknown>[];
  nextToken?: string;
  requestId?: string;
  status?: number;
};

/** Result of search_topics. */
export type SearchTopicsResult = {
  topicSummaryList?: Record<string, unknown>[];
  nextToken?: string;
  status?: number;
  requestId?: string;
};

/** Result of start_asset_bundle_export_job. */
export type StartAssetBundleExportJobResult = {
  arn?: string;
  assetBundleExportJobId?: string;
  requestId?: string;
  status?: number;
};

/** Result of start_asset_bundle_import_job. */
export type StartAssetBundleImportJobResult = {
  arn?: string;
  assetBundleImportJobId?: string;
  requestId?: string;
  status?: number;
};

/** Result of start_dashboard_snapshot_job. */
export type StartDashboardSnapshotJobResult = {
  arn?: string;
  snapshotJobId?: string;
  requestId?: string;
  status?: number;
};

/** Result of start_dashboard_snapshot_job_schedule. */
export type StartDashboardSnapshotJobScheduleResult = {
  requestId?: string;
  status?: number;
};

/** Result of tag_resource. */
export type TagResourceResult = {
  requestId?: string;
  status?: number;
};

/** Result of untag_resource. */
export type UntagResourceResult = {
  requestId?: string;
  status?: number;
};

/** Result of update_account_custom_permission. */
export type UpdateAccountCustomPermissionResult = {
  requestId?: string;
  status?: number;
};

/** Result of update_account_customization. */
export type UpdateAccountCustomizationResult = {
  arn?: string;
  awsAccountId?: string;
  namespace?: string;
  accountCustomization?: Record<string, unknown>;
  requestId?: string;
  status?: number;
};

/** Result of update_account_settings. */
export type UpdateAccountSettingsResult = {
  requestId?: string;
  status?: number;
};

/** Result of update_action_connector. */
export type UpdateActionConnectorResult = {
  arn?: string;
  actionConnectorId?: string;
  requestId?: string;
  updateStatus?: string;
  status?: number;
};

/** Result of update_action_connector_permissions. */
export type UpdateActionConnectorPermissionsResult = {
  arn?: string;
  actionConnectorId?: string;
  requestId?: string;
  status?: number;
  permissions?: Record<string, unknown>[];
};

/** Result of update_analysis. */
export type UpdateAnalysisResult = {
  arn?: string;
  analysisId?: string;
  updateStatus?: string;
  status?: number;
  requestId?: string;
};

/** Result of update_analysis_permissions. */
export type UpdateAnalysisPermissionsResult = {
  analysisArn?: string;
  analysisId?: string;
  permissions?: Record<string, unknown>[];
  requestId?: string;
  status?: number;
};

/** Result of update_application_with_token_exchange_grant. */
export type UpdateApplicationWithTokenExchangeGrantResult = {
  status?: number;
  requestId?: string;
};

/** Result of update_brand. */
export type UpdateBrandResult = {
  requestId?: string;
  brandDetail?: Record<string, unknown>;
  brandDefinition?: Record<string, unknown>;
};

/** Result of update_brand_assignment. */
export type UpdateBrandAssignmentResult = {
  requestId?: string;
  brandArn?: string;
};

/** Result of update_brand_published_version. */
export type UpdateBrandPublishedVersionResult = {
  requestId?: string;
  versionId?: string;
};

/** Result of update_custom_permissions. */
export type UpdateCustomPermissionsResult = {
  status?: number;
  arn?: string;
  requestId?: string;
};

/** Result of update_dashboard. */
export type UpdateDashboardResult = {
  arn?: string;
  versionArn?: string;
  dashboardId?: string;
  creationStatus?: string;
  status?: number;
  requestId?: string;
};

/** Result of update_dashboard_links. */
export type UpdateDashboardLinksResult = {
  requestId?: string;
  status?: number;
  dashboardArn?: string;
  linkEntities?: string[];
};

/** Result of update_dashboard_permissions. */
export type UpdateDashboardPermissionsResult = {
  dashboardArn?: string;
  dashboardId?: string;
  permissions?: Record<string, unknown>[];
  requestId?: string;
  status?: number;
  linkSharingConfiguration?: Record<string, unknown>;
};

/** Result of update_dashboard_published_version. */
export type UpdateDashboardPublishedVersionResult = {
  dashboardId?: string;
  dashboardArn?: string;
  status?: number;
  requestId?: string;
};

/** Result of update_dashboards_qa_configuration. */
export type UpdateDashboardsQaConfigurationResult = {
  dashboardsQaStatus?: string;
  requestId?: string;
  status?: number;
};

/** Result of update_data_set. */
export type UpdateDataSetResult = {
  arn?: string;
  dataSetId?: string;
  ingestionArn?: string;
  ingestionId?: string;
  requestId?: string;
  status?: number;
};

/** Result of update_data_set_permissions. */
export type UpdateDataSetPermissionsResult = {
  dataSetArn?: string;
  dataSetId?: string;
  requestId?: string;
  status?: number;
};

/** Result of update_data_source. */
export type UpdateDataSourceResult = {
  arn?: string;
  dataSourceId?: string;
  updateStatus?: string;
  requestId?: string;
  status?: number;
};

/** Result of update_data_source_permissions. */
export type UpdateDataSourcePermissionsResult = {
  dataSourceArn?: string;
  dataSourceId?: string;
  requestId?: string;
  status?: number;
};

/** Result of update_default_q_business_application. */
export type UpdateDefaultQBusinessApplicationResult = {
  requestId?: string;
  status?: number;
};

/** Result of update_flow_permissions. */
export type UpdateFlowPermissionsResult = {
  status?: number;
  arn?: string;
  permissions?: Record<string, unknown>[];
  requestId?: string;
  flowId?: string;
};

/** Result of update_folder. */
export type UpdateFolderResult = {
  status?: number;
  arn?: string;
  folderId?: string;
  requestId?: string;
};

/** Result of update_folder_permissions. */
export type UpdateFolderPermissionsResult = {
  status?: number;
  arn?: string;
  folderId?: string;
  permissions?: Record<string, unknown>[];
  requestId?: string;
};

/** Result of update_group. */
export type UpdateGroupResult = {
  group?: Record<string, unknown>;
  requestId?: string;
  status?: number;
};

/** Result of update_iam_policy_assignment. */
export type UpdateIamPolicyAssignmentResult = {
  assignmentName?: string;
  assignmentId?: string;
  policyArn?: string;
  identities?: Record<string, unknown>;
  assignmentStatus?: string;
  requestId?: string;
  status?: number;
};

/** Result of update_identity_propagation_config. */
export type UpdateIdentityPropagationConfigResult = {
  requestId?: string;
  status?: number;
};

/** Result of update_ip_restriction. */
export type UpdateIpRestrictionResult = {
  awsAccountId?: string;
  requestId?: string;
  status?: number;
};

/** Result of update_key_registration. */
export type UpdateKeyRegistrationResult = {
  failedKeyRegistration?: Record<string, unknown>[];
  successfulKeyRegistration?: Record<string, unknown>[];
  requestId?: string;
};

/** Result of update_public_sharing_settings. */
export type UpdatePublicSharingSettingsResult = {
  requestId?: string;
  status?: number;
};

/** Result of update_q_personalization_configuration. */
export type UpdateQPersonalizationConfigurationResult = {
  personalizationMode?: string;
  requestId?: string;
  status?: number;
};

/** Result of update_quick_sight_q_search_configuration. */
export type UpdateQuickSightQSearchConfigurationResult = {
  qSearchStatus?: string;
  requestId?: string;
  status?: number;
};

/** Result of update_refresh_schedule. */
export type UpdateRefreshScheduleResult = {
  status?: number;
  requestId?: string;
  scheduleId?: string;
  arn?: string;
};

/** Result of update_role_custom_permission. */
export type UpdateRoleCustomPermissionResult = {
  requestId?: string;
  status?: number;
};

/** Result of update_spice_capacity_configuration. */
export type UpdateSpiceCapacityConfigurationResult = {
  requestId?: string;
  status?: number;
};

/** Result of update_template. */
export type UpdateTemplateResult = {
  templateId?: string;
  arn?: string;
  versionArn?: string;
  creationStatus?: string;
  status?: number;
  requestId?: string;
};

/** Result of update_template_alias. */
export type UpdateTemplateAliasResult = {
  templateAlias?: Record<string, unknown>;
  status?: number;
  requestId?: string;
};

/** Result of update_template_permissions. */
export type UpdateTemplatePermissionsResult = {
  templateId?: string;
  templateArn?: string;
  permissions?: Record<string, unknown>[];
  requestId?: string;
  status?: number;
};

/** Result of update_theme. */
export type UpdateThemeResult = {
  themeId?: string;
  arn?: string;
  versionArn?: string;
  creationStatus?: string;
  status?: number;
  requestId?: string;
};

/** Result of update_theme_alias. */
export type UpdateThemeAliasResult = {
  themeAlias?: Record<string, unknown>;
  status?: number;
  requestId?: string;
};

/** Result of update_theme_permissions. */
export type UpdateThemePermissionsResult = {
  themeId?: string;
  themeArn?: string;
  permissions?: Record<string, unknown>[];
  requestId?: string;
  status?: number;
};

/** Result of update_topic. */
export type UpdateTopicResult = {
  topicId?: string;
  arn?: string;
  refreshArn?: string;
  requestId?: string;
  status?: number;
};

/** Result of update_topic_permissions. */
export type UpdateTopicPermissionsResult = {
  topicId?: string;
  topicArn?: string;
  permissions?: Record<string, unknown>[];
  status?: number;
  requestId?: string;
};

/** Result of update_topic_refresh_schedule. */
export type UpdateTopicRefreshScheduleResult = {
  topicId?: string;
  topicArn?: string;
  datasetArn?: string;
  status?: number;
  requestId?: string;
};

/** Result of update_user. */
export type UpdateUserResult = {
  user?: Record<string, unknown>;
  requestId?: string;
  status?: number;
};

/** Result of update_user_custom_permission. */
export type UpdateUserCustomPermissionResult = {
  requestId?: string;
  status?: number;
};

/** Result of update_vpc_connection. */
export type UpdateVpcConnectionResult = {
  arn?: string;
  vpcConnectionId?: string;
  updateStatus?: string;
  availabilityStatus?: string;
  requestId?: string;
  status?: number;
};

/** Create a QuickSight dashboard. */
export async function createDashboard(awsAccountId: string, dashboardId: string, name: string, sourceEntity: Record<string, unknown>): Promise<DashboardResult> {
  try {
    // TODO: implement create_dashboard
    throw new Error("create_dashboard not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_dashboard failed");
  }
}

/** Describe a QuickSight dashboard. */
export async function describeDashboard(awsAccountId: string, dashboardId: string): Promise<DashboardResult> {
  try {
    // TODO: implement describe_dashboard
    throw new Error("describe_dashboard not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_dashboard failed");
  }
}

/** List all QuickSight dashboards in the account. */
export async function listDashboards(awsAccountId: string): Promise<DashboardResult[]> {
  try {
    // TODO: implement list_dashboards
    throw new Error("list_dashboards not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_dashboards failed");
  }
}

/** Delete a QuickSight dashboard. */
export async function deleteDashboard(awsAccountId: string, dashboardId: string): Promise<void> {
  try {
    // TODO: implement delete_dashboard
    throw new Error("delete_dashboard not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_dashboard failed");
  }
}

/** Create a QuickSight dataset. */
export async function createDataset(awsAccountId: string, datasetId: string, name: string, physicalTableMap: Record<string, unknown>, importMode: string): Promise<DataSetResult> {
  try {
    // TODO: implement create_dataset
    throw new Error("create_dataset not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_dataset failed");
  }
}

/** Describe a QuickSight dataset. */
export async function describeDataset(awsAccountId: string, datasetId: string): Promise<DataSetResult> {
  try {
    // TODO: implement describe_dataset
    throw new Error("describe_dataset not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_dataset failed");
  }
}

/** List all QuickSight datasets in the account. */
export async function listDatasets(awsAccountId: string): Promise<DataSetResult[]> {
  try {
    // TODO: implement list_datasets
    throw new Error("list_datasets not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_datasets failed");
  }
}

/** Delete a QuickSight dataset. */
export async function deleteDataset(awsAccountId: string, datasetId: string): Promise<void> {
  try {
    // TODO: implement delete_dataset
    throw new Error("delete_dataset not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_dataset failed");
  }
}

/** Create a QuickSight analysis. */
export async function createAnalysis(awsAccountId: string, analysisId: string, name: string, sourceEntity: Record<string, unknown>): Promise<AnalysisResult> {
  try {
    // TODO: implement create_analysis
    throw new Error("create_analysis not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_analysis failed");
  }
}

/** List all QuickSight analyses in the account. */
export async function listAnalyses(awsAccountId: string): Promise<AnalysisResult[]> {
  try {
    // TODO: implement list_analyses
    throw new Error("list_analyses not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_analyses failed");
  }
}

/** Create a QuickSight data source. */
export async function createDataSource(awsAccountId: string, dataSourceId: string, name: string, dataSourceType: string, dataSourceParameters: Record<string, unknown>): Promise<DataSourceResult> {
  try {
    // TODO: implement create_data_source
    throw new Error("create_data_source not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_data_source failed");
  }
}

/** List all QuickSight data sources in the account. */
export async function listDataSources(awsAccountId: string): Promise<DataSourceResult[]> {
  try {
    // TODO: implement list_data_sources
    throw new Error("list_data_sources not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_data_sources failed");
  }
}

/** Describe a QuickSight user. */
export async function describeUser(awsAccountId: string, userName: string, namespace: string): Promise<QuickSightUser> {
  try {
    // TODO: implement describe_user
    throw new Error("describe_user not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_user failed");
  }
}

/** List all QuickSight users in a namespace. */
export async function listUsers(awsAccountId: string, namespace: string): Promise<QuickSightUser[]> {
  try {
    // TODO: implement list_users
    throw new Error("list_users not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_users failed");
  }
}

/** Register a new QuickSight user. */
export async function registerUser(awsAccountId: string, email: string, identityType: string, userRole: string, namespace: string): Promise<QuickSightUser> {
  try {
    // TODO: implement register_user
    throw new Error("register_user not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "register_user failed");
  }
}

/** Delete a QuickSight user. */
export async function deleteUser(awsAccountId: string, userName: string, namespace: string): Promise<void> {
  try {
    // TODO: implement delete_user
    throw new Error("delete_user not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_user failed");
  }
}

/** Batch create topic reviewed answer. */
export async function batchCreateTopicReviewedAnswer(awsAccountId: string, topicId: string, answers: Record<string, unknown>[], regionName?: string): Promise<BatchCreateTopicReviewedAnswerResult> {
  try {
    // TODO: implement batch_create_topic_reviewed_answer
    throw new Error("batch_create_topic_reviewed_answer not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_create_topic_reviewed_answer failed");
  }
}

/** Batch delete topic reviewed answer. */
export async function batchDeleteTopicReviewedAnswer(awsAccountId: string, topicId: string): Promise<BatchDeleteTopicReviewedAnswerResult> {
  try {
    // TODO: implement batch_delete_topic_reviewed_answer
    throw new Error("batch_delete_topic_reviewed_answer not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_delete_topic_reviewed_answer failed");
  }
}

/** Cancel ingestion. */
export async function cancelIngestion(awsAccountId: string, dataSetId: string, ingestionId: string, regionName?: string): Promise<CancelIngestionResult> {
  try {
    // TODO: implement cancel_ingestion
    throw new Error("cancel_ingestion not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "cancel_ingestion failed");
  }
}

/** Create account customization. */
export async function createAccountCustomization(awsAccountId: string, accountCustomization: Record<string, unknown>): Promise<CreateAccountCustomizationResult> {
  try {
    // TODO: implement create_account_customization
    throw new Error("create_account_customization not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_account_customization failed");
  }
}

/** Create account subscription. */
export async function createAccountSubscription(authenticationMethod: string, awsAccountId: string, accountName: string, notificationEmail: string): Promise<CreateAccountSubscriptionResult> {
  try {
    // TODO: implement create_account_subscription
    throw new Error("create_account_subscription not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_account_subscription failed");
  }
}

/** Create action connector. */
export async function createActionConnector(awsAccountId: string, actionConnectorId: string, name: string, typeValue: string, authenticationConfig: Record<string, unknown>): Promise<CreateActionConnectorResult> {
  try {
    // TODO: implement create_action_connector
    throw new Error("create_action_connector not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_action_connector failed");
  }
}

/** Create brand. */
export async function createBrand(awsAccountId: string, brandId: string): Promise<CreateBrandResult> {
  try {
    // TODO: implement create_brand
    throw new Error("create_brand not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_brand failed");
  }
}

/** Create custom permissions. */
export async function createCustomPermissions(awsAccountId: string, customPermissionsName: string): Promise<CreateCustomPermissionsResult> {
  try {
    // TODO: implement create_custom_permissions
    throw new Error("create_custom_permissions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_custom_permissions failed");
  }
}

/** Create data set. */
export async function createDataSet(awsAccountId: string, dataSetId: string, name: string, physicalTableMap: Record<string, unknown>, importMode: string): Promise<CreateDataSetResult> {
  try {
    // TODO: implement create_data_set
    throw new Error("create_data_set not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_data_set failed");
  }
}

/** Create folder. */
export async function createFolder(awsAccountId: string, folderId: string): Promise<CreateFolderResult> {
  try {
    // TODO: implement create_folder
    throw new Error("create_folder not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_folder failed");
  }
}

/** Create folder membership. */
export async function createFolderMembership(awsAccountId: string, folderId: string, memberId: string, memberType: string, regionName?: string): Promise<CreateFolderMembershipResult> {
  try {
    // TODO: implement create_folder_membership
    throw new Error("create_folder_membership not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_folder_membership failed");
  }
}

/** Create group. */
export async function createGroup(groupName: string, awsAccountId: string, namespace: string): Promise<CreateGroupResult> {
  try {
    // TODO: implement create_group
    throw new Error("create_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_group failed");
  }
}

/** Create group membership. */
export async function createGroupMembership(memberName: string, groupName: string, awsAccountId: string, namespace: string, regionName?: string): Promise<CreateGroupMembershipResult> {
  try {
    // TODO: implement create_group_membership
    throw new Error("create_group_membership not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_group_membership failed");
  }
}

/** Create iam policy assignment. */
export async function createIamPolicyAssignment(awsAccountId: string, assignmentName: string, assignmentStatus: string, namespace: string): Promise<CreateIamPolicyAssignmentResult> {
  try {
    // TODO: implement create_iam_policy_assignment
    throw new Error("create_iam_policy_assignment not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_iam_policy_assignment failed");
  }
}

/** Create ingestion. */
export async function createIngestion(dataSetId: string, ingestionId: string, awsAccountId: string): Promise<CreateIngestionResult> {
  try {
    // TODO: implement create_ingestion
    throw new Error("create_ingestion not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_ingestion failed");
  }
}

/** Create namespace. */
export async function createNamespace(awsAccountId: string, namespace: string, identityStore: string): Promise<CreateNamespaceResult> {
  try {
    // TODO: implement create_namespace
    throw new Error("create_namespace not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_namespace failed");
  }
}

/** Create refresh schedule. */
export async function createRefreshSchedule(dataSetId: string, awsAccountId: string, schedule: Record<string, unknown>, regionName?: string): Promise<CreateRefreshScheduleResult> {
  try {
    // TODO: implement create_refresh_schedule
    throw new Error("create_refresh_schedule not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_refresh_schedule failed");
  }
}

/** Create role membership. */
export async function createRoleMembership(memberName: string, awsAccountId: string, namespace: string, role: string, regionName?: string): Promise<CreateRoleMembershipResult> {
  try {
    // TODO: implement create_role_membership
    throw new Error("create_role_membership not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_role_membership failed");
  }
}

/** Create template. */
export async function createTemplate(awsAccountId: string, templateId: string): Promise<CreateTemplateResult> {
  try {
    // TODO: implement create_template
    throw new Error("create_template not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_template failed");
  }
}

/** Create template alias. */
export async function createTemplateAlias(awsAccountId: string, templateId: string, aliasName: string, templateVersionNumber: number, regionName?: string): Promise<CreateTemplateAliasResult> {
  try {
    // TODO: implement create_template_alias
    throw new Error("create_template_alias not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_template_alias failed");
  }
}

/** Create theme. */
export async function createTheme(awsAccountId: string, themeId: string, name: string, baseThemeId: string, configuration: Record<string, unknown>): Promise<CreateThemeResult> {
  try {
    // TODO: implement create_theme
    throw new Error("create_theme not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_theme failed");
  }
}

/** Create theme alias. */
export async function createThemeAlias(awsAccountId: string, themeId: string, aliasName: string, themeVersionNumber: number, regionName?: string): Promise<CreateThemeAliasResult> {
  try {
    // TODO: implement create_theme_alias
    throw new Error("create_theme_alias not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_theme_alias failed");
  }
}

/** Create topic. */
export async function createTopic(awsAccountId: string, topicId: string, topic: Record<string, unknown>): Promise<CreateTopicResult> {
  try {
    // TODO: implement create_topic
    throw new Error("create_topic not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_topic failed");
  }
}

/** Create topic refresh schedule. */
export async function createTopicRefreshSchedule(awsAccountId: string, topicId: string, datasetArn: string, refreshSchedule: Record<string, unknown>): Promise<CreateTopicRefreshScheduleResult> {
  try {
    // TODO: implement create_topic_refresh_schedule
    throw new Error("create_topic_refresh_schedule not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_topic_refresh_schedule failed");
  }
}

/** Create vpc connection. */
export async function createVpcConnection(awsAccountId: string, vpcConnectionId: string, name: string, subnetIds: string[], securityGroupIds: string[], roleArn: string): Promise<CreateVpcConnectionResult> {
  try {
    // TODO: implement create_vpc_connection
    throw new Error("create_vpc_connection not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_vpc_connection failed");
  }
}

/** Delete account custom permission. */
export async function deleteAccountCustomPermission(awsAccountId: string, regionName?: string): Promise<DeleteAccountCustomPermissionResult> {
  try {
    // TODO: implement delete_account_custom_permission
    throw new Error("delete_account_custom_permission not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_account_custom_permission failed");
  }
}

/** Delete account customization. */
export async function deleteAccountCustomization(awsAccountId: string): Promise<DeleteAccountCustomizationResult> {
  try {
    // TODO: implement delete_account_customization
    throw new Error("delete_account_customization not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_account_customization failed");
  }
}

/** Delete account subscription. */
export async function deleteAccountSubscription(awsAccountId: string, regionName?: string): Promise<DeleteAccountSubscriptionResult> {
  try {
    // TODO: implement delete_account_subscription
    throw new Error("delete_account_subscription not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_account_subscription failed");
  }
}

/** Delete action connector. */
export async function deleteActionConnector(awsAccountId: string, actionConnectorId: string, regionName?: string): Promise<DeleteActionConnectorResult> {
  try {
    // TODO: implement delete_action_connector
    throw new Error("delete_action_connector not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_action_connector failed");
  }
}

/** Delete analysis. */
export async function deleteAnalysis(awsAccountId: string, analysisId: string): Promise<DeleteAnalysisResult> {
  try {
    // TODO: implement delete_analysis
    throw new Error("delete_analysis not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_analysis failed");
  }
}

/** Delete brand. */
export async function deleteBrand(awsAccountId: string, brandId: string, regionName?: string): Promise<DeleteBrandResult> {
  try {
    // TODO: implement delete_brand
    throw new Error("delete_brand not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_brand failed");
  }
}

/** Delete brand assignment. */
export async function deleteBrandAssignment(awsAccountId: string, regionName?: string): Promise<DeleteBrandAssignmentResult> {
  try {
    // TODO: implement delete_brand_assignment
    throw new Error("delete_brand_assignment not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_brand_assignment failed");
  }
}

/** Delete custom permissions. */
export async function deleteCustomPermissions(awsAccountId: string, customPermissionsName: string, regionName?: string): Promise<DeleteCustomPermissionsResult> {
  try {
    // TODO: implement delete_custom_permissions
    throw new Error("delete_custom_permissions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_custom_permissions failed");
  }
}

/** Delete data set. */
export async function deleteDataSet(awsAccountId: string, dataSetId: string, regionName?: string): Promise<DeleteDataSetResult> {
  try {
    // TODO: implement delete_data_set
    throw new Error("delete_data_set not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_data_set failed");
  }
}

/** Delete data set refresh properties. */
export async function deleteDataSetRefreshProperties(awsAccountId: string, dataSetId: string, regionName?: string): Promise<DeleteDataSetRefreshPropertiesResult> {
  try {
    // TODO: implement delete_data_set_refresh_properties
    throw new Error("delete_data_set_refresh_properties not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_data_set_refresh_properties failed");
  }
}

/** Delete data source. */
export async function deleteDataSource(awsAccountId: string, dataSourceId: string, regionName?: string): Promise<DeleteDataSourceResult> {
  try {
    // TODO: implement delete_data_source
    throw new Error("delete_data_source not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_data_source failed");
  }
}

/** Delete default q business application. */
export async function deleteDefaultQBusinessApplication(awsAccountId: string): Promise<DeleteDefaultQBusinessApplicationResult> {
  try {
    // TODO: implement delete_default_q_business_application
    throw new Error("delete_default_q_business_application not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_default_q_business_application failed");
  }
}

/** Delete folder. */
export async function deleteFolder(awsAccountId: string, folderId: string, regionName?: string): Promise<DeleteFolderResult> {
  try {
    // TODO: implement delete_folder
    throw new Error("delete_folder not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_folder failed");
  }
}

/** Delete folder membership. */
export async function deleteFolderMembership(awsAccountId: string, folderId: string, memberId: string, memberType: string, regionName?: string): Promise<DeleteFolderMembershipResult> {
  try {
    // TODO: implement delete_folder_membership
    throw new Error("delete_folder_membership not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_folder_membership failed");
  }
}

/** Delete group. */
export async function deleteGroup(groupName: string, awsAccountId: string, namespace: string, regionName?: string): Promise<DeleteGroupResult> {
  try {
    // TODO: implement delete_group
    throw new Error("delete_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_group failed");
  }
}

/** Delete group membership. */
export async function deleteGroupMembership(memberName: string, groupName: string, awsAccountId: string, namespace: string, regionName?: string): Promise<DeleteGroupMembershipResult> {
  try {
    // TODO: implement delete_group_membership
    throw new Error("delete_group_membership not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_group_membership failed");
  }
}

/** Delete iam policy assignment. */
export async function deleteIamPolicyAssignment(awsAccountId: string, assignmentName: string, namespace: string, regionName?: string): Promise<DeleteIamPolicyAssignmentResult> {
  try {
    // TODO: implement delete_iam_policy_assignment
    throw new Error("delete_iam_policy_assignment not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_iam_policy_assignment failed");
  }
}

/** Delete identity propagation config. */
export async function deleteIdentityPropagationConfig(awsAccountId: string, service: string, regionName?: string): Promise<DeleteIdentityPropagationConfigResult> {
  try {
    // TODO: implement delete_identity_propagation_config
    throw new Error("delete_identity_propagation_config not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_identity_propagation_config failed");
  }
}

/** Delete namespace. */
export async function deleteNamespace(awsAccountId: string, namespace: string, regionName?: string): Promise<DeleteNamespaceResult> {
  try {
    // TODO: implement delete_namespace
    throw new Error("delete_namespace not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_namespace failed");
  }
}

/** Delete refresh schedule. */
export async function deleteRefreshSchedule(dataSetId: string, awsAccountId: string, scheduleId: string, regionName?: string): Promise<DeleteRefreshScheduleResult> {
  try {
    // TODO: implement delete_refresh_schedule
    throw new Error("delete_refresh_schedule not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_refresh_schedule failed");
  }
}

/** Delete role custom permission. */
export async function deleteRoleCustomPermission(role: string, awsAccountId: string, namespace: string, regionName?: string): Promise<DeleteRoleCustomPermissionResult> {
  try {
    // TODO: implement delete_role_custom_permission
    throw new Error("delete_role_custom_permission not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_role_custom_permission failed");
  }
}

/** Delete role membership. */
export async function deleteRoleMembership(memberName: string, role: string, awsAccountId: string, namespace: string, regionName?: string): Promise<DeleteRoleMembershipResult> {
  try {
    // TODO: implement delete_role_membership
    throw new Error("delete_role_membership not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_role_membership failed");
  }
}

/** Delete template. */
export async function deleteTemplate(awsAccountId: string, templateId: string): Promise<DeleteTemplateResult> {
  try {
    // TODO: implement delete_template
    throw new Error("delete_template not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_template failed");
  }
}

/** Delete template alias. */
export async function deleteTemplateAlias(awsAccountId: string, templateId: string, aliasName: string, regionName?: string): Promise<DeleteTemplateAliasResult> {
  try {
    // TODO: implement delete_template_alias
    throw new Error("delete_template_alias not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_template_alias failed");
  }
}

/** Delete theme. */
export async function deleteTheme(awsAccountId: string, themeId: string): Promise<DeleteThemeResult> {
  try {
    // TODO: implement delete_theme
    throw new Error("delete_theme not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_theme failed");
  }
}

/** Delete theme alias. */
export async function deleteThemeAlias(awsAccountId: string, themeId: string, aliasName: string, regionName?: string): Promise<DeleteThemeAliasResult> {
  try {
    // TODO: implement delete_theme_alias
    throw new Error("delete_theme_alias not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_theme_alias failed");
  }
}

/** Delete topic. */
export async function deleteTopic(awsAccountId: string, topicId: string, regionName?: string): Promise<DeleteTopicResult> {
  try {
    // TODO: implement delete_topic
    throw new Error("delete_topic not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_topic failed");
  }
}

/** Delete topic refresh schedule. */
export async function deleteTopicRefreshSchedule(awsAccountId: string, topicId: string, datasetId: string, regionName?: string): Promise<DeleteTopicRefreshScheduleResult> {
  try {
    // TODO: implement delete_topic_refresh_schedule
    throw new Error("delete_topic_refresh_schedule not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_topic_refresh_schedule failed");
  }
}

/** Delete user by principal id. */
export async function deleteUserByPrincipalId(principalId: string, awsAccountId: string, namespace: string, regionName?: string): Promise<DeleteUserByPrincipalIdResult> {
  try {
    // TODO: implement delete_user_by_principal_id
    throw new Error("delete_user_by_principal_id not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_user_by_principal_id failed");
  }
}

/** Delete user custom permission. */
export async function deleteUserCustomPermission(userName: string, awsAccountId: string, namespace: string, regionName?: string): Promise<DeleteUserCustomPermissionResult> {
  try {
    // TODO: implement delete_user_custom_permission
    throw new Error("delete_user_custom_permission not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_user_custom_permission failed");
  }
}

/** Delete vpc connection. */
export async function deleteVpcConnection(awsAccountId: string, vpcConnectionId: string, regionName?: string): Promise<DeleteVpcConnectionResult> {
  try {
    // TODO: implement delete_vpc_connection
    throw new Error("delete_vpc_connection not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_vpc_connection failed");
  }
}

/** Describe account custom permission. */
export async function describeAccountCustomPermission(awsAccountId: string, regionName?: string): Promise<DescribeAccountCustomPermissionResult> {
  try {
    // TODO: implement describe_account_custom_permission
    throw new Error("describe_account_custom_permission not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_account_custom_permission failed");
  }
}

/** Describe account customization. */
export async function describeAccountCustomization(awsAccountId: string): Promise<DescribeAccountCustomizationResult> {
  try {
    // TODO: implement describe_account_customization
    throw new Error("describe_account_customization not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_account_customization failed");
  }
}

/** Describe account settings. */
export async function describeAccountSettings(awsAccountId: string, regionName?: string): Promise<DescribeAccountSettingsResult> {
  try {
    // TODO: implement describe_account_settings
    throw new Error("describe_account_settings not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_account_settings failed");
  }
}

/** Describe account subscription. */
export async function describeAccountSubscription(awsAccountId: string, regionName?: string): Promise<DescribeAccountSubscriptionResult> {
  try {
    // TODO: implement describe_account_subscription
    throw new Error("describe_account_subscription not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_account_subscription failed");
  }
}

/** Describe action connector. */
export async function describeActionConnector(awsAccountId: string, actionConnectorId: string, regionName?: string): Promise<DescribeActionConnectorResult> {
  try {
    // TODO: implement describe_action_connector
    throw new Error("describe_action_connector not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_action_connector failed");
  }
}

/** Describe action connector permissions. */
export async function describeActionConnectorPermissions(awsAccountId: string, actionConnectorId: string, regionName?: string): Promise<DescribeActionConnectorPermissionsResult> {
  try {
    // TODO: implement describe_action_connector_permissions
    throw new Error("describe_action_connector_permissions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_action_connector_permissions failed");
  }
}

/** Describe analysis. */
export async function describeAnalysis(awsAccountId: string, analysisId: string, regionName?: string): Promise<DescribeAnalysisResult> {
  try {
    // TODO: implement describe_analysis
    throw new Error("describe_analysis not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_analysis failed");
  }
}

/** Describe analysis definition. */
export async function describeAnalysisDefinition(awsAccountId: string, analysisId: string, regionName?: string): Promise<DescribeAnalysisDefinitionResult> {
  try {
    // TODO: implement describe_analysis_definition
    throw new Error("describe_analysis_definition not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_analysis_definition failed");
  }
}

/** Describe analysis permissions. */
export async function describeAnalysisPermissions(awsAccountId: string, analysisId: string, regionName?: string): Promise<DescribeAnalysisPermissionsResult> {
  try {
    // TODO: implement describe_analysis_permissions
    throw new Error("describe_analysis_permissions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_analysis_permissions failed");
  }
}

/** Describe asset bundle export job. */
export async function describeAssetBundleExportJob(awsAccountId: string, assetBundleExportJobId: string, regionName?: string): Promise<DescribeAssetBundleExportJobResult> {
  try {
    // TODO: implement describe_asset_bundle_export_job
    throw new Error("describe_asset_bundle_export_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_asset_bundle_export_job failed");
  }
}

/** Describe asset bundle import job. */
export async function describeAssetBundleImportJob(awsAccountId: string, assetBundleImportJobId: string, regionName?: string): Promise<DescribeAssetBundleImportJobResult> {
  try {
    // TODO: implement describe_asset_bundle_import_job
    throw new Error("describe_asset_bundle_import_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_asset_bundle_import_job failed");
  }
}

/** Describe brand. */
export async function describeBrand(awsAccountId: string, brandId: string): Promise<DescribeBrandResult> {
  try {
    // TODO: implement describe_brand
    throw new Error("describe_brand not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_brand failed");
  }
}

/** Describe brand assignment. */
export async function describeBrandAssignment(awsAccountId: string, regionName?: string): Promise<DescribeBrandAssignmentResult> {
  try {
    // TODO: implement describe_brand_assignment
    throw new Error("describe_brand_assignment not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_brand_assignment failed");
  }
}

/** Describe brand published version. */
export async function describeBrandPublishedVersion(awsAccountId: string, brandId: string, regionName?: string): Promise<DescribeBrandPublishedVersionResult> {
  try {
    // TODO: implement describe_brand_published_version
    throw new Error("describe_brand_published_version not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_brand_published_version failed");
  }
}

/** Describe custom permissions. */
export async function describeCustomPermissions(awsAccountId: string, customPermissionsName: string, regionName?: string): Promise<DescribeCustomPermissionsResult> {
  try {
    // TODO: implement describe_custom_permissions
    throw new Error("describe_custom_permissions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_custom_permissions failed");
  }
}

/** Describe dashboard definition. */
export async function describeDashboardDefinition(awsAccountId: string, dashboardId: string): Promise<DescribeDashboardDefinitionResult> {
  try {
    // TODO: implement describe_dashboard_definition
    throw new Error("describe_dashboard_definition not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_dashboard_definition failed");
  }
}

/** Describe dashboard permissions. */
export async function describeDashboardPermissions(awsAccountId: string, dashboardId: string, regionName?: string): Promise<DescribeDashboardPermissionsResult> {
  try {
    // TODO: implement describe_dashboard_permissions
    throw new Error("describe_dashboard_permissions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_dashboard_permissions failed");
  }
}

/** Describe dashboard snapshot job. */
export async function describeDashboardSnapshotJob(awsAccountId: string, dashboardId: string, snapshotJobId: string, regionName?: string): Promise<DescribeDashboardSnapshotJobResult> {
  try {
    // TODO: implement describe_dashboard_snapshot_job
    throw new Error("describe_dashboard_snapshot_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_dashboard_snapshot_job failed");
  }
}

/** Describe dashboard snapshot job result. */
export async function describeDashboardSnapshotJobResult(awsAccountId: string, dashboardId: string, snapshotJobId: string, regionName?: string): Promise<DescribeDashboardSnapshotJobResultResult> {
  try {
    // TODO: implement describe_dashboard_snapshot_job_result
    throw new Error("describe_dashboard_snapshot_job_result not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_dashboard_snapshot_job_result failed");
  }
}

/** Describe dashboards qa configuration. */
export async function describeDashboardsQaConfiguration(awsAccountId: string, regionName?: string): Promise<DescribeDashboardsQaConfigurationResult> {
  try {
    // TODO: implement describe_dashboards_qa_configuration
    throw new Error("describe_dashboards_qa_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_dashboards_qa_configuration failed");
  }
}

/** Describe data set. */
export async function describeDataSet(awsAccountId: string, dataSetId: string, regionName?: string): Promise<DescribeDataSetResult> {
  try {
    // TODO: implement describe_data_set
    throw new Error("describe_data_set not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_data_set failed");
  }
}

/** Describe data set permissions. */
export async function describeDataSetPermissions(awsAccountId: string, dataSetId: string, regionName?: string): Promise<DescribeDataSetPermissionsResult> {
  try {
    // TODO: implement describe_data_set_permissions
    throw new Error("describe_data_set_permissions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_data_set_permissions failed");
  }
}

/** Describe data set refresh properties. */
export async function describeDataSetRefreshProperties(awsAccountId: string, dataSetId: string, regionName?: string): Promise<DescribeDataSetRefreshPropertiesResult> {
  try {
    // TODO: implement describe_data_set_refresh_properties
    throw new Error("describe_data_set_refresh_properties not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_data_set_refresh_properties failed");
  }
}

/** Describe data source. */
export async function describeDataSource(awsAccountId: string, dataSourceId: string, regionName?: string): Promise<DescribeDataSourceResult> {
  try {
    // TODO: implement describe_data_source
    throw new Error("describe_data_source not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_data_source failed");
  }
}

/** Describe data source permissions. */
export async function describeDataSourcePermissions(awsAccountId: string, dataSourceId: string, regionName?: string): Promise<DescribeDataSourcePermissionsResult> {
  try {
    // TODO: implement describe_data_source_permissions
    throw new Error("describe_data_source_permissions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_data_source_permissions failed");
  }
}

/** Describe default q business application. */
export async function describeDefaultQBusinessApplication(awsAccountId: string): Promise<DescribeDefaultQBusinessApplicationResult> {
  try {
    // TODO: implement describe_default_q_business_application
    throw new Error("describe_default_q_business_application not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_default_q_business_application failed");
  }
}

/** Describe folder. */
export async function describeFolder(awsAccountId: string, folderId: string, regionName?: string): Promise<DescribeFolderResult> {
  try {
    // TODO: implement describe_folder
    throw new Error("describe_folder not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_folder failed");
  }
}

/** Describe folder permissions. */
export async function describeFolderPermissions(awsAccountId: string, folderId: string): Promise<DescribeFolderPermissionsResult> {
  try {
    // TODO: implement describe_folder_permissions
    throw new Error("describe_folder_permissions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_folder_permissions failed");
  }
}

/** Describe folder resolved permissions. */
export async function describeFolderResolvedPermissions(awsAccountId: string, folderId: string): Promise<DescribeFolderResolvedPermissionsResult> {
  try {
    // TODO: implement describe_folder_resolved_permissions
    throw new Error("describe_folder_resolved_permissions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_folder_resolved_permissions failed");
  }
}

/** Describe group. */
export async function describeGroup(groupName: string, awsAccountId: string, namespace: string, regionName?: string): Promise<DescribeGroupResult> {
  try {
    // TODO: implement describe_group
    throw new Error("describe_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_group failed");
  }
}

/** Describe group membership. */
export async function describeGroupMembership(memberName: string, groupName: string, awsAccountId: string, namespace: string, regionName?: string): Promise<DescribeGroupMembershipResult> {
  try {
    // TODO: implement describe_group_membership
    throw new Error("describe_group_membership not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_group_membership failed");
  }
}

/** Describe iam policy assignment. */
export async function describeIamPolicyAssignment(awsAccountId: string, assignmentName: string, namespace: string, regionName?: string): Promise<DescribeIamPolicyAssignmentResult> {
  try {
    // TODO: implement describe_iam_policy_assignment
    throw new Error("describe_iam_policy_assignment not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_iam_policy_assignment failed");
  }
}

/** Describe ingestion. */
export async function describeIngestion(awsAccountId: string, dataSetId: string, ingestionId: string, regionName?: string): Promise<DescribeIngestionResult> {
  try {
    // TODO: implement describe_ingestion
    throw new Error("describe_ingestion not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_ingestion failed");
  }
}

/** Describe ip restriction. */
export async function describeIpRestriction(awsAccountId: string, regionName?: string): Promise<DescribeIpRestrictionResult> {
  try {
    // TODO: implement describe_ip_restriction
    throw new Error("describe_ip_restriction not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_ip_restriction failed");
  }
}

/** Describe key registration. */
export async function describeKeyRegistration(awsAccountId: string): Promise<DescribeKeyRegistrationResult> {
  try {
    // TODO: implement describe_key_registration
    throw new Error("describe_key_registration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_key_registration failed");
  }
}

/** Describe namespace. */
export async function describeNamespace(awsAccountId: string, namespace: string, regionName?: string): Promise<DescribeNamespaceResult> {
  try {
    // TODO: implement describe_namespace
    throw new Error("describe_namespace not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_namespace failed");
  }
}

/** Describe q personalization configuration. */
export async function describeQPersonalizationConfiguration(awsAccountId: string, regionName?: string): Promise<DescribeQPersonalizationConfigurationResult> {
  try {
    // TODO: implement describe_q_personalization_configuration
    throw new Error("describe_q_personalization_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_q_personalization_configuration failed");
  }
}

/** Describe quick sight q search configuration. */
export async function describeQuickSightQSearchConfiguration(awsAccountId: string, regionName?: string): Promise<DescribeQuickSightQSearchConfigurationResult> {
  try {
    // TODO: implement describe_quick_sight_q_search_configuration
    throw new Error("describe_quick_sight_q_search_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_quick_sight_q_search_configuration failed");
  }
}

/** Describe refresh schedule. */
export async function describeRefreshSchedule(awsAccountId: string, dataSetId: string, scheduleId: string, regionName?: string): Promise<DescribeRefreshScheduleResult> {
  try {
    // TODO: implement describe_refresh_schedule
    throw new Error("describe_refresh_schedule not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_refresh_schedule failed");
  }
}

/** Describe role custom permission. */
export async function describeRoleCustomPermission(role: string, awsAccountId: string, namespace: string, regionName?: string): Promise<DescribeRoleCustomPermissionResult> {
  try {
    // TODO: implement describe_role_custom_permission
    throw new Error("describe_role_custom_permission not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_role_custom_permission failed");
  }
}

/** Describe template. */
export async function describeTemplate(awsAccountId: string, templateId: string): Promise<DescribeTemplateResult> {
  try {
    // TODO: implement describe_template
    throw new Error("describe_template not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_template failed");
  }
}

/** Describe template alias. */
export async function describeTemplateAlias(awsAccountId: string, templateId: string, aliasName: string, regionName?: string): Promise<DescribeTemplateAliasResult> {
  try {
    // TODO: implement describe_template_alias
    throw new Error("describe_template_alias not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_template_alias failed");
  }
}

/** Describe template definition. */
export async function describeTemplateDefinition(awsAccountId: string, templateId: string): Promise<DescribeTemplateDefinitionResult> {
  try {
    // TODO: implement describe_template_definition
    throw new Error("describe_template_definition not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_template_definition failed");
  }
}

/** Describe template permissions. */
export async function describeTemplatePermissions(awsAccountId: string, templateId: string, regionName?: string): Promise<DescribeTemplatePermissionsResult> {
  try {
    // TODO: implement describe_template_permissions
    throw new Error("describe_template_permissions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_template_permissions failed");
  }
}

/** Describe theme. */
export async function describeTheme(awsAccountId: string, themeId: string): Promise<DescribeThemeResult> {
  try {
    // TODO: implement describe_theme
    throw new Error("describe_theme not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_theme failed");
  }
}

/** Describe theme alias. */
export async function describeThemeAlias(awsAccountId: string, themeId: string, aliasName: string, regionName?: string): Promise<DescribeThemeAliasResult> {
  try {
    // TODO: implement describe_theme_alias
    throw new Error("describe_theme_alias not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_theme_alias failed");
  }
}

/** Describe theme permissions. */
export async function describeThemePermissions(awsAccountId: string, themeId: string, regionName?: string): Promise<DescribeThemePermissionsResult> {
  try {
    // TODO: implement describe_theme_permissions
    throw new Error("describe_theme_permissions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_theme_permissions failed");
  }
}

/** Describe topic. */
export async function describeTopic(awsAccountId: string, topicId: string, regionName?: string): Promise<DescribeTopicResult> {
  try {
    // TODO: implement describe_topic
    throw new Error("describe_topic not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_topic failed");
  }
}

/** Describe topic permissions. */
export async function describeTopicPermissions(awsAccountId: string, topicId: string, regionName?: string): Promise<DescribeTopicPermissionsResult> {
  try {
    // TODO: implement describe_topic_permissions
    throw new Error("describe_topic_permissions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_topic_permissions failed");
  }
}

/** Describe topic refresh. */
export async function describeTopicRefresh(awsAccountId: string, topicId: string, refreshId: string, regionName?: string): Promise<DescribeTopicRefreshResult> {
  try {
    // TODO: implement describe_topic_refresh
    throw new Error("describe_topic_refresh not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_topic_refresh failed");
  }
}

/** Describe topic refresh schedule. */
export async function describeTopicRefreshSchedule(awsAccountId: string, topicId: string, datasetId: string, regionName?: string): Promise<DescribeTopicRefreshScheduleResult> {
  try {
    // TODO: implement describe_topic_refresh_schedule
    throw new Error("describe_topic_refresh_schedule not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_topic_refresh_schedule failed");
  }
}

/** Describe vpc connection. */
export async function describeVpcConnection(awsAccountId: string, vpcConnectionId: string, regionName?: string): Promise<DescribeVpcConnectionResult> {
  try {
    // TODO: implement describe_vpc_connection
    throw new Error("describe_vpc_connection not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_vpc_connection failed");
  }
}

/** Generate embed url for anonymous user. */
export async function generateEmbedUrlForAnonymousUser(awsAccountId: string, namespace: string, authorizedResourceArns: string[], experienceConfiguration: Record<string, unknown>): Promise<GenerateEmbedUrlForAnonymousUserResult> {
  try {
    // TODO: implement generate_embed_url_for_anonymous_user
    throw new Error("generate_embed_url_for_anonymous_user not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "generate_embed_url_for_anonymous_user failed");
  }
}

/** Generate embed url for registered user. */
export async function generateEmbedUrlForRegisteredUser(awsAccountId: string, userArn: string, experienceConfiguration: Record<string, unknown>): Promise<GenerateEmbedUrlForRegisteredUserResult> {
  try {
    // TODO: implement generate_embed_url_for_registered_user
    throw new Error("generate_embed_url_for_registered_user not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "generate_embed_url_for_registered_user failed");
  }
}

/** Generate embed url for registered user with identity. */
export async function generateEmbedUrlForRegisteredUserWithIdentity(awsAccountId: string, experienceConfiguration: Record<string, unknown>): Promise<GenerateEmbedUrlForRegisteredUserWithIdentityResult> {
  try {
    // TODO: implement generate_embed_url_for_registered_user_with_identity
    throw new Error("generate_embed_url_for_registered_user_with_identity not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "generate_embed_url_for_registered_user_with_identity failed");
  }
}

/** Get dashboard embed url. */
export async function getDashboardEmbedUrl(awsAccountId: string, dashboardId: string, identityType: string): Promise<GetDashboardEmbedUrlResult> {
  try {
    // TODO: implement get_dashboard_embed_url
    throw new Error("get_dashboard_embed_url not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_dashboard_embed_url failed");
  }
}

/** Get flow metadata. */
export async function getFlowMetadata(awsAccountId: string, flowId: string, regionName?: string): Promise<GetFlowMetadataResult> {
  try {
    // TODO: implement get_flow_metadata
    throw new Error("get_flow_metadata not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_flow_metadata failed");
  }
}

/** Get flow permissions. */
export async function getFlowPermissions(awsAccountId: string, flowId: string, regionName?: string): Promise<GetFlowPermissionsResult> {
  try {
    // TODO: implement get_flow_permissions
    throw new Error("get_flow_permissions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_flow_permissions failed");
  }
}

/** Get session embed url. */
export async function getSessionEmbedUrl(awsAccountId: string): Promise<GetSessionEmbedUrlResult> {
  try {
    // TODO: implement get_session_embed_url
    throw new Error("get_session_embed_url not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_session_embed_url failed");
  }
}

/** List action connectors. */
export async function listActionConnectors(awsAccountId: string): Promise<ListActionConnectorsResult> {
  try {
    // TODO: implement list_action_connectors
    throw new Error("list_action_connectors not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_action_connectors failed");
  }
}

/** List asset bundle export jobs. */
export async function listAssetBundleExportJobs(awsAccountId: string): Promise<ListAssetBundleExportJobsResult> {
  try {
    // TODO: implement list_asset_bundle_export_jobs
    throw new Error("list_asset_bundle_export_jobs not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_asset_bundle_export_jobs failed");
  }
}

/** List asset bundle import jobs. */
export async function listAssetBundleImportJobs(awsAccountId: string): Promise<ListAssetBundleImportJobsResult> {
  try {
    // TODO: implement list_asset_bundle_import_jobs
    throw new Error("list_asset_bundle_import_jobs not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_asset_bundle_import_jobs failed");
  }
}

/** List brands. */
export async function listBrands(awsAccountId: string): Promise<ListBrandsResult> {
  try {
    // TODO: implement list_brands
    throw new Error("list_brands not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_brands failed");
  }
}

/** List custom permissions. */
export async function listCustomPermissions(awsAccountId: string): Promise<ListCustomPermissionsResult> {
  try {
    // TODO: implement list_custom_permissions
    throw new Error("list_custom_permissions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_custom_permissions failed");
  }
}

/** List dashboard versions. */
export async function listDashboardVersions(awsAccountId: string, dashboardId: string): Promise<ListDashboardVersionsResult> {
  try {
    // TODO: implement list_dashboard_versions
    throw new Error("list_dashboard_versions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_dashboard_versions failed");
  }
}

/** List data sets. */
export async function listDataSets(awsAccountId: string): Promise<ListDataSetsResult> {
  try {
    // TODO: implement list_data_sets
    throw new Error("list_data_sets not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_data_sets failed");
  }
}

/** List flows. */
export async function listFlows(awsAccountId: string): Promise<ListFlowsResult> {
  try {
    // TODO: implement list_flows
    throw new Error("list_flows not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_flows failed");
  }
}

/** List folder members. */
export async function listFolderMembers(awsAccountId: string, folderId: string): Promise<ListFolderMembersResult> {
  try {
    // TODO: implement list_folder_members
    throw new Error("list_folder_members not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_folder_members failed");
  }
}

/** List folders. */
export async function listFolders(awsAccountId: string): Promise<ListFoldersResult> {
  try {
    // TODO: implement list_folders
    throw new Error("list_folders not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_folders failed");
  }
}

/** List folders for resource. */
export async function listFoldersForResource(awsAccountId: string, resourceArn: string): Promise<ListFoldersForResourceResult> {
  try {
    // TODO: implement list_folders_for_resource
    throw new Error("list_folders_for_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_folders_for_resource failed");
  }
}

/** List group memberships. */
export async function listGroupMemberships(groupName: string, awsAccountId: string, namespace: string): Promise<ListGroupMembershipsResult> {
  try {
    // TODO: implement list_group_memberships
    throw new Error("list_group_memberships not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_group_memberships failed");
  }
}

/** List groups. */
export async function listGroups(awsAccountId: string, namespace: string): Promise<ListGroupsResult> {
  try {
    // TODO: implement list_groups
    throw new Error("list_groups not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_groups failed");
  }
}

/** List iam policy assignments. */
export async function listIamPolicyAssignments(awsAccountId: string, namespace: string): Promise<ListIamPolicyAssignmentsResult> {
  try {
    // TODO: implement list_iam_policy_assignments
    throw new Error("list_iam_policy_assignments not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_iam_policy_assignments failed");
  }
}

/** List iam policy assignments for user. */
export async function listIamPolicyAssignmentsForUser(awsAccountId: string, userName: string, namespace: string): Promise<ListIamPolicyAssignmentsForUserResult> {
  try {
    // TODO: implement list_iam_policy_assignments_for_user
    throw new Error("list_iam_policy_assignments_for_user not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_iam_policy_assignments_for_user failed");
  }
}

/** List identity propagation configs. */
export async function listIdentityPropagationConfigs(awsAccountId: string): Promise<ListIdentityPropagationConfigsResult> {
  try {
    // TODO: implement list_identity_propagation_configs
    throw new Error("list_identity_propagation_configs not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_identity_propagation_configs failed");
  }
}

/** List ingestions. */
export async function listIngestions(dataSetId: string, awsAccountId: string): Promise<ListIngestionsResult> {
  try {
    // TODO: implement list_ingestions
    throw new Error("list_ingestions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_ingestions failed");
  }
}

/** List namespaces. */
export async function listNamespaces(awsAccountId: string): Promise<ListNamespacesResult> {
  try {
    // TODO: implement list_namespaces
    throw new Error("list_namespaces not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_namespaces failed");
  }
}

/** List refresh schedules. */
export async function listRefreshSchedules(awsAccountId: string, dataSetId: string, regionName?: string): Promise<ListRefreshSchedulesResult> {
  try {
    // TODO: implement list_refresh_schedules
    throw new Error("list_refresh_schedules not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_refresh_schedules failed");
  }
}

/** List role memberships. */
export async function listRoleMemberships(role: string, awsAccountId: string, namespace: string): Promise<ListRoleMembershipsResult> {
  try {
    // TODO: implement list_role_memberships
    throw new Error("list_role_memberships not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_role_memberships failed");
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

/** List template aliases. */
export async function listTemplateAliases(awsAccountId: string, templateId: string): Promise<ListTemplateAliasesResult> {
  try {
    // TODO: implement list_template_aliases
    throw new Error("list_template_aliases not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_template_aliases failed");
  }
}

/** List template versions. */
export async function listTemplateVersions(awsAccountId: string, templateId: string): Promise<ListTemplateVersionsResult> {
  try {
    // TODO: implement list_template_versions
    throw new Error("list_template_versions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_template_versions failed");
  }
}

/** List templates. */
export async function listTemplates(awsAccountId: string): Promise<ListTemplatesResult> {
  try {
    // TODO: implement list_templates
    throw new Error("list_templates not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_templates failed");
  }
}

/** List theme aliases. */
export async function listThemeAliases(awsAccountId: string, themeId: string): Promise<ListThemeAliasesResult> {
  try {
    // TODO: implement list_theme_aliases
    throw new Error("list_theme_aliases not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_theme_aliases failed");
  }
}

/** List theme versions. */
export async function listThemeVersions(awsAccountId: string, themeId: string): Promise<ListThemeVersionsResult> {
  try {
    // TODO: implement list_theme_versions
    throw new Error("list_theme_versions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_theme_versions failed");
  }
}

/** List themes. */
export async function listThemes(awsAccountId: string): Promise<ListThemesResult> {
  try {
    // TODO: implement list_themes
    throw new Error("list_themes not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_themes failed");
  }
}

/** List topic refresh schedules. */
export async function listTopicRefreshSchedules(awsAccountId: string, topicId: string, regionName?: string): Promise<ListTopicRefreshSchedulesResult> {
  try {
    // TODO: implement list_topic_refresh_schedules
    throw new Error("list_topic_refresh_schedules not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_topic_refresh_schedules failed");
  }
}

/** List topic reviewed answers. */
export async function listTopicReviewedAnswers(awsAccountId: string, topicId: string, regionName?: string): Promise<ListTopicReviewedAnswersResult> {
  try {
    // TODO: implement list_topic_reviewed_answers
    throw new Error("list_topic_reviewed_answers not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_topic_reviewed_answers failed");
  }
}

/** List topics. */
export async function listTopics(awsAccountId: string): Promise<ListTopicsResult> {
  try {
    // TODO: implement list_topics
    throw new Error("list_topics not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_topics failed");
  }
}

/** List user groups. */
export async function listUserGroups(userName: string, awsAccountId: string, namespace: string): Promise<ListUserGroupsResult> {
  try {
    // TODO: implement list_user_groups
    throw new Error("list_user_groups not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_user_groups failed");
  }
}

/** List vpc connections. */
export async function listVpcConnections(awsAccountId: string): Promise<ListVpcConnectionsResult> {
  try {
    // TODO: implement list_vpc_connections
    throw new Error("list_vpc_connections not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_vpc_connections failed");
  }
}

/** Predict qa results. */
export async function predictQaResults(awsAccountId: string, queryText: string): Promise<PredictQaResultsResult> {
  try {
    // TODO: implement predict_qa_results
    throw new Error("predict_qa_results not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "predict_qa_results failed");
  }
}

/** Put data set refresh properties. */
export async function putDataSetRefreshProperties(awsAccountId: string, dataSetId: string, dataSetRefreshProperties: Record<string, unknown>, regionName?: string): Promise<PutDataSetRefreshPropertiesResult> {
  try {
    // TODO: implement put_data_set_refresh_properties
    throw new Error("put_data_set_refresh_properties not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_data_set_refresh_properties failed");
  }
}

/** Restore analysis. */
export async function restoreAnalysis(awsAccountId: string, analysisId: string): Promise<RestoreAnalysisResult> {
  try {
    // TODO: implement restore_analysis
    throw new Error("restore_analysis not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "restore_analysis failed");
  }
}

/** Search action connectors. */
export async function searchActionConnectors(awsAccountId: string, filters: Record<string, unknown>[]): Promise<SearchActionConnectorsResult> {
  try {
    // TODO: implement search_action_connectors
    throw new Error("search_action_connectors not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "search_action_connectors failed");
  }
}

/** Search analyses. */
export async function searchAnalyses(awsAccountId: string, filters: Record<string, unknown>[]): Promise<SearchAnalysesResult> {
  try {
    // TODO: implement search_analyses
    throw new Error("search_analyses not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "search_analyses failed");
  }
}

/** Search dashboards. */
export async function searchDashboards(awsAccountId: string, filters: Record<string, unknown>[]): Promise<SearchDashboardsResult> {
  try {
    // TODO: implement search_dashboards
    throw new Error("search_dashboards not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "search_dashboards failed");
  }
}

/** Search data sets. */
export async function searchDataSets(awsAccountId: string, filters: Record<string, unknown>[]): Promise<SearchDataSetsResult> {
  try {
    // TODO: implement search_data_sets
    throw new Error("search_data_sets not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "search_data_sets failed");
  }
}

/** Search data sources. */
export async function searchDataSources(awsAccountId: string, filters: Record<string, unknown>[]): Promise<SearchDataSourcesResult> {
  try {
    // TODO: implement search_data_sources
    throw new Error("search_data_sources not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "search_data_sources failed");
  }
}

/** Search flows. */
export async function searchFlows(awsAccountId: string, filters: Record<string, unknown>[]): Promise<SearchFlowsResult> {
  try {
    // TODO: implement search_flows
    throw new Error("search_flows not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "search_flows failed");
  }
}

/** Search folders. */
export async function searchFolders(awsAccountId: string, filters: Record<string, unknown>[]): Promise<SearchFoldersResult> {
  try {
    // TODO: implement search_folders
    throw new Error("search_folders not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "search_folders failed");
  }
}

/** Search groups. */
export async function searchGroups(awsAccountId: string, namespace: string, filters: Record<string, unknown>[]): Promise<SearchGroupsResult> {
  try {
    // TODO: implement search_groups
    throw new Error("search_groups not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "search_groups failed");
  }
}

/** Search topics. */
export async function searchTopics(awsAccountId: string, filters: Record<string, unknown>[]): Promise<SearchTopicsResult> {
  try {
    // TODO: implement search_topics
    throw new Error("search_topics not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "search_topics failed");
  }
}

/** Start asset bundle export job. */
export async function startAssetBundleExportJob(awsAccountId: string, assetBundleExportJobId: string, resourceArns: string[], exportFormat: string): Promise<StartAssetBundleExportJobResult> {
  try {
    // TODO: implement start_asset_bundle_export_job
    throw new Error("start_asset_bundle_export_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_asset_bundle_export_job failed");
  }
}

/** Start asset bundle import job. */
export async function startAssetBundleImportJob(awsAccountId: string, assetBundleImportJobId: string, assetBundleImportSource: Record<string, unknown>): Promise<StartAssetBundleImportJobResult> {
  try {
    // TODO: implement start_asset_bundle_import_job
    throw new Error("start_asset_bundle_import_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_asset_bundle_import_job failed");
  }
}

/** Start dashboard snapshot job. */
export async function startDashboardSnapshotJob(awsAccountId: string, dashboardId: string, snapshotJobId: string, userConfiguration: Record<string, unknown>, snapshotConfiguration: Record<string, unknown>, regionName?: string): Promise<StartDashboardSnapshotJobResult> {
  try {
    // TODO: implement start_dashboard_snapshot_job
    throw new Error("start_dashboard_snapshot_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_dashboard_snapshot_job failed");
  }
}

/** Start dashboard snapshot job schedule. */
export async function startDashboardSnapshotJobSchedule(awsAccountId: string, dashboardId: string, scheduleId: string, regionName?: string): Promise<StartDashboardSnapshotJobScheduleResult> {
  try {
    // TODO: implement start_dashboard_snapshot_job_schedule
    throw new Error("start_dashboard_snapshot_job_schedule not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_dashboard_snapshot_job_schedule failed");
  }
}

/** Tag resource. */
export async function tagResource(resourceArn: string, tags: Record<string, unknown>[], regionName?: string): Promise<TagResourceResult> {
  try {
    // TODO: implement tag_resource
    throw new Error("tag_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "tag_resource failed");
  }
}

/** Untag resource. */
export async function untagResource(resourceArn: string, tagKeys: string[], regionName?: string): Promise<UntagResourceResult> {
  try {
    // TODO: implement untag_resource
    throw new Error("untag_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "untag_resource failed");
  }
}

/** Update account custom permission. */
export async function updateAccountCustomPermission(customPermissionsName: string, awsAccountId: string, regionName?: string): Promise<UpdateAccountCustomPermissionResult> {
  try {
    // TODO: implement update_account_custom_permission
    throw new Error("update_account_custom_permission not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_account_custom_permission failed");
  }
}

/** Update account customization. */
export async function updateAccountCustomization(awsAccountId: string, accountCustomization: Record<string, unknown>): Promise<UpdateAccountCustomizationResult> {
  try {
    // TODO: implement update_account_customization
    throw new Error("update_account_customization not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_account_customization failed");
  }
}

/** Update account settings. */
export async function updateAccountSettings(awsAccountId: string, defaultNamespace: string): Promise<UpdateAccountSettingsResult> {
  try {
    // TODO: implement update_account_settings
    throw new Error("update_account_settings not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_account_settings failed");
  }
}

/** Update action connector. */
export async function updateActionConnector(awsAccountId: string, actionConnectorId: string, name: string, authenticationConfig: Record<string, unknown>): Promise<UpdateActionConnectorResult> {
  try {
    // TODO: implement update_action_connector
    throw new Error("update_action_connector not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_action_connector failed");
  }
}

/** Update action connector permissions. */
export async function updateActionConnectorPermissions(awsAccountId: string, actionConnectorId: string): Promise<UpdateActionConnectorPermissionsResult> {
  try {
    // TODO: implement update_action_connector_permissions
    throw new Error("update_action_connector_permissions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_action_connector_permissions failed");
  }
}

/** Update analysis. */
export async function updateAnalysis(awsAccountId: string, analysisId: string, name: string): Promise<UpdateAnalysisResult> {
  try {
    // TODO: implement update_analysis
    throw new Error("update_analysis not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_analysis failed");
  }
}

/** Update analysis permissions. */
export async function updateAnalysisPermissions(awsAccountId: string, analysisId: string): Promise<UpdateAnalysisPermissionsResult> {
  try {
    // TODO: implement update_analysis_permissions
    throw new Error("update_analysis_permissions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_analysis_permissions failed");
  }
}

/** Update application with token exchange grant. */
export async function updateApplicationWithTokenExchangeGrant(awsAccountId: string, namespace: string, regionName?: string): Promise<UpdateApplicationWithTokenExchangeGrantResult> {
  try {
    // TODO: implement update_application_with_token_exchange_grant
    throw new Error("update_application_with_token_exchange_grant not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_application_with_token_exchange_grant failed");
  }
}

/** Update brand. */
export async function updateBrand(awsAccountId: string, brandId: string): Promise<UpdateBrandResult> {
  try {
    // TODO: implement update_brand
    throw new Error("update_brand not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_brand failed");
  }
}

/** Update brand assignment. */
export async function updateBrandAssignment(awsAccountId: string, brandArn: string, regionName?: string): Promise<UpdateBrandAssignmentResult> {
  try {
    // TODO: implement update_brand_assignment
    throw new Error("update_brand_assignment not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_brand_assignment failed");
  }
}

/** Update brand published version. */
export async function updateBrandPublishedVersion(awsAccountId: string, brandId: string, versionId: string, regionName?: string): Promise<UpdateBrandPublishedVersionResult> {
  try {
    // TODO: implement update_brand_published_version
    throw new Error("update_brand_published_version not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_brand_published_version failed");
  }
}

/** Update custom permissions. */
export async function updateCustomPermissions(awsAccountId: string, customPermissionsName: string): Promise<UpdateCustomPermissionsResult> {
  try {
    // TODO: implement update_custom_permissions
    throw new Error("update_custom_permissions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_custom_permissions failed");
  }
}

/** Update dashboard. */
export async function updateDashboard(awsAccountId: string, dashboardId: string, name: string): Promise<UpdateDashboardResult> {
  try {
    // TODO: implement update_dashboard
    throw new Error("update_dashboard not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_dashboard failed");
  }
}

/** Update dashboard links. */
export async function updateDashboardLinks(awsAccountId: string, dashboardId: string, linkEntities: string[], regionName?: string): Promise<UpdateDashboardLinksResult> {
  try {
    // TODO: implement update_dashboard_links
    throw new Error("update_dashboard_links not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_dashboard_links failed");
  }
}

/** Update dashboard permissions. */
export async function updateDashboardPermissions(awsAccountId: string, dashboardId: string): Promise<UpdateDashboardPermissionsResult> {
  try {
    // TODO: implement update_dashboard_permissions
    throw new Error("update_dashboard_permissions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_dashboard_permissions failed");
  }
}

/** Update dashboard published version. */
export async function updateDashboardPublishedVersion(awsAccountId: string, dashboardId: string, versionNumber: number, regionName?: string): Promise<UpdateDashboardPublishedVersionResult> {
  try {
    // TODO: implement update_dashboard_published_version
    throw new Error("update_dashboard_published_version not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_dashboard_published_version failed");
  }
}

/** Update dashboards qa configuration. */
export async function updateDashboardsQaConfiguration(awsAccountId: string, dashboardsQaStatus: string, regionName?: string): Promise<UpdateDashboardsQaConfigurationResult> {
  try {
    // TODO: implement update_dashboards_qa_configuration
    throw new Error("update_dashboards_qa_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_dashboards_qa_configuration failed");
  }
}

/** Update data set. */
export async function updateDataSet(awsAccountId: string, dataSetId: string, name: string, physicalTableMap: Record<string, unknown>, importMode: string): Promise<UpdateDataSetResult> {
  try {
    // TODO: implement update_data_set
    throw new Error("update_data_set not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_data_set failed");
  }
}

/** Update data set permissions. */
export async function updateDataSetPermissions(awsAccountId: string, dataSetId: string): Promise<UpdateDataSetPermissionsResult> {
  try {
    // TODO: implement update_data_set_permissions
    throw new Error("update_data_set_permissions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_data_set_permissions failed");
  }
}

/** Update data source. */
export async function updateDataSource(awsAccountId: string, dataSourceId: string, name: string): Promise<UpdateDataSourceResult> {
  try {
    // TODO: implement update_data_source
    throw new Error("update_data_source not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_data_source failed");
  }
}

/** Update data source permissions. */
export async function updateDataSourcePermissions(awsAccountId: string, dataSourceId: string): Promise<UpdateDataSourcePermissionsResult> {
  try {
    // TODO: implement update_data_source_permissions
    throw new Error("update_data_source_permissions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_data_source_permissions failed");
  }
}

/** Update default q business application. */
export async function updateDefaultQBusinessApplication(awsAccountId: string, applicationId: string): Promise<UpdateDefaultQBusinessApplicationResult> {
  try {
    // TODO: implement update_default_q_business_application
    throw new Error("update_default_q_business_application not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_default_q_business_application failed");
  }
}

/** Update flow permissions. */
export async function updateFlowPermissions(awsAccountId: string, flowId: string): Promise<UpdateFlowPermissionsResult> {
  try {
    // TODO: implement update_flow_permissions
    throw new Error("update_flow_permissions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_flow_permissions failed");
  }
}

/** Update folder. */
export async function updateFolder(awsAccountId: string, folderId: string, name: string, regionName?: string): Promise<UpdateFolderResult> {
  try {
    // TODO: implement update_folder
    throw new Error("update_folder not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_folder failed");
  }
}

/** Update folder permissions. */
export async function updateFolderPermissions(awsAccountId: string, folderId: string): Promise<UpdateFolderPermissionsResult> {
  try {
    // TODO: implement update_folder_permissions
    throw new Error("update_folder_permissions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_folder_permissions failed");
  }
}

/** Update group. */
export async function updateGroup(groupName: string, awsAccountId: string, namespace: string): Promise<UpdateGroupResult> {
  try {
    // TODO: implement update_group
    throw new Error("update_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_group failed");
  }
}

/** Update iam policy assignment. */
export async function updateIamPolicyAssignment(awsAccountId: string, assignmentName: string, namespace: string): Promise<UpdateIamPolicyAssignmentResult> {
  try {
    // TODO: implement update_iam_policy_assignment
    throw new Error("update_iam_policy_assignment not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_iam_policy_assignment failed");
  }
}

/** Update identity propagation config. */
export async function updateIdentityPropagationConfig(awsAccountId: string, service: string): Promise<UpdateIdentityPropagationConfigResult> {
  try {
    // TODO: implement update_identity_propagation_config
    throw new Error("update_identity_propagation_config not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_identity_propagation_config failed");
  }
}

/** Update ip restriction. */
export async function updateIpRestriction(awsAccountId: string): Promise<UpdateIpRestrictionResult> {
  try {
    // TODO: implement update_ip_restriction
    throw new Error("update_ip_restriction not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_ip_restriction failed");
  }
}

/** Update key registration. */
export async function updateKeyRegistration(awsAccountId: string, keyRegistration: Record<string, unknown>[], regionName?: string): Promise<UpdateKeyRegistrationResult> {
  try {
    // TODO: implement update_key_registration
    throw new Error("update_key_registration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_key_registration failed");
  }
}

/** Update public sharing settings. */
export async function updatePublicSharingSettings(awsAccountId: string): Promise<UpdatePublicSharingSettingsResult> {
  try {
    // TODO: implement update_public_sharing_settings
    throw new Error("update_public_sharing_settings not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_public_sharing_settings failed");
  }
}

/** Update q personalization configuration. */
export async function updateQPersonalizationConfiguration(awsAccountId: string, personalizationMode: string, regionName?: string): Promise<UpdateQPersonalizationConfigurationResult> {
  try {
    // TODO: implement update_q_personalization_configuration
    throw new Error("update_q_personalization_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_q_personalization_configuration failed");
  }
}

/** Update quick sight q search configuration. */
export async function updateQuickSightQSearchConfiguration(awsAccountId: string, qSearchStatus: string, regionName?: string): Promise<UpdateQuickSightQSearchConfigurationResult> {
  try {
    // TODO: implement update_quick_sight_q_search_configuration
    throw new Error("update_quick_sight_q_search_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_quick_sight_q_search_configuration failed");
  }
}

/** Update refresh schedule. */
export async function updateRefreshSchedule(dataSetId: string, awsAccountId: string, schedule: Record<string, unknown>, regionName?: string): Promise<UpdateRefreshScheduleResult> {
  try {
    // TODO: implement update_refresh_schedule
    throw new Error("update_refresh_schedule not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_refresh_schedule failed");
  }
}

/** Update role custom permission. */
export async function updateRoleCustomPermission(customPermissionsName: string, role: string, awsAccountId: string, namespace: string, regionName?: string): Promise<UpdateRoleCustomPermissionResult> {
  try {
    // TODO: implement update_role_custom_permission
    throw new Error("update_role_custom_permission not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_role_custom_permission failed");
  }
}

/** Update spice capacity configuration. */
export async function updateSpiceCapacityConfiguration(awsAccountId: string, purchaseMode: string, regionName?: string): Promise<UpdateSpiceCapacityConfigurationResult> {
  try {
    // TODO: implement update_spice_capacity_configuration
    throw new Error("update_spice_capacity_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_spice_capacity_configuration failed");
  }
}

/** Update template. */
export async function updateTemplate(awsAccountId: string, templateId: string): Promise<UpdateTemplateResult> {
  try {
    // TODO: implement update_template
    throw new Error("update_template not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_template failed");
  }
}

/** Update template alias. */
export async function updateTemplateAlias(awsAccountId: string, templateId: string, aliasName: string, templateVersionNumber: number, regionName?: string): Promise<UpdateTemplateAliasResult> {
  try {
    // TODO: implement update_template_alias
    throw new Error("update_template_alias not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_template_alias failed");
  }
}

/** Update template permissions. */
export async function updateTemplatePermissions(awsAccountId: string, templateId: string): Promise<UpdateTemplatePermissionsResult> {
  try {
    // TODO: implement update_template_permissions
    throw new Error("update_template_permissions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_template_permissions failed");
  }
}

/** Update theme. */
export async function updateTheme(awsAccountId: string, themeId: string, baseThemeId: string): Promise<UpdateThemeResult> {
  try {
    // TODO: implement update_theme
    throw new Error("update_theme not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_theme failed");
  }
}

/** Update theme alias. */
export async function updateThemeAlias(awsAccountId: string, themeId: string, aliasName: string, themeVersionNumber: number, regionName?: string): Promise<UpdateThemeAliasResult> {
  try {
    // TODO: implement update_theme_alias
    throw new Error("update_theme_alias not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_theme_alias failed");
  }
}

/** Update theme permissions. */
export async function updateThemePermissions(awsAccountId: string, themeId: string): Promise<UpdateThemePermissionsResult> {
  try {
    // TODO: implement update_theme_permissions
    throw new Error("update_theme_permissions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_theme_permissions failed");
  }
}

/** Update topic. */
export async function updateTopic(awsAccountId: string, topicId: string, topic: Record<string, unknown>): Promise<UpdateTopicResult> {
  try {
    // TODO: implement update_topic
    throw new Error("update_topic not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_topic failed");
  }
}

/** Update topic permissions. */
export async function updateTopicPermissions(awsAccountId: string, topicId: string): Promise<UpdateTopicPermissionsResult> {
  try {
    // TODO: implement update_topic_permissions
    throw new Error("update_topic_permissions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_topic_permissions failed");
  }
}

/** Update topic refresh schedule. */
export async function updateTopicRefreshSchedule(awsAccountId: string, topicId: string, datasetId: string, refreshSchedule: Record<string, unknown>, regionName?: string): Promise<UpdateTopicRefreshScheduleResult> {
  try {
    // TODO: implement update_topic_refresh_schedule
    throw new Error("update_topic_refresh_schedule not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_topic_refresh_schedule failed");
  }
}

/** Update user. */
export async function updateUser(userName: string, awsAccountId: string, namespace: string, email: string, role: string): Promise<UpdateUserResult> {
  try {
    // TODO: implement update_user
    throw new Error("update_user not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_user failed");
  }
}

/** Update user custom permission. */
export async function updateUserCustomPermission(userName: string, awsAccountId: string, namespace: string, customPermissionsName: string, regionName?: string): Promise<UpdateUserCustomPermissionResult> {
  try {
    // TODO: implement update_user_custom_permission
    throw new Error("update_user_custom_permission not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_user_custom_permission failed");
  }
}

/** Update vpc connection. */
export async function updateVpcConnection(awsAccountId: string, vpcConnectionId: string, name: string, subnetIds: string[], securityGroupIds: string[], roleArn: string): Promise<UpdateVpcConnectionResult> {
  try {
    // TODO: implement update_vpc_connection
    throw new Error("update_vpc_connection not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_vpc_connection failed");
  }
}
