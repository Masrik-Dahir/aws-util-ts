import { ApiGatewayClient } from "@aws-sdk/client-apigateway";
import { getClient } from "./client";
import { wrapAwsError } from "./exceptions";

/** An IAM policy document returned by a Lambda authorizer. */
export type AuthPolicy = {
  principalId: string;
  effect: Literal['Allow', 'Deny'];
  resource: string;
  context?: Record<string, unknown>;
};

/** An API key record stored in DynamoDB. */
export type APIKeyRecord = {
  apiKey: string;
  owner: string;
  enabled?: boolean;
  rateLimit?: number;
  description?: string;
};

/** Result of a throttle-guard check. */
export type ThrottleResult = {
  allowed: boolean;
  currentCount: number;
  limit: number;
  ttl: number;
};

/** A WebSocket connection record stored in DynamoDB. */
export type WebSocketConnection = {
  connectionId: string;
  connectedAt?: number;
  metadata?: Record<string, unknown>;
};

/** Result of a request validation. */
export type ValidationResult = {
  valid: boolean;
  errors?: string[];
};

/** Result of create_api_key. */
export type CreateApiKeyResult = {
  id?: string;
  value?: string;
  name?: string;
  customerId?: string;
  description?: string;
  enabled?: boolean;
  createdDate?: string;
  lastUpdatedDate?: string;
  stageKeys?: unknown[];
  tags?: Record<string, unknown>;
};

/** Result of create_authorizer. */
export type CreateAuthorizerResult = {
  id?: string;
  name?: string;
  type?: string;
  providerArNs?: unknown[];
  authType?: string;
  authorizerUri?: string;
  authorizerCredentials?: string;
  identitySource?: string;
  identityValidationExpression?: string;
  authorizerResultTtlInSeconds?: number;
};

/** Result of create_base_path_mapping. */
export type CreateBasePathMappingResult = {
  basePath?: string;
  restApiId?: string;
  stage?: string;
};

/** Result of create_deployment. */
export type CreateDeploymentResult = {
  id?: string;
  description?: string;
  createdDate?: string;
  apiSummary?: Record<string, unknown>;
};

/** Result of create_documentation_part. */
export type CreateDocumentationPartResult = {
  id?: string;
  location?: Record<string, unknown>;
  properties?: string;
};

/** Result of create_documentation_version. */
export type CreateDocumentationVersionResult = {
  version?: string;
  createdDate?: string;
  description?: string;
};

/** Result of create_domain_name. */
export type CreateDomainNameResult = {
  domainName?: string;
  domainNameId?: string;
  domainNameArn?: string;
  certificateName?: string;
  certificateArn?: string;
  certificateUploadDate?: string;
  regionalDomainName?: string;
  regionalHostedZoneId?: string;
  regionalCertificateName?: string;
  regionalCertificateArn?: string;
  distributionDomainName?: string;
  distributionHostedZoneId?: string;
  endpointConfiguration?: Record<string, unknown>;
  domainNameStatus?: string;
  domainNameStatusMessage?: string;
  securityPolicy?: string;
  tags?: Record<string, unknown>;
  mutualTlsAuthentication?: Record<string, unknown>;
  ownershipVerificationCertificateArn?: string;
  managementPolicy?: string;
  policy?: string;
  routingMode?: string;
};

/** Result of create_domain_name_access_association. */
export type CreateDomainNameAccessAssociationResult = {
  domainNameAccessAssociationArn?: string;
  domainNameArn?: string;
  accessAssociationSourceType?: string;
  accessAssociationSource?: string;
  tags?: Record<string, unknown>;
};

/** Result of create_model. */
export type CreateModelResult = {
  id?: string;
  name?: string;
  description?: string;
  modelSchema?: string;
  contentType?: string;
};

/** Result of create_request_validator. */
export type CreateRequestValidatorResult = {
  id?: string;
  name?: string;
  validateRequestBody?: boolean;
  validateRequestParameters?: boolean;
};

/** Result of create_resource. */
export type CreateResourceResult = {
  id?: string;
  parentId?: string;
  pathPart?: string;
  path?: string;
  resourceMethods?: Record<string, unknown>;
};

/** Result of create_rest_api. */
export type CreateRestApiResult = {
  id?: string;
  name?: string;
  description?: string;
  createdDate?: string;
  version?: string;
  warnings?: unknown[];
  binaryMediaTypes?: unknown[];
  minimumCompressionSize?: number;
  apiKeySource?: string;
  endpointConfiguration?: Record<string, unknown>;
  policy?: string;
  tags?: Record<string, unknown>;
  disableExecuteApiEndpoint?: boolean;
  rootResourceId?: string;
};

/** Result of create_stage. */
export type CreateStageResult = {
  deploymentId?: string;
  clientCertificateId?: string;
  stageName?: string;
  description?: string;
  cacheClusterEnabled?: boolean;
  cacheClusterSize?: string;
  cacheClusterStatus?: string;
  methodSettings?: Record<string, unknown>;
  variables?: Record<string, unknown>;
  documentationVersion?: string;
  accessLogSettings?: Record<string, unknown>;
  canarySettings?: Record<string, unknown>;
  tracingEnabled?: boolean;
  webAclArn?: string;
  tags?: Record<string, unknown>;
  createdDate?: string;
  lastUpdatedDate?: string;
};

/** Result of create_usage_plan. */
export type CreateUsagePlanResult = {
  id?: string;
  name?: string;
  description?: string;
  apiStages?: unknown[];
  throttle?: Record<string, unknown>;
  quota?: Record<string, unknown>;
  productCode?: string;
  tags?: Record<string, unknown>;
};

/** Result of create_usage_plan_key. */
export type CreateUsagePlanKeyResult = {
  id?: string;
  type?: string;
  value?: string;
  name?: string;
};

/** Result of create_vpc_link. */
export type CreateVpcLinkResult = {
  id?: string;
  name?: string;
  description?: string;
  targetArns?: unknown[];
  status?: string;
  statusMessage?: string;
  tags?: Record<string, unknown>;
};

/** Result of delete_api_key. */
export type DeleteApiKeyResult = {
};

/** Result of delete_authorizer. */
export type DeleteAuthorizerResult = {
};

/** Result of delete_base_path_mapping. */
export type DeleteBasePathMappingResult = {
};

/** Result of delete_client_certificate. */
export type DeleteClientCertificateResult = {
};

/** Result of delete_deployment. */
export type DeleteDeploymentResult = {
};

/** Result of delete_documentation_part. */
export type DeleteDocumentationPartResult = {
};

/** Result of delete_documentation_version. */
export type DeleteDocumentationVersionResult = {
};

/** Result of delete_domain_name. */
export type DeleteDomainNameResult = {
};

/** Result of delete_domain_name_access_association. */
export type DeleteDomainNameAccessAssociationResult = {
};

/** Result of delete_gateway_response. */
export type DeleteGatewayResponseResult = {
};

/** Result of delete_integration. */
export type DeleteIntegrationResult = {
};

/** Result of delete_integration_response. */
export type DeleteIntegrationResponseResult = {
};

/** Result of delete_method. */
export type DeleteMethodResult = {
};

/** Result of delete_method_response. */
export type DeleteMethodResponseResult = {
};

/** Result of delete_model. */
export type DeleteModelResult = {
};

/** Result of delete_request_validator. */
export type DeleteRequestValidatorResult = {
};

/** Result of delete_resource. */
export type DeleteResourceResult = {
};

/** Result of delete_rest_api. */
export type DeleteRestApiResult = {
};

/** Result of delete_stage. */
export type DeleteStageResult = {
};

/** Result of delete_usage_plan. */
export type DeleteUsagePlanResult = {
};

/** Result of delete_usage_plan_key. */
export type DeleteUsagePlanKeyResult = {
};

/** Result of delete_vpc_link. */
export type DeleteVpcLinkResult = {
};

/** Result of flush_stage_authorizers_cache. */
export type FlushStageAuthorizersCacheResult = {
};

/** Result of flush_stage_cache. */
export type FlushStageCacheResult = {
};

/** Result of generate_client_certificate. */
export type GenerateClientCertificateResult = {
  clientCertificateId?: string;
  description?: string;
  pemEncodedCertificate?: string;
  createdDate?: string;
  expirationDate?: string;
  tags?: Record<string, unknown>;
};

/** Result of get_account. */
export type GetAccountResult = {
  cloudwatchRoleArn?: string;
  throttleSettings?: Record<string, unknown>;
  features?: unknown[];
  apiKeyVersion?: string;
};

/** Result of get_api_key. */
export type GetApiKeyResult = {
  id?: string;
  value?: string;
  name?: string;
  customerId?: string;
  description?: string;
  enabled?: boolean;
  createdDate?: string;
  lastUpdatedDate?: string;
  stageKeys?: unknown[];
  tags?: Record<string, unknown>;
};

/** Result of get_api_keys. */
export type GetApiKeysResult = {
  warnings?: unknown[];
  position?: string;
  items?: unknown[];
};

/** Result of get_authorizer. */
export type GetAuthorizerResult = {
  id?: string;
  name?: string;
  type?: string;
  providerArNs?: unknown[];
  authType?: string;
  authorizerUri?: string;
  authorizerCredentials?: string;
  identitySource?: string;
  identityValidationExpression?: string;
  authorizerResultTtlInSeconds?: number;
};

/** Result of get_authorizers. */
export type GetAuthorizersResult = {
  position?: string;
  items?: unknown[];
};

/** Result of get_base_path_mapping. */
export type GetBasePathMappingResult = {
  basePath?: string;
  restApiId?: string;
  stage?: string;
};

/** Result of get_base_path_mappings. */
export type GetBasePathMappingsResult = {
  position?: string;
  items?: unknown[];
};

/** Result of get_client_certificate. */
export type GetClientCertificateResult = {
  clientCertificateId?: string;
  description?: string;
  pemEncodedCertificate?: string;
  createdDate?: string;
  expirationDate?: string;
  tags?: Record<string, unknown>;
};

/** Result of get_client_certificates. */
export type GetClientCertificatesResult = {
  position?: string;
  items?: unknown[];
};

/** Result of get_deployment. */
export type GetDeploymentResult = {
  id?: string;
  description?: string;
  createdDate?: string;
  apiSummary?: Record<string, unknown>;
};

/** Result of get_deployments. */
export type GetDeploymentsResult = {
  position?: string;
  items?: unknown[];
};

/** Result of get_documentation_part. */
export type GetDocumentationPartResult = {
  id?: string;
  location?: Record<string, unknown>;
  properties?: string;
};

/** Result of get_documentation_parts. */
export type GetDocumentationPartsResult = {
  position?: string;
  items?: unknown[];
};

/** Result of get_documentation_version. */
export type GetDocumentationVersionResult = {
  version?: string;
  createdDate?: string;
  description?: string;
};

/** Result of get_documentation_versions. */
export type GetDocumentationVersionsResult = {
  position?: string;
  items?: unknown[];
};

/** Result of get_domain_name. */
export type GetDomainNameResult = {
  domainName?: string;
  domainNameId?: string;
  domainNameArn?: string;
  certificateName?: string;
  certificateArn?: string;
  certificateUploadDate?: string;
  regionalDomainName?: string;
  regionalHostedZoneId?: string;
  regionalCertificateName?: string;
  regionalCertificateArn?: string;
  distributionDomainName?: string;
  distributionHostedZoneId?: string;
  endpointConfiguration?: Record<string, unknown>;
  domainNameStatus?: string;
  domainNameStatusMessage?: string;
  securityPolicy?: string;
  tags?: Record<string, unknown>;
  mutualTlsAuthentication?: Record<string, unknown>;
  ownershipVerificationCertificateArn?: string;
  managementPolicy?: string;
  policy?: string;
  routingMode?: string;
};

/** Result of get_domain_name_access_associations. */
export type GetDomainNameAccessAssociationsResult = {
  position?: string;
  items?: unknown[];
};

/** Result of get_domain_names. */
export type GetDomainNamesResult = {
  position?: string;
  items?: unknown[];
};

/** Result of get_export. */
export type GetExportResult = {
  contentType?: string;
  contentDisposition?: string;
  body?: unknown;
};

/** Result of get_gateway_response. */
export type GetGatewayResponseResult = {
  responseType?: string;
  statusCode?: string;
  responseParameters?: Record<string, unknown>;
  responseTemplates?: Record<string, unknown>;
  defaultResponse?: boolean;
};

/** Result of get_gateway_responses. */
export type GetGatewayResponsesResult = {
  position?: string;
  items?: unknown[];
};

/** Result of get_integration. */
export type GetIntegrationResult = {
  type?: string;
  httpMethod?: string;
  uri?: string;
  connectionType?: string;
  connectionId?: string;
  credentials?: string;
  requestParameters?: Record<string, unknown>;
  requestTemplates?: Record<string, unknown>;
  passthroughBehavior?: string;
  contentHandling?: string;
  timeoutInMillis?: number;
  cacheNamespace?: string;
  cacheKeyParameters?: unknown[];
  integrationResponses?: Record<string, unknown>;
  tlsConfig?: Record<string, unknown>;
};

/** Result of get_integration_response. */
export type GetIntegrationResponseResult = {
  statusCode?: string;
  selectionPattern?: string;
  responseParameters?: Record<string, unknown>;
  responseTemplates?: Record<string, unknown>;
  contentHandling?: string;
};

/** Result of get_method. */
export type GetMethodResult = {
  httpMethod?: string;
  authorizationType?: string;
  authorizerId?: string;
  apiKeyRequired?: boolean;
  requestValidatorId?: string;
  operationName?: string;
  requestParameters?: Record<string, unknown>;
  requestModels?: Record<string, unknown>;
  methodResponses?: Record<string, unknown>;
  methodIntegration?: Record<string, unknown>;
  authorizationScopes?: unknown[];
};

/** Result of get_method_response. */
export type GetMethodResponseResult = {
  statusCode?: string;
  responseParameters?: Record<string, unknown>;
  responseModels?: Record<string, unknown>;
};

/** Result of get_model. */
export type GetModelResult = {
  id?: string;
  name?: string;
  description?: string;
  modelSchema?: string;
  contentType?: string;
};

/** Result of get_model_template. */
export type GetModelTemplateResult = {
  value?: string;
};

/** Result of get_models. */
export type GetModelsResult = {
  position?: string;
  items?: unknown[];
};

/** Result of get_request_validator. */
export type GetRequestValidatorResult = {
  id?: string;
  name?: string;
  validateRequestBody?: boolean;
  validateRequestParameters?: boolean;
};

/** Result of get_request_validators. */
export type GetRequestValidatorsResult = {
  position?: string;
  items?: unknown[];
};

/** Result of get_resource. */
export type GetResourceResult = {
  id?: string;
  parentId?: string;
  pathPart?: string;
  path?: string;
  resourceMethods?: Record<string, unknown>;
};

/** Result of get_resources. */
export type GetResourcesResult = {
  position?: string;
  items?: unknown[];
};

/** Result of get_rest_api. */
export type GetRestApiResult = {
  id?: string;
  name?: string;
  description?: string;
  createdDate?: string;
  version?: string;
  warnings?: unknown[];
  binaryMediaTypes?: unknown[];
  minimumCompressionSize?: number;
  apiKeySource?: string;
  endpointConfiguration?: Record<string, unknown>;
  policy?: string;
  tags?: Record<string, unknown>;
  disableExecuteApiEndpoint?: boolean;
  rootResourceId?: string;
};

/** Result of get_rest_apis. */
export type GetRestApisResult = {
  position?: string;
  items?: unknown[];
};

/** Result of get_sdk. */
export type GetSdkResult = {
  contentType?: string;
  contentDisposition?: string;
  body?: unknown;
};

/** Result of get_sdk_type. */
export type GetSdkTypeResult = {
  id?: string;
  friendlyName?: string;
  description?: string;
  configurationProperties?: unknown[];
};

/** Result of get_sdk_types. */
export type GetSdkTypesResult = {
  position?: string;
  items?: unknown[];
};

/** Result of get_stage. */
export type GetStageResult = {
  deploymentId?: string;
  clientCertificateId?: string;
  stageName?: string;
  description?: string;
  cacheClusterEnabled?: boolean;
  cacheClusterSize?: string;
  cacheClusterStatus?: string;
  methodSettings?: Record<string, unknown>;
  variables?: Record<string, unknown>;
  documentationVersion?: string;
  accessLogSettings?: Record<string, unknown>;
  canarySettings?: Record<string, unknown>;
  tracingEnabled?: boolean;
  webAclArn?: string;
  tags?: Record<string, unknown>;
  createdDate?: string;
  lastUpdatedDate?: string;
};

/** Result of get_stages. */
export type GetStagesResult = {
  item?: unknown[];
};

/** Result of get_tags. */
export type GetTagsResult = {
  tags?: Record<string, unknown>;
};

/** Result of get_usage. */
export type GetUsageResult = {
  usagePlanId?: string;
  startDate?: string;
  endDate?: string;
  position?: string;
  items?: Record<string, unknown>;
};

/** Result of get_usage_plan. */
export type GetUsagePlanResult = {
  id?: string;
  name?: string;
  description?: string;
  apiStages?: unknown[];
  throttle?: Record<string, unknown>;
  quota?: Record<string, unknown>;
  productCode?: string;
  tags?: Record<string, unknown>;
};

/** Result of get_usage_plan_key. */
export type GetUsagePlanKeyResult = {
  id?: string;
  type?: string;
  value?: string;
  name?: string;
};

/** Result of get_usage_plan_keys. */
export type GetUsagePlanKeysResult = {
  position?: string;
  items?: unknown[];
};

/** Result of get_usage_plans. */
export type GetUsagePlansResult = {
  position?: string;
  items?: unknown[];
};

/** Result of get_vpc_link. */
export type GetVpcLinkResult = {
  id?: string;
  name?: string;
  description?: string;
  targetArns?: unknown[];
  status?: string;
  statusMessage?: string;
  tags?: Record<string, unknown>;
};

/** Result of get_vpc_links. */
export type GetVpcLinksResult = {
  position?: string;
  items?: unknown[];
};

/** Result of import_api_keys. */
export type ImportApiKeysResult = {
  ids?: unknown[];
  warnings?: unknown[];
};

/** Result of import_documentation_parts. */
export type ImportDocumentationPartsResult = {
  ids?: unknown[];
  warnings?: unknown[];
};

/** Result of import_rest_api. */
export type ImportRestApiResult = {
  id?: string;
  name?: string;
  description?: string;
  createdDate?: string;
  version?: string;
  warnings?: unknown[];
  binaryMediaTypes?: unknown[];
  minimumCompressionSize?: number;
  apiKeySource?: string;
  endpointConfiguration?: Record<string, unknown>;
  policy?: string;
  tags?: Record<string, unknown>;
  disableExecuteApiEndpoint?: boolean;
  rootResourceId?: string;
};

/** Result of put_gateway_response. */
export type PutGatewayResponseResult = {
  responseType?: string;
  statusCode?: string;
  responseParameters?: Record<string, unknown>;
  responseTemplates?: Record<string, unknown>;
  defaultResponse?: boolean;
};

/** Result of put_integration. */
export type PutIntegrationResult = {
  type?: string;
  httpMethod?: string;
  uri?: string;
  connectionType?: string;
  connectionId?: string;
  credentials?: string;
  requestParameters?: Record<string, unknown>;
  requestTemplates?: Record<string, unknown>;
  passthroughBehavior?: string;
  contentHandling?: string;
  timeoutInMillis?: number;
  cacheNamespace?: string;
  cacheKeyParameters?: unknown[];
  integrationResponses?: Record<string, unknown>;
  tlsConfig?: Record<string, unknown>;
};

/** Result of put_integration_response. */
export type PutIntegrationResponseResult = {
  statusCode?: string;
  selectionPattern?: string;
  responseParameters?: Record<string, unknown>;
  responseTemplates?: Record<string, unknown>;
  contentHandling?: string;
};

/** Result of put_method. */
export type PutMethodResult = {
  httpMethod?: string;
  authorizationType?: string;
  authorizerId?: string;
  apiKeyRequired?: boolean;
  requestValidatorId?: string;
  operationName?: string;
  requestParameters?: Record<string, unknown>;
  requestModels?: Record<string, unknown>;
  methodResponses?: Record<string, unknown>;
  methodIntegration?: Record<string, unknown>;
  authorizationScopes?: unknown[];
};

/** Result of put_method_response. */
export type PutMethodResponseResult = {
  statusCode?: string;
  responseParameters?: Record<string, unknown>;
  responseModels?: Record<string, unknown>;
};

/** Result of put_rest_api. */
export type PutRestApiResult = {
  id?: string;
  name?: string;
  description?: string;
  createdDate?: string;
  version?: string;
  warnings?: unknown[];
  binaryMediaTypes?: unknown[];
  minimumCompressionSize?: number;
  apiKeySource?: string;
  endpointConfiguration?: Record<string, unknown>;
  policy?: string;
  tags?: Record<string, unknown>;
  disableExecuteApiEndpoint?: boolean;
  rootResourceId?: string;
};

/** Result of reject_domain_name_access_association. */
export type RejectDomainNameAccessAssociationResult = {
};

/** Result of tag_resource. */
export type TagResourceResult = {
};

/** Result of run_invoke_authorizer. */
export type RunInvokeAuthorizerResult = {
  clientStatus?: number;
  log?: string;
  latency?: number;
  principalId?: string;
  policy?: string;
  authorization?: Record<string, unknown>;
  claims?: Record<string, unknown>;
};

/** Result of run_invoke_method. */
export type RunInvokeMethodResult = {
  status?: number;
  body?: string;
  headers?: Record<string, unknown>;
  multiValueHeaders?: Record<string, unknown>;
  log?: string;
  latency?: number;
};

/** Result of untag_resource. */
export type UntagResourceResult = {
};

/** Result of update_account. */
export type UpdateAccountResult = {
  cloudwatchRoleArn?: string;
  throttleSettings?: Record<string, unknown>;
  features?: unknown[];
  apiKeyVersion?: string;
};

/** Result of update_api_key. */
export type UpdateApiKeyResult = {
  id?: string;
  value?: string;
  name?: string;
  customerId?: string;
  description?: string;
  enabled?: boolean;
  createdDate?: string;
  lastUpdatedDate?: string;
  stageKeys?: unknown[];
  tags?: Record<string, unknown>;
};

/** Result of update_authorizer. */
export type UpdateAuthorizerResult = {
  id?: string;
  name?: string;
  type?: string;
  providerArNs?: unknown[];
  authType?: string;
  authorizerUri?: string;
  authorizerCredentials?: string;
  identitySource?: string;
  identityValidationExpression?: string;
  authorizerResultTtlInSeconds?: number;
};

/** Result of update_base_path_mapping. */
export type UpdateBasePathMappingResult = {
  basePath?: string;
  restApiId?: string;
  stage?: string;
};

/** Result of update_client_certificate. */
export type UpdateClientCertificateResult = {
  clientCertificateId?: string;
  description?: string;
  pemEncodedCertificate?: string;
  createdDate?: string;
  expirationDate?: string;
  tags?: Record<string, unknown>;
};

/** Result of update_deployment. */
export type UpdateDeploymentResult = {
  id?: string;
  description?: string;
  createdDate?: string;
  apiSummary?: Record<string, unknown>;
};

/** Result of update_documentation_part. */
export type UpdateDocumentationPartResult = {
  id?: string;
  location?: Record<string, unknown>;
  properties?: string;
};

/** Result of update_documentation_version. */
export type UpdateDocumentationVersionResult = {
  version?: string;
  createdDate?: string;
  description?: string;
};

/** Result of update_domain_name. */
export type UpdateDomainNameResult = {
  domainName?: string;
  domainNameId?: string;
  domainNameArn?: string;
  certificateName?: string;
  certificateArn?: string;
  certificateUploadDate?: string;
  regionalDomainName?: string;
  regionalHostedZoneId?: string;
  regionalCertificateName?: string;
  regionalCertificateArn?: string;
  distributionDomainName?: string;
  distributionHostedZoneId?: string;
  endpointConfiguration?: Record<string, unknown>;
  domainNameStatus?: string;
  domainNameStatusMessage?: string;
  securityPolicy?: string;
  tags?: Record<string, unknown>;
  mutualTlsAuthentication?: Record<string, unknown>;
  ownershipVerificationCertificateArn?: string;
  managementPolicy?: string;
  policy?: string;
  routingMode?: string;
};

/** Result of update_gateway_response. */
export type UpdateGatewayResponseResult = {
  responseType?: string;
  statusCode?: string;
  responseParameters?: Record<string, unknown>;
  responseTemplates?: Record<string, unknown>;
  defaultResponse?: boolean;
};

/** Result of update_integration. */
export type UpdateIntegrationResult = {
  type?: string;
  httpMethod?: string;
  uri?: string;
  connectionType?: string;
  connectionId?: string;
  credentials?: string;
  requestParameters?: Record<string, unknown>;
  requestTemplates?: Record<string, unknown>;
  passthroughBehavior?: string;
  contentHandling?: string;
  timeoutInMillis?: number;
  cacheNamespace?: string;
  cacheKeyParameters?: unknown[];
  integrationResponses?: Record<string, unknown>;
  tlsConfig?: Record<string, unknown>;
};

/** Result of update_integration_response. */
export type UpdateIntegrationResponseResult = {
  statusCode?: string;
  selectionPattern?: string;
  responseParameters?: Record<string, unknown>;
  responseTemplates?: Record<string, unknown>;
  contentHandling?: string;
};

/** Result of update_method. */
export type UpdateMethodResult = {
  httpMethod?: string;
  authorizationType?: string;
  authorizerId?: string;
  apiKeyRequired?: boolean;
  requestValidatorId?: string;
  operationName?: string;
  requestParameters?: Record<string, unknown>;
  requestModels?: Record<string, unknown>;
  methodResponses?: Record<string, unknown>;
  methodIntegration?: Record<string, unknown>;
  authorizationScopes?: unknown[];
};

/** Result of update_method_response. */
export type UpdateMethodResponseResult = {
  statusCode?: string;
  responseParameters?: Record<string, unknown>;
  responseModels?: Record<string, unknown>;
};

/** Result of update_model. */
export type UpdateModelResult = {
  id?: string;
  name?: string;
  description?: string;
  modelSchema?: string;
  contentType?: string;
};

/** Result of update_request_validator. */
export type UpdateRequestValidatorResult = {
  id?: string;
  name?: string;
  validateRequestBody?: boolean;
  validateRequestParameters?: boolean;
};

/** Result of update_resource. */
export type UpdateResourceResult = {
  id?: string;
  parentId?: string;
  pathPart?: string;
  path?: string;
  resourceMethods?: Record<string, unknown>;
};

/** Result of update_rest_api. */
export type UpdateRestApiResult = {
  id?: string;
  name?: string;
  description?: string;
  createdDate?: string;
  version?: string;
  warnings?: unknown[];
  binaryMediaTypes?: unknown[];
  minimumCompressionSize?: number;
  apiKeySource?: string;
  endpointConfiguration?: Record<string, unknown>;
  policy?: string;
  tags?: Record<string, unknown>;
  disableExecuteApiEndpoint?: boolean;
  rootResourceId?: string;
};

/** Result of update_stage. */
export type UpdateStageResult = {
  deploymentId?: string;
  clientCertificateId?: string;
  stageName?: string;
  description?: string;
  cacheClusterEnabled?: boolean;
  cacheClusterSize?: string;
  cacheClusterStatus?: string;
  methodSettings?: Record<string, unknown>;
  variables?: Record<string, unknown>;
  documentationVersion?: string;
  accessLogSettings?: Record<string, unknown>;
  canarySettings?: Record<string, unknown>;
  tracingEnabled?: boolean;
  webAclArn?: string;
  tags?: Record<string, unknown>;
  createdDate?: string;
  lastUpdatedDate?: string;
};

/** Result of update_usage. */
export type UpdateUsageResult = {
  usagePlanId?: string;
  startDate?: string;
  endDate?: string;
  position?: string;
  items?: Record<string, unknown>;
};

/** Result of update_usage_plan. */
export type UpdateUsagePlanResult = {
  id?: string;
  name?: string;
  description?: string;
  apiStages?: unknown[];
  throttle?: Record<string, unknown>;
  quota?: Record<string, unknown>;
  productCode?: string;
  tags?: Record<string, unknown>;
};

/** Result of update_vpc_link. */
export type UpdateVpcLinkResult = {
  id?: string;
  name?: string;
  description?: string;
  targetArns?: unknown[];
  status?: string;
  statusMessage?: string;
  tags?: Record<string, unknown>;
};

/** Lambda authorizer that validates a JWT and returns an IAM policy. */
export async function jwtAuthorizer(token: string, resource: string, userPoolId?: string, requiredClaims?: Record<string, unknown>, regionName?: string): Promise<Record<string, unknown>> {
  try {
    // TODO: implement jwt_authorizer
    throw new Error("jwt_authorizer not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "jwt_authorizer failed");
  }
}

/** Lambda authorizer that validates an API key stored in DynamoDB. */
export async function apiKeyAuthorizer(apiKey: string, tableName: string, resource: string, regionName?: string): Promise<Record<string, unknown>> {
  try {
    // TODO: implement api_key_authorizer
    throw new Error("api_key_authorizer not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "api_key_authorizer failed");
  }
}

/** Validate an API Gateway request body against a Pydantic model. */
export async function requestValidator(body?: string, model: unknown): Promise<ValidationResult> {
  try {
    // TODO: implement request_validator
    throw new Error("request_validator not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "request_validator failed");
  }
}

/** Per-user/per-IP rate limiter using DynamoDB atomic counters. */
export async function throttleGuard(key: string, tableName: string, limit: number, windowSeconds: number, regionName?: string): Promise<ThrottleResult> {
  try {
    // TODO: implement throttle_guard
    throw new Error("throttle_guard not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "throttle_guard failed");
  }
}

/** Store a new WebSocket connection in DynamoDB. */
export async function websocketConnect(connectionId: string, tableName: string, metadata?: Record<string, unknown>, regionName?: string): Promise<void> {
  try {
    // TODO: implement websocket_connect
    throw new Error("websocket_connect not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "websocket_connect failed");
  }
}

/** Remove a WebSocket connection from DynamoDB. */
export async function websocketDisconnect(connectionId: string, tableName: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement websocket_disconnect
    throw new Error("websocket_disconnect not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "websocket_disconnect failed");
  }
}

/** List all active WebSocket connections from DynamoDB. */
export async function websocketListConnections(tableName: string, regionName?: string): Promise<WebSocketConnection[]> {
  try {
    // TODO: implement websocket_list_connections
    throw new Error("websocket_list_connections not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "websocket_list_connections failed");
  }
}

/** Broadcast a message to all connected WebSocket clients. */
export async function websocketBroadcast(tableName: string, endpointUrl: string, message: unknown, regionName?: string): Promise<Record<string, unknown>> {
  try {
    // TODO: implement websocket_broadcast
    throw new Error("websocket_broadcast not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "websocket_broadcast failed");
  }
}

/** Create api key. */
export async function createApiKey(): Promise<CreateApiKeyResult> {
  try {
    // TODO: implement create_api_key
    throw new Error("create_api_key not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_api_key failed");
  }
}

/** Create authorizer. */
export async function createAuthorizer(restApiId: string, name: string, type: string): Promise<CreateAuthorizerResult> {
  try {
    // TODO: implement create_authorizer
    throw new Error("create_authorizer not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_authorizer failed");
  }
}

/** Create base path mapping. */
export async function createBasePathMapping(domainName: string, restApiId: string): Promise<CreateBasePathMappingResult> {
  try {
    // TODO: implement create_base_path_mapping
    throw new Error("create_base_path_mapping not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_base_path_mapping failed");
  }
}

/** Create deployment. */
export async function createDeployment(restApiId: string): Promise<CreateDeploymentResult> {
  try {
    // TODO: implement create_deployment
    throw new Error("create_deployment not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_deployment failed");
  }
}

/** Create documentation part. */
export async function createDocumentationPart(restApiId: string, location: Record<string, unknown>, properties: string): Promise<CreateDocumentationPartResult> {
  try {
    // TODO: implement create_documentation_part
    throw new Error("create_documentation_part not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_documentation_part failed");
  }
}

/** Create documentation version. */
export async function createDocumentationVersion(restApiId: string, documentationVersion: string): Promise<CreateDocumentationVersionResult> {
  try {
    // TODO: implement create_documentation_version
    throw new Error("create_documentation_version not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_documentation_version failed");
  }
}

/** Create domain name. */
export async function createDomainName(domainName: string): Promise<CreateDomainNameResult> {
  try {
    // TODO: implement create_domain_name
    throw new Error("create_domain_name not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_domain_name failed");
  }
}

/** Create domain name access association. */
export async function createDomainNameAccessAssociation(domainNameArn: string, accessAssociationSourceType: string, accessAssociationSource: string): Promise<CreateDomainNameAccessAssociationResult> {
  try {
    // TODO: implement create_domain_name_access_association
    throw new Error("create_domain_name_access_association not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_domain_name_access_association failed");
  }
}

/** Create model. */
export async function createModel(restApiId: string, name: string, contentType: string): Promise<CreateModelResult> {
  try {
    // TODO: implement create_model
    throw new Error("create_model not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_model failed");
  }
}

/** Create request validator. */
export async function createRequestValidator(restApiId: string): Promise<CreateRequestValidatorResult> {
  try {
    // TODO: implement create_request_validator
    throw new Error("create_request_validator not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_request_validator failed");
  }
}

/** Create resource. */
export async function createResource(restApiId: string, parentId: string, pathPart: string): Promise<CreateResourceResult> {
  try {
    // TODO: implement create_resource
    throw new Error("create_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_resource failed");
  }
}

/** Create rest api. */
export async function createRestApi(name: string): Promise<CreateRestApiResult> {
  try {
    // TODO: implement create_rest_api
    throw new Error("create_rest_api not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_rest_api failed");
  }
}

/** Create stage. */
export async function createStage(restApiId: string, stageName: string, deploymentId: string): Promise<CreateStageResult> {
  try {
    // TODO: implement create_stage
    throw new Error("create_stage not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_stage failed");
  }
}

/** Create usage plan. */
export async function createUsagePlan(name: string): Promise<CreateUsagePlanResult> {
  try {
    // TODO: implement create_usage_plan
    throw new Error("create_usage_plan not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_usage_plan failed");
  }
}

/** Create usage plan key. */
export async function createUsagePlanKey(usagePlanId: string, keyId: string, keyType: string): Promise<CreateUsagePlanKeyResult> {
  try {
    // TODO: implement create_usage_plan_key
    throw new Error("create_usage_plan_key not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_usage_plan_key failed");
  }
}

/** Create vpc link. */
export async function createVpcLink(name: string, targetArns: unknown[]): Promise<CreateVpcLinkResult> {
  try {
    // TODO: implement create_vpc_link
    throw new Error("create_vpc_link not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_vpc_link failed");
  }
}

/** Delete api key. */
export async function deleteApiKey(apiKey: string): Promise<DeleteApiKeyResult> {
  try {
    // TODO: implement delete_api_key
    throw new Error("delete_api_key not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_api_key failed");
  }
}

/** Delete authorizer. */
export async function deleteAuthorizer(restApiId: string, authorizerId: string): Promise<DeleteAuthorizerResult> {
  try {
    // TODO: implement delete_authorizer
    throw new Error("delete_authorizer not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_authorizer failed");
  }
}

/** Delete base path mapping. */
export async function deleteBasePathMapping(domainName: string, basePath: string): Promise<DeleteBasePathMappingResult> {
  try {
    // TODO: implement delete_base_path_mapping
    throw new Error("delete_base_path_mapping not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_base_path_mapping failed");
  }
}

/** Delete client certificate. */
export async function deleteClientCertificate(clientCertificateId: string): Promise<DeleteClientCertificateResult> {
  try {
    // TODO: implement delete_client_certificate
    throw new Error("delete_client_certificate not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_client_certificate failed");
  }
}

/** Delete deployment. */
export async function deleteDeployment(restApiId: string, deploymentId: string): Promise<DeleteDeploymentResult> {
  try {
    // TODO: implement delete_deployment
    throw new Error("delete_deployment not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_deployment failed");
  }
}

/** Delete documentation part. */
export async function deleteDocumentationPart(restApiId: string, documentationPartId: string): Promise<DeleteDocumentationPartResult> {
  try {
    // TODO: implement delete_documentation_part
    throw new Error("delete_documentation_part not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_documentation_part failed");
  }
}

/** Delete documentation version. */
export async function deleteDocumentationVersion(restApiId: string, documentationVersion: string): Promise<DeleteDocumentationVersionResult> {
  try {
    // TODO: implement delete_documentation_version
    throw new Error("delete_documentation_version not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_documentation_version failed");
  }
}

/** Delete domain name. */
export async function deleteDomainName(domainName: string): Promise<DeleteDomainNameResult> {
  try {
    // TODO: implement delete_domain_name
    throw new Error("delete_domain_name not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_domain_name failed");
  }
}

/** Delete domain name access association. */
export async function deleteDomainNameAccessAssociation(domainNameAccessAssociationArn: string): Promise<DeleteDomainNameAccessAssociationResult> {
  try {
    // TODO: implement delete_domain_name_access_association
    throw new Error("delete_domain_name_access_association not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_domain_name_access_association failed");
  }
}

/** Delete gateway response. */
export async function deleteGatewayResponse(restApiId: string, responseType: string): Promise<DeleteGatewayResponseResult> {
  try {
    // TODO: implement delete_gateway_response
    throw new Error("delete_gateway_response not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_gateway_response failed");
  }
}

/** Delete integration. */
export async function deleteIntegration(restApiId: string, resourceId: string, httpMethod: string): Promise<DeleteIntegrationResult> {
  try {
    // TODO: implement delete_integration
    throw new Error("delete_integration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_integration failed");
  }
}

/** Delete integration response. */
export async function deleteIntegrationResponse(restApiId: string, resourceId: string, httpMethod: string, statusCode: string): Promise<DeleteIntegrationResponseResult> {
  try {
    // TODO: implement delete_integration_response
    throw new Error("delete_integration_response not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_integration_response failed");
  }
}

/** Delete method. */
export async function deleteMethod(restApiId: string, resourceId: string, httpMethod: string): Promise<DeleteMethodResult> {
  try {
    // TODO: implement delete_method
    throw new Error("delete_method not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_method failed");
  }
}

/** Delete method response. */
export async function deleteMethodResponse(restApiId: string, resourceId: string, httpMethod: string, statusCode: string): Promise<DeleteMethodResponseResult> {
  try {
    // TODO: implement delete_method_response
    throw new Error("delete_method_response not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_method_response failed");
  }
}

/** Delete model. */
export async function deleteModel(restApiId: string, modelName: string): Promise<DeleteModelResult> {
  try {
    // TODO: implement delete_model
    throw new Error("delete_model not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_model failed");
  }
}

/** Delete request validator. */
export async function deleteRequestValidator(restApiId: string, requestValidatorId: string): Promise<DeleteRequestValidatorResult> {
  try {
    // TODO: implement delete_request_validator
    throw new Error("delete_request_validator not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_request_validator failed");
  }
}

/** Delete resource. */
export async function deleteResource(restApiId: string, resourceId: string): Promise<DeleteResourceResult> {
  try {
    // TODO: implement delete_resource
    throw new Error("delete_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_resource failed");
  }
}

/** Delete rest api. */
export async function deleteRestApi(restApiId: string): Promise<DeleteRestApiResult> {
  try {
    // TODO: implement delete_rest_api
    throw new Error("delete_rest_api not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_rest_api failed");
  }
}

/** Delete stage. */
export async function deleteStage(restApiId: string, stageName: string): Promise<DeleteStageResult> {
  try {
    // TODO: implement delete_stage
    throw new Error("delete_stage not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_stage failed");
  }
}

/** Delete usage plan. */
export async function deleteUsagePlan(usagePlanId: string): Promise<DeleteUsagePlanResult> {
  try {
    // TODO: implement delete_usage_plan
    throw new Error("delete_usage_plan not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_usage_plan failed");
  }
}

/** Delete usage plan key. */
export async function deleteUsagePlanKey(usagePlanId: string, keyId: string): Promise<DeleteUsagePlanKeyResult> {
  try {
    // TODO: implement delete_usage_plan_key
    throw new Error("delete_usage_plan_key not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_usage_plan_key failed");
  }
}

/** Delete vpc link. */
export async function deleteVpcLink(vpcLinkId: string): Promise<DeleteVpcLinkResult> {
  try {
    // TODO: implement delete_vpc_link
    throw new Error("delete_vpc_link not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_vpc_link failed");
  }
}

/** Flush stage authorizers cache. */
export async function flushStageAuthorizersCache(restApiId: string, stageName: string): Promise<FlushStageAuthorizersCacheResult> {
  try {
    // TODO: implement flush_stage_authorizers_cache
    throw new Error("flush_stage_authorizers_cache not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "flush_stage_authorizers_cache failed");
  }
}

/** Flush stage cache. */
export async function flushStageCache(restApiId: string, stageName: string): Promise<FlushStageCacheResult> {
  try {
    // TODO: implement flush_stage_cache
    throw new Error("flush_stage_cache not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "flush_stage_cache failed");
  }
}

/** Generate client certificate. */
export async function generateClientCertificate(): Promise<GenerateClientCertificateResult> {
  try {
    // TODO: implement generate_client_certificate
    throw new Error("generate_client_certificate not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "generate_client_certificate failed");
  }
}

/** Get account. */
export async function getAccount(): Promise<GetAccountResult> {
  try {
    // TODO: implement get_account
    throw new Error("get_account not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_account failed");
  }
}

/** Get api key. */
export async function getApiKey(apiKey: string): Promise<GetApiKeyResult> {
  try {
    // TODO: implement get_api_key
    throw new Error("get_api_key not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_api_key failed");
  }
}

/** Get api keys. */
export async function getApiKeys(): Promise<GetApiKeysResult> {
  try {
    // TODO: implement get_api_keys
    throw new Error("get_api_keys not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_api_keys failed");
  }
}

/** Get authorizer. */
export async function getAuthorizer(restApiId: string, authorizerId: string): Promise<GetAuthorizerResult> {
  try {
    // TODO: implement get_authorizer
    throw new Error("get_authorizer not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_authorizer failed");
  }
}

/** Get authorizers. */
export async function getAuthorizers(restApiId: string): Promise<GetAuthorizersResult> {
  try {
    // TODO: implement get_authorizers
    throw new Error("get_authorizers not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_authorizers failed");
  }
}

/** Get base path mapping. */
export async function getBasePathMapping(domainName: string, basePath: string): Promise<GetBasePathMappingResult> {
  try {
    // TODO: implement get_base_path_mapping
    throw new Error("get_base_path_mapping not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_base_path_mapping failed");
  }
}

/** Get base path mappings. */
export async function getBasePathMappings(domainName: string): Promise<GetBasePathMappingsResult> {
  try {
    // TODO: implement get_base_path_mappings
    throw new Error("get_base_path_mappings not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_base_path_mappings failed");
  }
}

/** Get client certificate. */
export async function getClientCertificate(clientCertificateId: string): Promise<GetClientCertificateResult> {
  try {
    // TODO: implement get_client_certificate
    throw new Error("get_client_certificate not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_client_certificate failed");
  }
}

/** Get client certificates. */
export async function getClientCertificates(): Promise<GetClientCertificatesResult> {
  try {
    // TODO: implement get_client_certificates
    throw new Error("get_client_certificates not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_client_certificates failed");
  }
}

/** Get deployment. */
export async function getDeployment(restApiId: string, deploymentId: string): Promise<GetDeploymentResult> {
  try {
    // TODO: implement get_deployment
    throw new Error("get_deployment not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_deployment failed");
  }
}

/** Get deployments. */
export async function getDeployments(restApiId: string): Promise<GetDeploymentsResult> {
  try {
    // TODO: implement get_deployments
    throw new Error("get_deployments not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_deployments failed");
  }
}

/** Get documentation part. */
export async function getDocumentationPart(restApiId: string, documentationPartId: string): Promise<GetDocumentationPartResult> {
  try {
    // TODO: implement get_documentation_part
    throw new Error("get_documentation_part not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_documentation_part failed");
  }
}

/** Get documentation parts. */
export async function getDocumentationParts(restApiId: string): Promise<GetDocumentationPartsResult> {
  try {
    // TODO: implement get_documentation_parts
    throw new Error("get_documentation_parts not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_documentation_parts failed");
  }
}

/** Get documentation version. */
export async function getDocumentationVersion(restApiId: string, documentationVersion: string): Promise<GetDocumentationVersionResult> {
  try {
    // TODO: implement get_documentation_version
    throw new Error("get_documentation_version not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_documentation_version failed");
  }
}

/** Get documentation versions. */
export async function getDocumentationVersions(restApiId: string): Promise<GetDocumentationVersionsResult> {
  try {
    // TODO: implement get_documentation_versions
    throw new Error("get_documentation_versions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_documentation_versions failed");
  }
}

/** Get domain name. */
export async function getDomainName(domainName: string): Promise<GetDomainNameResult> {
  try {
    // TODO: implement get_domain_name
    throw new Error("get_domain_name not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_domain_name failed");
  }
}

/** Get domain name access associations. */
export async function getDomainNameAccessAssociations(): Promise<GetDomainNameAccessAssociationsResult> {
  try {
    // TODO: implement get_domain_name_access_associations
    throw new Error("get_domain_name_access_associations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_domain_name_access_associations failed");
  }
}

/** Get domain names. */
export async function getDomainNames(): Promise<GetDomainNamesResult> {
  try {
    // TODO: implement get_domain_names
    throw new Error("get_domain_names not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_domain_names failed");
  }
}

/** Get export. */
export async function getExport(restApiId: string, stageName: string, exportType: string): Promise<GetExportResult> {
  try {
    // TODO: implement get_export
    throw new Error("get_export not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_export failed");
  }
}

/** Get gateway response. */
export async function getGatewayResponse(restApiId: string, responseType: string): Promise<GetGatewayResponseResult> {
  try {
    // TODO: implement get_gateway_response
    throw new Error("get_gateway_response not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_gateway_response failed");
  }
}

/** Get gateway responses. */
export async function getGatewayResponses(restApiId: string): Promise<GetGatewayResponsesResult> {
  try {
    // TODO: implement get_gateway_responses
    throw new Error("get_gateway_responses not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_gateway_responses failed");
  }
}

/** Get integration. */
export async function getIntegration(restApiId: string, resourceId: string, httpMethod: string): Promise<GetIntegrationResult> {
  try {
    // TODO: implement get_integration
    throw new Error("get_integration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_integration failed");
  }
}

/** Get integration response. */
export async function getIntegrationResponse(restApiId: string, resourceId: string, httpMethod: string, statusCode: string): Promise<GetIntegrationResponseResult> {
  try {
    // TODO: implement get_integration_response
    throw new Error("get_integration_response not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_integration_response failed");
  }
}

/** Get method. */
export async function getMethod(restApiId: string, resourceId: string, httpMethod: string): Promise<GetMethodResult> {
  try {
    // TODO: implement get_method
    throw new Error("get_method not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_method failed");
  }
}

/** Get method response. */
export async function getMethodResponse(restApiId: string, resourceId: string, httpMethod: string, statusCode: string): Promise<GetMethodResponseResult> {
  try {
    // TODO: implement get_method_response
    throw new Error("get_method_response not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_method_response failed");
  }
}

/** Get model. */
export async function getModel(restApiId: string, modelName: string): Promise<GetModelResult> {
  try {
    // TODO: implement get_model
    throw new Error("get_model not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_model failed");
  }
}

/** Get model template. */
export async function getModelTemplate(restApiId: string, modelName: string): Promise<GetModelTemplateResult> {
  try {
    // TODO: implement get_model_template
    throw new Error("get_model_template not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_model_template failed");
  }
}

/** Get models. */
export async function getModels(restApiId: string): Promise<GetModelsResult> {
  try {
    // TODO: implement get_models
    throw new Error("get_models not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_models failed");
  }
}

/** Get request validator. */
export async function getRequestValidator(restApiId: string, requestValidatorId: string): Promise<GetRequestValidatorResult> {
  try {
    // TODO: implement get_request_validator
    throw new Error("get_request_validator not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_request_validator failed");
  }
}

/** Get request validators. */
export async function getRequestValidators(restApiId: string): Promise<GetRequestValidatorsResult> {
  try {
    // TODO: implement get_request_validators
    throw new Error("get_request_validators not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_request_validators failed");
  }
}

/** Get resource. */
export async function getResource(restApiId: string, resourceId: string): Promise<GetResourceResult> {
  try {
    // TODO: implement get_resource
    throw new Error("get_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_resource failed");
  }
}

/** Get resources. */
export async function getResources(restApiId: string): Promise<GetResourcesResult> {
  try {
    // TODO: implement get_resources
    throw new Error("get_resources not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_resources failed");
  }
}

/** Get rest api. */
export async function getRestApi(restApiId: string): Promise<GetRestApiResult> {
  try {
    // TODO: implement get_rest_api
    throw new Error("get_rest_api not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_rest_api failed");
  }
}

/** Get rest apis. */
export async function getRestApis(): Promise<GetRestApisResult> {
  try {
    // TODO: implement get_rest_apis
    throw new Error("get_rest_apis not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_rest_apis failed");
  }
}

/** Get sdk. */
export async function getSdk(restApiId: string, stageName: string, sdkType: string): Promise<GetSdkResult> {
  try {
    // TODO: implement get_sdk
    throw new Error("get_sdk not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_sdk failed");
  }
}

/** Get sdk type. */
export async function getSdkType(id: string): Promise<GetSdkTypeResult> {
  try {
    // TODO: implement get_sdk_type
    throw new Error("get_sdk_type not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_sdk_type failed");
  }
}

/** Get sdk types. */
export async function getSdkTypes(): Promise<GetSdkTypesResult> {
  try {
    // TODO: implement get_sdk_types
    throw new Error("get_sdk_types not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_sdk_types failed");
  }
}

/** Get stage. */
export async function getStage(restApiId: string, stageName: string): Promise<GetStageResult> {
  try {
    // TODO: implement get_stage
    throw new Error("get_stage not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_stage failed");
  }
}

/** Get stages. */
export async function getStages(restApiId: string): Promise<GetStagesResult> {
  try {
    // TODO: implement get_stages
    throw new Error("get_stages not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_stages failed");
  }
}

/** Get tags. */
export async function getTags(resourceArn: string): Promise<GetTagsResult> {
  try {
    // TODO: implement get_tags
    throw new Error("get_tags not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_tags failed");
  }
}

/** Get usage. */
export async function getUsage(usagePlanId: string, startDate: string, endDate: string): Promise<GetUsageResult> {
  try {
    // TODO: implement get_usage
    throw new Error("get_usage not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_usage failed");
  }
}

/** Get usage plan. */
export async function getUsagePlan(usagePlanId: string): Promise<GetUsagePlanResult> {
  try {
    // TODO: implement get_usage_plan
    throw new Error("get_usage_plan not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_usage_plan failed");
  }
}

/** Get usage plan key. */
export async function getUsagePlanKey(usagePlanId: string, keyId: string): Promise<GetUsagePlanKeyResult> {
  try {
    // TODO: implement get_usage_plan_key
    throw new Error("get_usage_plan_key not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_usage_plan_key failed");
  }
}

/** Get usage plan keys. */
export async function getUsagePlanKeys(usagePlanId: string): Promise<GetUsagePlanKeysResult> {
  try {
    // TODO: implement get_usage_plan_keys
    throw new Error("get_usage_plan_keys not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_usage_plan_keys failed");
  }
}

/** Get usage plans. */
export async function getUsagePlans(): Promise<GetUsagePlansResult> {
  try {
    // TODO: implement get_usage_plans
    throw new Error("get_usage_plans not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_usage_plans failed");
  }
}

/** Get vpc link. */
export async function getVpcLink(vpcLinkId: string): Promise<GetVpcLinkResult> {
  try {
    // TODO: implement get_vpc_link
    throw new Error("get_vpc_link not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_vpc_link failed");
  }
}

/** Get vpc links. */
export async function getVpcLinks(): Promise<GetVpcLinksResult> {
  try {
    // TODO: implement get_vpc_links
    throw new Error("get_vpc_links not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_vpc_links failed");
  }
}

/** Import api keys. */
export async function importApiKeys(body: unknown, format: string): Promise<ImportApiKeysResult> {
  try {
    // TODO: implement import_api_keys
    throw new Error("import_api_keys not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "import_api_keys failed");
  }
}

/** Import documentation parts. */
export async function importDocumentationParts(restApiId: string, body: unknown): Promise<ImportDocumentationPartsResult> {
  try {
    // TODO: implement import_documentation_parts
    throw new Error("import_documentation_parts not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "import_documentation_parts failed");
  }
}

/** Import rest api. */
export async function importRestApi(body: unknown): Promise<ImportRestApiResult> {
  try {
    // TODO: implement import_rest_api
    throw new Error("import_rest_api not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "import_rest_api failed");
  }
}

/** Put gateway response. */
export async function putGatewayResponse(restApiId: string, responseType: string): Promise<PutGatewayResponseResult> {
  try {
    // TODO: implement put_gateway_response
    throw new Error("put_gateway_response not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_gateway_response failed");
  }
}

/** Put integration. */
export async function putIntegration(restApiId: string, resourceId: string, httpMethod: string, type: string): Promise<PutIntegrationResult> {
  try {
    // TODO: implement put_integration
    throw new Error("put_integration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_integration failed");
  }
}

/** Put integration response. */
export async function putIntegrationResponse(restApiId: string, resourceId: string, httpMethod: string, statusCode: string): Promise<PutIntegrationResponseResult> {
  try {
    // TODO: implement put_integration_response
    throw new Error("put_integration_response not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_integration_response failed");
  }
}

/** Put method. */
export async function putMethod(restApiId: string, resourceId: string, httpMethod: string, authorizationType: string): Promise<PutMethodResult> {
  try {
    // TODO: implement put_method
    throw new Error("put_method not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_method failed");
  }
}

/** Put method response. */
export async function putMethodResponse(restApiId: string, resourceId: string, httpMethod: string, statusCode: string): Promise<PutMethodResponseResult> {
  try {
    // TODO: implement put_method_response
    throw new Error("put_method_response not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_method_response failed");
  }
}

/** Put rest api. */
export async function putRestApi(restApiId: string, body: unknown): Promise<PutRestApiResult> {
  try {
    // TODO: implement put_rest_api
    throw new Error("put_rest_api not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_rest_api failed");
  }
}

/** Reject domain name access association. */
export async function rejectDomainNameAccessAssociation(domainNameAccessAssociationArn: string, domainNameArn: string): Promise<RejectDomainNameAccessAssociationResult> {
  try {
    // TODO: implement reject_domain_name_access_association
    throw new Error("reject_domain_name_access_association not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "reject_domain_name_access_association failed");
  }
}

/** Tag resource. */
export async function tagResource(resourceArn: string, tags: Record<string, unknown>): Promise<TagResourceResult> {
  try {
    // TODO: implement tag_resource
    throw new Error("tag_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "tag_resource failed");
  }
}

/** Test invoke authorizer. */
export async function runInvokeAuthorizer(restApiId: string, authorizerId: string): Promise<RunInvokeAuthorizerResult> {
  try {
    // TODO: implement run_invoke_authorizer
    throw new Error("run_invoke_authorizer not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "run_invoke_authorizer failed");
  }
}

/** Test invoke method. */
export async function runInvokeMethod(restApiId: string, resourceId: string, httpMethod: string): Promise<RunInvokeMethodResult> {
  try {
    // TODO: implement run_invoke_method
    throw new Error("run_invoke_method not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "run_invoke_method failed");
  }
}

/** Untag resource. */
export async function untagResource(resourceArn: string, tagKeys: unknown[]): Promise<UntagResourceResult> {
  try {
    // TODO: implement untag_resource
    throw new Error("untag_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "untag_resource failed");
  }
}

/** Update account. */
export async function updateAccount(): Promise<UpdateAccountResult> {
  try {
    // TODO: implement update_account
    throw new Error("update_account not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_account failed");
  }
}

/** Update api key. */
export async function updateApiKey(apiKey: string): Promise<UpdateApiKeyResult> {
  try {
    // TODO: implement update_api_key
    throw new Error("update_api_key not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_api_key failed");
  }
}

/** Update authorizer. */
export async function updateAuthorizer(restApiId: string, authorizerId: string): Promise<UpdateAuthorizerResult> {
  try {
    // TODO: implement update_authorizer
    throw new Error("update_authorizer not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_authorizer failed");
  }
}

/** Update base path mapping. */
export async function updateBasePathMapping(domainName: string, basePath: string): Promise<UpdateBasePathMappingResult> {
  try {
    // TODO: implement update_base_path_mapping
    throw new Error("update_base_path_mapping not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_base_path_mapping failed");
  }
}

/** Update client certificate. */
export async function updateClientCertificate(clientCertificateId: string): Promise<UpdateClientCertificateResult> {
  try {
    // TODO: implement update_client_certificate
    throw new Error("update_client_certificate not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_client_certificate failed");
  }
}

/** Update deployment. */
export async function updateDeployment(restApiId: string, deploymentId: string): Promise<UpdateDeploymentResult> {
  try {
    // TODO: implement update_deployment
    throw new Error("update_deployment not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_deployment failed");
  }
}

/** Update documentation part. */
export async function updateDocumentationPart(restApiId: string, documentationPartId: string): Promise<UpdateDocumentationPartResult> {
  try {
    // TODO: implement update_documentation_part
    throw new Error("update_documentation_part not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_documentation_part failed");
  }
}

/** Update documentation version. */
export async function updateDocumentationVersion(restApiId: string, documentationVersion: string): Promise<UpdateDocumentationVersionResult> {
  try {
    // TODO: implement update_documentation_version
    throw new Error("update_documentation_version not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_documentation_version failed");
  }
}

/** Update domain name. */
export async function updateDomainName(domainName: string): Promise<UpdateDomainNameResult> {
  try {
    // TODO: implement update_domain_name
    throw new Error("update_domain_name not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_domain_name failed");
  }
}

/** Update gateway response. */
export async function updateGatewayResponse(restApiId: string, responseType: string): Promise<UpdateGatewayResponseResult> {
  try {
    // TODO: implement update_gateway_response
    throw new Error("update_gateway_response not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_gateway_response failed");
  }
}

/** Update integration. */
export async function updateIntegration(restApiId: string, resourceId: string, httpMethod: string): Promise<UpdateIntegrationResult> {
  try {
    // TODO: implement update_integration
    throw new Error("update_integration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_integration failed");
  }
}

/** Update integration response. */
export async function updateIntegrationResponse(restApiId: string, resourceId: string, httpMethod: string, statusCode: string): Promise<UpdateIntegrationResponseResult> {
  try {
    // TODO: implement update_integration_response
    throw new Error("update_integration_response not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_integration_response failed");
  }
}

/** Update method. */
export async function updateMethod(restApiId: string, resourceId: string, httpMethod: string): Promise<UpdateMethodResult> {
  try {
    // TODO: implement update_method
    throw new Error("update_method not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_method failed");
  }
}

/** Update method response. */
export async function updateMethodResponse(restApiId: string, resourceId: string, httpMethod: string, statusCode: string): Promise<UpdateMethodResponseResult> {
  try {
    // TODO: implement update_method_response
    throw new Error("update_method_response not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_method_response failed");
  }
}

/** Update model. */
export async function updateModel(restApiId: string, modelName: string): Promise<UpdateModelResult> {
  try {
    // TODO: implement update_model
    throw new Error("update_model not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_model failed");
  }
}

/** Update request validator. */
export async function updateRequestValidator(restApiId: string, requestValidatorId: string): Promise<UpdateRequestValidatorResult> {
  try {
    // TODO: implement update_request_validator
    throw new Error("update_request_validator not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_request_validator failed");
  }
}

/** Update resource. */
export async function updateResource(restApiId: string, resourceId: string): Promise<UpdateResourceResult> {
  try {
    // TODO: implement update_resource
    throw new Error("update_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_resource failed");
  }
}

/** Update rest api. */
export async function updateRestApi(restApiId: string): Promise<UpdateRestApiResult> {
  try {
    // TODO: implement update_rest_api
    throw new Error("update_rest_api not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_rest_api failed");
  }
}

/** Update stage. */
export async function updateStage(restApiId: string, stageName: string): Promise<UpdateStageResult> {
  try {
    // TODO: implement update_stage
    throw new Error("update_stage not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_stage failed");
  }
}

/** Update usage. */
export async function updateUsage(usagePlanId: string, keyId: string): Promise<UpdateUsageResult> {
  try {
    // TODO: implement update_usage
    throw new Error("update_usage not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_usage failed");
  }
}

/** Update usage plan. */
export async function updateUsagePlan(usagePlanId: string): Promise<UpdateUsagePlanResult> {
  try {
    // TODO: implement update_usage_plan
    throw new Error("update_usage_plan not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_usage_plan failed");
  }
}

/** Update vpc link. */
export async function updateVpcLink(vpcLinkId: string): Promise<UpdateVpcLinkResult> {
  try {
    // TODO: implement update_vpc_link
    throw new Error("update_vpc_link not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_vpc_link failed");
  }
}
