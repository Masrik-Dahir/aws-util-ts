/**
 * aws-util/cognito — High-level Amazon Cognito Identity Provider utilities.
 *
 * Provides typed, ergonomic wrappers around the AWS SDK v3 Cognito Identity
 * Provider client for common admin operations: user CRUD, authentication,
 * group management, and convenience helpers for bulk user creation.
 *
 * All functions obtain a CognitoIdentityProviderClient via {@link getClient}
 * and wrap errors through {@link wrapAwsError}.
 *
 * @module
 */

import { z } from "zod";
import {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  AdminGetUserCommand,
  AdminDeleteUserCommand,
  AdminSetUserPasswordCommand,
  AdminInitiateAuthCommand,
  AdminAddUserToGroupCommand,
  AdminRemoveUserFromGroupCommand,
  ListUsersCommand,
  ListUserPoolsCommand,
  AdminResetUserPasswordCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import type { AuthFlowType } from "@aws-sdk/client-cognito-identity-provider";
import { getClient } from "./client.js";
import { wrapAwsError, AwsNotFoundError } from "./exceptions.js";

// ---------------------------------------------------------------------------
// Zod schemas & inferred types
// ---------------------------------------------------------------------------

/** Schema for a Cognito user. */
export const CognitoUserSchema = z.object({
  username: z.string(),
  userStatus: z.string().optional(),
  enabled: z.boolean().optional(),
  userCreateDate: z.date().optional(),
  attributes: z.record(z.string(), z.string()).optional(),
});
/** A Cognito user. */
export type CognitoUser = z.infer<typeof CognitoUserSchema>;

/** Schema for a Cognito user pool. */
export const CognitoUserPoolSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.string().optional(),
  creationDate: z.date().optional(),
  lastModifiedDate: z.date().optional(),
});
/** A Cognito user pool. */
export type CognitoUserPool = z.infer<typeof CognitoUserPoolSchema>;

/** Schema for an authentication result. */
export const AuthResultSchema = z.object({
  accessToken: z.string(),
  idToken: z.string().optional(),
  refreshToken: z.string().optional(),
  expiresIn: z.number().optional(),
  tokenType: z.string().optional(),
});
/** An authentication result. */
export type AuthResult = z.infer<typeof AuthResultSchema>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Get a cached CognitoIdentityProviderClient for the given region.
 */
function cognito(
  region?: string,
): CognitoIdentityProviderClient {
  return getClient(CognitoIdentityProviderClient, region);
}

/**
 * Convert an array of Cognito user attributes into a flat record.
 */
function attributesToRecord(
  attrs?: Array<{ Name?: string; Value?: string }>,
): Record<string, string> | undefined {
  if (!attrs || attrs.length === 0) {
    return undefined;
  }
  const record: Record<string, string> = {};
  for (const attr of attrs) {
    if (attr.Name) {
      record[attr.Name] = attr.Value ?? "";
    }
  }
  return record;
}

/**
 * Convert a flat record into an array of Cognito user attribute objects.
 */
function recordToAttributes(
  record?: Record<string, string>,
): Array<{ Name: string; Value: string }> | undefined {
  if (!record) {
    return undefined;
  }
  return Object.entries(record).map(([Name, Value]) => ({
    Name,
    Value,
  }));
}

// ---------------------------------------------------------------------------
// Admin user operations
// ---------------------------------------------------------------------------

/**
 * Create a new user in a Cognito user pool using admin privileges.
 *
 * @param userPoolId - The user pool ID.
 * @param username - The username for the new user.
 * @param temporaryPassword - Optional temporary password.
 * @param userAttributes - Optional key-value map of user attributes.
 * @param region - AWS region override.
 * @returns The newly created {@link CognitoUser}.
 */
export async function adminCreateUser(
  userPoolId: string,
  username: string,
  temporaryPassword?: string,
  userAttributes?: Record<string, string>,
  region?: string,
): Promise<CognitoUser> {
  try {
    const resp = await cognito(region).send(
      new AdminCreateUserCommand({
        UserPoolId: userPoolId,
        Username: username,
        ...(temporaryPassword
          ? { TemporaryPassword: temporaryPassword }
          : {}),
        ...(userAttributes
          ? { UserAttributes: recordToAttributes(userAttributes) }
          : {}),
      }),
    );
    const user = resp.User;
    if (!user) {
      throw new Error("AdminCreateUser returned no User");
    }
    return CognitoUserSchema.parse({
      username: user.Username ?? username,
      userStatus: user.UserStatus,
      enabled: user.Enabled,
      userCreateDate: user.UserCreateDate,
      attributes: attributesToRecord(user.Attributes),
    });
  } catch (err) {
    throw wrapAwsError(
      err,
      `adminCreateUser(${userPoolId}, ${username})`,
    );
  }
}

/**
 * Retrieve a user from a Cognito user pool using admin privileges.
 *
 * Returns `null` if the user does not exist rather than throwing.
 *
 * @param userPoolId - The user pool ID.
 * @param username - The username to look up.
 * @param region - AWS region override.
 * @returns The {@link CognitoUser}, or `null` if not found.
 */
export async function adminGetUser(
  userPoolId: string,
  username: string,
  region?: string,
): Promise<CognitoUser | null> {
  try {
    const resp = await cognito(region).send(
      new AdminGetUserCommand({
        UserPoolId: userPoolId,
        Username: username,
      }),
    );
    return CognitoUserSchema.parse({
      username: resp.Username ?? username,
      userStatus: resp.UserStatus,
      enabled: resp.Enabled,
      userCreateDate: resp.UserCreateDate,
      attributes: attributesToRecord(resp.UserAttributes),
    });
  } catch (err) {
    const wrapped = wrapAwsError(
      err,
      `adminGetUser(${userPoolId}, ${username})`,
    );
    if (wrapped instanceof AwsNotFoundError) {
      return null;
    }
    throw wrapped;
  }
}

/**
 * Delete a user from a Cognito user pool using admin privileges.
 *
 * @param userPoolId - The user pool ID.
 * @param username - The username to delete.
 * @param region - AWS region override.
 */
export async function adminDeleteUser(
  userPoolId: string,
  username: string,
  region?: string,
): Promise<void> {
  try {
    await cognito(region).send(
      new AdminDeleteUserCommand({
        UserPoolId: userPoolId,
        Username: username,
      }),
    );
  } catch (err) {
    throw wrapAwsError(
      err,
      `adminDeleteUser(${userPoolId}, ${username})`,
    );
  }
}

/**
 * Set a user's password using admin privileges.
 *
 * @param userPoolId - The user pool ID.
 * @param username - The username whose password to set.
 * @param password - The new password.
 * @param permanent - If `true`, the password is permanent (default `true`).
 * @param region - AWS region override.
 */
export async function adminSetUserPassword(
  userPoolId: string,
  username: string,
  password: string,
  permanent = true,
  region?: string,
): Promise<void> {
  try {
    await cognito(region).send(
      new AdminSetUserPasswordCommand({
        UserPoolId: userPoolId,
        Username: username,
        Password: password,
        Permanent: permanent,
      }),
    );
  } catch (err) {
    throw wrapAwsError(
      err,
      `adminSetUserPassword(${userPoolId}, ${username})`,
    );
  }
}

// ---------------------------------------------------------------------------
// Authentication
// ---------------------------------------------------------------------------

/**
 * Initiate authentication for a user using admin privileges.
 *
 * Uses `ADMIN_USER_PASSWORD_AUTH` by default. The response tokens are
 * extracted and returned as an {@link AuthResult}.
 *
 * @param userPoolId - The user pool ID.
 * @param clientId - The app client ID.
 * @param username - The username to authenticate.
 * @param password - The user's password.
 * @param authFlow - Override auth flow type (default `"ADMIN_USER_PASSWORD_AUTH"`).
 * @param region - AWS region override.
 * @returns The {@link AuthResult} containing tokens.
 */
export async function adminInitiateAuth(
  userPoolId: string,
  clientId: string,
  username: string,
  password: string,
  authFlow?: AuthFlowType | string,
  region?: string,
): Promise<AuthResult> {
  try {
    const resp = await cognito(region).send(
      new AdminInitiateAuthCommand({
        UserPoolId: userPoolId,
        ClientId: clientId,
        AuthFlow:
          (authFlow as AuthFlowType) ?? "ADMIN_USER_PASSWORD_AUTH",
        AuthParameters: {
          USERNAME: username,
          PASSWORD: password,
        },
      }),
    );
    const result = resp.AuthenticationResult;
    if (!result || !result.AccessToken) {
      throw new Error(
        "AdminInitiateAuth returned no AuthenticationResult",
      );
    }
    return AuthResultSchema.parse({
      accessToken: result.AccessToken,
      idToken: result.IdToken,
      refreshToken: result.RefreshToken,
      expiresIn: result.ExpiresIn,
      tokenType: result.TokenType,
    });
  } catch (err) {
    throw wrapAwsError(
      err,
      `adminInitiateAuth(${userPoolId}, ${username})`,
    );
  }
}

// ---------------------------------------------------------------------------
// Group management
// ---------------------------------------------------------------------------

/**
 * Add a user to a group in a Cognito user pool.
 *
 * @param userPoolId - The user pool ID.
 * @param username - The username to add.
 * @param groupName - The group name.
 * @param region - AWS region override.
 */
export async function adminAddUserToGroup(
  userPoolId: string,
  username: string,
  groupName: string,
  region?: string,
): Promise<void> {
  try {
    await cognito(region).send(
      new AdminAddUserToGroupCommand({
        UserPoolId: userPoolId,
        Username: username,
        GroupName: groupName,
      }),
    );
  } catch (err) {
    throw wrapAwsError(
      err,
      `adminAddUserToGroup(${userPoolId}, ${username}, ${groupName})`,
    );
  }
}

/**
 * Remove a user from a group in a Cognito user pool.
 *
 * @param userPoolId - The user pool ID.
 * @param username - The username to remove.
 * @param groupName - The group name.
 * @param region - AWS region override.
 */
export async function adminRemoveUserFromGroup(
  userPoolId: string,
  username: string,
  groupName: string,
  region?: string,
): Promise<void> {
  try {
    await cognito(region).send(
      new AdminRemoveUserFromGroupCommand({
        UserPoolId: userPoolId,
        Username: username,
        GroupName: groupName,
      }),
    );
  } catch (err) {
    throw wrapAwsError(
      err,
      `adminRemoveUserFromGroup(${userPoolId}, ${username}, ${groupName})`,
    );
  }
}

// ---------------------------------------------------------------------------
// List operations
// ---------------------------------------------------------------------------

/**
 * List users in a Cognito user pool, auto-paginating through all pages.
 *
 * @param userPoolId - The user pool ID.
 * @param filter - Optional filter expression (e.g. `"email = \"user@example.com\""`).
 * @param limit - Maximum number of users per page (default 60, max 60).
 * @param region - AWS region override.
 * @returns An array of {@link CognitoUser} entries.
 */
export async function listUsers(
  userPoolId: string,
  filter?: string,
  limit?: number,
  region?: string,
): Promise<CognitoUser[]> {
  const results: CognitoUser[] = [];
  let paginationToken: string | undefined;

  try {
    do {
      const resp = await cognito(region).send(
        new ListUsersCommand({
          UserPoolId: userPoolId,
          ...(filter ? { Filter: filter } : {}),
          ...(limit ? { Limit: Math.min(limit, 60) } : {}),
          ...(paginationToken
            ? { PaginationToken: paginationToken }
            : {}),
        }),
      );
      for (const user of resp.Users ?? []) {
        results.push(
          CognitoUserSchema.parse({
            username: user.Username ?? "",
            userStatus: user.UserStatus,
            enabled: user.Enabled,
            userCreateDate: user.UserCreateDate,
            attributes: attributesToRecord(user.Attributes),
          }),
        );
      }
      paginationToken = resp.PaginationToken;
    } while (paginationToken);
  } catch (err) {
    throw wrapAwsError(err, `listUsers(${userPoolId})`);
  }

  return results;
}

/**
 * List Cognito user pools, auto-paginating through all pages.
 *
 * @param maxResults - Maximum number of pools per page (default 60, max 60).
 * @param region - AWS region override.
 * @returns An array of {@link CognitoUserPool} entries.
 */
export async function listUserPools(
  maxResults?: number,
  region?: string,
): Promise<CognitoUserPool[]> {
  const results: CognitoUserPool[] = [];
  let nextToken: string | undefined;

  try {
    do {
      const resp = await cognito(region).send(
        new ListUserPoolsCommand({
          MaxResults: maxResults ?? 60,
          ...(nextToken ? { NextToken: nextToken } : {}),
        }),
      );
      for (const pool of resp.UserPools ?? []) {
        results.push(
          CognitoUserPoolSchema.parse({
            id: pool.Id ?? "",
            name: pool.Name ?? "",
            status: pool.Status,
            creationDate: pool.CreationDate,
            lastModifiedDate: pool.LastModifiedDate,
          }),
        );
      }
      nextToken = resp.NextToken;
    } while (nextToken);
  } catch (err) {
    throw wrapAwsError(err, "listUserPools");
  }

  return results;
}

// ---------------------------------------------------------------------------
// Compound operations
// ---------------------------------------------------------------------------

/**
 * Get an existing user or create one if not found.
 *
 * Attempts to retrieve the user first. If the user does not exist,
 * creates a new one with the given attributes.
 *
 * @param userPoolId - The user pool ID.
 * @param username - The username.
 * @param temporaryPassword - Optional temporary password (used only on creation).
 * @param userAttributes - Optional user attributes (used only on creation).
 * @param region - AWS region override.
 * @returns The existing or newly created {@link CognitoUser}.
 */
export async function getOrCreateUser(
  userPoolId: string,
  username: string,
  temporaryPassword?: string,
  userAttributes?: Record<string, string>,
  region?: string,
): Promise<CognitoUser> {
  const existing = await adminGetUser(
    userPoolId,
    username,
    region,
  );
  if (existing) {
    return existing;
  }
  return adminCreateUser(
    userPoolId,
    username,
    temporaryPassword,
    userAttributes,
    region,
  );
}

/** Descriptor for a user to create in {@link bulkCreateUsers}. */
export interface BulkUserDescriptor {
  username: string;
  password?: string;
  attributes?: Record<string, string>;
}

/** Result of a single user creation within {@link bulkCreateUsers}. */
export interface BulkCreateError {
  username: string;
  error: Error;
}

/**
 * Create multiple users in a Cognito user pool sequentially.
 *
 * Users are created one at a time. Failures are collected rather than
 * aborting the entire batch. Successfully created users are returned;
 * errors are available via the `errors` property on the result array.
 *
 * @param userPoolId - The user pool ID.
 * @param users - Array of user descriptors.
 * @param region - AWS region override.
 * @returns An array of successfully created {@link CognitoUser} entries.
 *   The array has an `errors` property with any individual failures.
 */
export async function bulkCreateUsers(
  userPoolId: string,
  users: BulkUserDescriptor[],
  region?: string,
): Promise<CognitoUser[]> {
  const results: CognitoUser[] = [];
  const errors: BulkCreateError[] = [];

  for (const userDesc of users) {
    try {
      const user = await adminCreateUser(
        userPoolId,
        userDesc.username,
        userDesc.password,
        userDesc.attributes,
        region,
      );
      results.push(user);
    } catch (err) {
      errors.push({
        username: userDesc.username,
        error:
          err instanceof Error ? err : new Error(String(err)),
      });
    }
  }

  // Attach errors as a non-enumerable property so callers can inspect them
  Object.defineProperty(results, "errors", {
    value: errors,
    writable: false,
    enumerable: false,
    configurable: false,
  });

  return results;
}

/**
 * Reset a user's password in a Cognito user pool.
 *
 * Sends a password reset notification to the user. The user will need to
 * complete the reset flow (e.g. via a confirmation code).
 *
 * @param userPoolId - The user pool ID.
 * @param username - The username whose password to reset.
 * @param region - AWS region override.
 */
export async function resetUserPassword(
  userPoolId: string,
  username: string,
  region?: string,
): Promise<void> {
  try {
    await cognito(region).send(
      new AdminResetUserPasswordCommand({
        UserPoolId: userPoolId,
        Username: username,
      }),
    );
  } catch (err) {
    throw wrapAwsError(
      err,
      `resetUserPassword(${userPoolId}, ${username})`,
    );
  }
}

// ---------------------------------------------------------------------------
// Additional types (auto-generated)
// ---------------------------------------------------------------------------

/** Result of admin_get_device. */
export type AdminGetDeviceResult = {
  device?: Record<string, unknown>;
};

/** Result of admin_list_devices. */
export type AdminListDevicesResult = {
  devices?: Record<string, unknown>[];
  paginationToken?: string | undefined;
};

/** Result of admin_list_groups_for_user. */
export type AdminListGroupsForUserResult = {
  groups?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of admin_list_user_auth_events. */
export type AdminListUserAuthEventsResult = {
  authEvents?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of admin_respond_to_auth_challenge. */
export type AdminRespondToAuthChallengeResult = {
  challengeName?: string | undefined;
  session?: string | undefined;
  challengeParameters?: Record<string, unknown>;
  authenticationResult?: Record<string, unknown>;
};

/** Result of associate_software_token. */
export type AssociateSoftwareTokenResult = {
  secretCode?: string | undefined;
  session?: string | undefined;
};

/** Result of confirm_device. */
export type ConfirmDeviceResult = {
  userConfirmationNecessary?: boolean | undefined;
};

/** Result of confirm_sign_up. */
export type ConfirmSignUpResult = {
  session?: string | undefined;
};

/** Result of create_group. */
export type CreateGroupResult = {
  group?: Record<string, unknown>;
};

/** Result of create_identity_provider. */
export type CreateIdentityProviderResult = {
  identityProvider?: Record<string, unknown>;
};

/** Result of create_managed_login_branding. */
export type CreateManagedLoginBrandingResult = {
  managedLoginBranding?: Record<string, unknown>;
};

/** Result of create_resource_server. */
export type CreateResourceServerResult = {
  resourceServer?: Record<string, unknown>;
};

/** Result of create_terms. */
export type CreateTermsResult = {
  terms?: Record<string, unknown>;
};

/** Result of create_user_import_job. */
export type CreateUserImportJobResult = {
  userImportJob?: Record<string, unknown>;
};

/** Result of create_user_pool. */
export type CreateUserPoolResult = {
  userPool?: Record<string, unknown>;
};

/** Result of create_user_pool_client. */
export type CreateUserPoolClientResult = {
  userPoolClient?: Record<string, unknown>;
};

/** Result of create_user_pool_domain. */
export type CreateUserPoolDomainResult = {
  managedLoginVersion?: number | undefined;
  cloudFrontDomain?: string | undefined;
};

/** Result of describe_identity_provider. */
export type DescribeIdentityProviderResult = {
  identityProvider?: Record<string, unknown>;
};

/** Result of describe_managed_login_branding. */
export type DescribeManagedLoginBrandingResult = {
  managedLoginBranding?: Record<string, unknown>;
};

/** Result of describe_managed_login_branding_by_client. */
export type DescribeManagedLoginBrandingByClientResult = {
  managedLoginBranding?: Record<string, unknown>;
};

/** Result of describe_resource_server. */
export type DescribeResourceServerResult = {
  resourceServer?: Record<string, unknown>;
};

/** Result of describe_risk_configuration. */
export type DescribeRiskConfigurationResult = {
  riskConfiguration?: Record<string, unknown>;
};

/** Result of describe_terms. */
export type DescribeTermsResult = {
  terms?: Record<string, unknown>;
};

/** Result of describe_user_import_job. */
export type DescribeUserImportJobResult = {
  userImportJob?: Record<string, unknown>;
};

/** Result of describe_user_pool. */
export type DescribeUserPoolResult = {
  userPool?: Record<string, unknown>;
};

/** Result of describe_user_pool_client. */
export type DescribeUserPoolClientResult = {
  userPoolClient?: Record<string, unknown>;
};

/** Result of describe_user_pool_domain. */
export type DescribeUserPoolDomainResult = {
  domainDescription?: Record<string, unknown>;
};

/** Result of forgot_password. */
export type ForgotPasswordResult = {
  codeDeliveryDetails?: Record<string, unknown>;
};

/** Result of get_csv_header. */
export type GetCsvHeaderResult = {
  userPoolId?: string | undefined;
  csvHeader?: string[];
};

/** Result of get_device. */
export type GetDeviceResult = {
  device?: Record<string, unknown>;
};

/** Result of get_group. */
export type GetGroupResult = {
  group?: Record<string, unknown>;
};

/** Result of get_identity_provider_by_identifier. */
export type GetIdentityProviderByIdentifierResult = {
  identityProvider?: Record<string, unknown>;
};

/** Result of get_log_delivery_configuration. */
export type GetLogDeliveryConfigurationResult = {
  logDeliveryConfiguration?: Record<string, unknown>;
};

/** Result of get_signing_certificate. */
export type GetSigningCertificateResult = {
  certificate?: string | undefined;
};

/** Result of get_tokens_from_refresh_token. */
export type GetTokensFromRefreshTokenResult = {
  authenticationResult?: Record<string, unknown>;
};

/** Result of get_ui_customization. */
export type GetUiCustomizationResult = {
  uiCustomization?: Record<string, unknown>;
};

/** Result of get_user. */
export type GetUserResult = {
  username?: string | undefined;
  userAttributes?: Record<string, unknown>[];
  mfaOptions?: Record<string, unknown>[];
  preferredMfaSetting?: string | undefined;
  userMfaSettingList?: string[];
};

/** Result of get_user_attribute_verification_code. */
export type GetUserAttributeVerificationCodeResult = {
  codeDeliveryDetails?: Record<string, unknown>;
};

/** Result of get_user_auth_factors. */
export type GetUserAuthFactorsResult = {
  username?: string | undefined;
  preferredMfaSetting?: string | undefined;
  userMfaSettingList?: string[];
  configuredUserAuthFactors?: string[];
};

/** Result of get_user_pool_mfa_config. */
export type GetUserPoolMfaConfigResult = {
  smsMfaConfiguration?: Record<string, unknown>;
  softwareTokenMfaConfiguration?: Record<string, unknown>;
  emailMfaConfiguration?: Record<string, unknown>;
  mfaConfiguration?: string | undefined;
  webAuthnConfiguration?: Record<string, unknown>;
};

/** Result of initiate_auth. */
export type InitiateAuthResult = {
  challengeName?: string | undefined;
  session?: string | undefined;
  challengeParameters?: Record<string, unknown>;
  authenticationResult?: Record<string, unknown>;
  availableChallenges?: string[];
};

/** Result of list_devices. */
export type ListDevicesResult = {
  devices?: Record<string, unknown>[];
  paginationToken?: string | undefined;
};

/** Result of list_groups. */
export type ListGroupsResult = {
  groups?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_identity_providers. */
export type ListIdentityProvidersResult = {
  providers?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_resource_servers. */
export type ListResourceServersResult = {
  resourceServers?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_tags_for_resource. */
export type ListTagsForResourceResult = {
  tags?: Record<string, unknown>;
};

/** Result of list_terms. */
export type ListTermsResult = {
  terms?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_user_import_jobs. */
export type ListUserImportJobsResult = {
  userImportJobs?: Record<string, unknown>[];
  paginationToken?: string | undefined;
};

/** Result of list_user_pool_clients. */
export type ListUserPoolClientsResult = {
  userPoolClients?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_users_in_group. */
export type ListUsersInGroupResult = {
  users?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_web_authn_credentials. */
export type ListWebAuthnCredentialsResult = {
  credentials?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of resend_confirmation_code. */
export type ResendConfirmationCodeResult = {
  codeDeliveryDetails?: Record<string, unknown>;
};

/** Result of respond_to_auth_challenge. */
export type RespondToAuthChallengeResult = {
  challengeName?: string | undefined;
  session?: string | undefined;
  challengeParameters?: Record<string, unknown>;
  authenticationResult?: Record<string, unknown>;
};

/** Result of set_log_delivery_configuration. */
export type SetLogDeliveryConfigurationResult = {
  logDeliveryConfiguration?: Record<string, unknown>;
};

/** Result of set_risk_configuration. */
export type SetRiskConfigurationResult = {
  riskConfiguration?: Record<string, unknown>;
};

/** Result of set_ui_customization. */
export type SetUiCustomizationResult = {
  uiCustomization?: Record<string, unknown>;
};

/** Result of set_user_pool_mfa_config. */
export type SetUserPoolMfaConfigResult = {
  smsMfaConfiguration?: Record<string, unknown>;
  softwareTokenMfaConfiguration?: Record<string, unknown>;
  emailMfaConfiguration?: Record<string, unknown>;
  mfaConfiguration?: string | undefined;
  webAuthnConfiguration?: Record<string, unknown>;
};

/** Result of sign_up. */
export type SignUpResult = {
  userConfirmed?: boolean | undefined;
  codeDeliveryDetails?: Record<string, unknown>;
  userSub?: string | undefined;
  session?: string | undefined;
};

/** Result of start_user_import_job. */
export type StartUserImportJobResult = {
  userImportJob?: Record<string, unknown>;
};

/** Result of start_web_authn_registration. */
export type StartWebAuthnRegistrationResult = {
  credentialCreationOptions?: Record<string, unknown>;
};

/** Result of stop_user_import_job. */
export type StopUserImportJobResult = {
  userImportJob?: Record<string, unknown>;
};

/** Result of update_group. */
export type UpdateGroupResult = {
  group?: Record<string, unknown>;
};

/** Result of update_identity_provider. */
export type UpdateIdentityProviderResult = {
  identityProvider?: Record<string, unknown>;
};

/** Result of update_managed_login_branding. */
export type UpdateManagedLoginBrandingResult = {
  managedLoginBranding?: Record<string, unknown>;
};

/** Result of update_resource_server. */
export type UpdateResourceServerResult = {
  resourceServer?: Record<string, unknown>;
};

/** Result of update_terms. */
export type UpdateTermsResult = {
  terms?: Record<string, unknown>;
};

/** Result of update_user_attributes. */
export type UpdateUserAttributesResult = {
  codeDeliveryDetailsList?: Record<string, unknown>[];
};

/** Result of update_user_pool_client. */
export type UpdateUserPoolClientResult = {
  userPoolClient?: Record<string, unknown>;
};

/** Result of update_user_pool_domain. */
export type UpdateUserPoolDomainResult = {
  managedLoginVersion?: number | undefined;
  cloudFrontDomain?: string | undefined;
};

/** Result of verify_software_token. */
export type VerifySoftwareTokenResult = {
  status?: string | undefined;
  session?: string | undefined;
};


// ---------------------------------------------------------------------------
// Additional functions (auto-generated)
// ---------------------------------------------------------------------------

/** Add custom attributes. */
export async function addCustomAttributes(userPoolId: string, customAttributes: Record<string, unknown>[], regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement add_custom_attributes
    throw new Error("add_custom_attributes not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "add_custom_attributes failed");
  }
}

/** Admin confirm sign up. */
export async function adminConfirmSignUp(userPoolId: string, username: string): Promise<void> {
  try {
    // TODO: implement admin_confirm_sign_up
    throw new Error("admin_confirm_sign_up not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "admin_confirm_sign_up failed");
  }
}

/** Admin delete user attributes. */
export async function adminDeleteUserAttributes(userPoolId: string, username: string, userAttributeNames: string[], regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement admin_delete_user_attributes
    throw new Error("admin_delete_user_attributes not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "admin_delete_user_attributes failed");
  }
}

/** Admin disable provider for user. */
export async function adminDisableProviderForUser(userPoolId: string, user: Record<string, unknown>, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement admin_disable_provider_for_user
    throw new Error("admin_disable_provider_for_user not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "admin_disable_provider_for_user failed");
  }
}

/** Admin disable user. */
export async function adminDisableUser(userPoolId: string, username: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement admin_disable_user
    throw new Error("admin_disable_user not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "admin_disable_user failed");
  }
}

/** Admin enable user. */
export async function adminEnableUser(userPoolId: string, username: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement admin_enable_user
    throw new Error("admin_enable_user not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "admin_enable_user failed");
  }
}

/** Admin forget device. */
export async function adminForgetDevice(userPoolId: string, username: string, deviceKey: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement admin_forget_device
    throw new Error("admin_forget_device not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "admin_forget_device failed");
  }
}

/** Admin get device. */
export async function adminGetDevice(deviceKey: string, userPoolId: string, username: string, regionName?: string | undefined): Promise<AdminGetDeviceResult> {
  try {
    // TODO: implement admin_get_device
    throw new Error("admin_get_device not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "admin_get_device failed");
  }
}

/** Admin link provider for user. */
export async function adminLinkProviderForUser(userPoolId: string, destinationUser: Record<string, unknown>, sourceUser: Record<string, unknown>, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement admin_link_provider_for_user
    throw new Error("admin_link_provider_for_user not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "admin_link_provider_for_user failed");
  }
}

/** Admin list devices. */
export async function adminListDevices(userPoolId: string, username: string): Promise<AdminListDevicesResult> {
  try {
    // TODO: implement admin_list_devices
    throw new Error("admin_list_devices not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "admin_list_devices failed");
  }
}

/** Admin list groups for user. */
export async function adminListGroupsForUser(username: string, userPoolId: string): Promise<AdminListGroupsForUserResult> {
  try {
    // TODO: implement admin_list_groups_for_user
    throw new Error("admin_list_groups_for_user not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "admin_list_groups_for_user failed");
  }
}

/** Admin list user auth events. */
export async function adminListUserAuthEvents(userPoolId: string, username: string): Promise<AdminListUserAuthEventsResult> {
  try {
    // TODO: implement admin_list_user_auth_events
    throw new Error("admin_list_user_auth_events not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "admin_list_user_auth_events failed");
  }
}

/** Admin reset user password. */
export async function adminResetUserPassword(userPoolId: string, username: string): Promise<void> {
  try {
    // TODO: implement admin_reset_user_password
    throw new Error("admin_reset_user_password not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "admin_reset_user_password failed");
  }
}

/** Admin respond to auth challenge. */
export async function adminRespondToAuthChallenge(userPoolId: string, clientId: string, challengeName: string): Promise<AdminRespondToAuthChallengeResult> {
  try {
    // TODO: implement admin_respond_to_auth_challenge
    throw new Error("admin_respond_to_auth_challenge not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "admin_respond_to_auth_challenge failed");
  }
}

/** Admin set user mfa preference. */
export async function adminSetUserMfaPreference(username: string, userPoolId: string): Promise<void> {
  try {
    // TODO: implement admin_set_user_mfa_preference
    throw new Error("admin_set_user_mfa_preference not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "admin_set_user_mfa_preference failed");
  }
}

/** Admin set user settings. */
export async function adminSetUserSettings(userPoolId: string, username: string, mfaOptions: Record<string, unknown>[], regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement admin_set_user_settings
    throw new Error("admin_set_user_settings not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "admin_set_user_settings failed");
  }
}

/** Admin update auth event feedback. */
export async function adminUpdateAuthEventFeedback(userPoolId: string, username: string, eventId: string, feedbackValue: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement admin_update_auth_event_feedback
    throw new Error("admin_update_auth_event_feedback not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "admin_update_auth_event_feedback failed");
  }
}

/** Admin update device status. */
export async function adminUpdateDeviceStatus(userPoolId: string, username: string, deviceKey: string): Promise<void> {
  try {
    // TODO: implement admin_update_device_status
    throw new Error("admin_update_device_status not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "admin_update_device_status failed");
  }
}

/** Admin update user attributes. */
export async function adminUpdateUserAttributes(userPoolId: string, username: string, userAttributes: Record<string, unknown>[]): Promise<void> {
  try {
    // TODO: implement admin_update_user_attributes
    throw new Error("admin_update_user_attributes not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "admin_update_user_attributes failed");
  }
}

/** Admin user global sign out. */
export async function adminUserGlobalSignOut(userPoolId: string, username: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement admin_user_global_sign_out
    throw new Error("admin_user_global_sign_out not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "admin_user_global_sign_out failed");
  }
}

/** Associate software token. */
export async function associateSoftwareToken(): Promise<AssociateSoftwareTokenResult> {
  try {
    // TODO: implement associate_software_token
    throw new Error("associate_software_token not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "associate_software_token failed");
  }
}

/** Change password. */
export async function changePassword(proposedPassword: string, accessToken: string): Promise<void> {
  try {
    // TODO: implement change_password
    throw new Error("change_password not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "change_password failed");
  }
}

/** Complete web authn registration. */
export async function completeWebAuthnRegistration(accessToken: string, credential: Record<string, unknown>, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement complete_web_authn_registration
    throw new Error("complete_web_authn_registration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "complete_web_authn_registration failed");
  }
}

/** Confirm device. */
export async function confirmDevice(accessToken: string, deviceKey: string): Promise<ConfirmDeviceResult> {
  try {
    // TODO: implement confirm_device
    throw new Error("confirm_device not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "confirm_device failed");
  }
}

/** Confirm forgot password. */
export async function confirmForgotPassword(clientId: string, username: string, confirmationCode: string, password: string): Promise<void> {
  try {
    // TODO: implement confirm_forgot_password
    throw new Error("confirm_forgot_password not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "confirm_forgot_password failed");
  }
}

/** Confirm sign up. */
export async function confirmSignUp(clientId: string, username: string, confirmationCode: string): Promise<ConfirmSignUpResult> {
  try {
    // TODO: implement confirm_sign_up
    throw new Error("confirm_sign_up not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "confirm_sign_up failed");
  }
}

/** Create group. */
export async function createGroup(groupName: string, userPoolId: string): Promise<CreateGroupResult> {
  try {
    // TODO: implement create_group
    throw new Error("create_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_group failed");
  }
}

/** Create identity provider. */
export async function createIdentityProvider(userPoolId: string, providerName: string, providerType: string, providerDetails: Record<string, unknown>): Promise<CreateIdentityProviderResult> {
  try {
    // TODO: implement create_identity_provider
    throw new Error("create_identity_provider not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_identity_provider failed");
  }
}

/** Create managed login branding. */
export async function createManagedLoginBranding(userPoolId: string, clientId: string): Promise<CreateManagedLoginBrandingResult> {
  try {
    // TODO: implement create_managed_login_branding
    throw new Error("create_managed_login_branding not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_managed_login_branding failed");
  }
}

/** Create resource server. */
export async function createResourceServer(userPoolId: string, identifier: string, name: string): Promise<CreateResourceServerResult> {
  try {
    // TODO: implement create_resource_server
    throw new Error("create_resource_server not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_resource_server failed");
  }
}

/** Create terms. */
export async function createTerms(userPoolId: string, clientId: string, termsName: string, termsSource: string, enforcement: string): Promise<CreateTermsResult> {
  try {
    // TODO: implement create_terms
    throw new Error("create_terms not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_terms failed");
  }
}

/** Create user import job. */
export async function createUserImportJob(jobName: string, userPoolId: string, cloudWatchLogsRoleArn: string, regionName?: string | undefined): Promise<CreateUserImportJobResult> {
  try {
    // TODO: implement create_user_import_job
    throw new Error("create_user_import_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_user_import_job failed");
  }
}

/** Create user pool. */
export async function createUserPool(poolName: string): Promise<CreateUserPoolResult> {
  try {
    // TODO: implement create_user_pool
    throw new Error("create_user_pool not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_user_pool failed");
  }
}

/** Create user pool client. */
export async function createUserPoolClient(userPoolId: string, clientName: string): Promise<CreateUserPoolClientResult> {
  try {
    // TODO: implement create_user_pool_client
    throw new Error("create_user_pool_client not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_user_pool_client failed");
  }
}

/** Create user pool domain. */
export async function createUserPoolDomain(domain: string, userPoolId: string): Promise<CreateUserPoolDomainResult> {
  try {
    // TODO: implement create_user_pool_domain
    throw new Error("create_user_pool_domain not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_user_pool_domain failed");
  }
}

/** Delete group. */
export async function deleteGroup(groupName: string, userPoolId: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_group
    throw new Error("delete_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_group failed");
  }
}

/** Delete identity provider. */
export async function deleteIdentityProvider(userPoolId: string, providerName: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_identity_provider
    throw new Error("delete_identity_provider not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_identity_provider failed");
  }
}

/** Delete managed login branding. */
export async function deleteManagedLoginBranding(managedLoginBrandingId: string, userPoolId: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_managed_login_branding
    throw new Error("delete_managed_login_branding not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_managed_login_branding failed");
  }
}

/** Delete resource server. */
export async function deleteResourceServer(userPoolId: string, identifier: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_resource_server
    throw new Error("delete_resource_server not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_resource_server failed");
  }
}

/** Delete terms. */
export async function deleteTerms(termsId: string, userPoolId: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_terms
    throw new Error("delete_terms not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_terms failed");
  }
}

/** Delete user. */
export async function deleteUser(accessToken: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_user
    throw new Error("delete_user not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_user failed");
  }
}

/** Delete user attributes. */
export async function deleteUserAttributes(userAttributeNames: string[], accessToken: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_user_attributes
    throw new Error("delete_user_attributes not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_user_attributes failed");
  }
}

/** Delete user pool. */
export async function deleteUserPool(userPoolId: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_user_pool
    throw new Error("delete_user_pool not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_user_pool failed");
  }
}

/** Delete user pool client. */
export async function deleteUserPoolClient(userPoolId: string, clientId: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_user_pool_client
    throw new Error("delete_user_pool_client not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_user_pool_client failed");
  }
}

/** Delete user pool domain. */
export async function deleteUserPoolDomain(domain: string, userPoolId: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_user_pool_domain
    throw new Error("delete_user_pool_domain not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_user_pool_domain failed");
  }
}

/** Delete web authn credential. */
export async function deleteWebAuthnCredential(accessToken: string, credentialId: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_web_authn_credential
    throw new Error("delete_web_authn_credential not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_web_authn_credential failed");
  }
}

/** Describe identity provider. */
export async function describeIdentityProvider(userPoolId: string, providerName: string, regionName?: string | undefined): Promise<DescribeIdentityProviderResult> {
  try {
    // TODO: implement describe_identity_provider
    throw new Error("describe_identity_provider not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_identity_provider failed");
  }
}

/** Describe managed login branding. */
export async function describeManagedLoginBranding(userPoolId: string, managedLoginBrandingId: string): Promise<DescribeManagedLoginBrandingResult> {
  try {
    // TODO: implement describe_managed_login_branding
    throw new Error("describe_managed_login_branding not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_managed_login_branding failed");
  }
}

/** Describe managed login branding by client. */
export async function describeManagedLoginBrandingByClient(userPoolId: string, clientId: string): Promise<DescribeManagedLoginBrandingByClientResult> {
  try {
    // TODO: implement describe_managed_login_branding_by_client
    throw new Error("describe_managed_login_branding_by_client not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_managed_login_branding_by_client failed");
  }
}

/** Describe resource server. */
export async function describeResourceServer(userPoolId: string, identifier: string, regionName?: string | undefined): Promise<DescribeResourceServerResult> {
  try {
    // TODO: implement describe_resource_server
    throw new Error("describe_resource_server not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_resource_server failed");
  }
}

/** Describe risk configuration. */
export async function describeRiskConfiguration(userPoolId: string): Promise<DescribeRiskConfigurationResult> {
  try {
    // TODO: implement describe_risk_configuration
    throw new Error("describe_risk_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_risk_configuration failed");
  }
}

/** Describe terms. */
export async function describeTerms(termsId: string, userPoolId: string, regionName?: string | undefined): Promise<DescribeTermsResult> {
  try {
    // TODO: implement describe_terms
    throw new Error("describe_terms not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_terms failed");
  }
}

/** Describe user import job. */
export async function describeUserImportJob(userPoolId: string, jobId: string, regionName?: string | undefined): Promise<DescribeUserImportJobResult> {
  try {
    // TODO: implement describe_user_import_job
    throw new Error("describe_user_import_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_user_import_job failed");
  }
}

/** Describe user pool. */
export async function describeUserPool(userPoolId: string, regionName?: string | undefined): Promise<DescribeUserPoolResult> {
  try {
    // TODO: implement describe_user_pool
    throw new Error("describe_user_pool not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_user_pool failed");
  }
}

/** Describe user pool client. */
export async function describeUserPoolClient(userPoolId: string, clientId: string, regionName?: string | undefined): Promise<DescribeUserPoolClientResult> {
  try {
    // TODO: implement describe_user_pool_client
    throw new Error("describe_user_pool_client not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_user_pool_client failed");
  }
}

/** Describe user pool domain. */
export async function describeUserPoolDomain(domain: string, regionName?: string | undefined): Promise<DescribeUserPoolDomainResult> {
  try {
    // TODO: implement describe_user_pool_domain
    throw new Error("describe_user_pool_domain not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_user_pool_domain failed");
  }
}

/** Forget device. */
export async function forgetDevice(deviceKey: string): Promise<void> {
  try {
    // TODO: implement forget_device
    throw new Error("forget_device not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "forget_device failed");
  }
}

/** Forgot password. */
export async function forgotPassword(clientId: string, username: string): Promise<ForgotPasswordResult> {
  try {
    // TODO: implement forgot_password
    throw new Error("forgot_password not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "forgot_password failed");
  }
}

/** Get csv header. */
export async function getCsvHeader(userPoolId: string, regionName?: string | undefined): Promise<GetCsvHeaderResult> {
  try {
    // TODO: implement get_csv_header
    throw new Error("get_csv_header not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_csv_header failed");
  }
}

/** Get device. */
export async function getDevice(deviceKey: string): Promise<GetDeviceResult> {
  try {
    // TODO: implement get_device
    throw new Error("get_device not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_device failed");
  }
}

/** Get group. */
export async function getGroup(groupName: string, userPoolId: string, regionName?: string | undefined): Promise<GetGroupResult> {
  try {
    // TODO: implement get_group
    throw new Error("get_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_group failed");
  }
}

/** Get identity provider by identifier. */
export async function getIdentityProviderByIdentifier(userPoolId: string, idpIdentifier: string, regionName?: string | undefined): Promise<GetIdentityProviderByIdentifierResult> {
  try {
    // TODO: implement get_identity_provider_by_identifier
    throw new Error("get_identity_provider_by_identifier not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_identity_provider_by_identifier failed");
  }
}

/** Get log delivery configuration. */
export async function getLogDeliveryConfiguration(userPoolId: string, regionName?: string | undefined): Promise<GetLogDeliveryConfigurationResult> {
  try {
    // TODO: implement get_log_delivery_configuration
    throw new Error("get_log_delivery_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_log_delivery_configuration failed");
  }
}

/** Get signing certificate. */
export async function getSigningCertificate(userPoolId: string, regionName?: string | undefined): Promise<GetSigningCertificateResult> {
  try {
    // TODO: implement get_signing_certificate
    throw new Error("get_signing_certificate not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_signing_certificate failed");
  }
}

/** Get tokens from refresh token. */
export async function getTokensFromRefreshToken(refreshToken: string, clientId: string): Promise<GetTokensFromRefreshTokenResult> {
  try {
    // TODO: implement get_tokens_from_refresh_token
    throw new Error("get_tokens_from_refresh_token not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_tokens_from_refresh_token failed");
  }
}

/** Get ui customization. */
export async function getUiCustomization(userPoolId: string): Promise<GetUiCustomizationResult> {
  try {
    // TODO: implement get_ui_customization
    throw new Error("get_ui_customization not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_ui_customization failed");
  }
}

/** Get user. */
export async function getUser(accessToken: string, regionName?: string | undefined): Promise<GetUserResult> {
  try {
    // TODO: implement get_user
    throw new Error("get_user not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_user failed");
  }
}

/** Get user attribute verification code. */
export async function getUserAttributeVerificationCode(accessToken: string, attributeName: string): Promise<GetUserAttributeVerificationCodeResult> {
  try {
    // TODO: implement get_user_attribute_verification_code
    throw new Error("get_user_attribute_verification_code not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_user_attribute_verification_code failed");
  }
}

/** Get user auth factors. */
export async function getUserAuthFactors(accessToken: string, regionName?: string | undefined): Promise<GetUserAuthFactorsResult> {
  try {
    // TODO: implement get_user_auth_factors
    throw new Error("get_user_auth_factors not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_user_auth_factors failed");
  }
}

/** Get user pool mfa config. */
export async function getUserPoolMfaConfig(userPoolId: string, regionName?: string | undefined): Promise<GetUserPoolMfaConfigResult> {
  try {
    // TODO: implement get_user_pool_mfa_config
    throw new Error("get_user_pool_mfa_config not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_user_pool_mfa_config failed");
  }
}

/** Global sign out. */
export async function globalSignOut(accessToken: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement global_sign_out
    throw new Error("global_sign_out not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "global_sign_out failed");
  }
}

/** Initiate auth. */
export async function initiateAuth(authFlow: string, clientId: string): Promise<InitiateAuthResult> {
  try {
    // TODO: implement initiate_auth
    throw new Error("initiate_auth not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "initiate_auth failed");
  }
}

/** List devices. */
export async function listDevices(accessToken: string): Promise<ListDevicesResult> {
  try {
    // TODO: implement list_devices
    throw new Error("list_devices not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_devices failed");
  }
}

/** List groups. */
export async function listGroups(userPoolId: string): Promise<ListGroupsResult> {
  try {
    // TODO: implement list_groups
    throw new Error("list_groups not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_groups failed");
  }
}

/** List identity providers. */
export async function listIdentityProviders(userPoolId: string): Promise<ListIdentityProvidersResult> {
  try {
    // TODO: implement list_identity_providers
    throw new Error("list_identity_providers not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_identity_providers failed");
  }
}

/** List resource servers. */
export async function listResourceServers(userPoolId: string): Promise<ListResourceServersResult> {
  try {
    // TODO: implement list_resource_servers
    throw new Error("list_resource_servers not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_resource_servers failed");
  }
}

/** List tags for resource. */
export async function listTagsForResource(resourceArn: string, regionName?: string | undefined): Promise<ListTagsForResourceResult> {
  try {
    // TODO: implement list_tags_for_resource
    throw new Error("list_tags_for_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_tags_for_resource failed");
  }
}

/** List terms. */
export async function listTerms(userPoolId: string): Promise<ListTermsResult> {
  try {
    // TODO: implement list_terms
    throw new Error("list_terms not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_terms failed");
  }
}

/** List user import jobs. */
export async function listUserImportJobs(userPoolId: string, maxResults: number): Promise<ListUserImportJobsResult> {
  try {
    // TODO: implement list_user_import_jobs
    throw new Error("list_user_import_jobs not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_user_import_jobs failed");
  }
}

/** List user pool clients. */
export async function listUserPoolClients(userPoolId: string): Promise<ListUserPoolClientsResult> {
  try {
    // TODO: implement list_user_pool_clients
    throw new Error("list_user_pool_clients not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_user_pool_clients failed");
  }
}

/** List users in group. */
export async function listUsersInGroup(userPoolId: string, groupName: string): Promise<ListUsersInGroupResult> {
  try {
    // TODO: implement list_users_in_group
    throw new Error("list_users_in_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_users_in_group failed");
  }
}

/** List web authn credentials. */
export async function listWebAuthnCredentials(accessToken: string): Promise<ListWebAuthnCredentialsResult> {
  try {
    // TODO: implement list_web_authn_credentials
    throw new Error("list_web_authn_credentials not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_web_authn_credentials failed");
  }
}

/** Resend confirmation code. */
export async function resendConfirmationCode(clientId: string, username: string): Promise<ResendConfirmationCodeResult> {
  try {
    // TODO: implement resend_confirmation_code
    throw new Error("resend_confirmation_code not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "resend_confirmation_code failed");
  }
}

/** Respond to auth challenge. */
export async function respondToAuthChallenge(clientId: string, challengeName: string): Promise<RespondToAuthChallengeResult> {
  try {
    // TODO: implement respond_to_auth_challenge
    throw new Error("respond_to_auth_challenge not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "respond_to_auth_challenge failed");
  }
}

/** Revoke token. */
export async function revokeToken(token: string, clientId: string): Promise<void> {
  try {
    // TODO: implement revoke_token
    throw new Error("revoke_token not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "revoke_token failed");
  }
}

/** Set log delivery configuration. */
export async function setLogDeliveryConfiguration(userPoolId: string, logConfigurations: Record<string, unknown>[], regionName?: string | undefined): Promise<SetLogDeliveryConfigurationResult> {
  try {
    // TODO: implement set_log_delivery_configuration
    throw new Error("set_log_delivery_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "set_log_delivery_configuration failed");
  }
}

/** Set risk configuration. */
export async function setRiskConfiguration(userPoolId: string): Promise<SetRiskConfigurationResult> {
  try {
    // TODO: implement set_risk_configuration
    throw new Error("set_risk_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "set_risk_configuration failed");
  }
}

/** Set ui customization. */
export async function setUiCustomization(userPoolId: string): Promise<SetUiCustomizationResult> {
  try {
    // TODO: implement set_ui_customization
    throw new Error("set_ui_customization not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "set_ui_customization failed");
  }
}

/** Set user mfa preference. */
export async function setUserMfaPreference(accessToken: string): Promise<void> {
  try {
    // TODO: implement set_user_mfa_preference
    throw new Error("set_user_mfa_preference not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "set_user_mfa_preference failed");
  }
}

/** Set user pool mfa config. */
export async function setUserPoolMfaConfig(userPoolId: string): Promise<SetUserPoolMfaConfigResult> {
  try {
    // TODO: implement set_user_pool_mfa_config
    throw new Error("set_user_pool_mfa_config not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "set_user_pool_mfa_config failed");
  }
}

/** Set user settings. */
export async function setUserSettings(accessToken: string, mfaOptions: Record<string, unknown>[], regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement set_user_settings
    throw new Error("set_user_settings not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "set_user_settings failed");
  }
}

/** Sign up. */
export async function signUp(clientId: string, username: string): Promise<SignUpResult> {
  try {
    // TODO: implement sign_up
    throw new Error("sign_up not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "sign_up failed");
  }
}

/** Start user import job. */
export async function startUserImportJob(userPoolId: string, jobId: string, regionName?: string | undefined): Promise<StartUserImportJobResult> {
  try {
    // TODO: implement start_user_import_job
    throw new Error("start_user_import_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_user_import_job failed");
  }
}

/** Start web authn registration. */
export async function startWebAuthnRegistration(accessToken: string, regionName?: string | undefined): Promise<StartWebAuthnRegistrationResult> {
  try {
    // TODO: implement start_web_authn_registration
    throw new Error("start_web_authn_registration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_web_authn_registration failed");
  }
}

/** Stop user import job. */
export async function stopUserImportJob(userPoolId: string, jobId: string, regionName?: string | undefined): Promise<StopUserImportJobResult> {
  try {
    // TODO: implement stop_user_import_job
    throw new Error("stop_user_import_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "stop_user_import_job failed");
  }
}

/** Tag resource. */
export async function tagResource(resourceArn: string, tags: Record<string, unknown>, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement tag_resource
    throw new Error("tag_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "tag_resource failed");
  }
}

/** Untag resource. */
export async function untagResource(resourceArn: string, tagKeys: string[], regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement untag_resource
    throw new Error("untag_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "untag_resource failed");
  }
}

/** Update auth event feedback. */
export async function updateAuthEventFeedback(userPoolId: string, username: string, eventId: string, feedbackToken: string, feedbackValue: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement update_auth_event_feedback
    throw new Error("update_auth_event_feedback not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_auth_event_feedback failed");
  }
}

/** Update device status. */
export async function updateDeviceStatus(accessToken: string, deviceKey: string): Promise<void> {
  try {
    // TODO: implement update_device_status
    throw new Error("update_device_status not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_device_status failed");
  }
}

/** Update group. */
export async function updateGroup(groupName: string, userPoolId: string): Promise<UpdateGroupResult> {
  try {
    // TODO: implement update_group
    throw new Error("update_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_group failed");
  }
}

/** Update identity provider. */
export async function updateIdentityProvider(userPoolId: string, providerName: string): Promise<UpdateIdentityProviderResult> {
  try {
    // TODO: implement update_identity_provider
    throw new Error("update_identity_provider not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_identity_provider failed");
  }
}

/** Update managed login branding. */
export async function updateManagedLoginBranding(): Promise<UpdateManagedLoginBrandingResult> {
  try {
    // TODO: implement update_managed_login_branding
    throw new Error("update_managed_login_branding not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_managed_login_branding failed");
  }
}

/** Update resource server. */
export async function updateResourceServer(userPoolId: string, identifier: string, name: string): Promise<UpdateResourceServerResult> {
  try {
    // TODO: implement update_resource_server
    throw new Error("update_resource_server not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_resource_server failed");
  }
}

/** Update terms. */
export async function updateTerms(termsId: string, userPoolId: string): Promise<UpdateTermsResult> {
  try {
    // TODO: implement update_terms
    throw new Error("update_terms not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_terms failed");
  }
}

/** Update user attributes. */
export async function updateUserAttributes(userAttributes: Record<string, unknown>[], accessToken: string): Promise<UpdateUserAttributesResult> {
  try {
    // TODO: implement update_user_attributes
    throw new Error("update_user_attributes not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_user_attributes failed");
  }
}

/** Update user pool. */
export async function updateUserPool(userPoolId: string): Promise<void> {
  try {
    // TODO: implement update_user_pool
    throw new Error("update_user_pool not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_user_pool failed");
  }
}

/** Update user pool client. */
export async function updateUserPoolClient(userPoolId: string, clientId: string): Promise<UpdateUserPoolClientResult> {
  try {
    // TODO: implement update_user_pool_client
    throw new Error("update_user_pool_client not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_user_pool_client failed");
  }
}

/** Update user pool domain. */
export async function updateUserPoolDomain(domain: string, userPoolId: string): Promise<UpdateUserPoolDomainResult> {
  try {
    // TODO: implement update_user_pool_domain
    throw new Error("update_user_pool_domain not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_user_pool_domain failed");
  }
}

/** Verify software token. */
export async function verifySoftwareToken(userCode: string): Promise<VerifySoftwareTokenResult> {
  try {
    // TODO: implement verify_software_token
    throw new Error("verify_software_token not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "verify_software_token failed");
  }
}

/** Verify user attribute. */
export async function verifyUserAttribute(accessToken: string, attributeName: string, code: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement verify_user_attribute
    throw new Error("verify_user_attribute not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "verify_user_attribute failed");
  }
}
