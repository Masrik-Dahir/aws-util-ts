/**
 * aws-util/api-gateway-ops — Multi-service API Gateway operation utilities.
 *
 * Provides typed helpers for WebSocket session management, JWT authorizer
 * provisioning, usage plan enforcement, rate limiting, and domain migration.
 *
 * @module
 */

import { z } from "zod";
import { ApiGatewayV2Client } from "@aws-sdk/client-apigatewayv2";
import { APIGatewayClient } from "@aws-sdk/client-api-gateway";
import { getClient } from "./client.js";
import { wrapAwsError } from "./exceptions.js";

// ---------------------------------------------------------------------------
// Zod schemas & inferred types
// ---------------------------------------------------------------------------

/** Schema for a WebSocket session manager result. */
export const WebsocketSessionResultSchema = z.object({
  connectionId: z.string(),
  apiId: z.string(),
  stage: z.string(),
  action: z.string(),
  success: z.boolean(),
});

/** WebSocket session manager result. */
export type WebsocketSessionResult = z.infer<typeof WebsocketSessionResultSchema>;

/** Schema for a JWT Lambda authorizer result. */
export const JwtLambdaAuthorizerResultSchema = z.object({
  authorizerId: z.string(),
  apiId: z.string(),
  name: z.string(),
  identitySource: z.string(),
});

/** JWT Lambda authorizer result. */
export type JwtLambdaAuthorizerResult = z.infer<typeof JwtLambdaAuthorizerResultSchema>;

/** Schema for a usage plan enforcer result. */
export const UsagePlanEnforcerResultSchema = z.object({
  usagePlanId: z.string(),
  apiKey: z.string(),
  throttleLimit: z.number(),
  quotaLimit: z.number(),
});

/** Usage plan enforcer result. */
export type UsagePlanEnforcerResult = z.infer<typeof UsagePlanEnforcerResultSchema>;

/** Schema for a rate limiter result. */
export const RateLimiterResultSchema = z.object({
  allowed: z.boolean(),
  remaining: z.number(),
  resetAt: z.string(),
  identifier: z.string(),
});

/** Rate limiter result. */
export type RateLimiterResult = z.infer<typeof RateLimiterResultSchema>;

/** Schema for an API Gateway domain migrator result. */
export const ApiGatewayDomainMigratorResultSchema = z.object({
  domainName: z.string(),
  oldApiId: z.string(),
  newApiId: z.string(),
  mappingId: z.string(),
  success: z.boolean(),
});

/** API Gateway domain migrator result. */
export type ApiGatewayDomainMigratorResult = z.infer<typeof ApiGatewayDomainMigratorResultSchema>;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Manage WebSocket connections: send messages, disconnect, or broadcast to sessions. */
export async function websocketSessionManager(
  apiId: string,
  stage: string,
  connectionId: string,
  action: "send" | "disconnect" | "info",
  payload?: Record<string, unknown>,
  region?: string,
): Promise<WebsocketSessionResult> {
  const client = getClient(ApiGatewayV2Client, region);
  try {
    // TODO: implement websocketSessionManager
    throw new Error("websocketSessionManager not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "websocketSessionManager failed");
  }
}

/** Create or update a JWT Lambda authorizer on an API Gateway HTTP API. */
export async function jwtLambdaAuthorizer(
  apiId: string,
  name: string,
  lambdaArn: string,
  identitySource: string,
  ttl?: number,
  region?: string,
): Promise<JwtLambdaAuthorizerResult> {
  const client = getClient(ApiGatewayV2Client, region);
  try {
    // TODO: implement jwtLambdaAuthorizer
    throw new Error("jwtLambdaAuthorizer not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "jwtLambdaAuthorizer failed");
  }
}

/** Create or enforce a usage plan with throttling and quota on a REST API. */
export async function apigwUsagePlanEnforcer(
  apiId: string,
  stage: string,
  planName: string,
  throttleRateLimit: number,
  throttleBurstLimit: number,
  quotaLimit: number,
  quotaPeriod?: string,
  region?: string,
): Promise<UsagePlanEnforcerResult> {
  const client = getClient(APIGatewayClient, region);
  try {
    // TODO: implement apigwUsagePlanEnforcer
    throw new Error("apigwUsagePlanEnforcer not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "apigwUsagePlanEnforcer failed");
  }
}

/** Enforce per-identifier rate limits using DynamoDB as a token-bucket store. */
export async function rateLimiter(
  identifier: string,
  tableName: string,
  maxRequests: number,
  windowSeconds: number,
  region?: string,
): Promise<RateLimiterResult> {
  const client = getClient(ApiGatewayV2Client, region);
  try {
    // TODO: implement rateLimiter
    throw new Error("rateLimiter not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "rateLimiter failed");
  }
}

/** Migrate a custom domain mapping from one API to another with zero downtime. */
export async function apiGatewayDomainMigrator(
  domainName: string,
  oldApiId: string,
  newApiId: string,
  stage: string,
  basePath?: string,
  region?: string,
): Promise<ApiGatewayDomainMigratorResult> {
  const client = getClient(ApiGatewayV2Client, region);
  try {
    // TODO: implement apiGatewayDomainMigrator
    throw new Error("apiGatewayDomainMigrator not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "apiGatewayDomainMigrator failed");
  }
}
