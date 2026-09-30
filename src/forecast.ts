import { ForecastClient } from "@aws-sdk/client-forecast";
import { getClient } from "./client";
import { wrapAwsError } from "./exceptions";

/** Metadata for an Amazon Forecast dataset. */
export type DatasetResult = {
  datasetArn: string;
  datasetName?: string;
  domain?: string;
  datasetType?: string;
  dataFrequency?: string;
  status?: string;
  extra?: Record<string, unknown>;
};

/** Metadata for an Amazon Forecast dataset group. */
export type DatasetGroupResult = {
  datasetGroupArn: string;
  datasetGroupName?: string;
  domain?: string;
  datasetArns?: string[];
  status?: string;
  extra?: Record<string, unknown>;
};

/** Metadata for a dataset import job. */
export type DatasetImportJobResult = {
  datasetImportJobArn: string;
  datasetImportJobName?: string;
  datasetArn?: string;
  status?: string;
  message?: string;
  extra?: Record<string, unknown>;
};

/** Metadata for an Amazon Forecast predictor. */
export type PredictorResult = {
  predictorArn: string;
  predictorName?: string;
  forecastHorizon?: number;
  status?: string;
  message?: string;
  extra?: Record<string, unknown>;
};

/** Metadata for an Amazon Forecast forecast. */
export type ForecastResult = {
  forecastArn: string;
  forecastName?: string;
  predictorArn?: string;
  datasetGroupArn?: string;
  status?: string;
  message?: string;
  extra?: Record<string, unknown>;
};

/** Metadata for a forecast export job. */
export type ForecastExportJobResult = {
  forecastExportJobArn: string;
  forecastExportJobName?: string;
  forecastArn?: string;
  status?: string;
  message?: string;
  extra?: Record<string, unknown>;
};

/** Result of create_auto_predictor. */
export type CreateAutoPredictorResult = {
  predictorArn?: string;
};

/** Result of create_explainability. */
export type CreateExplainabilityResult = {
  explainabilityArn?: string;
};

/** Result of create_explainability_export. */
export type CreateExplainabilityExportResult = {
  explainabilityExportArn?: string;
};

/** Result of create_monitor. */
export type CreateMonitorResult = {
  monitorArn?: string;
};

/** Result of create_predictor_backtest_export_job. */
export type CreatePredictorBacktestExportJobResult = {
  predictorBacktestExportJobArn?: string;
};

/** Result of create_what_if_analysis. */
export type CreateWhatIfAnalysisResult = {
  whatIfAnalysisArn?: string;
};

/** Result of create_what_if_forecast. */
export type CreateWhatIfForecastResult = {
  whatIfForecastArn?: string;
};

/** Result of create_what_if_forecast_export. */
export type CreateWhatIfForecastExportResult = {
  whatIfForecastExportArn?: string;
};

/** Result of describe_auto_predictor. */
export type DescribeAutoPredictorResult = {
  predictorArn?: string;
  predictorName?: string;
  forecastHorizon?: number;
  forecastTypes?: string[];
  forecastFrequency?: string;
  forecastDimensions?: string[];
  datasetImportJobArns?: string[];
  dataConfig?: Record<string, unknown>;
  encryptionConfig?: Record<string, unknown>;
  referencePredictorSummary?: Record<string, unknown>;
  estimatedTimeRemainingInMinutes?: number;
  status?: string;
  message?: string;
  creationTime?: string;
  lastModificationTime?: string;
  optimizationMetric?: string;
  explainabilityInfo?: Record<string, unknown>;
  monitorInfo?: Record<string, unknown>;
  timeAlignmentBoundary?: Record<string, unknown>;
};

/** Result of describe_dataset_group. */
export type DescribeDatasetGroupResult = {
  datasetGroupName?: string;
  datasetGroupArn?: string;
  datasetArns?: string[];
  domain?: string;
  status?: string;
  creationTime?: string;
  lastModificationTime?: string;
};

/** Result of describe_explainability. */
export type DescribeExplainabilityResult = {
  explainabilityArn?: string;
  explainabilityName?: string;
  resourceArn?: string;
  explainabilityConfig?: Record<string, unknown>;
  enableVisualization?: boolean;
  dataSource?: Record<string, unknown>;
  modelSchema?: Record<string, unknown>;
  startDateTime?: string;
  endDateTime?: string;
  estimatedTimeRemainingInMinutes?: number;
  message?: string;
  status?: string;
  creationTime?: string;
  lastModificationTime?: string;
};

/** Result of describe_explainability_export. */
export type DescribeExplainabilityExportResult = {
  explainabilityExportArn?: string;
  explainabilityExportName?: string;
  explainabilityArn?: string;
  destination?: Record<string, unknown>;
  message?: string;
  status?: string;
  creationTime?: string;
  lastModificationTime?: string;
  format?: string;
};

/** Result of describe_monitor. */
export type DescribeMonitorResult = {
  monitorName?: string;
  monitorArn?: string;
  resourceArn?: string;
  status?: string;
  lastEvaluationTime?: string;
  lastEvaluationState?: string;
  baseline?: Record<string, unknown>;
  message?: string;
  creationTime?: string;
  lastModificationTime?: string;
  estimatedEvaluationTimeRemainingInMinutes?: number;
};

/** Result of describe_predictor_backtest_export_job. */
export type DescribePredictorBacktestExportJobResult = {
  predictorBacktestExportJobArn?: string;
  predictorBacktestExportJobName?: string;
  predictorArn?: string;
  destination?: Record<string, unknown>;
  message?: string;
  status?: string;
  creationTime?: string;
  lastModificationTime?: string;
  format?: string;
};

/** Result of describe_what_if_analysis. */
export type DescribeWhatIfAnalysisResult = {
  whatIfAnalysisName?: string;
  whatIfAnalysisArn?: string;
  forecastArn?: string;
  estimatedTimeRemainingInMinutes?: number;
  status?: string;
  message?: string;
  creationTime?: string;
  lastModificationTime?: string;
  timeSeriesSelector?: Record<string, unknown>;
};

/** Result of describe_what_if_forecast. */
export type DescribeWhatIfForecastResult = {
  whatIfForecastName?: string;
  whatIfForecastArn?: string;
  whatIfAnalysisArn?: string;
  estimatedTimeRemainingInMinutes?: number;
  status?: string;
  message?: string;
  creationTime?: string;
  lastModificationTime?: string;
  timeSeriesTransformations?: Record<string, unknown>[];
  timeSeriesReplacementsDataSource?: Record<string, unknown>;
  forecastTypes?: string[];
};

/** Result of describe_what_if_forecast_export. */
export type DescribeWhatIfForecastExportResult = {
  whatIfForecastExportArn?: string;
  whatIfForecastExportName?: string;
  whatIfForecastArns?: string[];
  destination?: Record<string, unknown>;
  message?: string;
  status?: string;
  creationTime?: string;
  estimatedTimeRemainingInMinutes?: number;
  lastModificationTime?: string;
  format?: string;
};

/** Result of get_accuracy_metrics. */
export type GetAccuracyMetricsResult = {
  predictorEvaluationResults?: Record<string, unknown>[];
  isAutoPredictor?: boolean;
  autoMlOverrideStrategy?: string;
  optimizationMetric?: string;
};

/** Result of list_dataset_groups. */
export type ListDatasetGroupsResult = {
  datasetGroups?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_dataset_import_jobs. */
export type ListDatasetImportJobsResult = {
  datasetImportJobs?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_explainabilities. */
export type ListExplainabilitiesResult = {
  explainabilities?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_explainability_exports. */
export type ListExplainabilityExportsResult = {
  explainabilityExports?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_forecast_export_jobs. */
export type ListForecastExportJobsResult = {
  forecastExportJobs?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_monitor_evaluations. */
export type ListMonitorEvaluationsResult = {
  nextToken?: string;
  predictorMonitorEvaluations?: Record<string, unknown>[];
};

/** Result of list_monitors. */
export type ListMonitorsResult = {
  monitors?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_predictor_backtest_export_jobs. */
export type ListPredictorBacktestExportJobsResult = {
  predictorBacktestExportJobs?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_predictors. */
export type ListPredictorsResult = {
  predictors?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_tags_for_resource. */
export type ListTagsForResourceResult = {
  tags?: Record<string, unknown>[];
};

/** Result of list_what_if_analyses. */
export type ListWhatIfAnalysesResult = {
  whatIfAnalyses?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_what_if_forecast_exports. */
export type ListWhatIfForecastExportsResult = {
  whatIfForecastExports?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_what_if_forecasts. */
export type ListWhatIfForecastsResult = {
  whatIfForecasts?: Record<string, unknown>[];
  nextToken?: string;
};

/** Create an Amazon Forecast dataset. */
export async function createDataset(datasetName: string, domain: string, datasetType: string, schema: Record<string, unknown>): Promise<DatasetResult> {
  try {
    // TODO: implement create_dataset
    throw new Error("create_dataset not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_dataset failed");
  }
}

/** Describe an Amazon Forecast dataset. */
export async function describeDataset(datasetArn: string): Promise<DatasetResult> {
  try {
    // TODO: implement describe_dataset
    throw new Error("describe_dataset not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_dataset failed");
  }
}

/** List all Amazon Forecast datasets. */
export async function listDatasets(): Promise<DatasetResult[]> {
  try {
    // TODO: implement list_datasets
    throw new Error("list_datasets not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_datasets failed");
  }
}

/** Create an Amazon Forecast dataset group. */
export async function createDatasetGroup(datasetGroupName: string, domain: string): Promise<DatasetGroupResult> {
  try {
    // TODO: implement create_dataset_group
    throw new Error("create_dataset_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_dataset_group failed");
  }
}

/** Create a dataset import job. */
export async function createDatasetImportJob(datasetImportJobName: string, datasetArn: string, dataSource: Record<string, unknown>): Promise<DatasetImportJobResult> {
  try {
    // TODO: implement create_dataset_import_job
    throw new Error("create_dataset_import_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_dataset_import_job failed");
  }
}

/** Describe a dataset import job. */
export async function describeDatasetImportJob(datasetImportJobArn: string): Promise<DatasetImportJobResult> {
  try {
    // TODO: implement describe_dataset_import_job
    throw new Error("describe_dataset_import_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_dataset_import_job failed");
  }
}

/** Create an Amazon Forecast predictor. */
export async function createPredictor(predictorName: string, forecastHorizon: number): Promise<PredictorResult> {
  try {
    // TODO: implement create_predictor
    throw new Error("create_predictor not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_predictor failed");
  }
}

/** Describe an Amazon Forecast predictor. */
export async function describePredictor(predictorArn: string): Promise<PredictorResult> {
  try {
    // TODO: implement describe_predictor
    throw new Error("describe_predictor not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_predictor failed");
  }
}

/** Create an Amazon Forecast forecast. */
export async function createForecast(forecastName: string, predictorArn: string): Promise<ForecastResult> {
  try {
    // TODO: implement create_forecast
    throw new Error("create_forecast not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_forecast failed");
  }
}

/** Describe an Amazon Forecast forecast. */
export async function describeForecast(forecastArn: string): Promise<ForecastResult> {
  try {
    // TODO: implement describe_forecast
    throw new Error("describe_forecast not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_forecast failed");
  }
}

/** Create a forecast export job. */
export async function createForecastExportJob(forecastExportJobName: string, forecastArn: string, destination: Record<string, unknown>): Promise<ForecastExportJobResult> {
  try {
    // TODO: implement create_forecast_export_job
    throw new Error("create_forecast_export_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_forecast_export_job failed");
  }
}

/** Describe a forecast export job. */
export async function describeForecastExportJob(forecastExportJobArn: string): Promise<ForecastExportJobResult> {
  try {
    // TODO: implement describe_forecast_export_job
    throw new Error("describe_forecast_export_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_forecast_export_job failed");
  }
}

/** List all Amazon Forecast forecasts. */
export async function listForecasts(): Promise<ForecastResult[]> {
  try {
    // TODO: implement list_forecasts
    throw new Error("list_forecasts not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_forecasts failed");
  }
}

/** Delete a Forecast resource and all dependent child resources. */
export async function deleteResourceTree(resourceArn: string): Promise<void> {
  try {
    // TODO: implement delete_resource_tree
    throw new Error("delete_resource_tree not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_resource_tree failed");
  }
}

/** Poll until a predictor reaches *target_status*. */
export async function waitForPredictor(predictorArn: string): Promise<PredictorResult> {
  try {
    // TODO: implement wait_for_predictor
    throw new Error("wait_for_predictor not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "wait_for_predictor failed");
  }
}

/** Poll until a forecast reaches *target_status*. */
export async function waitForForecast(forecastArn: string): Promise<ForecastResult> {
  try {
    // TODO: implement wait_for_forecast
    throw new Error("wait_for_forecast not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "wait_for_forecast failed");
  }
}

/** Create auto predictor. */
export async function createAutoPredictor(predictorName: string): Promise<CreateAutoPredictorResult> {
  try {
    // TODO: implement create_auto_predictor
    throw new Error("create_auto_predictor not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_auto_predictor failed");
  }
}

/** Create explainability. */
export async function createExplainability(explainabilityName: string, resourceArn: string, explainabilityConfig: Record<string, unknown>): Promise<CreateExplainabilityResult> {
  try {
    // TODO: implement create_explainability
    throw new Error("create_explainability not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_explainability failed");
  }
}

/** Create explainability export. */
export async function createExplainabilityExport(explainabilityExportName: string, explainabilityArn: string, destination: Record<string, unknown>): Promise<CreateExplainabilityExportResult> {
  try {
    // TODO: implement create_explainability_export
    throw new Error("create_explainability_export not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_explainability_export failed");
  }
}

/** Create monitor. */
export async function createMonitor(monitorName: string, resourceArn: string): Promise<CreateMonitorResult> {
  try {
    // TODO: implement create_monitor
    throw new Error("create_monitor not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_monitor failed");
  }
}

/** Create predictor backtest export job. */
export async function createPredictorBacktestExportJob(predictorBacktestExportJobName: string, predictorArn: string, destination: Record<string, unknown>): Promise<CreatePredictorBacktestExportJobResult> {
  try {
    // TODO: implement create_predictor_backtest_export_job
    throw new Error("create_predictor_backtest_export_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_predictor_backtest_export_job failed");
  }
}

/** Create what if analysis. */
export async function createWhatIfAnalysis(whatIfAnalysisName: string, forecastArn: string): Promise<CreateWhatIfAnalysisResult> {
  try {
    // TODO: implement create_what_if_analysis
    throw new Error("create_what_if_analysis not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_what_if_analysis failed");
  }
}

/** Create what if forecast. */
export async function createWhatIfForecast(whatIfForecastName: string, whatIfAnalysisArn: string): Promise<CreateWhatIfForecastResult> {
  try {
    // TODO: implement create_what_if_forecast
    throw new Error("create_what_if_forecast not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_what_if_forecast failed");
  }
}

/** Create what if forecast export. */
export async function createWhatIfForecastExport(whatIfForecastExportName: string, whatIfForecastArns: string[], destination: Record<string, unknown>): Promise<CreateWhatIfForecastExportResult> {
  try {
    // TODO: implement create_what_if_forecast_export
    throw new Error("create_what_if_forecast_export not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_what_if_forecast_export failed");
  }
}

/** Delete dataset. */
export async function deleteDataset(datasetArn: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_dataset
    throw new Error("delete_dataset not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_dataset failed");
  }
}

/** Delete dataset group. */
export async function deleteDatasetGroup(datasetGroupArn: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_dataset_group
    throw new Error("delete_dataset_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_dataset_group failed");
  }
}

/** Delete dataset import job. */
export async function deleteDatasetImportJob(datasetImportJobArn: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_dataset_import_job
    throw new Error("delete_dataset_import_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_dataset_import_job failed");
  }
}

/** Delete explainability. */
export async function deleteExplainability(explainabilityArn: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_explainability
    throw new Error("delete_explainability not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_explainability failed");
  }
}

/** Delete explainability export. */
export async function deleteExplainabilityExport(explainabilityExportArn: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_explainability_export
    throw new Error("delete_explainability_export not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_explainability_export failed");
  }
}

/** Delete forecast. */
export async function deleteForecast(forecastArn: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_forecast
    throw new Error("delete_forecast not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_forecast failed");
  }
}

/** Delete forecast export job. */
export async function deleteForecastExportJob(forecastExportJobArn: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_forecast_export_job
    throw new Error("delete_forecast_export_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_forecast_export_job failed");
  }
}

/** Delete monitor. */
export async function deleteMonitor(monitorArn: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_monitor
    throw new Error("delete_monitor not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_monitor failed");
  }
}

/** Delete predictor. */
export async function deletePredictor(predictorArn: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_predictor
    throw new Error("delete_predictor not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_predictor failed");
  }
}

/** Delete predictor backtest export job. */
export async function deletePredictorBacktestExportJob(predictorBacktestExportJobArn: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_predictor_backtest_export_job
    throw new Error("delete_predictor_backtest_export_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_predictor_backtest_export_job failed");
  }
}

/** Delete what if analysis. */
export async function deleteWhatIfAnalysis(whatIfAnalysisArn: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_what_if_analysis
    throw new Error("delete_what_if_analysis not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_what_if_analysis failed");
  }
}

/** Delete what if forecast. */
export async function deleteWhatIfForecast(whatIfForecastArn: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_what_if_forecast
    throw new Error("delete_what_if_forecast not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_what_if_forecast failed");
  }
}

/** Delete what if forecast export. */
export async function deleteWhatIfForecastExport(whatIfForecastExportArn: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_what_if_forecast_export
    throw new Error("delete_what_if_forecast_export not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_what_if_forecast_export failed");
  }
}

/** Describe auto predictor. */
export async function describeAutoPredictor(predictorArn: string, regionName?: string): Promise<DescribeAutoPredictorResult> {
  try {
    // TODO: implement describe_auto_predictor
    throw new Error("describe_auto_predictor not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_auto_predictor failed");
  }
}

/** Describe dataset group. */
export async function describeDatasetGroup(datasetGroupArn: string, regionName?: string): Promise<DescribeDatasetGroupResult> {
  try {
    // TODO: implement describe_dataset_group
    throw new Error("describe_dataset_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_dataset_group failed");
  }
}

/** Describe explainability. */
export async function describeExplainability(explainabilityArn: string, regionName?: string): Promise<DescribeExplainabilityResult> {
  try {
    // TODO: implement describe_explainability
    throw new Error("describe_explainability not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_explainability failed");
  }
}

/** Describe explainability export. */
export async function describeExplainabilityExport(explainabilityExportArn: string, regionName?: string): Promise<DescribeExplainabilityExportResult> {
  try {
    // TODO: implement describe_explainability_export
    throw new Error("describe_explainability_export not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_explainability_export failed");
  }
}

/** Describe monitor. */
export async function describeMonitor(monitorArn: string, regionName?: string): Promise<DescribeMonitorResult> {
  try {
    // TODO: implement describe_monitor
    throw new Error("describe_monitor not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_monitor failed");
  }
}

/** Describe predictor backtest export job. */
export async function describePredictorBacktestExportJob(predictorBacktestExportJobArn: string, regionName?: string): Promise<DescribePredictorBacktestExportJobResult> {
  try {
    // TODO: implement describe_predictor_backtest_export_job
    throw new Error("describe_predictor_backtest_export_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_predictor_backtest_export_job failed");
  }
}

/** Describe what if analysis. */
export async function describeWhatIfAnalysis(whatIfAnalysisArn: string, regionName?: string): Promise<DescribeWhatIfAnalysisResult> {
  try {
    // TODO: implement describe_what_if_analysis
    throw new Error("describe_what_if_analysis not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_what_if_analysis failed");
  }
}

/** Describe what if forecast. */
export async function describeWhatIfForecast(whatIfForecastArn: string, regionName?: string): Promise<DescribeWhatIfForecastResult> {
  try {
    // TODO: implement describe_what_if_forecast
    throw new Error("describe_what_if_forecast not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_what_if_forecast failed");
  }
}

/** Describe what if forecast export. */
export async function describeWhatIfForecastExport(whatIfForecastExportArn: string, regionName?: string): Promise<DescribeWhatIfForecastExportResult> {
  try {
    // TODO: implement describe_what_if_forecast_export
    throw new Error("describe_what_if_forecast_export not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_what_if_forecast_export failed");
  }
}

/** Get accuracy metrics. */
export async function getAccuracyMetrics(predictorArn: string, regionName?: string): Promise<GetAccuracyMetricsResult> {
  try {
    // TODO: implement get_accuracy_metrics
    throw new Error("get_accuracy_metrics not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_accuracy_metrics failed");
  }
}

/** List dataset groups. */
export async function listDatasetGroups(): Promise<ListDatasetGroupsResult> {
  try {
    // TODO: implement list_dataset_groups
    throw new Error("list_dataset_groups not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_dataset_groups failed");
  }
}

/** List dataset import jobs. */
export async function listDatasetImportJobs(): Promise<ListDatasetImportJobsResult> {
  try {
    // TODO: implement list_dataset_import_jobs
    throw new Error("list_dataset_import_jobs not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_dataset_import_jobs failed");
  }
}

/** List explainabilities. */
export async function listExplainabilities(): Promise<ListExplainabilitiesResult> {
  try {
    // TODO: implement list_explainabilities
    throw new Error("list_explainabilities not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_explainabilities failed");
  }
}

/** List explainability exports. */
export async function listExplainabilityExports(): Promise<ListExplainabilityExportsResult> {
  try {
    // TODO: implement list_explainability_exports
    throw new Error("list_explainability_exports not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_explainability_exports failed");
  }
}

/** List forecast export jobs. */
export async function listForecastExportJobs(): Promise<ListForecastExportJobsResult> {
  try {
    // TODO: implement list_forecast_export_jobs
    throw new Error("list_forecast_export_jobs not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_forecast_export_jobs failed");
  }
}

/** List monitor evaluations. */
export async function listMonitorEvaluations(monitorArn: string): Promise<ListMonitorEvaluationsResult> {
  try {
    // TODO: implement list_monitor_evaluations
    throw new Error("list_monitor_evaluations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_monitor_evaluations failed");
  }
}

/** List monitors. */
export async function listMonitors(): Promise<ListMonitorsResult> {
  try {
    // TODO: implement list_monitors
    throw new Error("list_monitors not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_monitors failed");
  }
}

/** List predictor backtest export jobs. */
export async function listPredictorBacktestExportJobs(): Promise<ListPredictorBacktestExportJobsResult> {
  try {
    // TODO: implement list_predictor_backtest_export_jobs
    throw new Error("list_predictor_backtest_export_jobs not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_predictor_backtest_export_jobs failed");
  }
}

/** List predictors. */
export async function listPredictors(): Promise<ListPredictorsResult> {
  try {
    // TODO: implement list_predictors
    throw new Error("list_predictors not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_predictors failed");
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

/** List what if analyses. */
export async function listWhatIfAnalyses(): Promise<ListWhatIfAnalysesResult> {
  try {
    // TODO: implement list_what_if_analyses
    throw new Error("list_what_if_analyses not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_what_if_analyses failed");
  }
}

/** List what if forecast exports. */
export async function listWhatIfForecastExports(): Promise<ListWhatIfForecastExportsResult> {
  try {
    // TODO: implement list_what_if_forecast_exports
    throw new Error("list_what_if_forecast_exports not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_what_if_forecast_exports failed");
  }
}

/** List what if forecasts. */
export async function listWhatIfForecasts(): Promise<ListWhatIfForecastsResult> {
  try {
    // TODO: implement list_what_if_forecasts
    throw new Error("list_what_if_forecasts not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_what_if_forecasts failed");
  }
}

/** Resume resource. */
export async function resumeResource(resourceArn: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement resume_resource
    throw new Error("resume_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "resume_resource failed");
  }
}

/** Stop resource. */
export async function stopResource(resourceArn: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement stop_resource
    throw new Error("stop_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "stop_resource failed");
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

/** Update dataset group. */
export async function updateDatasetGroup(datasetGroupArn: string, datasetArns: string[], regionName?: string): Promise<void> {
  try {
    // TODO: implement update_dataset_group
    throw new Error("update_dataset_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_dataset_group failed");
  }
}
