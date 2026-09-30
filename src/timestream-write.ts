import { TimestreamWriteClient } from "@aws-sdk/client-timestream-write";
import { getClient } from "./client";
import { wrapAwsError } from "./exceptions";

/** Retention configuration for a Timestream table. */
export type RetentionProperties = {
  memoryStoreRetentionPeriodInHours?: number;
  magneticStoreRetentionPeriodInDays?: number;
};

/** Magnetic-store write settings for a Timestream table. */
export type MagneticStoreWriteProperties = {
  enableMagneticStoreWrites?: boolean;
};

/** Metadata describing a Timestream database. */
export type DatabaseDescription = {
  databaseName: string;
  arn?: string;
  tableCount?: number;
  kmsKeyId?: string;
  creationTime?: string;
  lastUpdatedTime?: string;
};

/** Metadata describing a Timestream table. */
export type TableDescription = {
  databaseName: string;
  tableName: string;
  arn?: string;
  tableStatus?: string;
  retentionProperties?: RetentionProperties;
  magneticStoreWriteProperties?: MagneticStoreWriteProperties;
  creationTime?: string;
  lastUpdatedTime?: string;
};

/** A single Timestream record for ingestion. */
export type Record = {
  dimensions?: Record<string, unknown>[];
  measureName?: string;
  measureValue?: string;
  measureValueType?: string;
  time?: string;
  timeUnit?: string;
  measureValues?: Record<string, unknown>[];
  version?: number;
};

/** Result of a WriteRecords call. */
export type WriteRecordsResult = {
  recordsIngestedTotal?: number;
  recordsIngestedMemoryStore?: number;
  recordsIngestedMagneticStore?: number;
};

/** Result of create_batch_load_task. */
export type CreateBatchLoadTaskResult = {
  taskId?: string;
};

/** Result of describe_batch_load_task. */
export type DescribeBatchLoadTaskResult = {
  batchLoadTaskDescription?: Record<string, unknown>;
};

/** Result of describe_endpoints. */
export type DescribeEndpointsResult = {
  endpoints?: Record<string, unknown>[];
};

/** Result of list_batch_load_tasks. */
export type ListBatchLoadTasksResult = {
  nextToken?: string;
  batchLoadTasks?: Record<string, unknown>[];
};

/** Result of list_tags_for_resource. */
export type ListTagsForResourceResult = {
  tags?: Record<string, unknown>[];
};

/** Create a Timestream database. */
export async function createDatabase(databaseName: string): Promise<DatabaseDescription> {
  try {
    // TODO: implement create_database
    throw new Error("create_database not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_database failed");
  }
}

/** Describe a Timestream database. */
export async function describeDatabase(databaseName: string): Promise<DatabaseDescription> {
  try {
    // TODO: implement describe_database
    throw new Error("describe_database not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_database failed");
  }
}

/** List Timestream databases. */
export async function listDatabases(): Promise<unknown> {
  try {
    // TODO: implement list_databases
    throw new Error("list_databases not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_databases failed");
  }
}

/** Delete a Timestream database. */
export async function deleteDatabase(databaseName: string): Promise<boolean> {
  try {
    // TODO: implement delete_database
    throw new Error("delete_database not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_database failed");
  }
}

/** Update a Timestream database (currently only KMS key). */
export async function updateDatabase(databaseName: string): Promise<DatabaseDescription> {
  try {
    // TODO: implement update_database
    throw new Error("update_database not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_database failed");
  }
}

/** Create a Timestream table. */
export async function createTable(databaseName: string, tableName: string): Promise<TableDescription> {
  try {
    // TODO: implement create_table
    throw new Error("create_table not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_table failed");
  }
}

/** Describe a Timestream table. */
export async function describeTable(databaseName: string, tableName: string): Promise<TableDescription> {
  try {
    // TODO: implement describe_table
    throw new Error("describe_table not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_table failed");
  }
}

/** List Timestream tables. */
export async function listTables(): Promise<unknown> {
  try {
    // TODO: implement list_tables
    throw new Error("list_tables not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_tables failed");
  }
}

/** Delete a Timestream table. */
export async function deleteTable(databaseName: string, tableName: string): Promise<boolean> {
  try {
    // TODO: implement delete_table
    throw new Error("delete_table not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_table failed");
  }
}

/** Update a Timestream table. */
export async function updateTable(databaseName: string, tableName: string): Promise<TableDescription> {
  try {
    // TODO: implement update_table
    throw new Error("update_table not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_table failed");
  }
}

/** Write time-series records to a Timestream table. */
export async function writeRecords(databaseName: string, tableName: string, records: Record | dict[str, Any][]): Promise<WriteRecordsResult> {
  try {
    // TODO: implement write_records
    throw new Error("write_records not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "write_records failed");
  }
}

/** Create batch load task. */
export async function createBatchLoadTask(dataSourceConfiguration: Record<string, unknown>, reportConfiguration: Record<string, unknown>, targetDatabaseName: string, targetTableName: string): Promise<CreateBatchLoadTaskResult> {
  try {
    // TODO: implement create_batch_load_task
    throw new Error("create_batch_load_task not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_batch_load_task failed");
  }
}

/** Describe batch load task. */
export async function describeBatchLoadTask(taskId: string, regionName?: string): Promise<DescribeBatchLoadTaskResult> {
  try {
    // TODO: implement describe_batch_load_task
    throw new Error("describe_batch_load_task not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_batch_load_task failed");
  }
}

/** Describe endpoints. */
export async function describeEndpoints(regionName?: string): Promise<DescribeEndpointsResult> {
  try {
    // TODO: implement describe_endpoints
    throw new Error("describe_endpoints not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_endpoints failed");
  }
}

/** List batch load tasks. */
export async function listBatchLoadTasks(): Promise<ListBatchLoadTasksResult> {
  try {
    // TODO: implement list_batch_load_tasks
    throw new Error("list_batch_load_tasks not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_batch_load_tasks failed");
  }
}

/** List tags for resource. */
export async function listTagsForResource(resourceArn: string, regionName?: string): Promise<ListTagsForResourceResult> {
  try {
    // TODO: implement list_tags_for_resource
    throw new Error("list_tags_for_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_tags_for_resource failed");
  }
}

/** Resume batch load task. */
export async function resumeBatchLoadTask(taskId: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement resume_batch_load_task
    throw new Error("resume_batch_load_task not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "resume_batch_load_task failed");
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
