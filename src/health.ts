import { HealthClient } from "@aws-sdk/client-health";
import { getClient } from "./client";
import { wrapAwsError } from "./exceptions";

/** Metadata for an AWS Health event. */
export type EventResult = {
  arn: string;
  service?: string;
  eventTypeCode?: string;
  eventTypeCategory?: string;
  region?: string;
  startTime?: string;
  endTime?: string;
  lastUpdatedTime?: string;
  statusCode?: string;
  extra?: Record<string, unknown>;
};

/** Detailed information for a Health event. */
export type EventDetailResult = {
  event: EventResult;
  eventDescription?: string;
  extra?: Record<string, unknown>;
};

/** An entity affected by an AWS Health event. */
export type AffectedEntityResult = {
  entityValue: string;
  eventArn: string;
  awsAccountId?: string;
  entityUrl?: string;
  statusCode?: string;
  lastUpdatedTime?: string;
  tags?: Record<string, unknown>;
  extra?: Record<string, unknown>;
};

/** Metadata for an AWS Health event type. */
export type EventTypeResult = {
  service?: string;
  code?: string;
  category?: string;
  extra?: Record<string, unknown>;
};

/** Aggregate count for a Health event grouping. */
export type EventAggregateResult = {
  aggregateValue?: string;
  count?: number;
  extra?: Record<string, unknown>;
};

/** An AWS account affected by an organization event. */
export type AffectedAccountResult = {
  accountId: string;
  extra?: Record<string, unknown>;
};

/** An AWS Health event at the organization level. */
export type OrgEventResult = {
  arn: string;
  service?: string;
  eventTypeCode?: string;
  eventTypeCategory?: string;
  region?: string;
  startTime?: string;
  endTime?: string;
  lastUpdatedTime?: string;
  statusCode?: string;
  extra?: Record<string, unknown>;
};

/** Detailed information for an organization-level Health event. */
export type OrgEventDetailResult = {
  event: OrgEventResult;
  eventDescription?: string;
  awsAccountId?: string;
  extra?: Record<string, unknown>;
};

/** Result of describe_affected_entities_for_organization. */
export type DescribeAffectedEntitiesForOrganizationResult = {
  entities?: Record<string, unknown>[];
  failedSet?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of describe_entity_aggregates. */
export type DescribeEntityAggregatesResult = {
  entityAggregates?: Record<string, unknown>[];
};

/** Result of describe_entity_aggregates_for_organization. */
export type DescribeEntityAggregatesForOrganizationResult = {
  organizationEntityAggregates?: Record<string, unknown>[];
};

/** Result of describe_health_service_status_for_organization. */
export type DescribeHealthServiceStatusForOrganizationResult = {
  healthServiceAccessStatusForOrganization?: string;
};

/** Describe AWS Health events. */
export async function describeEvents(): Promise<EventResult[]> {
  try {
    // TODO: implement describe_events
    throw new Error("describe_events not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_events failed");
  }
}

/** Describe details for specific Health events. */
export async function describeEventDetails(eventArns: string[]): Promise<EventDetailResult[]> {
  try {
    // TODO: implement describe_event_details
    throw new Error("describe_event_details not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_event_details failed");
  }
}

/** Describe entities affected by Health events. */
export async function describeAffectedEntities(): Promise<AffectedEntityResult[]> {
  try {
    // TODO: implement describe_affected_entities
    throw new Error("describe_affected_entities not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_affected_entities failed");
  }
}

/** Describe available AWS Health event types. */
export async function describeEventTypes(): Promise<EventTypeResult[]> {
  try {
    // TODO: implement describe_event_types
    throw new Error("describe_event_types not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_event_types failed");
  }
}

/** Describe aggregated counts of Health events. */
export async function describeEventAggregates(aggregateField: string): Promise<EventAggregateResult[]> {
  try {
    // TODO: implement describe_event_aggregates
    throw new Error("describe_event_aggregates not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_event_aggregates failed");
  }
}

/** Describe accounts affected by an organization Health event. */
export async function describeAffectedAccountsForOrganization(eventArn: string): Promise<AffectedAccountResult[]> {
  try {
    // TODO: implement describe_affected_accounts_for_organization
    throw new Error("describe_affected_accounts_for_organization not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_affected_accounts_for_organization failed");
  }
}

/** Describe Health events for an AWS organization. */
export async function describeEventsForOrganization(): Promise<OrgEventResult[]> {
  try {
    // TODO: implement describe_events_for_organization
    throw new Error("describe_events_for_organization not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_events_for_organization failed");
  }
}

/** Describe event details for organization-level Health events. */
export async function describeEventDetailsForOrganization(organizationEventDetailFilters: Record<string, unknown>[]): Promise<OrgEventDetailResult[]> {
  try {
    // TODO: implement describe_event_details_for_organization
    throw new Error("describe_event_details_for_organization not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_event_details_for_organization failed");
  }
}

/** Describe affected entities for organization. */
export async function describeAffectedEntitiesForOrganization(): Promise<DescribeAffectedEntitiesForOrganizationResult> {
  try {
    // TODO: implement describe_affected_entities_for_organization
    throw new Error("describe_affected_entities_for_organization not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_affected_entities_for_organization failed");
  }
}

/** Describe entity aggregates. */
export async function describeEntityAggregates(): Promise<DescribeEntityAggregatesResult> {
  try {
    // TODO: implement describe_entity_aggregates
    throw new Error("describe_entity_aggregates not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_entity_aggregates failed");
  }
}

/** Describe entity aggregates for organization. */
export async function describeEntityAggregatesForOrganization(eventArns: string[]): Promise<DescribeEntityAggregatesForOrganizationResult> {
  try {
    // TODO: implement describe_entity_aggregates_for_organization
    throw new Error("describe_entity_aggregates_for_organization not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_entity_aggregates_for_organization failed");
  }
}

/** Describe health service status for organization. */
export async function describeHealthServiceStatusForOrganization(regionName?: string): Promise<DescribeHealthServiceStatusForOrganizationResult> {
  try {
    // TODO: implement describe_health_service_status_for_organization
    throw new Error("describe_health_service_status_for_organization not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_health_service_status_for_organization failed");
  }
}

/** Disable health service access for organization. */
export async function disableHealthServiceAccessForOrganization(regionName?: string): Promise<void> {
  try {
    // TODO: implement disable_health_service_access_for_organization
    throw new Error("disable_health_service_access_for_organization not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disable_health_service_access_for_organization failed");
  }
}

/** Enable health service access for organization. */
export async function enableHealthServiceAccessForOrganization(regionName?: string): Promise<void> {
  try {
    // TODO: implement enable_health_service_access_for_organization
    throw new Error("enable_health_service_access_for_organization not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "enable_health_service_access_for_organization failed");
  }
}
