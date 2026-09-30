/**
 * aws-util/cross-account — Cross-account resource management and federation.
 *
 * Multi-service module combining EventBridge + CloudWatch Logs + Kinesis
 * Firehose + S3 + DynamoDB + SQS + STS + Resource Groups Tagging to provide
 * cross-account event bus federation, centralized log aggregation, and
 * multi-account resource inventory.
 *
 * All functions obtain clients via {@link getClient} and wrap errors
 * through {@link wrapAwsError}.
 *
 * @example
 * ```ts
 * import {
 *   crossAccountEventBusFederator,
 *   centralizedLogAggregator,
 *   multiAccountResourceInventory,
 * } from "./cross-account.js";
 *
 * const federation = await crossAccountEventBusFederator(
 *   "123456789012",
 *   "arn:aws:events:us-east-1:999999999999:event-bus/central",
 *   "arn:aws:iam::123456789012:role/EventForwarder",
 * );
 * ```
 *
 * @module
 */

import { z } from "zod";
import {
  STSClient,
  AssumeRoleCommand,
} from "@aws-sdk/client-sts";
import {
  EventBridgeClient,
  PutRuleCommand,
  PutTargetsCommand,
} from "@aws-sdk/client-eventbridge";
import {
  CloudWatchLogsClient,
  CreateExportTaskCommand,
  DescribeExportTasksCommand,
} from "@aws-sdk/client-cloudwatch-logs";
import {
  ResourceGroupsTaggingAPIClient,
  GetResourcesCommand,
} from "@aws-sdk/client-resource-groups-tagging-api";
import { getClient } from "./client.js";
import { wrapAwsError } from "./exceptions.js";

// ---------------------------------------------------------------------------
// Zod schemas & inferred types
// ---------------------------------------------------------------------------

/** Schema for event bus federation results. */
export const EventBusFederationResultSchema = z.object({
  sourceAccount: z.string(),
  targetBusArn: z.string(),
  ruleArn: z.string().optional(),
  status: z.string(),
});

/** Result of cross-account event bus federation. */
export type EventBusFederationResult = z.infer<
  typeof EventBusFederationResultSchema
>;

/** Schema for centralized log aggregation results. */
export const LogAggregationResultSchema = z.object({
  sourceAccounts: z.array(z.string()),
  destinationBucket: z.string(),
  logsExported: z.number(),
});

/** Result of centralized log aggregation. */
export type LogAggregationResult = z.infer<
  typeof LogAggregationResultSchema
>;

/** Schema for resource inventory item. */
const ResourceInventoryItemSchema = z.object({
  account: z.string(),
  resourceType: z.string(),
  resourceId: z.string(),
  region: z.string(),
  tags: z.record(z.string(), z.string()).optional(),
});

/** Schema for multi-account resource inventory results. */
export const ResourceInventoryResultSchema = z.object({
  accounts: z.array(z.string()),
  resources: z.array(ResourceInventoryItemSchema),
  totalCount: z.number(),
});

/** Result of multi-account resource inventory. */
export type ResourceInventoryResult = z.infer<
  typeof ResourceInventoryResultSchema
>;

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Assume an IAM role and return temporary credentials.
 *
 * @param roleArn - ARN of the role to assume.
 * @param sessionName - Session name for the assumed role.
 * @param region - AWS region for the STS call.
 * @returns Temporary credentials object.
 */
async function assumeRole(
  roleArn: string,
  sessionName: string,
  region?: string,
): Promise<{
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken: string;
}> {
  const sts = getClient(STSClient, region);
  const resp = await sts.send(
    new AssumeRoleCommand({
      RoleArn: roleArn,
      RoleSessionName: sessionName,
    }),
  );
  const creds = resp.Credentials;
  if (
    !creds ||
    !creds.AccessKeyId ||
    !creds.SecretAccessKey ||
    !creds.SessionToken
  ) {
    throw new Error("AssumeRole returned incomplete credentials");
  }
  return {
    accessKeyId: creds.AccessKeyId,
    secretAccessKey: creds.SecretAccessKey,
    sessionToken: creds.SessionToken,
  };
}

/**
 * Create an EventBridge client with assumed-role credentials.
 */
function createCrossAccountEventBridgeClient(
  creds: {
    accessKeyId: string;
    secretAccessKey: string;
    sessionToken: string;
  },
  region?: string,
): EventBridgeClient {
  return new EventBridgeClient({
    region,
    credentials: {
      accessKeyId: creds.accessKeyId,
      secretAccessKey: creds.secretAccessKey,
      sessionToken: creds.sessionToken,
    },
  });
}

/**
 * Create a CloudWatch Logs client with assumed-role credentials.
 */
function createCrossAccountCWLogsClient(
  creds: {
    accessKeyId: string;
    secretAccessKey: string;
    sessionToken: string;
  },
  region?: string,
): CloudWatchLogsClient {
  return new CloudWatchLogsClient({
    region,
    credentials: {
      accessKeyId: creds.accessKeyId,
      secretAccessKey: creds.secretAccessKey,
      sessionToken: creds.sessionToken,
    },
  });
}

/**
 * Create a Resource Groups Tagging API client with assumed-role credentials.
 */
function createCrossAccountTaggingClient(
  creds: {
    accessKeyId: string;
    secretAccessKey: string;
    sessionToken: string;
  },
  region?: string,
): ResourceGroupsTaggingAPIClient {
  return new ResourceGroupsTaggingAPIClient({
    region,
    credentials: {
      accessKeyId: creds.accessKeyId,
      secretAccessKey: creds.secretAccessKey,
      sessionToken: creds.sessionToken,
    },
  });
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Federate events from a source account to a target event bus.
 *
 * Assumes the provided IAM role in the source account, then creates an
 * EventBridge rule that forwards matching events to the target bus ARN.
 *
 * @param sourceAccount - AWS account ID of the source account.
 * @param targetBusArn - ARN of the target EventBridge event bus.
 * @param roleArn - IAM role ARN to assume in the source account.
 * @param eventPattern - Optional EventBridge event pattern (JSON string or object).
 * @param region - AWS region. Defaults to SDK default.
 * @returns Federation result with rule ARN and status.
 *
 * @example
 * ```ts
 * const result = await crossAccountEventBusFederator(
 *   "123456789012",
 *   "arn:aws:events:us-east-1:999999999999:event-bus/central",
 *   "arn:aws:iam::123456789012:role/EventForwarder",
 *   { source: ["my.app"] },
 * );
 * ```
 */
export async function crossAccountEventBusFederator(
  sourceAccount: string,
  targetBusArn: string,
  roleArn: string,
  eventPattern?: string | object,
  region?: string,
): Promise<EventBusFederationResult> {
  try {
    const creds = await assumeRole(
      roleArn,
      "cross-account-event-federation",
      region,
    );
    const eb = createCrossAccountEventBridgeClient(creds, region);

    const ruleName = `cross-account-forward-${sourceAccount}-${Date.now()}`;
    const pattern =
      eventPattern !== undefined
        ? typeof eventPattern === "string"
          ? eventPattern
          : JSON.stringify(eventPattern)
        : JSON.stringify({ account: [sourceAccount] });

    const ruleResp = await eb.send(
      new PutRuleCommand({
        Name: ruleName,
        EventPattern: pattern,
        State: "ENABLED",
        Description: `Forward events from ${sourceAccount} to ${targetBusArn}`,
      }),
    );

    await eb.send(
      new PutTargetsCommand({
        Rule: ruleName,
        Targets: [
          {
            Id: `target-${sourceAccount}`,
            Arn: targetBusArn,
            RoleArn: roleArn,
          },
        ],
      }),
    );

    const result: EventBusFederationResult = {
      sourceAccount,
      targetBusArn,
      ruleArn: ruleResp.RuleArn ?? undefined,
      status: "ACTIVE",
    };
    return EventBusFederationResultSchema.parse(result);
  } catch (err) {
    throw wrapAwsError(err, "crossAccountEventBusFederator failed");
  }
}

/**
 * Aggregate CloudWatch logs from multiple accounts into a central S3 bucket.
 *
 * For each source account, assumes the corresponding role, then creates
 * export tasks to send CloudWatch log groups to the destination S3 bucket.
 *
 * @param sourceAccounts - Array of AWS account IDs.
 * @param roleArns - Corresponding IAM role ARNs for each account.
 * @param logGroupNames - CloudWatch log group names to export.
 * @param destinationBucket - S3 bucket for log aggregation.
 * @param prefix - Optional S3 key prefix for exports.
 * @param startTime - Export start time (epoch ms). Defaults to 24h ago.
 * @param endTime - Export end time (epoch ms). Defaults to now.
 * @param region - AWS region. Defaults to SDK default.
 * @returns Aggregation result with count of logs exported.
 *
 * @example
 * ```ts
 * const result = await centralizedLogAggregator(
 *   ["111111111111", "222222222222"],
 *   ["arn:aws:iam::111111111111:role/LogExport", "arn:aws:iam::222222222222:role/LogExport"],
 *   ["/aws/lambda/my-function"],
 *   "central-logs-bucket",
 * );
 * ```
 */
export async function centralizedLogAggregator(
  sourceAccounts: string[],
  roleArns: string[],
  logGroupNames: string[],
  destinationBucket: string,
  prefix?: string,
  startTime?: number,
  endTime?: number,
  region?: string,
): Promise<LogAggregationResult> {
  try {
    const now = Date.now();
    const from = startTime ?? now - 24 * 60 * 60 * 1000;
    const to = endTime ?? now;
    let logsExported = 0;

    for (let i = 0; i < sourceAccounts.length; i++) {
      const account = sourceAccounts[i];
      const roleArn = roleArns[i];
      if (!roleArn) {
        continue;
      }

      const creds = await assumeRole(
        roleArn,
        `log-aggregation-${account}`,
        region,
      );
      const cwLogs = createCrossAccountCWLogsClient(creds, region);

      for (const logGroup of logGroupNames) {
        const exportPrefix = prefix
          ? `${prefix}/${account}/${logGroup.replace(/\//g, "_")}`
          : `${account}/${logGroup.replace(/\//g, "_")}`;

        await cwLogs.send(
          new CreateExportTaskCommand({
            logGroupName: logGroup,
            from: from,
            to: to,
            destination: destinationBucket,
            destinationPrefix: exportPrefix,
          }),
        );
        logsExported += 1;
      }
    }

    const result: LogAggregationResult = {
      sourceAccounts,
      destinationBucket,
      logsExported,
    };
    return LogAggregationResultSchema.parse(result);
  } catch (err) {
    throw wrapAwsError(err, "centralizedLogAggregator failed");
  }
}

/**
 * Build a resource inventory across multiple AWS accounts.
 *
 * For each account, assumes the provided role and uses the Resource Groups
 * Tagging API to enumerate all tagged resources, optionally filtered by
 * resource type.
 *
 * @param accounts - Array of account descriptors with accountId and roleArn.
 * @param resourceTypeFilters - Optional resource type filters (e.g. ["ec2:instance"]).
 * @param region - AWS region. Defaults to SDK default.
 * @returns Inventory result with all discovered resources.
 *
 * @example
 * ```ts
 * const inventory = await multiAccountResourceInventory([
 *   { accountId: "111111111111", roleArn: "arn:aws:iam::111111111111:role/Inventory" },
 *   { accountId: "222222222222", roleArn: "arn:aws:iam::222222222222:role/Inventory" },
 * ]);
 * ```
 */
export async function multiAccountResourceInventory(
  accounts: Array<{ accountId: string; roleArn: string }>,
  resourceTypeFilters?: string[],
  region?: string,
): Promise<ResourceInventoryResult> {
  try {
    const allResources: Array<{
      account: string;
      resourceType: string;
      resourceId: string;
      region: string;
      tags?: Record<string, string>;
    }> = [];

    for (const { accountId, roleArn } of accounts) {
      const creds = await assumeRole(
        roleArn,
        `resource-inventory-${accountId}`,
        region,
      );
      const tagging = createCrossAccountTaggingClient(creds, region);

      let paginationToken: string | undefined;
      do {
        const resp = await tagging.send(
          new GetResourcesCommand({
            ResourceTypeFilters: resourceTypeFilters,
            PaginationToken: paginationToken,
          }),
        );

        for (const mapping of resp.ResourceTagMappingList ?? []) {
          const arn = mapping.ResourceARN ?? "";
          const arnParts = arn.split(":");
          const resourceRegion = arnParts[3] ?? region ?? "unknown";
          const resourceType = arnParts[2] ?? "unknown";
          const resourceId = arnParts[arnParts.length - 1] ?? arn;

          const tags: Record<string, string> = {};
          for (const tag of mapping.Tags ?? []) {
            if (tag.Key) {
              tags[tag.Key] = tag.Value ?? "";
            }
          }

          allResources.push({
            account: accountId,
            resourceType,
            resourceId,
            region: resourceRegion,
            tags:
              Object.keys(tags).length > 0 ? tags : undefined,
          });
        }

        paginationToken = resp.PaginationToken;
      } while (paginationToken);
    }

    const result: ResourceInventoryResult = {
      accounts: accounts.map((a) => a.accountId),
      resources: allResources,
      totalCount: allResources.length,
    };
    return ResourceInventoryResultSchema.parse(result);
  } catch (err) {
    throw wrapAwsError(
      err,
      "multiAccountResourceInventory failed",
    );
  }
}
