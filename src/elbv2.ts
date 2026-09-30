import { Elbv2Client } from "@aws-sdk/client-elbv2";
import { getClient } from "./client";
import { wrapAwsError } from "./exceptions";

/** Metadata for an Elastic Load Balancer v2. */
export type LoadBalancerResult = {
  arn: string;
  dnsName: string;
  name: string;
  type: string;
  state: string;
  vpcId?: string;
  scheme?: string;
  securityGroups?: string[];
  availabilityZones?: Record<string, unknown>[];
  createdTime?: unknown;
  extra?: Record<string, unknown>;
};

/** Metadata for an ELBv2 target group. */
export type TargetGroupResult = {
  arn: string;
  name: string;
  protocol?: string;
  port?: number;
  vpcId?: string;
  healthCheckPath?: string;
  targetType?: string;
  extra?: Record<string, unknown>;
};

/** Metadata for an ELBv2 listener. */
export type ListenerResult = {
  arn: string;
  loadBalancerArn: string;
  port?: number;
  protocol?: string;
  defaultActions?: Record<string, unknown>[];
  extra?: Record<string, unknown>;
};

/** Metadata for an ELBv2 listener rule. */
export type RuleResult = {
  arn: string;
  priority?: string;
  conditions?: Record<string, unknown>[];
  actions?: Record<string, unknown>[];
  isDefault?: boolean;
  extra?: Record<string, unknown>;
};

/** Result of add_listener_certificates. */
export type AddListenerCertificatesResult = {
  certificates?: Record<string, unknown>[];
};

/** Result of add_trust_store_revocations. */
export type AddTrustStoreRevocationsResult = {
  trustStoreRevocations?: Record<string, unknown>[];
};

/** Result of create_trust_store. */
export type CreateTrustStoreResult = {
  trustStores?: Record<string, unknown>[];
};

/** Result of describe_account_limits. */
export type DescribeAccountLimitsResult = {
  limits?: Record<string, unknown>[];
  nextMarker?: string;
};

/** Result of describe_capacity_reservation. */
export type DescribeCapacityReservationResult = {
  lastModifiedTime?: string;
  decreaseRequestsRemaining?: number;
  minimumLoadBalancerCapacity?: Record<string, unknown>;
  capacityReservationState?: Record<string, unknown>[];
};

/** Result of describe_listener_attributes. */
export type DescribeListenerAttributesResult = {
  attributes?: Record<string, unknown>[];
};

/** Result of describe_listener_certificates. */
export type DescribeListenerCertificatesResult = {
  certificates?: Record<string, unknown>[];
  nextMarker?: string;
};

/** Result of describe_load_balancer_attributes. */
export type DescribeLoadBalancerAttributesResult = {
  attributes?: Record<string, unknown>[];
};

/** Result of describe_ssl_policies. */
export type DescribeSslPoliciesResult = {
  sslPolicies?: Record<string, unknown>[];
  nextMarker?: string;
};

/** Result of describe_target_group_attributes. */
export type DescribeTargetGroupAttributesResult = {
  attributes?: Record<string, unknown>[];
};

/** Result of describe_trust_store_associations. */
export type DescribeTrustStoreAssociationsResult = {
  trustStoreAssociations?: Record<string, unknown>[];
  nextMarker?: string;
};

/** Result of describe_trust_store_revocations. */
export type DescribeTrustStoreRevocationsResult = {
  trustStoreRevocations?: Record<string, unknown>[];
  nextMarker?: string;
};

/** Result of describe_trust_stores. */
export type DescribeTrustStoresResult = {
  trustStores?: Record<string, unknown>[];
  nextMarker?: string;
};

/** Result of get_resource_policy. */
export type GetResourcePolicyResult = {
  policy?: string;
};

/** Result of get_trust_store_ca_certificates_bundle. */
export type GetTrustStoreCaCertificatesBundleResult = {
  location?: string;
};

/** Result of get_trust_store_revocation_content. */
export type GetTrustStoreRevocationContentResult = {
  location?: string;
};

/** Result of modify_capacity_reservation. */
export type ModifyCapacityReservationResult = {
  lastModifiedTime?: string;
  decreaseRequestsRemaining?: number;
  minimumLoadBalancerCapacity?: Record<string, unknown>;
  capacityReservationState?: Record<string, unknown>[];
};

/** Result of modify_ip_pools. */
export type ModifyIpPoolsResult = {
  ipamPools?: Record<string, unknown>;
};

/** Result of modify_listener_attributes. */
export type ModifyListenerAttributesResult = {
  attributes?: Record<string, unknown>[];
};

/** Result of modify_target_group_attributes. */
export type ModifyTargetGroupAttributesResult = {
  attributes?: Record<string, unknown>[];
};

/** Result of modify_trust_store. */
export type ModifyTrustStoreResult = {
  trustStores?: Record<string, unknown>[];
};

/** Result of set_ip_address_type. */
export type SetIpAddressTypeResult = {
  ipAddressType?: string;
};

/** Result of set_rule_priorities. */
export type SetRulePrioritiesResult = {
  rules?: Record<string, unknown>[];
};

/** Create an ELBv2 load balancer. */
export async function createLoadBalancer(name: string): Promise<LoadBalancerResult> {
  try {
    // TODO: implement create_load_balancer
    throw new Error("create_load_balancer not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_load_balancer failed");
  }
}

/** Describe ELBv2 load balancers. */
export async function describeLoadBalancers(): Promise<LoadBalancerResult[]> {
  try {
    // TODO: implement describe_load_balancers
    throw new Error("describe_load_balancers not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_load_balancers failed");
  }
}

/** Modify load-balancer attributes. */
export async function modifyLoadBalancerAttributes(arn: string): Promise<Record<string, unknown>[]> {
  try {
    // TODO: implement modify_load_balancer_attributes
    throw new Error("modify_load_balancer_attributes not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_load_balancer_attributes failed");
  }
}

/** Delete an ELBv2 load balancer. */
export async function deleteLoadBalancer(arn: string): Promise<void> {
  try {
    // TODO: implement delete_load_balancer
    throw new Error("delete_load_balancer not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_load_balancer failed");
  }
}

/** Create an ELBv2 target group. */
export async function createTargetGroup(name: string): Promise<TargetGroupResult> {
  try {
    // TODO: implement create_target_group
    throw new Error("create_target_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_target_group failed");
  }
}

/** Describe ELBv2 target groups. */
export async function describeTargetGroups(): Promise<TargetGroupResult[]> {
  try {
    // TODO: implement describe_target_groups
    throw new Error("describe_target_groups not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_target_groups failed");
  }
}

/** Modify an ELBv2 target group. */
export async function modifyTargetGroup(arn: string): Promise<TargetGroupResult> {
  try {
    // TODO: implement modify_target_group
    throw new Error("modify_target_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_target_group failed");
  }
}

/** Delete an ELBv2 target group. */
export async function deleteTargetGroup(arn: string): Promise<void> {
  try {
    // TODO: implement delete_target_group
    throw new Error("delete_target_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_target_group failed");
  }
}

/** Register targets with a target group. */
export async function registerTargets(targetGroupArn: string): Promise<void> {
  try {
    // TODO: implement register_targets
    throw new Error("register_targets not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "register_targets failed");
  }
}

/** Deregister targets from a target group. */
export async function deregisterTargets(targetGroupArn: string): Promise<void> {
  try {
    // TODO: implement deregister_targets
    throw new Error("deregister_targets not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "deregister_targets failed");
  }
}

/** Describe the health of targets in a target group. */
export async function describeTargetHealth(targetGroupArn: string): Promise<Record<string, unknown>[]> {
  try {
    // TODO: implement describe_target_health
    throw new Error("describe_target_health not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_target_health failed");
  }
}

/** Create a listener on a load balancer. */
export async function createListener(loadBalancerArn: string): Promise<ListenerResult> {
  try {
    // TODO: implement create_listener
    throw new Error("create_listener not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_listener failed");
  }
}

/** Describe listeners for a load balancer. */
export async function describeListeners(loadBalancerArn: string): Promise<ListenerResult[]> {
  try {
    // TODO: implement describe_listeners
    throw new Error("describe_listeners not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_listeners failed");
  }
}

/** Modify an existing listener. */
export async function modifyListener(arn: string): Promise<ListenerResult> {
  try {
    // TODO: implement modify_listener
    throw new Error("modify_listener not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_listener failed");
  }
}

/** Delete a listener. */
export async function deleteListener(arn: string): Promise<void> {
  try {
    // TODO: implement delete_listener
    throw new Error("delete_listener not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_listener failed");
  }
}

/** Create a listener rule. */
export async function createRule(listenerArn: string): Promise<RuleResult> {
  try {
    // TODO: implement create_rule
    throw new Error("create_rule not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_rule failed");
  }
}

/** Describe rules for a listener. */
export async function describeRules(listenerArn: string): Promise<RuleResult[]> {
  try {
    // TODO: implement describe_rules
    throw new Error("describe_rules not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_rules failed");
  }
}

/** Modify a listener rule. */
export async function modifyRule(arn: string): Promise<RuleResult> {
  try {
    // TODO: implement modify_rule
    throw new Error("modify_rule not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_rule failed");
  }
}

/** Delete a listener rule. */
export async function deleteRule(arn: string): Promise<void> {
  try {
    // TODO: implement delete_rule
    throw new Error("delete_rule not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_rule failed");
  }
}

/** Set the subnets for a load balancer. */
export async function setSubnets(arn: string): Promise<Record<string, unknown>[]> {
  try {
    // TODO: implement set_subnets
    throw new Error("set_subnets not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "set_subnets failed");
  }
}

/** Set the security groups for a load balancer. */
export async function setSecurityGroups(arn: string): Promise<string[]> {
  try {
    // TODO: implement set_security_groups
    throw new Error("set_security_groups not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "set_security_groups failed");
  }
}

/** Add tags to one or more ELBv2 resources. */
export async function addTags(arns: string[]): Promise<void> {
  try {
    // TODO: implement add_tags
    throw new Error("add_tags not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "add_tags failed");
  }
}

/** Remove tags from one or more ELBv2 resources. */
export async function removeTags(arns: string[]): Promise<void> {
  try {
    // TODO: implement remove_tags
    throw new Error("remove_tags not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "remove_tags failed");
  }
}

/** Describe tags for one or more ELBv2 resources. */
export async function describeTags(arns: string[]): Promise<Record<string, unknown>> {
  try {
    // TODO: implement describe_tags
    throw new Error("describe_tags not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_tags failed");
  }
}

/** Poll until a load balancer reaches the ``active`` state. */
export async function waitForLoadBalancer(arn: string): Promise<LoadBalancerResult> {
  try {
    // TODO: implement wait_for_load_balancer
    throw new Error("wait_for_load_balancer not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "wait_for_load_balancer failed");
  }
}

/** Ensure a load balancer exists, creating it if necessary. */
export async function ensureLoadBalancer(name: string): Promise<unknown> {
  try {
    // TODO: implement ensure_load_balancer
    throw new Error("ensure_load_balancer not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "ensure_load_balancer failed");
  }
}

/** Ensure a target group exists, creating it if necessary. */
export async function ensureTargetGroup(name: string): Promise<unknown> {
  try {
    // TODO: implement ensure_target_group
    throw new Error("ensure_target_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "ensure_target_group failed");
  }
}

/** Add listener certificates. */
export async function addListenerCertificates(listenerArn: string, certificates: Record<string, unknown>[], regionName?: string): Promise<AddListenerCertificatesResult> {
  try {
    // TODO: implement add_listener_certificates
    throw new Error("add_listener_certificates not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "add_listener_certificates failed");
  }
}

/** Add trust store revocations. */
export async function addTrustStoreRevocations(trustStoreArn: string): Promise<AddTrustStoreRevocationsResult> {
  try {
    // TODO: implement add_trust_store_revocations
    throw new Error("add_trust_store_revocations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "add_trust_store_revocations failed");
  }
}

/** Create trust store. */
export async function createTrustStore(name: string, caCertificatesBundleS3Bucket: string, caCertificatesBundleS3Key: string): Promise<CreateTrustStoreResult> {
  try {
    // TODO: implement create_trust_store
    throw new Error("create_trust_store not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_trust_store failed");
  }
}

/** Delete shared trust store association. */
export async function deleteSharedTrustStoreAssociation(trustStoreArn: string, resourceArn: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_shared_trust_store_association
    throw new Error("delete_shared_trust_store_association not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_shared_trust_store_association failed");
  }
}

/** Delete trust store. */
export async function deleteTrustStore(trustStoreArn: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_trust_store
    throw new Error("delete_trust_store not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_trust_store failed");
  }
}

/** Describe account limits. */
export async function describeAccountLimits(): Promise<DescribeAccountLimitsResult> {
  try {
    // TODO: implement describe_account_limits
    throw new Error("describe_account_limits not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_account_limits failed");
  }
}

/** Describe capacity reservation. */
export async function describeCapacityReservation(loadBalancerArn: string, regionName?: string): Promise<DescribeCapacityReservationResult> {
  try {
    // TODO: implement describe_capacity_reservation
    throw new Error("describe_capacity_reservation not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_capacity_reservation failed");
  }
}

/** Describe listener attributes. */
export async function describeListenerAttributes(listenerArn: string, regionName?: string): Promise<DescribeListenerAttributesResult> {
  try {
    // TODO: implement describe_listener_attributes
    throw new Error("describe_listener_attributes not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_listener_attributes failed");
  }
}

/** Describe listener certificates. */
export async function describeListenerCertificates(listenerArn: string): Promise<DescribeListenerCertificatesResult> {
  try {
    // TODO: implement describe_listener_certificates
    throw new Error("describe_listener_certificates not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_listener_certificates failed");
  }
}

/** Describe load balancer attributes. */
export async function describeLoadBalancerAttributes(loadBalancerArn: string, regionName?: string): Promise<DescribeLoadBalancerAttributesResult> {
  try {
    // TODO: implement describe_load_balancer_attributes
    throw new Error("describe_load_balancer_attributes not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_load_balancer_attributes failed");
  }
}

/** Describe ssl policies. */
export async function describeSslPolicies(): Promise<DescribeSslPoliciesResult> {
  try {
    // TODO: implement describe_ssl_policies
    throw new Error("describe_ssl_policies not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_ssl_policies failed");
  }
}

/** Describe target group attributes. */
export async function describeTargetGroupAttributes(targetGroupArn: string, regionName?: string): Promise<DescribeTargetGroupAttributesResult> {
  try {
    // TODO: implement describe_target_group_attributes
    throw new Error("describe_target_group_attributes not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_target_group_attributes failed");
  }
}

/** Describe trust store associations. */
export async function describeTrustStoreAssociations(trustStoreArn: string): Promise<DescribeTrustStoreAssociationsResult> {
  try {
    // TODO: implement describe_trust_store_associations
    throw new Error("describe_trust_store_associations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_trust_store_associations failed");
  }
}

/** Describe trust store revocations. */
export async function describeTrustStoreRevocations(trustStoreArn: string): Promise<DescribeTrustStoreRevocationsResult> {
  try {
    // TODO: implement describe_trust_store_revocations
    throw new Error("describe_trust_store_revocations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_trust_store_revocations failed");
  }
}

/** Describe trust stores. */
export async function describeTrustStores(): Promise<DescribeTrustStoresResult> {
  try {
    // TODO: implement describe_trust_stores
    throw new Error("describe_trust_stores not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_trust_stores failed");
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

/** Get trust store ca certificates bundle. */
export async function getTrustStoreCaCertificatesBundle(trustStoreArn: string, regionName?: string): Promise<GetTrustStoreCaCertificatesBundleResult> {
  try {
    // TODO: implement get_trust_store_ca_certificates_bundle
    throw new Error("get_trust_store_ca_certificates_bundle not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_trust_store_ca_certificates_bundle failed");
  }
}

/** Get trust store revocation content. */
export async function getTrustStoreRevocationContent(trustStoreArn: string, revocationId: number, regionName?: string): Promise<GetTrustStoreRevocationContentResult> {
  try {
    // TODO: implement get_trust_store_revocation_content
    throw new Error("get_trust_store_revocation_content not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_trust_store_revocation_content failed");
  }
}

/** Modify capacity reservation. */
export async function modifyCapacityReservation(loadBalancerArn: string): Promise<ModifyCapacityReservationResult> {
  try {
    // TODO: implement modify_capacity_reservation
    throw new Error("modify_capacity_reservation not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_capacity_reservation failed");
  }
}

/** Modify ip pools. */
export async function modifyIpPools(loadBalancerArn: string): Promise<ModifyIpPoolsResult> {
  try {
    // TODO: implement modify_ip_pools
    throw new Error("modify_ip_pools not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_ip_pools failed");
  }
}

/** Modify listener attributes. */
export async function modifyListenerAttributes(listenerArn: string, attributes: Record<string, unknown>[], regionName?: string): Promise<ModifyListenerAttributesResult> {
  try {
    // TODO: implement modify_listener_attributes
    throw new Error("modify_listener_attributes not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_listener_attributes failed");
  }
}

/** Modify target group attributes. */
export async function modifyTargetGroupAttributes(targetGroupArn: string, attributes: Record<string, unknown>[], regionName?: string): Promise<ModifyTargetGroupAttributesResult> {
  try {
    // TODO: implement modify_target_group_attributes
    throw new Error("modify_target_group_attributes not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_target_group_attributes failed");
  }
}

/** Modify trust store. */
export async function modifyTrustStore(trustStoreArn: string, caCertificatesBundleS3Bucket: string, caCertificatesBundleS3Key: string): Promise<ModifyTrustStoreResult> {
  try {
    // TODO: implement modify_trust_store
    throw new Error("modify_trust_store not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_trust_store failed");
  }
}

/** Remove listener certificates. */
export async function removeListenerCertificates(listenerArn: string, certificates: Record<string, unknown>[], regionName?: string): Promise<void> {
  try {
    // TODO: implement remove_listener_certificates
    throw new Error("remove_listener_certificates not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "remove_listener_certificates failed");
  }
}

/** Remove trust store revocations. */
export async function removeTrustStoreRevocations(trustStoreArn: string, revocationIds: number[], regionName?: string): Promise<void> {
  try {
    // TODO: implement remove_trust_store_revocations
    throw new Error("remove_trust_store_revocations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "remove_trust_store_revocations failed");
  }
}

/** Set ip address type. */
export async function setIpAddressType(loadBalancerArn: string, ipAddressType: string, regionName?: string): Promise<SetIpAddressTypeResult> {
  try {
    // TODO: implement set_ip_address_type
    throw new Error("set_ip_address_type not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "set_ip_address_type failed");
  }
}

/** Set rule priorities. */
export async function setRulePriorities(rulePriorities: Record<string, unknown>[], regionName?: string): Promise<SetRulePrioritiesResult> {
  try {
    // TODO: implement set_rule_priorities
    throw new Error("set_rule_priorities not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "set_rule_priorities failed");
  }
}
