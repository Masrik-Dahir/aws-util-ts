import { SagemakerFeaturestoreRuntimeClient } from "@aws-sdk/client-sagemaker-featurestore-runtime";
import { getClient } from "./client";
import { wrapAwsError } from "./exceptions";

/** A single feature record from SageMaker Feature Store. */
export type FeatureRecord = {
  featureGroupName?: string;
  recordIdentifierValue?: string;
  features?: Record<string, unknown>[];
};

/** Result of a batch-get-record call. */
export type BatchGetRecordResult = {
  records?: FeatureRecord[];
  errors?: Record<string, unknown>[];
  unprocessedIdentifiers?: Record<string, unknown>[];
};

/** Write a record to a SageMaker Feature Store feature group. */
export async function putRecord(featureGroupName: string, record: Record<string, unknown>[], targetStores?: string[], regionName?: string): Promise<void> {
  try {
    // TODO: implement put_record
    throw new Error("put_record not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_record failed");
  }
}

/** Read a record from a SageMaker Feature Store feature group. */
export async function getRecord(featureGroupName: string, recordIdentifierValue: string, featureNames?: string[], regionName?: string): Promise<FeatureRecord> {
  try {
    // TODO: implement get_record
    throw new Error("get_record not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_record failed");
  }
}

/** Delete a record from a SageMaker Feature Store feature group. */
export async function deleteRecord(featureGroupName: string, recordIdentifierValue: string, eventTime: string, targetStores?: string[], regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_record
    throw new Error("delete_record not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_record failed");
  }
}

/** Batch-retrieve records from one or more feature groups. */
export async function batchGetRecord(identifiers: Record<string, unknown>[], regionName?: string): Promise<BatchGetRecordResult> {
  try {
    // TODO: implement batch_get_record
    throw new Error("batch_get_record not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_get_record failed");
  }
}
