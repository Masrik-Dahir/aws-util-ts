import { AppRunnerClient } from "@aws-sdk/client-apprunner";
import { getClient } from "./client";
import { wrapAwsError } from "./exceptions";

/** Full description of an App Runner service. */
export type AppRunnerService = {
  serviceArn: string;
  serviceName: string;
  serviceId: string;
  serviceUrl?: string;
  status: string;
  autoScalingConfigurationArn?: string;
  sourceType?: string;
  createdAt?: string;
  updatedAt?: string;
};

/** Lightweight service summary returned by ``list_services``. */
export type AppRunnerServiceSummary = {
  serviceArn: string;
  serviceName: string;
  serviceId: string;
  status: string;
  serviceUrl?: string;
  createdAt?: string;
  updatedAt?: string;
};

/** Auto-scaling configuration summary. */
export type AppRunnerAutoScalingConfig = {
  autoScalingConfigurationArn: string;
  autoScalingConfigurationName: string;
  autoScalingConfigurationRevision: number;
  maxConcurrency?: number;
  maxSize?: number;
  minSize?: number;
  status?: string;
};

/** Source connection summary. */
export type AppRunnerConnection = {
  connectionArn: string;
  connectionName: string;
  providerType: string;
  status: string;
  createdAt?: string;
};

/** Observability configuration summary. */
export type AppRunnerObservabilityConfig = {
  observabilityConfigurationArn: string;
  observabilityConfigurationName: string;
  observabilityConfigurationRevision: number;
  traceConfiguration?: Record<string, unknown>;
  status?: string;
};

/** Summary of an App Runner operation. */
export type AppRunnerOperation = {
  id?: string;
  type?: string;
  status?: string;
  targetArn?: string;
  startedAt?: string;
  endedAt?: string;
};

/** Result of associate_custom_domain. */
export type AssociateCustomDomainResult = {
  dnsTarget?: string;
  serviceArn?: string;
  customDomain?: Record<string, unknown>;
  vpcDnsTargets?: Record<string, unknown>[];
};

/** Result of create_vpc_connector. */
export type CreateVpcConnectorResult = {
  vpcConnector?: Record<string, unknown>;
};

/** Result of create_vpc_ingress_connection. */
export type CreateVpcIngressConnectionResult = {
  vpcIngressConnection?: Record<string, unknown>;
};

/** Result of delete_auto_scaling_configuration. */
export type DeleteAutoScalingConfigurationResult = {
  autoScalingConfiguration?: Record<string, unknown>;
};

/** Result of delete_connection. */
export type DeleteConnectionResult = {
  connection?: Record<string, unknown>;
};

/** Result of delete_observability_configuration. */
export type DeleteObservabilityConfigurationResult = {
  observabilityConfiguration?: Record<string, unknown>;
};

/** Result of delete_vpc_connector. */
export type DeleteVpcConnectorResult = {
  vpcConnector?: Record<string, unknown>;
};

/** Result of delete_vpc_ingress_connection. */
export type DeleteVpcIngressConnectionResult = {
  vpcIngressConnection?: Record<string, unknown>;
};

/** Result of describe_auto_scaling_configuration. */
export type DescribeAutoScalingConfigurationResult = {
  autoScalingConfiguration?: Record<string, unknown>;
};

/** Result of describe_custom_domains. */
export type DescribeCustomDomainsResult = {
  dnsTarget?: string;
  serviceArn?: string;
  customDomains?: Record<string, unknown>[];
  vpcDnsTargets?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of describe_observability_configuration. */
export type DescribeObservabilityConfigurationResult = {
  observabilityConfiguration?: Record<string, unknown>;
};

/** Result of describe_vpc_connector. */
export type DescribeVpcConnectorResult = {
  vpcConnector?: Record<string, unknown>;
};

/** Result of describe_vpc_ingress_connection. */
export type DescribeVpcIngressConnectionResult = {
  vpcIngressConnection?: Record<string, unknown>;
};

/** Result of disassociate_custom_domain. */
export type DisassociateCustomDomainResult = {
  dnsTarget?: string;
  serviceArn?: string;
  customDomain?: Record<string, unknown>;
  vpcDnsTargets?: Record<string, unknown>[];
};

/** Result of list_observability_configurations. */
export type ListObservabilityConfigurationsResult = {
  observabilityConfigurationSummaryList?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_services_for_auto_scaling_configuration. */
export type ListServicesForAutoScalingConfigurationResult = {
  serviceArnList?: string[];
  nextToken?: string;
};

/** Result of list_tags_for_resource. */
export type ListTagsForResourceResult = {
  tags?: Record<string, unknown>[];
};

/** Result of list_vpc_connectors. */
export type ListVpcConnectorsResult = {
  vpcConnectors?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_vpc_ingress_connections. */
export type ListVpcIngressConnectionsResult = {
  vpcIngressConnectionSummaryList?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of update_default_auto_scaling_configuration. */
export type UpdateDefaultAutoScalingConfigurationResult = {
  autoScalingConfiguration?: Record<string, unknown>;
};

/** Result of update_vpc_ingress_connection. */
export type UpdateVpcIngressConnectionResult = {
  vpcIngressConnection?: Record<string, unknown>;
};

/** Create a new App Runner service. */
export async function createService(serviceName: string, sourceConfiguration: Record<string, unknown>, instanceConfiguration?: Record<string, unknown>, tags?: Record<string, unknown>[], autoScalingConfigurationArn?: string, healthCheckConfiguration?: Record<string, unknown>, regionName?: string): Promise<AppRunnerService> {
  try {
    // TODO: implement create_service
    throw new Error("create_service not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_service failed");
  }
}

/** Describe an App Runner service. */
export async function describeService(serviceArn: string, regionName?: string): Promise<AppRunnerService> {
  try {
    // TODO: implement describe_service
    throw new Error("describe_service not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_service failed");
  }
}

/** List all App Runner services in the account/region. */
export async function listServices(regionName?: string): Promise<AppRunnerServiceSummary[]> {
  try {
    // TODO: implement list_services
    throw new Error("list_services not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_services failed");
  }
}

/** Delete an App Runner service. */
export async function deleteService(serviceArn: string, regionName?: string): Promise<AppRunnerService> {
  try {
    // TODO: implement delete_service
    throw new Error("delete_service not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_service failed");
  }
}

/** Update an existing App Runner service. */
export async function updateService(serviceArn: string, sourceConfiguration?: Record<string, unknown>, instanceConfiguration?: Record<string, unknown>, autoScalingConfigurationArn?: string, healthCheckConfiguration?: Record<string, unknown>, regionName?: string): Promise<AppRunnerService> {
  try {
    // TODO: implement update_service
    throw new Error("update_service not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_service failed");
  }
}

/** Pause a running App Runner service. */
export async function pauseService(serviceArn: string, regionName?: string): Promise<AppRunnerService> {
  try {
    // TODO: implement pause_service
    throw new Error("pause_service not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "pause_service failed");
  }
}

/** Resume a paused App Runner service. */
export async function resumeService(serviceArn: string, regionName?: string): Promise<AppRunnerService> {
  try {
    // TODO: implement resume_service
    throw new Error("resume_service not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "resume_service failed");
  }
}

/** Create an auto-scaling configuration. */
export async function createAutoScalingConfiguration(autoScalingConfigurationName: string, maxConcurrency: number, maxSize: number, minSize: number, tags?: Record<string, unknown>[], regionName?: string): Promise<AppRunnerAutoScalingConfig> {
  try {
    // TODO: implement create_auto_scaling_configuration
    throw new Error("create_auto_scaling_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_auto_scaling_configuration failed");
  }
}

/** List auto-scaling configurations. */
export async function listAutoScalingConfigurations(autoScalingConfigurationName?: string, regionName?: string): Promise<AppRunnerAutoScalingConfig[]> {
  try {
    // TODO: implement list_auto_scaling_configurations
    throw new Error("list_auto_scaling_configurations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_auto_scaling_configurations failed");
  }
}

/** Create a source connection. */
export async function createConnection(connectionName: string, providerType: string, tags?: Record<string, unknown>[], regionName?: string): Promise<AppRunnerConnection> {
  try {
    // TODO: implement create_connection
    throw new Error("create_connection not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_connection failed");
  }
}

/** List source connections. */
export async function listConnections(connectionName?: string, regionName?: string): Promise<AppRunnerConnection[]> {
  try {
    // TODO: implement list_connections
    throw new Error("list_connections not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_connections failed");
  }
}

/** Create an observability configuration. */
export async function createObservabilityConfiguration(observabilityConfigurationName: string, traceConfiguration?: Record<string, unknown>, tags?: Record<string, unknown>[], regionName?: string): Promise<AppRunnerObservabilityConfig> {
  try {
    // TODO: implement create_observability_configuration
    throw new Error("create_observability_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_observability_configuration failed");
  }
}

/** Start a manual deployment for the service. */
export async function startDeployment(serviceArn: string, regionName?: string): Promise<string> {
  try {
    // TODO: implement start_deployment
    throw new Error("start_deployment not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_deployment failed");
  }
}

/** List operations for an App Runner service. */
export async function listOperations(serviceArn: string, regionName?: string): Promise<AppRunnerOperation[]> {
  try {
    // TODO: implement list_operations
    throw new Error("list_operations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_operations failed");
  }
}

/** Poll until an App Runner service reaches a terminal status. */
export async function waitForService(serviceArn: string, timeout: number, pollInterval: number, regionName?: string): Promise<AppRunnerService> {
  try {
    // TODO: implement wait_for_service
    throw new Error("wait_for_service not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "wait_for_service failed");
  }
}

/** Associate custom domain. */
export async function associateCustomDomain(serviceArn: string, domainName: string): Promise<AssociateCustomDomainResult> {
  try {
    // TODO: implement associate_custom_domain
    throw new Error("associate_custom_domain not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "associate_custom_domain failed");
  }
}

/** Create vpc connector. */
export async function createVpcConnector(vpcConnectorName: string, subnets: string[]): Promise<CreateVpcConnectorResult> {
  try {
    // TODO: implement create_vpc_connector
    throw new Error("create_vpc_connector not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_vpc_connector failed");
  }
}

/** Create vpc ingress connection. */
export async function createVpcIngressConnection(serviceArn: string, vpcIngressConnectionName: string, ingressVpcConfiguration: Record<string, unknown>): Promise<CreateVpcIngressConnectionResult> {
  try {
    // TODO: implement create_vpc_ingress_connection
    throw new Error("create_vpc_ingress_connection not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_vpc_ingress_connection failed");
  }
}

/** Delete auto scaling configuration. */
export async function deleteAutoScalingConfiguration(autoScalingConfigurationArn: string): Promise<DeleteAutoScalingConfigurationResult> {
  try {
    // TODO: implement delete_auto_scaling_configuration
    throw new Error("delete_auto_scaling_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_auto_scaling_configuration failed");
  }
}

/** Delete connection. */
export async function deleteConnection(connectionArn: string, regionName?: string): Promise<DeleteConnectionResult> {
  try {
    // TODO: implement delete_connection
    throw new Error("delete_connection not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_connection failed");
  }
}

/** Delete observability configuration. */
export async function deleteObservabilityConfiguration(observabilityConfigurationArn: string, regionName?: string): Promise<DeleteObservabilityConfigurationResult> {
  try {
    // TODO: implement delete_observability_configuration
    throw new Error("delete_observability_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_observability_configuration failed");
  }
}

/** Delete vpc connector. */
export async function deleteVpcConnector(vpcConnectorArn: string, regionName?: string): Promise<DeleteVpcConnectorResult> {
  try {
    // TODO: implement delete_vpc_connector
    throw new Error("delete_vpc_connector not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_vpc_connector failed");
  }
}

/** Delete vpc ingress connection. */
export async function deleteVpcIngressConnection(vpcIngressConnectionArn: string, regionName?: string): Promise<DeleteVpcIngressConnectionResult> {
  try {
    // TODO: implement delete_vpc_ingress_connection
    throw new Error("delete_vpc_ingress_connection not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_vpc_ingress_connection failed");
  }
}

/** Describe auto scaling configuration. */
export async function describeAutoScalingConfiguration(autoScalingConfigurationArn: string, regionName?: string): Promise<DescribeAutoScalingConfigurationResult> {
  try {
    // TODO: implement describe_auto_scaling_configuration
    throw new Error("describe_auto_scaling_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_auto_scaling_configuration failed");
  }
}

/** Describe custom domains. */
export async function describeCustomDomains(serviceArn: string): Promise<DescribeCustomDomainsResult> {
  try {
    // TODO: implement describe_custom_domains
    throw new Error("describe_custom_domains not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_custom_domains failed");
  }
}

/** Describe observability configuration. */
export async function describeObservabilityConfiguration(observabilityConfigurationArn: string, regionName?: string): Promise<DescribeObservabilityConfigurationResult> {
  try {
    // TODO: implement describe_observability_configuration
    throw new Error("describe_observability_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_observability_configuration failed");
  }
}

/** Describe vpc connector. */
export async function describeVpcConnector(vpcConnectorArn: string, regionName?: string): Promise<DescribeVpcConnectorResult> {
  try {
    // TODO: implement describe_vpc_connector
    throw new Error("describe_vpc_connector not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_vpc_connector failed");
  }
}

/** Describe vpc ingress connection. */
export async function describeVpcIngressConnection(vpcIngressConnectionArn: string, regionName?: string): Promise<DescribeVpcIngressConnectionResult> {
  try {
    // TODO: implement describe_vpc_ingress_connection
    throw new Error("describe_vpc_ingress_connection not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_vpc_ingress_connection failed");
  }
}

/** Disassociate custom domain. */
export async function disassociateCustomDomain(serviceArn: string, domainName: string, regionName?: string): Promise<DisassociateCustomDomainResult> {
  try {
    // TODO: implement disassociate_custom_domain
    throw new Error("disassociate_custom_domain not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disassociate_custom_domain failed");
  }
}

/** List observability configurations. */
export async function listObservabilityConfigurations(): Promise<ListObservabilityConfigurationsResult> {
  try {
    // TODO: implement list_observability_configurations
    throw new Error("list_observability_configurations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_observability_configurations failed");
  }
}

/** List services for auto scaling configuration. */
export async function listServicesForAutoScalingConfiguration(autoScalingConfigurationArn: string): Promise<ListServicesForAutoScalingConfigurationResult> {
  try {
    // TODO: implement list_services_for_auto_scaling_configuration
    throw new Error("list_services_for_auto_scaling_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_services_for_auto_scaling_configuration failed");
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

/** List vpc connectors. */
export async function listVpcConnectors(): Promise<ListVpcConnectorsResult> {
  try {
    // TODO: implement list_vpc_connectors
    throw new Error("list_vpc_connectors not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_vpc_connectors failed");
  }
}

/** List vpc ingress connections. */
export async function listVpcIngressConnections(): Promise<ListVpcIngressConnectionsResult> {
  try {
    // TODO: implement list_vpc_ingress_connections
    throw new Error("list_vpc_ingress_connections not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_vpc_ingress_connections failed");
  }
}

/** Tag resource. */
export async function tagResource(resourceArn: string, tags: Record<string, unknown>[], regionName?: string): Promise<void> {
  try {
    // TODO: implement tag_resource
    throw new Error("tag_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "tag_resource failed");
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

/** Update default auto scaling configuration. */
export async function updateDefaultAutoScalingConfiguration(autoScalingConfigurationArn: string, regionName?: string): Promise<UpdateDefaultAutoScalingConfigurationResult> {
  try {
    // TODO: implement update_default_auto_scaling_configuration
    throw new Error("update_default_auto_scaling_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_default_auto_scaling_configuration failed");
  }
}

/** Update vpc ingress connection. */
export async function updateVpcIngressConnection(vpcIngressConnectionArn: string, ingressVpcConfiguration: Record<string, unknown>, regionName?: string): Promise<UpdateVpcIngressConnectionResult> {
  try {
    // TODO: implement update_vpc_ingress_connection
    throw new Error("update_vpc_ingress_connection not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_vpc_ingress_connection failed");
  }
}
