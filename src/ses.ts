/**
 * aws-util/ses — High-level Amazon SES email utilities.
 *
 * Provides typed helpers for sending simple, templated, raw, and bulk emails,
 * including MIME message construction for attachments, and email address
 * verification management.
 *
 * All functions obtain an SESClient via {@link getClient} and wrap errors
 * through {@link wrapAwsError}.
 *
 * @example
 * ```ts
 * import { sendEmail, sendWithAttachment } from "./ses.js";
 *
 * await sendEmail(
 *   "noreply@example.com",
 *   "user@example.com",
 *   "Welcome!",
 *   "<h1>Hello</h1>",
 *   "Hello",
 * );
 *
 * await sendWithAttachment(
 *   "noreply@example.com",
 *   "user@example.com",
 *   "Your report",
 *   "<p>Attached.</p>",
 *   [{ filename: "report.csv", content: Buffer.from("a,b\n1,2") }],
 * );
 * ```
 *
 * @module
 */

import { z } from "zod";
import { randomBytes } from "node:crypto";
import {
  SESClient,
  SendEmailCommand,
  SendTemplatedEmailCommand,
  SendRawEmailCommand,
  SendBulkTemplatedEmailCommand,
  VerifyEmailAddressCommand,
  ListVerifiedEmailAddressesCommand,
} from "@aws-sdk/client-ses";
import { getClient } from "./client.js";
import { wrapAwsError } from "./exceptions.js";

// ---------------------------------------------------------------------------
// Zod schemas & inferred types
// ---------------------------------------------------------------------------

/** Schema for the result of a send operation. */
export const SendEmailResultSchema = z.object({
  messageId: z.string(),
});

/** Result of any send operation. */
export type SendEmailResult = z.infer<typeof SendEmailResultSchema>;

/** Schema for an email address with optional display name. */
export const EmailAddressSchema = z.object({
  email: z.string(),
  name: z.string().optional(),
});

/** An email address with optional display name. */
export type EmailAddress = z.infer<typeof EmailAddressSchema>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Get a cached SESClient for the given region.
 */
function ses(region?: string): SESClient {
  return getClient(SESClient, region);
}

/**
 * Normalize a destination to an array of strings.
 */
function toAddressList(to: string | string[]): string[] {
  return Array.isArray(to) ? to : [to];
}

/**
 * Generate a MIME boundary string.
 */
function generateBoundary(): string {
  return `----=_Part_${randomBytes(16).toString("hex")}`;
}

/**
 * Build a complete MIME message with HTML body and attachments.
 */
function buildMimeMessage(
  source: string,
  to: string[],
  subject: string,
  bodyHtml: string,
  attachments: Array<{
    filename: string;
    content: Buffer;
    contentType?: string;
  }>,
): string {
  const boundary = generateBoundary();
  const lines: string[] = [];

  lines.push(`From: ${source}`);
  lines.push(`To: ${to.join(", ")}`);
  lines.push(`Subject: ${subject}`);
  lines.push("MIME-Version: 1.0");
  lines.push(`Content-Type: multipart/mixed; boundary="${boundary}"`);
  lines.push("");

  // HTML body part
  lines.push(`--${boundary}`);
  lines.push("Content-Type: text/html; charset=UTF-8");
  lines.push("Content-Transfer-Encoding: 7bit");
  lines.push("");
  lines.push(bodyHtml);
  lines.push("");

  // Attachment parts
  for (const attachment of attachments) {
    const mimeType = attachment.contentType ?? "application/octet-stream";
    const base64Data = attachment.content.toString("base64");

    lines.push(`--${boundary}`);
    lines.push(`Content-Type: ${mimeType}; name="${attachment.filename}"`);
    lines.push("Content-Transfer-Encoding: base64");
    lines.push(
      `Content-Disposition: attachment; filename="${attachment.filename}"`,
    );
    lines.push("");
    // Split base64 into 76-char lines per RFC 2045
    for (let i = 0; i < base64Data.length; i += 76) {
      lines.push(base64Data.slice(i, i + 76));
    }
    lines.push("");
  }

  lines.push(`--${boundary}--`);
  return lines.join("\r\n");
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Send a simple email via SES.
 *
 * @param source - The sender email address.
 * @param to - Recipient email address(es).
 * @param subject - Email subject line.
 * @param bodyHtml - Optional HTML body.
 * @param bodyText - Optional plain-text body.
 * @param cc - Optional CC recipient(s).
 * @param bcc - Optional BCC recipient(s).
 * @param replyTo - Optional Reply-To address(es).
 * @param region - AWS region override.
 * @returns The SES message ID.
 */
export async function sendEmail(
  source: string,
  to: string | string[],
  subject: string,
  bodyHtml?: string,
  bodyText?: string,
  cc?: string | string[],
  bcc?: string | string[],
  replyTo?: string | string[],
  region?: string,
): Promise<SendEmailResult> {
  try {
    const body: Record<string, { Data: string }> = {};
    if (bodyHtml) {
      body["Html"] = { Data: bodyHtml };
    }
    if (bodyText) {
      body["Text"] = { Data: bodyText };
    }

    const res = await ses(region).send(
      new SendEmailCommand({
        Source: source,
        Destination: {
          ToAddresses: toAddressList(to),
          CcAddresses: cc ? toAddressList(cc) : undefined,
          BccAddresses: bcc ? toAddressList(bcc) : undefined,
        },
        Message: {
          Subject: { Data: subject },
          Body: body,
        },
        ReplyToAddresses: replyTo ? toAddressList(replyTo) : undefined,
      }),
    );
    return SendEmailResultSchema.parse({
      messageId: res.MessageId,
    });
  } catch (err: unknown) {
    throw wrapAwsError(err, "sendEmail");
  }
}

/**
 * Send a templated email via SES.
 *
 * @param source - The sender email address.
 * @param to - Recipient email address(es).
 * @param templateName - The name of the SES email template.
 * @param templateData - Template variable replacements.
 * @param region - AWS region override.
 * @returns The SES message ID.
 */
export async function sendTemplatedEmail(
  source: string,
  to: string | string[],
  templateName: string,
  templateData: Record<string, string>,
  region?: string,
): Promise<SendEmailResult> {
  try {
    const res = await ses(region).send(
      new SendTemplatedEmailCommand({
        Source: source,
        Destination: {
          ToAddresses: toAddressList(to),
        },
        Template: templateName,
        TemplateData: JSON.stringify(templateData),
      }),
    );
    return SendEmailResultSchema.parse({
      messageId: res.MessageId,
    });
  } catch (err: unknown) {
    throw wrapAwsError(err, `sendTemplatedEmail(${templateName})`);
  }
}

/**
 * Send a raw email message via SES.
 *
 * Use this when you need full control over MIME headers, multipart
 * structure, or inline attachments.
 *
 * @param source - The sender email address.
 * @param destinations - All recipient email addresses (To, CC, BCC).
 * @param rawMessage - The raw MIME message as a string or Uint8Array.
 * @param region - AWS region override.
 * @returns The SES message ID.
 */
export async function sendRawEmail(
  source: string,
  destinations: string[],
  rawMessage: string | Uint8Array,
  region?: string,
): Promise<SendEmailResult> {
  try {
    const data =
      rawMessage instanceof Uint8Array
        ? rawMessage
        : new TextEncoder().encode(rawMessage);

    const res = await ses(region).send(
      new SendRawEmailCommand({
        Source: source,
        Destinations: destinations,
        RawMessage: { Data: data },
      }),
    );
    return SendEmailResultSchema.parse({
      messageId: res.MessageId,
    });
  } catch (err: unknown) {
    throw wrapAwsError(err, "sendRawEmail");
  }
}

/**
 * Send an email with file attachments via SES.
 *
 * Constructs a multipart/mixed MIME message containing an HTML body and
 * one or more base64-encoded attachments, then sends it via
 * {@link sendRawEmail}.
 *
 * @param source - The sender email address.
 * @param to - Recipient email address(es).
 * @param subject - Email subject line.
 * @param bodyHtml - HTML body content.
 * @param attachments - Array of attachment descriptors.
 * @param region - AWS region override.
 * @returns The SES message ID.
 */
export async function sendWithAttachment(
  source: string,
  to: string | string[],
  subject: string,
  bodyHtml: string,
  attachments: Array<{
    filename: string;
    content: Buffer;
    contentType?: string;
  }>,
  region?: string,
): Promise<SendEmailResult> {
  const toList = toAddressList(to);
  const rawMessage = buildMimeMessage(
    source,
    toList,
    subject,
    bodyHtml,
    attachments,
  );

  return sendRawEmail(source, toList, rawMessage, region);
}

/**
 * Send bulk templated emails via SES.
 *
 * Uses SendBulkTemplatedEmailCommand to efficiently send personalized emails
 * to many recipients using a single template.
 *
 * @param source - The sender email address.
 * @param destinations - Array of recipients with their template data.
 * @param templateName - The name of the SES email template.
 * @param defaultTemplateData - Default template variables applied when a
 *   destination does not provide a value.
 * @param region - AWS region override.
 * @returns An array of results, one per destination, each with messageId, status, and optional error.
 */
export async function sendBulk(
  source: string,
  destinations: Array<{ to: string | string[]; templateData: Record<string, string> }>,
  templateName: string,
  defaultTemplateData?: Record<string, string>,
  region?: string,
): Promise<Array<{ messageId?: string; status: string; error?: string }>> {
  try {
    const res = await ses(region).send(
      new SendBulkTemplatedEmailCommand({
        Source: source,
        Template: templateName,
        DefaultTemplateData: defaultTemplateData
          ? JSON.stringify(defaultTemplateData)
          : JSON.stringify({}),
        Destinations: destinations.map((d) => ({
          Destination: {
            ToAddresses: toAddressList(d.to),
          },
          ReplacementTemplateData: JSON.stringify(d.templateData),
        })),
      }),
    );

    return (res.Status ?? []).map((s) => ({
      messageId: s.MessageId,
      status: s.Status ?? "Unknown",
      error: s.Error,
    }));
  } catch (err: unknown) {
    throw wrapAwsError(err, `sendBulk(${templateName})`);
  }
}

/**
 * Send a verification email to an address.
 *
 * The recipient must click the link in the verification email before the
 * address can be used as a sender.
 *
 * @param email - The email address to verify.
 * @param region - AWS region override.
 */
export async function verifyEmailAddress(
  email: string,
  region?: string,
): Promise<void> {
  try {
    await ses(region).send(
      new VerifyEmailAddressCommand({ EmailAddress: email }),
    );
  } catch (err: unknown) {
    throw wrapAwsError(err, `verifyEmailAddress(${email})`);
  }
}

/**
 * List all verified email addresses for the SES account.
 *
 * @param region - AWS region override.
 * @returns An array of verified email address strings.
 */
export async function listVerifiedEmailAddresses(
  region?: string,
): Promise<string[]> {
  try {
    const res = await ses(region).send(
      new ListVerifiedEmailAddressesCommand({}),
    );
    return res.VerifiedEmailAddresses ?? [];
  } catch (err: unknown) {
    throw wrapAwsError(err, "listVerifiedEmailAddresses");
  }
}

// ---------------------------------------------------------------------------
// Additional types (auto-generated)
// ---------------------------------------------------------------------------

/** Result of describe_active_receipt_rule_set. */
export type DescribeActiveReceiptRuleSetResult = {
  metadata?: Record<string, unknown>;
  rules?: Record<string, unknown>[];
};

/** Result of describe_configuration_set. */
export type DescribeConfigurationSetResult = {
  configurationSet?: Record<string, unknown>;
  eventDestinations?: Record<string, unknown>[];
  trackingOptions?: Record<string, unknown>;
  deliveryOptions?: Record<string, unknown>;
  reputationOptions?: Record<string, unknown>;
};

/** Result of describe_receipt_rule. */
export type DescribeReceiptRuleResult = {
  rule?: Record<string, unknown>;
};

/** Result of describe_receipt_rule_set. */
export type DescribeReceiptRuleSetResult = {
  metadata?: Record<string, unknown>;
  rules?: Record<string, unknown>[];
};

/** Result of get_account_sending_enabled. */
export type GetAccountSendingEnabledResult = {
  enabled?: boolean | undefined;
};

/** Result of get_custom_verification_email_template. */
export type GetCustomVerificationEmailTemplateResult = {
  templateName?: string | undefined;
  fromEmailAddress?: string | undefined;
  templateSubject?: string | undefined;
  templateContent?: string | undefined;
  successRedirectionUrl?: string | undefined;
  failureRedirectionUrl?: string | undefined;
};

/** Result of get_identity_dkim_attributes. */
export type GetIdentityDkimAttributesResult = {
  dkimAttributes?: Record<string, unknown>;
};

/** Result of get_identity_mail_from_domain_attributes. */
export type GetIdentityMailFromDomainAttributesResult = {
  mailFromDomainAttributes?: Record<string, unknown>;
};

/** Result of get_identity_notification_attributes. */
export type GetIdentityNotificationAttributesResult = {
  notificationAttributes?: Record<string, unknown>;
};

/** Result of get_identity_policies. */
export type GetIdentityPoliciesResult = {
  policies?: Record<string, unknown>;
};

/** Result of get_identity_verification_attributes. */
export type GetIdentityVerificationAttributesResult = {
  verificationAttributes?: Record<string, unknown>;
};

/** Result of get_send_quota. */
export type GetSendQuotaResult = {
  max24HourSend?: number | undefined;
  maxSendRate?: number | undefined;
  sentLast24Hours?: number | undefined;
};

/** Result of get_send_statistics. */
export type GetSendStatisticsResult = {
  sendDataPoints?: Record<string, unknown>[];
};

/** Result of get_template. */
export type GetTemplateResult = {
  template?: Record<string, unknown>;
};

/** Result of list_configuration_sets. */
export type ListConfigurationSetsResult = {
  configurationSets?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_custom_verification_email_templates. */
export type ListCustomVerificationEmailTemplatesResult = {
  customVerificationEmailTemplates?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_identities. */
export type ListIdentitiesResult = {
  identities?: string[];
  nextToken?: string | undefined;
};

/** Result of list_identity_policies. */
export type ListIdentityPoliciesResult = {
  policyNames?: string[];
};

/** Result of list_receipt_filters. */
export type ListReceiptFiltersResult = {
  filters?: Record<string, unknown>[];
};

/** Result of list_receipt_rule_sets. */
export type ListReceiptRuleSetsResult = {
  ruleSets?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_templates. */
export type ListTemplatesResult = {
  templatesMetadata?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of run_render_template. */
export type RunRenderTemplateResult = {
  renderedTemplate?: string | undefined;
};

/** Result of send_bounce. */
export type SendBounceResult = {
  messageId?: string | undefined;
};

/** Result of send_bulk_templated_email. */
export type SendBulkTemplatedEmailResult = {
  status?: Record<string, unknown>[];
};

/** Result of send_custom_verification_email. */
export type SendCustomVerificationEmailResult = {
  messageId?: string | undefined;
};

/** Result of verify_domain_dkim. */
export type VerifyDomainDkimResult = {
  dkimTokens?: string[];
};

/** Result of verify_domain_identity. */
export type VerifyDomainIdentityResult = {
  verificationToken?: string | undefined;
};


// ---------------------------------------------------------------------------
// Additional functions (auto-generated)
// ---------------------------------------------------------------------------

/** Clone receipt rule set. */
export async function cloneReceiptRuleSet(ruleSetName: string, originalRuleSetName: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement clone_receipt_rule_set
    throw new Error("clone_receipt_rule_set not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "clone_receipt_rule_set failed");
  }
}

/** Create configuration set. */
export async function createConfigurationSet(configurationSet: Record<string, unknown>, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement create_configuration_set
    throw new Error("create_configuration_set not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_configuration_set failed");
  }
}

/** Create configuration set event destination. */
export async function createConfigurationSetEventDestination(configurationSetName: string, eventDestination: Record<string, unknown>, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement create_configuration_set_event_destination
    throw new Error("create_configuration_set_event_destination not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_configuration_set_event_destination failed");
  }
}

/** Create configuration set tracking options. */
export async function createConfigurationSetTrackingOptions(configurationSetName: string, trackingOptions: Record<string, unknown>, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement create_configuration_set_tracking_options
    throw new Error("create_configuration_set_tracking_options not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_configuration_set_tracking_options failed");
  }
}

/** Create custom verification email template. */
export async function createCustomVerificationEmailTemplate(templateName: string, fromEmailAddress: string, templateSubject: string, templateContent: string, successRedirectionUrl: string, failureRedirectionUrl: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement create_custom_verification_email_template
    throw new Error("create_custom_verification_email_template not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_custom_verification_email_template failed");
  }
}

/** Create receipt filter. */
export async function createReceiptFilter(filter: Record<string, unknown>, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement create_receipt_filter
    throw new Error("create_receipt_filter not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_receipt_filter failed");
  }
}

/** Create receipt rule. */
export async function createReceiptRule(ruleSetName: string, rule: Record<string, unknown>): Promise<void> {
  try {
    // TODO: implement create_receipt_rule
    throw new Error("create_receipt_rule not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_receipt_rule failed");
  }
}

/** Create receipt rule set. */
export async function createReceiptRuleSet(ruleSetName: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement create_receipt_rule_set
    throw new Error("create_receipt_rule_set not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_receipt_rule_set failed");
  }
}

/** Create template. */
export async function createTemplate(template: Record<string, unknown>, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement create_template
    throw new Error("create_template not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_template failed");
  }
}

/** Delete configuration set. */
export async function deleteConfigurationSet(configurationSetName: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_configuration_set
    throw new Error("delete_configuration_set not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_configuration_set failed");
  }
}

/** Delete configuration set event destination. */
export async function deleteConfigurationSetEventDestination(configurationSetName: string, eventDestinationName: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_configuration_set_event_destination
    throw new Error("delete_configuration_set_event_destination not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_configuration_set_event_destination failed");
  }
}

/** Delete configuration set tracking options. */
export async function deleteConfigurationSetTrackingOptions(configurationSetName: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_configuration_set_tracking_options
    throw new Error("delete_configuration_set_tracking_options not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_configuration_set_tracking_options failed");
  }
}

/** Delete custom verification email template. */
export async function deleteCustomVerificationEmailTemplate(templateName: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_custom_verification_email_template
    throw new Error("delete_custom_verification_email_template not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_custom_verification_email_template failed");
  }
}

/** Delete identity. */
export async function deleteIdentity(identity: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_identity
    throw new Error("delete_identity not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_identity failed");
  }
}

/** Delete identity policy. */
export async function deleteIdentityPolicy(identity: string, policyName: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_identity_policy
    throw new Error("delete_identity_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_identity_policy failed");
  }
}

/** Delete receipt filter. */
export async function deleteReceiptFilter(filterName: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_receipt_filter
    throw new Error("delete_receipt_filter not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_receipt_filter failed");
  }
}

/** Delete receipt rule. */
export async function deleteReceiptRule(ruleSetName: string, ruleName: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_receipt_rule
    throw new Error("delete_receipt_rule not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_receipt_rule failed");
  }
}

/** Delete receipt rule set. */
export async function deleteReceiptRuleSet(ruleSetName: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_receipt_rule_set
    throw new Error("delete_receipt_rule_set not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_receipt_rule_set failed");
  }
}

/** Delete template. */
export async function deleteTemplate(templateName: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_template
    throw new Error("delete_template not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_template failed");
  }
}

/** Delete verified email address. */
export async function deleteVerifiedEmailAddress(emailAddress: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_verified_email_address
    throw new Error("delete_verified_email_address not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_verified_email_address failed");
  }
}

/** Describe active receipt rule set. */
export async function describeActiveReceiptRuleSet(regionName?: string | undefined): Promise<DescribeActiveReceiptRuleSetResult> {
  try {
    // TODO: implement describe_active_receipt_rule_set
    throw new Error("describe_active_receipt_rule_set not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_active_receipt_rule_set failed");
  }
}

/** Describe configuration set. */
export async function describeConfigurationSet(configurationSetName: string): Promise<DescribeConfigurationSetResult> {
  try {
    // TODO: implement describe_configuration_set
    throw new Error("describe_configuration_set not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_configuration_set failed");
  }
}

/** Describe receipt rule. */
export async function describeReceiptRule(ruleSetName: string, ruleName: string, regionName?: string | undefined): Promise<DescribeReceiptRuleResult> {
  try {
    // TODO: implement describe_receipt_rule
    throw new Error("describe_receipt_rule not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_receipt_rule failed");
  }
}

/** Describe receipt rule set. */
export async function describeReceiptRuleSet(ruleSetName: string, regionName?: string | undefined): Promise<DescribeReceiptRuleSetResult> {
  try {
    // TODO: implement describe_receipt_rule_set
    throw new Error("describe_receipt_rule_set not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_receipt_rule_set failed");
  }
}

/** Get account sending enabled. */
export async function getAccountSendingEnabled(regionName?: string | undefined): Promise<GetAccountSendingEnabledResult> {
  try {
    // TODO: implement get_account_sending_enabled
    throw new Error("get_account_sending_enabled not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_account_sending_enabled failed");
  }
}

/** Get custom verification email template. */
export async function getCustomVerificationEmailTemplate(templateName: string, regionName?: string | undefined): Promise<GetCustomVerificationEmailTemplateResult> {
  try {
    // TODO: implement get_custom_verification_email_template
    throw new Error("get_custom_verification_email_template not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_custom_verification_email_template failed");
  }
}

/** Get identity dkim attributes. */
export async function getIdentityDkimAttributes(identities: string[], regionName?: string | undefined): Promise<GetIdentityDkimAttributesResult> {
  try {
    // TODO: implement get_identity_dkim_attributes
    throw new Error("get_identity_dkim_attributes not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_identity_dkim_attributes failed");
  }
}

/** Get identity mail from domain attributes. */
export async function getIdentityMailFromDomainAttributes(identities: string[], regionName?: string | undefined): Promise<GetIdentityMailFromDomainAttributesResult> {
  try {
    // TODO: implement get_identity_mail_from_domain_attributes
    throw new Error("get_identity_mail_from_domain_attributes not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_identity_mail_from_domain_attributes failed");
  }
}

/** Get identity notification attributes. */
export async function getIdentityNotificationAttributes(identities: string[], regionName?: string | undefined): Promise<GetIdentityNotificationAttributesResult> {
  try {
    // TODO: implement get_identity_notification_attributes
    throw new Error("get_identity_notification_attributes not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_identity_notification_attributes failed");
  }
}

/** Get identity policies. */
export async function getIdentityPolicies(identity: string, policyNames: string[], regionName?: string | undefined): Promise<GetIdentityPoliciesResult> {
  try {
    // TODO: implement get_identity_policies
    throw new Error("get_identity_policies not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_identity_policies failed");
  }
}

/** Get identity verification attributes. */
export async function getIdentityVerificationAttributes(identities: string[], regionName?: string | undefined): Promise<GetIdentityVerificationAttributesResult> {
  try {
    // TODO: implement get_identity_verification_attributes
    throw new Error("get_identity_verification_attributes not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_identity_verification_attributes failed");
  }
}

/** Get send quota. */
export async function getSendQuota(regionName?: string | undefined): Promise<GetSendQuotaResult> {
  try {
    // TODO: implement get_send_quota
    throw new Error("get_send_quota not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_send_quota failed");
  }
}

/** Get send statistics. */
export async function getSendStatistics(regionName?: string | undefined): Promise<GetSendStatisticsResult> {
  try {
    // TODO: implement get_send_statistics
    throw new Error("get_send_statistics not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_send_statistics failed");
  }
}

/** Get template. */
export async function getTemplate(templateName: string, regionName?: string | undefined): Promise<GetTemplateResult> {
  try {
    // TODO: implement get_template
    throw new Error("get_template not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_template failed");
  }
}

/** List configuration sets. */
export async function listConfigurationSets(): Promise<ListConfigurationSetsResult> {
  try {
    // TODO: implement list_configuration_sets
    throw new Error("list_configuration_sets not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_configuration_sets failed");
  }
}

/** List custom verification email templates. */
export async function listCustomVerificationEmailTemplates(): Promise<ListCustomVerificationEmailTemplatesResult> {
  try {
    // TODO: implement list_custom_verification_email_templates
    throw new Error("list_custom_verification_email_templates not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_custom_verification_email_templates failed");
  }
}

/** List identities. */
export async function listIdentities(): Promise<ListIdentitiesResult> {
  try {
    // TODO: implement list_identities
    throw new Error("list_identities not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_identities failed");
  }
}

/** List identity policies. */
export async function listIdentityPolicies(identity: string, regionName?: string | undefined): Promise<ListIdentityPoliciesResult> {
  try {
    // TODO: implement list_identity_policies
    throw new Error("list_identity_policies not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_identity_policies failed");
  }
}

/** List receipt filters. */
export async function listReceiptFilters(regionName?: string | undefined): Promise<ListReceiptFiltersResult> {
  try {
    // TODO: implement list_receipt_filters
    throw new Error("list_receipt_filters not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_receipt_filters failed");
  }
}

/** List receipt rule sets. */
export async function listReceiptRuleSets(): Promise<ListReceiptRuleSetsResult> {
  try {
    // TODO: implement list_receipt_rule_sets
    throw new Error("list_receipt_rule_sets not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_receipt_rule_sets failed");
  }
}

/** List templates. */
export async function listTemplates(): Promise<ListTemplatesResult> {
  try {
    // TODO: implement list_templates
    throw new Error("list_templates not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_templates failed");
  }
}

/** Put configuration set delivery options. */
export async function putConfigurationSetDeliveryOptions(configurationSetName: string): Promise<void> {
  try {
    // TODO: implement put_configuration_set_delivery_options
    throw new Error("put_configuration_set_delivery_options not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_configuration_set_delivery_options failed");
  }
}

/** Put identity policy. */
export async function putIdentityPolicy(identity: string, policyName: string, policy: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement put_identity_policy
    throw new Error("put_identity_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_identity_policy failed");
  }
}

/** Reorder receipt rule set. */
export async function reorderReceiptRuleSet(ruleSetName: string, ruleNames: string[], regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement reorder_receipt_rule_set
    throw new Error("reorder_receipt_rule_set not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "reorder_receipt_rule_set failed");
  }
}

/** Run render template. */
export async function runRenderTemplate(templateName: string, templateData: string, regionName?: string | undefined): Promise<RunRenderTemplateResult> {
  try {
    // TODO: implement run_render_template
    throw new Error("run_render_template not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "run_render_template failed");
  }
}

/** Send bounce. */
export async function sendBounce(originalMessageId: string, bounceSender: string, bouncedRecipientInfoList: Record<string, unknown>[]): Promise<SendBounceResult> {
  try {
    // TODO: implement send_bounce
    throw new Error("send_bounce not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "send_bounce failed");
  }
}

/** Send bulk templated email. */
export async function sendBulkTemplatedEmail(source: string, template: string, defaultTemplateData: string, destinations: Record<string, unknown>[]): Promise<SendBulkTemplatedEmailResult> {
  try {
    // TODO: implement send_bulk_templated_email
    throw new Error("send_bulk_templated_email not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "send_bulk_templated_email failed");
  }
}

/** Send custom verification email. */
export async function sendCustomVerificationEmail(emailAddress: string, templateName: string): Promise<SendCustomVerificationEmailResult> {
  try {
    // TODO: implement send_custom_verification_email
    throw new Error("send_custom_verification_email not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "send_custom_verification_email failed");
  }
}

/** Set active receipt rule set. */
export async function setActiveReceiptRuleSet(): Promise<void> {
  try {
    // TODO: implement set_active_receipt_rule_set
    throw new Error("set_active_receipt_rule_set not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "set_active_receipt_rule_set failed");
  }
}

/** Set identity dkim enabled. */
export async function setIdentityDkimEnabled(identity: string, dkimEnabled: boolean, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement set_identity_dkim_enabled
    throw new Error("set_identity_dkim_enabled not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "set_identity_dkim_enabled failed");
  }
}

/** Set identity feedback forwarding enabled. */
export async function setIdentityFeedbackForwardingEnabled(identity: string, forwardingEnabled: boolean, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement set_identity_feedback_forwarding_enabled
    throw new Error("set_identity_feedback_forwarding_enabled not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "set_identity_feedback_forwarding_enabled failed");
  }
}

/** Set identity headers in notifications enabled. */
export async function setIdentityHeadersInNotificationsEnabled(identity: string, notificationType: string, enabled: boolean, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement set_identity_headers_in_notifications_enabled
    throw new Error("set_identity_headers_in_notifications_enabled not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "set_identity_headers_in_notifications_enabled failed");
  }
}

/** Set identity mail from domain. */
export async function setIdentityMailFromDomain(identity: string): Promise<void> {
  try {
    // TODO: implement set_identity_mail_from_domain
    throw new Error("set_identity_mail_from_domain not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "set_identity_mail_from_domain failed");
  }
}

/** Set identity notification topic. */
export async function setIdentityNotificationTopic(identity: string, notificationType: string): Promise<void> {
  try {
    // TODO: implement set_identity_notification_topic
    throw new Error("set_identity_notification_topic not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "set_identity_notification_topic failed");
  }
}

/** Set receipt rule position. */
export async function setReceiptRulePosition(ruleSetName: string, ruleName: string): Promise<void> {
  try {
    // TODO: implement set_receipt_rule_position
    throw new Error("set_receipt_rule_position not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "set_receipt_rule_position failed");
  }
}

/** Update account sending enabled. */
export async function updateAccountSendingEnabled(): Promise<void> {
  try {
    // TODO: implement update_account_sending_enabled
    throw new Error("update_account_sending_enabled not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_account_sending_enabled failed");
  }
}

/** Update configuration set event destination. */
export async function updateConfigurationSetEventDestination(configurationSetName: string, eventDestination: Record<string, unknown>, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement update_configuration_set_event_destination
    throw new Error("update_configuration_set_event_destination not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_configuration_set_event_destination failed");
  }
}

/** Update configuration set reputation metrics enabled. */
export async function updateConfigurationSetReputationMetricsEnabled(configurationSetName: string, enabled: boolean, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement update_configuration_set_reputation_metrics_enabled
    throw new Error("update_configuration_set_reputation_metrics_enabled not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_configuration_set_reputation_metrics_enabled failed");
  }
}

/** Update configuration set sending enabled. */
export async function updateConfigurationSetSendingEnabled(configurationSetName: string, enabled: boolean, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement update_configuration_set_sending_enabled
    throw new Error("update_configuration_set_sending_enabled not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_configuration_set_sending_enabled failed");
  }
}

/** Update configuration set tracking options. */
export async function updateConfigurationSetTrackingOptions(configurationSetName: string, trackingOptions: Record<string, unknown>, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement update_configuration_set_tracking_options
    throw new Error("update_configuration_set_tracking_options not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_configuration_set_tracking_options failed");
  }
}

/** Update custom verification email template. */
export async function updateCustomVerificationEmailTemplate(templateName: string): Promise<void> {
  try {
    // TODO: implement update_custom_verification_email_template
    throw new Error("update_custom_verification_email_template not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_custom_verification_email_template failed");
  }
}

/** Update receipt rule. */
export async function updateReceiptRule(ruleSetName: string, rule: Record<string, unknown>, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement update_receipt_rule
    throw new Error("update_receipt_rule not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_receipt_rule failed");
  }
}

/** Update template. */
export async function updateTemplate(template: Record<string, unknown>, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement update_template
    throw new Error("update_template not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_template failed");
  }
}

/** Verify domain dkim. */
export async function verifyDomainDkim(domain: string, regionName?: string | undefined): Promise<VerifyDomainDkimResult> {
  try {
    // TODO: implement verify_domain_dkim
    throw new Error("verify_domain_dkim not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "verify_domain_dkim failed");
  }
}

/** Verify domain identity. */
export async function verifyDomainIdentity(domain: string, regionName?: string | undefined): Promise<VerifyDomainIdentityResult> {
  try {
    // TODO: implement verify_domain_identity
    throw new Error("verify_domain_identity not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "verify_domain_identity failed");
  }
}

/** Verify email identity. */
export async function verifyEmailIdentity(emailAddress: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement verify_email_identity
    throw new Error("verify_email_identity not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "verify_email_identity failed");
  }
}
