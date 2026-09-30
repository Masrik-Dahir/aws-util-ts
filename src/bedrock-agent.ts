import { BedrockAgentClient } from "@aws-sdk/client-bedrock-agent";
import { getClient } from "./client";
import { wrapAwsError } from "./exceptions";

/** Metadata for a Bedrock Agent. */
export type AgentResult = {
  agentId: string;
  agentName: string;
  agentArn?: string;
  agentStatus?: string;
  agentVersion?: string;
  description?: string;
  foundationModel?: string;
  instruction?: string;
  idleSessionTtlInSeconds?: number;
  agentResourceRoleArn?: string;
  extra?: Record<string, unknown>;
};

/** Metadata for a Bedrock Knowledge Base. */
export type KnowledgeBaseResult = {
  knowledgeBaseId: string;
  name: string;
  knowledgeBaseArn?: string;
  status?: string;
  description?: string;
  roleArn?: string;
  extra?: Record<string, unknown>;
};

/** Metadata for a Bedrock data source. */
export type DataSourceResult = {
  dataSourceId: string;
  knowledgeBaseId: string;
  name: string;
  status?: string;
  description?: string;
  extra?: Record<string, unknown>;
};

/** Metadata for a Bedrock ingestion job. */
export type IngestionJobResult = {
  ingestionJobId: string;
  knowledgeBaseId: string;
  dataSourceId: string;
  status?: string;
  description?: string;
  statistics?: Record<string, unknown>;
  failureReasons?: string[];
  extra?: Record<string, unknown>;
};

/** Result of associate_agent_collaborator. */
export type AssociateAgentCollaboratorResult = {
  agentCollaborator?: Record<string, unknown>;
};

/** Result of create_agent_action_group. */
export type CreateAgentActionGroupResult = {
  agentActionGroup?: Record<string, unknown>;
};

/** Result of create_agent_alias. */
export type CreateAgentAliasResult = {
  agentAlias?: Record<string, unknown>;
};

/** Result of create_flow. */
export type CreateFlowResult = {
  name?: string;
  description?: string;
  executionRoleArn?: string;
  customerEncryptionKeyArn?: string;
  id?: string;
  arn?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  version?: string;
  definition?: Record<string, unknown>;
};

/** Result of create_flow_alias. */
export type CreateFlowAliasResult = {
  name?: string;
  description?: string;
  routingConfiguration?: Record<string, unknown>[];
  concurrencyConfiguration?: Record<string, unknown>;
  flowId?: string;
  id?: string;
  arn?: string;
  createdAt?: string;
  updatedAt?: string;
};

/** Result of create_flow_version. */
export type CreateFlowVersionResult = {
  name?: string;
  description?: string;
  executionRoleArn?: string;
  customerEncryptionKeyArn?: string;
  id?: string;
  arn?: string;
  status?: string;
  createdAt?: string;
  version?: string;
  definition?: Record<string, unknown>;
};

/** Result of create_prompt. */
export type CreatePromptResult = {
  name?: string;
  description?: string;
  customerEncryptionKeyArn?: string;
  defaultVariant?: string;
  variants?: Record<string, unknown>[];
  id?: string;
  arn?: string;
  version?: string;
  createdAt?: string;
  updatedAt?: string;
};

/** Result of create_prompt_version. */
export type CreatePromptVersionResult = {
  name?: string;
  description?: string;
  customerEncryptionKeyArn?: string;
  defaultVariant?: string;
  variants?: Record<string, unknown>[];
  id?: string;
  arn?: string;
  version?: string;
  createdAt?: string;
  updatedAt?: string;
};

/** Result of delete_agent_alias. */
export type DeleteAgentAliasResult = {
  agentId?: string;
  agentAliasId?: string;
  agentAliasStatus?: string;
};

/** Result of delete_agent_version. */
export type DeleteAgentVersionResult = {
  agentId?: string;
  agentVersion?: string;
  agentStatus?: string;
};

/** Result of delete_data_source. */
export type DeleteDataSourceResult = {
  knowledgeBaseId?: string;
  dataSourceId?: string;
  status?: string;
};

/** Result of delete_flow. */
export type DeleteFlowResult = {
  id?: string;
};

/** Result of delete_flow_alias. */
export type DeleteFlowAliasResult = {
  flowId?: string;
  id?: string;
};

/** Result of delete_flow_version. */
export type DeleteFlowVersionResult = {
  id?: string;
  version?: string;
};

/** Result of delete_knowledge_base_documents. */
export type DeleteKnowledgeBaseDocumentsResult = {
  documentDetails?: Record<string, unknown>[];
};

/** Result of delete_prompt. */
export type DeletePromptResult = {
  id?: string;
  version?: string;
};

/** Result of get_agent_action_group. */
export type GetAgentActionGroupResult = {
  agentActionGroup?: Record<string, unknown>;
};

/** Result of get_agent_alias. */
export type GetAgentAliasResult = {
  agentAlias?: Record<string, unknown>;
};

/** Result of get_agent_collaborator. */
export type GetAgentCollaboratorResult = {
  agentCollaborator?: Record<string, unknown>;
};

/** Result of get_agent_knowledge_base. */
export type GetAgentKnowledgeBaseResult = {
  agentKnowledgeBase?: Record<string, unknown>;
};

/** Result of get_agent_version. */
export type GetAgentVersionResult = {
  agentVersion?: Record<string, unknown>;
};

/** Result of get_flow. */
export type GetFlowResult = {
  name?: string;
  description?: string;
  executionRoleArn?: string;
  customerEncryptionKeyArn?: string;
  id?: string;
  arn?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  version?: string;
  definition?: Record<string, unknown>;
  validations?: Record<string, unknown>[];
};

/** Result of get_flow_alias. */
export type GetFlowAliasResult = {
  name?: string;
  description?: string;
  routingConfiguration?: Record<string, unknown>[];
  concurrencyConfiguration?: Record<string, unknown>;
  flowId?: string;
  id?: string;
  arn?: string;
  createdAt?: string;
  updatedAt?: string;
};

/** Result of get_flow_version. */
export type GetFlowVersionResult = {
  name?: string;
  description?: string;
  executionRoleArn?: string;
  customerEncryptionKeyArn?: string;
  id?: string;
  arn?: string;
  status?: string;
  createdAt?: string;
  version?: string;
  definition?: Record<string, unknown>;
};

/** Result of get_knowledge_base_documents. */
export type GetKnowledgeBaseDocumentsResult = {
  documentDetails?: Record<string, unknown>[];
};

/** Result of get_prompt. */
export type GetPromptResult = {
  name?: string;
  description?: string;
  customerEncryptionKeyArn?: string;
  defaultVariant?: string;
  variants?: Record<string, unknown>[];
  id?: string;
  arn?: string;
  version?: string;
  createdAt?: string;
  updatedAt?: string;
};

/** Result of ingest_knowledge_base_documents. */
export type IngestKnowledgeBaseDocumentsResult = {
  documentDetails?: Record<string, unknown>[];
};

/** Result of list_agent_action_groups. */
export type ListAgentActionGroupsResult = {
  actionGroupSummaries?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_agent_aliases. */
export type ListAgentAliasesResult = {
  agentAliasSummaries?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_agent_collaborators. */
export type ListAgentCollaboratorsResult = {
  agentCollaboratorSummaries?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_agent_knowledge_bases. */
export type ListAgentKnowledgeBasesResult = {
  agentKnowledgeBaseSummaries?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_agent_versions. */
export type ListAgentVersionsResult = {
  agentVersionSummaries?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_flow_aliases. */
export type ListFlowAliasesResult = {
  flowAliasSummaries?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_flow_versions. */
export type ListFlowVersionsResult = {
  flowVersionSummaries?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_flows. */
export type ListFlowsResult = {
  flowSummaries?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_ingestion_jobs. */
export type ListIngestionJobsResult = {
  ingestionJobSummaries?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_knowledge_base_documents. */
export type ListKnowledgeBaseDocumentsResult = {
  documentDetails?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_prompts. */
export type ListPromptsResult = {
  promptSummaries?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_tags_for_resource. */
export type ListTagsForResourceResult = {
  tags?: Record<string, unknown>;
};

/** Result of prepare_flow. */
export type PrepareFlowResult = {
  id?: string;
  status?: string;
};

/** Result of stop_ingestion_job. */
export type StopIngestionJobResult = {
  ingestionJob?: Record<string, unknown>;
};

/** Result of update_agent_action_group. */
export type UpdateAgentActionGroupResult = {
  agentActionGroup?: Record<string, unknown>;
};

/** Result of update_agent_alias. */
export type UpdateAgentAliasResult = {
  agentAlias?: Record<string, unknown>;
};

/** Result of update_agent_collaborator. */
export type UpdateAgentCollaboratorResult = {
  agentCollaborator?: Record<string, unknown>;
};

/** Result of update_agent_knowledge_base. */
export type UpdateAgentKnowledgeBaseResult = {
  agentKnowledgeBase?: Record<string, unknown>;
};

/** Result of update_data_source. */
export type UpdateDataSourceResult = {
  dataSource?: Record<string, unknown>;
};

/** Result of update_flow. */
export type UpdateFlowResult = {
  name?: string;
  description?: string;
  executionRoleArn?: string;
  customerEncryptionKeyArn?: string;
  id?: string;
  arn?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  version?: string;
  definition?: Record<string, unknown>;
};

/** Result of update_flow_alias. */
export type UpdateFlowAliasResult = {
  name?: string;
  description?: string;
  routingConfiguration?: Record<string, unknown>[];
  concurrencyConfiguration?: Record<string, unknown>;
  flowId?: string;
  id?: string;
  arn?: string;
  createdAt?: string;
  updatedAt?: string;
};

/** Result of update_knowledge_base. */
export type UpdateKnowledgeBaseResult = {
  knowledgeBase?: Record<string, unknown>;
};

/** Result of update_prompt. */
export type UpdatePromptResult = {
  name?: string;
  description?: string;
  customerEncryptionKeyArn?: string;
  defaultVariant?: string;
  variants?: Record<string, unknown>[];
  id?: string;
  arn?: string;
  version?: string;
  createdAt?: string;
  updatedAt?: string;
};

/** Result of validate_flow_definition. */
export type ValidateFlowDefinitionResult = {
  validations?: Record<string, unknown>[];
};

/** Create a new Bedrock Agent. */
export async function createAgent(agentName: string): Promise<AgentResult> {
  try {
    // TODO: implement create_agent
    throw new Error("create_agent not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_agent failed");
  }
}

/** Retrieve details of a Bedrock Agent. */
export async function getAgent(agentId: string): Promise<AgentResult> {
  try {
    // TODO: implement get_agent
    throw new Error("get_agent not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_agent failed");
  }
}

/** List Bedrock Agents in the account. */
export async function listAgents(): Promise<AgentResult[]> {
  try {
    // TODO: implement list_agents
    throw new Error("list_agents not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_agents failed");
  }
}

/** Delete a Bedrock Agent. */
export async function deleteAgent(agentId: string): Promise<void> {
  try {
    // TODO: implement delete_agent
    throw new Error("delete_agent not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_agent failed");
  }
}

/** Update an existing Bedrock Agent. */
export async function updateAgent(agentId: string, agentName: string): Promise<AgentResult> {
  try {
    // TODO: implement update_agent
    throw new Error("update_agent not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_agent failed");
  }
}

/** Prepare a Bedrock Agent for use. */
export async function prepareAgent(agentId: string): Promise<AgentResult> {
  try {
    // TODO: implement prepare_agent
    throw new Error("prepare_agent not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "prepare_agent failed");
  }
}

/** Create a Bedrock Knowledge Base. */
export async function createKnowledgeBase(name: string): Promise<KnowledgeBaseResult> {
  try {
    // TODO: implement create_knowledge_base
    throw new Error("create_knowledge_base not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_knowledge_base failed");
  }
}

/** Retrieve details of a Bedrock Knowledge Base. */
export async function getKnowledgeBase(knowledgeBaseId: string): Promise<KnowledgeBaseResult> {
  try {
    // TODO: implement get_knowledge_base
    throw new Error("get_knowledge_base not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_knowledge_base failed");
  }
}

/** List Bedrock Knowledge Bases in the account. */
export async function listKnowledgeBases(): Promise<KnowledgeBaseResult[]> {
  try {
    // TODO: implement list_knowledge_bases
    throw new Error("list_knowledge_bases not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_knowledge_bases failed");
  }
}

/** Delete a Bedrock Knowledge Base. */
export async function deleteKnowledgeBase(knowledgeBaseId: string): Promise<void> {
  try {
    // TODO: implement delete_knowledge_base
    throw new Error("delete_knowledge_base not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_knowledge_base failed");
  }
}

/** Associate a Knowledge Base with a Bedrock Agent. */
export async function associateAgentKnowledgeBase(agentId: string, agentVersion: string, knowledgeBaseId: string): Promise<Record<string, unknown>> {
  try {
    // TODO: implement associate_agent_knowledge_base
    throw new Error("associate_agent_knowledge_base not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "associate_agent_knowledge_base failed");
  }
}

/** Create a data source for a Bedrock Knowledge Base. */
export async function createDataSource(knowledgeBaseId: string, name: string): Promise<DataSourceResult> {
  try {
    // TODO: implement create_data_source
    throw new Error("create_data_source not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_data_source failed");
  }
}

/** Retrieve details of a Bedrock data source. */
export async function getDataSource(knowledgeBaseId: string, dataSourceId: string): Promise<DataSourceResult> {
  try {
    // TODO: implement get_data_source
    throw new Error("get_data_source not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_data_source failed");
  }
}

/** List data sources for a Bedrock Knowledge Base. */
export async function listDataSources(knowledgeBaseId: string): Promise<DataSourceResult[]> {
  try {
    // TODO: implement list_data_sources
    throw new Error("list_data_sources not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_data_sources failed");
  }
}

/** Start an ingestion job for a Bedrock data source. */
export async function startIngestionJob(knowledgeBaseId: string, dataSourceId: string): Promise<IngestionJobResult> {
  try {
    // TODO: implement start_ingestion_job
    throw new Error("start_ingestion_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_ingestion_job failed");
  }
}

/** Retrieve details of a Bedrock ingestion job. */
export async function getIngestionJob(knowledgeBaseId: string, dataSourceId: string, ingestionJobId: string): Promise<IngestionJobResult> {
  try {
    // TODO: implement get_ingestion_job
    throw new Error("get_ingestion_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_ingestion_job failed");
  }
}

/** Poll until a Bedrock Agent reaches a target or failure status. */
export async function waitForAgent(agentId: string): Promise<AgentResult> {
  try {
    // TODO: implement wait_for_agent
    throw new Error("wait_for_agent not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "wait_for_agent failed");
  }
}

/** Poll until an ingestion job reaches a target or failure status. */
export async function waitForIngestionJob(knowledgeBaseId: string, dataSourceId: string, ingestionJobId: string): Promise<IngestionJobResult> {
  try {
    // TODO: implement wait_for_ingestion_job
    throw new Error("wait_for_ingestion_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "wait_for_ingestion_job failed");
  }
}

/** Associate agent collaborator. */
export async function associateAgentCollaborator(agentId: string, agentVersion: string, agentDescriptor: Record<string, unknown>, collaboratorName: string, collaborationInstruction: string): Promise<AssociateAgentCollaboratorResult> {
  try {
    // TODO: implement associate_agent_collaborator
    throw new Error("associate_agent_collaborator not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "associate_agent_collaborator failed");
  }
}

/** Create agent action group. */
export async function createAgentActionGroup(agentId: string, agentVersion: string, actionGroupName: string): Promise<CreateAgentActionGroupResult> {
  try {
    // TODO: implement create_agent_action_group
    throw new Error("create_agent_action_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_agent_action_group failed");
  }
}

/** Create agent alias. */
export async function createAgentAlias(agentId: string, agentAliasName: string): Promise<CreateAgentAliasResult> {
  try {
    // TODO: implement create_agent_alias
    throw new Error("create_agent_alias not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_agent_alias failed");
  }
}

/** Create flow. */
export async function createFlow(name: string, executionRoleArn: string): Promise<CreateFlowResult> {
  try {
    // TODO: implement create_flow
    throw new Error("create_flow not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_flow failed");
  }
}

/** Create flow alias. */
export async function createFlowAlias(name: string, routingConfiguration: Record<string, unknown>[], flowIdentifier: string): Promise<CreateFlowAliasResult> {
  try {
    // TODO: implement create_flow_alias
    throw new Error("create_flow_alias not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_flow_alias failed");
  }
}

/** Create flow version. */
export async function createFlowVersion(flowIdentifier: string): Promise<CreateFlowVersionResult> {
  try {
    // TODO: implement create_flow_version
    throw new Error("create_flow_version not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_flow_version failed");
  }
}

/** Create prompt. */
export async function createPrompt(name: string): Promise<CreatePromptResult> {
  try {
    // TODO: implement create_prompt
    throw new Error("create_prompt not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_prompt failed");
  }
}

/** Create prompt version. */
export async function createPromptVersion(promptIdentifier: string): Promise<CreatePromptVersionResult> {
  try {
    // TODO: implement create_prompt_version
    throw new Error("create_prompt_version not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_prompt_version failed");
  }
}

/** Delete agent action group. */
export async function deleteAgentActionGroup(agentId: string, agentVersion: string, actionGroupId: string): Promise<void> {
  try {
    // TODO: implement delete_agent_action_group
    throw new Error("delete_agent_action_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_agent_action_group failed");
  }
}

/** Delete agent alias. */
export async function deleteAgentAlias(agentId: string, agentAliasId: string, regionName?: string): Promise<DeleteAgentAliasResult> {
  try {
    // TODO: implement delete_agent_alias
    throw new Error("delete_agent_alias not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_agent_alias failed");
  }
}

/** Delete agent version. */
export async function deleteAgentVersion(agentId: string, agentVersion: string): Promise<DeleteAgentVersionResult> {
  try {
    // TODO: implement delete_agent_version
    throw new Error("delete_agent_version not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_agent_version failed");
  }
}

/** Delete data source. */
export async function deleteDataSource(knowledgeBaseId: string, dataSourceId: string, regionName?: string): Promise<DeleteDataSourceResult> {
  try {
    // TODO: implement delete_data_source
    throw new Error("delete_data_source not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_data_source failed");
  }
}

/** Delete flow. */
export async function deleteFlow(flowIdentifier: string): Promise<DeleteFlowResult> {
  try {
    // TODO: implement delete_flow
    throw new Error("delete_flow not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_flow failed");
  }
}

/** Delete flow alias. */
export async function deleteFlowAlias(flowIdentifier: string, aliasIdentifier: string, regionName?: string): Promise<DeleteFlowAliasResult> {
  try {
    // TODO: implement delete_flow_alias
    throw new Error("delete_flow_alias not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_flow_alias failed");
  }
}

/** Delete flow version. */
export async function deleteFlowVersion(flowIdentifier: string, flowVersion: string): Promise<DeleteFlowVersionResult> {
  try {
    // TODO: implement delete_flow_version
    throw new Error("delete_flow_version not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_flow_version failed");
  }
}

/** Delete knowledge base documents. */
export async function deleteKnowledgeBaseDocuments(knowledgeBaseId: string, dataSourceId: string, documentIdentifiers: Record<string, unknown>[]): Promise<DeleteKnowledgeBaseDocumentsResult> {
  try {
    // TODO: implement delete_knowledge_base_documents
    throw new Error("delete_knowledge_base_documents not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_knowledge_base_documents failed");
  }
}

/** Delete prompt. */
export async function deletePrompt(promptIdentifier: string): Promise<DeletePromptResult> {
  try {
    // TODO: implement delete_prompt
    throw new Error("delete_prompt not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_prompt failed");
  }
}

/** Disassociate agent collaborator. */
export async function disassociateAgentCollaborator(agentId: string, agentVersion: string, collaboratorId: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement disassociate_agent_collaborator
    throw new Error("disassociate_agent_collaborator not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disassociate_agent_collaborator failed");
  }
}

/** Disassociate agent knowledge base. */
export async function disassociateAgentKnowledgeBase(agentId: string, agentVersion: string, knowledgeBaseId: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement disassociate_agent_knowledge_base
    throw new Error("disassociate_agent_knowledge_base not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disassociate_agent_knowledge_base failed");
  }
}

/** Get agent action group. */
export async function getAgentActionGroup(agentId: string, agentVersion: string, actionGroupId: string, regionName?: string): Promise<GetAgentActionGroupResult> {
  try {
    // TODO: implement get_agent_action_group
    throw new Error("get_agent_action_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_agent_action_group failed");
  }
}

/** Get agent alias. */
export async function getAgentAlias(agentId: string, agentAliasId: string, regionName?: string): Promise<GetAgentAliasResult> {
  try {
    // TODO: implement get_agent_alias
    throw new Error("get_agent_alias not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_agent_alias failed");
  }
}

/** Get agent collaborator. */
export async function getAgentCollaborator(agentId: string, agentVersion: string, collaboratorId: string, regionName?: string): Promise<GetAgentCollaboratorResult> {
  try {
    // TODO: implement get_agent_collaborator
    throw new Error("get_agent_collaborator not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_agent_collaborator failed");
  }
}

/** Get agent knowledge base. */
export async function getAgentKnowledgeBase(agentId: string, agentVersion: string, knowledgeBaseId: string, regionName?: string): Promise<GetAgentKnowledgeBaseResult> {
  try {
    // TODO: implement get_agent_knowledge_base
    throw new Error("get_agent_knowledge_base not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_agent_knowledge_base failed");
  }
}

/** Get agent version. */
export async function getAgentVersion(agentId: string, agentVersion: string, regionName?: string): Promise<GetAgentVersionResult> {
  try {
    // TODO: implement get_agent_version
    throw new Error("get_agent_version not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_agent_version failed");
  }
}

/** Get flow. */
export async function getFlow(flowIdentifier: string, regionName?: string): Promise<GetFlowResult> {
  try {
    // TODO: implement get_flow
    throw new Error("get_flow not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_flow failed");
  }
}

/** Get flow alias. */
export async function getFlowAlias(flowIdentifier: string, aliasIdentifier: string, regionName?: string): Promise<GetFlowAliasResult> {
  try {
    // TODO: implement get_flow_alias
    throw new Error("get_flow_alias not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_flow_alias failed");
  }
}

/** Get flow version. */
export async function getFlowVersion(flowIdentifier: string, flowVersion: string, regionName?: string): Promise<GetFlowVersionResult> {
  try {
    // TODO: implement get_flow_version
    throw new Error("get_flow_version not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_flow_version failed");
  }
}

/** Get knowledge base documents. */
export async function getKnowledgeBaseDocuments(knowledgeBaseId: string, dataSourceId: string, documentIdentifiers: Record<string, unknown>[], regionName?: string): Promise<GetKnowledgeBaseDocumentsResult> {
  try {
    // TODO: implement get_knowledge_base_documents
    throw new Error("get_knowledge_base_documents not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_knowledge_base_documents failed");
  }
}

/** Get prompt. */
export async function getPrompt(promptIdentifier: string): Promise<GetPromptResult> {
  try {
    // TODO: implement get_prompt
    throw new Error("get_prompt not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_prompt failed");
  }
}

/** Ingest knowledge base documents. */
export async function ingestKnowledgeBaseDocuments(knowledgeBaseId: string, dataSourceId: string, documents: Record<string, unknown>[]): Promise<IngestKnowledgeBaseDocumentsResult> {
  try {
    // TODO: implement ingest_knowledge_base_documents
    throw new Error("ingest_knowledge_base_documents not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "ingest_knowledge_base_documents failed");
  }
}

/** List agent action groups. */
export async function listAgentActionGroups(agentId: string, agentVersion: string): Promise<ListAgentActionGroupsResult> {
  try {
    // TODO: implement list_agent_action_groups
    throw new Error("list_agent_action_groups not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_agent_action_groups failed");
  }
}

/** List agent aliases. */
export async function listAgentAliases(agentId: string): Promise<ListAgentAliasesResult> {
  try {
    // TODO: implement list_agent_aliases
    throw new Error("list_agent_aliases not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_agent_aliases failed");
  }
}

/** List agent collaborators. */
export async function listAgentCollaborators(agentId: string, agentVersion: string): Promise<ListAgentCollaboratorsResult> {
  try {
    // TODO: implement list_agent_collaborators
    throw new Error("list_agent_collaborators not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_agent_collaborators failed");
  }
}

/** List agent knowledge bases. */
export async function listAgentKnowledgeBases(agentId: string, agentVersion: string): Promise<ListAgentKnowledgeBasesResult> {
  try {
    // TODO: implement list_agent_knowledge_bases
    throw new Error("list_agent_knowledge_bases not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_agent_knowledge_bases failed");
  }
}

/** List agent versions. */
export async function listAgentVersions(agentId: string): Promise<ListAgentVersionsResult> {
  try {
    // TODO: implement list_agent_versions
    throw new Error("list_agent_versions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_agent_versions failed");
  }
}

/** List flow aliases. */
export async function listFlowAliases(flowIdentifier: string): Promise<ListFlowAliasesResult> {
  try {
    // TODO: implement list_flow_aliases
    throw new Error("list_flow_aliases not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_flow_aliases failed");
  }
}

/** List flow versions. */
export async function listFlowVersions(flowIdentifier: string): Promise<ListFlowVersionsResult> {
  try {
    // TODO: implement list_flow_versions
    throw new Error("list_flow_versions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_flow_versions failed");
  }
}

/** List flows. */
export async function listFlows(): Promise<ListFlowsResult> {
  try {
    // TODO: implement list_flows
    throw new Error("list_flows not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_flows failed");
  }
}

/** List ingestion jobs. */
export async function listIngestionJobs(knowledgeBaseId: string, dataSourceId: string): Promise<ListIngestionJobsResult> {
  try {
    // TODO: implement list_ingestion_jobs
    throw new Error("list_ingestion_jobs not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_ingestion_jobs failed");
  }
}

/** List knowledge base documents. */
export async function listKnowledgeBaseDocuments(knowledgeBaseId: string, dataSourceId: string): Promise<ListKnowledgeBaseDocumentsResult> {
  try {
    // TODO: implement list_knowledge_base_documents
    throw new Error("list_knowledge_base_documents not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_knowledge_base_documents failed");
  }
}

/** List prompts. */
export async function listPrompts(): Promise<ListPromptsResult> {
  try {
    // TODO: implement list_prompts
    throw new Error("list_prompts not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_prompts failed");
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

/** Prepare flow. */
export async function prepareFlow(flowIdentifier: string, regionName?: string): Promise<PrepareFlowResult> {
  try {
    // TODO: implement prepare_flow
    throw new Error("prepare_flow not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "prepare_flow failed");
  }
}

/** Stop ingestion job. */
export async function stopIngestionJob(knowledgeBaseId: string, dataSourceId: string, ingestionJobId: string, regionName?: string): Promise<StopIngestionJobResult> {
  try {
    // TODO: implement stop_ingestion_job
    throw new Error("stop_ingestion_job not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "stop_ingestion_job failed");
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

/** Update agent action group. */
export async function updateAgentActionGroup(agentId: string, agentVersion: string, actionGroupId: string, actionGroupName: string): Promise<UpdateAgentActionGroupResult> {
  try {
    // TODO: implement update_agent_action_group
    throw new Error("update_agent_action_group not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_agent_action_group failed");
  }
}

/** Update agent alias. */
export async function updateAgentAlias(agentId: string, agentAliasId: string, agentAliasName: string): Promise<UpdateAgentAliasResult> {
  try {
    // TODO: implement update_agent_alias
    throw new Error("update_agent_alias not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_agent_alias failed");
  }
}

/** Update agent collaborator. */
export async function updateAgentCollaborator(agentId: string, agentVersion: string, collaboratorId: string, agentDescriptor: Record<string, unknown>, collaboratorName: string, collaborationInstruction: string): Promise<UpdateAgentCollaboratorResult> {
  try {
    // TODO: implement update_agent_collaborator
    throw new Error("update_agent_collaborator not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_agent_collaborator failed");
  }
}

/** Update agent knowledge base. */
export async function updateAgentKnowledgeBase(agentId: string, agentVersion: string, knowledgeBaseId: string): Promise<UpdateAgentKnowledgeBaseResult> {
  try {
    // TODO: implement update_agent_knowledge_base
    throw new Error("update_agent_knowledge_base not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_agent_knowledge_base failed");
  }
}

/** Update data source. */
export async function updateDataSource(knowledgeBaseId: string, dataSourceId: string, name: string, dataSourceConfiguration: Record<string, unknown>): Promise<UpdateDataSourceResult> {
  try {
    // TODO: implement update_data_source
    throw new Error("update_data_source not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_data_source failed");
  }
}

/** Update flow. */
export async function updateFlow(name: string, executionRoleArn: string, flowIdentifier: string): Promise<UpdateFlowResult> {
  try {
    // TODO: implement update_flow
    throw new Error("update_flow not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_flow failed");
  }
}

/** Update flow alias. */
export async function updateFlowAlias(name: string, routingConfiguration: Record<string, unknown>[], flowIdentifier: string, aliasIdentifier: string): Promise<UpdateFlowAliasResult> {
  try {
    // TODO: implement update_flow_alias
    throw new Error("update_flow_alias not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_flow_alias failed");
  }
}

/** Update knowledge base. */
export async function updateKnowledgeBase(knowledgeBaseId: string, name: string, roleArn: string, knowledgeBaseConfiguration: Record<string, unknown>): Promise<UpdateKnowledgeBaseResult> {
  try {
    // TODO: implement update_knowledge_base
    throw new Error("update_knowledge_base not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_knowledge_base failed");
  }
}

/** Update prompt. */
export async function updatePrompt(name: string, promptIdentifier: string): Promise<UpdatePromptResult> {
  try {
    // TODO: implement update_prompt
    throw new Error("update_prompt not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_prompt failed");
  }
}

/** Validate flow definition. */
export async function validateFlowDefinition(definition: Record<string, unknown>, regionName?: string): Promise<ValidateFlowDefinitionResult> {
  try {
    // TODO: implement validate_flow_definition
    throw new Error("validate_flow_definition not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "validate_flow_definition failed");
  }
}
