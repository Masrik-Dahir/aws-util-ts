/**
 * aws-util/ecs — High-level Amazon ECS utilities.
 *
 * Provides typed, ergonomic wrappers around the AWS SDK v3 ECS client for
 * common operations: listing clusters, managing tasks and services,
 * describing task definitions, and polling for task/service stability.
 *
 * All functions obtain an ECSClient via {@link getClient} and wrap errors
 * through {@link wrapAwsError}.
 *
 * @module
 */

import { z } from "zod";
import {
  ECSClient,
  ListClustersCommand,
  ListTasksCommand,
  DescribeTasksCommand,
  DescribeServicesCommand,
  DescribeTaskDefinitionCommand,
  RunTaskCommand,
  StopTaskCommand,
  UpdateServiceCommand,
} from "@aws-sdk/client-ecs";
import { getClient } from "./client.js";
import {
  wrapAwsError,
  AwsServiceError,
  AwsTimeoutError,
} from "./exceptions.js";

// ---------------------------------------------------------------------------
// Zod schemas & inferred types
// ---------------------------------------------------------------------------

/** Schema for a container within an ECS task. */
const ECSContainerSchema = z.object({
  name: z.string(),
  lastStatus: z.string().optional(),
  exitCode: z.number().optional(),
});

/** Schema for an ECS task. */
export const ECSTaskSchema = z.object({
  taskArn: z.string(),
  clusterArn: z.string().optional(),
  taskDefinitionArn: z.string().optional(),
  lastStatus: z.string().optional(),
  desiredStatus: z.string().optional(),
  containers: z.array(ECSContainerSchema).optional(),
});
/** Metadata for an ECS task. */
export type ECSTask = z.infer<typeof ECSTaskSchema>;

/** Schema for an ECS service. */
export const ECSServiceSchema = z.object({
  serviceName: z.string(),
  serviceArn: z.string().optional(),
  clusterArn: z.string().optional(),
  status: z.string().optional(),
  desiredCount: z.number().optional(),
  runningCount: z.number().optional(),
  taskDefinition: z.string().optional(),
});
/** Metadata for an ECS service. */
export type ECSService = z.infer<typeof ECSServiceSchema>;

/** Schema for a container definition within a task definition. */
const ContainerDefinitionSchema = z.object({
  name: z.string(),
  image: z.string(),
  cpu: z.number().optional(),
  memory: z.number().optional(),
});

/** Schema for an ECS task definition. */
export const ECSTaskDefinitionSchema = z.object({
  taskDefinitionArn: z.string(),
  family: z.string(),
  revision: z.number(),
  status: z.string().optional(),
  containerDefinitions: z.array(ContainerDefinitionSchema).optional(),
});
/** Metadata for an ECS task definition. */
export type ECSTaskDefinition = z.infer<typeof ECSTaskDefinitionSchema>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Get a cached ECSClient for the given region.
 */
function ecs(region?: string): ECSClient {
  return getClient(ECSClient, region);
}

// ---------------------------------------------------------------------------
// Cluster listing
// ---------------------------------------------------------------------------

/**
 * List all ECS cluster ARNs in the account, auto-paginating.
 *
 * @param region - AWS region override.
 * @returns An array of cluster ARN strings.
 */
export async function listClusters(
  region?: string,
): Promise<string[]> {
  const arns: string[] = [];
  let nextToken: string | undefined;

  try {
    do {
      const resp = await ecs(region).send(
        new ListClustersCommand({ nextToken }),
      );
      arns.push(...(resp.clusterArns ?? []));
      nextToken = resp.nextToken;
    } while (nextToken);
  } catch (err) {
    throw wrapAwsError(err, "listClusters");
  }

  return arns;
}

// ---------------------------------------------------------------------------
// Task operations
// ---------------------------------------------------------------------------

/**
 * List task ARNs in a cluster, optionally filtered by service and status.
 *
 * @param cluster - Cluster name or ARN.
 * @param serviceName - Filter to tasks belonging to a specific service.
 * @param desiredStatus - `"RUNNING"`, `"PENDING"`, or `"STOPPED"`.
 * @param region - AWS region override.
 * @returns An array of task ARN strings.
 */
export async function listTasks(
  cluster: string,
  serviceName?: string,
  desiredStatus?: string,
  region?: string,
): Promise<string[]> {
  const arns: string[] = [];
  let nextToken: string | undefined;

  try {
    do {
      const resp = await ecs(region).send(
        new ListTasksCommand({
          cluster,
          serviceName,
          desiredStatus,
          nextToken,
        }),
      );
      arns.push(...(resp.taskArns ?? []));
      nextToken = resp.nextToken;
    } while (nextToken);
  } catch (err) {
    throw wrapAwsError(err, "listTasks");
  }

  return arns;
}

/**
 * Describe one or more ECS tasks.
 *
 * @param cluster - Cluster name or ARN.
 * @param taskArns - Task ARNs or short IDs (up to 100).
 * @param region - AWS region override.
 * @returns An array of {@link ECSTask} objects.
 */
export async function describeTasks(
  cluster: string,
  taskArns: string[],
  region?: string,
): Promise<ECSTask[]> {
  try {
    const resp = await ecs(region).send(
      new DescribeTasksCommand({ cluster, tasks: taskArns }),
    );
    return (resp.tasks ?? []).map((task) =>
      ECSTaskSchema.parse({
        taskArn: task.taskArn ?? "",
        clusterArn: task.clusterArn ?? undefined,
        taskDefinitionArn: task.taskDefinitionArn ?? undefined,
        lastStatus: task.lastStatus ?? undefined,
        desiredStatus: task.desiredStatus ?? undefined,
        containers: (task.containers ?? []).map((c) => ({
          name: c.name ?? "",
          lastStatus: c.lastStatus ?? undefined,
          exitCode: c.exitCode ?? undefined,
        })),
      }),
    );
  } catch (err) {
    throw wrapAwsError(err, "describeTasks");
  }
}

// ---------------------------------------------------------------------------
// Service operations
// ---------------------------------------------------------------------------

/**
 * Describe one or more ECS services in a cluster.
 *
 * @param cluster - Cluster name or ARN.
 * @param serviceNames - Service names or ARNs (up to 10).
 * @param region - AWS region override.
 * @returns An array of {@link ECSService} objects.
 */
export async function describeServices(
  cluster: string,
  serviceNames: string[],
  region?: string,
): Promise<ECSService[]> {
  try {
    const resp = await ecs(region).send(
      new DescribeServicesCommand({
        cluster,
        services: serviceNames,
      }),
    );
    return (resp.services ?? []).map((svc) =>
      ECSServiceSchema.parse({
        serviceName: svc.serviceName ?? "",
        serviceArn: svc.serviceArn ?? undefined,
        clusterArn: svc.clusterArn ?? undefined,
        status: svc.status ?? undefined,
        desiredCount: svc.desiredCount ?? undefined,
        runningCount: svc.runningCount ?? undefined,
        taskDefinition: svc.taskDefinition ?? undefined,
      }),
    );
  } catch (err) {
    throw wrapAwsError(err, "describeServices");
  }
}

// ---------------------------------------------------------------------------
// Task definition
// ---------------------------------------------------------------------------

/**
 * Describe an ECS task definition.
 *
 * @param taskDefinition - Family:revision string or full ARN.
 * @param region - AWS region override.
 * @returns The {@link ECSTaskDefinition}.
 */
export async function describeTaskDefinition(
  taskDefinition: string,
  region?: string,
): Promise<ECSTaskDefinition> {
  try {
    const resp = await ecs(region).send(
      new DescribeTaskDefinitionCommand({ taskDefinition }),
    );
    const td = resp.taskDefinition;
    return ECSTaskDefinitionSchema.parse({
      taskDefinitionArn: td?.taskDefinitionArn ?? "",
      family: td?.family ?? "",
      revision: td?.revision ?? 0,
      status: td?.status ?? undefined,
      containerDefinitions: (td?.containerDefinitions ?? []).map(
        (cd) => ({
          name: cd.name ?? "",
          image: cd.image ?? "",
          cpu: cd.cpu ?? undefined,
          memory: cd.memory ?? undefined,
        }),
      ),
    });
  } catch (err) {
    throw wrapAwsError(
      err,
      `describeTaskDefinition ${taskDefinition}`,
    );
  }
}

// ---------------------------------------------------------------------------
// Run / stop tasks
// ---------------------------------------------------------------------------

/**
 * Run one or more ECS tasks.
 *
 * @param cluster - Cluster name or ARN.
 * @param taskDefinition - Task definition family:revision or ARN.
 * @param overrides - Optional container overrides.
 * @param networkConfiguration - Optional network configuration for `awsvpc` mode.
 * @param launchType - `"FARGATE"` (default) or `"EC2"`.
 * @param count - Number of tasks to run (default 1).
 * @param region - AWS region override.
 * @returns An array of launched {@link ECSTask} objects.
 */
export async function runTask(
  cluster: string,
  taskDefinition: string,
  overrides?: {
    containerOverrides?: Array<{
      name: string;
      command?: string[];
      environment?: Array<{ name: string; value: string }>;
    }>;
  },
  networkConfiguration?: {
    awsvpcConfiguration: {
      subnets: string[];
      securityGroups?: string[];
      assignPublicIp?: "ENABLED" | "DISABLED";
    };
  },
  launchType?: string,
  count?: number,
  region?: string,
): Promise<ECSTask[]> {
  try {
    const resp = await ecs(region).send(
      new RunTaskCommand({
        cluster,
        taskDefinition,
        launchType: launchType ?? "FARGATE",
        count: count ?? 1,
        overrides: overrides
          ? {
              containerOverrides:
                overrides.containerOverrides?.map((co) => ({
                  name: co.name,
                  command: co.command,
                  environment: co.environment?.map((e) => ({
                    name: e.name,
                    value: e.value,
                  })),
                })),
            }
          : undefined,
        networkConfiguration: networkConfiguration
          ? {
              awsvpcConfiguration: {
                subnets:
                  networkConfiguration.awsvpcConfiguration.subnets,
                securityGroups:
                  networkConfiguration.awsvpcConfiguration
                    .securityGroups,
                assignPublicIp:
                  networkConfiguration.awsvpcConfiguration
                    .assignPublicIp,
              },
            }
          : undefined,
      }),
    );

    if (resp.failures && resp.failures.length > 0) {
      const reasons = resp.failures
        .map((f) => f.reason ?? "unknown")
        .join(", ");
      throw new AwsServiceError(
        `ECS runTask failures: ${reasons}`,
      );
    }

    return (resp.tasks ?? []).map((task) =>
      ECSTaskSchema.parse({
        taskArn: task.taskArn ?? "",
        clusterArn: task.clusterArn ?? undefined,
        taskDefinitionArn: task.taskDefinitionArn ?? undefined,
        lastStatus: task.lastStatus ?? undefined,
        desiredStatus: task.desiredStatus ?? undefined,
        containers: (task.containers ?? []).map((c) => ({
          name: c.name ?? "",
          lastStatus: c.lastStatus ?? undefined,
          exitCode: c.exitCode ?? undefined,
        })),
      }),
    );
  } catch (err) {
    throw wrapAwsError(
      err,
      `runTask on cluster ${cluster}`,
    );
  }
}

/**
 * Stop a running ECS task.
 *
 * @param cluster - Cluster name or ARN.
 * @param taskArn - ARN of the task to stop.
 * @param reason - Human-readable reason for stopping.
 * @param region - AWS region override.
 */
export async function stopTask(
  cluster: string,
  taskArn: string,
  reason?: string,
  region?: string,
): Promise<void> {
  try {
    await ecs(region).send(
      new StopTaskCommand({
        cluster,
        task: taskArn,
        reason: reason ?? "",
      }),
    );
  } catch (err) {
    throw wrapAwsError(err, `stopTask ${taskArn}`);
  }
}

// ---------------------------------------------------------------------------
// Update service
// ---------------------------------------------------------------------------

/**
 * Update an ECS service (scale, deploy new task definition, or force redeploy).
 *
 * @param cluster - Cluster name or ARN.
 * @param serviceName - Service name or ARN.
 * @param desiredCount - New desired task count. `undefined` keeps the
 *   current value.
 * @param taskDefinition - New task definition family:revision or ARN.
 * @param forceNewDeployment - Force a new deployment even if nothing changed.
 * @param region - AWS region override.
 * @returns The updated {@link ECSService}.
 */
export async function updateService(
  cluster: string,
  serviceName: string,
  desiredCount?: number,
  taskDefinition?: string,
  forceNewDeployment?: boolean,
  region?: string,
): Promise<ECSService> {
  try {
    const resp = await ecs(region).send(
      new UpdateServiceCommand({
        cluster,
        service: serviceName,
        desiredCount,
        taskDefinition,
        forceNewDeployment: forceNewDeployment ?? false,
      }),
    );
    const svc = resp.service;
    return ECSServiceSchema.parse({
      serviceName: svc?.serviceName ?? serviceName,
      serviceArn: svc?.serviceArn ?? undefined,
      clusterArn: svc?.clusterArn ?? undefined,
      status: svc?.status ?? undefined,
      desiredCount: svc?.desiredCount ?? undefined,
      runningCount: svc?.runningCount ?? undefined,
      taskDefinition: svc?.taskDefinition ?? undefined,
    });
  } catch (err) {
    throw wrapAwsError(
      err,
      `updateService ${serviceName}`,
    );
  }
}

// ---------------------------------------------------------------------------
// Polling / wait helpers
// ---------------------------------------------------------------------------

/**
 * Poll until an ECS task reaches a target status (default `"STOPPED"`).
 *
 * @param cluster - Cluster name or ARN.
 * @param taskArn - Task ARN to monitor.
 * @param timeout - Maximum time to wait in milliseconds (default 600000).
 * @param pollInterval - Pause between polls in milliseconds (default 10000).
 * @param region - AWS region override.
 * @returns The {@link ECSTask} once it reaches the target status.
 * @throws {AwsTimeoutError} If the task does not reach the status in time.
 * @throws {AwsServiceError} If the task is not found.
 */
export async function waitForTask(
  cluster: string,
  taskArn: string,
  timeout = 600_000,
  pollInterval = 10_000,
  region?: string,
): Promise<ECSTask> {
  const deadline = Date.now() + timeout;

  while (true) {
    const tasks = await describeTasks(cluster, [taskArn], region);
    if (tasks.length === 0) {
      throw new AwsServiceError(
        `Task ${taskArn} not found in cluster ${cluster}`,
      );
    }
    const task = tasks[0];
    if (task.lastStatus === "STOPPED") {
      return task;
    }
    if (Date.now() >= deadline) {
      throw new AwsTimeoutError(
        `Task ${taskArn} did not reach status "STOPPED" ` +
          `within ${timeout}ms (current: "${task.lastStatus}")`,
      );
    }
    await new Promise((resolve) => setTimeout(resolve, pollInterval));
  }
}

/**
 * Wait until an ECS service has all desired tasks running (stable).
 *
 * Considers the service stable when `runningCount === desiredCount`.
 *
 * @param cluster - Cluster name or ARN.
 * @param serviceName - Service name or ARN.
 * @param timeout - Maximum time to wait in milliseconds (default 600000).
 * @param pollInterval - Pause between polls in milliseconds (default 15000).
 * @param region - AWS region override.
 * @returns The stable {@link ECSService}.
 * @throws {AwsTimeoutError} If the service does not stabilize in time.
 * @throws {AwsServiceError} If the service is not found.
 */
export async function waitForServiceStable(
  cluster: string,
  serviceName: string,
  timeout = 600_000,
  pollInterval = 15_000,
  region?: string,
): Promise<ECSService> {
  const deadline = Date.now() + timeout;

  while (true) {
    const services = await describeServices(
      cluster,
      [serviceName],
      region,
    );
    if (services.length === 0) {
      throw new AwsServiceError(
        `Service ${serviceName} not found in cluster ${cluster}`,
      );
    }
    const svc = services[0];
    if (
      svc.runningCount !== undefined &&
      svc.desiredCount !== undefined &&
      svc.runningCount === svc.desiredCount
    ) {
      return svc;
    }
    if (Date.now() >= deadline) {
      throw new AwsTimeoutError(
        `Service ${serviceName} did not stabilize within ${timeout}ms ` +
          `(running=${svc.runningCount}, desired=${svc.desiredCount})`,
      );
    }
    await new Promise((resolve) => setTimeout(resolve, pollInterval));
  }
}

// ---------------------------------------------------------------------------
// Compound operations
// ---------------------------------------------------------------------------

/**
 * Run a single ECS task and wait until it stops.
 *
 * Combines {@link runTask} and {@link waitForTask} into a single call.
 *
 * @param cluster - Cluster name or ARN.
 * @param taskDefinition - Task definition family:revision or ARN.
 * @param overrides - Optional container overrides.
 * @param networkConfiguration - Optional network configuration.
 * @param launchType - `"FARGATE"` (default) or `"EC2"`.
 * @param timeout - Maximum time to wait in milliseconds (default 600000).
 * @param region - AWS region override.
 * @returns The final {@link ECSTask} (with `lastStatus === "STOPPED"`).
 */
export async function runTaskAndWait(
  cluster: string,
  taskDefinition: string,
  overrides?: {
    containerOverrides?: Array<{
      name: string;
      command?: string[];
      environment?: Array<{ name: string; value: string }>;
    }>;
  },
  networkConfiguration?: {
    awsvpcConfiguration: {
      subnets: string[];
      securityGroups?: string[];
      assignPublicIp?: "ENABLED" | "DISABLED";
    };
  },
  launchType?: string,
  timeout?: number,
  region?: string,
): Promise<ECSTask> {
  const tasks = await runTask(
    cluster,
    taskDefinition,
    overrides,
    networkConfiguration,
    launchType,
    1,
    region,
  );
  if (tasks.length === 0) {
    throw new AwsServiceError(
      "runTaskAndWait: no tasks were launched",
    );
  }
  return waitForTask(
    cluster,
    tasks[0].taskArn,
    timeout,
    undefined,
    region,
  );
}

// ---------------------------------------------------------------------------
// Additional types (auto-generated)
// ---------------------------------------------------------------------------

/** Result of create_capacity_provider. */
export type CreateCapacityProviderResult = {
  capacityProvider?: Record<string, unknown>;
};

/** Result of create_cluster. */
export type CreateClusterResult = {
  cluster?: Record<string, unknown>;
};

/** Result of create_service. */
export type CreateServiceResult = {
  service?: Record<string, unknown>;
};

/** Result of create_task_set. */
export type CreateTaskSetResult = {
  taskSet?: Record<string, unknown>;
};

/** Result of delete_account_setting. */
export type DeleteAccountSettingResult = {
  setting?: Record<string, unknown>;
};

/** Result of delete_attributes. */
export type DeleteAttributesResult = {
  attributes?: Record<string, unknown>[];
};

/** Result of delete_capacity_provider. */
export type DeleteCapacityProviderResult = {
  capacityProvider?: Record<string, unknown>;
};

/** Result of delete_cluster. */
export type DeleteClusterResult = {
  cluster?: Record<string, unknown>;
};

/** Result of delete_service. */
export type DeleteServiceResult = {
  service?: Record<string, unknown>;
};

/** Result of delete_task_definitions. */
export type DeleteTaskDefinitionsResult = {
  taskDefinitions?: Record<string, unknown>[];
  failures?: Record<string, unknown>[];
};

/** Result of delete_task_set. */
export type DeleteTaskSetResult = {
  taskSet?: Record<string, unknown>;
};

/** Result of deregister_container_instance. */
export type DeregisterContainerInstanceResult = {
  containerInstance?: Record<string, unknown>;
};

/** Result of deregister_task_definition. */
export type DeregisterTaskDefinitionResult = {
  taskDefinition?: Record<string, unknown>;
};

/** Result of describe_capacity_providers. */
export type DescribeCapacityProvidersResult = {
  capacityProviders?: Record<string, unknown>[];
  failures?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_clusters. */
export type DescribeClustersResult = {
  clusters?: Record<string, unknown>[];
  failures?: Record<string, unknown>[];
};

/** Result of describe_container_instances. */
export type DescribeContainerInstancesResult = {
  containerInstances?: Record<string, unknown>[];
  failures?: Record<string, unknown>[];
};

/** Result of describe_service_deployments. */
export type DescribeServiceDeploymentsResult = {
  serviceDeployments?: Record<string, unknown>[];
  failures?: Record<string, unknown>[];
};

/** Result of describe_service_revisions. */
export type DescribeServiceRevisionsResult = {
  serviceRevisions?: Record<string, unknown>[];
  failures?: Record<string, unknown>[];
};

/** Result of describe_task_sets. */
export type DescribeTaskSetsResult = {
  taskSets?: Record<string, unknown>[];
  failures?: Record<string, unknown>[];
};

/** Result of discover_poll_endpoint. */
export type DiscoverPollEndpointResult = {
  endpoint?: string | undefined;
  telemetryEndpoint?: string | undefined;
  serviceConnectEndpoint?: string | undefined;
};

/** Result of execute_command. */
export type ExecuteCommandResult = {
  clusterArn?: string | undefined;
  containerArn?: string | undefined;
  containerName?: string | undefined;
  interactive?: boolean | undefined;
  session?: Record<string, unknown>;
  taskArn?: string | undefined;
};

/** Result of get_task_protection. */
export type GetTaskProtectionResult = {
  protectedTasks?: Record<string, unknown>[];
  failures?: Record<string, unknown>[];
};

/** Result of list_account_settings. */
export type ListAccountSettingsResult = {
  settings?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_attributes. */
export type ListAttributesResult = {
  attributes?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_container_instances. */
export type ListContainerInstancesResult = {
  containerInstanceArns?: string[];
  nextToken?: string | undefined;
};

/** Result of list_service_deployments. */
export type ListServiceDeploymentsResult = {
  serviceDeployments?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_services. */
export type ListServicesResult = {
  serviceArns?: string[];
  nextToken?: string | undefined;
};

/** Result of list_services_by_namespace. */
export type ListServicesByNamespaceResult = {
  serviceArns?: string[];
  nextToken?: string | undefined;
};

/** Result of list_tags_for_resource. */
export type ListTagsForResourceResult = {
  tags?: Record<string, unknown>[];
};

/** Result of list_task_definition_families. */
export type ListTaskDefinitionFamiliesResult = {
  families?: string[];
  nextToken?: string | undefined;
};

/** Result of list_task_definitions. */
export type ListTaskDefinitionsResult = {
  taskDefinitionArns?: string[];
  nextToken?: string | undefined;
};

/** Result of put_account_setting. */
export type PutAccountSettingResult = {
  setting?: Record<string, unknown>;
};

/** Result of put_account_setting_default. */
export type PutAccountSettingDefaultResult = {
  setting?: Record<string, unknown>;
};

/** Result of put_attributes. */
export type PutAttributesResult = {
  attributes?: Record<string, unknown>[];
};

/** Result of put_cluster_capacity_providers. */
export type PutClusterCapacityProvidersResult = {
  cluster?: Record<string, unknown>;
};

/** Result of register_container_instance. */
export type RegisterContainerInstanceResult = {
  containerInstance?: Record<string, unknown>;
};

/** Result of register_task_definition. */
export type RegisterTaskDefinitionResult = {
  taskDefinition?: Record<string, unknown>;
  tags?: Record<string, unknown>[];
};

/** Result of start_task. */
export type StartTaskResult = {
  tasks?: Record<string, unknown>[];
  failures?: Record<string, unknown>[];
};

/** Result of stop_service_deployment. */
export type StopServiceDeploymentResult = {
  serviceDeploymentArn?: string | undefined;
};

/** Result of submit_attachment_state_changes. */
export type SubmitAttachmentStateChangesResult = {
  acknowledgment?: string | undefined;
};

/** Result of submit_container_state_change. */
export type SubmitContainerStateChangeResult = {
  acknowledgment?: string | undefined;
};

/** Result of submit_task_state_change. */
export type SubmitTaskStateChangeResult = {
  acknowledgment?: string | undefined;
};

/** Result of update_capacity_provider. */
export type UpdateCapacityProviderResult = {
  capacityProvider?: Record<string, unknown>;
};

/** Result of update_cluster. */
export type UpdateClusterResult = {
  cluster?: Record<string, unknown>;
};

/** Result of update_cluster_settings. */
export type UpdateClusterSettingsResult = {
  cluster?: Record<string, unknown>;
};

/** Result of update_container_agent. */
export type UpdateContainerAgentResult = {
  containerInstance?: Record<string, unknown>;
};

/** Result of update_container_instances_state. */
export type UpdateContainerInstancesStateResult = {
  containerInstances?: Record<string, unknown>[];
  failures?: Record<string, unknown>[];
};

/** Result of update_service_primary_task_set. */
export type UpdateServicePrimaryTaskSetResult = {
  taskSet?: Record<string, unknown>;
};

/** Result of update_task_protection. */
export type UpdateTaskProtectionResult = {
  protectedTasks?: Record<string, unknown>[];
  failures?: Record<string, unknown>[];
};

/** Result of update_task_set. */
export type UpdateTaskSetResult = {
  taskSet?: Record<string, unknown>;
};


// ---------------------------------------------------------------------------
// Additional functions (auto-generated)
// ---------------------------------------------------------------------------

/** Create capacity provider. */
export async function createCapacityProvider(name: string): Promise<CreateCapacityProviderResult> {
  try {
    // TODO: implement create_capacity_provider
    throw new Error("create_capacity_provider not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_capacity_provider failed");
  }
}

/** Create cluster. */
export async function createCluster(): Promise<CreateClusterResult> {
  try {
    // TODO: implement create_cluster
    throw new Error("create_cluster not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_cluster failed");
  }
}

/** Create service. */
export async function createService(serviceName: string): Promise<CreateServiceResult> {
  try {
    // TODO: implement create_service
    throw new Error("create_service not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_service failed");
  }
}

/** Create task set. */
export async function createTaskSet(service: string, cluster: string, taskDefinition: string): Promise<CreateTaskSetResult> {
  try {
    // TODO: implement create_task_set
    throw new Error("create_task_set not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_task_set failed");
  }
}

/** Delete account setting. */
export async function deleteAccountSetting(name: string): Promise<DeleteAccountSettingResult> {
  try {
    // TODO: implement delete_account_setting
    throw new Error("delete_account_setting not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_account_setting failed");
  }
}

/** Delete attributes. */
export async function deleteAttributes(attributes: Record<string, unknown>[]): Promise<DeleteAttributesResult> {
  try {
    // TODO: implement delete_attributes
    throw new Error("delete_attributes not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_attributes failed");
  }
}

/** Delete capacity provider. */
export async function deleteCapacityProvider(capacityProvider: string): Promise<DeleteCapacityProviderResult> {
  try {
    // TODO: implement delete_capacity_provider
    throw new Error("delete_capacity_provider not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_capacity_provider failed");
  }
}

/** Delete cluster. */
export async function deleteCluster(cluster: string, regionName?: string | undefined): Promise<DeleteClusterResult> {
  try {
    // TODO: implement delete_cluster
    throw new Error("delete_cluster not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_cluster failed");
  }
}

/** Delete service. */
export async function deleteService(service: string): Promise<DeleteServiceResult> {
  try {
    // TODO: implement delete_service
    throw new Error("delete_service not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_service failed");
  }
}

/** Delete task definitions. */
export async function deleteTaskDefinitions(taskDefinitions: string[], regionName?: string | undefined): Promise<DeleteTaskDefinitionsResult> {
  try {
    // TODO: implement delete_task_definitions
    throw new Error("delete_task_definitions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_task_definitions failed");
  }
}

/** Delete task set. */
export async function deleteTaskSet(cluster: string, service: string, taskSet: string): Promise<DeleteTaskSetResult> {
  try {
    // TODO: implement delete_task_set
    throw new Error("delete_task_set not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_task_set failed");
  }
}

/** Deregister container instance. */
export async function deregisterContainerInstance(containerInstance: string): Promise<DeregisterContainerInstanceResult> {
  try {
    // TODO: implement deregister_container_instance
    throw new Error("deregister_container_instance not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "deregister_container_instance failed");
  }
}

/** Deregister task definition. */
export async function deregisterTaskDefinition(taskDefinition: string, regionName?: string | undefined): Promise<DeregisterTaskDefinitionResult> {
  try {
    // TODO: implement deregister_task_definition
    throw new Error("deregister_task_definition not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "deregister_task_definition failed");
  }
}

/** Describe capacity providers. */
export async function describeCapacityProviders(): Promise<DescribeCapacityProvidersResult> {
  try {
    // TODO: implement describe_capacity_providers
    throw new Error("describe_capacity_providers not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_capacity_providers failed");
  }
}

/** Describe clusters. */
export async function describeClusters(): Promise<DescribeClustersResult> {
  try {
    // TODO: implement describe_clusters
    throw new Error("describe_clusters not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_clusters failed");
  }
}

/** Describe container instances. */
export async function describeContainerInstances(containerInstances: string[]): Promise<DescribeContainerInstancesResult> {
  try {
    // TODO: implement describe_container_instances
    throw new Error("describe_container_instances not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_container_instances failed");
  }
}

/** Describe service deployments. */
export async function describeServiceDeployments(serviceDeploymentArns: string[], regionName?: string | undefined): Promise<DescribeServiceDeploymentsResult> {
  try {
    // TODO: implement describe_service_deployments
    throw new Error("describe_service_deployments not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_service_deployments failed");
  }
}

/** Describe service revisions. */
export async function describeServiceRevisions(serviceRevisionArns: string[], regionName?: string | undefined): Promise<DescribeServiceRevisionsResult> {
  try {
    // TODO: implement describe_service_revisions
    throw new Error("describe_service_revisions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_service_revisions failed");
  }
}

/** Describe task sets. */
export async function describeTaskSets(cluster: string, service: string): Promise<DescribeTaskSetsResult> {
  try {
    // TODO: implement describe_task_sets
    throw new Error("describe_task_sets not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_task_sets failed");
  }
}

/** Discover poll endpoint. */
export async function discoverPollEndpoint(): Promise<DiscoverPollEndpointResult> {
  try {
    // TODO: implement discover_poll_endpoint
    throw new Error("discover_poll_endpoint not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "discover_poll_endpoint failed");
  }
}

/** Execute command. */
export async function executeCommand(command: string, interactive: boolean, task: string): Promise<ExecuteCommandResult> {
  try {
    // TODO: implement execute_command
    throw new Error("execute_command not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "execute_command failed");
  }
}

/** Get task protection. */
export async function getTaskProtection(cluster: string): Promise<GetTaskProtectionResult> {
  try {
    // TODO: implement get_task_protection
    throw new Error("get_task_protection not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_task_protection failed");
  }
}

/** List account settings. */
export async function listAccountSettings(): Promise<ListAccountSettingsResult> {
  try {
    // TODO: implement list_account_settings
    throw new Error("list_account_settings not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_account_settings failed");
  }
}

/** List attributes. */
export async function listAttributes(targetType: string): Promise<ListAttributesResult> {
  try {
    // TODO: implement list_attributes
    throw new Error("list_attributes not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_attributes failed");
  }
}

/** List container instances. */
export async function listContainerInstances(): Promise<ListContainerInstancesResult> {
  try {
    // TODO: implement list_container_instances
    throw new Error("list_container_instances not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_container_instances failed");
  }
}

/** List service deployments. */
export async function listServiceDeployments(service: string): Promise<ListServiceDeploymentsResult> {
  try {
    // TODO: implement list_service_deployments
    throw new Error("list_service_deployments not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_service_deployments failed");
  }
}

/** List services. */
export async function listServices(): Promise<ListServicesResult> {
  try {
    // TODO: implement list_services
    throw new Error("list_services not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_services failed");
  }
}

/** List services by namespace. */
export async function listServicesByNamespace(namespace: string): Promise<ListServicesByNamespaceResult> {
  try {
    // TODO: implement list_services_by_namespace
    throw new Error("list_services_by_namespace not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_services_by_namespace failed");
  }
}

/** List tags for resource. */
export async function listTagsForResource(resourceArn: string, regionName?: string | undefined): Promise<ListTagsForResourceResult> {
  try {
    // TODO: implement list_tags_for_resource
    throw new Error("list_tags_for_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_tags_for_resource failed");
  }
}

/** List task definition families. */
export async function listTaskDefinitionFamilies(): Promise<ListTaskDefinitionFamiliesResult> {
  try {
    // TODO: implement list_task_definition_families
    throw new Error("list_task_definition_families not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_task_definition_families failed");
  }
}

/** List task definitions. */
export async function listTaskDefinitions(): Promise<ListTaskDefinitionsResult> {
  try {
    // TODO: implement list_task_definitions
    throw new Error("list_task_definitions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_task_definitions failed");
  }
}

/** Put account setting. */
export async function putAccountSetting(name: string, value: string): Promise<PutAccountSettingResult> {
  try {
    // TODO: implement put_account_setting
    throw new Error("put_account_setting not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_account_setting failed");
  }
}

/** Put account setting default. */
export async function putAccountSettingDefault(name: string, value: string, regionName?: string | undefined): Promise<PutAccountSettingDefaultResult> {
  try {
    // TODO: implement put_account_setting_default
    throw new Error("put_account_setting_default not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_account_setting_default failed");
  }
}

/** Put attributes. */
export async function putAttributes(attributes: Record<string, unknown>[]): Promise<PutAttributesResult> {
  try {
    // TODO: implement put_attributes
    throw new Error("put_attributes not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_attributes failed");
  }
}

/** Put cluster capacity providers. */
export async function putClusterCapacityProviders(cluster: string, capacityProviders: string[], defaultCapacityProviderStrategy: Record<string, unknown>[], regionName?: string | undefined): Promise<PutClusterCapacityProvidersResult> {
  try {
    // TODO: implement put_cluster_capacity_providers
    throw new Error("put_cluster_capacity_providers not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_cluster_capacity_providers failed");
  }
}

/** Register container instance. */
export async function registerContainerInstance(): Promise<RegisterContainerInstanceResult> {
  try {
    // TODO: implement register_container_instance
    throw new Error("register_container_instance not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "register_container_instance failed");
  }
}

/** Register task definition. */
export async function registerTaskDefinition(family: string, containerDefinitions: Record<string, unknown>[]): Promise<RegisterTaskDefinitionResult> {
  try {
    // TODO: implement register_task_definition
    throw new Error("register_task_definition not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "register_task_definition failed");
  }
}

/** Start task. */
export async function startTask(containerInstances: string[], taskDefinition: string): Promise<StartTaskResult> {
  try {
    // TODO: implement start_task
    throw new Error("start_task not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_task failed");
  }
}

/** Stop service deployment. */
export async function stopServiceDeployment(serviceDeploymentArn: string): Promise<StopServiceDeploymentResult> {
  try {
    // TODO: implement stop_service_deployment
    throw new Error("stop_service_deployment not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "stop_service_deployment failed");
  }
}

/** Submit attachment state changes. */
export async function submitAttachmentStateChanges(attachments: Record<string, unknown>[]): Promise<SubmitAttachmentStateChangesResult> {
  try {
    // TODO: implement submit_attachment_state_changes
    throw new Error("submit_attachment_state_changes not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "submit_attachment_state_changes failed");
  }
}

/** Submit container state change. */
export async function submitContainerStateChange(): Promise<SubmitContainerStateChangeResult> {
  try {
    // TODO: implement submit_container_state_change
    throw new Error("submit_container_state_change not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "submit_container_state_change failed");
  }
}

/** Submit task state change. */
export async function submitTaskStateChange(): Promise<SubmitTaskStateChangeResult> {
  try {
    // TODO: implement submit_task_state_change
    throw new Error("submit_task_state_change not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "submit_task_state_change failed");
  }
}

/** Tag resource. */
export async function tagResource(resourceArn: string, tags: Record<string, unknown>[], regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement tag_resource
    throw new Error("tag_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "tag_resource failed");
  }
}

/** Untag resource. */
export async function untagResource(resourceArn: string, tagKeys: string[], regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement untag_resource
    throw new Error("untag_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "untag_resource failed");
  }
}

/** Update capacity provider. */
export async function updateCapacityProvider(name: string): Promise<UpdateCapacityProviderResult> {
  try {
    // TODO: implement update_capacity_provider
    throw new Error("update_capacity_provider not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_capacity_provider failed");
  }
}

/** Update cluster. */
export async function updateCluster(cluster: string): Promise<UpdateClusterResult> {
  try {
    // TODO: implement update_cluster
    throw new Error("update_cluster not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_cluster failed");
  }
}

/** Update cluster settings. */
export async function updateClusterSettings(cluster: string, settings: Record<string, unknown>[], regionName?: string | undefined): Promise<UpdateClusterSettingsResult> {
  try {
    // TODO: implement update_cluster_settings
    throw new Error("update_cluster_settings not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_cluster_settings failed");
  }
}

/** Update container agent. */
export async function updateContainerAgent(containerInstance: string): Promise<UpdateContainerAgentResult> {
  try {
    // TODO: implement update_container_agent
    throw new Error("update_container_agent not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_container_agent failed");
  }
}

/** Update container instances state. */
export async function updateContainerInstancesState(containerInstances: string[], status: string): Promise<UpdateContainerInstancesStateResult> {
  try {
    // TODO: implement update_container_instances_state
    throw new Error("update_container_instances_state not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_container_instances_state failed");
  }
}

/** Update service primary task set. */
export async function updateServicePrimaryTaskSet(cluster: string, service: string, primaryTaskSet: string, regionName?: string | undefined): Promise<UpdateServicePrimaryTaskSetResult> {
  try {
    // TODO: implement update_service_primary_task_set
    throw new Error("update_service_primary_task_set not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_service_primary_task_set failed");
  }
}

/** Update task protection. */
export async function updateTaskProtection(cluster: string, tasks: string[], protectionEnabled: boolean): Promise<UpdateTaskProtectionResult> {
  try {
    // TODO: implement update_task_protection
    throw new Error("update_task_protection not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_task_protection failed");
  }
}

/** Update task set. */
export async function updateTaskSet(cluster: string, service: string, taskSet: string, scale: Record<string, unknown>, regionName?: string | undefined): Promise<UpdateTaskSetResult> {
  try {
    // TODO: implement update_task_set
    throw new Error("update_task_set not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_task_set failed");
  }
}
