import { wrapAwsError } from "./exceptions";

/** Metadata for a DMS replication instance. */
export type ReplicationInstanceResult = {
  replicationInstanceIdentifier: string;
  replicationInstanceArn: string;
  replicationInstanceClass?: string;
  replicationInstanceStatus?: string;
  allocatedStorage?: number;
  availabilityZone?: string;
  engineVersion?: string;
  publiclyAccessible?: boolean;
  multiAz?: boolean;
  extra?: Record<string, unknown>;
};

/** Metadata for a DMS endpoint. */
export type EndpointResult = {
  endpointIdentifier: string;
  endpointArn: string;
  endpointType?: string;
  engineName?: string;
  serverName?: string;
  port?: number;
  databaseName?: string;
  username?: string;
  status?: string;
  sslMode?: string;
  extra?: Record<string, unknown>;
};

/** Metadata for a DMS replication task. */
export type ReplicationTaskResult = {
  replicationTaskIdentifier: string;
  replicationTaskArn: string;
  sourceEndpointArn?: string;
  targetEndpointArn?: string;
  replicationInstanceArn?: string;
  migrationType?: string;
  tableMappings?: string;
  status?: string;
  stopReason?: string;
  replicationTaskStartDate?: string;
  extra?: Record<string, unknown>;
};

/** Metadata for a DMS replication subnet group. */
export type ReplicationSubnetGroupResult = {
  replicationSubnetGroupIdentifier: string;
  replicationSubnetGroupDescription?: string;
  vpcId?: string;
  subnetGroupStatus?: string;
  extra?: Record<string, unknown>;
};

/** Result of a DMS connection test. */
export type ConnectionResult = {
  replicationInstanceArn: string;
  endpointArn: string;
  status?: string;
  lastFailureMessage?: string;
  extra?: Record<string, unknown>;
};

/** Statistics for a table being replicated. */
export type TableStatistic = {
  schemaName?: string;
  tableName?: string;
  inserts?: number;
  deletes?: number;
  updates?: number;
  fullLoadRows?: number;
  tableState?: string;
  extra?: Record<string, unknown>;
};

/** Result of apply_pending_maintenance_action. */
export type ApplyPendingMaintenanceActionResult = {
  resourcePendingMaintenanceActions?: Record<string, unknown>;
};

/** Result of batch_start_recommendations. */
export type BatchStartRecommendationsResult = {
  errorEntries?: Record<string, unknown>[];
};

/** Result of cancel_metadata_model_conversion. */
export type CancelMetadataModelConversionResult = {
  request?: Record<string, unknown>;
};

/** Result of cancel_metadata_model_creation. */
export type CancelMetadataModelCreationResult = {
  request?: Record<string, unknown>;
};

/** Result of cancel_replication_task_assessment_run. */
export type CancelReplicationTaskAssessmentRunResult = {
  replicationTaskAssessmentRun?: Record<string, unknown>;
};

/** Result of create_data_migration. */
export type CreateDataMigrationResult = {
  dataMigration?: Record<string, unknown>;
};

/** Result of create_data_provider. */
export type CreateDataProviderResult = {
  dataProvider?: Record<string, unknown>;
};

/** Result of create_event_subscription. */
export type CreateEventSubscriptionResult = {
  eventSubscription?: Record<string, unknown>;
};

/** Result of create_fleet_advisor_collector. */
export type CreateFleetAdvisorCollectorResult = {
  collectorReferencedId?: string;
  collectorName?: string;
  description?: string;
  serviceAccessRoleArn?: string;
  s3BucketName?: string;
};

/** Result of create_instance_profile. */
export type CreateInstanceProfileResult = {
  instanceProfile?: Record<string, unknown>;
};

/** Result of create_migration_project. */
export type CreateMigrationProjectResult = {
  migrationProject?: Record<string, unknown>;
};

/** Result of create_replication_config. */
export type CreateReplicationConfigResult = {
  replicationConfig?: Record<string, unknown>;
};

/** Result of delete_certificate. */
export type DeleteCertificateResult = {
  certificate?: Record<string, unknown>;
};

/** Result of delete_connection. */
export type DeleteConnectionResult = {
  connection?: Record<string, unknown>;
};

/** Result of delete_data_migration. */
export type DeleteDataMigrationResult = {
  dataMigration?: Record<string, unknown>;
};

/** Result of delete_data_provider. */
export type DeleteDataProviderResult = {
  dataProvider?: Record<string, unknown>;
};

/** Result of delete_event_subscription. */
export type DeleteEventSubscriptionResult = {
  eventSubscription?: Record<string, unknown>;
};

/** Result of delete_fleet_advisor_databases. */
export type DeleteFleetAdvisorDatabasesResult = {
  databaseIds?: string[];
};

/** Result of delete_instance_profile. */
export type DeleteInstanceProfileResult = {
  instanceProfile?: Record<string, unknown>;
};

/** Result of delete_migration_project. */
export type DeleteMigrationProjectResult = {
  migrationProject?: Record<string, unknown>;
};

/** Result of delete_replication_config. */
export type DeleteReplicationConfigResult = {
  replicationConfig?: Record<string, unknown>;
};

/** Result of delete_replication_task_assessment_run. */
export type DeleteReplicationTaskAssessmentRunResult = {
  replicationTaskAssessmentRun?: Record<string, unknown>;
};

/** Result of describe_account_attributes. */
export type DescribeAccountAttributesResult = {
  accountQuotas?: Record<string, unknown>[];
  uniqueAccountIdentifier?: string;
};

/** Result of describe_applicable_individual_assessments. */
export type DescribeApplicableIndividualAssessmentsResult = {
  individualAssessmentNames?: string[];
  marker?: string;
};

/** Result of describe_certificates. */
export type DescribeCertificatesResult = {
  marker?: string;
  certificates?: Record<string, unknown>[];
};

/** Result of describe_conversion_configuration. */
export type DescribeConversionConfigurationResult = {
  migrationProjectIdentifier?: string;
  conversionConfiguration?: string;
};

/** Result of describe_data_migrations. */
export type DescribeDataMigrationsResult = {
  dataMigrations?: Record<string, unknown>[];
  marker?: string;
};

/** Result of describe_data_providers. */
export type DescribeDataProvidersResult = {
  marker?: string;
  dataProviders?: Record<string, unknown>[];
};

/** Result of describe_endpoint_settings. */
export type DescribeEndpointSettingsResult = {
  marker?: string;
  endpointSettings?: Record<string, unknown>[];
};

/** Result of describe_endpoint_types. */
export type DescribeEndpointTypesResult = {
  marker?: string;
  supportedEndpointTypes?: Record<string, unknown>[];
};

/** Result of describe_engine_versions. */
export type DescribeEngineVersionsResult = {
  engineVersions?: Record<string, unknown>[];
  marker?: string;
};

/** Result of describe_event_categories. */
export type DescribeEventCategoriesResult = {
  eventCategoryGroupList?: Record<string, unknown>[];
};

/** Result of describe_event_subscriptions. */
export type DescribeEventSubscriptionsResult = {
  marker?: string;
  eventSubscriptionsList?: Record<string, unknown>[];
};

/** Result of describe_events. */
export type DescribeEventsResult = {
  marker?: string;
  events?: Record<string, unknown>[];
};

/** Result of describe_extension_pack_associations. */
export type DescribeExtensionPackAssociationsResult = {
  marker?: string;
  requests?: Record<string, unknown>[];
};

/** Result of describe_fleet_advisor_collectors. */
export type DescribeFleetAdvisorCollectorsResult = {
  collectors?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of describe_fleet_advisor_databases. */
export type DescribeFleetAdvisorDatabasesResult = {
  databases?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of describe_fleet_advisor_lsa_analysis. */
export type DescribeFleetAdvisorLsaAnalysisResult = {
  analysis?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of describe_fleet_advisor_schema_object_summary. */
export type DescribeFleetAdvisorSchemaObjectSummaryResult = {
  fleetAdvisorSchemaObjects?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of describe_fleet_advisor_schemas. */
export type DescribeFleetAdvisorSchemasResult = {
  fleetAdvisorSchemas?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of describe_instance_profiles. */
export type DescribeInstanceProfilesResult = {
  marker?: string;
  instanceProfiles?: Record<string, unknown>[];
};

/** Result of describe_metadata_model. */
export type DescribeMetadataModelResult = {
  metadataModelName?: string;
  metadataModelType?: string;
  targetMetadataModels?: Record<string, unknown>[];
  definition?: string;
};

/** Result of describe_metadata_model_assessments. */
export type DescribeMetadataModelAssessmentsResult = {
  marker?: string;
  requests?: Record<string, unknown>[];
};

/** Result of describe_metadata_model_children. */
export type DescribeMetadataModelChildrenResult = {
  marker?: string;
  metadataModelChildren?: Record<string, unknown>[];
};

/** Result of describe_metadata_model_conversions. */
export type DescribeMetadataModelConversionsResult = {
  marker?: string;
  requests?: Record<string, unknown>[];
};

/** Result of describe_metadata_model_creations. */
export type DescribeMetadataModelCreationsResult = {
  marker?: string;
  requests?: Record<string, unknown>[];
};

/** Result of describe_metadata_model_exports_as_script. */
export type DescribeMetadataModelExportsAsScriptResult = {
  marker?: string;
  requests?: Record<string, unknown>[];
};

/** Result of describe_metadata_model_exports_to_target. */
export type DescribeMetadataModelExportsToTargetResult = {
  marker?: string;
  requests?: Record<string, unknown>[];
};

/** Result of describe_metadata_model_imports. */
export type DescribeMetadataModelImportsResult = {
  marker?: string;
  requests?: Record<string, unknown>[];
};

/** Result of describe_migration_projects. */
export type DescribeMigrationProjectsResult = {
  marker?: string;
  migrationProjects?: Record<string, unknown>[];
};

/** Result of describe_orderable_replication_instances. */
export type DescribeOrderableReplicationInstancesResult = {
  orderableReplicationInstances?: Record<string, unknown>[];
  marker?: string;
};

/** Result of describe_pending_maintenance_actions. */
export type DescribePendingMaintenanceActionsResult = {
  pendingMaintenanceActions?: Record<string, unknown>[];
  marker?: string;
};

/** Result of describe_recommendation_limitations. */
export type DescribeRecommendationLimitationsResult = {
  nextToken?: string;
  limitations?: Record<string, unknown>[];
};

/** Result of describe_recommendations. */
export type DescribeRecommendationsResult = {
  nextToken?: string;
  recommendations?: Record<string, unknown>[];
};

/** Result of describe_refresh_schemas_status. */
export type DescribeRefreshSchemasStatusResult = {
  refreshSchemasStatus?: Record<string, unknown>;
};

/** Result of describe_replication_configs. */
export type DescribeReplicationConfigsResult = {
  marker?: string;
  replicationConfigs?: Record<string, unknown>[];
};

/** Result of describe_replication_instance_task_logs. */
export type DescribeReplicationInstanceTaskLogsResult = {
  replicationInstanceArn?: string;
  replicationInstanceTaskLogs?: Record<string, unknown>[];
  marker?: string;
};

/** Result of describe_replication_subnet_groups. */
export type DescribeReplicationSubnetGroupsResult = {
  marker?: string;
  replicationSubnetGroups?: Record<string, unknown>[];
};

/** Result of describe_replication_table_statistics. */
export type DescribeReplicationTableStatisticsResult = {
  replicationConfigArn?: string;
  marker?: string;
  replicationTableStatistics?: Record<string, unknown>[];
};

/** Result of describe_replication_task_assessment_results. */
export type DescribeReplicationTaskAssessmentResultsResult = {
  marker?: string;
  bucketName?: string;
  replicationTaskAssessmentResults?: Record<string, unknown>[];
};

/** Result of describe_replication_task_assessment_runs. */
export type DescribeReplicationTaskAssessmentRunsResult = {
  marker?: string;
  replicationTaskAssessmentRuns?: Record<string, unknown>[];
};

/** Result of describe_replication_task_individual_assessments. */
export type DescribeReplicationTaskIndividualAssessmentsResult = {
  marker?: string;
  replicationTaskIndividualAssessments?: Record<string, unknown>[];
};

/** Result of describe_replications. */
export type DescribeReplicationsResult = {
  marker?: string;
  replications?: Record<string, unknown>[];
};

/** Result of describe_schemas. */
export type DescribeSchemasResult = {
  marker?: string;
  schemas?: string[];
};

/** Result of export_metadata_model_assessment. */
export type ExportMetadataModelAssessmentResult = {
  pdfReport?: Record<string, unknown>;
  csvReport?: Record<string, unknown>;
};

/** Result of get_target_selection_rules. */
export type GetTargetSelectionRulesResult = {
  targetSelectionRules?: string;
};

/** Result of import_certificate. */
export type ImportCertificateResult = {
  certificate?: Record<string, unknown>;
};

/** Result of list_tags_for_resource. */
export type ListTagsForResourceResult = {
  tagList?: Record<string, unknown>[];
};

/** Result of modify_conversion_configuration. */
export type ModifyConversionConfigurationResult = {
  migrationProjectIdentifier?: string;
};

/** Result of modify_data_migration. */
export type ModifyDataMigrationResult = {
  dataMigration?: Record<string, unknown>;
};

/** Result of modify_data_provider. */
export type ModifyDataProviderResult = {
  dataProvider?: Record<string, unknown>;
};

/** Result of modify_event_subscription. */
export type ModifyEventSubscriptionResult = {
  eventSubscription?: Record<string, unknown>;
};

/** Result of modify_instance_profile. */
export type ModifyInstanceProfileResult = {
  instanceProfile?: Record<string, unknown>;
};

/** Result of modify_migration_project. */
export type ModifyMigrationProjectResult = {
  migrationProject?: Record<string, unknown>;
};

/** Result of modify_replication_config. */
export type ModifyReplicationConfigResult = {
  replicationConfig?: Record<string, unknown>;
};

/** Result of modify_replication_subnet_group. */
export type ModifyReplicationSubnetGroupResult = {
  replicationSubnetGroup?: Record<string, unknown>;
};

/** Result of modify_replication_task. */
export type ModifyReplicationTaskResult = {
  replicationTask?: Record<string, unknown>;
};

/** Result of move_replication_task. */
export type MoveReplicationTaskResult = {
  replicationTask?: Record<string, unknown>;
};

/** Result of reboot_replication_instance. */
export type RebootReplicationInstanceResult = {
  replicationInstance?: Record<string, unknown>;
};

/** Result of refresh_schemas. */
export type RefreshSchemasResult = {
  refreshSchemasStatus?: Record<string, unknown>;
};

/** Result of reload_replication_tables. */
export type ReloadReplicationTablesResult = {
  replicationConfigArn?: string;
};

/** Result of reload_tables. */
export type ReloadTablesResult = {
  replicationTaskArn?: string;
};

/** Result of run_connection. */
export type RunConnectionResult = {
  connection?: Record<string, unknown>;
};

/** Result of run_fleet_advisor_lsa_analysis. */
export type RunFleetAdvisorLsaAnalysisResult = {
  lsaAnalysisId?: string;
  status?: string;
};

/** Result of start_data_migration. */
export type StartDataMigrationResult = {
  dataMigration?: Record<string, unknown>;
};

/** Result of start_extension_pack_association. */
export type StartExtensionPackAssociationResult = {
  requestIdentifier?: string;
};

/** Result of start_metadata_model_assessment. */
export type StartMetadataModelAssessmentResult = {
  requestIdentifier?: string;
};

/** Result of start_metadata_model_conversion. */
export type StartMetadataModelConversionResult = {
  requestIdentifier?: string;
};

/** Result of start_metadata_model_creation. */
export type StartMetadataModelCreationResult = {
  requestIdentifier?: string;
};

/** Result of start_metadata_model_export_as_script. */
export type StartMetadataModelExportAsScriptResult = {
  requestIdentifier?: string;
};

/** Result of start_metadata_model_export_to_target. */
export type StartMetadataModelExportToTargetResult = {
  requestIdentifier?: string;
};

/** Result of start_metadata_model_import. */
export type StartMetadataModelImportResult = {
  requestIdentifier?: string;
};

/** Result of start_replication. */
export type StartReplicationResult = {
  replication?: Record<string, unknown>;
};

/** Result of start_replication_task_assessment. */
export type StartReplicationTaskAssessmentResult = {
  replicationTask?: Record<string, unknown>;
};

/** Result of start_replication_task_assessment_run. */
export type StartReplicationTaskAssessmentRunResult = {
  replicationTaskAssessmentRun?: Record<string, unknown>;
};

/** Result of stop_data_migration. */
export type StopDataMigrationResult = {
  dataMigration?: Record<string, unknown>;
};

/** Result of stop_replication. */
export type StopReplicationResult = {
  replication?: Record<string, unknown>;
};

/** Result of update_subscriptions_to_event_bridge. */
export type UpdateSubscriptionsToEventBridgeResult = {
  result?: string;
};

/** Create a DMS replication instance. */
export async function createReplicationInstance(replicationInstanceIdentifier: string, replicationInstanceClass: string): Promise<ReplicationInstanceResult> {
  try {
    // TODO: implement create_replication_instance
    throw new Error("create_replication_instance not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_replication_instance failed");
  }
}

/** Describe all DMS replication instances. */
export async function describeReplicationInstances(): Promise<ReplicationInstanceResult[]> {
  try {
    // TODO: implement describe_replication_instances
    throw new Error("describe_replication_instances not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_replication_instances failed");
  }
}

/** Modify a DMS replication instance. */
export async function modifyReplicationInstance(replicationInstanceArn: string): Promise<ReplicationInstanceResult> {
  try {
    // TODO: implement modify_replication_instance
    throw new Error("modify_replication_instance not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_replication_instance failed");
  }
}

/** Delete a DMS replication instance. */
export async function deleteReplicationInstance(replicationInstanceArn: string): Promise<ReplicationInstanceResult> {
  try {
    // TODO: implement delete_replication_instance
    throw new Error("delete_replication_instance not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_replication_instance failed");
  }
}

/** Poll until a replication instance reaches target status. */
export async function waitForReplicationInstance(replicationInstanceArn: string): Promise<ReplicationInstanceResult> {
  try {
    // TODO: implement wait_for_replication_instance
    throw new Error("wait_for_replication_instance not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "wait_for_replication_instance failed");
  }
}

/** Create a DMS endpoint. */
export async function createEndpoint(endpointIdentifier: string, endpointType: string, engineName: string): Promise<EndpointResult> {
  try {
    // TODO: implement create_endpoint
    throw new Error("create_endpoint not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_endpoint failed");
  }
}

/** Describe all DMS endpoints. */
export async function describeEndpoints(): Promise<EndpointResult[]> {
  try {
    // TODO: implement describe_endpoints
    throw new Error("describe_endpoints not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_endpoints failed");
  }
}

/** Modify a DMS endpoint. */
export async function modifyEndpoint(endpointArn: string): Promise<EndpointResult> {
  try {
    // TODO: implement modify_endpoint
    throw new Error("modify_endpoint not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_endpoint failed");
  }
}

/** Delete a DMS endpoint. */
export async function deleteEndpoint(endpointArn: string): Promise<EndpointResult> {
  try {
    // TODO: implement delete_endpoint
    throw new Error("delete_endpoint not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_endpoint failed");
  }
}

/** Test connectivity between a replication instance and endpoint. */
export async function testConnection(replicationInstanceArn: string, endpointArn: string): Promise<ConnectionResult> {
  try {
    // TODO: implement test_connection
    throw new Error("test_connection not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "test_connection failed");
  }
}

/** Describe DMS connections. */
export async function describeConnections(): Promise<ConnectionResult[]> {
  try {
    // TODO: implement describe_connections
    throw new Error("describe_connections not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_connections failed");
  }
}

/** Create a DMS replication task. */
export async function createReplicationTask(replicationTaskIdentifier: string, sourceEndpointArn: string, targetEndpointArn: string, replicationInstanceArn: string, migrationType: string, tableMappings: string): Promise<ReplicationTaskResult> {
  try {
    // TODO: implement create_replication_task
    throw new Error("create_replication_task not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_replication_task failed");
  }
}

/** Describe all DMS replication tasks. */
export async function describeReplicationTasks(): Promise<ReplicationTaskResult[]> {
  try {
    // TODO: implement describe_replication_tasks
    throw new Error("describe_replication_tasks not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_replication_tasks failed");
  }
}

/** Start a DMS replication task. */
export async function startReplicationTask(replicationTaskArn: string, startReplicationTaskType: string): Promise<ReplicationTaskResult> {
  try {
    // TODO: implement start_replication_task
    throw new Error("start_replication_task not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_replication_task failed");
  }
}

/** Stop a DMS replication task. */
export async function stopReplicationTask(replicationTaskArn: string): Promise<ReplicationTaskResult> {
  try {
    // TODO: implement stop_replication_task
    throw new Error("stop_replication_task not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "stop_replication_task failed");
  }
}

/** Delete a DMS replication task. */
export async function deleteReplicationTask(replicationTaskArn: string): Promise<ReplicationTaskResult> {
  try {
    // TODO: implement delete_replication_task
    throw new Error("delete_replication_task not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_replication_task failed");
  }
}

/** Poll until a replication task reaches target status. */
export async function waitForReplicationTask(replicationTaskArn: string): Promise<ReplicationTaskResult> {
  try {
    // TODO: implement wait_for_replication_task
    throw new Error("wait_for_replication_task not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "wait_for_replication_task failed");
  }
}

/** Describe table statistics for a replication task. */
export async function describeTableStatistics(replicationTaskArn: string): Promise<TableStatistic[]> {
  try {
    // TODO: implement describe_table_statistics
    throw new Error("describe_table_statistics not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_table_statistics failed");
  }
}

/** Create a DMS replication subnet group. */
export async function createReplicationSubnetGroup(replicationSubnetGroupIdentifier: string, replicationSubnetGroupDescription: string, subnetIds: string[]): Promise<ReplicationSubnetGroupResult> {
  try {
    // TODO: implement create_replication_subnet_group
    throw new Error("create_replication_subnet_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_replication_subnet_group failed");
  }
}

/** Add tags to resource. */
export async function addTagsToResource(resourceArn: string, tags: Record<string, unknown>[], regionName?: string): Promise<void> {
  try {
    // TODO: implement add_tags_to_resource
    throw new Error("add_tags_to_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "add_tags_to_resource failed");
  }
}

/** Apply pending maintenance action. */
export async function applyPendingMaintenanceAction(replicationInstanceArn: string, applyAction: string, optInType: string, regionName?: string): Promise<ApplyPendingMaintenanceActionResult> {
  try {
    // TODO: implement apply_pending_maintenance_action
    throw new Error("apply_pending_maintenance_action not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "apply_pending_maintenance_action failed");
  }
}

/** Batch start recommendations. */
export async function batchStartRecommendations(): Promise<BatchStartRecommendationsResult> {
  try {
    // TODO: implement batch_start_recommendations
    throw new Error("batch_start_recommendations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_start_recommendations failed");
  }
}

/** Cancel metadata model conversion. */
export async function cancelMetadataModelConversion(migrationProjectIdentifier: string, requestIdentifier: string, regionName?: string): Promise<CancelMetadataModelConversionResult> {
  try {
    // TODO: implement cancel_metadata_model_conversion
    throw new Error("cancel_metadata_model_conversion not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "cancel_metadata_model_conversion failed");
  }
}

/** Cancel metadata model creation. */
export async function cancelMetadataModelCreation(migrationProjectIdentifier: string, requestIdentifier: string, regionName?: string): Promise<CancelMetadataModelCreationResult> {
  try {
    // TODO: implement cancel_metadata_model_creation
    throw new Error("cancel_metadata_model_creation not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "cancel_metadata_model_creation failed");
  }
}

/** Cancel replication task assessment run. */
export async function cancelReplicationTaskAssessmentRun(replicationTaskAssessmentRunArn: string, regionName?: string): Promise<CancelReplicationTaskAssessmentRunResult> {
  try {
    // TODO: implement cancel_replication_task_assessment_run
    throw new Error("cancel_replication_task_assessment_run not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "cancel_replication_task_assessment_run failed");
  }
}

/** Create data migration. */
export async function createDataMigration(migrationProjectIdentifier: string, dataMigrationType: string, serviceAccessRoleArn: string): Promise<CreateDataMigrationResult> {
  try {
    // TODO: implement create_data_migration
    throw new Error("create_data_migration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_data_migration failed");
  }
}

/** Create data provider. */
export async function createDataProvider(engine: string, settings: Record<string, unknown>): Promise<CreateDataProviderResult> {
  try {
    // TODO: implement create_data_provider
    throw new Error("create_data_provider not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_data_provider failed");
  }
}

/** Create event subscription. */
export async function createEventSubscription(subscriptionName: string, snsTopicArn: string): Promise<CreateEventSubscriptionResult> {
  try {
    // TODO: implement create_event_subscription
    throw new Error("create_event_subscription not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_event_subscription failed");
  }
}

/** Create fleet advisor collector. */
export async function createFleetAdvisorCollector(collectorName: string, serviceAccessRoleArn: string, s3BucketName: string): Promise<CreateFleetAdvisorCollectorResult> {
  try {
    // TODO: implement create_fleet_advisor_collector
    throw new Error("create_fleet_advisor_collector not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_fleet_advisor_collector failed");
  }
}

/** Create instance profile. */
export async function createInstanceProfile(): Promise<CreateInstanceProfileResult> {
  try {
    // TODO: implement create_instance_profile
    throw new Error("create_instance_profile not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_instance_profile failed");
  }
}

/** Create migration project. */
export async function createMigrationProject(sourceDataProviderDescriptors: Record<string, unknown>[], targetDataProviderDescriptors: Record<string, unknown>[], instanceProfileIdentifier: string): Promise<CreateMigrationProjectResult> {
  try {
    // TODO: implement create_migration_project
    throw new Error("create_migration_project not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_migration_project failed");
  }
}

/** Create replication config. */
export async function createReplicationConfig(replicationConfigIdentifier: string, sourceEndpointArn: string, targetEndpointArn: string, computeConfig: Record<string, unknown>, replicationType: string, tableMappings: string): Promise<CreateReplicationConfigResult> {
  try {
    // TODO: implement create_replication_config
    throw new Error("create_replication_config not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_replication_config failed");
  }
}

/** Delete certificate. */
export async function deleteCertificate(certificateArn: string, regionName?: string): Promise<DeleteCertificateResult> {
  try {
    // TODO: implement delete_certificate
    throw new Error("delete_certificate not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_certificate failed");
  }
}

/** Delete connection. */
export async function deleteConnection(endpointArn: string, replicationInstanceArn: string, regionName?: string): Promise<DeleteConnectionResult> {
  try {
    // TODO: implement delete_connection
    throw new Error("delete_connection not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_connection failed");
  }
}

/** Delete data migration. */
export async function deleteDataMigration(dataMigrationIdentifier: string, regionName?: string): Promise<DeleteDataMigrationResult> {
  try {
    // TODO: implement delete_data_migration
    throw new Error("delete_data_migration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_data_migration failed");
  }
}

/** Delete data provider. */
export async function deleteDataProvider(dataProviderIdentifier: string, regionName?: string): Promise<DeleteDataProviderResult> {
  try {
    // TODO: implement delete_data_provider
    throw new Error("delete_data_provider not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_data_provider failed");
  }
}

/** Delete event subscription. */
export async function deleteEventSubscription(subscriptionName: string, regionName?: string): Promise<DeleteEventSubscriptionResult> {
  try {
    // TODO: implement delete_event_subscription
    throw new Error("delete_event_subscription not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_event_subscription failed");
  }
}

/** Delete fleet advisor collector. */
export async function deleteFleetAdvisorCollector(collectorReferencedId: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_fleet_advisor_collector
    throw new Error("delete_fleet_advisor_collector not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_fleet_advisor_collector failed");
  }
}

/** Delete fleet advisor databases. */
export async function deleteFleetAdvisorDatabases(databaseIds: string[], regionName?: string): Promise<DeleteFleetAdvisorDatabasesResult> {
  try {
    // TODO: implement delete_fleet_advisor_databases
    throw new Error("delete_fleet_advisor_databases not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_fleet_advisor_databases failed");
  }
}

/** Delete instance profile. */
export async function deleteInstanceProfile(instanceProfileIdentifier: string, regionName?: string): Promise<DeleteInstanceProfileResult> {
  try {
    // TODO: implement delete_instance_profile
    throw new Error("delete_instance_profile not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_instance_profile failed");
  }
}

/** Delete migration project. */
export async function deleteMigrationProject(migrationProjectIdentifier: string, regionName?: string): Promise<DeleteMigrationProjectResult> {
  try {
    // TODO: implement delete_migration_project
    throw new Error("delete_migration_project not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_migration_project failed");
  }
}

/** Delete replication config. */
export async function deleteReplicationConfig(replicationConfigArn: string, regionName?: string): Promise<DeleteReplicationConfigResult> {
  try {
    // TODO: implement delete_replication_config
    throw new Error("delete_replication_config not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_replication_config failed");
  }
}

/** Delete replication subnet group. */
export async function deleteReplicationSubnetGroup(replicationSubnetGroupIdentifier: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_replication_subnet_group
    throw new Error("delete_replication_subnet_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_replication_subnet_group failed");
  }
}

/** Delete replication task assessment run. */
export async function deleteReplicationTaskAssessmentRun(replicationTaskAssessmentRunArn: string, regionName?: string): Promise<DeleteReplicationTaskAssessmentRunResult> {
  try {
    // TODO: implement delete_replication_task_assessment_run
    throw new Error("delete_replication_task_assessment_run not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_replication_task_assessment_run failed");
  }
}

/** Describe account attributes. */
export async function describeAccountAttributes(regionName?: string): Promise<DescribeAccountAttributesResult> {
  try {
    // TODO: implement describe_account_attributes
    throw new Error("describe_account_attributes not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_account_attributes failed");
  }
}

/** Describe applicable individual assessments. */
export async function describeApplicableIndividualAssessments(): Promise<DescribeApplicableIndividualAssessmentsResult> {
  try {
    // TODO: implement describe_applicable_individual_assessments
    throw new Error("describe_applicable_individual_assessments not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_applicable_individual_assessments failed");
  }
}

/** Describe certificates. */
export async function describeCertificates(): Promise<DescribeCertificatesResult> {
  try {
    // TODO: implement describe_certificates
    throw new Error("describe_certificates not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_certificates failed");
  }
}

/** Describe conversion configuration. */
export async function describeConversionConfiguration(migrationProjectIdentifier: string, regionName?: string): Promise<DescribeConversionConfigurationResult> {
  try {
    // TODO: implement describe_conversion_configuration
    throw new Error("describe_conversion_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_conversion_configuration failed");
  }
}

/** Describe data migrations. */
export async function describeDataMigrations(): Promise<DescribeDataMigrationsResult> {
  try {
    // TODO: implement describe_data_migrations
    throw new Error("describe_data_migrations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_data_migrations failed");
  }
}

/** Describe data providers. */
export async function describeDataProviders(): Promise<DescribeDataProvidersResult> {
  try {
    // TODO: implement describe_data_providers
    throw new Error("describe_data_providers not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_data_providers failed");
  }
}

/** Describe endpoint settings. */
export async function describeEndpointSettings(engineName: string): Promise<DescribeEndpointSettingsResult> {
  try {
    // TODO: implement describe_endpoint_settings
    throw new Error("describe_endpoint_settings not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_endpoint_settings failed");
  }
}

/** Describe endpoint types. */
export async function describeEndpointTypes(): Promise<DescribeEndpointTypesResult> {
  try {
    // TODO: implement describe_endpoint_types
    throw new Error("describe_endpoint_types not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_endpoint_types failed");
  }
}

/** Describe engine versions. */
export async function describeEngineVersions(): Promise<DescribeEngineVersionsResult> {
  try {
    // TODO: implement describe_engine_versions
    throw new Error("describe_engine_versions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_engine_versions failed");
  }
}

/** Describe event categories. */
export async function describeEventCategories(): Promise<DescribeEventCategoriesResult> {
  try {
    // TODO: implement describe_event_categories
    throw new Error("describe_event_categories not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_event_categories failed");
  }
}

/** Describe event subscriptions. */
export async function describeEventSubscriptions(): Promise<DescribeEventSubscriptionsResult> {
  try {
    // TODO: implement describe_event_subscriptions
    throw new Error("describe_event_subscriptions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_event_subscriptions failed");
  }
}

/** Describe events. */
export async function describeEvents(): Promise<DescribeEventsResult> {
  try {
    // TODO: implement describe_events
    throw new Error("describe_events not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_events failed");
  }
}

/** Describe extension pack associations. */
export async function describeExtensionPackAssociations(migrationProjectIdentifier: string): Promise<DescribeExtensionPackAssociationsResult> {
  try {
    // TODO: implement describe_extension_pack_associations
    throw new Error("describe_extension_pack_associations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_extension_pack_associations failed");
  }
}

/** Describe fleet advisor collectors. */
export async function describeFleetAdvisorCollectors(): Promise<DescribeFleetAdvisorCollectorsResult> {
  try {
    // TODO: implement describe_fleet_advisor_collectors
    throw new Error("describe_fleet_advisor_collectors not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_fleet_advisor_collectors failed");
  }
}

/** Describe fleet advisor databases. */
export async function describeFleetAdvisorDatabases(): Promise<DescribeFleetAdvisorDatabasesResult> {
  try {
    // TODO: implement describe_fleet_advisor_databases
    throw new Error("describe_fleet_advisor_databases not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_fleet_advisor_databases failed");
  }
}

/** Describe fleet advisor lsa analysis. */
export async function describeFleetAdvisorLsaAnalysis(): Promise<DescribeFleetAdvisorLsaAnalysisResult> {
  try {
    // TODO: implement describe_fleet_advisor_lsa_analysis
    throw new Error("describe_fleet_advisor_lsa_analysis not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_fleet_advisor_lsa_analysis failed");
  }
}

/** Describe fleet advisor schema object summary. */
export async function describeFleetAdvisorSchemaObjectSummary(): Promise<DescribeFleetAdvisorSchemaObjectSummaryResult> {
  try {
    // TODO: implement describe_fleet_advisor_schema_object_summary
    throw new Error("describe_fleet_advisor_schema_object_summary not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_fleet_advisor_schema_object_summary failed");
  }
}

/** Describe fleet advisor schemas. */
export async function describeFleetAdvisorSchemas(): Promise<DescribeFleetAdvisorSchemasResult> {
  try {
    // TODO: implement describe_fleet_advisor_schemas
    throw new Error("describe_fleet_advisor_schemas not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_fleet_advisor_schemas failed");
  }
}

/** Describe instance profiles. */
export async function describeInstanceProfiles(): Promise<DescribeInstanceProfilesResult> {
  try {
    // TODO: implement describe_instance_profiles
    throw new Error("describe_instance_profiles not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_instance_profiles failed");
  }
}

/** Describe metadata model. */
export async function describeMetadataModel(selectionRules: string, migrationProjectIdentifier: string, origin: string, regionName?: string): Promise<DescribeMetadataModelResult> {
  try {
    // TODO: implement describe_metadata_model
    throw new Error("describe_metadata_model not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_metadata_model failed");
  }
}

/** Describe metadata model assessments. */
export async function describeMetadataModelAssessments(migrationProjectIdentifier: string): Promise<DescribeMetadataModelAssessmentsResult> {
  try {
    // TODO: implement describe_metadata_model_assessments
    throw new Error("describe_metadata_model_assessments not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_metadata_model_assessments failed");
  }
}

/** Describe metadata model children. */
export async function describeMetadataModelChildren(selectionRules: string, migrationProjectIdentifier: string, origin: string): Promise<DescribeMetadataModelChildrenResult> {
  try {
    // TODO: implement describe_metadata_model_children
    throw new Error("describe_metadata_model_children not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_metadata_model_children failed");
  }
}

/** Describe metadata model conversions. */
export async function describeMetadataModelConversions(migrationProjectIdentifier: string): Promise<DescribeMetadataModelConversionsResult> {
  try {
    // TODO: implement describe_metadata_model_conversions
    throw new Error("describe_metadata_model_conversions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_metadata_model_conversions failed");
  }
}

/** Describe metadata model creations. */
export async function describeMetadataModelCreations(migrationProjectIdentifier: string): Promise<DescribeMetadataModelCreationsResult> {
  try {
    // TODO: implement describe_metadata_model_creations
    throw new Error("describe_metadata_model_creations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_metadata_model_creations failed");
  }
}

/** Describe metadata model exports as script. */
export async function describeMetadataModelExportsAsScript(migrationProjectIdentifier: string): Promise<DescribeMetadataModelExportsAsScriptResult> {
  try {
    // TODO: implement describe_metadata_model_exports_as_script
    throw new Error("describe_metadata_model_exports_as_script not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_metadata_model_exports_as_script failed");
  }
}

/** Describe metadata model exports to target. */
export async function describeMetadataModelExportsToTarget(migrationProjectIdentifier: string): Promise<DescribeMetadataModelExportsToTargetResult> {
  try {
    // TODO: implement describe_metadata_model_exports_to_target
    throw new Error("describe_metadata_model_exports_to_target not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_metadata_model_exports_to_target failed");
  }
}

/** Describe metadata model imports. */
export async function describeMetadataModelImports(migrationProjectIdentifier: string): Promise<DescribeMetadataModelImportsResult> {
  try {
    // TODO: implement describe_metadata_model_imports
    throw new Error("describe_metadata_model_imports not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_metadata_model_imports failed");
  }
}

/** Describe migration projects. */
export async function describeMigrationProjects(): Promise<DescribeMigrationProjectsResult> {
  try {
    // TODO: implement describe_migration_projects
    throw new Error("describe_migration_projects not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_migration_projects failed");
  }
}

/** Describe orderable replication instances. */
export async function describeOrderableReplicationInstances(): Promise<DescribeOrderableReplicationInstancesResult> {
  try {
    // TODO: implement describe_orderable_replication_instances
    throw new Error("describe_orderable_replication_instances not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_orderable_replication_instances failed");
  }
}

/** Describe pending maintenance actions. */
export async function describePendingMaintenanceActions(): Promise<DescribePendingMaintenanceActionsResult> {
  try {
    // TODO: implement describe_pending_maintenance_actions
    throw new Error("describe_pending_maintenance_actions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_pending_maintenance_actions failed");
  }
}

/** Describe recommendation limitations. */
export async function describeRecommendationLimitations(): Promise<DescribeRecommendationLimitationsResult> {
  try {
    // TODO: implement describe_recommendation_limitations
    throw new Error("describe_recommendation_limitations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_recommendation_limitations failed");
  }
}

/** Describe recommendations. */
export async function describeRecommendations(): Promise<DescribeRecommendationsResult> {
  try {
    // TODO: implement describe_recommendations
    throw new Error("describe_recommendations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_recommendations failed");
  }
}

/** Describe refresh schemas status. */
export async function describeRefreshSchemasStatus(endpointArn: string, regionName?: string): Promise<DescribeRefreshSchemasStatusResult> {
  try {
    // TODO: implement describe_refresh_schemas_status
    throw new Error("describe_refresh_schemas_status not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_refresh_schemas_status failed");
  }
}

/** Describe replication configs. */
export async function describeReplicationConfigs(): Promise<DescribeReplicationConfigsResult> {
  try {
    // TODO: implement describe_replication_configs
    throw new Error("describe_replication_configs not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_replication_configs failed");
  }
}

/** Describe replication instance task logs. */
export async function describeReplicationInstanceTaskLogs(replicationInstanceArn: string): Promise<DescribeReplicationInstanceTaskLogsResult> {
  try {
    // TODO: implement describe_replication_instance_task_logs
    throw new Error("describe_replication_instance_task_logs not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_replication_instance_task_logs failed");
  }
}

/** Describe replication subnet groups. */
export async function describeReplicationSubnetGroups(): Promise<DescribeReplicationSubnetGroupsResult> {
  try {
    // TODO: implement describe_replication_subnet_groups
    throw new Error("describe_replication_subnet_groups not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_replication_subnet_groups failed");
  }
}

/** Describe replication table statistics. */
export async function describeReplicationTableStatistics(replicationConfigArn: string): Promise<DescribeReplicationTableStatisticsResult> {
  try {
    // TODO: implement describe_replication_table_statistics
    throw new Error("describe_replication_table_statistics not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_replication_table_statistics failed");
  }
}

/** Describe replication task assessment results. */
export async function describeReplicationTaskAssessmentResults(): Promise<DescribeReplicationTaskAssessmentResultsResult> {
  try {
    // TODO: implement describe_replication_task_assessment_results
    throw new Error("describe_replication_task_assessment_results not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_replication_task_assessment_results failed");
  }
}

/** Describe replication task assessment runs. */
export async function describeReplicationTaskAssessmentRuns(): Promise<DescribeReplicationTaskAssessmentRunsResult> {
  try {
    // TODO: implement describe_replication_task_assessment_runs
    throw new Error("describe_replication_task_assessment_runs not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_replication_task_assessment_runs failed");
  }
}

/** Describe replication task individual assessments. */
export async function describeReplicationTaskIndividualAssessments(): Promise<DescribeReplicationTaskIndividualAssessmentsResult> {
  try {
    // TODO: implement describe_replication_task_individual_assessments
    throw new Error("describe_replication_task_individual_assessments not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_replication_task_individual_assessments failed");
  }
}

/** Describe replications. */
export async function describeReplications(): Promise<DescribeReplicationsResult> {
  try {
    // TODO: implement describe_replications
    throw new Error("describe_replications not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_replications failed");
  }
}

/** Describe schemas. */
export async function describeSchemas(endpointArn: string): Promise<DescribeSchemasResult> {
  try {
    // TODO: implement describe_schemas
    throw new Error("describe_schemas not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_schemas failed");
  }
}

/** Export metadata model assessment. */
export async function exportMetadataModelAssessment(migrationProjectIdentifier: string, selectionRules: string): Promise<ExportMetadataModelAssessmentResult> {
  try {
    // TODO: implement export_metadata_model_assessment
    throw new Error("export_metadata_model_assessment not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "export_metadata_model_assessment failed");
  }
}

/** Get target selection rules. */
export async function getTargetSelectionRules(migrationProjectIdentifier: string, selectionRules: string, regionName?: string): Promise<GetTargetSelectionRulesResult> {
  try {
    // TODO: implement get_target_selection_rules
    throw new Error("get_target_selection_rules not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_target_selection_rules failed");
  }
}

/** Import certificate. */
export async function importCertificate(certificateIdentifier: string): Promise<ImportCertificateResult> {
  try {
    // TODO: implement import_certificate
    throw new Error("import_certificate not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "import_certificate failed");
  }
}

/** List tags for resource. */
export async function listTagsForResource(): Promise<ListTagsForResourceResult> {
  try {
    // TODO: implement list_tags_for_resource
    throw new Error("list_tags_for_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_tags_for_resource failed");
  }
}

/** Modify conversion configuration. */
export async function modifyConversionConfiguration(migrationProjectIdentifier: string, conversionConfiguration: string, regionName?: string): Promise<ModifyConversionConfigurationResult> {
  try {
    // TODO: implement modify_conversion_configuration
    throw new Error("modify_conversion_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_conversion_configuration failed");
  }
}

/** Modify data migration. */
export async function modifyDataMigration(dataMigrationIdentifier: string): Promise<ModifyDataMigrationResult> {
  try {
    // TODO: implement modify_data_migration
    throw new Error("modify_data_migration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_data_migration failed");
  }
}

/** Modify data provider. */
export async function modifyDataProvider(dataProviderIdentifier: string): Promise<ModifyDataProviderResult> {
  try {
    // TODO: implement modify_data_provider
    throw new Error("modify_data_provider not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_data_provider failed");
  }
}

/** Modify event subscription. */
export async function modifyEventSubscription(subscriptionName: string): Promise<ModifyEventSubscriptionResult> {
  try {
    // TODO: implement modify_event_subscription
    throw new Error("modify_event_subscription not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_event_subscription failed");
  }
}

/** Modify instance profile. */
export async function modifyInstanceProfile(instanceProfileIdentifier: string): Promise<ModifyInstanceProfileResult> {
  try {
    // TODO: implement modify_instance_profile
    throw new Error("modify_instance_profile not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_instance_profile failed");
  }
}

/** Modify migration project. */
export async function modifyMigrationProject(migrationProjectIdentifier: string): Promise<ModifyMigrationProjectResult> {
  try {
    // TODO: implement modify_migration_project
    throw new Error("modify_migration_project not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_migration_project failed");
  }
}

/** Modify replication config. */
export async function modifyReplicationConfig(replicationConfigArn: string): Promise<ModifyReplicationConfigResult> {
  try {
    // TODO: implement modify_replication_config
    throw new Error("modify_replication_config not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_replication_config failed");
  }
}

/** Modify replication subnet group. */
export async function modifyReplicationSubnetGroup(replicationSubnetGroupIdentifier: string, subnetIds: string[]): Promise<ModifyReplicationSubnetGroupResult> {
  try {
    // TODO: implement modify_replication_subnet_group
    throw new Error("modify_replication_subnet_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_replication_subnet_group failed");
  }
}

/** Modify replication task. */
export async function modifyReplicationTask(replicationTaskArn: string): Promise<ModifyReplicationTaskResult> {
  try {
    // TODO: implement modify_replication_task
    throw new Error("modify_replication_task not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_replication_task failed");
  }
}

/** Move replication task. */
export async function moveReplicationTask(replicationTaskArn: string, targetReplicationInstanceArn: string, regionName?: string): Promise<MoveReplicationTaskResult> {
  try {
    // TODO: implement move_replication_task
    throw new Error("move_replication_task not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "move_replication_task failed");
  }
}

/** Reboot replication instance. */
export async function rebootReplicationInstance(replicationInstanceArn: string): Promise<RebootReplicationInstanceResult> {
  try {
    // TODO: implement reboot_replication_instance
    throw new Error("reboot_replication_instance not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "reboot_replication_instance failed");
  }
}

/** Refresh schemas. */
export async function refreshSchemas(endpointArn: string, replicationInstanceArn: string, regionName?: string): Promise<RefreshSchemasResult> {
  try {
    // TODO: implement refresh_schemas
    throw new Error("refresh_schemas not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "refresh_schemas failed");
  }
}

/** Reload replication tables. */
export async function reloadReplicationTables(replicationConfigArn: string, tablesToReload: Record<string, unknown>[]): Promise<ReloadReplicationTablesResult> {
  try {
    // TODO: implement reload_replication_tables
    throw new Error("reload_replication_tables not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "reload_replication_tables failed");
  }
}

/** Reload tables. */
export async function reloadTables(replicationTaskArn: string, tablesToReload: Record<string, unknown>[]): Promise<ReloadTablesResult> {
  try {
    // TODO: implement reload_tables
    throw new Error("reload_tables not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "reload_tables failed");
  }
}

/** Remove tags from resource. */
export async function removeTagsFromResource(resourceArn: string, tagKeys: string[], regionName?: string): Promise<void> {
  try {
    // TODO: implement remove_tags_from_resource
    throw new Error("remove_tags_from_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "remove_tags_from_resource failed");
  }
}

/** Run connection. */
export async function runConnection(replicationInstanceArn: string, endpointArn: string, regionName?: string): Promise<RunConnectionResult> {
  try {
    // TODO: implement run_connection
    throw new Error("run_connection not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "run_connection failed");
  }
}

/** Run fleet advisor lsa analysis. */
export async function runFleetAdvisorLsaAnalysis(regionName?: string): Promise<RunFleetAdvisorLsaAnalysisResult> {
  try {
    // TODO: implement run_fleet_advisor_lsa_analysis
    throw new Error("run_fleet_advisor_lsa_analysis not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "run_fleet_advisor_lsa_analysis failed");
  }
}

/** Start data migration. */
export async function startDataMigration(dataMigrationIdentifier: string, startType: string, regionName?: string): Promise<StartDataMigrationResult> {
  try {
    // TODO: implement start_data_migration
    throw new Error("start_data_migration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_data_migration failed");
  }
}

/** Start extension pack association. */
export async function startExtensionPackAssociation(migrationProjectIdentifier: string, regionName?: string): Promise<StartExtensionPackAssociationResult> {
  try {
    // TODO: implement start_extension_pack_association
    throw new Error("start_extension_pack_association not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_extension_pack_association failed");
  }
}

/** Start metadata model assessment. */
export async function startMetadataModelAssessment(migrationProjectIdentifier: string, selectionRules: string, regionName?: string): Promise<StartMetadataModelAssessmentResult> {
  try {
    // TODO: implement start_metadata_model_assessment
    throw new Error("start_metadata_model_assessment not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_metadata_model_assessment failed");
  }
}

/** Start metadata model conversion. */
export async function startMetadataModelConversion(migrationProjectIdentifier: string, selectionRules: string, regionName?: string): Promise<StartMetadataModelConversionResult> {
  try {
    // TODO: implement start_metadata_model_conversion
    throw new Error("start_metadata_model_conversion not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_metadata_model_conversion failed");
  }
}

/** Start metadata model creation. */
export async function startMetadataModelCreation(migrationProjectIdentifier: string, selectionRules: string, metadataModelName: string, properties: Record<string, unknown>, regionName?: string): Promise<StartMetadataModelCreationResult> {
  try {
    // TODO: implement start_metadata_model_creation
    throw new Error("start_metadata_model_creation not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_metadata_model_creation failed");
  }
}

/** Start metadata model export as script. */
export async function startMetadataModelExportAsScript(migrationProjectIdentifier: string, selectionRules: string, origin: string): Promise<StartMetadataModelExportAsScriptResult> {
  try {
    // TODO: implement start_metadata_model_export_as_script
    throw new Error("start_metadata_model_export_as_script not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_metadata_model_export_as_script failed");
  }
}

/** Start metadata model export to target. */
export async function startMetadataModelExportToTarget(migrationProjectIdentifier: string, selectionRules: string): Promise<StartMetadataModelExportToTargetResult> {
  try {
    // TODO: implement start_metadata_model_export_to_target
    throw new Error("start_metadata_model_export_to_target not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_metadata_model_export_to_target failed");
  }
}

/** Start metadata model import. */
export async function startMetadataModelImport(migrationProjectIdentifier: string, selectionRules: string, origin: string): Promise<StartMetadataModelImportResult> {
  try {
    // TODO: implement start_metadata_model_import
    throw new Error("start_metadata_model_import not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_metadata_model_import failed");
  }
}

/** Start recommendations. */
export async function startRecommendations(databaseId: string, settings: Record<string, unknown>, regionName?: string): Promise<void> {
  try {
    // TODO: implement start_recommendations
    throw new Error("start_recommendations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_recommendations failed");
  }
}

/** Start replication. */
export async function startReplication(replicationConfigArn: string, startReplicationType: string): Promise<StartReplicationResult> {
  try {
    // TODO: implement start_replication
    throw new Error("start_replication not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_replication failed");
  }
}

/** Start replication task assessment. */
export async function startReplicationTaskAssessment(replicationTaskArn: string, regionName?: string): Promise<StartReplicationTaskAssessmentResult> {
  try {
    // TODO: implement start_replication_task_assessment
    throw new Error("start_replication_task_assessment not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_replication_task_assessment failed");
  }
}

/** Start replication task assessment run. */
export async function startReplicationTaskAssessmentRun(replicationTaskArn: string, serviceAccessRoleArn: string, resultLocationBucket: string, assessmentRunName: string): Promise<StartReplicationTaskAssessmentRunResult> {
  try {
    // TODO: implement start_replication_task_assessment_run
    throw new Error("start_replication_task_assessment_run not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_replication_task_assessment_run failed");
  }
}

/** Stop data migration. */
export async function stopDataMigration(dataMigrationIdentifier: string, regionName?: string): Promise<StopDataMigrationResult> {
  try {
    // TODO: implement stop_data_migration
    throw new Error("stop_data_migration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "stop_data_migration failed");
  }
}

/** Stop replication. */
export async function stopReplication(replicationConfigArn: string, regionName?: string): Promise<StopReplicationResult> {
  try {
    // TODO: implement stop_replication
    throw new Error("stop_replication not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "stop_replication failed");
  }
}

/** Update subscriptions to event bridge. */
export async function updateSubscriptionsToEventBridge(): Promise<UpdateSubscriptionsToEventBridgeResult> {
  try {
    // TODO: implement update_subscriptions_to_event_bridge
    throw new Error("update_subscriptions_to_event_bridge not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_subscriptions_to_event_bridge failed");
  }
}
