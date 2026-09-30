import { wrapAwsError } from "./exceptions";

/** A message from a Lex V2 bot response. */
export type LexMessage = {
  content?: string;
  contentType?: string;
  imageResponseCard?: Record<string, unknown>;
};

/** Session state from a Lex V2 bot. */
export type LexSessionState = {
  sessionId?: string;
  intentName?: string;
  dialogActionType?: string;
  sessionAttributes?: Record<string, unknown>;
};

/** Send text to a Lex V2 bot and get a response. */
export async function recognizeText(botId: string, botAliasId: string, localeId: string, sessionId: string, text: string, sessionState?: Record<string, unknown>, requestAttributes?: Record<string, unknown>, regionName?: string): Promise<Record<string, unknown>> {
  try {
    // TODO: implement recognize_text
    throw new Error("recognize_text not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "recognize_text failed");
  }
}

/** Send an utterance (audio or DTMF) to a Lex V2 bot. */
export async function recognizeUtterance(botId: string, botAliasId: string, localeId: string, sessionId: string, requestContentType: string, inputStream?: Uint8Array, sessionState?: string, requestAttributes?: string, responseContentType?: string, regionName?: string): Promise<Record<string, unknown>> {
  try {
    // TODO: implement recognize_utterance
    throw new Error("recognize_utterance not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "recognize_utterance failed");
  }
}

/** Set the state of a Lex V2 session. */
export async function putSession(botId: string, botAliasId: string, localeId: string, sessionId: string, sessionState: Record<string, unknown>, messages?: Record<string, unknown>[], requestAttributes?: Record<string, unknown>, responseContentType?: string, regionName?: string): Promise<Record<string, unknown>> {
  try {
    // TODO: implement put_session
    throw new Error("put_session not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_session failed");
  }
}

/** Get the current state of a Lex V2 session. */
export async function getSession(botId: string, botAliasId: string, localeId: string, sessionId: string, regionName?: string): Promise<Record<string, unknown>> {
  try {
    // TODO: implement get_session
    throw new Error("get_session not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_session failed");
  }
}

/** Delete a Lex V2 session. */
export async function deleteSession(botId: string, botAliasId: string, localeId: string, sessionId: string, regionName?: string): Promise<Record<string, unknown>> {
  try {
    // TODO: implement delete_session
    throw new Error("delete_session not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_session failed");
  }
}
