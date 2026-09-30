import { DetectiveClient } from "@aws-sdk/client-detective";
import { getClient } from "./client";
import { wrapAwsError } from "./exceptions";

/** An Amazon Detective behavior graph. */
export type GraphResult = {
  graphArn?: string;
  createdAt?: string;
  extra?: Record<string, unknown>;
};

/** An Amazon Detective member account. */
export type MemberResult = {
  accountId?: string;
  emailAddress?: string;
  status?: string;
  invitedTime?: string;
  updatedTime?: string;
  graphArn?: string;
  extra?: Record<string, unknown>;
};

/** An Amazon Detective invitation. */
export type InvitationResult = {
  graphArn?: string;
  accountId?: string;
  emailAddress?: string;
  status?: string;
  extra?: Record<string, unknown>;
};

/** An Amazon Detective investigation. */
export type InvestigationResult = {
  investigationId?: string;
  graphArn?: string;
  entityArn?: string;
  entityType?: string;
  status?: string;
  severity?: string;
  createdTime?: string;
  extra?: Record<string, unknown>;
};

/** An Amazon Detective investigation indicator. */
export type IndicatorResult = {
  indicatorType?: string;
  indicatorDetail?: Record<string, unknown>;
  extra?: Record<string, unknown>;
};

/** Result of batch_get_graph_member_datasources. */
export type BatchGetGraphMemberDatasourcesResult = {
  memberDatasources?: Record<string, unknown>[];
  unprocessedAccounts?: Record<string, unknown>[];
};

/** Result of batch_get_membership_datasources. */
export type BatchGetMembershipDatasourcesResult = {
  membershipDatasources?: Record<string, unknown>[];
  unprocessedGraphs?: Record<string, unknown>[];
};

/** Result of describe_organization_configuration. */
export type DescribeOrganizationConfigurationResult = {
  autoEnable?: boolean;
};

/** Result of list_datasource_packages. */
export type ListDatasourcePackagesResult = {
  datasourcePackages?: Record<string, unknown>;
  nextToken?: string;
};

/** Result of list_organization_admin_accounts. */
export type ListOrganizationAdminAccountsResult = {
  administrators?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_tags_for_resource. */
export type ListTagsForResourceResult = {
  tags?: Record<string, unknown>;
};

/** Create a Detective behavior graph. */
export async function createGraph(): Promise<string> {
  try {
    // TODO: implement create_graph
    throw new Error("create_graph not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_graph failed");
  }
}

/** Delete a Detective behavior graph. */
export async function deleteGraph(graphArn: string): Promise<void> {
  try {
    // TODO: implement delete_graph
    throw new Error("delete_graph not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_graph failed");
  }
}

/** List Detective behavior graphs. */
export async function listGraphs(): Promise<GraphResult[]> {
  try {
    // TODO: implement list_graphs
    throw new Error("list_graphs not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_graphs failed");
  }
}

/** Create member associations in a Detective graph. */
export async function createMembers(graphArn: string, accounts: Record<string, unknown>[]): Promise<Record<string, unknown>> {
  try {
    // TODO: implement create_members
    throw new Error("create_members not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_members failed");
  }
}

/** List members of a Detective behavior graph. */
export async function listMembers(graphArn: string): Promise<MemberResult[]> {
  try {
    // TODO: implement list_members
    throw new Error("list_members not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_members failed");
  }
}

/** Get details for specific members of a Detective graph. */
export async function getMembers(graphArn: string, accountIds: string[]): Promise<MemberResult[]> {
  try {
    // TODO: implement get_members
    throw new Error("get_members not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_members failed");
  }
}

/** Delete members from a Detective behavior graph. */
export async function deleteMembers(graphArn: string, accountIds: string[]): Promise<Record<string, unknown>[]> {
  try {
    // TODO: implement delete_members
    throw new Error("delete_members not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_members failed");
  }
}

/** Accept a Detective graph invitation. */
export async function acceptInvitation(graphArn: string): Promise<void> {
  try {
    // TODO: implement accept_invitation
    throw new Error("accept_invitation not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "accept_invitation failed");
  }
}

/** Reject a Detective graph invitation. */
export async function rejectInvitation(graphArn: string): Promise<void> {
  try {
    // TODO: implement reject_invitation
    throw new Error("reject_invitation not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "reject_invitation failed");
  }
}

/** List Detective invitations for the current account. */
export async function listInvitations(): Promise<InvitationResult[]> {
  try {
    // TODO: implement list_invitations
    throw new Error("list_invitations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_invitations failed");
  }
}

/** Start a Detective investigation. */
export async function startInvestigation(graphArn: string, entityArn: string, scopeStartTime: string, scopeEndTime: string): Promise<string> {
  try {
    // TODO: implement start_investigation
    throw new Error("start_investigation not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_investigation failed");
  }
}

/** Get details of a Detective investigation. */
export async function getInvestigation(graphArn: string, investigationId: string): Promise<InvestigationResult> {
  try {
    // TODO: implement get_investigation
    throw new Error("get_investigation not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_investigation failed");
  }
}

/** List Detective investigations. */
export async function listInvestigations(graphArn: string): Promise<InvestigationResult[]> {
  try {
    // TODO: implement list_investigations
    throw new Error("list_investigations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_investigations failed");
  }
}

/** List indicators for a Detective investigation. */
export async function listIndicators(graphArn: string, investigationId: string): Promise<IndicatorResult[]> {
  try {
    // TODO: implement list_indicators
    throw new Error("list_indicators not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_indicators failed");
  }
}

/** Batch get graph member datasources. */
export async function batchGetGraphMemberDatasources(graphArn: string, accountIds: string[], regionName?: string): Promise<BatchGetGraphMemberDatasourcesResult> {
  try {
    // TODO: implement batch_get_graph_member_datasources
    throw new Error("batch_get_graph_member_datasources not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_get_graph_member_datasources failed");
  }
}

/** Batch get membership datasources. */
export async function batchGetMembershipDatasources(graphArns: string[], regionName?: string): Promise<BatchGetMembershipDatasourcesResult> {
  try {
    // TODO: implement batch_get_membership_datasources
    throw new Error("batch_get_membership_datasources not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_get_membership_datasources failed");
  }
}

/** Describe organization configuration. */
export async function describeOrganizationConfiguration(graphArn: string, regionName?: string): Promise<DescribeOrganizationConfigurationResult> {
  try {
    // TODO: implement describe_organization_configuration
    throw new Error("describe_organization_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_organization_configuration failed");
  }
}

/** Disable organization admin account. */
export async function disableOrganizationAdminAccount(regionName?: string): Promise<void> {
  try {
    // TODO: implement disable_organization_admin_account
    throw new Error("disable_organization_admin_account not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disable_organization_admin_account failed");
  }
}

/** Disassociate membership. */
export async function disassociateMembership(graphArn: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement disassociate_membership
    throw new Error("disassociate_membership not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disassociate_membership failed");
  }
}

/** Enable organization admin account. */
export async function enableOrganizationAdminAccount(accountId: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement enable_organization_admin_account
    throw new Error("enable_organization_admin_account not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "enable_organization_admin_account failed");
  }
}

/** List datasource packages. */
export async function listDatasourcePackages(graphArn: string): Promise<ListDatasourcePackagesResult> {
  try {
    // TODO: implement list_datasource_packages
    throw new Error("list_datasource_packages not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_datasource_packages failed");
  }
}

/** List organization admin accounts. */
export async function listOrganizationAdminAccounts(): Promise<ListOrganizationAdminAccountsResult> {
  try {
    // TODO: implement list_organization_admin_accounts
    throw new Error("list_organization_admin_accounts not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_organization_admin_accounts failed");
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

/** Start monitoring member. */
export async function startMonitoringMember(graphArn: string, accountId: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement start_monitoring_member
    throw new Error("start_monitoring_member not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_monitoring_member failed");
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

/** Update datasource packages. */
export async function updateDatasourcePackages(graphArn: string, datasourcePackages: string[], regionName?: string): Promise<void> {
  try {
    // TODO: implement update_datasource_packages
    throw new Error("update_datasource_packages not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_datasource_packages failed");
  }
}

/** Update investigation state. */
export async function updateInvestigationState(graphArn: string, investigationId: string, state: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement update_investigation_state
    throw new Error("update_investigation_state not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_investigation_state failed");
  }
}

/** Update organization configuration. */
export async function updateOrganizationConfiguration(graphArn: string): Promise<void> {
  try {
    // TODO: implement update_organization_configuration
    throw new Error("update_organization_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_organization_configuration failed");
  }
}
