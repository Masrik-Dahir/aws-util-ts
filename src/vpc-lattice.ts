import { VpcLatticeClient } from "@aws-sdk/client-vpc-lattice";
import { getClient } from "./client";
import { wrapAwsError } from "./exceptions";

/** Metadata for a VPC Lattice service network. */
export type ServiceNetworkResult = {
  id: string;
  arn: string;
  name: string;
  authType?: string;
  status?: string;
  extra?: Record<string, unknown>;
};

/** Metadata for a VPC Lattice service. */
export type ServiceResult = {
  id: string;
  arn: string;
  name: string;
  status?: string;
  dnsEntry?: Record<string, unknown>;
  extra?: Record<string, unknown>;
};

/** Metadata for a VPC Lattice target group. */
export type TargetGroupResult = {
  id: string;
  arn: string;
  name: string;
  type?: string;
  status?: string;
  extra?: Record<string, unknown>;
};

/** Metadata for a registered VPC Lattice target. */
export type TargetResult = {
  id: string;
  port?: number;
  status?: string;
  extra?: Record<string, unknown>;
};

/** Result of batch_update_rule. */
export type BatchUpdateRuleResult = {
  successful?: Record<string, unknown>[];
  unsuccessful?: Record<string, unknown>[];
};

/** Result of create_access_log_subscription. */
export type CreateAccessLogSubscriptionResult = {
  id?: string;
  arn?: string;
  resourceId?: string;
  resourceArn?: string;
  serviceNetworkLogType?: string;
  destinationArn?: string;
};

/** Result of create_listener. */
export type CreateListenerResult = {
  arn?: string;
  id?: string;
  name?: string;
  protocol?: string;
  port?: number;
  serviceArn?: string;
  serviceId?: string;
  defaultAction?: Record<string, unknown>;
};

/** Result of create_resource_configuration. */
export type CreateResourceConfigurationResult = {
  id?: string;
  name?: string;
  arn?: string;
  resourceGatewayId?: string;
  resourceConfigurationGroupId?: string;
  typeValue?: string;
  portRanges?: string[];
  protocol?: string;
  status?: string;
  resourceConfigurationDefinition?: Record<string, unknown>;
  allowAssociationToShareableServiceNetwork?: boolean;
  createdAt?: string;
  failureReason?: string;
  customDomainName?: string;
  domainVerificationId?: string;
  groupDomain?: string;
  domainVerificationArn?: string;
};

/** Result of create_resource_gateway. */
export type CreateResourceGatewayResult = {
  name?: string;
  id?: string;
  arn?: string;
  status?: string;
  vpcIdentifier?: string;
  subnetIds?: string[];
  securityGroupIds?: string[];
  ipAddressType?: string;
  ipv4AddressesPerEni?: number;
};

/** Result of create_rule. */
export type CreateRuleResult = {
  arn?: string;
  id?: string;
  name?: string;
  match?: Record<string, unknown>;
  priority?: number;
  action?: Record<string, unknown>;
};

/** Result of create_service_network_resource_association. */
export type CreateServiceNetworkResourceAssociationResult = {
  id?: string;
  arn?: string;
  status?: string;
  createdBy?: string;
  privateDnsEnabled?: boolean;
};

/** Result of create_service_network_service_association. */
export type CreateServiceNetworkServiceAssociationResult = {
  id?: string;
  status?: string;
  arn?: string;
  createdBy?: string;
  customDomainName?: string;
  dnsEntry?: Record<string, unknown>;
};

/** Result of create_service_network_vpc_association. */
export type CreateServiceNetworkVpcAssociationResult = {
  id?: string;
  status?: string;
  arn?: string;
  createdBy?: string;
  securityGroupIds?: string[];
  privateDnsEnabled?: boolean;
  dnsOptions?: Record<string, unknown>;
};

/** Result of delete_resource_endpoint_association. */
export type DeleteResourceEndpointAssociationResult = {
  id?: string;
  arn?: string;
  resourceConfigurationId?: string;
  resourceConfigurationArn?: string;
  vpcEndpointId?: string;
};

/** Result of delete_resource_gateway. */
export type DeleteResourceGatewayResult = {
  id?: string;
  arn?: string;
  name?: string;
  status?: string;
};

/** Result of delete_service_network_resource_association. */
export type DeleteServiceNetworkResourceAssociationResult = {
  id?: string;
  arn?: string;
  status?: string;
};

/** Result of delete_service_network_service_association. */
export type DeleteServiceNetworkServiceAssociationResult = {
  id?: string;
  status?: string;
  arn?: string;
};

/** Result of delete_service_network_vpc_association. */
export type DeleteServiceNetworkVpcAssociationResult = {
  id?: string;
  status?: string;
  arn?: string;
};

/** Result of delete_target_group. */
export type DeleteTargetGroupResult = {
  id?: string;
  arn?: string;
  status?: string;
};

/** Result of get_access_log_subscription. */
export type GetAccessLogSubscriptionResult = {
  id?: string;
  arn?: string;
  resourceId?: string;
  resourceArn?: string;
  destinationArn?: string;
  serviceNetworkLogType?: string;
  createdAt?: string;
  lastUpdatedAt?: string;
};

/** Result of get_auth_policy. */
export type GetAuthPolicyResult = {
  policy?: string;
  state?: string;
  createdAt?: string;
  lastUpdatedAt?: string;
};

/** Result of get_domain_verification. */
export type GetDomainVerificationResult = {
  id?: string;
  arn?: string;
  domainName?: string;
  status?: string;
  txtMethodConfig?: Record<string, unknown>;
  createdAt?: string;
  lastVerifiedTime?: string;
  tags?: Record<string, unknown>;
};

/** Result of get_listener. */
export type GetListenerResult = {
  arn?: string;
  id?: string;
  name?: string;
  protocol?: string;
  port?: number;
  serviceArn?: string;
  serviceId?: string;
  defaultAction?: Record<string, unknown>;
  createdAt?: string;
  lastUpdatedAt?: string;
};

/** Result of get_resource_configuration. */
export type GetResourceConfigurationResult = {
  id?: string;
  name?: string;
  arn?: string;
  resourceGatewayId?: string;
  resourceConfigurationGroupId?: string;
  typeValue?: string;
  allowAssociationToShareableServiceNetwork?: boolean;
  portRanges?: string[];
  protocol?: string;
  customDomainName?: string;
  status?: string;
  resourceConfigurationDefinition?: Record<string, unknown>;
  createdAt?: string;
  amazonManaged?: boolean;
  failureReason?: string;
  lastUpdatedAt?: string;
  domainVerificationId?: string;
  domainVerificationArn?: string;
  domainVerificationStatus?: string;
  groupDomain?: string;
};

/** Result of get_resource_gateway. */
export type GetResourceGatewayResult = {
  name?: string;
  id?: string;
  arn?: string;
  status?: string;
  vpcId?: string;
  subnetIds?: string[];
  securityGroupIds?: string[];
  ipAddressType?: string;
  ipv4AddressesPerEni?: number;
  createdAt?: string;
  lastUpdatedAt?: string;
};

/** Result of get_resource_policy. */
export type GetResourcePolicyResult = {
  policy?: string;
};

/** Result of get_rule. */
export type GetRuleResult = {
  arn?: string;
  id?: string;
  name?: string;
  isDefault?: boolean;
  match?: Record<string, unknown>;
  priority?: number;
  action?: Record<string, unknown>;
  createdAt?: string;
  lastUpdatedAt?: string;
};

/** Result of get_service_network_resource_association. */
export type GetServiceNetworkResourceAssociationResult = {
  id?: string;
  arn?: string;
  status?: string;
  createdBy?: string;
  createdAt?: string;
  resourceConfigurationId?: string;
  resourceConfigurationArn?: string;
  resourceConfigurationName?: string;
  serviceNetworkId?: string;
  serviceNetworkArn?: string;
  serviceNetworkName?: string;
  failureReason?: string;
  failureCode?: string;
  lastUpdatedAt?: string;
  privateDnsEntry?: Record<string, unknown>;
  privateDnsEnabled?: boolean;
  dnsEntry?: Record<string, unknown>;
  isManagedAssociation?: boolean;
  domainVerificationStatus?: string;
};

/** Result of get_service_network_service_association. */
export type GetServiceNetworkServiceAssociationResult = {
  id?: string;
  status?: string;
  arn?: string;
  createdBy?: string;
  createdAt?: string;
  serviceId?: string;
  serviceName?: string;
  serviceArn?: string;
  serviceNetworkId?: string;
  serviceNetworkName?: string;
  serviceNetworkArn?: string;
  dnsEntry?: Record<string, unknown>;
  customDomainName?: string;
  failureMessage?: string;
  failureCode?: string;
};

/** Result of get_service_network_vpc_association. */
export type GetServiceNetworkVpcAssociationResult = {
  id?: string;
  status?: string;
  arn?: string;
  createdBy?: string;
  createdAt?: string;
  serviceNetworkId?: string;
  serviceNetworkName?: string;
  serviceNetworkArn?: string;
  vpcId?: string;
  securityGroupIds?: string[];
  privateDnsEnabled?: boolean;
  failureMessage?: string;
  failureCode?: string;
  lastUpdatedAt?: string;
  dnsOptions?: Record<string, unknown>;
};

/** Result of list_access_log_subscriptions. */
export type ListAccessLogSubscriptionsResult = {
  items?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_domain_verifications. */
export type ListDomainVerificationsResult = {
  items?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_listeners. */
export type ListListenersResult = {
  items?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_resource_configurations. */
export type ListResourceConfigurationsResult = {
  items?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_resource_endpoint_associations. */
export type ListResourceEndpointAssociationsResult = {
  items?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_resource_gateways. */
export type ListResourceGatewaysResult = {
  items?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_rules. */
export type ListRulesResult = {
  items?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_service_network_resource_associations. */
export type ListServiceNetworkResourceAssociationsResult = {
  items?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_service_network_service_associations. */
export type ListServiceNetworkServiceAssociationsResult = {
  items?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_service_network_vpc_associations. */
export type ListServiceNetworkVpcAssociationsResult = {
  items?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_service_network_vpc_endpoint_associations. */
export type ListServiceNetworkVpcEndpointAssociationsResult = {
  items?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_tags_for_resource. */
export type ListTagsForResourceResult = {
  tags?: Record<string, unknown>;
};

/** Result of put_auth_policy. */
export type PutAuthPolicyResult = {
  policy?: string;
  state?: string;
};

/** Result of start_domain_verification. */
export type StartDomainVerificationResult = {
  id?: string;
  arn?: string;
  domainName?: string;
  status?: string;
  txtMethodConfig?: Record<string, unknown>;
};

/** Result of update_access_log_subscription. */
export type UpdateAccessLogSubscriptionResult = {
  id?: string;
  arn?: string;
  resourceId?: string;
  resourceArn?: string;
  destinationArn?: string;
};

/** Result of update_listener. */
export type UpdateListenerResult = {
  arn?: string;
  id?: string;
  name?: string;
  protocol?: string;
  port?: number;
  serviceArn?: string;
  serviceId?: string;
  defaultAction?: Record<string, unknown>;
};

/** Result of update_resource_configuration. */
export type UpdateResourceConfigurationResult = {
  id?: string;
  name?: string;
  arn?: string;
  resourceGatewayId?: string;
  resourceConfigurationGroupId?: string;
  typeValue?: string;
  portRanges?: string[];
  allowAssociationToShareableServiceNetwork?: boolean;
  protocol?: string;
  status?: string;
  resourceConfigurationDefinition?: Record<string, unknown>;
};

/** Result of update_resource_gateway. */
export type UpdateResourceGatewayResult = {
  name?: string;
  id?: string;
  arn?: string;
  status?: string;
  vpcId?: string;
  subnetIds?: string[];
  securityGroupIds?: string[];
  ipAddressType?: string;
};

/** Result of update_rule. */
export type UpdateRuleResult = {
  arn?: string;
  id?: string;
  name?: string;
  isDefault?: boolean;
  match?: Record<string, unknown>;
  priority?: number;
  action?: Record<string, unknown>;
};

/** Result of update_service_network_vpc_association. */
export type UpdateServiceNetworkVpcAssociationResult = {
  id?: string;
  arn?: string;
  status?: string;
  createdBy?: string;
  securityGroupIds?: string[];
};

/** Result of update_target_group. */
export type UpdateTargetGroupResult = {
  id?: string;
  arn?: string;
  name?: string;
  typeValue?: string;
  config?: Record<string, unknown>;
  status?: string;
};

/** Create a VPC Lattice service network. */
export async function createServiceNetwork(name: string): Promise<ServiceNetworkResult> {
  try {
    // TODO: implement create_service_network
    throw new Error("create_service_network not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_service_network failed");
  }
}

/** Get details of a VPC Lattice service network. */
export async function getServiceNetwork(identifier: string): Promise<ServiceNetworkResult> {
  try {
    // TODO: implement get_service_network
    throw new Error("get_service_network not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_service_network failed");
  }
}

/** List all VPC Lattice service networks. */
export async function listServiceNetworks(): Promise<ServiceNetworkResult[]> {
  try {
    // TODO: implement list_service_networks
    throw new Error("list_service_networks not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_service_networks failed");
  }
}

/** Update a VPC Lattice service network. */
export async function updateServiceNetwork(identifier: string): Promise<ServiceNetworkResult> {
  try {
    // TODO: implement update_service_network
    throw new Error("update_service_network not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_service_network failed");
  }
}

/** Delete a VPC Lattice service network. */
export async function deleteServiceNetwork(identifier: string): Promise<void> {
  try {
    // TODO: implement delete_service_network
    throw new Error("delete_service_network not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_service_network failed");
  }
}

/** Create a VPC Lattice service. */
export async function createService(name: string): Promise<ServiceResult> {
  try {
    // TODO: implement create_service
    throw new Error("create_service not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_service failed");
  }
}

/** Get details of a VPC Lattice service. */
export async function getService(identifier: string): Promise<ServiceResult> {
  try {
    // TODO: implement get_service
    throw new Error("get_service not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_service failed");
  }
}

/** List all VPC Lattice services. */
export async function listServices(): Promise<ServiceResult[]> {
  try {
    // TODO: implement list_services
    throw new Error("list_services not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_services failed");
  }
}

/** Update a VPC Lattice service. */
export async function updateService(identifier: string): Promise<ServiceResult> {
  try {
    // TODO: implement update_service
    throw new Error("update_service not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_service failed");
  }
}

/** Delete a VPC Lattice service. */
export async function deleteService(identifier: string): Promise<void> {
  try {
    // TODO: implement delete_service
    throw new Error("delete_service not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_service failed");
  }
}

/** Create a VPC Lattice target group. */
export async function createTargetGroup(name: string): Promise<TargetGroupResult> {
  try {
    // TODO: implement create_target_group
    throw new Error("create_target_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_target_group failed");
  }
}

/** Get details of a VPC Lattice target group. */
export async function getTargetGroup(identifier: string): Promise<TargetGroupResult> {
  try {
    // TODO: implement get_target_group
    throw new Error("get_target_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_target_group failed");
  }
}

/** List all VPC Lattice target groups. */
export async function listTargetGroups(): Promise<TargetGroupResult[]> {
  try {
    // TODO: implement list_target_groups
    throw new Error("list_target_groups not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_target_groups failed");
  }
}

/** Register targets with a VPC Lattice target group. */
export async function registerTargets(targetGroupIdentifier: string): Promise<Record<string, unknown>[]> {
  try {
    // TODO: implement register_targets
    throw new Error("register_targets not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "register_targets failed");
  }
}

/** Deregister targets from a VPC Lattice target group. */
export async function deregisterTargets(targetGroupIdentifier: string): Promise<Record<string, unknown>[]> {
  try {
    // TODO: implement deregister_targets
    throw new Error("deregister_targets not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "deregister_targets failed");
  }
}

/** List targets registered with a VPC Lattice target group. */
export async function listTargets(targetGroupIdentifier: string): Promise<TargetResult[]> {
  try {
    // TODO: implement list_targets
    throw new Error("list_targets not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_targets failed");
  }
}

/** Batch update rule. */
export async function batchUpdateRule(serviceIdentifier: string, listenerIdentifier: string, rules: Record<string, unknown>[], regionName?: string): Promise<BatchUpdateRuleResult> {
  try {
    // TODO: implement batch_update_rule
    throw new Error("batch_update_rule not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_update_rule failed");
  }
}

/** Create access log subscription. */
export async function createAccessLogSubscription(resourceIdentifier: string, destinationArn: string): Promise<CreateAccessLogSubscriptionResult> {
  try {
    // TODO: implement create_access_log_subscription
    throw new Error("create_access_log_subscription not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_access_log_subscription failed");
  }
}

/** Create listener. */
export async function createListener(serviceIdentifier: string, name: string, protocol: string, defaultAction: Record<string, unknown>): Promise<CreateListenerResult> {
  try {
    // TODO: implement create_listener
    throw new Error("create_listener not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_listener failed");
  }
}

/** Create resource configuration. */
export async function createResourceConfiguration(name: string, typeValue: string): Promise<CreateResourceConfigurationResult> {
  try {
    // TODO: implement create_resource_configuration
    throw new Error("create_resource_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_resource_configuration failed");
  }
}

/** Create resource gateway. */
export async function createResourceGateway(name: string): Promise<CreateResourceGatewayResult> {
  try {
    // TODO: implement create_resource_gateway
    throw new Error("create_resource_gateway not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_resource_gateway failed");
  }
}

/** Create rule. */
export async function createRule(serviceIdentifier: string, listenerIdentifier: string, name: string, match: Record<string, unknown>, priority: number, action: Record<string, unknown>): Promise<CreateRuleResult> {
  try {
    // TODO: implement create_rule
    throw new Error("create_rule not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_rule failed");
  }
}

/** Create service network resource association. */
export async function createServiceNetworkResourceAssociation(resourceConfigurationIdentifier: string, serviceNetworkIdentifier: string): Promise<CreateServiceNetworkResourceAssociationResult> {
  try {
    // TODO: implement create_service_network_resource_association
    throw new Error("create_service_network_resource_association not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_service_network_resource_association failed");
  }
}

/** Create service network service association. */
export async function createServiceNetworkServiceAssociation(serviceIdentifier: string, serviceNetworkIdentifier: string): Promise<CreateServiceNetworkServiceAssociationResult> {
  try {
    // TODO: implement create_service_network_service_association
    throw new Error("create_service_network_service_association not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_service_network_service_association failed");
  }
}

/** Create service network vpc association. */
export async function createServiceNetworkVpcAssociation(serviceNetworkIdentifier: string, vpcIdentifier: string): Promise<CreateServiceNetworkVpcAssociationResult> {
  try {
    // TODO: implement create_service_network_vpc_association
    throw new Error("create_service_network_vpc_association not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_service_network_vpc_association failed");
  }
}

/** Delete access log subscription. */
export async function deleteAccessLogSubscription(accessLogSubscriptionIdentifier: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_access_log_subscription
    throw new Error("delete_access_log_subscription not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_access_log_subscription failed");
  }
}

/** Delete auth policy. */
export async function deleteAuthPolicy(resourceIdentifier: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_auth_policy
    throw new Error("delete_auth_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_auth_policy failed");
  }
}

/** Delete domain verification. */
export async function deleteDomainVerification(domainVerificationIdentifier: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_domain_verification
    throw new Error("delete_domain_verification not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_domain_verification failed");
  }
}

/** Delete listener. */
export async function deleteListener(serviceIdentifier: string, listenerIdentifier: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_listener
    throw new Error("delete_listener not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_listener failed");
  }
}

/** Delete resource configuration. */
export async function deleteResourceConfiguration(resourceConfigurationIdentifier: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_resource_configuration
    throw new Error("delete_resource_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_resource_configuration failed");
  }
}

/** Delete resource endpoint association. */
export async function deleteResourceEndpointAssociation(resourceEndpointAssociationIdentifier: string, regionName?: string): Promise<DeleteResourceEndpointAssociationResult> {
  try {
    // TODO: implement delete_resource_endpoint_association
    throw new Error("delete_resource_endpoint_association not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_resource_endpoint_association failed");
  }
}

/** Delete resource gateway. */
export async function deleteResourceGateway(resourceGatewayIdentifier: string, regionName?: string): Promise<DeleteResourceGatewayResult> {
  try {
    // TODO: implement delete_resource_gateway
    throw new Error("delete_resource_gateway not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_resource_gateway failed");
  }
}

/** Delete resource policy. */
export async function deleteResourcePolicy(resourceArn: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_resource_policy
    throw new Error("delete_resource_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_resource_policy failed");
  }
}

/** Delete rule. */
export async function deleteRule(serviceIdentifier: string, listenerIdentifier: string, ruleIdentifier: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_rule
    throw new Error("delete_rule not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_rule failed");
  }
}

/** Delete service network resource association. */
export async function deleteServiceNetworkResourceAssociation(serviceNetworkResourceAssociationIdentifier: string, regionName?: string): Promise<DeleteServiceNetworkResourceAssociationResult> {
  try {
    // TODO: implement delete_service_network_resource_association
    throw new Error("delete_service_network_resource_association not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_service_network_resource_association failed");
  }
}

/** Delete service network service association. */
export async function deleteServiceNetworkServiceAssociation(serviceNetworkServiceAssociationIdentifier: string, regionName?: string): Promise<DeleteServiceNetworkServiceAssociationResult> {
  try {
    // TODO: implement delete_service_network_service_association
    throw new Error("delete_service_network_service_association not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_service_network_service_association failed");
  }
}

/** Delete service network vpc association. */
export async function deleteServiceNetworkVpcAssociation(serviceNetworkVpcAssociationIdentifier: string, regionName?: string): Promise<DeleteServiceNetworkVpcAssociationResult> {
  try {
    // TODO: implement delete_service_network_vpc_association
    throw new Error("delete_service_network_vpc_association not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_service_network_vpc_association failed");
  }
}

/** Delete target group. */
export async function deleteTargetGroup(targetGroupIdentifier: string, regionName?: string): Promise<DeleteTargetGroupResult> {
  try {
    // TODO: implement delete_target_group
    throw new Error("delete_target_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_target_group failed");
  }
}

/** Get access log subscription. */
export async function getAccessLogSubscription(accessLogSubscriptionIdentifier: string, regionName?: string): Promise<GetAccessLogSubscriptionResult> {
  try {
    // TODO: implement get_access_log_subscription
    throw new Error("get_access_log_subscription not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_access_log_subscription failed");
  }
}

/** Get auth policy. */
export async function getAuthPolicy(resourceIdentifier: string, regionName?: string): Promise<GetAuthPolicyResult> {
  try {
    // TODO: implement get_auth_policy
    throw new Error("get_auth_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_auth_policy failed");
  }
}

/** Get domain verification. */
export async function getDomainVerification(domainVerificationIdentifier: string, regionName?: string): Promise<GetDomainVerificationResult> {
  try {
    // TODO: implement get_domain_verification
    throw new Error("get_domain_verification not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_domain_verification failed");
  }
}

/** Get listener. */
export async function getListener(serviceIdentifier: string, listenerIdentifier: string, regionName?: string): Promise<GetListenerResult> {
  try {
    // TODO: implement get_listener
    throw new Error("get_listener not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_listener failed");
  }
}

/** Get resource configuration. */
export async function getResourceConfiguration(resourceConfigurationIdentifier: string, regionName?: string): Promise<GetResourceConfigurationResult> {
  try {
    // TODO: implement get_resource_configuration
    throw new Error("get_resource_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_resource_configuration failed");
  }
}

/** Get resource gateway. */
export async function getResourceGateway(resourceGatewayIdentifier: string, regionName?: string): Promise<GetResourceGatewayResult> {
  try {
    // TODO: implement get_resource_gateway
    throw new Error("get_resource_gateway not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_resource_gateway failed");
  }
}

/** Get resource policy. */
export async function getResourcePolicy(resourceArn: string, regionName?: string): Promise<GetResourcePolicyResult> {
  try {
    // TODO: implement get_resource_policy
    throw new Error("get_resource_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_resource_policy failed");
  }
}

/** Get rule. */
export async function getRule(serviceIdentifier: string, listenerIdentifier: string, ruleIdentifier: string, regionName?: string): Promise<GetRuleResult> {
  try {
    // TODO: implement get_rule
    throw new Error("get_rule not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_rule failed");
  }
}

/** Get service network resource association. */
export async function getServiceNetworkResourceAssociation(serviceNetworkResourceAssociationIdentifier: string, regionName?: string): Promise<GetServiceNetworkResourceAssociationResult> {
  try {
    // TODO: implement get_service_network_resource_association
    throw new Error("get_service_network_resource_association not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_service_network_resource_association failed");
  }
}

/** Get service network service association. */
export async function getServiceNetworkServiceAssociation(serviceNetworkServiceAssociationIdentifier: string, regionName?: string): Promise<GetServiceNetworkServiceAssociationResult> {
  try {
    // TODO: implement get_service_network_service_association
    throw new Error("get_service_network_service_association not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_service_network_service_association failed");
  }
}

/** Get service network vpc association. */
export async function getServiceNetworkVpcAssociation(serviceNetworkVpcAssociationIdentifier: string, regionName?: string): Promise<GetServiceNetworkVpcAssociationResult> {
  try {
    // TODO: implement get_service_network_vpc_association
    throw new Error("get_service_network_vpc_association not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_service_network_vpc_association failed");
  }
}

/** List access log subscriptions. */
export async function listAccessLogSubscriptions(resourceIdentifier: string): Promise<ListAccessLogSubscriptionsResult> {
  try {
    // TODO: implement list_access_log_subscriptions
    throw new Error("list_access_log_subscriptions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_access_log_subscriptions failed");
  }
}

/** List domain verifications. */
export async function listDomainVerifications(): Promise<ListDomainVerificationsResult> {
  try {
    // TODO: implement list_domain_verifications
    throw new Error("list_domain_verifications not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_domain_verifications failed");
  }
}

/** List listeners. */
export async function listListeners(serviceIdentifier: string): Promise<ListListenersResult> {
  try {
    // TODO: implement list_listeners
    throw new Error("list_listeners not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_listeners failed");
  }
}

/** List resource configurations. */
export async function listResourceConfigurations(): Promise<ListResourceConfigurationsResult> {
  try {
    // TODO: implement list_resource_configurations
    throw new Error("list_resource_configurations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_resource_configurations failed");
  }
}

/** List resource endpoint associations. */
export async function listResourceEndpointAssociations(resourceConfigurationIdentifier: string): Promise<ListResourceEndpointAssociationsResult> {
  try {
    // TODO: implement list_resource_endpoint_associations
    throw new Error("list_resource_endpoint_associations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_resource_endpoint_associations failed");
  }
}

/** List resource gateways. */
export async function listResourceGateways(): Promise<ListResourceGatewaysResult> {
  try {
    // TODO: implement list_resource_gateways
    throw new Error("list_resource_gateways not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_resource_gateways failed");
  }
}

/** List rules. */
export async function listRules(serviceIdentifier: string, listenerIdentifier: string): Promise<ListRulesResult> {
  try {
    // TODO: implement list_rules
    throw new Error("list_rules not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_rules failed");
  }
}

/** List service network resource associations. */
export async function listServiceNetworkResourceAssociations(): Promise<ListServiceNetworkResourceAssociationsResult> {
  try {
    // TODO: implement list_service_network_resource_associations
    throw new Error("list_service_network_resource_associations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_service_network_resource_associations failed");
  }
}

/** List service network service associations. */
export async function listServiceNetworkServiceAssociations(): Promise<ListServiceNetworkServiceAssociationsResult> {
  try {
    // TODO: implement list_service_network_service_associations
    throw new Error("list_service_network_service_associations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_service_network_service_associations failed");
  }
}

/** List service network vpc associations. */
export async function listServiceNetworkVpcAssociations(): Promise<ListServiceNetworkVpcAssociationsResult> {
  try {
    // TODO: implement list_service_network_vpc_associations
    throw new Error("list_service_network_vpc_associations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_service_network_vpc_associations failed");
  }
}

/** List service network vpc endpoint associations. */
export async function listServiceNetworkVpcEndpointAssociations(serviceNetworkIdentifier: string): Promise<ListServiceNetworkVpcEndpointAssociationsResult> {
  try {
    // TODO: implement list_service_network_vpc_endpoint_associations
    throw new Error("list_service_network_vpc_endpoint_associations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_service_network_vpc_endpoint_associations failed");
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

/** Put auth policy. */
export async function putAuthPolicy(resourceIdentifier: string, policy: string, regionName?: string): Promise<PutAuthPolicyResult> {
  try {
    // TODO: implement put_auth_policy
    throw new Error("put_auth_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_auth_policy failed");
  }
}

/** Put resource policy. */
export async function putResourcePolicy(resourceArn: string, policy: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement put_resource_policy
    throw new Error("put_resource_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_resource_policy failed");
  }
}

/** Start domain verification. */
export async function startDomainVerification(domainName: string): Promise<StartDomainVerificationResult> {
  try {
    // TODO: implement start_domain_verification
    throw new Error("start_domain_verification not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_domain_verification failed");
  }
}

/** Tag resource. */
export async function tagResource(resourceArn: string, tags: Record<string, unknown>, regionName?: string): Promise<void> {
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

/** Update access log subscription. */
export async function updateAccessLogSubscription(accessLogSubscriptionIdentifier: string, destinationArn: string, regionName?: string): Promise<UpdateAccessLogSubscriptionResult> {
  try {
    // TODO: implement update_access_log_subscription
    throw new Error("update_access_log_subscription not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_access_log_subscription failed");
  }
}

/** Update listener. */
export async function updateListener(serviceIdentifier: string, listenerIdentifier: string, defaultAction: Record<string, unknown>, regionName?: string): Promise<UpdateListenerResult> {
  try {
    // TODO: implement update_listener
    throw new Error("update_listener not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_listener failed");
  }
}

/** Update resource configuration. */
export async function updateResourceConfiguration(resourceConfigurationIdentifier: string): Promise<UpdateResourceConfigurationResult> {
  try {
    // TODO: implement update_resource_configuration
    throw new Error("update_resource_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_resource_configuration failed");
  }
}

/** Update resource gateway. */
export async function updateResourceGateway(resourceGatewayIdentifier: string): Promise<UpdateResourceGatewayResult> {
  try {
    // TODO: implement update_resource_gateway
    throw new Error("update_resource_gateway not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_resource_gateway failed");
  }
}

/** Update rule. */
export async function updateRule(serviceIdentifier: string, listenerIdentifier: string, ruleIdentifier: string): Promise<UpdateRuleResult> {
  try {
    // TODO: implement update_rule
    throw new Error("update_rule not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_rule failed");
  }
}

/** Update service network vpc association. */
export async function updateServiceNetworkVpcAssociation(serviceNetworkVpcAssociationIdentifier: string, securityGroupIds: string[], regionName?: string): Promise<UpdateServiceNetworkVpcAssociationResult> {
  try {
    // TODO: implement update_service_network_vpc_association
    throw new Error("update_service_network_vpc_association not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_service_network_vpc_association failed");
  }
}

/** Update target group. */
export async function updateTargetGroup(targetGroupIdentifier: string, healthCheck: Record<string, unknown>, regionName?: string): Promise<UpdateTargetGroupResult> {
  try {
    // TODO: implement update_target_group
    throw new Error("update_target_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_target_group failed");
  }
}
