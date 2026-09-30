/**
 * aws-util/data-lake — Data lake schema evolution, access management,
 * and quality auditing.
 *
 * Multi-service module combining Glue + Lake Formation + Athena + S3 +
 * DynamoDB + CloudWatch + SNS to provide schema evolution management,
 * Lake Formation permission grants, and data quality pipeline checks.
 *
 * All functions obtain clients via {@link getClient} and wrap errors
 * through {@link wrapAwsError}.
 *
 * @example
 * ```ts
 * import {
 *   schemaEvolutionManager,
 *   lakeFormationAccessManager,
 *   dataQualityPipeline,
 * } from "./data-lake.js";
 *
 * const evolution = await schemaEvolutionManager("my_db", "my_table", [
 *   { name: "new_col", type: "string" },
 * ]);
 * ```
 *
 * @module
 */

import { z } from "zod";
import {
  GlueClient,
  GetTableCommand,
  UpdateTableCommand,
} from "@aws-sdk/client-glue";
import {
  LakeFormationClient,
  GrantPermissionsCommand,
  RevokePermissionsCommand,
} from "@aws-sdk/client-lakeformation";
import {
  AthenaClient,
  StartQueryExecutionCommand,
  GetQueryExecutionCommand,
  GetQueryResultsCommand,
} from "@aws-sdk/client-athena";
import {
  SNSClient,
  PublishCommand,
} from "@aws-sdk/client-sns";
import { getClient } from "./client.js";
import {
  wrapAwsError,
  AwsTimeoutError,
} from "./exceptions.js";

// ---------------------------------------------------------------------------
// Zod schemas & inferred types
// ---------------------------------------------------------------------------

/** Schema for a single schema change. */
export const SchemaChangeSchema = z.object({
  columnName: z.string(),
  changeType: z.enum(["added", "removed", "modified"]),
  oldType: z.string().optional(),
  newType: z.string().optional(),
});

/** A single schema change descriptor. */
export type SchemaChange = z.infer<typeof SchemaChangeSchema>;

/** Schema for schema evolution results. */
export const SchemaEvolutionResultSchema = z.object({
  database: z.string(),
  table: z.string(),
  changes: z.array(SchemaChangeSchema),
  applied: z.boolean(),
});

/** Result of a schema evolution operation. */
export type SchemaEvolutionResult = z.infer<
  typeof SchemaEvolutionResultSchema
>;

/** Schema for Lake Formation access results. */
export const LakeFormationAccessResultSchema = z.object({
  database: z.string(),
  principal: z.string(),
  permissions: z.array(z.string()),
  granted: z.boolean(),
});

/** Result of a Lake Formation access management operation. */
export type LakeFormationAccessResult = z.infer<
  typeof LakeFormationAccessResultSchema
>;

/** Schema for a single audit finding. */
export const AuditFindingSchema = z.object({
  resource: z.string(),
  finding: z.string(),
  severity: z.enum(["low", "medium", "high"]),
});

/** A single data quality audit finding. */
export type AuditFinding = z.infer<typeof AuditFindingSchema>;

/** Schema for data quality pipeline results. */
export const DataQualityResultSchema = z.object({
  database: z.string(),
  table: z.string(),
  findings: z.array(AuditFindingSchema),
  passRate: z.number(),
});

/** Result of a data quality pipeline run. */
export type DataQualityResult = z.infer<
  typeof DataQualityResultSchema
>;

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Default Athena output location when none is provided by the caller. */
const DEFAULT_ATHENA_OUTPUT = "s3://aws-athena-query-results/";

/**
 * Poll an Athena query until it completes and return the results.
 */
async function waitForAthenaQuery(
  athena: AthenaClient,
  queryExecutionId: string,
  timeoutMs: number = 300_000,
): Promise<string[][]> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const execResp = await athena.send(
      new GetQueryExecutionCommand({
        QueryExecutionId: queryExecutionId,
      }),
    );
    const state =
      execResp.QueryExecution?.Status?.State ?? "UNKNOWN";

    if (state === "SUCCEEDED") {
      const resultResp = await athena.send(
        new GetQueryResultsCommand({
          QueryExecutionId: queryExecutionId,
        }),
      );
      return (resultResp.ResultSet?.Rows ?? []).map(
        (row) =>
          (row.Data ?? []).map((d) => d.VarCharValue ?? ""),
      );
    }
    if (state === "FAILED" || state === "CANCELLED") {
      throw new Error(
        `Athena query ${queryExecutionId} ${state}: ${execResp.QueryExecution?.Status?.StateChangeReason ?? "unknown reason"}`,
      );
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new AwsTimeoutError(
    `Athena query ${queryExecutionId} timed out after ${timeoutMs}ms`,
  );
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Manage schema evolution for a Glue catalog table.
 *
 * Retrieves the current table schema from the Glue Data Catalog, applies
 * column additions, removals, and type modifications, then updates the
 * table definition.
 *
 * @param database - Glue catalog database name.
 * @param table - Glue catalog table name.
 * @param newColumns - Columns to add with name and type.
 * @param removeColumns - Column names to remove.
 * @param region - AWS region. Defaults to SDK default.
 * @returns Evolution result with applied changes.
 *
 * @example
 * ```ts
 * const result = await schemaEvolutionManager("analytics", "events", [
 *   { name: "user_agent", type: "string" },
 * ], ["legacy_field"]);
 * ```
 */
export async function schemaEvolutionManager(
  database: string,
  table: string,
  newColumns?: Array<{ name: string; type: string }>,
  removeColumns?: string[],
  region?: string,
): Promise<SchemaEvolutionResult> {
  try {
    const glue = getClient(GlueClient, region);

    // Get current table definition
    const getResp = await glue.send(
      new GetTableCommand({
        DatabaseName: database,
        Name: table,
      }),
    );

    const tableData = getResp.Table;
    if (!tableData) {
      throw new Error(
        `Table ${database}.${table} not found`,
      );
    }

    const currentColumns =
      tableData.StorageDescriptor?.Columns ?? [];
    const changes: SchemaChange[] = [];

    // Track columns for update
    let updatedColumns = [...currentColumns];

    // Remove columns
    const removeSet = new Set(removeColumns ?? []);
    if (removeSet.size > 0) {
      updatedColumns = updatedColumns.filter((col) => {
        if (col.Name && removeSet.has(col.Name)) {
          changes.push({
            columnName: col.Name,
            changeType: "removed",
            oldType: col.Type ?? undefined,
          });
          return false;
        }
        return true;
      });
    }

    // Add new columns
    for (const col of newColumns ?? []) {
      const existing = updatedColumns.find(
        (c) => c.Name === col.name,
      );
      if (existing) {
        // Modify existing column type
        changes.push({
          columnName: col.name,
          changeType: "modified",
          oldType: existing.Type ?? undefined,
          newType: col.type,
        });
        existing.Type = col.type;
      } else {
        changes.push({
          columnName: col.name,
          changeType: "added",
          newType: col.type,
        });
        updatedColumns.push({
          Name: col.name,
          Type: col.type,
        });
      }
    }

    // Update the table if changes were made
    let applied = false;
    if (changes.length > 0) {
      await glue.send(
        new UpdateTableCommand({
          DatabaseName: database,
          TableInput: {
            Name: table,
            StorageDescriptor: {
              ...tableData.StorageDescriptor,
              Columns: updatedColumns,
            },
            TableType: tableData.TableType,
            Parameters: tableData.Parameters,
            PartitionKeys: tableData.PartitionKeys,
          },
        }),
      );
      applied = true;
    }

    const result: SchemaEvolutionResult = {
      database,
      table,
      changes,
      applied,
    };
    return SchemaEvolutionResultSchema.parse(result);
  } catch (err) {
    throw wrapAwsError(err, "schemaEvolutionManager failed");
  }
}

/**
 * Manage Lake Formation access permissions.
 *
 * Grants or manages permissions for a principal (IAM user/role ARN) on
 * a Lake Formation database or table.
 *
 * @param database - Glue catalog database name.
 * @param principal - IAM principal ARN to grant permissions to.
 * @param permissions - Permissions to grant (e.g. ["SELECT", "DESCRIBE"]).
 * @param table - Optional table name to scope permissions to.
 * @param region - AWS region. Defaults to SDK default.
 * @returns Access result indicating whether permissions were granted.
 *
 * @example
 * ```ts
 * const result = await lakeFormationAccessManager(
 *   "analytics",
 *   "arn:aws:iam::123456789012:role/DataAnalyst",
 *   ["SELECT", "DESCRIBE"],
 *   "events",
 * );
 * ```
 */
export async function lakeFormationAccessManager(
  database: string,
  principal: string,
  permissions: string[],
  table?: string,
  region?: string,
): Promise<LakeFormationAccessResult> {
  try {
    const lf = getClient(LakeFormationClient, region);

    const resource = table
      ? {
          Table: {
            DatabaseName: database,
            Name: table,
          },
        }
      : {
          Database: {
            Name: database,
          },
        };

    await lf.send(
      new GrantPermissionsCommand({
        Principal: {
          DataLakePrincipalIdentifier: principal,
        },
        Resource: resource,
        Permissions: permissions,
      }),
    );

    const result: LakeFormationAccessResult = {
      database,
      principal,
      permissions,
      granted: true,
    };
    return LakeFormationAccessResultSchema.parse(result);
  } catch (err) {
    throw wrapAwsError(
      err,
      "lakeFormationAccessManager failed",
    );
  }
}

/**
 * Run a data quality pipeline using Athena queries.
 *
 * For each quality rule, builds and executes an Athena query to validate
 * the data. Supported checks: not_null, unique, min, max, regex. Optionally
 * publishes findings to an SNS topic.
 *
 * @param database - Glue catalog database name.
 * @param table - Table to check.
 * @param rules - Array of quality rules to validate.
 * @param snsTopicArn - Optional SNS topic for failure notifications.
 * @param region - AWS region. Defaults to SDK default.
 * @returns Quality result with findings and overall pass rate.
 *
 * @example
 * ```ts
 * const result = await dataQualityPipeline("analytics", "events", [
 *   { column: "user_id", check: "not_null" },
 *   { column: "email", check: "regex", value: "^.+@.+\\..+$" },
 *   { column: "age", check: "min", value: 0 },
 * ]);
 * ```
 */
export async function dataQualityPipeline(
  database: string,
  table: string,
  rules: Array<{
    column: string;
    check: "not_null" | "unique" | "min" | "max" | "regex";
    value?: string | number;
  }>,
  snsTopicArn?: string,
  region?: string,
): Promise<DataQualityResult> {
  try {
    const athena = getClient(AthenaClient, region);
    const findings: AuditFinding[] = [];
    let passed = 0;

    for (const rule of rules) {
      let query: string;
      switch (rule.check) {
        case "not_null":
          query = `SELECT COUNT(*) AS cnt FROM "${database}"."${table}" WHERE "${rule.column}" IS NULL`;
          break;
        case "unique":
          query = `SELECT COUNT(*) - COUNT(DISTINCT "${rule.column}") AS cnt FROM "${database}"."${table}"`;
          break;
        case "min":
          query = `SELECT COUNT(*) AS cnt FROM "${database}"."${table}" WHERE "${rule.column}" < ${rule.value}`;
          break;
        case "max":
          query = `SELECT COUNT(*) AS cnt FROM "${database}"."${table}" WHERE "${rule.column}" > ${rule.value}`;
          break;
        case "regex":
          query = `SELECT COUNT(*) AS cnt FROM "${database}"."${table}" WHERE NOT regexp_like(CAST("${rule.column}" AS VARCHAR), '${rule.value}')`;
          break;
      }

      const startResp = await athena.send(
        new StartQueryExecutionCommand({
          QueryString: query,
          QueryExecutionContext: { Database: database },
          ResultConfiguration: {
            OutputLocation: DEFAULT_ATHENA_OUTPUT,
          },
        }),
      );

      const queryId = startResp.QueryExecutionId;
      if (!queryId) {
        findings.push({
          resource: `${database}.${table}.${rule.column}`,
          finding: `Failed to start ${rule.check} check`,
          severity: "high",
        });
        continue;
      }

      const rows = await waitForAthenaQuery(athena, queryId);
      // rows[0] is the header, rows[1] is the data
      const violationCount =
        rows.length > 1 ? parseInt(rows[1][0], 10) : 0;

      if (violationCount > 0) {
        findings.push({
          resource: `${database}.${table}.${rule.column}`,
          finding: `${rule.check} check found ${violationCount} violations`,
          severity: violationCount > 1000 ? "high" : "medium",
        });
      } else {
        passed += 1;
      }
    }

    const passRate =
      rules.length > 0 ? passed / rules.length : 1;

    // Notify SNS if there are findings
    if (snsTopicArn && findings.length > 0) {
      const sns = getClient(SNSClient, region);
      await sns.send(
        new PublishCommand({
          TopicArn: snsTopicArn,
          Subject: `Data Quality Alert: ${database}.${table}`,
          Message: JSON.stringify(
            { database, table, findings, passRate },
            null,
            2,
          ),
        }),
      );
    }

    const result: DataQualityResult = {
      database,
      table,
      findings,
      passRate,
    };
    return DataQualityResultSchema.parse(result);
  } catch (err) {
    throw wrapAwsError(err, "dataQualityPipeline failed");
  }
}

// ---------------------------------------------------------------------------
// Additional types (auto-generated)
// ---------------------------------------------------------------------------

/** Result of a single data-quality check. */
export type CheckResult = {
  name: string;
  passed: boolean;
  actualValue?: string | undefined;
  expected?: string | undefined;
};
