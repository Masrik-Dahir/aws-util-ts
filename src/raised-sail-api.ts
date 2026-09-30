/**
 * aws-util/raised-sail-api — Helpers for Raised Sail authenticated downloads.
 *
 * The Python API owns authentication and download signing at runtime. This
 * module provides the TypeScript side of that contract so apps can build the
 * same provider links and protected S3 download requests before the package is
 * promoted.
 *
 * @module
 */

import { z } from "zod";
import { presignedUrl, type PresignedUrl } from "./s3.js";

export const RaisedSailAuthProviderSchema = z.enum([
  "google",
  "apple",
  "facebook",
  "microsoft",
  "github",
  "linkedin",
]);

export type RaisedSailAuthProvider = z.infer<typeof RaisedSailAuthProviderSchema>;

export const raisedSailAuthProviders = RaisedSailAuthProviderSchema.options;

export const RaisedSailCaptchaProviderSchema = z.enum(["none", "turnstile", "hcaptcha"]);

export type RaisedSailCaptchaProvider = z.infer<typeof RaisedSailCaptchaProviderSchema>;

export const RaisedSailCaptchaConfigSchema = z.object({
  provider: RaisedSailCaptchaProviderSchema,
  enabled: z.boolean().optional(),
  siteKey: z.string().optional(),
  action: z.string().optional(),
  requiredFor: z.array(z.string()).optional(),
});

export type RaisedSailCaptchaConfig = z.infer<typeof RaisedSailCaptchaConfigSchema>;

export const RaisedSailProviderConfigSchema = z.object({
  id: RaisedSailAuthProviderSchema,
  configured: z.boolean(),
  startUrl: z.string(),
  clientId: z.string().optional().nullable(),
  scope: z.string().optional().nullable(),
});

export type RaisedSailProviderConfig = z.infer<typeof RaisedSailProviderConfigSchema>;

export const RaisedSailAuthConfigSchema = z.object({
  service: z.string(),
  providers: z.array(RaisedSailProviderConfigSchema),
  localAuth: z.boolean(),
  signupRequiresInvite: z.boolean().optional(),
  signupRequiresApproval: z.boolean().optional(),
  emailVerification: z.boolean().optional(),
  captcha: RaisedSailCaptchaConfigSchema.optional(),
});

export type RaisedSailAuthConfig = z.infer<typeof RaisedSailAuthConfigSchema>;

export const RaisedSailUserSchema = z.object({
  userId: z.string(),
  email: z.string().optional().nullable(),
  emailVerified: z.boolean().optional().nullable(),
  name: z.string().optional().nullable(),
  picture: z.string().optional().nullable(),
  providers: z.array(z.string()).optional(),
});

export type RaisedSailUser = z.infer<typeof RaisedSailUserSchema>;

export const RaisedSailProfileSchema = z.object({
  userId: z.string(),
  email: z.string().email().optional().nullable(),
  emailVerified: z.boolean().optional().nullable(),
  name: z.string(),
  bio: z.string(),
  pictureKey: z.string().optional().nullable(),
  pictureUrl: z.string().url().optional().nullable(),
  providers: z.array(RaisedSailAuthProviderSchema).optional(),
  createdAt: z.string().optional().nullable(),
  updatedAt: z.string().optional().nullable(),
});

export type RaisedSailProfile = z.infer<typeof RaisedSailProfileSchema>;

export const RaisedSailAuthSessionSchema = z.object({
  accessToken: z.string(),
  idToken: z.string().optional().nullable(),
  refreshToken: z.string(),
  expiresIn: z.number(),
  tokenType: z.string().default("Bearer"),
  user: RaisedSailUserSchema,
});

export type RaisedSailAuthSession = z.infer<typeof RaisedSailAuthSessionSchema>;

export const RaisedSailSignupResponseSchema = z.object({
  status: z.literal("verification_required"),
  email: z.string().email(),
  delivery: z.object({
    AttributeName: z.string().optional(),
    DeliveryMedium: z.string().optional(),
    Destination: z.string().optional(),
  }).optional(),
});

export type RaisedSailSignupResponse = z.infer<typeof RaisedSailSignupResponseSchema>;

export const RaisedSailCaptchaSubmissionSchema = z.object({
  provider: z.enum(["turnstile", "hcaptcha"]),
  token: z.string().min(1),
});

export type RaisedSailCaptchaSubmission = z.infer<typeof RaisedSailCaptchaSubmissionSchema>;

export const RaisedSailSignupRequestSchema = z.object({
  name: z.string().optional(),
  email: z.string().email(),
  password: z.string().min(8),
  captchaProvider: z.enum(["turnstile", "hcaptcha"]).optional(),
  captchaToken: z.string().optional(),
});

export type RaisedSailSignupRequest = z.infer<typeof RaisedSailSignupRequestSchema>;

export const RaisedSailProfileUpdateRequestSchema = z.object({
  name: z.string().max(80),
  bio: z.string().max(700),
});

export type RaisedSailProfileUpdateRequest = z.infer<typeof RaisedSailProfileUpdateRequestSchema>;

export const RaisedSailAvatarUploadRequestSchema = z.object({
  imageData: z.string().min(1),
  contentType: z.enum(["image/jpeg", "image/png", "image/webp"]),
});

export type RaisedSailAvatarUploadRequest = z.infer<typeof RaisedSailAvatarUploadRequestSchema>;

export const RaisedSailPasswordChangeRequestSchema = z.object({
  accessToken: z.string().min(1),
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export type RaisedSailPasswordChangeRequest = z.infer<typeof RaisedSailPasswordChangeRequestSchema>;

export const RaisedSailEmailChangeStartRequestSchema = z.object({
  accessToken: z.string().min(1),
  newEmail: z.string().email(),
});

export type RaisedSailEmailChangeStartRequest = z.infer<typeof RaisedSailEmailChangeStartRequestSchema>;

export const RaisedSailEmailChangeConfirmRequestSchema = z.object({
  accessToken: z.string().min(1),
  code: z.string().min(1),
});

export type RaisedSailEmailChangeConfirmRequest = z.infer<typeof RaisedSailEmailChangeConfirmRequestSchema>;

export const RaisedSailProviderStateSchema = z.object({
  id: RaisedSailAuthProviderSchema,
  configured: z.boolean(),
  linked: z.boolean(),
});

export type RaisedSailProviderState = z.infer<typeof RaisedSailProviderStateSchema>;

export const RaisedSailProviderListResponseSchema = z.object({
  providers: z.array(RaisedSailProviderStateSchema),
});

export type RaisedSailProviderListResponse = z.infer<typeof RaisedSailProviderListResponseSchema>;

export const RaisedSailProviderLinkStartRequestSchema = z.object({
  redirectUri: z.string().url(),
});

export type RaisedSailProviderLinkStartRequest = z.infer<typeof RaisedSailProviderLinkStartRequestSchema>;

export const RaisedSailProviderLinkStartResponseSchema = z.object({
  authorizeUrl: z.string().url(),
});

export type RaisedSailProviderLinkStartResponse = z.infer<typeof RaisedSailProviderLinkStartResponseSchema>;

export const RaisedSailActivityEventSchema = z.object({
  type: z.string().min(1),
  at: z.string().optional(),
  data: z.record(z.string(), z.unknown()).optional(),
});

export type RaisedSailActivityEvent = z.infer<typeof RaisedSailActivityEventSchema>;

export const RaisedSailProgressSnapshotSchema = z.object({
  reading: z.object({
    totalSeconds: z.number().optional(),
    todaySeconds: z.number().optional(),
    streakDays: z.number().optional(),
    days: z.array(z.object({
      date: z.string(),
      seconds: z.number(),
    })).optional(),
  }).optional(),
  position: z.record(z.string(), z.unknown()).optional(),
  preferences: z.record(z.string(), z.unknown()).optional(),
  downloads: z.object({
    audioPackIds: z.array(z.string()).optional(),
    voiceIds: z.array(z.string()).optional(),
    downloadedPackCount: z.number().optional(),
  }).optional(),
  profile: z.object({
    hasPicture: z.boolean().optional(),
    hasBio: z.boolean().optional(),
    linkedProviderCount: z.number().optional(),
  }).optional(),
  device: z.record(z.string(), z.unknown()).optional(),
});

export type RaisedSailProgressSnapshot = z.infer<typeof RaisedSailProgressSnapshotSchema>;

export const RaisedSailActivitySyncRequestSchema = z.object({
  appVersion: z.string(),
  platform: z.string(),
  progress: RaisedSailProgressSnapshotSchema,
  events: z.array(RaisedSailActivityEventSchema).optional(),
});

export type RaisedSailActivitySyncRequest = z.infer<typeof RaisedSailActivitySyncRequestSchema>;

export const RaisedSailBadgeSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  criteriaLabel: z.string(),
  icon: z.string(),
  tone: z.string(),
  shape: z.string(),
  unlocked: z.boolean(),
  unlockedAt: z.string().optional().nullable(),
});

export type RaisedSailBadge = z.infer<typeof RaisedSailBadgeSchema>;

export const RaisedSailBadgeStatusResponseSchema = z.object({
  badges: z.array(RaisedSailBadgeSchema),
});

export type RaisedSailBadgeStatusResponse = z.infer<typeof RaisedSailBadgeStatusResponseSchema>;

export const RaisedSailActivitySyncResponseSchema = RaisedSailBadgeStatusResponseSchema.extend({
  accepted: z.boolean(),
  storedEvents: z.number(),
  metrics: z.record(z.string(), z.number()).optional(),
  newBadges: z.array(RaisedSailBadgeSchema),
});

export type RaisedSailActivitySyncResponse = z.infer<typeof RaisedSailActivitySyncResponseSchema>;

export const ProtectedS3DownloadItemSchema = z.object({
  name: z.string().optional(),
  key: z.string().optional(),
  url: z.string().url().optional(),
}).refine(item => item.key !== undefined || item.url !== undefined, {
  message: "A download item requires either key or url.",
});

export type ProtectedS3DownloadItem = z.infer<typeof ProtectedS3DownloadItemSchema>;

export type ProtectedS3DownloadRequest = {
  readonly files: readonly ProtectedS3DownloadItem[];
  readonly expiresIn?: number;
};

export type ProtectedS3DownloadFile = {
  readonly name: string;
  readonly key: string;
  readonly url: string;
  readonly expiresAt?: string;
};

export type ProtectedS3DownloadResponse = {
  readonly requestId?: string;
  readonly files: readonly ProtectedS3DownloadFile[];
};

export type NormalizeS3KeyOptions = {
  readonly keyPrefix?: string;
  readonly allowedHosts?: readonly string[];
};

export type SignProtectedS3DownloadOptions = NormalizeS3KeyOptions & {
  readonly expiresIn?: number;
  readonly region?: string;
};

const defaultKeyPrefix = "App/Quran/";

const normalizePrefix = (prefix = defaultKeyPrefix): string =>
  prefix.replace(/^\/+/, "");

const cleanKey = (key: string, keyPrefix = defaultKeyPrefix): string => {
  const cleaned = decodeURIComponent(key).replace(/^\/+/, "");
  if (cleaned.length === 0 || cleaned.split("/").includes("..")) {
    throw new Error("Invalid S3 key.");
  }
  const prefix = normalizePrefix(keyPrefix);
  if (!cleaned.startsWith(prefix)) {
    throw new Error(`S3 key must be under ${prefix}.`);
  }
  return cleaned;
};

export function normalizeS3KeyFromUrl(
  sourceUrl: string,
  options: NormalizeS3KeyOptions = {},
): string {
  const parsed = new URL(sourceUrl);
  if (options.allowedHosts !== undefined && options.allowedHosts.length > 0) {
    if (!options.allowedHosts.includes(parsed.hostname)) {
      throw new Error(`Download host ${parsed.hostname} is not allowed.`);
    }
  }
  return cleanKey(parsed.pathname, options.keyPrefix);
}

export function normalizeProtectedS3DownloadItem(
  item: ProtectedS3DownloadItem,
  options: NormalizeS3KeyOptions = {},
): Required<Pick<ProtectedS3DownloadItem, "name" | "key">> {
  const parsed = ProtectedS3DownloadItemSchema.parse(item);
  const key = parsed.key !== undefined
    ? cleanKey(parsed.key, options.keyPrefix)
    : normalizeS3KeyFromUrl(parsed.url!, options);
  return {
    name: parsed.name ?? key.split("/").at(-1) ?? key,
    key,
  };
}

export function buildProtectedS3DownloadRequest(
  files: readonly ProtectedS3DownloadItem[],
  expiresIn?: number,
): ProtectedS3DownloadRequest {
  return {
    files: files.map(file => ProtectedS3DownloadItemSchema.parse(file)),
    ...(expiresIn === undefined ? {} : { expiresIn }),
  };
}

export async function signProtectedS3DownloadFiles(
  bucket: string,
  files: readonly ProtectedS3DownloadItem[],
  options: SignProtectedS3DownloadOptions = {},
): Promise<ProtectedS3DownloadResponse> {
  const expiresIn = options.expiresIn ?? 3600;
  const signed = await Promise.all(files.map(async file => {
    const normalized = normalizeProtectedS3DownloadItem(file, options);
    const result: PresignedUrl = await presignedUrl(
      bucket,
      normalized.key,
      expiresIn,
      "getObject",
      options.region,
    );
    return {
      name: normalized.name,
      key: normalized.key,
      url: result.url,
    } satisfies ProtectedS3DownloadFile;
  }));
  return { files: signed };
}

export function activeRaisedSailSignupCaptcha(
  config: RaisedSailAuthConfig,
): (RaisedSailCaptchaConfig & { provider: "turnstile" | "hcaptcha"; siteKey: string }) | null {
  const parsed = RaisedSailAuthConfigSchema.parse(config);
  const captcha = parsed.captcha;
  if (
    captcha?.enabled !== true ||
    captcha.provider === "none" ||
    captcha.siteKey === undefined ||
    captcha.siteKey.length === 0
  ) {
    return null;
  }
  const requiredFor = captcha.requiredFor ?? ["signup"];
  if (!requiredFor.includes("signup")) return null;
  return captcha as RaisedSailCaptchaConfig & { provider: "turnstile" | "hcaptcha"; siteKey: string };
}

export function buildRaisedSailSignupRequest(
  name: string,
  email: string,
  password: string,
  captcha?: RaisedSailCaptchaSubmission,
): RaisedSailSignupRequest {
  const parsedCaptcha = captcha === undefined ? undefined : RaisedSailCaptchaSubmissionSchema.parse(captcha);
  return RaisedSailSignupRequestSchema.parse({
    name,
    email,
    password,
    ...(parsedCaptcha === undefined ? {} : {
      captchaProvider: parsedCaptcha.provider,
      captchaToken: parsedCaptcha.token,
    }),
  });
}

export function buildRaisedSailProfileUpdateRequest(
  name: string,
  bio: string,
): RaisedSailProfileUpdateRequest {
  return RaisedSailProfileUpdateRequestSchema.parse({ name, bio });
}

export function buildRaisedSailAvatarUploadRequest(
  imageData: string,
  contentType: RaisedSailAvatarUploadRequest["contentType"],
): RaisedSailAvatarUploadRequest {
  return RaisedSailAvatarUploadRequestSchema.parse({ imageData, contentType });
}

export function buildRaisedSailProviderLinkStartRequest(
  redirectUri: string,
): RaisedSailProviderLinkStartRequest {
  return RaisedSailProviderLinkStartRequestSchema.parse({ redirectUri });
}

export function buildRaisedSailActivitySyncRequest(
  appVersion: string,
  platform: string,
  progress: RaisedSailProgressSnapshot,
  events: readonly RaisedSailActivityEvent[] = [],
): RaisedSailActivitySyncRequest {
  return RaisedSailActivitySyncRequestSchema.parse({ appVersion, platform, progress, events });
}

export function buildRaisedSailOAuthStartUrl(
  apiBaseUrl: string,
  provider: RaisedSailAuthProvider,
  redirectUri: string,
  inviteCode = "",
): string {
  const parsedProvider = RaisedSailAuthProviderSchema.parse(provider);
  const base = apiBaseUrl.replace(/\/+$/, "");
  const url = new URL(`${base}/auth/oauth/${parsedProvider}/start`);
  url.searchParams.set("redirect_uri", redirectUri);
  if (inviteCode.trim().length > 0) {
    url.searchParams.set("invite_code", inviteCode.trim());
  }
  return url.toString();
}

export function raisedSailAuthorizationHeader(accessToken: string): string {
  return `Bearer ${accessToken}`;
}

export function raisedSailAppHeaders(appClientId = "quran", platform = "web"): Record<string, string> {
  return {
    "x-raised-sail-app": appClientId,
    "x-raised-sail-platform": platform,
  };
}
