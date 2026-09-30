/**
 * aws-util/sts — High-level AWS STS (Security Token Service) utilities.
 *
 * Provides typed helpers for caller identity lookup, role assumption,
 * and credential management via the AWS SDK v3 STS client.
 *
 * @example
 * ```ts
 * import { getCallerIdentity, assumeRole } from "./sts.js";
 *
 * const identity = await getCallerIdentity();
 * console.log(identity.account);
 *
 * const creds = await assumeRole("arn:aws:iam::123456789012:role/MyRole");
 * ```
 *
 * @module
 */

import { z } from "zod";
import {
  STSClient,
  GetCallerIdentityCommand,
  AssumeRoleCommand,
} from "@aws-sdk/client-sts";
import { getClient } from "./client.js";
import { wrapAwsError } from "./exceptions.js";

// ---------------------------------------------------------------------------
// Zod schemas & inferred types
// ---------------------------------------------------------------------------

/** Schema for the result of a GetCallerIdentity call. */
export const CallerIdentitySchema = z.object({
  account: z.string(),
  arn: z.string(),
  userId: z.string(),
});

/** The caller identity returned by {@link getCallerIdentity}. */
export type CallerIdentity = z.infer<typeof CallerIdentitySchema>;

/** Schema for credentials obtained by assuming a role. */
export const AssumedRoleCredentialsSchema = z.object({
  accessKeyId: z.string(),
  secretAccessKey: z.string(),
  sessionToken: z.string(),
  expiration: z.date().optional(),
});

/** Temporary credentials from {@link assumeRole}. */
export type AssumedRoleCredentials = z.infer<
  typeof AssumedRoleCredentialsSchema
>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Get a cached STSClient for the given region.
 */
function sts(region?: string): STSClient {
  return getClient(STSClient, region);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Retrieve the caller identity (account, ARN, user ID) for the current
 * credentials.
 *
 * @param region - AWS region override.
 * @returns The caller identity.
 */
export async function getCallerIdentity(
  region?: string,
): Promise<CallerIdentity> {
  try {
    const resp = await sts(region).send(
      new GetCallerIdentityCommand({}),
    );
    return CallerIdentitySchema.parse({
      account: resp.Account ?? "",
      arn: resp.Arn ?? "",
      userId: resp.UserId ?? "",
    });
  } catch (err) {
    throw wrapAwsError(err, "getCallerIdentity");
  }
}

/**
 * Retrieve the AWS account ID for the current credentials.
 *
 * Convenience wrapper around {@link getCallerIdentity} that returns only
 * the 12-digit account ID string.
 *
 * @param region - AWS region override.
 * @returns The AWS account ID.
 */
export async function getAccountId(
  region?: string,
): Promise<string> {
  const identity = await getCallerIdentity(region);
  return identity.account;
}

/**
 * Assume an IAM role and return temporary credentials.
 *
 * @param roleArn - The ARN of the role to assume.
 * @param sessionName - Optional session name (default `"aws-util-session"`).
 * @param durationSeconds - Session duration in seconds (default 3600).
 * @param externalId - Optional external ID for cross-account access.
 * @param region - AWS region override.
 * @returns Temporary credentials for the assumed role.
 */
export async function assumeRole(
  roleArn: string,
  sessionName: string = "aws-util-session",
  durationSeconds: number = 3600,
  externalId?: string,
  region?: string,
): Promise<AssumedRoleCredentials> {
  try {
    const resp = await sts(region).send(
      new AssumeRoleCommand({
        RoleArn: roleArn,
        RoleSessionName: sessionName,
        DurationSeconds: durationSeconds,
        ExternalId: externalId,
      }),
    );

    const creds = resp.Credentials;
    if (!creds) {
      throw new Error(
        "AssumeRole returned no credentials",
      );
    }

    return AssumedRoleCredentialsSchema.parse({
      accessKeyId: creds.AccessKeyId ?? "",
      secretAccessKey: creds.SecretAccessKey ?? "",
      sessionToken: creds.SessionToken ?? "",
      expiration: creds.Expiration,
    });
  } catch (err) {
    throw wrapAwsError(err, `assumeRole ${roleArn}`);
  }
}

/**
 * Assume an IAM role and return a new STSClient configured with the
 * temporary credentials.
 *
 * Useful for making subsequent AWS calls as the assumed role without
 * manually wiring credentials.
 *
 * @param roleArn - The ARN of the role to assume.
 * @param sessionName - Optional session name (default `"aws-util-session"`).
 * @param durationSeconds - Session duration in seconds (default 3600).
 * @param externalId - Optional external ID for cross-account access.
 * @param region - AWS region override.
 * @returns A new STSClient authenticated with the assumed role credentials.
 */
export async function assumeRoleSession(
  roleArn: string,
  sessionName: string = "aws-util-session",
  durationSeconds: number = 3600,
  externalId?: string,
  region?: string,
): Promise<STSClient> {
  const creds = await assumeRole(
    roleArn,
    sessionName,
    durationSeconds,
    externalId,
    region,
  );

  const config: {
    region?: string;
    credentials: {
      accessKeyId: string;
      secretAccessKey: string;
      sessionToken: string;
      expiration?: Date;
    };
  } = {
    credentials: {
      accessKeyId: creds.accessKeyId,
      secretAccessKey: creds.secretAccessKey,
      sessionToken: creds.sessionToken,
      expiration: creds.expiration,
    },
  };

  if (region !== undefined) {
    config.region = region;
  }

  return new STSClient(config);
}

/**
 * Check whether a string is a valid 12-digit AWS account ID.
 *
 * This is a synchronous regex check — it does not contact AWS.
 *
 * @param accountId - The string to validate.
 * @returns `true` if the string is exactly 12 digits.
 */
export function isValidAccountId(accountId: string): boolean {
  return /^\d{12}$/.test(accountId);
}

// ---------------------------------------------------------------------------
// Additional types (auto-generated)
// ---------------------------------------------------------------------------

/** Result of assume_role_with_saml. */
export type AssumeRoleWithSamlResult = {
  credentials?: Record<string, unknown>;
  assumedRoleUser?: Record<string, unknown>;
  packedPolicySize?: number | undefined;
  subject?: string | undefined;
  subjectType?: string | undefined;
  issuer?: string | undefined;
  audience?: string | undefined;
  nameQualifier?: string | undefined;
  sourceIdentity?: string | undefined;
};

/** Result of assume_role_with_web_identity. */
export type AssumeRoleWithWebIdentityResult = {
  credentials?: Record<string, unknown>;
  subjectFromWebIdentityToken?: string | undefined;
  assumedRoleUser?: Record<string, unknown>;
  packedPolicySize?: number | undefined;
  provider?: string | undefined;
  audience?: string | undefined;
  sourceIdentity?: string | undefined;
};

/** Result of assume_root. */
export type AssumeRootResult = {
  credentials?: Record<string, unknown>;
  sourceIdentity?: string | undefined;
};

/** Result of decode_authorization_message. */
export type DecodeAuthorizationMessageResult = {
  decodedMessage?: string | undefined;
};

/** Result of get_access_key_info. */
export type GetAccessKeyInfoResult = {
  account?: string | undefined;
};

/** Result of get_delegated_access_token. */
export type GetDelegatedAccessTokenResult = {
  credentials?: Record<string, unknown>;
  packedPolicySize?: number | undefined;
  assumedPrincipal?: string | undefined;
};

/** Result of get_federation_token. */
export type GetFederationTokenResult = {
  credentials?: Record<string, unknown>;
  federatedUser?: Record<string, unknown>;
  packedPolicySize?: number | undefined;
};

/** Result of get_session_token. */
export type GetSessionTokenResult = {
  credentials?: Record<string, unknown>;
};


// ---------------------------------------------------------------------------
// Additional functions (auto-generated)
// ---------------------------------------------------------------------------

/** Assume role with saml. */
export async function assumeRoleWithSaml(roleArn: string, principalArn: string, samlAssertion: string): Promise<AssumeRoleWithSamlResult> {
  try {
    // TODO: implement assume_role_with_saml
    throw new Error("assume_role_with_saml not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "assume_role_with_saml failed");
  }
}

/** Assume role with web identity. */
export async function assumeRoleWithWebIdentity(roleArn: string, roleSessionName: string, webIdentityToken: string): Promise<AssumeRoleWithWebIdentityResult> {
  try {
    // TODO: implement assume_role_with_web_identity
    throw new Error("assume_role_with_web_identity not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "assume_role_with_web_identity failed");
  }
}

/** Assume root. */
export async function assumeRoot(targetPrincipal: string, taskPolicyArn: Record<string, unknown>): Promise<AssumeRootResult> {
  try {
    // TODO: implement assume_root
    throw new Error("assume_root not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "assume_root failed");
  }
}

/** Decode authorization message. */
export async function decodeAuthorizationMessage(encodedMessage: string, regionName?: string | undefined): Promise<DecodeAuthorizationMessageResult> {
  try {
    // TODO: implement decode_authorization_message
    throw new Error("decode_authorization_message not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "decode_authorization_message failed");
  }
}

/** Get access key info. */
export async function getAccessKeyInfo(accessKeyId: string, regionName?: string | undefined): Promise<GetAccessKeyInfoResult> {
  try {
    // TODO: implement get_access_key_info
    throw new Error("get_access_key_info not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_access_key_info failed");
  }
}

/** Get delegated access token. */
export async function getDelegatedAccessToken(tradeInToken: string, regionName?: string | undefined): Promise<GetDelegatedAccessTokenResult> {
  try {
    // TODO: implement get_delegated_access_token
    throw new Error("get_delegated_access_token not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_delegated_access_token failed");
  }
}

/** Get federation token. */
export async function getFederationToken(name: string): Promise<GetFederationTokenResult> {
  try {
    // TODO: implement get_federation_token
    throw new Error("get_federation_token not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_federation_token failed");
  }
}

/** Get session token. */
export async function getSessionToken(): Promise<GetSessionTokenResult> {
  try {
    // TODO: implement get_session_token
    throw new Error("get_session_token not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_session_token failed");
  }
}
