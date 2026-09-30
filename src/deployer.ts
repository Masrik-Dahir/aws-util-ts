/**
 * aws-util/deployer — Multi-service deployment orchestration for Lambda + ECS + ECR + SSM.
 *
 * Provides typed helpers for deploying Lambda functions (from S3 or ZIP),
 * updating ECS services with new container images, managing Lambda aliases
 * and versions, and resolving ECR image URIs.
 *
 * All functions obtain clients via {@link getClient} and wrap errors
 * through {@link wrapAwsError}.
 *
 * @example
 * ```ts
 * import { deployLambdaWithConfig, deployEcsFromEcr } from "./deployer.js";
 *
 * await deployLambdaWithConfig("my-func", "my-bucket", "code.zip", {
 *   DB_HOST: "db.example.com",
 * });
 *
 * await deployEcsFromEcr("my-cluster", "my-service", "my-repo", "latest");
 * ```
 *
 * @module
 */

import { z } from "zod";
import {
  LambdaClient,
  UpdateFunctionCodeCommand,
  UpdateFunctionConfigurationCommand,
  GetFunctionCommand,
  GetFunctionConfigurationCommand,
  PublishVersionCommand,
  UpdateAliasCommand,
  CreateAliasCommand,
} from "@aws-sdk/client-lambda";
import {
  ECSClient,
  DescribeServicesCommand,
  DescribeTaskDefinitionCommand,
  RegisterTaskDefinitionCommand,
  UpdateServiceCommand,
} from "@aws-sdk/client-ecs";
import {
  ECRClient,
  DescribeImagesCommand,
  DescribeRepositoriesCommand,
} from "@aws-sdk/client-ecr";
import { getClient } from "./client.js";
import {
  wrapAwsError,
  AwsTimeoutError,
  AwsServiceError,
  AwsNotFoundError,
} from "./exceptions.js";

// ---------------------------------------------------------------------------
// Zod schemas & inferred types
// ---------------------------------------------------------------------------

/** Schema for the result of a Lambda deployment. */
export const LambdaDeployResultSchema = z.object({
  functionName: z.string(),
  functionArn: z.string().optional(),
  version: z.string().optional(),
  codeSize: z.number().optional(),
  lastModified: z.string().optional(),
});

/** Result of a Lambda deployment operation. */
export type LambdaDeployResult = z.infer<typeof LambdaDeployResultSchema>;

/** Schema for the result of an ECS deployment. */
export const ECSDeployResultSchema = z.object({
  serviceName: z.string(),
  clusterArn: z.string().optional(),
  taskDefinition: z.string().optional(),
  desiredCount: z.number().optional(),
  runningCount: z.number().optional(),
});

/** Result of an ECS deployment operation. */
export type ECSDeployResult = z.infer<typeof ECSDeployResultSchema>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Get a cached LambdaClient for the given region.
 */
function lambda(region?: string): LambdaClient {
  return getClient(LambdaClient, region);
}

/**
 * Get a cached ECSClient for the given region.
 */
function ecs(region?: string): ECSClient {
  return getClient(ECSClient, region);
}

/**
 * Get a cached ECRClient for the given region.
 */
function ecr(region?: string): ECRClient {
  return getClient(ECRClient, region);
}

/**
 * Sleep for a given number of milliseconds.
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// Public API — Lambda
// ---------------------------------------------------------------------------

/**
 * Update Lambda function code from an S3 object.
 *
 * @param functionName - The Lambda function name or ARN.
 * @param s3Bucket - The S3 bucket containing the deployment package.
 * @param s3Key - The S3 key of the deployment package.
 * @param publish - Whether to publish a new version (default `false`).
 * @param region - AWS region override.
 * @returns The deployment result with function metadata.
 */
export async function updateLambdaCodeFromS3(
  functionName: string,
  s3Bucket: string,
  s3Key: string,
  publish?: boolean,
  region?: string,
): Promise<LambdaDeployResult> {
  try {
    const resp = await lambda(region).send(
      new UpdateFunctionCodeCommand({
        FunctionName: functionName,
        S3Bucket: s3Bucket,
        S3Key: s3Key,
        Publish: publish ?? false,
      }),
    );

    return LambdaDeployResultSchema.parse({
      functionName: resp.FunctionName ?? functionName,
      functionArn: resp.FunctionArn,
      version: resp.Version,
      codeSize: resp.CodeSize,
      lastModified: resp.LastModified,
    });
  } catch (err) {
    throw wrapAwsError(
      err,
      `Failed to update Lambda code from S3 for ${functionName}`,
    );
  }
}

/**
 * Update Lambda function code from a ZIP buffer.
 *
 * @param functionName - The Lambda function name or ARN.
 * @param zipBuffer - The ZIP deployment package as a Uint8Array.
 * @param publish - Whether to publish a new version (default `false`).
 * @param region - AWS region override.
 * @returns The deployment result with function metadata.
 */
export async function updateLambdaCodeFromZip(
  functionName: string,
  zipBuffer: Uint8Array,
  publish?: boolean,
  region?: string,
): Promise<LambdaDeployResult> {
  try {
    const resp = await lambda(region).send(
      new UpdateFunctionCodeCommand({
        FunctionName: functionName,
        ZipFile: zipBuffer,
        Publish: publish ?? false,
      }),
    );

    return LambdaDeployResultSchema.parse({
      functionName: resp.FunctionName ?? functionName,
      functionArn: resp.FunctionArn,
      version: resp.Version,
      codeSize: resp.CodeSize,
      lastModified: resp.LastModified,
    });
  } catch (err) {
    throw wrapAwsError(
      err,
      `Failed to update Lambda code from ZIP for ${functionName}`,
    );
  }
}

/**
 * Update or merge environment variables on a Lambda function.
 *
 * When `merge` is `true` (default), the provided variables are merged into
 * the existing environment. When `false`, the environment is replaced entirely.
 *
 * @param functionName - The Lambda function name or ARN.
 * @param variables - Environment variables to set.
 * @param merge - Whether to merge with existing variables (default `true`).
 * @param region - AWS region override.
 * @returns The deployment result with function metadata.
 */
export async function updateLambdaEnvironment(
  functionName: string,
  variables: Record<string, string>,
  merge?: boolean,
  region?: string,
): Promise<LambdaDeployResult> {
  const shouldMerge = merge ?? true;

  try {
    let envVars = variables;

    if (shouldMerge) {
      const current = await lambda(region).send(
        new GetFunctionConfigurationCommand({
          FunctionName: functionName,
        }),
      );
      const existing = current.Environment?.Variables ?? {};
      envVars = { ...existing, ...variables };
    }

    const resp = await lambda(region).send(
      new UpdateFunctionConfigurationCommand({
        FunctionName: functionName,
        Environment: { Variables: envVars },
      }),
    );

    return LambdaDeployResultSchema.parse({
      functionName: resp.FunctionName ?? functionName,
      functionArn: resp.FunctionArn,
      version: resp.Version,
      codeSize: resp.CodeSize,
      lastModified: resp.LastModified,
    });
  } catch (err) {
    throw wrapAwsError(
      err,
      `Failed to update Lambda environment for ${functionName}`,
    );
  }
}

/**
 * Update a Lambda function alias to point to a specific version.
 *
 * If the alias does not exist, it is created.
 *
 * @param functionName - The Lambda function name or ARN.
 * @param aliasName - The alias name (e.g. `"live"`, `"staging"`).
 * @param functionVersion - The version number to point the alias to.
 * @param region - AWS region override.
 */
export async function updateLambdaAlias(
  functionName: string,
  aliasName: string,
  functionVersion: string,
  region?: string,
): Promise<void> {
  try {
    await lambda(region).send(
      new UpdateAliasCommand({
        FunctionName: functionName,
        Name: aliasName,
        FunctionVersion: functionVersion,
      }),
    );
  } catch (err) {
    // If alias doesn't exist, create it
    const wrapped = wrapAwsError(err);
    if (wrapped instanceof AwsNotFoundError) {
      try {
        await lambda(region).send(
          new CreateAliasCommand({
            FunctionName: functionName,
            Name: aliasName,
            FunctionVersion: functionVersion,
          }),
        );
        return;
      } catch (createErr) {
        throw wrapAwsError(
          createErr,
          `Failed to create Lambda alias ${aliasName} for ${functionName}`,
        );
      }
    }
    throw wrapAwsError(
      err,
      `Failed to update Lambda alias ${aliasName} for ${functionName}`,
    );
  }
}

/**
 * Publish a new version of a Lambda function.
 *
 * @param functionName - The Lambda function name or ARN.
 * @param description - Optional description for the version.
 * @param region - AWS region override.
 * @returns The published version number and function ARN.
 */
export async function publishLambdaVersion(
  functionName: string,
  description?: string,
  region?: string,
): Promise<{ version: string; functionArn: string }> {
  try {
    const resp = await lambda(region).send(
      new PublishVersionCommand({
        FunctionName: functionName,
        Description: description,
      }),
    );

    return {
      version: resp.Version ?? "$LATEST",
      functionArn: resp.FunctionArn ?? "",
    };
  } catch (err) {
    throw wrapAwsError(
      err,
      `Failed to publish Lambda version for ${functionName}`,
    );
  }
}

/**
 * Wait for a Lambda function to reach an active/ready state after an update.
 *
 * Polls the function configuration until `LastUpdateStatus` is no longer
 * `"InProgress"`, or until the timeout is reached.
 *
 * @param functionName - The Lambda function name or ARN.
 * @param timeout - Maximum wait time in milliseconds (default 120000).
 * @param pollInterval - Polling interval in milliseconds (default 2000).
 * @param region - AWS region override.
 * @throws {AwsTimeoutError} If the function does not become ready within the timeout.
 * @throws {AwsServiceError} If the update fails.
 */
export async function waitForLambdaUpdate(
  functionName: string,
  timeout?: number,
  pollInterval?: number,
  region?: string,
): Promise<void> {
  const maxWait = timeout ?? 120_000;
  const interval = pollInterval ?? 2_000;
  const deadline = Date.now() + maxWait;

  while (Date.now() < deadline) {
    try {
      const resp = await lambda(region).send(
        new GetFunctionCommand({ FunctionName: functionName }),
      );
      const status = resp.Configuration?.LastUpdateStatus;

      if (status === "Successful" || status === undefined) {
        return;
      }
      if (status === "Failed") {
        throw new AwsServiceError(
          `Lambda function ${functionName} update failed: ${resp.Configuration?.LastUpdateStatusReason ?? "unknown reason"}`,
        );
      }
    } catch (err) {
      if (
        err instanceof AwsServiceError ||
        err instanceof AwsTimeoutError
      ) {
        throw err;
      }
      throw wrapAwsError(
        err,
        `Failed to poll Lambda status for ${functionName}`,
      );
    }

    await sleep(interval);
  }

  throw new AwsTimeoutError(
    `Lambda function ${functionName} did not become ready within ${maxWait}ms`,
  );
}

/**
 * Deploy a Lambda function with updated code from S3 and optional environment variables.
 *
 * Updates the function code, optionally waits for the update to complete,
 * then updates environment variables if provided.
 *
 * @param functionName - The Lambda function name or ARN.
 * @param s3Bucket - The S3 bucket containing the deployment package.
 * @param s3Key - The S3 key of the deployment package.
 * @param environment - Optional environment variables to set or merge.
 * @param region - AWS region override.
 * @returns The deployment result with function metadata.
 */
export async function deployLambdaWithConfig(
  functionName: string,
  s3Bucket: string,
  s3Key: string,
  environment?: Record<string, string>,
  region?: string,
): Promise<LambdaDeployResult> {
  // Update code first
  const codeResult = await updateLambdaCodeFromS3(
    functionName,
    s3Bucket,
    s3Key,
    false,
    region,
  );

  // Wait for code update to complete
  await waitForLambdaUpdate(functionName, 120_000, 2_000, region);

  // Update environment variables if provided
  if (environment && Object.keys(environment).length > 0) {
    const envResult = await updateLambdaEnvironment(
      functionName,
      environment,
      true,
      region,
    );
    return envResult;
  }

  return codeResult;
}

// ---------------------------------------------------------------------------
// Public API — ECR
// ---------------------------------------------------------------------------

/**
 * Get the URI of the latest image in an ECR repository.
 *
 * Finds the most recently pushed image and returns its full URI
 * (e.g. `123456789012.dkr.ecr.us-east-1.amazonaws.com/my-repo:latest`).
 *
 * @param repositoryName - The ECR repository name.
 * @param region - AWS region override.
 * @returns The full image URI, or `null` if the repository is empty.
 */
export async function getLatestEcrImageUri(
  repositoryName: string,
  region?: string,
): Promise<string | null> {
  try {
    // Get repository URI
    const repoResp = await ecr(region).send(
      new DescribeRepositoriesCommand({
        repositoryNames: [repositoryName],
      }),
    );
    const repoUri =
      repoResp.repositories?.[0]?.repositoryUri;
    if (!repoUri) {
      return null;
    }

    // Get the most recently pushed image
    const imagesResp = await ecr(region).send(
      new DescribeImagesCommand({
        repositoryName,
        filter: { tagStatus: "TAGGED" },
      }),
    );

    const images = imagesResp.imageDetails ?? [];
    if (images.length === 0) {
      return null;
    }

    // Sort by push date descending
    images.sort((a, b) => {
      const aTime = a.imagePushedAt?.getTime() ?? 0;
      const bTime = b.imagePushedAt?.getTime() ?? 0;
      return bTime - aTime;
    });

    const latest = images[0];
    const tag = latest.imageTags?.[0] ?? latest.imageDigest ?? "latest";

    return `${repoUri}:${tag}`;
  } catch (err) {
    throw wrapAwsError(
      err,
      `Failed to get latest ECR image for ${repositoryName}`,
    );
  }
}

// ---------------------------------------------------------------------------
// Public API — ECS
// ---------------------------------------------------------------------------

/**
 * Deploy a new container image to an ECS service.
 *
 * Creates a new task definition revision with the updated image, then
 * updates the service to use the new task definition.
 *
 * @param cluster - The ECS cluster name or ARN.
 * @param serviceName - The ECS service name.
 * @param image - The full container image URI (e.g. `repo:tag`).
 * @param region - AWS region override.
 * @returns The deployment result with service metadata.
 */
export async function deployEcsImage(
  cluster: string,
  serviceName: string,
  image: string,
  region?: string,
): Promise<ECSDeployResult> {
  try {
    // Describe current service to get the task definition
    const svcResp = await ecs(region).send(
      new DescribeServicesCommand({
        cluster,
        services: [serviceName],
      }),
    );

    const service = svcResp.services?.[0];
    if (!service) {
      throw new AwsNotFoundError(
        `ECS service ${serviceName} not found in cluster ${cluster}`,
      );
    }

    const currentTaskDef = service.taskDefinition;
    if (!currentTaskDef) {
      throw new AwsServiceError(
        `ECS service ${serviceName} has no task definition`,
      );
    }

    // Describe the current task definition
    const tdResp = await ecs(region).send(
      new DescribeTaskDefinitionCommand({
        taskDefinition: currentTaskDef,
      }),
    );

    const taskDef = tdResp.taskDefinition;
    if (!taskDef) {
      throw new AwsServiceError(
        `Task definition ${currentTaskDef} not found`,
      );
    }

    // Update the first container's image
    const containerDefs = (taskDef.containerDefinitions ?? []).map(
      (cd, index) => {
        if (index === 0) {
          return { ...cd, image };
        }
        return cd;
      },
    );

    // Register new task definition revision
    const registerResp = await ecs(region).send(
      new RegisterTaskDefinitionCommand({
        family: taskDef.family,
        containerDefinitions: containerDefs,
        taskRoleArn: taskDef.taskRoleArn,
        executionRoleArn: taskDef.executionRoleArn,
        networkMode: taskDef.networkMode,
        volumes: taskDef.volumes,
        placementConstraints: taskDef.placementConstraints,
        requiresCompatibilities: taskDef.requiresCompatibilities,
        cpu: taskDef.cpu,
        memory: taskDef.memory,
        runtimePlatform: taskDef.runtimePlatform,
      }),
    );

    const newTaskDefArn =
      registerResp.taskDefinition?.taskDefinitionArn ?? "";

    // Update the service with the new task definition
    const updateResp = await ecs(region).send(
      new UpdateServiceCommand({
        cluster,
        service: serviceName,
        taskDefinition: newTaskDefArn,
      }),
    );

    const updatedService = updateResp.service;

    return ECSDeployResultSchema.parse({
      serviceName: updatedService?.serviceName ?? serviceName,
      clusterArn: updatedService?.clusterArn,
      taskDefinition: newTaskDefArn,
      desiredCount: updatedService?.desiredCount,
      runningCount: updatedService?.runningCount,
    });
  } catch (err) {
    if (
      err instanceof AwsNotFoundError ||
      err instanceof AwsServiceError
    ) {
      throw err;
    }
    throw wrapAwsError(
      err,
      `Failed to deploy image to ECS service ${serviceName}`,
    );
  }
}

/**
 * Deploy an ECS service using an image from ECR.
 *
 * Resolves the full ECR image URI from the repository name and tag,
 * then delegates to {@link deployEcsImage}.
 *
 * @param cluster - The ECS cluster name or ARN.
 * @param serviceName - The ECS service name.
 * @param repositoryName - The ECR repository name.
 * @param tag - The image tag (default `"latest"`).
 * @param region - AWS region override.
 * @returns The deployment result with service metadata.
 */
export async function deployEcsFromEcr(
  cluster: string,
  serviceName: string,
  repositoryName: string,
  tag?: string,
  region?: string,
): Promise<ECSDeployResult> {
  const imageTag = tag ?? "latest";

  // Resolve ECR repository URI
  let repoUri: string;
  try {
    const resp = await ecr(region).send(
      new DescribeRepositoriesCommand({
        repositoryNames: [repositoryName],
      }),
    );
    const repo = resp.repositories?.[0];
    if (!repo?.repositoryUri) {
      throw new AwsNotFoundError(
        `ECR repository ${repositoryName} not found`,
      );
    }
    repoUri = repo.repositoryUri;
  } catch (err) {
    if (err instanceof AwsNotFoundError) {
      throw err;
    }
    throw wrapAwsError(
      err,
      `Failed to resolve ECR repository ${repositoryName}`,
    );
  }

  const image = `${repoUri}:${imageTag}`;
  return deployEcsImage(cluster, serviceName, image, region);
}
