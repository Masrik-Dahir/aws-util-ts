/**
 * aws-util/translate — High-level Amazon Translate utilities.
 *
 * Provides typed helpers for text translation, batch translation, and
 * listing supported languages.
 *
 * @example
 * ```ts
 * import { translateText, translateBatch, listLanguages } from "./translate.js";
 *
 * const result = await translateText("Hello world", "en", "es");
 * const langs = await listLanguages();
 * ```
 *
 * @module
 */

import { z } from "zod";
import {
  TranslateClient,
  TranslateTextCommand,
  ListLanguagesCommand,
} from "@aws-sdk/client-translate";
import { getClient } from "./client.js";
import { wrapAwsError } from "./exceptions.js";

// ---------------------------------------------------------------------------
// Zod schemas
// ---------------------------------------------------------------------------

/** Schema for the result of a translation. */
export const TranslateResultSchema = z.object({
  translatedText: z.string(),
  sourceLanguageCode: z.string(),
  targetLanguageCode: z.string(),
});

/** Result of a translation call. */
export type TranslateResult = z.infer<typeof TranslateResultSchema>;

/** Schema for a supported language. */
export const TranslateLanguageSchema = z.object({
  languageCode: z.string(),
  languageName: z.string(),
});

/** A language supported by Amazon Translate. */
export type TranslateLanguage = z.infer<
  typeof TranslateLanguageSchema
>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Get a cached TranslateClient for the given region.
 */
function translate(region?: string): TranslateClient {
  return getClient(TranslateClient, region);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Translate text from one language to another.
 *
 * @param text - The text to translate (up to 10,000 UTF-8 bytes).
 * @param sourceLanguageCode - BCP-47 source language code, or `"auto"` to
 *   let Amazon Translate detect the language automatically.
 * @param targetLanguageCode - BCP-47 target language code, e.g. `"es"`,
 *   `"fr"`, `"de"`, `"ja"`.
 * @param region - AWS region override.
 * @returns A {@link TranslateResult} with the translated text and language codes.
 */
export async function translateText(
  text: string,
  sourceLanguageCode: string,
  targetLanguageCode: string,
  region?: string,
): Promise<TranslateResult> {
  try {
    const resp = await translate(region).send(
      new TranslateTextCommand({
        Text: text,
        SourceLanguageCode: sourceLanguageCode,
        TargetLanguageCode: targetLanguageCode,
      }),
    );

    return TranslateResultSchema.parse({
      translatedText: resp.TranslatedText ?? "",
      sourceLanguageCode: resp.SourceLanguageCode ?? sourceLanguageCode,
      targetLanguageCode: resp.TargetLanguageCode ?? targetLanguageCode,
    });
  } catch (err: unknown) {
    throw wrapAwsError(
      err,
      `translateText(${sourceLanguageCode} -> ${targetLanguageCode})`,
    );
  }
}

/**
 * List all languages supported by Amazon Translate.
 *
 * Handles pagination automatically.
 *
 * @param region - AWS region override.
 * @returns A list of {@link TranslateLanguage} objects.
 */
export async function listLanguages(
  region?: string,
): Promise<TranslateLanguage[]> {
  const languages: TranslateLanguage[] = [];
  let nextToken: string | undefined;

  try {
    do {
      const resp = await translate(region).send(
        new ListLanguagesCommand({
          MaxResults: 500,
          NextToken: nextToken,
        }),
      );

      for (const lang of resp.Languages ?? []) {
        languages.push(
          TranslateLanguageSchema.parse({
            languageCode: lang.LanguageCode ?? "",
            languageName: lang.LanguageName ?? "",
          }),
        );
      }

      nextToken = resp.NextToken;
    } while (nextToken);
  } catch (err: unknown) {
    throw wrapAwsError(err, "listLanguages");
  }

  return languages;
}

/**
 * Translate a batch of text strings concurrently using `Promise.all`.
 *
 * @param texts - Array of input texts (each up to 10,000 UTF-8 bytes).
 * @param sourceLanguageCode - BCP-47 source language code, or `"auto"`.
 * @param targetLanguageCode - BCP-47 target language code.
 * @param region - AWS region override.
 * @returns A list of {@link TranslateResult} objects in the same order as `texts`.
 */
export async function translateBatch(
  texts: string[],
  sourceLanguageCode: string,
  targetLanguageCode: string,
  region?: string,
): Promise<TranslateResult[]> {
  if (texts.length === 0) return [];

  return Promise.all(
    texts.map((t) =>
      translateText(t, sourceLanguageCode, targetLanguageCode, region),
    ),
  );
}

// ---------------------------------------------------------------------------
// Additional types (auto-generated)
// ---------------------------------------------------------------------------

/** Result of create_parallel_data. */
export type CreateParallelDataResult = {
  name?: string | undefined;
  status?: string | undefined;
};

/** Result of delete_parallel_data. */
export type DeleteParallelDataResult = {
  name?: string | undefined;
  status?: string | undefined;
};

/** Result of describe_text_translation_job. */
export type DescribeTextTranslationJobResult = {
  textTranslationJobProperties?: Record<string, unknown>;
};

/** Result of get_parallel_data. */
export type GetParallelDataResult = {
  parallelDataProperties?: Record<string, unknown>;
  dataLocation?: Record<string, unknown>;
  auxiliaryDataLocation?: Record<string, unknown>;
  latestUpdateAttemptAuxiliaryDataLocation?: Record<string, unknown>;
};

/** Result of get_terminology. */
export type GetTerminologyResult = {
  terminologyProperties?: Record<string, unknown>;
  terminologyDataLocation?: Record<string, unknown>;
  auxiliaryDataLocation?: Record<string, unknown>;
};

/** Result of import_terminology. */
export type ImportTerminologyResult = {
  terminologyProperties?: Record<string, unknown>;
  auxiliaryDataLocation?: Record<string, unknown>;
};

/** Result of list_parallel_data. */
export type ListParallelDataResult = {
  parallelDataPropertiesList?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_tags_for_resource. */
export type ListTagsForResourceResult = {
  tags?: Record<string, unknown>[];
};

/** Result of list_terminologies. */
export type ListTerminologiesResult = {
  terminologyPropertiesList?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_text_translation_jobs. */
export type ListTextTranslationJobsResult = {
  textTranslationJobPropertiesList?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of start_text_translation_job. */
export type StartTextTranslationJobResult = {
  jobId?: string | undefined;
  jobStatus?: string | undefined;
};

/** Result of stop_text_translation_job. */
export type StopTextTranslationJobResult = {
  jobId?: string | undefined;
  jobStatus?: string | undefined;
};

/** Result of translate_document. */
export type TranslateDocumentResult = {
  translatedDocument?: Record<string, unknown>;
  sourceLanguageCode?: string | undefined;
  targetLanguageCode?: string | undefined;
  appliedTerminologies?: Record<string, unknown>[];
  appliedSettings?: Record<string, unknown>;
};

/** Result of update_parallel_data. */
export type UpdateParallelDataResult = {
  name?: string | undefined;
  status?: string | undefined;
  latestUpdateAttemptStatus?: string | undefined;
  latestUpdateAttemptAt?: string | undefined;
};


// ---------------------------------------------------------------------------
// Additional functions (auto-generated)
// ---------------------------------------------------------------------------

/** Create parallel data. */
export async function createParallelData(name: string, parallelDataConfig: Record<string, unknown>, clientToken: string): Promise<CreateParallelDataResult> {
  try {
    // TODO: implement create_parallel_data
    throw new Error("create_parallel_data not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_parallel_data failed");
  }
}

/** Delete parallel data. */
export async function deleteParallelData(name: string, regionName?: string | undefined): Promise<DeleteParallelDataResult> {
  try {
    // TODO: implement delete_parallel_data
    throw new Error("delete_parallel_data not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_parallel_data failed");
  }
}

/** Delete terminology. */
export async function deleteTerminology(name: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_terminology
    throw new Error("delete_terminology not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_terminology failed");
  }
}

/** Describe text translation job. */
export async function describeTextTranslationJob(jobId: string, regionName?: string | undefined): Promise<DescribeTextTranslationJobResult> {
  try {
    // TODO: implement describe_text_translation_job
    throw new Error("describe_text_translation_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_text_translation_job failed");
  }
}

/** Get parallel data. */
export async function getParallelData(name: string, regionName?: string | undefined): Promise<GetParallelDataResult> {
  try {
    // TODO: implement get_parallel_data
    throw new Error("get_parallel_data not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_parallel_data failed");
  }
}

/** Get terminology. */
export async function getTerminology(name: string): Promise<GetTerminologyResult> {
  try {
    // TODO: implement get_terminology
    throw new Error("get_terminology not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_terminology failed");
  }
}

/** Import terminology. */
export async function importTerminology(name: string, mergeStrategy: string, terminologyData: Record<string, unknown>): Promise<ImportTerminologyResult> {
  try {
    // TODO: implement import_terminology
    throw new Error("import_terminology not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "import_terminology failed");
  }
}

/** List parallel data. */
export async function listParallelData(): Promise<ListParallelDataResult> {
  try {
    // TODO: implement list_parallel_data
    throw new Error("list_parallel_data not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_parallel_data failed");
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

/** List terminologies. */
export async function listTerminologies(): Promise<ListTerminologiesResult> {
  try {
    // TODO: implement list_terminologies
    throw new Error("list_terminologies not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_terminologies failed");
  }
}

/** List text translation jobs. */
export async function listTextTranslationJobs(): Promise<ListTextTranslationJobsResult> {
  try {
    // TODO: implement list_text_translation_jobs
    throw new Error("list_text_translation_jobs not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_text_translation_jobs failed");
  }
}

/** Start text translation job. */
export async function startTextTranslationJob(inputDataConfig: Record<string, unknown>, outputDataConfig: Record<string, unknown>, dataAccessRoleArn: string, sourceLanguageCode: string, targetLanguageCodes: string[], clientToken: string): Promise<StartTextTranslationJobResult> {
  try {
    // TODO: implement start_text_translation_job
    throw new Error("start_text_translation_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_text_translation_job failed");
  }
}

/** Stop text translation job. */
export async function stopTextTranslationJob(jobId: string, regionName?: string | undefined): Promise<StopTextTranslationJobResult> {
  try {
    // TODO: implement stop_text_translation_job
    throw new Error("stop_text_translation_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "stop_text_translation_job failed");
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

/** Translate document. */
export async function translateDocument(document: Record<string, unknown>, sourceLanguageCode: string, targetLanguageCode: string): Promise<TranslateDocumentResult> {
  try {
    // TODO: implement translate_document
    throw new Error("translate_document not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "translate_document failed");
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

/** Update parallel data. */
export async function updateParallelData(name: string, parallelDataConfig: Record<string, unknown>, clientToken: string): Promise<UpdateParallelDataResult> {
  try {
    // TODO: implement update_parallel_data
    throw new Error("update_parallel_data not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_parallel_data failed");
  }
}
