/**
 * aws-util/comprehend — High-level Amazon Comprehend utilities.
 *
 * Provides typed helpers for sentiment analysis, entity detection, key phrase
 * extraction, PII detection and redaction, language detection, and batch
 * sentiment analysis.
 *
 * @example
 * ```ts
 * import { detectSentiment, analyzeText, redactPii } from "./comprehend.js";
 *
 * const sentiment = await detectSentiment("This product is amazing!");
 * const redacted = await redactPii("My SSN is 123-45-6789");
 * ```
 *
 * @module
 */

import { z } from "zod";
import {
  ComprehendClient,
  DetectSentimentCommand,
  DetectEntitiesCommand,
  DetectKeyPhrasesCommand,
  DetectPiiEntitiesCommand,
  DetectDominantLanguageCommand,
  BatchDetectSentimentCommand,
} from "@aws-sdk/client-comprehend";
import { getClient } from "./client.js";
import {
  wrapAwsError,
  AwsServiceError,
} from "./exceptions.js";

// ---------------------------------------------------------------------------
// Zod schemas
// ---------------------------------------------------------------------------

/** Schema for sentiment analysis result. */
export const SentimentResultSchema = z.object({
  sentiment: z.string(),
  sentimentScore: z.object({
    positive: z.number(),
    negative: z.number(),
    neutral: z.number(),
    mixed: z.number(),
  }),
});

/** Sentiment analysis result. */
export type SentimentResult = z.infer<typeof SentimentResultSchema>;

/** Schema for a named entity detected in text. */
export const EntityResultSchema = z.object({
  text: z.string(),
  type: z.string(),
  score: z.number(),
  beginOffset: z.number().optional(),
  endOffset: z.number().optional(),
});

/** A named entity detected in text. */
export type EntityResult = z.infer<typeof EntityResultSchema>;

/** Schema for a key phrase detected in text. */
export const KeyPhraseSchema = z.object({
  text: z.string(),
  score: z.number(),
  beginOffset: z.number().optional(),
  endOffset: z.number().optional(),
});

/** A key phrase detected in text. */
export type KeyPhrase = z.infer<typeof KeyPhraseSchema>;

/** Schema for a PII entity detected in text. */
export const PiiEntitySchema = z.object({
  type: z.string(),
  score: z.number(),
  beginOffset: z.number(),
  endOffset: z.number(),
});

/** A PII entity detected in text. */
export type PiiEntity = z.infer<typeof PiiEntitySchema>;

/** Schema for a detected language. */
export const LanguageResultSchema = z.object({
  languageCode: z.string(),
  score: z.number(),
});

/** A detected language. */
export type LanguageResult = z.infer<typeof LanguageResultSchema>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Get a cached ComprehendClient for the given region.
 */
function comprehend(region?: string): ComprehendClient {
  return getClient(ComprehendClient, region);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Detect the overall sentiment of a text string.
 *
 * @param text - Input text (UTF-8, up to 5,000 bytes per call).
 * @param languageCode - BCP-47 language code, e.g. `"en"`, `"es"` (default `"en"`).
 * @param region - AWS region override.
 * @returns A {@link SentimentResult} with sentiment label and confidence scores.
 */
export async function detectSentiment(
  text: string,
  languageCode: string = "en",
  region?: string,
): Promise<SentimentResult> {
  try {
    const resp = await comprehend(region).send(
      new DetectSentimentCommand({
        Text: text,
        LanguageCode: languageCode,
      }),
    );

    const scores = resp.SentimentScore ?? {};
    return SentimentResultSchema.parse({
      sentiment: resp.Sentiment ?? "NEUTRAL",
      sentimentScore: {
        positive: scores.Positive ?? 0,
        negative: scores.Negative ?? 0,
        neutral: scores.Neutral ?? 0,
        mixed: scores.Mixed ?? 0,
      },
    });
  } catch (err: unknown) {
    throw wrapAwsError(err, "detectSentiment");
  }
}

/**
 * Detect named entities (people, places, organisations, dates, etc.) in text.
 *
 * @param text - Input text (up to 5,000 bytes).
 * @param languageCode - BCP-47 language code (default `"en"`).
 * @param region - AWS region override.
 * @returns A list of {@link EntityResult} objects.
 */
export async function detectEntities(
  text: string,
  languageCode: string = "en",
  region?: string,
): Promise<EntityResult[]> {
  try {
    const resp = await comprehend(region).send(
      new DetectEntitiesCommand({
        Text: text,
        LanguageCode: languageCode,
      }),
    );

    return (resp.Entities ?? []).map((e) =>
      EntityResultSchema.parse({
        text: e.Text ?? "",
        type: e.Type ?? "",
        score: e.Score ?? 0,
        beginOffset: e.BeginOffset,
        endOffset: e.EndOffset,
      }),
    );
  } catch (err: unknown) {
    throw wrapAwsError(err, "detectEntities");
  }
}

/**
 * Extract key noun phrases from text.
 *
 * @param text - Input text (up to 5,000 bytes).
 * @param languageCode - BCP-47 language code (default `"en"`).
 * @param region - AWS region override.
 * @returns A list of {@link KeyPhrase} objects.
 */
export async function detectKeyPhrases(
  text: string,
  languageCode: string = "en",
  region?: string,
): Promise<KeyPhrase[]> {
  try {
    const resp = await comprehend(region).send(
      new DetectKeyPhrasesCommand({
        Text: text,
        LanguageCode: languageCode,
      }),
    );

    return (resp.KeyPhrases ?? []).map((kp) =>
      KeyPhraseSchema.parse({
        text: kp.Text ?? "",
        score: kp.Score ?? 0,
        beginOffset: kp.BeginOffset,
        endOffset: kp.EndOffset,
      }),
    );
  } catch (err: unknown) {
    throw wrapAwsError(err, "detectKeyPhrases");
  }
}

/**
 * Detect personally identifiable information (PII) entities in text.
 *
 * @param text - Input text (up to 5,000 bytes).
 * @param languageCode - BCP-47 language code (default `"en"`).
 * @param region - AWS region override.
 * @returns A list of {@link PiiEntity} objects.
 */
export async function detectPiiEntities(
  text: string,
  languageCode: string = "en",
  region?: string,
): Promise<PiiEntity[]> {
  try {
    const resp = await comprehend(region).send(
      new DetectPiiEntitiesCommand({
        Text: text,
        LanguageCode: languageCode,
      }),
    );

    return (resp.Entities ?? []).map((e) =>
      PiiEntitySchema.parse({
        type: e.Type ?? "",
        score: e.Score ?? 0,
        beginOffset: e.BeginOffset ?? 0,
        endOffset: e.EndOffset ?? 0,
      }),
    );
  } catch (err: unknown) {
    throw wrapAwsError(err, "detectPiiEntities");
  }
}

/**
 * Detect the dominant language(s) of a text string.
 *
 * @param text - Input text (up to 5,000 bytes).
 * @param region - AWS region override.
 * @returns A list of {@link LanguageResult} objects sorted by score.
 */
export async function detectDominantLanguage(
  text: string,
  region?: string,
): Promise<LanguageResult[]> {
  try {
    const resp = await comprehend(region).send(
      new DetectDominantLanguageCommand({ Text: text }),
    );

    const languages = (resp.Languages ?? []).map((lang) =>
      LanguageResultSchema.parse({
        languageCode: lang.LanguageCode ?? "",
        score: lang.Score ?? 0,
      }),
    );

    return languages.sort((a, b) => b.score - a.score);
  } catch (err: unknown) {
    throw wrapAwsError(err, "detectDominantLanguage");
  }
}

/**
 * Run all Comprehend analyses on a text string concurrently.
 *
 * Executes sentiment, entity, key phrase, and PII detection in parallel
 * using `Promise.all`, then merges the results.
 *
 * @param text - Input text (up to 5,000 bytes).
 * @param languageCode - BCP-47 language code (default `"en"`).
 * @param region - AWS region override.
 * @returns An object with `sentiment`, `entities`, `keyPhrases`, and `piiEntities`.
 */
export async function analyzeText(
  text: string,
  languageCode: string = "en",
  region?: string,
): Promise<{
  sentiment: SentimentResult;
  entities: EntityResult[];
  keyPhrases: KeyPhrase[];
  piiEntities: PiiEntity[];
}> {
  const [sentiment, entities, keyPhrases, piiEntities] =
    await Promise.all([
      detectSentiment(text, languageCode, region),
      detectEntities(text, languageCode, region),
      detectKeyPhrases(text, languageCode, region),
      detectPiiEntities(text, languageCode, region),
    ]);

  return { sentiment, entities, keyPhrases, piiEntities };
}

/**
 * Detect and redact PII entities from text.
 *
 * Calls {@link detectPiiEntities} and replaces each detected span with
 * a replacement string, working backwards to preserve offsets.
 *
 * @param text - Input text (up to 5,000 bytes).
 * @param piiTypes - Optional list of PII types to redact. When omitted all
 *   detected PII types are redacted.
 * @param replacement - String to substitute for each PII span (default
 *   `"[REDACTED]"`).
 * @param languageCode - BCP-47 language code (default `"en"`).
 * @param region - AWS region override.
 * @returns The text with all PII spans replaced.
 */
export async function redactPii(
  text: string,
  piiTypes?: string[],
  replacement: string = "[REDACTED]",
  languageCode: string = "en",
  region?: string,
): Promise<string> {
  let entities = await detectPiiEntities(
    text,
    languageCode,
    region,
  );

  // Filter to requested PII types if specified
  if (piiTypes && piiTypes.length > 0) {
    const typeSet = new Set(piiTypes);
    entities = entities.filter((e) => typeSet.has(e.type));
  }

  // Process from end to start so offsets remain valid
  const sorted = [...entities].sort(
    (a, b) => b.beginOffset - a.beginOffset,
  );
  let result = text;
  for (const entity of sorted) {
    result =
      result.slice(0, entity.beginOffset) +
      replacement +
      result.slice(entity.endOffset);
  }
  return result;
}

/**
 * Detect sentiment for a batch of text strings.
 *
 * Comprehend supports up to 25 texts per batch call. Inputs exceeding 25
 * are automatically chunked.
 *
 * @param texts - List of input texts (each up to 5,000 bytes).
 * @param languageCode - BCP-47 language code applied to all texts (default `"en"`).
 * @param region - AWS region override.
 * @returns A list of {@link SentimentResult} objects in the same order as `texts`.
 */
export async function batchDetectSentiment(
  texts: string[],
  languageCode: string = "en",
  region?: string,
): Promise<SentimentResult[]> {
  if (texts.length === 0) return [];

  const allResults: SentimentResult[] = [];

  // Chunk into groups of 25 (Comprehend batch limit)
  for (let i = 0; i < texts.length; i += 25) {
    const chunk = texts.slice(i, i + 25);
    try {
      const resp = await comprehend(region).send(
        new BatchDetectSentimentCommand({
          TextList: chunk,
          LanguageCode: languageCode,
        }),
      );

      if (resp.ErrorList && resp.ErrorList.length > 0) {
        const errors = resp.ErrorList.map(
          (e) => `index=${e.Index}: ${e.ErrorCode}`,
        ).join(", ");
        throw new AwsServiceError(
          `batchDetectSentiment had errors: ${errors}`,
        );
      }

      const sorted = [...(resp.ResultList ?? [])].sort(
        (a, b) => (a.Index ?? 0) - (b.Index ?? 0),
      );

      for (const r of sorted) {
        const scores = r.SentimentScore ?? {};
        allResults.push(
          SentimentResultSchema.parse({
            sentiment: r.Sentiment ?? "NEUTRAL",
            sentimentScore: {
              positive: scores.Positive ?? 0,
              negative: scores.Negative ?? 0,
              neutral: scores.Neutral ?? 0,
              mixed: scores.Mixed ?? 0,
            },
          }),
        );
      }
    } catch (err: unknown) {
      throw wrapAwsError(err, "batchDetectSentiment");
    }
  }

  return allResults;
}

// ---------------------------------------------------------------------------
// Additional types (auto-generated)
// ---------------------------------------------------------------------------

/** Result of batch_detect_dominant_language. */
export type BatchDetectDominantLanguageResult = {
  resultList?: Record<string, unknown>[];
  errorList?: Record<string, unknown>[];
};

/** Result of batch_detect_entities. */
export type BatchDetectEntitiesResult = {
  resultList?: Record<string, unknown>[];
  errorList?: Record<string, unknown>[];
};

/** Result of batch_detect_key_phrases. */
export type BatchDetectKeyPhrasesResult = {
  resultList?: Record<string, unknown>[];
  errorList?: Record<string, unknown>[];
};

/** Result of batch_detect_syntax. */
export type BatchDetectSyntaxResult = {
  resultList?: Record<string, unknown>[];
  errorList?: Record<string, unknown>[];
};

/** Result of batch_detect_targeted_sentiment. */
export type BatchDetectTargetedSentimentResult = {
  resultList?: Record<string, unknown>[];
  errorList?: Record<string, unknown>[];
};

/** Result of classify_document. */
export type ClassifyDocumentResult = {
  classes?: Record<string, unknown>[];
  labels?: Record<string, unknown>[];
  documentMetadata?: Record<string, unknown>;
  documentType?: Record<string, unknown>[];
  errors?: Record<string, unknown>[];
  warnings?: Record<string, unknown>[];
};

/** Result of contains_pii_entities. */
export type ContainsPiiEntitiesResult = {
  labels?: Record<string, unknown>[];
};

/** Result of create_dataset. */
export type CreateDatasetResult = {
  datasetArn?: string | undefined;
};

/** Result of create_document_classifier. */
export type CreateDocumentClassifierResult = {
  documentClassifierArn?: string | undefined;
};

/** Result of create_endpoint. */
export type CreateEndpointResult = {
  endpointArn?: string | undefined;
  modelArn?: string | undefined;
};

/** Result of create_entity_recognizer. */
export type CreateEntityRecognizerResult = {
  entityRecognizerArn?: string | undefined;
};

/** Result of create_flywheel. */
export type CreateFlywheelResult = {
  flywheelArn?: string | undefined;
  activeModelArn?: string | undefined;
};

/** Result of describe_dataset. */
export type DescribeDatasetResult = {
  datasetProperties?: Record<string, unknown>;
};

/** Result of describe_document_classification_job. */
export type DescribeDocumentClassificationJobResult = {
  documentClassificationJobProperties?: Record<string, unknown>;
};

/** Result of describe_document_classifier. */
export type DescribeDocumentClassifierResult = {
  documentClassifierProperties?: Record<string, unknown>;
};

/** Result of describe_dominant_language_detection_job. */
export type DescribeDominantLanguageDetectionJobResult = {
  dominantLanguageDetectionJobProperties?: Record<string, unknown>;
};

/** Result of describe_endpoint. */
export type DescribeEndpointResult = {
  endpointProperties?: Record<string, unknown>;
};

/** Result of describe_entities_detection_job. */
export type DescribeEntitiesDetectionJobResult = {
  entitiesDetectionJobProperties?: Record<string, unknown>;
};

/** Result of describe_entity_recognizer. */
export type DescribeEntityRecognizerResult = {
  entityRecognizerProperties?: Record<string, unknown>;
};

/** Result of describe_events_detection_job. */
export type DescribeEventsDetectionJobResult = {
  eventsDetectionJobProperties?: Record<string, unknown>;
};

/** Result of describe_flywheel. */
export type DescribeFlywheelResult = {
  flywheelProperties?: Record<string, unknown>;
};

/** Result of describe_flywheel_iteration. */
export type DescribeFlywheelIterationResult = {
  flywheelIterationProperties?: Record<string, unknown>;
};

/** Result of describe_key_phrases_detection_job. */
export type DescribeKeyPhrasesDetectionJobResult = {
  keyPhrasesDetectionJobProperties?: Record<string, unknown>;
};

/** Result of describe_pii_entities_detection_job. */
export type DescribePiiEntitiesDetectionJobResult = {
  piiEntitiesDetectionJobProperties?: Record<string, unknown>;
};

/** Result of describe_resource_policy. */
export type DescribeResourcePolicyResult = {
  resourcePolicy?: string | undefined;
  creationTime?: string | undefined;
  lastModifiedTime?: string | undefined;
  policyRevisionId?: string | undefined;
};

/** Result of describe_sentiment_detection_job. */
export type DescribeSentimentDetectionJobResult = {
  sentimentDetectionJobProperties?: Record<string, unknown>;
};

/** Result of describe_targeted_sentiment_detection_job. */
export type DescribeTargetedSentimentDetectionJobResult = {
  targetedSentimentDetectionJobProperties?: Record<string, unknown>;
};

/** Result of describe_topics_detection_job. */
export type DescribeTopicsDetectionJobResult = {
  topicsDetectionJobProperties?: Record<string, unknown>;
};

/** Result of detect_syntax. */
export type DetectSyntaxResult = {
  syntaxTokens?: Record<string, unknown>[];
};

/** Result of detect_targeted_sentiment. */
export type DetectTargetedSentimentResult = {
  entities?: Record<string, unknown>[];
};

/** Result of detect_toxic_content. */
export type DetectToxicContentResult = {
  resultList?: Record<string, unknown>[];
};

/** Result of import_model. */
export type ImportModelResult = {
  modelArn?: string | undefined;
};

/** Result of list_datasets. */
export type ListDatasetsResult = {
  datasetPropertiesList?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_document_classification_jobs. */
export type ListDocumentClassificationJobsResult = {
  documentClassificationJobPropertiesList?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_document_classifier_summaries. */
export type ListDocumentClassifierSummariesResult = {
  documentClassifierSummariesList?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_document_classifiers. */
export type ListDocumentClassifiersResult = {
  documentClassifierPropertiesList?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_dominant_language_detection_jobs. */
export type ListDominantLanguageDetectionJobsResult = {
  dominantLanguageDetectionJobPropertiesList?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_endpoints. */
export type ListEndpointsResult = {
  endpointPropertiesList?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_entities_detection_jobs. */
export type ListEntitiesDetectionJobsResult = {
  entitiesDetectionJobPropertiesList?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_entity_recognizer_summaries. */
export type ListEntityRecognizerSummariesResult = {
  entityRecognizerSummariesList?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_entity_recognizers. */
export type ListEntityRecognizersResult = {
  entityRecognizerPropertiesList?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_events_detection_jobs. */
export type ListEventsDetectionJobsResult = {
  eventsDetectionJobPropertiesList?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_flywheel_iteration_history. */
export type ListFlywheelIterationHistoryResult = {
  flywheelIterationPropertiesList?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_flywheels. */
export type ListFlywheelsResult = {
  flywheelSummaryList?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_key_phrases_detection_jobs. */
export type ListKeyPhrasesDetectionJobsResult = {
  keyPhrasesDetectionJobPropertiesList?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_pii_entities_detection_jobs. */
export type ListPiiEntitiesDetectionJobsResult = {
  piiEntitiesDetectionJobPropertiesList?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_sentiment_detection_jobs. */
export type ListSentimentDetectionJobsResult = {
  sentimentDetectionJobPropertiesList?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_tags_for_resource. */
export type ListTagsForResourceResult = {
  resourceArn?: string | undefined;
  tags?: Record<string, unknown>[];
};

/** Result of list_targeted_sentiment_detection_jobs. */
export type ListTargetedSentimentDetectionJobsResult = {
  targetedSentimentDetectionJobPropertiesList?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_topics_detection_jobs. */
export type ListTopicsDetectionJobsResult = {
  topicsDetectionJobPropertiesList?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of put_resource_policy. */
export type PutResourcePolicyResult = {
  policyRevisionId?: string | undefined;
};

/** Result of start_document_classification_job. */
export type StartDocumentClassificationJobResult = {
  jobId?: string | undefined;
  jobArn?: string | undefined;
  jobStatus?: string | undefined;
  documentClassifierArn?: string | undefined;
};

/** Result of start_dominant_language_detection_job. */
export type StartDominantLanguageDetectionJobResult = {
  jobId?: string | undefined;
  jobArn?: string | undefined;
  jobStatus?: string | undefined;
};

/** Result of start_entities_detection_job. */
export type StartEntitiesDetectionJobResult = {
  jobId?: string | undefined;
  jobArn?: string | undefined;
  jobStatus?: string | undefined;
  entityRecognizerArn?: string | undefined;
};

/** Result of start_events_detection_job. */
export type StartEventsDetectionJobResult = {
  jobId?: string | undefined;
  jobArn?: string | undefined;
  jobStatus?: string | undefined;
};

/** Result of start_flywheel_iteration. */
export type StartFlywheelIterationResult = {
  flywheelArn?: string | undefined;
  flywheelIterationId?: string | undefined;
};

/** Result of start_key_phrases_detection_job. */
export type StartKeyPhrasesDetectionJobResult = {
  jobId?: string | undefined;
  jobArn?: string | undefined;
  jobStatus?: string | undefined;
};

/** Result of start_pii_entities_detection_job. */
export type StartPiiEntitiesDetectionJobResult = {
  jobId?: string | undefined;
  jobArn?: string | undefined;
  jobStatus?: string | undefined;
};

/** Result of start_sentiment_detection_job. */
export type StartSentimentDetectionJobResult = {
  jobId?: string | undefined;
  jobArn?: string | undefined;
  jobStatus?: string | undefined;
};

/** Result of start_targeted_sentiment_detection_job. */
export type StartTargetedSentimentDetectionJobResult = {
  jobId?: string | undefined;
  jobArn?: string | undefined;
  jobStatus?: string | undefined;
};

/** Result of start_topics_detection_job. */
export type StartTopicsDetectionJobResult = {
  jobId?: string | undefined;
  jobArn?: string | undefined;
  jobStatus?: string | undefined;
};

/** Result of stop_dominant_language_detection_job. */
export type StopDominantLanguageDetectionJobResult = {
  jobId?: string | undefined;
  jobStatus?: string | undefined;
};

/** Result of stop_entities_detection_job. */
export type StopEntitiesDetectionJobResult = {
  jobId?: string | undefined;
  jobStatus?: string | undefined;
};

/** Result of stop_events_detection_job. */
export type StopEventsDetectionJobResult = {
  jobId?: string | undefined;
  jobStatus?: string | undefined;
};

/** Result of stop_key_phrases_detection_job. */
export type StopKeyPhrasesDetectionJobResult = {
  jobId?: string | undefined;
  jobStatus?: string | undefined;
};

/** Result of stop_pii_entities_detection_job. */
export type StopPiiEntitiesDetectionJobResult = {
  jobId?: string | undefined;
  jobStatus?: string | undefined;
};

/** Result of stop_sentiment_detection_job. */
export type StopSentimentDetectionJobResult = {
  jobId?: string | undefined;
  jobStatus?: string | undefined;
};

/** Result of stop_targeted_sentiment_detection_job. */
export type StopTargetedSentimentDetectionJobResult = {
  jobId?: string | undefined;
  jobStatus?: string | undefined;
};

/** Result of update_endpoint. */
export type UpdateEndpointResult = {
  desiredModelArn?: string | undefined;
};

/** Result of update_flywheel. */
export type UpdateFlywheelResult = {
  flywheelProperties?: Record<string, unknown>;
};


// ---------------------------------------------------------------------------
// Additional functions (auto-generated)
// ---------------------------------------------------------------------------

/** Batch detect dominant language. */
export async function batchDetectDominantLanguage(textList: string[], regionName?: string | undefined): Promise<BatchDetectDominantLanguageResult> {
  try {
    // TODO: implement batch_detect_dominant_language
    throw new Error("batch_detect_dominant_language not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_detect_dominant_language failed");
  }
}

/** Batch detect entities. */
export async function batchDetectEntities(textList: string[], languageCode: string, regionName?: string | undefined): Promise<BatchDetectEntitiesResult> {
  try {
    // TODO: implement batch_detect_entities
    throw new Error("batch_detect_entities not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_detect_entities failed");
  }
}

/** Batch detect key phrases. */
export async function batchDetectKeyPhrases(textList: string[], languageCode: string, regionName?: string | undefined): Promise<BatchDetectKeyPhrasesResult> {
  try {
    // TODO: implement batch_detect_key_phrases
    throw new Error("batch_detect_key_phrases not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_detect_key_phrases failed");
  }
}

/** Batch detect syntax. */
export async function batchDetectSyntax(textList: string[], languageCode: string, regionName?: string | undefined): Promise<BatchDetectSyntaxResult> {
  try {
    // TODO: implement batch_detect_syntax
    throw new Error("batch_detect_syntax not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_detect_syntax failed");
  }
}

/** Batch detect targeted sentiment. */
export async function batchDetectTargetedSentiment(textList: string[], languageCode: string, regionName?: string | undefined): Promise<BatchDetectTargetedSentimentResult> {
  try {
    // TODO: implement batch_detect_targeted_sentiment
    throw new Error("batch_detect_targeted_sentiment not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_detect_targeted_sentiment failed");
  }
}

/** Classify document. */
export async function classifyDocument(endpointArn: string): Promise<ClassifyDocumentResult> {
  try {
    // TODO: implement classify_document
    throw new Error("classify_document not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "classify_document failed");
  }
}

/** Contains pii entities. */
export async function containsPiiEntities(text: string, languageCode: string, regionName?: string | undefined): Promise<ContainsPiiEntitiesResult> {
  try {
    // TODO: implement contains_pii_entities
    throw new Error("contains_pii_entities not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "contains_pii_entities failed");
  }
}

/** Create dataset. */
export async function createDataset(flywheelArn: string, datasetName: string, inputDataConfig: Record<string, unknown>): Promise<CreateDatasetResult> {
  try {
    // TODO: implement create_dataset
    throw new Error("create_dataset not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_dataset failed");
  }
}

/** Create document classifier. */
export async function createDocumentClassifier(documentClassifierName: string, dataAccessRoleArn: string, inputDataConfig: Record<string, unknown>, languageCode: string): Promise<CreateDocumentClassifierResult> {
  try {
    // TODO: implement create_document_classifier
    throw new Error("create_document_classifier not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_document_classifier failed");
  }
}

/** Create endpoint. */
export async function createEndpoint(endpointName: string, desiredInferenceUnits: number): Promise<CreateEndpointResult> {
  try {
    // TODO: implement create_endpoint
    throw new Error("create_endpoint not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_endpoint failed");
  }
}

/** Create entity recognizer. */
export async function createEntityRecognizer(recognizerName: string, dataAccessRoleArn: string, inputDataConfig: Record<string, unknown>, languageCode: string): Promise<CreateEntityRecognizerResult> {
  try {
    // TODO: implement create_entity_recognizer
    throw new Error("create_entity_recognizer not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_entity_recognizer failed");
  }
}

/** Create flywheel. */
export async function createFlywheel(flywheelName: string, dataAccessRoleArn: string, dataLakeS3Uri: string): Promise<CreateFlywheelResult> {
  try {
    // TODO: implement create_flywheel
    throw new Error("create_flywheel not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_flywheel failed");
  }
}

/** Delete document classifier. */
export async function deleteDocumentClassifier(documentClassifierArn: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_document_classifier
    throw new Error("delete_document_classifier not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_document_classifier failed");
  }
}

/** Delete endpoint. */
export async function deleteEndpoint(endpointArn: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_endpoint
    throw new Error("delete_endpoint not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_endpoint failed");
  }
}

/** Delete entity recognizer. */
export async function deleteEntityRecognizer(entityRecognizerArn: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_entity_recognizer
    throw new Error("delete_entity_recognizer not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_entity_recognizer failed");
  }
}

/** Delete flywheel. */
export async function deleteFlywheel(flywheelArn: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_flywheel
    throw new Error("delete_flywheel not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_flywheel failed");
  }
}

/** Delete resource policy. */
export async function deleteResourcePolicy(resourceArn: string): Promise<void> {
  try {
    // TODO: implement delete_resource_policy
    throw new Error("delete_resource_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_resource_policy failed");
  }
}

/** Describe dataset. */
export async function describeDataset(datasetArn: string, regionName?: string | undefined): Promise<DescribeDatasetResult> {
  try {
    // TODO: implement describe_dataset
    throw new Error("describe_dataset not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_dataset failed");
  }
}

/** Describe document classification job. */
export async function describeDocumentClassificationJob(jobId: string, regionName?: string | undefined): Promise<DescribeDocumentClassificationJobResult> {
  try {
    // TODO: implement describe_document_classification_job
    throw new Error("describe_document_classification_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_document_classification_job failed");
  }
}

/** Describe document classifier. */
export async function describeDocumentClassifier(documentClassifierArn: string, regionName?: string | undefined): Promise<DescribeDocumentClassifierResult> {
  try {
    // TODO: implement describe_document_classifier
    throw new Error("describe_document_classifier not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_document_classifier failed");
  }
}

/** Describe dominant language detection job. */
export async function describeDominantLanguageDetectionJob(jobId: string, regionName?: string | undefined): Promise<DescribeDominantLanguageDetectionJobResult> {
  try {
    // TODO: implement describe_dominant_language_detection_job
    throw new Error("describe_dominant_language_detection_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_dominant_language_detection_job failed");
  }
}

/** Describe endpoint. */
export async function describeEndpoint(endpointArn: string, regionName?: string | undefined): Promise<DescribeEndpointResult> {
  try {
    // TODO: implement describe_endpoint
    throw new Error("describe_endpoint not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_endpoint failed");
  }
}

/** Describe entities detection job. */
export async function describeEntitiesDetectionJob(jobId: string, regionName?: string | undefined): Promise<DescribeEntitiesDetectionJobResult> {
  try {
    // TODO: implement describe_entities_detection_job
    throw new Error("describe_entities_detection_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_entities_detection_job failed");
  }
}

/** Describe entity recognizer. */
export async function describeEntityRecognizer(entityRecognizerArn: string, regionName?: string | undefined): Promise<DescribeEntityRecognizerResult> {
  try {
    // TODO: implement describe_entity_recognizer
    throw new Error("describe_entity_recognizer not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_entity_recognizer failed");
  }
}

/** Describe events detection job. */
export async function describeEventsDetectionJob(jobId: string, regionName?: string | undefined): Promise<DescribeEventsDetectionJobResult> {
  try {
    // TODO: implement describe_events_detection_job
    throw new Error("describe_events_detection_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_events_detection_job failed");
  }
}

/** Describe flywheel. */
export async function describeFlywheel(flywheelArn: string, regionName?: string | undefined): Promise<DescribeFlywheelResult> {
  try {
    // TODO: implement describe_flywheel
    throw new Error("describe_flywheel not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_flywheel failed");
  }
}

/** Describe flywheel iteration. */
export async function describeFlywheelIteration(flywheelArn: string, flywheelIterationId: string, regionName?: string | undefined): Promise<DescribeFlywheelIterationResult> {
  try {
    // TODO: implement describe_flywheel_iteration
    throw new Error("describe_flywheel_iteration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_flywheel_iteration failed");
  }
}

/** Describe key phrases detection job. */
export async function describeKeyPhrasesDetectionJob(jobId: string, regionName?: string | undefined): Promise<DescribeKeyPhrasesDetectionJobResult> {
  try {
    // TODO: implement describe_key_phrases_detection_job
    throw new Error("describe_key_phrases_detection_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_key_phrases_detection_job failed");
  }
}

/** Describe pii entities detection job. */
export async function describePiiEntitiesDetectionJob(jobId: string, regionName?: string | undefined): Promise<DescribePiiEntitiesDetectionJobResult> {
  try {
    // TODO: implement describe_pii_entities_detection_job
    throw new Error("describe_pii_entities_detection_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_pii_entities_detection_job failed");
  }
}

/** Describe resource policy. */
export async function describeResourcePolicy(resourceArn: string, regionName?: string | undefined): Promise<DescribeResourcePolicyResult> {
  try {
    // TODO: implement describe_resource_policy
    throw new Error("describe_resource_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_resource_policy failed");
  }
}

/** Describe sentiment detection job. */
export async function describeSentimentDetectionJob(jobId: string, regionName?: string | undefined): Promise<DescribeSentimentDetectionJobResult> {
  try {
    // TODO: implement describe_sentiment_detection_job
    throw new Error("describe_sentiment_detection_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_sentiment_detection_job failed");
  }
}

/** Describe targeted sentiment detection job. */
export async function describeTargetedSentimentDetectionJob(jobId: string, regionName?: string | undefined): Promise<DescribeTargetedSentimentDetectionJobResult> {
  try {
    // TODO: implement describe_targeted_sentiment_detection_job
    throw new Error("describe_targeted_sentiment_detection_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_targeted_sentiment_detection_job failed");
  }
}

/** Describe topics detection job. */
export async function describeTopicsDetectionJob(jobId: string, regionName?: string | undefined): Promise<DescribeTopicsDetectionJobResult> {
  try {
    // TODO: implement describe_topics_detection_job
    throw new Error("describe_topics_detection_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_topics_detection_job failed");
  }
}

/** Detect syntax. */
export async function detectSyntax(text: string, languageCode: string, regionName?: string | undefined): Promise<DetectSyntaxResult> {
  try {
    // TODO: implement detect_syntax
    throw new Error("detect_syntax not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "detect_syntax failed");
  }
}

/** Detect targeted sentiment. */
export async function detectTargetedSentiment(text: string, languageCode: string, regionName?: string | undefined): Promise<DetectTargetedSentimentResult> {
  try {
    // TODO: implement detect_targeted_sentiment
    throw new Error("detect_targeted_sentiment not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "detect_targeted_sentiment failed");
  }
}

/** Detect toxic content. */
export async function detectToxicContent(textSegments: Record<string, unknown>[], languageCode: string, regionName?: string | undefined): Promise<DetectToxicContentResult> {
  try {
    // TODO: implement detect_toxic_content
    throw new Error("detect_toxic_content not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "detect_toxic_content failed");
  }
}

/** Import model. */
export async function importModel(sourceModelArn: string): Promise<ImportModelResult> {
  try {
    // TODO: implement import_model
    throw new Error("import_model not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "import_model failed");
  }
}

/** List datasets. */
export async function listDatasets(): Promise<ListDatasetsResult> {
  try {
    // TODO: implement list_datasets
    throw new Error("list_datasets not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_datasets failed");
  }
}

/** List document classification jobs. */
export async function listDocumentClassificationJobs(): Promise<ListDocumentClassificationJobsResult> {
  try {
    // TODO: implement list_document_classification_jobs
    throw new Error("list_document_classification_jobs not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_document_classification_jobs failed");
  }
}

/** List document classifier summaries. */
export async function listDocumentClassifierSummaries(): Promise<ListDocumentClassifierSummariesResult> {
  try {
    // TODO: implement list_document_classifier_summaries
    throw new Error("list_document_classifier_summaries not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_document_classifier_summaries failed");
  }
}

/** List document classifiers. */
export async function listDocumentClassifiers(): Promise<ListDocumentClassifiersResult> {
  try {
    // TODO: implement list_document_classifiers
    throw new Error("list_document_classifiers not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_document_classifiers failed");
  }
}

/** List dominant language detection jobs. */
export async function listDominantLanguageDetectionJobs(): Promise<ListDominantLanguageDetectionJobsResult> {
  try {
    // TODO: implement list_dominant_language_detection_jobs
    throw new Error("list_dominant_language_detection_jobs not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_dominant_language_detection_jobs failed");
  }
}

/** List endpoints. */
export async function listEndpoints(): Promise<ListEndpointsResult> {
  try {
    // TODO: implement list_endpoints
    throw new Error("list_endpoints not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_endpoints failed");
  }
}

/** List entities detection jobs. */
export async function listEntitiesDetectionJobs(): Promise<ListEntitiesDetectionJobsResult> {
  try {
    // TODO: implement list_entities_detection_jobs
    throw new Error("list_entities_detection_jobs not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_entities_detection_jobs failed");
  }
}

/** List entity recognizer summaries. */
export async function listEntityRecognizerSummaries(): Promise<ListEntityRecognizerSummariesResult> {
  try {
    // TODO: implement list_entity_recognizer_summaries
    throw new Error("list_entity_recognizer_summaries not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_entity_recognizer_summaries failed");
  }
}

/** List entity recognizers. */
export async function listEntityRecognizers(): Promise<ListEntityRecognizersResult> {
  try {
    // TODO: implement list_entity_recognizers
    throw new Error("list_entity_recognizers not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_entity_recognizers failed");
  }
}

/** List events detection jobs. */
export async function listEventsDetectionJobs(): Promise<ListEventsDetectionJobsResult> {
  try {
    // TODO: implement list_events_detection_jobs
    throw new Error("list_events_detection_jobs not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_events_detection_jobs failed");
  }
}

/** List flywheel iteration history. */
export async function listFlywheelIterationHistory(flywheelArn: string): Promise<ListFlywheelIterationHistoryResult> {
  try {
    // TODO: implement list_flywheel_iteration_history
    throw new Error("list_flywheel_iteration_history not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_flywheel_iteration_history failed");
  }
}

/** List flywheels. */
export async function listFlywheels(): Promise<ListFlywheelsResult> {
  try {
    // TODO: implement list_flywheels
    throw new Error("list_flywheels not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_flywheels failed");
  }
}

/** List key phrases detection jobs. */
export async function listKeyPhrasesDetectionJobs(): Promise<ListKeyPhrasesDetectionJobsResult> {
  try {
    // TODO: implement list_key_phrases_detection_jobs
    throw new Error("list_key_phrases_detection_jobs not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_key_phrases_detection_jobs failed");
  }
}

/** List pii entities detection jobs. */
export async function listPiiEntitiesDetectionJobs(): Promise<ListPiiEntitiesDetectionJobsResult> {
  try {
    // TODO: implement list_pii_entities_detection_jobs
    throw new Error("list_pii_entities_detection_jobs not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_pii_entities_detection_jobs failed");
  }
}

/** List sentiment detection jobs. */
export async function listSentimentDetectionJobs(): Promise<ListSentimentDetectionJobsResult> {
  try {
    // TODO: implement list_sentiment_detection_jobs
    throw new Error("list_sentiment_detection_jobs not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_sentiment_detection_jobs failed");
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

/** List targeted sentiment detection jobs. */
export async function listTargetedSentimentDetectionJobs(): Promise<ListTargetedSentimentDetectionJobsResult> {
  try {
    // TODO: implement list_targeted_sentiment_detection_jobs
    throw new Error("list_targeted_sentiment_detection_jobs not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_targeted_sentiment_detection_jobs failed");
  }
}

/** List topics detection jobs. */
export async function listTopicsDetectionJobs(): Promise<ListTopicsDetectionJobsResult> {
  try {
    // TODO: implement list_topics_detection_jobs
    throw new Error("list_topics_detection_jobs not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_topics_detection_jobs failed");
  }
}

/** Put resource policy. */
export async function putResourcePolicy(resourceArn: string, resourcePolicy: string): Promise<PutResourcePolicyResult> {
  try {
    // TODO: implement put_resource_policy
    throw new Error("put_resource_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_resource_policy failed");
  }
}

/** Start document classification job. */
export async function startDocumentClassificationJob(inputDataConfig: Record<string, unknown>, outputDataConfig: Record<string, unknown>, dataAccessRoleArn: string): Promise<StartDocumentClassificationJobResult> {
  try {
    // TODO: implement start_document_classification_job
    throw new Error("start_document_classification_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_document_classification_job failed");
  }
}

/** Start dominant language detection job. */
export async function startDominantLanguageDetectionJob(inputDataConfig: Record<string, unknown>, outputDataConfig: Record<string, unknown>, dataAccessRoleArn: string): Promise<StartDominantLanguageDetectionJobResult> {
  try {
    // TODO: implement start_dominant_language_detection_job
    throw new Error("start_dominant_language_detection_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_dominant_language_detection_job failed");
  }
}

/** Start entities detection job. */
export async function startEntitiesDetectionJob(inputDataConfig: Record<string, unknown>, outputDataConfig: Record<string, unknown>, dataAccessRoleArn: string, languageCode: string): Promise<StartEntitiesDetectionJobResult> {
  try {
    // TODO: implement start_entities_detection_job
    throw new Error("start_entities_detection_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_entities_detection_job failed");
  }
}

/** Start events detection job. */
export async function startEventsDetectionJob(inputDataConfig: Record<string, unknown>, outputDataConfig: Record<string, unknown>, dataAccessRoleArn: string, languageCode: string, targetEventTypes: string[]): Promise<StartEventsDetectionJobResult> {
  try {
    // TODO: implement start_events_detection_job
    throw new Error("start_events_detection_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_events_detection_job failed");
  }
}

/** Start flywheel iteration. */
export async function startFlywheelIteration(flywheelArn: string): Promise<StartFlywheelIterationResult> {
  try {
    // TODO: implement start_flywheel_iteration
    throw new Error("start_flywheel_iteration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_flywheel_iteration failed");
  }
}

/** Start key phrases detection job. */
export async function startKeyPhrasesDetectionJob(inputDataConfig: Record<string, unknown>, outputDataConfig: Record<string, unknown>, dataAccessRoleArn: string, languageCode: string): Promise<StartKeyPhrasesDetectionJobResult> {
  try {
    // TODO: implement start_key_phrases_detection_job
    throw new Error("start_key_phrases_detection_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_key_phrases_detection_job failed");
  }
}

/** Start pii entities detection job. */
export async function startPiiEntitiesDetectionJob(inputDataConfig: Record<string, unknown>, outputDataConfig: Record<string, unknown>, mode: string, dataAccessRoleArn: string, languageCode: string): Promise<StartPiiEntitiesDetectionJobResult> {
  try {
    // TODO: implement start_pii_entities_detection_job
    throw new Error("start_pii_entities_detection_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_pii_entities_detection_job failed");
  }
}

/** Start sentiment detection job. */
export async function startSentimentDetectionJob(inputDataConfig: Record<string, unknown>, outputDataConfig: Record<string, unknown>, dataAccessRoleArn: string, languageCode: string): Promise<StartSentimentDetectionJobResult> {
  try {
    // TODO: implement start_sentiment_detection_job
    throw new Error("start_sentiment_detection_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_sentiment_detection_job failed");
  }
}

/** Start targeted sentiment detection job. */
export async function startTargetedSentimentDetectionJob(inputDataConfig: Record<string, unknown>, outputDataConfig: Record<string, unknown>, dataAccessRoleArn: string, languageCode: string): Promise<StartTargetedSentimentDetectionJobResult> {
  try {
    // TODO: implement start_targeted_sentiment_detection_job
    throw new Error("start_targeted_sentiment_detection_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_targeted_sentiment_detection_job failed");
  }
}

/** Start topics detection job. */
export async function startTopicsDetectionJob(inputDataConfig: Record<string, unknown>, outputDataConfig: Record<string, unknown>, dataAccessRoleArn: string): Promise<StartTopicsDetectionJobResult> {
  try {
    // TODO: implement start_topics_detection_job
    throw new Error("start_topics_detection_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_topics_detection_job failed");
  }
}

/** Stop dominant language detection job. */
export async function stopDominantLanguageDetectionJob(jobId: string, regionName?: string | undefined): Promise<StopDominantLanguageDetectionJobResult> {
  try {
    // TODO: implement stop_dominant_language_detection_job
    throw new Error("stop_dominant_language_detection_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "stop_dominant_language_detection_job failed");
  }
}

/** Stop entities detection job. */
export async function stopEntitiesDetectionJob(jobId: string, regionName?: string | undefined): Promise<StopEntitiesDetectionJobResult> {
  try {
    // TODO: implement stop_entities_detection_job
    throw new Error("stop_entities_detection_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "stop_entities_detection_job failed");
  }
}

/** Stop events detection job. */
export async function stopEventsDetectionJob(jobId: string, regionName?: string | undefined): Promise<StopEventsDetectionJobResult> {
  try {
    // TODO: implement stop_events_detection_job
    throw new Error("stop_events_detection_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "stop_events_detection_job failed");
  }
}

/** Stop key phrases detection job. */
export async function stopKeyPhrasesDetectionJob(jobId: string, regionName?: string | undefined): Promise<StopKeyPhrasesDetectionJobResult> {
  try {
    // TODO: implement stop_key_phrases_detection_job
    throw new Error("stop_key_phrases_detection_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "stop_key_phrases_detection_job failed");
  }
}

/** Stop pii entities detection job. */
export async function stopPiiEntitiesDetectionJob(jobId: string, regionName?: string | undefined): Promise<StopPiiEntitiesDetectionJobResult> {
  try {
    // TODO: implement stop_pii_entities_detection_job
    throw new Error("stop_pii_entities_detection_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "stop_pii_entities_detection_job failed");
  }
}

/** Stop sentiment detection job. */
export async function stopSentimentDetectionJob(jobId: string, regionName?: string | undefined): Promise<StopSentimentDetectionJobResult> {
  try {
    // TODO: implement stop_sentiment_detection_job
    throw new Error("stop_sentiment_detection_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "stop_sentiment_detection_job failed");
  }
}

/** Stop targeted sentiment detection job. */
export async function stopTargetedSentimentDetectionJob(jobId: string, regionName?: string | undefined): Promise<StopTargetedSentimentDetectionJobResult> {
  try {
    // TODO: implement stop_targeted_sentiment_detection_job
    throw new Error("stop_targeted_sentiment_detection_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "stop_targeted_sentiment_detection_job failed");
  }
}

/** Stop training document classifier. */
export async function stopTrainingDocumentClassifier(documentClassifierArn: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement stop_training_document_classifier
    throw new Error("stop_training_document_classifier not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "stop_training_document_classifier failed");
  }
}

/** Stop training entity recognizer. */
export async function stopTrainingEntityRecognizer(entityRecognizerArn: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement stop_training_entity_recognizer
    throw new Error("stop_training_entity_recognizer not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "stop_training_entity_recognizer failed");
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

/** Update endpoint. */
export async function updateEndpoint(endpointArn: string): Promise<UpdateEndpointResult> {
  try {
    // TODO: implement update_endpoint
    throw new Error("update_endpoint not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_endpoint failed");
  }
}

/** Update flywheel. */
export async function updateFlywheel(flywheelArn: string): Promise<UpdateFlywheelResult> {
  try {
    // TODO: implement update_flywheel
    throw new Error("update_flywheel not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_flywheel failed");
  }
}
