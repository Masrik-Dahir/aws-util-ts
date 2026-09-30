import { TransferClient } from "@aws-sdk/client-transfer";
import { getClient } from "./client";
import { wrapAwsError } from "./exceptions";

/** Metadata for a Transfer Family server. */
export type ServerResult = {
  serverId: string;
  arn?: string;
  state?: string;
  endpointType?: string;
  identityProviderType?: string;
  domain?: string;
  protocols?: string[];
  extra?: Record<string, unknown>;
};

/** Metadata for a Transfer Family user. */
export type UserResult = {
  serverId: string;
  userName: string;
  arn?: string;
  homeDirectory?: string;
  homeDirectoryType?: string;
  role?: string;
  sshPublicKeyCount?: number;
  extra?: Record<string, unknown>;
};

/** Metadata for an imported SSH public key. */
export type SshPublicKeyResult = {
  serverId: string;
  userName: string;
  sshPublicKeyId: string;
};

/** Metadata for a Transfer Family external access entry. */
export type AccessResult = {
  serverId: string;
  externalId: string;
  homeDirectory?: string;
  homeDirectoryType?: string;
  role?: string;
  extra?: Record<string, unknown>;
};

/** Metadata for a Transfer Family workflow. */
export type WorkflowResult = {
  workflowId: string;
  arn?: string;
  description?: string;
  extra?: Record<string, unknown>;
};

/** Result of create_agreement. */
export type CreateAgreementResult = {
  agreementId?: string;
};

/** Result of create_connector. */
export type CreateConnectorResult = {
  connectorId?: string;
};

/** Result of create_profile. */
export type CreateProfileResult = {
  profileId?: string;
};

/** Result of create_web_app. */
export type CreateWebAppResult = {
  webAppId?: string;
};

/** Result of describe_agreement. */
export type DescribeAgreementResult = {
  agreement?: Record<string, unknown>;
};

/** Result of describe_certificate. */
export type DescribeCertificateResult = {
  certificate?: Record<string, unknown>;
};

/** Result of describe_connector. */
export type DescribeConnectorResult = {
  connector?: Record<string, unknown>;
};

/** Result of describe_execution. */
export type DescribeExecutionResult = {
  workflowId?: string;
  execution?: Record<string, unknown>;
};

/** Result of describe_host_key. */
export type DescribeHostKeyResult = {
  hostKey?: Record<string, unknown>;
};

/** Result of describe_profile. */
export type DescribeProfileResult = {
  profile?: Record<string, unknown>;
};

/** Result of describe_security_policy. */
export type DescribeSecurityPolicyResult = {
  securityPolicy?: Record<string, unknown>;
};

/** Result of describe_web_app. */
export type DescribeWebAppResult = {
  webApp?: Record<string, unknown>;
};

/** Result of describe_web_app_customization. */
export type DescribeWebAppCustomizationResult = {
  webAppCustomization?: Record<string, unknown>;
};

/** Result of import_certificate. */
export type ImportCertificateResult = {
  certificateId?: string;
};

/** Result of import_host_key. */
export type ImportHostKeyResult = {
  serverId?: string;
  hostKeyId?: string;
};

/** Result of list_agreements. */
export type ListAgreementsResult = {
  nextToken?: string;
  agreements?: Record<string, unknown>[];
};

/** Result of list_certificates. */
export type ListCertificatesResult = {
  nextToken?: string;
  certificates?: Record<string, unknown>[];
};

/** Result of list_connectors. */
export type ListConnectorsResult = {
  nextToken?: string;
  connectors?: Record<string, unknown>[];
};

/** Result of list_executions. */
export type ListExecutionsResult = {
  nextToken?: string;
  workflowId?: string;
  executions?: Record<string, unknown>[];
};

/** Result of list_file_transfer_results. */
export type ListFileTransferResultsResult = {
  fileTransferResults?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_host_keys. */
export type ListHostKeysResult = {
  nextToken?: string;
  serverId?: string;
  hostKeys?: Record<string, unknown>[];
};

/** Result of list_profiles. */
export type ListProfilesResult = {
  nextToken?: string;
  profiles?: Record<string, unknown>[];
};

/** Result of list_security_policies. */
export type ListSecurityPoliciesResult = {
  nextToken?: string;
  securityPolicyNames?: string[];
};

/** Result of list_tags_for_resource. */
export type ListTagsForResourceResult = {
  arn?: string;
  nextToken?: string;
  tags?: Record<string, unknown>[];
};

/** Result of list_web_apps. */
export type ListWebAppsResult = {
  nextToken?: string;
  webApps?: Record<string, unknown>[];
};

/** Result of run_connection. */
export type RunConnectionResult = {
  connectorId?: string;
  status?: string;
  statusMessage?: string;
  sftpConnectionDetails?: Record<string, unknown>;
};

/** Result of run_identity_provider. */
export type RunIdentityProviderResult = {
  response?: string;
  statusCode?: number;
  message?: string;
  url?: string;
};

/** Result of start_directory_listing. */
export type StartDirectoryListingResult = {
  listingId?: string;
  outputFileName?: string;
};

/** Result of start_file_transfer. */
export type StartFileTransferResult = {
  transferId?: string;
};

/** Result of start_remote_delete. */
export type StartRemoteDeleteResult = {
  deleteId?: string;
};

/** Result of start_remote_move. */
export type StartRemoteMoveResult = {
  moveId?: string;
};

/** Result of update_agreement. */
export type UpdateAgreementResult = {
  agreementId?: string;
};

/** Result of update_certificate. */
export type UpdateCertificateResult = {
  certificateId?: string;
};

/** Result of update_connector. */
export type UpdateConnectorResult = {
  connectorId?: string;
};

/** Result of update_host_key. */
export type UpdateHostKeyResult = {
  serverId?: string;
  hostKeyId?: string;
};

/** Result of update_profile. */
export type UpdateProfileResult = {
  profileId?: string;
};

/** Result of update_web_app. */
export type UpdateWebAppResult = {
  webAppId?: string;
};

/** Result of update_web_app_customization. */
export type UpdateWebAppCustomizationResult = {
  webAppId?: string;
};

/** Create a Transfer Family server. */
export async function createServer(): Promise<ServerResult> {
  try {
    // TODO: implement create_server
    throw new Error("create_server not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_server failed");
  }
}

/** Describe a Transfer Family server. */
export async function describeServer(serverId: string): Promise<ServerResult> {
  try {
    // TODO: implement describe_server
    throw new Error("describe_server not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_server failed");
  }
}

/** List all Transfer Family servers. */
export async function listServers(): Promise<ServerResult[]> {
  try {
    // TODO: implement list_servers
    throw new Error("list_servers not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_servers failed");
  }
}

/** Update a Transfer Family server. */
export async function updateServer(serverId: string): Promise<string> {
  try {
    // TODO: implement update_server
    throw new Error("update_server not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_server failed");
  }
}

/** Delete a Transfer Family server. */
export async function deleteServer(serverId: string): Promise<void> {
  try {
    // TODO: implement delete_server
    throw new Error("delete_server not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_server failed");
  }
}

/** Start a stopped Transfer Family server. */
export async function startServer(serverId: string): Promise<void> {
  try {
    // TODO: implement start_server
    throw new Error("start_server not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_server failed");
  }
}

/** Stop a running Transfer Family server. */
export async function stopServer(serverId: string): Promise<void> {
  try {
    // TODO: implement stop_server
    throw new Error("stop_server not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "stop_server failed");
  }
}

/** Create a user on a Transfer Family server. */
export async function createUser(serverId: string, userName: string, role: string): Promise<UserResult> {
  try {
    // TODO: implement create_user
    throw new Error("create_user not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_user failed");
  }
}

/** Describe a Transfer Family user. */
export async function describeUser(serverId: string, userName: string): Promise<UserResult> {
  try {
    // TODO: implement describe_user
    throw new Error("describe_user not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_user failed");
  }
}

/** List users on a Transfer Family server. */
export async function listUsers(serverId: string): Promise<UserResult[]> {
  try {
    // TODO: implement list_users
    throw new Error("list_users not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_users failed");
  }
}

/** Update a Transfer Family user. */
export async function updateUser(serverId: string, userName: string): Promise<string> {
  try {
    // TODO: implement update_user
    throw new Error("update_user not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_user failed");
  }
}

/** Delete a Transfer Family user. */
export async function deleteUser(serverId: string, userName: string): Promise<void> {
  try {
    // TODO: implement delete_user
    throw new Error("delete_user not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_user failed");
  }
}

/** Import an SSH public key for a Transfer Family user. */
export async function importSshPublicKey(serverId: string, userName: string, sshPublicKeyBody: string): Promise<SshPublicKeyResult> {
  try {
    // TODO: implement import_ssh_public_key
    throw new Error("import_ssh_public_key not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "import_ssh_public_key failed");
  }
}

/** Delete an SSH public key from a Transfer Family user. */
export async function deleteSshPublicKey(serverId: string, userName: string, sshPublicKeyId: string): Promise<void> {
  try {
    // TODO: implement delete_ssh_public_key
    throw new Error("delete_ssh_public_key not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_ssh_public_key failed");
  }
}

/** Create an external access entry on a Transfer Family server. */
export async function createAccess(serverId: string, externalId: string, role: string): Promise<AccessResult> {
  try {
    // TODO: implement create_access
    throw new Error("create_access not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_access failed");
  }
}

/** Describe an external access entry. */
export async function describeAccess(serverId: string, externalId: string): Promise<AccessResult> {
  try {
    // TODO: implement describe_access
    throw new Error("describe_access not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_access failed");
  }
}

/** List external access entries on a Transfer Family server. */
export async function listAccesses(serverId: string): Promise<AccessResult[]> {
  try {
    // TODO: implement list_accesses
    throw new Error("list_accesses not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_accesses failed");
  }
}

/** Update an external access entry. */
export async function updateAccess(serverId: string, externalId: string): Promise<string> {
  try {
    // TODO: implement update_access
    throw new Error("update_access not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_access failed");
  }
}

/** Delete an external access entry. */
export async function deleteAccess(serverId: string, externalId: string): Promise<void> {
  try {
    // TODO: implement delete_access
    throw new Error("delete_access not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_access failed");
  }
}

/** Create a Transfer Family workflow. */
export async function createWorkflow(steps: Record<string, unknown>[]): Promise<WorkflowResult> {
  try {
    // TODO: implement create_workflow
    throw new Error("create_workflow not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_workflow failed");
  }
}

/** Describe a Transfer Family workflow. */
export async function describeWorkflow(workflowId: string): Promise<WorkflowResult> {
  try {
    // TODO: implement describe_workflow
    throw new Error("describe_workflow not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_workflow failed");
  }
}

/** List all Transfer Family workflows. */
export async function listWorkflows(): Promise<WorkflowResult[]> {
  try {
    // TODO: implement list_workflows
    throw new Error("list_workflows not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_workflows failed");
  }
}

/** Delete a Transfer Family workflow. */
export async function deleteWorkflow(workflowId: string): Promise<void> {
  try {
    // TODO: implement delete_workflow
    throw new Error("delete_workflow not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_workflow failed");
  }
}

/** Send a step state for a workflow execution. */
export async function sendWorkflowStepState(workflowId: string, executionId: string, token: string, status: string): Promise<void> {
  try {
    // TODO: implement send_workflow_step_state
    throw new Error("send_workflow_step_state not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "send_workflow_step_state failed");
  }
}

/** Poll until a Transfer Family server reaches the desired state. */
export async function waitForServer(serverId: string): Promise<ServerResult> {
  try {
    // TODO: implement wait_for_server
    throw new Error("wait_for_server not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "wait_for_server failed");
  }
}

/** Create agreement. */
export async function createAgreement(serverId: string, localProfileId: string, partnerProfileId: string, accessRole: string): Promise<CreateAgreementResult> {
  try {
    // TODO: implement create_agreement
    throw new Error("create_agreement not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_agreement failed");
  }
}

/** Create connector. */
export async function createConnector(accessRole: string): Promise<CreateConnectorResult> {
  try {
    // TODO: implement create_connector
    throw new Error("create_connector not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_connector failed");
  }
}

/** Create profile. */
export async function createProfile(as2Id: string, profileType: string): Promise<CreateProfileResult> {
  try {
    // TODO: implement create_profile
    throw new Error("create_profile not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_profile failed");
  }
}

/** Create web app. */
export async function createWebApp(identityProviderDetails: Record<string, unknown>): Promise<CreateWebAppResult> {
  try {
    // TODO: implement create_web_app
    throw new Error("create_web_app not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_web_app failed");
  }
}

/** Delete agreement. */
export async function deleteAgreement(agreementId: string, serverId: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_agreement
    throw new Error("delete_agreement not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_agreement failed");
  }
}

/** Delete certificate. */
export async function deleteCertificate(certificateId: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_certificate
    throw new Error("delete_certificate not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_certificate failed");
  }
}

/** Delete connector. */
export async function deleteConnector(connectorId: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_connector
    throw new Error("delete_connector not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_connector failed");
  }
}

/** Delete host key. */
export async function deleteHostKey(serverId: string, hostKeyId: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_host_key
    throw new Error("delete_host_key not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_host_key failed");
  }
}

/** Delete profile. */
export async function deleteProfile(profileId: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_profile
    throw new Error("delete_profile not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_profile failed");
  }
}

/** Delete web app. */
export async function deleteWebApp(webAppId: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_web_app
    throw new Error("delete_web_app not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_web_app failed");
  }
}

/** Delete web app customization. */
export async function deleteWebAppCustomization(webAppId: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_web_app_customization
    throw new Error("delete_web_app_customization not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_web_app_customization failed");
  }
}

/** Describe agreement. */
export async function describeAgreement(agreementId: string, serverId: string, regionName?: string): Promise<DescribeAgreementResult> {
  try {
    // TODO: implement describe_agreement
    throw new Error("describe_agreement not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_agreement failed");
  }
}

/** Describe certificate. */
export async function describeCertificate(certificateId: string, regionName?: string): Promise<DescribeCertificateResult> {
  try {
    // TODO: implement describe_certificate
    throw new Error("describe_certificate not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_certificate failed");
  }
}

/** Describe connector. */
export async function describeConnector(connectorId: string, regionName?: string): Promise<DescribeConnectorResult> {
  try {
    // TODO: implement describe_connector
    throw new Error("describe_connector not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_connector failed");
  }
}

/** Describe execution. */
export async function describeExecution(executionId: string, workflowId: string, regionName?: string): Promise<DescribeExecutionResult> {
  try {
    // TODO: implement describe_execution
    throw new Error("describe_execution not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_execution failed");
  }
}

/** Describe host key. */
export async function describeHostKey(serverId: string, hostKeyId: string, regionName?: string): Promise<DescribeHostKeyResult> {
  try {
    // TODO: implement describe_host_key
    throw new Error("describe_host_key not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_host_key failed");
  }
}

/** Describe profile. */
export async function describeProfile(profileId: string, regionName?: string): Promise<DescribeProfileResult> {
  try {
    // TODO: implement describe_profile
    throw new Error("describe_profile not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_profile failed");
  }
}

/** Describe security policy. */
export async function describeSecurityPolicy(securityPolicyName: string, regionName?: string): Promise<DescribeSecurityPolicyResult> {
  try {
    // TODO: implement describe_security_policy
    throw new Error("describe_security_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_security_policy failed");
  }
}

/** Describe web app. */
export async function describeWebApp(webAppId: string, regionName?: string): Promise<DescribeWebAppResult> {
  try {
    // TODO: implement describe_web_app
    throw new Error("describe_web_app not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_web_app failed");
  }
}

/** Describe web app customization. */
export async function describeWebAppCustomization(webAppId: string, regionName?: string): Promise<DescribeWebAppCustomizationResult> {
  try {
    // TODO: implement describe_web_app_customization
    throw new Error("describe_web_app_customization not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_web_app_customization failed");
  }
}

/** Import certificate. */
export async function importCertificate(usage: string, certificate: string): Promise<ImportCertificateResult> {
  try {
    // TODO: implement import_certificate
    throw new Error("import_certificate not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "import_certificate failed");
  }
}

/** Import host key. */
export async function importHostKey(serverId: string, hostKeyBody: string): Promise<ImportHostKeyResult> {
  try {
    // TODO: implement import_host_key
    throw new Error("import_host_key not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "import_host_key failed");
  }
}

/** List agreements. */
export async function listAgreements(serverId: string): Promise<ListAgreementsResult> {
  try {
    // TODO: implement list_agreements
    throw new Error("list_agreements not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_agreements failed");
  }
}

/** List certificates. */
export async function listCertificates(): Promise<ListCertificatesResult> {
  try {
    // TODO: implement list_certificates
    throw new Error("list_certificates not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_certificates failed");
  }
}

/** List connectors. */
export async function listConnectors(): Promise<ListConnectorsResult> {
  try {
    // TODO: implement list_connectors
    throw new Error("list_connectors not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_connectors failed");
  }
}

/** List executions. */
export async function listExecutions(workflowId: string): Promise<ListExecutionsResult> {
  try {
    // TODO: implement list_executions
    throw new Error("list_executions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_executions failed");
  }
}

/** List file transfer results. */
export async function listFileTransferResults(connectorId: string, transferId: string): Promise<ListFileTransferResultsResult> {
  try {
    // TODO: implement list_file_transfer_results
    throw new Error("list_file_transfer_results not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_file_transfer_results failed");
  }
}

/** List host keys. */
export async function listHostKeys(serverId: string): Promise<ListHostKeysResult> {
  try {
    // TODO: implement list_host_keys
    throw new Error("list_host_keys not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_host_keys failed");
  }
}

/** List profiles. */
export async function listProfiles(): Promise<ListProfilesResult> {
  try {
    // TODO: implement list_profiles
    throw new Error("list_profiles not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_profiles failed");
  }
}

/** List security policies. */
export async function listSecurityPolicies(): Promise<ListSecurityPoliciesResult> {
  try {
    // TODO: implement list_security_policies
    throw new Error("list_security_policies not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_security_policies failed");
  }
}

/** List tags for resource. */
export async function listTagsForResource(arn: string): Promise<ListTagsForResourceResult> {
  try {
    // TODO: implement list_tags_for_resource
    throw new Error("list_tags_for_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_tags_for_resource failed");
  }
}

/** List web apps. */
export async function listWebApps(): Promise<ListWebAppsResult> {
  try {
    // TODO: implement list_web_apps
    throw new Error("list_web_apps not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_web_apps failed");
  }
}

/** Run connection. */
export async function runConnection(connectorId: string, regionName?: string): Promise<RunConnectionResult> {
  try {
    // TODO: implement run_connection
    throw new Error("run_connection not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "run_connection failed");
  }
}

/** Run identity provider. */
export async function runIdentityProvider(serverId: string, userName: string): Promise<RunIdentityProviderResult> {
  try {
    // TODO: implement run_identity_provider
    throw new Error("run_identity_provider not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "run_identity_provider failed");
  }
}

/** Start directory listing. */
export async function startDirectoryListing(connectorId: string, remoteDirectoryPath: string, outputDirectoryPath: string): Promise<StartDirectoryListingResult> {
  try {
    // TODO: implement start_directory_listing
    throw new Error("start_directory_listing not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_directory_listing failed");
  }
}

/** Start file transfer. */
export async function startFileTransfer(connectorId: string): Promise<StartFileTransferResult> {
  try {
    // TODO: implement start_file_transfer
    throw new Error("start_file_transfer not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_file_transfer failed");
  }
}

/** Start remote delete. */
export async function startRemoteDelete(connectorId: string, deletePath: string, regionName?: string): Promise<StartRemoteDeleteResult> {
  try {
    // TODO: implement start_remote_delete
    throw new Error("start_remote_delete not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_remote_delete failed");
  }
}

/** Start remote move. */
export async function startRemoteMove(connectorId: string, sourcePath: string, targetPath: string, regionName?: string): Promise<StartRemoteMoveResult> {
  try {
    // TODO: implement start_remote_move
    throw new Error("start_remote_move not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_remote_move failed");
  }
}

/** Tag resource. */
export async function tagResource(arn: string, tags: Record<string, unknown>[], regionName?: string): Promise<void> {
  try {
    // TODO: implement tag_resource
    throw new Error("tag_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "tag_resource failed");
  }
}

/** Untag resource. */
export async function untagResource(arn: string, tagKeys: string[], regionName?: string): Promise<void> {
  try {
    // TODO: implement untag_resource
    throw new Error("untag_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "untag_resource failed");
  }
}

/** Update agreement. */
export async function updateAgreement(agreementId: string, serverId: string): Promise<UpdateAgreementResult> {
  try {
    // TODO: implement update_agreement
    throw new Error("update_agreement not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_agreement failed");
  }
}

/** Update certificate. */
export async function updateCertificate(certificateId: string): Promise<UpdateCertificateResult> {
  try {
    // TODO: implement update_certificate
    throw new Error("update_certificate not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_certificate failed");
  }
}

/** Update connector. */
export async function updateConnector(connectorId: string): Promise<UpdateConnectorResult> {
  try {
    // TODO: implement update_connector
    throw new Error("update_connector not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_connector failed");
  }
}

/** Update host key. */
export async function updateHostKey(serverId: string, hostKeyId: string, description: string, regionName?: string): Promise<UpdateHostKeyResult> {
  try {
    // TODO: implement update_host_key
    throw new Error("update_host_key not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_host_key failed");
  }
}

/** Update profile. */
export async function updateProfile(profileId: string): Promise<UpdateProfileResult> {
  try {
    // TODO: implement update_profile
    throw new Error("update_profile not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_profile failed");
  }
}

/** Update web app. */
export async function updateWebApp(webAppId: string): Promise<UpdateWebAppResult> {
  try {
    // TODO: implement update_web_app
    throw new Error("update_web_app not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_web_app failed");
  }
}

/** Update web app customization. */
export async function updateWebAppCustomization(webAppId: string): Promise<UpdateWebAppCustomizationResult> {
  try {
    // TODO: implement update_web_app_customization
    throw new Error("update_web_app_customization not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_web_app_customization failed");
  }
}
