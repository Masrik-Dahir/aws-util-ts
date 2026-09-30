/**
 * aws-util/finding-ops — Multi-service security finding operation utilities.
 *
 * Provides typed helpers for routing Inspector findings to Jira, Macie
 * finding auto-remediation, Detective graph export, Security Hub finding
 * routing, CloudTrail anomaly detection, and Access Analyzer suppression.
 *
 * @module
 */

import { z } from "zod";
import { Inspector2Client } from "@aws-sdk/client-inspector2";
import { Macie2Client } from "@aws-sdk/client-macie2";
import { DetectiveClient } from "@aws-sdk/client-detective";
import { SecurityHubClient } from "@aws-sdk/client-securityhub";
import { CloudTrailClient } from "@aws-sdk/client-cloudtrail";
import { AccessAnalyzerClient } from "@aws-sdk/client-accessanalyzer";
import { getClient } from "./client.js";
import { wrapAwsError } from "./exceptions.js";

// ---------------------------------------------------------------------------
// Zod schemas & inferred types
// ---------------------------------------------------------------------------

/** Schema for an Inspector finding to Jira result. */
export const InspectorFindingToJiraResultSchema = z.object({
  findingArn: z.string(),
  jiraIssueKey: z.string().optional(),
  jiraProjectKey: z.string(),
  severity: z.string(),
  created: z.boolean(),
});

/** Inspector finding to Jira result. */
export type InspectorFindingToJiraResult = z.infer<typeof InspectorFindingToJiraResultSchema>;

/** Schema for a Macie finding remediation result. */
export const MacieFindingRemediationResultSchema = z.object({
  findingId: z.string(),
  bucket: z.string(),
  action: z.string(),
  remediated: z.boolean(),
  details: z.string().optional(),
});

/** Macie finding remediation result. */
export type MacieFindingRemediationResult = z.infer<typeof MacieFindingRemediationResultSchema>;

/** Schema for a Detective graph exporter result. */
export const DetectiveGraphExporterResultSchema = z.object({
  graphArn: z.string(),
  s3Bucket: z.string(),
  s3Key: z.string(),
  entitiesExported: z.number(),
  success: z.boolean(),
});

/** Detective graph exporter result. */
export type DetectiveGraphExporterResult = z.infer<typeof DetectiveGraphExporterResultSchema>;

/** Schema for a Security Hub finding router result. */
export const SecurityHubFindingRouterResultSchema = z.object({
  findingId: z.string(),
  productArn: z.string(),
  severity: z.string(),
  destination: z.string(),
  routed: z.boolean(),
});

/** Security Hub finding router result. */
export type SecurityHubFindingRouterResult = z.infer<typeof SecurityHubFindingRouterResultSchema>;

/** Schema for a CloudTrail anomaly detector result. */
export const CloudtrailAnomalyDetectorResultSchema = z.object({
  lookbackDays: z.number(),
  anomaliesFound: z.number(),
  anomalies: z.array(z.object({
    eventName: z.string(),
    sourceIpAddress: z.string(),
    userIdentity: z.string(),
    eventTime: z.string(),
    reason: z.string(),
  })),
  alertSent: z.boolean(),
});

/** CloudTrail anomaly detector result. */
export type CloudtrailAnomalyDetectorResult = z.infer<typeof CloudtrailAnomalyDetectorResultSchema>;

/** Schema for an Access Analyzer finding suppressor result. */
export const AccessAnalyzerFindingSuppressorResultSchema = z.object({
  analyzerArn: z.string(),
  findingsSuppressed: z.number(),
  archiveRuleCreated: z.boolean(),
});

/** Access Analyzer finding suppressor result. */
export type AccessAnalyzerFindingSuppressorResult = z.infer<typeof AccessAnalyzerFindingSuppressorResultSchema>;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Create Jira issues for critical or high Amazon Inspector findings. */
export async function inspectorFindingToJira(
  findingArn: string,
  jiraBaseUrl: string,
  jiraProjectKey: string,
  jiraCredentialsSecret: string,
  severityFilter?: string[],
  region?: string,
): Promise<InspectorFindingToJiraResult> {
  const client = getClient(Inspector2Client, region);
  try {
    // TODO: implement inspectorFindingToJira
    throw new Error("inspectorFindingToJira not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "inspectorFindingToJira failed");
  }
}

/** Auto-remediate Macie findings by blocking public access or tagging sensitive buckets. */
export async function macieFindingRemediation(
  findingId: string,
  action: "block-public" | "tag-sensitive" | "notify",
  notificationTopicArn?: string,
  region?: string,
): Promise<MacieFindingRemediationResult> {
  const client = getClient(Macie2Client, region);
  try {
    // TODO: implement macieFindingRemediation
    throw new Error("macieFindingRemediation not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "macieFindingRemediation failed");
  }
}

/** Export Detective investigation graph data to S3 for long-term retention. */
export async function detectiveGraphExporter(
  graphArn: string,
  s3Bucket: string,
  s3Prefix: string,
  region?: string,
): Promise<DetectiveGraphExporterResult> {
  const client = getClient(DetectiveClient, region);
  try {
    // TODO: implement detectiveGraphExporter
    throw new Error("detectiveGraphExporter not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "detectiveGraphExporter failed");
  }
}

/** Route Security Hub findings to different destinations based on severity and type. */
export async function securityHubFindingRouter(
  findingId: string,
  productArn: string,
  routingRules: Array<{ severity: string; destination: string; destinationType: "sns" | "sqs" | "lambda" }>,
  region?: string,
): Promise<SecurityHubFindingRouterResult> {
  const client = getClient(SecurityHubClient, region);
  try {
    // TODO: implement securityHubFindingRouter
    throw new Error("securityHubFindingRouter not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "securityHubFindingRouter failed");
  }
}

/** Detect unusual CloudTrail API call patterns and alert on anomalies. */
export async function cloudtrailAnomalyDetector(
  trailName: string,
  lookbackDays: number,
  baselineDays?: number,
  snsTopicArn?: string,
  region?: string,
): Promise<CloudtrailAnomalyDetectorResult> {
  const client = getClient(CloudTrailClient, region);
  try {
    // TODO: implement cloudtrailAnomalyDetector
    throw new Error("cloudtrailAnomalyDetector not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "cloudtrailAnomalyDetector failed");
  }
}

/** Suppress known-safe Access Analyzer findings by creating archive rules. */
export async function accessAnalyzerFindingSuppressor(
  analyzerArn: string,
  findingIds: string[],
  archiveRuleName?: string,
  suppressionReason?: string,
  region?: string,
): Promise<AccessAnalyzerFindingSuppressorResult> {
  const client = getClient(AccessAnalyzerClient, region);
  try {
    // TODO: implement accessAnalyzerFindingSuppressor
    throw new Error("accessAnalyzerFindingSuppressor not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "accessAnalyzerFindingSuppressor failed");
  }
}
