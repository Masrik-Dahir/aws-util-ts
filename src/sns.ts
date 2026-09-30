/**
 * aws-util/sns — High-level Amazon SNS utilities.
 *
 * Provides typed helpers for publishing messages, batch publishing, fan-out
 * across multiple topics, and idempotent topic creation.
 *
 * @example
 * ```ts
 * import { publish, publishFanOut } from "./sns.js";
 *
 * await publish("arn:aws:sns:us-east-1:123:my-topic", { event: "signup" });
 * ```
 *
 * @module
 */

import { z } from "zod";
import {
  SNSClient,
  PublishCommand,
  PublishBatchCommand,
  CreateTopicCommand,
} from "@aws-sdk/client-sns";
import { getClient } from "./client.js";
import {
  wrapAwsError,
  AwsValidationError,
} from "./exceptions.js";

// ---------------------------------------------------------------------------
// Zod schemas
// ---------------------------------------------------------------------------

/** Schema for the result of a publish operation. */
export const PublishResultSchema = z.object({
  messageId: z.string(),
  sequenceNumber: z.string().optional(),
});

/** Result of {@link publish} or an individual entry in {@link publishBatch}. */
export type PublishResult = z.infer<typeof PublishResultSchema>;

/** Schema for a single fan-out failure. */
export const FanOutFailureSchema = z.object({
  topicArn: z.string(),
  error: z.string(),
});

/** Describes a failure when publishing to one topic in a fan-out. */
export type FanOutFailure = z.infer<typeof FanOutFailureSchema>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Serialize a message: objects are JSON-stringified, strings pass through.
 */
function serializeMessage(message: string | object): string {
  return typeof message === "string" ? message : JSON.stringify(message);
}

/**
 * Build an SNS client for the given region.
 */
function sns(region?: string): SNSClient {
  return getClient(SNSClient, region);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Publish a message to an SNS topic.
 *
 * Objects are automatically serialized to JSON. For FIFO topics, supply
 * `messageGroupId` and optionally `messageDeduplicationId`.
 *
 * @param topicArn - The topic ARN.
 * @param message - Message body (string or JSON-serializable object).
 * @param subject - Optional subject line (for email-subscribed endpoints).
 * @param messageGroupId - FIFO message group ID.
 * @param messageDeduplicationId - FIFO deduplication ID.
 * @param region - AWS region override.
 * @returns The message ID and optional sequence number.
 */
export async function publish(
  topicArn: string,
  message: string | object,
  subject?: string,
  messageGroupId?: string,
  messageDeduplicationId?: string,
  region?: string,
): Promise<PublishResult> {
  try {
    const res = await sns(region).send(
      new PublishCommand({
        TopicArn: topicArn,
        Message: serializeMessage(message),
        Subject: subject,
        MessageGroupId: messageGroupId,
        MessageDeduplicationId: messageDeduplicationId,
      }),
    );
    return PublishResultSchema.parse({
      messageId: res.MessageId,
      sequenceNumber: res.SequenceNumber,
    });
  } catch (err: unknown) {
    throw wrapAwsError(err, "publish");
  }
}

/**
 * Publish a batch of up to 10 messages to an SNS topic.
 *
 * @param topicArn - The topic ARN.
 * @param messages - Array of message bodies (max 10).
 * @param region - AWS region override.
 * @returns An array of publish results, one per message.
 * @throws {AwsValidationError} If more than 10 messages are provided.
 */
export async function publishBatch(
  topicArn: string,
  messages: (string | object)[],
  region?: string,
): Promise<PublishResult[]> {
  if (messages.length > 10) {
    throw new AwsValidationError(
      "publishBatch: SNS batch limit is 10 messages",
    );
  }
  try {
    const entries = messages.map((msg, i) => ({
      Id: String(i),
      Message: serializeMessage(msg),
    }));
    const res = await sns(region).send(
      new PublishBatchCommand({
        TopicArn: topicArn,
        PublishBatchRequestEntries: entries,
      }),
    );
    if (res.Failed && res.Failed.length > 0) {
      const codes = res.Failed.map((f) => f.Code).join(", ");
      throw new AwsValidationError(
        `publishBatch: ${res.Failed.length} message(s) failed: ${codes}`,
      );
    }
    return (res.Successful ?? []).map((s) =>
      PublishResultSchema.parse({
        messageId: s.MessageId,
        sequenceNumber: s.SequenceNumber,
      }),
    );
  } catch (err: unknown) {
    throw wrapAwsError(err, "publishBatch");
  }
}

/**
 * Publish the same message to multiple SNS topics concurrently.
 *
 * Uses `Promise.allSettled` with an optional concurrency limit. Fulfilled
 * results are returned directly; rejected results are collected as
 * {@link FanOutFailure} entries but do **not** cause the function to throw.
 *
 * @param topicArns - List of topic ARNs to publish to.
 * @param message - Message body (string or JSON-serializable object).
 * @param subject - Optional subject line.
 * @param maxConcurrency - Maximum number of concurrent publishes (default unlimited).
 * @param region - AWS region override.
 * @returns An array of successful publish results. Check the returned
 *   array length against `topicArns.length` to detect partial failures.
 */
export async function publishFanOut(
  topicArns: string[],
  message: string | object,
  subject?: string,
  maxConcurrency?: number,
  region?: string,
): Promise<PublishResult[]> {
  const results: PublishResult[] = [];
  const concurrency = maxConcurrency ?? topicArns.length;

  // Process in chunks of `concurrency`
  for (let i = 0; i < topicArns.length; i += concurrency) {
    const chunk = topicArns.slice(i, i + concurrency);
    const settled = await Promise.allSettled(
      chunk.map((arn) =>
        publish(arn, message, subject, undefined, undefined, region),
      ),
    );

    for (const outcome of settled) {
      if (outcome.status === "fulfilled") {
        results.push(outcome.value);
      }
      // Rejected results are silently skipped; callers compare
      // results.length to topicArns.length to detect partial failure.
    }
  }

  return results;
}

/**
 * Create an SNS topic if it does not already exist, returning its ARN.
 *
 * `CreateTopic` is idempotent: calling it for an existing topic with the
 * same attributes simply returns the existing ARN.
 *
 * @param topicName - The topic name.
 * @param fifo - Whether to create a FIFO topic (appends `.fifo` if needed).
 * @param attributes - Additional topic attributes.
 * @param region - AWS region override.
 * @returns The topic ARN.
 */
export async function createTopicIfNotExists(
  topicName: string,
  fifo?: boolean,
  attributes?: Record<string, string>,
  region?: string,
): Promise<string> {
  try {
    const effectiveName =
      fifo && !topicName.endsWith(".fifo")
        ? `${topicName}.fifo`
        : topicName;

    const topicAttributes: Record<string, string> = {
      ...(attributes ?? {}),
    };
    if (fifo) {
      topicAttributes["FifoTopic"] = "true";
    }

    const res = await sns(region).send(
      new CreateTopicCommand({
        Name: effectiveName,
        Attributes:
          Object.keys(topicAttributes).length > 0
            ? topicAttributes
            : undefined,
      }),
    );
    return res.TopicArn!;
  } catch (err: unknown) {
    throw wrapAwsError(err, `createTopicIfNotExists(${topicName})`);
  }
}

// ---------------------------------------------------------------------------
// Additional types (auto-generated)
// ---------------------------------------------------------------------------

/** Result of check_if_phone_number_is_opted_out. */
export type CheckIfPhoneNumberIsOptedOutResult = {
  isOptedOut?: boolean | undefined;
};

/** Result of confirm_subscription. */
export type ConfirmSubscriptionResult = {
  subscriptionArn?: string | undefined;
};

/** Result of create_platform_application. */
export type CreatePlatformApplicationResult = {
  platformApplicationArn?: string | undefined;
};

/** Result of create_platform_endpoint. */
export type CreatePlatformEndpointResult = {
  endpointArn?: string | undefined;
};

/** Result of create_topic. */
export type CreateTopicResult = {
  topicArn?: string | undefined;
};

/** Result of get_data_protection_policy. */
export type GetDataProtectionPolicyResult = {
  dataProtectionPolicy?: string | undefined;
};

/** Result of get_endpoint_attributes. */
export type GetEndpointAttributesResult = {
  attributes?: Record<string, unknown>;
};

/** Result of get_platform_application_attributes. */
export type GetPlatformApplicationAttributesResult = {
  attributes?: Record<string, unknown>;
};

/** Result of get_sms_attributes. */
export type GetSmsAttributesResult = {
  attributes?: Record<string, unknown>;
};

/** Result of get_sms_sandbox_account_status. */
export type GetSmsSandboxAccountStatusResult = {
  isInSandbox?: boolean | undefined;
};

/** Result of get_subscription_attributes. */
export type GetSubscriptionAttributesResult = {
  attributes?: Record<string, unknown>;
};

/** Result of get_topic_attributes. */
export type GetTopicAttributesResult = {
  attributes?: Record<string, unknown>;
};

/** Result of list_endpoints_by_platform_application. */
export type ListEndpointsByPlatformApplicationResult = {
  endpoints?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_origination_numbers. */
export type ListOriginationNumbersResult = {
  nextToken?: string | undefined;
  phoneNumbers?: Record<string, unknown>[];
};

/** Result of list_phone_numbers_opted_out. */
export type ListPhoneNumbersOptedOutResult = {
  phoneNumbers?: string[];
  nextToken?: string | undefined;
};

/** Result of list_platform_applications. */
export type ListPlatformApplicationsResult = {
  platformApplications?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_sms_sandbox_phone_numbers. */
export type ListSmsSandboxPhoneNumbersResult = {
  phoneNumbers?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_subscriptions. */
export type ListSubscriptionsResult = {
  subscriptions?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_subscriptions_by_topic. */
export type ListSubscriptionsByTopicResult = {
  subscriptions?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_tags_for_resource. */
export type ListTagsForResourceResult = {
  tags?: Record<string, unknown>[];
};

/** Result of list_topics. */
export type ListTopicsResult = {
  topics?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of subscribe. */
export type SubscribeResult = {
  subscriptionArn?: string | undefined;
};


// ---------------------------------------------------------------------------
// Additional functions (auto-generated)
// ---------------------------------------------------------------------------

/** Add permission. */
export async function addPermission(topicArn: string, label: string, awsAccountId: string[], actionName: string[], regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement add_permission
    throw new Error("add_permission not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "add_permission failed");
  }
}

/** Check if phone number is opted out. */
export async function checkIfPhoneNumberIsOptedOut(phoneNumber: string, regionName?: string | undefined): Promise<CheckIfPhoneNumberIsOptedOutResult> {
  try {
    // TODO: implement check_if_phone_number_is_opted_out
    throw new Error("check_if_phone_number_is_opted_out not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "check_if_phone_number_is_opted_out failed");
  }
}

/** Confirm subscription. */
export async function confirmSubscription(topicArn: string, token: string): Promise<ConfirmSubscriptionResult> {
  try {
    // TODO: implement confirm_subscription
    throw new Error("confirm_subscription not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "confirm_subscription failed");
  }
}

/** Create platform application. */
export async function createPlatformApplication(name: string, platform: string, attributes: Record<string, unknown>, regionName?: string | undefined): Promise<CreatePlatformApplicationResult> {
  try {
    // TODO: implement create_platform_application
    throw new Error("create_platform_application not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_platform_application failed");
  }
}

/** Create platform endpoint. */
export async function createPlatformEndpoint(platformApplicationArn: string, token: string): Promise<CreatePlatformEndpointResult> {
  try {
    // TODO: implement create_platform_endpoint
    throw new Error("create_platform_endpoint not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_platform_endpoint failed");
  }
}

/** Create sms sandbox phone number. */
export async function createSmsSandboxPhoneNumber(phoneNumber: string): Promise<void> {
  try {
    // TODO: implement create_sms_sandbox_phone_number
    throw new Error("create_sms_sandbox_phone_number not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_sms_sandbox_phone_number failed");
  }
}

/** Create topic. */
export async function createTopic(name: string): Promise<CreateTopicResult> {
  try {
    // TODO: implement create_topic
    throw new Error("create_topic not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_topic failed");
  }
}

/** Delete endpoint. */
export async function deleteEndpoint(endpointArn: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_endpoint
    throw new Error("delete_endpoint not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_endpoint failed");
  }
}

/** Delete platform application. */
export async function deletePlatformApplication(platformApplicationArn: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_platform_application
    throw new Error("delete_platform_application not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_platform_application failed");
  }
}

/** Delete sms sandbox phone number. */
export async function deleteSmsSandboxPhoneNumber(phoneNumber: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_sms_sandbox_phone_number
    throw new Error("delete_sms_sandbox_phone_number not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_sms_sandbox_phone_number failed");
  }
}

/** Delete topic. */
export async function deleteTopic(topicArn: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_topic
    throw new Error("delete_topic not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_topic failed");
  }
}

/** Get data protection policy. */
export async function getDataProtectionPolicy(resourceArn: string, regionName?: string | undefined): Promise<GetDataProtectionPolicyResult> {
  try {
    // TODO: implement get_data_protection_policy
    throw new Error("get_data_protection_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_data_protection_policy failed");
  }
}

/** Get endpoint attributes. */
export async function getEndpointAttributes(endpointArn: string, regionName?: string | undefined): Promise<GetEndpointAttributesResult> {
  try {
    // TODO: implement get_endpoint_attributes
    throw new Error("get_endpoint_attributes not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_endpoint_attributes failed");
  }
}

/** Get platform application attributes. */
export async function getPlatformApplicationAttributes(platformApplicationArn: string, regionName?: string | undefined): Promise<GetPlatformApplicationAttributesResult> {
  try {
    // TODO: implement get_platform_application_attributes
    throw new Error("get_platform_application_attributes not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_platform_application_attributes failed");
  }
}

/** Get sms attributes. */
export async function getSmsAttributes(): Promise<GetSmsAttributesResult> {
  try {
    // TODO: implement get_sms_attributes
    throw new Error("get_sms_attributes not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_sms_attributes failed");
  }
}

/** Get sms sandbox account status. */
export async function getSmsSandboxAccountStatus(regionName?: string | undefined): Promise<GetSmsSandboxAccountStatusResult> {
  try {
    // TODO: implement get_sms_sandbox_account_status
    throw new Error("get_sms_sandbox_account_status not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_sms_sandbox_account_status failed");
  }
}

/** Get subscription attributes. */
export async function getSubscriptionAttributes(subscriptionArn: string, regionName?: string | undefined): Promise<GetSubscriptionAttributesResult> {
  try {
    // TODO: implement get_subscription_attributes
    throw new Error("get_subscription_attributes not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_subscription_attributes failed");
  }
}

/** Get topic attributes. */
export async function getTopicAttributes(topicArn: string, regionName?: string | undefined): Promise<GetTopicAttributesResult> {
  try {
    // TODO: implement get_topic_attributes
    throw new Error("get_topic_attributes not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_topic_attributes failed");
  }
}

/** List endpoints by platform application. */
export async function listEndpointsByPlatformApplication(platformApplicationArn: string): Promise<ListEndpointsByPlatformApplicationResult> {
  try {
    // TODO: implement list_endpoints_by_platform_application
    throw new Error("list_endpoints_by_platform_application not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_endpoints_by_platform_application failed");
  }
}

/** List origination numbers. */
export async function listOriginationNumbers(): Promise<ListOriginationNumbersResult> {
  try {
    // TODO: implement list_origination_numbers
    throw new Error("list_origination_numbers not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_origination_numbers failed");
  }
}

/** List phone numbers opted out. */
export async function listPhoneNumbersOptedOut(): Promise<ListPhoneNumbersOptedOutResult> {
  try {
    // TODO: implement list_phone_numbers_opted_out
    throw new Error("list_phone_numbers_opted_out not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_phone_numbers_opted_out failed");
  }
}

/** List platform applications. */
export async function listPlatformApplications(): Promise<ListPlatformApplicationsResult> {
  try {
    // TODO: implement list_platform_applications
    throw new Error("list_platform_applications not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_platform_applications failed");
  }
}

/** List sms sandbox phone numbers. */
export async function listSmsSandboxPhoneNumbers(): Promise<ListSmsSandboxPhoneNumbersResult> {
  try {
    // TODO: implement list_sms_sandbox_phone_numbers
    throw new Error("list_sms_sandbox_phone_numbers not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_sms_sandbox_phone_numbers failed");
  }
}

/** List subscriptions. */
export async function listSubscriptions(): Promise<ListSubscriptionsResult> {
  try {
    // TODO: implement list_subscriptions
    throw new Error("list_subscriptions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_subscriptions failed");
  }
}

/** List subscriptions by topic. */
export async function listSubscriptionsByTopic(topicArn: string): Promise<ListSubscriptionsByTopicResult> {
  try {
    // TODO: implement list_subscriptions_by_topic
    throw new Error("list_subscriptions_by_topic not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_subscriptions_by_topic failed");
  }
}

/** List tags for resource. */
export async function listTagsForResource(resourceArn: string, regionName?: string | undefined): Promise<ListTagsForResourceResult> {
  try {
    // TODO: implement list_tags_for_resource
    throw new Error("list_tags_for_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_tags_for_resource failed");
  }
}

/** List topics. */
export async function listTopics(): Promise<ListTopicsResult> {
  try {
    // TODO: implement list_topics
    throw new Error("list_topics not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_topics failed");
  }
}

/** Opt in phone number. */
export async function optInPhoneNumber(phoneNumber: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement opt_in_phone_number
    throw new Error("opt_in_phone_number not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "opt_in_phone_number failed");
  }
}

/** Put data protection policy. */
export async function putDataProtectionPolicy(resourceArn: string, dataProtectionPolicy: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement put_data_protection_policy
    throw new Error("put_data_protection_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_data_protection_policy failed");
  }
}

/** Remove permission. */
export async function removePermission(topicArn: string, label: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement remove_permission
    throw new Error("remove_permission not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "remove_permission failed");
  }
}

/** Set endpoint attributes. */
export async function setEndpointAttributes(endpointArn: string, attributes: Record<string, unknown>, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement set_endpoint_attributes
    throw new Error("set_endpoint_attributes not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "set_endpoint_attributes failed");
  }
}

/** Set platform application attributes. */
export async function setPlatformApplicationAttributes(platformApplicationArn: string, attributes: Record<string, unknown>, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement set_platform_application_attributes
    throw new Error("set_platform_application_attributes not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "set_platform_application_attributes failed");
  }
}

/** Set sms attributes. */
export async function setSmsAttributes(attributes: Record<string, unknown>, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement set_sms_attributes
    throw new Error("set_sms_attributes not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "set_sms_attributes failed");
  }
}

/** Set subscription attributes. */
export async function setSubscriptionAttributes(subscriptionArn: string, attributeName: string): Promise<void> {
  try {
    // TODO: implement set_subscription_attributes
    throw new Error("set_subscription_attributes not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "set_subscription_attributes failed");
  }
}

/** Set topic attributes. */
export async function setTopicAttributes(topicArn: string, attributeName: string): Promise<void> {
  try {
    // TODO: implement set_topic_attributes
    throw new Error("set_topic_attributes not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "set_topic_attributes failed");
  }
}

/** Subscribe. */
export async function subscribe(topicArn: string, protocol: string): Promise<SubscribeResult> {
  try {
    // TODO: implement subscribe
    throw new Error("subscribe not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "subscribe failed");
  }
}

/** Tag resource. */
export async function tagResource(resourceArn: string, tags: Record<string, unknown>[], regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement tag_resource
    throw new Error("tag_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "tag_resource failed");
  }
}

/** Unsubscribe. */
export async function unsubscribe(subscriptionArn: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement unsubscribe
    throw new Error("unsubscribe not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "unsubscribe failed");
  }
}

/** Untag resource. */
export async function untagResource(resourceArn: string, tagKeys: string[], regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement untag_resource
    throw new Error("untag_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "untag_resource failed");
  }
}

/** Verify sms sandbox phone number. */
export async function verifySmsSandboxPhoneNumber(phoneNumber: string, oneTimePassword: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement verify_sms_sandbox_phone_number
    throw new Error("verify_sms_sandbox_phone_number not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "verify_sms_sandbox_phone_number failed");
  }
}
