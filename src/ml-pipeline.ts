/**
 * aws-util/ml-pipeline — SageMaker endpoint management and model promotion.
 *
 * Multi-service module combining SageMaker + CloudWatch + S3 + STS
 * to provide SageMaker endpoint lifecycle management and model registry
 * promotion workflows.
 *
 * All functions obtain clients via {@link getClient} and wrap errors
 * through {@link wrapAwsError}.
 *
 * @example
 * ```ts
 * import {
 *   sagemakerEndpointManager,
 *   modelRegistryPromoter,
 * } from "./ml-pipeline.js";
 *
 * const endpoint = await sagemakerEndpointManager(
 *   "my-endpoint",
 *   "my-model",
 * );
 * ```
 *
 * @module
 */

import { z } from "zod";
import {
  SageMakerClient,
  DescribeEndpointCommand,
  CreateEndpointCommand,
  CreateEndpointConfigCommand,
  UpdateEndpointCommand,
  ListModelPackagesCommand,
  UpdateModelPackageCommand,
} from "@aws-sdk/client-sagemaker";
import { getClient } from "./client.js";
import { wrapAwsError } from "./exceptions.js";

// ---------------------------------------------------------------------------
// Zod schemas & inferred types
// ---------------------------------------------------------------------------

/** Schema for a production variant status. */
export const VariantStatusSchema = z.object({
  variantName: z.string(),
  currentWeight: z.number(),
  instanceType: z.string(),
  currentInstanceCount: z.number(),
});

/** Status of a single production variant. */
export type VariantStatus = z.infer<
  typeof VariantStatusSchema
>;

/** Schema for endpoint manager results. */
export const EndpointManagerResultSchema = z.object({
  endpointName: z.string(),
  endpointArn: z.string().optional(),
  status: z.string(),
  variants: z.array(VariantStatusSchema),
});

/** Result of endpoint management operation. */
export type EndpointManagerResult = z.infer<
  typeof EndpointManagerResultSchema
>;

/** Schema for model promotion results. */
export const ModelPromotionResultSchema = z.object({
  modelName: z.string(),
  sourceRegistry: z.string(),
  targetRegistry: z.string(),
  promoted: z.boolean(),
});

/** Result of model promotion. */
export type ModelPromotionResult = z.infer<
  typeof ModelPromotionResultSchema
>;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Create or update a SageMaker endpoint.
 *
 * If the endpoint does not exist, creates a new endpoint configuration
 * and endpoint. If the endpoint already exists, creates a new endpoint
 * configuration and updates the endpoint to use it.
 *
 * @param endpointName - SageMaker endpoint name.
 * @param modelName - SageMaker model name to deploy.
 * @param instanceType - Instance type for inference. Defaults to "ml.m5.large".
 * @param instanceCount - Number of instances. Defaults to 1.
 * @param variantName - Production variant name. Defaults to "AllTraffic".
 * @param region - AWS region. Defaults to SDK default.
 * @returns Endpoint management result with status and variant info.
 *
 * @example
 * ```ts
 * const result = await sagemakerEndpointManager(
 *   "recommendation-endpoint",
 *   "recommendation-model-v2",
 *   "ml.c5.xlarge",
 *   2,
 * );
 * ```
 */
export async function sagemakerEndpointManager(
  endpointName: string,
  modelName: string,
  instanceType?: string,
  instanceCount?: number,
  variantName?: string,
  region?: string,
): Promise<EndpointManagerResult> {
  try {
    const sm = getClient(SageMakerClient, region);
    const iType = instanceType ?? "ml.m5.large";
    const iCount = instanceCount ?? 1;
    const vName = variantName ?? "AllTraffic";

    // Check if endpoint already exists
    let endpointExists = false;
    try {
      await sm.send(
        new DescribeEndpointCommand({
          EndpointName: endpointName,
        }),
      );
      endpointExists = true;
    } catch (_err) {
      // Endpoint does not exist
    }

    // Create endpoint configuration
    const configName = `${endpointName}-config-${Date.now()}`;
    await sm.send(
      new CreateEndpointConfigCommand({
        EndpointConfigName: configName,
        ProductionVariants: [
          {
            VariantName: vName,
            ModelName: modelName,
            InstanceType: iType,
            InitialInstanceCount: iCount,
            InitialVariantWeight: 1.0,
          },
        ],
      }),
    );

    let endpointArn: string | undefined;
    let status: string;

    if (endpointExists) {
      // Update existing endpoint
      await sm.send(
        new UpdateEndpointCommand({
          EndpointName: endpointName,
          EndpointConfigName: configName,
        }),
      );
      status = "UPDATING";

      // Describe to get ARN
      const descResp = await sm.send(
        new DescribeEndpointCommand({
          EndpointName: endpointName,
        }),
      );
      endpointArn = descResp.EndpointArn ?? undefined;
      status = descResp.EndpointStatus ?? "UPDATING";
    } else {
      // Create new endpoint
      const createResp = await sm.send(
        new CreateEndpointCommand({
          EndpointName: endpointName,
          EndpointConfigName: configName,
        }),
      );
      endpointArn = createResp.EndpointArn ?? undefined;
      status = "CREATING";
    }

    const variants: VariantStatus[] = [
      {
        variantName: vName,
        currentWeight: 1.0,
        instanceType: iType,
        currentInstanceCount: iCount,
      },
    ];

    const result: EndpointManagerResult = {
      endpointName,
      endpointArn,
      status,
      variants,
    };
    return EndpointManagerResultSchema.parse(result);
  } catch (err) {
    throw wrapAwsError(
      err,
      "sagemakerEndpointManager failed",
    );
  }
}

/**
 * Promote a model package between registry stages.
 *
 * Lists model packages in the specified group, finds the latest approved
 * model in the source stage, and updates its approval status to promote
 * it to the target stage.
 *
 * @param modelPackageGroupName - SageMaker model package group name.
 * @param sourceStage - Source approval status. Defaults to "PendingManualApproval".
 * @param targetStage - Target approval status. Defaults to "Approved".
 * @param region - AWS region. Defaults to SDK default.
 * @returns Promotion result with model name and status.
 *
 * @example
 * ```ts
 * const result = await modelRegistryPromoter(
 *   "fraud-detection-models",
 *   "PendingManualApproval",
 *   "Approved",
 * );
 * ```
 */
export async function modelRegistryPromoter(
  modelPackageGroupName: string,
  sourceStage?: string,
  targetStage?: string,
  region?: string,
): Promise<ModelPromotionResult> {
  try {
    const sm = getClient(SageMakerClient, region);
    const source = sourceStage ?? "PendingManualApproval";
    const target = targetStage ?? "Approved";

    // List model packages in the group
    const listResp = await sm.send(
      new ListModelPackagesCommand({
        ModelPackageGroupName: modelPackageGroupName,
        ModelApprovalStatus: source as
          | "Approved"
          | "Rejected"
          | "PendingManualApproval",
        SortBy: "CreationTime",
        SortOrder: "Descending",
        MaxResults: 1,
      }),
    );

    const packages =
      listResp.ModelPackageSummaryList ?? [];
    if (packages.length === 0) {
      return ModelPromotionResultSchema.parse({
        modelName: modelPackageGroupName,
        sourceRegistry: source,
        targetRegistry: target,
        promoted: false,
      });
    }

    const latestPackage = packages[0];
    const modelPackageArn =
      latestPackage.ModelPackageArn ?? "";

    // Update model package approval status
    await sm.send(
      new UpdateModelPackageCommand({
        ModelPackageArn: modelPackageArn,
        ModelApprovalStatus: target as
          | "Approved"
          | "Rejected"
          | "PendingManualApproval",
      }),
    );

    const modelName =
      latestPackage.ModelPackageArn?.split("/").pop() ??
      modelPackageGroupName;

    const result: ModelPromotionResult = {
      modelName,
      sourceRegistry: source,
      targetRegistry: target,
      promoted: true,
    };
    return ModelPromotionResultSchema.parse(result);
  } catch (err) {
    throw wrapAwsError(
      err,
      "modelRegistryPromoter failed",
    );
  }
}
