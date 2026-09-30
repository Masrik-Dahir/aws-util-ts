/**
 * aws-util/infra-automation — Multi-service infrastructure automation.
 *
 * Provides typed helpers for scheduled auto-scaling, CloudFormation stack
 * output resolution, resource cleanup scheduling, multi-region DNS failover,
 * infrastructure diff reporting, Lambda VPC connectivity, API Gateway stage
 * management, and CloudFormation custom resource lifecycle handling.
 *
 * Multi-service: CloudFormation + Lambda + EC2 + Route53 + API Gateway +
 * Application Auto Scaling.
 *
 * All async functions obtain clients via {@link getClient} and wrap errors
 * through {@link wrapAwsError}.
 *
 * @example
 * ```ts
 * import {
 *   scheduledScalingManager,
 *   stackOutputResolver,
 *   resourceCleanupScheduler,
 *   multiRegionFailover,
 *   infrastructureDiffReporter,
 *   lambdaVpcConnector,
 *   apiGatewayStageManager,
 *   customResourceHandler,
 * } from "./infra-automation.js";
 *
 * const outputs = await stackOutputResolver("my-stack");
 * const diff = await infrastructureDiffReporter("my-stack", templateBody);
 * ```
 *
 * @module
 */

import { z } from "zod";
import {
  CloudFormationClient,
  DescribeStacksCommand,
  CreateChangeSetCommand,
  DescribeChangeSetCommand,
  DeleteChangeSetCommand,
} from "@aws-sdk/client-cloudformation";
import {
  LambdaClient,
  UpdateFunctionConfigurationCommand,
} from "@aws-sdk/client-lambda";
import {
  EC2Client,
  DescribeInstancesCommand,
  TerminateInstancesCommand,
  DescribeSubnetsCommand,
} from "@aws-sdk/client-ec2";
import {
  Route53Client,
  ChangeResourceRecordSetsCommand,
} from "@aws-sdk/client-route-53";
import {
  APIGatewayClient,
  CreateStageCommand,
  UpdateStageCommand,
  GetStageCommand,
  CreateDeploymentCommand,
} from "@aws-sdk/client-api-gateway";
import {
  ApplicationAutoScalingClient,
  RegisterScalableTargetCommand,
  PutScheduledActionCommand,
} from "@aws-sdk/client-application-auto-scaling";
import {
  S3Client,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getClient } from "./client.js";
import { wrapAwsError } from "./exceptions.js";

// ---------------------------------------------------------------------------
// Zod schemas & inferred types
// ---------------------------------------------------------------------------

/** Schema for a scheduled scaling result. */
export const ScheduledScalingResultSchema = z.object({
  resourceId: z.string(),
  scalableTargetArn: z.string().optional(),
  policyNames: z.array(z.string()),
});

/** A scheduled scaling result. */
export type ScheduledScalingResult = z.infer<
  typeof ScheduledScalingResultSchema
>;

/** Schema for a stack output result. */
export const StackOutputResultSchema = z.object({
  stackName: z.string(),
  outputs: z.record(z.string(), z.string()),
});

/** A stack output result. */
export type StackOutputResult = z.infer<typeof StackOutputResultSchema>;

/** Schema for a resource cleanup result. */
export const ResourceCleanupResultSchema = z.object({
  resourcesDeleted: z.number(),
  errors: z.array(z.string()),
});

/** A resource cleanup result. */
export type ResourceCleanupResult = z.infer<
  typeof ResourceCleanupResultSchema
>;

/** Schema for a multi-region failover result. */
export const MultiRegionFailoverResultSchema = z.object({
  primaryRegion: z.string(),
  failoverRegion: z.string(),
  status: z.string(),
});

/** A multi-region failover result. */
export type MultiRegionFailoverResult = z.infer<
  typeof MultiRegionFailoverResultSchema
>;

/** Schema for an infrastructure diff result. */
export const InfrastructureDiffResultSchema = z.object({
  stackName: z.string(),
  changes: z.array(
    z.object({
      action: z.string(),
      logicalId: z.string(),
      resourceType: z.string(),
    }),
  ),
});

/** An infrastructure diff result. */
export type InfrastructureDiffResult = z.infer<
  typeof InfrastructureDiffResultSchema
>;

/** Schema for a Lambda VPC connector result. */
export const LambdaVpcResultSchema = z.object({
  functionName: z.string(),
  vpcId: z.string(),
  subnetIds: z.array(z.string()),
  securityGroupIds: z.array(z.string()),
});

/** A Lambda VPC connector result. */
export type LambdaVpcResult = z.infer<typeof LambdaVpcResultSchema>;

/** Schema for an API Gateway stage result. */
export const ApiGatewayStageResultSchema = z.object({
  apiId: z.string(),
  stageName: z.string(),
  stageArn: z.string().optional(),
});

/** An API Gateway stage result. */
export type ApiGatewayStageResult = z.infer<
  typeof ApiGatewayStageResultSchema
>;

/** Schema for a custom resource response. */
export const CustomResourceResponseSchema = z.object({
  status: z.enum(["SUCCESS", "FAILED"]),
  physicalResourceId: z.string(),
  data: z.record(z.string(), z.string()).optional(),
});

/** A custom resource response. */
export type CustomResourceResponse = z.infer<
  typeof CustomResourceResponseSchema
>;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Register a scalable target and create a scheduled scaling action.
 *
 * Uses Application Auto Scaling to register the target resource and
 * attach a scheduled action that adjusts capacity on the given schedule.
 *
 * @param resourceId - The resource identifier (e.g. "table/MyTable").
 * @param scalableDimension - The scalable dimension (e.g. "dynamodb:table:ReadCapacityUnits").
 * @param serviceNamespace - The AWS service namespace (e.g. "dynamodb").
 * @param minCapacity - Minimum capacity.
 * @param maxCapacity - Maximum capacity.
 * @param scheduleExpression - Cron or rate expression (e.g. "cron(0 8 * * ? *)").
 * @param region - Optional AWS region.
 * @returns A validated {@link ScheduledScalingResult}.
 *
 * @example
 * ```ts
 * const result = await scheduledScalingManager(
 *   "table/MyTable",
 *   "dynamodb:table:ReadCapacityUnits",
 *   "dynamodb",
 *   5, 100,
 *   "cron(0 8 * * ? *)",
 * );
 * ```
 */
export async function scheduledScalingManager(
  resourceId: string,
  scalableDimension: string,
  serviceNamespace: string,
  minCapacity: number,
  maxCapacity: number,
  scheduleExpression: string,
  region?: string,
): Promise<ScheduledScalingResult> {
  try {
    const autoscaling = getClient(
      ApplicationAutoScalingClient,
      region,
    );

    // Register scalable target
    const registerResponse = await autoscaling.send(
      new RegisterScalableTargetCommand({
        ServiceNamespace: serviceNamespace as
          | "ecs"
          | "elasticmapreduce"
          | "ec2"
          | "appstream"
          | "dynamodb"
          | "rds"
          | "sagemaker"
          | "custom-resource"
          | "comprehend"
          | "lambda"
          | "cassandra"
          | "kafka"
          | "elasticache"
          | "neptune",
        ResourceId: resourceId,
        ScalableDimension: scalableDimension as
          | "dynamodb:table:ReadCapacityUnits"
          | "dynamodb:table:WriteCapacityUnits"
          | "dynamodb:index:ReadCapacityUnits"
          | "dynamodb:index:WriteCapacityUnits"
          | "ecs:service:DesiredCount"
          | "rds:cluster:ReadReplicaCount"
          | "lambda:function:ProvisionedConcurrency",
        MinCapacity: minCapacity,
        MaxCapacity: maxCapacity,
      }),
    );

    // Create scheduled action
    const actionName = `scheduled-${resourceId.replace(/[/:]/g, "-")}`;
    await autoscaling.send(
      new PutScheduledActionCommand({
        ServiceNamespace: serviceNamespace as
          | "ecs"
          | "elasticmapreduce"
          | "ec2"
          | "appstream"
          | "dynamodb"
          | "rds"
          | "sagemaker"
          | "custom-resource"
          | "comprehend"
          | "lambda"
          | "cassandra"
          | "kafka"
          | "elasticache"
          | "neptune",
        ScheduledActionName: actionName,
        ResourceId: resourceId,
        ScalableDimension: scalableDimension as
          | "dynamodb:table:ReadCapacityUnits"
          | "dynamodb:table:WriteCapacityUnits"
          | "dynamodb:index:ReadCapacityUnits"
          | "dynamodb:index:WriteCapacityUnits"
          | "ecs:service:DesiredCount"
          | "rds:cluster:ReadReplicaCount"
          | "lambda:function:ProvisionedConcurrency",
        Schedule: scheduleExpression,
        ScalableTargetAction: {
          MinCapacity: minCapacity,
          MaxCapacity: maxCapacity,
        },
      }),
    );

    return ScheduledScalingResultSchema.parse({
      resourceId,
      scalableTargetArn:
        registerResponse.ScalableTargetARN ?? undefined,
      policyNames: [actionName],
    });
  } catch (err) {
    throw wrapAwsError(err, "scheduledScalingManager failed");
  }
}

/**
 * Resolve CloudFormation stack outputs into a key-value map.
 *
 * Optionally filter to a subset of output keys. If `outputKeys` is
 * omitted, all outputs are returned.
 *
 * @param stackName - The CloudFormation stack name or ID.
 * @param outputKeys - Optional list of output keys to include.
 * @param region - Optional AWS region.
 * @returns A validated {@link StackOutputResult}.
 *
 * @example
 * ```ts
 * const result = await stackOutputResolver("my-stack", ["ApiUrl", "TableName"]);
 * console.log(result.outputs.ApiUrl);
 * ```
 */
export async function stackOutputResolver(
  stackName: string,
  outputKeys?: string[],
  region?: string,
): Promise<StackOutputResult> {
  try {
    const cfn = getClient(CloudFormationClient, region);

    const response = await cfn.send(
      new DescribeStacksCommand({ StackName: stackName }),
    );

    const stack = response.Stacks?.[0];
    if (!stack) {
      throw new Error(`Stack "${stackName}" not found`);
    }

    const outputs: Record<string, string> = {};
    for (const output of stack.Outputs ?? []) {
      const key = output.OutputKey ?? "";
      const value = output.OutputValue ?? "";
      if (outputKeys) {
        if (outputKeys.includes(key)) {
          outputs[key] = value;
        }
      } else {
        outputs[key] = value;
      }
    }

    return StackOutputResultSchema.parse({
      stackName,
      outputs,
    });
  } catch (err) {
    throw wrapAwsError(err, "stackOutputResolver failed");
  }
}

/**
 * Delete expired resources based on their scheduled deletion time.
 *
 * Each resource descriptor includes a `deleteAfter` ISO timestamp.
 * Resources whose time has passed are deleted. Supports EC2 instances
 * and S3 objects.
 *
 * @param resources - Array of resource descriptors.
 * @param region - Optional AWS region.
 * @returns A validated {@link ResourceCleanupResult}.
 *
 * @example
 * ```ts
 * const result = await resourceCleanupScheduler([
 *   { type: "ec2", id: "i-1234567890abcdef0", deleteAfter: "2024-01-01T00:00:00Z" },
 *   { type: "s3", id: "my-bucket/temp-file.txt", deleteAfter: "2024-01-01T00:00:00Z" },
 * ]);
 * console.log(result.resourcesDeleted);
 * ```
 */
export async function resourceCleanupScheduler(
  resources: Array<{
    type: string;
    id: string;
    deleteAfter: string;
  }>,
  region?: string,
): Promise<ResourceCleanupResult> {
  const now = new Date();
  let deleted = 0;
  const errors: string[] = [];

  for (const resource of resources) {
    const deleteAfter = new Date(resource.deleteAfter);
    if (deleteAfter > now) {
      continue; // Not yet expired
    }

    try {
      switch (resource.type) {
        case "ec2": {
          const ec2 = getClient(EC2Client, region);
          await ec2.send(
            new TerminateInstancesCommand({
              InstanceIds: [resource.id],
            }),
          );
          deleted++;
          break;
        }
        case "s3": {
          const s3 = getClient(S3Client, region);
          const parts = resource.id.split("/");
          const bucket = parts[0];
          const key = parts.slice(1).join("/");
          await s3.send(
            new DeleteObjectCommand({ Bucket: bucket, Key: key }),
          );
          deleted++;
          break;
        }
        default:
          errors.push(
            `Unsupported resource type: ${resource.type}`,
          );
      }
    } catch (err) {
      errors.push(
        `Failed to delete ${resource.type}/${resource.id}: ` +
          `${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  return ResourceCleanupResultSchema.parse({
    resourcesDeleted: deleted,
    errors,
  });
}

/**
 * Configure Route53 DNS failover between primary and failover regions.
 *
 * Creates or updates Route53 failover routing records so that traffic
 * automatically shifts from the primary endpoint to the failover endpoint
 * when the primary becomes unhealthy.
 *
 * @param primaryRegion - The primary AWS region identifier.
 * @param failoverRegion - The failover AWS region identifier.
 * @param hostedZoneId - The Route53 hosted zone ID.
 * @param recordName - The DNS record name (e.g. "api.example.com").
 * @param primaryEndpoint - The primary endpoint value (IP or CNAME).
 * @param failoverEndpoint - The failover endpoint value.
 * @returns A validated {@link MultiRegionFailoverResult}.
 *
 * @example
 * ```ts
 * const result = await multiRegionFailover(
 *   "us-east-1", "us-west-2",
 *   "Z1234567890",
 *   "api.example.com",
 *   "primary.elb.us-east-1.amazonaws.com",
 *   "failover.elb.us-west-2.amazonaws.com",
 * );
 * ```
 */
export async function multiRegionFailover(
  primaryRegion: string,
  failoverRegion: string,
  hostedZoneId: string,
  recordName: string,
  primaryEndpoint: string,
  failoverEndpoint: string,
): Promise<MultiRegionFailoverResult> {
  try {
    const route53 = getClient(Route53Client);

    await route53.send(
      new ChangeResourceRecordSetsCommand({
        HostedZoneId: hostedZoneId,
        ChangeBatch: {
          Changes: [
            {
              Action: "UPSERT",
              ResourceRecordSet: {
                Name: recordName,
                Type: "CNAME",
                SetIdentifier: "primary",
                Failover: "PRIMARY",
                TTL: 60,
                ResourceRecords: [{ Value: primaryEndpoint }],
              },
            },
            {
              Action: "UPSERT",
              ResourceRecordSet: {
                Name: recordName,
                Type: "CNAME",
                SetIdentifier: "secondary",
                Failover: "SECONDARY",
                TTL: 60,
                ResourceRecords: [{ Value: failoverEndpoint }],
              },
            },
          ],
        },
      }),
    );

    return MultiRegionFailoverResultSchema.parse({
      primaryRegion,
      failoverRegion,
      status: "configured",
    });
  } catch (err) {
    throw wrapAwsError(err, "multiRegionFailover failed");
  }
}

/**
 * Generate a diff report for a CloudFormation stack update.
 *
 * Creates a change set against the existing stack, reads the proposed
 * changes, and then deletes the change set. The result lists each
 * resource change with its action (Add, Modify, Remove), logical ID,
 * and resource type.
 *
 * @param stackName - The CloudFormation stack name.
 * @param newTemplateBody - The new template body (JSON or YAML string).
 * @param region - Optional AWS region.
 * @returns A validated {@link InfrastructureDiffResult}.
 *
 * @example
 * ```ts
 * const diff = await infrastructureDiffReporter(
 *   "my-stack",
 *   JSON.stringify(newTemplate),
 * );
 * for (const change of diff.changes) {
 *   console.log(`${change.action} ${change.logicalId} (${change.resourceType})`);
 * }
 * ```
 */
export async function infrastructureDiffReporter(
  stackName: string,
  newTemplateBody: string,
  region?: string,
): Promise<InfrastructureDiffResult> {
  try {
    const cfn = getClient(CloudFormationClient, region);
    const changeSetName = `aws-util-diff-${Date.now()}`;

    // Create change set
    await cfn.send(
      new CreateChangeSetCommand({
        StackName: stackName,
        ChangeSetName: changeSetName,
        TemplateBody: newTemplateBody,
        ChangeSetType: "UPDATE",
      }),
    );

    // Wait briefly for change set creation, then describe it
    // Poll until the change set is ready
    let status = "CREATE_PENDING";
    let describeResponse;
    const maxAttempts = 30;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      describeResponse = await cfn.send(
        new DescribeChangeSetCommand({
          StackName: stackName,
          ChangeSetName: changeSetName,
        }),
      );
      status = describeResponse.Status ?? "FAILED";
      if (
        status === "CREATE_COMPLETE" ||
        status === "FAILED"
      ) {
        break;
      }
      // Brief wait before next poll
      await new Promise((resolve) =>
        setTimeout(resolve, 1000),
      );
    }

    const changes: Array<{
      action: string;
      logicalId: string;
      resourceType: string;
    }> = [];

    if (describeResponse && status === "CREATE_COMPLETE") {
      for (const change of describeResponse.Changes ?? []) {
        const rc = change.ResourceChange;
        if (rc) {
          changes.push({
            action: rc.Action ?? "Unknown",
            logicalId: rc.LogicalResourceId ?? "Unknown",
            resourceType: rc.ResourceType ?? "Unknown",
          });
        }
      }
    }

    // Clean up the change set
    try {
      await cfn.send(
        new DeleteChangeSetCommand({
          StackName: stackName,
          ChangeSetName: changeSetName,
        }),
      );
    } catch {
      // Best-effort cleanup
    }

    return InfrastructureDiffResultSchema.parse({
      stackName,
      changes,
    });
  } catch (err) {
    throw wrapAwsError(err, "infrastructureDiffReporter failed");
  }
}

/**
 * Attach a Lambda function to a VPC with specified subnets and security groups.
 *
 * Updates the Lambda function's VPC configuration using
 * `UpdateFunctionConfiguration`.
 *
 * @param functionName - The Lambda function name or ARN.
 * @param vpcId - The VPC ID (used for the result; Lambda config uses subnets/SGs).
 * @param subnetIds - Array of subnet IDs.
 * @param securityGroupIds - Array of security group IDs.
 * @param region - Optional AWS region.
 * @returns A validated {@link LambdaVpcResult}.
 *
 * @example
 * ```ts
 * const result = await lambdaVpcConnector(
 *   "my-function",
 *   "vpc-12345",
 *   ["subnet-aaa", "subnet-bbb"],
 *   ["sg-111"],
 * );
 * ```
 */
export async function lambdaVpcConnector(
  functionName: string,
  vpcId: string,
  subnetIds: string[],
  securityGroupIds: string[],
  region?: string,
): Promise<LambdaVpcResult> {
  try {
    const lambda = getClient(LambdaClient, region);

    await lambda.send(
      new UpdateFunctionConfigurationCommand({
        FunctionName: functionName,
        VpcConfig: {
          SubnetIds: subnetIds,
          SecurityGroupIds: securityGroupIds,
        },
      }),
    );

    return LambdaVpcResultSchema.parse({
      functionName,
      vpcId,
      subnetIds,
      securityGroupIds,
    });
  } catch (err) {
    throw wrapAwsError(err, "lambdaVpcConnector failed");
  }
}

/**
 * Create or update an API Gateway REST API stage.
 *
 * Attempts to create a new stage. If the stage already exists, updates
 * the stage variables instead. A deployment is created first to ensure
 * the stage has something to point to.
 *
 * @param apiId - The REST API ID.
 * @param stageName - The stage name (e.g. "prod", "staging").
 * @param stageVariables - Optional key-value stage variables.
 * @param region - Optional AWS region.
 * @returns A validated {@link ApiGatewayStageResult}.
 *
 * @example
 * ```ts
 * const result = await apiGatewayStageManager(
 *   "abc123",
 *   "prod",
 *   { version: "2.0" },
 * );
 * ```
 */
export async function apiGatewayStageManager(
  apiId: string,
  stageName: string,
  stageVariables?: Record<string, string>,
  region?: string,
): Promise<ApiGatewayStageResult> {
  try {
    const apigw = getClient(APIGatewayClient, region);

    // Create a deployment first
    const deployment = await apigw.send(
      new CreateDeploymentCommand({
        restApiId: apiId,
        description: `Deployment for stage ${stageName}`,
      }),
    );

    const deploymentId = deployment.id ?? "";

    try {
      // Try to create the stage
      await apigw.send(
        new CreateStageCommand({
          restApiId: apiId,
          stageName,
          deploymentId,
          variables: stageVariables,
        }),
      );
    } catch (createErr) {
      // Stage may already exist — update it instead
      const code =
        createErr != null && typeof createErr === "object"
          ? (createErr as Record<string, unknown>)["name"]
          : undefined;
      if (code === "ConflictException") {
        const patchOps: Array<{
          op: "add" | "remove" | "replace";
          path: string;
          value?: string;
        }> = [
          {
            op: "replace",
            path: "/deploymentId",
            value: deploymentId,
          },
        ];

        if (stageVariables) {
          for (const [key, value] of Object.entries(
            stageVariables,
          )) {
            patchOps.push({
              op: "replace",
              path: `/variables/${key}`,
              value,
            });
          }
        }

        await apigw.send(
          new UpdateStageCommand({
            restApiId: apiId,
            stageName,
            patchOperations: patchOps,
          }),
        );
      } else {
        throw createErr;
      }
    }

    return ApiGatewayStageResultSchema.parse({
      apiId,
      stageName,
    });
  } catch (err) {
    throw wrapAwsError(err, "apiGatewayStageManager failed");
  }
}

/**
 * Handle a CloudFormation custom resource lifecycle event.
 *
 * Processes Create, Update, and Delete events by sending a response
 * to the pre-signed S3 URL provided in the event. Returns a structured
 * response indicating success or failure.
 *
 * @param event - The CloudFormation custom resource event.
 * @param physicalResourceId - The physical resource ID to report.
 * @param data - Optional key-value data to include in the response.
 * @returns A validated {@link CustomResourceResponse}.
 *
 * @example
 * ```ts
 * const response = await customResourceHandler(
 *   event,
 *   "my-custom-resource-001",
 *   { Endpoint: "https://api.example.com" },
 * );
 * ```
 */
export async function customResourceHandler(
  event: Record<string, unknown>,
  physicalResourceId: string,
  data?: Record<string, string>,
): Promise<CustomResourceResponse> {
  try {
    const requestType = event["RequestType"] as string | undefined;
    const responseUrl = event["ResponseURL"] as string | undefined;
    const stackId = event["StackId"] as string | undefined;
    const requestId = event["RequestId"] as string | undefined;
    const logicalResourceId = event["LogicalResourceId"] as
      | string
      | undefined;

    const responseBody = JSON.stringify({
      Status: "SUCCESS",
      Reason: `Custom resource ${requestType ?? "Unknown"} completed`,
      PhysicalResourceId: physicalResourceId,
      StackId: stackId ?? "",
      RequestId: requestId ?? "",
      LogicalResourceId: logicalResourceId ?? "",
      Data: data ?? {},
    });

    // Send response to CloudFormation's pre-signed S3 URL
    if (responseUrl) {
      await fetch(responseUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "",
          "Content-Length": String(
            new TextEncoder().encode(responseBody).length,
          ),
        },
        body: responseBody,
      });
    }

    return CustomResourceResponseSchema.parse({
      status: "SUCCESS",
      physicalResourceId,
      data,
    });
  } catch (err) {
    // On failure, attempt to send a FAILED response
    const responseUrl = event["ResponseURL"] as string | undefined;
    if (responseUrl) {
      const failureBody = JSON.stringify({
        Status: "FAILED",
        Reason:
          err instanceof Error ? err.message : String(err),
        PhysicalResourceId: physicalResourceId,
        StackId: (event["StackId"] as string) ?? "",
        RequestId: (event["RequestId"] as string) ?? "",
        LogicalResourceId:
          (event["LogicalResourceId"] as string) ?? "",
        Data: {},
      });

      try {
        await fetch(responseUrl, {
          method: "PUT",
          headers: {
            "Content-Type": "",
            "Content-Length": String(
              new TextEncoder().encode(failureBody).length,
            ),
          },
          body: failureBody,
        });
      } catch {
        // Best-effort failure response
      }
    }

    return CustomResourceResponseSchema.parse({
      status: "FAILED",
      physicalResourceId,
    });
  }
}
