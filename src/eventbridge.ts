/**
 * aws-util/eventbridge — High-level Amazon EventBridge utilities.
 *
 * Provides typed helpers for putting events (single, batch, and auto-chunked),
 * and listing rules on an event bus.
 *
 * All functions obtain an EventBridgeClient via {@link getClient} and wrap
 * errors through {@link wrapAwsError}.
 *
 * @example
 * ```ts
 * import { putEvent, putEventsChunked, listRules } from "./eventbridge.js";
 *
 * const eventId = await putEvent("my.source", "OrderCreated", { orderId: 1 });
 * const rules = await listRules("default");
 * ```
 *
 * @module
 */

import { z } from "zod";
import {
  EventBridgeClient,
  PutEventsCommand,
  ListRulesCommand,
} from "@aws-sdk/client-eventbridge";
import { getClient } from "./client.js";
import { wrapAwsError, AwsServiceError } from "./exceptions.js";

// ---------------------------------------------------------------------------
// Zod schemas & inferred types
// ---------------------------------------------------------------------------

/** Schema for a single EventBridge event entry. */
export const EventEntrySchema = z.object({
  source: z.string(),
  detailType: z.string(),
  detail: z.string(),
  eventBusName: z.string().optional(),
  resources: z.array(z.string()).optional(),
});

/** A single EventBridge event entry. */
export type EventEntry = z.infer<typeof EventEntrySchema>;

/** Schema for the result of a PutEvents call. */
export const PutEventsResultSchema = z.object({
  failedEntryCount: z.number(),
  entries: z.array(
    z.object({
      eventId: z.string().optional(),
      errorCode: z.string().optional(),
      errorMessage: z.string().optional(),
    }),
  ),
});

/** Result of {@link putEvents} or {@link putEventsChunked}. */
export type PutEventsResult = z.infer<typeof PutEventsResultSchema>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Get a cached EventBridgeClient for the given region.
 */
function eb(region?: string): EventBridgeClient {
  return getClient(EventBridgeClient, region);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Put a single event onto an EventBridge event bus.
 *
 * Objects passed as `detail` are automatically JSON-stringified.
 *
 * @param source - The event source (e.g. `"my.app"`).
 * @param detailType - The event detail type (e.g. `"OrderCreated"`).
 * @param detail - The event detail payload (string or JSON-serializable object).
 * @param eventBusName - Optional event bus name (default bus if omitted).
 * @param region - AWS region override.
 * @returns The EventBridge-assigned event ID.
 */
export async function putEvent(
  source: string,
  detailType: string,
  detail: string | object,
  eventBusName?: string,
  region?: string,
): Promise<string> {
  const detailStr =
    typeof detail === "string" ? detail : JSON.stringify(detail);

  try {
    const resp = await eb(region).send(
      new PutEventsCommand({
        Entries: [
          {
            Source: source,
            DetailType: detailType,
            Detail: detailStr,
            EventBusName: eventBusName,
          },
        ],
      }),
    );

    const entry = resp.Entries?.[0];
    if (!entry?.EventId) {
      const errCode = entry?.ErrorCode ?? "Unknown";
      const errMsg = entry?.ErrorMessage ?? "No event ID returned";
      throw new AwsServiceError(
        `putEvent failed: ${errCode} — ${errMsg}`,
        errCode,
      );
    }

    return entry.EventId;
  } catch (err) {
    throw wrapAwsError(err, `putEvent ${source}/${detailType}`);
  }
}

/**
 * Put multiple events onto an EventBridge event bus in a single API call.
 *
 * EventBridge accepts a maximum of 10 entries per PutEvents call. Use
 * {@link putEventsChunked} to automatically chunk larger batches.
 *
 * @param entries - Array of event entries (max 10).
 * @param eventBusName - Optional default event bus name applied to entries
 *   that do not specify their own.
 * @param region - AWS region override.
 * @returns The aggregated put-events result.
 */
export async function putEvents(
  entries: EventEntry[],
  eventBusName?: string,
  region?: string,
): Promise<PutEventsResult> {
  try {
    const resp = await eb(region).send(
      new PutEventsCommand({
        Entries: entries.map((e) => ({
          Source: e.source,
          DetailType: e.detailType,
          Detail: e.detail,
          EventBusName: e.eventBusName ?? eventBusName,
          Resources: e.resources,
        })),
      }),
    );

    return PutEventsResultSchema.parse({
      failedEntryCount: resp.FailedEntryCount ?? 0,
      entries: (resp.Entries ?? []).map((e) => ({
        eventId: e.EventId,
        errorCode: e.ErrorCode,
        errorMessage: e.ErrorMessage,
      })),
    });
  } catch (err) {
    throw wrapAwsError(err, "putEvents");
  }
}

/**
 * Put events onto EventBridge, automatically chunking by the 10-entry limit.
 *
 * Results from all chunks are merged into a single {@link PutEventsResult}.
 *
 * @param entries - Array of event entries (any size).
 * @param eventBusName - Optional default event bus name applied to entries
 *   that do not specify their own.
 * @param region - AWS region override.
 * @returns The merged result across all chunks.
 */
export async function putEventsChunked(
  entries: EventEntry[],
  eventBusName?: string,
  region?: string,
): Promise<PutEventsResult> {
  const merged: PutEventsResult = {
    failedEntryCount: 0,
    entries: [],
  };

  for (let i = 0; i < entries.length; i += 10) {
    const chunk = entries.slice(i, i + 10);
    const result = await putEvents(chunk, eventBusName, region);
    merged.failedEntryCount += result.failedEntryCount;
    merged.entries.push(...result.entries);
  }

  return merged;
}

/**
 * List rules on an EventBridge event bus, auto-paginating through all pages.
 *
 * @param eventBusName - The event bus name (default bus if omitted).
 * @param namePrefix - Optional prefix to filter rule names.
 * @param region - AWS region override.
 * @returns Array of rule summaries.
 */
export async function listRules(
  eventBusName?: string,
  namePrefix?: string,
  region?: string,
): Promise<
  Array<{
    name: string;
    arn: string;
    state: string;
    scheduleExpression?: string;
    eventPattern?: string;
  }>
> {
  const results: Array<{
    name: string;
    arn: string;
    state: string;
    scheduleExpression?: string;
    eventPattern?: string;
  }> = [];
  let nextToken: string | undefined;

  try {
    do {
      const resp = await eb(region).send(
        new ListRulesCommand({
          EventBusName: eventBusName,
          NamePrefix: namePrefix,
          NextToken: nextToken,
        }),
      );

      for (const rule of resp.Rules ?? []) {
        results.push({
          name: rule.Name ?? "",
          arn: rule.Arn ?? "",
          state: rule.State ?? "UNKNOWN",
          scheduleExpression: rule.ScheduleExpression,
          eventPattern: rule.EventPattern,
        });
      }

      nextToken = resp.NextToken;
    } while (nextToken);
  } catch (err) {
    throw wrapAwsError(err, "listRules");
  }

  return results;
}

// ---------------------------------------------------------------------------
// Additional types (auto-generated)
// ---------------------------------------------------------------------------

/** Result of cancel_replay. */
export type CancelReplayResult = {
  replayArn?: string | undefined;
  state?: string | undefined;
  stateReason?: string | undefined;
};

/** Result of create_api_destination. */
export type CreateApiDestinationResult = {
  apiDestinationArn?: string | undefined;
  apiDestinationState?: string | undefined;
  creationTime?: string | undefined;
  lastModifiedTime?: string | undefined;
};

/** Result of create_archive. */
export type CreateArchiveResult = {
  archiveArn?: string | undefined;
  state?: string | undefined;
  stateReason?: string | undefined;
  creationTime?: string | undefined;
};

/** Result of create_connection. */
export type CreateConnectionResult = {
  connectionArn?: string | undefined;
  connectionState?: string | undefined;
  creationTime?: string | undefined;
  lastModifiedTime?: string | undefined;
};

/** Result of create_endpoint. */
export type CreateEndpointResult = {
  name?: string | undefined;
  arn?: string | undefined;
  routingConfig?: Record<string, unknown>;
  replicationConfig?: Record<string, unknown>;
  eventBuses?: Record<string, unknown>[];
  roleArn?: string | undefined;
  state?: string | undefined;
};

/** Result of create_event_bus. */
export type CreateEventBusResult = {
  eventBusArn?: string | undefined;
  description?: string | undefined;
  kmsKeyIdentifier?: string | undefined;
  deadLetterConfig?: Record<string, unknown>;
  logConfig?: Record<string, unknown>;
};

/** Result of create_partner_event_source. */
export type CreatePartnerEventSourceResult = {
  eventSourceArn?: string | undefined;
};

/** Result of deauthorize_connection. */
export type DeauthorizeConnectionResult = {
  connectionArn?: string | undefined;
  connectionState?: string | undefined;
  creationTime?: string | undefined;
  lastModifiedTime?: string | undefined;
  lastAuthorizedTime?: string | undefined;
};

/** Result of delete_connection. */
export type DeleteConnectionResult = {
  connectionArn?: string | undefined;
  connectionState?: string | undefined;
  creationTime?: string | undefined;
  lastModifiedTime?: string | undefined;
  lastAuthorizedTime?: string | undefined;
};

/** Result of describe_api_destination. */
export type DescribeApiDestinationResult = {
  apiDestinationArn?: string | undefined;
  name?: string | undefined;
  description?: string | undefined;
  apiDestinationState?: string | undefined;
  connectionArn?: string | undefined;
  invocationEndpoint?: string | undefined;
  httpMethod?: string | undefined;
  invocationRateLimitPerSecond?: number | undefined;
  creationTime?: string | undefined;
  lastModifiedTime?: string | undefined;
};

/** Result of describe_archive. */
export type DescribeArchiveResult = {
  archiveArn?: string | undefined;
  archiveName?: string | undefined;
  eventSourceArn?: string | undefined;
  description?: string | undefined;
  eventPattern?: string | undefined;
  state?: string | undefined;
  stateReason?: string | undefined;
  kmsKeyIdentifier?: string | undefined;
  retentionDays?: number | undefined;
  sizeBytes?: number | undefined;
  eventCount?: number | undefined;
  creationTime?: string | undefined;
};

/** Result of describe_connection. */
export type DescribeConnectionResult = {
  connectionArn?: string | undefined;
  name?: string | undefined;
  description?: string | undefined;
  invocationConnectivityParameters?: Record<string, unknown>;
  connectionState?: string | undefined;
  stateReason?: string | undefined;
  authorizationType?: string | undefined;
  secretArn?: string | undefined;
  kmsKeyIdentifier?: string | undefined;
  authParameters?: Record<string, unknown>;
  creationTime?: string | undefined;
  lastModifiedTime?: string | undefined;
  lastAuthorizedTime?: string | undefined;
};

/** Result of describe_endpoint. */
export type DescribeEndpointResult = {
  name?: string | undefined;
  description?: string | undefined;
  arn?: string | undefined;
  routingConfig?: Record<string, unknown>;
  replicationConfig?: Record<string, unknown>;
  eventBuses?: Record<string, unknown>[];
  roleArn?: string | undefined;
  endpointId?: string | undefined;
  endpointUrl?: string | undefined;
  state?: string | undefined;
  stateReason?: string | undefined;
  creationTime?: string | undefined;
  lastModifiedTime?: string | undefined;
};

/** Result of describe_event_bus. */
export type DescribeEventBusResult = {
  name?: string | undefined;
  arn?: string | undefined;
  description?: string | undefined;
  kmsKeyIdentifier?: string | undefined;
  deadLetterConfig?: Record<string, unknown>;
  policy?: string | undefined;
  logConfig?: Record<string, unknown>;
  creationTime?: string | undefined;
  lastModifiedTime?: string | undefined;
};

/** Result of describe_event_source. */
export type DescribeEventSourceResult = {
  arn?: string | undefined;
  createdBy?: string | undefined;
  creationTime?: string | undefined;
  expirationTime?: string | undefined;
  name?: string | undefined;
  state?: string | undefined;
};

/** Result of describe_partner_event_source. */
export type DescribePartnerEventSourceResult = {
  arn?: string | undefined;
  name?: string | undefined;
};

/** Result of describe_replay. */
export type DescribeReplayResult = {
  replayName?: string | undefined;
  replayArn?: string | undefined;
  description?: string | undefined;
  state?: string | undefined;
  stateReason?: string | undefined;
  eventSourceArn?: string | undefined;
  destination?: Record<string, unknown>;
  eventStartTime?: string | undefined;
  eventEndTime?: string | undefined;
  eventLastReplayedTime?: string | undefined;
  replayStartTime?: string | undefined;
  replayEndTime?: string | undefined;
};

/** Result of describe_rule. */
export type DescribeRuleResult = {
  name?: string | undefined;
  arn?: string | undefined;
  eventPattern?: string | undefined;
  scheduleExpression?: string | undefined;
  state?: string | undefined;
  description?: string | undefined;
  roleArn?: string | undefined;
  managedBy?: string | undefined;
  eventBusName?: string | undefined;
  createdBy?: string | undefined;
};

/** Result of list_api_destinations. */
export type ListApiDestinationsResult = {
  apiDestinations?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_archives. */
export type ListArchivesResult = {
  archives?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_connections. */
export type ListConnectionsResult = {
  connections?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_endpoints. */
export type ListEndpointsResult = {
  endpoints?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_event_buses. */
export type ListEventBusesResult = {
  eventBuses?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_event_sources. */
export type ListEventSourcesResult = {
  eventSources?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_partner_event_source_accounts. */
export type ListPartnerEventSourceAccountsResult = {
  partnerEventSourceAccounts?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_partner_event_sources. */
export type ListPartnerEventSourcesResult = {
  partnerEventSources?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_replays. */
export type ListReplaysResult = {
  replays?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_rule_names_by_target. */
export type ListRuleNamesByTargetResult = {
  ruleNames?: string[];
  nextToken?: string | undefined;
};

/** Result of list_tags_for_resource. */
export type ListTagsForResourceResult = {
  tags?: Record<string, unknown>[];
};

/** Result of list_targets_by_rule. */
export type ListTargetsByRuleResult = {
  targets?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of put_partner_events. */
export type PutPartnerEventsResult = {
  failedEntryCount?: number | undefined;
  entries?: Record<string, unknown>[];
};

/** Result of put_rule. */
export type PutRuleResult = {
  ruleArn?: string | undefined;
};

/** Result of put_targets. */
export type PutTargetsResult = {
  failedEntryCount?: number | undefined;
  failedEntries?: Record<string, unknown>[];
};

/** Result of remove_targets. */
export type RemoveTargetsResult = {
  failedEntryCount?: number | undefined;
  failedEntries?: Record<string, unknown>[];
};

/** Result of run_event_pattern. */
export type RunEventPatternResult = {
  result?: boolean | undefined;
};

/** Result of start_replay. */
export type StartReplayResult = {
  replayArn?: string | undefined;
  state?: string | undefined;
  stateReason?: string | undefined;
  replayStartTime?: string | undefined;
};

/** Result of update_api_destination. */
export type UpdateApiDestinationResult = {
  apiDestinationArn?: string | undefined;
  apiDestinationState?: string | undefined;
  creationTime?: string | undefined;
  lastModifiedTime?: string | undefined;
};

/** Result of update_archive. */
export type UpdateArchiveResult = {
  archiveArn?: string | undefined;
  state?: string | undefined;
  stateReason?: string | undefined;
  creationTime?: string | undefined;
};

/** Result of update_connection. */
export type UpdateConnectionResult = {
  connectionArn?: string | undefined;
  connectionState?: string | undefined;
  creationTime?: string | undefined;
  lastModifiedTime?: string | undefined;
  lastAuthorizedTime?: string | undefined;
};

/** Result of update_endpoint. */
export type UpdateEndpointResult = {
  name?: string | undefined;
  arn?: string | undefined;
  routingConfig?: Record<string, unknown>;
  replicationConfig?: Record<string, unknown>;
  eventBuses?: Record<string, unknown>[];
  roleArn?: string | undefined;
  endpointId?: string | undefined;
  endpointUrl?: string | undefined;
  state?: string | undefined;
};

/** Result of update_event_bus. */
export type UpdateEventBusResult = {
  arn?: string | undefined;
  name?: string | undefined;
  kmsKeyIdentifier?: string | undefined;
  description?: string | undefined;
  deadLetterConfig?: Record<string, unknown>;
  logConfig?: Record<string, unknown>;
};


// ---------------------------------------------------------------------------
// Additional functions (auto-generated)
// ---------------------------------------------------------------------------

/** Activate event source. */
export async function activateEventSource(name: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement activate_event_source
    throw new Error("activate_event_source not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "activate_event_source failed");
  }
}

/** Cancel replay. */
export async function cancelReplay(replayName: string, regionName?: string | undefined): Promise<CancelReplayResult> {
  try {
    // TODO: implement cancel_replay
    throw new Error("cancel_replay not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "cancel_replay failed");
  }
}

/** Create api destination. */
export async function createApiDestination(name: string, connectionArn: string, invocationEndpoint: string, httpMethod: string): Promise<CreateApiDestinationResult> {
  try {
    // TODO: implement create_api_destination
    throw new Error("create_api_destination not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_api_destination failed");
  }
}

/** Create archive. */
export async function createArchive(archiveName: string, eventSourceArn: string): Promise<CreateArchiveResult> {
  try {
    // TODO: implement create_archive
    throw new Error("create_archive not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_archive failed");
  }
}

/** Create connection. */
export async function createConnection(name: string, authorizationType: string, authParameters: Record<string, unknown>): Promise<CreateConnectionResult> {
  try {
    // TODO: implement create_connection
    throw new Error("create_connection not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_connection failed");
  }
}

/** Create endpoint. */
export async function createEndpoint(name: string, routingConfig: Record<string, unknown>, eventBuses: Record<string, unknown>[]): Promise<CreateEndpointResult> {
  try {
    // TODO: implement create_endpoint
    throw new Error("create_endpoint not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_endpoint failed");
  }
}

/** Create event bus. */
export async function createEventBus(name: string): Promise<CreateEventBusResult> {
  try {
    // TODO: implement create_event_bus
    throw new Error("create_event_bus not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_event_bus failed");
  }
}

/** Create partner event source. */
export async function createPartnerEventSource(name: string, account: string, regionName?: string | undefined): Promise<CreatePartnerEventSourceResult> {
  try {
    // TODO: implement create_partner_event_source
    throw new Error("create_partner_event_source not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_partner_event_source failed");
  }
}

/** Deactivate event source. */
export async function deactivateEventSource(name: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement deactivate_event_source
    throw new Error("deactivate_event_source not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "deactivate_event_source failed");
  }
}

/** Deauthorize connection. */
export async function deauthorizeConnection(name: string, regionName?: string | undefined): Promise<DeauthorizeConnectionResult> {
  try {
    // TODO: implement deauthorize_connection
    throw new Error("deauthorize_connection not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "deauthorize_connection failed");
  }
}

/** Delete api destination. */
export async function deleteApiDestination(name: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_api_destination
    throw new Error("delete_api_destination not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_api_destination failed");
  }
}

/** Delete archive. */
export async function deleteArchive(archiveName: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_archive
    throw new Error("delete_archive not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_archive failed");
  }
}

/** Delete connection. */
export async function deleteConnection(name: string, regionName?: string | undefined): Promise<DeleteConnectionResult> {
  try {
    // TODO: implement delete_connection
    throw new Error("delete_connection not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_connection failed");
  }
}

/** Delete endpoint. */
export async function deleteEndpoint(name: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_endpoint
    throw new Error("delete_endpoint not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_endpoint failed");
  }
}

/** Delete event bus. */
export async function deleteEventBus(name: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_event_bus
    throw new Error("delete_event_bus not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_event_bus failed");
  }
}

/** Delete partner event source. */
export async function deletePartnerEventSource(name: string, account: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_partner_event_source
    throw new Error("delete_partner_event_source not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_partner_event_source failed");
  }
}

/** Delete rule. */
export async function deleteRule(name: string): Promise<void> {
  try {
    // TODO: implement delete_rule
    throw new Error("delete_rule not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_rule failed");
  }
}

/** Describe api destination. */
export async function describeApiDestination(name: string, regionName?: string | undefined): Promise<DescribeApiDestinationResult> {
  try {
    // TODO: implement describe_api_destination
    throw new Error("describe_api_destination not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_api_destination failed");
  }
}

/** Describe archive. */
export async function describeArchive(archiveName: string, regionName?: string | undefined): Promise<DescribeArchiveResult> {
  try {
    // TODO: implement describe_archive
    throw new Error("describe_archive not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_archive failed");
  }
}

/** Describe connection. */
export async function describeConnection(name: string, regionName?: string | undefined): Promise<DescribeConnectionResult> {
  try {
    // TODO: implement describe_connection
    throw new Error("describe_connection not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_connection failed");
  }
}

/** Describe endpoint. */
export async function describeEndpoint(name: string): Promise<DescribeEndpointResult> {
  try {
    // TODO: implement describe_endpoint
    throw new Error("describe_endpoint not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_endpoint failed");
  }
}

/** Describe event bus. */
export async function describeEventBus(): Promise<DescribeEventBusResult> {
  try {
    // TODO: implement describe_event_bus
    throw new Error("describe_event_bus not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_event_bus failed");
  }
}

/** Describe event source. */
export async function describeEventSource(name: string, regionName?: string | undefined): Promise<DescribeEventSourceResult> {
  try {
    // TODO: implement describe_event_source
    throw new Error("describe_event_source not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_event_source failed");
  }
}

/** Describe partner event source. */
export async function describePartnerEventSource(name: string, regionName?: string | undefined): Promise<DescribePartnerEventSourceResult> {
  try {
    // TODO: implement describe_partner_event_source
    throw new Error("describe_partner_event_source not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_partner_event_source failed");
  }
}

/** Describe replay. */
export async function describeReplay(replayName: string, regionName?: string | undefined): Promise<DescribeReplayResult> {
  try {
    // TODO: implement describe_replay
    throw new Error("describe_replay not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_replay failed");
  }
}

/** Describe rule. */
export async function describeRule(name: string): Promise<DescribeRuleResult> {
  try {
    // TODO: implement describe_rule
    throw new Error("describe_rule not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_rule failed");
  }
}

/** Disable rule. */
export async function disableRule(name: string): Promise<void> {
  try {
    // TODO: implement disable_rule
    throw new Error("disable_rule not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disable_rule failed");
  }
}

/** Enable rule. */
export async function enableRule(name: string): Promise<void> {
  try {
    // TODO: implement enable_rule
    throw new Error("enable_rule not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "enable_rule failed");
  }
}

/** List api destinations. */
export async function listApiDestinations(): Promise<ListApiDestinationsResult> {
  try {
    // TODO: implement list_api_destinations
    throw new Error("list_api_destinations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_api_destinations failed");
  }
}

/** List archives. */
export async function listArchives(): Promise<ListArchivesResult> {
  try {
    // TODO: implement list_archives
    throw new Error("list_archives not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_archives failed");
  }
}

/** List connections. */
export async function listConnections(): Promise<ListConnectionsResult> {
  try {
    // TODO: implement list_connections
    throw new Error("list_connections not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_connections failed");
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

/** List event buses. */
export async function listEventBuses(): Promise<ListEventBusesResult> {
  try {
    // TODO: implement list_event_buses
    throw new Error("list_event_buses not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_event_buses failed");
  }
}

/** List event sources. */
export async function listEventSources(): Promise<ListEventSourcesResult> {
  try {
    // TODO: implement list_event_sources
    throw new Error("list_event_sources not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_event_sources failed");
  }
}

/** List partner event source accounts. */
export async function listPartnerEventSourceAccounts(eventSourceName: string): Promise<ListPartnerEventSourceAccountsResult> {
  try {
    // TODO: implement list_partner_event_source_accounts
    throw new Error("list_partner_event_source_accounts not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_partner_event_source_accounts failed");
  }
}

/** List partner event sources. */
export async function listPartnerEventSources(namePrefix: string): Promise<ListPartnerEventSourcesResult> {
  try {
    // TODO: implement list_partner_event_sources
    throw new Error("list_partner_event_sources not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_partner_event_sources failed");
  }
}

/** List replays. */
export async function listReplays(): Promise<ListReplaysResult> {
  try {
    // TODO: implement list_replays
    throw new Error("list_replays not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_replays failed");
  }
}

/** List rule names by target. */
export async function listRuleNamesByTarget(targetArn: string): Promise<ListRuleNamesByTargetResult> {
  try {
    // TODO: implement list_rule_names_by_target
    throw new Error("list_rule_names_by_target not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_rule_names_by_target failed");
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

/** List targets by rule. */
export async function listTargetsByRule(rule: string): Promise<ListTargetsByRuleResult> {
  try {
    // TODO: implement list_targets_by_rule
    throw new Error("list_targets_by_rule not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_targets_by_rule failed");
  }
}

/** Put partner events. */
export async function putPartnerEvents(entries: Record<string, unknown>[], regionName?: string | undefined): Promise<PutPartnerEventsResult> {
  try {
    // TODO: implement put_partner_events
    throw new Error("put_partner_events not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_partner_events failed");
  }
}

/** Put permission. */
export async function putPermission(): Promise<void> {
  try {
    // TODO: implement put_permission
    throw new Error("put_permission not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_permission failed");
  }
}

/** Put rule. */
export async function putRule(name: string): Promise<PutRuleResult> {
  try {
    // TODO: implement put_rule
    throw new Error("put_rule not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_rule failed");
  }
}

/** Put targets. */
export async function putTargets(rule: string, targets: Record<string, unknown>[]): Promise<PutTargetsResult> {
  try {
    // TODO: implement put_targets
    throw new Error("put_targets not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_targets failed");
  }
}

/** Remove permission. */
export async function removePermission(): Promise<void> {
  try {
    // TODO: implement remove_permission
    throw new Error("remove_permission not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "remove_permission failed");
  }
}

/** Remove targets. */
export async function removeTargets(rule: string, ids: string[]): Promise<RemoveTargetsResult> {
  try {
    // TODO: implement remove_targets
    throw new Error("remove_targets not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "remove_targets failed");
  }
}

/** Run event pattern. */
export async function runEventPattern(eventPattern: string, event: string, regionName?: string | undefined): Promise<RunEventPatternResult> {
  try {
    // TODO: implement run_event_pattern
    throw new Error("run_event_pattern not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "run_event_pattern failed");
  }
}

/** Start replay. */
export async function startReplay(replayName: string, eventSourceArn: string, eventStartTime: string, eventEndTime: string, destination: Record<string, unknown>): Promise<StartReplayResult> {
  try {
    // TODO: implement start_replay
    throw new Error("start_replay not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_replay failed");
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

/** Update api destination. */
export async function updateApiDestination(name: string): Promise<UpdateApiDestinationResult> {
  try {
    // TODO: implement update_api_destination
    throw new Error("update_api_destination not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_api_destination failed");
  }
}

/** Update archive. */
export async function updateArchive(archiveName: string): Promise<UpdateArchiveResult> {
  try {
    // TODO: implement update_archive
    throw new Error("update_archive not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_archive failed");
  }
}

/** Update connection. */
export async function updateConnection(name: string): Promise<UpdateConnectionResult> {
  try {
    // TODO: implement update_connection
    throw new Error("update_connection not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_connection failed");
  }
}

/** Update endpoint. */
export async function updateEndpoint(name: string): Promise<UpdateEndpointResult> {
  try {
    // TODO: implement update_endpoint
    throw new Error("update_endpoint not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_endpoint failed");
  }
}

/** Update event bus. */
export async function updateEventBus(): Promise<UpdateEventBusResult> {
  try {
    // TODO: implement update_event_bus
    throw new Error("update_event_bus not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_event_bus failed");
  }
}
