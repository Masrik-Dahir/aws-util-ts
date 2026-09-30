/**
 * aws-util/bedrock — High-level Amazon Bedrock utilities.
 *
 * Provides typed helpers for invoking foundation models (Claude, Titan),
 * multi-turn chat, text embeddings, response streaming, and model listing.
 *
 * @example
 * ```ts
 * import { invokeClaude, chat, listFoundationModels } from "./bedrock.js";
 *
 * const answer = await invokeClaude("Explain Lambda cold starts.");
 * const models = await listFoundationModels("Anthropic");
 * ```
 *
 * @module
 */

import { z } from "zod";
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
  InvokeModelWithResponseStreamCommand,
} from "@aws-sdk/client-bedrock-runtime";
import {
  BedrockClient,
  ListFoundationModelsCommand,
} from "@aws-sdk/client-bedrock";
import { getClient } from "./client.js";
import { wrapAwsError } from "./exceptions.js";

// ---------------------------------------------------------------------------
// Zod schemas
// ---------------------------------------------------------------------------

/** Schema for the result of an {@link invokeModel} call. */
export const InvokeModelResultSchema = z.object({
  body: z.unknown(),
  inputTokens: z.number().optional(),
  outputTokens: z.number().optional(),
});

/** Result of {@link invokeModel}. */
export type InvokeModelResult = z.infer<typeof InvokeModelResultSchema>;

/** Schema for a foundation model summary from {@link listFoundationModels}. */
export const BedrockModelSchema = z.object({
  modelId: z.string(),
  modelName: z.string().optional(),
  provider: z.string().optional(),
  inputModalities: z.array(z.string()).optional(),
  outputModalities: z.array(z.string()).optional(),
});

/** A foundation model available in Amazon Bedrock. */
export type BedrockModel = z.infer<typeof BedrockModelSchema>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Get a cached BedrockRuntimeClient for the given region.
 */
function runtime(region?: string): BedrockRuntimeClient {
  return getClient(BedrockRuntimeClient, region);
}

/**
 * Get a cached BedrockClient for the given region.
 */
function bedrock(region?: string): BedrockClient {
  return getClient(BedrockClient, region);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Invoke any Amazon Bedrock foundation model.
 *
 * The body format depends on the model provider -- see the Bedrock API
 * documentation for each model's request schema.
 *
 * @param modelId - Bedrock model ID, e.g.
 *   `"anthropic.claude-3-5-sonnet-20241022-v2:0"`.
 * @param body - Request body as a JSON-serialisable object.
 * @param accept - Response content type (default `"application/json"`).
 * @param contentType - Request content type (default `"application/json"`).
 * @param region - AWS region override.
 * @returns An {@link InvokeModelResult} with the parsed response body.
 */
export async function invokeModel(
  modelId: string,
  body: object,
  accept: string = "application/json",
  contentType: string = "application/json",
  region?: string,
): Promise<InvokeModelResult> {
  try {
    const resp = await runtime(region).send(
      new InvokeModelCommand({
        modelId,
        body: new TextEncoder().encode(JSON.stringify(body)),
        accept,
        contentType,
      }),
    );

    const rawBody = new TextDecoder().decode(resp.body);
    let parsed: unknown;
    try {
      parsed = JSON.parse(rawBody);
    } catch {
      parsed = rawBody;
    }

    // Extract token usage when available (Anthropic format)
    const usage =
      parsed != null && typeof parsed === "object"
        ? (parsed as Record<string, unknown>)["usage"]
        : undefined;
    const inputTokens =
      usage != null && typeof usage === "object"
        ? (usage as Record<string, unknown>)["input_tokens"]
        : undefined;
    const outputTokens =
      usage != null && typeof usage === "object"
        ? (usage as Record<string, unknown>)["output_tokens"]
        : undefined;

    return InvokeModelResultSchema.parse({
      body: parsed,
      inputTokens:
        typeof inputTokens === "number" ? inputTokens : undefined,
      outputTokens:
        typeof outputTokens === "number" ? outputTokens : undefined,
    });
  } catch (err: unknown) {
    throw wrapAwsError(err, `invokeModel(${modelId})`);
  }
}

/**
 * Invoke an Anthropic Claude model via Bedrock and return the text response.
 *
 * Uses the Claude Messages API format.
 *
 * @param prompt - User message content.
 * @param maxTokens - Maximum tokens in the response (default `1024`).
 * @param temperature - Sampling temperature 0--1 (default `0.7`).
 * @param modelId - Claude model ID (defaults to Claude 3.5 Sonnet v2).
 * @param region - AWS region override.
 * @returns The assistant's text response as a string.
 */
export async function invokeClaude(
  prompt: string,
  maxTokens: number = 1024,
  temperature: number = 0.7,
  modelId: string = "anthropic.claude-3-5-sonnet-20241022-v2:0",
  region?: string,
): Promise<string> {
  const body: Record<string, unknown> = {
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: maxTokens,
    temperature,
    messages: [{ role: "user", content: prompt }],
  };

  const result = await invokeModel(modelId, body, undefined, undefined, region);
  const responseBody = result.body;
  if (responseBody != null && typeof responseBody === "object") {
    const content = (responseBody as Record<string, unknown>)["content"];
    if (Array.isArray(content) && content.length > 0) {
      const first = content[0] as Record<string, unknown>;
      if (typeof first["text"] === "string") {
        return first["text"];
      }
    }
  }
  return String(responseBody);
}

/**
 * Invoke an Amazon Titan text model via Bedrock.
 *
 * @param prompt - Input text prompt.
 * @param maxTokens - Maximum tokens in the response (default `512`).
 * @param temperature - Sampling temperature 0--1 (default `0.7`).
 * @param modelId - Titan model ID (defaults to Titan Text Express).
 * @param region - AWS region override.
 * @returns The generated text as a string.
 */
export async function invokeTitanText(
  prompt: string,
  maxTokens: number = 512,
  temperature: number = 0.7,
  modelId: string = "amazon.titan-text-express-v1",
  region?: string,
): Promise<string> {
  const body = {
    inputText: prompt,
    textGenerationConfig: {
      maxTokenCount: maxTokens,
      temperature,
    },
  };

  const result = await invokeModel(modelId, body, undefined, undefined, region);
  const responseBody = result.body;
  if (responseBody != null && typeof responseBody === "object") {
    const results = (responseBody as Record<string, unknown>)["results"];
    if (Array.isArray(results) && results.length > 0) {
      const first = results[0] as Record<string, unknown>;
      if (typeof first["outputText"] === "string") {
        return first["outputText"];
      }
    }
  }
  return String(responseBody);
}

/**
 * Send a multi-turn conversation to a Claude model and return the reply.
 *
 * Each message must have `role` (`"user"` or `"assistant"`) and `content` keys.
 *
 * @param messages - Conversation history in Claude Messages API format.
 * @param modelId - Claude model ID.
 * @param maxTokens - Maximum tokens in the response (default `1024`).
 * @param temperature - Sampling temperature 0--1 (default `0.7`).
 * @param systemPrompt - Optional system prompt prepended to the conversation.
 * @param region - AWS region override.
 * @returns The assistant's text reply as a string.
 */
export async function chat(
  messages: Array<{ role: string; content: string }>,
  modelId: string = "anthropic.claude-3-5-sonnet-20241022-v2:0",
  maxTokens: number = 1024,
  temperature: number = 0.7,
  systemPrompt?: string,
  region?: string,
): Promise<string> {
  const body: Record<string, unknown> = {
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: maxTokens,
    temperature,
    messages,
  };
  if (systemPrompt) {
    body["system"] = systemPrompt;
  }

  const result = await invokeModel(modelId, body, undefined, undefined, region);
  const responseBody = result.body;
  if (responseBody != null && typeof responseBody === "object") {
    const content = (responseBody as Record<string, unknown>)["content"];
    if (Array.isArray(content) && content.length > 0) {
      const first = content[0] as Record<string, unknown>;
      if (typeof first["text"] === "string") {
        return first["text"];
      }
    }
  }
  return String(responseBody);
}

/**
 * Generate text embedding vectors using an Amazon Titan Embeddings model.
 *
 * When a single string is provided it is embedded directly. When an array
 * of strings is provided each string is embedded individually.
 *
 * @param text - Input text or array of texts to embed.
 * @param modelId - Titan Embeddings model ID
 *   (default `"amazon.titan-embed-text-v1"`).
 * @param region - AWS region override.
 * @returns An array of embedding vectors (one per input text).
 */
export async function embedText(
  text: string | string[],
  modelId: string = "amazon.titan-embed-text-v1",
  region?: string,
): Promise<number[][]> {
  const texts = typeof text === "string" ? [text] : text;
  const embeddings: number[][] = [];

  for (const t of texts) {
    const result = await invokeModel(
      modelId,
      { inputText: t },
      undefined,
      undefined,
      region,
    );
    const responseBody = result.body;
    if (responseBody != null && typeof responseBody === "object") {
      const embedding = (responseBody as Record<string, unknown>)[
        "embedding"
      ];
      if (Array.isArray(embedding)) {
        embeddings.push(embedding as number[]);
      } else {
        embeddings.push([]);
      }
    } else {
      embeddings.push([]);
    }
  }

  return embeddings;
}

/**
 * Stream a Claude response token-by-token using Bedrock's response streaming.
 *
 * Yields text chunks as they arrive from the model, enabling real-time
 * display of long responses without waiting for the full generation.
 *
 * @param prompt - User message content.
 * @param maxTokens - Maximum tokens in the response (default `1024`).
 * @param temperature - Sampling temperature 0--1 (default `0.7`).
 * @param modelId - Claude model ID.
 * @param region - AWS region override.
 * @yields Text chunks (strings) as they stream from the model.
 */
export async function* streamInvokeClaude(
  prompt: string,
  maxTokens: number = 1024,
  temperature: number = 0.7,
  modelId: string = "anthropic.claude-3-5-sonnet-20241022-v2:0",
  region?: string,
): AsyncGenerator<string> {
  const body: Record<string, unknown> = {
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: maxTokens,
    temperature,
    messages: [{ role: "user", content: prompt }],
  };

  let resp;
  try {
    resp = await runtime(region).send(
      new InvokeModelWithResponseStreamCommand({
        modelId,
        body: new TextEncoder().encode(JSON.stringify(body)),
        contentType: "application/json",
        accept: "application/json",
      }),
    );
  } catch (err: unknown) {
    throw wrapAwsError(err, `streamInvokeClaude(${modelId})`);
  }

  if (!resp.body) {
    return;
  }

  for await (const event of resp.body) {
    if (event.chunk?.bytes) {
      try {
        const data = JSON.parse(
          new TextDecoder().decode(event.chunk.bytes),
        ) as Record<string, unknown>;
        if (data["type"] === "content_block_delta") {
          const delta = data["delta"] as
            | Record<string, unknown>
            | undefined;
          if (delta && delta["type"] === "text_delta") {
            const text = delta["text"];
            if (typeof text === "string") {
              yield text;
            }
          }
        }
      } catch {
        // Skip malformed chunks
        continue;
      }
    }
  }
}

/**
 * List foundation models available in Amazon Bedrock.
 *
 * @param provider - Optional filter by provider, e.g. `"Anthropic"`,
 *   `"Amazon"`, `"Meta"`, `"Mistral AI"`.
 * @param region - AWS region override.
 * @returns A list of {@link BedrockModel} objects.
 */
export async function listFoundationModels(
  provider?: string,
  region?: string,
): Promise<BedrockModel[]> {
  try {
    const resp = await bedrock(region).send(
      new ListFoundationModelsCommand({
        byProvider: provider,
      }),
    );

    return (resp.modelSummaries ?? []).map((m) =>
      BedrockModelSchema.parse({
        modelId: m.modelId,
        modelName: m.modelName,
        provider: m.providerName,
        inputModalities: m.inputModalities,
        outputModalities: m.outputModalities,
      }),
    );
  } catch (err: unknown) {
    throw wrapAwsError(err, "listFoundationModels");
  }
}

// ---------------------------------------------------------------------------
// Additional types (auto-generated)
// ---------------------------------------------------------------------------

/** Result of apply_guardrail. */
export type ApplyGuardrailResult = {
  usage?: Record<string, unknown>;
  action?: string | undefined;
  actionReason?: string | undefined;
  outputs?: Record<string, unknown>[];
  assessments?: Record<string, unknown>[];
  guardrailCoverage?: Record<string, unknown>;
};

/** Result of converse. */
export type ConverseResult = {
  output?: Record<string, unknown>;
  stopReason?: string | undefined;
  usage?: Record<string, unknown>;
  metrics?: Record<string, unknown>;
  additionalModelResponseFields?: Record<string, unknown>;
  trace?: Record<string, unknown>;
  performanceConfig?: Record<string, unknown>;
};

/** Result of converse_stream. */
export type ConverseStreamResult = {
  stream?: Record<string, unknown>;
};

/** Result of count_tokens. */
export type CountTokensResult = {
  inputTokens?: number | undefined;
};

/** Result of get_async_invoke. */
export type GetAsyncInvokeResult = {
  invocationArn?: string | undefined;
  modelArn?: string | undefined;
  clientRequestToken?: string | undefined;
  status?: string | undefined;
  failureMessage?: string | undefined;
  submitTime?: string | undefined;
  lastModifiedTime?: string | undefined;
  endTime?: string | undefined;
  outputDataConfig?: Record<string, unknown>;
};

/** Result of invoke_model_with_response_stream. */
export type InvokeModelWithResponseStreamResult = {
  body?: Record<string, unknown>;
  contentType?: string | undefined;
  performanceConfigLatency?: string | undefined;
};

/** Result of list_async_invokes. */
export type ListAsyncInvokesResult = {
  nextToken?: string | undefined;
  asyncInvokeSummaries?: Record<string, unknown>[];
};

/** Result of start_async_invoke. */
export type StartAsyncInvokeResult = {
  invocationArn?: string | undefined;
};

/** Result of batch_delete_evaluation_job. */
export type BatchDeleteEvaluationJobResult = {
  errors?: unknown[];
  evaluationJobs?: unknown[];
};

/** Result of cancel_automated_reasoning_policy_build_workflow. */
export type CancelAutomatedReasoningPolicyBuildWorkflowResult = {
};

/** Result of create_automated_reasoning_policy. */
export type CreateAutomatedReasoningPolicyResult = {
  policyArn?: string | undefined;
  version?: string | undefined;
  name?: string | undefined;
  description?: string | undefined;
  definitionHash?: string | undefined;
  createdAt?: string | undefined;
  updatedAt?: string | undefined;
};

/** Result of create_automated_reasoning_policy_test_case. */
export type CreateAutomatedReasoningPolicyTestCaseResult = {
  policyArn?: string | undefined;
  testCaseId?: string | undefined;
};

/** Result of create_automated_reasoning_policy_version. */
export type CreateAutomatedReasoningPolicyVersionResult = {
  policyArn?: string | undefined;
  version?: string | undefined;
  name?: string | undefined;
  description?: string | undefined;
  definitionHash?: string | undefined;
  createdAt?: string | undefined;
};

/** Result of create_custom_model. */
export type CreateCustomModelResult = {
  modelArn?: string | undefined;
};

/** Result of create_custom_model_deployment. */
export type CreateCustomModelDeploymentResult = {
  customModelDeploymentArn?: string | undefined;
};

/** Result of create_evaluation_job. */
export type CreateEvaluationJobResult = {
  jobArn?: string | undefined;
};

/** Result of create_foundation_model_agreement. */
export type CreateFoundationModelAgreementResult = {
  modelId?: string | undefined;
};

/** Result of create_guardrail. */
export type CreateGuardrailResult = {
  guardrailId?: string | undefined;
  guardrailArn?: string | undefined;
  version?: string | undefined;
  createdAt?: string | undefined;
};

/** Result of create_guardrail_version. */
export type CreateGuardrailVersionResult = {
  guardrailId?: string | undefined;
  version?: string | undefined;
};

/** Result of create_inference_profile. */
export type CreateInferenceProfileResult = {
  inferenceProfileArn?: string | undefined;
  status?: string | undefined;
};

/** Result of create_marketplace_model_endpoint. */
export type CreateMarketplaceModelEndpointResult = {
  marketplaceModelEndpoint?: Record<string, unknown>;
};

/** Result of create_model_copy_job. */
export type CreateModelCopyJobResult = {
  jobArn?: string | undefined;
};

/** Result of create_model_customization_job. */
export type CreateModelCustomizationJobResult = {
  jobArn?: string | undefined;
};

/** Result of create_model_import_job. */
export type CreateModelImportJobResult = {
  jobArn?: string | undefined;
};

/** Result of create_model_invocation_job. */
export type CreateModelInvocationJobResult = {
  jobArn?: string | undefined;
};

/** Result of create_prompt_router. */
export type CreatePromptRouterResult = {
  promptRouterArn?: string | undefined;
};

/** Result of create_provisioned_model_throughput. */
export type CreateProvisionedModelThroughputResult = {
  provisionedModelArn?: string | undefined;
};

/** Result of delete_automated_reasoning_policy. */
export type DeleteAutomatedReasoningPolicyResult = {
};

/** Result of delete_automated_reasoning_policy_build_workflow. */
export type DeleteAutomatedReasoningPolicyBuildWorkflowResult = {
};

/** Result of delete_automated_reasoning_policy_test_case. */
export type DeleteAutomatedReasoningPolicyTestCaseResult = {
};

/** Result of delete_custom_model. */
export type DeleteCustomModelResult = {
};

/** Result of delete_custom_model_deployment. */
export type DeleteCustomModelDeploymentResult = {
};

/** Result of delete_foundation_model_agreement. */
export type DeleteFoundationModelAgreementResult = {
};

/** Result of delete_guardrail. */
export type DeleteGuardrailResult = {
};

/** Result of delete_imported_model. */
export type DeleteImportedModelResult = {
};

/** Result of delete_inference_profile. */
export type DeleteInferenceProfileResult = {
};

/** Result of delete_marketplace_model_endpoint. */
export type DeleteMarketplaceModelEndpointResult = {
};

/** Result of delete_model_invocation_logging_configuration. */
export type DeleteModelInvocationLoggingConfigurationResult = {
};

/** Result of delete_prompt_router. */
export type DeletePromptRouterResult = {
};

/** Result of delete_provisioned_model_throughput. */
export type DeleteProvisionedModelThroughputResult = {
};

/** Result of deregister_marketplace_model_endpoint. */
export type DeregisterMarketplaceModelEndpointResult = {
};

/** Result of export_automated_reasoning_policy_version. */
export type ExportAutomatedReasoningPolicyVersionResult = {
  policyDefinition?: Record<string, unknown>;
};

/** Result of get_automated_reasoning_policy. */
export type GetAutomatedReasoningPolicyResult = {
  policyArn?: string | undefined;
  name?: string | undefined;
  version?: string | undefined;
  policyId?: string | undefined;
  description?: string | undefined;
  definitionHash?: string | undefined;
  kmsKeyArn?: string | undefined;
  createdAt?: string | undefined;
  updatedAt?: string | undefined;
};

/** Result of get_automated_reasoning_policy_annotations. */
export type GetAutomatedReasoningPolicyAnnotationsResult = {
  policyArn?: string | undefined;
  name?: string | undefined;
  buildWorkflowId?: string | undefined;
  annotations?: unknown[];
  annotationSetHash?: string | undefined;
  updatedAt?: string | undefined;
};

/** Result of get_automated_reasoning_policy_build_workflow. */
export type GetAutomatedReasoningPolicyBuildWorkflowResult = {
  policyArn?: string | undefined;
  buildWorkflowId?: string | undefined;
  status?: string | undefined;
  buildWorkflowType?: string | undefined;
  documentName?: string | undefined;
  documentContentType?: string | undefined;
  documentDescription?: string | undefined;
  createdAt?: string | undefined;
  updatedAt?: string | undefined;
};

/** Result of get_automated_reasoning_policy_build_workflow_result_assets. */
export type GetAutomatedReasoningPolicyBuildWorkflowResultAssetsResult = {
  policyArn?: string | undefined;
  buildWorkflowId?: string | undefined;
  buildWorkflowAssets?: Record<string, unknown>;
};

/** Result of get_automated_reasoning_policy_next_scenario. */
export type GetAutomatedReasoningPolicyNextScenarioResult = {
  policyArn?: string | undefined;
  scenario?: Record<string, unknown>;
};

/** Result of get_automated_reasoning_policy_test_case. */
export type GetAutomatedReasoningPolicyTestCaseResult = {
  policyArn?: string | undefined;
  testCase?: Record<string, unknown>;
};

/** Result of get_automated_reasoning_policy_test_result. */
export type GetAutomatedReasoningPolicyTestResultResult = {
  testResult?: Record<string, unknown>;
};

/** Result of get_custom_model. */
export type GetCustomModelResult = {
  modelArn?: string | undefined;
  modelName?: string | undefined;
  jobName?: string | undefined;
  jobArn?: string | undefined;
  baseModelArn?: string | undefined;
  customizationType?: string | undefined;
  modelKmsKeyArn?: string | undefined;
  hyperParameters?: Record<string, unknown>;
  trainingDataConfig?: Record<string, unknown>;
  validationDataConfig?: Record<string, unknown>;
  outputDataConfig?: Record<string, unknown>;
  trainingMetrics?: Record<string, unknown>;
  validationMetrics?: unknown[];
  creationTime?: string | undefined;
  customizationConfig?: Record<string, unknown>;
  modelStatus?: string | undefined;
  failureMessage?: string | undefined;
};

/** Result of get_custom_model_deployment. */
export type GetCustomModelDeploymentResult = {
  customModelDeploymentArn?: string | undefined;
  modelDeploymentName?: string | undefined;
  modelArn?: string | undefined;
  createdAt?: string | undefined;
  status?: string | undefined;
  description?: string | undefined;
  failureMessage?: string | undefined;
  lastUpdatedAt?: string | undefined;
};

/** Result of get_evaluation_job. */
export type GetEvaluationJobResult = {
  jobName?: string | undefined;
  status?: string | undefined;
  jobArn?: string | undefined;
  jobDescription?: string | undefined;
  roleArn?: string | undefined;
  customerEncryptionKeyId?: string | undefined;
  jobType?: string | undefined;
  applicationType?: string | undefined;
  evaluationConfig?: Record<string, unknown>;
  inferenceConfig?: Record<string, unknown>;
  outputDataConfig?: Record<string, unknown>;
  creationTime?: string | undefined;
  lastModifiedTime?: string | undefined;
  failureMessages?: unknown[];
};

/** Result of get_foundation_model. */
export type GetFoundationModelResult = {
  modelDetails?: Record<string, unknown>;
};

/** Result of get_foundation_model_availability. */
export type GetFoundationModelAvailabilityResult = {
  modelId?: string | undefined;
  agreementAvailability?: Record<string, unknown>;
  authorizationStatus?: string | undefined;
  entitlementAvailability?: string | undefined;
  regionAvailability?: string | undefined;
};

/** Result of get_guardrail. */
export type GetGuardrailResult = {
  name?: string | undefined;
  description?: string | undefined;
  guardrailId?: string | undefined;
  guardrailArn?: string | undefined;
  version?: string | undefined;
  status?: string | undefined;
  topicPolicy?: Record<string, unknown>;
  contentPolicy?: Record<string, unknown>;
  wordPolicy?: Record<string, unknown>;
  sensitiveInformationPolicy?: Record<string, unknown>;
  contextualGroundingPolicy?: Record<string, unknown>;
  automatedReasoningPolicy?: Record<string, unknown>;
  crossRegionDetails?: Record<string, unknown>;
  createdAt?: string | undefined;
  updatedAt?: string | undefined;
  statusReasons?: unknown[];
  failureRecommendations?: unknown[];
  blockedInputMessaging?: string | undefined;
  blockedOutputsMessaging?: string | undefined;
  kmsKeyArn?: string | undefined;
};

/** Result of get_imported_model. */
export type GetImportedModelResult = {
  modelArn?: string | undefined;
  modelName?: string | undefined;
  jobName?: string | undefined;
  jobArn?: string | undefined;
  modelDataSource?: Record<string, unknown>;
  creationTime?: string | undefined;
  modelArchitecture?: string | undefined;
  modelKmsKeyArn?: string | undefined;
  instructSupported?: boolean | undefined;
  customModelUnits?: Record<string, unknown>;
};

/** Result of get_inference_profile. */
export type GetInferenceProfileResult = {
  inferenceProfileName?: string | undefined;
  description?: string | undefined;
  createdAt?: string | undefined;
  updatedAt?: string | undefined;
  inferenceProfileArn?: string | undefined;
  models?: unknown[];
  inferenceProfileId?: string | undefined;
  status?: string | undefined;
  type?: string | undefined;
};

/** Result of get_marketplace_model_endpoint. */
export type GetMarketplaceModelEndpointResult = {
  marketplaceModelEndpoint?: Record<string, unknown>;
};

/** Result of get_model_copy_job. */
export type GetModelCopyJobResult = {
  jobArn?: string | undefined;
  status?: string | undefined;
  creationTime?: string | undefined;
  targetModelArn?: string | undefined;
  targetModelName?: string | undefined;
  sourceAccountId?: string | undefined;
  sourceModelArn?: string | undefined;
  targetModelKmsKeyArn?: string | undefined;
  targetModelTags?: unknown[];
  failureMessage?: string | undefined;
  sourceModelName?: string | undefined;
};

/** Result of get_model_customization_job. */
export type GetModelCustomizationJobResult = {
  jobArn?: string | undefined;
  jobName?: string | undefined;
  outputModelName?: string | undefined;
  outputModelArn?: string | undefined;
  clientRequestToken?: string | undefined;
  roleArn?: string | undefined;
  status?: string | undefined;
  statusDetails?: Record<string, unknown>;
  failureMessage?: string | undefined;
  creationTime?: string | undefined;
  lastModifiedTime?: string | undefined;
  endTime?: string | undefined;
  baseModelArn?: string | undefined;
  hyperParameters?: Record<string, unknown>;
  trainingDataConfig?: Record<string, unknown>;
  validationDataConfig?: Record<string, unknown>;
  outputDataConfig?: Record<string, unknown>;
  customizationType?: string | undefined;
  outputModelKmsKeyArn?: string | undefined;
  trainingMetrics?: Record<string, unknown>;
  validationMetrics?: unknown[];
  vpcConfig?: Record<string, unknown>;
  customizationConfig?: Record<string, unknown>;
};

/** Result of get_model_import_job. */
export type GetModelImportJobResult = {
  jobArn?: string | undefined;
  jobName?: string | undefined;
  importedModelName?: string | undefined;
  importedModelArn?: string | undefined;
  roleArn?: string | undefined;
  modelDataSource?: Record<string, unknown>;
  status?: string | undefined;
  failureMessage?: string | undefined;
  creationTime?: string | undefined;
  lastModifiedTime?: string | undefined;
  endTime?: string | undefined;
  vpcConfig?: Record<string, unknown>;
  importedModelKmsKeyArn?: string | undefined;
};

/** Result of get_model_invocation_job. */
export type GetModelInvocationJobResult = {
  jobArn?: string | undefined;
  jobName?: string | undefined;
  modelId?: string | undefined;
  clientRequestToken?: string | undefined;
  roleArn?: string | undefined;
  status?: string | undefined;
  message?: string | undefined;
  submitTime?: string | undefined;
  lastModifiedTime?: string | undefined;
  endTime?: string | undefined;
  inputDataConfig?: Record<string, unknown>;
  outputDataConfig?: Record<string, unknown>;
  vpcConfig?: Record<string, unknown>;
  timeoutDurationInHours?: number | undefined;
  jobExpirationTime?: string | undefined;
};

/** Result of get_model_invocation_logging_configuration. */
export type GetModelInvocationLoggingConfigurationResult = {
  loggingConfig?: Record<string, unknown>;
};

/** Result of get_prompt_router. */
export type GetPromptRouterResult = {
  promptRouterName?: string | undefined;
  routingCriteria?: Record<string, unknown>;
  description?: string | undefined;
  createdAt?: string | undefined;
  updatedAt?: string | undefined;
  promptRouterArn?: string | undefined;
  models?: unknown[];
  fallbackModel?: Record<string, unknown>;
  status?: string | undefined;
  type?: string | undefined;
};

/** Result of get_provisioned_model_throughput. */
export type GetProvisionedModelThroughputResult = {
  modelUnits?: number | undefined;
  desiredModelUnits?: number | undefined;
  provisionedModelName?: string | undefined;
  provisionedModelArn?: string | undefined;
  modelArn?: string | undefined;
  desiredModelArn?: string | undefined;
  foundationModelArn?: string | undefined;
  status?: string | undefined;
  creationTime?: string | undefined;
  lastModifiedTime?: string | undefined;
  failureMessage?: string | undefined;
  commitmentDuration?: string | undefined;
  commitmentExpirationTime?: string | undefined;
};

/** Result of get_use_case_for_model_access. */
export type GetUseCaseForModelAccessResult = {
  formData?: unknown | undefined;
};

/** Result of list_automated_reasoning_policies. */
export type ListAutomatedReasoningPoliciesResult = {
  automatedReasoningPolicySummaries?: unknown[];
  nextToken?: string | undefined;
};

/** Result of list_automated_reasoning_policy_build_workflows. */
export type ListAutomatedReasoningPolicyBuildWorkflowsResult = {
  automatedReasoningPolicyBuildWorkflowSummaries?: unknown[];
  nextToken?: string | undefined;
};

/** Result of list_automated_reasoning_policy_test_cases. */
export type ListAutomatedReasoningPolicyTestCasesResult = {
  testCases?: unknown[];
  nextToken?: string | undefined;
};

/** Result of list_automated_reasoning_policy_test_results. */
export type ListAutomatedReasoningPolicyTestResultsResult = {
  testResults?: unknown[];
  nextToken?: string | undefined;
};

/** Result of list_custom_model_deployments. */
export type ListCustomModelDeploymentsResult = {
  nextToken?: string | undefined;
  modelDeploymentSummaries?: unknown[];
};

/** Result of list_custom_models. */
export type ListCustomModelsResult = {
  nextToken?: string | undefined;
  modelSummaries?: unknown[];
};

/** Result of list_evaluation_jobs. */
export type ListEvaluationJobsResult = {
  nextToken?: string | undefined;
  jobSummaries?: unknown[];
};

/** Result of list_foundation_model_agreement_offers. */
export type ListFoundationModelAgreementOffersResult = {
  modelId?: string | undefined;
  offers?: unknown[];
};

/** Result of list_guardrails. */
export type ListGuardrailsResult = {
  guardrails?: unknown[];
  nextToken?: string | undefined;
};

/** Result of list_imported_models. */
export type ListImportedModelsResult = {
  nextToken?: string | undefined;
  modelSummaries?: unknown[];
};

/** Result of list_inference_profiles. */
export type ListInferenceProfilesResult = {
  inferenceProfileSummaries?: unknown[];
  nextToken?: string | undefined;
};

/** Result of list_marketplace_model_endpoints. */
export type ListMarketplaceModelEndpointsResult = {
  marketplaceModelEndpoints?: unknown[];
  nextToken?: string | undefined;
};

/** Result of list_model_copy_jobs. */
export type ListModelCopyJobsResult = {
  nextToken?: string | undefined;
  modelCopyJobSummaries?: unknown[];
};

/** Result of list_model_customization_jobs. */
export type ListModelCustomizationJobsResult = {
  nextToken?: string | undefined;
  modelCustomizationJobSummaries?: unknown[];
};

/** Result of list_model_import_jobs. */
export type ListModelImportJobsResult = {
  nextToken?: string | undefined;
  modelImportJobSummaries?: unknown[];
};

/** Result of list_model_invocation_jobs. */
export type ListModelInvocationJobsResult = {
  nextToken?: string | undefined;
  invocationJobSummaries?: unknown[];
};

/** Result of list_prompt_routers. */
export type ListPromptRoutersResult = {
  promptRouterSummaries?: unknown[];
  nextToken?: string | undefined;
};

/** Result of list_provisioned_model_throughputs. */
export type ListProvisionedModelThroughputsResult = {
  nextToken?: string | undefined;
  provisionedModelSummaries?: unknown[];
};

/** Result of list_tags_for_resource. */
export type ListTagsForResourceResult = {
  tags?: unknown[];
};

/** Result of put_model_invocation_logging_configuration. */
export type PutModelInvocationLoggingConfigurationResult = {
};

/** Result of put_use_case_for_model_access. */
export type PutUseCaseForModelAccessResult = {
};

/** Result of register_marketplace_model_endpoint. */
export type RegisterMarketplaceModelEndpointResult = {
  marketplaceModelEndpoint?: Record<string, unknown>;
};

/** Result of start_automated_reasoning_policy_build_workflow. */
export type StartAutomatedReasoningPolicyBuildWorkflowResult = {
  policyArn?: string | undefined;
  buildWorkflowId?: string | undefined;
};

/** Result of start_automated_reasoning_policy_test_workflow. */
export type StartAutomatedReasoningPolicyTestWorkflowResult = {
  policyArn?: string | undefined;
};

/** Result of stop_evaluation_job. */
export type StopEvaluationJobResult = {
};

/** Result of stop_model_customization_job. */
export type StopModelCustomizationJobResult = {
};

/** Result of stop_model_invocation_job. */
export type StopModelInvocationJobResult = {
};

/** Result of tag_resource. */
export type TagResourceResult = {
};

/** Result of untag_resource. */
export type UntagResourceResult = {
};

/** Result of update_automated_reasoning_policy. */
export type UpdateAutomatedReasoningPolicyResult = {
  policyArn?: string | undefined;
  name?: string | undefined;
  definitionHash?: string | undefined;
  updatedAt?: string | undefined;
};

/** Result of update_automated_reasoning_policy_annotations. */
export type UpdateAutomatedReasoningPolicyAnnotationsResult = {
  policyArn?: string | undefined;
  buildWorkflowId?: string | undefined;
  annotationSetHash?: string | undefined;
  updatedAt?: string | undefined;
};

/** Result of update_automated_reasoning_policy_test_case. */
export type UpdateAutomatedReasoningPolicyTestCaseResult = {
  policyArn?: string | undefined;
  testCaseId?: string | undefined;
};

/** Result of update_guardrail. */
export type UpdateGuardrailResult = {
  guardrailId?: string | undefined;
  guardrailArn?: string | undefined;
  version?: string | undefined;
  updatedAt?: string | undefined;
};

/** Result of update_marketplace_model_endpoint. */
export type UpdateMarketplaceModelEndpointResult = {
  marketplaceModelEndpoint?: Record<string, unknown>;
};

/** Result of update_provisioned_model_throughput. */
export type UpdateProvisionedModelThroughputResult = {
};


// ---------------------------------------------------------------------------
// Additional functions (auto-generated)
// ---------------------------------------------------------------------------

/** Stream a Claude response token-by-token using Bedrock's response streaming. */
export async function streamInvokeClaude(prompt: string, modelId: string, maxTokens: number, temperature: number, system?: string | undefined, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement stream_invoke_claude
    throw new Error("stream_invoke_claude not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "stream_invoke_claude failed");
  }
}

/** Apply guardrail. */
export async function applyGuardrail(guardrailIdentifier: string, guardrailVersion: string, source: string, content: Record<string, unknown>[]): Promise<ApplyGuardrailResult> {
  try {
    // TODO: implement apply_guardrail
    throw new Error("apply_guardrail not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "apply_guardrail failed");
  }
}

/** Converse. */
export async function converse(modelId: string): Promise<ConverseResult> {
  try {
    // TODO: implement converse
    throw new Error("converse not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "converse failed");
  }
}

/** Converse stream. */
export async function converseStream(modelId: string): Promise<ConverseStreamResult> {
  try {
    // TODO: implement converse_stream
    throw new Error("converse_stream not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "converse_stream failed");
  }
}

/** Count tokens. */
export async function countTokens(modelId: string, input: Record<string, unknown>, regionName?: string | undefined): Promise<CountTokensResult> {
  try {
    // TODO: implement count_tokens
    throw new Error("count_tokens not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "count_tokens failed");
  }
}

/** Get async invoke. */
export async function getAsyncInvoke(invocationArn: string, regionName?: string | undefined): Promise<GetAsyncInvokeResult> {
  try {
    // TODO: implement get_async_invoke
    throw new Error("get_async_invoke not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_async_invoke failed");
  }
}

/** Invoke model with response stream. */
export async function invokeModelWithResponseStream(modelId: string): Promise<InvokeModelWithResponseStreamResult> {
  try {
    // TODO: implement invoke_model_with_response_stream
    throw new Error("invoke_model_with_response_stream not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "invoke_model_with_response_stream failed");
  }
}

/** List async invokes. */
export async function listAsyncInvokes(): Promise<ListAsyncInvokesResult> {
  try {
    // TODO: implement list_async_invokes
    throw new Error("list_async_invokes not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_async_invokes failed");
  }
}

/** Start async invoke. */
export async function startAsyncInvoke(modelId: string, modelInput: Record<string, unknown>, outputDataConfig: Record<string, unknown>): Promise<StartAsyncInvokeResult> {
  try {
    // TODO: implement start_async_invoke
    throw new Error("start_async_invoke not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_async_invoke failed");
  }
}

/** Batch delete evaluation job. */
export async function batchDeleteEvaluationJob(jobIdentifiers: unknown[]): Promise<BatchDeleteEvaluationJobResult> {
  try {
    // TODO: implement batch_delete_evaluation_job
    throw new Error("batch_delete_evaluation_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_delete_evaluation_job failed");
  }
}

/** Cancel automated reasoning policy build workflow. */
export async function cancelAutomatedReasoningPolicyBuildWorkflow(policyArn: string, buildWorkflowId: string): Promise<CancelAutomatedReasoningPolicyBuildWorkflowResult> {
  try {
    // TODO: implement cancel_automated_reasoning_policy_build_workflow
    throw new Error("cancel_automated_reasoning_policy_build_workflow not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "cancel_automated_reasoning_policy_build_workflow failed");
  }
}

/** Create automated reasoning policy. */
export async function createAutomatedReasoningPolicy(name: string): Promise<CreateAutomatedReasoningPolicyResult> {
  try {
    // TODO: implement create_automated_reasoning_policy
    throw new Error("create_automated_reasoning_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_automated_reasoning_policy failed");
  }
}

/** Create automated reasoning policy test case. */
export async function createAutomatedReasoningPolicyTestCase(policyArn: string, guardContent: string, expectedAggregatedFindingsResult: string): Promise<CreateAutomatedReasoningPolicyTestCaseResult> {
  try {
    // TODO: implement create_automated_reasoning_policy_test_case
    throw new Error("create_automated_reasoning_policy_test_case not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_automated_reasoning_policy_test_case failed");
  }
}

/** Create automated reasoning policy version. */
export async function createAutomatedReasoningPolicyVersion(policyArn: string, lastUpdatedDefinitionHash: string): Promise<CreateAutomatedReasoningPolicyVersionResult> {
  try {
    // TODO: implement create_automated_reasoning_policy_version
    throw new Error("create_automated_reasoning_policy_version not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_automated_reasoning_policy_version failed");
  }
}

/** Create custom model. */
export async function createCustomModel(modelName: string, modelSourceConfig: Record<string, unknown>): Promise<CreateCustomModelResult> {
  try {
    // TODO: implement create_custom_model
    throw new Error("create_custom_model not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_custom_model failed");
  }
}

/** Create custom model deployment. */
export async function createCustomModelDeployment(modelDeploymentName: string, modelArn: string): Promise<CreateCustomModelDeploymentResult> {
  try {
    // TODO: implement create_custom_model_deployment
    throw new Error("create_custom_model_deployment not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_custom_model_deployment failed");
  }
}

/** Create evaluation job. */
export async function createEvaluationJob(jobName: string, roleArn: string, evaluationConfig: Record<string, unknown>, inferenceConfig: Record<string, unknown>, outputDataConfig: Record<string, unknown>): Promise<CreateEvaluationJobResult> {
  try {
    // TODO: implement create_evaluation_job
    throw new Error("create_evaluation_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_evaluation_job failed");
  }
}

/** Create foundation model agreement. */
export async function createFoundationModelAgreement(offerToken: string, modelId: string): Promise<CreateFoundationModelAgreementResult> {
  try {
    // TODO: implement create_foundation_model_agreement
    throw new Error("create_foundation_model_agreement not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_foundation_model_agreement failed");
  }
}

/** Create guardrail. */
export async function createGuardrail(name: string, blockedInputMessaging: string, blockedOutputsMessaging: string): Promise<CreateGuardrailResult> {
  try {
    // TODO: implement create_guardrail
    throw new Error("create_guardrail not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_guardrail failed");
  }
}

/** Create guardrail version. */
export async function createGuardrailVersion(guardrailIdentifier: string): Promise<CreateGuardrailVersionResult> {
  try {
    // TODO: implement create_guardrail_version
    throw new Error("create_guardrail_version not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_guardrail_version failed");
  }
}

/** Create inference profile. */
export async function createInferenceProfile(inferenceProfileName: string, modelSource: Record<string, unknown>): Promise<CreateInferenceProfileResult> {
  try {
    // TODO: implement create_inference_profile
    throw new Error("create_inference_profile not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_inference_profile failed");
  }
}

/** Create marketplace model endpoint. */
export async function createMarketplaceModelEndpoint(modelSourceIdentifier: string, endpointConfig: Record<string, unknown>, endpointName: string): Promise<CreateMarketplaceModelEndpointResult> {
  try {
    // TODO: implement create_marketplace_model_endpoint
    throw new Error("create_marketplace_model_endpoint not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_marketplace_model_endpoint failed");
  }
}

/** Create model copy job. */
export async function createModelCopyJob(sourceModelArn: string, targetModelName: string): Promise<CreateModelCopyJobResult> {
  try {
    // TODO: implement create_model_copy_job
    throw new Error("create_model_copy_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_model_copy_job failed");
  }
}

/** Create model customization job. */
export async function createModelCustomizationJob(jobName: string, customModelName: string, roleArn: string, baseModelIdentifier: string, trainingDataConfig: Record<string, unknown>, outputDataConfig: Record<string, unknown>): Promise<CreateModelCustomizationJobResult> {
  try {
    // TODO: implement create_model_customization_job
    throw new Error("create_model_customization_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_model_customization_job failed");
  }
}

/** Create model import job. */
export async function createModelImportJob(jobName: string, importedModelName: string, roleArn: string, modelDataSource: Record<string, unknown>): Promise<CreateModelImportJobResult> {
  try {
    // TODO: implement create_model_import_job
    throw new Error("create_model_import_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_model_import_job failed");
  }
}

/** Create model invocation job. */
export async function createModelInvocationJob(jobName: string, roleArn: string, modelId: string, inputDataConfig: Record<string, unknown>, outputDataConfig: Record<string, unknown>): Promise<CreateModelInvocationJobResult> {
  try {
    // TODO: implement create_model_invocation_job
    throw new Error("create_model_invocation_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_model_invocation_job failed");
  }
}

/** Create prompt router. */
export async function createPromptRouter(promptRouterName: string, models: unknown[], routingCriteria: Record<string, unknown>, fallbackModel: Record<string, unknown>): Promise<CreatePromptRouterResult> {
  try {
    // TODO: implement create_prompt_router
    throw new Error("create_prompt_router not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_prompt_router failed");
  }
}

/** Create provisioned model throughput. */
export async function createProvisionedModelThroughput(modelUnits: number, provisionedModelName: string, modelId: string): Promise<CreateProvisionedModelThroughputResult> {
  try {
    // TODO: implement create_provisioned_model_throughput
    throw new Error("create_provisioned_model_throughput not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_provisioned_model_throughput failed");
  }
}

/** Delete automated reasoning policy. */
export async function deleteAutomatedReasoningPolicy(policyArn: string): Promise<DeleteAutomatedReasoningPolicyResult> {
  try {
    // TODO: implement delete_automated_reasoning_policy
    throw new Error("delete_automated_reasoning_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_automated_reasoning_policy failed");
  }
}

/** Delete automated reasoning policy build workflow. */
export async function deleteAutomatedReasoningPolicyBuildWorkflow(policyArn: string, buildWorkflowId: string, lastUpdatedAt: string): Promise<DeleteAutomatedReasoningPolicyBuildWorkflowResult> {
  try {
    // TODO: implement delete_automated_reasoning_policy_build_workflow
    throw new Error("delete_automated_reasoning_policy_build_workflow not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_automated_reasoning_policy_build_workflow failed");
  }
}

/** Delete automated reasoning policy test case. */
export async function deleteAutomatedReasoningPolicyTestCase(policyArn: string, testCaseId: string, lastUpdatedAt: string): Promise<DeleteAutomatedReasoningPolicyTestCaseResult> {
  try {
    // TODO: implement delete_automated_reasoning_policy_test_case
    throw new Error("delete_automated_reasoning_policy_test_case not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_automated_reasoning_policy_test_case failed");
  }
}

/** Delete custom model. */
export async function deleteCustomModel(modelIdentifier: string): Promise<DeleteCustomModelResult> {
  try {
    // TODO: implement delete_custom_model
    throw new Error("delete_custom_model not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_custom_model failed");
  }
}

/** Delete custom model deployment. */
export async function deleteCustomModelDeployment(customModelDeploymentIdentifier: string): Promise<DeleteCustomModelDeploymentResult> {
  try {
    // TODO: implement delete_custom_model_deployment
    throw new Error("delete_custom_model_deployment not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_custom_model_deployment failed");
  }
}

/** Delete foundation model agreement. */
export async function deleteFoundationModelAgreement(modelId: string): Promise<DeleteFoundationModelAgreementResult> {
  try {
    // TODO: implement delete_foundation_model_agreement
    throw new Error("delete_foundation_model_agreement not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_foundation_model_agreement failed");
  }
}

/** Delete guardrail. */
export async function deleteGuardrail(guardrailIdentifier: string): Promise<DeleteGuardrailResult> {
  try {
    // TODO: implement delete_guardrail
    throw new Error("delete_guardrail not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_guardrail failed");
  }
}

/** Delete imported model. */
export async function deleteImportedModel(modelIdentifier: string): Promise<DeleteImportedModelResult> {
  try {
    // TODO: implement delete_imported_model
    throw new Error("delete_imported_model not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_imported_model failed");
  }
}

/** Delete inference profile. */
export async function deleteInferenceProfile(inferenceProfileIdentifier: string): Promise<DeleteInferenceProfileResult> {
  try {
    // TODO: implement delete_inference_profile
    throw new Error("delete_inference_profile not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_inference_profile failed");
  }
}

/** Delete marketplace model endpoint. */
export async function deleteMarketplaceModelEndpoint(endpointArn: string): Promise<DeleteMarketplaceModelEndpointResult> {
  try {
    // TODO: implement delete_marketplace_model_endpoint
    throw new Error("delete_marketplace_model_endpoint not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_marketplace_model_endpoint failed");
  }
}

/** Delete model invocation logging configuration. */
export async function deleteModelInvocationLoggingConfiguration(): Promise<DeleteModelInvocationLoggingConfigurationResult> {
  try {
    // TODO: implement delete_model_invocation_logging_configuration
    throw new Error("delete_model_invocation_logging_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_model_invocation_logging_configuration failed");
  }
}

/** Delete prompt router. */
export async function deletePromptRouter(promptRouterArn: string): Promise<DeletePromptRouterResult> {
  try {
    // TODO: implement delete_prompt_router
    throw new Error("delete_prompt_router not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_prompt_router failed");
  }
}

/** Delete provisioned model throughput. */
export async function deleteProvisionedModelThroughput(provisionedModelId: string): Promise<DeleteProvisionedModelThroughputResult> {
  try {
    // TODO: implement delete_provisioned_model_throughput
    throw new Error("delete_provisioned_model_throughput not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_provisioned_model_throughput failed");
  }
}

/** Deregister marketplace model endpoint. */
export async function deregisterMarketplaceModelEndpoint(endpointArn: string): Promise<DeregisterMarketplaceModelEndpointResult> {
  try {
    // TODO: implement deregister_marketplace_model_endpoint
    throw new Error("deregister_marketplace_model_endpoint not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "deregister_marketplace_model_endpoint failed");
  }
}

/** Export automated reasoning policy version. */
export async function exportAutomatedReasoningPolicyVersion(policyArn: string): Promise<ExportAutomatedReasoningPolicyVersionResult> {
  try {
    // TODO: implement export_automated_reasoning_policy_version
    throw new Error("export_automated_reasoning_policy_version not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "export_automated_reasoning_policy_version failed");
  }
}

/** Get automated reasoning policy. */
export async function getAutomatedReasoningPolicy(policyArn: string): Promise<GetAutomatedReasoningPolicyResult> {
  try {
    // TODO: implement get_automated_reasoning_policy
    throw new Error("get_automated_reasoning_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_automated_reasoning_policy failed");
  }
}

/** Get automated reasoning policy annotations. */
export async function getAutomatedReasoningPolicyAnnotations(policyArn: string, buildWorkflowId: string): Promise<GetAutomatedReasoningPolicyAnnotationsResult> {
  try {
    // TODO: implement get_automated_reasoning_policy_annotations
    throw new Error("get_automated_reasoning_policy_annotations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_automated_reasoning_policy_annotations failed");
  }
}

/** Get automated reasoning policy build workflow. */
export async function getAutomatedReasoningPolicyBuildWorkflow(policyArn: string, buildWorkflowId: string): Promise<GetAutomatedReasoningPolicyBuildWorkflowResult> {
  try {
    // TODO: implement get_automated_reasoning_policy_build_workflow
    throw new Error("get_automated_reasoning_policy_build_workflow not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_automated_reasoning_policy_build_workflow failed");
  }
}

/** Get automated reasoning policy build workflow result assets. */
export async function getAutomatedReasoningPolicyBuildWorkflowResultAssets(policyArn: string, buildWorkflowId: string, assetType: string): Promise<GetAutomatedReasoningPolicyBuildWorkflowResultAssetsResult> {
  try {
    // TODO: implement get_automated_reasoning_policy_build_workflow_result_assets
    throw new Error("get_automated_reasoning_policy_build_workflow_result_assets not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_automated_reasoning_policy_build_workflow_result_assets failed");
  }
}

/** Get automated reasoning policy next scenario. */
export async function getAutomatedReasoningPolicyNextScenario(policyArn: string, buildWorkflowId: string): Promise<GetAutomatedReasoningPolicyNextScenarioResult> {
  try {
    // TODO: implement get_automated_reasoning_policy_next_scenario
    throw new Error("get_automated_reasoning_policy_next_scenario not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_automated_reasoning_policy_next_scenario failed");
  }
}

/** Get automated reasoning policy test case. */
export async function getAutomatedReasoningPolicyTestCase(policyArn: string, testCaseId: string): Promise<GetAutomatedReasoningPolicyTestCaseResult> {
  try {
    // TODO: implement get_automated_reasoning_policy_test_case
    throw new Error("get_automated_reasoning_policy_test_case not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_automated_reasoning_policy_test_case failed");
  }
}

/** Get automated reasoning policy test result. */
export async function getAutomatedReasoningPolicyTestResult(policyArn: string, buildWorkflowId: string, testCaseId: string): Promise<GetAutomatedReasoningPolicyTestResultResult> {
  try {
    // TODO: implement get_automated_reasoning_policy_test_result
    throw new Error("get_automated_reasoning_policy_test_result not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_automated_reasoning_policy_test_result failed");
  }
}

/** Get custom model. */
export async function getCustomModel(modelIdentifier: string): Promise<GetCustomModelResult> {
  try {
    // TODO: implement get_custom_model
    throw new Error("get_custom_model not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_custom_model failed");
  }
}

/** Get custom model deployment. */
export async function getCustomModelDeployment(customModelDeploymentIdentifier: string): Promise<GetCustomModelDeploymentResult> {
  try {
    // TODO: implement get_custom_model_deployment
    throw new Error("get_custom_model_deployment not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_custom_model_deployment failed");
  }
}

/** Get evaluation job. */
export async function getEvaluationJob(jobIdentifier: string): Promise<GetEvaluationJobResult> {
  try {
    // TODO: implement get_evaluation_job
    throw new Error("get_evaluation_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_evaluation_job failed");
  }
}

/** Get foundation model. */
export async function getFoundationModel(modelIdentifier: string): Promise<GetFoundationModelResult> {
  try {
    // TODO: implement get_foundation_model
    throw new Error("get_foundation_model not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_foundation_model failed");
  }
}

/** Get foundation model availability. */
export async function getFoundationModelAvailability(modelId: string): Promise<GetFoundationModelAvailabilityResult> {
  try {
    // TODO: implement get_foundation_model_availability
    throw new Error("get_foundation_model_availability not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_foundation_model_availability failed");
  }
}

/** Get guardrail. */
export async function getGuardrail(guardrailIdentifier: string): Promise<GetGuardrailResult> {
  try {
    // TODO: implement get_guardrail
    throw new Error("get_guardrail not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_guardrail failed");
  }
}

/** Get imported model. */
export async function getImportedModel(modelIdentifier: string): Promise<GetImportedModelResult> {
  try {
    // TODO: implement get_imported_model
    throw new Error("get_imported_model not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_imported_model failed");
  }
}

/** Get inference profile. */
export async function getInferenceProfile(inferenceProfileIdentifier: string): Promise<GetInferenceProfileResult> {
  try {
    // TODO: implement get_inference_profile
    throw new Error("get_inference_profile not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_inference_profile failed");
  }
}

/** Get marketplace model endpoint. */
export async function getMarketplaceModelEndpoint(endpointArn: string): Promise<GetMarketplaceModelEndpointResult> {
  try {
    // TODO: implement get_marketplace_model_endpoint
    throw new Error("get_marketplace_model_endpoint not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_marketplace_model_endpoint failed");
  }
}

/** Get model copy job. */
export async function getModelCopyJob(jobArn: string): Promise<GetModelCopyJobResult> {
  try {
    // TODO: implement get_model_copy_job
    throw new Error("get_model_copy_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_model_copy_job failed");
  }
}

/** Get model customization job. */
export async function getModelCustomizationJob(jobIdentifier: string): Promise<GetModelCustomizationJobResult> {
  try {
    // TODO: implement get_model_customization_job
    throw new Error("get_model_customization_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_model_customization_job failed");
  }
}

/** Get model import job. */
export async function getModelImportJob(jobIdentifier: string): Promise<GetModelImportJobResult> {
  try {
    // TODO: implement get_model_import_job
    throw new Error("get_model_import_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_model_import_job failed");
  }
}

/** Get model invocation job. */
export async function getModelInvocationJob(jobIdentifier: string): Promise<GetModelInvocationJobResult> {
  try {
    // TODO: implement get_model_invocation_job
    throw new Error("get_model_invocation_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_model_invocation_job failed");
  }
}

/** Get model invocation logging configuration. */
export async function getModelInvocationLoggingConfiguration(): Promise<GetModelInvocationLoggingConfigurationResult> {
  try {
    // TODO: implement get_model_invocation_logging_configuration
    throw new Error("get_model_invocation_logging_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_model_invocation_logging_configuration failed");
  }
}

/** Get prompt router. */
export async function getPromptRouter(promptRouterArn: string): Promise<GetPromptRouterResult> {
  try {
    // TODO: implement get_prompt_router
    throw new Error("get_prompt_router not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_prompt_router failed");
  }
}

/** Get provisioned model throughput. */
export async function getProvisionedModelThroughput(provisionedModelId: string): Promise<GetProvisionedModelThroughputResult> {
  try {
    // TODO: implement get_provisioned_model_throughput
    throw new Error("get_provisioned_model_throughput not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_provisioned_model_throughput failed");
  }
}

/** Get use case for model access. */
export async function getUseCaseForModelAccess(): Promise<GetUseCaseForModelAccessResult> {
  try {
    // TODO: implement get_use_case_for_model_access
    throw new Error("get_use_case_for_model_access not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_use_case_for_model_access failed");
  }
}

/** List automated reasoning policies. */
export async function listAutomatedReasoningPolicies(): Promise<ListAutomatedReasoningPoliciesResult> {
  try {
    // TODO: implement list_automated_reasoning_policies
    throw new Error("list_automated_reasoning_policies not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_automated_reasoning_policies failed");
  }
}

/** List automated reasoning policy build workflows. */
export async function listAutomatedReasoningPolicyBuildWorkflows(policyArn: string): Promise<ListAutomatedReasoningPolicyBuildWorkflowsResult> {
  try {
    // TODO: implement list_automated_reasoning_policy_build_workflows
    throw new Error("list_automated_reasoning_policy_build_workflows not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_automated_reasoning_policy_build_workflows failed");
  }
}

/** List automated reasoning policy test cases. */
export async function listAutomatedReasoningPolicyTestCases(policyArn: string): Promise<ListAutomatedReasoningPolicyTestCasesResult> {
  try {
    // TODO: implement list_automated_reasoning_policy_test_cases
    throw new Error("list_automated_reasoning_policy_test_cases not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_automated_reasoning_policy_test_cases failed");
  }
}

/** List automated reasoning policy test results. */
export async function listAutomatedReasoningPolicyTestResults(policyArn: string, buildWorkflowId: string): Promise<ListAutomatedReasoningPolicyTestResultsResult> {
  try {
    // TODO: implement list_automated_reasoning_policy_test_results
    throw new Error("list_automated_reasoning_policy_test_results not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_automated_reasoning_policy_test_results failed");
  }
}

/** List custom model deployments. */
export async function listCustomModelDeployments(): Promise<ListCustomModelDeploymentsResult> {
  try {
    // TODO: implement list_custom_model_deployments
    throw new Error("list_custom_model_deployments not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_custom_model_deployments failed");
  }
}

/** List custom models. */
export async function listCustomModels(): Promise<ListCustomModelsResult> {
  try {
    // TODO: implement list_custom_models
    throw new Error("list_custom_models not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_custom_models failed");
  }
}

/** List evaluation jobs. */
export async function listEvaluationJobs(): Promise<ListEvaluationJobsResult> {
  try {
    // TODO: implement list_evaluation_jobs
    throw new Error("list_evaluation_jobs not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_evaluation_jobs failed");
  }
}

/** List foundation model agreement offers. */
export async function listFoundationModelAgreementOffers(modelId: string): Promise<ListFoundationModelAgreementOffersResult> {
  try {
    // TODO: implement list_foundation_model_agreement_offers
    throw new Error("list_foundation_model_agreement_offers not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_foundation_model_agreement_offers failed");
  }
}

/** List guardrails. */
export async function listGuardrails(): Promise<ListGuardrailsResult> {
  try {
    // TODO: implement list_guardrails
    throw new Error("list_guardrails not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_guardrails failed");
  }
}

/** List imported models. */
export async function listImportedModels(): Promise<ListImportedModelsResult> {
  try {
    // TODO: implement list_imported_models
    throw new Error("list_imported_models not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_imported_models failed");
  }
}

/** List inference profiles. */
export async function listInferenceProfiles(): Promise<ListInferenceProfilesResult> {
  try {
    // TODO: implement list_inference_profiles
    throw new Error("list_inference_profiles not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_inference_profiles failed");
  }
}

/** List marketplace model endpoints. */
export async function listMarketplaceModelEndpoints(): Promise<ListMarketplaceModelEndpointsResult> {
  try {
    // TODO: implement list_marketplace_model_endpoints
    throw new Error("list_marketplace_model_endpoints not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_marketplace_model_endpoints failed");
  }
}

/** List model copy jobs. */
export async function listModelCopyJobs(): Promise<ListModelCopyJobsResult> {
  try {
    // TODO: implement list_model_copy_jobs
    throw new Error("list_model_copy_jobs not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_model_copy_jobs failed");
  }
}

/** List model customization jobs. */
export async function listModelCustomizationJobs(): Promise<ListModelCustomizationJobsResult> {
  try {
    // TODO: implement list_model_customization_jobs
    throw new Error("list_model_customization_jobs not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_model_customization_jobs failed");
  }
}

/** List model import jobs. */
export async function listModelImportJobs(): Promise<ListModelImportJobsResult> {
  try {
    // TODO: implement list_model_import_jobs
    throw new Error("list_model_import_jobs not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_model_import_jobs failed");
  }
}

/** List model invocation jobs. */
export async function listModelInvocationJobs(): Promise<ListModelInvocationJobsResult> {
  try {
    // TODO: implement list_model_invocation_jobs
    throw new Error("list_model_invocation_jobs not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_model_invocation_jobs failed");
  }
}

/** List prompt routers. */
export async function listPromptRouters(): Promise<ListPromptRoutersResult> {
  try {
    // TODO: implement list_prompt_routers
    throw new Error("list_prompt_routers not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_prompt_routers failed");
  }
}

/** List provisioned model throughputs. */
export async function listProvisionedModelThroughputs(): Promise<ListProvisionedModelThroughputsResult> {
  try {
    // TODO: implement list_provisioned_model_throughputs
    throw new Error("list_provisioned_model_throughputs not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_provisioned_model_throughputs failed");
  }
}

/** List tags for resource. */
export async function listTagsForResource(resourceArn: string): Promise<ListTagsForResourceResult> {
  try {
    // TODO: implement list_tags_for_resource
    throw new Error("list_tags_for_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_tags_for_resource failed");
  }
}

/** Put model invocation logging configuration. */
export async function putModelInvocationLoggingConfiguration(loggingConfig: Record<string, unknown>): Promise<PutModelInvocationLoggingConfigurationResult> {
  try {
    // TODO: implement put_model_invocation_logging_configuration
    throw new Error("put_model_invocation_logging_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_model_invocation_logging_configuration failed");
  }
}

/** Put use case for model access. */
export async function putUseCaseForModelAccess(formData: unknown): Promise<PutUseCaseForModelAccessResult> {
  try {
    // TODO: implement put_use_case_for_model_access
    throw new Error("put_use_case_for_model_access not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_use_case_for_model_access failed");
  }
}

/** Register marketplace model endpoint. */
export async function registerMarketplaceModelEndpoint(endpointIdentifier: string, modelSourceIdentifier: string): Promise<RegisterMarketplaceModelEndpointResult> {
  try {
    // TODO: implement register_marketplace_model_endpoint
    throw new Error("register_marketplace_model_endpoint not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "register_marketplace_model_endpoint failed");
  }
}

/** Start automated reasoning policy build workflow. */
export async function startAutomatedReasoningPolicyBuildWorkflow(policyArn: string, buildWorkflowType: string, sourceContent: Record<string, unknown>): Promise<StartAutomatedReasoningPolicyBuildWorkflowResult> {
  try {
    // TODO: implement start_automated_reasoning_policy_build_workflow
    throw new Error("start_automated_reasoning_policy_build_workflow not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_automated_reasoning_policy_build_workflow failed");
  }
}

/** Start automated reasoning policy test workflow. */
export async function startAutomatedReasoningPolicyTestWorkflow(policyArn: string, buildWorkflowId: string): Promise<StartAutomatedReasoningPolicyTestWorkflowResult> {
  try {
    // TODO: implement start_automated_reasoning_policy_test_workflow
    throw new Error("start_automated_reasoning_policy_test_workflow not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_automated_reasoning_policy_test_workflow failed");
  }
}

/** Stop evaluation job. */
export async function stopEvaluationJob(jobIdentifier: string): Promise<StopEvaluationJobResult> {
  try {
    // TODO: implement stop_evaluation_job
    throw new Error("stop_evaluation_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "stop_evaluation_job failed");
  }
}

/** Stop model customization job. */
export async function stopModelCustomizationJob(jobIdentifier: string): Promise<StopModelCustomizationJobResult> {
  try {
    // TODO: implement stop_model_customization_job
    throw new Error("stop_model_customization_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "stop_model_customization_job failed");
  }
}

/** Stop model invocation job. */
export async function stopModelInvocationJob(jobIdentifier: string): Promise<StopModelInvocationJobResult> {
  try {
    // TODO: implement stop_model_invocation_job
    throw new Error("stop_model_invocation_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "stop_model_invocation_job failed");
  }
}

/** Tag resource. */
export async function tagResource(resourceArn: string, tags: unknown[]): Promise<TagResourceResult> {
  try {
    // TODO: implement tag_resource
    throw new Error("tag_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "tag_resource failed");
  }
}

/** Untag resource. */
export async function untagResource(resourceArn: string, tagKeys: unknown[]): Promise<UntagResourceResult> {
  try {
    // TODO: implement untag_resource
    throw new Error("untag_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "untag_resource failed");
  }
}

/** Update automated reasoning policy. */
export async function updateAutomatedReasoningPolicy(policyArn: string, policyDefinition: Record<string, unknown>): Promise<UpdateAutomatedReasoningPolicyResult> {
  try {
    // TODO: implement update_automated_reasoning_policy
    throw new Error("update_automated_reasoning_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_automated_reasoning_policy failed");
  }
}

/** Update automated reasoning policy annotations. */
export async function updateAutomatedReasoningPolicyAnnotations(policyArn: string, buildWorkflowId: string, annotations: unknown[], lastUpdatedAnnotationSetHash: string): Promise<UpdateAutomatedReasoningPolicyAnnotationsResult> {
  try {
    // TODO: implement update_automated_reasoning_policy_annotations
    throw new Error("update_automated_reasoning_policy_annotations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_automated_reasoning_policy_annotations failed");
  }
}

/** Update automated reasoning policy test case. */
export async function updateAutomatedReasoningPolicyTestCase(policyArn: string, testCaseId: string, guardContent: string, lastUpdatedAt: string, expectedAggregatedFindingsResult: string): Promise<UpdateAutomatedReasoningPolicyTestCaseResult> {
  try {
    // TODO: implement update_automated_reasoning_policy_test_case
    throw new Error("update_automated_reasoning_policy_test_case not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_automated_reasoning_policy_test_case failed");
  }
}

/** Update guardrail. */
export async function updateGuardrail(guardrailIdentifier: string, name: string, blockedInputMessaging: string, blockedOutputsMessaging: string): Promise<UpdateGuardrailResult> {
  try {
    // TODO: implement update_guardrail
    throw new Error("update_guardrail not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_guardrail failed");
  }
}

/** Update marketplace model endpoint. */
export async function updateMarketplaceModelEndpoint(endpointArn: string, endpointConfig: Record<string, unknown>): Promise<UpdateMarketplaceModelEndpointResult> {
  try {
    // TODO: implement update_marketplace_model_endpoint
    throw new Error("update_marketplace_model_endpoint not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_marketplace_model_endpoint failed");
  }
}

/** Update provisioned model throughput. */
export async function updateProvisionedModelThroughput(provisionedModelId: string): Promise<UpdateProvisionedModelThroughputResult> {
  try {
    // TODO: implement update_provisioned_model_throughput
    throw new Error("update_provisioned_model_throughput not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_provisioned_model_throughput failed");
  }
}
