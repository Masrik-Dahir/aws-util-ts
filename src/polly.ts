import { PollyClient } from "@aws-sdk/client-polly";
import { getClient } from "./client";
import { wrapAwsError } from "./exceptions";

/** The result of a synchronous speech synthesis call. */
export type SynthesisResult = {
  audioStream: Uint8Array;
  contentType?: string;
  requestCharacters?: number;
};

/** A voice available in Amazon Polly. */
export type Voice = {
  voiceId: string;
  name?: string;
  gender?: string;
  languageCode?: string;
  languageName?: string;
  supportedEngines?: string[];
};

/** Metadata for an asynchronous speech synthesis task. */
export type SpeechSynthesisTask = {
  taskId?: string;
  taskStatus?: string;
  taskStatusReason?: string;
  outputUri?: string;
  outputFormat?: string;
  textType?: string;
  voiceId?: string;
  languageCode?: string;
  engine?: string;
  sampleRate?: string;
  speechMarkTypes?: string[];
  requestCharacters?: number;
};

/** Attributes describing a pronunciation lexicon. */
export type LexiconAttributes = {
  alphabet?: string;
  languageCode?: string;
  lastModified?: unknown;
  lexiconArn?: string;
  lexemesCount?: number;
  size?: number;
};

/** A pronunciation lexicon with its content. */
export type Lexicon = {
  name?: string;
  content?: string;
};

/** Summary description of a pronunciation lexicon. */
export type LexiconDescription = {
  name?: string;
  attributes?: LexiconAttributes;
};

/** Synthesize speech from text and return raw audio bytes. */
export async function synthesizeSpeech(text: string, voiceId: string, outputFormat: string, engine?: string, languageCode?: string, sampleRate?: string, speechMarkTypes?: string[], textType?: string, lexiconNames?: string[], regionName?: string): Promise<SynthesisResult> {
  try {
    // TODO: implement synthesize_speech
    throw new Error("synthesize_speech not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "synthesize_speech failed");
  }
}

/** List available Polly voices, optionally filtered by language or engine. */
export async function describeVoices(languageCode?: string, engine?: string, includeAdditionalLanguageCodes: boolean, regionName?: string): Promise<Voice[]> {
  try {
    // TODO: implement describe_voices
    throw new Error("describe_voices not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_voices failed");
  }
}

/** List asynchronous speech synthesis tasks. */
export async function listSpeechSynthesisTasks(status?: string, regionName?: string): Promise<SpeechSynthesisTask[]> {
  try {
    // TODO: implement list_speech_synthesis_tasks
    throw new Error("list_speech_synthesis_tasks not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_speech_synthesis_tasks failed");
  }
}

/** Get details of an asynchronous speech synthesis task. */
export async function getSpeechSynthesisTask(taskId: string, regionName?: string): Promise<SpeechSynthesisTask> {
  try {
    // TODO: implement get_speech_synthesis_task
    throw new Error("get_speech_synthesis_task not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_speech_synthesis_task failed");
  }
}

/** Start an asynchronous speech synthesis task. */
export async function startSpeechSynthesisTask(text: string, voiceId: string, outputFormat: string, outputS3BucketName: string, outputS3KeyPrefix?: string, engine?: string, languageCode?: string, sampleRate?: string, textType?: string, lexiconNames?: string[], snsTopicArn?: string, regionName?: string): Promise<SpeechSynthesisTask> {
  try {
    // TODO: implement start_speech_synthesis_task
    throw new Error("start_speech_synthesis_task not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_speech_synthesis_task failed");
  }
}

/** Retrieve a pronunciation lexicon by name. */
export async function getLexicon(name: string, regionName?: string): Promise<unknown> {
  try {
    // TODO: implement get_lexicon
    throw new Error("get_lexicon not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_lexicon failed");
  }
}

/** Create or update a pronunciation lexicon. */
export async function putLexicon(name: string, content: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement put_lexicon
    throw new Error("put_lexicon not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_lexicon failed");
  }
}

/** List all pronunciation lexicons in the account. */
export async function listLexicons(regionName?: string): Promise<LexiconDescription[]> {
  try {
    // TODO: implement list_lexicons
    throw new Error("list_lexicons not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_lexicons failed");
  }
}

/** Delete lexicon. */
export async function deleteLexicon(name: string, regionName?: string): Promise<void> {
  try {
    // TODO: implement delete_lexicon
    throw new Error("delete_lexicon not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_lexicon failed");
  }
}
