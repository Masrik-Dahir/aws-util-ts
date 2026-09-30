import { BatchClient } from "@aws-sdk/client-batch";
import { getClient } from "./client";
import { wrapAwsError } from "./exceptions";

/** Metadata for an AWS Batch compute environment. */
export type ComputeEnvironmentResult = {
  name: string;
  arn: string;
  type: string;
  state: string;
  status: string;
  computeResources?: Record<string, unknown>;
  serviceRole?: string;
  extra?: Record<string, unknown>;
};

/** Metadata for an AWS Batch job queue. */
export type JobQueueResult = {
  name: string;
  arn: string;
  state: string;
  status: string;
  priority: number;
  computeEnvironments: Record<string, unknown>[];
  extra?: Record<string, unknown>;
};

/** Metadata for an AWS Batch job definition. */
export type JobDefinitionResult = {
  name: string;
  arn: string;
  revision: number;
  type: string;
  status: string;
  containerProperties?: Record<string, unknown>;
  extra?: Record<string, unknown>;
};

/** Metadata for an AWS Batch job. */
export type JobResult = {
  jobId: string;
  jobName: string;
  jobQueue: string;
  status: string;
  statusReason?: string;
  createdAt?: number;
  startedAt?: number;
  stoppedAt?: number;
  container?: Record<string, unknown>;
  extra?: Record<string, unknown>;
};

/** Result of create_consumable_resource. */
export type CreateConsumableResourceResult = {
  consumableResourceName?: string;
  consumableResourceArn?: string;
};

/** Result of create_scheduling_policy. */
export type CreateSchedulingPolicyResult = {
  name?: string;
  arn?: string;
};

/** Result of create_service_environment. */
export type CreateServiceEnvironmentResult = {
  serviceEnvironmentName?: string;
  serviceEnvironmentArn?: string;
};

/** Result of describe_consumable_resource. */
export type DescribeConsumableResourceResult = {
  consumableResourceName?: string;
  consumableResourceArn?: string;
  totalQuantity?: number;
  inUseQuantity?: number;
  availableQuantity?: number;
  resourceType?: string;
  createdAt?: number;
  tags?: Record<string, unknown>;
};

/** Result of describe_scheduling_policies. */
export type DescribeSchedulingPoliciesResult = {
  schedulingPolicies?: Record<string, unknown>[];
};

/** Result of describe_service_environments. */
export type DescribeServiceEnvironmentsResult = {
  serviceEnvironments?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of describe_service_job. */
export type DescribeServiceJobResult = {
  attempts?: Record<string, unknown>[];
  createdAt?: number;
  isTerminated?: boolean;
  jobArn?: string;
  jobId?: string;
  jobName?: string;
  jobQueue?: string;
  latestAttempt?: Record<string, unknown>;
  retryStrategy?: Record<string, unknown>;
  schedulingPriority?: number;
  serviceRequestPayload?: string;
  serviceJobType?: string;
  shareIdentifier?: string;
  startedAt?: number;
  status?: string;
  statusReason?: string;
  stoppedAt?: number;
  tags?: Record<string, unknown>;
  timeoutConfig?: Record<string, unknown>;
};

/** Result of get_job_queue_snapshot. */
export type GetJobQueueSnapshotResult = {
  frontOfQueue?: Record<string, unknown>;
};

/** Result of list_consumable_resources. */
export type ListConsumableResourcesResult = {
  consumableResources?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_jobs_by_consumable_resource. */
export type ListJobsByConsumableResourceResult = {
  jobs?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_scheduling_policies. */
export type ListSchedulingPoliciesResult = {
  schedulingPolicies?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_service_jobs. */
export type ListServiceJobsResult = {
  jobSummaryList?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_tags_for_resource. */
export type ListTagsForResourceResult = {
  tags?: Record<string, unknown>;
};

/** Result of submit_service_job. */
export type SubmitServiceJobResult = {
  jobArn?: string;
  jobName?: string;
  jobId?: string;
};

/** Result of update_consumable_resource. */
export type UpdateConsumableResourceResult = {
  consumableResourceName?: string;
  consumableResourceArn?: string;
  totalQuantity?: number;
};

/** Result of update_service_environment. */
export type UpdateServiceEnvironmentResult = {
  serviceEnvironmentName?: string;
  serviceEnvironmentArn?: string;
};

/** Create an AWS Batch compute environment. */
export async function createComputeEnvironment(name: string): Promise<ComputeEnvironmentResult> {
  try {
    // TODO: implement create_compute_environment
    throw new Error("create_compute_environment not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_compute_environment failed");
  }
}

/** Describe one or more compute environments. */
export async function describeComputeEnvironments(): Promise<ComputeEnvironmentResult[]> {
  try {
    // TODO: implement describe_compute_environments
    throw new Error("describe_compute_environments not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_compute_environments failed");
  }
}

/** Update an AWS Batch compute environment. */
export async function updateComputeEnvironment(name: string): Promise<ComputeEnvironmentResult> {
  try {
    // TODO: implement update_compute_environment
    throw new Error("update_compute_environment not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_compute_environment failed");
  }
}

/** Delete an AWS Batch compute environment. */
export async function deleteComputeEnvironment(name: string): Promise<void> {
  try {
    // TODO: implement delete_compute_environment
    throw new Error("delete_compute_environment not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_compute_environment failed");
  }
}

/** Create an AWS Batch job queue. */
export async function createJobQueue(name: string): Promise<JobQueueResult> {
  try {
    // TODO: implement create_job_queue
    throw new Error("create_job_queue not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_job_queue failed");
  }
}

/** Describe one or more job queues. */
export async function describeJobQueues(): Promise<JobQueueResult[]> {
  try {
    // TODO: implement describe_job_queues
    throw new Error("describe_job_queues not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_job_queues failed");
  }
}

/** Update an AWS Batch job queue. */
export async function updateJobQueue(name: string): Promise<JobQueueResult> {
  try {
    // TODO: implement update_job_queue
    throw new Error("update_job_queue not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_job_queue failed");
  }
}

/** Delete an AWS Batch job queue. */
export async function deleteJobQueue(name: string): Promise<void> {
  try {
    // TODO: implement delete_job_queue
    throw new Error("delete_job_queue not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_job_queue failed");
  }
}

/** Register a new AWS Batch job definition. */
export async function registerJobDefinition(name: string): Promise<JobDefinitionResult> {
  try {
    // TODO: implement register_job_definition
    throw new Error("register_job_definition not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "register_job_definition failed");
  }
}

/** Describe one or more job definitions. */
export async function describeJobDefinitions(): Promise<JobDefinitionResult[]> {
  try {
    // TODO: implement describe_job_definitions
    throw new Error("describe_job_definitions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_job_definitions failed");
  }
}

/** Deregister an AWS Batch job definition. */
export async function deregisterJobDefinition(jobDefinition: string): Promise<void> {
  try {
    // TODO: implement deregister_job_definition
    throw new Error("deregister_job_definition not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "deregister_job_definition failed");
  }
}

/** Submit a job to an AWS Batch job queue. */
export async function submitJob(jobName: string): Promise<string> {
  try {
    // TODO: implement submit_job
    throw new Error("submit_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "submit_job failed");
  }
}

/** Describe one or more AWS Batch jobs. */
export async function describeJobs(jobIds: string[]): Promise<JobResult[]> {
  try {
    // TODO: implement describe_jobs
    throw new Error("describe_jobs not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_jobs failed");
  }
}

/** List jobs in an AWS Batch job queue. */
export async function listJobs(jobQueue: string): Promise<JobResult[]> {
  try {
    // TODO: implement list_jobs
    throw new Error("list_jobs not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_jobs failed");
  }
}

/** Cancel an AWS Batch job. */
export async function cancelJob(jobId: string): Promise<void> {
  try {
    // TODO: implement cancel_job
    throw new Error("cancel_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "cancel_job failed");
  }
}

/** Terminate an AWS Batch job. */
export async function terminateJob(jobId: string): Promise<void> {
  try {
    // TODO: implement terminate_job
    throw new Error("terminate_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "terminate_job failed");
  }
}

/** Poll until a job reaches a target or failure status. */
export async function waitForJob(jobId: string): Promise<JobResult> {
  try {
    // TODO: implement wait_for_job
    throw new Error("wait_for_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "wait_for_job failed");
  }
}

/** Submit a job and wait for it to succeed. */
export async function submitAndWait(jobName: string): Promise<JobResult> {
  try {
    // TODO: implement submit_and_wait
    throw new Error("submit_and_wait not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "submit_and_wait failed");
  }
}

/** Create consumable resource. */
export async function createConsumableResource(consumableResourceName: string): Promise<CreateConsumableResourceResult> {
  try {
    // TODO: implement create_consumable_resource
    throw new Error("create_consumable_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_consumable_resource failed");
  }
}

/** Create scheduling policy. */
export async function createSchedulingPolicy(name: string): Promise<CreateSchedulingPolicyResult> {
  try {
    // TODO: implement create_scheduling_policy
    throw new Error("create_scheduling_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_scheduling_policy failed");
  }
}

/** Create service environment. */
export async function createServiceEnvironment(serviceEnvironmentName: string, serviceEnvironmentType: string, capacityLimits: Record<string, unknown>[]): Promise<CreateServiceEnvironmentResult> {
  try {
    // TODO: implement create_service_environment
    throw new Error("create_service_environment not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_service_environment failed");
  }
}

/** Delete consumable resource. */
export async function deleteConsumableResource(consumableResource: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_consumable_resource
    throw new Error("delete_consumable_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_consumable_resource failed");
  }
}

/** Delete scheduling policy. */
export async function deleteSchedulingPolicy(arn: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_scheduling_policy
    throw new Error("delete_scheduling_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_scheduling_policy failed");
  }
}

/** Delete service environment. */
export async function deleteServiceEnvironment(serviceEnvironment: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_service_environment
    throw new Error("delete_service_environment not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_service_environment failed");
  }
}

/** Describe consumable resource. */
export async function describeConsumableResource(consumableResource: string, regionName?: string): Promise<DescribeConsumableResourceResult> {
  try {
    // TODO: implement describe_consumable_resource
    throw new Error("describe_consumable_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_consumable_resource failed");
  }
}

/** Describe scheduling policies. */
export async function describeSchedulingPolicies(arns: string[], regionName?: string): Promise<DescribeSchedulingPoliciesResult> {
  try {
    // TODO: implement describe_scheduling_policies
    throw new Error("describe_scheduling_policies not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_scheduling_policies failed");
  }
}

/** Describe service environments. */
export async function describeServiceEnvironments(): Promise<DescribeServiceEnvironmentsResult> {
  try {
    // TODO: implement describe_service_environments
    throw new Error("describe_service_environments not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_service_environments failed");
  }
}

/** Describe service job. */
export async function describeServiceJob(jobId: string, regionName?: string): Promise<DescribeServiceJobResult> {
  try {
    // TODO: implement describe_service_job
    throw new Error("describe_service_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_service_job failed");
  }
}

/** Get job queue snapshot. */
export async function getJobQueueSnapshot(jobQueue: string, regionName?: string): Promise<GetJobQueueSnapshotResult> {
  try {
    // TODO: implement get_job_queue_snapshot
    throw new Error("get_job_queue_snapshot not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_job_queue_snapshot failed");
  }
}

/** List consumable resources. */
export async function listConsumableResources(): Promise<ListConsumableResourcesResult> {
  try {
    // TODO: implement list_consumable_resources
    throw new Error("list_consumable_resources not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_consumable_resources failed");
  }
}

/** List jobs by consumable resource. */
export async function listJobsByConsumableResource(consumableResource: string): Promise<ListJobsByConsumableResourceResult> {
  try {
    // TODO: implement list_jobs_by_consumable_resource
    throw new Error("list_jobs_by_consumable_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_jobs_by_consumable_resource failed");
  }
}

/** List scheduling policies. */
export async function listSchedulingPolicies(): Promise<ListSchedulingPoliciesResult> {
  try {
    // TODO: implement list_scheduling_policies
    throw new Error("list_scheduling_policies not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_scheduling_policies failed");
  }
}

/** List service jobs. */
export async function listServiceJobs(): Promise<ListServiceJobsResult> {
  try {
    // TODO: implement list_service_jobs
    throw new Error("list_service_jobs not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_service_jobs failed");
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

/** Submit service job. */
export async function submitServiceJob(jobName: string, jobQueue: string, serviceRequestPayload: string, serviceJobType: string): Promise<SubmitServiceJobResult> {
  try {
    // TODO: implement submit_service_job
    throw new Error("submit_service_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "submit_service_job failed");
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

/** Terminate service job. */
export async function terminateServiceJob(jobId: string, reason: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement terminate_service_job
    throw new Error("terminate_service_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "terminate_service_job failed");
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

/** Update consumable resource. */
export async function updateConsumableResource(consumableResource: string): Promise<UpdateConsumableResourceResult> {
  try {
    // TODO: implement update_consumable_resource
    throw new Error("update_consumable_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_consumable_resource failed");
  }
}

/** Update scheduling policy. */
export async function updateSchedulingPolicy(arn: string): Promise<void> {
  try {
    // TODO: implement update_scheduling_policy
    throw new Error("update_scheduling_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_scheduling_policy failed");
  }
}

/** Update service environment. */
export async function updateServiceEnvironment(serviceEnvironment: string): Promise<UpdateServiceEnvironmentResult> {
  try {
    // TODO: implement update_service_environment
    throw new Error("update_service_environment not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_service_environment failed");
  }
}
