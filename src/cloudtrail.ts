import { CloudtrailClient } from "@aws-sdk/client-cloudtrail";
import { getClient } from "./client";
import { wrapAwsError } from "./exceptions";

/** Metadata for a CloudTrail trail. */
export type TrailResult = {
  name: string;
  arn: string;
  s3BucketName?: string;
  s3KeyPrefix?: string;
  snsTopicArn?: string;
  includeGlobalServiceEvents?: boolean;
  isMultiRegionTrail?: boolean;
  homeRegion?: string;
  logFileValidationEnabled?: boolean;
  cloudWatchLogsLogGroupArn?: string;
  cloudWatchLogsRoleArn?: string;
  kmsKeyId?: string;
  isOrganizationTrail?: boolean;
  extra?: Record<string, unknown>;
};

/** Status information for a CloudTrail trail. */
export type TrailStatus = {
  isLogging?: boolean;
  latestDeliveryTime?: unknown;
  latestNotificationTime?: unknown;
  latestCloudWatchLogsDeliveryTime?: unknown;
  startLoggingTime?: unknown;
  stopLoggingTime?: unknown;
  latestDeliveryError?: string;
  latestNotificationError?: string;
  latestDigestDeliveryTime?: unknown;
  extra?: Record<string, unknown>;
};

/** Summary information for a CloudTrail trail (from ListTrails). */
export type TrailSummary = {
  trailArn: string;
  name: string;
  homeRegion?: string;
};

/** An event returned by LookupEvents. */
export type LookupEvent = {
  eventId: string;
  eventName?: string;
  eventSource?: string;
  eventTime?: unknown;
  username?: string;
  cloudTrailEvent?: string;
  resources?: Record<string, unknown>[];
  extra?: Record<string, unknown>;
};

/** Metadata for a CloudTrail Lake event data store. */
export type EventDataStoreResult = {
  eventDataStoreArn: string;
  name?: string;
  status?: string;
  retentionPeriod?: number;
  multiRegionEnabled?: boolean;
  organizationEnabled?: boolean;
  createdTimestamp?: unknown;
  updatedTimestamp?: unknown;
  advancedEventSelectors?: Record<string, unknown>[];
  extra?: Record<string, unknown>;
};

/** Result of a CloudTrail Lake query. */
export type QueryResult = {
  queryId: string;
  queryStatus?: string;
  queryStatistics?: Record<string, unknown>;
  queryResultRows?: Record<string, unknown>[][];
  extra?: Record<string, unknown>;
};

/** Event selectors for a trail. */
export type EventSelectorResult = {
  trailArn: string;
  eventSelectors?: Record<string, unknown>[];
  advancedEventSelectors?: Record<string, unknown>[];
};

/** Insight selectors for a trail. */
export type InsightSelectorResult = {
  trailArn: string;
  insightSelectors?: Record<string, unknown>[];
};

/** Result of cancel_query. */
export type CancelQueryResult = {
  queryId?: string;
  queryStatus?: string;
  eventDataStoreOwnerAccountId?: string;
};

/** Result of create_channel. */
export type CreateChannelResult = {
  channelArn?: string;
  name?: string;
  source?: string;
  destinations?: Record<string, unknown>[];
  tags?: Record<string, unknown>[];
};

/** Result of create_dashboard. */
export type CreateDashboardResult = {
  dashboardArn?: string;
  name?: string;
  typeValue?: string;
  widgets?: Record<string, unknown>[];
  tagsList?: Record<string, unknown>[];
  refreshSchedule?: Record<string, unknown>;
  terminationProtectionEnabled?: boolean;
};

/** Result of describe_query. */
export type DescribeQueryResult = {
  queryId?: string;
  queryString?: string;
  queryStatus?: string;
  queryStatistics?: Record<string, unknown>;
  errorMessage?: string;
  deliveryS3Uri?: string;
  deliveryStatus?: string;
  prompt?: string;
  eventDataStoreOwnerAccountId?: string;
};

/** Result of disable_federation. */
export type DisableFederationResult = {
  eventDataStoreArn?: string;
  federationStatus?: string;
};

/** Result of enable_federation. */
export type EnableFederationResult = {
  eventDataStoreArn?: string;
  federationStatus?: string;
  federationRoleArn?: string;
};

/** Result of generate_query. */
export type GenerateQueryResult = {
  queryStatement?: string;
  queryAlias?: string;
  eventDataStoreOwnerAccountId?: string;
};

/** Result of get_channel. */
export type GetChannelResult = {
  channelArn?: string;
  name?: string;
  source?: string;
  sourceConfig?: Record<string, unknown>;
  destinations?: Record<string, unknown>[];
  ingestionStatus?: Record<string, unknown>;
};

/** Result of get_dashboard. */
export type GetDashboardResult = {
  dashboardArn?: string;
  typeValue?: string;
  status?: string;
  widgets?: Record<string, unknown>[];
  refreshSchedule?: Record<string, unknown>;
  createdTimestamp?: string;
  updatedTimestamp?: string;
  lastRefreshId?: string;
  lastRefreshFailureReason?: string;
  terminationProtectionEnabled?: boolean;
};

/** Result of get_event_configuration. */
export type GetEventConfigurationResult = {
  eventDataStoreArn?: string;
  maxEventSize?: string;
  contextKeySelectors?: Record<string, unknown>[];
};

/** Result of get_event_data_store. */
export type GetEventDataStoreResult = {
  eventDataStoreArn?: string;
  name?: string;
  status?: string;
  advancedEventSelectors?: Record<string, unknown>[];
  multiRegionEnabled?: boolean;
  organizationEnabled?: boolean;
  retentionPeriod?: number;
  terminationProtectionEnabled?: boolean;
  createdTimestamp?: string;
  updatedTimestamp?: string;
  kmsKeyId?: string;
  billingMode?: string;
  federationStatus?: string;
  federationRoleArn?: string;
  partitionKeys?: Record<string, unknown>[];
};

/** Result of get_import. */
export type GetImportResult = {
  importId?: string;
  destinations?: string[];
  importSource?: Record<string, unknown>;
  startEventTime?: string;
  endEventTime?: string;
  importStatus?: string;
  createdTimestamp?: string;
  updatedTimestamp?: string;
  importStatistics?: Record<string, unknown>;
};

/** Result of get_resource_policy. */
export type GetResourcePolicyResult = {
  resourceArn?: string;
  resourcePolicy?: string;
  delegatedAdminResourcePolicy?: string;
};

/** Result of list_channels. */
export type ListChannelsResult = {
  channels?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_dashboards. */
export type ListDashboardsResult = {
  dashboards?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_import_failures. */
export type ListImportFailuresResult = {
  failures?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_imports. */
export type ListImportsResult = {
  imports?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_insights_metric_data. */
export type ListInsightsMetricDataResult = {
  eventSource?: string;
  eventName?: string;
  insightType?: string;
  errorCode?: string;
  timestamps?: string[];
  values?: number[];
  nextToken?: string;
};

/** Result of list_public_keys. */
export type ListPublicKeysResult = {
  publicKeyList?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_tags. */
export type ListTagsResult = {
  resourceTagList?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of put_event_configuration. */
export type PutEventConfigurationResult = {
  eventDataStoreArn?: string;
  maxEventSize?: string;
  contextKeySelectors?: Record<string, unknown>[];
};

/** Result of put_resource_policy. */
export type PutResourcePolicyResult = {
  resourceArn?: string;
  resourcePolicy?: string;
  delegatedAdminResourcePolicy?: string;
};

/** Result of restore_event_data_store. */
export type RestoreEventDataStoreResult = {
  eventDataStoreArn?: string;
  name?: string;
  status?: string;
  advancedEventSelectors?: Record<string, unknown>[];
  multiRegionEnabled?: boolean;
  organizationEnabled?: boolean;
  retentionPeriod?: number;
  terminationProtectionEnabled?: boolean;
  createdTimestamp?: string;
  updatedTimestamp?: string;
  kmsKeyId?: string;
  billingMode?: string;
};

/** Result of search_sample_queries. */
export type SearchSampleQueriesResult = {
  searchResults?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of start_dashboard_refresh. */
export type StartDashboardRefreshResult = {
  refreshId?: string;
};

/** Result of start_import. */
export type StartImportResult = {
  importId?: string;
  destinations?: string[];
  importSource?: Record<string, unknown>;
  startEventTime?: string;
  endEventTime?: string;
  importStatus?: string;
  createdTimestamp?: string;
  updatedTimestamp?: string;
};

/** Result of stop_import. */
export type StopImportResult = {
  importId?: string;
  importSource?: Record<string, unknown>;
  destinations?: string[];
  importStatus?: string;
  createdTimestamp?: string;
  updatedTimestamp?: string;
  startEventTime?: string;
  endEventTime?: string;
  importStatistics?: Record<string, unknown>;
};

/** Result of update_channel. */
export type UpdateChannelResult = {
  channelArn?: string;
  name?: string;
  source?: string;
  destinations?: Record<string, unknown>[];
};

/** Result of update_dashboard. */
export type UpdateDashboardResult = {
  dashboardArn?: string;
  name?: string;
  typeValue?: string;
  widgets?: Record<string, unknown>[];
  refreshSchedule?: Record<string, unknown>;
  terminationProtectionEnabled?: boolean;
  createdTimestamp?: string;
  updatedTimestamp?: string;
};

/** Result of update_event_data_store. */
export type UpdateEventDataStoreResult = {
  eventDataStoreArn?: string;
  name?: string;
  status?: string;
  advancedEventSelectors?: Record<string, unknown>[];
  multiRegionEnabled?: boolean;
  organizationEnabled?: boolean;
  retentionPeriod?: number;
  terminationProtectionEnabled?: boolean;
  createdTimestamp?: string;
  updatedTimestamp?: string;
  kmsKeyId?: string;
  billingMode?: string;
  federationStatus?: string;
  federationRoleArn?: string;
};

/** Create a new CloudTrail trail. */
export async function createTrail(name: string): Promise<TrailResult> {
  try {
    // TODO: implement create_trail
    throw new Error("create_trail not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_trail failed");
  }
}

/** Describe one or more CloudTrail trails. */
export async function describeTrails(): Promise<TrailResult[]> {
  try {
    // TODO: implement describe_trails
    throw new Error("describe_trails not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_trails failed");
  }
}

/** Get details for a single CloudTrail trail. */
export async function getTrail(name: string): Promise<TrailResult> {
  try {
    // TODO: implement get_trail
    throw new Error("get_trail not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_trail failed");
  }
}

/** Update an existing CloudTrail trail. */
export async function updateTrail(name: string): Promise<TrailResult> {
  try {
    // TODO: implement update_trail
    throw new Error("update_trail not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_trail failed");
  }
}

/** Delete a CloudTrail trail. */
export async function deleteTrail(name: string): Promise<void> {
  try {
    // TODO: implement delete_trail
    throw new Error("delete_trail not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_trail failed");
  }
}

/** Start logging for a CloudTrail trail. */
export async function startLogging(name: string): Promise<void> {
  try {
    // TODO: implement start_logging
    throw new Error("start_logging not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_logging failed");
  }
}

/** Stop logging for a CloudTrail trail. */
export async function stopLogging(name: string): Promise<void> {
  try {
    // TODO: implement stop_logging
    throw new Error("stop_logging not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "stop_logging failed");
  }
}

/** Get the status of a CloudTrail trail. */
export async function getTrailStatus(name: string): Promise<TrailStatus> {
  try {
    // TODO: implement get_trail_status
    throw new Error("get_trail_status not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_trail_status failed");
  }
}

/** Look up management and data events captured by CloudTrail. */
export async function lookupEvents(): Promise<LookupEvent[]> {
  try {
    // TODO: implement lookup_events
    throw new Error("lookup_events not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "lookup_events failed");
  }
}

/** List all trails in the account. */
export async function listTrails(): Promise<TrailSummary[]> {
  try {
    // TODO: implement list_trails
    throw new Error("list_trails not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_trails failed");
  }
}

/** Create a CloudTrail Lake event data store. */
export async function createEventDataStore(name: string): Promise<EventDataStoreResult> {
  try {
    // TODO: implement create_event_data_store
    throw new Error("create_event_data_store not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_event_data_store failed");
  }
}

/** Describe a CloudTrail Lake event data store. */
export async function describeEventDataStore(eventDataStore: string): Promise<EventDataStoreResult> {
  try {
    // TODO: implement describe_event_data_store
    throw new Error("describe_event_data_store not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_event_data_store failed");
  }
}

/** List CloudTrail Lake event data stores. */
export async function listEventDataStores(): Promise<EventDataStoreResult[]> {
  try {
    // TODO: implement list_event_data_stores
    throw new Error("list_event_data_stores not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_event_data_stores failed");
  }
}

/** Delete a CloudTrail Lake event data store. */
export async function deleteEventDataStore(eventDataStore: string): Promise<void> {
  try {
    // TODO: implement delete_event_data_store
    throw new Error("delete_event_data_store not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_event_data_store failed");
  }
}

/** Start a CloudTrail Lake query. */
export async function startQuery(queryStatement: string): Promise<string> {
  try {
    // TODO: implement start_query
    throw new Error("start_query not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_query failed");
  }
}

/** Get the results of a CloudTrail Lake query. */
export async function getQueryResults(queryId: string): Promise<QueryResult> {
  try {
    // TODO: implement get_query_results
    throw new Error("get_query_results not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_query_results failed");
  }
}

/** List queries for an event data store. */
export async function listQueries(eventDataStore: string): Promise<Record<string, unknown>[]> {
  try {
    // TODO: implement list_queries
    throw new Error("list_queries not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_queries failed");
  }
}

/** Put event selectors on a trail. */
export async function putEventSelectors(trailName: string): Promise<EventSelectorResult> {
  try {
    // TODO: implement put_event_selectors
    throw new Error("put_event_selectors not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_event_selectors failed");
  }
}

/** Get event selectors for a trail. */
export async function getEventSelectors(trailName: string): Promise<EventSelectorResult> {
  try {
    // TODO: implement get_event_selectors
    throw new Error("get_event_selectors not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_event_selectors failed");
  }
}

/** Put insight selectors on a trail. */
export async function putInsightSelectors(trailName: string): Promise<InsightSelectorResult> {
  try {
    // TODO: implement put_insight_selectors
    throw new Error("put_insight_selectors not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_insight_selectors failed");
  }
}

/** Get insight selectors for a trail. */
export async function getInsightSelectors(trailName: string): Promise<InsightSelectorResult> {
  try {
    // TODO: implement get_insight_selectors
    throw new Error("get_insight_selectors not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_insight_selectors failed");
  }
}

/** Add tags. */
export async function addTags(resourceId: string, tagsList: Record<string, unknown>[], regionName?: string): Promise<void> {
  try {
    // TODO: implement add_tags
    throw new Error("add_tags not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "add_tags failed");
  }
}

/** Cancel query. */
export async function cancelQuery(queryId: string): Promise<CancelQueryResult> {
  try {
    // TODO: implement cancel_query
    throw new Error("cancel_query not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "cancel_query failed");
  }
}

/** Create channel. */
export async function createChannel(name: string, source: string, destinations: Record<string, unknown>[]): Promise<CreateChannelResult> {
  try {
    // TODO: implement create_channel
    throw new Error("create_channel not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_channel failed");
  }
}

/** Create dashboard. */
export async function createDashboard(name: string): Promise<CreateDashboardResult> {
  try {
    // TODO: implement create_dashboard
    throw new Error("create_dashboard not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_dashboard failed");
  }
}

/** Delete channel. */
export async function deleteChannel(channel: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_channel
    throw new Error("delete_channel not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_channel failed");
  }
}

/** Delete dashboard. */
export async function deleteDashboard(dashboardId: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_dashboard
    throw new Error("delete_dashboard not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_dashboard failed");
  }
}

/** Delete resource policy. */
export async function deleteResourcePolicy(resourceArn: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_resource_policy
    throw new Error("delete_resource_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_resource_policy failed");
  }
}

/** Deregister organization delegated admin. */
export async function deregisterOrganizationDelegatedAdmin(delegatedAdminAccountId: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement deregister_organization_delegated_admin
    throw new Error("deregister_organization_delegated_admin not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "deregister_organization_delegated_admin failed");
  }
}

/** Describe query. */
export async function describeQuery(): Promise<DescribeQueryResult> {
  try {
    // TODO: implement describe_query
    throw new Error("describe_query not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_query failed");
  }
}

/** Disable federation. */
export async function disableFederation(eventDataStore: string, regionName?: string): Promise<DisableFederationResult> {
  try {
    // TODO: implement disable_federation
    throw new Error("disable_federation not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disable_federation failed");
  }
}

/** Enable federation. */
export async function enableFederation(eventDataStore: string, federationRoleArn: string, regionName?: string): Promise<EnableFederationResult> {
  try {
    // TODO: implement enable_federation
    throw new Error("enable_federation not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "enable_federation failed");
  }
}

/** Generate query. */
export async function generateQuery(eventDataStores: string[], prompt: string, regionName?: string): Promise<GenerateQueryResult> {
  try {
    // TODO: implement generate_query
    throw new Error("generate_query not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "generate_query failed");
  }
}

/** Get channel. */
export async function getChannel(channel: string, regionName?: string): Promise<GetChannelResult> {
  try {
    // TODO: implement get_channel
    throw new Error("get_channel not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_channel failed");
  }
}

/** Get dashboard. */
export async function getDashboard(dashboardId: string, regionName?: string): Promise<GetDashboardResult> {
  try {
    // TODO: implement get_dashboard
    throw new Error("get_dashboard not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_dashboard failed");
  }
}

/** Get event configuration. */
export async function getEventConfiguration(): Promise<GetEventConfigurationResult> {
  try {
    // TODO: implement get_event_configuration
    throw new Error("get_event_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_event_configuration failed");
  }
}

/** Get event data store. */
export async function getEventDataStore(eventDataStore: string, regionName?: string): Promise<GetEventDataStoreResult> {
  try {
    // TODO: implement get_event_data_store
    throw new Error("get_event_data_store not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_event_data_store failed");
  }
}

/** Get import. */
export async function getImport(importId: string, regionName?: string): Promise<GetImportResult> {
  try {
    // TODO: implement get_import
    throw new Error("get_import not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_import failed");
  }
}

/** Get resource policy. */
export async function getResourcePolicy(resourceArn: string, regionName?: string): Promise<GetResourcePolicyResult> {
  try {
    // TODO: implement get_resource_policy
    throw new Error("get_resource_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_resource_policy failed");
  }
}

/** List channels. */
export async function listChannels(): Promise<ListChannelsResult> {
  try {
    // TODO: implement list_channels
    throw new Error("list_channels not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_channels failed");
  }
}

/** List dashboards. */
export async function listDashboards(): Promise<ListDashboardsResult> {
  try {
    // TODO: implement list_dashboards
    throw new Error("list_dashboards not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_dashboards failed");
  }
}

/** List import failures. */
export async function listImportFailures(importId: string): Promise<ListImportFailuresResult> {
  try {
    // TODO: implement list_import_failures
    throw new Error("list_import_failures not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_import_failures failed");
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

/** List insights metric data. */
export async function listInsightsMetricData(eventSource: string, eventName: string, insightType: string): Promise<ListInsightsMetricDataResult> {
  try {
    // TODO: implement list_insights_metric_data
    throw new Error("list_insights_metric_data not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_insights_metric_data failed");
  }
}

/** List public keys. */
export async function listPublicKeys(): Promise<ListPublicKeysResult> {
  try {
    // TODO: implement list_public_keys
    throw new Error("list_public_keys not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_public_keys failed");
  }
}

/** List tags. */
export async function listTags(resourceIdList: string[]): Promise<ListTagsResult> {
  try {
    // TODO: implement list_tags
    throw new Error("list_tags not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_tags failed");
  }
}

/** Put event configuration. */
export async function putEventConfiguration(maxEventSize: string, contextKeySelectors: Record<string, unknown>[]): Promise<PutEventConfigurationResult> {
  try {
    // TODO: implement put_event_configuration
    throw new Error("put_event_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_event_configuration failed");
  }
}

/** Put resource policy. */
export async function putResourcePolicy(resourceArn: string, resourcePolicy: string, regionName?: string): Promise<PutResourcePolicyResult> {
  try {
    // TODO: implement put_resource_policy
    throw new Error("put_resource_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_resource_policy failed");
  }
}

/** Register organization delegated admin. */
export async function registerOrganizationDelegatedAdmin(memberAccountId: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement register_organization_delegated_admin
    throw new Error("register_organization_delegated_admin not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "register_organization_delegated_admin failed");
  }
}

/** Remove tags. */
export async function removeTags(resourceId: string, tagsList: Record<string, unknown>[], regionName?: string): Promise<void> {
  try {
    // TODO: implement remove_tags
    throw new Error("remove_tags not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "remove_tags failed");
  }
}

/** Restore event data store. */
export async function restoreEventDataStore(eventDataStore: string, regionName?: string): Promise<RestoreEventDataStoreResult> {
  try {
    // TODO: implement restore_event_data_store
    throw new Error("restore_event_data_store not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "restore_event_data_store failed");
  }
}

/** Search sample queries. */
export async function searchSampleQueries(searchPhrase: string): Promise<SearchSampleQueriesResult> {
  try {
    // TODO: implement search_sample_queries
    throw new Error("search_sample_queries not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "search_sample_queries failed");
  }
}

/** Start dashboard refresh. */
export async function startDashboardRefresh(dashboardId: string): Promise<StartDashboardRefreshResult> {
  try {
    // TODO: implement start_dashboard_refresh
    throw new Error("start_dashboard_refresh not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_dashboard_refresh failed");
  }
}

/** Start event data store ingestion. */
export async function startEventDataStoreIngestion(eventDataStore: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement start_event_data_store_ingestion
    throw new Error("start_event_data_store_ingestion not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_event_data_store_ingestion failed");
  }
}

/** Start import. */
export async function startImport(): Promise<StartImportResult> {
  try {
    // TODO: implement start_import
    throw new Error("start_import not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_import failed");
  }
}

/** Stop event data store ingestion. */
export async function stopEventDataStoreIngestion(eventDataStore: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement stop_event_data_store_ingestion
    throw new Error("stop_event_data_store_ingestion not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "stop_event_data_store_ingestion failed");
  }
}

/** Stop import. */
export async function stopImport(importId: string, regionName?: string): Promise<StopImportResult> {
  try {
    // TODO: implement stop_import
    throw new Error("stop_import not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "stop_import failed");
  }
}

/** Update channel. */
export async function updateChannel(channel: string): Promise<UpdateChannelResult> {
  try {
    // TODO: implement update_channel
    throw new Error("update_channel not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_channel failed");
  }
}

/** Update dashboard. */
export async function updateDashboard(dashboardId: string): Promise<UpdateDashboardResult> {
  try {
    // TODO: implement update_dashboard
    throw new Error("update_dashboard not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_dashboard failed");
  }
}

/** Update event data store. */
export async function updateEventDataStore(eventDataStore: string): Promise<UpdateEventDataStoreResult> {
  try {
    // TODO: implement update_event_data_store
    throw new Error("update_event_data_store not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_event_data_store failed");
  }
}
