import { CodecommitClient } from "@aws-sdk/client-codecommit";
import { getClient } from "./client";
import { wrapAwsError } from "./exceptions";

/** Metadata for a CodeCommit repository. */
export type RepositoryResult = {
  repositoryId: string;
  repositoryName: string;
  arn?: string;
  description?: string;
  cloneUrlHttp?: string;
  cloneUrlSsh?: string;
  defaultBranch?: string;
  lastModified?: string;
  creationDate?: string;
  extra?: Record<string, unknown>;
};

/** A CodeCommit branch. */
export type BranchResult = {
  branchName: string;
  commitId: string;
  extra?: Record<string, unknown>;
};

/** A CodeCommit commit. */
export type CommitResult = {
  commitId: string;
  treeId?: string;
  author?: Record<string, unknown>;
  committer?: Record<string, unknown>;
  message?: string;
  parents?: string[];
  extra?: Record<string, unknown>;
};

/** A CodeCommit pull request. */
export type PullRequestResult = {
  pullRequestId: string;
  title: string;
  description?: string;
  pullRequestStatus?: string;
  creationDate?: string;
  lastActivityDate?: string;
  pullRequestTargets?: Record<string, unknown>[];
  extra?: Record<string, unknown>;
};

/** A file retrieved from CodeCommit. */
export type FileResult = {
  filePath: string;
  fileSize?: number;
  fileMode?: string;
  blobId?: string;
  commitId?: string;
  fileContent?: Uint8Array;
  extra?: Record<string, unknown>;
};

/** A single difference entry from CodeCommit. */
export type DiffResult = {
  beforeBlob?: Record<string, unknown>;
  afterBlob?: Record<string, unknown>;
  changeType?: string;
  extra?: Record<string, unknown>;
};

/** A blob retrieved from CodeCommit. */
export type BlobResult = {
  blobId: string;
  content: Uint8Array;
  extra?: Record<string, unknown>;
};

/** Result of batch_associate_approval_rule_template_with_repositories. */
export type BatchAssociateApprovalRuleTemplateWithRepositoriesResult = {
  associatedRepositoryNames?: string[];
  errors?: Record<string, unknown>[];
};

/** Result of batch_describe_merge_conflicts. */
export type BatchDescribeMergeConflictsResult = {
  conflicts?: Record<string, unknown>[];
  nextToken?: string;
  errors?: Record<string, unknown>[];
  destinationCommitId?: string;
  sourceCommitId?: string;
  baseCommitId?: string;
};

/** Result of batch_disassociate_approval_rule_template_from_repositories. */
export type BatchDisassociateApprovalRuleTemplateFromRepositoriesResult = {
  disassociatedRepositoryNames?: string[];
  errors?: Record<string, unknown>[];
};

/** Result of batch_get_commits. */
export type BatchGetCommitsResult = {
  commits?: Record<string, unknown>[];
  errors?: Record<string, unknown>[];
};

/** Result of batch_get_repositories. */
export type BatchGetRepositoriesResult = {
  repositories?: Record<string, unknown>[];
  repositoriesNotFound?: string[];
  errors?: Record<string, unknown>[];
};

/** Result of create_approval_rule_template. */
export type CreateApprovalRuleTemplateResult = {
  approvalRuleTemplate?: Record<string, unknown>;
};

/** Result of create_pull_request_approval_rule. */
export type CreatePullRequestApprovalRuleResult = {
  approvalRule?: Record<string, unknown>;
};

/** Result of create_unreferenced_merge_commit. */
export type CreateUnreferencedMergeCommitResult = {
  commitId?: string;
  treeId?: string;
};

/** Result of delete_approval_rule_template. */
export type DeleteApprovalRuleTemplateResult = {
  approvalRuleTemplateId?: string;
};

/** Result of delete_comment_content. */
export type DeleteCommentContentResult = {
  comment?: Record<string, unknown>;
};

/** Result of delete_pull_request_approval_rule. */
export type DeletePullRequestApprovalRuleResult = {
  approvalRuleId?: string;
};

/** Result of describe_merge_conflicts. */
export type DescribeMergeConflictsResult = {
  conflictMetadata?: Record<string, unknown>;
  mergeHunks?: Record<string, unknown>[];
  nextToken?: string;
  destinationCommitId?: string;
  sourceCommitId?: string;
  baseCommitId?: string;
};

/** Result of describe_pull_request_events. */
export type DescribePullRequestEventsResult = {
  pullRequestEvents?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of evaluate_pull_request_approval_rules. */
export type EvaluatePullRequestApprovalRulesResult = {
  evaluation?: Record<string, unknown>;
};

/** Result of get_approval_rule_template. */
export type GetApprovalRuleTemplateResult = {
  approvalRuleTemplate?: Record<string, unknown>;
};

/** Result of get_comment. */
export type GetCommentResult = {
  comment?: Record<string, unknown>;
};

/** Result of get_comment_reactions. */
export type GetCommentReactionsResult = {
  reactionsForComment?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of get_comments_for_compared_commit. */
export type GetCommentsForComparedCommitResult = {
  commentsForComparedCommitData?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of get_comments_for_pull_request. */
export type GetCommentsForPullRequestResult = {
  commentsForPullRequestData?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of get_folder. */
export type GetFolderResult = {
  commitId?: string;
  folderPath?: string;
  treeId?: string;
  subFolders?: Record<string, unknown>[];
  files?: Record<string, unknown>[];
  symbolicLinks?: Record<string, unknown>[];
  subModules?: Record<string, unknown>[];
};

/** Result of get_merge_commit. */
export type GetMergeCommitResult = {
  sourceCommitId?: string;
  destinationCommitId?: string;
  baseCommitId?: string;
  mergedCommitId?: string;
};

/** Result of get_merge_conflicts. */
export type GetMergeConflictsResult = {
  mergeable?: boolean;
  destinationCommitId?: string;
  sourceCommitId?: string;
  baseCommitId?: string;
  conflictMetadataList?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of get_merge_options. */
export type GetMergeOptionsResult = {
  mergeOptions?: string[];
  sourceCommitId?: string;
  destinationCommitId?: string;
  baseCommitId?: string;
};

/** Result of get_pull_request_approval_states. */
export type GetPullRequestApprovalStatesResult = {
  approvals?: Record<string, unknown>[];
};

/** Result of get_pull_request_override_state. */
export type GetPullRequestOverrideStateResult = {
  overridden?: boolean;
  overrider?: string;
};

/** Result of get_repository_triggers. */
export type GetRepositoryTriggersResult = {
  configurationId?: string;
  triggers?: Record<string, unknown>[];
};

/** Result of list_approval_rule_templates. */
export type ListApprovalRuleTemplatesResult = {
  approvalRuleTemplateNames?: string[];
  nextToken?: string;
};

/** Result of list_associated_approval_rule_templates_for_repository. */
export type ListAssociatedApprovalRuleTemplatesForRepositoryResult = {
  approvalRuleTemplateNames?: string[];
  nextToken?: string;
};

/** Result of list_file_commit_history. */
export type ListFileCommitHistoryResult = {
  revisionDag?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_repositories_for_approval_rule_template. */
export type ListRepositoriesForApprovalRuleTemplateResult = {
  repositoryNames?: string[];
  nextToken?: string;
};

/** Result of list_tags_for_resource. */
export type ListTagsForResourceResult = {
  tags?: Record<string, unknown>;
  nextToken?: string;
};

/** Result of merge_branches_by_three_way. */
export type MergeBranchesByThreeWayResult = {
  commitId?: string;
  treeId?: string;
};

/** Result of merge_pull_request_by_squash. */
export type MergePullRequestBySquashResult = {
  pullRequest?: Record<string, unknown>;
};

/** Result of merge_pull_request_by_three_way. */
export type MergePullRequestByThreeWayResult = {
  pullRequest?: Record<string, unknown>;
};

/** Result of post_comment_for_compared_commit. */
export type PostCommentForComparedCommitResult = {
  repositoryName?: string;
  beforeCommitId?: string;
  afterCommitId?: string;
  beforeBlobId?: string;
  afterBlobId?: string;
  location?: Record<string, unknown>;
  comment?: Record<string, unknown>;
};

/** Result of post_comment_for_pull_request. */
export type PostCommentForPullRequestResult = {
  repositoryName?: string;
  pullRequestId?: string;
  beforeCommitId?: string;
  afterCommitId?: string;
  beforeBlobId?: string;
  afterBlobId?: string;
  location?: Record<string, unknown>;
  comment?: Record<string, unknown>;
};

/** Result of post_comment_reply. */
export type PostCommentReplyResult = {
  comment?: Record<string, unknown>;
};

/** Result of put_repository_triggers. */
export type PutRepositoryTriggersResult = {
  configurationId?: string;
};

/** Result of run_repository_triggers. */
export type RunRepositoryTriggersResult = {
  successfulExecutions?: string[];
  failedExecutions?: Record<string, unknown>[];
};

/** Result of update_approval_rule_template_content. */
export type UpdateApprovalRuleTemplateContentResult = {
  approvalRuleTemplate?: Record<string, unknown>;
};

/** Result of update_approval_rule_template_description. */
export type UpdateApprovalRuleTemplateDescriptionResult = {
  approvalRuleTemplate?: Record<string, unknown>;
};

/** Result of update_approval_rule_template_name. */
export type UpdateApprovalRuleTemplateNameResult = {
  approvalRuleTemplate?: Record<string, unknown>;
};

/** Result of update_comment. */
export type UpdateCommentResult = {
  comment?: Record<string, unknown>;
};

/** Result of update_pull_request_approval_rule_content. */
export type UpdatePullRequestApprovalRuleContentResult = {
  approvalRule?: Record<string, unknown>;
};

/** Result of update_pull_request_description. */
export type UpdatePullRequestDescriptionResult = {
  pullRequest?: Record<string, unknown>;
};

/** Result of update_pull_request_status. */
export type UpdatePullRequestStatusResult = {
  pullRequest?: Record<string, unknown>;
};

/** Result of update_pull_request_title. */
export type UpdatePullRequestTitleResult = {
  pullRequest?: Record<string, unknown>;
};

/** Result of update_repository_encryption_key. */
export type UpdateRepositoryEncryptionKeyResult = {
  repositoryId?: string;
  kmsKeyId?: string;
  originalKmsKeyId?: string;
};

/** Create a new CodeCommit repository. */
export async function createRepository(repositoryName: string): Promise<RepositoryResult> {
  try {
    // TODO: implement create_repository
    throw new Error("create_repository not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_repository failed");
  }
}

/** Get metadata for a CodeCommit repository. */
export async function getRepository(repositoryName: string): Promise<RepositoryResult> {
  try {
    // TODO: implement get_repository
    throw new Error("get_repository not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_repository failed");
  }
}

/** List CodeCommit repositories. */
export async function listRepositories(): Promise<Record<string, unknown>[]> {
  try {
    // TODO: implement list_repositories
    throw new Error("list_repositories not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_repositories failed");
  }
}

/** Delete a CodeCommit repository. */
export async function deleteRepository(repositoryName: string): Promise<string> {
  try {
    // TODO: implement delete_repository
    throw new Error("delete_repository not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_repository failed");
  }
}

/** Rename a CodeCommit repository. */
export async function updateRepositoryName(oldName: string, newName: string): Promise<void> {
  try {
    // TODO: implement update_repository_name
    throw new Error("update_repository_name not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_repository_name failed");
  }
}

/** Update the description of a CodeCommit repository. */
export async function updateRepositoryDescription(repositoryName: string, description: string): Promise<void> {
  try {
    // TODO: implement update_repository_description
    throw new Error("update_repository_description not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_repository_description failed");
  }
}

/** Create a branch in a CodeCommit repository. */
export async function createBranch(repositoryName: string, branchName: string, commitId: string): Promise<void> {
  try {
    // TODO: implement create_branch
    throw new Error("create_branch not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_branch failed");
  }
}

/** Get information about a branch. */
export async function getBranch(repositoryName: string, branchName: string): Promise<BranchResult> {
  try {
    // TODO: implement get_branch
    throw new Error("get_branch not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_branch failed");
  }
}

/** List branch names in a repository. */
export async function listBranches(repositoryName: string): Promise<string[]> {
  try {
    // TODO: implement list_branches
    throw new Error("list_branches not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_branches failed");
  }
}

/** Delete a branch from a CodeCommit repository. */
export async function deleteBranch(repositoryName: string, branchName: string): Promise<BranchResult> {
  try {
    // TODO: implement delete_branch
    throw new Error("delete_branch not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_branch failed");
  }
}

/** Merge two branches using fast-forward. */
export async function mergeBranchesByFastForward(repositoryName: string, sourceCommit: string, destinationCommit: string): Promise<string> {
  try {
    // TODO: implement merge_branches_by_fast_forward
    throw new Error("merge_branches_by_fast_forward not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "merge_branches_by_fast_forward failed");
  }
}

/** Merge two branches using squash. */
export async function mergeBranchesBySquash(repositoryName: string, sourceCommit: string, destinationCommit: string): Promise<string> {
  try {
    // TODO: implement merge_branches_by_squash
    throw new Error("merge_branches_by_squash not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "merge_branches_by_squash failed");
  }
}

/** Create a commit in a CodeCommit repository. */
export async function createCommit(repositoryName: string, branchName: string): Promise<CommitResult> {
  try {
    // TODO: implement create_commit
    throw new Error("create_commit not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_commit failed");
  }
}

/** Get details of a commit. */
export async function getCommit(repositoryName: string, commitId: string): Promise<CommitResult> {
  try {
    // TODO: implement get_commit
    throw new Error("get_commit not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_commit failed");
  }
}

/** Get a file from a CodeCommit repository. */
export async function getFile(repositoryName: string, filePath: string): Promise<FileResult> {
  try {
    // TODO: implement get_file
    throw new Error("get_file not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_file failed");
  }
}

/** Put a file into a CodeCommit repository. */
export async function putFile(repositoryName: string, filePath: string, fileContent: Uint8Array, branchName: string): Promise<Record<string, unknown>> {
  try {
    // TODO: implement put_file
    throw new Error("put_file not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_file failed");
  }
}

/** Delete a file from a CodeCommit repository. */
export async function deleteFile(repositoryName: string, filePath: string, branchName: string, parentCommitId: string): Promise<Record<string, unknown>> {
  try {
    // TODO: implement delete_file
    throw new Error("delete_file not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_file failed");
  }
}

/** Get differences between commits or commit and working tree. */
export async function getDifferences(repositoryName: string, afterCommitSpecifier: string): Promise<DiffResult[]> {
  try {
    // TODO: implement get_differences
    throw new Error("get_differences not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_differences failed");
  }
}

/** Create a pull request in CodeCommit. */
export async function createPullRequest(title: string, targets: Record<string, unknown>[]): Promise<PullRequestResult> {
  try {
    // TODO: implement create_pull_request
    throw new Error("create_pull_request not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_pull_request failed");
  }
}

/** Get details for a pull request. */
export async function getPullRequest(pullRequestId: string): Promise<PullRequestResult> {
  try {
    // TODO: implement get_pull_request
    throw new Error("get_pull_request not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_pull_request failed");
  }
}

/** List pull request IDs for a repository. */
export async function listPullRequests(repositoryName: string): Promise<string[]> {
  try {
    // TODO: implement list_pull_requests
    throw new Error("list_pull_requests not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_pull_requests failed");
  }
}

/** Merge a pull request using fast-forward. */
export async function mergePullRequestByFastForward(pullRequestId: string, repositoryName: string): Promise<PullRequestResult> {
  try {
    // TODO: implement merge_pull_request_by_fast_forward
    throw new Error("merge_pull_request_by_fast_forward not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "merge_pull_request_by_fast_forward failed");
  }
}

/** Get the content of a blob from a CodeCommit repository. */
export async function getBlob(repositoryName: string, blobId: string): Promise<BlobResult> {
  try {
    // TODO: implement get_blob
    throw new Error("get_blob not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_blob failed");
  }
}

/** Associate approval rule template with repository. */
export async function associateApprovalRuleTemplateWithRepository(approvalRuleTemplateName: string, repositoryName: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement associate_approval_rule_template_with_repository
    throw new Error("associate_approval_rule_template_with_repository not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "associate_approval_rule_template_with_repository failed");
  }
}

/** Batch associate approval rule template with repositories. */
export async function batchAssociateApprovalRuleTemplateWithRepositories(approvalRuleTemplateName: string, repositoryNames: string[], regionName?: string): Promise<BatchAssociateApprovalRuleTemplateWithRepositoriesResult> {
  try {
    // TODO: implement batch_associate_approval_rule_template_with_repositories
    throw new Error("batch_associate_approval_rule_template_with_repositories not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_associate_approval_rule_template_with_repositories failed");
  }
}

/** Batch describe merge conflicts. */
export async function batchDescribeMergeConflicts(repositoryName: string, destinationCommitSpecifier: string, sourceCommitSpecifier: string, mergeOption: string): Promise<BatchDescribeMergeConflictsResult> {
  try {
    // TODO: implement batch_describe_merge_conflicts
    throw new Error("batch_describe_merge_conflicts not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_describe_merge_conflicts failed");
  }
}

/** Batch disassociate approval rule template from repositories. */
export async function batchDisassociateApprovalRuleTemplateFromRepositories(approvalRuleTemplateName: string, repositoryNames: string[], regionName?: string): Promise<BatchDisassociateApprovalRuleTemplateFromRepositoriesResult> {
  try {
    // TODO: implement batch_disassociate_approval_rule_template_from_repositories
    throw new Error("batch_disassociate_approval_rule_template_from_repositories not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_disassociate_approval_rule_template_from_repositories failed");
  }
}

/** Batch get commits. */
export async function batchGetCommits(commitIds: string[], repositoryName: string, regionName?: string): Promise<BatchGetCommitsResult> {
  try {
    // TODO: implement batch_get_commits
    throw new Error("batch_get_commits not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_get_commits failed");
  }
}

/** Batch get repositories. */
export async function batchGetRepositories(repositoryNames: string[], regionName?: string): Promise<BatchGetRepositoriesResult> {
  try {
    // TODO: implement batch_get_repositories
    throw new Error("batch_get_repositories not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_get_repositories failed");
  }
}

/** Create approval rule template. */
export async function createApprovalRuleTemplate(approvalRuleTemplateName: string, approvalRuleTemplateContent: string): Promise<CreateApprovalRuleTemplateResult> {
  try {
    // TODO: implement create_approval_rule_template
    throw new Error("create_approval_rule_template not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_approval_rule_template failed");
  }
}

/** Create pull request approval rule. */
export async function createPullRequestApprovalRule(pullRequestId: string, approvalRuleName: string, approvalRuleContent: string, regionName?: string): Promise<CreatePullRequestApprovalRuleResult> {
  try {
    // TODO: implement create_pull_request_approval_rule
    throw new Error("create_pull_request_approval_rule not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_pull_request_approval_rule failed");
  }
}

/** Create unreferenced merge commit. */
export async function createUnreferencedMergeCommit(repositoryName: string, sourceCommitSpecifier: string, destinationCommitSpecifier: string, mergeOption: string): Promise<CreateUnreferencedMergeCommitResult> {
  try {
    // TODO: implement create_unreferenced_merge_commit
    throw new Error("create_unreferenced_merge_commit not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_unreferenced_merge_commit failed");
  }
}

/** Delete approval rule template. */
export async function deleteApprovalRuleTemplate(approvalRuleTemplateName: string, regionName?: string): Promise<DeleteApprovalRuleTemplateResult> {
  try {
    // TODO: implement delete_approval_rule_template
    throw new Error("delete_approval_rule_template not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_approval_rule_template failed");
  }
}

/** Delete comment content. */
export async function deleteCommentContent(commentId: string, regionName?: string): Promise<DeleteCommentContentResult> {
  try {
    // TODO: implement delete_comment_content
    throw new Error("delete_comment_content not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_comment_content failed");
  }
}

/** Delete pull request approval rule. */
export async function deletePullRequestApprovalRule(pullRequestId: string, approvalRuleName: string, regionName?: string): Promise<DeletePullRequestApprovalRuleResult> {
  try {
    // TODO: implement delete_pull_request_approval_rule
    throw new Error("delete_pull_request_approval_rule not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_pull_request_approval_rule failed");
  }
}

/** Describe merge conflicts. */
export async function describeMergeConflicts(repositoryName: string, destinationCommitSpecifier: string, sourceCommitSpecifier: string, mergeOption: string, filePath: string): Promise<DescribeMergeConflictsResult> {
  try {
    // TODO: implement describe_merge_conflicts
    throw new Error("describe_merge_conflicts not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_merge_conflicts failed");
  }
}

/** Describe pull request events. */
export async function describePullRequestEvents(pullRequestId: string): Promise<DescribePullRequestEventsResult> {
  try {
    // TODO: implement describe_pull_request_events
    throw new Error("describe_pull_request_events not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_pull_request_events failed");
  }
}

/** Disassociate approval rule template from repository. */
export async function disassociateApprovalRuleTemplateFromRepository(approvalRuleTemplateName: string, repositoryName: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement disassociate_approval_rule_template_from_repository
    throw new Error("disassociate_approval_rule_template_from_repository not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disassociate_approval_rule_template_from_repository failed");
  }
}

/** Evaluate pull request approval rules. */
export async function evaluatePullRequestApprovalRules(pullRequestId: string, revisionId: string, regionName?: string): Promise<EvaluatePullRequestApprovalRulesResult> {
  try {
    // TODO: implement evaluate_pull_request_approval_rules
    throw new Error("evaluate_pull_request_approval_rules not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "evaluate_pull_request_approval_rules failed");
  }
}

/** Get approval rule template. */
export async function getApprovalRuleTemplate(approvalRuleTemplateName: string, regionName?: string): Promise<GetApprovalRuleTemplateResult> {
  try {
    // TODO: implement get_approval_rule_template
    throw new Error("get_approval_rule_template not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_approval_rule_template failed");
  }
}

/** Get comment. */
export async function getComment(commentId: string, regionName?: string): Promise<GetCommentResult> {
  try {
    // TODO: implement get_comment
    throw new Error("get_comment not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_comment failed");
  }
}

/** Get comment reactions. */
export async function getCommentReactions(commentId: string): Promise<GetCommentReactionsResult> {
  try {
    // TODO: implement get_comment_reactions
    throw new Error("get_comment_reactions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_comment_reactions failed");
  }
}

/** Get comments for compared commit. */
export async function getCommentsForComparedCommit(repositoryName: string, afterCommitId: string): Promise<GetCommentsForComparedCommitResult> {
  try {
    // TODO: implement get_comments_for_compared_commit
    throw new Error("get_comments_for_compared_commit not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_comments_for_compared_commit failed");
  }
}

/** Get comments for pull request. */
export async function getCommentsForPullRequest(pullRequestId: string): Promise<GetCommentsForPullRequestResult> {
  try {
    // TODO: implement get_comments_for_pull_request
    throw new Error("get_comments_for_pull_request not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_comments_for_pull_request failed");
  }
}

/** Get folder. */
export async function getFolder(repositoryName: string, folderPath: string): Promise<GetFolderResult> {
  try {
    // TODO: implement get_folder
    throw new Error("get_folder not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_folder failed");
  }
}

/** Get merge commit. */
export async function getMergeCommit(repositoryName: string, sourceCommitSpecifier: string, destinationCommitSpecifier: string): Promise<GetMergeCommitResult> {
  try {
    // TODO: implement get_merge_commit
    throw new Error("get_merge_commit not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_merge_commit failed");
  }
}

/** Get merge conflicts. */
export async function getMergeConflicts(repositoryName: string, destinationCommitSpecifier: string, sourceCommitSpecifier: string, mergeOption: string): Promise<GetMergeConflictsResult> {
  try {
    // TODO: implement get_merge_conflicts
    throw new Error("get_merge_conflicts not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_merge_conflicts failed");
  }
}

/** Get merge options. */
export async function getMergeOptions(repositoryName: string, sourceCommitSpecifier: string, destinationCommitSpecifier: string): Promise<GetMergeOptionsResult> {
  try {
    // TODO: implement get_merge_options
    throw new Error("get_merge_options not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_merge_options failed");
  }
}

/** Get pull request approval states. */
export async function getPullRequestApprovalStates(pullRequestId: string, revisionId: string, regionName?: string): Promise<GetPullRequestApprovalStatesResult> {
  try {
    // TODO: implement get_pull_request_approval_states
    throw new Error("get_pull_request_approval_states not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_pull_request_approval_states failed");
  }
}

/** Get pull request override state. */
export async function getPullRequestOverrideState(pullRequestId: string, revisionId: string, regionName?: string): Promise<GetPullRequestOverrideStateResult> {
  try {
    // TODO: implement get_pull_request_override_state
    throw new Error("get_pull_request_override_state not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_pull_request_override_state failed");
  }
}

/** Get repository triggers. */
export async function getRepositoryTriggers(repositoryName: string, regionName?: string): Promise<GetRepositoryTriggersResult> {
  try {
    // TODO: implement get_repository_triggers
    throw new Error("get_repository_triggers not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_repository_triggers failed");
  }
}

/** List approval rule templates. */
export async function listApprovalRuleTemplates(): Promise<ListApprovalRuleTemplatesResult> {
  try {
    // TODO: implement list_approval_rule_templates
    throw new Error("list_approval_rule_templates not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_approval_rule_templates failed");
  }
}

/** List associated approval rule templates for repository. */
export async function listAssociatedApprovalRuleTemplatesForRepository(repositoryName: string): Promise<ListAssociatedApprovalRuleTemplatesForRepositoryResult> {
  try {
    // TODO: implement list_associated_approval_rule_templates_for_repository
    throw new Error("list_associated_approval_rule_templates_for_repository not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_associated_approval_rule_templates_for_repository failed");
  }
}

/** List file commit history. */
export async function listFileCommitHistory(repositoryName: string, filePath: string): Promise<ListFileCommitHistoryResult> {
  try {
    // TODO: implement list_file_commit_history
    throw new Error("list_file_commit_history not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_file_commit_history failed");
  }
}

/** List repositories for approval rule template. */
export async function listRepositoriesForApprovalRuleTemplate(approvalRuleTemplateName: string): Promise<ListRepositoriesForApprovalRuleTemplateResult> {
  try {
    // TODO: implement list_repositories_for_approval_rule_template
    throw new Error("list_repositories_for_approval_rule_template not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_repositories_for_approval_rule_template failed");
  }
}

/** List tags for resource. */
export async function listTagsForResource(resourceArn: string): Promise<ListTagsForResourceResult> {
  try {
    // TODO: implement list_tags_for_resource
    throw new Error("list_tags_for_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_tags_for_resource failed");
  }
}

/** Merge branches by three way. */
export async function mergeBranchesByThreeWay(repositoryName: string, sourceCommitSpecifier: string, destinationCommitSpecifier: string): Promise<MergeBranchesByThreeWayResult> {
  try {
    // TODO: implement merge_branches_by_three_way
    throw new Error("merge_branches_by_three_way not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "merge_branches_by_three_way failed");
  }
}

/** Merge pull request by squash. */
export async function mergePullRequestBySquash(pullRequestId: string, repositoryName: string): Promise<MergePullRequestBySquashResult> {
  try {
    // TODO: implement merge_pull_request_by_squash
    throw new Error("merge_pull_request_by_squash not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "merge_pull_request_by_squash failed");
  }
}

/** Merge pull request by three way. */
export async function mergePullRequestByThreeWay(pullRequestId: string, repositoryName: string): Promise<MergePullRequestByThreeWayResult> {
  try {
    // TODO: implement merge_pull_request_by_three_way
    throw new Error("merge_pull_request_by_three_way not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "merge_pull_request_by_three_way failed");
  }
}

/** Override pull request approval rules. */
export async function overridePullRequestApprovalRules(pullRequestId: string, revisionId: string, overrideStatus: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement override_pull_request_approval_rules
    throw new Error("override_pull_request_approval_rules not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "override_pull_request_approval_rules failed");
  }
}

/** Post comment for compared commit. */
export async function postCommentForComparedCommit(repositoryName: string, afterCommitId: string, content: string): Promise<PostCommentForComparedCommitResult> {
  try {
    // TODO: implement post_comment_for_compared_commit
    throw new Error("post_comment_for_compared_commit not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "post_comment_for_compared_commit failed");
  }
}

/** Post comment for pull request. */
export async function postCommentForPullRequest(pullRequestId: string, repositoryName: string, beforeCommitId: string, afterCommitId: string, content: string): Promise<PostCommentForPullRequestResult> {
  try {
    // TODO: implement post_comment_for_pull_request
    throw new Error("post_comment_for_pull_request not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "post_comment_for_pull_request failed");
  }
}

/** Post comment reply. */
export async function postCommentReply(inReplyTo: string, content: string): Promise<PostCommentReplyResult> {
  try {
    // TODO: implement post_comment_reply
    throw new Error("post_comment_reply not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "post_comment_reply failed");
  }
}

/** Put comment reaction. */
export async function putCommentReaction(commentId: string, reactionValue: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement put_comment_reaction
    throw new Error("put_comment_reaction not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_comment_reaction failed");
  }
}

/** Put repository triggers. */
export async function putRepositoryTriggers(repositoryName: string, triggers: Record<string, unknown>[], regionName?: string): Promise<PutRepositoryTriggersResult> {
  try {
    // TODO: implement put_repository_triggers
    throw new Error("put_repository_triggers not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_repository_triggers failed");
  }
}

/** Run repository triggers. */
export async function runRepositoryTriggers(repositoryName: string, triggers: Record<string, unknown>[], regionName?: string): Promise<RunRepositoryTriggersResult> {
  try {
    // TODO: implement run_repository_triggers
    throw new Error("run_repository_triggers not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "run_repository_triggers failed");
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

/** Update approval rule template content. */
export async function updateApprovalRuleTemplateContent(approvalRuleTemplateName: string, newRuleContent: string): Promise<UpdateApprovalRuleTemplateContentResult> {
  try {
    // TODO: implement update_approval_rule_template_content
    throw new Error("update_approval_rule_template_content not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_approval_rule_template_content failed");
  }
}

/** Update approval rule template description. */
export async function updateApprovalRuleTemplateDescription(approvalRuleTemplateName: string, approvalRuleTemplateDescription: string, regionName?: string): Promise<UpdateApprovalRuleTemplateDescriptionResult> {
  try {
    // TODO: implement update_approval_rule_template_description
    throw new Error("update_approval_rule_template_description not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_approval_rule_template_description failed");
  }
}

/** Update approval rule template name. */
export async function updateApprovalRuleTemplateName(oldApprovalRuleTemplateName: string, newApprovalRuleTemplateName: string, regionName?: string): Promise<UpdateApprovalRuleTemplateNameResult> {
  try {
    // TODO: implement update_approval_rule_template_name
    throw new Error("update_approval_rule_template_name not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_approval_rule_template_name failed");
  }
}

/** Update comment. */
export async function updateComment(commentId: string, content: string, regionName?: string): Promise<UpdateCommentResult> {
  try {
    // TODO: implement update_comment
    throw new Error("update_comment not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_comment failed");
  }
}

/** Update default branch. */
export async function updateDefaultBranch(repositoryName: string, defaultBranchName: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement update_default_branch
    throw new Error("update_default_branch not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_default_branch failed");
  }
}

/** Update pull request approval rule content. */
export async function updatePullRequestApprovalRuleContent(pullRequestId: string, approvalRuleName: string, newRuleContent: string): Promise<UpdatePullRequestApprovalRuleContentResult> {
  try {
    // TODO: implement update_pull_request_approval_rule_content
    throw new Error("update_pull_request_approval_rule_content not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_pull_request_approval_rule_content failed");
  }
}

/** Update pull request approval state. */
export async function updatePullRequestApprovalState(pullRequestId: string, revisionId: string, approvalState: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement update_pull_request_approval_state
    throw new Error("update_pull_request_approval_state not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_pull_request_approval_state failed");
  }
}

/** Update pull request description. */
export async function updatePullRequestDescription(pullRequestId: string, description: string, regionName?: string): Promise<UpdatePullRequestDescriptionResult> {
  try {
    // TODO: implement update_pull_request_description
    throw new Error("update_pull_request_description not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_pull_request_description failed");
  }
}

/** Update pull request status. */
export async function updatePullRequestStatus(pullRequestId: string, pullRequestStatus: string, regionName?: string): Promise<UpdatePullRequestStatusResult> {
  try {
    // TODO: implement update_pull_request_status
    throw new Error("update_pull_request_status not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_pull_request_status failed");
  }
}

/** Update pull request title. */
export async function updatePullRequestTitle(pullRequestId: string, title: string, regionName?: string): Promise<UpdatePullRequestTitleResult> {
  try {
    // TODO: implement update_pull_request_title
    throw new Error("update_pull_request_title not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_pull_request_title failed");
  }
}

/** Update repository encryption key. */
export async function updateRepositoryEncryptionKey(repositoryName: string, kmsKeyId: string, regionName?: string): Promise<UpdateRepositoryEncryptionKeyResult> {
  try {
    // TODO: implement update_repository_encryption_key
    throw new Error("update_repository_encryption_key not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_repository_encryption_key failed");
  }
}
