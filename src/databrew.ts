import { DatabrewClient } from "@aws-sdk/client-databrew";
import { getClient } from "./client";
import { wrapAwsError } from "./exceptions";

/** Metadata for a DataBrew dataset. */
export type DatasetResult = {
  name: string;
  accountId?: string;
  createdBy?: string;
  createDate?: string;
  format?: string;
  input?: Record<string, unknown>;
  tags?: Record<string, unknown>;
  extra?: Record<string, unknown>;
};

/** Metadata for a DataBrew project. */
export type ProjectResult = {
  name: string;
  accountId?: string;
  recipeName?: string;
  datasetName?: string;
  roleArn?: string;
  createDate?: string;
  tags?: Record<string, unknown>;
  extra?: Record<string, unknown>;
};

/** Metadata for a DataBrew recipe. */
export type RecipeResult = {
  name: string;
  recipeVersion?: string;
  description?: string;
  steps?: Record<string, unknown>[];
  createDate?: string;
  tags?: Record<string, unknown>;
  extra?: Record<string, unknown>;
};

/** Metadata for a DataBrew job. */
export type JobResult = {
  name: string;
  type?: string;
  datasetName?: string;
  roleArn?: string;
  outputs?: Record<string, unknown>[];
  createDate?: string;
  tags?: Record<string, unknown>;
  extra?: Record<string, unknown>;
};

/** Metadata for a DataBrew job run. */
export type JobRunResult = {
  runId: string;
  jobName?: string;
  state?: string;
  startedOn?: string;
  completedOn?: string;
  errorMessage?: string;
  extra?: Record<string, unknown>;
};

/** Result of batch_delete_recipe_version. */
export type BatchDeleteRecipeVersionResult = {
  name?: string;
  errors?: Record<string, unknown>[];
};

/** Result of create_profile_job. */
export type CreateProfileJobResult = {
  name?: string;
};

/** Result of create_ruleset. */
export type CreateRulesetResult = {
  name?: string;
};

/** Result of create_schedule. */
export type CreateScheduleResult = {
  name?: string;
};

/** Result of delete_job. */
export type DeleteJobResult = {
  name?: string;
};

/** Result of delete_recipe_version. */
export type DeleteRecipeVersionResult = {
  name?: string;
  recipeVersion?: string;
};

/** Result of delete_ruleset. */
export type DeleteRulesetResult = {
  name?: string;
};

/** Result of delete_schedule. */
export type DeleteScheduleResult = {
  name?: string;
};

/** Result of describe_job_run. */
export type DescribeJobRunResult = {
  attempt?: number;
  completedOn?: string;
  datasetName?: string;
  errorMessage?: string;
  executionTime?: number;
  jobName?: string;
  profileConfiguration?: Record<string, unknown>;
  validationConfigurations?: Record<string, unknown>[];
  runId?: string;
  state?: string;
  logSubscription?: string;
  logGroupName?: string;
  outputs?: Record<string, unknown>[];
  dataCatalogOutputs?: Record<string, unknown>[];
  databaseOutputs?: Record<string, unknown>[];
  recipeReference?: Record<string, unknown>;
  startedBy?: string;
  startedOn?: string;
  jobSample?: Record<string, unknown>;
};

/** Result of describe_recipe. */
export type DescribeRecipeResult = {
  createdBy?: string;
  createDate?: string;
  lastModifiedBy?: string;
  lastModifiedDate?: string;
  projectName?: string;
  publishedBy?: string;
  publishedDate?: string;
  description?: string;
  name?: string;
  steps?: Record<string, unknown>[];
  tags?: Record<string, unknown>;
  resourceArn?: string;
  recipeVersion?: string;
};

/** Result of describe_ruleset. */
export type DescribeRulesetResult = {
  name?: string;
  description?: string;
  targetArn?: string;
  rules?: Record<string, unknown>[];
  createDate?: string;
  createdBy?: string;
  lastModifiedBy?: string;
  lastModifiedDate?: string;
  resourceArn?: string;
  tags?: Record<string, unknown>;
};

/** Result of describe_schedule. */
export type DescribeScheduleResult = {
  createDate?: string;
  createdBy?: string;
  jobNames?: string[];
  lastModifiedBy?: string;
  lastModifiedDate?: string;
  resourceArn?: string;
  cronExpression?: string;
  tags?: Record<string, unknown>;
  name?: string;
};

/** Result of list_recipe_versions. */
export type ListRecipeVersionsResult = {
  nextToken?: string;
  recipes?: Record<string, unknown>[];
};

/** Result of list_rulesets. */
export type ListRulesetsResult = {
  rulesets?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_schedules. */
export type ListSchedulesResult = {
  schedules?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_tags_for_resource. */
export type ListTagsForResourceResult = {
  tags?: Record<string, unknown>;
};

/** Result of publish_recipe. */
export type PublishRecipeResult = {
  name?: string;
};

/** Result of send_project_session_action. */
export type SendProjectSessionActionResult = {
  result?: string;
  name?: string;
  actionId?: number;
};

/** Result of start_project_session. */
export type StartProjectSessionResult = {
  name?: string;
  clientSessionId?: string;
};

/** Result of stop_job_run. */
export type StopJobRunResult = {
  runId?: string;
};

/** Result of update_dataset. */
export type UpdateDatasetResult = {
  name?: string;
};

/** Result of update_profile_job. */
export type UpdateProfileJobResult = {
  name?: string;
};

/** Result of update_project. */
export type UpdateProjectResult = {
  lastModifiedDate?: string;
  name?: string;
};

/** Result of update_recipe. */
export type UpdateRecipeResult = {
  name?: string;
};

/** Result of update_recipe_job. */
export type UpdateRecipeJobResult = {
  name?: string;
};

/** Result of update_ruleset. */
export type UpdateRulesetResult = {
  name?: string;
};

/** Result of update_schedule. */
export type UpdateScheduleResult = {
  name?: string;
};

/** Create a DataBrew dataset. */
export async function createDataset(name: string): Promise<DatasetResult> {
  try {
    // TODO: implement create_dataset
    throw new Error("create_dataset not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_dataset failed");
  }
}

/** Describe a DataBrew dataset. */
export async function describeDataset(name: string): Promise<DatasetResult> {
  try {
    // TODO: implement describe_dataset
    throw new Error("describe_dataset not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_dataset failed");
  }
}

/** List all DataBrew datasets. */
export async function listDatasets(): Promise<DatasetResult[]> {
  try {
    // TODO: implement list_datasets
    throw new Error("list_datasets not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_datasets failed");
  }
}

/** Delete a DataBrew dataset. */
export async function deleteDataset(name: string): Promise<Record<string, unknown>> {
  try {
    // TODO: implement delete_dataset
    throw new Error("delete_dataset not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_dataset failed");
  }
}

/** Create a DataBrew project. */
export async function createProject(name: string): Promise<ProjectResult> {
  try {
    // TODO: implement create_project
    throw new Error("create_project not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_project failed");
  }
}

/** Describe a DataBrew project. */
export async function describeProject(name: string): Promise<ProjectResult> {
  try {
    // TODO: implement describe_project
    throw new Error("describe_project not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_project failed");
  }
}

/** List all DataBrew projects. */
export async function listProjects(): Promise<ProjectResult[]> {
  try {
    // TODO: implement list_projects
    throw new Error("list_projects not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_projects failed");
  }
}

/** Delete a DataBrew project. */
export async function deleteProject(name: string): Promise<Record<string, unknown>> {
  try {
    // TODO: implement delete_project
    throw new Error("delete_project not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_project failed");
  }
}

/** Create a DataBrew recipe. */
export async function createRecipe(name: string): Promise<RecipeResult> {
  try {
    // TODO: implement create_recipe
    throw new Error("create_recipe not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_recipe failed");
  }
}

/** List all DataBrew recipes. */
export async function listRecipes(): Promise<RecipeResult[]> {
  try {
    // TODO: implement list_recipes
    throw new Error("list_recipes not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_recipes failed");
  }
}

/** Create a DataBrew recipe job. */
export async function createRecipeJob(name: string): Promise<JobResult> {
  try {
    // TODO: implement create_recipe_job
    throw new Error("create_recipe_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_recipe_job failed");
  }
}

/** Describe a DataBrew job. */
export async function describeJob(name: string): Promise<JobResult> {
  try {
    // TODO: implement describe_job
    throw new Error("describe_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_job failed");
  }
}

/** List all DataBrew jobs. */
export async function listJobs(): Promise<JobResult[]> {
  try {
    // TODO: implement list_jobs
    throw new Error("list_jobs not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_jobs failed");
  }
}

/** Start a DataBrew job run. */
export async function startJobRun(name: string): Promise<string> {
  try {
    // TODO: implement start_job_run
    throw new Error("start_job_run not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_job_run failed");
  }
}

/** List runs for a DataBrew job. */
export async function listJobRuns(name: string): Promise<JobRunResult[]> {
  try {
    // TODO: implement list_job_runs
    throw new Error("list_job_runs not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_job_runs failed");
  }
}

/** Batch delete recipe version. */
export async function batchDeleteRecipeVersion(name: string, recipeVersions: string[], regionName?: string): Promise<BatchDeleteRecipeVersionResult> {
  try {
    // TODO: implement batch_delete_recipe_version
    throw new Error("batch_delete_recipe_version not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_delete_recipe_version failed");
  }
}

/** Create profile job. */
export async function createProfileJob(datasetName: string, name: string, outputLocation: Record<string, unknown>, roleArn: string): Promise<CreateProfileJobResult> {
  try {
    // TODO: implement create_profile_job
    throw new Error("create_profile_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_profile_job failed");
  }
}

/** Create ruleset. */
export async function createRuleset(name: string, targetArn: string, rules: Record<string, unknown>[]): Promise<CreateRulesetResult> {
  try {
    // TODO: implement create_ruleset
    throw new Error("create_ruleset not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_ruleset failed");
  }
}

/** Create schedule. */
export async function createSchedule(cronExpression: string, name: string): Promise<CreateScheduleResult> {
  try {
    // TODO: implement create_schedule
    throw new Error("create_schedule not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_schedule failed");
  }
}

/** Delete job. */
export async function deleteJob(name: string, regionName?: string): Promise<DeleteJobResult> {
  try {
    // TODO: implement delete_job
    throw new Error("delete_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_job failed");
  }
}

/** Delete recipe version. */
export async function deleteRecipeVersion(name: string, recipeVersion: string, regionName?: string): Promise<DeleteRecipeVersionResult> {
  try {
    // TODO: implement delete_recipe_version
    throw new Error("delete_recipe_version not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_recipe_version failed");
  }
}

/** Delete ruleset. */
export async function deleteRuleset(name: string, regionName?: string): Promise<DeleteRulesetResult> {
  try {
    // TODO: implement delete_ruleset
    throw new Error("delete_ruleset not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_ruleset failed");
  }
}

/** Delete schedule. */
export async function deleteSchedule(name: string, regionName?: string): Promise<DeleteScheduleResult> {
  try {
    // TODO: implement delete_schedule
    throw new Error("delete_schedule not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_schedule failed");
  }
}

/** Describe job run. */
export async function describeJobRun(name: string, runId: string, regionName?: string): Promise<DescribeJobRunResult> {
  try {
    // TODO: implement describe_job_run
    throw new Error("describe_job_run not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_job_run failed");
  }
}

/** Describe recipe. */
export async function describeRecipe(name: string): Promise<DescribeRecipeResult> {
  try {
    // TODO: implement describe_recipe
    throw new Error("describe_recipe not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_recipe failed");
  }
}

/** Describe ruleset. */
export async function describeRuleset(name: string, regionName?: string): Promise<DescribeRulesetResult> {
  try {
    // TODO: implement describe_ruleset
    throw new Error("describe_ruleset not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_ruleset failed");
  }
}

/** Describe schedule. */
export async function describeSchedule(name: string, regionName?: string): Promise<DescribeScheduleResult> {
  try {
    // TODO: implement describe_schedule
    throw new Error("describe_schedule not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_schedule failed");
  }
}

/** List recipe versions. */
export async function listRecipeVersions(name: string): Promise<ListRecipeVersionsResult> {
  try {
    // TODO: implement list_recipe_versions
    throw new Error("list_recipe_versions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_recipe_versions failed");
  }
}

/** List rulesets. */
export async function listRulesets(): Promise<ListRulesetsResult> {
  try {
    // TODO: implement list_rulesets
    throw new Error("list_rulesets not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_rulesets failed");
  }
}

/** List schedules. */
export async function listSchedules(): Promise<ListSchedulesResult> {
  try {
    // TODO: implement list_schedules
    throw new Error("list_schedules not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_schedules failed");
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

/** Publish recipe. */
export async function publishRecipe(name: string): Promise<PublishRecipeResult> {
  try {
    // TODO: implement publish_recipe
    throw new Error("publish_recipe not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "publish_recipe failed");
  }
}

/** Send project session action. */
export async function sendProjectSessionAction(name: string): Promise<SendProjectSessionActionResult> {
  try {
    // TODO: implement send_project_session_action
    throw new Error("send_project_session_action not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "send_project_session_action failed");
  }
}

/** Start project session. */
export async function startProjectSession(name: string): Promise<StartProjectSessionResult> {
  try {
    // TODO: implement start_project_session
    throw new Error("start_project_session not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_project_session failed");
  }
}

/** Stop job run. */
export async function stopJobRun(name: string, runId: string, regionName?: string): Promise<StopJobRunResult> {
  try {
    // TODO: implement stop_job_run
    throw new Error("stop_job_run not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "stop_job_run failed");
  }
}

/** Tag resource. */
export async function tagResource(resourceArn: string, tags: Record<string, unknown>, regionName?: string): Promise<void> {
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

/** Update dataset. */
export async function updateDataset(name: string, input: Record<string, unknown>): Promise<UpdateDatasetResult> {
  try {
    // TODO: implement update_dataset
    throw new Error("update_dataset not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_dataset failed");
  }
}

/** Update profile job. */
export async function updateProfileJob(name: string, outputLocation: Record<string, unknown>, roleArn: string): Promise<UpdateProfileJobResult> {
  try {
    // TODO: implement update_profile_job
    throw new Error("update_profile_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_profile_job failed");
  }
}

/** Update project. */
export async function updateProject(roleArn: string, name: string): Promise<UpdateProjectResult> {
  try {
    // TODO: implement update_project
    throw new Error("update_project not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_project failed");
  }
}

/** Update recipe. */
export async function updateRecipe(name: string): Promise<UpdateRecipeResult> {
  try {
    // TODO: implement update_recipe
    throw new Error("update_recipe not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_recipe failed");
  }
}

/** Update recipe job. */
export async function updateRecipeJob(name: string, roleArn: string): Promise<UpdateRecipeJobResult> {
  try {
    // TODO: implement update_recipe_job
    throw new Error("update_recipe_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_recipe_job failed");
  }
}

/** Update ruleset. */
export async function updateRuleset(name: string, rules: Record<string, unknown>[]): Promise<UpdateRulesetResult> {
  try {
    // TODO: implement update_ruleset
    throw new Error("update_ruleset not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_ruleset failed");
  }
}

/** Update schedule. */
export async function updateSchedule(cronExpression: string, name: string): Promise<UpdateScheduleResult> {
  try {
    // TODO: implement update_schedule
    throw new Error("update_schedule not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_schedule failed");
  }
}
