import { ServiceQuotasClient } from "@aws-sdk/client-service-quotas";
import { getClient } from "./client";
import { wrapAwsError } from "./exceptions";

/** Metadata for an AWS service in Service Quotas. */
export type ServiceResult = {
  serviceCode: string;
  serviceName: string;
  extra?: Record<string, unknown>;
};

/** Metadata for a service quota. */
export type QuotaResult = {
  serviceCode: string;
  serviceName?: string;
  quotaCode: string;
  quotaName?: string;
  value?: number;
  unit?: string;
  adjustable?: boolean;
  globalQuota?: boolean;
  extra?: Record<string, unknown>;
};

/** Metadata for a service quota change request. */
export type QuotaChangeResult = {
  id: string;
  serviceCode?: string;
  quotaCode?: string;
  status?: string;
  desiredValue?: number;
  caseId?: string;
  created?: string;
  lastUpdated?: string;
  extra?: Record<string, unknown>;
};

/** Result of get_association_for_service_quota_template. */
export type GetAssociationForServiceQuotaTemplateResult = {
  serviceQuotaTemplateAssociationStatus?: string;
};

/** Result of get_auto_management_configuration. */
export type GetAutoManagementConfigurationResult = {
  optInLevel?: string;
  optInType?: string;
  notificationArn?: string;
  optInStatus?: string;
  exclusionList?: Record<string, unknown>;
};

/** Result of get_service_quota_increase_request_from_template. */
export type GetServiceQuotaIncreaseRequestFromTemplateResult = {
  serviceQuotaIncreaseRequestInTemplate?: Record<string, unknown>;
};

/** Result of list_aws_default_service_quotas. */
export type ListAwsDefaultServiceQuotasResult = {
  nextToken?: string;
  quotas?: Record<string, unknown>[];
};

/** Result of list_requested_service_quota_change_history. */
export type ListRequestedServiceQuotaChangeHistoryResult = {
  nextToken?: string;
  requestedQuotas?: Record<string, unknown>[];
};

/** Result of list_requested_service_quota_change_history_by_quota. */
export type ListRequestedServiceQuotaChangeHistoryByQuotaResult = {
  nextToken?: string;
  requestedQuotas?: Record<string, unknown>[];
};

/** Result of list_service_quota_increase_requests_in_template. */
export type ListServiceQuotaIncreaseRequestsInTemplateResult = {
  serviceQuotaIncreaseRequestInTemplateList?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_tags_for_resource. */
export type ListTagsForResourceResult = {
  tags?: Record<string, unknown>[];
};

/** Result of put_service_quota_increase_request_into_template. */
export type PutServiceQuotaIncreaseRequestIntoTemplateResult = {
  serviceQuotaIncreaseRequestInTemplate?: Record<string, unknown>;
};

/** List AWS services available in Service Quotas. */
export async function listServices(): Promise<ServiceResult[]> {
  try {
    // TODO: implement list_services
    throw new Error("list_services not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_services failed");
  }
}

/** List quotas for a specific AWS service. */
export async function listServiceQuotas(serviceCode: string): Promise<QuotaResult[]> {
  try {
    // TODO: implement list_service_quotas
    throw new Error("list_service_quotas not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_service_quotas failed");
  }
}

/** Get a specific service quota. */
export async function getServiceQuota(serviceCode: string, quotaCode: string): Promise<QuotaResult> {
  try {
    // TODO: implement get_service_quota
    throw new Error("get_service_quota not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_service_quota failed");
  }
}

/** Get the AWS default value for a service quota. */
export async function getAwsDefaultServiceQuota(serviceCode: string, quotaCode: string): Promise<QuotaResult> {
  try {
    // TODO: implement get_aws_default_service_quota
    throw new Error("get_aws_default_service_quota not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_aws_default_service_quota failed");
  }
}

/** Request an increase for a service quota. */
export async function requestServiceQuotaIncrease(serviceCode: string, quotaCode: string, desiredValue: number): Promise<QuotaChangeResult> {
  try {
    // TODO: implement request_service_quota_increase
    throw new Error("request_service_quota_increase not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "request_service_quota_increase failed");
  }
}

/** List service quota change requests. */
export async function listRequestedServiceQuotaChanges(): Promise<QuotaChangeResult[]> {
  try {
    // TODO: implement list_requested_service_quota_changes
    throw new Error("list_requested_service_quota_changes not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_requested_service_quota_changes failed");
  }
}

/** Get a specific service quota change request. */
export async function getRequestedServiceQuotaChange(requestId: string): Promise<QuotaChangeResult> {
  try {
    // TODO: implement get_requested_service_quota_change
    throw new Error("get_requested_service_quota_change not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_requested_service_quota_change failed");
  }
}

/** Associate service quota template. */
export async function associateServiceQuotaTemplate(regionName?: string): Promise<void> {
  try {
    // TODO: implement associate_service_quota_template
    throw new Error("associate_service_quota_template not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "associate_service_quota_template failed");
  }
}

/** Create support case. */
export async function createSupportCase(requestId: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement create_support_case
    throw new Error("create_support_case not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_support_case failed");
  }
}

/** Delete service quota increase request from template. */
export async function deleteServiceQuotaIncreaseRequestFromTemplate(serviceCode: string, quotaCode: string, awsRegion: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_service_quota_increase_request_from_template
    throw new Error("delete_service_quota_increase_request_from_template not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_service_quota_increase_request_from_template failed");
  }
}

/** Disassociate service quota template. */
export async function disassociateServiceQuotaTemplate(regionName?: string): Promise<void> {
  try {
    // TODO: implement disassociate_service_quota_template
    throw new Error("disassociate_service_quota_template not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disassociate_service_quota_template failed");
  }
}

/** Get association for service quota template. */
export async function getAssociationForServiceQuotaTemplate(regionName?: string): Promise<GetAssociationForServiceQuotaTemplateResult> {
  try {
    // TODO: implement get_association_for_service_quota_template
    throw new Error("get_association_for_service_quota_template not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_association_for_service_quota_template failed");
  }
}

/** Get auto management configuration. */
export async function getAutoManagementConfiguration(regionName?: string): Promise<GetAutoManagementConfigurationResult> {
  try {
    // TODO: implement get_auto_management_configuration
    throw new Error("get_auto_management_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_auto_management_configuration failed");
  }
}

/** Get service quota increase request from template. */
export async function getServiceQuotaIncreaseRequestFromTemplate(serviceCode: string, quotaCode: string, awsRegion: string, regionName?: string): Promise<GetServiceQuotaIncreaseRequestFromTemplateResult> {
  try {
    // TODO: implement get_service_quota_increase_request_from_template
    throw new Error("get_service_quota_increase_request_from_template not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_service_quota_increase_request_from_template failed");
  }
}

/** List aws default service quotas. */
export async function listAwsDefaultServiceQuotas(serviceCode: string): Promise<ListAwsDefaultServiceQuotasResult> {
  try {
    // TODO: implement list_aws_default_service_quotas
    throw new Error("list_aws_default_service_quotas not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_aws_default_service_quotas failed");
  }
}

/** List requested service quota change history. */
export async function listRequestedServiceQuotaChangeHistory(): Promise<ListRequestedServiceQuotaChangeHistoryResult> {
  try {
    // TODO: implement list_requested_service_quota_change_history
    throw new Error("list_requested_service_quota_change_history not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_requested_service_quota_change_history failed");
  }
}

/** List requested service quota change history by quota. */
export async function listRequestedServiceQuotaChangeHistoryByQuota(serviceCode: string, quotaCode: string): Promise<ListRequestedServiceQuotaChangeHistoryByQuotaResult> {
  try {
    // TODO: implement list_requested_service_quota_change_history_by_quota
    throw new Error("list_requested_service_quota_change_history_by_quota not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_requested_service_quota_change_history_by_quota failed");
  }
}

/** List service quota increase requests in template. */
export async function listServiceQuotaIncreaseRequestsInTemplate(): Promise<ListServiceQuotaIncreaseRequestsInTemplateResult> {
  try {
    // TODO: implement list_service_quota_increase_requests_in_template
    throw new Error("list_service_quota_increase_requests_in_template not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_service_quota_increase_requests_in_template failed");
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

/** Put service quota increase request into template. */
export async function putServiceQuotaIncreaseRequestIntoTemplate(quotaCode: string, serviceCode: string, awsRegion: string, desiredValue: number, regionName?: string): Promise<PutServiceQuotaIncreaseRequestIntoTemplateResult> {
  try {
    // TODO: implement put_service_quota_increase_request_into_template
    throw new Error("put_service_quota_increase_request_into_template not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_service_quota_increase_request_into_template failed");
  }
}

/** Start auto management. */
export async function startAutoManagement(optInLevel: string, optInType: string): Promise<void> {
  try {
    // TODO: implement start_auto_management
    throw new Error("start_auto_management not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_auto_management failed");
  }
}

/** Stop auto management. */
export async function stopAutoManagement(regionName?: string): Promise<void> {
  try {
    // TODO: implement stop_auto_management
    throw new Error("stop_auto_management not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "stop_auto_management failed");
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

/** Update auto management. */
export async function updateAutoManagement(): Promise<void> {
  try {
    // TODO: implement update_auto_management
    throw new Error("update_auto_management not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_auto_management failed");
  }
}
