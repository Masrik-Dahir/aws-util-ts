import { wrapAwsError } from "./exceptions";

/** Summary of a Lex V2 bot. */
export type BotSummary = {
  botId: string;
  botName: string;
  botStatus?: string;
  description?: string;
};

/** Summary of a Lex V2 intent. */
export type IntentSummary = {
  intentId: string;
  intentName: string;
  description?: string;
};

/** Information about a Lex V2 bot locale. */
export type BotLocaleInfo = {
  botId?: string;
  botVersion?: string;
  localeId?: string;
  localeName?: string;
  botLocaleStatus?: string;
};

/** Result of batch_create_custom_vocabulary_item. */
export type BatchCreateCustomVocabularyItemResult = {
  botId?: string;
  botVersion?: string;
  localeId?: string;
  errors?: Record<string, unknown>[];
  resources?: Record<string, unknown>[];
};

/** Result of batch_delete_custom_vocabulary_item. */
export type BatchDeleteCustomVocabularyItemResult = {
  botId?: string;
  botVersion?: string;
  localeId?: string;
  errors?: Record<string, unknown>[];
  resources?: Record<string, unknown>[];
};

/** Result of batch_update_custom_vocabulary_item. */
export type BatchUpdateCustomVocabularyItemResult = {
  botId?: string;
  botVersion?: string;
  localeId?: string;
  errors?: Record<string, unknown>[];
  resources?: Record<string, unknown>[];
};

/** Result of create_bot_alias. */
export type CreateBotAliasResult = {
  botAliasId?: string;
  botAliasName?: string;
  description?: string;
  botVersion?: string;
  botAliasLocaleSettings?: Record<string, unknown>;
  conversationLogSettings?: Record<string, unknown>;
  sentimentAnalysisSettings?: Record<string, unknown>;
  botAliasStatus?: string;
  botId?: string;
  creationDateTime?: string;
  tags?: Record<string, unknown>;
};

/** Result of create_bot_locale. */
export type CreateBotLocaleResult = {
  botId?: string;
  botVersion?: string;
  localeName?: string;
  localeId?: string;
  description?: string;
  nluIntentConfidenceThreshold?: number;
  voiceSettings?: Record<string, unknown>;
  botLocaleStatus?: string;
  creationDateTime?: string;
  generativeAiSettings?: Record<string, unknown>;
};

/** Result of create_bot_replica. */
export type CreateBotReplicaResult = {
  botId?: string;
  replicaRegion?: string;
  sourceRegion?: string;
  creationDateTime?: string;
  botReplicaStatus?: string;
};

/** Result of create_bot_version. */
export type CreateBotVersionResult = {
  botId?: string;
  description?: string;
  botVersion?: string;
  botVersionLocaleSpecification?: Record<string, unknown>;
  botStatus?: string;
  creationDateTime?: string;
};

/** Result of create_export. */
export type CreateExportResult = {
  exportId?: string;
  resourceSpecification?: Record<string, unknown>;
  fileFormat?: string;
  exportStatus?: string;
  creationDateTime?: string;
};

/** Result of create_resource_policy. */
export type CreateResourcePolicyResult = {
  resourceArn?: string;
  revisionId?: string;
};

/** Result of create_resource_policy_statement. */
export type CreateResourcePolicyStatementResult = {
  resourceArn?: string;
  revisionId?: string;
};

/** Result of create_slot. */
export type CreateSlotResult = {
  slotId?: string;
  slotName?: string;
  description?: string;
  slotTypeId?: string;
  valueElicitationSetting?: Record<string, unknown>;
  obfuscationSetting?: Record<string, unknown>;
  botId?: string;
  botVersion?: string;
  localeId?: string;
  intentId?: string;
  creationDateTime?: string;
  multipleValuesSetting?: Record<string, unknown>;
  subSlotSetting?: Record<string, unknown>;
};

/** Result of create_test_set_discrepancy_report. */
export type CreateTestSetDiscrepancyReportResult = {
  runSetDiscrepancyReportId?: string;
  creationDateTime?: string;
  runSetId?: string;
  target?: Record<string, unknown>;
};

/** Result of create_upload_url. */
export type CreateUploadUrlResult = {
  importId?: string;
  uploadUrl?: string;
};

/** Result of delete_bot_alias. */
export type DeleteBotAliasResult = {
  botAliasId?: string;
  botId?: string;
  botAliasStatus?: string;
};

/** Result of delete_bot_locale. */
export type DeleteBotLocaleResult = {
  botId?: string;
  botVersion?: string;
  localeId?: string;
  botLocaleStatus?: string;
};

/** Result of delete_bot_replica. */
export type DeleteBotReplicaResult = {
  botId?: string;
  replicaRegion?: string;
  botReplicaStatus?: string;
};

/** Result of delete_bot_version. */
export type DeleteBotVersionResult = {
  botId?: string;
  botVersion?: string;
  botStatus?: string;
};

/** Result of delete_custom_vocabulary. */
export type DeleteCustomVocabularyResult = {
  botId?: string;
  botVersion?: string;
  localeId?: string;
  customVocabularyStatus?: string;
};

/** Result of delete_export. */
export type DeleteExportResult = {
  exportId?: string;
  exportStatus?: string;
};

/** Result of delete_import. */
export type DeleteImportResult = {
  importId?: string;
  importStatus?: string;
};

/** Result of delete_resource_policy. */
export type DeleteResourcePolicyResult = {
  resourceArn?: string;
  revisionId?: string;
};

/** Result of delete_resource_policy_statement. */
export type DeleteResourcePolicyStatementResult = {
  resourceArn?: string;
  revisionId?: string;
};

/** Result of describe_bot_alias. */
export type DescribeBotAliasResult = {
  botAliasId?: string;
  botAliasName?: string;
  description?: string;
  botVersion?: string;
  botAliasLocaleSettings?: Record<string, unknown>;
  conversationLogSettings?: Record<string, unknown>;
  sentimentAnalysisSettings?: Record<string, unknown>;
  botAliasHistoryEvents?: Record<string, unknown>[];
  botAliasStatus?: string;
  botId?: string;
  creationDateTime?: string;
  lastUpdatedDateTime?: string;
  parentBotNetworks?: Record<string, unknown>[];
};

/** Result of describe_bot_recommendation. */
export type DescribeBotRecommendationResult = {
  botId?: string;
  botVersion?: string;
  localeId?: string;
  botRecommendationStatus?: string;
  botRecommendationId?: string;
  failureReasons?: string[];
  creationDateTime?: string;
  lastUpdatedDateTime?: string;
  transcriptSourceSetting?: Record<string, unknown>;
  encryptionSetting?: Record<string, unknown>;
  botRecommendationResults?: Record<string, unknown>;
};

/** Result of describe_bot_replica. */
export type DescribeBotReplicaResult = {
  botId?: string;
  replicaRegion?: string;
  sourceRegion?: string;
  creationDateTime?: string;
  botReplicaStatus?: string;
  failureReasons?: string[];
};

/** Result of describe_bot_resource_generation. */
export type DescribeBotResourceGenerationResult = {
  botId?: string;
  botVersion?: string;
  localeId?: string;
  generationId?: string;
  failureReasons?: string[];
  generationStatus?: string;
  generationInputPrompt?: string;
  generatedBotLocaleUrl?: string;
  creationDateTime?: string;
  modelArn?: string;
  lastUpdatedDateTime?: string;
};

/** Result of describe_bot_version. */
export type DescribeBotVersionResult = {
  botId?: string;
  botName?: string;
  botVersion?: string;
  description?: string;
  roleArn?: string;
  dataPrivacy?: Record<string, unknown>;
  idleSessionTtlInSeconds?: number;
  botStatus?: string;
  failureReasons?: string[];
  creationDateTime?: string;
  parentBotNetworks?: Record<string, unknown>[];
  botType?: string;
  botMembers?: Record<string, unknown>[];
};

/** Result of describe_custom_vocabulary_metadata. */
export type DescribeCustomVocabularyMetadataResult = {
  botId?: string;
  botVersion?: string;
  localeId?: string;
  customVocabularyStatus?: string;
  creationDateTime?: string;
  lastUpdatedDateTime?: string;
};

/** Result of describe_export. */
export type DescribeExportResult = {
  exportId?: string;
  resourceSpecification?: Record<string, unknown>;
  fileFormat?: string;
  exportStatus?: string;
  failureReasons?: string[];
  downloadUrl?: string;
  creationDateTime?: string;
  lastUpdatedDateTime?: string;
};

/** Result of describe_import. */
export type DescribeImportResult = {
  importId?: string;
  resourceSpecification?: Record<string, unknown>;
  importedResourceId?: string;
  importedResourceName?: string;
  mergeStrategy?: string;
  importStatus?: string;
  failureReasons?: string[];
  creationDateTime?: string;
  lastUpdatedDateTime?: string;
};

/** Result of describe_resource_policy. */
export type DescribeResourcePolicyResult = {
  resourceArn?: string;
  policy?: string;
  revisionId?: string;
};

/** Result of describe_slot. */
export type DescribeSlotResult = {
  slotId?: string;
  slotName?: string;
  description?: string;
  slotTypeId?: string;
  valueElicitationSetting?: Record<string, unknown>;
  obfuscationSetting?: Record<string, unknown>;
  botId?: string;
  botVersion?: string;
  localeId?: string;
  intentId?: string;
  creationDateTime?: string;
  lastUpdatedDateTime?: string;
  multipleValuesSetting?: Record<string, unknown>;
  subSlotSetting?: Record<string, unknown>;
};

/** Result of describe_slot_type. */
export type DescribeSlotTypeResult = {
  slotTypeId?: string;
  slotTypeName?: string;
  description?: string;
  slotTypeValues?: Record<string, unknown>[];
  valueSelectionSetting?: Record<string, unknown>;
  parentSlotTypeSignature?: string;
  botId?: string;
  botVersion?: string;
  localeId?: string;
  creationDateTime?: string;
  lastUpdatedDateTime?: string;
  externalSourceSetting?: Record<string, unknown>;
  compositeSlotTypeSetting?: Record<string, unknown>;
};

/** Result of describe_test_execution. */
export type DescribeTestExecutionResult = {
  runExecutionId?: string;
  creationDateTime?: string;
  lastUpdatedDateTime?: string;
  runExecutionStatus?: string;
  runSetId?: string;
  runSetName?: string;
  target?: Record<string, unknown>;
  apiMode?: string;
  runExecutionModality?: string;
  failureReasons?: string[];
};

/** Result of describe_test_set. */
export type DescribeTestSetResult = {
  runSetId?: string;
  runSetName?: string;
  description?: string;
  modality?: string;
  status?: string;
  roleArn?: string;
  numTurns?: number;
  storageLocation?: Record<string, unknown>;
  creationDateTime?: string;
  lastUpdatedDateTime?: string;
};

/** Result of describe_test_set_discrepancy_report. */
export type DescribeTestSetDiscrepancyReportResult = {
  runSetDiscrepancyReportId?: string;
  runSetId?: string;
  creationDateTime?: string;
  target?: Record<string, unknown>;
  runSetDiscrepancyReportStatus?: string;
  lastUpdatedDataTime?: string;
  runSetDiscrepancyTopErrors?: Record<string, unknown>;
  runSetDiscrepancyRawOutputUrl?: string;
  failureReasons?: string[];
};

/** Result of describe_test_set_generation. */
export type DescribeTestSetGenerationResult = {
  runSetGenerationId?: string;
  runSetGenerationStatus?: string;
  failureReasons?: string[];
  runSetId?: string;
  runSetName?: string;
  description?: string;
  storageLocation?: Record<string, unknown>;
  generationDataSource?: Record<string, unknown>;
  roleArn?: string;
  creationDateTime?: string;
  lastUpdatedDateTime?: string;
};

/** Result of generate_bot_element. */
export type GenerateBotElementResult = {
  botId?: string;
  botVersion?: string;
  localeId?: string;
  intentId?: string;
  sampleUtterances?: Record<string, unknown>[];
};

/** Result of get_test_execution_artifacts_url. */
export type GetTestExecutionArtifactsUrlResult = {
  runExecutionId?: string;
  downloadArtifactsUrl?: string;
};

/** Result of list_aggregated_utterances. */
export type ListAggregatedUtterancesResult = {
  botId?: string;
  botAliasId?: string;
  botVersion?: string;
  localeId?: string;
  aggregationDuration?: Record<string, unknown>;
  aggregationWindowStartTime?: string;
  aggregationWindowEndTime?: string;
  aggregationLastRefreshedDateTime?: string;
  aggregatedUtterancesSummaries?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_bot_alias_replicas. */
export type ListBotAliasReplicasResult = {
  botId?: string;
  sourceRegion?: string;
  replicaRegion?: string;
  botAliasReplicaSummaries?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_bot_aliases. */
export type ListBotAliasesResult = {
  botAliasSummaries?: Record<string, unknown>[];
  nextToken?: string;
  botId?: string;
};

/** Result of list_bot_locales. */
export type ListBotLocalesResult = {
  botId?: string;
  botVersion?: string;
  nextToken?: string;
  botLocaleSummaries?: Record<string, unknown>[];
};

/** Result of list_bot_recommendations. */
export type ListBotRecommendationsResult = {
  botId?: string;
  botVersion?: string;
  localeId?: string;
  botRecommendationSummaries?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_bot_replicas. */
export type ListBotReplicasResult = {
  botId?: string;
  sourceRegion?: string;
  botReplicaSummaries?: Record<string, unknown>[];
};

/** Result of list_bot_resource_generations. */
export type ListBotResourceGenerationsResult = {
  botId?: string;
  botVersion?: string;
  localeId?: string;
  generationSummaries?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_bot_version_replicas. */
export type ListBotVersionReplicasResult = {
  botId?: string;
  sourceRegion?: string;
  replicaRegion?: string;
  botVersionReplicaSummaries?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_bot_versions. */
export type ListBotVersionsResult = {
  botId?: string;
  botVersionSummaries?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_built_in_intents. */
export type ListBuiltInIntentsResult = {
  builtInIntentSummaries?: Record<string, unknown>[];
  nextToken?: string;
  localeId?: string;
};

/** Result of list_built_in_slot_types. */
export type ListBuiltInSlotTypesResult = {
  builtInSlotTypeSummaries?: Record<string, unknown>[];
  nextToken?: string;
  localeId?: string;
};

/** Result of list_custom_vocabulary_items. */
export type ListCustomVocabularyItemsResult = {
  botId?: string;
  botVersion?: string;
  localeId?: string;
  customVocabularyItems?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_exports. */
export type ListExportsResult = {
  botId?: string;
  botVersion?: string;
  exportSummaries?: Record<string, unknown>[];
  nextToken?: string;
  localeId?: string;
};

/** Result of list_imports. */
export type ListImportsResult = {
  botId?: string;
  botVersion?: string;
  importSummaries?: Record<string, unknown>[];
  nextToken?: string;
  localeId?: string;
};

/** Result of list_intent_metrics. */
export type ListIntentMetricsResult = {
  botId?: string;
  results?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_intent_paths. */
export type ListIntentPathsResult = {
  nodeSummaries?: Record<string, unknown>[];
};

/** Result of list_intent_stage_metrics. */
export type ListIntentStageMetricsResult = {
  botId?: string;
  results?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_recommended_intents. */
export type ListRecommendedIntentsResult = {
  botId?: string;
  botVersion?: string;
  localeId?: string;
  botRecommendationId?: string;
  summaryList?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_session_analytics_data. */
export type ListSessionAnalyticsDataResult = {
  botId?: string;
  nextToken?: string;
  sessions?: Record<string, unknown>[];
};

/** Result of list_session_metrics. */
export type ListSessionMetricsResult = {
  botId?: string;
  results?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_slot_types. */
export type ListSlotTypesResult = {
  botId?: string;
  botVersion?: string;
  localeId?: string;
  slotTypeSummaries?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_slots. */
export type ListSlotsResult = {
  botId?: string;
  botVersion?: string;
  localeId?: string;
  intentId?: string;
  slotSummaries?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_tags_for_resource. */
export type ListTagsForResourceResult = {
  tags?: Record<string, unknown>;
};

/** Result of list_test_execution_result_items. */
export type ListTestExecutionResultItemsResult = {
  runExecutionResults?: Record<string, unknown>;
  nextToken?: string;
};

/** Result of list_test_executions. */
export type ListTestExecutionsResult = {
  runExecutions?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_test_set_records. */
export type ListTestSetRecordsResult = {
  runSetRecords?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_test_sets. */
export type ListTestSetsResult = {
  runSets?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_utterance_analytics_data. */
export type ListUtteranceAnalyticsDataResult = {
  botId?: string;
  nextToken?: string;
  utterances?: Record<string, unknown>[];
};

/** Result of list_utterance_metrics. */
export type ListUtteranceMetricsResult = {
  botId?: string;
  results?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of search_associated_transcripts. */
export type SearchAssociatedTranscriptsResult = {
  botId?: string;
  botVersion?: string;
  localeId?: string;
  botRecommendationId?: string;
  nextIndex?: number;
  associatedTranscripts?: Record<string, unknown>[];
  totalResults?: number;
};

/** Result of start_bot_recommendation. */
export type StartBotRecommendationResult = {
  botId?: string;
  botVersion?: string;
  localeId?: string;
  botRecommendationStatus?: string;
  botRecommendationId?: string;
  creationDateTime?: string;
  transcriptSourceSetting?: Record<string, unknown>;
  encryptionSetting?: Record<string, unknown>;
};

/** Result of start_bot_resource_generation. */
export type StartBotResourceGenerationResult = {
  generationInputPrompt?: string;
  generationId?: string;
  botId?: string;
  botVersion?: string;
  localeId?: string;
  generationStatus?: string;
  creationDateTime?: string;
};

/** Result of start_import. */
export type StartImportResult = {
  importId?: string;
  resourceSpecification?: Record<string, unknown>;
  mergeStrategy?: string;
  importStatus?: string;
  creationDateTime?: string;
};

/** Result of start_test_execution. */
export type StartTestExecutionResult = {
  runExecutionId?: string;
  creationDateTime?: string;
  runSetId?: string;
  target?: Record<string, unknown>;
  apiMode?: string;
  runExecutionModality?: string;
};

/** Result of start_test_set_generation. */
export type StartTestSetGenerationResult = {
  runSetGenerationId?: string;
  creationDateTime?: string;
  runSetGenerationStatus?: string;
  runSetName?: string;
  description?: string;
  storageLocation?: Record<string, unknown>;
  generationDataSource?: Record<string, unknown>;
  roleArn?: string;
  runSetTags?: Record<string, unknown>;
};

/** Result of stop_bot_recommendation. */
export type StopBotRecommendationResult = {
  botId?: string;
  botVersion?: string;
  localeId?: string;
  botRecommendationStatus?: string;
  botRecommendationId?: string;
};

/** Result of update_bot. */
export type UpdateBotResult = {
  botId?: string;
  botName?: string;
  description?: string;
  roleArn?: string;
  dataPrivacy?: Record<string, unknown>;
  idleSessionTtlInSeconds?: number;
  botStatus?: string;
  creationDateTime?: string;
  lastUpdatedDateTime?: string;
  botType?: string;
  botMembers?: Record<string, unknown>[];
  errorLogSettings?: Record<string, unknown>;
};

/** Result of update_bot_alias. */
export type UpdateBotAliasResult = {
  botAliasId?: string;
  botAliasName?: string;
  description?: string;
  botVersion?: string;
  botAliasLocaleSettings?: Record<string, unknown>;
  conversationLogSettings?: Record<string, unknown>;
  sentimentAnalysisSettings?: Record<string, unknown>;
  botAliasStatus?: string;
  botId?: string;
  creationDateTime?: string;
  lastUpdatedDateTime?: string;
};

/** Result of update_bot_locale. */
export type UpdateBotLocaleResult = {
  botId?: string;
  botVersion?: string;
  localeId?: string;
  localeName?: string;
  description?: string;
  nluIntentConfidenceThreshold?: number;
  voiceSettings?: Record<string, unknown>;
  botLocaleStatus?: string;
  failureReasons?: string[];
  creationDateTime?: string;
  lastUpdatedDateTime?: string;
  recommendedActions?: string[];
  generativeAiSettings?: Record<string, unknown>;
};

/** Result of update_bot_recommendation. */
export type UpdateBotRecommendationResult = {
  botId?: string;
  botVersion?: string;
  localeId?: string;
  botRecommendationStatus?: string;
  botRecommendationId?: string;
  creationDateTime?: string;
  lastUpdatedDateTime?: string;
  transcriptSourceSetting?: Record<string, unknown>;
  encryptionSetting?: Record<string, unknown>;
};

/** Result of update_export. */
export type UpdateExportResult = {
  exportId?: string;
  resourceSpecification?: Record<string, unknown>;
  fileFormat?: string;
  exportStatus?: string;
  creationDateTime?: string;
  lastUpdatedDateTime?: string;
};

/** Result of update_intent. */
export type UpdateIntentResult = {
  intentId?: string;
  intentName?: string;
  description?: string;
  parentIntentSignature?: string;
  sampleUtterances?: Record<string, unknown>[];
  dialogCodeHook?: Record<string, unknown>;
  fulfillmentCodeHook?: Record<string, unknown>;
  slotPriorities?: Record<string, unknown>[];
  intentConfirmationSetting?: Record<string, unknown>;
  intentClosingSetting?: Record<string, unknown>;
  inputContexts?: Record<string, unknown>[];
  outputContexts?: Record<string, unknown>[];
  kendraConfiguration?: Record<string, unknown>;
  botId?: string;
  botVersion?: string;
  localeId?: string;
  creationDateTime?: string;
  lastUpdatedDateTime?: string;
  initialResponseSetting?: Record<string, unknown>;
  qnAIntentConfiguration?: Record<string, unknown>;
  qInConnectIntentConfiguration?: Record<string, unknown>;
};

/** Result of update_resource_policy. */
export type UpdateResourcePolicyResult = {
  resourceArn?: string;
  revisionId?: string;
};

/** Result of update_slot. */
export type UpdateSlotResult = {
  slotId?: string;
  slotName?: string;
  description?: string;
  slotTypeId?: string;
  valueElicitationSetting?: Record<string, unknown>;
  obfuscationSetting?: Record<string, unknown>;
  botId?: string;
  botVersion?: string;
  localeId?: string;
  intentId?: string;
  creationDateTime?: string;
  lastUpdatedDateTime?: string;
  multipleValuesSetting?: Record<string, unknown>;
  subSlotSetting?: Record<string, unknown>;
};

/** Result of update_slot_type. */
export type UpdateSlotTypeResult = {
  slotTypeId?: string;
  slotTypeName?: string;
  description?: string;
  slotTypeValues?: Record<string, unknown>[];
  valueSelectionSetting?: Record<string, unknown>;
  parentSlotTypeSignature?: string;
  botId?: string;
  botVersion?: string;
  localeId?: string;
  creationDateTime?: string;
  lastUpdatedDateTime?: string;
  externalSourceSetting?: Record<string, unknown>;
  compositeSlotTypeSetting?: Record<string, unknown>;
};

/** Result of update_test_set. */
export type UpdateTestSetResult = {
  runSetId?: string;
  runSetName?: string;
  description?: string;
  modality?: string;
  status?: string;
  roleArn?: string;
  numTurns?: number;
  storageLocation?: Record<string, unknown>;
  creationDateTime?: string;
  lastUpdatedDateTime?: string;
};

/** Create a new Lex V2 bot. */
export async function createBot(botName: string, roleArn: string, dataPrivacyChildDirected: boolean, idleSessionTtl: number, description: string, botType: string, regionName?: string): Promise<Record<string, unknown>> {
  try {
    // TODO: implement create_bot
    throw new Error("create_bot not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_bot failed");
  }
}

/** Describe a Lex V2 bot. */
export async function describeBot(botId: string, regionName?: string): Promise<Record<string, unknown>> {
  try {
    // TODO: implement describe_bot
    throw new Error("describe_bot not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_bot failed");
  }
}

/** List all Lex V2 bots. */
export async function listBots(regionName?: string): Promise<BotSummary[]> {
  try {
    // TODO: implement list_bots
    throw new Error("list_bots not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_bots failed");
  }
}

/** Delete a Lex V2 bot. */
export async function deleteBot(botId: string, skipResourceInUseCheck: boolean, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_bot
    throw new Error("delete_bot not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_bot failed");
  }
}

/** Create a new intent for a Lex V2 bot. */
export async function createIntent(botId: string, botVersion: string, localeId: string, intentName: string, description: string, sampleUtterances?: string[], regionName?: string): Promise<Record<string, unknown>> {
  try {
    // TODO: implement create_intent
    throw new Error("create_intent not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_intent failed");
  }
}

/** Describe an intent. */
export async function describeIntent(botId: string, botVersion: string, localeId: string, intentId: string, regionName?: string): Promise<Record<string, unknown>> {
  try {
    // TODO: implement describe_intent
    throw new Error("describe_intent not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_intent failed");
  }
}

/** List intents for a Lex V2 bot locale. */
export async function listIntents(botId: string, botVersion: string, localeId: string, regionName?: string): Promise<IntentSummary[]> {
  try {
    // TODO: implement list_intents
    throw new Error("list_intents not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_intents failed");
  }
}

/** Delete an intent from a Lex V2 bot. */
export async function deleteIntent(botId: string, botVersion: string, localeId: string, intentId: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_intent
    throw new Error("delete_intent not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_intent failed");
  }
}

/** Create a slot type for a Lex V2 bot locale. */
export async function createSlotType(botId: string, botVersion: string, localeId: string, slotTypeName: string, valueSelectionSetting?: Record<string, unknown>, slotTypeValues?: Record<string, unknown>[], description: string, regionName?: string): Promise<Record<string, unknown>> {
  try {
    // TODO: implement create_slot_type
    throw new Error("create_slot_type not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_slot_type failed");
  }
}

/** Trigger a build for a Lex V2 bot locale. */
export async function buildBotLocale(botId: string, botVersion: string, localeId: string, regionName?: string): Promise<Record<string, unknown>> {
  try {
    // TODO: implement build_bot_locale
    throw new Error("build_bot_locale not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "build_bot_locale failed");
  }
}

/** Describe a Lex V2 bot locale. */
export async function describeBotLocale(botId: string, botVersion: string, localeId: string, regionName?: string): Promise<BotLocaleInfo> {
  try {
    // TODO: implement describe_bot_locale
    throw new Error("describe_bot_locale not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_bot_locale failed");
  }
}

/** Poll until a bot locale reaches *target_status*. */
export async function waitForBotLocale(botId: string, botVersion: string, localeId: string, targetStatus: string, interval: number, maxWait: number, regionName?: string): Promise<BotLocaleInfo> {
  try {
    // TODO: implement wait_for_bot_locale
    throw new Error("wait_for_bot_locale not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "wait_for_bot_locale failed");
  }
}

/** Batch create custom vocabulary item. */
export async function batchCreateCustomVocabularyItem(botId: string, botVersion: string, localeId: string, customVocabularyItemList: Record<string, unknown>[], regionName?: string): Promise<BatchCreateCustomVocabularyItemResult> {
  try {
    // TODO: implement batch_create_custom_vocabulary_item
    throw new Error("batch_create_custom_vocabulary_item not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_create_custom_vocabulary_item failed");
  }
}

/** Batch delete custom vocabulary item. */
export async function batchDeleteCustomVocabularyItem(botId: string, botVersion: string, localeId: string, customVocabularyItemList: Record<string, unknown>[], regionName?: string): Promise<BatchDeleteCustomVocabularyItemResult> {
  try {
    // TODO: implement batch_delete_custom_vocabulary_item
    throw new Error("batch_delete_custom_vocabulary_item not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_delete_custom_vocabulary_item failed");
  }
}

/** Batch update custom vocabulary item. */
export async function batchUpdateCustomVocabularyItem(botId: string, botVersion: string, localeId: string, customVocabularyItemList: Record<string, unknown>[], regionName?: string): Promise<BatchUpdateCustomVocabularyItemResult> {
  try {
    // TODO: implement batch_update_custom_vocabulary_item
    throw new Error("batch_update_custom_vocabulary_item not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_update_custom_vocabulary_item failed");
  }
}

/** Create bot alias. */
export async function createBotAlias(botAliasName: string, botId: string): Promise<CreateBotAliasResult> {
  try {
    // TODO: implement create_bot_alias
    throw new Error("create_bot_alias not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_bot_alias failed");
  }
}

/** Create bot locale. */
export async function createBotLocale(botId: string, botVersion: string, localeId: string, nluIntentConfidenceThreshold: number): Promise<CreateBotLocaleResult> {
  try {
    // TODO: implement create_bot_locale
    throw new Error("create_bot_locale not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_bot_locale failed");
  }
}

/** Create bot replica. */
export async function createBotReplica(botId: string, replicaRegion: string, regionName?: string): Promise<CreateBotReplicaResult> {
  try {
    // TODO: implement create_bot_replica
    throw new Error("create_bot_replica not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_bot_replica failed");
  }
}

/** Create bot version. */
export async function createBotVersion(botId: string, botVersionLocaleSpecification: Record<string, unknown>): Promise<CreateBotVersionResult> {
  try {
    // TODO: implement create_bot_version
    throw new Error("create_bot_version not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_bot_version failed");
  }
}

/** Create export. */
export async function createExport(resourceSpecification: Record<string, unknown>, fileFormat: string): Promise<CreateExportResult> {
  try {
    // TODO: implement create_export
    throw new Error("create_export not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_export failed");
  }
}

/** Create resource policy. */
export async function createResourcePolicy(resourceArn: string, policy: string, regionName?: string): Promise<CreateResourcePolicyResult> {
  try {
    // TODO: implement create_resource_policy
    throw new Error("create_resource_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_resource_policy failed");
  }
}

/** Create resource policy statement. */
export async function createResourcePolicyStatement(resourceArn: string, statementId: string, effect: string, principal: Record<string, unknown>[], action: string[]): Promise<CreateResourcePolicyStatementResult> {
  try {
    // TODO: implement create_resource_policy_statement
    throw new Error("create_resource_policy_statement not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_resource_policy_statement failed");
  }
}

/** Create slot. */
export async function createSlot(slotName: string, valueElicitationSetting: Record<string, unknown>, botId: string, botVersion: string, localeId: string, intentId: string): Promise<CreateSlotResult> {
  try {
    // TODO: implement create_slot
    throw new Error("create_slot not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_slot failed");
  }
}

/** Create test set discrepancy report. */
export async function createTestSetDiscrepancyReport(runSetId: string, target: Record<string, unknown>, regionName?: string): Promise<CreateTestSetDiscrepancyReportResult> {
  try {
    // TODO: implement create_test_set_discrepancy_report
    throw new Error("create_test_set_discrepancy_report not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_test_set_discrepancy_report failed");
  }
}

/** Create upload url. */
export async function createUploadUrl(regionName?: string): Promise<CreateUploadUrlResult> {
  try {
    // TODO: implement create_upload_url
    throw new Error("create_upload_url not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_upload_url failed");
  }
}

/** Delete bot alias. */
export async function deleteBotAlias(botAliasId: string, botId: string): Promise<DeleteBotAliasResult> {
  try {
    // TODO: implement delete_bot_alias
    throw new Error("delete_bot_alias not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_bot_alias failed");
  }
}

/** Delete bot locale. */
export async function deleteBotLocale(botId: string, botVersion: string, localeId: string, regionName?: string): Promise<DeleteBotLocaleResult> {
  try {
    // TODO: implement delete_bot_locale
    throw new Error("delete_bot_locale not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_bot_locale failed");
  }
}

/** Delete bot replica. */
export async function deleteBotReplica(botId: string, replicaRegion: string, regionName?: string): Promise<DeleteBotReplicaResult> {
  try {
    // TODO: implement delete_bot_replica
    throw new Error("delete_bot_replica not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_bot_replica failed");
  }
}

/** Delete bot version. */
export async function deleteBotVersion(botId: string, botVersion: string): Promise<DeleteBotVersionResult> {
  try {
    // TODO: implement delete_bot_version
    throw new Error("delete_bot_version not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_bot_version failed");
  }
}

/** Delete custom vocabulary. */
export async function deleteCustomVocabulary(botId: string, botVersion: string, localeId: string, regionName?: string): Promise<DeleteCustomVocabularyResult> {
  try {
    // TODO: implement delete_custom_vocabulary
    throw new Error("delete_custom_vocabulary not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_custom_vocabulary failed");
  }
}

/** Delete export. */
export async function deleteExport(exportId: string, regionName?: string): Promise<DeleteExportResult> {
  try {
    // TODO: implement delete_export
    throw new Error("delete_export not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_export failed");
  }
}

/** Delete import. */
export async function deleteImport(importId: string, regionName?: string): Promise<DeleteImportResult> {
  try {
    // TODO: implement delete_import
    throw new Error("delete_import not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_import failed");
  }
}

/** Delete resource policy. */
export async function deleteResourcePolicy(resourceArn: string): Promise<DeleteResourcePolicyResult> {
  try {
    // TODO: implement delete_resource_policy
    throw new Error("delete_resource_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_resource_policy failed");
  }
}

/** Delete resource policy statement. */
export async function deleteResourcePolicyStatement(resourceArn: string, statementId: string): Promise<DeleteResourcePolicyStatementResult> {
  try {
    // TODO: implement delete_resource_policy_statement
    throw new Error("delete_resource_policy_statement not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_resource_policy_statement failed");
  }
}

/** Delete slot. */
export async function deleteSlot(slotId: string, botId: string, botVersion: string, localeId: string, intentId: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_slot
    throw new Error("delete_slot not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_slot failed");
  }
}

/** Delete slot type. */
export async function deleteSlotType(slotTypeId: string, botId: string, botVersion: string, localeId: string): Promise<void> {
  try {
    // TODO: implement delete_slot_type
    throw new Error("delete_slot_type not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_slot_type failed");
  }
}

/** Delete test set. */
export async function deleteTestSet(runSetId: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_test_set
    throw new Error("delete_test_set not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_test_set failed");
  }
}

/** Delete utterances. */
export async function deleteUtterances(botId: string): Promise<void> {
  try {
    // TODO: implement delete_utterances
    throw new Error("delete_utterances not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_utterances failed");
  }
}

/** Describe bot alias. */
export async function describeBotAlias(botAliasId: string, botId: string, regionName?: string): Promise<DescribeBotAliasResult> {
  try {
    // TODO: implement describe_bot_alias
    throw new Error("describe_bot_alias not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_bot_alias failed");
  }
}

/** Describe bot recommendation. */
export async function describeBotRecommendation(botId: string, botVersion: string, localeId: string, botRecommendationId: string, regionName?: string): Promise<DescribeBotRecommendationResult> {
  try {
    // TODO: implement describe_bot_recommendation
    throw new Error("describe_bot_recommendation not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_bot_recommendation failed");
  }
}

/** Describe bot replica. */
export async function describeBotReplica(botId: string, replicaRegion: string, regionName?: string): Promise<DescribeBotReplicaResult> {
  try {
    // TODO: implement describe_bot_replica
    throw new Error("describe_bot_replica not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_bot_replica failed");
  }
}

/** Describe bot resource generation. */
export async function describeBotResourceGeneration(botId: string, botVersion: string, localeId: string, generationId: string, regionName?: string): Promise<DescribeBotResourceGenerationResult> {
  try {
    // TODO: implement describe_bot_resource_generation
    throw new Error("describe_bot_resource_generation not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_bot_resource_generation failed");
  }
}

/** Describe bot version. */
export async function describeBotVersion(botId: string, botVersion: string, regionName?: string): Promise<DescribeBotVersionResult> {
  try {
    // TODO: implement describe_bot_version
    throw new Error("describe_bot_version not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_bot_version failed");
  }
}

/** Describe custom vocabulary metadata. */
export async function describeCustomVocabularyMetadata(botId: string, botVersion: string, localeId: string, regionName?: string): Promise<DescribeCustomVocabularyMetadataResult> {
  try {
    // TODO: implement describe_custom_vocabulary_metadata
    throw new Error("describe_custom_vocabulary_metadata not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_custom_vocabulary_metadata failed");
  }
}

/** Describe export. */
export async function describeExport(exportId: string, regionName?: string): Promise<DescribeExportResult> {
  try {
    // TODO: implement describe_export
    throw new Error("describe_export not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_export failed");
  }
}

/** Describe import. */
export async function describeImport(importId: string, regionName?: string): Promise<DescribeImportResult> {
  try {
    // TODO: implement describe_import
    throw new Error("describe_import not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_import failed");
  }
}

/** Describe resource policy. */
export async function describeResourcePolicy(resourceArn: string, regionName?: string): Promise<DescribeResourcePolicyResult> {
  try {
    // TODO: implement describe_resource_policy
    throw new Error("describe_resource_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_resource_policy failed");
  }
}

/** Describe slot. */
export async function describeSlot(slotId: string, botId: string, botVersion: string, localeId: string, intentId: string, regionName?: string): Promise<DescribeSlotResult> {
  try {
    // TODO: implement describe_slot
    throw new Error("describe_slot not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_slot failed");
  }
}

/** Describe slot type. */
export async function describeSlotType(slotTypeId: string, botId: string, botVersion: string, localeId: string, regionName?: string): Promise<DescribeSlotTypeResult> {
  try {
    // TODO: implement describe_slot_type
    throw new Error("describe_slot_type not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_slot_type failed");
  }
}

/** Describe test execution. */
export async function describeTestExecution(runExecutionId: string, regionName?: string): Promise<DescribeTestExecutionResult> {
  try {
    // TODO: implement describe_test_execution
    throw new Error("describe_test_execution not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_test_execution failed");
  }
}

/** Describe test set. */
export async function describeTestSet(runSetId: string, regionName?: string): Promise<DescribeTestSetResult> {
  try {
    // TODO: implement describe_test_set
    throw new Error("describe_test_set not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_test_set failed");
  }
}

/** Describe test set discrepancy report. */
export async function describeTestSetDiscrepancyReport(runSetDiscrepancyReportId: string, regionName?: string): Promise<DescribeTestSetDiscrepancyReportResult> {
  try {
    // TODO: implement describe_test_set_discrepancy_report
    throw new Error("describe_test_set_discrepancy_report not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_test_set_discrepancy_report failed");
  }
}

/** Describe test set generation. */
export async function describeTestSetGeneration(runSetGenerationId: string, regionName?: string): Promise<DescribeTestSetGenerationResult> {
  try {
    // TODO: implement describe_test_set_generation
    throw new Error("describe_test_set_generation not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_test_set_generation failed");
  }
}

/** Generate bot element. */
export async function generateBotElement(intentId: string, botId: string, botVersion: string, localeId: string, regionName?: string): Promise<GenerateBotElementResult> {
  try {
    // TODO: implement generate_bot_element
    throw new Error("generate_bot_element not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "generate_bot_element failed");
  }
}

/** Get test execution artifacts url. */
export async function getTestExecutionArtifactsUrl(runExecutionId: string, regionName?: string): Promise<GetTestExecutionArtifactsUrlResult> {
  try {
    // TODO: implement get_test_execution_artifacts_url
    throw new Error("get_test_execution_artifacts_url not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_test_execution_artifacts_url failed");
  }
}

/** List aggregated utterances. */
export async function listAggregatedUtterances(botId: string, localeId: string, aggregationDuration: Record<string, unknown>): Promise<ListAggregatedUtterancesResult> {
  try {
    // TODO: implement list_aggregated_utterances
    throw new Error("list_aggregated_utterances not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_aggregated_utterances failed");
  }
}

/** List bot alias replicas. */
export async function listBotAliasReplicas(botId: string, replicaRegion: string): Promise<ListBotAliasReplicasResult> {
  try {
    // TODO: implement list_bot_alias_replicas
    throw new Error("list_bot_alias_replicas not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_bot_alias_replicas failed");
  }
}

/** List bot aliases. */
export async function listBotAliases(botId: string): Promise<ListBotAliasesResult> {
  try {
    // TODO: implement list_bot_aliases
    throw new Error("list_bot_aliases not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_bot_aliases failed");
  }
}

/** List bot locales. */
export async function listBotLocales(botId: string, botVersion: string): Promise<ListBotLocalesResult> {
  try {
    // TODO: implement list_bot_locales
    throw new Error("list_bot_locales not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_bot_locales failed");
  }
}

/** List bot recommendations. */
export async function listBotRecommendations(botId: string, botVersion: string, localeId: string): Promise<ListBotRecommendationsResult> {
  try {
    // TODO: implement list_bot_recommendations
    throw new Error("list_bot_recommendations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_bot_recommendations failed");
  }
}

/** List bot replicas. */
export async function listBotReplicas(botId: string, regionName?: string): Promise<ListBotReplicasResult> {
  try {
    // TODO: implement list_bot_replicas
    throw new Error("list_bot_replicas not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_bot_replicas failed");
  }
}

/** List bot resource generations. */
export async function listBotResourceGenerations(botId: string, botVersion: string, localeId: string): Promise<ListBotResourceGenerationsResult> {
  try {
    // TODO: implement list_bot_resource_generations
    throw new Error("list_bot_resource_generations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_bot_resource_generations failed");
  }
}

/** List bot version replicas. */
export async function listBotVersionReplicas(botId: string, replicaRegion: string): Promise<ListBotVersionReplicasResult> {
  try {
    // TODO: implement list_bot_version_replicas
    throw new Error("list_bot_version_replicas not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_bot_version_replicas failed");
  }
}

/** List bot versions. */
export async function listBotVersions(botId: string): Promise<ListBotVersionsResult> {
  try {
    // TODO: implement list_bot_versions
    throw new Error("list_bot_versions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_bot_versions failed");
  }
}

/** List built in intents. */
export async function listBuiltInIntents(localeId: string): Promise<ListBuiltInIntentsResult> {
  try {
    // TODO: implement list_built_in_intents
    throw new Error("list_built_in_intents not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_built_in_intents failed");
  }
}

/** List built in slot types. */
export async function listBuiltInSlotTypes(localeId: string): Promise<ListBuiltInSlotTypesResult> {
  try {
    // TODO: implement list_built_in_slot_types
    throw new Error("list_built_in_slot_types not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_built_in_slot_types failed");
  }
}

/** List custom vocabulary items. */
export async function listCustomVocabularyItems(botId: string, botVersion: string, localeId: string): Promise<ListCustomVocabularyItemsResult> {
  try {
    // TODO: implement list_custom_vocabulary_items
    throw new Error("list_custom_vocabulary_items not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_custom_vocabulary_items failed");
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

/** List imports. */
export async function listImports(): Promise<ListImportsResult> {
  try {
    // TODO: implement list_imports
    throw new Error("list_imports not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_imports failed");
  }
}

/** List intent metrics. */
export async function listIntentMetrics(botId: string, startDateTime: string, endDateTime: string, metrics: Record<string, unknown>[]): Promise<ListIntentMetricsResult> {
  try {
    // TODO: implement list_intent_metrics
    throw new Error("list_intent_metrics not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_intent_metrics failed");
  }
}

/** List intent paths. */
export async function listIntentPaths(botId: string, startDateTime: string, endDateTime: string, intentPath: string): Promise<ListIntentPathsResult> {
  try {
    // TODO: implement list_intent_paths
    throw new Error("list_intent_paths not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_intent_paths failed");
  }
}

/** List intent stage metrics. */
export async function listIntentStageMetrics(botId: string, startDateTime: string, endDateTime: string, metrics: Record<string, unknown>[]): Promise<ListIntentStageMetricsResult> {
  try {
    // TODO: implement list_intent_stage_metrics
    throw new Error("list_intent_stage_metrics not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_intent_stage_metrics failed");
  }
}

/** List recommended intents. */
export async function listRecommendedIntents(botId: string, botVersion: string, localeId: string, botRecommendationId: string): Promise<ListRecommendedIntentsResult> {
  try {
    // TODO: implement list_recommended_intents
    throw new Error("list_recommended_intents not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_recommended_intents failed");
  }
}

/** List session analytics data. */
export async function listSessionAnalyticsData(botId: string, startDateTime: string, endDateTime: string): Promise<ListSessionAnalyticsDataResult> {
  try {
    // TODO: implement list_session_analytics_data
    throw new Error("list_session_analytics_data not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_session_analytics_data failed");
  }
}

/** List session metrics. */
export async function listSessionMetrics(botId: string, startDateTime: string, endDateTime: string, metrics: Record<string, unknown>[]): Promise<ListSessionMetricsResult> {
  try {
    // TODO: implement list_session_metrics
    throw new Error("list_session_metrics not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_session_metrics failed");
  }
}

/** List slot types. */
export async function listSlotTypes(botId: string, botVersion: string, localeId: string): Promise<ListSlotTypesResult> {
  try {
    // TODO: implement list_slot_types
    throw new Error("list_slot_types not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_slot_types failed");
  }
}

/** List slots. */
export async function listSlots(botId: string, botVersion: string, localeId: string, intentId: string): Promise<ListSlotsResult> {
  try {
    // TODO: implement list_slots
    throw new Error("list_slots not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_slots failed");
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

/** List test execution result items. */
export async function listTestExecutionResultItems(runExecutionId: string, resultFilterBy: Record<string, unknown>): Promise<ListTestExecutionResultItemsResult> {
  try {
    // TODO: implement list_test_execution_result_items
    throw new Error("list_test_execution_result_items not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_test_execution_result_items failed");
  }
}

/** List test executions. */
export async function listTestExecutions(): Promise<ListTestExecutionsResult> {
  try {
    // TODO: implement list_test_executions
    throw new Error("list_test_executions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_test_executions failed");
  }
}

/** List test set records. */
export async function listTestSetRecords(runSetId: string): Promise<ListTestSetRecordsResult> {
  try {
    // TODO: implement list_test_set_records
    throw new Error("list_test_set_records not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_test_set_records failed");
  }
}

/** List test sets. */
export async function listTestSets(): Promise<ListTestSetsResult> {
  try {
    // TODO: implement list_test_sets
    throw new Error("list_test_sets not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_test_sets failed");
  }
}

/** List utterance analytics data. */
export async function listUtteranceAnalyticsData(botId: string, startDateTime: string, endDateTime: string): Promise<ListUtteranceAnalyticsDataResult> {
  try {
    // TODO: implement list_utterance_analytics_data
    throw new Error("list_utterance_analytics_data not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_utterance_analytics_data failed");
  }
}

/** List utterance metrics. */
export async function listUtteranceMetrics(botId: string, startDateTime: string, endDateTime: string, metrics: Record<string, unknown>[]): Promise<ListUtteranceMetricsResult> {
  try {
    // TODO: implement list_utterance_metrics
    throw new Error("list_utterance_metrics not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_utterance_metrics failed");
  }
}

/** Search associated transcripts. */
export async function searchAssociatedTranscripts(botId: string, botVersion: string, localeId: string, botRecommendationId: string, filters: Record<string, unknown>[]): Promise<SearchAssociatedTranscriptsResult> {
  try {
    // TODO: implement search_associated_transcripts
    throw new Error("search_associated_transcripts not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "search_associated_transcripts failed");
  }
}

/** Start bot recommendation. */
export async function startBotRecommendation(botId: string, botVersion: string, localeId: string, transcriptSourceSetting: Record<string, unknown>): Promise<StartBotRecommendationResult> {
  try {
    // TODO: implement start_bot_recommendation
    throw new Error("start_bot_recommendation not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_bot_recommendation failed");
  }
}

/** Start bot resource generation. */
export async function startBotResourceGeneration(generationInputPrompt: string, botId: string, botVersion: string, localeId: string, regionName?: string): Promise<StartBotResourceGenerationResult> {
  try {
    // TODO: implement start_bot_resource_generation
    throw new Error("start_bot_resource_generation not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_bot_resource_generation failed");
  }
}

/** Start import. */
export async function startImport(importId: string, resourceSpecification: Record<string, unknown>, mergeStrategy: string): Promise<StartImportResult> {
  try {
    // TODO: implement start_import
    throw new Error("start_import not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_import failed");
  }
}

/** Start test execution. */
export async function startTestExecution(runSetId: string, target: Record<string, unknown>, apiMode: string): Promise<StartTestExecutionResult> {
  try {
    // TODO: implement start_test_execution
    throw new Error("start_test_execution not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_test_execution failed");
  }
}

/** Start test set generation. */
export async function startTestSetGeneration(runSetName: string, storageLocation: Record<string, unknown>, generationDataSource: Record<string, unknown>, roleArn: string): Promise<StartTestSetGenerationResult> {
  try {
    // TODO: implement start_test_set_generation
    throw new Error("start_test_set_generation not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_test_set_generation failed");
  }
}

/** Stop bot recommendation. */
export async function stopBotRecommendation(botId: string, botVersion: string, localeId: string, botRecommendationId: string, regionName?: string): Promise<StopBotRecommendationResult> {
  try {
    // TODO: implement stop_bot_recommendation
    throw new Error("stop_bot_recommendation not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "stop_bot_recommendation failed");
  }
}

/** Tag resource. */
export async function tagResource(resourceArn: string, tags: Record<string, unknown>, regionName?: string): Promise<void> {
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

/** Update bot. */
export async function updateBot(botId: string, botName: string, roleArn: string, dataPrivacy: Record<string, unknown>, idleSessionTtlInSeconds: number): Promise<UpdateBotResult> {
  try {
    // TODO: implement update_bot
    throw new Error("update_bot not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_bot failed");
  }
}

/** Update bot alias. */
export async function updateBotAlias(botAliasId: string, botAliasName: string, botId: string): Promise<UpdateBotAliasResult> {
  try {
    // TODO: implement update_bot_alias
    throw new Error("update_bot_alias not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_bot_alias failed");
  }
}

/** Update bot locale. */
export async function updateBotLocale(botId: string, botVersion: string, localeId: string, nluIntentConfidenceThreshold: number): Promise<UpdateBotLocaleResult> {
  try {
    // TODO: implement update_bot_locale
    throw new Error("update_bot_locale not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_bot_locale failed");
  }
}

/** Update bot recommendation. */
export async function updateBotRecommendation(botId: string, botVersion: string, localeId: string, botRecommendationId: string, encryptionSetting: Record<string, unknown>, regionName?: string): Promise<UpdateBotRecommendationResult> {
  try {
    // TODO: implement update_bot_recommendation
    throw new Error("update_bot_recommendation not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_bot_recommendation failed");
  }
}

/** Update export. */
export async function updateExport(exportId: string): Promise<UpdateExportResult> {
  try {
    // TODO: implement update_export
    throw new Error("update_export not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_export failed");
  }
}

/** Update intent. */
export async function updateIntent(intentId: string, intentName: string, botId: string, botVersion: string, localeId: string): Promise<UpdateIntentResult> {
  try {
    // TODO: implement update_intent
    throw new Error("update_intent not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_intent failed");
  }
}

/** Update resource policy. */
export async function updateResourcePolicy(resourceArn: string, policy: string): Promise<UpdateResourcePolicyResult> {
  try {
    // TODO: implement update_resource_policy
    throw new Error("update_resource_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_resource_policy failed");
  }
}

/** Update slot. */
export async function updateSlot(slotId: string, slotName: string, valueElicitationSetting: Record<string, unknown>, botId: string, botVersion: string, localeId: string, intentId: string): Promise<UpdateSlotResult> {
  try {
    // TODO: implement update_slot
    throw new Error("update_slot not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_slot failed");
  }
}

/** Update slot type. */
export async function updateSlotType(slotTypeId: string, slotTypeName: string, botId: string, botVersion: string, localeId: string): Promise<UpdateSlotTypeResult> {
  try {
    // TODO: implement update_slot_type
    throw new Error("update_slot_type not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_slot_type failed");
  }
}

/** Update test set. */
export async function updateTestSet(runSetId: string, runSetName: string): Promise<UpdateTestSetResult> {
  try {
    // TODO: implement update_test_set
    throw new Error("update_test_set not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_test_set failed");
  }
}
