/**
 * aws-util/deployment — Multi-service deployment orchestration.
 *
 * Provides typed helpers for canary deployments with gradual traffic
 * shifting, Lambda layer publishing, CloudFormation stack deployment,
 * SSM parameter promotion between environments, Lambda warming,
 * CloudFormation drift detection, alias rollback management, and
 * Lambda package building with optional S3 upload.
 *
 * Multi-service: Lambda + CloudFormation + EventBridge + CloudWatch + S3.
 *
 * All functions obtain clients via {@link getClient} and wrap errors
 * through {@link wrapAwsError}.
 *
 * @example
 * ```ts
 * import {
 *   lambdaCanaryDeploy,
 *   lambdaLayerPublisher,
 *   stackDeployer,
 *   lambdaWarmer,
 * } from "./deployment.js";
 *
 * await lambdaCanaryDeploy("my-func", "live", "5", [10, 50, 100]);
 * await lambdaWarmer("my-func", 5);
 * ```
 *
 * @module
 */

import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { z } from "zod";
import {
  LambdaClient,
  UpdateAliasCommand,
  GetAliasCommand,
  PublishLayerVersionCommand,
  InvokeCommand,
  ListVersionsByFunctionCommand,
} from "@aws-sdk/client-lambda";
import {
  CloudFormationClient,
  CreateStackCommand,
  UpdateStackCommand,
  DescribeStacksCommand,
  DetectStackDriftCommand,
  DescribeStackDriftDetectionStatusCommand,
  DescribeStackResourceDriftsCommand,
} from "@aws-sdk/client-cloudformation";
import {
  SSMClient,
  GetParametersByPathCommand,
  PutParameterCommand,
} from "@aws-sdk/client-ssm";
import {
  S3Client,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getClient } from "./client.js";
import {
  wrapAwsError,
  AwsTimeoutError,
} from "./exceptions.js";

// ---------------------------------------------------------------------------
// Zod schemas & inferred types
// ---------------------------------------------------------------------------

/** Schema for a canary deployment result. */
export const CanaryDeployResultSchema = z.object({
  functionName: z.string(),
  newVersion: z.string(),
  aliasName: z.string(),
  currentWeight: z.number(),
  status: z.string(),
});

/** Canary deployment result. */
export type CanaryDeployResult = z.infer<typeof CanaryDeployResultSchema>;

/** Schema for a Lambda layer publish result. */
export const LayerPublishResultSchema = z.object({
  layerArn: z.string(),
  version: z.number(),
});

/** Lambda layer publish result. */
export type LayerPublishResult = z.infer<typeof LayerPublishResultSchema>;

/** Schema for a CloudFormation stack deploy result. */
export const StackDeployResultSchema = z.object({
  stackName: z.string(),
  stackId: z.string().optional(),
  status: z.string(),
  outputs: z.record(z.string(), z.string()).optional(),
});

/** CloudFormation stack deploy result. */
export type StackDeployResult = z.infer<typeof StackDeployResultSchema>;

/** Schema for an environment promotion result. */
export const EnvironmentPromoteResultSchema = z.object({
  sourceEnv: z.string(),
  targetEnv: z.string(),
  parametersCopied: z.number(),
});

/** Environment promotion result. */
export type EnvironmentPromoteResult = z.infer<
  typeof EnvironmentPromoteResultSchema
>;

/** Schema for a Lambda warmer result. */
export const LambdaWarmerResultSchema = z.object({
  functionName: z.string(),
  invocations: z.number(),
  averageLatency: z.number().optional(),
});

/** Lambda warmer result. */
export type LambdaWarmerResult = z.infer<typeof LambdaWarmerResultSchema>;

/** Schema for a drift report entry. */
export const DriftReportSchema = z.object({
  resourceType: z.string(),
  logicalId: z.string(),
  propertyDiffs: z.array(z.string()).optional(),
});

/** A drift report entry for a single resource. */
export type DriftReport = z.infer<typeof DriftReportSchema>;

/** Schema for a drift detection result. */
export const DriftDetectionResultSchema = z.object({
  stackName: z.string(),
  driftStatus: z.string(),
  driftedResources: z.number(),
});

/** Drift detection result. */
export type DriftDetectionResult = z.infer<
  typeof DriftDetectionResultSchema
>;

/** Schema for a rollback result. */
export const RollbackResultSchema = z.object({
  functionName: z.string(),
  rolledBackTo: z.string(),
  success: z.boolean(),
});

/** Rollback result. */
export type RollbackResult = z.infer<typeof RollbackResultSchema>;

/** Schema for a package build result. */
export const PackageBuildResultSchema = z.object({
  zipSize: z.number(),
  s3Bucket: z.string().optional(),
  s3Key: z.string().optional(),
});

/** Package build result. */
export type PackageBuildResult = z.infer<typeof PackageBuildResultSchema>;

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
 * Get a cached CloudFormationClient for the given region.
 */
function cfn(region?: string): CloudFormationClient {
  return getClient(CloudFormationClient, region);
}

/**
 * Get a cached SSMClient for the given region.
 */
function ssm(region?: string): SSMClient {
  return getClient(SSMClient, region);
}

/**
 * Get a cached S3Client for the given region.
 */
function s3(region?: string): S3Client {
  return getClient(S3Client, region);
}

/**
 * Sleep for a given number of milliseconds.
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Perform a canary deployment by gradually shifting traffic to a new Lambda version.
 *
 * Updates the alias routing configuration to shift traffic in incremental
 * steps (e.g. 10% -> 50% -> 100%). Each step waits for the specified
 * interval before proceeding.
 *
 * @param functionName - The Lambda function name or ARN.
 * @param aliasName - The alias to update (e.g. `"live"`).
 * @param newVersion - The new function version to shift traffic to.
 * @param steps - Array of weight percentages to shift through (default `[10, 50, 100]`).
 * @param interval - Seconds to wait between steps (default 60).
 * @param rollbackOnError - Whether to rollback on errors during deployment (default `true`).
 * @param region - AWS region override.
 * @returns The canary deployment result with final weight and status.
 */
export async function lambdaCanaryDeploy(
  functionName: string,
  aliasName: string,
  newVersion: string,
  steps?: number[],
  interval?: number,
  rollbackOnError?: boolean,
  region?: string,
): Promise<CanaryDeployResult> {
  const weightSteps = steps ?? [10, 50, 100];
  const waitInterval = (interval ?? 60) * 1000;
  const shouldRollback = rollbackOnError ?? true;

  // Get current alias to find the current version
  let currentVersion: string;
  try {
    const aliasResp = await lambda(region).send(
      new GetAliasCommand({
        FunctionName: functionName,
        Name: aliasName,
      }),
    );
    currentVersion = aliasResp.FunctionVersion ?? "$LATEST";
  } catch (err) {
    throw wrapAwsError(
      err,
      `Failed to get alias ${aliasName} for ${functionName}`,
    );
  }

  let currentWeight = 0;

  for (const weight of weightSteps) {
    const normalizedWeight = weight / 100;

    try {
      if (weight >= 100) {
        // Full traffic shift — point alias directly to new version
        await lambda(region).send(
          new UpdateAliasCommand({
            FunctionName: functionName,
            Name: aliasName,
            FunctionVersion: newVersion,
            RoutingConfig: undefined,
          }),
        );
      } else {
        // Partial traffic shift
        await lambda(region).send(
          new UpdateAliasCommand({
            FunctionName: functionName,
            Name: aliasName,
            FunctionVersion: currentVersion,
            RoutingConfig: {
              AdditionalVersionWeights: {
                [newVersion]: normalizedWeight,
              },
            },
          }),
        );
      }

      currentWeight = weight;
    } catch (err) {
      if (shouldRollback) {
        // Attempt rollback to the original version
        try {
          await lambda(region).send(
            new UpdateAliasCommand({
              FunctionName: functionName,
              Name: aliasName,
              FunctionVersion: currentVersion,
              RoutingConfig: undefined,
            }),
          );
        } catch {
          // Rollback failure is non-fatal in this context
        }
      }
      throw wrapAwsError(
        err,
        `Failed canary deploy at ${weight}% for ${functionName}`,
      );
    }

    // Wait between steps unless this is the last step
    if (weight < 100 && weightSteps.indexOf(weight) < weightSteps.length - 1) {
      await sleep(waitInterval);
    }
  }

  return CanaryDeployResultSchema.parse({
    functionName,
    newVersion,
    aliasName,
    currentWeight,
    status: "complete",
  });
}

/**
 * Publish a new Lambda layer version.
 *
 * @param layerName - The layer name.
 * @param zipBuffer - The layer ZIP content as a Uint8Array.
 * @param compatibleRuntimes - Optional list of compatible runtimes (e.g. `["nodejs18.x"]`).
 * @param description - Optional layer description.
 * @param region - AWS region override.
 * @returns The layer publish result with ARN and version number.
 */
export async function lambdaLayerPublisher(
  layerName: string,
  zipBuffer: Uint8Array,
  compatibleRuntimes?: string[],
  description?: string,
  region?: string,
): Promise<LayerPublishResult> {
  try {
    const resp = await lambda(region).send(
      new PublishLayerVersionCommand({
        LayerName: layerName,
        Content: { ZipFile: zipBuffer },
        CompatibleRuntimes: compatibleRuntimes,
        Description: description,
      }),
    );

    return LayerPublishResultSchema.parse({
      layerArn: resp.LayerVersionArn ?? "",
      version: resp.Version ?? 0,
    });
  } catch (err) {
    throw wrapAwsError(
      err,
      `Failed to publish layer ${layerName}`,
    );
  }
}

/**
 * Deploy a CloudFormation stack (create or update).
 *
 * If the stack does not exist, creates it. If it already exists, updates
 * it. Waits for the operation to complete by polling stack status.
 *
 * @param stackName - The CloudFormation stack name.
 * @param templateBody - The template body as a JSON/YAML string.
 * @param templateUrl - The S3 URL of the template (alternative to templateBody).
 * @param parameters - Stack parameters as key-value pairs.
 * @param capabilities - IAM capabilities (e.g. `["CAPABILITY_IAM"]`).
 * @param timeout - Timeout in seconds for stack operations (default 600).
 * @param region - AWS region override.
 * @returns The stack deploy result with status and outputs.
 */
export async function stackDeployer(
  stackName: string,
  templateBody?: string,
  templateUrl?: string,
  parameters?: Record<string, string>,
  capabilities?: string[],
  timeout?: number,
  region?: string,
): Promise<StackDeployResult> {
  const cfnParams = parameters
    ? Object.entries(parameters).map(([key, value]) => ({
        ParameterKey: key,
        ParameterValue: value,
      }))
    : undefined;

  const caps = (capabilities ?? []) as (
    | "CAPABILITY_IAM"
    | "CAPABILITY_NAMED_IAM"
    | "CAPABILITY_AUTO_EXPAND"
  )[];

  // Check if stack exists
  let stackExists = false;
  try {
    const descResp = await cfn(region).send(
      new DescribeStacksCommand({ StackName: stackName }),
    );
    const stack = descResp.Stacks?.[0];
    if (stack && stack.StackStatus !== "DELETE_COMPLETE") {
      stackExists = true;
    }
  } catch {
    // Stack does not exist
  }

  try {
    if (stackExists) {
      await cfn(region).send(
        new UpdateStackCommand({
          StackName: stackName,
          TemplateBody: templateBody,
          TemplateURL: templateUrl,
          Parameters: cfnParams,
          Capabilities: caps.length > 0 ? caps : undefined,
        }),
      );
    } else {
      await cfn(region).send(
        new CreateStackCommand({
          StackName: stackName,
          TemplateBody: templateBody,
          TemplateURL: templateUrl,
          Parameters: cfnParams,
          Capabilities: caps.length > 0 ? caps : undefined,
          TimeoutInMinutes: timeout
            ? Math.ceil(timeout / 60)
            : 10,
        }),
      );
    }
  } catch (err) {
    throw wrapAwsError(
      err,
      `Failed to ${stackExists ? "update" : "create"} stack ${stackName}`,
    );
  }

  // Poll for completion
  const maxWait = (timeout ?? 600) * 1000;
  const deadline = Date.now() + maxWait;

  while (Date.now() < deadline) {
    await sleep(5000);

    try {
      const resp = await cfn(region).send(
        new DescribeStacksCommand({ StackName: stackName }),
      );
      const stack = resp.Stacks?.[0];
      const status = stack?.StackStatus ?? "UNKNOWN";

      if (
        status.endsWith("_COMPLETE") ||
        status.endsWith("_FAILED")
      ) {
        const outputs: Record<string, string> = {};
        for (const out of stack?.Outputs ?? []) {
          if (out.OutputKey && out.OutputValue) {
            outputs[out.OutputKey] = out.OutputValue;
          }
        }

        return StackDeployResultSchema.parse({
          stackName,
          stackId: stack?.StackId,
          status,
          outputs:
            Object.keys(outputs).length > 0 ? outputs : undefined,
        });
      }
    } catch (err) {
      throw wrapAwsError(
        err,
        `Failed to poll stack status for ${stackName}`,
      );
    }
  }

  throw new AwsTimeoutError(
    `Stack ${stackName} did not complete within ${maxWait / 1000}s`,
  );
}

/**
 * Promote SSM parameters from one environment prefix to another.
 *
 * Reads all SSM parameters under the source prefix and copies them to
 * the target prefix, preserving relative paths.
 *
 * @param sourcePrefix - The source SSM parameter path prefix (e.g. `"/app/staging/"`).
 * @param targetPrefix - The target SSM parameter path prefix (e.g. `"/app/prod/"`).
 * @param region - AWS region override.
 * @returns The promotion result with counts.
 */
export async function environmentPromoter(
  sourcePrefix: string,
  targetPrefix: string,
  region?: string,
): Promise<EnvironmentPromoteResult> {
  let parametersCopied = 0;
  let nextToken: string | undefined;

  do {
    try {
      const resp = await ssm(region).send(
        new GetParametersByPathCommand({
          Path: sourcePrefix,
          Recursive: true,
          WithDecryption: true,
          NextToken: nextToken,
        }),
      );

      for (const param of resp.Parameters ?? []) {
        if (!param.Name || param.Value === undefined) {
          continue;
        }

        // Replace source prefix with target prefix
        const relativeName = param.Name.slice(sourcePrefix.length);
        const targetName = `${targetPrefix}${relativeName}`;

        try {
          await ssm(region).send(
            new PutParameterCommand({
              Name: targetName,
              Value: param.Value,
              Type: param.Type,
              Overwrite: true,
            }),
          );
          parametersCopied++;
        } catch (err) {
          throw wrapAwsError(
            err,
            `Failed to put parameter ${targetName}`,
          );
        }
      }

      nextToken = resp.NextToken;
    } catch (err) {
      if (err instanceof Error && err.message.includes("Failed to put")) {
        throw err;
      }
      throw wrapAwsError(
        err,
        `Failed to read parameters from ${sourcePrefix}`,
      );
    }
  } while (nextToken);

  return EnvironmentPromoteResultSchema.parse({
    sourceEnv: sourcePrefix,
    targetEnv: targetPrefix,
    parametersCopied,
  });
}

/**
 * Warm a Lambda function by invoking it concurrently.
 *
 * Sends N concurrent invocations with a warm-up payload to keep
 * execution environments hot and reduce cold starts.
 *
 * @param functionName - The Lambda function name or ARN.
 * @param count - Number of concurrent warm-up invocations (default 5).
 * @param payload - Custom warm-up payload (default `{"__warmup": true}`).
 * @param region - AWS region override.
 * @returns The warmer result with invocation count and average latency.
 */
export async function lambdaWarmer(
  functionName: string,
  count?: number,
  payload?: unknown,
  region?: string,
): Promise<LambdaWarmerResult> {
  const invocationCount = count ?? 5;
  const warmPayload = payload ?? { __warmup: true };
  const payloadBytes = new TextEncoder().encode(
    JSON.stringify(warmPayload),
  );

  const startTimes: number[] = [];
  const endTimes: number[] = [];

  const promises = Array.from(
    { length: invocationCount },
    async (_, i) => {
      const start = Date.now();
      startTimes[i] = start;
      try {
        await lambda(region).send(
          new InvokeCommand({
            FunctionName: functionName,
            InvocationType: "RequestResponse",
            Payload: payloadBytes,
          }),
        );
      } catch {
        // Warm-up failures are non-fatal
      }
      endTimes[i] = Date.now();
    },
  );

  await Promise.all(promises);

  const latencies = startTimes.map((s, i) => endTimes[i] - s);
  const avgLatency =
    latencies.length > 0
      ? latencies.reduce((a, b) => a + b, 0) / latencies.length
      : undefined;

  return LambdaWarmerResultSchema.parse({
    functionName,
    invocations: invocationCount,
    averageLatency: avgLatency ? Math.round(avgLatency) : undefined,
  });
}

/**
 * Detect configuration drift in a CloudFormation stack.
 *
 * Initiates drift detection and polls until it completes, then returns
 * the drift status and count of drifted resources.
 *
 * @param stackName - The CloudFormation stack name.
 * @param region - AWS region override.
 * @returns The drift detection result.
 */
export async function configDriftDetector(
  stackName: string,
  region?: string,
): Promise<DriftDetectionResult> {
  let detectionId: string;
  try {
    const resp = await cfn(region).send(
      new DetectStackDriftCommand({ StackName: stackName }),
    );
    detectionId = resp.StackDriftDetectionId ?? "";
  } catch (err) {
    throw wrapAwsError(
      err,
      `Failed to start drift detection for ${stackName}`,
    );
  }

  // Poll for completion
  const maxAttempts = 60;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await sleep(2000);

    try {
      const resp = await cfn(region).send(
        new DescribeStackDriftDetectionStatusCommand({
          StackDriftDetectionId: detectionId,
        }),
      );

      const detectionStatus = resp.DetectionStatus ?? "UNKNOWN";
      if (
        detectionStatus === "DETECTION_COMPLETE" ||
        detectionStatus === "DETECTION_FAILED"
      ) {
        const driftStatus = resp.StackDriftStatus ?? "UNKNOWN";
        let driftedResources = 0;

        if (driftStatus === "DRIFTED") {
          try {
            const driftResp = await cfn(region).send(
              new DescribeStackResourceDriftsCommand({
                StackName: stackName,
                StackResourceDriftStatusFilters: ["MODIFIED", "DELETED"],
              }),
            );
            driftedResources =
              driftResp.StackResourceDrifts?.length ?? 0;
          } catch {
            // Resource drift details unavailable
          }
        }

        return DriftDetectionResultSchema.parse({
          stackName,
          driftStatus,
          driftedResources,
        });
      }
    } catch (err) {
      throw wrapAwsError(
        err,
        `Failed to check drift detection status for ${stackName}`,
      );
    }
  }

  return DriftDetectionResultSchema.parse({
    stackName,
    driftStatus: "DETECTION_TIMEOUT",
    driftedResources: 0,
  });
}

/**
 * Rollback a Lambda alias to the previous version.
 *
 * Finds the version currently pointed to by the alias, lists all
 * function versions to find the immediately preceding one, and updates
 * the alias to point to it.
 *
 * @param functionName - The Lambda function name or ARN.
 * @param aliasName - The alias to rollback.
 * @param region - AWS region override.
 * @returns The rollback result with the version rolled back to.
 */
export async function rollbackManager(
  functionName: string,
  aliasName: string,
  region?: string,
): Promise<RollbackResult> {
  // Get current alias version
  let currentVersion: string;
  try {
    const aliasResp = await lambda(region).send(
      new GetAliasCommand({
        FunctionName: functionName,
        Name: aliasName,
      }),
    );
    currentVersion = aliasResp.FunctionVersion ?? "$LATEST";
  } catch (err) {
    throw wrapAwsError(
      err,
      `Failed to get alias ${aliasName} for ${functionName}`,
    );
  }

  // List all versions and find the previous one
  let previousVersion: string | undefined;
  try {
    const versionsResp = await lambda(region).send(
      new ListVersionsByFunctionCommand({
        FunctionName: functionName,
      }),
    );

    const versions = (versionsResp.Versions ?? [])
      .map((v) => v.Version ?? "")
      .filter((v) => v !== "$LATEST" && v !== "")
      .sort((a, b) => parseInt(b) - parseInt(a));

    const currentIdx = versions.indexOf(currentVersion);
    if (currentIdx >= 0 && currentIdx < versions.length - 1) {
      previousVersion = versions[currentIdx + 1];
    }
  } catch (err) {
    throw wrapAwsError(
      err,
      `Failed to list versions for ${functionName}`,
    );
  }

  if (!previousVersion) {
    return RollbackResultSchema.parse({
      functionName,
      rolledBackTo: currentVersion,
      success: false,
    });
  }

  // Update alias to previous version
  try {
    await lambda(region).send(
      new UpdateAliasCommand({
        FunctionName: functionName,
        Name: aliasName,
        FunctionVersion: previousVersion,
        RoutingConfig: undefined,
      }),
    );
  } catch (err) {
    throw wrapAwsError(
      err,
      `Failed to rollback alias ${aliasName} to version ${previousVersion}`,
    );
  }

  return RollbackResultSchema.parse({
    functionName,
    rolledBackTo: previousVersion,
    success: true,
  });
}

/**
 * Build a Lambda deployment package from a directory.
 *
 * Reads all files in the specified directory, creates an in-memory
 * representation of the content, and optionally uploads it to S3.
 * Note: This produces a simple concatenated buffer (not a real ZIP) for
 * size estimation. For production use, integrate a proper ZIP library.
 *
 * @param directory - The directory path to package.
 * @param s3Bucket - Optional S3 bucket for uploading the package.
 * @param s3Key - Optional S3 key for the uploaded package.
 * @param region - AWS region override.
 * @returns The package build result with size and optional S3 location.
 */
// ---------------------------------------------------------------------------
// Extended deployment schemas
// ---------------------------------------------------------------------------

/** Schema for a CloudFront invalidation with logging result. */
export const CloudfrontInvalidationResultSchema = z.object({
  distributionId: z.string(),
  invalidationId: z.string(),
  paths: z.array(z.string()),
  status: z.string(),
  logged: z.boolean(),
});
/** CloudFront invalidation with logging result. */
export type CloudfrontInvalidationResult = z.infer<typeof CloudfrontInvalidationResultSchema>;

/** Schema for an Elastic Beanstalk environment refresh result. */
export const ElasticBeanstalkEnvRefreshResultSchema = z.object({
  applicationName: z.string(),
  environmentName: z.string(),
  versionLabel: z.string(),
  status: z.string(),
  refreshed: z.boolean(),
});
/** Elastic Beanstalk environment refresh result. */
export type ElasticBeanstalkEnvRefreshResult = z.infer<typeof ElasticBeanstalkEnvRefreshResultSchema>;

/** Schema for an App Runner auto-deployer result. */
export const AppRunnerAutoDeployerResultSchema = z.object({
  serviceArn: z.string(),
  operationId: z.string(),
  status: z.string(),
  imageUri: z.string(),
});
/** App Runner auto-deployer result. */
export type AppRunnerAutoDeployerResult = z.infer<typeof AppRunnerAutoDeployerResultSchema>;

/** Schema for an EKS node group scaler result. */
export const EksNodeGroupScalerResultSchema = z.object({
  clusterName: z.string(),
  nodegroupName: z.string(),
  desiredSize: z.number(),
  minSize: z.number(),
  maxSize: z.number(),
  scaled: z.boolean(),
});
/** EKS node group scaler result. */
export type EksNodeGroupScalerResult = z.infer<typeof EksNodeGroupScalerResultSchema>;

/** Schema for an EKS ConfigMap sync result. */
export const EksConfigMapSyncResultSchema = z.object({
  clusterName: z.string(),
  namespace: z.string(),
  configMapName: z.string(),
  keysUpdated: z.number(),
  synced: z.boolean(),
});
/** EKS ConfigMap sync result. */
export type EksConfigMapSyncResult = z.infer<typeof EksConfigMapSyncResultSchema>;

/** Schema for a Batch job monitor result. */
export const BatchJobMonitorResultSchema = z.object({
  jobId: z.string(),
  jobName: z.string(),
  status: z.string(),
  exitCode: z.number().optional(),
  logStreamName: z.string().optional(),
  alertSent: z.boolean(),
});
/** Batch job monitor result. */
export type BatchJobMonitorResult = z.infer<typeof BatchJobMonitorResultSchema>;

/** Schema for an Auto Scaling scheduled action manager result. */
export const AutoscalingScheduledActionResultSchema = z.object({
  autoScalingGroupName: z.string(),
  scheduledActionName: z.string(),
  recurrence: z.string(),
  minSize: z.number(),
  maxSize: z.number(),
  desiredCapacity: z.number(),
  action: z.string(),
});
/** Auto Scaling scheduled action manager result. */
export type AutoscalingScheduledActionResult = z.infer<typeof AutoscalingScheduledActionResultSchema>;

/** Schema for a Step Functions execution tracker result. */
export const StepfunctionsExecutionTrackerResultSchema = z.object({
  executionArn: z.string(),
  stateMachineArn: z.string(),
  status: z.string(),
  startDate: z.string(),
  stopDate: z.string().optional(),
  failedStates: z.array(z.string()),
  alertSent: z.boolean(),
});
/** Step Functions execution tracker result. */
export type StepfunctionsExecutionTrackerResult = z.infer<typeof StepfunctionsExecutionTrackerResultSchema>;

// ---------------------------------------------------------------------------
// Extended deployment functions
// ---------------------------------------------------------------------------

/** Invalidate a CloudFront distribution cache and log the operation to DynamoDB. */
export async function cloudfrontInvalidationWithLogging(
  distributionId: string,
  paths: string[],
  logTableName?: string,
  region?: string,
): Promise<CloudfrontInvalidationResult> {
  const client = lambda(region);
  try {
    // TODO: implement cloudfrontInvalidationWithLogging
    throw new Error("cloudfrontInvalidationWithLogging not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "cloudfrontInvalidationWithLogging failed");
  }
}

/** Deploy a new application version to an Elastic Beanstalk environment. */
export async function elasticBeanstalkEnvRefresher(
  applicationName: string,
  environmentName: string,
  versionLabel: string,
  waitForCompletion?: boolean,
  region?: string,
): Promise<ElasticBeanstalkEnvRefreshResult> {
  const client = lambda(region);
  try {
    // TODO: implement elasticBeanstalkEnvRefresher
    throw new Error("elasticBeanstalkEnvRefresher not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "elasticBeanstalkEnvRefresher failed");
  }
}

/** Trigger a redeployment for an AWS App Runner service from a new container image. */
export async function appRunnerAutoDeployer(
  serviceArn: string,
  imageUri: string,
  region?: string,
): Promise<AppRunnerAutoDeployerResult> {
  const client = lambda(region);
  try {
    // TODO: implement appRunnerAutoDeployer
    throw new Error("appRunnerAutoDeployer not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "appRunnerAutoDeployer failed");
  }
}

/** Scale an EKS managed node group to a specified desired size. */
export async function eksNodeGroupScaler(
  clusterName: string,
  nodegroupName: string,
  desiredSize: number,
  minSize?: number,
  maxSize?: number,
  region?: string,
): Promise<EksNodeGroupScalerResult> {
  const client = lambda(region);
  try {
    // TODO: implement eksNodeGroupScaler
    throw new Error("eksNodeGroupScaler not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "eksNodeGroupScaler failed");
  }
}

/** Sync key-value pairs from SSM Parameter Store into an EKS ConfigMap. */
export async function eksConfigMapSync(
  clusterName: string,
  namespace: string,
  configMapName: string,
  ssmPrefix: string,
  region?: string,
): Promise<EksConfigMapSyncResult> {
  const client = lambda(region);
  try {
    // TODO: implement eksConfigMapSync
    throw new Error("eksConfigMapSync not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "eksConfigMapSync failed");
  }
}

/** Monitor an AWS Batch job to completion and alert on failure. */
export async function batchJobMonitor(
  jobId: string,
  snsTopicArn?: string,
  pollIntervalSeconds?: number,
  timeoutSeconds?: number,
  region?: string,
): Promise<BatchJobMonitorResult> {
  const client = lambda(region);
  try {
    // TODO: implement batchJobMonitor
    throw new Error("batchJobMonitor not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batchJobMonitor failed");
  }
}

/** Create or update Auto Scaling scheduled actions for recurring scale events. */
export async function autoscalingScheduledActionManager(
  autoScalingGroupName: string,
  scheduledActionName: string,
  recurrence: string,
  minSize: number,
  maxSize: number,
  desiredCapacity: number,
  action?: "create" | "update" | "delete",
  region?: string,
): Promise<AutoscalingScheduledActionResult> {
  const client = lambda(region);
  try {
    // TODO: implement autoscalingScheduledActionManager
    throw new Error("autoscalingScheduledActionManager not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "autoscalingScheduledActionManager failed");
  }
}

/** Track a Step Functions execution to completion and alert on failure. */
export async function stepfunctionsExecutionTracker(
  executionArn: string,
  snsTopicArn?: string,
  pollIntervalSeconds?: number,
  timeoutSeconds?: number,
  region?: string,
): Promise<StepfunctionsExecutionTrackerResult> {
  const client = lambda(region);
  try {
    // TODO: implement stepfunctionsExecutionTracker
    throw new Error("stepfunctionsExecutionTracker not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "stepfunctionsExecutionTracker failed");
  }
}

export async function lambdaPackageBuilder(
  directory: string,
  s3Bucket?: string,
  s3Key?: string,
  region?: string,
): Promise<PackageBuildResult> {
  // Recursively collect all files
  const allFiles: { path: string; content: Buffer }[] = [];

  async function collectFiles(dir: string): Promise<void> {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        await collectFiles(fullPath);
      } else if (entry.isFile()) {
        const content = await readFile(fullPath);
        allFiles.push({
          path: relative(directory, fullPath),
          content,
        });
      }
    }
  }

  try {
    await collectFiles(directory);
  } catch (err) {
    throw new Error(
      `Failed to read directory ${directory}: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  // Build a simple concatenated buffer for size estimation
  const buffers = allFiles.map((f) => f.content);
  const totalSize = buffers.reduce((sum, b) => sum + b.length, 0);

  // Upload to S3 if bucket and key are provided
  if (s3Bucket && s3Key) {
    const combined = Buffer.concat(buffers);
    try {
      await s3(region).send(
        new PutObjectCommand({
          Bucket: s3Bucket,
          Key: s3Key,
          Body: combined,
          ContentType: "application/zip",
        }),
      );
    } catch (err) {
      throw wrapAwsError(
        err,
        `Failed to upload package to s3://${s3Bucket}/${s3Key}`,
      );
    }
  }

  return PackageBuildResultSchema.parse({
    zipSize: totalSize,
    s3Bucket,
    s3Key,
  });
}
