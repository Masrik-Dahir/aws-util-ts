import { wrapAwsError } from "./exceptions";

/** Metadata for an Auto Scaling group. */
export type AutoScalingGroupResult = {
  name: string;
  arn: string;
  launchConfigName?: string;
  launchTemplate?: Record<string, unknown>;
  minSize: number;
  maxSize: number;
  desiredCapacity: number;
  availabilityZones: string[];
  status?: string;
  instances?: Record<string, unknown>[];
  tags?: Record<string, unknown>;
  extra?: Record<string, unknown>;
};

/** Metadata for a launch configuration. */
export type LaunchConfigurationResult = {
  name: string;
  imageId: string;
  instanceType: string;
  keyName?: string;
  securityGroups?: string[];
  createdTime: string;
  extra?: Record<string, unknown>;
};

/** Metadata for a scaling policy. */
export type ScalingPolicyResult = {
  policyName: string;
  policyArn: string;
  policyType: string;
  adjustmentType?: string;
  scalingAdjustment?: number;
  targetTrackingConfig?: Record<string, unknown>;
  extra?: Record<string, unknown>;
};

/** Metadata for a lifecycle hook. */
export type LifecycleHookResult = {
  hookName: string;
  asgName: string;
  lifecycleTransition: string;
  heartbeatTimeout?: number;
  defaultResult?: string;
  extra?: Record<string, unknown>;
};

/** Metadata for a scaling activity. */
export type ScalingActivityResult = {
  activityId: string;
  asgName: string;
  cause: string;
  description?: string;
  statusCode: string;
  startTime: string;
  endTime?: string;
  extra?: Record<string, unknown>;
};

/** Result of batch_delete_scheduled_action. */
export type BatchDeleteScheduledActionResult = {
  failedScheduledActions?: Record<string, unknown>[];
};

/** Result of batch_put_scheduled_update_group_action. */
export type BatchPutScheduledUpdateGroupActionResult = {
  failedScheduledUpdateGroupActions?: Record<string, unknown>[];
};

/** Result of cancel_instance_refresh. */
export type CancelInstanceRefreshResult = {
  instanceRefreshId?: string;
};

/** Result of describe_account_limits. */
export type DescribeAccountLimitsResult = {
  maxNumberOfAutoScalingGroups?: number;
  maxNumberOfLaunchConfigurations?: number;
  numberOfAutoScalingGroups?: number;
  numberOfLaunchConfigurations?: number;
};

/** Result of describe_adjustment_types. */
export type DescribeAdjustmentTypesResult = {
  adjustmentTypes?: Record<string, unknown>[];
};

/** Result of describe_auto_scaling_notification_types. */
export type DescribeAutoScalingNotificationTypesResult = {
  autoScalingNotificationTypes?: string[];
};

/** Result of describe_instance_refreshes. */
export type DescribeInstanceRefreshesResult = {
  instanceRefreshes?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of describe_lifecycle_hook_types. */
export type DescribeLifecycleHookTypesResult = {
  lifecycleHookTypes?: string[];
};

/** Result of describe_load_balancer_target_groups. */
export type DescribeLoadBalancerTargetGroupsResult = {
  loadBalancerTargetGroups?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of describe_load_balancers. */
export type DescribeLoadBalancersResult = {
  loadBalancers?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of describe_metric_collection_types. */
export type DescribeMetricCollectionTypesResult = {
  metrics?: Record<string, unknown>[];
  granularities?: Record<string, unknown>[];
};

/** Result of describe_notification_configurations. */
export type DescribeNotificationConfigurationsResult = {
  notificationConfigurations?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of describe_policies. */
export type DescribePoliciesResult = {
  scalingPolicies?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of describe_scaling_process_types. */
export type DescribeScalingProcessTypesResult = {
  processes?: Record<string, unknown>[];
};

/** Result of describe_scheduled_actions. */
export type DescribeScheduledActionsResult = {
  scheduledUpdateGroupActions?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of describe_tags. */
export type DescribeTagsResult = {
  tags?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of describe_termination_policy_types. */
export type DescribeTerminationPolicyTypesResult = {
  terminationPolicyTypes?: string[];
};

/** Result of describe_traffic_sources. */
export type DescribeTrafficSourcesResult = {
  trafficSources?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of describe_warm_pool. */
export type DescribeWarmPoolResult = {
  warmPoolConfiguration?: Record<string, unknown>;
  instances?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of detach_instances. */
export type DetachInstancesResult = {
  activities?: Record<string, unknown>[];
};

/** Result of enter_standby. */
export type EnterStandbyResult = {
  activities?: Record<string, unknown>[];
};

/** Result of exit_standby. */
export type ExitStandbyResult = {
  activities?: Record<string, unknown>[];
};

/** Result of get_predictive_scaling_forecast. */
export type GetPredictiveScalingForecastResult = {
  loadForecast?: Record<string, unknown>[];
  capacityForecast?: Record<string, unknown>;
  updateTime?: string;
};

/** Result of rollback_instance_refresh. */
export type RollbackInstanceRefreshResult = {
  instanceRefreshId?: string;
};

/** Result of start_instance_refresh. */
export type StartInstanceRefreshResult = {
  instanceRefreshId?: string;
};

/** Create a launch configuration. */
export async function createLaunchConfiguration(name: string): Promise<void> {
  try {
    // TODO: implement create_launch_configuration
    throw new Error("create_launch_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_launch_configuration failed");
  }
}

/** Describe one or more launch configurations. */
export async function describeLaunchConfigurations(): Promise<LaunchConfigurationResult[]> {
  try {
    // TODO: implement describe_launch_configurations
    throw new Error("describe_launch_configurations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_launch_configurations failed");
  }
}

/** Delete a launch configuration. */
export async function deleteLaunchConfiguration(name: string): Promise<void> {
  try {
    // TODO: implement delete_launch_configuration
    throw new Error("delete_launch_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_launch_configuration failed");
  }
}

/** Create an Auto Scaling group. */
export async function createAutoScalingGroup(name: string): Promise<void> {
  try {
    // TODO: implement create_auto_scaling_group
    throw new Error("create_auto_scaling_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_auto_scaling_group failed");
  }
}

/** Describe one or more Auto Scaling groups. */
export async function describeAutoScalingGroups(): Promise<AutoScalingGroupResult[]> {
  try {
    // TODO: implement describe_auto_scaling_groups
    throw new Error("describe_auto_scaling_groups not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_auto_scaling_groups failed");
  }
}

/** Update an Auto Scaling group's size parameters. */
export async function updateAutoScalingGroup(name: string): Promise<void> {
  try {
    // TODO: implement update_auto_scaling_group
    throw new Error("update_auto_scaling_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_auto_scaling_group failed");
  }
}

/** Delete an Auto Scaling group. */
export async function deleteAutoScalingGroup(name: string): Promise<void> {
  try {
    // TODO: implement delete_auto_scaling_group
    throw new Error("delete_auto_scaling_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_auto_scaling_group failed");
  }
}

/** Set the desired capacity for an Auto Scaling group. */
export async function setDesiredCapacity(name: string): Promise<void> {
  try {
    // TODO: implement set_desired_capacity
    throw new Error("set_desired_capacity not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "set_desired_capacity failed");
  }
}

/** Create or update a scaling policy. */
export async function putScalingPolicy(asgName: string, policyName: string): Promise<ScalingPolicyResult> {
  try {
    // TODO: implement put_scaling_policy
    throw new Error("put_scaling_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_scaling_policy failed");
  }
}

/** Describe scaling policies for an Auto Scaling group. */
export async function describeScalingPolicies(asgName: string): Promise<ScalingPolicyResult[]> {
  try {
    // TODO: implement describe_scaling_policies
    throw new Error("describe_scaling_policies not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_scaling_policies failed");
  }
}

/** Delete a scaling policy. */
export async function deletePolicy(asgName: string, policyName: string): Promise<void> {
  try {
    // TODO: implement delete_policy
    throw new Error("delete_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_policy failed");
  }
}

/** Attach ALB/NLB target groups to an Auto Scaling group. */
export async function attachLoadBalancerTargetGroups(asgName: string): Promise<void> {
  try {
    // TODO: implement attach_load_balancer_target_groups
    throw new Error("attach_load_balancer_target_groups not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "attach_load_balancer_target_groups failed");
  }
}

/** Detach ALB/NLB target groups from an Auto Scaling group. */
export async function detachLoadBalancerTargetGroups(asgName: string): Promise<void> {
  try {
    // TODO: implement detach_load_balancer_target_groups
    throw new Error("detach_load_balancer_target_groups not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "detach_load_balancer_target_groups failed");
  }
}

/** Describe Auto Scaling instances. */
export async function describeAutoScalingInstances(): Promise<Record<string, unknown>[]> {
  try {
    // TODO: implement describe_auto_scaling_instances
    throw new Error("describe_auto_scaling_instances not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_auto_scaling_instances failed");
  }
}

/** Terminate an instance in an Auto Scaling group. */
export async function terminateInstanceInAutoScalingGroup(instanceId: string): Promise<Record<string, unknown>> {
  try {
    // TODO: implement terminate_instance_in_auto_scaling_group
    throw new Error("terminate_instance_in_auto_scaling_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "terminate_instance_in_auto_scaling_group failed");
  }
}

/** Create or update a lifecycle hook on an Auto Scaling group. */
export async function putLifecycleHook(asgName: string, hookName: string): Promise<void> {
  try {
    // TODO: implement put_lifecycle_hook
    throw new Error("put_lifecycle_hook not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_lifecycle_hook failed");
  }
}

/** Describe lifecycle hooks for an Auto Scaling group. */
export async function describeLifecycleHooks(asgName: string): Promise<LifecycleHookResult[]> {
  try {
    // TODO: implement describe_lifecycle_hooks
    throw new Error("describe_lifecycle_hooks not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_lifecycle_hooks failed");
  }
}

/** Complete a lifecycle action for an Auto Scaling group. */
export async function completeLifecycleAction(asgName: string, hookName: string): Promise<void> {
  try {
    // TODO: implement complete_lifecycle_action
    throw new Error("complete_lifecycle_action not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "complete_lifecycle_action failed");
  }
}

/** Describe scaling activities for an Auto Scaling group. */
export async function describeScalingActivities(asgName: string): Promise<ScalingActivityResult[]> {
  try {
    // TODO: implement describe_scaling_activities
    throw new Error("describe_scaling_activities not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_scaling_activities failed");
  }
}

/** Suspend scaling processes for an Auto Scaling group. */
export async function suspendProcesses(asgName: string): Promise<void> {
  try {
    // TODO: implement suspend_processes
    throw new Error("suspend_processes not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "suspend_processes failed");
  }
}

/** Resume scaling processes for an Auto Scaling group. */
export async function resumeProcesses(asgName: string): Promise<void> {
  try {
    // TODO: implement resume_processes
    throw new Error("resume_processes not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "resume_processes failed");
  }
}

/** Poll until all instances in an Auto Scaling group are ``InService``. */
export async function waitForGroup(name: string): Promise<AutoScalingGroupResult> {
  try {
    // TODO: implement wait_for_group
    throw new Error("wait_for_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "wait_for_group failed");
  }
}

/** Attach instances. */
export async function attachInstances(autoScalingGroupName: string): Promise<void> {
  try {
    // TODO: implement attach_instances
    throw new Error("attach_instances not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "attach_instances failed");
  }
}

/** Attach load balancers. */
export async function attachLoadBalancers(autoScalingGroupName: string, loadBalancerNames: string[], regionName?: string): Promise<void> {
  try {
    // TODO: implement attach_load_balancers
    throw new Error("attach_load_balancers not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "attach_load_balancers failed");
  }
}

/** Attach traffic sources. */
export async function attachTrafficSources(autoScalingGroupName: string, trafficSources: Record<string, unknown>[]): Promise<void> {
  try {
    // TODO: implement attach_traffic_sources
    throw new Error("attach_traffic_sources not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "attach_traffic_sources failed");
  }
}

/** Batch delete scheduled action. */
export async function batchDeleteScheduledAction(autoScalingGroupName: string, scheduledActionNames: string[], regionName?: string): Promise<BatchDeleteScheduledActionResult> {
  try {
    // TODO: implement batch_delete_scheduled_action
    throw new Error("batch_delete_scheduled_action not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_delete_scheduled_action failed");
  }
}

/** Batch put scheduled update group action. */
export async function batchPutScheduledUpdateGroupAction(autoScalingGroupName: string, scheduledUpdateGroupActions: Record<string, unknown>[], regionName?: string): Promise<BatchPutScheduledUpdateGroupActionResult> {
  try {
    // TODO: implement batch_put_scheduled_update_group_action
    throw new Error("batch_put_scheduled_update_group_action not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_put_scheduled_update_group_action failed");
  }
}

/** Cancel instance refresh. */
export async function cancelInstanceRefresh(autoScalingGroupName: string): Promise<CancelInstanceRefreshResult> {
  try {
    // TODO: implement cancel_instance_refresh
    throw new Error("cancel_instance_refresh not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "cancel_instance_refresh failed");
  }
}

/** Create or update tags. */
export async function createOrUpdateTags(tags: Record<string, unknown>[], regionName?: string): Promise<void> {
  try {
    // TODO: implement create_or_update_tags
    throw new Error("create_or_update_tags not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_or_update_tags failed");
  }
}

/** Delete lifecycle hook. */
export async function deleteLifecycleHook(lifecycleHookName: string, autoScalingGroupName: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_lifecycle_hook
    throw new Error("delete_lifecycle_hook not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_lifecycle_hook failed");
  }
}

/** Delete notification configuration. */
export async function deleteNotificationConfiguration(autoScalingGroupName: string, topicArn: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_notification_configuration
    throw new Error("delete_notification_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_notification_configuration failed");
  }
}

/** Delete scheduled action. */
export async function deleteScheduledAction(autoScalingGroupName: string, scheduledActionName: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_scheduled_action
    throw new Error("delete_scheduled_action not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_scheduled_action failed");
  }
}

/** Delete tags. */
export async function deleteTags(tags: Record<string, unknown>[], regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_tags
    throw new Error("delete_tags not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_tags failed");
  }
}

/** Delete warm pool. */
export async function deleteWarmPool(autoScalingGroupName: string): Promise<void> {
  try {
    // TODO: implement delete_warm_pool
    throw new Error("delete_warm_pool not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_warm_pool failed");
  }
}

/** Describe account limits. */
export async function describeAccountLimits(regionName?: string): Promise<DescribeAccountLimitsResult> {
  try {
    // TODO: implement describe_account_limits
    throw new Error("describe_account_limits not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_account_limits failed");
  }
}

/** Describe adjustment types. */
export async function describeAdjustmentTypes(regionName?: string): Promise<DescribeAdjustmentTypesResult> {
  try {
    // TODO: implement describe_adjustment_types
    throw new Error("describe_adjustment_types not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_adjustment_types failed");
  }
}

/** Describe auto scaling notification types. */
export async function describeAutoScalingNotificationTypes(regionName?: string): Promise<DescribeAutoScalingNotificationTypesResult> {
  try {
    // TODO: implement describe_auto_scaling_notification_types
    throw new Error("describe_auto_scaling_notification_types not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_auto_scaling_notification_types failed");
  }
}

/** Describe instance refreshes. */
export async function describeInstanceRefreshes(autoScalingGroupName: string): Promise<DescribeInstanceRefreshesResult> {
  try {
    // TODO: implement describe_instance_refreshes
    throw new Error("describe_instance_refreshes not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_instance_refreshes failed");
  }
}

/** Describe lifecycle hook types. */
export async function describeLifecycleHookTypes(regionName?: string): Promise<DescribeLifecycleHookTypesResult> {
  try {
    // TODO: implement describe_lifecycle_hook_types
    throw new Error("describe_lifecycle_hook_types not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_lifecycle_hook_types failed");
  }
}

/** Describe load balancer target groups. */
export async function describeLoadBalancerTargetGroups(autoScalingGroupName: string): Promise<DescribeLoadBalancerTargetGroupsResult> {
  try {
    // TODO: implement describe_load_balancer_target_groups
    throw new Error("describe_load_balancer_target_groups not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_load_balancer_target_groups failed");
  }
}

/** Describe load balancers. */
export async function describeLoadBalancers(autoScalingGroupName: string): Promise<DescribeLoadBalancersResult> {
  try {
    // TODO: implement describe_load_balancers
    throw new Error("describe_load_balancers not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_load_balancers failed");
  }
}

/** Describe metric collection types. */
export async function describeMetricCollectionTypes(regionName?: string): Promise<DescribeMetricCollectionTypesResult> {
  try {
    // TODO: implement describe_metric_collection_types
    throw new Error("describe_metric_collection_types not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_metric_collection_types failed");
  }
}

/** Describe notification configurations. */
export async function describeNotificationConfigurations(): Promise<DescribeNotificationConfigurationsResult> {
  try {
    // TODO: implement describe_notification_configurations
    throw new Error("describe_notification_configurations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_notification_configurations failed");
  }
}

/** Describe policies. */
export async function describePolicies(): Promise<DescribePoliciesResult> {
  try {
    // TODO: implement describe_policies
    throw new Error("describe_policies not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_policies failed");
  }
}

/** Describe scaling process types. */
export async function describeScalingProcessTypes(regionName?: string): Promise<DescribeScalingProcessTypesResult> {
  try {
    // TODO: implement describe_scaling_process_types
    throw new Error("describe_scaling_process_types not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_scaling_process_types failed");
  }
}

/** Describe scheduled actions. */
export async function describeScheduledActions(): Promise<DescribeScheduledActionsResult> {
  try {
    // TODO: implement describe_scheduled_actions
    throw new Error("describe_scheduled_actions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_scheduled_actions failed");
  }
}

/** Describe tags. */
export async function describeTags(): Promise<DescribeTagsResult> {
  try {
    // TODO: implement describe_tags
    throw new Error("describe_tags not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_tags failed");
  }
}

/** Describe termination policy types. */
export async function describeTerminationPolicyTypes(regionName?: string): Promise<DescribeTerminationPolicyTypesResult> {
  try {
    // TODO: implement describe_termination_policy_types
    throw new Error("describe_termination_policy_types not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_termination_policy_types failed");
  }
}

/** Describe traffic sources. */
export async function describeTrafficSources(autoScalingGroupName: string): Promise<DescribeTrafficSourcesResult> {
  try {
    // TODO: implement describe_traffic_sources
    throw new Error("describe_traffic_sources not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_traffic_sources failed");
  }
}

/** Describe warm pool. */
export async function describeWarmPool(autoScalingGroupName: string): Promise<DescribeWarmPoolResult> {
  try {
    // TODO: implement describe_warm_pool
    throw new Error("describe_warm_pool not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_warm_pool failed");
  }
}

/** Detach instances. */
export async function detachInstances(autoScalingGroupName: string, shouldDecrementDesiredCapacity: boolean): Promise<DetachInstancesResult> {
  try {
    // TODO: implement detach_instances
    throw new Error("detach_instances not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "detach_instances failed");
  }
}

/** Detach load balancers. */
export async function detachLoadBalancers(autoScalingGroupName: string, loadBalancerNames: string[], regionName?: string): Promise<void> {
  try {
    // TODO: implement detach_load_balancers
    throw new Error("detach_load_balancers not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "detach_load_balancers failed");
  }
}

/** Detach traffic sources. */
export async function detachTrafficSources(autoScalingGroupName: string, trafficSources: Record<string, unknown>[], regionName?: string): Promise<void> {
  try {
    // TODO: implement detach_traffic_sources
    throw new Error("detach_traffic_sources not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "detach_traffic_sources failed");
  }
}

/** Disable metrics collection. */
export async function disableMetricsCollection(autoScalingGroupName: string): Promise<void> {
  try {
    // TODO: implement disable_metrics_collection
    throw new Error("disable_metrics_collection not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disable_metrics_collection failed");
  }
}

/** Enable metrics collection. */
export async function enableMetricsCollection(autoScalingGroupName: string, granularity: string): Promise<void> {
  try {
    // TODO: implement enable_metrics_collection
    throw new Error("enable_metrics_collection not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "enable_metrics_collection failed");
  }
}

/** Enter standby. */
export async function enterStandby(autoScalingGroupName: string, shouldDecrementDesiredCapacity: boolean): Promise<EnterStandbyResult> {
  try {
    // TODO: implement enter_standby
    throw new Error("enter_standby not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "enter_standby failed");
  }
}

/** Execute policy. */
export async function executePolicy(policyName: string): Promise<void> {
  try {
    // TODO: implement execute_policy
    throw new Error("execute_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "execute_policy failed");
  }
}

/** Exit standby. */
export async function exitStandby(autoScalingGroupName: string): Promise<ExitStandbyResult> {
  try {
    // TODO: implement exit_standby
    throw new Error("exit_standby not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "exit_standby failed");
  }
}

/** Get predictive scaling forecast. */
export async function getPredictiveScalingForecast(autoScalingGroupName: string, policyName: string, startTime: string, endTime: string, regionName?: string): Promise<GetPredictiveScalingForecastResult> {
  try {
    // TODO: implement get_predictive_scaling_forecast
    throw new Error("get_predictive_scaling_forecast not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_predictive_scaling_forecast failed");
  }
}

/** Put notification configuration. */
export async function putNotificationConfiguration(autoScalingGroupName: string, topicArn: string, notificationTypes: string[], regionName?: string): Promise<void> {
  try {
    // TODO: implement put_notification_configuration
    throw new Error("put_notification_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_notification_configuration failed");
  }
}

/** Put scheduled update group action. */
export async function putScheduledUpdateGroupAction(autoScalingGroupName: string, scheduledActionName: string): Promise<void> {
  try {
    // TODO: implement put_scheduled_update_group_action
    throw new Error("put_scheduled_update_group_action not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_scheduled_update_group_action failed");
  }
}

/** Put warm pool. */
export async function putWarmPool(autoScalingGroupName: string): Promise<void> {
  try {
    // TODO: implement put_warm_pool
    throw new Error("put_warm_pool not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_warm_pool failed");
  }
}

/** Record lifecycle action heartbeat. */
export async function recordLifecycleActionHeartbeat(lifecycleHookName: string, autoScalingGroupName: string): Promise<void> {
  try {
    // TODO: implement record_lifecycle_action_heartbeat
    throw new Error("record_lifecycle_action_heartbeat not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "record_lifecycle_action_heartbeat failed");
  }
}

/** Rollback instance refresh. */
export async function rollbackInstanceRefresh(autoScalingGroupName: string, regionName?: string): Promise<RollbackInstanceRefreshResult> {
  try {
    // TODO: implement rollback_instance_refresh
    throw new Error("rollback_instance_refresh not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "rollback_instance_refresh failed");
  }
}

/** Set instance health. */
export async function setInstanceHealth(instanceId: string, healthStatus: string): Promise<void> {
  try {
    // TODO: implement set_instance_health
    throw new Error("set_instance_health not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "set_instance_health failed");
  }
}

/** Set instance protection. */
export async function setInstanceProtection(instanceIds: string[], autoScalingGroupName: string, protectedFromScaleIn: boolean, regionName?: string): Promise<void> {
  try {
    // TODO: implement set_instance_protection
    throw new Error("set_instance_protection not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "set_instance_protection failed");
  }
}

/** Start instance refresh. */
export async function startInstanceRefresh(autoScalingGroupName: string): Promise<StartInstanceRefreshResult> {
  try {
    // TODO: implement start_instance_refresh
    throw new Error("start_instance_refresh not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_instance_refresh failed");
  }
}
