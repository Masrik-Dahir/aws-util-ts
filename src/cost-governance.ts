/**
 * aws-util/cost-governance — Cost anomaly detection and savings plan analysis.
 *
 * Multi-service module combining Cost Explorer + CloudWatch + SNS to
 * provide cost anomaly detection and savings plan purchase recommendations.
 *
 * All functions obtain clients via {@link getClient} and wrap errors
 * through {@link wrapAwsError}.
 *
 * @example
 * ```ts
 * import {
 *   costAnomalyDetector,
 *   savingsPlanAnalyzer,
 * } from "./cost-governance.js";
 *
 * const anomalies = await costAnomalyDetector(30, 25);
 * const savings = await savingsPlanAnalyzer(90);
 * ```
 *
 * @module
 */

import { z } from "zod";
import {
  CostExplorerClient,
  GetCostAndUsageCommand,
  GetSavingsPlansPurchaseRecommendationCommand,
} from "@aws-sdk/client-cost-explorer";
import {
  SNSClient,
  PublishCommand,
} from "@aws-sdk/client-sns";
import { getClient } from "./client.js";
import { wrapAwsError } from "./exceptions.js";

// ---------------------------------------------------------------------------
// Zod schemas & inferred types
// ---------------------------------------------------------------------------

/** Schema for a single cost anomaly detail. */
export const AnomalyDetailSchema = z.object({
  date: z.string(),
  service: z.string(),
  expectedCost: z.number(),
  actualCost: z.number(),
  anomalyScore: z.number(),
});

/** A single cost anomaly detail. */
export type AnomalyDetail = z.infer<
  typeof AnomalyDetailSchema
>;

/** Schema for cost anomaly detection results. */
export const CostAnomalyResultSchema = z.object({
  anomalies: z.array(AnomalyDetailSchema),
  totalAnomalyCost: z.number(),
  period: z.string(),
});

/** Result of cost anomaly detection. */
export type CostAnomalyResult = z.infer<
  typeof CostAnomalyResultSchema
>;

/** Schema for a savings plan recommendation. */
export const SavingsPlanRecommendationSchema = z.object({
  savingsPlanType: z.string(),
  paymentOption: z.string(),
  estimatedMonthlySavings: z.number(),
  estimatedOnDemandCost: z.number(),
  upfrontCost: z.number(),
});

/** A single savings plan recommendation. */
export type SavingsPlanRecommendation = z.infer<
  typeof SavingsPlanRecommendationSchema
>;

/** Schema for savings plan analysis results. */
export const SavingsPlanAnalysisSchema = z.object({
  recommendations: z.array(SavingsPlanRecommendationSchema),
  totalPotentialSavings: z.number(),
});

/** Result of savings plan analysis. */
export type SavingsPlanAnalysis = z.infer<
  typeof SavingsPlanAnalysisSchema
>;

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Format a Date as YYYY-MM-DD for Cost Explorer API.
 */
function formatDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Detect cost anomalies by comparing daily costs against rolling averages.
 *
 * Uses the Cost Explorer GetCostAndUsage API to retrieve daily costs
 * grouped by service over the lookback period. Calculates a rolling
 * average for each service and flags days where actual cost exceeds
 * the average by the threshold percentage.
 *
 * @param lookbackDays - Number of days to analyze. Defaults to 30.
 * @param thresholdPercent - Percentage above average to flag as anomaly. Defaults to 25.
 * @param snsTopicArn - Optional SNS topic for anomaly alerts.
 * @param region - AWS region. Defaults to SDK default.
 * @returns Anomaly detection result with flagged anomalies.
 *
 * @example
 * ```ts
 * const result = await costAnomalyDetector(
 *   60,
 *   20,
 *   "arn:aws:sns:us-east-1:123456789012:cost-alerts",
 * );
 * ```
 */
export async function costAnomalyDetector(
  lookbackDays?: number,
  thresholdPercent?: number,
  snsTopicArn?: string,
  region?: string,
): Promise<CostAnomalyResult> {
  try {
    const ce = getClient(CostExplorerClient, region);
    const days = lookbackDays ?? 30;
    const threshold = (thresholdPercent ?? 25) / 100;

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const resp = await ce.send(
      new GetCostAndUsageCommand({
        TimePeriod: {
          Start: formatDate(startDate),
          End: formatDate(endDate),
        },
        Granularity: "DAILY",
        Metrics: ["UnblendedCost"],
        GroupBy: [
          { Type: "DIMENSION", Key: "SERVICE" },
        ],
      }),
    );

    // Aggregate costs per service per day
    const serviceCosts: Record<
      string,
      Array<{ date: string; cost: number }>
    > = {};

    for (const result of resp.ResultsByTime ?? []) {
      const date = result.TimePeriod?.Start ?? "unknown";
      for (const group of result.Groups ?? []) {
        const service =
          group.Keys?.[0] ?? "UnknownService";
        const cost = parseFloat(
          group.Metrics?.["UnblendedCost"]?.Amount ?? "0",
        );

        if (!serviceCosts[service]) {
          serviceCosts[service] = [];
        }
        serviceCosts[service].push({ date, cost });
      }
    }

    // Detect anomalies per service
    const anomalies: AnomalyDetail[] = [];
    let totalAnomalyCost = 0;

    for (const [service, dailyCosts] of Object.entries(
      serviceCosts,
    )) {
      if (dailyCosts.length < 3) {
        continue;
      }

      const totalCost = dailyCosts.reduce(
        (sum, dc) => sum + dc.cost,
        0,
      );
      const avgCost = totalCost / dailyCosts.length;

      for (const dc of dailyCosts) {
        if (avgCost > 0 && dc.cost > avgCost * (1 + threshold)) {
          const anomalyScore =
            (dc.cost - avgCost) / avgCost;
          anomalies.push({
            date: dc.date,
            service,
            expectedCost: Math.round(avgCost * 100) / 100,
            actualCost:
              Math.round(dc.cost * 100) / 100,
            anomalyScore:
              Math.round(anomalyScore * 100) / 100,
          });
          totalAnomalyCost += dc.cost - avgCost;
        }
      }
    }

    totalAnomalyCost =
      Math.round(totalAnomalyCost * 100) / 100;

    // Notify via SNS if anomalies found
    if (snsTopicArn && anomalies.length > 0) {
      const sns = getClient(SNSClient, region);
      await sns.send(
        new PublishCommand({
          TopicArn: snsTopicArn,
          Subject: `Cost Anomaly Alert: ${anomalies.length} anomalies detected`,
          Message: JSON.stringify(
            {
              anomalies,
              totalAnomalyCost,
              period: `${formatDate(startDate)} to ${formatDate(endDate)}`,
            },
            null,
            2,
          ),
        }),
      );
    }

    const result: CostAnomalyResult = {
      anomalies,
      totalAnomalyCost,
      period: `${formatDate(startDate)} to ${formatDate(endDate)}`,
    };
    return CostAnomalyResultSchema.parse(result);
  } catch (err) {
    throw wrapAwsError(err, "costAnomalyDetector failed");
  }
}

/**
 * Analyze savings plan purchase recommendations.
 *
 * Retrieves savings plan purchase recommendations from the Cost Explorer
 * API for Compute and EC2 Instance savings plans.
 *
 * @param lookbackDays - Lookback period for recommendations (30, 60, or 90). Defaults to 30.
 * @param region - AWS region. Defaults to SDK default.
 * @returns Analysis result with recommendations and total potential savings.
 *
 * @example
 * ```ts
 * const result = await savingsPlanAnalyzer(60);
 * console.log(`Potential savings: $${result.totalPotentialSavings}`);
 * ```
 */
export async function savingsPlanAnalyzer(
  lookbackDays?: number,
  region?: string,
): Promise<SavingsPlanAnalysis> {
  try {
    const ce = getClient(CostExplorerClient, region);
    const lookback = lookbackDays ?? 30;

    // Map to valid lookback period
    let lookbackPeriod: "SEVEN_DAYS" | "THIRTY_DAYS" | "SIXTY_DAYS";
    if (lookback <= 7) {
      lookbackPeriod = "SEVEN_DAYS";
    } else if (lookback <= 30) {
      lookbackPeriod = "THIRTY_DAYS";
    } else {
      lookbackPeriod = "SIXTY_DAYS";
    }

    const recommendations: SavingsPlanRecommendation[] = [];
    let totalPotentialSavings = 0;

    // Query for Compute Savings Plans
    const savingsPlansTypes = [
      "COMPUTE_SP",
      "EC2_INSTANCE_SP",
    ] as const;
    const paymentOptions = [
      "NO_UPFRONT",
      "PARTIAL_UPFRONT",
      "ALL_UPFRONT",
    ] as const;

    for (const spType of savingsPlansTypes) {
      for (const payment of paymentOptions) {
        try {
          const resp = await ce.send(
            new GetSavingsPlansPurchaseRecommendationCommand(
              {
                SavingsPlansType: spType,
                PaymentOption: payment,
                LookbackPeriodInDays: lookbackPeriod,
                TermInYears: "ONE_YEAR",
              },
            ),
          );

          const details =
            resp.SavingsPlansPurchaseRecommendation
              ?.SavingsPlansPurchaseRecommendationDetails ??
            [];

          for (const detail of details) {
            const monthlySavings = parseFloat(
              detail.EstimatedMonthlySavingsAmount ??
                "0",
            );
            const onDemandCost = parseFloat(
              detail.EstimatedOnDemandCost ?? "0",
            );
            const upfront = parseFloat(
              detail.UpfrontCost ?? "0",
            );

            recommendations.push({
              savingsPlanType: spType,
              paymentOption: payment,
              estimatedMonthlySavings:
                Math.round(monthlySavings * 100) / 100,
              estimatedOnDemandCost:
                Math.round(onDemandCost * 100) / 100,
              upfrontCost:
                Math.round(upfront * 100) / 100,
            });

            totalPotentialSavings +=
              monthlySavings * 12;
          }
        } catch (_spErr) {
          // Skip unavailable combinations
        }
      }
    }

    totalPotentialSavings =
      Math.round(totalPotentialSavings * 100) / 100;

    const result: SavingsPlanAnalysis = {
      recommendations,
      totalPotentialSavings,
    };
    return SavingsPlanAnalysisSchema.parse(result);
  } catch (err) {
    throw wrapAwsError(err, "savingsPlanAnalyzer failed");
  }
}
