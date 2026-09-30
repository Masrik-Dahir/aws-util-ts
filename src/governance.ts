/**
 * aws-util/governance — Multi-service governance and compliance utilities.
 *
 * Provides typed helpers for Config rule remediation, Organizations SCP drift
 * detection, SSO permission set auditing, and KMS key rotation auditing.
 *
 * @module
 */

import { z } from "zod";
import { ConfigServiceClient } from "@aws-sdk/client-config-service";
import { OrganizationsClient } from "@aws-sdk/client-organizations";
import { SSOAdminClient } from "@aws-sdk/client-sso-admin";
import { KMSClient } from "@aws-sdk/client-kms";
import { getClient } from "./client.js";
import { wrapAwsError } from "./exceptions.js";

// ---------------------------------------------------------------------------
// Zod schemas & inferred types
// ---------------------------------------------------------------------------

/** Schema for a Config rule remediation result. */
export const ConfigRuleRemediationResultSchema = z.object({
  configRuleName: z.string(),
  resourcesRemediated: z.number(),
  remediationStatus: z.string(),
  failedResources: z.array(z.string()),
});

/** Config rule remediation result. */
export type ConfigRuleRemediationResult = z.infer<typeof ConfigRuleRemediationResultSchema>;

/** Schema for an Organizations SCP drift detector result. */
export const ScpDriftDetectorResultSchema = z.object({
  organizationId: z.string(),
  driftedAccounts: z.array(z.string()),
  expectedPolicies: z.array(z.string()),
  missingPolicies: z.record(z.string(), z.array(z.string())),
  compliant: z.boolean(),
});

/** Organizations SCP drift detector result. */
export type ScpDriftDetectorResult = z.infer<typeof ScpDriftDetectorResultSchema>;

/** Schema for an SSO permission set auditor result. */
export const SsoPermissionSetAuditorResultSchema = z.object({
  instanceArn: z.string(),
  permissionSetsAudited: z.number(),
  violatingAssignments: z.array(z.object({
    permissionSetArn: z.string(),
    accountId: z.string(),
    principalId: z.string(),
    reason: z.string(),
  })),
  compliant: z.boolean(),
});

/** SSO permission set auditor result. */
export type SsoPermissionSetAuditorResult = z.infer<typeof SsoPermissionSetAuditorResultSchema>;

/** Schema for a KMS key rotation auditor result. */
export const KmsKeyRotationAuditorResultSchema = z.object({
  keysAudited: z.number(),
  rotationEnabledCount: z.number(),
  rotationDisabledCount: z.number(),
  nonCompliantKeys: z.array(z.string()),
  compliant: z.boolean(),
});

/** KMS key rotation auditor result. */
export type KmsKeyRotationAuditorResult = z.infer<typeof KmsKeyRotationAuditorResultSchema>;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Execute AWS Config rule auto-remediation for non-compliant resources. */
export async function configRuleRemediationExecutor(
  configRuleName: string,
  resourceKeys?: Array<{ resourceType: string; resourceId: string }>,
  region?: string,
): Promise<ConfigRuleRemediationResult> {
  const client = getClient(ConfigServiceClient, region);
  try {
    // TODO: implement configRuleRemediationExecutor
    throw new Error("configRuleRemediationExecutor not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "configRuleRemediationExecutor failed");
  }
}

/** Detect drift between expected and actual SCP policies across AWS Organization accounts. */
export async function organizationsScpDriftDetector(
  organizationId: string,
  expectedPolicyIds: string[],
  targetAccountIds?: string[],
  region?: string,
): Promise<ScpDriftDetectorResult> {
  const client = getClient(OrganizationsClient, region);
  try {
    // TODO: implement organizationsScpDriftDetector
    throw new Error("organizationsScpDriftDetector not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "organizationsScpDriftDetector failed");
  }
}

/** Audit IAM Identity Center permission set assignments for policy violations. */
export async function ssoPermissionSetAuditor(
  instanceArn: string,
  allowedPermissionSetArns?: string[],
  excludedAccountIds?: string[],
  region?: string,
): Promise<SsoPermissionSetAuditorResult> {
  const client = getClient(SSOAdminClient, region);
  try {
    // TODO: implement ssoPermissionSetAuditor
    throw new Error("ssoPermissionSetAuditor not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "ssoPermissionSetAuditor failed");
  }
}

/** Audit all KMS keys and report those with automatic rotation disabled. */
export async function kmsKeyRotationAuditor(
  keyIds?: string[],
  snsTopicArn?: string,
  region?: string,
): Promise<KmsKeyRotationAuditorResult> {
  const client = getClient(KMSClient, region);
  try {
    // TODO: implement kmsKeyRotationAuditor
    throw new Error("kmsKeyRotationAuditor not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "kmsKeyRotationAuditor failed");
  }
}
