/**
 * aws-util/storage-ops — Multi-service storage operation utilities.
 *
 * Provides typed helpers for EFS-to-S3 sync, FSx backup archival,
 * Transfer Family event processing, Storage Gateway cache monitoring,
 * and Lightsail snapshot archival.
 *
 * @module
 */

import { z } from "zod";
import { EFSClient } from "@aws-sdk/client-efs";
import { FSxClient } from "@aws-sdk/client-fsx";
import { TransferClient } from "@aws-sdk/client-transfer";
import { StorageGatewayClient } from "@aws-sdk/client-storage-gateway";
import { LightsailClient } from "@aws-sdk/client-lightsail";
import { getClient } from "./client.js";
import { wrapAwsError } from "./exceptions.js";

// ---------------------------------------------------------------------------
// Zod schemas & inferred types
// ---------------------------------------------------------------------------

/** Schema for an EFS to S3 sync result. */
export const EfsToS3SyncResultSchema = z.object({
  fileSystemId: z.string(),
  destinationBucket: z.string(),
  filesSynced: z.number(),
  bytesTransferred: z.number(),
  success: z.boolean(),
});

/** EFS to S3 sync result. */
export type EfsToS3SyncResult = z.infer<typeof EfsToS3SyncResultSchema>;

/** Schema for an FSx backup to S3 result. */
export const FsxBackupToS3ResultSchema = z.object({
  fileSystemId: z.string(),
  backupId: z.string(),
  s3Bucket: z.string(),
  s3Key: z.string(),
  success: z.boolean(),
});

/** FSx backup to S3 result. */
export type FsxBackupToS3Result = z.infer<typeof FsxBackupToS3ResultSchema>;

/** Schema for a Transfer Family event processor result. */
export const TransferFamilyEventResultSchema = z.object({
  serverId: z.string(),
  username: z.string(),
  eventType: z.string(),
  filePath: z.string().optional(),
  processed: z.boolean(),
});

/** Transfer Family event processor result. */
export type TransferFamilyEventResult = z.infer<typeof TransferFamilyEventResultSchema>;

/** Schema for a Storage Gateway cache monitor result. */
export const StorageGatewayCacheMonitorResultSchema = z.object({
  gatewayArn: z.string(),
  cacheHitPercent: z.number(),
  cacheMissPercent: z.number(),
  cacheUsedPercent: z.number(),
  alertSent: z.boolean(),
});

/** Storage Gateway cache monitor result. */
export type StorageGatewayCacheMonitorResult = z.infer<typeof StorageGatewayCacheMonitorResultSchema>;

/** Schema for a Lightsail snapshot to S3 result. */
export const LightsailSnapshotToS3ResultSchema = z.object({
  instanceName: z.string(),
  snapshotName: z.string(),
  s3Bucket: z.string(),
  s3Key: z.string(),
  success: z.boolean(),
});

/** Lightsail snapshot to S3 result. */
export type LightsailSnapshotToS3Result = z.infer<typeof LightsailSnapshotToS3ResultSchema>;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Sync files from an EFS file system to an S3 bucket using DataSync or Lambda. */
export async function efsToS3Sync(
  fileSystemId: string,
  mountPath: string,
  destinationBucket: string,
  destinationPrefix: string,
  deleteOrphans?: boolean,
  region?: string,
): Promise<EfsToS3SyncResult> {
  const client = getClient(EFSClient, region);
  try {
    // TODO: implement efsToS3Sync
    throw new Error("efsToS3Sync not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "efsToS3Sync failed");
  }
}

/** Create an FSx backup and export metadata to S3 for long-term archival. */
export async function fsxBackupToS3(
  fileSystemId: string,
  s3Bucket: string,
  s3Prefix?: string,
  tags?: Record<string, string>,
  region?: string,
): Promise<FsxBackupToS3Result> {
  const client = getClient(FSxClient, region);
  try {
    // TODO: implement fsxBackupToS3
    throw new Error("fsxBackupToS3 not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "fsxBackupToS3 failed");
  }
}

/** Process AWS Transfer Family workflow events and route files to downstream services. */
export async function transferFamilyEventProcessor(
  serverId: string,
  eventPayload: Record<string, unknown>,
  destinationBucket?: string,
  notificationTopicArn?: string,
  region?: string,
): Promise<TransferFamilyEventResult> {
  const client = getClient(TransferClient, region);
  try {
    // TODO: implement transferFamilyEventProcessor
    throw new Error("transferFamilyEventProcessor not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "transferFamilyEventProcessor failed");
  }
}

/** Monitor Storage Gateway cache usage and send SNS alerts on threshold breach. */
export async function storageGatewayCacheMonitor(
  gatewayArn: string,
  cacheUsageThreshold: number,
  cacheHitThreshold: number,
  snsTopicArn?: string,
  region?: string,
): Promise<StorageGatewayCacheMonitorResult> {
  const client = getClient(StorageGatewayClient, region);
  try {
    // TODO: implement storageGatewayCacheMonitor
    throw new Error("storageGatewayCacheMonitor not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "storageGatewayCacheMonitor failed");
  }
}

/** Create a Lightsail instance snapshot and export its metadata to S3. */
export async function lightsailSnapshotToS3(
  instanceName: string,
  snapshotName: string,
  s3Bucket: string,
  s3Prefix?: string,
  region?: string,
): Promise<LightsailSnapshotToS3Result> {
  const client = getClient(LightsailClient, region);
  try {
    // TODO: implement lightsailSnapshotToS3
    throw new Error("lightsailSnapshotToS3 not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "lightsailSnapshotToS3 failed");
  }
}
