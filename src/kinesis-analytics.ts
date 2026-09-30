import { wrapAwsError } from "./exceptions";

/** Summary metadata for a Kinesis Analytics V2 application. */
export type ApplicationSummary = {
  applicationName: string;
  applicationArn: string;
  applicationStatus: string;
  applicationVersionId?: number;
  runtimeEnvironment?: string;
};

/** Detailed metadata for a Kinesis Analytics V2 application. */
export type ApplicationDetail = {
  applicationName: string;
  applicationArn: string;
  applicationStatus: string;
  applicationVersionId: number;
  applicationDescription?: string;
  runtimeEnvironment?: string;
  serviceExecutionRole?: string;
  createTimestamp?: unknown;
  lastUpdateTimestamp?: unknown;
  applicationConfigurationDescription?: Record<string, unknown>;
  extra?: Record<string, unknown>;
};

/** Result of adding an application input. */
export type ApplicationInputResult = {
  applicationArn: string;
  applicationVersionId: number;
  inputDescriptions?: Record<string, unknown>[];
};

/** Result of adding an application output. */
export type ApplicationOutputResult = {
  applicationArn: string;
  applicationVersionId: number;
  outputDescriptions?: Record<string, unknown>[];
};

/** Result of add_application_cloud_watch_logging_option. */
export type AddApplicationCloudWatchLoggingOptionResult = {
  applicationArn?: string;
  applicationVersionId?: number;
  cloudWatchLoggingOptionDescriptions?: Record<string, unknown>[];
  operationId?: string;
};

/** Result of add_application_input_processing_configuration. */
export type AddApplicationInputProcessingConfigurationResult = {
  applicationArn?: string;
  applicationVersionId?: number;
  inputId?: string;
  inputProcessingConfigurationDescription?: Record<string, unknown>;
};

/** Result of add_application_reference_data_source. */
export type AddApplicationReferenceDataSourceResult = {
  applicationArn?: string;
  applicationVersionId?: number;
  referenceDataSourceDescriptions?: Record<string, unknown>[];
};

/** Result of add_application_vpc_configuration. */
export type AddApplicationVpcConfigurationResult = {
  applicationArn?: string;
  applicationVersionId?: number;
  vpcConfigurationDescription?: Record<string, unknown>;
  operationId?: string;
};

/** Result of create_application_presigned_url. */
export type CreateApplicationPresignedUrlResult = {
  authorizedUrl?: string;
};

/** Result of delete_application_cloud_watch_logging_option. */
export type DeleteApplicationCloudWatchLoggingOptionResult = {
  applicationArn?: string;
  applicationVersionId?: number;
  cloudWatchLoggingOptionDescriptions?: Record<string, unknown>[];
  operationId?: string;
};

/** Result of delete_application_input_processing_configuration. */
export type DeleteApplicationInputProcessingConfigurationResult = {
  applicationArn?: string;
  applicationVersionId?: number;
};

/** Result of delete_application_output. */
export type DeleteApplicationOutputResult = {
  applicationArn?: string;
  applicationVersionId?: number;
};

/** Result of delete_application_reference_data_source. */
export type DeleteApplicationReferenceDataSourceResult = {
  applicationArn?: string;
  applicationVersionId?: number;
};

/** Result of delete_application_vpc_configuration. */
export type DeleteApplicationVpcConfigurationResult = {
  applicationArn?: string;
  applicationVersionId?: number;
  operationId?: string;
};

/** Result of describe_application_operation. */
export type DescribeApplicationOperationResult = {
  applicationOperationInfoDetails?: Record<string, unknown>;
};

/** Result of describe_application_snapshot. */
export type DescribeApplicationSnapshotResult = {
  snapshotDetails?: Record<string, unknown>;
};

/** Result of describe_application_version. */
export type DescribeApplicationVersionResult = {
  applicationVersionDetail?: Record<string, unknown>;
};

/** Result of discover_input_schema. */
export type DiscoverInputSchemaResult = {
  inputSchema?: Record<string, unknown>;
  parsedInputRecords?: string[][];
  processedInputRecords?: string[];
  rawInputRecords?: string[];
};

/** Result of list_application_operations. */
export type ListApplicationOperationsResult = {
  applicationOperationInfoList?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_application_snapshots. */
export type ListApplicationSnapshotsResult = {
  snapshotSummaries?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_application_versions. */
export type ListApplicationVersionsResult = {
  applicationVersionSummaries?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_tags_for_resource. */
export type ListTagsForResourceResult = {
  tags?: Record<string, unknown>[];
};

/** Result of rollback_application. */
export type RollbackApplicationResult = {
  applicationDetail?: Record<string, unknown>;
  operationId?: string;
};

/** Result of update_application_maintenance_configuration. */
export type UpdateApplicationMaintenanceConfigurationResult = {
  applicationArn?: string;
  applicationMaintenanceConfigurationDescription?: Record<string, unknown>;
};

/** Create a Kinesis Analytics V2 application. */
export async function createApplication(applicationName: string): Promise<ApplicationDetail> {
  try {
    // TODO: implement create_application
    throw new Error("create_application not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_application failed");
  }
}

/** Describe a Kinesis Analytics V2 application. */
export async function describeApplication(applicationName: string): Promise<ApplicationDetail> {
  try {
    // TODO: implement describe_application
    throw new Error("describe_application not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_application failed");
  }
}

/** List Kinesis Analytics V2 applications. */
export async function listApplications(): Promise<ApplicationSummary[]> {
  try {
    // TODO: implement list_applications
    throw new Error("list_applications not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_applications failed");
  }
}

/** Delete a Kinesis Analytics V2 application. */
export async function deleteApplication(applicationName: string): Promise<void> {
  try {
    // TODO: implement delete_application
    throw new Error("delete_application not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_application failed");
  }
}

/** Start a Kinesis Analytics V2 application. */
export async function startApplication(applicationName: string): Promise<void> {
  try {
    // TODO: implement start_application
    throw new Error("start_application not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_application failed");
  }
}

/** Stop a Kinesis Analytics V2 application. */
export async function stopApplication(applicationName: string): Promise<void> {
  try {
    // TODO: implement stop_application
    throw new Error("stop_application not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "stop_application failed");
  }
}

/** Add a streaming input to a Kinesis Analytics V2 application. */
export async function addApplicationInput(applicationName: string): Promise<ApplicationInputResult> {
  try {
    // TODO: implement add_application_input
    throw new Error("add_application_input not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "add_application_input failed");
  }
}

/** Add an output destination to a Kinesis Analytics V2 application. */
export async function addApplicationOutput(applicationName: string): Promise<ApplicationOutputResult> {
  try {
    // TODO: implement add_application_output
    throw new Error("add_application_output not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "add_application_output failed");
  }
}

/** Update a Kinesis Analytics V2 application. */
export async function updateApplication(applicationName: string): Promise<ApplicationDetail> {
  try {
    // TODO: implement update_application
    throw new Error("update_application not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_application failed");
  }
}

/** Add application cloud watch logging option. */
export async function addApplicationCloudWatchLoggingOption(applicationName: string, cloudWatchLoggingOption: Record<string, unknown>): Promise<AddApplicationCloudWatchLoggingOptionResult> {
  try {
    // TODO: implement add_application_cloud_watch_logging_option
    throw new Error("add_application_cloud_watch_logging_option not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "add_application_cloud_watch_logging_option failed");
  }
}

/** Add application input processing configuration. */
export async function addApplicationInputProcessingConfiguration(applicationName: string, currentApplicationVersionId: number, inputId: string, inputProcessingConfiguration: Record<string, unknown>, regionName?: string): Promise<AddApplicationInputProcessingConfigurationResult> {
  try {
    // TODO: implement add_application_input_processing_configuration
    throw new Error("add_application_input_processing_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "add_application_input_processing_configuration failed");
  }
}

/** Add application reference data source. */
export async function addApplicationReferenceDataSource(applicationName: string, currentApplicationVersionId: number, referenceDataSource: Record<string, unknown>, regionName?: string): Promise<AddApplicationReferenceDataSourceResult> {
  try {
    // TODO: implement add_application_reference_data_source
    throw new Error("add_application_reference_data_source not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "add_application_reference_data_source failed");
  }
}

/** Add application vpc configuration. */
export async function addApplicationVpcConfiguration(applicationName: string, vpcConfiguration: Record<string, unknown>): Promise<AddApplicationVpcConfigurationResult> {
  try {
    // TODO: implement add_application_vpc_configuration
    throw new Error("add_application_vpc_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "add_application_vpc_configuration failed");
  }
}

/** Create application presigned url. */
export async function createApplicationPresignedUrl(applicationName: string, urlType: string): Promise<CreateApplicationPresignedUrlResult> {
  try {
    // TODO: implement create_application_presigned_url
    throw new Error("create_application_presigned_url not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_application_presigned_url failed");
  }
}

/** Create application snapshot. */
export async function createApplicationSnapshot(applicationName: string, snapshotName: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement create_application_snapshot
    throw new Error("create_application_snapshot not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_application_snapshot failed");
  }
}

/** Delete application cloud watch logging option. */
export async function deleteApplicationCloudWatchLoggingOption(applicationName: string, cloudWatchLoggingOptionId: string): Promise<DeleteApplicationCloudWatchLoggingOptionResult> {
  try {
    // TODO: implement delete_application_cloud_watch_logging_option
    throw new Error("delete_application_cloud_watch_logging_option not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_application_cloud_watch_logging_option failed");
  }
}

/** Delete application input processing configuration. */
export async function deleteApplicationInputProcessingConfiguration(applicationName: string, currentApplicationVersionId: number, inputId: string, regionName?: string): Promise<DeleteApplicationInputProcessingConfigurationResult> {
  try {
    // TODO: implement delete_application_input_processing_configuration
    throw new Error("delete_application_input_processing_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_application_input_processing_configuration failed");
  }
}

/** Delete application output. */
export async function deleteApplicationOutput(applicationName: string, currentApplicationVersionId: number, outputId: string, regionName?: string): Promise<DeleteApplicationOutputResult> {
  try {
    // TODO: implement delete_application_output
    throw new Error("delete_application_output not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_application_output failed");
  }
}

/** Delete application reference data source. */
export async function deleteApplicationReferenceDataSource(applicationName: string, currentApplicationVersionId: number, referenceId: string, regionName?: string): Promise<DeleteApplicationReferenceDataSourceResult> {
  try {
    // TODO: implement delete_application_reference_data_source
    throw new Error("delete_application_reference_data_source not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_application_reference_data_source failed");
  }
}

/** Delete application snapshot. */
export async function deleteApplicationSnapshot(applicationName: string, snapshotName: string, snapshotCreationTimestamp: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_application_snapshot
    throw new Error("delete_application_snapshot not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_application_snapshot failed");
  }
}

/** Delete application vpc configuration. */
export async function deleteApplicationVpcConfiguration(applicationName: string, vpcConfigurationId: string): Promise<DeleteApplicationVpcConfigurationResult> {
  try {
    // TODO: implement delete_application_vpc_configuration
    throw new Error("delete_application_vpc_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_application_vpc_configuration failed");
  }
}

/** Describe application operation. */
export async function describeApplicationOperation(applicationName: string, operationId: string, regionName?: string): Promise<DescribeApplicationOperationResult> {
  try {
    // TODO: implement describe_application_operation
    throw new Error("describe_application_operation not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_application_operation failed");
  }
}

/** Describe application snapshot. */
export async function describeApplicationSnapshot(applicationName: string, snapshotName: string, regionName?: string): Promise<DescribeApplicationSnapshotResult> {
  try {
    // TODO: implement describe_application_snapshot
    throw new Error("describe_application_snapshot not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_application_snapshot failed");
  }
}

/** Describe application version. */
export async function describeApplicationVersion(applicationName: string, applicationVersionId: number, regionName?: string): Promise<DescribeApplicationVersionResult> {
  try {
    // TODO: implement describe_application_version
    throw new Error("describe_application_version not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_application_version failed");
  }
}

/** Discover input schema. */
export async function discoverInputSchema(serviceExecutionRole: string): Promise<DiscoverInputSchemaResult> {
  try {
    // TODO: implement discover_input_schema
    throw new Error("discover_input_schema not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "discover_input_schema failed");
  }
}

/** List application operations. */
export async function listApplicationOperations(applicationName: string): Promise<ListApplicationOperationsResult> {
  try {
    // TODO: implement list_application_operations
    throw new Error("list_application_operations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_application_operations failed");
  }
}

/** List application snapshots. */
export async function listApplicationSnapshots(applicationName: string): Promise<ListApplicationSnapshotsResult> {
  try {
    // TODO: implement list_application_snapshots
    throw new Error("list_application_snapshots not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_application_snapshots failed");
  }
}

/** List application versions. */
export async function listApplicationVersions(applicationName: string): Promise<ListApplicationVersionsResult> {
  try {
    // TODO: implement list_application_versions
    throw new Error("list_application_versions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_application_versions failed");
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

/** Rollback application. */
export async function rollbackApplication(applicationName: string, currentApplicationVersionId: number, regionName?: string): Promise<RollbackApplicationResult> {
  try {
    // TODO: implement rollback_application
    throw new Error("rollback_application not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "rollback_application failed");
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

/** Update application maintenance configuration. */
export async function updateApplicationMaintenanceConfiguration(applicationName: string, applicationMaintenanceConfigurationUpdate: Record<string, unknown>, regionName?: string): Promise<UpdateApplicationMaintenanceConfigurationResult> {
  try {
    // TODO: implement update_application_maintenance_configuration
    throw new Error("update_application_maintenance_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_application_maintenance_configuration failed");
  }
}
