/**
 * aws-util/event-orchestration — Event-driven workflow orchestration.
 *
 * Multi-service module combining EventBridge + Step Functions + Lambda + SQS +
 * DynamoDB + Scheduler + Pipes to provide rule management, scheduling,
 * workflow execution, saga orchestration, fan-out/fan-in, event replay,
 * pipe management, and event source mappings.
 *
 * All async functions obtain clients via {@link getClient} and wrap errors
 * through {@link wrapAwsError}.
 *
 * @example
 * ```ts
 * import {
 *   createEventbridgeRule,
 *   runWorkflow,
 *   sagaOrchestrator,
 *   createSchedule,
 * } from "./event-orchestration.js";
 *
 * const rule = await createEventbridgeRule("my-rule", "rate(5 minutes)");
 * const result = await runWorkflow("arn:aws:states:...:my-sm", { key: "value" });
 * ```
 *
 * @module
 */

import { z } from "zod";
import {
  EventBridgeClient,
  PutRuleCommand,
  PutTargetsCommand,
  RemoveTargetsCommand,
  ListTargetsByRuleCommand,
  DeleteRuleCommand,
  StartReplayCommand,
  DescribeReplayCommand,
} from "@aws-sdk/client-eventbridge";
import {
  SFNClient,
  StartExecutionCommand,
  DescribeExecutionCommand,
} from "@aws-sdk/client-sfn";
import {
  SQSClient,
  SendMessageBatchCommand,
} from "@aws-sdk/client-sqs";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
} from "@aws-sdk/lib-dynamodb";
import {
  SchedulerClient,
  CreateScheduleCommand,
  DeleteScheduleCommand,
} from "@aws-sdk/client-scheduler";
import {
  PipesClient,
  CreatePipeCommand,
  DeletePipeCommand,
} from "@aws-sdk/client-pipes";
import {
  LambdaClient,
  CreateEventSourceMappingCommand,
  DeleteEventSourceMappingCommand,
} from "@aws-sdk/client-lambda";
import { getClient } from "./client.js";
import {
  wrapAwsError,
  AwsTimeoutError,
  AwsServiceError,
} from "./exceptions.js";

// ---------------------------------------------------------------------------
// Zod schemas & inferred types
// ---------------------------------------------------------------------------

/** Schema for an EventBridge rule result. */
export const EventBridgeRuleResultSchema = z.object({
  ruleArn: z.string().optional(),
  ruleName: z.string(),
  state: z.string(),
});

/** An EventBridge rule result. */
export type EventBridgeRuleResult = z.infer<
  typeof EventBridgeRuleResultSchema
>;

/** Schema for an EventBridge Scheduler schedule result. */
export const ScheduleResultSchema = z.object({
  scheduleArn: z.string(),
  scheduleName: z.string(),
});

/** A schedule result. */
export type ScheduleResult = z.infer<typeof ScheduleResultSchema>;

/** Schema for an EventBridge Pipes pipe result. */
export const PipeResultSchema = z.object({
  pipeArn: z.string(),
  pipeName: z.string(),
  state: z.string(),
});

/** A pipe result. */
export type PipeResult = z.infer<typeof PipeResultSchema>;

/** Schema for a Step Functions workflow execution result. */
export const WorkflowResultSchema = z.object({
  executionArn: z.string(),
  status: z.string(),
  output: z.string().optional(),
});

/** A workflow execution result. */
export type WorkflowResult = z.infer<typeof WorkflowResultSchema>;

/** Schema for a single saga step result. */
export const SagaStepResultSchema = z.object({
  stepName: z.string(),
  status: z.string(),
  output: z.unknown().optional(),
  error: z.string().optional(),
});

/** A saga step result. */
export type SagaStepResult = z.infer<typeof SagaStepResultSchema>;

/** Schema for the overall saga orchestration result. */
export const SagaResultSchema = z.object({
  status: z.string(),
  steps: z.array(SagaStepResultSchema),
  compensationsRun: z.number(),
});

/** A saga orchestration result. */
export type SagaResult = z.infer<typeof SagaResultSchema>;

/** Schema for a fan-out/fan-in operation result. */
export const FanOutResultSchema = z.object({
  itemsSent: z.number(),
  resultsCollected: z.number(),
});

/** A fan-out/fan-in result. */
export type FanOutResult = z.infer<typeof FanOutResultSchema>;

/** Schema for an event replay result. */
export const EventReplayResultSchema = z.object({
  replayName: z.string(),
  state: z.string(),
  eventSourceArn: z.string().optional(),
});

/** An event replay result. */
export type EventReplayResult = z.infer<
  typeof EventReplayResultSchema
>;

/** Schema for a Lambda event source mapping result. */
export const EventSourceMappingResultSchema = z.object({
  uuid: z.string(),
  functionArn: z.string(),
  eventSourceArn: z.string(),
  state: z.string(),
});

/** An event source mapping result. */
export type EventSourceMappingResult = z.infer<
  typeof EventSourceMappingResultSchema
>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Get a cached EventBridgeClient for the given region.
 */
function eb(region?: string): EventBridgeClient {
  return getClient(EventBridgeClient, region);
}

/**
 * Get a cached SFNClient (Step Functions) for the given region.
 */
function sfn(region?: string): SFNClient {
  return getClient(SFNClient, region);
}

/**
 * Get a cached SQSClient for the given region.
 */
function sqsClient(region?: string): SQSClient {
  return getClient(SQSClient, region);
}

/**
 * Get a cached DynamoDB DocumentClient for the given region.
 */
function ddb(region?: string): DynamoDBDocumentClient {
  return DynamoDBDocumentClient.from(
    getClient(DynamoDBClient, region),
  );
}

/**
 * Get a cached SchedulerClient for the given region.
 */
function scheduler(region?: string): SchedulerClient {
  return getClient(SchedulerClient, region);
}

/**
 * Get a cached PipesClient for the given region.
 */
function pipes(region?: string): PipesClient {
  return getClient(PipesClient, region);
}

/**
 * Get a cached LambdaClient for the given region.
 */
function lambda(region?: string): LambdaClient {
  return getClient(LambdaClient, region);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Create or update an EventBridge rule.
 *
 * Supports both schedule-based and event-pattern-based rules.
 *
 * @param ruleName - The name of the rule.
 * @param scheduleExpression - Optional schedule expression (e.g. `"rate(5 minutes)"`).
 * @param eventPattern - Optional JSON event pattern string.
 * @param state - Rule state: `"ENABLED"` (default) or `"DISABLED"`.
 * @param description - Optional rule description.
 * @param eventBusName - Optional event bus name (default bus if omitted).
 * @param region - AWS region override.
 * @returns The created/updated rule details.
 */
export async function createEventbridgeRule(
  ruleName: string,
  scheduleExpression?: string,
  eventPattern?: string,
  state?: string,
  description?: string,
  eventBusName?: string,
  region?: string,
): Promise<EventBridgeRuleResult> {
  try {
    const resp = await eb(region).send(
      new PutRuleCommand({
        Name: ruleName,
        ScheduleExpression: scheduleExpression,
        EventPattern: eventPattern,
        State: (state ?? "ENABLED") as "ENABLED" | "DISABLED",
        Description: description,
        EventBusName: eventBusName,
      }),
    );

    return EventBridgeRuleResultSchema.parse({
      ruleArn: resp.RuleArn,
      ruleName,
      state: state ?? "ENABLED",
    });
  } catch (err: unknown) {
    throw wrapAwsError(
      err,
      `createEventbridgeRule(${ruleName})`,
    );
  }
}

/**
 * Add targets to an EventBridge rule.
 *
 * @param ruleName - The rule name to attach targets to.
 * @param targets - Array of target definitions with ARN, ID, and optional input.
 * @param eventBusName - Optional event bus name.
 * @param region - AWS region override.
 * @returns The number of failed target entries.
 */
export async function putEventbridgeTargets(
  ruleName: string,
  targets: Array<{ arn: string; id: string; input?: string }>,
  eventBusName?: string,
  region?: string,
): Promise<number> {
  try {
    const resp = await eb(region).send(
      new PutTargetsCommand({
        Rule: ruleName,
        EventBusName: eventBusName,
        Targets: targets.map((t) => ({
          Arn: t.arn,
          Id: t.id,
          Input: t.input,
        })),
      }),
    );

    return resp.FailedEntryCount ?? 0;
  } catch (err: unknown) {
    throw wrapAwsError(
      err,
      `putEventbridgeTargets(${ruleName})`,
    );
  }
}

/**
 * Delete an EventBridge rule, optionally removing its targets first.
 *
 * @param ruleName - The rule name to delete.
 * @param eventBusName - Optional event bus name.
 * @param force - If `true`, list and remove all targets before deleting the rule (default `false`).
 * @param region - AWS region override.
 * @returns The deleted rule details.
 */
export async function deleteEventbridgeRule(
  ruleName: string,
  eventBusName?: string,
  force?: boolean,
  region?: string,
): Promise<EventBridgeRuleResult> {
  try {
    // If force, remove all targets first
    if (force) {
      const targetsResp = await eb(region).send(
        new ListTargetsByRuleCommand({
          Rule: ruleName,
          EventBusName: eventBusName,
        }),
      );

      const targetIds = (targetsResp.Targets ?? [])
        .map((t) => t.Id)
        .filter((id): id is string => id !== undefined);

      if (targetIds.length > 0) {
        await eb(region).send(
          new RemoveTargetsCommand({
            Rule: ruleName,
            EventBusName: eventBusName,
            Ids: targetIds,
          }),
        );
      }
    }

    await eb(region).send(
      new DeleteRuleCommand({
        Name: ruleName,
        EventBusName: eventBusName,
      }),
    );

    return EventBridgeRuleResultSchema.parse({
      ruleName,
      state: "DELETED",
    });
  } catch (err: unknown) {
    throw wrapAwsError(
      err,
      `deleteEventbridgeRule(${ruleName})`,
    );
  }
}

/**
 * Create an EventBridge Scheduler schedule.
 *
 * @param scheduleName - The schedule name.
 * @param targetArn - The target ARN to invoke.
 * @param roleArn - The IAM role ARN for the schedule to assume.
 * @param scheduleExpression - The schedule expression (e.g. `"rate(1 hour)"`).
 * @param inputPayload - Optional JSON input payload for the target.
 * @param flexibleTimeWindow - Flexible time window mode (default `"OFF"`).
 * @param state - Schedule state: `"ENABLED"` (default) or `"DISABLED"`.
 * @param region - AWS region override.
 * @returns The created schedule details.
 */
export async function createSchedule(
  scheduleName: string,
  targetArn: string,
  roleArn: string,
  scheduleExpression: string,
  inputPayload?: string,
  flexibleTimeWindow?: string,
  state?: string,
  region?: string,
): Promise<ScheduleResult> {
  try {
    const resp = await scheduler(region).send(
      new CreateScheduleCommand({
        Name: scheduleName,
        ScheduleExpression: scheduleExpression,
        Target: {
          Arn: targetArn,
          RoleArn: roleArn,
          Input: inputPayload,
        },
        FlexibleTimeWindow: {
          Mode: (flexibleTimeWindow ?? "OFF") as "OFF" | "FLEXIBLE",
        },
        State: (state ?? "ENABLED") as "ENABLED" | "DISABLED",
      }),
    );

    return ScheduleResultSchema.parse({
      scheduleArn: resp.ScheduleArn ?? "",
      scheduleName,
    });
  } catch (err: unknown) {
    throw wrapAwsError(
      err,
      `createSchedule(${scheduleName})`,
    );
  }
}

/**
 * Delete an EventBridge Scheduler schedule.
 *
 * @param scheduleName - The schedule name to delete.
 * @param region - AWS region override.
 */
export async function deleteSchedule(
  scheduleName: string,
  region?: string,
): Promise<void> {
  try {
    await scheduler(region).send(
      new DeleteScheduleCommand({ Name: scheduleName }),
    );
  } catch (err: unknown) {
    throw wrapAwsError(
      err,
      `deleteSchedule(${scheduleName})`,
    );
  }
}

/**
 * Start a Step Functions state machine execution and poll until completion.
 *
 * @param stateMachineArn - The state machine ARN.
 * @param inputData - Optional input data (will be JSON-serialized).
 * @param name - Optional execution name.
 * @param pollInterval - Polling interval in milliseconds (default 2000).
 * @param timeout - Maximum wait time in milliseconds (default 300000 = 5 minutes).
 * @param region - AWS region override.
 * @returns The execution result with status and output.
 */
export async function runWorkflow(
  stateMachineArn: string,
  inputData?: unknown,
  name?: string,
  pollInterval?: number,
  timeout?: number,
  region?: string,
): Promise<WorkflowResult> {
  const interval = pollInterval ?? 2000;
  const maxWait = timeout ?? 300_000;

  let executionArn: string;

  try {
    const startResp = await sfn(region).send(
      new StartExecutionCommand({
        stateMachineArn,
        input:
          inputData !== undefined
            ? JSON.stringify(inputData)
            : undefined,
        name,
      }),
    );

    executionArn = startResp.executionArn ?? "";
  } catch (err: unknown) {
    throw wrapAwsError(
      err,
      `runWorkflow: start(${stateMachineArn})`,
    );
  }

  // Poll for completion
  const startTime = Date.now();

  while (true) {
    if (Date.now() - startTime > maxWait) {
      throw new AwsTimeoutError(
        `runWorkflow(${stateMachineArn}): execution timed out after ${maxWait}ms`,
      );
    }

    try {
      const descResp = await sfn(region).send(
        new DescribeExecutionCommand({ executionArn }),
      );

      const status = descResp.status ?? "UNKNOWN";

      if (
        status === "SUCCEEDED" ||
        status === "FAILED" ||
        status === "TIMED_OUT" ||
        status === "ABORTED"
      ) {
        return WorkflowResultSchema.parse({
          executionArn,
          status,
          output: descResp.output,
        });
      }
    } catch (err: unknown) {
      throw wrapAwsError(
        err,
        `runWorkflow: describe(${executionArn})`,
      );
    }

    await new Promise((resolve) => setTimeout(resolve, interval));
  }
}

/**
 * Execute a saga (distributed transaction) by running steps in order
 * and compensating in reverse on failure.
 *
 * Each step provides an `execute` function and a `compensate` function.
 * If any step fails, all previously completed steps are compensated in
 * reverse order.
 *
 * @param steps - Array of saga steps with name, execute, and compensate functions.
 * @param _region - AWS region override (reserved for future use).
 * @returns The saga result with step details and compensation count.
 */
export async function sagaOrchestrator(
  steps: Array<{
    name: string;
    execute: () => Promise<unknown>;
    compensate: () => Promise<void>;
  }>,
  _region?: string,
): Promise<SagaResult> {
  const stepResults: SagaStepResult[] = [];
  let compensationsRun = 0;

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    try {
      const output = await step.execute();
      stepResults.push(
        SagaStepResultSchema.parse({
          stepName: step.name,
          status: "SUCCEEDED",
          output,
        }),
      );
    } catch (err: unknown) {
      const errMsg =
        err instanceof Error ? err.message : String(err);
      stepResults.push(
        SagaStepResultSchema.parse({
          stepName: step.name,
          status: "FAILED",
          error: errMsg,
        }),
      );

      // Run compensations in reverse order for completed steps
      for (let j = i - 1; j >= 0; j--) {
        try {
          await steps[j].compensate();
          compensationsRun++;
          stepResults[j] = SagaStepResultSchema.parse({
            ...stepResults[j],
            status: "COMPENSATED",
          });
        } catch (compErr: unknown) {
          const compMsg =
            compErr instanceof Error
              ? compErr.message
              : String(compErr);
          stepResults[j] = SagaStepResultSchema.parse({
            ...stepResults[j],
            status: "COMPENSATION_FAILED",
            error: compMsg,
          });
        }
      }

      return SagaResultSchema.parse({
        status: "FAILED",
        steps: stepResults,
        compensationsRun,
      });
    }
  }

  return SagaResultSchema.parse({
    status: "SUCCEEDED",
    steps: stepResults,
    compensationsRun: 0,
  });
}

/**
 * Fan out items to an SQS queue and optionally collect results from DynamoDB.
 *
 * Sends each item as a message to the specified SQS queue in batches of 10.
 * If a result table and key are provided, polls DynamoDB for collected results.
 *
 * @param queueUrl - The SQS queue URL to send items to.
 * @param items - Array of items to fan out.
 * @param resultTable - Optional DynamoDB table for collecting results.
 * @param resultKey - Optional DynamoDB key attribute for result lookup.
 * @param region - AWS region override.
 * @returns The number of items sent and results collected.
 */
export async function fanOutFanIn(
  queueUrl: string,
  items: Record<string, unknown>[],
  resultTable?: string,
  resultKey?: string,
  region?: string,
): Promise<FanOutResult> {
  let itemsSent = 0;

  // Send items to SQS in batches of 10
  for (let i = 0; i < items.length; i += 10) {
    const batch = items.slice(i, i + 10);
    try {
      await sqsClient(region).send(
        new SendMessageBatchCommand({
          QueueUrl: queueUrl,
          Entries: batch.map((item, idx) => ({
            Id: `fanout-${i + idx}`,
            MessageBody: JSON.stringify(item),
          })),
        }),
      );
      itemsSent += batch.length;
    } catch (err: unknown) {
      throw wrapAwsError(err, "fanOutFanIn: send failed");
    }
  }

  // Optionally collect results from DynamoDB
  let resultsCollected = 0;
  if (resultTable && resultKey) {
    const client = ddb(region);
    for (let i = 0; i < items.length; i++) {
      const key = items[i][resultKey];
      if (key !== undefined) {
        try {
          const resp = await client.send(
            new GetCommand({
              TableName: resultTable,
              Key: { [resultKey]: key },
            }),
          );
          if (resp.Item) {
            resultsCollected++;
          }
        } catch {
          // Best-effort collection
        }
      }
    }
  }

  return FanOutResultSchema.parse({ itemsSent, resultsCollected });
}

/**
 * Start an EventBridge event replay.
 *
 * @param replayName - The replay name.
 * @param eventSourceArn - The archive ARN to replay from.
 * @param destinationArn - The event bus ARN to replay events to.
 * @param startTime - The start time for replay events (ISO string or Date).
 * @param endTime - The end time for replay events (ISO string or Date).
 * @param region - AWS region override.
 * @returns The replay result.
 */
export async function startEventReplay(
  replayName: string,
  eventSourceArn: string,
  destinationArn: string,
  startTime: string | Date,
  endTime: string | Date,
  region?: string,
): Promise<EventReplayResult> {
  try {
    const resp = await eb(region).send(
      new StartReplayCommand({
        ReplayName: replayName,
        EventSourceArn: eventSourceArn,
        Destination: { Arn: destinationArn },
        EventStartTime: new Date(startTime),
        EventEndTime: new Date(endTime),
      }),
    );

    return EventReplayResultSchema.parse({
      replayName,
      state: resp.State ?? "STARTING",
      eventSourceArn,
    });
  } catch (err: unknown) {
    throw wrapAwsError(
      err,
      `startEventReplay(${replayName})`,
    );
  }
}

/**
 * Describe the current state of an EventBridge event replay.
 *
 * @param replayName - The replay name to describe.
 * @param region - AWS region override.
 * @returns The replay result with current state.
 */
export async function describeEventReplay(
  replayName: string,
  region?: string,
): Promise<EventReplayResult> {
  try {
    const resp = await eb(region).send(
      new DescribeReplayCommand({ ReplayName: replayName }),
    );

    return EventReplayResultSchema.parse({
      replayName,
      state: resp.State ?? "UNKNOWN",
      eventSourceArn: resp.EventSourceArn,
    });
  } catch (err: unknown) {
    throw wrapAwsError(
      err,
      `describeEventReplay(${replayName})`,
    );
  }
}

/**
 * Create an EventBridge Pipe to connect a source to a target.
 *
 * @param pipeName - The pipe name.
 * @param sourceArn - The source ARN (e.g. SQS queue, Kinesis stream).
 * @param targetArn - The target ARN (e.g. Lambda function, Step Functions).
 * @param roleArn - The IAM role ARN for the pipe to assume.
 * @param sourceParameters - Optional source-specific parameters.
 * @param targetParameters - Optional target-specific parameters.
 * @param filterPattern - Optional event filter pattern (JSON string).
 * @param enrichmentArn - Optional enrichment ARN (e.g. Lambda, API Gateway).
 * @param region - AWS region override.
 * @returns The created pipe result.
 */
export async function createPipe(
  pipeName: string,
  sourceArn: string,
  targetArn: string,
  roleArn: string,
  sourceParameters?: Record<string, unknown>,
  targetParameters?: Record<string, unknown>,
  filterPattern?: string,
  enrichmentArn?: string,
  region?: string,
): Promise<PipeResult> {
  try {
    const filterCriteria = filterPattern
      ? { FilterCriteria: { Filters: [{ Pattern: filterPattern }] } }
      : {};

    const resp = await pipes(region).send(
      new CreatePipeCommand({
        Name: pipeName,
        Source: sourceArn,
        Target: targetArn,
        RoleArn: roleArn,
        SourceParameters: sourceParameters as Record<
          string,
          unknown
        > | undefined,
        TargetParameters: targetParameters as Record<
          string,
          unknown
        > | undefined,
        Enrichment: enrichmentArn,
        ...filterCriteria,
      }),
    );

    return PipeResultSchema.parse({
      pipeArn: resp.Arn ?? "",
      pipeName,
      state: resp.CurrentState ?? "CREATING",
    });
  } catch (err: unknown) {
    throw wrapAwsError(err, `createPipe(${pipeName})`);
  }
}

/**
 * Delete an EventBridge Pipe.
 *
 * @param pipeName - The pipe name to delete.
 * @param region - AWS region override.
 */
export async function deletePipe(
  pipeName: string,
  region?: string,
): Promise<void> {
  try {
    await pipes(region).send(
      new DeletePipeCommand({ Name: pipeName }),
    );
  } catch (err: unknown) {
    throw wrapAwsError(err, `deletePipe(${pipeName})`);
  }
}

/**
 * Create a Lambda event source mapping for an SQS queue.
 *
 * @param functionName - The Lambda function name or ARN.
 * @param queueArn - The SQS queue ARN.
 * @param batchSize - Number of records per batch (default 10).
 * @param maximumBatchingWindow - Maximum batching window in seconds (default 0).
 * @param maximumConcurrency - Maximum concurrent Lambda invocations (optional).
 * @param enabled - Whether the mapping is enabled (default `true`).
 * @param region - AWS region override.
 * @returns The event source mapping result.
 */
export async function createSqsEventSourceMapping(
  functionName: string,
  queueArn: string,
  batchSize?: number,
  maximumBatchingWindow?: number,
  maximumConcurrency?: number,
  enabled?: boolean,
  region?: string,
): Promise<EventSourceMappingResult> {
  try {
    const scalingConfig = maximumConcurrency !== undefined
      ? { ScalingConfig: { MaximumConcurrency: maximumConcurrency } }
      : {};

    const resp = await lambda(region).send(
      new CreateEventSourceMappingCommand({
        FunctionName: functionName,
        EventSourceArn: queueArn,
        BatchSize: batchSize ?? 10,
        MaximumBatchingWindowInSeconds: maximumBatchingWindow ?? 0,
        Enabled: enabled ?? true,
        ...scalingConfig,
      }),
    );

    return EventSourceMappingResultSchema.parse({
      uuid: resp.UUID ?? "",
      functionArn: resp.FunctionArn ?? functionName,
      eventSourceArn: resp.EventSourceArn ?? queueArn,
      state: resp.State ?? "Creating",
    });
  } catch (err: unknown) {
    throw wrapAwsError(
      err,
      `createSqsEventSourceMapping(${functionName})`,
    );
  }
}

/**
 * Delete a Lambda event source mapping.
 *
 * @param uuid - The event source mapping UUID to delete.
 * @param region - AWS region override.
 */
export async function deleteEventSourceMapping(
  uuid: string,
  region?: string,
): Promise<void> {
  try {
    await lambda(region).send(
      new DeleteEventSourceMappingCommand({ UUID: uuid }),
    );
  } catch (err: unknown) {
    throw wrapAwsError(
      err,
      `deleteEventSourceMapping(${uuid})`,
    );
  }
}
