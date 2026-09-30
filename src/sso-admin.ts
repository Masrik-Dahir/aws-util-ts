import { SsoAdminClient } from "@aws-sdk/client-sso-admin";
import { getClient } from "./client";
import { wrapAwsError } from "./exceptions";

/** Metadata for an IAM Identity Center instance. */
export type InstanceResult = {
  instanceArn?: string;
  identityStoreId?: string;
  name?: string;
  status?: string;
  ownerAccountId?: string;
  createdDate?: unknown;
  extra?: Record<string, unknown>;
};

/** Metadata for a permission set. */
export type PermissionSetResult = {
  permissionSetArn?: string;
  name?: string;
  description?: string;
  sessionDuration?: string;
  relayState?: string;
  createdDate?: unknown;
  extra?: Record<string, unknown>;
};

/** Metadata for a managed policy attached to a permission set. */
export type ManagedPolicyResult = {
  name?: string;
  arn?: string;
  extra?: Record<string, unknown>;
};

/** Metadata for an account assignment. */
export type AccountAssignmentResult = {
  accountId?: string;
  permissionSetArn?: string;
  principalType?: string;
  principalId?: string;
  extra?: Record<string, unknown>;
};

/** Status of a create/delete account assignment operation. */
export type AccountAssignmentStatusResult = {
  status?: string;
  requestId?: string;
  failureReason?: string;
  targetId?: string;
  targetType?: string;
  permissionSetArn?: string;
  principalType?: string;
  principalId?: string;
  createdDate?: unknown;
  extra?: Record<string, unknown>;
};

/** Status of a permission set provisioning operation. */
export type ProvisionStatusResult = {
  status?: string;
  requestId?: string;
  accountId?: string;
  permissionSetArn?: string;
  failureReason?: string;
  createdDate?: unknown;
  extra?: Record<string, unknown>;
};

/** Result of create_application. */
export type CreateApplicationResult = {
  applicationArn?: string;
};

/** Result of create_trusted_token_issuer. */
export type CreateTrustedTokenIssuerResult = {
  trustedTokenIssuerArn?: string;
};

/** Result of describe_account_assignment_creation_status. */
export type DescribeAccountAssignmentCreationStatusResult = {
  accountAssignmentCreationStatus?: Record<string, unknown>;
};

/** Result of describe_account_assignment_deletion_status. */
export type DescribeAccountAssignmentDeletionStatusResult = {
  accountAssignmentDeletionStatus?: Record<string, unknown>;
};

/** Result of describe_application. */
export type DescribeApplicationResult = {
  applicationArn?: string;
  applicationProviderArn?: string;
  name?: string;
  applicationAccount?: string;
  instanceArn?: string;
  status?: string;
  portalOptions?: Record<string, unknown>;
  description?: string;
  createdDate?: string;
};

/** Result of describe_application_assignment. */
export type DescribeApplicationAssignmentResult = {
  principalType?: string;
  principalId?: string;
  applicationArn?: string;
};

/** Result of describe_application_provider. */
export type DescribeApplicationProviderResult = {
  applicationProviderArn?: string;
  federationProtocol?: string;
  displayData?: Record<string, unknown>;
  resourceServerConfig?: Record<string, unknown>;
};

/** Result of describe_instance_access_control_attribute_configuration. */
export type DescribeInstanceAccessControlAttributeConfigurationResult = {
  status?: string;
  statusReason?: string;
  instanceAccessControlAttributeConfiguration?: Record<string, unknown>;
};

/** Result of describe_permission_set_provisioning_status. */
export type DescribePermissionSetProvisioningStatusResult = {
  permissionSetProvisioningStatus?: Record<string, unknown>;
};

/** Result of describe_trusted_token_issuer. */
export type DescribeTrustedTokenIssuerResult = {
  trustedTokenIssuerArn?: string;
  name?: string;
  trustedTokenIssuerType?: string;
  trustedTokenIssuerConfiguration?: Record<string, unknown>;
};

/** Result of get_application_access_scope. */
export type GetApplicationAccessScopeResult = {
  scope?: string;
  authorizedTargets?: string[];
};

/** Result of get_application_assignment_configuration. */
export type GetApplicationAssignmentConfigurationResult = {
  assignmentRequired?: boolean;
};

/** Result of get_application_authentication_method. */
export type GetApplicationAuthenticationMethodResult = {
  authenticationMethod?: Record<string, unknown>;
};

/** Result of get_application_grant. */
export type GetApplicationGrantResult = {
  grant?: Record<string, unknown>;
};

/** Result of get_application_session_configuration. */
export type GetApplicationSessionConfigurationResult = {
  userBackgroundSessionApplicationStatus?: string;
};

/** Result of get_permissions_boundary_for_permission_set. */
export type GetPermissionsBoundaryForPermissionSetResult = {
  permissionsBoundary?: Record<string, unknown>;
};

/** Result of list_account_assignment_creation_status. */
export type ListAccountAssignmentCreationStatusResult = {
  accountAssignmentsCreationStatus?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_account_assignment_deletion_status. */
export type ListAccountAssignmentDeletionStatusResult = {
  accountAssignmentsDeletionStatus?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_account_assignments_for_principal. */
export type ListAccountAssignmentsForPrincipalResult = {
  accountAssignments?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_application_access_scopes. */
export type ListApplicationAccessScopesResult = {
  scopes?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_application_assignments. */
export type ListApplicationAssignmentsResult = {
  applicationAssignments?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_application_assignments_for_principal. */
export type ListApplicationAssignmentsForPrincipalResult = {
  applicationAssignments?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_application_authentication_methods. */
export type ListApplicationAuthenticationMethodsResult = {
  authenticationMethods?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_application_grants. */
export type ListApplicationGrantsResult = {
  grants?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_application_providers. */
export type ListApplicationProvidersResult = {
  applicationProviders?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_applications. */
export type ListApplicationsResult = {
  applications?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_customer_managed_policy_references_in_permission_set. */
export type ListCustomerManagedPolicyReferencesInPermissionSetResult = {
  customerManagedPolicyReferences?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_permission_set_provisioning_status. */
export type ListPermissionSetProvisioningStatusResult = {
  permissionSetsProvisioningStatus?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_permission_sets_provisioned_to_account. */
export type ListPermissionSetsProvisionedToAccountResult = {
  nextToken?: string;
  permissionSets?: string[];
};

/** Result of list_tags_for_resource. */
export type ListTagsForResourceResult = {
  tags?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_trusted_token_issuers. */
export type ListTrustedTokenIssuersResult = {
  trustedTokenIssuers?: Record<string, unknown>[];
  nextToken?: string;
};

/** Create an IAM Identity Center instance. */
export async function createInstance(): Promise<InstanceResult> {
  try {
    // TODO: implement create_instance
    throw new Error("create_instance not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_instance failed");
  }
}

/** List all IAM Identity Center instances. */
export async function listInstances(): Promise<InstanceResult[]> {
  try {
    // TODO: implement list_instances
    throw new Error("list_instances not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_instances failed");
  }
}

/** Describe an IAM Identity Center instance. */
export async function describeInstance(instanceArn: string): Promise<InstanceResult> {
  try {
    // TODO: implement describe_instance
    throw new Error("describe_instance not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_instance failed");
  }
}

/** Delete an IAM Identity Center instance. */
export async function deleteInstance(instanceArn: string): Promise<void> {
  try {
    // TODO: implement delete_instance
    throw new Error("delete_instance not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_instance failed");
  }
}

/** Create a permission set. */
export async function createPermissionSet(instanceArn: string, name: string): Promise<PermissionSetResult> {
  try {
    // TODO: implement create_permission_set
    throw new Error("create_permission_set not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_permission_set failed");
  }
}

/** Describe a permission set. */
export async function describePermissionSet(instanceArn: string, permissionSetArn: string): Promise<PermissionSetResult> {
  try {
    // TODO: implement describe_permission_set
    throw new Error("describe_permission_set not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_permission_set failed");
  }
}

/** List permission set ARNs for an instance. */
export async function listPermissionSets(instanceArn: string): Promise<string[]> {
  try {
    // TODO: implement list_permission_sets
    throw new Error("list_permission_sets not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_permission_sets failed");
  }
}

/** Update an existing permission set. */
export async function updatePermissionSet(instanceArn: string, permissionSetArn: string): Promise<void> {
  try {
    // TODO: implement update_permission_set
    throw new Error("update_permission_set not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_permission_set failed");
  }
}

/** Delete a permission set. */
export async function deletePermissionSet(instanceArn: string, permissionSetArn: string): Promise<void> {
  try {
    // TODO: implement delete_permission_set
    throw new Error("delete_permission_set not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_permission_set failed");
  }
}

/** Attach an AWS managed policy to a permission set. */
export async function attachManagedPolicyToPermissionSet(instanceArn: string, permissionSetArn: string, managedPolicyArn: string): Promise<void> {
  try {
    // TODO: implement attach_managed_policy_to_permission_set
    throw new Error("attach_managed_policy_to_permission_set not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "attach_managed_policy_to_permission_set failed");
  }
}

/** Detach an AWS managed policy from a permission set. */
export async function detachManagedPolicyFromPermissionSet(instanceArn: string, permissionSetArn: string, managedPolicyArn: string): Promise<void> {
  try {
    // TODO: implement detach_managed_policy_from_permission_set
    throw new Error("detach_managed_policy_from_permission_set not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "detach_managed_policy_from_permission_set failed");
  }
}

/** List managed policies attached to a permission set. */
export async function listManagedPoliciesInPermissionSet(instanceArn: string, permissionSetArn: string): Promise<ManagedPolicyResult[]> {
  try {
    // TODO: implement list_managed_policies_in_permission_set
    throw new Error("list_managed_policies_in_permission_set not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_managed_policies_in_permission_set failed");
  }
}

/** Put an inline policy on a permission set. */
export async function putInlinePolicyToPermissionSet(instanceArn: string, permissionSetArn: string, inlinePolicy: string): Promise<void> {
  try {
    // TODO: implement put_inline_policy_to_permission_set
    throw new Error("put_inline_policy_to_permission_set not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_inline_policy_to_permission_set failed");
  }
}

/** Get the inline policy for a permission set. */
export async function getInlinePolicyForPermissionSet(instanceArn: string, permissionSetArn: string): Promise<string> {
  try {
    // TODO: implement get_inline_policy_for_permission_set
    throw new Error("get_inline_policy_for_permission_set not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_inline_policy_for_permission_set failed");
  }
}

/** Delete the inline policy from a permission set. */
export async function deleteInlinePolicyFromPermissionSet(instanceArn: string, permissionSetArn: string): Promise<void> {
  try {
    // TODO: implement delete_inline_policy_from_permission_set
    throw new Error("delete_inline_policy_from_permission_set not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_inline_policy_from_permission_set failed");
  }
}

/** Create an account assignment. */
export async function createAccountAssignment(instanceArn: string, targetId: string, targetType: string, permissionSetArn: string, principalType: string, principalId: string): Promise<AccountAssignmentStatusResult> {
  try {
    // TODO: implement create_account_assignment
    throw new Error("create_account_assignment not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_account_assignment failed");
  }
}

/** List account assignments for a permission set and account. */
export async function listAccountAssignments(instanceArn: string, accountId: string, permissionSetArn: string): Promise<AccountAssignmentResult[]> {
  try {
    // TODO: implement list_account_assignments
    throw new Error("list_account_assignments not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_account_assignments failed");
  }
}

/** Delete an account assignment. */
export async function deleteAccountAssignment(instanceArn: string, targetId: string, targetType: string, permissionSetArn: string, principalType: string, principalId: string): Promise<AccountAssignmentStatusResult> {
  try {
    // TODO: implement delete_account_assignment
    throw new Error("delete_account_assignment not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_account_assignment failed");
  }
}

/** List account IDs for a provisioned permission set. */
export async function listAccountsForProvisionedPermissionSet(instanceArn: string, permissionSetArn: string): Promise<string[]> {
  try {
    // TODO: implement list_accounts_for_provisioned_permission_set
    throw new Error("list_accounts_for_provisioned_permission_set not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_accounts_for_provisioned_permission_set failed");
  }
}

/** Provision a permission set to accounts. */
export async function provisionPermissionSet(instanceArn: string, permissionSetArn: string, targetType: string): Promise<ProvisionStatusResult> {
  try {
    // TODO: implement provision_permission_set
    throw new Error("provision_permission_set not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "provision_permission_set failed");
  }
}

/** Attach customer managed policy reference to permission set. */
export async function attachCustomerManagedPolicyReferenceToPermissionSet(instanceArn: string, permissionSetArn: string, customerManagedPolicyReference: Record<string, unknown>, regionName?: string): Promise<void> {
  try {
    // TODO: implement attach_customer_managed_policy_reference_to_permission_set
    throw new Error("attach_customer_managed_policy_reference_to_permission_set not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "attach_customer_managed_policy_reference_to_permission_set failed");
  }
}

/** Create application. */
export async function createApplication(instanceArn: string, applicationProviderArn: string, name: string): Promise<CreateApplicationResult> {
  try {
    // TODO: implement create_application
    throw new Error("create_application not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_application failed");
  }
}

/** Create application assignment. */
export async function createApplicationAssignment(applicationArn: string, principalId: string, principalType: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement create_application_assignment
    throw new Error("create_application_assignment not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_application_assignment failed");
  }
}

/** Create instance access control attribute configuration. */
export async function createInstanceAccessControlAttributeConfiguration(instanceArn: string, instanceAccessControlAttributeConfiguration: Record<string, unknown>, regionName?: string): Promise<void> {
  try {
    // TODO: implement create_instance_access_control_attribute_configuration
    throw new Error("create_instance_access_control_attribute_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_instance_access_control_attribute_configuration failed");
  }
}

/** Create trusted token issuer. */
export async function createTrustedTokenIssuer(instanceArn: string, name: string, trustedTokenIssuerType: string, trustedTokenIssuerConfiguration: Record<string, unknown>): Promise<CreateTrustedTokenIssuerResult> {
  try {
    // TODO: implement create_trusted_token_issuer
    throw new Error("create_trusted_token_issuer not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_trusted_token_issuer failed");
  }
}

/** Delete application. */
export async function deleteApplication(applicationArn: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_application
    throw new Error("delete_application not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_application failed");
  }
}

/** Delete application access scope. */
export async function deleteApplicationAccessScope(applicationArn: string, scope: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_application_access_scope
    throw new Error("delete_application_access_scope not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_application_access_scope failed");
  }
}

/** Delete application assignment. */
export async function deleteApplicationAssignment(applicationArn: string, principalId: string, principalType: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_application_assignment
    throw new Error("delete_application_assignment not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_application_assignment failed");
  }
}

/** Delete application authentication method. */
export async function deleteApplicationAuthenticationMethod(applicationArn: string, authenticationMethodType: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_application_authentication_method
    throw new Error("delete_application_authentication_method not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_application_authentication_method failed");
  }
}

/** Delete application grant. */
export async function deleteApplicationGrant(applicationArn: string, grantType: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_application_grant
    throw new Error("delete_application_grant not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_application_grant failed");
  }
}

/** Delete instance access control attribute configuration. */
export async function deleteInstanceAccessControlAttributeConfiguration(instanceArn: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_instance_access_control_attribute_configuration
    throw new Error("delete_instance_access_control_attribute_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_instance_access_control_attribute_configuration failed");
  }
}

/** Delete permissions boundary from permission set. */
export async function deletePermissionsBoundaryFromPermissionSet(instanceArn: string, permissionSetArn: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_permissions_boundary_from_permission_set
    throw new Error("delete_permissions_boundary_from_permission_set not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_permissions_boundary_from_permission_set failed");
  }
}

/** Delete trusted token issuer. */
export async function deleteTrustedTokenIssuer(trustedTokenIssuerArn: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_trusted_token_issuer
    throw new Error("delete_trusted_token_issuer not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_trusted_token_issuer failed");
  }
}

/** Describe account assignment creation status. */
export async function describeAccountAssignmentCreationStatus(instanceArn: string, accountAssignmentCreationRequestId: string, regionName?: string): Promise<DescribeAccountAssignmentCreationStatusResult> {
  try {
    // TODO: implement describe_account_assignment_creation_status
    throw new Error("describe_account_assignment_creation_status not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_account_assignment_creation_status failed");
  }
}

/** Describe account assignment deletion status. */
export async function describeAccountAssignmentDeletionStatus(instanceArn: string, accountAssignmentDeletionRequestId: string, regionName?: string): Promise<DescribeAccountAssignmentDeletionStatusResult> {
  try {
    // TODO: implement describe_account_assignment_deletion_status
    throw new Error("describe_account_assignment_deletion_status not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_account_assignment_deletion_status failed");
  }
}

/** Describe application. */
export async function describeApplication(applicationArn: string, regionName?: string): Promise<DescribeApplicationResult> {
  try {
    // TODO: implement describe_application
    throw new Error("describe_application not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_application failed");
  }
}

/** Describe application assignment. */
export async function describeApplicationAssignment(applicationArn: string, principalId: string, principalType: string, regionName?: string): Promise<DescribeApplicationAssignmentResult> {
  try {
    // TODO: implement describe_application_assignment
    throw new Error("describe_application_assignment not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_application_assignment failed");
  }
}

/** Describe application provider. */
export async function describeApplicationProvider(applicationProviderArn: string, regionName?: string): Promise<DescribeApplicationProviderResult> {
  try {
    // TODO: implement describe_application_provider
    throw new Error("describe_application_provider not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_application_provider failed");
  }
}

/** Describe instance access control attribute configuration. */
export async function describeInstanceAccessControlAttributeConfiguration(instanceArn: string, regionName?: string): Promise<DescribeInstanceAccessControlAttributeConfigurationResult> {
  try {
    // TODO: implement describe_instance_access_control_attribute_configuration
    throw new Error("describe_instance_access_control_attribute_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_instance_access_control_attribute_configuration failed");
  }
}

/** Describe permission set provisioning status. */
export async function describePermissionSetProvisioningStatus(instanceArn: string, provisionPermissionSetRequestId: string, regionName?: string): Promise<DescribePermissionSetProvisioningStatusResult> {
  try {
    // TODO: implement describe_permission_set_provisioning_status
    throw new Error("describe_permission_set_provisioning_status not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_permission_set_provisioning_status failed");
  }
}

/** Describe trusted token issuer. */
export async function describeTrustedTokenIssuer(trustedTokenIssuerArn: string, regionName?: string): Promise<DescribeTrustedTokenIssuerResult> {
  try {
    // TODO: implement describe_trusted_token_issuer
    throw new Error("describe_trusted_token_issuer not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_trusted_token_issuer failed");
  }
}

/** Detach customer managed policy reference from permission set. */
export async function detachCustomerManagedPolicyReferenceFromPermissionSet(instanceArn: string, permissionSetArn: string, customerManagedPolicyReference: Record<string, unknown>, regionName?: string): Promise<void> {
  try {
    // TODO: implement detach_customer_managed_policy_reference_from_permission_set
    throw new Error("detach_customer_managed_policy_reference_from_permission_set not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "detach_customer_managed_policy_reference_from_permission_set failed");
  }
}

/** Get application access scope. */
export async function getApplicationAccessScope(applicationArn: string, scope: string, regionName?: string): Promise<GetApplicationAccessScopeResult> {
  try {
    // TODO: implement get_application_access_scope
    throw new Error("get_application_access_scope not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_application_access_scope failed");
  }
}

/** Get application assignment configuration. */
export async function getApplicationAssignmentConfiguration(applicationArn: string, regionName?: string): Promise<GetApplicationAssignmentConfigurationResult> {
  try {
    // TODO: implement get_application_assignment_configuration
    throw new Error("get_application_assignment_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_application_assignment_configuration failed");
  }
}

/** Get application authentication method. */
export async function getApplicationAuthenticationMethod(applicationArn: string, authenticationMethodType: string, regionName?: string): Promise<GetApplicationAuthenticationMethodResult> {
  try {
    // TODO: implement get_application_authentication_method
    throw new Error("get_application_authentication_method not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_application_authentication_method failed");
  }
}

/** Get application grant. */
export async function getApplicationGrant(applicationArn: string, grantType: string, regionName?: string): Promise<GetApplicationGrantResult> {
  try {
    // TODO: implement get_application_grant
    throw new Error("get_application_grant not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_application_grant failed");
  }
}

/** Get application session configuration. */
export async function getApplicationSessionConfiguration(applicationArn: string, regionName?: string): Promise<GetApplicationSessionConfigurationResult> {
  try {
    // TODO: implement get_application_session_configuration
    throw new Error("get_application_session_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_application_session_configuration failed");
  }
}

/** Get permissions boundary for permission set. */
export async function getPermissionsBoundaryForPermissionSet(instanceArn: string, permissionSetArn: string, regionName?: string): Promise<GetPermissionsBoundaryForPermissionSetResult> {
  try {
    // TODO: implement get_permissions_boundary_for_permission_set
    throw new Error("get_permissions_boundary_for_permission_set not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_permissions_boundary_for_permission_set failed");
  }
}

/** List account assignment creation status. */
export async function listAccountAssignmentCreationStatus(instanceArn: string): Promise<ListAccountAssignmentCreationStatusResult> {
  try {
    // TODO: implement list_account_assignment_creation_status
    throw new Error("list_account_assignment_creation_status not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_account_assignment_creation_status failed");
  }
}

/** List account assignment deletion status. */
export async function listAccountAssignmentDeletionStatus(instanceArn: string): Promise<ListAccountAssignmentDeletionStatusResult> {
  try {
    // TODO: implement list_account_assignment_deletion_status
    throw new Error("list_account_assignment_deletion_status not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_account_assignment_deletion_status failed");
  }
}

/** List account assignments for principal. */
export async function listAccountAssignmentsForPrincipal(instanceArn: string, principalId: string, principalType: string): Promise<ListAccountAssignmentsForPrincipalResult> {
  try {
    // TODO: implement list_account_assignments_for_principal
    throw new Error("list_account_assignments_for_principal not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_account_assignments_for_principal failed");
  }
}

/** List application access scopes. */
export async function listApplicationAccessScopes(applicationArn: string): Promise<ListApplicationAccessScopesResult> {
  try {
    // TODO: implement list_application_access_scopes
    throw new Error("list_application_access_scopes not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_application_access_scopes failed");
  }
}

/** List application assignments. */
export async function listApplicationAssignments(applicationArn: string): Promise<ListApplicationAssignmentsResult> {
  try {
    // TODO: implement list_application_assignments
    throw new Error("list_application_assignments not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_application_assignments failed");
  }
}

/** List application assignments for principal. */
export async function listApplicationAssignmentsForPrincipal(instanceArn: string, principalId: string, principalType: string): Promise<ListApplicationAssignmentsForPrincipalResult> {
  try {
    // TODO: implement list_application_assignments_for_principal
    throw new Error("list_application_assignments_for_principal not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_application_assignments_for_principal failed");
  }
}

/** List application authentication methods. */
export async function listApplicationAuthenticationMethods(applicationArn: string): Promise<ListApplicationAuthenticationMethodsResult> {
  try {
    // TODO: implement list_application_authentication_methods
    throw new Error("list_application_authentication_methods not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_application_authentication_methods failed");
  }
}

/** List application grants. */
export async function listApplicationGrants(applicationArn: string): Promise<ListApplicationGrantsResult> {
  try {
    // TODO: implement list_application_grants
    throw new Error("list_application_grants not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_application_grants failed");
  }
}

/** List application providers. */
export async function listApplicationProviders(): Promise<ListApplicationProvidersResult> {
  try {
    // TODO: implement list_application_providers
    throw new Error("list_application_providers not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_application_providers failed");
  }
}

/** List applications. */
export async function listApplications(instanceArn: string): Promise<ListApplicationsResult> {
  try {
    // TODO: implement list_applications
    throw new Error("list_applications not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_applications failed");
  }
}

/** List customer managed policy references in permission set. */
export async function listCustomerManagedPolicyReferencesInPermissionSet(instanceArn: string, permissionSetArn: string): Promise<ListCustomerManagedPolicyReferencesInPermissionSetResult> {
  try {
    // TODO: implement list_customer_managed_policy_references_in_permission_set
    throw new Error("list_customer_managed_policy_references_in_permission_set not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_customer_managed_policy_references_in_permission_set failed");
  }
}

/** List permission set provisioning status. */
export async function listPermissionSetProvisioningStatus(instanceArn: string): Promise<ListPermissionSetProvisioningStatusResult> {
  try {
    // TODO: implement list_permission_set_provisioning_status
    throw new Error("list_permission_set_provisioning_status not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_permission_set_provisioning_status failed");
  }
}

/** List permission sets provisioned to account. */
export async function listPermissionSetsProvisionedToAccount(instanceArn: string, accountId: string): Promise<ListPermissionSetsProvisionedToAccountResult> {
  try {
    // TODO: implement list_permission_sets_provisioned_to_account
    throw new Error("list_permission_sets_provisioned_to_account not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_permission_sets_provisioned_to_account failed");
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

/** List trusted token issuers. */
export async function listTrustedTokenIssuers(instanceArn: string): Promise<ListTrustedTokenIssuersResult> {
  try {
    // TODO: implement list_trusted_token_issuers
    throw new Error("list_trusted_token_issuers not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_trusted_token_issuers failed");
  }
}

/** Put application access scope. */
export async function putApplicationAccessScope(scope: string, applicationArn: string): Promise<void> {
  try {
    // TODO: implement put_application_access_scope
    throw new Error("put_application_access_scope not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_application_access_scope failed");
  }
}

/** Put application assignment configuration. */
export async function putApplicationAssignmentConfiguration(applicationArn: string, assignmentRequired: boolean, regionName?: string): Promise<void> {
  try {
    // TODO: implement put_application_assignment_configuration
    throw new Error("put_application_assignment_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_application_assignment_configuration failed");
  }
}

/** Put application authentication method. */
export async function putApplicationAuthenticationMethod(applicationArn: string, authenticationMethodType: string, authenticationMethod: Record<string, unknown>, regionName?: string): Promise<void> {
  try {
    // TODO: implement put_application_authentication_method
    throw new Error("put_application_authentication_method not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_application_authentication_method failed");
  }
}

/** Put application grant. */
export async function putApplicationGrant(applicationArn: string, grantType: string, grant: Record<string, unknown>, regionName?: string): Promise<void> {
  try {
    // TODO: implement put_application_grant
    throw new Error("put_application_grant not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_application_grant failed");
  }
}

/** Put application session configuration. */
export async function putApplicationSessionConfiguration(applicationArn: string): Promise<void> {
  try {
    // TODO: implement put_application_session_configuration
    throw new Error("put_application_session_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_application_session_configuration failed");
  }
}

/** Put permissions boundary to permission set. */
export async function putPermissionsBoundaryToPermissionSet(instanceArn: string, permissionSetArn: string, permissionsBoundary: Record<string, unknown>, regionName?: string): Promise<void> {
  try {
    // TODO: implement put_permissions_boundary_to_permission_set
    throw new Error("put_permissions_boundary_to_permission_set not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_permissions_boundary_to_permission_set failed");
  }
}

/** Tag resource. */
export async function tagResource(resourceArn: string, tags: Record<string, unknown>[]): Promise<void> {
  try {
    // TODO: implement tag_resource
    throw new Error("tag_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "tag_resource failed");
  }
}

/** Untag resource. */
export async function untagResource(resourceArn: string, tagKeys: string[]): Promise<void> {
  try {
    // TODO: implement untag_resource
    throw new Error("untag_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "untag_resource failed");
  }
}

/** Update application. */
export async function updateApplication(applicationArn: string): Promise<void> {
  try {
    // TODO: implement update_application
    throw new Error("update_application not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_application failed");
  }
}

/** Update instance. */
export async function updateInstance(instanceArn: string): Promise<void> {
  try {
    // TODO: implement update_instance
    throw new Error("update_instance not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_instance failed");
  }
}

/** Update instance access control attribute configuration. */
export async function updateInstanceAccessControlAttributeConfiguration(instanceArn: string, instanceAccessControlAttributeConfiguration: Record<string, unknown>, regionName?: string): Promise<void> {
  try {
    // TODO: implement update_instance_access_control_attribute_configuration
    throw new Error("update_instance_access_control_attribute_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_instance_access_control_attribute_configuration failed");
  }
}

/** Update trusted token issuer. */
export async function updateTrustedTokenIssuer(trustedTokenIssuerArn: string): Promise<void> {
  try {
    // TODO: implement update_trusted_token_issuer
    throw new Error("update_trusted_token_issuer not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_trusted_token_issuer failed");
  }
}
