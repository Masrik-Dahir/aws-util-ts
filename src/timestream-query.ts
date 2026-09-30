import { TimestreamQueryClient } from "@aws-sdk/client-timestream-query";
import { getClient } from "./client";
import { wrapAwsError } from "./exceptions";

/** Column metadata returned from a Timestream query. */
export type ColumnInfo = {
  name?: string;
  typeName?: string;
};

/** A single row in a Timestream query result set. */
export type Row = {
  data?: Record<string, unknown>[];
};

/** Parsed result of a Timestream Query API call. */
export type QueryResult = {
  queryId?: string;
  rows?: Row[];
  columnInfo?: ColumnInfo[];
  nextToken?: string;
};

/** A Timestream query endpoint. */
export type EndpointInfo = {
  address: string;
  cachePeriodInMinutes?: number;
};

/** Metadata describing a Timestream scheduled query. */
export type ScheduledQueryDescription = {
  arn: string;
  name?: string;
  state?: string;
  queryString?: string;
  scheduleExpression?: string;
  targetDatabase?: string;
  targetTable?: string;
  creationTime?: string;
};

/** Result of describe_account_settings. */
export type DescribeAccountSettingsResult = {
  maxQueryTcu?: number;
  queryPricingModel?: string;
  queryCompute?: Record<string, unknown>;
};

/** Result of describe_scheduled_query. */
export type DescribeScheduledQueryResult = {
  scheduledQuery?: Record<string, unknown>;
};

/** Result of list_tags_for_resource. */
export type ListTagsForResourceResult = {
  tags?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of prepare_query. */
export type PrepareQueryResult = {
  queryString?: string;
  columns?: Record<string, unknown>[];
  parameters?: Record<string, unknown>[];
};

/** Result of update_account_settings. */
export type UpdateAccountSettingsResult = {
  maxQueryTcu?: number;
  queryPricingModel?: string;
  queryCompute?: Record<string, unknown>;
};

/** Execute a single-page Timestream query. */
export async function query(queryString: string): Promise<QueryResult> {
  try {
    // TODO: implement query
    throw new Error("query not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "query failed");
  }
}

/** Describe Timestream query endpoints. */
export async function describeEndpoints(): Promise<EndpointInfo[]> {
  try {
    // TODO: implement describe_endpoints
    throw new Error("describe_endpoints not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_endpoints failed");
  }
}

/** Cancel a running Timestream query. */
export async function cancelQuery(queryId: string): Promise<boolean> {
  try {
    // TODO: implement cancel_query
    throw new Error("cancel_query not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "cancel_query failed");
  }
}

/** Execute a query and auto-paginate all result pages. */
export async function runQuery(queryString: string): Promise<QueryResult> {
  try {
    // TODO: implement run_query
    throw new Error("run_query not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "run_query failed");
  }
}

/** Create a Timestream scheduled query. */
export async function createScheduledQuery(name: string, queryString: string, scheduleExpression: string): Promise<ScheduledQueryDescription> {
  try {
    // TODO: implement create_scheduled_query
    throw new Error("create_scheduled_query not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_scheduled_query failed");
  }
}

/** List Timestream scheduled queries. */
export async function listScheduledQueries(): Promise<unknown> {
  try {
    // TODO: implement list_scheduled_queries
    throw new Error("list_scheduled_queries not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_scheduled_queries failed");
  }
}

/** Manually trigger a scheduled query execution. */
export async function executeScheduledQuery(scheduledQueryArn: string, invocationTime: string): Promise<boolean> {
  try {
    // TODO: implement execute_scheduled_query
    throw new Error("execute_scheduled_query not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "execute_scheduled_query failed");
  }
}

/** Delete a scheduled query. */
export async function deleteScheduledQuery(scheduledQueryArn: string): Promise<boolean> {
  try {
    // TODO: implement delete_scheduled_query
    throw new Error("delete_scheduled_query not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_scheduled_query failed");
  }
}

/** Describe account settings. */
export async function describeAccountSettings(regionName?: string): Promise<DescribeAccountSettingsResult> {
  try {
    // TODO: implement describe_account_settings
    throw new Error("describe_account_settings not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_account_settings failed");
  }
}

/** Describe scheduled query. */
export async function describeScheduledQuery(scheduledQueryArn: string, regionName?: string): Promise<DescribeScheduledQueryResult> {
  try {
    // TODO: implement describe_scheduled_query
    throw new Error("describe_scheduled_query not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_scheduled_query failed");
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

/** Prepare query. */
export async function prepareQuery(queryString: string): Promise<PrepareQueryResult> {
  try {
    // TODO: implement prepare_query
    throw new Error("prepare_query not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "prepare_query failed");
  }
}

/** Tag resource. */
export async function tagResource(resourceArn: string, tags: Record<string, unknown>[], regionName?: string): Promise<void> {
  try {
    // TODO: implement tag_resource
    throw new Error("tag_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "tag_resource failed");
  }
}

/** Untag resource. */
export async function untagResource(resourceArn: string, tagKeys: string[], regionName?: string): Promise<void> {
  try {
    // TODO: implement untag_resource
    throw new Error("untag_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "untag_resource failed");
  }
}

/** Update account settings. */
export async function updateAccountSettings(): Promise<UpdateAccountSettingsResult> {
  try {
    // TODO: implement update_account_settings
    throw new Error("update_account_settings not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_account_settings failed");
  }
}

/** Update scheduled query. */
export async function updateScheduledQuery(scheduledQueryArn: string, state: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement update_scheduled_query
    throw new Error("update_scheduled_query not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_scheduled_query failed");
  }
}
