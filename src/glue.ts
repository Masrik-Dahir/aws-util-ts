/**
 * aws-util/glue — High-level AWS Glue job utilities.
 *
 * Provides typed helpers for starting, stopping, and polling Glue ETL jobs,
 * listing jobs and job runs, and a combined run-and-wait convenience function.
 *
 * All functions obtain a GlueClient via {@link getClient} and wrap errors
 * through {@link wrapAwsError}.
 *
 * @example
 * ```ts
 * import { runJobAndWait, listJobs } from "./glue.js";
 *
 * const run = await runJobAndWait("my-etl-job", {
 *   "--input-path": "s3://bucket/raw/",
 *   "--output-path": "s3://bucket/processed/",
 * });
 * console.log(run.jobRunState, run.completedOn);
 * ```
 *
 * @module
 */

import { z } from "zod";
import {
  GlueClient,
  StartJobRunCommand,
  GetJobRunCommand,
  GetJobCommand,
  GetJobRunsCommand,
  GetJobsCommand,
  BatchStopJobRunCommand,
} from "@aws-sdk/client-glue";
import { getClient } from "./client.js";
import { wrapAwsError, AwsTimeoutError } from "./exceptions.js";

// ---------------------------------------------------------------------------
// Zod schemas & inferred types
// ---------------------------------------------------------------------------

/** Schema for a Glue job definition. */
export const GlueJobSchema = z.object({
  name: z.string(),
  role: z.string().optional(),
  command: z
    .object({
      name: z.string().optional(),
      scriptLocation: z.string().optional(),
      pythonVersion: z.string().optional(),
    })
    .optional(),
  defaultArguments: z.record(z.string()).optional(),
});

/** A Glue job definition. */
export type GlueJob = z.infer<typeof GlueJobSchema>;

/** Schema for a Glue job run. */
export const GlueJobRunSchema = z.object({
  id: z.string(),
  jobName: z.string(),
  jobRunState: z.string(),
  startedOn: z.date().optional(),
  completedOn: z.date().optional(),
  errorMessage: z.string().optional(),
});

/** A Glue job run. */
export type GlueJobRun = z.infer<typeof GlueJobRunSchema>;

// ---------------------------------------------------------------------------
// Terminal job run states
// ---------------------------------------------------------------------------

/** Job run states that indicate a terminal condition. */
const TERMINAL_STATES = new Set([
  "SUCCEEDED",
  "FAILED",
  "STOPPED",
  "TIMEOUT",
  "ERROR",
]);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Get a cached GlueClient for the given region.
 */
function glue(region?: string): GlueClient {
  return getClient(GlueClient, region);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Start a Glue job run.
 *
 * @param jobName - The name of the Glue job.
 * @param arguments_ - Optional key-value arguments for the job run.
 * @param region - AWS region override.
 * @returns The job run ID.
 */
export async function startJobRun(
  jobName: string,
  arguments_?: Record<string, string>,
  region?: string,
): Promise<string> {
  try {
    const res = await glue(region).send(
      new StartJobRunCommand({
        JobName: jobName,
        Arguments: arguments_,
      }),
    );
    return res.JobRunId!;
  } catch (err: unknown) {
    throw wrapAwsError(err, `startJobRun(${jobName})`);
  }
}

/**
 * Get details of a specific Glue job run.
 *
 * @param jobName - The name of the Glue job.
 * @param runId - The job run ID.
 * @param region - AWS region override.
 * @returns The job run details.
 */
export async function getJobRun(
  jobName: string,
  runId: string,
  region?: string,
): Promise<GlueJobRun> {
  try {
    const res = await glue(region).send(
      new GetJobRunCommand({
        JobName: jobName,
        RunId: runId,
      }),
    );
    const jr = res.JobRun!;
    return GlueJobRunSchema.parse({
      id: jr.Id,
      jobName: jr.JobName,
      jobRunState: jr.JobRunState,
      startedOn: jr.StartedOn,
      completedOn: jr.CompletedOn,
      errorMessage: jr.ErrorMessage,
    });
  } catch (err: unknown) {
    throw wrapAwsError(err, `getJobRun(${jobName}, ${runId})`);
  }
}

/**
 * Get a Glue job definition by name.
 *
 * Returns `null` if the job does not exist.
 *
 * @param jobName - The name of the Glue job.
 * @param region - AWS region override.
 * @returns The job definition, or `null` if not found.
 */
export async function getJob(
  jobName: string,
  region?: string,
): Promise<GlueJob | null> {
  try {
    const res = await glue(region).send(
      new GetJobCommand({ JobName: jobName }),
    );
    const job = res.Job;
    if (!job) {
      return null;
    }
    return GlueJobSchema.parse({
      name: job.Name,
      role: job.Role,
      command: job.Command
        ? {
            name: job.Command.Name,
            scriptLocation: job.Command.ScriptLocation,
            pythonVersion: job.Command.PythonVersion,
          }
        : undefined,
      defaultArguments: job.DefaultArguments,
    });
  } catch (err: unknown) {
    // Glue throws EntityNotFoundException for missing jobs
    const record = err as Record<string, unknown>;
    const name = typeof record["name"] === "string" ? record["name"] : "";
    if (
      name === "EntityNotFoundException" ||
      name === "EntityNotFound"
    ) {
      return null;
    }
    throw wrapAwsError(err, `getJob(${jobName})`);
  }
}

/**
 * List all Glue job names in the account, auto-paginating through all pages.
 *
 * @param region - AWS region override.
 * @returns An array of job names.
 */
export async function listJobs(
  region?: string,
): Promise<string[]> {
  const results: string[] = [];
  let nextToken: string | undefined;

  try {
    do {
      const res = await glue(region).send(
        new GetJobsCommand({ NextToken: nextToken }),
      );
      for (const job of res.Jobs ?? []) {
        if (job.Name) {
          results.push(job.Name);
        }
      }
      nextToken = res.NextToken;
    } while (nextToken);
  } catch (err: unknown) {
    throw wrapAwsError(err, "listJobs");
  }

  return results;
}

/**
 * List all runs for a Glue job, auto-paginating through all pages.
 *
 * @param jobName - The name of the Glue job.
 * @param region - AWS region override.
 * @returns An array of {@link GlueJobRun} entries.
 */
export async function listJobRuns(
  jobName: string,
  region?: string,
): Promise<GlueJobRun[]> {
  const results: GlueJobRun[] = [];
  let nextToken: string | undefined;

  try {
    do {
      const res = await glue(region).send(
        new GetJobRunsCommand({
          JobName: jobName,
          NextToken: nextToken,
        }),
      );
      for (const jr of res.JobRuns ?? []) {
        results.push(
          GlueJobRunSchema.parse({
            id: jr.Id,
            jobName: jr.JobName,
            jobRunState: jr.JobRunState,
            startedOn: jr.StartedOn,
            completedOn: jr.CompletedOn,
            errorMessage: jr.ErrorMessage,
          }),
        );
      }
      nextToken = res.NextToken;
    } while (nextToken);
  } catch (err: unknown) {
    throw wrapAwsError(err, `listJobRuns(${jobName})`);
  }

  return results;
}

/**
 * Poll a Glue job run until it reaches a terminal state.
 *
 * Terminal states are SUCCEEDED, FAILED, STOPPED, TIMEOUT, and ERROR.
 *
 * @param jobName - The name of the Glue job.
 * @param runId - The job run ID to monitor.
 * @param timeout - Maximum wait time in milliseconds (default 600 000 = 10 min).
 * @param pollInterval - Delay between polls in milliseconds (default 10 000).
 * @param region - AWS region override.
 * @returns The final job run state.
 * @throws {AwsTimeoutError} If the job run does not complete within the timeout.
 */
export async function waitForJobRun(
  jobName: string,
  runId: string,
  timeout?: number,
  pollInterval?: number,
  region?: string,
): Promise<GlueJobRun> {
  const effectiveTimeout = timeout ?? 600_000;
  const effectivePollInterval = pollInterval ?? 10_000;
  const deadline = Date.now() + effectiveTimeout;

  while (Date.now() < deadline) {
    const run = await getJobRun(jobName, runId, region);
    if (TERMINAL_STATES.has(run.jobRunState)) {
      return run;
    }

    const remaining = deadline - Date.now();
    if (remaining <= 0) {
      break;
    }
    await new Promise((resolve) =>
      setTimeout(resolve, Math.min(effectivePollInterval, remaining)),
    );
  }

  throw new AwsTimeoutError(
    `waitForJobRun(${jobName}, ${runId}) timed out after ${effectiveTimeout}ms`,
  );
}

/**
 * Start a Glue job run and wait for it to complete.
 *
 * Combines {@link startJobRun} and {@link waitForJobRun} into a single
 * convenience call.
 *
 * @param jobName - The name of the Glue job.
 * @param arguments_ - Optional key-value arguments for the job run.
 * @param timeout - Maximum wait time in milliseconds (default 600 000).
 * @param pollInterval - Delay between polls in milliseconds (default 10 000).
 * @param region - AWS region override.
 * @returns The final job run state.
 */
export async function runJobAndWait(
  jobName: string,
  arguments_?: Record<string, string>,
  timeout?: number,
  pollInterval?: number,
  region?: string,
): Promise<GlueJobRun> {
  const runId = await startJobRun(jobName, arguments_, region);
  return waitForJobRun(jobName, runId, timeout, pollInterval, region);
}

/**
 * Stop a running Glue job run.
 *
 * @param jobName - The name of the Glue job.
 * @param runId - The job run ID to stop.
 * @param region - AWS region override.
 */
export async function stopJobRun(
  jobName: string,
  runId: string,
  region?: string,
): Promise<void> {
  try {
    await glue(region).send(
      new BatchStopJobRunCommand({
        JobName: jobName,
        JobRunIds: [runId],
      }),
    );
  } catch (err: unknown) {
    throw wrapAwsError(err, `stopJobRun(${jobName}, ${runId})`);
  }
}

// ---------------------------------------------------------------------------
// Additional types (auto-generated)
// ---------------------------------------------------------------------------

/** Result of batch_create_partition. */
export type BatchCreatePartitionResult = {
  errors?: Record<string, unknown>[];
};

/** Result of batch_delete_connection. */
export type BatchDeleteConnectionResult = {
  succeeded?: string[];
  errors?: Record<string, unknown>;
};

/** Result of batch_delete_partition. */
export type BatchDeletePartitionResult = {
  errors?: Record<string, unknown>[];
};

/** Result of batch_delete_table. */
export type BatchDeleteTableResult = {
  errors?: Record<string, unknown>[];
};

/** Result of batch_delete_table_version. */
export type BatchDeleteTableVersionResult = {
  errors?: Record<string, unknown>[];
};

/** Result of batch_get_blueprints. */
export type BatchGetBlueprintsResult = {
  blueprints?: Record<string, unknown>[];
  missingBlueprints?: string[];
};

/** Result of batch_get_crawlers. */
export type BatchGetCrawlersResult = {
  crawlers?: Record<string, unknown>[];
  crawlersNotFound?: string[];
};

/** Result of batch_get_custom_entity_types. */
export type BatchGetCustomEntityTypesResult = {
  customEntityTypes?: Record<string, unknown>[];
  customEntityTypesNotFound?: string[];
};

/** Result of batch_get_data_quality_result. */
export type BatchGetDataQualityResultResult = {
  results?: Record<string, unknown>[];
  resultsNotFound?: string[];
};

/** Result of batch_get_dev_endpoints. */
export type BatchGetDevEndpointsResult = {
  devEndpoints?: Record<string, unknown>[];
  devEndpointsNotFound?: string[];
};

/** Result of batch_get_jobs. */
export type BatchGetJobsResult = {
  jobs?: Record<string, unknown>[];
  jobsNotFound?: string[];
};

/** Result of batch_get_partition. */
export type BatchGetPartitionResult = {
  partitions?: Record<string, unknown>[];
  unprocessedKeys?: Record<string, unknown>[];
};

/** Result of batch_get_table_optimizer. */
export type BatchGetTableOptimizerResult = {
  tableOptimizers?: Record<string, unknown>[];
  failures?: Record<string, unknown>[];
};

/** Result of batch_get_triggers. */
export type BatchGetTriggersResult = {
  triggers?: Record<string, unknown>[];
  triggersNotFound?: string[];
};

/** Result of batch_get_workflows. */
export type BatchGetWorkflowsResult = {
  workflows?: Record<string, unknown>[];
  missingWorkflows?: string[];
};

/** Result of batch_put_data_quality_statistic_annotation. */
export type BatchPutDataQualityStatisticAnnotationResult = {
  failedInclusionAnnotations?: Record<string, unknown>[];
};

/** Result of batch_stop_job_run. */
export type BatchStopJobRunResult = {
  successfulSubmissions?: Record<string, unknown>[];
  errors?: Record<string, unknown>[];
};

/** Result of batch_update_partition. */
export type BatchUpdatePartitionResult = {
  errors?: Record<string, unknown>[];
};

/** Result of cancel_ml_task_run. */
export type CancelMlTaskRunResult = {
  transformId?: string | undefined;
  taskRunId?: string | undefined;
  status?: string | undefined;
};

/** Result of check_schema_version_validity. */
export type CheckSchemaVersionValidityResult = {
  valid?: boolean | undefined;
  error?: string | undefined;
};

/** Result of create_blueprint. */
export type CreateBlueprintResult = {
  name?: string | undefined;
};

/** Result of create_connection. */
export type CreateConnectionResult = {
  createConnectionStatus?: string | undefined;
};

/** Result of create_custom_entity_type. */
export type CreateCustomEntityTypeResult = {
  name?: string | undefined;
};

/** Result of create_data_quality_ruleset. */
export type CreateDataQualityRulesetResult = {
  name?: string | undefined;
};

/** Result of create_dev_endpoint. */
export type CreateDevEndpointResult = {
  endpointName?: string | undefined;
  status?: string | undefined;
  securityGroupIds?: string[];
  subnetId?: string | undefined;
  roleArn?: string | undefined;
  yarnEndpointAddress?: string | undefined;
  zeppelinRemoteSparkInterpreterPort?: number | undefined;
  numberOfNodes?: number | undefined;
  workerType?: string | undefined;
  glueVersion?: string | undefined;
  numberOfWorkers?: number | undefined;
  availabilityZone?: string | undefined;
  vpcId?: string | undefined;
  extraPythonLibsS3Path?: string | undefined;
  extraJarsS3Path?: string | undefined;
  failureReason?: string | undefined;
  securityConfiguration?: string | undefined;
  createdTimestamp?: string | undefined;
  arguments?: Record<string, unknown>;
};

/** Result of create_glue_identity_center_configuration. */
export type CreateGlueIdentityCenterConfigurationResult = {
  applicationArn?: string | undefined;
};

/** Result of create_integration. */
export type CreateIntegrationResult = {
  sourceArn?: string | undefined;
  targetArn?: string | undefined;
  integrationName?: string | undefined;
  description?: string | undefined;
  integrationArn?: string | undefined;
  kmsKeyId?: string | undefined;
  additionalEncryptionContext?: Record<string, unknown>;
  tags?: Record<string, unknown>[];
  status?: string | undefined;
  createTime?: string | undefined;
  errors?: Record<string, unknown>[];
  dataFilter?: string | undefined;
  integrationConfig?: Record<string, unknown>;
};

/** Result of create_integration_resource_property. */
export type CreateIntegrationResourcePropertyResult = {
  resourceArn?: string | undefined;
  sourceProcessingProperties?: Record<string, unknown>;
  targetProcessingProperties?: Record<string, unknown>;
};

/** Result of create_job. */
export type CreateJobResult = {
  name?: string | undefined;
};

/** Result of create_ml_transform. */
export type CreateMlTransformResult = {
  transformId?: string | undefined;
};

/** Result of create_registry. */
export type CreateRegistryResult = {
  registryArn?: string | undefined;
  registryName?: string | undefined;
  description?: string | undefined;
  tags?: Record<string, unknown>;
};

/** Result of create_schema. */
export type CreateSchemaResult = {
  registryName?: string | undefined;
  registryArn?: string | undefined;
  schemaName?: string | undefined;
  schemaArn?: string | undefined;
  description?: string | undefined;
  dataFormat?: string | undefined;
  compatibility?: string | undefined;
  schemaCheckpoint?: number | undefined;
  latestSchemaVersion?: number | undefined;
  nextSchemaVersion?: number | undefined;
  schemaStatus?: string | undefined;
  tags?: Record<string, unknown>;
  schemaVersionId?: string | undefined;
  schemaVersionStatus?: string | undefined;
};

/** Result of create_script. */
export type CreateScriptResult = {
  pythonScript?: string | undefined;
  scalaCode?: string | undefined;
};

/** Result of create_security_configuration. */
export type CreateSecurityConfigurationResult = {
  name?: string | undefined;
  createdTimestamp?: string | undefined;
};

/** Result of create_session. */
export type CreateSessionResult = {
  session?: Record<string, unknown>;
};

/** Result of create_trigger. */
export type CreateTriggerResult = {
  name?: string | undefined;
};

/** Result of create_usage_profile. */
export type CreateUsageProfileResult = {
  name?: string | undefined;
};

/** Result of create_workflow. */
export type CreateWorkflowResult = {
  name?: string | undefined;
};

/** Result of delete_blueprint. */
export type DeleteBlueprintResult = {
  name?: string | undefined;
};

/** Result of delete_custom_entity_type. */
export type DeleteCustomEntityTypeResult = {
  name?: string | undefined;
};

/** Result of delete_integration. */
export type DeleteIntegrationResult = {
  sourceArn?: string | undefined;
  targetArn?: string | undefined;
  integrationName?: string | undefined;
  description?: string | undefined;
  integrationArn?: string | undefined;
  kmsKeyId?: string | undefined;
  additionalEncryptionContext?: Record<string, unknown>;
  tags?: Record<string, unknown>[];
  status?: string | undefined;
  createTime?: string | undefined;
  errors?: Record<string, unknown>[];
  dataFilter?: string | undefined;
};

/** Result of delete_job. */
export type DeleteJobResult = {
  jobName?: string | undefined;
};

/** Result of delete_ml_transform. */
export type DeleteMlTransformResult = {
  transformId?: string | undefined;
};

/** Result of delete_registry. */
export type DeleteRegistryResult = {
  registryName?: string | undefined;
  registryArn?: string | undefined;
  status?: string | undefined;
};

/** Result of delete_schema. */
export type DeleteSchemaResult = {
  schemaArn?: string | undefined;
  schemaName?: string | undefined;
  status?: string | undefined;
};

/** Result of delete_schema_versions. */
export type DeleteSchemaVersionsResult = {
  schemaVersionErrors?: Record<string, unknown>[];
};

/** Result of delete_session. */
export type DeleteSessionResult = {
  id?: string | undefined;
};

/** Result of delete_trigger. */
export type DeleteTriggerResult = {
  name?: string | undefined;
};

/** Result of delete_workflow. */
export type DeleteWorkflowResult = {
  name?: string | undefined;
};

/** Result of describe_connection_type. */
export type DescribeConnectionTypeResult = {
  connectionType?: string | undefined;
  description?: string | undefined;
  capabilities?: Record<string, unknown>;
  connectionProperties?: Record<string, unknown>;
  connectionOptions?: Record<string, unknown>;
  authenticationConfiguration?: Record<string, unknown>;
  computeEnvironmentConfigurations?: Record<string, unknown>;
  physicalConnectionRequirements?: Record<string, unknown>;
  athenaConnectionProperties?: Record<string, unknown>;
  pythonConnectionProperties?: Record<string, unknown>;
  sparkConnectionProperties?: Record<string, unknown>;
};

/** Result of describe_entity. */
export type DescribeEntityResult = {
  fields?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_inbound_integrations. */
export type DescribeInboundIntegrationsResult = {
  inboundIntegrations?: Record<string, unknown>[];
  marker?: string | undefined;
};

/** Result of describe_integrations. */
export type DescribeIntegrationsResult = {
  integrations?: Record<string, unknown>[];
  marker?: string | undefined;
};

/** Result of get_blueprint. */
export type GetBlueprintResult = {
  blueprint?: Record<string, unknown>;
};

/** Result of get_blueprint_run. */
export type GetBlueprintRunResult = {
  blueprintRun?: Record<string, unknown>;
};

/** Result of get_blueprint_runs. */
export type GetBlueprintRunsResult = {
  blueprintRuns?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of get_catalog. */
export type GetCatalogResult = {
  catalog?: Record<string, unknown>;
};

/** Result of get_catalog_import_status. */
export type GetCatalogImportStatusResult = {
  importStatus?: Record<string, unknown>;
};

/** Result of get_catalogs. */
export type GetCatalogsResult = {
  catalogList?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of get_classifier. */
export type GetClassifierResult = {
  classifier?: Record<string, unknown>;
};

/** Result of get_classifiers. */
export type GetClassifiersResult = {
  classifiers?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of get_column_statistics_for_partition. */
export type GetColumnStatisticsForPartitionResult = {
  columnStatisticsList?: Record<string, unknown>[];
  errors?: Record<string, unknown>[];
};

/** Result of get_column_statistics_for_table. */
export type GetColumnStatisticsForTableResult = {
  columnStatisticsList?: Record<string, unknown>[];
  errors?: Record<string, unknown>[];
};

/** Result of get_column_statistics_task_run. */
export type GetColumnStatisticsTaskRunResult = {
  columnStatisticsTaskRun?: Record<string, unknown>;
};

/** Result of get_column_statistics_task_runs. */
export type GetColumnStatisticsTaskRunsResult = {
  columnStatisticsTaskRuns?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of get_column_statistics_task_settings. */
export type GetColumnStatisticsTaskSettingsResult = {
  columnStatisticsTaskSettings?: Record<string, unknown>;
};

/** Result of get_connection. */
export type GetConnectionResult = {
  connection?: Record<string, unknown>;
};

/** Result of get_connections. */
export type GetConnectionsResult = {
  connectionList?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of get_crawler. */
export type GetCrawlerResult = {
  crawler?: Record<string, unknown>;
};

/** Result of get_crawler_metrics. */
export type GetCrawlerMetricsResult = {
  crawlerMetricsList?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of get_crawlers. */
export type GetCrawlersResult = {
  crawlers?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of get_custom_entity_type. */
export type GetCustomEntityTypeResult = {
  name?: string | undefined;
  regexString?: string | undefined;
  contextWords?: string[];
};

/** Result of get_data_catalog_encryption_settings. */
export type GetDataCatalogEncryptionSettingsResult = {
  dataCatalogEncryptionSettings?: Record<string, unknown>;
};

/** Result of get_data_quality_model. */
export type GetDataQualityModelResult = {
  status?: string | undefined;
  startedOn?: string | undefined;
  completedOn?: string | undefined;
  failureReason?: string | undefined;
};

/** Result of get_data_quality_model_result. */
export type GetDataQualityModelResultResult = {
  completedOn?: string | undefined;
  model?: Record<string, unknown>[];
};

/** Result of get_data_quality_result. */
export type GetDataQualityResultResult = {
  resultId?: string | undefined;
  profileId?: string | undefined;
  score?: number | undefined;
  dataSource?: Record<string, unknown>;
  rulesetName?: string | undefined;
  evaluationContext?: string | undefined;
  startedOn?: string | undefined;
  completedOn?: string | undefined;
  jobName?: string | undefined;
  jobRunId?: string | undefined;
  rulesetEvaluationRunId?: string | undefined;
  ruleResults?: Record<string, unknown>[];
  analyzerResults?: Record<string, unknown>[];
  observations?: Record<string, unknown>[];
  aggregatedMetrics?: Record<string, unknown>;
};

/** Result of get_data_quality_rule_recommendation_run. */
export type GetDataQualityRuleRecommendationRunResult = {
  runId?: string | undefined;
  dataSource?: Record<string, unknown>;
  role?: string | undefined;
  numberOfWorkers?: number | undefined;
  timeout?: number | undefined;
  status?: string | undefined;
  errorString?: string | undefined;
  startedOn?: string | undefined;
  lastModifiedOn?: string | undefined;
  completedOn?: string | undefined;
  executionTime?: number | undefined;
  recommendedRuleset?: string | undefined;
  createdRulesetName?: string | undefined;
  dataQualitySecurityConfiguration?: string | undefined;
};

/** Result of get_data_quality_ruleset. */
export type GetDataQualityRulesetResult = {
  name?: string | undefined;
  description?: string | undefined;
  ruleset?: string | undefined;
  targetTable?: Record<string, unknown>;
  createdOn?: string | undefined;
  lastModifiedOn?: string | undefined;
  recommendationRunId?: string | undefined;
  dataQualitySecurityConfiguration?: string | undefined;
};

/** Result of get_data_quality_ruleset_evaluation_run. */
export type GetDataQualityRulesetEvaluationRunResult = {
  runId?: string | undefined;
  dataSource?: Record<string, unknown>;
  role?: string | undefined;
  numberOfWorkers?: number | undefined;
  timeout?: number | undefined;
  additionalRunOptions?: Record<string, unknown>;
  status?: string | undefined;
  errorString?: string | undefined;
  startedOn?: string | undefined;
  lastModifiedOn?: string | undefined;
  completedOn?: string | undefined;
  executionTime?: number | undefined;
  rulesetNames?: string[];
  resultIds?: string[];
  additionalDataSources?: Record<string, unknown>;
};

/** Result of get_database. */
export type GetDatabaseResult = {
  database?: Record<string, unknown>;
};

/** Result of get_databases. */
export type GetDatabasesResult = {
  databaseList?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of get_dataflow_graph. */
export type GetDataflowGraphResult = {
  dagNodes?: Record<string, unknown>[];
  dagEdges?: Record<string, unknown>[];
};

/** Result of get_dev_endpoint. */
export type GetDevEndpointResult = {
  devEndpoint?: Record<string, unknown>;
};

/** Result of get_dev_endpoints. */
export type GetDevEndpointsResult = {
  devEndpoints?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of get_entity_records. */
export type GetEntityRecordsResult = {
  records?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of get_glue_identity_center_configuration. */
export type GetGlueIdentityCenterConfigurationResult = {
  applicationArn?: string | undefined;
  instanceArn?: string | undefined;
  scopes?: string[];
  userBackgroundSessionsEnabled?: boolean | undefined;
};

/** Result of get_integration_resource_property. */
export type GetIntegrationResourcePropertyResult = {
  resourceArn?: string | undefined;
  sourceProcessingProperties?: Record<string, unknown>;
  targetProcessingProperties?: Record<string, unknown>;
};

/** Result of get_integration_table_properties. */
export type GetIntegrationTablePropertiesResult = {
  resourceArn?: string | undefined;
  tableName?: string | undefined;
  sourceTableConfig?: Record<string, unknown>;
  targetTableConfig?: Record<string, unknown>;
};

/** Result of get_job_bookmark. */
export type GetJobBookmarkResult = {
  jobBookmarkEntry?: Record<string, unknown>;
};

/** Result of get_job_runs. */
export type GetJobRunsResult = {
  jobRuns?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of get_jobs. */
export type GetJobsResult = {
  jobs?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of get_mapping. */
export type GetMappingResult = {
  mapping?: Record<string, unknown>[];
};

/** Result of get_ml_task_run. */
export type GetMlTaskRunResult = {
  transformId?: string | undefined;
  taskRunId?: string | undefined;
  status?: string | undefined;
  logGroupName?: string | undefined;
  properties?: Record<string, unknown>;
  errorString?: string | undefined;
  startedOn?: string | undefined;
  lastModifiedOn?: string | undefined;
  completedOn?: string | undefined;
  executionTime?: number | undefined;
};

/** Result of get_ml_task_runs. */
export type GetMlTaskRunsResult = {
  taskRuns?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of get_ml_transform. */
export type GetMlTransformResult = {
  transformId?: string | undefined;
  name?: string | undefined;
  description?: string | undefined;
  status?: string | undefined;
  createdOn?: string | undefined;
  lastModifiedOn?: string | undefined;
  inputRecordTables?: Record<string, unknown>[];
  parameters?: Record<string, unknown>;
  evaluationMetrics?: Record<string, unknown>;
  labelCount?: number | undefined;
  modelSchema?: Record<string, unknown>[];
  role?: string | undefined;
  glueVersion?: string | undefined;
  maxCapacity?: number | undefined;
  workerType?: string | undefined;
  numberOfWorkers?: number | undefined;
  timeout?: number | undefined;
  maxRetries?: number | undefined;
  transformEncryption?: Record<string, unknown>;
};

/** Result of get_ml_transforms. */
export type GetMlTransformsResult = {
  transforms?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of get_partition. */
export type GetPartitionResult = {
  partition?: Record<string, unknown>;
};

/** Result of get_partition_indexes. */
export type GetPartitionIndexesResult = {
  partitionIndexDescriptorList?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of get_partitions. */
export type GetPartitionsResult = {
  partitions?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of get_plan. */
export type GetPlanResult = {
  pythonScript?: string | undefined;
  scalaCode?: string | undefined;
};

/** Result of get_registry. */
export type GetRegistryResult = {
  registryName?: string | undefined;
  registryArn?: string | undefined;
  description?: string | undefined;
  status?: string | undefined;
  createdTime?: string | undefined;
  updatedTime?: string | undefined;
};

/** Result of get_resource_policies. */
export type GetResourcePoliciesResult = {
  getResourcePoliciesResponseList?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of get_resource_policy. */
export type GetResourcePolicyResult = {
  policyInJson?: string | undefined;
  policyHash?: string | undefined;
  createTime?: string | undefined;
  updateTime?: string | undefined;
};

/** Result of get_schema. */
export type GetSchemaResult = {
  registryName?: string | undefined;
  registryArn?: string | undefined;
  schemaName?: string | undefined;
  schemaArn?: string | undefined;
  description?: string | undefined;
  dataFormat?: string | undefined;
  compatibility?: string | undefined;
  schemaCheckpoint?: number | undefined;
  latestSchemaVersion?: number | undefined;
  nextSchemaVersion?: number | undefined;
  schemaStatus?: string | undefined;
  createdTime?: string | undefined;
  updatedTime?: string | undefined;
};

/** Result of get_schema_by_definition. */
export type GetSchemaByDefinitionResult = {
  schemaVersionId?: string | undefined;
  schemaArn?: string | undefined;
  dataFormat?: string | undefined;
  status?: string | undefined;
  createdTime?: string | undefined;
};

/** Result of get_schema_version. */
export type GetSchemaVersionResult = {
  schemaVersionId?: string | undefined;
  schemaDefinition?: string | undefined;
  dataFormat?: string | undefined;
  schemaArn?: string | undefined;
  versionNumber?: number | undefined;
  status?: string | undefined;
  createdTime?: string | undefined;
};

/** Result of get_schema_versions_diff. */
export type GetSchemaVersionsDiffResult = {
  diff?: string | undefined;
};

/** Result of get_security_configuration. */
export type GetSecurityConfigurationResult = {
  securityConfiguration?: Record<string, unknown>;
};

/** Result of get_security_configurations. */
export type GetSecurityConfigurationsResult = {
  securityConfigurations?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of get_session. */
export type GetSessionResult = {
  session?: Record<string, unknown>;
};

/** Result of get_statement. */
export type GetStatementResult = {
  statement?: Record<string, unknown>;
};

/** Result of get_table. */
export type GetTableResult = {
  table?: Record<string, unknown>;
};

/** Result of get_table_optimizer. */
export type GetTableOptimizerResult = {
  catalogId?: string | undefined;
  databaseName?: string | undefined;
  tableName?: string | undefined;
  tableOptimizer?: Record<string, unknown>;
};

/** Result of get_table_version. */
export type GetTableVersionResult = {
  tableVersion?: Record<string, unknown>;
};

/** Result of get_table_versions. */
export type GetTableVersionsResult = {
  tableVersions?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of get_tables. */
export type GetTablesResult = {
  tableList?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of get_tags. */
export type GetTagsResult = {
  tags?: Record<string, unknown>;
};

/** Result of get_trigger. */
export type GetTriggerResult = {
  trigger?: Record<string, unknown>;
};

/** Result of get_triggers. */
export type GetTriggersResult = {
  triggers?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of get_unfiltered_partition_metadata. */
export type GetUnfilteredPartitionMetadataResult = {
  partition?: Record<string, unknown>;
  authorizedColumns?: string[];
  isRegisteredWithLakeFormation?: boolean | undefined;
};

/** Result of get_unfiltered_partitions_metadata. */
export type GetUnfilteredPartitionsMetadataResult = {
  unfilteredPartitions?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of get_unfiltered_table_metadata. */
export type GetUnfilteredTableMetadataResult = {
  table?: Record<string, unknown>;
  authorizedColumns?: string[];
  isRegisteredWithLakeFormation?: boolean | undefined;
  cellFilters?: Record<string, unknown>[];
  queryAuthorizationId?: string | undefined;
  isMultiDialectView?: boolean | undefined;
  resourceArn?: string | undefined;
  isProtected?: boolean | undefined;
  permissions?: string[];
  rowFilter?: string | undefined;
};

/** Result of get_usage_profile. */
export type GetUsageProfileResult = {
  name?: string | undefined;
  description?: string | undefined;
  configuration?: Record<string, unknown>;
  createdOn?: string | undefined;
  lastModifiedOn?: string | undefined;
};

/** Result of get_user_defined_function. */
export type GetUserDefinedFunctionResult = {
  userDefinedFunction?: Record<string, unknown>;
};

/** Result of get_user_defined_functions. */
export type GetUserDefinedFunctionsResult = {
  userDefinedFunctions?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of get_workflow. */
export type GetWorkflowResult = {
  workflow?: Record<string, unknown>;
};

/** Result of get_workflow_run. */
export type GetWorkflowRunResult = {
  run?: Record<string, unknown>;
};

/** Result of get_workflow_run_properties. */
export type GetWorkflowRunPropertiesResult = {
  runProperties?: Record<string, unknown>;
};

/** Result of get_workflow_runs. */
export type GetWorkflowRunsResult = {
  runs?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_blueprints. */
export type ListBlueprintsResult = {
  blueprints?: string[];
  nextToken?: string | undefined;
};

/** Result of list_column_statistics_task_runs. */
export type ListColumnStatisticsTaskRunsResult = {
  columnStatisticsTaskRunIds?: string[];
  nextToken?: string | undefined;
};

/** Result of list_connection_types. */
export type ListConnectionTypesResult = {
  connectionTypes?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_crawlers. */
export type ListCrawlersResult = {
  crawlerNames?: string[];
  nextToken?: string | undefined;
};

/** Result of list_crawls. */
export type ListCrawlsResult = {
  crawls?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_custom_entity_types. */
export type ListCustomEntityTypesResult = {
  customEntityTypes?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_data_quality_results. */
export type ListDataQualityResultsResult = {
  results?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_data_quality_rule_recommendation_runs. */
export type ListDataQualityRuleRecommendationRunsResult = {
  runs?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_data_quality_ruleset_evaluation_runs. */
export type ListDataQualityRulesetEvaluationRunsResult = {
  runs?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_data_quality_rulesets. */
export type ListDataQualityRulesetsResult = {
  rulesets?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_data_quality_statistic_annotations. */
export type ListDataQualityStatisticAnnotationsResult = {
  annotations?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_data_quality_statistics. */
export type ListDataQualityStatisticsResult = {
  statistics?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_dev_endpoints. */
export type ListDevEndpointsResult = {
  devEndpointNames?: string[];
  nextToken?: string | undefined;
};

/** Result of list_entities. */
export type ListEntitiesResult = {
  entities?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_ml_transforms. */
export type ListMlTransformsResult = {
  transformIds?: string[];
  nextToken?: string | undefined;
};

/** Result of list_registries. */
export type ListRegistriesResult = {
  registries?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_schema_versions. */
export type ListSchemaVersionsResult = {
  schemas?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_schemas. */
export type ListSchemasResult = {
  schemas?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_sessions. */
export type ListSessionsResult = {
  ids?: string[];
  sessions?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_statements. */
export type ListStatementsResult = {
  statements?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_table_optimizer_runs. */
export type ListTableOptimizerRunsResult = {
  catalogId?: string | undefined;
  databaseName?: string | undefined;
  tableName?: string | undefined;
  nextToken?: string | undefined;
  tableOptimizerRuns?: Record<string, unknown>[];
};

/** Result of list_triggers. */
export type ListTriggersResult = {
  triggerNames?: string[];
  nextToken?: string | undefined;
};

/** Result of list_usage_profiles. */
export type ListUsageProfilesResult = {
  profiles?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_workflows. */
export type ListWorkflowsResult = {
  workflows?: string[];
  nextToken?: string | undefined;
};

/** Result of modify_integration. */
export type ModifyIntegrationResult = {
  sourceArn?: string | undefined;
  targetArn?: string | undefined;
  integrationName?: string | undefined;
  description?: string | undefined;
  integrationArn?: string | undefined;
  kmsKeyId?: string | undefined;
  additionalEncryptionContext?: Record<string, unknown>;
  tags?: Record<string, unknown>[];
  status?: string | undefined;
  createTime?: string | undefined;
  errors?: Record<string, unknown>[];
  dataFilter?: string | undefined;
  integrationConfig?: Record<string, unknown>;
};

/** Result of put_resource_policy. */
export type PutResourcePolicyResult = {
  policyHash?: string | undefined;
};

/** Result of put_schema_version_metadata. */
export type PutSchemaVersionMetadataResult = {
  schemaArn?: string | undefined;
  schemaName?: string | undefined;
  registryName?: string | undefined;
  latestVersion?: boolean | undefined;
  versionNumber?: number | undefined;
  schemaVersionId?: string | undefined;
  metadataKey?: string | undefined;
  metadataValue?: string | undefined;
};

/** Result of query_schema_version_metadata. */
export type QuerySchemaVersionMetadataResult = {
  metadataInfoMap?: Record<string, unknown>;
  schemaVersionId?: string | undefined;
  nextToken?: string | undefined;
};

/** Result of register_schema_version. */
export type RegisterSchemaVersionResult = {
  schemaVersionId?: string | undefined;
  versionNumber?: number | undefined;
  status?: string | undefined;
};

/** Result of remove_schema_version_metadata. */
export type RemoveSchemaVersionMetadataResult = {
  schemaArn?: string | undefined;
  schemaName?: string | undefined;
  registryName?: string | undefined;
  latestVersion?: boolean | undefined;
  versionNumber?: number | undefined;
  schemaVersionId?: string | undefined;
  metadataKey?: string | undefined;
  metadataValue?: string | undefined;
};

/** Result of reset_job_bookmark. */
export type ResetJobBookmarkResult = {
  jobBookmarkEntry?: Record<string, unknown>;
};

/** Result of resume_workflow_run. */
export type ResumeWorkflowRunResult = {
  runId?: string | undefined;
  nodeIds?: string[];
};

/** Result of run_statement. */
export type RunStatementResult = {
  id?: number | undefined;
};

/** Result of search_tables. */
export type SearchTablesResult = {
  nextToken?: string | undefined;
  tableList?: Record<string, unknown>[];
};

/** Result of start_blueprint_run. */
export type StartBlueprintRunResult = {
  runId?: string | undefined;
};

/** Result of start_column_statistics_task_run. */
export type StartColumnStatisticsTaskRunResult = {
  columnStatisticsTaskRunId?: string | undefined;
};

/** Result of start_data_quality_rule_recommendation_run. */
export type StartDataQualityRuleRecommendationRunResult = {
  runId?: string | undefined;
};

/** Result of start_data_quality_ruleset_evaluation_run. */
export type StartDataQualityRulesetEvaluationRunResult = {
  runId?: string | undefined;
};

/** Result of start_export_labels_task_run. */
export type StartExportLabelsTaskRunResult = {
  taskRunId?: string | undefined;
};

/** Result of start_import_labels_task_run. */
export type StartImportLabelsTaskRunResult = {
  taskRunId?: string | undefined;
};

/** Result of start_ml_evaluation_task_run. */
export type StartMlEvaluationTaskRunResult = {
  taskRunId?: string | undefined;
};

/** Result of start_ml_labeling_set_generation_task_run. */
export type StartMlLabelingSetGenerationTaskRunResult = {
  taskRunId?: string | undefined;
};

/** Result of start_trigger. */
export type StartTriggerResult = {
  name?: string | undefined;
};

/** Result of start_workflow_run. */
export type StartWorkflowRunResult = {
  runId?: string | undefined;
};

/** Result of stop_session. */
export type StopSessionResult = {
  id?: string | undefined;
};

/** Result of stop_trigger. */
export type StopTriggerResult = {
  name?: string | undefined;
};

/** Result of update_blueprint. */
export type UpdateBlueprintResult = {
  name?: string | undefined;
};

/** Result of update_column_statistics_for_partition. */
export type UpdateColumnStatisticsForPartitionResult = {
  errors?: Record<string, unknown>[];
};

/** Result of update_column_statistics_for_table. */
export type UpdateColumnStatisticsForTableResult = {
  errors?: Record<string, unknown>[];
};

/** Result of update_data_quality_ruleset. */
export type UpdateDataQualityRulesetResult = {
  name?: string | undefined;
  description?: string | undefined;
  ruleset?: string | undefined;
};

/** Result of update_integration_resource_property. */
export type UpdateIntegrationResourcePropertyResult = {
  resourceArn?: string | undefined;
  sourceProcessingProperties?: Record<string, unknown>;
  targetProcessingProperties?: Record<string, unknown>;
};

/** Result of update_job. */
export type UpdateJobResult = {
  jobName?: string | undefined;
};

/** Result of update_job_from_source_control. */
export type UpdateJobFromSourceControlResult = {
  jobName?: string | undefined;
};

/** Result of update_ml_transform. */
export type UpdateMlTransformResult = {
  transformId?: string | undefined;
};

/** Result of update_registry. */
export type UpdateRegistryResult = {
  registryName?: string | undefined;
  registryArn?: string | undefined;
};

/** Result of update_schema. */
export type UpdateSchemaResult = {
  schemaArn?: string | undefined;
  schemaName?: string | undefined;
  registryName?: string | undefined;
};

/** Result of update_source_control_from_job. */
export type UpdateSourceControlFromJobResult = {
  jobName?: string | undefined;
};

/** Result of update_trigger. */
export type UpdateTriggerResult = {
  trigger?: Record<string, unknown>;
};

/** Result of update_usage_profile. */
export type UpdateUsageProfileResult = {
  name?: string | undefined;
};

/** Result of update_workflow. */
export type UpdateWorkflowResult = {
  name?: string | undefined;
};


// ---------------------------------------------------------------------------
// Additional functions (auto-generated)
// ---------------------------------------------------------------------------

/** Batch create partition. */
export async function batchCreatePartition(databaseName: string, tableName: string, partitionInputList: Record<string, unknown>[]): Promise<BatchCreatePartitionResult> {
  try {
    // TODO: implement batch_create_partition
    throw new Error("batch_create_partition not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_create_partition failed");
  }
}

/** Batch delete connection. */
export async function batchDeleteConnection(connectionNameList: string[]): Promise<BatchDeleteConnectionResult> {
  try {
    // TODO: implement batch_delete_connection
    throw new Error("batch_delete_connection not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_delete_connection failed");
  }
}

/** Batch delete partition. */
export async function batchDeletePartition(databaseName: string, tableName: string, partitionsToDelete: Record<string, unknown>[]): Promise<BatchDeletePartitionResult> {
  try {
    // TODO: implement batch_delete_partition
    throw new Error("batch_delete_partition not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_delete_partition failed");
  }
}

/** Batch delete table. */
export async function batchDeleteTable(databaseName: string, tablesToDelete: string[]): Promise<BatchDeleteTableResult> {
  try {
    // TODO: implement batch_delete_table
    throw new Error("batch_delete_table not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_delete_table failed");
  }
}

/** Batch delete table version. */
export async function batchDeleteTableVersion(databaseName: string, tableName: string, versionIds: string[]): Promise<BatchDeleteTableVersionResult> {
  try {
    // TODO: implement batch_delete_table_version
    throw new Error("batch_delete_table_version not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_delete_table_version failed");
  }
}

/** Batch get blueprints. */
export async function batchGetBlueprints(names: string[]): Promise<BatchGetBlueprintsResult> {
  try {
    // TODO: implement batch_get_blueprints
    throw new Error("batch_get_blueprints not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_get_blueprints failed");
  }
}

/** Batch get crawlers. */
export async function batchGetCrawlers(crawlerNames: string[], regionName?: string | undefined): Promise<BatchGetCrawlersResult> {
  try {
    // TODO: implement batch_get_crawlers
    throw new Error("batch_get_crawlers not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_get_crawlers failed");
  }
}

/** Batch get custom entity types. */
export async function batchGetCustomEntityTypes(names: string[], regionName?: string | undefined): Promise<BatchGetCustomEntityTypesResult> {
  try {
    // TODO: implement batch_get_custom_entity_types
    throw new Error("batch_get_custom_entity_types not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_get_custom_entity_types failed");
  }
}

/** Batch get data quality result. */
export async function batchGetDataQualityResult(resultIds: string[], regionName?: string | undefined): Promise<BatchGetDataQualityResultResult> {
  try {
    // TODO: implement batch_get_data_quality_result
    throw new Error("batch_get_data_quality_result not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_get_data_quality_result failed");
  }
}

/** Batch get dev endpoints. */
export async function batchGetDevEndpoints(devEndpointNames: string[], regionName?: string | undefined): Promise<BatchGetDevEndpointsResult> {
  try {
    // TODO: implement batch_get_dev_endpoints
    throw new Error("batch_get_dev_endpoints not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_get_dev_endpoints failed");
  }
}

/** Batch get jobs. */
export async function batchGetJobs(jobNames: string[], regionName?: string | undefined): Promise<BatchGetJobsResult> {
  try {
    // TODO: implement batch_get_jobs
    throw new Error("batch_get_jobs not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_get_jobs failed");
  }
}

/** Batch get partition. */
export async function batchGetPartition(databaseName: string, tableName: string, partitionsToGet: Record<string, unknown>[]): Promise<BatchGetPartitionResult> {
  try {
    // TODO: implement batch_get_partition
    throw new Error("batch_get_partition not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_get_partition failed");
  }
}

/** Batch get table optimizer. */
export async function batchGetTableOptimizer(entries: Record<string, unknown>[], regionName?: string | undefined): Promise<BatchGetTableOptimizerResult> {
  try {
    // TODO: implement batch_get_table_optimizer
    throw new Error("batch_get_table_optimizer not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_get_table_optimizer failed");
  }
}

/** Batch get triggers. */
export async function batchGetTriggers(triggerNames: string[], regionName?: string | undefined): Promise<BatchGetTriggersResult> {
  try {
    // TODO: implement batch_get_triggers
    throw new Error("batch_get_triggers not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_get_triggers failed");
  }
}

/** Batch get workflows. */
export async function batchGetWorkflows(names: string[]): Promise<BatchGetWorkflowsResult> {
  try {
    // TODO: implement batch_get_workflows
    throw new Error("batch_get_workflows not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_get_workflows failed");
  }
}

/** Batch put data quality statistic annotation. */
export async function batchPutDataQualityStatisticAnnotation(inclusionAnnotations: Record<string, unknown>[]): Promise<BatchPutDataQualityStatisticAnnotationResult> {
  try {
    // TODO: implement batch_put_data_quality_statistic_annotation
    throw new Error("batch_put_data_quality_statistic_annotation not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_put_data_quality_statistic_annotation failed");
  }
}

/** Batch stop job run. */
export async function batchStopJobRun(jobName: string, jobRunIds: string[], regionName?: string | undefined): Promise<BatchStopJobRunResult> {
  try {
    // TODO: implement batch_stop_job_run
    throw new Error("batch_stop_job_run not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_stop_job_run failed");
  }
}

/** Batch update partition. */
export async function batchUpdatePartition(databaseName: string, tableName: string, entries: Record<string, unknown>[]): Promise<BatchUpdatePartitionResult> {
  try {
    // TODO: implement batch_update_partition
    throw new Error("batch_update_partition not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_update_partition failed");
  }
}

/** Cancel data quality rule recommendation run. */
export async function cancelDataQualityRuleRecommendationRun(runId: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement cancel_data_quality_rule_recommendation_run
    throw new Error("cancel_data_quality_rule_recommendation_run not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "cancel_data_quality_rule_recommendation_run failed");
  }
}

/** Cancel data quality ruleset evaluation run. */
export async function cancelDataQualityRulesetEvaluationRun(runId: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement cancel_data_quality_ruleset_evaluation_run
    throw new Error("cancel_data_quality_ruleset_evaluation_run not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "cancel_data_quality_ruleset_evaluation_run failed");
  }
}

/** Cancel ml task run. */
export async function cancelMlTaskRun(transformId: string, taskRunId: string, regionName?: string | undefined): Promise<CancelMlTaskRunResult> {
  try {
    // TODO: implement cancel_ml_task_run
    throw new Error("cancel_ml_task_run not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "cancel_ml_task_run failed");
  }
}

/** Cancel statement. */
export async function cancelStatement(sessionId: string, id: number): Promise<void> {
  try {
    // TODO: implement cancel_statement
    throw new Error("cancel_statement not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "cancel_statement failed");
  }
}

/** Check schema version validity. */
export async function checkSchemaVersionValidity(dataFormat: string, schemaDefinition: string, regionName?: string | undefined): Promise<CheckSchemaVersionValidityResult> {
  try {
    // TODO: implement check_schema_version_validity
    throw new Error("check_schema_version_validity not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "check_schema_version_validity failed");
  }
}

/** Create blueprint. */
export async function createBlueprint(name: string, blueprintLocation: string): Promise<CreateBlueprintResult> {
  try {
    // TODO: implement create_blueprint
    throw new Error("create_blueprint not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_blueprint failed");
  }
}

/** Create catalog. */
export async function createCatalog(name: string, catalogInput: Record<string, unknown>): Promise<void> {
  try {
    // TODO: implement create_catalog
    throw new Error("create_catalog not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_catalog failed");
  }
}

/** Create classifier. */
export async function createClassifier(): Promise<void> {
  try {
    // TODO: implement create_classifier
    throw new Error("create_classifier not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_classifier failed");
  }
}

/** Create column statistics task settings. */
export async function createColumnStatisticsTaskSettings(databaseName: string, tableName: string, role: string): Promise<void> {
  try {
    // TODO: implement create_column_statistics_task_settings
    throw new Error("create_column_statistics_task_settings not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_column_statistics_task_settings failed");
  }
}

/** Create connection. */
export async function createConnection(connectionInput: Record<string, unknown>): Promise<CreateConnectionResult> {
  try {
    // TODO: implement create_connection
    throw new Error("create_connection not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_connection failed");
  }
}

/** Create crawler. */
export async function createCrawler(name: string, role: string, targets: Record<string, unknown>): Promise<void> {
  try {
    // TODO: implement create_crawler
    throw new Error("create_crawler not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_crawler failed");
  }
}

/** Create custom entity type. */
export async function createCustomEntityType(name: string, regexString: string): Promise<CreateCustomEntityTypeResult> {
  try {
    // TODO: implement create_custom_entity_type
    throw new Error("create_custom_entity_type not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_custom_entity_type failed");
  }
}

/** Create data quality ruleset. */
export async function createDataQualityRuleset(name: string, ruleset: string): Promise<CreateDataQualityRulesetResult> {
  try {
    // TODO: implement create_data_quality_ruleset
    throw new Error("create_data_quality_ruleset not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_data_quality_ruleset failed");
  }
}

/** Create database. */
export async function createDatabase(databaseInput: Record<string, unknown>): Promise<void> {
  try {
    // TODO: implement create_database
    throw new Error("create_database not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_database failed");
  }
}

/** Create dev endpoint. */
export async function createDevEndpoint(endpointName: string, roleArn: string): Promise<CreateDevEndpointResult> {
  try {
    // TODO: implement create_dev_endpoint
    throw new Error("create_dev_endpoint not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_dev_endpoint failed");
  }
}

/** Create glue identity center configuration. */
export async function createGlueIdentityCenterConfiguration(instanceArn: string): Promise<CreateGlueIdentityCenterConfigurationResult> {
  try {
    // TODO: implement create_glue_identity_center_configuration
    throw new Error("create_glue_identity_center_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_glue_identity_center_configuration failed");
  }
}

/** Create integration. */
export async function createIntegration(integrationName: string, sourceArn: string, targetArn: string): Promise<CreateIntegrationResult> {
  try {
    // TODO: implement create_integration
    throw new Error("create_integration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_integration failed");
  }
}

/** Create integration resource property. */
export async function createIntegrationResourceProperty(resourceArn: string): Promise<CreateIntegrationResourcePropertyResult> {
  try {
    // TODO: implement create_integration_resource_property
    throw new Error("create_integration_resource_property not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_integration_resource_property failed");
  }
}

/** Create integration table properties. */
export async function createIntegrationTableProperties(resourceArn: string, tableName: string): Promise<void> {
  try {
    // TODO: implement create_integration_table_properties
    throw new Error("create_integration_table_properties not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_integration_table_properties failed");
  }
}

/** Create job. */
export async function createJob(name: string, role: string, command: Record<string, unknown>): Promise<CreateJobResult> {
  try {
    // TODO: implement create_job
    throw new Error("create_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_job failed");
  }
}

/** Create ml transform. */
export async function createMlTransform(name: string, inputRecordTables: Record<string, unknown>[], parameters: Record<string, unknown>, role: string): Promise<CreateMlTransformResult> {
  try {
    // TODO: implement create_ml_transform
    throw new Error("create_ml_transform not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_ml_transform failed");
  }
}

/** Create partition. */
export async function createPartition(databaseName: string, tableName: string, partitionInput: Record<string, unknown>): Promise<void> {
  try {
    // TODO: implement create_partition
    throw new Error("create_partition not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_partition failed");
  }
}

/** Create partition index. */
export async function createPartitionIndex(databaseName: string, tableName: string, partitionIndex: Record<string, unknown>): Promise<void> {
  try {
    // TODO: implement create_partition_index
    throw new Error("create_partition_index not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_partition_index failed");
  }
}

/** Create registry. */
export async function createRegistry(registryName: string): Promise<CreateRegistryResult> {
  try {
    // TODO: implement create_registry
    throw new Error("create_registry not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_registry failed");
  }
}

/** Create schema. */
export async function createSchema(schemaName: string, dataFormat: string): Promise<CreateSchemaResult> {
  try {
    // TODO: implement create_schema
    throw new Error("create_schema not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_schema failed");
  }
}

/** Create script. */
export async function createScript(): Promise<CreateScriptResult> {
  try {
    // TODO: implement create_script
    throw new Error("create_script not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_script failed");
  }
}

/** Create security configuration. */
export async function createSecurityConfiguration(name: string, encryptionConfiguration: Record<string, unknown>, regionName?: string | undefined): Promise<CreateSecurityConfigurationResult> {
  try {
    // TODO: implement create_security_configuration
    throw new Error("create_security_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_security_configuration failed");
  }
}

/** Create session. */
export async function createSession(id: string, role: string, command: Record<string, unknown>): Promise<CreateSessionResult> {
  try {
    // TODO: implement create_session
    throw new Error("create_session not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_session failed");
  }
}

/** Create table. */
export async function createTable(databaseName: string): Promise<void> {
  try {
    // TODO: implement create_table
    throw new Error("create_table not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_table failed");
  }
}

/** Create table optimizer. */
export async function createTableOptimizer(catalogId: string, databaseName: string, tableName: string, typeValue: string, tableOptimizerConfiguration: Record<string, unknown>, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement create_table_optimizer
    throw new Error("create_table_optimizer not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_table_optimizer failed");
  }
}

/** Create trigger. */
export async function createTrigger(name: string, typeValue: string, actions: Record<string, unknown>[]): Promise<CreateTriggerResult> {
  try {
    // TODO: implement create_trigger
    throw new Error("create_trigger not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_trigger failed");
  }
}

/** Create usage profile. */
export async function createUsageProfile(name: string, configuration: Record<string, unknown>): Promise<CreateUsageProfileResult> {
  try {
    // TODO: implement create_usage_profile
    throw new Error("create_usage_profile not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_usage_profile failed");
  }
}

/** Create user defined function. */
export async function createUserDefinedFunction(databaseName: string, functionInput: Record<string, unknown>): Promise<void> {
  try {
    // TODO: implement create_user_defined_function
    throw new Error("create_user_defined_function not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_user_defined_function failed");
  }
}

/** Create workflow. */
export async function createWorkflow(name: string): Promise<CreateWorkflowResult> {
  try {
    // TODO: implement create_workflow
    throw new Error("create_workflow not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_workflow failed");
  }
}

/** Delete blueprint. */
export async function deleteBlueprint(name: string, regionName?: string | undefined): Promise<DeleteBlueprintResult> {
  try {
    // TODO: implement delete_blueprint
    throw new Error("delete_blueprint not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_blueprint failed");
  }
}

/** Delete catalog. */
export async function deleteCatalog(catalogId: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_catalog
    throw new Error("delete_catalog not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_catalog failed");
  }
}

/** Delete classifier. */
export async function deleteClassifier(name: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_classifier
    throw new Error("delete_classifier not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_classifier failed");
  }
}

/** Delete column statistics for partition. */
export async function deleteColumnStatisticsForPartition(databaseName: string, tableName: string, partitionValues: string[], columnName: string): Promise<void> {
  try {
    // TODO: implement delete_column_statistics_for_partition
    throw new Error("delete_column_statistics_for_partition not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_column_statistics_for_partition failed");
  }
}

/** Delete column statistics for table. */
export async function deleteColumnStatisticsForTable(databaseName: string, tableName: string, columnName: string): Promise<void> {
  try {
    // TODO: implement delete_column_statistics_for_table
    throw new Error("delete_column_statistics_for_table not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_column_statistics_for_table failed");
  }
}

/** Delete column statistics task settings. */
export async function deleteColumnStatisticsTaskSettings(databaseName: string, tableName: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_column_statistics_task_settings
    throw new Error("delete_column_statistics_task_settings not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_column_statistics_task_settings failed");
  }
}

/** Delete connection. */
export async function deleteConnection(connectionName: string): Promise<void> {
  try {
    // TODO: implement delete_connection
    throw new Error("delete_connection not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_connection failed");
  }
}

/** Delete crawler. */
export async function deleteCrawler(name: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_crawler
    throw new Error("delete_crawler not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_crawler failed");
  }
}

/** Delete custom entity type. */
export async function deleteCustomEntityType(name: string, regionName?: string | undefined): Promise<DeleteCustomEntityTypeResult> {
  try {
    // TODO: implement delete_custom_entity_type
    throw new Error("delete_custom_entity_type not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_custom_entity_type failed");
  }
}

/** Delete data quality ruleset. */
export async function deleteDataQualityRuleset(name: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_data_quality_ruleset
    throw new Error("delete_data_quality_ruleset not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_data_quality_ruleset failed");
  }
}

/** Delete database. */
export async function deleteDatabase(name: string): Promise<void> {
  try {
    // TODO: implement delete_database
    throw new Error("delete_database not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_database failed");
  }
}

/** Delete dev endpoint. */
export async function deleteDevEndpoint(endpointName: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_dev_endpoint
    throw new Error("delete_dev_endpoint not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_dev_endpoint failed");
  }
}

/** Delete glue identity center configuration. */
export async function deleteGlueIdentityCenterConfiguration(regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_glue_identity_center_configuration
    throw new Error("delete_glue_identity_center_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_glue_identity_center_configuration failed");
  }
}

/** Delete integration. */
export async function deleteIntegration(integrationIdentifier: string, regionName?: string | undefined): Promise<DeleteIntegrationResult> {
  try {
    // TODO: implement delete_integration
    throw new Error("delete_integration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_integration failed");
  }
}

/** Delete integration table properties. */
export async function deleteIntegrationTableProperties(resourceArn: string, tableName: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_integration_table_properties
    throw new Error("delete_integration_table_properties not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_integration_table_properties failed");
  }
}

/** Delete job. */
export async function deleteJob(jobName: string, regionName?: string | undefined): Promise<DeleteJobResult> {
  try {
    // TODO: implement delete_job
    throw new Error("delete_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_job failed");
  }
}

/** Delete ml transform. */
export async function deleteMlTransform(transformId: string, regionName?: string | undefined): Promise<DeleteMlTransformResult> {
  try {
    // TODO: implement delete_ml_transform
    throw new Error("delete_ml_transform not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_ml_transform failed");
  }
}

/** Delete partition. */
export async function deletePartition(databaseName: string, tableName: string, partitionValues: string[]): Promise<void> {
  try {
    // TODO: implement delete_partition
    throw new Error("delete_partition not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_partition failed");
  }
}

/** Delete partition index. */
export async function deletePartitionIndex(databaseName: string, tableName: string, indexName: string): Promise<void> {
  try {
    // TODO: implement delete_partition_index
    throw new Error("delete_partition_index not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_partition_index failed");
  }
}

/** Delete registry. */
export async function deleteRegistry(registryId: Record<string, unknown>, regionName?: string | undefined): Promise<DeleteRegistryResult> {
  try {
    // TODO: implement delete_registry
    throw new Error("delete_registry not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_registry failed");
  }
}

/** Delete resource policy. */
export async function deleteResourcePolicy(): Promise<void> {
  try {
    // TODO: implement delete_resource_policy
    throw new Error("delete_resource_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_resource_policy failed");
  }
}

/** Delete schema. */
export async function deleteSchema(schemaId: Record<string, unknown>, regionName?: string | undefined): Promise<DeleteSchemaResult> {
  try {
    // TODO: implement delete_schema
    throw new Error("delete_schema not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_schema failed");
  }
}

/** Delete schema versions. */
export async function deleteSchemaVersions(schemaId: Record<string, unknown>, versions: string, regionName?: string | undefined): Promise<DeleteSchemaVersionsResult> {
  try {
    // TODO: implement delete_schema_versions
    throw new Error("delete_schema_versions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_schema_versions failed");
  }
}

/** Delete security configuration. */
export async function deleteSecurityConfiguration(name: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_security_configuration
    throw new Error("delete_security_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_security_configuration failed");
  }
}

/** Delete session. */
export async function deleteSession(id: string): Promise<DeleteSessionResult> {
  try {
    // TODO: implement delete_session
    throw new Error("delete_session not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_session failed");
  }
}

/** Delete table. */
export async function deleteTable(databaseName: string, name: string): Promise<void> {
  try {
    // TODO: implement delete_table
    throw new Error("delete_table not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_table failed");
  }
}

/** Delete table optimizer. */
export async function deleteTableOptimizer(catalogId: string, databaseName: string, tableName: string, typeValue: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_table_optimizer
    throw new Error("delete_table_optimizer not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_table_optimizer failed");
  }
}

/** Delete table version. */
export async function deleteTableVersion(databaseName: string, tableName: string, versionId: string): Promise<void> {
  try {
    // TODO: implement delete_table_version
    throw new Error("delete_table_version not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_table_version failed");
  }
}

/** Delete trigger. */
export async function deleteTrigger(name: string, regionName?: string | undefined): Promise<DeleteTriggerResult> {
  try {
    // TODO: implement delete_trigger
    throw new Error("delete_trigger not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_trigger failed");
  }
}

/** Delete usage profile. */
export async function deleteUsageProfile(name: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_usage_profile
    throw new Error("delete_usage_profile not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_usage_profile failed");
  }
}

/** Delete user defined function. */
export async function deleteUserDefinedFunction(databaseName: string, functionName: string): Promise<void> {
  try {
    // TODO: implement delete_user_defined_function
    throw new Error("delete_user_defined_function not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_user_defined_function failed");
  }
}

/** Delete workflow. */
export async function deleteWorkflow(name: string, regionName?: string | undefined): Promise<DeleteWorkflowResult> {
  try {
    // TODO: implement delete_workflow
    throw new Error("delete_workflow not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_workflow failed");
  }
}

/** Describe connection type. */
export async function describeConnectionType(connectionType: string, regionName?: string | undefined): Promise<DescribeConnectionTypeResult> {
  try {
    // TODO: implement describe_connection_type
    throw new Error("describe_connection_type not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_connection_type failed");
  }
}

/** Describe entity. */
export async function describeEntity(connectionName: string, entityName: string): Promise<DescribeEntityResult> {
  try {
    // TODO: implement describe_entity
    throw new Error("describe_entity not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_entity failed");
  }
}

/** Describe inbound integrations. */
export async function describeInboundIntegrations(): Promise<DescribeInboundIntegrationsResult> {
  try {
    // TODO: implement describe_inbound_integrations
    throw new Error("describe_inbound_integrations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_inbound_integrations failed");
  }
}

/** Describe integrations. */
export async function describeIntegrations(): Promise<DescribeIntegrationsResult> {
  try {
    // TODO: implement describe_integrations
    throw new Error("describe_integrations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_integrations failed");
  }
}

/** Get blueprint. */
export async function getBlueprint(name: string): Promise<GetBlueprintResult> {
  try {
    // TODO: implement get_blueprint
    throw new Error("get_blueprint not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_blueprint failed");
  }
}

/** Get blueprint run. */
export async function getBlueprintRun(blueprintName: string, runId: string, regionName?: string | undefined): Promise<GetBlueprintRunResult> {
  try {
    // TODO: implement get_blueprint_run
    throw new Error("get_blueprint_run not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_blueprint_run failed");
  }
}

/** Get blueprint runs. */
export async function getBlueprintRuns(blueprintName: string): Promise<GetBlueprintRunsResult> {
  try {
    // TODO: implement get_blueprint_runs
    throw new Error("get_blueprint_runs not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_blueprint_runs failed");
  }
}

/** Get catalog. */
export async function getCatalog(catalogId: string, regionName?: string | undefined): Promise<GetCatalogResult> {
  try {
    // TODO: implement get_catalog
    throw new Error("get_catalog not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_catalog failed");
  }
}

/** Get catalog import status. */
export async function getCatalogImportStatus(): Promise<GetCatalogImportStatusResult> {
  try {
    // TODO: implement get_catalog_import_status
    throw new Error("get_catalog_import_status not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_catalog_import_status failed");
  }
}

/** Get catalogs. */
export async function getCatalogs(): Promise<GetCatalogsResult> {
  try {
    // TODO: implement get_catalogs
    throw new Error("get_catalogs not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_catalogs failed");
  }
}

/** Get classifier. */
export async function getClassifier(name: string, regionName?: string | undefined): Promise<GetClassifierResult> {
  try {
    // TODO: implement get_classifier
    throw new Error("get_classifier not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_classifier failed");
  }
}

/** Get classifiers. */
export async function getClassifiers(): Promise<GetClassifiersResult> {
  try {
    // TODO: implement get_classifiers
    throw new Error("get_classifiers not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_classifiers failed");
  }
}

/** Get column statistics for partition. */
export async function getColumnStatisticsForPartition(databaseName: string, tableName: string, partitionValues: string[], columnNames: string[]): Promise<GetColumnStatisticsForPartitionResult> {
  try {
    // TODO: implement get_column_statistics_for_partition
    throw new Error("get_column_statistics_for_partition not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_column_statistics_for_partition failed");
  }
}

/** Get column statistics for table. */
export async function getColumnStatisticsForTable(databaseName: string, tableName: string, columnNames: string[]): Promise<GetColumnStatisticsForTableResult> {
  try {
    // TODO: implement get_column_statistics_for_table
    throw new Error("get_column_statistics_for_table not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_column_statistics_for_table failed");
  }
}

/** Get column statistics task run. */
export async function getColumnStatisticsTaskRun(columnStatisticsTaskRunId: string, regionName?: string | undefined): Promise<GetColumnStatisticsTaskRunResult> {
  try {
    // TODO: implement get_column_statistics_task_run
    throw new Error("get_column_statistics_task_run not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_column_statistics_task_run failed");
  }
}

/** Get column statistics task runs. */
export async function getColumnStatisticsTaskRuns(databaseName: string, tableName: string): Promise<GetColumnStatisticsTaskRunsResult> {
  try {
    // TODO: implement get_column_statistics_task_runs
    throw new Error("get_column_statistics_task_runs not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_column_statistics_task_runs failed");
  }
}

/** Get column statistics task settings. */
export async function getColumnStatisticsTaskSettings(databaseName: string, tableName: string, regionName?: string | undefined): Promise<GetColumnStatisticsTaskSettingsResult> {
  try {
    // TODO: implement get_column_statistics_task_settings
    throw new Error("get_column_statistics_task_settings not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_column_statistics_task_settings failed");
  }
}

/** Get connection. */
export async function getConnection(name: string): Promise<GetConnectionResult> {
  try {
    // TODO: implement get_connection
    throw new Error("get_connection not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_connection failed");
  }
}

/** Get connections. */
export async function getConnections(): Promise<GetConnectionsResult> {
  try {
    // TODO: implement get_connections
    throw new Error("get_connections not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_connections failed");
  }
}

/** Get crawler. */
export async function getCrawler(name: string, regionName?: string | undefined): Promise<GetCrawlerResult> {
  try {
    // TODO: implement get_crawler
    throw new Error("get_crawler not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_crawler failed");
  }
}

/** Get crawler metrics. */
export async function getCrawlerMetrics(): Promise<GetCrawlerMetricsResult> {
  try {
    // TODO: implement get_crawler_metrics
    throw new Error("get_crawler_metrics not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_crawler_metrics failed");
  }
}

/** Get crawlers. */
export async function getCrawlers(): Promise<GetCrawlersResult> {
  try {
    // TODO: implement get_crawlers
    throw new Error("get_crawlers not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_crawlers failed");
  }
}

/** Get custom entity type. */
export async function getCustomEntityType(name: string, regionName?: string | undefined): Promise<GetCustomEntityTypeResult> {
  try {
    // TODO: implement get_custom_entity_type
    throw new Error("get_custom_entity_type not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_custom_entity_type failed");
  }
}

/** Get data catalog encryption settings. */
export async function getDataCatalogEncryptionSettings(): Promise<GetDataCatalogEncryptionSettingsResult> {
  try {
    // TODO: implement get_data_catalog_encryption_settings
    throw new Error("get_data_catalog_encryption_settings not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_data_catalog_encryption_settings failed");
  }
}

/** Get data quality model. */
export async function getDataQualityModel(profileId: string): Promise<GetDataQualityModelResult> {
  try {
    // TODO: implement get_data_quality_model
    throw new Error("get_data_quality_model not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_data_quality_model failed");
  }
}

/** Get data quality model result. */
export async function getDataQualityModelResult(statisticId: string, profileId: string, regionName?: string | undefined): Promise<GetDataQualityModelResultResult> {
  try {
    // TODO: implement get_data_quality_model_result
    throw new Error("get_data_quality_model_result not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_data_quality_model_result failed");
  }
}

/** Get data quality result. */
export async function getDataQualityResult(resultId: string, regionName?: string | undefined): Promise<GetDataQualityResultResult> {
  try {
    // TODO: implement get_data_quality_result
    throw new Error("get_data_quality_result not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_data_quality_result failed");
  }
}

/** Get data quality rule recommendation run. */
export async function getDataQualityRuleRecommendationRun(runId: string, regionName?: string | undefined): Promise<GetDataQualityRuleRecommendationRunResult> {
  try {
    // TODO: implement get_data_quality_rule_recommendation_run
    throw new Error("get_data_quality_rule_recommendation_run not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_data_quality_rule_recommendation_run failed");
  }
}

/** Get data quality ruleset. */
export async function getDataQualityRuleset(name: string, regionName?: string | undefined): Promise<GetDataQualityRulesetResult> {
  try {
    // TODO: implement get_data_quality_ruleset
    throw new Error("get_data_quality_ruleset not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_data_quality_ruleset failed");
  }
}

/** Get data quality ruleset evaluation run. */
export async function getDataQualityRulesetEvaluationRun(runId: string, regionName?: string | undefined): Promise<GetDataQualityRulesetEvaluationRunResult> {
  try {
    // TODO: implement get_data_quality_ruleset_evaluation_run
    throw new Error("get_data_quality_ruleset_evaluation_run not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_data_quality_ruleset_evaluation_run failed");
  }
}

/** Get database. */
export async function getDatabase(name: string): Promise<GetDatabaseResult> {
  try {
    // TODO: implement get_database
    throw new Error("get_database not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_database failed");
  }
}

/** Get databases. */
export async function getDatabases(): Promise<GetDatabasesResult> {
  try {
    // TODO: implement get_databases
    throw new Error("get_databases not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_databases failed");
  }
}

/** Get dataflow graph. */
export async function getDataflowGraph(): Promise<GetDataflowGraphResult> {
  try {
    // TODO: implement get_dataflow_graph
    throw new Error("get_dataflow_graph not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_dataflow_graph failed");
  }
}

/** Get dev endpoint. */
export async function getDevEndpoint(endpointName: string, regionName?: string | undefined): Promise<GetDevEndpointResult> {
  try {
    // TODO: implement get_dev_endpoint
    throw new Error("get_dev_endpoint not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_dev_endpoint failed");
  }
}

/** Get dev endpoints. */
export async function getDevEndpoints(): Promise<GetDevEndpointsResult> {
  try {
    // TODO: implement get_dev_endpoints
    throw new Error("get_dev_endpoints not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_dev_endpoints failed");
  }
}

/** Get entity records. */
export async function getEntityRecords(entityName: string, limit: number): Promise<GetEntityRecordsResult> {
  try {
    // TODO: implement get_entity_records
    throw new Error("get_entity_records not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_entity_records failed");
  }
}

/** Get glue identity center configuration. */
export async function getGlueIdentityCenterConfiguration(regionName?: string | undefined): Promise<GetGlueIdentityCenterConfigurationResult> {
  try {
    // TODO: implement get_glue_identity_center_configuration
    throw new Error("get_glue_identity_center_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_glue_identity_center_configuration failed");
  }
}

/** Get integration resource property. */
export async function getIntegrationResourceProperty(resourceArn: string, regionName?: string | undefined): Promise<GetIntegrationResourcePropertyResult> {
  try {
    // TODO: implement get_integration_resource_property
    throw new Error("get_integration_resource_property not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_integration_resource_property failed");
  }
}

/** Get integration table properties. */
export async function getIntegrationTableProperties(resourceArn: string, tableName: string, regionName?: string | undefined): Promise<GetIntegrationTablePropertiesResult> {
  try {
    // TODO: implement get_integration_table_properties
    throw new Error("get_integration_table_properties not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_integration_table_properties failed");
  }
}

/** Get job bookmark. */
export async function getJobBookmark(jobName: string): Promise<GetJobBookmarkResult> {
  try {
    // TODO: implement get_job_bookmark
    throw new Error("get_job_bookmark not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_job_bookmark failed");
  }
}

/** Get job runs. */
export async function getJobRuns(jobName: string): Promise<GetJobRunsResult> {
  try {
    // TODO: implement get_job_runs
    throw new Error("get_job_runs not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_job_runs failed");
  }
}

/** Get jobs. */
export async function getJobs(): Promise<GetJobsResult> {
  try {
    // TODO: implement get_jobs
    throw new Error("get_jobs not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_jobs failed");
  }
}

/** Get mapping. */
export async function getMapping(source: Record<string, unknown>): Promise<GetMappingResult> {
  try {
    // TODO: implement get_mapping
    throw new Error("get_mapping not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_mapping failed");
  }
}

/** Get ml task run. */
export async function getMlTaskRun(transformId: string, taskRunId: string, regionName?: string | undefined): Promise<GetMlTaskRunResult> {
  try {
    // TODO: implement get_ml_task_run
    throw new Error("get_ml_task_run not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_ml_task_run failed");
  }
}

/** Get ml task runs. */
export async function getMlTaskRuns(transformId: string): Promise<GetMlTaskRunsResult> {
  try {
    // TODO: implement get_ml_task_runs
    throw new Error("get_ml_task_runs not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_ml_task_runs failed");
  }
}

/** Get ml transform. */
export async function getMlTransform(transformId: string, regionName?: string | undefined): Promise<GetMlTransformResult> {
  try {
    // TODO: implement get_ml_transform
    throw new Error("get_ml_transform not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_ml_transform failed");
  }
}

/** Get ml transforms. */
export async function getMlTransforms(): Promise<GetMlTransformsResult> {
  try {
    // TODO: implement get_ml_transforms
    throw new Error("get_ml_transforms not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_ml_transforms failed");
  }
}

/** Get partition. */
export async function getPartition(databaseName: string, tableName: string, partitionValues: string[]): Promise<GetPartitionResult> {
  try {
    // TODO: implement get_partition
    throw new Error("get_partition not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_partition failed");
  }
}

/** Get partition indexes. */
export async function getPartitionIndexes(databaseName: string, tableName: string): Promise<GetPartitionIndexesResult> {
  try {
    // TODO: implement get_partition_indexes
    throw new Error("get_partition_indexes not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_partition_indexes failed");
  }
}

/** Get partitions. */
export async function getPartitions(databaseName: string, tableName: string): Promise<GetPartitionsResult> {
  try {
    // TODO: implement get_partitions
    throw new Error("get_partitions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_partitions failed");
  }
}

/** Get plan. */
export async function getPlan(mapping: Record<string, unknown>[], source: Record<string, unknown>): Promise<GetPlanResult> {
  try {
    // TODO: implement get_plan
    throw new Error("get_plan not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_plan failed");
  }
}

/** Get registry. */
export async function getRegistry(registryId: Record<string, unknown>, regionName?: string | undefined): Promise<GetRegistryResult> {
  try {
    // TODO: implement get_registry
    throw new Error("get_registry not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_registry failed");
  }
}

/** Get resource policies. */
export async function getResourcePolicies(): Promise<GetResourcePoliciesResult> {
  try {
    // TODO: implement get_resource_policies
    throw new Error("get_resource_policies not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_resource_policies failed");
  }
}

/** Get resource policy. */
export async function getResourcePolicy(): Promise<GetResourcePolicyResult> {
  try {
    // TODO: implement get_resource_policy
    throw new Error("get_resource_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_resource_policy failed");
  }
}

/** Get schema. */
export async function getSchema(schemaId: Record<string, unknown>, regionName?: string | undefined): Promise<GetSchemaResult> {
  try {
    // TODO: implement get_schema
    throw new Error("get_schema not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_schema failed");
  }
}

/** Get schema by definition. */
export async function getSchemaByDefinition(schemaId: Record<string, unknown>, schemaDefinition: string, regionName?: string | undefined): Promise<GetSchemaByDefinitionResult> {
  try {
    // TODO: implement get_schema_by_definition
    throw new Error("get_schema_by_definition not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_schema_by_definition failed");
  }
}

/** Get schema version. */
export async function getSchemaVersion(): Promise<GetSchemaVersionResult> {
  try {
    // TODO: implement get_schema_version
    throw new Error("get_schema_version not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_schema_version failed");
  }
}

/** Get schema versions diff. */
export async function getSchemaVersionsDiff(schemaId: Record<string, unknown>, firstSchemaVersionNumber: Record<string, unknown>, secondSchemaVersionNumber: Record<string, unknown>, schemaDiffType: string, regionName?: string | undefined): Promise<GetSchemaVersionsDiffResult> {
  try {
    // TODO: implement get_schema_versions_diff
    throw new Error("get_schema_versions_diff not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_schema_versions_diff failed");
  }
}

/** Get security configuration. */
export async function getSecurityConfiguration(name: string, regionName?: string | undefined): Promise<GetSecurityConfigurationResult> {
  try {
    // TODO: implement get_security_configuration
    throw new Error("get_security_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_security_configuration failed");
  }
}

/** Get security configurations. */
export async function getSecurityConfigurations(): Promise<GetSecurityConfigurationsResult> {
  try {
    // TODO: implement get_security_configurations
    throw new Error("get_security_configurations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_security_configurations failed");
  }
}

/** Get session. */
export async function getSession(id: string): Promise<GetSessionResult> {
  try {
    // TODO: implement get_session
    throw new Error("get_session not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_session failed");
  }
}

/** Get statement. */
export async function getStatement(sessionId: string, id: number): Promise<GetStatementResult> {
  try {
    // TODO: implement get_statement
    throw new Error("get_statement not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_statement failed");
  }
}

/** Get table. */
export async function getTable(databaseName: string, name: string): Promise<GetTableResult> {
  try {
    // TODO: implement get_table
    throw new Error("get_table not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_table failed");
  }
}

/** Get table optimizer. */
export async function getTableOptimizer(catalogId: string, databaseName: string, tableName: string, typeValue: string, regionName?: string | undefined): Promise<GetTableOptimizerResult> {
  try {
    // TODO: implement get_table_optimizer
    throw new Error("get_table_optimizer not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_table_optimizer failed");
  }
}

/** Get table version. */
export async function getTableVersion(databaseName: string, tableName: string): Promise<GetTableVersionResult> {
  try {
    // TODO: implement get_table_version
    throw new Error("get_table_version not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_table_version failed");
  }
}

/** Get table versions. */
export async function getTableVersions(databaseName: string, tableName: string): Promise<GetTableVersionsResult> {
  try {
    // TODO: implement get_table_versions
    throw new Error("get_table_versions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_table_versions failed");
  }
}

/** Get tables. */
export async function getTables(databaseName: string): Promise<GetTablesResult> {
  try {
    // TODO: implement get_tables
    throw new Error("get_tables not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_tables failed");
  }
}

/** Get tags. */
export async function getTags(resourceArn: string, regionName?: string | undefined): Promise<GetTagsResult> {
  try {
    // TODO: implement get_tags
    throw new Error("get_tags not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_tags failed");
  }
}

/** Get trigger. */
export async function getTrigger(name: string, regionName?: string | undefined): Promise<GetTriggerResult> {
  try {
    // TODO: implement get_trigger
    throw new Error("get_trigger not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_trigger failed");
  }
}

/** Get triggers. */
export async function getTriggers(): Promise<GetTriggersResult> {
  try {
    // TODO: implement get_triggers
    throw new Error("get_triggers not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_triggers failed");
  }
}

/** Get unfiltered partition metadata. */
export async function getUnfilteredPartitionMetadata(catalogId: string, databaseName: string, tableName: string, partitionValues: string[], supportedPermissionTypes: string[]): Promise<GetUnfilteredPartitionMetadataResult> {
  try {
    // TODO: implement get_unfiltered_partition_metadata
    throw new Error("get_unfiltered_partition_metadata not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_unfiltered_partition_metadata failed");
  }
}

/** Get unfiltered partitions metadata. */
export async function getUnfilteredPartitionsMetadata(catalogId: string, databaseName: string, tableName: string, supportedPermissionTypes: string[]): Promise<GetUnfilteredPartitionsMetadataResult> {
  try {
    // TODO: implement get_unfiltered_partitions_metadata
    throw new Error("get_unfiltered_partitions_metadata not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_unfiltered_partitions_metadata failed");
  }
}

/** Get unfiltered table metadata. */
export async function getUnfilteredTableMetadata(catalogId: string, databaseName: string, name: string, supportedPermissionTypes: string[]): Promise<GetUnfilteredTableMetadataResult> {
  try {
    // TODO: implement get_unfiltered_table_metadata
    throw new Error("get_unfiltered_table_metadata not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_unfiltered_table_metadata failed");
  }
}

/** Get usage profile. */
export async function getUsageProfile(name: string, regionName?: string | undefined): Promise<GetUsageProfileResult> {
  try {
    // TODO: implement get_usage_profile
    throw new Error("get_usage_profile not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_usage_profile failed");
  }
}

/** Get user defined function. */
export async function getUserDefinedFunction(databaseName: string, functionName: string): Promise<GetUserDefinedFunctionResult> {
  try {
    // TODO: implement get_user_defined_function
    throw new Error("get_user_defined_function not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_user_defined_function failed");
  }
}

/** Get user defined functions. */
export async function getUserDefinedFunctions(pattern: string): Promise<GetUserDefinedFunctionsResult> {
  try {
    // TODO: implement get_user_defined_functions
    throw new Error("get_user_defined_functions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_user_defined_functions failed");
  }
}

/** Get workflow. */
export async function getWorkflow(name: string): Promise<GetWorkflowResult> {
  try {
    // TODO: implement get_workflow
    throw new Error("get_workflow not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_workflow failed");
  }
}

/** Get workflow run. */
export async function getWorkflowRun(name: string, runId: string): Promise<GetWorkflowRunResult> {
  try {
    // TODO: implement get_workflow_run
    throw new Error("get_workflow_run not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_workflow_run failed");
  }
}

/** Get workflow run properties. */
export async function getWorkflowRunProperties(name: string, runId: string, regionName?: string | undefined): Promise<GetWorkflowRunPropertiesResult> {
  try {
    // TODO: implement get_workflow_run_properties
    throw new Error("get_workflow_run_properties not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_workflow_run_properties failed");
  }
}

/** Get workflow runs. */
export async function getWorkflowRuns(name: string): Promise<GetWorkflowRunsResult> {
  try {
    // TODO: implement get_workflow_runs
    throw new Error("get_workflow_runs not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_workflow_runs failed");
  }
}

/** Import catalog to glue. */
export async function importCatalogToGlue(): Promise<void> {
  try {
    // TODO: implement import_catalog_to_glue
    throw new Error("import_catalog_to_glue not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "import_catalog_to_glue failed");
  }
}

/** List blueprints. */
export async function listBlueprints(): Promise<ListBlueprintsResult> {
  try {
    // TODO: implement list_blueprints
    throw new Error("list_blueprints not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_blueprints failed");
  }
}

/** List column statistics task runs. */
export async function listColumnStatisticsTaskRuns(): Promise<ListColumnStatisticsTaskRunsResult> {
  try {
    // TODO: implement list_column_statistics_task_runs
    throw new Error("list_column_statistics_task_runs not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_column_statistics_task_runs failed");
  }
}

/** List connection types. */
export async function listConnectionTypes(): Promise<ListConnectionTypesResult> {
  try {
    // TODO: implement list_connection_types
    throw new Error("list_connection_types not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_connection_types failed");
  }
}

/** List crawlers. */
export async function listCrawlers(): Promise<ListCrawlersResult> {
  try {
    // TODO: implement list_crawlers
    throw new Error("list_crawlers not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_crawlers failed");
  }
}

/** List crawls. */
export async function listCrawls(crawlerName: string): Promise<ListCrawlsResult> {
  try {
    // TODO: implement list_crawls
    throw new Error("list_crawls not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_crawls failed");
  }
}

/** List custom entity types. */
export async function listCustomEntityTypes(): Promise<ListCustomEntityTypesResult> {
  try {
    // TODO: implement list_custom_entity_types
    throw new Error("list_custom_entity_types not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_custom_entity_types failed");
  }
}

/** List data quality results. */
export async function listDataQualityResults(): Promise<ListDataQualityResultsResult> {
  try {
    // TODO: implement list_data_quality_results
    throw new Error("list_data_quality_results not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_data_quality_results failed");
  }
}

/** List data quality rule recommendation runs. */
export async function listDataQualityRuleRecommendationRuns(): Promise<ListDataQualityRuleRecommendationRunsResult> {
  try {
    // TODO: implement list_data_quality_rule_recommendation_runs
    throw new Error("list_data_quality_rule_recommendation_runs not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_data_quality_rule_recommendation_runs failed");
  }
}

/** List data quality ruleset evaluation runs. */
export async function listDataQualityRulesetEvaluationRuns(): Promise<ListDataQualityRulesetEvaluationRunsResult> {
  try {
    // TODO: implement list_data_quality_ruleset_evaluation_runs
    throw new Error("list_data_quality_ruleset_evaluation_runs not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_data_quality_ruleset_evaluation_runs failed");
  }
}

/** List data quality rulesets. */
export async function listDataQualityRulesets(): Promise<ListDataQualityRulesetsResult> {
  try {
    // TODO: implement list_data_quality_rulesets
    throw new Error("list_data_quality_rulesets not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_data_quality_rulesets failed");
  }
}

/** List data quality statistic annotations. */
export async function listDataQualityStatisticAnnotations(): Promise<ListDataQualityStatisticAnnotationsResult> {
  try {
    // TODO: implement list_data_quality_statistic_annotations
    throw new Error("list_data_quality_statistic_annotations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_data_quality_statistic_annotations failed");
  }
}

/** List data quality statistics. */
export async function listDataQualityStatistics(): Promise<ListDataQualityStatisticsResult> {
  try {
    // TODO: implement list_data_quality_statistics
    throw new Error("list_data_quality_statistics not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_data_quality_statistics failed");
  }
}

/** List dev endpoints. */
export async function listDevEndpoints(): Promise<ListDevEndpointsResult> {
  try {
    // TODO: implement list_dev_endpoints
    throw new Error("list_dev_endpoints not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_dev_endpoints failed");
  }
}

/** List entities. */
export async function listEntities(): Promise<ListEntitiesResult> {
  try {
    // TODO: implement list_entities
    throw new Error("list_entities not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_entities failed");
  }
}

/** List ml transforms. */
export async function listMlTransforms(): Promise<ListMlTransformsResult> {
  try {
    // TODO: implement list_ml_transforms
    throw new Error("list_ml_transforms not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_ml_transforms failed");
  }
}

/** List registries. */
export async function listRegistries(): Promise<ListRegistriesResult> {
  try {
    // TODO: implement list_registries
    throw new Error("list_registries not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_registries failed");
  }
}

/** List schema versions. */
export async function listSchemaVersions(schemaId: Record<string, unknown>): Promise<ListSchemaVersionsResult> {
  try {
    // TODO: implement list_schema_versions
    throw new Error("list_schema_versions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_schema_versions failed");
  }
}

/** List schemas. */
export async function listSchemas(): Promise<ListSchemasResult> {
  try {
    // TODO: implement list_schemas
    throw new Error("list_schemas not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_schemas failed");
  }
}

/** List sessions. */
export async function listSessions(): Promise<ListSessionsResult> {
  try {
    // TODO: implement list_sessions
    throw new Error("list_sessions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_sessions failed");
  }
}

/** List statements. */
export async function listStatements(sessionId: string): Promise<ListStatementsResult> {
  try {
    // TODO: implement list_statements
    throw new Error("list_statements not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_statements failed");
  }
}

/** List table optimizer runs. */
export async function listTableOptimizerRuns(catalogId: string, databaseName: string, tableName: string, typeValue: string): Promise<ListTableOptimizerRunsResult> {
  try {
    // TODO: implement list_table_optimizer_runs
    throw new Error("list_table_optimizer_runs not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_table_optimizer_runs failed");
  }
}

/** List triggers. */
export async function listTriggers(): Promise<ListTriggersResult> {
  try {
    // TODO: implement list_triggers
    throw new Error("list_triggers not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_triggers failed");
  }
}

/** List usage profiles. */
export async function listUsageProfiles(): Promise<ListUsageProfilesResult> {
  try {
    // TODO: implement list_usage_profiles
    throw new Error("list_usage_profiles not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_usage_profiles failed");
  }
}

/** List workflows. */
export async function listWorkflows(): Promise<ListWorkflowsResult> {
  try {
    // TODO: implement list_workflows
    throw new Error("list_workflows not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_workflows failed");
  }
}

/** Modify integration. */
export async function modifyIntegration(integrationIdentifier: string): Promise<ModifyIntegrationResult> {
  try {
    // TODO: implement modify_integration
    throw new Error("modify_integration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_integration failed");
  }
}

/** Put data catalog encryption settings. */
export async function putDataCatalogEncryptionSettings(dataCatalogEncryptionSettings: Record<string, unknown>): Promise<void> {
  try {
    // TODO: implement put_data_catalog_encryption_settings
    throw new Error("put_data_catalog_encryption_settings not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_data_catalog_encryption_settings failed");
  }
}

/** Put data quality profile annotation. */
export async function putDataQualityProfileAnnotation(profileId: string, inclusionAnnotation: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement put_data_quality_profile_annotation
    throw new Error("put_data_quality_profile_annotation not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_data_quality_profile_annotation failed");
  }
}

/** Put resource policy. */
export async function putResourcePolicy(policyInJson: string): Promise<PutResourcePolicyResult> {
  try {
    // TODO: implement put_resource_policy
    throw new Error("put_resource_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_resource_policy failed");
  }
}

/** Put schema version metadata. */
export async function putSchemaVersionMetadata(metadataKeyValue: Record<string, unknown>): Promise<PutSchemaVersionMetadataResult> {
  try {
    // TODO: implement put_schema_version_metadata
    throw new Error("put_schema_version_metadata not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_schema_version_metadata failed");
  }
}

/** Put workflow run properties. */
export async function putWorkflowRunProperties(name: string, runId: string, runProperties: Record<string, unknown>, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement put_workflow_run_properties
    throw new Error("put_workflow_run_properties not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_workflow_run_properties failed");
  }
}

/** Query schema version metadata. */
export async function querySchemaVersionMetadata(): Promise<QuerySchemaVersionMetadataResult> {
  try {
    // TODO: implement query_schema_version_metadata
    throw new Error("query_schema_version_metadata not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "query_schema_version_metadata failed");
  }
}

/** Register schema version. */
export async function registerSchemaVersion(schemaId: Record<string, unknown>, schemaDefinition: string, regionName?: string | undefined): Promise<RegisterSchemaVersionResult> {
  try {
    // TODO: implement register_schema_version
    throw new Error("register_schema_version not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "register_schema_version failed");
  }
}

/** Remove schema version metadata. */
export async function removeSchemaVersionMetadata(metadataKeyValue: Record<string, unknown>): Promise<RemoveSchemaVersionMetadataResult> {
  try {
    // TODO: implement remove_schema_version_metadata
    throw new Error("remove_schema_version_metadata not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "remove_schema_version_metadata failed");
  }
}

/** Reset job bookmark. */
export async function resetJobBookmark(jobName: string): Promise<ResetJobBookmarkResult> {
  try {
    // TODO: implement reset_job_bookmark
    throw new Error("reset_job_bookmark not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "reset_job_bookmark failed");
  }
}

/** Resume workflow run. */
export async function resumeWorkflowRun(name: string, runId: string, nodeIds: string[], regionName?: string | undefined): Promise<ResumeWorkflowRunResult> {
  try {
    // TODO: implement resume_workflow_run
    throw new Error("resume_workflow_run not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "resume_workflow_run failed");
  }
}

/** Run connection. */
export async function runConnection(): Promise<void> {
  try {
    // TODO: implement run_connection
    throw new Error("run_connection not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "run_connection failed");
  }
}

/** Run statement. */
export async function runStatement(sessionId: string, code: string): Promise<RunStatementResult> {
  try {
    // TODO: implement run_statement
    throw new Error("run_statement not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "run_statement failed");
  }
}

/** Search tables. */
export async function searchTables(): Promise<SearchTablesResult> {
  try {
    // TODO: implement search_tables
    throw new Error("search_tables not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "search_tables failed");
  }
}

/** Start blueprint run. */
export async function startBlueprintRun(blueprintName: string, roleArn: string): Promise<StartBlueprintRunResult> {
  try {
    // TODO: implement start_blueprint_run
    throw new Error("start_blueprint_run not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_blueprint_run failed");
  }
}

/** Start column statistics task run. */
export async function startColumnStatisticsTaskRun(databaseName: string, tableName: string, role: string): Promise<StartColumnStatisticsTaskRunResult> {
  try {
    // TODO: implement start_column_statistics_task_run
    throw new Error("start_column_statistics_task_run not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_column_statistics_task_run failed");
  }
}

/** Start column statistics task run schedule. */
export async function startColumnStatisticsTaskRunSchedule(databaseName: string, tableName: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement start_column_statistics_task_run_schedule
    throw new Error("start_column_statistics_task_run_schedule not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_column_statistics_task_run_schedule failed");
  }
}

/** Start crawler. */
export async function startCrawler(name: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement start_crawler
    throw new Error("start_crawler not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_crawler failed");
  }
}

/** Start crawler schedule. */
export async function startCrawlerSchedule(crawlerName: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement start_crawler_schedule
    throw new Error("start_crawler_schedule not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_crawler_schedule failed");
  }
}

/** Start data quality rule recommendation run. */
export async function startDataQualityRuleRecommendationRun(dataSource: Record<string, unknown>, role: string): Promise<StartDataQualityRuleRecommendationRunResult> {
  try {
    // TODO: implement start_data_quality_rule_recommendation_run
    throw new Error("start_data_quality_rule_recommendation_run not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_data_quality_rule_recommendation_run failed");
  }
}

/** Start data quality ruleset evaluation run. */
export async function startDataQualityRulesetEvaluationRun(dataSource: Record<string, unknown>, role: string, rulesetNames: string[]): Promise<StartDataQualityRulesetEvaluationRunResult> {
  try {
    // TODO: implement start_data_quality_ruleset_evaluation_run
    throw new Error("start_data_quality_ruleset_evaluation_run not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_data_quality_ruleset_evaluation_run failed");
  }
}

/** Start export labels task run. */
export async function startExportLabelsTaskRun(transformId: string, outputS3Path: string, regionName?: string | undefined): Promise<StartExportLabelsTaskRunResult> {
  try {
    // TODO: implement start_export_labels_task_run
    throw new Error("start_export_labels_task_run not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_export_labels_task_run failed");
  }
}

/** Start import labels task run. */
export async function startImportLabelsTaskRun(transformId: string, inputS3Path: string): Promise<StartImportLabelsTaskRunResult> {
  try {
    // TODO: implement start_import_labels_task_run
    throw new Error("start_import_labels_task_run not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_import_labels_task_run failed");
  }
}

/** Start ml evaluation task run. */
export async function startMlEvaluationTaskRun(transformId: string, regionName?: string | undefined): Promise<StartMlEvaluationTaskRunResult> {
  try {
    // TODO: implement start_ml_evaluation_task_run
    throw new Error("start_ml_evaluation_task_run not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_ml_evaluation_task_run failed");
  }
}

/** Start ml labeling set generation task run. */
export async function startMlLabelingSetGenerationTaskRun(transformId: string, outputS3Path: string, regionName?: string | undefined): Promise<StartMlLabelingSetGenerationTaskRunResult> {
  try {
    // TODO: implement start_ml_labeling_set_generation_task_run
    throw new Error("start_ml_labeling_set_generation_task_run not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_ml_labeling_set_generation_task_run failed");
  }
}

/** Start trigger. */
export async function startTrigger(name: string, regionName?: string | undefined): Promise<StartTriggerResult> {
  try {
    // TODO: implement start_trigger
    throw new Error("start_trigger not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_trigger failed");
  }
}

/** Start workflow run. */
export async function startWorkflowRun(name: string): Promise<StartWorkflowRunResult> {
  try {
    // TODO: implement start_workflow_run
    throw new Error("start_workflow_run not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_workflow_run failed");
  }
}

/** Stop column statistics task run. */
export async function stopColumnStatisticsTaskRun(databaseName: string, tableName: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement stop_column_statistics_task_run
    throw new Error("stop_column_statistics_task_run not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "stop_column_statistics_task_run failed");
  }
}

/** Stop column statistics task run schedule. */
export async function stopColumnStatisticsTaskRunSchedule(databaseName: string, tableName: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement stop_column_statistics_task_run_schedule
    throw new Error("stop_column_statistics_task_run_schedule not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "stop_column_statistics_task_run_schedule failed");
  }
}

/** Stop crawler. */
export async function stopCrawler(name: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement stop_crawler
    throw new Error("stop_crawler not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "stop_crawler failed");
  }
}

/** Stop crawler schedule. */
export async function stopCrawlerSchedule(crawlerName: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement stop_crawler_schedule
    throw new Error("stop_crawler_schedule not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "stop_crawler_schedule failed");
  }
}

/** Stop session. */
export async function stopSession(id: string): Promise<StopSessionResult> {
  try {
    // TODO: implement stop_session
    throw new Error("stop_session not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "stop_session failed");
  }
}

/** Stop trigger. */
export async function stopTrigger(name: string, regionName?: string | undefined): Promise<StopTriggerResult> {
  try {
    // TODO: implement stop_trigger
    throw new Error("stop_trigger not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "stop_trigger failed");
  }
}

/** Stop workflow run. */
export async function stopWorkflowRun(name: string, runId: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement stop_workflow_run
    throw new Error("stop_workflow_run not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "stop_workflow_run failed");
  }
}

/** Tag resource. */
export async function tagResource(resourceArn: string, tagsToAdd: Record<string, unknown>, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement tag_resource
    throw new Error("tag_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "tag_resource failed");
  }
}

/** Untag resource. */
export async function untagResource(resourceArn: string, tagsToRemove: string[], regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement untag_resource
    throw new Error("untag_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "untag_resource failed");
  }
}

/** Update blueprint. */
export async function updateBlueprint(name: string, blueprintLocation: string): Promise<UpdateBlueprintResult> {
  try {
    // TODO: implement update_blueprint
    throw new Error("update_blueprint not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_blueprint failed");
  }
}

/** Update catalog. */
export async function updateCatalog(catalogId: string, catalogInput: Record<string, unknown>, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement update_catalog
    throw new Error("update_catalog not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_catalog failed");
  }
}

/** Update classifier. */
export async function updateClassifier(): Promise<void> {
  try {
    // TODO: implement update_classifier
    throw new Error("update_classifier not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_classifier failed");
  }
}

/** Update column statistics for partition. */
export async function updateColumnStatisticsForPartition(databaseName: string, tableName: string, partitionValues: string[], columnStatisticsList: Record<string, unknown>[]): Promise<UpdateColumnStatisticsForPartitionResult> {
  try {
    // TODO: implement update_column_statistics_for_partition
    throw new Error("update_column_statistics_for_partition not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_column_statistics_for_partition failed");
  }
}

/** Update column statistics for table. */
export async function updateColumnStatisticsForTable(databaseName: string, tableName: string, columnStatisticsList: Record<string, unknown>[]): Promise<UpdateColumnStatisticsForTableResult> {
  try {
    // TODO: implement update_column_statistics_for_table
    throw new Error("update_column_statistics_for_table not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_column_statistics_for_table failed");
  }
}

/** Update column statistics task settings. */
export async function updateColumnStatisticsTaskSettings(databaseName: string, tableName: string): Promise<void> {
  try {
    // TODO: implement update_column_statistics_task_settings
    throw new Error("update_column_statistics_task_settings not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_column_statistics_task_settings failed");
  }
}

/** Update connection. */
export async function updateConnection(name: string, connectionInput: Record<string, unknown>): Promise<void> {
  try {
    // TODO: implement update_connection
    throw new Error("update_connection not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_connection failed");
  }
}

/** Update crawler. */
export async function updateCrawler(name: string): Promise<void> {
  try {
    // TODO: implement update_crawler
    throw new Error("update_crawler not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_crawler failed");
  }
}

/** Update crawler schedule. */
export async function updateCrawlerSchedule(crawlerName: string): Promise<void> {
  try {
    // TODO: implement update_crawler_schedule
    throw new Error("update_crawler_schedule not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_crawler_schedule failed");
  }
}

/** Update data quality ruleset. */
export async function updateDataQualityRuleset(name: string): Promise<UpdateDataQualityRulesetResult> {
  try {
    // TODO: implement update_data_quality_ruleset
    throw new Error("update_data_quality_ruleset not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_data_quality_ruleset failed");
  }
}

/** Update database. */
export async function updateDatabase(name: string, databaseInput: Record<string, unknown>): Promise<void> {
  try {
    // TODO: implement update_database
    throw new Error("update_database not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_database failed");
  }
}

/** Update dev endpoint. */
export async function updateDevEndpoint(endpointName: string): Promise<void> {
  try {
    // TODO: implement update_dev_endpoint
    throw new Error("update_dev_endpoint not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_dev_endpoint failed");
  }
}

/** Update glue identity center configuration. */
export async function updateGlueIdentityCenterConfiguration(): Promise<void> {
  try {
    // TODO: implement update_glue_identity_center_configuration
    throw new Error("update_glue_identity_center_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_glue_identity_center_configuration failed");
  }
}

/** Update integration resource property. */
export async function updateIntegrationResourceProperty(resourceArn: string): Promise<UpdateIntegrationResourcePropertyResult> {
  try {
    // TODO: implement update_integration_resource_property
    throw new Error("update_integration_resource_property not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_integration_resource_property failed");
  }
}

/** Update integration table properties. */
export async function updateIntegrationTableProperties(resourceArn: string, tableName: string): Promise<void> {
  try {
    // TODO: implement update_integration_table_properties
    throw new Error("update_integration_table_properties not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_integration_table_properties failed");
  }
}

/** Update job. */
export async function updateJob(jobName: string, jobUpdate: Record<string, unknown>, regionName?: string | undefined): Promise<UpdateJobResult> {
  try {
    // TODO: implement update_job
    throw new Error("update_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_job failed");
  }
}

/** Update job from source control. */
export async function updateJobFromSourceControl(): Promise<UpdateJobFromSourceControlResult> {
  try {
    // TODO: implement update_job_from_source_control
    throw new Error("update_job_from_source_control not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_job_from_source_control failed");
  }
}

/** Update ml transform. */
export async function updateMlTransform(transformId: string): Promise<UpdateMlTransformResult> {
  try {
    // TODO: implement update_ml_transform
    throw new Error("update_ml_transform not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_ml_transform failed");
  }
}

/** Update partition. */
export async function updatePartition(databaseName: string, tableName: string, partitionValueList: string[], partitionInput: Record<string, unknown>): Promise<void> {
  try {
    // TODO: implement update_partition
    throw new Error("update_partition not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_partition failed");
  }
}

/** Update registry. */
export async function updateRegistry(registryId: Record<string, unknown>, description: string, regionName?: string | undefined): Promise<UpdateRegistryResult> {
  try {
    // TODO: implement update_registry
    throw new Error("update_registry not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_registry failed");
  }
}

/** Update schema. */
export async function updateSchema(schemaId: Record<string, unknown>): Promise<UpdateSchemaResult> {
  try {
    // TODO: implement update_schema
    throw new Error("update_schema not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_schema failed");
  }
}

/** Update source control from job. */
export async function updateSourceControlFromJob(): Promise<UpdateSourceControlFromJobResult> {
  try {
    // TODO: implement update_source_control_from_job
    throw new Error("update_source_control_from_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_source_control_from_job failed");
  }
}

/** Update table. */
export async function updateTable(databaseName: string): Promise<void> {
  try {
    // TODO: implement update_table
    throw new Error("update_table not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_table failed");
  }
}

/** Update table optimizer. */
export async function updateTableOptimizer(catalogId: string, databaseName: string, tableName: string, typeValue: string, tableOptimizerConfiguration: Record<string, unknown>, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement update_table_optimizer
    throw new Error("update_table_optimizer not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_table_optimizer failed");
  }
}

/** Update trigger. */
export async function updateTrigger(name: string, triggerUpdate: Record<string, unknown>, regionName?: string | undefined): Promise<UpdateTriggerResult> {
  try {
    // TODO: implement update_trigger
    throw new Error("update_trigger not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_trigger failed");
  }
}

/** Update usage profile. */
export async function updateUsageProfile(name: string, configuration: Record<string, unknown>): Promise<UpdateUsageProfileResult> {
  try {
    // TODO: implement update_usage_profile
    throw new Error("update_usage_profile not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_usage_profile failed");
  }
}

/** Update user defined function. */
export async function updateUserDefinedFunction(databaseName: string, functionName: string, functionInput: Record<string, unknown>): Promise<void> {
  try {
    // TODO: implement update_user_defined_function
    throw new Error("update_user_defined_function not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_user_defined_function failed");
  }
}

/** Update workflow. */
export async function updateWorkflow(name: string): Promise<UpdateWorkflowResult> {
  try {
    // TODO: implement update_workflow
    throw new Error("update_workflow not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_workflow failed");
  }
}
