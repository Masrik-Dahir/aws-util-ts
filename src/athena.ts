/**
 * aws-util/athena — High-level Amazon Athena query utilities.
 *
 * Provides typed helpers for starting, polling, and retrieving Athena query
 * results, plus convenience wrappers for running complete queries, DDL
 * statements, and schema inspection.
 *
 * All functions obtain an AthenaClient via {@link getClient} and wrap errors
 * through {@link wrapAwsError}.
 *
 * @example
 * ```ts
 * import { runQuery, getTableSchema } from "./athena.js";
 *
 * const rows = await runQuery(
 *   "SELECT * FROM my_table LIMIT 10",
 *   "my_database",
 *   "s3://my-bucket/athena-results/",
 * );
 * console.log(rows);
 *
 * const schema = await getTableSchema("my_database", "my_table");
 * console.log(schema);
 * ```
 *
 * @module
 */

import { z } from "zod";
import {
  AthenaClient,
  StartQueryExecutionCommand,
  GetQueryExecutionCommand,
  GetQueryResultsCommand,
  StopQueryExecutionCommand,
} from "@aws-sdk/client-athena";
import { getClient } from "./client.js";
import {
  wrapAwsError,
  AwsTimeoutError,
  AwsServiceError,
} from "./exceptions.js";

// ---------------------------------------------------------------------------
// Zod schemas & inferred types
// ---------------------------------------------------------------------------

/** Schema for Athena query execution statistics. */
const AthenaStatisticsSchema = z.object({
  engineExecutionTimeInMillis: z.number().optional(),
  dataScannedInBytes: z.number().optional(),
  totalExecutionTimeInMillis: z.number().optional(),
  queryPlanningTimeInMillis: z.number().optional(),
  queryQueueTimeInMillis: z.number().optional(),
  serviceProcessingTimeInMillis: z.number().optional(),
});

/** Schema for Athena result configuration. */
const AthenaResultConfigSchema = z.object({
  outputLocation: z.string().optional(),
});

/** Schema for an Athena query execution. */
export const AthenaExecutionSchema = z.object({
  queryExecutionId: z.string(),
  query: z.string().optional(),
  status: z.string(),
  stateChangeReason: z.string().optional(),
  resultConfiguration: AthenaResultConfigSchema.optional(),
  statistics: AthenaStatisticsSchema.optional(),
});

/** An Athena query execution descriptor. */
export type AthenaExecution = z.infer<typeof AthenaExecutionSchema>;

// ---------------------------------------------------------------------------
// Terminal query states
// ---------------------------------------------------------------------------

/** Query states that indicate a terminal condition. */
const TERMINAL_STATES = new Set(["SUCCEEDED", "FAILED", "CANCELLED"]);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Get a cached AthenaClient for the given region.
 */
function athena(region?: string): AthenaClient {
  return getClient(AthenaClient, region);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Start an Athena query execution.
 *
 * @param query - The SQL query string.
 * @param database - Optional database/catalog context.
 * @param outputLocation - S3 location for query results.
 * @param workGroup - Optional Athena workgroup.
 * @param region - AWS region override.
 * @returns The query execution ID.
 */
export async function startQuery(
  query: string,
  database?: string,
  outputLocation?: string,
  workGroup?: string,
  region?: string,
): Promise<string> {
  try {
    const res = await athena(region).send(
      new StartQueryExecutionCommand({
        QueryString: query,
        QueryExecutionContext: database ? { Database: database } : undefined,
        ResultConfiguration: outputLocation
          ? { OutputLocation: outputLocation }
          : undefined,
        WorkGroup: workGroup,
      }),
    );
    return res.QueryExecutionId!;
  } catch (err: unknown) {
    throw wrapAwsError(err, "startQuery");
  }
}

/**
 * Get the status and details of an Athena query execution.
 *
 * @param queryExecutionId - The query execution ID.
 * @param region - AWS region override.
 * @returns The query execution descriptor.
 */
export async function getQueryExecution(
  queryExecutionId: string,
  region?: string,
): Promise<AthenaExecution> {
  try {
    const res = await athena(region).send(
      new GetQueryExecutionCommand({ QueryExecutionId: queryExecutionId }),
    );
    const qe = res.QueryExecution!;
    return AthenaExecutionSchema.parse({
      queryExecutionId: qe.QueryExecutionId,
      query: qe.Query,
      status: qe.Status?.State ?? "UNKNOWN",
      stateChangeReason: qe.Status?.StateChangeReason,
      resultConfiguration: qe.ResultConfiguration
        ? { outputLocation: qe.ResultConfiguration.OutputLocation }
        : undefined,
      statistics: qe.Statistics
        ? {
            engineExecutionTimeInMillis:
              qe.Statistics.EngineExecutionTimeInMillis,
            dataScannedInBytes: qe.Statistics.DataScannedInBytes,
            totalExecutionTimeInMillis:
              qe.Statistics.TotalExecutionTimeInMillis,
            queryPlanningTimeInMillis:
              qe.Statistics.QueryPlanningTimeInMillis,
            queryQueueTimeInMillis:
              qe.Statistics.QueryQueueTimeInMillis,
            serviceProcessingTimeInMillis:
              qe.Statistics.ServiceProcessingTimeInMillis,
          }
        : undefined,
    });
  } catch (err: unknown) {
    throw wrapAwsError(
      err,
      `getQueryExecution(${queryExecutionId})`,
    );
  }
}

/**
 * Poll an Athena query execution until it reaches a terminal state.
 *
 * Terminal states are SUCCEEDED, FAILED, and CANCELLED.
 *
 * @param queryExecutionId - The query execution ID to monitor.
 * @param timeout - Maximum wait time in milliseconds (default 300 000 = 5 min).
 * @param pollInterval - Delay between polls in milliseconds (default 2 000).
 * @param region - AWS region override.
 * @returns The final query execution state.
 * @throws {AwsTimeoutError} If the query does not complete within the timeout.
 */
export async function waitForQuery(
  queryExecutionId: string,
  timeout?: number,
  pollInterval?: number,
  region?: string,
): Promise<AthenaExecution> {
  const effectiveTimeout = timeout ?? 300_000;
  const effectivePollInterval = pollInterval ?? 2_000;
  const deadline = Date.now() + effectiveTimeout;

  while (Date.now() < deadline) {
    const execution = await getQueryExecution(queryExecutionId, region);
    if (TERMINAL_STATES.has(execution.status)) {
      return execution;
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
    `waitForQuery(${queryExecutionId}) timed out after ${effectiveTimeout}ms`,
  );
}

/**
 * Retrieve query results as an array of key-value objects.
 *
 * Column names from the first result row are used as object keys. Results
 * are auto-paginated through all pages.
 *
 * @param queryExecutionId - The query execution ID.
 * @param maxResults - Maximum results per page (default 1000).
 * @param region - AWS region override.
 * @returns An array of row objects with string values keyed by column name.
 */
export async function getQueryResults(
  queryExecutionId: string,
  maxResults?: number,
  region?: string,
): Promise<Array<Record<string, string>>> {
  const results: Array<Record<string, string>> = [];
  let nextToken: string | undefined;
  let columnNames: string[] | undefined;
  let isFirstPage = true;

  try {
    do {
      const res = await athena(region).send(
        new GetQueryResultsCommand({
          QueryExecutionId: queryExecutionId,
          MaxResults: maxResults ?? 1000,
          NextToken: nextToken,
        }),
      );

      const rows = res.ResultSet?.Rows ?? [];
      const columns = res.ResultSet?.ResultSetMetadata?.ColumnInfo ?? [];

      // Extract column names from metadata on first page
      if (!columnNames) {
        columnNames = columns.map((c) => c.Name ?? `col_${c.Label}`);
      }

      // First row on first page is the header — skip it
      const startIdx = isFirstPage ? 1 : 0;
      isFirstPage = false;

      for (let i = startIdx; i < rows.length; i++) {
        const row = rows[i];
        const record: Record<string, string> = {};
        for (let j = 0; j < (row.Data?.length ?? 0); j++) {
          const colName = columnNames[j] ?? `col_${j}`;
          record[colName] = row.Data![j].VarCharValue ?? "";
        }
        results.push(record);
      }

      nextToken = res.NextToken;
    } while (nextToken);
  } catch (err: unknown) {
    throw wrapAwsError(
      err,
      `getQueryResults(${queryExecutionId})`,
    );
  }

  return results;
}

/**
 * Start an Athena query, wait for completion, and return the parsed results.
 *
 * Combines {@link startQuery}, {@link waitForQuery}, and
 * {@link getQueryResults} into a single convenience call.
 *
 * @param query - The SQL query string.
 * @param database - Optional database/catalog context.
 * @param outputLocation - S3 location for query results.
 * @param workGroup - Optional Athena workgroup.
 * @param timeout - Maximum wait time in milliseconds (default 300 000).
 * @param region - AWS region override.
 * @returns An array of row objects with string values keyed by column name.
 * @throws {AwsServiceError} If the query fails.
 */
export async function runQuery(
  query: string,
  database?: string,
  outputLocation?: string,
  workGroup?: string,
  timeout?: number,
  region?: string,
): Promise<Array<Record<string, string>>> {
  const queryExecutionId = await startQuery(
    query,
    database,
    outputLocation,
    workGroup,
    region,
  );
  const execution = await waitForQuery(
    queryExecutionId,
    timeout,
    undefined,
    region,
  );

  if (execution.status !== "SUCCEEDED") {
    throw new AwsServiceError(
      `runQuery failed with status ${execution.status}: ${execution.stateChangeReason ?? "unknown reason"}`,
    );
  }

  return getQueryResults(queryExecutionId, undefined, region);
}

/**
 * Stop a running Athena query execution.
 *
 * @param queryExecutionId - The query execution ID to cancel.
 * @param region - AWS region override.
 */
export async function stopQuery(
  queryExecutionId: string,
  region?: string,
): Promise<void> {
  try {
    await athena(region).send(
      new StopQueryExecutionCommand({
        QueryExecutionId: queryExecutionId,
      }),
    );
  } catch (err: unknown) {
    throw wrapAwsError(err, `stopQuery(${queryExecutionId})`);
  }
}

/**
 * Get the schema (column names and types) for a table by running
 * `DESCRIBE <table>` via Athena.
 *
 * @param database - The database containing the table.
 * @param tableName - The table name.
 * @param region - AWS region override.
 * @returns An array of column descriptors with name and type.
 */
export async function getTableSchema(
  database: string,
  tableName: string,
  region?: string,
): Promise<Array<{ name: string; type: string }>> {
  const rows = await runQuery(
    `DESCRIBE ${database}.${tableName}`,
    database,
    undefined,
    undefined,
    undefined,
    region,
  );

  const schema: Array<{ name: string; type: string }> = [];
  for (const row of rows) {
    // DESCRIBE output typically has col_name and data_type columns
    const name = row["col_name"] ?? row["name"] ?? "";
    const type = row["data_type"] ?? row["type"] ?? "";
    // Skip empty rows, partition info headers, and comment rows
    if (name && !name.startsWith("#") && type) {
      schema.push({ name: name.trim(), type: type.trim() });
    }
  }

  return schema;
}

/**
 * Run a DDL statement (CREATE TABLE, ALTER TABLE, DROP TABLE, etc.)
 * and wait for it to complete.
 *
 * Unlike {@link runQuery}, this does not attempt to retrieve results.
 *
 * @param statement - The DDL statement.
 * @param database - Optional database/catalog context.
 * @param outputLocation - S3 location for query output metadata.
 * @param workGroup - Optional Athena workgroup.
 * @param region - AWS region override.
 * @throws {AwsServiceError} If the DDL statement fails.
 */
export async function runDdl(
  statement: string,
  database?: string,
  outputLocation?: string,
  workGroup?: string,
  region?: string,
): Promise<void> {
  const queryExecutionId = await startQuery(
    statement,
    database,
    outputLocation,
    workGroup,
    region,
  );
  const execution = await waitForQuery(
    queryExecutionId,
    undefined,
    undefined,
    region,
  );

  if (execution.status !== "SUCCEEDED") {
    throw new AwsServiceError(
      `runDdl failed with status ${execution.status}: ${execution.stateChangeReason ?? "unknown reason"}`,
    );
  }
}

// ---------------------------------------------------------------------------
// Additional types (auto-generated)
// ---------------------------------------------------------------------------

/** Result of batch_get_named_query. */
export type BatchGetNamedQueryResult = {
  namedQueries?: Record<string, unknown>[];
  unprocessedNamedQueryIds?: Record<string, unknown>[];
};

/** Result of batch_get_prepared_statement. */
export type BatchGetPreparedStatementResult = {
  preparedStatements?: Record<string, unknown>[];
  unprocessedPreparedStatementNames?: Record<string, unknown>[];
};

/** Result of batch_get_query_execution. */
export type BatchGetQueryExecutionResult = {
  queryExecutions?: Record<string, unknown>[];
  unprocessedQueryExecutionIds?: Record<string, unknown>[];
};

/** Result of create_data_catalog. */
export type CreateDataCatalogResult = {
  dataCatalog?: Record<string, unknown>;
};

/** Result of create_named_query. */
export type CreateNamedQueryResult = {
  namedQueryId?: string | undefined;
};

/** Result of create_notebook. */
export type CreateNotebookResult = {
  notebookId?: string | undefined;
};

/** Result of create_presigned_notebook_url. */
export type CreatePresignedNotebookUrlResult = {
  notebookUrl?: string | undefined;
  authToken?: string | undefined;
  authTokenExpirationTime?: number | undefined;
};

/** Result of delete_data_catalog. */
export type DeleteDataCatalogResult = {
  dataCatalog?: Record<string, unknown>;
};

/** Result of export_notebook. */
export type ExportNotebookResult = {
  notebookMetadata?: Record<string, unknown>;
  payload?: string | undefined;
};

/** Result of get_calculation_execution. */
export type GetCalculationExecutionResult = {
  calculationExecutionId?: string | undefined;
  sessionId?: string | undefined;
  description?: string | undefined;
  workingDirectory?: string | undefined;
  status?: Record<string, unknown>;
  statistics?: Record<string, unknown>;
  result?: Record<string, unknown>;
};

/** Result of get_calculation_execution_code. */
export type GetCalculationExecutionCodeResult = {
  codeBlock?: string | undefined;
};

/** Result of get_calculation_execution_status. */
export type GetCalculationExecutionStatusResult = {
  status?: Record<string, unknown>;
  statistics?: Record<string, unknown>;
};

/** Result of get_capacity_assignment_configuration. */
export type GetCapacityAssignmentConfigurationResult = {
  capacityAssignmentConfiguration?: Record<string, unknown>;
};

/** Result of get_capacity_reservation. */
export type GetCapacityReservationResult = {
  capacityReservation?: Record<string, unknown>;
};

/** Result of get_data_catalog. */
export type GetDataCatalogResult = {
  dataCatalog?: Record<string, unknown>;
};

/** Result of get_database. */
export type GetDatabaseResult = {
  database?: Record<string, unknown>;
};

/** Result of get_named_query. */
export type GetNamedQueryResult = {
  namedQuery?: Record<string, unknown>;
};

/** Result of get_notebook_metadata. */
export type GetNotebookMetadataResult = {
  notebookMetadata?: Record<string, unknown>;
};

/** Result of get_prepared_statement. */
export type GetPreparedStatementResult = {
  preparedStatement?: Record<string, unknown>;
};

/** Result of get_query_runtime_statistics. */
export type GetQueryRuntimeStatisticsResult = {
  queryRuntimeStatistics?: Record<string, unknown>;
};

/** Result of get_session. */
export type GetSessionResult = {
  sessionId?: string | undefined;
  description?: string | undefined;
  workGroup?: string | undefined;
  engineVersion?: string | undefined;
  engineConfiguration?: Record<string, unknown>;
  notebookVersion?: string | undefined;
  sessionConfiguration?: Record<string, unknown>;
  status?: Record<string, unknown>;
  statistics?: Record<string, unknown>;
};

/** Result of get_session_status. */
export type GetSessionStatusResult = {
  sessionId?: string | undefined;
  status?: Record<string, unknown>;
};

/** Result of get_table_metadata. */
export type GetTableMetadataResult = {
  tableMetadata?: Record<string, unknown>;
};

/** Result of get_work_group. */
export type GetWorkGroupResult = {
  workGroup?: Record<string, unknown>;
};

/** Result of import_notebook. */
export type ImportNotebookResult = {
  notebookId?: string | undefined;
};

/** Result of list_application_dpu_sizes. */
export type ListApplicationDpuSizesResult = {
  applicationDpuSizes?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_calculation_executions. */
export type ListCalculationExecutionsResult = {
  nextToken?: string | undefined;
  calculations?: Record<string, unknown>[];
};

/** Result of list_capacity_reservations. */
export type ListCapacityReservationsResult = {
  nextToken?: string | undefined;
  capacityReservations?: Record<string, unknown>[];
};

/** Result of list_data_catalogs. */
export type ListDataCatalogsResult = {
  dataCatalogsSummary?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_databases. */
export type ListDatabasesResult = {
  databaseList?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_engine_versions. */
export type ListEngineVersionsResult = {
  engineVersions?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_executors. */
export type ListExecutorsResult = {
  sessionId?: string | undefined;
  nextToken?: string | undefined;
  executorsSummary?: Record<string, unknown>[];
};

/** Result of list_named_queries. */
export type ListNamedQueriesResult = {
  namedQueryIds?: string[];
  nextToken?: string | undefined;
};

/** Result of list_notebook_metadata. */
export type ListNotebookMetadataResult = {
  nextToken?: string | undefined;
  notebookMetadataList?: Record<string, unknown>[];
};

/** Result of list_notebook_sessions. */
export type ListNotebookSessionsResult = {
  notebookSessionsList?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_prepared_statements. */
export type ListPreparedStatementsResult = {
  preparedStatements?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_query_executions. */
export type ListQueryExecutionsResult = {
  queryExecutionIds?: string[];
  nextToken?: string | undefined;
};

/** Result of list_sessions. */
export type ListSessionsResult = {
  nextToken?: string | undefined;
  sessions?: Record<string, unknown>[];
};

/** Result of list_table_metadata. */
export type ListTableMetadataResult = {
  tableMetadataList?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_tags_for_resource. */
export type ListTagsForResourceResult = {
  tags?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_work_groups. */
export type ListWorkGroupsResult = {
  workGroups?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of start_calculation_execution. */
export type StartCalculationExecutionResult = {
  calculationExecutionId?: string | undefined;
  state?: string | undefined;
};

/** Result of start_query_execution. */
export type StartQueryExecutionResult = {
  queryExecutionId?: string | undefined;
};

/** Result of start_session. */
export type StartSessionResult = {
  sessionId?: string | undefined;
  state?: string | undefined;
};

/** Result of stop_calculation_execution. */
export type StopCalculationExecutionResult = {
  state?: string | undefined;
};

/** Result of terminate_session. */
export type TerminateSessionResult = {
  state?: string | undefined;
};


// ---------------------------------------------------------------------------
// Additional functions (auto-generated)
// ---------------------------------------------------------------------------

/** Batch get named query. */
export async function batchGetNamedQuery(namedQueryIds: string[], regionName?: string | undefined): Promise<BatchGetNamedQueryResult> {
  try {
    // TODO: implement batch_get_named_query
    throw new Error("batch_get_named_query not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_get_named_query failed");
  }
}

/** Batch get prepared statement. */
export async function batchGetPreparedStatement(preparedStatementNames: string[], workGroup: string, regionName?: string | undefined): Promise<BatchGetPreparedStatementResult> {
  try {
    // TODO: implement batch_get_prepared_statement
    throw new Error("batch_get_prepared_statement not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_get_prepared_statement failed");
  }
}

/** Batch get query execution. */
export async function batchGetQueryExecution(queryExecutionIds: string[], regionName?: string | undefined): Promise<BatchGetQueryExecutionResult> {
  try {
    // TODO: implement batch_get_query_execution
    throw new Error("batch_get_query_execution not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_get_query_execution failed");
  }
}

/** Cancel capacity reservation. */
export async function cancelCapacityReservation(name: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement cancel_capacity_reservation
    throw new Error("cancel_capacity_reservation not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "cancel_capacity_reservation failed");
  }
}

/** Create capacity reservation. */
export async function createCapacityReservation(targetDpus: number, name: string): Promise<void> {
  try {
    // TODO: implement create_capacity_reservation
    throw new Error("create_capacity_reservation not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_capacity_reservation failed");
  }
}

/** Create data catalog. */
export async function createDataCatalog(name: string, typeValue: string): Promise<CreateDataCatalogResult> {
  try {
    // TODO: implement create_data_catalog
    throw new Error("create_data_catalog not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_data_catalog failed");
  }
}

/** Create named query. */
export async function createNamedQuery(name: string, database: string, queryString: string): Promise<CreateNamedQueryResult> {
  try {
    // TODO: implement create_named_query
    throw new Error("create_named_query not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_named_query failed");
  }
}

/** Create notebook. */
export async function createNotebook(workGroup: string, name: string): Promise<CreateNotebookResult> {
  try {
    // TODO: implement create_notebook
    throw new Error("create_notebook not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_notebook failed");
  }
}

/** Create prepared statement. */
export async function createPreparedStatement(statementName: string, workGroup: string, queryStatement: string): Promise<void> {
  try {
    // TODO: implement create_prepared_statement
    throw new Error("create_prepared_statement not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_prepared_statement failed");
  }
}

/** Create presigned notebook url. */
export async function createPresignedNotebookUrl(sessionId: string, regionName?: string | undefined): Promise<CreatePresignedNotebookUrlResult> {
  try {
    // TODO: implement create_presigned_notebook_url
    throw new Error("create_presigned_notebook_url not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_presigned_notebook_url failed");
  }
}

/** Create work group. */
export async function createWorkGroup(name: string): Promise<void> {
  try {
    // TODO: implement create_work_group
    throw new Error("create_work_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_work_group failed");
  }
}

/** Delete capacity reservation. */
export async function deleteCapacityReservation(name: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_capacity_reservation
    throw new Error("delete_capacity_reservation not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_capacity_reservation failed");
  }
}

/** Delete data catalog. */
export async function deleteDataCatalog(name: string): Promise<DeleteDataCatalogResult> {
  try {
    // TODO: implement delete_data_catalog
    throw new Error("delete_data_catalog not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_data_catalog failed");
  }
}

/** Delete named query. */
export async function deleteNamedQuery(namedQueryId: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_named_query
    throw new Error("delete_named_query not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_named_query failed");
  }
}

/** Delete notebook. */
export async function deleteNotebook(notebookId: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_notebook
    throw new Error("delete_notebook not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_notebook failed");
  }
}

/** Delete prepared statement. */
export async function deletePreparedStatement(statementName: string, workGroup: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_prepared_statement
    throw new Error("delete_prepared_statement not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_prepared_statement failed");
  }
}

/** Delete work group. */
export async function deleteWorkGroup(workGroup: string): Promise<void> {
  try {
    // TODO: implement delete_work_group
    throw new Error("delete_work_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_work_group failed");
  }
}

/** Export notebook. */
export async function exportNotebook(notebookId: string, regionName?: string | undefined): Promise<ExportNotebookResult> {
  try {
    // TODO: implement export_notebook
    throw new Error("export_notebook not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "export_notebook failed");
  }
}

/** Get calculation execution. */
export async function getCalculationExecution(calculationExecutionId: string, regionName?: string | undefined): Promise<GetCalculationExecutionResult> {
  try {
    // TODO: implement get_calculation_execution
    throw new Error("get_calculation_execution not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_calculation_execution failed");
  }
}

/** Get calculation execution code. */
export async function getCalculationExecutionCode(calculationExecutionId: string, regionName?: string | undefined): Promise<GetCalculationExecutionCodeResult> {
  try {
    // TODO: implement get_calculation_execution_code
    throw new Error("get_calculation_execution_code not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_calculation_execution_code failed");
  }
}

/** Get calculation execution status. */
export async function getCalculationExecutionStatus(calculationExecutionId: string, regionName?: string | undefined): Promise<GetCalculationExecutionStatusResult> {
  try {
    // TODO: implement get_calculation_execution_status
    throw new Error("get_calculation_execution_status not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_calculation_execution_status failed");
  }
}

/** Get capacity assignment configuration. */
export async function getCapacityAssignmentConfiguration(capacityReservationName: string, regionName?: string | undefined): Promise<GetCapacityAssignmentConfigurationResult> {
  try {
    // TODO: implement get_capacity_assignment_configuration
    throw new Error("get_capacity_assignment_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_capacity_assignment_configuration failed");
  }
}

/** Get capacity reservation. */
export async function getCapacityReservation(name: string, regionName?: string | undefined): Promise<GetCapacityReservationResult> {
  try {
    // TODO: implement get_capacity_reservation
    throw new Error("get_capacity_reservation not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_capacity_reservation failed");
  }
}

/** Get data catalog. */
export async function getDataCatalog(name: string): Promise<GetDataCatalogResult> {
  try {
    // TODO: implement get_data_catalog
    throw new Error("get_data_catalog not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_data_catalog failed");
  }
}

/** Get database. */
export async function getDatabase(catalogName: string, databaseName: string): Promise<GetDatabaseResult> {
  try {
    // TODO: implement get_database
    throw new Error("get_database not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_database failed");
  }
}

/** Get named query. */
export async function getNamedQuery(namedQueryId: string, regionName?: string | undefined): Promise<GetNamedQueryResult> {
  try {
    // TODO: implement get_named_query
    throw new Error("get_named_query not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_named_query failed");
  }
}

/** Get notebook metadata. */
export async function getNotebookMetadata(notebookId: string, regionName?: string | undefined): Promise<GetNotebookMetadataResult> {
  try {
    // TODO: implement get_notebook_metadata
    throw new Error("get_notebook_metadata not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_notebook_metadata failed");
  }
}

/** Get prepared statement. */
export async function getPreparedStatement(statementName: string, workGroup: string, regionName?: string | undefined): Promise<GetPreparedStatementResult> {
  try {
    // TODO: implement get_prepared_statement
    throw new Error("get_prepared_statement not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_prepared_statement failed");
  }
}

/** Get query runtime statistics. */
export async function getQueryRuntimeStatistics(queryExecutionId: string, regionName?: string | undefined): Promise<GetQueryRuntimeStatisticsResult> {
  try {
    // TODO: implement get_query_runtime_statistics
    throw new Error("get_query_runtime_statistics not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_query_runtime_statistics failed");
  }
}

/** Get session. */
export async function getSession(sessionId: string, regionName?: string | undefined): Promise<GetSessionResult> {
  try {
    // TODO: implement get_session
    throw new Error("get_session not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_session failed");
  }
}

/** Get session status. */
export async function getSessionStatus(sessionId: string, regionName?: string | undefined): Promise<GetSessionStatusResult> {
  try {
    // TODO: implement get_session_status
    throw new Error("get_session_status not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_session_status failed");
  }
}

/** Get table metadata. */
export async function getTableMetadata(catalogName: string, databaseName: string, tableName: string): Promise<GetTableMetadataResult> {
  try {
    // TODO: implement get_table_metadata
    throw new Error("get_table_metadata not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_table_metadata failed");
  }
}

/** Get work group. */
export async function getWorkGroup(workGroup: string, regionName?: string | undefined): Promise<GetWorkGroupResult> {
  try {
    // TODO: implement get_work_group
    throw new Error("get_work_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_work_group failed");
  }
}

/** Import notebook. */
export async function importNotebook(workGroup: string, name: string, typeValue: string): Promise<ImportNotebookResult> {
  try {
    // TODO: implement import_notebook
    throw new Error("import_notebook not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "import_notebook failed");
  }
}

/** List application dpu sizes. */
export async function listApplicationDpuSizes(): Promise<ListApplicationDpuSizesResult> {
  try {
    // TODO: implement list_application_dpu_sizes
    throw new Error("list_application_dpu_sizes not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_application_dpu_sizes failed");
  }
}

/** List calculation executions. */
export async function listCalculationExecutions(sessionId: string): Promise<ListCalculationExecutionsResult> {
  try {
    // TODO: implement list_calculation_executions
    throw new Error("list_calculation_executions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_calculation_executions failed");
  }
}

/** List capacity reservations. */
export async function listCapacityReservations(): Promise<ListCapacityReservationsResult> {
  try {
    // TODO: implement list_capacity_reservations
    throw new Error("list_capacity_reservations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_capacity_reservations failed");
  }
}

/** List data catalogs. */
export async function listDataCatalogs(): Promise<ListDataCatalogsResult> {
  try {
    // TODO: implement list_data_catalogs
    throw new Error("list_data_catalogs not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_data_catalogs failed");
  }
}

/** List databases. */
export async function listDatabases(catalogName: string): Promise<ListDatabasesResult> {
  try {
    // TODO: implement list_databases
    throw new Error("list_databases not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_databases failed");
  }
}

/** List engine versions. */
export async function listEngineVersions(): Promise<ListEngineVersionsResult> {
  try {
    // TODO: implement list_engine_versions
    throw new Error("list_engine_versions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_engine_versions failed");
  }
}

/** List executors. */
export async function listExecutors(sessionId: string): Promise<ListExecutorsResult> {
  try {
    // TODO: implement list_executors
    throw new Error("list_executors not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_executors failed");
  }
}

/** List named queries. */
export async function listNamedQueries(): Promise<ListNamedQueriesResult> {
  try {
    // TODO: implement list_named_queries
    throw new Error("list_named_queries not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_named_queries failed");
  }
}

/** List notebook metadata. */
export async function listNotebookMetadata(workGroup: string): Promise<ListNotebookMetadataResult> {
  try {
    // TODO: implement list_notebook_metadata
    throw new Error("list_notebook_metadata not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_notebook_metadata failed");
  }
}

/** List notebook sessions. */
export async function listNotebookSessions(notebookId: string): Promise<ListNotebookSessionsResult> {
  try {
    // TODO: implement list_notebook_sessions
    throw new Error("list_notebook_sessions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_notebook_sessions failed");
  }
}

/** List prepared statements. */
export async function listPreparedStatements(workGroup: string): Promise<ListPreparedStatementsResult> {
  try {
    // TODO: implement list_prepared_statements
    throw new Error("list_prepared_statements not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_prepared_statements failed");
  }
}

/** List query executions. */
export async function listQueryExecutions(): Promise<ListQueryExecutionsResult> {
  try {
    // TODO: implement list_query_executions
    throw new Error("list_query_executions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_query_executions failed");
  }
}

/** List sessions. */
export async function listSessions(workGroup: string): Promise<ListSessionsResult> {
  try {
    // TODO: implement list_sessions
    throw new Error("list_sessions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_sessions failed");
  }
}

/** List table metadata. */
export async function listTableMetadata(catalogName: string, databaseName: string): Promise<ListTableMetadataResult> {
  try {
    // TODO: implement list_table_metadata
    throw new Error("list_table_metadata not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_table_metadata failed");
  }
}

/** List tags for resource. */
export async function listTagsForResource(resourceArn: string): Promise<ListTagsForResourceResult> {
  try {
    // TODO: implement list_tags_for_resource
    throw new Error("list_tags_for_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_tags_for_resource failed");
  }
}

/** List work groups. */
export async function listWorkGroups(): Promise<ListWorkGroupsResult> {
  try {
    // TODO: implement list_work_groups
    throw new Error("list_work_groups not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_work_groups failed");
  }
}

/** Put capacity assignment configuration. */
export async function putCapacityAssignmentConfiguration(capacityReservationName: string, capacityAssignments: Record<string, unknown>[], regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement put_capacity_assignment_configuration
    throw new Error("put_capacity_assignment_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_capacity_assignment_configuration failed");
  }
}

/** Start calculation execution. */
export async function startCalculationExecution(sessionId: string): Promise<StartCalculationExecutionResult> {
  try {
    // TODO: implement start_calculation_execution
    throw new Error("start_calculation_execution not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_calculation_execution failed");
  }
}

/** Start query execution. */
export async function startQueryExecution(queryString: string): Promise<StartQueryExecutionResult> {
  try {
    // TODO: implement start_query_execution
    throw new Error("start_query_execution not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_query_execution failed");
  }
}

/** Start session. */
export async function startSession(workGroup: string, engineConfiguration: Record<string, unknown>): Promise<StartSessionResult> {
  try {
    // TODO: implement start_session
    throw new Error("start_session not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_session failed");
  }
}

/** Stop calculation execution. */
export async function stopCalculationExecution(calculationExecutionId: string, regionName?: string | undefined): Promise<StopCalculationExecutionResult> {
  try {
    // TODO: implement stop_calculation_execution
    throw new Error("stop_calculation_execution not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "stop_calculation_execution failed");
  }
}

/** Stop query execution. */
export async function stopQueryExecution(queryExecutionId: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement stop_query_execution
    throw new Error("stop_query_execution not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "stop_query_execution failed");
  }
}

/** Tag resource. */
export async function tagResource(resourceArn: string, tags: Record<string, unknown>[], regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement tag_resource
    throw new Error("tag_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "tag_resource failed");
  }
}

/** Terminate session. */
export async function terminateSession(sessionId: string, regionName?: string | undefined): Promise<TerminateSessionResult> {
  try {
    // TODO: implement terminate_session
    throw new Error("terminate_session not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "terminate_session failed");
  }
}

/** Untag resource. */
export async function untagResource(resourceArn: string, tagKeys: string[], regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement untag_resource
    throw new Error("untag_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "untag_resource failed");
  }
}

/** Update capacity reservation. */
export async function updateCapacityReservation(targetDpus: number, name: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement update_capacity_reservation
    throw new Error("update_capacity_reservation not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_capacity_reservation failed");
  }
}

/** Update data catalog. */
export async function updateDataCatalog(name: string, typeValue: string): Promise<void> {
  try {
    // TODO: implement update_data_catalog
    throw new Error("update_data_catalog not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_data_catalog failed");
  }
}

/** Update named query. */
export async function updateNamedQuery(namedQueryId: string, name: string, queryString: string): Promise<void> {
  try {
    // TODO: implement update_named_query
    throw new Error("update_named_query not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_named_query failed");
  }
}

/** Update notebook. */
export async function updateNotebook(notebookId: string, payload: string, typeValue: string): Promise<void> {
  try {
    // TODO: implement update_notebook
    throw new Error("update_notebook not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_notebook failed");
  }
}

/** Update notebook metadata. */
export async function updateNotebookMetadata(notebookId: string, name: string): Promise<void> {
  try {
    // TODO: implement update_notebook_metadata
    throw new Error("update_notebook_metadata not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_notebook_metadata failed");
  }
}

/** Update prepared statement. */
export async function updatePreparedStatement(statementName: string, workGroup: string, queryStatement: string): Promise<void> {
  try {
    // TODO: implement update_prepared_statement
    throw new Error("update_prepared_statement not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_prepared_statement failed");
  }
}

/** Update work group. */
export async function updateWorkGroup(workGroup: string): Promise<void> {
  try {
    // TODO: implement update_work_group
    throw new Error("update_work_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_work_group failed");
  }
}
