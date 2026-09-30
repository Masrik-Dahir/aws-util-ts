/**
 * aws-util/exceptions — Structured error hierarchy for AWS operations.
 *
 * Replaces generic `Error` wrapping with semantically meaningful error types
 * that let callers distinguish throttling from permission errors from missing
 * resources, etc.
 *
 * All errors inherit from {@link AwsUtilError} which itself extends `Error`.
 *
 * @example
 * ```ts
 * import { wrapAwsError, AwsThrottlingError } from "./exceptions.js";
 *
 * try {
 *   await client.send(command);
 * } catch (err) {
 *   throw wrapAwsError(err, "PutItem failed");
 * }
 * ```
 *
 * @module
 */

// ---------------------------------------------------------------------------
// Hierarchy
// ---------------------------------------------------------------------------

/**
 * Base class for every aws-util error.
 *
 * All specific error types extend this class, making it easy to catch any
 * aws-util error with a single `catch (err) { if (err instanceof AwsUtilError) ... }`.
 */
export class AwsUtilError extends Error {
  /** The AWS error code that triggered this error, if available. */
  errorCode?: string;

  constructor(message: string, errorCode?: string) {
    super(message);
    this.name = "AwsUtilError";
    this.errorCode = errorCode;
    // Restore prototype chain (required when extending built-ins in TS)
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/** A catch-all for AWS API errors not covered by a more specific type. */
export class AwsServiceError extends AwsUtilError {
  constructor(message: string, errorCode?: string) {
    super(message, errorCode);
    this.name = "AwsServiceError";
  }
}

/** The request was rejected due to API throttling / rate limiting. */
export class AwsThrottlingError extends AwsUtilError {
  constructor(message: string, errorCode?: string) {
    super(message, errorCode);
    this.name = "AwsThrottlingError";
  }
}

/** The requested AWS resource does not exist. */
export class AwsNotFoundError extends AwsUtilError {
  constructor(message: string, errorCode?: string) {
    super(message, errorCode);
    this.name = "AwsNotFoundError";
  }
}

/** The caller does not have permission to perform the action. */
export class AwsPermissionError extends AwsUtilError {
  constructor(message: string, errorCode?: string) {
    super(message, errorCode);
    this.name = "AwsPermissionError";
  }
}

/** The resource is in a conflicting state (already exists, in use, etc.). */
export class AwsConflictError extends AwsUtilError {
  constructor(message: string, errorCode?: string) {
    super(message, errorCode);
    this.name = "AwsConflictError";
  }
}

/** Invalid input parameters or configuration. */
export class AwsValidationError extends AwsUtilError {
  constructor(message: string, errorCode?: string) {
    super(message, errorCode);
    this.name = "AwsValidationError";
  }
}

/** An operation or polling loop exceeded its deadline. */
export class AwsTimeoutError extends AwsUtilError {
  constructor(message: string, errorCode?: string) {
    super(message, errorCode);
    this.name = "AwsTimeoutError";
  }
}

// ---------------------------------------------------------------------------
// Error code classification sets
// ---------------------------------------------------------------------------

/** AWS error codes that indicate API throttling / rate limiting. */
export const THROTTLING_CODES: ReadonlySet<string> = new Set([
  "Throttling",
  "ThrottlingException",
  "ThrottledException",
  "RequestThrottledException",
  "TooManyRequestsException",
  "ProvisionedThroughputExceededException",
  "TransactionInProgressException",
  "RequestLimitExceeded",
  "BandwidthLimitExceeded",
  "LimitExceededException",
  "RequestThrottled",
  "SlowDown",
  "EC2ThrottledException",
]);

/** AWS error codes that indicate a resource was not found. */
export const NOT_FOUND_CODES: ReadonlySet<string> = new Set([
  "ResourceNotFoundException",
  "NoSuchEntity",
  "NoSuchEntityException",
  "NoSuchBucket",
  "NoSuchKey",
  "NoSuchUpload",
  "NotFoundException",
  "NotFound",
  "404",
  "DBInstanceNotFound",
  "DBClusterNotFoundFault",
  "ClusterNotFoundException",
  "ServiceNotFoundException",
  "FunctionNotFound",
  "ResourceNotFound",
  "QueueDoesNotExist",
  "TopicNotFound",
  "StackNotFoundException",
  "HostedZoneNotFound",
  "CertificateNotFound",
  "SecretNotFoundException",
  "ParameterNotFound",
  "StateMachineDoesNotExist",
  "ExecutionDoesNotExist",
  "StreamNotFound",
  "DeliveryStreamNotFound",
  "TableNotFoundException",
  "BackupNotFoundException",
  "EndpointNotFound",
  "ModelNotFound",
]);

/** AWS error codes that indicate an access / permission denial. */
export const PERMISSION_CODES: ReadonlySet<string> = new Set([
  "AccessDenied",
  "AccessDeniedException",
  "UnauthorizedAccess",
  "UnauthorizedOperation",
  "AuthFailure",
  "InvalidClientTokenId",
  "SignatureDoesNotMatch",
  "IncompleteSignature",
  "MissingAuthenticationToken",
  "ExpiredToken",
  "ExpiredTokenException",
  "KMSAccessDeniedException",
]);

/** AWS error codes that indicate a resource conflict or pre-existing state. */
export const CONFLICT_CODES: ReadonlySet<string> = new Set([
  "ConflictException",
  "ResourceConflictException",
  "ResourceInUseException",
  "AlreadyExistsException",
  "ResourceAlreadyExistsException",
  "EntityAlreadyExists",
  "EntityAlreadyExistsException",
  "BucketAlreadyExists",
  "BucketAlreadyOwnedByYou",
  "IdempotentParameterMismatch",
  "OperationAbortedException",
  "ConcurrentModificationException",
  "OptimisticLockException",
  "ConditionalCheckFailedException",
  "TransactionCanceledException",
  "DBInstanceAlreadyExists",
]);

/** AWS error codes that indicate invalid input or configuration. */
export const VALIDATION_CODES: ReadonlySet<string> = new Set([
  "ValidationException",
  "ValidationError",
  "InvalidParameterException",
  "InvalidParameterValue",
  "InvalidParameterCombination",
  "InvalidInput",
  "InvalidRequestException",
  "MalformedPolicyDocument",
  "InvalidIdentityToken",
]);

// ---------------------------------------------------------------------------
// Classification helpers
// ---------------------------------------------------------------------------

/**
 * Extract the AWS error code from an SDK v3 service exception.
 *
 * AWS SDK v3 errors expose the code via `err.name` or `err.Code`.
 * This helper tries both, falling back to an empty string.
 */
function codeFromSdkError(err: unknown): string {
  if (err == null || typeof err !== "object") {
    return "";
  }
  // AWS SDK v3 service exceptions use `name` for the error code
  const record = err as Record<string, unknown>;
  if (typeof record["Code"] === "string" && record["Code"]) {
    return record["Code"];
  }
  if (typeof record["name"] === "string" && record["name"]) {
    return record["name"];
  }
  // Some errors nest the code inside $metadata or __type
  if (typeof record["__type"] === "string" && record["__type"]) {
    // __type may be a full ARN like "com.amazonaws.foo#ThrottlingException"
    const parts = (record["__type"] as string).split("#");
    return parts[parts.length - 1];
  }
  return "";
}

/**
 * Classify an AWS SDK error into the appropriate {@link AwsUtilError} subclass.
 *
 * Inspects the error's `name`, `Code`, or `__type` property to determine
 * the error code, then maps it to the most specific error type.
 *
 * @param err - The original error (typically an AWS SDK v3 service exception).
 * @param message - Optional context prefix for the error message.
 * @returns The most specific {@link AwsUtilError} subclass instance.
 */
export function classifyAwsError(
  err: unknown,
  message?: string,
): AwsUtilError {
  const code = codeFromSdkError(err);
  const errMessage =
    err instanceof Error ? err.message : String(err);
  const msg = message ? `${message}: ${errMessage}` : errMessage;

  if (code && THROTTLING_CODES.has(code)) {
    return new AwsThrottlingError(msg, code);
  }
  if (code && NOT_FOUND_CODES.has(code)) {
    return new AwsNotFoundError(msg, code);
  }
  if (code && PERMISSION_CODES.has(code)) {
    return new AwsPermissionError(msg, code);
  }
  if (code && CONFLICT_CODES.has(code)) {
    return new AwsConflictError(msg, code);
  }
  if (code && VALIDATION_CODES.has(code)) {
    return new AwsValidationError(msg, code);
  }

  return new AwsServiceError(msg, code || undefined);
}

/**
 * Wrap any error into the appropriate {@link AwsUtilError} subclass.
 *
 * - If `err` is already an {@link AwsUtilError}, returns it unchanged
 *   (or re-wraps with context if `message` is provided).
 * - If `err` looks like an AWS SDK v3 service exception (has a `name` or
 *   `Code` property), classifies it by error code.
 * - Otherwise wraps it in a generic {@link AwsServiceError}.
 *
 * @param err - The original error.
 * @param message - Optional context prefix for the error message.
 * @returns An {@link AwsUtilError} instance.
 */
export function wrapAwsError(
  err: unknown,
  message?: string,
): AwsUtilError {
  // Already classified
  if (err instanceof AwsUtilError) {
    if (!message) {
      return err;
    }
    // Re-wrap with context, preserving the specific type
    const msg = `${message}: ${err.message}`;
    const Ctor = err.constructor as new (
      m: string,
      c?: string,
    ) => AwsUtilError;
    return new Ctor(msg, err.errorCode);
  }

  // AWS SDK v3 service exceptions have a `name` that matches the error code
  // and/or a `$fault` / `$metadata` property.
  if (err != null && typeof err === "object") {
    const record = err as Record<string, unknown>;
    if (
      typeof record["name"] === "string" ||
      typeof record["Code"] === "string" ||
      typeof record["__type"] === "string" ||
      "$metadata" in record ||
      "$fault" in record
    ) {
      return classifyAwsError(err, message);
    }
  }

  // Generic fallback
  const errMessage =
    err instanceof Error ? err.message : String(err);
  const msg = message ? `${message}: ${errMessage}` : errMessage;
  return new AwsServiceError(msg);
}
