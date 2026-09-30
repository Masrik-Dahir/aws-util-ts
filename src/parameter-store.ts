/**
 * aws-util/parameter-store — High-level AWS SSM Parameter Store utilities.
 *
 * Provides typed helpers for getting, putting, deleting, and batch-fetching
 * SSM parameters with automatic pagination and chunking.
 *
 * @example
 * ```ts
 * import {
 *   getParameter,
 *   putParameter,
 *   getParametersByPath,
 * } from "./parameter-store.js";
 *
 * const dbHost = await getParameter("/myapp/db/host");
 * await putParameter("/myapp/db/host", "new-host.example.com");
 * const all = await getParametersByPath("/myapp/");
 * ```
 *
 * @module
 */

import {
  SSMClient,
  GetParameterCommand,
  PutParameterCommand,
  DeleteParameterCommand,
  GetParametersByPathCommand,
  GetParametersCommand,
} from "@aws-sdk/client-ssm";
import { getClient } from "./client.js";
import { wrapAwsError } from "./exceptions.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Get a cached SSMClient for the given region.
 */
function ssm(region?: string): SSMClient {
  return getClient(SSMClient, region);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Fetch a single parameter from AWS SSM Parameter Store.
 *
 * Decryption is enabled by default so that `SecureString` parameters are
 * returned in plaintext.
 *
 * @param name - Full SSM parameter path, e.g. `"/myapp/db/username"`.
 * @param withDecryption - Decrypt `SecureString` parameters (default `true`).
 * @param region - AWS region override.
 * @returns The parameter value as a string.
 */
export async function getParameter(
  name: string,
  withDecryption: boolean = true,
  region?: string,
): Promise<string> {
  try {
    const resp = await ssm(region).send(
      new GetParameterCommand({
        Name: name,
        WithDecryption: withDecryption,
      }),
    );
    return resp.Parameter?.Value ?? "";
  } catch (err: unknown) {
    throw wrapAwsError(
      err,
      `getParameter(${name})`,
    );
  }
}

/**
 * Create or update an SSM Parameter Store parameter.
 *
 * @param name - Full parameter name, e.g. `"/myapp/db/host"`.
 * @param value - Parameter value.
 * @param description - Human-readable description.
 * @param type - `"String"` (default), `"StringList"`, or `"SecureString"`.
 * @param overwrite - If `true` (default), overwrite an existing parameter.
 * @param region - AWS region override.
 */
export async function putParameter(
  name: string,
  value: string,
  description?: string,
  type: string = "String",
  overwrite: boolean = true,
  region?: string,
): Promise<void> {
  try {
    await ssm(region).send(
      new PutParameterCommand({
        Name: name,
        Value: value,
        Type: type,
        Overwrite: overwrite,
        Description: description,
      }),
    );
  } catch (err: unknown) {
    throw wrapAwsError(
      err,
      `putParameter(${name})`,
    );
  }
}

/**
 * Delete a single SSM parameter.
 *
 * @param name - Full parameter name.
 * @param region - AWS region override.
 */
export async function deleteParameter(
  name: string,
  region?: string,
): Promise<void> {
  try {
    await ssm(region).send(
      new DeleteParameterCommand({ Name: name }),
    );
  } catch (err: unknown) {
    throw wrapAwsError(
      err,
      `deleteParameter(${name})`,
    );
  }
}

/**
 * Fetch all parameters whose path starts with the given prefix.
 *
 * Uses the `GetParametersByPath` API with automatic pagination. The path
 * prefix is stripped from the returned keys.
 *
 * @param path - SSM path prefix, e.g. `"/myapp/prod/"`.
 * @param withDecryption - Decrypt `SecureString` parameters (default `true`).
 * @param region - AWS region override.
 * @returns A dict mapping parameter name (with path prefix stripped) to value.
 */
export async function getParametersByPath(
  path: string,
  withDecryption: boolean = true,
  region?: string,
): Promise<Record<string, string>> {
  const result: Record<string, string> = {};
  let nextToken: string | undefined;

  // Ensure path ends with /
  const normalizedPath = path.endsWith("/") ? path : `${path}/`;

  try {
    do {
      const resp = await ssm(region).send(
        new GetParametersByPathCommand({
          Path: normalizedPath,
          Recursive: true,
          WithDecryption: withDecryption,
          NextToken: nextToken,
        }),
      );

      for (const param of resp.Parameters ?? []) {
        const name = param.Name ?? "";
        // Strip the path prefix from the key
        const key = name.startsWith(normalizedPath)
          ? name.slice(normalizedPath.length)
          : name;
        result[key] = param.Value ?? "";
      }

      nextToken = resp.NextToken;
    } while (nextToken);
  } catch (err: unknown) {
    throw wrapAwsError(
      err,
      `getParametersByPath(${path})`,
    );
  }

  return result;
}

/**
 * Fetch multiple SSM parameters by name in batches of 10.
 *
 * The `GetParameters` API supports at most 10 names per call. This function
 * automatically chunks larger lists.
 *
 * @param names - List of parameter names.
 * @param withDecryption - Decrypt `SecureString` parameters (default `true`).
 * @param region - AWS region override.
 * @returns A dict mapping parameter name to value. Parameters that do not
 *   exist are silently omitted.
 */
export async function getParametersBatch(
  names: string[],
  withDecryption: boolean = true,
  region?: string,
): Promise<Record<string, string>> {
  const result: Record<string, string> = {};

  // Chunk into groups of 10 (SSM GetParameters limit)
  for (let i = 0; i < names.length; i += 10) {
    const chunk = names.slice(i, i + 10);
    try {
      const resp = await ssm(region).send(
        new GetParametersCommand({
          Names: chunk,
          WithDecryption: withDecryption,
        }),
      );

      for (const param of resp.Parameters ?? []) {
        result[param.Name ?? ""] = param.Value ?? "";
      }
    } catch (err: unknown) {
      throw wrapAwsError(err, "getParametersBatch");
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Additional types (auto-generated)
// ---------------------------------------------------------------------------

/** Result of associate_ops_item_related_item. */
export type AssociateOpsItemRelatedItemResult = {
  associationId?: string | undefined;
};

/** Result of cancel_maintenance_window_execution. */
export type CancelMaintenanceWindowExecutionResult = {
  windowExecutionId?: string | undefined;
};

/** Result of create_activation. */
export type CreateActivationResult = {
  activationId?: string | undefined;
  activationCode?: string | undefined;
};

/** Result of create_association. */
export type CreateAssociationResult = {
  associationDescription?: Record<string, unknown>;
};

/** Result of create_association_batch. */
export type CreateAssociationBatchResult = {
  successful?: Record<string, unknown>[];
  failed?: Record<string, unknown>[];
};

/** Result of create_document. */
export type CreateDocumentResult = {
  documentDescription?: Record<string, unknown>;
};

/** Result of create_maintenance_window. */
export type CreateMaintenanceWindowResult = {
  windowId?: string | undefined;
};

/** Result of create_ops_item. */
export type CreateOpsItemResult = {
  opsItemId?: string | undefined;
  opsItemArn?: string | undefined;
};

/** Result of create_ops_metadata. */
export type CreateOpsMetadataResult = {
  opsMetadataArn?: string | undefined;
};

/** Result of create_patch_baseline. */
export type CreatePatchBaselineResult = {
  baselineId?: string | undefined;
};

/** Result of delete_inventory. */
export type DeleteInventoryResult = {
  deletionId?: string | undefined;
  typeName?: string | undefined;
  deletionSummary?: Record<string, unknown>;
};

/** Result of delete_maintenance_window. */
export type DeleteMaintenanceWindowResult = {
  windowId?: string | undefined;
};

/** Result of delete_patch_baseline. */
export type DeletePatchBaselineResult = {
  baselineId?: string | undefined;
};

/** Result of deregister_patch_baseline_for_patch_group. */
export type DeregisterPatchBaselineForPatchGroupResult = {
  baselineId?: string | undefined;
  patchGroup?: string | undefined;
};

/** Result of deregister_target_from_maintenance_window. */
export type DeregisterTargetFromMaintenanceWindowResult = {
  windowId?: string | undefined;
  windowTargetId?: string | undefined;
};

/** Result of deregister_task_from_maintenance_window. */
export type DeregisterTaskFromMaintenanceWindowResult = {
  windowId?: string | undefined;
  windowTaskId?: string | undefined;
};

/** Result of describe_activations. */
export type DescribeActivationsResult = {
  activationList?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_association. */
export type DescribeAssociationResult = {
  associationDescription?: Record<string, unknown>;
};

/** Result of describe_association_execution_targets. */
export type DescribeAssociationExecutionTargetsResult = {
  associationExecutionTargets?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_association_executions. */
export type DescribeAssociationExecutionsResult = {
  associationExecutions?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_automation_executions. */
export type DescribeAutomationExecutionsResult = {
  automationExecutionMetadataList?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_automation_step_executions. */
export type DescribeAutomationStepExecutionsResult = {
  stepExecutions?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_available_patches. */
export type DescribeAvailablePatchesResult = {
  patches?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_document. */
export type DescribeDocumentResult = {
  document?: Record<string, unknown>;
};

/** Result of describe_document_permission. */
export type DescribeDocumentPermissionResult = {
  accountIds?: string[];
  accountSharingInfoList?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_effective_instance_associations. */
export type DescribeEffectiveInstanceAssociationsResult = {
  associations?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_effective_patches_for_patch_baseline. */
export type DescribeEffectivePatchesForPatchBaselineResult = {
  effectivePatches?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_instance_associations_status. */
export type DescribeInstanceAssociationsStatusResult = {
  instanceAssociationStatusInfos?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_instance_information. */
export type DescribeInstanceInformationResult = {
  instanceInformationList?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_instance_patch_states. */
export type DescribeInstancePatchStatesResult = {
  instancePatchStates?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_instance_patch_states_for_patch_group. */
export type DescribeInstancePatchStatesForPatchGroupResult = {
  instancePatchStates?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_instance_patches. */
export type DescribeInstancePatchesResult = {
  patches?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_instance_properties. */
export type DescribeInstancePropertiesResult = {
  instanceProperties?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_inventory_deletions. */
export type DescribeInventoryDeletionsResult = {
  inventoryDeletions?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_maintenance_window_execution_task_invocations. */
export type DescribeMaintenanceWindowExecutionTaskInvocationsResult = {
  windowExecutionTaskInvocationIdentities?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_maintenance_window_execution_tasks. */
export type DescribeMaintenanceWindowExecutionTasksResult = {
  windowExecutionTaskIdentities?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_maintenance_window_executions. */
export type DescribeMaintenanceWindowExecutionsResult = {
  windowExecutions?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_maintenance_window_schedule. */
export type DescribeMaintenanceWindowScheduleResult = {
  scheduledWindowExecutions?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_maintenance_window_targets. */
export type DescribeMaintenanceWindowTargetsResult = {
  targets?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_maintenance_window_tasks. */
export type DescribeMaintenanceWindowTasksResult = {
  tasks?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_maintenance_windows. */
export type DescribeMaintenanceWindowsResult = {
  windowIdentities?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_maintenance_windows_for_target. */
export type DescribeMaintenanceWindowsForTargetResult = {
  windowIdentities?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_ops_items. */
export type DescribeOpsItemsResult = {
  nextToken?: string | undefined;
  opsItemSummaries?: Record<string, unknown>[];
};

/** Result of describe_patch_baselines. */
export type DescribePatchBaselinesResult = {
  baselineIdentities?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_patch_group_state. */
export type DescribePatchGroupStateResult = {
  instances?: number | undefined;
  instancesWithInstalledPatches?: number | undefined;
  instancesWithInstalledOtherPatches?: number | undefined;
  instancesWithInstalledPendingRebootPatches?: number | undefined;
  instancesWithInstalledRejectedPatches?: number | undefined;
  instancesWithMissingPatches?: number | undefined;
  instancesWithFailedPatches?: number | undefined;
  instancesWithNotApplicablePatches?: number | undefined;
  instancesWithUnreportedNotApplicablePatches?: number | undefined;
  instancesWithCriticalNonCompliantPatches?: number | undefined;
  instancesWithSecurityNonCompliantPatches?: number | undefined;
  instancesWithOtherNonCompliantPatches?: number | undefined;
  instancesWithAvailableSecurityUpdates?: number | undefined;
};

/** Result of describe_patch_groups. */
export type DescribePatchGroupsResult = {
  mappings?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_patch_properties. */
export type DescribePatchPropertiesResult = {
  properties?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_sessions. */
export type DescribeSessionsResult = {
  sessions?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of get_access_token. */
export type GetAccessTokenResult = {
  credentials?: Record<string, unknown>;
  accessRequestStatus?: string | undefined;
};

/** Result of get_automation_execution. */
export type GetAutomationExecutionResult = {
  automationExecution?: Record<string, unknown>;
};

/** Result of get_calendar_state. */
export type GetCalendarStateResult = {
  state?: string | undefined;
  atTime?: string | undefined;
  nextTransitionTime?: string | undefined;
};

/** Result of get_command_invocation. */
export type GetCommandInvocationResult = {
  commandId?: string | undefined;
  instanceId?: string | undefined;
  comment?: string | undefined;
  documentName?: string | undefined;
  documentVersion?: string | undefined;
  pluginName?: string | undefined;
  responseCode?: number | undefined;
  executionStartDateTime?: string | undefined;
  executionElapsedTime?: string | undefined;
  executionEndDateTime?: string | undefined;
  status?: string | undefined;
  statusDetails?: string | undefined;
  standardOutputContent?: string | undefined;
  standardOutputUrl?: string | undefined;
  standardErrorContent?: string | undefined;
  standardErrorUrl?: string | undefined;
  cloudWatchOutputConfig?: Record<string, unknown>;
};

/** Result of get_connection_status. */
export type GetConnectionStatusResult = {
  target?: string | undefined;
  status?: string | undefined;
};

/** Result of get_default_patch_baseline. */
export type GetDefaultPatchBaselineResult = {
  baselineId?: string | undefined;
  operatingSystem?: string | undefined;
};

/** Result of get_deployable_patch_snapshot_for_instance. */
export type GetDeployablePatchSnapshotForInstanceResult = {
  instanceId?: string | undefined;
  snapshotId?: string | undefined;
  snapshotDownloadUrl?: string | undefined;
  product?: string | undefined;
};

/** Result of get_document. */
export type GetDocumentResult = {
  name?: string | undefined;
  createdDate?: string | undefined;
  displayName?: string | undefined;
  versionName?: string | undefined;
  documentVersion?: string | undefined;
  status?: string | undefined;
  statusInformation?: string | undefined;
  content?: string | undefined;
  documentType?: string | undefined;
  documentFormat?: string | undefined;
  requires?: Record<string, unknown>[];
  attachmentsContent?: Record<string, unknown>[];
  reviewStatus?: string | undefined;
};

/** Result of get_execution_preview. */
export type GetExecutionPreviewResult = {
  executionPreviewId?: string | undefined;
  endedAt?: string | undefined;
  status?: string | undefined;
  statusMessage?: string | undefined;
  executionPreview?: Record<string, unknown>;
};

/** Result of get_inventory. */
export type GetInventoryResult = {
  entities?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of get_inventory_schema. */
export type GetInventorySchemaResult = {
  schemas?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of get_maintenance_window. */
export type GetMaintenanceWindowResult = {
  windowId?: string | undefined;
  name?: string | undefined;
  description?: string | undefined;
  startDate?: string | undefined;
  endDate?: string | undefined;
  schedule?: string | undefined;
  scheduleTimezone?: string | undefined;
  scheduleOffset?: number | undefined;
  nextExecutionTime?: string | undefined;
  duration?: number | undefined;
  cutoff?: number | undefined;
  allowUnassociatedTargets?: boolean | undefined;
  enabled?: boolean | undefined;
  createdDate?: string | undefined;
  modifiedDate?: string | undefined;
};

/** Result of get_maintenance_window_execution. */
export type GetMaintenanceWindowExecutionResult = {
  windowExecutionId?: string | undefined;
  taskIds?: string[];
  status?: string | undefined;
  statusDetails?: string | undefined;
  startTime?: string | undefined;
  endTime?: string | undefined;
};

/** Result of get_maintenance_window_execution_task. */
export type GetMaintenanceWindowExecutionTaskResult = {
  windowExecutionId?: string | undefined;
  taskExecutionId?: string | undefined;
  taskArn?: string | undefined;
  serviceRole?: string | undefined;
  typeValue?: string | undefined;
  taskParameters?: Record<string, unknown>[];
  priority?: number | undefined;
  maxConcurrency?: string | undefined;
  maxErrors?: string | undefined;
  status?: string | undefined;
  statusDetails?: string | undefined;
  startTime?: string | undefined;
  endTime?: string | undefined;
  alarmConfiguration?: Record<string, unknown>;
  triggeredAlarms?: Record<string, unknown>[];
};

/** Result of get_maintenance_window_execution_task_invocation. */
export type GetMaintenanceWindowExecutionTaskInvocationResult = {
  windowExecutionId?: string | undefined;
  taskExecutionId?: string | undefined;
  invocationId?: string | undefined;
  executionId?: string | undefined;
  taskType?: string | undefined;
  parameters?: string | undefined;
  status?: string | undefined;
  statusDetails?: string | undefined;
  startTime?: string | undefined;
  endTime?: string | undefined;
  ownerInformation?: string | undefined;
  windowTargetId?: string | undefined;
};

/** Result of get_maintenance_window_task. */
export type GetMaintenanceWindowTaskResult = {
  windowId?: string | undefined;
  windowTaskId?: string | undefined;
  targets?: Record<string, unknown>[];
  taskArn?: string | undefined;
  serviceRoleArn?: string | undefined;
  taskType?: string | undefined;
  taskParameters?: Record<string, unknown>;
  taskInvocationParameters?: Record<string, unknown>;
  priority?: number | undefined;
  maxConcurrency?: string | undefined;
  maxErrors?: string | undefined;
  loggingInfo?: Record<string, unknown>;
  name?: string | undefined;
  description?: string | undefined;
  cutoffBehavior?: string | undefined;
  alarmConfiguration?: Record<string, unknown>;
};

/** Result of get_ops_item. */
export type GetOpsItemResult = {
  opsItem?: Record<string, unknown>;
};

/** Result of get_ops_metadata. */
export type GetOpsMetadataResult = {
  resourceId?: string | undefined;
  metadata?: Record<string, unknown>;
  nextToken?: string | undefined;
};

/** Result of get_ops_summary. */
export type GetOpsSummaryResult = {
  entities?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of get_parameter_history. */
export type GetParameterHistoryResult = {
  parameters?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of get_parameters. */
export type GetParametersResult = {
  parameters?: Record<string, unknown>[];
  invalidParameters?: string[];
};

/** Result of get_patch_baseline. */
export type GetPatchBaselineResult = {
  baselineId?: string | undefined;
  name?: string | undefined;
  operatingSystem?: string | undefined;
  globalFilters?: Record<string, unknown>;
  approvalRules?: Record<string, unknown>;
  approvedPatches?: string[];
  approvedPatchesComplianceLevel?: string | undefined;
  approvedPatchesEnableNonSecurity?: boolean | undefined;
  rejectedPatches?: string[];
  rejectedPatchesAction?: string | undefined;
  patchGroups?: string[];
  createdDate?: string | undefined;
  modifiedDate?: string | undefined;
  description?: string | undefined;
  sources?: Record<string, unknown>[];
  availableSecurityUpdatesComplianceStatus?: string | undefined;
};

/** Result of get_patch_baseline_for_patch_group. */
export type GetPatchBaselineForPatchGroupResult = {
  baselineId?: string | undefined;
  patchGroup?: string | undefined;
  operatingSystem?: string | undefined;
};

/** Result of get_resource_policies. */
export type GetResourcePoliciesResult = {
  nextToken?: string | undefined;
  policies?: Record<string, unknown>[];
};

/** Result of get_service_setting. */
export type GetServiceSettingResult = {
  serviceSetting?: Record<string, unknown>;
};

/** Result of label_parameter_version. */
export type LabelParameterVersionResult = {
  invalidLabels?: string[];
  parameterVersion?: number | undefined;
};

/** Result of list_association_versions. */
export type ListAssociationVersionsResult = {
  associationVersions?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_associations. */
export type ListAssociationsResult = {
  associations?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_command_invocations. */
export type ListCommandInvocationsResult = {
  commandInvocations?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_commands. */
export type ListCommandsResult = {
  commands?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_compliance_items. */
export type ListComplianceItemsResult = {
  complianceItems?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_compliance_summaries. */
export type ListComplianceSummariesResult = {
  complianceSummaryItems?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_document_metadata_history. */
export type ListDocumentMetadataHistoryResult = {
  name?: string | undefined;
  documentVersion?: string | undefined;
  author?: string | undefined;
  metadata?: Record<string, unknown>;
  nextToken?: string | undefined;
};

/** Result of list_document_versions. */
export type ListDocumentVersionsResult = {
  documentVersions?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_documents. */
export type ListDocumentsResult = {
  documentIdentifiers?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_inventory_entries. */
export type ListInventoryEntriesResult = {
  typeName?: string | undefined;
  instanceId?: string | undefined;
  schemaVersion?: string | undefined;
  captureTime?: string | undefined;
  entries?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_nodes. */
export type ListNodesResult = {
  nodes?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_nodes_summary. */
export type ListNodesSummaryResult = {
  summary?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_ops_item_events. */
export type ListOpsItemEventsResult = {
  nextToken?: string | undefined;
  summaries?: Record<string, unknown>[];
};

/** Result of list_ops_item_related_items. */
export type ListOpsItemRelatedItemsResult = {
  nextToken?: string | undefined;
  summaries?: Record<string, unknown>[];
};

/** Result of list_ops_metadata. */
export type ListOpsMetadataResult = {
  opsMetadataList?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_resource_compliance_summaries. */
export type ListResourceComplianceSummariesResult = {
  resourceComplianceSummaryItems?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_resource_data_sync. */
export type ListResourceDataSyncResult = {
  resourceDataSyncItems?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_tags_for_resource. */
export type ListTagsForResourceResult = {
  tagList?: Record<string, unknown>[];
};

/** Result of put_inventory. */
export type PutInventoryResult = {
  message?: string | undefined;
};

/** Result of put_resource_policy. */
export type PutResourcePolicyResult = {
  policyId?: string | undefined;
  policyHash?: string | undefined;
};

/** Result of register_default_patch_baseline. */
export type RegisterDefaultPatchBaselineResult = {
  baselineId?: string | undefined;
};

/** Result of register_patch_baseline_for_patch_group. */
export type RegisterPatchBaselineForPatchGroupResult = {
  baselineId?: string | undefined;
  patchGroup?: string | undefined;
};

/** Result of register_target_with_maintenance_window. */
export type RegisterTargetWithMaintenanceWindowResult = {
  windowTargetId?: string | undefined;
};

/** Result of register_task_with_maintenance_window. */
export type RegisterTaskWithMaintenanceWindowResult = {
  windowTaskId?: string | undefined;
};

/** Result of reset_service_setting. */
export type ResetServiceSettingResult = {
  serviceSetting?: Record<string, unknown>;
};

/** Result of resume_session. */
export type ResumeSessionResult = {
  sessionId?: string | undefined;
  tokenValue?: string | undefined;
  streamUrl?: string | undefined;
};

/** Result of send_command. */
export type SendCommandResult = {
  command?: Record<string, unknown>;
};

/** Result of start_access_request. */
export type StartAccessRequestResult = {
  accessRequestId?: string | undefined;
};

/** Result of start_automation_execution. */
export type StartAutomationExecutionResult = {
  automationExecutionId?: string | undefined;
};

/** Result of start_change_request_execution. */
export type StartChangeRequestExecutionResult = {
  automationExecutionId?: string | undefined;
};

/** Result of start_execution_preview. */
export type StartExecutionPreviewResult = {
  executionPreviewId?: string | undefined;
};

/** Result of start_session. */
export type StartSessionResult = {
  sessionId?: string | undefined;
  tokenValue?: string | undefined;
  streamUrl?: string | undefined;
};

/** Result of terminate_session. */
export type TerminateSessionResult = {
  sessionId?: string | undefined;
};

/** Result of unlabel_parameter_version. */
export type UnlabelParameterVersionResult = {
  removedLabels?: string[];
  invalidLabels?: string[];
};

/** Result of update_association. */
export type UpdateAssociationResult = {
  associationDescription?: Record<string, unknown>;
};

/** Result of update_association_status. */
export type UpdateAssociationStatusResult = {
  associationDescription?: Record<string, unknown>;
};

/** Result of update_document. */
export type UpdateDocumentResult = {
  documentDescription?: Record<string, unknown>;
};

/** Result of update_document_default_version. */
export type UpdateDocumentDefaultVersionResult = {
  description?: Record<string, unknown>;
};

/** Result of update_maintenance_window. */
export type UpdateMaintenanceWindowResult = {
  windowId?: string | undefined;
  name?: string | undefined;
  description?: string | undefined;
  startDate?: string | undefined;
  endDate?: string | undefined;
  schedule?: string | undefined;
  scheduleTimezone?: string | undefined;
  scheduleOffset?: number | undefined;
  duration?: number | undefined;
  cutoff?: number | undefined;
  allowUnassociatedTargets?: boolean | undefined;
  enabled?: boolean | undefined;
};

/** Result of update_maintenance_window_target. */
export type UpdateMaintenanceWindowTargetResult = {
  windowId?: string | undefined;
  windowTargetId?: string | undefined;
  targets?: Record<string, unknown>[];
  ownerInformation?: string | undefined;
  name?: string | undefined;
  description?: string | undefined;
};

/** Result of update_maintenance_window_task. */
export type UpdateMaintenanceWindowTaskResult = {
  windowId?: string | undefined;
  windowTaskId?: string | undefined;
  targets?: Record<string, unknown>[];
  taskArn?: string | undefined;
  serviceRoleArn?: string | undefined;
  taskParameters?: Record<string, unknown>;
  taskInvocationParameters?: Record<string, unknown>;
  priority?: number | undefined;
  maxConcurrency?: string | undefined;
  maxErrors?: string | undefined;
  loggingInfo?: Record<string, unknown>;
  name?: string | undefined;
  description?: string | undefined;
  cutoffBehavior?: string | undefined;
  alarmConfiguration?: Record<string, unknown>;
};

/** Result of update_ops_metadata. */
export type UpdateOpsMetadataResult = {
  opsMetadataArn?: string | undefined;
};

/** Result of update_patch_baseline. */
export type UpdatePatchBaselineResult = {
  baselineId?: string | undefined;
  name?: string | undefined;
  operatingSystem?: string | undefined;
  globalFilters?: Record<string, unknown>;
  approvalRules?: Record<string, unknown>;
  approvedPatches?: string[];
  approvedPatchesComplianceLevel?: string | undefined;
  approvedPatchesEnableNonSecurity?: boolean | undefined;
  rejectedPatches?: string[];
  rejectedPatchesAction?: string | undefined;
  createdDate?: string | undefined;
  modifiedDate?: string | undefined;
  description?: string | undefined;
  sources?: Record<string, unknown>[];
  availableSecurityUpdatesComplianceStatus?: string | undefined;
};


// ---------------------------------------------------------------------------
// Additional functions (auto-generated)
// ---------------------------------------------------------------------------

/** List SSM parameters with optional filters. */
export async function describeParameters(filters?: Record<string, unknown>[], maxResults: number, regionName?: string | undefined): Promise<Record<string, unknown>[]> {
  try {
    // TODO: implement describe_parameters
    throw new Error("describe_parameters not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_parameters failed");
  }
}

/** Delete up to 10 SSM parameters in a single API call. */
export async function deleteParameters(names: string[], regionName?: string | undefined): Promise<string[]> {
  try {
    // TODO: implement delete_parameters
    throw new Error("delete_parameters not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_parameters failed");
  }
}

/** Add tags to resource. */
export async function addTagsToResource(resourceType: string, resourceId: string, tags: Record<string, unknown>[], regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement add_tags_to_resource
    throw new Error("add_tags_to_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "add_tags_to_resource failed");
  }
}

/** Associate ops item related item. */
export async function associateOpsItemRelatedItem(opsItemId: string, associationType: string, resourceType: string, resourceUri: string, regionName?: string | undefined): Promise<AssociateOpsItemRelatedItemResult> {
  try {
    // TODO: implement associate_ops_item_related_item
    throw new Error("associate_ops_item_related_item not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "associate_ops_item_related_item failed");
  }
}

/** Cancel command. */
export async function cancelCommand(commandId: string): Promise<void> {
  try {
    // TODO: implement cancel_command
    throw new Error("cancel_command not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "cancel_command failed");
  }
}

/** Cancel maintenance window execution. */
export async function cancelMaintenanceWindowExecution(windowExecutionId: string, regionName?: string | undefined): Promise<CancelMaintenanceWindowExecutionResult> {
  try {
    // TODO: implement cancel_maintenance_window_execution
    throw new Error("cancel_maintenance_window_execution not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "cancel_maintenance_window_execution failed");
  }
}

/** Create activation. */
export async function createActivation(iamRole: string): Promise<CreateActivationResult> {
  try {
    // TODO: implement create_activation
    throw new Error("create_activation not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_activation failed");
  }
}

/** Create association. */
export async function createAssociation(name: string): Promise<CreateAssociationResult> {
  try {
    // TODO: implement create_association
    throw new Error("create_association not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_association failed");
  }
}

/** Create association batch. */
export async function createAssociationBatch(entries: Record<string, unknown>[], regionName?: string | undefined): Promise<CreateAssociationBatchResult> {
  try {
    // TODO: implement create_association_batch
    throw new Error("create_association_batch not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_association_batch failed");
  }
}

/** Create document. */
export async function createDocument(content: string, name: string): Promise<CreateDocumentResult> {
  try {
    // TODO: implement create_document
    throw new Error("create_document not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_document failed");
  }
}

/** Create maintenance window. */
export async function createMaintenanceWindow(name: string, schedule: string, duration: number, cutoff: number, allowUnassociatedTargets: boolean): Promise<CreateMaintenanceWindowResult> {
  try {
    // TODO: implement create_maintenance_window
    throw new Error("create_maintenance_window not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_maintenance_window failed");
  }
}

/** Create ops item. */
export async function createOpsItem(description: string, source: string, title: string): Promise<CreateOpsItemResult> {
  try {
    // TODO: implement create_ops_item
    throw new Error("create_ops_item not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_ops_item failed");
  }
}

/** Create ops metadata. */
export async function createOpsMetadata(resourceId: string): Promise<CreateOpsMetadataResult> {
  try {
    // TODO: implement create_ops_metadata
    throw new Error("create_ops_metadata not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_ops_metadata failed");
  }
}

/** Create patch baseline. */
export async function createPatchBaseline(name: string): Promise<CreatePatchBaselineResult> {
  try {
    // TODO: implement create_patch_baseline
    throw new Error("create_patch_baseline not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_patch_baseline failed");
  }
}

/** Create resource data sync. */
export async function createResourceDataSync(syncName: string): Promise<void> {
  try {
    // TODO: implement create_resource_data_sync
    throw new Error("create_resource_data_sync not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_resource_data_sync failed");
  }
}

/** Delete activation. */
export async function deleteActivation(activationId: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_activation
    throw new Error("delete_activation not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_activation failed");
  }
}

/** Delete association. */
export async function deleteAssociation(): Promise<void> {
  try {
    // TODO: implement delete_association
    throw new Error("delete_association not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_association failed");
  }
}

/** Delete document. */
export async function deleteDocument(name: string): Promise<void> {
  try {
    // TODO: implement delete_document
    throw new Error("delete_document not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_document failed");
  }
}

/** Delete inventory. */
export async function deleteInventory(typeName: string): Promise<DeleteInventoryResult> {
  try {
    // TODO: implement delete_inventory
    throw new Error("delete_inventory not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_inventory failed");
  }
}

/** Delete maintenance window. */
export async function deleteMaintenanceWindow(windowId: string, regionName?: string | undefined): Promise<DeleteMaintenanceWindowResult> {
  try {
    // TODO: implement delete_maintenance_window
    throw new Error("delete_maintenance_window not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_maintenance_window failed");
  }
}

/** Delete ops item. */
export async function deleteOpsItem(opsItemId: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_ops_item
    throw new Error("delete_ops_item not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_ops_item failed");
  }
}

/** Delete ops metadata. */
export async function deleteOpsMetadata(opsMetadataArn: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_ops_metadata
    throw new Error("delete_ops_metadata not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_ops_metadata failed");
  }
}

/** Delete patch baseline. */
export async function deletePatchBaseline(baselineId: string, regionName?: string | undefined): Promise<DeletePatchBaselineResult> {
  try {
    // TODO: implement delete_patch_baseline
    throw new Error("delete_patch_baseline not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_patch_baseline failed");
  }
}

/** Delete resource data sync. */
export async function deleteResourceDataSync(syncName: string): Promise<void> {
  try {
    // TODO: implement delete_resource_data_sync
    throw new Error("delete_resource_data_sync not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_resource_data_sync failed");
  }
}

/** Delete resource policy. */
export async function deleteResourcePolicy(resourceArn: string, policyId: string, policyHash: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_resource_policy
    throw new Error("delete_resource_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_resource_policy failed");
  }
}

/** Deregister managed instance. */
export async function deregisterManagedInstance(instanceId: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement deregister_managed_instance
    throw new Error("deregister_managed_instance not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "deregister_managed_instance failed");
  }
}

/** Deregister patch baseline for patch group. */
export async function deregisterPatchBaselineForPatchGroup(baselineId: string, patchGroup: string, regionName?: string | undefined): Promise<DeregisterPatchBaselineForPatchGroupResult> {
  try {
    // TODO: implement deregister_patch_baseline_for_patch_group
    throw new Error("deregister_patch_baseline_for_patch_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "deregister_patch_baseline_for_patch_group failed");
  }
}

/** Deregister target from maintenance window. */
export async function deregisterTargetFromMaintenanceWindow(windowId: string, windowTargetId: string): Promise<DeregisterTargetFromMaintenanceWindowResult> {
  try {
    // TODO: implement deregister_target_from_maintenance_window
    throw new Error("deregister_target_from_maintenance_window not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "deregister_target_from_maintenance_window failed");
  }
}

/** Deregister task from maintenance window. */
export async function deregisterTaskFromMaintenanceWindow(windowId: string, windowTaskId: string, regionName?: string | undefined): Promise<DeregisterTaskFromMaintenanceWindowResult> {
  try {
    // TODO: implement deregister_task_from_maintenance_window
    throw new Error("deregister_task_from_maintenance_window not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "deregister_task_from_maintenance_window failed");
  }
}

/** Describe activations. */
export async function describeActivations(): Promise<DescribeActivationsResult> {
  try {
    // TODO: implement describe_activations
    throw new Error("describe_activations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_activations failed");
  }
}

/** Describe association. */
export async function describeAssociation(): Promise<DescribeAssociationResult> {
  try {
    // TODO: implement describe_association
    throw new Error("describe_association not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_association failed");
  }
}

/** Describe association execution targets. */
export async function describeAssociationExecutionTargets(associationId: string, executionId: string): Promise<DescribeAssociationExecutionTargetsResult> {
  try {
    // TODO: implement describe_association_execution_targets
    throw new Error("describe_association_execution_targets not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_association_execution_targets failed");
  }
}

/** Describe association executions. */
export async function describeAssociationExecutions(associationId: string): Promise<DescribeAssociationExecutionsResult> {
  try {
    // TODO: implement describe_association_executions
    throw new Error("describe_association_executions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_association_executions failed");
  }
}

/** Describe automation executions. */
export async function describeAutomationExecutions(): Promise<DescribeAutomationExecutionsResult> {
  try {
    // TODO: implement describe_automation_executions
    throw new Error("describe_automation_executions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_automation_executions failed");
  }
}

/** Describe automation step executions. */
export async function describeAutomationStepExecutions(automationExecutionId: string): Promise<DescribeAutomationStepExecutionsResult> {
  try {
    // TODO: implement describe_automation_step_executions
    throw new Error("describe_automation_step_executions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_automation_step_executions failed");
  }
}

/** Describe available patches. */
export async function describeAvailablePatches(): Promise<DescribeAvailablePatchesResult> {
  try {
    // TODO: implement describe_available_patches
    throw new Error("describe_available_patches not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_available_patches failed");
  }
}

/** Describe document. */
export async function describeDocument(name: string): Promise<DescribeDocumentResult> {
  try {
    // TODO: implement describe_document
    throw new Error("describe_document not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_document failed");
  }
}

/** Describe document permission. */
export async function describeDocumentPermission(name: string, permissionType: string): Promise<DescribeDocumentPermissionResult> {
  try {
    // TODO: implement describe_document_permission
    throw new Error("describe_document_permission not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_document_permission failed");
  }
}

/** Describe effective instance associations. */
export async function describeEffectiveInstanceAssociations(instanceId: string): Promise<DescribeEffectiveInstanceAssociationsResult> {
  try {
    // TODO: implement describe_effective_instance_associations
    throw new Error("describe_effective_instance_associations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_effective_instance_associations failed");
  }
}

/** Describe effective patches for patch baseline. */
export async function describeEffectivePatchesForPatchBaseline(baselineId: string): Promise<DescribeEffectivePatchesForPatchBaselineResult> {
  try {
    // TODO: implement describe_effective_patches_for_patch_baseline
    throw new Error("describe_effective_patches_for_patch_baseline not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_effective_patches_for_patch_baseline failed");
  }
}

/** Describe instance associations status. */
export async function describeInstanceAssociationsStatus(instanceId: string): Promise<DescribeInstanceAssociationsStatusResult> {
  try {
    // TODO: implement describe_instance_associations_status
    throw new Error("describe_instance_associations_status not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_instance_associations_status failed");
  }
}

/** Describe instance information. */
export async function describeInstanceInformation(): Promise<DescribeInstanceInformationResult> {
  try {
    // TODO: implement describe_instance_information
    throw new Error("describe_instance_information not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_instance_information failed");
  }
}

/** Describe instance patch states. */
export async function describeInstancePatchStates(instanceIds: string[]): Promise<DescribeInstancePatchStatesResult> {
  try {
    // TODO: implement describe_instance_patch_states
    throw new Error("describe_instance_patch_states not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_instance_patch_states failed");
  }
}

/** Describe instance patch states for patch group. */
export async function describeInstancePatchStatesForPatchGroup(patchGroup: string): Promise<DescribeInstancePatchStatesForPatchGroupResult> {
  try {
    // TODO: implement describe_instance_patch_states_for_patch_group
    throw new Error("describe_instance_patch_states_for_patch_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_instance_patch_states_for_patch_group failed");
  }
}

/** Describe instance patches. */
export async function describeInstancePatches(instanceId: string): Promise<DescribeInstancePatchesResult> {
  try {
    // TODO: implement describe_instance_patches
    throw new Error("describe_instance_patches not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_instance_patches failed");
  }
}

/** Describe instance properties. */
export async function describeInstanceProperties(): Promise<DescribeInstancePropertiesResult> {
  try {
    // TODO: implement describe_instance_properties
    throw new Error("describe_instance_properties not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_instance_properties failed");
  }
}

/** Describe inventory deletions. */
export async function describeInventoryDeletions(): Promise<DescribeInventoryDeletionsResult> {
  try {
    // TODO: implement describe_inventory_deletions
    throw new Error("describe_inventory_deletions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_inventory_deletions failed");
  }
}

/** Describe maintenance window execution task invocations. */
export async function describeMaintenanceWindowExecutionTaskInvocations(windowExecutionId: string, taskId: string): Promise<DescribeMaintenanceWindowExecutionTaskInvocationsResult> {
  try {
    // TODO: implement describe_maintenance_window_execution_task_invocations
    throw new Error("describe_maintenance_window_execution_task_invocations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_maintenance_window_execution_task_invocations failed");
  }
}

/** Describe maintenance window execution tasks. */
export async function describeMaintenanceWindowExecutionTasks(windowExecutionId: string): Promise<DescribeMaintenanceWindowExecutionTasksResult> {
  try {
    // TODO: implement describe_maintenance_window_execution_tasks
    throw new Error("describe_maintenance_window_execution_tasks not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_maintenance_window_execution_tasks failed");
  }
}

/** Describe maintenance window executions. */
export async function describeMaintenanceWindowExecutions(windowId: string): Promise<DescribeMaintenanceWindowExecutionsResult> {
  try {
    // TODO: implement describe_maintenance_window_executions
    throw new Error("describe_maintenance_window_executions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_maintenance_window_executions failed");
  }
}

/** Describe maintenance window schedule. */
export async function describeMaintenanceWindowSchedule(): Promise<DescribeMaintenanceWindowScheduleResult> {
  try {
    // TODO: implement describe_maintenance_window_schedule
    throw new Error("describe_maintenance_window_schedule not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_maintenance_window_schedule failed");
  }
}

/** Describe maintenance window targets. */
export async function describeMaintenanceWindowTargets(windowId: string): Promise<DescribeMaintenanceWindowTargetsResult> {
  try {
    // TODO: implement describe_maintenance_window_targets
    throw new Error("describe_maintenance_window_targets not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_maintenance_window_targets failed");
  }
}

/** Describe maintenance window tasks. */
export async function describeMaintenanceWindowTasks(windowId: string): Promise<DescribeMaintenanceWindowTasksResult> {
  try {
    // TODO: implement describe_maintenance_window_tasks
    throw new Error("describe_maintenance_window_tasks not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_maintenance_window_tasks failed");
  }
}

/** Describe maintenance windows. */
export async function describeMaintenanceWindows(): Promise<DescribeMaintenanceWindowsResult> {
  try {
    // TODO: implement describe_maintenance_windows
    throw new Error("describe_maintenance_windows not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_maintenance_windows failed");
  }
}

/** Describe maintenance windows for target. */
export async function describeMaintenanceWindowsForTarget(targets: Record<string, unknown>[], resourceType: string): Promise<DescribeMaintenanceWindowsForTargetResult> {
  try {
    // TODO: implement describe_maintenance_windows_for_target
    throw new Error("describe_maintenance_windows_for_target not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_maintenance_windows_for_target failed");
  }
}

/** Describe ops items. */
export async function describeOpsItems(): Promise<DescribeOpsItemsResult> {
  try {
    // TODO: implement describe_ops_items
    throw new Error("describe_ops_items not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_ops_items failed");
  }
}

/** Describe patch baselines. */
export async function describePatchBaselines(): Promise<DescribePatchBaselinesResult> {
  try {
    // TODO: implement describe_patch_baselines
    throw new Error("describe_patch_baselines not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_patch_baselines failed");
  }
}

/** Describe patch group state. */
export async function describePatchGroupState(patchGroup: string, regionName?: string | undefined): Promise<DescribePatchGroupStateResult> {
  try {
    // TODO: implement describe_patch_group_state
    throw new Error("describe_patch_group_state not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_patch_group_state failed");
  }
}

/** Describe patch groups. */
export async function describePatchGroups(): Promise<DescribePatchGroupsResult> {
  try {
    // TODO: implement describe_patch_groups
    throw new Error("describe_patch_groups not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_patch_groups failed");
  }
}

/** Describe patch properties. */
export async function describePatchProperties(operatingSystem: string, property: string): Promise<DescribePatchPropertiesResult> {
  try {
    // TODO: implement describe_patch_properties
    throw new Error("describe_patch_properties not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_patch_properties failed");
  }
}

/** Describe sessions. */
export async function describeSessions(state: string): Promise<DescribeSessionsResult> {
  try {
    // TODO: implement describe_sessions
    throw new Error("describe_sessions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_sessions failed");
  }
}

/** Disassociate ops item related item. */
export async function disassociateOpsItemRelatedItem(opsItemId: string, associationId: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement disassociate_ops_item_related_item
    throw new Error("disassociate_ops_item_related_item not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disassociate_ops_item_related_item failed");
  }
}

/** Get access token. */
export async function getAccessToken(accessRequestId: string, regionName?: string | undefined): Promise<GetAccessTokenResult> {
  try {
    // TODO: implement get_access_token
    throw new Error("get_access_token not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_access_token failed");
  }
}

/** Get automation execution. */
export async function getAutomationExecution(automationExecutionId: string, regionName?: string | undefined): Promise<GetAutomationExecutionResult> {
  try {
    // TODO: implement get_automation_execution
    throw new Error("get_automation_execution not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_automation_execution failed");
  }
}

/** Get calendar state. */
export async function getCalendarState(calendarNames: string[]): Promise<GetCalendarStateResult> {
  try {
    // TODO: implement get_calendar_state
    throw new Error("get_calendar_state not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_calendar_state failed");
  }
}

/** Get command invocation. */
export async function getCommandInvocation(commandId: string, instanceId: string): Promise<GetCommandInvocationResult> {
  try {
    // TODO: implement get_command_invocation
    throw new Error("get_command_invocation not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_command_invocation failed");
  }
}

/** Get connection status. */
export async function getConnectionStatus(target: string, regionName?: string | undefined): Promise<GetConnectionStatusResult> {
  try {
    // TODO: implement get_connection_status
    throw new Error("get_connection_status not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_connection_status failed");
  }
}

/** Get default patch baseline. */
export async function getDefaultPatchBaseline(): Promise<GetDefaultPatchBaselineResult> {
  try {
    // TODO: implement get_default_patch_baseline
    throw new Error("get_default_patch_baseline not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_default_patch_baseline failed");
  }
}

/** Get deployable patch snapshot for instance. */
export async function getDeployablePatchSnapshotForInstance(instanceId: string, snapshotId: string): Promise<GetDeployablePatchSnapshotForInstanceResult> {
  try {
    // TODO: implement get_deployable_patch_snapshot_for_instance
    throw new Error("get_deployable_patch_snapshot_for_instance not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_deployable_patch_snapshot_for_instance failed");
  }
}

/** Get document. */
export async function getDocument(name: string): Promise<GetDocumentResult> {
  try {
    // TODO: implement get_document
    throw new Error("get_document not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_document failed");
  }
}

/** Get execution preview. */
export async function getExecutionPreview(executionPreviewId: string, regionName?: string | undefined): Promise<GetExecutionPreviewResult> {
  try {
    // TODO: implement get_execution_preview
    throw new Error("get_execution_preview not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_execution_preview failed");
  }
}

/** Get inventory. */
export async function getInventory(): Promise<GetInventoryResult> {
  try {
    // TODO: implement get_inventory
    throw new Error("get_inventory not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_inventory failed");
  }
}

/** Get inventory schema. */
export async function getInventorySchema(): Promise<GetInventorySchemaResult> {
  try {
    // TODO: implement get_inventory_schema
    throw new Error("get_inventory_schema not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_inventory_schema failed");
  }
}

/** Get maintenance window. */
export async function getMaintenanceWindow(windowId: string, regionName?: string | undefined): Promise<GetMaintenanceWindowResult> {
  try {
    // TODO: implement get_maintenance_window
    throw new Error("get_maintenance_window not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_maintenance_window failed");
  }
}

/** Get maintenance window execution. */
export async function getMaintenanceWindowExecution(windowExecutionId: string, regionName?: string | undefined): Promise<GetMaintenanceWindowExecutionResult> {
  try {
    // TODO: implement get_maintenance_window_execution
    throw new Error("get_maintenance_window_execution not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_maintenance_window_execution failed");
  }
}

/** Get maintenance window execution task. */
export async function getMaintenanceWindowExecutionTask(windowExecutionId: string, taskId: string, regionName?: string | undefined): Promise<GetMaintenanceWindowExecutionTaskResult> {
  try {
    // TODO: implement get_maintenance_window_execution_task
    throw new Error("get_maintenance_window_execution_task not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_maintenance_window_execution_task failed");
  }
}

/** Get maintenance window execution task invocation. */
export async function getMaintenanceWindowExecutionTaskInvocation(windowExecutionId: string, taskId: string, invocationId: string, regionName?: string | undefined): Promise<GetMaintenanceWindowExecutionTaskInvocationResult> {
  try {
    // TODO: implement get_maintenance_window_execution_task_invocation
    throw new Error("get_maintenance_window_execution_task_invocation not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_maintenance_window_execution_task_invocation failed");
  }
}

/** Get maintenance window task. */
export async function getMaintenanceWindowTask(windowId: string, windowTaskId: string, regionName?: string | undefined): Promise<GetMaintenanceWindowTaskResult> {
  try {
    // TODO: implement get_maintenance_window_task
    throw new Error("get_maintenance_window_task not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_maintenance_window_task failed");
  }
}

/** Get ops item. */
export async function getOpsItem(opsItemId: string): Promise<GetOpsItemResult> {
  try {
    // TODO: implement get_ops_item
    throw new Error("get_ops_item not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_ops_item failed");
  }
}

/** Get ops metadata. */
export async function getOpsMetadata(opsMetadataArn: string): Promise<GetOpsMetadataResult> {
  try {
    // TODO: implement get_ops_metadata
    throw new Error("get_ops_metadata not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_ops_metadata failed");
  }
}

/** Get ops summary. */
export async function getOpsSummary(): Promise<GetOpsSummaryResult> {
  try {
    // TODO: implement get_ops_summary
    throw new Error("get_ops_summary not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_ops_summary failed");
  }
}

/** Get parameter history. */
export async function getParameterHistory(name: string): Promise<GetParameterHistoryResult> {
  try {
    // TODO: implement get_parameter_history
    throw new Error("get_parameter_history not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_parameter_history failed");
  }
}

/** Get parameters. */
export async function getParameters(names: string[]): Promise<GetParametersResult> {
  try {
    // TODO: implement get_parameters
    throw new Error("get_parameters not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_parameters failed");
  }
}

/** Get patch baseline. */
export async function getPatchBaseline(baselineId: string, regionName?: string | undefined): Promise<GetPatchBaselineResult> {
  try {
    // TODO: implement get_patch_baseline
    throw new Error("get_patch_baseline not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_patch_baseline failed");
  }
}

/** Get patch baseline for patch group. */
export async function getPatchBaselineForPatchGroup(patchGroup: string): Promise<GetPatchBaselineForPatchGroupResult> {
  try {
    // TODO: implement get_patch_baseline_for_patch_group
    throw new Error("get_patch_baseline_for_patch_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_patch_baseline_for_patch_group failed");
  }
}

/** Get resource policies. */
export async function getResourcePolicies(resourceArn: string): Promise<GetResourcePoliciesResult> {
  try {
    // TODO: implement get_resource_policies
    throw new Error("get_resource_policies not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_resource_policies failed");
  }
}

/** Get service setting. */
export async function getServiceSetting(settingId: string, regionName?: string | undefined): Promise<GetServiceSettingResult> {
  try {
    // TODO: implement get_service_setting
    throw new Error("get_service_setting not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_service_setting failed");
  }
}

/** Label parameter version. */
export async function labelParameterVersion(name: string, labels: string[]): Promise<LabelParameterVersionResult> {
  try {
    // TODO: implement label_parameter_version
    throw new Error("label_parameter_version not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "label_parameter_version failed");
  }
}

/** List association versions. */
export async function listAssociationVersions(associationId: string): Promise<ListAssociationVersionsResult> {
  try {
    // TODO: implement list_association_versions
    throw new Error("list_association_versions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_association_versions failed");
  }
}

/** List associations. */
export async function listAssociations(): Promise<ListAssociationsResult> {
  try {
    // TODO: implement list_associations
    throw new Error("list_associations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_associations failed");
  }
}

/** List command invocations. */
export async function listCommandInvocations(): Promise<ListCommandInvocationsResult> {
  try {
    // TODO: implement list_command_invocations
    throw new Error("list_command_invocations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_command_invocations failed");
  }
}

/** List commands. */
export async function listCommands(): Promise<ListCommandsResult> {
  try {
    // TODO: implement list_commands
    throw new Error("list_commands not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_commands failed");
  }
}

/** List compliance items. */
export async function listComplianceItems(): Promise<ListComplianceItemsResult> {
  try {
    // TODO: implement list_compliance_items
    throw new Error("list_compliance_items not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_compliance_items failed");
  }
}

/** List compliance summaries. */
export async function listComplianceSummaries(): Promise<ListComplianceSummariesResult> {
  try {
    // TODO: implement list_compliance_summaries
    throw new Error("list_compliance_summaries not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_compliance_summaries failed");
  }
}

/** List document metadata history. */
export async function listDocumentMetadataHistory(name: string, metadata: string): Promise<ListDocumentMetadataHistoryResult> {
  try {
    // TODO: implement list_document_metadata_history
    throw new Error("list_document_metadata_history not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_document_metadata_history failed");
  }
}

/** List document versions. */
export async function listDocumentVersions(name: string): Promise<ListDocumentVersionsResult> {
  try {
    // TODO: implement list_document_versions
    throw new Error("list_document_versions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_document_versions failed");
  }
}

/** List documents. */
export async function listDocuments(): Promise<ListDocumentsResult> {
  try {
    // TODO: implement list_documents
    throw new Error("list_documents not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_documents failed");
  }
}

/** List inventory entries. */
export async function listInventoryEntries(instanceId: string, typeName: string): Promise<ListInventoryEntriesResult> {
  try {
    // TODO: implement list_inventory_entries
    throw new Error("list_inventory_entries not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_inventory_entries failed");
  }
}

/** List nodes. */
export async function listNodes(): Promise<ListNodesResult> {
  try {
    // TODO: implement list_nodes
    throw new Error("list_nodes not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_nodes failed");
  }
}

/** List nodes summary. */
export async function listNodesSummary(aggregators: Record<string, unknown>[]): Promise<ListNodesSummaryResult> {
  try {
    // TODO: implement list_nodes_summary
    throw new Error("list_nodes_summary not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_nodes_summary failed");
  }
}

/** List ops item events. */
export async function listOpsItemEvents(): Promise<ListOpsItemEventsResult> {
  try {
    // TODO: implement list_ops_item_events
    throw new Error("list_ops_item_events not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_ops_item_events failed");
  }
}

/** List ops item related items. */
export async function listOpsItemRelatedItems(): Promise<ListOpsItemRelatedItemsResult> {
  try {
    // TODO: implement list_ops_item_related_items
    throw new Error("list_ops_item_related_items not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_ops_item_related_items failed");
  }
}

/** List ops metadata. */
export async function listOpsMetadata(): Promise<ListOpsMetadataResult> {
  try {
    // TODO: implement list_ops_metadata
    throw new Error("list_ops_metadata not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_ops_metadata failed");
  }
}

/** List resource compliance summaries. */
export async function listResourceComplianceSummaries(): Promise<ListResourceComplianceSummariesResult> {
  try {
    // TODO: implement list_resource_compliance_summaries
    throw new Error("list_resource_compliance_summaries not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_resource_compliance_summaries failed");
  }
}

/** List resource data sync. */
export async function listResourceDataSync(): Promise<ListResourceDataSyncResult> {
  try {
    // TODO: implement list_resource_data_sync
    throw new Error("list_resource_data_sync not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_resource_data_sync failed");
  }
}

/** List tags for resource. */
export async function listTagsForResource(resourceType: string, resourceId: string, regionName?: string | undefined): Promise<ListTagsForResourceResult> {
  try {
    // TODO: implement list_tags_for_resource
    throw new Error("list_tags_for_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_tags_for_resource failed");
  }
}

/** Modify document permission. */
export async function modifyDocumentPermission(name: string, permissionType: string): Promise<void> {
  try {
    // TODO: implement modify_document_permission
    throw new Error("modify_document_permission not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_document_permission failed");
  }
}

/** Put compliance items. */
export async function putComplianceItems(resourceId: string, resourceType: string, complianceType: string, executionSummary: Record<string, unknown>, items: Record<string, unknown>[]): Promise<void> {
  try {
    // TODO: implement put_compliance_items
    throw new Error("put_compliance_items not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_compliance_items failed");
  }
}

/** Put inventory. */
export async function putInventory(instanceId: string, items: Record<string, unknown>[], regionName?: string | undefined): Promise<PutInventoryResult> {
  try {
    // TODO: implement put_inventory
    throw new Error("put_inventory not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_inventory failed");
  }
}

/** Put resource policy. */
export async function putResourcePolicy(resourceArn: string, policy: string): Promise<PutResourcePolicyResult> {
  try {
    // TODO: implement put_resource_policy
    throw new Error("put_resource_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_resource_policy failed");
  }
}

/** Register default patch baseline. */
export async function registerDefaultPatchBaseline(baselineId: string, regionName?: string | undefined): Promise<RegisterDefaultPatchBaselineResult> {
  try {
    // TODO: implement register_default_patch_baseline
    throw new Error("register_default_patch_baseline not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "register_default_patch_baseline failed");
  }
}

/** Register patch baseline for patch group. */
export async function registerPatchBaselineForPatchGroup(baselineId: string, patchGroup: string, regionName?: string | undefined): Promise<RegisterPatchBaselineForPatchGroupResult> {
  try {
    // TODO: implement register_patch_baseline_for_patch_group
    throw new Error("register_patch_baseline_for_patch_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "register_patch_baseline_for_patch_group failed");
  }
}

/** Register target with maintenance window. */
export async function registerTargetWithMaintenanceWindow(windowId: string, resourceType: string, targets: Record<string, unknown>[]): Promise<RegisterTargetWithMaintenanceWindowResult> {
  try {
    // TODO: implement register_target_with_maintenance_window
    throw new Error("register_target_with_maintenance_window not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "register_target_with_maintenance_window failed");
  }
}

/** Register task with maintenance window. */
export async function registerTaskWithMaintenanceWindow(windowId: string, taskArn: string, taskType: string): Promise<RegisterTaskWithMaintenanceWindowResult> {
  try {
    // TODO: implement register_task_with_maintenance_window
    throw new Error("register_task_with_maintenance_window not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "register_task_with_maintenance_window failed");
  }
}

/** Remove tags from resource. */
export async function removeTagsFromResource(resourceType: string, resourceId: string, tagKeys: string[], regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement remove_tags_from_resource
    throw new Error("remove_tags_from_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "remove_tags_from_resource failed");
  }
}

/** Reset service setting. */
export async function resetServiceSetting(settingId: string, regionName?: string | undefined): Promise<ResetServiceSettingResult> {
  try {
    // TODO: implement reset_service_setting
    throw new Error("reset_service_setting not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "reset_service_setting failed");
  }
}

/** Resume session. */
export async function resumeSession(sessionId: string, regionName?: string | undefined): Promise<ResumeSessionResult> {
  try {
    // TODO: implement resume_session
    throw new Error("resume_session not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "resume_session failed");
  }
}

/** Send automation signal. */
export async function sendAutomationSignal(automationExecutionId: string, signalType: string): Promise<void> {
  try {
    // TODO: implement send_automation_signal
    throw new Error("send_automation_signal not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "send_automation_signal failed");
  }
}

/** Send command. */
export async function sendCommand(documentName: string): Promise<SendCommandResult> {
  try {
    // TODO: implement send_command
    throw new Error("send_command not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "send_command failed");
  }
}

/** Start access request. */
export async function startAccessRequest(reason: string, targets: Record<string, unknown>[]): Promise<StartAccessRequestResult> {
  try {
    // TODO: implement start_access_request
    throw new Error("start_access_request not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_access_request failed");
  }
}

/** Start associations once. */
export async function startAssociationsOnce(associationIds: string[], regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement start_associations_once
    throw new Error("start_associations_once not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_associations_once failed");
  }
}

/** Start automation execution. */
export async function startAutomationExecution(documentName: string): Promise<StartAutomationExecutionResult> {
  try {
    // TODO: implement start_automation_execution
    throw new Error("start_automation_execution not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_automation_execution failed");
  }
}

/** Start change request execution. */
export async function startChangeRequestExecution(documentName: string, runbooks: Record<string, unknown>[]): Promise<StartChangeRequestExecutionResult> {
  try {
    // TODO: implement start_change_request_execution
    throw new Error("start_change_request_execution not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_change_request_execution failed");
  }
}

/** Start execution preview. */
export async function startExecutionPreview(documentName: string): Promise<StartExecutionPreviewResult> {
  try {
    // TODO: implement start_execution_preview
    throw new Error("start_execution_preview not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_execution_preview failed");
  }
}

/** Start session. */
export async function startSession(target: string): Promise<StartSessionResult> {
  try {
    // TODO: implement start_session
    throw new Error("start_session not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_session failed");
  }
}

/** Stop automation execution. */
export async function stopAutomationExecution(automationExecutionId: string): Promise<void> {
  try {
    // TODO: implement stop_automation_execution
    throw new Error("stop_automation_execution not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "stop_automation_execution failed");
  }
}

/** Terminate session. */
export async function terminateSession(sessionId: string, regionName?: string | undefined): Promise<TerminateSessionResult> {
  try {
    // TODO: implement terminate_session
    throw new Error("terminate_session not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "terminate_session failed");
  }
}

/** Unlabel parameter version. */
export async function unlabelParameterVersion(name: string, parameterVersion: number, labels: string[], regionName?: string | undefined): Promise<UnlabelParameterVersionResult> {
  try {
    // TODO: implement unlabel_parameter_version
    throw new Error("unlabel_parameter_version not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "unlabel_parameter_version failed");
  }
}

/** Update association. */
export async function updateAssociation(associationId: string): Promise<UpdateAssociationResult> {
  try {
    // TODO: implement update_association
    throw new Error("update_association not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_association failed");
  }
}

/** Update association status. */
export async function updateAssociationStatus(name: string, instanceId: string, associationStatus: Record<string, unknown>, regionName?: string | undefined): Promise<UpdateAssociationStatusResult> {
  try {
    // TODO: implement update_association_status
    throw new Error("update_association_status not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_association_status failed");
  }
}

/** Update document. */
export async function updateDocument(content: string, name: string): Promise<UpdateDocumentResult> {
  try {
    // TODO: implement update_document
    throw new Error("update_document not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_document failed");
  }
}

/** Update document default version. */
export async function updateDocumentDefaultVersion(name: string, documentVersion: string, regionName?: string | undefined): Promise<UpdateDocumentDefaultVersionResult> {
  try {
    // TODO: implement update_document_default_version
    throw new Error("update_document_default_version not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_document_default_version failed");
  }
}

/** Update document metadata. */
export async function updateDocumentMetadata(name: string, documentReviews: Record<string, unknown>): Promise<void> {
  try {
    // TODO: implement update_document_metadata
    throw new Error("update_document_metadata not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_document_metadata failed");
  }
}

/** Update maintenance window. */
export async function updateMaintenanceWindow(windowId: string): Promise<UpdateMaintenanceWindowResult> {
  try {
    // TODO: implement update_maintenance_window
    throw new Error("update_maintenance_window not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_maintenance_window failed");
  }
}

/** Update maintenance window target. */
export async function updateMaintenanceWindowTarget(windowId: string, windowTargetId: string): Promise<UpdateMaintenanceWindowTargetResult> {
  try {
    // TODO: implement update_maintenance_window_target
    throw new Error("update_maintenance_window_target not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_maintenance_window_target failed");
  }
}

/** Update maintenance window task. */
export async function updateMaintenanceWindowTask(windowId: string, windowTaskId: string): Promise<UpdateMaintenanceWindowTaskResult> {
  try {
    // TODO: implement update_maintenance_window_task
    throw new Error("update_maintenance_window_task not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_maintenance_window_task failed");
  }
}

/** Update managed instance role. */
export async function updateManagedInstanceRole(instanceId: string, iamRole: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement update_managed_instance_role
    throw new Error("update_managed_instance_role not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_managed_instance_role failed");
  }
}

/** Update ops item. */
export async function updateOpsItem(opsItemId: string): Promise<void> {
  try {
    // TODO: implement update_ops_item
    throw new Error("update_ops_item not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_ops_item failed");
  }
}

/** Update ops metadata. */
export async function updateOpsMetadata(opsMetadataArn: string): Promise<UpdateOpsMetadataResult> {
  try {
    // TODO: implement update_ops_metadata
    throw new Error("update_ops_metadata not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_ops_metadata failed");
  }
}

/** Update patch baseline. */
export async function updatePatchBaseline(baselineId: string): Promise<UpdatePatchBaselineResult> {
  try {
    // TODO: implement update_patch_baseline
    throw new Error("update_patch_baseline not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_patch_baseline failed");
  }
}

/** Update resource data sync. */
export async function updateResourceDataSync(syncName: string, syncType: string, syncSource: Record<string, unknown>, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement update_resource_data_sync
    throw new Error("update_resource_data_sync not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_resource_data_sync failed");
  }
}

/** Update service setting. */
export async function updateServiceSetting(settingId: string, settingValue: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement update_service_setting
    throw new Error("update_service_setting not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_service_setting failed");
  }
}
