import { IvsClient } from "@aws-sdk/client-ivs";
import { getClient } from "./client";
import { wrapAwsError } from "./exceptions";

/** Metadata for an IVS channel. */
export type ChannelResult = {
  arn: string;
  name?: string;
  latencyMode?: string;
  type?: string;
  recordingConfigurationArn?: string;
  ingestEndpoint?: string;
  playbackUrl?: string;
  authorized?: boolean;
  tags?: Record<string, unknown>;
  extra?: Record<string, unknown>;
};

/** Metadata for an IVS stream key. */
export type StreamKeyResult = {
  arn: string;
  channelArn?: string;
  value?: string;
  tags?: Record<string, unknown>;
  extra?: Record<string, unknown>;
};

/** Metadata for an IVS stream. */
export type StreamResult = {
  channelArn: string;
  streamId?: string;
  state?: string;
  health?: string;
  viewerCount?: number;
  startTime?: unknown;
  extra?: Record<string, unknown>;
};

/** Metadata for an IVS recording configuration. */
export type RecordingConfigurationResult = {
  arn: string;
  name?: string;
  state?: string;
  destinationConfiguration?: Record<string, unknown>;
  tags?: Record<string, unknown>;
  extra?: Record<string, unknown>;
};

/** Result of batch_get_channel. */
export type BatchGetChannelResult = {
  channels?: Record<string, unknown>[];
  errors?: Record<string, unknown>[];
};

/** Result of batch_get_stream_key. */
export type BatchGetStreamKeyResult = {
  errors?: Record<string, unknown>[];
  streamKeys?: Record<string, unknown>[];
};

/** Result of batch_start_viewer_session_revocation. */
export type BatchStartViewerSessionRevocationResult = {
  errors?: Record<string, unknown>[];
};

/** Result of create_playback_restriction_policy. */
export type CreatePlaybackRestrictionPolicyResult = {
  playbackRestrictionPolicy?: Record<string, unknown>;
};

/** Result of get_playback_key_pair. */
export type GetPlaybackKeyPairResult = {
  keyPair?: Record<string, unknown>;
};

/** Result of get_playback_restriction_policy. */
export type GetPlaybackRestrictionPolicyResult = {
  playbackRestrictionPolicy?: Record<string, unknown>;
};

/** Result of get_stream_session. */
export type GetStreamSessionResult = {
  streamSession?: Record<string, unknown>;
};

/** Result of import_playback_key_pair. */
export type ImportPlaybackKeyPairResult = {
  keyPair?: Record<string, unknown>;
};

/** Result of list_playback_key_pairs. */
export type ListPlaybackKeyPairsResult = {
  keyPairs?: Record<string, unknown>[];
  nextToken?: string;
};

/** Result of list_playback_restriction_policies. */
export type ListPlaybackRestrictionPoliciesResult = {
  nextToken?: string;
  playbackRestrictionPolicies?: Record<string, unknown>[];
};

/** Result of list_stream_sessions. */
export type ListStreamSessionsResult = {
  nextToken?: string;
  streamSessions?: Record<string, unknown>[];
};

/** Result of list_tags_for_resource. */
export type ListTagsForResourceResult = {
  tags?: Record<string, unknown>;
};

/** Result of update_playback_restriction_policy. */
export type UpdatePlaybackRestrictionPolicyResult = {
  playbackRestrictionPolicy?: Record<string, unknown>;
};

/** Create an IVS channel. */
export async function createChannel(name: string): Promise<ChannelResult> {
  try {
    // TODO: implement create_channel
    throw new Error("create_channel not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_channel failed");
  }
}

/** Fetch an IVS channel by ARN. */
export async function getChannel(arn: string): Promise<ChannelResult> {
  try {
    // TODO: implement get_channel
    throw new Error("get_channel not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_channel failed");
  }
}

/** List IVS channels. */
export async function listChannels(): Promise<ChannelResult[]> {
  try {
    // TODO: implement list_channels
    throw new Error("list_channels not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_channels failed");
  }
}

/** Update an IVS channel. */
export async function updateChannel(arn: string): Promise<ChannelResult> {
  try {
    // TODO: implement update_channel
    throw new Error("update_channel not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_channel failed");
  }
}

/** Delete an IVS channel. */
export async function deleteChannel(arn: string): Promise<void> {
  try {
    // TODO: implement delete_channel
    throw new Error("delete_channel not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_channel failed");
  }
}

/** Create an IVS stream key. */
export async function createStreamKey(channelArn: string): Promise<StreamKeyResult> {
  try {
    // TODO: implement create_stream_key
    throw new Error("create_stream_key not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_stream_key failed");
  }
}

/** Fetch an IVS stream key by ARN. */
export async function getStreamKey(arn: string): Promise<StreamKeyResult> {
  try {
    // TODO: implement get_stream_key
    throw new Error("get_stream_key not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_stream_key failed");
  }
}

/** List IVS stream keys for a channel. */
export async function listStreamKeys(channelArn: string): Promise<StreamKeyResult[]> {
  try {
    // TODO: implement list_stream_keys
    throw new Error("list_stream_keys not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_stream_keys failed");
  }
}

/** Delete an IVS stream key. */
export async function deleteStreamKey(arn: string): Promise<void> {
  try {
    // TODO: implement delete_stream_key
    throw new Error("delete_stream_key not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_stream_key failed");
  }
}

/** Get the active stream for a channel. */
export async function getStream(channelArn: string): Promise<StreamResult> {
  try {
    // TODO: implement get_stream
    throw new Error("get_stream not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_stream failed");
  }
}

/** List IVS streams. */
export async function listStreams(): Promise<StreamResult[]> {
  try {
    // TODO: implement list_streams
    throw new Error("list_streams not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_streams failed");
  }
}

/** Stop an IVS stream. */
export async function stopStream(channelArn: string): Promise<void> {
  try {
    // TODO: implement stop_stream
    throw new Error("stop_stream not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "stop_stream failed");
  }
}

/** Create an IVS recording configuration. */
export async function createRecordingConfiguration(destinationConfiguration: Record<string, unknown>): Promise<RecordingConfigurationResult> {
  try {
    // TODO: implement create_recording_configuration
    throw new Error("create_recording_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_recording_configuration failed");
  }
}

/** Fetch an IVS recording configuration by ARN. */
export async function getRecordingConfiguration(arn: string): Promise<RecordingConfigurationResult> {
  try {
    // TODO: implement get_recording_configuration
    throw new Error("get_recording_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_recording_configuration failed");
  }
}

/** List IVS recording configurations. */
export async function listRecordingConfigurations(): Promise<RecordingConfigurationResult[]> {
  try {
    // TODO: implement list_recording_configurations
    throw new Error("list_recording_configurations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_recording_configurations failed");
  }
}

/** Delete an IVS recording configuration. */
export async function deleteRecordingConfiguration(arn: string): Promise<void> {
  try {
    // TODO: implement delete_recording_configuration
    throw new Error("delete_recording_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_recording_configuration failed");
  }
}

/** Batch get channel. */
export async function batchGetChannel(arns: string[], regionName?: string): Promise<BatchGetChannelResult> {
  try {
    // TODO: implement batch_get_channel
    throw new Error("batch_get_channel not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_get_channel failed");
  }
}

/** Batch get stream key. */
export async function batchGetStreamKey(arns: string[], regionName?: string): Promise<BatchGetStreamKeyResult> {
  try {
    // TODO: implement batch_get_stream_key
    throw new Error("batch_get_stream_key not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_get_stream_key failed");
  }
}

/** Batch start viewer session revocation. */
export async function batchStartViewerSessionRevocation(viewerSessions: Record<string, unknown>[], regionName?: string): Promise<BatchStartViewerSessionRevocationResult> {
  try {
    // TODO: implement batch_start_viewer_session_revocation
    throw new Error("batch_start_viewer_session_revocation not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_start_viewer_session_revocation failed");
  }
}

/** Create playback restriction policy. */
export async function createPlaybackRestrictionPolicy(): Promise<CreatePlaybackRestrictionPolicyResult> {
  try {
    // TODO: implement create_playback_restriction_policy
    throw new Error("create_playback_restriction_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_playback_restriction_policy failed");
  }
}

/** Delete playback key pair. */
export async function deletePlaybackKeyPair(arn: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_playback_key_pair
    throw new Error("delete_playback_key_pair not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_playback_key_pair failed");
  }
}

/** Delete playback restriction policy. */
export async function deletePlaybackRestrictionPolicy(arn: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_playback_restriction_policy
    throw new Error("delete_playback_restriction_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_playback_restriction_policy failed");
  }
}

/** Get playback key pair. */
export async function getPlaybackKeyPair(arn: string, regionName?: string): Promise<GetPlaybackKeyPairResult> {
  try {
    // TODO: implement get_playback_key_pair
    throw new Error("get_playback_key_pair not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_playback_key_pair failed");
  }
}

/** Get playback restriction policy. */
export async function getPlaybackRestrictionPolicy(arn: string, regionName?: string): Promise<GetPlaybackRestrictionPolicyResult> {
  try {
    // TODO: implement get_playback_restriction_policy
    throw new Error("get_playback_restriction_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_playback_restriction_policy failed");
  }
}

/** Get stream session. */
export async function getStreamSession(channelArn: string): Promise<GetStreamSessionResult> {
  try {
    // TODO: implement get_stream_session
    throw new Error("get_stream_session not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_stream_session failed");
  }
}

/** Import playback key pair. */
export async function importPlaybackKeyPair(publicKeyMaterial: string): Promise<ImportPlaybackKeyPairResult> {
  try {
    // TODO: implement import_playback_key_pair
    throw new Error("import_playback_key_pair not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "import_playback_key_pair failed");
  }
}

/** List playback key pairs. */
export async function listPlaybackKeyPairs(): Promise<ListPlaybackKeyPairsResult> {
  try {
    // TODO: implement list_playback_key_pairs
    throw new Error("list_playback_key_pairs not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_playback_key_pairs failed");
  }
}

/** List playback restriction policies. */
export async function listPlaybackRestrictionPolicies(): Promise<ListPlaybackRestrictionPoliciesResult> {
  try {
    // TODO: implement list_playback_restriction_policies
    throw new Error("list_playback_restriction_policies not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_playback_restriction_policies failed");
  }
}

/** List stream sessions. */
export async function listStreamSessions(channelArn: string): Promise<ListStreamSessionsResult> {
  try {
    // TODO: implement list_stream_sessions
    throw new Error("list_stream_sessions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_stream_sessions failed");
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

/** Put metadata. */
export async function putMetadata(channelArn: string, metadata: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement put_metadata
    throw new Error("put_metadata not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_metadata failed");
  }
}

/** Start viewer session revocation. */
export async function startViewerSessionRevocation(channelArn: string, viewerId: string): Promise<void> {
  try {
    // TODO: implement start_viewer_session_revocation
    throw new Error("start_viewer_session_revocation not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_viewer_session_revocation failed");
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

/** Update playback restriction policy. */
export async function updatePlaybackRestrictionPolicy(arn: string): Promise<UpdatePlaybackRestrictionPolicyResult> {
  try {
    // TODO: implement update_playback_restriction_policy
    throw new Error("update_playback_restriction_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_playback_restriction_policy failed");
  }
}
