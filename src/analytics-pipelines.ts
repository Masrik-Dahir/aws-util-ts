/**
 * aws-util/analytics-pipelines — Multi-service analytics pipeline utilities.
 *
 * Provides typed helpers for Redshift unload/query, QuickSight embed/refresh,
 * Athena result routing, Glue catalog sync, DataBrew profiling, EMR Serverless,
 * Timestream query export, Neptune graph export, ELBv2 log analysis,
 * Glue job to Redshift loading, and OpenSearch index lifecycle management.
 *
 * @module
 */

import { z } from "zod";
import { RedshiftDataClient } from "@aws-sdk/client-redshift-data";
import { RedshiftServerlessClient } from "@aws-sdk/client-redshift-serverless";
import { QuickSightClient } from "@aws-sdk/client-quicksight";
import { AthenaClient } from "@aws-sdk/client-athena";
import { GlueClient } from "@aws-sdk/client-glue";
import { EMRServerlessClient } from "@aws-sdk/client-emr-serverless";
import { TimestreamQueryClient } from "@aws-sdk/client-timestream-query";
import { NeptuneGraphClient } from "@aws-sdk/client-neptune-graph";
import { ElasticLoadBalancingV2Client } from "@aws-sdk/client-elastic-load-balancing-v2";
import { getClient } from "./client.js";
import { wrapAwsError } from "./exceptions.js";

// ---------------------------------------------------------------------------
// Zod schemas & inferred types
// ---------------------------------------------------------------------------

/** Schema for a Redshift unload to S3 result. */
export const RedshiftUnloadToS3ResultSchema = z.object({
  query: z.string(),
  s3Bucket: z.string(),
  s3Prefix: z.string(),
  rowsUnloaded: z.number(),
  success: z.boolean(),
});

/** Redshift unload to S3 result. */
export type RedshiftUnloadToS3Result = z.infer<typeof RedshiftUnloadToS3ResultSchema>;

/** Schema for a Redshift Serverless query runner result. */
export const RedshiftServerlessQueryResultSchema = z.object({
  workgroupName: z.string(),
  queryId: z.string(),
  status: z.string(),
  rowCount: z.number(),
  results: z.array(z.record(z.string(), z.unknown())),
});

/** Redshift Serverless query runner result. */
export type RedshiftServerlessQueryResult = z.infer<typeof RedshiftServerlessQueryResultSchema>;

/** Schema for a QuickSight dashboard embedder result. */
export const QuicksightDashboardEmbedderResultSchema = z.object({
  dashboardId: z.string(),
  embedUrl: z.string(),
  expiresAt: z.string(),
});

/** QuickSight dashboard embedder result. */
export type QuicksightDashboardEmbedderResult = z.infer<typeof QuicksightDashboardEmbedderResultSchema>;

/** Schema for a QuickSight dataset refresher result. */
export const QuicksightDatasetRefresherResultSchema = z.object({
  datasetId: z.string(),
  ingestionId: z.string(),
  status: z.string(),
});

/** QuickSight dataset refresher result. */
export type QuicksightDatasetRefresherResult = z.infer<typeof QuicksightDatasetRefresherResultSchema>;

/** Schema for an Athena result to DynamoDB result. */
export const AthenaResultToDynamodbResultSchema = z.object({
  queryId: z.string(),
  tableName: z.string(),
  rowsWritten: z.number(),
  success: z.boolean(),
});

/** Athena result to DynamoDB result. */
export type AthenaResultToDynamodbResult = z.infer<typeof AthenaResultToDynamodbResultSchema>;

/** Schema for a Glue crawler and catalog sync result. */
export const GlueCrawlerAndCatalogSyncResultSchema = z.object({
  crawlerName: z.string(),
  crawlId: z.string(),
  tablesCreated: z.number(),
  tablesUpdated: z.number(),
  tablesDeleted: z.number(),
  status: z.string(),
});

/** Glue crawler and catalog sync result. */
export type GlueCrawlerAndCatalogSyncResult = z.infer<typeof GlueCrawlerAndCatalogSyncResultSchema>;

/** Schema for a Glue DataBrew profile pipeline result. */
export const GlueDatabrewProfilePipelineResultSchema = z.object({
  datasetName: z.string(),
  jobName: z.string(),
  jobRunId: z.string(),
  profileOutputBucket: z.string(),
  status: z.string(),
});

/** Glue DataBrew profile pipeline result. */
export type GlueDatabrewProfilePipelineResult = z.infer<typeof GlueDatabrewProfilePipelineResultSchema>;

/** Schema for an EMR Serverless job runner result. */
export const EmrServerlessJobRunnerResultSchema = z.object({
  applicationId: z.string(),
  jobRunId: z.string(),
  status: z.string(),
  entryPoint: z.string(),
});

/** EMR Serverless job runner result. */
export type EmrServerlessJobRunnerResult = z.infer<typeof EmrServerlessJobRunnerResultSchema>;

/** Schema for a Timestream query to S3 result. */
export const TimestreamQueryToS3ResultSchema = z.object({
  query: z.string(),
  s3Bucket: z.string(),
  s3Key: z.string(),
  rowsExported: z.number(),
  success: z.boolean(),
});

/** Timestream query to S3 result. */
export type TimestreamQueryToS3Result = z.infer<typeof TimestreamQueryToS3ResultSchema>;

/** Schema for a Neptune graph query to S3 result. */
export const NeptuneGraphQueryToS3ResultSchema = z.object({
  graphId: z.string(),
  query: z.string(),
  s3Bucket: z.string(),
  s3Key: z.string(),
  rowsExported: z.number(),
  success: z.boolean(),
});

/** Neptune graph query to S3 result. */
export type NeptuneGraphQueryToS3Result = z.infer<typeof NeptuneGraphQueryToS3ResultSchema>;

/** Schema for an ELBv2 access log analyzer result. */
export const Elbv2AccessLogAnalyzerResultSchema = z.object({
  loadBalancerArn: z.string(),
  logBucket: z.string(),
  logPrefix: z.string(),
  requestsAnalyzed: z.number(),
  topPaths: z.array(z.object({ path: z.string(); count: z.number() })),
  errorRate: z.number(),
});

/** ELBv2 access log analyzer result. */
export type Elbv2AccessLogAnalyzerResult = z.infer<typeof Elbv2AccessLogAnalyzerResultSchema>;

/** Schema for a Glue job output to Redshift result. */
export const GlueJobOutputToRedshiftResultSchema = z.object({
  jobName: z.string(),
  jobRunId: z.string(),
  targetTable: z.string(),
  rowsLoaded: z.number(),
  success: z.boolean(),
});

/** Glue job output to Redshift result. */
export type GlueJobOutputToRedshiftResult = z.infer<typeof GlueJobOutputToRedshiftResultSchema>;

/** Schema for an OpenSearch index lifecycle manager result. */
export const OpensearchIndexLifecycleManagerResultSchema = z.object({
  domain: z.string(),
  indicesProcessed: z.number(),
  indicesDeleted: z.number(),
  indicesArchived: z.number(),
  success: z.boolean(),
});

/** OpenSearch index lifecycle manager result. */
export type OpensearchIndexLifecycleManagerResult = z.infer<typeof OpensearchIndexLifecycleManagerResultSchema>;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Unload a Redshift query result to an S3 bucket in Parquet or CSV format. */
export async function redshiftUnloadToS3(
  clusterIdentifier: string,
  database: string,
  dbUser: string,
  query: string,
  s3Bucket: string,
  s3Prefix: string,
  iamRoleArn: string,
  format?: "CSV" | "PARQUET",
  region?: string,
): Promise<RedshiftUnloadToS3Result> {
  const client = getClient(RedshiftDataClient, region);
  try {
    // TODO: implement redshiftUnloadToS3
    throw new Error("redshiftUnloadToS3 not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "redshiftUnloadToS3 failed");
  }
}

/** Execute a SQL query on Redshift Serverless and return paginated results. */
export async function redshiftServerlessQueryRunner(
  workgroupName: string,
  database: string,
  query: string,
  maxRows?: number,
  region?: string,
): Promise<RedshiftServerlessQueryResult> {
  const client = getClient(RedshiftServerlessClient, region);
  try {
    // TODO: implement redshiftServerlessQueryRunner
    throw new Error("redshiftServerlessQueryRunner not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "redshiftServerlessQueryRunner failed");
  }
}

/** Generate an embedded URL for a QuickSight dashboard for anonymous or authenticated users. */
export async function quicksightDashboardEmbedder(
  awsAccountId: string,
  dashboardId: string,
  userArn: string,
  sessionLifetimeMinutes?: number,
  region?: string,
): Promise<QuicksightDashboardEmbedderResult> {
  const client = getClient(QuickSightClient, region);
  try {
    // TODO: implement quicksightDashboardEmbedder
    throw new Error("quicksightDashboardEmbedder not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "quicksightDashboardEmbedder failed");
  }
}

/** Trigger a full or incremental refresh of a QuickSight dataset and wait for completion. */
export async function quicksightDatasetRefresher(
  awsAccountId: string,
  datasetId: string,
  ingestionType?: "FULL_REFRESH" | "INCREMENTAL_REFRESH",
  region?: string,
): Promise<QuicksightDatasetRefresherResult> {
  const client = getClient(QuickSightClient, region);
  try {
    // TODO: implement quicksightDatasetRefresher
    throw new Error("quicksightDatasetRefresher not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "quicksightDatasetRefresher failed");
  }
}

/** Run an Athena query and load results into a DynamoDB table. */
export async function athenaResultToDynamodb(
  query: string,
  database: string,
  outputBucket: string,
  tableName: string,
  partitionKey: string,
  region?: string,
): Promise<AthenaResultToDynamodbResult> {
  const client = getClient(AthenaClient, region);
  try {
    // TODO: implement athenaResultToDynamodb
    throw new Error("athenaResultToDynamodb not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "athenaResultToDynamodb failed");
  }
}

/** Run a Glue crawler and sync the resulting Data Catalog table definitions. */
export async function glueCrawlerAndCatalogSync(
  crawlerName: string,
  waitForCompletion?: boolean,
  region?: string,
): Promise<GlueCrawlerAndCatalogSyncResult> {
  const client = getClient(GlueClient, region);
  try {
    // TODO: implement glueCrawlerAndCatalogSync
    throw new Error("glueCrawlerAndCatalogSync not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "glueCrawlerAndCatalogSync failed");
  }
}

/** Run a Glue DataBrew profile job and store the data quality report in S3. */
export async function glueDatabrewProfilePipeline(
  datasetName: string,
  jobName: string,
  outputBucket: string,
  outputPrefix?: string,
  region?: string,
): Promise<GlueDatabrewProfilePipelineResult> {
  const client = getClient(GlueClient, region);
  try {
    // TODO: implement glueDatabrewProfilePipeline
    throw new Error("glueDatabrewProfilePipeline not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "glueDatabrewProfilePipeline failed");
  }
}

/** Submit and monitor an EMR Serverless Spark or Hive job. */
export async function emrServerlessJobRunner(
  applicationId: string,
  executionRoleArn: string,
  entryPoint: string,
  entryPointArguments?: string[],
  sparkSubmitParameters?: string,
  waitForCompletion?: boolean,
  region?: string,
): Promise<EmrServerlessJobRunnerResult> {
  const client = getClient(EMRServerlessClient, region);
  try {
    // TODO: implement emrServerlessJobRunner
    throw new Error("emrServerlessJobRunner not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "emrServerlessJobRunner failed");
  }
}

/** Query Amazon Timestream and export results to S3 in JSON or CSV format. */
export async function timestreamQueryToS3(
  query: string,
  s3Bucket: string,
  s3Key: string,
  format?: "JSON" | "CSV",
  region?: string,
): Promise<TimestreamQueryToS3Result> {
  const client = getClient(TimestreamQueryClient, region);
  try {
    // TODO: implement timestreamQueryToS3
    throw new Error("timestreamQueryToS3 not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "timestreamQueryToS3 failed");
  }
}

/** Run a Neptune Analytics graph query and export results to S3. */
export async function neptuneGraphQueryToS3(
  graphId: string,
  query: string,
  queryLanguage: "OPEN_CYPHER" | "GREMLIN",
  s3Bucket: string,
  s3Key: string,
  region?: string,
): Promise<NeptuneGraphQueryToS3Result> {
  const client = getClient(NeptuneGraphClient, region);
  try {
    // TODO: implement neptuneGraphQueryToS3
    throw new Error("neptuneGraphQueryToS3 not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "neptuneGraphQueryToS3 failed");
  }
}

/** Analyze ELBv2 access logs from S3 and surface top paths and error rates. */
export async function elbv2AccessLogAnalyzer(
  loadBalancerArn: string,
  logBucket: string,
  logPrefix: string,
  lookbackHours?: number,
  topN?: number,
  region?: string,
): Promise<Elbv2AccessLogAnalyzerResult> {
  const client = getClient(ElasticLoadBalancingV2Client, region);
  try {
    // TODO: implement elbv2AccessLogAnalyzer
    throw new Error("elbv2AccessLogAnalyzer not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "elbv2AccessLogAnalyzer failed");
  }
}

/** Load Glue job output from S3 into a Redshift table using COPY command. */
export async function glueJobOutputToRedshift(
  jobName: string,
  s3OutputPath: string,
  redshiftCluster: string,
  database: string,
  targetTable: string,
  iamRoleArn: string,
  format?: "PARQUET" | "CSV",
  region?: string,
): Promise<GlueJobOutputToRedshiftResult> {
  const client = getClient(GlueClient, region);
  try {
    // TODO: implement glueJobOutputToRedshift
    throw new Error("glueJobOutputToRedshift not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "glueJobOutputToRedshift failed");
  }
}

/** Manage OpenSearch index lifecycle: delete old indices and archive to S3. */
export async function opensearchIndexLifecycleManager(
  domain: string,
  endpoint: string,
  retentionDays: number,
  archiveBucket?: string,
  indexPattern?: string,
  region?: string,
): Promise<OpensearchIndexLifecycleManagerResult> {
  const client = getClient(ElasticLoadBalancingV2Client, region);
  try {
    // TODO: implement opensearchIndexLifecycleManager
    throw new Error("opensearchIndexLifecycleManager not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "opensearchIndexLifecycleManager failed");
  }
}
