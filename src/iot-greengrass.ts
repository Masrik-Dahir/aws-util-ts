import { IotGreengrassClient } from "@aws-sdk/client-greengrassv2";
import { getClient } from "./client";
import { wrapAwsError } from "./exceptions";

/** Metadata for a Greengrass component. */
export type ComponentResult = {
  arn?: string;
  componentName?: string;
  componentVersion?: string;
  status?: string;
  description?: string;
  extra?: Record<string, unknown>;
};

/** Metadata for a Greengrass deployment. */
export type DeploymentResult = {
  deploymentId: string;
  deploymentName?: string;
  deploymentStatus?: string;
  targetArn?: string;
  revisionId?: string;
  extra?: Record<string, unknown>;
};

/** Metadata for an installed Greengrass component on a core device. */
export type InstalledComponentResult = {
  componentName: string;
  componentVersion?: string;
  lifecycleState?: string;
  isRoot?: boolean;
  extra?: Record<string, unknown>;
};

/** Result of associate_service_role_to_account. */
export type AssociateServiceRoleToAccountResult = {
  associatedAt?: string;
};

/** Result of batch_associate_client_device_with_core_device. */
export type BatchAssociateClientDeviceWithCoreDeviceResult = {
  errorEntries?: Record<string, unknown>[];
};

/** Result of batch_disassociate_client_device_from_core_device. */
export type BatchDisassociateClientDeviceFromCoreDeviceResult = {
  errorEntries?: Record<string, unknown>[];
};

/** Result of disassociate_service_role_from_account. */
export type DisassociateServiceRoleFromAccountResult = {
  disassociatedAt?: string;
};

/** Result of get_component_version_artifact. */
export type GetComponentVersionArtifactResult = {
  preSignedUrl?: string;
};

/** Result of get_connectivity_info. */
export type GetConnectivityInfoResult = {
  connectivityInfo?: Record<string, unknown>[];
  message?: string;
};

/** Result of get_core_device. */
export type GetCoreDeviceResult = {
  coreDeviceThingName?: string;
  coreVersion?: string;
  platform?: string;
  architecture?: string;
  runtime?: string;
  status?: string;
  lastStatusUpdateTimestamp?: string;
  tags?: Record<string, unknown>;
};

/** Result of get_service_role_for_account. */
export type GetServiceRoleForAccountResult = {
  associatedAt?: string;
  roleArn?: string;
};

/** Result of list_client_devices_associated_with_core_device. */
export type ListClientDevicesAssociatedWithCoreDeviceResult = {
  associatedClientDevices?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_component_versions. */
export type ListComponentVersionsResult = {
  componentVersions?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_core_devices. */
export type ListCoreDevicesResult = {
  coreDevices?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of resolve_component_candidates. */
export type ResolveComponentCandidatesResult = {
  resolvedComponentVersions?: Record<string, unknown>[];
};

/** Result of update_connectivity_info. */
export type UpdateConnectivityInfoResult = {
  version?: string;
  message?: string;
};

/** Create a new Greengrass component version. */
export async function createComponentVersion(): Promise<ComponentResult> {
  try {
    // TODO: implement create_component_version
    throw new Error("create_component_version not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_component_version failed");
  }
}

/** Describe a Greengrass component. */
export async function describeComponent(arn: string): Promise<ComponentResult> {
  try {
    // TODO: implement describe_component
    throw new Error("describe_component not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_component failed");
  }
}

/** List all Greengrass components. */
export async function listComponents(): Promise<ComponentResult[]> {
  try {
    // TODO: implement list_components
    throw new Error("list_components not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_components failed");
  }
}

/** Delete a Greengrass component version. */
export async function deleteComponent(arn: string): Promise<void> {
  try {
    // TODO: implement delete_component
    throw new Error("delete_component not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_component failed");
  }
}

/** Get the recipe for a Greengrass component version. */
export async function getComponent(arn: string): Promise<Record<string, unknown>> {
  try {
    // TODO: implement get_component
    throw new Error("get_component not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_component failed");
  }
}

/** Create a Greengrass deployment. */
export async function createDeployment(targetArn: string): Promise<DeploymentResult> {
  try {
    // TODO: implement create_deployment
    throw new Error("create_deployment not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_deployment failed");
  }
}

/** Get details of a Greengrass deployment. */
export async function getDeployment(deploymentId: string): Promise<DeploymentResult> {
  try {
    // TODO: implement get_deployment
    throw new Error("get_deployment not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_deployment failed");
  }
}

/** List Greengrass deployments. */
export async function listDeployments(): Promise<DeploymentResult[]> {
  try {
    // TODO: implement list_deployments
    throw new Error("list_deployments not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_deployments failed");
  }
}

/** Cancel a Greengrass deployment. */
export async function cancelDeployment(deploymentId: string): Promise<Record<string, unknown>> {
  try {
    // TODO: implement cancel_deployment
    throw new Error("cancel_deployment not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "cancel_deployment failed");
  }
}

/** List effective deployments on a core device. */
export async function listEffectiveDeployments(coreDeviceThingName: string): Promise<DeploymentResult[]> {
  try {
    // TODO: implement list_effective_deployments
    throw new Error("list_effective_deployments not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_effective_deployments failed");
  }
}

/** List components installed on a core device. */
export async function listInstalledComponents(coreDeviceThingName: string): Promise<InstalledComponentResult[]> {
  try {
    // TODO: implement list_installed_components
    throw new Error("list_installed_components not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_installed_components failed");
  }
}

/** Add or overwrite tags on a Greengrass resource. */
export async function tagResource(resourceArn: string): Promise<void> {
  try {
    // TODO: implement tag_resource
    throw new Error("tag_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "tag_resource failed");
  }
}

/** List tags on a Greengrass resource. */
export async function listTagsForResource(resourceArn: string): Promise<Record<string, unknown>> {
  try {
    // TODO: implement list_tags_for_resource
    throw new Error("list_tags_for_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_tags_for_resource failed");
  }
}

/** Associate service role to account. */
export async function associateServiceRoleToAccount(roleArn: string, regionName?: string): Promise<AssociateServiceRoleToAccountResult> {
  try {
    // TODO: implement associate_service_role_to_account
    throw new Error("associate_service_role_to_account not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "associate_service_role_to_account failed");
  }
}

/** Batch associate client device with core device. */
export async function batchAssociateClientDeviceWithCoreDevice(coreDeviceThingName: string): Promise<BatchAssociateClientDeviceWithCoreDeviceResult> {
  try {
    // TODO: implement batch_associate_client_device_with_core_device
    throw new Error("batch_associate_client_device_with_core_device not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_associate_client_device_with_core_device failed");
  }
}

/** Batch disassociate client device from core device. */
export async function batchDisassociateClientDeviceFromCoreDevice(coreDeviceThingName: string): Promise<BatchDisassociateClientDeviceFromCoreDeviceResult> {
  try {
    // TODO: implement batch_disassociate_client_device_from_core_device
    throw new Error("batch_disassociate_client_device_from_core_device not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_disassociate_client_device_from_core_device failed");
  }
}

/** Delete core device. */
export async function deleteCoreDevice(coreDeviceThingName: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_core_device
    throw new Error("delete_core_device not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_core_device failed");
  }
}

/** Delete deployment. */
export async function deleteDeployment(deploymentId: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_deployment
    throw new Error("delete_deployment not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_deployment failed");
  }
}

/** Disassociate service role from account. */
export async function disassociateServiceRoleFromAccount(regionName?: string): Promise<DisassociateServiceRoleFromAccountResult> {
  try {
    // TODO: implement disassociate_service_role_from_account
    throw new Error("disassociate_service_role_from_account not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disassociate_service_role_from_account failed");
  }
}

/** Get component version artifact. */
export async function getComponentVersionArtifact(arn: string, artifactName: string): Promise<GetComponentVersionArtifactResult> {
  try {
    // TODO: implement get_component_version_artifact
    throw new Error("get_component_version_artifact not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_component_version_artifact failed");
  }
}

/** Get connectivity info. */
export async function getConnectivityInfo(thingName: string, regionName?: string): Promise<GetConnectivityInfoResult> {
  try {
    // TODO: implement get_connectivity_info
    throw new Error("get_connectivity_info not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_connectivity_info failed");
  }
}

/** Get core device. */
export async function getCoreDevice(coreDeviceThingName: string, regionName?: string): Promise<GetCoreDeviceResult> {
  try {
    // TODO: implement get_core_device
    throw new Error("get_core_device not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_core_device failed");
  }
}

/** Get service role for account. */
export async function getServiceRoleForAccount(regionName?: string): Promise<GetServiceRoleForAccountResult> {
  try {
    // TODO: implement get_service_role_for_account
    throw new Error("get_service_role_for_account not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_service_role_for_account failed");
  }
}

/** List client devices associated with core device. */
export async function listClientDevicesAssociatedWithCoreDevice(coreDeviceThingName: string): Promise<ListClientDevicesAssociatedWithCoreDeviceResult> {
  try {
    // TODO: implement list_client_devices_associated_with_core_device
    throw new Error("list_client_devices_associated_with_core_device not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_client_devices_associated_with_core_device failed");
  }
}

/** List component versions. */
export async function listComponentVersions(arn: string): Promise<ListComponentVersionsResult> {
  try {
    // TODO: implement list_component_versions
    throw new Error("list_component_versions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_component_versions failed");
  }
}

/** List core devices. */
export async function listCoreDevices(): Promise<ListCoreDevicesResult> {
  try {
    // TODO: implement list_core_devices
    throw new Error("list_core_devices not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_core_devices failed");
  }
}

/** Resolve component candidates. */
export async function resolveComponentCandidates(): Promise<ResolveComponentCandidatesResult> {
  try {
    // TODO: implement resolve_component_candidates
    throw new Error("resolve_component_candidates not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "resolve_component_candidates failed");
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

/** Update connectivity info. */
export async function updateConnectivityInfo(thingName: string, connectivityInfo: Record<string, unknown>[], regionName?: string): Promise<UpdateConnectivityInfoResult> {
  try {
    // TODO: implement update_connectivity_info
    throw new Error("update_connectivity_info not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_connectivity_info failed");
  }
}
