import { OrganizationsClient } from "@aws-sdk/client-organizations";
import { getClient } from "./client";
import { wrapAwsError } from "./exceptions";

/** Metadata for an AWS Organization. */
export type OrgResult = {
  id: string;
  arn: string;
  masterAccountArn?: string;
  masterAccountId?: string;
  masterAccountEmail?: string;
  featureSet?: string;
  availablePolicyTypes?: Record<string, unknown>[];
  extra?: Record<string, unknown>;
};

/** Metadata for an organizational unit. */
export type OUResult = {
  id: string;
  arn: string;
  name?: string;
  extra?: Record<string, unknown>;
};

/** Metadata for an AWS account in the organization. */
export type AccountResult = {
  id: string;
  arn: string;
  name?: string;
  email?: string;
  status?: string;
  joinedMethod?: string;
  joinedTimestamp?: unknown;
  extra?: Record<string, unknown>;
};

/** Full policy including summary and content. */
export type PolicyResult = {
  id: string;
  arn: string;
  name?: string;
  description?: string;
  type?: string;
  awsManaged?: boolean;
  content?: string;
  extra?: Record<string, unknown>;
};

/** Summary metadata for an Organizations policy. */
export type PolicySummaryResult = {
  id: string;
  arn: string;
  name?: string;
  description?: string;
  type?: string;
  awsManaged?: boolean;
  extra?: Record<string, unknown>;
};

/** Metadata for an Organizations handshake. */
export type HandshakeResult = {
  id: string;
  arn: string;
  state?: string;
  action?: string;
  resources?: Record<string, unknown>[];
  parties?: Record<string, unknown>[];
  requestedTimestamp?: unknown;
  expirationTimestamp?: unknown;
  extra?: Record<string, unknown>;
};

/** Metadata for an Organizations root. */
export type RootResult = {
  id: string;
  arn: string;
  name?: string;
  policyTypes?: Record<string, unknown>[];
  extra?: Record<string, unknown>;
};

/** Result of cancel_handshake. */
export type CancelHandshakeResult = {
  handshake?: Record<string, unknown>;
};

/** Result of create_gov_cloud_account. */
export type CreateGovCloudAccountResult = {
  createAccountStatus?: Record<string, unknown>;
};

/** Result of decline_handshake. */
export type DeclineHandshakeResult = {
  handshake?: Record<string, unknown>;
};

/** Result of describe_create_account_status. */
export type DescribeCreateAccountStatusResult = {
  createAccountStatus?: Record<string, unknown>;
};

/** Result of describe_effective_policy. */
export type DescribeEffectivePolicyResult = {
  effectivePolicy?: Record<string, unknown>;
};

/** Result of describe_handshake. */
export type DescribeHandshakeResult = {
  handshake?: Record<string, unknown>;
};

/** Result of describe_resource_policy. */
export type DescribeResourcePolicyResult = {
  resourcePolicy?: Record<string, unknown>;
};

/** Result of enable_all_features. */
export type EnableAllFeaturesResult = {
  handshake?: Record<string, unknown>;
};

/** Result of list_accounts_with_invalid_effective_policy. */
export type ListAccountsWithInvalidEffectivePolicyResult = {
  accounts?: Record<string, unknown>[];
  policyType?: string;
  nextToken?: string;
};

/** Result of list_aws_service_access_for_organization. */
export type ListAwsServiceAccessForOrganizationResult = {
  enabledServicePrincipals?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_create_account_status. */
export type ListCreateAccountStatusResult = {
  createAccountStatuses?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_delegated_administrators. */
export type ListDelegatedAdministratorsResult = {
  delegatedAdministrators?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_delegated_services_for_account. */
export type ListDelegatedServicesForAccountResult = {
  delegatedServices?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_effective_policy_validation_errors. */
export type ListEffectivePolicyValidationErrorsResult = {
  accountId?: string;
  policyType?: string;
  path?: string;
  evaluationTimestamp?: string;
  nextToken?: string;
  effectivePolicyValidationErrors?: Record<string, unknown>[];
};

/** Result of list_handshakes_for_account. */
export type ListHandshakesForAccountResult = {
  handshakes?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_handshakes_for_organization. */
export type ListHandshakesForOrganizationResult = {
  handshakes?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_policies_for_target. */
export type ListPoliciesForTargetResult = {
  policies?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_targets_for_policy. */
export type ListTargetsForPolicyResult = {
  targets?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of put_resource_policy. */
export type PutResourcePolicyResult = {
  resourcePolicy?: Record<string, unknown>;
};

/** Result of update_organizational_unit. */
export type UpdateOrganizationalUnitResult = {
  organizationalUnit?: Record<string, unknown>;
};

/** Create an AWS Organization. */
export async function createOrganization(): Promise<OrgResult> {
  try {
    // TODO: implement create_organization
    throw new Error("create_organization not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_organization failed");
  }
}

/** Describe the current AWS Organization. */
export async function describeOrganization(): Promise<OrgResult> {
  try {
    // TODO: implement describe_organization
    throw new Error("describe_organization not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_organization failed");
  }
}

/** Create an organizational unit under a parent. */
export async function createOrganizationalUnit(parentId: string, name: string): Promise<OUResult> {
  try {
    // TODO: implement create_organizational_unit
    throw new Error("create_organizational_unit not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_organizational_unit failed");
  }
}

/** Describe an organizational unit. */
export async function describeOrganizationalUnit(ouId: string): Promise<OUResult> {
  try {
    // TODO: implement describe_organizational_unit
    throw new Error("describe_organizational_unit not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_organizational_unit failed");
  }
}

/** List organizational units under a parent. */
export async function listOrganizationalUnitsForParent(parentId: string): Promise<OUResult[]> {
  try {
    // TODO: implement list_organizational_units_for_parent
    throw new Error("list_organizational_units_for_parent not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_organizational_units_for_parent failed");
  }
}

/** List all accounts in the organization. */
export async function listAccounts(): Promise<AccountResult[]> {
  try {
    // TODO: implement list_accounts
    throw new Error("list_accounts not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_accounts failed");
  }
}

/** List accounts under a specific parent. */
export async function listAccountsForParent(parentId: string): Promise<AccountResult[]> {
  try {
    // TODO: implement list_accounts_for_parent
    throw new Error("list_accounts_for_parent not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_accounts_for_parent failed");
  }
}

/** Describe a single account. */
export async function describeAccount(accountId: string): Promise<AccountResult> {
  try {
    // TODO: implement describe_account
    throw new Error("describe_account not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_account failed");
  }
}

/** Request creation of a new member account. */
export async function createAccount(email: string, accountName: string): Promise<Record<string, unknown>> {
  try {
    // TODO: implement create_account
    throw new Error("create_account not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_account failed");
  }
}

/** Invite an existing AWS account to join the organization. */
export async function inviteAccountToOrganization(targetId: string): Promise<HandshakeResult> {
  try {
    // TODO: implement invite_account_to_organization
    throw new Error("invite_account_to_organization not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "invite_account_to_organization failed");
  }
}

/** Accept a handshake invitation. */
export async function acceptHandshake(handshakeId: string): Promise<HandshakeResult> {
  try {
    // TODO: implement accept_handshake
    throw new Error("accept_handshake not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "accept_handshake failed");
  }
}

/** Move an account between OUs or roots. */
export async function moveAccount(accountId: string, sourceParentId: string, destinationParentId: string): Promise<void> {
  try {
    // TODO: implement move_account
    throw new Error("move_account not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "move_account failed");
  }
}

/** Remove a member account from the organization. */
export async function removeAccountFromOrganization(accountId: string): Promise<void> {
  try {
    // TODO: implement remove_account_from_organization
    throw new Error("remove_account_from_organization not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "remove_account_from_organization failed");
  }
}

/** List the roots of the organization. */
export async function listRoots(): Promise<RootResult[]> {
  try {
    // TODO: implement list_roots
    throw new Error("list_roots not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_roots failed");
  }
}

/** List children of a parent (accounts or OUs). */
export async function listChildren(parentId: string, childType: string): Promise<Record<string, unknown>[]> {
  try {
    // TODO: implement list_children
    throw new Error("list_children not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_children failed");
  }
}

/** List the parents of a child (account or OU). */
export async function listParents(childId: string): Promise<Record<string, unknown>[]> {
  try {
    // TODO: implement list_parents
    throw new Error("list_parents not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_parents failed");
  }
}

/** List policies in the organization. */
export async function listPolicies(policyFilter: string): Promise<PolicySummaryResult[]> {
  try {
    // TODO: implement list_policies
    throw new Error("list_policies not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_policies failed");
  }
}

/** Describe a policy including its content. */
export async function describePolicy(policyId: string): Promise<PolicyResult> {
  try {
    // TODO: implement describe_policy
    throw new Error("describe_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_policy failed");
  }
}

/** Create an Organizations policy. */
export async function createPolicy(name: string, content: string, description: string, policyType: string): Promise<PolicyResult> {
  try {
    // TODO: implement create_policy
    throw new Error("create_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_policy failed");
  }
}

/** Update an existing Organizations policy. */
export async function updatePolicy(policyId: string): Promise<PolicyResult> {
  try {
    // TODO: implement update_policy
    throw new Error("update_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_policy failed");
  }
}

/** Delete an Organizations policy. */
export async function deletePolicy(policyId: string): Promise<void> {
  try {
    // TODO: implement delete_policy
    throw new Error("delete_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_policy failed");
  }
}

/** Attach a policy to a target (root, OU, or account). */
export async function attachPolicy(policyId: string, targetId: string): Promise<void> {
  try {
    // TODO: implement attach_policy
    throw new Error("attach_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "attach_policy failed");
  }
}

/** Detach a policy from a target. */
export async function detachPolicy(policyId: string, targetId: string): Promise<void> {
  try {
    // TODO: implement detach_policy
    throw new Error("detach_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "detach_policy failed");
  }
}

/** Enable a policy type on a root. */
export async function enablePolicyType(rootId: string, policyType: string): Promise<RootResult> {
  try {
    // TODO: implement enable_policy_type
    throw new Error("enable_policy_type not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "enable_policy_type failed");
  }
}

/** Disable a policy type on a root. */
export async function disablePolicyType(rootId: string, policyType: string): Promise<RootResult> {
  try {
    // TODO: implement disable_policy_type
    throw new Error("disable_policy_type not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disable_policy_type failed");
  }
}

/** List tags for an Organizations resource. */
export async function listTagsForResource(resourceId: string): Promise<Record<string, unknown>[]> {
  try {
    // TODO: implement list_tags_for_resource
    throw new Error("list_tags_for_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_tags_for_resource failed");
  }
}

/** Tag an Organizations resource. */
export async function tagResource(resourceId: string, tags: Record<string, unknown>[]): Promise<void> {
  try {
    // TODO: implement tag_resource
    throw new Error("tag_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "tag_resource failed");
  }
}

/** Cancel handshake. */
export async function cancelHandshake(handshakeId: string, regionName?: string): Promise<CancelHandshakeResult> {
  try {
    // TODO: implement cancel_handshake
    throw new Error("cancel_handshake not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "cancel_handshake failed");
  }
}

/** Close account. */
export async function closeAccount(accountId: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement close_account
    throw new Error("close_account not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "close_account failed");
  }
}

/** Create gov cloud account. */
export async function createGovCloudAccount(email: string, accountName: string): Promise<CreateGovCloudAccountResult> {
  try {
    // TODO: implement create_gov_cloud_account
    throw new Error("create_gov_cloud_account not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_gov_cloud_account failed");
  }
}

/** Decline handshake. */
export async function declineHandshake(handshakeId: string, regionName?: string): Promise<DeclineHandshakeResult> {
  try {
    // TODO: implement decline_handshake
    throw new Error("decline_handshake not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "decline_handshake failed");
  }
}

/** Delete organization. */
export async function deleteOrganization(regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_organization
    throw new Error("delete_organization not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_organization failed");
  }
}

/** Delete organizational unit. */
export async function deleteOrganizationalUnit(organizationalUnitId: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_organizational_unit
    throw new Error("delete_organizational_unit not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_organizational_unit failed");
  }
}

/** Delete resource policy. */
export async function deleteResourcePolicy(regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_resource_policy
    throw new Error("delete_resource_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_resource_policy failed");
  }
}

/** Deregister delegated administrator. */
export async function deregisterDelegatedAdministrator(accountId: string, servicePrincipal: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement deregister_delegated_administrator
    throw new Error("deregister_delegated_administrator not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "deregister_delegated_administrator failed");
  }
}

/** Describe create account status. */
export async function describeCreateAccountStatus(createAccountRequestId: string, regionName?: string): Promise<DescribeCreateAccountStatusResult> {
  try {
    // TODO: implement describe_create_account_status
    throw new Error("describe_create_account_status not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_create_account_status failed");
  }
}

/** Describe effective policy. */
export async function describeEffectivePolicy(policyType: string): Promise<DescribeEffectivePolicyResult> {
  try {
    // TODO: implement describe_effective_policy
    throw new Error("describe_effective_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_effective_policy failed");
  }
}

/** Describe handshake. */
export async function describeHandshake(handshakeId: string, regionName?: string): Promise<DescribeHandshakeResult> {
  try {
    // TODO: implement describe_handshake
    throw new Error("describe_handshake not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_handshake failed");
  }
}

/** Describe resource policy. */
export async function describeResourcePolicy(regionName?: string): Promise<DescribeResourcePolicyResult> {
  try {
    // TODO: implement describe_resource_policy
    throw new Error("describe_resource_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_resource_policy failed");
  }
}

/** Disable aws service access. */
export async function disableAwsServiceAccess(servicePrincipal: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement disable_aws_service_access
    throw new Error("disable_aws_service_access not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disable_aws_service_access failed");
  }
}

/** Enable all features. */
export async function enableAllFeatures(regionName?: string): Promise<EnableAllFeaturesResult> {
  try {
    // TODO: implement enable_all_features
    throw new Error("enable_all_features not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "enable_all_features failed");
  }
}

/** Enable aws service access. */
export async function enableAwsServiceAccess(servicePrincipal: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement enable_aws_service_access
    throw new Error("enable_aws_service_access not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "enable_aws_service_access failed");
  }
}

/** Leave organization. */
export async function leaveOrganization(regionName?: string): Promise<void> {
  try {
    // TODO: implement leave_organization
    throw new Error("leave_organization not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "leave_organization failed");
  }
}

/** List accounts with invalid effective policy. */
export async function listAccountsWithInvalidEffectivePolicy(policyType: string): Promise<ListAccountsWithInvalidEffectivePolicyResult> {
  try {
    // TODO: implement list_accounts_with_invalid_effective_policy
    throw new Error("list_accounts_with_invalid_effective_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_accounts_with_invalid_effective_policy failed");
  }
}

/** List aws service access for organization. */
export async function listAwsServiceAccessForOrganization(): Promise<ListAwsServiceAccessForOrganizationResult> {
  try {
    // TODO: implement list_aws_service_access_for_organization
    throw new Error("list_aws_service_access_for_organization not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_aws_service_access_for_organization failed");
  }
}

/** List create account status. */
export async function listCreateAccountStatus(): Promise<ListCreateAccountStatusResult> {
  try {
    // TODO: implement list_create_account_status
    throw new Error("list_create_account_status not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_create_account_status failed");
  }
}

/** List delegated administrators. */
export async function listDelegatedAdministrators(): Promise<ListDelegatedAdministratorsResult> {
  try {
    // TODO: implement list_delegated_administrators
    throw new Error("list_delegated_administrators not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_delegated_administrators failed");
  }
}

/** List delegated services for account. */
export async function listDelegatedServicesForAccount(accountId: string): Promise<ListDelegatedServicesForAccountResult> {
  try {
    // TODO: implement list_delegated_services_for_account
    throw new Error("list_delegated_services_for_account not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_delegated_services_for_account failed");
  }
}

/** List effective policy validation errors. */
export async function listEffectivePolicyValidationErrors(accountId: string, policyType: string): Promise<ListEffectivePolicyValidationErrorsResult> {
  try {
    // TODO: implement list_effective_policy_validation_errors
    throw new Error("list_effective_policy_validation_errors not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_effective_policy_validation_errors failed");
  }
}

/** List handshakes for account. */
export async function listHandshakesForAccount(): Promise<ListHandshakesForAccountResult> {
  try {
    // TODO: implement list_handshakes_for_account
    throw new Error("list_handshakes_for_account not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_handshakes_for_account failed");
  }
}

/** List handshakes for organization. */
export async function listHandshakesForOrganization(): Promise<ListHandshakesForOrganizationResult> {
  try {
    // TODO: implement list_handshakes_for_organization
    throw new Error("list_handshakes_for_organization not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_handshakes_for_organization failed");
  }
}

/** List policies for target. */
export async function listPoliciesForTarget(targetId: string, filter: string): Promise<ListPoliciesForTargetResult> {
  try {
    // TODO: implement list_policies_for_target
    throw new Error("list_policies_for_target not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_policies_for_target failed");
  }
}

/** List targets for policy. */
export async function listTargetsForPolicy(policyId: string): Promise<ListTargetsForPolicyResult> {
  try {
    // TODO: implement list_targets_for_policy
    throw new Error("list_targets_for_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_targets_for_policy failed");
  }
}

/** Put resource policy. */
export async function putResourcePolicy(content: string): Promise<PutResourcePolicyResult> {
  try {
    // TODO: implement put_resource_policy
    throw new Error("put_resource_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_resource_policy failed");
  }
}

/** Register delegated administrator. */
export async function registerDelegatedAdministrator(accountId: string, servicePrincipal: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement register_delegated_administrator
    throw new Error("register_delegated_administrator not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "register_delegated_administrator failed");
  }
}

/** Untag resource. */
export async function untagResource(resourceId: string, tagKeys: string[], regionName?: string): Promise<void> {
  try {
    // TODO: implement untag_resource
    throw new Error("untag_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "untag_resource failed");
  }
}

/** Update organizational unit. */
export async function updateOrganizationalUnit(organizationalUnitId: string): Promise<UpdateOrganizationalUnitResult> {
  try {
    // TODO: implement update_organizational_unit
    throw new Error("update_organizational_unit not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_organizational_unit failed");
  }
}
