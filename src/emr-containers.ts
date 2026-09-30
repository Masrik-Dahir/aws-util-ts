import { EmrContainersClient } from "@aws-sdk/client-emr-containers";
import { getClient } from "./client";
import { wrapAwsError } from "./exceptions";

/** Metadata for an EMR Containers virtual cluster. */
export type VirtualClusterResult = {
  id: string;
  name: string;
  arn?: string;
  state?: string;
  containerProvider?: Record<string, unknown>;
  createdAt?: string;
  tags?: Record<string, unknown>;
  extra?: Record<string, unknown>;
};

/** Metadata for an EMR Containers job run. */
export type JobRunResult = {
  id: string;
  name?: string;
  virtualClusterId?: string;
  arn?: string;
  state?: string;
  stateDetails?: string;
  executionRoleArn?: string;
  releaseLabel?: string;
  createdAt?: string;
  finishedAt?: string;
  extra?: Record<string, unknown>;
};

/** Result of create_job_template. */
export type CreateJobTemplateResult = {
  id?: string;
  name?: string;
  arn?: string;
  createdAt?: string;
};

/** Result of create_managed_endpoint. */
export type CreateManagedEndpointResult = {
  id?: string;
  name?: string;
  arn?: string;
  virtualClusterId?: string;
};

/** Result of create_security_configuration. */
export type CreateSecurityConfigurationResult = {
  id?: string;
  name?: string;
  arn?: string;
};

/** Result of delete_job_template. */
export type DeleteJobTemplateResult = {
  id?: string;
};

/** Result of delete_managed_endpoint. */
export type DeleteManagedEndpointResult = {
  id?: string;
  virtualClusterId?: string;
};

/** Result of describe_job_template. */
export type DescribeJobTemplateResult = {
  jobTemplate?: Record<string, unknown>;
};

/** Result of describe_managed_endpoint. */
export type DescribeManagedEndpointResult = {
  endpoint?: Record<string, unknown>;
};

/** Result of describe_security_configuration. */
export type DescribeSecurityConfigurationResult = {
  securityConfiguration?: Record<string, unknown>;
};

/** Result of get_managed_endpoint_session_credentials. */
export type GetManagedEndpointSessionCredentialsResult = {
  id?: string;
  credentials?: Record<string, unknown>;
  expiresAt?: string;
};

/** Result of list_job_templates. */
export type ListJobTemplatesResult = {
  templates?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_managed_endpoints. */
export type ListManagedEndpointsResult = {
  endpoints?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_security_configurations. */
export type ListSecurityConfigurationsResult = {
  securityConfigurations?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_tags_for_resource. */
export type ListTagsForResourceResult = {
  tags?: Record<string, unknown>;
};

/** Create an EMR Containers virtual cluster. */
export async function createVirtualCluster(name: string): Promise<VirtualClusterResult> {
  try {
    // TODO: implement create_virtual_cluster
    throw new Error("create_virtual_cluster not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_virtual_cluster failed");
  }
}

/** Describe an EMR Containers virtual cluster. */
export async function describeVirtualCluster(virtualClusterId: string): Promise<VirtualClusterResult> {
  try {
    // TODO: implement describe_virtual_cluster
    throw new Error("describe_virtual_cluster not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_virtual_cluster failed");
  }
}

/** List all EMR Containers virtual clusters. */
export async function listVirtualClusters(): Promise<VirtualClusterResult[]> {
  try {
    // TODO: implement list_virtual_clusters
    throw new Error("list_virtual_clusters not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_virtual_clusters failed");
  }
}

/** Delete an EMR Containers virtual cluster. */
export async function deleteVirtualCluster(virtualClusterId: string): Promise<Record<string, unknown>> {
  try {
    // TODO: implement delete_virtual_cluster
    throw new Error("delete_virtual_cluster not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_virtual_cluster failed");
  }
}

/** Start a job run on an EMR Containers virtual cluster. */
export async function startJobRun(virtualClusterId: string): Promise<JobRunResult> {
  try {
    // TODO: implement start_job_run
    throw new Error("start_job_run not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_job_run failed");
  }
}

/** Describe an EMR Containers job run. */
export async function describeJobRun(virtualClusterId: string, jobRunId: string): Promise<JobRunResult> {
  try {
    // TODO: implement describe_job_run
    throw new Error("describe_job_run not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_job_run failed");
  }
}

/** List job runs for an EMR Containers virtual cluster. */
export async function listJobRuns(virtualClusterId: string): Promise<JobRunResult[]> {
  try {
    // TODO: implement list_job_runs
    throw new Error("list_job_runs not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_job_runs failed");
  }
}

/** Cancel an EMR Containers job run. */
export async function cancelJobRun(virtualClusterId: string, jobRunId: string): Promise<Record<string, unknown>> {
  try {
    // TODO: implement cancel_job_run
    throw new Error("cancel_job_run not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "cancel_job_run failed");
  }
}

/** Create job template. */
export async function createJobTemplate(name: string, clientToken: string, jobTemplateData: Record<string, unknown>): Promise<CreateJobTemplateResult> {
  try {
    // TODO: implement create_job_template
    throw new Error("create_job_template not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_job_template failed");
  }
}

/** Create managed endpoint. */
export async function createManagedEndpoint(name: string, virtualClusterId: string, typeValue: string, releaseLabel: string, executionRoleArn: string, clientToken: string): Promise<CreateManagedEndpointResult> {
  try {
    // TODO: implement create_managed_endpoint
    throw new Error("create_managed_endpoint not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_managed_endpoint failed");
  }
}

/** Create security configuration. */
export async function createSecurityConfiguration(clientToken: string, name: string, securityConfigurationData: Record<string, unknown>): Promise<CreateSecurityConfigurationResult> {
  try {
    // TODO: implement create_security_configuration
    throw new Error("create_security_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_security_configuration failed");
  }
}

/** Delete job template. */
export async function deleteJobTemplate(id: string, regionName?: string): Promise<DeleteJobTemplateResult> {
  try {
    // TODO: implement delete_job_template
    throw new Error("delete_job_template not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_job_template failed");
  }
}

/** Delete managed endpoint. */
export async function deleteManagedEndpoint(id: string, virtualClusterId: string, regionName?: string): Promise<DeleteManagedEndpointResult> {
  try {
    // TODO: implement delete_managed_endpoint
    throw new Error("delete_managed_endpoint not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_managed_endpoint failed");
  }
}

/** Describe job template. */
export async function describeJobTemplate(id: string, regionName?: string): Promise<DescribeJobTemplateResult> {
  try {
    // TODO: implement describe_job_template
    throw new Error("describe_job_template not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_job_template failed");
  }
}

/** Describe managed endpoint. */
export async function describeManagedEndpoint(id: string, virtualClusterId: string, regionName?: string): Promise<DescribeManagedEndpointResult> {
  try {
    // TODO: implement describe_managed_endpoint
    throw new Error("describe_managed_endpoint not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_managed_endpoint failed");
  }
}

/** Describe security configuration. */
export async function describeSecurityConfiguration(id: string, regionName?: string): Promise<DescribeSecurityConfigurationResult> {
  try {
    // TODO: implement describe_security_configuration
    throw new Error("describe_security_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_security_configuration failed");
  }
}

/** Get managed endpoint session credentials. */
export async function getManagedEndpointSessionCredentials(endpointIdentifier: string, virtualClusterIdentifier: string, executionRoleArn: string, credentialType: string): Promise<GetManagedEndpointSessionCredentialsResult> {
  try {
    // TODO: implement get_managed_endpoint_session_credentials
    throw new Error("get_managed_endpoint_session_credentials not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_managed_endpoint_session_credentials failed");
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

/** List managed endpoints. */
export async function listManagedEndpoints(virtualClusterId: string): Promise<ListManagedEndpointsResult> {
  try {
    // TODO: implement list_managed_endpoints
    throw new Error("list_managed_endpoints not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_managed_endpoints failed");
  }
}

/** List security configurations. */
export async function listSecurityConfigurations(): Promise<ListSecurityConfigurationsResult> {
  try {
    // TODO: implement list_security_configurations
    throw new Error("list_security_configurations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_security_configurations failed");
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
