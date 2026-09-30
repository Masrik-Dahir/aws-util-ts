import { IotSitewiseClient } from "@aws-sdk/client-iotsitewise";
import { getClient } from "./client";
import { wrapAwsError } from "./exceptions";

/** Metadata for an IoT SiteWise asset model. */
export type AssetModelResult = {
  assetModelId: string;
  assetModelArn?: string;
  assetModelName?: string;
  assetModelStatus?: string;
  extra?: Record<string, unknown>;
};

/** Metadata for an IoT SiteWise asset. */
export type AssetResult = {
  assetId: string;
  assetArn?: string;
  assetName?: string;
  assetModelId?: string;
  assetStatus?: string;
  extra?: Record<string, unknown>;
};

/** Metadata for an IoT SiteWise portal. */
export type PortalResult = {
  portalId: string;
  portalArn?: string;
  portalName?: string;
  portalStatus?: string;
  startUrl?: string;
  extra?: Record<string, unknown>;
};

/** Metadata for an IoT SiteWise dashboard. */
export type DashboardResult = {
  dashboardId: string;
  dashboardArn?: string;
  dashboardName?: string;
  projectId?: string;
  extra?: Record<string, unknown>;
};

/** A single asset property value entry. */
export type PropertyValueResult = {
  value?: Record<string, unknown>;
  timestamp?: Record<string, unknown>;
  quality?: string;
};

/** Result of batch_associate_project_assets. */
export type BatchAssociateProjectAssetsResult = {
  errors?: Record<string, unknown>[];
};

/** Result of batch_disassociate_project_assets. */
export type BatchDisassociateProjectAssetsResult = {
  errors?: Record<string, unknown>[];
};

/** Result of batch_get_asset_property_aggregates. */
export type BatchGetAssetPropertyAggregatesResult = {
  errorEntries?: Record<string, unknown>[];
  successEntries?: Record<string, unknown>[];
  skippedEntries?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of batch_get_asset_property_value. */
export type BatchGetAssetPropertyValueResult = {
  errorEntries?: Record<string, unknown>[];
  successEntries?: Record<string, unknown>[];
  skippedEntries?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of batch_get_asset_property_value_history. */
export type BatchGetAssetPropertyValueHistoryResult = {
  errorEntries?: Record<string, unknown>[];
  successEntries?: Record<string, unknown>[];
  skippedEntries?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of batch_put_asset_property_value. */
export type BatchPutAssetPropertyValueResult = {
  errorEntries?: Record<string, unknown>[];
};

/** Result of create_access_policy. */
export type CreateAccessPolicyResult = {
  accessPolicyId?: string;
  accessPolicyArn?: string;
};

/** Result of create_asset_model_composite_model. */
export type CreateAssetModelCompositeModelResult = {
  assetModelCompositeModelId?: string;
  assetModelCompositeModelPath?: Record<string, unknown>[];
  assetModelStatus?: Record<string, unknown>;
};

/** Result of create_bulk_import_job. */
export type CreateBulkImportJobResult = {
  jobId?: string;
  jobName?: string;
  jobStatus?: string;
};

/** Result of create_computation_model. */
export type CreateComputationModelResult = {
  computationModelId?: string;
  computationModelArn?: string;
  computationModelStatus?: Record<string, unknown>;
};

/** Result of create_dataset. */
export type CreateDatasetResult = {
  datasetId?: string;
  datasetArn?: string;
  datasetStatus?: Record<string, unknown>;
};

/** Result of create_gateway. */
export type CreateGatewayResult = {
  gatewayId?: string;
  gatewayArn?: string;
};

/** Result of create_project. */
export type CreateProjectResult = {
  projectId?: string;
  projectArn?: string;
};

/** Result of delete_asset_model_composite_model. */
export type DeleteAssetModelCompositeModelResult = {
  assetModelStatus?: Record<string, unknown>;
};

/** Result of delete_asset_model_interface_relationship. */
export type DeleteAssetModelInterfaceRelationshipResult = {
  assetModelId?: string;
  interfaceAssetModelId?: string;
  assetModelArn?: string;
  assetModelStatus?: Record<string, unknown>;
};

/** Result of delete_computation_model. */
export type DeleteComputationModelResult = {
  computationModelStatus?: Record<string, unknown>;
};

/** Result of delete_dataset. */
export type DeleteDatasetResult = {
  datasetStatus?: Record<string, unknown>;
};

/** Result of describe_access_policy. */
export type DescribeAccessPolicyResult = {
  accessPolicyId?: string;
  accessPolicyArn?: string;
  accessPolicyIdentity?: Record<string, unknown>;
  accessPolicyResource?: Record<string, unknown>;
  accessPolicyPermission?: string;
  accessPolicyCreationDate?: string;
  accessPolicyLastUpdateDate?: string;
};

/** Result of describe_action. */
export type DescribeActionResult = {
  actionId?: string;
  targetResource?: Record<string, unknown>;
  actionDefinitionId?: string;
  actionPayload?: Record<string, unknown>;
  executionTime?: string;
  resolveTo?: Record<string, unknown>;
};

/** Result of describe_asset_composite_model. */
export type DescribeAssetCompositeModelResult = {
  assetId?: string;
  assetCompositeModelId?: string;
  assetCompositeModelExternalId?: string;
  assetCompositeModelPath?: Record<string, unknown>[];
  assetCompositeModelName?: string;
  assetCompositeModelDescription?: string;
  assetCompositeModelType?: string;
  assetCompositeModelProperties?: Record<string, unknown>[];
  assetCompositeModelSummaries?: Record<string, unknown>[];
  actionDefinitions?: Record<string, unknown>[];
};

/** Result of describe_asset_model_composite_model. */
export type DescribeAssetModelCompositeModelResult = {
  assetModelId?: string;
  assetModelCompositeModelId?: string;
  assetModelCompositeModelExternalId?: string;
  assetModelCompositeModelPath?: Record<string, unknown>[];
  assetModelCompositeModelName?: string;
  assetModelCompositeModelDescription?: string;
  assetModelCompositeModelType?: string;
  assetModelCompositeModelProperties?: Record<string, unknown>[];
  compositionDetails?: Record<string, unknown>;
  assetModelCompositeModelSummaries?: Record<string, unknown>[];
  actionDefinitions?: Record<string, unknown>[];
};

/** Result of describe_asset_model_interface_relationship. */
export type DescribeAssetModelInterfaceRelationshipResult = {
  assetModelId?: string;
  interfaceAssetModelId?: string;
  propertyMappings?: Record<string, unknown>[];
  hierarchyMappings?: Record<string, unknown>[];
};

/** Result of describe_asset_property. */
export type DescribeAssetPropertyResult = {
  assetId?: string;
  assetExternalId?: string;
  assetName?: string;
  assetModelId?: string;
  assetProperty?: Record<string, unknown>;
  compositeModel?: Record<string, unknown>;
};

/** Result of describe_bulk_import_job. */
export type DescribeBulkImportJobResult = {
  jobId?: string;
  jobName?: string;
  jobStatus?: string;
  jobRoleArn?: string;
  files?: Record<string, unknown>[];
  errorReportLocation?: Record<string, unknown>;
  jobConfiguration?: Record<string, unknown>;
  jobCreationDate?: string;
  jobLastUpdateDate?: string;
  adaptiveIngestion?: boolean;
  deleteFilesAfterImport?: boolean;
};

/** Result of describe_computation_model. */
export type DescribeComputationModelResult = {
  computationModelId?: string;
  computationModelArn?: string;
  computationModelName?: string;
  computationModelDescription?: string;
  computationModelConfiguration?: Record<string, unknown>;
  computationModelDataBinding?: Record<string, unknown>;
  computationModelCreationDate?: string;
  computationModelLastUpdateDate?: string;
  computationModelStatus?: Record<string, unknown>;
  computationModelVersion?: string;
  actionDefinitions?: Record<string, unknown>[];
};

/** Result of describe_computation_model_execution_summary. */
export type DescribeComputationModelExecutionSummaryResult = {
  computationModelId?: string;
  resolveTo?: Record<string, unknown>;
  computationModelExecutionSummary?: Record<string, unknown>;
};

/** Result of describe_dashboard. */
export type DescribeDashboardResult = {
  dashboardId?: string;
  dashboardArn?: string;
  dashboardName?: string;
  projectId?: string;
  dashboardDescription?: string;
  dashboardDefinition?: string;
  dashboardCreationDate?: string;
  dashboardLastUpdateDate?: string;
};

/** Result of describe_dataset. */
export type DescribeDatasetResult = {
  datasetId?: string;
  datasetArn?: string;
  datasetName?: string;
  datasetDescription?: string;
  datasetSource?: Record<string, unknown>;
  datasetStatus?: Record<string, unknown>;
  datasetCreationDate?: string;
  datasetLastUpdateDate?: string;
  datasetVersion?: string;
};

/** Result of describe_default_encryption_configuration. */
export type DescribeDefaultEncryptionConfigurationResult = {
  encryptionType?: string;
  kmsKeyArn?: string;
  configurationStatus?: Record<string, unknown>;
};

/** Result of describe_execution. */
export type DescribeExecutionResult = {
  executionId?: string;
  actionType?: string;
  targetResource?: Record<string, unknown>;
  targetResourceVersion?: string;
  resolveTo?: Record<string, unknown>;
  executionStartTime?: string;
  executionEndTime?: string;
  executionStatus?: Record<string, unknown>;
  executionResult?: Record<string, unknown>;
  executionDetails?: Record<string, unknown>;
  executionEntityVersion?: string;
};

/** Result of describe_gateway. */
export type DescribeGatewayResult = {
  gatewayId?: string;
  gatewayName?: string;
  gatewayArn?: string;
  gatewayPlatform?: Record<string, unknown>;
  gatewayVersion?: string;
  gatewayCapabilitySummaries?: Record<string, unknown>[];
  creationDate?: string;
  lastUpdateDate?: string;
};

/** Result of describe_gateway_capability_configuration. */
export type DescribeGatewayCapabilityConfigurationResult = {
  gatewayId?: string;
  capabilityNamespace?: string;
  capabilityConfiguration?: string;
  capabilitySyncStatus?: string;
};

/** Result of describe_logging_options. */
export type DescribeLoggingOptionsResult = {
  loggingOptions?: Record<string, unknown>;
};

/** Result of describe_project. */
export type DescribeProjectResult = {
  projectId?: string;
  projectArn?: string;
  projectName?: string;
  portalId?: string;
  projectDescription?: string;
  projectCreationDate?: string;
  projectLastUpdateDate?: string;
};

/** Result of describe_storage_configuration. */
export type DescribeStorageConfigurationResult = {
  storageType?: string;
  multiLayerStorage?: Record<string, unknown>;
  disassociatedDataStorage?: string;
  retentionPeriod?: Record<string, unknown>;
  configurationStatus?: Record<string, unknown>;
  lastUpdateDate?: string;
  warmTier?: string;
  warmTierRetentionPeriod?: Record<string, unknown>;
  disallowIngestNullNaN?: boolean;
};

/** Result of describe_time_series. */
export type DescribeTimeSeriesResult = {
  assetId?: string;
  propertyId?: string;
  alias?: string;
  timeSeriesId?: string;
  dataType?: string;
  dataTypeSpec?: string;
  timeSeriesCreationDate?: string;
  timeSeriesLastUpdateDate?: string;
  timeSeriesArn?: string;
};

/** Result of execute_action. */
export type ExecuteActionResult = {
  actionId?: string;
};

/** Result of execute_query. */
export type ExecuteQueryResult = {
  columns?: Record<string, unknown>[];
  rows?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of get_interpolated_asset_property_values. */
export type GetInterpolatedAssetPropertyValuesResult = {
  interpolatedAssetPropertyValues?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of invoke_assistant. */
export type InvokeAssistantResult = {
  body?: Record<string, unknown>;
  conversationId?: string;
};

/** Result of list_access_policies. */
export type ListAccessPoliciesResult = {
  accessPolicySummaries?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_actions. */
export type ListActionsResult = {
  actionSummaries?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_asset_model_composite_models. */
export type ListAssetModelCompositeModelsResult = {
  assetModelCompositeModelSummaries?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_asset_model_properties. */
export type ListAssetModelPropertiesResult = {
  assetModelPropertySummaries?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_asset_properties. */
export type ListAssetPropertiesResult = {
  assetPropertySummaries?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_asset_relationships. */
export type ListAssetRelationshipsResult = {
  assetRelationshipSummaries?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_associated_assets. */
export type ListAssociatedAssetsResult = {
  assetSummaries?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_bulk_import_jobs. */
export type ListBulkImportJobsResult = {
  jobSummaries?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_composition_relationships. */
export type ListCompositionRelationshipsResult = {
  compositionRelationshipSummaries?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_computation_model_data_binding_usages. */
export type ListComputationModelDataBindingUsagesResult = {
  dataBindingUsageSummaries?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_computation_model_resolve_to_resources. */
export type ListComputationModelResolveToResourcesResult = {
  computationModelResolveToResourceSummaries?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_computation_models. */
export type ListComputationModelsResult = {
  computationModelSummaries?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_datasets. */
export type ListDatasetsResult = {
  datasetSummaries?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_executions. */
export type ListExecutionsResult = {
  executionSummaries?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_gateways. */
export type ListGatewaysResult = {
  gatewaySummaries?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_interface_relationships. */
export type ListInterfaceRelationshipsResult = {
  interfaceRelationshipSummaries?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_project_assets. */
export type ListProjectAssetsResult = {
  assetIds?: string[];
  nextToken?: string;
};

/** Result of list_projects. */
export type ListProjectsResult = {
  projectSummaries?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_tags_for_resource. */
export type ListTagsForResourceResult = {
  tags?: Record<string, unknown>;
};

/** Result of list_time_series. */
export type ListTimeSeriesResult = {
  timeSeriesSummaries?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of put_asset_model_interface_relationship. */
export type PutAssetModelInterfaceRelationshipResult = {
  assetModelId?: string;
  interfaceAssetModelId?: string;
  assetModelArn?: string;
  assetModelStatus?: Record<string, unknown>;
};

/** Result of put_default_encryption_configuration. */
export type PutDefaultEncryptionConfigurationResult = {
  encryptionType?: string;
  kmsKeyArn?: string;
  configurationStatus?: Record<string, unknown>;
};

/** Result of put_storage_configuration. */
export type PutStorageConfigurationResult = {
  storageType?: string;
  multiLayerStorage?: Record<string, unknown>;
  disassociatedDataStorage?: string;
  retentionPeriod?: Record<string, unknown>;
  configurationStatus?: Record<string, unknown>;
  warmTier?: string;
  warmTierRetentionPeriod?: Record<string, unknown>;
  disallowIngestNullNaN?: boolean;
};

/** Result of update_asset. */
export type UpdateAssetResult = {
  assetStatus?: Record<string, unknown>;
};

/** Result of update_asset_model. */
export type UpdateAssetModelResult = {
  assetModelStatus?: Record<string, unknown>;
};

/** Result of update_asset_model_composite_model. */
export type UpdateAssetModelCompositeModelResult = {
  assetModelCompositeModelPath?: Record<string, unknown>[];
  assetModelStatus?: Record<string, unknown>;
};

/** Result of update_computation_model. */
export type UpdateComputationModelResult = {
  computationModelStatus?: Record<string, unknown>;
};

/** Result of update_dataset. */
export type UpdateDatasetResult = {
  datasetId?: string;
  datasetArn?: string;
  datasetStatus?: Record<string, unknown>;
};

/** Result of update_gateway_capability_configuration. */
export type UpdateGatewayCapabilityConfigurationResult = {
  capabilityNamespace?: string;
  capabilitySyncStatus?: string;
};

/** Result of update_portal. */
export type UpdatePortalResult = {
  portalStatus?: Record<string, unknown>;
};

/** Create an IoT SiteWise asset model. */
export async function createAssetModel(assetModelName: string): Promise<AssetModelResult> {
  try {
    // TODO: implement create_asset_model
    throw new Error("create_asset_model not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_asset_model failed");
  }
}

/** Describe an IoT SiteWise asset model. */
export async function describeAssetModel(assetModelId: string): Promise<AssetModelResult> {
  try {
    // TODO: implement describe_asset_model
    throw new Error("describe_asset_model not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_asset_model failed");
  }
}

/** List all IoT SiteWise asset models. */
export async function listAssetModels(): Promise<AssetModelResult[]> {
  try {
    // TODO: implement list_asset_models
    throw new Error("list_asset_models not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_asset_models failed");
  }
}

/** Delete an IoT SiteWise asset model. */
export async function deleteAssetModel(assetModelId: string): Promise<void> {
  try {
    // TODO: implement delete_asset_model
    throw new Error("delete_asset_model not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_asset_model failed");
  }
}

/** Create an IoT SiteWise asset. */
export async function createAsset(assetName: string): Promise<AssetResult> {
  try {
    // TODO: implement create_asset
    throw new Error("create_asset not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_asset failed");
  }
}

/** Describe an IoT SiteWise asset. */
export async function describeAsset(assetId: string): Promise<AssetResult> {
  try {
    // TODO: implement describe_asset
    throw new Error("describe_asset not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_asset failed");
  }
}

/** List IoT SiteWise assets, optionally filtered by model. */
export async function listAssets(): Promise<AssetResult[]> {
  try {
    // TODO: implement list_assets
    throw new Error("list_assets not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_assets failed");
  }
}

/** Delete an IoT SiteWise asset. */
export async function deleteAsset(assetId: string): Promise<void> {
  try {
    // TODO: implement delete_asset
    throw new Error("delete_asset not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_asset failed");
  }
}

/** Associate a child asset with a parent asset. */
export async function associateAssets(assetId: string): Promise<void> {
  try {
    // TODO: implement associate_assets
    throw new Error("associate_assets not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "associate_assets failed");
  }
}

/** Disassociate a child asset from a parent asset. */
export async function disassociateAssets(assetId: string): Promise<void> {
  try {
    // TODO: implement disassociate_assets
    throw new Error("disassociate_assets not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disassociate_assets failed");
  }
}

/** Ingest asset property values in batch. */
export async function putAssetPropertyValues(entries: Record<string, unknown>[]): Promise<Record<string, unknown>> {
  try {
    // TODO: implement put_asset_property_values
    throw new Error("put_asset_property_values not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_asset_property_values failed");
  }
}

/** Get the latest value of an asset property. */
export async function getAssetPropertyValue(): Promise<PropertyValueResult> {
  try {
    // TODO: implement get_asset_property_value
    throw new Error("get_asset_property_value not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_asset_property_value failed");
  }
}

/** Get aggregated values for an asset property. */
export async function getAssetPropertyAggregates(): Promise<Record<string, unknown>[]> {
  try {
    // TODO: implement get_asset_property_aggregates
    throw new Error("get_asset_property_aggregates not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_asset_property_aggregates failed");
  }
}

/** Get the value history for an asset property. */
export async function getAssetPropertyValueHistory(): Promise<PropertyValueResult[]> {
  try {
    // TODO: implement get_asset_property_value_history
    throw new Error("get_asset_property_value_history not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_asset_property_value_history failed");
  }
}

/** Create an IoT SiteWise portal. */
export async function createPortal(portalName: string): Promise<PortalResult> {
  try {
    // TODO: implement create_portal
    throw new Error("create_portal not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_portal failed");
  }
}

/** Describe an IoT SiteWise portal. */
export async function describePortal(portalId: string): Promise<PortalResult> {
  try {
    // TODO: implement describe_portal
    throw new Error("describe_portal not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_portal failed");
  }
}

/** List all IoT SiteWise portals. */
export async function listPortals(): Promise<PortalResult[]> {
  try {
    // TODO: implement list_portals
    throw new Error("list_portals not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_portals failed");
  }
}

/** Delete an IoT SiteWise portal. */
export async function deletePortal(portalId: string): Promise<void> {
  try {
    // TODO: implement delete_portal
    throw new Error("delete_portal not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_portal failed");
  }
}

/** Create an IoT SiteWise dashboard. */
export async function createDashboard(projectId: string): Promise<DashboardResult> {
  try {
    // TODO: implement create_dashboard
    throw new Error("create_dashboard not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_dashboard failed");
  }
}

/** List dashboards for a project. */
export async function listDashboards(projectId: string): Promise<DashboardResult[]> {
  try {
    // TODO: implement list_dashboards
    throw new Error("list_dashboards not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_dashboards failed");
  }
}

/** Poll until an asset model reaches the desired state. */
export async function waitForAssetModel(assetModelId: string): Promise<AssetModelResult> {
  try {
    // TODO: implement wait_for_asset_model
    throw new Error("wait_for_asset_model not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "wait_for_asset_model failed");
  }
}

/** Poll until an asset reaches the desired state. */
export async function waitForAsset(assetId: string): Promise<AssetResult> {
  try {
    // TODO: implement wait_for_asset
    throw new Error("wait_for_asset not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "wait_for_asset failed");
  }
}

/** Associate time series to asset property. */
export async function associateTimeSeriesToAssetProperty(alias: string, assetId: string, propertyId: string): Promise<void> {
  try {
    // TODO: implement associate_time_series_to_asset_property
    throw new Error("associate_time_series_to_asset_property not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "associate_time_series_to_asset_property failed");
  }
}

/** Batch associate project assets. */
export async function batchAssociateProjectAssets(projectId: string, assetIds: string[]): Promise<BatchAssociateProjectAssetsResult> {
  try {
    // TODO: implement batch_associate_project_assets
    throw new Error("batch_associate_project_assets not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_associate_project_assets failed");
  }
}

/** Batch disassociate project assets. */
export async function batchDisassociateProjectAssets(projectId: string, assetIds: string[]): Promise<BatchDisassociateProjectAssetsResult> {
  try {
    // TODO: implement batch_disassociate_project_assets
    throw new Error("batch_disassociate_project_assets not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_disassociate_project_assets failed");
  }
}

/** Batch get asset property aggregates. */
export async function batchGetAssetPropertyAggregates(entries: Record<string, unknown>[]): Promise<BatchGetAssetPropertyAggregatesResult> {
  try {
    // TODO: implement batch_get_asset_property_aggregates
    throw new Error("batch_get_asset_property_aggregates not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_get_asset_property_aggregates failed");
  }
}

/** Batch get asset property value. */
export async function batchGetAssetPropertyValue(entries: Record<string, unknown>[]): Promise<BatchGetAssetPropertyValueResult> {
  try {
    // TODO: implement batch_get_asset_property_value
    throw new Error("batch_get_asset_property_value not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_get_asset_property_value failed");
  }
}

/** Batch get asset property value history. */
export async function batchGetAssetPropertyValueHistory(entries: Record<string, unknown>[]): Promise<BatchGetAssetPropertyValueHistoryResult> {
  try {
    // TODO: implement batch_get_asset_property_value_history
    throw new Error("batch_get_asset_property_value_history not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_get_asset_property_value_history failed");
  }
}

/** Batch put asset property value. */
export async function batchPutAssetPropertyValue(entries: Record<string, unknown>[]): Promise<BatchPutAssetPropertyValueResult> {
  try {
    // TODO: implement batch_put_asset_property_value
    throw new Error("batch_put_asset_property_value not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_put_asset_property_value failed");
  }
}

/** Create access policy. */
export async function createAccessPolicy(accessPolicyIdentity: Record<string, unknown>, accessPolicyResource: Record<string, unknown>, accessPolicyPermission: string): Promise<CreateAccessPolicyResult> {
  try {
    // TODO: implement create_access_policy
    throw new Error("create_access_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_access_policy failed");
  }
}

/** Create asset model composite model. */
export async function createAssetModelCompositeModel(assetModelId: string, assetModelCompositeModelName: string, assetModelCompositeModelType: string): Promise<CreateAssetModelCompositeModelResult> {
  try {
    // TODO: implement create_asset_model_composite_model
    throw new Error("create_asset_model_composite_model not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_asset_model_composite_model failed");
  }
}

/** Create bulk import job. */
export async function createBulkImportJob(jobName: string, jobRoleArn: string, files: Record<string, unknown>[], errorReportLocation: Record<string, unknown>, jobConfiguration: Record<string, unknown>): Promise<CreateBulkImportJobResult> {
  try {
    // TODO: implement create_bulk_import_job
    throw new Error("create_bulk_import_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_bulk_import_job failed");
  }
}

/** Create computation model. */
export async function createComputationModel(computationModelName: string, computationModelConfiguration: Record<string, unknown>, computationModelDataBinding: Record<string, unknown>): Promise<CreateComputationModelResult> {
  try {
    // TODO: implement create_computation_model
    throw new Error("create_computation_model not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_computation_model failed");
  }
}

/** Create dataset. */
export async function createDataset(datasetName: string, datasetSource: Record<string, unknown>): Promise<CreateDatasetResult> {
  try {
    // TODO: implement create_dataset
    throw new Error("create_dataset not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_dataset failed");
  }
}

/** Create gateway. */
export async function createGateway(gatewayName: string, gatewayPlatform: Record<string, unknown>): Promise<CreateGatewayResult> {
  try {
    // TODO: implement create_gateway
    throw new Error("create_gateway not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_gateway failed");
  }
}

/** Create project. */
export async function createProject(portalId: string, projectName: string): Promise<CreateProjectResult> {
  try {
    // TODO: implement create_project
    throw new Error("create_project not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_project failed");
  }
}

/** Delete access policy. */
export async function deleteAccessPolicy(accessPolicyId: string): Promise<void> {
  try {
    // TODO: implement delete_access_policy
    throw new Error("delete_access_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_access_policy failed");
  }
}

/** Delete asset model composite model. */
export async function deleteAssetModelCompositeModel(assetModelId: string, assetModelCompositeModelId: string): Promise<DeleteAssetModelCompositeModelResult> {
  try {
    // TODO: implement delete_asset_model_composite_model
    throw new Error("delete_asset_model_composite_model not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_asset_model_composite_model failed");
  }
}

/** Delete asset model interface relationship. */
export async function deleteAssetModelInterfaceRelationship(assetModelId: string, interfaceAssetModelId: string): Promise<DeleteAssetModelInterfaceRelationshipResult> {
  try {
    // TODO: implement delete_asset_model_interface_relationship
    throw new Error("delete_asset_model_interface_relationship not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_asset_model_interface_relationship failed");
  }
}

/** Delete computation model. */
export async function deleteComputationModel(computationModelId: string): Promise<DeleteComputationModelResult> {
  try {
    // TODO: implement delete_computation_model
    throw new Error("delete_computation_model not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_computation_model failed");
  }
}

/** Delete dashboard. */
export async function deleteDashboard(dashboardId: string): Promise<void> {
  try {
    // TODO: implement delete_dashboard
    throw new Error("delete_dashboard not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_dashboard failed");
  }
}

/** Delete dataset. */
export async function deleteDataset(datasetId: string): Promise<DeleteDatasetResult> {
  try {
    // TODO: implement delete_dataset
    throw new Error("delete_dataset not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_dataset failed");
  }
}

/** Delete gateway. */
export async function deleteGateway(gatewayId: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_gateway
    throw new Error("delete_gateway not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_gateway failed");
  }
}

/** Delete project. */
export async function deleteProject(projectId: string): Promise<void> {
  try {
    // TODO: implement delete_project
    throw new Error("delete_project not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_project failed");
  }
}

/** Delete time series. */
export async function deleteTimeSeries(): Promise<void> {
  try {
    // TODO: implement delete_time_series
    throw new Error("delete_time_series not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_time_series failed");
  }
}

/** Describe access policy. */
export async function describeAccessPolicy(accessPolicyId: string, regionName?: string): Promise<DescribeAccessPolicyResult> {
  try {
    // TODO: implement describe_access_policy
    throw new Error("describe_access_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_access_policy failed");
  }
}

/** Describe action. */
export async function describeAction(actionId: string, regionName?: string): Promise<DescribeActionResult> {
  try {
    // TODO: implement describe_action
    throw new Error("describe_action not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_action failed");
  }
}

/** Describe asset composite model. */
export async function describeAssetCompositeModel(assetId: string, assetCompositeModelId: string, regionName?: string): Promise<DescribeAssetCompositeModelResult> {
  try {
    // TODO: implement describe_asset_composite_model
    throw new Error("describe_asset_composite_model not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_asset_composite_model failed");
  }
}

/** Describe asset model composite model. */
export async function describeAssetModelCompositeModel(assetModelId: string, assetModelCompositeModelId: string): Promise<DescribeAssetModelCompositeModelResult> {
  try {
    // TODO: implement describe_asset_model_composite_model
    throw new Error("describe_asset_model_composite_model not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_asset_model_composite_model failed");
  }
}

/** Describe asset model interface relationship. */
export async function describeAssetModelInterfaceRelationship(assetModelId: string, interfaceAssetModelId: string, regionName?: string): Promise<DescribeAssetModelInterfaceRelationshipResult> {
  try {
    // TODO: implement describe_asset_model_interface_relationship
    throw new Error("describe_asset_model_interface_relationship not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_asset_model_interface_relationship failed");
  }
}

/** Describe asset property. */
export async function describeAssetProperty(assetId: string, propertyId: string, regionName?: string): Promise<DescribeAssetPropertyResult> {
  try {
    // TODO: implement describe_asset_property
    throw new Error("describe_asset_property not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_asset_property failed");
  }
}

/** Describe bulk import job. */
export async function describeBulkImportJob(jobId: string, regionName?: string): Promise<DescribeBulkImportJobResult> {
  try {
    // TODO: implement describe_bulk_import_job
    throw new Error("describe_bulk_import_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_bulk_import_job failed");
  }
}

/** Describe computation model. */
export async function describeComputationModel(computationModelId: string): Promise<DescribeComputationModelResult> {
  try {
    // TODO: implement describe_computation_model
    throw new Error("describe_computation_model not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_computation_model failed");
  }
}

/** Describe computation model execution summary. */
export async function describeComputationModelExecutionSummary(computationModelId: string): Promise<DescribeComputationModelExecutionSummaryResult> {
  try {
    // TODO: implement describe_computation_model_execution_summary
    throw new Error("describe_computation_model_execution_summary not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_computation_model_execution_summary failed");
  }
}

/** Describe dashboard. */
export async function describeDashboard(dashboardId: string, regionName?: string): Promise<DescribeDashboardResult> {
  try {
    // TODO: implement describe_dashboard
    throw new Error("describe_dashboard not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_dashboard failed");
  }
}

/** Describe dataset. */
export async function describeDataset(datasetId: string, regionName?: string): Promise<DescribeDatasetResult> {
  try {
    // TODO: implement describe_dataset
    throw new Error("describe_dataset not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_dataset failed");
  }
}

/** Describe default encryption configuration. */
export async function describeDefaultEncryptionConfiguration(regionName?: string): Promise<DescribeDefaultEncryptionConfigurationResult> {
  try {
    // TODO: implement describe_default_encryption_configuration
    throw new Error("describe_default_encryption_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_default_encryption_configuration failed");
  }
}

/** Describe execution. */
export async function describeExecution(executionId: string, regionName?: string): Promise<DescribeExecutionResult> {
  try {
    // TODO: implement describe_execution
    throw new Error("describe_execution not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_execution failed");
  }
}

/** Describe gateway. */
export async function describeGateway(gatewayId: string, regionName?: string): Promise<DescribeGatewayResult> {
  try {
    // TODO: implement describe_gateway
    throw new Error("describe_gateway not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_gateway failed");
  }
}

/** Describe gateway capability configuration. */
export async function describeGatewayCapabilityConfiguration(gatewayId: string, capabilityNamespace: string, regionName?: string): Promise<DescribeGatewayCapabilityConfigurationResult> {
  try {
    // TODO: implement describe_gateway_capability_configuration
    throw new Error("describe_gateway_capability_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_gateway_capability_configuration failed");
  }
}

/** Describe logging options. */
export async function describeLoggingOptions(regionName?: string): Promise<DescribeLoggingOptionsResult> {
  try {
    // TODO: implement describe_logging_options
    throw new Error("describe_logging_options not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_logging_options failed");
  }
}

/** Describe project. */
export async function describeProject(projectId: string, regionName?: string): Promise<DescribeProjectResult> {
  try {
    // TODO: implement describe_project
    throw new Error("describe_project not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_project failed");
  }
}

/** Describe storage configuration. */
export async function describeStorageConfiguration(regionName?: string): Promise<DescribeStorageConfigurationResult> {
  try {
    // TODO: implement describe_storage_configuration
    throw new Error("describe_storage_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_storage_configuration failed");
  }
}

/** Describe time series. */
export async function describeTimeSeries(): Promise<DescribeTimeSeriesResult> {
  try {
    // TODO: implement describe_time_series
    throw new Error("describe_time_series not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_time_series failed");
  }
}

/** Disassociate time series from asset property. */
export async function disassociateTimeSeriesFromAssetProperty(alias: string, assetId: string, propertyId: string): Promise<void> {
  try {
    // TODO: implement disassociate_time_series_from_asset_property
    throw new Error("disassociate_time_series_from_asset_property not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disassociate_time_series_from_asset_property failed");
  }
}

/** Execute action. */
export async function executeAction(targetResource: Record<string, unknown>, actionDefinitionId: string, actionPayload: Record<string, unknown>): Promise<ExecuteActionResult> {
  try {
    // TODO: implement execute_action
    throw new Error("execute_action not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "execute_action failed");
  }
}

/** Execute query. */
export async function executeQuery(queryStatement: string): Promise<ExecuteQueryResult> {
  try {
    // TODO: implement execute_query
    throw new Error("execute_query not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "execute_query failed");
  }
}

/** Get interpolated asset property values. */
export async function getInterpolatedAssetPropertyValues(startTimeInSeconds: number, endTimeInSeconds: number, quality: string, intervalInSeconds: number, typeValue: string): Promise<GetInterpolatedAssetPropertyValuesResult> {
  try {
    // TODO: implement get_interpolated_asset_property_values
    throw new Error("get_interpolated_asset_property_values not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_interpolated_asset_property_values failed");
  }
}

/** Invoke assistant. */
export async function invokeAssistant(message: string): Promise<InvokeAssistantResult> {
  try {
    // TODO: implement invoke_assistant
    throw new Error("invoke_assistant not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "invoke_assistant failed");
  }
}

/** List access policies. */
export async function listAccessPolicies(): Promise<ListAccessPoliciesResult> {
  try {
    // TODO: implement list_access_policies
    throw new Error("list_access_policies not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_access_policies failed");
  }
}

/** List actions. */
export async function listActions(targetResourceType: string, targetResourceId: string): Promise<ListActionsResult> {
  try {
    // TODO: implement list_actions
    throw new Error("list_actions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_actions failed");
  }
}

/** List asset model composite models. */
export async function listAssetModelCompositeModels(assetModelId: string): Promise<ListAssetModelCompositeModelsResult> {
  try {
    // TODO: implement list_asset_model_composite_models
    throw new Error("list_asset_model_composite_models not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_asset_model_composite_models failed");
  }
}

/** List asset model properties. */
export async function listAssetModelProperties(assetModelId: string): Promise<ListAssetModelPropertiesResult> {
  try {
    // TODO: implement list_asset_model_properties
    throw new Error("list_asset_model_properties not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_asset_model_properties failed");
  }
}

/** List asset properties. */
export async function listAssetProperties(assetId: string): Promise<ListAssetPropertiesResult> {
  try {
    // TODO: implement list_asset_properties
    throw new Error("list_asset_properties not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_asset_properties failed");
  }
}

/** List asset relationships. */
export async function listAssetRelationships(assetId: string, traversalType: string): Promise<ListAssetRelationshipsResult> {
  try {
    // TODO: implement list_asset_relationships
    throw new Error("list_asset_relationships not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_asset_relationships failed");
  }
}

/** List associated assets. */
export async function listAssociatedAssets(assetId: string): Promise<ListAssociatedAssetsResult> {
  try {
    // TODO: implement list_associated_assets
    throw new Error("list_associated_assets not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_associated_assets failed");
  }
}

/** List bulk import jobs. */
export async function listBulkImportJobs(): Promise<ListBulkImportJobsResult> {
  try {
    // TODO: implement list_bulk_import_jobs
    throw new Error("list_bulk_import_jobs not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_bulk_import_jobs failed");
  }
}

/** List composition relationships. */
export async function listCompositionRelationships(assetModelId: string): Promise<ListCompositionRelationshipsResult> {
  try {
    // TODO: implement list_composition_relationships
    throw new Error("list_composition_relationships not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_composition_relationships failed");
  }
}

/** List computation model data binding usages. */
export async function listComputationModelDataBindingUsages(dataBindingValueFilter: Record<string, unknown>): Promise<ListComputationModelDataBindingUsagesResult> {
  try {
    // TODO: implement list_computation_model_data_binding_usages
    throw new Error("list_computation_model_data_binding_usages not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_computation_model_data_binding_usages failed");
  }
}

/** List computation model resolve to resources. */
export async function listComputationModelResolveToResources(computationModelId: string): Promise<ListComputationModelResolveToResourcesResult> {
  try {
    // TODO: implement list_computation_model_resolve_to_resources
    throw new Error("list_computation_model_resolve_to_resources not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_computation_model_resolve_to_resources failed");
  }
}

/** List computation models. */
export async function listComputationModels(): Promise<ListComputationModelsResult> {
  try {
    // TODO: implement list_computation_models
    throw new Error("list_computation_models not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_computation_models failed");
  }
}

/** List datasets. */
export async function listDatasets(sourceType: string): Promise<ListDatasetsResult> {
  try {
    // TODO: implement list_datasets
    throw new Error("list_datasets not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_datasets failed");
  }
}

/** List executions. */
export async function listExecutions(targetResourceType: string, targetResourceId: string): Promise<ListExecutionsResult> {
  try {
    // TODO: implement list_executions
    throw new Error("list_executions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_executions failed");
  }
}

/** List gateways. */
export async function listGateways(): Promise<ListGatewaysResult> {
  try {
    // TODO: implement list_gateways
    throw new Error("list_gateways not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_gateways failed");
  }
}

/** List interface relationships. */
export async function listInterfaceRelationships(interfaceAssetModelId: string): Promise<ListInterfaceRelationshipsResult> {
  try {
    // TODO: implement list_interface_relationships
    throw new Error("list_interface_relationships not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_interface_relationships failed");
  }
}

/** List project assets. */
export async function listProjectAssets(projectId: string): Promise<ListProjectAssetsResult> {
  try {
    // TODO: implement list_project_assets
    throw new Error("list_project_assets not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_project_assets failed");
  }
}

/** List projects. */
export async function listProjects(portalId: string): Promise<ListProjectsResult> {
  try {
    // TODO: implement list_projects
    throw new Error("list_projects not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_projects failed");
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

/** List time series. */
export async function listTimeSeries(): Promise<ListTimeSeriesResult> {
  try {
    // TODO: implement list_time_series
    throw new Error("list_time_series not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_time_series failed");
  }
}

/** Put asset model interface relationship. */
export async function putAssetModelInterfaceRelationship(assetModelId: string, interfaceAssetModelId: string, propertyMappingConfiguration: Record<string, unknown>): Promise<PutAssetModelInterfaceRelationshipResult> {
  try {
    // TODO: implement put_asset_model_interface_relationship
    throw new Error("put_asset_model_interface_relationship not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_asset_model_interface_relationship failed");
  }
}

/** Put default encryption configuration. */
export async function putDefaultEncryptionConfiguration(encryptionType: string): Promise<PutDefaultEncryptionConfigurationResult> {
  try {
    // TODO: implement put_default_encryption_configuration
    throw new Error("put_default_encryption_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_default_encryption_configuration failed");
  }
}

/** Put logging options. */
export async function putLoggingOptions(loggingOptions: Record<string, unknown>, regionName?: string): Promise<void> {
  try {
    // TODO: implement put_logging_options
    throw new Error("put_logging_options not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_logging_options failed");
  }
}

/** Put storage configuration. */
export async function putStorageConfiguration(storageType: string): Promise<PutStorageConfigurationResult> {
  try {
    // TODO: implement put_storage_configuration
    throw new Error("put_storage_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_storage_configuration failed");
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

/** Update access policy. */
export async function updateAccessPolicy(accessPolicyId: string, accessPolicyIdentity: Record<string, unknown>, accessPolicyResource: Record<string, unknown>, accessPolicyPermission: string): Promise<void> {
  try {
    // TODO: implement update_access_policy
    throw new Error("update_access_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_access_policy failed");
  }
}

/** Update asset. */
export async function updateAsset(assetId: string, assetName: string): Promise<UpdateAssetResult> {
  try {
    // TODO: implement update_asset
    throw new Error("update_asset not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_asset failed");
  }
}

/** Update asset model. */
export async function updateAssetModel(assetModelId: string, assetModelName: string): Promise<UpdateAssetModelResult> {
  try {
    // TODO: implement update_asset_model
    throw new Error("update_asset_model not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_asset_model failed");
  }
}

/** Update asset model composite model. */
export async function updateAssetModelCompositeModel(assetModelId: string, assetModelCompositeModelId: string, assetModelCompositeModelName: string): Promise<UpdateAssetModelCompositeModelResult> {
  try {
    // TODO: implement update_asset_model_composite_model
    throw new Error("update_asset_model_composite_model not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_asset_model_composite_model failed");
  }
}

/** Update asset property. */
export async function updateAssetProperty(assetId: string, propertyId: string): Promise<void> {
  try {
    // TODO: implement update_asset_property
    throw new Error("update_asset_property not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_asset_property failed");
  }
}

/** Update computation model. */
export async function updateComputationModel(computationModelId: string, computationModelName: string, computationModelConfiguration: Record<string, unknown>, computationModelDataBinding: Record<string, unknown>): Promise<UpdateComputationModelResult> {
  try {
    // TODO: implement update_computation_model
    throw new Error("update_computation_model not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_computation_model failed");
  }
}

/** Update dashboard. */
export async function updateDashboard(dashboardId: string, dashboardName: string, dashboardDefinition: string): Promise<void> {
  try {
    // TODO: implement update_dashboard
    throw new Error("update_dashboard not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_dashboard failed");
  }
}

/** Update dataset. */
export async function updateDataset(datasetId: string, datasetName: string, datasetSource: Record<string, unknown>): Promise<UpdateDatasetResult> {
  try {
    // TODO: implement update_dataset
    throw new Error("update_dataset not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_dataset failed");
  }
}

/** Update gateway. */
export async function updateGateway(gatewayId: string, gatewayName: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement update_gateway
    throw new Error("update_gateway not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_gateway failed");
  }
}

/** Update gateway capability configuration. */
export async function updateGatewayCapabilityConfiguration(gatewayId: string, capabilityNamespace: string, capabilityConfiguration: string, regionName?: string): Promise<UpdateGatewayCapabilityConfigurationResult> {
  try {
    // TODO: implement update_gateway_capability_configuration
    throw new Error("update_gateway_capability_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_gateway_capability_configuration failed");
  }
}

/** Update portal. */
export async function updatePortal(portalId: string, portalName: string, portalContactEmail: string, roleArn: string): Promise<UpdatePortalResult> {
  try {
    // TODO: implement update_portal
    throw new Error("update_portal not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_portal failed");
  }
}

/** Update project. */
export async function updateProject(projectId: string, projectName: string): Promise<void> {
  try {
    // TODO: implement update_project
    throw new Error("update_project not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_project failed");
  }
}
