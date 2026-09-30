import { CodedeployClient } from "@aws-sdk/client-codedeploy";
import { getClient } from "./client";
import { wrapAwsError } from "./exceptions";

/** Metadata for a CodeDeploy application. */
export type ApplicationResult = {
  applicationId?: string;
  applicationName?: string;
  computePlatform?: string;
  createTime?: string;
  linkedToGithub?: boolean;
  extra?: Record<string, unknown>;
};

/** Metadata for a CodeDeploy deployment group. */
export type DeploymentGroupResult = {
  deploymentGroupId?: string;
  deploymentGroupName?: string;
  applicationName?: string;
  serviceRoleArn?: string;
  deploymentConfigName?: string;
  computePlatform?: string;
  extra?: Record<string, unknown>;
};

/** Metadata for a CodeDeploy deployment. */
export type DeploymentResult = {
  deploymentId?: string;
  applicationName?: string;
  deploymentGroupName?: string;
  status?: string;
  revision?: Record<string, unknown>;
  description?: string;
  createTime?: string;
  completeTime?: string;
  extra?: Record<string, unknown>;
};

/** Metadata for a CodeDeploy deployment configuration. */
export type DeploymentConfigResult = {
  deploymentConfigId?: string;
  deploymentConfigName?: string;
  computePlatform?: string;
  minimumHealthyHosts?: Record<string, unknown>;
  createTime?: string;
  extra?: Record<string, unknown>;
};

/** Metadata for an application revision. */
export type RevisionResult = {
  applicationName?: string;
  revision?: Record<string, unknown>;
  description?: string;
  registerTime?: string;
  firstUsedTime?: string;
  lastUsedTime?: string;
  extra?: Record<string, unknown>;
};

/** Result of batch_get_application_revisions. */
export type BatchGetApplicationRevisionsResult = {
  applicationName?: string;
  errorMessage?: string;
  revisions?: Record<string, unknown>[];
};

/** Result of batch_get_applications. */
export type BatchGetApplicationsResult = {
  applicationsInfo?: Record<string, unknown>[];
};

/** Result of batch_get_deployment_groups. */
export type BatchGetDeploymentGroupsResult = {
  deploymentGroupsInfo?: Record<string, unknown>[];
  errorMessage?: string;
};

/** Result of batch_get_deployment_instances. */
export type BatchGetDeploymentInstancesResult = {
  instancesSummary?: Record<string, unknown>[];
  errorMessage?: string;
};

/** Result of batch_get_deployment_targets. */
export type BatchGetDeploymentTargetsResult = {
  deploymentTargets?: Record<string, unknown>[];
};

/** Result of batch_get_deployments. */
export type BatchGetDeploymentsResult = {
  deploymentsInfo?: Record<string, unknown>[];
};

/** Result of batch_get_on_premises_instances. */
export type BatchGetOnPremisesInstancesResult = {
  instanceInfos?: Record<string, unknown>[];
};

/** Result of delete_git_hub_account_token. */
export type DeleteGitHubAccountTokenResult = {
  tokenName?: string;
};

/** Result of get_deployment_instance. */
export type GetDeploymentInstanceResult = {
  instanceSummary?: Record<string, unknown>;
};

/** Result of get_deployment_target. */
export type GetDeploymentTargetResult = {
  deploymentTarget?: Record<string, unknown>;
};

/** Result of get_on_premises_instance. */
export type GetOnPremisesInstanceResult = {
  instanceInfo?: Record<string, unknown>;
};

/** Result of list_deployment_configs. */
export type ListDeploymentConfigsResult = {
  deploymentConfigsList?: string[];
  nextToken?: string;
};

/** Result of list_deployment_instances. */
export type ListDeploymentInstancesResult = {
  instancesList?: string[];
  nextToken?: string;
};

/** Result of list_deployment_targets. */
export type ListDeploymentTargetsResult = {
  targetIds?: string[];
  nextToken?: string;
};

/** Result of list_git_hub_account_token_names. */
export type ListGitHubAccountTokenNamesResult = {
  tokenNameList?: string[];
  nextToken?: string;
};

/** Result of list_on_premises_instances. */
export type ListOnPremisesInstancesResult = {
  instanceNames?: string[];
  nextToken?: string;
};

/** Result of list_tags_for_resource. */
export type ListTagsForResourceResult = {
  tags?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of put_lifecycle_event_hook_execution_status. */
export type PutLifecycleEventHookExecutionStatusResult = {
  lifecycleEventHookExecutionId?: string;
};

/** Result of update_deployment_group. */
export type UpdateDeploymentGroupResult = {
  hooksNotCleanedUp?: Record<string, unknown>[];
};

/** Create a new CodeDeploy application. */
export async function createApplication(applicationName: string): Promise<ApplicationResult> {
  try {
    // TODO: implement create_application
    throw new Error("create_application not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_application failed");
  }
}

/** Retrieve a CodeDeploy application. */
export async function getApplication(applicationName: string): Promise<ApplicationResult> {
  try {
    // TODO: implement get_application
    throw new Error("get_application not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_application failed");
  }
}

/** List all CodeDeploy application names. */
export async function listApplications(): Promise<string[]> {
  try {
    // TODO: implement list_applications
    throw new Error("list_applications not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_applications failed");
  }
}

/** Delete a CodeDeploy application. */
export async function deleteApplication(applicationName: string): Promise<void> {
  try {
    // TODO: implement delete_application
    throw new Error("delete_application not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_application failed");
  }
}

/** Create a new deployment group. */
export async function createDeploymentGroup(applicationName: string, deploymentGroupName: string): Promise<string> {
  try {
    // TODO: implement create_deployment_group
    throw new Error("create_deployment_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_deployment_group failed");
  }
}

/** Retrieve a deployment group. */
export async function getDeploymentGroup(applicationName: string, deploymentGroupName: string): Promise<DeploymentGroupResult> {
  try {
    // TODO: implement get_deployment_group
    throw new Error("get_deployment_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_deployment_group failed");
  }
}

/** List deployment group names for an application. */
export async function listDeploymentGroups(applicationName: string): Promise<string[]> {
  try {
    // TODO: implement list_deployment_groups
    throw new Error("list_deployment_groups not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_deployment_groups failed");
  }
}

/** Delete a deployment group. */
export async function deleteDeploymentGroup(applicationName: string, deploymentGroupName: string): Promise<void> {
  try {
    // TODO: implement delete_deployment_group
    throw new Error("delete_deployment_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_deployment_group failed");
  }
}

/** Create a new deployment. */
export async function createDeployment(applicationName: string): Promise<string> {
  try {
    // TODO: implement create_deployment
    throw new Error("create_deployment not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_deployment failed");
  }
}

/** Retrieve details for a deployment. */
export async function getDeployment(deploymentId: string): Promise<DeploymentResult> {
  try {
    // TODO: implement get_deployment
    throw new Error("get_deployment not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_deployment failed");
  }
}

/** List deployment IDs, optionally filtered. */
export async function listDeployments(): Promise<string[]> {
  try {
    // TODO: implement list_deployments
    throw new Error("list_deployments not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_deployments failed");
  }
}

/** Stop a running deployment. */
export async function stopDeployment(deploymentId: string): Promise<void> {
  try {
    // TODO: implement stop_deployment
    throw new Error("stop_deployment not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "stop_deployment failed");
  }
}

/** Continue a deployment that is waiting for approval. */
export async function continueDeployment(deploymentId: string): Promise<void> {
  try {
    // TODO: implement continue_deployment
    throw new Error("continue_deployment not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "continue_deployment failed");
  }
}

/** Register an application revision. */
export async function registerApplicationRevision(applicationName: string): Promise<void> {
  try {
    // TODO: implement register_application_revision
    throw new Error("register_application_revision not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "register_application_revision failed");
  }
}

/** Retrieve details for a registered application revision. */
export async function getApplicationRevision(applicationName: string): Promise<RevisionResult> {
  try {
    // TODO: implement get_application_revision
    throw new Error("get_application_revision not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_application_revision failed");
  }
}

/** List application revisions. */
export async function listApplicationRevisions(applicationName: string): Promise<Record<string, unknown>[]> {
  try {
    // TODO: implement list_application_revisions
    throw new Error("list_application_revisions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_application_revisions failed");
  }
}

/** Create a deployment configuration. */
export async function createDeploymentConfig(deploymentConfigName: string): Promise<string> {
  try {
    // TODO: implement create_deployment_config
    throw new Error("create_deployment_config not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_deployment_config failed");
  }
}

/** Retrieve a deployment configuration. */
export async function getDeploymentConfig(deploymentConfigName: string): Promise<DeploymentConfigResult> {
  try {
    // TODO: implement get_deployment_config
    throw new Error("get_deployment_config not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_deployment_config failed");
  }
}

/** Poll until a deployment reaches a target or failure status. */
export async function waitForDeployment(deploymentId: string): Promise<DeploymentResult> {
  try {
    // TODO: implement wait_for_deployment
    throw new Error("wait_for_deployment not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "wait_for_deployment failed");
  }
}

/** Create a deployment and wait for it to complete. */
export async function deployAndWait(applicationName: string): Promise<DeploymentResult> {
  try {
    // TODO: implement deploy_and_wait
    throw new Error("deploy_and_wait not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "deploy_and_wait failed");
  }
}

/** Add tags to on premises instances. */
export async function addTagsToOnPremisesInstances(tags: Record<string, unknown>[], instanceNames: string[], regionName?: string): Promise<void> {
  try {
    // TODO: implement add_tags_to_on_premises_instances
    throw new Error("add_tags_to_on_premises_instances not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "add_tags_to_on_premises_instances failed");
  }
}

/** Batch get application revisions. */
export async function batchGetApplicationRevisions(applicationName: string, revisions: Record<string, unknown>[], regionName?: string): Promise<BatchGetApplicationRevisionsResult> {
  try {
    // TODO: implement batch_get_application_revisions
    throw new Error("batch_get_application_revisions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_get_application_revisions failed");
  }
}

/** Batch get applications. */
export async function batchGetApplications(applicationNames: string[], regionName?: string): Promise<BatchGetApplicationsResult> {
  try {
    // TODO: implement batch_get_applications
    throw new Error("batch_get_applications not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_get_applications failed");
  }
}

/** Batch get deployment groups. */
export async function batchGetDeploymentGroups(applicationName: string, deploymentGroupNames: string[], regionName?: string): Promise<BatchGetDeploymentGroupsResult> {
  try {
    // TODO: implement batch_get_deployment_groups
    throw new Error("batch_get_deployment_groups not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_get_deployment_groups failed");
  }
}

/** Batch get deployment instances. */
export async function batchGetDeploymentInstances(deploymentId: string, instanceIds: string[], regionName?: string): Promise<BatchGetDeploymentInstancesResult> {
  try {
    // TODO: implement batch_get_deployment_instances
    throw new Error("batch_get_deployment_instances not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_get_deployment_instances failed");
  }
}

/** Batch get deployment targets. */
export async function batchGetDeploymentTargets(deploymentId: string, targetIds: string[], regionName?: string): Promise<BatchGetDeploymentTargetsResult> {
  try {
    // TODO: implement batch_get_deployment_targets
    throw new Error("batch_get_deployment_targets not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_get_deployment_targets failed");
  }
}

/** Batch get deployments. */
export async function batchGetDeployments(deploymentIds: string[], regionName?: string): Promise<BatchGetDeploymentsResult> {
  try {
    // TODO: implement batch_get_deployments
    throw new Error("batch_get_deployments not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_get_deployments failed");
  }
}

/** Batch get on premises instances. */
export async function batchGetOnPremisesInstances(instanceNames: string[], regionName?: string): Promise<BatchGetOnPremisesInstancesResult> {
  try {
    // TODO: implement batch_get_on_premises_instances
    throw new Error("batch_get_on_premises_instances not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_get_on_premises_instances failed");
  }
}

/** Delete deployment config. */
export async function deleteDeploymentConfig(deploymentConfigName: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_deployment_config
    throw new Error("delete_deployment_config not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_deployment_config failed");
  }
}

/** Delete git hub account token. */
export async function deleteGitHubAccountToken(): Promise<DeleteGitHubAccountTokenResult> {
  try {
    // TODO: implement delete_git_hub_account_token
    throw new Error("delete_git_hub_account_token not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_git_hub_account_token failed");
  }
}

/** Delete resources by external id. */
export async function deleteResourcesByExternalId(): Promise<void> {
  try {
    // TODO: implement delete_resources_by_external_id
    throw new Error("delete_resources_by_external_id not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_resources_by_external_id failed");
  }
}

/** Deregister on premises instance. */
export async function deregisterOnPremisesInstance(instanceName: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement deregister_on_premises_instance
    throw new Error("deregister_on_premises_instance not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "deregister_on_premises_instance failed");
  }
}

/** Get deployment instance. */
export async function getDeploymentInstance(deploymentId: string, instanceId: string, regionName?: string): Promise<GetDeploymentInstanceResult> {
  try {
    // TODO: implement get_deployment_instance
    throw new Error("get_deployment_instance not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_deployment_instance failed");
  }
}

/** Get deployment target. */
export async function getDeploymentTarget(deploymentId: string, targetId: string, regionName?: string): Promise<GetDeploymentTargetResult> {
  try {
    // TODO: implement get_deployment_target
    throw new Error("get_deployment_target not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_deployment_target failed");
  }
}

/** Get on premises instance. */
export async function getOnPremisesInstance(instanceName: string, regionName?: string): Promise<GetOnPremisesInstanceResult> {
  try {
    // TODO: implement get_on_premises_instance
    throw new Error("get_on_premises_instance not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_on_premises_instance failed");
  }
}

/** List deployment configs. */
export async function listDeploymentConfigs(): Promise<ListDeploymentConfigsResult> {
  try {
    // TODO: implement list_deployment_configs
    throw new Error("list_deployment_configs not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_deployment_configs failed");
  }
}

/** List deployment instances. */
export async function listDeploymentInstances(deploymentId: string): Promise<ListDeploymentInstancesResult> {
  try {
    // TODO: implement list_deployment_instances
    throw new Error("list_deployment_instances not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_deployment_instances failed");
  }
}

/** List deployment targets. */
export async function listDeploymentTargets(deploymentId: string): Promise<ListDeploymentTargetsResult> {
  try {
    // TODO: implement list_deployment_targets
    throw new Error("list_deployment_targets not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_deployment_targets failed");
  }
}

/** List git hub account token names. */
export async function listGitHubAccountTokenNames(): Promise<ListGitHubAccountTokenNamesResult> {
  try {
    // TODO: implement list_git_hub_account_token_names
    throw new Error("list_git_hub_account_token_names not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_git_hub_account_token_names failed");
  }
}

/** List on premises instances. */
export async function listOnPremisesInstances(): Promise<ListOnPremisesInstancesResult> {
  try {
    // TODO: implement list_on_premises_instances
    throw new Error("list_on_premises_instances not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_on_premises_instances failed");
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

/** Put lifecycle event hook execution status. */
export async function putLifecycleEventHookExecutionStatus(): Promise<PutLifecycleEventHookExecutionStatusResult> {
  try {
    // TODO: implement put_lifecycle_event_hook_execution_status
    throw new Error("put_lifecycle_event_hook_execution_status not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_lifecycle_event_hook_execution_status failed");
  }
}

/** Register on premises instance. */
export async function registerOnPremisesInstance(instanceName: string): Promise<void> {
  try {
    // TODO: implement register_on_premises_instance
    throw new Error("register_on_premises_instance not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "register_on_premises_instance failed");
  }
}

/** Remove tags from on premises instances. */
export async function removeTagsFromOnPremisesInstances(tags: Record<string, unknown>[], instanceNames: string[], regionName?: string): Promise<void> {
  try {
    // TODO: implement remove_tags_from_on_premises_instances
    throw new Error("remove_tags_from_on_premises_instances not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "remove_tags_from_on_premises_instances failed");
  }
}

/** Skip wait time for instance termination. */
export async function skipWaitTimeForInstanceTermination(): Promise<void> {
  try {
    // TODO: implement skip_wait_time_for_instance_termination
    throw new Error("skip_wait_time_for_instance_termination not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "skip_wait_time_for_instance_termination failed");
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

/** Update application. */
export async function updateApplication(): Promise<void> {
  try {
    // TODO: implement update_application
    throw new Error("update_application not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_application failed");
  }
}

/** Update deployment group. */
export async function updateDeploymentGroup(applicationName: string, currentDeploymentGroupName: string): Promise<UpdateDeploymentGroupResult> {
  try {
    // TODO: implement update_deployment_group
    throw new Error("update_deployment_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_deployment_group failed");
  }
}
