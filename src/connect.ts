import { ConnectClient } from "@aws-sdk/client-connect";
import { getClient } from "./client";
import { wrapAwsError } from "./exceptions";

/** Metadata for an Amazon Connect instance. */
export type ConnectInstance = {
  instanceId: string;
  instanceAlias?: string;
  arn?: string;
  identityManagementType?: string;
  instanceStatus?: string;
  createdTime?: unknown;
};

/** Metadata for an Amazon Connect contact flow. */
export type ConnectContactFlow = {
  contactFlowId: string;
  name: string;
  arn?: string;
  type?: string;
  state?: string;
  content?: string;
};

/** Metadata for an Amazon Connect queue. */
export type ConnectQueue = {
  queueId: string;
  name: string;
  arn?: string;
  status?: string;
  description?: string;
};

/** Metadata for an Amazon Connect routing profile. */
export type ConnectRoutingProfile = {
  routingProfileId: string;
  name: string;
  arn?: string;
  description?: string;
  defaultOutboundQueueId?: string;
};

/** Metadata for an Amazon Connect user. */
export type ConnectUser = {
  userId: string;
  username?: string;
  arn?: string;
  routingProfileId?: string;
  securityProfileIds?: string[];
};

/** Result of starting a contact (voice, chat, or task). */
export type ContactResult = {
  contactId: string;
};

/** A single metric result from GetCurrentMetricData. */
export type MetricResult = {
  dimensions?: Record<string, unknown>;
  collections?: Record<string, unknown>[];
};

/** Result of activate_evaluation_form. */
export type ActivateEvaluationFormResult = {
  evaluationFormId?: string;
  evaluationFormArn?: string;
  evaluationFormVersion?: number;
};

/** Result of associate_analytics_data_set. */
export type AssociateAnalyticsDataSetResult = {
  dataSetId?: string;
  targetAccountId?: string;
  resourceShareId?: string;
  resourceShareArn?: string;
};

/** Result of associate_instance_storage_config. */
export type AssociateInstanceStorageConfigResult = {
  associationId?: string;
};

/** Result of associate_security_key. */
export type AssociateSecurityKeyResult = {
  associationId?: string;
};

/** Result of batch_associate_analytics_data_set. */
export type BatchAssociateAnalyticsDataSetResult = {
  created?: Record<string, unknown>[];
  errors?: Record<string, unknown>[];
};

/** Result of batch_disassociate_analytics_data_set. */
export type BatchDisassociateAnalyticsDataSetResult = {
  deleted?: string[];
  errors?: Record<string, unknown>[];
};

/** Result of batch_get_attached_file_metadata. */
export type BatchGetAttachedFileMetadataResult = {
  files?: Record<string, unknown>[];
  errors?: Record<string, unknown>[];
};

/** Result of batch_get_flow_association. */
export type BatchGetFlowAssociationResult = {
  flowAssociationSummaryList?: Record<string, unknown>[];
};

/** Result of batch_put_contact. */
export type BatchPutContactResult = {
  successfulRequestList?: Record<string, unknown>[];
  failedRequestList?: Record<string, unknown>[];
};

/** Result of claim_phone_number. */
export type ClaimPhoneNumberResult = {
  phoneNumberId?: string;
  phoneNumberArn?: string;
};

/** Result of create_agent_status. */
export type CreateAgentStatusResult = {
  agentStatusArn?: string;
  agentStatusId?: string;
};

/** Result of create_contact. */
export type CreateContactResult = {
  contactId?: string;
  contactArn?: string;
};

/** Result of create_contact_flow_module. */
export type CreateContactFlowModuleResult = {
  id?: string;
  arn?: string;
};

/** Result of create_contact_flow_version. */
export type CreateContactFlowVersionResult = {
  contactFlowArn?: string;
  version?: number;
};

/** Result of create_email_address. */
export type CreateEmailAddressResult = {
  emailAddressId?: string;
  emailAddressArn?: string;
};

/** Result of create_evaluation_form. */
export type CreateEvaluationFormResult = {
  evaluationFormId?: string;
  evaluationFormArn?: string;
};

/** Result of create_hours_of_operation. */
export type CreateHoursOfOperationResult = {
  hoursOfOperationId?: string;
  hoursOfOperationArn?: string;
};

/** Result of create_hours_of_operation_override. */
export type CreateHoursOfOperationOverrideResult = {
  hoursOfOperationOverrideId?: string;
};

/** Result of create_integration_association. */
export type CreateIntegrationAssociationResult = {
  integrationAssociationId?: string;
  integrationAssociationArn?: string;
};

/** Result of create_participant. */
export type CreateParticipantResult = {
  participantCredentials?: Record<string, unknown>;
  participantId?: string;
};

/** Result of create_persistent_contact_association. */
export type CreatePersistentContactAssociationResult = {
  continuedFromContactId?: string;
};

/** Result of create_prompt. */
export type CreatePromptResult = {
  promptArn?: string;
  promptId?: string;
};

/** Result of create_push_notification_registration. */
export type CreatePushNotificationRegistrationResult = {
  registrationId?: string;
};

/** Result of create_quick_connect. */
export type CreateQuickConnectResult = {
  quickConnectArn?: string;
  quickConnectId?: string;
};

/** Result of create_rule. */
export type CreateRuleResult = {
  ruleArn?: string;
  ruleId?: string;
};

/** Result of create_security_profile. */
export type CreateSecurityProfileResult = {
  securityProfileId?: string;
  securityProfileArn?: string;
};

/** Result of create_task_template. */
export type CreateTaskTemplateResult = {
  id?: string;
  arn?: string;
};

/** Result of create_traffic_distribution_group. */
export type CreateTrafficDistributionGroupResult = {
  id?: string;
  arn?: string;
};

/** Result of create_use_case. */
export type CreateUseCaseResult = {
  useCaseId?: string;
  useCaseArn?: string;
};

/** Result of create_user_hierarchy_group. */
export type CreateUserHierarchyGroupResult = {
  hierarchyGroupId?: string;
  hierarchyGroupArn?: string;
};

/** Result of create_view. */
export type CreateViewResult = {
  view?: Record<string, unknown>;
};

/** Result of create_view_version. */
export type CreateViewVersionResult = {
  view?: Record<string, unknown>;
};

/** Result of create_vocabulary. */
export type CreateVocabularyResult = {
  vocabularyArn?: string;
  vocabularyId?: string;
  state?: string;
};

/** Result of deactivate_evaluation_form. */
export type DeactivateEvaluationFormResult = {
  evaluationFormId?: string;
  evaluationFormArn?: string;
  evaluationFormVersion?: number;
};

/** Result of delete_vocabulary. */
export type DeleteVocabularyResult = {
  vocabularyArn?: string;
  vocabularyId?: string;
  state?: string;
};

/** Result of describe_agent_status. */
export type DescribeAgentStatusResult = {
  agentStatus?: Record<string, unknown>;
};

/** Result of describe_authentication_profile. */
export type DescribeAuthenticationProfileResult = {
  authenticationProfile?: Record<string, unknown>;
};

/** Result of describe_contact. */
export type DescribeContactResult = {
  contact?: Record<string, unknown>;
};

/** Result of describe_contact_evaluation. */
export type DescribeContactEvaluationResult = {
  evaluation?: Record<string, unknown>;
  evaluationForm?: Record<string, unknown>;
};

/** Result of describe_contact_flow_module. */
export type DescribeContactFlowModuleResult = {
  contactFlowModule?: Record<string, unknown>;
};

/** Result of describe_email_address. */
export type DescribeEmailAddressResult = {
  emailAddressId?: string;
  emailAddressArn?: string;
  emailAddress?: string;
  displayName?: string;
  description?: string;
  createTimestamp?: string;
  modifiedTimestamp?: string;
  aliasConfigurations?: Record<string, unknown>[];
  tags?: Record<string, unknown>;
};

/** Result of describe_evaluation_form. */
export type DescribeEvaluationFormResult = {
  evaluationForm?: Record<string, unknown>;
};

/** Result of describe_hours_of_operation. */
export type DescribeHoursOfOperationResult = {
  hoursOfOperation?: Record<string, unknown>;
};

/** Result of describe_hours_of_operation_override. */
export type DescribeHoursOfOperationOverrideResult = {
  hoursOfOperationOverride?: Record<string, unknown>;
};

/** Result of describe_instance_attribute. */
export type DescribeInstanceAttributeResult = {
  attribute?: Record<string, unknown>;
};

/** Result of describe_instance_storage_config. */
export type DescribeInstanceStorageConfigResult = {
  storageConfig?: Record<string, unknown>;
};

/** Result of describe_phone_number. */
export type DescribePhoneNumberResult = {
  claimedPhoneNumberSummary?: Record<string, unknown>;
};

/** Result of describe_predefined_attribute. */
export type DescribePredefinedAttributeResult = {
  predefinedAttribute?: Record<string, unknown>;
};

/** Result of describe_prompt. */
export type DescribePromptResult = {
  prompt?: Record<string, unknown>;
};

/** Result of describe_quick_connect. */
export type DescribeQuickConnectResult = {
  quickConnect?: Record<string, unknown>;
};

/** Result of describe_rule. */
export type DescribeRuleResult = {
  rule?: Record<string, unknown>;
};

/** Result of describe_security_profile. */
export type DescribeSecurityProfileResult = {
  securityProfile?: Record<string, unknown>;
};

/** Result of describe_traffic_distribution_group. */
export type DescribeTrafficDistributionGroupResult = {
  trafficDistributionGroup?: Record<string, unknown>;
};

/** Result of describe_user_hierarchy_group. */
export type DescribeUserHierarchyGroupResult = {
  hierarchyGroup?: Record<string, unknown>;
};

/** Result of describe_user_hierarchy_structure. */
export type DescribeUserHierarchyStructureResult = {
  hierarchyStructure?: Record<string, unknown>;
};

/** Result of describe_view. */
export type DescribeViewResult = {
  view?: Record<string, unknown>;
};

/** Result of describe_vocabulary. */
export type DescribeVocabularyResult = {
  vocabulary?: Record<string, unknown>;
};

/** Result of get_attached_file. */
export type GetAttachedFileResult = {
  fileArn?: string;
  fileId?: string;
  creationTime?: string;
  fileStatus?: string;
  fileName?: string;
  fileSizeInBytes?: number;
  associatedResourceArn?: string;
  fileUseCaseType?: string;
  createdBy?: Record<string, unknown>;
  downloadUrlMetadata?: Record<string, unknown>;
  tags?: Record<string, unknown>;
};

/** Result of get_contact_metrics. */
export type GetContactMetricsResult = {
  metricResults?: Record<string, unknown>[];
  id?: string;
  arn?: string;
};

/** Result of get_current_user_data. */
export type GetCurrentUserDataResult = {
  nextToken?: string;
  userDataList?: Record<string, unknown>[];
  approximateTotalCount?: number;
};

/** Result of get_effective_hours_of_operations. */
export type GetEffectiveHoursOfOperationsResult = {
  effectiveHoursOfOperationList?: Record<string, unknown>[];
  timeZone?: string;
};

/** Result of get_federation_token. */
export type GetFederationTokenResult = {
  credentials?: Record<string, unknown>;
  signInUrl?: string;
  userArn?: string;
  userId?: string;
};

/** Result of get_flow_association. */
export type GetFlowAssociationResult = {
  resourceId?: string;
  flowId?: string;
  resourceType?: string;
};

/** Result of get_metric_data. */
export type GetMetricDataResult = {
  nextToken?: string;
  metricResults?: Record<string, unknown>[];
};

/** Result of get_metric_data_v2. */
export type GetMetricDataV2Result = {
  nextToken?: string;
  metricResults?: Record<string, unknown>[];
};

/** Result of get_prompt_file. */
export type GetPromptFileResult = {
  promptPresignedUrl?: string;
  lastModifiedTime?: string;
  lastModifiedRegion?: string;
};

/** Result of get_task_template. */
export type GetTaskTemplateResult = {
  instanceId?: string;
  id?: string;
  arn?: string;
  name?: string;
  description?: string;
  contactFlowId?: string;
  selfAssignFlowId?: string;
  constraints?: Record<string, unknown>;
  defaults?: Record<string, unknown>;
  fields?: Record<string, unknown>[];
  status?: string;
  lastModifiedTime?: string;
  createdTime?: string;
  tags?: Record<string, unknown>;
};

/** Result of get_traffic_distribution. */
export type GetTrafficDistributionResult = {
  telephonyConfig?: Record<string, unknown>;
  id?: string;
  arn?: string;
  signInConfig?: Record<string, unknown>;
  agentConfig?: Record<string, unknown>;
};

/** Result of import_phone_number. */
export type ImportPhoneNumberResult = {
  phoneNumberId?: string;
  phoneNumberArn?: string;
};

/** Result of list_agent_statuses. */
export type ListAgentStatusesResult = {
  nextToken?: string;
  agentStatusSummaryList?: Record<string, unknown>[];
};

/** Result of list_analytics_data_associations. */
export type ListAnalyticsDataAssociationsResult = {
  results?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_analytics_data_lake_data_sets. */
export type ListAnalyticsDataLakeDataSetsResult = {
  results?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_approved_origins. */
export type ListApprovedOriginsResult = {
  origins?: string[];
  nextToken?: string;
};

/** Result of list_associated_contacts. */
export type ListAssociatedContactsResult = {
  contactSummaryList?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_authentication_profiles. */
export type ListAuthenticationProfilesResult = {
  authenticationProfileSummaryList?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_bots. */
export type ListBotsResult = {
  lexBots?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_contact_evaluations. */
export type ListContactEvaluationsResult = {
  evaluationSummaryList?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_contact_flow_modules. */
export type ListContactFlowModulesResult = {
  contactFlowModulesSummaryList?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_contact_flow_versions. */
export type ListContactFlowVersionsResult = {
  contactFlowVersionSummaryList?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_contact_references. */
export type ListContactReferencesResult = {
  referenceSummaryList?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_default_vocabularies. */
export type ListDefaultVocabulariesResult = {
  defaultVocabularyList?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_evaluation_form_versions. */
export type ListEvaluationFormVersionsResult = {
  evaluationFormVersionSummaryList?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_evaluation_forms. */
export type ListEvaluationFormsResult = {
  evaluationFormSummaryList?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_flow_associations. */
export type ListFlowAssociationsResult = {
  flowAssociationSummaryList?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_hours_of_operation_overrides. */
export type ListHoursOfOperationOverridesResult = {
  nextToken?: string;
  hoursOfOperationOverrideList?: Record<string, unknown>[];
  lastModifiedRegion?: string;
  lastModifiedTime?: string;
};

/** Result of list_hours_of_operations. */
export type ListHoursOfOperationsResult = {
  hoursOfOperationSummaryList?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_instance_attributes. */
export type ListInstanceAttributesResult = {
  attributes?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_instance_storage_configs. */
export type ListInstanceStorageConfigsResult = {
  storageConfigs?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_integration_associations. */
export type ListIntegrationAssociationsResult = {
  integrationAssociationSummaryList?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_lambda_functions. */
export type ListLambdaFunctionsResult = {
  lambdaFunctions?: string[];
  nextToken?: string;
};

/** Result of list_lex_bots. */
export type ListLexBotsResult = {
  lexBots?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_phone_numbers. */
export type ListPhoneNumbersResult = {
  phoneNumberSummaryList?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_phone_numbers_v2. */
export type ListPhoneNumbersV2Result = {
  nextToken?: string;
  listPhoneNumbersSummaryList?: Record<string, unknown>[];
};

/** Result of list_predefined_attributes. */
export type ListPredefinedAttributesResult = {
  nextToken?: string;
  predefinedAttributeSummaryList?: Record<string, unknown>[];
};

/** Result of list_prompts. */
export type ListPromptsResult = {
  promptSummaryList?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_queue_quick_connects. */
export type ListQueueQuickConnectsResult = {
  nextToken?: string;
  quickConnectSummaryList?: Record<string, unknown>[];
  lastModifiedTime?: string;
  lastModifiedRegion?: string;
};

/** Result of list_quick_connects. */
export type ListQuickConnectsResult = {
  quickConnectSummaryList?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_realtime_contact_analysis_segments_v2. */
export type ListRealtimeContactAnalysisSegmentsV2Result = {
  channel?: string;
  status?: string;
  segments?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_routing_profile_manual_assignment_queues. */
export type ListRoutingProfileManualAssignmentQueuesResult = {
  nextToken?: string;
  routingProfileManualAssignmentQueueConfigSummaryList?: Record<string, unknown>[];
  lastModifiedTime?: string;
  lastModifiedRegion?: string;
};

/** Result of list_routing_profile_queues. */
export type ListRoutingProfileQueuesResult = {
  nextToken?: string;
  routingProfileQueueConfigSummaryList?: Record<string, unknown>[];
  lastModifiedTime?: string;
  lastModifiedRegion?: string;
};

/** Result of list_rules. */
export type ListRulesResult = {
  ruleSummaryList?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_security_keys. */
export type ListSecurityKeysResult = {
  securityKeys?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_security_profile_applications. */
export type ListSecurityProfileApplicationsResult = {
  applications?: Record<string, unknown>[];
  nextToken?: string;
  lastModifiedTime?: string;
  lastModifiedRegion?: string;
};

/** Result of list_security_profile_permissions. */
export type ListSecurityProfilePermissionsResult = {
  permissions?: string[];
  nextToken?: string;
  lastModifiedTime?: string;
  lastModifiedRegion?: string;
};

/** Result of list_security_profiles. */
export type ListSecurityProfilesResult = {
  securityProfileSummaryList?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_tags_for_resource. */
export type ListTagsForResourceResult = {
  tags?: Record<string, unknown>;
};

/** Result of list_task_templates. */
export type ListTaskTemplatesResult = {
  taskTemplates?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_traffic_distribution_group_users. */
export type ListTrafficDistributionGroupUsersResult = {
  nextToken?: string;
  trafficDistributionGroupUserSummaryList?: Record<string, unknown>[];
};

/** Result of list_traffic_distribution_groups. */
export type ListTrafficDistributionGroupsResult = {
  nextToken?: string;
  trafficDistributionGroupSummaryList?: Record<string, unknown>[];
};

/** Result of list_use_cases. */
export type ListUseCasesResult = {
  useCaseSummaryList?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_user_hierarchy_groups. */
export type ListUserHierarchyGroupsResult = {
  userHierarchyGroupSummaryList?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_user_proficiencies. */
export type ListUserProficienciesResult = {
  nextToken?: string;
  userProficiencyList?: Record<string, unknown>[];
  lastModifiedTime?: string;
  lastModifiedRegion?: string;
};

/** Result of list_view_versions. */
export type ListViewVersionsResult = {
  viewVersionSummaryList?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_views. */
export type ListViewsResult = {
  viewsSummaryList?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of monitor_contact. */
export type MonitorContactResult = {
  contactId?: string;
  contactArn?: string;
};

/** Result of replicate_instance. */
export type ReplicateInstanceResult = {
  id?: string;
  arn?: string;
};

/** Result of search_agent_statuses. */
export type SearchAgentStatusesResult = {
  agentStatuses?: Record<string, unknown>[];
  nextToken?: string;
  approximateTotalCount?: number;
};

/** Result of search_available_phone_numbers. */
export type SearchAvailablePhoneNumbersResult = {
  nextToken?: string;
  availableNumbersList?: Record<string, unknown>[];
};

/** Result of search_contact_evaluations. */
export type SearchContactEvaluationsResult = {
  evaluationSearchSummaryList?: Record<string, unknown>[];
  nextToken?: string;
  approximateTotalCount?: number;
};

/** Result of search_contact_flow_modules. */
export type SearchContactFlowModulesResult = {
  contactFlowModules?: Record<string, unknown>[];
  nextToken?: string;
  approximateTotalCount?: number;
};

/** Result of search_contact_flows. */
export type SearchContactFlowsResult = {
  contactFlows?: Record<string, unknown>[];
  nextToken?: string;
  approximateTotalCount?: number;
};

/** Result of search_contacts. */
export type SearchContactsResult = {
  contacts?: Record<string, unknown>[];
  nextToken?: string;
  totalCount?: number;
};

/** Result of search_email_addresses. */
export type SearchEmailAddressesResult = {
  nextToken?: string;
  emailAddresses?: Record<string, unknown>[];
  approximateTotalCount?: number;
};

/** Result of search_evaluation_forms. */
export type SearchEvaluationFormsResult = {
  evaluationFormSearchSummaryList?: Record<string, unknown>[];
  nextToken?: string;
  approximateTotalCount?: number;
};

/** Result of search_hours_of_operation_overrides. */
export type SearchHoursOfOperationOverridesResult = {
  hoursOfOperationOverrides?: Record<string, unknown>[];
  nextToken?: string;
  approximateTotalCount?: number;
};

/** Result of search_hours_of_operations. */
export type SearchHoursOfOperationsResult = {
  hoursOfOperations?: Record<string, unknown>[];
  nextToken?: string;
  approximateTotalCount?: number;
};

/** Result of search_predefined_attributes. */
export type SearchPredefinedAttributesResult = {
  predefinedAttributes?: Record<string, unknown>[];
  nextToken?: string;
  approximateTotalCount?: number;
};

/** Result of search_prompts. */
export type SearchPromptsResult = {
  prompts?: Record<string, unknown>[];
  nextToken?: string;
  approximateTotalCount?: number;
};

/** Result of search_queues. */
export type SearchQueuesResult = {
  queues?: Record<string, unknown>[];
  nextToken?: string;
  approximateTotalCount?: number;
};

/** Result of search_quick_connects. */
export type SearchQuickConnectsResult = {
  quickConnects?: Record<string, unknown>[];
  nextToken?: string;
  approximateTotalCount?: number;
};

/** Result of search_resource_tags. */
export type SearchResourceTagsResult = {
  tags?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of search_routing_profiles. */
export type SearchRoutingProfilesResult = {
  routingProfiles?: Record<string, unknown>[];
  nextToken?: string;
  approximateTotalCount?: number;
};

/** Result of search_security_profiles. */
export type SearchSecurityProfilesResult = {
  securityProfiles?: Record<string, unknown>[];
  nextToken?: string;
  approximateTotalCount?: number;
};

/** Result of search_user_hierarchy_groups. */
export type SearchUserHierarchyGroupsResult = {
  userHierarchyGroups?: Record<string, unknown>[];
  nextToken?: string;
  approximateTotalCount?: number;
};

/** Result of search_users. */
export type SearchUsersResult = {
  users?: Record<string, unknown>[];
  nextToken?: string;
  approximateTotalCount?: number;
};

/** Result of search_vocabularies. */
export type SearchVocabulariesResult = {
  vocabularySummaryList?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of send_chat_integration_event. */
export type SendChatIntegrationEventResult = {
  initialContactId?: string;
  newChatCreated?: boolean;
};

/** Result of start_attached_file_upload. */
export type StartAttachedFileUploadResult = {
  fileArn?: string;
  fileId?: string;
  creationTime?: string;
  fileStatus?: string;
  createdBy?: Record<string, unknown>;
  uploadUrlMetadata?: Record<string, unknown>;
};

/** Result of start_contact_evaluation. */
export type StartContactEvaluationResult = {
  evaluationId?: string;
  evaluationArn?: string;
};

/** Result of start_contact_streaming. */
export type StartContactStreamingResult = {
  streamingId?: string;
};

/** Result of start_email_contact. */
export type StartEmailContactResult = {
  contactId?: string;
};

/** Result of start_outbound_chat_contact. */
export type StartOutboundChatContactResult = {
  contactId?: string;
};

/** Result of start_outbound_email_contact. */
export type StartOutboundEmailContactResult = {
  contactId?: string;
};

/** Result of start_web_rtc_contact. */
export type StartWebRtcContactResult = {
  connectionData?: Record<string, unknown>;
  contactId?: string;
  participantId?: string;
  participantToken?: string;
};

/** Result of submit_contact_evaluation. */
export type SubmitContactEvaluationResult = {
  evaluationId?: string;
  evaluationArn?: string;
};

/** Result of transfer_contact. */
export type TransferContactResult = {
  contactId?: string;
  contactArn?: string;
};

/** Result of update_contact_evaluation. */
export type UpdateContactEvaluationResult = {
  evaluationId?: string;
  evaluationArn?: string;
};

/** Result of update_email_address_metadata. */
export type UpdateEmailAddressMetadataResult = {
  emailAddressId?: string;
  emailAddressArn?: string;
};

/** Result of update_evaluation_form. */
export type UpdateEvaluationFormResult = {
  evaluationFormId?: string;
  evaluationFormArn?: string;
  evaluationFormVersion?: number;
};

/** Result of update_phone_number. */
export type UpdatePhoneNumberResult = {
  phoneNumberId?: string;
  phoneNumberArn?: string;
};

/** Result of update_prompt. */
export type UpdatePromptResult = {
  promptArn?: string;
  promptId?: string;
};

/** Result of update_task_template. */
export type UpdateTaskTemplateResult = {
  instanceId?: string;
  id?: string;
  arn?: string;
  name?: string;
  description?: string;
  contactFlowId?: string;
  selfAssignFlowId?: string;
  constraints?: Record<string, unknown>;
  defaults?: Record<string, unknown>;
  fields?: Record<string, unknown>[];
  status?: string;
  lastModifiedTime?: string;
  createdTime?: string;
};

/** Result of update_view_content. */
export type UpdateViewContentResult = {
  view?: Record<string, unknown>;
};

/** Create an Amazon Connect instance. */
export async function createInstance(identityManagementType: string, inboundCallsEnabled: boolean, outboundCallsEnabled: boolean, instanceAlias?: string, regionName?: string): Promise<ConnectInstance> {
  try {
    // TODO: implement create_instance
    throw new Error("create_instance not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_instance failed");
  }
}

/** Describe an Amazon Connect instance. */
export async function describeInstance(instanceId: string, regionName?: string): Promise<ConnectInstance> {
  try {
    // TODO: implement describe_instance
    throw new Error("describe_instance not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_instance failed");
  }
}

/** List Amazon Connect instances in the account. */
export async function listInstances(regionName?: string): Promise<ConnectInstance[]> {
  try {
    // TODO: implement list_instances
    throw new Error("list_instances not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_instances failed");
  }
}

/** Delete an Amazon Connect instance. */
export async function deleteInstance(instanceId: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_instance
    throw new Error("delete_instance not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_instance failed");
  }
}

/** Create a contact flow in an Amazon Connect instance. */
export async function createContactFlow(instanceId: string, name: string, type: string, content: string, description?: string, regionName?: string): Promise<ConnectContactFlow> {
  try {
    // TODO: implement create_contact_flow
    throw new Error("create_contact_flow not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_contact_flow failed");
  }
}

/** Describe a contact flow. */
export async function describeContactFlow(instanceId: string, contactFlowId: string, regionName?: string): Promise<ConnectContactFlow> {
  try {
    // TODO: implement describe_contact_flow
    throw new Error("describe_contact_flow not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_contact_flow failed");
  }
}

/** List contact flows in an Amazon Connect instance. */
export async function listContactFlows(instanceId: string, contactFlowTypes?: string[], regionName?: string): Promise<ConnectContactFlow[]> {
  try {
    // TODO: implement list_contact_flows
    throw new Error("list_contact_flows not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_contact_flows failed");
  }
}

/** Update the content of a contact flow. */
export async function updateContactFlowContent(instanceId: string, contactFlowId: string, content: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement update_contact_flow_content
    throw new Error("update_contact_flow_content not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_contact_flow_content failed");
  }
}

/** Create a queue in an Amazon Connect instance. */
export async function createQueue(instanceId: string, name: string, hoursOfOperationId: string, description?: string, regionName?: string): Promise<ConnectQueue> {
  try {
    // TODO: implement create_queue
    throw new Error("create_queue not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_queue failed");
  }
}

/** Describe a queue. */
export async function describeQueue(instanceId: string, queueId: string, regionName?: string): Promise<ConnectQueue> {
  try {
    // TODO: implement describe_queue
    throw new Error("describe_queue not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_queue failed");
  }
}

/** List queues in an Amazon Connect instance. */
export async function listQueues(instanceId: string, queueTypes?: string[], regionName?: string): Promise<ConnectQueue[]> {
  try {
    // TODO: implement list_queues
    throw new Error("list_queues not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_queues failed");
  }
}

/** Update the status of a queue. */
export async function updateQueueStatus(instanceId: string, queueId: string, status: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement update_queue_status
    throw new Error("update_queue_status not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_queue_status failed");
  }
}

/** Create a routing profile in an Amazon Connect instance. */
export async function createRoutingProfile(instanceId: string, name: string, defaultOutboundQueueId: string, description: string, mediaConcurrencies: Record<string, unknown>[], regionName?: string): Promise<ConnectRoutingProfile> {
  try {
    // TODO: implement create_routing_profile
    throw new Error("create_routing_profile not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_routing_profile failed");
  }
}

/** Describe a routing profile. */
export async function describeRoutingProfile(instanceId: string, routingProfileId: string, regionName?: string): Promise<ConnectRoutingProfile> {
  try {
    // TODO: implement describe_routing_profile
    throw new Error("describe_routing_profile not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_routing_profile failed");
  }
}

/** List routing profiles in an Amazon Connect instance. */
export async function listRoutingProfiles(instanceId: string, regionName?: string): Promise<ConnectRoutingProfile[]> {
  try {
    // TODO: implement list_routing_profiles
    throw new Error("list_routing_profiles not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_routing_profiles failed");
  }
}

/** Create a user in an Amazon Connect instance. */
export async function createUser(instanceId: string, username: string, phoneConfig: Record<string, unknown>, securityProfileIds: string[], routingProfileId: string, identityInfo?: Record<string, unknown>, password?: string, regionName?: string): Promise<ConnectUser> {
  try {
    // TODO: implement create_user
    throw new Error("create_user not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_user failed");
  }
}

/** Describe a user. */
export async function describeUser(instanceId: string, userId: string, regionName?: string): Promise<ConnectUser> {
  try {
    // TODO: implement describe_user
    throw new Error("describe_user not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_user failed");
  }
}

/** List users in an Amazon Connect instance. */
export async function listUsers(instanceId: string, regionName?: string): Promise<ConnectUser[]> {
  try {
    // TODO: implement list_users
    throw new Error("list_users not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_users failed");
  }
}

/** Update the routing profile assigned to a user. */
export async function updateUserRoutingProfile(instanceId: string, userId: string, routingProfileId: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement update_user_routing_profile
    throw new Error("update_user_routing_profile not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_user_routing_profile failed");
  }
}

/** Delete a user from an Amazon Connect instance. */
export async function deleteUser(instanceId: string, userId: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_user
    throw new Error("delete_user not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_user failed");
  }
}

/** Start an outbound voice contact. */
export async function startOutboundVoiceContact(instanceId: string, contactFlowId: string, destinationPhoneNumber: string, sourcePhoneNumber?: string, queueId?: string, attributes?: Record<string, unknown>, regionName?: string): Promise<ContactResult> {
  try {
    // TODO: implement start_outbound_voice_contact
    throw new Error("start_outbound_voice_contact not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_outbound_voice_contact failed");
  }
}

/** Start a chat contact. */
export async function startChatContact(instanceId: string, contactFlowId: string, participantDetails: Record<string, unknown>, attributes?: Record<string, unknown>, initialMessage?: Record<string, unknown>, regionName?: string): Promise<ContactResult> {
  try {
    // TODO: implement start_chat_contact
    throw new Error("start_chat_contact not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_chat_contact failed");
  }
}

/** Stop an active contact. */
export async function stopContact(contactId: string, instanceId: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement stop_contact
    throw new Error("stop_contact not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "stop_contact failed");
  }
}

/** Get attributes for a contact. */
export async function getContactAttributes(instanceId: string, initialContactId: string, regionName?: string): Promise<Record<string, unknown>> {
  try {
    // TODO: implement get_contact_attributes
    throw new Error("get_contact_attributes not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_contact_attributes failed");
  }
}

/** Update attributes on a contact. */
export async function updateContactAttributes(instanceId: string, initialContactId: string, attributes: Record<string, unknown>, regionName?: string): Promise<void> {
  try {
    // TODO: implement update_contact_attributes
    throw new Error("update_contact_attributes not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_contact_attributes failed");
  }
}

/** Get current metric data from an Amazon Connect instance. */
export async function getCurrentMetricData(instanceId: string, filters: Record<string, unknown>, currentMetrics: Record<string, unknown>[], groupings?: string[], regionName?: string): Promise<MetricResult[]> {
  try {
    // TODO: implement get_current_metric_data
    throw new Error("get_current_metric_data not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_current_metric_data failed");
  }
}

/** Start a task contact. */
export async function startTaskContact(instanceId: string, contactFlowId: string, name: string, references?: Record<string, unknown>, description?: string, attributes?: Record<string, unknown>, regionName?: string): Promise<ContactResult> {
  try {
    // TODO: implement start_task_contact
    throw new Error("start_task_contact not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_task_contact failed");
  }
}

/** Activate evaluation form. */
export async function activateEvaluationForm(instanceId: string, evaluationFormId: string, evaluationFormVersion: number, regionName?: string): Promise<ActivateEvaluationFormResult> {
  try {
    // TODO: implement activate_evaluation_form
    throw new Error("activate_evaluation_form not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "activate_evaluation_form failed");
  }
}

/** Associate analytics data set. */
export async function associateAnalyticsDataSet(instanceId: string, dataSetId: string): Promise<AssociateAnalyticsDataSetResult> {
  try {
    // TODO: implement associate_analytics_data_set
    throw new Error("associate_analytics_data_set not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "associate_analytics_data_set failed");
  }
}

/** Associate approved origin. */
export async function associateApprovedOrigin(instanceId: string, origin: string): Promise<void> {
  try {
    // TODO: implement associate_approved_origin
    throw new Error("associate_approved_origin not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "associate_approved_origin failed");
  }
}

/** Associate bot. */
export async function associateBot(instanceId: string): Promise<void> {
  try {
    // TODO: implement associate_bot
    throw new Error("associate_bot not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "associate_bot failed");
  }
}

/** Associate contact with user. */
export async function associateContactWithUser(instanceId: string, contactId: string, userId: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement associate_contact_with_user
    throw new Error("associate_contact_with_user not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "associate_contact_with_user failed");
  }
}

/** Associate default vocabulary. */
export async function associateDefaultVocabulary(instanceId: string, languageCode: string): Promise<void> {
  try {
    // TODO: implement associate_default_vocabulary
    throw new Error("associate_default_vocabulary not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "associate_default_vocabulary failed");
  }
}

/** Associate email address alias. */
export async function associateEmailAddressAlias(emailAddressId: string, instanceId: string, aliasConfiguration: Record<string, unknown>): Promise<void> {
  try {
    // TODO: implement associate_email_address_alias
    throw new Error("associate_email_address_alias not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "associate_email_address_alias failed");
  }
}

/** Associate flow. */
export async function associateFlow(instanceId: string, resourceId: string, flowId: string, resourceType: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement associate_flow
    throw new Error("associate_flow not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "associate_flow failed");
  }
}

/** Associate instance storage config. */
export async function associateInstanceStorageConfig(instanceId: string, resourceType: string, storageConfig: Record<string, unknown>): Promise<AssociateInstanceStorageConfigResult> {
  try {
    // TODO: implement associate_instance_storage_config
    throw new Error("associate_instance_storage_config not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "associate_instance_storage_config failed");
  }
}

/** Associate lambda function. */
export async function associateLambdaFunction(instanceId: string, functionArn: string): Promise<void> {
  try {
    // TODO: implement associate_lambda_function
    throw new Error("associate_lambda_function not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "associate_lambda_function failed");
  }
}

/** Associate lex bot. */
export async function associateLexBot(instanceId: string, lexBot: Record<string, unknown>): Promise<void> {
  try {
    // TODO: implement associate_lex_bot
    throw new Error("associate_lex_bot not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "associate_lex_bot failed");
  }
}

/** Associate phone number contact flow. */
export async function associatePhoneNumberContactFlow(phoneNumberId: string, instanceId: string, contactFlowId: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement associate_phone_number_contact_flow
    throw new Error("associate_phone_number_contact_flow not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "associate_phone_number_contact_flow failed");
  }
}

/** Associate queue quick connects. */
export async function associateQueueQuickConnects(instanceId: string, queueId: string, quickConnectIds: string[], regionName?: string): Promise<void> {
  try {
    // TODO: implement associate_queue_quick_connects
    throw new Error("associate_queue_quick_connects not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "associate_queue_quick_connects failed");
  }
}

/** Associate routing profile queues. */
export async function associateRoutingProfileQueues(instanceId: string, routingProfileId: string): Promise<void> {
  try {
    // TODO: implement associate_routing_profile_queues
    throw new Error("associate_routing_profile_queues not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "associate_routing_profile_queues failed");
  }
}

/** Associate security key. */
export async function associateSecurityKey(instanceId: string, key: string): Promise<AssociateSecurityKeyResult> {
  try {
    // TODO: implement associate_security_key
    throw new Error("associate_security_key not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "associate_security_key failed");
  }
}

/** Associate traffic distribution group user. */
export async function associateTrafficDistributionGroupUser(trafficDistributionGroupId: string, userId: string, instanceId: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement associate_traffic_distribution_group_user
    throw new Error("associate_traffic_distribution_group_user not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "associate_traffic_distribution_group_user failed");
  }
}

/** Associate user proficiencies. */
export async function associateUserProficiencies(instanceId: string, userId: string, userProficiencies: Record<string, unknown>[], regionName?: string): Promise<void> {
  try {
    // TODO: implement associate_user_proficiencies
    throw new Error("associate_user_proficiencies not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "associate_user_proficiencies failed");
  }
}

/** Batch associate analytics data set. */
export async function batchAssociateAnalyticsDataSet(instanceId: string, dataSetIds: string[]): Promise<BatchAssociateAnalyticsDataSetResult> {
  try {
    // TODO: implement batch_associate_analytics_data_set
    throw new Error("batch_associate_analytics_data_set not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_associate_analytics_data_set failed");
  }
}

/** Batch disassociate analytics data set. */
export async function batchDisassociateAnalyticsDataSet(instanceId: string, dataSetIds: string[]): Promise<BatchDisassociateAnalyticsDataSetResult> {
  try {
    // TODO: implement batch_disassociate_analytics_data_set
    throw new Error("batch_disassociate_analytics_data_set not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_disassociate_analytics_data_set failed");
  }
}

/** Batch get attached file metadata. */
export async function batchGetAttachedFileMetadata(fileIds: string[], instanceId: string, associatedResourceArn: string, regionName?: string): Promise<BatchGetAttachedFileMetadataResult> {
  try {
    // TODO: implement batch_get_attached_file_metadata
    throw new Error("batch_get_attached_file_metadata not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_get_attached_file_metadata failed");
  }
}

/** Batch get flow association. */
export async function batchGetFlowAssociation(instanceId: string, resourceIds: string[]): Promise<BatchGetFlowAssociationResult> {
  try {
    // TODO: implement batch_get_flow_association
    throw new Error("batch_get_flow_association not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_get_flow_association failed");
  }
}

/** Batch put contact. */
export async function batchPutContact(instanceId: string, contactDataRequestList: Record<string, unknown>[]): Promise<BatchPutContactResult> {
  try {
    // TODO: implement batch_put_contact
    throw new Error("batch_put_contact not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_put_contact failed");
  }
}

/** Claim phone number. */
export async function claimPhoneNumber(phoneNumber: string): Promise<ClaimPhoneNumberResult> {
  try {
    // TODO: implement claim_phone_number
    throw new Error("claim_phone_number not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "claim_phone_number failed");
  }
}

/** Complete attached file upload. */
export async function completeAttachedFileUpload(instanceId: string, fileId: string, associatedResourceArn: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement complete_attached_file_upload
    throw new Error("complete_attached_file_upload not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "complete_attached_file_upload failed");
  }
}

/** Create agent status. */
export async function createAgentStatus(instanceId: string, name: string, state: string): Promise<CreateAgentStatusResult> {
  try {
    // TODO: implement create_agent_status
    throw new Error("create_agent_status not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_agent_status failed");
  }
}

/** Create contact. */
export async function createContact(instanceId: string, channel: string, initiationMethod: string): Promise<CreateContactResult> {
  try {
    // TODO: implement create_contact
    throw new Error("create_contact not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_contact failed");
  }
}

/** Create contact flow module. */
export async function createContactFlowModule(instanceId: string, name: string, content: string): Promise<CreateContactFlowModuleResult> {
  try {
    // TODO: implement create_contact_flow_module
    throw new Error("create_contact_flow_module not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_contact_flow_module failed");
  }
}

/** Create contact flow version. */
export async function createContactFlowVersion(instanceId: string, contactFlowId: string): Promise<CreateContactFlowVersionResult> {
  try {
    // TODO: implement create_contact_flow_version
    throw new Error("create_contact_flow_version not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_contact_flow_version failed");
  }
}

/** Create email address. */
export async function createEmailAddress(instanceId: string, emailAddress: string): Promise<CreateEmailAddressResult> {
  try {
    // TODO: implement create_email_address
    throw new Error("create_email_address not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_email_address failed");
  }
}

/** Create evaluation form. */
export async function createEvaluationForm(instanceId: string, title: string, items: Record<string, unknown>[]): Promise<CreateEvaluationFormResult> {
  try {
    // TODO: implement create_evaluation_form
    throw new Error("create_evaluation_form not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_evaluation_form failed");
  }
}

/** Create hours of operation. */
export async function createHoursOfOperation(instanceId: string, name: string, timeZone: string, config: Record<string, unknown>[]): Promise<CreateHoursOfOperationResult> {
  try {
    // TODO: implement create_hours_of_operation
    throw new Error("create_hours_of_operation not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_hours_of_operation failed");
  }
}

/** Create hours of operation override. */
export async function createHoursOfOperationOverride(instanceId: string, hoursOfOperationId: string, name: string, config: Record<string, unknown>[], effectiveFrom: string, effectiveTill: string): Promise<CreateHoursOfOperationOverrideResult> {
  try {
    // TODO: implement create_hours_of_operation_override
    throw new Error("create_hours_of_operation_override not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_hours_of_operation_override failed");
  }
}

/** Create integration association. */
export async function createIntegrationAssociation(instanceId: string, integrationType: string, integrationArn: string): Promise<CreateIntegrationAssociationResult> {
  try {
    // TODO: implement create_integration_association
    throw new Error("create_integration_association not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_integration_association failed");
  }
}

/** Create participant. */
export async function createParticipant(instanceId: string, contactId: string, participantDetails: Record<string, unknown>): Promise<CreateParticipantResult> {
  try {
    // TODO: implement create_participant
    throw new Error("create_participant not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_participant failed");
  }
}

/** Create persistent contact association. */
export async function createPersistentContactAssociation(instanceId: string, initialContactId: string, rehydrationType: string, sourceContactId: string): Promise<CreatePersistentContactAssociationResult> {
  try {
    // TODO: implement create_persistent_contact_association
    throw new Error("create_persistent_contact_association not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_persistent_contact_association failed");
  }
}

/** Create predefined attribute. */
export async function createPredefinedAttribute(instanceId: string, name: string): Promise<void> {
  try {
    // TODO: implement create_predefined_attribute
    throw new Error("create_predefined_attribute not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_predefined_attribute failed");
  }
}

/** Create prompt. */
export async function createPrompt(instanceId: string, name: string, s3Uri: string): Promise<CreatePromptResult> {
  try {
    // TODO: implement create_prompt
    throw new Error("create_prompt not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_prompt failed");
  }
}

/** Create push notification registration. */
export async function createPushNotificationRegistration(instanceId: string, pinpointAppArn: string, deviceToken: string, deviceType: string, contactConfiguration: Record<string, unknown>): Promise<CreatePushNotificationRegistrationResult> {
  try {
    // TODO: implement create_push_notification_registration
    throw new Error("create_push_notification_registration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_push_notification_registration failed");
  }
}

/** Create quick connect. */
export async function createQuickConnect(instanceId: string, name: string, quickConnectConfig: Record<string, unknown>): Promise<CreateQuickConnectResult> {
  try {
    // TODO: implement create_quick_connect
    throw new Error("create_quick_connect not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_quick_connect failed");
  }
}

/** Create rule. */
export async function createRule(instanceId: string, name: string, triggerEventSource: Record<string, unknown>, function: string, actions: Record<string, unknown>[], publishStatus: string): Promise<CreateRuleResult> {
  try {
    // TODO: implement create_rule
    throw new Error("create_rule not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_rule failed");
  }
}

/** Create security profile. */
export async function createSecurityProfile(securityProfileName: string, instanceId: string): Promise<CreateSecurityProfileResult> {
  try {
    // TODO: implement create_security_profile
    throw new Error("create_security_profile not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_security_profile failed");
  }
}

/** Create task template. */
export async function createTaskTemplate(instanceId: string, name: string, fields: Record<string, unknown>[]): Promise<CreateTaskTemplateResult> {
  try {
    // TODO: implement create_task_template
    throw new Error("create_task_template not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_task_template failed");
  }
}

/** Create traffic distribution group. */
export async function createTrafficDistributionGroup(name: string, instanceId: string): Promise<CreateTrafficDistributionGroupResult> {
  try {
    // TODO: implement create_traffic_distribution_group
    throw new Error("create_traffic_distribution_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_traffic_distribution_group failed");
  }
}

/** Create use case. */
export async function createUseCase(instanceId: string, integrationAssociationId: string, useCaseType: string): Promise<CreateUseCaseResult> {
  try {
    // TODO: implement create_use_case
    throw new Error("create_use_case not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_use_case failed");
  }
}

/** Create user hierarchy group. */
export async function createUserHierarchyGroup(name: string, instanceId: string): Promise<CreateUserHierarchyGroupResult> {
  try {
    // TODO: implement create_user_hierarchy_group
    throw new Error("create_user_hierarchy_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_user_hierarchy_group failed");
  }
}

/** Create view. */
export async function createView(instanceId: string, status: string, content: Record<string, unknown>, name: string): Promise<CreateViewResult> {
  try {
    // TODO: implement create_view
    throw new Error("create_view not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_view failed");
  }
}

/** Create view version. */
export async function createViewVersion(instanceId: string, viewId: string): Promise<CreateViewVersionResult> {
  try {
    // TODO: implement create_view_version
    throw new Error("create_view_version not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_view_version failed");
  }
}

/** Create vocabulary. */
export async function createVocabulary(instanceId: string, vocabularyName: string, languageCode: string, content: string): Promise<CreateVocabularyResult> {
  try {
    // TODO: implement create_vocabulary
    throw new Error("create_vocabulary not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_vocabulary failed");
  }
}

/** Deactivate evaluation form. */
export async function deactivateEvaluationForm(instanceId: string, evaluationFormId: string, evaluationFormVersion: number, regionName?: string): Promise<DeactivateEvaluationFormResult> {
  try {
    // TODO: implement deactivate_evaluation_form
    throw new Error("deactivate_evaluation_form not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "deactivate_evaluation_form failed");
  }
}

/** Delete attached file. */
export async function deleteAttachedFile(instanceId: string, fileId: string, associatedResourceArn: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_attached_file
    throw new Error("delete_attached_file not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_attached_file failed");
  }
}

/** Delete contact evaluation. */
export async function deleteContactEvaluation(instanceId: string, evaluationId: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_contact_evaluation
    throw new Error("delete_contact_evaluation not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_contact_evaluation failed");
  }
}

/** Delete contact flow. */
export async function deleteContactFlow(instanceId: string, contactFlowId: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_contact_flow
    throw new Error("delete_contact_flow not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_contact_flow failed");
  }
}

/** Delete contact flow module. */
export async function deleteContactFlowModule(instanceId: string, contactFlowModuleId: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_contact_flow_module
    throw new Error("delete_contact_flow_module not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_contact_flow_module failed");
  }
}

/** Delete contact flow version. */
export async function deleteContactFlowVersion(instanceId: string, contactFlowId: string, contactFlowVersion: number, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_contact_flow_version
    throw new Error("delete_contact_flow_version not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_contact_flow_version failed");
  }
}

/** Delete email address. */
export async function deleteEmailAddress(instanceId: string, emailAddressId: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_email_address
    throw new Error("delete_email_address not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_email_address failed");
  }
}

/** Delete evaluation form. */
export async function deleteEvaluationForm(instanceId: string, evaluationFormId: string): Promise<void> {
  try {
    // TODO: implement delete_evaluation_form
    throw new Error("delete_evaluation_form not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_evaluation_form failed");
  }
}

/** Delete hours of operation. */
export async function deleteHoursOfOperation(instanceId: string, hoursOfOperationId: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_hours_of_operation
    throw new Error("delete_hours_of_operation not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_hours_of_operation failed");
  }
}

/** Delete hours of operation override. */
export async function deleteHoursOfOperationOverride(instanceId: string, hoursOfOperationId: string, hoursOfOperationOverrideId: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_hours_of_operation_override
    throw new Error("delete_hours_of_operation_override not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_hours_of_operation_override failed");
  }
}

/** Delete integration association. */
export async function deleteIntegrationAssociation(instanceId: string, integrationAssociationId: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_integration_association
    throw new Error("delete_integration_association not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_integration_association failed");
  }
}

/** Delete predefined attribute. */
export async function deletePredefinedAttribute(instanceId: string, name: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_predefined_attribute
    throw new Error("delete_predefined_attribute not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_predefined_attribute failed");
  }
}

/** Delete prompt. */
export async function deletePrompt(instanceId: string, promptId: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_prompt
    throw new Error("delete_prompt not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_prompt failed");
  }
}

/** Delete push notification registration. */
export async function deletePushNotificationRegistration(instanceId: string, registrationId: string, contactId: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_push_notification_registration
    throw new Error("delete_push_notification_registration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_push_notification_registration failed");
  }
}

/** Delete queue. */
export async function deleteQueue(instanceId: string, queueId: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_queue
    throw new Error("delete_queue not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_queue failed");
  }
}

/** Delete quick connect. */
export async function deleteQuickConnect(instanceId: string, quickConnectId: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_quick_connect
    throw new Error("delete_quick_connect not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_quick_connect failed");
  }
}

/** Delete routing profile. */
export async function deleteRoutingProfile(instanceId: string, routingProfileId: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_routing_profile
    throw new Error("delete_routing_profile not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_routing_profile failed");
  }
}

/** Delete rule. */
export async function deleteRule(instanceId: string, ruleId: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_rule
    throw new Error("delete_rule not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_rule failed");
  }
}

/** Delete security profile. */
export async function deleteSecurityProfile(instanceId: string, securityProfileId: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_security_profile
    throw new Error("delete_security_profile not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_security_profile failed");
  }
}

/** Delete task template. */
export async function deleteTaskTemplate(instanceId: string, taskTemplateId: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_task_template
    throw new Error("delete_task_template not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_task_template failed");
  }
}

/** Delete traffic distribution group. */
export async function deleteTrafficDistributionGroup(trafficDistributionGroupId: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_traffic_distribution_group
    throw new Error("delete_traffic_distribution_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_traffic_distribution_group failed");
  }
}

/** Delete use case. */
export async function deleteUseCase(instanceId: string, integrationAssociationId: string, useCaseId: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_use_case
    throw new Error("delete_use_case not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_use_case failed");
  }
}

/** Delete user hierarchy group. */
export async function deleteUserHierarchyGroup(hierarchyGroupId: string, instanceId: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_user_hierarchy_group
    throw new Error("delete_user_hierarchy_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_user_hierarchy_group failed");
  }
}

/** Delete view. */
export async function deleteView(instanceId: string, viewId: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_view
    throw new Error("delete_view not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_view failed");
  }
}

/** Delete view version. */
export async function deleteViewVersion(instanceId: string, viewId: string, viewVersion: number, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_view_version
    throw new Error("delete_view_version not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_view_version failed");
  }
}

/** Delete vocabulary. */
export async function deleteVocabulary(instanceId: string, vocabularyId: string, regionName?: string): Promise<DeleteVocabularyResult> {
  try {
    // TODO: implement delete_vocabulary
    throw new Error("delete_vocabulary not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_vocabulary failed");
  }
}

/** Describe agent status. */
export async function describeAgentStatus(instanceId: string, agentStatusId: string, regionName?: string): Promise<DescribeAgentStatusResult> {
  try {
    // TODO: implement describe_agent_status
    throw new Error("describe_agent_status not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_agent_status failed");
  }
}

/** Describe authentication profile. */
export async function describeAuthenticationProfile(authenticationProfileId: string, instanceId: string, regionName?: string): Promise<DescribeAuthenticationProfileResult> {
  try {
    // TODO: implement describe_authentication_profile
    throw new Error("describe_authentication_profile not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_authentication_profile failed");
  }
}

/** Describe contact. */
export async function describeContact(instanceId: string, contactId: string, regionName?: string): Promise<DescribeContactResult> {
  try {
    // TODO: implement describe_contact
    throw new Error("describe_contact not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_contact failed");
  }
}

/** Describe contact evaluation. */
export async function describeContactEvaluation(instanceId: string, evaluationId: string, regionName?: string): Promise<DescribeContactEvaluationResult> {
  try {
    // TODO: implement describe_contact_evaluation
    throw new Error("describe_contact_evaluation not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_contact_evaluation failed");
  }
}

/** Describe contact flow module. */
export async function describeContactFlowModule(instanceId: string, contactFlowModuleId: string, regionName?: string): Promise<DescribeContactFlowModuleResult> {
  try {
    // TODO: implement describe_contact_flow_module
    throw new Error("describe_contact_flow_module not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_contact_flow_module failed");
  }
}

/** Describe email address. */
export async function describeEmailAddress(instanceId: string, emailAddressId: string, regionName?: string): Promise<DescribeEmailAddressResult> {
  try {
    // TODO: implement describe_email_address
    throw new Error("describe_email_address not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_email_address failed");
  }
}

/** Describe evaluation form. */
export async function describeEvaluationForm(instanceId: string, evaluationFormId: string): Promise<DescribeEvaluationFormResult> {
  try {
    // TODO: implement describe_evaluation_form
    throw new Error("describe_evaluation_form not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_evaluation_form failed");
  }
}

/** Describe hours of operation. */
export async function describeHoursOfOperation(instanceId: string, hoursOfOperationId: string, regionName?: string): Promise<DescribeHoursOfOperationResult> {
  try {
    // TODO: implement describe_hours_of_operation
    throw new Error("describe_hours_of_operation not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_hours_of_operation failed");
  }
}

/** Describe hours of operation override. */
export async function describeHoursOfOperationOverride(instanceId: string, hoursOfOperationId: string, hoursOfOperationOverrideId: string, regionName?: string): Promise<DescribeHoursOfOperationOverrideResult> {
  try {
    // TODO: implement describe_hours_of_operation_override
    throw new Error("describe_hours_of_operation_override not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_hours_of_operation_override failed");
  }
}

/** Describe instance attribute. */
export async function describeInstanceAttribute(instanceId: string, attributeType: string, regionName?: string): Promise<DescribeInstanceAttributeResult> {
  try {
    // TODO: implement describe_instance_attribute
    throw new Error("describe_instance_attribute not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_instance_attribute failed");
  }
}

/** Describe instance storage config. */
export async function describeInstanceStorageConfig(instanceId: string, associationId: string, resourceType: string, regionName?: string): Promise<DescribeInstanceStorageConfigResult> {
  try {
    // TODO: implement describe_instance_storage_config
    throw new Error("describe_instance_storage_config not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_instance_storage_config failed");
  }
}

/** Describe phone number. */
export async function describePhoneNumber(phoneNumberId: string, regionName?: string): Promise<DescribePhoneNumberResult> {
  try {
    // TODO: implement describe_phone_number
    throw new Error("describe_phone_number not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_phone_number failed");
  }
}

/** Describe predefined attribute. */
export async function describePredefinedAttribute(instanceId: string, name: string, regionName?: string): Promise<DescribePredefinedAttributeResult> {
  try {
    // TODO: implement describe_predefined_attribute
    throw new Error("describe_predefined_attribute not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_predefined_attribute failed");
  }
}

/** Describe prompt. */
export async function describePrompt(instanceId: string, promptId: string, regionName?: string): Promise<DescribePromptResult> {
  try {
    // TODO: implement describe_prompt
    throw new Error("describe_prompt not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_prompt failed");
  }
}

/** Describe quick connect. */
export async function describeQuickConnect(instanceId: string, quickConnectId: string, regionName?: string): Promise<DescribeQuickConnectResult> {
  try {
    // TODO: implement describe_quick_connect
    throw new Error("describe_quick_connect not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_quick_connect failed");
  }
}

/** Describe rule. */
export async function describeRule(instanceId: string, ruleId: string, regionName?: string): Promise<DescribeRuleResult> {
  try {
    // TODO: implement describe_rule
    throw new Error("describe_rule not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_rule failed");
  }
}

/** Describe security profile. */
export async function describeSecurityProfile(securityProfileId: string, instanceId: string, regionName?: string): Promise<DescribeSecurityProfileResult> {
  try {
    // TODO: implement describe_security_profile
    throw new Error("describe_security_profile not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_security_profile failed");
  }
}

/** Describe traffic distribution group. */
export async function describeTrafficDistributionGroup(trafficDistributionGroupId: string, regionName?: string): Promise<DescribeTrafficDistributionGroupResult> {
  try {
    // TODO: implement describe_traffic_distribution_group
    throw new Error("describe_traffic_distribution_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_traffic_distribution_group failed");
  }
}

/** Describe user hierarchy group. */
export async function describeUserHierarchyGroup(hierarchyGroupId: string, instanceId: string, regionName?: string): Promise<DescribeUserHierarchyGroupResult> {
  try {
    // TODO: implement describe_user_hierarchy_group
    throw new Error("describe_user_hierarchy_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_user_hierarchy_group failed");
  }
}

/** Describe user hierarchy structure. */
export async function describeUserHierarchyStructure(instanceId: string, regionName?: string): Promise<DescribeUserHierarchyStructureResult> {
  try {
    // TODO: implement describe_user_hierarchy_structure
    throw new Error("describe_user_hierarchy_structure not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_user_hierarchy_structure failed");
  }
}

/** Describe view. */
export async function describeView(instanceId: string, viewId: string, regionName?: string): Promise<DescribeViewResult> {
  try {
    // TODO: implement describe_view
    throw new Error("describe_view not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_view failed");
  }
}

/** Describe vocabulary. */
export async function describeVocabulary(instanceId: string, vocabularyId: string, regionName?: string): Promise<DescribeVocabularyResult> {
  try {
    // TODO: implement describe_vocabulary
    throw new Error("describe_vocabulary not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_vocabulary failed");
  }
}

/** Disassociate analytics data set. */
export async function disassociateAnalyticsDataSet(instanceId: string, dataSetId: string): Promise<void> {
  try {
    // TODO: implement disassociate_analytics_data_set
    throw new Error("disassociate_analytics_data_set not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disassociate_analytics_data_set failed");
  }
}

/** Disassociate approved origin. */
export async function disassociateApprovedOrigin(instanceId: string, origin: string): Promise<void> {
  try {
    // TODO: implement disassociate_approved_origin
    throw new Error("disassociate_approved_origin not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disassociate_approved_origin failed");
  }
}

/** Disassociate bot. */
export async function disassociateBot(instanceId: string): Promise<void> {
  try {
    // TODO: implement disassociate_bot
    throw new Error("disassociate_bot not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disassociate_bot failed");
  }
}

/** Disassociate email address alias. */
export async function disassociateEmailAddressAlias(emailAddressId: string, instanceId: string, aliasConfiguration: Record<string, unknown>): Promise<void> {
  try {
    // TODO: implement disassociate_email_address_alias
    throw new Error("disassociate_email_address_alias not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disassociate_email_address_alias failed");
  }
}

/** Disassociate flow. */
export async function disassociateFlow(instanceId: string, resourceId: string, resourceType: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement disassociate_flow
    throw new Error("disassociate_flow not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disassociate_flow failed");
  }
}

/** Disassociate instance storage config. */
export async function disassociateInstanceStorageConfig(instanceId: string, associationId: string, resourceType: string): Promise<void> {
  try {
    // TODO: implement disassociate_instance_storage_config
    throw new Error("disassociate_instance_storage_config not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disassociate_instance_storage_config failed");
  }
}

/** Disassociate lambda function. */
export async function disassociateLambdaFunction(instanceId: string, functionArn: string): Promise<void> {
  try {
    // TODO: implement disassociate_lambda_function
    throw new Error("disassociate_lambda_function not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disassociate_lambda_function failed");
  }
}

/** Disassociate lex bot. */
export async function disassociateLexBot(instanceId: string, botName: string, lexRegion: string): Promise<void> {
  try {
    // TODO: implement disassociate_lex_bot
    throw new Error("disassociate_lex_bot not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disassociate_lex_bot failed");
  }
}

/** Disassociate phone number contact flow. */
export async function disassociatePhoneNumberContactFlow(phoneNumberId: string, instanceId: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement disassociate_phone_number_contact_flow
    throw new Error("disassociate_phone_number_contact_flow not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disassociate_phone_number_contact_flow failed");
  }
}

/** Disassociate queue quick connects. */
export async function disassociateQueueQuickConnects(instanceId: string, queueId: string, quickConnectIds: string[], regionName?: string): Promise<void> {
  try {
    // TODO: implement disassociate_queue_quick_connects
    throw new Error("disassociate_queue_quick_connects not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disassociate_queue_quick_connects failed");
  }
}

/** Disassociate routing profile queues. */
export async function disassociateRoutingProfileQueues(instanceId: string, routingProfileId: string): Promise<void> {
  try {
    // TODO: implement disassociate_routing_profile_queues
    throw new Error("disassociate_routing_profile_queues not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disassociate_routing_profile_queues failed");
  }
}

/** Disassociate security key. */
export async function disassociateSecurityKey(instanceId: string, associationId: string): Promise<void> {
  try {
    // TODO: implement disassociate_security_key
    throw new Error("disassociate_security_key not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disassociate_security_key failed");
  }
}

/** Disassociate traffic distribution group user. */
export async function disassociateTrafficDistributionGroupUser(trafficDistributionGroupId: string, userId: string, instanceId: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement disassociate_traffic_distribution_group_user
    throw new Error("disassociate_traffic_distribution_group_user not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disassociate_traffic_distribution_group_user failed");
  }
}

/** Disassociate user proficiencies. */
export async function disassociateUserProficiencies(instanceId: string, userId: string, userProficiencies: Record<string, unknown>[], regionName?: string): Promise<void> {
  try {
    // TODO: implement disassociate_user_proficiencies
    throw new Error("disassociate_user_proficiencies not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disassociate_user_proficiencies failed");
  }
}

/** Dismiss user contact. */
export async function dismissUserContact(userId: string, instanceId: string, contactId: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement dismiss_user_contact
    throw new Error("dismiss_user_contact not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "dismiss_user_contact failed");
  }
}

/** Get attached file. */
export async function getAttachedFile(instanceId: string, fileId: string, associatedResourceArn: string): Promise<GetAttachedFileResult> {
  try {
    // TODO: implement get_attached_file
    throw new Error("get_attached_file not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_attached_file failed");
  }
}

/** Get contact metrics. */
export async function getContactMetrics(instanceId: string, contactId: string, metrics: Record<string, unknown>[], regionName?: string): Promise<GetContactMetricsResult> {
  try {
    // TODO: implement get_contact_metrics
    throw new Error("get_contact_metrics not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_contact_metrics failed");
  }
}

/** Get current user data. */
export async function getCurrentUserData(instanceId: string, filters: Record<string, unknown>): Promise<GetCurrentUserDataResult> {
  try {
    // TODO: implement get_current_user_data
    throw new Error("get_current_user_data not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_current_user_data failed");
  }
}

/** Get effective hours of operations. */
export async function getEffectiveHoursOfOperations(instanceId: string, hoursOfOperationId: string, fromDate: string, toDate: string, regionName?: string): Promise<GetEffectiveHoursOfOperationsResult> {
  try {
    // TODO: implement get_effective_hours_of_operations
    throw new Error("get_effective_hours_of_operations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_effective_hours_of_operations failed");
  }
}

/** Get federation token. */
export async function getFederationToken(instanceId: string, regionName?: string): Promise<GetFederationTokenResult> {
  try {
    // TODO: implement get_federation_token
    throw new Error("get_federation_token not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_federation_token failed");
  }
}

/** Get flow association. */
export async function getFlowAssociation(instanceId: string, resourceId: string, resourceType: string, regionName?: string): Promise<GetFlowAssociationResult> {
  try {
    // TODO: implement get_flow_association
    throw new Error("get_flow_association not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_flow_association failed");
  }
}

/** Get metric data. */
export async function getMetricData(instanceId: string, startTime: string, endTime: string, filters: Record<string, unknown>, historicalMetrics: Record<string, unknown>[]): Promise<GetMetricDataResult> {
  try {
    // TODO: implement get_metric_data
    throw new Error("get_metric_data not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_metric_data failed");
  }
}

/** Get metric data v2. */
export async function getMetricDataV2(resourceArn: string, startTime: string, endTime: string, filters: Record<string, unknown>[], metrics: Record<string, unknown>[]): Promise<GetMetricDataV2Result> {
  try {
    // TODO: implement get_metric_data_v2
    throw new Error("get_metric_data_v2 not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_metric_data_v2 failed");
  }
}

/** Get prompt file. */
export async function getPromptFile(instanceId: string, promptId: string, regionName?: string): Promise<GetPromptFileResult> {
  try {
    // TODO: implement get_prompt_file
    throw new Error("get_prompt_file not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_prompt_file failed");
  }
}

/** Get task template. */
export async function getTaskTemplate(instanceId: string, taskTemplateId: string): Promise<GetTaskTemplateResult> {
  try {
    // TODO: implement get_task_template
    throw new Error("get_task_template not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_task_template failed");
  }
}

/** Get traffic distribution. */
export async function getTrafficDistribution(id: string, regionName?: string): Promise<GetTrafficDistributionResult> {
  try {
    // TODO: implement get_traffic_distribution
    throw new Error("get_traffic_distribution not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_traffic_distribution failed");
  }
}

/** Import phone number. */
export async function importPhoneNumber(instanceId: string, sourcePhoneNumberArn: string): Promise<ImportPhoneNumberResult> {
  try {
    // TODO: implement import_phone_number
    throw new Error("import_phone_number not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "import_phone_number failed");
  }
}

/** List agent statuses. */
export async function listAgentStatuses(instanceId: string): Promise<ListAgentStatusesResult> {
  try {
    // TODO: implement list_agent_statuses
    throw new Error("list_agent_statuses not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_agent_statuses failed");
  }
}

/** List analytics data associations. */
export async function listAnalyticsDataAssociations(instanceId: string): Promise<ListAnalyticsDataAssociationsResult> {
  try {
    // TODO: implement list_analytics_data_associations
    throw new Error("list_analytics_data_associations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_analytics_data_associations failed");
  }
}

/** List analytics data lake data sets. */
export async function listAnalyticsDataLakeDataSets(instanceId: string): Promise<ListAnalyticsDataLakeDataSetsResult> {
  try {
    // TODO: implement list_analytics_data_lake_data_sets
    throw new Error("list_analytics_data_lake_data_sets not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_analytics_data_lake_data_sets failed");
  }
}

/** List approved origins. */
export async function listApprovedOrigins(instanceId: string): Promise<ListApprovedOriginsResult> {
  try {
    // TODO: implement list_approved_origins
    throw new Error("list_approved_origins not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_approved_origins failed");
  }
}

/** List associated contacts. */
export async function listAssociatedContacts(instanceId: string, contactId: string): Promise<ListAssociatedContactsResult> {
  try {
    // TODO: implement list_associated_contacts
    throw new Error("list_associated_contacts not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_associated_contacts failed");
  }
}

/** List authentication profiles. */
export async function listAuthenticationProfiles(instanceId: string): Promise<ListAuthenticationProfilesResult> {
  try {
    // TODO: implement list_authentication_profiles
    throw new Error("list_authentication_profiles not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_authentication_profiles failed");
  }
}

/** List bots. */
export async function listBots(instanceId: string, lexVersion: string): Promise<ListBotsResult> {
  try {
    // TODO: implement list_bots
    throw new Error("list_bots not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_bots failed");
  }
}

/** List contact evaluations. */
export async function listContactEvaluations(instanceId: string, contactId: string): Promise<ListContactEvaluationsResult> {
  try {
    // TODO: implement list_contact_evaluations
    throw new Error("list_contact_evaluations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_contact_evaluations failed");
  }
}

/** List contact flow modules. */
export async function listContactFlowModules(instanceId: string): Promise<ListContactFlowModulesResult> {
  try {
    // TODO: implement list_contact_flow_modules
    throw new Error("list_contact_flow_modules not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_contact_flow_modules failed");
  }
}

/** List contact flow versions. */
export async function listContactFlowVersions(instanceId: string, contactFlowId: string): Promise<ListContactFlowVersionsResult> {
  try {
    // TODO: implement list_contact_flow_versions
    throw new Error("list_contact_flow_versions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_contact_flow_versions failed");
  }
}

/** List contact references. */
export async function listContactReferences(instanceId: string, contactId: string, referenceTypes: string[]): Promise<ListContactReferencesResult> {
  try {
    // TODO: implement list_contact_references
    throw new Error("list_contact_references not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_contact_references failed");
  }
}

/** List default vocabularies. */
export async function listDefaultVocabularies(instanceId: string): Promise<ListDefaultVocabulariesResult> {
  try {
    // TODO: implement list_default_vocabularies
    throw new Error("list_default_vocabularies not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_default_vocabularies failed");
  }
}

/** List evaluation form versions. */
export async function listEvaluationFormVersions(instanceId: string, evaluationFormId: string): Promise<ListEvaluationFormVersionsResult> {
  try {
    // TODO: implement list_evaluation_form_versions
    throw new Error("list_evaluation_form_versions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_evaluation_form_versions failed");
  }
}

/** List evaluation forms. */
export async function listEvaluationForms(instanceId: string): Promise<ListEvaluationFormsResult> {
  try {
    // TODO: implement list_evaluation_forms
    throw new Error("list_evaluation_forms not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_evaluation_forms failed");
  }
}

/** List flow associations. */
export async function listFlowAssociations(instanceId: string): Promise<ListFlowAssociationsResult> {
  try {
    // TODO: implement list_flow_associations
    throw new Error("list_flow_associations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_flow_associations failed");
  }
}

/** List hours of operation overrides. */
export async function listHoursOfOperationOverrides(instanceId: string, hoursOfOperationId: string): Promise<ListHoursOfOperationOverridesResult> {
  try {
    // TODO: implement list_hours_of_operation_overrides
    throw new Error("list_hours_of_operation_overrides not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_hours_of_operation_overrides failed");
  }
}

/** List hours of operations. */
export async function listHoursOfOperations(instanceId: string): Promise<ListHoursOfOperationsResult> {
  try {
    // TODO: implement list_hours_of_operations
    throw new Error("list_hours_of_operations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_hours_of_operations failed");
  }
}

/** List instance attributes. */
export async function listInstanceAttributes(instanceId: string): Promise<ListInstanceAttributesResult> {
  try {
    // TODO: implement list_instance_attributes
    throw new Error("list_instance_attributes not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_instance_attributes failed");
  }
}

/** List instance storage configs. */
export async function listInstanceStorageConfigs(instanceId: string, resourceType: string): Promise<ListInstanceStorageConfigsResult> {
  try {
    // TODO: implement list_instance_storage_configs
    throw new Error("list_instance_storage_configs not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_instance_storage_configs failed");
  }
}

/** List integration associations. */
export async function listIntegrationAssociations(instanceId: string): Promise<ListIntegrationAssociationsResult> {
  try {
    // TODO: implement list_integration_associations
    throw new Error("list_integration_associations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_integration_associations failed");
  }
}

/** List lambda functions. */
export async function listLambdaFunctions(instanceId: string): Promise<ListLambdaFunctionsResult> {
  try {
    // TODO: implement list_lambda_functions
    throw new Error("list_lambda_functions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_lambda_functions failed");
  }
}

/** List lex bots. */
export async function listLexBots(instanceId: string): Promise<ListLexBotsResult> {
  try {
    // TODO: implement list_lex_bots
    throw new Error("list_lex_bots not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_lex_bots failed");
  }
}

/** List phone numbers. */
export async function listPhoneNumbers(instanceId: string): Promise<ListPhoneNumbersResult> {
  try {
    // TODO: implement list_phone_numbers
    throw new Error("list_phone_numbers not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_phone_numbers failed");
  }
}

/** List phone numbers v2. */
export async function listPhoneNumbersV2(): Promise<ListPhoneNumbersV2Result> {
  try {
    // TODO: implement list_phone_numbers_v2
    throw new Error("list_phone_numbers_v2 not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_phone_numbers_v2 failed");
  }
}

/** List predefined attributes. */
export async function listPredefinedAttributes(instanceId: string): Promise<ListPredefinedAttributesResult> {
  try {
    // TODO: implement list_predefined_attributes
    throw new Error("list_predefined_attributes not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_predefined_attributes failed");
  }
}

/** List prompts. */
export async function listPrompts(instanceId: string): Promise<ListPromptsResult> {
  try {
    // TODO: implement list_prompts
    throw new Error("list_prompts not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_prompts failed");
  }
}

/** List queue quick connects. */
export async function listQueueQuickConnects(instanceId: string, queueId: string): Promise<ListQueueQuickConnectsResult> {
  try {
    // TODO: implement list_queue_quick_connects
    throw new Error("list_queue_quick_connects not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_queue_quick_connects failed");
  }
}

/** List quick connects. */
export async function listQuickConnects(instanceId: string): Promise<ListQuickConnectsResult> {
  try {
    // TODO: implement list_quick_connects
    throw new Error("list_quick_connects not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_quick_connects failed");
  }
}

/** List realtime contact analysis segments v2. */
export async function listRealtimeContactAnalysisSegmentsV2(instanceId: string, contactId: string, outputType: string, segmentTypes: string[]): Promise<ListRealtimeContactAnalysisSegmentsV2Result> {
  try {
    // TODO: implement list_realtime_contact_analysis_segments_v2
    throw new Error("list_realtime_contact_analysis_segments_v2 not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_realtime_contact_analysis_segments_v2 failed");
  }
}

/** List routing profile manual assignment queues. */
export async function listRoutingProfileManualAssignmentQueues(instanceId: string, routingProfileId: string): Promise<ListRoutingProfileManualAssignmentQueuesResult> {
  try {
    // TODO: implement list_routing_profile_manual_assignment_queues
    throw new Error("list_routing_profile_manual_assignment_queues not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_routing_profile_manual_assignment_queues failed");
  }
}

/** List routing profile queues. */
export async function listRoutingProfileQueues(instanceId: string, routingProfileId: string): Promise<ListRoutingProfileQueuesResult> {
  try {
    // TODO: implement list_routing_profile_queues
    throw new Error("list_routing_profile_queues not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_routing_profile_queues failed");
  }
}

/** List rules. */
export async function listRules(instanceId: string): Promise<ListRulesResult> {
  try {
    // TODO: implement list_rules
    throw new Error("list_rules not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_rules failed");
  }
}

/** List security keys. */
export async function listSecurityKeys(instanceId: string): Promise<ListSecurityKeysResult> {
  try {
    // TODO: implement list_security_keys
    throw new Error("list_security_keys not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_security_keys failed");
  }
}

/** List security profile applications. */
export async function listSecurityProfileApplications(securityProfileId: string, instanceId: string): Promise<ListSecurityProfileApplicationsResult> {
  try {
    // TODO: implement list_security_profile_applications
    throw new Error("list_security_profile_applications not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_security_profile_applications failed");
  }
}

/** List security profile permissions. */
export async function listSecurityProfilePermissions(securityProfileId: string, instanceId: string): Promise<ListSecurityProfilePermissionsResult> {
  try {
    // TODO: implement list_security_profile_permissions
    throw new Error("list_security_profile_permissions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_security_profile_permissions failed");
  }
}

/** List security profiles. */
export async function listSecurityProfiles(instanceId: string): Promise<ListSecurityProfilesResult> {
  try {
    // TODO: implement list_security_profiles
    throw new Error("list_security_profiles not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_security_profiles failed");
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

/** List task templates. */
export async function listTaskTemplates(instanceId: string): Promise<ListTaskTemplatesResult> {
  try {
    // TODO: implement list_task_templates
    throw new Error("list_task_templates not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_task_templates failed");
  }
}

/** List traffic distribution group users. */
export async function listTrafficDistributionGroupUsers(trafficDistributionGroupId: string): Promise<ListTrafficDistributionGroupUsersResult> {
  try {
    // TODO: implement list_traffic_distribution_group_users
    throw new Error("list_traffic_distribution_group_users not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_traffic_distribution_group_users failed");
  }
}

/** List traffic distribution groups. */
export async function listTrafficDistributionGroups(): Promise<ListTrafficDistributionGroupsResult> {
  try {
    // TODO: implement list_traffic_distribution_groups
    throw new Error("list_traffic_distribution_groups not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_traffic_distribution_groups failed");
  }
}

/** List use cases. */
export async function listUseCases(instanceId: string, integrationAssociationId: string): Promise<ListUseCasesResult> {
  try {
    // TODO: implement list_use_cases
    throw new Error("list_use_cases not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_use_cases failed");
  }
}

/** List user hierarchy groups. */
export async function listUserHierarchyGroups(instanceId: string): Promise<ListUserHierarchyGroupsResult> {
  try {
    // TODO: implement list_user_hierarchy_groups
    throw new Error("list_user_hierarchy_groups not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_user_hierarchy_groups failed");
  }
}

/** List user proficiencies. */
export async function listUserProficiencies(instanceId: string, userId: string): Promise<ListUserProficienciesResult> {
  try {
    // TODO: implement list_user_proficiencies
    throw new Error("list_user_proficiencies not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_user_proficiencies failed");
  }
}

/** List view versions. */
export async function listViewVersions(instanceId: string, viewId: string): Promise<ListViewVersionsResult> {
  try {
    // TODO: implement list_view_versions
    throw new Error("list_view_versions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_view_versions failed");
  }
}

/** List views. */
export async function listViews(instanceId: string): Promise<ListViewsResult> {
  try {
    // TODO: implement list_views
    throw new Error("list_views not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_views failed");
  }
}

/** Monitor contact. */
export async function monitorContact(instanceId: string, contactId: string, userId: string): Promise<MonitorContactResult> {
  try {
    // TODO: implement monitor_contact
    throw new Error("monitor_contact not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "monitor_contact failed");
  }
}

/** Pause contact. */
export async function pauseContact(contactId: string, instanceId: string): Promise<void> {
  try {
    // TODO: implement pause_contact
    throw new Error("pause_contact not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "pause_contact failed");
  }
}

/** Put user status. */
export async function putUserStatus(userId: string, instanceId: string, agentStatusId: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement put_user_status
    throw new Error("put_user_status not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_user_status failed");
  }
}

/** Release phone number. */
export async function releasePhoneNumber(phoneNumberId: string): Promise<void> {
  try {
    // TODO: implement release_phone_number
    throw new Error("release_phone_number not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "release_phone_number failed");
  }
}

/** Replicate instance. */
export async function replicateInstance(instanceId: string, replicaRegion: string, replicaAlias: string): Promise<ReplicateInstanceResult> {
  try {
    // TODO: implement replicate_instance
    throw new Error("replicate_instance not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "replicate_instance failed");
  }
}

/** Resume contact. */
export async function resumeContact(contactId: string, instanceId: string): Promise<void> {
  try {
    // TODO: implement resume_contact
    throw new Error("resume_contact not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "resume_contact failed");
  }
}

/** Resume contact recording. */
export async function resumeContactRecording(instanceId: string, contactId: string, initialContactId: string): Promise<void> {
  try {
    // TODO: implement resume_contact_recording
    throw new Error("resume_contact_recording not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "resume_contact_recording failed");
  }
}

/** Search agent statuses. */
export async function searchAgentStatuses(instanceId: string): Promise<SearchAgentStatusesResult> {
  try {
    // TODO: implement search_agent_statuses
    throw new Error("search_agent_statuses not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "search_agent_statuses failed");
  }
}

/** Search available phone numbers. */
export async function searchAvailablePhoneNumbers(phoneNumberCountryCode: string, phoneNumberType: string): Promise<SearchAvailablePhoneNumbersResult> {
  try {
    // TODO: implement search_available_phone_numbers
    throw new Error("search_available_phone_numbers not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "search_available_phone_numbers failed");
  }
}

/** Search contact evaluations. */
export async function searchContactEvaluations(instanceId: string): Promise<SearchContactEvaluationsResult> {
  try {
    // TODO: implement search_contact_evaluations
    throw new Error("search_contact_evaluations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "search_contact_evaluations failed");
  }
}

/** Search contact flow modules. */
export async function searchContactFlowModules(instanceId: string): Promise<SearchContactFlowModulesResult> {
  try {
    // TODO: implement search_contact_flow_modules
    throw new Error("search_contact_flow_modules not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "search_contact_flow_modules failed");
  }
}

/** Search contact flows. */
export async function searchContactFlows(instanceId: string): Promise<SearchContactFlowsResult> {
  try {
    // TODO: implement search_contact_flows
    throw new Error("search_contact_flows not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "search_contact_flows failed");
  }
}

/** Search contacts. */
export async function searchContacts(instanceId: string, timeRange: Record<string, unknown>): Promise<SearchContactsResult> {
  try {
    // TODO: implement search_contacts
    throw new Error("search_contacts not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "search_contacts failed");
  }
}

/** Search email addresses. */
export async function searchEmailAddresses(instanceId: string): Promise<SearchEmailAddressesResult> {
  try {
    // TODO: implement search_email_addresses
    throw new Error("search_email_addresses not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "search_email_addresses failed");
  }
}

/** Search evaluation forms. */
export async function searchEvaluationForms(instanceId: string): Promise<SearchEvaluationFormsResult> {
  try {
    // TODO: implement search_evaluation_forms
    throw new Error("search_evaluation_forms not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "search_evaluation_forms failed");
  }
}

/** Search hours of operation overrides. */
export async function searchHoursOfOperationOverrides(instanceId: string): Promise<SearchHoursOfOperationOverridesResult> {
  try {
    // TODO: implement search_hours_of_operation_overrides
    throw new Error("search_hours_of_operation_overrides not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "search_hours_of_operation_overrides failed");
  }
}

/** Search hours of operations. */
export async function searchHoursOfOperations(instanceId: string): Promise<SearchHoursOfOperationsResult> {
  try {
    // TODO: implement search_hours_of_operations
    throw new Error("search_hours_of_operations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "search_hours_of_operations failed");
  }
}

/** Search predefined attributes. */
export async function searchPredefinedAttributes(instanceId: string): Promise<SearchPredefinedAttributesResult> {
  try {
    // TODO: implement search_predefined_attributes
    throw new Error("search_predefined_attributes not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "search_predefined_attributes failed");
  }
}

/** Search prompts. */
export async function searchPrompts(instanceId: string): Promise<SearchPromptsResult> {
  try {
    // TODO: implement search_prompts
    throw new Error("search_prompts not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "search_prompts failed");
  }
}

/** Search queues. */
export async function searchQueues(instanceId: string): Promise<SearchQueuesResult> {
  try {
    // TODO: implement search_queues
    throw new Error("search_queues not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "search_queues failed");
  }
}

/** Search quick connects. */
export async function searchQuickConnects(instanceId: string): Promise<SearchQuickConnectsResult> {
  try {
    // TODO: implement search_quick_connects
    throw new Error("search_quick_connects not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "search_quick_connects failed");
  }
}

/** Search resource tags. */
export async function searchResourceTags(instanceId: string): Promise<SearchResourceTagsResult> {
  try {
    // TODO: implement search_resource_tags
    throw new Error("search_resource_tags not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "search_resource_tags failed");
  }
}

/** Search routing profiles. */
export async function searchRoutingProfiles(instanceId: string): Promise<SearchRoutingProfilesResult> {
  try {
    // TODO: implement search_routing_profiles
    throw new Error("search_routing_profiles not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "search_routing_profiles failed");
  }
}

/** Search security profiles. */
export async function searchSecurityProfiles(instanceId: string): Promise<SearchSecurityProfilesResult> {
  try {
    // TODO: implement search_security_profiles
    throw new Error("search_security_profiles not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "search_security_profiles failed");
  }
}

/** Search user hierarchy groups. */
export async function searchUserHierarchyGroups(instanceId: string): Promise<SearchUserHierarchyGroupsResult> {
  try {
    // TODO: implement search_user_hierarchy_groups
    throw new Error("search_user_hierarchy_groups not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "search_user_hierarchy_groups failed");
  }
}

/** Search users. */
export async function searchUsers(instanceId: string): Promise<SearchUsersResult> {
  try {
    // TODO: implement search_users
    throw new Error("search_users not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "search_users failed");
  }
}

/** Search vocabularies. */
export async function searchVocabularies(instanceId: string): Promise<SearchVocabulariesResult> {
  try {
    // TODO: implement search_vocabularies
    throw new Error("search_vocabularies not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "search_vocabularies failed");
  }
}

/** Send chat integration event. */
export async function sendChatIntegrationEvent(sourceId: string, destinationId: string, event: Record<string, unknown>): Promise<SendChatIntegrationEventResult> {
  try {
    // TODO: implement send_chat_integration_event
    throw new Error("send_chat_integration_event not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "send_chat_integration_event failed");
  }
}

/** Send outbound email. */
export async function sendOutboundEmail(instanceId: string, fromEmailAddress: Record<string, unknown>, destinationEmailAddress: Record<string, unknown>, emailMessage: Record<string, unknown>, trafficType: string): Promise<void> {
  try {
    // TODO: implement send_outbound_email
    throw new Error("send_outbound_email not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "send_outbound_email failed");
  }
}

/** Start attached file upload. */
export async function startAttachedFileUpload(instanceId: string, fileName: string, fileSizeInBytes: number, fileUseCaseType: string, associatedResourceArn: string): Promise<StartAttachedFileUploadResult> {
  try {
    // TODO: implement start_attached_file_upload
    throw new Error("start_attached_file_upload not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_attached_file_upload failed");
  }
}

/** Start contact evaluation. */
export async function startContactEvaluation(instanceId: string, contactId: string, evaluationFormId: string): Promise<StartContactEvaluationResult> {
  try {
    // TODO: implement start_contact_evaluation
    throw new Error("start_contact_evaluation not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_contact_evaluation failed");
  }
}

/** Start contact recording. */
export async function startContactRecording(instanceId: string, contactId: string, initialContactId: string, voiceRecordingConfiguration: Record<string, unknown>, regionName?: string): Promise<void> {
  try {
    // TODO: implement start_contact_recording
    throw new Error("start_contact_recording not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_contact_recording failed");
  }
}

/** Start contact streaming. */
export async function startContactStreaming(instanceId: string, contactId: string, chatStreamingConfiguration: Record<string, unknown>, clientToken: string, regionName?: string): Promise<StartContactStreamingResult> {
  try {
    // TODO: implement start_contact_streaming
    throw new Error("start_contact_streaming not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_contact_streaming failed");
  }
}

/** Start email contact. */
export async function startEmailContact(instanceId: string, fromEmailAddress: Record<string, unknown>, destinationEmailAddress: string, emailMessage: Record<string, unknown>): Promise<StartEmailContactResult> {
  try {
    // TODO: implement start_email_contact
    throw new Error("start_email_contact not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_email_contact failed");
  }
}

/** Start outbound chat contact. */
export async function startOutboundChatContact(sourceEndpoint: Record<string, unknown>, destinationEndpoint: Record<string, unknown>, instanceId: string, segmentAttributes: Record<string, unknown>, contactFlowId: string): Promise<StartOutboundChatContactResult> {
  try {
    // TODO: implement start_outbound_chat_contact
    throw new Error("start_outbound_chat_contact not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_outbound_chat_contact failed");
  }
}

/** Start outbound email contact. */
export async function startOutboundEmailContact(instanceId: string, contactId: string, destinationEmailAddress: Record<string, unknown>, emailMessage: Record<string, unknown>): Promise<StartOutboundEmailContactResult> {
  try {
    // TODO: implement start_outbound_email_contact
    throw new Error("start_outbound_email_contact not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_outbound_email_contact failed");
  }
}

/** Start screen sharing. */
export async function startScreenSharing(instanceId: string, contactId: string): Promise<void> {
  try {
    // TODO: implement start_screen_sharing
    throw new Error("start_screen_sharing not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_screen_sharing failed");
  }
}

/** Start web rtc contact. */
export async function startWebRtcContact(contactFlowId: string, instanceId: string, participantDetails: Record<string, unknown>): Promise<StartWebRtcContactResult> {
  try {
    // TODO: implement start_web_rtc_contact
    throw new Error("start_web_rtc_contact not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_web_rtc_contact failed");
  }
}

/** Stop contact recording. */
export async function stopContactRecording(instanceId: string, contactId: string, initialContactId: string): Promise<void> {
  try {
    // TODO: implement stop_contact_recording
    throw new Error("stop_contact_recording not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "stop_contact_recording failed");
  }
}

/** Stop contact streaming. */
export async function stopContactStreaming(instanceId: string, contactId: string, streamingId: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement stop_contact_streaming
    throw new Error("stop_contact_streaming not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "stop_contact_streaming failed");
  }
}

/** Submit contact evaluation. */
export async function submitContactEvaluation(instanceId: string, evaluationId: string): Promise<SubmitContactEvaluationResult> {
  try {
    // TODO: implement submit_contact_evaluation
    throw new Error("submit_contact_evaluation not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "submit_contact_evaluation failed");
  }
}

/** Suspend contact recording. */
export async function suspendContactRecording(instanceId: string, contactId: string, initialContactId: string): Promise<void> {
  try {
    // TODO: implement suspend_contact_recording
    throw new Error("suspend_contact_recording not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "suspend_contact_recording failed");
  }
}

/** Tag contact. */
export async function tagContact(contactId: string, instanceId: string, tags: Record<string, unknown>, regionName?: string): Promise<void> {
  try {
    // TODO: implement tag_contact
    throw new Error("tag_contact not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "tag_contact failed");
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

/** Transfer contact. */
export async function transferContact(instanceId: string, contactId: string, contactFlowId: string): Promise<TransferContactResult> {
  try {
    // TODO: implement transfer_contact
    throw new Error("transfer_contact not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "transfer_contact failed");
  }
}

/** Untag contact. */
export async function untagContact(contactId: string, instanceId: string, tagKeys: string[], regionName?: string): Promise<void> {
  try {
    // TODO: implement untag_contact
    throw new Error("untag_contact not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "untag_contact failed");
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

/** Update agent status. */
export async function updateAgentStatus(instanceId: string, agentStatusId: string): Promise<void> {
  try {
    // TODO: implement update_agent_status
    throw new Error("update_agent_status not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_agent_status failed");
  }
}

/** Update authentication profile. */
export async function updateAuthenticationProfile(authenticationProfileId: string, instanceId: string): Promise<void> {
  try {
    // TODO: implement update_authentication_profile
    throw new Error("update_authentication_profile not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_authentication_profile failed");
  }
}

/** Update contact. */
export async function updateContact(instanceId: string, contactId: string): Promise<void> {
  try {
    // TODO: implement update_contact
    throw new Error("update_contact not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_contact failed");
  }
}

/** Update contact evaluation. */
export async function updateContactEvaluation(instanceId: string, evaluationId: string): Promise<UpdateContactEvaluationResult> {
  try {
    // TODO: implement update_contact_evaluation
    throw new Error("update_contact_evaluation not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_contact_evaluation failed");
  }
}

/** Update contact flow metadata. */
export async function updateContactFlowMetadata(instanceId: string, contactFlowId: string): Promise<void> {
  try {
    // TODO: implement update_contact_flow_metadata
    throw new Error("update_contact_flow_metadata not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_contact_flow_metadata failed");
  }
}

/** Update contact flow module content. */
export async function updateContactFlowModuleContent(instanceId: string, contactFlowModuleId: string, content: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement update_contact_flow_module_content
    throw new Error("update_contact_flow_module_content not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_contact_flow_module_content failed");
  }
}

/** Update contact flow module metadata. */
export async function updateContactFlowModuleMetadata(instanceId: string, contactFlowModuleId: string): Promise<void> {
  try {
    // TODO: implement update_contact_flow_module_metadata
    throw new Error("update_contact_flow_module_metadata not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_contact_flow_module_metadata failed");
  }
}

/** Update contact flow name. */
export async function updateContactFlowName(instanceId: string, contactFlowId: string): Promise<void> {
  try {
    // TODO: implement update_contact_flow_name
    throw new Error("update_contact_flow_name not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_contact_flow_name failed");
  }
}

/** Update contact routing data. */
export async function updateContactRoutingData(instanceId: string, contactId: string): Promise<void> {
  try {
    // TODO: implement update_contact_routing_data
    throw new Error("update_contact_routing_data not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_contact_routing_data failed");
  }
}

/** Update contact schedule. */
export async function updateContactSchedule(instanceId: string, contactId: string, scheduledTime: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement update_contact_schedule
    throw new Error("update_contact_schedule not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_contact_schedule failed");
  }
}

/** Update email address metadata. */
export async function updateEmailAddressMetadata(instanceId: string, emailAddressId: string): Promise<UpdateEmailAddressMetadataResult> {
  try {
    // TODO: implement update_email_address_metadata
    throw new Error("update_email_address_metadata not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_email_address_metadata failed");
  }
}

/** Update evaluation form. */
export async function updateEvaluationForm(instanceId: string, evaluationFormId: string, evaluationFormVersion: number, title: string, items: Record<string, unknown>[]): Promise<UpdateEvaluationFormResult> {
  try {
    // TODO: implement update_evaluation_form
    throw new Error("update_evaluation_form not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_evaluation_form failed");
  }
}

/** Update hours of operation. */
export async function updateHoursOfOperation(instanceId: string, hoursOfOperationId: string): Promise<void> {
  try {
    // TODO: implement update_hours_of_operation
    throw new Error("update_hours_of_operation not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_hours_of_operation failed");
  }
}

/** Update hours of operation override. */
export async function updateHoursOfOperationOverride(instanceId: string, hoursOfOperationId: string, hoursOfOperationOverrideId: string): Promise<void> {
  try {
    // TODO: implement update_hours_of_operation_override
    throw new Error("update_hours_of_operation_override not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_hours_of_operation_override failed");
  }
}

/** Update instance attribute. */
export async function updateInstanceAttribute(instanceId: string, attributeType: string, value: string): Promise<void> {
  try {
    // TODO: implement update_instance_attribute
    throw new Error("update_instance_attribute not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_instance_attribute failed");
  }
}

/** Update instance storage config. */
export async function updateInstanceStorageConfig(instanceId: string, associationId: string, resourceType: string, storageConfig: Record<string, unknown>): Promise<void> {
  try {
    // TODO: implement update_instance_storage_config
    throw new Error("update_instance_storage_config not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_instance_storage_config failed");
  }
}

/** Update participant authentication. */
export async function updateParticipantAuthentication(state: string, instanceId: string): Promise<void> {
  try {
    // TODO: implement update_participant_authentication
    throw new Error("update_participant_authentication not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_participant_authentication failed");
  }
}

/** Update participant role config. */
export async function updateParticipantRoleConfig(instanceId: string, contactId: string, channelConfiguration: Record<string, unknown>, regionName?: string): Promise<void> {
  try {
    // TODO: implement update_participant_role_config
    throw new Error("update_participant_role_config not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_participant_role_config failed");
  }
}

/** Update phone number. */
export async function updatePhoneNumber(phoneNumberId: string): Promise<UpdatePhoneNumberResult> {
  try {
    // TODO: implement update_phone_number
    throw new Error("update_phone_number not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_phone_number failed");
  }
}

/** Update phone number metadata. */
export async function updatePhoneNumberMetadata(phoneNumberId: string): Promise<void> {
  try {
    // TODO: implement update_phone_number_metadata
    throw new Error("update_phone_number_metadata not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_phone_number_metadata failed");
  }
}

/** Update predefined attribute. */
export async function updatePredefinedAttribute(instanceId: string, name: string): Promise<void> {
  try {
    // TODO: implement update_predefined_attribute
    throw new Error("update_predefined_attribute not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_predefined_attribute failed");
  }
}

/** Update prompt. */
export async function updatePrompt(instanceId: string, promptId: string): Promise<UpdatePromptResult> {
  try {
    // TODO: implement update_prompt
    throw new Error("update_prompt not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_prompt failed");
  }
}

/** Update queue hours of operation. */
export async function updateQueueHoursOfOperation(instanceId: string, queueId: string, hoursOfOperationId: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement update_queue_hours_of_operation
    throw new Error("update_queue_hours_of_operation not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_queue_hours_of_operation failed");
  }
}

/** Update queue max contacts. */
export async function updateQueueMaxContacts(instanceId: string, queueId: string): Promise<void> {
  try {
    // TODO: implement update_queue_max_contacts
    throw new Error("update_queue_max_contacts not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_queue_max_contacts failed");
  }
}

/** Update queue name. */
export async function updateQueueName(instanceId: string, queueId: string): Promise<void> {
  try {
    // TODO: implement update_queue_name
    throw new Error("update_queue_name not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_queue_name failed");
  }
}

/** Update queue outbound caller config. */
export async function updateQueueOutboundCallerConfig(instanceId: string, queueId: string, outboundCallerConfig: Record<string, unknown>, regionName?: string): Promise<void> {
  try {
    // TODO: implement update_queue_outbound_caller_config
    throw new Error("update_queue_outbound_caller_config not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_queue_outbound_caller_config failed");
  }
}

/** Update queue outbound email config. */
export async function updateQueueOutboundEmailConfig(instanceId: string, queueId: string, outboundEmailConfig: Record<string, unknown>, regionName?: string): Promise<void> {
  try {
    // TODO: implement update_queue_outbound_email_config
    throw new Error("update_queue_outbound_email_config not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_queue_outbound_email_config failed");
  }
}

/** Update quick connect config. */
export async function updateQuickConnectConfig(instanceId: string, quickConnectId: string, quickConnectConfig: Record<string, unknown>, regionName?: string): Promise<void> {
  try {
    // TODO: implement update_quick_connect_config
    throw new Error("update_quick_connect_config not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_quick_connect_config failed");
  }
}

/** Update quick connect name. */
export async function updateQuickConnectName(instanceId: string, quickConnectId: string): Promise<void> {
  try {
    // TODO: implement update_quick_connect_name
    throw new Error("update_quick_connect_name not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_quick_connect_name failed");
  }
}

/** Update routing profile agent availability timer. */
export async function updateRoutingProfileAgentAvailabilityTimer(instanceId: string, routingProfileId: string, agentAvailabilityTimer: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement update_routing_profile_agent_availability_timer
    throw new Error("update_routing_profile_agent_availability_timer not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_routing_profile_agent_availability_timer failed");
  }
}

/** Update routing profile concurrency. */
export async function updateRoutingProfileConcurrency(instanceId: string, routingProfileId: string, mediaConcurrencies: Record<string, unknown>[], regionName?: string): Promise<void> {
  try {
    // TODO: implement update_routing_profile_concurrency
    throw new Error("update_routing_profile_concurrency not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_routing_profile_concurrency failed");
  }
}

/** Update routing profile default outbound queue. */
export async function updateRoutingProfileDefaultOutboundQueue(instanceId: string, routingProfileId: string, defaultOutboundQueueId: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement update_routing_profile_default_outbound_queue
    throw new Error("update_routing_profile_default_outbound_queue not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_routing_profile_default_outbound_queue failed");
  }
}

/** Update routing profile name. */
export async function updateRoutingProfileName(instanceId: string, routingProfileId: string): Promise<void> {
  try {
    // TODO: implement update_routing_profile_name
    throw new Error("update_routing_profile_name not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_routing_profile_name failed");
  }
}

/** Update routing profile queues. */
export async function updateRoutingProfileQueues(instanceId: string, routingProfileId: string, queueConfigs: Record<string, unknown>[], regionName?: string): Promise<void> {
  try {
    // TODO: implement update_routing_profile_queues
    throw new Error("update_routing_profile_queues not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_routing_profile_queues failed");
  }
}

/** Update rule. */
export async function updateRule(ruleId: string, instanceId: string, name: string, function: string, actions: Record<string, unknown>[], publishStatus: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement update_rule
    throw new Error("update_rule not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_rule failed");
  }
}

/** Update security profile. */
export async function updateSecurityProfile(securityProfileId: string, instanceId: string): Promise<void> {
  try {
    // TODO: implement update_security_profile
    throw new Error("update_security_profile not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_security_profile failed");
  }
}

/** Update task template. */
export async function updateTaskTemplate(taskTemplateId: string, instanceId: string): Promise<UpdateTaskTemplateResult> {
  try {
    // TODO: implement update_task_template
    throw new Error("update_task_template not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_task_template failed");
  }
}

/** Update traffic distribution. */
export async function updateTrafficDistribution(id: string): Promise<void> {
  try {
    // TODO: implement update_traffic_distribution
    throw new Error("update_traffic_distribution not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_traffic_distribution failed");
  }
}

/** Update user hierarchy. */
export async function updateUserHierarchy(userId: string, instanceId: string): Promise<void> {
  try {
    // TODO: implement update_user_hierarchy
    throw new Error("update_user_hierarchy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_user_hierarchy failed");
  }
}

/** Update user hierarchy group name. */
export async function updateUserHierarchyGroupName(name: string, hierarchyGroupId: string, instanceId: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement update_user_hierarchy_group_name
    throw new Error("update_user_hierarchy_group_name not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_user_hierarchy_group_name failed");
  }
}

/** Update user hierarchy structure. */
export async function updateUserHierarchyStructure(hierarchyStructure: Record<string, unknown>, instanceId: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement update_user_hierarchy_structure
    throw new Error("update_user_hierarchy_structure not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_user_hierarchy_structure failed");
  }
}

/** Update user identity info. */
export async function updateUserIdentityInfo(identityInfo: Record<string, unknown>, userId: string, instanceId: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement update_user_identity_info
    throw new Error("update_user_identity_info not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_user_identity_info failed");
  }
}

/** Update user phone config. */
export async function updateUserPhoneConfig(phoneConfig: Record<string, unknown>, userId: string, instanceId: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement update_user_phone_config
    throw new Error("update_user_phone_config not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_user_phone_config failed");
  }
}

/** Update user proficiencies. */
export async function updateUserProficiencies(instanceId: string, userId: string, userProficiencies: Record<string, unknown>[], regionName?: string): Promise<void> {
  try {
    // TODO: implement update_user_proficiencies
    throw new Error("update_user_proficiencies not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_user_proficiencies failed");
  }
}

/** Update user security profiles. */
export async function updateUserSecurityProfiles(securityProfileIds: string[], userId: string, instanceId: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement update_user_security_profiles
    throw new Error("update_user_security_profiles not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_user_security_profiles failed");
  }
}

/** Update view content. */
export async function updateViewContent(instanceId: string, viewId: string, status: string, content: Record<string, unknown>, regionName?: string): Promise<UpdateViewContentResult> {
  try {
    // TODO: implement update_view_content
    throw new Error("update_view_content not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_view_content failed");
  }
}

/** Update view metadata. */
export async function updateViewMetadata(instanceId: string, viewId: string): Promise<void> {
  try {
    // TODO: implement update_view_metadata
    throw new Error("update_view_metadata not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_view_metadata failed");
  }
}
