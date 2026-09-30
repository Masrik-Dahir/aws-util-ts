import { MskClient } from "@aws-sdk/client-kafka";
import { getClient } from "./client";
import { wrapAwsError } from "./exceptions";

/** Metadata for an MSK cluster. */
export type ClusterResult = {
  clusterName: string;
  clusterArn: string;
  state: string;
  clusterType?: string;
  creationTime?: string;
  currentVersion?: string;
  numberOfBrokerNodes?: number;
  brokerNodeGroupInfo?: Record<string, unknown>;
  encryptionInfo?: Record<string, unknown>;
  tags?: Record<string, unknown>;
  extra?: Record<string, unknown>;
};

/** Metadata for an MSK configuration. */
export type ConfigurationResult = {
  arn: string;
  name: string;
  creationTime?: string;
  description?: string;
  kafkaVersions?: string[];
  latestRevision?: Record<string, unknown>;
  state?: string;
  extra?: Record<string, unknown>;
};

/** Metadata for an MSK broker node. */
export type NodeResult = {
  nodeType?: string;
  nodeArn?: string;
  instanceType?: string;
  brokerNodeInfo?: Record<string, unknown>;
  extra?: Record<string, unknown>;
};

/** Result of batch_associate_scram_secret. */
export type BatchAssociateScramSecretResult = {
  clusterArn?: string;
  unprocessedScramSecrets?: Record<string, unknown>[];
};

/** Result of batch_disassociate_scram_secret. */
export type BatchDisassociateScramSecretResult = {
  clusterArn?: string;
  unprocessedScramSecrets?: Record<string, unknown>[];
};

/** Result of create_cluster_v2. */
export type CreateClusterV2Result = {
  clusterArn?: string;
  clusterName?: string;
  state?: string;
  clusterType?: string;
};

/** Result of create_replicator. */
export type CreateReplicatorResult = {
  replicatorArn?: string;
  replicatorName?: string;
  replicatorState?: string;
};

/** Result of create_vpc_connection. */
export type CreateVpcConnectionResult = {
  vpcConnectionArn?: string;
  state?: string;
  authentication?: string;
  vpcId?: string;
  clientSubnets?: string[];
  securityGroups?: string[];
  creationTime?: string;
  tags?: Record<string, unknown>;
};

/** Result of delete_configuration. */
export type DeleteConfigurationResult = {
  arn?: string;
  state?: string;
};

/** Result of delete_replicator. */
export type DeleteReplicatorResult = {
  replicatorArn?: string;
  replicatorState?: string;
};

/** Result of delete_vpc_connection. */
export type DeleteVpcConnectionResult = {
  vpcConnectionArn?: string;
  state?: string;
};

/** Result of describe_cluster_operation. */
export type DescribeClusterOperationResult = {
  clusterOperationInfo?: Record<string, unknown>;
};

/** Result of describe_cluster_operation_v2. */
export type DescribeClusterOperationV2Result = {
  clusterOperationInfo?: Record<string, unknown>;
};

/** Result of describe_cluster_v2. */
export type DescribeClusterV2Result = {
  clusterInfo?: Record<string, unknown>;
};

/** Result of describe_configuration. */
export type DescribeConfigurationResult = {
  arn?: string;
  creationTime?: string;
  description?: string;
  kafkaVersions?: string[];
  latestRevision?: Record<string, unknown>;
  name?: string;
  state?: string;
};

/** Result of describe_configuration_revision. */
export type DescribeConfigurationRevisionResult = {
  arn?: string;
  creationTime?: string;
  description?: string;
  revision?: number;
  serverProperties?: Uint8Array;
};

/** Result of describe_replicator. */
export type DescribeReplicatorResult = {
  creationTime?: string;
  currentVersion?: string;
  isReplicatorReference?: boolean;
  kafkaClusters?: Record<string, unknown>[];
  replicationInfoList?: Record<string, unknown>[];
  replicatorArn?: string;
  replicatorDescription?: string;
  replicatorName?: string;
  replicatorResourceArn?: string;
  replicatorState?: string;
  serviceExecutionRoleArn?: string;
  stateInfo?: Record<string, unknown>;
  tags?: Record<string, unknown>;
};

/** Result of describe_vpc_connection. */
export type DescribeVpcConnectionResult = {
  vpcConnectionArn?: string;
  targetClusterArn?: string;
  state?: string;
  authentication?: string;
  vpcId?: string;
  subnets?: string[];
  securityGroups?: string[];
  creationTime?: string;
  tags?: Record<string, unknown>;
};

/** Result of get_cluster_policy. */
export type GetClusterPolicyResult = {
  currentVersion?: string;
  policy?: string;
};

/** Result of get_compatible_kafka_versions. */
export type GetCompatibleKafkaVersionsResult = {
  compatibleKafkaVersions?: Record<string, unknown>[];
};

/** Result of list_client_vpc_connections. */
export type ListClientVpcConnectionsResult = {
  clientVpcConnections?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_cluster_operations. */
export type ListClusterOperationsResult = {
  clusterOperationInfoList?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_cluster_operations_v2. */
export type ListClusterOperationsV2Result = {
  clusterOperationInfoList?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_clusters_v2. */
export type ListClustersV2Result = {
  clusterInfoList?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_configuration_revisions. */
export type ListConfigurationRevisionsResult = {
  nextToken?: string;
  revisions?: Record<string, unknown>[];
};

/** Result of list_kafka_versions. */
export type ListKafkaVersionsResult = {
  kafkaVersions?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_replicators. */
export type ListReplicatorsResult = {
  nextToken?: string;
  replicators?: Record<string, unknown>[];
};

/** Result of list_scram_secrets. */
export type ListScramSecretsResult = {
  nextToken?: string;
  secretArnList?: string[];
};

/** Result of list_tags_for_resource. */
export type ListTagsForResourceResult = {
  tags?: Record<string, unknown>;
};

/** Result of list_vpc_connections. */
export type ListVpcConnectionsResult = {
  vpcConnections?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of put_cluster_policy. */
export type PutClusterPolicyResult = {
  currentVersion?: string;
};

/** Result of reboot_broker. */
export type RebootBrokerResult = {
  clusterArn?: string;
  clusterOperationArn?: string;
};

/** Result of update_broker_type. */
export type UpdateBrokerTypeResult = {
  clusterArn?: string;
  clusterOperationArn?: string;
};

/** Result of update_cluster_kafka_version. */
export type UpdateClusterKafkaVersionResult = {
  clusterArn?: string;
  clusterOperationArn?: string;
};

/** Result of update_configuration. */
export type UpdateConfigurationResult = {
  arn?: string;
  latestRevision?: Record<string, unknown>;
};

/** Result of update_connectivity. */
export type UpdateConnectivityResult = {
  clusterArn?: string;
  clusterOperationArn?: string;
};

/** Result of update_monitoring. */
export type UpdateMonitoringResult = {
  clusterArn?: string;
  clusterOperationArn?: string;
};

/** Result of update_rebalancing. */
export type UpdateRebalancingResult = {
  clusterArn?: string;
  clusterOperationArn?: string;
};

/** Result of update_replication_info. */
export type UpdateReplicationInfoResult = {
  replicatorArn?: string;
  replicatorState?: string;
};

/** Result of update_security. */
export type UpdateSecurityResult = {
  clusterArn?: string;
  clusterOperationArn?: string;
};

/** Result of update_storage. */
export type UpdateStorageResult = {
  clusterArn?: string;
  clusterOperationArn?: string;
};

/** Create an MSK cluster. */
export async function createCluster(clusterName: string): Promise<ClusterResult> {
  try {
    // TODO: implement create_cluster
    throw new Error("create_cluster not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_cluster failed");
  }
}

/** Describe an MSK cluster. */
export async function describeCluster(clusterArn: string): Promise<ClusterResult> {
  try {
    // TODO: implement describe_cluster
    throw new Error("describe_cluster not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_cluster failed");
  }
}

/** List all MSK clusters in the account. */
export async function listClusters(): Promise<ClusterResult[]> {
  try {
    // TODO: implement list_clusters
    throw new Error("list_clusters not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_clusters failed");
  }
}

/** Delete an MSK cluster. */
export async function deleteCluster(clusterArn: string): Promise<Record<string, unknown>> {
  try {
    // TODO: implement delete_cluster
    throw new Error("delete_cluster not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_cluster failed");
  }
}

/** Update the number of broker nodes in an MSK cluster. */
export async function updateBrokerCount(clusterArn: string): Promise<Record<string, unknown>> {
  try {
    // TODO: implement update_broker_count
    throw new Error("update_broker_count not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_broker_count failed");
  }
}

/** Update the EBS storage for broker nodes in an MSK cluster. */
export async function updateBrokerStorage(clusterArn: string): Promise<Record<string, unknown>> {
  try {
    // TODO: implement update_broker_storage
    throw new Error("update_broker_storage not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_broker_storage failed");
  }
}

/** Update the configuration of an MSK cluster. */
export async function updateClusterConfiguration(clusterArn: string): Promise<Record<string, unknown>> {
  try {
    // TODO: implement update_cluster_configuration
    throw new Error("update_cluster_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_cluster_configuration failed");
  }
}

/** List broker nodes for an MSK cluster. */
export async function listNodes(clusterArn: string): Promise<NodeResult[]> {
  try {
    // TODO: implement list_nodes
    throw new Error("list_nodes not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_nodes failed");
  }
}

/** Get the bootstrap broker connection strings for an MSK cluster. */
export async function getBootstrapBrokers(clusterArn: string): Promise<Record<string, unknown>> {
  try {
    // TODO: implement get_bootstrap_brokers
    throw new Error("get_bootstrap_brokers not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_bootstrap_brokers failed");
  }
}

/** Create an MSK configuration. */
export async function createConfiguration(name: string): Promise<ConfigurationResult> {
  try {
    // TODO: implement create_configuration
    throw new Error("create_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_configuration failed");
  }
}

/** List all MSK configurations in the account. */
export async function listConfigurations(): Promise<ConfigurationResult[]> {
  try {
    // TODO: implement list_configurations
    throw new Error("list_configurations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_configurations failed");
  }
}

/** Poll until an MSK cluster reaches a desired state. */
export async function waitForCluster(clusterArn: string): Promise<ClusterResult> {
  try {
    // TODO: implement wait_for_cluster
    throw new Error("wait_for_cluster not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "wait_for_cluster failed");
  }
}

/** Batch associate scram secret. */
export async function batchAssociateScramSecret(clusterArn: string, secretArnList: string[], regionName?: string): Promise<BatchAssociateScramSecretResult> {
  try {
    // TODO: implement batch_associate_scram_secret
    throw new Error("batch_associate_scram_secret not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_associate_scram_secret failed");
  }
}

/** Batch disassociate scram secret. */
export async function batchDisassociateScramSecret(clusterArn: string, secretArnList: string[], regionName?: string): Promise<BatchDisassociateScramSecretResult> {
  try {
    // TODO: implement batch_disassociate_scram_secret
    throw new Error("batch_disassociate_scram_secret not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_disassociate_scram_secret failed");
  }
}

/** Create cluster v2. */
export async function createClusterV2(clusterName: string): Promise<CreateClusterV2Result> {
  try {
    // TODO: implement create_cluster_v2
    throw new Error("create_cluster_v2 not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_cluster_v2 failed");
  }
}

/** Create replicator. */
export async function createReplicator(kafkaClusters: Record<string, unknown>[], replicationInfoList: Record<string, unknown>[], replicatorName: string, serviceExecutionRoleArn: string): Promise<CreateReplicatorResult> {
  try {
    // TODO: implement create_replicator
    throw new Error("create_replicator not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_replicator failed");
  }
}

/** Create vpc connection. */
export async function createVpcConnection(targetClusterArn: string, authentication: string, vpcId: string, clientSubnets: string[], securityGroups: string[]): Promise<CreateVpcConnectionResult> {
  try {
    // TODO: implement create_vpc_connection
    throw new Error("create_vpc_connection not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_vpc_connection failed");
  }
}

/** Delete cluster policy. */
export async function deleteClusterPolicy(clusterArn: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_cluster_policy
    throw new Error("delete_cluster_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_cluster_policy failed");
  }
}

/** Delete configuration. */
export async function deleteConfiguration(arn: string, regionName?: string): Promise<DeleteConfigurationResult> {
  try {
    // TODO: implement delete_configuration
    throw new Error("delete_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_configuration failed");
  }
}

/** Delete replicator. */
export async function deleteReplicator(replicatorArn: string): Promise<DeleteReplicatorResult> {
  try {
    // TODO: implement delete_replicator
    throw new Error("delete_replicator not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_replicator failed");
  }
}

/** Delete vpc connection. */
export async function deleteVpcConnection(arn: string, regionName?: string): Promise<DeleteVpcConnectionResult> {
  try {
    // TODO: implement delete_vpc_connection
    throw new Error("delete_vpc_connection not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_vpc_connection failed");
  }
}

/** Describe cluster operation. */
export async function describeClusterOperation(clusterOperationArn: string, regionName?: string): Promise<DescribeClusterOperationResult> {
  try {
    // TODO: implement describe_cluster_operation
    throw new Error("describe_cluster_operation not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_cluster_operation failed");
  }
}

/** Describe cluster operation v2. */
export async function describeClusterOperationV2(clusterOperationArn: string, regionName?: string): Promise<DescribeClusterOperationV2Result> {
  try {
    // TODO: implement describe_cluster_operation_v2
    throw new Error("describe_cluster_operation_v2 not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_cluster_operation_v2 failed");
  }
}

/** Describe cluster v2. */
export async function describeClusterV2(clusterArn: string, regionName?: string): Promise<DescribeClusterV2Result> {
  try {
    // TODO: implement describe_cluster_v2
    throw new Error("describe_cluster_v2 not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_cluster_v2 failed");
  }
}

/** Describe configuration. */
export async function describeConfiguration(arn: string, regionName?: string): Promise<DescribeConfigurationResult> {
  try {
    // TODO: implement describe_configuration
    throw new Error("describe_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_configuration failed");
  }
}

/** Describe configuration revision. */
export async function describeConfigurationRevision(arn: string, revision: number, regionName?: string): Promise<DescribeConfigurationRevisionResult> {
  try {
    // TODO: implement describe_configuration_revision
    throw new Error("describe_configuration_revision not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_configuration_revision failed");
  }
}

/** Describe replicator. */
export async function describeReplicator(replicatorArn: string, regionName?: string): Promise<DescribeReplicatorResult> {
  try {
    // TODO: implement describe_replicator
    throw new Error("describe_replicator not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_replicator failed");
  }
}

/** Describe vpc connection. */
export async function describeVpcConnection(arn: string, regionName?: string): Promise<DescribeVpcConnectionResult> {
  try {
    // TODO: implement describe_vpc_connection
    throw new Error("describe_vpc_connection not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_vpc_connection failed");
  }
}

/** Get cluster policy. */
export async function getClusterPolicy(clusterArn: string, regionName?: string): Promise<GetClusterPolicyResult> {
  try {
    // TODO: implement get_cluster_policy
    throw new Error("get_cluster_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_cluster_policy failed");
  }
}

/** Get compatible kafka versions. */
export async function getCompatibleKafkaVersions(): Promise<GetCompatibleKafkaVersionsResult> {
  try {
    // TODO: implement get_compatible_kafka_versions
    throw new Error("get_compatible_kafka_versions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_compatible_kafka_versions failed");
  }
}

/** List client vpc connections. */
export async function listClientVpcConnections(clusterArn: string): Promise<ListClientVpcConnectionsResult> {
  try {
    // TODO: implement list_client_vpc_connections
    throw new Error("list_client_vpc_connections not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_client_vpc_connections failed");
  }
}

/** List cluster operations. */
export async function listClusterOperations(clusterArn: string): Promise<ListClusterOperationsResult> {
  try {
    // TODO: implement list_cluster_operations
    throw new Error("list_cluster_operations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_cluster_operations failed");
  }
}

/** List cluster operations v2. */
export async function listClusterOperationsV2(clusterArn: string): Promise<ListClusterOperationsV2Result> {
  try {
    // TODO: implement list_cluster_operations_v2
    throw new Error("list_cluster_operations_v2 not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_cluster_operations_v2 failed");
  }
}

/** List clusters v2. */
export async function listClustersV2(): Promise<ListClustersV2Result> {
  try {
    // TODO: implement list_clusters_v2
    throw new Error("list_clusters_v2 not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_clusters_v2 failed");
  }
}

/** List configuration revisions. */
export async function listConfigurationRevisions(arn: string): Promise<ListConfigurationRevisionsResult> {
  try {
    // TODO: implement list_configuration_revisions
    throw new Error("list_configuration_revisions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_configuration_revisions failed");
  }
}

/** List kafka versions. */
export async function listKafkaVersions(): Promise<ListKafkaVersionsResult> {
  try {
    // TODO: implement list_kafka_versions
    throw new Error("list_kafka_versions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_kafka_versions failed");
  }
}

/** List replicators. */
export async function listReplicators(): Promise<ListReplicatorsResult> {
  try {
    // TODO: implement list_replicators
    throw new Error("list_replicators not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_replicators failed");
  }
}

/** List scram secrets. */
export async function listScramSecrets(clusterArn: string): Promise<ListScramSecretsResult> {
  try {
    // TODO: implement list_scram_secrets
    throw new Error("list_scram_secrets not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_scram_secrets failed");
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

/** List vpc connections. */
export async function listVpcConnections(): Promise<ListVpcConnectionsResult> {
  try {
    // TODO: implement list_vpc_connections
    throw new Error("list_vpc_connections not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_vpc_connections failed");
  }
}

/** Put cluster policy. */
export async function putClusterPolicy(clusterArn: string, policy: string): Promise<PutClusterPolicyResult> {
  try {
    // TODO: implement put_cluster_policy
    throw new Error("put_cluster_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_cluster_policy failed");
  }
}

/** Reboot broker. */
export async function rebootBroker(brokerIds: string[], clusterArn: string, regionName?: string): Promise<RebootBrokerResult> {
  try {
    // TODO: implement reboot_broker
    throw new Error("reboot_broker not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "reboot_broker failed");
  }
}

/** Reject client vpc connection. */
export async function rejectClientVpcConnection(clusterArn: string, vpcConnectionArn: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement reject_client_vpc_connection
    throw new Error("reject_client_vpc_connection not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "reject_client_vpc_connection failed");
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

/** Update broker type. */
export async function updateBrokerType(clusterArn: string, currentVersion: string, targetInstanceType: string, regionName?: string): Promise<UpdateBrokerTypeResult> {
  try {
    // TODO: implement update_broker_type
    throw new Error("update_broker_type not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_broker_type failed");
  }
}

/** Update cluster kafka version. */
export async function updateClusterKafkaVersion(clusterArn: string, currentVersion: string, targetKafkaVersion: string): Promise<UpdateClusterKafkaVersionResult> {
  try {
    // TODO: implement update_cluster_kafka_version
    throw new Error("update_cluster_kafka_version not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_cluster_kafka_version failed");
  }
}

/** Update configuration. */
export async function updateConfiguration(arn: string, serverProperties: Uint8Array): Promise<UpdateConfigurationResult> {
  try {
    // TODO: implement update_configuration
    throw new Error("update_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_configuration failed");
  }
}

/** Update connectivity. */
export async function updateConnectivity(clusterArn: string, connectivityInfo: Record<string, unknown>, currentVersion: string, regionName?: string): Promise<UpdateConnectivityResult> {
  try {
    // TODO: implement update_connectivity
    throw new Error("update_connectivity not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_connectivity failed");
  }
}

/** Update monitoring. */
export async function updateMonitoring(clusterArn: string, currentVersion: string): Promise<UpdateMonitoringResult> {
  try {
    // TODO: implement update_monitoring
    throw new Error("update_monitoring not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_monitoring failed");
  }
}

/** Update rebalancing. */
export async function updateRebalancing(clusterArn: string, currentVersion: string, rebalancing: Record<string, unknown>, regionName?: string): Promise<UpdateRebalancingResult> {
  try {
    // TODO: implement update_rebalancing
    throw new Error("update_rebalancing not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_rebalancing failed");
  }
}

/** Update replication info. */
export async function updateReplicationInfo(currentVersion: string, replicatorArn: string, sourceKafkaClusterArn: string, targetKafkaClusterArn: string): Promise<UpdateReplicationInfoResult> {
  try {
    // TODO: implement update_replication_info
    throw new Error("update_replication_info not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_replication_info failed");
  }
}

/** Update security. */
export async function updateSecurity(clusterArn: string, currentVersion: string): Promise<UpdateSecurityResult> {
  try {
    // TODO: implement update_security
    throw new Error("update_security not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_security failed");
  }
}

/** Update storage. */
export async function updateStorage(clusterArn: string, currentVersion: string): Promise<UpdateStorageResult> {
  try {
    // TODO: implement update_storage
    throw new Error("update_storage not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_storage failed");
  }
}
