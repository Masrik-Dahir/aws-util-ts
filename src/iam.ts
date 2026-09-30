/**
 * aws-util/iam — High-level AWS IAM utilities.
 *
 * Provides typed, ergonomic wrappers around the AWS SDK v3 IAM client for
 * common operations: role and policy CRUD, user listing, and convenience
 * helpers for creating roles with attached policies.
 *
 * All functions obtain an IAMClient via {@link getClient} and wrap errors
 * through {@link wrapAwsError}.
 *
 * @module
 */

import { z } from "zod";
import {
  IAMClient,
  CreateRoleCommand,
  GetRoleCommand,
  DeleteRoleCommand,
  ListRolesCommand,
  AttachRolePolicyCommand,
  DetachRolePolicyCommand,
  CreatePolicyCommand,
  DeletePolicyCommand,
  ListPoliciesCommand,
  ListUsersCommand,
  ListAttachedRolePoliciesCommand,
} from "@aws-sdk/client-iam";
import { getClient } from "./client.js";
import { wrapAwsError, AwsNotFoundError } from "./exceptions.js";

// ---------------------------------------------------------------------------
// Zod schemas & inferred types
// ---------------------------------------------------------------------------

/** Schema for an IAM role. */
export const IAMRoleSchema = z.object({
  roleName: z.string(),
  roleId: z.string(),
  arn: z.string(),
  path: z.string().optional(),
  createDate: z.date().optional(),
  assumeRolePolicyDocument: z.string().optional(),
});
/** An IAM role. */
export type IAMRole = z.infer<typeof IAMRoleSchema>;

/** Schema for an IAM policy. */
export const IAMPolicySchema = z.object({
  policyName: z.string(),
  policyId: z.string(),
  arn: z.string(),
  path: z.string().optional(),
  createDate: z.date().optional(),
  description: z.string().optional(),
});
/** An IAM policy. */
export type IAMPolicy = z.infer<typeof IAMPolicySchema>;

/** Schema for an IAM user. */
export const IAMUserSchema = z.object({
  userName: z.string(),
  userId: z.string(),
  arn: z.string(),
  path: z.string().optional(),
  createDate: z.date().optional(),
});
/** An IAM user. */
export type IAMUser = z.infer<typeof IAMUserSchema>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Get a cached IAMClient for the given region.
 */
function iam(region?: string): IAMClient {
  return getClient(IAMClient, region);
}

/**
 * Normalize a policy document to a JSON string.
 *
 * Accepts either a pre-serialized JSON string or a plain object.
 */
function normalizePolicyDocument(doc: string | object): string {
  return typeof doc === "string" ? doc : JSON.stringify(doc);
}

// ---------------------------------------------------------------------------
// Role operations
// ---------------------------------------------------------------------------

/**
 * Create an IAM role.
 *
 * @param roleName - Name of the role to create.
 * @param assumeRolePolicyDocument - Trust policy as a JSON string or object.
 * @param description - Optional human-readable description.
 * @param path - Optional IAM path (default `"/"`).
 * @param region - AWS region override.
 * @returns The newly created {@link IAMRole}.
 */
export async function createRole(
  roleName: string,
  assumeRolePolicyDocument: string | object,
  description?: string,
  path?: string,
  region?: string,
): Promise<IAMRole> {
  try {
    const resp = await iam(region).send(
      new CreateRoleCommand({
        RoleName: roleName,
        AssumeRolePolicyDocument: normalizePolicyDocument(
          assumeRolePolicyDocument,
        ),
        ...(description ? { Description: description } : {}),
        ...(path ? { Path: path } : {}),
      }),
    );
    const role = resp.Role;
    if (!role) {
      throw new Error("CreateRole returned no Role");
    }
    return IAMRoleSchema.parse({
      roleName: role.RoleName ?? roleName,
      roleId: role.RoleId ?? "",
      arn: role.Arn ?? "",
      path: role.Path,
      createDate: role.CreateDate,
      assumeRolePolicyDocument: role.AssumeRolePolicyDocument
        ? decodeURIComponent(role.AssumeRolePolicyDocument)
        : undefined,
    });
  } catch (err) {
    throw wrapAwsError(err, `createRole(${roleName})`);
  }
}

/**
 * Retrieve an IAM role by name.
 *
 * Returns `null` if the role does not exist rather than throwing.
 *
 * @param roleName - Name of the role to retrieve.
 * @param region - AWS region override.
 * @returns The {@link IAMRole}, or `null` if not found.
 */
export async function getRole(
  roleName: string,
  region?: string,
): Promise<IAMRole | null> {
  try {
    const resp = await iam(region).send(
      new GetRoleCommand({ RoleName: roleName }),
    );
    const role = resp.Role;
    if (!role) {
      return null;
    }
    return IAMRoleSchema.parse({
      roleName: role.RoleName ?? roleName,
      roleId: role.RoleId ?? "",
      arn: role.Arn ?? "",
      path: role.Path,
      createDate: role.CreateDate,
      assumeRolePolicyDocument: role.AssumeRolePolicyDocument
        ? decodeURIComponent(role.AssumeRolePolicyDocument)
        : undefined,
    });
  } catch (err) {
    const wrapped = wrapAwsError(err, `getRole(${roleName})`);
    if (wrapped instanceof AwsNotFoundError) {
      return null;
    }
    throw wrapped;
  }
}

/**
 * Delete an IAM role.
 *
 * @param roleName - Name of the role to delete.
 * @param region - AWS region override.
 */
export async function deleteRole(
  roleName: string,
  region?: string,
): Promise<void> {
  try {
    await iam(region).send(
      new DeleteRoleCommand({ RoleName: roleName }),
    );
  } catch (err) {
    throw wrapAwsError(err, `deleteRole(${roleName})`);
  }
}

/**
 * List IAM roles, auto-paginating through all pages.
 *
 * @param pathPrefix - Optional path prefix to filter by.
 * @param region - AWS region override.
 * @returns An array of {@link IAMRole} entries.
 */
export async function listRoles(
  pathPrefix?: string,
  region?: string,
): Promise<IAMRole[]> {
  const results: IAMRole[] = [];
  let marker: string | undefined;

  try {
    do {
      const resp = await iam(region).send(
        new ListRolesCommand({
          ...(pathPrefix ? { PathPrefix: pathPrefix } : {}),
          ...(marker ? { Marker: marker } : {}),
        }),
      );
      for (const role of resp.Roles ?? []) {
        results.push(
          IAMRoleSchema.parse({
            roleName: role.RoleName ?? "",
            roleId: role.RoleId ?? "",
            arn: role.Arn ?? "",
            path: role.Path,
            createDate: role.CreateDate,
            assumeRolePolicyDocument:
              role.AssumeRolePolicyDocument
                ? decodeURIComponent(role.AssumeRolePolicyDocument)
                : undefined,
          }),
        );
      }
      marker = resp.IsTruncated ? resp.Marker : undefined;
    } while (marker);
  } catch (err) {
    throw wrapAwsError(err, "listRoles");
  }

  return results;
}

// ---------------------------------------------------------------------------
// Role-policy attachment
// ---------------------------------------------------------------------------

/**
 * Attach a managed policy to an IAM role.
 *
 * @param roleName - Name of the role.
 * @param policyArn - ARN of the managed policy to attach.
 * @param region - AWS region override.
 */
export async function attachRolePolicy(
  roleName: string,
  policyArn: string,
  region?: string,
): Promise<void> {
  try {
    await iam(region).send(
      new AttachRolePolicyCommand({
        RoleName: roleName,
        PolicyArn: policyArn,
      }),
    );
  } catch (err) {
    throw wrapAwsError(
      err,
      `attachRolePolicy(${roleName}, ${policyArn})`,
    );
  }
}

/**
 * Detach a managed policy from an IAM role.
 *
 * @param roleName - Name of the role.
 * @param policyArn - ARN of the managed policy to detach.
 * @param region - AWS region override.
 */
export async function detachRolePolicy(
  roleName: string,
  policyArn: string,
  region?: string,
): Promise<void> {
  try {
    await iam(region).send(
      new DetachRolePolicyCommand({
        RoleName: roleName,
        PolicyArn: policyArn,
      }),
    );
  } catch (err) {
    throw wrapAwsError(
      err,
      `detachRolePolicy(${roleName}, ${policyArn})`,
    );
  }
}

// ---------------------------------------------------------------------------
// Policy operations
// ---------------------------------------------------------------------------

/**
 * Create an IAM managed policy.
 *
 * @param policyName - Name of the policy to create.
 * @param policyDocument - Policy document as a JSON string or object.
 * @param description - Optional human-readable description.
 * @param path - Optional IAM path (default `"/"`).
 * @param region - AWS region override.
 * @returns The newly created {@link IAMPolicy}.
 */
export async function createPolicy(
  policyName: string,
  policyDocument: string | object,
  description?: string,
  path?: string,
  region?: string,
): Promise<IAMPolicy> {
  try {
    const resp = await iam(region).send(
      new CreatePolicyCommand({
        PolicyName: policyName,
        PolicyDocument: normalizePolicyDocument(policyDocument),
        ...(description ? { Description: description } : {}),
        ...(path ? { Path: path } : {}),
      }),
    );
    const policy = resp.Policy;
    if (!policy) {
      throw new Error("CreatePolicy returned no Policy");
    }
    return IAMPolicySchema.parse({
      policyName: policy.PolicyName ?? policyName,
      policyId: policy.PolicyId ?? "",
      arn: policy.Arn ?? "",
      path: policy.Path,
      createDate: policy.CreateDate,
      description: policy.Description,
    });
  } catch (err) {
    throw wrapAwsError(err, `createPolicy(${policyName})`);
  }
}

/**
 * Delete an IAM managed policy by ARN.
 *
 * @param policyArn - ARN of the policy to delete.
 * @param region - AWS region override.
 */
export async function deletePolicy(
  policyArn: string,
  region?: string,
): Promise<void> {
  try {
    await iam(region).send(
      new DeletePolicyCommand({ PolicyArn: policyArn }),
    );
  } catch (err) {
    throw wrapAwsError(err, `deletePolicy(${policyArn})`);
  }
}

/**
 * List IAM managed policies, auto-paginating through all pages.
 *
 * @param scope - Policy scope: `"All"`, `"AWS"`, or `"Local"` (default `"All"`).
 * @param pathPrefix - Optional path prefix to filter by.
 * @param region - AWS region override.
 * @returns An array of {@link IAMPolicy} entries.
 */
export async function listPolicies(
  scope?: "All" | "AWS" | "Local",
  pathPrefix?: string,
  region?: string,
): Promise<IAMPolicy[]> {
  const results: IAMPolicy[] = [];
  let marker: string | undefined;

  try {
    do {
      const resp = await iam(region).send(
        new ListPoliciesCommand({
          Scope: scope ?? "All",
          ...(pathPrefix ? { PathPrefix: pathPrefix } : {}),
          ...(marker ? { Marker: marker } : {}),
        }),
      );
      for (const policy of resp.Policies ?? []) {
        results.push(
          IAMPolicySchema.parse({
            policyName: policy.PolicyName ?? "",
            policyId: policy.PolicyId ?? "",
            arn: policy.Arn ?? "",
            path: policy.Path,
            createDate: policy.CreateDate,
            description: policy.Description,
          }),
        );
      }
      marker = resp.IsTruncated ? resp.Marker : undefined;
    } while (marker);
  } catch (err) {
    throw wrapAwsError(err, "listPolicies");
  }

  return results;
}

// ---------------------------------------------------------------------------
// User operations
// ---------------------------------------------------------------------------

/**
 * List IAM users, auto-paginating through all pages.
 *
 * @param pathPrefix - Optional path prefix to filter by.
 * @param region - AWS region override.
 * @returns An array of {@link IAMUser} entries.
 */
export async function listUsers(
  pathPrefix?: string,
  region?: string,
): Promise<IAMUser[]> {
  const results: IAMUser[] = [];
  let marker: string | undefined;

  try {
    do {
      const resp = await iam(region).send(
        new ListUsersCommand({
          ...(pathPrefix ? { PathPrefix: pathPrefix } : {}),
          ...(marker ? { Marker: marker } : {}),
        }),
      );
      for (const user of resp.Users ?? []) {
        results.push(
          IAMUserSchema.parse({
            userName: user.UserName ?? "",
            userId: user.UserId ?? "",
            arn: user.Arn ?? "",
            path: user.Path,
            createDate: user.CreateDate,
          }),
        );
      }
      marker = resp.IsTruncated ? resp.Marker : undefined;
    } while (marker);
  } catch (err) {
    throw wrapAwsError(err, "listUsers");
  }

  return results;
}

// ---------------------------------------------------------------------------
// Compound operations
// ---------------------------------------------------------------------------

/**
 * Create an IAM role and attach one or more managed policies.
 *
 * The role is created first, then each policy ARN is attached sequentially.
 * If any attachment fails, the role will still exist (caller should clean up).
 *
 * @param roleName - Name of the role to create.
 * @param assumeRolePolicyDocument - Trust policy as a JSON string or object.
 * @param policyArns - Array of managed policy ARNs to attach.
 * @param description - Optional human-readable description.
 * @param region - AWS region override.
 * @returns The newly created {@link IAMRole}.
 */
export async function createRoleWithPolicies(
  roleName: string,
  assumeRolePolicyDocument: string | object,
  policyArns: string[],
  description?: string,
  region?: string,
): Promise<IAMRole> {
  const role = await createRole(
    roleName,
    assumeRolePolicyDocument,
    description,
    undefined,
    region,
  );

  for (const policyArn of policyArns) {
    await attachRolePolicy(roleName, policyArn, region);
  }

  return role;
}

/**
 * Ensure an IAM role exists with the specified policies attached.
 *
 * If the role already exists it is returned as-is; otherwise it is created.
 * When `policyArns` is provided, each policy is attached (idempotent — attaching
 * an already-attached policy is a no-op in IAM).
 *
 * @param roleName - Name of the role.
 * @param assumeRolePolicyDocument - Trust policy as a JSON string or object.
 * @param policyArns - Optional array of managed policy ARNs to attach.
 * @param description - Optional human-readable description (used only on creation).
 * @param region - AWS region override.
 * @returns The existing or newly created {@link IAMRole}.
 */
export async function ensureRole(
  roleName: string,
  assumeRolePolicyDocument: string | object,
  policyArns?: string[],
  description?: string,
  region?: string,
): Promise<IAMRole> {
  let role = await getRole(roleName, region);

  if (!role) {
    role = await createRole(
      roleName,
      assumeRolePolicyDocument,
      description,
      undefined,
      region,
    );
  }

  if (policyArns && policyArns.length > 0) {
    // Fetch currently attached policies to avoid redundant calls
    try {
      const attached = await iam(region).send(
        new ListAttachedRolePoliciesCommand({
          RoleName: roleName,
        }),
      );
      const attachedArns = new Set(
        (attached.AttachedPolicies ?? []).map((p) => p.PolicyArn ?? ""),
      );
      for (const policyArn of policyArns) {
        if (!attachedArns.has(policyArn)) {
          await attachRolePolicy(roleName, policyArn, region);
        }
      }
    } catch (err) {
      throw wrapAwsError(
        err,
        `ensureRole(${roleName}) policy attachment`,
      );
    }
  }

  return role;
}

// ---------------------------------------------------------------------------
// Additional types (auto-generated)
// ---------------------------------------------------------------------------

/** Result of create_access_key. */
export type CreateAccessKeyResult = {
  accessKey?: Record<string, unknown>;
};

/** Result of create_delegation_request. */
export type CreateDelegationRequestResult = {
  consoleDeepLink?: string | undefined;
  delegationRequestId?: string | undefined;
};

/** Result of create_group. */
export type CreateGroupResult = {
  group?: Record<string, unknown>;
};

/** Result of create_instance_profile. */
export type CreateInstanceProfileResult = {
  instanceProfile?: Record<string, unknown>;
};

/** Result of create_login_profile. */
export type CreateLoginProfileResult = {
  loginProfile?: Record<string, unknown>;
};

/** Result of create_open_id_connect_provider. */
export type CreateOpenIdConnectProviderResult = {
  openIdConnectProviderArn?: string | undefined;
  tags?: Record<string, unknown>[];
};

/** Result of create_policy_version. */
export type CreatePolicyVersionResult = {
  policyVersion?: Record<string, unknown>;
};

/** Result of create_saml_provider. */
export type CreateSamlProviderResult = {
  samlProviderArn?: string | undefined;
  tags?: Record<string, unknown>[];
};

/** Result of create_service_linked_role. */
export type CreateServiceLinkedRoleResult = {
  role?: Record<string, unknown>;
};

/** Result of create_service_specific_credential. */
export type CreateServiceSpecificCredentialResult = {
  serviceSpecificCredential?: Record<string, unknown>;
};

/** Result of create_user. */
export type CreateUserResult = {
  user?: Record<string, unknown>;
};

/** Result of create_virtual_mfa_device. */
export type CreateVirtualMfaDeviceResult = {
  virtualMfaDevice?: Record<string, unknown>;
};

/** Result of delete_service_linked_role. */
export type DeleteServiceLinkedRoleResult = {
  deletionTaskId?: string | undefined;
};

/** Result of disable_organizations_root_credentials_management. */
export type DisableOrganizationsRootCredentialsManagementResult = {
  organizationId?: string | undefined;
  enabledFeatures?: string[];
};

/** Result of disable_organizations_root_sessions. */
export type DisableOrganizationsRootSessionsResult = {
  organizationId?: string | undefined;
  enabledFeatures?: string[];
};

/** Result of enable_organizations_root_credentials_management. */
export type EnableOrganizationsRootCredentialsManagementResult = {
  organizationId?: string | undefined;
  enabledFeatures?: string[];
};

/** Result of enable_organizations_root_sessions. */
export type EnableOrganizationsRootSessionsResult = {
  organizationId?: string | undefined;
  enabledFeatures?: string[];
};

/** Result of generate_credential_report. */
export type GenerateCredentialReportResult = {
  state?: string | undefined;
  description?: string | undefined;
};

/** Result of generate_organizations_access_report. */
export type GenerateOrganizationsAccessReportResult = {
  jobId?: string | undefined;
};

/** Result of generate_service_last_accessed_details. */
export type GenerateServiceLastAccessedDetailsResult = {
  jobId?: string | undefined;
};

/** Result of get_access_key_last_used. */
export type GetAccessKeyLastUsedResult = {
  userName?: string | undefined;
  accessKeyLastUsed?: Record<string, unknown>;
};

/** Result of get_account_authorization_details. */
export type GetAccountAuthorizationDetailsResult = {
  userDetailList?: Record<string, unknown>[];
  groupDetailList?: Record<string, unknown>[];
  roleDetailList?: Record<string, unknown>[];
  policies?: Record<string, unknown>[];
  isTruncated?: boolean | undefined;
  marker?: string | undefined;
};

/** Result of get_account_password_policy. */
export type GetAccountPasswordPolicyResult = {
  passwordPolicy?: Record<string, unknown>;
};

/** Result of get_account_summary. */
export type GetAccountSummaryResult = {
  summaryMap?: Record<string, unknown>;
};

/** Result of get_context_keys_for_custom_policy. */
export type GetContextKeysForCustomPolicyResult = {
  contextKeyNames?: string[];
};

/** Result of get_context_keys_for_principal_policy. */
export type GetContextKeysForPrincipalPolicyResult = {
  contextKeyNames?: string[];
};

/** Result of get_credential_report. */
export type GetCredentialReportResult = {
  content?: Uint8Array | undefined;
  reportFormat?: string | undefined;
  generatedTime?: string | undefined;
};

/** Result of get_group. */
export type GetGroupResult = {
  group?: Record<string, unknown>;
  users?: Record<string, unknown>[];
  isTruncated?: boolean | undefined;
  marker?: string | undefined;
};

/** Result of get_group_policy. */
export type GetGroupPolicyResult = {
  groupName?: string | undefined;
  policyName?: string | undefined;
  policyDocument?: string | undefined;
};

/** Result of get_instance_profile. */
export type GetInstanceProfileResult = {
  instanceProfile?: Record<string, unknown>;
};

/** Result of get_login_profile. */
export type GetLoginProfileResult = {
  loginProfile?: Record<string, unknown>;
};

/** Result of get_mfa_device. */
export type GetMfaDeviceResult = {
  userName?: string | undefined;
  serialNumber?: string | undefined;
  enableDate?: string | undefined;
  certifications?: Record<string, unknown>;
};

/** Result of get_open_id_connect_provider. */
export type GetOpenIdConnectProviderResult = {
  url?: string | undefined;
  clientIdList?: string[];
  thumbprintList?: string[];
  createDate?: string | undefined;
  tags?: Record<string, unknown>[];
};

/** Result of get_organizations_access_report. */
export type GetOrganizationsAccessReportResult = {
  jobStatus?: string | undefined;
  jobCreationDate?: string | undefined;
  jobCompletionDate?: string | undefined;
  numberOfServicesAccessible?: number | undefined;
  numberOfServicesNotAccessed?: number | undefined;
  accessDetails?: Record<string, unknown>[];
  isTruncated?: boolean | undefined;
  marker?: string | undefined;
  errorDetails?: Record<string, unknown>;
};

/** Result of get_policy. */
export type GetPolicyResult = {
  policy?: Record<string, unknown>;
};

/** Result of get_policy_version. */
export type GetPolicyVersionResult = {
  policyVersion?: Record<string, unknown>;
};

/** Result of get_role_policy. */
export type GetRolePolicyResult = {
  roleName?: string | undefined;
  policyName?: string | undefined;
  policyDocument?: string | undefined;
};

/** Result of get_saml_provider. */
export type GetSamlProviderResult = {
  samlProviderUuid?: string | undefined;
  samlMetadataDocument?: string | undefined;
  createDate?: string | undefined;
  validUntil?: string | undefined;
  tags?: Record<string, unknown>[];
  assertionEncryptionMode?: string | undefined;
  privateKeyList?: Record<string, unknown>[];
};

/** Result of get_server_certificate. */
export type GetServerCertificateResult = {
  serverCertificate?: Record<string, unknown>;
};

/** Result of get_service_last_accessed_details. */
export type GetServiceLastAccessedDetailsResult = {
  jobStatus?: string | undefined;
  jobType?: string | undefined;
  jobCreationDate?: string | undefined;
  servicesLastAccessed?: Record<string, unknown>[];
  jobCompletionDate?: string | undefined;
  isTruncated?: boolean | undefined;
  marker?: string | undefined;
  error?: Record<string, unknown>;
};

/** Result of get_service_last_accessed_details_with_entities. */
export type GetServiceLastAccessedDetailsWithEntitiesResult = {
  jobStatus?: string | undefined;
  jobCreationDate?: string | undefined;
  jobCompletionDate?: string | undefined;
  entityDetailsList?: Record<string, unknown>[];
  isTruncated?: boolean | undefined;
  marker?: string | undefined;
  error?: Record<string, unknown>;
};

/** Result of get_service_linked_role_deletion_status. */
export type GetServiceLinkedRoleDeletionStatusResult = {
  status?: string | undefined;
  reason?: Record<string, unknown>;
};

/** Result of get_ssh_public_key. */
export type GetSshPublicKeyResult = {
  sshPublicKey?: Record<string, unknown>;
};

/** Result of get_user. */
export type GetUserResult = {
  user?: Record<string, unknown>;
};

/** Result of get_user_policy. */
export type GetUserPolicyResult = {
  userName?: string | undefined;
  policyName?: string | undefined;
  policyDocument?: string | undefined;
};

/** Result of list_access_keys. */
export type ListAccessKeysResult = {
  accessKeyMetadata?: Record<string, unknown>[];
  isTruncated?: boolean | undefined;
  marker?: string | undefined;
};

/** Result of list_account_aliases. */
export type ListAccountAliasesResult = {
  accountAliases?: string[];
  isTruncated?: boolean | undefined;
  marker?: string | undefined;
};

/** Result of list_attached_group_policies. */
export type ListAttachedGroupPoliciesResult = {
  attachedPolicies?: Record<string, unknown>[];
  isTruncated?: boolean | undefined;
  marker?: string | undefined;
};

/** Result of list_attached_role_policies. */
export type ListAttachedRolePoliciesResult = {
  attachedPolicies?: Record<string, unknown>[];
  isTruncated?: boolean | undefined;
  marker?: string | undefined;
};

/** Result of list_attached_user_policies. */
export type ListAttachedUserPoliciesResult = {
  attachedPolicies?: Record<string, unknown>[];
  isTruncated?: boolean | undefined;
  marker?: string | undefined;
};

/** Result of list_entities_for_policy. */
export type ListEntitiesForPolicyResult = {
  policyGroups?: Record<string, unknown>[];
  policyUsers?: Record<string, unknown>[];
  policyRoles?: Record<string, unknown>[];
  isTruncated?: boolean | undefined;
  marker?: string | undefined;
};

/** Result of list_group_policies. */
export type ListGroupPoliciesResult = {
  policyNames?: string[];
  isTruncated?: boolean | undefined;
  marker?: string | undefined;
};

/** Result of list_groups. */
export type ListGroupsResult = {
  groups?: Record<string, unknown>[];
  isTruncated?: boolean | undefined;
  marker?: string | undefined;
};

/** Result of list_groups_for_user. */
export type ListGroupsForUserResult = {
  groups?: Record<string, unknown>[];
  isTruncated?: boolean | undefined;
  marker?: string | undefined;
};

/** Result of list_instance_profile_tags. */
export type ListInstanceProfileTagsResult = {
  tags?: Record<string, unknown>[];
  isTruncated?: boolean | undefined;
  marker?: string | undefined;
};

/** Result of list_instance_profiles. */
export type ListInstanceProfilesResult = {
  instanceProfiles?: Record<string, unknown>[];
  isTruncated?: boolean | undefined;
  marker?: string | undefined;
};

/** Result of list_instance_profiles_for_role. */
export type ListInstanceProfilesForRoleResult = {
  instanceProfiles?: Record<string, unknown>[];
  isTruncated?: boolean | undefined;
  marker?: string | undefined;
};

/** Result of list_mfa_device_tags. */
export type ListMfaDeviceTagsResult = {
  tags?: Record<string, unknown>[];
  isTruncated?: boolean | undefined;
  marker?: string | undefined;
};

/** Result of list_mfa_devices. */
export type ListMfaDevicesResult = {
  mfaDevices?: Record<string, unknown>[];
  isTruncated?: boolean | undefined;
  marker?: string | undefined;
};

/** Result of list_open_id_connect_provider_tags. */
export type ListOpenIdConnectProviderTagsResult = {
  tags?: Record<string, unknown>[];
  isTruncated?: boolean | undefined;
  marker?: string | undefined;
};

/** Result of list_open_id_connect_providers. */
export type ListOpenIdConnectProvidersResult = {
  openIdConnectProviderList?: Record<string, unknown>[];
};

/** Result of list_organizations_features. */
export type ListOrganizationsFeaturesResult = {
  organizationId?: string | undefined;
  enabledFeatures?: string[];
};

/** Result of list_policies_granting_service_access. */
export type ListPoliciesGrantingServiceAccessResult = {
  policiesGrantingServiceAccess?: Record<string, unknown>[];
  isTruncated?: boolean | undefined;
  marker?: string | undefined;
};

/** Result of list_policy_tags. */
export type ListPolicyTagsResult = {
  tags?: Record<string, unknown>[];
  isTruncated?: boolean | undefined;
  marker?: string | undefined;
};

/** Result of list_policy_versions. */
export type ListPolicyVersionsResult = {
  versions?: Record<string, unknown>[];
  isTruncated?: boolean | undefined;
  marker?: string | undefined;
};

/** Result of list_role_policies. */
export type ListRolePoliciesResult = {
  policyNames?: string[];
  isTruncated?: boolean | undefined;
  marker?: string | undefined;
};

/** Result of list_role_tags. */
export type ListRoleTagsResult = {
  tags?: Record<string, unknown>[];
  isTruncated?: boolean | undefined;
  marker?: string | undefined;
};

/** Result of list_saml_provider_tags. */
export type ListSamlProviderTagsResult = {
  tags?: Record<string, unknown>[];
  isTruncated?: boolean | undefined;
  marker?: string | undefined;
};

/** Result of list_saml_providers. */
export type ListSamlProvidersResult = {
  samlProviderList?: Record<string, unknown>[];
};

/** Result of list_server_certificate_tags. */
export type ListServerCertificateTagsResult = {
  tags?: Record<string, unknown>[];
  isTruncated?: boolean | undefined;
  marker?: string | undefined;
};

/** Result of list_server_certificates. */
export type ListServerCertificatesResult = {
  serverCertificateMetadataList?: Record<string, unknown>[];
  isTruncated?: boolean | undefined;
  marker?: string | undefined;
};

/** Result of list_service_specific_credentials. */
export type ListServiceSpecificCredentialsResult = {
  serviceSpecificCredentials?: Record<string, unknown>[];
  marker?: string | undefined;
  isTruncated?: boolean | undefined;
};

/** Result of list_signing_certificates. */
export type ListSigningCertificatesResult = {
  certificates?: Record<string, unknown>[];
  isTruncated?: boolean | undefined;
  marker?: string | undefined;
};

/** Result of list_ssh_public_keys. */
export type ListSshPublicKeysResult = {
  sshPublicKeys?: Record<string, unknown>[];
  isTruncated?: boolean | undefined;
  marker?: string | undefined;
};

/** Result of list_user_policies. */
export type ListUserPoliciesResult = {
  policyNames?: string[];
  isTruncated?: boolean | undefined;
  marker?: string | undefined;
};

/** Result of list_user_tags. */
export type ListUserTagsResult = {
  tags?: Record<string, unknown>[];
  isTruncated?: boolean | undefined;
  marker?: string | undefined;
};

/** Result of list_virtual_mfa_devices. */
export type ListVirtualMfaDevicesResult = {
  virtualMfaDevices?: Record<string, unknown>[];
  isTruncated?: boolean | undefined;
  marker?: string | undefined;
};

/** Result of reset_service_specific_credential. */
export type ResetServiceSpecificCredentialResult = {
  serviceSpecificCredential?: Record<string, unknown>;
};

/** Result of simulate_custom_policy. */
export type SimulateCustomPolicyResult = {
  evaluationResults?: Record<string, unknown>[];
  isTruncated?: boolean | undefined;
  marker?: string | undefined;
};

/** Result of simulate_principal_policy. */
export type SimulatePrincipalPolicyResult = {
  evaluationResults?: Record<string, unknown>[];
  isTruncated?: boolean | undefined;
  marker?: string | undefined;
};

/** Result of update_role_description. */
export type UpdateRoleDescriptionResult = {
  role?: Record<string, unknown>;
};

/** Result of update_saml_provider. */
export type UpdateSamlProviderResult = {
  samlProviderArn?: string | undefined;
};

/** Result of upload_server_certificate. */
export type UploadServerCertificateResult = {
  serverCertificateMetadata?: Record<string, unknown>;
  tags?: Record<string, unknown>[];
};

/** Result of upload_signing_certificate. */
export type UploadSigningCertificateResult = {
  certificate?: Record<string, unknown>;
};

/** Result of upload_ssh_public_key. */
export type UploadSshPublicKeyResult = {
  sshPublicKey?: Record<string, unknown>;
};


// ---------------------------------------------------------------------------
// Additional functions (auto-generated)
// ---------------------------------------------------------------------------

/** Add client id to open id connect provider. */
export async function addClientIdToOpenIdConnectProvider(openIdConnectProviderArn: string, clientId: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement add_client_id_to_open_id_connect_provider
    throw new Error("add_client_id_to_open_id_connect_provider not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "add_client_id_to_open_id_connect_provider failed");
  }
}

/** Add role to instance profile. */
export async function addRoleToInstanceProfile(instanceProfileName: string, roleName: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement add_role_to_instance_profile
    throw new Error("add_role_to_instance_profile not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "add_role_to_instance_profile failed");
  }
}

/** Add user to group. */
export async function addUserToGroup(groupName: string, userName: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement add_user_to_group
    throw new Error("add_user_to_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "add_user_to_group failed");
  }
}

/** Attach group policy. */
export async function attachGroupPolicy(groupName: string, policyArn: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement attach_group_policy
    throw new Error("attach_group_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "attach_group_policy failed");
  }
}

/** Attach user policy. */
export async function attachUserPolicy(userName: string, policyArn: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement attach_user_policy
    throw new Error("attach_user_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "attach_user_policy failed");
  }
}

/** Change password. */
export async function changePassword(oldPassword: string, newPassword: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement change_password
    throw new Error("change_password not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "change_password failed");
  }
}

/** Create access key. */
export async function createAccessKey(): Promise<CreateAccessKeyResult> {
  try {
    // TODO: implement create_access_key
    throw new Error("create_access_key not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_access_key failed");
  }
}

/** Create account alias. */
export async function createAccountAlias(accountAlias: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement create_account_alias
    throw new Error("create_account_alias not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_account_alias failed");
  }
}

/** Create delegation request. */
export async function createDelegationRequest(description: string, permissions: Record<string, unknown>, requestorWorkflowId: string, notificationChannel: string, sessionDuration: number): Promise<CreateDelegationRequestResult> {
  try {
    // TODO: implement create_delegation_request
    throw new Error("create_delegation_request not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_delegation_request failed");
  }
}

/** Create group. */
export async function createGroup(groupName: string): Promise<CreateGroupResult> {
  try {
    // TODO: implement create_group
    throw new Error("create_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_group failed");
  }
}

/** Create instance profile. */
export async function createInstanceProfile(instanceProfileName: string): Promise<CreateInstanceProfileResult> {
  try {
    // TODO: implement create_instance_profile
    throw new Error("create_instance_profile not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_instance_profile failed");
  }
}

/** Create login profile. */
export async function createLoginProfile(): Promise<CreateLoginProfileResult> {
  try {
    // TODO: implement create_login_profile
    throw new Error("create_login_profile not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_login_profile failed");
  }
}

/** Create open id connect provider. */
export async function createOpenIdConnectProvider(url: string): Promise<CreateOpenIdConnectProviderResult> {
  try {
    // TODO: implement create_open_id_connect_provider
    throw new Error("create_open_id_connect_provider not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_open_id_connect_provider failed");
  }
}

/** Create policy version. */
export async function createPolicyVersion(policyArn: string, policyDocument: string): Promise<CreatePolicyVersionResult> {
  try {
    // TODO: implement create_policy_version
    throw new Error("create_policy_version not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_policy_version failed");
  }
}

/** Create saml provider. */
export async function createSamlProvider(samlMetadataDocument: string, name: string): Promise<CreateSamlProviderResult> {
  try {
    // TODO: implement create_saml_provider
    throw new Error("create_saml_provider not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_saml_provider failed");
  }
}

/** Create service linked role. */
export async function createServiceLinkedRole(awsServiceName: string): Promise<CreateServiceLinkedRoleResult> {
  try {
    // TODO: implement create_service_linked_role
    throw new Error("create_service_linked_role not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_service_linked_role failed");
  }
}

/** Create service specific credential. */
export async function createServiceSpecificCredential(userName: string, serviceName: string): Promise<CreateServiceSpecificCredentialResult> {
  try {
    // TODO: implement create_service_specific_credential
    throw new Error("create_service_specific_credential not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_service_specific_credential failed");
  }
}

/** Create user. */
export async function createUser(userName: string): Promise<CreateUserResult> {
  try {
    // TODO: implement create_user
    throw new Error("create_user not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_user failed");
  }
}

/** Create virtual mfa device. */
export async function createVirtualMfaDevice(virtualMfaDeviceName: string): Promise<CreateVirtualMfaDeviceResult> {
  try {
    // TODO: implement create_virtual_mfa_device
    throw new Error("create_virtual_mfa_device not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_virtual_mfa_device failed");
  }
}

/** Deactivate mfa device. */
export async function deactivateMfaDevice(serialNumber: string): Promise<void> {
  try {
    // TODO: implement deactivate_mfa_device
    throw new Error("deactivate_mfa_device not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "deactivate_mfa_device failed");
  }
}

/** Delete access key. */
export async function deleteAccessKey(accessKeyId: string): Promise<void> {
  try {
    // TODO: implement delete_access_key
    throw new Error("delete_access_key not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_access_key failed");
  }
}

/** Delete account alias. */
export async function deleteAccountAlias(accountAlias: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_account_alias
    throw new Error("delete_account_alias not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_account_alias failed");
  }
}

/** Delete account password policy. */
export async function deleteAccountPasswordPolicy(regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_account_password_policy
    throw new Error("delete_account_password_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_account_password_policy failed");
  }
}

/** Delete group. */
export async function deleteGroup(groupName: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_group
    throw new Error("delete_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_group failed");
  }
}

/** Delete group policy. */
export async function deleteGroupPolicy(groupName: string, policyName: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_group_policy
    throw new Error("delete_group_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_group_policy failed");
  }
}

/** Delete instance profile. */
export async function deleteInstanceProfile(instanceProfileName: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_instance_profile
    throw new Error("delete_instance_profile not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_instance_profile failed");
  }
}

/** Delete login profile. */
export async function deleteLoginProfile(): Promise<void> {
  try {
    // TODO: implement delete_login_profile
    throw new Error("delete_login_profile not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_login_profile failed");
  }
}

/** Delete open id connect provider. */
export async function deleteOpenIdConnectProvider(openIdConnectProviderArn: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_open_id_connect_provider
    throw new Error("delete_open_id_connect_provider not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_open_id_connect_provider failed");
  }
}

/** Delete policy version. */
export async function deletePolicyVersion(policyArn: string, versionId: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_policy_version
    throw new Error("delete_policy_version not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_policy_version failed");
  }
}

/** Delete role permissions boundary. */
export async function deleteRolePermissionsBoundary(roleName: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_role_permissions_boundary
    throw new Error("delete_role_permissions_boundary not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_role_permissions_boundary failed");
  }
}

/** Delete role policy. */
export async function deleteRolePolicy(roleName: string, policyName: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_role_policy
    throw new Error("delete_role_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_role_policy failed");
  }
}

/** Delete saml provider. */
export async function deleteSamlProvider(samlProviderArn: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_saml_provider
    throw new Error("delete_saml_provider not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_saml_provider failed");
  }
}

/** Delete server certificate. */
export async function deleteServerCertificate(serverCertificateName: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_server_certificate
    throw new Error("delete_server_certificate not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_server_certificate failed");
  }
}

/** Delete service linked role. */
export async function deleteServiceLinkedRole(roleName: string, regionName?: string | undefined): Promise<DeleteServiceLinkedRoleResult> {
  try {
    // TODO: implement delete_service_linked_role
    throw new Error("delete_service_linked_role not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_service_linked_role failed");
  }
}

/** Delete service specific credential. */
export async function deleteServiceSpecificCredential(serviceSpecificCredentialId: string): Promise<void> {
  try {
    // TODO: implement delete_service_specific_credential
    throw new Error("delete_service_specific_credential not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_service_specific_credential failed");
  }
}

/** Delete signing certificate. */
export async function deleteSigningCertificate(certificateId: string): Promise<void> {
  try {
    // TODO: implement delete_signing_certificate
    throw new Error("delete_signing_certificate not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_signing_certificate failed");
  }
}

/** Delete ssh public key. */
export async function deleteSshPublicKey(userName: string, sshPublicKeyId: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_ssh_public_key
    throw new Error("delete_ssh_public_key not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_ssh_public_key failed");
  }
}

/** Delete user. */
export async function deleteUser(userName: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_user
    throw new Error("delete_user not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_user failed");
  }
}

/** Delete user permissions boundary. */
export async function deleteUserPermissionsBoundary(userName: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_user_permissions_boundary
    throw new Error("delete_user_permissions_boundary not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_user_permissions_boundary failed");
  }
}

/** Delete user policy. */
export async function deleteUserPolicy(userName: string, policyName: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_user_policy
    throw new Error("delete_user_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_user_policy failed");
  }
}

/** Delete virtual mfa device. */
export async function deleteVirtualMfaDevice(serialNumber: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_virtual_mfa_device
    throw new Error("delete_virtual_mfa_device not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_virtual_mfa_device failed");
  }
}

/** Detach group policy. */
export async function detachGroupPolicy(groupName: string, policyArn: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement detach_group_policy
    throw new Error("detach_group_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "detach_group_policy failed");
  }
}

/** Detach user policy. */
export async function detachUserPolicy(userName: string, policyArn: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement detach_user_policy
    throw new Error("detach_user_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "detach_user_policy failed");
  }
}

/** Disable organizations root credentials management. */
export async function disableOrganizationsRootCredentialsManagement(regionName?: string | undefined): Promise<DisableOrganizationsRootCredentialsManagementResult> {
  try {
    // TODO: implement disable_organizations_root_credentials_management
    throw new Error("disable_organizations_root_credentials_management not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disable_organizations_root_credentials_management failed");
  }
}

/** Disable organizations root sessions. */
export async function disableOrganizationsRootSessions(regionName?: string | undefined): Promise<DisableOrganizationsRootSessionsResult> {
  try {
    // TODO: implement disable_organizations_root_sessions
    throw new Error("disable_organizations_root_sessions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disable_organizations_root_sessions failed");
  }
}

/** Enable mfa device. */
export async function enableMfaDevice(userName: string, serialNumber: string, authenticationCode1: string, authenticationCode2: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement enable_mfa_device
    throw new Error("enable_mfa_device not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "enable_mfa_device failed");
  }
}

/** Enable organizations root credentials management. */
export async function enableOrganizationsRootCredentialsManagement(regionName?: string | undefined): Promise<EnableOrganizationsRootCredentialsManagementResult> {
  try {
    // TODO: implement enable_organizations_root_credentials_management
    throw new Error("enable_organizations_root_credentials_management not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "enable_organizations_root_credentials_management failed");
  }
}

/** Enable organizations root sessions. */
export async function enableOrganizationsRootSessions(regionName?: string | undefined): Promise<EnableOrganizationsRootSessionsResult> {
  try {
    // TODO: implement enable_organizations_root_sessions
    throw new Error("enable_organizations_root_sessions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "enable_organizations_root_sessions failed");
  }
}

/** Generate credential report. */
export async function generateCredentialReport(regionName?: string | undefined): Promise<GenerateCredentialReportResult> {
  try {
    // TODO: implement generate_credential_report
    throw new Error("generate_credential_report not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "generate_credential_report failed");
  }
}

/** Generate organizations access report. */
export async function generateOrganizationsAccessReport(entityPath: string): Promise<GenerateOrganizationsAccessReportResult> {
  try {
    // TODO: implement generate_organizations_access_report
    throw new Error("generate_organizations_access_report not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "generate_organizations_access_report failed");
  }
}

/** Generate service last accessed details. */
export async function generateServiceLastAccessedDetails(arn: string): Promise<GenerateServiceLastAccessedDetailsResult> {
  try {
    // TODO: implement generate_service_last_accessed_details
    throw new Error("generate_service_last_accessed_details not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "generate_service_last_accessed_details failed");
  }
}

/** Get access key last used. */
export async function getAccessKeyLastUsed(accessKeyId: string, regionName?: string | undefined): Promise<GetAccessKeyLastUsedResult> {
  try {
    // TODO: implement get_access_key_last_used
    throw new Error("get_access_key_last_used not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_access_key_last_used failed");
  }
}

/** Get account authorization details. */
export async function getAccountAuthorizationDetails(): Promise<GetAccountAuthorizationDetailsResult> {
  try {
    // TODO: implement get_account_authorization_details
    throw new Error("get_account_authorization_details not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_account_authorization_details failed");
  }
}

/** Get account password policy. */
export async function getAccountPasswordPolicy(regionName?: string | undefined): Promise<GetAccountPasswordPolicyResult> {
  try {
    // TODO: implement get_account_password_policy
    throw new Error("get_account_password_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_account_password_policy failed");
  }
}

/** Get account summary. */
export async function getAccountSummary(regionName?: string | undefined): Promise<GetAccountSummaryResult> {
  try {
    // TODO: implement get_account_summary
    throw new Error("get_account_summary not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_account_summary failed");
  }
}

/** Get context keys for custom policy. */
export async function getContextKeysForCustomPolicy(policyInputList: string[], regionName?: string | undefined): Promise<GetContextKeysForCustomPolicyResult> {
  try {
    // TODO: implement get_context_keys_for_custom_policy
    throw new Error("get_context_keys_for_custom_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_context_keys_for_custom_policy failed");
  }
}

/** Get context keys for principal policy. */
export async function getContextKeysForPrincipalPolicy(policySourceArn: string): Promise<GetContextKeysForPrincipalPolicyResult> {
  try {
    // TODO: implement get_context_keys_for_principal_policy
    throw new Error("get_context_keys_for_principal_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_context_keys_for_principal_policy failed");
  }
}

/** Get credential report. */
export async function getCredentialReport(regionName?: string | undefined): Promise<GetCredentialReportResult> {
  try {
    // TODO: implement get_credential_report
    throw new Error("get_credential_report not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_credential_report failed");
  }
}

/** Get group. */
export async function getGroup(groupName: string): Promise<GetGroupResult> {
  try {
    // TODO: implement get_group
    throw new Error("get_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_group failed");
  }
}

/** Get group policy. */
export async function getGroupPolicy(groupName: string, policyName: string, regionName?: string | undefined): Promise<GetGroupPolicyResult> {
  try {
    // TODO: implement get_group_policy
    throw new Error("get_group_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_group_policy failed");
  }
}

/** Get instance profile. */
export async function getInstanceProfile(instanceProfileName: string, regionName?: string | undefined): Promise<GetInstanceProfileResult> {
  try {
    // TODO: implement get_instance_profile
    throw new Error("get_instance_profile not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_instance_profile failed");
  }
}

/** Get login profile. */
export async function getLoginProfile(): Promise<GetLoginProfileResult> {
  try {
    // TODO: implement get_login_profile
    throw new Error("get_login_profile not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_login_profile failed");
  }
}

/** Get mfa device. */
export async function getMfaDevice(serialNumber: string): Promise<GetMfaDeviceResult> {
  try {
    // TODO: implement get_mfa_device
    throw new Error("get_mfa_device not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_mfa_device failed");
  }
}

/** Get open id connect provider. */
export async function getOpenIdConnectProvider(openIdConnectProviderArn: string, regionName?: string | undefined): Promise<GetOpenIdConnectProviderResult> {
  try {
    // TODO: implement get_open_id_connect_provider
    throw new Error("get_open_id_connect_provider not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_open_id_connect_provider failed");
  }
}

/** Get organizations access report. */
export async function getOrganizationsAccessReport(jobId: string): Promise<GetOrganizationsAccessReportResult> {
  try {
    // TODO: implement get_organizations_access_report
    throw new Error("get_organizations_access_report not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_organizations_access_report failed");
  }
}

/** Get policy. */
export async function getPolicy(policyArn: string, regionName?: string | undefined): Promise<GetPolicyResult> {
  try {
    // TODO: implement get_policy
    throw new Error("get_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_policy failed");
  }
}

/** Get policy version. */
export async function getPolicyVersion(policyArn: string, versionId: string, regionName?: string | undefined): Promise<GetPolicyVersionResult> {
  try {
    // TODO: implement get_policy_version
    throw new Error("get_policy_version not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_policy_version failed");
  }
}

/** Get role policy. */
export async function getRolePolicy(roleName: string, policyName: string, regionName?: string | undefined): Promise<GetRolePolicyResult> {
  try {
    // TODO: implement get_role_policy
    throw new Error("get_role_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_role_policy failed");
  }
}

/** Get saml provider. */
export async function getSamlProvider(samlProviderArn: string, regionName?: string | undefined): Promise<GetSamlProviderResult> {
  try {
    // TODO: implement get_saml_provider
    throw new Error("get_saml_provider not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_saml_provider failed");
  }
}

/** Get server certificate. */
export async function getServerCertificate(serverCertificateName: string, regionName?: string | undefined): Promise<GetServerCertificateResult> {
  try {
    // TODO: implement get_server_certificate
    throw new Error("get_server_certificate not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_server_certificate failed");
  }
}

/** Get service last accessed details. */
export async function getServiceLastAccessedDetails(jobId: string): Promise<GetServiceLastAccessedDetailsResult> {
  try {
    // TODO: implement get_service_last_accessed_details
    throw new Error("get_service_last_accessed_details not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_service_last_accessed_details failed");
  }
}

/** Get service last accessed details with entities. */
export async function getServiceLastAccessedDetailsWithEntities(jobId: string, serviceNamespace: string): Promise<GetServiceLastAccessedDetailsWithEntitiesResult> {
  try {
    // TODO: implement get_service_last_accessed_details_with_entities
    throw new Error("get_service_last_accessed_details_with_entities not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_service_last_accessed_details_with_entities failed");
  }
}

/** Get service linked role deletion status. */
export async function getServiceLinkedRoleDeletionStatus(deletionTaskId: string, regionName?: string | undefined): Promise<GetServiceLinkedRoleDeletionStatusResult> {
  try {
    // TODO: implement get_service_linked_role_deletion_status
    throw new Error("get_service_linked_role_deletion_status not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_service_linked_role_deletion_status failed");
  }
}

/** Get ssh public key. */
export async function getSshPublicKey(userName: string, sshPublicKeyId: string, encoding: string, regionName?: string | undefined): Promise<GetSshPublicKeyResult> {
  try {
    // TODO: implement get_ssh_public_key
    throw new Error("get_ssh_public_key not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_ssh_public_key failed");
  }
}

/** Get user. */
export async function getUser(): Promise<GetUserResult> {
  try {
    // TODO: implement get_user
    throw new Error("get_user not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_user failed");
  }
}

/** Get user policy. */
export async function getUserPolicy(userName: string, policyName: string, regionName?: string | undefined): Promise<GetUserPolicyResult> {
  try {
    // TODO: implement get_user_policy
    throw new Error("get_user_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_user_policy failed");
  }
}

/** List access keys. */
export async function listAccessKeys(): Promise<ListAccessKeysResult> {
  try {
    // TODO: implement list_access_keys
    throw new Error("list_access_keys not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_access_keys failed");
  }
}

/** List account aliases. */
export async function listAccountAliases(): Promise<ListAccountAliasesResult> {
  try {
    // TODO: implement list_account_aliases
    throw new Error("list_account_aliases not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_account_aliases failed");
  }
}

/** List attached group policies. */
export async function listAttachedGroupPolicies(groupName: string): Promise<ListAttachedGroupPoliciesResult> {
  try {
    // TODO: implement list_attached_group_policies
    throw new Error("list_attached_group_policies not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_attached_group_policies failed");
  }
}

/** List attached role policies. */
export async function listAttachedRolePolicies(roleName: string): Promise<ListAttachedRolePoliciesResult> {
  try {
    // TODO: implement list_attached_role_policies
    throw new Error("list_attached_role_policies not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_attached_role_policies failed");
  }
}

/** List attached user policies. */
export async function listAttachedUserPolicies(userName: string): Promise<ListAttachedUserPoliciesResult> {
  try {
    // TODO: implement list_attached_user_policies
    throw new Error("list_attached_user_policies not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_attached_user_policies failed");
  }
}

/** List entities for policy. */
export async function listEntitiesForPolicy(policyArn: string): Promise<ListEntitiesForPolicyResult> {
  try {
    // TODO: implement list_entities_for_policy
    throw new Error("list_entities_for_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_entities_for_policy failed");
  }
}

/** List group policies. */
export async function listGroupPolicies(groupName: string): Promise<ListGroupPoliciesResult> {
  try {
    // TODO: implement list_group_policies
    throw new Error("list_group_policies not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_group_policies failed");
  }
}

/** List groups. */
export async function listGroups(): Promise<ListGroupsResult> {
  try {
    // TODO: implement list_groups
    throw new Error("list_groups not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_groups failed");
  }
}

/** List groups for user. */
export async function listGroupsForUser(userName: string): Promise<ListGroupsForUserResult> {
  try {
    // TODO: implement list_groups_for_user
    throw new Error("list_groups_for_user not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_groups_for_user failed");
  }
}

/** List instance profile tags. */
export async function listInstanceProfileTags(instanceProfileName: string): Promise<ListInstanceProfileTagsResult> {
  try {
    // TODO: implement list_instance_profile_tags
    throw new Error("list_instance_profile_tags not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_instance_profile_tags failed");
  }
}

/** List instance profiles. */
export async function listInstanceProfiles(): Promise<ListInstanceProfilesResult> {
  try {
    // TODO: implement list_instance_profiles
    throw new Error("list_instance_profiles not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_instance_profiles failed");
  }
}

/** List instance profiles for role. */
export async function listInstanceProfilesForRole(roleName: string): Promise<ListInstanceProfilesForRoleResult> {
  try {
    // TODO: implement list_instance_profiles_for_role
    throw new Error("list_instance_profiles_for_role not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_instance_profiles_for_role failed");
  }
}

/** List mfa device tags. */
export async function listMfaDeviceTags(serialNumber: string): Promise<ListMfaDeviceTagsResult> {
  try {
    // TODO: implement list_mfa_device_tags
    throw new Error("list_mfa_device_tags not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_mfa_device_tags failed");
  }
}

/** List mfa devices. */
export async function listMfaDevices(): Promise<ListMfaDevicesResult> {
  try {
    // TODO: implement list_mfa_devices
    throw new Error("list_mfa_devices not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_mfa_devices failed");
  }
}

/** List open id connect provider tags. */
export async function listOpenIdConnectProviderTags(openIdConnectProviderArn: string): Promise<ListOpenIdConnectProviderTagsResult> {
  try {
    // TODO: implement list_open_id_connect_provider_tags
    throw new Error("list_open_id_connect_provider_tags not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_open_id_connect_provider_tags failed");
  }
}

/** List open id connect providers. */
export async function listOpenIdConnectProviders(regionName?: string | undefined): Promise<ListOpenIdConnectProvidersResult> {
  try {
    // TODO: implement list_open_id_connect_providers
    throw new Error("list_open_id_connect_providers not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_open_id_connect_providers failed");
  }
}

/** List organizations features. */
export async function listOrganizationsFeatures(regionName?: string | undefined): Promise<ListOrganizationsFeaturesResult> {
  try {
    // TODO: implement list_organizations_features
    throw new Error("list_organizations_features not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_organizations_features failed");
  }
}

/** List policies granting service access. */
export async function listPoliciesGrantingServiceAccess(arn: string, serviceNamespaces: string[]): Promise<ListPoliciesGrantingServiceAccessResult> {
  try {
    // TODO: implement list_policies_granting_service_access
    throw new Error("list_policies_granting_service_access not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_policies_granting_service_access failed");
  }
}

/** List policy tags. */
export async function listPolicyTags(policyArn: string): Promise<ListPolicyTagsResult> {
  try {
    // TODO: implement list_policy_tags
    throw new Error("list_policy_tags not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_policy_tags failed");
  }
}

/** List policy versions. */
export async function listPolicyVersions(policyArn: string): Promise<ListPolicyVersionsResult> {
  try {
    // TODO: implement list_policy_versions
    throw new Error("list_policy_versions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_policy_versions failed");
  }
}

/** List role policies. */
export async function listRolePolicies(roleName: string): Promise<ListRolePoliciesResult> {
  try {
    // TODO: implement list_role_policies
    throw new Error("list_role_policies not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_role_policies failed");
  }
}

/** List role tags. */
export async function listRoleTags(roleName: string): Promise<ListRoleTagsResult> {
  try {
    // TODO: implement list_role_tags
    throw new Error("list_role_tags not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_role_tags failed");
  }
}

/** List saml provider tags. */
export async function listSamlProviderTags(samlProviderArn: string): Promise<ListSamlProviderTagsResult> {
  try {
    // TODO: implement list_saml_provider_tags
    throw new Error("list_saml_provider_tags not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_saml_provider_tags failed");
  }
}

/** List saml providers. */
export async function listSamlProviders(regionName?: string | undefined): Promise<ListSamlProvidersResult> {
  try {
    // TODO: implement list_saml_providers
    throw new Error("list_saml_providers not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_saml_providers failed");
  }
}

/** List server certificate tags. */
export async function listServerCertificateTags(serverCertificateName: string): Promise<ListServerCertificateTagsResult> {
  try {
    // TODO: implement list_server_certificate_tags
    throw new Error("list_server_certificate_tags not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_server_certificate_tags failed");
  }
}

/** List server certificates. */
export async function listServerCertificates(): Promise<ListServerCertificatesResult> {
  try {
    // TODO: implement list_server_certificates
    throw new Error("list_server_certificates not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_server_certificates failed");
  }
}

/** List service specific credentials. */
export async function listServiceSpecificCredentials(): Promise<ListServiceSpecificCredentialsResult> {
  try {
    // TODO: implement list_service_specific_credentials
    throw new Error("list_service_specific_credentials not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_service_specific_credentials failed");
  }
}

/** List signing certificates. */
export async function listSigningCertificates(): Promise<ListSigningCertificatesResult> {
  try {
    // TODO: implement list_signing_certificates
    throw new Error("list_signing_certificates not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_signing_certificates failed");
  }
}

/** List ssh public keys. */
export async function listSshPublicKeys(): Promise<ListSshPublicKeysResult> {
  try {
    // TODO: implement list_ssh_public_keys
    throw new Error("list_ssh_public_keys not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_ssh_public_keys failed");
  }
}

/** List user policies. */
export async function listUserPolicies(userName: string): Promise<ListUserPoliciesResult> {
  try {
    // TODO: implement list_user_policies
    throw new Error("list_user_policies not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_user_policies failed");
  }
}

/** List user tags. */
export async function listUserTags(userName: string): Promise<ListUserTagsResult> {
  try {
    // TODO: implement list_user_tags
    throw new Error("list_user_tags not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_user_tags failed");
  }
}

/** List virtual mfa devices. */
export async function listVirtualMfaDevices(): Promise<ListVirtualMfaDevicesResult> {
  try {
    // TODO: implement list_virtual_mfa_devices
    throw new Error("list_virtual_mfa_devices not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_virtual_mfa_devices failed");
  }
}

/** Put group policy. */
export async function putGroupPolicy(groupName: string, policyName: string, policyDocument: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement put_group_policy
    throw new Error("put_group_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_group_policy failed");
  }
}

/** Put role permissions boundary. */
export async function putRolePermissionsBoundary(roleName: string, permissionsBoundary: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement put_role_permissions_boundary
    throw new Error("put_role_permissions_boundary not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_role_permissions_boundary failed");
  }
}

/** Put role policy. */
export async function putRolePolicy(roleName: string, policyName: string, policyDocument: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement put_role_policy
    throw new Error("put_role_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_role_policy failed");
  }
}

/** Put user permissions boundary. */
export async function putUserPermissionsBoundary(userName: string, permissionsBoundary: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement put_user_permissions_boundary
    throw new Error("put_user_permissions_boundary not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_user_permissions_boundary failed");
  }
}

/** Put user policy. */
export async function putUserPolicy(userName: string, policyName: string, policyDocument: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement put_user_policy
    throw new Error("put_user_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_user_policy failed");
  }
}

/** Remove client id from open id connect provider. */
export async function removeClientIdFromOpenIdConnectProvider(openIdConnectProviderArn: string, clientId: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement remove_client_id_from_open_id_connect_provider
    throw new Error("remove_client_id_from_open_id_connect_provider not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "remove_client_id_from_open_id_connect_provider failed");
  }
}

/** Remove role from instance profile. */
export async function removeRoleFromInstanceProfile(instanceProfileName: string, roleName: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement remove_role_from_instance_profile
    throw new Error("remove_role_from_instance_profile not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "remove_role_from_instance_profile failed");
  }
}

/** Remove user from group. */
export async function removeUserFromGroup(groupName: string, userName: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement remove_user_from_group
    throw new Error("remove_user_from_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "remove_user_from_group failed");
  }
}

/** Reset service specific credential. */
export async function resetServiceSpecificCredential(serviceSpecificCredentialId: string): Promise<ResetServiceSpecificCredentialResult> {
  try {
    // TODO: implement reset_service_specific_credential
    throw new Error("reset_service_specific_credential not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "reset_service_specific_credential failed");
  }
}

/** Resync mfa device. */
export async function resyncMfaDevice(userName: string, serialNumber: string, authenticationCode1: string, authenticationCode2: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement resync_mfa_device
    throw new Error("resync_mfa_device not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "resync_mfa_device failed");
  }
}

/** Set default policy version. */
export async function setDefaultPolicyVersion(policyArn: string, versionId: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement set_default_policy_version
    throw new Error("set_default_policy_version not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "set_default_policy_version failed");
  }
}

/** Set security token service preferences. */
export async function setSecurityTokenServicePreferences(globalEndpointTokenVersion: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement set_security_token_service_preferences
    throw new Error("set_security_token_service_preferences not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "set_security_token_service_preferences failed");
  }
}

/** Simulate custom policy. */
export async function simulateCustomPolicy(policyInputList: string[], actionNames: string[]): Promise<SimulateCustomPolicyResult> {
  try {
    // TODO: implement simulate_custom_policy
    throw new Error("simulate_custom_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "simulate_custom_policy failed");
  }
}

/** Simulate principal policy. */
export async function simulatePrincipalPolicy(policySourceArn: string, actionNames: string[]): Promise<SimulatePrincipalPolicyResult> {
  try {
    // TODO: implement simulate_principal_policy
    throw new Error("simulate_principal_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "simulate_principal_policy failed");
  }
}

/** Tag instance profile. */
export async function tagInstanceProfile(instanceProfileName: string, tags: Record<string, unknown>[], regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement tag_instance_profile
    throw new Error("tag_instance_profile not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "tag_instance_profile failed");
  }
}

/** Tag mfa device. */
export async function tagMfaDevice(serialNumber: string, tags: Record<string, unknown>[], regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement tag_mfa_device
    throw new Error("tag_mfa_device not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "tag_mfa_device failed");
  }
}

/** Tag open id connect provider. */
export async function tagOpenIdConnectProvider(openIdConnectProviderArn: string, tags: Record<string, unknown>[], regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement tag_open_id_connect_provider
    throw new Error("tag_open_id_connect_provider not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "tag_open_id_connect_provider failed");
  }
}

/** Tag policy. */
export async function tagPolicy(policyArn: string, tags: Record<string, unknown>[], regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement tag_policy
    throw new Error("tag_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "tag_policy failed");
  }
}

/** Tag role. */
export async function tagRole(roleName: string, tags: Record<string, unknown>[], regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement tag_role
    throw new Error("tag_role not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "tag_role failed");
  }
}

/** Tag saml provider. */
export async function tagSamlProvider(samlProviderArn: string, tags: Record<string, unknown>[], regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement tag_saml_provider
    throw new Error("tag_saml_provider not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "tag_saml_provider failed");
  }
}

/** Tag server certificate. */
export async function tagServerCertificate(serverCertificateName: string, tags: Record<string, unknown>[], regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement tag_server_certificate
    throw new Error("tag_server_certificate not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "tag_server_certificate failed");
  }
}

/** Tag user. */
export async function tagUser(userName: string, tags: Record<string, unknown>[], regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement tag_user
    throw new Error("tag_user not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "tag_user failed");
  }
}

/** Untag instance profile. */
export async function untagInstanceProfile(instanceProfileName: string, tagKeys: string[], regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement untag_instance_profile
    throw new Error("untag_instance_profile not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "untag_instance_profile failed");
  }
}

/** Untag mfa device. */
export async function untagMfaDevice(serialNumber: string, tagKeys: string[], regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement untag_mfa_device
    throw new Error("untag_mfa_device not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "untag_mfa_device failed");
  }
}

/** Untag open id connect provider. */
export async function untagOpenIdConnectProvider(openIdConnectProviderArn: string, tagKeys: string[], regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement untag_open_id_connect_provider
    throw new Error("untag_open_id_connect_provider not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "untag_open_id_connect_provider failed");
  }
}

/** Untag policy. */
export async function untagPolicy(policyArn: string, tagKeys: string[], regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement untag_policy
    throw new Error("untag_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "untag_policy failed");
  }
}

/** Untag role. */
export async function untagRole(roleName: string, tagKeys: string[], regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement untag_role
    throw new Error("untag_role not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "untag_role failed");
  }
}

/** Untag saml provider. */
export async function untagSamlProvider(samlProviderArn: string, tagKeys: string[], regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement untag_saml_provider
    throw new Error("untag_saml_provider not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "untag_saml_provider failed");
  }
}

/** Untag server certificate. */
export async function untagServerCertificate(serverCertificateName: string, tagKeys: string[], regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement untag_server_certificate
    throw new Error("untag_server_certificate not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "untag_server_certificate failed");
  }
}

/** Untag user. */
export async function untagUser(userName: string, tagKeys: string[], regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement untag_user
    throw new Error("untag_user not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "untag_user failed");
  }
}

/** Update access key. */
export async function updateAccessKey(accessKeyId: string, status: string): Promise<void> {
  try {
    // TODO: implement update_access_key
    throw new Error("update_access_key not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_access_key failed");
  }
}

/** Update account password policy. */
export async function updateAccountPasswordPolicy(): Promise<void> {
  try {
    // TODO: implement update_account_password_policy
    throw new Error("update_account_password_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_account_password_policy failed");
  }
}

/** Update assume role policy. */
export async function updateAssumeRolePolicy(roleName: string, policyDocument: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement update_assume_role_policy
    throw new Error("update_assume_role_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_assume_role_policy failed");
  }
}

/** Update group. */
export async function updateGroup(groupName: string): Promise<void> {
  try {
    // TODO: implement update_group
    throw new Error("update_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_group failed");
  }
}

/** Update login profile. */
export async function updateLoginProfile(userName: string): Promise<void> {
  try {
    // TODO: implement update_login_profile
    throw new Error("update_login_profile not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_login_profile failed");
  }
}

/** Update open id connect provider thumbprint. */
export async function updateOpenIdConnectProviderThumbprint(openIdConnectProviderArn: string, thumbprintList: string[], regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement update_open_id_connect_provider_thumbprint
    throw new Error("update_open_id_connect_provider_thumbprint not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_open_id_connect_provider_thumbprint failed");
  }
}

/** Update role. */
export async function updateRole(roleName: string): Promise<void> {
  try {
    // TODO: implement update_role
    throw new Error("update_role not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_role failed");
  }
}

/** Update role description. */
export async function updateRoleDescription(roleName: string, description: string, regionName?: string | undefined): Promise<UpdateRoleDescriptionResult> {
  try {
    // TODO: implement update_role_description
    throw new Error("update_role_description not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_role_description failed");
  }
}

/** Update saml provider. */
export async function updateSamlProvider(samlProviderArn: string): Promise<UpdateSamlProviderResult> {
  try {
    // TODO: implement update_saml_provider
    throw new Error("update_saml_provider not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_saml_provider failed");
  }
}

/** Update server certificate. */
export async function updateServerCertificate(serverCertificateName: string): Promise<void> {
  try {
    // TODO: implement update_server_certificate
    throw new Error("update_server_certificate not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_server_certificate failed");
  }
}

/** Update service specific credential. */
export async function updateServiceSpecificCredential(serviceSpecificCredentialId: string, status: string): Promise<void> {
  try {
    // TODO: implement update_service_specific_credential
    throw new Error("update_service_specific_credential not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_service_specific_credential failed");
  }
}

/** Update signing certificate. */
export async function updateSigningCertificate(certificateId: string, status: string): Promise<void> {
  try {
    // TODO: implement update_signing_certificate
    throw new Error("update_signing_certificate not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_signing_certificate failed");
  }
}

/** Update ssh public key. */
export async function updateSshPublicKey(userName: string, sshPublicKeyId: string, status: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement update_ssh_public_key
    throw new Error("update_ssh_public_key not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_ssh_public_key failed");
  }
}

/** Update user. */
export async function updateUser(userName: string): Promise<void> {
  try {
    // TODO: implement update_user
    throw new Error("update_user not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_user failed");
  }
}

/** Upload server certificate. */
export async function uploadServerCertificate(serverCertificateName: string, certificateBody: string, privateKey: string): Promise<UploadServerCertificateResult> {
  try {
    // TODO: implement upload_server_certificate
    throw new Error("upload_server_certificate not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "upload_server_certificate failed");
  }
}

/** Upload signing certificate. */
export async function uploadSigningCertificate(certificateBody: string): Promise<UploadSigningCertificateResult> {
  try {
    // TODO: implement upload_signing_certificate
    throw new Error("upload_signing_certificate not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "upload_signing_certificate failed");
  }
}

/** Upload ssh public key. */
export async function uploadSshPublicKey(userName: string, sshPublicKeyBody: string, regionName?: string | undefined): Promise<UploadSshPublicKeyResult> {
  try {
    // TODO: implement upload_ssh_public_key
    throw new Error("upload_ssh_public_key not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "upload_ssh_public_key failed");
  }
}
