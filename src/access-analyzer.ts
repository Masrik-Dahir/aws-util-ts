import { AccessAnalyzerClient } from "@aws-sdk/client-accessanalyzer";
import { getClient } from "./client";
import { wrapAwsError } from "./exceptions";

/** Metadata for an IAM Access Analyzer analyzer. */
export type AnalyzerResult = {
  arn: string;
  name: string;
  type: string;
  status?: string;
  createdAt?: Date;
  lastResourceAnalyzed?: string;
  lastResourceAnalyzedAt?: Date;
  tags?: Record<string, unknown>;
  extra?: Record<string, unknown>;
};

/** Metadata for an Access Analyzer finding. */
export type FindingResult = {
  id: string;
  analyzerArn?: string;
  resource?: string;
  resourceType?: string;
  resourceOwnerAccount?: string;
  principal?: Record<string, unknown>;
  action?: string[];
  condition?: Record<string, unknown>;
  status?: string;
  isPublic?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  extra?: Record<string, unknown>;
};

/** Metadata for an Access Analyzer archive rule. */
export type ArchiveRuleResult = {
  ruleName: string;
  filter?: Record<string, unknown>;
  createdAt?: Date;
  updatedAt?: Date;
  extra?: Record<string, unknown>;
};

/** Result of a policy validation check. */
export type PolicyValidationResult = {
  findingType?: string;
  findingDetails?: string;
  issueCode?: string;
  learnMoreLink?: string;
  locations?: Record<string, unknown>[];
  extra?: Record<string, unknown>;
};

/** Result of a finding recommendation. */
export type FindingRecommendationResult = {
  recommendationType?: string;
  recommendedSteps?: Record<string, unknown>[];
  extra?: Record<string, unknown>;
};

/** Result of check_no_public_access. */
export type CheckNoPublicAccessResult = {
  result?: string;
  message?: string;
  reasons?: Record<string, unknown>[];
};

/** Result of create_access_preview. */
export type CreateAccessPreviewResult = {
  id?: string;
};

/** Result of get_access_preview. */
export type GetAccessPreviewResult = {
  accessPreview?: Record<string, unknown>;
};

/** Result of get_finding_recommendation. */
export type GetFindingRecommendationResult = {
  startedAt?: string;
  completedAt?: string;
  nextToken?: string;
  error?: Record<string, unknown>;
  resourceArn?: string;
  recommendedSteps?: Record<string, unknown>[];
  recommendationType?: string;
  status?: string;
};

/** Result of get_finding_v2. */
export type GetFindingV2Result = {
  analyzedAt?: string;
  createdAt?: string;
  error?: string;
  id?: string;
  nextToken?: string;
  resource?: string;
  resourceType?: string;
  resourceOwnerAccount?: string;
  status?: string;
  updatedAt?: string;
  findingDetails?: Record<string, unknown>[];
  findingType?: string;
};

/** Result of get_findings_statistics. */
export type GetFindingsStatisticsResult = {
  findingsStatistics?: Record<string, unknown>[];
  lastUpdatedAt?: string;
};

/** Result of get_generated_policy. */
export type GetGeneratedPolicyResult = {
  jobDetails?: Record<string, unknown>;
  generatedPolicyResult?: Record<string, unknown>;
};

/** Result of list_access_preview_findings. */
export type ListAccessPreviewFindingsResult = {
  findings?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_access_previews. */
export type ListAccessPreviewsResult = {
  accessPreviews?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_findings_v2. */
export type ListFindingsV2Result = {
  findings?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_policy_generations. */
export type ListPolicyGenerationsResult = {
  policyGenerations?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_tags_for_resource. */
export type ListTagsForResourceResult = {
  tags?: Record<string, unknown>;
};

/** Result of start_policy_generation. */
export type StartPolicyGenerationResult = {
  jobId?: string;
};

/** Create an IAM Access Analyzer analyzer. */
export async function createAnalyzer(analyzerName: string, type: string): Promise<AnalyzerResult> {
  try {
    // TODO: implement create_analyzer
    throw new Error("create_analyzer not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_analyzer failed");
  }
}

/** Get details for an IAM Access Analyzer analyzer. */
export async function getAnalyzer(analyzerName: string): Promise<AnalyzerResult> {
  try {
    // TODO: implement get_analyzer
    throw new Error("get_analyzer not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_analyzer failed");
  }
}

/** List IAM Access Analyzer analyzers. */
export async function listAnalyzers(): Promise<AnalyzerResult[]> {
  try {
    // TODO: implement list_analyzers
    throw new Error("list_analyzers not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_analyzers failed");
  }
}

/** Delete an IAM Access Analyzer analyzer. */
export async function deleteAnalyzer(analyzerName: string): Promise<void> {
  try {
    // TODO: implement delete_analyzer
    throw new Error("delete_analyzer not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_analyzer failed");
  }
}

/** Update an IAM Access Analyzer analyzer configuration. */
export async function updateAnalyzer(analyzerName: string): Promise<AnalyzerResult> {
  try {
    // TODO: implement update_analyzer
    throw new Error("update_analyzer not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_analyzer failed");
  }
}

/** Get details for a specific Access Analyzer finding. */
export async function getFinding(analyzerArn: string, findingId: string): Promise<FindingResult> {
  try {
    // TODO: implement get_finding
    throw new Error("get_finding not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_finding failed");
  }
}

/** List findings from an Access Analyzer analyzer. */
export async function listFindings(analyzerArn: string): Promise<FindingResult[]> {
  try {
    // TODO: implement list_findings
    throw new Error("list_findings not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_findings failed");
  }
}

/** Update the status of Access Analyzer findings. */
export async function updateFindings(analyzerArn: string, findingIds: string[], status: string): Promise<void> {
  try {
    // TODO: implement update_findings
    throw new Error("update_findings not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_findings failed");
  }
}

/** Get details for a resource analyzed by Access Analyzer. */
export async function getAnalyzedResource(analyzerArn: string, resourceArn: string): Promise<Record<string, unknown>> {
  try {
    // TODO: implement get_analyzed_resource
    throw new Error("get_analyzed_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_analyzed_resource failed");
  }
}

/** List resources analyzed by Access Analyzer. */
export async function listAnalyzedResources(analyzerArn: string): Promise<Record<string, unknown>[]> {
  try {
    // TODO: implement list_analyzed_resources
    throw new Error("list_analyzed_resources not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_analyzed_resources failed");
  }
}

/** Start a scan of a resource by Access Analyzer. */
export async function startResourceScan(analyzerArn: string, resourceArn: string): Promise<void> {
  try {
    // TODO: implement start_resource_scan
    throw new Error("start_resource_scan not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_resource_scan failed");
  }
}

/** Create an archive rule for an Access Analyzer analyzer. */
export async function createArchiveRule(analyzerName: string, ruleName: string, filter: Record<string, unknown>): Promise<void> {
  try {
    // TODO: implement create_archive_rule
    throw new Error("create_archive_rule not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_archive_rule failed");
  }
}

/** Get details for an archive rule. */
export async function getArchiveRule(analyzerName: string, ruleName: string): Promise<ArchiveRuleResult> {
  try {
    // TODO: implement get_archive_rule
    throw new Error("get_archive_rule not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_archive_rule failed");
  }
}

/** List archive rules for an analyzer. */
export async function listArchiveRules(analyzerName: string): Promise<ArchiveRuleResult[]> {
  try {
    // TODO: implement list_archive_rules
    throw new Error("list_archive_rules not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_archive_rules failed");
  }
}

/** Update an archive rule for an Access Analyzer analyzer. */
export async function updateArchiveRule(analyzerName: string, ruleName: string, filter: Record<string, unknown>): Promise<void> {
  try {
    // TODO: implement update_archive_rule
    throw new Error("update_archive_rule not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_archive_rule failed");
  }
}

/** Delete an archive rule. */
export async function deleteArchiveRule(analyzerName: string, ruleName: string): Promise<void> {
  try {
    // TODO: implement delete_archive_rule
    throw new Error("delete_archive_rule not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_archive_rule failed");
  }
}

/** Apply an archive rule retroactively to existing findings. */
export async function applyArchiveRule(analyzerArn: string, ruleName: string): Promise<void> {
  try {
    // TODO: implement apply_archive_rule
    throw new Error("apply_archive_rule not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "apply_archive_rule failed");
  }
}

/** Validate an IAM policy document. */
export async function validatePolicy(policyDocument: string, policyType: string): Promise<PolicyValidationResult[]> {
  try {
    // TODO: implement validate_policy
    throw new Error("validate_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "validate_policy failed");
  }
}

/** Check that a policy does not grant specified access. */
export async function checkAccessNotGranted(policyDocument: string, access: Record<string, unknown>[], policyType: string): Promise<Record<string, unknown>> {
  try {
    // TODO: implement check_access_not_granted
    throw new Error("check_access_not_granted not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "check_access_not_granted failed");
  }
}

/** Check that a new policy does not grant new access. */
export async function checkNoNewAccess(newPolicyDocument: string, existingPolicyDocument: string, policyType: string): Promise<Record<string, unknown>> {
  try {
    // TODO: implement check_no_new_access
    throw new Error("check_no_new_access not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "check_no_new_access failed");
  }
}

/** Generate a recommendation for resolving a finding. */
export async function generateFindingRecommendation(analyzerArn: string, findingId: string): Promise<FindingRecommendationResult> {
  try {
    // TODO: implement generate_finding_recommendation
    throw new Error("generate_finding_recommendation not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "generate_finding_recommendation failed");
  }
}

/** Cancel policy generation. */
export async function cancelPolicyGeneration(jobId: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement cancel_policy_generation
    throw new Error("cancel_policy_generation not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "cancel_policy_generation failed");
  }
}

/** Check no public access. */
export async function checkNoPublicAccess(policyDocument: string, resourceType: string, regionName?: string): Promise<CheckNoPublicAccessResult> {
  try {
    // TODO: implement check_no_public_access
    throw new Error("check_no_public_access not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "check_no_public_access failed");
  }
}

/** Create access preview. */
export async function createAccessPreview(analyzerArn: string, configurations: Record<string, unknown>): Promise<CreateAccessPreviewResult> {
  try {
    // TODO: implement create_access_preview
    throw new Error("create_access_preview not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_access_preview failed");
  }
}

/** Get access preview. */
export async function getAccessPreview(accessPreviewId: string, analyzerArn: string, regionName?: string): Promise<GetAccessPreviewResult> {
  try {
    // TODO: implement get_access_preview
    throw new Error("get_access_preview not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_access_preview failed");
  }
}

/** Get finding recommendation. */
export async function getFindingRecommendation(analyzerArn: string, id: string): Promise<GetFindingRecommendationResult> {
  try {
    // TODO: implement get_finding_recommendation
    throw new Error("get_finding_recommendation not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_finding_recommendation failed");
  }
}

/** Get finding v2. */
export async function getFindingV2(analyzerArn: string, id: string): Promise<GetFindingV2Result> {
  try {
    // TODO: implement get_finding_v2
    throw new Error("get_finding_v2 not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_finding_v2 failed");
  }
}

/** Get findings statistics. */
export async function getFindingsStatistics(analyzerArn: string, regionName?: string): Promise<GetFindingsStatisticsResult> {
  try {
    // TODO: implement get_findings_statistics
    throw new Error("get_findings_statistics not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_findings_statistics failed");
  }
}

/** Get generated policy. */
export async function getGeneratedPolicy(jobId: string): Promise<GetGeneratedPolicyResult> {
  try {
    // TODO: implement get_generated_policy
    throw new Error("get_generated_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_generated_policy failed");
  }
}

/** List access preview findings. */
export async function listAccessPreviewFindings(accessPreviewId: string, analyzerArn: string): Promise<ListAccessPreviewFindingsResult> {
  try {
    // TODO: implement list_access_preview_findings
    throw new Error("list_access_preview_findings not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_access_preview_findings failed");
  }
}

/** List access previews. */
export async function listAccessPreviews(analyzerArn: string): Promise<ListAccessPreviewsResult> {
  try {
    // TODO: implement list_access_previews
    throw new Error("list_access_previews not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_access_previews failed");
  }
}

/** List findings v2. */
export async function listFindingsV2(analyzerArn: string): Promise<ListFindingsV2Result> {
  try {
    // TODO: implement list_findings_v2
    throw new Error("list_findings_v2 not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_findings_v2 failed");
  }
}

/** List policy generations. */
export async function listPolicyGenerations(): Promise<ListPolicyGenerationsResult> {
  try {
    // TODO: implement list_policy_generations
    throw new Error("list_policy_generations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_policy_generations failed");
  }
}

/** List tags for resource. */
export async function listTagsForResource(resourceArn: string, regionName?: string): Promise<ListTagsForResourceResult> {
  try {
    // TODO: implement list_tags_for_resource
    throw new Error("list_tags_for_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_tags_for_resource failed");
  }
}

/** Start policy generation. */
export async function startPolicyGeneration(policyGenerationDetails: Record<string, unknown>): Promise<StartPolicyGenerationResult> {
  try {
    // TODO: implement start_policy_generation
    throw new Error("start_policy_generation not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_policy_generation failed");
  }
}

/** Tag resource. */
export async function tagResource(resourceArn: string, tags: Record<string, unknown>, regionName?: string): Promise<void> {
  try {
    // TODO: implement tag_resource
    throw new Error("tag_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "tag_resource failed");
  }
}

/** Untag resource. */
export async function untagResource(resourceArn: string, tagKeys: string[], regionName?: string): Promise<void> {
  try {
    // TODO: implement untag_resource
    throw new Error("untag_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "untag_resource failed");
  }
}
