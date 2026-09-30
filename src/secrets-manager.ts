/**
 * aws-util/secrets-manager — High-level AWS Secrets Manager utilities.
 *
 * Provides typed helpers for creating, reading, updating, deleting, listing,
 * and rotating secrets. Supports JSON key extraction via `secretId:jsonKey`
 * syntax.
 *
 * @example
 * ```ts
 * import { getSecret, createSecret, rotateSecret } from "./secrets-manager.js";
 *
 * const password = await getSecret("myapp/db-credentials:password");
 * await createSecret("myapp/api-key", "sk_live_abc123");
 * ```
 *
 * @module
 */

import {
  SecretsManagerClient,
  GetSecretValueCommand,
  CreateSecretCommand,
  UpdateSecretCommand,
  DeleteSecretCommand,
  ListSecretsCommand,
  RotateSecretCommand,
} from "@aws-sdk/client-secrets-manager";
import { getClient } from "./client.js";
import { wrapAwsError } from "./exceptions.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Get a cached SecretsManagerClient for the given region.
 */
function sm(region?: string): SecretsManagerClient {
  return getClient(SecretsManagerClient, region);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Fetch a secret value from AWS Secrets Manager.
 *
 * The `secretId` may reference either the full secret or a single JSON key:
 *
 * - `"myapp/db-credentials"` -- returns the entire secret string.
 * - `"myapp/db-credentials:password"` -- parses the secret as JSON and returns
 *   only the `password` field.
 * - `"arn:aws:secretsmanager:...:secret:myapp/db:password"` -- ARN form; the
 *   split is performed on the **last** `:` so the ARN is preserved.
 *
 * @param secretId - Secret identifier with an optional `:jsonKey` suffix.
 * @param region - AWS region override.
 * @returns The secret value (or extracted JSON field) as a string.
 */
export async function getSecret(
  secretId: string,
  region?: string,
): Promise<string> {
  let actualId = secretId;
  let jsonKey: string | undefined;

  // Check for :jsonKey suffix. Use rsplit logic to handle ARNs.
  const lastColon = secretId.lastIndexOf(":");
  if (lastColon > 0) {
    const potentialKey = secretId.slice(lastColon + 1);
    const potentialId = secretId.slice(0, lastColon);
    // Only treat as jsonKey if the part before the colon is non-empty
    // and the key doesn't look like part of an ARN structure
    if (potentialKey && potentialId) {
      actualId = potentialId;
      jsonKey = potentialKey;
    }
  }

  try {
    const resp = await sm(region).send(
      new GetSecretValueCommand({ SecretId: actualId }),
    );

    const secretStr =
      resp.SecretString ??
      (resp.SecretBinary
        ? new TextDecoder().decode(resp.SecretBinary)
        : "");

    if (jsonKey === undefined) {
      return secretStr;
    }

    let data: Record<string, unknown>;
    try {
      data = JSON.parse(secretStr) as Record<string, unknown>;
    } catch {
      throw wrapAwsError(
        new Error(
          `Secret ${actualId} is not valid JSON; cannot extract key ${jsonKey}`,
        ),
        "getSecret",
      );
    }

    if (!(jsonKey in data)) {
      throw new Error(
        `Key "${jsonKey}" not found in secret "${actualId}"`,
      );
    }

    return String(data[jsonKey]);
  } catch (err: unknown) {
    throw wrapAwsError(err, `getSecret(${actualId})`);
  }
}

/**
 * Create a new secret in AWS Secrets Manager.
 *
 * Objects are automatically serialised to JSON.
 *
 * @param name - Unique secret name or path, e.g. `"myapp/db-credentials"`.
 * @param value - Secret value. Objects are JSON-stringified.
 * @param description - Human-readable description.
 * @param tags - Resource tags as `{key: value}`.
 * @param region - AWS region override.
 * @returns The ARN of the newly created secret.
 */
export async function createSecret(
  name: string,
  value: string | object,
  description?: string,
  tags?: Record<string, string>,
  region?: string,
): Promise<string> {
  const raw =
    typeof value === "string" ? value : JSON.stringify(value);

  try {
    const resp = await sm(region).send(
      new CreateSecretCommand({
        Name: name,
        SecretString: raw,
        Description: description,
        Tags: tags
          ? Object.entries(tags).map(([k, v]) => ({
              Key: k,
              Value: v,
            }))
          : undefined,
      }),
    );
    return resp.ARN ?? "";
  } catch (err: unknown) {
    throw wrapAwsError(err, `createSecret(${name})`);
  }
}

/**
 * Update the value of an existing Secrets Manager secret.
 *
 * Objects are automatically serialised to JSON.
 *
 * @param secretId - Secret name, path, or ARN.
 * @param value - New secret value. Objects are JSON-stringified.
 * @param region - AWS region override.
 */
export async function updateSecret(
  secretId: string,
  value: string | object,
  region?: string,
): Promise<void> {
  const raw =
    typeof value === "string" ? value : JSON.stringify(value);

  try {
    await sm(region).send(
      new UpdateSecretCommand({
        SecretId: secretId,
        SecretString: raw,
      }),
    );
  } catch (err: unknown) {
    throw wrapAwsError(err, `updateSecret(${secretId})`);
  }
}

/**
 * Delete a Secrets Manager secret.
 *
 * @param secretId - Secret name, path, or ARN.
 * @param recoveryWindowInDays - Days before permanent deletion (7--30,
 *   default `30`). Set to `0` to force immediate deletion.
 * @param region - AWS region override.
 */
export async function deleteSecret(
  secretId: string,
  recoveryWindowInDays: number = 30,
  region?: string,
): Promise<void> {
  try {
    await sm(region).send(
      new DeleteSecretCommand({
        SecretId: secretId,
        ForceDeleteWithoutRecovery:
          recoveryWindowInDays === 0 ? true : undefined,
        RecoveryWindowInDays:
          recoveryWindowInDays === 0
            ? undefined
            : recoveryWindowInDays,
      }),
    );
  } catch (err: unknown) {
    throw wrapAwsError(err, `deleteSecret(${secretId})`);
  }
}

/**
 * List secrets in Secrets Manager, optionally filtered by name prefix.
 *
 * Handles pagination automatically.
 *
 * @param namePrefix - Only return secrets whose name starts with this string.
 * @param region - AWS region override.
 * @returns A list of secret metadata objects.
 */
export async function listSecrets(
  namePrefix?: string,
  region?: string,
): Promise<
  Array<{
    name: string;
    arn: string;
    description?: string;
    lastChangedDate?: Date;
  }>
> {
  const secrets: Array<{
    name: string;
    arn: string;
    description?: string;
    lastChangedDate?: Date;
  }> = [];
  let nextToken: string | undefined;

  try {
    do {
      const resp = await sm(region).send(
        new ListSecretsCommand({
          Filters: namePrefix
            ? [{ Key: "name", Values: [namePrefix] }]
            : undefined,
          NextToken: nextToken,
        }),
      );

      for (const s of resp.SecretList ?? []) {
        secrets.push({
          name: s.Name ?? "",
          arn: s.ARN ?? "",
          description: s.Description || undefined,
          lastChangedDate: s.LastChangedDate,
        });
      }

      nextToken = resp.NextToken;
    } while (nextToken);
  } catch (err: unknown) {
    throw wrapAwsError(err, "listSecrets");
  }

  return secrets;
}

/**
 * Trigger an immediate rotation of a Secrets Manager secret.
 *
 * If the secret already has a rotation Lambda configured, calling this
 * without `rotationLambdaArn` triggers an immediate rotation using the
 * existing Lambda.
 *
 * @param secretId - Secret name, path, or ARN.
 * @param rotationLambdaArn - ARN of the Lambda rotation function.
 * @param rotationDays - Automatic rotation interval in days.
 * @param region - AWS region override.
 */
export async function rotateSecret(
  secretId: string,
  rotationLambdaArn?: string,
  rotationDays?: number,
  region?: string,
): Promise<void> {
  try {
    await sm(region).send(
      new RotateSecretCommand({
        SecretId: secretId,
        RotateImmediately: true,
        RotationLambdaARN: rotationLambdaArn,
        RotationRules:
          rotationLambdaArn && rotationDays !== undefined
            ? { AutomaticallyAfterDays: rotationDays }
            : undefined,
      }),
    );
  } catch (err: unknown) {
    throw wrapAwsError(err, `rotateSecret(${secretId})`);
  }
}

// ---------------------------------------------------------------------------
// Additional types (auto-generated)
// ---------------------------------------------------------------------------

/** Result of batch_get_secret_value. */
export type BatchGetSecretValueResult = {
  secretValues?: Record<string, unknown>[];
  nextToken?: string | undefined;
  errors?: Record<string, unknown>[];
};

/** Result of cancel_rotate_secret. */
export type CancelRotateSecretResult = {
  arn?: string | undefined;
  name?: string | undefined;
  versionId?: string | undefined;
};

/** Result of delete_resource_policy. */
export type DeleteResourcePolicyResult = {
  arn?: string | undefined;
  name?: string | undefined;
};

/** Result of describe_secret. */
export type DescribeSecretResult = {
  arn?: string | undefined;
  name?: string | undefined;
  description?: string | undefined;
  kmsKeyId?: string | undefined;
  rotationEnabled?: boolean | undefined;
  rotationLambdaArn?: string | undefined;
  rotationRules?: Record<string, unknown>;
  lastRotatedDate?: string | undefined;
  lastChangedDate?: string | undefined;
  lastAccessedDate?: string | undefined;
  deletedDate?: string | undefined;
  nextRotationDate?: string | undefined;
  tags?: Record<string, unknown>[];
  versionIdsToStages?: Record<string, unknown>;
  owningService?: string | undefined;
  createdDate?: string | undefined;
  primaryRegion?: string | undefined;
  replicationStatus?: Record<string, unknown>[];
};

/** Result of get_random_password. */
export type GetRandomPasswordResult = {
  randomPassword?: string | undefined;
};

/** Result of get_resource_policy. */
export type GetResourcePolicyResult = {
  arn?: string | undefined;
  name?: string | undefined;
  resourcePolicy?: string | undefined;
};

/** Result of get_secret_value. */
export type GetSecretValueResult = {
  arn?: string | undefined;
  name?: string | undefined;
  versionId?: string | undefined;
  secretBinary?: Uint8Array | undefined;
  secretString?: string | undefined;
  versionStages?: string[];
  createdDate?: string | undefined;
};

/** Result of list_secret_version_ids. */
export type ListSecretVersionIdsResult = {
  versions?: Record<string, unknown>[];
  nextToken?: string | undefined;
  arn?: string | undefined;
  name?: string | undefined;
};

/** Result of put_resource_policy. */
export type PutResourcePolicyResult = {
  arn?: string | undefined;
  name?: string | undefined;
};

/** Result of put_secret_value. */
export type PutSecretValueResult = {
  arn?: string | undefined;
  name?: string | undefined;
  versionId?: string | undefined;
  versionStages?: string[];
};

/** Result of remove_regions_from_replication. */
export type RemoveRegionsFromReplicationResult = {
  arn?: string | undefined;
  replicationStatus?: Record<string, unknown>[];
};

/** Result of replicate_secret_to_regions. */
export type ReplicateSecretToRegionsResult = {
  arn?: string | undefined;
  replicationStatus?: Record<string, unknown>[];
};

/** Result of restore_secret. */
export type RestoreSecretResult = {
  arn?: string | undefined;
  name?: string | undefined;
};

/** Result of stop_replication_to_replica. */
export type StopReplicationToReplicaResult = {
  arn?: string | undefined;
};

/** Result of update_secret_version_stage. */
export type UpdateSecretVersionStageResult = {
  arn?: string | undefined;
  name?: string | undefined;
};

/** Result of validate_resource_policy. */
export type ValidateResourcePolicyResult = {
  policyValidationPassed?: boolean | undefined;
  validationErrors?: Record<string, unknown>[];
};


// ---------------------------------------------------------------------------
// Additional functions (auto-generated)
// ---------------------------------------------------------------------------

/** Batch get secret value. */
export async function batchGetSecretValue(): Promise<BatchGetSecretValueResult> {
  try {
    // TODO: implement batch_get_secret_value
    throw new Error("batch_get_secret_value not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_get_secret_value failed");
  }
}

/** Cancel rotate secret. */
export async function cancelRotateSecret(secretId: string, regionName?: string | undefined): Promise<CancelRotateSecretResult> {
  try {
    // TODO: implement cancel_rotate_secret
    throw new Error("cancel_rotate_secret not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "cancel_rotate_secret failed");
  }
}

/** Delete resource policy. */
export async function deleteResourcePolicy(secretId: string, regionName?: string | undefined): Promise<DeleteResourcePolicyResult> {
  try {
    // TODO: implement delete_resource_policy
    throw new Error("delete_resource_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_resource_policy failed");
  }
}

/** Describe secret. */
export async function describeSecret(secretId: string, regionName?: string | undefined): Promise<DescribeSecretResult> {
  try {
    // TODO: implement describe_secret
    throw new Error("describe_secret not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_secret failed");
  }
}

/** Get random password. */
export async function getRandomPassword(): Promise<GetRandomPasswordResult> {
  try {
    // TODO: implement get_random_password
    throw new Error("get_random_password not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_random_password failed");
  }
}

/** Get resource policy. */
export async function getResourcePolicy(secretId: string, regionName?: string | undefined): Promise<GetResourcePolicyResult> {
  try {
    // TODO: implement get_resource_policy
    throw new Error("get_resource_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_resource_policy failed");
  }
}

/** Get secret value. */
export async function getSecretValue(secretId: string): Promise<GetSecretValueResult> {
  try {
    // TODO: implement get_secret_value
    throw new Error("get_secret_value not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_secret_value failed");
  }
}

/** List secret version ids. */
export async function listSecretVersionIds(secretId: string): Promise<ListSecretVersionIdsResult> {
  try {
    // TODO: implement list_secret_version_ids
    throw new Error("list_secret_version_ids not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_secret_version_ids failed");
  }
}

/** Put resource policy. */
export async function putResourcePolicy(secretId: string, resourcePolicy: string): Promise<PutResourcePolicyResult> {
  try {
    // TODO: implement put_resource_policy
    throw new Error("put_resource_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_resource_policy failed");
  }
}

/** Put secret value. */
export async function putSecretValue(secretId: string): Promise<PutSecretValueResult> {
  try {
    // TODO: implement put_secret_value
    throw new Error("put_secret_value not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_secret_value failed");
  }
}

/** Remove regions from replication. */
export async function removeRegionsFromReplication(secretId: string, removeReplicaRegions: string[], regionName?: string | undefined): Promise<RemoveRegionsFromReplicationResult> {
  try {
    // TODO: implement remove_regions_from_replication
    throw new Error("remove_regions_from_replication not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "remove_regions_from_replication failed");
  }
}

/** Replicate secret to regions. */
export async function replicateSecretToRegions(secretId: string, addReplicaRegions: Record<string, unknown>[]): Promise<ReplicateSecretToRegionsResult> {
  try {
    // TODO: implement replicate_secret_to_regions
    throw new Error("replicate_secret_to_regions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "replicate_secret_to_regions failed");
  }
}

/** Restore secret. */
export async function restoreSecret(secretId: string, regionName?: string | undefined): Promise<RestoreSecretResult> {
  try {
    // TODO: implement restore_secret
    throw new Error("restore_secret not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "restore_secret failed");
  }
}

/** Stop replication to replica. */
export async function stopReplicationToReplica(secretId: string, regionName?: string | undefined): Promise<StopReplicationToReplicaResult> {
  try {
    // TODO: implement stop_replication_to_replica
    throw new Error("stop_replication_to_replica not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "stop_replication_to_replica failed");
  }
}

/** Tag resource. */
export async function tagResource(secretId: string, tags: Record<string, unknown>[], regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement tag_resource
    throw new Error("tag_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "tag_resource failed");
  }
}

/** Untag resource. */
export async function untagResource(secretId: string, tagKeys: string[], regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement untag_resource
    throw new Error("untag_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "untag_resource failed");
  }
}

/** Update secret version stage. */
export async function updateSecretVersionStage(secretId: string, versionStage: string): Promise<UpdateSecretVersionStageResult> {
  try {
    // TODO: implement update_secret_version_stage
    throw new Error("update_secret_version_stage not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_secret_version_stage failed");
  }
}

/** Validate resource policy. */
export async function validateResourcePolicy(resourcePolicy: string): Promise<ValidateResourcePolicyResult> {
  try {
    // TODO: implement validate_resource_policy
    throw new Error("validate_resource_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "validate_resource_policy failed");
  }
}
