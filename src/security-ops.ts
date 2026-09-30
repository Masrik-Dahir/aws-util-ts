/**
 * aws-util/security-ops — Multi-service security operations.
 *
 * Provides typed helpers for security auditing and provisioning across
 * S3, IAM, KMS, Secrets Manager, SNS, Cognito, SES, SSM, CloudWatch,
 * EC2, and CloudFormation: public bucket audits, IAM key rotation,
 * KMS encryption to Secrets Manager, IAM role reports, bucket versioning
 * enforcement, Cognito bulk user creation, secret-to-SSM sync, CloudWatch
 * alarm provisioning, EC2 tagging from SSM, and CloudFormation template
 * validation with S3 storage.
 *
 * All functions obtain clients via {@link getClient} and wrap errors
 * through {@link wrapAwsError}.
 *
 * @example
 * ```ts
 * import {
 *   auditPublicS3Buckets,
 *   rotateIamAccessKey,
 *   enforceBucketVersioning,
 * } from "./security-ops.js";
 *
 * const audit = await auditPublicS3Buckets("arn:aws:sns:us-east-1:123:alerts");
 * console.log(audit.publicBuckets);
 *
 * const rotation = await rotateIamAccessKey("deploy-user", "prod/deploy-key");
 * console.log(rotation.newAccessKeyId);
 *
 * const enforced = await enforceBucketVersioning(["bucket-a", "bucket-b"]);
 * console.log(enforced);
 * ```
 *
 * @module
 */

import { z } from "zod";
import {
  S3Client,
  ListBucketsCommand,
  GetBucketPolicyStatusCommand,
  GetPublicAccessBlockCommand,
  PutBucketVersioningCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import {
  IAMClient,
  CreateAccessKeyCommand,
  DeleteAccessKeyCommand,
  ListAccessKeysCommand,
  ListRolesCommand,
} from "@aws-sdk/client-iam";
import {
  KMSClient,
  EncryptCommand,
} from "@aws-sdk/client-kms";
import {
  SecretsManagerClient,
  CreateSecretCommand,
  PutSecretValueCommand,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";
import {
  SNSClient,
  PublishCommand,
  CreateTopicCommand,
} from "@aws-sdk/client-sns";
import {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import {
  SESClient,
  SendEmailCommand,
} from "@aws-sdk/client-ses";
import {
  SSMClient,
  PutParameterCommand,
  GetParameterCommand,
} from "@aws-sdk/client-ssm";
import {
  CloudWatchClient,
  PutMetricAlarmCommand,
} from "@aws-sdk/client-cloudwatch";
import {
  EC2Client,
  CreateTagsCommand,
} from "@aws-sdk/client-ec2";
import {
  CloudFormationClient,
  ValidateTemplateCommand,
} from "@aws-sdk/client-cloudformation";
import { getClient } from "./client.js";
import {
  wrapAwsError,
  AwsServiceError,
} from "./exceptions.js";

// ---------------------------------------------------------------------------
// Zod schemas & inferred types
// ---------------------------------------------------------------------------

/** Schema for the result of a public bucket audit. */
export const PublicBucketAuditResultSchema = z.object({
  publicBuckets: z.array(z.string()),
  checkedCount: z.number(),
});

/** Result of {@link auditPublicS3Buckets}. */
export type PublicBucketAuditResult = z.infer<
  typeof PublicBucketAuditResultSchema
>;

/** Schema for the result of an IAM access key rotation. */
export const IAMKeyRotationResultSchema = z.object({
  username: z.string(),
  newAccessKeyId: z.string(),
  oldAccessKeyDeleted: z.boolean(),
});

/** Result of {@link rotateIamAccessKey}. */
export type IAMKeyRotationResult = z.infer<
  typeof IAMKeyRotationResultSchema
>;

/** Schema for the result of a CloudWatch alarm provisioning. */
export const AlarmProvisionResultSchema = z.object({
  alarmName: z.string(),
  topicArn: z.string(),
});

/** Result of {@link createCloudwatchAlarmWithSns}. */
export type AlarmProvisionResult = z.infer<
  typeof AlarmProvisionResultSchema
>;

/** Schema for the result of a Cognito user creation. */
export const CognitoUserResultSchema = z.object({
  username: z.string(),
  success: z.boolean(),
  error: z.string().optional(),
});

/** Result of a single user creation in {@link cognitoBulkCreateUsers}. */
export type CognitoUserResult = z.infer<typeof CognitoUserResultSchema>;

/** Schema for the result of a CloudFormation template validation. */
export const TemplateValidationResultSchema = z.object({
  valid: z.boolean(),
  s3Url: z.string().optional(),
  errors: z.array(z.string()).optional(),
});

/** Result of {@link validateAndStoreCfnTemplate}. */
export type TemplateValidationResult = z.infer<
  typeof TemplateValidationResultSchema
>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function s3(region?: string): S3Client {
  return getClient(S3Client, region);
}

function iam(region?: string): IAMClient {
  return getClient(IAMClient, region);
}

function kms(region?: string): KMSClient {
  return getClient(KMSClient, region);
}

function sm(region?: string): SecretsManagerClient {
  return getClient(SecretsManagerClient, region);
}

function sns(region?: string): SNSClient {
  return getClient(SNSClient, region);
}

function cognito(region?: string): CognitoIdentityProviderClient {
  return getClient(CognitoIdentityProviderClient, region);
}

function ssm(region?: string): SSMClient {
  return getClient(SSMClient, region);
}

function cw(region?: string): CloudWatchClient {
  return getClient(CloudWatchClient, region);
}

function ec2(region?: string): EC2Client {
  return getClient(EC2Client, region);
}

function cfn(region?: string): CloudFormationClient {
  return getClient(CloudFormationClient, region);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Audit all S3 buckets for public access.
 *
 * Checks each bucket's public access block configuration and policy status.
 * Optionally publishes the audit results to an SNS topic.
 *
 * @param snsTopicArn - SNS topic ARN for publishing results (optional).
 * @param region - AWS region override.
 * @returns The list of public buckets and total buckets checked.
 */
export async function auditPublicS3Buckets(
  snsTopicArn?: string,
  region?: string,
): Promise<PublicBucketAuditResult> {
  let bucketNames: string[];

  try {
    const resp = await s3(region).send(new ListBucketsCommand({}));
    bucketNames = (resp.Buckets ?? [])
      .map((b) => b.Name)
      .filter((name): name is string => name !== undefined);
  } catch (err) {
    throw wrapAwsError(err, "Failed to list S3 buckets");
  }

  const publicBuckets: string[] = [];

  for (const bucketName of bucketNames) {
    try {
      // Check public access block
      let hasPublicAccessBlock = false;
      try {
        const blockResp = await s3(region).send(
          new GetPublicAccessBlockCommand({ Bucket: bucketName }),
        );
        const config =
          blockResp.PublicAccessBlockConfiguration;
        hasPublicAccessBlock =
          (config?.BlockPublicAcls ?? false) &&
          (config?.BlockPublicPolicy ?? false) &&
          (config?.IgnorePublicAcls ?? false) &&
          (config?.RestrictPublicBuckets ?? false);
      } catch {
        // No public access block configured
        hasPublicAccessBlock = false;
      }

      if (hasPublicAccessBlock) {
        continue;
      }

      // Check bucket policy status
      try {
        const policyResp = await s3(region).send(
          new GetBucketPolicyStatusCommand({ Bucket: bucketName }),
        );
        if (policyResp.PolicyStatus?.IsPublic) {
          publicBuckets.push(bucketName);
        }
      } catch {
        // No policy or not accessible — check the access block result
        if (!hasPublicAccessBlock) {
          // Without a full public access block, consider potentially public
          publicBuckets.push(bucketName);
        }
      }
    } catch {
      // Skip buckets we can't inspect
    }
  }

  const result = PublicBucketAuditResultSchema.parse({
    publicBuckets,
    checkedCount: bucketNames.length,
  });

  // Optionally notify via SNS
  if (snsTopicArn && publicBuckets.length > 0) {
    try {
      await sns(region).send(
        new PublishCommand({
          TopicArn: snsTopicArn,
          Subject: "Public S3 Bucket Audit Alert",
          Message: JSON.stringify({
            event: "PublicBucketAudit",
            publicBuckets,
            checkedCount: bucketNames.length,
            timestamp: new Date().toISOString(),
          }),
        }),
      );
    } catch {
      // Notification failure is non-fatal
    }
  }

  return result;
}

/**
 * Rotate an IAM user's access key and store the new key in Secrets Manager.
 *
 * Creates a new access key for the user, stores it in the specified secret,
 * then deletes the oldest existing key.
 *
 * @param username - The IAM username.
 * @param secretName - The Secrets Manager secret name to store the new key.
 * @param region - AWS region override.
 * @returns The new access key ID and whether the old key was deleted.
 */
export async function rotateIamAccessKey(
  username: string,
  secretName: string,
  region?: string,
): Promise<IAMKeyRotationResult> {
  // List existing keys
  let existingKeys: Array<{ AccessKeyId?: string; Status?: string }>;
  try {
    const listResp = await iam(region).send(
      new ListAccessKeysCommand({ UserName: username }),
    );
    existingKeys = listResp.AccessKeyMetadata ?? [];
  } catch (err) {
    throw wrapAwsError(
      err,
      `Failed to list access keys for user ${username}`,
    );
  }

  // Create new key
  let newKeyId: string;
  let newSecretKey: string;
  try {
    const createResp = await iam(region).send(
      new CreateAccessKeyCommand({ UserName: username }),
    );
    newKeyId = createResp.AccessKey?.AccessKeyId ?? "";
    newSecretKey = createResp.AccessKey?.SecretAccessKey ?? "";
  } catch (err) {
    throw wrapAwsError(
      err,
      `Failed to create new access key for user ${username}`,
    );
  }

  // Store new key in Secrets Manager
  const secretValue = JSON.stringify({
    accessKeyId: newKeyId,
    secretAccessKey: newSecretKey,
    username,
    rotatedAt: new Date().toISOString(),
  });

  try {
    await sm(region).send(
      new PutSecretValueCommand({
        SecretId: secretName,
        SecretString: secretValue,
      }),
    );
  } catch (err) {
    // Secret may not exist yet; try creating it
    try {
      await sm(region).send(
        new CreateSecretCommand({
          Name: secretName,
          SecretString: secretValue,
        }),
      );
    } catch (createErr) {
      throw wrapAwsError(
        createErr,
        `Failed to store new access key in secret ${secretName}`,
      );
    }
  }

  // Delete oldest existing key
  let oldKeyDeleted = false;
  if (existingKeys.length > 0) {
    const oldestKey = existingKeys[0];
    if (oldestKey.AccessKeyId) {
      try {
        await iam(region).send(
          new DeleteAccessKeyCommand({
            UserName: username,
            AccessKeyId: oldestKey.AccessKeyId,
          }),
        );
        oldKeyDeleted = true;
      } catch {
        // Old key deletion failure is non-fatal
        oldKeyDeleted = false;
      }
    }
  }

  return IAMKeyRotationResultSchema.parse({
    username,
    newAccessKeyId: newKeyId,
    oldAccessKeyDeleted: oldKeyDeleted,
  });
}

/**
 * Encrypt plaintext with KMS and store the result in Secrets Manager.
 *
 * @param plaintext - The plaintext string to encrypt.
 * @param secretName - The Secrets Manager secret name to store the ciphertext.
 * @param kmsKeyId - The KMS key ID or alias to use for encryption.
 * @param region - AWS region override.
 * @returns The secret ARN where the ciphertext is stored.
 */
export async function kmsEncryptToSecret(
  plaintext: string,
  secretName: string,
  kmsKeyId: string,
  region?: string,
): Promise<string> {
  // Encrypt with KMS
  let ciphertextBase64: string;
  try {
    const encResp = await kms(region).send(
      new EncryptCommand({
        KeyId: kmsKeyId,
        Plaintext: new TextEncoder().encode(plaintext),
      }),
    );

    if (!encResp.CiphertextBlob) {
      throw new AwsServiceError("KMS encryption returned no ciphertext");
    }

    // Convert to base64 for storage
    ciphertextBase64 = Buffer.from(encResp.CiphertextBlob).toString(
      "base64",
    );
  } catch (err) {
    if (err instanceof AwsServiceError) {
      throw err;
    }
    throw wrapAwsError(err, "Failed to encrypt with KMS");
  }

  // Store in Secrets Manager
  const secretValue = JSON.stringify({
    ciphertext: ciphertextBase64,
    kmsKeyId,
    encryptedAt: new Date().toISOString(),
  });

  try {
    await sm(region).send(
      new PutSecretValueCommand({
        SecretId: secretName,
        SecretString: secretValue,
      }),
    );
  } catch {
    // Secret may not exist; try creating
    try {
      const createResp = await sm(region).send(
        new CreateSecretCommand({
          Name: secretName,
          SecretString: secretValue,
        }),
      );
      return createResp.ARN ?? secretName;
    } catch (createErr) {
      throw wrapAwsError(
        createErr,
        `Failed to store encrypted value in secret ${secretName}`,
      );
    }
  }

  return secretName;
}

/**
 * Generate a JSON report of all IAM roles and upload it to S3.
 *
 * Lists all IAM roles with their ARNs, creation dates, and descriptions,
 * and writes the report as a JSON file to the specified S3 location.
 *
 * @param s3Bucket - The destination S3 bucket.
 * @param s3Key - The destination S3 key.
 * @param region - AWS region override.
 * @returns The S3 URI of the uploaded report.
 */
export async function iamRolesReportToS3(
  s3Bucket: string,
  s3Key: string,
  region?: string,
): Promise<string> {
  const roles: Array<{
    roleName: string;
    arn: string;
    createDate?: string;
    description?: string;
    path?: string;
  }> = [];

  let marker: string | undefined;

  try {
    do {
      const resp = await iam(region).send(
        new ListRolesCommand({ Marker: marker }),
      );

      for (const role of resp.Roles ?? []) {
        roles.push({
          roleName: role.RoleName ?? "",
          arn: role.Arn ?? "",
          createDate: role.CreateDate?.toISOString(),
          description: role.Description,
          path: role.Path,
        });
      }

      marker = resp.IsTruncated ? resp.Marker : undefined;
    } while (marker);
  } catch (err) {
    throw wrapAwsError(err, "Failed to list IAM roles");
  }

  const report = JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      roleCount: roles.length,
      roles,
    },
    null,
    2,
  );

  try {
    await s3(region).send(
      new PutObjectCommand({
        Bucket: s3Bucket,
        Key: s3Key,
        Body: report,
        ContentType: "application/json",
      }),
    );
  } catch (err) {
    throw wrapAwsError(
      err,
      `Failed to upload IAM roles report to s3://${s3Bucket}/${s3Key}`,
    );
  }

  return `s3://${s3Bucket}/${s3Key}`;
}

/**
 * Enable versioning on a list of S3 buckets.
 *
 * Optionally sends an SNS notification with the list of buckets that
 * had versioning enabled.
 *
 * @param bucketNames - The S3 bucket names to enable versioning on.
 * @param snsTopicArn - SNS topic ARN for notification (optional).
 * @param region - AWS region override.
 * @returns The list of bucket names that had versioning successfully enabled.
 */
export async function enforceBucketVersioning(
  bucketNames: string[],
  snsTopicArn?: string,
  region?: string,
): Promise<string[]> {
  const enabled: string[] = [];

  for (const bucketName of bucketNames) {
    try {
      await s3(region).send(
        new PutBucketVersioningCommand({
          Bucket: bucketName,
          VersioningConfiguration: { Status: "Enabled" },
        }),
      );
      enabled.push(bucketName);
    } catch {
      // Skip buckets where versioning cannot be enabled
    }
  }

  // Notify if requested
  if (snsTopicArn && enabled.length > 0) {
    try {
      await sns(region).send(
        new PublishCommand({
          TopicArn: snsTopicArn,
          Subject: "Bucket Versioning Enforcement",
          Message: JSON.stringify({
            event: "VersioningEnforced",
            buckets: enabled,
            timestamp: new Date().toISOString(),
          }),
        }),
      );
    } catch {
      // Notification failure is non-fatal
    }
  }

  return enabled;
}

/**
 * Create multiple Cognito users in bulk.
 *
 * Each user is created with an email attribute and optionally sent a
 * welcome email via SES. Failures for individual users do not stop
 * the batch.
 *
 * @param userPoolId - The Cognito user pool ID.
 * @param users - Array of users to create (username + email).
 * @param fromEmail - The SES sender address for welcome emails (optional).
 * @param region - AWS region override.
 * @returns Array of results, one per user.
 */
export async function cognitoBulkCreateUsers(
  userPoolId: string,
  users: Array<{ username: string; email: string }>,
  fromEmail?: string,
  region?: string,
): Promise<CognitoUserResult[]> {
  const results: CognitoUserResult[] = [];

  for (const user of users) {
    try {
      await cognito(region).send(
        new AdminCreateUserCommand({
          UserPoolId: userPoolId,
          Username: user.username,
          UserAttributes: [
            { Name: "email", Value: user.email },
            { Name: "email_verified", Value: "true" },
          ],
          DesiredDeliveryMediums: ["EMAIL"],
        }),
      );

      // Send welcome email if fromEmail is provided
      if (fromEmail) {
        try {
          const sesClient = getClient(SESClient, region);
          await sesClient.send(
            new SendEmailCommand({
              Source: fromEmail,
              Destination: { ToAddresses: [user.email] },
              Message: {
                Subject: { Data: "Welcome!" },
                Body: {
                  Text: {
                    Data: `Welcome ${user.username}! Your account has been created.`,
                  },
                },
              },
            }),
          );
        } catch {
          // Welcome email failure is non-fatal
        }
      }

      results.push(
        CognitoUserResultSchema.parse({
          username: user.username,
          success: true,
        }),
      );
    } catch (err) {
      const wrapped = wrapAwsError(err);
      results.push(
        CognitoUserResultSchema.parse({
          username: user.username,
          success: false,
          error: wrapped.message,
        }),
      );
    }
  }

  return results;
}

/**
 * Sync a Secrets Manager secret's JSON fields to SSM Parameter Store.
 *
 * Retrieves the secret, parses it as JSON, and writes each top-level
 * key-value pair as an SSM SecureString parameter under the given path.
 *
 * @param secretId - The secret name or ARN.
 * @param ssmPath - The SSM parameter path prefix (e.g. `/app/prod/`).
 * @param kmsKeyId - KMS key for SSM encryption (optional, uses default).
 * @param region - AWS region override.
 * @returns A map of SSM parameter names to their values.
 */
export async function syncSecretToSsm(
  secretId: string,
  ssmPath: string,
  kmsKeyId?: string,
  region?: string,
): Promise<Record<string, string>> {
  // Get secret value
  let secretData: Record<string, string>;
  try {
    const resp = await sm(region).send(
      new GetSecretValueCommand({ SecretId: secretId }),
    );
    if (!resp.SecretString) {
      throw new AwsServiceError(
        `Secret ${secretId} is binary, not JSON`,
      );
    }
    secretData = JSON.parse(resp.SecretString) as Record<string, string>;
  } catch (err) {
    if (err instanceof AwsServiceError) {
      throw err;
    }
    throw wrapAwsError(err, `Failed to get secret ${secretId}`);
  }

  // Write each field to SSM
  const path = ssmPath.endsWith("/") ? ssmPath : `${ssmPath}/`;
  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(secretData)) {
    const paramName = `${path}${key}`;
    try {
      await ssm(region).send(
        new PutParameterCommand({
          Name: paramName,
          Value: String(value),
          Type: "SecureString",
          Overwrite: true,
          KeyId: kmsKeyId,
        }),
      );
      result[paramName] = String(value);
    } catch (err) {
      throw wrapAwsError(
        err,
        `Failed to write SSM parameter ${paramName}`,
      );
    }
  }

  return result;
}

/**
 * Create a CloudWatch metric alarm with an SNS notification topic.
 *
 * Creates the SNS topic (idempotent) if it does not exist, then creates
 * the CloudWatch alarm configured to fire to that topic.
 *
 * @param alarmName - The CloudWatch alarm name.
 * @param namespace - The CloudWatch metric namespace.
 * @param metricName - The metric name to monitor.
 * @param threshold - The threshold value for the alarm.
 * @param topicName - The SNS topic name for alarm actions.
 * @param options - Additional alarm configuration options.
 * @param region - AWS region override.
 * @returns The alarm name and topic ARN.
 */
export async function createCloudwatchAlarmWithSns(
  alarmName: string,
  namespace: string,
  metricName: string,
  threshold: number,
  topicName: string,
  options?: {
    comparisonOperator?: string;
    evaluationPeriods?: number;
    period?: number;
    statistic?: string;
    description?: string;
    dimensions?: Array<{ Name: string; Value: string }>;
  },
  region?: string,
): Promise<AlarmProvisionResult> {
  // Create or get SNS topic
  let topicArn: string;
  try {
    const topicResp = await sns(region).send(
      new CreateTopicCommand({ Name: topicName }),
    );
    topicArn = topicResp.TopicArn ?? "";
  } catch (err) {
    throw wrapAwsError(err, `Failed to create SNS topic ${topicName}`);
  }

  // Create the alarm
  try {
    await cw(region).send(
      new PutMetricAlarmCommand({
        AlarmName: alarmName,
        Namespace: namespace,
        MetricName: metricName,
        Threshold: threshold,
        ComparisonOperator:
          (options?.comparisonOperator as
            | "GreaterThanThreshold"
            | "GreaterThanOrEqualToThreshold"
            | "LessThanThreshold"
            | "LessThanOrEqualToThreshold") ??
          "GreaterThanThreshold",
        EvaluationPeriods: options?.evaluationPeriods ?? 1,
        Period: options?.period ?? 300,
        Statistic:
          (options?.statistic as
            | "Average"
            | "Sum"
            | "Minimum"
            | "Maximum"
            | "SampleCount") ?? "Average",
        AlarmDescription: options?.description,
        AlarmActions: [topicArn],
        OKActions: [topicArn],
        Dimensions: options?.dimensions,
      }),
    );
  } catch (err) {
    throw wrapAwsError(
      err,
      `Failed to create CloudWatch alarm ${alarmName}`,
    );
  }

  return AlarmProvisionResultSchema.parse({
    alarmName,
    topicArn,
  });
}

/**
 * Tag EC2 instances with values from an SSM parameter.
 *
 * Reads a JSON object from the specified SSM parameter and applies
 * each key-value pair as a tag to the given EC2 instances.
 *
 * @param instanceIds - The EC2 instance IDs to tag.
 * @param ssmParamName - The SSM parameter containing a JSON object of tags.
 * @param region - AWS region override.
 * @returns A map of instance IDs to the tag keys applied.
 */
export async function tagEc2InstancesFromSsm(
  instanceIds: string[],
  ssmParamName: string,
  region?: string,
): Promise<Record<string, string[]>> {
  // Get tags from SSM
  let tags: Record<string, string>;
  try {
    const resp = await ssm(region).send(
      new GetParameterCommand({
        Name: ssmParamName,
        WithDecryption: true,
      }),
    );
    tags = JSON.parse(resp.Parameter?.Value ?? "{}") as Record<
      string,
      string
    >;
  } catch (err) {
    throw wrapAwsError(
      err,
      `Failed to get tags from SSM parameter ${ssmParamName}`,
    );
  }

  const tagList = Object.entries(tags).map(([Key, Value]) => ({
    Key,
    Value,
  }));
  const tagKeys = Object.keys(tags);

  const result: Record<string, string[]> = {};

  // Tag instances in batches (CreateTags supports multiple instances)
  try {
    await ec2(region).send(
      new CreateTagsCommand({
        Resources: instanceIds,
        Tags: tagList,
      }),
    );

    for (const id of instanceIds) {
      result[id] = tagKeys;
    }
  } catch (err) {
    throw wrapAwsError(
      err,
      `Failed to tag EC2 instances from SSM parameter ${ssmParamName}`,
    );
  }

  return result;
}

/**
 * Validate a CloudFormation template and store it in S3.
 *
 * Validates the template via the CloudFormation API, and if valid,
 * uploads it to the specified S3 location.
 *
 * @param template - The CloudFormation template as a JavaScript object.
 * @param s3Bucket - The S3 bucket for storing the template.
 * @param s3Key - The S3 key for storing the template.
 * @param region - AWS region override.
 * @returns The validation result including S3 URL if stored.
 */
// ---------------------------------------------------------------------------
// Extended security-ops schemas
// ---------------------------------------------------------------------------

/** Schema for a Cognito group sync to DynamoDB result. */
export const CognitoGroupSyncResultSchema = z.object({
  userPoolId: z.string(),
  groupName: z.string(),
  tableName: z.string(),
  usersSynced: z.number(),
});
/** Cognito group sync to DynamoDB result. */
export type CognitoGroupSyncResult = z.infer<typeof CognitoGroupSyncResultSchema>;

/** Schema for a CloudFront signed URL factory result. */
export const CloudfrontSignedUrlResultSchema = z.object({
  resourceUrl: z.string(),
  signedUrl: z.string(),
  expiresAt: z.string(),
  keyPairId: z.string(),
});
/** CloudFront signed URL factory result. */
export type CloudfrontSignedUrlResult = z.infer<typeof CloudfrontSignedUrlResultSchema>;

/** Schema for a WAF IP blocklist updater result. */
export const WafIpBlocklistResultSchema = z.object({
  webAclId: z.string(),
  ipSetId: z.string(),
  addressesAdded: z.number(),
  addressesRemoved: z.number(),
});
/** WAF IP blocklist updater result. */
export type WafIpBlocklistResult = z.infer<typeof WafIpBlocklistResultSchema>;

/** Schema for a Shield Advanced protection manager result. */
export const ShieldProtectionResultSchema = z.object({
  resourceArn: z.string(),
  protectionId: z.string(),
  action: z.string(),
  success: z.boolean(),
});
/** Shield Advanced protection manager result. */
export type ShieldProtectionResult = z.infer<typeof ShieldProtectionResultSchema>;

/** Schema for an ACM certificate expiry monitor result. */
export const AcmCertificateExpiryResultSchema = z.object({
  certificatesChecked: z.number(),
  expiringCertificates: z.array(z.object({
    arn: z.string(),
    domain: z.string(),
    expiresAt: z.string(),
    daysRemaining: z.number(),
  })),
  alertSent: z.boolean(),
});
/** ACM certificate expiry monitor result. */
export type AcmCertificateExpiryResult = z.infer<typeof AcmCertificateExpiryResultSchema>;

/** Schema for a Cognito pre-token enricher result. */
export const CognitoPreTokenEnricherResultSchema = z.object({
  userPoolId: z.string(),
  triggerFunctionArn: z.string(),
  claimsAdded: z.array(z.string()),
  configured: z.boolean(),
});
/** Cognito pre-token enricher result. */
export type CognitoPreTokenEnricherResult = z.infer<typeof CognitoPreTokenEnricherResultSchema>;

// ---------------------------------------------------------------------------
// Extended security-ops functions
// ---------------------------------------------------------------------------

/** Sync Cognito user pool group members to a DynamoDB table. */
export async function cognitoGroupSyncToDynamodb(
  userPoolId: string,
  groupName: string,
  tableName: string,
  region?: string,
): Promise<CognitoGroupSyncResult> {
  const client = cognito(region);
  try {
    // TODO: implement cognitoGroupSyncToDynamodb
    throw new Error("cognitoGroupSyncToDynamodb not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "cognitoGroupSyncToDynamodb failed");
  }
}

/** Generate a signed CloudFront URL for private content delivery. */
export async function cloudfrontSignedUrlFactory(
  distributionDomain: string,
  resourcePath: string,
  privateKeySecret: string,
  keyPairId: string,
  expiresInSeconds?: number,
  region?: string,
): Promise<CloudfrontSignedUrlResult> {
  const client = s3(region);
  try {
    // TODO: implement cloudfrontSignedUrlFactory
    throw new Error("cloudfrontSignedUrlFactory not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "cloudfrontSignedUrlFactory failed");
  }
}

/** Update a WAFv2 IP set with a new list of blocked CIDR addresses. */
export async function wafIpBlocklistUpdater(
  webAclId: string,
  ipSetId: string,
  ipSetName: string,
  scope: "CLOUDFRONT" | "REGIONAL",
  addressesToAdd: string[],
  addressesToRemove?: string[],
  region?: string,
): Promise<WafIpBlocklistResult> {
  const client = s3(region);
  try {
    // TODO: implement wafIpBlocklistUpdater
    throw new Error("wafIpBlocklistUpdater not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "wafIpBlocklistUpdater failed");
  }
}

/** Enable or disable AWS Shield Advanced protection on a resource ARN. */
export async function shieldAdvancedProtectionManager(
  resourceArn: string,
  action: "enable" | "disable",
  region?: string,
): Promise<ShieldProtectionResult> {
  const client = s3(region);
  try {
    // TODO: implement shieldAdvancedProtectionManager
    throw new Error("shieldAdvancedProtectionManager not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "shieldAdvancedProtectionManager failed");
  }
}

/** Scan ACM certificates for upcoming expiry and send SNS alerts. */
export async function acmCertificateExpiryMonitor(
  daysThreshold: number,
  snsTopicArn?: string,
  region?: string,
): Promise<AcmCertificateExpiryResult> {
  const client = s3(region);
  try {
    // TODO: implement acmCertificateExpiryMonitor
    throw new Error("acmCertificateExpiryMonitor not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "acmCertificateExpiryMonitor failed");
  }
}

/** Configure a Cognito pre-token generation trigger Lambda to enrich JWT claims. */
export async function cognitoPreTokenEnricher(
  userPoolId: string,
  triggerFunctionArn: string,
  claimsToAdd: Record<string, string>,
  region?: string,
): Promise<CognitoPreTokenEnricherResult> {
  const client = cognito(region);
  try {
    // TODO: implement cognitoPreTokenEnricher
    throw new Error("cognitoPreTokenEnricher not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "cognitoPreTokenEnricher failed");
  }
}

export async function validateAndStoreCfnTemplate(
  template: object,
  s3Bucket: string,
  s3Key: string,
  region?: string,
): Promise<TemplateValidationResult> {
  const templateBody = JSON.stringify(template, null, 2);

  // Validate template
  try {
    await cfn(region).send(
      new ValidateTemplateCommand({
        TemplateBody: templateBody,
      }),
    );
  } catch (err) {
    const wrapped = wrapAwsError(err);
    return TemplateValidationResultSchema.parse({
      valid: false,
      errors: [wrapped.message],
    });
  }

  // Upload to S3
  try {
    await s3(region).send(
      new PutObjectCommand({
        Bucket: s3Bucket,
        Key: s3Key,
        Body: templateBody,
        ContentType: "application/json",
      }),
    );
  } catch (err) {
    throw wrapAwsError(
      err,
      `Template is valid but failed to upload to s3://${s3Bucket}/${s3Key}`,
    );
  }

  return TemplateValidationResultSchema.parse({
    valid: true,
    s3Url: `https://${s3Bucket}.s3.amazonaws.com/${s3Key}`,
  });
}
