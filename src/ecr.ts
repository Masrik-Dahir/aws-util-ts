/**
 * aws-util/ecr — High-level Amazon ECR utilities.
 *
 * Provides typed, ergonomic wrappers around the AWS SDK v3 ECR client for
 * common operations: authorization tokens, repository management, image
 * listing, and finding the latest image tag.
 *
 * All functions obtain an ECRClient via {@link getClient} and wrap errors
 * through {@link wrapAwsError}.
 *
 * @module
 */

import { z } from "zod";
import {
  ECRClient,
  GetAuthorizationTokenCommand,
  DescribeRepositoriesCommand,
  CreateRepositoryCommand,
  ListImagesCommand,
  DescribeImagesCommand,
} from "@aws-sdk/client-ecr";
import { getClient } from "./client.js";
import { wrapAwsError } from "./exceptions.js";

// ---------------------------------------------------------------------------
// Zod schemas & inferred types
// ---------------------------------------------------------------------------

/** Schema for an ECR repository. */
export const ECRRepositorySchema = z.object({
  repositoryName: z.string(),
  repositoryArn: z.string(),
  repositoryUri: z.string(),
  registryId: z.string().optional(),
  createdAt: z.date().optional(),
});
/** Metadata for an ECR repository. */
export type ECRRepository = z.infer<typeof ECRRepositorySchema>;

/** Schema for an ECR image. */
export const ECRImageSchema = z.object({
  imageDigest: z.string(),
  imageTags: z.array(z.string()).optional(),
  imagePushedAt: z.date().optional(),
  imageSizeInBytes: z.number().optional(),
});
/** Metadata for an image stored in an ECR repository. */
export type ECRImage = z.infer<typeof ECRImageSchema>;

/** Schema for an ECR authorization token. */
export const ECRAuthTokenSchema = z.object({
  authorizationToken: z.string(),
  proxyEndpoint: z.string(),
  expiresAt: z.date().optional(),
});
/** Docker registry authorization token from ECR. */
export type ECRAuthToken = z.infer<typeof ECRAuthTokenSchema>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Get a cached ECRClient for the given region.
 */
function ecr(region?: string): ECRClient {
  return getClient(ECRClient, region);
}

// ---------------------------------------------------------------------------
// Authorization
// ---------------------------------------------------------------------------

/**
 * Retrieve an ECR Docker authorization token.
 *
 * The returned token can be used with `docker login` to pull or push
 * images to the registry. The token is base64-encoded and contains
 * `AWS:<password>`.
 *
 * @param region - AWS region override.
 * @returns An {@link ECRAuthToken} with the encoded token and proxy endpoint.
 */
export async function getAuthToken(
  region?: string,
): Promise<ECRAuthToken> {
  try {
    const resp = await ecr(region).send(
      new GetAuthorizationTokenCommand({}),
    );
    const authData = resp.authorizationData;
    if (!authData || authData.length === 0) {
      throw new Error("No authorization data returned");
    }
    const auth = authData[0];
    return ECRAuthTokenSchema.parse({
      authorizationToken: auth.authorizationToken ?? "",
      proxyEndpoint: auth.proxyEndpoint ?? "",
      expiresAt: auth.expiresAt ?? undefined,
    });
  } catch (err) {
    throw wrapAwsError(err, "getAuthToken");
  }
}

// ---------------------------------------------------------------------------
// Repository operations
// ---------------------------------------------------------------------------

/**
 * List all ECR repositories in the account, auto-paginating.
 *
 * @param region - AWS region override.
 * @returns An array of {@link ECRRepository} objects.
 */
export async function listRepositories(
  region?: string,
): Promise<ECRRepository[]> {
  const repos: ECRRepository[] = [];
  let nextToken: string | undefined;

  try {
    do {
      const resp = await ecr(region).send(
        new DescribeRepositoriesCommand({ nextToken }),
      );

      for (const repo of resp.repositories ?? []) {
        repos.push(
          ECRRepositorySchema.parse({
            repositoryName: repo.repositoryName ?? "",
            repositoryArn: repo.repositoryArn ?? "",
            repositoryUri: repo.repositoryUri ?? "",
            registryId: repo.registryId ?? undefined,
            createdAt: repo.createdAt ?? undefined,
          }),
        );
      }

      nextToken = resp.nextToken;
    } while (nextToken);
  } catch (err) {
    throw wrapAwsError(err, "listRepositories");
  }

  return repos;
}

/**
 * Fetch metadata for a single ECR repository.
 *
 * @param repositoryName - Name of the repository.
 * @param region - AWS region override.
 * @returns The {@link ECRRepository}, or `null` if not found.
 */
export async function describeRepository(
  repositoryName: string,
  region?: string,
): Promise<ECRRepository | null> {
  try {
    const resp = await ecr(region).send(
      new DescribeRepositoriesCommand({
        repositoryNames: [repositoryName],
      }),
    );
    const repos = resp.repositories ?? [];
    if (repos.length === 0) {
      return null;
    }
    const repo = repos[0];
    return ECRRepositorySchema.parse({
      repositoryName: repo.repositoryName ?? "",
      repositoryArn: repo.repositoryArn ?? "",
      repositoryUri: repo.repositoryUri ?? "",
      registryId: repo.registryId ?? undefined,
      createdAt: repo.createdAt ?? undefined,
    });
  } catch (err: unknown) {
    // Treat RepositoryNotFoundException as null
    const record = err as Record<string, unknown>;
    const name =
      typeof record["name"] === "string" ? record["name"] : "";
    if (name === "RepositoryNotFoundException") {
      return null;
    }
    throw wrapAwsError(
      err,
      `describeRepository ${repositoryName}`,
    );
  }
}

/**
 * Get an ECR repository, creating it if it does not exist.
 *
 * @param repositoryName - Repository name.
 * @param imageScanOnPush - Enable automated vulnerability scanning on push.
 * @param imageTagMutability - `"MUTABLE"` (default) or `"IMMUTABLE"`.
 * @param region - AWS region override.
 * @returns The {@link ECRRepository} (existing or newly created).
 */
export async function ensureRepository(
  repositoryName: string,
  imageScanOnPush?: boolean,
  imageTagMutability?: "MUTABLE" | "IMMUTABLE",
  region?: string,
): Promise<ECRRepository> {
  const existing = await describeRepository(repositoryName, region);
  if (existing !== null) {
    return existing;
  }

  try {
    const resp = await ecr(region).send(
      new CreateRepositoryCommand({
        repositoryName,
        imageTagMutability: imageTagMutability ?? "MUTABLE",
        imageScanningConfiguration: {
          scanOnPush: imageScanOnPush ?? false,
        },
      }),
    );
    const repo = resp.repository;
    return ECRRepositorySchema.parse({
      repositoryName: repo?.repositoryName ?? repositoryName,
      repositoryArn: repo?.repositoryArn ?? "",
      repositoryUri: repo?.repositoryUri ?? "",
      registryId: repo?.registryId ?? undefined,
      createdAt: repo?.createdAt ?? undefined,
    });
  } catch (err) {
    throw wrapAwsError(
      err,
      `ensureRepository ${repositoryName}`,
    );
  }
}

// ---------------------------------------------------------------------------
// Image operations
// ---------------------------------------------------------------------------

/**
 * List all images in an ECR repository, auto-paginating.
 *
 * Uses `ListImages` to collect image IDs then `DescribeImages` to get
 * full metadata in batches of 100.
 *
 * @param repositoryName - Repository name.
 * @param region - AWS region override.
 * @returns An array of {@link ECRImage} objects.
 */
export async function listImages(
  repositoryName: string,
  region?: string,
): Promise<ECRImage[]> {
  // First, collect all image IDs via ListImages (paginated)
  const imageIds: Array<{
    imageDigest?: string;
    imageTag?: string;
  }> = [];
  let nextToken: string | undefined;

  try {
    do {
      const resp = await ecr(region).send(
        new ListImagesCommand({
          repositoryName,
          nextToken,
        }),
      );
      for (const id of resp.imageIds ?? []) {
        imageIds.push({
          imageDigest: id.imageDigest,
          imageTag: id.imageTag,
        });
      }
      nextToken = resp.nextToken;
    } while (nextToken);
  } catch (err) {
    throw wrapAwsError(
      err,
      `listImages ${repositoryName}`,
    );
  }

  if (imageIds.length === 0) {
    return [];
  }

  // Describe images in batches of 100 for full metadata
  const images: ECRImage[] = [];
  const batchSize = 100;

  try {
    for (let i = 0; i < imageIds.length; i += batchSize) {
      const batch = imageIds.slice(i, i + batchSize);
      const resp = await ecr(region).send(
        new DescribeImagesCommand({
          repositoryName,
          imageIds: batch.map((id) => ({
            imageDigest: id.imageDigest,
            imageTag: id.imageTag,
          })),
        }),
      );
      for (const detail of resp.imageDetails ?? []) {
        images.push(
          ECRImageSchema.parse({
            imageDigest: detail.imageDigest ?? "",
            imageTags: detail.imageTags ?? undefined,
            imagePushedAt: detail.imagePushedAt ?? undefined,
            imageSizeInBytes:
              detail.imageSizeInBytes ?? undefined,
          }),
        );
      }
    }
  } catch (err) {
    throw wrapAwsError(
      err,
      `listImages describeImages ${repositoryName}`,
    );
  }

  return images;
}

/**
 * Return the tag of the most recently pushed image in a repository.
 *
 * Compares `imagePushedAt` timestamps across all tagged images and
 * returns the first tag of the newest one.
 *
 * @param repositoryName - Repository name.
 * @param region - AWS region override.
 * @returns The most recent image tag, or `null` if no tagged images exist.
 */
export async function getLatestImageTag(
  repositoryName: string,
  region?: string,
): Promise<string | null> {
  const images = await listImages(repositoryName, region);

  // Filter to images that have tags and a push timestamp
  const tagged = images.filter(
    (img) =>
      img.imageTags &&
      img.imageTags.length > 0 &&
      img.imagePushedAt !== undefined,
  );

  if (tagged.length === 0) {
    return null;
  }

  // Sort by push date descending
  const sorted = [...tagged].sort((a, b) => {
    const aTime = a.imagePushedAt?.getTime() ?? 0;
    const bTime = b.imagePushedAt?.getTime() ?? 0;
    return bTime - aTime;
  });

  return sorted[0].imageTags?.[0] ?? null;
}

// ---------------------------------------------------------------------------
// Additional types (auto-generated)
// ---------------------------------------------------------------------------

/** Result of batch_check_layer_availability. */
export type BatchCheckLayerAvailabilityResult = {
  layers?: Record<string, unknown>[];
  failures?: Record<string, unknown>[];
};

/** Result of batch_delete_image. */
export type BatchDeleteImageResult = {
  imageIds?: Record<string, unknown>[];
  failures?: Record<string, unknown>[];
};

/** Result of batch_get_image. */
export type BatchGetImageResult = {
  images?: Record<string, unknown>[];
  failures?: Record<string, unknown>[];
};

/** Result of batch_get_repository_scanning_configuration. */
export type BatchGetRepositoryScanningConfigurationResult = {
  scanningConfigurations?: Record<string, unknown>[];
  failures?: Record<string, unknown>[];
};

/** Result of complete_layer_upload. */
export type CompleteLayerUploadResult = {
  registryId?: string | undefined;
  repositoryName?: string | undefined;
  uploadId?: string | undefined;
  layerDigest?: string | undefined;
};

/** Result of create_pull_through_cache_rule. */
export type CreatePullThroughCacheRuleResult = {
  ecrRepositoryPrefix?: string | undefined;
  upstreamRegistryUrl?: string | undefined;
  createdAt?: string | undefined;
  registryId?: string | undefined;
  upstreamRegistry?: string | undefined;
  credentialArn?: string | undefined;
  customRoleArn?: string | undefined;
  upstreamRepositoryPrefix?: string | undefined;
};

/** Result of create_repository. */
export type CreateRepositoryResult = {
  repository?: Record<string, unknown>;
};

/** Result of create_repository_creation_template. */
export type CreateRepositoryCreationTemplateResult = {
  registryId?: string | undefined;
  repositoryCreationTemplate?: Record<string, unknown>;
};

/** Result of delete_lifecycle_policy. */
export type DeleteLifecyclePolicyResult = {
  registryId?: string | undefined;
  repositoryName?: string | undefined;
  lifecyclePolicyText?: string | undefined;
  lastEvaluatedAt?: string | undefined;
};

/** Result of delete_pull_through_cache_rule. */
export type DeletePullThroughCacheRuleResult = {
  ecrRepositoryPrefix?: string | undefined;
  upstreamRegistryUrl?: string | undefined;
  createdAt?: string | undefined;
  registryId?: string | undefined;
  credentialArn?: string | undefined;
  customRoleArn?: string | undefined;
  upstreamRepositoryPrefix?: string | undefined;
};

/** Result of delete_registry_policy. */
export type DeleteRegistryPolicyResult = {
  registryId?: string | undefined;
  policyText?: string | undefined;
};

/** Result of delete_repository. */
export type DeleteRepositoryResult = {
  repository?: Record<string, unknown>;
};

/** Result of delete_repository_creation_template. */
export type DeleteRepositoryCreationTemplateResult = {
  registryId?: string | undefined;
  repositoryCreationTemplate?: Record<string, unknown>;
};

/** Result of delete_repository_policy. */
export type DeleteRepositoryPolicyResult = {
  registryId?: string | undefined;
  repositoryName?: string | undefined;
  policyText?: string | undefined;
};

/** Result of describe_image_replication_status. */
export type DescribeImageReplicationStatusResult = {
  repositoryName?: string | undefined;
  imageId?: Record<string, unknown>;
  replicationStatuses?: Record<string, unknown>[];
};

/** Result of describe_image_scan_findings. */
export type DescribeImageScanFindingsResult = {
  registryId?: string | undefined;
  repositoryName?: string | undefined;
  imageId?: Record<string, unknown>;
  imageScanStatus?: Record<string, unknown>;
  imageScanFindings?: Record<string, unknown>;
  nextToken?: string | undefined;
};

/** Result of describe_images. */
export type DescribeImagesResult = {
  imageDetails?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_pull_through_cache_rules. */
export type DescribePullThroughCacheRulesResult = {
  pullThroughCacheRules?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_registry. */
export type DescribeRegistryResult = {
  registryId?: string | undefined;
  replicationConfiguration?: Record<string, unknown>;
};

/** Result of describe_repositories. */
export type DescribeRepositoriesResult = {
  repositories?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_repository_creation_templates. */
export type DescribeRepositoryCreationTemplatesResult = {
  registryId?: string | undefined;
  repositoryCreationTemplates?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of get_account_setting. */
export type GetAccountSettingResult = {
  name?: string | undefined;
  value?: string | undefined;
};

/** Result of get_authorization_token. */
export type GetAuthorizationTokenResult = {
  authorizationData?: Record<string, unknown>[];
};

/** Result of get_download_url_for_layer. */
export type GetDownloadUrlForLayerResult = {
  downloadUrl?: string | undefined;
  layerDigest?: string | undefined;
};

/** Result of get_lifecycle_policy. */
export type GetLifecyclePolicyResult = {
  registryId?: string | undefined;
  repositoryName?: string | undefined;
  lifecyclePolicyText?: string | undefined;
  lastEvaluatedAt?: string | undefined;
};

/** Result of get_lifecycle_policy_preview. */
export type GetLifecyclePolicyPreviewResult = {
  registryId?: string | undefined;
  repositoryName?: string | undefined;
  lifecyclePolicyText?: string | undefined;
  status?: string | undefined;
  nextToken?: string | undefined;
  previewResults?: Record<string, unknown>[];
  summary?: Record<string, unknown>;
};

/** Result of get_registry_policy. */
export type GetRegistryPolicyResult = {
  registryId?: string | undefined;
  policyText?: string | undefined;
};

/** Result of get_registry_scanning_configuration. */
export type GetRegistryScanningConfigurationResult = {
  registryId?: string | undefined;
  scanningConfiguration?: Record<string, unknown>;
};

/** Result of get_repository_policy. */
export type GetRepositoryPolicyResult = {
  registryId?: string | undefined;
  repositoryName?: string | undefined;
  policyText?: string | undefined;
};

/** Result of initiate_layer_upload. */
export type InitiateLayerUploadResult = {
  uploadId?: string | undefined;
  partSize?: number | undefined;
};

/** Result of list_tags_for_resource. */
export type ListTagsForResourceResult = {
  tags?: Record<string, unknown>[];
};

/** Result of put_account_setting. */
export type PutAccountSettingResult = {
  name?: string | undefined;
  value?: string | undefined;
};

/** Result of put_image. */
export type PutImageResult = {
  image?: Record<string, unknown>;
};

/** Result of put_image_scanning_configuration. */
export type PutImageScanningConfigurationResult = {
  registryId?: string | undefined;
  repositoryName?: string | undefined;
  imageScanningConfiguration?: Record<string, unknown>;
};

/** Result of put_image_tag_mutability. */
export type PutImageTagMutabilityResult = {
  registryId?: string | undefined;
  repositoryName?: string | undefined;
  imageTagMutability?: string | undefined;
  imageTagMutabilityExclusionFilters?: Record<string, unknown>[];
};

/** Result of put_lifecycle_policy. */
export type PutLifecyclePolicyResult = {
  registryId?: string | undefined;
  repositoryName?: string | undefined;
  lifecyclePolicyText?: string | undefined;
};

/** Result of put_registry_policy. */
export type PutRegistryPolicyResult = {
  registryId?: string | undefined;
  policyText?: string | undefined;
};

/** Result of put_registry_scanning_configuration. */
export type PutRegistryScanningConfigurationResult = {
  registryScanningConfiguration?: Record<string, unknown>;
};

/** Result of put_replication_configuration. */
export type PutReplicationConfigurationResult = {
  replicationConfiguration?: Record<string, unknown>;
};

/** Result of set_repository_policy. */
export type SetRepositoryPolicyResult = {
  registryId?: string | undefined;
  repositoryName?: string | undefined;
  policyText?: string | undefined;
};

/** Result of start_image_scan. */
export type StartImageScanResult = {
  registryId?: string | undefined;
  repositoryName?: string | undefined;
  imageId?: Record<string, unknown>;
  imageScanStatus?: Record<string, unknown>;
};

/** Result of start_lifecycle_policy_preview. */
export type StartLifecyclePolicyPreviewResult = {
  registryId?: string | undefined;
  repositoryName?: string | undefined;
  lifecyclePolicyText?: string | undefined;
  status?: string | undefined;
};

/** Result of update_pull_through_cache_rule. */
export type UpdatePullThroughCacheRuleResult = {
  ecrRepositoryPrefix?: string | undefined;
  registryId?: string | undefined;
  updatedAt?: string | undefined;
  credentialArn?: string | undefined;
  customRoleArn?: string | undefined;
  upstreamRepositoryPrefix?: string | undefined;
};

/** Result of update_repository_creation_template. */
export type UpdateRepositoryCreationTemplateResult = {
  registryId?: string | undefined;
  repositoryCreationTemplate?: Record<string, unknown>;
};

/** Result of upload_layer_part. */
export type UploadLayerPartResult = {
  registryId?: string | undefined;
  repositoryName?: string | undefined;
  uploadId?: string | undefined;
  lastByteReceived?: number | undefined;
};

/** Result of validate_pull_through_cache_rule. */
export type ValidatePullThroughCacheRuleResult = {
  ecrRepositoryPrefix?: string | undefined;
  registryId?: string | undefined;
  upstreamRegistryUrl?: string | undefined;
  credentialArn?: string | undefined;
  customRoleArn?: string | undefined;
  upstreamRepositoryPrefix?: string | undefined;
  isValid?: boolean | undefined;
  failure?: string | undefined;
};


// ---------------------------------------------------------------------------
// Additional functions (auto-generated)
// ---------------------------------------------------------------------------

/** Batch check layer availability. */
export async function batchCheckLayerAvailability(repositoryName: string, layerDigests: string[]): Promise<BatchCheckLayerAvailabilityResult> {
  try {
    // TODO: implement batch_check_layer_availability
    throw new Error("batch_check_layer_availability not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_check_layer_availability failed");
  }
}

/** Batch delete image. */
export async function batchDeleteImage(repositoryName: string, imageIds: Record<string, unknown>[]): Promise<BatchDeleteImageResult> {
  try {
    // TODO: implement batch_delete_image
    throw new Error("batch_delete_image not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_delete_image failed");
  }
}

/** Batch get image. */
export async function batchGetImage(repositoryName: string, imageIds: Record<string, unknown>[]): Promise<BatchGetImageResult> {
  try {
    // TODO: implement batch_get_image
    throw new Error("batch_get_image not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_get_image failed");
  }
}

/** Batch get repository scanning configuration. */
export async function batchGetRepositoryScanningConfiguration(repositoryNames: string[], regionName?: string | undefined): Promise<BatchGetRepositoryScanningConfigurationResult> {
  try {
    // TODO: implement batch_get_repository_scanning_configuration
    throw new Error("batch_get_repository_scanning_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_get_repository_scanning_configuration failed");
  }
}

/** Complete layer upload. */
export async function completeLayerUpload(repositoryName: string, uploadId: string, layerDigests: string[]): Promise<CompleteLayerUploadResult> {
  try {
    // TODO: implement complete_layer_upload
    throw new Error("complete_layer_upload not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "complete_layer_upload failed");
  }
}

/** Create pull through cache rule. */
export async function createPullThroughCacheRule(ecrRepositoryPrefix: string, upstreamRegistryUrl: string): Promise<CreatePullThroughCacheRuleResult> {
  try {
    // TODO: implement create_pull_through_cache_rule
    throw new Error("create_pull_through_cache_rule not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_pull_through_cache_rule failed");
  }
}

/** Create repository. */
export async function createRepository(repositoryName: string): Promise<CreateRepositoryResult> {
  try {
    // TODO: implement create_repository
    throw new Error("create_repository not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_repository failed");
  }
}

/** Create repository creation template. */
export async function createRepositoryCreationTemplate(prefix: string, appliedFor: string[]): Promise<CreateRepositoryCreationTemplateResult> {
  try {
    // TODO: implement create_repository_creation_template
    throw new Error("create_repository_creation_template not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_repository_creation_template failed");
  }
}

/** Delete lifecycle policy. */
export async function deleteLifecyclePolicy(repositoryName: string): Promise<DeleteLifecyclePolicyResult> {
  try {
    // TODO: implement delete_lifecycle_policy
    throw new Error("delete_lifecycle_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_lifecycle_policy failed");
  }
}

/** Delete pull through cache rule. */
export async function deletePullThroughCacheRule(ecrRepositoryPrefix: string): Promise<DeletePullThroughCacheRuleResult> {
  try {
    // TODO: implement delete_pull_through_cache_rule
    throw new Error("delete_pull_through_cache_rule not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_pull_through_cache_rule failed");
  }
}

/** Delete registry policy. */
export async function deleteRegistryPolicy(regionName?: string | undefined): Promise<DeleteRegistryPolicyResult> {
  try {
    // TODO: implement delete_registry_policy
    throw new Error("delete_registry_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_registry_policy failed");
  }
}

/** Delete repository. */
export async function deleteRepository(repositoryName: string): Promise<DeleteRepositoryResult> {
  try {
    // TODO: implement delete_repository
    throw new Error("delete_repository not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_repository failed");
  }
}

/** Delete repository creation template. */
export async function deleteRepositoryCreationTemplate(prefix: string, regionName?: string | undefined): Promise<DeleteRepositoryCreationTemplateResult> {
  try {
    // TODO: implement delete_repository_creation_template
    throw new Error("delete_repository_creation_template not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_repository_creation_template failed");
  }
}

/** Delete repository policy. */
export async function deleteRepositoryPolicy(repositoryName: string): Promise<DeleteRepositoryPolicyResult> {
  try {
    // TODO: implement delete_repository_policy
    throw new Error("delete_repository_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_repository_policy failed");
  }
}

/** Describe image replication status. */
export async function describeImageReplicationStatus(repositoryName: string, imageId: Record<string, unknown>): Promise<DescribeImageReplicationStatusResult> {
  try {
    // TODO: implement describe_image_replication_status
    throw new Error("describe_image_replication_status not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_image_replication_status failed");
  }
}

/** Describe image scan findings. */
export async function describeImageScanFindings(repositoryName: string, imageId: Record<string, unknown>): Promise<DescribeImageScanFindingsResult> {
  try {
    // TODO: implement describe_image_scan_findings
    throw new Error("describe_image_scan_findings not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_image_scan_findings failed");
  }
}

/** Describe images. */
export async function describeImages(repositoryName: string): Promise<DescribeImagesResult> {
  try {
    // TODO: implement describe_images
    throw new Error("describe_images not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_images failed");
  }
}

/** Describe pull through cache rules. */
export async function describePullThroughCacheRules(): Promise<DescribePullThroughCacheRulesResult> {
  try {
    // TODO: implement describe_pull_through_cache_rules
    throw new Error("describe_pull_through_cache_rules not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_pull_through_cache_rules failed");
  }
}

/** Describe registry. */
export async function describeRegistry(regionName?: string | undefined): Promise<DescribeRegistryResult> {
  try {
    // TODO: implement describe_registry
    throw new Error("describe_registry not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_registry failed");
  }
}

/** Describe repositories. */
export async function describeRepositories(): Promise<DescribeRepositoriesResult> {
  try {
    // TODO: implement describe_repositories
    throw new Error("describe_repositories not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_repositories failed");
  }
}

/** Describe repository creation templates. */
export async function describeRepositoryCreationTemplates(): Promise<DescribeRepositoryCreationTemplatesResult> {
  try {
    // TODO: implement describe_repository_creation_templates
    throw new Error("describe_repository_creation_templates not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_repository_creation_templates failed");
  }
}

/** Get account setting. */
export async function getAccountSetting(name: string, regionName?: string | undefined): Promise<GetAccountSettingResult> {
  try {
    // TODO: implement get_account_setting
    throw new Error("get_account_setting not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_account_setting failed");
  }
}

/** Get authorization token. */
export async function getAuthorizationToken(): Promise<GetAuthorizationTokenResult> {
  try {
    // TODO: implement get_authorization_token
    throw new Error("get_authorization_token not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_authorization_token failed");
  }
}

/** Get download url for layer. */
export async function getDownloadUrlForLayer(repositoryName: string, layerDigest: string): Promise<GetDownloadUrlForLayerResult> {
  try {
    // TODO: implement get_download_url_for_layer
    throw new Error("get_download_url_for_layer not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_download_url_for_layer failed");
  }
}

/** Get lifecycle policy. */
export async function getLifecyclePolicy(repositoryName: string): Promise<GetLifecyclePolicyResult> {
  try {
    // TODO: implement get_lifecycle_policy
    throw new Error("get_lifecycle_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_lifecycle_policy failed");
  }
}

/** Get lifecycle policy preview. */
export async function getLifecyclePolicyPreview(repositoryName: string): Promise<GetLifecyclePolicyPreviewResult> {
  try {
    // TODO: implement get_lifecycle_policy_preview
    throw new Error("get_lifecycle_policy_preview not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_lifecycle_policy_preview failed");
  }
}

/** Get registry policy. */
export async function getRegistryPolicy(regionName?: string | undefined): Promise<GetRegistryPolicyResult> {
  try {
    // TODO: implement get_registry_policy
    throw new Error("get_registry_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_registry_policy failed");
  }
}

/** Get registry scanning configuration. */
export async function getRegistryScanningConfiguration(regionName?: string | undefined): Promise<GetRegistryScanningConfigurationResult> {
  try {
    // TODO: implement get_registry_scanning_configuration
    throw new Error("get_registry_scanning_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_registry_scanning_configuration failed");
  }
}

/** Get repository policy. */
export async function getRepositoryPolicy(repositoryName: string): Promise<GetRepositoryPolicyResult> {
  try {
    // TODO: implement get_repository_policy
    throw new Error("get_repository_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_repository_policy failed");
  }
}

/** Initiate layer upload. */
export async function initiateLayerUpload(repositoryName: string): Promise<InitiateLayerUploadResult> {
  try {
    // TODO: implement initiate_layer_upload
    throw new Error("initiate_layer_upload not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "initiate_layer_upload failed");
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

/** Put account setting. */
export async function putAccountSetting(name: string, value: string, regionName?: string | undefined): Promise<PutAccountSettingResult> {
  try {
    // TODO: implement put_account_setting
    throw new Error("put_account_setting not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_account_setting failed");
  }
}

/** Put image. */
export async function putImage(repositoryName: string, imageManifest: string): Promise<PutImageResult> {
  try {
    // TODO: implement put_image
    throw new Error("put_image not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_image failed");
  }
}

/** Put image scanning configuration. */
export async function putImageScanningConfiguration(repositoryName: string, imageScanningConfiguration: Record<string, unknown>): Promise<PutImageScanningConfigurationResult> {
  try {
    // TODO: implement put_image_scanning_configuration
    throw new Error("put_image_scanning_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_image_scanning_configuration failed");
  }
}

/** Put image tag mutability. */
export async function putImageTagMutability(repositoryName: string, imageTagMutability: string): Promise<PutImageTagMutabilityResult> {
  try {
    // TODO: implement put_image_tag_mutability
    throw new Error("put_image_tag_mutability not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_image_tag_mutability failed");
  }
}

/** Put lifecycle policy. */
export async function putLifecyclePolicy(repositoryName: string, lifecyclePolicyText: string): Promise<PutLifecyclePolicyResult> {
  try {
    // TODO: implement put_lifecycle_policy
    throw new Error("put_lifecycle_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_lifecycle_policy failed");
  }
}

/** Put registry policy. */
export async function putRegistryPolicy(policyText: string, regionName?: string | undefined): Promise<PutRegistryPolicyResult> {
  try {
    // TODO: implement put_registry_policy
    throw new Error("put_registry_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_registry_policy failed");
  }
}

/** Put registry scanning configuration. */
export async function putRegistryScanningConfiguration(): Promise<PutRegistryScanningConfigurationResult> {
  try {
    // TODO: implement put_registry_scanning_configuration
    throw new Error("put_registry_scanning_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_registry_scanning_configuration failed");
  }
}

/** Put replication configuration. */
export async function putReplicationConfiguration(replicationConfiguration: Record<string, unknown>, regionName?: string | undefined): Promise<PutReplicationConfigurationResult> {
  try {
    // TODO: implement put_replication_configuration
    throw new Error("put_replication_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_replication_configuration failed");
  }
}

/** Set repository policy. */
export async function setRepositoryPolicy(repositoryName: string, policyText: string): Promise<SetRepositoryPolicyResult> {
  try {
    // TODO: implement set_repository_policy
    throw new Error("set_repository_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "set_repository_policy failed");
  }
}

/** Start image scan. */
export async function startImageScan(repositoryName: string, imageId: Record<string, unknown>): Promise<StartImageScanResult> {
  try {
    // TODO: implement start_image_scan
    throw new Error("start_image_scan not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_image_scan failed");
  }
}

/** Start lifecycle policy preview. */
export async function startLifecyclePolicyPreview(repositoryName: string): Promise<StartLifecyclePolicyPreviewResult> {
  try {
    // TODO: implement start_lifecycle_policy_preview
    throw new Error("start_lifecycle_policy_preview not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_lifecycle_policy_preview failed");
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

/** Update pull through cache rule. */
export async function updatePullThroughCacheRule(ecrRepositoryPrefix: string): Promise<UpdatePullThroughCacheRuleResult> {
  try {
    // TODO: implement update_pull_through_cache_rule
    throw new Error("update_pull_through_cache_rule not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_pull_through_cache_rule failed");
  }
}

/** Update repository creation template. */
export async function updateRepositoryCreationTemplate(prefix: string): Promise<UpdateRepositoryCreationTemplateResult> {
  try {
    // TODO: implement update_repository_creation_template
    throw new Error("update_repository_creation_template not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_repository_creation_template failed");
  }
}

/** Upload layer part. */
export async function uploadLayerPart(repositoryName: string, uploadId: string, partFirstByte: number, partLastByte: number, layerPartBlob: Uint8Array): Promise<UploadLayerPartResult> {
  try {
    // TODO: implement upload_layer_part
    throw new Error("upload_layer_part not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "upload_layer_part failed");
  }
}

/** Validate pull through cache rule. */
export async function validatePullThroughCacheRule(ecrRepositoryPrefix: string): Promise<ValidatePullThroughCacheRuleResult> {
  try {
    // TODO: implement validate_pull_through_cache_rule
    throw new Error("validate_pull_through_cache_rule not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "validate_pull_through_cache_rule failed");
  }
}
