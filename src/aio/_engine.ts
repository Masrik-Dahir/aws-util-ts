/**
 * aws-util/aio/_engine — Async client factory (API parity with Python).
 *
 * In TypeScript / JavaScript, all AWS SDK v3 operations are already
 * `async` / `Promise`-based, so there is no need for a separate async
 * transport layer. This module re-exports the cached client factory from
 * {@link ../client.js} under the name `asyncClient` to maintain API
 * parity with the Python `aws_util.aio._engine` module.
 *
 * @example
 * ```ts
 * import { asyncClient } from "./aio/_engine.js";
 * import { S3Client } from "@aws-sdk/client-s3";
 *
 * const s3 = asyncClient(S3Client, "us-east-1");
 * ```
 *
 * @module
 */

export { getClient as asyncClient, clearClientCache } from "../client.js";
