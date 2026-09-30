import { SesV2Client } from "@aws-sdk/client-sesv2";
import { getClient } from "./client";
import { wrapAwsError } from "./exceptions";

/** Result of a SES v2 ``SendEmail`` call. */
export type SendEmailResult = {
  messageId: string;
};

/** An SES v2 email identity. */
export type EmailIdentityResult = {
  identityName: string;
  identityType?: string;
  verifiedForSending?: boolean;
  dkimSigningEnabled?: boolean;
  extra?: Record<string, unknown>;
};

/** An SES v2 configuration set. */
export type ConfigSetResult = {
  configurationSetName: string;
  sendingEnabled?: boolean;
  extra?: Record<string, unknown>;
};

/** An SES v2 email template. */
export type EmailTemplateResult = {
  templateName: string;
  subject?: string;
  text?: string;
  html?: string;
  extra?: Record<string, unknown>;
};

/** An SES v2 contact list. */
export type ContactListResult = {
  contactListName: string;
  description?: string;
  extra?: Record<string, unknown>;
};

/** An SES v2 contact within a contact list. */
export type ContactResult = {
  emailAddress: string;
  unsubscribeAll?: boolean;
  topicPreferences?: Record<string, unknown>[];
  extra?: Record<string, unknown>;
};

/** An SES v2 import job. */
export type ImportJobResult = {
  jobId: string;
  jobStatus?: string;
  extra?: Record<string, unknown>;
};

/** Message insight from SES v2 ``GetMessageInsights``. */
export type MessageInsightResult = {
  messageId: string;
  subject?: string;
  fromEmailAddress?: string;
  insights?: Record<string, unknown>[];
  extra?: Record<string, unknown>;
};

/** Result of batch_get_metric_data. */
export type BatchGetMetricDataResult = {
  results?: Record<string, unknown>[];
  errors?: Record<string, unknown>[];
};

/** Result of create_deliverability_test_report. */
export type CreateDeliverabilityTestReportResult = {
  reportId?: string;
  deliverabilityTestStatus?: string;
};

/** Result of create_multi_region_endpoint. */
export type CreateMultiRegionEndpointResult = {
  status?: string;
  endpointId?: string;
};

/** Result of create_tenant. */
export type CreateTenantResult = {
  tenantName?: string;
  tenantId?: string;
  tenantArn?: string;
  createdTimestamp?: string;
  tags?: Record<string, unknown>[];
  sendingStatus?: string;
};

/** Result of delete_multi_region_endpoint. */
export type DeleteMultiRegionEndpointResult = {
  status?: string;
};

/** Result of get_account. */
export type GetAccountResult = {
  dedicatedIpAutoWarmupEnabled?: boolean;
  enforcementStatus?: string;
  productionAccessEnabled?: boolean;
  sendQuota?: Record<string, unknown>;
  sendingEnabled?: boolean;
  suppressionAttributes?: Record<string, unknown>;
  details?: Record<string, unknown>;
  vdmAttributes?: Record<string, unknown>;
};

/** Result of get_blacklist_reports. */
export type GetBlacklistReportsResult = {
  blacklistReport?: Record<string, unknown>;
};

/** Result of get_configuration_set_event_destinations. */
export type GetConfigurationSetEventDestinationsResult = {
  eventDestinations?: Record<string, unknown>[];
};

/** Result of get_custom_verification_email_template. */
export type GetCustomVerificationEmailTemplateResult = {
  templateName?: string;
  fromEmailAddress?: string;
  templateSubject?: string;
  templateContent?: string;
  successRedirectionUrl?: string;
  failureRedirectionUrl?: string;
};

/** Result of get_dedicated_ip. */
export type GetDedicatedIpResult = {
  dedicatedIp?: Record<string, unknown>;
};

/** Result of get_dedicated_ip_pool. */
export type GetDedicatedIpPoolResult = {
  dedicatedIpPool?: Record<string, unknown>;
};

/** Result of get_dedicated_ips. */
export type GetDedicatedIpsResult = {
  dedicatedIps?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of get_deliverability_dashboard_options. */
export type GetDeliverabilityDashboardOptionsResult = {
  dashboardEnabled?: boolean;
  subscriptionExpiryDate?: string;
  accountStatus?: string;
  activeSubscribedDomains?: Record<string, unknown>[];
  pendingExpirationSubscribedDomains?: Record<string, unknown>[];
};

/** Result of get_deliverability_test_report. */
export type GetDeliverabilityTestReportResult = {
  deliverabilityTestReport?: Record<string, unknown>;
  overallPlacement?: Record<string, unknown>;
  ispPlacements?: Record<string, unknown>[];
  message?: string;
  tags?: Record<string, unknown>[];
};

/** Result of get_domain_deliverability_campaign. */
export type GetDomainDeliverabilityCampaignResult = {
  domainDeliverabilityCampaign?: Record<string, unknown>;
};

/** Result of get_domain_statistics_report. */
export type GetDomainStatisticsReportResult = {
  overallVolume?: Record<string, unknown>;
  dailyVolumes?: Record<string, unknown>[];
};

/** Result of get_email_identity_policies. */
export type GetEmailIdentityPoliciesResult = {
  policies?: Record<string, unknown>;
};

/** Result of get_export_job. */
export type GetExportJobResult = {
  jobId?: string;
  exportSourceType?: string;
  jobStatus?: string;
  exportDestination?: Record<string, unknown>;
  exportDataSource?: Record<string, unknown>;
  createdTimestamp?: string;
  completedTimestamp?: string;
  failureInfo?: Record<string, unknown>;
  statistics?: Record<string, unknown>;
};

/** Result of get_multi_region_endpoint. */
export type GetMultiRegionEndpointResult = {
  endpointName?: string;
  endpointId?: string;
  routes?: Record<string, unknown>[];
  status?: string;
  createdTimestamp?: string;
  lastUpdatedTimestamp?: string;
};

/** Result of get_reputation_entity. */
export type GetReputationEntityResult = {
  reputationEntity?: Record<string, unknown>;
};

/** Result of get_suppressed_destination. */
export type GetSuppressedDestinationResult = {
  suppressedDestination?: Record<string, unknown>;
};

/** Result of get_tenant. */
export type GetTenantResult = {
  tenant?: Record<string, unknown>;
};

/** Result of list_custom_verification_email_templates. */
export type ListCustomVerificationEmailTemplatesResult = {
  customVerificationEmailTemplates?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_dedicated_ip_pools. */
export type ListDedicatedIpPoolsResult = {
  dedicatedIpPools?: string[];
  nextToken?: string;
};

/** Result of list_deliverability_test_reports. */
export type ListDeliverabilityTestReportsResult = {
  deliverabilityTestReports?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_domain_deliverability_campaigns. */
export type ListDomainDeliverabilityCampaignsResult = {
  domainDeliverabilityCampaigns?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_export_jobs. */
export type ListExportJobsResult = {
  exportJobs?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_multi_region_endpoints. */
export type ListMultiRegionEndpointsResult = {
  multiRegionEndpoints?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_recommendations. */
export type ListRecommendationsResult = {
  recommendations?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_reputation_entities. */
export type ListReputationEntitiesResult = {
  reputationEntities?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_resource_tenants. */
export type ListResourceTenantsResult = {
  resourceTenants?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_suppressed_destinations. */
export type ListSuppressedDestinationsResult = {
  suppressedDestinationSummaries?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_tags_for_resource. */
export type ListTagsForResourceResult = {
  tags?: Record<string, unknown>[];
};

/** Result of list_tenant_resources. */
export type ListTenantResourcesResult = {
  tenantResources?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_tenants. */
export type ListTenantsResult = {
  tenants?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of put_email_identity_dkim_signing_attributes. */
export type PutEmailIdentityDkimSigningAttributesResult = {
  dkimStatus?: string;
  dkimTokens?: string[];
};

/** Result of run_render_email_template. */
export type RunRenderEmailTemplateResult = {
  renderedTemplate?: string;
};

/** Result of send_custom_verification_email. */
export type SendCustomVerificationEmailResult = {
  messageId?: string;
};

/** Send an email via SES v2. */
export async function sendEmail(fromEmailAddress: string, destination: Record<string, unknown>, content: Record<string, unknown>): Promise<SendEmailResult> {
  try {
    // TODO: implement send_email
    throw new Error("send_email not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "send_email failed");
  }
}

/** Send bulk email via SES v2. */
export async function sendBulkEmail(fromEmailAddress: string, defaultContent: Record<string, unknown>, bulkEntries: Record<string, unknown>[]): Promise<Record<string, unknown>[]> {
  try {
    // TODO: implement send_bulk_email
    throw new Error("send_bulk_email not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "send_bulk_email failed");
  }
}

/** Create an email identity (address or domain) in SES v2. */
export async function createEmailIdentity(identity: string): Promise<EmailIdentityResult> {
  try {
    // TODO: implement create_email_identity
    throw new Error("create_email_identity not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_email_identity failed");
  }
}

/** Retrieve details for an email identity. */
export async function getEmailIdentity(identity: string): Promise<EmailIdentityResult> {
  try {
    // TODO: implement get_email_identity
    throw new Error("get_email_identity not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_email_identity failed");
  }
}

/** List email identities in the SES v2 account. */
export async function listEmailIdentities(): Promise<EmailIdentityResult[]> {
  try {
    // TODO: implement list_email_identities
    throw new Error("list_email_identities not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_email_identities failed");
  }
}

/** Delete an email identity from SES v2. */
export async function deleteEmailIdentity(identity: string): Promise<void> {
  try {
    // TODO: implement delete_email_identity
    throw new Error("delete_email_identity not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_email_identity failed");
  }
}

/** Enable or disable DKIM signing for an email identity. */
export async function putEmailIdentityDkimAttributes(identity: string): Promise<void> {
  try {
    // TODO: implement put_email_identity_dkim_attributes
    throw new Error("put_email_identity_dkim_attributes not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_email_identity_dkim_attributes failed");
  }
}

/** Create a configuration set in SES v2. */
export async function createConfigurationSet(configurationSetName: string): Promise<ConfigSetResult> {
  try {
    // TODO: implement create_configuration_set
    throw new Error("create_configuration_set not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_configuration_set failed");
  }
}

/** Get details of a configuration set. */
export async function getConfigurationSet(configurationSetName: string): Promise<ConfigSetResult> {
  try {
    // TODO: implement get_configuration_set
    throw new Error("get_configuration_set not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_configuration_set failed");
  }
}

/** List configuration set names in the SES v2 account. */
export async function listConfigurationSets(): Promise<string[]> {
  try {
    // TODO: implement list_configuration_sets
    throw new Error("list_configuration_sets not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_configuration_sets failed");
  }
}

/** Delete a configuration set from SES v2. */
export async function deleteConfigurationSet(configurationSetName: string): Promise<void> {
  try {
    // TODO: implement delete_configuration_set
    throw new Error("delete_configuration_set not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_configuration_set failed");
  }
}

/** Create an email template in SES v2. */
export async function createEmailTemplate(templateName: string, subject: string): Promise<EmailTemplateResult> {
  try {
    // TODO: implement create_email_template
    throw new Error("create_email_template not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_email_template failed");
  }
}

/** Retrieve an email template by name. */
export async function getEmailTemplate(templateName: string): Promise<EmailTemplateResult> {
  try {
    // TODO: implement get_email_template
    throw new Error("get_email_template not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_email_template failed");
  }
}

/** List email template names in the SES v2 account. */
export async function listEmailTemplates(): Promise<string[]> {
  try {
    // TODO: implement list_email_templates
    throw new Error("list_email_templates not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_email_templates failed");
  }
}

/** Update an existing email template. */
export async function updateEmailTemplate(templateName: string, subject: string): Promise<EmailTemplateResult> {
  try {
    // TODO: implement update_email_template
    throw new Error("update_email_template not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_email_template failed");
  }
}

/** Delete an email template from SES v2. */
export async function deleteEmailTemplate(templateName: string): Promise<void> {
  try {
    // TODO: implement delete_email_template
    throw new Error("delete_email_template not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_email_template failed");
  }
}

/** Create a contact list in SES v2. */
export async function createContactList(contactListName: string): Promise<ContactListResult> {
  try {
    // TODO: implement create_contact_list
    throw new Error("create_contact_list not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_contact_list failed");
  }
}

/** Get details of a contact list. */
export async function getContactList(contactListName: string): Promise<ContactListResult> {
  try {
    // TODO: implement get_contact_list
    throw new Error("get_contact_list not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_contact_list failed");
  }
}

/** List contact lists in the SES v2 account. */
export async function listContactLists(): Promise<ContactListResult[]> {
  try {
    // TODO: implement list_contact_lists
    throw new Error("list_contact_lists not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_contact_lists failed");
  }
}

/** Add a contact to a contact list. */
export async function createContact(contactListName: string, emailAddress: string): Promise<ContactResult> {
  try {
    // TODO: implement create_contact
    throw new Error("create_contact not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_contact failed");
  }
}

/** Get details of a contact in a contact list. */
export async function getContact(contactListName: string, emailAddress: string): Promise<ContactResult> {
  try {
    // TODO: implement get_contact
    throw new Error("get_contact not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_contact failed");
  }
}

/** List contacts in a contact list. */
export async function listContacts(contactListName: string): Promise<ContactResult[]> {
  try {
    // TODO: implement list_contacts
    throw new Error("list_contacts not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_contacts failed");
  }
}

/** Update a contact's preferences. */
export async function updateContact(contactListName: string, emailAddress: string): Promise<void> {
  try {
    // TODO: implement update_contact
    throw new Error("update_contact not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_contact failed");
  }
}

/** Delete a contact from a contact list. */
export async function deleteContact(contactListName: string, emailAddress: string): Promise<void> {
  try {
    // TODO: implement delete_contact
    throw new Error("delete_contact not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_contact failed");
  }
}

/** Create an import job in SES v2. */
export async function createImportJob(importDestination: Record<string, unknown>, importDataSource: Record<string, unknown>): Promise<ImportJobResult> {
  try {
    // TODO: implement create_import_job
    throw new Error("create_import_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_import_job failed");
  }
}

/** Get details of an import job. */
export async function getImportJob(jobId: string): Promise<ImportJobResult> {
  try {
    // TODO: implement get_import_job
    throw new Error("get_import_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_import_job failed");
  }
}

/** List import jobs in the SES v2 account. */
export async function listImportJobs(): Promise<ImportJobResult[]> {
  try {
    // TODO: implement list_import_jobs
    throw new Error("list_import_jobs not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_import_jobs failed");
  }
}

/** Create an export job in SES v2. */
export async function createExportJob(exportDestination: Record<string, unknown>, exportDataSource: Record<string, unknown>): Promise<string> {
  try {
    // TODO: implement create_export_job
    throw new Error("create_export_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_export_job failed");
  }
}

/** Get delivery/engagement insights for a sent message. */
export async function getMessageInsights(messageId: string): Promise<MessageInsightResult> {
  try {
    // TODO: implement get_message_insights
    throw new Error("get_message_insights not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_message_insights failed");
  }
}

/** Batch get metric data. */
export async function batchGetMetricData(queries: Record<string, unknown>[], regionName?: string): Promise<BatchGetMetricDataResult> {
  try {
    // TODO: implement batch_get_metric_data
    throw new Error("batch_get_metric_data not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_get_metric_data failed");
  }
}

/** Cancel export job. */
export async function cancelExportJob(jobId: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement cancel_export_job
    throw new Error("cancel_export_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "cancel_export_job failed");
  }
}

/** Create configuration set event destination. */
export async function createConfigurationSetEventDestination(configurationSetName: string, eventDestinationName: string, eventDestination: Record<string, unknown>, regionName?: string): Promise<void> {
  try {
    // TODO: implement create_configuration_set_event_destination
    throw new Error("create_configuration_set_event_destination not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_configuration_set_event_destination failed");
  }
}

/** Create custom verification email template. */
export async function createCustomVerificationEmailTemplate(templateName: string, fromEmailAddress: string, templateSubject: string, templateContent: string, successRedirectionUrl: string, failureRedirectionUrl: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement create_custom_verification_email_template
    throw new Error("create_custom_verification_email_template not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_custom_verification_email_template failed");
  }
}

/** Create dedicated ip pool. */
export async function createDedicatedIpPool(poolName: string): Promise<void> {
  try {
    // TODO: implement create_dedicated_ip_pool
    throw new Error("create_dedicated_ip_pool not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_dedicated_ip_pool failed");
  }
}

/** Create deliverability test report. */
export async function createDeliverabilityTestReport(fromEmailAddress: string, content: Record<string, unknown>): Promise<CreateDeliverabilityTestReportResult> {
  try {
    // TODO: implement create_deliverability_test_report
    throw new Error("create_deliverability_test_report not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_deliverability_test_report failed");
  }
}

/** Create email identity policy. */
export async function createEmailIdentityPolicy(emailIdentity: string, policyName: string, policy: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement create_email_identity_policy
    throw new Error("create_email_identity_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_email_identity_policy failed");
  }
}

/** Create multi region endpoint. */
export async function createMultiRegionEndpoint(endpointName: string, details: Record<string, unknown>): Promise<CreateMultiRegionEndpointResult> {
  try {
    // TODO: implement create_multi_region_endpoint
    throw new Error("create_multi_region_endpoint not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_multi_region_endpoint failed");
  }
}

/** Create tenant. */
export async function createTenant(tenantName: string): Promise<CreateTenantResult> {
  try {
    // TODO: implement create_tenant
    throw new Error("create_tenant not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_tenant failed");
  }
}

/** Create tenant resource association. */
export async function createTenantResourceAssociation(tenantName: string, resourceArn: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement create_tenant_resource_association
    throw new Error("create_tenant_resource_association not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_tenant_resource_association failed");
  }
}

/** Delete configuration set event destination. */
export async function deleteConfigurationSetEventDestination(configurationSetName: string, eventDestinationName: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_configuration_set_event_destination
    throw new Error("delete_configuration_set_event_destination not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_configuration_set_event_destination failed");
  }
}

/** Delete contact list. */
export async function deleteContactList(contactListName: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_contact_list
    throw new Error("delete_contact_list not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_contact_list failed");
  }
}

/** Delete custom verification email template. */
export async function deleteCustomVerificationEmailTemplate(templateName: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_custom_verification_email_template
    throw new Error("delete_custom_verification_email_template not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_custom_verification_email_template failed");
  }
}

/** Delete dedicated ip pool. */
export async function deleteDedicatedIpPool(poolName: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_dedicated_ip_pool
    throw new Error("delete_dedicated_ip_pool not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_dedicated_ip_pool failed");
  }
}

/** Delete email identity policy. */
export async function deleteEmailIdentityPolicy(emailIdentity: string, policyName: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_email_identity_policy
    throw new Error("delete_email_identity_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_email_identity_policy failed");
  }
}

/** Delete multi region endpoint. */
export async function deleteMultiRegionEndpoint(endpointName: string, regionName?: string): Promise<DeleteMultiRegionEndpointResult> {
  try {
    // TODO: implement delete_multi_region_endpoint
    throw new Error("delete_multi_region_endpoint not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_multi_region_endpoint failed");
  }
}

/** Delete suppressed destination. */
export async function deleteSuppressedDestination(emailAddress: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_suppressed_destination
    throw new Error("delete_suppressed_destination not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_suppressed_destination failed");
  }
}

/** Delete tenant. */
export async function deleteTenant(tenantName: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_tenant
    throw new Error("delete_tenant not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_tenant failed");
  }
}

/** Delete tenant resource association. */
export async function deleteTenantResourceAssociation(tenantName: string, resourceArn: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_tenant_resource_association
    throw new Error("delete_tenant_resource_association not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_tenant_resource_association failed");
  }
}

/** Get account. */
export async function getAccount(regionName?: string): Promise<GetAccountResult> {
  try {
    // TODO: implement get_account
    throw new Error("get_account not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_account failed");
  }
}

/** Get blacklist reports. */
export async function getBlacklistReports(blacklistItemNames: string[], regionName?: string): Promise<GetBlacklistReportsResult> {
  try {
    // TODO: implement get_blacklist_reports
    throw new Error("get_blacklist_reports not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_blacklist_reports failed");
  }
}

/** Get configuration set event destinations. */
export async function getConfigurationSetEventDestinations(configurationSetName: string, regionName?: string): Promise<GetConfigurationSetEventDestinationsResult> {
  try {
    // TODO: implement get_configuration_set_event_destinations
    throw new Error("get_configuration_set_event_destinations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_configuration_set_event_destinations failed");
  }
}

/** Get custom verification email template. */
export async function getCustomVerificationEmailTemplate(templateName: string, regionName?: string): Promise<GetCustomVerificationEmailTemplateResult> {
  try {
    // TODO: implement get_custom_verification_email_template
    throw new Error("get_custom_verification_email_template not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_custom_verification_email_template failed");
  }
}

/** Get dedicated ip. */
export async function getDedicatedIp(ip: string, regionName?: string): Promise<GetDedicatedIpResult> {
  try {
    // TODO: implement get_dedicated_ip
    throw new Error("get_dedicated_ip not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_dedicated_ip failed");
  }
}

/** Get dedicated ip pool. */
export async function getDedicatedIpPool(poolName: string, regionName?: string): Promise<GetDedicatedIpPoolResult> {
  try {
    // TODO: implement get_dedicated_ip_pool
    throw new Error("get_dedicated_ip_pool not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_dedicated_ip_pool failed");
  }
}

/** Get dedicated ips. */
export async function getDedicatedIps(): Promise<GetDedicatedIpsResult> {
  try {
    // TODO: implement get_dedicated_ips
    throw new Error("get_dedicated_ips not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_dedicated_ips failed");
  }
}

/** Get deliverability dashboard options. */
export async function getDeliverabilityDashboardOptions(regionName?: string): Promise<GetDeliverabilityDashboardOptionsResult> {
  try {
    // TODO: implement get_deliverability_dashboard_options
    throw new Error("get_deliverability_dashboard_options not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_deliverability_dashboard_options failed");
  }
}

/** Get deliverability test report. */
export async function getDeliverabilityTestReport(reportId: string, regionName?: string): Promise<GetDeliverabilityTestReportResult> {
  try {
    // TODO: implement get_deliverability_test_report
    throw new Error("get_deliverability_test_report not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_deliverability_test_report failed");
  }
}

/** Get domain deliverability campaign. */
export async function getDomainDeliverabilityCampaign(campaignId: string, regionName?: string): Promise<GetDomainDeliverabilityCampaignResult> {
  try {
    // TODO: implement get_domain_deliverability_campaign
    throw new Error("get_domain_deliverability_campaign not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_domain_deliverability_campaign failed");
  }
}

/** Get domain statistics report. */
export async function getDomainStatisticsReport(domain: string, startDate: string, endDate: string, regionName?: string): Promise<GetDomainStatisticsReportResult> {
  try {
    // TODO: implement get_domain_statistics_report
    throw new Error("get_domain_statistics_report not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_domain_statistics_report failed");
  }
}

/** Get email identity policies. */
export async function getEmailIdentityPolicies(emailIdentity: string, regionName?: string): Promise<GetEmailIdentityPoliciesResult> {
  try {
    // TODO: implement get_email_identity_policies
    throw new Error("get_email_identity_policies not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_email_identity_policies failed");
  }
}

/** Get export job. */
export async function getExportJob(jobId: string, regionName?: string): Promise<GetExportJobResult> {
  try {
    // TODO: implement get_export_job
    throw new Error("get_export_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_export_job failed");
  }
}

/** Get multi region endpoint. */
export async function getMultiRegionEndpoint(endpointName: string, regionName?: string): Promise<GetMultiRegionEndpointResult> {
  try {
    // TODO: implement get_multi_region_endpoint
    throw new Error("get_multi_region_endpoint not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_multi_region_endpoint failed");
  }
}

/** Get reputation entity. */
export async function getReputationEntity(reputationEntityReference: string, reputationEntityType: string, regionName?: string): Promise<GetReputationEntityResult> {
  try {
    // TODO: implement get_reputation_entity
    throw new Error("get_reputation_entity not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_reputation_entity failed");
  }
}

/** Get suppressed destination. */
export async function getSuppressedDestination(emailAddress: string, regionName?: string): Promise<GetSuppressedDestinationResult> {
  try {
    // TODO: implement get_suppressed_destination
    throw new Error("get_suppressed_destination not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_suppressed_destination failed");
  }
}

/** Get tenant. */
export async function getTenant(tenantName: string, regionName?: string): Promise<GetTenantResult> {
  try {
    // TODO: implement get_tenant
    throw new Error("get_tenant not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_tenant failed");
  }
}

/** List custom verification email templates. */
export async function listCustomVerificationEmailTemplates(): Promise<ListCustomVerificationEmailTemplatesResult> {
  try {
    // TODO: implement list_custom_verification_email_templates
    throw new Error("list_custom_verification_email_templates not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_custom_verification_email_templates failed");
  }
}

/** List dedicated ip pools. */
export async function listDedicatedIpPools(): Promise<ListDedicatedIpPoolsResult> {
  try {
    // TODO: implement list_dedicated_ip_pools
    throw new Error("list_dedicated_ip_pools not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_dedicated_ip_pools failed");
  }
}

/** List deliverability test reports. */
export async function listDeliverabilityTestReports(): Promise<ListDeliverabilityTestReportsResult> {
  try {
    // TODO: implement list_deliverability_test_reports
    throw new Error("list_deliverability_test_reports not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_deliverability_test_reports failed");
  }
}

/** List domain deliverability campaigns. */
export async function listDomainDeliverabilityCampaigns(startDate: string, endDate: string, subscribedDomain: string): Promise<ListDomainDeliverabilityCampaignsResult> {
  try {
    // TODO: implement list_domain_deliverability_campaigns
    throw new Error("list_domain_deliverability_campaigns not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_domain_deliverability_campaigns failed");
  }
}

/** List export jobs. */
export async function listExportJobs(): Promise<ListExportJobsResult> {
  try {
    // TODO: implement list_export_jobs
    throw new Error("list_export_jobs not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_export_jobs failed");
  }
}

/** List multi region endpoints. */
export async function listMultiRegionEndpoints(): Promise<ListMultiRegionEndpointsResult> {
  try {
    // TODO: implement list_multi_region_endpoints
    throw new Error("list_multi_region_endpoints not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_multi_region_endpoints failed");
  }
}

/** List recommendations. */
export async function listRecommendations(): Promise<ListRecommendationsResult> {
  try {
    // TODO: implement list_recommendations
    throw new Error("list_recommendations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_recommendations failed");
  }
}

/** List reputation entities. */
export async function listReputationEntities(): Promise<ListReputationEntitiesResult> {
  try {
    // TODO: implement list_reputation_entities
    throw new Error("list_reputation_entities not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_reputation_entities failed");
  }
}

/** List resource tenants. */
export async function listResourceTenants(resourceArn: string): Promise<ListResourceTenantsResult> {
  try {
    // TODO: implement list_resource_tenants
    throw new Error("list_resource_tenants not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_resource_tenants failed");
  }
}

/** List suppressed destinations. */
export async function listSuppressedDestinations(): Promise<ListSuppressedDestinationsResult> {
  try {
    // TODO: implement list_suppressed_destinations
    throw new Error("list_suppressed_destinations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_suppressed_destinations failed");
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

/** List tenant resources. */
export async function listTenantResources(tenantName: string): Promise<ListTenantResourcesResult> {
  try {
    // TODO: implement list_tenant_resources
    throw new Error("list_tenant_resources not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_tenant_resources failed");
  }
}

/** List tenants. */
export async function listTenants(): Promise<ListTenantsResult> {
  try {
    // TODO: implement list_tenants
    throw new Error("list_tenants not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_tenants failed");
  }
}

/** Put account dedicated ip warmup attributes. */
export async function putAccountDedicatedIpWarmupAttributes(): Promise<void> {
  try {
    // TODO: implement put_account_dedicated_ip_warmup_attributes
    throw new Error("put_account_dedicated_ip_warmup_attributes not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_account_dedicated_ip_warmup_attributes failed");
  }
}

/** Put account details. */
export async function putAccountDetails(mailType: string, websiteUrl: string): Promise<void> {
  try {
    // TODO: implement put_account_details
    throw new Error("put_account_details not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_account_details failed");
  }
}

/** Put account sending attributes. */
export async function putAccountSendingAttributes(): Promise<void> {
  try {
    // TODO: implement put_account_sending_attributes
    throw new Error("put_account_sending_attributes not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_account_sending_attributes failed");
  }
}

/** Put account suppression attributes. */
export async function putAccountSuppressionAttributes(): Promise<void> {
  try {
    // TODO: implement put_account_suppression_attributes
    throw new Error("put_account_suppression_attributes not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_account_suppression_attributes failed");
  }
}

/** Put account vdm attributes. */
export async function putAccountVdmAttributes(vdmAttributes: Record<string, unknown>, regionName?: string): Promise<void> {
  try {
    // TODO: implement put_account_vdm_attributes
    throw new Error("put_account_vdm_attributes not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_account_vdm_attributes failed");
  }
}

/** Put configuration set archiving options. */
export async function putConfigurationSetArchivingOptions(configurationSetName: string): Promise<void> {
  try {
    // TODO: implement put_configuration_set_archiving_options
    throw new Error("put_configuration_set_archiving_options not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_configuration_set_archiving_options failed");
  }
}

/** Put configuration set delivery options. */
export async function putConfigurationSetDeliveryOptions(configurationSetName: string): Promise<void> {
  try {
    // TODO: implement put_configuration_set_delivery_options
    throw new Error("put_configuration_set_delivery_options not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_configuration_set_delivery_options failed");
  }
}

/** Put configuration set reputation options. */
export async function putConfigurationSetReputationOptions(configurationSetName: string): Promise<void> {
  try {
    // TODO: implement put_configuration_set_reputation_options
    throw new Error("put_configuration_set_reputation_options not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_configuration_set_reputation_options failed");
  }
}

/** Put configuration set sending options. */
export async function putConfigurationSetSendingOptions(configurationSetName: string): Promise<void> {
  try {
    // TODO: implement put_configuration_set_sending_options
    throw new Error("put_configuration_set_sending_options not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_configuration_set_sending_options failed");
  }
}

/** Put configuration set suppression options. */
export async function putConfigurationSetSuppressionOptions(configurationSetName: string): Promise<void> {
  try {
    // TODO: implement put_configuration_set_suppression_options
    throw new Error("put_configuration_set_suppression_options not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_configuration_set_suppression_options failed");
  }
}

/** Put configuration set tracking options. */
export async function putConfigurationSetTrackingOptions(configurationSetName: string): Promise<void> {
  try {
    // TODO: implement put_configuration_set_tracking_options
    throw new Error("put_configuration_set_tracking_options not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_configuration_set_tracking_options failed");
  }
}

/** Put configuration set vdm options. */
export async function putConfigurationSetVdmOptions(configurationSetName: string): Promise<void> {
  try {
    // TODO: implement put_configuration_set_vdm_options
    throw new Error("put_configuration_set_vdm_options not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_configuration_set_vdm_options failed");
  }
}

/** Put dedicated ip in pool. */
export async function putDedicatedIpInPool(ip: string, destinationPoolName: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement put_dedicated_ip_in_pool
    throw new Error("put_dedicated_ip_in_pool not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_dedicated_ip_in_pool failed");
  }
}

/** Put dedicated ip pool scaling attributes. */
export async function putDedicatedIpPoolScalingAttributes(poolName: string, scalingMode: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement put_dedicated_ip_pool_scaling_attributes
    throw new Error("put_dedicated_ip_pool_scaling_attributes not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_dedicated_ip_pool_scaling_attributes failed");
  }
}

/** Put dedicated ip warmup attributes. */
export async function putDedicatedIpWarmupAttributes(ip: string, warmupPercentage: number, regionName?: string): Promise<void> {
  try {
    // TODO: implement put_dedicated_ip_warmup_attributes
    throw new Error("put_dedicated_ip_warmup_attributes not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_dedicated_ip_warmup_attributes failed");
  }
}

/** Put deliverability dashboard option. */
export async function putDeliverabilityDashboardOption(dashboardEnabled: boolean): Promise<void> {
  try {
    // TODO: implement put_deliverability_dashboard_option
    throw new Error("put_deliverability_dashboard_option not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_deliverability_dashboard_option failed");
  }
}

/** Put email identity configuration set attributes. */
export async function putEmailIdentityConfigurationSetAttributes(emailIdentity: string): Promise<void> {
  try {
    // TODO: implement put_email_identity_configuration_set_attributes
    throw new Error("put_email_identity_configuration_set_attributes not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_email_identity_configuration_set_attributes failed");
  }
}

/** Put email identity dkim signing attributes. */
export async function putEmailIdentityDkimSigningAttributes(emailIdentity: string, signingAttributesOrigin: string): Promise<PutEmailIdentityDkimSigningAttributesResult> {
  try {
    // TODO: implement put_email_identity_dkim_signing_attributes
    throw new Error("put_email_identity_dkim_signing_attributes not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_email_identity_dkim_signing_attributes failed");
  }
}

/** Put email identity feedback attributes. */
export async function putEmailIdentityFeedbackAttributes(emailIdentity: string): Promise<void> {
  try {
    // TODO: implement put_email_identity_feedback_attributes
    throw new Error("put_email_identity_feedback_attributes not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_email_identity_feedback_attributes failed");
  }
}

/** Put email identity mail from attributes. */
export async function putEmailIdentityMailFromAttributes(emailIdentity: string): Promise<void> {
  try {
    // TODO: implement put_email_identity_mail_from_attributes
    throw new Error("put_email_identity_mail_from_attributes not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_email_identity_mail_from_attributes failed");
  }
}

/** Put suppressed destination. */
export async function putSuppressedDestination(emailAddress: string, reason: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement put_suppressed_destination
    throw new Error("put_suppressed_destination not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_suppressed_destination failed");
  }
}

/** Run render email template. */
export async function runRenderEmailTemplate(templateName: string, templateData: string, regionName?: string): Promise<RunRenderEmailTemplateResult> {
  try {
    // TODO: implement run_render_email_template
    throw new Error("run_render_email_template not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "run_render_email_template failed");
  }
}

/** Send custom verification email. */
export async function sendCustomVerificationEmail(emailAddress: string, templateName: string): Promise<SendCustomVerificationEmailResult> {
  try {
    // TODO: implement send_custom_verification_email
    throw new Error("send_custom_verification_email not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "send_custom_verification_email failed");
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

/** Update configuration set event destination. */
export async function updateConfigurationSetEventDestination(configurationSetName: string, eventDestinationName: string, eventDestination: Record<string, unknown>, regionName?: string): Promise<void> {
  try {
    // TODO: implement update_configuration_set_event_destination
    throw new Error("update_configuration_set_event_destination not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_configuration_set_event_destination failed");
  }
}

/** Update contact list. */
export async function updateContactList(contactListName: string): Promise<void> {
  try {
    // TODO: implement update_contact_list
    throw new Error("update_contact_list not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_contact_list failed");
  }
}

/** Update custom verification email template. */
export async function updateCustomVerificationEmailTemplate(templateName: string, fromEmailAddress: string, templateSubject: string, templateContent: string, successRedirectionUrl: string, failureRedirectionUrl: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement update_custom_verification_email_template
    throw new Error("update_custom_verification_email_template not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_custom_verification_email_template failed");
  }
}

/** Update email identity policy. */
export async function updateEmailIdentityPolicy(emailIdentity: string, policyName: string, policy: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement update_email_identity_policy
    throw new Error("update_email_identity_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_email_identity_policy failed");
  }
}

/** Update reputation entity customer managed status. */
export async function updateReputationEntityCustomerManagedStatus(reputationEntityType: string, reputationEntityReference: string, sendingStatus: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement update_reputation_entity_customer_managed_status
    throw new Error("update_reputation_entity_customer_managed_status not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_reputation_entity_customer_managed_status failed");
  }
}

/** Update reputation entity policy. */
export async function updateReputationEntityPolicy(reputationEntityType: string, reputationEntityReference: string, reputationEntityPolicy: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement update_reputation_entity_policy
    throw new Error("update_reputation_entity_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_reputation_entity_policy failed");
  }
}
