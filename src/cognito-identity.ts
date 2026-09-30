import { CognitoIdentityClient } from "@aws-sdk/client-cognito-identity";
import { getClient } from "./client";
import { wrapAwsError } from "./exceptions";

/** Metadata for a Cognito Identity pool. */
export type IdentityPoolResult = {
  identityPoolId: string;
  identityPoolName: string;
  allowUnauthenticatedIdentities?: boolean;
  allowClassicFlow?: boolean;
  supportedLoginProviders?: Record<string, unknown>;
  developerProviderName?: string;
  openIdConnectProviderArns?: string[];
  cognitoIdentityProviders?: Record<string, unknown>[];
  samlProviderArns?: string[];
  identityPoolTags?: Record<string, unknown>;
  extra?: Record<string, unknown>;
};

/** Metadata for a Cognito identity. */
export type IdentityResult = {
  identityId: string;
  logins?: string[];
  creationDate?: string;
  lastModifiedDate?: string;
  extra?: Record<string, unknown>;
};

/** Temporary AWS credentials from Cognito Identity. */
export type CredentialsResult = {
  identityId: string;
  accessKeyId?: string;
  secretKey?: string;
  sessionToken?: string;
  expiration?: string;
  extra?: Record<string, unknown>;
};

/** OpenID Connect token from Cognito Identity. */
export type OpenIdTokenResult = {
  identityId: string;
  token?: string;
  extra?: Record<string, unknown>;
};

/** Result of get_identity_pool_roles. */
export type GetIdentityPoolRolesResult = {
  identityPoolId?: string;
  roles?: Record<string, unknown>;
  roleMappings?: Record<string, unknown>;
};

/** Result of get_open_id_token_for_developer_identity. */
export type GetOpenIdTokenForDeveloperIdentityResult = {
  identityId?: string;
  token?: string;
};

/** Result of get_principal_tag_attribute_map. */
export type GetPrincipalTagAttributeMapResult = {
  identityPoolId?: string;
  identityProviderName?: string;
  useDefaults?: boolean;
  principalTags?: Record<string, unknown>;
};

/** Result of list_tags_for_resource. */
export type ListTagsForResourceResult = {
  tags?: Record<string, unknown>;
};

/** Result of lookup_developer_identity. */
export type LookupDeveloperIdentityResult = {
  identityId?: string;
  developerUserIdentifierList?: string[];
  nextToken?: string;
};

/** Result of merge_developer_identities. */
export type MergeDeveloperIdentitiesResult = {
  identityId?: string;
};

/** Result of set_principal_tag_attribute_map. */
export type SetPrincipalTagAttributeMapResult = {
  identityPoolId?: string;
  identityProviderName?: string;
  useDefaults?: boolean;
  principalTags?: Record<string, unknown>;
};

/** Create a new Cognito Identity pool. */
export async function createIdentityPool(identityPoolName: string, allowUnauthenticatedIdentities: boolean): Promise<IdentityPoolResult> {
  try {
    // TODO: implement create_identity_pool
    throw new Error("create_identity_pool not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_identity_pool failed");
  }
}

/** Describe a Cognito Identity pool. */
export async function describeIdentityPool(identityPoolId: string): Promise<IdentityPoolResult> {
  try {
    // TODO: implement describe_identity_pool
    throw new Error("describe_identity_pool not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_identity_pool failed");
  }
}

/** List Cognito Identity pools. */
export async function listIdentityPools(maxResults: number): Promise<IdentityPoolResult[]> {
  try {
    // TODO: implement list_identity_pools
    throw new Error("list_identity_pools not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_identity_pools failed");
  }
}

/** Update a Cognito Identity pool. */
export async function updateIdentityPool(identityPoolId: string, identityPoolName: string, allowUnauthenticatedIdentities: boolean): Promise<IdentityPoolResult> {
  try {
    // TODO: implement update_identity_pool
    throw new Error("update_identity_pool not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_identity_pool failed");
  }
}

/** Delete a Cognito Identity pool. */
export async function deleteIdentityPool(identityPoolId: string): Promise<void> {
  try {
    // TODO: implement delete_identity_pool
    throw new Error("delete_identity_pool not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_identity_pool failed");
  }
}

/** Get or create an identity ID from the identity pool. */
export async function getId(identityPoolId: string): Promise<string> {
  try {
    // TODO: implement get_id
    throw new Error("get_id not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_id failed");
  }
}

/** Get temporary AWS credentials for an identity. */
export async function getCredentialsForIdentity(identityId: string): Promise<CredentialsResult> {
  try {
    // TODO: implement get_credentials_for_identity
    throw new Error("get_credentials_for_identity not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_credentials_for_identity failed");
  }
}

/** Get an OpenID Connect token for an identity. */
export async function getOpenIdToken(identityId: string): Promise<OpenIdTokenResult> {
  try {
    // TODO: implement get_open_id_token
    throw new Error("get_open_id_token not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_open_id_token failed");
  }
}

/** List identities in an identity pool. */
export async function listIdentities(identityPoolId: string, maxResults: number): Promise<IdentityResult[]> {
  try {
    // TODO: implement list_identities
    throw new Error("list_identities not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_identities failed");
  }
}

/** Describe a specific identity. */
export async function describeIdentity(identityId: string): Promise<IdentityResult> {
  try {
    // TODO: implement describe_identity
    throw new Error("describe_identity not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_identity failed");
  }
}

/** Delete one or more identities. */
export async function deleteIdentities(identityIds: string[]): Promise<Record<string, unknown>[]> {
  try {
    // TODO: implement delete_identities
    throw new Error("delete_identities not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_identities failed");
  }
}

/** Get identity pool roles. */
export async function getIdentityPoolRoles(identityPoolId: string, regionName?: string): Promise<GetIdentityPoolRolesResult> {
  try {
    // TODO: implement get_identity_pool_roles
    throw new Error("get_identity_pool_roles not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_identity_pool_roles failed");
  }
}

/** Get open id token for developer identity. */
export async function getOpenIdTokenForDeveloperIdentity(identityPoolId: string, logins: Record<string, unknown>): Promise<GetOpenIdTokenForDeveloperIdentityResult> {
  try {
    // TODO: implement get_open_id_token_for_developer_identity
    throw new Error("get_open_id_token_for_developer_identity not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_open_id_token_for_developer_identity failed");
  }
}

/** Get principal tag attribute map. */
export async function getPrincipalTagAttributeMap(identityPoolId: string, identityProviderName: string, regionName?: string): Promise<GetPrincipalTagAttributeMapResult> {
  try {
    // TODO: implement get_principal_tag_attribute_map
    throw new Error("get_principal_tag_attribute_map not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_principal_tag_attribute_map failed");
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

/** Lookup developer identity. */
export async function lookupDeveloperIdentity(identityPoolId: string): Promise<LookupDeveloperIdentityResult> {
  try {
    // TODO: implement lookup_developer_identity
    throw new Error("lookup_developer_identity not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "lookup_developer_identity failed");
  }
}

/** Merge developer identities. */
export async function mergeDeveloperIdentities(sourceUserIdentifier: string, destinationUserIdentifier: string, developerProviderName: string, identityPoolId: string, regionName?: string): Promise<MergeDeveloperIdentitiesResult> {
  try {
    // TODO: implement merge_developer_identities
    throw new Error("merge_developer_identities not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "merge_developer_identities failed");
  }
}

/** Set identity pool roles. */
export async function setIdentityPoolRoles(identityPoolId: string, roles: Record<string, unknown>): Promise<void> {
  try {
    // TODO: implement set_identity_pool_roles
    throw new Error("set_identity_pool_roles not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "set_identity_pool_roles failed");
  }
}

/** Set principal tag attribute map. */
export async function setPrincipalTagAttributeMap(identityPoolId: string, identityProviderName: string): Promise<SetPrincipalTagAttributeMapResult> {
  try {
    // TODO: implement set_principal_tag_attribute_map
    throw new Error("set_principal_tag_attribute_map not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "set_principal_tag_attribute_map failed");
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

/** Unlink developer identity. */
export async function unlinkDeveloperIdentity(identityId: string, identityPoolId: string, developerProviderName: string, developerUserIdentifier: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement unlink_developer_identity
    throw new Error("unlink_developer_identity not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "unlink_developer_identity failed");
  }
}

/** Unlink identity. */
export async function unlinkIdentity(identityId: string, logins: Record<string, unknown>, loginsToRemove: string[], regionName?: string): Promise<void> {
  try {
    // TODO: implement unlink_identity
    throw new Error("unlink_identity not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "unlink_identity failed");
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
