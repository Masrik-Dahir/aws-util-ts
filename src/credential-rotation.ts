/**
 * aws-util/credential-rotation — Automated database credential rotation.
 *
 * Multi-service module combining Secrets Manager + RDS + SNS to provide
 * secure, automated credential rotation for database instances.
 *
 * All functions obtain clients via {@link getClient} and wrap errors
 * through {@link wrapAwsError}.
 *
 * @example
 * ```ts
 * import { databaseCredentialRotator } from "./credential-rotation.js";
 *
 * const result = await databaseCredentialRotator(
 *   "prod/db-credentials",
 *   "arn:aws:sns:us-east-1:123456789012:rotation-notifications",
 * );
 * ```
 *
 * @module
 */

import { z } from "zod";
import {
  SecretsManagerClient,
  GetSecretValueCommand,
  PutSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";
import {
  RDSClient,
  ModifyDBInstanceCommand,
} from "@aws-sdk/client-rds";
import {
  SNSClient,
  PublishCommand,
} from "@aws-sdk/client-sns";
import { getClient } from "./client.js";
import { wrapAwsError } from "./exceptions.js";

// ---------------------------------------------------------------------------
// Zod schemas & inferred types
// ---------------------------------------------------------------------------

/** Schema for credential rotation results. */
export const CredentialRotationResultSchema = z.object({
  secretName: z.string(),
  rotated: z.boolean(),
  notified: z.boolean(),
  error: z.string().optional(),
});

/** Result of a credential rotation operation. */
export type CredentialRotationResult = z.infer<
  typeof CredentialRotationResultSchema
>;

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Generate a secure random password.
 *
 * Produces a 32-character password using alphanumeric characters and
 * common special characters.
 */
function defaultPasswordGenerator(): string {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => chars[b % chars.length])
    .join("");
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Rotate database credentials stored in Secrets Manager.
 *
 * Retrieves the current secret (expected to contain `host`, `port`,
 * `username`, `password`, and `dbInstanceIdentifier`), generates a new
 * password, updates the RDS instance master password, stores the new
 * credentials in Secrets Manager, and optionally notifies via SNS.
 *
 * @param secretName - Secrets Manager secret name or ARN.
 * @param snsTopicArn - Optional SNS topic for rotation notifications.
 * @param generatePassword - Optional custom password generator function.
 * @param region - AWS region. Defaults to SDK default.
 * @returns Rotation result with success/failure status.
 *
 * @example
 * ```ts
 * const result = await databaseCredentialRotator(
 *   "prod/postgres-credentials",
 *   "arn:aws:sns:us-east-1:123456789012:ops-alerts",
 *   () => crypto.randomUUID().replace(/-/g, ""),
 * );
 * ```
 */
export async function databaseCredentialRotator(
  secretName: string,
  snsTopicArn?: string,
  generatePassword?: () => string,
  region?: string,
): Promise<CredentialRotationResult> {
  try {
    const sm = getClient(SecretsManagerClient, region);
    const rds = getClient(RDSClient, region);

    // Step 1: Get current secret value
    const getResp = await sm.send(
      new GetSecretValueCommand({
        SecretId: secretName,
      }),
    );

    const secretString = getResp.SecretString;
    if (!secretString) {
      throw new Error(
        `Secret ${secretName} has no string value`,
      );
    }

    const currentSecret = JSON.parse(secretString) as Record<
      string,
      unknown
    >;
    const dbInstanceId = currentSecret[
      "dbInstanceIdentifier"
    ] as string | undefined;
    if (!dbInstanceId) {
      throw new Error(
        `Secret ${secretName} missing dbInstanceIdentifier`,
      );
    }

    // Step 2: Generate new password
    const newPassword = generatePassword
      ? generatePassword()
      : defaultPasswordGenerator();

    // Step 3: Update RDS master password
    await rds.send(
      new ModifyDBInstanceCommand({
        DBInstanceIdentifier: dbInstanceId,
        MasterUserPassword: newPassword,
        ApplyImmediately: true,
      }),
    );

    // Step 4: Update secret with new credentials
    const updatedSecret = {
      ...currentSecret,
      password: newPassword,
      lastRotated: new Date().toISOString(),
    };

    await sm.send(
      new PutSecretValueCommand({
        SecretId: secretName,
        SecretString: JSON.stringify(updatedSecret),
      }),
    );

    // Step 5: Notify via SNS if configured
    let notified = false;
    if (snsTopicArn) {
      const sns = getClient(SNSClient, region);
      await sns.send(
        new PublishCommand({
          TopicArn: snsTopicArn,
          Subject: `Credential Rotation: ${secretName}`,
          Message: JSON.stringify(
            {
              secretName,
              dbInstanceId,
              rotatedAt: new Date().toISOString(),
              status: "SUCCESS",
            },
            null,
            2,
          ),
        }),
      );
      notified = true;
    }

    const result: CredentialRotationResult = {
      secretName,
      rotated: true,
      notified,
    };
    return CredentialRotationResultSchema.parse(result);
  } catch (err) {
    // If already an AwsUtilError from wrapAwsError, re-throw
    const wrappedErr = wrapAwsError(
      err,
      "databaseCredentialRotator failed",
    );

    // Return a failure result rather than throwing for operational errors
    const result: CredentialRotationResult = {
      secretName,
      rotated: false,
      notified: false,
      error: wrappedErr.message,
    };
    return CredentialRotationResultSchema.parse(result);
  }
}
