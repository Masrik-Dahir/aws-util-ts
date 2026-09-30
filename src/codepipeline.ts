import { CodepipelineClient } from "@aws-sdk/client-codepipeline";
import { getClient } from "./client";
import { wrapAwsError } from "./exceptions";

/** Metadata for a CodePipeline pipeline. */
export type PipelineResult = {
  name: string;
  arn?: string;
  roleArn?: string;
  stages?: Record<string, unknown>[];
  version?: number;
  created?: string;
  updated?: string;
  extra?: Record<string, unknown>;
};

/** A CodePipeline pipeline execution. */
export type PipelineExecutionResult = {
  pipelineName: string;
  executionId: string;
  status: string;
  artifactRevisions?: Record<string, unknown>[];
  extra?: Record<string, unknown>;
};

/** State information for a single pipeline stage. */
export type StageStateResult = {
  stageName: string;
  inboundExecution?: Record<string, unknown>;
  actionStates?: Record<string, unknown>[];
  extra?: Record<string, unknown>;
};

/** Result of acknowledge_job. */
export type AcknowledgeJobResult = {
  status?: string;
};

/** Result of acknowledge_third_party_job. */
export type AcknowledgeThirdPartyJobResult = {
  status?: string;
};

/** Result of create_custom_action_type. */
export type CreateCustomActionTypeResult = {
  actionType?: Record<string, unknown>;
  tags?: Record<string, unknown>[];
};

/** Result of get_action_type. */
export type GetActionTypeResult = {
  actionType?: Record<string, unknown>;
};

/** Result of get_job_details. */
export type GetJobDetailsResult = {
  jobDetails?: Record<string, unknown>;
};

/** Result of get_third_party_job_details. */
export type GetThirdPartyJobDetailsResult = {
  jobDetails?: Record<string, unknown>;
};

/** Result of list_action_executions. */
export type ListActionExecutionsResult = {
  actionExecutionDetails?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_action_types. */
export type ListActionTypesResult = {
  actionTypes?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_deploy_action_execution_targets. */
export type ListDeployActionExecutionTargetsResult = {
  targets?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_rule_executions. */
export type ListRuleExecutionsResult = {
  ruleExecutionDetails?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_rule_types. */
export type ListRuleTypesResult = {
  ruleTypes?: Record<string, unknown>[];
};

/** Result of list_tags_for_resource. */
export type ListTagsForResourceResult = {
  tags?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_webhooks. */
export type ListWebhooksResult = {
  webhooks?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of poll_for_jobs. */
export type PollForJobsResult = {
  jobs?: Record<string, unknown>[];
};

/** Result of poll_for_third_party_jobs. */
export type PollForThirdPartyJobsResult = {
  jobs?: Record<string, unknown>[];
};

/** Result of put_action_revision. */
export type PutActionRevisionResult = {
  newRevision?: boolean;
  pipelineExecutionId?: string;
};

/** Result of put_webhook. */
export type PutWebhookResult = {
  webhook?: Record<string, unknown>;
};

/** Result of rollback_stage. */
export type RollbackStageResult = {
  pipelineExecutionId?: string;
};

/** Create a new CodePipeline pipeline. */
export async function createPipeline(name: string): Promise<PipelineResult> {
  try {
    // TODO: implement create_pipeline
    throw new Error("create_pipeline not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_pipeline failed");
  }
}

/** Retrieve a CodePipeline pipeline definition. */
export async function getPipeline(name: string): Promise<PipelineResult> {
  try {
    // TODO: implement get_pipeline
    throw new Error("get_pipeline not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_pipeline failed");
  }
}

/** List all CodePipeline pipelines in the account. */
export async function listPipelines(): Promise<Record<string, unknown>[]> {
  try {
    // TODO: implement list_pipelines
    throw new Error("list_pipelines not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_pipelines failed");
  }
}

/** Update an existing CodePipeline pipeline. */
export async function updatePipeline(): Promise<PipelineResult> {
  try {
    // TODO: implement update_pipeline
    throw new Error("update_pipeline not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_pipeline failed");
  }
}

/** Delete a CodePipeline pipeline. */
export async function deletePipeline(name: string): Promise<void> {
  try {
    // TODO: implement delete_pipeline
    throw new Error("delete_pipeline not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_pipeline failed");
  }
}

/** Start a new execution of a CodePipeline pipeline. */
export async function startPipelineExecution(name: string): Promise<string> {
  try {
    // TODO: implement start_pipeline_execution
    throw new Error("start_pipeline_execution not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_pipeline_execution failed");
  }
}

/** Describe a specific pipeline execution. */
export async function getPipelineExecution(name: string, executionId: string): Promise<PipelineExecutionResult> {
  try {
    // TODO: implement get_pipeline_execution
    throw new Error("get_pipeline_execution not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_pipeline_execution failed");
  }
}

/** List recent executions of a pipeline. */
export async function listPipelineExecutions(name: string): Promise<PipelineExecutionResult[]> {
  try {
    // TODO: implement list_pipeline_executions
    throw new Error("list_pipeline_executions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_pipeline_executions failed");
  }
}

/** Stop a running pipeline execution. */
export async function stopPipelineExecution(name: string, executionId: string): Promise<void> {
  try {
    // TODO: implement stop_pipeline_execution
    throw new Error("stop_pipeline_execution not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "stop_pipeline_execution failed");
  }
}

/** Get the current state of all stages in a pipeline. */
export async function getPipelineState(name: string): Promise<StageStateResult[]> {
  try {
    // TODO: implement get_pipeline_state
    throw new Error("get_pipeline_state not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_pipeline_state failed");
  }
}

/** Retry a failed stage execution. */
export async function retryStageExecution(name: string, stageName: string, executionId: string): Promise<string> {
  try {
    // TODO: implement retry_stage_execution
    throw new Error("retry_stage_execution not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "retry_stage_execution failed");
  }
}

/** Enable a stage transition in a pipeline. */
export async function enableStageTransition(name: string, stageName: string): Promise<void> {
  try {
    // TODO: implement enable_stage_transition
    throw new Error("enable_stage_transition not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "enable_stage_transition failed");
  }
}

/** Disable a stage transition in a pipeline. */
export async function disableStageTransition(name: string, stageName: string): Promise<void> {
  try {
    // TODO: implement disable_stage_transition
    throw new Error("disable_stage_transition not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disable_stage_transition failed");
  }
}

/** Submit an approval result for a manual approval action. */
export async function putApprovalResult(name: string, stageName: string, actionName: string): Promise<void> {
  try {
    // TODO: implement put_approval_result
    throw new Error("put_approval_result not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_approval_result failed");
  }
}

/** Poll until a pipeline execution reaches a target or failure status. */
export async function waitForPipelineExecution(name: string, executionId: string): Promise<PipelineExecutionResult> {
  try {
    // TODO: implement wait_for_pipeline_execution
    throw new Error("wait_for_pipeline_execution not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "wait_for_pipeline_execution failed");
  }
}

/** Start a pipeline execution and wait for it to complete. */
export async function runPipelineAndWait(name: string): Promise<PipelineExecutionResult> {
  try {
    // TODO: implement run_pipeline_and_wait
    throw new Error("run_pipeline_and_wait not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "run_pipeline_and_wait failed");
  }
}

/** Acknowledge job. */
export async function acknowledgeJob(jobId: string, nonce: string, regionName?: string): Promise<AcknowledgeJobResult> {
  try {
    // TODO: implement acknowledge_job
    throw new Error("acknowledge_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "acknowledge_job failed");
  }
}

/** Acknowledge third party job. */
export async function acknowledgeThirdPartyJob(jobId: string, nonce: string, clientToken: string, regionName?: string): Promise<AcknowledgeThirdPartyJobResult> {
  try {
    // TODO: implement acknowledge_third_party_job
    throw new Error("acknowledge_third_party_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "acknowledge_third_party_job failed");
  }
}

/** Create custom action type. */
export async function createCustomActionType(category: string, provider: string, version: string, inputArtifactDetails: Record<string, unknown>, outputArtifactDetails: Record<string, unknown>): Promise<CreateCustomActionTypeResult> {
  try {
    // TODO: implement create_custom_action_type
    throw new Error("create_custom_action_type not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_custom_action_type failed");
  }
}

/** Delete custom action type. */
export async function deleteCustomActionType(category: string, provider: string, version: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_custom_action_type
    throw new Error("delete_custom_action_type not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_custom_action_type failed");
  }
}

/** Delete webhook. */
export async function deleteWebhook(name: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_webhook
    throw new Error("delete_webhook not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_webhook failed");
  }
}

/** Deregister webhook with third party. */
export async function deregisterWebhookWithThirdParty(): Promise<void> {
  try {
    // TODO: implement deregister_webhook_with_third_party
    throw new Error("deregister_webhook_with_third_party not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "deregister_webhook_with_third_party failed");
  }
}

/** Get action type. */
export async function getActionType(category: string, owner: string, provider: string, version: string, regionName?: string): Promise<GetActionTypeResult> {
  try {
    // TODO: implement get_action_type
    throw new Error("get_action_type not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_action_type failed");
  }
}

/** Get job details. */
export async function getJobDetails(jobId: string, regionName?: string): Promise<GetJobDetailsResult> {
  try {
    // TODO: implement get_job_details
    throw new Error("get_job_details not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_job_details failed");
  }
}

/** Get third party job details. */
export async function getThirdPartyJobDetails(jobId: string, clientToken: string, regionName?: string): Promise<GetThirdPartyJobDetailsResult> {
  try {
    // TODO: implement get_third_party_job_details
    throw new Error("get_third_party_job_details not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_third_party_job_details failed");
  }
}

/** List action executions. */
export async function listActionExecutions(pipelineName: string): Promise<ListActionExecutionsResult> {
  try {
    // TODO: implement list_action_executions
    throw new Error("list_action_executions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_action_executions failed");
  }
}

/** List action types. */
export async function listActionTypes(): Promise<ListActionTypesResult> {
  try {
    // TODO: implement list_action_types
    throw new Error("list_action_types not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_action_types failed");
  }
}

/** List deploy action execution targets. */
export async function listDeployActionExecutionTargets(actionExecutionId: string): Promise<ListDeployActionExecutionTargetsResult> {
  try {
    // TODO: implement list_deploy_action_execution_targets
    throw new Error("list_deploy_action_execution_targets not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_deploy_action_execution_targets failed");
  }
}

/** List rule executions. */
export async function listRuleExecutions(pipelineName: string): Promise<ListRuleExecutionsResult> {
  try {
    // TODO: implement list_rule_executions
    throw new Error("list_rule_executions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_rule_executions failed");
  }
}

/** List rule types. */
export async function listRuleTypes(): Promise<ListRuleTypesResult> {
  try {
    // TODO: implement list_rule_types
    throw new Error("list_rule_types not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_rule_types failed");
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

/** List webhooks. */
export async function listWebhooks(): Promise<ListWebhooksResult> {
  try {
    // TODO: implement list_webhooks
    throw new Error("list_webhooks not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_webhooks failed");
  }
}

/** Override stage condition. */
export async function overrideStageCondition(pipelineName: string, stageName: string, pipelineExecutionId: string, conditionType: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement override_stage_condition
    throw new Error("override_stage_condition not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "override_stage_condition failed");
  }
}

/** Poll for jobs. */
export async function pollForJobs(actionTypeId: Record<string, unknown>): Promise<PollForJobsResult> {
  try {
    // TODO: implement poll_for_jobs
    throw new Error("poll_for_jobs not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "poll_for_jobs failed");
  }
}

/** Poll for third party jobs. */
export async function pollForThirdPartyJobs(actionTypeId: Record<string, unknown>): Promise<PollForThirdPartyJobsResult> {
  try {
    // TODO: implement poll_for_third_party_jobs
    throw new Error("poll_for_third_party_jobs not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "poll_for_third_party_jobs failed");
  }
}

/** Put action revision. */
export async function putActionRevision(pipelineName: string, stageName: string, actionName: string, actionRevision: Record<string, unknown>, regionName?: string): Promise<PutActionRevisionResult> {
  try {
    // TODO: implement put_action_revision
    throw new Error("put_action_revision not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_action_revision failed");
  }
}

/** Put job failure result. */
export async function putJobFailureResult(jobId: string, failureDetails: Record<string, unknown>, regionName?: string): Promise<void> {
  try {
    // TODO: implement put_job_failure_result
    throw new Error("put_job_failure_result not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_job_failure_result failed");
  }
}

/** Put job success result. */
export async function putJobSuccessResult(jobId: string): Promise<void> {
  try {
    // TODO: implement put_job_success_result
    throw new Error("put_job_success_result not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_job_success_result failed");
  }
}

/** Put third party job failure result. */
export async function putThirdPartyJobFailureResult(jobId: string, clientToken: string, failureDetails: Record<string, unknown>, regionName?: string): Promise<void> {
  try {
    // TODO: implement put_third_party_job_failure_result
    throw new Error("put_third_party_job_failure_result not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_third_party_job_failure_result failed");
  }
}

/** Put third party job success result. */
export async function putThirdPartyJobSuccessResult(jobId: string, clientToken: string): Promise<void> {
  try {
    // TODO: implement put_third_party_job_success_result
    throw new Error("put_third_party_job_success_result not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_third_party_job_success_result failed");
  }
}

/** Put webhook. */
export async function putWebhook(webhook: Record<string, unknown>): Promise<PutWebhookResult> {
  try {
    // TODO: implement put_webhook
    throw new Error("put_webhook not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_webhook failed");
  }
}

/** Register webhook with third party. */
export async function registerWebhookWithThirdParty(): Promise<void> {
  try {
    // TODO: implement register_webhook_with_third_party
    throw new Error("register_webhook_with_third_party not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "register_webhook_with_third_party failed");
  }
}

/** Rollback stage. */
export async function rollbackStage(pipelineName: string, stageName: string, targetPipelineExecutionId: string, regionName?: string): Promise<RollbackStageResult> {
  try {
    // TODO: implement rollback_stage
    throw new Error("rollback_stage not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "rollback_stage failed");
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

/** Update action type. */
export async function updateActionType(actionType: Record<string, unknown>, regionName?: string): Promise<void> {
  try {
    // TODO: implement update_action_type
    throw new Error("update_action_type not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_action_type failed");
  }
}
