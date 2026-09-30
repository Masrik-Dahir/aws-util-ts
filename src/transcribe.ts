import { TranscribeClient } from "@aws-sdk/client-transcribe";
import { getClient } from "./client";
import { wrapAwsError } from "./exceptions";

/** Represents an Amazon Transcribe transcription job. */
export type TranscriptionJob = {
  jobName: string;
  jobStatus: string;
  languageCode?: string;
  mediaUri?: string;
  transcriptUri?: string;
  failureReason?: string;
};

/** Represents an Amazon Transcribe custom vocabulary. */
export type VocabularyInfo = {
  vocabularyName: string;
  languageCode: string;
  vocabularyState?: string;
  lastModifiedTime?: string;
};

/** Result of create_call_analytics_category. */
export type CreateCallAnalyticsCategoryResult = {
  categoryProperties?: Record<string, unknown>;
};

/** Result of create_language_model. */
export type CreateLanguageModelResult = {
  languageCode?: string;
  baseModelName?: string;
  modelName?: string;
  inputDataConfig?: Record<string, unknown>;
  modelStatus?: string;
};

/** Result of create_medical_vocabulary. */
export type CreateMedicalVocabularyResult = {
  vocabularyName?: string;
  languageCode?: string;
  vocabularyState?: string;
  lastModifiedTime?: string;
  failureReason?: string;
};

/** Result of create_vocabulary_filter. */
export type CreateVocabularyFilterResult = {
  vocabularyFilterName?: string;
  languageCode?: string;
  lastModifiedTime?: string;
};

/** Result of describe_language_model. */
export type DescribeLanguageModelResult = {
  languageModel?: Record<string, unknown>;
};

/** Result of get_call_analytics_category. */
export type GetCallAnalyticsCategoryResult = {
  categoryProperties?: Record<string, unknown>;
};

/** Result of get_call_analytics_job. */
export type GetCallAnalyticsJobResult = {
  callAnalyticsJob?: Record<string, unknown>;
};

/** Result of get_medical_scribe_job. */
export type GetMedicalScribeJobResult = {
  medicalScribeJob?: Record<string, unknown>;
};

/** Result of get_medical_transcription_job. */
export type GetMedicalTranscriptionJobResult = {
  medicalTranscriptionJob?: Record<string, unknown>;
};

/** Result of get_medical_vocabulary. */
export type GetMedicalVocabularyResult = {
  vocabularyName?: string;
  languageCode?: string;
  vocabularyState?: string;
  lastModifiedTime?: string;
  failureReason?: string;
  downloadUri?: string;
};

/** Result of get_vocabulary_filter. */
export type GetVocabularyFilterResult = {
  vocabularyFilterName?: string;
  languageCode?: string;
  lastModifiedTime?: string;
  downloadUri?: string;
};

/** Result of list_call_analytics_categories. */
export type ListCallAnalyticsCategoriesResult = {
  nextToken?: string;
  categories?: Record<string, unknown>[];
};

/** Result of list_call_analytics_jobs. */
export type ListCallAnalyticsJobsResult = {
  status?: string;
  nextToken?: string;
  callAnalyticsJobSummaries?: Record<string, unknown>[];
};

/** Result of list_language_models. */
export type ListLanguageModelsResult = {
  nextToken?: string;
  models?: Record<string, unknown>[];
};

/** Result of list_medical_scribe_jobs. */
export type ListMedicalScribeJobsResult = {
  status?: string;
  nextToken?: string;
  medicalScribeJobSummaries?: Record<string, unknown>[];
};

/** Result of list_medical_transcription_jobs. */
export type ListMedicalTranscriptionJobsResult = {
  status?: string;
  nextToken?: string;
  medicalTranscriptionJobSummaries?: Record<string, unknown>[];
};

/** Result of list_medical_vocabularies. */
export type ListMedicalVocabulariesResult = {
  status?: string;
  nextToken?: string;
  vocabularies?: Record<string, unknown>[];
};

/** Result of list_tags_for_resource. */
export type ListTagsForResourceResult = {
  resourceArn?: string;
  tags?: Record<string, unknown>[];
};

/** Result of list_vocabulary_filters. */
export type ListVocabularyFiltersResult = {
  nextToken?: string;
  vocabularyFilters?: Record<string, unknown>[];
};

/** Result of start_call_analytics_job. */
export type StartCallAnalyticsJobResult = {
  callAnalyticsJob?: Record<string, unknown>;
};

/** Result of start_medical_scribe_job. */
export type StartMedicalScribeJobResult = {
  medicalScribeJob?: Record<string, unknown>;
};

/** Result of start_medical_transcription_job. */
export type StartMedicalTranscriptionJobResult = {
  medicalTranscriptionJob?: Record<string, unknown>;
};

/** Result of update_call_analytics_category. */
export type UpdateCallAnalyticsCategoryResult = {
  categoryProperties?: Record<string, unknown>;
};

/** Result of update_medical_vocabulary. */
export type UpdateMedicalVocabularyResult = {
  vocabularyName?: string;
  languageCode?: string;
  lastModifiedTime?: string;
  vocabularyState?: string;
};

/** Result of update_vocabulary. */
export type UpdateVocabularyResult = {
  vocabularyName?: string;
  languageCode?: string;
  lastModifiedTime?: string;
  vocabularyState?: string;
};

/** Result of update_vocabulary_filter. */
export type UpdateVocabularyFilterResult = {
  vocabularyFilterName?: string;
  languageCode?: string;
  lastModifiedTime?: string;
};

/** Start a new transcription job. */
export async function startTranscriptionJob(jobName: string, mediaUri: string, languageCode: string, mediaFormat?: string, outputBucket?: string, outputKey?: string, settings?: Record<string, unknown>, regionName?: string): Promise<TranscriptionJob> {
  try {
    // TODO: implement start_transcription_job
    throw new Error("start_transcription_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_transcription_job failed");
  }
}

/** Get the status and details of a transcription job. */
export async function getTranscriptionJob(jobName: string, regionName?: string): Promise<TranscriptionJob> {
  try {
    // TODO: implement get_transcription_job
    throw new Error("get_transcription_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_transcription_job failed");
  }
}

/** List transcription jobs with optional filters. */
export async function listTranscriptionJobs(status?: string, jobNameContains?: string, maxResults?: number, regionName?: string): Promise<TranscriptionJob[]> {
  try {
    // TODO: implement list_transcription_jobs
    throw new Error("list_transcription_jobs not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_transcription_jobs failed");
  }
}

/** Delete a transcription job. */
export async function deleteTranscriptionJob(jobName: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_transcription_job
    throw new Error("delete_transcription_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_transcription_job failed");
  }
}

/** Create a custom vocabulary for improved transcription accuracy. */
export async function createVocabulary(vocabularyName: string, languageCode: string, phrases?: string[], vocabularyFileUri?: string, regionName?: string): Promise<VocabularyInfo> {
  try {
    // TODO: implement create_vocabulary
    throw new Error("create_vocabulary not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_vocabulary failed");
  }
}

/** Get details of a custom vocabulary. */
export async function getVocabulary(vocabularyName: string, regionName?: string): Promise<VocabularyInfo> {
  try {
    // TODO: implement get_vocabulary
    throw new Error("get_vocabulary not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_vocabulary failed");
  }
}

/** List custom vocabularies with optional filters. */
export async function listVocabularies(stateEquals?: string, nameContains?: string, maxResults?: number, regionName?: string): Promise<VocabularyInfo[]> {
  try {
    // TODO: implement list_vocabularies
    throw new Error("list_vocabularies not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_vocabularies failed");
  }
}

/** Delete a custom vocabulary. */
export async function deleteVocabulary(vocabularyName: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_vocabulary
    throw new Error("delete_vocabulary not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_vocabulary failed");
  }
}

/** Poll until a transcription job reaches a terminal status. */
export async function waitForTranscriptionJob(jobName: string, pollInterval: number, timeout: number, regionName?: string): Promise<TranscriptionJob> {
  try {
    // TODO: implement wait_for_transcription_job
    throw new Error("wait_for_transcription_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "wait_for_transcription_job failed");
  }
}

/** Start a transcription job and wait for it to complete. */
export async function transcribeAndWait(jobName: string, mediaUri: string, languageCode: string, mediaFormat?: string, outputBucket?: string, outputKey?: string, settings?: Record<string, unknown>, pollInterval: number, timeout: number, regionName?: string): Promise<TranscriptionJob> {
  try {
    // TODO: implement transcribe_and_wait
    throw new Error("transcribe_and_wait not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "transcribe_and_wait failed");
  }
}

/** Create call analytics category. */
export async function createCallAnalyticsCategory(categoryName: string, rules: Record<string, unknown>[]): Promise<CreateCallAnalyticsCategoryResult> {
  try {
    // TODO: implement create_call_analytics_category
    throw new Error("create_call_analytics_category not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_call_analytics_category failed");
  }
}

/** Create language model. */
export async function createLanguageModel(languageCode: string, baseModelName: string, modelName: string, inputDataConfig: Record<string, unknown>): Promise<CreateLanguageModelResult> {
  try {
    // TODO: implement create_language_model
    throw new Error("create_language_model not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_language_model failed");
  }
}

/** Create medical vocabulary. */
export async function createMedicalVocabulary(vocabularyName: string, languageCode: string, vocabularyFileUri: string): Promise<CreateMedicalVocabularyResult> {
  try {
    // TODO: implement create_medical_vocabulary
    throw new Error("create_medical_vocabulary not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_medical_vocabulary failed");
  }
}

/** Create vocabulary filter. */
export async function createVocabularyFilter(vocabularyFilterName: string, languageCode: string): Promise<CreateVocabularyFilterResult> {
  try {
    // TODO: implement create_vocabulary_filter
    throw new Error("create_vocabulary_filter not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_vocabulary_filter failed");
  }
}

/** Delete call analytics category. */
export async function deleteCallAnalyticsCategory(categoryName: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_call_analytics_category
    throw new Error("delete_call_analytics_category not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_call_analytics_category failed");
  }
}

/** Delete call analytics job. */
export async function deleteCallAnalyticsJob(callAnalyticsJobName: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_call_analytics_job
    throw new Error("delete_call_analytics_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_call_analytics_job failed");
  }
}

/** Delete language model. */
export async function deleteLanguageModel(modelName: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_language_model
    throw new Error("delete_language_model not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_language_model failed");
  }
}

/** Delete medical scribe job. */
export async function deleteMedicalScribeJob(medicalScribeJobName: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_medical_scribe_job
    throw new Error("delete_medical_scribe_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_medical_scribe_job failed");
  }
}

/** Delete medical transcription job. */
export async function deleteMedicalTranscriptionJob(medicalTranscriptionJobName: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_medical_transcription_job
    throw new Error("delete_medical_transcription_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_medical_transcription_job failed");
  }
}

/** Delete medical vocabulary. */
export async function deleteMedicalVocabulary(vocabularyName: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_medical_vocabulary
    throw new Error("delete_medical_vocabulary not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_medical_vocabulary failed");
  }
}

/** Delete vocabulary filter. */
export async function deleteVocabularyFilter(vocabularyFilterName: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_vocabulary_filter
    throw new Error("delete_vocabulary_filter not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_vocabulary_filter failed");
  }
}

/** Describe language model. */
export async function describeLanguageModel(modelName: string, regionName?: string): Promise<DescribeLanguageModelResult> {
  try {
    // TODO: implement describe_language_model
    throw new Error("describe_language_model not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_language_model failed");
  }
}

/** Get call analytics category. */
export async function getCallAnalyticsCategory(categoryName: string, regionName?: string): Promise<GetCallAnalyticsCategoryResult> {
  try {
    // TODO: implement get_call_analytics_category
    throw new Error("get_call_analytics_category not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_call_analytics_category failed");
  }
}

/** Get call analytics job. */
export async function getCallAnalyticsJob(callAnalyticsJobName: string, regionName?: string): Promise<GetCallAnalyticsJobResult> {
  try {
    // TODO: implement get_call_analytics_job
    throw new Error("get_call_analytics_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_call_analytics_job failed");
  }
}

/** Get medical scribe job. */
export async function getMedicalScribeJob(medicalScribeJobName: string, regionName?: string): Promise<GetMedicalScribeJobResult> {
  try {
    // TODO: implement get_medical_scribe_job
    throw new Error("get_medical_scribe_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_medical_scribe_job failed");
  }
}

/** Get medical transcription job. */
export async function getMedicalTranscriptionJob(medicalTranscriptionJobName: string, regionName?: string): Promise<GetMedicalTranscriptionJobResult> {
  try {
    // TODO: implement get_medical_transcription_job
    throw new Error("get_medical_transcription_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_medical_transcription_job failed");
  }
}

/** Get medical vocabulary. */
export async function getMedicalVocabulary(vocabularyName: string, regionName?: string): Promise<GetMedicalVocabularyResult> {
  try {
    // TODO: implement get_medical_vocabulary
    throw new Error("get_medical_vocabulary not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_medical_vocabulary failed");
  }
}

/** Get vocabulary filter. */
export async function getVocabularyFilter(vocabularyFilterName: string, regionName?: string): Promise<GetVocabularyFilterResult> {
  try {
    // TODO: implement get_vocabulary_filter
    throw new Error("get_vocabulary_filter not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_vocabulary_filter failed");
  }
}

/** List call analytics categories. */
export async function listCallAnalyticsCategories(): Promise<ListCallAnalyticsCategoriesResult> {
  try {
    // TODO: implement list_call_analytics_categories
    throw new Error("list_call_analytics_categories not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_call_analytics_categories failed");
  }
}

/** List call analytics jobs. */
export async function listCallAnalyticsJobs(): Promise<ListCallAnalyticsJobsResult> {
  try {
    // TODO: implement list_call_analytics_jobs
    throw new Error("list_call_analytics_jobs not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_call_analytics_jobs failed");
  }
}

/** List language models. */
export async function listLanguageModels(): Promise<ListLanguageModelsResult> {
  try {
    // TODO: implement list_language_models
    throw new Error("list_language_models not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_language_models failed");
  }
}

/** List medical scribe jobs. */
export async function listMedicalScribeJobs(): Promise<ListMedicalScribeJobsResult> {
  try {
    // TODO: implement list_medical_scribe_jobs
    throw new Error("list_medical_scribe_jobs not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_medical_scribe_jobs failed");
  }
}

/** List medical transcription jobs. */
export async function listMedicalTranscriptionJobs(): Promise<ListMedicalTranscriptionJobsResult> {
  try {
    // TODO: implement list_medical_transcription_jobs
    throw new Error("list_medical_transcription_jobs not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_medical_transcription_jobs failed");
  }
}

/** List medical vocabularies. */
export async function listMedicalVocabularies(): Promise<ListMedicalVocabulariesResult> {
  try {
    // TODO: implement list_medical_vocabularies
    throw new Error("list_medical_vocabularies not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_medical_vocabularies failed");
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

/** List vocabulary filters. */
export async function listVocabularyFilters(): Promise<ListVocabularyFiltersResult> {
  try {
    // TODO: implement list_vocabulary_filters
    throw new Error("list_vocabulary_filters not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_vocabulary_filters failed");
  }
}

/** Start call analytics job. */
export async function startCallAnalyticsJob(callAnalyticsJobName: string, media: Record<string, unknown>): Promise<StartCallAnalyticsJobResult> {
  try {
    // TODO: implement start_call_analytics_job
    throw new Error("start_call_analytics_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_call_analytics_job failed");
  }
}

/** Start medical scribe job. */
export async function startMedicalScribeJob(medicalScribeJobName: string, media: Record<string, unknown>, outputBucketName: string, dataAccessRoleArn: string, settings: Record<string, unknown>): Promise<StartMedicalScribeJobResult> {
  try {
    // TODO: implement start_medical_scribe_job
    throw new Error("start_medical_scribe_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_medical_scribe_job failed");
  }
}

/** Start medical transcription job. */
export async function startMedicalTranscriptionJob(medicalTranscriptionJobName: string, languageCode: string, media: Record<string, unknown>, outputBucketName: string, specialty: string, typeValue: string): Promise<StartMedicalTranscriptionJobResult> {
  try {
    // TODO: implement start_medical_transcription_job
    throw new Error("start_medical_transcription_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_medical_transcription_job failed");
  }
}

/** Tag resource. */
export async function tagResource(resourceArn: string, tags: Record<string, unknown>[], regionName?: string): Promise<void> {
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

/** Update call analytics category. */
export async function updateCallAnalyticsCategory(categoryName: string, rules: Record<string, unknown>[]): Promise<UpdateCallAnalyticsCategoryResult> {
  try {
    // TODO: implement update_call_analytics_category
    throw new Error("update_call_analytics_category not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_call_analytics_category failed");
  }
}

/** Update medical vocabulary. */
export async function updateMedicalVocabulary(vocabularyName: string, languageCode: string, vocabularyFileUri: string, regionName?: string): Promise<UpdateMedicalVocabularyResult> {
  try {
    // TODO: implement update_medical_vocabulary
    throw new Error("update_medical_vocabulary not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_medical_vocabulary failed");
  }
}

/** Update vocabulary. */
export async function updateVocabulary(vocabularyName: string, languageCode: string): Promise<UpdateVocabularyResult> {
  try {
    // TODO: implement update_vocabulary
    throw new Error("update_vocabulary not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_vocabulary failed");
  }
}

/** Update vocabulary filter. */
export async function updateVocabularyFilter(vocabularyFilterName: string): Promise<UpdateVocabularyFilterResult> {
  try {
    // TODO: implement update_vocabulary_filter
    throw new Error("update_vocabulary_filter not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_vocabulary_filter failed");
  }
}
