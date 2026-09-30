/**
 * aws-util/iot-pipelines — Multi-service IoT pipeline utilities.
 *
 * Provides typed helpers for:
 * - Routing IoT telemetry to Timestream via topic rules
 * - Syncing device shadows with DynamoDB
 * - Broadcasting fleet commands via IoT Jobs
 * - Alerting via SNS based on SiteWise property thresholds
 * - Deploying Greengrass v2 components from local ZIP artifacts
 *
 * Multi-service: IoT Core + Timestream + IoT Data + DynamoDB + S3 +
 * SiteWise + SNS + Greengrass v2.
 *
 * @module
 */

import { z } from "zod";
import { IoTClient } from "@aws-sdk/client-iot";
import { getClient } from "./client.js";
import { wrapAwsError } from "./exceptions.js";

// ---------------------------------------------------------------------------
// Zod schemas & inferred types
// ---------------------------------------------------------------------------

/** Schema for an IoT-to-Timestream rule result. */
export const IoTTimestreamRuleResultSchema = z.object({
  ruleName: z.string(),
  ruleArn: z.string(),
  databaseName: z.string(),
  tableName: z.string(),
  createdDatabase: z.boolean(),
  createdTable: z.boolean(),
});

/** An IoT-to-Timestream rule result. */
export type IoTTimestreamRuleResult = z.infer<typeof IoTTimestreamRuleResultSchema>;

/** Schema for a device shadow sync result. */
export const DeviceShadowSyncResultSchema = z.object({
  thingName: z.string(),
  reportedState: z.record(z.unknown()),
  desiredState: z.record(z.unknown()),
  deltaKeys: z.array(z.string()),
  syncedToDynamoDb: z.boolean(),
});

/** A device shadow sync result. */
export type DeviceShadowSyncResult = z.infer<typeof DeviceShadowSyncResultSchema>;

/** Schema for a fleet command broadcast result. */
export const FleetCommandResultSchema = z.object({
  jobId: z.string(),
  jobArn: z.string(),
  targetsCount: z.number().int(),
  documentKey: z.string(),
});

/** A fleet command broadcast result. */
export type FleetCommandResult = z.infer<typeof FleetCommandResultSchema>;

/** Schema for an IoT alert result. */
export const IoTAlertResultSchema = z.object({
  assetId: z.string(),
  propertyId: z.string(),
  currentValue: z.number(),
  thresholdBreached: z.boolean(),
  messageId: z.string().nullable().optional(),
});

/** An IoT alert result. */
export type IoTAlertResult = z.infer<typeof IoTAlertResultSchema>;

/** Schema for a Greengrass deployment result. */
export const GreengrassDeployResultSchema = z.object({
  componentArn: z.string(),
  deploymentId: z.string(),
  artifactKey: z.string(),
});

/** A Greengrass deployment result. */
export type GreengrassDeployResult = z.infer<typeof GreengrassDeployResultSchema>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function iotClient(region?: string): IoTClient {
  return getClient(IoTClient, region);
}

// ---------------------------------------------------------------------------
// 1. IoT Telemetry to Timestream
// ---------------------------------------------------------------------------

/**
 * Create/ensure an IoT topic rule that routes device telemetry to Timestream.
 *
 * Creates the Timestream database and table if they don't exist, then creates
 * (or replaces) an IoT topic rule with a Timestream action.
 *
 * @param ruleName - IoT topic rule name.
 * @param topicFilter - MQTT topic filter expression.
 * @param databaseName - Timestream database name.
 * @param tableName - Timestream table name.
 * @param roleArn - IAM role ARN for IoT to assume when writing to Timestream.
 * @param dimensions - Timestream dimension mappings.
 * @param region - AWS region override.
 * @returns {@link IoTTimestreamRuleResult}
 */
export async function iotTelemetryToTimestream(
  ruleName: string,
  topicFilter: string,
  databaseName: string,
  tableName: string,
  roleArn: string,
  dimensions: Array<{ name: string; value: string }>,
  region?: string,
): Promise<IoTTimestreamRuleResult> {
  const client = iotClient(region);
  try {
    // TODO: implement iotTelemetryToTimestream
    throw new Error("iotTelemetryToTimestream not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "iotTelemetryToTimestream failed");
  }
}

// ---------------------------------------------------------------------------
// 2. IoT Device Shadow Sync
// ---------------------------------------------------------------------------

/**
 * Read IoT Device Shadow, diff reported vs desired state, write to DynamoDB.
 *
 * @param thingName - IoT thing name.
 * @param tableName - DynamoDB table name.
 * @param shadowName - Named shadow identifier (undefined = classic shadow).
 * @param region - AWS region override.
 * @returns {@link DeviceShadowSyncResult}
 */
export async function iotDeviceShadowSync(
  thingName: string,
  tableName: string,
  shadowName?: string,
  region?: string,
): Promise<DeviceShadowSyncResult> {
  const client = iotClient(region);
  try {
    // TODO: implement iotDeviceShadowSync
    throw new Error("iotDeviceShadowSync not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "iotDeviceShadowSync failed");
  }
}

// ---------------------------------------------------------------------------
// 3. IoT Fleet Command Broadcaster
// ---------------------------------------------------------------------------

/**
 * Create an IoT Job targeting a thing group to broadcast a command.
 *
 * Stores the job document in S3 and tracks job metadata in DynamoDB.
 *
 * @param jobId - Unique IoT Job identifier.
 * @param thingGroupArn - ARN of the thing group to target.
 * @param commandDocument - Job document payload.
 * @param bucket - S3 bucket for the job document.
 * @param tableName - DynamoDB table for job tracking.
 * @param targetSelection - "SNAPSHOT" or "CONTINUOUS".
 * @param region - AWS region override.
 * @returns {@link FleetCommandResult}
 */
export async function iotFleetCommandBroadcaster(
  jobId: string,
  thingGroupArn: string,
  commandDocument: Record<string, unknown>,
  bucket: string,
  tableName: string,
  targetSelection: "SNAPSHOT" | "CONTINUOUS" = "SNAPSHOT",
  region?: string,
): Promise<FleetCommandResult> {
  const client = iotClient(region);
  try {
    // TODO: implement iotFleetCommandBroadcaster
    throw new Error("iotFleetCommandBroadcaster not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "iotFleetCommandBroadcaster failed");
  }
}

// ---------------------------------------------------------------------------
// 4. IoT Alert to SNS
// ---------------------------------------------------------------------------

/**
 * Read IoT SiteWise asset property values, evaluate against threshold,
 * publish structured alerts to SNS for breaches.
 *
 * @param assetId - IoT SiteWise asset identifier.
 * @param propertyId - Property identifier within the asset.
 * @param thresholdValue - Numeric threshold for breach detection.
 * @param comparison - One of "GT", "LT", "GTE", "LTE".
 * @param snsTopicArn - SNS topic ARN for alerts.
 * @param region - AWS region override.
 * @returns {@link IoTAlertResult}
 */
export async function iotAlertToSns(
  assetId: string,
  propertyId: string,
  thresholdValue: number,
  comparison: "GT" | "LT" | "GTE" | "LTE",
  snsTopicArn: string,
  region?: string,
): Promise<IoTAlertResult> {
  const client = iotClient(region);
  try {
    // TODO: implement iotAlertToSns
    throw new Error("iotAlertToSns not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "iotAlertToSns failed");
  }
}

// ---------------------------------------------------------------------------
// 5. Greengrass Component Deployer
// ---------------------------------------------------------------------------

/**
 * Upload a Lambda function ZIP to S3, create a Greengrass v2 component
 * version, then create a deployment to a target thing group.
 *
 * @param componentName - Greengrass v2 component name.
 * @param componentVersion - Semantic version string.
 * @param artifactPath - Local path to the Lambda ZIP archive.
 * @param bucket - S3 bucket accessible by Greengrass devices.
 * @param targetArn - ARN of the Greengrass core device or thing group.
 * @param region - AWS region override.
 * @returns {@link GreengrassDeployResult}
 */
export async function iotGreengrassComponentDeployer(
  componentName: string,
  componentVersion: string,
  artifactPath: string,
  bucket: string,
  targetArn: string,
  region?: string,
): Promise<GreengrassDeployResult> {
  const client = iotClient(region);
  try {
    // TODO: implement iotGreengrassComponentDeployer
    throw new Error("iotGreengrassComponentDeployer not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "iotGreengrassComponentDeployer failed");
  }
}
