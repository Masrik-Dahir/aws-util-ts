import { SecurityHubClient } from "@aws-sdk/client-securityhub";
import { getClient } from "./client";
import { wrapAwsError } from "./exceptions";

/** Metadata for an AWS Security Hub instance. */
export type HubResult = {
  hubArn?: string;
  subscribedAt?: string;
  autoEnableControls?: boolean;
  extra?: Record<string, unknown>;
};

/** A Security Hub finding. */
export type FindingResult = {
  findingId?: string;
  productArn?: string;
  generatorId?: string;
  awsAccountId?: string;
  title?: string;
  description?: string;
  severityLabel?: string;
  workflowStatus?: string;
  recordState?: string;
  extra?: Record<string, unknown>;
};

/** A Security Hub insight. */
export type InsightResult = {
  insightArn?: string;
  name?: string;
  filters?: Record<string, unknown>;
  groupByAttribute?: string;
  extra?: Record<string, unknown>;
};

/** A Security Hub standard or standards subscription. */
export type StandardResult = {
  standardsArn?: string;
  standardsSubscriptionArn?: string;
  standardsStatus?: string;
  name?: string;
  description?: string;
  extra?: Record<string, unknown>;
};

/** A Security Hub member account. */
export type MemberResult = {
  accountId?: string;
  email?: string;
  memberStatus?: string;
  invitedAt?: string;
  updatedAt?: string;
  administratorId?: string;
  extra?: Record<string, unknown>;
};

/** Result of batch_delete_automation_rules. */
export type BatchDeleteAutomationRulesResult = {
  processedAutomationRules?: string[];
  unprocessedAutomationRules?: Record<string, unknown>[];
};

/** Result of batch_get_automation_rules. */
export type BatchGetAutomationRulesResult = {
  rules?: Record<string, unknown>[];
  unprocessedAutomationRules?: Record<string, unknown>[];
};

/** Result of batch_get_configuration_policy_associations. */
export type BatchGetConfigurationPolicyAssociationsResult = {
  configurationPolicyAssociations?: Record<string, unknown>[];
  unprocessedConfigurationPolicyAssociations?: Record<string, unknown>[];
};

/** Result of batch_get_security_controls. */
export type BatchGetSecurityControlsResult = {
  securityControls?: Record<string, unknown>[];
  unprocessedIds?: Record<string, unknown>[];
};

/** Result of batch_get_standards_control_associations. */
export type BatchGetStandardsControlAssociationsResult = {
  standardsControlAssociationDetails?: Record<string, unknown>[];
  unprocessedAssociations?: Record<string, unknown>[];
};

/** Result of batch_import_findings. */
export type BatchImportFindingsResult = {
  failedCount?: number;
  successCount?: number;
  failedFindings?: Record<string, unknown>[];
};

/** Result of batch_update_automation_rules. */
export type BatchUpdateAutomationRulesResult = {
  processedAutomationRules?: string[];
  unprocessedAutomationRules?: Record<string, unknown>[];
};

/** Result of batch_update_findings. */
export type BatchUpdateFindingsResult = {
  processedFindings?: Record<string, unknown>[];
  unprocessedFindings?: Record<string, unknown>[];
};

/** Result of batch_update_findings_v2. */
export type BatchUpdateFindingsV2Result = {
  processedFindings?: Record<string, unknown>[];
  unprocessedFindings?: Record<string, unknown>[];
};

/** Result of batch_update_standards_control_associations. */
export type BatchUpdateStandardsControlAssociationsResult = {
  unprocessedAssociationUpdates?: Record<string, unknown>[];
};

/** Result of connector_registrations_v2. */
export type ConnectorRegistrationsV2Result = {
  connectorArn?: string;
  connectorId?: string;
};

/** Result of create_action_target. */
export type CreateActionTargetResult = {
  actionTargetArn?: string;
};

/** Result of create_aggregator_v2. */
export type CreateAggregatorV2Result = {
  aggregatorV2Arn?: string;
  aggregationRegion?: string;
  regionLinkingMode?: string;
  linkedRegions?: string[];
};

/** Result of create_automation_rule. */
export type CreateAutomationRuleResult = {
  ruleArn?: string;
};

/** Result of create_automation_rule_v2. */
export type CreateAutomationRuleV2Result = {
  ruleArn?: string;
  ruleId?: string;
};

/** Result of create_configuration_policy. */
export type CreateConfigurationPolicyResult = {
  arn?: string;
  id?: string;
  name?: string;
  description?: string;
  updatedAt?: string;
  createdAt?: string;
  configurationPolicy?: Record<string, unknown>;
};

/** Result of create_connector_v2. */
export type CreateConnectorV2Result = {
  connectorArn?: string;
  connectorId?: string;
  authUrl?: string;
};

/** Result of create_finding_aggregator. */
export type CreateFindingAggregatorResult = {
  findingAggregatorArn?: string;
  findingAggregationRegion?: string;
  regionLinkingMode?: string;
  regions?: string[];
};

/** Result of create_ticket_v2. */
export type CreateTicketV2Result = {
  ticketId?: string;
  ticketSrcUrl?: string;
};

/** Result of decline_invitations. */
export type DeclineInvitationsResult = {
  unprocessedAccounts?: Record<string, unknown>[];
};

/** Result of delete_action_target. */
export type DeleteActionTargetResult = {
  actionTargetArn?: string;
};

/** Result of delete_invitations. */
export type DeleteInvitationsResult = {
  unprocessedAccounts?: Record<string, unknown>[];
};

/** Result of describe_action_targets. */
export type DescribeActionTargetsResult = {
  actionTargets?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of describe_organization_configuration. */
export type DescribeOrganizationConfigurationResult = {
  autoEnable?: boolean;
  memberAccountLimitReached?: boolean;
  autoEnableStandards?: string;
  organizationConfiguration?: Record<string, unknown>;
};

/** Result of describe_products. */
export type DescribeProductsResult = {
  products?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of describe_products_v2. */
export type DescribeProductsV2Result = {
  productsV2?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of describe_security_hub_v2. */
export type DescribeSecurityHubV2Result = {
  hubV2Arn?: string;
  subscribedAt?: string;
};

/** Result of enable_organization_admin_account. */
export type EnableOrganizationAdminAccountResult = {
  adminAccountId?: string;
  feature?: string;
};

/** Result of enable_security_hub_v2. */
export type EnableSecurityHubV2Result = {
  hubV2Arn?: string;
};

/** Result of get_aggregator_v2. */
export type GetAggregatorV2Result = {
  aggregatorV2Arn?: string;
  aggregationRegion?: string;
  regionLinkingMode?: string;
  linkedRegions?: string[];
};

/** Result of get_automation_rule_v2. */
export type GetAutomationRuleV2Result = {
  ruleArn?: string;
  ruleId?: string;
  ruleOrder?: number;
  ruleName?: string;
  ruleStatus?: string;
  description?: string;
  criteria?: Record<string, unknown>;
  actions?: Record<string, unknown>[];
  createdAt?: string;
  updatedAt?: string;
};

/** Result of get_configuration_policy. */
export type GetConfigurationPolicyResult = {
  arn?: string;
  id?: string;
  name?: string;
  description?: string;
  updatedAt?: string;
  createdAt?: string;
  configurationPolicy?: Record<string, unknown>;
};

/** Result of get_configuration_policy_association. */
export type GetConfigurationPolicyAssociationResult = {
  configurationPolicyId?: string;
  targetId?: string;
  targetType?: string;
  associationType?: string;
  updatedAt?: string;
  associationStatus?: string;
  associationStatusMessage?: string;
};

/** Result of get_connector_v2. */
export type GetConnectorV2Result = {
  connectorArn?: string;
  connectorId?: string;
  name?: string;
  description?: string;
  kmsKeyArn?: string;
  createdAt?: string;
  lastUpdatedAt?: string;
  health?: Record<string, unknown>;
  providerDetail?: Record<string, unknown>;
};

/** Result of get_finding_aggregator. */
export type GetFindingAggregatorResult = {
  findingAggregatorArn?: string;
  findingAggregationRegion?: string;
  regionLinkingMode?: string;
  regions?: string[];
};

/** Result of get_finding_history. */
export type GetFindingHistoryResult = {
  records?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of get_finding_statistics_v2. */
export type GetFindingStatisticsV2Result = {
  groupByResults?: Record<string, unknown>[];
};

/** Result of get_findings_v2. */
export type GetFindingsV2Result = {
  findings?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of get_insights. */
export type GetInsightsResult = {
  insights?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of get_invitations_count. */
export type GetInvitationsCountResult = {
  invitationsCount?: number;
};

/** Result of get_master_account. */
export type GetMasterAccountResult = {
  master?: Record<string, unknown>;
};

/** Result of get_resources_statistics_v2. */
export type GetResourcesStatisticsV2Result = {
  groupByResults?: Record<string, unknown>[];
};

/** Result of get_resources_v2. */
export type GetResourcesV2Result = {
  resources?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of get_security_control_definition. */
export type GetSecurityControlDefinitionResult = {
  securityControlDefinition?: Record<string, unknown>;
};

/** Result of list_aggregators_v2. */
export type ListAggregatorsV2Result = {
  aggregatorsV2?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_automation_rules. */
export type ListAutomationRulesResult = {
  automationRulesMetadata?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_automation_rules_v2. */
export type ListAutomationRulesV2Result = {
  rules?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_configuration_policies. */
export type ListConfigurationPoliciesResult = {
  configurationPolicySummaries?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_configuration_policy_associations. */
export type ListConfigurationPolicyAssociationsResult = {
  configurationPolicyAssociationSummaries?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_connectors_v2. */
export type ListConnectorsV2Result = {
  nextToken?: string;
  connectors?: Record<string, unknown>[];
};

/** Result of list_finding_aggregators. */
export type ListFindingAggregatorsResult = {
  findingAggregators?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_invitations. */
export type ListInvitationsResult = {
  invitations?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_organization_admin_accounts. */
export type ListOrganizationAdminAccountsResult = {
  adminAccounts?: Record<string, unknown>[];
  nextToken?: string;
  feature?: string;
};

/** Result of list_security_control_definitions. */
export type ListSecurityControlDefinitionsResult = {
  securityControlDefinitions?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_standards_control_associations. */
export type ListStandardsControlAssociationsResult = {
  standardsControlAssociationSummaries?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_tags_for_resource. */
export type ListTagsForResourceResult = {
  tags?: Record<string, unknown>;
};

/** Result of start_configuration_policy_association. */
export type StartConfigurationPolicyAssociationResult = {
  configurationPolicyId?: string;
  targetId?: string;
  targetType?: string;
  associationType?: string;
  updatedAt?: string;
  associationStatus?: string;
  associationStatusMessage?: string;
};

/** Result of update_aggregator_v2. */
export type UpdateAggregatorV2Result = {
  aggregatorV2Arn?: string;
  aggregationRegion?: string;
  regionLinkingMode?: string;
  linkedRegions?: string[];
};

/** Result of update_configuration_policy. */
export type UpdateConfigurationPolicyResult = {
  arn?: string;
  id?: string;
  name?: string;
  description?: string;
  updatedAt?: string;
  createdAt?: string;
  configurationPolicy?: Record<string, unknown>;
};

/** Result of update_finding_aggregator. */
export type UpdateFindingAggregatorResult = {
  findingAggregatorArn?: string;
  findingAggregationRegion?: string;
  regionLinkingMode?: string;
  regions?: string[];
};

/** Enable AWS Security Hub in the account. */
export async function enableSecurityHub(): Promise<string> {
  try {
    // TODO: implement enable_security_hub
    throw new Error("enable_security_hub not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "enable_security_hub failed");
  }
}

/** Disable AWS Security Hub in the account. */
export async function disableSecurityHub(): Promise<void> {
  try {
    // TODO: implement disable_security_hub
    throw new Error("disable_security_hub not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disable_security_hub failed");
  }
}

/** Describe the Security Hub configuration. */
export async function describeHub(): Promise<HubResult> {
  try {
    // TODO: implement describe_hub
    throw new Error("describe_hub not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_hub failed");
  }
}

/** Retrieve Security Hub findings. */
export async function getFindings(): Promise<FindingResult[]> {
  try {
    // TODO: implement get_findings
    throw new Error("get_findings not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_findings failed");
  }
}

/** Update Security Hub findings. */
export async function updateFindings(findingIdentifiers: Record<string, unknown>[]): Promise<Record<string, unknown>> {
  try {
    // TODO: implement update_findings
    throw new Error("update_findings not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_findings failed");
  }
}

/** Get results for a Security Hub insight. */
export async function getInsightResults(insightArn: string): Promise<Record<string, unknown>> {
  try {
    // TODO: implement get_insight_results
    throw new Error("get_insight_results not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_insight_results failed");
  }
}

/** List Security Hub insights. */
export async function listInsights(): Promise<InsightResult[]> {
  try {
    // TODO: implement list_insights
    throw new Error("list_insights not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_insights failed");
  }
}

/** Create a Security Hub insight. */
export async function createInsight(name: string): Promise<string> {
  try {
    // TODO: implement create_insight
    throw new Error("create_insight not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_insight failed");
  }
}

/** Update an existing Security Hub insight. */
export async function updateInsight(insightArn: string): Promise<void> {
  try {
    // TODO: implement update_insight
    throw new Error("update_insight not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_insight failed");
  }
}

/** Delete a Security Hub insight. */
export async function deleteInsight(insightArn: string): Promise<void> {
  try {
    // TODO: implement delete_insight
    throw new Error("delete_insight not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_insight failed");
  }
}

/** Enable importing findings from an integrated product. */
export async function enableImportFindingsForProduct(productArn: string): Promise<string> {
  try {
    // TODO: implement enable_import_findings_for_product
    throw new Error("enable_import_findings_for_product not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "enable_import_findings_for_product failed");
  }
}

/** Disable importing findings from an integrated product. */
export async function disableImportFindingsForProduct(productSubscriptionArn: string): Promise<void> {
  try {
    // TODO: implement disable_import_findings_for_product
    throw new Error("disable_import_findings_for_product not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disable_import_findings_for_product failed");
  }
}

/** List product subscription ARNs enabled for import. */
export async function listEnabledProductsForImport(): Promise<string[]> {
  try {
    // TODO: implement list_enabled_products_for_import
    throw new Error("list_enabled_products_for_import not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_enabled_products_for_import failed");
  }
}

/** Get enabled standards subscriptions. */
export async function getEnabledStandards(): Promise<StandardResult[]> {
  try {
    // TODO: implement get_enabled_standards
    throw new Error("get_enabled_standards not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_enabled_standards failed");
  }
}

/** Enable one or more security standards. */
export async function batchEnableStandards(standardsSubscriptionRequests: Record<string, unknown>[]): Promise<StandardResult[]> {
  try {
    // TODO: implement batch_enable_standards
    throw new Error("batch_enable_standards not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_enable_standards failed");
  }
}

/** Disable one or more security standards. */
export async function batchDisableStandards(standardsSubscriptionArns: string[]): Promise<void> {
  try {
    // TODO: implement batch_disable_standards
    throw new Error("batch_disable_standards not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_disable_standards failed");
  }
}

/** Describe available security standards. */
export async function describeStandards(): Promise<StandardResult[]> {
  try {
    // TODO: implement describe_standards
    throw new Error("describe_standards not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_standards failed");
  }
}

/** Describe controls for an enabled standard. */
export async function describeStandardsControls(standardsSubscriptionArn: string): Promise<Record<string, unknown>[]> {
  try {
    // TODO: implement describe_standards_controls
    throw new Error("describe_standards_controls not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_standards_controls failed");
  }
}

/** Update the status of a standards control. */
export async function updateStandardsControl(standardsControlArn: string): Promise<void> {
  try {
    // TODO: implement update_standards_control
    throw new Error("update_standards_control not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_standards_control failed");
  }
}

/** Invite member accounts to Security Hub. */
export async function inviteMembers(accountIds: string[]): Promise<Record<string, unknown>[]> {
  try {
    // TODO: implement invite_members
    throw new Error("invite_members not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "invite_members failed");
  }
}

/** List Security Hub member accounts. */
export async function listMembers(): Promise<MemberResult[]> {
  try {
    // TODO: implement list_members
    throw new Error("list_members not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_members failed");
  }
}

/** Get details for specific member accounts. */
export async function getMembers(accountIds: string[]): Promise<MemberResult[]> {
  try {
    // TODO: implement get_members
    throw new Error("get_members not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_members failed");
  }
}

/** Create member account associations. */
export async function createMembers(accountDetails: Record<string, unknown>[]): Promise<Record<string, unknown>[]> {
  try {
    // TODO: implement create_members
    throw new Error("create_members not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_members failed");
  }
}

/** Delete member account associations. */
export async function deleteMembers(accountIds: string[]): Promise<Record<string, unknown>[]> {
  try {
    // TODO: implement delete_members
    throw new Error("delete_members not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_members failed");
  }
}

/** Get the administrator account for the current member. */
export async function getAdministratorAccount(): Promise<Record<string, unknown>> {
  try {
    // TODO: implement get_administrator_account
    throw new Error("get_administrator_account not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_administrator_account failed");
  }
}

/** Accept an invitation from an administrator account. */
export async function acceptAdministratorInvitation(administratorId: string, invitationId: string): Promise<void> {
  try {
    // TODO: implement accept_administrator_invitation
    throw new Error("accept_administrator_invitation not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "accept_administrator_invitation failed");
  }
}

/** Accept invitation. */
export async function acceptInvitation(masterId: string, invitationId: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement accept_invitation
    throw new Error("accept_invitation not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "accept_invitation failed");
  }
}

/** Batch delete automation rules. */
export async function batchDeleteAutomationRules(automationRulesArns: string[], regionName?: string): Promise<BatchDeleteAutomationRulesResult> {
  try {
    // TODO: implement batch_delete_automation_rules
    throw new Error("batch_delete_automation_rules not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_delete_automation_rules failed");
  }
}

/** Batch get automation rules. */
export async function batchGetAutomationRules(automationRulesArns: string[], regionName?: string): Promise<BatchGetAutomationRulesResult> {
  try {
    // TODO: implement batch_get_automation_rules
    throw new Error("batch_get_automation_rules not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_get_automation_rules failed");
  }
}

/** Batch get configuration policy associations. */
export async function batchGetConfigurationPolicyAssociations(configurationPolicyAssociationIdentifiers: Record<string, unknown>[], regionName?: string): Promise<BatchGetConfigurationPolicyAssociationsResult> {
  try {
    // TODO: implement batch_get_configuration_policy_associations
    throw new Error("batch_get_configuration_policy_associations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_get_configuration_policy_associations failed");
  }
}

/** Batch get security controls. */
export async function batchGetSecurityControls(securityControlIds: string[], regionName?: string): Promise<BatchGetSecurityControlsResult> {
  try {
    // TODO: implement batch_get_security_controls
    throw new Error("batch_get_security_controls not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_get_security_controls failed");
  }
}

/** Batch get standards control associations. */
export async function batchGetStandardsControlAssociations(standardsControlAssociationIds: Record<string, unknown>[], regionName?: string): Promise<BatchGetStandardsControlAssociationsResult> {
  try {
    // TODO: implement batch_get_standards_control_associations
    throw new Error("batch_get_standards_control_associations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_get_standards_control_associations failed");
  }
}

/** Batch import findings. */
export async function batchImportFindings(findings: Record<string, unknown>[], regionName?: string): Promise<BatchImportFindingsResult> {
  try {
    // TODO: implement batch_import_findings
    throw new Error("batch_import_findings not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_import_findings failed");
  }
}

/** Batch update automation rules. */
export async function batchUpdateAutomationRules(updateAutomationRulesRequestItems: Record<string, unknown>[], regionName?: string): Promise<BatchUpdateAutomationRulesResult> {
  try {
    // TODO: implement batch_update_automation_rules
    throw new Error("batch_update_automation_rules not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_update_automation_rules failed");
  }
}

/** Batch update findings. */
export async function batchUpdateFindings(findingIdentifiers: Record<string, unknown>[]): Promise<BatchUpdateFindingsResult> {
  try {
    // TODO: implement batch_update_findings
    throw new Error("batch_update_findings not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_update_findings failed");
  }
}

/** Batch update findings v2. */
export async function batchUpdateFindingsV2(): Promise<BatchUpdateFindingsV2Result> {
  try {
    // TODO: implement batch_update_findings_v2
    throw new Error("batch_update_findings_v2 not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_update_findings_v2 failed");
  }
}

/** Batch update standards control associations. */
export async function batchUpdateStandardsControlAssociations(standardsControlAssociationUpdates: Record<string, unknown>[], regionName?: string): Promise<BatchUpdateStandardsControlAssociationsResult> {
  try {
    // TODO: implement batch_update_standards_control_associations
    throw new Error("batch_update_standards_control_associations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_update_standards_control_associations failed");
  }
}

/** Connector registrations v2. */
export async function connectorRegistrationsV2(authCode: string, authState: string, regionName?: string): Promise<ConnectorRegistrationsV2Result> {
  try {
    // TODO: implement connector_registrations_v2
    throw new Error("connector_registrations_v2 not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "connector_registrations_v2 failed");
  }
}

/** Create action target. */
export async function createActionTarget(name: string, description: string, id: string, regionName?: string): Promise<CreateActionTargetResult> {
  try {
    // TODO: implement create_action_target
    throw new Error("create_action_target not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_action_target failed");
  }
}

/** Create aggregator v2. */
export async function createAggregatorV2(regionLinkingMode: string): Promise<CreateAggregatorV2Result> {
  try {
    // TODO: implement create_aggregator_v2
    throw new Error("create_aggregator_v2 not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_aggregator_v2 failed");
  }
}

/** Create automation rule. */
export async function createAutomationRule(ruleOrder: number, ruleName: string, description: string, criteria: Record<string, unknown>, actions: Record<string, unknown>[]): Promise<CreateAutomationRuleResult> {
  try {
    // TODO: implement create_automation_rule
    throw new Error("create_automation_rule not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_automation_rule failed");
  }
}

/** Create automation rule v2. */
export async function createAutomationRuleV2(ruleName: string, description: string, ruleOrder: number, criteria: Record<string, unknown>, actions: Record<string, unknown>[]): Promise<CreateAutomationRuleV2Result> {
  try {
    // TODO: implement create_automation_rule_v2
    throw new Error("create_automation_rule_v2 not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_automation_rule_v2 failed");
  }
}

/** Create configuration policy. */
export async function createConfigurationPolicy(name: string, configurationPolicy: Record<string, unknown>): Promise<CreateConfigurationPolicyResult> {
  try {
    // TODO: implement create_configuration_policy
    throw new Error("create_configuration_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_configuration_policy failed");
  }
}

/** Create connector v2. */
export async function createConnectorV2(name: string, provider: Record<string, unknown>): Promise<CreateConnectorV2Result> {
  try {
    // TODO: implement create_connector_v2
    throw new Error("create_connector_v2 not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_connector_v2 failed");
  }
}

/** Create finding aggregator. */
export async function createFindingAggregator(regionLinkingMode: string): Promise<CreateFindingAggregatorResult> {
  try {
    // TODO: implement create_finding_aggregator
    throw new Error("create_finding_aggregator not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_finding_aggregator failed");
  }
}

/** Create ticket v2. */
export async function createTicketV2(connectorId: string, findingMetadataUid: string): Promise<CreateTicketV2Result> {
  try {
    // TODO: implement create_ticket_v2
    throw new Error("create_ticket_v2 not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_ticket_v2 failed");
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

/** Delete action target. */
export async function deleteActionTarget(actionTargetArn: string, regionName?: string): Promise<DeleteActionTargetResult> {
  try {
    // TODO: implement delete_action_target
    throw new Error("delete_action_target not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_action_target failed");
  }
}

/** Delete aggregator v2. */
export async function deleteAggregatorV2(aggregatorV2Arn: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_aggregator_v2
    throw new Error("delete_aggregator_v2 not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_aggregator_v2 failed");
  }
}

/** Delete automation rule v2. */
export async function deleteAutomationRuleV2(identifier: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_automation_rule_v2
    throw new Error("delete_automation_rule_v2 not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_automation_rule_v2 failed");
  }
}

/** Delete configuration policy. */
export async function deleteConfigurationPolicy(identifier: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_configuration_policy
    throw new Error("delete_configuration_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_configuration_policy failed");
  }
}

/** Delete connector v2. */
export async function deleteConnectorV2(connectorId: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_connector_v2
    throw new Error("delete_connector_v2 not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_connector_v2 failed");
  }
}

/** Delete finding aggregator. */
export async function deleteFindingAggregator(findingAggregatorArn: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_finding_aggregator
    throw new Error("delete_finding_aggregator not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_finding_aggregator failed");
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

/** Describe action targets. */
export async function describeActionTargets(): Promise<DescribeActionTargetsResult> {
  try {
    // TODO: implement describe_action_targets
    throw new Error("describe_action_targets not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_action_targets failed");
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

/** Describe products. */
export async function describeProducts(): Promise<DescribeProductsResult> {
  try {
    // TODO: implement describe_products
    throw new Error("describe_products not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_products failed");
  }
}

/** Describe products v2. */
export async function describeProductsV2(): Promise<DescribeProductsV2Result> {
  try {
    // TODO: implement describe_products_v2
    throw new Error("describe_products_v2 not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_products_v2 failed");
  }
}

/** Describe security hub v2. */
export async function describeSecurityHubV2(regionName?: string): Promise<DescribeSecurityHubV2Result> {
  try {
    // TODO: implement describe_security_hub_v2
    throw new Error("describe_security_hub_v2 not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_security_hub_v2 failed");
  }
}

/** Disable organization admin account. */
export async function disableOrganizationAdminAccount(adminAccountId: string): Promise<void> {
  try {
    // TODO: implement disable_organization_admin_account
    throw new Error("disable_organization_admin_account not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disable_organization_admin_account failed");
  }
}

/** Disable security hub v2. */
export async function disableSecurityHubV2(regionName?: string): Promise<void> {
  try {
    // TODO: implement disable_security_hub_v2
    throw new Error("disable_security_hub_v2 not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disable_security_hub_v2 failed");
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

/** Disassociate members. */
export async function disassociateMembers(accountIds: string[], regionName?: string): Promise<void> {
  try {
    // TODO: implement disassociate_members
    throw new Error("disassociate_members not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disassociate_members failed");
  }
}

/** Enable organization admin account. */
export async function enableOrganizationAdminAccount(adminAccountId: string): Promise<EnableOrganizationAdminAccountResult> {
  try {
    // TODO: implement enable_organization_admin_account
    throw new Error("enable_organization_admin_account not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "enable_organization_admin_account failed");
  }
}

/** Enable security hub v2. */
export async function enableSecurityHubV2(): Promise<EnableSecurityHubV2Result> {
  try {
    // TODO: implement enable_security_hub_v2
    throw new Error("enable_security_hub_v2 not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "enable_security_hub_v2 failed");
  }
}

/** Get aggregator v2. */
export async function getAggregatorV2(aggregatorV2Arn: string, regionName?: string): Promise<GetAggregatorV2Result> {
  try {
    // TODO: implement get_aggregator_v2
    throw new Error("get_aggregator_v2 not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_aggregator_v2 failed");
  }
}

/** Get automation rule v2. */
export async function getAutomationRuleV2(identifier: string, regionName?: string): Promise<GetAutomationRuleV2Result> {
  try {
    // TODO: implement get_automation_rule_v2
    throw new Error("get_automation_rule_v2 not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_automation_rule_v2 failed");
  }
}

/** Get configuration policy. */
export async function getConfigurationPolicy(identifier: string, regionName?: string): Promise<GetConfigurationPolicyResult> {
  try {
    // TODO: implement get_configuration_policy
    throw new Error("get_configuration_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_configuration_policy failed");
  }
}

/** Get configuration policy association. */
export async function getConfigurationPolicyAssociation(target: Record<string, unknown>, regionName?: string): Promise<GetConfigurationPolicyAssociationResult> {
  try {
    // TODO: implement get_configuration_policy_association
    throw new Error("get_configuration_policy_association not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_configuration_policy_association failed");
  }
}

/** Get connector v2. */
export async function getConnectorV2(connectorId: string, regionName?: string): Promise<GetConnectorV2Result> {
  try {
    // TODO: implement get_connector_v2
    throw new Error("get_connector_v2 not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_connector_v2 failed");
  }
}

/** Get finding aggregator. */
export async function getFindingAggregator(findingAggregatorArn: string, regionName?: string): Promise<GetFindingAggregatorResult> {
  try {
    // TODO: implement get_finding_aggregator
    throw new Error("get_finding_aggregator not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_finding_aggregator failed");
  }
}

/** Get finding history. */
export async function getFindingHistory(findingIdentifier: Record<string, unknown>): Promise<GetFindingHistoryResult> {
  try {
    // TODO: implement get_finding_history
    throw new Error("get_finding_history not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_finding_history failed");
  }
}

/** Get finding statistics v2. */
export async function getFindingStatisticsV2(groupByRules: Record<string, unknown>[]): Promise<GetFindingStatisticsV2Result> {
  try {
    // TODO: implement get_finding_statistics_v2
    throw new Error("get_finding_statistics_v2 not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_finding_statistics_v2 failed");
  }
}

/** Get findings v2. */
export async function getFindingsV2(): Promise<GetFindingsV2Result> {
  try {
    // TODO: implement get_findings_v2
    throw new Error("get_findings_v2 not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_findings_v2 failed");
  }
}

/** Get insights. */
export async function getInsights(): Promise<GetInsightsResult> {
  try {
    // TODO: implement get_insights
    throw new Error("get_insights not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_insights failed");
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

/** Get resources statistics v2. */
export async function getResourcesStatisticsV2(groupByRules: Record<string, unknown>[]): Promise<GetResourcesStatisticsV2Result> {
  try {
    // TODO: implement get_resources_statistics_v2
    throw new Error("get_resources_statistics_v2 not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_resources_statistics_v2 failed");
  }
}

/** Get resources v2. */
export async function getResourcesV2(): Promise<GetResourcesV2Result> {
  try {
    // TODO: implement get_resources_v2
    throw new Error("get_resources_v2 not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_resources_v2 failed");
  }
}

/** Get security control definition. */
export async function getSecurityControlDefinition(securityControlId: string, regionName?: string): Promise<GetSecurityControlDefinitionResult> {
  try {
    // TODO: implement get_security_control_definition
    throw new Error("get_security_control_definition not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_security_control_definition failed");
  }
}

/** List aggregators v2. */
export async function listAggregatorsV2(): Promise<ListAggregatorsV2Result> {
  try {
    // TODO: implement list_aggregators_v2
    throw new Error("list_aggregators_v2 not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_aggregators_v2 failed");
  }
}

/** List automation rules. */
export async function listAutomationRules(): Promise<ListAutomationRulesResult> {
  try {
    // TODO: implement list_automation_rules
    throw new Error("list_automation_rules not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_automation_rules failed");
  }
}

/** List automation rules v2. */
export async function listAutomationRulesV2(): Promise<ListAutomationRulesV2Result> {
  try {
    // TODO: implement list_automation_rules_v2
    throw new Error("list_automation_rules_v2 not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_automation_rules_v2 failed");
  }
}

/** List configuration policies. */
export async function listConfigurationPolicies(): Promise<ListConfigurationPoliciesResult> {
  try {
    // TODO: implement list_configuration_policies
    throw new Error("list_configuration_policies not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_configuration_policies failed");
  }
}

/** List configuration policy associations. */
export async function listConfigurationPolicyAssociations(): Promise<ListConfigurationPolicyAssociationsResult> {
  try {
    // TODO: implement list_configuration_policy_associations
    throw new Error("list_configuration_policy_associations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_configuration_policy_associations failed");
  }
}

/** List connectors v2. */
export async function listConnectorsV2(): Promise<ListConnectorsV2Result> {
  try {
    // TODO: implement list_connectors_v2
    throw new Error("list_connectors_v2 not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_connectors_v2 failed");
  }
}

/** List finding aggregators. */
export async function listFindingAggregators(): Promise<ListFindingAggregatorsResult> {
  try {
    // TODO: implement list_finding_aggregators
    throw new Error("list_finding_aggregators not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_finding_aggregators failed");
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

/** List organization admin accounts. */
export async function listOrganizationAdminAccounts(): Promise<ListOrganizationAdminAccountsResult> {
  try {
    // TODO: implement list_organization_admin_accounts
    throw new Error("list_organization_admin_accounts not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_organization_admin_accounts failed");
  }
}

/** List security control definitions. */
export async function listSecurityControlDefinitions(): Promise<ListSecurityControlDefinitionsResult> {
  try {
    // TODO: implement list_security_control_definitions
    throw new Error("list_security_control_definitions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_security_control_definitions failed");
  }
}

/** List standards control associations. */
export async function listStandardsControlAssociations(securityControlId: string): Promise<ListStandardsControlAssociationsResult> {
  try {
    // TODO: implement list_standards_control_associations
    throw new Error("list_standards_control_associations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_standards_control_associations failed");
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

/** Start configuration policy association. */
export async function startConfigurationPolicyAssociation(configurationPolicyIdentifier: string, target: Record<string, unknown>, regionName?: string): Promise<StartConfigurationPolicyAssociationResult> {
  try {
    // TODO: implement start_configuration_policy_association
    throw new Error("start_configuration_policy_association not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_configuration_policy_association failed");
  }
}

/** Start configuration policy disassociation. */
export async function startConfigurationPolicyDisassociation(configurationPolicyIdentifier: string): Promise<void> {
  try {
    // TODO: implement start_configuration_policy_disassociation
    throw new Error("start_configuration_policy_disassociation not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_configuration_policy_disassociation failed");
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

/** Update action target. */
export async function updateActionTarget(actionTargetArn: string): Promise<void> {
  try {
    // TODO: implement update_action_target
    throw new Error("update_action_target not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_action_target failed");
  }
}

/** Update aggregator v2. */
export async function updateAggregatorV2(aggregatorV2Arn: string, regionLinkingMode: string): Promise<UpdateAggregatorV2Result> {
  try {
    // TODO: implement update_aggregator_v2
    throw new Error("update_aggregator_v2 not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_aggregator_v2 failed");
  }
}

/** Update automation rule v2. */
export async function updateAutomationRuleV2(identifier: string): Promise<void> {
  try {
    // TODO: implement update_automation_rule_v2
    throw new Error("update_automation_rule_v2 not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_automation_rule_v2 failed");
  }
}

/** Update configuration policy. */
export async function updateConfigurationPolicy(identifier: string): Promise<UpdateConfigurationPolicyResult> {
  try {
    // TODO: implement update_configuration_policy
    throw new Error("update_configuration_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_configuration_policy failed");
  }
}

/** Update connector v2. */
export async function updateConnectorV2(connectorId: string): Promise<void> {
  try {
    // TODO: implement update_connector_v2
    throw new Error("update_connector_v2 not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_connector_v2 failed");
  }
}

/** Update finding aggregator. */
export async function updateFindingAggregator(findingAggregatorArn: string, regionLinkingMode: string): Promise<UpdateFindingAggregatorResult> {
  try {
    // TODO: implement update_finding_aggregator
    throw new Error("update_finding_aggregator not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_finding_aggregator failed");
  }
}

/** Update organization configuration. */
export async function updateOrganizationConfiguration(autoEnable: boolean): Promise<void> {
  try {
    // TODO: implement update_organization_configuration
    throw new Error("update_organization_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_organization_configuration failed");
  }
}

/** Update security control. */
export async function updateSecurityControl(securityControlId: string, parameters: Record<string, unknown>): Promise<void> {
  try {
    // TODO: implement update_security_control
    throw new Error("update_security_control not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_security_control failed");
  }
}

/** Update security hub configuration. */
export async function updateSecurityHubConfiguration(): Promise<void> {
  try {
    // TODO: implement update_security_hub_configuration
    throw new Error("update_security_hub_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_security_hub_configuration failed");
  }
}
