/**
 * aws-util/stepfunctions — High-level AWS Step Functions utilities.
 *
 * Provides typed helpers for starting, stopping, and polling Step Functions
 * executions, listing state machines, and retrieving execution history.
 *
 * All functions obtain an SFNClient via {@link getClient} and wrap errors
 * through {@link wrapAwsError}.
 *
 * @example
 * ```ts
 * import { runAndWait, listStateMachines } from "./stepfunctions.js";
 *
 * const execution = await runAndWait(
 *   "arn:aws:states:us-east-1:123:stateMachine:my-sm",
 *   { orderId: "abc" },
 * );
 * console.log(execution.status, execution.output);
 * ```
 *
 * @module
 */

import { z } from "zod";
import {
  SFNClient,
  StartExecutionCommand,
  DescribeExecutionCommand,
  StopExecutionCommand,
  ListStateMachinesCommand,
  ListExecutionsCommand,
  GetExecutionHistoryCommand,
} from "@aws-sdk/client-sfn";
import { getClient } from "./client.js";
import { wrapAwsError, AwsTimeoutError } from "./exceptions.js";

// ---------------------------------------------------------------------------
// Zod schemas & inferred types
// ---------------------------------------------------------------------------

/** Schema for a Step Functions execution. */
export const SFNExecutionSchema = z.object({
  executionArn: z.string(),
  stateMachineArn: z.string(),
  name: z.string(),
  status: z.string(),
  startDate: z.date().optional(),
  stopDate: z.date().optional(),
  input: z.string().optional(),
  output: z.string().optional(),
});

/** A Step Functions execution descriptor. */
export type SFNExecution = z.infer<typeof SFNExecutionSchema>;

/** Schema for a Step Functions state machine. */
export const StateMachineSchema = z.object({
  stateMachineArn: z.string(),
  name: z.string(),
  status: z.string(),
  type: z.string(),
  creationDate: z.date().optional(),
});

/** A Step Functions state machine descriptor. */
export type StateMachine = z.infer<typeof StateMachineSchema>;

// ---------------------------------------------------------------------------
// Terminal execution states
// ---------------------------------------------------------------------------

/** Execution statuses that indicate a terminal state. */
const TERMINAL_STATUSES = new Set([
  "SUCCEEDED",
  "FAILED",
  "TIMED_OUT",
  "ABORTED",
]);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Get a cached SFNClient for the given region.
 */
function sfn(region?: string): SFNClient {
  return getClient(SFNClient, region);
}

/**
 * Serialize execution input: objects are JSON-stringified, strings pass through.
 */
function serializeInput(input: string | object | undefined): string | undefined {
  if (input === undefined) {
    return undefined;
  }
  return typeof input === "string" ? input : JSON.stringify(input);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Start a new execution of a Step Functions state machine.
 *
 * @param stateMachineArn - The ARN of the state machine to execute.
 * @param input - Execution input (string or JSON-serializable object).
 * @param name - Optional execution name (must be unique within the state machine).
 * @param region - AWS region override.
 * @returns The execution ARN and start date.
 */
export async function startExecution(
  stateMachineArn: string,
  input?: string | object,
  name?: string,
  region?: string,
): Promise<{ executionArn: string; startDate: Date }> {
  try {
    const res = await sfn(region).send(
      new StartExecutionCommand({
        stateMachineArn,
        input: serializeInput(input),
        name,
      }),
    );
    return {
      executionArn: res.executionArn!,
      startDate: res.startDate!,
    };
  } catch (err: unknown) {
    throw wrapAwsError(err, `startExecution(${stateMachineArn})`);
  }
}

/**
 * Describe a Step Functions execution.
 *
 * @param executionArn - The ARN of the execution to describe.
 * @param region - AWS region override.
 * @returns The execution details parsed through {@link SFNExecutionSchema}.
 */
export async function describeExecution(
  executionArn: string,
  region?: string,
): Promise<SFNExecution> {
  try {
    const res = await sfn(region).send(
      new DescribeExecutionCommand({ executionArn }),
    );
    return SFNExecutionSchema.parse({
      executionArn: res.executionArn,
      stateMachineArn: res.stateMachineArn,
      name: res.name,
      status: res.status,
      startDate: res.startDate,
      stopDate: res.stopDate,
      input: res.input,
      output: res.output,
    });
  } catch (err: unknown) {
    throw wrapAwsError(err, `describeExecution(${executionArn})`);
  }
}

/**
 * Stop a running Step Functions execution.
 *
 * @param executionArn - The ARN of the execution to stop.
 * @param error - Optional error code.
 * @param cause - Optional human-readable cause.
 * @param region - AWS region override.
 */
export async function stopExecution(
  executionArn: string,
  error?: string,
  cause?: string,
  region?: string,
): Promise<void> {
  try {
    await sfn(region).send(
      new StopExecutionCommand({
        executionArn,
        error,
        cause,
      }),
    );
  } catch (err: unknown) {
    throw wrapAwsError(err, `stopExecution(${executionArn})`);
  }
}

/**
 * Poll a Step Functions execution until it reaches a terminal state.
 *
 * Terminal states are SUCCEEDED, FAILED, TIMED_OUT, and ABORTED.
 *
 * @param executionArn - The ARN of the execution to monitor.
 * @param timeout - Maximum wait time in milliseconds (default 300 000 = 5 min).
 * @param pollInterval - Delay between polls in milliseconds (default 5 000).
 * @param region - AWS region override.
 * @returns The final execution state.
 * @throws {AwsTimeoutError} If the execution does not complete within the timeout.
 */
export async function waitForExecution(
  executionArn: string,
  timeout?: number,
  pollInterval?: number,
  region?: string,
): Promise<SFNExecution> {
  const effectiveTimeout = timeout ?? 300_000;
  const effectivePollInterval = pollInterval ?? 5_000;
  const deadline = Date.now() + effectiveTimeout;

  while (Date.now() < deadline) {
    const execution = await describeExecution(executionArn, region);
    if (TERMINAL_STATUSES.has(execution.status)) {
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
    `waitForExecution(${executionArn}) timed out after ${effectiveTimeout}ms`,
  );
}

/**
 * Start a Step Functions execution and wait for it to complete.
 *
 * Combines {@link startExecution} and {@link waitForExecution} into a
 * single convenience call.
 *
 * @param stateMachineArn - The ARN of the state machine to execute.
 * @param input - Execution input (string or JSON-serializable object).
 * @param name - Optional execution name.
 * @param timeout - Maximum wait time in milliseconds (default 300 000).
 * @param pollInterval - Delay between polls in milliseconds (default 5 000).
 * @param region - AWS region override.
 * @returns The final execution state.
 */
export async function runAndWait(
  stateMachineArn: string,
  input?: string | object,
  name?: string,
  timeout?: number,
  pollInterval?: number,
  region?: string,
): Promise<SFNExecution> {
  const { executionArn } = await startExecution(
    stateMachineArn,
    input,
    name,
    region,
  );
  return waitForExecution(executionArn, timeout, pollInterval, region);
}

/**
 * List all state machines in the account, auto-paginating through all pages.
 *
 * @param region - AWS region override.
 * @returns An array of {@link StateMachine} entries.
 */
export async function listStateMachines(
  region?: string,
): Promise<StateMachine[]> {
  const results: StateMachine[] = [];
  let nextToken: string | undefined;

  try {
    do {
      const res = await sfn(region).send(
        new ListStateMachinesCommand({ nextToken }),
      );
      for (const sm of res.stateMachines ?? []) {
        results.push(
          StateMachineSchema.parse({
            stateMachineArn: sm.stateMachineArn,
            name: sm.name,
            status: "ACTIVE",
            type: sm.type ?? "STANDARD",
            creationDate: sm.creationDate,
          }),
        );
      }
      nextToken = res.nextToken;
    } while (nextToken);
  } catch (err: unknown) {
    throw wrapAwsError(err, "listStateMachines");
  }

  return results;
}

/**
 * List executions for a state machine, auto-paginating through all pages.
 *
 * @param stateMachineArn - The ARN of the state machine.
 * @param statusFilter - Optional status filter (e.g. "RUNNING", "SUCCEEDED").
 * @param region - AWS region override.
 * @returns An array of {@link SFNExecution} entries.
 */
export async function listExecutions(
  stateMachineArn: string,
  statusFilter?: string,
  region?: string,
): Promise<SFNExecution[]> {
  const results: SFNExecution[] = [];
  let nextToken: string | undefined;

  try {
    do {
      const res = await sfn(region).send(
        new ListExecutionsCommand({
          stateMachineArn,
          statusFilter: statusFilter as
            | "RUNNING"
            | "SUCCEEDED"
            | "FAILED"
            | "TIMED_OUT"
            | "ABORTED"
            | "PENDING_REDRIVE"
            | undefined,
          nextToken,
        }),
      );
      for (const exec of res.executions ?? []) {
        results.push(
          SFNExecutionSchema.parse({
            executionArn: exec.executionArn,
            stateMachineArn: exec.stateMachineArn,
            name: exec.name,
            status: exec.status,
            startDate: exec.startDate,
            stopDate: exec.stopDate,
            input: undefined,
            output: undefined,
          }),
        );
      }
      nextToken = res.nextToken;
    } while (nextToken);
  } catch (err: unknown) {
    throw wrapAwsError(err, `listExecutions(${stateMachineArn})`);
  }

  return results;
}

/**
 * Retrieve the full execution history for a Step Functions execution,
 * auto-paginating through all pages.
 *
 * @param executionArn - The ARN of the execution.
 * @param region - AWS region override.
 * @returns An array of history events with timestamp, type, id, and optional details.
 */
export async function getExecutionHistory(
  executionArn: string,
  region?: string,
): Promise<
  Array<{
    timestamp: Date;
    type: string;
    id: number;
    previousEventId?: number;
    details?: Record<string, unknown>;
  }>
> {
  const results: Array<{
    timestamp: Date;
    type: string;
    id: number;
    previousEventId?: number;
    details?: Record<string, unknown>;
  }> = [];
  let nextToken: string | undefined;

  try {
    do {
      const res = await sfn(region).send(
        new GetExecutionHistoryCommand({
          executionArn,
          nextToken,
        }),
      );
      for (const event of res.events ?? []) {
        // Collect any non-standard fields as "details"
        const details: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(event)) {
          if (
            !["timestamp", "type", "id", "previousEventId"].includes(key) &&
            value !== undefined
          ) {
            details[key] = value;
          }
        }
        results.push({
          timestamp: event.timestamp!,
          type: event.type ?? "Unknown",
          id: event.id ?? 0,
          previousEventId: event.previousEventId ?? undefined,
          details:
            Object.keys(details).length > 0 ? details : undefined,
        });
      }
      nextToken = res.nextToken;
    } while (nextToken);
  } catch (err: unknown) {
    throw wrapAwsError(err, `getExecutionHistory(${executionArn})`);
  }

  return results;
}

// ---------------------------------------------------------------------------
// Additional types (auto-generated)
// ---------------------------------------------------------------------------

/** Result of create_activity. */
export type CreateActivityResult = {
  activityArn?: string | undefined;
  creationDate?: string | undefined;
};

/** Result of create_state_machine. */
export type CreateStateMachineResult = {
  stateMachineArn?: string | undefined;
  creationDate?: string | undefined;
  stateMachineVersionArn?: string | undefined;
};

/** Result of create_state_machine_alias. */
export type CreateStateMachineAliasResult = {
  stateMachineAliasArn?: string | undefined;
  creationDate?: string | undefined;
};

/** Result of describe_activity. */
export type DescribeActivityResult = {
  activityArn?: string | undefined;
  name?: string | undefined;
  creationDate?: string | undefined;
  encryptionConfiguration?: Record<string, unknown>;
};

/** Result of describe_map_run. */
export type DescribeMapRunResult = {
  mapRunArn?: string | undefined;
  executionArn?: string | undefined;
  status?: string | undefined;
  startDate?: string | undefined;
  stopDate?: string | undefined;
  maxConcurrency?: number | undefined;
  toleratedFailurePercentage?: number | undefined;
  toleratedFailureCount?: number | undefined;
  itemCounts?: Record<string, unknown>;
  executionCounts?: Record<string, unknown>;
  redriveCount?: number | undefined;
  redriveDate?: string | undefined;
};

/** Result of describe_state_machine. */
export type DescribeStateMachineResult = {
  stateMachineArn?: string | undefined;
  name?: string | undefined;
  status?: string | undefined;
  definition?: string | undefined;
  roleArn?: string | undefined;
  typeValue?: string | undefined;
  creationDate?: string | undefined;
  loggingConfiguration?: Record<string, unknown>;
  tracingConfiguration?: Record<string, unknown>;
  label?: string | undefined;
  revisionId?: string | undefined;
  description?: string | undefined;
  encryptionConfiguration?: Record<string, unknown>;
  variableReferences?: Record<string, unknown>;
};

/** Result of describe_state_machine_alias. */
export type DescribeStateMachineAliasResult = {
  stateMachineAliasArn?: string | undefined;
  name?: string | undefined;
  description?: string | undefined;
  routingConfiguration?: Record<string, unknown>[];
  creationDate?: string | undefined;
  updateDate?: string | undefined;
};

/** Result of describe_state_machine_for_execution. */
export type DescribeStateMachineForExecutionResult = {
  stateMachineArn?: string | undefined;
  name?: string | undefined;
  definition?: string | undefined;
  roleArn?: string | undefined;
  updateDate?: string | undefined;
  loggingConfiguration?: Record<string, unknown>;
  tracingConfiguration?: Record<string, unknown>;
  mapRunArn?: string | undefined;
  label?: string | undefined;
  revisionId?: string | undefined;
  encryptionConfiguration?: Record<string, unknown>;
  variableReferences?: Record<string, unknown>;
};

/** Result of get_activity_task. */
export type GetActivityTaskResult = {
  taskToken?: string | undefined;
  input?: string | undefined;
};

/** Result of list_activities. */
export type ListActivitiesResult = {
  activities?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_map_runs. */
export type ListMapRunsResult = {
  mapRuns?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_state_machine_aliases. */
export type ListStateMachineAliasesResult = {
  stateMachineAliases?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_state_machine_versions. */
export type ListStateMachineVersionsResult = {
  stateMachineVersions?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_tags_for_resource. */
export type ListTagsForResourceResult = {
  tags?: Record<string, unknown>[];
};

/** Result of publish_state_machine_version. */
export type PublishStateMachineVersionResult = {
  creationDate?: string | undefined;
  stateMachineVersionArn?: string | undefined;
};

/** Result of redrive_execution. */
export type RedriveExecutionResult = {
  redriveDate?: string | undefined;
};

/** Result of run_state. */
export type RunStateResult = {
  output?: string | undefined;
  error?: string | undefined;
  cause?: string | undefined;
  inspectionData?: Record<string, unknown>;
  nextState?: string | undefined;
  status?: string | undefined;
};

/** Result of start_sync_execution. */
export type StartSyncExecutionResult = {
  executionArn?: string | undefined;
  stateMachineArn?: string | undefined;
  name?: string | undefined;
  startDate?: string | undefined;
  stopDate?: string | undefined;
  status?: string | undefined;
  error?: string | undefined;
  cause?: string | undefined;
  input?: string | undefined;
  inputDetails?: Record<string, unknown>;
  output?: string | undefined;
  outputDetails?: Record<string, unknown>;
  traceHeader?: string | undefined;
  billingDetails?: Record<string, unknown>;
};

/** Result of update_state_machine. */
export type UpdateStateMachineResult = {
  updateDate?: string | undefined;
  revisionId?: string | undefined;
  stateMachineVersionArn?: string | undefined;
};

/** Result of update_state_machine_alias. */
export type UpdateStateMachineAliasResult = {
  updateDate?: string | undefined;
};

/** Result of validate_state_machine_definition. */
export type ValidateStateMachineDefinitionResult = {
  result?: string | undefined;
  diagnostics?: Record<string, unknown>[];
  truncated?: boolean | undefined;
};


// ---------------------------------------------------------------------------
// Additional functions (auto-generated)
// ---------------------------------------------------------------------------

/** Create activity. */
export async function createActivity(name: string): Promise<CreateActivityResult> {
  try {
    // TODO: implement create_activity
    throw new Error("create_activity not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_activity failed");
  }
}

/** Create state machine. */
export async function createStateMachine(name: string, definition: string, roleArn: string): Promise<CreateStateMachineResult> {
  try {
    // TODO: implement create_state_machine
    throw new Error("create_state_machine not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_state_machine failed");
  }
}

/** Create state machine alias. */
export async function createStateMachineAlias(name: string, routingConfiguration: Record<string, unknown>[]): Promise<CreateStateMachineAliasResult> {
  try {
    // TODO: implement create_state_machine_alias
    throw new Error("create_state_machine_alias not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_state_machine_alias failed");
  }
}

/** Delete activity. */
export async function deleteActivity(activityArn: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_activity
    throw new Error("delete_activity not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_activity failed");
  }
}

/** Delete state machine. */
export async function deleteStateMachine(stateMachineArn: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_state_machine
    throw new Error("delete_state_machine not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_state_machine failed");
  }
}

/** Delete state machine alias. */
export async function deleteStateMachineAlias(stateMachineAliasArn: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_state_machine_alias
    throw new Error("delete_state_machine_alias not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_state_machine_alias failed");
  }
}

/** Delete state machine version. */
export async function deleteStateMachineVersion(stateMachineVersionArn: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_state_machine_version
    throw new Error("delete_state_machine_version not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_state_machine_version failed");
  }
}

/** Describe activity. */
export async function describeActivity(activityArn: string, regionName?: string | undefined): Promise<DescribeActivityResult> {
  try {
    // TODO: implement describe_activity
    throw new Error("describe_activity not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_activity failed");
  }
}

/** Describe map run. */
export async function describeMapRun(mapRunArn: string, regionName?: string | undefined): Promise<DescribeMapRunResult> {
  try {
    // TODO: implement describe_map_run
    throw new Error("describe_map_run not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_map_run failed");
  }
}

/** Describe state machine. */
export async function describeStateMachine(stateMachineArn: string): Promise<DescribeStateMachineResult> {
  try {
    // TODO: implement describe_state_machine
    throw new Error("describe_state_machine not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_state_machine failed");
  }
}

/** Describe state machine alias. */
export async function describeStateMachineAlias(stateMachineAliasArn: string, regionName?: string | undefined): Promise<DescribeStateMachineAliasResult> {
  try {
    // TODO: implement describe_state_machine_alias
    throw new Error("describe_state_machine_alias not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_state_machine_alias failed");
  }
}

/** Describe state machine for execution. */
export async function describeStateMachineForExecution(executionArn: string): Promise<DescribeStateMachineForExecutionResult> {
  try {
    // TODO: implement describe_state_machine_for_execution
    throw new Error("describe_state_machine_for_execution not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_state_machine_for_execution failed");
  }
}

/** Get activity task. */
export async function getActivityTask(activityArn: string): Promise<GetActivityTaskResult> {
  try {
    // TODO: implement get_activity_task
    throw new Error("get_activity_task not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_activity_task failed");
  }
}

/** List activities. */
export async function listActivities(): Promise<ListActivitiesResult> {
  try {
    // TODO: implement list_activities
    throw new Error("list_activities not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_activities failed");
  }
}

/** List map runs. */
export async function listMapRuns(executionArn: string): Promise<ListMapRunsResult> {
  try {
    // TODO: implement list_map_runs
    throw new Error("list_map_runs not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_map_runs failed");
  }
}

/** List state machine aliases. */
export async function listStateMachineAliases(stateMachineArn: string): Promise<ListStateMachineAliasesResult> {
  try {
    // TODO: implement list_state_machine_aliases
    throw new Error("list_state_machine_aliases not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_state_machine_aliases failed");
  }
}

/** List state machine versions. */
export async function listStateMachineVersions(stateMachineArn: string): Promise<ListStateMachineVersionsResult> {
  try {
    // TODO: implement list_state_machine_versions
    throw new Error("list_state_machine_versions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_state_machine_versions failed");
  }
}

/** List tags for resource. */
export async function listTagsForResource(resourceArn: string, regionName?: string | undefined): Promise<ListTagsForResourceResult> {
  try {
    // TODO: implement list_tags_for_resource
    throw new Error("list_tags_for_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_tags_for_resource failed");
  }
}

/** Publish state machine version. */
export async function publishStateMachineVersion(stateMachineArn: string): Promise<PublishStateMachineVersionResult> {
  try {
    // TODO: implement publish_state_machine_version
    throw new Error("publish_state_machine_version not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "publish_state_machine_version failed");
  }
}

/** Redrive execution. */
export async function redriveExecution(executionArn: string): Promise<RedriveExecutionResult> {
  try {
    // TODO: implement redrive_execution
    throw new Error("redrive_execution not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "redrive_execution failed");
  }
}

/** Run state. */
export async function runState(definition: string): Promise<RunStateResult> {
  try {
    // TODO: implement run_state
    throw new Error("run_state not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "run_state failed");
  }
}

/** Send task failure. */
export async function sendTaskFailure(taskToken: string): Promise<void> {
  try {
    // TODO: implement send_task_failure
    throw new Error("send_task_failure not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "send_task_failure failed");
  }
}

/** Send task heartbeat. */
export async function sendTaskHeartbeat(taskToken: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement send_task_heartbeat
    throw new Error("send_task_heartbeat not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "send_task_heartbeat failed");
  }
}

/** Send task success. */
export async function sendTaskSuccess(taskToken: string, output: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement send_task_success
    throw new Error("send_task_success not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "send_task_success failed");
  }
}

/** Start sync execution. */
export async function startSyncExecution(stateMachineArn: string): Promise<StartSyncExecutionResult> {
  try {
    // TODO: implement start_sync_execution
    throw new Error("start_sync_execution not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_sync_execution failed");
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

/** Untag resource. */
export async function untagResource(resourceArn: string, tagKeys: string[], regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement untag_resource
    throw new Error("untag_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "untag_resource failed");
  }
}

/** Update map run. */
export async function updateMapRun(mapRunArn: string): Promise<void> {
  try {
    // TODO: implement update_map_run
    throw new Error("update_map_run not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_map_run failed");
  }
}

/** Update state machine. */
export async function updateStateMachine(stateMachineArn: string): Promise<UpdateStateMachineResult> {
  try {
    // TODO: implement update_state_machine
    throw new Error("update_state_machine not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_state_machine failed");
  }
}

/** Update state machine alias. */
export async function updateStateMachineAlias(stateMachineAliasArn: string): Promise<UpdateStateMachineAliasResult> {
  try {
    // TODO: implement update_state_machine_alias
    throw new Error("update_state_machine_alias not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_state_machine_alias failed");
  }
}

/** Validate state machine definition. */
export async function validateStateMachineDefinition(definition: string): Promise<ValidateStateMachineDefinitionResult> {
  try {
    // TODO: implement validate_state_machine_definition
    throw new Error("validate_state_machine_definition not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "validate_state_machine_definition failed");
  }
}
