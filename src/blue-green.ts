/**
 * aws-util/blue-green — Blue/green deployment and traffic management.
 *
 * Multi-service module combining ECS + ELBv2 + Route53 + CloudWatch + SNS +
 * Lambda + Application Auto Scaling to provide ECS blue/green deployments,
 * weighted Route53 routing, and Lambda provisioned concurrency management.
 *
 * All functions obtain clients via {@link getClient} and wrap errors
 * through {@link wrapAwsError}.
 *
 * @example
 * ```ts
 * import {
 *   ecsBlueGreenDeployer,
 *   weightedRoutingManager,
 *   lambdaProvisionedConcurrencyScaler,
 * } from "./blue-green.js";
 *
 * const deploy = await ecsBlueGreenDeployer(
 *   "my-cluster",
 *   "my-service",
 *   "arn:aws:ecs:us-east-1:123456789012:task-definition/app:2",
 *   "arn:aws:elasticloadbalancing:...:targetgroup/green/...",
 * );
 * ```
 *
 * @module
 */

import { z } from "zod";
import {
  ECSClient,
  DescribeServicesCommand,
  UpdateServiceCommand,
  RegisterTaskDefinitionCommand,
} from "@aws-sdk/client-ecs";
import {
  Route53Client,
  ChangeResourceRecordSetsCommand,
} from "@aws-sdk/client-route-53";
import {
  LambdaClient,
  PutProvisionedConcurrencyConfigCommand,
  GetProvisionedConcurrencyConfigCommand,
} from "@aws-sdk/client-lambda";
import { getClient } from "./client.js";
import { wrapAwsError } from "./exceptions.js";

// ---------------------------------------------------------------------------
// Zod schemas & inferred types
// ---------------------------------------------------------------------------

/** Schema for ECS blue/green deployment results. */
export const ECSBlueGreenResultSchema = z.object({
  serviceName: z.string(),
  clusterArn: z.string(),
  blueTaskDef: z.string().optional(),
  greenTaskDef: z.string().optional(),
  activeColor: z.enum(["blue", "green"]),
  status: z.string(),
});

/** Result of an ECS blue/green deployment. */
export type ECSBlueGreenResult = z.infer<
  typeof ECSBlueGreenResultSchema
>;

/** Schema for weighted routing results. */
export const WeightedRoutingResultSchema = z.object({
  hostedZoneId: z.string(),
  recordName: z.string(),
  weights: z.array(
    z.object({
      setIdentifier: z.string(),
      weight: z.number(),
    }),
  ),
  status: z.string(),
});

/** Result of weighted Route53 routing configuration. */
export type WeightedRoutingResult = z.infer<
  typeof WeightedRoutingResultSchema
>;

/** Schema for Lambda provisioned concurrency configuration. */
export const ProvisionedConcurrencyConfigSchema = z.object({
  functionName: z.string(),
  qualifier: z.string(),
  allocatedConcurrency: z.number(),
  status: z.string(),
});

/** Provisioned concurrency configuration result. */
export type ProvisionedConcurrencyConfig = z.infer<
  typeof ProvisionedConcurrencyConfigSchema
>;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Perform an ECS blue/green deployment.
 *
 * Describes the current service to identify the active (blue) task
 * definition, then updates the service to use the green task definition.
 * Optionally waits for termination of old tasks.
 *
 * @param cluster - ECS cluster name or ARN.
 * @param serviceName - ECS service name.
 * @param greenTaskDefinition - ARN of the new (green) task definition.
 * @param targetGroupArn - Primary target group ARN for the green deployment.
 * @param testTargetGroupArn - Optional test target group for canary validation.
 * @param terminationWaitMinutes - Minutes to wait before draining old tasks.
 * @param region - AWS region. Defaults to SDK default.
 * @returns Blue/green deployment result with active color and status.
 *
 * @example
 * ```ts
 * const result = await ecsBlueGreenDeployer(
 *   "production",
 *   "web-api",
 *   "arn:aws:ecs:us-east-1:123456789012:task-definition/web-api:5",
 *   "arn:aws:elasticloadbalancing:...:targetgroup/green/abc123",
 * );
 * ```
 */
export async function ecsBlueGreenDeployer(
  cluster: string,
  serviceName: string,
  greenTaskDefinition: string,
  targetGroupArn: string,
  testTargetGroupArn?: string,
  terminationWaitMinutes?: number,
  region?: string,
): Promise<ECSBlueGreenResult> {
  try {
    const ecs = getClient(ECSClient, region);

    // Describe current service to get the blue task definition
    const descResp = await ecs.send(
      new DescribeServicesCommand({
        cluster,
        services: [serviceName],
      }),
    );

    const service = descResp.services?.[0];
    if (!service) {
      throw new Error(
        `Service ${serviceName} not found in cluster ${cluster}`,
      );
    }

    const blueTaskDef = service.taskDefinition;
    const clusterArn = service.clusterArn ?? cluster;

    // Build load balancer configuration for blue/green
    const loadBalancers = [
      {
        targetGroupArn,
        containerName:
          service.loadBalancers?.[0]?.containerName ?? serviceName,
        containerPort:
          service.loadBalancers?.[0]?.containerPort ?? 80,
      },
    ];

    if (testTargetGroupArn) {
      loadBalancers.push({
        targetGroupArn: testTargetGroupArn,
        containerName:
          service.loadBalancers?.[0]?.containerName ?? serviceName,
        containerPort:
          service.loadBalancers?.[0]?.containerPort ?? 80,
      });
    }

    // Update service with green task definition
    await ecs.send(
      new UpdateServiceCommand({
        cluster,
        service: serviceName,
        taskDefinition: greenTaskDefinition,
        loadBalancers,
        healthCheckGracePeriodSeconds:
          terminationWaitMinutes !== undefined
            ? terminationWaitMinutes * 60
            : undefined,
      }),
    );

    const result: ECSBlueGreenResult = {
      serviceName,
      clusterArn,
      blueTaskDef: blueTaskDef ?? undefined,
      greenTaskDef: greenTaskDefinition,
      activeColor: "green",
      status: "DEPLOYED",
    };
    return ECSBlueGreenResultSchema.parse(result);
  } catch (err) {
    throw wrapAwsError(err, "ecsBlueGreenDeployer failed");
  }
}

/**
 * Manage weighted Route53 routing records.
 *
 * Creates or updates weighted resource record sets in the specified
 * hosted zone, distributing traffic according to the provided weights.
 *
 * @param hostedZoneId - Route53 hosted zone ID.
 * @param recordName - DNS record name (e.g. "api.example.com").
 * @param recordType - DNS record type (e.g. "A", "CNAME").
 * @param endpoints - Array of endpoints with identifier, value, and weight.
 * @param ttl - TTL for DNS records. Defaults to 60.
 * @param region - AWS region. Defaults to SDK default.
 * @returns Weighted routing result with applied weights.
 *
 * @example
 * ```ts
 * const result = await weightedRoutingManager(
 *   "Z1234567890",
 *   "api.example.com",
 *   "CNAME",
 *   [
 *     { setIdentifier: "blue", value: "blue.example.com", weight: 80 },
 *     { setIdentifier: "green", value: "green.example.com", weight: 20 },
 *   ],
 * );
 * ```
 */
export async function weightedRoutingManager(
  hostedZoneId: string,
  recordName: string,
  recordType: string,
  endpoints: Array<{
    setIdentifier: string;
    value: string;
    weight: number;
  }>,
  ttl?: number,
  region?: string,
): Promise<WeightedRoutingResult> {
  try {
    const r53 = getClient(Route53Client, region);
    const recordTtl = ttl ?? 60;

    const changes = endpoints.map((ep) => ({
      Action: "UPSERT" as const,
      ResourceRecordSet: {
        Name: recordName,
        Type: recordType,
        SetIdentifier: ep.setIdentifier,
        Weight: ep.weight,
        TTL: recordTtl,
        ResourceRecords: [{ Value: ep.value }],
      },
    }));

    await r53.send(
      new ChangeResourceRecordSetsCommand({
        HostedZoneId: hostedZoneId,
        ChangeBatch: {
          Changes: changes,
          Comment: `Weighted routing update for ${recordName}`,
        },
      }),
    );

    const result: WeightedRoutingResult = {
      hostedZoneId,
      recordName,
      weights: endpoints.map((ep) => ({
        setIdentifier: ep.setIdentifier,
        weight: ep.weight,
      })),
      status: "APPLIED",
    };
    return WeightedRoutingResultSchema.parse(result);
  } catch (err) {
    throw wrapAwsError(err, "weightedRoutingManager failed");
  }
}

/**
 * Configure Lambda provisioned concurrency.
 *
 * Sets the provisioned concurrency configuration for a Lambda function
 * alias or version to reduce cold start latency.
 *
 * @param functionName - Lambda function name or ARN.
 * @param qualifier - Function alias or version to configure.
 * @param desiredConcurrency - Desired provisioned concurrency level.
 * @param region - AWS region. Defaults to SDK default.
 * @returns Provisioned concurrency configuration result.
 *
 * @example
 * ```ts
 * const config = await lambdaProvisionedConcurrencyScaler(
 *   "my-function",
 *   "prod",
 *   100,
 * );
 * ```
 */
export async function lambdaProvisionedConcurrencyScaler(
  functionName: string,
  qualifier: string,
  desiredConcurrency: number,
  region?: string,
): Promise<ProvisionedConcurrencyConfig> {
  try {
    const lambda = getClient(LambdaClient, region);

    await lambda.send(
      new PutProvisionedConcurrencyConfigCommand({
        FunctionName: functionName,
        Qualifier: qualifier,
        ProvisionedConcurrentExecutions: desiredConcurrency,
      }),
    );

    // Retrieve the current configuration to confirm
    const getResp = await lambda.send(
      new GetProvisionedConcurrencyConfigCommand({
        FunctionName: functionName,
        Qualifier: qualifier,
      }),
    );

    const allocated =
      getResp.RequestedProvisionedConcurrentExecutions ??
      desiredConcurrency;
    const status = getResp.Status ?? "IN_PROGRESS";

    const result: ProvisionedConcurrencyConfig = {
      functionName,
      qualifier,
      allocatedConcurrency: allocated,
      status,
    };
    return ProvisionedConcurrencyConfigSchema.parse(result);
  } catch (err) {
    throw wrapAwsError(
      err,
      "lambdaProvisionedConcurrencyScaler failed",
    );
  }
}
