/**
 * aws-util/networking — VPC connectivity auditing.
 *
 * Multi-service module combining EC2 (VPC) + Route53 to provide
 * comprehensive VPC connectivity audits including subnets, route tables,
 * internet gateways, and NAT gateways.
 *
 * All functions obtain clients via {@link getClient} and wrap errors
 * through {@link wrapAwsError}.
 *
 * @example
 * ```ts
 * import { vpcConnectivityManager } from "./networking.js";
 *
 * const audit = await vpcConnectivityManager("vpc-0123456789abcdef0");
 * console.log(`VPC ${audit.vpcId}: ${audit.status}`);
 * ```
 *
 * @module
 */

import { z } from "zod";
import {
  EC2Client,
  DescribeVpcsCommand,
  DescribeSubnetsCommand,
  DescribeRouteTablesCommand,
  DescribeInternetGatewaysCommand,
  DescribeNatGatewaysCommand,
} from "@aws-sdk/client-ec2";
import { getClient } from "./client.js";
import { wrapAwsError } from "./exceptions.js";

// ---------------------------------------------------------------------------
// Zod schemas & inferred types
// ---------------------------------------------------------------------------

/** Schema for a subnet entry in the connectivity result. */
const SubnetInfoSchema = z.object({
  subnetId: z.string(),
  availabilityZone: z.string(),
  cidrBlock: z.string(),
});

/** Schema for VPC connectivity audit results. */
export const VPCConnectivityResultSchema = z.object({
  vpcId: z.string(),
  subnets: z.array(SubnetInfoSchema),
  routeTables: z.array(z.string()),
  internetGateway: z.string().optional(),
  natGateways: z.array(z.string()),
  status: z.string(),
});

/** Result of a VPC connectivity audit. */
export type VPCConnectivityResult = z.infer<
  typeof VPCConnectivityResultSchema
>;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Audit VPC connectivity and network topology.
 *
 * Describes the specified VPC and all associated networking components:
 * subnets (with availability zones and CIDR blocks), route tables,
 * internet gateways, and NAT gateways. Returns a comprehensive
 * connectivity snapshot.
 *
 * @param vpcId - VPC identifier to audit.
 * @param region - AWS region. Defaults to SDK default.
 * @returns Connectivity result with full network topology.
 *
 * @example
 * ```ts
 * const result = await vpcConnectivityManager("vpc-abc123");
 * console.log(`Subnets: ${result.subnets.length}`);
 * console.log(`IGW: ${result.internetGateway ?? "none"}`);
 * console.log(`NAT Gateways: ${result.natGateways.length}`);
 * ```
 */
// ---------------------------------------------------------------------------
// Extended networking schemas
// ---------------------------------------------------------------------------

/** Schema for a VPC Lattice service registrar result. */
export const VpcLatticeServiceRegistrarResultSchema = z.object({
  serviceId: z.string(),
  serviceArn: z.string(),
  vpcId: z.string(),
  targetGroupArn: z.string(),
  associated: z.boolean(),
});
/** VPC Lattice service registrar result. */
export type VpcLatticeServiceRegistrarResult = z.infer<typeof VpcLatticeServiceRegistrarResultSchema>;

/** Schema for a Transit Gateway route auditor result. */
export const TransitGatewayRouteAuditorResultSchema = z.object({
  transitGatewayId: z.string(),
  routeTablesAudited: z.number(),
  blackholeRoutes: z.array(z.string()),
  missingRoutes: z.array(z.string()),
  compliant: z.boolean(),
});
/** Transit Gateway route auditor result. */
export type TransitGatewayRouteAuditorResult = z.infer<typeof TransitGatewayRouteAuditorResultSchema>;

/** Schema for a Route53 health check manager result. */
export const Route53HealthCheckManagerResultSchema = z.object({
  healthCheckId: z.string(),
  endpoint: z.string(),
  type: z.string(),
  status: z.string(),
  action: z.string(),
});
/** Route53 health check manager result. */
export type Route53HealthCheckManagerResult = z.infer<typeof Route53HealthCheckManagerResultSchema>;

/** Schema for an EventBridge cross-account forwarder result. */
export const EventbridgeCrossAccountForwarderResultSchema = z.object({
  sourceBus: z.string(),
  targetBus: z.string(),
  ruleArn: z.string(),
  targetId: z.string(),
  eventsForwarded: z.number(),
});
/** EventBridge cross-account forwarder result. */
export type EventbridgeCrossAccountForwarderResult = z.infer<typeof EventbridgeCrossAccountForwarderResultSchema>;

// ---------------------------------------------------------------------------
// Extended networking functions
// ---------------------------------------------------------------------------

/** Register a service with VPC Lattice and associate it with a VPC. */
export async function vpcLatticeServiceRegistrar(
  serviceId: string,
  vpcId: string,
  targetGroupArn: string,
  securityGroupIds?: string[],
  region?: string,
): Promise<VpcLatticeServiceRegistrarResult> {
  const ec2 = getClient(EC2Client, region);
  try {
    // TODO: implement vpcLatticeServiceRegistrar
    throw new Error("vpcLatticeServiceRegistrar not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "vpcLatticeServiceRegistrar failed");
  }
}

/** Audit Transit Gateway route tables for blackhole and missing routes. */
export async function transitGatewayRouteAuditor(
  transitGatewayId: string,
  expectedCidrs?: string[],
  snsTopicArn?: string,
  region?: string,
): Promise<TransitGatewayRouteAuditorResult> {
  const ec2 = getClient(EC2Client, region);
  try {
    // TODO: implement transitGatewayRouteAuditor
    throw new Error("transitGatewayRouteAuditor not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "transitGatewayRouteAuditor failed");
  }
}

/** Create, update, or delete Route53 health checks for endpoints. */
export async function route53HealthCheckManager(
  endpoint: string,
  port: number,
  type: "HTTP" | "HTTPS" | "TCP",
  action: "create" | "update" | "delete",
  healthCheckId?: string,
  path?: string,
  region?: string,
): Promise<Route53HealthCheckManagerResult> {
  const ec2 = getClient(EC2Client, region);
  try {
    // TODO: implement route53HealthCheckManager
    throw new Error("route53HealthCheckManager not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "route53HealthCheckManager failed");
  }
}

/** Configure EventBridge to forward events from one account/bus to another. */
export async function eventbridgeCrossAccountForwarder(
  sourceBusArn: string,
  targetBusArn: string,
  targetRoleArn: string,
  eventPattern: Record<string, unknown>,
  ruleName: string,
  region?: string,
): Promise<EventbridgeCrossAccountForwarderResult> {
  const ec2 = getClient(EC2Client, region);
  try {
    // TODO: implement eventbridgeCrossAccountForwarder
    throw new Error("eventbridgeCrossAccountForwarder not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "eventbridgeCrossAccountForwarder failed");
  }
}

export async function vpcConnectivityManager(
  vpcId: string,
  region?: string,
): Promise<VPCConnectivityResult> {
  try {
    const ec2 = getClient(EC2Client, region);

    // Verify VPC exists
    const vpcResp = await ec2.send(
      new DescribeVpcsCommand({
        VpcIds: [vpcId],
      }),
    );

    const vpc = vpcResp.Vpcs?.[0];
    if (!vpc) {
      throw new Error(`VPC ${vpcId} not found`);
    }

    // Describe subnets
    const subnetResp = await ec2.send(
      new DescribeSubnetsCommand({
        Filters: [
          { Name: "vpc-id", Values: [vpcId] },
        ],
      }),
    );

    const subnets = (subnetResp.Subnets ?? []).map(
      (s) => ({
        subnetId: s.SubnetId ?? "unknown",
        availabilityZone:
          s.AvailabilityZone ?? "unknown",
        cidrBlock: s.CidrBlock ?? "unknown",
      }),
    );

    // Describe route tables
    const rtResp = await ec2.send(
      new DescribeRouteTablesCommand({
        Filters: [
          { Name: "vpc-id", Values: [vpcId] },
        ],
      }),
    );

    const routeTables = (rtResp.RouteTables ?? [])
      .map((rt) => rt.RouteTableId)
      .filter((id): id is string => id !== undefined);

    // Describe internet gateways
    const igwResp = await ec2.send(
      new DescribeInternetGatewaysCommand({
        Filters: [
          {
            Name: "attachment.vpc-id",
            Values: [vpcId],
          },
        ],
      }),
    );

    const internetGateway =
      igwResp.InternetGateways?.[0]
        ?.InternetGatewayId ?? undefined;

    // Describe NAT gateways
    const natResp = await ec2.send(
      new DescribeNatGatewaysCommand({
        Filter: [
          { Name: "vpc-id", Values: [vpcId] },
          { Name: "state", Values: ["available"] },
        ],
      }),
    );

    const natGateways = (natResp.NatGateways ?? [])
      .map((ng) => ng.NatGatewayId)
      .filter((id): id is string => id !== undefined);

    // Determine connectivity status
    const hasPublicSubnets = subnets.length > 0;
    const hasIgw = internetGateway !== undefined;
    const hasNat = natGateways.length > 0;

    let status: string;
    if (hasIgw && hasNat && hasPublicSubnets) {
      status = "FULLY_CONNECTED";
    } else if (hasIgw && hasPublicSubnets) {
      status = "PUBLIC_ONLY";
    } else if (hasNat) {
      status = "PRIVATE_WITH_NAT";
    } else if (hasPublicSubnets) {
      status = "ISOLATED";
    } else {
      status = "EMPTY";
    }

    const result: VPCConnectivityResult = {
      vpcId,
      subnets,
      routeTables,
      internetGateway,
      natGateways,
      status,
    };
    return VPCConnectivityResultSchema.parse(result);
  } catch (err) {
    throw wrapAwsError(
      err,
      "vpcConnectivityManager failed",
    );
  }
}
