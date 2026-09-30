import { CodebuildClient } from "@aws-sdk/client-codebuild";
import { getClient } from "./client";
import { wrapAwsError } from "./exceptions";

/** A CodeBuild project. */
export type ProjectResult = {
  name: string;
  arn: string;
  description?: string;
  source: Record<string, unknown>;
  artifacts?: Record<string, unknown>;
  environment: Record<string, unknown>;
  serviceRole?: string;
  created?: string;
  lastModified?: string;
  extra?: Record<string, unknown>;
};

/** A CodeBuild build. */
export type BuildResult = {
  id: string;
  arn: string;
  projectName: string;
  buildStatus: string;
  currentPhase?: string;
  startTime?: string;
  endTime?: string;
  sourceVersion?: string;
  logs?: Record<string, unknown>;
  extra?: Record<string, unknown>;
};

/** Result of batch_delete_builds. */
export type BatchDeleteBuildsResult = {
  buildsDeleted?: string[];
  buildsNotDeleted?: Record<string, unknown>[];
};

/** Result of batch_get_build_batches. */
export type BatchGetBuildBatchesResult = {
  buildBatches?: Record<string, unknown>[];
  buildBatchesNotFound?: string[];
};

/** Result of batch_get_command_executions. */
export type BatchGetCommandExecutionsResult = {
  commandExecutions?: Record<string, unknown>[];
  commandExecutionsNotFound?: string[];
};

/** Result of batch_get_fleets. */
export type BatchGetFleetsResult = {
  fleets?: Record<string, unknown>[];
  fleetsNotFound?: string[];
};

/** Result of batch_get_report_groups. */
export type BatchGetReportGroupsResult = {
  reportGroups?: Record<string, unknown>[];
  reportGroupsNotFound?: string[];
};

/** Result of batch_get_reports. */
export type BatchGetReportsResult = {
  reports?: Record<string, unknown>[];
  reportsNotFound?: string[];
};

/** Result of batch_get_sandboxes. */
export type BatchGetSandboxesResult = {
  sandboxes?: Record<string, unknown>[];
  sandboxesNotFound?: string[];
};

/** Result of create_fleet. */
export type CreateFleetResult = {
  fleet?: Record<string, unknown>;
};

/** Result of create_report_group. */
export type CreateReportGroupResult = {
  reportGroup?: Record<string, unknown>;
};

/** Result of create_webhook. */
export type CreateWebhookResult = {
  webhook?: Record<string, unknown>;
};

/** Result of delete_build_batch. */
export type DeleteBuildBatchResult = {
  statusCode?: string;
  buildsDeleted?: string[];
  buildsNotDeleted?: Record<string, unknown>[];
};

/** Result of delete_source_credentials. */
export type DeleteSourceCredentialsResult = {
  arn?: string;
};

/** Result of describe_code_coverages. */
export type DescribeCodeCoveragesResult = {
  nextToken?: string;
  codeCoverages?: Record<string, unknown>[];
};

/** Result of describe_test_cases. */
export type DescribeTestCasesResult = {
  nextToken?: string;
  runCases?: Record<string, unknown>[];
};

/** Result of get_report_group_trend. */
export type GetReportGroupTrendResult = {
  stats?: Record<string, unknown>;
  rawData?: Record<string, unknown>[];
};

/** Result of get_resource_policy. */
export type GetResourcePolicyResult = {
  policy?: string;
};

/** Result of import_source_credentials. */
export type ImportSourceCredentialsResult = {
  arn?: string;
};

/** Result of list_build_batches. */
export type ListBuildBatchesResult = {
  ids?: string[];
  nextToken?: string;
};

/** Result of list_build_batches_for_project. */
export type ListBuildBatchesForProjectResult = {
  ids?: string[];
  nextToken?: string;
};

/** Result of list_command_executions_for_sandbox. */
export type ListCommandExecutionsForSandboxResult = {
  commandExecutions?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_curated_environment_images. */
export type ListCuratedEnvironmentImagesResult = {
  platforms?: Record<string, unknown>[];
};

/** Result of list_fleets. */
export type ListFleetsResult = {
  nextToken?: string;
  fleets?: string[];
};

/** Result of list_report_groups. */
export type ListReportGroupsResult = {
  nextToken?: string;
  reportGroups?: string[];
};

/** Result of list_reports. */
export type ListReportsResult = {
  nextToken?: string;
  reports?: string[];
};

/** Result of list_reports_for_report_group. */
export type ListReportsForReportGroupResult = {
  nextToken?: string;
  reports?: string[];
};

/** Result of list_sandboxes. */
export type ListSandboxesResult = {
  ids?: string[];
  nextToken?: string;
};

/** Result of list_sandboxes_for_project. */
export type ListSandboxesForProjectResult = {
  ids?: string[];
  nextToken?: string;
};

/** Result of list_shared_projects. */
export type ListSharedProjectsResult = {
  nextToken?: string;
  projects?: string[];
};

/** Result of list_shared_report_groups. */
export type ListSharedReportGroupsResult = {
  nextToken?: string;
  reportGroups?: string[];
};

/** Result of list_source_credentials. */
export type ListSourceCredentialsResult = {
  sourceCredentialsInfos?: Record<string, unknown>[];
};

/** Result of put_resource_policy. */
export type PutResourcePolicyResult = {
  resourceArn?: string;
};

/** Result of retry_build_batch. */
export type RetryBuildBatchResult = {
  buildBatch?: Record<string, unknown>;
};

/** Result of start_build_batch. */
export type StartBuildBatchResult = {
  buildBatch?: Record<string, unknown>;
};

/** Result of start_command_execution. */
export type StartCommandExecutionResult = {
  commandExecution?: Record<string, unknown>;
};

/** Result of start_sandbox. */
export type StartSandboxResult = {
  sandbox?: Record<string, unknown>;
};

/** Result of start_sandbox_connection. */
export type StartSandboxConnectionResult = {
  ssmSession?: Record<string, unknown>;
};

/** Result of stop_build_batch. */
export type StopBuildBatchResult = {
  buildBatch?: Record<string, unknown>;
};

/** Result of stop_sandbox. */
export type StopSandboxResult = {
  sandbox?: Record<string, unknown>;
};

/** Result of update_fleet. */
export type UpdateFleetResult = {
  fleet?: Record<string, unknown>;
};

/** Result of update_project_visibility. */
export type UpdateProjectVisibilityResult = {
  projectArn?: string;
  publicProjectAlias?: string;
  projectVisibility?: string;
};

/** Result of update_report_group. */
export type UpdateReportGroupResult = {
  reportGroup?: Record<string, unknown>;
};

/** Result of update_webhook. */
export type UpdateWebhookResult = {
  webhook?: Record<string, unknown>;
};

/** Create a new CodeBuild project. */
export async function createProject(name: string): Promise<ProjectResult> {
  try {
    // TODO: implement create_project
    throw new Error("create_project not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_project failed");
  }
}

/** Retrieve details for one or more CodeBuild projects. */
export async function batchGetProjects(names: string[]): Promise<ProjectResult[]> {
  try {
    // TODO: implement batch_get_projects
    throw new Error("batch_get_projects not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_get_projects failed");
  }
}

/** List CodeBuild project names. */
export async function listProjects(): Promise<string[]> {
  try {
    // TODO: implement list_projects
    throw new Error("list_projects not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_projects failed");
  }
}

/** Update an existing CodeBuild project. */
export async function updateProject(name: string): Promise<ProjectResult> {
  try {
    // TODO: implement update_project
    throw new Error("update_project not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_project failed");
  }
}

/** Delete a CodeBuild project. */
export async function deleteProject(name: string): Promise<void> {
  try {
    // TODO: implement delete_project
    throw new Error("delete_project not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_project failed");
  }
}

/** Start a new build for a CodeBuild project. */
export async function startBuild(projectName: string): Promise<BuildResult> {
  try {
    // TODO: implement start_build
    throw new Error("start_build not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_build failed");
  }
}

/** Retrieve details for one or more builds. */
export async function batchGetBuilds(buildIds: string[]): Promise<BuildResult[]> {
  try {
    // TODO: implement batch_get_builds
    throw new Error("batch_get_builds not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_get_builds failed");
  }
}

/** List build IDs across all projects. */
export async function listBuilds(): Promise<string[]> {
  try {
    // TODO: implement list_builds
    throw new Error("list_builds not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_builds failed");
  }
}

/** List build IDs for a specific project. */
export async function listBuildsForProject(projectName: string): Promise<string[]> {
  try {
    // TODO: implement list_builds_for_project
    throw new Error("list_builds_for_project not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_builds_for_project failed");
  }
}

/** Stop a running build. */
export async function stopBuild(buildId: string): Promise<BuildResult> {
  try {
    // TODO: implement stop_build
    throw new Error("stop_build not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "stop_build failed");
  }
}

/** Retry a previously completed build. */
export async function retryBuild(buildId: string): Promise<BuildResult> {
  try {
    // TODO: implement retry_build
    throw new Error("retry_build not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "retry_build failed");
  }
}

/** Poll until a build reaches a terminal status. */
export async function waitForBuild(buildId: string): Promise<BuildResult> {
  try {
    // TODO: implement wait_for_build
    throw new Error("wait_for_build not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "wait_for_build failed");
  }
}

/** Start a build and wait until it reaches a terminal status. */
export async function startBuildAndWait(projectName: string): Promise<BuildResult> {
  try {
    // TODO: implement start_build_and_wait
    throw new Error("start_build_and_wait not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_build_and_wait failed");
  }
}

/** Batch delete builds. */
export async function batchDeleteBuilds(ids: string[], regionName?: string): Promise<BatchDeleteBuildsResult> {
  try {
    // TODO: implement batch_delete_builds
    throw new Error("batch_delete_builds not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_delete_builds failed");
  }
}

/** Batch get build batches. */
export async function batchGetBuildBatches(ids: string[], regionName?: string): Promise<BatchGetBuildBatchesResult> {
  try {
    // TODO: implement batch_get_build_batches
    throw new Error("batch_get_build_batches not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_get_build_batches failed");
  }
}

/** Batch get command executions. */
export async function batchGetCommandExecutions(sandboxId: string, commandExecutionIds: string[], regionName?: string): Promise<BatchGetCommandExecutionsResult> {
  try {
    // TODO: implement batch_get_command_executions
    throw new Error("batch_get_command_executions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_get_command_executions failed");
  }
}

/** Batch get fleets. */
export async function batchGetFleets(names: string[], regionName?: string): Promise<BatchGetFleetsResult> {
  try {
    // TODO: implement batch_get_fleets
    throw new Error("batch_get_fleets not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_get_fleets failed");
  }
}

/** Batch get report groups. */
export async function batchGetReportGroups(reportGroupArns: string[], regionName?: string): Promise<BatchGetReportGroupsResult> {
  try {
    // TODO: implement batch_get_report_groups
    throw new Error("batch_get_report_groups not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_get_report_groups failed");
  }
}

/** Batch get reports. */
export async function batchGetReports(reportArns: string[], regionName?: string): Promise<BatchGetReportsResult> {
  try {
    // TODO: implement batch_get_reports
    throw new Error("batch_get_reports not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_get_reports failed");
  }
}

/** Batch get sandboxes. */
export async function batchGetSandboxes(ids: string[], regionName?: string): Promise<BatchGetSandboxesResult> {
  try {
    // TODO: implement batch_get_sandboxes
    throw new Error("batch_get_sandboxes not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_get_sandboxes failed");
  }
}

/** Create fleet. */
export async function createFleet(name: string, baseCapacity: number, environmentType: string, computeType: string): Promise<CreateFleetResult> {
  try {
    // TODO: implement create_fleet
    throw new Error("create_fleet not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_fleet failed");
  }
}

/** Create report group. */
export async function createReportGroup(name: string, typeValue: string, exportConfig: Record<string, unknown>): Promise<CreateReportGroupResult> {
  try {
    // TODO: implement create_report_group
    throw new Error("create_report_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_report_group failed");
  }
}

/** Create webhook. */
export async function createWebhook(projectName: string): Promise<CreateWebhookResult> {
  try {
    // TODO: implement create_webhook
    throw new Error("create_webhook not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_webhook failed");
  }
}

/** Delete build batch. */
export async function deleteBuildBatch(id: string, regionName?: string): Promise<DeleteBuildBatchResult> {
  try {
    // TODO: implement delete_build_batch
    throw new Error("delete_build_batch not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_build_batch failed");
  }
}

/** Delete fleet. */
export async function deleteFleet(arn: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_fleet
    throw new Error("delete_fleet not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_fleet failed");
  }
}

/** Delete report. */
export async function deleteReport(arn: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_report
    throw new Error("delete_report not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_report failed");
  }
}

/** Delete report group. */
export async function deleteReportGroup(arn: string): Promise<void> {
  try {
    // TODO: implement delete_report_group
    throw new Error("delete_report_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_report_group failed");
  }
}

/** Delete resource policy. */
export async function deleteResourcePolicy(resourceArn: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_resource_policy
    throw new Error("delete_resource_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_resource_policy failed");
  }
}

/** Delete source credentials. */
export async function deleteSourceCredentials(arn: string, regionName?: string): Promise<DeleteSourceCredentialsResult> {
  try {
    // TODO: implement delete_source_credentials
    throw new Error("delete_source_credentials not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_source_credentials failed");
  }
}

/** Delete webhook. */
export async function deleteWebhook(projectName: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_webhook
    throw new Error("delete_webhook not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_webhook failed");
  }
}

/** Describe code coverages. */
export async function describeCodeCoverages(reportArn: string): Promise<DescribeCodeCoveragesResult> {
  try {
    // TODO: implement describe_code_coverages
    throw new Error("describe_code_coverages not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_code_coverages failed");
  }
}

/** Describe test cases. */
export async function describeTestCases(reportArn: string): Promise<DescribeTestCasesResult> {
  try {
    // TODO: implement describe_test_cases
    throw new Error("describe_test_cases not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_test_cases failed");
  }
}

/** Get report group trend. */
export async function getReportGroupTrend(reportGroupArn: string, trendField: string): Promise<GetReportGroupTrendResult> {
  try {
    // TODO: implement get_report_group_trend
    throw new Error("get_report_group_trend not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_report_group_trend failed");
  }
}

/** Get resource policy. */
export async function getResourcePolicy(resourceArn: string, regionName?: string): Promise<GetResourcePolicyResult> {
  try {
    // TODO: implement get_resource_policy
    throw new Error("get_resource_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_resource_policy failed");
  }
}

/** Import source credentials. */
export async function importSourceCredentials(token: string, serverType: string, authType: string): Promise<ImportSourceCredentialsResult> {
  try {
    // TODO: implement import_source_credentials
    throw new Error("import_source_credentials not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "import_source_credentials failed");
  }
}

/** Invalidate project cache. */
export async function invalidateProjectCache(projectName: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement invalidate_project_cache
    throw new Error("invalidate_project_cache not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "invalidate_project_cache failed");
  }
}

/** List build batches. */
export async function listBuildBatches(): Promise<ListBuildBatchesResult> {
  try {
    // TODO: implement list_build_batches
    throw new Error("list_build_batches not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_build_batches failed");
  }
}

/** List build batches for project. */
export async function listBuildBatchesForProject(): Promise<ListBuildBatchesForProjectResult> {
  try {
    // TODO: implement list_build_batches_for_project
    throw new Error("list_build_batches_for_project not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_build_batches_for_project failed");
  }
}

/** List command executions for sandbox. */
export async function listCommandExecutionsForSandbox(sandboxId: string): Promise<ListCommandExecutionsForSandboxResult> {
  try {
    // TODO: implement list_command_executions_for_sandbox
    throw new Error("list_command_executions_for_sandbox not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_command_executions_for_sandbox failed");
  }
}

/** List curated environment images. */
export async function listCuratedEnvironmentImages(regionName?: string): Promise<ListCuratedEnvironmentImagesResult> {
  try {
    // TODO: implement list_curated_environment_images
    throw new Error("list_curated_environment_images not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_curated_environment_images failed");
  }
}

/** List fleets. */
export async function listFleets(): Promise<ListFleetsResult> {
  try {
    // TODO: implement list_fleets
    throw new Error("list_fleets not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_fleets failed");
  }
}

/** List report groups. */
export async function listReportGroups(): Promise<ListReportGroupsResult> {
  try {
    // TODO: implement list_report_groups
    throw new Error("list_report_groups not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_report_groups failed");
  }
}

/** List reports. */
export async function listReports(): Promise<ListReportsResult> {
  try {
    // TODO: implement list_reports
    throw new Error("list_reports not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_reports failed");
  }
}

/** List reports for report group. */
export async function listReportsForReportGroup(reportGroupArn: string): Promise<ListReportsForReportGroupResult> {
  try {
    // TODO: implement list_reports_for_report_group
    throw new Error("list_reports_for_report_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_reports_for_report_group failed");
  }
}

/** List sandboxes. */
export async function listSandboxes(): Promise<ListSandboxesResult> {
  try {
    // TODO: implement list_sandboxes
    throw new Error("list_sandboxes not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_sandboxes failed");
  }
}

/** List sandboxes for project. */
export async function listSandboxesForProject(projectName: string): Promise<ListSandboxesForProjectResult> {
  try {
    // TODO: implement list_sandboxes_for_project
    throw new Error("list_sandboxes_for_project not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_sandboxes_for_project failed");
  }
}

/** List shared projects. */
export async function listSharedProjects(): Promise<ListSharedProjectsResult> {
  try {
    // TODO: implement list_shared_projects
    throw new Error("list_shared_projects not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_shared_projects failed");
  }
}

/** List shared report groups. */
export async function listSharedReportGroups(): Promise<ListSharedReportGroupsResult> {
  try {
    // TODO: implement list_shared_report_groups
    throw new Error("list_shared_report_groups not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_shared_report_groups failed");
  }
}

/** List source credentials. */
export async function listSourceCredentials(regionName?: string): Promise<ListSourceCredentialsResult> {
  try {
    // TODO: implement list_source_credentials
    throw new Error("list_source_credentials not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_source_credentials failed");
  }
}

/** Put resource policy. */
export async function putResourcePolicy(policy: string, resourceArn: string, regionName?: string): Promise<PutResourcePolicyResult> {
  try {
    // TODO: implement put_resource_policy
    throw new Error("put_resource_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_resource_policy failed");
  }
}

/** Retry build batch. */
export async function retryBuildBatch(): Promise<RetryBuildBatchResult> {
  try {
    // TODO: implement retry_build_batch
    throw new Error("retry_build_batch not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "retry_build_batch failed");
  }
}

/** Start build batch. */
export async function startBuildBatch(projectName: string): Promise<StartBuildBatchResult> {
  try {
    // TODO: implement start_build_batch
    throw new Error("start_build_batch not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_build_batch failed");
  }
}

/** Start command execution. */
export async function startCommandExecution(sandboxId: string, command: string): Promise<StartCommandExecutionResult> {
  try {
    // TODO: implement start_command_execution
    throw new Error("start_command_execution not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_command_execution failed");
  }
}

/** Start sandbox. */
export async function startSandbox(): Promise<StartSandboxResult> {
  try {
    // TODO: implement start_sandbox
    throw new Error("start_sandbox not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_sandbox failed");
  }
}

/** Start sandbox connection. */
export async function startSandboxConnection(sandboxId: string, regionName?: string): Promise<StartSandboxConnectionResult> {
  try {
    // TODO: implement start_sandbox_connection
    throw new Error("start_sandbox_connection not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_sandbox_connection failed");
  }
}

/** Stop build batch. */
export async function stopBuildBatch(id: string, regionName?: string): Promise<StopBuildBatchResult> {
  try {
    // TODO: implement stop_build_batch
    throw new Error("stop_build_batch not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "stop_build_batch failed");
  }
}

/** Stop sandbox. */
export async function stopSandbox(id: string, regionName?: string): Promise<StopSandboxResult> {
  try {
    // TODO: implement stop_sandbox
    throw new Error("stop_sandbox not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "stop_sandbox failed");
  }
}

/** Update fleet. */
export async function updateFleet(arn: string): Promise<UpdateFleetResult> {
  try {
    // TODO: implement update_fleet
    throw new Error("update_fleet not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_fleet failed");
  }
}

/** Update project visibility. */
export async function updateProjectVisibility(projectArn: string, projectVisibility: string): Promise<UpdateProjectVisibilityResult> {
  try {
    // TODO: implement update_project_visibility
    throw new Error("update_project_visibility not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_project_visibility failed");
  }
}

/** Update report group. */
export async function updateReportGroup(arn: string): Promise<UpdateReportGroupResult> {
  try {
    // TODO: implement update_report_group
    throw new Error("update_report_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_report_group failed");
  }
}

/** Update webhook. */
export async function updateWebhook(projectName: string): Promise<UpdateWebhookResult> {
  try {
    // TODO: implement update_webhook
    throw new Error("update_webhook not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_webhook failed");
  }
}
