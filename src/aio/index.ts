/**
 * aws-util/aio — Native async re-exports.
 *
 * In TypeScript, all AWS SDK v3 operations are natively async, so this
 * package simply re-exports every module from the parent package for API
 * parity with the Python `aws_util.aio` namespace.
 *
 * Usage:
 * ```typescript
 * import { s3, dynamodb, sqs } from "aws-util/aio";
 * // Identical API to the top-level imports
 * const data = await s3.downloadBytes("my-bucket", "key.txt");
 * ```
 *
 * @packageDocumentation
 */

// Core
export { asyncClient, clearClientCache } from "./_engine.js";
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
} from "../exceptions.js";

// Placeholder resolution
export {
  retrieve,
  clearSsmCache,
  clearSecretCache,
  clearAllCaches,
} from "../placeholder.js";

// Individual services
export { getParameter } from "../parameter-store.js";
export { getSecret } from "../secrets-manager.js";

// Multi-service: config
export { loadAppConfig, getDbCredentials } from "../config-loader.js";

// Multi-service: notifications
export { sendAlert, notifyOnException } from "../notifier.js";

// Module namespace re-exports — all functions are already async
export * as s3 from "../s3.js";
export * as dynamodb from "../dynamodb.js";
export * as sqs from "../sqs.js";
export * as sns from "../sns.js";
export * as lambda from "../lambda.js";
export * as cloudwatch from "../cloudwatch.js";
export * as sts from "../sts.js";
export * as eventbridge from "../eventbridge.js";
export * as kms from "../kms.js";
export * as ec2 from "../ec2.js";
export * as rds from "../rds.js";
export * as ecs from "../ecs.js";
export * as ecr from "../ecr.js";
export * as iam from "../iam.js";
export * as cognito from "../cognito.js";
export * as route53 from "../route53.js";
export * as acm from "../acm.js";
export * as stepfunctions from "../stepfunctions.js";
export * as cloudformation from "../cloudformation.js";
export * as kinesis from "../kinesis.js";
export * as firehose from "../firehose.js";
export * as ses from "../ses.js";
export * as glue from "../glue.js";
export * as athena from "../athena.js";
export * as bedrock from "../bedrock.js";
export * as rekognition from "../rekognition.js";
export * as textract from "../textract.js";
export * as comprehend from "../comprehend.js";
export * as translate from "../translate.js";
export * as parameterStore from "../parameter-store.js";
export * as secretsManager from "../secrets-manager.js";
export * as placeholder from "../placeholder.js";

// Multi-service orchestration
export * as configLoader from "../config-loader.js";
export * as deployer from "../deployer.js";
export * as notifier from "../notifier.js";
export * as dataPipeline from "../data-pipeline.js";
export * as resourceOps from "../resource-ops.js";
export * as securityOps from "../security-ops.js";
export * as lambdaMiddleware from "../lambda-middleware.js";
export * as apiGateway from "../api-gateway.js";
export * as eventOrchestration from "../event-orchestration.js";
export * as dataFlowEtl from "../data-flow-etl.js";
export * as resilience from "../resilience.js";
export * as observability from "../observability.js";
export * as deployment from "../deployment.js";
export * as securityCompliance from "../security-compliance.js";
export * as costOptimization from "../cost-optimization.js";
export * as testingDev from "../testing-dev.js";
export * as configState from "../config-state.js";
export * as messaging from "../messaging.js";
export * as aiMlPipelines from "../ai-ml-pipelines.js";
export * as infraAutomation from "../infra-automation.js";
export * as crossAccount from "../cross-account.js";
export * as blueGreen from "../blue-green.js";
export * as dataLake from "../data-lake.js";
export * as eventPatterns from "../event-patterns.js";
export * as databaseMigration from "../database-migration.js";
export * as credentialRotation from "../credential-rotation.js";
export * as disasterRecovery from "../disaster-recovery.js";
export * as costGovernance from "../cost-governance.js";
export * as securityAutomation from "../security-automation.js";
export * as containerOps from "../container-ops.js";
export * as mlPipeline from "../ml-pipeline.js";
export * as networking from "../networking.js";
export * as raisedSailApi from "../raised-sail-api.js";
