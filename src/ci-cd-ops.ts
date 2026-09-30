/**
 * aws-util/ci-cd-ops — Multi-service CI/CD operation utilities.
 *
 * Provides typed helpers for CodeBuild triggered deployments, CodePipeline
 * approval notifications, CodeCommit PR to CodeBuild triggers, and
 * CodeArtifact package promotion.
 *
 * @module
 */

import { z } from "zod";
import { CodeBuildClient } from "@aws-sdk/client-codebuild";
import { CodePipelineClient } from "@aws-sdk/client-codepipeline";
import { CodeCommitClient } from "@aws-sdk/client-codecommit";
import { CodeArtifactClient } from "@aws-sdk/client-codeartifact";
import { getClient } from "./client.js";
import { wrapAwsError } from "./exceptions.js";

// ---------------------------------------------------------------------------
// Zod schemas & inferred types
// ---------------------------------------------------------------------------

/** Schema for a CodeBuild triggered deploy result. */
export const CodebuildTriggeredDeployResultSchema = z.object({
  buildId: z.string(),
  buildArn: z.string(),
  projectName: z.string(),
  status: z.string(),
});

/** CodeBuild triggered deploy result. */
export type CodebuildTriggeredDeployResult = z.infer<typeof CodebuildTriggeredDeployResultSchema>;

/** Schema for a CodePipeline approval notifier result. */
export const CodepipelineApprovalNotifierResultSchema = z.object({
  pipelineName: z.string(),
  stageName: z.string(),
  actionName: z.string(),
  notified: z.boolean(),
  topicArn: z.string(),
});

/** CodePipeline approval notifier result. */
export type CodepipelineApprovalNotifierResult = z.infer<typeof CodepipelineApprovalNotifierResultSchema>;

/** Schema for a CodeCommit PR to CodeBuild result. */
export const CodecommitPrToCodebuildResultSchema = z.object({
  pullRequestId: z.string(),
  buildId: z.string(),
  projectName: z.string(),
  commitId: z.string(),
  triggered: z.boolean(),
});

/** CodeCommit PR to CodeBuild result. */
export type CodecommitPrToCodebuildResult = z.infer<typeof CodecommitPrToCodebuildResultSchema>;

/** Schema for a CodeArtifact package promoter result. */
export const CodeartifactPackagePromoterResultSchema = z.object({
  domain: z.string(),
  sourceRepo: z.string(),
  targetRepo: z.string(),
  packageName: z.string(),
  packageVersion: z.string(),
  promoted: z.boolean(),
});

/** CodeArtifact package promoter result. */
export type CodeartifactPackagePromoterResult = z.infer<typeof CodeartifactPackagePromoterResultSchema>;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Trigger a CodeBuild project build and optionally wait for completion. */
export async function codebuildTriggeredDeploy(
  projectName: string,
  environmentVariables?: Record<string, string>,
  sourceVersion?: string,
  waitForCompletion?: boolean,
  region?: string,
): Promise<CodebuildTriggeredDeployResult> {
  const client = getClient(CodeBuildClient, region);
  try {
    // TODO: implement codebuildTriggeredDeploy
    throw new Error("codebuildTriggeredDeploy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "codebuildTriggeredDeploy failed");
  }
}

/** Send an SNS notification when a CodePipeline manual approval action is pending. */
export async function codepipelineApprovalNotifier(
  pipelineName: string,
  stageName: string,
  actionName: string,
  snsTopicArn: string,
  approvalUrl?: string,
  region?: string,
): Promise<CodepipelineApprovalNotifierResult> {
  const client = getClient(CodePipelineClient, region);
  try {
    // TODO: implement codepipelineApprovalNotifier
    throw new Error("codepipelineApprovalNotifier not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "codepipelineApprovalNotifier failed");
  }
}

/** Automatically trigger a CodeBuild build when a CodeCommit pull request is opened or updated. */
export async function codecommitPrToCodebuild(
  repositoryName: string,
  pullRequestId: string,
  codebuildProject: string,
  region?: string,
): Promise<CodecommitPrToCodebuildResult> {
  const client = getClient(CodeCommitClient, region);
  try {
    // TODO: implement codecommitPrToCodebuild
    throw new Error("codecommitPrToCodebuild not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "codecommitPrToCodebuild failed");
  }
}

/** Promote a package version from one CodeArtifact repository to another. */
export async function codeartifactPackagePromoter(
  domain: string,
  domainOwner: string,
  sourceRepo: string,
  targetRepo: string,
  packageFormat: string,
  packageName: string,
  packageVersion: string,
  packageNamespace?: string,
  region?: string,
): Promise<CodeartifactPackagePromoterResult> {
  const client = getClient(CodeArtifactClient, region);
  try {
    // TODO: implement codeartifactPackagePromoter
    throw new Error("codeartifactPackagePromoter not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "codeartifactPackagePromoter failed");
  }
}
