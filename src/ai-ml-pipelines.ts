/**
 * aws-util/ai-ml-pipelines — Multi-service AI/ML pipeline utilities.
 *
 * Provides typed helpers for chaining Bedrock model invocations,
 * processing documents with Textract, moderating images with Rekognition,
 * translating text to multiple languages, and indexing text embeddings
 * in DynamoDB via Bedrock.
 *
 * Multi-service: Bedrock + S3 + Textract + Rekognition + Comprehend +
 * Translate + DynamoDB.
 *
 * All async functions obtain clients via {@link getClient} and wrap errors
 * through {@link wrapAwsError}.
 *
 * @example
 * ```ts
 * import {
 *   bedrockServerlessChain,
 *   s3DocumentProcessor,
 *   imageModerationPipeline,
 *   translationPipeline,
 *   embeddingIndexer,
 * } from "./ai-ml-pipelines.js";
 *
 * const chain = await bedrockServerlessChain(
 *   [{ name: "summarize", promptTemplate: "Summarize: {input}" }],
 *   "Some long text...",
 * );
 * const doc = await s3DocumentProcessor("docs-bucket", "invoice.pdf");
 * ```
 *
 * @module
 */

import { z } from "zod";
import {
  S3Client,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import {
  TextractClient,
  AnalyzeDocumentCommand,
  DetectDocumentTextCommand,
} from "@aws-sdk/client-textract";
import {
  RekognitionClient,
  DetectModerationLabelsCommand,
} from "@aws-sdk/client-rekognition";
import {
  TranslateClient,
  TranslateTextCommand,
} from "@aws-sdk/client-translate";
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  BatchWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import { getClient } from "./client.js";
import { wrapAwsError } from "./exceptions.js";

// ---------------------------------------------------------------------------
// Zod schemas & inferred types
// ---------------------------------------------------------------------------

/** Schema for a Bedrock chain result. */
export const BedrockChainResultSchema = z.object({
  steps: z.array(
    z.object({
      stepName: z.string(),
      output: z.string(),
    }),
  ),
  finalOutput: z.string(),
});

/** A Bedrock chain result. */
export type BedrockChainResult = z.infer<typeof BedrockChainResultSchema>;

/** Schema for a document processor result. */
export const DocumentProcessorResultSchema = z.object({
  bucket: z.string(),
  key: z.string(),
  text: z.string(),
  tables: z.array(z.array(z.array(z.string()))).optional(),
  formFields: z.record(z.string(), z.string()).optional(),
});

/** A document processor result. */
export type DocumentProcessorResult = z.infer<
  typeof DocumentProcessorResultSchema
>;

/** Schema for an image moderation result. */
export const ImageModerationResultSchema = z.object({
  bucket: z.string(),
  key: z.string(),
  safe: z.boolean(),
  labels: z.array(
    z.object({
      name: z.string(),
      confidence: z.number(),
    }),
  ),
  flagged: z.array(z.string()),
});

/** An image moderation result. */
export type ImageModerationResult = z.infer<
  typeof ImageModerationResultSchema
>;

/** Schema for a translation result. */
export const TranslationResultSchema = z.object({
  originalText: z.string(),
  translations: z.array(
    z.object({
      languageCode: z.string(),
      translatedText: z.string(),
    }),
  ),
});

/** A translation result. */
export type TranslationResult = z.infer<typeof TranslationResultSchema>;

/** Schema for an embedding index result. */
export const EmbeddingIndexResultSchema = z.object({
  itemsIndexed: z.number(),
  tableName: z.string(),
  dimensions: z.number(),
});

/** An embedding index result. */
export type EmbeddingIndexResult = z.infer<
  typeof EmbeddingIndexResultSchema
>;

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Invoke a Bedrock model and extract the text output.
 *
 * Supports Claude and Titan model families by detecting the model ID
 * prefix to format the request body appropriately.
 */
async function invokeBedrockModel(
  modelId: string,
  prompt: string,
  region?: string,
): Promise<string> {
  const bedrock = getClient(BedrockRuntimeClient, region);

  let body: Record<string, unknown>;

  if (modelId.startsWith("anthropic.")) {
    // Anthropic Claude models
    body = {
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    };
  } else if (modelId.startsWith("amazon.titan-embed")) {
    // Titan embedding models
    body = { inputText: prompt };
  } else if (modelId.startsWith("amazon.titan")) {
    // Titan text models
    body = {
      inputText: prompt,
      textGenerationConfig: {
        maxTokenCount: 4096,
        temperature: 0.7,
        topP: 0.9,
      },
    };
  } else {
    // Generic fallback
    body = { prompt, max_tokens: 4096 };
  }

  const encoder = new TextEncoder();
  const response = await bedrock.send(
    new InvokeModelCommand({
      modelId,
      body: encoder.encode(JSON.stringify(body)),
      contentType: "application/json",
      accept: "application/json",
    }),
  );

  const decoder = new TextDecoder();
  const raw = decoder.decode(response.body);
  const parsed = JSON.parse(raw) as Record<string, unknown>;

  // Extract output based on model family
  if (modelId.startsWith("anthropic.")) {
    const content = parsed["content"] as
      | Array<{ text?: string }>
      | undefined;
    return content?.[0]?.text ?? "";
  }
  if (modelId.startsWith("amazon.titan-embed")) {
    // Return the raw embedding as a JSON string
    return JSON.stringify(parsed["embedding"]);
  }
  if (modelId.startsWith("amazon.titan")) {
    const results = parsed["results"] as
      | Array<{ outputText?: string }>
      | undefined;
    return results?.[0]?.outputText ?? "";
  }
  // Generic fallback
  if (typeof parsed["completion"] === "string") {
    return parsed["completion"];
  }
  if (typeof parsed["generated_text"] === "string") {
    return parsed["generated_text"];
  }
  return JSON.stringify(parsed);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Chain multiple Bedrock model invocations in sequence.
 *
 * The output of step N is injected into step N+1's prompt template
 * by replacing the `{input}` placeholder. Each step may optionally
 * specify a different model ID.
 *
 * @param steps - Array of chain step descriptors.
 * @param initialInput - The initial input text for the first step.
 * @param region - Optional AWS region.
 * @returns A validated {@link BedrockChainResult}.
 *
 * @example
 * ```ts
 * const chain = await bedrockServerlessChain(
 *   [
 *     { name: "summarize", promptTemplate: "Summarize this: {input}" },
 *     { name: "translate", promptTemplate: "Translate to French: {input}" },
 *   ],
 *   "A long English article...",
 * );
 * console.log(chain.finalOutput); // French summary
 * ```
 */
export async function bedrockServerlessChain(
  steps: Array<{
    name: string;
    modelId?: string;
    promptTemplate: string;
  }>,
  initialInput: string,
  region?: string,
): Promise<BedrockChainResult> {
  try {
    const defaultModel = "anthropic.claude-3-haiku-20240307-v1:0";
    const stepResults: Array<{ stepName: string; output: string }> = [];
    let currentInput = initialInput;

    for (const step of steps) {
      const prompt = step.promptTemplate.replace(
        /\{input\}/g,
        currentInput,
      );
      const modelId = step.modelId ?? defaultModel;
      const output = await invokeBedrockModel(modelId, prompt, region);

      stepResults.push({ stepName: step.name, output });
      currentInput = output;
    }

    return BedrockChainResultSchema.parse({
      steps: stepResults,
      finalOutput: currentInput,
    });
  } catch (err) {
    throw wrapAwsError(err, "bedrockServerlessChain failed");
  }
}

/**
 * Process a document stored in S3 using Amazon Textract.
 *
 * Downloads the document reference and runs Textract analysis to extract
 * raw text, and optionally tables and form fields.
 *
 * @param bucket - The S3 bucket containing the document.
 * @param key - The S3 key of the document.
 * @param extractTables - Whether to extract tables (default false).
 * @param extractForms - Whether to extract form key-value pairs (default false).
 * @param region - Optional AWS region.
 * @returns A validated {@link DocumentProcessorResult}.
 *
 * @example
 * ```ts
 * const doc = await s3DocumentProcessor(
 *   "docs-bucket", "invoice.pdf", true, true,
 * );
 * console.log(doc.text);
 * console.log(doc.formFields); // { "Invoice #": "12345", ... }
 * ```
 */
export async function s3DocumentProcessor(
  bucket: string,
  key: string,
  extractTables?: boolean,
  extractForms?: boolean,
  region?: string,
): Promise<DocumentProcessorResult> {
  try {
    const textract = getClient(TextractClient, region);

    const featureTypes: string[] = [];
    if (extractTables) featureTypes.push("TABLES");
    if (extractForms) featureTypes.push("FORMS");

    let textBlocks: Array<{
      BlockType?: string;
      Text?: string;
      Id?: string;
      Relationships?: Array<{
        Type?: string;
        Ids?: string[];
      }>;
      EntityTypes?: string[];
      RowIndex?: number;
      ColumnIndex?: number;
    }>;

    if (featureTypes.length > 0) {
      const response = await textract.send(
        new AnalyzeDocumentCommand({
          Document: {
            S3Object: { Bucket: bucket, Name: key },
          },
          FeatureTypes: featureTypes as (
            | "TABLES"
            | "FORMS"
            | "QUERIES"
            | "SIGNATURES"
            | "LAYOUT"
          )[],
        }),
      );
      textBlocks =
        (response.Blocks as typeof textBlocks) ?? [];
    } else {
      const response = await textract.send(
        new DetectDocumentTextCommand({
          Document: {
            S3Object: { Bucket: bucket, Name: key },
          },
        }),
      );
      textBlocks =
        (response.Blocks as typeof textBlocks) ?? [];
    }

    // Extract raw text from LINE blocks
    const lines = textBlocks
      .filter((b) => b.BlockType === "LINE")
      .map((b) => b.Text ?? "");
    const text = lines.join("\n");

    // Extract tables if requested
    let tables: string[][][] | undefined;
    if (extractTables) {
      const tableBlocks = textBlocks.filter(
        (b) => b.BlockType === "TABLE",
      );
      tables = [];
      for (const table of tableBlocks) {
        const cellIds = new Set<string>();
        for (const rel of table.Relationships ?? []) {
          if (rel.Type === "CHILD") {
            for (const id of rel.Ids ?? []) {
              cellIds.add(id);
            }
          }
        }

        const cells = textBlocks.filter(
          (b) =>
            b.BlockType === "CELL" && b.Id && cellIds.has(b.Id),
        );

        // Build a 2D array from cell positions
        const rows: Record<number, Record<number, string>> = {};
        for (const cell of cells) {
          const row = cell.RowIndex ?? 0;
          const col = cell.ColumnIndex ?? 0;
          if (!rows[row]) rows[row] = {};

          // Get cell text from child WORD blocks
          const wordIds = new Set<string>();
          for (const rel of cell.Relationships ?? []) {
            if (rel.Type === "CHILD") {
              for (const id of rel.Ids ?? []) {
                wordIds.add(id);
              }
            }
          }
          const words = textBlocks
            .filter(
              (b) =>
                b.BlockType === "WORD" && b.Id && wordIds.has(b.Id),
            )
            .map((b) => b.Text ?? "");
          rows[row][col] = words.join(" ");
        }

        const tableArray: string[][] = [];
        const sortedRows = Object.keys(rows)
          .map(Number)
          .sort((a, b) => a - b);
        for (const rowIdx of sortedRows) {
          const sortedCols = Object.keys(rows[rowIdx])
            .map(Number)
            .sort((a, b) => a - b);
          tableArray.push(sortedCols.map((c) => rows[rowIdx][c]));
        }
        tables.push(tableArray);
      }
    }

    // Extract form fields if requested
    let formFields: Record<string, string> | undefined;
    if (extractForms) {
      formFields = {};
      const keyBlocks = textBlocks.filter(
        (b) =>
          b.BlockType === "KEY_VALUE_SET" &&
          b.EntityTypes?.includes("KEY"),
      );
      const blockMap = new Map(
        textBlocks
          .filter((b) => b.Id)
          .map((b) => [b.Id!, b]),
      );

      for (const keyBlock of keyBlocks) {
        // Get key text
        const keyWordIds = new Set<string>();
        for (const rel of keyBlock.Relationships ?? []) {
          if (rel.Type === "CHILD") {
            for (const id of rel.Ids ?? []) {
              keyWordIds.add(id);
            }
          }
        }
        const keyText = textBlocks
          .filter(
            (b) =>
              b.BlockType === "WORD" &&
              b.Id &&
              keyWordIds.has(b.Id),
          )
          .map((b) => b.Text ?? "")
          .join(" ");

        // Get value block
        let valueText = "";
        for (const rel of keyBlock.Relationships ?? []) {
          if (rel.Type === "VALUE") {
            for (const valId of rel.Ids ?? []) {
              const valBlock = blockMap.get(valId);
              if (valBlock) {
                const valWordIds = new Set<string>();
                for (const vRel of valBlock.Relationships ?? []) {
                  if (vRel.Type === "CHILD") {
                    for (const id of vRel.Ids ?? []) {
                      valWordIds.add(id);
                    }
                  }
                }
                valueText = textBlocks
                  .filter(
                    (b) =>
                      b.BlockType === "WORD" &&
                      b.Id &&
                      valWordIds.has(b.Id),
                  )
                  .map((b) => b.Text ?? "")
                  .join(" ");
              }
            }
          }
        }

        if (keyText) {
          formFields[keyText] = valueText;
        }
      }
    }

    return DocumentProcessorResultSchema.parse({
      bucket,
      key,
      text,
      tables,
      formFields,
    });
  } catch (err) {
    throw wrapAwsError(err, "s3DocumentProcessor failed");
  }
}

/**
 * Run an image moderation pipeline using Amazon Rekognition.
 *
 * Detects moderation labels on an image stored in S3 and flags
 * labels that meet or exceed the minimum confidence threshold.
 *
 * @param bucket - The S3 bucket containing the image.
 * @param key - The S3 key of the image.
 * @param minConfidence - Minimum confidence threshold (default 75).
 * @param blockedLabels - Optional list of label names to flag.
 * @param region - Optional AWS region.
 * @returns A validated {@link ImageModerationResult}.
 *
 * @example
 * ```ts
 * const result = await imageModerationPipeline(
 *   "images-bucket", "upload.jpg", 80, ["Violence"],
 * );
 * if (!result.safe) {
 *   console.log("Flagged:", result.flagged);
 * }
 * ```
 */
export async function imageModerationPipeline(
  bucket: string,
  key: string,
  minConfidence?: number,
  blockedLabels?: string[],
  region?: string,
): Promise<ImageModerationResult> {
  try {
    const rekognition = getClient(RekognitionClient, region);
    const confidence = minConfidence ?? 75;

    const response = await rekognition.send(
      new DetectModerationLabelsCommand({
        Image: {
          S3Object: { Bucket: bucket, Name: key },
        },
        MinConfidence: confidence,
      }),
    );

    const labels = (response.ModerationLabels ?? []).map((l) => ({
      name: l.Name ?? "Unknown",
      confidence: l.Confidence ?? 0,
    }));

    // Determine which labels are flagged
    const blockedSet = blockedLabels
      ? new Set(blockedLabels.map((l) => l.toLowerCase()))
      : null;

    const flagged: string[] = [];
    for (const label of labels) {
      if (blockedSet) {
        if (blockedSet.has(label.name.toLowerCase())) {
          flagged.push(label.name);
        }
      } else {
        // If no blocked list specified, flag all detected labels
        flagged.push(label.name);
      }
    }

    return ImageModerationResultSchema.parse({
      bucket,
      key,
      safe: flagged.length === 0,
      labels,
      flagged,
    });
  } catch (err) {
    throw wrapAwsError(err, "imageModerationPipeline failed");
  }
}

/**
 * Translate text to multiple target languages using Amazon Translate.
 *
 * Each target language is translated independently. The source language
 * defaults to `"auto"` for automatic detection.
 *
 * @param text - The source text to translate.
 * @param targetLanguages - Array of target language codes (e.g. ["fr", "de", "ja"]).
 * @param sourceLanguage - Source language code (default "auto").
 * @param region - Optional AWS region.
 * @returns A validated {@link TranslationResult}.
 *
 * @example
 * ```ts
 * const result = await translationPipeline(
 *   "Hello, world!",
 *   ["fr", "de", "ja"],
 * );
 * for (const t of result.translations) {
 *   console.log(`${t.languageCode}: ${t.translatedText}`);
 * }
 * ```
 */
export async function translationPipeline(
  text: string,
  targetLanguages: string[],
  sourceLanguage?: string,
  region?: string,
): Promise<TranslationResult> {
  try {
    const translate = getClient(TranslateClient, region);
    const source = sourceLanguage ?? "auto";

    const translations: Array<{
      languageCode: string;
      translatedText: string;
    }> = [];

    for (const targetLang of targetLanguages) {
      const response = await translate.send(
        new TranslateTextCommand({
          Text: text,
          SourceLanguageCode: source,
          TargetLanguageCode: targetLang,
        }),
      );

      translations.push({
        languageCode: targetLang,
        translatedText: response.TranslatedText ?? "",
      });
    }

    return TranslationResultSchema.parse({
      originalText: text,
      translations,
    });
  } catch (err) {
    throw wrapAwsError(err, "translationPipeline failed");
  }
}

/**
 * Generate text embeddings via Bedrock and store them in DynamoDB.
 *
 * Each item's text is embedded using the specified Bedrock model (default
 * Amazon Titan Embeddings v2). The resulting vectors are batch-written to
 * DynamoDB with the original item ID and text.
 *
 * @param items - Array of items with `id` and `text` fields.
 * @param tableName - DynamoDB table name for storing embeddings.
 * @param modelId - Bedrock embedding model ID (default "amazon.titan-embed-text-v2:0").
 * @param region - Optional AWS region.
 * @returns A validated {@link EmbeddingIndexResult}.
 *
 * @example
 * ```ts
 * const result = await embeddingIndexer(
 *   [
 *     { id: "doc-1", text: "Introduction to AWS Lambda" },
 *     { id: "doc-2", text: "DynamoDB best practices" },
 *   ],
 *   "embeddings-table",
 * );
 * console.log(result.itemsIndexed); // 2
 * ```
 */
// ---------------------------------------------------------------------------
// Extended AI/ML schemas
// ---------------------------------------------------------------------------

/** Schema for a Rekognition face indexer result. */
export const RekognitionFaceIndexerResultSchema = z.object({
  collectionId: z.string(),
  imageKey: z.string(),
  facesIndexed: z.number(),
  faceIds: z.array(z.string()),
});
/** Rekognition face indexer result. */
export type RekognitionFaceIndexerResult = z.infer<typeof RekognitionFaceIndexerResultSchema>;

/** Schema for a Rekognition video label pipeline result. */
export const RekognitionVideoLabelPipelineResultSchema = z.object({
  jobId: z.string(),
  videoKey: z.string(),
  labelsDetected: z.number(),
  status: z.string(),
});
/** Rekognition video label pipeline result. */
export type RekognitionVideoLabelPipelineResult = z.infer<typeof RekognitionVideoLabelPipelineResultSchema>;

/** Schema for a Polly audio generator result. */
export const PollyAudioGeneratorResultSchema = z.object({
  text: z.string(),
  voiceId: z.string(),
  s3Bucket: z.string(),
  s3Key: z.string(),
  audioFormat: z.string(),
});
/** Polly audio generator result. */
export type PollyAudioGeneratorResult = z.infer<typeof PollyAudioGeneratorResultSchema>;

/** Schema for a Transcribe job to S3 result. */
export const TranscribeJobToS3ResultSchema = z.object({
  jobName: z.string(),
  mediaKey: z.string(),
  transcriptKey: z.string(),
  status: z.string(),
  language: z.string(),
});
/** Transcribe job to S3 result. */
export type TranscribeJobToS3Result = z.infer<typeof TranscribeJobToS3ResultSchema>;

/** Schema for a Comprehend PII redactor result. */
export const ComprehendPiiRedactorResultSchema = z.object({
  inputKey: z.string(),
  outputKey: z.string(),
  entitiesRedacted: z.number(),
  entityTypes: z.array(z.string()),
});
/** Comprehend PII redactor result. */
export type ComprehendPiiRedactorResult = z.infer<typeof ComprehendPiiRedactorResultSchema>;

/** Schema for a Textract form extractor result. */
export const TextractFormExtractorResultSchema = z.object({
  bucket: z.string(),
  key: z.string(),
  formFields: z.record(z.string(), z.string()),
  tables: z.array(z.array(z.array(z.string()))),
  pageCount: z.number(),
});
/** Textract form extractor result. */
export type TextractFormExtractorResult = z.infer<typeof TextractFormExtractorResultSchema>;

/** Schema for a Bedrock knowledge base ingestor result. */
export const BedrockKnowledgeBaseIngestorResultSchema = z.object({
  knowledgeBaseId: z.string(),
  dataSourceId: z.string(),
  ingestionJobId: z.string(),
  documentsIngested: z.number(),
  status: z.string(),
});
/** Bedrock knowledge base ingestor result. */
export type BedrockKnowledgeBaseIngestorResult = z.infer<typeof BedrockKnowledgeBaseIngestorResultSchema>;

/** Schema for a Bedrock guardrail enforcer result. */
export const BedrockGuardrailEnforcerResultSchema = z.object({
  guardrailId: z.string(),
  inputText: z.string(),
  blocked: z.boolean(),
  violations: z.array(z.string()),
});
/** Bedrock guardrail enforcer result. */
export type BedrockGuardrailEnforcerResult = z.infer<typeof BedrockGuardrailEnforcerResultSchema>;

/** Schema for a Personalize real-time recommender result. */
export const PersonalizeRealTimeRecommenderResultSchema = z.object({
  recommenderArn: z.string(),
  userId: z.string(),
  recommendations: z.array(z.object({ itemId: z.string(); score: z.number() })),
});
/** Personalize real-time recommender result. */
export type PersonalizeRealTimeRecommenderResult = z.infer<typeof PersonalizeRealTimeRecommenderResultSchema>;

/** Schema for a Forecast inference pipeline result. */
export const ForecastInferencePipelineResultSchema = z.object({
  predictorArn: z.string(),
  forecastArn: z.string(),
  status: z.string(),
  exportJobArn: z.string().optional(),
});
/** Forecast inference pipeline result. */
export type ForecastInferencePipelineResult = z.infer<typeof ForecastInferencePipelineResultSchema>;

/** Schema for a SageMaker batch transform monitor result. */
export const SagemakerBatchTransformMonitorResultSchema = z.object({
  transformJobName: z.string(),
  status: z.string(),
  inputKey: z.string(),
  outputKey: z.string(),
  recordsProcessed: z.number().optional(),
  failureReason: z.string().optional(),
});
/** SageMaker batch transform monitor result. */
export type SagemakerBatchTransformMonitorResult = z.infer<typeof SagemakerBatchTransformMonitorResultSchema>;

// ---------------------------------------------------------------------------
// Extended AI/ML functions
// ---------------------------------------------------------------------------

/** Index faces from an S3 image into a Rekognition collection for face search. */
export async function rekognitionFaceIndexer(
  collectionId: string,
  bucket: string,
  imageKey: string,
  externalImageId?: string,
  maxFaces?: number,
  region?: string,
): Promise<RekognitionFaceIndexerResult> {
  const client = getClient(RekognitionClient, region);
  try {
    // TODO: implement rekognitionFaceIndexer
    throw new Error("rekognitionFaceIndexer not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "rekognitionFaceIndexer failed");
  }
}

/** Start a Rekognition label detection job on a video stored in S3 and store results. */
export async function rekognitionVideoLabelPipeline(
  bucket: string,
  videoKey: string,
  roleArn: string,
  minConfidence?: number,
  snsTopicArn?: string,
  region?: string,
): Promise<RekognitionVideoLabelPipelineResult> {
  const client = getClient(RekognitionClient, region);
  try {
    // TODO: implement rekognitionVideoLabelPipeline
    throw new Error("rekognitionVideoLabelPipeline not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "rekognitionVideoLabelPipeline failed");
  }
}

/** Synthesize text to speech using Amazon Polly and save the audio file to S3. */
export async function pollyAudioGenerator(
  text: string,
  voiceId: string,
  s3Bucket: string,
  s3Key: string,
  outputFormat?: "mp3" | "ogg_vorbis" | "pcm",
  engine?: "standard" | "neural",
  region?: string,
): Promise<PollyAudioGeneratorResult> {
  const client = getClient(RekognitionClient, region);
  try {
    // TODO: implement pollyAudioGenerator
    throw new Error("pollyAudioGenerator not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "pollyAudioGenerator failed");
  }
}

/** Start an Amazon Transcribe job for an audio/video file in S3 and store the transcript. */
export async function transcribeJobToS3(
  jobName: string,
  mediaBucket: string,
  mediaKey: string,
  transcriptBucket: string,
  languageCode?: string,
  region?: string,
): Promise<TranscribeJobToS3Result> {
  const client = getClient(RekognitionClient, region);
  try {
    // TODO: implement transcribeJobToS3
    throw new Error("transcribeJobToS3 not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "transcribeJobToS3 failed");
  }
}

/** Detect and redact PII entities in a text document stored in S3 using Comprehend. */
export async function comprehendPiiRedactor(
  inputBucket: string,
  inputKey: string,
  outputBucket: string,
  outputKey: string,
  piiEntityTypes?: string[],
  redactionMode?: "REPLACE_WITH_PII_ENTITY_TYPE" | "MASK",
  region?: string,
): Promise<ComprehendPiiRedactorResult> {
  const client = getClient(RekognitionClient, region);
  try {
    // TODO: implement comprehendPiiRedactor
    throw new Error("comprehendPiiRedactor not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "comprehendPiiRedactor failed");
  }
}

/** Extract structured form data and tables from a document using Amazon Textract. */
export async function textractFormExtractor(
  bucket: string,
  key: string,
  extractTables?: boolean,
  region?: string,
): Promise<TextractFormExtractorResult> {
  const client = getClient(RekognitionClient, region);
  try {
    // TODO: implement textractFormExtractor
    throw new Error("textractFormExtractor not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "textractFormExtractor failed");
  }
}

/** Ingest documents from S3 into a Bedrock Knowledge Base for RAG pipelines. */
export async function bedrockKnowledgeBaseIngestor(
  knowledgeBaseId: string,
  dataSourceId: string,
  documentBucket: string,
  documentPrefix?: string,
  region?: string,
): Promise<BedrockKnowledgeBaseIngestorResult> {
  const client = getClient(RekognitionClient, region);
  try {
    // TODO: implement bedrockKnowledgeBaseIngestor
    throw new Error("bedrockKnowledgeBaseIngestor not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "bedrockKnowledgeBaseIngestor failed");
  }
}

/** Evaluate user input against a Bedrock Guardrail and block policy violations. */
export async function bedrockGuardrailEnforcer(
  guardrailId: string,
  guardrailVersion: string,
  inputText: string,
  region?: string,
): Promise<BedrockGuardrailEnforcerResult> {
  const client = getClient(RekognitionClient, region);
  try {
    // TODO: implement bedrockGuardrailEnforcer
    throw new Error("bedrockGuardrailEnforcer not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "bedrockGuardrailEnforcer failed");
  }
}

/** Fetch real-time personalized item recommendations from a Personalize recommender. */
export async function personalizeRealTimeRecommender(
  recommenderArn: string,
  userId: string,
  numResults?: number,
  filterArn?: string,
  region?: string,
): Promise<PersonalizeRealTimeRecommenderResult> {
  const client = getClient(RekognitionClient, region);
  try {
    // TODO: implement personalizeRealTimeRecommender
    throw new Error("personalizeRealTimeRecommender not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "personalizeRealTimeRecommender failed");
  }
}

/** Create a Forecast predictor, generate forecasts, and export to S3. */
export async function forecastInferencePipeline(
  datasetGroupArn: string,
  predictorName: string,
  forecastHorizon: number,
  forecastFrequency: string,
  exportBucket: string,
  region?: string,
): Promise<ForecastInferencePipelineResult> {
  const client = getClient(RekognitionClient, region);
  try {
    // TODO: implement forecastInferencePipeline
    throw new Error("forecastInferencePipeline not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "forecastInferencePipeline failed");
  }
}

/** Monitor a SageMaker batch transform job to completion and report metrics. */
export async function sagemakerBatchTransformMonitor(
  transformJobName: string,
  pollIntervalSeconds?: number,
  timeoutSeconds?: number,
  region?: string,
): Promise<SagemakerBatchTransformMonitorResult> {
  const client = getClient(RekognitionClient, region);
  try {
    // TODO: implement sagemakerBatchTransformMonitor
    throw new Error("sagemakerBatchTransformMonitor not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "sagemakerBatchTransformMonitor failed");
  }
}

export async function embeddingIndexer(
  items: Array<{ id: string; text: string }>,
  tableName: string,
  modelId?: string,
  region?: string,
): Promise<EmbeddingIndexResult> {
  try {
    const model = modelId ?? "amazon.titan-embed-text-v2:0";
    const rawDdb = getClient(DynamoDBClient, region);
    const ddb = DynamoDBDocumentClient.from(rawDdb);

    let dimensions = 0;
    const batchSize = 25;
    const allItems: Array<Record<string, unknown>> = [];

    for (const item of items) {
      const embeddingJson = await invokeBedrockModel(
        model,
        item.text,
        region,
      );
      const embedding = JSON.parse(embeddingJson) as number[];
      if (embedding.length > 0) {
        dimensions = embedding.length;
      }

      allItems.push({
        id: item.id,
        text: item.text,
        embedding,
        indexedAt: new Date().toISOString(),
      });
    }

    // Batch write to DynamoDB
    for (let i = 0; i < allItems.length; i += batchSize) {
      const batch = allItems.slice(i, i + batchSize);
      const requests = batch.map((item) => ({
        PutRequest: { Item: item },
      }));

      await ddb.send(
        new BatchWriteCommand({
          RequestItems: { [tableName]: requests },
        }),
      );
    }

    return EmbeddingIndexResultSchema.parse({
      itemsIndexed: allItems.length,
      tableName,
      dimensions,
    });
  } catch (err) {
    throw wrapAwsError(err, "embeddingIndexer failed");
  }
}
