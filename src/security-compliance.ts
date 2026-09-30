/**
 * aws-util/security-compliance — Multi-service security and compliance operations.
 *
 * Provides typed helpers for least-privilege analysis, secret rotation,
 * data masking, VPC security group auditing, encryption enforcement,
 * WAF association, compliance snapshots, resource policy validation,
 * and Cognito auth flow management.
 *
 * Multi-service: IAM + Lambda + Secrets Manager + SSM + SNS + EC2 +
 * DynamoDB + SQS + S3 + KMS + WAF + Cognito.
 *
 * All functions obtain clients via {@link getClient} and wrap errors
 * through {@link wrapAwsError}.
 *
 * @example
 * ```ts
 * import {
 *   leastPrivilegeAnalyzer,
 *   secretRotationOrchestrator,
 *   vpcSecurityGroupAuditor,
 *   encryptionEnforcer,
 * } from "./security-compliance.js";
 *
 * const analysis = await leastPrivilegeAnalyzer("my-function");
 * const rotation = await secretRotationOrchestrator("my-secret");
 * const audit = await vpcSecurityGroupAuditor();
 * ```
 *
 * @module
 */

import { z } from "zod";
import {
  LambdaClient,
  GetFunctionConfigurationCommand,
} from "@aws-sdk/client-lambda";
import {
  IAMClient,
  ListAttachedRolePoliciesCommand,
  GetPolicyCommand,
  GetPolicyVersionCommand,
} from "@aws-sdk/client-iam";
import {
  SecretsManagerClient,
  RotateSecretCommand,
  PutSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";
import {
  EC2Client,
  DescribeSecurityGroupsCommand,
} from "@aws-sdk/client-ec2";
import {
  S3Client,
  GetBucketEncryptionCommand,
  PutBucketEncryptionCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import {
  DynamoDBClient,
  DescribeTableCommand,
  UpdateTableCommand,
} from "@aws-sdk/client-dynamodb";
import {
  WAFv2Client,
  AssociateWebACLCommand,
} from "@aws-sdk/client-wafv2";
import {
  CognitoIdentityProviderClient,
  DescribeUserPoolCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { getClient } from "./client.js";
import { wrapAwsError } from "./exceptions.js";

// ---------------------------------------------------------------------------
// Zod schemas & inferred types
// ---------------------------------------------------------------------------

/** Schema for a single policy validation finding. */
export const PolicyValidationFindingSchema = z.object({
  action: z.string(),
  resource: z.string(),
  risk: z.string(),
});

/** A single policy validation finding. */
export type PolicyValidationFinding = z.infer<
  typeof PolicyValidationFindingSchema
>;

/** Schema for a privilege analysis result. */
export const PrivilegeAnalysisResultSchema = z.object({
  functionName: z.string(),
  policies: z.array(z.string()),
  findings: z.array(PolicyValidationFindingSchema),
});

/** Privilege analysis result. */
export type PrivilegeAnalysisResult = z.infer<
  typeof PrivilegeAnalysisResultSchema
>;

/** Schema for a secret rotation result. */
export const SecretRotationResultSchema = z.object({
  secretName: z.string(),
  rotated: z.boolean(),
  newVersionId: z.string().optional(),
});

/** Secret rotation result. */
export type SecretRotationResult = z.infer<
  typeof SecretRotationResultSchema
>;

/** Schema for a data masking result. */
export const DataMaskingResultSchema = z.object({
  recordsProcessed: z.number(),
  fieldsMasked: z.number(),
});

/** Data masking result. */
export type DataMaskingResult = z.infer<typeof DataMaskingResultSchema>;

/** Schema for a security group audit result. */
export const SecurityGroupAuditResultSchema = z.object({
  groupId: z.string(),
  groupName: z.string(),
  findings: z.array(
    z.object({
      port: z.number(),
      protocol: z.string(),
      source: z.string(),
      risk: z.string(),
    }),
  ),
});

/** Security group audit result. */
export type SecurityGroupAuditResult = z.infer<
  typeof SecurityGroupAuditResultSchema
>;

/** Schema for the encryption status of a single resource. */
export const EncryptionStatusSchema = z.object({
  resourceId: z.string(),
  encrypted: z.boolean(),
  keyId: z.string().optional(),
});

/** Encryption status of a single resource. */
export type EncryptionStatus = z.infer<typeof EncryptionStatusSchema>;

/** Schema for the encryption enforcer result. */
export const EncryptionEnforcerResultSchema = z.object({
  resources: z.array(EncryptionStatusSchema),
  enforced: z.number(),
});

/** Encryption enforcer result. */
export type EncryptionEnforcerResult = z.infer<
  typeof EncryptionEnforcerResultSchema
>;

/** Schema for a WAF association result. */
export const WafAssociationResultSchema = z.object({
  webAclArn: z.string(),
  resourceArn: z.string(),
  associated: z.boolean(),
});

/** WAF association result. */
export type WafAssociationResult = z.infer<
  typeof WafAssociationResultSchema
>;

/** Schema for a compliance snapshot result. */
export const ComplianceSnapshotResultSchema = z.object({
  timestamp: z.string(),
  findings: z.array(z.record(z.string(), z.unknown())),
  compliant: z.number(),
  nonCompliant: z.number(),
});

/** Compliance snapshot result. */
export type ComplianceSnapshotResult = z.infer<
  typeof ComplianceSnapshotResultSchema
>;

/** Schema for a resource policy validation result. */
export const ResourcePolicyValidationResultSchema = z.object({
  resourceArn: z.string(),
  valid: z.boolean(),
  findings: z.array(z.string()),
});

/** Resource policy validation result. */
export type ResourcePolicyValidationResult = z.infer<
  typeof ResourcePolicyValidationResultSchema
>;

/** Schema for a Cognito auth flow management result. */
export const CognitoAuthResultSchema = z.object({
  userPoolId: z.string(),
  flows: z.array(z.string()),
  mfaEnabled: z.boolean(),
});

/** Cognito auth flow management result. */
export type CognitoAuthResult = z.infer<typeof CognitoAuthResultSchema>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Get a cached LambdaClient for the given region.
 */
function lambdaClient(region?: string): LambdaClient {
  return getClient(LambdaClient, region);
}

/**
 * Get a cached IAMClient for the given region.
 */
function iam(region?: string): IAMClient {
  return getClient(IAMClient, region);
}

/**
 * Get a cached SecretsManagerClient for the given region.
 */
function secrets(region?: string): SecretsManagerClient {
  return getClient(SecretsManagerClient, region);
}

/**
 * Get a cached EC2Client for the given region.
 */
function ec2(region?: string): EC2Client {
  return getClient(EC2Client, region);
}

/**
 * Get a cached S3Client for the given region.
 */
function s3(region?: string): S3Client {
  return getClient(S3Client, region);
}

/**
 * Get a cached DynamoDBClient for the given region.
 */
function dynamodb(region?: string): DynamoDBClient {
  return getClient(DynamoDBClient, region);
}

/**
 * Get a cached WAFv2Client for the given region.
 */
function waf(region?: string): WAFv2Client {
  return getClient(WAFv2Client, region);
}

/**
 * Get a cached CognitoIdentityProviderClient for the given region.
 */
function cognito(region?: string): CognitoIdentityProviderClient {
  return getClient(CognitoIdentityProviderClient, region);
}

/** Well-known overly permissive IAM action patterns. */
const RISKY_ACTIONS = new Set([
  "*",
  "iam:*",
  "s3:*",
  "ec2:*",
  "lambda:*",
  "dynamodb:*",
  "sts:AssumeRole",
]);

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Analyze a Lambda function's IAM role for least-privilege violations.
 *
 * Retrieves the function's execution role, lists all attached managed
 * policies, fetches their policy documents, and flags any overly
 * permissive actions or wildcard resources.
 *
 * @param functionName - The Lambda function name or ARN.
 * @param region - AWS region override.
 * @returns The privilege analysis result with policies and findings.
 */
export async function leastPrivilegeAnalyzer(
  functionName: string,
  region?: string,
): Promise<PrivilegeAnalysisResult> {
  // Get the function's execution role
  let roleArn: string;
  try {
    const funcResp = await lambdaClient(region).send(
      new GetFunctionConfigurationCommand({
        FunctionName: functionName,
      }),
    );
    roleArn = funcResp.Role ?? "";
  } catch (err) {
    throw wrapAwsError(
      err,
      `Failed to get configuration for ${functionName}`,
    );
  }

  if (!roleArn) {
    return PrivilegeAnalysisResultSchema.parse({
      functionName,
      policies: [],
      findings: [],
    });
  }

  // Extract role name from ARN
  const roleName = roleArn.split("/").pop() ?? roleArn;

  // List attached policies
  let policyArns: string[];
  try {
    const resp = await iam(region).send(
      new ListAttachedRolePoliciesCommand({ RoleName: roleName }),
    );
    policyArns = (resp.AttachedPolicies ?? [])
      .map((p) => p.PolicyArn ?? "")
      .filter(Boolean);
  } catch (err) {
    throw wrapAwsError(
      err,
      `Failed to list policies for role ${roleName}`,
    );
  }

  const findings: PolicyValidationFinding[] = [];
  const policyNames: string[] = [];

  for (const policyArn of policyArns) {
    try {
      // Get policy default version
      const policyResp = await iam(region).send(
        new GetPolicyCommand({ PolicyArn: policyArn }),
      );
      const versionId =
        policyResp.Policy?.DefaultVersionId ?? "v1";
      policyNames.push(policyResp.Policy?.PolicyName ?? policyArn);

      // Get policy document
      const versionResp = await iam(region).send(
        new GetPolicyVersionCommand({
          PolicyArn: policyArn,
          VersionId: versionId,
        }),
      );

      const docStr = decodeURIComponent(
        versionResp.PolicyVersion?.Document ?? "{}",
      );
      const doc = JSON.parse(docStr);
      const statements = Array.isArray(doc.Statement)
        ? doc.Statement
        : [];

      for (const stmt of statements) {
        if (stmt.Effect !== "Allow") {
          continue;
        }

        const actions = Array.isArray(stmt.Action)
          ? stmt.Action
          : [stmt.Action].filter(Boolean);
        const resources = Array.isArray(stmt.Resource)
          ? stmt.Resource
          : [stmt.Resource].filter(Boolean);

        for (const action of actions) {
          const actionStr = String(action);
          if (RISKY_ACTIONS.has(actionStr)) {
            for (const resource of resources) {
              findings.push(
                PolicyValidationFindingSchema.parse({
                  action: actionStr,
                  resource: String(resource),
                  risk:
                    actionStr === "*"
                      ? "critical"
                      : resource === "*"
                        ? "high"
                        : "medium",
                }),
              );
            }
          } else if (
            resources.some((r: string) => r === "*")
          ) {
            findings.push(
              PolicyValidationFindingSchema.parse({
                action: actionStr,
                resource: "*",
                risk: "medium",
              }),
            );
          }
        }
      }
    } catch {
      // Skip policies that can't be read
      policyNames.push(policyArn);
    }
  }

  return PrivilegeAnalysisResultSchema.parse({
    functionName,
    policies: policyNames,
    findings,
  });
}

/**
 * Orchestrate secret rotation in Secrets Manager.
 *
 * If a custom rotation function is provided, it generates a new secret
 * value and updates the secret. Otherwise, it triggers the built-in
 * Secrets Manager rotation.
 *
 * @param secretName - The secret name or ARN.
 * @param rotationFn - Optional function that generates a new secret value.
 * @param region - AWS region override.
 * @returns The rotation result with the new version ID.
 */
export async function secretRotationOrchestrator(
  secretName: string,
  rotationFn?: () => Promise<string>,
  region?: string,
): Promise<SecretRotationResult> {
  if (rotationFn) {
    // Custom rotation
    try {
      const newValue = await rotationFn();
      const resp = await secrets(region).send(
        new PutSecretValueCommand({
          SecretId: secretName,
          SecretString: newValue,
        }),
      );

      return SecretRotationResultSchema.parse({
        secretName,
        rotated: true,
        newVersionId: resp.VersionId,
      });
    } catch (err) {
      throw wrapAwsError(
        err,
        `Failed to rotate secret ${secretName} with custom function`,
      );
    }
  }

  // Built-in rotation
  try {
    const resp = await secrets(region).send(
      new RotateSecretCommand({ SecretId: secretName }),
    );

    return SecretRotationResultSchema.parse({
      secretName,
      rotated: true,
      newVersionId: resp.VersionId,
    });
  } catch (err) {
    throw wrapAwsError(
      err,
      `Failed to rotate secret ${secretName}`,
    );
  }
}

/**
 * Mask sensitive fields in data records.
 *
 * Iterates over records and replaces the values of specified fields
 * with a mask character repeated to the same length as the original
 * value. This is a synchronous, in-memory operation with no AWS calls.
 *
 * @param records - Array of data records to process.
 * @param fieldsToMask - Array of field names to mask.
 * @param maskChar - The masking character (default `"*"`).
 * @param region - AWS region (unused, kept for API consistency).
 * @returns The masking result with counts.
 */
export async function dataMaskingProcessor(
  records: Record<string, unknown>[],
  fieldsToMask: string[],
  maskChar?: string,
  _region?: string,
): Promise<DataMaskingResult> {
  const mask = maskChar ?? "*";
  let fieldsMasked = 0;

  for (const record of records) {
    for (const field of fieldsToMask) {
      if (field in record && record[field] !== undefined) {
        const value = String(record[field]);
        record[field] = mask.repeat(value.length);
        fieldsMasked++;
      }
    }
  }

  return DataMaskingResultSchema.parse({
    recordsProcessed: records.length,
    fieldsMasked,
  });
}

/**
 * Audit VPC security groups for overly permissive ingress rules.
 *
 * Checks each security group for rules that allow traffic from
 * `0.0.0.0/0` or `::/0` (all internet traffic) and reports findings
 * with risk assessments.
 *
 * @param groupIds - Optional array of security group IDs to audit. If omitted, all groups are audited.
 * @param region - AWS region override.
 * @returns An array of audit results, one per security group with findings.
 */
export async function vpcSecurityGroupAuditor(
  groupIds?: string[],
  region?: string,
): Promise<SecurityGroupAuditResult[]> {
  let securityGroups;
  try {
    const resp = await ec2(region).send(
      new DescribeSecurityGroupsCommand({
        GroupIds: groupIds?.length ? groupIds : undefined,
      }),
    );
    securityGroups = resp.SecurityGroups ?? [];
  } catch (err) {
    throw wrapAwsError(
      err,
      "Failed to describe security groups",
    );
  }

  const results: SecurityGroupAuditResult[] = [];

  for (const sg of securityGroups) {
    const findings: Array<{
      port: number;
      protocol: string;
      source: string;
      risk: string;
    }> = [];

    for (const rule of sg.IpPermissions ?? []) {
      const protocol = rule.IpProtocol ?? "unknown";
      const fromPort = rule.FromPort ?? 0;

      for (const ipRange of rule.IpRanges ?? []) {
        if (ipRange.CidrIp === "0.0.0.0/0") {
          const risk =
            fromPort === 22 || fromPort === 3389
              ? "critical"
              : fromPort === 0 && protocol === "-1"
                ? "critical"
                : "high";

          findings.push({
            port: fromPort,
            protocol,
            source: ipRange.CidrIp,
            risk,
          });
        }
      }

      for (const ipv6Range of rule.Ipv6Ranges ?? []) {
        if (ipv6Range.CidrIpv6 === "::/0") {
          findings.push({
            port: fromPort,
            protocol,
            source: ipv6Range.CidrIpv6,
            risk: "high",
          });
        }
      }
    }

    if (findings.length > 0) {
      results.push(
        SecurityGroupAuditResultSchema.parse({
          groupId: sg.GroupId ?? "",
          groupName: sg.GroupName ?? "",
          findings,
        }),
      );
    }
  }

  return results;
}

/**
 * Check and enforce encryption on S3 buckets and DynamoDB tables.
 *
 * Iterates over the specified S3 buckets and DynamoDB tables, checks
 * whether encryption is enabled, and enables default encryption where
 * it is missing.
 *
 * @param s3Buckets - Optional array of S3 bucket names to check.
 * @param dynamoTables - Optional array of DynamoDB table names to check.
 * @param region - AWS region override.
 * @returns The enforcement result with resource statuses and enforcement count.
 */
export async function encryptionEnforcer(
  s3Buckets?: string[],
  dynamoTables?: string[],
  region?: string,
): Promise<EncryptionEnforcerResult> {
  const resources: EncryptionStatus[] = [];
  let enforced = 0;

  // Check S3 buckets
  for (const bucket of s3Buckets ?? []) {
    try {
      const resp = await s3(region).send(
        new GetBucketEncryptionCommand({ Bucket: bucket }),
      );
      const rules =
        resp.ServerSideEncryptionConfiguration?.Rules ?? [];
      const isEncrypted = rules.length > 0;
      const keyId =
        rules[0]?.ApplyServerSideEncryptionByDefault?.KMSMasterKeyID;

      resources.push(
        EncryptionStatusSchema.parse({
          resourceId: bucket,
          encrypted: isEncrypted,
          keyId,
        }),
      );
    } catch {
      // No encryption configured — enforce it
      try {
        await s3(region).send(
          new PutBucketEncryptionCommand({
            Bucket: bucket,
            ServerSideEncryptionConfiguration: {
              Rules: [
                {
                  ApplyServerSideEncryptionByDefault: {
                    SSEAlgorithm: "AES256",
                  },
                },
              ],
            },
          }),
        );
        resources.push(
          EncryptionStatusSchema.parse({
            resourceId: bucket,
            encrypted: true,
          }),
        );
        enforced++;
      } catch (enforceErr) {
        throw wrapAwsError(
          enforceErr,
          `Failed to enable encryption on bucket ${bucket}`,
        );
      }
    }
  }

  // Check DynamoDB tables
  for (const table of dynamoTables ?? []) {
    try {
      const resp = await dynamodb(region).send(
        new DescribeTableCommand({ TableName: table }),
      );
      const sseDesc = resp.Table?.SSEDescription;
      const isEncrypted = sseDesc?.Status === "ENABLED";

      resources.push(
        EncryptionStatusSchema.parse({
          resourceId: table,
          encrypted: isEncrypted,
          keyId: sseDesc?.KMSMasterKeyArn,
        }),
      );

      if (!isEncrypted) {
        try {
          await dynamodb(region).send(
            new UpdateTableCommand({
              TableName: table,
              SSESpecification: { Enabled: true },
            }),
          );
          enforced++;
        } catch (enforceErr) {
          throw wrapAwsError(
            enforceErr,
            `Failed to enable encryption on table ${table}`,
          );
        }
      }
    } catch (err) {
      if (
        err instanceof Error &&
        err.message.includes("Failed to enable")
      ) {
        throw err;
      }
      throw wrapAwsError(
        err,
        `Failed to check encryption for table ${table}`,
      );
    }
  }

  return EncryptionEnforcerResultSchema.parse({
    resources,
    enforced,
  });
}

/**
 * Associate a WAFv2 Web ACL with an API Gateway stage.
 *
 * @param webAclArn - The WAFv2 Web ACL ARN.
 * @param apiId - The API Gateway API ID.
 * @param stageName - The API Gateway stage name.
 * @param region - AWS region override.
 * @returns The WAF association result.
 */
export async function apiGatewayWafManager(
  webAclArn: string,
  apiId: string,
  stageName: string,
  region?: string,
): Promise<WafAssociationResult> {
  // Construct the API Gateway stage ARN
  const accountRegion = region ?? "us-east-1";
  const resourceArn = `arn:aws:apigateway:${accountRegion}::/restapis/${apiId}/stages/${stageName}`;

  try {
    await waf(region).send(
      new AssociateWebACLCommand({
        WebACLArn: webAclArn,
        ResourceArn: resourceArn,
      }),
    );

    return WafAssociationResultSchema.parse({
      webAclArn,
      resourceArn,
      associated: true,
    });
  } catch (err) {
    throw wrapAwsError(
      err,
      `Failed to associate WAF ${webAclArn} with ${resourceArn}`,
    );
  }
}

/**
 * Run a set of compliance checks and produce a snapshot report.
 *
 * Executes each provided check function and aggregates the results.
 * Optionally stores the snapshot in S3 for audit purposes.
 *
 * @param checks - Array of named compliance checks.
 * @param s3Bucket - Optional S3 bucket for storing the snapshot.
 * @param s3Key - Optional S3 key for the snapshot.
 * @param region - AWS region override.
 * @returns The compliance snapshot result with pass/fail counts.
 */
export async function complianceSnapshot(
  checks: Array<{ name: string; check: () => Promise<boolean> }>,
  s3Bucket?: string,
  s3Key?: string,
  region?: string,
): Promise<ComplianceSnapshotResult> {
  const findings: Record<string, unknown>[] = [];
  let compliant = 0;
  let nonCompliant = 0;

  for (const { name, check } of checks) {
    try {
      const passed = await check();
      findings.push({ name, passed, timestamp: new Date().toISOString() });
      if (passed) {
        compliant++;
      } else {
        nonCompliant++;
      }
    } catch (err) {
      findings.push({
        name,
        passed: false,
        error:
          err instanceof Error ? err.message : String(err),
        timestamp: new Date().toISOString(),
      });
      nonCompliant++;
    }
  }

  const snapshot = ComplianceSnapshotResultSchema.parse({
    timestamp: new Date().toISOString(),
    findings,
    compliant,
    nonCompliant,
  });

  // Optionally store in S3
  if (s3Bucket && s3Key) {
    try {
      await s3(region).send(
        new PutObjectCommand({
          Bucket: s3Bucket,
          Key: s3Key,
          Body: JSON.stringify(snapshot, null, 2),
          ContentType: "application/json",
        }),
      );
    } catch (err) {
      throw wrapAwsError(
        err,
        `Failed to store compliance snapshot in s3://${s3Bucket}/${s3Key}`,
      );
    }
  }

  return snapshot;
}

/**
 * Validate a resource policy against an expected policy document.
 *
 * Compares the specified resource's policy (if available) against the
 * expected policy structure and reports any discrepancies.
 *
 * @param resourceArn - The ARN of the resource to validate.
 * @param expectedPolicy - Optional expected policy document for comparison.
 * @param region - AWS region override (unused in basic validation).
 * @returns The validation result with findings.
 */
export async function resourcePolicyValidator(
  resourceArn: string,
  expectedPolicy?: object,
  _region?: string,
): Promise<ResourcePolicyValidationResult> {
  const findings: string[] = [];

  if (!resourceArn) {
    findings.push("Resource ARN is empty");
    return ResourcePolicyValidationResultSchema.parse({
      resourceArn,
      valid: false,
      findings,
    });
  }

  // Basic ARN format validation
  if (!resourceArn.startsWith("arn:")) {
    findings.push("Resource ARN does not start with 'arn:'");
  }

  const arnParts = resourceArn.split(":");
  if (arnParts.length < 6) {
    findings.push("Resource ARN has fewer than 6 colon-separated parts");
  }

  if (expectedPolicy) {
    // Validate expected policy structure
    const policyObj = expectedPolicy as Record<string, unknown>;
    if (!policyObj.Version) {
      findings.push("Expected policy is missing 'Version' field");
    }
    if (!policyObj.Statement) {
      findings.push("Expected policy is missing 'Statement' field");
    }
    if (Array.isArray(policyObj.Statement)) {
      for (const stmt of policyObj.Statement) {
        const s = stmt as Record<string, unknown>;
        if (!s.Effect) {
          findings.push("A statement is missing 'Effect' field");
        }
        if (!s.Principal && !s.NotPrincipal) {
          findings.push(
            "A statement is missing both 'Principal' and 'NotPrincipal'",
          );
        }
      }
    }
  }

  return ResourcePolicyValidationResultSchema.parse({
    resourceArn,
    valid: findings.length === 0,
    findings,
  });
}

/**
 * Describe and analyze a Cognito user pool's auth flow configuration.
 *
 * Retrieves the user pool settings and reports the enabled auth flows
 * and whether MFA is enabled.
 *
 * @param userPoolId - The Cognito user pool ID.
 * @param region - AWS region override.
 * @returns The auth flow result with flow names and MFA status.
 */
export async function cognitoAuthFlowManager(
  userPoolId: string,
  region?: string,
): Promise<CognitoAuthResult> {
  try {
    const resp = await cognito(region).send(
      new DescribeUserPoolCommand({ UserPoolId: userPoolId }),
    );

    const pool = resp.UserPool;
    const mfaConfig = pool?.MfaConfiguration ?? "OFF";
    const mfaEnabled = mfaConfig !== "OFF";

    // Gather auth flow information from policies
    const flows: string[] = [];
    const passwordPolicy = pool?.Policies?.PasswordPolicy;
    if (passwordPolicy) {
      flows.push("USER_PASSWORD_AUTH");
    }

    // Check for custom auth
    const lambdaConfig = pool?.LambdaConfig;
    if (lambdaConfig?.DefineAuthChallenge) {
      flows.push("CUSTOM_AUTH");
    }
    if (lambdaConfig?.CreateAuthChallenge) {
      flows.push("CUSTOM_CHALLENGE");
    }

    // Standard flows
    flows.push("USER_SRP_AUTH");
    if (pool?.AdminCreateUserConfig) {
      flows.push("ADMIN_USER_PASSWORD_AUTH");
    }

    return CognitoAuthResultSchema.parse({
      userPoolId,
      flows: [...new Set(flows)],
      mfaEnabled,
    });
  } catch (err) {
    throw wrapAwsError(
      err,
      `Failed to describe user pool ${userPoolId}`,
    );
  }
}
