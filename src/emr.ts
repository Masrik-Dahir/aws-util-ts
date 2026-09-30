import { EmrClient } from "@aws-sdk/client-emr";
import { getClient } from "./client";
import { wrapAwsError } from "./exceptions";

/** Metadata for an EMR cluster. */
export type ClusterResult = {
  clusterId: string;
  name: string;
  status: string;
  stateChangeReason?: Record<string, unknown>;
  normalizedInstanceHours?: number;
  logUri?: string;
  releaseLabel?: string;
  autoTerminate?: boolean;
  terminationProtected?: boolean;
  tags?: Record<string, unknown>[];
  extra?: Record<string, unknown>;
};

/** Metadata for an EMR step. */
export type StepResult = {
  stepId: string;
  name: string;
  status: string;
  actionOnFailure?: string;
  extra?: Record<string, unknown>;
};

/** Metadata for an EMR instance group. */
export type InstanceGroupResult = {
  instanceGroupId: string;
  name: string;
  market: string;
  instanceRole: string;
  instanceType: string;
  requestedInstanceCount?: number;
  runningInstanceCount?: number;
  status: string;
  extra?: Record<string, unknown>;
};

/** Metadata for an EMR security configuration. */
export type SecurityConfigurationResult = {
  name: string;
  creationDateTime?: string;
  extra?: Record<string, unknown>;
};

/** Metadata for an EMR bootstrap action. */
export type BootstrapActionResult = {
  name: string;
  scriptPath: string;
  args?: string[];
  extra?: Record<string, unknown>;
};

/** Result of add_instance_fleet. */
export type AddInstanceFleetResult = {
  clusterId?: string;
  instanceFleetId?: string;
  clusterArn?: string;
};

/** Result of cancel_steps. */
export type CancelStepsResult = {
  cancelStepsInfoList?: Record<string, unknown>[];
};

/** Result of create_persistent_app_ui. */
export type CreatePersistentAppUiResult = {
  persistentAppUiId?: string;
  runtimeRoleEnabledCluster?: boolean;
};

/** Result of create_studio. */
export type CreateStudioResult = {
  studioId?: string;
  url?: string;
};

/** Result of describe_job_flows. */
export type DescribeJobFlowsResult = {
  jobFlows?: Record<string, unknown>[];
};

/** Result of describe_notebook_execution. */
export type DescribeNotebookExecutionResult = {
  notebookExecution?: Record<string, unknown>;
};

/** Result of describe_persistent_app_ui. */
export type DescribePersistentAppUiResult = {
  persistentAppUi?: Record<string, unknown>;
};

/** Result of describe_release_label. */
export type DescribeReleaseLabelResult = {
  releaseLabel?: string;
  applications?: Record<string, unknown>[];
  nextToken?: string;
  availableOsReleases?: Record<string, unknown>[];
};

/** Result of describe_security_configuration. */
export type DescribeSecurityConfigurationResult = {
  name?: string;
  securityConfiguration?: string;
  creationDateTime?: string;
};

/** Result of describe_studio. */
export type DescribeStudioResult = {
  studio?: Record<string, unknown>;
};

/** Result of get_auto_termination_policy. */
export type GetAutoTerminationPolicyResult = {
  autoTerminationPolicy?: Record<string, unknown>;
};

/** Result of get_block_public_access_configuration. */
export type GetBlockPublicAccessConfigurationResult = {
  blockPublicAccessConfiguration?: Record<string, unknown>;
  blockPublicAccessConfigurationMetadata?: Record<string, unknown>;
};

/** Result of get_cluster_session_credentials. */
export type GetClusterSessionCredentialsResult = {
  credentials?: Record<string, unknown>;
  expiresAt?: string;
};

/** Result of get_managed_scaling_policy. */
export type GetManagedScalingPolicyResult = {
  managedScalingPolicy?: Record<string, unknown>;
};

/** Result of get_on_cluster_app_ui_presigned_url. */
export type GetOnClusterAppUiPresignedUrlResult = {
  presignedUrlReady?: boolean;
  presignedUrl?: string;
};

/** Result of get_persistent_app_ui_presigned_url. */
export type GetPersistentAppUiPresignedUrlResult = {
  presignedUrlReady?: boolean;
  presignedUrl?: string;
};

/** Result of get_studio_session_mapping. */
export type GetStudioSessionMappingResult = {
  sessionMapping?: Record<string, unknown>;
};

/** Result of list_instance_fleets. */
export type ListInstanceFleetsResult = {
  instanceFleets?: Record<string, unknown>[];
  marker?: string;
};

/** Result of list_instances. */
export type ListInstancesResult = {
  instances?: Record<string, unknown>[];
  marker?: string;
};

/** Result of list_notebook_executions. */
export type ListNotebookExecutionsResult = {
  notebookExecutions?: Record<string, unknown>[];
  marker?: string;
};

/** Result of list_release_labels. */
export type ListReleaseLabelsResult = {
  releaseLabels?: string[];
  nextToken?: string;
};

/** Result of list_studio_session_mappings. */
export type ListStudioSessionMappingsResult = {
  sessionMappings?: Record<string, unknown>[];
  marker?: string;
};

/** Result of list_studios. */
export type ListStudiosResult = {
  studios?: Record<string, unknown>[];
  marker?: string;
};

/** Result of list_supported_instance_types. */
export type ListSupportedInstanceTypesResult = {
  supportedInstanceTypes?: Record<string, unknown>[];
  marker?: string;
};

/** Result of modify_cluster. */
export type ModifyClusterResult = {
  stepConcurrencyLevel?: number;
  extendedSupport?: boolean;
};

/** Result of start_notebook_execution. */
export type StartNotebookExecutionResult = {
  notebookExecutionId?: string;
};

/** Launch a new EMR cluster (job flow). */
export async function runJobFlow(name: string): Promise<string> {
  try {
    // TODO: implement run_job_flow
    throw new Error("run_job_flow not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "run_job_flow failed");
  }
}

/** Describe an EMR cluster. */
export async function describeCluster(clusterId: string): Promise<ClusterResult> {
  try {
    // TODO: implement describe_cluster
    throw new Error("describe_cluster not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_cluster failed");
  }
}

/** List EMR clusters, optionally filtered by state. */
export async function listClusters(): Promise<ClusterResult[]> {
  try {
    // TODO: implement list_clusters
    throw new Error("list_clusters not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_clusters failed");
  }
}

/** Terminate one or more EMR clusters. */
export async function terminateJobFlows(jobFlowIds: string[]): Promise<void> {
  try {
    // TODO: implement terminate_job_flows
    throw new Error("terminate_job_flows not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "terminate_job_flows failed");
  }
}

/** Add steps to a running EMR cluster. */
export async function addJobFlowSteps(jobFlowId: string, steps: Record<string, unknown>[]): Promise<string[]> {
  try {
    // TODO: implement add_job_flow_steps
    throw new Error("add_job_flow_steps not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "add_job_flow_steps failed");
  }
}

/** List steps for an EMR cluster. */
export async function listSteps(clusterId: string): Promise<StepResult[]> {
  try {
    // TODO: implement list_steps
    throw new Error("list_steps not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_steps failed");
  }
}

/** Describe a specific step on an EMR cluster. */
export async function describeStep(clusterId: string, stepId: string): Promise<StepResult> {
  try {
    // TODO: implement describe_step
    throw new Error("describe_step not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_step failed");
  }
}

/** Add instance groups to an EMR cluster. */
export async function addInstanceGroups(jobFlowId: string, instanceGroups: Record<string, unknown>[]): Promise<string[]> {
  try {
    // TODO: implement add_instance_groups
    throw new Error("add_instance_groups not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "add_instance_groups failed");
  }
}

/** List instance groups for an EMR cluster. */
export async function listInstanceGroups(clusterId: string): Promise<InstanceGroupResult[]> {
  try {
    // TODO: implement list_instance_groups
    throw new Error("list_instance_groups not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_instance_groups failed");
  }
}

/** Modify instance groups on an EMR cluster. */
export async function modifyInstanceGroups(instanceGroups: Record<string, unknown>[]): Promise<void> {
  try {
    // TODO: implement modify_instance_groups
    throw new Error("modify_instance_groups not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_instance_groups failed");
  }
}

/** Create an EMR security configuration. */
export async function createSecurityConfiguration(name: string, securityConfiguration: string): Promise<SecurityConfigurationResult> {
  try {
    // TODO: implement create_security_configuration
    throw new Error("create_security_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_security_configuration failed");
  }
}

/** List EMR security configurations. */
export async function listSecurityConfigurations(): Promise<SecurityConfigurationResult[]> {
  try {
    // TODO: implement list_security_configurations
    throw new Error("list_security_configurations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_security_configurations failed");
  }
}

/** Enable or disable termination protection for EMR clusters. */
export async function setTerminationProtection(jobFlowIds: string[], terminationProtected: boolean): Promise<void> {
  try {
    // TODO: implement set_termination_protection
    throw new Error("set_termination_protection not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "set_termination_protection failed");
  }
}

/** Attach an auto-scaling policy to an EMR instance group. */
export async function putAutoScalingPolicy(clusterId: string, instanceGroupId: string, autoScalingPolicy: Record<string, unknown>): Promise<Record<string, unknown>> {
  try {
    // TODO: implement put_auto_scaling_policy
    throw new Error("put_auto_scaling_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_auto_scaling_policy failed");
  }
}

/** List bootstrap actions for an EMR cluster. */
export async function listBootstrapActions(clusterId: string): Promise<BootstrapActionResult[]> {
  try {
    // TODO: implement list_bootstrap_actions
    throw new Error("list_bootstrap_actions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_bootstrap_actions failed");
  }
}

/** Poll until an EMR cluster reaches WAITING/RUNNING or a terminal state. */
export async function waitForCluster(clusterId: string): Promise<ClusterResult> {
  try {
    // TODO: implement wait_for_cluster
    throw new Error("wait_for_cluster not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "wait_for_cluster failed");
  }
}

/** Launch an EMR cluster and wait until it is ready. */
export async function runAndWait(name: string): Promise<ClusterResult> {
  try {
    // TODO: implement run_and_wait
    throw new Error("run_and_wait not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "run_and_wait failed");
  }
}

/** Add instance fleet. */
export async function addInstanceFleet(clusterId: string, instanceFleet: Record<string, unknown>, regionName?: string): Promise<AddInstanceFleetResult> {
  try {
    // TODO: implement add_instance_fleet
    throw new Error("add_instance_fleet not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "add_instance_fleet failed");
  }
}

/** Add tags. */
export async function addTags(resourceId: string, tags: Record<string, unknown>[], regionName?: string): Promise<void> {
  try {
    // TODO: implement add_tags
    throw new Error("add_tags not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "add_tags failed");
  }
}

/** Cancel steps. */
export async function cancelSteps(clusterId: string, stepIds: string[]): Promise<CancelStepsResult> {
  try {
    // TODO: implement cancel_steps
    throw new Error("cancel_steps not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "cancel_steps failed");
  }
}

/** Create persistent app ui. */
export async function createPersistentAppUi(targetResourceArn: string): Promise<CreatePersistentAppUiResult> {
  try {
    // TODO: implement create_persistent_app_ui
    throw new Error("create_persistent_app_ui not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_persistent_app_ui failed");
  }
}

/** Create studio. */
export async function createStudio(name: string, authMode: string, vpcId: string, subnetIds: string[], serviceRole: string, workspaceSecurityGroupId: string, engineSecurityGroupId: string, defaultS3Location: string): Promise<CreateStudioResult> {
  try {
    // TODO: implement create_studio
    throw new Error("create_studio not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_studio failed");
  }
}

/** Create studio session mapping. */
export async function createStudioSessionMapping(studioId: string, identityType: string, sessionPolicyArn: string): Promise<void> {
  try {
    // TODO: implement create_studio_session_mapping
    throw new Error("create_studio_session_mapping not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_studio_session_mapping failed");
  }
}

/** Delete security configuration. */
export async function deleteSecurityConfiguration(name: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_security_configuration
    throw new Error("delete_security_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_security_configuration failed");
  }
}

/** Delete studio. */
export async function deleteStudio(studioId: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_studio
    throw new Error("delete_studio not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_studio failed");
  }
}

/** Delete studio session mapping. */
export async function deleteStudioSessionMapping(studioId: string, identityType: string): Promise<void> {
  try {
    // TODO: implement delete_studio_session_mapping
    throw new Error("delete_studio_session_mapping not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_studio_session_mapping failed");
  }
}

/** Describe job flows. */
export async function describeJobFlows(): Promise<DescribeJobFlowsResult> {
  try {
    // TODO: implement describe_job_flows
    throw new Error("describe_job_flows not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_job_flows failed");
  }
}

/** Describe notebook execution. */
export async function describeNotebookExecution(notebookExecutionId: string, regionName?: string): Promise<DescribeNotebookExecutionResult> {
  try {
    // TODO: implement describe_notebook_execution
    throw new Error("describe_notebook_execution not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_notebook_execution failed");
  }
}

/** Describe persistent app ui. */
export async function describePersistentAppUi(persistentAppUiId: string, regionName?: string): Promise<DescribePersistentAppUiResult> {
  try {
    // TODO: implement describe_persistent_app_ui
    throw new Error("describe_persistent_app_ui not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_persistent_app_ui failed");
  }
}

/** Describe release label. */
export async function describeReleaseLabel(): Promise<DescribeReleaseLabelResult> {
  try {
    // TODO: implement describe_release_label
    throw new Error("describe_release_label not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_release_label failed");
  }
}

/** Describe security configuration. */
export async function describeSecurityConfiguration(name: string, regionName?: string): Promise<DescribeSecurityConfigurationResult> {
  try {
    // TODO: implement describe_security_configuration
    throw new Error("describe_security_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_security_configuration failed");
  }
}

/** Describe studio. */
export async function describeStudio(studioId: string, regionName?: string): Promise<DescribeStudioResult> {
  try {
    // TODO: implement describe_studio
    throw new Error("describe_studio not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_studio failed");
  }
}

/** Get auto termination policy. */
export async function getAutoTerminationPolicy(clusterId: string, regionName?: string): Promise<GetAutoTerminationPolicyResult> {
  try {
    // TODO: implement get_auto_termination_policy
    throw new Error("get_auto_termination_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_auto_termination_policy failed");
  }
}

/** Get block public access configuration. */
export async function getBlockPublicAccessConfiguration(regionName?: string): Promise<GetBlockPublicAccessConfigurationResult> {
  try {
    // TODO: implement get_block_public_access_configuration
    throw new Error("get_block_public_access_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_block_public_access_configuration failed");
  }
}

/** Get cluster session credentials. */
export async function getClusterSessionCredentials(clusterId: string): Promise<GetClusterSessionCredentialsResult> {
  try {
    // TODO: implement get_cluster_session_credentials
    throw new Error("get_cluster_session_credentials not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_cluster_session_credentials failed");
  }
}

/** Get managed scaling policy. */
export async function getManagedScalingPolicy(clusterId: string, regionName?: string): Promise<GetManagedScalingPolicyResult> {
  try {
    // TODO: implement get_managed_scaling_policy
    throw new Error("get_managed_scaling_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_managed_scaling_policy failed");
  }
}

/** Get on cluster app ui presigned url. */
export async function getOnClusterAppUiPresignedUrl(clusterId: string): Promise<GetOnClusterAppUiPresignedUrlResult> {
  try {
    // TODO: implement get_on_cluster_app_ui_presigned_url
    throw new Error("get_on_cluster_app_ui_presigned_url not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_on_cluster_app_ui_presigned_url failed");
  }
}

/** Get persistent app ui presigned url. */
export async function getPersistentAppUiPresignedUrl(persistentAppUiId: string): Promise<GetPersistentAppUiPresignedUrlResult> {
  try {
    // TODO: implement get_persistent_app_ui_presigned_url
    throw new Error("get_persistent_app_ui_presigned_url not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_persistent_app_ui_presigned_url failed");
  }
}

/** Get studio session mapping. */
export async function getStudioSessionMapping(studioId: string, identityType: string): Promise<GetStudioSessionMappingResult> {
  try {
    // TODO: implement get_studio_session_mapping
    throw new Error("get_studio_session_mapping not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_studio_session_mapping failed");
  }
}

/** List instance fleets. */
export async function listInstanceFleets(clusterId: string): Promise<ListInstanceFleetsResult> {
  try {
    // TODO: implement list_instance_fleets
    throw new Error("list_instance_fleets not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_instance_fleets failed");
  }
}

/** List instances. */
export async function listInstances(clusterId: string): Promise<ListInstancesResult> {
  try {
    // TODO: implement list_instances
    throw new Error("list_instances not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_instances failed");
  }
}

/** List notebook executions. */
export async function listNotebookExecutions(): Promise<ListNotebookExecutionsResult> {
  try {
    // TODO: implement list_notebook_executions
    throw new Error("list_notebook_executions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_notebook_executions failed");
  }
}

/** List release labels. */
export async function listReleaseLabels(): Promise<ListReleaseLabelsResult> {
  try {
    // TODO: implement list_release_labels
    throw new Error("list_release_labels not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_release_labels failed");
  }
}

/** List studio session mappings. */
export async function listStudioSessionMappings(): Promise<ListStudioSessionMappingsResult> {
  try {
    // TODO: implement list_studio_session_mappings
    throw new Error("list_studio_session_mappings not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_studio_session_mappings failed");
  }
}

/** List studios. */
export async function listStudios(): Promise<ListStudiosResult> {
  try {
    // TODO: implement list_studios
    throw new Error("list_studios not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_studios failed");
  }
}

/** List supported instance types. */
export async function listSupportedInstanceTypes(releaseLabel: string): Promise<ListSupportedInstanceTypesResult> {
  try {
    // TODO: implement list_supported_instance_types
    throw new Error("list_supported_instance_types not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_supported_instance_types failed");
  }
}

/** Modify cluster. */
export async function modifyCluster(clusterId: string): Promise<ModifyClusterResult> {
  try {
    // TODO: implement modify_cluster
    throw new Error("modify_cluster not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_cluster failed");
  }
}

/** Modify instance fleet. */
export async function modifyInstanceFleet(clusterId: string, instanceFleet: Record<string, unknown>, regionName?: string): Promise<void> {
  try {
    // TODO: implement modify_instance_fleet
    throw new Error("modify_instance_fleet not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_instance_fleet failed");
  }
}

/** Put auto termination policy. */
export async function putAutoTerminationPolicy(clusterId: string): Promise<void> {
  try {
    // TODO: implement put_auto_termination_policy
    throw new Error("put_auto_termination_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_auto_termination_policy failed");
  }
}

/** Put block public access configuration. */
export async function putBlockPublicAccessConfiguration(blockPublicAccessConfiguration: Record<string, unknown>, regionName?: string): Promise<void> {
  try {
    // TODO: implement put_block_public_access_configuration
    throw new Error("put_block_public_access_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_block_public_access_configuration failed");
  }
}

/** Put managed scaling policy. */
export async function putManagedScalingPolicy(clusterId: string, managedScalingPolicy: Record<string, unknown>, regionName?: string): Promise<void> {
  try {
    // TODO: implement put_managed_scaling_policy
    throw new Error("put_managed_scaling_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_managed_scaling_policy failed");
  }
}

/** Remove auto scaling policy. */
export async function removeAutoScalingPolicy(clusterId: string, instanceGroupId: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement remove_auto_scaling_policy
    throw new Error("remove_auto_scaling_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "remove_auto_scaling_policy failed");
  }
}

/** Remove auto termination policy. */
export async function removeAutoTerminationPolicy(clusterId: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement remove_auto_termination_policy
    throw new Error("remove_auto_termination_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "remove_auto_termination_policy failed");
  }
}

/** Remove managed scaling policy. */
export async function removeManagedScalingPolicy(clusterId: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement remove_managed_scaling_policy
    throw new Error("remove_managed_scaling_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "remove_managed_scaling_policy failed");
  }
}

/** Remove tags. */
export async function removeTags(resourceId: string, tagKeys: string[], regionName?: string): Promise<void> {
  try {
    // TODO: implement remove_tags
    throw new Error("remove_tags not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "remove_tags failed");
  }
}

/** Set keep job flow alive when no steps. */
export async function setKeepJobFlowAliveWhenNoSteps(jobFlowIds: string[], keepJobFlowAliveWhenNoSteps: boolean, regionName?: string): Promise<void> {
  try {
    // TODO: implement set_keep_job_flow_alive_when_no_steps
    throw new Error("set_keep_job_flow_alive_when_no_steps not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "set_keep_job_flow_alive_when_no_steps failed");
  }
}

/** Set unhealthy node replacement. */
export async function setUnhealthyNodeReplacement(jobFlowIds: string[], unhealthyNodeReplacement: boolean, regionName?: string): Promise<void> {
  try {
    // TODO: implement set_unhealthy_node_replacement
    throw new Error("set_unhealthy_node_replacement not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "set_unhealthy_node_replacement failed");
  }
}

/** Set visible to all users. */
export async function setVisibleToAllUsers(jobFlowIds: string[], visibleToAllUsers: boolean, regionName?: string): Promise<void> {
  try {
    // TODO: implement set_visible_to_all_users
    throw new Error("set_visible_to_all_users not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "set_visible_to_all_users failed");
  }
}

/** Start notebook execution. */
export async function startNotebookExecution(executionEngine: Record<string, unknown>, serviceRole: string): Promise<StartNotebookExecutionResult> {
  try {
    // TODO: implement start_notebook_execution
    throw new Error("start_notebook_execution not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_notebook_execution failed");
  }
}

/** Stop notebook execution. */
export async function stopNotebookExecution(notebookExecutionId: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement stop_notebook_execution
    throw new Error("stop_notebook_execution not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "stop_notebook_execution failed");
  }
}

/** Update studio. */
export async function updateStudio(studioId: string): Promise<void> {
  try {
    // TODO: implement update_studio
    throw new Error("update_studio not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_studio failed");
  }
}

/** Update studio session mapping. */
export async function updateStudioSessionMapping(studioId: string, identityType: string, sessionPolicyArn: string): Promise<void> {
  try {
    // TODO: implement update_studio_session_mapping
    throw new Error("update_studio_session_mapping not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_studio_session_mapping failed");
  }
}
