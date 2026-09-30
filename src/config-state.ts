/**
 * aws-util/config-state — Multi-service configuration and state management.
 *
 * Provides typed helpers for resolving configuration from multiple sources,
 * DynamoDB-backed distributed locking, state machine checkpointing,
 * cross-account STS role assumption, SSM-to-Lambda environment variable
 * syncing, and AppConfig-based feature flag loading.
 *
 * Multi-service: SSM + Secrets Manager + DynamoDB + STS + Lambda + AppConfig.
 *
 * All async functions obtain clients via {@link getClient} and wrap errors
 * through {@link wrapAwsError}.
 *
 * @example
 * ```ts
 * import {
 *   configResolver,
 *   distributedLock,
 *   stateMachineCheckpoint,
 *   crossAccountRoleAssumer,
 *   environmentVariableSync,
 *   appconfigFeatureLoader,
 * } from "./config-state.js";
 *
 * const config = await configResolver([
 *   { type: "ssm", path: "/app/db-host" },
 *   { type: "secret", path: "prod/db-password" },
 * ]);
 * const lock = await distributedLock("locks", "deploy-lock", "worker-1");
 * ```
 *
 * @module
 */

import { z } from "zod";
import {
  SSMClient,
  GetParameterCommand,
  GetParametersByPathCommand,
} from "@aws-sdk/client-ssm";
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
} from "@aws-sdk/lib-dynamodb";
import {
  STSClient,
  AssumeRoleCommand,
} from "@aws-sdk/client-sts";
import {
  LambdaClient,
  GetFunctionConfigurationCommand,
  UpdateFunctionConfigurationCommand,
} from "@aws-sdk/client-lambda";
import { getClient } from "./client.js";
import { wrapAwsError } from "./exceptions.js";

// ---------------------------------------------------------------------------
// Zod schemas & inferred types
// ---------------------------------------------------------------------------

/** Schema for a resolved configuration result. */
export const ResolvedConfigSchema = z.object({
  values: z.record(z.string(), z.string()),
  source: z.string(),
  resolvedAt: z.string(),
});

/** A resolved configuration result. */
export type ResolvedConfig = z.infer<typeof ResolvedConfigSchema>;

/** Schema for a distributed lock result. */
export const DistributedLockResultSchema = z.object({
  lockId: z.string(),
  acquired: z.boolean(),
  owner: z.string(),
  expiresAt: z.number(),
});

/** A distributed lock result. */
export type DistributedLockResult = z.infer<
  typeof DistributedLockResultSchema
>;

/** Schema for a state machine checkpoint result. */
export const CheckpointResultSchema = z.object({
  executionId: z.string(),
  stepName: z.string(),
  status: z.string(),
  data: z.record(z.string(), z.unknown()).optional(),
});

/** A state machine checkpoint result. */
export type CheckpointResult = z.infer<typeof CheckpointResultSchema>;

/** Schema for assumed role credentials. */
export const AssumedRoleCredentialsSchema = z.object({
  accessKeyId: z.string(),
  secretAccessKey: z.string(),
  sessionToken: z.string(),
  expiration: z.string().optional(),
});

/** Assumed role credentials. */
export type AssumedRoleCredentials = z.infer<
  typeof AssumedRoleCredentialsSchema
>;

/** Schema for an environment variable sync result. */
export const EnvironmentSyncResultSchema = z.object({
  functionName: z.string(),
  variablesSynced: z.number(),
});

/** An environment variable sync result. */
export type EnvironmentSyncResult = z.infer<
  typeof EnvironmentSyncResultSchema
>;

/** Schema for a feature flag result. */
export const FeatureFlagResultSchema = z.object({
  flagName: z.string(),
  enabled: z.boolean(),
  variant: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

/** A feature flag result. */
export type FeatureFlagResult = z.infer<typeof FeatureFlagResultSchema>;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Resolve configuration from multiple AWS sources.
 *
 * Supports SSM Parameter Store parameters, Secrets Manager secrets, and
 * DynamoDB items. Each source is resolved in order and merged into a
 * single key-value map.
 *
 * @param sources - Array of config source descriptors.
 * @param region - Optional AWS region.
 * @returns A validated {@link ResolvedConfig}.
 *
 * @example
 * ```ts
 * const config = await configResolver([
 *   { type: "ssm", path: "/app/db-host" },
 *   { type: "secret", path: "prod/db-password" },
 *   { type: "dynamodb", path: "config-table/app-settings" },
 * ]);
 * ```
 */
export async function configResolver(
  sources: Array<{
    type: "ssm" | "secret" | "dynamodb";
    path: string;
  }>,
  region?: string,
): Promise<ResolvedConfig> {
  try {
    const values: Record<string, string> = {};
    const sourceNames: string[] = [];

    for (const source of sources) {
      switch (source.type) {
        case "ssm": {
          const ssm = getClient(SSMClient, region);
          const response = await ssm.send(
            new GetParameterCommand({
              Name: source.path,
              WithDecryption: true,
            }),
          );
          const name = source.path.split("/").pop() ?? source.path;
          values[name] = response.Parameter?.Value ?? "";
          sourceNames.push("ssm");
          break;
        }
        case "secret": {
          const sm = getClient(SecretsManagerClient, region);
          const response = await sm.send(
            new GetSecretValueCommand({
              SecretId: source.path,
            }),
          );
          const name = source.path.split("/").pop() ?? source.path;
          values[name] = response.SecretString ?? "";
          sourceNames.push("secrets_manager");
          break;
        }
        case "dynamodb": {
          // Path format: "tableName/partitionKeyValue"
          const parts = source.path.split("/");
          const tableName = parts[0];
          const keyValue = parts.slice(1).join("/");
          const raw = getClient(DynamoDBClient, region);
          const ddb = DynamoDBDocumentClient.from(raw);
          const response = await ddb.send(
            new GetCommand({
              TableName: tableName,
              Key: { id: keyValue },
            }),
          );
          if (response.Item) {
            for (const [k, v] of Object.entries(response.Item)) {
              if (k !== "id") {
                values[k] = String(v);
              }
            }
          }
          sourceNames.push("dynamodb");
          break;
        }
      }
    }

    const uniqueSources = [...new Set(sourceNames)];
    return ResolvedConfigSchema.parse({
      values,
      source: uniqueSources.join("+"),
      resolvedAt: new Date().toISOString(),
    });
  } catch (err) {
    throw wrapAwsError(err, "configResolver failed");
  }
}

/**
 * Acquire a distributed lock using DynamoDB conditional writes.
 *
 * Uses a conditional `PutItem` with a `attribute_not_exists` condition
 * to ensure only one owner can acquire the lock at a time. The lock
 * includes a TTL for automatic expiration.
 *
 * @param tableName - DynamoDB table name for locks.
 * @param lockId - Unique lock identifier.
 * @param owner - Owner identifier (e.g. instance ID, worker name).
 * @param ttlSeconds - Lock TTL in seconds (default 300).
 * @param region - Optional AWS region.
 * @returns A validated {@link DistributedLockResult}.
 *
 * @example
 * ```ts
 * const lock = await distributedLock("locks", "deploy", "worker-1", 600);
 * if (lock.acquired) {
 *   // proceed with exclusive operation
 * }
 * ```
 */
export async function distributedLock(
  tableName: string,
  lockId: string,
  owner: string,
  ttlSeconds?: number,
  region?: string,
): Promise<DistributedLockResult> {
  try {
    const ttl = ttlSeconds ?? 300;
    const expiresAt = Math.floor(Date.now() / 1000) + ttl;
    const raw = getClient(DynamoDBClient, region);
    const ddb = DynamoDBDocumentClient.from(raw);

    try {
      await ddb.send(
        new PutCommand({
          TableName: tableName,
          Item: {
            lockId,
            owner,
            expiresAt,
            acquiredAt: new Date().toISOString(),
          },
          ConditionExpression:
            "attribute_not_exists(lockId) OR expiresAt < :now",
          ExpressionAttributeValues: {
            ":now": Math.floor(Date.now() / 1000),
          },
        }),
      );

      return DistributedLockResultSchema.parse({
        lockId,
        acquired: true,
        owner,
        expiresAt,
      });
    } catch (condErr) {
      // ConditionalCheckFailedException means lock is held
      const code =
        condErr != null && typeof condErr === "object"
          ? (condErr as Record<string, unknown>)["name"]
          : undefined;
      if (code === "ConditionalCheckFailedException") {
        return DistributedLockResultSchema.parse({
          lockId,
          acquired: false,
          owner,
          expiresAt: 0,
        });
      }
      throw condErr;
    }
  } catch (err) {
    throw wrapAwsError(err, "distributedLock failed");
  }
}

/**
 * Write or read a state machine checkpoint in DynamoDB.
 *
 * Stores execution progress keyed by `executionId` and `stepName`.
 * Useful for implementing resumable workflows.
 *
 * @param tableName - DynamoDB table name for checkpoints.
 * @param executionId - Unique execution identifier.
 * @param stepName - Name of the current step.
 * @param status - Step status (e.g. "started", "completed", "failed").
 * @param data - Optional data payload for the checkpoint.
 * @param region - Optional AWS region.
 * @returns A validated {@link CheckpointResult}.
 *
 * @example
 * ```ts
 * await stateMachineCheckpoint(
 *   "checkpoints", "exec-001", "validate", "completed", { valid: true }
 * );
 * ```
 */
export async function stateMachineCheckpoint(
  tableName: string,
  executionId: string,
  stepName: string,
  status: string,
  data?: Record<string, unknown>,
  region?: string,
): Promise<CheckpointResult> {
  try {
    const raw = getClient(DynamoDBClient, region);
    const ddb = DynamoDBDocumentClient.from(raw);

    await ddb.send(
      new PutCommand({
        TableName: tableName,
        Item: {
          executionId,
          stepName,
          status,
          data: data ?? {},
          updatedAt: new Date().toISOString(),
        },
      }),
    );

    return CheckpointResultSchema.parse({
      executionId,
      stepName,
      status,
      data,
    });
  } catch (err) {
    throw wrapAwsError(err, "stateMachineCheckpoint failed");
  }
}

/**
 * Assume an IAM role in another AWS account via STS.
 *
 * Wraps the STS `AssumeRole` API and returns the temporary credentials
 * in a structured, validated format.
 *
 * @param roleArn - The ARN of the role to assume.
 * @param sessionName - Optional session name (default "aws-util-session").
 * @param externalId - Optional external ID for cross-account trust.
 * @param region - Optional AWS region.
 * @returns Validated {@link AssumedRoleCredentials}.
 *
 * @example
 * ```ts
 * const creds = await crossAccountRoleAssumer(
 *   "arn:aws:iam::111122223333:role/CrossAccountRole",
 *   "deploy-session",
 * );
 * ```
 */
export async function crossAccountRoleAssumer(
  roleArn: string,
  sessionName?: string,
  externalId?: string,
  region?: string,
): Promise<AssumedRoleCredentials> {
  try {
    const sts = getClient(STSClient, region);
    const input: Record<string, unknown> = {
      RoleArn: roleArn,
      RoleSessionName: sessionName ?? "aws-util-session",
    };
    if (externalId) {
      input["ExternalId"] = externalId;
    }

    const response = await sts.send(
      new AssumeRoleCommand(input as {
        RoleArn: string;
        RoleSessionName: string;
        ExternalId?: string;
      }),
    );

    const creds = response.Credentials;
    if (!creds) {
      throw new Error("STS AssumeRole returned no credentials");
    }

    return AssumedRoleCredentialsSchema.parse({
      accessKeyId: creds.AccessKeyId ?? "",
      secretAccessKey: creds.SecretAccessKey ?? "",
      sessionToken: creds.SessionToken ?? "",
      expiration: creds.Expiration
        ? creds.Expiration.toISOString()
        : undefined,
    });
  } catch (err) {
    throw wrapAwsError(err, "crossAccountRoleAssumer failed");
  }
}

/**
 * Synchronise SSM Parameter Store parameters to Lambda environment variables.
 *
 * Reads all parameters under the given path prefix and updates the
 * Lambda function's environment variables to match. Parameter names
 * are converted to uppercase with slashes replaced by underscores.
 *
 * @param functionName - The Lambda function name or ARN.
 * @param parameterPath - SSM parameter path prefix (e.g. "/app/prod/").
 * @param region - Optional AWS region.
 * @returns A validated {@link EnvironmentSyncResult}.
 *
 * @example
 * ```ts
 * const result = await environmentVariableSync(
 *   "my-function",
 *   "/app/prod/",
 * );
 * console.log(result.variablesSynced); // number of env vars set
 * ```
 */
export async function environmentVariableSync(
  functionName: string,
  parameterPath: string,
  region?: string,
): Promise<EnvironmentSyncResult> {
  try {
    const ssm = getClient(SSMClient, region);
    const lambda = getClient(LambdaClient, region);

    // Fetch all parameters under the path
    const params: Record<string, string> = {};
    let nextToken: string | undefined;

    do {
      const response = await ssm.send(
        new GetParametersByPathCommand({
          Path: parameterPath,
          WithDecryption: true,
          Recursive: true,
          NextToken: nextToken,
        }),
      );

      for (const param of response.Parameters ?? []) {
        if (param.Name && param.Value) {
          // Convert path to env var name: /app/prod/db_host -> DB_HOST
          const name = param.Name.replace(parameterPath, "")
            .replace(/\//g, "_")
            .toUpperCase();
          params[name] = param.Value;
        }
      }

      nextToken = response.NextToken;
    } while (nextToken);

    // Get current function configuration to preserve existing env vars
    const fnConfig = await lambda.send(
      new GetFunctionConfigurationCommand({
        FunctionName: functionName,
      }),
    );

    const existingVars =
      fnConfig.Environment?.Variables ?? {};
    const mergedVars = { ...existingVars, ...params };

    // Update the Lambda function's environment variables
    await lambda.send(
      new UpdateFunctionConfigurationCommand({
        FunctionName: functionName,
        Environment: { Variables: mergedVars },
      }),
    );

    return EnvironmentSyncResultSchema.parse({
      functionName,
      variablesSynced: Object.keys(params).length,
    });
  } catch (err) {
    throw wrapAwsError(err, "environmentVariableSync failed");
  }
}

/**
 * Load feature flags from AppConfig via SSM Parameter Store fallback.
 *
 * Attempts to fetch the configuration profile using SSM GetParameter
 * with the AppConfig parameter path convention:
 * `/aws/reference/appconfig/{app}/{env}/{profile}`.
 *
 * Falls back to a direct SSM parameter lookup if the AppConfig path
 * is not resolvable, treating the profile ID as a feature flag name.
 *
 * @param applicationId - The AppConfig application ID or name.
 * @param environmentId - The AppConfig environment ID or name.
 * @param configurationProfileId - The configuration profile ID or name.
 * @param region - Optional AWS region.
 * @returns A validated {@link FeatureFlagResult}.
 *
 * @example
 * ```ts
 * const flag = await appconfigFeatureLoader(
 *   "my-app",
 *   "production",
 *   "dark-mode",
 * );
 * console.log(flag.enabled); // true or false
 * ```
 */
export async function appconfigFeatureLoader(
  applicationId: string,
  environmentId: string,
  configurationProfileId: string,
  region?: string,
): Promise<FeatureFlagResult> {
  try {
    const ssm = getClient(SSMClient, region);

    // Try AppConfig SSM integration path first
    const appConfigPath =
      `/aws/reference/appconfig/${applicationId}` +
      `/${environmentId}/${configurationProfileId}`;

    let rawValue: string | undefined;

    try {
      const response = await ssm.send(
        new GetParameterCommand({
          Name: appConfigPath,
          WithDecryption: true,
        }),
      );
      rawValue = response.Parameter?.Value;
    } catch (err) {
      // Fall back to direct SSM parameter lookup
      const code =
        err != null && typeof err === "object"
          ? (err as Record<string, unknown>)["name"]
          : undefined;
      if (
        code === "ParameterNotFound" ||
        code === "ParameterVersionNotFound"
      ) {
        const fallbackPath =
          `/appconfig/${applicationId}` +
          `/${environmentId}/${configurationProfileId}`;
        const fallback = await ssm.send(
          new GetParameterCommand({
            Name: fallbackPath,
            WithDecryption: true,
          }),
        );
        rawValue = fallback.Parameter?.Value;
      } else {
        throw err;
      }
    }

    // Parse the value — expect JSON with enabled, variant, metadata
    let enabled = false;
    let variant: string | undefined;
    let metadata: Record<string, unknown> | undefined;

    if (rawValue) {
      try {
        const parsed = JSON.parse(rawValue) as Record<
          string,
          unknown
        >;
        enabled = Boolean(parsed["enabled"] ?? false);
        if (typeof parsed["variant"] === "string") {
          variant = parsed["variant"];
        }
        if (
          typeof parsed["metadata"] === "object" &&
          parsed["metadata"] !== null
        ) {
          metadata = parsed["metadata"] as Record<string, unknown>;
        }
      } catch {
        // Non-JSON value — treat truthy strings as enabled
        enabled = ["true", "1", "yes", "on"].includes(
          rawValue.toLowerCase(),
        );
      }
    }

    return FeatureFlagResultSchema.parse({
      flagName: configurationProfileId,
      enabled,
      variant,
      metadata,
    });
  } catch (err) {
    throw wrapAwsError(err, "appconfigFeatureLoader failed");
  }
}
