/**
 * aws-util/lambda — High-level AWS Lambda invocation utilities.
 *
 * Provides typed helpers for synchronous and fire-and-forget invocation,
 * retry with exponential backoff, and concurrent fan-out across payloads.
 *
 * @example
 * ```ts
 * import { invoke, fanOut } from "./lambda.js";
 *
 * const result = await invoke("my-function", { key: "value" });
 * console.log(result.payload);
 *
 * const results = await fanOut("my-function", [
 *   { id: 1 },
 *   { id: 2 },
 *   { id: 3 },
 * ]);
 * ```
 *
 * @module
 */

import { z } from "zod";
import {
  LambdaClient,
  InvokeCommand,
} from "@aws-sdk/client-lambda";
import { getClient } from "./client.js";
import {
  wrapAwsError,
  AwsThrottlingError,
} from "./exceptions.js";

// ---------------------------------------------------------------------------
// Zod schemas
// ---------------------------------------------------------------------------

/** Schema for the result of a Lambda invocation. */
export const InvokeResultSchema = z.object({
  statusCode: z.number(),
  payload: z.unknown(),
  functionError: z.string().optional(),
  logResult: z.string().optional(),
});

/** Result of {@link invoke} or an individual entry from {@link fanOut}. */
export type InvokeResult = z.infer<typeof InvokeResultSchema>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Check whether an invocation result indicates success (2xx status, no function error).
 *
 * @param result - The invoke result to check.
 * @returns `true` if the invocation succeeded.
 */
export function invokeResultSucceeded(result: InvokeResult): boolean {
  return (
    result.statusCode >= 200 &&
    result.statusCode < 300 &&
    result.functionError === undefined
  );
}

/**
 * Decode a `Uint8Array` payload into a parsed JSON value or a raw string.
 */
function decodePayload(raw: Uint8Array | undefined): unknown {
  if (!raw || raw.length === 0) {
    return undefined;
  }
  const text = new TextDecoder().decode(raw);
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/**
 * Decode a base64-encoded log result.
 */
function decodeLogResult(raw: string | undefined): string | undefined {
  if (!raw) {
    return undefined;
  }
  try {
    return atob(raw);
  } catch {
    return raw;
  }
}

/**
 * Build a Lambda client for the given region.
 */
function lambda(region?: string): LambdaClient {
  return getClient(LambdaClient, region);
}

/**
 * Determine if an error is retryable (throttling or 5xx server error).
 */
function isRetryable(err: unknown): boolean {
  if (err instanceof AwsThrottlingError) {
    return true;
  }
  // AWS SDK v3 service errors may carry an HTTP status code
  if (
    err != null &&
    typeof err === "object" &&
    "$metadata" in err
  ) {
    const meta = (err as Record<string, unknown>)["$metadata"];
    if (
      meta != null &&
      typeof meta === "object" &&
      "httpStatusCode" in meta
    ) {
      const code = (meta as Record<string, unknown>)[
        "httpStatusCode"
      ] as number;
      return code >= 500 && code < 600;
    }
  }
  return false;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Invoke a Lambda function synchronously and return the parsed result.
 *
 * The response payload is decoded from `Uint8Array` using `TextDecoder` and
 * then JSON-parsed (with a fallback to the raw string). If `logType` is
 * `"Tail"`, the log output is base64-decoded.
 *
 * @param functionName - The function name, ARN, or partial ARN.
 * @param payload - Input payload (will be JSON-serialized).
 * @param invocationType - `"RequestResponse"` (default), `"Event"`, or `"DryRun"`.
 * @param logType - `"None"` (default) or `"Tail"` to include execution logs.
 * @param qualifier - Version or alias qualifier.
 * @param region - AWS region override.
 * @returns The invocation result with decoded payload and logs.
 */
export async function invoke(
  functionName: string,
  payload?: unknown,
  invocationType?: "RequestResponse" | "Event" | "DryRun",
  logType?: "None" | "Tail",
  qualifier?: string,
  region?: string,
): Promise<InvokeResult> {
  try {
    const encodedPayload =
      payload !== undefined
        ? new TextEncoder().encode(JSON.stringify(payload))
        : undefined;

    const res = await lambda(region).send(
      new InvokeCommand({
        FunctionName: functionName,
        Payload: encodedPayload,
        InvocationType: invocationType ?? "RequestResponse",
        LogType: logType ?? "None",
        Qualifier: qualifier,
      }),
    );

    return InvokeResultSchema.parse({
      statusCode: res.StatusCode ?? 0,
      payload: decodePayload(res.Payload),
      functionError: res.FunctionError ?? undefined,
      logResult: decodeLogResult(res.LogResult ?? undefined),
    });
  } catch (err: unknown) {
    throw wrapAwsError(err, `invoke(${functionName})`);
  }
}

/**
 * Invoke a Lambda function asynchronously (fire-and-forget).
 *
 * Uses the `Event` invocation type. The function returns once Lambda has
 * accepted the event; it does not wait for execution to complete.
 *
 * @param functionName - The function name, ARN, or partial ARN.
 * @param payload - Input payload (will be JSON-serialized).
 * @param qualifier - Version or alias qualifier.
 * @param region - AWS region override.
 */
export async function invokeAsync(
  functionName: string,
  payload?: unknown,
  qualifier?: string,
  region?: string,
): Promise<void> {
  try {
    const encodedPayload =
      payload !== undefined
        ? new TextEncoder().encode(JSON.stringify(payload))
        : undefined;

    await lambda(region).send(
      new InvokeCommand({
        FunctionName: functionName,
        Payload: encodedPayload,
        InvocationType: "Event",
        Qualifier: qualifier,
      }),
    );
  } catch (err: unknown) {
    throw wrapAwsError(err, `invokeAsync(${functionName})`);
  }
}

/**
 * Invoke a Lambda function with automatic retry on throttling or 5xx errors.
 *
 * Uses exponential backoff with jitter. The first retry waits
 * `backoffBase` ms, the second `backoffBase * 2`, etc., each with up to
 * 25 % random jitter.
 *
 * @param functionName - The function name, ARN, or partial ARN.
 * @param payload - Input payload (will be JSON-serialized).
 * @param maxRetries - Maximum number of retry attempts (default 3).
 * @param backoffBase - Base backoff delay in milliseconds (default 500).
 * @param qualifier - Version or alias qualifier.
 * @param region - AWS region override.
 * @returns The invocation result from the first successful attempt.
 * @throws The last error if all retries are exhausted.
 */
export async function invokeWithRetry(
  functionName: string,
  payload?: unknown,
  maxRetries?: number,
  backoffBase?: number,
  qualifier?: string,
  region?: string,
): Promise<InvokeResult> {
  const effectiveMaxRetries = maxRetries ?? 3;
  const effectiveBackoff = backoffBase ?? 500;
  let lastError: unknown;

  for (let attempt = 0; attempt <= effectiveMaxRetries; attempt++) {
    try {
      return await invoke(
        functionName,
        payload,
        "RequestResponse",
        "None",
        qualifier,
        region,
      );
    } catch (err: unknown) {
      lastError = err;

      // Only retry on throttling or 5xx
      if (attempt < effectiveMaxRetries && isRetryable(err)) {
        const delay =
          effectiveBackoff *
          Math.pow(2, attempt) *
          (1 + Math.random() * 0.25);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      throw wrapAwsError(
        err,
        `invokeWithRetry(${functionName}) failed after ${attempt + 1} attempt(s)`,
      );
    }
  }

  // Should never reach here, but satisfy the compiler
  throw wrapAwsError(
    lastError,
    `invokeWithRetry(${functionName}) exhausted retries`,
  );
}

/**
 * Invoke a Lambda function concurrently with multiple payloads.
 *
 * Payloads are processed in chunks of `maxConcurrency` using
 * `Promise.allSettled`. All invocations use `RequestResponse` type.
 *
 * Failed invocations are represented with a status code of `0`, the error
 * message as the payload, and `functionError` set to `"Unhandled"`.
 *
 * @param functionName - The function name, ARN, or partial ARN.
 * @param payloads - Array of payloads, one per invocation.
 * @param maxConcurrency - Maximum concurrent invocations (default 10).
 * @param qualifier - Version or alias qualifier.
 * @param region - AWS region override.
 * @returns An array of invocation results (one per payload, in order).
 */
export async function fanOut(
  functionName: string,
  payloads: unknown[],
  maxConcurrency?: number,
  qualifier?: string,
  region?: string,
): Promise<InvokeResult[]> {
  const concurrency = maxConcurrency ?? 10;
  const results: InvokeResult[] = [];

  for (let i = 0; i < payloads.length; i += concurrency) {
    const chunk = payloads.slice(i, i + concurrency);
    const settled = await Promise.allSettled(
      chunk.map((p) =>
        invoke(
          functionName,
          p,
          "RequestResponse",
          "None",
          qualifier,
          region,
        ),
      ),
    );

    for (const outcome of settled) {
      if (outcome.status === "fulfilled") {
        results.push(outcome.value);
      } else {
        // Represent failure as a synthetic InvokeResult
        const errMsg =
          outcome.reason instanceof Error
            ? outcome.reason.message
            : String(outcome.reason);
        results.push(
          InvokeResultSchema.parse({
            statusCode: 0,
            payload: errMsg,
            functionError: "Unhandled",
            logResult: undefined,
          }),
        );
      }
    }
  }

  return results;
}

// ---------------------------------------------------------------------------
// Additional types (auto-generated)
// ---------------------------------------------------------------------------

/** Result of add_layer_version_permission. */
export type AddLayerVersionPermissionResult = {
  statement?: string | undefined;
  revisionId?: string | undefined;
};

/** Result of add_permission. */
export type AddPermissionResult = {
  statement?: string | undefined;
};

/** Result of create_alias. */
export type CreateAliasResult = {
  aliasArn?: string | undefined;
  name?: string | undefined;
  functionVersion?: string | undefined;
  description?: string | undefined;
  routingConfig?: Record<string, unknown>;
  revisionId?: string | undefined;
};

/** Result of create_code_signing_config. */
export type CreateCodeSigningConfigResult = {
  codeSigningConfig?: Record<string, unknown>;
};

/** Result of create_event_source_mapping. */
export type CreateEventSourceMappingResult = {
  uuid?: string | undefined;
  startingPosition?: string | undefined;
  startingPositionTimestamp?: string | undefined;
  batchSize?: number | undefined;
  maximumBatchingWindowInSeconds?: number | undefined;
  parallelizationFactor?: number | undefined;
  eventSourceArn?: string | undefined;
  filterCriteria?: Record<string, unknown>;
  functionArn?: string | undefined;
  lastModified?: string | undefined;
  lastProcessingResult?: string | undefined;
  state?: string | undefined;
  stateTransitionReason?: string | undefined;
  destinationConfig?: Record<string, unknown>;
  topics?: string[];
  queues?: string[];
  sourceAccessConfigurations?: Record<string, unknown>[];
  selfManagedEventSource?: Record<string, unknown>;
  maximumRecordAgeInSeconds?: number | undefined;
  bisectBatchOnFunctionError?: boolean | undefined;
  maximumRetryAttempts?: number | undefined;
  tumblingWindowInSeconds?: number | undefined;
  functionResponseTypes?: string[];
  amazonManagedKafkaEventSourceConfig?: Record<string, unknown>;
  selfManagedKafkaEventSourceConfig?: Record<string, unknown>;
  scalingConfig?: Record<string, unknown>;
  documentDbEventSourceConfig?: Record<string, unknown>;
  kmsKeyArn?: string | undefined;
  filterCriteriaError?: Record<string, unknown>;
  eventSourceMappingArn?: string | undefined;
  metricsConfig?: Record<string, unknown>;
  provisionedPollerConfig?: Record<string, unknown>;
};

/** Result of create_function. */
export type CreateFunctionResult = {
  functionName?: string | undefined;
  functionArn?: string | undefined;
  runtime?: string | undefined;
  role?: string | undefined;
  handler?: string | undefined;
  codeSize?: number | undefined;
  description?: string | undefined;
  timeout?: number | undefined;
  memorySize?: number | undefined;
  lastModified?: string | undefined;
  codeSha256?: string | undefined;
  version?: string | undefined;
  vpcConfig?: Record<string, unknown>;
  deadLetterConfig?: Record<string, unknown>;
  environment?: Record<string, unknown>;
  kmsKeyArn?: string | undefined;
  tracingConfig?: Record<string, unknown>;
  masterArn?: string | undefined;
  revisionId?: string | undefined;
  layers?: Record<string, unknown>[];
  state?: string | undefined;
  stateReason?: string | undefined;
  stateReasonCode?: string | undefined;
  lastUpdateStatus?: string | undefined;
  lastUpdateStatusReason?: string | undefined;
  lastUpdateStatusReasonCode?: string | undefined;
  fileSystemConfigs?: Record<string, unknown>[];
  packageType?: string | undefined;
  imageConfigResponse?: Record<string, unknown>;
  signingProfileVersionArn?: string | undefined;
  signingJobArn?: string | undefined;
  architectures?: string[];
  ephemeralStorage?: Record<string, unknown>;
  snapStart?: Record<string, unknown>;
  runtimeVersionConfig?: Record<string, unknown>;
  loggingConfig?: Record<string, unknown>;
};

/** Result of create_function_url_config. */
export type CreateFunctionUrlConfigResult = {
  functionUrl?: string | undefined;
  functionArn?: string | undefined;
  authType?: string | undefined;
  cors?: Record<string, unknown>;
  creationTime?: string | undefined;
  invokeMode?: string | undefined;
};

/** Result of delete_event_source_mapping. */
export type DeleteEventSourceMappingResult = {
  uuid?: string | undefined;
  startingPosition?: string | undefined;
  startingPositionTimestamp?: string | undefined;
  batchSize?: number | undefined;
  maximumBatchingWindowInSeconds?: number | undefined;
  parallelizationFactor?: number | undefined;
  eventSourceArn?: string | undefined;
  filterCriteria?: Record<string, unknown>;
  functionArn?: string | undefined;
  lastModified?: string | undefined;
  lastProcessingResult?: string | undefined;
  state?: string | undefined;
  stateTransitionReason?: string | undefined;
  destinationConfig?: Record<string, unknown>;
  topics?: string[];
  queues?: string[];
  sourceAccessConfigurations?: Record<string, unknown>[];
  selfManagedEventSource?: Record<string, unknown>;
  maximumRecordAgeInSeconds?: number | undefined;
  bisectBatchOnFunctionError?: boolean | undefined;
  maximumRetryAttempts?: number | undefined;
  tumblingWindowInSeconds?: number | undefined;
  functionResponseTypes?: string[];
  amazonManagedKafkaEventSourceConfig?: Record<string, unknown>;
  selfManagedKafkaEventSourceConfig?: Record<string, unknown>;
  scalingConfig?: Record<string, unknown>;
  documentDbEventSourceConfig?: Record<string, unknown>;
  kmsKeyArn?: string | undefined;
  filterCriteriaError?: Record<string, unknown>;
  eventSourceMappingArn?: string | undefined;
  metricsConfig?: Record<string, unknown>;
  provisionedPollerConfig?: Record<string, unknown>;
};

/** Result of get_account_settings. */
export type GetAccountSettingsResult = {
  accountLimit?: Record<string, unknown>;
  accountUsage?: Record<string, unknown>;
};

/** Result of get_alias. */
export type GetAliasResult = {
  aliasArn?: string | undefined;
  name?: string | undefined;
  functionVersion?: string | undefined;
  description?: string | undefined;
  routingConfig?: Record<string, unknown>;
  revisionId?: string | undefined;
};

/** Result of get_code_signing_config. */
export type GetCodeSigningConfigResult = {
  codeSigningConfig?: Record<string, unknown>;
};

/** Result of get_event_source_mapping. */
export type GetEventSourceMappingResult = {
  uuid?: string | undefined;
  startingPosition?: string | undefined;
  startingPositionTimestamp?: string | undefined;
  batchSize?: number | undefined;
  maximumBatchingWindowInSeconds?: number | undefined;
  parallelizationFactor?: number | undefined;
  eventSourceArn?: string | undefined;
  filterCriteria?: Record<string, unknown>;
  functionArn?: string | undefined;
  lastModified?: string | undefined;
  lastProcessingResult?: string | undefined;
  state?: string | undefined;
  stateTransitionReason?: string | undefined;
  destinationConfig?: Record<string, unknown>;
  topics?: string[];
  queues?: string[];
  sourceAccessConfigurations?: Record<string, unknown>[];
  selfManagedEventSource?: Record<string, unknown>;
  maximumRecordAgeInSeconds?: number | undefined;
  bisectBatchOnFunctionError?: boolean | undefined;
  maximumRetryAttempts?: number | undefined;
  tumblingWindowInSeconds?: number | undefined;
  functionResponseTypes?: string[];
  amazonManagedKafkaEventSourceConfig?: Record<string, unknown>;
  selfManagedKafkaEventSourceConfig?: Record<string, unknown>;
  scalingConfig?: Record<string, unknown>;
  documentDbEventSourceConfig?: Record<string, unknown>;
  kmsKeyArn?: string | undefined;
  filterCriteriaError?: Record<string, unknown>;
  eventSourceMappingArn?: string | undefined;
  metricsConfig?: Record<string, unknown>;
  provisionedPollerConfig?: Record<string, unknown>;
};

/** Result of get_function. */
export type GetFunctionResult = {
  configuration?: Record<string, unknown>;
  code?: Record<string, unknown>;
  tags?: Record<string, unknown>;
  tagsError?: Record<string, unknown>;
  concurrency?: Record<string, unknown>;
};

/** Result of get_function_code_signing_config. */
export type GetFunctionCodeSigningConfigResult = {
  codeSigningConfigArn?: string | undefined;
  functionName?: string | undefined;
};

/** Result of get_function_concurrency. */
export type GetFunctionConcurrencyResult = {
  reservedConcurrentExecutions?: number | undefined;
};

/** Result of get_function_configuration. */
export type GetFunctionConfigurationResult = {
  functionName?: string | undefined;
  functionArn?: string | undefined;
  runtime?: string | undefined;
  role?: string | undefined;
  handler?: string | undefined;
  codeSize?: number | undefined;
  description?: string | undefined;
  timeout?: number | undefined;
  memorySize?: number | undefined;
  lastModified?: string | undefined;
  codeSha256?: string | undefined;
  version?: string | undefined;
  vpcConfig?: Record<string, unknown>;
  deadLetterConfig?: Record<string, unknown>;
  environment?: Record<string, unknown>;
  kmsKeyArn?: string | undefined;
  tracingConfig?: Record<string, unknown>;
  masterArn?: string | undefined;
  revisionId?: string | undefined;
  layers?: Record<string, unknown>[];
  state?: string | undefined;
  stateReason?: string | undefined;
  stateReasonCode?: string | undefined;
  lastUpdateStatus?: string | undefined;
  lastUpdateStatusReason?: string | undefined;
  lastUpdateStatusReasonCode?: string | undefined;
  fileSystemConfigs?: Record<string, unknown>[];
  packageType?: string | undefined;
  imageConfigResponse?: Record<string, unknown>;
  signingProfileVersionArn?: string | undefined;
  signingJobArn?: string | undefined;
  architectures?: string[];
  ephemeralStorage?: Record<string, unknown>;
  snapStart?: Record<string, unknown>;
  runtimeVersionConfig?: Record<string, unknown>;
  loggingConfig?: Record<string, unknown>;
};

/** Result of get_function_event_invoke_config. */
export type GetFunctionEventInvokeConfigResult = {
  lastModified?: string | undefined;
  functionArn?: string | undefined;
  maximumRetryAttempts?: number | undefined;
  maximumEventAgeInSeconds?: number | undefined;
  destinationConfig?: Record<string, unknown>;
};

/** Result of get_function_recursion_config. */
export type GetFunctionRecursionConfigResult = {
  recursiveLoop?: string | undefined;
};

/** Result of get_function_url_config. */
export type GetFunctionUrlConfigResult = {
  functionUrl?: string | undefined;
  functionArn?: string | undefined;
  authType?: string | undefined;
  cors?: Record<string, unknown>;
  creationTime?: string | undefined;
  lastModifiedTime?: string | undefined;
  invokeMode?: string | undefined;
};

/** Result of get_layer_version. */
export type GetLayerVersionResult = {
  content?: Record<string, unknown>;
  layerArn?: string | undefined;
  layerVersionArn?: string | undefined;
  description?: string | undefined;
  createdDate?: string | undefined;
  version?: number | undefined;
  compatibleRuntimes?: string[];
  licenseInfo?: string | undefined;
  compatibleArchitectures?: string[];
};

/** Result of get_layer_version_by_arn. */
export type GetLayerVersionByArnResult = {
  content?: Record<string, unknown>;
  layerArn?: string | undefined;
  layerVersionArn?: string | undefined;
  description?: string | undefined;
  createdDate?: string | undefined;
  version?: number | undefined;
  compatibleRuntimes?: string[];
  licenseInfo?: string | undefined;
  compatibleArchitectures?: string[];
};

/** Result of get_layer_version_policy. */
export type GetLayerVersionPolicyResult = {
  policy?: string | undefined;
  revisionId?: string | undefined;
};

/** Result of get_policy. */
export type GetPolicyResult = {
  policy?: string | undefined;
  revisionId?: string | undefined;
};

/** Result of get_provisioned_concurrency_config. */
export type GetProvisionedConcurrencyConfigResult = {
  requestedProvisionedConcurrentExecutions?: number | undefined;
  availableProvisionedConcurrentExecutions?: number | undefined;
  allocatedProvisionedConcurrentExecutions?: number | undefined;
  status?: string | undefined;
  statusReason?: string | undefined;
  lastModified?: string | undefined;
};

/** Result of get_runtime_management_config. */
export type GetRuntimeManagementConfigResult = {
  updateRuntimeOn?: string | undefined;
  runtimeVersionArn?: string | undefined;
  functionArn?: string | undefined;
};

/** Result of invoke_with_response_stream. */
export type InvokeWithResponseStreamResult = {
  statusCode?: number | undefined;
  executedVersion?: string | undefined;
  eventStream?: Record<string, unknown>;
  responseStreamContentType?: string | undefined;
};

/** Result of list_aliases. */
export type ListAliasesResult = {
  nextMarker?: string | undefined;
  aliases?: Record<string, unknown>[];
};

/** Result of list_code_signing_configs. */
export type ListCodeSigningConfigsResult = {
  nextMarker?: string | undefined;
  codeSigningConfigs?: Record<string, unknown>[];
};

/** Result of list_event_source_mappings. */
export type ListEventSourceMappingsResult = {
  nextMarker?: string | undefined;
  eventSourceMappings?: Record<string, unknown>[];
};

/** Result of list_function_event_invoke_configs. */
export type ListFunctionEventInvokeConfigsResult = {
  functionEventInvokeConfigs?: Record<string, unknown>[];
  nextMarker?: string | undefined;
};

/** Result of list_function_url_configs. */
export type ListFunctionUrlConfigsResult = {
  functionUrlConfigs?: Record<string, unknown>[];
  nextMarker?: string | undefined;
};

/** Result of list_functions. */
export type ListFunctionsResult = {
  nextMarker?: string | undefined;
  functions?: Record<string, unknown>[];
};

/** Result of list_functions_by_code_signing_config. */
export type ListFunctionsByCodeSigningConfigResult = {
  nextMarker?: string | undefined;
  functionArns?: string[];
};

/** Result of list_layer_versions. */
export type ListLayerVersionsResult = {
  nextMarker?: string | undefined;
  layerVersions?: Record<string, unknown>[];
};

/** Result of list_layers. */
export type ListLayersResult = {
  nextMarker?: string | undefined;
  layers?: Record<string, unknown>[];
};

/** Result of list_provisioned_concurrency_configs. */
export type ListProvisionedConcurrencyConfigsResult = {
  provisionedConcurrencyConfigs?: Record<string, unknown>[];
  nextMarker?: string | undefined;
};

/** Result of list_tags. */
export type ListTagsResult = {
  tags?: Record<string, unknown>;
};

/** Result of list_versions_by_function. */
export type ListVersionsByFunctionResult = {
  nextMarker?: string | undefined;
  versions?: Record<string, unknown>[];
};

/** Result of publish_layer_version. */
export type PublishLayerVersionResult = {
  content?: Record<string, unknown>;
  layerArn?: string | undefined;
  layerVersionArn?: string | undefined;
  description?: string | undefined;
  createdDate?: string | undefined;
  version?: number | undefined;
  compatibleRuntimes?: string[];
  licenseInfo?: string | undefined;
  compatibleArchitectures?: string[];
};

/** Result of publish_version. */
export type PublishVersionResult = {
  functionName?: string | undefined;
  functionArn?: string | undefined;
  runtime?: string | undefined;
  role?: string | undefined;
  handler?: string | undefined;
  codeSize?: number | undefined;
  description?: string | undefined;
  timeout?: number | undefined;
  memorySize?: number | undefined;
  lastModified?: string | undefined;
  codeSha256?: string | undefined;
  version?: string | undefined;
  vpcConfig?: Record<string, unknown>;
  deadLetterConfig?: Record<string, unknown>;
  environment?: Record<string, unknown>;
  kmsKeyArn?: string | undefined;
  tracingConfig?: Record<string, unknown>;
  masterArn?: string | undefined;
  revisionId?: string | undefined;
  layers?: Record<string, unknown>[];
  state?: string | undefined;
  stateReason?: string | undefined;
  stateReasonCode?: string | undefined;
  lastUpdateStatus?: string | undefined;
  lastUpdateStatusReason?: string | undefined;
  lastUpdateStatusReasonCode?: string | undefined;
  fileSystemConfigs?: Record<string, unknown>[];
  packageType?: string | undefined;
  imageConfigResponse?: Record<string, unknown>;
  signingProfileVersionArn?: string | undefined;
  signingJobArn?: string | undefined;
  architectures?: string[];
  ephemeralStorage?: Record<string, unknown>;
  snapStart?: Record<string, unknown>;
  runtimeVersionConfig?: Record<string, unknown>;
  loggingConfig?: Record<string, unknown>;
};

/** Result of put_function_code_signing_config. */
export type PutFunctionCodeSigningConfigResult = {
  codeSigningConfigArn?: string | undefined;
  functionName?: string | undefined;
};

/** Result of put_function_concurrency. */
export type PutFunctionConcurrencyResult = {
  reservedConcurrentExecutions?: number | undefined;
};

/** Result of put_function_event_invoke_config. */
export type PutFunctionEventInvokeConfigResult = {
  lastModified?: string | undefined;
  functionArn?: string | undefined;
  maximumRetryAttempts?: number | undefined;
  maximumEventAgeInSeconds?: number | undefined;
  destinationConfig?: Record<string, unknown>;
};

/** Result of put_function_recursion_config. */
export type PutFunctionRecursionConfigResult = {
  recursiveLoop?: string | undefined;
};

/** Result of put_provisioned_concurrency_config. */
export type PutProvisionedConcurrencyConfigResult = {
  requestedProvisionedConcurrentExecutions?: number | undefined;
  availableProvisionedConcurrentExecutions?: number | undefined;
  allocatedProvisionedConcurrentExecutions?: number | undefined;
  status?: string | undefined;
  statusReason?: string | undefined;
  lastModified?: string | undefined;
};

/** Result of put_runtime_management_config. */
export type PutRuntimeManagementConfigResult = {
  updateRuntimeOn?: string | undefined;
  functionArn?: string | undefined;
  runtimeVersionArn?: string | undefined;
};

/** Result of update_alias. */
export type UpdateAliasResult = {
  aliasArn?: string | undefined;
  name?: string | undefined;
  functionVersion?: string | undefined;
  description?: string | undefined;
  routingConfig?: Record<string, unknown>;
  revisionId?: string | undefined;
};

/** Result of update_code_signing_config. */
export type UpdateCodeSigningConfigResult = {
  codeSigningConfig?: Record<string, unknown>;
};

/** Result of update_event_source_mapping. */
export type UpdateEventSourceMappingResult = {
  uuid?: string | undefined;
  startingPosition?: string | undefined;
  startingPositionTimestamp?: string | undefined;
  batchSize?: number | undefined;
  maximumBatchingWindowInSeconds?: number | undefined;
  parallelizationFactor?: number | undefined;
  eventSourceArn?: string | undefined;
  filterCriteria?: Record<string, unknown>;
  functionArn?: string | undefined;
  lastModified?: string | undefined;
  lastProcessingResult?: string | undefined;
  state?: string | undefined;
  stateTransitionReason?: string | undefined;
  destinationConfig?: Record<string, unknown>;
  topics?: string[];
  queues?: string[];
  sourceAccessConfigurations?: Record<string, unknown>[];
  selfManagedEventSource?: Record<string, unknown>;
  maximumRecordAgeInSeconds?: number | undefined;
  bisectBatchOnFunctionError?: boolean | undefined;
  maximumRetryAttempts?: number | undefined;
  tumblingWindowInSeconds?: number | undefined;
  functionResponseTypes?: string[];
  amazonManagedKafkaEventSourceConfig?: Record<string, unknown>;
  selfManagedKafkaEventSourceConfig?: Record<string, unknown>;
  scalingConfig?: Record<string, unknown>;
  documentDbEventSourceConfig?: Record<string, unknown>;
  kmsKeyArn?: string | undefined;
  filterCriteriaError?: Record<string, unknown>;
  eventSourceMappingArn?: string | undefined;
  metricsConfig?: Record<string, unknown>;
  provisionedPollerConfig?: Record<string, unknown>;
};

/** Result of update_function_code. */
export type UpdateFunctionCodeResult = {
  functionName?: string | undefined;
  functionArn?: string | undefined;
  runtime?: string | undefined;
  role?: string | undefined;
  handler?: string | undefined;
  codeSize?: number | undefined;
  description?: string | undefined;
  timeout?: number | undefined;
  memorySize?: number | undefined;
  lastModified?: string | undefined;
  codeSha256?: string | undefined;
  version?: string | undefined;
  vpcConfig?: Record<string, unknown>;
  deadLetterConfig?: Record<string, unknown>;
  environment?: Record<string, unknown>;
  kmsKeyArn?: string | undefined;
  tracingConfig?: Record<string, unknown>;
  masterArn?: string | undefined;
  revisionId?: string | undefined;
  layers?: Record<string, unknown>[];
  state?: string | undefined;
  stateReason?: string | undefined;
  stateReasonCode?: string | undefined;
  lastUpdateStatus?: string | undefined;
  lastUpdateStatusReason?: string | undefined;
  lastUpdateStatusReasonCode?: string | undefined;
  fileSystemConfigs?: Record<string, unknown>[];
  packageType?: string | undefined;
  imageConfigResponse?: Record<string, unknown>;
  signingProfileVersionArn?: string | undefined;
  signingJobArn?: string | undefined;
  architectures?: string[];
  ephemeralStorage?: Record<string, unknown>;
  snapStart?: Record<string, unknown>;
  runtimeVersionConfig?: Record<string, unknown>;
  loggingConfig?: Record<string, unknown>;
};

/** Result of update_function_configuration. */
export type UpdateFunctionConfigurationResult = {
  functionName?: string | undefined;
  functionArn?: string | undefined;
  runtime?: string | undefined;
  role?: string | undefined;
  handler?: string | undefined;
  codeSize?: number | undefined;
  description?: string | undefined;
  timeout?: number | undefined;
  memorySize?: number | undefined;
  lastModified?: string | undefined;
  codeSha256?: string | undefined;
  version?: string | undefined;
  vpcConfig?: Record<string, unknown>;
  deadLetterConfig?: Record<string, unknown>;
  environment?: Record<string, unknown>;
  kmsKeyArn?: string | undefined;
  tracingConfig?: Record<string, unknown>;
  masterArn?: string | undefined;
  revisionId?: string | undefined;
  layers?: Record<string, unknown>[];
  state?: string | undefined;
  stateReason?: string | undefined;
  stateReasonCode?: string | undefined;
  lastUpdateStatus?: string | undefined;
  lastUpdateStatusReason?: string | undefined;
  lastUpdateStatusReasonCode?: string | undefined;
  fileSystemConfigs?: Record<string, unknown>[];
  packageType?: string | undefined;
  imageConfigResponse?: Record<string, unknown>;
  signingProfileVersionArn?: string | undefined;
  signingJobArn?: string | undefined;
  architectures?: string[];
  ephemeralStorage?: Record<string, unknown>;
  snapStart?: Record<string, unknown>;
  runtimeVersionConfig?: Record<string, unknown>;
  loggingConfig?: Record<string, unknown>;
};

/** Result of update_function_event_invoke_config. */
export type UpdateFunctionEventInvokeConfigResult = {
  lastModified?: string | undefined;
  functionArn?: string | undefined;
  maximumRetryAttempts?: number | undefined;
  maximumEventAgeInSeconds?: number | undefined;
  destinationConfig?: Record<string, unknown>;
};

/** Result of update_function_url_config. */
export type UpdateFunctionUrlConfigResult = {
  functionUrl?: string | undefined;
  functionArn?: string | undefined;
  authType?: string | undefined;
  cors?: Record<string, unknown>;
  creationTime?: string | undefined;
  lastModifiedTime?: string | undefined;
  invokeMode?: string | undefined;
};


// ---------------------------------------------------------------------------
// Additional functions (auto-generated)
// ---------------------------------------------------------------------------

/** Add layer version permission. */
export async function addLayerVersionPermission(layerName: string, versionNumber: number, statementId: string, action: string, principal: string): Promise<AddLayerVersionPermissionResult> {
  try {
    // TODO: implement add_layer_version_permission
    throw new Error("add_layer_version_permission not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "add_layer_version_permission failed");
  }
}

/** Add permission. */
export async function addPermission(functionName: string, statementId: string, action: string, principal: string): Promise<AddPermissionResult> {
  try {
    // TODO: implement add_permission
    throw new Error("add_permission not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "add_permission failed");
  }
}

/** Create alias. */
export async function createAlias(functionName: string, name: string, functionVersion: string): Promise<CreateAliasResult> {
  try {
    // TODO: implement create_alias
    throw new Error("create_alias not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_alias failed");
  }
}

/** Create code signing config. */
export async function createCodeSigningConfig(allowedPublishers: Record<string, unknown>): Promise<CreateCodeSigningConfigResult> {
  try {
    // TODO: implement create_code_signing_config
    throw new Error("create_code_signing_config not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_code_signing_config failed");
  }
}

/** Create event source mapping. */
export async function createEventSourceMapping(functionName: string): Promise<CreateEventSourceMappingResult> {
  try {
    // TODO: implement create_event_source_mapping
    throw new Error("create_event_source_mapping not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_event_source_mapping failed");
  }
}

/** Create function. */
export async function createFunction(functionName: string, role: string, code: Record<string, unknown>): Promise<CreateFunctionResult> {
  try {
    // TODO: implement create_function
    throw new Error("create_function not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_function failed");
  }
}

/** Create function url config. */
export async function createFunctionUrlConfig(functionName: string, authType: string): Promise<CreateFunctionUrlConfigResult> {
  try {
    // TODO: implement create_function_url_config
    throw new Error("create_function_url_config not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_function_url_config failed");
  }
}

/** Delete alias. */
export async function deleteAlias(functionName: string, name: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_alias
    throw new Error("delete_alias not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_alias failed");
  }
}

/** Delete code signing config. */
export async function deleteCodeSigningConfig(codeSigningConfigArn: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_code_signing_config
    throw new Error("delete_code_signing_config not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_code_signing_config failed");
  }
}

/** Delete event source mapping. */
export async function deleteEventSourceMapping(uuid: string, regionName?: string | undefined): Promise<DeleteEventSourceMappingResult> {
  try {
    // TODO: implement delete_event_source_mapping
    throw new Error("delete_event_source_mapping not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_event_source_mapping failed");
  }
}

/** Delete function. */
export async function deleteFunction(functionName: string): Promise<void> {
  try {
    // TODO: implement delete_function
    throw new Error("delete_function not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_function failed");
  }
}

/** Delete function code signing config. */
export async function deleteFunctionCodeSigningConfig(functionName: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_function_code_signing_config
    throw new Error("delete_function_code_signing_config not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_function_code_signing_config failed");
  }
}

/** Delete function concurrency. */
export async function deleteFunctionConcurrency(functionName: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_function_concurrency
    throw new Error("delete_function_concurrency not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_function_concurrency failed");
  }
}

/** Delete function event invoke config. */
export async function deleteFunctionEventInvokeConfig(functionName: string): Promise<void> {
  try {
    // TODO: implement delete_function_event_invoke_config
    throw new Error("delete_function_event_invoke_config not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_function_event_invoke_config failed");
  }
}

/** Delete function url config. */
export async function deleteFunctionUrlConfig(functionName: string): Promise<void> {
  try {
    // TODO: implement delete_function_url_config
    throw new Error("delete_function_url_config not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_function_url_config failed");
  }
}

/** Delete layer version. */
export async function deleteLayerVersion(layerName: string, versionNumber: number, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_layer_version
    throw new Error("delete_layer_version not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_layer_version failed");
  }
}

/** Delete provisioned concurrency config. */
export async function deleteProvisionedConcurrencyConfig(functionName: string, qualifier: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_provisioned_concurrency_config
    throw new Error("delete_provisioned_concurrency_config not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_provisioned_concurrency_config failed");
  }
}

/** Get account settings. */
export async function getAccountSettings(regionName?: string | undefined): Promise<GetAccountSettingsResult> {
  try {
    // TODO: implement get_account_settings
    throw new Error("get_account_settings not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_account_settings failed");
  }
}

/** Get alias. */
export async function getAlias(functionName: string, name: string, regionName?: string | undefined): Promise<GetAliasResult> {
  try {
    // TODO: implement get_alias
    throw new Error("get_alias not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_alias failed");
  }
}

/** Get code signing config. */
export async function getCodeSigningConfig(codeSigningConfigArn: string, regionName?: string | undefined): Promise<GetCodeSigningConfigResult> {
  try {
    // TODO: implement get_code_signing_config
    throw new Error("get_code_signing_config not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_code_signing_config failed");
  }
}

/** Get event source mapping. */
export async function getEventSourceMapping(uuid: string, regionName?: string | undefined): Promise<GetEventSourceMappingResult> {
  try {
    // TODO: implement get_event_source_mapping
    throw new Error("get_event_source_mapping not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_event_source_mapping failed");
  }
}

/** Get function. */
export async function getFunction(functionName: string): Promise<GetFunctionResult> {
  try {
    // TODO: implement get_function
    throw new Error("get_function not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_function failed");
  }
}

/** Get function code signing config. */
export async function getFunctionCodeSigningConfig(functionName: string, regionName?: string | undefined): Promise<GetFunctionCodeSigningConfigResult> {
  try {
    // TODO: implement get_function_code_signing_config
    throw new Error("get_function_code_signing_config not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_function_code_signing_config failed");
  }
}

/** Get function concurrency. */
export async function getFunctionConcurrency(functionName: string, regionName?: string | undefined): Promise<GetFunctionConcurrencyResult> {
  try {
    // TODO: implement get_function_concurrency
    throw new Error("get_function_concurrency not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_function_concurrency failed");
  }
}

/** Get function configuration. */
export async function getFunctionConfiguration(functionName: string): Promise<GetFunctionConfigurationResult> {
  try {
    // TODO: implement get_function_configuration
    throw new Error("get_function_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_function_configuration failed");
  }
}

/** Get function event invoke config. */
export async function getFunctionEventInvokeConfig(functionName: string): Promise<GetFunctionEventInvokeConfigResult> {
  try {
    // TODO: implement get_function_event_invoke_config
    throw new Error("get_function_event_invoke_config not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_function_event_invoke_config failed");
  }
}

/** Get function recursion config. */
export async function getFunctionRecursionConfig(functionName: string, regionName?: string | undefined): Promise<GetFunctionRecursionConfigResult> {
  try {
    // TODO: implement get_function_recursion_config
    throw new Error("get_function_recursion_config not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_function_recursion_config failed");
  }
}

/** Get function url config. */
export async function getFunctionUrlConfig(functionName: string): Promise<GetFunctionUrlConfigResult> {
  try {
    // TODO: implement get_function_url_config
    throw new Error("get_function_url_config not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_function_url_config failed");
  }
}

/** Get layer version. */
export async function getLayerVersion(layerName: string, versionNumber: number, regionName?: string | undefined): Promise<GetLayerVersionResult> {
  try {
    // TODO: implement get_layer_version
    throw new Error("get_layer_version not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_layer_version failed");
  }
}

/** Get layer version by arn. */
export async function getLayerVersionByArn(arn: string, regionName?: string | undefined): Promise<GetLayerVersionByArnResult> {
  try {
    // TODO: implement get_layer_version_by_arn
    throw new Error("get_layer_version_by_arn not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_layer_version_by_arn failed");
  }
}

/** Get layer version policy. */
export async function getLayerVersionPolicy(layerName: string, versionNumber: number, regionName?: string | undefined): Promise<GetLayerVersionPolicyResult> {
  try {
    // TODO: implement get_layer_version_policy
    throw new Error("get_layer_version_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_layer_version_policy failed");
  }
}

/** Get policy. */
export async function getPolicy(functionName: string): Promise<GetPolicyResult> {
  try {
    // TODO: implement get_policy
    throw new Error("get_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_policy failed");
  }
}

/** Get provisioned concurrency config. */
export async function getProvisionedConcurrencyConfig(functionName: string, qualifier: string, regionName?: string | undefined): Promise<GetProvisionedConcurrencyConfigResult> {
  try {
    // TODO: implement get_provisioned_concurrency_config
    throw new Error("get_provisioned_concurrency_config not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_provisioned_concurrency_config failed");
  }
}

/** Get runtime management config. */
export async function getRuntimeManagementConfig(functionName: string): Promise<GetRuntimeManagementConfigResult> {
  try {
    // TODO: implement get_runtime_management_config
    throw new Error("get_runtime_management_config not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_runtime_management_config failed");
  }
}

/** Invoke with response stream. */
export async function invokeWithResponseStream(functionName: string): Promise<InvokeWithResponseStreamResult> {
  try {
    // TODO: implement invoke_with_response_stream
    throw new Error("invoke_with_response_stream not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "invoke_with_response_stream failed");
  }
}

/** List aliases. */
export async function listAliases(functionName: string): Promise<ListAliasesResult> {
  try {
    // TODO: implement list_aliases
    throw new Error("list_aliases not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_aliases failed");
  }
}

/** List code signing configs. */
export async function listCodeSigningConfigs(): Promise<ListCodeSigningConfigsResult> {
  try {
    // TODO: implement list_code_signing_configs
    throw new Error("list_code_signing_configs not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_code_signing_configs failed");
  }
}

/** List event source mappings. */
export async function listEventSourceMappings(): Promise<ListEventSourceMappingsResult> {
  try {
    // TODO: implement list_event_source_mappings
    throw new Error("list_event_source_mappings not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_event_source_mappings failed");
  }
}

/** List function event invoke configs. */
export async function listFunctionEventInvokeConfigs(functionName: string): Promise<ListFunctionEventInvokeConfigsResult> {
  try {
    // TODO: implement list_function_event_invoke_configs
    throw new Error("list_function_event_invoke_configs not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_function_event_invoke_configs failed");
  }
}

/** List function url configs. */
export async function listFunctionUrlConfigs(functionName: string): Promise<ListFunctionUrlConfigsResult> {
  try {
    // TODO: implement list_function_url_configs
    throw new Error("list_function_url_configs not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_function_url_configs failed");
  }
}

/** List functions. */
export async function listFunctions(): Promise<ListFunctionsResult> {
  try {
    // TODO: implement list_functions
    throw new Error("list_functions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_functions failed");
  }
}

/** List functions by code signing config. */
export async function listFunctionsByCodeSigningConfig(codeSigningConfigArn: string): Promise<ListFunctionsByCodeSigningConfigResult> {
  try {
    // TODO: implement list_functions_by_code_signing_config
    throw new Error("list_functions_by_code_signing_config not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_functions_by_code_signing_config failed");
  }
}

/** List layer versions. */
export async function listLayerVersions(layerName: string): Promise<ListLayerVersionsResult> {
  try {
    // TODO: implement list_layer_versions
    throw new Error("list_layer_versions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_layer_versions failed");
  }
}

/** List layers. */
export async function listLayers(): Promise<ListLayersResult> {
  try {
    // TODO: implement list_layers
    throw new Error("list_layers not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_layers failed");
  }
}

/** List provisioned concurrency configs. */
export async function listProvisionedConcurrencyConfigs(functionName: string): Promise<ListProvisionedConcurrencyConfigsResult> {
  try {
    // TODO: implement list_provisioned_concurrency_configs
    throw new Error("list_provisioned_concurrency_configs not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_provisioned_concurrency_configs failed");
  }
}

/** List tags. */
export async function listTags(resource: string, regionName?: string | undefined): Promise<ListTagsResult> {
  try {
    // TODO: implement list_tags
    throw new Error("list_tags not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_tags failed");
  }
}

/** List versions by function. */
export async function listVersionsByFunction(functionName: string): Promise<ListVersionsByFunctionResult> {
  try {
    // TODO: implement list_versions_by_function
    throw new Error("list_versions_by_function not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_versions_by_function failed");
  }
}

/** Publish layer version. */
export async function publishLayerVersion(layerName: string, content: Record<string, unknown>): Promise<PublishLayerVersionResult> {
  try {
    // TODO: implement publish_layer_version
    throw new Error("publish_layer_version not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "publish_layer_version failed");
  }
}

/** Publish version. */
export async function publishVersion(functionName: string): Promise<PublishVersionResult> {
  try {
    // TODO: implement publish_version
    throw new Error("publish_version not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "publish_version failed");
  }
}

/** Put function code signing config. */
export async function putFunctionCodeSigningConfig(codeSigningConfigArn: string, functionName: string, regionName?: string | undefined): Promise<PutFunctionCodeSigningConfigResult> {
  try {
    // TODO: implement put_function_code_signing_config
    throw new Error("put_function_code_signing_config not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_function_code_signing_config failed");
  }
}

/** Put function concurrency. */
export async function putFunctionConcurrency(functionName: string, reservedConcurrentExecutions: number, regionName?: string | undefined): Promise<PutFunctionConcurrencyResult> {
  try {
    // TODO: implement put_function_concurrency
    throw new Error("put_function_concurrency not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_function_concurrency failed");
  }
}

/** Put function event invoke config. */
export async function putFunctionEventInvokeConfig(functionName: string): Promise<PutFunctionEventInvokeConfigResult> {
  try {
    // TODO: implement put_function_event_invoke_config
    throw new Error("put_function_event_invoke_config not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_function_event_invoke_config failed");
  }
}

/** Put function recursion config. */
export async function putFunctionRecursionConfig(functionName: string, recursiveLoop: string, regionName?: string | undefined): Promise<PutFunctionRecursionConfigResult> {
  try {
    // TODO: implement put_function_recursion_config
    throw new Error("put_function_recursion_config not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_function_recursion_config failed");
  }
}

/** Put provisioned concurrency config. */
export async function putProvisionedConcurrencyConfig(functionName: string, qualifier: string, provisionedConcurrentExecutions: number, regionName?: string | undefined): Promise<PutProvisionedConcurrencyConfigResult> {
  try {
    // TODO: implement put_provisioned_concurrency_config
    throw new Error("put_provisioned_concurrency_config not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_provisioned_concurrency_config failed");
  }
}

/** Put runtime management config. */
export async function putRuntimeManagementConfig(functionName: string, updateRuntimeOn: string): Promise<PutRuntimeManagementConfigResult> {
  try {
    // TODO: implement put_runtime_management_config
    throw new Error("put_runtime_management_config not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_runtime_management_config failed");
  }
}

/** Remove layer version permission. */
export async function removeLayerVersionPermission(layerName: string, versionNumber: number, statementId: string): Promise<void> {
  try {
    // TODO: implement remove_layer_version_permission
    throw new Error("remove_layer_version_permission not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "remove_layer_version_permission failed");
  }
}

/** Remove permission. */
export async function removePermission(functionName: string, statementId: string): Promise<void> {
  try {
    // TODO: implement remove_permission
    throw new Error("remove_permission not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "remove_permission failed");
  }
}

/** Tag resource. */
export async function tagResource(resource: string, tags: Record<string, unknown>, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement tag_resource
    throw new Error("tag_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "tag_resource failed");
  }
}

/** Untag resource. */
export async function untagResource(resource: string, tagKeys: string[], regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement untag_resource
    throw new Error("untag_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "untag_resource failed");
  }
}

/** Update alias. */
export async function updateAlias(functionName: string, name: string): Promise<UpdateAliasResult> {
  try {
    // TODO: implement update_alias
    throw new Error("update_alias not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_alias failed");
  }
}

/** Update code signing config. */
export async function updateCodeSigningConfig(codeSigningConfigArn: string): Promise<UpdateCodeSigningConfigResult> {
  try {
    // TODO: implement update_code_signing_config
    throw new Error("update_code_signing_config not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_code_signing_config failed");
  }
}

/** Update event source mapping. */
export async function updateEventSourceMapping(uuid: string): Promise<UpdateEventSourceMappingResult> {
  try {
    // TODO: implement update_event_source_mapping
    throw new Error("update_event_source_mapping not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_event_source_mapping failed");
  }
}

/** Update function code. */
export async function updateFunctionCode(functionName: string): Promise<UpdateFunctionCodeResult> {
  try {
    // TODO: implement update_function_code
    throw new Error("update_function_code not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_function_code failed");
  }
}

/** Update function configuration. */
export async function updateFunctionConfiguration(functionName: string): Promise<UpdateFunctionConfigurationResult> {
  try {
    // TODO: implement update_function_configuration
    throw new Error("update_function_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_function_configuration failed");
  }
}

/** Update function event invoke config. */
export async function updateFunctionEventInvokeConfig(functionName: string): Promise<UpdateFunctionEventInvokeConfigResult> {
  try {
    // TODO: implement update_function_event_invoke_config
    throw new Error("update_function_event_invoke_config not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_function_event_invoke_config failed");
  }
}

/** Update function url config. */
export async function updateFunctionUrlConfig(functionName: string): Promise<UpdateFunctionUrlConfigResult> {
  try {
    // TODO: implement update_function_url_config
    throw new Error("update_function_url_config not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_function_url_config failed");
  }
}
