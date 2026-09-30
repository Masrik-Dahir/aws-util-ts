/**
 * aws-util/cloudformation — High-level AWS CloudFormation utilities.
 *
 * Provides typed helpers for creating, updating, deleting, and polling
 * CloudFormation stacks, as well as reading stack outputs and exports.
 *
 * All functions obtain a CloudFormationClient via {@link getClient} and wrap
 * errors through {@link wrapAwsError}.
 *
 * @example
 * ```ts
 * import { deployStack, getStackOutputs } from "./cloudformation.js";
 *
 * const stack = await deployStack("my-stack", undefined, undefined, {
 *   Env: "prod",
 * });
 * const outputs = await getStackOutputs("my-stack");
 * console.log(outputs);
 * ```
 *
 * @module
 */

import { z } from "zod";
import {
  CloudFormationClient,
  CreateStackCommand,
  UpdateStackCommand,
  DeleteStackCommand,
  DescribeStacksCommand,
  ListStacksCommand,
  ListExportsCommand,
} from "@aws-sdk/client-cloudformation";
import { getClient } from "./client.js";
import {
  wrapAwsError,
  AwsTimeoutError,
  AwsServiceError,
} from "./exceptions.js";

// ---------------------------------------------------------------------------
// Zod schemas & inferred types
// ---------------------------------------------------------------------------

/** Schema for a CloudFormation stack output entry. */
const CFNOutputSchema = z.object({
  outputKey: z.string(),
  outputValue: z.string(),
  description: z.string().optional(),
});

/** Schema for a CloudFormation stack. */
export const CFNStackSchema = z.object({
  stackName: z.string(),
  stackId: z.string().optional(),
  stackStatus: z.string(),
  creationTime: z.date().optional(),
  lastUpdatedTime: z.date().optional(),
  description: z.string().optional(),
  outputs: z.array(CFNOutputSchema).optional(),
});

/** A CloudFormation stack descriptor. */
export type CFNStack = z.infer<typeof CFNStackSchema>;

// ---------------------------------------------------------------------------
// Terminal stack statuses
// ---------------------------------------------------------------------------

/** Stack statuses that indicate a completed operation (success or failure). */
const COMPLETE_STATUSES = new Set([
  "CREATE_COMPLETE",
  "UPDATE_COMPLETE",
  "DELETE_COMPLETE",
  "ROLLBACK_COMPLETE",
  "UPDATE_ROLLBACK_COMPLETE",
  "IMPORT_COMPLETE",
  "IMPORT_ROLLBACK_COMPLETE",
]);

const FAILED_STATUSES = new Set([
  "CREATE_FAILED",
  "DELETE_FAILED",
  "ROLLBACK_FAILED",
  "UPDATE_FAILED",
  "UPDATE_ROLLBACK_FAILED",
  "IMPORT_ROLLBACK_FAILED",
]);

/** All terminal statuses (complete or failed). */
const TERMINAL_STATUSES = new Set([
  ...COMPLETE_STATUSES,
  ...FAILED_STATUSES,
]);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Get a cached CloudFormationClient for the given region.
 */
function cfn(region?: string): CloudFormationClient {
  return getClient(CloudFormationClient, region);
}

/**
 * Convert a Record<string,string> to CloudFormation parameter entries.
 */
function toParameters(
  params?: Record<string, string>,
): Array<{ ParameterKey: string; ParameterValue: string }> | undefined {
  if (!params) {
    return undefined;
  }
  return Object.entries(params).map(([key, value]) => ({
    ParameterKey: key,
    ParameterValue: value,
  }));
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Create a new CloudFormation stack.
 *
 * @param stackName - The name for the new stack.
 * @param templateBody - The template body as a JSON or YAML string.
 * @param templateUrl - S3 URL for the template (mutually exclusive with templateBody).
 * @param parameters - Stack parameters as key-value pairs.
 * @param capabilities - IAM capabilities (e.g. `["CAPABILITY_IAM"]`).
 * @param region - AWS region override.
 * @returns The stack ID.
 */
export async function createStack(
  stackName: string,
  templateBody?: string,
  templateUrl?: string,
  parameters?: Record<string, string>,
  capabilities?: string[],
  region?: string,
): Promise<string> {
  try {
    const res = await cfn(region).send(
      new CreateStackCommand({
        StackName: stackName,
        TemplateBody: templateBody,
        TemplateURL: templateUrl,
        Parameters: toParameters(parameters),
        Capabilities: capabilities as
          | ("CAPABILITY_IAM" | "CAPABILITY_NAMED_IAM" | "CAPABILITY_AUTO_EXPAND")[]
          | undefined,
      }),
    );
    return res.StackId!;
  } catch (err: unknown) {
    throw wrapAwsError(err, `createStack(${stackName})`);
  }
}

/**
 * Update an existing CloudFormation stack.
 *
 * @param stackName - The name or ID of the stack to update.
 * @param templateBody - The updated template body.
 * @param templateUrl - S3 URL for the updated template.
 * @param parameters - Stack parameters as key-value pairs.
 * @param capabilities - IAM capabilities.
 * @param region - AWS region override.
 * @returns The stack ID.
 */
export async function updateStack(
  stackName: string,
  templateBody?: string,
  templateUrl?: string,
  parameters?: Record<string, string>,
  capabilities?: string[],
  region?: string,
): Promise<string> {
  try {
    const res = await cfn(region).send(
      new UpdateStackCommand({
        StackName: stackName,
        TemplateBody: templateBody,
        TemplateURL: templateUrl,
        Parameters: toParameters(parameters),
        Capabilities: capabilities as
          | ("CAPABILITY_IAM" | "CAPABILITY_NAMED_IAM" | "CAPABILITY_AUTO_EXPAND")[]
          | undefined,
      }),
    );
    return res.StackId!;
  } catch (err: unknown) {
    throw wrapAwsError(err, `updateStack(${stackName})`);
  }
}

/**
 * Delete a CloudFormation stack.
 *
 * @param stackName - The name or ID of the stack to delete.
 * @param region - AWS region override.
 */
export async function deleteStack(
  stackName: string,
  region?: string,
): Promise<void> {
  try {
    await cfn(region).send(
      new DeleteStackCommand({ StackName: stackName }),
    );
  } catch (err: unknown) {
    throw wrapAwsError(err, `deleteStack(${stackName})`);
  }
}

/**
 * Describe a CloudFormation stack by name or ID.
 *
 * Returns `null` if the stack does not exist (rather than throwing).
 *
 * @param stackName - The name or ID of the stack.
 * @param region - AWS region override.
 * @returns The stack descriptor, or `null` if not found.
 */
export async function describeStack(
  stackName: string,
  region?: string,
): Promise<CFNStack | null> {
  try {
    const res = await cfn(region).send(
      new DescribeStacksCommand({ StackName: stackName }),
    );
    const stack = res.Stacks?.[0];
    if (!stack) {
      return null;
    }
    return CFNStackSchema.parse({
      stackName: stack.StackName,
      stackId: stack.StackId,
      stackStatus: stack.StackStatus,
      creationTime: stack.CreationTime,
      lastUpdatedTime: stack.LastUpdatedTime,
      description: stack.Description,
      outputs: stack.Outputs?.map((o) => ({
        outputKey: o.OutputKey ?? "",
        outputValue: o.OutputValue ?? "",
        description: o.Description,
      })),
    });
  } catch (err: unknown) {
    // CloudFormation throws ValidationError for non-existent stacks
    const record = err as Record<string, unknown>;
    const name = typeof record["name"] === "string" ? record["name"] : "";
    const message =
      err instanceof Error ? err.message : String(err);
    if (
      name === "ValidationError" &&
      message.includes("does not exist")
    ) {
      return null;
    }
    throw wrapAwsError(err, `describeStack(${stackName})`);
  }
}

/**
 * Get a stack's outputs as a simple key-value map.
 *
 * @param stackName - The name or ID of the stack.
 * @param region - AWS region override.
 * @returns A record mapping output keys to their values.
 */
export async function getStackOutputs(
  stackName: string,
  region?: string,
): Promise<Record<string, string>> {
  const stack = await describeStack(stackName, region);
  if (!stack) {
    return {};
  }
  const outputs: Record<string, string> = {};
  for (const o of stack.outputs ?? []) {
    outputs[o.outputKey] = o.outputValue;
  }
  return outputs;
}

/**
 * List CloudFormation stacks, auto-paginating through all pages.
 *
 * @param statusFilter - Optional array of stack status strings to filter by.
 * @param region - AWS region override.
 * @returns An array of {@link CFNStack} entries.
 */
export async function listStacks(
  statusFilter?: string[],
  region?: string,
): Promise<CFNStack[]> {
  const results: CFNStack[] = [];
  let nextToken: string | undefined;

  try {
    do {
      const res = await cfn(region).send(
        new ListStacksCommand({
          StackStatusFilter: statusFilter as
            | (
                | "CREATE_IN_PROGRESS"
                | "CREATE_FAILED"
                | "CREATE_COMPLETE"
                | "ROLLBACK_IN_PROGRESS"
                | "ROLLBACK_FAILED"
                | "ROLLBACK_COMPLETE"
                | "DELETE_IN_PROGRESS"
                | "DELETE_FAILED"
                | "DELETE_COMPLETE"
                | "UPDATE_IN_PROGRESS"
                | "UPDATE_COMPLETE_CLEANUP_IN_PROGRESS"
                | "UPDATE_COMPLETE"
                | "UPDATE_FAILED"
                | "UPDATE_ROLLBACK_IN_PROGRESS"
                | "UPDATE_ROLLBACK_FAILED"
                | "UPDATE_ROLLBACK_COMPLETE_CLEANUP_IN_PROGRESS"
                | "UPDATE_ROLLBACK_COMPLETE"
                | "REVIEW_IN_PROGRESS"
                | "IMPORT_IN_PROGRESS"
                | "IMPORT_COMPLETE"
                | "IMPORT_ROLLBACK_IN_PROGRESS"
                | "IMPORT_ROLLBACK_FAILED"
                | "IMPORT_ROLLBACK_COMPLETE"
              )[]
            | undefined,
          NextToken: nextToken,
        }),
      );
      for (const summary of res.StackSummaries ?? []) {
        results.push(
          CFNStackSchema.parse({
            stackName: summary.StackName,
            stackId: summary.StackId,
            stackStatus: summary.StackStatus,
            creationTime: summary.CreationTime,
            lastUpdatedTime: summary.LastUpdatedTime,
            description: summary.TemplateDescription,
          }),
        );
      }
      nextToken = res.NextToken;
    } while (nextToken);
  } catch (err: unknown) {
    throw wrapAwsError(err, "listStacks");
  }

  return results;
}

/**
 * Poll a CloudFormation stack until it reaches a terminal state.
 *
 * Terminal states end with `_COMPLETE` or `_FAILED`.
 *
 * @param stackName - The name or ID of the stack.
 * @param timeout - Maximum wait time in milliseconds (default 600 000 = 10 min).
 * @param pollInterval - Delay between polls in milliseconds (default 10 000).
 * @param region - AWS region override.
 * @returns The final stack state.
 * @throws {AwsTimeoutError} If the stack does not reach a terminal state within the timeout.
 * @throws {AwsServiceError} If the stack cannot be found during polling.
 */
export async function waitForStack(
  stackName: string,
  timeout?: number,
  pollInterval?: number,
  region?: string,
): Promise<CFNStack> {
  const effectiveTimeout = timeout ?? 600_000;
  const effectivePollInterval = pollInterval ?? 10_000;
  const deadline = Date.now() + effectiveTimeout;

  while (Date.now() < deadline) {
    const stack = await describeStack(stackName, region);
    if (!stack) {
      throw new AwsServiceError(
        `waitForStack(${stackName}): stack not found during polling`,
      );
    }
    if (TERMINAL_STATUSES.has(stack.stackStatus)) {
      return stack;
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
    `waitForStack(${stackName}) timed out after ${effectiveTimeout}ms`,
  );
}

/**
 * Deploy a CloudFormation stack: create if it does not exist, update if it does,
 * then wait for the operation to complete.
 *
 * Handles the common "No updates are to be performed" error gracefully by
 * returning the current stack state.
 *
 * @param stackName - The name for the stack.
 * @param templateBody - The template body.
 * @param templateUrl - S3 URL for the template.
 * @param parameters - Stack parameters as key-value pairs.
 * @param capabilities - IAM capabilities.
 * @param region - AWS region override.
 * @returns The final stack state after the operation completes.
 */
export async function deployStack(
  stackName: string,
  templateBody?: string,
  templateUrl?: string,
  parameters?: Record<string, string>,
  capabilities?: string[],
  region?: string,
): Promise<CFNStack> {
  const existing = await describeStack(stackName, region);

  if (!existing || existing.stackStatus === "ROLLBACK_COMPLETE") {
    // Stack does not exist or is in ROLLBACK_COMPLETE (must delete first)
    if (existing?.stackStatus === "ROLLBACK_COMPLETE") {
      await deleteStack(stackName, region);
      // Wait for delete to complete
      const deadline = Date.now() + 300_000;
      while (Date.now() < deadline) {
        const s = await describeStack(stackName, region);
        if (!s || s.stackStatus === "DELETE_COMPLETE") {
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, 5_000));
      }
    }
    await createStack(
      stackName,
      templateBody,
      templateUrl,
      parameters,
      capabilities,
      region,
    );
  } else {
    // Stack exists — attempt update
    try {
      await updateStack(
        stackName,
        templateBody,
        templateUrl,
        parameters,
        capabilities,
        region,
      );
    } catch (err: unknown) {
      // "No updates are to be performed" is not a real error
      const message =
        err instanceof Error ? err.message : String(err);
      if (message.includes("No updates are to be performed")) {
        return existing;
      }
      throw err;
    }
  }

  return waitForStack(stackName, undefined, undefined, region);
}

/**
 * Look up a CloudFormation export value by its name.
 *
 * Paginates through all exports to find one matching the given name.
 *
 * @param exportName - The export name to look up.
 * @param region - AWS region override.
 * @returns The export value, or `null` if not found.
 */
export async function getExportValue(
  exportName: string,
  region?: string,
): Promise<string | null> {
  let nextToken: string | undefined;

  try {
    do {
      const res = await cfn(region).send(
        new ListExportsCommand({ NextToken: nextToken }),
      );
      for (const exp of res.Exports ?? []) {
        if (exp.Name === exportName) {
          return exp.Value ?? null;
        }
      }
      nextToken = res.NextToken;
    } while (nextToken);
  } catch (err: unknown) {
    throw wrapAwsError(err, `getExportValue(${exportName})`);
  }

  return null;
}

// ---------------------------------------------------------------------------
// Additional types (auto-generated)
// ---------------------------------------------------------------------------

/** Result of activate_type. */
export type ActivateTypeResult = {
  arn?: string | undefined;
};

/** Result of batch_describe_type_configurations. */
export type BatchDescribeTypeConfigurationsResult = {
  errors?: Record<string, unknown>[];
  unprocessedTypeConfigurations?: Record<string, unknown>[];
  typeConfigurations?: Record<string, unknown>[];
};

/** Result of create_change_set. */
export type CreateChangeSetResult = {
  id?: string | undefined;
  stackId?: string | undefined;
};

/** Result of create_generated_template. */
export type CreateGeneratedTemplateResult = {
  generatedTemplateId?: string | undefined;
};

/** Result of create_stack_instances. */
export type CreateStackInstancesResult = {
  operationId?: string | undefined;
};

/** Result of create_stack_refactor. */
export type CreateStackRefactorResult = {
  stackRefactorId?: string | undefined;
};

/** Result of create_stack_set. */
export type CreateStackSetResult = {
  stackSetId?: string | undefined;
};

/** Result of delete_stack_instances. */
export type DeleteStackInstancesResult = {
  operationId?: string | undefined;
};

/** Result of describe_account_limits. */
export type DescribeAccountLimitsResult = {
  accountLimits?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_change_set. */
export type DescribeChangeSetResult = {
  changeSetName?: string | undefined;
  changeSetId?: string | undefined;
  stackId?: string | undefined;
  stackName?: string | undefined;
  description?: string | undefined;
  parameters?: Record<string, unknown>[];
  creationTime?: string | undefined;
  executionStatus?: string | undefined;
  status?: string | undefined;
  statusReason?: string | undefined;
  notificationArNs?: string[];
  rollbackConfiguration?: Record<string, unknown>;
  capabilities?: string[];
  tags?: Record<string, unknown>[];
  changes?: Record<string, unknown>[];
  nextToken?: string | undefined;
  includeNestedStacks?: boolean | undefined;
  parentChangeSetId?: string | undefined;
  rootChangeSetId?: string | undefined;
  onStackFailure?: string | undefined;
  importExistingResources?: boolean | undefined;
};

/** Result of describe_change_set_hooks. */
export type DescribeChangeSetHooksResult = {
  changeSetId?: string | undefined;
  changeSetName?: string | undefined;
  hooks?: Record<string, unknown>[];
  status?: string | undefined;
  nextToken?: string | undefined;
  stackId?: string | undefined;
  stackName?: string | undefined;
};

/** Result of describe_generated_template. */
export type DescribeGeneratedTemplateResult = {
  generatedTemplateId?: string | undefined;
  generatedTemplateName?: string | undefined;
  resources?: Record<string, unknown>[];
  status?: string | undefined;
  statusReason?: string | undefined;
  creationTime?: string | undefined;
  lastUpdatedTime?: string | undefined;
  progress?: Record<string, unknown>;
  stackId?: string | undefined;
  templateConfiguration?: Record<string, unknown>;
  totalWarnings?: number | undefined;
};

/** Result of describe_organizations_access. */
export type DescribeOrganizationsAccessResult = {
  status?: string | undefined;
};

/** Result of describe_publisher. */
export type DescribePublisherResult = {
  publisherId?: string | undefined;
  publisherStatus?: string | undefined;
  identityProvider?: string | undefined;
  publisherProfile?: string | undefined;
};

/** Result of describe_resource_scan. */
export type DescribeResourceScanResult = {
  resourceScanId?: string | undefined;
  status?: string | undefined;
  statusReason?: string | undefined;
  startTime?: string | undefined;
  endTime?: string | undefined;
  percentageCompleted?: number | undefined;
  resourceTypes?: string[];
  resourcesScanned?: number | undefined;
  resourcesRead?: number | undefined;
  scanFilters?: Record<string, unknown>[];
};

/** Result of describe_stack_drift_detection_status. */
export type DescribeStackDriftDetectionStatusResult = {
  stackId?: string | undefined;
  stackDriftDetectionId?: string | undefined;
  stackDriftStatus?: string | undefined;
  detectionStatus?: string | undefined;
  detectionStatusReason?: string | undefined;
  driftedStackResourceCount?: number | undefined;
  timestamp?: string | undefined;
};

/** Result of describe_stack_events. */
export type DescribeStackEventsResult = {
  stackEvents?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_stack_instance. */
export type DescribeStackInstanceResult = {
  stackInstance?: Record<string, unknown>;
};

/** Result of describe_stack_refactor. */
export type DescribeStackRefactorResult = {
  description?: string | undefined;
  stackRefactorId?: string | undefined;
  stackIds?: string[];
  executionStatus?: string | undefined;
  executionStatusReason?: string | undefined;
  status?: string | undefined;
  statusReason?: string | undefined;
};

/** Result of describe_stack_resource. */
export type DescribeStackResourceResult = {
  stackResourceDetail?: Record<string, unknown>;
};

/** Result of describe_stack_resource_drifts. */
export type DescribeStackResourceDriftsResult = {
  stackResourceDrifts?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_stack_resources. */
export type DescribeStackResourcesResult = {
  stackResources?: Record<string, unknown>[];
};

/** Result of describe_stack_set. */
export type DescribeStackSetResult = {
  stackSet?: Record<string, unknown>;
};

/** Result of describe_stack_set_operation. */
export type DescribeStackSetOperationResult = {
  stackSetOperation?: Record<string, unknown>;
};

/** Result of describe_stacks. */
export type DescribeStacksResult = {
  stacks?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_type. */
export type DescribeTypeResult = {
  arn?: string | undefined;
  typeValue?: string | undefined;
  typeName?: string | undefined;
  defaultVersionId?: string | undefined;
  isDefaultVersion?: boolean | undefined;
  typeTestsStatus?: string | undefined;
  typeTestsStatusDescription?: string | undefined;
  description?: string | undefined;
  modelSchema?: string | undefined;
  provisioningType?: string | undefined;
  deprecatedStatus?: string | undefined;
  loggingConfig?: Record<string, unknown>;
  requiredActivatedTypes?: Record<string, unknown>[];
  executionRoleArn?: string | undefined;
  visibility?: string | undefined;
  sourceUrl?: string | undefined;
  documentationUrl?: string | undefined;
  lastUpdated?: string | undefined;
  timeCreated?: string | undefined;
  configurationSchema?: string | undefined;
  publisherId?: string | undefined;
  originalTypeName?: string | undefined;
  originalTypeArn?: string | undefined;
  publicVersionNumber?: string | undefined;
  latestPublicVersion?: string | undefined;
  isActivated?: boolean | undefined;
  autoUpdate?: boolean | undefined;
};

/** Result of describe_type_registration. */
export type DescribeTypeRegistrationResult = {
  progressStatus?: string | undefined;
  description?: string | undefined;
  typeArn?: string | undefined;
  typeVersionArn?: string | undefined;
};

/** Result of detect_stack_drift. */
export type DetectStackDriftResult = {
  stackDriftDetectionId?: string | undefined;
};

/** Result of detect_stack_resource_drift. */
export type DetectStackResourceDriftResult = {
  stackResourceDrift?: Record<string, unknown>;
};

/** Result of detect_stack_set_drift. */
export type DetectStackSetDriftResult = {
  operationId?: string | undefined;
};

/** Result of estimate_template_cost. */
export type EstimateTemplateCostResult = {
  url?: string | undefined;
};

/** Result of get_generated_template. */
export type GetGeneratedTemplateResult = {
  status?: string | undefined;
  templateBody?: string | undefined;
};

/** Result of get_hook_result. */
export type GetHookResultResult = {
  hookResultId?: string | undefined;
  invocationPoint?: string | undefined;
  failureMode?: string | undefined;
  typeName?: string | undefined;
  originalTypeName?: string | undefined;
  typeVersionId?: string | undefined;
  typeConfigurationVersionId?: string | undefined;
  typeArn?: string | undefined;
  status?: string | undefined;
  hookStatusReason?: string | undefined;
  invokedAt?: string | undefined;
  target?: Record<string, unknown>;
  annotations?: Record<string, unknown>[];
};

/** Result of get_stack_policy. */
export type GetStackPolicyResult = {
  stackPolicyBody?: string | undefined;
};

/** Result of get_template. */
export type GetTemplateResult = {
  templateBody?: string | undefined;
  stagesAvailable?: string[];
};

/** Result of get_template_summary. */
export type GetTemplateSummaryResult = {
  parameters?: Record<string, unknown>[];
  description?: string | undefined;
  capabilities?: string[];
  capabilitiesReason?: string | undefined;
  resourceTypes?: string[];
  version?: string | undefined;
  metadata?: string | undefined;
  declaredTransforms?: string[];
  resourceIdentifierSummaries?: Record<string, unknown>[];
  warnings?: Record<string, unknown>;
};

/** Result of import_stacks_to_stack_set. */
export type ImportStacksToStackSetResult = {
  operationId?: string | undefined;
};

/** Result of list_change_sets. */
export type ListChangeSetsResult = {
  summaries?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_exports. */
export type ListExportsResult = {
  exports?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_generated_templates. */
export type ListGeneratedTemplatesResult = {
  summaries?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_hook_results. */
export type ListHookResultsResult = {
  targetType?: string | undefined;
  targetId?: string | undefined;
  hookResults?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_imports. */
export type ListImportsResult = {
  imports?: string[];
  nextToken?: string | undefined;
};

/** Result of list_resource_scan_related_resources. */
export type ListResourceScanRelatedResourcesResult = {
  relatedResources?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_resource_scan_resources. */
export type ListResourceScanResourcesResult = {
  resources?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_resource_scans. */
export type ListResourceScansResult = {
  resourceScanSummaries?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_stack_instance_resource_drifts. */
export type ListStackInstanceResourceDriftsResult = {
  summaries?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_stack_instances. */
export type ListStackInstancesResult = {
  summaries?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_stack_refactor_actions. */
export type ListStackRefactorActionsResult = {
  stackRefactorActions?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_stack_refactors. */
export type ListStackRefactorsResult = {
  stackRefactorSummaries?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_stack_resources. */
export type ListStackResourcesResult = {
  stackResourceSummaries?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_stack_set_auto_deployment_targets. */
export type ListStackSetAutoDeploymentTargetsResult = {
  summaries?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_stack_set_operation_results. */
export type ListStackSetOperationResultsResult = {
  summaries?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_stack_set_operations. */
export type ListStackSetOperationsResult = {
  summaries?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_stack_sets. */
export type ListStackSetsResult = {
  summaries?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_type_registrations. */
export type ListTypeRegistrationsResult = {
  registrationTokenList?: string[];
  nextToken?: string | undefined;
};

/** Result of list_type_versions. */
export type ListTypeVersionsResult = {
  typeVersionSummaries?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_types. */
export type ListTypesResult = {
  typeSummaries?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of publish_type. */
export type PublishTypeResult = {
  publicTypeArn?: string | undefined;
};

/** Result of register_publisher. */
export type RegisterPublisherResult = {
  publisherId?: string | undefined;
};

/** Result of register_type. */
export type RegisterTypeResult = {
  registrationToken?: string | undefined;
};

/** Result of rollback_stack. */
export type RollbackStackResult = {
  stackId?: string | undefined;
};

/** Result of run_type. */
export type RunTypeResult = {
  typeVersionArn?: string | undefined;
};

/** Result of set_type_configuration. */
export type SetTypeConfigurationResult = {
  configurationArn?: string | undefined;
};

/** Result of start_resource_scan. */
export type StartResourceScanResult = {
  resourceScanId?: string | undefined;
};

/** Result of update_generated_template. */
export type UpdateGeneratedTemplateResult = {
  generatedTemplateId?: string | undefined;
};

/** Result of update_stack_instances. */
export type UpdateStackInstancesResult = {
  operationId?: string | undefined;
};

/** Result of update_stack_set. */
export type UpdateStackSetResult = {
  operationId?: string | undefined;
};

/** Result of update_termination_protection. */
export type UpdateTerminationProtectionResult = {
  stackId?: string | undefined;
};

/** Result of validate_template. */
export type ValidateTemplateResult = {
  parameters?: Record<string, unknown>[];
  description?: string | undefined;
  capabilities?: string[];
  capabilitiesReason?: string | undefined;
  declaredTransforms?: string[];
};


// ---------------------------------------------------------------------------
// Additional functions (auto-generated)
// ---------------------------------------------------------------------------

/** Activate organizations access. */
export async function activateOrganizationsAccess(regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement activate_organizations_access
    throw new Error("activate_organizations_access not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "activate_organizations_access failed");
  }
}

/** Activate type. */
export async function activateType(): Promise<ActivateTypeResult> {
  try {
    // TODO: implement activate_type
    throw new Error("activate_type not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "activate_type failed");
  }
}

/** Batch describe type configurations. */
export async function batchDescribeTypeConfigurations(typeConfigurationIdentifiers: Record<string, unknown>[], regionName?: string | undefined): Promise<BatchDescribeTypeConfigurationsResult> {
  try {
    // TODO: implement batch_describe_type_configurations
    throw new Error("batch_describe_type_configurations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_describe_type_configurations failed");
  }
}

/** Cancel update stack. */
export async function cancelUpdateStack(stackName: string): Promise<void> {
  try {
    // TODO: implement cancel_update_stack
    throw new Error("cancel_update_stack not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "cancel_update_stack failed");
  }
}

/** Continue update rollback. */
export async function continueUpdateRollback(stackName: string): Promise<void> {
  try {
    // TODO: implement continue_update_rollback
    throw new Error("continue_update_rollback not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "continue_update_rollback failed");
  }
}

/** Create change set. */
export async function createChangeSet(stackName: string, changeSetName: string): Promise<CreateChangeSetResult> {
  try {
    // TODO: implement create_change_set
    throw new Error("create_change_set not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_change_set failed");
  }
}

/** Create generated template. */
export async function createGeneratedTemplate(generatedTemplateName: string): Promise<CreateGeneratedTemplateResult> {
  try {
    // TODO: implement create_generated_template
    throw new Error("create_generated_template not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_generated_template failed");
  }
}

/** Create stack instances. */
export async function createStackInstances(stackSetName: string, regions: string[]): Promise<CreateStackInstancesResult> {
  try {
    // TODO: implement create_stack_instances
    throw new Error("create_stack_instances not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_stack_instances failed");
  }
}

/** Create stack refactor. */
export async function createStackRefactor(stackDefinitions: Record<string, unknown>[]): Promise<CreateStackRefactorResult> {
  try {
    // TODO: implement create_stack_refactor
    throw new Error("create_stack_refactor not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_stack_refactor failed");
  }
}

/** Create stack set. */
export async function createStackSet(stackSetName: string): Promise<CreateStackSetResult> {
  try {
    // TODO: implement create_stack_set
    throw new Error("create_stack_set not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_stack_set failed");
  }
}

/** Deactivate organizations access. */
export async function deactivateOrganizationsAccess(regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement deactivate_organizations_access
    throw new Error("deactivate_organizations_access not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "deactivate_organizations_access failed");
  }
}

/** Deactivate type. */
export async function deactivateType(): Promise<void> {
  try {
    // TODO: implement deactivate_type
    throw new Error("deactivate_type not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "deactivate_type failed");
  }
}

/** Delete change set. */
export async function deleteChangeSet(changeSetName: string): Promise<void> {
  try {
    // TODO: implement delete_change_set
    throw new Error("delete_change_set not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_change_set failed");
  }
}

/** Delete generated template. */
export async function deleteGeneratedTemplate(generatedTemplateName: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_generated_template
    throw new Error("delete_generated_template not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_generated_template failed");
  }
}

/** Delete stack instances. */
export async function deleteStackInstances(stackSetName: string, regions: string[], retainStacks: boolean): Promise<DeleteStackInstancesResult> {
  try {
    // TODO: implement delete_stack_instances
    throw new Error("delete_stack_instances not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_stack_instances failed");
  }
}

/** Delete stack set. */
export async function deleteStackSet(stackSetName: string): Promise<void> {
  try {
    // TODO: implement delete_stack_set
    throw new Error("delete_stack_set not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_stack_set failed");
  }
}

/** Deregister type. */
export async function deregisterType(): Promise<void> {
  try {
    // TODO: implement deregister_type
    throw new Error("deregister_type not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "deregister_type failed");
  }
}

/** Describe account limits. */
export async function describeAccountLimits(): Promise<DescribeAccountLimitsResult> {
  try {
    // TODO: implement describe_account_limits
    throw new Error("describe_account_limits not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_account_limits failed");
  }
}

/** Describe change set. */
export async function describeChangeSet(changeSetName: string): Promise<DescribeChangeSetResult> {
  try {
    // TODO: implement describe_change_set
    throw new Error("describe_change_set not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_change_set failed");
  }
}

/** Describe change set hooks. */
export async function describeChangeSetHooks(changeSetName: string): Promise<DescribeChangeSetHooksResult> {
  try {
    // TODO: implement describe_change_set_hooks
    throw new Error("describe_change_set_hooks not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_change_set_hooks failed");
  }
}

/** Describe generated template. */
export async function describeGeneratedTemplate(generatedTemplateName: string, regionName?: string | undefined): Promise<DescribeGeneratedTemplateResult> {
  try {
    // TODO: implement describe_generated_template
    throw new Error("describe_generated_template not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_generated_template failed");
  }
}

/** Describe organizations access. */
export async function describeOrganizationsAccess(): Promise<DescribeOrganizationsAccessResult> {
  try {
    // TODO: implement describe_organizations_access
    throw new Error("describe_organizations_access not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_organizations_access failed");
  }
}

/** Describe publisher. */
export async function describePublisher(): Promise<DescribePublisherResult> {
  try {
    // TODO: implement describe_publisher
    throw new Error("describe_publisher not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_publisher failed");
  }
}

/** Describe resource scan. */
export async function describeResourceScan(resourceScanId: string, regionName?: string | undefined): Promise<DescribeResourceScanResult> {
  try {
    // TODO: implement describe_resource_scan
    throw new Error("describe_resource_scan not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_resource_scan failed");
  }
}

/** Describe stack drift detection status. */
export async function describeStackDriftDetectionStatus(stackDriftDetectionId: string, regionName?: string | undefined): Promise<DescribeStackDriftDetectionStatusResult> {
  try {
    // TODO: implement describe_stack_drift_detection_status
    throw new Error("describe_stack_drift_detection_status not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_stack_drift_detection_status failed");
  }
}

/** Describe stack events. */
export async function describeStackEvents(stackName: string): Promise<DescribeStackEventsResult> {
  try {
    // TODO: implement describe_stack_events
    throw new Error("describe_stack_events not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_stack_events failed");
  }
}

/** Describe stack instance. */
export async function describeStackInstance(stackSetName: string, stackInstanceAccount: string, stackInstanceRegion: string): Promise<DescribeStackInstanceResult> {
  try {
    // TODO: implement describe_stack_instance
    throw new Error("describe_stack_instance not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_stack_instance failed");
  }
}

/** Describe stack refactor. */
export async function describeStackRefactor(stackRefactorId: string, regionName?: string | undefined): Promise<DescribeStackRefactorResult> {
  try {
    // TODO: implement describe_stack_refactor
    throw new Error("describe_stack_refactor not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_stack_refactor failed");
  }
}

/** Describe stack resource. */
export async function describeStackResource(stackName: string, logicalResourceId: string, regionName?: string | undefined): Promise<DescribeStackResourceResult> {
  try {
    // TODO: implement describe_stack_resource
    throw new Error("describe_stack_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_stack_resource failed");
  }
}

/** Describe stack resource drifts. */
export async function describeStackResourceDrifts(stackName: string): Promise<DescribeStackResourceDriftsResult> {
  try {
    // TODO: implement describe_stack_resource_drifts
    throw new Error("describe_stack_resource_drifts not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_stack_resource_drifts failed");
  }
}

/** Describe stack resources. */
export async function describeStackResources(): Promise<DescribeStackResourcesResult> {
  try {
    // TODO: implement describe_stack_resources
    throw new Error("describe_stack_resources not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_stack_resources failed");
  }
}

/** Describe stack set. */
export async function describeStackSet(stackSetName: string): Promise<DescribeStackSetResult> {
  try {
    // TODO: implement describe_stack_set
    throw new Error("describe_stack_set not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_stack_set failed");
  }
}

/** Describe stack set operation. */
export async function describeStackSetOperation(stackSetName: string, operationId: string): Promise<DescribeStackSetOperationResult> {
  try {
    // TODO: implement describe_stack_set_operation
    throw new Error("describe_stack_set_operation not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_stack_set_operation failed");
  }
}

/** Describe stacks. */
export async function describeStacks(): Promise<DescribeStacksResult> {
  try {
    // TODO: implement describe_stacks
    throw new Error("describe_stacks not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_stacks failed");
  }
}

/** Describe type. */
export async function describeType(): Promise<DescribeTypeResult> {
  try {
    // TODO: implement describe_type
    throw new Error("describe_type not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_type failed");
  }
}

/** Describe type registration. */
export async function describeTypeRegistration(registrationToken: string, regionName?: string | undefined): Promise<DescribeTypeRegistrationResult> {
  try {
    // TODO: implement describe_type_registration
    throw new Error("describe_type_registration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_type_registration failed");
  }
}

/** Detect stack drift. */
export async function detectStackDrift(stackName: string): Promise<DetectStackDriftResult> {
  try {
    // TODO: implement detect_stack_drift
    throw new Error("detect_stack_drift not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "detect_stack_drift failed");
  }
}

/** Detect stack resource drift. */
export async function detectStackResourceDrift(stackName: string, logicalResourceId: string, regionName?: string | undefined): Promise<DetectStackResourceDriftResult> {
  try {
    // TODO: implement detect_stack_resource_drift
    throw new Error("detect_stack_resource_drift not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "detect_stack_resource_drift failed");
  }
}

/** Detect stack set drift. */
export async function detectStackSetDrift(stackSetName: string): Promise<DetectStackSetDriftResult> {
  try {
    // TODO: implement detect_stack_set_drift
    throw new Error("detect_stack_set_drift not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "detect_stack_set_drift failed");
  }
}

/** Estimate template cost. */
export async function estimateTemplateCost(): Promise<EstimateTemplateCostResult> {
  try {
    // TODO: implement estimate_template_cost
    throw new Error("estimate_template_cost not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "estimate_template_cost failed");
  }
}

/** Execute change set. */
export async function executeChangeSet(changeSetName: string): Promise<void> {
  try {
    // TODO: implement execute_change_set
    throw new Error("execute_change_set not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "execute_change_set failed");
  }
}

/** Execute stack refactor. */
export async function executeStackRefactor(stackRefactorId: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement execute_stack_refactor
    throw new Error("execute_stack_refactor not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "execute_stack_refactor failed");
  }
}

/** Get generated template. */
export async function getGeneratedTemplate(generatedTemplateName: string): Promise<GetGeneratedTemplateResult> {
  try {
    // TODO: implement get_generated_template
    throw new Error("get_generated_template not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_generated_template failed");
  }
}

/** Get hook result. */
export async function getHookResult(): Promise<GetHookResultResult> {
  try {
    // TODO: implement get_hook_result
    throw new Error("get_hook_result not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_hook_result failed");
  }
}

/** Get stack policy. */
export async function getStackPolicy(stackName: string, regionName?: string | undefined): Promise<GetStackPolicyResult> {
  try {
    // TODO: implement get_stack_policy
    throw new Error("get_stack_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_stack_policy failed");
  }
}

/** Get template. */
export async function getTemplate(): Promise<GetTemplateResult> {
  try {
    // TODO: implement get_template
    throw new Error("get_template not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_template failed");
  }
}

/** Get template summary. */
export async function getTemplateSummary(): Promise<GetTemplateSummaryResult> {
  try {
    // TODO: implement get_template_summary
    throw new Error("get_template_summary not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_template_summary failed");
  }
}

/** Import stacks to stack set. */
export async function importStacksToStackSet(stackSetName: string): Promise<ImportStacksToStackSetResult> {
  try {
    // TODO: implement import_stacks_to_stack_set
    throw new Error("import_stacks_to_stack_set not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "import_stacks_to_stack_set failed");
  }
}

/** List change sets. */
export async function listChangeSets(stackName: string): Promise<ListChangeSetsResult> {
  try {
    // TODO: implement list_change_sets
    throw new Error("list_change_sets not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_change_sets failed");
  }
}

/** List exports. */
export async function listExports(): Promise<ListExportsResult> {
  try {
    // TODO: implement list_exports
    throw new Error("list_exports not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_exports failed");
  }
}

/** List generated templates. */
export async function listGeneratedTemplates(): Promise<ListGeneratedTemplatesResult> {
  try {
    // TODO: implement list_generated_templates
    throw new Error("list_generated_templates not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_generated_templates failed");
  }
}

/** List hook results. */
export async function listHookResults(): Promise<ListHookResultsResult> {
  try {
    // TODO: implement list_hook_results
    throw new Error("list_hook_results not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_hook_results failed");
  }
}

/** List imports. */
export async function listImports(exportName: string): Promise<ListImportsResult> {
  try {
    // TODO: implement list_imports
    throw new Error("list_imports not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_imports failed");
  }
}

/** List resource scan related resources. */
export async function listResourceScanRelatedResources(resourceScanId: string, resources: Record<string, unknown>[]): Promise<ListResourceScanRelatedResourcesResult> {
  try {
    // TODO: implement list_resource_scan_related_resources
    throw new Error("list_resource_scan_related_resources not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_resource_scan_related_resources failed");
  }
}

/** List resource scan resources. */
export async function listResourceScanResources(resourceScanId: string): Promise<ListResourceScanResourcesResult> {
  try {
    // TODO: implement list_resource_scan_resources
    throw new Error("list_resource_scan_resources not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_resource_scan_resources failed");
  }
}

/** List resource scans. */
export async function listResourceScans(): Promise<ListResourceScansResult> {
  try {
    // TODO: implement list_resource_scans
    throw new Error("list_resource_scans not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_resource_scans failed");
  }
}

/** List stack instance resource drifts. */
export async function listStackInstanceResourceDrifts(stackSetName: string, stackInstanceAccount: string, stackInstanceRegion: string, operationId: string): Promise<ListStackInstanceResourceDriftsResult> {
  try {
    // TODO: implement list_stack_instance_resource_drifts
    throw new Error("list_stack_instance_resource_drifts not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_stack_instance_resource_drifts failed");
  }
}

/** List stack instances. */
export async function listStackInstances(stackSetName: string): Promise<ListStackInstancesResult> {
  try {
    // TODO: implement list_stack_instances
    throw new Error("list_stack_instances not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_stack_instances failed");
  }
}

/** List stack refactor actions. */
export async function listStackRefactorActions(stackRefactorId: string): Promise<ListStackRefactorActionsResult> {
  try {
    // TODO: implement list_stack_refactor_actions
    throw new Error("list_stack_refactor_actions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_stack_refactor_actions failed");
  }
}

/** List stack refactors. */
export async function listStackRefactors(): Promise<ListStackRefactorsResult> {
  try {
    // TODO: implement list_stack_refactors
    throw new Error("list_stack_refactors not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_stack_refactors failed");
  }
}

/** List stack resources. */
export async function listStackResources(stackName: string): Promise<ListStackResourcesResult> {
  try {
    // TODO: implement list_stack_resources
    throw new Error("list_stack_resources not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_stack_resources failed");
  }
}

/** List stack set auto deployment targets. */
export async function listStackSetAutoDeploymentTargets(stackSetName: string): Promise<ListStackSetAutoDeploymentTargetsResult> {
  try {
    // TODO: implement list_stack_set_auto_deployment_targets
    throw new Error("list_stack_set_auto_deployment_targets not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_stack_set_auto_deployment_targets failed");
  }
}

/** List stack set operation results. */
export async function listStackSetOperationResults(stackSetName: string, operationId: string): Promise<ListStackSetOperationResultsResult> {
  try {
    // TODO: implement list_stack_set_operation_results
    throw new Error("list_stack_set_operation_results not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_stack_set_operation_results failed");
  }
}

/** List stack set operations. */
export async function listStackSetOperations(stackSetName: string): Promise<ListStackSetOperationsResult> {
  try {
    // TODO: implement list_stack_set_operations
    throw new Error("list_stack_set_operations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_stack_set_operations failed");
  }
}

/** List stack sets. */
export async function listStackSets(): Promise<ListStackSetsResult> {
  try {
    // TODO: implement list_stack_sets
    throw new Error("list_stack_sets not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_stack_sets failed");
  }
}

/** List type registrations. */
export async function listTypeRegistrations(): Promise<ListTypeRegistrationsResult> {
  try {
    // TODO: implement list_type_registrations
    throw new Error("list_type_registrations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_type_registrations failed");
  }
}

/** List type versions. */
export async function listTypeVersions(): Promise<ListTypeVersionsResult> {
  try {
    // TODO: implement list_type_versions
    throw new Error("list_type_versions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_type_versions failed");
  }
}

/** List types. */
export async function listTypes(): Promise<ListTypesResult> {
  try {
    // TODO: implement list_types
    throw new Error("list_types not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_types failed");
  }
}

/** Publish type. */
export async function publishType(): Promise<PublishTypeResult> {
  try {
    // TODO: implement publish_type
    throw new Error("publish_type not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "publish_type failed");
  }
}

/** Record handler progress. */
export async function recordHandlerProgress(bearerToken: string, operationStatus: string): Promise<void> {
  try {
    // TODO: implement record_handler_progress
    throw new Error("record_handler_progress not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "record_handler_progress failed");
  }
}

/** Register publisher. */
export async function registerPublisher(): Promise<RegisterPublisherResult> {
  try {
    // TODO: implement register_publisher
    throw new Error("register_publisher not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "register_publisher failed");
  }
}

/** Register type. */
export async function registerType(typeName: string, schemaHandlerPackage: string): Promise<RegisterTypeResult> {
  try {
    // TODO: implement register_type
    throw new Error("register_type not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "register_type failed");
  }
}

/** Rollback stack. */
export async function rollbackStack(stackName: string): Promise<RollbackStackResult> {
  try {
    // TODO: implement rollback_stack
    throw new Error("rollback_stack not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "rollback_stack failed");
  }
}

/** Run type. */
export async function runType(): Promise<RunTypeResult> {
  try {
    // TODO: implement run_type
    throw new Error("run_type not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "run_type failed");
  }
}

/** Set stack policy. */
export async function setStackPolicy(stackName: string): Promise<void> {
  try {
    // TODO: implement set_stack_policy
    throw new Error("set_stack_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "set_stack_policy failed");
  }
}

/** Set type configuration. */
export async function setTypeConfiguration(configuration: string): Promise<SetTypeConfigurationResult> {
  try {
    // TODO: implement set_type_configuration
    throw new Error("set_type_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "set_type_configuration failed");
  }
}

/** Set type default version. */
export async function setTypeDefaultVersion(): Promise<void> {
  try {
    // TODO: implement set_type_default_version
    throw new Error("set_type_default_version not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "set_type_default_version failed");
  }
}

/** Signal resource. */
export async function signalResource(stackName: string, logicalResourceId: string, uniqueId: string, status: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement signal_resource
    throw new Error("signal_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "signal_resource failed");
  }
}

/** Start resource scan. */
export async function startResourceScan(): Promise<StartResourceScanResult> {
  try {
    // TODO: implement start_resource_scan
    throw new Error("start_resource_scan not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_resource_scan failed");
  }
}

/** Stop stack set operation. */
export async function stopStackSetOperation(stackSetName: string, operationId: string): Promise<void> {
  try {
    // TODO: implement stop_stack_set_operation
    throw new Error("stop_stack_set_operation not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "stop_stack_set_operation failed");
  }
}

/** Update generated template. */
export async function updateGeneratedTemplate(generatedTemplateName: string): Promise<UpdateGeneratedTemplateResult> {
  try {
    // TODO: implement update_generated_template
    throw new Error("update_generated_template not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_generated_template failed");
  }
}

/** Update stack instances. */
export async function updateStackInstances(stackSetName: string, regions: string[]): Promise<UpdateStackInstancesResult> {
  try {
    // TODO: implement update_stack_instances
    throw new Error("update_stack_instances not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_stack_instances failed");
  }
}

/** Update stack set. */
export async function updateStackSet(stackSetName: string): Promise<UpdateStackSetResult> {
  try {
    // TODO: implement update_stack_set
    throw new Error("update_stack_set not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_stack_set failed");
  }
}

/** Update termination protection. */
export async function updateTerminationProtection(enableTerminationProtection: boolean, stackName: string, regionName?: string | undefined): Promise<UpdateTerminationProtectionResult> {
  try {
    // TODO: implement update_termination_protection
    throw new Error("update_termination_protection not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_termination_protection failed");
  }
}

/** Validate template. */
export async function validateTemplate(): Promise<ValidateTemplateResult> {
  try {
    // TODO: implement validate_template
    throw new Error("validate_template not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "validate_template failed");
  }
}
