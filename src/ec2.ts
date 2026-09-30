/**
 * aws-util/ec2 — High-level Amazon EC2 utilities.
 *
 * Provides typed, ergonomic wrappers around the AWS SDK v3 EC2 client for
 * common operations: describing instances, managing instance lifecycle,
 * creating/querying AMIs, security groups, and console output.
 *
 * All functions obtain an EC2Client via {@link getClient} and wrap errors
 * through {@link wrapAwsError}.
 *
 * @module
 */

import { z } from "zod";
import {
  EC2Client,
  DescribeInstancesCommand,
  StartInstancesCommand,
  StopInstancesCommand,
  RebootInstancesCommand,
  TerminateInstancesCommand,
  CreateImageCommand,
  DescribeImagesCommand,
  DescribeSecurityGroupsCommand,
  GetConsoleOutputCommand,
} from "@aws-sdk/client-ec2";
import { getClient } from "./client.js";
import {
  wrapAwsError,
  AwsServiceError,
  AwsTimeoutError,
} from "./exceptions.js";

// ---------------------------------------------------------------------------
// Zod schemas & inferred types
// ---------------------------------------------------------------------------

/** Schema for an EC2 instance. */
export const EC2InstanceSchema = z.object({
  instanceId: z.string(),
  instanceType: z.string(),
  state: z.string(),
  publicIpAddress: z.string().optional(),
  privateIpAddress: z.string().optional(),
  launchTime: z.date().optional(),
  tags: z.record(z.string()).optional(),
});
/** Metadata for a single EC2 instance. */
export type EC2Instance = z.infer<typeof EC2InstanceSchema>;

/** Schema for an EC2 AMI image. */
export const EC2ImageSchema = z.object({
  imageId: z.string(),
  name: z.string().optional(),
  state: z.string(),
  creationDate: z.string().optional(),
});
/** Metadata for an EC2 AMI. */
export type EC2Image = z.infer<typeof EC2ImageSchema>;

/** Schema for an EC2 security group. */
export const SecurityGroupSchema = z.object({
  groupId: z.string(),
  groupName: z.string(),
  description: z.string(),
  vpcId: z.string().optional(),
});
/** Metadata for an EC2 security group. */
export type SecurityGroup = z.infer<typeof SecurityGroupSchema>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Get a cached EC2Client for the given region.
 */
function ec2(region?: string): EC2Client {
  return getClient(EC2Client, region);
}

/**
 * Parse tags from the AWS tag list format to a plain Record.
 */
function parseTags(
  tagList?: Array<{ Key?: string; Value?: string }>,
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const tag of tagList ?? []) {
    if (tag.Key !== undefined) {
      result[tag.Key] = tag.Value ?? "";
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// Describe / Get instances
// ---------------------------------------------------------------------------

/**
 * Describe one or more EC2 instances with optional filters, auto-paginating.
 *
 * @param instanceIds - Specific instance IDs to describe. Omit to describe
 *   all instances visible to the caller.
 * @param filters - AWS-style filter list, e.g.
 *   `[{ Name: "instance-state-name", Values: ["running"] }]`.
 * @param region - AWS region override.
 * @returns An array of {@link EC2Instance} objects.
 */
export async function describeInstances(
  instanceIds?: string[],
  filters?: Array<{ Name: string; Values: string[] }>,
  region?: string,
): Promise<EC2Instance[]> {
  const instances: EC2Instance[] = [];
  let nextToken: string | undefined;

  try {
    do {
      const resp = await ec2(region).send(
        new DescribeInstancesCommand({
          InstanceIds:
            instanceIds && instanceIds.length > 0
              ? instanceIds
              : undefined,
          Filters: filters,
          NextToken: nextToken,
        }),
      );

      for (const reservation of resp.Reservations ?? []) {
        for (const inst of reservation.Instances ?? []) {
          instances.push(
            EC2InstanceSchema.parse({
              instanceId: inst.InstanceId ?? "",
              instanceType: inst.InstanceType ?? "",
              state: inst.State?.Name ?? "unknown",
              publicIpAddress: inst.PublicIpAddress ?? undefined,
              privateIpAddress: inst.PrivateIpAddress ?? undefined,
              launchTime: inst.LaunchTime ?? undefined,
              tags: parseTags(inst.Tags),
            }),
          );
        }
      }

      nextToken = resp.NextToken;
    } while (nextToken);
  } catch (err) {
    throw wrapAwsError(err, "describeInstances");
  }

  return instances;
}

/**
 * Fetch a single EC2 instance by ID.
 *
 * @param instanceId - The instance ID to look up.
 * @param region - AWS region override.
 * @returns The {@link EC2Instance}, or `null` if not found.
 */
export async function getInstance(
  instanceId: string,
  region?: string,
): Promise<EC2Instance | null> {
  const results = await describeInstances([instanceId], undefined, region);
  return results.length > 0 ? results[0] : null;
}

/**
 * Find EC2 instances matching a tag key/value pair.
 *
 * @param tagKey - Tag key to filter by.
 * @param tagValue - Tag value to filter by.
 * @param region - AWS region override.
 * @returns An array of matching {@link EC2Instance} objects.
 */
export async function getInstancesByTag(
  tagKey: string,
  tagValue: string,
  region?: string,
): Promise<EC2Instance[]> {
  return describeInstances(
    undefined,
    [{ Name: `tag:${tagKey}`, Values: [tagValue] }],
    region,
  );
}

// ---------------------------------------------------------------------------
// Instance lifecycle
// ---------------------------------------------------------------------------

/**
 * Start one or more stopped EC2 instances.
 *
 * @param instanceIds - IDs of instances to start.
 * @param region - AWS region override.
 */
export async function startInstances(
  instanceIds: string[],
  region?: string,
): Promise<void> {
  try {
    await ec2(region).send(
      new StartInstancesCommand({ InstanceIds: instanceIds }),
    );
  } catch (err) {
    throw wrapAwsError(
      err,
      `startInstances ${instanceIds.join(", ")}`,
    );
  }
}

/**
 * Stop one or more running EC2 instances.
 *
 * @param instanceIds - IDs of instances to stop.
 * @param region - AWS region override.
 */
export async function stopInstances(
  instanceIds: string[],
  region?: string,
): Promise<void> {
  try {
    await ec2(region).send(
      new StopInstancesCommand({ InstanceIds: instanceIds }),
    );
  } catch (err) {
    throw wrapAwsError(
      err,
      `stopInstances ${instanceIds.join(", ")}`,
    );
  }
}

/**
 * Reboot one or more EC2 instances.
 *
 * @param instanceIds - IDs of instances to reboot.
 * @param region - AWS region override.
 */
export async function rebootInstances(
  instanceIds: string[],
  region?: string,
): Promise<void> {
  try {
    await ec2(region).send(
      new RebootInstancesCommand({ InstanceIds: instanceIds }),
    );
  } catch (err) {
    throw wrapAwsError(
      err,
      `rebootInstances ${instanceIds.join(", ")}`,
    );
  }
}

/**
 * Permanently terminate one or more EC2 instances.
 *
 * This is irreversible -- terminated instances cannot be restarted.
 *
 * @param instanceIds - IDs of instances to terminate.
 * @param region - AWS region override.
 */
export async function terminateInstances(
  instanceIds: string[],
  region?: string,
): Promise<void> {
  try {
    await ec2(region).send(
      new TerminateInstancesCommand({ InstanceIds: instanceIds }),
    );
  } catch (err) {
    throw wrapAwsError(
      err,
      `terminateInstances ${instanceIds.join(", ")}`,
    );
  }
}

// ---------------------------------------------------------------------------
// Wait for instance state
// ---------------------------------------------------------------------------

/**
 * Poll until an EC2 instance reaches a target state.
 *
 * @param instanceId - The instance ID to monitor.
 * @param targetState - Desired state: `"running"`, `"stopped"`, or
 *   `"terminated"`.
 * @param timeout - Maximum time to wait in milliseconds (default 300000).
 * @param pollInterval - Pause between polls in milliseconds (default 10000).
 * @param region - AWS region override.
 * @returns The {@link EC2Instance} once it reaches the target state.
 * @throws {AwsTimeoutError} If the instance does not reach the state in time.
 * @throws {AwsServiceError} If the instance is not found.
 */
export async function waitForInstanceState(
  instanceId: string,
  targetState: "running" | "stopped" | "terminated",
  timeout = 300_000,
  pollInterval = 10_000,
  region?: string,
): Promise<EC2Instance> {
  const deadline = Date.now() + timeout;

  while (true) {
    const instance = await getInstance(instanceId, region);
    if (instance === null) {
      throw new AwsServiceError(`Instance ${instanceId} not found`);
    }
    if (instance.state === targetState) {
      return instance;
    }
    if (Date.now() >= deadline) {
      throw new AwsTimeoutError(
        `Instance ${instanceId} did not reach state "${targetState}" ` +
          `within ${timeout}ms (current: "${instance.state}")`,
      );
    }
    await new Promise((resolve) => setTimeout(resolve, pollInterval));
  }
}

// ---------------------------------------------------------------------------
// AMI / Image operations
// ---------------------------------------------------------------------------

/**
 * Create an AMI from a running or stopped EC2 instance.
 *
 * @param instanceId - Source instance ID.
 * @param name - AMI name (must be unique in the account/region).
 * @param description - Optional AMI description.
 * @param noReboot - If `true` (default), the instance is not rebooted before
 *   image creation. The image may be less consistent.
 * @param region - AWS region override.
 * @returns The new AMI ID.
 */
export async function createImage(
  instanceId: string,
  name: string,
  description?: string,
  noReboot = true,
  region?: string,
): Promise<string> {
  try {
    const resp = await ec2(region).send(
      new CreateImageCommand({
        InstanceId: instanceId,
        Name: name,
        Description: description ?? "",
        NoReboot: noReboot,
      }),
    );
    return resp.ImageId ?? "";
  } catch (err) {
    throw wrapAwsError(
      err,
      `createImage from ${instanceId}`,
    );
  }
}

/**
 * Describe AMIs visible to the caller.
 *
 * @param imageIds - Specific AMI IDs to describe.
 * @param owners - Filter by owner, e.g. `["self", "amazon"]`.
 * @param filters - AWS-style filter list.
 * @param region - AWS region override.
 * @returns An array of {@link EC2Image} objects.
 */
export async function describeImages(
  imageIds?: string[],
  owners?: string[],
  filters?: Array<{ Name: string; Values: string[] }>,
  region?: string,
): Promise<EC2Image[]> {
  try {
    const resp = await ec2(region).send(
      new DescribeImagesCommand({
        ImageIds:
          imageIds && imageIds.length > 0 ? imageIds : undefined,
        Owners: owners,
        Filters: filters,
      }),
    );
    return (resp.Images ?? []).map((img) =>
      EC2ImageSchema.parse({
        imageId: img.ImageId ?? "",
        name: img.Name ?? undefined,
        state: img.State ?? "unknown",
        creationDate: img.CreationDate ?? undefined,
      }),
    );
  } catch (err) {
    throw wrapAwsError(err, "describeImages");
  }
}

/**
 * Find the most recently created AMI matching filters and owners.
 *
 * Sorts by `creationDate` descending and returns the newest match.
 *
 * @param owners - Owner filter, e.g. `["self"]` or `["amazon"]`.
 *   Defaults to `["self"]`.
 * @param filters - AWS-style filter list.
 * @param region - AWS region override.
 * @returns The newest {@link EC2Image}, or `null` if no match found.
 */
export async function getLatestAmi(
  owners?: string[],
  filters?: Array<{ Name: string; Values: string[] }>,
  region?: string,
): Promise<EC2Image | null> {
  const images = await describeImages(
    undefined,
    owners ?? ["self"],
    filters,
    region,
  );
  if (images.length === 0) {
    return null;
  }
  const sorted = [...images].sort((a, b) => {
    const aDate = a.creationDate ?? "";
    const bDate = b.creationDate ?? "";
    return bDate.localeCompare(aDate);
  });
  return sorted[0];
}

// ---------------------------------------------------------------------------
// Security groups
// ---------------------------------------------------------------------------

/**
 * Describe EC2 security groups.
 *
 * @param groupIds - Specific security group IDs.
 * @param filters - AWS-style filter list.
 * @param region - AWS region override.
 * @returns An array of {@link SecurityGroup} objects.
 */
export async function describeSecurityGroups(
  groupIds?: string[],
  filters?: Array<{ Name: string; Values: string[] }>,
  region?: string,
): Promise<SecurityGroup[]> {
  try {
    const resp = await ec2(region).send(
      new DescribeSecurityGroupsCommand({
        GroupIds:
          groupIds && groupIds.length > 0 ? groupIds : undefined,
        Filters: filters,
      }),
    );
    return (resp.SecurityGroups ?? []).map((sg) =>
      SecurityGroupSchema.parse({
        groupId: sg.GroupId ?? "",
        groupName: sg.GroupName ?? "",
        description: sg.Description ?? "",
        vpcId: sg.VpcId ?? undefined,
      }),
    );
  } catch (err) {
    throw wrapAwsError(err, "describeSecurityGroups");
  }
}

// ---------------------------------------------------------------------------
// Console output
// ---------------------------------------------------------------------------

/**
 * Retrieve the system console output of an EC2 instance.
 *
 * Useful for diagnosing boot failures. The output may be empty for
 * newer instance types.
 *
 * @param instanceId - The instance ID.
 * @param region - AWS region override.
 * @returns The console output as a decoded string.
 */
export async function getInstanceConsoleOutput(
  instanceId: string,
  region?: string,
): Promise<string> {
  try {
    const resp = await ec2(region).send(
      new GetConsoleOutputCommand({ InstanceId: instanceId }),
    );
    const encoded = resp.Output;
    if (!encoded) {
      return "";
    }
    // The output is already decoded by the SDK v3
    return encoded;
  } catch (err) {
    throw wrapAwsError(
      err,
      `getInstanceConsoleOutput ${instanceId}`,
    );
  }
}

// ---------------------------------------------------------------------------
// Additional types (auto-generated)
// ---------------------------------------------------------------------------

/** Result of accept_address_transfer. */
export type AcceptAddressTransferResult = {
  addressTransfer?: Record<string, unknown>;
};

/** Result of accept_capacity_reservation_billing_ownership. */
export type AcceptCapacityReservationBillingOwnershipResult = {
  returnValue?: boolean | undefined;
};

/** Result of accept_reserved_instances_exchange_quote. */
export type AcceptReservedInstancesExchangeQuoteResult = {
  exchangeId?: string | undefined;
};

/** Result of accept_transit_gateway_multicast_domain_associations. */
export type AcceptTransitGatewayMulticastDomainAssociationsResult = {
  associations?: Record<string, unknown>;
};

/** Result of accept_transit_gateway_peering_attachment. */
export type AcceptTransitGatewayPeeringAttachmentResult = {
  transitGatewayPeeringAttachment?: Record<string, unknown>;
};

/** Result of accept_transit_gateway_vpc_attachment. */
export type AcceptTransitGatewayVpcAttachmentResult = {
  transitGatewayVpcAttachment?: Record<string, unknown>;
};

/** Result of accept_vpc_endpoint_connections. */
export type AcceptVpcEndpointConnectionsResult = {
  unsuccessful?: Record<string, unknown>[];
};

/** Result of accept_vpc_peering_connection. */
export type AcceptVpcPeeringConnectionResult = {
  vpcPeeringConnection?: Record<string, unknown>;
};

/** Result of advertise_byoip_cidr. */
export type AdvertiseByoipCidrResult = {
  byoipCidr?: Record<string, unknown>;
};

/** Result of allocate_address. */
export type AllocateAddressResult = {
  allocationId?: string | undefined;
  publicIpv4Pool?: string | undefined;
  networkBorderGroup?: string | undefined;
  domain?: string | undefined;
  customerOwnedIp?: string | undefined;
  customerOwnedIpv4Pool?: string | undefined;
  carrierIp?: string | undefined;
  publicIp?: string | undefined;
};

/** Result of allocate_hosts. */
export type AllocateHostsResult = {
  hostIds?: string[];
};

/** Result of allocate_ipam_pool_cidr. */
export type AllocateIpamPoolCidrResult = {
  ipamPoolAllocation?: Record<string, unknown>;
};

/** Result of apply_security_groups_to_client_vpn_target_network. */
export type ApplySecurityGroupsToClientVpnTargetNetworkResult = {
  securityGroupIds?: string[];
};

/** Result of assign_ipv6_addresses. */
export type AssignIpv6AddressesResult = {
  assignedIpv6Addresses?: string[];
  assignedIpv6Prefixes?: string[];
  networkInterfaceId?: string | undefined;
};

/** Result of assign_private_ip_addresses. */
export type AssignPrivateIpAddressesResult = {
  networkInterfaceId?: string | undefined;
  assignedPrivateIpAddresses?: Record<string, unknown>[];
  assignedIpv4Prefixes?: Record<string, unknown>[];
};

/** Result of assign_private_nat_gateway_address. */
export type AssignPrivateNatGatewayAddressResult = {
  natGatewayId?: string | undefined;
  natGatewayAddresses?: Record<string, unknown>[];
};

/** Result of associate_address. */
export type AssociateAddressResult = {
  associationId?: string | undefined;
};

/** Result of associate_capacity_reservation_billing_owner. */
export type AssociateCapacityReservationBillingOwnerResult = {
  returnValue?: boolean | undefined;
};

/** Result of associate_client_vpn_target_network. */
export type AssociateClientVpnTargetNetworkResult = {
  associationId?: string | undefined;
  status?: Record<string, unknown>;
};

/** Result of associate_enclave_certificate_iam_role. */
export type AssociateEnclaveCertificateIamRoleResult = {
  certificateS3BucketName?: string | undefined;
  certificateS3ObjectKey?: string | undefined;
  encryptionKmsKeyId?: string | undefined;
};

/** Result of associate_iam_instance_profile. */
export type AssociateIamInstanceProfileResult = {
  iamInstanceProfileAssociation?: Record<string, unknown>;
};

/** Result of associate_instance_event_window. */
export type AssociateInstanceEventWindowResult = {
  instanceEventWindow?: Record<string, unknown>;
};

/** Result of associate_ipam_byoasn. */
export type AssociateIpamByoasnResult = {
  asnAssociation?: Record<string, unknown>;
};

/** Result of associate_ipam_resource_discovery. */
export type AssociateIpamResourceDiscoveryResult = {
  ipamResourceDiscoveryAssociation?: Record<string, unknown>;
};

/** Result of associate_nat_gateway_address. */
export type AssociateNatGatewayAddressResult = {
  natGatewayId?: string | undefined;
  natGatewayAddresses?: Record<string, unknown>[];
};

/** Result of associate_route_server. */
export type AssociateRouteServerResult = {
  routeServerAssociation?: Record<string, unknown>;
};

/** Result of associate_route_table. */
export type AssociateRouteTableResult = {
  associationId?: string | undefined;
  associationState?: Record<string, unknown>;
};

/** Result of associate_security_group_vpc. */
export type AssociateSecurityGroupVpcResult = {
  state?: string | undefined;
};

/** Result of associate_subnet_cidr_block. */
export type AssociateSubnetCidrBlockResult = {
  ipv6CidrBlockAssociation?: Record<string, unknown>;
  subnetId?: string | undefined;
};

/** Result of associate_transit_gateway_multicast_domain. */
export type AssociateTransitGatewayMulticastDomainResult = {
  associations?: Record<string, unknown>;
};

/** Result of associate_transit_gateway_policy_table. */
export type AssociateTransitGatewayPolicyTableResult = {
  association?: Record<string, unknown>;
};

/** Result of associate_transit_gateway_route_table. */
export type AssociateTransitGatewayRouteTableResult = {
  association?: Record<string, unknown>;
};

/** Result of associate_trunk_interface. */
export type AssociateTrunkInterfaceResult = {
  interfaceAssociation?: Record<string, unknown>;
  clientToken?: string | undefined;
};

/** Result of associate_vpc_cidr_block. */
export type AssociateVpcCidrBlockResult = {
  ipv6CidrBlockAssociation?: Record<string, unknown>;
  cidrBlockAssociation?: Record<string, unknown>;
  vpcId?: string | undefined;
};

/** Result of attach_classic_link_vpc. */
export type AttachClassicLinkVpcResult = {
  returnValue?: boolean | undefined;
};

/** Result of attach_network_interface. */
export type AttachNetworkInterfaceResult = {
  attachmentId?: string | undefined;
  networkCardIndex?: number | undefined;
};

/** Result of attach_verified_access_trust_provider. */
export type AttachVerifiedAccessTrustProviderResult = {
  verifiedAccessTrustProvider?: Record<string, unknown>;
  verifiedAccessInstance?: Record<string, unknown>;
};

/** Result of attach_volume. */
export type AttachVolumeResult = {
  deleteOnTermination?: boolean | undefined;
  associatedResource?: string | undefined;
  instanceOwningService?: string | undefined;
  volumeId?: string | undefined;
  instanceId?: string | undefined;
  device?: string | undefined;
  state?: string | undefined;
  attachTime?: string | undefined;
};

/** Result of attach_vpn_gateway. */
export type AttachVpnGatewayResult = {
  vpcAttachment?: Record<string, unknown>;
};

/** Result of authorize_client_vpn_ingress. */
export type AuthorizeClientVpnIngressResult = {
  status?: Record<string, unknown>;
};

/** Result of authorize_security_group_egress. */
export type AuthorizeSecurityGroupEgressResult = {
  returnValue?: boolean | undefined;
  securityGroupRules?: Record<string, unknown>[];
};

/** Result of authorize_security_group_ingress. */
export type AuthorizeSecurityGroupIngressResult = {
  returnValue?: boolean | undefined;
  securityGroupRules?: Record<string, unknown>[];
};

/** Result of bundle_instance. */
export type BundleInstanceResult = {
  bundleTask?: Record<string, unknown>;
};

/** Result of cancel_bundle_task. */
export type CancelBundleTaskResult = {
  bundleTask?: Record<string, unknown>;
};

/** Result of cancel_capacity_reservation. */
export type CancelCapacityReservationResult = {
  returnValue?: boolean | undefined;
};

/** Result of cancel_capacity_reservation_fleets. */
export type CancelCapacityReservationFleetsResult = {
  successfulFleetCancellations?: Record<string, unknown>[];
  failedFleetCancellations?: Record<string, unknown>[];
};

/** Result of cancel_declarative_policies_report. */
export type CancelDeclarativePoliciesReportResult = {
  returnValue?: boolean | undefined;
};

/** Result of cancel_image_launch_permission. */
export type CancelImageLaunchPermissionResult = {
  returnValue?: boolean | undefined;
};

/** Result of cancel_import_task. */
export type CancelImportTaskResult = {
  importTaskId?: string | undefined;
  previousState?: string | undefined;
  state?: string | undefined;
};

/** Result of cancel_reserved_instances_listing. */
export type CancelReservedInstancesListingResult = {
  reservedInstancesListings?: Record<string, unknown>[];
};

/** Result of cancel_spot_fleet_requests. */
export type CancelSpotFleetRequestsResult = {
  successfulFleetRequests?: Record<string, unknown>[];
  unsuccessfulFleetRequests?: Record<string, unknown>[];
};

/** Result of cancel_spot_instance_requests. */
export type CancelSpotInstanceRequestsResult = {
  cancelledSpotInstanceRequests?: Record<string, unknown>[];
};

/** Result of confirm_product_instance. */
export type ConfirmProductInstanceResult = {
  returnValue?: boolean | undefined;
  ownerId?: string | undefined;
};

/** Result of copy_fpga_image. */
export type CopyFpgaImageResult = {
  fpgaImageId?: string | undefined;
};

/** Result of copy_image. */
export type CopyImageResult = {
  imageId?: string | undefined;
};

/** Result of copy_snapshot. */
export type CopySnapshotResult = {
  tags?: Record<string, unknown>[];
  snapshotId?: string | undefined;
};

/** Result of copy_volumes. */
export type CopyVolumesResult = {
  volumes?: Record<string, unknown>[];
};

/** Result of create_capacity_manager_data_export. */
export type CreateCapacityManagerDataExportResult = {
  capacityManagerDataExportId?: string | undefined;
};

/** Result of create_capacity_reservation. */
export type CreateCapacityReservationResult = {
  capacityReservation?: Record<string, unknown>;
};

/** Result of create_capacity_reservation_by_splitting. */
export type CreateCapacityReservationBySplittingResult = {
  sourceCapacityReservation?: Record<string, unknown>;
  destinationCapacityReservation?: Record<string, unknown>;
  instanceCount?: number | undefined;
};

/** Result of create_capacity_reservation_fleet. */
export type CreateCapacityReservationFleetResult = {
  capacityReservationFleetId?: string | undefined;
  state?: string | undefined;
  totalTargetCapacity?: number | undefined;
  totalFulfilledCapacity?: number | undefined;
  instanceMatchCriteria?: string | undefined;
  allocationStrategy?: string | undefined;
  createTime?: string | undefined;
  endDate?: string | undefined;
  tenancy?: string | undefined;
  fleetCapacityReservations?: Record<string, unknown>[];
  tags?: Record<string, unknown>[];
};

/** Result of create_carrier_gateway. */
export type CreateCarrierGatewayResult = {
  carrierGateway?: Record<string, unknown>;
};

/** Result of create_client_vpn_endpoint. */
export type CreateClientVpnEndpointResult = {
  clientVpnEndpointId?: string | undefined;
  status?: Record<string, unknown>;
  dnsName?: string | undefined;
};

/** Result of create_client_vpn_route. */
export type CreateClientVpnRouteResult = {
  status?: Record<string, unknown>;
};

/** Result of create_coip_cidr. */
export type CreateCoipCidrResult = {
  coipCidr?: Record<string, unknown>;
};

/** Result of create_coip_pool. */
export type CreateCoipPoolResult = {
  coipPool?: Record<string, unknown>;
};

/** Result of create_customer_gateway. */
export type CreateCustomerGatewayResult = {
  customerGateway?: Record<string, unknown>;
};

/** Result of create_default_subnet. */
export type CreateDefaultSubnetResult = {
  subnet?: Record<string, unknown>;
};

/** Result of create_default_vpc. */
export type CreateDefaultVpcResult = {
  vpc?: Record<string, unknown>;
};

/** Result of create_delegate_mac_volume_ownership_task. */
export type CreateDelegateMacVolumeOwnershipTaskResult = {
  macModificationTask?: Record<string, unknown>;
};

/** Result of create_dhcp_options. */
export type CreateDhcpOptionsResult = {
  dhcpOptions?: Record<string, unknown>;
};

/** Result of create_egress_only_internet_gateway. */
export type CreateEgressOnlyInternetGatewayResult = {
  clientToken?: string | undefined;
  egressOnlyInternetGateway?: Record<string, unknown>;
};

/** Result of create_fleet. */
export type CreateFleetResult = {
  fleetId?: string | undefined;
  errors?: Record<string, unknown>[];
  instances?: Record<string, unknown>[];
};

/** Result of create_flow_logs. */
export type CreateFlowLogsResult = {
  clientToken?: string | undefined;
  flowLogIds?: string[];
  unsuccessful?: Record<string, unknown>[];
};

/** Result of create_fpga_image. */
export type CreateFpgaImageResult = {
  fpgaImageId?: string | undefined;
  fpgaImageGlobalId?: string | undefined;
};

/** Result of create_image_usage_report. */
export type CreateImageUsageReportResult = {
  reportId?: string | undefined;
};

/** Result of create_instance_connect_endpoint. */
export type CreateInstanceConnectEndpointResult = {
  instanceConnectEndpoint?: Record<string, unknown>;
  clientToken?: string | undefined;
};

/** Result of create_instance_event_window. */
export type CreateInstanceEventWindowResult = {
  instanceEventWindow?: Record<string, unknown>;
};

/** Result of create_instance_export_task. */
export type CreateInstanceExportTaskResult = {
  exportTask?: Record<string, unknown>;
};

/** Result of create_internet_gateway. */
export type CreateInternetGatewayResult = {
  internetGateway?: Record<string, unknown>;
};

/** Result of create_ipam. */
export type CreateIpamResult = {
  ipam?: Record<string, unknown>;
};

/** Result of create_ipam_external_resource_verification_token. */
export type CreateIpamExternalResourceVerificationTokenResult = {
  ipamExternalResourceVerificationToken?: Record<string, unknown>;
};

/** Result of create_ipam_pool. */
export type CreateIpamPoolResult = {
  ipamPool?: Record<string, unknown>;
};

/** Result of create_ipam_prefix_list_resolver. */
export type CreateIpamPrefixListResolverResult = {
  ipamPrefixListResolver?: Record<string, unknown>;
};

/** Result of create_ipam_prefix_list_resolver_target. */
export type CreateIpamPrefixListResolverTargetResult = {
  ipamPrefixListResolverTarget?: Record<string, unknown>;
};

/** Result of create_ipam_resource_discovery. */
export type CreateIpamResourceDiscoveryResult = {
  ipamResourceDiscovery?: Record<string, unknown>;
};

/** Result of create_ipam_scope. */
export type CreateIpamScopeResult = {
  ipamScope?: Record<string, unknown>;
};

/** Result of create_key_pair. */
export type CreateKeyPairResult = {
  keyPairId?: string | undefined;
  tags?: Record<string, unknown>[];
  keyName?: string | undefined;
  keyFingerprint?: string | undefined;
  keyMaterial?: string | undefined;
};

/** Result of create_launch_template. */
export type CreateLaunchTemplateResult = {
  launchTemplate?: Record<string, unknown>;
  warning?: Record<string, unknown>;
};

/** Result of create_launch_template_version. */
export type CreateLaunchTemplateVersionResult = {
  launchTemplateVersion?: Record<string, unknown>;
  warning?: Record<string, unknown>;
};

/** Result of create_local_gateway_route. */
export type CreateLocalGatewayRouteResult = {
  route?: Record<string, unknown>;
};

/** Result of create_local_gateway_route_table. */
export type CreateLocalGatewayRouteTableResult = {
  localGatewayRouteTable?: Record<string, unknown>;
};

/** Result of create_local_gateway_route_table_virtual_interface_group_association. */
export type CreateLocalGatewayRouteTableVirtualInterfaceGroupAssociationResult = {
  localGatewayRouteTableVirtualInterfaceGroupAssociation?: Record<string, unknown>;
};

/** Result of create_local_gateway_route_table_vpc_association. */
export type CreateLocalGatewayRouteTableVpcAssociationResult = {
  localGatewayRouteTableVpcAssociation?: Record<string, unknown>;
};

/** Result of create_local_gateway_virtual_interface. */
export type CreateLocalGatewayVirtualInterfaceResult = {
  localGatewayVirtualInterface?: Record<string, unknown>;
};

/** Result of create_local_gateway_virtual_interface_group. */
export type CreateLocalGatewayVirtualInterfaceGroupResult = {
  localGatewayVirtualInterfaceGroup?: Record<string, unknown>;
};

/** Result of create_mac_system_integrity_protection_modification_task. */
export type CreateMacSystemIntegrityProtectionModificationTaskResult = {
  macModificationTask?: Record<string, unknown>;
};

/** Result of create_managed_prefix_list. */
export type CreateManagedPrefixListResult = {
  prefixList?: Record<string, unknown>;
};

/** Result of create_nat_gateway. */
export type CreateNatGatewayResult = {
  clientToken?: string | undefined;
  natGateway?: Record<string, unknown>;
};

/** Result of create_network_acl. */
export type CreateNetworkAclResult = {
  networkAcl?: Record<string, unknown>;
  clientToken?: string | undefined;
};

/** Result of create_network_insights_access_scope. */
export type CreateNetworkInsightsAccessScopeResult = {
  networkInsightsAccessScope?: Record<string, unknown>;
  networkInsightsAccessScopeContent?: Record<string, unknown>;
};

/** Result of create_network_insights_path. */
export type CreateNetworkInsightsPathResult = {
  networkInsightsPath?: Record<string, unknown>;
};

/** Result of create_network_interface. */
export type CreateNetworkInterfaceResult = {
  networkInterface?: Record<string, unknown>;
  clientToken?: string | undefined;
};

/** Result of create_network_interface_permission. */
export type CreateNetworkInterfacePermissionResult = {
  interfacePermission?: Record<string, unknown>;
};

/** Result of create_placement_group. */
export type CreatePlacementGroupResult = {
  placementGroup?: Record<string, unknown>;
};

/** Result of create_public_ipv4_pool. */
export type CreatePublicIpv4PoolResult = {
  poolId?: string | undefined;
};

/** Result of create_replace_root_volume_task. */
export type CreateReplaceRootVolumeTaskResult = {
  replaceRootVolumeTask?: Record<string, unknown>;
};

/** Result of create_reserved_instances_listing. */
export type CreateReservedInstancesListingResult = {
  reservedInstancesListings?: Record<string, unknown>[];
};

/** Result of create_restore_image_task. */
export type CreateRestoreImageTaskResult = {
  imageId?: string | undefined;
};

/** Result of create_route. */
export type CreateRouteResult = {
  returnValue?: boolean | undefined;
};

/** Result of create_route_server. */
export type CreateRouteServerResult = {
  routeServer?: Record<string, unknown>;
};

/** Result of create_route_server_endpoint. */
export type CreateRouteServerEndpointResult = {
  routeServerEndpoint?: Record<string, unknown>;
};

/** Result of create_route_server_peer. */
export type CreateRouteServerPeerResult = {
  routeServerPeer?: Record<string, unknown>;
};

/** Result of create_route_table. */
export type CreateRouteTableResult = {
  routeTable?: Record<string, unknown>;
  clientToken?: string | undefined;
};

/** Result of create_security_group. */
export type CreateSecurityGroupResult = {
  groupId?: string | undefined;
  tags?: Record<string, unknown>[];
  securityGroupArn?: string | undefined;
};

/** Result of create_snapshot. */
export type CreateSnapshotResult = {
  ownerAlias?: string | undefined;
  outpostArn?: string | undefined;
  tags?: Record<string, unknown>[];
  storageTier?: string | undefined;
  restoreExpiryTime?: string | undefined;
  sseType?: string | undefined;
  availabilityZone?: string | undefined;
  transferType?: string | undefined;
  completionDurationMinutes?: number | undefined;
  completionTime?: string | undefined;
  fullSnapshotSizeInBytes?: number | undefined;
  snapshotId?: string | undefined;
  volumeId?: string | undefined;
  state?: string | undefined;
  stateMessage?: string | undefined;
  startTime?: string | undefined;
  progress?: string | undefined;
  ownerId?: string | undefined;
  description?: string | undefined;
  volumeSize?: number | undefined;
  encrypted?: boolean | undefined;
  kmsKeyId?: string | undefined;
  dataEncryptionKeyId?: string | undefined;
};

/** Result of create_snapshots. */
export type CreateSnapshotsResult = {
  snapshots?: Record<string, unknown>[];
};

/** Result of create_spot_datafeed_subscription. */
export type CreateSpotDatafeedSubscriptionResult = {
  spotDatafeedSubscription?: Record<string, unknown>;
};

/** Result of create_store_image_task. */
export type CreateStoreImageTaskResult = {
  objectKey?: string | undefined;
};

/** Result of create_subnet. */
export type CreateSubnetResult = {
  subnet?: Record<string, unknown>;
};

/** Result of create_subnet_cidr_reservation. */
export type CreateSubnetCidrReservationResult = {
  subnetCidrReservation?: Record<string, unknown>;
};

/** Result of create_traffic_mirror_filter. */
export type CreateTrafficMirrorFilterResult = {
  trafficMirrorFilter?: Record<string, unknown>;
  clientToken?: string | undefined;
};

/** Result of create_traffic_mirror_filter_rule. */
export type CreateTrafficMirrorFilterRuleResult = {
  trafficMirrorFilterRule?: Record<string, unknown>;
  clientToken?: string | undefined;
};

/** Result of create_traffic_mirror_session. */
export type CreateTrafficMirrorSessionResult = {
  trafficMirrorSession?: Record<string, unknown>;
  clientToken?: string | undefined;
};

/** Result of create_traffic_mirror_target. */
export type CreateTrafficMirrorTargetResult = {
  trafficMirrorTarget?: Record<string, unknown>;
  clientToken?: string | undefined;
};

/** Result of create_transit_gateway. */
export type CreateTransitGatewayResult = {
  transitGateway?: Record<string, unknown>;
};

/** Result of create_transit_gateway_connect. */
export type CreateTransitGatewayConnectResult = {
  transitGatewayConnect?: Record<string, unknown>;
};

/** Result of create_transit_gateway_connect_peer. */
export type CreateTransitGatewayConnectPeerResult = {
  transitGatewayConnectPeer?: Record<string, unknown>;
};

/** Result of create_transit_gateway_multicast_domain. */
export type CreateTransitGatewayMulticastDomainResult = {
  transitGatewayMulticastDomain?: Record<string, unknown>;
};

/** Result of create_transit_gateway_peering_attachment. */
export type CreateTransitGatewayPeeringAttachmentResult = {
  transitGatewayPeeringAttachment?: Record<string, unknown>;
};

/** Result of create_transit_gateway_policy_table. */
export type CreateTransitGatewayPolicyTableResult = {
  transitGatewayPolicyTable?: Record<string, unknown>;
};

/** Result of create_transit_gateway_prefix_list_reference. */
export type CreateTransitGatewayPrefixListReferenceResult = {
  transitGatewayPrefixListReference?: Record<string, unknown>;
};

/** Result of create_transit_gateway_route. */
export type CreateTransitGatewayRouteResult = {
  route?: Record<string, unknown>;
};

/** Result of create_transit_gateway_route_table. */
export type CreateTransitGatewayRouteTableResult = {
  transitGatewayRouteTable?: Record<string, unknown>;
};

/** Result of create_transit_gateway_route_table_announcement. */
export type CreateTransitGatewayRouteTableAnnouncementResult = {
  transitGatewayRouteTableAnnouncement?: Record<string, unknown>;
};

/** Result of create_transit_gateway_vpc_attachment. */
export type CreateTransitGatewayVpcAttachmentResult = {
  transitGatewayVpcAttachment?: Record<string, unknown>;
};

/** Result of create_verified_access_endpoint. */
export type CreateVerifiedAccessEndpointResult = {
  verifiedAccessEndpoint?: Record<string, unknown>;
};

/** Result of create_verified_access_group. */
export type CreateVerifiedAccessGroupResult = {
  verifiedAccessGroup?: Record<string, unknown>;
};

/** Result of create_verified_access_instance. */
export type CreateVerifiedAccessInstanceResult = {
  verifiedAccessInstance?: Record<string, unknown>;
};

/** Result of create_verified_access_trust_provider. */
export type CreateVerifiedAccessTrustProviderResult = {
  verifiedAccessTrustProvider?: Record<string, unknown>;
};

/** Result of create_volume. */
export type CreateVolumeResult = {
  availabilityZoneId?: string | undefined;
  outpostArn?: string | undefined;
  sourceVolumeId?: string | undefined;
  iops?: number | undefined;
  tags?: Record<string, unknown>[];
  volumeType?: string | undefined;
  fastRestored?: boolean | undefined;
  multiAttachEnabled?: boolean | undefined;
  throughput?: number | undefined;
  sseType?: string | undefined;
  operator?: Record<string, unknown>;
  volumeInitializationRate?: number | undefined;
  volumeId?: string | undefined;
  size?: number | undefined;
  snapshotId?: string | undefined;
  availabilityZone?: string | undefined;
  state?: string | undefined;
  createTime?: string | undefined;
  attachments?: Record<string, unknown>[];
  encrypted?: boolean | undefined;
  kmsKeyId?: string | undefined;
};

/** Result of create_vpc. */
export type CreateVpcResult = {
  vpc?: Record<string, unknown>;
};

/** Result of create_vpc_block_public_access_exclusion. */
export type CreateVpcBlockPublicAccessExclusionResult = {
  vpcBlockPublicAccessExclusion?: Record<string, unknown>;
};

/** Result of create_vpc_endpoint. */
export type CreateVpcEndpointResult = {
  vpcEndpoint?: Record<string, unknown>;
  clientToken?: string | undefined;
};

/** Result of create_vpc_endpoint_connection_notification. */
export type CreateVpcEndpointConnectionNotificationResult = {
  connectionNotification?: Record<string, unknown>;
  clientToken?: string | undefined;
};

/** Result of create_vpc_endpoint_service_configuration. */
export type CreateVpcEndpointServiceConfigurationResult = {
  serviceConfiguration?: Record<string, unknown>;
  clientToken?: string | undefined;
};

/** Result of create_vpc_peering_connection. */
export type CreateVpcPeeringConnectionResult = {
  vpcPeeringConnection?: Record<string, unknown>;
};

/** Result of create_vpn_connection. */
export type CreateVpnConnectionResult = {
  vpnConnection?: Record<string, unknown>;
};

/** Result of create_vpn_gateway. */
export type CreateVpnGatewayResult = {
  vpnGateway?: Record<string, unknown>;
};

/** Result of delete_capacity_manager_data_export. */
export type DeleteCapacityManagerDataExportResult = {
  capacityManagerDataExportId?: string | undefined;
};

/** Result of delete_carrier_gateway. */
export type DeleteCarrierGatewayResult = {
  carrierGateway?: Record<string, unknown>;
};

/** Result of delete_client_vpn_endpoint. */
export type DeleteClientVpnEndpointResult = {
  status?: Record<string, unknown>;
};

/** Result of delete_client_vpn_route. */
export type DeleteClientVpnRouteResult = {
  status?: Record<string, unknown>;
};

/** Result of delete_coip_cidr. */
export type DeleteCoipCidrResult = {
  coipCidr?: Record<string, unknown>;
};

/** Result of delete_coip_pool. */
export type DeleteCoipPoolResult = {
  coipPool?: Record<string, unknown>;
};

/** Result of delete_egress_only_internet_gateway. */
export type DeleteEgressOnlyInternetGatewayResult = {
  returnCode?: boolean | undefined;
};

/** Result of delete_fleets. */
export type DeleteFleetsResult = {
  successfulFleetDeletions?: Record<string, unknown>[];
  unsuccessfulFleetDeletions?: Record<string, unknown>[];
};

/** Result of delete_flow_logs. */
export type DeleteFlowLogsResult = {
  unsuccessful?: Record<string, unknown>[];
};

/** Result of delete_fpga_image. */
export type DeleteFpgaImageResult = {
  returnValue?: boolean | undefined;
};

/** Result of delete_image_usage_report. */
export type DeleteImageUsageReportResult = {
  returnValue?: boolean | undefined;
};

/** Result of delete_instance_connect_endpoint. */
export type DeleteInstanceConnectEndpointResult = {
  instanceConnectEndpoint?: Record<string, unknown>;
};

/** Result of delete_instance_event_window. */
export type DeleteInstanceEventWindowResult = {
  instanceEventWindowState?: Record<string, unknown>;
};

/** Result of delete_ipam. */
export type DeleteIpamResult = {
  ipam?: Record<string, unknown>;
};

/** Result of delete_ipam_external_resource_verification_token. */
export type DeleteIpamExternalResourceVerificationTokenResult = {
  ipamExternalResourceVerificationToken?: Record<string, unknown>;
};

/** Result of delete_ipam_pool. */
export type DeleteIpamPoolResult = {
  ipamPool?: Record<string, unknown>;
};

/** Result of delete_ipam_prefix_list_resolver. */
export type DeleteIpamPrefixListResolverResult = {
  ipamPrefixListResolver?: Record<string, unknown>;
};

/** Result of delete_ipam_prefix_list_resolver_target. */
export type DeleteIpamPrefixListResolverTargetResult = {
  ipamPrefixListResolverTarget?: Record<string, unknown>;
};

/** Result of delete_ipam_resource_discovery. */
export type DeleteIpamResourceDiscoveryResult = {
  ipamResourceDiscovery?: Record<string, unknown>;
};

/** Result of delete_ipam_scope. */
export type DeleteIpamScopeResult = {
  ipamScope?: Record<string, unknown>;
};

/** Result of delete_key_pair. */
export type DeleteKeyPairResult = {
  returnValue?: boolean | undefined;
  keyPairId?: string | undefined;
};

/** Result of delete_launch_template. */
export type DeleteLaunchTemplateResult = {
  launchTemplate?: Record<string, unknown>;
};

/** Result of delete_launch_template_versions. */
export type DeleteLaunchTemplateVersionsResult = {
  successfullyDeletedLaunchTemplateVersions?: Record<string, unknown>[];
  unsuccessfullyDeletedLaunchTemplateVersions?: Record<string, unknown>[];
};

/** Result of delete_local_gateway_route. */
export type DeleteLocalGatewayRouteResult = {
  route?: Record<string, unknown>;
};

/** Result of delete_local_gateway_route_table. */
export type DeleteLocalGatewayRouteTableResult = {
  localGatewayRouteTable?: Record<string, unknown>;
};

/** Result of delete_local_gateway_route_table_virtual_interface_group_association. */
export type DeleteLocalGatewayRouteTableVirtualInterfaceGroupAssociationResult = {
  localGatewayRouteTableVirtualInterfaceGroupAssociation?: Record<string, unknown>;
};

/** Result of delete_local_gateway_route_table_vpc_association. */
export type DeleteLocalGatewayRouteTableVpcAssociationResult = {
  localGatewayRouteTableVpcAssociation?: Record<string, unknown>;
};

/** Result of delete_local_gateway_virtual_interface. */
export type DeleteLocalGatewayVirtualInterfaceResult = {
  localGatewayVirtualInterface?: Record<string, unknown>;
};

/** Result of delete_local_gateway_virtual_interface_group. */
export type DeleteLocalGatewayVirtualInterfaceGroupResult = {
  localGatewayVirtualInterfaceGroup?: Record<string, unknown>;
};

/** Result of delete_managed_prefix_list. */
export type DeleteManagedPrefixListResult = {
  prefixList?: Record<string, unknown>;
};

/** Result of delete_nat_gateway. */
export type DeleteNatGatewayResult = {
  natGatewayId?: string | undefined;
};

/** Result of delete_network_insights_access_scope. */
export type DeleteNetworkInsightsAccessScopeResult = {
  networkInsightsAccessScopeId?: string | undefined;
};

/** Result of delete_network_insights_access_scope_analysis. */
export type DeleteNetworkInsightsAccessScopeAnalysisResult = {
  networkInsightsAccessScopeAnalysisId?: string | undefined;
};

/** Result of delete_network_insights_analysis. */
export type DeleteNetworkInsightsAnalysisResult = {
  networkInsightsAnalysisId?: string | undefined;
};

/** Result of delete_network_insights_path. */
export type DeleteNetworkInsightsPathResult = {
  networkInsightsPathId?: string | undefined;
};

/** Result of delete_network_interface_permission. */
export type DeleteNetworkInterfacePermissionResult = {
  returnValue?: boolean | undefined;
};

/** Result of delete_public_ipv4_pool. */
export type DeletePublicIpv4PoolResult = {
  returnValue?: boolean | undefined;
};

/** Result of delete_queued_reserved_instances. */
export type DeleteQueuedReservedInstancesResult = {
  successfulQueuedPurchaseDeletions?: Record<string, unknown>[];
  failedQueuedPurchaseDeletions?: Record<string, unknown>[];
};

/** Result of delete_route_server. */
export type DeleteRouteServerResult = {
  routeServer?: Record<string, unknown>;
};

/** Result of delete_route_server_endpoint. */
export type DeleteRouteServerEndpointResult = {
  routeServerEndpoint?: Record<string, unknown>;
};

/** Result of delete_route_server_peer. */
export type DeleteRouteServerPeerResult = {
  routeServerPeer?: Record<string, unknown>;
};

/** Result of delete_security_group. */
export type DeleteSecurityGroupResult = {
  returnValue?: boolean | undefined;
  groupId?: string | undefined;
};

/** Result of delete_subnet_cidr_reservation. */
export type DeleteSubnetCidrReservationResult = {
  deletedSubnetCidrReservation?: Record<string, unknown>;
};

/** Result of delete_traffic_mirror_filter. */
export type DeleteTrafficMirrorFilterResult = {
  trafficMirrorFilterId?: string | undefined;
};

/** Result of delete_traffic_mirror_filter_rule. */
export type DeleteTrafficMirrorFilterRuleResult = {
  trafficMirrorFilterRuleId?: string | undefined;
};

/** Result of delete_traffic_mirror_session. */
export type DeleteTrafficMirrorSessionResult = {
  trafficMirrorSessionId?: string | undefined;
};

/** Result of delete_traffic_mirror_target. */
export type DeleteTrafficMirrorTargetResult = {
  trafficMirrorTargetId?: string | undefined;
};

/** Result of delete_transit_gateway. */
export type DeleteTransitGatewayResult = {
  transitGateway?: Record<string, unknown>;
};

/** Result of delete_transit_gateway_connect. */
export type DeleteTransitGatewayConnectResult = {
  transitGatewayConnect?: Record<string, unknown>;
};

/** Result of delete_transit_gateway_connect_peer. */
export type DeleteTransitGatewayConnectPeerResult = {
  transitGatewayConnectPeer?: Record<string, unknown>;
};

/** Result of delete_transit_gateway_multicast_domain. */
export type DeleteTransitGatewayMulticastDomainResult = {
  transitGatewayMulticastDomain?: Record<string, unknown>;
};

/** Result of delete_transit_gateway_peering_attachment. */
export type DeleteTransitGatewayPeeringAttachmentResult = {
  transitGatewayPeeringAttachment?: Record<string, unknown>;
};

/** Result of delete_transit_gateway_policy_table. */
export type DeleteTransitGatewayPolicyTableResult = {
  transitGatewayPolicyTable?: Record<string, unknown>;
};

/** Result of delete_transit_gateway_prefix_list_reference. */
export type DeleteTransitGatewayPrefixListReferenceResult = {
  transitGatewayPrefixListReference?: Record<string, unknown>;
};

/** Result of delete_transit_gateway_route. */
export type DeleteTransitGatewayRouteResult = {
  route?: Record<string, unknown>;
};

/** Result of delete_transit_gateway_route_table. */
export type DeleteTransitGatewayRouteTableResult = {
  transitGatewayRouteTable?: Record<string, unknown>;
};

/** Result of delete_transit_gateway_route_table_announcement. */
export type DeleteTransitGatewayRouteTableAnnouncementResult = {
  transitGatewayRouteTableAnnouncement?: Record<string, unknown>;
};

/** Result of delete_transit_gateway_vpc_attachment. */
export type DeleteTransitGatewayVpcAttachmentResult = {
  transitGatewayVpcAttachment?: Record<string, unknown>;
};

/** Result of delete_verified_access_endpoint. */
export type DeleteVerifiedAccessEndpointResult = {
  verifiedAccessEndpoint?: Record<string, unknown>;
};

/** Result of delete_verified_access_group. */
export type DeleteVerifiedAccessGroupResult = {
  verifiedAccessGroup?: Record<string, unknown>;
};

/** Result of delete_verified_access_instance. */
export type DeleteVerifiedAccessInstanceResult = {
  verifiedAccessInstance?: Record<string, unknown>;
};

/** Result of delete_verified_access_trust_provider. */
export type DeleteVerifiedAccessTrustProviderResult = {
  verifiedAccessTrustProvider?: Record<string, unknown>;
};

/** Result of delete_vpc_block_public_access_exclusion. */
export type DeleteVpcBlockPublicAccessExclusionResult = {
  vpcBlockPublicAccessExclusion?: Record<string, unknown>;
};

/** Result of delete_vpc_endpoint_connection_notifications. */
export type DeleteVpcEndpointConnectionNotificationsResult = {
  unsuccessful?: Record<string, unknown>[];
};

/** Result of delete_vpc_endpoint_service_configurations. */
export type DeleteVpcEndpointServiceConfigurationsResult = {
  unsuccessful?: Record<string, unknown>[];
};

/** Result of delete_vpc_endpoints. */
export type DeleteVpcEndpointsResult = {
  unsuccessful?: Record<string, unknown>[];
};

/** Result of delete_vpc_peering_connection. */
export type DeleteVpcPeeringConnectionResult = {
  returnValue?: boolean | undefined;
};

/** Result of deprovision_byoip_cidr. */
export type DeprovisionByoipCidrResult = {
  byoipCidr?: Record<string, unknown>;
};

/** Result of deprovision_ipam_byoasn. */
export type DeprovisionIpamByoasnResult = {
  byoasn?: Record<string, unknown>;
};

/** Result of deprovision_ipam_pool_cidr. */
export type DeprovisionIpamPoolCidrResult = {
  ipamPoolCidr?: Record<string, unknown>;
};

/** Result of deprovision_public_ipv4_pool_cidr. */
export type DeprovisionPublicIpv4PoolCidrResult = {
  poolId?: string | undefined;
  deprovisionedAddresses?: string[];
};

/** Result of deregister_image. */
export type DeregisterImageResult = {
  returnValue?: boolean | undefined;
  deleteSnapshotResults?: Record<string, unknown>[];
};

/** Result of deregister_instance_event_notification_attributes. */
export type DeregisterInstanceEventNotificationAttributesResult = {
  instanceTagAttribute?: Record<string, unknown>;
};

/** Result of deregister_transit_gateway_multicast_group_members. */
export type DeregisterTransitGatewayMulticastGroupMembersResult = {
  deregisteredMulticastGroupMembers?: Record<string, unknown>;
};

/** Result of deregister_transit_gateway_multicast_group_sources. */
export type DeregisterTransitGatewayMulticastGroupSourcesResult = {
  deregisteredMulticastGroupSources?: Record<string, unknown>;
};

/** Result of describe_account_attributes. */
export type DescribeAccountAttributesResult = {
  accountAttributes?: Record<string, unknown>[];
};

/** Result of describe_address_transfers. */
export type DescribeAddressTransfersResult = {
  addressTransfers?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_addresses. */
export type DescribeAddressesResult = {
  addresses?: Record<string, unknown>[];
};

/** Result of describe_addresses_attribute. */
export type DescribeAddressesAttributeResult = {
  addresses?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_aggregate_id_format. */
export type DescribeAggregateIdFormatResult = {
  useLongIdsAggregated?: boolean | undefined;
  statuses?: Record<string, unknown>[];
};

/** Result of describe_availability_zones. */
export type DescribeAvailabilityZonesResult = {
  availabilityZones?: Record<string, unknown>[];
};

/** Result of describe_aws_network_performance_metric_subscriptions. */
export type DescribeAwsNetworkPerformanceMetricSubscriptionsResult = {
  nextToken?: string | undefined;
  subscriptions?: Record<string, unknown>[];
};

/** Result of describe_bundle_tasks. */
export type DescribeBundleTasksResult = {
  bundleTasks?: Record<string, unknown>[];
};

/** Result of describe_byoip_cidrs. */
export type DescribeByoipCidrsResult = {
  byoipCidrs?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_capacity_block_extension_history. */
export type DescribeCapacityBlockExtensionHistoryResult = {
  capacityBlockExtensions?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_capacity_block_extension_offerings. */
export type DescribeCapacityBlockExtensionOfferingsResult = {
  capacityBlockExtensionOfferings?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_capacity_block_offerings. */
export type DescribeCapacityBlockOfferingsResult = {
  capacityBlockOfferings?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_capacity_block_status. */
export type DescribeCapacityBlockStatusResult = {
  capacityBlockStatuses?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_capacity_blocks. */
export type DescribeCapacityBlocksResult = {
  capacityBlocks?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_capacity_manager_data_exports. */
export type DescribeCapacityManagerDataExportsResult = {
  capacityManagerDataExports?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_capacity_reservation_billing_requests. */
export type DescribeCapacityReservationBillingRequestsResult = {
  nextToken?: string | undefined;
  capacityReservationBillingRequests?: Record<string, unknown>[];
};

/** Result of describe_capacity_reservation_fleets. */
export type DescribeCapacityReservationFleetsResult = {
  capacityReservationFleets?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_capacity_reservation_topology. */
export type DescribeCapacityReservationTopologyResult = {
  nextToken?: string | undefined;
  capacityReservations?: Record<string, unknown>[];
};

/** Result of describe_capacity_reservations. */
export type DescribeCapacityReservationsResult = {
  nextToken?: string | undefined;
  capacityReservations?: Record<string, unknown>[];
};

/** Result of describe_carrier_gateways. */
export type DescribeCarrierGatewaysResult = {
  carrierGateways?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_classic_link_instances. */
export type DescribeClassicLinkInstancesResult = {
  instances?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_client_vpn_authorization_rules. */
export type DescribeClientVpnAuthorizationRulesResult = {
  authorizationRules?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_client_vpn_connections. */
export type DescribeClientVpnConnectionsResult = {
  connections?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_client_vpn_endpoints. */
export type DescribeClientVpnEndpointsResult = {
  clientVpnEndpoints?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_client_vpn_routes. */
export type DescribeClientVpnRoutesResult = {
  routes?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_client_vpn_target_networks. */
export type DescribeClientVpnTargetNetworksResult = {
  clientVpnTargetNetworks?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_coip_pools. */
export type DescribeCoipPoolsResult = {
  coipPools?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_conversion_tasks. */
export type DescribeConversionTasksResult = {
  conversionTasks?: Record<string, unknown>[];
};

/** Result of describe_customer_gateways. */
export type DescribeCustomerGatewaysResult = {
  customerGateways?: Record<string, unknown>[];
};

/** Result of describe_declarative_policies_reports. */
export type DescribeDeclarativePoliciesReportsResult = {
  nextToken?: string | undefined;
  reports?: Record<string, unknown>[];
};

/** Result of describe_dhcp_options. */
export type DescribeDhcpOptionsResult = {
  nextToken?: string | undefined;
  dhcpOptions?: Record<string, unknown>[];
};

/** Result of describe_egress_only_internet_gateways. */
export type DescribeEgressOnlyInternetGatewaysResult = {
  egressOnlyInternetGateways?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_elastic_gpus. */
export type DescribeElasticGpusResult = {
  elasticGpuSet?: Record<string, unknown>[];
  maxResults?: number | undefined;
  nextToken?: string | undefined;
};

/** Result of describe_export_image_tasks. */
export type DescribeExportImageTasksResult = {
  exportImageTasks?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_export_tasks. */
export type DescribeExportTasksResult = {
  exportTasks?: Record<string, unknown>[];
};

/** Result of describe_fast_launch_images. */
export type DescribeFastLaunchImagesResult = {
  fastLaunchImages?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_fast_snapshot_restores. */
export type DescribeFastSnapshotRestoresResult = {
  fastSnapshotRestores?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_fleet_history. */
export type DescribeFleetHistoryResult = {
  historyRecords?: Record<string, unknown>[];
  lastEvaluatedTime?: string | undefined;
  nextToken?: string | undefined;
  fleetId?: string | undefined;
  startTime?: string | undefined;
};

/** Result of describe_fleet_instances. */
export type DescribeFleetInstancesResult = {
  activeInstances?: Record<string, unknown>[];
  nextToken?: string | undefined;
  fleetId?: string | undefined;
};

/** Result of describe_fleets. */
export type DescribeFleetsResult = {
  nextToken?: string | undefined;
  fleets?: Record<string, unknown>[];
};

/** Result of describe_flow_logs. */
export type DescribeFlowLogsResult = {
  flowLogs?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_fpga_image_attribute. */
export type DescribeFpgaImageAttributeResult = {
  fpgaImageAttribute?: Record<string, unknown>;
};

/** Result of describe_fpga_images. */
export type DescribeFpgaImagesResult = {
  fpgaImages?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_host_reservation_offerings. */
export type DescribeHostReservationOfferingsResult = {
  nextToken?: string | undefined;
  offeringSet?: Record<string, unknown>[];
};

/** Result of describe_host_reservations. */
export type DescribeHostReservationsResult = {
  hostReservationSet?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_hosts. */
export type DescribeHostsResult = {
  hosts?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_iam_instance_profile_associations. */
export type DescribeIamInstanceProfileAssociationsResult = {
  iamInstanceProfileAssociations?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_id_format. */
export type DescribeIdFormatResult = {
  statuses?: Record<string, unknown>[];
};

/** Result of describe_identity_id_format. */
export type DescribeIdentityIdFormatResult = {
  statuses?: Record<string, unknown>[];
};

/** Result of describe_image_attribute. */
export type DescribeImageAttributeResult = {
  description?: Record<string, unknown>;
  kernelId?: Record<string, unknown>;
  ramdiskId?: Record<string, unknown>;
  sriovNetSupport?: Record<string, unknown>;
  bootMode?: Record<string, unknown>;
  tpmSupport?: Record<string, unknown>;
  uefiData?: Record<string, unknown>;
  lastLaunchedTime?: Record<string, unknown>;
  imdsSupport?: Record<string, unknown>;
  deregistrationProtection?: Record<string, unknown>;
  imageId?: string | undefined;
  launchPermissions?: Record<string, unknown>[];
  productCodes?: Record<string, unknown>[];
  blockDeviceMappings?: Record<string, unknown>[];
};

/** Result of describe_image_references. */
export type DescribeImageReferencesResult = {
  nextToken?: string | undefined;
  imageReferences?: Record<string, unknown>[];
};

/** Result of describe_image_usage_report_entries. */
export type DescribeImageUsageReportEntriesResult = {
  nextToken?: string | undefined;
  imageUsageReportEntries?: Record<string, unknown>[];
};

/** Result of describe_image_usage_reports. */
export type DescribeImageUsageReportsResult = {
  nextToken?: string | undefined;
  imageUsageReports?: Record<string, unknown>[];
};

/** Result of describe_import_image_tasks. */
export type DescribeImportImageTasksResult = {
  importImageTasks?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_import_snapshot_tasks. */
export type DescribeImportSnapshotTasksResult = {
  importSnapshotTasks?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_instance_attribute. */
export type DescribeInstanceAttributeResult = {
  blockDeviceMappings?: Record<string, unknown>[];
  disableApiTermination?: Record<string, unknown>;
  enaSupport?: Record<string, unknown>;
  enclaveOptions?: Record<string, unknown>;
  ebsOptimized?: Record<string, unknown>;
  instanceId?: string | undefined;
  instanceInitiatedShutdownBehavior?: Record<string, unknown>;
  instanceType?: Record<string, unknown>;
  kernelId?: Record<string, unknown>;
  productCodes?: Record<string, unknown>[];
  ramdiskId?: Record<string, unknown>;
  rootDeviceName?: Record<string, unknown>;
  sourceDestCheck?: Record<string, unknown>;
  sriovNetSupport?: Record<string, unknown>;
  userData?: Record<string, unknown>;
  disableApiStop?: Record<string, unknown>;
  groups?: Record<string, unknown>[];
};

/** Result of describe_instance_connect_endpoints. */
export type DescribeInstanceConnectEndpointsResult = {
  instanceConnectEndpoints?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_instance_credit_specifications. */
export type DescribeInstanceCreditSpecificationsResult = {
  instanceCreditSpecifications?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_instance_event_notification_attributes. */
export type DescribeInstanceEventNotificationAttributesResult = {
  instanceTagAttribute?: Record<string, unknown>;
};

/** Result of describe_instance_event_windows. */
export type DescribeInstanceEventWindowsResult = {
  instanceEventWindows?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_instance_image_metadata. */
export type DescribeInstanceImageMetadataResult = {
  instanceImageMetadata?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_instance_status. */
export type DescribeInstanceStatusResult = {
  instanceStatuses?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_instance_topology. */
export type DescribeInstanceTopologyResult = {
  instances?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_instance_type_offerings. */
export type DescribeInstanceTypeOfferingsResult = {
  instanceTypeOfferings?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_instance_types. */
export type DescribeInstanceTypesResult = {
  instanceTypes?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_internet_gateways. */
export type DescribeInternetGatewaysResult = {
  internetGateways?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_ipam_byoasn. */
export type DescribeIpamByoasnResult = {
  byoasns?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_ipam_external_resource_verification_tokens. */
export type DescribeIpamExternalResourceVerificationTokensResult = {
  nextToken?: string | undefined;
  ipamExternalResourceVerificationTokens?: Record<string, unknown>[];
};

/** Result of describe_ipam_pools. */
export type DescribeIpamPoolsResult = {
  nextToken?: string | undefined;
  ipamPools?: Record<string, unknown>[];
};

/** Result of describe_ipam_prefix_list_resolver_targets. */
export type DescribeIpamPrefixListResolverTargetsResult = {
  nextToken?: string | undefined;
  ipamPrefixListResolverTargets?: Record<string, unknown>[];
};

/** Result of describe_ipam_prefix_list_resolvers. */
export type DescribeIpamPrefixListResolversResult = {
  nextToken?: string | undefined;
  ipamPrefixListResolvers?: Record<string, unknown>[];
};

/** Result of describe_ipam_resource_discoveries. */
export type DescribeIpamResourceDiscoveriesResult = {
  ipamResourceDiscoveries?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_ipam_resource_discovery_associations. */
export type DescribeIpamResourceDiscoveryAssociationsResult = {
  ipamResourceDiscoveryAssociations?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_ipam_scopes. */
export type DescribeIpamScopesResult = {
  nextToken?: string | undefined;
  ipamScopes?: Record<string, unknown>[];
};

/** Result of describe_ipams. */
export type DescribeIpamsResult = {
  nextToken?: string | undefined;
  ipams?: Record<string, unknown>[];
};

/** Result of describe_ipv6_pools. */
export type DescribeIpv6PoolsResult = {
  ipv6Pools?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_key_pairs. */
export type DescribeKeyPairsResult = {
  keyPairs?: Record<string, unknown>[];
};

/** Result of describe_launch_template_versions. */
export type DescribeLaunchTemplateVersionsResult = {
  launchTemplateVersions?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_launch_templates. */
export type DescribeLaunchTemplatesResult = {
  launchTemplates?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_local_gateway_route_table_virtual_interface_group_associations. */
export type DescribeLocalGatewayRouteTableVirtualInterfaceGroupAssociationsResult = {
  localGatewayRouteTableVirtualInterfaceGroupAssociations?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_local_gateway_route_table_vpc_associations. */
export type DescribeLocalGatewayRouteTableVpcAssociationsResult = {
  localGatewayRouteTableVpcAssociations?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_local_gateway_route_tables. */
export type DescribeLocalGatewayRouteTablesResult = {
  localGatewayRouteTables?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_local_gateway_virtual_interface_groups. */
export type DescribeLocalGatewayVirtualInterfaceGroupsResult = {
  localGatewayVirtualInterfaceGroups?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_local_gateway_virtual_interfaces. */
export type DescribeLocalGatewayVirtualInterfacesResult = {
  localGatewayVirtualInterfaces?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_local_gateways. */
export type DescribeLocalGatewaysResult = {
  localGateways?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_locked_snapshots. */
export type DescribeLockedSnapshotsResult = {
  snapshots?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_mac_hosts. */
export type DescribeMacHostsResult = {
  macHosts?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_mac_modification_tasks. */
export type DescribeMacModificationTasksResult = {
  macModificationTasks?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_managed_prefix_lists. */
export type DescribeManagedPrefixListsResult = {
  nextToken?: string | undefined;
  prefixLists?: Record<string, unknown>[];
};

/** Result of describe_moving_addresses. */
export type DescribeMovingAddressesResult = {
  movingAddressStatuses?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_nat_gateways. */
export type DescribeNatGatewaysResult = {
  natGateways?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_network_acls. */
export type DescribeNetworkAclsResult = {
  networkAcls?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_network_insights_access_scope_analyses. */
export type DescribeNetworkInsightsAccessScopeAnalysesResult = {
  networkInsightsAccessScopeAnalyses?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_network_insights_access_scopes. */
export type DescribeNetworkInsightsAccessScopesResult = {
  networkInsightsAccessScopes?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_network_insights_analyses. */
export type DescribeNetworkInsightsAnalysesResult = {
  networkInsightsAnalyses?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_network_insights_paths. */
export type DescribeNetworkInsightsPathsResult = {
  networkInsightsPaths?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_network_interface_attribute. */
export type DescribeNetworkInterfaceAttributeResult = {
  attachment?: Record<string, unknown>;
  description?: Record<string, unknown>;
  groups?: Record<string, unknown>[];
  networkInterfaceId?: string | undefined;
  sourceDestCheck?: Record<string, unknown>;
  associatePublicIpAddress?: boolean | undefined;
};

/** Result of describe_network_interface_permissions. */
export type DescribeNetworkInterfacePermissionsResult = {
  networkInterfacePermissions?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_network_interfaces. */
export type DescribeNetworkInterfacesResult = {
  networkInterfaces?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_outpost_lags. */
export type DescribeOutpostLagsResult = {
  outpostLags?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_placement_groups. */
export type DescribePlacementGroupsResult = {
  placementGroups?: Record<string, unknown>[];
};

/** Result of describe_prefix_lists. */
export type DescribePrefixListsResult = {
  nextToken?: string | undefined;
  prefixLists?: Record<string, unknown>[];
};

/** Result of describe_principal_id_format. */
export type DescribePrincipalIdFormatResult = {
  principals?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_public_ipv4_pools. */
export type DescribePublicIpv4PoolsResult = {
  publicIpv4Pools?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_regions. */
export type DescribeRegionsResult = {
  regions?: Record<string, unknown>[];
};

/** Result of describe_replace_root_volume_tasks. */
export type DescribeReplaceRootVolumeTasksResult = {
  replaceRootVolumeTasks?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_reserved_instances. */
export type DescribeReservedInstancesResult = {
  reservedInstances?: Record<string, unknown>[];
};

/** Result of describe_reserved_instances_listings. */
export type DescribeReservedInstancesListingsResult = {
  reservedInstancesListings?: Record<string, unknown>[];
};

/** Result of describe_reserved_instances_modifications. */
export type DescribeReservedInstancesModificationsResult = {
  nextToken?: string | undefined;
  reservedInstancesModifications?: Record<string, unknown>[];
};

/** Result of describe_reserved_instances_offerings. */
export type DescribeReservedInstancesOfferingsResult = {
  nextToken?: string | undefined;
  reservedInstancesOfferings?: Record<string, unknown>[];
};

/** Result of describe_route_server_endpoints. */
export type DescribeRouteServerEndpointsResult = {
  routeServerEndpoints?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_route_server_peers. */
export type DescribeRouteServerPeersResult = {
  routeServerPeers?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_route_servers. */
export type DescribeRouteServersResult = {
  routeServers?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_route_tables. */
export type DescribeRouteTablesResult = {
  routeTables?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_scheduled_instance_availability. */
export type DescribeScheduledInstanceAvailabilityResult = {
  nextToken?: string | undefined;
  scheduledInstanceAvailabilitySet?: Record<string, unknown>[];
};

/** Result of describe_scheduled_instances. */
export type DescribeScheduledInstancesResult = {
  nextToken?: string | undefined;
  scheduledInstanceSet?: Record<string, unknown>[];
};

/** Result of describe_security_group_references. */
export type DescribeSecurityGroupReferencesResult = {
  securityGroupReferenceSet?: Record<string, unknown>[];
};

/** Result of describe_security_group_rules. */
export type DescribeSecurityGroupRulesResult = {
  securityGroupRules?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_security_group_vpc_associations. */
export type DescribeSecurityGroupVpcAssociationsResult = {
  securityGroupVpcAssociations?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_service_link_virtual_interfaces. */
export type DescribeServiceLinkVirtualInterfacesResult = {
  serviceLinkVirtualInterfaces?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_snapshot_attribute. */
export type DescribeSnapshotAttributeResult = {
  productCodes?: Record<string, unknown>[];
  snapshotId?: string | undefined;
  createVolumePermissions?: Record<string, unknown>[];
};

/** Result of describe_snapshot_tier_status. */
export type DescribeSnapshotTierStatusResult = {
  snapshotTierStatuses?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_snapshots. */
export type DescribeSnapshotsResult = {
  nextToken?: string | undefined;
  snapshots?: Record<string, unknown>[];
};

/** Result of describe_spot_datafeed_subscription. */
export type DescribeSpotDatafeedSubscriptionResult = {
  spotDatafeedSubscription?: Record<string, unknown>;
};

/** Result of describe_spot_fleet_instances. */
export type DescribeSpotFleetInstancesResult = {
  activeInstances?: Record<string, unknown>[];
  nextToken?: string | undefined;
  spotFleetRequestId?: string | undefined;
};

/** Result of describe_spot_fleet_request_history. */
export type DescribeSpotFleetRequestHistoryResult = {
  historyRecords?: Record<string, unknown>[];
  lastEvaluatedTime?: string | undefined;
  nextToken?: string | undefined;
  spotFleetRequestId?: string | undefined;
  startTime?: string | undefined;
};

/** Result of describe_spot_fleet_requests. */
export type DescribeSpotFleetRequestsResult = {
  nextToken?: string | undefined;
  spotFleetRequestConfigs?: Record<string, unknown>[];
};

/** Result of describe_spot_instance_requests. */
export type DescribeSpotInstanceRequestsResult = {
  spotInstanceRequests?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_spot_price_history. */
export type DescribeSpotPriceHistoryResult = {
  nextToken?: string | undefined;
  spotPriceHistory?: Record<string, unknown>[];
};

/** Result of describe_stale_security_groups. */
export type DescribeStaleSecurityGroupsResult = {
  nextToken?: string | undefined;
  staleSecurityGroupSet?: Record<string, unknown>[];
};

/** Result of describe_store_image_tasks. */
export type DescribeStoreImageTasksResult = {
  storeImageTaskResults?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_subnets. */
export type DescribeSubnetsResult = {
  nextToken?: string | undefined;
  subnets?: Record<string, unknown>[];
};

/** Result of describe_tags. */
export type DescribeTagsResult = {
  nextToken?: string | undefined;
  tags?: Record<string, unknown>[];
};

/** Result of describe_traffic_mirror_filter_rules. */
export type DescribeTrafficMirrorFilterRulesResult = {
  trafficMirrorFilterRules?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_traffic_mirror_filters. */
export type DescribeTrafficMirrorFiltersResult = {
  trafficMirrorFilters?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_traffic_mirror_sessions. */
export type DescribeTrafficMirrorSessionsResult = {
  trafficMirrorSessions?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_traffic_mirror_targets. */
export type DescribeTrafficMirrorTargetsResult = {
  trafficMirrorTargets?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_transit_gateway_attachments. */
export type DescribeTransitGatewayAttachmentsResult = {
  transitGatewayAttachments?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_transit_gateway_connect_peers. */
export type DescribeTransitGatewayConnectPeersResult = {
  transitGatewayConnectPeers?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_transit_gateway_connects. */
export type DescribeTransitGatewayConnectsResult = {
  transitGatewayConnects?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_transit_gateway_multicast_domains. */
export type DescribeTransitGatewayMulticastDomainsResult = {
  transitGatewayMulticastDomains?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_transit_gateway_peering_attachments. */
export type DescribeTransitGatewayPeeringAttachmentsResult = {
  transitGatewayPeeringAttachments?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_transit_gateway_policy_tables. */
export type DescribeTransitGatewayPolicyTablesResult = {
  transitGatewayPolicyTables?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_transit_gateway_route_table_announcements. */
export type DescribeTransitGatewayRouteTableAnnouncementsResult = {
  transitGatewayRouteTableAnnouncements?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_transit_gateway_route_tables. */
export type DescribeTransitGatewayRouteTablesResult = {
  transitGatewayRouteTables?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_transit_gateway_vpc_attachments. */
export type DescribeTransitGatewayVpcAttachmentsResult = {
  transitGatewayVpcAttachments?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_transit_gateways. */
export type DescribeTransitGatewaysResult = {
  transitGateways?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_trunk_interface_associations. */
export type DescribeTrunkInterfaceAssociationsResult = {
  interfaceAssociations?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_verified_access_endpoints. */
export type DescribeVerifiedAccessEndpointsResult = {
  verifiedAccessEndpoints?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_verified_access_groups. */
export type DescribeVerifiedAccessGroupsResult = {
  verifiedAccessGroups?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_verified_access_instance_logging_configurations. */
export type DescribeVerifiedAccessInstanceLoggingConfigurationsResult = {
  loggingConfigurations?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_verified_access_instances. */
export type DescribeVerifiedAccessInstancesResult = {
  verifiedAccessInstances?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_verified_access_trust_providers. */
export type DescribeVerifiedAccessTrustProvidersResult = {
  verifiedAccessTrustProviders?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_volume_attribute. */
export type DescribeVolumeAttributeResult = {
  autoEnableIo?: Record<string, unknown>;
  productCodes?: Record<string, unknown>[];
  volumeId?: string | undefined;
};

/** Result of describe_volume_status. */
export type DescribeVolumeStatusResult = {
  nextToken?: string | undefined;
  volumeStatuses?: Record<string, unknown>[];
};

/** Result of describe_volumes. */
export type DescribeVolumesResult = {
  nextToken?: string | undefined;
  volumes?: Record<string, unknown>[];
};

/** Result of describe_volumes_modifications. */
export type DescribeVolumesModificationsResult = {
  nextToken?: string | undefined;
  volumesModifications?: Record<string, unknown>[];
};

/** Result of describe_vpc_attribute. */
export type DescribeVpcAttributeResult = {
  enableDnsHostnames?: Record<string, unknown>;
  enableDnsSupport?: Record<string, unknown>;
  enableNetworkAddressUsageMetrics?: Record<string, unknown>;
  vpcId?: string | undefined;
};

/** Result of describe_vpc_block_public_access_exclusions. */
export type DescribeVpcBlockPublicAccessExclusionsResult = {
  vpcBlockPublicAccessExclusions?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_vpc_block_public_access_options. */
export type DescribeVpcBlockPublicAccessOptionsResult = {
  vpcBlockPublicAccessOptions?: Record<string, unknown>;
};

/** Result of describe_vpc_classic_link. */
export type DescribeVpcClassicLinkResult = {
  vpcs?: Record<string, unknown>[];
};

/** Result of describe_vpc_classic_link_dns_support. */
export type DescribeVpcClassicLinkDnsSupportResult = {
  nextToken?: string | undefined;
  vpcs?: Record<string, unknown>[];
};

/** Result of describe_vpc_endpoint_associations. */
export type DescribeVpcEndpointAssociationsResult = {
  vpcEndpointAssociations?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_vpc_endpoint_connection_notifications. */
export type DescribeVpcEndpointConnectionNotificationsResult = {
  connectionNotificationSet?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_vpc_endpoint_connections. */
export type DescribeVpcEndpointConnectionsResult = {
  vpcEndpointConnections?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_vpc_endpoint_service_configurations. */
export type DescribeVpcEndpointServiceConfigurationsResult = {
  serviceConfigurations?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_vpc_endpoint_service_permissions. */
export type DescribeVpcEndpointServicePermissionsResult = {
  allowedPrincipals?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_vpc_endpoint_services. */
export type DescribeVpcEndpointServicesResult = {
  serviceNames?: string[];
  serviceDetails?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_vpc_endpoints. */
export type DescribeVpcEndpointsResult = {
  vpcEndpoints?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_vpc_peering_connections. */
export type DescribeVpcPeeringConnectionsResult = {
  vpcPeeringConnections?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_vpcs. */
export type DescribeVpcsResult = {
  nextToken?: string | undefined;
  vpcs?: Record<string, unknown>[];
};

/** Result of describe_vpn_connections. */
export type DescribeVpnConnectionsResult = {
  vpnConnections?: Record<string, unknown>[];
};

/** Result of describe_vpn_gateways. */
export type DescribeVpnGatewaysResult = {
  vpnGateways?: Record<string, unknown>[];
};

/** Result of detach_classic_link_vpc. */
export type DetachClassicLinkVpcResult = {
  returnValue?: boolean | undefined;
};

/** Result of detach_verified_access_trust_provider. */
export type DetachVerifiedAccessTrustProviderResult = {
  verifiedAccessTrustProvider?: Record<string, unknown>;
  verifiedAccessInstance?: Record<string, unknown>;
};

/** Result of detach_volume. */
export type DetachVolumeResult = {
  deleteOnTermination?: boolean | undefined;
  associatedResource?: string | undefined;
  instanceOwningService?: string | undefined;
  volumeId?: string | undefined;
  instanceId?: string | undefined;
  device?: string | undefined;
  state?: string | undefined;
  attachTime?: string | undefined;
};

/** Result of disable_address_transfer. */
export type DisableAddressTransferResult = {
  addressTransfer?: Record<string, unknown>;
};

/** Result of disable_allowed_images_settings. */
export type DisableAllowedImagesSettingsResult = {
  allowedImagesSettingsState?: string | undefined;
};

/** Result of disable_aws_network_performance_metric_subscription. */
export type DisableAwsNetworkPerformanceMetricSubscriptionResult = {
  output?: boolean | undefined;
};

/** Result of disable_capacity_manager. */
export type DisableCapacityManagerResult = {
  capacityManagerStatus?: string | undefined;
  organizationsAccess?: boolean | undefined;
};

/** Result of disable_ebs_encryption_by_default. */
export type DisableEbsEncryptionByDefaultResult = {
  ebsEncryptionByDefault?: boolean | undefined;
};

/** Result of disable_fast_launch. */
export type DisableFastLaunchResult = {
  imageId?: string | undefined;
  resourceType?: string | undefined;
  snapshotConfiguration?: Record<string, unknown>;
  launchTemplate?: Record<string, unknown>;
  maxParallelLaunches?: number | undefined;
  ownerId?: string | undefined;
  state?: string | undefined;
  stateTransitionReason?: string | undefined;
  stateTransitionTime?: string | undefined;
};

/** Result of disable_fast_snapshot_restores. */
export type DisableFastSnapshotRestoresResult = {
  successful?: Record<string, unknown>[];
  unsuccessful?: Record<string, unknown>[];
};

/** Result of disable_image. */
export type DisableImageResult = {
  returnValue?: boolean | undefined;
};

/** Result of disable_image_block_public_access. */
export type DisableImageBlockPublicAccessResult = {
  imageBlockPublicAccessState?: string | undefined;
};

/** Result of disable_image_deprecation. */
export type DisableImageDeprecationResult = {
  returnValue?: boolean | undefined;
};

/** Result of disable_image_deregistration_protection. */
export type DisableImageDeregistrationProtectionResult = {
  returnValue?: string | undefined;
};

/** Result of disable_ipam_organization_admin_account. */
export type DisableIpamOrganizationAdminAccountResult = {
  success?: boolean | undefined;
};

/** Result of disable_route_server_propagation. */
export type DisableRouteServerPropagationResult = {
  routeServerPropagation?: Record<string, unknown>;
};

/** Result of disable_serial_console_access. */
export type DisableSerialConsoleAccessResult = {
  serialConsoleAccessEnabled?: boolean | undefined;
};

/** Result of disable_snapshot_block_public_access. */
export type DisableSnapshotBlockPublicAccessResult = {
  state?: string | undefined;
};

/** Result of disable_transit_gateway_route_table_propagation. */
export type DisableTransitGatewayRouteTablePropagationResult = {
  propagation?: Record<string, unknown>;
};

/** Result of disable_vpc_classic_link. */
export type DisableVpcClassicLinkResult = {
  returnValue?: boolean | undefined;
};

/** Result of disable_vpc_classic_link_dns_support. */
export type DisableVpcClassicLinkDnsSupportResult = {
  returnValue?: boolean | undefined;
};

/** Result of disassociate_capacity_reservation_billing_owner. */
export type DisassociateCapacityReservationBillingOwnerResult = {
  returnValue?: boolean | undefined;
};

/** Result of disassociate_client_vpn_target_network. */
export type DisassociateClientVpnTargetNetworkResult = {
  associationId?: string | undefined;
  status?: Record<string, unknown>;
};

/** Result of disassociate_enclave_certificate_iam_role. */
export type DisassociateEnclaveCertificateIamRoleResult = {
  returnValue?: boolean | undefined;
};

/** Result of disassociate_iam_instance_profile. */
export type DisassociateIamInstanceProfileResult = {
  iamInstanceProfileAssociation?: Record<string, unknown>;
};

/** Result of disassociate_instance_event_window. */
export type DisassociateInstanceEventWindowResult = {
  instanceEventWindow?: Record<string, unknown>;
};

/** Result of disassociate_ipam_byoasn. */
export type DisassociateIpamByoasnResult = {
  asnAssociation?: Record<string, unknown>;
};

/** Result of disassociate_ipam_resource_discovery. */
export type DisassociateIpamResourceDiscoveryResult = {
  ipamResourceDiscoveryAssociation?: Record<string, unknown>;
};

/** Result of disassociate_nat_gateway_address. */
export type DisassociateNatGatewayAddressResult = {
  natGatewayId?: string | undefined;
  natGatewayAddresses?: Record<string, unknown>[];
};

/** Result of disassociate_route_server. */
export type DisassociateRouteServerResult = {
  routeServerAssociation?: Record<string, unknown>;
};

/** Result of disassociate_security_group_vpc. */
export type DisassociateSecurityGroupVpcResult = {
  state?: string | undefined;
};

/** Result of disassociate_subnet_cidr_block. */
export type DisassociateSubnetCidrBlockResult = {
  ipv6CidrBlockAssociation?: Record<string, unknown>;
  subnetId?: string | undefined;
};

/** Result of disassociate_transit_gateway_multicast_domain. */
export type DisassociateTransitGatewayMulticastDomainResult = {
  associations?: Record<string, unknown>;
};

/** Result of disassociate_transit_gateway_policy_table. */
export type DisassociateTransitGatewayPolicyTableResult = {
  association?: Record<string, unknown>;
};

/** Result of disassociate_transit_gateway_route_table. */
export type DisassociateTransitGatewayRouteTableResult = {
  association?: Record<string, unknown>;
};

/** Result of disassociate_trunk_interface. */
export type DisassociateTrunkInterfaceResult = {
  returnValue?: boolean | undefined;
  clientToken?: string | undefined;
};

/** Result of disassociate_vpc_cidr_block. */
export type DisassociateVpcCidrBlockResult = {
  ipv6CidrBlockAssociation?: Record<string, unknown>;
  cidrBlockAssociation?: Record<string, unknown>;
  vpcId?: string | undefined;
};

/** Result of enable_address_transfer. */
export type EnableAddressTransferResult = {
  addressTransfer?: Record<string, unknown>;
};

/** Result of enable_allowed_images_settings. */
export type EnableAllowedImagesSettingsResult = {
  allowedImagesSettingsState?: string | undefined;
};

/** Result of enable_aws_network_performance_metric_subscription. */
export type EnableAwsNetworkPerformanceMetricSubscriptionResult = {
  output?: boolean | undefined;
};

/** Result of enable_capacity_manager. */
export type EnableCapacityManagerResult = {
  capacityManagerStatus?: string | undefined;
  organizationsAccess?: boolean | undefined;
};

/** Result of enable_ebs_encryption_by_default. */
export type EnableEbsEncryptionByDefaultResult = {
  ebsEncryptionByDefault?: boolean | undefined;
};

/** Result of enable_fast_launch. */
export type EnableFastLaunchResult = {
  imageId?: string | undefined;
  resourceType?: string | undefined;
  snapshotConfiguration?: Record<string, unknown>;
  launchTemplate?: Record<string, unknown>;
  maxParallelLaunches?: number | undefined;
  ownerId?: string | undefined;
  state?: string | undefined;
  stateTransitionReason?: string | undefined;
  stateTransitionTime?: string | undefined;
};

/** Result of enable_fast_snapshot_restores. */
export type EnableFastSnapshotRestoresResult = {
  successful?: Record<string, unknown>[];
  unsuccessful?: Record<string, unknown>[];
};

/** Result of enable_image. */
export type EnableImageResult = {
  returnValue?: boolean | undefined;
};

/** Result of enable_image_block_public_access. */
export type EnableImageBlockPublicAccessResult = {
  imageBlockPublicAccessState?: string | undefined;
};

/** Result of enable_image_deprecation. */
export type EnableImageDeprecationResult = {
  returnValue?: boolean | undefined;
};

/** Result of enable_image_deregistration_protection. */
export type EnableImageDeregistrationProtectionResult = {
  returnValue?: string | undefined;
};

/** Result of enable_ipam_organization_admin_account. */
export type EnableIpamOrganizationAdminAccountResult = {
  success?: boolean | undefined;
};

/** Result of enable_reachability_analyzer_organization_sharing. */
export type EnableReachabilityAnalyzerOrganizationSharingResult = {
  returnValue?: boolean | undefined;
};

/** Result of enable_route_server_propagation. */
export type EnableRouteServerPropagationResult = {
  routeServerPropagation?: Record<string, unknown>;
};

/** Result of enable_serial_console_access. */
export type EnableSerialConsoleAccessResult = {
  serialConsoleAccessEnabled?: boolean | undefined;
};

/** Result of enable_snapshot_block_public_access. */
export type EnableSnapshotBlockPublicAccessResult = {
  state?: string | undefined;
};

/** Result of enable_transit_gateway_route_table_propagation. */
export type EnableTransitGatewayRouteTablePropagationResult = {
  propagation?: Record<string, unknown>;
};

/** Result of enable_vpc_classic_link. */
export type EnableVpcClassicLinkResult = {
  returnValue?: boolean | undefined;
};

/** Result of enable_vpc_classic_link_dns_support. */
export type EnableVpcClassicLinkDnsSupportResult = {
  returnValue?: boolean | undefined;
};

/** Result of export_client_vpn_client_certificate_revocation_list. */
export type ExportClientVpnClientCertificateRevocationListResult = {
  certificateRevocationList?: string | undefined;
  status?: Record<string, unknown>;
};

/** Result of export_client_vpn_client_configuration. */
export type ExportClientVpnClientConfigurationResult = {
  clientConfiguration?: string | undefined;
};

/** Result of export_image. */
export type ExportImageResult = {
  description?: string | undefined;
  diskImageFormat?: string | undefined;
  exportImageTaskId?: string | undefined;
  imageId?: string | undefined;
  roleName?: string | undefined;
  progress?: string | undefined;
  s3ExportLocation?: Record<string, unknown>;
  status?: string | undefined;
  statusMessage?: string | undefined;
  tags?: Record<string, unknown>[];
};

/** Result of export_transit_gateway_routes. */
export type ExportTransitGatewayRoutesResult = {
  s3Location?: string | undefined;
};

/** Result of export_verified_access_instance_client_configuration. */
export type ExportVerifiedAccessInstanceClientConfigurationResult = {
  version?: string | undefined;
  verifiedAccessInstanceId?: string | undefined;
  region?: string | undefined;
  deviceTrustProviders?: string[];
  userTrustProvider?: Record<string, unknown>;
  openVpnConfigurations?: Record<string, unknown>[];
};

/** Result of get_active_vpn_tunnel_status. */
export type GetActiveVpnTunnelStatusResult = {
  activeVpnTunnelStatus?: Record<string, unknown>;
};

/** Result of get_allowed_images_settings. */
export type GetAllowedImagesSettingsResult = {
  state?: string | undefined;
  imageCriteria?: Record<string, unknown>[];
  managedBy?: string | undefined;
};

/** Result of get_associated_enclave_certificate_iam_roles. */
export type GetAssociatedEnclaveCertificateIamRolesResult = {
  associatedRoles?: Record<string, unknown>[];
};

/** Result of get_associated_ipv6_pool_cidrs. */
export type GetAssociatedIpv6PoolCidrsResult = {
  ipv6CidrAssociations?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of get_aws_network_performance_data. */
export type GetAwsNetworkPerformanceDataResult = {
  dataResponses?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of get_capacity_manager_attributes. */
export type GetCapacityManagerAttributesResult = {
  capacityManagerStatus?: string | undefined;
  organizationsAccess?: boolean | undefined;
  dataExportCount?: number | undefined;
  ingestionStatus?: string | undefined;
  ingestionStatusMessage?: string | undefined;
  earliestDatapointTimestamp?: string | undefined;
  latestDatapointTimestamp?: string | undefined;
};

/** Result of get_capacity_manager_metric_data. */
export type GetCapacityManagerMetricDataResult = {
  metricDataResults?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of get_capacity_manager_metric_dimensions. */
export type GetCapacityManagerMetricDimensionsResult = {
  metricDimensionResults?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of get_capacity_reservation_usage. */
export type GetCapacityReservationUsageResult = {
  nextToken?: string | undefined;
  capacityReservationId?: string | undefined;
  instanceType?: string | undefined;
  totalInstanceCount?: number | undefined;
  availableInstanceCount?: number | undefined;
  state?: string | undefined;
  instanceUsages?: Record<string, unknown>[];
};

/** Result of get_coip_pool_usage. */
export type GetCoipPoolUsageResult = {
  coipPoolId?: string | undefined;
  coipAddressUsages?: Record<string, unknown>[];
  localGatewayRouteTableId?: string | undefined;
  nextToken?: string | undefined;
};

/** Result of get_console_output. */
export type GetConsoleOutputResult = {
  instanceId?: string | undefined;
  timestamp?: string | undefined;
  output?: string | undefined;
};

/** Result of get_console_screenshot. */
export type GetConsoleScreenshotResult = {
  imageData?: string | undefined;
  instanceId?: string | undefined;
};

/** Result of get_declarative_policies_report_summary. */
export type GetDeclarativePoliciesReportSummaryResult = {
  reportId?: string | undefined;
  s3Bucket?: string | undefined;
  s3Prefix?: string | undefined;
  targetId?: string | undefined;
  startTime?: string | undefined;
  endTime?: string | undefined;
  numberOfAccounts?: number | undefined;
  numberOfFailedAccounts?: number | undefined;
  attributeSummaries?: Record<string, unknown>[];
};

/** Result of get_default_credit_specification. */
export type GetDefaultCreditSpecificationResult = {
  instanceFamilyCreditSpecification?: Record<string, unknown>;
};

/** Result of get_ebs_default_kms_key_id. */
export type GetEbsDefaultKmsKeyIdResult = {
  kmsKeyId?: string | undefined;
};

/** Result of get_ebs_encryption_by_default. */
export type GetEbsEncryptionByDefaultResult = {
  ebsEncryptionByDefault?: boolean | undefined;
  sseType?: string | undefined;
};

/** Result of get_flow_logs_integration_template. */
export type GetFlowLogsIntegrationTemplateResult = {
  result?: string | undefined;
};

/** Result of get_groups_for_capacity_reservation. */
export type GetGroupsForCapacityReservationResult = {
  nextToken?: string | undefined;
  capacityReservationGroups?: Record<string, unknown>[];
};

/** Result of get_host_reservation_purchase_preview. */
export type GetHostReservationPurchasePreviewResult = {
  currencyCode?: string | undefined;
  purchase?: Record<string, unknown>[];
  totalHourlyPrice?: string | undefined;
  totalUpfrontPrice?: string | undefined;
};

/** Result of get_image_ancestry. */
export type GetImageAncestryResult = {
  imageAncestryEntries?: Record<string, unknown>[];
};

/** Result of get_image_block_public_access_state. */
export type GetImageBlockPublicAccessStateResult = {
  imageBlockPublicAccessState?: string | undefined;
  managedBy?: string | undefined;
};

/** Result of get_instance_metadata_defaults. */
export type GetInstanceMetadataDefaultsResult = {
  accountLevel?: Record<string, unknown>;
};

/** Result of get_instance_tpm_ek_pub. */
export type GetInstanceTpmEkPubResult = {
  instanceId?: string | undefined;
  keyType?: string | undefined;
  keyFormat?: string | undefined;
  keyValue?: string | undefined;
};

/** Result of get_instance_types_from_instance_requirements. */
export type GetInstanceTypesFromInstanceRequirementsResult = {
  instanceTypes?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of get_instance_uefi_data. */
export type GetInstanceUefiDataResult = {
  instanceId?: string | undefined;
  uefiData?: string | undefined;
};

/** Result of get_ipam_address_history. */
export type GetIpamAddressHistoryResult = {
  historyRecords?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of get_ipam_discovered_accounts. */
export type GetIpamDiscoveredAccountsResult = {
  ipamDiscoveredAccounts?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of get_ipam_discovered_public_addresses. */
export type GetIpamDiscoveredPublicAddressesResult = {
  ipamDiscoveredPublicAddresses?: Record<string, unknown>[];
  oldestSampleTime?: string | undefined;
  nextToken?: string | undefined;
};

/** Result of get_ipam_discovered_resource_cidrs. */
export type GetIpamDiscoveredResourceCidrsResult = {
  ipamDiscoveredResourceCidrs?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of get_ipam_pool_allocations. */
export type GetIpamPoolAllocationsResult = {
  ipamPoolAllocations?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of get_ipam_pool_cidrs. */
export type GetIpamPoolCidrsResult = {
  ipamPoolCidrs?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of get_ipam_prefix_list_resolver_rules. */
export type GetIpamPrefixListResolverRulesResult = {
  rules?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of get_ipam_prefix_list_resolver_version_entries. */
export type GetIpamPrefixListResolverVersionEntriesResult = {
  entries?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of get_ipam_prefix_list_resolver_versions. */
export type GetIpamPrefixListResolverVersionsResult = {
  ipamPrefixListResolverVersions?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of get_ipam_resource_cidrs. */
export type GetIpamResourceCidrsResult = {
  nextToken?: string | undefined;
  ipamResourceCidrs?: Record<string, unknown>[];
};

/** Result of get_launch_template_data. */
export type GetLaunchTemplateDataResult = {
  launchTemplateData?: Record<string, unknown>;
};

/** Result of get_managed_prefix_list_associations. */
export type GetManagedPrefixListAssociationsResult = {
  prefixListAssociations?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of get_managed_prefix_list_entries. */
export type GetManagedPrefixListEntriesResult = {
  entries?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of get_network_insights_access_scope_analysis_findings. */
export type GetNetworkInsightsAccessScopeAnalysisFindingsResult = {
  networkInsightsAccessScopeAnalysisId?: string | undefined;
  analysisStatus?: string | undefined;
  analysisFindings?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of get_network_insights_access_scope_content. */
export type GetNetworkInsightsAccessScopeContentResult = {
  networkInsightsAccessScopeContent?: Record<string, unknown>;
};

/** Result of get_password_data. */
export type GetPasswordDataResult = {
  instanceId?: string | undefined;
  timestamp?: string | undefined;
  passwordData?: string | undefined;
};

/** Result of get_reserved_instances_exchange_quote. */
export type GetReservedInstancesExchangeQuoteResult = {
  currencyCode?: string | undefined;
  isValidExchange?: boolean | undefined;
  outputReservedInstancesWillExpireAt?: string | undefined;
  paymentDue?: string | undefined;
  reservedInstanceValueRollup?: Record<string, unknown>;
  reservedInstanceValueSet?: Record<string, unknown>[];
  targetConfigurationValueRollup?: Record<string, unknown>;
  targetConfigurationValueSet?: Record<string, unknown>[];
  validationFailureReason?: string | undefined;
};

/** Result of get_route_server_associations. */
export type GetRouteServerAssociationsResult = {
  routeServerAssociations?: Record<string, unknown>[];
};

/** Result of get_route_server_propagations. */
export type GetRouteServerPropagationsResult = {
  routeServerPropagations?: Record<string, unknown>[];
};

/** Result of get_route_server_routing_database. */
export type GetRouteServerRoutingDatabaseResult = {
  areRoutesPersisted?: boolean | undefined;
  routes?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of get_security_groups_for_vpc. */
export type GetSecurityGroupsForVpcResult = {
  nextToken?: string | undefined;
  securityGroupForVpcs?: Record<string, unknown>[];
};

/** Result of get_serial_console_access_status. */
export type GetSerialConsoleAccessStatusResult = {
  serialConsoleAccessEnabled?: boolean | undefined;
  managedBy?: string | undefined;
};

/** Result of get_snapshot_block_public_access_state. */
export type GetSnapshotBlockPublicAccessStateResult = {
  state?: string | undefined;
  managedBy?: string | undefined;
};

/** Result of get_spot_placement_scores. */
export type GetSpotPlacementScoresResult = {
  spotPlacementScores?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of get_subnet_cidr_reservations. */
export type GetSubnetCidrReservationsResult = {
  subnetIpv4CidrReservations?: Record<string, unknown>[];
  subnetIpv6CidrReservations?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of get_transit_gateway_attachment_propagations. */
export type GetTransitGatewayAttachmentPropagationsResult = {
  transitGatewayAttachmentPropagations?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of get_transit_gateway_multicast_domain_associations. */
export type GetTransitGatewayMulticastDomainAssociationsResult = {
  multicastDomainAssociations?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of get_transit_gateway_policy_table_associations. */
export type GetTransitGatewayPolicyTableAssociationsResult = {
  associations?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of get_transit_gateway_policy_table_entries. */
export type GetTransitGatewayPolicyTableEntriesResult = {
  transitGatewayPolicyTableEntries?: Record<string, unknown>[];
};

/** Result of get_transit_gateway_prefix_list_references. */
export type GetTransitGatewayPrefixListReferencesResult = {
  transitGatewayPrefixListReferences?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of get_transit_gateway_route_table_associations. */
export type GetTransitGatewayRouteTableAssociationsResult = {
  associations?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of get_transit_gateway_route_table_propagations. */
export type GetTransitGatewayRouteTablePropagationsResult = {
  transitGatewayRouteTablePropagations?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of get_verified_access_endpoint_policy. */
export type GetVerifiedAccessEndpointPolicyResult = {
  policyEnabled?: boolean | undefined;
  policyDocument?: string | undefined;
};

/** Result of get_verified_access_endpoint_targets. */
export type GetVerifiedAccessEndpointTargetsResult = {
  verifiedAccessEndpointTargets?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of get_verified_access_group_policy. */
export type GetVerifiedAccessGroupPolicyResult = {
  policyEnabled?: boolean | undefined;
  policyDocument?: string | undefined;
};

/** Result of get_vpn_connection_device_sample_configuration. */
export type GetVpnConnectionDeviceSampleConfigurationResult = {
  vpnConnectionDeviceSampleConfiguration?: string | undefined;
};

/** Result of get_vpn_connection_device_types. */
export type GetVpnConnectionDeviceTypesResult = {
  vpnConnectionDeviceTypes?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of get_vpn_tunnel_replacement_status. */
export type GetVpnTunnelReplacementStatusResult = {
  vpnConnectionId?: string | undefined;
  transitGatewayId?: string | undefined;
  customerGatewayId?: string | undefined;
  vpnGatewayId?: string | undefined;
  vpnTunnelOutsideIpAddress?: string | undefined;
  maintenanceDetails?: Record<string, unknown>;
};

/** Result of import_client_vpn_client_certificate_revocation_list. */
export type ImportClientVpnClientCertificateRevocationListResult = {
  returnValue?: boolean | undefined;
};

/** Result of import_image. */
export type ImportImageResult = {
  architecture?: string | undefined;
  description?: string | undefined;
  encrypted?: boolean | undefined;
  hypervisor?: string | undefined;
  imageId?: string | undefined;
  importTaskId?: string | undefined;
  kmsKeyId?: string | undefined;
  licenseType?: string | undefined;
  platform?: string | undefined;
  progress?: string | undefined;
  snapshotDetails?: Record<string, unknown>[];
  status?: string | undefined;
  statusMessage?: string | undefined;
  licenseSpecifications?: Record<string, unknown>[];
  tags?: Record<string, unknown>[];
  usageOperation?: string | undefined;
};

/** Result of import_instance. */
export type ImportInstanceResult = {
  conversionTask?: Record<string, unknown>;
};

/** Result of import_key_pair. */
export type ImportKeyPairResult = {
  keyFingerprint?: string | undefined;
  keyName?: string | undefined;
  keyPairId?: string | undefined;
  tags?: Record<string, unknown>[];
};

/** Result of import_snapshot. */
export type ImportSnapshotResult = {
  description?: string | undefined;
  importTaskId?: string | undefined;
  snapshotTaskDetail?: Record<string, unknown>;
  tags?: Record<string, unknown>[];
};

/** Result of import_volume. */
export type ImportVolumeResult = {
  conversionTask?: Record<string, unknown>;
};

/** Result of list_images_in_recycle_bin. */
export type ListImagesInRecycleBinResult = {
  images?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_snapshots_in_recycle_bin. */
export type ListSnapshotsInRecycleBinResult = {
  snapshots?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of lock_snapshot. */
export type LockSnapshotResult = {
  snapshotId?: string | undefined;
  lockState?: string | undefined;
  lockDuration?: number | undefined;
  coolOffPeriod?: number | undefined;
  coolOffPeriodExpiresOn?: string | undefined;
  lockCreatedOn?: string | undefined;
  lockExpiresOn?: string | undefined;
  lockDurationStartTime?: string | undefined;
};

/** Result of modify_address_attribute. */
export type ModifyAddressAttributeResult = {
  address?: Record<string, unknown>;
};

/** Result of modify_availability_zone_group. */
export type ModifyAvailabilityZoneGroupResult = {
  returnValue?: boolean | undefined;
};

/** Result of modify_capacity_reservation. */
export type ModifyCapacityReservationResult = {
  returnValue?: boolean | undefined;
};

/** Result of modify_capacity_reservation_fleet. */
export type ModifyCapacityReservationFleetResult = {
  returnValue?: boolean | undefined;
};

/** Result of modify_client_vpn_endpoint. */
export type ModifyClientVpnEndpointResult = {
  returnValue?: boolean | undefined;
};

/** Result of modify_default_credit_specification. */
export type ModifyDefaultCreditSpecificationResult = {
  instanceFamilyCreditSpecification?: Record<string, unknown>;
};

/** Result of modify_ebs_default_kms_key_id. */
export type ModifyEbsDefaultKmsKeyIdResult = {
  kmsKeyId?: string | undefined;
};

/** Result of modify_fleet. */
export type ModifyFleetResult = {
  returnValue?: boolean | undefined;
};

/** Result of modify_fpga_image_attribute. */
export type ModifyFpgaImageAttributeResult = {
  fpgaImageAttribute?: Record<string, unknown>;
};

/** Result of modify_hosts. */
export type ModifyHostsResult = {
  successful?: string[];
  unsuccessful?: Record<string, unknown>[];
};

/** Result of modify_instance_capacity_reservation_attributes. */
export type ModifyInstanceCapacityReservationAttributesResult = {
  returnValue?: boolean | undefined;
};

/** Result of modify_instance_connect_endpoint. */
export type ModifyInstanceConnectEndpointResult = {
  returnValue?: boolean | undefined;
};

/** Result of modify_instance_cpu_options. */
export type ModifyInstanceCpuOptionsResult = {
  instanceId?: string | undefined;
  coreCount?: number | undefined;
  threadsPerCore?: number | undefined;
};

/** Result of modify_instance_credit_specification. */
export type ModifyInstanceCreditSpecificationResult = {
  successfulInstanceCreditSpecifications?: Record<string, unknown>[];
  unsuccessfulInstanceCreditSpecifications?: Record<string, unknown>[];
};

/** Result of modify_instance_event_start_time. */
export type ModifyInstanceEventStartTimeResult = {
  event?: Record<string, unknown>;
};

/** Result of modify_instance_event_window. */
export type ModifyInstanceEventWindowResult = {
  instanceEventWindow?: Record<string, unknown>;
};

/** Result of modify_instance_maintenance_options. */
export type ModifyInstanceMaintenanceOptionsResult = {
  instanceId?: string | undefined;
  autoRecovery?: string | undefined;
  rebootMigration?: string | undefined;
};

/** Result of modify_instance_metadata_defaults. */
export type ModifyInstanceMetadataDefaultsResult = {
  returnValue?: boolean | undefined;
};

/** Result of modify_instance_metadata_options. */
export type ModifyInstanceMetadataOptionsResult = {
  instanceId?: string | undefined;
  instanceMetadataOptions?: Record<string, unknown>;
};

/** Result of modify_instance_network_performance_options. */
export type ModifyInstanceNetworkPerformanceOptionsResult = {
  instanceId?: string | undefined;
  bandwidthWeighting?: string | undefined;
};

/** Result of modify_instance_placement. */
export type ModifyInstancePlacementResult = {
  returnValue?: boolean | undefined;
};

/** Result of modify_ipam. */
export type ModifyIpamResult = {
  ipam?: Record<string, unknown>;
};

/** Result of modify_ipam_pool. */
export type ModifyIpamPoolResult = {
  ipamPool?: Record<string, unknown>;
};

/** Result of modify_ipam_prefix_list_resolver. */
export type ModifyIpamPrefixListResolverResult = {
  ipamPrefixListResolver?: Record<string, unknown>;
};

/** Result of modify_ipam_prefix_list_resolver_target. */
export type ModifyIpamPrefixListResolverTargetResult = {
  ipamPrefixListResolverTarget?: Record<string, unknown>;
};

/** Result of modify_ipam_resource_cidr. */
export type ModifyIpamResourceCidrResult = {
  ipamResourceCidr?: Record<string, unknown>;
};

/** Result of modify_ipam_resource_discovery. */
export type ModifyIpamResourceDiscoveryResult = {
  ipamResourceDiscovery?: Record<string, unknown>;
};

/** Result of modify_ipam_scope. */
export type ModifyIpamScopeResult = {
  ipamScope?: Record<string, unknown>;
};

/** Result of modify_launch_template. */
export type ModifyLaunchTemplateResult = {
  launchTemplate?: Record<string, unknown>;
};

/** Result of modify_local_gateway_route. */
export type ModifyLocalGatewayRouteResult = {
  route?: Record<string, unknown>;
};

/** Result of modify_managed_prefix_list. */
export type ModifyManagedPrefixListResult = {
  prefixList?: Record<string, unknown>;
};

/** Result of modify_private_dns_name_options. */
export type ModifyPrivateDnsNameOptionsResult = {
  returnValue?: boolean | undefined;
};

/** Result of modify_public_ip_dns_name_options. */
export type ModifyPublicIpDnsNameOptionsResult = {
  successful?: boolean | undefined;
};

/** Result of modify_reserved_instances. */
export type ModifyReservedInstancesResult = {
  reservedInstancesModificationId?: string | undefined;
};

/** Result of modify_route_server. */
export type ModifyRouteServerResult = {
  routeServer?: Record<string, unknown>;
};

/** Result of modify_security_group_rules. */
export type ModifySecurityGroupRulesResult = {
  returnValue?: boolean | undefined;
};

/** Result of modify_snapshot_tier. */
export type ModifySnapshotTierResult = {
  snapshotId?: string | undefined;
  tieringStartTime?: string | undefined;
};

/** Result of modify_spot_fleet_request. */
export type ModifySpotFleetRequestResult = {
  returnValue?: boolean | undefined;
};

/** Result of modify_traffic_mirror_filter_network_services. */
export type ModifyTrafficMirrorFilterNetworkServicesResult = {
  trafficMirrorFilter?: Record<string, unknown>;
};

/** Result of modify_traffic_mirror_filter_rule. */
export type ModifyTrafficMirrorFilterRuleResult = {
  trafficMirrorFilterRule?: Record<string, unknown>;
};

/** Result of modify_traffic_mirror_session. */
export type ModifyTrafficMirrorSessionResult = {
  trafficMirrorSession?: Record<string, unknown>;
};

/** Result of modify_transit_gateway. */
export type ModifyTransitGatewayResult = {
  transitGateway?: Record<string, unknown>;
};

/** Result of modify_transit_gateway_prefix_list_reference. */
export type ModifyTransitGatewayPrefixListReferenceResult = {
  transitGatewayPrefixListReference?: Record<string, unknown>;
};

/** Result of modify_transit_gateway_vpc_attachment. */
export type ModifyTransitGatewayVpcAttachmentResult = {
  transitGatewayVpcAttachment?: Record<string, unknown>;
};

/** Result of modify_verified_access_endpoint. */
export type ModifyVerifiedAccessEndpointResult = {
  verifiedAccessEndpoint?: Record<string, unknown>;
};

/** Result of modify_verified_access_endpoint_policy. */
export type ModifyVerifiedAccessEndpointPolicyResult = {
  policyEnabled?: boolean | undefined;
  policyDocument?: string | undefined;
  sseSpecification?: Record<string, unknown>;
};

/** Result of modify_verified_access_group. */
export type ModifyVerifiedAccessGroupResult = {
  verifiedAccessGroup?: Record<string, unknown>;
};

/** Result of modify_verified_access_group_policy. */
export type ModifyVerifiedAccessGroupPolicyResult = {
  policyEnabled?: boolean | undefined;
  policyDocument?: string | undefined;
  sseSpecification?: Record<string, unknown>;
};

/** Result of modify_verified_access_instance. */
export type ModifyVerifiedAccessInstanceResult = {
  verifiedAccessInstance?: Record<string, unknown>;
};

/** Result of modify_verified_access_instance_logging_configuration. */
export type ModifyVerifiedAccessInstanceLoggingConfigurationResult = {
  loggingConfiguration?: Record<string, unknown>;
};

/** Result of modify_verified_access_trust_provider. */
export type ModifyVerifiedAccessTrustProviderResult = {
  verifiedAccessTrustProvider?: Record<string, unknown>;
};

/** Result of modify_volume. */
export type ModifyVolumeResult = {
  volumeModification?: Record<string, unknown>;
};

/** Result of modify_vpc_block_public_access_exclusion. */
export type ModifyVpcBlockPublicAccessExclusionResult = {
  vpcBlockPublicAccessExclusion?: Record<string, unknown>;
};

/** Result of modify_vpc_block_public_access_options. */
export type ModifyVpcBlockPublicAccessOptionsResult = {
  vpcBlockPublicAccessOptions?: Record<string, unknown>;
};

/** Result of modify_vpc_endpoint. */
export type ModifyVpcEndpointResult = {
  returnValue?: boolean | undefined;
};

/** Result of modify_vpc_endpoint_connection_notification. */
export type ModifyVpcEndpointConnectionNotificationResult = {
  returnValue?: boolean | undefined;
};

/** Result of modify_vpc_endpoint_service_configuration. */
export type ModifyVpcEndpointServiceConfigurationResult = {
  returnValue?: boolean | undefined;
};

/** Result of modify_vpc_endpoint_service_payer_responsibility. */
export type ModifyVpcEndpointServicePayerResponsibilityResult = {
  returnValue?: boolean | undefined;
};

/** Result of modify_vpc_endpoint_service_permissions. */
export type ModifyVpcEndpointServicePermissionsResult = {
  addedPrincipals?: Record<string, unknown>[];
  returnValue?: boolean | undefined;
};

/** Result of modify_vpc_peering_connection_options. */
export type ModifyVpcPeeringConnectionOptionsResult = {
  accepterPeeringConnectionOptions?: Record<string, unknown>;
  requesterPeeringConnectionOptions?: Record<string, unknown>;
};

/** Result of modify_vpc_tenancy. */
export type ModifyVpcTenancyResult = {
  returnValue?: boolean | undefined;
};

/** Result of modify_vpn_connection. */
export type ModifyVpnConnectionResult = {
  vpnConnection?: Record<string, unknown>;
};

/** Result of modify_vpn_connection_options. */
export type ModifyVpnConnectionOptionsResult = {
  vpnConnection?: Record<string, unknown>;
};

/** Result of modify_vpn_tunnel_certificate. */
export type ModifyVpnTunnelCertificateResult = {
  vpnConnection?: Record<string, unknown>;
};

/** Result of modify_vpn_tunnel_options. */
export type ModifyVpnTunnelOptionsResult = {
  vpnConnection?: Record<string, unknown>;
};

/** Result of monitor_instances. */
export type MonitorInstancesResult = {
  instanceMonitorings?: Record<string, unknown>[];
};

/** Result of move_address_to_vpc. */
export type MoveAddressToVpcResult = {
  allocationId?: string | undefined;
  status?: string | undefined;
};

/** Result of move_byoip_cidr_to_ipam. */
export type MoveByoipCidrToIpamResult = {
  byoipCidr?: Record<string, unknown>;
};

/** Result of move_capacity_reservation_instances. */
export type MoveCapacityReservationInstancesResult = {
  sourceCapacityReservation?: Record<string, unknown>;
  destinationCapacityReservation?: Record<string, unknown>;
  instanceCount?: number | undefined;
};

/** Result of provision_byoip_cidr. */
export type ProvisionByoipCidrResult = {
  byoipCidr?: Record<string, unknown>;
};

/** Result of provision_ipam_byoasn. */
export type ProvisionIpamByoasnResult = {
  byoasn?: Record<string, unknown>;
};

/** Result of provision_ipam_pool_cidr. */
export type ProvisionIpamPoolCidrResult = {
  ipamPoolCidr?: Record<string, unknown>;
};

/** Result of provision_public_ipv4_pool_cidr. */
export type ProvisionPublicIpv4PoolCidrResult = {
  poolId?: string | undefined;
  poolAddressRange?: Record<string, unknown>;
};

/** Result of purchase_capacity_block. */
export type PurchaseCapacityBlockResult = {
  capacityReservation?: Record<string, unknown>;
  capacityBlocks?: Record<string, unknown>[];
};

/** Result of purchase_capacity_block_extension. */
export type PurchaseCapacityBlockExtensionResult = {
  capacityBlockExtensions?: Record<string, unknown>[];
};

/** Result of purchase_host_reservation. */
export type PurchaseHostReservationResult = {
  clientToken?: string | undefined;
  currencyCode?: string | undefined;
  purchase?: Record<string, unknown>[];
  totalHourlyPrice?: string | undefined;
  totalUpfrontPrice?: string | undefined;
};

/** Result of purchase_reserved_instances_offering. */
export type PurchaseReservedInstancesOfferingResult = {
  reservedInstancesId?: string | undefined;
};

/** Result of purchase_scheduled_instances. */
export type PurchaseScheduledInstancesResult = {
  scheduledInstanceSet?: Record<string, unknown>[];
};

/** Result of register_image. */
export type RegisterImageResult = {
  imageId?: string | undefined;
};

/** Result of register_instance_event_notification_attributes. */
export type RegisterInstanceEventNotificationAttributesResult = {
  instanceTagAttribute?: Record<string, unknown>;
};

/** Result of register_transit_gateway_multicast_group_members. */
export type RegisterTransitGatewayMulticastGroupMembersResult = {
  registeredMulticastGroupMembers?: Record<string, unknown>;
};

/** Result of register_transit_gateway_multicast_group_sources. */
export type RegisterTransitGatewayMulticastGroupSourcesResult = {
  registeredMulticastGroupSources?: Record<string, unknown>;
};

/** Result of reject_capacity_reservation_billing_ownership. */
export type RejectCapacityReservationBillingOwnershipResult = {
  returnValue?: boolean | undefined;
};

/** Result of reject_transit_gateway_multicast_domain_associations. */
export type RejectTransitGatewayMulticastDomainAssociationsResult = {
  associations?: Record<string, unknown>;
};

/** Result of reject_transit_gateway_peering_attachment. */
export type RejectTransitGatewayPeeringAttachmentResult = {
  transitGatewayPeeringAttachment?: Record<string, unknown>;
};

/** Result of reject_transit_gateway_vpc_attachment. */
export type RejectTransitGatewayVpcAttachmentResult = {
  transitGatewayVpcAttachment?: Record<string, unknown>;
};

/** Result of reject_vpc_endpoint_connections. */
export type RejectVpcEndpointConnectionsResult = {
  unsuccessful?: Record<string, unknown>[];
};

/** Result of reject_vpc_peering_connection. */
export type RejectVpcPeeringConnectionResult = {
  returnValue?: boolean | undefined;
};

/** Result of release_hosts. */
export type ReleaseHostsResult = {
  successful?: string[];
  unsuccessful?: Record<string, unknown>[];
};

/** Result of release_ipam_pool_allocation. */
export type ReleaseIpamPoolAllocationResult = {
  success?: boolean | undefined;
};

/** Result of replace_iam_instance_profile_association. */
export type ReplaceIamInstanceProfileAssociationResult = {
  iamInstanceProfileAssociation?: Record<string, unknown>;
};

/** Result of replace_image_criteria_in_allowed_images_settings. */
export type ReplaceImageCriteriaInAllowedImagesSettingsResult = {
  returnValue?: boolean | undefined;
};

/** Result of replace_network_acl_association. */
export type ReplaceNetworkAclAssociationResult = {
  newAssociationId?: string | undefined;
};

/** Result of replace_route_table_association. */
export type ReplaceRouteTableAssociationResult = {
  newAssociationId?: string | undefined;
  associationState?: Record<string, unknown>;
};

/** Result of replace_transit_gateway_route. */
export type ReplaceTransitGatewayRouteResult = {
  route?: Record<string, unknown>;
};

/** Result of replace_vpn_tunnel. */
export type ReplaceVpnTunnelResult = {
  returnValue?: boolean | undefined;
};

/** Result of request_spot_fleet. */
export type RequestSpotFleetResult = {
  spotFleetRequestId?: string | undefined;
};

/** Result of request_spot_instances. */
export type RequestSpotInstancesResult = {
  spotInstanceRequests?: Record<string, unknown>[];
};

/** Result of reset_address_attribute. */
export type ResetAddressAttributeResult = {
  address?: Record<string, unknown>;
};

/** Result of reset_ebs_default_kms_key_id. */
export type ResetEbsDefaultKmsKeyIdResult = {
  kmsKeyId?: string | undefined;
};

/** Result of reset_fpga_image_attribute. */
export type ResetFpgaImageAttributeResult = {
  returnValue?: boolean | undefined;
};

/** Result of restore_address_to_classic. */
export type RestoreAddressToClassicResult = {
  publicIp?: string | undefined;
  status?: string | undefined;
};

/** Result of restore_image_from_recycle_bin. */
export type RestoreImageFromRecycleBinResult = {
  returnValue?: boolean | undefined;
};

/** Result of restore_managed_prefix_list_version. */
export type RestoreManagedPrefixListVersionResult = {
  prefixList?: Record<string, unknown>;
};

/** Result of restore_snapshot_from_recycle_bin. */
export type RestoreSnapshotFromRecycleBinResult = {
  snapshotId?: string | undefined;
  outpostArn?: string | undefined;
  description?: string | undefined;
  encrypted?: boolean | undefined;
  ownerId?: string | undefined;
  progress?: string | undefined;
  startTime?: string | undefined;
  state?: string | undefined;
  volumeId?: string | undefined;
  volumeSize?: number | undefined;
  sseType?: string | undefined;
};

/** Result of restore_snapshot_tier. */
export type RestoreSnapshotTierResult = {
  snapshotId?: string | undefined;
  restoreStartTime?: string | undefined;
  restoreDuration?: number | undefined;
  isPermanentRestore?: boolean | undefined;
};

/** Result of revoke_client_vpn_ingress. */
export type RevokeClientVpnIngressResult = {
  status?: Record<string, unknown>;
};

/** Result of revoke_security_group_egress. */
export type RevokeSecurityGroupEgressResult = {
  returnValue?: boolean | undefined;
  unknownIpPermissions?: Record<string, unknown>[];
  revokedSecurityGroupRules?: Record<string, unknown>[];
};

/** Result of revoke_security_group_ingress. */
export type RevokeSecurityGroupIngressResult = {
  returnValue?: boolean | undefined;
  unknownIpPermissions?: Record<string, unknown>[];
  revokedSecurityGroupRules?: Record<string, unknown>[];
};

/** Result of run_instances. */
export type RunInstancesResult = {
  reservationId?: string | undefined;
  ownerId?: string | undefined;
  requesterId?: string | undefined;
  groups?: Record<string, unknown>[];
  instances?: Record<string, unknown>[];
};

/** Result of run_scheduled_instances. */
export type RunScheduledInstancesResult = {
  instanceIdSet?: string[];
};

/** Result of search_local_gateway_routes. */
export type SearchLocalGatewayRoutesResult = {
  routes?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of search_transit_gateway_multicast_groups. */
export type SearchTransitGatewayMulticastGroupsResult = {
  multicastGroups?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of search_transit_gateway_routes. */
export type SearchTransitGatewayRoutesResult = {
  routes?: Record<string, unknown>[];
  additionalRoutesAvailable?: boolean | undefined;
};

/** Result of start_declarative_policies_report. */
export type StartDeclarativePoliciesReportResult = {
  reportId?: string | undefined;
};

/** Result of start_network_insights_access_scope_analysis. */
export type StartNetworkInsightsAccessScopeAnalysisResult = {
  networkInsightsAccessScopeAnalysis?: Record<string, unknown>;
};

/** Result of start_network_insights_analysis. */
export type StartNetworkInsightsAnalysisResult = {
  networkInsightsAnalysis?: Record<string, unknown>;
};

/** Result of start_vpc_endpoint_service_private_dns_verification. */
export type StartVpcEndpointServicePrivateDnsVerificationResult = {
  returnValue?: boolean | undefined;
};

/** Result of terminate_client_vpn_connections. */
export type TerminateClientVpnConnectionsResult = {
  clientVpnEndpointId?: string | undefined;
  username?: string | undefined;
  connectionStatuses?: Record<string, unknown>[];
};

/** Result of unassign_ipv6_addresses. */
export type UnassignIpv6AddressesResult = {
  networkInterfaceId?: string | undefined;
  unassignedIpv6Addresses?: string[];
  unassignedIpv6Prefixes?: string[];
};

/** Result of unassign_private_nat_gateway_address. */
export type UnassignPrivateNatGatewayAddressResult = {
  natGatewayId?: string | undefined;
  natGatewayAddresses?: Record<string, unknown>[];
};

/** Result of unlock_snapshot. */
export type UnlockSnapshotResult = {
  snapshotId?: string | undefined;
};

/** Result of unmonitor_instances. */
export type UnmonitorInstancesResult = {
  instanceMonitorings?: Record<string, unknown>[];
};

/** Result of update_capacity_manager_organizations_access. */
export type UpdateCapacityManagerOrganizationsAccessResult = {
  capacityManagerStatus?: string | undefined;
  organizationsAccess?: boolean | undefined;
};

/** Result of update_security_group_rule_descriptions_egress. */
export type UpdateSecurityGroupRuleDescriptionsEgressResult = {
  returnValue?: boolean | undefined;
};

/** Result of update_security_group_rule_descriptions_ingress. */
export type UpdateSecurityGroupRuleDescriptionsIngressResult = {
  returnValue?: boolean | undefined;
};

/** Result of withdraw_byoip_cidr. */
export type WithdrawByoipCidrResult = {
  byoipCidr?: Record<string, unknown>;
};


// ---------------------------------------------------------------------------
// Additional functions (auto-generated)
// ---------------------------------------------------------------------------

/** Accept address transfer. */
export async function acceptAddressTransfer(address: string): Promise<AcceptAddressTransferResult> {
  try {
    // TODO: implement accept_address_transfer
    throw new Error("accept_address_transfer not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "accept_address_transfer failed");
  }
}

/** Accept capacity reservation billing ownership. */
export async function acceptCapacityReservationBillingOwnership(capacityReservationId: string, regionName?: string | undefined): Promise<AcceptCapacityReservationBillingOwnershipResult> {
  try {
    // TODO: implement accept_capacity_reservation_billing_ownership
    throw new Error("accept_capacity_reservation_billing_ownership not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "accept_capacity_reservation_billing_ownership failed");
  }
}

/** Accept reserved instances exchange quote. */
export async function acceptReservedInstancesExchangeQuote(reservedInstanceIds: string[]): Promise<AcceptReservedInstancesExchangeQuoteResult> {
  try {
    // TODO: implement accept_reserved_instances_exchange_quote
    throw new Error("accept_reserved_instances_exchange_quote not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "accept_reserved_instances_exchange_quote failed");
  }
}

/** Accept transit gateway multicast domain associations. */
export async function acceptTransitGatewayMulticastDomainAssociations(): Promise<AcceptTransitGatewayMulticastDomainAssociationsResult> {
  try {
    // TODO: implement accept_transit_gateway_multicast_domain_associations
    throw new Error("accept_transit_gateway_multicast_domain_associations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "accept_transit_gateway_multicast_domain_associations failed");
  }
}

/** Accept transit gateway peering attachment. */
export async function acceptTransitGatewayPeeringAttachment(transitGatewayAttachmentId: string, regionName?: string | undefined): Promise<AcceptTransitGatewayPeeringAttachmentResult> {
  try {
    // TODO: implement accept_transit_gateway_peering_attachment
    throw new Error("accept_transit_gateway_peering_attachment not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "accept_transit_gateway_peering_attachment failed");
  }
}

/** Accept transit gateway vpc attachment. */
export async function acceptTransitGatewayVpcAttachment(transitGatewayAttachmentId: string, regionName?: string | undefined): Promise<AcceptTransitGatewayVpcAttachmentResult> {
  try {
    // TODO: implement accept_transit_gateway_vpc_attachment
    throw new Error("accept_transit_gateway_vpc_attachment not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "accept_transit_gateway_vpc_attachment failed");
  }
}

/** Accept vpc endpoint connections. */
export async function acceptVpcEndpointConnections(serviceId: string, vpcEndpointIds: string[], regionName?: string | undefined): Promise<AcceptVpcEndpointConnectionsResult> {
  try {
    // TODO: implement accept_vpc_endpoint_connections
    throw new Error("accept_vpc_endpoint_connections not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "accept_vpc_endpoint_connections failed");
  }
}

/** Accept vpc peering connection. */
export async function acceptVpcPeeringConnection(vpcPeeringConnectionId: string, regionName?: string | undefined): Promise<AcceptVpcPeeringConnectionResult> {
  try {
    // TODO: implement accept_vpc_peering_connection
    throw new Error("accept_vpc_peering_connection not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "accept_vpc_peering_connection failed");
  }
}

/** Advertise byoip cidr. */
export async function advertiseByoipCidr(cidr: string): Promise<AdvertiseByoipCidrResult> {
  try {
    // TODO: implement advertise_byoip_cidr
    throw new Error("advertise_byoip_cidr not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "advertise_byoip_cidr failed");
  }
}

/** Allocate address. */
export async function allocateAddress(): Promise<AllocateAddressResult> {
  try {
    // TODO: implement allocate_address
    throw new Error("allocate_address not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "allocate_address failed");
  }
}

/** Allocate hosts. */
export async function allocateHosts(): Promise<AllocateHostsResult> {
  try {
    // TODO: implement allocate_hosts
    throw new Error("allocate_hosts not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "allocate_hosts failed");
  }
}

/** Allocate ipam pool cidr. */
export async function allocateIpamPoolCidr(ipamPoolId: string): Promise<AllocateIpamPoolCidrResult> {
  try {
    // TODO: implement allocate_ipam_pool_cidr
    throw new Error("allocate_ipam_pool_cidr not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "allocate_ipam_pool_cidr failed");
  }
}

/** Apply security groups to client vpn target network. */
export async function applySecurityGroupsToClientVpnTargetNetwork(clientVpnEndpointId: string, vpcId: string, securityGroupIds: string[], regionName?: string | undefined): Promise<ApplySecurityGroupsToClientVpnTargetNetworkResult> {
  try {
    // TODO: implement apply_security_groups_to_client_vpn_target_network
    throw new Error("apply_security_groups_to_client_vpn_target_network not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "apply_security_groups_to_client_vpn_target_network failed");
  }
}

/** Assign ipv6 addresses. */
export async function assignIpv6Addresses(networkInterfaceId: string): Promise<AssignIpv6AddressesResult> {
  try {
    // TODO: implement assign_ipv6_addresses
    throw new Error("assign_ipv6_addresses not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "assign_ipv6_addresses failed");
  }
}

/** Assign private ip addresses. */
export async function assignPrivateIpAddresses(networkInterfaceId: string): Promise<AssignPrivateIpAddressesResult> {
  try {
    // TODO: implement assign_private_ip_addresses
    throw new Error("assign_private_ip_addresses not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "assign_private_ip_addresses failed");
  }
}

/** Assign private nat gateway address. */
export async function assignPrivateNatGatewayAddress(natGatewayId: string): Promise<AssignPrivateNatGatewayAddressResult> {
  try {
    // TODO: implement assign_private_nat_gateway_address
    throw new Error("assign_private_nat_gateway_address not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "assign_private_nat_gateway_address failed");
  }
}

/** Associate address. */
export async function associateAddress(): Promise<AssociateAddressResult> {
  try {
    // TODO: implement associate_address
    throw new Error("associate_address not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "associate_address failed");
  }
}

/** Associate capacity reservation billing owner. */
export async function associateCapacityReservationBillingOwner(capacityReservationId: string, unusedReservationBillingOwnerId: string, regionName?: string | undefined): Promise<AssociateCapacityReservationBillingOwnerResult> {
  try {
    // TODO: implement associate_capacity_reservation_billing_owner
    throw new Error("associate_capacity_reservation_billing_owner not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "associate_capacity_reservation_billing_owner failed");
  }
}

/** Associate client vpn target network. */
export async function associateClientVpnTargetNetwork(clientVpnEndpointId: string, subnetId: string): Promise<AssociateClientVpnTargetNetworkResult> {
  try {
    // TODO: implement associate_client_vpn_target_network
    throw new Error("associate_client_vpn_target_network not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "associate_client_vpn_target_network failed");
  }
}

/** Associate dhcp options. */
export async function associateDhcpOptions(dhcpOptionsId: string, vpcId: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement associate_dhcp_options
    throw new Error("associate_dhcp_options not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "associate_dhcp_options failed");
  }
}

/** Associate enclave certificate iam role. */
export async function associateEnclaveCertificateIamRole(certificateArn: string, roleArn: string, regionName?: string | undefined): Promise<AssociateEnclaveCertificateIamRoleResult> {
  try {
    // TODO: implement associate_enclave_certificate_iam_role
    throw new Error("associate_enclave_certificate_iam_role not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "associate_enclave_certificate_iam_role failed");
  }
}

/** Associate iam instance profile. */
export async function associateIamInstanceProfile(iamInstanceProfile: Record<string, unknown>, instanceId: string, regionName?: string | undefined): Promise<AssociateIamInstanceProfileResult> {
  try {
    // TODO: implement associate_iam_instance_profile
    throw new Error("associate_iam_instance_profile not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "associate_iam_instance_profile failed");
  }
}

/** Associate instance event window. */
export async function associateInstanceEventWindow(instanceEventWindowId: string, associationTarget: Record<string, unknown>, regionName?: string | undefined): Promise<AssociateInstanceEventWindowResult> {
  try {
    // TODO: implement associate_instance_event_window
    throw new Error("associate_instance_event_window not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "associate_instance_event_window failed");
  }
}

/** Associate ipam byoasn. */
export async function associateIpamByoasn(asn: string, cidr: string, regionName?: string | undefined): Promise<AssociateIpamByoasnResult> {
  try {
    // TODO: implement associate_ipam_byoasn
    throw new Error("associate_ipam_byoasn not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "associate_ipam_byoasn failed");
  }
}

/** Associate ipam resource discovery. */
export async function associateIpamResourceDiscovery(ipamId: string, ipamResourceDiscoveryId: string): Promise<AssociateIpamResourceDiscoveryResult> {
  try {
    // TODO: implement associate_ipam_resource_discovery
    throw new Error("associate_ipam_resource_discovery not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "associate_ipam_resource_discovery failed");
  }
}

/** Associate nat gateway address. */
export async function associateNatGatewayAddress(natGatewayId: string, allocationIds: string[]): Promise<AssociateNatGatewayAddressResult> {
  try {
    // TODO: implement associate_nat_gateway_address
    throw new Error("associate_nat_gateway_address not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "associate_nat_gateway_address failed");
  }
}

/** Associate route server. */
export async function associateRouteServer(routeServerId: string, vpcId: string, regionName?: string | undefined): Promise<AssociateRouteServerResult> {
  try {
    // TODO: implement associate_route_server
    throw new Error("associate_route_server not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "associate_route_server failed");
  }
}

/** Associate route table. */
export async function associateRouteTable(routeTableId: string): Promise<AssociateRouteTableResult> {
  try {
    // TODO: implement associate_route_table
    throw new Error("associate_route_table not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "associate_route_table failed");
  }
}

/** Associate security group vpc. */
export async function associateSecurityGroupVpc(groupId: string, vpcId: string, regionName?: string | undefined): Promise<AssociateSecurityGroupVpcResult> {
  try {
    // TODO: implement associate_security_group_vpc
    throw new Error("associate_security_group_vpc not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "associate_security_group_vpc failed");
  }
}

/** Associate subnet cidr block. */
export async function associateSubnetCidrBlock(subnetId: string): Promise<AssociateSubnetCidrBlockResult> {
  try {
    // TODO: implement associate_subnet_cidr_block
    throw new Error("associate_subnet_cidr_block not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "associate_subnet_cidr_block failed");
  }
}

/** Associate transit gateway multicast domain. */
export async function associateTransitGatewayMulticastDomain(transitGatewayMulticastDomainId: string, transitGatewayAttachmentId: string, subnetIds: string[], regionName?: string | undefined): Promise<AssociateTransitGatewayMulticastDomainResult> {
  try {
    // TODO: implement associate_transit_gateway_multicast_domain
    throw new Error("associate_transit_gateway_multicast_domain not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "associate_transit_gateway_multicast_domain failed");
  }
}

/** Associate transit gateway policy table. */
export async function associateTransitGatewayPolicyTable(transitGatewayPolicyTableId: string, transitGatewayAttachmentId: string, regionName?: string | undefined): Promise<AssociateTransitGatewayPolicyTableResult> {
  try {
    // TODO: implement associate_transit_gateway_policy_table
    throw new Error("associate_transit_gateway_policy_table not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "associate_transit_gateway_policy_table failed");
  }
}

/** Associate transit gateway route table. */
export async function associateTransitGatewayRouteTable(transitGatewayRouteTableId: string, transitGatewayAttachmentId: string, regionName?: string | undefined): Promise<AssociateTransitGatewayRouteTableResult> {
  try {
    // TODO: implement associate_transit_gateway_route_table
    throw new Error("associate_transit_gateway_route_table not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "associate_transit_gateway_route_table failed");
  }
}

/** Associate trunk interface. */
export async function associateTrunkInterface(branchInterfaceId: string, trunkInterfaceId: string): Promise<AssociateTrunkInterfaceResult> {
  try {
    // TODO: implement associate_trunk_interface
    throw new Error("associate_trunk_interface not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "associate_trunk_interface failed");
  }
}

/** Associate vpc cidr block. */
export async function associateVpcCidrBlock(vpcId: string): Promise<AssociateVpcCidrBlockResult> {
  try {
    // TODO: implement associate_vpc_cidr_block
    throw new Error("associate_vpc_cidr_block not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "associate_vpc_cidr_block failed");
  }
}

/** Attach classic link vpc. */
export async function attachClassicLinkVpc(instanceId: string, vpcId: string, groups: string[], regionName?: string | undefined): Promise<AttachClassicLinkVpcResult> {
  try {
    // TODO: implement attach_classic_link_vpc
    throw new Error("attach_classic_link_vpc not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "attach_classic_link_vpc failed");
  }
}

/** Attach internet gateway. */
export async function attachInternetGateway(internetGatewayId: string, vpcId: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement attach_internet_gateway
    throw new Error("attach_internet_gateway not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "attach_internet_gateway failed");
  }
}

/** Attach network interface. */
export async function attachNetworkInterface(networkInterfaceId: string, instanceId: string, deviceIndex: number): Promise<AttachNetworkInterfaceResult> {
  try {
    // TODO: implement attach_network_interface
    throw new Error("attach_network_interface not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "attach_network_interface failed");
  }
}

/** Attach verified access trust provider. */
export async function attachVerifiedAccessTrustProvider(verifiedAccessInstanceId: string, verifiedAccessTrustProviderId: string): Promise<AttachVerifiedAccessTrustProviderResult> {
  try {
    // TODO: implement attach_verified_access_trust_provider
    throw new Error("attach_verified_access_trust_provider not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "attach_verified_access_trust_provider failed");
  }
}

/** Attach volume. */
export async function attachVolume(device: string, instanceId: string, volumeId: string, regionName?: string | undefined): Promise<AttachVolumeResult> {
  try {
    // TODO: implement attach_volume
    throw new Error("attach_volume not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "attach_volume failed");
  }
}

/** Attach vpn gateway. */
export async function attachVpnGateway(vpcId: string, vpnGatewayId: string, regionName?: string | undefined): Promise<AttachVpnGatewayResult> {
  try {
    // TODO: implement attach_vpn_gateway
    throw new Error("attach_vpn_gateway not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "attach_vpn_gateway failed");
  }
}

/** Authorize client vpn ingress. */
export async function authorizeClientVpnIngress(clientVpnEndpointId: string, targetNetworkCidr: string): Promise<AuthorizeClientVpnIngressResult> {
  try {
    // TODO: implement authorize_client_vpn_ingress
    throw new Error("authorize_client_vpn_ingress not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "authorize_client_vpn_ingress failed");
  }
}

/** Authorize security group egress. */
export async function authorizeSecurityGroupEgress(groupId: string): Promise<AuthorizeSecurityGroupEgressResult> {
  try {
    // TODO: implement authorize_security_group_egress
    throw new Error("authorize_security_group_egress not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "authorize_security_group_egress failed");
  }
}

/** Authorize security group ingress. */
export async function authorizeSecurityGroupIngress(): Promise<AuthorizeSecurityGroupIngressResult> {
  try {
    // TODO: implement authorize_security_group_ingress
    throw new Error("authorize_security_group_ingress not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "authorize_security_group_ingress failed");
  }
}

/** Bundle instance. */
export async function bundleInstance(instanceId: string, storage: Record<string, unknown>, regionName?: string | undefined): Promise<BundleInstanceResult> {
  try {
    // TODO: implement bundle_instance
    throw new Error("bundle_instance not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "bundle_instance failed");
  }
}

/** Cancel bundle task. */
export async function cancelBundleTask(bundleId: string, regionName?: string | undefined): Promise<CancelBundleTaskResult> {
  try {
    // TODO: implement cancel_bundle_task
    throw new Error("cancel_bundle_task not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "cancel_bundle_task failed");
  }
}

/** Cancel capacity reservation. */
export async function cancelCapacityReservation(capacityReservationId: string, regionName?: string | undefined): Promise<CancelCapacityReservationResult> {
  try {
    // TODO: implement cancel_capacity_reservation
    throw new Error("cancel_capacity_reservation not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "cancel_capacity_reservation failed");
  }
}

/** Cancel capacity reservation fleets. */
export async function cancelCapacityReservationFleets(capacityReservationFleetIds: string[], regionName?: string | undefined): Promise<CancelCapacityReservationFleetsResult> {
  try {
    // TODO: implement cancel_capacity_reservation_fleets
    throw new Error("cancel_capacity_reservation_fleets not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "cancel_capacity_reservation_fleets failed");
  }
}

/** Cancel conversion task. */
export async function cancelConversionTask(conversionTaskId: string): Promise<void> {
  try {
    // TODO: implement cancel_conversion_task
    throw new Error("cancel_conversion_task not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "cancel_conversion_task failed");
  }
}

/** Cancel declarative policies report. */
export async function cancelDeclarativePoliciesReport(reportId: string, regionName?: string | undefined): Promise<CancelDeclarativePoliciesReportResult> {
  try {
    // TODO: implement cancel_declarative_policies_report
    throw new Error("cancel_declarative_policies_report not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "cancel_declarative_policies_report failed");
  }
}

/** Cancel export task. */
export async function cancelExportTask(exportTaskId: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement cancel_export_task
    throw new Error("cancel_export_task not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "cancel_export_task failed");
  }
}

/** Cancel image launch permission. */
export async function cancelImageLaunchPermission(imageId: string, regionName?: string | undefined): Promise<CancelImageLaunchPermissionResult> {
  try {
    // TODO: implement cancel_image_launch_permission
    throw new Error("cancel_image_launch_permission not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "cancel_image_launch_permission failed");
  }
}

/** Cancel import task. */
export async function cancelImportTask(): Promise<CancelImportTaskResult> {
  try {
    // TODO: implement cancel_import_task
    throw new Error("cancel_import_task not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "cancel_import_task failed");
  }
}

/** Cancel reserved instances listing. */
export async function cancelReservedInstancesListing(reservedInstancesListingId: string, regionName?: string | undefined): Promise<CancelReservedInstancesListingResult> {
  try {
    // TODO: implement cancel_reserved_instances_listing
    throw new Error("cancel_reserved_instances_listing not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "cancel_reserved_instances_listing failed");
  }
}

/** Cancel spot fleet requests. */
export async function cancelSpotFleetRequests(spotFleetRequestIds: string[], terminateInstances: boolean, regionName?: string | undefined): Promise<CancelSpotFleetRequestsResult> {
  try {
    // TODO: implement cancel_spot_fleet_requests
    throw new Error("cancel_spot_fleet_requests not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "cancel_spot_fleet_requests failed");
  }
}

/** Cancel spot instance requests. */
export async function cancelSpotInstanceRequests(spotInstanceRequestIds: string[], regionName?: string | undefined): Promise<CancelSpotInstanceRequestsResult> {
  try {
    // TODO: implement cancel_spot_instance_requests
    throw new Error("cancel_spot_instance_requests not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "cancel_spot_instance_requests failed");
  }
}

/** Confirm product instance. */
export async function confirmProductInstance(instanceId: string, productCode: string, regionName?: string | undefined): Promise<ConfirmProductInstanceResult> {
  try {
    // TODO: implement confirm_product_instance
    throw new Error("confirm_product_instance not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "confirm_product_instance failed");
  }
}

/** Copy fpga image. */
export async function copyFpgaImage(sourceFpgaImageId: string, sourceRegion: string): Promise<CopyFpgaImageResult> {
  try {
    // TODO: implement copy_fpga_image
    throw new Error("copy_fpga_image not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "copy_fpga_image failed");
  }
}

/** Copy image. */
export async function copyImage(name: string, sourceImageId: string, sourceRegion: string): Promise<CopyImageResult> {
  try {
    // TODO: implement copy_image
    throw new Error("copy_image not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "copy_image failed");
  }
}

/** Copy snapshot. */
export async function copySnapshot(sourceRegion: string, sourceSnapshotId: string): Promise<CopySnapshotResult> {
  try {
    // TODO: implement copy_snapshot
    throw new Error("copy_snapshot not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "copy_snapshot failed");
  }
}

/** Copy volumes. */
export async function copyVolumes(sourceVolumeId: string): Promise<CopyVolumesResult> {
  try {
    // TODO: implement copy_volumes
    throw new Error("copy_volumes not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "copy_volumes failed");
  }
}

/** Create capacity manager data export. */
export async function createCapacityManagerDataExport(s3BucketName: string, schedule: string, outputFormat: string): Promise<CreateCapacityManagerDataExportResult> {
  try {
    // TODO: implement create_capacity_manager_data_export
    throw new Error("create_capacity_manager_data_export not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_capacity_manager_data_export failed");
  }
}

/** Create capacity reservation. */
export async function createCapacityReservation(instanceType: string, instancePlatform: string, instanceCount: number): Promise<CreateCapacityReservationResult> {
  try {
    // TODO: implement create_capacity_reservation
    throw new Error("create_capacity_reservation not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_capacity_reservation failed");
  }
}

/** Create capacity reservation by splitting. */
export async function createCapacityReservationBySplitting(sourceCapacityReservationId: string, instanceCount: number): Promise<CreateCapacityReservationBySplittingResult> {
  try {
    // TODO: implement create_capacity_reservation_by_splitting
    throw new Error("create_capacity_reservation_by_splitting not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_capacity_reservation_by_splitting failed");
  }
}

/** Create capacity reservation fleet. */
export async function createCapacityReservationFleet(instanceTypeSpecifications: Record<string, unknown>[], totalTargetCapacity: number): Promise<CreateCapacityReservationFleetResult> {
  try {
    // TODO: implement create_capacity_reservation_fleet
    throw new Error("create_capacity_reservation_fleet not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_capacity_reservation_fleet failed");
  }
}

/** Create carrier gateway. */
export async function createCarrierGateway(vpcId: string): Promise<CreateCarrierGatewayResult> {
  try {
    // TODO: implement create_carrier_gateway
    throw new Error("create_carrier_gateway not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_carrier_gateway failed");
  }
}

/** Create client vpn endpoint. */
export async function createClientVpnEndpoint(serverCertificateArn: string, authenticationOptions: Record<string, unknown>[], connectionLogOptions: Record<string, unknown>): Promise<CreateClientVpnEndpointResult> {
  try {
    // TODO: implement create_client_vpn_endpoint
    throw new Error("create_client_vpn_endpoint not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_client_vpn_endpoint failed");
  }
}

/** Create client vpn route. */
export async function createClientVpnRoute(clientVpnEndpointId: string, destinationCidrBlock: string, targetVpcSubnetId: string): Promise<CreateClientVpnRouteResult> {
  try {
    // TODO: implement create_client_vpn_route
    throw new Error("create_client_vpn_route not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_client_vpn_route failed");
  }
}

/** Create coip cidr. */
export async function createCoipCidr(cidr: string, coipPoolId: string, regionName?: string | undefined): Promise<CreateCoipCidrResult> {
  try {
    // TODO: implement create_coip_cidr
    throw new Error("create_coip_cidr not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_coip_cidr failed");
  }
}

/** Create coip pool. */
export async function createCoipPool(localGatewayRouteTableId: string): Promise<CreateCoipPoolResult> {
  try {
    // TODO: implement create_coip_pool
    throw new Error("create_coip_pool not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_coip_pool failed");
  }
}

/** Create customer gateway. */
export async function createCustomerGateway(typeValue: string): Promise<CreateCustomerGatewayResult> {
  try {
    // TODO: implement create_customer_gateway
    throw new Error("create_customer_gateway not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_customer_gateway failed");
  }
}

/** Create default subnet. */
export async function createDefaultSubnet(): Promise<CreateDefaultSubnetResult> {
  try {
    // TODO: implement create_default_subnet
    throw new Error("create_default_subnet not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_default_subnet failed");
  }
}

/** Create default vpc. */
export async function createDefaultVpc(regionName?: string | undefined): Promise<CreateDefaultVpcResult> {
  try {
    // TODO: implement create_default_vpc
    throw new Error("create_default_vpc not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_default_vpc failed");
  }
}

/** Create delegate mac volume ownership task. */
export async function createDelegateMacVolumeOwnershipTask(instanceId: string, macCredentials: string): Promise<CreateDelegateMacVolumeOwnershipTaskResult> {
  try {
    // TODO: implement create_delegate_mac_volume_ownership_task
    throw new Error("create_delegate_mac_volume_ownership_task not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_delegate_mac_volume_ownership_task failed");
  }
}

/** Create dhcp options. */
export async function createDhcpOptions(dhcpConfigurations: Record<string, unknown>[]): Promise<CreateDhcpOptionsResult> {
  try {
    // TODO: implement create_dhcp_options
    throw new Error("create_dhcp_options not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_dhcp_options failed");
  }
}

/** Create egress only internet gateway. */
export async function createEgressOnlyInternetGateway(vpcId: string): Promise<CreateEgressOnlyInternetGatewayResult> {
  try {
    // TODO: implement create_egress_only_internet_gateway
    throw new Error("create_egress_only_internet_gateway not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_egress_only_internet_gateway failed");
  }
}

/** Create fleet. */
export async function createFleet(launchTemplateConfigs: Record<string, unknown>[], targetCapacitySpecification: Record<string, unknown>): Promise<CreateFleetResult> {
  try {
    // TODO: implement create_fleet
    throw new Error("create_fleet not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_fleet failed");
  }
}

/** Create flow logs. */
export async function createFlowLogs(resourceIds: string[], resourceType: string): Promise<CreateFlowLogsResult> {
  try {
    // TODO: implement create_flow_logs
    throw new Error("create_flow_logs not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_flow_logs failed");
  }
}

/** Create fpga image. */
export async function createFpgaImage(inputStorageLocation: Record<string, unknown>): Promise<CreateFpgaImageResult> {
  try {
    // TODO: implement create_fpga_image
    throw new Error("create_fpga_image not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_fpga_image failed");
  }
}

/** Create image usage report. */
export async function createImageUsageReport(imageId: string, resourceTypes: Record<string, unknown>[]): Promise<CreateImageUsageReportResult> {
  try {
    // TODO: implement create_image_usage_report
    throw new Error("create_image_usage_report not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_image_usage_report failed");
  }
}

/** Create instance connect endpoint. */
export async function createInstanceConnectEndpoint(subnetId: string): Promise<CreateInstanceConnectEndpointResult> {
  try {
    // TODO: implement create_instance_connect_endpoint
    throw new Error("create_instance_connect_endpoint not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_instance_connect_endpoint failed");
  }
}

/** Create instance event window. */
export async function createInstanceEventWindow(): Promise<CreateInstanceEventWindowResult> {
  try {
    // TODO: implement create_instance_event_window
    throw new Error("create_instance_event_window not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_instance_event_window failed");
  }
}

/** Create instance export task. */
export async function createInstanceExportTask(instanceId: string, targetEnvironment: string, exportToS3Task: Record<string, unknown>): Promise<CreateInstanceExportTaskResult> {
  try {
    // TODO: implement create_instance_export_task
    throw new Error("create_instance_export_task not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_instance_export_task failed");
  }
}

/** Create internet gateway. */
export async function createInternetGateway(): Promise<CreateInternetGatewayResult> {
  try {
    // TODO: implement create_internet_gateway
    throw new Error("create_internet_gateway not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_internet_gateway failed");
  }
}

/** Create ipam. */
export async function createIpam(): Promise<CreateIpamResult> {
  try {
    // TODO: implement create_ipam
    throw new Error("create_ipam not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_ipam failed");
  }
}

/** Create ipam external resource verification token. */
export async function createIpamExternalResourceVerificationToken(ipamId: string): Promise<CreateIpamExternalResourceVerificationTokenResult> {
  try {
    // TODO: implement create_ipam_external_resource_verification_token
    throw new Error("create_ipam_external_resource_verification_token not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_ipam_external_resource_verification_token failed");
  }
}

/** Create ipam pool. */
export async function createIpamPool(ipamScopeId: string, addressFamily: string): Promise<CreateIpamPoolResult> {
  try {
    // TODO: implement create_ipam_pool
    throw new Error("create_ipam_pool not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_ipam_pool failed");
  }
}

/** Create ipam prefix list resolver. */
export async function createIpamPrefixListResolver(ipamId: string, addressFamily: string): Promise<CreateIpamPrefixListResolverResult> {
  try {
    // TODO: implement create_ipam_prefix_list_resolver
    throw new Error("create_ipam_prefix_list_resolver not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_ipam_prefix_list_resolver failed");
  }
}

/** Create ipam prefix list resolver target. */
export async function createIpamPrefixListResolverTarget(ipamPrefixListResolverId: string, prefixListId: string, prefixListRegion: string, trackLatestVersion: boolean): Promise<CreateIpamPrefixListResolverTargetResult> {
  try {
    // TODO: implement create_ipam_prefix_list_resolver_target
    throw new Error("create_ipam_prefix_list_resolver_target not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_ipam_prefix_list_resolver_target failed");
  }
}

/** Create ipam resource discovery. */
export async function createIpamResourceDiscovery(): Promise<CreateIpamResourceDiscoveryResult> {
  try {
    // TODO: implement create_ipam_resource_discovery
    throw new Error("create_ipam_resource_discovery not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_ipam_resource_discovery failed");
  }
}

/** Create ipam scope. */
export async function createIpamScope(ipamId: string): Promise<CreateIpamScopeResult> {
  try {
    // TODO: implement create_ipam_scope
    throw new Error("create_ipam_scope not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_ipam_scope failed");
  }
}

/** Create key pair. */
export async function createKeyPair(keyName: string): Promise<CreateKeyPairResult> {
  try {
    // TODO: implement create_key_pair
    throw new Error("create_key_pair not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_key_pair failed");
  }
}

/** Create launch template. */
export async function createLaunchTemplate(launchTemplateName: string, launchTemplateData: Record<string, unknown>): Promise<CreateLaunchTemplateResult> {
  try {
    // TODO: implement create_launch_template
    throw new Error("create_launch_template not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_launch_template failed");
  }
}

/** Create launch template version. */
export async function createLaunchTemplateVersion(launchTemplateData: Record<string, unknown>): Promise<CreateLaunchTemplateVersionResult> {
  try {
    // TODO: implement create_launch_template_version
    throw new Error("create_launch_template_version not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_launch_template_version failed");
  }
}

/** Create local gateway route. */
export async function createLocalGatewayRoute(localGatewayRouteTableId: string): Promise<CreateLocalGatewayRouteResult> {
  try {
    // TODO: implement create_local_gateway_route
    throw new Error("create_local_gateway_route not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_local_gateway_route failed");
  }
}

/** Create local gateway route table. */
export async function createLocalGatewayRouteTable(localGatewayId: string): Promise<CreateLocalGatewayRouteTableResult> {
  try {
    // TODO: implement create_local_gateway_route_table
    throw new Error("create_local_gateway_route_table not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_local_gateway_route_table failed");
  }
}

/** Create local gateway route table virtual interface group association. */
export async function createLocalGatewayRouteTableVirtualInterfaceGroupAssociation(localGatewayRouteTableId: string, localGatewayVirtualInterfaceGroupId: string): Promise<CreateLocalGatewayRouteTableVirtualInterfaceGroupAssociationResult> {
  try {
    // TODO: implement create_local_gateway_route_table_virtual_interface_group_association
    throw new Error("create_local_gateway_route_table_virtual_interface_group_association not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_local_gateway_route_table_virtual_interface_group_association failed");
  }
}

/** Create local gateway route table vpc association. */
export async function createLocalGatewayRouteTableVpcAssociation(localGatewayRouteTableId: string, vpcId: string): Promise<CreateLocalGatewayRouteTableVpcAssociationResult> {
  try {
    // TODO: implement create_local_gateway_route_table_vpc_association
    throw new Error("create_local_gateway_route_table_vpc_association not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_local_gateway_route_table_vpc_association failed");
  }
}

/** Create local gateway virtual interface. */
export async function createLocalGatewayVirtualInterface(localGatewayVirtualInterfaceGroupId: string, outpostLagId: string, vlan: number, localAddress: string, peerAddress: string): Promise<CreateLocalGatewayVirtualInterfaceResult> {
  try {
    // TODO: implement create_local_gateway_virtual_interface
    throw new Error("create_local_gateway_virtual_interface not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_local_gateway_virtual_interface failed");
  }
}

/** Create local gateway virtual interface group. */
export async function createLocalGatewayVirtualInterfaceGroup(localGatewayId: string): Promise<CreateLocalGatewayVirtualInterfaceGroupResult> {
  try {
    // TODO: implement create_local_gateway_virtual_interface_group
    throw new Error("create_local_gateway_virtual_interface_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_local_gateway_virtual_interface_group failed");
  }
}

/** Create mac system integrity protection modification task. */
export async function createMacSystemIntegrityProtectionModificationTask(instanceId: string, macSystemIntegrityProtectionStatus: string): Promise<CreateMacSystemIntegrityProtectionModificationTaskResult> {
  try {
    // TODO: implement create_mac_system_integrity_protection_modification_task
    throw new Error("create_mac_system_integrity_protection_modification_task not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_mac_system_integrity_protection_modification_task failed");
  }
}

/** Create managed prefix list. */
export async function createManagedPrefixList(prefixListName: string, maxEntries: number, addressFamily: string): Promise<CreateManagedPrefixListResult> {
  try {
    // TODO: implement create_managed_prefix_list
    throw new Error("create_managed_prefix_list not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_managed_prefix_list failed");
  }
}

/** Create nat gateway. */
export async function createNatGateway(subnetId: string): Promise<CreateNatGatewayResult> {
  try {
    // TODO: implement create_nat_gateway
    throw new Error("create_nat_gateway not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_nat_gateway failed");
  }
}

/** Create network acl. */
export async function createNetworkAcl(vpcId: string): Promise<CreateNetworkAclResult> {
  try {
    // TODO: implement create_network_acl
    throw new Error("create_network_acl not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_network_acl failed");
  }
}

/** Create network acl entry. */
export async function createNetworkAclEntry(networkAclId: string, ruleNumber: number, protocol: string, ruleAction: string, egress: boolean): Promise<void> {
  try {
    // TODO: implement create_network_acl_entry
    throw new Error("create_network_acl_entry not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_network_acl_entry failed");
  }
}

/** Create network insights access scope. */
export async function createNetworkInsightsAccessScope(clientToken: string): Promise<CreateNetworkInsightsAccessScopeResult> {
  try {
    // TODO: implement create_network_insights_access_scope
    throw new Error("create_network_insights_access_scope not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_network_insights_access_scope failed");
  }
}

/** Create network insights path. */
export async function createNetworkInsightsPath(source: string, protocol: string, clientToken: string): Promise<CreateNetworkInsightsPathResult> {
  try {
    // TODO: implement create_network_insights_path
    throw new Error("create_network_insights_path not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_network_insights_path failed");
  }
}

/** Create network interface. */
export async function createNetworkInterface(subnetId: string): Promise<CreateNetworkInterfaceResult> {
  try {
    // TODO: implement create_network_interface
    throw new Error("create_network_interface not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_network_interface failed");
  }
}

/** Create network interface permission. */
export async function createNetworkInterfacePermission(networkInterfaceId: string, permission: string): Promise<CreateNetworkInterfacePermissionResult> {
  try {
    // TODO: implement create_network_interface_permission
    throw new Error("create_network_interface_permission not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_network_interface_permission failed");
  }
}

/** Create placement group. */
export async function createPlacementGroup(): Promise<CreatePlacementGroupResult> {
  try {
    // TODO: implement create_placement_group
    throw new Error("create_placement_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_placement_group failed");
  }
}

/** Create public ipv4 pool. */
export async function createPublicIpv4Pool(): Promise<CreatePublicIpv4PoolResult> {
  try {
    // TODO: implement create_public_ipv4_pool
    throw new Error("create_public_ipv4_pool not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_public_ipv4_pool failed");
  }
}

/** Create replace root volume task. */
export async function createReplaceRootVolumeTask(instanceId: string): Promise<CreateReplaceRootVolumeTaskResult> {
  try {
    // TODO: implement create_replace_root_volume_task
    throw new Error("create_replace_root_volume_task not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_replace_root_volume_task failed");
  }
}

/** Create reserved instances listing. */
export async function createReservedInstancesListing(reservedInstancesId: string, instanceCount: number, priceSchedules: Record<string, unknown>[], clientToken: string, regionName?: string | undefined): Promise<CreateReservedInstancesListingResult> {
  try {
    // TODO: implement create_reserved_instances_listing
    throw new Error("create_reserved_instances_listing not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_reserved_instances_listing failed");
  }
}

/** Create restore image task. */
export async function createRestoreImageTask(bucket: string, objectKey: string): Promise<CreateRestoreImageTaskResult> {
  try {
    // TODO: implement create_restore_image_task
    throw new Error("create_restore_image_task not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_restore_image_task failed");
  }
}

/** Create route. */
export async function createRoute(routeTableId: string): Promise<CreateRouteResult> {
  try {
    // TODO: implement create_route
    throw new Error("create_route not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_route failed");
  }
}

/** Create route server. */
export async function createRouteServer(amazonSideAsn: number): Promise<CreateRouteServerResult> {
  try {
    // TODO: implement create_route_server
    throw new Error("create_route_server not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_route_server failed");
  }
}

/** Create route server endpoint. */
export async function createRouteServerEndpoint(routeServerId: string, subnetId: string): Promise<CreateRouteServerEndpointResult> {
  try {
    // TODO: implement create_route_server_endpoint
    throw new Error("create_route_server_endpoint not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_route_server_endpoint failed");
  }
}

/** Create route server peer. */
export async function createRouteServerPeer(routeServerEndpointId: string, peerAddress: string, bgpOptions: Record<string, unknown>): Promise<CreateRouteServerPeerResult> {
  try {
    // TODO: implement create_route_server_peer
    throw new Error("create_route_server_peer not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_route_server_peer failed");
  }
}

/** Create route table. */
export async function createRouteTable(vpcId: string): Promise<CreateRouteTableResult> {
  try {
    // TODO: implement create_route_table
    throw new Error("create_route_table not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_route_table failed");
  }
}

/** Create security group. */
export async function createSecurityGroup(description: string, groupName: string): Promise<CreateSecurityGroupResult> {
  try {
    // TODO: implement create_security_group
    throw new Error("create_security_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_security_group failed");
  }
}

/** Create snapshot. */
export async function createSnapshot(volumeId: string): Promise<CreateSnapshotResult> {
  try {
    // TODO: implement create_snapshot
    throw new Error("create_snapshot not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_snapshot failed");
  }
}

/** Create snapshots. */
export async function createSnapshots(instanceSpecification: Record<string, unknown>): Promise<CreateSnapshotsResult> {
  try {
    // TODO: implement create_snapshots
    throw new Error("create_snapshots not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_snapshots failed");
  }
}

/** Create spot datafeed subscription. */
export async function createSpotDatafeedSubscription(bucket: string): Promise<CreateSpotDatafeedSubscriptionResult> {
  try {
    // TODO: implement create_spot_datafeed_subscription
    throw new Error("create_spot_datafeed_subscription not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_spot_datafeed_subscription failed");
  }
}

/** Create store image task. */
export async function createStoreImageTask(imageId: string, bucket: string): Promise<CreateStoreImageTaskResult> {
  try {
    // TODO: implement create_store_image_task
    throw new Error("create_store_image_task not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_store_image_task failed");
  }
}

/** Create subnet. */
export async function createSubnet(vpcId: string): Promise<CreateSubnetResult> {
  try {
    // TODO: implement create_subnet
    throw new Error("create_subnet not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_subnet failed");
  }
}

/** Create subnet cidr reservation. */
export async function createSubnetCidrReservation(subnetId: string, cidr: string, reservationType: string): Promise<CreateSubnetCidrReservationResult> {
  try {
    // TODO: implement create_subnet_cidr_reservation
    throw new Error("create_subnet_cidr_reservation not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_subnet_cidr_reservation failed");
  }
}

/** Create tags. */
export async function createTags(resources: string[], tags: Record<string, unknown>[], regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement create_tags
    throw new Error("create_tags not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_tags failed");
  }
}

/** Create traffic mirror filter. */
export async function createTrafficMirrorFilter(): Promise<CreateTrafficMirrorFilterResult> {
  try {
    // TODO: implement create_traffic_mirror_filter
    throw new Error("create_traffic_mirror_filter not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_traffic_mirror_filter failed");
  }
}

/** Create traffic mirror filter rule. */
export async function createTrafficMirrorFilterRule(trafficMirrorFilterId: string, trafficDirection: string, ruleNumber: number, ruleAction: string, destinationCidrBlock: string, sourceCidrBlock: string): Promise<CreateTrafficMirrorFilterRuleResult> {
  try {
    // TODO: implement create_traffic_mirror_filter_rule
    throw new Error("create_traffic_mirror_filter_rule not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_traffic_mirror_filter_rule failed");
  }
}

/** Create traffic mirror session. */
export async function createTrafficMirrorSession(networkInterfaceId: string, trafficMirrorTargetId: string, trafficMirrorFilterId: string, sessionNumber: number): Promise<CreateTrafficMirrorSessionResult> {
  try {
    // TODO: implement create_traffic_mirror_session
    throw new Error("create_traffic_mirror_session not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_traffic_mirror_session failed");
  }
}

/** Create traffic mirror target. */
export async function createTrafficMirrorTarget(): Promise<CreateTrafficMirrorTargetResult> {
  try {
    // TODO: implement create_traffic_mirror_target
    throw new Error("create_traffic_mirror_target not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_traffic_mirror_target failed");
  }
}

/** Create transit gateway. */
export async function createTransitGateway(): Promise<CreateTransitGatewayResult> {
  try {
    // TODO: implement create_transit_gateway
    throw new Error("create_transit_gateway not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_transit_gateway failed");
  }
}

/** Create transit gateway connect. */
export async function createTransitGatewayConnect(transportTransitGatewayAttachmentId: string, options: Record<string, unknown>): Promise<CreateTransitGatewayConnectResult> {
  try {
    // TODO: implement create_transit_gateway_connect
    throw new Error("create_transit_gateway_connect not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_transit_gateway_connect failed");
  }
}

/** Create transit gateway connect peer. */
export async function createTransitGatewayConnectPeer(transitGatewayAttachmentId: string, peerAddress: string, insideCidrBlocks: string[]): Promise<CreateTransitGatewayConnectPeerResult> {
  try {
    // TODO: implement create_transit_gateway_connect_peer
    throw new Error("create_transit_gateway_connect_peer not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_transit_gateway_connect_peer failed");
  }
}

/** Create transit gateway multicast domain. */
export async function createTransitGatewayMulticastDomain(transitGatewayId: string): Promise<CreateTransitGatewayMulticastDomainResult> {
  try {
    // TODO: implement create_transit_gateway_multicast_domain
    throw new Error("create_transit_gateway_multicast_domain not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_transit_gateway_multicast_domain failed");
  }
}

/** Create transit gateway peering attachment. */
export async function createTransitGatewayPeeringAttachment(transitGatewayId: string, peerTransitGatewayId: string, peerAccountId: string, peerRegion: string): Promise<CreateTransitGatewayPeeringAttachmentResult> {
  try {
    // TODO: implement create_transit_gateway_peering_attachment
    throw new Error("create_transit_gateway_peering_attachment not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_transit_gateway_peering_attachment failed");
  }
}

/** Create transit gateway policy table. */
export async function createTransitGatewayPolicyTable(transitGatewayId: string): Promise<CreateTransitGatewayPolicyTableResult> {
  try {
    // TODO: implement create_transit_gateway_policy_table
    throw new Error("create_transit_gateway_policy_table not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_transit_gateway_policy_table failed");
  }
}

/** Create transit gateway prefix list reference. */
export async function createTransitGatewayPrefixListReference(transitGatewayRouteTableId: string, prefixListId: string): Promise<CreateTransitGatewayPrefixListReferenceResult> {
  try {
    // TODO: implement create_transit_gateway_prefix_list_reference
    throw new Error("create_transit_gateway_prefix_list_reference not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_transit_gateway_prefix_list_reference failed");
  }
}

/** Create transit gateway route. */
export async function createTransitGatewayRoute(destinationCidrBlock: string, transitGatewayRouteTableId: string): Promise<CreateTransitGatewayRouteResult> {
  try {
    // TODO: implement create_transit_gateway_route
    throw new Error("create_transit_gateway_route not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_transit_gateway_route failed");
  }
}

/** Create transit gateway route table. */
export async function createTransitGatewayRouteTable(transitGatewayId: string): Promise<CreateTransitGatewayRouteTableResult> {
  try {
    // TODO: implement create_transit_gateway_route_table
    throw new Error("create_transit_gateway_route_table not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_transit_gateway_route_table failed");
  }
}

/** Create transit gateway route table announcement. */
export async function createTransitGatewayRouteTableAnnouncement(transitGatewayRouteTableId: string, peeringAttachmentId: string): Promise<CreateTransitGatewayRouteTableAnnouncementResult> {
  try {
    // TODO: implement create_transit_gateway_route_table_announcement
    throw new Error("create_transit_gateway_route_table_announcement not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_transit_gateway_route_table_announcement failed");
  }
}

/** Create transit gateway vpc attachment. */
export async function createTransitGatewayVpcAttachment(transitGatewayId: string, vpcId: string, subnetIds: string[]): Promise<CreateTransitGatewayVpcAttachmentResult> {
  try {
    // TODO: implement create_transit_gateway_vpc_attachment
    throw new Error("create_transit_gateway_vpc_attachment not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_transit_gateway_vpc_attachment failed");
  }
}

/** Create verified access endpoint. */
export async function createVerifiedAccessEndpoint(verifiedAccessGroupId: string, endpointType: string, attachmentType: string): Promise<CreateVerifiedAccessEndpointResult> {
  try {
    // TODO: implement create_verified_access_endpoint
    throw new Error("create_verified_access_endpoint not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_verified_access_endpoint failed");
  }
}

/** Create verified access group. */
export async function createVerifiedAccessGroup(verifiedAccessInstanceId: string): Promise<CreateVerifiedAccessGroupResult> {
  try {
    // TODO: implement create_verified_access_group
    throw new Error("create_verified_access_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_verified_access_group failed");
  }
}

/** Create verified access instance. */
export async function createVerifiedAccessInstance(): Promise<CreateVerifiedAccessInstanceResult> {
  try {
    // TODO: implement create_verified_access_instance
    throw new Error("create_verified_access_instance not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_verified_access_instance failed");
  }
}

/** Create verified access trust provider. */
export async function createVerifiedAccessTrustProvider(trustProviderType: string, policyReferenceName: string): Promise<CreateVerifiedAccessTrustProviderResult> {
  try {
    // TODO: implement create_verified_access_trust_provider
    throw new Error("create_verified_access_trust_provider not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_verified_access_trust_provider failed");
  }
}

/** Create volume. */
export async function createVolume(): Promise<CreateVolumeResult> {
  try {
    // TODO: implement create_volume
    throw new Error("create_volume not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_volume failed");
  }
}

/** Create vpc. */
export async function createVpc(): Promise<CreateVpcResult> {
  try {
    // TODO: implement create_vpc
    throw new Error("create_vpc not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_vpc failed");
  }
}

/** Create vpc block public access exclusion. */
export async function createVpcBlockPublicAccessExclusion(internetGatewayExclusionMode: string): Promise<CreateVpcBlockPublicAccessExclusionResult> {
  try {
    // TODO: implement create_vpc_block_public_access_exclusion
    throw new Error("create_vpc_block_public_access_exclusion not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_vpc_block_public_access_exclusion failed");
  }
}

/** Create vpc endpoint. */
export async function createVpcEndpoint(vpcId: string): Promise<CreateVpcEndpointResult> {
  try {
    // TODO: implement create_vpc_endpoint
    throw new Error("create_vpc_endpoint not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_vpc_endpoint failed");
  }
}

/** Create vpc endpoint connection notification. */
export async function createVpcEndpointConnectionNotification(connectionNotificationArn: string, connectionEvents: string[]): Promise<CreateVpcEndpointConnectionNotificationResult> {
  try {
    // TODO: implement create_vpc_endpoint_connection_notification
    throw new Error("create_vpc_endpoint_connection_notification not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_vpc_endpoint_connection_notification failed");
  }
}

/** Create vpc endpoint service configuration. */
export async function createVpcEndpointServiceConfiguration(): Promise<CreateVpcEndpointServiceConfigurationResult> {
  try {
    // TODO: implement create_vpc_endpoint_service_configuration
    throw new Error("create_vpc_endpoint_service_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_vpc_endpoint_service_configuration failed");
  }
}

/** Create vpc peering connection. */
export async function createVpcPeeringConnection(vpcId: string): Promise<CreateVpcPeeringConnectionResult> {
  try {
    // TODO: implement create_vpc_peering_connection
    throw new Error("create_vpc_peering_connection not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_vpc_peering_connection failed");
  }
}

/** Create vpn connection. */
export async function createVpnConnection(customerGatewayId: string, typeValue: string): Promise<CreateVpnConnectionResult> {
  try {
    // TODO: implement create_vpn_connection
    throw new Error("create_vpn_connection not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_vpn_connection failed");
  }
}

/** Create vpn connection route. */
export async function createVpnConnectionRoute(destinationCidrBlock: string, vpnConnectionId: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement create_vpn_connection_route
    throw new Error("create_vpn_connection_route not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_vpn_connection_route failed");
  }
}

/** Create vpn gateway. */
export async function createVpnGateway(typeValue: string): Promise<CreateVpnGatewayResult> {
  try {
    // TODO: implement create_vpn_gateway
    throw new Error("create_vpn_gateway not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_vpn_gateway failed");
  }
}

/** Delete capacity manager data export. */
export async function deleteCapacityManagerDataExport(capacityManagerDataExportId: string, regionName?: string | undefined): Promise<DeleteCapacityManagerDataExportResult> {
  try {
    // TODO: implement delete_capacity_manager_data_export
    throw new Error("delete_capacity_manager_data_export not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_capacity_manager_data_export failed");
  }
}

/** Delete carrier gateway. */
export async function deleteCarrierGateway(carrierGatewayId: string, regionName?: string | undefined): Promise<DeleteCarrierGatewayResult> {
  try {
    // TODO: implement delete_carrier_gateway
    throw new Error("delete_carrier_gateway not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_carrier_gateway failed");
  }
}

/** Delete client vpn endpoint. */
export async function deleteClientVpnEndpoint(clientVpnEndpointId: string, regionName?: string | undefined): Promise<DeleteClientVpnEndpointResult> {
  try {
    // TODO: implement delete_client_vpn_endpoint
    throw new Error("delete_client_vpn_endpoint not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_client_vpn_endpoint failed");
  }
}

/** Delete client vpn route. */
export async function deleteClientVpnRoute(clientVpnEndpointId: string, destinationCidrBlock: string): Promise<DeleteClientVpnRouteResult> {
  try {
    // TODO: implement delete_client_vpn_route
    throw new Error("delete_client_vpn_route not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_client_vpn_route failed");
  }
}

/** Delete coip cidr. */
export async function deleteCoipCidr(cidr: string, coipPoolId: string, regionName?: string | undefined): Promise<DeleteCoipCidrResult> {
  try {
    // TODO: implement delete_coip_cidr
    throw new Error("delete_coip_cidr not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_coip_cidr failed");
  }
}

/** Delete coip pool. */
export async function deleteCoipPool(coipPoolId: string, regionName?: string | undefined): Promise<DeleteCoipPoolResult> {
  try {
    // TODO: implement delete_coip_pool
    throw new Error("delete_coip_pool not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_coip_pool failed");
  }
}

/** Delete customer gateway. */
export async function deleteCustomerGateway(customerGatewayId: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_customer_gateway
    throw new Error("delete_customer_gateway not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_customer_gateway failed");
  }
}

/** Delete dhcp options. */
export async function deleteDhcpOptions(dhcpOptionsId: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_dhcp_options
    throw new Error("delete_dhcp_options not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_dhcp_options failed");
  }
}

/** Delete egress only internet gateway. */
export async function deleteEgressOnlyInternetGateway(egressOnlyInternetGatewayId: string, regionName?: string | undefined): Promise<DeleteEgressOnlyInternetGatewayResult> {
  try {
    // TODO: implement delete_egress_only_internet_gateway
    throw new Error("delete_egress_only_internet_gateway not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_egress_only_internet_gateway failed");
  }
}

/** Delete fleets. */
export async function deleteFleets(fleetIds: string[], terminateInstances: boolean, regionName?: string | undefined): Promise<DeleteFleetsResult> {
  try {
    // TODO: implement delete_fleets
    throw new Error("delete_fleets not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_fleets failed");
  }
}

/** Delete flow logs. */
export async function deleteFlowLogs(flowLogIds: string[], regionName?: string | undefined): Promise<DeleteFlowLogsResult> {
  try {
    // TODO: implement delete_flow_logs
    throw new Error("delete_flow_logs not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_flow_logs failed");
  }
}

/** Delete fpga image. */
export async function deleteFpgaImage(fpgaImageId: string, regionName?: string | undefined): Promise<DeleteFpgaImageResult> {
  try {
    // TODO: implement delete_fpga_image
    throw new Error("delete_fpga_image not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_fpga_image failed");
  }
}

/** Delete image usage report. */
export async function deleteImageUsageReport(reportId: string, regionName?: string | undefined): Promise<DeleteImageUsageReportResult> {
  try {
    // TODO: implement delete_image_usage_report
    throw new Error("delete_image_usage_report not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_image_usage_report failed");
  }
}

/** Delete instance connect endpoint. */
export async function deleteInstanceConnectEndpoint(instanceConnectEndpointId: string, regionName?: string | undefined): Promise<DeleteInstanceConnectEndpointResult> {
  try {
    // TODO: implement delete_instance_connect_endpoint
    throw new Error("delete_instance_connect_endpoint not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_instance_connect_endpoint failed");
  }
}

/** Delete instance event window. */
export async function deleteInstanceEventWindow(instanceEventWindowId: string): Promise<DeleteInstanceEventWindowResult> {
  try {
    // TODO: implement delete_instance_event_window
    throw new Error("delete_instance_event_window not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_instance_event_window failed");
  }
}

/** Delete internet gateway. */
export async function deleteInternetGateway(internetGatewayId: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_internet_gateway
    throw new Error("delete_internet_gateway not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_internet_gateway failed");
  }
}

/** Delete ipam. */
export async function deleteIpam(ipamId: string): Promise<DeleteIpamResult> {
  try {
    // TODO: implement delete_ipam
    throw new Error("delete_ipam not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_ipam failed");
  }
}

/** Delete ipam external resource verification token. */
export async function deleteIpamExternalResourceVerificationToken(ipamExternalResourceVerificationTokenId: string, regionName?: string | undefined): Promise<DeleteIpamExternalResourceVerificationTokenResult> {
  try {
    // TODO: implement delete_ipam_external_resource_verification_token
    throw new Error("delete_ipam_external_resource_verification_token not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_ipam_external_resource_verification_token failed");
  }
}

/** Delete ipam pool. */
export async function deleteIpamPool(ipamPoolId: string): Promise<DeleteIpamPoolResult> {
  try {
    // TODO: implement delete_ipam_pool
    throw new Error("delete_ipam_pool not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_ipam_pool failed");
  }
}

/** Delete ipam prefix list resolver. */
export async function deleteIpamPrefixListResolver(ipamPrefixListResolverId: string, regionName?: string | undefined): Promise<DeleteIpamPrefixListResolverResult> {
  try {
    // TODO: implement delete_ipam_prefix_list_resolver
    throw new Error("delete_ipam_prefix_list_resolver not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_ipam_prefix_list_resolver failed");
  }
}

/** Delete ipam prefix list resolver target. */
export async function deleteIpamPrefixListResolverTarget(ipamPrefixListResolverTargetId: string, regionName?: string | undefined): Promise<DeleteIpamPrefixListResolverTargetResult> {
  try {
    // TODO: implement delete_ipam_prefix_list_resolver_target
    throw new Error("delete_ipam_prefix_list_resolver_target not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_ipam_prefix_list_resolver_target failed");
  }
}

/** Delete ipam resource discovery. */
export async function deleteIpamResourceDiscovery(ipamResourceDiscoveryId: string, regionName?: string | undefined): Promise<DeleteIpamResourceDiscoveryResult> {
  try {
    // TODO: implement delete_ipam_resource_discovery
    throw new Error("delete_ipam_resource_discovery not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_ipam_resource_discovery failed");
  }
}

/** Delete ipam scope. */
export async function deleteIpamScope(ipamScopeId: string, regionName?: string | undefined): Promise<DeleteIpamScopeResult> {
  try {
    // TODO: implement delete_ipam_scope
    throw new Error("delete_ipam_scope not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_ipam_scope failed");
  }
}

/** Delete key pair. */
export async function deleteKeyPair(): Promise<DeleteKeyPairResult> {
  try {
    // TODO: implement delete_key_pair
    throw new Error("delete_key_pair not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_key_pair failed");
  }
}

/** Delete launch template. */
export async function deleteLaunchTemplate(): Promise<DeleteLaunchTemplateResult> {
  try {
    // TODO: implement delete_launch_template
    throw new Error("delete_launch_template not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_launch_template failed");
  }
}

/** Delete launch template versions. */
export async function deleteLaunchTemplateVersions(versions: string[]): Promise<DeleteLaunchTemplateVersionsResult> {
  try {
    // TODO: implement delete_launch_template_versions
    throw new Error("delete_launch_template_versions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_launch_template_versions failed");
  }
}

/** Delete local gateway route. */
export async function deleteLocalGatewayRoute(localGatewayRouteTableId: string): Promise<DeleteLocalGatewayRouteResult> {
  try {
    // TODO: implement delete_local_gateway_route
    throw new Error("delete_local_gateway_route not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_local_gateway_route failed");
  }
}

/** Delete local gateway route table. */
export async function deleteLocalGatewayRouteTable(localGatewayRouteTableId: string, regionName?: string | undefined): Promise<DeleteLocalGatewayRouteTableResult> {
  try {
    // TODO: implement delete_local_gateway_route_table
    throw new Error("delete_local_gateway_route_table not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_local_gateway_route_table failed");
  }
}

/** Delete local gateway route table virtual interface group association. */
export async function deleteLocalGatewayRouteTableVirtualInterfaceGroupAssociation(localGatewayRouteTableVirtualInterfaceGroupAssociationId: string, regionName?: string | undefined): Promise<DeleteLocalGatewayRouteTableVirtualInterfaceGroupAssociationResult> {
  try {
    // TODO: implement delete_local_gateway_route_table_virtual_interface_group_association
    throw new Error("delete_local_gateway_route_table_virtual_interface_group_association not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_local_gateway_route_table_virtual_interface_group_association failed");
  }
}

/** Delete local gateway route table vpc association. */
export async function deleteLocalGatewayRouteTableVpcAssociation(localGatewayRouteTableVpcAssociationId: string, regionName?: string | undefined): Promise<DeleteLocalGatewayRouteTableVpcAssociationResult> {
  try {
    // TODO: implement delete_local_gateway_route_table_vpc_association
    throw new Error("delete_local_gateway_route_table_vpc_association not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_local_gateway_route_table_vpc_association failed");
  }
}

/** Delete local gateway virtual interface. */
export async function deleteLocalGatewayVirtualInterface(localGatewayVirtualInterfaceId: string, regionName?: string | undefined): Promise<DeleteLocalGatewayVirtualInterfaceResult> {
  try {
    // TODO: implement delete_local_gateway_virtual_interface
    throw new Error("delete_local_gateway_virtual_interface not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_local_gateway_virtual_interface failed");
  }
}

/** Delete local gateway virtual interface group. */
export async function deleteLocalGatewayVirtualInterfaceGroup(localGatewayVirtualInterfaceGroupId: string, regionName?: string | undefined): Promise<DeleteLocalGatewayVirtualInterfaceGroupResult> {
  try {
    // TODO: implement delete_local_gateway_virtual_interface_group
    throw new Error("delete_local_gateway_virtual_interface_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_local_gateway_virtual_interface_group failed");
  }
}

/** Delete managed prefix list. */
export async function deleteManagedPrefixList(prefixListId: string, regionName?: string | undefined): Promise<DeleteManagedPrefixListResult> {
  try {
    // TODO: implement delete_managed_prefix_list
    throw new Error("delete_managed_prefix_list not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_managed_prefix_list failed");
  }
}

/** Delete nat gateway. */
export async function deleteNatGateway(natGatewayId: string, regionName?: string | undefined): Promise<DeleteNatGatewayResult> {
  try {
    // TODO: implement delete_nat_gateway
    throw new Error("delete_nat_gateway not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_nat_gateway failed");
  }
}

/** Delete network acl. */
export async function deleteNetworkAcl(networkAclId: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_network_acl
    throw new Error("delete_network_acl not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_network_acl failed");
  }
}

/** Delete network acl entry. */
export async function deleteNetworkAclEntry(networkAclId: string, ruleNumber: number, egress: boolean, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_network_acl_entry
    throw new Error("delete_network_acl_entry not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_network_acl_entry failed");
  }
}

/** Delete network insights access scope. */
export async function deleteNetworkInsightsAccessScope(networkInsightsAccessScopeId: string, regionName?: string | undefined): Promise<DeleteNetworkInsightsAccessScopeResult> {
  try {
    // TODO: implement delete_network_insights_access_scope
    throw new Error("delete_network_insights_access_scope not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_network_insights_access_scope failed");
  }
}

/** Delete network insights access scope analysis. */
export async function deleteNetworkInsightsAccessScopeAnalysis(networkInsightsAccessScopeAnalysisId: string, regionName?: string | undefined): Promise<DeleteNetworkInsightsAccessScopeAnalysisResult> {
  try {
    // TODO: implement delete_network_insights_access_scope_analysis
    throw new Error("delete_network_insights_access_scope_analysis not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_network_insights_access_scope_analysis failed");
  }
}

/** Delete network insights analysis. */
export async function deleteNetworkInsightsAnalysis(networkInsightsAnalysisId: string, regionName?: string | undefined): Promise<DeleteNetworkInsightsAnalysisResult> {
  try {
    // TODO: implement delete_network_insights_analysis
    throw new Error("delete_network_insights_analysis not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_network_insights_analysis failed");
  }
}

/** Delete network insights path. */
export async function deleteNetworkInsightsPath(networkInsightsPathId: string, regionName?: string | undefined): Promise<DeleteNetworkInsightsPathResult> {
  try {
    // TODO: implement delete_network_insights_path
    throw new Error("delete_network_insights_path not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_network_insights_path failed");
  }
}

/** Delete network interface. */
export async function deleteNetworkInterface(networkInterfaceId: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_network_interface
    throw new Error("delete_network_interface not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_network_interface failed");
  }
}

/** Delete network interface permission. */
export async function deleteNetworkInterfacePermission(networkInterfacePermissionId: string): Promise<DeleteNetworkInterfacePermissionResult> {
  try {
    // TODO: implement delete_network_interface_permission
    throw new Error("delete_network_interface_permission not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_network_interface_permission failed");
  }
}

/** Delete placement group. */
export async function deletePlacementGroup(groupName: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_placement_group
    throw new Error("delete_placement_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_placement_group failed");
  }
}

/** Delete public ipv4 pool. */
export async function deletePublicIpv4Pool(poolId: string): Promise<DeletePublicIpv4PoolResult> {
  try {
    // TODO: implement delete_public_ipv4_pool
    throw new Error("delete_public_ipv4_pool not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_public_ipv4_pool failed");
  }
}

/** Delete queued reserved instances. */
export async function deleteQueuedReservedInstances(reservedInstancesIds: string[], regionName?: string | undefined): Promise<DeleteQueuedReservedInstancesResult> {
  try {
    // TODO: implement delete_queued_reserved_instances
    throw new Error("delete_queued_reserved_instances not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_queued_reserved_instances failed");
  }
}

/** Delete route. */
export async function deleteRoute(routeTableId: string): Promise<void> {
  try {
    // TODO: implement delete_route
    throw new Error("delete_route not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_route failed");
  }
}

/** Delete route server. */
export async function deleteRouteServer(routeServerId: string, regionName?: string | undefined): Promise<DeleteRouteServerResult> {
  try {
    // TODO: implement delete_route_server
    throw new Error("delete_route_server not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_route_server failed");
  }
}

/** Delete route server endpoint. */
export async function deleteRouteServerEndpoint(routeServerEndpointId: string, regionName?: string | undefined): Promise<DeleteRouteServerEndpointResult> {
  try {
    // TODO: implement delete_route_server_endpoint
    throw new Error("delete_route_server_endpoint not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_route_server_endpoint failed");
  }
}

/** Delete route server peer. */
export async function deleteRouteServerPeer(routeServerPeerId: string, regionName?: string | undefined): Promise<DeleteRouteServerPeerResult> {
  try {
    // TODO: implement delete_route_server_peer
    throw new Error("delete_route_server_peer not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_route_server_peer failed");
  }
}

/** Delete route table. */
export async function deleteRouteTable(routeTableId: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_route_table
    throw new Error("delete_route_table not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_route_table failed");
  }
}

/** Delete security group. */
export async function deleteSecurityGroup(): Promise<DeleteSecurityGroupResult> {
  try {
    // TODO: implement delete_security_group
    throw new Error("delete_security_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_security_group failed");
  }
}

/** Delete snapshot. */
export async function deleteSnapshot(snapshotId: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_snapshot
    throw new Error("delete_snapshot not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_snapshot failed");
  }
}

/** Delete spot datafeed subscription. */
export async function deleteSpotDatafeedSubscription(regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_spot_datafeed_subscription
    throw new Error("delete_spot_datafeed_subscription not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_spot_datafeed_subscription failed");
  }
}

/** Delete subnet. */
export async function deleteSubnet(subnetId: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_subnet
    throw new Error("delete_subnet not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_subnet failed");
  }
}

/** Delete subnet cidr reservation. */
export async function deleteSubnetCidrReservation(subnetCidrReservationId: string, regionName?: string | undefined): Promise<DeleteSubnetCidrReservationResult> {
  try {
    // TODO: implement delete_subnet_cidr_reservation
    throw new Error("delete_subnet_cidr_reservation not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_subnet_cidr_reservation failed");
  }
}

/** Delete tags. */
export async function deleteTags(resources: string[]): Promise<void> {
  try {
    // TODO: implement delete_tags
    throw new Error("delete_tags not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_tags failed");
  }
}

/** Delete traffic mirror filter. */
export async function deleteTrafficMirrorFilter(trafficMirrorFilterId: string, regionName?: string | undefined): Promise<DeleteTrafficMirrorFilterResult> {
  try {
    // TODO: implement delete_traffic_mirror_filter
    throw new Error("delete_traffic_mirror_filter not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_traffic_mirror_filter failed");
  }
}

/** Delete traffic mirror filter rule. */
export async function deleteTrafficMirrorFilterRule(trafficMirrorFilterRuleId: string, regionName?: string | undefined): Promise<DeleteTrafficMirrorFilterRuleResult> {
  try {
    // TODO: implement delete_traffic_mirror_filter_rule
    throw new Error("delete_traffic_mirror_filter_rule not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_traffic_mirror_filter_rule failed");
  }
}

/** Delete traffic mirror session. */
export async function deleteTrafficMirrorSession(trafficMirrorSessionId: string, regionName?: string | undefined): Promise<DeleteTrafficMirrorSessionResult> {
  try {
    // TODO: implement delete_traffic_mirror_session
    throw new Error("delete_traffic_mirror_session not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_traffic_mirror_session failed");
  }
}

/** Delete traffic mirror target. */
export async function deleteTrafficMirrorTarget(trafficMirrorTargetId: string, regionName?: string | undefined): Promise<DeleteTrafficMirrorTargetResult> {
  try {
    // TODO: implement delete_traffic_mirror_target
    throw new Error("delete_traffic_mirror_target not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_traffic_mirror_target failed");
  }
}

/** Delete transit gateway. */
export async function deleteTransitGateway(transitGatewayId: string, regionName?: string | undefined): Promise<DeleteTransitGatewayResult> {
  try {
    // TODO: implement delete_transit_gateway
    throw new Error("delete_transit_gateway not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_transit_gateway failed");
  }
}

/** Delete transit gateway connect. */
export async function deleteTransitGatewayConnect(transitGatewayAttachmentId: string, regionName?: string | undefined): Promise<DeleteTransitGatewayConnectResult> {
  try {
    // TODO: implement delete_transit_gateway_connect
    throw new Error("delete_transit_gateway_connect not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_transit_gateway_connect failed");
  }
}

/** Delete transit gateway connect peer. */
export async function deleteTransitGatewayConnectPeer(transitGatewayConnectPeerId: string, regionName?: string | undefined): Promise<DeleteTransitGatewayConnectPeerResult> {
  try {
    // TODO: implement delete_transit_gateway_connect_peer
    throw new Error("delete_transit_gateway_connect_peer not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_transit_gateway_connect_peer failed");
  }
}

/** Delete transit gateway multicast domain. */
export async function deleteTransitGatewayMulticastDomain(transitGatewayMulticastDomainId: string, regionName?: string | undefined): Promise<DeleteTransitGatewayMulticastDomainResult> {
  try {
    // TODO: implement delete_transit_gateway_multicast_domain
    throw new Error("delete_transit_gateway_multicast_domain not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_transit_gateway_multicast_domain failed");
  }
}

/** Delete transit gateway peering attachment. */
export async function deleteTransitGatewayPeeringAttachment(transitGatewayAttachmentId: string, regionName?: string | undefined): Promise<DeleteTransitGatewayPeeringAttachmentResult> {
  try {
    // TODO: implement delete_transit_gateway_peering_attachment
    throw new Error("delete_transit_gateway_peering_attachment not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_transit_gateway_peering_attachment failed");
  }
}

/** Delete transit gateway policy table. */
export async function deleteTransitGatewayPolicyTable(transitGatewayPolicyTableId: string, regionName?: string | undefined): Promise<DeleteTransitGatewayPolicyTableResult> {
  try {
    // TODO: implement delete_transit_gateway_policy_table
    throw new Error("delete_transit_gateway_policy_table not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_transit_gateway_policy_table failed");
  }
}

/** Delete transit gateway prefix list reference. */
export async function deleteTransitGatewayPrefixListReference(transitGatewayRouteTableId: string, prefixListId: string, regionName?: string | undefined): Promise<DeleteTransitGatewayPrefixListReferenceResult> {
  try {
    // TODO: implement delete_transit_gateway_prefix_list_reference
    throw new Error("delete_transit_gateway_prefix_list_reference not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_transit_gateway_prefix_list_reference failed");
  }
}

/** Delete transit gateway route. */
export async function deleteTransitGatewayRoute(transitGatewayRouteTableId: string, destinationCidrBlock: string, regionName?: string | undefined): Promise<DeleteTransitGatewayRouteResult> {
  try {
    // TODO: implement delete_transit_gateway_route
    throw new Error("delete_transit_gateway_route not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_transit_gateway_route failed");
  }
}

/** Delete transit gateway route table. */
export async function deleteTransitGatewayRouteTable(transitGatewayRouteTableId: string, regionName?: string | undefined): Promise<DeleteTransitGatewayRouteTableResult> {
  try {
    // TODO: implement delete_transit_gateway_route_table
    throw new Error("delete_transit_gateway_route_table not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_transit_gateway_route_table failed");
  }
}

/** Delete transit gateway route table announcement. */
export async function deleteTransitGatewayRouteTableAnnouncement(transitGatewayRouteTableAnnouncementId: string, regionName?: string | undefined): Promise<DeleteTransitGatewayRouteTableAnnouncementResult> {
  try {
    // TODO: implement delete_transit_gateway_route_table_announcement
    throw new Error("delete_transit_gateway_route_table_announcement not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_transit_gateway_route_table_announcement failed");
  }
}

/** Delete transit gateway vpc attachment. */
export async function deleteTransitGatewayVpcAttachment(transitGatewayAttachmentId: string, regionName?: string | undefined): Promise<DeleteTransitGatewayVpcAttachmentResult> {
  try {
    // TODO: implement delete_transit_gateway_vpc_attachment
    throw new Error("delete_transit_gateway_vpc_attachment not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_transit_gateway_vpc_attachment failed");
  }
}

/** Delete verified access endpoint. */
export async function deleteVerifiedAccessEndpoint(verifiedAccessEndpointId: string): Promise<DeleteVerifiedAccessEndpointResult> {
  try {
    // TODO: implement delete_verified_access_endpoint
    throw new Error("delete_verified_access_endpoint not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_verified_access_endpoint failed");
  }
}

/** Delete verified access group. */
export async function deleteVerifiedAccessGroup(verifiedAccessGroupId: string): Promise<DeleteVerifiedAccessGroupResult> {
  try {
    // TODO: implement delete_verified_access_group
    throw new Error("delete_verified_access_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_verified_access_group failed");
  }
}

/** Delete verified access instance. */
export async function deleteVerifiedAccessInstance(verifiedAccessInstanceId: string): Promise<DeleteVerifiedAccessInstanceResult> {
  try {
    // TODO: implement delete_verified_access_instance
    throw new Error("delete_verified_access_instance not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_verified_access_instance failed");
  }
}

/** Delete verified access trust provider. */
export async function deleteVerifiedAccessTrustProvider(verifiedAccessTrustProviderId: string): Promise<DeleteVerifiedAccessTrustProviderResult> {
  try {
    // TODO: implement delete_verified_access_trust_provider
    throw new Error("delete_verified_access_trust_provider not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_verified_access_trust_provider failed");
  }
}

/** Delete volume. */
export async function deleteVolume(volumeId: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_volume
    throw new Error("delete_volume not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_volume failed");
  }
}

/** Delete vpc. */
export async function deleteVpc(vpcId: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_vpc
    throw new Error("delete_vpc not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_vpc failed");
  }
}

/** Delete vpc block public access exclusion. */
export async function deleteVpcBlockPublicAccessExclusion(exclusionId: string, regionName?: string | undefined): Promise<DeleteVpcBlockPublicAccessExclusionResult> {
  try {
    // TODO: implement delete_vpc_block_public_access_exclusion
    throw new Error("delete_vpc_block_public_access_exclusion not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_vpc_block_public_access_exclusion failed");
  }
}

/** Delete vpc endpoint connection notifications. */
export async function deleteVpcEndpointConnectionNotifications(connectionNotificationIds: string[], regionName?: string | undefined): Promise<DeleteVpcEndpointConnectionNotificationsResult> {
  try {
    // TODO: implement delete_vpc_endpoint_connection_notifications
    throw new Error("delete_vpc_endpoint_connection_notifications not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_vpc_endpoint_connection_notifications failed");
  }
}

/** Delete vpc endpoint service configurations. */
export async function deleteVpcEndpointServiceConfigurations(serviceIds: string[], regionName?: string | undefined): Promise<DeleteVpcEndpointServiceConfigurationsResult> {
  try {
    // TODO: implement delete_vpc_endpoint_service_configurations
    throw new Error("delete_vpc_endpoint_service_configurations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_vpc_endpoint_service_configurations failed");
  }
}

/** Delete vpc endpoints. */
export async function deleteVpcEndpoints(vpcEndpointIds: string[], regionName?: string | undefined): Promise<DeleteVpcEndpointsResult> {
  try {
    // TODO: implement delete_vpc_endpoints
    throw new Error("delete_vpc_endpoints not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_vpc_endpoints failed");
  }
}

/** Delete vpc peering connection. */
export async function deleteVpcPeeringConnection(vpcPeeringConnectionId: string, regionName?: string | undefined): Promise<DeleteVpcPeeringConnectionResult> {
  try {
    // TODO: implement delete_vpc_peering_connection
    throw new Error("delete_vpc_peering_connection not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_vpc_peering_connection failed");
  }
}

/** Delete vpn connection. */
export async function deleteVpnConnection(vpnConnectionId: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_vpn_connection
    throw new Error("delete_vpn_connection not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_vpn_connection failed");
  }
}

/** Delete vpn connection route. */
export async function deleteVpnConnectionRoute(destinationCidrBlock: string, vpnConnectionId: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_vpn_connection_route
    throw new Error("delete_vpn_connection_route not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_vpn_connection_route failed");
  }
}

/** Delete vpn gateway. */
export async function deleteVpnGateway(vpnGatewayId: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_vpn_gateway
    throw new Error("delete_vpn_gateway not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_vpn_gateway failed");
  }
}

/** Deprovision byoip cidr. */
export async function deprovisionByoipCidr(cidr: string, regionName?: string | undefined): Promise<DeprovisionByoipCidrResult> {
  try {
    // TODO: implement deprovision_byoip_cidr
    throw new Error("deprovision_byoip_cidr not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "deprovision_byoip_cidr failed");
  }
}

/** Deprovision ipam byoasn. */
export async function deprovisionIpamByoasn(ipamId: string, asn: string, regionName?: string | undefined): Promise<DeprovisionIpamByoasnResult> {
  try {
    // TODO: implement deprovision_ipam_byoasn
    throw new Error("deprovision_ipam_byoasn not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "deprovision_ipam_byoasn failed");
  }
}

/** Deprovision ipam pool cidr. */
export async function deprovisionIpamPoolCidr(ipamPoolId: string): Promise<DeprovisionIpamPoolCidrResult> {
  try {
    // TODO: implement deprovision_ipam_pool_cidr
    throw new Error("deprovision_ipam_pool_cidr not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "deprovision_ipam_pool_cidr failed");
  }
}

/** Deprovision public ipv4 pool cidr. */
export async function deprovisionPublicIpv4PoolCidr(poolId: string, cidr: string, regionName?: string | undefined): Promise<DeprovisionPublicIpv4PoolCidrResult> {
  try {
    // TODO: implement deprovision_public_ipv4_pool_cidr
    throw new Error("deprovision_public_ipv4_pool_cidr not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "deprovision_public_ipv4_pool_cidr failed");
  }
}

/** Deregister image. */
export async function deregisterImage(imageId: string): Promise<DeregisterImageResult> {
  try {
    // TODO: implement deregister_image
    throw new Error("deregister_image not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "deregister_image failed");
  }
}

/** Deregister instance event notification attributes. */
export async function deregisterInstanceEventNotificationAttributes(instanceTagAttribute: Record<string, unknown>, regionName?: string | undefined): Promise<DeregisterInstanceEventNotificationAttributesResult> {
  try {
    // TODO: implement deregister_instance_event_notification_attributes
    throw new Error("deregister_instance_event_notification_attributes not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "deregister_instance_event_notification_attributes failed");
  }
}

/** Deregister transit gateway multicast group members. */
export async function deregisterTransitGatewayMulticastGroupMembers(): Promise<DeregisterTransitGatewayMulticastGroupMembersResult> {
  try {
    // TODO: implement deregister_transit_gateway_multicast_group_members
    throw new Error("deregister_transit_gateway_multicast_group_members not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "deregister_transit_gateway_multicast_group_members failed");
  }
}

/** Deregister transit gateway multicast group sources. */
export async function deregisterTransitGatewayMulticastGroupSources(): Promise<DeregisterTransitGatewayMulticastGroupSourcesResult> {
  try {
    // TODO: implement deregister_transit_gateway_multicast_group_sources
    throw new Error("deregister_transit_gateway_multicast_group_sources not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "deregister_transit_gateway_multicast_group_sources failed");
  }
}

/** Describe account attributes. */
export async function describeAccountAttributes(): Promise<DescribeAccountAttributesResult> {
  try {
    // TODO: implement describe_account_attributes
    throw new Error("describe_account_attributes not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_account_attributes failed");
  }
}

/** Describe address transfers. */
export async function describeAddressTransfers(): Promise<DescribeAddressTransfersResult> {
  try {
    // TODO: implement describe_address_transfers
    throw new Error("describe_address_transfers not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_address_transfers failed");
  }
}

/** Describe addresses. */
export async function describeAddresses(): Promise<DescribeAddressesResult> {
  try {
    // TODO: implement describe_addresses
    throw new Error("describe_addresses not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_addresses failed");
  }
}

/** Describe addresses attribute. */
export async function describeAddressesAttribute(): Promise<DescribeAddressesAttributeResult> {
  try {
    // TODO: implement describe_addresses_attribute
    throw new Error("describe_addresses_attribute not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_addresses_attribute failed");
  }
}

/** Describe aggregate id format. */
export async function describeAggregateIdFormat(regionName?: string | undefined): Promise<DescribeAggregateIdFormatResult> {
  try {
    // TODO: implement describe_aggregate_id_format
    throw new Error("describe_aggregate_id_format not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_aggregate_id_format failed");
  }
}

/** Describe availability zones. */
export async function describeAvailabilityZones(): Promise<DescribeAvailabilityZonesResult> {
  try {
    // TODO: implement describe_availability_zones
    throw new Error("describe_availability_zones not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_availability_zones failed");
  }
}

/** Describe aws network performance metric subscriptions. */
export async function describeAwsNetworkPerformanceMetricSubscriptions(): Promise<DescribeAwsNetworkPerformanceMetricSubscriptionsResult> {
  try {
    // TODO: implement describe_aws_network_performance_metric_subscriptions
    throw new Error("describe_aws_network_performance_metric_subscriptions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_aws_network_performance_metric_subscriptions failed");
  }
}

/** Describe bundle tasks. */
export async function describeBundleTasks(): Promise<DescribeBundleTasksResult> {
  try {
    // TODO: implement describe_bundle_tasks
    throw new Error("describe_bundle_tasks not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_bundle_tasks failed");
  }
}

/** Describe byoip cidrs. */
export async function describeByoipCidrs(maxResults: number): Promise<DescribeByoipCidrsResult> {
  try {
    // TODO: implement describe_byoip_cidrs
    throw new Error("describe_byoip_cidrs not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_byoip_cidrs failed");
  }
}

/** Describe capacity block extension history. */
export async function describeCapacityBlockExtensionHistory(): Promise<DescribeCapacityBlockExtensionHistoryResult> {
  try {
    // TODO: implement describe_capacity_block_extension_history
    throw new Error("describe_capacity_block_extension_history not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_capacity_block_extension_history failed");
  }
}

/** Describe capacity block extension offerings. */
export async function describeCapacityBlockExtensionOfferings(capacityBlockExtensionDurationHours: number, capacityReservationId: string): Promise<DescribeCapacityBlockExtensionOfferingsResult> {
  try {
    // TODO: implement describe_capacity_block_extension_offerings
    throw new Error("describe_capacity_block_extension_offerings not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_capacity_block_extension_offerings failed");
  }
}

/** Describe capacity block offerings. */
export async function describeCapacityBlockOfferings(capacityDurationHours: number): Promise<DescribeCapacityBlockOfferingsResult> {
  try {
    // TODO: implement describe_capacity_block_offerings
    throw new Error("describe_capacity_block_offerings not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_capacity_block_offerings failed");
  }
}

/** Describe capacity block status. */
export async function describeCapacityBlockStatus(): Promise<DescribeCapacityBlockStatusResult> {
  try {
    // TODO: implement describe_capacity_block_status
    throw new Error("describe_capacity_block_status not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_capacity_block_status failed");
  }
}

/** Describe capacity blocks. */
export async function describeCapacityBlocks(): Promise<DescribeCapacityBlocksResult> {
  try {
    // TODO: implement describe_capacity_blocks
    throw new Error("describe_capacity_blocks not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_capacity_blocks failed");
  }
}

/** Describe capacity manager data exports. */
export async function describeCapacityManagerDataExports(): Promise<DescribeCapacityManagerDataExportsResult> {
  try {
    // TODO: implement describe_capacity_manager_data_exports
    throw new Error("describe_capacity_manager_data_exports not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_capacity_manager_data_exports failed");
  }
}

/** Describe capacity reservation billing requests. */
export async function describeCapacityReservationBillingRequests(role: string): Promise<DescribeCapacityReservationBillingRequestsResult> {
  try {
    // TODO: implement describe_capacity_reservation_billing_requests
    throw new Error("describe_capacity_reservation_billing_requests not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_capacity_reservation_billing_requests failed");
  }
}

/** Describe capacity reservation fleets. */
export async function describeCapacityReservationFleets(): Promise<DescribeCapacityReservationFleetsResult> {
  try {
    // TODO: implement describe_capacity_reservation_fleets
    throw new Error("describe_capacity_reservation_fleets not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_capacity_reservation_fleets failed");
  }
}

/** Describe capacity reservation topology. */
export async function describeCapacityReservationTopology(): Promise<DescribeCapacityReservationTopologyResult> {
  try {
    // TODO: implement describe_capacity_reservation_topology
    throw new Error("describe_capacity_reservation_topology not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_capacity_reservation_topology failed");
  }
}

/** Describe capacity reservations. */
export async function describeCapacityReservations(): Promise<DescribeCapacityReservationsResult> {
  try {
    // TODO: implement describe_capacity_reservations
    throw new Error("describe_capacity_reservations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_capacity_reservations failed");
  }
}

/** Describe carrier gateways. */
export async function describeCarrierGateways(): Promise<DescribeCarrierGatewaysResult> {
  try {
    // TODO: implement describe_carrier_gateways
    throw new Error("describe_carrier_gateways not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_carrier_gateways failed");
  }
}

/** Describe classic link instances. */
export async function describeClassicLinkInstances(): Promise<DescribeClassicLinkInstancesResult> {
  try {
    // TODO: implement describe_classic_link_instances
    throw new Error("describe_classic_link_instances not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_classic_link_instances failed");
  }
}

/** Describe client vpn authorization rules. */
export async function describeClientVpnAuthorizationRules(clientVpnEndpointId: string): Promise<DescribeClientVpnAuthorizationRulesResult> {
  try {
    // TODO: implement describe_client_vpn_authorization_rules
    throw new Error("describe_client_vpn_authorization_rules not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_client_vpn_authorization_rules failed");
  }
}

/** Describe client vpn connections. */
export async function describeClientVpnConnections(clientVpnEndpointId: string): Promise<DescribeClientVpnConnectionsResult> {
  try {
    // TODO: implement describe_client_vpn_connections
    throw new Error("describe_client_vpn_connections not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_client_vpn_connections failed");
  }
}

/** Describe client vpn endpoints. */
export async function describeClientVpnEndpoints(): Promise<DescribeClientVpnEndpointsResult> {
  try {
    // TODO: implement describe_client_vpn_endpoints
    throw new Error("describe_client_vpn_endpoints not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_client_vpn_endpoints failed");
  }
}

/** Describe client vpn routes. */
export async function describeClientVpnRoutes(clientVpnEndpointId: string): Promise<DescribeClientVpnRoutesResult> {
  try {
    // TODO: implement describe_client_vpn_routes
    throw new Error("describe_client_vpn_routes not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_client_vpn_routes failed");
  }
}

/** Describe client vpn target networks. */
export async function describeClientVpnTargetNetworks(clientVpnEndpointId: string): Promise<DescribeClientVpnTargetNetworksResult> {
  try {
    // TODO: implement describe_client_vpn_target_networks
    throw new Error("describe_client_vpn_target_networks not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_client_vpn_target_networks failed");
  }
}

/** Describe coip pools. */
export async function describeCoipPools(): Promise<DescribeCoipPoolsResult> {
  try {
    // TODO: implement describe_coip_pools
    throw new Error("describe_coip_pools not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_coip_pools failed");
  }
}

/** Describe conversion tasks. */
export async function describeConversionTasks(): Promise<DescribeConversionTasksResult> {
  try {
    // TODO: implement describe_conversion_tasks
    throw new Error("describe_conversion_tasks not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_conversion_tasks failed");
  }
}

/** Describe customer gateways. */
export async function describeCustomerGateways(): Promise<DescribeCustomerGatewaysResult> {
  try {
    // TODO: implement describe_customer_gateways
    throw new Error("describe_customer_gateways not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_customer_gateways failed");
  }
}

/** Describe declarative policies reports. */
export async function describeDeclarativePoliciesReports(): Promise<DescribeDeclarativePoliciesReportsResult> {
  try {
    // TODO: implement describe_declarative_policies_reports
    throw new Error("describe_declarative_policies_reports not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_declarative_policies_reports failed");
  }
}

/** Describe dhcp options. */
export async function describeDhcpOptions(): Promise<DescribeDhcpOptionsResult> {
  try {
    // TODO: implement describe_dhcp_options
    throw new Error("describe_dhcp_options not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_dhcp_options failed");
  }
}

/** Describe egress only internet gateways. */
export async function describeEgressOnlyInternetGateways(): Promise<DescribeEgressOnlyInternetGatewaysResult> {
  try {
    // TODO: implement describe_egress_only_internet_gateways
    throw new Error("describe_egress_only_internet_gateways not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_egress_only_internet_gateways failed");
  }
}

/** Describe elastic gpus. */
export async function describeElasticGpus(): Promise<DescribeElasticGpusResult> {
  try {
    // TODO: implement describe_elastic_gpus
    throw new Error("describe_elastic_gpus not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_elastic_gpus failed");
  }
}

/** Describe export image tasks. */
export async function describeExportImageTasks(): Promise<DescribeExportImageTasksResult> {
  try {
    // TODO: implement describe_export_image_tasks
    throw new Error("describe_export_image_tasks not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_export_image_tasks failed");
  }
}

/** Describe export tasks. */
export async function describeExportTasks(): Promise<DescribeExportTasksResult> {
  try {
    // TODO: implement describe_export_tasks
    throw new Error("describe_export_tasks not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_export_tasks failed");
  }
}

/** Describe fast launch images. */
export async function describeFastLaunchImages(): Promise<DescribeFastLaunchImagesResult> {
  try {
    // TODO: implement describe_fast_launch_images
    throw new Error("describe_fast_launch_images not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_fast_launch_images failed");
  }
}

/** Describe fast snapshot restores. */
export async function describeFastSnapshotRestores(): Promise<DescribeFastSnapshotRestoresResult> {
  try {
    // TODO: implement describe_fast_snapshot_restores
    throw new Error("describe_fast_snapshot_restores not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_fast_snapshot_restores failed");
  }
}

/** Describe fleet history. */
export async function describeFleetHistory(fleetId: string, startTime: string): Promise<DescribeFleetHistoryResult> {
  try {
    // TODO: implement describe_fleet_history
    throw new Error("describe_fleet_history not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_fleet_history failed");
  }
}

/** Describe fleet instances. */
export async function describeFleetInstances(fleetId: string): Promise<DescribeFleetInstancesResult> {
  try {
    // TODO: implement describe_fleet_instances
    throw new Error("describe_fleet_instances not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_fleet_instances failed");
  }
}

/** Describe fleets. */
export async function describeFleets(): Promise<DescribeFleetsResult> {
  try {
    // TODO: implement describe_fleets
    throw new Error("describe_fleets not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_fleets failed");
  }
}

/** Describe flow logs. */
export async function describeFlowLogs(): Promise<DescribeFlowLogsResult> {
  try {
    // TODO: implement describe_flow_logs
    throw new Error("describe_flow_logs not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_flow_logs failed");
  }
}

/** Describe fpga image attribute. */
export async function describeFpgaImageAttribute(fpgaImageId: string, attribute: string, regionName?: string | undefined): Promise<DescribeFpgaImageAttributeResult> {
  try {
    // TODO: implement describe_fpga_image_attribute
    throw new Error("describe_fpga_image_attribute not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_fpga_image_attribute failed");
  }
}

/** Describe fpga images. */
export async function describeFpgaImages(): Promise<DescribeFpgaImagesResult> {
  try {
    // TODO: implement describe_fpga_images
    throw new Error("describe_fpga_images not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_fpga_images failed");
  }
}

/** Describe host reservation offerings. */
export async function describeHostReservationOfferings(): Promise<DescribeHostReservationOfferingsResult> {
  try {
    // TODO: implement describe_host_reservation_offerings
    throw new Error("describe_host_reservation_offerings not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_host_reservation_offerings failed");
  }
}

/** Describe host reservations. */
export async function describeHostReservations(): Promise<DescribeHostReservationsResult> {
  try {
    // TODO: implement describe_host_reservations
    throw new Error("describe_host_reservations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_host_reservations failed");
  }
}

/** Describe hosts. */
export async function describeHosts(): Promise<DescribeHostsResult> {
  try {
    // TODO: implement describe_hosts
    throw new Error("describe_hosts not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_hosts failed");
  }
}

/** Describe iam instance profile associations. */
export async function describeIamInstanceProfileAssociations(): Promise<DescribeIamInstanceProfileAssociationsResult> {
  try {
    // TODO: implement describe_iam_instance_profile_associations
    throw new Error("describe_iam_instance_profile_associations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_iam_instance_profile_associations failed");
  }
}

/** Describe id format. */
export async function describeIdFormat(): Promise<DescribeIdFormatResult> {
  try {
    // TODO: implement describe_id_format
    throw new Error("describe_id_format not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_id_format failed");
  }
}

/** Describe identity id format. */
export async function describeIdentityIdFormat(principalArn: string): Promise<DescribeIdentityIdFormatResult> {
  try {
    // TODO: implement describe_identity_id_format
    throw new Error("describe_identity_id_format not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_identity_id_format failed");
  }
}

/** Describe image attribute. */
export async function describeImageAttribute(attribute: string, imageId: string, regionName?: string | undefined): Promise<DescribeImageAttributeResult> {
  try {
    // TODO: implement describe_image_attribute
    throw new Error("describe_image_attribute not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_image_attribute failed");
  }
}

/** Describe image references. */
export async function describeImageReferences(imageIds: string[]): Promise<DescribeImageReferencesResult> {
  try {
    // TODO: implement describe_image_references
    throw new Error("describe_image_references not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_image_references failed");
  }
}

/** Describe image usage report entries. */
export async function describeImageUsageReportEntries(): Promise<DescribeImageUsageReportEntriesResult> {
  try {
    // TODO: implement describe_image_usage_report_entries
    throw new Error("describe_image_usage_report_entries not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_image_usage_report_entries failed");
  }
}

/** Describe image usage reports. */
export async function describeImageUsageReports(): Promise<DescribeImageUsageReportsResult> {
  try {
    // TODO: implement describe_image_usage_reports
    throw new Error("describe_image_usage_reports not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_image_usage_reports failed");
  }
}

/** Describe import image tasks. */
export async function describeImportImageTasks(): Promise<DescribeImportImageTasksResult> {
  try {
    // TODO: implement describe_import_image_tasks
    throw new Error("describe_import_image_tasks not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_import_image_tasks failed");
  }
}

/** Describe import snapshot tasks. */
export async function describeImportSnapshotTasks(): Promise<DescribeImportSnapshotTasksResult> {
  try {
    // TODO: implement describe_import_snapshot_tasks
    throw new Error("describe_import_snapshot_tasks not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_import_snapshot_tasks failed");
  }
}

/** Describe instance attribute. */
export async function describeInstanceAttribute(instanceId: string, attribute: string, regionName?: string | undefined): Promise<DescribeInstanceAttributeResult> {
  try {
    // TODO: implement describe_instance_attribute
    throw new Error("describe_instance_attribute not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_instance_attribute failed");
  }
}

/** Describe instance connect endpoints. */
export async function describeInstanceConnectEndpoints(): Promise<DescribeInstanceConnectEndpointsResult> {
  try {
    // TODO: implement describe_instance_connect_endpoints
    throw new Error("describe_instance_connect_endpoints not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_instance_connect_endpoints failed");
  }
}

/** Describe instance credit specifications. */
export async function describeInstanceCreditSpecifications(): Promise<DescribeInstanceCreditSpecificationsResult> {
  try {
    // TODO: implement describe_instance_credit_specifications
    throw new Error("describe_instance_credit_specifications not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_instance_credit_specifications failed");
  }
}

/** Describe instance event notification attributes. */
export async function describeInstanceEventNotificationAttributes(regionName?: string | undefined): Promise<DescribeInstanceEventNotificationAttributesResult> {
  try {
    // TODO: implement describe_instance_event_notification_attributes
    throw new Error("describe_instance_event_notification_attributes not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_instance_event_notification_attributes failed");
  }
}

/** Describe instance event windows. */
export async function describeInstanceEventWindows(): Promise<DescribeInstanceEventWindowsResult> {
  try {
    // TODO: implement describe_instance_event_windows
    throw new Error("describe_instance_event_windows not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_instance_event_windows failed");
  }
}

/** Describe instance image metadata. */
export async function describeInstanceImageMetadata(): Promise<DescribeInstanceImageMetadataResult> {
  try {
    // TODO: implement describe_instance_image_metadata
    throw new Error("describe_instance_image_metadata not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_instance_image_metadata failed");
  }
}

/** Describe instance status. */
export async function describeInstanceStatus(): Promise<DescribeInstanceStatusResult> {
  try {
    // TODO: implement describe_instance_status
    throw new Error("describe_instance_status not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_instance_status failed");
  }
}

/** Describe instance topology. */
export async function describeInstanceTopology(): Promise<DescribeInstanceTopologyResult> {
  try {
    // TODO: implement describe_instance_topology
    throw new Error("describe_instance_topology not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_instance_topology failed");
  }
}

/** Describe instance type offerings. */
export async function describeInstanceTypeOfferings(): Promise<DescribeInstanceTypeOfferingsResult> {
  try {
    // TODO: implement describe_instance_type_offerings
    throw new Error("describe_instance_type_offerings not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_instance_type_offerings failed");
  }
}

/** Describe instance types. */
export async function describeInstanceTypes(): Promise<DescribeInstanceTypesResult> {
  try {
    // TODO: implement describe_instance_types
    throw new Error("describe_instance_types not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_instance_types failed");
  }
}

/** Describe internet gateways. */
export async function describeInternetGateways(): Promise<DescribeInternetGatewaysResult> {
  try {
    // TODO: implement describe_internet_gateways
    throw new Error("describe_internet_gateways not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_internet_gateways failed");
  }
}

/** Describe ipam byoasn. */
export async function describeIpamByoasn(): Promise<DescribeIpamByoasnResult> {
  try {
    // TODO: implement describe_ipam_byoasn
    throw new Error("describe_ipam_byoasn not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_ipam_byoasn failed");
  }
}

/** Describe ipam external resource verification tokens. */
export async function describeIpamExternalResourceVerificationTokens(): Promise<DescribeIpamExternalResourceVerificationTokensResult> {
  try {
    // TODO: implement describe_ipam_external_resource_verification_tokens
    throw new Error("describe_ipam_external_resource_verification_tokens not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_ipam_external_resource_verification_tokens failed");
  }
}

/** Describe ipam pools. */
export async function describeIpamPools(): Promise<DescribeIpamPoolsResult> {
  try {
    // TODO: implement describe_ipam_pools
    throw new Error("describe_ipam_pools not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_ipam_pools failed");
  }
}

/** Describe ipam prefix list resolver targets. */
export async function describeIpamPrefixListResolverTargets(): Promise<DescribeIpamPrefixListResolverTargetsResult> {
  try {
    // TODO: implement describe_ipam_prefix_list_resolver_targets
    throw new Error("describe_ipam_prefix_list_resolver_targets not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_ipam_prefix_list_resolver_targets failed");
  }
}

/** Describe ipam prefix list resolvers. */
export async function describeIpamPrefixListResolvers(): Promise<DescribeIpamPrefixListResolversResult> {
  try {
    // TODO: implement describe_ipam_prefix_list_resolvers
    throw new Error("describe_ipam_prefix_list_resolvers not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_ipam_prefix_list_resolvers failed");
  }
}

/** Describe ipam resource discoveries. */
export async function describeIpamResourceDiscoveries(): Promise<DescribeIpamResourceDiscoveriesResult> {
  try {
    // TODO: implement describe_ipam_resource_discoveries
    throw new Error("describe_ipam_resource_discoveries not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_ipam_resource_discoveries failed");
  }
}

/** Describe ipam resource discovery associations. */
export async function describeIpamResourceDiscoveryAssociations(): Promise<DescribeIpamResourceDiscoveryAssociationsResult> {
  try {
    // TODO: implement describe_ipam_resource_discovery_associations
    throw new Error("describe_ipam_resource_discovery_associations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_ipam_resource_discovery_associations failed");
  }
}

/** Describe ipam scopes. */
export async function describeIpamScopes(): Promise<DescribeIpamScopesResult> {
  try {
    // TODO: implement describe_ipam_scopes
    throw new Error("describe_ipam_scopes not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_ipam_scopes failed");
  }
}

/** Describe ipams. */
export async function describeIpams(): Promise<DescribeIpamsResult> {
  try {
    // TODO: implement describe_ipams
    throw new Error("describe_ipams not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_ipams failed");
  }
}

/** Describe ipv6 pools. */
export async function describeIpv6Pools(): Promise<DescribeIpv6PoolsResult> {
  try {
    // TODO: implement describe_ipv6_pools
    throw new Error("describe_ipv6_pools not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_ipv6_pools failed");
  }
}

/** Describe key pairs. */
export async function describeKeyPairs(): Promise<DescribeKeyPairsResult> {
  try {
    // TODO: implement describe_key_pairs
    throw new Error("describe_key_pairs not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_key_pairs failed");
  }
}

/** Describe launch template versions. */
export async function describeLaunchTemplateVersions(): Promise<DescribeLaunchTemplateVersionsResult> {
  try {
    // TODO: implement describe_launch_template_versions
    throw new Error("describe_launch_template_versions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_launch_template_versions failed");
  }
}

/** Describe launch templates. */
export async function describeLaunchTemplates(): Promise<DescribeLaunchTemplatesResult> {
  try {
    // TODO: implement describe_launch_templates
    throw new Error("describe_launch_templates not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_launch_templates failed");
  }
}

/** Describe local gateway route table virtual interface group associations. */
export async function describeLocalGatewayRouteTableVirtualInterfaceGroupAssociations(): Promise<DescribeLocalGatewayRouteTableVirtualInterfaceGroupAssociationsResult> {
  try {
    // TODO: implement describe_local_gateway_route_table_virtual_interface_group_associations
    throw new Error("describe_local_gateway_route_table_virtual_interface_group_associations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_local_gateway_route_table_virtual_interface_group_associations failed");
  }
}

/** Describe local gateway route table vpc associations. */
export async function describeLocalGatewayRouteTableVpcAssociations(): Promise<DescribeLocalGatewayRouteTableVpcAssociationsResult> {
  try {
    // TODO: implement describe_local_gateway_route_table_vpc_associations
    throw new Error("describe_local_gateway_route_table_vpc_associations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_local_gateway_route_table_vpc_associations failed");
  }
}

/** Describe local gateway route tables. */
export async function describeLocalGatewayRouteTables(): Promise<DescribeLocalGatewayRouteTablesResult> {
  try {
    // TODO: implement describe_local_gateway_route_tables
    throw new Error("describe_local_gateway_route_tables not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_local_gateway_route_tables failed");
  }
}

/** Describe local gateway virtual interface groups. */
export async function describeLocalGatewayVirtualInterfaceGroups(): Promise<DescribeLocalGatewayVirtualInterfaceGroupsResult> {
  try {
    // TODO: implement describe_local_gateway_virtual_interface_groups
    throw new Error("describe_local_gateway_virtual_interface_groups not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_local_gateway_virtual_interface_groups failed");
  }
}

/** Describe local gateway virtual interfaces. */
export async function describeLocalGatewayVirtualInterfaces(): Promise<DescribeLocalGatewayVirtualInterfacesResult> {
  try {
    // TODO: implement describe_local_gateway_virtual_interfaces
    throw new Error("describe_local_gateway_virtual_interfaces not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_local_gateway_virtual_interfaces failed");
  }
}

/** Describe local gateways. */
export async function describeLocalGateways(): Promise<DescribeLocalGatewaysResult> {
  try {
    // TODO: implement describe_local_gateways
    throw new Error("describe_local_gateways not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_local_gateways failed");
  }
}

/** Describe locked snapshots. */
export async function describeLockedSnapshots(): Promise<DescribeLockedSnapshotsResult> {
  try {
    // TODO: implement describe_locked_snapshots
    throw new Error("describe_locked_snapshots not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_locked_snapshots failed");
  }
}

/** Describe mac hosts. */
export async function describeMacHosts(): Promise<DescribeMacHostsResult> {
  try {
    // TODO: implement describe_mac_hosts
    throw new Error("describe_mac_hosts not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_mac_hosts failed");
  }
}

/** Describe mac modification tasks. */
export async function describeMacModificationTasks(): Promise<DescribeMacModificationTasksResult> {
  try {
    // TODO: implement describe_mac_modification_tasks
    throw new Error("describe_mac_modification_tasks not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_mac_modification_tasks failed");
  }
}

/** Describe managed prefix lists. */
export async function describeManagedPrefixLists(): Promise<DescribeManagedPrefixListsResult> {
  try {
    // TODO: implement describe_managed_prefix_lists
    throw new Error("describe_managed_prefix_lists not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_managed_prefix_lists failed");
  }
}

/** Describe moving addresses. */
export async function describeMovingAddresses(): Promise<DescribeMovingAddressesResult> {
  try {
    // TODO: implement describe_moving_addresses
    throw new Error("describe_moving_addresses not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_moving_addresses failed");
  }
}

/** Describe nat gateways. */
export async function describeNatGateways(): Promise<DescribeNatGatewaysResult> {
  try {
    // TODO: implement describe_nat_gateways
    throw new Error("describe_nat_gateways not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_nat_gateways failed");
  }
}

/** Describe network acls. */
export async function describeNetworkAcls(): Promise<DescribeNetworkAclsResult> {
  try {
    // TODO: implement describe_network_acls
    throw new Error("describe_network_acls not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_network_acls failed");
  }
}

/** Describe network insights access scope analyses. */
export async function describeNetworkInsightsAccessScopeAnalyses(): Promise<DescribeNetworkInsightsAccessScopeAnalysesResult> {
  try {
    // TODO: implement describe_network_insights_access_scope_analyses
    throw new Error("describe_network_insights_access_scope_analyses not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_network_insights_access_scope_analyses failed");
  }
}

/** Describe network insights access scopes. */
export async function describeNetworkInsightsAccessScopes(): Promise<DescribeNetworkInsightsAccessScopesResult> {
  try {
    // TODO: implement describe_network_insights_access_scopes
    throw new Error("describe_network_insights_access_scopes not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_network_insights_access_scopes failed");
  }
}

/** Describe network insights analyses. */
export async function describeNetworkInsightsAnalyses(): Promise<DescribeNetworkInsightsAnalysesResult> {
  try {
    // TODO: implement describe_network_insights_analyses
    throw new Error("describe_network_insights_analyses not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_network_insights_analyses failed");
  }
}

/** Describe network insights paths. */
export async function describeNetworkInsightsPaths(): Promise<DescribeNetworkInsightsPathsResult> {
  try {
    // TODO: implement describe_network_insights_paths
    throw new Error("describe_network_insights_paths not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_network_insights_paths failed");
  }
}

/** Describe network interface attribute. */
export async function describeNetworkInterfaceAttribute(networkInterfaceId: string): Promise<DescribeNetworkInterfaceAttributeResult> {
  try {
    // TODO: implement describe_network_interface_attribute
    throw new Error("describe_network_interface_attribute not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_network_interface_attribute failed");
  }
}

/** Describe network interface permissions. */
export async function describeNetworkInterfacePermissions(): Promise<DescribeNetworkInterfacePermissionsResult> {
  try {
    // TODO: implement describe_network_interface_permissions
    throw new Error("describe_network_interface_permissions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_network_interface_permissions failed");
  }
}

/** Describe network interfaces. */
export async function describeNetworkInterfaces(): Promise<DescribeNetworkInterfacesResult> {
  try {
    // TODO: implement describe_network_interfaces
    throw new Error("describe_network_interfaces not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_network_interfaces failed");
  }
}

/** Describe outpost lags. */
export async function describeOutpostLags(): Promise<DescribeOutpostLagsResult> {
  try {
    // TODO: implement describe_outpost_lags
    throw new Error("describe_outpost_lags not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_outpost_lags failed");
  }
}

/** Describe placement groups. */
export async function describePlacementGroups(): Promise<DescribePlacementGroupsResult> {
  try {
    // TODO: implement describe_placement_groups
    throw new Error("describe_placement_groups not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_placement_groups failed");
  }
}

/** Describe prefix lists. */
export async function describePrefixLists(): Promise<DescribePrefixListsResult> {
  try {
    // TODO: implement describe_prefix_lists
    throw new Error("describe_prefix_lists not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_prefix_lists failed");
  }
}

/** Describe principal id format. */
export async function describePrincipalIdFormat(): Promise<DescribePrincipalIdFormatResult> {
  try {
    // TODO: implement describe_principal_id_format
    throw new Error("describe_principal_id_format not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_principal_id_format failed");
  }
}

/** Describe public ipv4 pools. */
export async function describePublicIpv4Pools(): Promise<DescribePublicIpv4PoolsResult> {
  try {
    // TODO: implement describe_public_ipv4_pools
    throw new Error("describe_public_ipv4_pools not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_public_ipv4_pools failed");
  }
}

/** Describe regions. */
export async function describeRegions(): Promise<DescribeRegionsResult> {
  try {
    // TODO: implement describe_regions
    throw new Error("describe_regions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_regions failed");
  }
}

/** Describe replace root volume tasks. */
export async function describeReplaceRootVolumeTasks(): Promise<DescribeReplaceRootVolumeTasksResult> {
  try {
    // TODO: implement describe_replace_root_volume_tasks
    throw new Error("describe_replace_root_volume_tasks not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_replace_root_volume_tasks failed");
  }
}

/** Describe reserved instances. */
export async function describeReservedInstances(): Promise<DescribeReservedInstancesResult> {
  try {
    // TODO: implement describe_reserved_instances
    throw new Error("describe_reserved_instances not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_reserved_instances failed");
  }
}

/** Describe reserved instances listings. */
export async function describeReservedInstancesListings(): Promise<DescribeReservedInstancesListingsResult> {
  try {
    // TODO: implement describe_reserved_instances_listings
    throw new Error("describe_reserved_instances_listings not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_reserved_instances_listings failed");
  }
}

/** Describe reserved instances modifications. */
export async function describeReservedInstancesModifications(): Promise<DescribeReservedInstancesModificationsResult> {
  try {
    // TODO: implement describe_reserved_instances_modifications
    throw new Error("describe_reserved_instances_modifications not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_reserved_instances_modifications failed");
  }
}

/** Describe reserved instances offerings. */
export async function describeReservedInstancesOfferings(): Promise<DescribeReservedInstancesOfferingsResult> {
  try {
    // TODO: implement describe_reserved_instances_offerings
    throw new Error("describe_reserved_instances_offerings not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_reserved_instances_offerings failed");
  }
}

/** Describe route server endpoints. */
export async function describeRouteServerEndpoints(): Promise<DescribeRouteServerEndpointsResult> {
  try {
    // TODO: implement describe_route_server_endpoints
    throw new Error("describe_route_server_endpoints not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_route_server_endpoints failed");
  }
}

/** Describe route server peers. */
export async function describeRouteServerPeers(): Promise<DescribeRouteServerPeersResult> {
  try {
    // TODO: implement describe_route_server_peers
    throw new Error("describe_route_server_peers not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_route_server_peers failed");
  }
}

/** Describe route servers. */
export async function describeRouteServers(): Promise<DescribeRouteServersResult> {
  try {
    // TODO: implement describe_route_servers
    throw new Error("describe_route_servers not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_route_servers failed");
  }
}

/** Describe route tables. */
export async function describeRouteTables(): Promise<DescribeRouteTablesResult> {
  try {
    // TODO: implement describe_route_tables
    throw new Error("describe_route_tables not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_route_tables failed");
  }
}

/** Describe scheduled instance availability. */
export async function describeScheduledInstanceAvailability(firstSlotStartTimeRange: Record<string, unknown>, recurrence: Record<string, unknown>): Promise<DescribeScheduledInstanceAvailabilityResult> {
  try {
    // TODO: implement describe_scheduled_instance_availability
    throw new Error("describe_scheduled_instance_availability not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_scheduled_instance_availability failed");
  }
}

/** Describe scheduled instances. */
export async function describeScheduledInstances(): Promise<DescribeScheduledInstancesResult> {
  try {
    // TODO: implement describe_scheduled_instances
    throw new Error("describe_scheduled_instances not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_scheduled_instances failed");
  }
}

/** Describe security group references. */
export async function describeSecurityGroupReferences(groupId: string[], regionName?: string | undefined): Promise<DescribeSecurityGroupReferencesResult> {
  try {
    // TODO: implement describe_security_group_references
    throw new Error("describe_security_group_references not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_security_group_references failed");
  }
}

/** Describe security group rules. */
export async function describeSecurityGroupRules(): Promise<DescribeSecurityGroupRulesResult> {
  try {
    // TODO: implement describe_security_group_rules
    throw new Error("describe_security_group_rules not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_security_group_rules failed");
  }
}

/** Describe security group vpc associations. */
export async function describeSecurityGroupVpcAssociations(): Promise<DescribeSecurityGroupVpcAssociationsResult> {
  try {
    // TODO: implement describe_security_group_vpc_associations
    throw new Error("describe_security_group_vpc_associations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_security_group_vpc_associations failed");
  }
}

/** Describe service link virtual interfaces. */
export async function describeServiceLinkVirtualInterfaces(): Promise<DescribeServiceLinkVirtualInterfacesResult> {
  try {
    // TODO: implement describe_service_link_virtual_interfaces
    throw new Error("describe_service_link_virtual_interfaces not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_service_link_virtual_interfaces failed");
  }
}

/** Describe snapshot attribute. */
export async function describeSnapshotAttribute(attribute: string, snapshotId: string, regionName?: string | undefined): Promise<DescribeSnapshotAttributeResult> {
  try {
    // TODO: implement describe_snapshot_attribute
    throw new Error("describe_snapshot_attribute not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_snapshot_attribute failed");
  }
}

/** Describe snapshot tier status. */
export async function describeSnapshotTierStatus(): Promise<DescribeSnapshotTierStatusResult> {
  try {
    // TODO: implement describe_snapshot_tier_status
    throw new Error("describe_snapshot_tier_status not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_snapshot_tier_status failed");
  }
}

/** Describe snapshots. */
export async function describeSnapshots(): Promise<DescribeSnapshotsResult> {
  try {
    // TODO: implement describe_snapshots
    throw new Error("describe_snapshots not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_snapshots failed");
  }
}

/** Describe spot datafeed subscription. */
export async function describeSpotDatafeedSubscription(regionName?: string | undefined): Promise<DescribeSpotDatafeedSubscriptionResult> {
  try {
    // TODO: implement describe_spot_datafeed_subscription
    throw new Error("describe_spot_datafeed_subscription not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_spot_datafeed_subscription failed");
  }
}

/** Describe spot fleet instances. */
export async function describeSpotFleetInstances(spotFleetRequestId: string): Promise<DescribeSpotFleetInstancesResult> {
  try {
    // TODO: implement describe_spot_fleet_instances
    throw new Error("describe_spot_fleet_instances not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_spot_fleet_instances failed");
  }
}

/** Describe spot fleet request history. */
export async function describeSpotFleetRequestHistory(spotFleetRequestId: string, startTime: string): Promise<DescribeSpotFleetRequestHistoryResult> {
  try {
    // TODO: implement describe_spot_fleet_request_history
    throw new Error("describe_spot_fleet_request_history not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_spot_fleet_request_history failed");
  }
}

/** Describe spot fleet requests. */
export async function describeSpotFleetRequests(): Promise<DescribeSpotFleetRequestsResult> {
  try {
    // TODO: implement describe_spot_fleet_requests
    throw new Error("describe_spot_fleet_requests not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_spot_fleet_requests failed");
  }
}

/** Describe spot instance requests. */
export async function describeSpotInstanceRequests(): Promise<DescribeSpotInstanceRequestsResult> {
  try {
    // TODO: implement describe_spot_instance_requests
    throw new Error("describe_spot_instance_requests not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_spot_instance_requests failed");
  }
}

/** Describe spot price history. */
export async function describeSpotPriceHistory(): Promise<DescribeSpotPriceHistoryResult> {
  try {
    // TODO: implement describe_spot_price_history
    throw new Error("describe_spot_price_history not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_spot_price_history failed");
  }
}

/** Describe stale security groups. */
export async function describeStaleSecurityGroups(vpcId: string): Promise<DescribeStaleSecurityGroupsResult> {
  try {
    // TODO: implement describe_stale_security_groups
    throw new Error("describe_stale_security_groups not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_stale_security_groups failed");
  }
}

/** Describe store image tasks. */
export async function describeStoreImageTasks(): Promise<DescribeStoreImageTasksResult> {
  try {
    // TODO: implement describe_store_image_tasks
    throw new Error("describe_store_image_tasks not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_store_image_tasks failed");
  }
}

/** Describe subnets. */
export async function describeSubnets(): Promise<DescribeSubnetsResult> {
  try {
    // TODO: implement describe_subnets
    throw new Error("describe_subnets not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_subnets failed");
  }
}

/** Describe tags. */
export async function describeTags(): Promise<DescribeTagsResult> {
  try {
    // TODO: implement describe_tags
    throw new Error("describe_tags not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_tags failed");
  }
}

/** Describe traffic mirror filter rules. */
export async function describeTrafficMirrorFilterRules(): Promise<DescribeTrafficMirrorFilterRulesResult> {
  try {
    // TODO: implement describe_traffic_mirror_filter_rules
    throw new Error("describe_traffic_mirror_filter_rules not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_traffic_mirror_filter_rules failed");
  }
}

/** Describe traffic mirror filters. */
export async function describeTrafficMirrorFilters(): Promise<DescribeTrafficMirrorFiltersResult> {
  try {
    // TODO: implement describe_traffic_mirror_filters
    throw new Error("describe_traffic_mirror_filters not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_traffic_mirror_filters failed");
  }
}

/** Describe traffic mirror sessions. */
export async function describeTrafficMirrorSessions(): Promise<DescribeTrafficMirrorSessionsResult> {
  try {
    // TODO: implement describe_traffic_mirror_sessions
    throw new Error("describe_traffic_mirror_sessions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_traffic_mirror_sessions failed");
  }
}

/** Describe traffic mirror targets. */
export async function describeTrafficMirrorTargets(): Promise<DescribeTrafficMirrorTargetsResult> {
  try {
    // TODO: implement describe_traffic_mirror_targets
    throw new Error("describe_traffic_mirror_targets not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_traffic_mirror_targets failed");
  }
}

/** Describe transit gateway attachments. */
export async function describeTransitGatewayAttachments(): Promise<DescribeTransitGatewayAttachmentsResult> {
  try {
    // TODO: implement describe_transit_gateway_attachments
    throw new Error("describe_transit_gateway_attachments not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_transit_gateway_attachments failed");
  }
}

/** Describe transit gateway connect peers. */
export async function describeTransitGatewayConnectPeers(): Promise<DescribeTransitGatewayConnectPeersResult> {
  try {
    // TODO: implement describe_transit_gateway_connect_peers
    throw new Error("describe_transit_gateway_connect_peers not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_transit_gateway_connect_peers failed");
  }
}

/** Describe transit gateway connects. */
export async function describeTransitGatewayConnects(): Promise<DescribeTransitGatewayConnectsResult> {
  try {
    // TODO: implement describe_transit_gateway_connects
    throw new Error("describe_transit_gateway_connects not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_transit_gateway_connects failed");
  }
}

/** Describe transit gateway multicast domains. */
export async function describeTransitGatewayMulticastDomains(): Promise<DescribeTransitGatewayMulticastDomainsResult> {
  try {
    // TODO: implement describe_transit_gateway_multicast_domains
    throw new Error("describe_transit_gateway_multicast_domains not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_transit_gateway_multicast_domains failed");
  }
}

/** Describe transit gateway peering attachments. */
export async function describeTransitGatewayPeeringAttachments(): Promise<DescribeTransitGatewayPeeringAttachmentsResult> {
  try {
    // TODO: implement describe_transit_gateway_peering_attachments
    throw new Error("describe_transit_gateway_peering_attachments not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_transit_gateway_peering_attachments failed");
  }
}

/** Describe transit gateway policy tables. */
export async function describeTransitGatewayPolicyTables(): Promise<DescribeTransitGatewayPolicyTablesResult> {
  try {
    // TODO: implement describe_transit_gateway_policy_tables
    throw new Error("describe_transit_gateway_policy_tables not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_transit_gateway_policy_tables failed");
  }
}

/** Describe transit gateway route table announcements. */
export async function describeTransitGatewayRouteTableAnnouncements(): Promise<DescribeTransitGatewayRouteTableAnnouncementsResult> {
  try {
    // TODO: implement describe_transit_gateway_route_table_announcements
    throw new Error("describe_transit_gateway_route_table_announcements not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_transit_gateway_route_table_announcements failed");
  }
}

/** Describe transit gateway route tables. */
export async function describeTransitGatewayRouteTables(): Promise<DescribeTransitGatewayRouteTablesResult> {
  try {
    // TODO: implement describe_transit_gateway_route_tables
    throw new Error("describe_transit_gateway_route_tables not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_transit_gateway_route_tables failed");
  }
}

/** Describe transit gateway vpc attachments. */
export async function describeTransitGatewayVpcAttachments(): Promise<DescribeTransitGatewayVpcAttachmentsResult> {
  try {
    // TODO: implement describe_transit_gateway_vpc_attachments
    throw new Error("describe_transit_gateway_vpc_attachments not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_transit_gateway_vpc_attachments failed");
  }
}

/** Describe transit gateways. */
export async function describeTransitGateways(): Promise<DescribeTransitGatewaysResult> {
  try {
    // TODO: implement describe_transit_gateways
    throw new Error("describe_transit_gateways not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_transit_gateways failed");
  }
}

/** Describe trunk interface associations. */
export async function describeTrunkInterfaceAssociations(): Promise<DescribeTrunkInterfaceAssociationsResult> {
  try {
    // TODO: implement describe_trunk_interface_associations
    throw new Error("describe_trunk_interface_associations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_trunk_interface_associations failed");
  }
}

/** Describe verified access endpoints. */
export async function describeVerifiedAccessEndpoints(): Promise<DescribeVerifiedAccessEndpointsResult> {
  try {
    // TODO: implement describe_verified_access_endpoints
    throw new Error("describe_verified_access_endpoints not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_verified_access_endpoints failed");
  }
}

/** Describe verified access groups. */
export async function describeVerifiedAccessGroups(): Promise<DescribeVerifiedAccessGroupsResult> {
  try {
    // TODO: implement describe_verified_access_groups
    throw new Error("describe_verified_access_groups not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_verified_access_groups failed");
  }
}

/** Describe verified access instance logging configurations. */
export async function describeVerifiedAccessInstanceLoggingConfigurations(): Promise<DescribeVerifiedAccessInstanceLoggingConfigurationsResult> {
  try {
    // TODO: implement describe_verified_access_instance_logging_configurations
    throw new Error("describe_verified_access_instance_logging_configurations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_verified_access_instance_logging_configurations failed");
  }
}

/** Describe verified access instances. */
export async function describeVerifiedAccessInstances(): Promise<DescribeVerifiedAccessInstancesResult> {
  try {
    // TODO: implement describe_verified_access_instances
    throw new Error("describe_verified_access_instances not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_verified_access_instances failed");
  }
}

/** Describe verified access trust providers. */
export async function describeVerifiedAccessTrustProviders(): Promise<DescribeVerifiedAccessTrustProvidersResult> {
  try {
    // TODO: implement describe_verified_access_trust_providers
    throw new Error("describe_verified_access_trust_providers not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_verified_access_trust_providers failed");
  }
}

/** Describe volume attribute. */
export async function describeVolumeAttribute(attribute: string, volumeId: string, regionName?: string | undefined): Promise<DescribeVolumeAttributeResult> {
  try {
    // TODO: implement describe_volume_attribute
    throw new Error("describe_volume_attribute not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_volume_attribute failed");
  }
}

/** Describe volume status. */
export async function describeVolumeStatus(): Promise<DescribeVolumeStatusResult> {
  try {
    // TODO: implement describe_volume_status
    throw new Error("describe_volume_status not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_volume_status failed");
  }
}

/** Describe volumes. */
export async function describeVolumes(): Promise<DescribeVolumesResult> {
  try {
    // TODO: implement describe_volumes
    throw new Error("describe_volumes not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_volumes failed");
  }
}

/** Describe volumes modifications. */
export async function describeVolumesModifications(): Promise<DescribeVolumesModificationsResult> {
  try {
    // TODO: implement describe_volumes_modifications
    throw new Error("describe_volumes_modifications not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_volumes_modifications failed");
  }
}

/** Describe vpc attribute. */
export async function describeVpcAttribute(attribute: string, vpcId: string, regionName?: string | undefined): Promise<DescribeVpcAttributeResult> {
  try {
    // TODO: implement describe_vpc_attribute
    throw new Error("describe_vpc_attribute not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_vpc_attribute failed");
  }
}

/** Describe vpc block public access exclusions. */
export async function describeVpcBlockPublicAccessExclusions(): Promise<DescribeVpcBlockPublicAccessExclusionsResult> {
  try {
    // TODO: implement describe_vpc_block_public_access_exclusions
    throw new Error("describe_vpc_block_public_access_exclusions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_vpc_block_public_access_exclusions failed");
  }
}

/** Describe vpc block public access options. */
export async function describeVpcBlockPublicAccessOptions(regionName?: string | undefined): Promise<DescribeVpcBlockPublicAccessOptionsResult> {
  try {
    // TODO: implement describe_vpc_block_public_access_options
    throw new Error("describe_vpc_block_public_access_options not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_vpc_block_public_access_options failed");
  }
}

/** Describe vpc classic link. */
export async function describeVpcClassicLink(): Promise<DescribeVpcClassicLinkResult> {
  try {
    // TODO: implement describe_vpc_classic_link
    throw new Error("describe_vpc_classic_link not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_vpc_classic_link failed");
  }
}

/** Describe vpc classic link dns support. */
export async function describeVpcClassicLinkDnsSupport(): Promise<DescribeVpcClassicLinkDnsSupportResult> {
  try {
    // TODO: implement describe_vpc_classic_link_dns_support
    throw new Error("describe_vpc_classic_link_dns_support not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_vpc_classic_link_dns_support failed");
  }
}

/** Describe vpc endpoint associations. */
export async function describeVpcEndpointAssociations(): Promise<DescribeVpcEndpointAssociationsResult> {
  try {
    // TODO: implement describe_vpc_endpoint_associations
    throw new Error("describe_vpc_endpoint_associations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_vpc_endpoint_associations failed");
  }
}

/** Describe vpc endpoint connection notifications. */
export async function describeVpcEndpointConnectionNotifications(): Promise<DescribeVpcEndpointConnectionNotificationsResult> {
  try {
    // TODO: implement describe_vpc_endpoint_connection_notifications
    throw new Error("describe_vpc_endpoint_connection_notifications not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_vpc_endpoint_connection_notifications failed");
  }
}

/** Describe vpc endpoint connections. */
export async function describeVpcEndpointConnections(): Promise<DescribeVpcEndpointConnectionsResult> {
  try {
    // TODO: implement describe_vpc_endpoint_connections
    throw new Error("describe_vpc_endpoint_connections not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_vpc_endpoint_connections failed");
  }
}

/** Describe vpc endpoint service configurations. */
export async function describeVpcEndpointServiceConfigurations(): Promise<DescribeVpcEndpointServiceConfigurationsResult> {
  try {
    // TODO: implement describe_vpc_endpoint_service_configurations
    throw new Error("describe_vpc_endpoint_service_configurations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_vpc_endpoint_service_configurations failed");
  }
}

/** Describe vpc endpoint service permissions. */
export async function describeVpcEndpointServicePermissions(serviceId: string): Promise<DescribeVpcEndpointServicePermissionsResult> {
  try {
    // TODO: implement describe_vpc_endpoint_service_permissions
    throw new Error("describe_vpc_endpoint_service_permissions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_vpc_endpoint_service_permissions failed");
  }
}

/** Describe vpc endpoint services. */
export async function describeVpcEndpointServices(): Promise<DescribeVpcEndpointServicesResult> {
  try {
    // TODO: implement describe_vpc_endpoint_services
    throw new Error("describe_vpc_endpoint_services not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_vpc_endpoint_services failed");
  }
}

/** Describe vpc endpoints. */
export async function describeVpcEndpoints(): Promise<DescribeVpcEndpointsResult> {
  try {
    // TODO: implement describe_vpc_endpoints
    throw new Error("describe_vpc_endpoints not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_vpc_endpoints failed");
  }
}

/** Describe vpc peering connections. */
export async function describeVpcPeeringConnections(): Promise<DescribeVpcPeeringConnectionsResult> {
  try {
    // TODO: implement describe_vpc_peering_connections
    throw new Error("describe_vpc_peering_connections not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_vpc_peering_connections failed");
  }
}

/** Describe vpcs. */
export async function describeVpcs(): Promise<DescribeVpcsResult> {
  try {
    // TODO: implement describe_vpcs
    throw new Error("describe_vpcs not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_vpcs failed");
  }
}

/** Describe vpn connections. */
export async function describeVpnConnections(): Promise<DescribeVpnConnectionsResult> {
  try {
    // TODO: implement describe_vpn_connections
    throw new Error("describe_vpn_connections not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_vpn_connections failed");
  }
}

/** Describe vpn gateways. */
export async function describeVpnGateways(): Promise<DescribeVpnGatewaysResult> {
  try {
    // TODO: implement describe_vpn_gateways
    throw new Error("describe_vpn_gateways not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_vpn_gateways failed");
  }
}

/** Detach classic link vpc. */
export async function detachClassicLinkVpc(instanceId: string, vpcId: string, regionName?: string | undefined): Promise<DetachClassicLinkVpcResult> {
  try {
    // TODO: implement detach_classic_link_vpc
    throw new Error("detach_classic_link_vpc not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "detach_classic_link_vpc failed");
  }
}

/** Detach internet gateway. */
export async function detachInternetGateway(internetGatewayId: string, vpcId: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement detach_internet_gateway
    throw new Error("detach_internet_gateway not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "detach_internet_gateway failed");
  }
}

/** Detach network interface. */
export async function detachNetworkInterface(attachmentId: string): Promise<void> {
  try {
    // TODO: implement detach_network_interface
    throw new Error("detach_network_interface not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "detach_network_interface failed");
  }
}

/** Detach verified access trust provider. */
export async function detachVerifiedAccessTrustProvider(verifiedAccessInstanceId: string, verifiedAccessTrustProviderId: string): Promise<DetachVerifiedAccessTrustProviderResult> {
  try {
    // TODO: implement detach_verified_access_trust_provider
    throw new Error("detach_verified_access_trust_provider not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "detach_verified_access_trust_provider failed");
  }
}

/** Detach volume. */
export async function detachVolume(volumeId: string): Promise<DetachVolumeResult> {
  try {
    // TODO: implement detach_volume
    throw new Error("detach_volume not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "detach_volume failed");
  }
}

/** Detach vpn gateway. */
export async function detachVpnGateway(vpcId: string, vpnGatewayId: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement detach_vpn_gateway
    throw new Error("detach_vpn_gateway not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "detach_vpn_gateway failed");
  }
}

/** Disable address transfer. */
export async function disableAddressTransfer(allocationId: string, regionName?: string | undefined): Promise<DisableAddressTransferResult> {
  try {
    // TODO: implement disable_address_transfer
    throw new Error("disable_address_transfer not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disable_address_transfer failed");
  }
}

/** Disable allowed images settings. */
export async function disableAllowedImagesSettings(regionName?: string | undefined): Promise<DisableAllowedImagesSettingsResult> {
  try {
    // TODO: implement disable_allowed_images_settings
    throw new Error("disable_allowed_images_settings not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disable_allowed_images_settings failed");
  }
}

/** Disable aws network performance metric subscription. */
export async function disableAwsNetworkPerformanceMetricSubscription(): Promise<DisableAwsNetworkPerformanceMetricSubscriptionResult> {
  try {
    // TODO: implement disable_aws_network_performance_metric_subscription
    throw new Error("disable_aws_network_performance_metric_subscription not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disable_aws_network_performance_metric_subscription failed");
  }
}

/** Disable capacity manager. */
export async function disableCapacityManager(): Promise<DisableCapacityManagerResult> {
  try {
    // TODO: implement disable_capacity_manager
    throw new Error("disable_capacity_manager not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disable_capacity_manager failed");
  }
}

/** Disable ebs encryption by default. */
export async function disableEbsEncryptionByDefault(regionName?: string | undefined): Promise<DisableEbsEncryptionByDefaultResult> {
  try {
    // TODO: implement disable_ebs_encryption_by_default
    throw new Error("disable_ebs_encryption_by_default not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disable_ebs_encryption_by_default failed");
  }
}

/** Disable fast launch. */
export async function disableFastLaunch(imageId: string): Promise<DisableFastLaunchResult> {
  try {
    // TODO: implement disable_fast_launch
    throw new Error("disable_fast_launch not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disable_fast_launch failed");
  }
}

/** Disable fast snapshot restores. */
export async function disableFastSnapshotRestores(sourceSnapshotIds: string[]): Promise<DisableFastSnapshotRestoresResult> {
  try {
    // TODO: implement disable_fast_snapshot_restores
    throw new Error("disable_fast_snapshot_restores not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disable_fast_snapshot_restores failed");
  }
}

/** Disable image. */
export async function disableImage(imageId: string, regionName?: string | undefined): Promise<DisableImageResult> {
  try {
    // TODO: implement disable_image
    throw new Error("disable_image not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disable_image failed");
  }
}

/** Disable image block public access. */
export async function disableImageBlockPublicAccess(regionName?: string | undefined): Promise<DisableImageBlockPublicAccessResult> {
  try {
    // TODO: implement disable_image_block_public_access
    throw new Error("disable_image_block_public_access not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disable_image_block_public_access failed");
  }
}

/** Disable image deprecation. */
export async function disableImageDeprecation(imageId: string, regionName?: string | undefined): Promise<DisableImageDeprecationResult> {
  try {
    // TODO: implement disable_image_deprecation
    throw new Error("disable_image_deprecation not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disable_image_deprecation failed");
  }
}

/** Disable image deregistration protection. */
export async function disableImageDeregistrationProtection(imageId: string, regionName?: string | undefined): Promise<DisableImageDeregistrationProtectionResult> {
  try {
    // TODO: implement disable_image_deregistration_protection
    throw new Error("disable_image_deregistration_protection not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disable_image_deregistration_protection failed");
  }
}

/** Disable ipam organization admin account. */
export async function disableIpamOrganizationAdminAccount(delegatedAdminAccountId: string, regionName?: string | undefined): Promise<DisableIpamOrganizationAdminAccountResult> {
  try {
    // TODO: implement disable_ipam_organization_admin_account
    throw new Error("disable_ipam_organization_admin_account not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disable_ipam_organization_admin_account failed");
  }
}

/** Disable route server propagation. */
export async function disableRouteServerPropagation(routeServerId: string, routeTableId: string, regionName?: string | undefined): Promise<DisableRouteServerPropagationResult> {
  try {
    // TODO: implement disable_route_server_propagation
    throw new Error("disable_route_server_propagation not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disable_route_server_propagation failed");
  }
}

/** Disable serial console access. */
export async function disableSerialConsoleAccess(regionName?: string | undefined): Promise<DisableSerialConsoleAccessResult> {
  try {
    // TODO: implement disable_serial_console_access
    throw new Error("disable_serial_console_access not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disable_serial_console_access failed");
  }
}

/** Disable snapshot block public access. */
export async function disableSnapshotBlockPublicAccess(regionName?: string | undefined): Promise<DisableSnapshotBlockPublicAccessResult> {
  try {
    // TODO: implement disable_snapshot_block_public_access
    throw new Error("disable_snapshot_block_public_access not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disable_snapshot_block_public_access failed");
  }
}

/** Disable transit gateway route table propagation. */
export async function disableTransitGatewayRouteTablePropagation(transitGatewayRouteTableId: string): Promise<DisableTransitGatewayRouteTablePropagationResult> {
  try {
    // TODO: implement disable_transit_gateway_route_table_propagation
    throw new Error("disable_transit_gateway_route_table_propagation not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disable_transit_gateway_route_table_propagation failed");
  }
}

/** Disable vgw route propagation. */
export async function disableVgwRoutePropagation(gatewayId: string, routeTableId: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement disable_vgw_route_propagation
    throw new Error("disable_vgw_route_propagation not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disable_vgw_route_propagation failed");
  }
}

/** Disable vpc classic link. */
export async function disableVpcClassicLink(vpcId: string, regionName?: string | undefined): Promise<DisableVpcClassicLinkResult> {
  try {
    // TODO: implement disable_vpc_classic_link
    throw new Error("disable_vpc_classic_link not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disable_vpc_classic_link failed");
  }
}

/** Disable vpc classic link dns support. */
export async function disableVpcClassicLinkDnsSupport(): Promise<DisableVpcClassicLinkDnsSupportResult> {
  try {
    // TODO: implement disable_vpc_classic_link_dns_support
    throw new Error("disable_vpc_classic_link_dns_support not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disable_vpc_classic_link_dns_support failed");
  }
}

/** Disassociate address. */
export async function disassociateAddress(): Promise<void> {
  try {
    // TODO: implement disassociate_address
    throw new Error("disassociate_address not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disassociate_address failed");
  }
}

/** Disassociate capacity reservation billing owner. */
export async function disassociateCapacityReservationBillingOwner(capacityReservationId: string, unusedReservationBillingOwnerId: string, regionName?: string | undefined): Promise<DisassociateCapacityReservationBillingOwnerResult> {
  try {
    // TODO: implement disassociate_capacity_reservation_billing_owner
    throw new Error("disassociate_capacity_reservation_billing_owner not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disassociate_capacity_reservation_billing_owner failed");
  }
}

/** Disassociate client vpn target network. */
export async function disassociateClientVpnTargetNetwork(clientVpnEndpointId: string, associationId: string, regionName?: string | undefined): Promise<DisassociateClientVpnTargetNetworkResult> {
  try {
    // TODO: implement disassociate_client_vpn_target_network
    throw new Error("disassociate_client_vpn_target_network not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disassociate_client_vpn_target_network failed");
  }
}

/** Disassociate enclave certificate iam role. */
export async function disassociateEnclaveCertificateIamRole(certificateArn: string, roleArn: string, regionName?: string | undefined): Promise<DisassociateEnclaveCertificateIamRoleResult> {
  try {
    // TODO: implement disassociate_enclave_certificate_iam_role
    throw new Error("disassociate_enclave_certificate_iam_role not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disassociate_enclave_certificate_iam_role failed");
  }
}

/** Disassociate iam instance profile. */
export async function disassociateIamInstanceProfile(associationId: string, regionName?: string | undefined): Promise<DisassociateIamInstanceProfileResult> {
  try {
    // TODO: implement disassociate_iam_instance_profile
    throw new Error("disassociate_iam_instance_profile not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disassociate_iam_instance_profile failed");
  }
}

/** Disassociate instance event window. */
export async function disassociateInstanceEventWindow(instanceEventWindowId: string, associationTarget: Record<string, unknown>, regionName?: string | undefined): Promise<DisassociateInstanceEventWindowResult> {
  try {
    // TODO: implement disassociate_instance_event_window
    throw new Error("disassociate_instance_event_window not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disassociate_instance_event_window failed");
  }
}

/** Disassociate ipam byoasn. */
export async function disassociateIpamByoasn(asn: string, cidr: string, regionName?: string | undefined): Promise<DisassociateIpamByoasnResult> {
  try {
    // TODO: implement disassociate_ipam_byoasn
    throw new Error("disassociate_ipam_byoasn not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disassociate_ipam_byoasn failed");
  }
}

/** Disassociate ipam resource discovery. */
export async function disassociateIpamResourceDiscovery(ipamResourceDiscoveryAssociationId: string, regionName?: string | undefined): Promise<DisassociateIpamResourceDiscoveryResult> {
  try {
    // TODO: implement disassociate_ipam_resource_discovery
    throw new Error("disassociate_ipam_resource_discovery not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disassociate_ipam_resource_discovery failed");
  }
}

/** Disassociate nat gateway address. */
export async function disassociateNatGatewayAddress(natGatewayId: string, associationIds: string[]): Promise<DisassociateNatGatewayAddressResult> {
  try {
    // TODO: implement disassociate_nat_gateway_address
    throw new Error("disassociate_nat_gateway_address not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disassociate_nat_gateway_address failed");
  }
}

/** Disassociate route server. */
export async function disassociateRouteServer(routeServerId: string, vpcId: string, regionName?: string | undefined): Promise<DisassociateRouteServerResult> {
  try {
    // TODO: implement disassociate_route_server
    throw new Error("disassociate_route_server not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disassociate_route_server failed");
  }
}

/** Disassociate route table. */
export async function disassociateRouteTable(associationId: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement disassociate_route_table
    throw new Error("disassociate_route_table not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disassociate_route_table failed");
  }
}

/** Disassociate security group vpc. */
export async function disassociateSecurityGroupVpc(groupId: string, vpcId: string, regionName?: string | undefined): Promise<DisassociateSecurityGroupVpcResult> {
  try {
    // TODO: implement disassociate_security_group_vpc
    throw new Error("disassociate_security_group_vpc not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disassociate_security_group_vpc failed");
  }
}

/** Disassociate subnet cidr block. */
export async function disassociateSubnetCidrBlock(associationId: string, regionName?: string | undefined): Promise<DisassociateSubnetCidrBlockResult> {
  try {
    // TODO: implement disassociate_subnet_cidr_block
    throw new Error("disassociate_subnet_cidr_block not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disassociate_subnet_cidr_block failed");
  }
}

/** Disassociate transit gateway multicast domain. */
export async function disassociateTransitGatewayMulticastDomain(transitGatewayMulticastDomainId: string, transitGatewayAttachmentId: string, subnetIds: string[], regionName?: string | undefined): Promise<DisassociateTransitGatewayMulticastDomainResult> {
  try {
    // TODO: implement disassociate_transit_gateway_multicast_domain
    throw new Error("disassociate_transit_gateway_multicast_domain not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disassociate_transit_gateway_multicast_domain failed");
  }
}

/** Disassociate transit gateway policy table. */
export async function disassociateTransitGatewayPolicyTable(transitGatewayPolicyTableId: string, transitGatewayAttachmentId: string, regionName?: string | undefined): Promise<DisassociateTransitGatewayPolicyTableResult> {
  try {
    // TODO: implement disassociate_transit_gateway_policy_table
    throw new Error("disassociate_transit_gateway_policy_table not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disassociate_transit_gateway_policy_table failed");
  }
}

/** Disassociate transit gateway route table. */
export async function disassociateTransitGatewayRouteTable(transitGatewayRouteTableId: string, transitGatewayAttachmentId: string, regionName?: string | undefined): Promise<DisassociateTransitGatewayRouteTableResult> {
  try {
    // TODO: implement disassociate_transit_gateway_route_table
    throw new Error("disassociate_transit_gateway_route_table not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disassociate_transit_gateway_route_table failed");
  }
}

/** Disassociate trunk interface. */
export async function disassociateTrunkInterface(associationId: string): Promise<DisassociateTrunkInterfaceResult> {
  try {
    // TODO: implement disassociate_trunk_interface
    throw new Error("disassociate_trunk_interface not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disassociate_trunk_interface failed");
  }
}

/** Disassociate vpc cidr block. */
export async function disassociateVpcCidrBlock(associationId: string, regionName?: string | undefined): Promise<DisassociateVpcCidrBlockResult> {
  try {
    // TODO: implement disassociate_vpc_cidr_block
    throw new Error("disassociate_vpc_cidr_block not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disassociate_vpc_cidr_block failed");
  }
}

/** Enable address transfer. */
export async function enableAddressTransfer(allocationId: string, transferAccountId: string, regionName?: string | undefined): Promise<EnableAddressTransferResult> {
  try {
    // TODO: implement enable_address_transfer
    throw new Error("enable_address_transfer not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "enable_address_transfer failed");
  }
}

/** Enable allowed images settings. */
export async function enableAllowedImagesSettings(allowedImagesSettingsState: string, regionName?: string | undefined): Promise<EnableAllowedImagesSettingsResult> {
  try {
    // TODO: implement enable_allowed_images_settings
    throw new Error("enable_allowed_images_settings not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "enable_allowed_images_settings failed");
  }
}

/** Enable aws network performance metric subscription. */
export async function enableAwsNetworkPerformanceMetricSubscription(): Promise<EnableAwsNetworkPerformanceMetricSubscriptionResult> {
  try {
    // TODO: implement enable_aws_network_performance_metric_subscription
    throw new Error("enable_aws_network_performance_metric_subscription not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "enable_aws_network_performance_metric_subscription failed");
  }
}

/** Enable capacity manager. */
export async function enableCapacityManager(): Promise<EnableCapacityManagerResult> {
  try {
    // TODO: implement enable_capacity_manager
    throw new Error("enable_capacity_manager not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "enable_capacity_manager failed");
  }
}

/** Enable ebs encryption by default. */
export async function enableEbsEncryptionByDefault(regionName?: string | undefined): Promise<EnableEbsEncryptionByDefaultResult> {
  try {
    // TODO: implement enable_ebs_encryption_by_default
    throw new Error("enable_ebs_encryption_by_default not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "enable_ebs_encryption_by_default failed");
  }
}

/** Enable fast launch. */
export async function enableFastLaunch(imageId: string): Promise<EnableFastLaunchResult> {
  try {
    // TODO: implement enable_fast_launch
    throw new Error("enable_fast_launch not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "enable_fast_launch failed");
  }
}

/** Enable fast snapshot restores. */
export async function enableFastSnapshotRestores(sourceSnapshotIds: string[]): Promise<EnableFastSnapshotRestoresResult> {
  try {
    // TODO: implement enable_fast_snapshot_restores
    throw new Error("enable_fast_snapshot_restores not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "enable_fast_snapshot_restores failed");
  }
}

/** Enable image. */
export async function enableImage(imageId: string, regionName?: string | undefined): Promise<EnableImageResult> {
  try {
    // TODO: implement enable_image
    throw new Error("enable_image not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "enable_image failed");
  }
}

/** Enable image block public access. */
export async function enableImageBlockPublicAccess(imageBlockPublicAccessState: string, regionName?: string | undefined): Promise<EnableImageBlockPublicAccessResult> {
  try {
    // TODO: implement enable_image_block_public_access
    throw new Error("enable_image_block_public_access not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "enable_image_block_public_access failed");
  }
}

/** Enable image deprecation. */
export async function enableImageDeprecation(imageId: string, deprecateAt: string, regionName?: string | undefined): Promise<EnableImageDeprecationResult> {
  try {
    // TODO: implement enable_image_deprecation
    throw new Error("enable_image_deprecation not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "enable_image_deprecation failed");
  }
}

/** Enable image deregistration protection. */
export async function enableImageDeregistrationProtection(imageId: string): Promise<EnableImageDeregistrationProtectionResult> {
  try {
    // TODO: implement enable_image_deregistration_protection
    throw new Error("enable_image_deregistration_protection not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "enable_image_deregistration_protection failed");
  }
}

/** Enable ipam organization admin account. */
export async function enableIpamOrganizationAdminAccount(delegatedAdminAccountId: string, regionName?: string | undefined): Promise<EnableIpamOrganizationAdminAccountResult> {
  try {
    // TODO: implement enable_ipam_organization_admin_account
    throw new Error("enable_ipam_organization_admin_account not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "enable_ipam_organization_admin_account failed");
  }
}

/** Enable reachability analyzer organization sharing. */
export async function enableReachabilityAnalyzerOrganizationSharing(regionName?: string | undefined): Promise<EnableReachabilityAnalyzerOrganizationSharingResult> {
  try {
    // TODO: implement enable_reachability_analyzer_organization_sharing
    throw new Error("enable_reachability_analyzer_organization_sharing not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "enable_reachability_analyzer_organization_sharing failed");
  }
}

/** Enable route server propagation. */
export async function enableRouteServerPropagation(routeServerId: string, routeTableId: string, regionName?: string | undefined): Promise<EnableRouteServerPropagationResult> {
  try {
    // TODO: implement enable_route_server_propagation
    throw new Error("enable_route_server_propagation not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "enable_route_server_propagation failed");
  }
}

/** Enable serial console access. */
export async function enableSerialConsoleAccess(regionName?: string | undefined): Promise<EnableSerialConsoleAccessResult> {
  try {
    // TODO: implement enable_serial_console_access
    throw new Error("enable_serial_console_access not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "enable_serial_console_access failed");
  }
}

/** Enable snapshot block public access. */
export async function enableSnapshotBlockPublicAccess(state: string, regionName?: string | undefined): Promise<EnableSnapshotBlockPublicAccessResult> {
  try {
    // TODO: implement enable_snapshot_block_public_access
    throw new Error("enable_snapshot_block_public_access not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "enable_snapshot_block_public_access failed");
  }
}

/** Enable transit gateway route table propagation. */
export async function enableTransitGatewayRouteTablePropagation(transitGatewayRouteTableId: string): Promise<EnableTransitGatewayRouteTablePropagationResult> {
  try {
    // TODO: implement enable_transit_gateway_route_table_propagation
    throw new Error("enable_transit_gateway_route_table_propagation not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "enable_transit_gateway_route_table_propagation failed");
  }
}

/** Enable vgw route propagation. */
export async function enableVgwRoutePropagation(gatewayId: string, routeTableId: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement enable_vgw_route_propagation
    throw new Error("enable_vgw_route_propagation not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "enable_vgw_route_propagation failed");
  }
}

/** Enable volume io. */
export async function enableVolumeIo(volumeId: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement enable_volume_io
    throw new Error("enable_volume_io not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "enable_volume_io failed");
  }
}

/** Enable vpc classic link. */
export async function enableVpcClassicLink(vpcId: string, regionName?: string | undefined): Promise<EnableVpcClassicLinkResult> {
  try {
    // TODO: implement enable_vpc_classic_link
    throw new Error("enable_vpc_classic_link not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "enable_vpc_classic_link failed");
  }
}

/** Enable vpc classic link dns support. */
export async function enableVpcClassicLinkDnsSupport(): Promise<EnableVpcClassicLinkDnsSupportResult> {
  try {
    // TODO: implement enable_vpc_classic_link_dns_support
    throw new Error("enable_vpc_classic_link_dns_support not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "enable_vpc_classic_link_dns_support failed");
  }
}

/** Export client vpn client certificate revocation list. */
export async function exportClientVpnClientCertificateRevocationList(clientVpnEndpointId: string, regionName?: string | undefined): Promise<ExportClientVpnClientCertificateRevocationListResult> {
  try {
    // TODO: implement export_client_vpn_client_certificate_revocation_list
    throw new Error("export_client_vpn_client_certificate_revocation_list not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "export_client_vpn_client_certificate_revocation_list failed");
  }
}

/** Export client vpn client configuration. */
export async function exportClientVpnClientConfiguration(clientVpnEndpointId: string, regionName?: string | undefined): Promise<ExportClientVpnClientConfigurationResult> {
  try {
    // TODO: implement export_client_vpn_client_configuration
    throw new Error("export_client_vpn_client_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "export_client_vpn_client_configuration failed");
  }
}

/** Export image. */
export async function exportImage(diskImageFormat: string, imageId: string, s3ExportLocation: Record<string, unknown>): Promise<ExportImageResult> {
  try {
    // TODO: implement export_image
    throw new Error("export_image not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "export_image failed");
  }
}

/** Export transit gateway routes. */
export async function exportTransitGatewayRoutes(transitGatewayRouteTableId: string, s3Bucket: string): Promise<ExportTransitGatewayRoutesResult> {
  try {
    // TODO: implement export_transit_gateway_routes
    throw new Error("export_transit_gateway_routes not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "export_transit_gateway_routes failed");
  }
}

/** Export verified access instance client configuration. */
export async function exportVerifiedAccessInstanceClientConfiguration(verifiedAccessInstanceId: string, regionName?: string | undefined): Promise<ExportVerifiedAccessInstanceClientConfigurationResult> {
  try {
    // TODO: implement export_verified_access_instance_client_configuration
    throw new Error("export_verified_access_instance_client_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "export_verified_access_instance_client_configuration failed");
  }
}

/** Get active vpn tunnel status. */
export async function getActiveVpnTunnelStatus(vpnConnectionId: string, vpnTunnelOutsideIpAddress: string, regionName?: string | undefined): Promise<GetActiveVpnTunnelStatusResult> {
  try {
    // TODO: implement get_active_vpn_tunnel_status
    throw new Error("get_active_vpn_tunnel_status not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_active_vpn_tunnel_status failed");
  }
}

/** Get allowed images settings. */
export async function getAllowedImagesSettings(regionName?: string | undefined): Promise<GetAllowedImagesSettingsResult> {
  try {
    // TODO: implement get_allowed_images_settings
    throw new Error("get_allowed_images_settings not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_allowed_images_settings failed");
  }
}

/** Get associated enclave certificate iam roles. */
export async function getAssociatedEnclaveCertificateIamRoles(certificateArn: string, regionName?: string | undefined): Promise<GetAssociatedEnclaveCertificateIamRolesResult> {
  try {
    // TODO: implement get_associated_enclave_certificate_iam_roles
    throw new Error("get_associated_enclave_certificate_iam_roles not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_associated_enclave_certificate_iam_roles failed");
  }
}

/** Get associated ipv6 pool cidrs. */
export async function getAssociatedIpv6PoolCidrs(poolId: string): Promise<GetAssociatedIpv6PoolCidrsResult> {
  try {
    // TODO: implement get_associated_ipv6_pool_cidrs
    throw new Error("get_associated_ipv6_pool_cidrs not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_associated_ipv6_pool_cidrs failed");
  }
}

/** Get aws network performance data. */
export async function getAwsNetworkPerformanceData(): Promise<GetAwsNetworkPerformanceDataResult> {
  try {
    // TODO: implement get_aws_network_performance_data
    throw new Error("get_aws_network_performance_data not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_aws_network_performance_data failed");
  }
}

/** Get capacity manager attributes. */
export async function getCapacityManagerAttributes(regionName?: string | undefined): Promise<GetCapacityManagerAttributesResult> {
  try {
    // TODO: implement get_capacity_manager_attributes
    throw new Error("get_capacity_manager_attributes not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_capacity_manager_attributes failed");
  }
}

/** Get capacity manager metric data. */
export async function getCapacityManagerMetricData(metricNames: string[], startTime: string, endTime: string, period: number): Promise<GetCapacityManagerMetricDataResult> {
  try {
    // TODO: implement get_capacity_manager_metric_data
    throw new Error("get_capacity_manager_metric_data not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_capacity_manager_metric_data failed");
  }
}

/** Get capacity manager metric dimensions. */
export async function getCapacityManagerMetricDimensions(groupBy: string[], startTime: string, endTime: string, metricNames: string[]): Promise<GetCapacityManagerMetricDimensionsResult> {
  try {
    // TODO: implement get_capacity_manager_metric_dimensions
    throw new Error("get_capacity_manager_metric_dimensions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_capacity_manager_metric_dimensions failed");
  }
}

/** Get capacity reservation usage. */
export async function getCapacityReservationUsage(capacityReservationId: string): Promise<GetCapacityReservationUsageResult> {
  try {
    // TODO: implement get_capacity_reservation_usage
    throw new Error("get_capacity_reservation_usage not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_capacity_reservation_usage failed");
  }
}

/** Get coip pool usage. */
export async function getCoipPoolUsage(poolId: string): Promise<GetCoipPoolUsageResult> {
  try {
    // TODO: implement get_coip_pool_usage
    throw new Error("get_coip_pool_usage not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_coip_pool_usage failed");
  }
}

/** Get console output. */
export async function getConsoleOutput(instanceId: string): Promise<GetConsoleOutputResult> {
  try {
    // TODO: implement get_console_output
    throw new Error("get_console_output not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_console_output failed");
  }
}

/** Get console screenshot. */
export async function getConsoleScreenshot(instanceId: string): Promise<GetConsoleScreenshotResult> {
  try {
    // TODO: implement get_console_screenshot
    throw new Error("get_console_screenshot not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_console_screenshot failed");
  }
}

/** Get declarative policies report summary. */
export async function getDeclarativePoliciesReportSummary(reportId: string, regionName?: string | undefined): Promise<GetDeclarativePoliciesReportSummaryResult> {
  try {
    // TODO: implement get_declarative_policies_report_summary
    throw new Error("get_declarative_policies_report_summary not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_declarative_policies_report_summary failed");
  }
}

/** Get default credit specification. */
export async function getDefaultCreditSpecification(instanceFamily: string, regionName?: string | undefined): Promise<GetDefaultCreditSpecificationResult> {
  try {
    // TODO: implement get_default_credit_specification
    throw new Error("get_default_credit_specification not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_default_credit_specification failed");
  }
}

/** Get ebs default kms key id. */
export async function getEbsDefaultKmsKeyId(regionName?: string | undefined): Promise<GetEbsDefaultKmsKeyIdResult> {
  try {
    // TODO: implement get_ebs_default_kms_key_id
    throw new Error("get_ebs_default_kms_key_id not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_ebs_default_kms_key_id failed");
  }
}

/** Get ebs encryption by default. */
export async function getEbsEncryptionByDefault(regionName?: string | undefined): Promise<GetEbsEncryptionByDefaultResult> {
  try {
    // TODO: implement get_ebs_encryption_by_default
    throw new Error("get_ebs_encryption_by_default not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_ebs_encryption_by_default failed");
  }
}

/** Get flow logs integration template. */
export async function getFlowLogsIntegrationTemplate(flowLogId: string, configDeliveryS3DestinationArn: string, integrateServices: Record<string, unknown>, regionName?: string | undefined): Promise<GetFlowLogsIntegrationTemplateResult> {
  try {
    // TODO: implement get_flow_logs_integration_template
    throw new Error("get_flow_logs_integration_template not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_flow_logs_integration_template failed");
  }
}

/** Get groups for capacity reservation. */
export async function getGroupsForCapacityReservation(capacityReservationId: string): Promise<GetGroupsForCapacityReservationResult> {
  try {
    // TODO: implement get_groups_for_capacity_reservation
    throw new Error("get_groups_for_capacity_reservation not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_groups_for_capacity_reservation failed");
  }
}

/** Get host reservation purchase preview. */
export async function getHostReservationPurchasePreview(hostIdSet: string[], offeringId: string, regionName?: string | undefined): Promise<GetHostReservationPurchasePreviewResult> {
  try {
    // TODO: implement get_host_reservation_purchase_preview
    throw new Error("get_host_reservation_purchase_preview not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_host_reservation_purchase_preview failed");
  }
}

/** Get image ancestry. */
export async function getImageAncestry(imageId: string, regionName?: string | undefined): Promise<GetImageAncestryResult> {
  try {
    // TODO: implement get_image_ancestry
    throw new Error("get_image_ancestry not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_image_ancestry failed");
  }
}

/** Get image block public access state. */
export async function getImageBlockPublicAccessState(regionName?: string | undefined): Promise<GetImageBlockPublicAccessStateResult> {
  try {
    // TODO: implement get_image_block_public_access_state
    throw new Error("get_image_block_public_access_state not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_image_block_public_access_state failed");
  }
}

/** Get instance metadata defaults. */
export async function getInstanceMetadataDefaults(regionName?: string | undefined): Promise<GetInstanceMetadataDefaultsResult> {
  try {
    // TODO: implement get_instance_metadata_defaults
    throw new Error("get_instance_metadata_defaults not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_instance_metadata_defaults failed");
  }
}

/** Get instance tpm ek pub. */
export async function getInstanceTpmEkPub(instanceId: string, keyType: string, keyFormat: string, regionName?: string | undefined): Promise<GetInstanceTpmEkPubResult> {
  try {
    // TODO: implement get_instance_tpm_ek_pub
    throw new Error("get_instance_tpm_ek_pub not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_instance_tpm_ek_pub failed");
  }
}

/** Get instance types from instance requirements. */
export async function getInstanceTypesFromInstanceRequirements(architectureTypes: string[], virtualizationTypes: string[], instanceRequirements: Record<string, unknown>): Promise<GetInstanceTypesFromInstanceRequirementsResult> {
  try {
    // TODO: implement get_instance_types_from_instance_requirements
    throw new Error("get_instance_types_from_instance_requirements not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_instance_types_from_instance_requirements failed");
  }
}

/** Get instance uefi data. */
export async function getInstanceUefiData(instanceId: string, regionName?: string | undefined): Promise<GetInstanceUefiDataResult> {
  try {
    // TODO: implement get_instance_uefi_data
    throw new Error("get_instance_uefi_data not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_instance_uefi_data failed");
  }
}

/** Get ipam address history. */
export async function getIpamAddressHistory(cidr: string, ipamScopeId: string): Promise<GetIpamAddressHistoryResult> {
  try {
    // TODO: implement get_ipam_address_history
    throw new Error("get_ipam_address_history not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_ipam_address_history failed");
  }
}

/** Get ipam discovered accounts. */
export async function getIpamDiscoveredAccounts(ipamResourceDiscoveryId: string, discoveryRegion: string): Promise<GetIpamDiscoveredAccountsResult> {
  try {
    // TODO: implement get_ipam_discovered_accounts
    throw new Error("get_ipam_discovered_accounts not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_ipam_discovered_accounts failed");
  }
}

/** Get ipam discovered public addresses. */
export async function getIpamDiscoveredPublicAddresses(ipamResourceDiscoveryId: string, addressRegion: string): Promise<GetIpamDiscoveredPublicAddressesResult> {
  try {
    // TODO: implement get_ipam_discovered_public_addresses
    throw new Error("get_ipam_discovered_public_addresses not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_ipam_discovered_public_addresses failed");
  }
}

/** Get ipam discovered resource cidrs. */
export async function getIpamDiscoveredResourceCidrs(ipamResourceDiscoveryId: string, resourceRegion: string): Promise<GetIpamDiscoveredResourceCidrsResult> {
  try {
    // TODO: implement get_ipam_discovered_resource_cidrs
    throw new Error("get_ipam_discovered_resource_cidrs not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_ipam_discovered_resource_cidrs failed");
  }
}

/** Get ipam pool allocations. */
export async function getIpamPoolAllocations(ipamPoolId: string): Promise<GetIpamPoolAllocationsResult> {
  try {
    // TODO: implement get_ipam_pool_allocations
    throw new Error("get_ipam_pool_allocations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_ipam_pool_allocations failed");
  }
}

/** Get ipam pool cidrs. */
export async function getIpamPoolCidrs(ipamPoolId: string): Promise<GetIpamPoolCidrsResult> {
  try {
    // TODO: implement get_ipam_pool_cidrs
    throw new Error("get_ipam_pool_cidrs not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_ipam_pool_cidrs failed");
  }
}

/** Get ipam prefix list resolver rules. */
export async function getIpamPrefixListResolverRules(ipamPrefixListResolverId: string): Promise<GetIpamPrefixListResolverRulesResult> {
  try {
    // TODO: implement get_ipam_prefix_list_resolver_rules
    throw new Error("get_ipam_prefix_list_resolver_rules not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_ipam_prefix_list_resolver_rules failed");
  }
}

/** Get ipam prefix list resolver version entries. */
export async function getIpamPrefixListResolverVersionEntries(ipamPrefixListResolverId: string, ipamPrefixListResolverVersion: number): Promise<GetIpamPrefixListResolverVersionEntriesResult> {
  try {
    // TODO: implement get_ipam_prefix_list_resolver_version_entries
    throw new Error("get_ipam_prefix_list_resolver_version_entries not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_ipam_prefix_list_resolver_version_entries failed");
  }
}

/** Get ipam prefix list resolver versions. */
export async function getIpamPrefixListResolverVersions(ipamPrefixListResolverId: string): Promise<GetIpamPrefixListResolverVersionsResult> {
  try {
    // TODO: implement get_ipam_prefix_list_resolver_versions
    throw new Error("get_ipam_prefix_list_resolver_versions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_ipam_prefix_list_resolver_versions failed");
  }
}

/** Get ipam resource cidrs. */
export async function getIpamResourceCidrs(ipamScopeId: string): Promise<GetIpamResourceCidrsResult> {
  try {
    // TODO: implement get_ipam_resource_cidrs
    throw new Error("get_ipam_resource_cidrs not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_ipam_resource_cidrs failed");
  }
}

/** Get launch template data. */
export async function getLaunchTemplateData(instanceId: string, regionName?: string | undefined): Promise<GetLaunchTemplateDataResult> {
  try {
    // TODO: implement get_launch_template_data
    throw new Error("get_launch_template_data not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_launch_template_data failed");
  }
}

/** Get managed prefix list associations. */
export async function getManagedPrefixListAssociations(prefixListId: string): Promise<GetManagedPrefixListAssociationsResult> {
  try {
    // TODO: implement get_managed_prefix_list_associations
    throw new Error("get_managed_prefix_list_associations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_managed_prefix_list_associations failed");
  }
}

/** Get managed prefix list entries. */
export async function getManagedPrefixListEntries(prefixListId: string): Promise<GetManagedPrefixListEntriesResult> {
  try {
    // TODO: implement get_managed_prefix_list_entries
    throw new Error("get_managed_prefix_list_entries not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_managed_prefix_list_entries failed");
  }
}

/** Get network insights access scope analysis findings. */
export async function getNetworkInsightsAccessScopeAnalysisFindings(networkInsightsAccessScopeAnalysisId: string): Promise<GetNetworkInsightsAccessScopeAnalysisFindingsResult> {
  try {
    // TODO: implement get_network_insights_access_scope_analysis_findings
    throw new Error("get_network_insights_access_scope_analysis_findings not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_network_insights_access_scope_analysis_findings failed");
  }
}

/** Get network insights access scope content. */
export async function getNetworkInsightsAccessScopeContent(networkInsightsAccessScopeId: string, regionName?: string | undefined): Promise<GetNetworkInsightsAccessScopeContentResult> {
  try {
    // TODO: implement get_network_insights_access_scope_content
    throw new Error("get_network_insights_access_scope_content not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_network_insights_access_scope_content failed");
  }
}

/** Get password data. */
export async function getPasswordData(instanceId: string, regionName?: string | undefined): Promise<GetPasswordDataResult> {
  try {
    // TODO: implement get_password_data
    throw new Error("get_password_data not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_password_data failed");
  }
}

/** Get reserved instances exchange quote. */
export async function getReservedInstancesExchangeQuote(reservedInstanceIds: string[]): Promise<GetReservedInstancesExchangeQuoteResult> {
  try {
    // TODO: implement get_reserved_instances_exchange_quote
    throw new Error("get_reserved_instances_exchange_quote not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_reserved_instances_exchange_quote failed");
  }
}

/** Get route server associations. */
export async function getRouteServerAssociations(routeServerId: string, regionName?: string | undefined): Promise<GetRouteServerAssociationsResult> {
  try {
    // TODO: implement get_route_server_associations
    throw new Error("get_route_server_associations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_route_server_associations failed");
  }
}

/** Get route server propagations. */
export async function getRouteServerPropagations(routeServerId: string): Promise<GetRouteServerPropagationsResult> {
  try {
    // TODO: implement get_route_server_propagations
    throw new Error("get_route_server_propagations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_route_server_propagations failed");
  }
}

/** Get route server routing database. */
export async function getRouteServerRoutingDatabase(routeServerId: string): Promise<GetRouteServerRoutingDatabaseResult> {
  try {
    // TODO: implement get_route_server_routing_database
    throw new Error("get_route_server_routing_database not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_route_server_routing_database failed");
  }
}

/** Get security groups for vpc. */
export async function getSecurityGroupsForVpc(vpcId: string): Promise<GetSecurityGroupsForVpcResult> {
  try {
    // TODO: implement get_security_groups_for_vpc
    throw new Error("get_security_groups_for_vpc not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_security_groups_for_vpc failed");
  }
}

/** Get serial console access status. */
export async function getSerialConsoleAccessStatus(regionName?: string | undefined): Promise<GetSerialConsoleAccessStatusResult> {
  try {
    // TODO: implement get_serial_console_access_status
    throw new Error("get_serial_console_access_status not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_serial_console_access_status failed");
  }
}

/** Get snapshot block public access state. */
export async function getSnapshotBlockPublicAccessState(regionName?: string | undefined): Promise<GetSnapshotBlockPublicAccessStateResult> {
  try {
    // TODO: implement get_snapshot_block_public_access_state
    throw new Error("get_snapshot_block_public_access_state not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_snapshot_block_public_access_state failed");
  }
}

/** Get spot placement scores. */
export async function getSpotPlacementScores(targetCapacity: number): Promise<GetSpotPlacementScoresResult> {
  try {
    // TODO: implement get_spot_placement_scores
    throw new Error("get_spot_placement_scores not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_spot_placement_scores failed");
  }
}

/** Get subnet cidr reservations. */
export async function getSubnetCidrReservations(subnetId: string): Promise<GetSubnetCidrReservationsResult> {
  try {
    // TODO: implement get_subnet_cidr_reservations
    throw new Error("get_subnet_cidr_reservations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_subnet_cidr_reservations failed");
  }
}

/** Get transit gateway attachment propagations. */
export async function getTransitGatewayAttachmentPropagations(transitGatewayAttachmentId: string): Promise<GetTransitGatewayAttachmentPropagationsResult> {
  try {
    // TODO: implement get_transit_gateway_attachment_propagations
    throw new Error("get_transit_gateway_attachment_propagations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_transit_gateway_attachment_propagations failed");
  }
}

/** Get transit gateway multicast domain associations. */
export async function getTransitGatewayMulticastDomainAssociations(transitGatewayMulticastDomainId: string): Promise<GetTransitGatewayMulticastDomainAssociationsResult> {
  try {
    // TODO: implement get_transit_gateway_multicast_domain_associations
    throw new Error("get_transit_gateway_multicast_domain_associations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_transit_gateway_multicast_domain_associations failed");
  }
}

/** Get transit gateway policy table associations. */
export async function getTransitGatewayPolicyTableAssociations(transitGatewayPolicyTableId: string): Promise<GetTransitGatewayPolicyTableAssociationsResult> {
  try {
    // TODO: implement get_transit_gateway_policy_table_associations
    throw new Error("get_transit_gateway_policy_table_associations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_transit_gateway_policy_table_associations failed");
  }
}

/** Get transit gateway policy table entries. */
export async function getTransitGatewayPolicyTableEntries(transitGatewayPolicyTableId: string): Promise<GetTransitGatewayPolicyTableEntriesResult> {
  try {
    // TODO: implement get_transit_gateway_policy_table_entries
    throw new Error("get_transit_gateway_policy_table_entries not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_transit_gateway_policy_table_entries failed");
  }
}

/** Get transit gateway prefix list references. */
export async function getTransitGatewayPrefixListReferences(transitGatewayRouteTableId: string): Promise<GetTransitGatewayPrefixListReferencesResult> {
  try {
    // TODO: implement get_transit_gateway_prefix_list_references
    throw new Error("get_transit_gateway_prefix_list_references not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_transit_gateway_prefix_list_references failed");
  }
}

/** Get transit gateway route table associations. */
export async function getTransitGatewayRouteTableAssociations(transitGatewayRouteTableId: string): Promise<GetTransitGatewayRouteTableAssociationsResult> {
  try {
    // TODO: implement get_transit_gateway_route_table_associations
    throw new Error("get_transit_gateway_route_table_associations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_transit_gateway_route_table_associations failed");
  }
}

/** Get transit gateway route table propagations. */
export async function getTransitGatewayRouteTablePropagations(transitGatewayRouteTableId: string): Promise<GetTransitGatewayRouteTablePropagationsResult> {
  try {
    // TODO: implement get_transit_gateway_route_table_propagations
    throw new Error("get_transit_gateway_route_table_propagations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_transit_gateway_route_table_propagations failed");
  }
}

/** Get verified access endpoint policy. */
export async function getVerifiedAccessEndpointPolicy(verifiedAccessEndpointId: string, regionName?: string | undefined): Promise<GetVerifiedAccessEndpointPolicyResult> {
  try {
    // TODO: implement get_verified_access_endpoint_policy
    throw new Error("get_verified_access_endpoint_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_verified_access_endpoint_policy failed");
  }
}

/** Get verified access endpoint targets. */
export async function getVerifiedAccessEndpointTargets(verifiedAccessEndpointId: string): Promise<GetVerifiedAccessEndpointTargetsResult> {
  try {
    // TODO: implement get_verified_access_endpoint_targets
    throw new Error("get_verified_access_endpoint_targets not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_verified_access_endpoint_targets failed");
  }
}

/** Get verified access group policy. */
export async function getVerifiedAccessGroupPolicy(verifiedAccessGroupId: string, regionName?: string | undefined): Promise<GetVerifiedAccessGroupPolicyResult> {
  try {
    // TODO: implement get_verified_access_group_policy
    throw new Error("get_verified_access_group_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_verified_access_group_policy failed");
  }
}

/** Get vpn connection device sample configuration. */
export async function getVpnConnectionDeviceSampleConfiguration(vpnConnectionId: string, vpnConnectionDeviceTypeId: string): Promise<GetVpnConnectionDeviceSampleConfigurationResult> {
  try {
    // TODO: implement get_vpn_connection_device_sample_configuration
    throw new Error("get_vpn_connection_device_sample_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_vpn_connection_device_sample_configuration failed");
  }
}

/** Get vpn connection device types. */
export async function getVpnConnectionDeviceTypes(): Promise<GetVpnConnectionDeviceTypesResult> {
  try {
    // TODO: implement get_vpn_connection_device_types
    throw new Error("get_vpn_connection_device_types not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_vpn_connection_device_types failed");
  }
}

/** Get vpn tunnel replacement status. */
export async function getVpnTunnelReplacementStatus(vpnConnectionId: string, vpnTunnelOutsideIpAddress: string, regionName?: string | undefined): Promise<GetVpnTunnelReplacementStatusResult> {
  try {
    // TODO: implement get_vpn_tunnel_replacement_status
    throw new Error("get_vpn_tunnel_replacement_status not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_vpn_tunnel_replacement_status failed");
  }
}

/** Import client vpn client certificate revocation list. */
export async function importClientVpnClientCertificateRevocationList(clientVpnEndpointId: string, certificateRevocationList: string, regionName?: string | undefined): Promise<ImportClientVpnClientCertificateRevocationListResult> {
  try {
    // TODO: implement import_client_vpn_client_certificate_revocation_list
    throw new Error("import_client_vpn_client_certificate_revocation_list not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "import_client_vpn_client_certificate_revocation_list failed");
  }
}

/** Import image. */
export async function importImage(): Promise<ImportImageResult> {
  try {
    // TODO: implement import_image
    throw new Error("import_image not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "import_image failed");
  }
}

/** Import instance. */
export async function importInstance(platform: string): Promise<ImportInstanceResult> {
  try {
    // TODO: implement import_instance
    throw new Error("import_instance not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "import_instance failed");
  }
}

/** Import key pair. */
export async function importKeyPair(keyName: string, publicKeyMaterial: Uint8Array): Promise<ImportKeyPairResult> {
  try {
    // TODO: implement import_key_pair
    throw new Error("import_key_pair not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "import_key_pair failed");
  }
}

/** Import snapshot. */
export async function importSnapshot(): Promise<ImportSnapshotResult> {
  try {
    // TODO: implement import_snapshot
    throw new Error("import_snapshot not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "import_snapshot failed");
  }
}

/** Import volume. */
export async function importVolume(image: Record<string, unknown>, volume: Record<string, unknown>): Promise<ImportVolumeResult> {
  try {
    // TODO: implement import_volume
    throw new Error("import_volume not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "import_volume failed");
  }
}

/** List images in recycle bin. */
export async function listImagesInRecycleBin(): Promise<ListImagesInRecycleBinResult> {
  try {
    // TODO: implement list_images_in_recycle_bin
    throw new Error("list_images_in_recycle_bin not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_images_in_recycle_bin failed");
  }
}

/** List snapshots in recycle bin. */
export async function listSnapshotsInRecycleBin(): Promise<ListSnapshotsInRecycleBinResult> {
  try {
    // TODO: implement list_snapshots_in_recycle_bin
    throw new Error("list_snapshots_in_recycle_bin not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_snapshots_in_recycle_bin failed");
  }
}

/** Lock snapshot. */
export async function lockSnapshot(snapshotId: string, lockMode: string): Promise<LockSnapshotResult> {
  try {
    // TODO: implement lock_snapshot
    throw new Error("lock_snapshot not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "lock_snapshot failed");
  }
}

/** Modify address attribute. */
export async function modifyAddressAttribute(allocationId: string): Promise<ModifyAddressAttributeResult> {
  try {
    // TODO: implement modify_address_attribute
    throw new Error("modify_address_attribute not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_address_attribute failed");
  }
}

/** Modify availability zone group. */
export async function modifyAvailabilityZoneGroup(groupName: string, optInStatus: string, regionName?: string | undefined): Promise<ModifyAvailabilityZoneGroupResult> {
  try {
    // TODO: implement modify_availability_zone_group
    throw new Error("modify_availability_zone_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_availability_zone_group failed");
  }
}

/** Modify capacity reservation. */
export async function modifyCapacityReservation(capacityReservationId: string): Promise<ModifyCapacityReservationResult> {
  try {
    // TODO: implement modify_capacity_reservation
    throw new Error("modify_capacity_reservation not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_capacity_reservation failed");
  }
}

/** Modify capacity reservation fleet. */
export async function modifyCapacityReservationFleet(capacityReservationFleetId: string): Promise<ModifyCapacityReservationFleetResult> {
  try {
    // TODO: implement modify_capacity_reservation_fleet
    throw new Error("modify_capacity_reservation_fleet not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_capacity_reservation_fleet failed");
  }
}

/** Modify client vpn endpoint. */
export async function modifyClientVpnEndpoint(clientVpnEndpointId: string): Promise<ModifyClientVpnEndpointResult> {
  try {
    // TODO: implement modify_client_vpn_endpoint
    throw new Error("modify_client_vpn_endpoint not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_client_vpn_endpoint failed");
  }
}

/** Modify default credit specification. */
export async function modifyDefaultCreditSpecification(instanceFamily: string, cpuCredits: string, regionName?: string | undefined): Promise<ModifyDefaultCreditSpecificationResult> {
  try {
    // TODO: implement modify_default_credit_specification
    throw new Error("modify_default_credit_specification not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_default_credit_specification failed");
  }
}

/** Modify ebs default kms key id. */
export async function modifyEbsDefaultKmsKeyId(kmsKeyId: string, regionName?: string | undefined): Promise<ModifyEbsDefaultKmsKeyIdResult> {
  try {
    // TODO: implement modify_ebs_default_kms_key_id
    throw new Error("modify_ebs_default_kms_key_id not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_ebs_default_kms_key_id failed");
  }
}

/** Modify fleet. */
export async function modifyFleet(fleetId: string): Promise<ModifyFleetResult> {
  try {
    // TODO: implement modify_fleet
    throw new Error("modify_fleet not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_fleet failed");
  }
}

/** Modify fpga image attribute. */
export async function modifyFpgaImageAttribute(fpgaImageId: string): Promise<ModifyFpgaImageAttributeResult> {
  try {
    // TODO: implement modify_fpga_image_attribute
    throw new Error("modify_fpga_image_attribute not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_fpga_image_attribute failed");
  }
}

/** Modify hosts. */
export async function modifyHosts(hostIds: string[]): Promise<ModifyHostsResult> {
  try {
    // TODO: implement modify_hosts
    throw new Error("modify_hosts not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_hosts failed");
  }
}

/** Modify id format. */
export async function modifyIdFormat(resource: string, useLongIds: boolean, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement modify_id_format
    throw new Error("modify_id_format not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_id_format failed");
  }
}

/** Modify identity id format. */
export async function modifyIdentityIdFormat(resource: string, useLongIds: boolean, principalArn: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement modify_identity_id_format
    throw new Error("modify_identity_id_format not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_identity_id_format failed");
  }
}

/** Modify image attribute. */
export async function modifyImageAttribute(imageId: string): Promise<void> {
  try {
    // TODO: implement modify_image_attribute
    throw new Error("modify_image_attribute not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_image_attribute failed");
  }
}

/** Modify instance attribute. */
export async function modifyInstanceAttribute(instanceId: string): Promise<void> {
  try {
    // TODO: implement modify_instance_attribute
    throw new Error("modify_instance_attribute not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_instance_attribute failed");
  }
}

/** Modify instance capacity reservation attributes. */
export async function modifyInstanceCapacityReservationAttributes(instanceId: string, capacityReservationSpecification: Record<string, unknown>, regionName?: string | undefined): Promise<ModifyInstanceCapacityReservationAttributesResult> {
  try {
    // TODO: implement modify_instance_capacity_reservation_attributes
    throw new Error("modify_instance_capacity_reservation_attributes not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_instance_capacity_reservation_attributes failed");
  }
}

/** Modify instance connect endpoint. */
export async function modifyInstanceConnectEndpoint(instanceConnectEndpointId: string): Promise<ModifyInstanceConnectEndpointResult> {
  try {
    // TODO: implement modify_instance_connect_endpoint
    throw new Error("modify_instance_connect_endpoint not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_instance_connect_endpoint failed");
  }
}

/** Modify instance cpu options. */
export async function modifyInstanceCpuOptions(instanceId: string, coreCount: number, threadsPerCore: number, regionName?: string | undefined): Promise<ModifyInstanceCpuOptionsResult> {
  try {
    // TODO: implement modify_instance_cpu_options
    throw new Error("modify_instance_cpu_options not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_instance_cpu_options failed");
  }
}

/** Modify instance credit specification. */
export async function modifyInstanceCreditSpecification(instanceCreditSpecifications: Record<string, unknown>[]): Promise<ModifyInstanceCreditSpecificationResult> {
  try {
    // TODO: implement modify_instance_credit_specification
    throw new Error("modify_instance_credit_specification not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_instance_credit_specification failed");
  }
}

/** Modify instance event start time. */
export async function modifyInstanceEventStartTime(instanceId: string, instanceEventId: string, notBefore: string, regionName?: string | undefined): Promise<ModifyInstanceEventStartTimeResult> {
  try {
    // TODO: implement modify_instance_event_start_time
    throw new Error("modify_instance_event_start_time not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_instance_event_start_time failed");
  }
}

/** Modify instance event window. */
export async function modifyInstanceEventWindow(instanceEventWindowId: string): Promise<ModifyInstanceEventWindowResult> {
  try {
    // TODO: implement modify_instance_event_window
    throw new Error("modify_instance_event_window not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_instance_event_window failed");
  }
}

/** Modify instance maintenance options. */
export async function modifyInstanceMaintenanceOptions(instanceId: string): Promise<ModifyInstanceMaintenanceOptionsResult> {
  try {
    // TODO: implement modify_instance_maintenance_options
    throw new Error("modify_instance_maintenance_options not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_instance_maintenance_options failed");
  }
}

/** Modify instance metadata defaults. */
export async function modifyInstanceMetadataDefaults(): Promise<ModifyInstanceMetadataDefaultsResult> {
  try {
    // TODO: implement modify_instance_metadata_defaults
    throw new Error("modify_instance_metadata_defaults not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_instance_metadata_defaults failed");
  }
}

/** Modify instance metadata options. */
export async function modifyInstanceMetadataOptions(instanceId: string): Promise<ModifyInstanceMetadataOptionsResult> {
  try {
    // TODO: implement modify_instance_metadata_options
    throw new Error("modify_instance_metadata_options not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_instance_metadata_options failed");
  }
}

/** Modify instance network performance options. */
export async function modifyInstanceNetworkPerformanceOptions(instanceId: string, bandwidthWeighting: string, regionName?: string | undefined): Promise<ModifyInstanceNetworkPerformanceOptionsResult> {
  try {
    // TODO: implement modify_instance_network_performance_options
    throw new Error("modify_instance_network_performance_options not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_instance_network_performance_options failed");
  }
}

/** Modify instance placement. */
export async function modifyInstancePlacement(instanceId: string): Promise<ModifyInstancePlacementResult> {
  try {
    // TODO: implement modify_instance_placement
    throw new Error("modify_instance_placement not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_instance_placement failed");
  }
}

/** Modify ipam. */
export async function modifyIpam(ipamId: string): Promise<ModifyIpamResult> {
  try {
    // TODO: implement modify_ipam
    throw new Error("modify_ipam not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_ipam failed");
  }
}

/** Modify ipam pool. */
export async function modifyIpamPool(ipamPoolId: string): Promise<ModifyIpamPoolResult> {
  try {
    // TODO: implement modify_ipam_pool
    throw new Error("modify_ipam_pool not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_ipam_pool failed");
  }
}

/** Modify ipam prefix list resolver. */
export async function modifyIpamPrefixListResolver(ipamPrefixListResolverId: string): Promise<ModifyIpamPrefixListResolverResult> {
  try {
    // TODO: implement modify_ipam_prefix_list_resolver
    throw new Error("modify_ipam_prefix_list_resolver not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_ipam_prefix_list_resolver failed");
  }
}

/** Modify ipam prefix list resolver target. */
export async function modifyIpamPrefixListResolverTarget(ipamPrefixListResolverTargetId: string): Promise<ModifyIpamPrefixListResolverTargetResult> {
  try {
    // TODO: implement modify_ipam_prefix_list_resolver_target
    throw new Error("modify_ipam_prefix_list_resolver_target not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_ipam_prefix_list_resolver_target failed");
  }
}

/** Modify ipam resource cidr. */
export async function modifyIpamResourceCidr(resourceId: string, resourceCidr: string, resourceRegion: string, currentIpamScopeId: string, monitored: boolean): Promise<ModifyIpamResourceCidrResult> {
  try {
    // TODO: implement modify_ipam_resource_cidr
    throw new Error("modify_ipam_resource_cidr not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_ipam_resource_cidr failed");
  }
}

/** Modify ipam resource discovery. */
export async function modifyIpamResourceDiscovery(ipamResourceDiscoveryId: string): Promise<ModifyIpamResourceDiscoveryResult> {
  try {
    // TODO: implement modify_ipam_resource_discovery
    throw new Error("modify_ipam_resource_discovery not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_ipam_resource_discovery failed");
  }
}

/** Modify ipam scope. */
export async function modifyIpamScope(ipamScopeId: string): Promise<ModifyIpamScopeResult> {
  try {
    // TODO: implement modify_ipam_scope
    throw new Error("modify_ipam_scope not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_ipam_scope failed");
  }
}

/** Modify launch template. */
export async function modifyLaunchTemplate(): Promise<ModifyLaunchTemplateResult> {
  try {
    // TODO: implement modify_launch_template
    throw new Error("modify_launch_template not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_launch_template failed");
  }
}

/** Modify local gateway route. */
export async function modifyLocalGatewayRoute(localGatewayRouteTableId: string): Promise<ModifyLocalGatewayRouteResult> {
  try {
    // TODO: implement modify_local_gateway_route
    throw new Error("modify_local_gateway_route not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_local_gateway_route failed");
  }
}

/** Modify managed prefix list. */
export async function modifyManagedPrefixList(prefixListId: string): Promise<ModifyManagedPrefixListResult> {
  try {
    // TODO: implement modify_managed_prefix_list
    throw new Error("modify_managed_prefix_list not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_managed_prefix_list failed");
  }
}

/** Modify network interface attribute. */
export async function modifyNetworkInterfaceAttribute(networkInterfaceId: string): Promise<void> {
  try {
    // TODO: implement modify_network_interface_attribute
    throw new Error("modify_network_interface_attribute not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_network_interface_attribute failed");
  }
}

/** Modify private dns name options. */
export async function modifyPrivateDnsNameOptions(instanceId: string): Promise<ModifyPrivateDnsNameOptionsResult> {
  try {
    // TODO: implement modify_private_dns_name_options
    throw new Error("modify_private_dns_name_options not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_private_dns_name_options failed");
  }
}

/** Modify public ip dns name options. */
export async function modifyPublicIpDnsNameOptions(networkInterfaceId: string, hostnameType: string, regionName?: string | undefined): Promise<ModifyPublicIpDnsNameOptionsResult> {
  try {
    // TODO: implement modify_public_ip_dns_name_options
    throw new Error("modify_public_ip_dns_name_options not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_public_ip_dns_name_options failed");
  }
}

/** Modify reserved instances. */
export async function modifyReservedInstances(reservedInstancesIds: string[], targetConfigurations: Record<string, unknown>[]): Promise<ModifyReservedInstancesResult> {
  try {
    // TODO: implement modify_reserved_instances
    throw new Error("modify_reserved_instances not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_reserved_instances failed");
  }
}

/** Modify route server. */
export async function modifyRouteServer(routeServerId: string): Promise<ModifyRouteServerResult> {
  try {
    // TODO: implement modify_route_server
    throw new Error("modify_route_server not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_route_server failed");
  }
}

/** Modify security group rules. */
export async function modifySecurityGroupRules(groupId: string, securityGroupRules: Record<string, unknown>[], regionName?: string | undefined): Promise<ModifySecurityGroupRulesResult> {
  try {
    // TODO: implement modify_security_group_rules
    throw new Error("modify_security_group_rules not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_security_group_rules failed");
  }
}

/** Modify snapshot attribute. */
export async function modifySnapshotAttribute(snapshotId: string): Promise<void> {
  try {
    // TODO: implement modify_snapshot_attribute
    throw new Error("modify_snapshot_attribute not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_snapshot_attribute failed");
  }
}

/** Modify snapshot tier. */
export async function modifySnapshotTier(snapshotId: string): Promise<ModifySnapshotTierResult> {
  try {
    // TODO: implement modify_snapshot_tier
    throw new Error("modify_snapshot_tier not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_snapshot_tier failed");
  }
}

/** Modify spot fleet request. */
export async function modifySpotFleetRequest(spotFleetRequestId: string): Promise<ModifySpotFleetRequestResult> {
  try {
    // TODO: implement modify_spot_fleet_request
    throw new Error("modify_spot_fleet_request not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_spot_fleet_request failed");
  }
}

/** Modify subnet attribute. */
export async function modifySubnetAttribute(subnetId: string): Promise<void> {
  try {
    // TODO: implement modify_subnet_attribute
    throw new Error("modify_subnet_attribute not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_subnet_attribute failed");
  }
}

/** Modify traffic mirror filter network services. */
export async function modifyTrafficMirrorFilterNetworkServices(trafficMirrorFilterId: string): Promise<ModifyTrafficMirrorFilterNetworkServicesResult> {
  try {
    // TODO: implement modify_traffic_mirror_filter_network_services
    throw new Error("modify_traffic_mirror_filter_network_services not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_traffic_mirror_filter_network_services failed");
  }
}

/** Modify traffic mirror filter rule. */
export async function modifyTrafficMirrorFilterRule(trafficMirrorFilterRuleId: string): Promise<ModifyTrafficMirrorFilterRuleResult> {
  try {
    // TODO: implement modify_traffic_mirror_filter_rule
    throw new Error("modify_traffic_mirror_filter_rule not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_traffic_mirror_filter_rule failed");
  }
}

/** Modify traffic mirror session. */
export async function modifyTrafficMirrorSession(trafficMirrorSessionId: string): Promise<ModifyTrafficMirrorSessionResult> {
  try {
    // TODO: implement modify_traffic_mirror_session
    throw new Error("modify_traffic_mirror_session not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_traffic_mirror_session failed");
  }
}

/** Modify transit gateway. */
export async function modifyTransitGateway(transitGatewayId: string): Promise<ModifyTransitGatewayResult> {
  try {
    // TODO: implement modify_transit_gateway
    throw new Error("modify_transit_gateway not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_transit_gateway failed");
  }
}

/** Modify transit gateway prefix list reference. */
export async function modifyTransitGatewayPrefixListReference(transitGatewayRouteTableId: string, prefixListId: string): Promise<ModifyTransitGatewayPrefixListReferenceResult> {
  try {
    // TODO: implement modify_transit_gateway_prefix_list_reference
    throw new Error("modify_transit_gateway_prefix_list_reference not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_transit_gateway_prefix_list_reference failed");
  }
}

/** Modify transit gateway vpc attachment. */
export async function modifyTransitGatewayVpcAttachment(transitGatewayAttachmentId: string): Promise<ModifyTransitGatewayVpcAttachmentResult> {
  try {
    // TODO: implement modify_transit_gateway_vpc_attachment
    throw new Error("modify_transit_gateway_vpc_attachment not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_transit_gateway_vpc_attachment failed");
  }
}

/** Modify verified access endpoint. */
export async function modifyVerifiedAccessEndpoint(verifiedAccessEndpointId: string): Promise<ModifyVerifiedAccessEndpointResult> {
  try {
    // TODO: implement modify_verified_access_endpoint
    throw new Error("modify_verified_access_endpoint not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_verified_access_endpoint failed");
  }
}

/** Modify verified access endpoint policy. */
export async function modifyVerifiedAccessEndpointPolicy(verifiedAccessEndpointId: string): Promise<ModifyVerifiedAccessEndpointPolicyResult> {
  try {
    // TODO: implement modify_verified_access_endpoint_policy
    throw new Error("modify_verified_access_endpoint_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_verified_access_endpoint_policy failed");
  }
}

/** Modify verified access group. */
export async function modifyVerifiedAccessGroup(verifiedAccessGroupId: string): Promise<ModifyVerifiedAccessGroupResult> {
  try {
    // TODO: implement modify_verified_access_group
    throw new Error("modify_verified_access_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_verified_access_group failed");
  }
}

/** Modify verified access group policy. */
export async function modifyVerifiedAccessGroupPolicy(verifiedAccessGroupId: string): Promise<ModifyVerifiedAccessGroupPolicyResult> {
  try {
    // TODO: implement modify_verified_access_group_policy
    throw new Error("modify_verified_access_group_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_verified_access_group_policy failed");
  }
}

/** Modify verified access instance. */
export async function modifyVerifiedAccessInstance(verifiedAccessInstanceId: string): Promise<ModifyVerifiedAccessInstanceResult> {
  try {
    // TODO: implement modify_verified_access_instance
    throw new Error("modify_verified_access_instance not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_verified_access_instance failed");
  }
}

/** Modify verified access instance logging configuration. */
export async function modifyVerifiedAccessInstanceLoggingConfiguration(verifiedAccessInstanceId: string, accessLogs: Record<string, unknown>): Promise<ModifyVerifiedAccessInstanceLoggingConfigurationResult> {
  try {
    // TODO: implement modify_verified_access_instance_logging_configuration
    throw new Error("modify_verified_access_instance_logging_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_verified_access_instance_logging_configuration failed");
  }
}

/** Modify verified access trust provider. */
export async function modifyVerifiedAccessTrustProvider(verifiedAccessTrustProviderId: string): Promise<ModifyVerifiedAccessTrustProviderResult> {
  try {
    // TODO: implement modify_verified_access_trust_provider
    throw new Error("modify_verified_access_trust_provider not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_verified_access_trust_provider failed");
  }
}

/** Modify volume. */
export async function modifyVolume(volumeId: string): Promise<ModifyVolumeResult> {
  try {
    // TODO: implement modify_volume
    throw new Error("modify_volume not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_volume failed");
  }
}

/** Modify volume attribute. */
export async function modifyVolumeAttribute(volumeId: string): Promise<void> {
  try {
    // TODO: implement modify_volume_attribute
    throw new Error("modify_volume_attribute not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_volume_attribute failed");
  }
}

/** Modify vpc attribute. */
export async function modifyVpcAttribute(vpcId: string): Promise<void> {
  try {
    // TODO: implement modify_vpc_attribute
    throw new Error("modify_vpc_attribute not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_vpc_attribute failed");
  }
}

/** Modify vpc block public access exclusion. */
export async function modifyVpcBlockPublicAccessExclusion(exclusionId: string, internetGatewayExclusionMode: string, regionName?: string | undefined): Promise<ModifyVpcBlockPublicAccessExclusionResult> {
  try {
    // TODO: implement modify_vpc_block_public_access_exclusion
    throw new Error("modify_vpc_block_public_access_exclusion not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_vpc_block_public_access_exclusion failed");
  }
}

/** Modify vpc block public access options. */
export async function modifyVpcBlockPublicAccessOptions(internetGatewayBlockMode: string, regionName?: string | undefined): Promise<ModifyVpcBlockPublicAccessOptionsResult> {
  try {
    // TODO: implement modify_vpc_block_public_access_options
    throw new Error("modify_vpc_block_public_access_options not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_vpc_block_public_access_options failed");
  }
}

/** Modify vpc endpoint. */
export async function modifyVpcEndpoint(vpcEndpointId: string): Promise<ModifyVpcEndpointResult> {
  try {
    // TODO: implement modify_vpc_endpoint
    throw new Error("modify_vpc_endpoint not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_vpc_endpoint failed");
  }
}

/** Modify vpc endpoint connection notification. */
export async function modifyVpcEndpointConnectionNotification(connectionNotificationId: string): Promise<ModifyVpcEndpointConnectionNotificationResult> {
  try {
    // TODO: implement modify_vpc_endpoint_connection_notification
    throw new Error("modify_vpc_endpoint_connection_notification not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_vpc_endpoint_connection_notification failed");
  }
}

/** Modify vpc endpoint service configuration. */
export async function modifyVpcEndpointServiceConfiguration(serviceId: string): Promise<ModifyVpcEndpointServiceConfigurationResult> {
  try {
    // TODO: implement modify_vpc_endpoint_service_configuration
    throw new Error("modify_vpc_endpoint_service_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_vpc_endpoint_service_configuration failed");
  }
}

/** Modify vpc endpoint service payer responsibility. */
export async function modifyVpcEndpointServicePayerResponsibility(serviceId: string, payerResponsibility: string, regionName?: string | undefined): Promise<ModifyVpcEndpointServicePayerResponsibilityResult> {
  try {
    // TODO: implement modify_vpc_endpoint_service_payer_responsibility
    throw new Error("modify_vpc_endpoint_service_payer_responsibility not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_vpc_endpoint_service_payer_responsibility failed");
  }
}

/** Modify vpc endpoint service permissions. */
export async function modifyVpcEndpointServicePermissions(serviceId: string): Promise<ModifyVpcEndpointServicePermissionsResult> {
  try {
    // TODO: implement modify_vpc_endpoint_service_permissions
    throw new Error("modify_vpc_endpoint_service_permissions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_vpc_endpoint_service_permissions failed");
  }
}

/** Modify vpc peering connection options. */
export async function modifyVpcPeeringConnectionOptions(vpcPeeringConnectionId: string): Promise<ModifyVpcPeeringConnectionOptionsResult> {
  try {
    // TODO: implement modify_vpc_peering_connection_options
    throw new Error("modify_vpc_peering_connection_options not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_vpc_peering_connection_options failed");
  }
}

/** Modify vpc tenancy. */
export async function modifyVpcTenancy(vpcId: string, instanceTenancy: string, regionName?: string | undefined): Promise<ModifyVpcTenancyResult> {
  try {
    // TODO: implement modify_vpc_tenancy
    throw new Error("modify_vpc_tenancy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_vpc_tenancy failed");
  }
}

/** Modify vpn connection. */
export async function modifyVpnConnection(vpnConnectionId: string): Promise<ModifyVpnConnectionResult> {
  try {
    // TODO: implement modify_vpn_connection
    throw new Error("modify_vpn_connection not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_vpn_connection failed");
  }
}

/** Modify vpn connection options. */
export async function modifyVpnConnectionOptions(vpnConnectionId: string): Promise<ModifyVpnConnectionOptionsResult> {
  try {
    // TODO: implement modify_vpn_connection_options
    throw new Error("modify_vpn_connection_options not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_vpn_connection_options failed");
  }
}

/** Modify vpn tunnel certificate. */
export async function modifyVpnTunnelCertificate(vpnConnectionId: string, vpnTunnelOutsideIpAddress: string, regionName?: string | undefined): Promise<ModifyVpnTunnelCertificateResult> {
  try {
    // TODO: implement modify_vpn_tunnel_certificate
    throw new Error("modify_vpn_tunnel_certificate not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_vpn_tunnel_certificate failed");
  }
}

/** Modify vpn tunnel options. */
export async function modifyVpnTunnelOptions(vpnConnectionId: string, vpnTunnelOutsideIpAddress: string, tunnelOptions: Record<string, unknown>): Promise<ModifyVpnTunnelOptionsResult> {
  try {
    // TODO: implement modify_vpn_tunnel_options
    throw new Error("modify_vpn_tunnel_options not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "modify_vpn_tunnel_options failed");
  }
}

/** Monitor instances. */
export async function monitorInstances(instanceIds: string[], regionName?: string | undefined): Promise<MonitorInstancesResult> {
  try {
    // TODO: implement monitor_instances
    throw new Error("monitor_instances not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "monitor_instances failed");
  }
}

/** Move address to vpc. */
export async function moveAddressToVpc(publicIp: string, regionName?: string | undefined): Promise<MoveAddressToVpcResult> {
  try {
    // TODO: implement move_address_to_vpc
    throw new Error("move_address_to_vpc not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "move_address_to_vpc failed");
  }
}

/** Move byoip cidr to ipam. */
export async function moveByoipCidrToIpam(cidr: string, ipamPoolId: string, ipamPoolOwner: string, regionName?: string | undefined): Promise<MoveByoipCidrToIpamResult> {
  try {
    // TODO: implement move_byoip_cidr_to_ipam
    throw new Error("move_byoip_cidr_to_ipam not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "move_byoip_cidr_to_ipam failed");
  }
}

/** Move capacity reservation instances. */
export async function moveCapacityReservationInstances(sourceCapacityReservationId: string, destinationCapacityReservationId: string, instanceCount: number): Promise<MoveCapacityReservationInstancesResult> {
  try {
    // TODO: implement move_capacity_reservation_instances
    throw new Error("move_capacity_reservation_instances not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "move_capacity_reservation_instances failed");
  }
}

/** Provision byoip cidr. */
export async function provisionByoipCidr(cidr: string): Promise<ProvisionByoipCidrResult> {
  try {
    // TODO: implement provision_byoip_cidr
    throw new Error("provision_byoip_cidr not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "provision_byoip_cidr failed");
  }
}

/** Provision ipam byoasn. */
export async function provisionIpamByoasn(ipamId: string, asn: string, asnAuthorizationContext: Record<string, unknown>, regionName?: string | undefined): Promise<ProvisionIpamByoasnResult> {
  try {
    // TODO: implement provision_ipam_byoasn
    throw new Error("provision_ipam_byoasn not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "provision_ipam_byoasn failed");
  }
}

/** Provision ipam pool cidr. */
export async function provisionIpamPoolCidr(ipamPoolId: string): Promise<ProvisionIpamPoolCidrResult> {
  try {
    // TODO: implement provision_ipam_pool_cidr
    throw new Error("provision_ipam_pool_cidr not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "provision_ipam_pool_cidr failed");
  }
}

/** Provision public ipv4 pool cidr. */
export async function provisionPublicIpv4PoolCidr(ipamPoolId: string, poolId: string, netmaskLength: number): Promise<ProvisionPublicIpv4PoolCidrResult> {
  try {
    // TODO: implement provision_public_ipv4_pool_cidr
    throw new Error("provision_public_ipv4_pool_cidr not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "provision_public_ipv4_pool_cidr failed");
  }
}

/** Purchase capacity block. */
export async function purchaseCapacityBlock(capacityBlockOfferingId: string, instancePlatform: string): Promise<PurchaseCapacityBlockResult> {
  try {
    // TODO: implement purchase_capacity_block
    throw new Error("purchase_capacity_block not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "purchase_capacity_block failed");
  }
}

/** Purchase capacity block extension. */
export async function purchaseCapacityBlockExtension(capacityBlockExtensionOfferingId: string, capacityReservationId: string, regionName?: string | undefined): Promise<PurchaseCapacityBlockExtensionResult> {
  try {
    // TODO: implement purchase_capacity_block_extension
    throw new Error("purchase_capacity_block_extension not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "purchase_capacity_block_extension failed");
  }
}

/** Purchase host reservation. */
export async function purchaseHostReservation(hostIdSet: string[], offeringId: string): Promise<PurchaseHostReservationResult> {
  try {
    // TODO: implement purchase_host_reservation
    throw new Error("purchase_host_reservation not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "purchase_host_reservation failed");
  }
}

/** Purchase reserved instances offering. */
export async function purchaseReservedInstancesOffering(instanceCount: number, reservedInstancesOfferingId: string): Promise<PurchaseReservedInstancesOfferingResult> {
  try {
    // TODO: implement purchase_reserved_instances_offering
    throw new Error("purchase_reserved_instances_offering not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "purchase_reserved_instances_offering failed");
  }
}

/** Purchase scheduled instances. */
export async function purchaseScheduledInstances(purchaseRequests: Record<string, unknown>[]): Promise<PurchaseScheduledInstancesResult> {
  try {
    // TODO: implement purchase_scheduled_instances
    throw new Error("purchase_scheduled_instances not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "purchase_scheduled_instances failed");
  }
}

/** Register image. */
export async function registerImage(name: string): Promise<RegisterImageResult> {
  try {
    // TODO: implement register_image
    throw new Error("register_image not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "register_image failed");
  }
}

/** Register instance event notification attributes. */
export async function registerInstanceEventNotificationAttributes(instanceTagAttribute: Record<string, unknown>, regionName?: string | undefined): Promise<RegisterInstanceEventNotificationAttributesResult> {
  try {
    // TODO: implement register_instance_event_notification_attributes
    throw new Error("register_instance_event_notification_attributes not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "register_instance_event_notification_attributes failed");
  }
}

/** Register transit gateway multicast group members. */
export async function registerTransitGatewayMulticastGroupMembers(transitGatewayMulticastDomainId: string, networkInterfaceIds: string[]): Promise<RegisterTransitGatewayMulticastGroupMembersResult> {
  try {
    // TODO: implement register_transit_gateway_multicast_group_members
    throw new Error("register_transit_gateway_multicast_group_members not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "register_transit_gateway_multicast_group_members failed");
  }
}

/** Register transit gateway multicast group sources. */
export async function registerTransitGatewayMulticastGroupSources(transitGatewayMulticastDomainId: string, networkInterfaceIds: string[]): Promise<RegisterTransitGatewayMulticastGroupSourcesResult> {
  try {
    // TODO: implement register_transit_gateway_multicast_group_sources
    throw new Error("register_transit_gateway_multicast_group_sources not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "register_transit_gateway_multicast_group_sources failed");
  }
}

/** Reject capacity reservation billing ownership. */
export async function rejectCapacityReservationBillingOwnership(capacityReservationId: string, regionName?: string | undefined): Promise<RejectCapacityReservationBillingOwnershipResult> {
  try {
    // TODO: implement reject_capacity_reservation_billing_ownership
    throw new Error("reject_capacity_reservation_billing_ownership not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "reject_capacity_reservation_billing_ownership failed");
  }
}

/** Reject transit gateway multicast domain associations. */
export async function rejectTransitGatewayMulticastDomainAssociations(): Promise<RejectTransitGatewayMulticastDomainAssociationsResult> {
  try {
    // TODO: implement reject_transit_gateway_multicast_domain_associations
    throw new Error("reject_transit_gateway_multicast_domain_associations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "reject_transit_gateway_multicast_domain_associations failed");
  }
}

/** Reject transit gateway peering attachment. */
export async function rejectTransitGatewayPeeringAttachment(transitGatewayAttachmentId: string, regionName?: string | undefined): Promise<RejectTransitGatewayPeeringAttachmentResult> {
  try {
    // TODO: implement reject_transit_gateway_peering_attachment
    throw new Error("reject_transit_gateway_peering_attachment not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "reject_transit_gateway_peering_attachment failed");
  }
}

/** Reject transit gateway vpc attachment. */
export async function rejectTransitGatewayVpcAttachment(transitGatewayAttachmentId: string, regionName?: string | undefined): Promise<RejectTransitGatewayVpcAttachmentResult> {
  try {
    // TODO: implement reject_transit_gateway_vpc_attachment
    throw new Error("reject_transit_gateway_vpc_attachment not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "reject_transit_gateway_vpc_attachment failed");
  }
}

/** Reject vpc endpoint connections. */
export async function rejectVpcEndpointConnections(serviceId: string, vpcEndpointIds: string[], regionName?: string | undefined): Promise<RejectVpcEndpointConnectionsResult> {
  try {
    // TODO: implement reject_vpc_endpoint_connections
    throw new Error("reject_vpc_endpoint_connections not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "reject_vpc_endpoint_connections failed");
  }
}

/** Reject vpc peering connection. */
export async function rejectVpcPeeringConnection(vpcPeeringConnectionId: string, regionName?: string | undefined): Promise<RejectVpcPeeringConnectionResult> {
  try {
    // TODO: implement reject_vpc_peering_connection
    throw new Error("reject_vpc_peering_connection not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "reject_vpc_peering_connection failed");
  }
}

/** Release address. */
export async function releaseAddress(): Promise<void> {
  try {
    // TODO: implement release_address
    throw new Error("release_address not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "release_address failed");
  }
}

/** Release hosts. */
export async function releaseHosts(hostIds: string[], regionName?: string | undefined): Promise<ReleaseHostsResult> {
  try {
    // TODO: implement release_hosts
    throw new Error("release_hosts not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "release_hosts failed");
  }
}

/** Release ipam pool allocation. */
export async function releaseIpamPoolAllocation(ipamPoolId: string, cidr: string, ipamPoolAllocationId: string, regionName?: string | undefined): Promise<ReleaseIpamPoolAllocationResult> {
  try {
    // TODO: implement release_ipam_pool_allocation
    throw new Error("release_ipam_pool_allocation not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "release_ipam_pool_allocation failed");
  }
}

/** Replace iam instance profile association. */
export async function replaceIamInstanceProfileAssociation(iamInstanceProfile: Record<string, unknown>, associationId: string, regionName?: string | undefined): Promise<ReplaceIamInstanceProfileAssociationResult> {
  try {
    // TODO: implement replace_iam_instance_profile_association
    throw new Error("replace_iam_instance_profile_association not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "replace_iam_instance_profile_association failed");
  }
}

/** Replace image criteria in allowed images settings. */
export async function replaceImageCriteriaInAllowedImagesSettings(): Promise<ReplaceImageCriteriaInAllowedImagesSettingsResult> {
  try {
    // TODO: implement replace_image_criteria_in_allowed_images_settings
    throw new Error("replace_image_criteria_in_allowed_images_settings not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "replace_image_criteria_in_allowed_images_settings failed");
  }
}

/** Replace network acl association. */
export async function replaceNetworkAclAssociation(associationId: string, networkAclId: string, regionName?: string | undefined): Promise<ReplaceNetworkAclAssociationResult> {
  try {
    // TODO: implement replace_network_acl_association
    throw new Error("replace_network_acl_association not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "replace_network_acl_association failed");
  }
}

/** Replace network acl entry. */
export async function replaceNetworkAclEntry(networkAclId: string, ruleNumber: number, protocol: string, ruleAction: string, egress: boolean): Promise<void> {
  try {
    // TODO: implement replace_network_acl_entry
    throw new Error("replace_network_acl_entry not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "replace_network_acl_entry failed");
  }
}

/** Replace route. */
export async function replaceRoute(routeTableId: string): Promise<void> {
  try {
    // TODO: implement replace_route
    throw new Error("replace_route not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "replace_route failed");
  }
}

/** Replace route table association. */
export async function replaceRouteTableAssociation(associationId: string, routeTableId: string, regionName?: string | undefined): Promise<ReplaceRouteTableAssociationResult> {
  try {
    // TODO: implement replace_route_table_association
    throw new Error("replace_route_table_association not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "replace_route_table_association failed");
  }
}

/** Replace transit gateway route. */
export async function replaceTransitGatewayRoute(destinationCidrBlock: string, transitGatewayRouteTableId: string): Promise<ReplaceTransitGatewayRouteResult> {
  try {
    // TODO: implement replace_transit_gateway_route
    throw new Error("replace_transit_gateway_route not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "replace_transit_gateway_route failed");
  }
}

/** Replace vpn tunnel. */
export async function replaceVpnTunnel(vpnConnectionId: string, vpnTunnelOutsideIpAddress: string): Promise<ReplaceVpnTunnelResult> {
  try {
    // TODO: implement replace_vpn_tunnel
    throw new Error("replace_vpn_tunnel not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "replace_vpn_tunnel failed");
  }
}

/** Report instance status. */
export async function reportInstanceStatus(instances: string[], status: string, reasonCodes: string[]): Promise<void> {
  try {
    // TODO: implement report_instance_status
    throw new Error("report_instance_status not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "report_instance_status failed");
  }
}

/** Request spot fleet. */
export async function requestSpotFleet(spotFleetRequestConfig: Record<string, unknown>, regionName?: string | undefined): Promise<RequestSpotFleetResult> {
  try {
    // TODO: implement request_spot_fleet
    throw new Error("request_spot_fleet not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "request_spot_fleet failed");
  }
}

/** Request spot instances. */
export async function requestSpotInstances(): Promise<RequestSpotInstancesResult> {
  try {
    // TODO: implement request_spot_instances
    throw new Error("request_spot_instances not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "request_spot_instances failed");
  }
}

/** Reset address attribute. */
export async function resetAddressAttribute(allocationId: string, attribute: string, regionName?: string | undefined): Promise<ResetAddressAttributeResult> {
  try {
    // TODO: implement reset_address_attribute
    throw new Error("reset_address_attribute not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "reset_address_attribute failed");
  }
}

/** Reset ebs default kms key id. */
export async function resetEbsDefaultKmsKeyId(regionName?: string | undefined): Promise<ResetEbsDefaultKmsKeyIdResult> {
  try {
    // TODO: implement reset_ebs_default_kms_key_id
    throw new Error("reset_ebs_default_kms_key_id not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "reset_ebs_default_kms_key_id failed");
  }
}

/** Reset fpga image attribute. */
export async function resetFpgaImageAttribute(fpgaImageId: string): Promise<ResetFpgaImageAttributeResult> {
  try {
    // TODO: implement reset_fpga_image_attribute
    throw new Error("reset_fpga_image_attribute not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "reset_fpga_image_attribute failed");
  }
}

/** Reset image attribute. */
export async function resetImageAttribute(attribute: string, imageId: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement reset_image_attribute
    throw new Error("reset_image_attribute not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "reset_image_attribute failed");
  }
}

/** Reset instance attribute. */
export async function resetInstanceAttribute(instanceId: string, attribute: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement reset_instance_attribute
    throw new Error("reset_instance_attribute not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "reset_instance_attribute failed");
  }
}

/** Reset network interface attribute. */
export async function resetNetworkInterfaceAttribute(networkInterfaceId: string): Promise<void> {
  try {
    // TODO: implement reset_network_interface_attribute
    throw new Error("reset_network_interface_attribute not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "reset_network_interface_attribute failed");
  }
}

/** Reset snapshot attribute. */
export async function resetSnapshotAttribute(attribute: string, snapshotId: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement reset_snapshot_attribute
    throw new Error("reset_snapshot_attribute not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "reset_snapshot_attribute failed");
  }
}

/** Restore address to classic. */
export async function restoreAddressToClassic(publicIp: string, regionName?: string | undefined): Promise<RestoreAddressToClassicResult> {
  try {
    // TODO: implement restore_address_to_classic
    throw new Error("restore_address_to_classic not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "restore_address_to_classic failed");
  }
}

/** Restore image from recycle bin. */
export async function restoreImageFromRecycleBin(imageId: string, regionName?: string | undefined): Promise<RestoreImageFromRecycleBinResult> {
  try {
    // TODO: implement restore_image_from_recycle_bin
    throw new Error("restore_image_from_recycle_bin not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "restore_image_from_recycle_bin failed");
  }
}

/** Restore managed prefix list version. */
export async function restoreManagedPrefixListVersion(prefixListId: string, previousVersion: number, currentVersion: number, regionName?: string | undefined): Promise<RestoreManagedPrefixListVersionResult> {
  try {
    // TODO: implement restore_managed_prefix_list_version
    throw new Error("restore_managed_prefix_list_version not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "restore_managed_prefix_list_version failed");
  }
}

/** Restore snapshot from recycle bin. */
export async function restoreSnapshotFromRecycleBin(snapshotId: string, regionName?: string | undefined): Promise<RestoreSnapshotFromRecycleBinResult> {
  try {
    // TODO: implement restore_snapshot_from_recycle_bin
    throw new Error("restore_snapshot_from_recycle_bin not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "restore_snapshot_from_recycle_bin failed");
  }
}

/** Restore snapshot tier. */
export async function restoreSnapshotTier(snapshotId: string): Promise<RestoreSnapshotTierResult> {
  try {
    // TODO: implement restore_snapshot_tier
    throw new Error("restore_snapshot_tier not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "restore_snapshot_tier failed");
  }
}

/** Revoke client vpn ingress. */
export async function revokeClientVpnIngress(clientVpnEndpointId: string, targetNetworkCidr: string): Promise<RevokeClientVpnIngressResult> {
  try {
    // TODO: implement revoke_client_vpn_ingress
    throw new Error("revoke_client_vpn_ingress not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "revoke_client_vpn_ingress failed");
  }
}

/** Revoke security group egress. */
export async function revokeSecurityGroupEgress(groupId: string): Promise<RevokeSecurityGroupEgressResult> {
  try {
    // TODO: implement revoke_security_group_egress
    throw new Error("revoke_security_group_egress not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "revoke_security_group_egress failed");
  }
}

/** Revoke security group ingress. */
export async function revokeSecurityGroupIngress(): Promise<RevokeSecurityGroupIngressResult> {
  try {
    // TODO: implement revoke_security_group_ingress
    throw new Error("revoke_security_group_ingress not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "revoke_security_group_ingress failed");
  }
}

/** Run instances. */
export async function runInstances(maxCount: number, minCount: number): Promise<RunInstancesResult> {
  try {
    // TODO: implement run_instances
    throw new Error("run_instances not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "run_instances failed");
  }
}

/** Run scheduled instances. */
export async function runScheduledInstances(launchSpecification: Record<string, unknown>, scheduledInstanceId: string): Promise<RunScheduledInstancesResult> {
  try {
    // TODO: implement run_scheduled_instances
    throw new Error("run_scheduled_instances not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "run_scheduled_instances failed");
  }
}

/** Search local gateway routes. */
export async function searchLocalGatewayRoutes(localGatewayRouteTableId: string): Promise<SearchLocalGatewayRoutesResult> {
  try {
    // TODO: implement search_local_gateway_routes
    throw new Error("search_local_gateway_routes not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "search_local_gateway_routes failed");
  }
}

/** Search transit gateway multicast groups. */
export async function searchTransitGatewayMulticastGroups(transitGatewayMulticastDomainId: string): Promise<SearchTransitGatewayMulticastGroupsResult> {
  try {
    // TODO: implement search_transit_gateway_multicast_groups
    throw new Error("search_transit_gateway_multicast_groups not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "search_transit_gateway_multicast_groups failed");
  }
}

/** Search transit gateway routes. */
export async function searchTransitGatewayRoutes(transitGatewayRouteTableId: string, filters: Record<string, unknown>[]): Promise<SearchTransitGatewayRoutesResult> {
  try {
    // TODO: implement search_transit_gateway_routes
    throw new Error("search_transit_gateway_routes not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "search_transit_gateway_routes failed");
  }
}

/** Send diagnostic interrupt. */
export async function sendDiagnosticInterrupt(instanceId: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement send_diagnostic_interrupt
    throw new Error("send_diagnostic_interrupt not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "send_diagnostic_interrupt failed");
  }
}

/** Start declarative policies report. */
export async function startDeclarativePoliciesReport(s3Bucket: string, targetId: string): Promise<StartDeclarativePoliciesReportResult> {
  try {
    // TODO: implement start_declarative_policies_report
    throw new Error("start_declarative_policies_report not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_declarative_policies_report failed");
  }
}

/** Start network insights access scope analysis. */
export async function startNetworkInsightsAccessScopeAnalysis(networkInsightsAccessScopeId: string, clientToken: string): Promise<StartNetworkInsightsAccessScopeAnalysisResult> {
  try {
    // TODO: implement start_network_insights_access_scope_analysis
    throw new Error("start_network_insights_access_scope_analysis not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_network_insights_access_scope_analysis failed");
  }
}

/** Start network insights analysis. */
export async function startNetworkInsightsAnalysis(networkInsightsPathId: string, clientToken: string): Promise<StartNetworkInsightsAnalysisResult> {
  try {
    // TODO: implement start_network_insights_analysis
    throw new Error("start_network_insights_analysis not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_network_insights_analysis failed");
  }
}

/** Start vpc endpoint service private dns verification. */
export async function startVpcEndpointServicePrivateDnsVerification(serviceId: string, regionName?: string | undefined): Promise<StartVpcEndpointServicePrivateDnsVerificationResult> {
  try {
    // TODO: implement start_vpc_endpoint_service_private_dns_verification
    throw new Error("start_vpc_endpoint_service_private_dns_verification not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_vpc_endpoint_service_private_dns_verification failed");
  }
}

/** Terminate client vpn connections. */
export async function terminateClientVpnConnections(clientVpnEndpointId: string): Promise<TerminateClientVpnConnectionsResult> {
  try {
    // TODO: implement terminate_client_vpn_connections
    throw new Error("terminate_client_vpn_connections not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "terminate_client_vpn_connections failed");
  }
}

/** Unassign ipv6 addresses. */
export async function unassignIpv6Addresses(networkInterfaceId: string): Promise<UnassignIpv6AddressesResult> {
  try {
    // TODO: implement unassign_ipv6_addresses
    throw new Error("unassign_ipv6_addresses not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "unassign_ipv6_addresses failed");
  }
}

/** Unassign private ip addresses. */
export async function unassignPrivateIpAddresses(networkInterfaceId: string): Promise<void> {
  try {
    // TODO: implement unassign_private_ip_addresses
    throw new Error("unassign_private_ip_addresses not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "unassign_private_ip_addresses failed");
  }
}

/** Unassign private nat gateway address. */
export async function unassignPrivateNatGatewayAddress(natGatewayId: string, privateIpAddresses: string[]): Promise<UnassignPrivateNatGatewayAddressResult> {
  try {
    // TODO: implement unassign_private_nat_gateway_address
    throw new Error("unassign_private_nat_gateway_address not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "unassign_private_nat_gateway_address failed");
  }
}

/** Unlock snapshot. */
export async function unlockSnapshot(snapshotId: string, regionName?: string | undefined): Promise<UnlockSnapshotResult> {
  try {
    // TODO: implement unlock_snapshot
    throw new Error("unlock_snapshot not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "unlock_snapshot failed");
  }
}

/** Unmonitor instances. */
export async function unmonitorInstances(instanceIds: string[], regionName?: string | undefined): Promise<UnmonitorInstancesResult> {
  try {
    // TODO: implement unmonitor_instances
    throw new Error("unmonitor_instances not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "unmonitor_instances failed");
  }
}

/** Update capacity manager organizations access. */
export async function updateCapacityManagerOrganizationsAccess(organizationsAccess: boolean): Promise<UpdateCapacityManagerOrganizationsAccessResult> {
  try {
    // TODO: implement update_capacity_manager_organizations_access
    throw new Error("update_capacity_manager_organizations_access not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_capacity_manager_organizations_access failed");
  }
}

/** Update security group rule descriptions egress. */
export async function updateSecurityGroupRuleDescriptionsEgress(): Promise<UpdateSecurityGroupRuleDescriptionsEgressResult> {
  try {
    // TODO: implement update_security_group_rule_descriptions_egress
    throw new Error("update_security_group_rule_descriptions_egress not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_security_group_rule_descriptions_egress failed");
  }
}

/** Update security group rule descriptions ingress. */
export async function updateSecurityGroupRuleDescriptionsIngress(): Promise<UpdateSecurityGroupRuleDescriptionsIngressResult> {
  try {
    // TODO: implement update_security_group_rule_descriptions_ingress
    throw new Error("update_security_group_rule_descriptions_ingress not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_security_group_rule_descriptions_ingress failed");
  }
}

/** Withdraw byoip cidr. */
export async function withdrawByoipCidr(cidr: string, regionName?: string | undefined): Promise<WithdrawByoipCidrResult> {
  try {
    // TODO: implement withdraw_byoip_cidr
    throw new Error("withdraw_byoip_cidr not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "withdraw_byoip_cidr failed");
  }
}
