/**
 * aws-util/media-processing — Multi-service media processing utilities.
 *
 * Provides typed helpers for IVS stream recording archival and
 * MediaConvert job orchestration.
 *
 * @module
 */

import { z } from "zod";
import { IvsClient } from "@aws-sdk/client-ivs";
import { MediaConvertClient } from "@aws-sdk/client-mediaconvert";
import { getClient } from "./client.js";
import { wrapAwsError } from "./exceptions.js";

// ---------------------------------------------------------------------------
// Zod schemas & inferred types
// ---------------------------------------------------------------------------

/** Schema for an IVS stream recording archiver result. */
export const IvsRecordingArchiverResultSchema = z.object({
  channelArn: z.string(),
  recordingConfigArn: z.string(),
  destinationBucket: z.string(),
  destinationPrefix: z.string(),
  configured: z.boolean(),
});

/** IVS stream recording archiver result. */
export type IvsRecordingArchiverResult = z.infer<typeof IvsRecordingArchiverResultSchema>;

/** Schema for a MediaConvert job orchestrator result. */
export const MediaConvertJobResultSchema = z.object({
  jobId: z.string(),
  jobArn: z.string(),
  status: z.string(),
  inputKey: z.string(),
  outputBucket: z.string(),
});

/** MediaConvert job orchestrator result. */
export type MediaConvertJobResult = z.infer<typeof MediaConvertJobResultSchema>;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Configure IVS channel recording and archive streams to an S3 bucket. */
export async function ivsStreamRecordingArchiver(
  channelArn: string,
  destinationBucket: string,
  destinationPrefix: string,
  recordingMode?: "DISABLED" | "INTERVAL",
  targetIntervalSeconds?: number,
  region?: string,
): Promise<IvsRecordingArchiverResult> {
  const client = getClient(IvsClient, region);
  try {
    // TODO: implement ivsStreamRecordingArchiver
    throw new Error("ivsStreamRecordingArchiver not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "ivsStreamRecordingArchiver failed");
  }
}

/** Submit and monitor an AWS Elemental MediaConvert transcoding job. */
export async function mediaconvertJobOrchestrator(
  inputBucket: string,
  inputKey: string,
  outputBucket: string,
  outputPrefix: string,
  roleArn: string,
  jobTemplate?: string,
  outputFormats?: string[],
  region?: string,
): Promise<MediaConvertJobResult> {
  const client = getClient(MediaConvertClient, region);
  try {
    // TODO: implement mediaconvertJobOrchestrator
    throw new Error("mediaconvertJobOrchestrator not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "mediaconvertJobOrchestrator failed");
  }
}
