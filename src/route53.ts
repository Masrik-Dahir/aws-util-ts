/**
 * aws-util/route53 — High-level Amazon Route 53 utilities.
 *
 * Provides typed, ergonomic wrappers around the AWS SDK v3 Route 53 client
 * for common operations: hosted zone listing, record CRUD, batch upserts,
 * and change polling.
 *
 * All functions obtain a Route53Client via {@link getClient} and wrap errors
 * through {@link wrapAwsError}.
 *
 * @module
 */

import { z } from "zod";
import {
  Route53Client,
  ListHostedZonesCommand,
  GetHostedZoneCommand,
  ListResourceRecordSetsCommand,
  ChangeResourceRecordSetsCommand,
  GetChangeCommand,
} from "@aws-sdk/client-route-53";
import type { RRType } from "@aws-sdk/client-route-53";
import { getClient } from "./client.js";
import { wrapAwsError, AwsTimeoutError } from "./exceptions.js";

// ---------------------------------------------------------------------------
// Zod schemas & inferred types
// ---------------------------------------------------------------------------

/** Schema for a Route 53 hosted zone. */
export const HostedZoneSchema = z.object({
  id: z.string(),
  name: z.string(),
  callerReference: z.string().optional(),
  recordSetCount: z.number().optional(),
  config: z
    .object({
      privateZone: z.boolean(),
    })
    .optional(),
});
/** A Route 53 hosted zone. */
export type HostedZone = z.infer<typeof HostedZoneSchema>;

/** Schema for an alias target within a resource record. */
const AliasTargetSchema = z.object({
  hostedZoneId: z.string(),
  dnsName: z.string(),
  evaluateTargetHealth: z.boolean().optional(),
});

/** Schema for a Route 53 resource record set. */
export const ResourceRecordSchema = z.object({
  name: z.string(),
  type: z.string(),
  ttl: z.number().optional(),
  resourceRecords: z.array(z.string()).optional(),
  aliasTarget: AliasTargetSchema.optional(),
});
/** A Route 53 resource record set. */
export type ResourceRecord = z.infer<typeof ResourceRecordSchema>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Get a cached Route53Client for the given region.
 */
function r53(region?: string): Route53Client {
  return getClient(Route53Client, region);
}

/**
 * Strip the `/hostedzone/` prefix from a hosted zone ID, if present.
 */
function normalizeZoneId(id: string): string {
  return id.replace(/^\/hostedzone\//, "");
}

/**
 * Normalize a value into an array of record values.
 */
function normalizeValues(value: string | string[]): string[] {
  return Array.isArray(value) ? value : [value];
}

// ---------------------------------------------------------------------------
// Hosted zone operations
// ---------------------------------------------------------------------------

/**
 * List all Route 53 hosted zones, auto-paginating through all pages.
 *
 * @param region - AWS region override.
 * @returns An array of {@link HostedZone} entries.
 */
export async function listHostedZones(
  region?: string,
): Promise<HostedZone[]> {
  const results: HostedZone[] = [];
  let marker: string | undefined;

  try {
    do {
      const resp = await r53(region).send(
        new ListHostedZonesCommand({
          ...(marker ? { Marker: marker } : {}),
        }),
      );
      for (const zone of resp.HostedZones ?? []) {
        results.push(
          HostedZoneSchema.parse({
            id: normalizeZoneId(zone.Id ?? ""),
            name: zone.Name ?? "",
            callerReference: zone.CallerReference,
            recordSetCount: zone.ResourceRecordSetCount,
            config: zone.Config
              ? { privateZone: zone.Config.PrivateZone ?? false }
              : undefined,
          }),
        );
      }
      marker = resp.IsTruncated ? resp.NextMarker : undefined;
    } while (marker);
  } catch (err) {
    throw wrapAwsError(err, "listHostedZones");
  }

  return results;
}

/**
 * Retrieve a single hosted zone by ID.
 *
 * Returns `null` if the zone does not exist rather than throwing.
 *
 * @param hostedZoneId - The hosted zone ID (with or without `/hostedzone/` prefix).
 * @param region - AWS region override.
 * @returns The {@link HostedZone}, or `null` if not found.
 */
export async function getHostedZone(
  hostedZoneId: string,
  region?: string,
): Promise<HostedZone | null> {
  try {
    const resp = await r53(region).send(
      new GetHostedZoneCommand({
        Id: normalizeZoneId(hostedZoneId),
      }),
    );
    const zone = resp.HostedZone;
    if (!zone) {
      return null;
    }
    return HostedZoneSchema.parse({
      id: normalizeZoneId(zone.Id ?? ""),
      name: zone.Name ?? "",
      callerReference: zone.CallerReference,
      recordSetCount: zone.ResourceRecordSetCount,
      config: zone.Config
        ? { privateZone: zone.Config.PrivateZone ?? false }
        : undefined,
    });
  } catch (err) {
    const wrapped = wrapAwsError(
      err,
      `getHostedZone(${hostedZoneId})`,
    );
    // Return null for not-found rather than throwing
    if (wrapped.errorCode === "NoSuchHostedZone") {
      return null;
    }
    throw wrapped;
  }
}

// ---------------------------------------------------------------------------
// Record operations
// ---------------------------------------------------------------------------

/**
 * List resource record sets for a hosted zone, auto-paginating.
 *
 * @param hostedZoneId - The hosted zone ID.
 * @param type - Optional record type filter (e.g. `"A"`, `"CNAME"`).
 * @param name - Optional record name filter.
 * @param region - AWS region override.
 * @returns An array of {@link ResourceRecord} entries.
 */
export async function listRecords(
  hostedZoneId: string,
  type?: string,
  name?: string,
  region?: string,
): Promise<ResourceRecord[]> {
  const results: ResourceRecord[] = [];
  let nextRecordName: string | undefined;
  let nextRecordType: string | undefined;

  try {
    do {
      const resp = await r53(region).send(
        new ListResourceRecordSetsCommand({
          HostedZoneId: normalizeZoneId(hostedZoneId),
          ...(nextRecordName
            ? { StartRecordName: nextRecordName }
            : name
              ? { StartRecordName: name }
              : {}),
          ...(nextRecordType
            ? { StartRecordType: nextRecordType as RRType }
            : type
              ? { StartRecordType: type as RRType }
              : {}),
        }),
      );
      for (const rrs of resp.ResourceRecordSets ?? []) {
        // Apply client-side filtering when type/name are specified
        if (type && rrs.Type !== type) {
          continue;
        }
        if (name && rrs.Name !== name) {
          continue;
        }
        results.push(
          ResourceRecordSchema.parse({
            name: rrs.Name ?? "",
            type: rrs.Type ?? "",
            ttl: rrs.TTL,
            resourceRecords: rrs.ResourceRecords
              ? rrs.ResourceRecords.map((r) => r.Value ?? "")
              : undefined,
            aliasTarget: rrs.AliasTarget
              ? {
                  hostedZoneId: rrs.AliasTarget.HostedZoneId ?? "",
                  dnsName: rrs.AliasTarget.DNSName ?? "",
                  evaluateTargetHealth:
                    rrs.AliasTarget.EvaluateTargetHealth,
                }
              : undefined,
          }),
        );
      }
      if (resp.IsTruncated) {
        nextRecordName = resp.NextRecordName;
        nextRecordType = resp.NextRecordType;
      } else {
        nextRecordName = undefined;
        nextRecordType = undefined;
      }
    } while (nextRecordName);
  } catch (err) {
    throw wrapAwsError(
      err,
      `listRecords(${hostedZoneId})`,
    );
  }

  return results;
}

/**
 * Upsert a DNS record in a hosted zone.
 *
 * Creates the record if it does not exist, or updates it if it does.
 *
 * @param hostedZoneId - The hosted zone ID.
 * @param name - The record name (e.g. `"example.com."`).
 * @param type - The record type (e.g. `"A"`, `"CNAME"`).
 * @param value - One or more record values.
 * @param ttl - Time to live in seconds (default 300).
 * @param region - AWS region override.
 * @returns The change ID for tracking the change status.
 */
export async function upsertRecord(
  hostedZoneId: string,
  name: string,
  type: string,
  value: string | string[],
  ttl = 300,
  region?: string,
): Promise<string> {
  const values = normalizeValues(value);
  try {
    const resp = await r53(region).send(
      new ChangeResourceRecordSetsCommand({
        HostedZoneId: normalizeZoneId(hostedZoneId),
        ChangeBatch: {
          Changes: [
            {
              Action: "UPSERT",
              ResourceRecordSet: {
                Name: name,
                Type: type as RRType,
                TTL: ttl,
                ResourceRecords: values.map((v) => ({
                  Value: v,
                })),
              },
            },
          ],
        },
      }),
    );
    return resp.ChangeInfo?.Id?.replace(/^\/change\//, "") ?? "";
  } catch (err) {
    throw wrapAwsError(
      err,
      `upsertRecord(${hostedZoneId}, ${name}, ${type})`,
    );
  }
}

/**
 * Delete a DNS record from a hosted zone.
 *
 * The record values and TTL must match the existing record exactly.
 *
 * @param hostedZoneId - The hosted zone ID.
 * @param name - The record name.
 * @param type - The record type.
 * @param value - One or more record values (must match existing).
 * @param ttl - Time to live in seconds (default 300, must match existing).
 * @param region - AWS region override.
 * @returns The change ID for tracking the change status.
 */
export async function deleteRecord(
  hostedZoneId: string,
  name: string,
  type: string,
  value: string | string[],
  ttl = 300,
  region?: string,
): Promise<string> {
  const values = normalizeValues(value);
  try {
    const resp = await r53(region).send(
      new ChangeResourceRecordSetsCommand({
        HostedZoneId: normalizeZoneId(hostedZoneId),
        ChangeBatch: {
          Changes: [
            {
              Action: "DELETE",
              ResourceRecordSet: {
                Name: name,
                Type: type as RRType,
                TTL: ttl,
                ResourceRecords: values.map((v) => ({
                  Value: v,
                })),
              },
            },
          ],
        },
      }),
    );
    return resp.ChangeInfo?.Id?.replace(/^\/change\//, "") ?? "";
  } catch (err) {
    throw wrapAwsError(
      err,
      `deleteRecord(${hostedZoneId}, ${name}, ${type})`,
    );
  }
}

/**
 * Poll a Route 53 change until it reaches INSYNC status.
 *
 * @param changeId - The change ID to poll (with or without `/change/` prefix).
 * @param timeout - Maximum wait time in milliseconds (default 120000 = 2 min).
 * @param pollInterval - Polling interval in milliseconds (default 5000 = 5 sec).
 * @param region - AWS region override.
 * @throws {AwsTimeoutError} If the change does not reach INSYNC before timeout.
 */
export async function waitForChange(
  changeId: string,
  timeout = 120_000,
  pollInterval = 5_000,
  region?: string,
): Promise<void> {
  const normalizedId = changeId.replace(/^\/change\//, "");
  const deadline = Date.now() + timeout;

  try {
    while (Date.now() < deadline) {
      const resp = await r53(region).send(
        new GetChangeCommand({ Id: normalizedId }),
      );
      if (resp.ChangeInfo?.Status === "INSYNC") {
        return;
      }
      if (Date.now() + pollInterval > deadline) {
        break;
      }
      await new Promise((resolve) =>
        setTimeout(resolve, pollInterval),
      );
    }
  } catch (err) {
    throw wrapAwsError(
      err,
      `waitForChange(${normalizedId})`,
    );
  }

  throw new AwsTimeoutError(
    `Change ${normalizedId} did not reach INSYNC within ${timeout}ms`,
  );
}

// ---------------------------------------------------------------------------
// Bulk operations
// ---------------------------------------------------------------------------

/** Descriptor for a record within {@link bulkUpsertRecords}. */
export interface BulkRecordDescriptor {
  name: string;
  type: string;
  value: string | string[];
  ttl?: number;
}

/**
 * Upsert multiple DNS records in a single batch change.
 *
 * All records are submitted in a single ChangeResourceRecordSets call,
 * which is atomic — either all changes succeed or none do.
 *
 * @param hostedZoneId - The hosted zone ID.
 * @param records - Array of record descriptors.
 * @param region - AWS region override.
 * @returns The change ID for tracking the change status.
 */
export async function bulkUpsertRecords(
  hostedZoneId: string,
  records: BulkRecordDescriptor[],
  region?: string,
): Promise<string> {
  try {
    const changes = records.map((rec) => {
      const values = normalizeValues(rec.value);
      return {
        Action: "UPSERT" as const,
        ResourceRecordSet: {
          Name: rec.name,
          Type: rec.type as RRType,
          TTL: rec.ttl ?? 300,
          ResourceRecords: values.map((v) => ({ Value: v })),
        },
      };
    });

    const resp = await r53(region).send(
      new ChangeResourceRecordSetsCommand({
        HostedZoneId: normalizeZoneId(hostedZoneId),
        ChangeBatch: { Changes: changes },
      }),
    );
    return resp.ChangeInfo?.Id?.replace(/^\/change\//, "") ?? "";
  } catch (err) {
    throw wrapAwsError(
      err,
      `bulkUpsertRecords(${hostedZoneId})`,
    );
  }
}

// ---------------------------------------------------------------------------
// Additional types (auto-generated)
// ---------------------------------------------------------------------------

/** Result of activate_key_signing_key. */
export type ActivateKeySigningKeyResult = {
  changeInfo?: Record<string, unknown>;
};

/** Result of associate_vpc_with_hosted_zone. */
export type AssociateVpcWithHostedZoneResult = {
  changeInfo?: Record<string, unknown>;
};

/** Result of change_cidr_collection. */
export type ChangeCidrCollectionResult = {
  id?: string | undefined;
};

/** Result of change_resource_record_sets. */
export type ChangeResourceRecordSetsResult = {
  changeInfo?: Record<string, unknown>;
};

/** Result of create_cidr_collection. */
export type CreateCidrCollectionResult = {
  collection?: Record<string, unknown>;
  location?: string | undefined;
};

/** Result of create_health_check. */
export type CreateHealthCheckResult = {
  healthCheck?: Record<string, unknown>;
  location?: string | undefined;
};

/** Result of create_hosted_zone. */
export type CreateHostedZoneResult = {
  hostedZone?: Record<string, unknown>;
  changeInfo?: Record<string, unknown>;
  delegationSet?: Record<string, unknown>;
  vpc?: Record<string, unknown>;
  location?: string | undefined;
};

/** Result of create_key_signing_key. */
export type CreateKeySigningKeyResult = {
  changeInfo?: Record<string, unknown>;
  keySigningKey?: Record<string, unknown>;
  location?: string | undefined;
};

/** Result of create_query_logging_config. */
export type CreateQueryLoggingConfigResult = {
  queryLoggingConfig?: Record<string, unknown>;
  location?: string | undefined;
};

/** Result of create_reusable_delegation_set. */
export type CreateReusableDelegationSetResult = {
  delegationSet?: Record<string, unknown>;
  location?: string | undefined;
};

/** Result of create_traffic_policy. */
export type CreateTrafficPolicyResult = {
  trafficPolicy?: Record<string, unknown>;
  location?: string | undefined;
};

/** Result of create_traffic_policy_instance. */
export type CreateTrafficPolicyInstanceResult = {
  trafficPolicyInstance?: Record<string, unknown>;
  location?: string | undefined;
};

/** Result of create_traffic_policy_version. */
export type CreateTrafficPolicyVersionResult = {
  trafficPolicy?: Record<string, unknown>;
  location?: string | undefined;
};

/** Result of create_vpc_association_authorization. */
export type CreateVpcAssociationAuthorizationResult = {
  hostedZoneId?: string | undefined;
  vpc?: Record<string, unknown>;
};

/** Result of deactivate_key_signing_key. */
export type DeactivateKeySigningKeyResult = {
  changeInfo?: Record<string, unknown>;
};

/** Result of delete_hosted_zone. */
export type DeleteHostedZoneResult = {
  changeInfo?: Record<string, unknown>;
};

/** Result of delete_key_signing_key. */
export type DeleteKeySigningKeyResult = {
  changeInfo?: Record<string, unknown>;
};

/** Result of disable_hosted_zone_dnssec. */
export type DisableHostedZoneDnssecResult = {
  changeInfo?: Record<string, unknown>;
};

/** Result of disassociate_vpc_from_hosted_zone. */
export type DisassociateVpcFromHostedZoneResult = {
  changeInfo?: Record<string, unknown>;
};

/** Result of enable_hosted_zone_dnssec. */
export type EnableHostedZoneDnssecResult = {
  changeInfo?: Record<string, unknown>;
};

/** Result of get_account_limit. */
export type GetAccountLimitResult = {
  limit?: Record<string, unknown>;
  count?: number | undefined;
};

/** Result of get_change. */
export type GetChangeResult = {
  changeInfo?: Record<string, unknown>;
};

/** Result of get_checker_ip_ranges. */
export type GetCheckerIpRangesResult = {
  checkerIpRanges?: string[];
};

/** Result of get_dnssec. */
export type GetDnssecResult = {
  status?: Record<string, unknown>;
  keySigningKeys?: Record<string, unknown>[];
};

/** Result of get_geo_location. */
export type GetGeoLocationResult = {
  geoLocationDetails?: Record<string, unknown>;
};

/** Result of get_health_check. */
export type GetHealthCheckResult = {
  healthCheck?: Record<string, unknown>;
};

/** Result of get_health_check_count. */
export type GetHealthCheckCountResult = {
  healthCheckCount?: number | undefined;
};

/** Result of get_health_check_last_failure_reason. */
export type GetHealthCheckLastFailureReasonResult = {
  healthCheckObservations?: Record<string, unknown>[];
};

/** Result of get_health_check_status. */
export type GetHealthCheckStatusResult = {
  healthCheckObservations?: Record<string, unknown>[];
};

/** Result of get_hosted_zone_count. */
export type GetHostedZoneCountResult = {
  hostedZoneCount?: number | undefined;
};

/** Result of get_hosted_zone_limit. */
export type GetHostedZoneLimitResult = {
  limit?: Record<string, unknown>;
  count?: number | undefined;
};

/** Result of get_query_logging_config. */
export type GetQueryLoggingConfigResult = {
  queryLoggingConfig?: Record<string, unknown>;
};

/** Result of get_reusable_delegation_set. */
export type GetReusableDelegationSetResult = {
  delegationSet?: Record<string, unknown>;
};

/** Result of get_reusable_delegation_set_limit. */
export type GetReusableDelegationSetLimitResult = {
  limit?: Record<string, unknown>;
  count?: number | undefined;
};

/** Result of get_traffic_policy. */
export type GetTrafficPolicyResult = {
  trafficPolicy?: Record<string, unknown>;
};

/** Result of get_traffic_policy_instance. */
export type GetTrafficPolicyInstanceResult = {
  trafficPolicyInstance?: Record<string, unknown>;
};

/** Result of get_traffic_policy_instance_count. */
export type GetTrafficPolicyInstanceCountResult = {
  trafficPolicyInstanceCount?: number | undefined;
};

/** Result of list_cidr_blocks. */
export type ListCidrBlocksResult = {
  nextToken?: string | undefined;
  cidrBlocks?: Record<string, unknown>[];
};

/** Result of list_cidr_collections. */
export type ListCidrCollectionsResult = {
  nextToken?: string | undefined;
  cidrCollections?: Record<string, unknown>[];
};

/** Result of list_cidr_locations. */
export type ListCidrLocationsResult = {
  nextToken?: string | undefined;
  cidrLocations?: Record<string, unknown>[];
};

/** Result of list_geo_locations. */
export type ListGeoLocationsResult = {
  geoLocationDetailsList?: Record<string, unknown>[];
  isTruncated?: boolean | undefined;
  nextContinentCode?: string | undefined;
  nextCountryCode?: string | undefined;
  nextSubdivisionCode?: string | undefined;
  maxItems?: string | undefined;
};

/** Result of list_health_checks. */
export type ListHealthChecksResult = {
  healthChecks?: Record<string, unknown>[];
  marker?: string | undefined;
  isTruncated?: boolean | undefined;
  nextMarker?: string | undefined;
  maxItems?: string | undefined;
};

/** Result of list_hosted_zones_by_name. */
export type ListHostedZonesByNameResult = {
  hostedZones?: Record<string, unknown>[];
  dnsName?: string | undefined;
  hostedZoneId?: string | undefined;
  isTruncated?: boolean | undefined;
  nextDnsName?: string | undefined;
  nextHostedZoneId?: string | undefined;
  maxItems?: string | undefined;
};

/** Result of list_hosted_zones_by_vpc. */
export type ListHostedZonesByVpcResult = {
  hostedZoneSummaries?: Record<string, unknown>[];
  maxItems?: string | undefined;
  nextToken?: string | undefined;
};

/** Result of list_query_logging_configs. */
export type ListQueryLoggingConfigsResult = {
  queryLoggingConfigs?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_resource_record_sets. */
export type ListResourceRecordSetsResult = {
  resourceRecordSets?: Record<string, unknown>[];
  isTruncated?: boolean | undefined;
  nextRecordName?: string | undefined;
  nextRecordType?: string | undefined;
  nextRecordIdentifier?: string | undefined;
  maxItems?: string | undefined;
};

/** Result of list_reusable_delegation_sets. */
export type ListReusableDelegationSetsResult = {
  delegationSets?: Record<string, unknown>[];
  marker?: string | undefined;
  isTruncated?: boolean | undefined;
  nextMarker?: string | undefined;
  maxItems?: string | undefined;
};

/** Result of list_tags_for_resource. */
export type ListTagsForResourceResult = {
  resourceTagSet?: Record<string, unknown>;
};

/** Result of list_tags_for_resources. */
export type ListTagsForResourcesResult = {
  resourceTagSets?: Record<string, unknown>[];
};

/** Result of list_traffic_policies. */
export type ListTrafficPoliciesResult = {
  trafficPolicySummaries?: Record<string, unknown>[];
  isTruncated?: boolean | undefined;
  trafficPolicyIdMarker?: string | undefined;
  maxItems?: string | undefined;
};

/** Result of list_traffic_policy_instances. */
export type ListTrafficPolicyInstancesResult = {
  trafficPolicyInstances?: Record<string, unknown>[];
  hostedZoneIdMarker?: string | undefined;
  trafficPolicyInstanceNameMarker?: string | undefined;
  trafficPolicyInstanceTypeMarker?: string | undefined;
  isTruncated?: boolean | undefined;
  maxItems?: string | undefined;
};

/** Result of list_traffic_policy_instances_by_hosted_zone. */
export type ListTrafficPolicyInstancesByHostedZoneResult = {
  trafficPolicyInstances?: Record<string, unknown>[];
  trafficPolicyInstanceNameMarker?: string | undefined;
  trafficPolicyInstanceTypeMarker?: string | undefined;
  isTruncated?: boolean | undefined;
  maxItems?: string | undefined;
};

/** Result of list_traffic_policy_instances_by_policy. */
export type ListTrafficPolicyInstancesByPolicyResult = {
  trafficPolicyInstances?: Record<string, unknown>[];
  hostedZoneIdMarker?: string | undefined;
  trafficPolicyInstanceNameMarker?: string | undefined;
  trafficPolicyInstanceTypeMarker?: string | undefined;
  isTruncated?: boolean | undefined;
  maxItems?: string | undefined;
};

/** Result of list_traffic_policy_versions. */
export type ListTrafficPolicyVersionsResult = {
  trafficPolicies?: Record<string, unknown>[];
  isTruncated?: boolean | undefined;
  trafficPolicyVersionMarker?: string | undefined;
  maxItems?: string | undefined;
};

/** Result of list_vpc_association_authorizations. */
export type ListVpcAssociationAuthorizationsResult = {
  hostedZoneId?: string | undefined;
  nextToken?: string | undefined;
  vpCs?: Record<string, unknown>[];
};

/** Result of run_dns_answer. */
export type RunDnsAnswerResult = {
  nameserver?: string | undefined;
  recordName?: string | undefined;
  recordType?: string | undefined;
  recordData?: string[];
  responseCode?: string | undefined;
  protocol?: string | undefined;
};

/** Result of update_health_check. */
export type UpdateHealthCheckResult = {
  healthCheck?: Record<string, unknown>;
};

/** Result of update_hosted_zone_comment. */
export type UpdateHostedZoneCommentResult = {
  hostedZone?: Record<string, unknown>;
};

/** Result of update_traffic_policy_comment. */
export type UpdateTrafficPolicyCommentResult = {
  trafficPolicy?: Record<string, unknown>;
};

/** Result of update_traffic_policy_instance. */
export type UpdateTrafficPolicyInstanceResult = {
  trafficPolicyInstance?: Record<string, unknown>;
};


// ---------------------------------------------------------------------------
// Additional functions (auto-generated)
// ---------------------------------------------------------------------------

/** Activate key signing key. */
export async function activateKeySigningKey(hostedZoneId: string, name: string, regionName?: string | undefined): Promise<ActivateKeySigningKeyResult> {
  try {
    // TODO: implement activate_key_signing_key
    throw new Error("activate_key_signing_key not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "activate_key_signing_key failed");
  }
}

/** Associate vpc with hosted zone. */
export async function associateVpcWithHostedZone(hostedZoneId: string, vpc: Record<string, unknown>): Promise<AssociateVpcWithHostedZoneResult> {
  try {
    // TODO: implement associate_vpc_with_hosted_zone
    throw new Error("associate_vpc_with_hosted_zone not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "associate_vpc_with_hosted_zone failed");
  }
}

/** Change cidr collection. */
export async function changeCidrCollection(id: string, changes: Record<string, unknown>[]): Promise<ChangeCidrCollectionResult> {
  try {
    // TODO: implement change_cidr_collection
    throw new Error("change_cidr_collection not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "change_cidr_collection failed");
  }
}

/** Change resource record sets. */
export async function changeResourceRecordSets(hostedZoneId: string, changeBatch: Record<string, unknown>, regionName?: string | undefined): Promise<ChangeResourceRecordSetsResult> {
  try {
    // TODO: implement change_resource_record_sets
    throw new Error("change_resource_record_sets not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "change_resource_record_sets failed");
  }
}

/** Change tags for resource. */
export async function changeTagsForResource(resourceType: string, resourceId: string): Promise<void> {
  try {
    // TODO: implement change_tags_for_resource
    throw new Error("change_tags_for_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "change_tags_for_resource failed");
  }
}

/** Create cidr collection. */
export async function createCidrCollection(name: string, callerReference: string, regionName?: string | undefined): Promise<CreateCidrCollectionResult> {
  try {
    // TODO: implement create_cidr_collection
    throw new Error("create_cidr_collection not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_cidr_collection failed");
  }
}

/** Create health check. */
export async function createHealthCheck(callerReference: string, healthCheckConfig: Record<string, unknown>, regionName?: string | undefined): Promise<CreateHealthCheckResult> {
  try {
    // TODO: implement create_health_check
    throw new Error("create_health_check not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_health_check failed");
  }
}

/** Create hosted zone. */
export async function createHostedZone(name: string, callerReference: string): Promise<CreateHostedZoneResult> {
  try {
    // TODO: implement create_hosted_zone
    throw new Error("create_hosted_zone not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_hosted_zone failed");
  }
}

/** Create key signing key. */
export async function createKeySigningKey(callerReference: string, hostedZoneId: string, keyManagementServiceArn: string, name: string, status: string, regionName?: string | undefined): Promise<CreateKeySigningKeyResult> {
  try {
    // TODO: implement create_key_signing_key
    throw new Error("create_key_signing_key not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_key_signing_key failed");
  }
}

/** Create query logging config. */
export async function createQueryLoggingConfig(hostedZoneId: string, cloudWatchLogsLogGroupArn: string, regionName?: string | undefined): Promise<CreateQueryLoggingConfigResult> {
  try {
    // TODO: implement create_query_logging_config
    throw new Error("create_query_logging_config not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_query_logging_config failed");
  }
}

/** Create reusable delegation set. */
export async function createReusableDelegationSet(callerReference: string): Promise<CreateReusableDelegationSetResult> {
  try {
    // TODO: implement create_reusable_delegation_set
    throw new Error("create_reusable_delegation_set not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_reusable_delegation_set failed");
  }
}

/** Create traffic policy. */
export async function createTrafficPolicy(name: string, document: string): Promise<CreateTrafficPolicyResult> {
  try {
    // TODO: implement create_traffic_policy
    throw new Error("create_traffic_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_traffic_policy failed");
  }
}

/** Create traffic policy instance. */
export async function createTrafficPolicyInstance(hostedZoneId: string, name: string, ttl: number, trafficPolicyId: string, trafficPolicyVersion: number, regionName?: string | undefined): Promise<CreateTrafficPolicyInstanceResult> {
  try {
    // TODO: implement create_traffic_policy_instance
    throw new Error("create_traffic_policy_instance not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_traffic_policy_instance failed");
  }
}

/** Create traffic policy version. */
export async function createTrafficPolicyVersion(id: string, document: string): Promise<CreateTrafficPolicyVersionResult> {
  try {
    // TODO: implement create_traffic_policy_version
    throw new Error("create_traffic_policy_version not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_traffic_policy_version failed");
  }
}

/** Create vpc association authorization. */
export async function createVpcAssociationAuthorization(hostedZoneId: string, vpc: Record<string, unknown>, regionName?: string | undefined): Promise<CreateVpcAssociationAuthorizationResult> {
  try {
    // TODO: implement create_vpc_association_authorization
    throw new Error("create_vpc_association_authorization not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_vpc_association_authorization failed");
  }
}

/** Deactivate key signing key. */
export async function deactivateKeySigningKey(hostedZoneId: string, name: string, regionName?: string | undefined): Promise<DeactivateKeySigningKeyResult> {
  try {
    // TODO: implement deactivate_key_signing_key
    throw new Error("deactivate_key_signing_key not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "deactivate_key_signing_key failed");
  }
}

/** Delete cidr collection. */
export async function deleteCidrCollection(id: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_cidr_collection
    throw new Error("delete_cidr_collection not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_cidr_collection failed");
  }
}

/** Delete health check. */
export async function deleteHealthCheck(healthCheckId: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_health_check
    throw new Error("delete_health_check not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_health_check failed");
  }
}

/** Delete hosted zone. */
export async function deleteHostedZone(id: string, regionName?: string | undefined): Promise<DeleteHostedZoneResult> {
  try {
    // TODO: implement delete_hosted_zone
    throw new Error("delete_hosted_zone not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_hosted_zone failed");
  }
}

/** Delete key signing key. */
export async function deleteKeySigningKey(hostedZoneId: string, name: string, regionName?: string | undefined): Promise<DeleteKeySigningKeyResult> {
  try {
    // TODO: implement delete_key_signing_key
    throw new Error("delete_key_signing_key not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_key_signing_key failed");
  }
}

/** Delete query logging config. */
export async function deleteQueryLoggingConfig(id: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_query_logging_config
    throw new Error("delete_query_logging_config not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_query_logging_config failed");
  }
}

/** Delete reusable delegation set. */
export async function deleteReusableDelegationSet(id: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_reusable_delegation_set
    throw new Error("delete_reusable_delegation_set not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_reusable_delegation_set failed");
  }
}

/** Delete traffic policy. */
export async function deleteTrafficPolicy(id: string, version: number, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_traffic_policy
    throw new Error("delete_traffic_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_traffic_policy failed");
  }
}

/** Delete traffic policy instance. */
export async function deleteTrafficPolicyInstance(id: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_traffic_policy_instance
    throw new Error("delete_traffic_policy_instance not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_traffic_policy_instance failed");
  }
}

/** Delete vpc association authorization. */
export async function deleteVpcAssociationAuthorization(hostedZoneId: string, vpc: Record<string, unknown>, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_vpc_association_authorization
    throw new Error("delete_vpc_association_authorization not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_vpc_association_authorization failed");
  }
}

/** Disable hosted zone dnssec. */
export async function disableHostedZoneDnssec(hostedZoneId: string, regionName?: string | undefined): Promise<DisableHostedZoneDnssecResult> {
  try {
    // TODO: implement disable_hosted_zone_dnssec
    throw new Error("disable_hosted_zone_dnssec not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disable_hosted_zone_dnssec failed");
  }
}

/** Disassociate vpc from hosted zone. */
export async function disassociateVpcFromHostedZone(hostedZoneId: string, vpc: Record<string, unknown>): Promise<DisassociateVpcFromHostedZoneResult> {
  try {
    // TODO: implement disassociate_vpc_from_hosted_zone
    throw new Error("disassociate_vpc_from_hosted_zone not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disassociate_vpc_from_hosted_zone failed");
  }
}

/** Enable hosted zone dnssec. */
export async function enableHostedZoneDnssec(hostedZoneId: string, regionName?: string | undefined): Promise<EnableHostedZoneDnssecResult> {
  try {
    // TODO: implement enable_hosted_zone_dnssec
    throw new Error("enable_hosted_zone_dnssec not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "enable_hosted_zone_dnssec failed");
  }
}

/** Get account limit. */
export async function getAccountLimit(typeValue: string, regionName?: string | undefined): Promise<GetAccountLimitResult> {
  try {
    // TODO: implement get_account_limit
    throw new Error("get_account_limit not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_account_limit failed");
  }
}

/** Get change. */
export async function getChange(id: string, regionName?: string | undefined): Promise<GetChangeResult> {
  try {
    // TODO: implement get_change
    throw new Error("get_change not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_change failed");
  }
}

/** Get checker ip ranges. */
export async function getCheckerIpRanges(regionName?: string | undefined): Promise<GetCheckerIpRangesResult> {
  try {
    // TODO: implement get_checker_ip_ranges
    throw new Error("get_checker_ip_ranges not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_checker_ip_ranges failed");
  }
}

/** Get dnssec. */
export async function getDnssec(hostedZoneId: string, regionName?: string | undefined): Promise<GetDnssecResult> {
  try {
    // TODO: implement get_dnssec
    throw new Error("get_dnssec not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_dnssec failed");
  }
}

/** Get geo location. */
export async function getGeoLocation(): Promise<GetGeoLocationResult> {
  try {
    // TODO: implement get_geo_location
    throw new Error("get_geo_location not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_geo_location failed");
  }
}

/** Get health check. */
export async function getHealthCheck(healthCheckId: string, regionName?: string | undefined): Promise<GetHealthCheckResult> {
  try {
    // TODO: implement get_health_check
    throw new Error("get_health_check not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_health_check failed");
  }
}

/** Get health check count. */
export async function getHealthCheckCount(regionName?: string | undefined): Promise<GetHealthCheckCountResult> {
  try {
    // TODO: implement get_health_check_count
    throw new Error("get_health_check_count not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_health_check_count failed");
  }
}

/** Get health check last failure reason. */
export async function getHealthCheckLastFailureReason(healthCheckId: string, regionName?: string | undefined): Promise<GetHealthCheckLastFailureReasonResult> {
  try {
    // TODO: implement get_health_check_last_failure_reason
    throw new Error("get_health_check_last_failure_reason not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_health_check_last_failure_reason failed");
  }
}

/** Get health check status. */
export async function getHealthCheckStatus(healthCheckId: string, regionName?: string | undefined): Promise<GetHealthCheckStatusResult> {
  try {
    // TODO: implement get_health_check_status
    throw new Error("get_health_check_status not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_health_check_status failed");
  }
}

/** Get hosted zone count. */
export async function getHostedZoneCount(regionName?: string | undefined): Promise<GetHostedZoneCountResult> {
  try {
    // TODO: implement get_hosted_zone_count
    throw new Error("get_hosted_zone_count not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_hosted_zone_count failed");
  }
}

/** Get hosted zone limit. */
export async function getHostedZoneLimit(typeValue: string, hostedZoneId: string, regionName?: string | undefined): Promise<GetHostedZoneLimitResult> {
  try {
    // TODO: implement get_hosted_zone_limit
    throw new Error("get_hosted_zone_limit not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_hosted_zone_limit failed");
  }
}

/** Get query logging config. */
export async function getQueryLoggingConfig(id: string, regionName?: string | undefined): Promise<GetQueryLoggingConfigResult> {
  try {
    // TODO: implement get_query_logging_config
    throw new Error("get_query_logging_config not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_query_logging_config failed");
  }
}

/** Get reusable delegation set. */
export async function getReusableDelegationSet(id: string, regionName?: string | undefined): Promise<GetReusableDelegationSetResult> {
  try {
    // TODO: implement get_reusable_delegation_set
    throw new Error("get_reusable_delegation_set not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_reusable_delegation_set failed");
  }
}

/** Get reusable delegation set limit. */
export async function getReusableDelegationSetLimit(typeValue: string, delegationSetId: string, regionName?: string | undefined): Promise<GetReusableDelegationSetLimitResult> {
  try {
    // TODO: implement get_reusable_delegation_set_limit
    throw new Error("get_reusable_delegation_set_limit not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_reusable_delegation_set_limit failed");
  }
}

/** Get traffic policy. */
export async function getTrafficPolicy(id: string, version: number, regionName?: string | undefined): Promise<GetTrafficPolicyResult> {
  try {
    // TODO: implement get_traffic_policy
    throw new Error("get_traffic_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_traffic_policy failed");
  }
}

/** Get traffic policy instance. */
export async function getTrafficPolicyInstance(id: string, regionName?: string | undefined): Promise<GetTrafficPolicyInstanceResult> {
  try {
    // TODO: implement get_traffic_policy_instance
    throw new Error("get_traffic_policy_instance not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_traffic_policy_instance failed");
  }
}

/** Get traffic policy instance count. */
export async function getTrafficPolicyInstanceCount(regionName?: string | undefined): Promise<GetTrafficPolicyInstanceCountResult> {
  try {
    // TODO: implement get_traffic_policy_instance_count
    throw new Error("get_traffic_policy_instance_count not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_traffic_policy_instance_count failed");
  }
}

/** List cidr blocks. */
export async function listCidrBlocks(collectionId: string): Promise<ListCidrBlocksResult> {
  try {
    // TODO: implement list_cidr_blocks
    throw new Error("list_cidr_blocks not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_cidr_blocks failed");
  }
}

/** List cidr collections. */
export async function listCidrCollections(): Promise<ListCidrCollectionsResult> {
  try {
    // TODO: implement list_cidr_collections
    throw new Error("list_cidr_collections not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_cidr_collections failed");
  }
}

/** List cidr locations. */
export async function listCidrLocations(collectionId: string): Promise<ListCidrLocationsResult> {
  try {
    // TODO: implement list_cidr_locations
    throw new Error("list_cidr_locations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_cidr_locations failed");
  }
}

/** List geo locations. */
export async function listGeoLocations(): Promise<ListGeoLocationsResult> {
  try {
    // TODO: implement list_geo_locations
    throw new Error("list_geo_locations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_geo_locations failed");
  }
}

/** List health checks. */
export async function listHealthChecks(): Promise<ListHealthChecksResult> {
  try {
    // TODO: implement list_health_checks
    throw new Error("list_health_checks not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_health_checks failed");
  }
}

/** List hosted zones by name. */
export async function listHostedZonesByName(): Promise<ListHostedZonesByNameResult> {
  try {
    // TODO: implement list_hosted_zones_by_name
    throw new Error("list_hosted_zones_by_name not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_hosted_zones_by_name failed");
  }
}

/** List hosted zones by vpc. */
export async function listHostedZonesByVpc(vpcId: string, vpcRegion: string): Promise<ListHostedZonesByVpcResult> {
  try {
    // TODO: implement list_hosted_zones_by_vpc
    throw new Error("list_hosted_zones_by_vpc not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_hosted_zones_by_vpc failed");
  }
}

/** List query logging configs. */
export async function listQueryLoggingConfigs(): Promise<ListQueryLoggingConfigsResult> {
  try {
    // TODO: implement list_query_logging_configs
    throw new Error("list_query_logging_configs not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_query_logging_configs failed");
  }
}

/** List resource record sets. */
export async function listResourceRecordSets(hostedZoneId: string): Promise<ListResourceRecordSetsResult> {
  try {
    // TODO: implement list_resource_record_sets
    throw new Error("list_resource_record_sets not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_resource_record_sets failed");
  }
}

/** List reusable delegation sets. */
export async function listReusableDelegationSets(): Promise<ListReusableDelegationSetsResult> {
  try {
    // TODO: implement list_reusable_delegation_sets
    throw new Error("list_reusable_delegation_sets not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_reusable_delegation_sets failed");
  }
}

/** List tags for resource. */
export async function listTagsForResource(resourceType: string, resourceId: string, regionName?: string | undefined): Promise<ListTagsForResourceResult> {
  try {
    // TODO: implement list_tags_for_resource
    throw new Error("list_tags_for_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_tags_for_resource failed");
  }
}

/** List tags for resources. */
export async function listTagsForResources(resourceType: string, resourceIds: string[], regionName?: string | undefined): Promise<ListTagsForResourcesResult> {
  try {
    // TODO: implement list_tags_for_resources
    throw new Error("list_tags_for_resources not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_tags_for_resources failed");
  }
}

/** List traffic policies. */
export async function listTrafficPolicies(): Promise<ListTrafficPoliciesResult> {
  try {
    // TODO: implement list_traffic_policies
    throw new Error("list_traffic_policies not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_traffic_policies failed");
  }
}

/** List traffic policy instances. */
export async function listTrafficPolicyInstances(): Promise<ListTrafficPolicyInstancesResult> {
  try {
    // TODO: implement list_traffic_policy_instances
    throw new Error("list_traffic_policy_instances not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_traffic_policy_instances failed");
  }
}

/** List traffic policy instances by hosted zone. */
export async function listTrafficPolicyInstancesByHostedZone(hostedZoneId: string): Promise<ListTrafficPolicyInstancesByHostedZoneResult> {
  try {
    // TODO: implement list_traffic_policy_instances_by_hosted_zone
    throw new Error("list_traffic_policy_instances_by_hosted_zone not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_traffic_policy_instances_by_hosted_zone failed");
  }
}

/** List traffic policy instances by policy. */
export async function listTrafficPolicyInstancesByPolicy(trafficPolicyId: string, trafficPolicyVersion: number): Promise<ListTrafficPolicyInstancesByPolicyResult> {
  try {
    // TODO: implement list_traffic_policy_instances_by_policy
    throw new Error("list_traffic_policy_instances_by_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_traffic_policy_instances_by_policy failed");
  }
}

/** List traffic policy versions. */
export async function listTrafficPolicyVersions(id: string): Promise<ListTrafficPolicyVersionsResult> {
  try {
    // TODO: implement list_traffic_policy_versions
    throw new Error("list_traffic_policy_versions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_traffic_policy_versions failed");
  }
}

/** List vpc association authorizations. */
export async function listVpcAssociationAuthorizations(hostedZoneId: string): Promise<ListVpcAssociationAuthorizationsResult> {
  try {
    // TODO: implement list_vpc_association_authorizations
    throw new Error("list_vpc_association_authorizations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_vpc_association_authorizations failed");
  }
}

/** Run dns answer. */
export async function runDnsAnswer(hostedZoneId: string, recordName: string, recordType: string): Promise<RunDnsAnswerResult> {
  try {
    // TODO: implement run_dns_answer
    throw new Error("run_dns_answer not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "run_dns_answer failed");
  }
}

/** Update health check. */
export async function updateHealthCheck(healthCheckId: string): Promise<UpdateHealthCheckResult> {
  try {
    // TODO: implement update_health_check
    throw new Error("update_health_check not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_health_check failed");
  }
}

/** Update hosted zone comment. */
export async function updateHostedZoneComment(id: string): Promise<UpdateHostedZoneCommentResult> {
  try {
    // TODO: implement update_hosted_zone_comment
    throw new Error("update_hosted_zone_comment not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_hosted_zone_comment failed");
  }
}

/** Update traffic policy comment. */
export async function updateTrafficPolicyComment(id: string, version: number, comment: string, regionName?: string | undefined): Promise<UpdateTrafficPolicyCommentResult> {
  try {
    // TODO: implement update_traffic_policy_comment
    throw new Error("update_traffic_policy_comment not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_traffic_policy_comment failed");
  }
}

/** Update traffic policy instance. */
export async function updateTrafficPolicyInstance(id: string, ttl: number, trafficPolicyId: string, trafficPolicyVersion: number, regionName?: string | undefined): Promise<UpdateTrafficPolicyInstanceResult> {
  try {
    // TODO: implement update_traffic_policy_instance
    throw new Error("update_traffic_policy_instance not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_traffic_policy_instance failed");
  }
}
