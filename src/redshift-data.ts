import { RedshiftDataClient } from "@aws-sdk/client-redshift-data";
import { getClient } from "./client";
import { wrapAwsError } from "./exceptions";

/** Metadata returned after submitting a statement for execution. */
export type StatementResult = {
  statementId: string;
  clusterIdentifier?: string;
  database?: string;
  secretArn?: string;
  dbUser?: string;
  workgroupName?: string;
};

/** Detailed description of a submitted statement. */
export type StatementDescription = {
  statementId: string;
  status: string;
  queryString?: string;
  resultRows?: number;
  resultSize?: number;
  duration?: number;
  error?: string;
  hasResultSet?: boolean;
  clusterIdentifier?: string;
  database?: string;
  secretArn?: string;
  dbUser?: string;
  workgroupName?: string;
  extra?: Record<string, unknown>;
};

/** Result set returned by :func:`get_statement_result`. */
export type QueryResult = {
  columnMetadata?: Record<string, unknown>[];
  records?: Record<string, unknown>[][];
  totalNumRows?: number;
  nextToken?: string;
};

/** Result of describe_table. */
export type DescribeTableResult = {
  columnList?: Record<string, unknown>[];
  nextToken?: string;
  tableName?: string;
};

/** Result of get_statement_result_v2. */
export type GetStatementResultV2Result = {
  columnMetadata?: Record<string, unknown>[];
  nextToken?: string;
  records?: Record<string, unknown>[];
  resultFormat?: string;
  totalNumRows?: number;
};

/** Result of list_databases. */
export type ListDatabasesResult = {
  databases?: string[];
  nextToken?: string;
};

/** Result of list_schemas. */
export type ListSchemasResult = {
  nextToken?: string;
  schemas?: string[];
};

/** Result of list_tables. */
export type ListTablesResult = {
  nextToken?: string;
  tables?: Record<string, unknown>[];
};

/** Execute a single SQL statement via the Redshift Data API. */
export async function executeStatement(sql: string): Promise<StatementResult> {
  try {
    // TODO: implement execute_statement
    throw new Error("execute_statement not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "execute_statement failed");
  }
}

/** Execute multiple SQL statements as a batch. */
export async function batchExecuteStatement(sqls: string[]): Promise<StatementResult> {
  try {
    // TODO: implement batch_execute_statement
    throw new Error("batch_execute_statement not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_execute_statement failed");
  }
}

/** Describe a submitted statement. */
export async function describeStatement(statementId: string): Promise<StatementDescription> {
  try {
    // TODO: implement describe_statement
    throw new Error("describe_statement not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_statement failed");
  }
}

/** Retrieve the result set for a finished statement. */
export async function getStatementResult(statementId: string): Promise<QueryResult> {
  try {
    // TODO: implement get_statement_result
    throw new Error("get_statement_result not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_statement_result failed");
  }
}

/** List submitted statements, optionally filtered. */
export async function listStatements(): Promise<unknown> {
  try {
    // TODO: implement list_statements
    throw new Error("list_statements not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_statements failed");
  }
}

/** Cancel a running statement. */
export async function cancelStatement(statementId: string): Promise<boolean> {
  try {
    // TODO: implement cancel_statement
    throw new Error("cancel_statement not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "cancel_statement failed");
  }
}

/** Execute a query and wait for results. */
export async function runQuery(sql: string): Promise<QueryResult> {
  try {
    // TODO: implement run_query
    throw new Error("run_query not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "run_query failed");
  }
}

/** Describe table. */
export async function describeTable(database: string): Promise<DescribeTableResult> {
  try {
    // TODO: implement describe_table
    throw new Error("describe_table not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_table failed");
  }
}

/** Get statement result v2. */
export async function getStatementResultV2(id: string): Promise<GetStatementResultV2Result> {
  try {
    // TODO: implement get_statement_result_v2
    throw new Error("get_statement_result_v2 not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_statement_result_v2 failed");
  }
}

/** List databases. */
export async function listDatabases(database: string): Promise<ListDatabasesResult> {
  try {
    // TODO: implement list_databases
    throw new Error("list_databases not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_databases failed");
  }
}

/** List schemas. */
export async function listSchemas(database: string): Promise<ListSchemasResult> {
  try {
    // TODO: implement list_schemas
    throw new Error("list_schemas not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_schemas failed");
  }
}

/** List tables. */
export async function listTables(database: string): Promise<ListTablesResult> {
  try {
    // TODO: implement list_tables
    throw new Error("list_tables not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_tables failed");
  }
}
