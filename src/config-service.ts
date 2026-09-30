import { ConfigServiceClient } from "@aws-sdk/client-config";
import { getClient } from "./client";
import { wrapAwsError } from "./exceptions";

/** Metadata for an AWS Config rule. */
export type ConfigRuleResult = {
  configRuleName: string;
  configRuleArn?: string;
  configRuleId?: string;
  source?: Record<string, unknown>;
  scope?: Record<string, unknown>;
  complianceType?: string;
  state?: string;
  extra?: Record<string, unknown>;
};

/** Metadata for an AWS Config configuration recorder. */
export type ConfigurationRecorderResult = {
  name: string;
  roleArn?: string;
  recordingGroup?: Record<string, unknown>;
  status?: string;
  extra?: Record<string, unknown>;
};

/** Compliance evaluation result for a Config rule or resource. */
export type ComplianceResult = {
  configRuleName: string;
  resourceType?: string;
  resourceId?: string;
  complianceType?: string;
  annotation?: string;
  orderingTimestamp?: string;
  extra?: Record<string, unknown>;
};

/** Remediation configuration for a Config rule. */
export type RemediationConfigResult = {
  configRuleName: string;
  targetType?: string;
  targetId?: string;
  parameters?: Record<string, unknown>;
  automatic?: boolean;
  retryAttemptSeconds?: number;
  maximumAutomaticAttempts?: number;
  extra?: Record<string, unknown>;
};

/** Result of associate_resource_types. */
export type AssociateResourceTypesResult = {
  configurationRecorder?: Record<string, unknown>;
};

/** Result of batch_get_aggregate_resource_config. */
export type BatchGetAggregateResourceConfigResult = {
  baseConfigurationItems?: Record<string, unknown>[];
  unprocessedResourceIdentifiers?: Record<string, unknown>[];
};

/** Result of batch_get_resource_config. */
export type BatchGetResourceConfigResult = {
  baseConfigurationItems?: Record<string, unknown>[];
  unprocessedResourceKeys?: Record<string, unknown>[];
};

/** Result of delete_remediation_exceptions. */
export type DeleteRemediationExceptionsResult = {
  failedBatches?: Record<string, unknown>[];
};

/** Result of delete_service_linked_configuration_recorder. */
export type DeleteServiceLinkedConfigurationRecorderResult = {
  arn?: string;
  name?: string;
};

/** Result of describe_aggregate_compliance_by_config_rules. */
export type DescribeAggregateComplianceByConfigRulesResult = {
  aggregateComplianceByConfigRules?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of describe_aggregate_compliance_by_conformance_packs. */
export type DescribeAggregateComplianceByConformancePacksResult = {
  aggregateComplianceByConformancePacks?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of describe_aggregation_authorizations. */
export type DescribeAggregationAuthorizationsResult = {
  aggregationAuthorizations?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of describe_compliance_by_resource. */
export type DescribeComplianceByResourceResult = {
  complianceByResources?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of describe_config_rule_evaluation_status. */
export type DescribeConfigRuleEvaluationStatusResult = {
  configRulesEvaluationStatus?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of describe_configuration_aggregator_sources_status. */
export type DescribeConfigurationAggregatorSourcesStatusResult = {
  aggregatedSourceStatusList?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of describe_configuration_recorder_status. */
export type DescribeConfigurationRecorderStatusResult = {
  configurationRecordersStatus?: Record<string, unknown>[];
};

/** Result of describe_conformance_pack_compliance. */
export type DescribeConformancePackComplianceResult = {
  conformancePackName?: string;
  conformancePackRuleComplianceList?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of describe_conformance_pack_status. */
export type DescribeConformancePackStatusResult = {
  conformancePackStatusDetails?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of describe_conformance_packs. */
export type DescribeConformancePacksResult = {
  conformancePackDetails?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of describe_delivery_channel_status. */
export type DescribeDeliveryChannelStatusResult = {
  deliveryChannelsStatus?: Record<string, unknown>[];
};

/** Result of describe_delivery_channels. */
export type DescribeDeliveryChannelsResult = {
  deliveryChannels?: Record<string, unknown>[];
};

/** Result of describe_organization_config_rule_statuses. */
export type DescribeOrganizationConfigRuleStatusesResult = {
  organizationConfigRuleStatuses?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of describe_organization_config_rules. */
export type DescribeOrganizationConfigRulesResult = {
  organizationConfigRules?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of describe_organization_conformance_pack_statuses. */
export type DescribeOrganizationConformancePackStatusesResult = {
  organizationConformancePackStatuses?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of describe_organization_conformance_packs. */
export type DescribeOrganizationConformancePacksResult = {
  organizationConformancePacks?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of describe_pending_aggregation_requests. */
export type DescribePendingAggregationRequestsResult = {
  pendingAggregationRequests?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of describe_remediation_exceptions. */
export type DescribeRemediationExceptionsResult = {
  remediationExceptions?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of describe_remediation_execution_status. */
export type DescribeRemediationExecutionStatusResult = {
  remediationExecutionStatuses?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of describe_retention_configurations. */
export type DescribeRetentionConfigurationsResult = {
  retentionConfigurations?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of disassociate_resource_types. */
export type DisassociateResourceTypesResult = {
  configurationRecorder?: Record<string, unknown>;
};

/** Result of get_aggregate_compliance_details_by_config_rule. */
export type GetAggregateComplianceDetailsByConfigRuleResult = {
  aggregateEvaluationResults?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of get_aggregate_config_rule_compliance_summary. */
export type GetAggregateConfigRuleComplianceSummaryResult = {
  groupByKey?: string;
  aggregateComplianceCounts?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of get_aggregate_conformance_pack_compliance_summary. */
export type GetAggregateConformancePackComplianceSummaryResult = {
  aggregateConformancePackComplianceSummaries?: Record<string, unknown>[];
  groupByKey?: string;
  nextToken?: string;
};

/** Result of get_aggregate_discovered_resource_counts. */
export type GetAggregateDiscoveredResourceCountsResult = {
  totalDiscoveredResources?: number;
  groupByKey?: string;
  groupedResourceCounts?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of get_aggregate_resource_config. */
export type GetAggregateResourceConfigResult = {
  configurationItem?: Record<string, unknown>;
};

/** Result of get_compliance_details_by_resource. */
export type GetComplianceDetailsByResourceResult = {
  evaluationResults?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of get_compliance_summary_by_config_rule. */
export type GetComplianceSummaryByConfigRuleResult = {
  complianceSummary?: Record<string, unknown>;
};

/** Result of get_compliance_summary_by_resource_type. */
export type GetComplianceSummaryByResourceTypeResult = {
  complianceSummariesByResourceType?: Record<string, unknown>[];
};

/** Result of get_conformance_pack_compliance_details. */
export type GetConformancePackComplianceDetailsResult = {
  conformancePackName?: string;
  conformancePackRuleEvaluationResults?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of get_conformance_pack_compliance_summary. */
export type GetConformancePackComplianceSummaryResult = {
  conformancePackComplianceSummaryList?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of get_custom_rule_policy. */
export type GetCustomRulePolicyResult = {
  policyText?: string;
};

/** Result of get_discovered_resource_counts. */
export type GetDiscoveredResourceCountsResult = {
  totalDiscoveredResources?: number;
  resourceCounts?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of get_organization_config_rule_detailed_status. */
export type GetOrganizationConfigRuleDetailedStatusResult = {
  organizationConfigRuleDetailedStatus?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of get_organization_conformance_pack_detailed_status. */
export type GetOrganizationConformancePackDetailedStatusResult = {
  organizationConformancePackDetailedStatuses?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of get_organization_custom_rule_policy. */
export type GetOrganizationCustomRulePolicyResult = {
  policyText?: string;
};

/** Result of get_resource_evaluation_summary. */
export type GetResourceEvaluationSummaryResult = {
  resourceEvaluationId?: string;
  evaluationMode?: string;
  evaluationStatus?: Record<string, unknown>;
  evaluationStartTimestamp?: string;
  compliance?: string;
  evaluationContext?: Record<string, unknown>;
  resourceDetails?: Record<string, unknown>;
};

/** Result of get_stored_query. */
export type GetStoredQueryResult = {
  storedQuery?: Record<string, unknown>;
};

/** Result of list_aggregate_discovered_resources. */
export type ListAggregateDiscoveredResourcesResult = {
  resourceIdentifiers?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_configuration_recorders. */
export type ListConfigurationRecordersResult = {
  configurationRecorderSummaries?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_conformance_pack_compliance_scores. */
export type ListConformancePackComplianceScoresResult = {
  nextToken?: string;
  conformancePackComplianceScores?: Record<string, unknown>[];
};

/** Result of list_resource_evaluations. */
export type ListResourceEvaluationsResult = {
  resourceEvaluations?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_stored_queries. */
export type ListStoredQueriesResult = {
  storedQueryMetadata?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_tags_for_resource. */
export type ListTagsForResourceResult = {
  tags?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of put_configuration_aggregator. */
export type PutConfigurationAggregatorResult = {
  configurationAggregator?: Record<string, unknown>;
};

/** Result of put_conformance_pack. */
export type PutConformancePackResult = {
  conformancePackArn?: string;
};

/** Result of put_evaluations. */
export type PutEvaluationsResult = {
  failedEvaluations?: Record<string, unknown>[];
};

/** Result of put_organization_config_rule. */
export type PutOrganizationConfigRuleResult = {
  organizationConfigRuleArn?: string;
};

/** Result of put_organization_conformance_pack. */
export type PutOrganizationConformancePackResult = {
  organizationConformancePackArn?: string;
};

/** Result of put_remediation_exceptions. */
export type PutRemediationExceptionsResult = {
  failedBatches?: Record<string, unknown>[];
};

/** Result of put_retention_configuration. */
export type PutRetentionConfigurationResult = {
  retentionConfiguration?: Record<string, unknown>;
};

/** Result of put_service_linked_configuration_recorder. */
export type PutServiceLinkedConfigurationRecorderResult = {
  arn?: string;
  name?: string;
};

/** Result of put_stored_query. */
export type PutStoredQueryResult = {
  queryArn?: string;
};

/** Result of select_aggregate_resource_config. */
export type SelectAggregateResourceConfigResult = {
  results?: string[];
  queryInfo?: Record<string, unknown>;
  nextToken?: string;
};

/** Result of select_resource_config. */
export type SelectResourceConfigResult = {
  results?: string[];
  queryInfo?: Record<string, unknown>;
  nextToken?: string;
};

/** Result of start_resource_evaluation. */
export type StartResourceEvaluationResult = {
  resourceEvaluationId?: string;
};

/** Create or update an AWS Config rule. */
export async function putConfigRule(configRuleName: string): Promise<void> {
  try {
    // TODO: implement put_config_rule
    throw new Error("put_config_rule not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_config_rule failed");
  }
}

/** Describe one or more AWS Config rules. */
export async function describeConfigRules(): Promise<ConfigRuleResult[]> {
  try {
    // TODO: implement describe_config_rules
    throw new Error("describe_config_rules not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_config_rules failed");
  }
}

/** Delete an AWS Config rule. */
export async function deleteConfigRule(configRuleName: string): Promise<void> {
  try {
    // TODO: implement delete_config_rule
    throw new Error("delete_config_rule not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_config_rule failed");
  }
}

/** Start evaluation for one or more AWS Config rules. */
export async function startConfigRulesEvaluation(configRuleNames: string[]): Promise<void> {
  try {
    // TODO: implement start_config_rules_evaluation
    throw new Error("start_config_rules_evaluation not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_config_rules_evaluation failed");
  }
}

/** Describe compliance status by Config rule. */
export async function describeComplianceByConfigRule(): Promise<ComplianceResult[]> {
  try {
    // TODO: implement describe_compliance_by_config_rule
    throw new Error("describe_compliance_by_config_rule not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_compliance_by_config_rule failed");
  }
}

/** Get detailed compliance results for a specific Config rule. */
export async function getComplianceDetailsByConfigRule(configRuleName: string): Promise<ComplianceResult[]> {
  try {
    // TODO: implement get_compliance_details_by_config_rule
    throw new Error("get_compliance_details_by_config_rule not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_compliance_details_by_config_rule failed");
  }
}

/** Describe AWS Config configuration recorders. */
export async function describeConfigurationRecorders(): Promise<ConfigurationRecorderResult[]> {
  try {
    // TODO: implement describe_configuration_recorders
    throw new Error("describe_configuration_recorders not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_configuration_recorders failed");
  }
}

/** Create or update a configuration recorder. */
export async function putConfigurationRecorder(name: string): Promise<void> {
  try {
    // TODO: implement put_configuration_recorder
    throw new Error("put_configuration_recorder not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_configuration_recorder failed");
  }
}

/** Start recording configurations for an AWS Config recorder. */
export async function startConfigurationRecorder(name: string): Promise<void> {
  try {
    // TODO: implement start_configuration_recorder
    throw new Error("start_configuration_recorder not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_configuration_recorder failed");
  }
}

/** Stop recording configurations for an AWS Config recorder. */
export async function stopConfigurationRecorder(name: string): Promise<void> {
  try {
    // TODO: implement stop_configuration_recorder
    throw new Error("stop_configuration_recorder not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "stop_configuration_recorder failed");
  }
}

/** Trigger delivery of a configuration snapshot. */
export async function deliverConfigSnapshot(deliveryChannelName: string): Promise<string> {
  try {
    // TODO: implement deliver_config_snapshot
    throw new Error("deliver_config_snapshot not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "deliver_config_snapshot failed");
  }
}

/** Create or update remediation configurations. */
export async function putRemediationConfigurations(): Promise<Record<string, unknown>[]> {
  try {
    // TODO: implement put_remediation_configurations
    throw new Error("put_remediation_configurations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_remediation_configurations failed");
  }
}

/** Describe remediation configurations for Config rules. */
export async function describeRemediationConfigurations(configRuleNames: string[]): Promise<RemediationConfigResult[]> {
  try {
    // TODO: implement describe_remediation_configurations
    throw new Error("describe_remediation_configurations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_remediation_configurations failed");
  }
}

/** Start remediation execution for specific resources. */
export async function startRemediationExecution(configRuleName: string): Promise<Record<string, unknown>> {
  try {
    // TODO: implement start_remediation_execution
    throw new Error("start_remediation_execution not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_remediation_execution failed");
  }
}

/** List resources discovered by AWS Config. */
export async function listDiscoveredResources(resourceType: string): Promise<Record<string, unknown>[]> {
  try {
    // TODO: implement list_discovered_resources
    throw new Error("list_discovered_resources not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_discovered_resources failed");
  }
}

/** Get configuration history for a specific resource. */
export async function getResourceConfigHistory(resourceType: string, resourceId: string): Promise<Record<string, unknown>[]> {
  try {
    // TODO: implement get_resource_config_history
    throw new Error("get_resource_config_history not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_resource_config_history failed");
  }
}

/** Describe AWS Config configuration aggregators. */
export async function describeConfigurationAggregators(): Promise<Record<string, unknown>[]> {
  try {
    // TODO: implement describe_configuration_aggregators
    throw new Error("describe_configuration_aggregators not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_configuration_aggregators failed");
  }
}

/** Authorize an account and region for Config aggregation. */
export async function putAggregationAuthorization(authorizedAccountId: string, authorizedRegion: string): Promise<Record<string, unknown>> {
  try {
    // TODO: implement put_aggregation_authorization
    throw new Error("put_aggregation_authorization not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_aggregation_authorization failed");
  }
}

/** Associate resource types. */
export async function associateResourceTypes(configurationRecorderArn: string, resourceTypes: string[], regionName?: string): Promise<AssociateResourceTypesResult> {
  try {
    // TODO: implement associate_resource_types
    throw new Error("associate_resource_types not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "associate_resource_types failed");
  }
}

/** Batch get aggregate resource config. */
export async function batchGetAggregateResourceConfig(configurationAggregatorName: string, resourceIdentifiers: Record<string, unknown>[], regionName?: string): Promise<BatchGetAggregateResourceConfigResult> {
  try {
    // TODO: implement batch_get_aggregate_resource_config
    throw new Error("batch_get_aggregate_resource_config not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_get_aggregate_resource_config failed");
  }
}

/** Batch get resource config. */
export async function batchGetResourceConfig(resourceKeys: Record<string, unknown>[], regionName?: string): Promise<BatchGetResourceConfigResult> {
  try {
    // TODO: implement batch_get_resource_config
    throw new Error("batch_get_resource_config not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_get_resource_config failed");
  }
}

/** Delete aggregation authorization. */
export async function deleteAggregationAuthorization(authorizedAccountId: string, authorizedAwsRegion: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_aggregation_authorization
    throw new Error("delete_aggregation_authorization not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_aggregation_authorization failed");
  }
}

/** Delete configuration aggregator. */
export async function deleteConfigurationAggregator(configurationAggregatorName: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_configuration_aggregator
    throw new Error("delete_configuration_aggregator not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_configuration_aggregator failed");
  }
}

/** Delete configuration recorder. */
export async function deleteConfigurationRecorder(configurationRecorderName: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_configuration_recorder
    throw new Error("delete_configuration_recorder not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_configuration_recorder failed");
  }
}

/** Delete conformance pack. */
export async function deleteConformancePack(conformancePackName: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_conformance_pack
    throw new Error("delete_conformance_pack not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_conformance_pack failed");
  }
}

/** Delete delivery channel. */
export async function deleteDeliveryChannel(deliveryChannelName: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_delivery_channel
    throw new Error("delete_delivery_channel not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_delivery_channel failed");
  }
}

/** Delete evaluation results. */
export async function deleteEvaluationResults(configRuleName: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_evaluation_results
    throw new Error("delete_evaluation_results not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_evaluation_results failed");
  }
}

/** Delete organization config rule. */
export async function deleteOrganizationConfigRule(organizationConfigRuleName: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_organization_config_rule
    throw new Error("delete_organization_config_rule not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_organization_config_rule failed");
  }
}

/** Delete organization conformance pack. */
export async function deleteOrganizationConformancePack(organizationConformancePackName: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_organization_conformance_pack
    throw new Error("delete_organization_conformance_pack not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_organization_conformance_pack failed");
  }
}

/** Delete pending aggregation request. */
export async function deletePendingAggregationRequest(requesterAccountId: string, requesterAwsRegion: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_pending_aggregation_request
    throw new Error("delete_pending_aggregation_request not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_pending_aggregation_request failed");
  }
}

/** Delete remediation configuration. */
export async function deleteRemediationConfiguration(configRuleName: string): Promise<void> {
  try {
    // TODO: implement delete_remediation_configuration
    throw new Error("delete_remediation_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_remediation_configuration failed");
  }
}

/** Delete remediation exceptions. */
export async function deleteRemediationExceptions(configRuleName: string, resourceKeys: Record<string, unknown>[], regionName?: string): Promise<DeleteRemediationExceptionsResult> {
  try {
    // TODO: implement delete_remediation_exceptions
    throw new Error("delete_remediation_exceptions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_remediation_exceptions failed");
  }
}

/** Delete resource config. */
export async function deleteResourceConfig(resourceType: string, resourceId: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_resource_config
    throw new Error("delete_resource_config not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_resource_config failed");
  }
}

/** Delete retention configuration. */
export async function deleteRetentionConfiguration(retentionConfigurationName: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_retention_configuration
    throw new Error("delete_retention_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_retention_configuration failed");
  }
}

/** Delete service linked configuration recorder. */
export async function deleteServiceLinkedConfigurationRecorder(servicePrincipal: string, regionName?: string): Promise<DeleteServiceLinkedConfigurationRecorderResult> {
  try {
    // TODO: implement delete_service_linked_configuration_recorder
    throw new Error("delete_service_linked_configuration_recorder not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_service_linked_configuration_recorder failed");
  }
}

/** Delete stored query. */
export async function deleteStoredQuery(queryName: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_stored_query
    throw new Error("delete_stored_query not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_stored_query failed");
  }
}

/** Describe aggregate compliance by config rules. */
export async function describeAggregateComplianceByConfigRules(configurationAggregatorName: string): Promise<DescribeAggregateComplianceByConfigRulesResult> {
  try {
    // TODO: implement describe_aggregate_compliance_by_config_rules
    throw new Error("describe_aggregate_compliance_by_config_rules not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_aggregate_compliance_by_config_rules failed");
  }
}

/** Describe aggregate compliance by conformance packs. */
export async function describeAggregateComplianceByConformancePacks(configurationAggregatorName: string): Promise<DescribeAggregateComplianceByConformancePacksResult> {
  try {
    // TODO: implement describe_aggregate_compliance_by_conformance_packs
    throw new Error("describe_aggregate_compliance_by_conformance_packs not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_aggregate_compliance_by_conformance_packs failed");
  }
}

/** Describe aggregation authorizations. */
export async function describeAggregationAuthorizations(): Promise<DescribeAggregationAuthorizationsResult> {
  try {
    // TODO: implement describe_aggregation_authorizations
    throw new Error("describe_aggregation_authorizations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_aggregation_authorizations failed");
  }
}

/** Describe compliance by resource. */
export async function describeComplianceByResource(): Promise<DescribeComplianceByResourceResult> {
  try {
    // TODO: implement describe_compliance_by_resource
    throw new Error("describe_compliance_by_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_compliance_by_resource failed");
  }
}

/** Describe config rule evaluation status. */
export async function describeConfigRuleEvaluationStatus(): Promise<DescribeConfigRuleEvaluationStatusResult> {
  try {
    // TODO: implement describe_config_rule_evaluation_status
    throw new Error("describe_config_rule_evaluation_status not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_config_rule_evaluation_status failed");
  }
}

/** Describe configuration aggregator sources status. */
export async function describeConfigurationAggregatorSourcesStatus(configurationAggregatorName: string): Promise<DescribeConfigurationAggregatorSourcesStatusResult> {
  try {
    // TODO: implement describe_configuration_aggregator_sources_status
    throw new Error("describe_configuration_aggregator_sources_status not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_configuration_aggregator_sources_status failed");
  }
}

/** Describe configuration recorder status. */
export async function describeConfigurationRecorderStatus(): Promise<DescribeConfigurationRecorderStatusResult> {
  try {
    // TODO: implement describe_configuration_recorder_status
    throw new Error("describe_configuration_recorder_status not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_configuration_recorder_status failed");
  }
}

/** Describe conformance pack compliance. */
export async function describeConformancePackCompliance(conformancePackName: string): Promise<DescribeConformancePackComplianceResult> {
  try {
    // TODO: implement describe_conformance_pack_compliance
    throw new Error("describe_conformance_pack_compliance not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_conformance_pack_compliance failed");
  }
}

/** Describe conformance pack status. */
export async function describeConformancePackStatus(): Promise<DescribeConformancePackStatusResult> {
  try {
    // TODO: implement describe_conformance_pack_status
    throw new Error("describe_conformance_pack_status not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_conformance_pack_status failed");
  }
}

/** Describe conformance packs. */
export async function describeConformancePacks(): Promise<DescribeConformancePacksResult> {
  try {
    // TODO: implement describe_conformance_packs
    throw new Error("describe_conformance_packs not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_conformance_packs failed");
  }
}

/** Describe delivery channel status. */
export async function describeDeliveryChannelStatus(): Promise<DescribeDeliveryChannelStatusResult> {
  try {
    // TODO: implement describe_delivery_channel_status
    throw new Error("describe_delivery_channel_status not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_delivery_channel_status failed");
  }
}

/** Describe delivery channels. */
export async function describeDeliveryChannels(): Promise<DescribeDeliveryChannelsResult> {
  try {
    // TODO: implement describe_delivery_channels
    throw new Error("describe_delivery_channels not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_delivery_channels failed");
  }
}

/** Describe organization config rule statuses. */
export async function describeOrganizationConfigRuleStatuses(): Promise<DescribeOrganizationConfigRuleStatusesResult> {
  try {
    // TODO: implement describe_organization_config_rule_statuses
    throw new Error("describe_organization_config_rule_statuses not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_organization_config_rule_statuses failed");
  }
}

/** Describe organization config rules. */
export async function describeOrganizationConfigRules(): Promise<DescribeOrganizationConfigRulesResult> {
  try {
    // TODO: implement describe_organization_config_rules
    throw new Error("describe_organization_config_rules not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_organization_config_rules failed");
  }
}

/** Describe organization conformance pack statuses. */
export async function describeOrganizationConformancePackStatuses(): Promise<DescribeOrganizationConformancePackStatusesResult> {
  try {
    // TODO: implement describe_organization_conformance_pack_statuses
    throw new Error("describe_organization_conformance_pack_statuses not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_organization_conformance_pack_statuses failed");
  }
}

/** Describe organization conformance packs. */
export async function describeOrganizationConformancePacks(): Promise<DescribeOrganizationConformancePacksResult> {
  try {
    // TODO: implement describe_organization_conformance_packs
    throw new Error("describe_organization_conformance_packs not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_organization_conformance_packs failed");
  }
}

/** Describe pending aggregation requests. */
export async function describePendingAggregationRequests(): Promise<DescribePendingAggregationRequestsResult> {
  try {
    // TODO: implement describe_pending_aggregation_requests
    throw new Error("describe_pending_aggregation_requests not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_pending_aggregation_requests failed");
  }
}

/** Describe remediation exceptions. */
export async function describeRemediationExceptions(configRuleName: string): Promise<DescribeRemediationExceptionsResult> {
  try {
    // TODO: implement describe_remediation_exceptions
    throw new Error("describe_remediation_exceptions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_remediation_exceptions failed");
  }
}

/** Describe remediation execution status. */
export async function describeRemediationExecutionStatus(configRuleName: string): Promise<DescribeRemediationExecutionStatusResult> {
  try {
    // TODO: implement describe_remediation_execution_status
    throw new Error("describe_remediation_execution_status not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_remediation_execution_status failed");
  }
}

/** Describe retention configurations. */
export async function describeRetentionConfigurations(): Promise<DescribeRetentionConfigurationsResult> {
  try {
    // TODO: implement describe_retention_configurations
    throw new Error("describe_retention_configurations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_retention_configurations failed");
  }
}

/** Disassociate resource types. */
export async function disassociateResourceTypes(configurationRecorderArn: string, resourceTypes: string[], regionName?: string): Promise<DisassociateResourceTypesResult> {
  try {
    // TODO: implement disassociate_resource_types
    throw new Error("disassociate_resource_types not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disassociate_resource_types failed");
  }
}

/** Get aggregate compliance details by config rule. */
export async function getAggregateComplianceDetailsByConfigRule(configurationAggregatorName: string, configRuleName: string, accountId: string, awsRegion: string): Promise<GetAggregateComplianceDetailsByConfigRuleResult> {
  try {
    // TODO: implement get_aggregate_compliance_details_by_config_rule
    throw new Error("get_aggregate_compliance_details_by_config_rule not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_aggregate_compliance_details_by_config_rule failed");
  }
}

/** Get aggregate config rule compliance summary. */
export async function getAggregateConfigRuleComplianceSummary(configurationAggregatorName: string): Promise<GetAggregateConfigRuleComplianceSummaryResult> {
  try {
    // TODO: implement get_aggregate_config_rule_compliance_summary
    throw new Error("get_aggregate_config_rule_compliance_summary not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_aggregate_config_rule_compliance_summary failed");
  }
}

/** Get aggregate conformance pack compliance summary. */
export async function getAggregateConformancePackComplianceSummary(configurationAggregatorName: string): Promise<GetAggregateConformancePackComplianceSummaryResult> {
  try {
    // TODO: implement get_aggregate_conformance_pack_compliance_summary
    throw new Error("get_aggregate_conformance_pack_compliance_summary not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_aggregate_conformance_pack_compliance_summary failed");
  }
}

/** Get aggregate discovered resource counts. */
export async function getAggregateDiscoveredResourceCounts(configurationAggregatorName: string): Promise<GetAggregateDiscoveredResourceCountsResult> {
  try {
    // TODO: implement get_aggregate_discovered_resource_counts
    throw new Error("get_aggregate_discovered_resource_counts not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_aggregate_discovered_resource_counts failed");
  }
}

/** Get aggregate resource config. */
export async function getAggregateResourceConfig(configurationAggregatorName: string, resourceIdentifier: Record<string, unknown>, regionName?: string): Promise<GetAggregateResourceConfigResult> {
  try {
    // TODO: implement get_aggregate_resource_config
    throw new Error("get_aggregate_resource_config not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_aggregate_resource_config failed");
  }
}

/** Get compliance details by resource. */
export async function getComplianceDetailsByResource(): Promise<GetComplianceDetailsByResourceResult> {
  try {
    // TODO: implement get_compliance_details_by_resource
    throw new Error("get_compliance_details_by_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_compliance_details_by_resource failed");
  }
}

/** Get compliance summary by config rule. */
export async function getComplianceSummaryByConfigRule(regionName?: string): Promise<GetComplianceSummaryByConfigRuleResult> {
  try {
    // TODO: implement get_compliance_summary_by_config_rule
    throw new Error("get_compliance_summary_by_config_rule not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_compliance_summary_by_config_rule failed");
  }
}

/** Get compliance summary by resource type. */
export async function getComplianceSummaryByResourceType(): Promise<GetComplianceSummaryByResourceTypeResult> {
  try {
    // TODO: implement get_compliance_summary_by_resource_type
    throw new Error("get_compliance_summary_by_resource_type not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_compliance_summary_by_resource_type failed");
  }
}

/** Get conformance pack compliance details. */
export async function getConformancePackComplianceDetails(conformancePackName: string): Promise<GetConformancePackComplianceDetailsResult> {
  try {
    // TODO: implement get_conformance_pack_compliance_details
    throw new Error("get_conformance_pack_compliance_details not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_conformance_pack_compliance_details failed");
  }
}

/** Get conformance pack compliance summary. */
export async function getConformancePackComplianceSummary(conformancePackNames: string[]): Promise<GetConformancePackComplianceSummaryResult> {
  try {
    // TODO: implement get_conformance_pack_compliance_summary
    throw new Error("get_conformance_pack_compliance_summary not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_conformance_pack_compliance_summary failed");
  }
}

/** Get custom rule policy. */
export async function getCustomRulePolicy(): Promise<GetCustomRulePolicyResult> {
  try {
    // TODO: implement get_custom_rule_policy
    throw new Error("get_custom_rule_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_custom_rule_policy failed");
  }
}

/** Get discovered resource counts. */
export async function getDiscoveredResourceCounts(): Promise<GetDiscoveredResourceCountsResult> {
  try {
    // TODO: implement get_discovered_resource_counts
    throw new Error("get_discovered_resource_counts not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_discovered_resource_counts failed");
  }
}

/** Get organization config rule detailed status. */
export async function getOrganizationConfigRuleDetailedStatus(organizationConfigRuleName: string): Promise<GetOrganizationConfigRuleDetailedStatusResult> {
  try {
    // TODO: implement get_organization_config_rule_detailed_status
    throw new Error("get_organization_config_rule_detailed_status not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_organization_config_rule_detailed_status failed");
  }
}

/** Get organization conformance pack detailed status. */
export async function getOrganizationConformancePackDetailedStatus(organizationConformancePackName: string): Promise<GetOrganizationConformancePackDetailedStatusResult> {
  try {
    // TODO: implement get_organization_conformance_pack_detailed_status
    throw new Error("get_organization_conformance_pack_detailed_status not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_organization_conformance_pack_detailed_status failed");
  }
}

/** Get organization custom rule policy. */
export async function getOrganizationCustomRulePolicy(organizationConfigRuleName: string, regionName?: string): Promise<GetOrganizationCustomRulePolicyResult> {
  try {
    // TODO: implement get_organization_custom_rule_policy
    throw new Error("get_organization_custom_rule_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_organization_custom_rule_policy failed");
  }
}

/** Get resource evaluation summary. */
export async function getResourceEvaluationSummary(resourceEvaluationId: string, regionName?: string): Promise<GetResourceEvaluationSummaryResult> {
  try {
    // TODO: implement get_resource_evaluation_summary
    throw new Error("get_resource_evaluation_summary not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_resource_evaluation_summary failed");
  }
}

/** Get stored query. */
export async function getStoredQuery(queryName: string, regionName?: string): Promise<GetStoredQueryResult> {
  try {
    // TODO: implement get_stored_query
    throw new Error("get_stored_query not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_stored_query failed");
  }
}

/** List aggregate discovered resources. */
export async function listAggregateDiscoveredResources(configurationAggregatorName: string, resourceType: string): Promise<ListAggregateDiscoveredResourcesResult> {
  try {
    // TODO: implement list_aggregate_discovered_resources
    throw new Error("list_aggregate_discovered_resources not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_aggregate_discovered_resources failed");
  }
}

/** List configuration recorders. */
export async function listConfigurationRecorders(): Promise<ListConfigurationRecordersResult> {
  try {
    // TODO: implement list_configuration_recorders
    throw new Error("list_configuration_recorders not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_configuration_recorders failed");
  }
}

/** List conformance pack compliance scores. */
export async function listConformancePackComplianceScores(): Promise<ListConformancePackComplianceScoresResult> {
  try {
    // TODO: implement list_conformance_pack_compliance_scores
    throw new Error("list_conformance_pack_compliance_scores not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_conformance_pack_compliance_scores failed");
  }
}

/** List resource evaluations. */
export async function listResourceEvaluations(): Promise<ListResourceEvaluationsResult> {
  try {
    // TODO: implement list_resource_evaluations
    throw new Error("list_resource_evaluations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_resource_evaluations failed");
  }
}

/** List stored queries. */
export async function listStoredQueries(): Promise<ListStoredQueriesResult> {
  try {
    // TODO: implement list_stored_queries
    throw new Error("list_stored_queries not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_stored_queries failed");
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

/** Put configuration aggregator. */
export async function putConfigurationAggregator(configurationAggregatorName: string): Promise<PutConfigurationAggregatorResult> {
  try {
    // TODO: implement put_configuration_aggregator
    throw new Error("put_configuration_aggregator not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_configuration_aggregator failed");
  }
}

/** Put conformance pack. */
export async function putConformancePack(conformancePackName: string): Promise<PutConformancePackResult> {
  try {
    // TODO: implement put_conformance_pack
    throw new Error("put_conformance_pack not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_conformance_pack failed");
  }
}

/** Put delivery channel. */
export async function putDeliveryChannel(deliveryChannel: Record<string, unknown>, regionName?: string): Promise<void> {
  try {
    // TODO: implement put_delivery_channel
    throw new Error("put_delivery_channel not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_delivery_channel failed");
  }
}

/** Put evaluations. */
export async function putEvaluations(resultToken: string): Promise<PutEvaluationsResult> {
  try {
    // TODO: implement put_evaluations
    throw new Error("put_evaluations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_evaluations failed");
  }
}

/** Put external evaluation. */
export async function putExternalEvaluation(configRuleName: string, externalEvaluation: Record<string, unknown>, regionName?: string): Promise<void> {
  try {
    // TODO: implement put_external_evaluation
    throw new Error("put_external_evaluation not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_external_evaluation failed");
  }
}

/** Put organization config rule. */
export async function putOrganizationConfigRule(organizationConfigRuleName: string): Promise<PutOrganizationConfigRuleResult> {
  try {
    // TODO: implement put_organization_config_rule
    throw new Error("put_organization_config_rule not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_organization_config_rule failed");
  }
}

/** Put organization conformance pack. */
export async function putOrganizationConformancePack(organizationConformancePackName: string): Promise<PutOrganizationConformancePackResult> {
  try {
    // TODO: implement put_organization_conformance_pack
    throw new Error("put_organization_conformance_pack not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_organization_conformance_pack failed");
  }
}

/** Put remediation exceptions. */
export async function putRemediationExceptions(configRuleName: string, resourceKeys: Record<string, unknown>[]): Promise<PutRemediationExceptionsResult> {
  try {
    // TODO: implement put_remediation_exceptions
    throw new Error("put_remediation_exceptions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_remediation_exceptions failed");
  }
}

/** Put resource config. */
export async function putResourceConfig(resourceType: string, schemaVersionId: string, resourceId: string, configuration: string): Promise<void> {
  try {
    // TODO: implement put_resource_config
    throw new Error("put_resource_config not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_resource_config failed");
  }
}

/** Put retention configuration. */
export async function putRetentionConfiguration(retentionPeriodInDays: number, regionName?: string): Promise<PutRetentionConfigurationResult> {
  try {
    // TODO: implement put_retention_configuration
    throw new Error("put_retention_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_retention_configuration failed");
  }
}

/** Put service linked configuration recorder. */
export async function putServiceLinkedConfigurationRecorder(servicePrincipal: string): Promise<PutServiceLinkedConfigurationRecorderResult> {
  try {
    // TODO: implement put_service_linked_configuration_recorder
    throw new Error("put_service_linked_configuration_recorder not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_service_linked_configuration_recorder failed");
  }
}

/** Put stored query. */
export async function putStoredQuery(storedQuery: Record<string, unknown>): Promise<PutStoredQueryResult> {
  try {
    // TODO: implement put_stored_query
    throw new Error("put_stored_query not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_stored_query failed");
  }
}

/** Select aggregate resource config. */
export async function selectAggregateResourceConfig(expression: string, configurationAggregatorName: string): Promise<SelectAggregateResourceConfigResult> {
  try {
    // TODO: implement select_aggregate_resource_config
    throw new Error("select_aggregate_resource_config not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "select_aggregate_resource_config failed");
  }
}

/** Select resource config. */
export async function selectResourceConfig(expression: string): Promise<SelectResourceConfigResult> {
  try {
    // TODO: implement select_resource_config
    throw new Error("select_resource_config not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "select_resource_config failed");
  }
}

/** Start resource evaluation. */
export async function startResourceEvaluation(resourceDetails: Record<string, unknown>, evaluationMode: string): Promise<StartResourceEvaluationResult> {
  try {
    // TODO: implement start_resource_evaluation
    throw new Error("start_resource_evaluation not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_resource_evaluation failed");
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
