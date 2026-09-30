/**
 * aws-util/cost-optimization — Multi-service cost optimization utilities.
 *
 * Provides typed helpers for Lambda right-sizing, unused resource
 * detection, concurrency optimization, cost-attribution tagging,
 * DynamoDB capacity advising, and log retention enforcement.
 *
 * Multi-service: Lambda + CloudWatch + SQS + CloudWatch Logs +
 * DynamoDB + Resource Groups Tagging.
 *
 * All functions obtain clients via {@link getClient} and wrap errors
 * through {@link wrapAwsError}.
 *
 * @example
 * ```ts
 * import {
 *   lambdaRightSizer,
 *   unusedResourceFinder,
 *   costAttributionTagger,
 *   logRetentionEnforcer,
 * } from "./cost-optimization.js";
 *
 * const sizing = await lambdaRightSizer();
 * const unused = await unusedResourceFinder();
 * const tagged = await costAttributionTagger(["team", "project"]);
 * const retention = await logRetentionEnforcer(30);
 * ```
 *
 * @module
 */

import { z } from "zod";
import {
  LambdaClient,
  ListFunctionsCommand,
  GetFunctionConfigurationCommand,
} from "@aws-sdk/client-lambda";
import {
  CloudWatchClient,
  GetMetricStatisticsCommand,
} from "@aws-sdk/client-cloudwatch";
import {
  CloudWatchLogsClient,
  DescribeLogGroupsCommand,
  PutRetentionPolicyCommand,
} from "@aws-sdk/client-cloudwatch-logs";
import {
  SQSClient,
  ListQueuesCommand,
  GetQueueAttributesCommand,
} from "@aws-sdk/client-sqs";
import { DynamoDBClient, DescribeTableCommand } from "@aws-sdk/client-dynamodb";
import {
  ResourceGroupsTaggingAPIClient,
  GetResourcesCommand,
} from "@aws-sdk/client-resource-groups-tagging-api";
import { getClient } from "./client.js";
import { wrapAwsError } from "./exceptions.js";

// ---------------------------------------------------------------------------
// Zod schemas & inferred types
// ---------------------------------------------------------------------------

/** Schema for a memory configuration recommendation. */
export const MemoryConfigSchema = z.object({
  functionName: z.string(),
  currentMemory: z.number(),
  recommendedMemory: z.number().optional(),
  estimatedSavings: z.number().optional(),
});

/** Memory configuration recommendation. */
export type MemoryConfig = z.infer<typeof MemoryConfigSchema>;

/** Schema for the Lambda right-sizer result. */
export const LambdaRightSizerResultSchema = z.object({
  functions: z.array(MemoryConfigSchema),
  totalEstimatedSavings: z.number(),
});

/** Lambda right-sizer result. */
export type LambdaRightSizerResult = z.infer<
  typeof LambdaRightSizerResultSchema
>;

/** Schema for an unused resource entry. */
export const UnusedResourceSchema = z.object({
  resourceType: z.string(),
  resourceId: z.string(),
  reason: z.string(),
  lastUsed: z.string().optional(),
});

/** An unused resource entry. */
export type UnusedResource = z.infer<typeof UnusedResourceSchema>;

/** Schema for the unused resource finder result. */
export const UnusedResourceFinderResultSchema = z.object({
  resources: z.array(UnusedResourceSchema),
});

/** Unused resource finder result. */
export type UnusedResourceFinderResult = z.infer<
  typeof UnusedResourceFinderResultSchema
>;

/** Schema for a concurrency recommendation. */
export const ConcurrencyRecommendationSchema = z.object({
  functionName: z.string(),
  currentConcurrency: z.number().nullable(),
  recommended: z.number(),
  peak: z.number(),
});

/** Concurrency recommendation. */
export type ConcurrencyRecommendation = z.infer<
  typeof ConcurrencyRecommendationSchema
>;

/** Schema for the concurrency optimizer result. */
export const ConcurrencyOptimizerResultSchema = z.object({
  recommendations: z.array(ConcurrencyRecommendationSchema),
});

/** Concurrency optimizer result. */
export type ConcurrencyOptimizerResult = z.infer<
  typeof ConcurrencyOptimizerResultSchema
>;

/** Schema for a tag-compliance resource. */
export const TagComplianceResourceSchema = z.object({
  resourceArn: z.string(),
  missingTags: z.array(z.string()),
});

/** Tag-compliance resource. */
export type TagComplianceResource = z.infer<
  typeof TagComplianceResourceSchema
>;

/** Schema for the cost-attribution tagger result. */
export const CostAttributionTaggerResultSchema = z.object({
  tagged: z.number(),
  skipped: z.number(),
  resources: z.array(TagComplianceResourceSchema),
});

/** Cost-attribution tagger result. */
export type CostAttributionTaggerResult = z.infer<
  typeof CostAttributionTaggerResultSchema
>;

/** Schema for DynamoDB capacity advice. */
export const DynamoDBCapacityAdviceSchema = z.object({
  tableName: z.string(),
  mode: z.string(),
  currentRcu: z.number().optional(),
  currentWcu: z.number().optional(),
  recommendedMode: z.string().optional(),
});

/** DynamoDB capacity advice. */
export type DynamoDBCapacityAdvice = z.infer<
  typeof DynamoDBCapacityAdviceSchema
>;

/** Schema for the DynamoDB capacity advisor result. */
export const DynamoDBCapacityAdvisorResultSchema = z.object({
  tables: z.array(DynamoDBCapacityAdviceSchema),
});

/** DynamoDB capacity advisor result. */
export type DynamoDBCapacityAdvisorResult = z.infer<
  typeof DynamoDBCapacityAdvisorResultSchema
>;

/** Schema for a log retention change. */
export const LogRetentionChangeSchema = z.object({
  logGroupName: z.string(),
  oldRetention: z.number().nullable(),
  newRetention: z.number(),
});

/** Log retention change. */
export type LogRetentionChange = z.infer<typeof LogRetentionChangeSchema>;

/** Schema for the log retention enforcer result. */
export const LogRetentionEnforcerResultSchema = z.object({
  changed: z.array(LogRetentionChangeSchema),
  skipped: z.number(),
});

/** Log retention enforcer result. */
export type LogRetentionEnforcerResult = z.infer<
  typeof LogRetentionEnforcerResultSchema
>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Get a cached LambdaClient for the given region.
 */
function lambdaClient(region?: string): LambdaClient {
  return getClient(LambdaClient, region);
}

/**
 * Get a cached CloudWatchClient for the given region.
 */
function cwClient(region?: string): CloudWatchClient {
  return getClient(CloudWatchClient, region);
}

/**
 * Get a cached CloudWatchLogsClient for the given region.
 */
function cwLogsClient(region?: string): CloudWatchLogsClient {
  return getClient(CloudWatchLogsClient, region);
}

/**
 * Get a cached SQSClient for the given region.
 */
function sqsClient(region?: string): SQSClient {
  return getClient(SQSClient, region);
}

/**
 * Get a cached DynamoDBClient for the given region.
 */
function ddbClient(region?: string): DynamoDBClient {
  return getClient(DynamoDBClient, region);
}

/**
 * Get a cached ResourceGroupsTaggingAPIClient for the given region.
 */
function taggingClient(
  region?: string,
): ResourceGroupsTaggingAPIClient {
  return getClient(ResourceGroupsTaggingAPIClient, region);
}

/** Standard Lambda memory sizes available for recommendation. */
const MEMORY_SIZES = [
  128, 256, 512, 768, 1024, 1536, 2048, 3008, 4096, 5120, 6144,
  7168, 8192, 10240,
];

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Analyze Lambda functions and recommend memory right-sizing.
 *
 * Lists Lambda functions (or uses the provided list), queries CloudWatch
 * for memory usage metrics, and recommends a smaller memory size where
 * peak usage is well below the configured memory.
 *
 * @param functionNames - Optional list of function names to analyze. If omitted, all functions are analyzed.
 * @param region - AWS region override.
 * @returns The right-sizer result with per-function recommendations and total estimated savings.
 */
export async function lambdaRightSizer(
  functionNames?: string[],
  region?: string,
): Promise<LambdaRightSizerResult> {
  let names = functionNames ?? [];

  // If no function names provided, list all functions
  if (names.length === 0) {
    try {
      const resp = await lambdaClient(region).send(
        new ListFunctionsCommand({}),
      );
      names = (resp.Functions ?? [])
        .map((f) => f.FunctionName ?? "")
        .filter(Boolean);
    } catch (err) {
      throw wrapAwsError(err, "Failed to list Lambda functions");
    }
  }

  const functions: MemoryConfig[] = [];
  let totalSavings = 0;

  const endTime = new Date();
  const startTime = new Date(endTime.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days

  for (const name of names) {
    // Get current memory configuration
    let currentMemory: number;
    try {
      const config = await lambdaClient(region).send(
        new GetFunctionConfigurationCommand({
          FunctionName: name,
        }),
      );
      currentMemory = config.MemorySize ?? 128;
    } catch (err) {
      throw wrapAwsError(
        err,
        `Failed to get configuration for ${name}`,
      );
    }

    // Get max memory used from CloudWatch
    let maxMemoryUsed = currentMemory;
    try {
      const resp = await cwClient(region).send(
        new GetMetricStatisticsCommand({
          Namespace: "AWS/Lambda",
          MetricName: "MaxMemoryUsed",
          Dimensions: [
            { Name: "FunctionName", Value: name },
          ],
          StartTime: startTime,
          EndTime: endTime,
          Period: 86400,
          Statistics: ["Maximum"],
          Unit: "Megabytes",
        }),
      );

      const datapoints = resp.Datapoints ?? [];
      if (datapoints.length > 0) {
        maxMemoryUsed = Math.max(
          ...datapoints.map((d) => d.Maximum ?? 0),
        );
      }
    } catch {
      // Metric not available; skip recommendation
    }

    // Recommend a smaller memory size if usage is under 75% of current
    let recommendedMemory: number | undefined;
    let estimatedSavings: number | undefined;

    if (maxMemoryUsed < currentMemory * 0.75) {
      // Find the smallest memory size that is at least 1.25x the max usage
      const target = maxMemoryUsed * 1.25;
      const recommended = MEMORY_SIZES.find((s) => s >= target);
      if (recommended && recommended < currentMemory) {
        recommendedMemory = recommended;
        // Estimated savings as a percentage reduction
        estimatedSavings = Math.round(
          ((currentMemory - recommended) / currentMemory) * 100,
        );
        totalSavings += estimatedSavings;
      }
    }

    functions.push(
      MemoryConfigSchema.parse({
        functionName: name,
        currentMemory,
        recommendedMemory,
        estimatedSavings,
      }),
    );
  }

  return LambdaRightSizerResultSchema.parse({
    functions,
    totalEstimatedSavings: totalSavings,
  });
}

/**
 * Find unused AWS resources that may be incurring unnecessary costs.
 *
 * Scans for Lambda functions with zero invocations in the last 30 days
 * and SQS queues with zero messages sent in the last 30 days.
 *
 * @param region - AWS region override.
 * @returns The finder result with a list of unused resources.
 */
export async function unusedResourceFinder(
  region?: string,
): Promise<UnusedResourceFinderResult> {
  const resources: UnusedResource[] = [];
  const endTime = new Date();
  const startTime = new Date(
    endTime.getTime() - 30 * 24 * 60 * 60 * 1000,
  ); // 30 days

  // Check Lambda functions
  try {
    const resp = await lambdaClient(region).send(
      new ListFunctionsCommand({}),
    );

    for (const fn of resp.Functions ?? []) {
      const funcName = fn.FunctionName ?? "";
      if (!funcName) {
        continue;
      }

      try {
        const metricsResp = await cwClient(region).send(
          new GetMetricStatisticsCommand({
            Namespace: "AWS/Lambda",
            MetricName: "Invocations",
            Dimensions: [
              { Name: "FunctionName", Value: funcName },
            ],
            StartTime: startTime,
            EndTime: endTime,
            Period: 2592000, // 30 days
            Statistics: ["Sum"],
          }),
        );

        const totalInvocations = (metricsResp.Datapoints ?? []).reduce(
          (sum, dp) => sum + (dp.Sum ?? 0),
          0,
        );

        if (totalInvocations === 0) {
          resources.push(
            UnusedResourceSchema.parse({
              resourceType: "Lambda",
              resourceId: funcName,
              reason: "Zero invocations in last 30 days",
              lastUsed: fn.LastModified,
            }),
          );
        }
      } catch {
        // Skip functions where metrics are unavailable
      }
    }
  } catch (err) {
    throw wrapAwsError(
      err,
      "Failed to list Lambda functions for unused resource scan",
    );
  }

  // Check SQS queues
  try {
    const resp = await sqsClient(region).send(
      new ListQueuesCommand({}),
    );

    for (const queueUrl of resp.QueueUrls ?? []) {
      try {
        const attrs = await sqsClient(region).send(
          new GetQueueAttributesCommand({
            QueueUrl: queueUrl,
            AttributeNames: [
              "ApproximateNumberOfMessages",
              "ApproximateNumberOfMessagesNotVisible",
            ],
          }),
        );

        const visible = parseInt(
          attrs.Attributes?.ApproximateNumberOfMessages ?? "0",
          10,
        );
        const notVisible = parseInt(
          attrs.Attributes?.ApproximateNumberOfMessagesNotVisible ??
            "0",
          10,
        );

        if (visible === 0 && notVisible === 0) {
          // Extract queue name from URL
          const queueName = queueUrl.split("/").pop() ?? queueUrl;
          resources.push(
            UnusedResourceSchema.parse({
              resourceType: "SQS",
              resourceId: queueName,
              reason: "Zero messages in queue",
            }),
          );
        }
      } catch {
        // Skip queues where attributes can't be read
      }
    }
  } catch (err) {
    throw wrapAwsError(
      err,
      "Failed to list SQS queues for unused resource scan",
    );
  }

  return UnusedResourceFinderResultSchema.parse({ resources });
}

/**
 * Analyze Lambda concurrency metrics and recommend reserved concurrency.
 *
 * Queries CloudWatch for concurrent execution metrics over the past 7
 * days and recommends a reserved concurrency value based on the peak.
 *
 * @param functionNames - Optional list of function names. If omitted, all functions are analyzed.
 * @param region - AWS region override.
 * @returns The optimizer result with per-function concurrency recommendations.
 */
export async function concurrencyOptimizer(
  functionNames?: string[],
  region?: string,
): Promise<ConcurrencyOptimizerResult> {
  let names = functionNames ?? [];

  if (names.length === 0) {
    try {
      const resp = await lambdaClient(region).send(
        new ListFunctionsCommand({}),
      );
      names = (resp.Functions ?? [])
        .map((f) => f.FunctionName ?? "")
        .filter(Boolean);
    } catch (err) {
      throw wrapAwsError(
        err,
        "Failed to list Lambda functions for concurrency analysis",
      );
    }
  }

  const recommendations: ConcurrencyRecommendation[] = [];
  const endTime = new Date();
  const startTime = new Date(
    endTime.getTime() - 7 * 24 * 60 * 60 * 1000,
  );

  for (const name of names) {
    let peak = 0;

    try {
      const resp = await cwClient(region).send(
        new GetMetricStatisticsCommand({
          Namespace: "AWS/Lambda",
          MetricName: "ConcurrentExecutions",
          Dimensions: [
            { Name: "FunctionName", Value: name },
          ],
          StartTime: startTime,
          EndTime: endTime,
          Period: 3600,
          Statistics: ["Maximum"],
        }),
      );

      peak = Math.max(
        0,
        ...(resp.Datapoints ?? []).map(
          (d) => d.Maximum ?? 0,
        ),
      );
    } catch {
      // Metrics unavailable
    }

    // Recommend 1.5x peak with a minimum of 5
    const recommended = Math.max(5, Math.ceil(peak * 1.5));

    recommendations.push(
      ConcurrencyRecommendationSchema.parse({
        functionName: name,
        currentConcurrency: null,
        recommended,
        peak,
      }),
    );
  }

  return ConcurrencyOptimizerResultSchema.parse({
    recommendations,
  });
}

/**
 * Identify resources missing required cost-attribution tags.
 *
 * Queries the Resource Groups Tagging API for resources and checks
 * whether each has the required tags. Reports missing tags for each
 * resource.
 *
 * @param requiredTags - Array of tag keys that must be present.
 * @param resourceTypeFilters - Optional resource type filters (e.g. `["lambda:function"]`).
 * @param region - AWS region override.
 * @returns The tagger result with compliance status per resource.
 */
export async function costAttributionTagger(
  requiredTags: string[],
  resourceTypeFilters?: string[],
  region?: string,
): Promise<CostAttributionTaggerResult> {
  const resources: TagComplianceResource[] = [];
  let tagged = 0;
  let skipped = 0;
  let paginationToken: string | undefined;

  do {
    try {
      const resp = await taggingClient(region).send(
        new GetResourcesCommand({
          ResourceTypeFilters: resourceTypeFilters,
          PaginationToken: paginationToken || undefined,
        }),
      );

      for (const resource of resp.ResourceTagMappingList ?? []) {
        const arn = resource.ResourceARN ?? "";
        const existingTags = (resource.Tags ?? []).map(
          (t) => t.Key ?? "",
        );

        const missingTags = requiredTags.filter(
          (tag) => !existingTags.includes(tag),
        );

        if (missingTags.length > 0) {
          resources.push(
            TagComplianceResourceSchema.parse({
              resourceArn: arn,
              missingTags,
            }),
          );
          skipped++;
        } else {
          tagged++;
        }
      }

      paginationToken = resp.PaginationToken;
    } catch (err) {
      throw wrapAwsError(
        err,
        "Failed to query resources for tag compliance",
      );
    }
  } while (paginationToken);

  return CostAttributionTaggerResultSchema.parse({
    tagged,
    skipped,
    resources,
  });
}

/**
 * Analyze DynamoDB table capacity and recommend provisioning changes.
 *
 * Checks whether tables are using on-demand or provisioned capacity,
 * and uses CloudWatch metrics to recommend switching modes based on
 * usage patterns.
 *
 * @param tableNames - Optional list of table names. If omitted, provided tables must be listed.
 * @param region - AWS region override.
 * @returns The advisor result with per-table recommendations.
 */
export async function dynamodbCapacityAdvisor(
  tableNames?: string[],
  region?: string,
): Promise<DynamoDBCapacityAdvisorResult> {
  const names = tableNames ?? [];
  const tables: DynamoDBCapacityAdvice[] = [];

  for (const tableName of names) {
    try {
      const resp = await ddbClient(region).send(
        new DescribeTableCommand({ TableName: tableName }),
      );

      const table = resp.Table;
      const billingMode =
        table?.BillingModeSummary?.BillingMode ?? "PROVISIONED";
      const rcu =
        table?.ProvisionedThroughput?.ReadCapacityUnits ?? undefined;
      const wcu =
        table?.ProvisionedThroughput?.WriteCapacityUnits ?? undefined;

      let recommendedMode: string | undefined;

      if (billingMode === "PROVISIONED") {
        // Check if consumption is consistently low — might benefit from on-demand
        const endTime = new Date();
        const startTime = new Date(
          endTime.getTime() - 7 * 24 * 60 * 60 * 1000,
        );

        try {
          const rcuResp = await cwClient(region).send(
            new GetMetricStatisticsCommand({
              Namespace: "AWS/DynamoDB",
              MetricName: "ConsumedReadCapacityUnits",
              Dimensions: [
                { Name: "TableName", Value: tableName },
              ],
              StartTime: startTime,
              EndTime: endTime,
              Period: 86400,
              Statistics: ["Average", "Maximum"],
            }),
          );

          const maxRcu = Math.max(
            0,
            ...(rcuResp.Datapoints ?? []).map(
              (d) => d.Maximum ?? 0,
            ),
          );
          const avgRcu =
            (rcuResp.Datapoints ?? []).reduce(
              (sum, d) => sum + (d.Average ?? 0),
              0,
            ) / Math.max(1, (rcuResp.Datapoints ?? []).length);

          // If usage is very spiky (max >> avg), recommend on-demand
          if (rcu && maxRcu > 0 && maxRcu > avgRcu * 5) {
            recommendedMode = "PAY_PER_REQUEST";
          }
          // If consistently using <20% of provisioned, might over-provisioned
          if (rcu && avgRcu < rcu * 0.2) {
            recommendedMode = recommendedMode ?? "REDUCE_PROVISIONED";
          }
        } catch {
          // Metrics unavailable
        }
      }

      tables.push(
        DynamoDBCapacityAdviceSchema.parse({
          tableName,
          mode: billingMode,
          currentRcu: rcu,
          currentWcu: wcu,
          recommendedMode,
        }),
      );
    } catch (err) {
      throw wrapAwsError(
        err,
        `Failed to describe table ${tableName}`,
      );
    }
  }

  return DynamoDBCapacityAdvisorResultSchema.parse({ tables });
}

/**
 * Enforce a maximum log retention period on CloudWatch log groups.
 *
 * Scans all log groups and sets a retention policy on any group whose
 * current retention exceeds the specified maximum, or whose retention
 * is set to "never expire" (null).
 *
 * @param maxRetentionDays - Maximum allowed retention in days (default 30).
 * @param region - AWS region override.
 * @returns The enforcer result with changed groups and skip count.
 */
// ---------------------------------------------------------------------------
// Extended cost-optimization schemas
// ---------------------------------------------------------------------------

/** Schema for a Trusted Advisor report to S3 result. */
export const TrustedAdvisorReportResultSchema = z.object({
  s3Bucket: z.string(),
  s3Key: z.string(),
  checksReported: z.number(),
  totalRecommendations: z.number(),
});
/** Trusted Advisor report to S3 result. */
export type TrustedAdvisorReportResult = z.infer<typeof TrustedAdvisorReportResultSchema>;

/** Schema for a Cost and Usage Report analyzer result. */
export const CostAndUsageReportResultSchema = z.object({
  reportName: z.string(),
  totalCost: z.number(),
  currency: z.string(),
  topServices: z.array(z.object({ service: z.string(); cost: z.number() })),
  period: z.string(),
});
/** Cost and Usage Report analyzer result. */
export type CostAndUsageReportResult = z.infer<typeof CostAndUsageReportResultSchema>;

/** Schema for a Savings Plan coverage reporter result. */
export const SavingsPlanCoverageResultSchema = z.object({
  coveragePercentage: z.number(),
  onDemandCost: z.number(),
  savingsPlanCost: z.number(),
  uncoveredCost: z.number(),
  period: z.string(),
});
/** Savings Plan coverage reporter result. */
export type SavingsPlanCoverageResult = z.infer<typeof SavingsPlanCoverageResultSchema>;

/** Schema for an EC2 idle instance stopper result. */
export const Ec2IdleInstanceStopperResultSchema = z.object({
  instancesStopped: z.number(),
  instanceIds: z.array(z.string()),
  cpuThreshold: z.number(),
  lookbackDays: z.number(),
});
/** EC2 idle instance stopper result. */
export type Ec2IdleInstanceStopperResult = z.infer<typeof Ec2IdleInstanceStopperResultSchema>;

/** Schema for an RDS idle snapshot and delete result. */
export const RdsIdleSnapshotAndDeleteResultSchema = z.object({
  instanceIdentifier: z.string(),
  snapshotId: z.string().optional(),
  deleted: z.boolean(),
  snapshotCreated: z.boolean(),
});
/** RDS idle snapshot and delete result. */
export type RdsIdleSnapshotAndDeleteResult = z.infer<typeof RdsIdleSnapshotAndDeleteResultSchema>;

/** Schema for an ECR lifecycle policy applier result. */
export const EcrLifecyclePolicyResultSchema = z.object({
  repositoryName: z.string(),
  policyApplied: z.boolean(),
  rulesCount: z.number(),
});
/** ECR lifecycle policy applier result. */
export type EcrLifecyclePolicyResult = z.infer<typeof EcrLifecyclePolicyResultSchema>;

/** Schema for an S3 Intelligent-Tiering enroller result. */
export const S3IntelligentTieringResultSchema = z.object({
  bucket: z.string(),
  configurationId: z.string(),
  objectsEnrolled: z.number(),
  status: z.string(),
});
/** S3 Intelligent-Tiering enroller result. */
export type S3IntelligentTieringResult = z.infer<typeof S3IntelligentTieringResultSchema>;

/** Schema for a Lambda dead code detector result. */
export const LambdaDeadCodeDetectorResultSchema = z.object({
  functionsAnalyzed: z.number(),
  deadFunctions: z.array(z.object({
    functionName: z.string(),
    lastInvoked: z.string().optional(),
    reason: z.string(),
  })),
  estimatedMonthlySavings: z.number(),
});
/** Lambda dead code detector result. */
export type LambdaDeadCodeDetectorResult = z.infer<typeof LambdaDeadCodeDetectorResultSchema>;

// ---------------------------------------------------------------------------
// Extended cost-optimization functions
// ---------------------------------------------------------------------------

/** Export AWS Trusted Advisor check results to an S3 bucket as JSON. */
export async function trustedAdvisorReportToS3(
  s3Bucket: string,
  s3Key: string,
  checkCategories?: string[],
  region?: string,
): Promise<TrustedAdvisorReportResult> {
  const client = lambdaClient(region);
  try {
    // TODO: implement trustedAdvisorReportToS3
    throw new Error("trustedAdvisorReportToS3 not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "trustedAdvisorReportToS3 failed");
  }
}

/** Analyze AWS Cost and Usage Report data from S3 and surface top cost drivers. */
export async function costAndUsageReportAnalyzer(
  reportBucket: string,
  reportPrefix: string,
  lookbackDays?: number,
  region?: string,
): Promise<CostAndUsageReportResult> {
  const client = lambdaClient(region);
  try {
    // TODO: implement costAndUsageReportAnalyzer
    throw new Error("costAndUsageReportAnalyzer not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "costAndUsageReportAnalyzer failed");
  }
}

/** Report on Savings Plan utilization coverage over a date range. */
export async function savingsPlanCoverageReporter(
  startDate: string,
  endDate: string,
  granularity?: "DAILY" | "MONTHLY",
  region?: string,
): Promise<SavingsPlanCoverageResult> {
  const client = lambdaClient(region);
  try {
    // TODO: implement savingsPlanCoverageReporter
    throw new Error("savingsPlanCoverageReporter not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "savingsPlanCoverageReporter failed");
  }
}

/** Stop EC2 instances with CPU utilization below a threshold for N consecutive days. */
export async function ec2IdleInstanceStopper(
  cpuThreshold?: number,
  lookbackDays?: number,
  dryRun?: boolean,
  region?: string,
): Promise<Ec2IdleInstanceStopperResult> {
  const client = lambdaClient(region);
  try {
    // TODO: implement ec2IdleInstanceStopper
    throw new Error("ec2IdleInstanceStopper not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "ec2IdleInstanceStopper failed");
  }
}

/** Snapshot and optionally delete idle RDS instances to reduce costs. */
export async function rdsIdleSnapshotAndDelete(
  instanceIdentifier: string,
  cpuThreshold?: number,
  lookbackDays?: number,
  deleteAfterSnapshot?: boolean,
  region?: string,
): Promise<RdsIdleSnapshotAndDeleteResult> {
  const client = lambdaClient(region);
  try {
    // TODO: implement rdsIdleSnapshotAndDelete
    throw new Error("rdsIdleSnapshotAndDelete not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "rdsIdleSnapshotAndDelete failed");
  }
}

/** Apply a lifecycle policy to an ECR repository to auto-expire old images. */
export async function ecrLifecyclePolicyApplier(
  repositoryName: string,
  maxImageCount?: number,
  untaggedDaysThreshold?: number,
  region?: string,
): Promise<EcrLifecyclePolicyResult> {
  const client = lambdaClient(region);
  try {
    // TODO: implement ecrLifecyclePolicyApplier
    throw new Error("ecrLifecyclePolicyApplier not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "ecrLifecyclePolicyApplier failed");
  }
}

/** Enroll S3 objects in Intelligent-Tiering to automatically optimize storage costs. */
export async function s3IntelligentTieringEnrollor(
  bucket: string,
  prefix?: string,
  archiveDays?: number,
  deepArchiveDays?: number,
  region?: string,
): Promise<S3IntelligentTieringResult> {
  const client = lambdaClient(region);
  try {
    // TODO: implement s3IntelligentTieringEnrollor
    throw new Error("s3IntelligentTieringEnrollor not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "s3IntelligentTieringEnrollor failed");
  }
}

/** Detect Lambda functions with zero invocations over a period and estimate savings from removal. */
export async function lambdaDeadCodeDetector(
  lookbackDays?: number,
  functionNames?: string[],
  region?: string,
): Promise<LambdaDeadCodeDetectorResult> {
  const client = lambdaClient(region);
  try {
    // TODO: implement lambdaDeadCodeDetector
    throw new Error("lambdaDeadCodeDetector not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "lambdaDeadCodeDetector failed");
  }
}

export async function logRetentionEnforcer(
  maxRetentionDays?: number,
  region?: string,
): Promise<LogRetentionEnforcerResult> {
  const maxDays = maxRetentionDays ?? 30;
  const changed: LogRetentionChange[] = [];
  let skipped = 0;
  let nextToken: string | undefined;

  do {
    try {
      const resp = await cwLogsClient(region).send(
        new DescribeLogGroupsCommand({
          nextToken,
        }),
      );

      for (const group of resp.logGroups ?? []) {
        const name = group.logGroupName ?? "";
        const currentRetention =
          group.retentionInDays ?? null;

        if (
          currentRetention === null ||
          currentRetention > maxDays
        ) {
          try {
            await cwLogsClient(region).send(
              new PutRetentionPolicyCommand({
                logGroupName: name,
                retentionInDays: maxDays,
              }),
            );

            changed.push(
              LogRetentionChangeSchema.parse({
                logGroupName: name,
                oldRetention: currentRetention,
                newRetention: maxDays,
              }),
            );
          } catch (err) {
            throw wrapAwsError(
              err,
              `Failed to set retention for ${name}`,
            );
          }
        } else {
          skipped++;
        }
      }

      nextToken = resp.nextToken;
    } catch (err) {
      if (
        err instanceof Error &&
        err.message.includes("Failed to set retention")
      ) {
        throw err;
      }
      throw wrapAwsError(
        err,
        "Failed to describe log groups",
      );
    }
  } while (nextToken);

  return LogRetentionEnforcerResultSchema.parse({
    changed,
    skipped,
  });
}
