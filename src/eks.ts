import { EksClient } from "@aws-sdk/client-eks";
import { getClient } from "./client";
import { wrapAwsError } from "./exceptions";

/** Metadata for an EKS cluster. */
export type ClusterResult = {
  name: string;
  arn: string;
  status: string;
  endpoint?: string;
  roleArn: string;
  version?: string;
  platformVersion?: string;
  kubernetesNetworkConfig?: Record<string, unknown>;
  certificateAuthority?: string;
  createdAt?: string;
  tags?: Record<string, unknown>;
  extra?: Record<string, unknown>;
};

/** Metadata for an EKS managed node group. */
export type NodegroupResult = {
  nodegroupName: string;
  clusterName: string;
  status: string;
  capacityType?: string;
  scalingConfig?: Record<string, unknown>;
  instanceTypes?: string[];
  amiType?: string;
  nodeRole?: string;
  subnets?: string[];
  extra?: Record<string, unknown>;
};

/** Metadata for an EKS add-on. */
export type AddonResult = {
  addonName: string;
  clusterName: string;
  status: string;
  addonVersion?: string;
  serviceAccountRoleArn?: string;
  extra?: Record<string, unknown>;
};

/** Metadata for an EKS Fargate profile. */
export type FargateProfileResult = {
  fargateProfileName: string;
  clusterName: string;
  status: string;
  podExecutionRoleArn?: string;
  subnets?: string[];
  selectors?: Record<string, unknown>[];
  extra?: Record<string, unknown>;
};

/** Result of associate_access_policy. */
export type AssociateAccessPolicyResult = {
  clusterName?: string;
  principalArn?: string;
  associatedAccessPolicy?: Record<string, unknown>;
};

/** Result of associate_encryption_config. */
export type AssociateEncryptionConfigResult = {
  update?: Record<string, unknown>;
};

/** Result of associate_identity_provider_config. */
export type AssociateIdentityProviderConfigResult = {
  update?: Record<string, unknown>;
  tags?: Record<string, unknown>;
};

/** Result of create_access_entry. */
export type CreateAccessEntryResult = {
  accessEntry?: Record<string, unknown>;
};

/** Result of create_eks_anywhere_subscription. */
export type CreateEksAnywhereSubscriptionResult = {
  subscription?: Record<string, unknown>;
};

/** Result of create_pod_identity_association. */
export type CreatePodIdentityAssociationResult = {
  association?: Record<string, unknown>;
};

/** Result of delete_eks_anywhere_subscription. */
export type DeleteEksAnywhereSubscriptionResult = {
  subscription?: Record<string, unknown>;
};

/** Result of delete_pod_identity_association. */
export type DeletePodIdentityAssociationResult = {
  association?: Record<string, unknown>;
};

/** Result of deregister_cluster. */
export type DeregisterClusterResult = {
  cluster?: Record<string, unknown>;
};

/** Result of describe_access_entry. */
export type DescribeAccessEntryResult = {
  accessEntry?: Record<string, unknown>;
};

/** Result of describe_addon_configuration. */
export type DescribeAddonConfigurationResult = {
  addonName?: string;
  addonVersion?: string;
  configurationSchema?: string;
  podIdentityConfiguration?: Record<string, unknown>[];
};

/** Result of describe_addon_versions. */
export type DescribeAddonVersionsResult = {
  addons?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of describe_cluster_versions. */
export type DescribeClusterVersionsResult = {
  nextToken?: string;
  clusterVersions?: Record<string, unknown>[];
};

/** Result of describe_eks_anywhere_subscription. */
export type DescribeEksAnywhereSubscriptionResult = {
  subscription?: Record<string, unknown>;
};

/** Result of describe_identity_provider_config. */
export type DescribeIdentityProviderConfigResult = {
  identityProviderConfig?: Record<string, unknown>;
};

/** Result of describe_insight. */
export type DescribeInsightResult = {
  insight?: Record<string, unknown>;
};

/** Result of describe_insights_refresh. */
export type DescribeInsightsRefreshResult = {
  message?: string;
  status?: string;
  startedAt?: string;
  endedAt?: string;
};

/** Result of describe_pod_identity_association. */
export type DescribePodIdentityAssociationResult = {
  association?: Record<string, unknown>;
};

/** Result of describe_update. */
export type DescribeUpdateResult = {
  update?: Record<string, unknown>;
};

/** Result of disassociate_identity_provider_config. */
export type DisassociateIdentityProviderConfigResult = {
  update?: Record<string, unknown>;
};

/** Result of list_access_entries. */
export type ListAccessEntriesResult = {
  accessEntries?: string[];
  nextToken?: string;
};

/** Result of list_access_policies. */
export type ListAccessPoliciesResult = {
  accessPolicies?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_associated_access_policies. */
export type ListAssociatedAccessPoliciesResult = {
  clusterName?: string;
  principalArn?: string;
  nextToken?: string;
  associatedAccessPolicies?: Record<string, unknown>[];
};

/** Result of list_eks_anywhere_subscriptions. */
export type ListEksAnywhereSubscriptionsResult = {
  subscriptions?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_identity_provider_configs. */
export type ListIdentityProviderConfigsResult = {
  identityProviderConfigs?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_insights. */
export type ListInsightsResult = {
  insights?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_pod_identity_associations. */
export type ListPodIdentityAssociationsResult = {
  associations?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_tags_for_resource. */
export type ListTagsForResourceResult = {
  tags?: Record<string, unknown>;
};

/** Result of list_updates. */
export type ListUpdatesResult = {
  updateIds?: string[];
  nextToken?: string;
};

/** Result of register_cluster. */
export type RegisterClusterResult = {
  cluster?: Record<string, unknown>;
};

/** Result of start_insights_refresh. */
export type StartInsightsRefreshResult = {
  message?: string;
  status?: string;
};

/** Result of update_access_entry. */
export type UpdateAccessEntryResult = {
  accessEntry?: Record<string, unknown>;
};

/** Result of update_eks_anywhere_subscription. */
export type UpdateEksAnywhereSubscriptionResult = {
  subscription?: Record<string, unknown>;
};

/** Result of update_nodegroup_version. */
export type UpdateNodegroupVersionResult = {
  update?: Record<string, unknown>;
};

/** Result of update_pod_identity_association. */
export type UpdatePodIdentityAssociationResult = {
  association?: Record<string, unknown>;
};

/** Create an EKS cluster. */
export async function createCluster(name: string): Promise<ClusterResult> {
  try {
    // TODO: implement create_cluster
    throw new Error("create_cluster not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_cluster failed");
  }
}

/** Describe an EKS cluster. */
export async function describeCluster(name: string): Promise<ClusterResult> {
  try {
    // TODO: implement describe_cluster
    throw new Error("describe_cluster not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_cluster failed");
  }
}

/** List all EKS cluster names in the account. */
export async function listClusters(): Promise<string[]> {
  try {
    // TODO: implement list_clusters
    throw new Error("list_clusters not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_clusters failed");
  }
}

/** Delete an EKS cluster. */
export async function deleteCluster(name: string): Promise<ClusterResult> {
  try {
    // TODO: implement delete_cluster
    throw new Error("delete_cluster not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_cluster failed");
  }
}

/** Update the Kubernetes version of an EKS cluster. */
export async function updateClusterVersion(name: string): Promise<Record<string, unknown>> {
  try {
    // TODO: implement update_cluster_version
    throw new Error("update_cluster_version not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_cluster_version failed");
  }
}

/** Update the configuration of an EKS cluster. */
export async function updateClusterConfig(name: string): Promise<Record<string, unknown>> {
  try {
    // TODO: implement update_cluster_config
    throw new Error("update_cluster_config not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_cluster_config failed");
  }
}

/** Create a managed node group for an EKS cluster. */
export async function createNodegroup(clusterName: string, nodegroupName: string): Promise<NodegroupResult> {
  try {
    // TODO: implement create_nodegroup
    throw new Error("create_nodegroup not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_nodegroup failed");
  }
}

/** Describe an EKS managed node group. */
export async function describeNodegroup(clusterName: string, nodegroupName: string): Promise<NodegroupResult> {
  try {
    // TODO: implement describe_nodegroup
    throw new Error("describe_nodegroup not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_nodegroup failed");
  }
}

/** List node group names for an EKS cluster. */
export async function listNodegroups(clusterName: string): Promise<string[]> {
  try {
    // TODO: implement list_nodegroups
    throw new Error("list_nodegroups not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_nodegroups failed");
  }
}

/** Delete an EKS managed node group. */
export async function deleteNodegroup(clusterName: string, nodegroupName: string): Promise<NodegroupResult> {
  try {
    // TODO: implement delete_nodegroup
    throw new Error("delete_nodegroup not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_nodegroup failed");
  }
}

/** Update the configuration of an EKS managed node group. */
export async function updateNodegroupConfig(clusterName: string, nodegroupName: string): Promise<Record<string, unknown>> {
  try {
    // TODO: implement update_nodegroup_config
    throw new Error("update_nodegroup_config not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_nodegroup_config failed");
  }
}

/** Create a Fargate profile for an EKS cluster. */
export async function createFargateProfile(clusterName: string, fargateProfileName: string): Promise<FargateProfileResult> {
  try {
    // TODO: implement create_fargate_profile
    throw new Error("create_fargate_profile not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_fargate_profile failed");
  }
}

/** Describe an EKS Fargate profile. */
export async function describeFargateProfile(clusterName: string, fargateProfileName: string): Promise<FargateProfileResult> {
  try {
    // TODO: implement describe_fargate_profile
    throw new Error("describe_fargate_profile not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_fargate_profile failed");
  }
}

/** List Fargate profile names for an EKS cluster. */
export async function listFargateProfiles(clusterName: string): Promise<string[]> {
  try {
    // TODO: implement list_fargate_profiles
    throw new Error("list_fargate_profiles not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_fargate_profiles failed");
  }
}

/** Delete an EKS Fargate profile. */
export async function deleteFargateProfile(clusterName: string, fargateProfileName: string): Promise<FargateProfileResult> {
  try {
    // TODO: implement delete_fargate_profile
    throw new Error("delete_fargate_profile not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_fargate_profile failed");
  }
}

/** Create an EKS add-on. */
export async function createAddon(clusterName: string, addonName: string): Promise<AddonResult> {
  try {
    // TODO: implement create_addon
    throw new Error("create_addon not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_addon failed");
  }
}

/** Describe an EKS add-on. */
export async function describeAddon(clusterName: string, addonName: string): Promise<AddonResult> {
  try {
    // TODO: implement describe_addon
    throw new Error("describe_addon not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_addon failed");
  }
}

/** List add-on names for an EKS cluster. */
export async function listAddons(clusterName: string): Promise<string[]> {
  try {
    // TODO: implement list_addons
    throw new Error("list_addons not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_addons failed");
  }
}

/** Delete an EKS add-on. */
export async function deleteAddon(clusterName: string, addonName: string): Promise<AddonResult> {
  try {
    // TODO: implement delete_addon
    throw new Error("delete_addon not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_addon failed");
  }
}

/** Update an EKS add-on. */
export async function updateAddon(clusterName: string, addonName: string): Promise<Record<string, unknown>> {
  try {
    // TODO: implement update_addon
    throw new Error("update_addon not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_addon failed");
  }
}

/** Poll until an EKS cluster reaches a desired status. */
export async function waitForCluster(name: string): Promise<ClusterResult> {
  try {
    // TODO: implement wait_for_cluster
    throw new Error("wait_for_cluster not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "wait_for_cluster failed");
  }
}

/** Poll until an EKS node group reaches a desired status. */
export async function waitForNodegroup(clusterName: string, nodegroupName: string): Promise<NodegroupResult> {
  try {
    // TODO: implement wait_for_nodegroup
    throw new Error("wait_for_nodegroup not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "wait_for_nodegroup failed");
  }
}

/** Associate access policy. */
export async function associateAccessPolicy(clusterName: string, principalArn: string, policyArn: string, accessScope: Record<string, unknown>, regionName?: string): Promise<AssociateAccessPolicyResult> {
  try {
    // TODO: implement associate_access_policy
    throw new Error("associate_access_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "associate_access_policy failed");
  }
}

/** Associate encryption config. */
export async function associateEncryptionConfig(clusterName: string, encryptionConfig: Record<string, unknown>[]): Promise<AssociateEncryptionConfigResult> {
  try {
    // TODO: implement associate_encryption_config
    throw new Error("associate_encryption_config not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "associate_encryption_config failed");
  }
}

/** Associate identity provider config. */
export async function associateIdentityProviderConfig(clusterName: string, oidc: Record<string, unknown>): Promise<AssociateIdentityProviderConfigResult> {
  try {
    // TODO: implement associate_identity_provider_config
    throw new Error("associate_identity_provider_config not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "associate_identity_provider_config failed");
  }
}

/** Create access entry. */
export async function createAccessEntry(clusterName: string, principalArn: string): Promise<CreateAccessEntryResult> {
  try {
    // TODO: implement create_access_entry
    throw new Error("create_access_entry not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_access_entry failed");
  }
}

/** Create eks anywhere subscription. */
export async function createEksAnywhereSubscription(name: string, term: Record<string, unknown>): Promise<CreateEksAnywhereSubscriptionResult> {
  try {
    // TODO: implement create_eks_anywhere_subscription
    throw new Error("create_eks_anywhere_subscription not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_eks_anywhere_subscription failed");
  }
}

/** Create pod identity association. */
export async function createPodIdentityAssociation(clusterName: string, namespace: string, serviceAccount: string, roleArn: string): Promise<CreatePodIdentityAssociationResult> {
  try {
    // TODO: implement create_pod_identity_association
    throw new Error("create_pod_identity_association not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_pod_identity_association failed");
  }
}

/** Delete access entry. */
export async function deleteAccessEntry(clusterName: string, principalArn: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_access_entry
    throw new Error("delete_access_entry not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_access_entry failed");
  }
}

/** Delete eks anywhere subscription. */
export async function deleteEksAnywhereSubscription(id: string, regionName?: string): Promise<DeleteEksAnywhereSubscriptionResult> {
  try {
    // TODO: implement delete_eks_anywhere_subscription
    throw new Error("delete_eks_anywhere_subscription not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_eks_anywhere_subscription failed");
  }
}

/** Delete pod identity association. */
export async function deletePodIdentityAssociation(clusterName: string, associationId: string, regionName?: string): Promise<DeletePodIdentityAssociationResult> {
  try {
    // TODO: implement delete_pod_identity_association
    throw new Error("delete_pod_identity_association not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_pod_identity_association failed");
  }
}

/** Deregister cluster. */
export async function deregisterCluster(name: string, regionName?: string): Promise<DeregisterClusterResult> {
  try {
    // TODO: implement deregister_cluster
    throw new Error("deregister_cluster not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "deregister_cluster failed");
  }
}

/** Describe access entry. */
export async function describeAccessEntry(clusterName: string, principalArn: string, regionName?: string): Promise<DescribeAccessEntryResult> {
  try {
    // TODO: implement describe_access_entry
    throw new Error("describe_access_entry not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_access_entry failed");
  }
}

/** Describe addon configuration. */
export async function describeAddonConfiguration(addonName: string, addonVersion: string, regionName?: string): Promise<DescribeAddonConfigurationResult> {
  try {
    // TODO: implement describe_addon_configuration
    throw new Error("describe_addon_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_addon_configuration failed");
  }
}

/** Describe addon versions. */
export async function describeAddonVersions(): Promise<DescribeAddonVersionsResult> {
  try {
    // TODO: implement describe_addon_versions
    throw new Error("describe_addon_versions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_addon_versions failed");
  }
}

/** Describe cluster versions. */
export async function describeClusterVersions(): Promise<DescribeClusterVersionsResult> {
  try {
    // TODO: implement describe_cluster_versions
    throw new Error("describe_cluster_versions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_cluster_versions failed");
  }
}

/** Describe eks anywhere subscription. */
export async function describeEksAnywhereSubscription(id: string, regionName?: string): Promise<DescribeEksAnywhereSubscriptionResult> {
  try {
    // TODO: implement describe_eks_anywhere_subscription
    throw new Error("describe_eks_anywhere_subscription not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_eks_anywhere_subscription failed");
  }
}

/** Describe identity provider config. */
export async function describeIdentityProviderConfig(clusterName: string, identityProviderConfig: Record<string, unknown>, regionName?: string): Promise<DescribeIdentityProviderConfigResult> {
  try {
    // TODO: implement describe_identity_provider_config
    throw new Error("describe_identity_provider_config not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_identity_provider_config failed");
  }
}

/** Describe insight. */
export async function describeInsight(clusterName: string, id: string, regionName?: string): Promise<DescribeInsightResult> {
  try {
    // TODO: implement describe_insight
    throw new Error("describe_insight not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_insight failed");
  }
}

/** Describe insights refresh. */
export async function describeInsightsRefresh(clusterName: string, regionName?: string): Promise<DescribeInsightsRefreshResult> {
  try {
    // TODO: implement describe_insights_refresh
    throw new Error("describe_insights_refresh not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_insights_refresh failed");
  }
}

/** Describe pod identity association. */
export async function describePodIdentityAssociation(clusterName: string, associationId: string, regionName?: string): Promise<DescribePodIdentityAssociationResult> {
  try {
    // TODO: implement describe_pod_identity_association
    throw new Error("describe_pod_identity_association not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_pod_identity_association failed");
  }
}

/** Describe update. */
export async function describeUpdate(name: string, updateId: string): Promise<DescribeUpdateResult> {
  try {
    // TODO: implement describe_update
    throw new Error("describe_update not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_update failed");
  }
}

/** Disassociate access policy. */
export async function disassociateAccessPolicy(clusterName: string, principalArn: string, policyArn: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement disassociate_access_policy
    throw new Error("disassociate_access_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disassociate_access_policy failed");
  }
}

/** Disassociate identity provider config. */
export async function disassociateIdentityProviderConfig(clusterName: string, identityProviderConfig: Record<string, unknown>): Promise<DisassociateIdentityProviderConfigResult> {
  try {
    // TODO: implement disassociate_identity_provider_config
    throw new Error("disassociate_identity_provider_config not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disassociate_identity_provider_config failed");
  }
}

/** List access entries. */
export async function listAccessEntries(clusterName: string): Promise<ListAccessEntriesResult> {
  try {
    // TODO: implement list_access_entries
    throw new Error("list_access_entries not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_access_entries failed");
  }
}

/** List access policies. */
export async function listAccessPolicies(): Promise<ListAccessPoliciesResult> {
  try {
    // TODO: implement list_access_policies
    throw new Error("list_access_policies not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_access_policies failed");
  }
}

/** List associated access policies. */
export async function listAssociatedAccessPolicies(clusterName: string, principalArn: string): Promise<ListAssociatedAccessPoliciesResult> {
  try {
    // TODO: implement list_associated_access_policies
    throw new Error("list_associated_access_policies not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_associated_access_policies failed");
  }
}

/** List eks anywhere subscriptions. */
export async function listEksAnywhereSubscriptions(): Promise<ListEksAnywhereSubscriptionsResult> {
  try {
    // TODO: implement list_eks_anywhere_subscriptions
    throw new Error("list_eks_anywhere_subscriptions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_eks_anywhere_subscriptions failed");
  }
}

/** List identity provider configs. */
export async function listIdentityProviderConfigs(clusterName: string): Promise<ListIdentityProviderConfigsResult> {
  try {
    // TODO: implement list_identity_provider_configs
    throw new Error("list_identity_provider_configs not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_identity_provider_configs failed");
  }
}

/** List insights. */
export async function listInsights(clusterName: string): Promise<ListInsightsResult> {
  try {
    // TODO: implement list_insights
    throw new Error("list_insights not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_insights failed");
  }
}

/** List pod identity associations. */
export async function listPodIdentityAssociations(clusterName: string): Promise<ListPodIdentityAssociationsResult> {
  try {
    // TODO: implement list_pod_identity_associations
    throw new Error("list_pod_identity_associations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_pod_identity_associations failed");
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

/** List updates. */
export async function listUpdates(name: string): Promise<ListUpdatesResult> {
  try {
    // TODO: implement list_updates
    throw new Error("list_updates not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_updates failed");
  }
}

/** Register cluster. */
export async function registerCluster(name: string, connectorConfig: Record<string, unknown>): Promise<RegisterClusterResult> {
  try {
    // TODO: implement register_cluster
    throw new Error("register_cluster not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "register_cluster failed");
  }
}

/** Start insights refresh. */
export async function startInsightsRefresh(clusterName: string, regionName?: string): Promise<StartInsightsRefreshResult> {
  try {
    // TODO: implement start_insights_refresh
    throw new Error("start_insights_refresh not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_insights_refresh failed");
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

/** Update access entry. */
export async function updateAccessEntry(clusterName: string, principalArn: string): Promise<UpdateAccessEntryResult> {
  try {
    // TODO: implement update_access_entry
    throw new Error("update_access_entry not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_access_entry failed");
  }
}

/** Update eks anywhere subscription. */
export async function updateEksAnywhereSubscription(id: string, autoRenew: boolean): Promise<UpdateEksAnywhereSubscriptionResult> {
  try {
    // TODO: implement update_eks_anywhere_subscription
    throw new Error("update_eks_anywhere_subscription not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_eks_anywhere_subscription failed");
  }
}

/** Update nodegroup version. */
export async function updateNodegroupVersion(clusterName: string, nodegroupName: string): Promise<UpdateNodegroupVersionResult> {
  try {
    // TODO: implement update_nodegroup_version
    throw new Error("update_nodegroup_version not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_nodegroup_version failed");
  }
}

/** Update pod identity association. */
export async function updatePodIdentityAssociation(clusterName: string, associationId: string): Promise<UpdatePodIdentityAssociationResult> {
  try {
    // TODO: implement update_pod_identity_association
    throw new Error("update_pod_identity_association not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_pod_identity_association failed");
  }
}
