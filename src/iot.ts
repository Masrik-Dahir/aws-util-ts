import { IotClient } from "@aws-sdk/client-iot";
import { getClient } from "./client";
import { wrapAwsError } from "./exceptions";

/** Metadata for an IoT thing. */
export type IoTThing = {
  thingName: string;
  thingArn?: string;
  thingTypeName?: string;
  attributes?: Record<string, unknown>;
  version?: number;
};

/** Metadata for an IoT thing type. */
export type IoTThingType = {
  thingTypeName: string;
  thingTypeArn?: string;
};

/** Metadata for an IoT thing group. */
export type IoTThingGroup = {
  thingGroupName: string;
  thingGroupArn?: string;
};

/** Metadata for an IoT policy. */
export type IoTPolicy = {
  policyName: string;
  policyArn?: string;
  policyDocument?: string;
  defaultVersionId?: string;
};

/** Metadata for an IoT topic rule. */
export type IoTTopicRule = {
  ruleName: string;
  ruleArn?: string;
  sql?: string;
  description?: string;
  ruleDisabled?: boolean;
};

/** Metadata for an IoT job. */
export type IoTJob = {
  jobId: string;
  jobArn?: string;
  status?: string;
  description?: string;
  targetSelection?: string;
  targets?: string[];
};

/** Result of associate_sbom_with_package_version. */
export type AssociateSbomWithPackageVersionResult = {
  packageName?: string;
  versionName?: string;
  sbom?: Record<string, unknown>;
  sbomValidationStatus?: string;
};

/** Result of associate_targets_with_job. */
export type AssociateTargetsWithJobResult = {
  jobArn?: string;
  jobId?: string;
  description?: string;
};

/** Result of create_authorizer. */
export type CreateAuthorizerResult = {
  authorizerName?: string;
  authorizerArn?: string;
};

/** Result of create_billing_group. */
export type CreateBillingGroupResult = {
  billingGroupName?: string;
  billingGroupArn?: string;
  billingGroupId?: string;
};

/** Result of create_certificate_from_csr. */
export type CreateCertificateFromCsrResult = {
  certificateArn?: string;
  certificateId?: string;
  certificatePem?: string;
};

/** Result of create_certificate_provider. */
export type CreateCertificateProviderResult = {
  certificateProviderName?: string;
  certificateProviderArn?: string;
};

/** Result of create_command. */
export type CreateCommandResult = {
  commandId?: string;
  commandArn?: string;
};

/** Result of create_custom_metric. */
export type CreateCustomMetricResult = {
  metricName?: string;
  metricArn?: string;
};

/** Result of create_dimension. */
export type CreateDimensionResult = {
  name?: string;
  arn?: string;
};

/** Result of create_domain_configuration. */
export type CreateDomainConfigurationResult = {
  domainConfigurationName?: string;
  domainConfigurationArn?: string;
};

/** Result of create_dynamic_thing_group. */
export type CreateDynamicThingGroupResult = {
  thingGroupName?: string;
  thingGroupArn?: string;
  thingGroupId?: string;
  indexName?: string;
  queryString?: string;
  queryVersion?: string;
};

/** Result of create_fleet_metric. */
export type CreateFleetMetricResult = {
  metricName?: string;
  metricArn?: string;
};

/** Result of create_job_template. */
export type CreateJobTemplateResult = {
  jobTemplateArn?: string;
  jobTemplateId?: string;
};

/** Result of create_keys_and_certificate. */
export type CreateKeysAndCertificateResult = {
  certificateArn?: string;
  certificateId?: string;
  certificatePem?: string;
  keyPair?: Record<string, unknown>;
};

/** Result of create_mitigation_action. */
export type CreateMitigationActionResult = {
  actionArn?: string;
  actionId?: string;
};

/** Result of create_ota_update. */
export type CreateOtaUpdateResult = {
  otaUpdateId?: string;
  awsIotJobId?: string;
  otaUpdateArn?: string;
  awsIotJobArn?: string;
  otaUpdateStatus?: string;
};

/** Result of create_package. */
export type CreatePackageResult = {
  packageName?: string;
  packageArn?: string;
  description?: string;
};

/** Result of create_package_version. */
export type CreatePackageVersionResult = {
  packageVersionArn?: string;
  packageName?: string;
  versionName?: string;
  description?: string;
  attributes?: Record<string, unknown>;
  status?: string;
  errorReason?: string;
};

/** Result of create_policy_version. */
export type CreatePolicyVersionResult = {
  policyArn?: string;
  policyDocument?: string;
  policyVersionId?: string;
  isDefaultVersion?: boolean;
};

/** Result of create_provisioning_claim. */
export type CreateProvisioningClaimResult = {
  certificateId?: string;
  certificatePem?: string;
  keyPair?: Record<string, unknown>;
  expiration?: string;
};

/** Result of create_provisioning_template. */
export type CreateProvisioningTemplateResult = {
  templateArn?: string;
  templateName?: string;
  defaultVersionId?: number;
};

/** Result of create_provisioning_template_version. */
export type CreateProvisioningTemplateVersionResult = {
  templateArn?: string;
  templateName?: string;
  versionId?: number;
  isDefaultVersion?: boolean;
};

/** Result of create_role_alias. */
export type CreateRoleAliasResult = {
  roleAlias?: string;
  roleAliasArn?: string;
};

/** Result of create_scheduled_audit. */
export type CreateScheduledAuditResult = {
  scheduledAuditArn?: string;
};

/** Result of create_security_profile. */
export type CreateSecurityProfileResult = {
  securityProfileName?: string;
  securityProfileArn?: string;
};

/** Result of create_stream. */
export type CreateStreamResult = {
  streamId?: string;
  streamArn?: string;
  description?: string;
  streamVersion?: number;
};

/** Result of create_topic_rule_destination. */
export type CreateTopicRuleDestinationResult = {
  topicRuleDestination?: Record<string, unknown>;
};

/** Result of delete_command. */
export type DeleteCommandResult = {
  statusCode?: number;
};

/** Result of describe_account_audit_configuration. */
export type DescribeAccountAuditConfigurationResult = {
  roleArn?: string;
  auditNotificationTargetConfigurations?: Record<string, unknown>;
  auditCheckConfigurations?: Record<string, unknown>;
};

/** Result of describe_audit_finding. */
export type DescribeAuditFindingResult = {
  finding?: Record<string, unknown>;
};

/** Result of describe_audit_mitigation_actions_task. */
export type DescribeAuditMitigationActionsTaskResult = {
  taskStatus?: string;
  startTime?: string;
  endTime?: string;
  taskStatistics?: Record<string, unknown>;
  target?: Record<string, unknown>;
  auditCheckToActionsMapping?: Record<string, unknown>;
  actionsDefinition?: Record<string, unknown>[];
};

/** Result of describe_audit_suppression. */
export type DescribeAuditSuppressionResult = {
  checkName?: string;
  resourceIdentifier?: Record<string, unknown>;
  expirationDate?: string;
  suppressIndefinitely?: boolean;
  description?: string;
};

/** Result of describe_audit_task. */
export type DescribeAuditTaskResult = {
  taskStatus?: string;
  taskType?: string;
  taskStartTime?: string;
  taskStatistics?: Record<string, unknown>;
  scheduledAuditName?: string;
  auditDetails?: Record<string, unknown>;
};

/** Result of describe_authorizer. */
export type DescribeAuthorizerResult = {
  authorizerDescription?: Record<string, unknown>;
};

/** Result of describe_billing_group. */
export type DescribeBillingGroupResult = {
  billingGroupName?: string;
  billingGroupId?: string;
  billingGroupArn?: string;
  version?: number;
  billingGroupProperties?: Record<string, unknown>;
  billingGroupMetadata?: Record<string, unknown>;
};

/** Result of describe_ca_certificate. */
export type DescribeCaCertificateResult = {
  certificateDescription?: Record<string, unknown>;
  registrationConfig?: Record<string, unknown>;
};

/** Result of describe_certificate. */
export type DescribeCertificateResult = {
  certificateDescription?: Record<string, unknown>;
};

/** Result of describe_certificate_provider. */
export type DescribeCertificateProviderResult = {
  certificateProviderName?: string;
  certificateProviderArn?: string;
  lambdaFunctionArn?: string;
  accountDefaultForOperations?: string[];
  creationDate?: string;
  lastModifiedDate?: string;
};

/** Result of describe_custom_metric. */
export type DescribeCustomMetricResult = {
  metricName?: string;
  metricArn?: string;
  metricType?: string;
  displayName?: string;
  creationDate?: string;
  lastModifiedDate?: string;
};

/** Result of describe_default_authorizer. */
export type DescribeDefaultAuthorizerResult = {
  authorizerDescription?: Record<string, unknown>;
};

/** Result of describe_detect_mitigation_actions_task. */
export type DescribeDetectMitigationActionsTaskResult = {
  taskSummary?: Record<string, unknown>;
};

/** Result of describe_dimension. */
export type DescribeDimensionResult = {
  name?: string;
  arn?: string;
  typeValue?: string;
  stringValues?: string[];
  creationDate?: string;
  lastModifiedDate?: string;
};

/** Result of describe_domain_configuration. */
export type DescribeDomainConfigurationResult = {
  domainConfigurationName?: string;
  domainConfigurationArn?: string;
  domainName?: string;
  serverCertificates?: Record<string, unknown>[];
  authorizerConfig?: Record<string, unknown>;
  domainConfigurationStatus?: string;
  serviceType?: string;
  domainType?: string;
  lastStatusChangeDate?: string;
  tlsConfig?: Record<string, unknown>;
  serverCertificateConfig?: Record<string, unknown>;
  authenticationType?: string;
  applicationProtocol?: string;
  clientCertificateConfig?: Record<string, unknown>;
};

/** Result of describe_encryption_configuration. */
export type DescribeEncryptionConfigurationResult = {
  encryptionType?: string;
  kmsKeyArn?: string;
  kmsAccessRoleArn?: string;
  configurationDetails?: Record<string, unknown>;
  lastModifiedDate?: string;
};

/** Result of describe_endpoint. */
export type DescribeEndpointResult = {
  endpointAddress?: string;
};

/** Result of describe_event_configurations. */
export type DescribeEventConfigurationsResult = {
  eventConfigurations?: Record<string, unknown>;
  creationDate?: string;
  lastModifiedDate?: string;
};

/** Result of describe_fleet_metric. */
export type DescribeFleetMetricResult = {
  metricName?: string;
  queryString?: string;
  aggregationType?: Record<string, unknown>;
  period?: number;
  aggregationField?: string;
  description?: string;
  queryVersion?: string;
  indexName?: string;
  creationDate?: string;
  lastModifiedDate?: string;
  unit?: string;
  version?: number;
  metricArn?: string;
};

/** Result of describe_index. */
export type DescribeIndexResult = {
  indexName?: string;
  indexStatus?: string;
  modelSchema?: string;
};

/** Result of describe_job_execution. */
export type DescribeJobExecutionResult = {
  execution?: Record<string, unknown>;
};

/** Result of describe_job_template. */
export type DescribeJobTemplateResult = {
  jobTemplateArn?: string;
  jobTemplateId?: string;
  description?: string;
  documentSource?: string;
  document?: string;
  createdAt?: string;
  presignedUrlConfig?: Record<string, unknown>;
  jobExecutionsRolloutConfig?: Record<string, unknown>;
  abortConfig?: Record<string, unknown>;
  timeoutConfig?: Record<string, unknown>;
  jobExecutionsRetryConfig?: Record<string, unknown>;
  maintenanceWindows?: Record<string, unknown>[];
  destinationPackageVersions?: string[];
};

/** Result of describe_managed_job_template. */
export type DescribeManagedJobTemplateResult = {
  templateName?: string;
  templateArn?: string;
  description?: string;
  templateVersion?: string;
  environments?: string[];
  documentParameters?: Record<string, unknown>[];
  document?: string;
};

/** Result of describe_mitigation_action. */
export type DescribeMitigationActionResult = {
  actionName?: string;
  actionType?: string;
  actionArn?: string;
  actionId?: string;
  roleArn?: string;
  actionParams?: Record<string, unknown>;
  creationDate?: string;
  lastModifiedDate?: string;
};

/** Result of describe_provisioning_template. */
export type DescribeProvisioningTemplateResult = {
  templateArn?: string;
  templateName?: string;
  description?: string;
  creationDate?: string;
  lastModifiedDate?: string;
  defaultVersionId?: number;
  templateBody?: string;
  enabled?: boolean;
  provisioningRoleArn?: string;
  preProvisioningHook?: Record<string, unknown>;
  typeValue?: string;
};

/** Result of describe_provisioning_template_version. */
export type DescribeProvisioningTemplateVersionResult = {
  versionId?: number;
  creationDate?: string;
  templateBody?: string;
  isDefaultVersion?: boolean;
};

/** Result of describe_role_alias. */
export type DescribeRoleAliasResult = {
  roleAliasDescription?: Record<string, unknown>;
};

/** Result of describe_scheduled_audit. */
export type DescribeScheduledAuditResult = {
  frequency?: string;
  dayOfMonth?: string;
  dayOfWeek?: string;
  targetCheckNames?: string[];
  scheduledAuditName?: string;
  scheduledAuditArn?: string;
};

/** Result of describe_security_profile. */
export type DescribeSecurityProfileResult = {
  securityProfileName?: string;
  securityProfileArn?: string;
  securityProfileDescription?: string;
  behaviors?: Record<string, unknown>[];
  alertTargets?: Record<string, unknown>;
  additionalMetricsToRetain?: string[];
  additionalMetricsToRetainV2?: Record<string, unknown>[];
  version?: number;
  creationDate?: string;
  lastModifiedDate?: string;
  metricsExportConfig?: Record<string, unknown>;
};

/** Result of describe_stream. */
export type DescribeStreamResult = {
  streamInfo?: Record<string, unknown>;
};

/** Result of describe_thing_group. */
export type DescribeThingGroupResult = {
  thingGroupName?: string;
  thingGroupId?: string;
  thingGroupArn?: string;
  version?: number;
  thingGroupProperties?: Record<string, unknown>;
  thingGroupMetadata?: Record<string, unknown>;
  indexName?: string;
  queryString?: string;
  queryVersion?: string;
  status?: string;
};

/** Result of describe_thing_registration_task. */
export type DescribeThingRegistrationTaskResult = {
  taskId?: string;
  creationDate?: string;
  lastModifiedDate?: string;
  templateBody?: string;
  inputFileBucket?: string;
  inputFileKey?: string;
  roleArn?: string;
  status?: string;
  message?: string;
  successCount?: number;
  failureCount?: number;
  percentageProgress?: number;
};

/** Result of describe_thing_type. */
export type DescribeThingTypeResult = {
  thingTypeName?: string;
  thingTypeId?: string;
  thingTypeArn?: string;
  thingTypeProperties?: Record<string, unknown>;
  thingTypeMetadata?: Record<string, unknown>;
};

/** Result of get_behavior_model_training_summaries. */
export type GetBehaviorModelTrainingSummariesResult = {
  summaries?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of get_buckets_aggregation. */
export type GetBucketsAggregationResult = {
  totalCount?: number;
  buckets?: Record<string, unknown>[];
};

/** Result of get_cardinality. */
export type GetCardinalityResult = {
  cardinality?: number;
};

/** Result of get_command. */
export type GetCommandResult = {
  commandId?: string;
  commandArn?: string;
  namespace?: string;
  displayName?: string;
  description?: string;
  mandatoryParameters?: Record<string, unknown>[];
  payload?: Record<string, unknown>;
  roleArn?: string;
  createdAt?: string;
  lastUpdatedAt?: string;
  deprecated?: boolean;
  pendingDeletion?: boolean;
};

/** Result of get_command_execution. */
export type GetCommandExecutionResult = {
  executionId?: string;
  commandArn?: string;
  targetArn?: string;
  status?: string;
  statusReason?: Record<string, unknown>;
  result?: Record<string, unknown>;
  parameters?: Record<string, unknown>;
  executionTimeoutSeconds?: number;
  createdAt?: string;
  lastUpdatedAt?: string;
  startedAt?: string;
  completedAt?: string;
  timeToLive?: string;
};

/** Result of get_effective_policies. */
export type GetEffectivePoliciesResult = {
  effectivePolicies?: Record<string, unknown>[];
};

/** Result of get_indexing_configuration. */
export type GetIndexingConfigurationResult = {
  thingIndexingConfiguration?: Record<string, unknown>;
  thingGroupIndexingConfiguration?: Record<string, unknown>;
};

/** Result of get_job_document. */
export type GetJobDocumentResult = {
  document?: string;
};

/** Result of get_logging_options. */
export type GetLoggingOptionsResult = {
  roleArn?: string;
  logLevel?: string;
};

/** Result of get_ota_update. */
export type GetOtaUpdateResult = {
  otaUpdateInfo?: Record<string, unknown>;
};

/** Result of get_package. */
export type GetPackageResult = {
  packageName?: string;
  packageArn?: string;
  description?: string;
  defaultVersionName?: string;
  creationDate?: string;
  lastModifiedDate?: string;
};

/** Result of get_package_configuration. */
export type GetPackageConfigurationResult = {
  versionUpdateByJobsConfig?: Record<string, unknown>;
};

/** Result of get_package_version. */
export type GetPackageVersionResult = {
  packageVersionArn?: string;
  packageName?: string;
  versionName?: string;
  description?: string;
  attributes?: Record<string, unknown>;
  artifact?: Record<string, unknown>;
  status?: string;
  errorReason?: string;
  creationDate?: string;
  lastModifiedDate?: string;
  sbom?: Record<string, unknown>;
  sbomValidationStatus?: string;
  recipe?: string;
};

/** Result of get_percentiles. */
export type GetPercentilesResult = {
  percentiles?: Record<string, unknown>[];
};

/** Result of get_policy_version. */
export type GetPolicyVersionResult = {
  policyArn?: string;
  policyName?: string;
  policyDocument?: string;
  policyVersionId?: string;
  isDefaultVersion?: boolean;
  creationDate?: string;
  lastModifiedDate?: string;
  generationId?: string;
};

/** Result of get_registration_code. */
export type GetRegistrationCodeResult = {
  registrationCode?: string;
};

/** Result of get_statistics. */
export type GetStatisticsResult = {
  statistics?: Record<string, unknown>;
};

/** Result of get_thing_connectivity_data. */
export type GetThingConnectivityDataResult = {
  thingName?: string;
  connected?: boolean;
  timestamp?: string;
  disconnectReason?: string;
};

/** Result of get_topic_rule_destination. */
export type GetTopicRuleDestinationResult = {
  topicRuleDestination?: Record<string, unknown>;
};

/** Result of get_v2_logging_options. */
export type GetV2LoggingOptionsResult = {
  roleArn?: string;
  defaultLogLevel?: string;
  disableAllLogs?: boolean;
};

/** Result of list_active_violations. */
export type ListActiveViolationsResult = {
  activeViolations?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_attached_policies. */
export type ListAttachedPoliciesResult = {
  policies?: Record<string, unknown>[];
  nextMarker?: string;
};

/** Result of list_audit_findings. */
export type ListAuditFindingsResult = {
  findings?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_audit_mitigation_actions_executions. */
export type ListAuditMitigationActionsExecutionsResult = {
  actionsExecutions?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_audit_mitigation_actions_tasks. */
export type ListAuditMitigationActionsTasksResult = {
  tasks?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_audit_suppressions. */
export type ListAuditSuppressionsResult = {
  suppressions?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_audit_tasks. */
export type ListAuditTasksResult = {
  tasks?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_authorizers. */
export type ListAuthorizersResult = {
  authorizers?: Record<string, unknown>[];
  nextMarker?: string;
};

/** Result of list_billing_groups. */
export type ListBillingGroupsResult = {
  billingGroups?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_ca_certificates. */
export type ListCaCertificatesResult = {
  certificates?: Record<string, unknown>[];
  nextMarker?: string;
};

/** Result of list_certificate_providers. */
export type ListCertificateProvidersResult = {
  certificateProviders?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_certificates. */
export type ListCertificatesResult = {
  certificates?: Record<string, unknown>[];
  nextMarker?: string;
};

/** Result of list_certificates_by_ca. */
export type ListCertificatesByCaResult = {
  certificates?: Record<string, unknown>[];
  nextMarker?: string;
};

/** Result of list_command_executions. */
export type ListCommandExecutionsResult = {
  commandExecutions?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_commands. */
export type ListCommandsResult = {
  commands?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_custom_metrics. */
export type ListCustomMetricsResult = {
  metricNames?: string[];
  nextToken?: string;
};

/** Result of list_detect_mitigation_actions_executions. */
export type ListDetectMitigationActionsExecutionsResult = {
  actionsExecutions?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_detect_mitigation_actions_tasks. */
export type ListDetectMitigationActionsTasksResult = {
  tasks?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_dimensions. */
export type ListDimensionsResult = {
  dimensionNames?: string[];
  nextToken?: string;
};

/** Result of list_domain_configurations. */
export type ListDomainConfigurationsResult = {
  domainConfigurations?: Record<string, unknown>[];
  nextMarker?: string;
};

/** Result of list_fleet_metrics. */
export type ListFleetMetricsResult = {
  fleetMetrics?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_indices. */
export type ListIndicesResult = {
  indexNames?: string[];
  nextToken?: string;
};

/** Result of list_job_executions_for_job. */
export type ListJobExecutionsForJobResult = {
  executionSummaries?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_job_executions_for_thing. */
export type ListJobExecutionsForThingResult = {
  executionSummaries?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_job_templates. */
export type ListJobTemplatesResult = {
  jobTemplates?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_managed_job_templates. */
export type ListManagedJobTemplatesResult = {
  managedJobTemplates?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_metric_values. */
export type ListMetricValuesResult = {
  metricDatumList?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_mitigation_actions. */
export type ListMitigationActionsResult = {
  actionIdentifiers?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_ota_updates. */
export type ListOtaUpdatesResult = {
  otaUpdates?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_outgoing_certificates. */
export type ListOutgoingCertificatesResult = {
  outgoingCertificates?: Record<string, unknown>[];
  nextMarker?: string;
};

/** Result of list_package_versions. */
export type ListPackageVersionsResult = {
  packageVersionSummaries?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_packages. */
export type ListPackagesResult = {
  packageSummaries?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_policy_principals. */
export type ListPolicyPrincipalsResult = {
  principals?: string[];
  nextMarker?: string;
};

/** Result of list_policy_versions. */
export type ListPolicyVersionsResult = {
  policyVersions?: Record<string, unknown>[];
};

/** Result of list_principal_policies. */
export type ListPrincipalPoliciesResult = {
  policies?: Record<string, unknown>[];
  nextMarker?: string;
};

/** Result of list_principal_things. */
export type ListPrincipalThingsResult = {
  things?: string[];
  nextToken?: string;
};

/** Result of list_principal_things_v2. */
export type ListPrincipalThingsV2Result = {
  principalThingObjects?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_provisioning_template_versions. */
export type ListProvisioningTemplateVersionsResult = {
  versions?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_provisioning_templates. */
export type ListProvisioningTemplatesResult = {
  templates?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_related_resources_for_audit_finding. */
export type ListRelatedResourcesForAuditFindingResult = {
  relatedResources?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_role_aliases. */
export type ListRoleAliasesResult = {
  roleAliases?: string[];
  nextMarker?: string;
};

/** Result of list_sbom_validation_results. */
export type ListSbomValidationResultsResult = {
  validationResultSummaries?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_scheduled_audits. */
export type ListScheduledAuditsResult = {
  scheduledAudits?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_security_profiles. */
export type ListSecurityProfilesResult = {
  securityProfileIdentifiers?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_security_profiles_for_target. */
export type ListSecurityProfilesForTargetResult = {
  securityProfileTargetMappings?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_streams. */
export type ListStreamsResult = {
  streams?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_tags_for_resource. */
export type ListTagsForResourceResult = {
  tags?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_targets_for_policy. */
export type ListTargetsForPolicyResult = {
  targets?: string[];
  nextMarker?: string;
};

/** Result of list_targets_for_security_profile. */
export type ListTargetsForSecurityProfileResult = {
  securityProfileTargets?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_thing_groups_for_thing. */
export type ListThingGroupsForThingResult = {
  thingGroups?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_thing_principals. */
export type ListThingPrincipalsResult = {
  principals?: string[];
  nextToken?: string;
};

/** Result of list_thing_principals_v2. */
export type ListThingPrincipalsV2Result = {
  thingPrincipalObjects?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_thing_registration_task_reports. */
export type ListThingRegistrationTaskReportsResult = {
  resourceLinks?: string[];
  reportType?: string;
  nextToken?: string;
};

/** Result of list_thing_registration_tasks. */
export type ListThingRegistrationTasksResult = {
  taskIds?: string[];
  nextToken?: string;
};

/** Result of list_things_in_billing_group. */
export type ListThingsInBillingGroupResult = {
  things?: string[];
  nextToken?: string;
};

/** Result of list_things_in_thing_group. */
export type ListThingsInThingGroupResult = {
  things?: string[];
  nextToken?: string;
};

/** Result of list_topic_rule_destinations. */
export type ListTopicRuleDestinationsResult = {
  destinationSummaries?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_v2_logging_levels. */
export type ListV2LoggingLevelsResult = {
  logTargetConfigurations?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_violation_events. */
export type ListViolationEventsResult = {
  violationEvents?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of register_ca_certificate. */
export type RegisterCaCertificateResult = {
  certificateArn?: string;
  certificateId?: string;
};

/** Result of register_certificate. */
export type RegisterCertificateResult = {
  certificateArn?: string;
  certificateId?: string;
};

/** Result of register_certificate_without_ca. */
export type RegisterCertificateWithoutCaResult = {
  certificateArn?: string;
  certificateId?: string;
};

/** Result of register_thing. */
export type RegisterThingResult = {
  certificatePem?: string;
  resourceArns?: Record<string, unknown>;
};

/** Result of run_authorization. */
export type RunAuthorizationResult = {
  authResults?: Record<string, unknown>[];
};

/** Result of run_invoke_authorizer. */
export type RunInvokeAuthorizerResult = {
  isAuthenticated?: boolean;
  principalId?: string;
  policyDocuments?: string[];
  refreshAfterInSeconds?: number;
  disconnectAfterInSeconds?: number;
};

/** Result of search_index. */
export type SearchIndexResult = {
  nextToken?: string;
  things?: Record<string, unknown>[];
  thingGroups?: Record<string, unknown>[];
};

/** Result of set_default_authorizer. */
export type SetDefaultAuthorizerResult = {
  authorizerName?: string;
  authorizerArn?: string;
};

/** Result of start_audit_mitigation_actions_task. */
export type StartAuditMitigationActionsTaskResult = {
  taskId?: string;
};

/** Result of start_detect_mitigation_actions_task. */
export type StartDetectMitigationActionsTaskResult = {
  taskId?: string;
};

/** Result of start_on_demand_audit_task. */
export type StartOnDemandAuditTaskResult = {
  taskId?: string;
};

/** Result of start_thing_registration_task. */
export type StartThingRegistrationTaskResult = {
  taskId?: string;
};

/** Result of transfer_certificate. */
export type TransferCertificateResult = {
  transferredCertificateArn?: string;
};

/** Result of update_authorizer. */
export type UpdateAuthorizerResult = {
  authorizerName?: string;
  authorizerArn?: string;
};

/** Result of update_billing_group. */
export type UpdateBillingGroupResult = {
  version?: number;
};

/** Result of update_certificate_provider. */
export type UpdateCertificateProviderResult = {
  certificateProviderName?: string;
  certificateProviderArn?: string;
};

/** Result of update_command. */
export type UpdateCommandResult = {
  commandId?: string;
  displayName?: string;
  description?: string;
  deprecated?: boolean;
  lastUpdatedAt?: string;
};

/** Result of update_custom_metric. */
export type UpdateCustomMetricResult = {
  metricName?: string;
  metricArn?: string;
  metricType?: string;
  displayName?: string;
  creationDate?: string;
  lastModifiedDate?: string;
};

/** Result of update_dimension. */
export type UpdateDimensionResult = {
  name?: string;
  arn?: string;
  typeValue?: string;
  stringValues?: string[];
  creationDate?: string;
  lastModifiedDate?: string;
};

/** Result of update_domain_configuration. */
export type UpdateDomainConfigurationResult = {
  domainConfigurationName?: string;
  domainConfigurationArn?: string;
};

/** Result of update_dynamic_thing_group. */
export type UpdateDynamicThingGroupResult = {
  version?: number;
};

/** Result of update_mitigation_action. */
export type UpdateMitigationActionResult = {
  actionArn?: string;
  actionId?: string;
};

/** Result of update_role_alias. */
export type UpdateRoleAliasResult = {
  roleAlias?: string;
  roleAliasArn?: string;
};

/** Result of update_scheduled_audit. */
export type UpdateScheduledAuditResult = {
  scheduledAuditArn?: string;
};

/** Result of update_security_profile. */
export type UpdateSecurityProfileResult = {
  securityProfileName?: string;
  securityProfileArn?: string;
  securityProfileDescription?: string;
  behaviors?: Record<string, unknown>[];
  alertTargets?: Record<string, unknown>;
  additionalMetricsToRetain?: string[];
  additionalMetricsToRetainV2?: Record<string, unknown>[];
  version?: number;
  creationDate?: string;
  lastModifiedDate?: string;
  metricsExportConfig?: Record<string, unknown>;
};

/** Result of update_stream. */
export type UpdateStreamResult = {
  streamId?: string;
  streamArn?: string;
  description?: string;
  streamVersion?: number;
};

/** Result of update_thing_group. */
export type UpdateThingGroupResult = {
  version?: number;
};

/** Result of validate_security_profile_behaviors. */
export type ValidateSecurityProfileBehaviorsResult = {
  valid?: boolean;
  validationErrors?: Record<string, unknown>[];
};

/** Create an IoT thing. */
export async function createThing(thingName: string, thingTypeName?: string, attributes?: Record<string, unknown>, regionName?: string): Promise<IoTThing> {
  try {
    // TODO: implement create_thing
    throw new Error("create_thing not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_thing failed");
  }
}

/** Describe an IoT thing. */
export async function describeThing(thingName: string, regionName?: string): Promise<IoTThing> {
  try {
    // TODO: implement describe_thing
    throw new Error("describe_thing not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_thing failed");
  }
}

/** List all IoT things in the account. */
export async function listThings(regionName?: string): Promise<IoTThing[]> {
  try {
    // TODO: implement list_things
    throw new Error("list_things not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_things failed");
  }
}

/** Delete an IoT thing. */
export async function deleteThing(thingName: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_thing
    throw new Error("delete_thing not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_thing failed");
  }
}

/** Update an IoT thing. */
export async function updateThing(thingName: string, thingTypeName?: string, attributes?: Record<string, unknown>, removeThingType: boolean, regionName?: string): Promise<void> {
  try {
    // TODO: implement update_thing
    throw new Error("update_thing not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_thing failed");
  }
}

/** Create an IoT thing type. */
export async function createThingType(thingTypeName: string, searchableAttributes?: string[], description?: string, regionName?: string): Promise<IoTThingType> {
  try {
    // TODO: implement create_thing_type
    throw new Error("create_thing_type not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_thing_type failed");
  }
}

/** List all IoT thing types in the account. */
export async function listThingTypes(regionName?: string): Promise<IoTThingType[]> {
  try {
    // TODO: implement list_thing_types
    throw new Error("list_thing_types not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_thing_types failed");
  }
}

/** Create an IoT thing group. */
export async function createThingGroup(thingGroupName: string, parentGroupName?: string, regionName?: string): Promise<IoTThingGroup> {
  try {
    // TODO: implement create_thing_group
    throw new Error("create_thing_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_thing_group failed");
  }
}

/** List all IoT thing groups in the account. */
export async function listThingGroups(regionName?: string): Promise<IoTThingGroup[]> {
  try {
    // TODO: implement list_thing_groups
    throw new Error("list_thing_groups not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_thing_groups failed");
  }
}

/** Add an IoT thing to a thing group. */
export async function addThingToThingGroup(thingName: string, thingGroupName: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement add_thing_to_thing_group
    throw new Error("add_thing_to_thing_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "add_thing_to_thing_group failed");
  }
}

/** Create an IoT policy. */
export async function createPolicy(policyName: string, policyDocument: unknown, regionName?: string): Promise<IoTPolicy> {
  try {
    // TODO: implement create_policy
    throw new Error("create_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_policy failed");
  }
}

/** Get an IoT policy by name. */
export async function getPolicy(policyName: string, regionName?: string): Promise<IoTPolicy> {
  try {
    // TODO: implement get_policy
    throw new Error("get_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_policy failed");
  }
}

/** List all IoT policies in the account. */
export async function listPolicies(regionName?: string): Promise<IoTPolicy[]> {
  try {
    // TODO: implement list_policies
    throw new Error("list_policies not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_policies failed");
  }
}

/** Delete an IoT policy. */
export async function deletePolicy(policyName: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_policy
    throw new Error("delete_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_policy failed");
  }
}

/** Attach an IoT policy to a target (certificate ARN, Cognito identity, etc.). */
export async function attachPolicy(policyName: string, target: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement attach_policy
    throw new Error("attach_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "attach_policy failed");
  }
}

/** Detach an IoT policy from a target. */
export async function detachPolicy(policyName: string, target: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement detach_policy
    throw new Error("detach_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "detach_policy failed");
  }
}

/** Create an IoT topic rule. */
export async function createTopicRule(ruleName: string, sql: string, actions: Record<string, unknown>[], description: string, ruleDisabled: boolean, regionName?: string): Promise<void> {
  try {
    // TODO: implement create_topic_rule
    throw new Error("create_topic_rule not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_topic_rule failed");
  }
}

/** Get an IoT topic rule by name. */
export async function getTopicRule(ruleName: string, regionName?: string): Promise<IoTTopicRule> {
  try {
    // TODO: implement get_topic_rule
    throw new Error("get_topic_rule not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_topic_rule failed");
  }
}

/** List all IoT topic rules in the account. */
export async function listTopicRules(regionName?: string): Promise<IoTTopicRule[]> {
  try {
    // TODO: implement list_topic_rules
    throw new Error("list_topic_rules not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_topic_rules failed");
  }
}

/** Delete an IoT topic rule. */
export async function deleteTopicRule(ruleName: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_topic_rule
    throw new Error("delete_topic_rule not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_topic_rule failed");
  }
}

/** Create an IoT job. */
export async function createJob(jobId: string, targets: string[], documentSource?: string, document?: unknown, description: string, targetSelection: string, regionName?: string): Promise<IoTJob> {
  try {
    // TODO: implement create_job
    throw new Error("create_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_job failed");
  }
}

/** Describe an IoT job. */
export async function describeJob(jobId: string, regionName?: string): Promise<IoTJob> {
  try {
    // TODO: implement describe_job
    throw new Error("describe_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_job failed");
  }
}

/** List IoT jobs, optionally filtered by status. */
export async function listJobs(status?: string, regionName?: string): Promise<IoTJob[]> {
  try {
    // TODO: implement list_jobs
    throw new Error("list_jobs not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_jobs failed");
  }
}

/** Cancel an IoT job. */
export async function cancelJob(jobId: string, reasonCode: string, comment: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement cancel_job
    throw new Error("cancel_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "cancel_job failed");
  }
}

/** Accept certificate transfer. */
export async function acceptCertificateTransfer(certificateId: string): Promise<void> {
  try {
    // TODO: implement accept_certificate_transfer
    throw new Error("accept_certificate_transfer not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "accept_certificate_transfer failed");
  }
}

/** Add thing to billing group. */
export async function addThingToBillingGroup(): Promise<void> {
  try {
    // TODO: implement add_thing_to_billing_group
    throw new Error("add_thing_to_billing_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "add_thing_to_billing_group failed");
  }
}

/** Associate sbom with package version. */
export async function associateSbomWithPackageVersion(packageName: string, versionName: string, sbom: Record<string, unknown>): Promise<AssociateSbomWithPackageVersionResult> {
  try {
    // TODO: implement associate_sbom_with_package_version
    throw new Error("associate_sbom_with_package_version not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "associate_sbom_with_package_version failed");
  }
}

/** Associate targets with job. */
export async function associateTargetsWithJob(targets: string[], jobId: string): Promise<AssociateTargetsWithJobResult> {
  try {
    // TODO: implement associate_targets_with_job
    throw new Error("associate_targets_with_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "associate_targets_with_job failed");
  }
}

/** Attach principal policy. */
export async function attachPrincipalPolicy(policyName: string, principal: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement attach_principal_policy
    throw new Error("attach_principal_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "attach_principal_policy failed");
  }
}

/** Attach security profile. */
export async function attachSecurityProfile(securityProfileName: string, securityProfileTargetArn: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement attach_security_profile
    throw new Error("attach_security_profile not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "attach_security_profile failed");
  }
}

/** Attach thing principal. */
export async function attachThingPrincipal(thingName: string, principal: string): Promise<void> {
  try {
    // TODO: implement attach_thing_principal
    throw new Error("attach_thing_principal not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "attach_thing_principal failed");
  }
}

/** Cancel audit mitigation actions task. */
export async function cancelAuditMitigationActionsTask(taskId: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement cancel_audit_mitigation_actions_task
    throw new Error("cancel_audit_mitigation_actions_task not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "cancel_audit_mitigation_actions_task failed");
  }
}

/** Cancel audit task. */
export async function cancelAuditTask(taskId: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement cancel_audit_task
    throw new Error("cancel_audit_task not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "cancel_audit_task failed");
  }
}

/** Cancel certificate transfer. */
export async function cancelCertificateTransfer(certificateId: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement cancel_certificate_transfer
    throw new Error("cancel_certificate_transfer not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "cancel_certificate_transfer failed");
  }
}

/** Cancel detect mitigation actions task. */
export async function cancelDetectMitigationActionsTask(taskId: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement cancel_detect_mitigation_actions_task
    throw new Error("cancel_detect_mitigation_actions_task not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "cancel_detect_mitigation_actions_task failed");
  }
}

/** Cancel job execution. */
export async function cancelJobExecution(jobId: string, thingName: string): Promise<void> {
  try {
    // TODO: implement cancel_job_execution
    throw new Error("cancel_job_execution not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "cancel_job_execution failed");
  }
}

/** Clear default authorizer. */
export async function clearDefaultAuthorizer(regionName?: string): Promise<void> {
  try {
    // TODO: implement clear_default_authorizer
    throw new Error("clear_default_authorizer not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "clear_default_authorizer failed");
  }
}

/** Confirm topic rule destination. */
export async function confirmTopicRuleDestination(confirmationToken: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement confirm_topic_rule_destination
    throw new Error("confirm_topic_rule_destination not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "confirm_topic_rule_destination failed");
  }
}

/** Create audit suppression. */
export async function createAuditSuppression(checkName: string, resourceIdentifier: Record<string, unknown>, clientRequestToken: string): Promise<void> {
  try {
    // TODO: implement create_audit_suppression
    throw new Error("create_audit_suppression not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_audit_suppression failed");
  }
}

/** Create authorizer. */
export async function createAuthorizer(authorizerName: string, authorizerFunctionArn: string): Promise<CreateAuthorizerResult> {
  try {
    // TODO: implement create_authorizer
    throw new Error("create_authorizer not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_authorizer failed");
  }
}

/** Create billing group. */
export async function createBillingGroup(billingGroupName: string): Promise<CreateBillingGroupResult> {
  try {
    // TODO: implement create_billing_group
    throw new Error("create_billing_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_billing_group failed");
  }
}

/** Create certificate from csr. */
export async function createCertificateFromCsr(certificateSigningRequest: string): Promise<CreateCertificateFromCsrResult> {
  try {
    // TODO: implement create_certificate_from_csr
    throw new Error("create_certificate_from_csr not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_certificate_from_csr failed");
  }
}

/** Create certificate provider. */
export async function createCertificateProvider(certificateProviderName: string, lambdaFunctionArn: string, accountDefaultForOperations: string[]): Promise<CreateCertificateProviderResult> {
  try {
    // TODO: implement create_certificate_provider
    throw new Error("create_certificate_provider not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_certificate_provider failed");
  }
}

/** Create command. */
export async function createCommand(commandId: string): Promise<CreateCommandResult> {
  try {
    // TODO: implement create_command
    throw new Error("create_command not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_command failed");
  }
}

/** Create custom metric. */
export async function createCustomMetric(metricName: string, metricType: string, clientRequestToken: string): Promise<CreateCustomMetricResult> {
  try {
    // TODO: implement create_custom_metric
    throw new Error("create_custom_metric not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_custom_metric failed");
  }
}

/** Create dimension. */
export async function createDimension(name: string, typeValue: string, stringValues: string[], clientRequestToken: string): Promise<CreateDimensionResult> {
  try {
    // TODO: implement create_dimension
    throw new Error("create_dimension not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_dimension failed");
  }
}

/** Create domain configuration. */
export async function createDomainConfiguration(domainConfigurationName: string): Promise<CreateDomainConfigurationResult> {
  try {
    // TODO: implement create_domain_configuration
    throw new Error("create_domain_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_domain_configuration failed");
  }
}

/** Create dynamic thing group. */
export async function createDynamicThingGroup(thingGroupName: string, queryString: string): Promise<CreateDynamicThingGroupResult> {
  try {
    // TODO: implement create_dynamic_thing_group
    throw new Error("create_dynamic_thing_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_dynamic_thing_group failed");
  }
}

/** Create fleet metric. */
export async function createFleetMetric(metricName: string, queryString: string, aggregationType: Record<string, unknown>, period: number, aggregationField: string): Promise<CreateFleetMetricResult> {
  try {
    // TODO: implement create_fleet_metric
    throw new Error("create_fleet_metric not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_fleet_metric failed");
  }
}

/** Create job template. */
export async function createJobTemplate(jobTemplateId: string, description: string): Promise<CreateJobTemplateResult> {
  try {
    // TODO: implement create_job_template
    throw new Error("create_job_template not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_job_template failed");
  }
}

/** Create keys and certificate. */
export async function createKeysAndCertificate(): Promise<CreateKeysAndCertificateResult> {
  try {
    // TODO: implement create_keys_and_certificate
    throw new Error("create_keys_and_certificate not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_keys_and_certificate failed");
  }
}

/** Create mitigation action. */
export async function createMitigationAction(actionName: string, roleArn: string, actionParams: Record<string, unknown>): Promise<CreateMitigationActionResult> {
  try {
    // TODO: implement create_mitigation_action
    throw new Error("create_mitigation_action not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_mitigation_action failed");
  }
}

/** Create ota update. */
export async function createOtaUpdate(otaUpdateId: string, targets: string[], files: Record<string, unknown>[], roleArn: string): Promise<CreateOtaUpdateResult> {
  try {
    // TODO: implement create_ota_update
    throw new Error("create_ota_update not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_ota_update failed");
  }
}

/** Create package. */
export async function createPackage(packageName: string): Promise<CreatePackageResult> {
  try {
    // TODO: implement create_package
    throw new Error("create_package not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_package failed");
  }
}

/** Create package version. */
export async function createPackageVersion(packageName: string, versionName: string): Promise<CreatePackageVersionResult> {
  try {
    // TODO: implement create_package_version
    throw new Error("create_package_version not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_package_version failed");
  }
}

/** Create policy version. */
export async function createPolicyVersion(policyName: string, policyDocument: string): Promise<CreatePolicyVersionResult> {
  try {
    // TODO: implement create_policy_version
    throw new Error("create_policy_version not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_policy_version failed");
  }
}

/** Create provisioning claim. */
export async function createProvisioningClaim(templateName: string, regionName?: string): Promise<CreateProvisioningClaimResult> {
  try {
    // TODO: implement create_provisioning_claim
    throw new Error("create_provisioning_claim not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_provisioning_claim failed");
  }
}

/** Create provisioning template. */
export async function createProvisioningTemplate(templateName: string, templateBody: string, provisioningRoleArn: string): Promise<CreateProvisioningTemplateResult> {
  try {
    // TODO: implement create_provisioning_template
    throw new Error("create_provisioning_template not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_provisioning_template failed");
  }
}

/** Create provisioning template version. */
export async function createProvisioningTemplateVersion(templateName: string, templateBody: string): Promise<CreateProvisioningTemplateVersionResult> {
  try {
    // TODO: implement create_provisioning_template_version
    throw new Error("create_provisioning_template_version not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_provisioning_template_version failed");
  }
}

/** Create role alias. */
export async function createRoleAlias(roleAlias: string, roleArn: string): Promise<CreateRoleAliasResult> {
  try {
    // TODO: implement create_role_alias
    throw new Error("create_role_alias not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_role_alias failed");
  }
}

/** Create scheduled audit. */
export async function createScheduledAudit(frequency: string, targetCheckNames: string[], scheduledAuditName: string): Promise<CreateScheduledAuditResult> {
  try {
    // TODO: implement create_scheduled_audit
    throw new Error("create_scheduled_audit not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_scheduled_audit failed");
  }
}

/** Create security profile. */
export async function createSecurityProfile(securityProfileName: string): Promise<CreateSecurityProfileResult> {
  try {
    // TODO: implement create_security_profile
    throw new Error("create_security_profile not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_security_profile failed");
  }
}

/** Create stream. */
export async function createStream(streamId: string, files: Record<string, unknown>[], roleArn: string): Promise<CreateStreamResult> {
  try {
    // TODO: implement create_stream
    throw new Error("create_stream not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_stream failed");
  }
}

/** Create topic rule destination. */
export async function createTopicRuleDestination(destinationConfiguration: Record<string, unknown>, regionName?: string): Promise<CreateTopicRuleDestinationResult> {
  try {
    // TODO: implement create_topic_rule_destination
    throw new Error("create_topic_rule_destination not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_topic_rule_destination failed");
  }
}

/** Delete account audit configuration. */
export async function deleteAccountAuditConfiguration(): Promise<void> {
  try {
    // TODO: implement delete_account_audit_configuration
    throw new Error("delete_account_audit_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_account_audit_configuration failed");
  }
}

/** Delete audit suppression. */
export async function deleteAuditSuppression(checkName: string, resourceIdentifier: Record<string, unknown>, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_audit_suppression
    throw new Error("delete_audit_suppression not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_audit_suppression failed");
  }
}

/** Delete authorizer. */
export async function deleteAuthorizer(authorizerName: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_authorizer
    throw new Error("delete_authorizer not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_authorizer failed");
  }
}

/** Delete billing group. */
export async function deleteBillingGroup(billingGroupName: string): Promise<void> {
  try {
    // TODO: implement delete_billing_group
    throw new Error("delete_billing_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_billing_group failed");
  }
}

/** Delete ca certificate. */
export async function deleteCaCertificate(certificateId: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_ca_certificate
    throw new Error("delete_ca_certificate not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_ca_certificate failed");
  }
}

/** Delete certificate. */
export async function deleteCertificate(certificateId: string): Promise<void> {
  try {
    // TODO: implement delete_certificate
    throw new Error("delete_certificate not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_certificate failed");
  }
}

/** Delete certificate provider. */
export async function deleteCertificateProvider(certificateProviderName: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_certificate_provider
    throw new Error("delete_certificate_provider not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_certificate_provider failed");
  }
}

/** Delete command. */
export async function deleteCommand(commandId: string, regionName?: string): Promise<DeleteCommandResult> {
  try {
    // TODO: implement delete_command
    throw new Error("delete_command not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_command failed");
  }
}

/** Delete command execution. */
export async function deleteCommandExecution(executionId: string, targetArn: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_command_execution
    throw new Error("delete_command_execution not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_command_execution failed");
  }
}

/** Delete custom metric. */
export async function deleteCustomMetric(metricName: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_custom_metric
    throw new Error("delete_custom_metric not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_custom_metric failed");
  }
}

/** Delete dimension. */
export async function deleteDimension(name: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_dimension
    throw new Error("delete_dimension not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_dimension failed");
  }
}

/** Delete domain configuration. */
export async function deleteDomainConfiguration(domainConfigurationName: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_domain_configuration
    throw new Error("delete_domain_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_domain_configuration failed");
  }
}

/** Delete dynamic thing group. */
export async function deleteDynamicThingGroup(thingGroupName: string): Promise<void> {
  try {
    // TODO: implement delete_dynamic_thing_group
    throw new Error("delete_dynamic_thing_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_dynamic_thing_group failed");
  }
}

/** Delete fleet metric. */
export async function deleteFleetMetric(metricName: string): Promise<void> {
  try {
    // TODO: implement delete_fleet_metric
    throw new Error("delete_fleet_metric not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_fleet_metric failed");
  }
}

/** Delete job. */
export async function deleteJob(jobId: string): Promise<void> {
  try {
    // TODO: implement delete_job
    throw new Error("delete_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_job failed");
  }
}

/** Delete job execution. */
export async function deleteJobExecution(jobId: string, thingName: string, executionNumber: number): Promise<void> {
  try {
    // TODO: implement delete_job_execution
    throw new Error("delete_job_execution not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_job_execution failed");
  }
}

/** Delete job template. */
export async function deleteJobTemplate(jobTemplateId: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_job_template
    throw new Error("delete_job_template not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_job_template failed");
  }
}

/** Delete mitigation action. */
export async function deleteMitigationAction(actionName: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_mitigation_action
    throw new Error("delete_mitigation_action not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_mitigation_action failed");
  }
}

/** Delete ota update. */
export async function deleteOtaUpdate(otaUpdateId: string): Promise<void> {
  try {
    // TODO: implement delete_ota_update
    throw new Error("delete_ota_update not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_ota_update failed");
  }
}

/** Delete package. */
export async function deletePackage(packageName: string): Promise<void> {
  try {
    // TODO: implement delete_package
    throw new Error("delete_package not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_package failed");
  }
}

/** Delete package version. */
export async function deletePackageVersion(packageName: string, versionName: string): Promise<void> {
  try {
    // TODO: implement delete_package_version
    throw new Error("delete_package_version not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_package_version failed");
  }
}

/** Delete policy version. */
export async function deletePolicyVersion(policyName: string, policyVersionId: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_policy_version
    throw new Error("delete_policy_version not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_policy_version failed");
  }
}

/** Delete provisioning template. */
export async function deleteProvisioningTemplate(templateName: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_provisioning_template
    throw new Error("delete_provisioning_template not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_provisioning_template failed");
  }
}

/** Delete provisioning template version. */
export async function deleteProvisioningTemplateVersion(templateName: string, versionId: number, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_provisioning_template_version
    throw new Error("delete_provisioning_template_version not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_provisioning_template_version failed");
  }
}

/** Delete registration code. */
export async function deleteRegistrationCode(regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_registration_code
    throw new Error("delete_registration_code not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_registration_code failed");
  }
}

/** Delete role alias. */
export async function deleteRoleAlias(roleAlias: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_role_alias
    throw new Error("delete_role_alias not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_role_alias failed");
  }
}

/** Delete scheduled audit. */
export async function deleteScheduledAudit(scheduledAuditName: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_scheduled_audit
    throw new Error("delete_scheduled_audit not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_scheduled_audit failed");
  }
}

/** Delete security profile. */
export async function deleteSecurityProfile(securityProfileName: string): Promise<void> {
  try {
    // TODO: implement delete_security_profile
    throw new Error("delete_security_profile not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_security_profile failed");
  }
}

/** Delete stream. */
export async function deleteStream(streamId: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_stream
    throw new Error("delete_stream not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_stream failed");
  }
}

/** Delete thing group. */
export async function deleteThingGroup(thingGroupName: string): Promise<void> {
  try {
    // TODO: implement delete_thing_group
    throw new Error("delete_thing_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_thing_group failed");
  }
}

/** Delete thing type. */
export async function deleteThingType(thingTypeName: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_thing_type
    throw new Error("delete_thing_type not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_thing_type failed");
  }
}

/** Delete topic rule destination. */
export async function deleteTopicRuleDestination(arn: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_topic_rule_destination
    throw new Error("delete_topic_rule_destination not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_topic_rule_destination failed");
  }
}

/** Delete v2 logging level. */
export async function deleteV2LoggingLevel(targetType: string, targetName: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_v2_logging_level
    throw new Error("delete_v2_logging_level not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_v2_logging_level failed");
  }
}

/** Deprecate thing type. */
export async function deprecateThingType(thingTypeName: string): Promise<void> {
  try {
    // TODO: implement deprecate_thing_type
    throw new Error("deprecate_thing_type not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "deprecate_thing_type failed");
  }
}

/** Describe account audit configuration. */
export async function describeAccountAuditConfiguration(regionName?: string): Promise<DescribeAccountAuditConfigurationResult> {
  try {
    // TODO: implement describe_account_audit_configuration
    throw new Error("describe_account_audit_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_account_audit_configuration failed");
  }
}

/** Describe audit finding. */
export async function describeAuditFinding(findingId: string, regionName?: string): Promise<DescribeAuditFindingResult> {
  try {
    // TODO: implement describe_audit_finding
    throw new Error("describe_audit_finding not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_audit_finding failed");
  }
}

/** Describe audit mitigation actions task. */
export async function describeAuditMitigationActionsTask(taskId: string, regionName?: string): Promise<DescribeAuditMitigationActionsTaskResult> {
  try {
    // TODO: implement describe_audit_mitigation_actions_task
    throw new Error("describe_audit_mitigation_actions_task not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_audit_mitigation_actions_task failed");
  }
}

/** Describe audit suppression. */
export async function describeAuditSuppression(checkName: string, resourceIdentifier: Record<string, unknown>, regionName?: string): Promise<DescribeAuditSuppressionResult> {
  try {
    // TODO: implement describe_audit_suppression
    throw new Error("describe_audit_suppression not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_audit_suppression failed");
  }
}

/** Describe audit task. */
export async function describeAuditTask(taskId: string, regionName?: string): Promise<DescribeAuditTaskResult> {
  try {
    // TODO: implement describe_audit_task
    throw new Error("describe_audit_task not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_audit_task failed");
  }
}

/** Describe authorizer. */
export async function describeAuthorizer(authorizerName: string, regionName?: string): Promise<DescribeAuthorizerResult> {
  try {
    // TODO: implement describe_authorizer
    throw new Error("describe_authorizer not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_authorizer failed");
  }
}

/** Describe billing group. */
export async function describeBillingGroup(billingGroupName: string, regionName?: string): Promise<DescribeBillingGroupResult> {
  try {
    // TODO: implement describe_billing_group
    throw new Error("describe_billing_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_billing_group failed");
  }
}

/** Describe ca certificate. */
export async function describeCaCertificate(certificateId: string, regionName?: string): Promise<DescribeCaCertificateResult> {
  try {
    // TODO: implement describe_ca_certificate
    throw new Error("describe_ca_certificate not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_ca_certificate failed");
  }
}

/** Describe certificate. */
export async function describeCertificate(certificateId: string, regionName?: string): Promise<DescribeCertificateResult> {
  try {
    // TODO: implement describe_certificate
    throw new Error("describe_certificate not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_certificate failed");
  }
}

/** Describe certificate provider. */
export async function describeCertificateProvider(certificateProviderName: string, regionName?: string): Promise<DescribeCertificateProviderResult> {
  try {
    // TODO: implement describe_certificate_provider
    throw new Error("describe_certificate_provider not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_certificate_provider failed");
  }
}

/** Describe custom metric. */
export async function describeCustomMetric(metricName: string, regionName?: string): Promise<DescribeCustomMetricResult> {
  try {
    // TODO: implement describe_custom_metric
    throw new Error("describe_custom_metric not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_custom_metric failed");
  }
}

/** Describe default authorizer. */
export async function describeDefaultAuthorizer(regionName?: string): Promise<DescribeDefaultAuthorizerResult> {
  try {
    // TODO: implement describe_default_authorizer
    throw new Error("describe_default_authorizer not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_default_authorizer failed");
  }
}

/** Describe detect mitigation actions task. */
export async function describeDetectMitigationActionsTask(taskId: string, regionName?: string): Promise<DescribeDetectMitigationActionsTaskResult> {
  try {
    // TODO: implement describe_detect_mitigation_actions_task
    throw new Error("describe_detect_mitigation_actions_task not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_detect_mitigation_actions_task failed");
  }
}

/** Describe dimension. */
export async function describeDimension(name: string, regionName?: string): Promise<DescribeDimensionResult> {
  try {
    // TODO: implement describe_dimension
    throw new Error("describe_dimension not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_dimension failed");
  }
}

/** Describe domain configuration. */
export async function describeDomainConfiguration(domainConfigurationName: string, regionName?: string): Promise<DescribeDomainConfigurationResult> {
  try {
    // TODO: implement describe_domain_configuration
    throw new Error("describe_domain_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_domain_configuration failed");
  }
}

/** Describe encryption configuration. */
export async function describeEncryptionConfiguration(regionName?: string): Promise<DescribeEncryptionConfigurationResult> {
  try {
    // TODO: implement describe_encryption_configuration
    throw new Error("describe_encryption_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_encryption_configuration failed");
  }
}

/** Describe endpoint. */
export async function describeEndpoint(): Promise<DescribeEndpointResult> {
  try {
    // TODO: implement describe_endpoint
    throw new Error("describe_endpoint not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_endpoint failed");
  }
}

/** Describe event configurations. */
export async function describeEventConfigurations(regionName?: string): Promise<DescribeEventConfigurationsResult> {
  try {
    // TODO: implement describe_event_configurations
    throw new Error("describe_event_configurations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_event_configurations failed");
  }
}

/** Describe fleet metric. */
export async function describeFleetMetric(metricName: string, regionName?: string): Promise<DescribeFleetMetricResult> {
  try {
    // TODO: implement describe_fleet_metric
    throw new Error("describe_fleet_metric not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_fleet_metric failed");
  }
}

/** Describe index. */
export async function describeIndex(indexName: string, regionName?: string): Promise<DescribeIndexResult> {
  try {
    // TODO: implement describe_index
    throw new Error("describe_index not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_index failed");
  }
}

/** Describe job execution. */
export async function describeJobExecution(jobId: string, thingName: string): Promise<DescribeJobExecutionResult> {
  try {
    // TODO: implement describe_job_execution
    throw new Error("describe_job_execution not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_job_execution failed");
  }
}

/** Describe job template. */
export async function describeJobTemplate(jobTemplateId: string, regionName?: string): Promise<DescribeJobTemplateResult> {
  try {
    // TODO: implement describe_job_template
    throw new Error("describe_job_template not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_job_template failed");
  }
}

/** Describe managed job template. */
export async function describeManagedJobTemplate(templateName: string): Promise<DescribeManagedJobTemplateResult> {
  try {
    // TODO: implement describe_managed_job_template
    throw new Error("describe_managed_job_template not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_managed_job_template failed");
  }
}

/** Describe mitigation action. */
export async function describeMitigationAction(actionName: string, regionName?: string): Promise<DescribeMitigationActionResult> {
  try {
    // TODO: implement describe_mitigation_action
    throw new Error("describe_mitigation_action not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_mitigation_action failed");
  }
}

/** Describe provisioning template. */
export async function describeProvisioningTemplate(templateName: string, regionName?: string): Promise<DescribeProvisioningTemplateResult> {
  try {
    // TODO: implement describe_provisioning_template
    throw new Error("describe_provisioning_template not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_provisioning_template failed");
  }
}

/** Describe provisioning template version. */
export async function describeProvisioningTemplateVersion(templateName: string, versionId: number, regionName?: string): Promise<DescribeProvisioningTemplateVersionResult> {
  try {
    // TODO: implement describe_provisioning_template_version
    throw new Error("describe_provisioning_template_version not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_provisioning_template_version failed");
  }
}

/** Describe role alias. */
export async function describeRoleAlias(roleAlias: string, regionName?: string): Promise<DescribeRoleAliasResult> {
  try {
    // TODO: implement describe_role_alias
    throw new Error("describe_role_alias not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_role_alias failed");
  }
}

/** Describe scheduled audit. */
export async function describeScheduledAudit(scheduledAuditName: string, regionName?: string): Promise<DescribeScheduledAuditResult> {
  try {
    // TODO: implement describe_scheduled_audit
    throw new Error("describe_scheduled_audit not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_scheduled_audit failed");
  }
}

/** Describe security profile. */
export async function describeSecurityProfile(securityProfileName: string, regionName?: string): Promise<DescribeSecurityProfileResult> {
  try {
    // TODO: implement describe_security_profile
    throw new Error("describe_security_profile not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_security_profile failed");
  }
}

/** Describe stream. */
export async function describeStream(streamId: string, regionName?: string): Promise<DescribeStreamResult> {
  try {
    // TODO: implement describe_stream
    throw new Error("describe_stream not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_stream failed");
  }
}

/** Describe thing group. */
export async function describeThingGroup(thingGroupName: string, regionName?: string): Promise<DescribeThingGroupResult> {
  try {
    // TODO: implement describe_thing_group
    throw new Error("describe_thing_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_thing_group failed");
  }
}

/** Describe thing registration task. */
export async function describeThingRegistrationTask(taskId: string, regionName?: string): Promise<DescribeThingRegistrationTaskResult> {
  try {
    // TODO: implement describe_thing_registration_task
    throw new Error("describe_thing_registration_task not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_thing_registration_task failed");
  }
}

/** Describe thing type. */
export async function describeThingType(thingTypeName: string, regionName?: string): Promise<DescribeThingTypeResult> {
  try {
    // TODO: implement describe_thing_type
    throw new Error("describe_thing_type not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_thing_type failed");
  }
}

/** Detach principal policy. */
export async function detachPrincipalPolicy(policyName: string, principal: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement detach_principal_policy
    throw new Error("detach_principal_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "detach_principal_policy failed");
  }
}

/** Detach security profile. */
export async function detachSecurityProfile(securityProfileName: string, securityProfileTargetArn: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement detach_security_profile
    throw new Error("detach_security_profile not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "detach_security_profile failed");
  }
}

/** Detach thing principal. */
export async function detachThingPrincipal(thingName: string, principal: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement detach_thing_principal
    throw new Error("detach_thing_principal not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "detach_thing_principal failed");
  }
}

/** Disable topic rule. */
export async function disableTopicRule(ruleName: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement disable_topic_rule
    throw new Error("disable_topic_rule not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disable_topic_rule failed");
  }
}

/** Disassociate sbom from package version. */
export async function disassociateSbomFromPackageVersion(packageName: string, versionName: string): Promise<void> {
  try {
    // TODO: implement disassociate_sbom_from_package_version
    throw new Error("disassociate_sbom_from_package_version not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disassociate_sbom_from_package_version failed");
  }
}

/** Enable topic rule. */
export async function enableTopicRule(ruleName: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement enable_topic_rule
    throw new Error("enable_topic_rule not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "enable_topic_rule failed");
  }
}

/** Get behavior model training summaries. */
export async function getBehaviorModelTrainingSummaries(): Promise<GetBehaviorModelTrainingSummariesResult> {
  try {
    // TODO: implement get_behavior_model_training_summaries
    throw new Error("get_behavior_model_training_summaries not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_behavior_model_training_summaries failed");
  }
}

/** Get buckets aggregation. */
export async function getBucketsAggregation(queryString: string, aggregationField: string, bucketsAggregationType: Record<string, unknown>): Promise<GetBucketsAggregationResult> {
  try {
    // TODO: implement get_buckets_aggregation
    throw new Error("get_buckets_aggregation not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_buckets_aggregation failed");
  }
}

/** Get cardinality. */
export async function getCardinality(queryString: string): Promise<GetCardinalityResult> {
  try {
    // TODO: implement get_cardinality
    throw new Error("get_cardinality not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_cardinality failed");
  }
}

/** Get command. */
export async function getCommand(commandId: string, regionName?: string): Promise<GetCommandResult> {
  try {
    // TODO: implement get_command
    throw new Error("get_command not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_command failed");
  }
}

/** Get command execution. */
export async function getCommandExecution(executionId: string, targetArn: string): Promise<GetCommandExecutionResult> {
  try {
    // TODO: implement get_command_execution
    throw new Error("get_command_execution not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_command_execution failed");
  }
}

/** Get effective policies. */
export async function getEffectivePolicies(): Promise<GetEffectivePoliciesResult> {
  try {
    // TODO: implement get_effective_policies
    throw new Error("get_effective_policies not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_effective_policies failed");
  }
}

/** Get indexing configuration. */
export async function getIndexingConfiguration(regionName?: string): Promise<GetIndexingConfigurationResult> {
  try {
    // TODO: implement get_indexing_configuration
    throw new Error("get_indexing_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_indexing_configuration failed");
  }
}

/** Get job document. */
export async function getJobDocument(jobId: string): Promise<GetJobDocumentResult> {
  try {
    // TODO: implement get_job_document
    throw new Error("get_job_document not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_job_document failed");
  }
}

/** Get logging options. */
export async function getLoggingOptions(regionName?: string): Promise<GetLoggingOptionsResult> {
  try {
    // TODO: implement get_logging_options
    throw new Error("get_logging_options not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_logging_options failed");
  }
}

/** Get ota update. */
export async function getOtaUpdate(otaUpdateId: string, regionName?: string): Promise<GetOtaUpdateResult> {
  try {
    // TODO: implement get_ota_update
    throw new Error("get_ota_update not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_ota_update failed");
  }
}

/** Get package. */
export async function getPackage(packageName: string, regionName?: string): Promise<GetPackageResult> {
  try {
    // TODO: implement get_package
    throw new Error("get_package not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_package failed");
  }
}

/** Get package configuration. */
export async function getPackageConfiguration(regionName?: string): Promise<GetPackageConfigurationResult> {
  try {
    // TODO: implement get_package_configuration
    throw new Error("get_package_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_package_configuration failed");
  }
}

/** Get package version. */
export async function getPackageVersion(packageName: string, versionName: string, regionName?: string): Promise<GetPackageVersionResult> {
  try {
    // TODO: implement get_package_version
    throw new Error("get_package_version not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_package_version failed");
  }
}

/** Get percentiles. */
export async function getPercentiles(queryString: string): Promise<GetPercentilesResult> {
  try {
    // TODO: implement get_percentiles
    throw new Error("get_percentiles not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_percentiles failed");
  }
}

/** Get policy version. */
export async function getPolicyVersion(policyName: string, policyVersionId: string, regionName?: string): Promise<GetPolicyVersionResult> {
  try {
    // TODO: implement get_policy_version
    throw new Error("get_policy_version not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_policy_version failed");
  }
}

/** Get registration code. */
export async function getRegistrationCode(regionName?: string): Promise<GetRegistrationCodeResult> {
  try {
    // TODO: implement get_registration_code
    throw new Error("get_registration_code not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_registration_code failed");
  }
}

/** Get statistics. */
export async function getStatistics(queryString: string): Promise<GetStatisticsResult> {
  try {
    // TODO: implement get_statistics
    throw new Error("get_statistics not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_statistics failed");
  }
}

/** Get thing connectivity data. */
export async function getThingConnectivityData(thingName: string, regionName?: string): Promise<GetThingConnectivityDataResult> {
  try {
    // TODO: implement get_thing_connectivity_data
    throw new Error("get_thing_connectivity_data not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_thing_connectivity_data failed");
  }
}

/** Get topic rule destination. */
export async function getTopicRuleDestination(arn: string, regionName?: string): Promise<GetTopicRuleDestinationResult> {
  try {
    // TODO: implement get_topic_rule_destination
    throw new Error("get_topic_rule_destination not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_topic_rule_destination failed");
  }
}

/** Get v2 logging options. */
export async function getV2LoggingOptions(regionName?: string): Promise<GetV2LoggingOptionsResult> {
  try {
    // TODO: implement get_v2_logging_options
    throw new Error("get_v2_logging_options not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_v2_logging_options failed");
  }
}

/** List active violations. */
export async function listActiveViolations(): Promise<ListActiveViolationsResult> {
  try {
    // TODO: implement list_active_violations
    throw new Error("list_active_violations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_active_violations failed");
  }
}

/** List attached policies. */
export async function listAttachedPolicies(target: string): Promise<ListAttachedPoliciesResult> {
  try {
    // TODO: implement list_attached_policies
    throw new Error("list_attached_policies not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_attached_policies failed");
  }
}

/** List audit findings. */
export async function listAuditFindings(): Promise<ListAuditFindingsResult> {
  try {
    // TODO: implement list_audit_findings
    throw new Error("list_audit_findings not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_audit_findings failed");
  }
}

/** List audit mitigation actions executions. */
export async function listAuditMitigationActionsExecutions(taskId: string, findingId: string): Promise<ListAuditMitigationActionsExecutionsResult> {
  try {
    // TODO: implement list_audit_mitigation_actions_executions
    throw new Error("list_audit_mitigation_actions_executions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_audit_mitigation_actions_executions failed");
  }
}

/** List audit mitigation actions tasks. */
export async function listAuditMitigationActionsTasks(startTime: string, endTime: string): Promise<ListAuditMitigationActionsTasksResult> {
  try {
    // TODO: implement list_audit_mitigation_actions_tasks
    throw new Error("list_audit_mitigation_actions_tasks not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_audit_mitigation_actions_tasks failed");
  }
}

/** List audit suppressions. */
export async function listAuditSuppressions(): Promise<ListAuditSuppressionsResult> {
  try {
    // TODO: implement list_audit_suppressions
    throw new Error("list_audit_suppressions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_audit_suppressions failed");
  }
}

/** List audit tasks. */
export async function listAuditTasks(startTime: string, endTime: string): Promise<ListAuditTasksResult> {
  try {
    // TODO: implement list_audit_tasks
    throw new Error("list_audit_tasks not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_audit_tasks failed");
  }
}

/** List authorizers. */
export async function listAuthorizers(): Promise<ListAuthorizersResult> {
  try {
    // TODO: implement list_authorizers
    throw new Error("list_authorizers not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_authorizers failed");
  }
}

/** List billing groups. */
export async function listBillingGroups(): Promise<ListBillingGroupsResult> {
  try {
    // TODO: implement list_billing_groups
    throw new Error("list_billing_groups not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_billing_groups failed");
  }
}

/** List ca certificates. */
export async function listCaCertificates(): Promise<ListCaCertificatesResult> {
  try {
    // TODO: implement list_ca_certificates
    throw new Error("list_ca_certificates not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_ca_certificates failed");
  }
}

/** List certificate providers. */
export async function listCertificateProviders(): Promise<ListCertificateProvidersResult> {
  try {
    // TODO: implement list_certificate_providers
    throw new Error("list_certificate_providers not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_certificate_providers failed");
  }
}

/** List certificates. */
export async function listCertificates(): Promise<ListCertificatesResult> {
  try {
    // TODO: implement list_certificates
    throw new Error("list_certificates not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_certificates failed");
  }
}

/** List certificates by ca. */
export async function listCertificatesByCa(caCertificateId: string): Promise<ListCertificatesByCaResult> {
  try {
    // TODO: implement list_certificates_by_ca
    throw new Error("list_certificates_by_ca not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_certificates_by_ca failed");
  }
}

/** List command executions. */
export async function listCommandExecutions(): Promise<ListCommandExecutionsResult> {
  try {
    // TODO: implement list_command_executions
    throw new Error("list_command_executions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_command_executions failed");
  }
}

/** List commands. */
export async function listCommands(): Promise<ListCommandsResult> {
  try {
    // TODO: implement list_commands
    throw new Error("list_commands not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_commands failed");
  }
}

/** List custom metrics. */
export async function listCustomMetrics(): Promise<ListCustomMetricsResult> {
  try {
    // TODO: implement list_custom_metrics
    throw new Error("list_custom_metrics not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_custom_metrics failed");
  }
}

/** List detect mitigation actions executions. */
export async function listDetectMitigationActionsExecutions(): Promise<ListDetectMitigationActionsExecutionsResult> {
  try {
    // TODO: implement list_detect_mitigation_actions_executions
    throw new Error("list_detect_mitigation_actions_executions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_detect_mitigation_actions_executions failed");
  }
}

/** List detect mitigation actions tasks. */
export async function listDetectMitigationActionsTasks(startTime: string, endTime: string): Promise<ListDetectMitigationActionsTasksResult> {
  try {
    // TODO: implement list_detect_mitigation_actions_tasks
    throw new Error("list_detect_mitigation_actions_tasks not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_detect_mitigation_actions_tasks failed");
  }
}

/** List dimensions. */
export async function listDimensions(): Promise<ListDimensionsResult> {
  try {
    // TODO: implement list_dimensions
    throw new Error("list_dimensions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_dimensions failed");
  }
}

/** List domain configurations. */
export async function listDomainConfigurations(): Promise<ListDomainConfigurationsResult> {
  try {
    // TODO: implement list_domain_configurations
    throw new Error("list_domain_configurations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_domain_configurations failed");
  }
}

/** List fleet metrics. */
export async function listFleetMetrics(): Promise<ListFleetMetricsResult> {
  try {
    // TODO: implement list_fleet_metrics
    throw new Error("list_fleet_metrics not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_fleet_metrics failed");
  }
}

/** List indices. */
export async function listIndices(): Promise<ListIndicesResult> {
  try {
    // TODO: implement list_indices
    throw new Error("list_indices not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_indices failed");
  }
}

/** List job executions for job. */
export async function listJobExecutionsForJob(jobId: string): Promise<ListJobExecutionsForJobResult> {
  try {
    // TODO: implement list_job_executions_for_job
    throw new Error("list_job_executions_for_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_job_executions_for_job failed");
  }
}

/** List job executions for thing. */
export async function listJobExecutionsForThing(thingName: string): Promise<ListJobExecutionsForThingResult> {
  try {
    // TODO: implement list_job_executions_for_thing
    throw new Error("list_job_executions_for_thing not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_job_executions_for_thing failed");
  }
}

/** List job templates. */
export async function listJobTemplates(): Promise<ListJobTemplatesResult> {
  try {
    // TODO: implement list_job_templates
    throw new Error("list_job_templates not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_job_templates failed");
  }
}

/** List managed job templates. */
export async function listManagedJobTemplates(): Promise<ListManagedJobTemplatesResult> {
  try {
    // TODO: implement list_managed_job_templates
    throw new Error("list_managed_job_templates not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_managed_job_templates failed");
  }
}

/** List metric values. */
export async function listMetricValues(thingName: string, metricName: string, startTime: string, endTime: string): Promise<ListMetricValuesResult> {
  try {
    // TODO: implement list_metric_values
    throw new Error("list_metric_values not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_metric_values failed");
  }
}

/** List mitigation actions. */
export async function listMitigationActions(): Promise<ListMitigationActionsResult> {
  try {
    // TODO: implement list_mitigation_actions
    throw new Error("list_mitigation_actions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_mitigation_actions failed");
  }
}

/** List ota updates. */
export async function listOtaUpdates(): Promise<ListOtaUpdatesResult> {
  try {
    // TODO: implement list_ota_updates
    throw new Error("list_ota_updates not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_ota_updates failed");
  }
}

/** List outgoing certificates. */
export async function listOutgoingCertificates(): Promise<ListOutgoingCertificatesResult> {
  try {
    // TODO: implement list_outgoing_certificates
    throw new Error("list_outgoing_certificates not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_outgoing_certificates failed");
  }
}

/** List package versions. */
export async function listPackageVersions(packageName: string): Promise<ListPackageVersionsResult> {
  try {
    // TODO: implement list_package_versions
    throw new Error("list_package_versions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_package_versions failed");
  }
}

/** List packages. */
export async function listPackages(): Promise<ListPackagesResult> {
  try {
    // TODO: implement list_packages
    throw new Error("list_packages not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_packages failed");
  }
}

/** List policy principals. */
export async function listPolicyPrincipals(policyName: string): Promise<ListPolicyPrincipalsResult> {
  try {
    // TODO: implement list_policy_principals
    throw new Error("list_policy_principals not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_policy_principals failed");
  }
}

/** List policy versions. */
export async function listPolicyVersions(policyName: string, regionName?: string): Promise<ListPolicyVersionsResult> {
  try {
    // TODO: implement list_policy_versions
    throw new Error("list_policy_versions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_policy_versions failed");
  }
}

/** List principal policies. */
export async function listPrincipalPolicies(principal: string): Promise<ListPrincipalPoliciesResult> {
  try {
    // TODO: implement list_principal_policies
    throw new Error("list_principal_policies not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_principal_policies failed");
  }
}

/** List principal things. */
export async function listPrincipalThings(principal: string): Promise<ListPrincipalThingsResult> {
  try {
    // TODO: implement list_principal_things
    throw new Error("list_principal_things not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_principal_things failed");
  }
}

/** List principal things v2. */
export async function listPrincipalThingsV2(principal: string): Promise<ListPrincipalThingsV2Result> {
  try {
    // TODO: implement list_principal_things_v2
    throw new Error("list_principal_things_v2 not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_principal_things_v2 failed");
  }
}

/** List provisioning template versions. */
export async function listProvisioningTemplateVersions(templateName: string): Promise<ListProvisioningTemplateVersionsResult> {
  try {
    // TODO: implement list_provisioning_template_versions
    throw new Error("list_provisioning_template_versions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_provisioning_template_versions failed");
  }
}

/** List provisioning templates. */
export async function listProvisioningTemplates(): Promise<ListProvisioningTemplatesResult> {
  try {
    // TODO: implement list_provisioning_templates
    throw new Error("list_provisioning_templates not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_provisioning_templates failed");
  }
}

/** List related resources for audit finding. */
export async function listRelatedResourcesForAuditFinding(findingId: string): Promise<ListRelatedResourcesForAuditFindingResult> {
  try {
    // TODO: implement list_related_resources_for_audit_finding
    throw new Error("list_related_resources_for_audit_finding not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_related_resources_for_audit_finding failed");
  }
}

/** List role aliases. */
export async function listRoleAliases(): Promise<ListRoleAliasesResult> {
  try {
    // TODO: implement list_role_aliases
    throw new Error("list_role_aliases not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_role_aliases failed");
  }
}

/** List sbom validation results. */
export async function listSbomValidationResults(packageName: string, versionName: string): Promise<ListSbomValidationResultsResult> {
  try {
    // TODO: implement list_sbom_validation_results
    throw new Error("list_sbom_validation_results not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_sbom_validation_results failed");
  }
}

/** List scheduled audits. */
export async function listScheduledAudits(): Promise<ListScheduledAuditsResult> {
  try {
    // TODO: implement list_scheduled_audits
    throw new Error("list_scheduled_audits not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_scheduled_audits failed");
  }
}

/** List security profiles. */
export async function listSecurityProfiles(): Promise<ListSecurityProfilesResult> {
  try {
    // TODO: implement list_security_profiles
    throw new Error("list_security_profiles not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_security_profiles failed");
  }
}

/** List security profiles for target. */
export async function listSecurityProfilesForTarget(securityProfileTargetArn: string): Promise<ListSecurityProfilesForTargetResult> {
  try {
    // TODO: implement list_security_profiles_for_target
    throw new Error("list_security_profiles_for_target not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_security_profiles_for_target failed");
  }
}

/** List streams. */
export async function listStreams(): Promise<ListStreamsResult> {
  try {
    // TODO: implement list_streams
    throw new Error("list_streams not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_streams failed");
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

/** List targets for policy. */
export async function listTargetsForPolicy(policyName: string): Promise<ListTargetsForPolicyResult> {
  try {
    // TODO: implement list_targets_for_policy
    throw new Error("list_targets_for_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_targets_for_policy failed");
  }
}

/** List targets for security profile. */
export async function listTargetsForSecurityProfile(securityProfileName: string): Promise<ListTargetsForSecurityProfileResult> {
  try {
    // TODO: implement list_targets_for_security_profile
    throw new Error("list_targets_for_security_profile not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_targets_for_security_profile failed");
  }
}

/** List thing groups for thing. */
export async function listThingGroupsForThing(thingName: string): Promise<ListThingGroupsForThingResult> {
  try {
    // TODO: implement list_thing_groups_for_thing
    throw new Error("list_thing_groups_for_thing not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_thing_groups_for_thing failed");
  }
}

/** List thing principals. */
export async function listThingPrincipals(thingName: string): Promise<ListThingPrincipalsResult> {
  try {
    // TODO: implement list_thing_principals
    throw new Error("list_thing_principals not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_thing_principals failed");
  }
}

/** List thing principals v2. */
export async function listThingPrincipalsV2(thingName: string): Promise<ListThingPrincipalsV2Result> {
  try {
    // TODO: implement list_thing_principals_v2
    throw new Error("list_thing_principals_v2 not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_thing_principals_v2 failed");
  }
}

/** List thing registration task reports. */
export async function listThingRegistrationTaskReports(taskId: string, reportType: string): Promise<ListThingRegistrationTaskReportsResult> {
  try {
    // TODO: implement list_thing_registration_task_reports
    throw new Error("list_thing_registration_task_reports not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_thing_registration_task_reports failed");
  }
}

/** List thing registration tasks. */
export async function listThingRegistrationTasks(): Promise<ListThingRegistrationTasksResult> {
  try {
    // TODO: implement list_thing_registration_tasks
    throw new Error("list_thing_registration_tasks not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_thing_registration_tasks failed");
  }
}

/** List things in billing group. */
export async function listThingsInBillingGroup(billingGroupName: string): Promise<ListThingsInBillingGroupResult> {
  try {
    // TODO: implement list_things_in_billing_group
    throw new Error("list_things_in_billing_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_things_in_billing_group failed");
  }
}

/** List things in thing group. */
export async function listThingsInThingGroup(thingGroupName: string): Promise<ListThingsInThingGroupResult> {
  try {
    // TODO: implement list_things_in_thing_group
    throw new Error("list_things_in_thing_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_things_in_thing_group failed");
  }
}

/** List topic rule destinations. */
export async function listTopicRuleDestinations(): Promise<ListTopicRuleDestinationsResult> {
  try {
    // TODO: implement list_topic_rule_destinations
    throw new Error("list_topic_rule_destinations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_topic_rule_destinations failed");
  }
}

/** List v2 logging levels. */
export async function listV2LoggingLevels(): Promise<ListV2LoggingLevelsResult> {
  try {
    // TODO: implement list_v2_logging_levels
    throw new Error("list_v2_logging_levels not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_v2_logging_levels failed");
  }
}

/** List violation events. */
export async function listViolationEvents(startTime: string, endTime: string): Promise<ListViolationEventsResult> {
  try {
    // TODO: implement list_violation_events
    throw new Error("list_violation_events not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_violation_events failed");
  }
}

/** Put verification state on violation. */
export async function putVerificationStateOnViolation(violationId: string, verificationState: string): Promise<void> {
  try {
    // TODO: implement put_verification_state_on_violation
    throw new Error("put_verification_state_on_violation not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_verification_state_on_violation failed");
  }
}

/** Register ca certificate. */
export async function registerCaCertificate(caCertificate: string): Promise<RegisterCaCertificateResult> {
  try {
    // TODO: implement register_ca_certificate
    throw new Error("register_ca_certificate not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "register_ca_certificate failed");
  }
}

/** Register certificate. */
export async function registerCertificate(certificatePem: string): Promise<RegisterCertificateResult> {
  try {
    // TODO: implement register_certificate
    throw new Error("register_certificate not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "register_certificate failed");
  }
}

/** Register certificate without ca. */
export async function registerCertificateWithoutCa(certificatePem: string): Promise<RegisterCertificateWithoutCaResult> {
  try {
    // TODO: implement register_certificate_without_ca
    throw new Error("register_certificate_without_ca not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "register_certificate_without_ca failed");
  }
}

/** Register thing. */
export async function registerThing(templateBody: string): Promise<RegisterThingResult> {
  try {
    // TODO: implement register_thing
    throw new Error("register_thing not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "register_thing failed");
  }
}

/** Reject certificate transfer. */
export async function rejectCertificateTransfer(certificateId: string): Promise<void> {
  try {
    // TODO: implement reject_certificate_transfer
    throw new Error("reject_certificate_transfer not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "reject_certificate_transfer failed");
  }
}

/** Remove thing from billing group. */
export async function removeThingFromBillingGroup(): Promise<void> {
  try {
    // TODO: implement remove_thing_from_billing_group
    throw new Error("remove_thing_from_billing_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "remove_thing_from_billing_group failed");
  }
}

/** Remove thing from thing group. */
export async function removeThingFromThingGroup(): Promise<void> {
  try {
    // TODO: implement remove_thing_from_thing_group
    throw new Error("remove_thing_from_thing_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "remove_thing_from_thing_group failed");
  }
}

/** Replace topic rule. */
export async function replaceTopicRule(ruleName: string, topicRulePayload: Record<string, unknown>, regionName?: string): Promise<void> {
  try {
    // TODO: implement replace_topic_rule
    throw new Error("replace_topic_rule not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "replace_topic_rule failed");
  }
}

/** Run authorization. */
export async function runAuthorization(authInfos: Record<string, unknown>[]): Promise<RunAuthorizationResult> {
  try {
    // TODO: implement run_authorization
    throw new Error("run_authorization not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "run_authorization failed");
  }
}

/** Run invoke authorizer. */
export async function runInvokeAuthorizer(authorizerName: string): Promise<RunInvokeAuthorizerResult> {
  try {
    // TODO: implement run_invoke_authorizer
    throw new Error("run_invoke_authorizer not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "run_invoke_authorizer failed");
  }
}

/** Search index. */
export async function searchIndex(queryString: string): Promise<SearchIndexResult> {
  try {
    // TODO: implement search_index
    throw new Error("search_index not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "search_index failed");
  }
}

/** Set default authorizer. */
export async function setDefaultAuthorizer(authorizerName: string, regionName?: string): Promise<SetDefaultAuthorizerResult> {
  try {
    // TODO: implement set_default_authorizer
    throw new Error("set_default_authorizer not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "set_default_authorizer failed");
  }
}

/** Set default policy version. */
export async function setDefaultPolicyVersion(policyName: string, policyVersionId: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement set_default_policy_version
    throw new Error("set_default_policy_version not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "set_default_policy_version failed");
  }
}

/** Set logging options. */
export async function setLoggingOptions(loggingOptionsPayload: Record<string, unknown>, regionName?: string): Promise<void> {
  try {
    // TODO: implement set_logging_options
    throw new Error("set_logging_options not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "set_logging_options failed");
  }
}

/** Set v2 logging level. */
export async function setV2LoggingLevel(logTarget: Record<string, unknown>, logLevel: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement set_v2_logging_level
    throw new Error("set_v2_logging_level not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "set_v2_logging_level failed");
  }
}

/** Set v2 logging options. */
export async function setV2LoggingOptions(): Promise<void> {
  try {
    // TODO: implement set_v2_logging_options
    throw new Error("set_v2_logging_options not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "set_v2_logging_options failed");
  }
}

/** Start audit mitigation actions task. */
export async function startAuditMitigationActionsTask(taskId: string, target: Record<string, unknown>, auditCheckToActionsMapping: Record<string, unknown>, clientRequestToken: string, regionName?: string): Promise<StartAuditMitigationActionsTaskResult> {
  try {
    // TODO: implement start_audit_mitigation_actions_task
    throw new Error("start_audit_mitigation_actions_task not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_audit_mitigation_actions_task failed");
  }
}

/** Start detect mitigation actions task. */
export async function startDetectMitigationActionsTask(taskId: string, target: Record<string, unknown>, actions: string[], clientRequestToken: string): Promise<StartDetectMitigationActionsTaskResult> {
  try {
    // TODO: implement start_detect_mitigation_actions_task
    throw new Error("start_detect_mitigation_actions_task not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_detect_mitigation_actions_task failed");
  }
}

/** Start on demand audit task. */
export async function startOnDemandAuditTask(targetCheckNames: string[], regionName?: string): Promise<StartOnDemandAuditTaskResult> {
  try {
    // TODO: implement start_on_demand_audit_task
    throw new Error("start_on_demand_audit_task not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_on_demand_audit_task failed");
  }
}

/** Start thing registration task. */
export async function startThingRegistrationTask(templateBody: string, inputFileBucket: string, inputFileKey: string, roleArn: string, regionName?: string): Promise<StartThingRegistrationTaskResult> {
  try {
    // TODO: implement start_thing_registration_task
    throw new Error("start_thing_registration_task not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_thing_registration_task failed");
  }
}

/** Stop thing registration task. */
export async function stopThingRegistrationTask(taskId: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement stop_thing_registration_task
    throw new Error("stop_thing_registration_task not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "stop_thing_registration_task failed");
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

/** Transfer certificate. */
export async function transferCertificate(certificateId: string, targetAwsAccount: string): Promise<TransferCertificateResult> {
  try {
    // TODO: implement transfer_certificate
    throw new Error("transfer_certificate not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "transfer_certificate failed");
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

/** Update account audit configuration. */
export async function updateAccountAuditConfiguration(): Promise<void> {
  try {
    // TODO: implement update_account_audit_configuration
    throw new Error("update_account_audit_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_account_audit_configuration failed");
  }
}

/** Update audit suppression. */
export async function updateAuditSuppression(checkName: string, resourceIdentifier: Record<string, unknown>): Promise<void> {
  try {
    // TODO: implement update_audit_suppression
    throw new Error("update_audit_suppression not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_audit_suppression failed");
  }
}

/** Update authorizer. */
export async function updateAuthorizer(authorizerName: string): Promise<UpdateAuthorizerResult> {
  try {
    // TODO: implement update_authorizer
    throw new Error("update_authorizer not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_authorizer failed");
  }
}

/** Update billing group. */
export async function updateBillingGroup(billingGroupName: string, billingGroupProperties: Record<string, unknown>): Promise<UpdateBillingGroupResult> {
  try {
    // TODO: implement update_billing_group
    throw new Error("update_billing_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_billing_group failed");
  }
}

/** Update ca certificate. */
export async function updateCaCertificate(certificateId: string): Promise<void> {
  try {
    // TODO: implement update_ca_certificate
    throw new Error("update_ca_certificate not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_ca_certificate failed");
  }
}

/** Update certificate. */
export async function updateCertificate(certificateId: string, newStatus: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement update_certificate
    throw new Error("update_certificate not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_certificate failed");
  }
}

/** Update certificate provider. */
export async function updateCertificateProvider(certificateProviderName: string): Promise<UpdateCertificateProviderResult> {
  try {
    // TODO: implement update_certificate_provider
    throw new Error("update_certificate_provider not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_certificate_provider failed");
  }
}

/** Update command. */
export async function updateCommand(commandId: string): Promise<UpdateCommandResult> {
  try {
    // TODO: implement update_command
    throw new Error("update_command not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_command failed");
  }
}

/** Update custom metric. */
export async function updateCustomMetric(metricName: string, displayName: string, regionName?: string): Promise<UpdateCustomMetricResult> {
  try {
    // TODO: implement update_custom_metric
    throw new Error("update_custom_metric not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_custom_metric failed");
  }
}

/** Update dimension. */
export async function updateDimension(name: string, stringValues: string[], regionName?: string): Promise<UpdateDimensionResult> {
  try {
    // TODO: implement update_dimension
    throw new Error("update_dimension not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_dimension failed");
  }
}

/** Update domain configuration. */
export async function updateDomainConfiguration(domainConfigurationName: string): Promise<UpdateDomainConfigurationResult> {
  try {
    // TODO: implement update_domain_configuration
    throw new Error("update_domain_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_domain_configuration failed");
  }
}

/** Update dynamic thing group. */
export async function updateDynamicThingGroup(thingGroupName: string, thingGroupProperties: Record<string, unknown>): Promise<UpdateDynamicThingGroupResult> {
  try {
    // TODO: implement update_dynamic_thing_group
    throw new Error("update_dynamic_thing_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_dynamic_thing_group failed");
  }
}

/** Update encryption configuration. */
export async function updateEncryptionConfiguration(encryptionType: string): Promise<void> {
  try {
    // TODO: implement update_encryption_configuration
    throw new Error("update_encryption_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_encryption_configuration failed");
  }
}

/** Update event configurations. */
export async function updateEventConfigurations(): Promise<void> {
  try {
    // TODO: implement update_event_configurations
    throw new Error("update_event_configurations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_event_configurations failed");
  }
}

/** Update fleet metric. */
export async function updateFleetMetric(metricName: string, indexName: string): Promise<void> {
  try {
    // TODO: implement update_fleet_metric
    throw new Error("update_fleet_metric not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_fleet_metric failed");
  }
}

/** Update indexing configuration. */
export async function updateIndexingConfiguration(): Promise<void> {
  try {
    // TODO: implement update_indexing_configuration
    throw new Error("update_indexing_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_indexing_configuration failed");
  }
}

/** Update job. */
export async function updateJob(jobId: string): Promise<void> {
  try {
    // TODO: implement update_job
    throw new Error("update_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_job failed");
  }
}

/** Update mitigation action. */
export async function updateMitigationAction(actionName: string): Promise<UpdateMitigationActionResult> {
  try {
    // TODO: implement update_mitigation_action
    throw new Error("update_mitigation_action not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_mitigation_action failed");
  }
}

/** Update package. */
export async function updatePackage(packageName: string): Promise<void> {
  try {
    // TODO: implement update_package
    throw new Error("update_package not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_package failed");
  }
}

/** Update package configuration. */
export async function updatePackageConfiguration(): Promise<void> {
  try {
    // TODO: implement update_package_configuration
    throw new Error("update_package_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_package_configuration failed");
  }
}

/** Update package version. */
export async function updatePackageVersion(packageName: string, versionName: string): Promise<void> {
  try {
    // TODO: implement update_package_version
    throw new Error("update_package_version not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_package_version failed");
  }
}

/** Update provisioning template. */
export async function updateProvisioningTemplate(templateName: string): Promise<void> {
  try {
    // TODO: implement update_provisioning_template
    throw new Error("update_provisioning_template not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_provisioning_template failed");
  }
}

/** Update role alias. */
export async function updateRoleAlias(roleAlias: string): Promise<UpdateRoleAliasResult> {
  try {
    // TODO: implement update_role_alias
    throw new Error("update_role_alias not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_role_alias failed");
  }
}

/** Update scheduled audit. */
export async function updateScheduledAudit(scheduledAuditName: string): Promise<UpdateScheduledAuditResult> {
  try {
    // TODO: implement update_scheduled_audit
    throw new Error("update_scheduled_audit not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_scheduled_audit failed");
  }
}

/** Update security profile. */
export async function updateSecurityProfile(securityProfileName: string): Promise<UpdateSecurityProfileResult> {
  try {
    // TODO: implement update_security_profile
    throw new Error("update_security_profile not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_security_profile failed");
  }
}

/** Update stream. */
export async function updateStream(streamId: string): Promise<UpdateStreamResult> {
  try {
    // TODO: implement update_stream
    throw new Error("update_stream not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_stream failed");
  }
}

/** Update thing group. */
export async function updateThingGroup(thingGroupName: string, thingGroupProperties: Record<string, unknown>): Promise<UpdateThingGroupResult> {
  try {
    // TODO: implement update_thing_group
    throw new Error("update_thing_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_thing_group failed");
  }
}

/** Update thing groups for thing. */
export async function updateThingGroupsForThing(): Promise<void> {
  try {
    // TODO: implement update_thing_groups_for_thing
    throw new Error("update_thing_groups_for_thing not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_thing_groups_for_thing failed");
  }
}

/** Update thing type. */
export async function updateThingType(thingTypeName: string): Promise<void> {
  try {
    // TODO: implement update_thing_type
    throw new Error("update_thing_type not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_thing_type failed");
  }
}

/** Update topic rule destination. */
export async function updateTopicRuleDestination(arn: string, status: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement update_topic_rule_destination
    throw new Error("update_topic_rule_destination not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_topic_rule_destination failed");
  }
}

/** Validate security profile behaviors. */
export async function validateSecurityProfileBehaviors(behaviors: Record<string, unknown>[], regionName?: string): Promise<ValidateSecurityProfileBehaviorsResult> {
  try {
    // TODO: implement validate_security_profile_behaviors
    throw new Error("validate_security_profile_behaviors not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "validate_security_profile_behaviors failed");
  }
}
