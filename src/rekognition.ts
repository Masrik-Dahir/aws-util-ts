/**
 * aws-util/rekognition — High-level Amazon Rekognition utilities.
 *
 * Provides typed helpers for image analysis: label detection, face detection,
 * text detection (OCR), face comparison, content moderation, and face
 * collection management (create, delete, index, search).
 *
 * @example
 * ```ts
 * import { detectLabels, detectFaces, compareFaces } from "./rekognition.js";
 *
 * const labels = await detectLabels({ s3Bucket: "photos", s3Key: "cat.jpg" });
 * ```
 *
 * @module
 */

import { z } from "zod";
import {
  RekognitionClient,
  DetectLabelsCommand,
  DetectFacesCommand,
  DetectTextCommand,
  CompareFacesCommand,
  DetectModerationLabelsCommand,
  CreateCollectionCommand,
  DeleteCollectionCommand,
  DescribeCollectionCommand,
  IndexFacesCommand,
  SearchFacesByImageCommand,
} from "@aws-sdk/client-rekognition";
import { getClient } from "./client.js";
import {
  wrapAwsError,
  AwsServiceError,
} from "./exceptions.js";

// ---------------------------------------------------------------------------
// Zod schemas
// ---------------------------------------------------------------------------

/** Schema for a normalised bounding box (values 0.0--1.0). */
export const BoundingBoxSchema = z.object({
  width: z.number(),
  height: z.number(),
  left: z.number(),
  top: z.number(),
});

/** A normalised bounding box. */
export type BoundingBox = z.infer<typeof BoundingBoxSchema>;

/** Schema for an object/scene label detected in an image. */
export const RekognitionLabelSchema = z.object({
  name: z.string(),
  confidence: z.number(),
  parents: z.array(z.string()).optional(),
  instances: z
    .array(z.object({ boundingBox: BoundingBoxSchema.optional() }))
    .optional(),
});

/** An object/scene label detected in an image. */
export type RekognitionLabel = z.infer<typeof RekognitionLabelSchema>;

/** Schema for a face detected in an image. */
export const RekognitionFaceSchema = z.object({
  boundingBox: BoundingBoxSchema.optional(),
  confidence: z.number(),
  landmarks: z
    .array(
      z.object({
        type: z.string().optional(),
        x: z.number().optional(),
        y: z.number().optional(),
      }),
    )
    .optional(),
  emotions: z
    .array(
      z.object({
        type: z.string().optional(),
        confidence: z.number().optional(),
      }),
    )
    .optional(),
});

/** A face detected in an image. */
export type RekognitionFace = z.infer<typeof RekognitionFaceSchema>;

/** Schema for a text detection result (OCR). */
export const RekognitionTextSchema = z.object({
  detectedText: z.string(),
  type: z.string(),
  confidence: z.number(),
  id: z.number().optional(),
});

/** A text detection result from OCR. */
export type RekognitionText = z.infer<typeof RekognitionTextSchema>;

/** Schema for a face match result from comparison or search. */
export const FaceMatchSchema = z.object({
  similarity: z.number(),
  face: z.object({
    faceId: z.string().optional(),
    boundingBox: BoundingBoxSchema.optional(),
    confidence: z.number().optional(),
  }),
});

/** A face match result. */
export type FaceMatch = z.infer<typeof FaceMatchSchema>;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Image input: either an S3 reference or raw bytes. */
export type ImageInput =
  | { s3Bucket: string; s3Key: string }
  | { bytes: Uint8Array };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Get a cached RekognitionClient for the given region.
 */
function rek(region?: string): RekognitionClient {
  return getClient(RekognitionClient, region);
}

/**
 * Convert an {@link ImageInput} to the Rekognition Image structure.
 */
function toImage(image: ImageInput): Record<string, unknown> {
  if ("bytes" in image) {
    return { Bytes: image.bytes };
  }
  return { S3Object: { Bucket: image.s3Bucket, Name: image.s3Key } };
}

/**
 * Parse an SDK bounding box into our schema.
 */
function parseBBox(
  bb?: {
    Width?: number;
    Height?: number;
    Left?: number;
    Top?: number;
  },
): BoundingBox | undefined {
  if (!bb) return undefined;
  return BoundingBoxSchema.parse({
    width: bb.Width ?? 0,
    height: bb.Height ?? 0,
    left: bb.Left ?? 0,
    top: bb.Top ?? 0,
  });
}

// ---------------------------------------------------------------------------
// Public API — detection
// ---------------------------------------------------------------------------

/**
 * Detect objects, scenes, and concepts in an image.
 *
 * @param image - Image input (S3 reference or raw bytes).
 * @param maxLabels - Maximum number of labels to return (default `20`).
 * @param minConfidence - Minimum confidence threshold 0--100 (default `70`).
 * @param region - AWS region override.
 * @returns A list of {@link RekognitionLabel} objects sorted by confidence.
 */
export async function detectLabels(
  image: ImageInput,
  maxLabels: number = 20,
  minConfidence: number = 70,
  region?: string,
): Promise<RekognitionLabel[]> {
  try {
    const resp = await rek(region).send(
      new DetectLabelsCommand({
        Image: toImage(image),
        MaxLabels: maxLabels,
        MinConfidence: minConfidence,
      }),
    );

    return (resp.Labels ?? []).map((lbl) =>
      RekognitionLabelSchema.parse({
        name: lbl.Name ?? "",
        confidence: lbl.Confidence ?? 0,
        parents: (lbl.Parents ?? []).map((p) => p.Name ?? ""),
        instances: (lbl.Instances ?? []).map((inst) => ({
          boundingBox: parseBBox(inst.BoundingBox),
        })),
      }),
    );
  } catch (err: unknown) {
    throw wrapAwsError(err, "detectLabels");
  }
}

/**
 * Detect faces and facial attributes in an image.
 *
 * @param image - Image input (S3 reference or raw bytes).
 * @param attributes - Facial attributes to return. `["ALL"]` returns every
 *   attribute. Defaults to `["DEFAULT"]`.
 * @param region - AWS region override.
 * @returns A list of {@link RekognitionFace} objects.
 */
export async function detectFaces(
  image: ImageInput,
  attributes: string[] = ["DEFAULT"],
  region?: string,
): Promise<RekognitionFace[]> {
  try {
    const resp = await rek(region).send(
      new DetectFacesCommand({
        Image: toImage(image),
        Attributes: attributes,
      }),
    );

    return (resp.FaceDetails ?? []).map((fd) =>
      RekognitionFaceSchema.parse({
        boundingBox: parseBBox(fd.BoundingBox),
        confidence: fd.Confidence ?? 0,
        landmarks: (fd.Landmarks ?? []).map((lm) => ({
          type: lm.Type,
          x: lm.X,
          y: lm.Y,
        })),
        emotions: (fd.Emotions ?? []).map((em) => ({
          type: em.Type,
          confidence: em.Confidence,
        })),
      }),
    );
  } catch (err: unknown) {
    throw wrapAwsError(err, "detectFaces");
  }
}

/**
 * Detect text (OCR) in an image.
 *
 * @param image - Image input (S3 reference or raw bytes).
 * @param region - AWS region override.
 * @returns A list of {@link RekognitionText} detections.
 */
export async function detectText(
  image: ImageInput,
  region?: string,
): Promise<RekognitionText[]> {
  try {
    const resp = await rek(region).send(
      new DetectTextCommand({
        Image: toImage(image),
      }),
    );

    return (resp.TextDetections ?? []).map((td) =>
      RekognitionTextSchema.parse({
        detectedText: td.DetectedText ?? "",
        type: td.Type ?? "",
        confidence: td.Confidence ?? 0,
        id: td.Id,
      }),
    );
  } catch (err: unknown) {
    throw wrapAwsError(err, "detectText");
  }
}

/**
 * Compare a source face against faces in a target image.
 *
 * @param sourceImage - Image containing the source face.
 * @param targetImage - Image to search for matching faces.
 * @param similarityThreshold - Minimum similarity score 0--100 (default `80`).
 * @param region - AWS region override.
 * @returns A list of {@link FaceMatch} objects for faces meeting the threshold.
 */
export async function compareFaces(
  sourceImage: ImageInput,
  targetImage: ImageInput,
  similarityThreshold: number = 80,
  region?: string,
): Promise<FaceMatch[]> {
  try {
    const resp = await rek(region).send(
      new CompareFacesCommand({
        SourceImage: toImage(sourceImage),
        TargetImage: toImage(targetImage),
        SimilarityThreshold: similarityThreshold,
      }),
    );

    return (resp.FaceMatches ?? []).map((fm) =>
      FaceMatchSchema.parse({
        similarity: fm.Similarity ?? 0,
        face: {
          faceId: fm.Face?.FaceId,
          boundingBox: parseBBox(fm.Face?.BoundingBox),
          confidence: fm.Face?.Confidence,
        },
      }),
    );
  } catch (err: unknown) {
    throw wrapAwsError(err, "compareFaces");
  }
}

/**
 * Detect unsafe or inappropriate content in an image.
 *
 * @param image - Image input (S3 reference or raw bytes).
 * @param minConfidence - Minimum confidence threshold (default `60`).
 * @param region - AWS region override.
 * @returns A list of moderation labels with name, confidence, and optional parent.
 */
export async function detectModerationLabels(
  image: ImageInput,
  minConfidence: number = 60,
  region?: string,
): Promise<Array<{ name: string; confidence: number; parentName?: string }>> {
  try {
    const resp = await rek(region).send(
      new DetectModerationLabelsCommand({
        Image: toImage(image),
        MinConfidence: minConfidence,
      }),
    );

    return (resp.ModerationLabels ?? []).map((lbl) => ({
      name: lbl.Name ?? "",
      confidence: lbl.Confidence ?? 0,
      parentName: lbl.ParentName || undefined,
    }));
  } catch (err: unknown) {
    throw wrapAwsError(err, "detectModerationLabels");
  }
}

// ---------------------------------------------------------------------------
// Public API — collections
// ---------------------------------------------------------------------------

/**
 * Create a Rekognition face collection.
 *
 * @param collectionId - Unique identifier for the new collection.
 * @param region - AWS region override.
 * @returns The ARN of the created collection.
 */
export async function createCollection(
  collectionId: string,
  region?: string,
): Promise<string> {
  try {
    const resp = await rek(region).send(
      new CreateCollectionCommand({ CollectionId: collectionId }),
    );
    return resp.CollectionArn ?? "";
  } catch (err: unknown) {
    throw wrapAwsError(err, `createCollection(${collectionId})`);
  }
}

/**
 * Delete a Rekognition face collection and all indexed faces.
 *
 * @param collectionId - Collection to delete.
 * @param region - AWS region override.
 */
export async function deleteCollection(
  collectionId: string,
  region?: string,
): Promise<void> {
  try {
    await rek(region).send(
      new DeleteCollectionCommand({ CollectionId: collectionId }),
    );
  } catch (err: unknown) {
    throw wrapAwsError(err, `deleteCollection(${collectionId})`);
  }
}

/**
 * Get or create a Rekognition face collection (idempotent).
 *
 * If the collection already exists its ARN is returned unchanged. If it does
 * not exist it is created.
 *
 * @param collectionId - Unique identifier for the collection.
 * @param region - AWS region override.
 * @returns The collection ARN.
 */
export async function ensureCollection(
  collectionId: string,
  region?: string,
): Promise<string> {
  try {
    const resp = await rek(region).send(
      new DescribeCollectionCommand({ CollectionId: collectionId }),
    );
    return resp.CollectionARN ?? "";
  } catch (err: unknown) {
    // If not found, create it
    const rec = err as Record<string, unknown>;
    const code =
      typeof rec["name"] === "string"
        ? rec["name"]
        : typeof rec["Code"] === "string"
          ? rec["Code"]
          : "";
    if (code === "ResourceNotFoundException") {
      return createCollection(collectionId, region);
    }
    throw wrapAwsError(err, `ensureCollection(${collectionId})`);
  }
}

/**
 * Detect and index a face from an image into a Rekognition collection.
 *
 * @param collectionId - Collection to index the face into.
 * @param image - Image input (S3 reference or raw bytes).
 * @param externalImageId - Optional label to associate with the face
 *   (e.g., a user ID).
 * @param region - AWS region override.
 * @returns The face ID and bounding box of the indexed face.
 */
export async function indexFace(
  collectionId: string,
  image: ImageInput,
  externalImageId?: string,
  region?: string,
): Promise<{ faceId: string; boundingBox?: BoundingBox }> {
  try {
    const resp = await rek(region).send(
      new IndexFacesCommand({
        CollectionId: collectionId,
        Image: toImage(image),
        MaxFaces: 1,
        QualityFilter: "AUTO",
        DetectionAttributes: ["DEFAULT"],
        ExternalImageId: externalImageId,
      }),
    );

    const records = resp.FaceRecords ?? [];
    if (records.length === 0) {
      throw new AwsServiceError(
        "No face detected in the provided image",
      );
    }

    const face = records[0].Face!;
    return {
      faceId: face.FaceId ?? "",
      boundingBox: parseBBox(face.BoundingBox),
    };
  } catch (err: unknown) {
    throw wrapAwsError(
      err,
      `indexFace(${collectionId})`,
    );
  }
}

/**
 * Search a Rekognition collection for faces matching the face in an image.
 *
 * @param collectionId - Collection to search.
 * @param image - Image containing a query face.
 * @param maxFaces - Maximum number of matching faces to return (default `5`).
 * @param threshold - Minimum similarity score 0--100 (default `80`).
 * @param region - AWS region override.
 * @returns A list of {@link FaceMatch} objects.
 */
export async function searchFaceByImage(
  collectionId: string,
  image: ImageInput,
  maxFaces: number = 5,
  threshold: number = 80,
  region?: string,
): Promise<FaceMatch[]> {
  try {
    const resp = await rek(region).send(
      new SearchFacesByImageCommand({
        CollectionId: collectionId,
        Image: toImage(image),
        MaxFaces: maxFaces,
        FaceMatchThreshold: threshold,
      }),
    );

    return (resp.FaceMatches ?? []).map((fm) =>
      FaceMatchSchema.parse({
        similarity: fm.Similarity ?? 0,
        face: {
          faceId: fm.Face?.FaceId,
          boundingBox: parseBBox(fm.Face?.BoundingBox),
          confidence: fm.Face?.Confidence,
        },
      }),
    );
  } catch (err: unknown) {
    throw wrapAwsError(
      err,
      `searchFaceByImage(${collectionId})`,
    );
  }
}

// ---------------------------------------------------------------------------
// Additional types (auto-generated)
// ---------------------------------------------------------------------------

/** Result of associate_faces. */
export type AssociateFacesResult = {
  associatedFaces?: Record<string, unknown>[];
  unsuccessfulFaceAssociations?: Record<string, unknown>[];
  userStatus?: string | undefined;
};

/** Result of copy_project_version. */
export type CopyProjectVersionResult = {
  projectVersionArn?: string | undefined;
};

/** Result of create_dataset. */
export type CreateDatasetResult = {
  datasetArn?: string | undefined;
};

/** Result of create_face_liveness_session. */
export type CreateFaceLivenessSessionResult = {
  sessionId?: string | undefined;
};

/** Result of create_project. */
export type CreateProjectResult = {
  projectArn?: string | undefined;
};

/** Result of create_project_version. */
export type CreateProjectVersionResult = {
  projectVersionArn?: string | undefined;
};

/** Result of create_stream_processor. */
export type CreateStreamProcessorResult = {
  streamProcessorArn?: string | undefined;
};

/** Result of delete_faces. */
export type DeleteFacesResult = {
  deletedFaces?: string[];
  unsuccessfulFaceDeletions?: Record<string, unknown>[];
};

/** Result of delete_project. */
export type DeleteProjectResult = {
  status?: string | undefined;
};

/** Result of delete_project_version. */
export type DeleteProjectVersionResult = {
  status?: string | undefined;
};

/** Result of describe_collection. */
export type DescribeCollectionResult = {
  faceCount?: number | undefined;
  faceModelVersion?: string | undefined;
  collectionArn?: string | undefined;
  creationTimestamp?: string | undefined;
  userCount?: number | undefined;
};

/** Result of describe_dataset. */
export type DescribeDatasetResult = {
  datasetDescription?: Record<string, unknown>;
};

/** Result of describe_project_versions. */
export type DescribeProjectVersionsResult = {
  projectVersionDescriptions?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_projects. */
export type DescribeProjectsResult = {
  projectDescriptions?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_stream_processor. */
export type DescribeStreamProcessorResult = {
  name?: string | undefined;
  streamProcessorArn?: string | undefined;
  status?: string | undefined;
  statusMessage?: string | undefined;
  creationTimestamp?: string | undefined;
  lastUpdateTimestamp?: string | undefined;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  roleArn?: string | undefined;
  settings?: Record<string, unknown>;
  notificationChannel?: Record<string, unknown>;
  kmsKeyId?: string | undefined;
  regionsOfInterest?: Record<string, unknown>[];
  dataSharingPreference?: Record<string, unknown>;
};

/** Result of detect_custom_labels. */
export type DetectCustomLabelsResult = {
  customLabels?: Record<string, unknown>[];
};

/** Result of detect_protective_equipment. */
export type DetectProtectiveEquipmentResult = {
  protectiveEquipmentModelVersion?: string | undefined;
  persons?: Record<string, unknown>[];
  summary?: Record<string, unknown>;
};

/** Result of disassociate_faces. */
export type DisassociateFacesResult = {
  disassociatedFaces?: Record<string, unknown>[];
  unsuccessfulFaceDisassociations?: Record<string, unknown>[];
  userStatus?: string | undefined;
};

/** Result of get_celebrity_info. */
export type GetCelebrityInfoResult = {
  urls?: string[];
  name?: string | undefined;
  knownGender?: Record<string, unknown>;
};

/** Result of get_celebrity_recognition. */
export type GetCelebrityRecognitionResult = {
  jobStatus?: string | undefined;
  statusMessage?: string | undefined;
  videoMetadata?: Record<string, unknown>;
  nextToken?: string | undefined;
  celebrities?: Record<string, unknown>[];
  jobId?: string | undefined;
  video?: Record<string, unknown>;
  jobTag?: string | undefined;
};

/** Result of get_content_moderation. */
export type GetContentModerationResult = {
  jobStatus?: string | undefined;
  statusMessage?: string | undefined;
  videoMetadata?: Record<string, unknown>;
  moderationLabels?: Record<string, unknown>[];
  nextToken?: string | undefined;
  moderationModelVersion?: string | undefined;
  jobId?: string | undefined;
  video?: Record<string, unknown>;
  jobTag?: string | undefined;
  getRequestMetadata?: Record<string, unknown>;
};

/** Result of get_face_detection. */
export type GetFaceDetectionResult = {
  jobStatus?: string | undefined;
  statusMessage?: string | undefined;
  videoMetadata?: Record<string, unknown>;
  nextToken?: string | undefined;
  faces?: Record<string, unknown>[];
  jobId?: string | undefined;
  video?: Record<string, unknown>;
  jobTag?: string | undefined;
};

/** Result of get_face_liveness_session_results. */
export type GetFaceLivenessSessionResultsResult = {
  sessionId?: string | undefined;
  status?: string | undefined;
  confidence?: number | undefined;
  referenceImage?: Record<string, unknown>;
  auditImages?: Record<string, unknown>[];
  challenge?: Record<string, unknown>;
};

/** Result of get_face_search. */
export type GetFaceSearchResult = {
  jobStatus?: string | undefined;
  statusMessage?: string | undefined;
  nextToken?: string | undefined;
  videoMetadata?: Record<string, unknown>;
  persons?: Record<string, unknown>[];
  jobId?: string | undefined;
  video?: Record<string, unknown>;
  jobTag?: string | undefined;
};

/** Result of get_label_detection. */
export type GetLabelDetectionResult = {
  jobStatus?: string | undefined;
  statusMessage?: string | undefined;
  videoMetadata?: Record<string, unknown>;
  nextToken?: string | undefined;
  labels?: Record<string, unknown>[];
  labelModelVersion?: string | undefined;
  jobId?: string | undefined;
  video?: Record<string, unknown>;
  jobTag?: string | undefined;
  getRequestMetadata?: Record<string, unknown>;
};

/** Result of get_media_analysis_job. */
export type GetMediaAnalysisJobResult = {
  jobId?: string | undefined;
  jobName?: string | undefined;
  operationsConfig?: Record<string, unknown>;
  status?: string | undefined;
  failureDetails?: Record<string, unknown>;
  creationTimestamp?: string | undefined;
  completionTimestamp?: string | undefined;
  input?: Record<string, unknown>;
  outputConfig?: Record<string, unknown>;
  kmsKeyId?: string | undefined;
  results?: Record<string, unknown>;
  manifestSummary?: Record<string, unknown>;
};

/** Result of get_person_tracking. */
export type GetPersonTrackingResult = {
  jobStatus?: string | undefined;
  statusMessage?: string | undefined;
  videoMetadata?: Record<string, unknown>;
  nextToken?: string | undefined;
  persons?: Record<string, unknown>[];
  jobId?: string | undefined;
  video?: Record<string, unknown>;
  jobTag?: string | undefined;
};

/** Result of get_segment_detection. */
export type GetSegmentDetectionResult = {
  jobStatus?: string | undefined;
  statusMessage?: string | undefined;
  videoMetadata?: Record<string, unknown>[];
  audioMetadata?: Record<string, unknown>[];
  nextToken?: string | undefined;
  segments?: Record<string, unknown>[];
  selectedSegmentTypes?: Record<string, unknown>[];
  jobId?: string | undefined;
  video?: Record<string, unknown>;
  jobTag?: string | undefined;
};

/** Result of get_text_detection. */
export type GetTextDetectionResult = {
  jobStatus?: string | undefined;
  statusMessage?: string | undefined;
  videoMetadata?: Record<string, unknown>;
  textDetections?: Record<string, unknown>[];
  nextToken?: string | undefined;
  textModelVersion?: string | undefined;
  jobId?: string | undefined;
  video?: Record<string, unknown>;
  jobTag?: string | undefined;
};

/** Result of index_faces. */
export type IndexFacesResult = {
  faceRecords?: Record<string, unknown>[];
  orientationCorrection?: string | undefined;
  faceModelVersion?: string | undefined;
  unindexedFaces?: Record<string, unknown>[];
};

/** Result of list_collections. */
export type ListCollectionsResult = {
  collectionIds?: string[];
  nextToken?: string | undefined;
  faceModelVersions?: string[];
};

/** Result of list_dataset_entries. */
export type ListDatasetEntriesResult = {
  datasetEntries?: string[];
  nextToken?: string | undefined;
};

/** Result of list_dataset_labels. */
export type ListDatasetLabelsResult = {
  datasetLabelDescriptions?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_faces. */
export type ListFacesResult = {
  faces?: Record<string, unknown>[];
  nextToken?: string | undefined;
  faceModelVersion?: string | undefined;
};

/** Result of list_media_analysis_jobs. */
export type ListMediaAnalysisJobsResult = {
  nextToken?: string | undefined;
  mediaAnalysisJobs?: Record<string, unknown>[];
};

/** Result of list_project_policies. */
export type ListProjectPoliciesResult = {
  projectPolicies?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_stream_processors. */
export type ListStreamProcessorsResult = {
  nextToken?: string | undefined;
  streamProcessors?: Record<string, unknown>[];
};

/** Result of list_tags_for_resource. */
export type ListTagsForResourceResult = {
  tags?: Record<string, unknown>;
};

/** Result of list_users. */
export type ListUsersResult = {
  users?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of put_project_policy. */
export type PutProjectPolicyResult = {
  policyRevisionId?: string | undefined;
};

/** Result of recognize_celebrities. */
export type RecognizeCelebritiesResult = {
  celebrityFaces?: Record<string, unknown>[];
  unrecognizedFaces?: Record<string, unknown>[];
  orientationCorrection?: string | undefined;
};

/** Result of search_faces. */
export type SearchFacesResult = {
  searchedFaceId?: string | undefined;
  faceMatches?: Record<string, unknown>[];
  faceModelVersion?: string | undefined;
};

/** Result of search_faces_by_image. */
export type SearchFacesByImageResult = {
  searchedFaceBoundingBox?: Record<string, unknown>;
  searchedFaceConfidence?: number | undefined;
  faceMatches?: Record<string, unknown>[];
  faceModelVersion?: string | undefined;
};

/** Result of search_users. */
export type SearchUsersResult = {
  userMatches?: Record<string, unknown>[];
  faceModelVersion?: string | undefined;
  searchedFace?: Record<string, unknown>;
  searchedUser?: Record<string, unknown>;
};

/** Result of search_users_by_image. */
export type SearchUsersByImageResult = {
  userMatches?: Record<string, unknown>[];
  faceModelVersion?: string | undefined;
  searchedFace?: Record<string, unknown>;
  unsearchedFaces?: Record<string, unknown>[];
};

/** Result of start_celebrity_recognition. */
export type StartCelebrityRecognitionResult = {
  jobId?: string | undefined;
};

/** Result of start_content_moderation. */
export type StartContentModerationResult = {
  jobId?: string | undefined;
};

/** Result of start_face_detection. */
export type StartFaceDetectionResult = {
  jobId?: string | undefined;
};

/** Result of start_face_search. */
export type StartFaceSearchResult = {
  jobId?: string | undefined;
};

/** Result of start_label_detection. */
export type StartLabelDetectionResult = {
  jobId?: string | undefined;
};

/** Result of start_media_analysis_job. */
export type StartMediaAnalysisJobResult = {
  jobId?: string | undefined;
};

/** Result of start_person_tracking. */
export type StartPersonTrackingResult = {
  jobId?: string | undefined;
};

/** Result of start_project_version. */
export type StartProjectVersionResult = {
  status?: string | undefined;
};

/** Result of start_segment_detection. */
export type StartSegmentDetectionResult = {
  jobId?: string | undefined;
};

/** Result of start_stream_processor. */
export type StartStreamProcessorResult = {
  sessionId?: string | undefined;
};

/** Result of start_text_detection. */
export type StartTextDetectionResult = {
  jobId?: string | undefined;
};

/** Result of stop_project_version. */
export type StopProjectVersionResult = {
  status?: string | undefined;
};


// ---------------------------------------------------------------------------
// Additional functions (auto-generated)
// ---------------------------------------------------------------------------

/** Associate faces. */
export async function associateFaces(collectionId: string, userId: string, faceIds: string[]): Promise<AssociateFacesResult> {
  try {
    // TODO: implement associate_faces
    throw new Error("associate_faces not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "associate_faces failed");
  }
}

/** Copy project version. */
export async function copyProjectVersion(sourceProjectArn: string, sourceProjectVersionArn: string, destinationProjectArn: string, versionName: string, outputConfig: Record<string, unknown>): Promise<CopyProjectVersionResult> {
  try {
    // TODO: implement copy_project_version
    throw new Error("copy_project_version not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "copy_project_version failed");
  }
}

/** Create dataset. */
export async function createDataset(datasetType: string, projectArn: string): Promise<CreateDatasetResult> {
  try {
    // TODO: implement create_dataset
    throw new Error("create_dataset not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_dataset failed");
  }
}

/** Create face liveness session. */
export async function createFaceLivenessSession(): Promise<CreateFaceLivenessSessionResult> {
  try {
    // TODO: implement create_face_liveness_session
    throw new Error("create_face_liveness_session not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_face_liveness_session failed");
  }
}

/** Create project. */
export async function createProject(projectName: string): Promise<CreateProjectResult> {
  try {
    // TODO: implement create_project
    throw new Error("create_project not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_project failed");
  }
}

/** Create project version. */
export async function createProjectVersion(projectArn: string, versionName: string, outputConfig: Record<string, unknown>): Promise<CreateProjectVersionResult> {
  try {
    // TODO: implement create_project_version
    throw new Error("create_project_version not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_project_version failed");
  }
}

/** Create stream processor. */
export async function createStreamProcessor(input: Record<string, unknown>, output: Record<string, unknown>, name: string, settings: Record<string, unknown>, roleArn: string): Promise<CreateStreamProcessorResult> {
  try {
    // TODO: implement create_stream_processor
    throw new Error("create_stream_processor not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_stream_processor failed");
  }
}

/** Create user. */
export async function createUser(collectionId: string, userId: string): Promise<void> {
  try {
    // TODO: implement create_user
    throw new Error("create_user not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_user failed");
  }
}

/** Delete dataset. */
export async function deleteDataset(datasetArn: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_dataset
    throw new Error("delete_dataset not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_dataset failed");
  }
}

/** Delete faces. */
export async function deleteFaces(collectionId: string, faceIds: string[], regionName?: string | undefined): Promise<DeleteFacesResult> {
  try {
    // TODO: implement delete_faces
    throw new Error("delete_faces not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_faces failed");
  }
}

/** Delete project. */
export async function deleteProject(projectArn: string, regionName?: string | undefined): Promise<DeleteProjectResult> {
  try {
    // TODO: implement delete_project
    throw new Error("delete_project not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_project failed");
  }
}

/** Delete project policy. */
export async function deleteProjectPolicy(projectArn: string, policyName: string): Promise<void> {
  try {
    // TODO: implement delete_project_policy
    throw new Error("delete_project_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_project_policy failed");
  }
}

/** Delete project version. */
export async function deleteProjectVersion(projectVersionArn: string, regionName?: string | undefined): Promise<DeleteProjectVersionResult> {
  try {
    // TODO: implement delete_project_version
    throw new Error("delete_project_version not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_project_version failed");
  }
}

/** Delete stream processor. */
export async function deleteStreamProcessor(name: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_stream_processor
    throw new Error("delete_stream_processor not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_stream_processor failed");
  }
}

/** Delete user. */
export async function deleteUser(collectionId: string, userId: string): Promise<void> {
  try {
    // TODO: implement delete_user
    throw new Error("delete_user not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_user failed");
  }
}

/** Describe collection. */
export async function describeCollection(collectionId: string, regionName?: string | undefined): Promise<DescribeCollectionResult> {
  try {
    // TODO: implement describe_collection
    throw new Error("describe_collection not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_collection failed");
  }
}

/** Describe dataset. */
export async function describeDataset(datasetArn: string, regionName?: string | undefined): Promise<DescribeDatasetResult> {
  try {
    // TODO: implement describe_dataset
    throw new Error("describe_dataset not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_dataset failed");
  }
}

/** Describe project versions. */
export async function describeProjectVersions(projectArn: string): Promise<DescribeProjectVersionsResult> {
  try {
    // TODO: implement describe_project_versions
    throw new Error("describe_project_versions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_project_versions failed");
  }
}

/** Describe projects. */
export async function describeProjects(): Promise<DescribeProjectsResult> {
  try {
    // TODO: implement describe_projects
    throw new Error("describe_projects not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_projects failed");
  }
}

/** Describe stream processor. */
export async function describeStreamProcessor(name: string, regionName?: string | undefined): Promise<DescribeStreamProcessorResult> {
  try {
    // TODO: implement describe_stream_processor
    throw new Error("describe_stream_processor not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_stream_processor failed");
  }
}

/** Detect custom labels. */
export async function detectCustomLabels(projectVersionArn: string, image: Record<string, unknown>): Promise<DetectCustomLabelsResult> {
  try {
    // TODO: implement detect_custom_labels
    throw new Error("detect_custom_labels not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "detect_custom_labels failed");
  }
}

/** Detect protective equipment. */
export async function detectProtectiveEquipment(image: Record<string, unknown>): Promise<DetectProtectiveEquipmentResult> {
  try {
    // TODO: implement detect_protective_equipment
    throw new Error("detect_protective_equipment not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "detect_protective_equipment failed");
  }
}

/** Disassociate faces. */
export async function disassociateFaces(collectionId: string, userId: string, faceIds: string[]): Promise<DisassociateFacesResult> {
  try {
    // TODO: implement disassociate_faces
    throw new Error("disassociate_faces not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disassociate_faces failed");
  }
}

/** Distribute dataset entries. */
export async function distributeDatasetEntries(datasets: Record<string, unknown>[], regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement distribute_dataset_entries
    throw new Error("distribute_dataset_entries not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "distribute_dataset_entries failed");
  }
}

/** Get celebrity info. */
export async function getCelebrityInfo(id: string, regionName?: string | undefined): Promise<GetCelebrityInfoResult> {
  try {
    // TODO: implement get_celebrity_info
    throw new Error("get_celebrity_info not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_celebrity_info failed");
  }
}

/** Get celebrity recognition. */
export async function getCelebrityRecognition(jobId: string): Promise<GetCelebrityRecognitionResult> {
  try {
    // TODO: implement get_celebrity_recognition
    throw new Error("get_celebrity_recognition not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_celebrity_recognition failed");
  }
}

/** Get content moderation. */
export async function getContentModeration(jobId: string): Promise<GetContentModerationResult> {
  try {
    // TODO: implement get_content_moderation
    throw new Error("get_content_moderation not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_content_moderation failed");
  }
}

/** Get face detection. */
export async function getFaceDetection(jobId: string): Promise<GetFaceDetectionResult> {
  try {
    // TODO: implement get_face_detection
    throw new Error("get_face_detection not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_face_detection failed");
  }
}

/** Get face liveness session results. */
export async function getFaceLivenessSessionResults(sessionId: string, regionName?: string | undefined): Promise<GetFaceLivenessSessionResultsResult> {
  try {
    // TODO: implement get_face_liveness_session_results
    throw new Error("get_face_liveness_session_results not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_face_liveness_session_results failed");
  }
}

/** Get face search. */
export async function getFaceSearch(jobId: string): Promise<GetFaceSearchResult> {
  try {
    // TODO: implement get_face_search
    throw new Error("get_face_search not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_face_search failed");
  }
}

/** Get label detection. */
export async function getLabelDetection(jobId: string): Promise<GetLabelDetectionResult> {
  try {
    // TODO: implement get_label_detection
    throw new Error("get_label_detection not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_label_detection failed");
  }
}

/** Get media analysis job. */
export async function getMediaAnalysisJob(jobId: string, regionName?: string | undefined): Promise<GetMediaAnalysisJobResult> {
  try {
    // TODO: implement get_media_analysis_job
    throw new Error("get_media_analysis_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_media_analysis_job failed");
  }
}

/** Get person tracking. */
export async function getPersonTracking(jobId: string): Promise<GetPersonTrackingResult> {
  try {
    // TODO: implement get_person_tracking
    throw new Error("get_person_tracking not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_person_tracking failed");
  }
}

/** Get segment detection. */
export async function getSegmentDetection(jobId: string): Promise<GetSegmentDetectionResult> {
  try {
    // TODO: implement get_segment_detection
    throw new Error("get_segment_detection not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_segment_detection failed");
  }
}

/** Get text detection. */
export async function getTextDetection(jobId: string): Promise<GetTextDetectionResult> {
  try {
    // TODO: implement get_text_detection
    throw new Error("get_text_detection not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_text_detection failed");
  }
}

/** Index faces. */
export async function indexFaces(collectionId: string, image: Record<string, unknown>): Promise<IndexFacesResult> {
  try {
    // TODO: implement index_faces
    throw new Error("index_faces not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "index_faces failed");
  }
}

/** List collections. */
export async function listCollections(): Promise<ListCollectionsResult> {
  try {
    // TODO: implement list_collections
    throw new Error("list_collections not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_collections failed");
  }
}

/** List dataset entries. */
export async function listDatasetEntries(datasetArn: string): Promise<ListDatasetEntriesResult> {
  try {
    // TODO: implement list_dataset_entries
    throw new Error("list_dataset_entries not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_dataset_entries failed");
  }
}

/** List dataset labels. */
export async function listDatasetLabels(datasetArn: string): Promise<ListDatasetLabelsResult> {
  try {
    // TODO: implement list_dataset_labels
    throw new Error("list_dataset_labels not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_dataset_labels failed");
  }
}

/** List faces. */
export async function listFaces(collectionId: string): Promise<ListFacesResult> {
  try {
    // TODO: implement list_faces
    throw new Error("list_faces not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_faces failed");
  }
}

/** List media analysis jobs. */
export async function listMediaAnalysisJobs(): Promise<ListMediaAnalysisJobsResult> {
  try {
    // TODO: implement list_media_analysis_jobs
    throw new Error("list_media_analysis_jobs not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_media_analysis_jobs failed");
  }
}

/** List project policies. */
export async function listProjectPolicies(projectArn: string): Promise<ListProjectPoliciesResult> {
  try {
    // TODO: implement list_project_policies
    throw new Error("list_project_policies not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_project_policies failed");
  }
}

/** List stream processors. */
export async function listStreamProcessors(): Promise<ListStreamProcessorsResult> {
  try {
    // TODO: implement list_stream_processors
    throw new Error("list_stream_processors not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_stream_processors failed");
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

/** List users. */
export async function listUsers(collectionId: string): Promise<ListUsersResult> {
  try {
    // TODO: implement list_users
    throw new Error("list_users not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_users failed");
  }
}

/** Put project policy. */
export async function putProjectPolicy(projectArn: string, policyName: string, policyDocument: string): Promise<PutProjectPolicyResult> {
  try {
    // TODO: implement put_project_policy
    throw new Error("put_project_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_project_policy failed");
  }
}

/** Recognize celebrities. */
export async function recognizeCelebrities(image: Record<string, unknown>, regionName?: string | undefined): Promise<RecognizeCelebritiesResult> {
  try {
    // TODO: implement recognize_celebrities
    throw new Error("recognize_celebrities not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "recognize_celebrities failed");
  }
}

/** Search faces. */
export async function searchFaces(collectionId: string, faceId: string): Promise<SearchFacesResult> {
  try {
    // TODO: implement search_faces
    throw new Error("search_faces not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "search_faces failed");
  }
}

/** Search faces by image. */
export async function searchFacesByImage(collectionId: string, image: Record<string, unknown>): Promise<SearchFacesByImageResult> {
  try {
    // TODO: implement search_faces_by_image
    throw new Error("search_faces_by_image not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "search_faces_by_image failed");
  }
}

/** Search users. */
export async function searchUsers(collectionId: string): Promise<SearchUsersResult> {
  try {
    // TODO: implement search_users
    throw new Error("search_users not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "search_users failed");
  }
}

/** Search users by image. */
export async function searchUsersByImage(collectionId: string, image: Record<string, unknown>): Promise<SearchUsersByImageResult> {
  try {
    // TODO: implement search_users_by_image
    throw new Error("search_users_by_image not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "search_users_by_image failed");
  }
}

/** Start celebrity recognition. */
export async function startCelebrityRecognition(video: Record<string, unknown>): Promise<StartCelebrityRecognitionResult> {
  try {
    // TODO: implement start_celebrity_recognition
    throw new Error("start_celebrity_recognition not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_celebrity_recognition failed");
  }
}

/** Start content moderation. */
export async function startContentModeration(video: Record<string, unknown>): Promise<StartContentModerationResult> {
  try {
    // TODO: implement start_content_moderation
    throw new Error("start_content_moderation not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_content_moderation failed");
  }
}

/** Start face detection. */
export async function startFaceDetection(video: Record<string, unknown>): Promise<StartFaceDetectionResult> {
  try {
    // TODO: implement start_face_detection
    throw new Error("start_face_detection not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_face_detection failed");
  }
}

/** Start face search. */
export async function startFaceSearch(video: Record<string, unknown>, collectionId: string): Promise<StartFaceSearchResult> {
  try {
    // TODO: implement start_face_search
    throw new Error("start_face_search not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_face_search failed");
  }
}

/** Start label detection. */
export async function startLabelDetection(video: Record<string, unknown>): Promise<StartLabelDetectionResult> {
  try {
    // TODO: implement start_label_detection
    throw new Error("start_label_detection not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_label_detection failed");
  }
}

/** Start media analysis job. */
export async function startMediaAnalysisJob(operationsConfig: Record<string, unknown>, input: Record<string, unknown>, outputConfig: Record<string, unknown>): Promise<StartMediaAnalysisJobResult> {
  try {
    // TODO: implement start_media_analysis_job
    throw new Error("start_media_analysis_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_media_analysis_job failed");
  }
}

/** Start person tracking. */
export async function startPersonTracking(video: Record<string, unknown>): Promise<StartPersonTrackingResult> {
  try {
    // TODO: implement start_person_tracking
    throw new Error("start_person_tracking not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_person_tracking failed");
  }
}

/** Start project version. */
export async function startProjectVersion(projectVersionArn: string, minInferenceUnits: number): Promise<StartProjectVersionResult> {
  try {
    // TODO: implement start_project_version
    throw new Error("start_project_version not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_project_version failed");
  }
}

/** Start segment detection. */
export async function startSegmentDetection(video: Record<string, unknown>, segmentTypes: string[]): Promise<StartSegmentDetectionResult> {
  try {
    // TODO: implement start_segment_detection
    throw new Error("start_segment_detection not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_segment_detection failed");
  }
}

/** Start stream processor. */
export async function startStreamProcessor(name: string): Promise<StartStreamProcessorResult> {
  try {
    // TODO: implement start_stream_processor
    throw new Error("start_stream_processor not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_stream_processor failed");
  }
}

/** Start text detection. */
export async function startTextDetection(video: Record<string, unknown>): Promise<StartTextDetectionResult> {
  try {
    // TODO: implement start_text_detection
    throw new Error("start_text_detection not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_text_detection failed");
  }
}

/** Stop project version. */
export async function stopProjectVersion(projectVersionArn: string, regionName?: string | undefined): Promise<StopProjectVersionResult> {
  try {
    // TODO: implement stop_project_version
    throw new Error("stop_project_version not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "stop_project_version failed");
  }
}

/** Stop stream processor. */
export async function stopStreamProcessor(name: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement stop_stream_processor
    throw new Error("stop_stream_processor not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "stop_stream_processor failed");
  }
}

/** Tag resource. */
export async function tagResource(resourceArn: string, tags: Record<string, unknown>, regionName?: string | undefined): Promise<void> {
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

/** Update dataset entries. */
export async function updateDatasetEntries(datasetArn: string, changes: Record<string, unknown>, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement update_dataset_entries
    throw new Error("update_dataset_entries not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_dataset_entries failed");
  }
}

/** Update stream processor. */
export async function updateStreamProcessor(name: string): Promise<void> {
  try {
    // TODO: implement update_stream_processor
    throw new Error("update_stream_processor not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_stream_processor failed");
  }
}
