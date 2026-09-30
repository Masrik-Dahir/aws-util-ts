/**
 * aws-util/security-automation — Automated security remediation.
 *
 * Multi-service module combining GuardDuty + EC2 + IAM + Config + SNS +
 * Lambda + S3 to provide automated remediation for GuardDuty findings
 * and AWS Config rule violations.
 *
 * All functions obtain clients via {@link getClient} and wrap errors
 * through {@link wrapAwsError}.
 *
 * @example
 * ```ts
 * import {
 *   guarddutyAutoRemediator,
 *   configRulesAutoRemediator,
 * } from "./security-automation.js";
 *
 * const results = await guarddutyAutoRemediator("abc123def456");
 * const configResults = await configRulesAutoRemediator(["s3-bucket-ssl"]);
 * ```
 *
 * @module
 */

import { z } from "zod";
import {
  GuardDutyClient,
  ListFindingsCommand,
  GetFindingsCommand,
} from "@aws-sdk/client-guardduty";
import {
  ConfigServiceClient,
  GetComplianceDetailsByConfigRuleCommand,
} from "@aws-sdk/client-config-service";
import {
  SNSClient,
  PublishCommand,
} from "@aws-sdk/client-sns";
import { getClient } from "./client.js";
import { wrapAwsError } from "./exceptions.js";

// ---------------------------------------------------------------------------
// Zod schemas & inferred types
// ---------------------------------------------------------------------------

/** Schema for a single remediation result. */
export const RemediationResultSchema = z.object({
  findingId: z.string(),
  severity: z.string(),
  action: z.string(),
  success: z.boolean(),
  error: z.string().optional(),
});

/** Result of a single remediation action. */
export type RemediationResult = z.infer<
  typeof RemediationResultSchema
>;

/** Schema for Config rule auto-remediation results. */
export const ConfigRemediationResultSchema = z.object({
  ruleName: z.string(),
  resourcesEvaluated: z.number(),
  remediationsApplied: z.number(),
  errors: z.array(z.string()),
});

/** Result of Config rule auto-remediation. */
export type ConfigRemediationResult = z.infer<
  typeof ConfigRemediationResultSchema
>;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Auto-remediate GuardDuty findings.
 *
 * Lists active findings from the specified GuardDuty detector, retrieves
 * their details, and applies remediation actions based on the provided
 * action map. Optionally sends notifications to an SNS topic.
 *
 * The `actions` parameter maps finding types (e.g.
 * "UnauthorizedAccess:IAMUser/MaliciousIPCaller") to async remediation
 * functions that receive the full finding object.
 *
 * @param detectorId - GuardDuty detector ID.
 * @param actions - Optional map of finding type to remediation function.
 * @param snsTopicArn - Optional SNS topic for remediation notifications.
 * @param region - AWS region. Defaults to SDK default.
 * @returns Array of remediation results for each finding.
 *
 * @example
 * ```ts
 * const results = await guarddutyAutoRemediator("abc123", {
 *   "UnauthorizedAccess:IAMUser/MaliciousIPCaller": async (finding) => {
 *     // Disable the IAM user
 *   },
 * });
 * ```
 */
export async function guarddutyAutoRemediator(
  detectorId: string,
  actions?: Record<
    string,
    (finding: Record<string, unknown>) => Promise<void>
  >,
  snsTopicArn?: string,
  region?: string,
): Promise<RemediationResult[]> {
  try {
    const gd = getClient(GuardDutyClient, region);
    const results: RemediationResult[] = [];

    // List active findings
    const listResp = await gd.send(
      new ListFindingsCommand({
        DetectorId: detectorId,
        FindingCriteria: {
          Criterion: {
            "service.archived": {
              Eq: ["false"],
            },
          },
        },
      }),
    );

    const findingIds = listResp.FindingIds ?? [];
    if (findingIds.length === 0) {
      return results;
    }

    // Get finding details
    const getResp = await gd.send(
      new GetFindingsCommand({
        DetectorId: detectorId,
        FindingIds: findingIds,
      }),
    );

    for (const finding of getResp.Findings ?? []) {
      const findingId = finding.Id ?? "unknown";
      const findingType = finding.Type ?? "unknown";
      const severity =
        finding.Severity?.toString() ?? "unknown";

      const actionFn = actions?.[findingType];
      if (actionFn) {
        try {
          await actionFn(
            finding as unknown as Record<string, unknown>,
          );
          results.push({
            findingId,
            severity,
            action: `Remediated: ${findingType}`,
            success: true,
          });
        } catch (actionErr) {
          results.push({
            findingId,
            severity,
            action: `Failed: ${findingType}`,
            success: false,
            error:
              actionErr instanceof Error
                ? actionErr.message
                : String(actionErr),
          });
        }
      } else {
        results.push({
          findingId,
          severity,
          action: `No action defined for: ${findingType}`,
          success: false,
        });
      }
    }

    // Notify via SNS
    if (snsTopicArn && results.length > 0) {
      const sns = getClient(SNSClient, region);
      await sns.send(
        new PublishCommand({
          TopicArn: snsTopicArn,
          Subject: `GuardDuty Remediation: ${results.filter((r) => r.success).length}/${results.length} succeeded`,
          Message: JSON.stringify(results, null, 2),
        }),
      );
    }

    return results.map((r) =>
      RemediationResultSchema.parse(r),
    );
  } catch (err) {
    throw wrapAwsError(
      err,
      "guarddutyAutoRemediator failed",
    );
  }
}

/**
 * Auto-remediate non-compliant AWS Config rule evaluations.
 *
 * For each specified Config rule, retrieves non-compliant resources and
 * applies the corresponding remediation function from the provided map.
 *
 * @param ruleNames - Array of Config rule names to check.
 * @param remediations - Optional map of rule name to remediation function.
 * @param region - AWS region. Defaults to SDK default.
 * @returns Array of remediation results per rule.
 *
 * @example
 * ```ts
 * const results = await configRulesAutoRemediator(
 *   ["s3-bucket-ssl-requests-only", "iam-password-policy"],
 *   {
 *     "s3-bucket-ssl-requests-only": async (resource) => {
 *       // Apply SSL-only bucket policy
 *     },
 *   },
 * );
 * ```
 */
export async function configRulesAutoRemediator(
  ruleNames: string[],
  remediations?: Record<
    string,
    (resource: Record<string, unknown>) => Promise<void>
  >,
  region?: string,
): Promise<ConfigRemediationResult[]> {
  try {
    const config = getClient(ConfigServiceClient, region);
    const results: ConfigRemediationResult[] = [];

    for (const ruleName of ruleNames) {
      const errors: string[] = [];
      let resourcesEvaluated = 0;
      let remediationsApplied = 0;

      // Get non-compliant resources
      const compResp = await config.send(
        new GetComplianceDetailsByConfigRuleCommand({
          ConfigRuleName: ruleName,
          ComplianceTypes: ["NON_COMPLIANT"],
        }),
      );

      const evaluations =
        compResp.EvaluationResults ?? [];
      resourcesEvaluated = evaluations.length;

      const remediationFn = remediations?.[ruleName];
      if (remediationFn) {
        for (const evaluation of evaluations) {
          try {
            const resource = {
              resourceType:
                evaluation.EvaluationResultIdentifier
                  ?.EvaluationResultQualifier
                  ?.ResourceType ?? "unknown",
              resourceId:
                evaluation.EvaluationResultIdentifier
                  ?.EvaluationResultQualifier
                  ?.ResourceId ?? "unknown",
              configRuleName: ruleName,
              complianceType:
                evaluation.ComplianceType ?? "NON_COMPLIANT",
            };
            await remediationFn(resource);
            remediationsApplied += 1;
          } catch (remErr) {
            errors.push(
              remErr instanceof Error
                ? remErr.message
                : String(remErr),
            );
          }
        }
      }

      results.push(
        ConfigRemediationResultSchema.parse({
          ruleName,
          resourcesEvaluated,
          remediationsApplied,
          errors,
        }),
      );
    }

    return results;
  } catch (err) {
    throw wrapAwsError(
      err,
      "configRulesAutoRemediator failed",
    );
  }
}
