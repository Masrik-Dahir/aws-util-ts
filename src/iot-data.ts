import { wrapAwsError } from "./exceptions";

/** Metadata for an IoT thing shadow. */
export type ShadowResult = {
  payload?: Record<string, unknown>;
  extra?: Record<string, unknown>;
};

/** Metadata for a retained MQTT message. */
export type RetainedMessageResult = {
  topic?: string;
  payload?: Uint8Array;
  qos?: number;
  lastModifiedTime?: number;
  extra?: Record<string, unknown>;
};

/** Publish a message to an MQTT topic. */
export async function publish(topic: string): Promise<void> {
  try {
    // TODO: implement publish
    throw new Error("publish not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "publish failed");
  }
}

/** Get the shadow for a thing. */
export async function getThingShadow(thingName: string): Promise<ShadowResult> {
  try {
    // TODO: implement get_thing_shadow
    throw new Error("get_thing_shadow not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_thing_shadow failed");
  }
}

/** Update the shadow for a thing. */
export async function updateThingShadow(thingName: string): Promise<ShadowResult> {
  try {
    // TODO: implement update_thing_shadow
    throw new Error("update_thing_shadow not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_thing_shadow failed");
  }
}

/** Delete the shadow for a thing. */
export async function deleteThingShadow(thingName: string): Promise<void> {
  try {
    // TODO: implement delete_thing_shadow
    throw new Error("delete_thing_shadow not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_thing_shadow failed");
  }
}

/** List named shadows for a thing. */
export async function listNamedShadowsForThing(thingName: string): Promise<string[]> {
  try {
    // TODO: implement list_named_shadows_for_thing
    throw new Error("list_named_shadows_for_thing not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_named_shadows_for_thing failed");
  }
}

/** Get the retained message for a topic. */
export async function getRetainedMessage(topic: string): Promise<RetainedMessageResult> {
  try {
    // TODO: implement get_retained_message
    throw new Error("get_retained_message not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_retained_message failed");
  }
}

/** List all retained messages. */
export async function listRetainedMessages(): Promise<RetainedMessageResult[]> {
  try {
    // TODO: implement list_retained_messages
    throw new Error("list_retained_messages not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_retained_messages failed");
  }
}

/** Delete connection. */
export async function deleteConnection(clientId: string): Promise<void> {
  try {
    // TODO: implement delete_connection
    throw new Error("delete_connection not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_connection failed");
  }
}
