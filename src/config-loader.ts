import { ConfigLoaderClient } from "@aws-sdk/client-sts";
import { getClient } from "./client";
import { wrapAwsError } from "./exceptions";

/** A merged application configuration loaded from SSM and Secrets Manager.

Behaves like a read-only dict: supports ``config["key"]``, ``config.get()``,
and ``"key" in config``. */
export type AppConfig = {
  values?: Record<string, unknown>;
};

/** Load all SSM parameters under *path* as a flat dict. */
export async function loadConfigFromSsm(path: string, stripPrefix: boolean, recursive: boolean, regionName?: string): Promise<Record<string, unknown>> {
  try {
    // TODO: implement load_config_from_ssm
    throw new Error("load_config_from_ssm not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "load_config_from_ssm failed");
  }
}

/** Parse a JSON Secrets Manager secret and return its fields as a dict. */
export async function loadConfigFromSecret(secretName: string, regionName?: string): Promise<Record<string, unknown>> {
  try {
    // TODO: implement load_config_from_secret
    throw new Error("load_config_from_secret not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "load_config_from_secret failed");
  }
}

/** Load and merge application config from SSM Parameter Store and Secrets Manager. */
export async function loadAppConfig(ssmPrefix?: string, secretNames?: string[], regionName?: string): Promise<AppConfig> {
  try {
    // TODO: implement load_app_config
    throw new Error("load_app_config not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "load_app_config failed");
  }
}

/** Resolve ``${ssm:...}`` and ``${secret:...}`` placeholders in all string */
export async function resolveConfig(config: Record<string, unknown>, regionName?: string): Promise<Record<string, unknown>> {
  try {
    // TODO: implement resolve_config
    throw new Error("resolve_config not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "resolve_config failed");
  }
}

/** Fetch database credentials stored as a JSON Secrets Manager secret. */
export async function getDbCredentials(secretName: string, regionName?: string): Promise<Record<string, unknown>> {
  try {
    // TODO: implement get_db_credentials
    throw new Error("get_db_credentials not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_db_credentials failed");
  }
}

/** Fetch multiple specific SSM parameters by name and return them as a dict. */
export async function getSsmParameterMap(names: string[], regionName?: string): Promise<Record<string, unknown>> {
  try {
    // TODO: implement get_ssm_parameter_map
    throw new Error("get_ssm_parameter_map not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_ssm_parameter_map failed");
  }
}

// ---------------------------------------------------------------------------
// Extended config-loader schemas
// ---------------------------------------------------------------------------

import { z } from "zod";

/** Schema for an AppConfig feature flag loader result. */
export const AppconfigFeatureFlagResultSchema = z.object({
  application: z.string(),
  environment: z.string(),
  configProfile: z.string(),
  flags: z.record(z.string(), z.unknown()),
  version: z.string(),
});
/** AppConfig feature flag loader result. */
export type AppconfigFeatureFlagResult = z.infer<typeof AppconfigFeatureFlagResultSchema>;

/** Schema for a cross-region parameter replicator result. */
export const CrossRegionParameterReplicatorResultSchema = z.object({
  sourceRegion: z.string(),
  targetRegion: z.string(),
  parameterPath: z.string(),
  parametersReplicated: z.number(),
  success: z.boolean(),
});
/** Cross-region parameter replicator result. */
export type CrossRegionParameterReplicatorResult = z.infer<typeof CrossRegionParameterReplicatorResultSchema>;

// ---------------------------------------------------------------------------
// Extended config-loader functions
// ---------------------------------------------------------------------------

/** Load feature flags from AWS AppConfig with local caching. */
export async function appconfigFeatureFlagLoader(
  application: string,
  environment: string,
  configProfile: string,
  clientId?: string,
  regionName?: string,
): Promise<AppconfigFeatureFlagResult> {
  try {
    // TODO: implement appconfigFeatureFlagLoader
    throw new Error("appconfigFeatureFlagLoader not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "appconfigFeatureFlagLoader failed");
  }
}

/** Replicate SSM Parameter Store parameters from one region to another. */
export async function crossRegionParameterReplicator(
  parameterPath: string,
  sourceRegion: string,
  targetRegion: string,
  overwrite?: boolean,
): Promise<CrossRegionParameterReplicatorResult> {
  try {
    // TODO: implement crossRegionParameterReplicator
    throw new Error("crossRegionParameterReplicator not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "crossRegionParameterReplicator failed");
  }
}
