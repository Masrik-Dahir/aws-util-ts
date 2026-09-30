/**
 * aws-util/container-ops — ECS capacity provider optimization.
 *
 * Multi-service module combining ECS + Application Auto Scaling +
 * CloudWatch to analyze service metrics and optimize capacity provider
 * strategies for ECS clusters.
 *
 * All functions obtain clients via {@link getClient} and wrap errors
 * through {@link wrapAwsError}.
 *
 * @example
 * ```ts
 * import { ecsCapacityProviderOptimizer } from "./container-ops.js";
 *
 * const result = await ecsCapacityProviderOptimizer(
 *   "production",
 *   ["web-api", "worker"],
 *   70,
 * );
 * ```
 *
 * @module
 */

import { z } from "zod";
import {
  ECSClient,
  DescribeClustersCommand,
  DescribeServicesCommand,
  UpdateServiceCommand,
  PutClusterCapacityProvidersCommand,
} from "@aws-sdk/client-ecs";
import {
  CloudWatchClient,
  GetMetricStatisticsCommand,
} from "@aws-sdk/client-cloudwatch";
import { getClient } from "./client.js";
import { wrapAwsError } from "./exceptions.js";

// ---------------------------------------------------------------------------
// Zod schemas & inferred types
// ---------------------------------------------------------------------------

/** Schema for a capacity provider strategy entry. */
export const CapacityProviderStrategySchema = z.object({
  capacityProvider: z.string(),
  weight: z.number(),
  base: z.number().optional(),
});

/** A single capacity provider strategy entry. */
export type CapacityProviderStrategy = z.infer<
  typeof CapacityProviderStrategySchema
>;

/** Schema for capacity provider optimization results. */
export const CapacityProviderResultSchema = z.object({
  clusterArn: z.string(),
  capacityProviders: z.array(z.string()),
  strategies: z.array(CapacityProviderStrategySchema),
  status: z.string(),
});

/** Result of capacity provider optimization. */
export type CapacityProviderResult = z.infer<
  typeof CapacityProviderResultSchema
>;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Optimize ECS capacity provider strategy based on service metrics.
 *
 * Describes the cluster and its services, retrieves CPU and memory
 * utilization metrics from CloudWatch, and recommends or applies an
 * optimized capacity provider strategy. Services with utilization below
 * the target are assigned to FARGATE_SPOT; those above use FARGATE with
 * a base allocation.
 *
 * @param cluster - ECS cluster name or ARN.
 * @param services - Optional list of service names to analyze. If omitted, analyzes all services.
 * @param targetUtilization - Target CPU utilization percentage. Defaults to 70.
 * @param region - AWS region. Defaults to SDK default.
 * @returns Optimization result with recommended strategies.
 *
 * @example
 * ```ts
 * const result = await ecsCapacityProviderOptimizer(
 *   "production",
 *   undefined,
 *   65,
 * );
 * ```
 */
export async function ecsCapacityProviderOptimizer(
  cluster: string,
  services?: string[],
  targetUtilization?: number,
  region?: string,
): Promise<CapacityProviderResult> {
  try {
    const ecs = getClient(ECSClient, region);
    const cw = getClient(CloudWatchClient, region);
    const target = targetUtilization ?? 70;

    // Describe cluster to get capacity providers
    const clusterResp = await ecs.send(
      new DescribeClustersCommand({
        clusters: [cluster],
        include: ["SETTINGS"],
      }),
    );

    const clusterData = clusterResp.clusters?.[0];
    if (!clusterData) {
      throw new Error(`Cluster ${cluster} not found`);
    }

    const clusterArn = clusterData.clusterArn ?? cluster;
    const existingProviders =
      clusterData.capacityProviders ?? [];

    // Determine services to analyze
    let serviceNames = services;
    if (!serviceNames || serviceNames.length === 0) {
      // Describe services to get all service names
      const svcResp = await ecs.send(
        new DescribeServicesCommand({
          cluster,
          services:
            clusterData.activeServicesCount !== undefined
              ? []
              : [],
        }),
      );
      serviceNames = (svcResp.services ?? [])
        .map((s) => s.serviceName)
        .filter(
          (name): name is string => name !== undefined,
        );
    }

    // Analyze CPU utilization per service
    const strategies: CapacityProviderStrategy[] = [];
    const now = new Date();
    const oneHourAgo = new Date(
      now.getTime() - 60 * 60 * 1000,
    );

    let totalFargateWeight = 0;
    let totalSpotWeight = 0;

    for (const serviceName of serviceNames) {
      const metricResp = await cw.send(
        new GetMetricStatisticsCommand({
          Namespace: "AWS/ECS",
          MetricName: "CPUUtilization",
          Dimensions: [
            { Name: "ClusterName", Value: cluster },
            { Name: "ServiceName", Value: serviceName },
          ],
          StartTime: oneHourAgo,
          EndTime: now,
          Period: 300,
          Statistics: ["Average"],
        }),
      );

      const datapoints = metricResp.Datapoints ?? [];
      const avgUtilization =
        datapoints.length > 0
          ? datapoints.reduce(
              (sum, dp) => sum + (dp.Average ?? 0),
              0,
            ) / datapoints.length
          : 0;

      // Services below target utilization can use FARGATE_SPOT
      if (avgUtilization < target) {
        totalSpotWeight += 1;
      } else {
        totalFargateWeight += 1;
      }
    }

    // Build capacity provider strategy
    const totalWeight = totalFargateWeight + totalSpotWeight;
    if (totalWeight > 0) {
      if (totalFargateWeight > 0) {
        strategies.push({
          capacityProvider: "FARGATE",
          weight: Math.max(
            1,
            Math.round(
              (totalFargateWeight / totalWeight) * 100,
            ),
          ),
          base: 1,
        });
      }
      if (totalSpotWeight > 0) {
        strategies.push({
          capacityProvider: "FARGATE_SPOT",
          weight: Math.max(
            1,
            Math.round(
              (totalSpotWeight / totalWeight) * 100,
            ),
          ),
        });
      }
    } else {
      strategies.push({
        capacityProvider: "FARGATE",
        weight: 1,
        base: 1,
      });
    }

    // Ensure capacity providers are registered on the cluster
    const requiredProviders = strategies.map(
      (s) => s.capacityProvider,
    );
    const missingProviders = requiredProviders.filter(
      (p) => !existingProviders.includes(p),
    );

    if (missingProviders.length > 0) {
      const allProviders = [
        ...new Set([
          ...existingProviders,
          ...requiredProviders,
        ]),
      ];

      await ecs.send(
        new PutClusterCapacityProvidersCommand({
          cluster: clusterArn,
          capacityProviders: allProviders,
          defaultCapacityProviderStrategy: strategies.map(
            (s) => ({
              capacityProvider: s.capacityProvider,
              weight: s.weight,
              base: s.base ?? 0,
            }),
          ),
        }),
      );
    }

    const capacityProviders = [
      ...new Set([
        ...existingProviders,
        ...requiredProviders,
      ]),
    ];

    const result: CapacityProviderResult = {
      clusterArn,
      capacityProviders,
      strategies,
      status: "OPTIMIZED",
    };
    return CapacityProviderResultSchema.parse(result);
  } catch (err) {
    throw wrapAwsError(
      err,
      "ecsCapacityProviderOptimizer failed",
    );
  }
}
