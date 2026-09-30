/**
 * aws-util/s3 — High-level Amazon S3 utilities.
 *
 * Provides typed, ergonomic wrappers around the AWS SDK v3 S3 client for
 * common operations: upload, download, copy, move, presigned URLs,
 * multipart upload, folder sync, batch operations, and JSON/JSONL helpers.
 *
 * All functions obtain an S3Client via {@link getClient} and wrap errors
 * through {@link wrapAwsError}.
 *
 * @module
 */

import { readFile, writeFile, readdir, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { join, relative, posix } from "node:path";
import { Readable } from "node:stream";
import { z } from "zod";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  HeadObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  CopyObjectCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
} from "@aws-sdk/client-s3";
import {
  getSignedUrl,
} from "@aws-sdk/s3-request-presigner";
import { getClient } from "./client.js";
import { wrapAwsError } from "./exceptions.js";

// ---------------------------------------------------------------------------
// Zod schemas & inferred types
// ---------------------------------------------------------------------------

/** Schema for an S3 object reference with optional metadata. */
export const S3ObjectSchema = z.object({
  bucket: z.string(),
  key: z.string(),
  size: z.number().optional(),
  lastModified: z.date().optional(),
  etag: z.string().optional(),
});
/** An S3 object reference with optional metadata. */
export type S3Object = z.infer<typeof S3ObjectSchema>;

/** Schema for a presigned URL result. */
export const PresignedUrlSchema = z.object({
  url: z.string(),
  bucket: z.string(),
  key: z.string(),
  expiresIn: z.number(),
});
/** A presigned URL result. */
export type PresignedUrl = z.infer<typeof PresignedUrlSchema>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Get a cached S3Client for the given region.
 */
function s3(region?: string): S3Client {
  return getClient(S3Client, region);
}

/**
 * Collect a readable stream into a Buffer.
 */
async function streamToBuffer(stream: Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

/**
 * Compute the hex-encoded MD5 of a local file for etag comparison.
 */
async function fileMd5(filePath: string): Promise<string> {
  const data = await readFile(filePath);
  return createHash("md5").update(data).digest("hex");
}

/**
 * Recursively list all files under a directory.
 */
async function walkDir(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkDir(full)));
    } else if (entry.isFile()) {
      files.push(full);
    }
  }
  return files;
}

// ---------------------------------------------------------------------------
// Upload
// ---------------------------------------------------------------------------

/**
 * Upload a local file to S3.
 *
 * Reads the file into memory and uploads it using PutObjectCommand.
 * For very large files, prefer {@link multipartUpload}.
 *
 * @param bucket - The target S3 bucket name.
 * @param key - The S3 object key.
 * @param filePath - Absolute or relative path to the local file.
 * @param contentType - Optional MIME type (e.g. `"application/json"`).
 * @param region - AWS region override.
 */
export async function uploadFile(
  bucket: string,
  key: string,
  filePath: string,
  contentType?: string,
  region?: string,
): Promise<void> {
  try {
    const body = await readFile(filePath);
    await s3(region).send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ...(contentType ? { ContentType: contentType } : {}),
      }),
    );
  } catch (err) {
    throw wrapAwsError(err, `uploadFile s3://${bucket}/${key}`);
  }
}

/**
 * Upload raw bytes (Buffer or Uint8Array) to S3.
 *
 * @param bucket - The target S3 bucket name.
 * @param key - The S3 object key.
 * @param data - The bytes to upload.
 * @param contentType - Optional MIME type.
 * @param region - AWS region override.
 */
export async function uploadBytes(
  bucket: string,
  key: string,
  data: Buffer | Uint8Array,
  contentType?: string,
  region?: string,
): Promise<void> {
  try {
    await s3(region).send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: data,
        ...(contentType ? { ContentType: contentType } : {}),
      }),
    );
  } catch (err) {
    throw wrapAwsError(err, `uploadBytes s3://${bucket}/${key}`);
  }
}

// ---------------------------------------------------------------------------
// Download
// ---------------------------------------------------------------------------

/**
 * Download an S3 object to a local file.
 *
 * @param bucket - The source S3 bucket name.
 * @param key - The S3 object key.
 * @param destPath - Local destination path. Parent directories are created
 *   automatically.
 * @param region - AWS region override.
 */
export async function downloadFile(
  bucket: string,
  key: string,
  destPath: string,
  region?: string,
): Promise<void> {
  try {
    const resp = await s3(region).send(
      new GetObjectCommand({ Bucket: bucket, Key: key }),
    );
    const body = resp.Body;
    if (!body) {
      throw new Error("Empty response body");
    }
    const buf = await streamToBuffer(body as Readable);
    // Ensure parent directory exists
    const parentDir = destPath.replace(/[/\\][^/\\]+$/, "");
    if (parentDir && parentDir !== destPath) {
      await mkdir(parentDir, { recursive: true });
    }
    await writeFile(destPath, buf);
  } catch (err) {
    throw wrapAwsError(err, `downloadFile s3://${bucket}/${key}`);
  }
}

/**
 * Download an S3 object as a Buffer.
 *
 * @param bucket - The source S3 bucket name.
 * @param key - The S3 object key.
 * @param region - AWS region override.
 * @returns The object contents as a Buffer.
 */
export async function downloadBytes(
  bucket: string,
  key: string,
  region?: string,
): Promise<Buffer> {
  try {
    const resp = await s3(region).send(
      new GetObjectCommand({ Bucket: bucket, Key: key }),
    );
    const body = resp.Body;
    if (!body) {
      throw new Error("Empty response body");
    }
    return await streamToBuffer(body as Readable);
  } catch (err) {
    throw wrapAwsError(err, `downloadBytes s3://${bucket}/${key}`);
  }
}

/**
 * Download an S3 object as a string.
 *
 * @param bucket - The source S3 bucket name.
 * @param key - The S3 object key.
 * @param encoding - Character encoding (default `"utf-8"`).
 * @param region - AWS region override.
 * @returns The object contents as a string.
 */
export async function downloadAsText(
  bucket: string,
  key: string,
  encoding: BufferEncoding = "utf-8",
  region?: string,
): Promise<string> {
  const buf = await downloadBytes(bucket, key, region);
  return buf.toString(encoding);
}

// ---------------------------------------------------------------------------
// List / Head / Exists
// ---------------------------------------------------------------------------

/**
 * List all objects under a prefix, auto-paginating through all pages.
 *
 * @param bucket - The S3 bucket name.
 * @param prefix - Optional key prefix to filter by.
 * @param region - AWS region override.
 * @returns An array of {@link S3Object} entries.
 */
export async function listObjects(
  bucket: string,
  prefix?: string,
  region?: string,
): Promise<S3Object[]> {
  const results: S3Object[] = [];
  let continuationToken: string | undefined;

  try {
    do {
      const resp = await s3(region).send(
        new ListObjectsV2Command({
          Bucket: bucket,
          Prefix: prefix,
          ContinuationToken: continuationToken,
        }),
      );
      for (const obj of resp.Contents ?? []) {
        results.push({
          bucket,
          key: obj.Key ?? "",
          size: obj.Size,
          lastModified: obj.LastModified,
          etag: obj.ETag?.replace(/"/g, ""),
        });
      }
      continuationToken = resp.IsTruncated
        ? resp.NextContinuationToken
        : undefined;
    } while (continuationToken);
  } catch (err) {
    throw wrapAwsError(err, `listObjects s3://${bucket}/${prefix ?? ""}`);
  }

  return results;
}

/**
 * Check whether an object exists in S3.
 *
 * Uses HeadObject and catches 404-like errors to return `false`.
 *
 * @param bucket - The S3 bucket name.
 * @param key - The S3 object key.
 * @param region - AWS region override.
 * @returns `true` if the object exists, `false` otherwise.
 */
export async function objectExists(
  bucket: string,
  key: string,
  region?: string,
): Promise<boolean> {
  try {
    await s3(region).send(
      new HeadObjectCommand({ Bucket: bucket, Key: key }),
    );
    return true;
  } catch (err: unknown) {
    const record = err as Record<string, unknown>;
    const name =
      typeof record["name"] === "string" ? record["name"] : "";
    const statusCode =
      typeof record["$metadata"] === "object" && record["$metadata"]
        ? (record["$metadata"] as Record<string, unknown>)["httpStatusCode"]
        : undefined;
    if (
      name === "NotFound" ||
      name === "NoSuchKey" ||
      statusCode === 404
    ) {
      return false;
    }
    throw wrapAwsError(err, `objectExists s3://${bucket}/${key}`);
  }
}

// ---------------------------------------------------------------------------
// Delete / Copy / Move
// ---------------------------------------------------------------------------

/**
 * Delete a single object from S3.
 *
 * @param bucket - The S3 bucket name.
 * @param key - The S3 object key to delete.
 * @param region - AWS region override.
 */
export async function deleteObject(
  bucket: string,
  key: string,
  region?: string,
): Promise<void> {
  try {
    await s3(region).send(
      new DeleteObjectCommand({ Bucket: bucket, Key: key }),
    );
  } catch (err) {
    throw wrapAwsError(err, `deleteObject s3://${bucket}/${key}`);
  }
}

/**
 * Copy an object within or across S3 buckets.
 *
 * @param srcBucket - Source bucket name.
 * @param srcKey - Source object key.
 * @param dstBucket - Destination bucket name.
 * @param dstKey - Destination object key.
 * @param region - AWS region override.
 */
export async function copyObject(
  srcBucket: string,
  srcKey: string,
  dstBucket: string,
  dstKey: string,
  region?: string,
): Promise<void> {
  try {
    await s3(region).send(
      new CopyObjectCommand({
        Bucket: dstBucket,
        Key: dstKey,
        CopySource: `${srcBucket}/${srcKey}`,
      }),
    );
  } catch (err) {
    throw wrapAwsError(
      err,
      `copyObject s3://${srcBucket}/${srcKey} -> s3://${dstBucket}/${dstKey}`,
    );
  }
}

/**
 * Move an object within or across S3 buckets (copy then delete source).
 *
 * @param srcBucket - Source bucket name.
 * @param srcKey - Source object key.
 * @param dstBucket - Destination bucket name.
 * @param dstKey - Destination object key.
 * @param region - AWS region override.
 */
export async function moveObject(
  srcBucket: string,
  srcKey: string,
  dstBucket: string,
  dstKey: string,
  region?: string,
): Promise<void> {
  await copyObject(srcBucket, srcKey, dstBucket, dstKey, region);
  await deleteObject(srcBucket, srcKey, region);
}

// ---------------------------------------------------------------------------
// Presigned URLs
// ---------------------------------------------------------------------------

/**
 * Generate a presigned URL for an S3 object.
 *
 * @param bucket - The S3 bucket name.
 * @param key - The S3 object key.
 * @param expiresIn - URL lifetime in seconds (default 3600).
 * @param operation - `"getObject"` (default) or `"putObject"`.
 * @param region - AWS region override.
 * @returns A {@link PresignedUrl} with the signed URL and metadata.
 */
export async function presignedUrl(
  bucket: string,
  key: string,
  expiresIn = 3600,
  operation: "getObject" | "putObject" = "getObject",
  region?: string,
): Promise<PresignedUrl> {
  try {
    const command =
      operation === "putObject"
        ? new PutObjectCommand({ Bucket: bucket, Key: key })
        : new GetObjectCommand({ Bucket: bucket, Key: key });
    const url = await getSignedUrl(s3(region), command, { expiresIn });
    return PresignedUrlSchema.parse({ url, bucket, key, expiresIn });
  } catch (err) {
    throw wrapAwsError(err, `presignedUrl s3://${bucket}/${key}`);
  }
}

/**
 * Generate a presigned POST policy for browser-based uploads.
 *
 * This builds the fields and URL that a client can use in an HTML form
 * or `fetch` call to upload directly to S3.
 *
 * @param bucket - The target S3 bucket name.
 * @param key - The S3 object key.
 * @param maxSizeMb - Maximum upload size in megabytes (default 100).
 * @param expiresIn - Policy lifetime in seconds (default 3600).
 * @param region - AWS region override.
 * @returns An object with `url` and `fields` for the POST request.
 */
export async function generatePresignedPost(
  bucket: string,
  key: string,
  maxSizeMb = 100,
  expiresIn = 3600,
  region?: string,
): Promise<{ url: string; fields: Record<string, string> }> {
  try {
    // Dynamic import to avoid hard dependency if not installed
    const { createPresignedPost: createPost } = await import(
      "@aws-sdk/s3-presigned-post"
    );
    const result = await createPost(s3(region), {
      Bucket: bucket,
      Key: key,
      Expires: expiresIn,
      Conditions: [
        ["content-length-range", 0, maxSizeMb * 1024 * 1024],
      ],
    });
    return { url: result.url, fields: result.fields };
  } catch (err) {
    throw wrapAwsError(
      err,
      `generatePresignedPost s3://${bucket}/${key}`,
    );
  }
}

// ---------------------------------------------------------------------------
// JSON / JSONL helpers
// ---------------------------------------------------------------------------

/**
 * Download an S3 object and parse it as JSON.
 *
 * @param bucket - The S3 bucket name.
 * @param key - The S3 object key (should contain valid JSON).
 * @param region - AWS region override.
 * @returns The parsed JSON value.
 */
export async function readJson(
  bucket: string,
  key: string,
  region?: string,
): Promise<unknown> {
  const text = await downloadAsText(bucket, key, "utf-8", region);
  return JSON.parse(text);
}

/**
 * Serialize a value to JSON and upload it to S3.
 *
 * @param bucket - The target S3 bucket name.
 * @param key - The S3 object key.
 * @param data - The value to serialize.
 * @param indent - JSON indentation (default 2). Pass 0 for compact.
 * @param region - AWS region override.
 */
export async function writeJson(
  bucket: string,
  key: string,
  data: unknown,
  indent = 2,
  region?: string,
): Promise<void> {
  const body = JSON.stringify(data, null, indent || undefined);
  await uploadBytes(
    bucket,
    key,
    Buffer.from(body, "utf-8"),
    "application/json",
    region,
  );
}

/**
 * Download an S3 object containing newline-delimited JSON (JSONL) and
 * yield each parsed line.
 *
 * @param bucket - The S3 bucket name.
 * @param key - The S3 object key (should contain JSONL data).
 * @param region - AWS region override.
 * @yields Each parsed JSON line as an unknown value.
 */
export async function* readJsonl(
  bucket: string,
  key: string,
  region?: string,
): AsyncGenerator<unknown> {
  const text = await downloadAsText(bucket, key, "utf-8", region);
  const lines = text.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length > 0) {
      yield JSON.parse(trimmed);
    }
  }
}

// ---------------------------------------------------------------------------
// Folder sync
// ---------------------------------------------------------------------------

/** Result of a {@link syncFolder} operation. */
export interface SyncFolderResult {
  /** Number of files uploaded (new or changed). */
  uploaded: number;
  /** Number of files skipped (unchanged). */
  skipped: number;
  /** Number of remote objects deleted (only when `deleteRemoved` is true). */
  deleted: number;
}

/**
 * Synchronize a local directory to an S3 prefix, comparing MD5 etags.
 *
 * Files whose local MD5 matches the remote ETag are skipped. New or changed
 * files are uploaded. When `deleteRemoved` is `true`, remote objects that
 * no longer have a local counterpart are deleted.
 *
 * @param localPath - Local directory to sync from.
 * @param bucket - Target S3 bucket.
 * @param prefix - S3 key prefix (default `""`).
 * @param deleteRemoved - Delete remote objects without a local file (default `false`).
 * @param region - AWS region override.
 * @returns Upload/skip/delete counts.
 */
export async function syncFolder(
  localPath: string,
  bucket: string,
  prefix = "",
  deleteRemoved = false,
  region?: string,
): Promise<SyncFolderResult> {
  try {
    // Build remote index: key -> etag
    const remoteObjects = await listObjects(bucket, prefix, region);
    const remoteEtags = new Map<string, string>();
    for (const obj of remoteObjects) {
      remoteEtags.set(obj.key, obj.etag ?? "");
    }

    // Walk local directory
    const localFiles = await walkDir(localPath);
    const result: SyncFolderResult = {
      uploaded: 0,
      skipped: 0,
      deleted: 0,
    };
    const seenKeys = new Set<string>();

    for (const filePath of localFiles) {
      const rel = relative(localPath, filePath).split("\\").join("/");
      const s3Key = prefix ? posix.join(prefix, rel) : rel;
      seenKeys.add(s3Key);

      const localHash = await fileMd5(filePath);
      const remoteEtag = remoteEtags.get(s3Key);

      if (remoteEtag === localHash) {
        result.skipped++;
      } else {
        await uploadFile(bucket, s3Key, filePath, undefined, region);
        result.uploaded++;
      }
    }

    // Delete remote objects not present locally
    if (deleteRemoved) {
      for (const remoteKey of remoteEtags.keys()) {
        if (!seenKeys.has(remoteKey)) {
          await deleteObject(bucket, remoteKey, region);
          result.deleted++;
        }
      }
    }

    return result;
  } catch (err) {
    throw wrapAwsError(
      err,
      `syncFolder ${localPath} -> s3://${bucket}/${prefix}`,
    );
  }
}

// ---------------------------------------------------------------------------
// Multipart upload
// ---------------------------------------------------------------------------

/**
 * Upload a large file using S3 multipart upload with parallel part uploads.
 *
 * @param bucket - The target S3 bucket name.
 * @param key - The S3 object key.
 * @param filePath - Absolute or relative path to the local file.
 * @param partSizeMb - Size of each part in megabytes (default 8, minimum 5).
 * @param region - AWS region override.
 */
export async function multipartUpload(
  bucket: string,
  key: string,
  filePath: string,
  partSizeMb = 8,
  region?: string,
): Promise<void> {
  const partSize = Math.max(partSizeMb, 5) * 1024 * 1024;
  const fileData = await readFile(filePath);
  const totalParts = Math.ceil(fileData.length / partSize);
  const client = s3(region);
  let uploadId: string | undefined;

  try {
    // Initiate multipart upload
    const initResp = await client.send(
      new CreateMultipartUploadCommand({ Bucket: bucket, Key: key }),
    );
    uploadId = initResp.UploadId;
    if (!uploadId) {
      throw new Error("Failed to obtain UploadId");
    }

    // Upload parts in parallel
    const partPromises: Promise<{ ETag: string; PartNumber: number }>[] =
      [];
    for (let i = 0; i < totalParts; i++) {
      const start = i * partSize;
      const end = Math.min(start + partSize, fileData.length);
      const partNumber = i + 1;
      const body = fileData.subarray(start, end);

      const capturedUploadId = uploadId;
      partPromises.push(
        client
          .send(
            new UploadPartCommand({
              Bucket: bucket,
              Key: key,
              UploadId: capturedUploadId,
              PartNumber: partNumber,
              Body: body,
            }),
          )
          .then((resp) => ({
            ETag: resp.ETag ?? "",
            PartNumber: partNumber,
          })),
      );
    }

    const completedParts = await Promise.all(partPromises);
    completedParts.sort((a, b) => a.PartNumber - b.PartNumber);

    // Complete multipart upload
    await client.send(
      new CompleteMultipartUploadCommand({
        Bucket: bucket,
        Key: key,
        UploadId: uploadId,
        MultipartUpload: {
          Parts: completedParts.map((p) => ({
            ETag: p.ETag,
            PartNumber: p.PartNumber,
          })),
        },
      }),
    );
  } catch (err) {
    // Abort multipart upload on failure
    if (uploadId) {
      try {
        await client.send(
          new AbortMultipartUploadCommand({
            Bucket: bucket,
            Key: key,
            UploadId: uploadId,
          }),
        );
      } catch (_abortErr) {
        // Best-effort abort; swallow errors
      }
    }
    throw wrapAwsError(
      err,
      `multipartUpload s3://${bucket}/${key}`,
    );
  }
}

// ---------------------------------------------------------------------------
// Bulk operations
// ---------------------------------------------------------------------------

/**
 * Delete all objects under a prefix, paginating and batching deletes.
 *
 * Uses ListObjectsV2 to paginate through all matching keys and
 * DeleteObjects in batches of up to 1000.
 *
 * @param bucket - The S3 bucket name.
 * @param prefix - The key prefix to delete under.
 * @param region - AWS region override.
 * @returns The total number of objects deleted.
 */
export async function deletePrefix(
  bucket: string,
  prefix: string,
  region?: string,
): Promise<number> {
  let totalDeleted = 0;
  let continuationToken: string | undefined;
  const client = s3(region);

  try {
    do {
      const listResp = await client.send(
        new ListObjectsV2Command({
          Bucket: bucket,
          Prefix: prefix,
          ContinuationToken: continuationToken,
        }),
      );

      const objects = listResp.Contents ?? [];
      if (objects.length > 0) {
        // Delete in batches of 1000 (S3 API limit)
        for (let i = 0; i < objects.length; i += 1000) {
          const batch = objects.slice(i, i + 1000);
          await client.send(
            new DeleteObjectsCommand({
              Bucket: bucket,
              Delete: {
                Objects: batch.map((obj) => ({ Key: obj.Key })),
                Quiet: true,
              },
            }),
          );
          totalDeleted += batch.length;
        }
      }

      continuationToken = listResp.IsTruncated
        ? listResp.NextContinuationToken
        : undefined;
    } while (continuationToken);
  } catch (err) {
    throw wrapAwsError(
      err,
      `deletePrefix s3://${bucket}/${prefix}`,
    );
  }

  return totalDeleted;
}

/**
 * Retrieve metadata (headers) for an S3 object via HeadObject.
 *
 * @param bucket - The S3 bucket name.
 * @param key - The S3 object key.
 * @param region - AWS region override.
 * @returns An object containing content-type, content-length, last-modified,
 *   etag, and any user-defined metadata.
 */
export async function getObjectMetadata(
  bucket: string,
  key: string,
  region?: string,
): Promise<{
  contentType?: string;
  contentLength?: number;
  lastModified?: Date;
  etag?: string;
  metadata?: Record<string, string>;
}> {
  try {
    const resp = await s3(region).send(
      new HeadObjectCommand({ Bucket: bucket, Key: key }),
    );
    return {
      contentType: resp.ContentType,
      contentLength: resp.ContentLength,
      lastModified: resp.LastModified,
      etag: resp.ETag?.replace(/"/g, ""),
      metadata: resp.Metadata,
    };
  } catch (err) {
    throw wrapAwsError(
      err,
      `getObjectMetadata s3://${bucket}/${key}`,
    );
  }
}

/** A single copy descriptor for {@link batchCopy}. */
export interface CopyDescriptor {
  srcBucket: string;
  srcKey: string;
  dstBucket: string;
  dstKey: string;
}

/** Result of a single copy operation within {@link batchCopy}. */
export interface BatchCopyResult {
  descriptor: CopyDescriptor;
  status: "fulfilled" | "rejected";
  error?: Error;
}

/**
 * Copy multiple S3 objects in parallel using `Promise.allSettled`.
 *
 * Each copy is independent — failures do not abort other copies.
 *
 * @param copies - Array of copy descriptors.
 * @param region - AWS region override.
 * @returns An array of results indicating success or failure for each copy.
 */
export async function batchCopy(
  copies: CopyDescriptor[],
  region?: string,
): Promise<BatchCopyResult[]> {
  const settled = await Promise.allSettled(
    copies.map((desc) =>
      copyObject(
        desc.srcBucket,
        desc.srcKey,
        desc.dstBucket,
        desc.dstKey,
        region,
      ).then(() => desc),
    ),
  );

  return settled.map((result, i) => {
    if (result.status === "fulfilled") {
      return {
        descriptor: copies[i],
        status: "fulfilled" as const,
      };
    }
    return {
      descriptor: copies[i],
      status: "rejected" as const,
      error:
        result.reason instanceof Error
          ? result.reason
          : new Error(String(result.reason)),
    };
  });
}

// ---------------------------------------------------------------------------
// Additional types (auto-generated)
// ---------------------------------------------------------------------------

/** Metadata for a specific version of an S3 object. */
export type S3ObjectVersion = {
  bucket: string;
  key: string;
  versionId: string;
  isLatest?: boolean;
  lastModified?: Date | undefined;
  etag?: string | undefined;
  size?: number | undefined;
  isDeleteMarker?: boolean;
};

/** Result of abort_multipart_upload. */
export type AbortMultipartUploadResult = {
  requestCharged?: string | undefined;
};

/** Result of complete_multipart_upload. */
export type CompleteMultipartUploadResult = {
  location?: string | undefined;
  bucket?: string | undefined;
  key?: string | undefined;
  expiration?: string | undefined;
  eTag?: string | undefined;
  checksumCrc32?: string | undefined;
  checksumCrc32C?: string | undefined;
  checksumCrc64Nvme?: string | undefined;
  checksumSha1?: string | undefined;
  checksumSha256?: string | undefined;
  checksumType?: string | undefined;
  serverSideEncryption?: string | undefined;
  versionId?: string | undefined;
  ssekmsKeyId?: string | undefined;
  bucketKeyEnabled?: boolean | undefined;
  requestCharged?: string | undefined;
};

/** Result of create_bucket. */
export type CreateBucketResult = {
  location?: string | undefined;
  bucketArn?: string | undefined;
};

/** Result of create_multipart_upload. */
export type CreateMultipartUploadResult = {
  abortDate?: string | undefined;
  abortRuleId?: string | undefined;
  bucket?: string | undefined;
  key?: string | undefined;
  uploadId?: string | undefined;
  serverSideEncryption?: string | undefined;
  sseCustomerAlgorithm?: string | undefined;
  sseCustomerKeyMd5?: string | undefined;
  ssekmsKeyId?: string | undefined;
  ssekmsEncryptionContext?: string | undefined;
  bucketKeyEnabled?: boolean | undefined;
  requestCharged?: string | undefined;
  checksumAlgorithm?: string | undefined;
  checksumType?: string | undefined;
};

/** Result of create_session. */
export type CreateSessionResult = {
  serverSideEncryption?: string | undefined;
  ssekmsKeyId?: string | undefined;
  ssekmsEncryptionContext?: string | undefined;
  bucketKeyEnabled?: boolean | undefined;
  credentials?: Record<string, unknown>;
};

/** Result of delete_object_tagging. */
export type DeleteObjectTaggingResult = {
  versionId?: string | undefined;
};

/** Result of delete_objects. */
export type DeleteObjectsResult = {
  deleted?: Record<string, unknown>[];
  requestCharged?: string | undefined;
  errors?: Record<string, unknown>[];
};

/** Result of get_bucket_accelerate_configuration. */
export type GetBucketAccelerateConfigurationResult = {
  status?: string | undefined;
  requestCharged?: string | undefined;
};

/** Result of get_bucket_acl. */
export type GetBucketAclResult = {
  owner?: Record<string, unknown>;
  grants?: Record<string, unknown>[];
};

/** Result of get_bucket_analytics_configuration. */
export type GetBucketAnalyticsConfigurationResult = {
  analyticsConfiguration?: Record<string, unknown>;
};

/** Result of get_bucket_cors. */
export type GetBucketCorsResult = {
  corsRules?: Record<string, unknown>[];
};

/** Result of get_bucket_encryption. */
export type GetBucketEncryptionResult = {
  serverSideEncryptionConfiguration?: Record<string, unknown>;
};

/** Result of get_bucket_intelligent_tiering_configuration. */
export type GetBucketIntelligentTieringConfigurationResult = {
  intelligentTieringConfiguration?: Record<string, unknown>;
};

/** Result of get_bucket_inventory_configuration. */
export type GetBucketInventoryConfigurationResult = {
  inventoryConfiguration?: Record<string, unknown>;
};

/** Result of get_bucket_lifecycle. */
export type GetBucketLifecycleResult = {
  rules?: Record<string, unknown>[];
};

/** Result of get_bucket_lifecycle_configuration. */
export type GetBucketLifecycleConfigurationResult = {
  rules?: Record<string, unknown>[];
  transitionDefaultMinimumObjectSize?: string | undefined;
};

/** Result of get_bucket_location. */
export type GetBucketLocationResult = {
  locationConstraint?: string | undefined;
};

/** Result of get_bucket_logging. */
export type GetBucketLoggingResult = {
  loggingEnabled?: Record<string, unknown>;
};

/** Result of get_bucket_metadata_configuration. */
export type GetBucketMetadataConfigurationResult = {
  getBucketMetadataConfigurationResult?: Record<string, unknown>;
};

/** Result of get_bucket_metadata_table_configuration. */
export type GetBucketMetadataTableConfigurationResult = {
  getBucketMetadataTableConfigurationResult?: Record<string, unknown>;
};

/** Result of get_bucket_metrics_configuration. */
export type GetBucketMetricsConfigurationResult = {
  metricsConfiguration?: Record<string, unknown>;
};

/** Result of get_bucket_notification. */
export type GetBucketNotificationResult = {
  topicConfiguration?: Record<string, unknown>;
  queueConfiguration?: Record<string, unknown>;
  cloudFunctionConfiguration?: Record<string, unknown>;
};

/** Result of get_bucket_notification_configuration. */
export type GetBucketNotificationConfigurationResult = {
  topicConfigurations?: Record<string, unknown>[];
  queueConfigurations?: Record<string, unknown>[];
  lambdaFunctionConfigurations?: Record<string, unknown>[];
  eventBridgeConfiguration?: Record<string, unknown>;
};

/** Result of get_bucket_ownership_controls. */
export type GetBucketOwnershipControlsResult = {
  ownershipControls?: Record<string, unknown>;
};

/** Result of get_bucket_policy. */
export type GetBucketPolicyResult = {
  policy?: string | undefined;
};

/** Result of get_bucket_policy_status. */
export type GetBucketPolicyStatusResult = {
  policyStatus?: Record<string, unknown>;
};

/** Result of get_bucket_replication. */
export type GetBucketReplicationResult = {
  replicationConfiguration?: Record<string, unknown>;
};

/** Result of get_bucket_request_payment. */
export type GetBucketRequestPaymentResult = {
  payer?: string | undefined;
};

/** Result of get_bucket_tagging. */
export type GetBucketTaggingResult = {
  tagSet?: Record<string, unknown>[];
};

/** Result of get_bucket_versioning. */
export type GetBucketVersioningResult = {
  status?: string | undefined;
  mfaDelete?: string | undefined;
};

/** Result of get_bucket_website. */
export type GetBucketWebsiteResult = {
  redirectAllRequestsTo?: Record<string, unknown>;
  indexDocument?: Record<string, unknown>;
  errorDocument?: Record<string, unknown>;
  routingRules?: Record<string, unknown>[];
};

/** Result of get_object_acl. */
export type GetObjectAclResult = {
  owner?: Record<string, unknown>;
  grants?: Record<string, unknown>[];
  requestCharged?: string | undefined;
};

/** Result of get_object_attributes. */
export type GetObjectAttributesResult = {
  deleteMarker?: boolean | undefined;
  lastModified?: string | undefined;
  versionId?: string | undefined;
  requestCharged?: string | undefined;
  eTag?: string | undefined;
  checksum?: Record<string, unknown>;
  objectParts?: Record<string, unknown>;
  storageClass?: string | undefined;
  objectSize?: number | undefined;
};

/** Result of get_object_legal_hold. */
export type GetObjectLegalHoldResult = {
  legalHold?: Record<string, unknown>;
};

/** Result of get_object_lock_configuration. */
export type GetObjectLockConfigurationResult = {
  objectLockConfiguration?: Record<string, unknown>;
};

/** Result of get_object_retention. */
export type GetObjectRetentionResult = {
  retention?: Record<string, unknown>;
};

/** Result of get_object_tagging. */
export type GetObjectTaggingResult = {
  versionId?: string | undefined;
  tagSet?: Record<string, unknown>[];
};

/** Result of get_object_torrent. */
export type GetObjectTorrentResult = {
  body?: Uint8Array | undefined;
  requestCharged?: string | undefined;
};

/** Result of get_public_access_block. */
export type GetPublicAccessBlockResult = {
  publicAccessBlockConfiguration?: Record<string, unknown>;
};

/** Result of head_bucket. */
export type HeadBucketResult = {
  bucketArn?: string | undefined;
  bucketLocationType?: string | undefined;
  bucketLocationName?: string | undefined;
  bucketRegion?: string | undefined;
  accessPointAlias?: boolean | undefined;
};

/** Result of head_object. */
export type HeadObjectResult = {
  deleteMarker?: boolean | undefined;
  acceptRanges?: string | undefined;
  expiration?: string | undefined;
  restore?: string | undefined;
  archiveStatus?: string | undefined;
  lastModified?: string | undefined;
  contentLength?: number | undefined;
  checksumCrc32?: string | undefined;
  checksumCrc32C?: string | undefined;
  checksumCrc64Nvme?: string | undefined;
  checksumSha1?: string | undefined;
  checksumSha256?: string | undefined;
  checksumType?: string | undefined;
  eTag?: string | undefined;
  missingMeta?: number | undefined;
  versionId?: string | undefined;
  cacheControl?: string | undefined;
  contentDisposition?: string | undefined;
  contentEncoding?: string | undefined;
  contentLanguage?: string | undefined;
  contentType?: string | undefined;
  contentRange?: string | undefined;
  expires?: string | undefined;
  websiteRedirectLocation?: string | undefined;
  serverSideEncryption?: string | undefined;
  metadata?: Record<string, unknown>;
  sseCustomerAlgorithm?: string | undefined;
  sseCustomerKeyMd5?: string | undefined;
  ssekmsKeyId?: string | undefined;
  bucketKeyEnabled?: boolean | undefined;
  storageClass?: string | undefined;
  requestCharged?: string | undefined;
  replicationStatus?: string | undefined;
  partsCount?: number | undefined;
  tagCount?: number | undefined;
  objectLockMode?: string | undefined;
  objectLockRetainUntilDate?: string | undefined;
  objectLockLegalHoldStatus?: string | undefined;
};

/** Result of list_bucket_analytics_configurations. */
export type ListBucketAnalyticsConfigurationsResult = {
  isTruncated?: boolean | undefined;
  continuationToken?: string | undefined;
  nextContinuationToken?: string | undefined;
  analyticsConfigurationList?: Record<string, unknown>[];
};

/** Result of list_bucket_intelligent_tiering_configurations. */
export type ListBucketIntelligentTieringConfigurationsResult = {
  isTruncated?: boolean | undefined;
  continuationToken?: string | undefined;
  nextContinuationToken?: string | undefined;
  intelligentTieringConfigurationList?: Record<string, unknown>[];
};

/** Result of list_bucket_inventory_configurations. */
export type ListBucketInventoryConfigurationsResult = {
  continuationToken?: string | undefined;
  inventoryConfigurationList?: Record<string, unknown>[];
  isTruncated?: boolean | undefined;
  nextContinuationToken?: string | undefined;
};

/** Result of list_bucket_metrics_configurations. */
export type ListBucketMetricsConfigurationsResult = {
  isTruncated?: boolean | undefined;
  continuationToken?: string | undefined;
  nextContinuationToken?: string | undefined;
  metricsConfigurationList?: Record<string, unknown>[];
};

/** Result of list_buckets. */
export type ListBucketsResult = {
  buckets?: Record<string, unknown>[];
  owner?: Record<string, unknown>;
  continuationToken?: string | undefined;
  prefix?: string | undefined;
};

/** Result of list_directory_buckets. */
export type ListDirectoryBucketsResult = {
  buckets?: Record<string, unknown>[];
  continuationToken?: string | undefined;
};

/** Result of list_multipart_uploads. */
export type ListMultipartUploadsResult = {
  bucket?: string | undefined;
  keyMarker?: string | undefined;
  uploadIdMarker?: string | undefined;
  nextKeyMarker?: string | undefined;
  prefix?: string | undefined;
  delimiter?: string | undefined;
  nextUploadIdMarker?: string | undefined;
  maxUploads?: number | undefined;
  isTruncated?: boolean | undefined;
  uploads?: Record<string, unknown>[];
  commonPrefixes?: Record<string, unknown>[];
  encodingType?: string | undefined;
  requestCharged?: string | undefined;
};

/** Result of list_objects_v2. */
export type ListObjectsV2Result = {
  isTruncated?: boolean | undefined;
  contents?: Record<string, unknown>[];
  name?: string | undefined;
  prefix?: string | undefined;
  delimiter?: string | undefined;
  maxKeys?: number | undefined;
  commonPrefixes?: Record<string, unknown>[];
  encodingType?: string | undefined;
  keyCount?: number | undefined;
  continuationToken?: string | undefined;
  nextContinuationToken?: string | undefined;
  startAfter?: string | undefined;
  requestCharged?: string | undefined;
};

/** Result of list_parts. */
export type ListPartsResult = {
  abortDate?: string | undefined;
  abortRuleId?: string | undefined;
  bucket?: string | undefined;
  key?: string | undefined;
  uploadId?: string | undefined;
  partNumberMarker?: number | undefined;
  nextPartNumberMarker?: number | undefined;
  maxParts?: number | undefined;
  isTruncated?: boolean | undefined;
  parts?: Record<string, unknown>[];
  initiator?: Record<string, unknown>;
  owner?: Record<string, unknown>;
  storageClass?: string | undefined;
  requestCharged?: string | undefined;
  checksumAlgorithm?: string | undefined;
  checksumType?: string | undefined;
};

/** Result of put_bucket_lifecycle_configuration. */
export type PutBucketLifecycleConfigurationResult = {
  transitionDefaultMinimumObjectSize?: string | undefined;
};

/** Result of put_object. */
export type PutObjectResult = {
  expiration?: string | undefined;
  eTag?: string | undefined;
  checksumCrc32?: string | undefined;
  checksumCrc32C?: string | undefined;
  checksumCrc64Nvme?: string | undefined;
  checksumSha1?: string | undefined;
  checksumSha256?: string | undefined;
  checksumType?: string | undefined;
  serverSideEncryption?: string | undefined;
  versionId?: string | undefined;
  sseCustomerAlgorithm?: string | undefined;
  sseCustomerKeyMd5?: string | undefined;
  ssekmsKeyId?: string | undefined;
  ssekmsEncryptionContext?: string | undefined;
  bucketKeyEnabled?: boolean | undefined;
  size?: number | undefined;
  requestCharged?: string | undefined;
};

/** Result of put_object_acl. */
export type PutObjectAclResult = {
  requestCharged?: string | undefined;
};

/** Result of put_object_legal_hold. */
export type PutObjectLegalHoldResult = {
  requestCharged?: string | undefined;
};

/** Result of put_object_lock_configuration. */
export type PutObjectLockConfigurationResult = {
  requestCharged?: string | undefined;
};

/** Result of put_object_retention. */
export type PutObjectRetentionResult = {
  requestCharged?: string | undefined;
};

/** Result of put_object_tagging. */
export type PutObjectTaggingResult = {
  versionId?: string | undefined;
};

/** Result of restore_object. */
export type RestoreObjectResult = {
  requestCharged?: string | undefined;
  restoreOutputPath?: string | undefined;
};

/** Result of select_object_content. */
export type SelectObjectContentResult = {
  payload?: Record<string, unknown>;
};

/** Result of upload_part. */
export type UploadPartResult = {
  serverSideEncryption?: string | undefined;
  eTag?: string | undefined;
  checksumCrc32?: string | undefined;
  checksumCrc32C?: string | undefined;
  checksumCrc64Nvme?: string | undefined;
  checksumSha1?: string | undefined;
  checksumSha256?: string | undefined;
  sseCustomerAlgorithm?: string | undefined;
  sseCustomerKeyMd5?: string | undefined;
  ssekmsKeyId?: string | undefined;
  bucketKeyEnabled?: boolean | undefined;
  requestCharged?: string | undefined;
};

/** Result of upload_part_copy. */
export type UploadPartCopyResult = {
  copySourceVersionId?: string | undefined;
  copyPartResult?: Record<string, unknown>;
  serverSideEncryption?: string | undefined;
  sseCustomerAlgorithm?: string | undefined;
  sseCustomerKeyMd5?: string | undefined;
  ssekmsKeyId?: string | undefined;
  bucketKeyEnabled?: boolean | undefined;
  requestCharged?: string | undefined;
};


// ---------------------------------------------------------------------------
// Additional functions (auto-generated)
// ---------------------------------------------------------------------------

/** Fetch an S3 object and return the full response. */
export async function getObject(bucket: string, key: string, versionId?: string | undefined, regionName?: string | undefined): Promise<Record<string, unknown>> {
  try {
    // TODO: implement get_object
    throw new Error("get_object not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_object failed");
  }
}

/** Stream a newline-delimited JSON (JSONL) file from S3 line by line. */
export async function readJsonl(bucket: string, key: string, regionName?: string | undefined): Promise<Iterator[Any]> {
  try {
    // TODO: implement read_jsonl
    throw new Error("read_jsonl not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "read_jsonl failed");
  }
}

/** List all versions of objects in a versioned S3 bucket. */
export async function listObjectVersions(bucket: string, prefix: string, regionName?: string | undefined): Promise<S3ObjectVersion[]> {
  try {
    // TODO: implement list_object_versions
    throw new Error("list_object_versions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_object_versions failed");
  }
}

/** Upload a file-like object to S3 using managed transfer. */
export async function uploadFileobj(bucket: string, key: string, fileobj: IO[bytes], contentType?: string | undefined, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement upload_fileobj
    throw new Error("upload_fileobj not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "upload_fileobj failed");
  }
}

/** Abort multipart upload. */
export async function abortMultipartUpload(bucket: string, key: string, uploadId: string): Promise<AbortMultipartUploadResult> {
  try {
    // TODO: implement abort_multipart_upload
    throw new Error("abort_multipart_upload not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "abort_multipart_upload failed");
  }
}

/** Complete multipart upload. */
export async function completeMultipartUpload(bucket: string, key: string, uploadId: string): Promise<CompleteMultipartUploadResult> {
  try {
    // TODO: implement complete_multipart_upload
    throw new Error("complete_multipart_upload not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "complete_multipart_upload failed");
  }
}

/** Create bucket. */
export async function createBucket(bucket: string): Promise<CreateBucketResult> {
  try {
    // TODO: implement create_bucket
    throw new Error("create_bucket not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_bucket failed");
  }
}

/** Create bucket metadata configuration. */
export async function createBucketMetadataConfiguration(bucket: string, metadataConfiguration: Record<string, unknown>): Promise<void> {
  try {
    // TODO: implement create_bucket_metadata_configuration
    throw new Error("create_bucket_metadata_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_bucket_metadata_configuration failed");
  }
}

/** Create bucket metadata table configuration. */
export async function createBucketMetadataTableConfiguration(bucket: string, metadataTableConfiguration: Record<string, unknown>): Promise<void> {
  try {
    // TODO: implement create_bucket_metadata_table_configuration
    throw new Error("create_bucket_metadata_table_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_bucket_metadata_table_configuration failed");
  }
}

/** Create multipart upload. */
export async function createMultipartUpload(bucket: string, key: string): Promise<CreateMultipartUploadResult> {
  try {
    // TODO: implement create_multipart_upload
    throw new Error("create_multipart_upload not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_multipart_upload failed");
  }
}

/** Create session. */
export async function createSession(bucket: string): Promise<CreateSessionResult> {
  try {
    // TODO: implement create_session
    throw new Error("create_session not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_session failed");
  }
}

/** Delete bucket. */
export async function deleteBucket(bucket: string): Promise<void> {
  try {
    // TODO: implement delete_bucket
    throw new Error("delete_bucket not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_bucket failed");
  }
}

/** Delete bucket analytics configuration. */
export async function deleteBucketAnalyticsConfiguration(bucket: string, id: string): Promise<void> {
  try {
    // TODO: implement delete_bucket_analytics_configuration
    throw new Error("delete_bucket_analytics_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_bucket_analytics_configuration failed");
  }
}

/** Delete bucket cors. */
export async function deleteBucketCors(bucket: string): Promise<void> {
  try {
    // TODO: implement delete_bucket_cors
    throw new Error("delete_bucket_cors not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_bucket_cors failed");
  }
}

/** Delete bucket encryption. */
export async function deleteBucketEncryption(bucket: string): Promise<void> {
  try {
    // TODO: implement delete_bucket_encryption
    throw new Error("delete_bucket_encryption not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_bucket_encryption failed");
  }
}

/** Delete bucket intelligent tiering configuration. */
export async function deleteBucketIntelligentTieringConfiguration(bucket: string, id: string): Promise<void> {
  try {
    // TODO: implement delete_bucket_intelligent_tiering_configuration
    throw new Error("delete_bucket_intelligent_tiering_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_bucket_intelligent_tiering_configuration failed");
  }
}

/** Delete bucket inventory configuration. */
export async function deleteBucketInventoryConfiguration(bucket: string, id: string): Promise<void> {
  try {
    // TODO: implement delete_bucket_inventory_configuration
    throw new Error("delete_bucket_inventory_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_bucket_inventory_configuration failed");
  }
}

/** Delete bucket lifecycle. */
export async function deleteBucketLifecycle(bucket: string): Promise<void> {
  try {
    // TODO: implement delete_bucket_lifecycle
    throw new Error("delete_bucket_lifecycle not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_bucket_lifecycle failed");
  }
}

/** Delete bucket metadata configuration. */
export async function deleteBucketMetadataConfiguration(bucket: string): Promise<void> {
  try {
    // TODO: implement delete_bucket_metadata_configuration
    throw new Error("delete_bucket_metadata_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_bucket_metadata_configuration failed");
  }
}

/** Delete bucket metadata table configuration. */
export async function deleteBucketMetadataTableConfiguration(bucket: string): Promise<void> {
  try {
    // TODO: implement delete_bucket_metadata_table_configuration
    throw new Error("delete_bucket_metadata_table_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_bucket_metadata_table_configuration failed");
  }
}

/** Delete bucket metrics configuration. */
export async function deleteBucketMetricsConfiguration(bucket: string, id: string): Promise<void> {
  try {
    // TODO: implement delete_bucket_metrics_configuration
    throw new Error("delete_bucket_metrics_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_bucket_metrics_configuration failed");
  }
}

/** Delete bucket ownership controls. */
export async function deleteBucketOwnershipControls(bucket: string): Promise<void> {
  try {
    // TODO: implement delete_bucket_ownership_controls
    throw new Error("delete_bucket_ownership_controls not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_bucket_ownership_controls failed");
  }
}

/** Delete bucket policy. */
export async function deleteBucketPolicy(bucket: string): Promise<void> {
  try {
    // TODO: implement delete_bucket_policy
    throw new Error("delete_bucket_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_bucket_policy failed");
  }
}

/** Delete bucket replication. */
export async function deleteBucketReplication(bucket: string): Promise<void> {
  try {
    // TODO: implement delete_bucket_replication
    throw new Error("delete_bucket_replication not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_bucket_replication failed");
  }
}

/** Delete bucket tagging. */
export async function deleteBucketTagging(bucket: string): Promise<void> {
  try {
    // TODO: implement delete_bucket_tagging
    throw new Error("delete_bucket_tagging not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_bucket_tagging failed");
  }
}

/** Delete bucket website. */
export async function deleteBucketWebsite(bucket: string): Promise<void> {
  try {
    // TODO: implement delete_bucket_website
    throw new Error("delete_bucket_website not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_bucket_website failed");
  }
}

/** Delete object tagging. */
export async function deleteObjectTagging(bucket: string, key: string): Promise<DeleteObjectTaggingResult> {
  try {
    // TODO: implement delete_object_tagging
    throw new Error("delete_object_tagging not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_object_tagging failed");
  }
}

/** Delete objects. */
export async function deleteObjects(bucket: string, delete: Record<string, unknown>): Promise<DeleteObjectsResult> {
  try {
    // TODO: implement delete_objects
    throw new Error("delete_objects not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_objects failed");
  }
}

/** Delete public access block. */
export async function deletePublicAccessBlock(bucket: string): Promise<void> {
  try {
    // TODO: implement delete_public_access_block
    throw new Error("delete_public_access_block not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_public_access_block failed");
  }
}

/** Get bucket accelerate configuration. */
export async function getBucketAccelerateConfiguration(bucket: string): Promise<GetBucketAccelerateConfigurationResult> {
  try {
    // TODO: implement get_bucket_accelerate_configuration
    throw new Error("get_bucket_accelerate_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_bucket_accelerate_configuration failed");
  }
}

/** Get bucket acl. */
export async function getBucketAcl(bucket: string): Promise<GetBucketAclResult> {
  try {
    // TODO: implement get_bucket_acl
    throw new Error("get_bucket_acl not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_bucket_acl failed");
  }
}

/** Get bucket analytics configuration. */
export async function getBucketAnalyticsConfiguration(bucket: string, id: string): Promise<GetBucketAnalyticsConfigurationResult> {
  try {
    // TODO: implement get_bucket_analytics_configuration
    throw new Error("get_bucket_analytics_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_bucket_analytics_configuration failed");
  }
}

/** Get bucket cors. */
export async function getBucketCors(bucket: string): Promise<GetBucketCorsResult> {
  try {
    // TODO: implement get_bucket_cors
    throw new Error("get_bucket_cors not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_bucket_cors failed");
  }
}

/** Get bucket encryption. */
export async function getBucketEncryption(bucket: string): Promise<GetBucketEncryptionResult> {
  try {
    // TODO: implement get_bucket_encryption
    throw new Error("get_bucket_encryption not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_bucket_encryption failed");
  }
}

/** Get bucket intelligent tiering configuration. */
export async function getBucketIntelligentTieringConfiguration(bucket: string, id: string): Promise<GetBucketIntelligentTieringConfigurationResult> {
  try {
    // TODO: implement get_bucket_intelligent_tiering_configuration
    throw new Error("get_bucket_intelligent_tiering_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_bucket_intelligent_tiering_configuration failed");
  }
}

/** Get bucket inventory configuration. */
export async function getBucketInventoryConfiguration(bucket: string, id: string): Promise<GetBucketInventoryConfigurationResult> {
  try {
    // TODO: implement get_bucket_inventory_configuration
    throw new Error("get_bucket_inventory_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_bucket_inventory_configuration failed");
  }
}

/** Get bucket lifecycle. */
export async function getBucketLifecycle(bucket: string): Promise<GetBucketLifecycleResult> {
  try {
    // TODO: implement get_bucket_lifecycle
    throw new Error("get_bucket_lifecycle not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_bucket_lifecycle failed");
  }
}

/** Get bucket lifecycle configuration. */
export async function getBucketLifecycleConfiguration(bucket: string): Promise<GetBucketLifecycleConfigurationResult> {
  try {
    // TODO: implement get_bucket_lifecycle_configuration
    throw new Error("get_bucket_lifecycle_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_bucket_lifecycle_configuration failed");
  }
}

/** Get bucket location. */
export async function getBucketLocation(bucket: string): Promise<GetBucketLocationResult> {
  try {
    // TODO: implement get_bucket_location
    throw new Error("get_bucket_location not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_bucket_location failed");
  }
}

/** Get bucket logging. */
export async function getBucketLogging(bucket: string): Promise<GetBucketLoggingResult> {
  try {
    // TODO: implement get_bucket_logging
    throw new Error("get_bucket_logging not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_bucket_logging failed");
  }
}

/** Get bucket metadata configuration. */
export async function getBucketMetadataConfiguration(bucket: string): Promise<GetBucketMetadataConfigurationResult> {
  try {
    // TODO: implement get_bucket_metadata_configuration
    throw new Error("get_bucket_metadata_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_bucket_metadata_configuration failed");
  }
}

/** Get bucket metadata table configuration. */
export async function getBucketMetadataTableConfiguration(bucket: string): Promise<GetBucketMetadataTableConfigurationResult> {
  try {
    // TODO: implement get_bucket_metadata_table_configuration
    throw new Error("get_bucket_metadata_table_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_bucket_metadata_table_configuration failed");
  }
}

/** Get bucket metrics configuration. */
export async function getBucketMetricsConfiguration(bucket: string, id: string): Promise<GetBucketMetricsConfigurationResult> {
  try {
    // TODO: implement get_bucket_metrics_configuration
    throw new Error("get_bucket_metrics_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_bucket_metrics_configuration failed");
  }
}

/** Get bucket notification. */
export async function getBucketNotification(bucket: string): Promise<GetBucketNotificationResult> {
  try {
    // TODO: implement get_bucket_notification
    throw new Error("get_bucket_notification not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_bucket_notification failed");
  }
}

/** Get bucket notification configuration. */
export async function getBucketNotificationConfiguration(bucket: string): Promise<GetBucketNotificationConfigurationResult> {
  try {
    // TODO: implement get_bucket_notification_configuration
    throw new Error("get_bucket_notification_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_bucket_notification_configuration failed");
  }
}

/** Get bucket ownership controls. */
export async function getBucketOwnershipControls(bucket: string): Promise<GetBucketOwnershipControlsResult> {
  try {
    // TODO: implement get_bucket_ownership_controls
    throw new Error("get_bucket_ownership_controls not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_bucket_ownership_controls failed");
  }
}

/** Get bucket policy. */
export async function getBucketPolicy(bucket: string): Promise<GetBucketPolicyResult> {
  try {
    // TODO: implement get_bucket_policy
    throw new Error("get_bucket_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_bucket_policy failed");
  }
}

/** Get bucket policy status. */
export async function getBucketPolicyStatus(bucket: string): Promise<GetBucketPolicyStatusResult> {
  try {
    // TODO: implement get_bucket_policy_status
    throw new Error("get_bucket_policy_status not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_bucket_policy_status failed");
  }
}

/** Get bucket replication. */
export async function getBucketReplication(bucket: string): Promise<GetBucketReplicationResult> {
  try {
    // TODO: implement get_bucket_replication
    throw new Error("get_bucket_replication not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_bucket_replication failed");
  }
}

/** Get bucket request payment. */
export async function getBucketRequestPayment(bucket: string): Promise<GetBucketRequestPaymentResult> {
  try {
    // TODO: implement get_bucket_request_payment
    throw new Error("get_bucket_request_payment not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_bucket_request_payment failed");
  }
}

/** Get bucket tagging. */
export async function getBucketTagging(bucket: string): Promise<GetBucketTaggingResult> {
  try {
    // TODO: implement get_bucket_tagging
    throw new Error("get_bucket_tagging not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_bucket_tagging failed");
  }
}

/** Get bucket versioning. */
export async function getBucketVersioning(bucket: string): Promise<GetBucketVersioningResult> {
  try {
    // TODO: implement get_bucket_versioning
    throw new Error("get_bucket_versioning not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_bucket_versioning failed");
  }
}

/** Get bucket website. */
export async function getBucketWebsite(bucket: string): Promise<GetBucketWebsiteResult> {
  try {
    // TODO: implement get_bucket_website
    throw new Error("get_bucket_website not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_bucket_website failed");
  }
}

/** Get object acl. */
export async function getObjectAcl(bucket: string, key: string): Promise<GetObjectAclResult> {
  try {
    // TODO: implement get_object_acl
    throw new Error("get_object_acl not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_object_acl failed");
  }
}

/** Get object attributes. */
export async function getObjectAttributes(bucket: string, key: string, objectAttributes: string[]): Promise<GetObjectAttributesResult> {
  try {
    // TODO: implement get_object_attributes
    throw new Error("get_object_attributes not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_object_attributes failed");
  }
}

/** Get object legal hold. */
export async function getObjectLegalHold(bucket: string, key: string): Promise<GetObjectLegalHoldResult> {
  try {
    // TODO: implement get_object_legal_hold
    throw new Error("get_object_legal_hold not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_object_legal_hold failed");
  }
}

/** Get object lock configuration. */
export async function getObjectLockConfiguration(bucket: string): Promise<GetObjectLockConfigurationResult> {
  try {
    // TODO: implement get_object_lock_configuration
    throw new Error("get_object_lock_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_object_lock_configuration failed");
  }
}

/** Get object retention. */
export async function getObjectRetention(bucket: string, key: string): Promise<GetObjectRetentionResult> {
  try {
    // TODO: implement get_object_retention
    throw new Error("get_object_retention not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_object_retention failed");
  }
}

/** Get object tagging. */
export async function getObjectTagging(bucket: string, key: string): Promise<GetObjectTaggingResult> {
  try {
    // TODO: implement get_object_tagging
    throw new Error("get_object_tagging not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_object_tagging failed");
  }
}

/** Get object torrent. */
export async function getObjectTorrent(bucket: string, key: string): Promise<GetObjectTorrentResult> {
  try {
    // TODO: implement get_object_torrent
    throw new Error("get_object_torrent not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_object_torrent failed");
  }
}

/** Get public access block. */
export async function getPublicAccessBlock(bucket: string): Promise<GetPublicAccessBlockResult> {
  try {
    // TODO: implement get_public_access_block
    throw new Error("get_public_access_block not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_public_access_block failed");
  }
}

/** Head bucket. */
export async function headBucket(bucket: string): Promise<HeadBucketResult> {
  try {
    // TODO: implement head_bucket
    throw new Error("head_bucket not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "head_bucket failed");
  }
}

/** Head object. */
export async function headObject(bucket: string, key: string): Promise<HeadObjectResult> {
  try {
    // TODO: implement head_object
    throw new Error("head_object not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "head_object failed");
  }
}

/** List bucket analytics configurations. */
export async function listBucketAnalyticsConfigurations(bucket: string): Promise<ListBucketAnalyticsConfigurationsResult> {
  try {
    // TODO: implement list_bucket_analytics_configurations
    throw new Error("list_bucket_analytics_configurations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_bucket_analytics_configurations failed");
  }
}

/** List bucket intelligent tiering configurations. */
export async function listBucketIntelligentTieringConfigurations(bucket: string): Promise<ListBucketIntelligentTieringConfigurationsResult> {
  try {
    // TODO: implement list_bucket_intelligent_tiering_configurations
    throw new Error("list_bucket_intelligent_tiering_configurations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_bucket_intelligent_tiering_configurations failed");
  }
}

/** List bucket inventory configurations. */
export async function listBucketInventoryConfigurations(bucket: string): Promise<ListBucketInventoryConfigurationsResult> {
  try {
    // TODO: implement list_bucket_inventory_configurations
    throw new Error("list_bucket_inventory_configurations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_bucket_inventory_configurations failed");
  }
}

/** List bucket metrics configurations. */
export async function listBucketMetricsConfigurations(bucket: string): Promise<ListBucketMetricsConfigurationsResult> {
  try {
    // TODO: implement list_bucket_metrics_configurations
    throw new Error("list_bucket_metrics_configurations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_bucket_metrics_configurations failed");
  }
}

/** List buckets. */
export async function listBuckets(): Promise<ListBucketsResult> {
  try {
    // TODO: implement list_buckets
    throw new Error("list_buckets not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_buckets failed");
  }
}

/** List directory buckets. */
export async function listDirectoryBuckets(): Promise<ListDirectoryBucketsResult> {
  try {
    // TODO: implement list_directory_buckets
    throw new Error("list_directory_buckets not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_directory_buckets failed");
  }
}

/** List multipart uploads. */
export async function listMultipartUploads(bucket: string): Promise<ListMultipartUploadsResult> {
  try {
    // TODO: implement list_multipart_uploads
    throw new Error("list_multipart_uploads not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_multipart_uploads failed");
  }
}

/** List objects v2. */
export async function listObjectsV2(bucket: string): Promise<ListObjectsV2Result> {
  try {
    // TODO: implement list_objects_v2
    throw new Error("list_objects_v2 not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_objects_v2 failed");
  }
}

/** List parts. */
export async function listParts(bucket: string, key: string, uploadId: string): Promise<ListPartsResult> {
  try {
    // TODO: implement list_parts
    throw new Error("list_parts not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_parts failed");
  }
}

/** Put bucket accelerate configuration. */
export async function putBucketAccelerateConfiguration(bucket: string, accelerateConfiguration: Record<string, unknown>): Promise<void> {
  try {
    // TODO: implement put_bucket_accelerate_configuration
    throw new Error("put_bucket_accelerate_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_bucket_accelerate_configuration failed");
  }
}

/** Put bucket acl. */
export async function putBucketAcl(bucket: string): Promise<void> {
  try {
    // TODO: implement put_bucket_acl
    throw new Error("put_bucket_acl not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_bucket_acl failed");
  }
}

/** Put bucket analytics configuration. */
export async function putBucketAnalyticsConfiguration(bucket: string, id: string, analyticsConfiguration: Record<string, unknown>): Promise<void> {
  try {
    // TODO: implement put_bucket_analytics_configuration
    throw new Error("put_bucket_analytics_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_bucket_analytics_configuration failed");
  }
}

/** Put bucket cors. */
export async function putBucketCors(bucket: string, corsConfiguration: Record<string, unknown>): Promise<void> {
  try {
    // TODO: implement put_bucket_cors
    throw new Error("put_bucket_cors not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_bucket_cors failed");
  }
}

/** Put bucket encryption. */
export async function putBucketEncryption(bucket: string, serverSideEncryptionConfiguration: Record<string, unknown>): Promise<void> {
  try {
    // TODO: implement put_bucket_encryption
    throw new Error("put_bucket_encryption not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_bucket_encryption failed");
  }
}

/** Put bucket intelligent tiering configuration. */
export async function putBucketIntelligentTieringConfiguration(bucket: string, id: string, intelligentTieringConfiguration: Record<string, unknown>): Promise<void> {
  try {
    // TODO: implement put_bucket_intelligent_tiering_configuration
    throw new Error("put_bucket_intelligent_tiering_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_bucket_intelligent_tiering_configuration failed");
  }
}

/** Put bucket inventory configuration. */
export async function putBucketInventoryConfiguration(bucket: string, id: string, inventoryConfiguration: Record<string, unknown>): Promise<void> {
  try {
    // TODO: implement put_bucket_inventory_configuration
    throw new Error("put_bucket_inventory_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_bucket_inventory_configuration failed");
  }
}

/** Put bucket lifecycle. */
export async function putBucketLifecycle(bucket: string): Promise<void> {
  try {
    // TODO: implement put_bucket_lifecycle
    throw new Error("put_bucket_lifecycle not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_bucket_lifecycle failed");
  }
}

/** Put bucket lifecycle configuration. */
export async function putBucketLifecycleConfiguration(bucket: string): Promise<PutBucketLifecycleConfigurationResult> {
  try {
    // TODO: implement put_bucket_lifecycle_configuration
    throw new Error("put_bucket_lifecycle_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_bucket_lifecycle_configuration failed");
  }
}

/** Put bucket logging. */
export async function putBucketLogging(bucket: string, bucketLoggingStatus: Record<string, unknown>): Promise<void> {
  try {
    // TODO: implement put_bucket_logging
    throw new Error("put_bucket_logging not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_bucket_logging failed");
  }
}

/** Put bucket metrics configuration. */
export async function putBucketMetricsConfiguration(bucket: string, id: string, metricsConfiguration: Record<string, unknown>): Promise<void> {
  try {
    // TODO: implement put_bucket_metrics_configuration
    throw new Error("put_bucket_metrics_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_bucket_metrics_configuration failed");
  }
}

/** Put bucket notification. */
export async function putBucketNotification(bucket: string, notificationConfiguration: Record<string, unknown>): Promise<void> {
  try {
    // TODO: implement put_bucket_notification
    throw new Error("put_bucket_notification not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_bucket_notification failed");
  }
}

/** Put bucket notification configuration. */
export async function putBucketNotificationConfiguration(bucket: string, notificationConfiguration: Record<string, unknown>): Promise<void> {
  try {
    // TODO: implement put_bucket_notification_configuration
    throw new Error("put_bucket_notification_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_bucket_notification_configuration failed");
  }
}

/** Put bucket ownership controls. */
export async function putBucketOwnershipControls(bucket: string, ownershipControls: Record<string, unknown>): Promise<void> {
  try {
    // TODO: implement put_bucket_ownership_controls
    throw new Error("put_bucket_ownership_controls not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_bucket_ownership_controls failed");
  }
}

/** Put bucket policy. */
export async function putBucketPolicy(bucket: string, policy: string): Promise<void> {
  try {
    // TODO: implement put_bucket_policy
    throw new Error("put_bucket_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_bucket_policy failed");
  }
}

/** Put bucket replication. */
export async function putBucketReplication(bucket: string, replicationConfiguration: Record<string, unknown>): Promise<void> {
  try {
    // TODO: implement put_bucket_replication
    throw new Error("put_bucket_replication not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_bucket_replication failed");
  }
}

/** Put bucket request payment. */
export async function putBucketRequestPayment(bucket: string, requestPaymentConfiguration: Record<string, unknown>): Promise<void> {
  try {
    // TODO: implement put_bucket_request_payment
    throw new Error("put_bucket_request_payment not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_bucket_request_payment failed");
  }
}

/** Put bucket tagging. */
export async function putBucketTagging(bucket: string, tagging: Record<string, unknown>): Promise<void> {
  try {
    // TODO: implement put_bucket_tagging
    throw new Error("put_bucket_tagging not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_bucket_tagging failed");
  }
}

/** Put bucket versioning. */
export async function putBucketVersioning(bucket: string, versioningConfiguration: Record<string, unknown>): Promise<void> {
  try {
    // TODO: implement put_bucket_versioning
    throw new Error("put_bucket_versioning not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_bucket_versioning failed");
  }
}

/** Put bucket website. */
export async function putBucketWebsite(bucket: string, websiteConfiguration: Record<string, unknown>): Promise<void> {
  try {
    // TODO: implement put_bucket_website
    throw new Error("put_bucket_website not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_bucket_website failed");
  }
}

/** Put object. */
export async function putObject(bucket: string, key: string): Promise<PutObjectResult> {
  try {
    // TODO: implement put_object
    throw new Error("put_object not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_object failed");
  }
}

/** Put object acl. */
export async function putObjectAcl(bucket: string, key: string): Promise<PutObjectAclResult> {
  try {
    // TODO: implement put_object_acl
    throw new Error("put_object_acl not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_object_acl failed");
  }
}

/** Put object legal hold. */
export async function putObjectLegalHold(bucket: string, key: string): Promise<PutObjectLegalHoldResult> {
  try {
    // TODO: implement put_object_legal_hold
    throw new Error("put_object_legal_hold not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_object_legal_hold failed");
  }
}

/** Put object lock configuration. */
export async function putObjectLockConfiguration(bucket: string): Promise<PutObjectLockConfigurationResult> {
  try {
    // TODO: implement put_object_lock_configuration
    throw new Error("put_object_lock_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_object_lock_configuration failed");
  }
}

/** Put object retention. */
export async function putObjectRetention(bucket: string, key: string): Promise<PutObjectRetentionResult> {
  try {
    // TODO: implement put_object_retention
    throw new Error("put_object_retention not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_object_retention failed");
  }
}

/** Put object tagging. */
export async function putObjectTagging(bucket: string, key: string, tagging: Record<string, unknown>): Promise<PutObjectTaggingResult> {
  try {
    // TODO: implement put_object_tagging
    throw new Error("put_object_tagging not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_object_tagging failed");
  }
}

/** Put public access block. */
export async function putPublicAccessBlock(bucket: string, publicAccessBlockConfiguration: Record<string, unknown>): Promise<void> {
  try {
    // TODO: implement put_public_access_block
    throw new Error("put_public_access_block not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_public_access_block failed");
  }
}

/** Rename object. */
export async function renameObject(bucket: string, key: string, renameSource: string): Promise<void> {
  try {
    // TODO: implement rename_object
    throw new Error("rename_object not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "rename_object failed");
  }
}

/** Restore object. */
export async function restoreObject(bucket: string, key: string): Promise<RestoreObjectResult> {
  try {
    // TODO: implement restore_object
    throw new Error("restore_object not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "restore_object failed");
  }
}

/** Select object content. */
export async function selectObjectContent(bucket: string, key: string, expression: string, expressionType: string, inputSerialization: Record<string, unknown>, outputSerialization: Record<string, unknown>): Promise<SelectObjectContentResult> {
  try {
    // TODO: implement select_object_content
    throw new Error("select_object_content not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "select_object_content failed");
  }
}

/** Update bucket metadata inventory table configuration. */
export async function updateBucketMetadataInventoryTableConfiguration(bucket: string, inventoryTableConfiguration: Record<string, unknown>): Promise<void> {
  try {
    // TODO: implement update_bucket_metadata_inventory_table_configuration
    throw new Error("update_bucket_metadata_inventory_table_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_bucket_metadata_inventory_table_configuration failed");
  }
}

/** Update bucket metadata journal table configuration. */
export async function updateBucketMetadataJournalTableConfiguration(bucket: string, journalTableConfiguration: Record<string, unknown>): Promise<void> {
  try {
    // TODO: implement update_bucket_metadata_journal_table_configuration
    throw new Error("update_bucket_metadata_journal_table_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_bucket_metadata_journal_table_configuration failed");
  }
}

/** Upload part. */
export async function uploadPart(bucket: string, key: string, partNumber: number, uploadId: string): Promise<UploadPartResult> {
  try {
    // TODO: implement upload_part
    throw new Error("upload_part not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "upload_part failed");
  }
}

/** Upload part copy. */
export async function uploadPartCopy(bucket: string, copySource: string, key: string, partNumber: number, uploadId: string): Promise<UploadPartCopyResult> {
  try {
    // TODO: implement upload_part_copy
    throw new Error("upload_part_copy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "upload_part_copy failed");
  }
}

/** Write get object response. */
export async function writeGetObjectResponse(requestRoute: string, requestToken: string): Promise<void> {
  try {
    // TODO: implement write_get_object_response
    throw new Error("write_get_object_response not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "write_get_object_response failed");
  }
}
