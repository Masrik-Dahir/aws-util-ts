/**
 * aws-util — A comprehensive TypeScript utility library for 32+ AWS services.
 *
 * @example
 * ```typescript
 * // Placeholder resolution
 * import { retrieve, clearAllCaches } from "aws-util";
 *
 * // Individual service helpers
 * import { uploadFile, downloadBytes } from "aws-util/s3";
 * import { sendMessage, receiveMessages } from "aws-util/sqs";
 * import { getItem, putItem } from "aws-util/dynamodb";
 *
 * // Multi-service orchestration
 * import { loadAppConfig } from "aws-util/config-loader";
 * import { deployLambdaWithConfig } from "aws-util/deployer";
 * import { sendAlert, notifyOnException } from "aws-util/notifier";
 * ```
 *
 * Every function in this library is async (returns a Promise) since
 * the AWS SDK v3 is natively async. For API parity with the Python
 * version's `aws_util.aio` package, all modules are also re-exported
 * under `aws-util/aio`.
 *
 * @packageDocumentation
 */

// ---------------------------------------------------------------------------
// Core
// ---------------------------------------------------------------------------
export { getClient, clearClientCache } from "./client.js";
export {
  AwsUtilError,
  AwsServiceError,
  AwsThrottlingError,
  AwsNotFoundError,
  AwsPermissionError,
  AwsConflictError,
  AwsValidationError,
  AwsTimeoutError,
  classifyAwsError,
  wrapAwsError,
} from "./exceptions.js";

// ---------------------------------------------------------------------------
// Placeholder resolution (SSM + Secrets Manager)
// ---------------------------------------------------------------------------
export {
  retrieve,
  clearSsmCache,
  clearSecretCache,
  clearAllCaches,
} from "./placeholder.js";

// ---------------------------------------------------------------------------
// Individual service re-exports for convenience
// ---------------------------------------------------------------------------
export { getParameter } from "./parameter-store.js";
export { getSecret } from "./secrets-manager.js";

// ---------------------------------------------------------------------------
// Multi-service: config
// ---------------------------------------------------------------------------
export { loadAppConfig, getDbCredentials } from "./config-loader.js";

// ---------------------------------------------------------------------------
// Multi-service: notifications
// ---------------------------------------------------------------------------
export { sendAlert, notifyOnException } from "./notifier.js";

// ---------------------------------------------------------------------------
// Module namespace re-exports
// ---------------------------------------------------------------------------
export * as s3 from "./s3.js";
export * as dynamodb from "./dynamodb.js";
export * as sqs from "./sqs.js";
export * as sns from "./sns.js";
export * as lambda from "./lambda.js";
export * as cloudwatch from "./cloudwatch.js";
export * as sts from "./sts.js";
export * as eventbridge from "./eventbridge.js";
export * as kms from "./kms.js";
export * as ec2 from "./ec2.js";
export * as rds from "./rds.js";
export * as ecs from "./ecs.js";
export * as ecr from "./ecr.js";
export * as iam from "./iam.js";
export * as cognito from "./cognito.js";
export * as route53 from "./route53.js";
export * as acm from "./acm.js";
export * as stepfunctions from "./stepfunctions.js";
export * as cloudformation from "./cloudformation.js";
export * as kinesis from "./kinesis.js";
export * as firehose from "./firehose.js";
export * as ses from "./ses.js";
export * as glue from "./glue.js";
export * as athena from "./athena.js";
export * as bedrock from "./bedrock.js";
export * as rekognition from "./rekognition.js";
export * as textract from "./textract.js";
export * as comprehend from "./comprehend.js";
export * as translate from "./translate.js";
export * as parameterStore from "./parameter-store.js";
export * as secretsManager from "./secrets-manager.js";
export * as placeholder from "./placeholder.js";

// Multi-service orchestration
export * as configLoader from "./config-loader.js";
export * as deployer from "./deployer.js";
export * as notifier from "./notifier.js";
export * as dataPipeline from "./data-pipeline.js";
export * as resourceOps from "./resource-ops.js";
export * as securityOps from "./security-ops.js";
export * as lambdaMiddleware from "./lambda-middleware.js";
export * as apiGateway from "./api-gateway.js";
export * as eventOrchestration from "./event-orchestration.js";
export * as dataFlowEtl from "./data-flow-etl.js";
export * as resilience from "./resilience.js";
export * as observability from "./observability.js";
export * as deployment from "./deployment.js";
export * as securityCompliance from "./security-compliance.js";
export * as costOptimization from "./cost-optimization.js";
export * as testingDev from "./testing-dev.js";
export * as configState from "./config-state.js";
export * as messaging from "./messaging.js";
export * as aiMlPipelines from "./ai-ml-pipelines.js";
export * as infraAutomation from "./infra-automation.js";
export * as crossAccount from "./cross-account.js";
export * as blueGreen from "./blue-green.js";
export * as dataLake from "./data-lake.js";
export * as eventPatterns from "./event-patterns.js";
export * as databaseMigration from "./database-migration.js";
export * as credentialRotation from "./credential-rotation.js";
export * as disasterRecovery from "./disaster-recovery.js";
export * as costGovernance from "./cost-governance.js";
export * as securityAutomation from "./security-automation.js";
export * as containerOps from "./container-ops.js";
export * as mlPipeline from "./ml-pipeline.js";
export * as networking from "./networking.js";
export * as raisedSailApi from "./raised-sail-api.js";
