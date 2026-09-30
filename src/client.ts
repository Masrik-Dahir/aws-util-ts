/**
 * aws-util/client — TTL-aware cached AWS SDK v3 client factory.
 *
 * Clients are cached per `(ClientClass, region)` pair with a configurable
 * TTL (default 15 minutes) so that STS temporary credentials, assume-role
 * sessions, and Lambda execution-role rotations are picked up automatically.
 *
 * The cache is bounded to {@link CLIENT_MAX_SIZE} entries (default 64) with
 * LRU eviction.
 *
 * @example
 * ```ts
 * import { S3Client } from "@aws-sdk/client-s3";
 * import { getClient } from "./client.js";
 *
 * const s3 = getClient(S3Client, "us-east-1");
 * ```
 *
 * @module
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Generic constructor type for any AWS SDK v3 client.
 *
 * All SDK v3 clients accept a config object with an optional `region` field.
 */
export type ClientConstructor<T> = new (config: {
  region?: string;
}) => T;

// ---------------------------------------------------------------------------
// Cache configuration
// ---------------------------------------------------------------------------

/** Client TTL in milliseconds (15 minutes). */
const CLIENT_TTL_MS = 900_000;

/** Maximum number of cached client entries before LRU eviction. */
const CLIENT_MAX_SIZE = 64;

// ---------------------------------------------------------------------------
// Cache internals
// ---------------------------------------------------------------------------

interface CacheEntry<T = unknown> {
  /** The cached AWS SDK v3 client instance. */
  client: T;
  /** Timestamp (ms since epoch) when this entry was created. */
  createdAt: number;
}

/**
 * Internal client cache.
 *
 * Keys are `"ClientClassName|region"` strings. Insertion order of a `Map`
 * is used for LRU tracking: the most recently accessed entry is moved to
 * the end via delete-then-set.
 */
const cache = new Map<string, CacheEntry>();

/**
 * Build a cache key from a client constructor and optional region.
 */
function cacheKey<T>(
  ClientClass: ClientConstructor<T>,
  region?: string,
): string {
  return `${ClientClass.name}|${region ?? ""}`;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Return a cached AWS SDK v3 client, creating one if missing or expired.
 *
 * Clients are cached per `(ClientClass.name, region)` pair with a 15-minute
 * TTL so that credential rotations (STS, Lambda role refresh) are picked up
 * automatically. The cache is bounded to 64 entries with LRU eviction.
 *
 * @typeParam T - The AWS SDK v3 client type (e.g. `S3Client`).
 * @param ClientClass - The client constructor (e.g. `S3Client`).
 * @param region - AWS region to target. `undefined` defers to the SDK
 *   default region (env var, config file, or instance metadata).
 * @returns A cached (or freshly created) client instance.
 *
 * @example
 * ```ts
 * import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
 * const ddb = getClient(DynamoDBClient, "eu-west-1");
 * ```
 */
export function getClient<T>(
  ClientClass: ClientConstructor<T>,
  region?: string,
): T {
  const key = cacheKey(ClientClass, region);
  const now = Date.now();

  // Check for a valid cached entry
  const existing = cache.get(key);
  if (existing !== undefined) {
    if (now - existing.createdAt < CLIENT_TTL_MS) {
      // Move to end for LRU tracking (most recently used)
      cache.delete(key);
      cache.set(key, existing);
      return existing.client as T;
    }
    // Expired — remove stale entry
    cache.delete(key);
  }

  // Create a new client
  const config: { region?: string } = {};
  if (region !== undefined) {
    config.region = region;
  }
  const client = new ClientClass(config);

  // Evict LRU entries if at capacity
  while (cache.size >= CLIENT_MAX_SIZE) {
    // Map iteration order is insertion order; first key is the LRU entry
    const oldestKey = cache.keys().next().value;
    if (oldestKey !== undefined) {
      cache.delete(oldestKey);
    } else {
      break;
    }
  }

  cache.set(key, { client, createdAt: now });
  return client;
}

/**
 * Evict all cached AWS SDK v3 clients.
 *
 * Useful when credentials rotate or region configuration changes at runtime.
 */
export function clearClientCache(): void {
  cache.clear();
}
