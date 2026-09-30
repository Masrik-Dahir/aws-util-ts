import { EmrServerlessClient } from "@aws-sdk/client-emr-serverless";
import { getClient } from "./client";
import { wrapAwsError } from "./exceptions";

/** Metadata for an EMR Serverless application. */
export type ApplicationResult = {
  applicationId: string;
  name: string;
  arn?: string;
  state?: string;
  releaseLabel?: string;
  type?: string;
  createdAt?: string;
  updatedAt?: string;
  tags?: Record<string, unknown>;
  extra?: Record<string, unknown>;
};

/** Metadata for an EMR Serverless job run. */
export type JobRunResult = {
  applicationId: string;
  jobRunId: string;
  name?: string;
  arn?: string;
  state?: string;
  stateDetails?: string;
  createdAt?: string;
  updatedAt?: string;
  executionRole?: string;
  extra?: Record<string, unknown>;
};

/** Result of get_dashboard_for_job_run. */
export type GetDashboardForJobRunResult = {
  url?: string;
};

/** Result of list_job_run_attempts. */
export type ListJobRunAttemptsResult = {
  jobRunAttempts?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_tags_for_resource. */
export type ListTagsForResourceResult = {
  tags?: Record<string, unknown>;
};

/** Create an EMR Serverless application. */
export async function createApplication(name: string): Promise<ApplicationResult> {
  try {
    // TODO: implement create_application
    throw new Error("create_application not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_application failed");
  }
}

/** Get details of an EMR Serverless application. */
export async function getApplication(applicationId: string): Promise<ApplicationResult> {
  try {
    // TODO: implement get_application
    throw new Error("get_application not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_application failed");
  }
}

/** List all EMR Serverless applications. */
export async function listApplications(): Promise<ApplicationResult[]> {
  try {
    // TODO: implement list_applications
    throw new Error("list_applications not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_applications failed");
  }
}

/** Delete an EMR Serverless application. */
export async function deleteApplication(applicationId: string): Promise<Record<string, unknown>> {
  try {
    // TODO: implement delete_application
    throw new Error("delete_application not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_application failed");
  }
}

/** Update an EMR Serverless application. */
export async function updateApplication(applicationId: string): Promise<ApplicationResult> {
  try {
    // TODO: implement update_application
    throw new Error("update_application not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_application failed");
  }
}

/** Start a job run on an EMR Serverless application. */
export async function startJobRun(applicationId: string): Promise<JobRunResult> {
  try {
    // TODO: implement start_job_run
    throw new Error("start_job_run not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_job_run failed");
  }
}

/** Get details of an EMR Serverless job run. */
export async function getJobRun(applicationId: string, jobRunId: string): Promise<JobRunResult> {
  try {
    // TODO: implement get_job_run
    throw new Error("get_job_run not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_job_run failed");
  }
}

/** List job runs for an EMR Serverless application. */
export async function listJobRuns(applicationId: string): Promise<JobRunResult[]> {
  try {
    // TODO: implement list_job_runs
    throw new Error("list_job_runs not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_job_runs failed");
  }
}

/** Cancel an EMR Serverless job run. */
export async function cancelJobRun(applicationId: string, jobRunId: string): Promise<Record<string, unknown>> {
  try {
    // TODO: implement cancel_job_run
    throw new Error("cancel_job_run not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "cancel_job_run failed");
  }
}

/** Get dashboard for job run. */
export async function getDashboardForJobRun(applicationId: string, jobRunId: string): Promise<GetDashboardForJobRunResult> {
  try {
    // TODO: implement get_dashboard_for_job_run
    throw new Error("get_dashboard_for_job_run not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_dashboard_for_job_run failed");
  }
}

/** List job run attempts. */
export async function listJobRunAttempts(applicationId: string, jobRunId: string): Promise<ListJobRunAttemptsResult> {
  try {
    // TODO: implement list_job_run_attempts
    throw new Error("list_job_run_attempts not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_job_run_attempts failed");
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

/** Start application. */
export async function startApplication(applicationId: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement start_application
    throw new Error("start_application not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_application failed");
  }
}

/** Stop application. */
export async function stopApplication(applicationId: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement stop_application
    throw new Error("stop_application not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "stop_application failed");
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
