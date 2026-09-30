/**
 * aws-util/kms — High-level AWS KMS (Key Management Service) utilities.
 *
 * Provides typed helpers for encryption, decryption, data key generation,
 * envelope encryption/decryption using AES-256-GCM, and re-encryption.
 *
 * All functions obtain a KMSClient via {@link getClient} and wrap errors
 * through {@link wrapAwsError}.
 *
 * @example
 * ```ts
 * import { encrypt, decrypt, envelopeEncrypt, envelopeDecrypt } from "./kms.js";
 *
 * const result = await encrypt("alias/my-key", "hello world");
 * const plain = await decrypt(result.ciphertextBlob);
 *
 * const env = await envelopeEncrypt("alias/my-key", "sensitive data");
 * const decrypted = await envelopeDecrypt(
 *   env.encryptedDataKey, env.encryptedData, env.iv,
 * );
 * ```
 *
 * @module
 */

import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { z } from "zod";
import {
  KMSClient,
  EncryptCommand,
  DecryptCommand,
  GenerateDataKeyCommand,
  ReEncryptCommand,
} from "@aws-sdk/client-kms";
import { getClient } from "./client.js";
import { wrapAwsError } from "./exceptions.js";

// ---------------------------------------------------------------------------
// Zod schemas & inferred types
// ---------------------------------------------------------------------------

/** Schema for the result of an encrypt operation. */
export const EncryptResultSchema = z.object({
  ciphertextBlob: z.instanceof(Uint8Array),
  keyId: z.string(),
});

/** Result of {@link encrypt} or {@link reEncrypt}. */
export type EncryptResult = z.infer<typeof EncryptResultSchema>;

/** Schema for a generated data key. */
export const DataKeySchema = z.object({
  plaintext: z.instanceof(Uint8Array),
  ciphertextBlob: z.instanceof(Uint8Array),
  keyId: z.string(),
});

/** A generated data key from {@link generateDataKey}. */
export type DataKey = z.infer<typeof DataKeySchema>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Get a cached KMSClient for the given region.
 */
function kms(region?: string): KMSClient {
  return getClient(KMSClient, region);
}

/**
 * Coerce a string or Uint8Array to Uint8Array.
 */
function toBytes(data: string | Uint8Array): Uint8Array {
  if (typeof data === "string") {
    return new TextEncoder().encode(data);
  }
  return data;
}

// ---------------------------------------------------------------------------
// Public API — basic encrypt / decrypt
// ---------------------------------------------------------------------------

/**
 * Encrypt plaintext using a KMS key.
 *
 * @param keyId - The KMS key ID, key ARN, alias name, or alias ARN.
 * @param plaintext - The data to encrypt (string or Uint8Array).
 * @param region - AWS region override.
 * @returns The ciphertext blob and key ID.
 */
export async function encrypt(
  keyId: string,
  plaintext: string | Uint8Array,
  region?: string,
): Promise<EncryptResult> {
  try {
    const resp = await kms(region).send(
      new EncryptCommand({
        KeyId: keyId,
        Plaintext: toBytes(plaintext),
      }),
    );

    if (!resp.CiphertextBlob) {
      throw new Error("Encrypt returned no ciphertext");
    }

    return EncryptResultSchema.parse({
      ciphertextBlob: resp.CiphertextBlob,
      keyId: resp.KeyId ?? keyId,
    });
  } catch (err) {
    throw wrapAwsError(err, `encrypt ${keyId}`);
  }
}

/**
 * Decrypt a ciphertext blob using KMS.
 *
 * KMS determines which key to use from the ciphertext metadata.
 *
 * @param ciphertextBlob - The encrypted data.
 * @param region - AWS region override.
 * @returns The decrypted plaintext and key ID.
 */
export async function decrypt(
  ciphertextBlob: Uint8Array,
  region?: string,
): Promise<{ plaintext: Uint8Array; keyId: string }> {
  try {
    const resp = await kms(region).send(
      new DecryptCommand({
        CiphertextBlob: ciphertextBlob,
      }),
    );

    if (!resp.Plaintext) {
      throw new Error("Decrypt returned no plaintext");
    }

    return {
      plaintext: resp.Plaintext,
      keyId: resp.KeyId ?? "",
    };
  } catch (err) {
    throw wrapAwsError(err, "decrypt");
  }
}

// ---------------------------------------------------------------------------
// Data key generation
// ---------------------------------------------------------------------------

/**
 * Generate a data key for client-side encryption.
 *
 * Returns both the plaintext key (for immediate use) and the encrypted
 * key (for storage alongside the encrypted data).
 *
 * @param keyId - The KMS key ID, key ARN, alias name, or alias ARN.
 * @param keySpec - The key spec (default `"AES_256"`).
 * @param region - AWS region override.
 * @returns The plaintext key, encrypted key, and key ID.
 */
export async function generateDataKey(
  keyId: string,
  keySpec: string = "AES_256",
  region?: string,
): Promise<DataKey> {
  try {
    const resp = await kms(region).send(
      new GenerateDataKeyCommand({
        KeyId: keyId,
        KeySpec: keySpec,
      }),
    );

    if (!resp.Plaintext || !resp.CiphertextBlob) {
      throw new Error(
        "GenerateDataKey returned incomplete response",
      );
    }

    return DataKeySchema.parse({
      plaintext: resp.Plaintext,
      ciphertextBlob: resp.CiphertextBlob,
      keyId: resp.KeyId ?? keyId,
    });
  } catch (err) {
    throw wrapAwsError(err, `generateDataKey ${keyId}`);
  }
}

// ---------------------------------------------------------------------------
// Envelope encryption
// ---------------------------------------------------------------------------

/** The AES-GCM IV length in bytes. */
const IV_LENGTH = 12;

/** The AES-GCM auth tag length in bytes. */
const AUTH_TAG_LENGTH = 16;

/**
 * Encrypt data using envelope encryption (KMS + AES-256-GCM).
 *
 * 1. Generates a data key via KMS.
 * 2. Encrypts the plaintext locally using AES-256-GCM with the plaintext
 *    data key.
 * 3. Returns the encrypted data key (for storage), the encrypted data
 *    (ciphertext + auth tag appended), and the IV.
 *
 * The plaintext data key is zeroed after use and never persisted.
 *
 * @param keyId - The KMS key ID, key ARN, alias name, or alias ARN.
 * @param plaintext - The data to encrypt (string or Uint8Array).
 * @param region - AWS region override.
 * @returns The encrypted data key, encrypted data (with auth tag appended),
 *   and the initialization vector.
 */
export async function envelopeEncrypt(
  keyId: string,
  plaintext: string | Uint8Array,
  region?: string,
): Promise<{
  encryptedDataKey: Uint8Array;
  encryptedData: Uint8Array;
  iv: Uint8Array;
}> {
  const dataKey = await generateDataKey(keyId, "AES_256", region);

  try {
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(
      "aes-256-gcm",
      dataKey.plaintext,
      iv,
    );

    const plaintextBytes = toBytes(plaintext);
    const encrypted = Buffer.concat([
      cipher.update(plaintextBytes),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();

    // Append auth tag to encrypted data
    const encryptedData = new Uint8Array(
      encrypted.length + authTag.length,
    );
    encryptedData.set(encrypted, 0);
    encryptedData.set(authTag, encrypted.length);

    return {
      encryptedDataKey: dataKey.ciphertextBlob,
      encryptedData,
      iv: new Uint8Array(iv),
    };
  } finally {
    // Zero out plaintext key material
    if (dataKey.plaintext instanceof Uint8Array) {
      dataKey.plaintext.fill(0);
    }
  }
}

/**
 * Decrypt data that was encrypted with {@link envelopeEncrypt}.
 *
 * 1. Decrypts the data key via KMS.
 * 2. Extracts the auth tag from the end of the encrypted data.
 * 3. Decrypts the data locally using AES-256-GCM.
 *
 * @param encryptedDataKey - The KMS-encrypted data key.
 * @param encryptedData - The encrypted data (ciphertext + auth tag appended).
 * @param iv - The initialization vector used during encryption.
 * @param region - AWS region override.
 * @returns The decrypted plaintext as a Uint8Array.
 */
export async function envelopeDecrypt(
  encryptedDataKey: Uint8Array,
  encryptedData: Uint8Array,
  iv: Uint8Array,
  region?: string,
): Promise<Uint8Array> {
  const { plaintext: dataKeyPlaintext } = await decrypt(
    encryptedDataKey,
    region,
  );

  try {
    // Split ciphertext and auth tag
    const ciphertext = encryptedData.slice(
      0,
      encryptedData.length - AUTH_TAG_LENGTH,
    );
    const authTag = encryptedData.slice(
      encryptedData.length - AUTH_TAG_LENGTH,
    );

    const decipher = createDecipheriv(
      "aes-256-gcm",
      dataKeyPlaintext,
      iv,
    );
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]);

    return new Uint8Array(decrypted);
  } finally {
    // Zero out plaintext key material
    if (dataKeyPlaintext instanceof Uint8Array) {
      dataKeyPlaintext.fill(0);
    }
  }
}

// ---------------------------------------------------------------------------
// Re-encryption
// ---------------------------------------------------------------------------

/**
 * Re-encrypt a ciphertext blob under a different KMS key without exposing
 * the plaintext.
 *
 * @param ciphertextBlob - The ciphertext to re-encrypt.
 * @param destinationKeyId - The KMS key to re-encrypt under.
 * @param sourceKeyId - Optional source key ID (required for asymmetric keys).
 * @param region - AWS region override.
 * @returns The re-encrypted ciphertext and destination key ID.
 */
export async function reEncrypt(
  ciphertextBlob: Uint8Array,
  destinationKeyId: string,
  sourceKeyId?: string,
  region?: string,
): Promise<EncryptResult> {
  try {
    const resp = await kms(region).send(
      new ReEncryptCommand({
        CiphertextBlob: ciphertextBlob,
        DestinationKeyId: destinationKeyId,
        SourceKeyId: sourceKeyId,
      }),
    );

    if (!resp.CiphertextBlob) {
      throw new Error("ReEncrypt returned no ciphertext");
    }

    return EncryptResultSchema.parse({
      ciphertextBlob: resp.CiphertextBlob,
      keyId: resp.KeyId ?? destinationKeyId,
    });
  } catch (err) {
    throw wrapAwsError(
      err,
      `reEncrypt -> ${destinationKeyId}`,
    );
  }
}

// ---------------------------------------------------------------------------
// Additional types (auto-generated)
// ---------------------------------------------------------------------------

/** Result of cancel_key_deletion. */
export type CancelKeyDeletionResult = {
  keyId?: string | undefined;
};

/** Result of create_custom_key_store. */
export type CreateCustomKeyStoreResult = {
  customKeyStoreId?: string | undefined;
};

/** Result of create_grant. */
export type CreateGrantResult = {
  grantToken?: string | undefined;
  grantId?: string | undefined;
};

/** Result of create_key. */
export type CreateKeyResult = {
  keyMetadata?: Record<string, unknown>;
};

/** Result of delete_imported_key_material. */
export type DeleteImportedKeyMaterialResult = {
  keyId?: string | undefined;
  keyMaterialId?: string | undefined;
};

/** Result of derive_shared_secret. */
export type DeriveSharedSecretResult = {
  keyId?: string | undefined;
  sharedSecret?: Uint8Array | undefined;
  ciphertextForRecipient?: Uint8Array | undefined;
  keyAgreementAlgorithm?: string | undefined;
  keyOrigin?: string | undefined;
};

/** Result of describe_custom_key_stores. */
export type DescribeCustomKeyStoresResult = {
  customKeyStores?: Record<string, unknown>[];
  nextMarker?: string | undefined;
  truncated?: boolean | undefined;
};

/** Result of describe_key. */
export type DescribeKeyResult = {
  keyMetadata?: Record<string, unknown>;
};

/** Result of generate_data_key_pair. */
export type GenerateDataKeyPairResult = {
  privateKeyCiphertextBlob?: Uint8Array | undefined;
  privateKeyPlaintext?: Uint8Array | undefined;
  publicKey?: Uint8Array | undefined;
  keyId?: string | undefined;
  keyPairSpec?: string | undefined;
  ciphertextForRecipient?: Uint8Array | undefined;
  keyMaterialId?: string | undefined;
};

/** Result of generate_data_key_pair_without_plaintext. */
export type GenerateDataKeyPairWithoutPlaintextResult = {
  privateKeyCiphertextBlob?: Uint8Array | undefined;
  publicKey?: Uint8Array | undefined;
  keyId?: string | undefined;
  keyPairSpec?: string | undefined;
  keyMaterialId?: string | undefined;
};

/** Result of generate_data_key_without_plaintext. */
export type GenerateDataKeyWithoutPlaintextResult = {
  ciphertextBlob?: Uint8Array | undefined;
  keyId?: string | undefined;
  keyMaterialId?: string | undefined;
};

/** Result of generate_mac. */
export type GenerateMacResult = {
  mac?: Uint8Array | undefined;
  macAlgorithm?: string | undefined;
  keyId?: string | undefined;
};

/** Result of generate_random. */
export type GenerateRandomResult = {
  plaintext?: Uint8Array | undefined;
  ciphertextForRecipient?: Uint8Array | undefined;
};

/** Result of get_key_policy. */
export type GetKeyPolicyResult = {
  policy?: string | undefined;
  policyName?: string | undefined;
};

/** Result of get_key_rotation_status. */
export type GetKeyRotationStatusResult = {
  keyRotationEnabled?: boolean | undefined;
  keyId?: string | undefined;
  rotationPeriodInDays?: number | undefined;
  nextRotationDate?: string | undefined;
  onDemandRotationStartDate?: string | undefined;
};

/** Result of get_parameters_for_import. */
export type GetParametersForImportResult = {
  keyId?: string | undefined;
  importToken?: Uint8Array | undefined;
  publicKey?: Uint8Array | undefined;
  parametersValidTo?: string | undefined;
};

/** Result of get_public_key. */
export type GetPublicKeyResult = {
  keyId?: string | undefined;
  publicKey?: Uint8Array | undefined;
  customerMasterKeySpec?: string | undefined;
  keySpec?: string | undefined;
  keyUsage?: string | undefined;
  encryptionAlgorithms?: string[];
  signingAlgorithms?: string[];
  keyAgreementAlgorithms?: string[];
};

/** Result of import_key_material. */
export type ImportKeyMaterialResult = {
  keyId?: string | undefined;
  keyMaterialId?: string | undefined;
};

/** Result of list_aliases. */
export type ListAliasesResult = {
  aliases?: Record<string, unknown>[];
  nextMarker?: string | undefined;
  truncated?: boolean | undefined;
};

/** Result of list_grants. */
export type ListGrantsResult = {
  grants?: Record<string, unknown>[];
  nextMarker?: string | undefined;
  truncated?: boolean | undefined;
};

/** Result of list_key_policies. */
export type ListKeyPoliciesResult = {
  policyNames?: string[];
  nextMarker?: string | undefined;
  truncated?: boolean | undefined;
};

/** Result of list_key_rotations. */
export type ListKeyRotationsResult = {
  rotations?: Record<string, unknown>[];
  nextMarker?: string | undefined;
  truncated?: boolean | undefined;
};

/** Result of list_keys. */
export type ListKeysResult = {
  keys?: Record<string, unknown>[];
  nextMarker?: string | undefined;
  truncated?: boolean | undefined;
};

/** Result of list_resource_tags. */
export type ListResourceTagsResult = {
  tags?: Record<string, unknown>[];
  nextMarker?: string | undefined;
  truncated?: boolean | undefined;
};

/** Result of list_retirable_grants. */
export type ListRetirableGrantsResult = {
  grants?: Record<string, unknown>[];
  nextMarker?: string | undefined;
  truncated?: boolean | undefined;
};

/** Result of replicate_key. */
export type ReplicateKeyResult = {
  replicaKeyMetadata?: Record<string, unknown>;
  replicaPolicy?: string | undefined;
  replicaTags?: Record<string, unknown>[];
};

/** Result of rotate_key_on_demand. */
export type RotateKeyOnDemandResult = {
  keyId?: string | undefined;
};

/** Result of schedule_key_deletion. */
export type ScheduleKeyDeletionResult = {
  keyId?: string | undefined;
  deletionDate?: string | undefined;
  keyState?: string | undefined;
  pendingWindowInDays?: number | undefined;
};

/** Result of sign. */
export type SignResult = {
  keyId?: string | undefined;
  signature?: Uint8Array | undefined;
  signingAlgorithm?: string | undefined;
};

/** Result of verify. */
export type VerifyResult = {
  keyId?: string | undefined;
  signatureValid?: boolean | undefined;
  signingAlgorithm?: string | undefined;
};

/** Result of verify_mac. */
export type VerifyMacResult = {
  keyId?: string | undefined;
  macValid?: boolean | undefined;
  macAlgorithm?: string | undefined;
};


// ---------------------------------------------------------------------------
// Additional functions (auto-generated)
// ---------------------------------------------------------------------------

/** Decrypt an encrypted data key generated by :func:`generate_data_key`. */
export async function decryptDataKey(ciphertextBlob: Uint8Array, regionName?: string | undefined): Promise<Uint8Array> {
  try {
    // TODO: implement decrypt_data_key
    throw new Error("decrypt_data_key not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "decrypt_data_key failed");
  }
}

/** Cancel key deletion. */
export async function cancelKeyDeletion(keyId: string, regionName?: string | undefined): Promise<CancelKeyDeletionResult> {
  try {
    // TODO: implement cancel_key_deletion
    throw new Error("cancel_key_deletion not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "cancel_key_deletion failed");
  }
}

/** Connect custom key store. */
export async function connectCustomKeyStore(customKeyStoreId: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement connect_custom_key_store
    throw new Error("connect_custom_key_store not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "connect_custom_key_store failed");
  }
}

/** Create alias. */
export async function createAlias(aliasName: string, targetKeyId: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement create_alias
    throw new Error("create_alias not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_alias failed");
  }
}

/** Create custom key store. */
export async function createCustomKeyStore(customKeyStoreName: string): Promise<CreateCustomKeyStoreResult> {
  try {
    // TODO: implement create_custom_key_store
    throw new Error("create_custom_key_store not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_custom_key_store failed");
  }
}

/** Create grant. */
export async function createGrant(keyId: string, granteePrincipal: string, operations: string[]): Promise<CreateGrantResult> {
  try {
    // TODO: implement create_grant
    throw new Error("create_grant not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_grant failed");
  }
}

/** Create key. */
export async function createKey(): Promise<CreateKeyResult> {
  try {
    // TODO: implement create_key
    throw new Error("create_key not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_key failed");
  }
}

/** Delete alias. */
export async function deleteAlias(aliasName: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_alias
    throw new Error("delete_alias not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_alias failed");
  }
}

/** Delete custom key store. */
export async function deleteCustomKeyStore(customKeyStoreId: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_custom_key_store
    throw new Error("delete_custom_key_store not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_custom_key_store failed");
  }
}

/** Delete imported key material. */
export async function deleteImportedKeyMaterial(keyId: string): Promise<DeleteImportedKeyMaterialResult> {
  try {
    // TODO: implement delete_imported_key_material
    throw new Error("delete_imported_key_material not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_imported_key_material failed");
  }
}

/** Derive shared secret. */
export async function deriveSharedSecret(keyId: string, keyAgreementAlgorithm: string, publicKey: Uint8Array): Promise<DeriveSharedSecretResult> {
  try {
    // TODO: implement derive_shared_secret
    throw new Error("derive_shared_secret not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "derive_shared_secret failed");
  }
}

/** Describe custom key stores. */
export async function describeCustomKeyStores(): Promise<DescribeCustomKeyStoresResult> {
  try {
    // TODO: implement describe_custom_key_stores
    throw new Error("describe_custom_key_stores not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_custom_key_stores failed");
  }
}

/** Describe key. */
export async function describeKey(keyId: string): Promise<DescribeKeyResult> {
  try {
    // TODO: implement describe_key
    throw new Error("describe_key not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_key failed");
  }
}

/** Disable key. */
export async function disableKey(keyId: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement disable_key
    throw new Error("disable_key not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disable_key failed");
  }
}

/** Disable key rotation. */
export async function disableKeyRotation(keyId: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement disable_key_rotation
    throw new Error("disable_key_rotation not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disable_key_rotation failed");
  }
}

/** Disconnect custom key store. */
export async function disconnectCustomKeyStore(customKeyStoreId: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement disconnect_custom_key_store
    throw new Error("disconnect_custom_key_store not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disconnect_custom_key_store failed");
  }
}

/** Enable key. */
export async function enableKey(keyId: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement enable_key
    throw new Error("enable_key not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "enable_key failed");
  }
}

/** Enable key rotation. */
export async function enableKeyRotation(keyId: string): Promise<void> {
  try {
    // TODO: implement enable_key_rotation
    throw new Error("enable_key_rotation not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "enable_key_rotation failed");
  }
}

/** Generate data key pair. */
export async function generateDataKeyPair(keyId: string, keyPairSpec: string): Promise<GenerateDataKeyPairResult> {
  try {
    // TODO: implement generate_data_key_pair
    throw new Error("generate_data_key_pair not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "generate_data_key_pair failed");
  }
}

/** Generate data key pair without plaintext. */
export async function generateDataKeyPairWithoutPlaintext(keyId: string, keyPairSpec: string): Promise<GenerateDataKeyPairWithoutPlaintextResult> {
  try {
    // TODO: implement generate_data_key_pair_without_plaintext
    throw new Error("generate_data_key_pair_without_plaintext not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "generate_data_key_pair_without_plaintext failed");
  }
}

/** Generate data key without plaintext. */
export async function generateDataKeyWithoutPlaintext(keyId: string): Promise<GenerateDataKeyWithoutPlaintextResult> {
  try {
    // TODO: implement generate_data_key_without_plaintext
    throw new Error("generate_data_key_without_plaintext not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "generate_data_key_without_plaintext failed");
  }
}

/** Generate mac. */
export async function generateMac(message: Uint8Array, keyId: string, macAlgorithm: string): Promise<GenerateMacResult> {
  try {
    // TODO: implement generate_mac
    throw new Error("generate_mac not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "generate_mac failed");
  }
}

/** Generate random. */
export async function generateRandom(): Promise<GenerateRandomResult> {
  try {
    // TODO: implement generate_random
    throw new Error("generate_random not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "generate_random failed");
  }
}

/** Get key policy. */
export async function getKeyPolicy(keyId: string): Promise<GetKeyPolicyResult> {
  try {
    // TODO: implement get_key_policy
    throw new Error("get_key_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_key_policy failed");
  }
}

/** Get key rotation status. */
export async function getKeyRotationStatus(keyId: string, regionName?: string | undefined): Promise<GetKeyRotationStatusResult> {
  try {
    // TODO: implement get_key_rotation_status
    throw new Error("get_key_rotation_status not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_key_rotation_status failed");
  }
}

/** Get parameters for import. */
export async function getParametersForImport(keyId: string, wrappingAlgorithm: string, wrappingKeySpec: string, regionName?: string | undefined): Promise<GetParametersForImportResult> {
  try {
    // TODO: implement get_parameters_for_import
    throw new Error("get_parameters_for_import not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_parameters_for_import failed");
  }
}

/** Get public key. */
export async function getPublicKey(keyId: string): Promise<GetPublicKeyResult> {
  try {
    // TODO: implement get_public_key
    throw new Error("get_public_key not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_public_key failed");
  }
}

/** Import key material. */
export async function importKeyMaterial(keyId: string, importToken: Uint8Array, encryptedKeyMaterial: Uint8Array): Promise<ImportKeyMaterialResult> {
  try {
    // TODO: implement import_key_material
    throw new Error("import_key_material not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "import_key_material failed");
  }
}

/** List aliases. */
export async function listAliases(): Promise<ListAliasesResult> {
  try {
    // TODO: implement list_aliases
    throw new Error("list_aliases not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_aliases failed");
  }
}

/** List grants. */
export async function listGrants(keyId: string): Promise<ListGrantsResult> {
  try {
    // TODO: implement list_grants
    throw new Error("list_grants not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_grants failed");
  }
}

/** List key policies. */
export async function listKeyPolicies(keyId: string): Promise<ListKeyPoliciesResult> {
  try {
    // TODO: implement list_key_policies
    throw new Error("list_key_policies not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_key_policies failed");
  }
}

/** List key rotations. */
export async function listKeyRotations(keyId: string): Promise<ListKeyRotationsResult> {
  try {
    // TODO: implement list_key_rotations
    throw new Error("list_key_rotations not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_key_rotations failed");
  }
}

/** List keys. */
export async function listKeys(): Promise<ListKeysResult> {
  try {
    // TODO: implement list_keys
    throw new Error("list_keys not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_keys failed");
  }
}

/** List resource tags. */
export async function listResourceTags(keyId: string): Promise<ListResourceTagsResult> {
  try {
    // TODO: implement list_resource_tags
    throw new Error("list_resource_tags not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_resource_tags failed");
  }
}

/** List retirable grants. */
export async function listRetirableGrants(retiringPrincipal: string): Promise<ListRetirableGrantsResult> {
  try {
    // TODO: implement list_retirable_grants
    throw new Error("list_retirable_grants not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_retirable_grants failed");
  }
}

/** Put key policy. */
export async function putKeyPolicy(keyId: string, policy: string): Promise<void> {
  try {
    // TODO: implement put_key_policy
    throw new Error("put_key_policy not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_key_policy failed");
  }
}

/** Replicate key. */
export async function replicateKey(keyId: string, replicaRegion: string): Promise<ReplicateKeyResult> {
  try {
    // TODO: implement replicate_key
    throw new Error("replicate_key not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "replicate_key failed");
  }
}

/** Retire grant. */
export async function retireGrant(): Promise<void> {
  try {
    // TODO: implement retire_grant
    throw new Error("retire_grant not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "retire_grant failed");
  }
}

/** Revoke grant. */
export async function revokeGrant(keyId: string, grantId: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement revoke_grant
    throw new Error("revoke_grant not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "revoke_grant failed");
  }
}

/** Rotate key on demand. */
export async function rotateKeyOnDemand(keyId: string, regionName?: string | undefined): Promise<RotateKeyOnDemandResult> {
  try {
    // TODO: implement rotate_key_on_demand
    throw new Error("rotate_key_on_demand not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "rotate_key_on_demand failed");
  }
}

/** Schedule key deletion. */
export async function scheduleKeyDeletion(keyId: string): Promise<ScheduleKeyDeletionResult> {
  try {
    // TODO: implement schedule_key_deletion
    throw new Error("schedule_key_deletion not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "schedule_key_deletion failed");
  }
}

/** Sign. */
export async function sign(keyId: string, message: Uint8Array, signingAlgorithm: string): Promise<SignResult> {
  try {
    // TODO: implement sign
    throw new Error("sign not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "sign failed");
  }
}

/** Tag resource. */
export async function tagResource(keyId: string, tags: Record<string, unknown>[], regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement tag_resource
    throw new Error("tag_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "tag_resource failed");
  }
}

/** Untag resource. */
export async function untagResource(keyId: string, tagKeys: string[], regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement untag_resource
    throw new Error("untag_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "untag_resource failed");
  }
}

/** Update alias. */
export async function updateAlias(aliasName: string, targetKeyId: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement update_alias
    throw new Error("update_alias not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_alias failed");
  }
}

/** Update custom key store. */
export async function updateCustomKeyStore(customKeyStoreId: string): Promise<void> {
  try {
    // TODO: implement update_custom_key_store
    throw new Error("update_custom_key_store not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_custom_key_store failed");
  }
}

/** Update key description. */
export async function updateKeyDescription(keyId: string, description: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement update_key_description
    throw new Error("update_key_description not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_key_description failed");
  }
}

/** Update primary region. */
export async function updatePrimaryRegion(keyId: string, primaryRegion: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement update_primary_region
    throw new Error("update_primary_region not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_primary_region failed");
  }
}

/** Verify. */
export async function verify(keyId: string, message: Uint8Array, signature: Uint8Array, signingAlgorithm: string): Promise<VerifyResult> {
  try {
    // TODO: implement verify
    throw new Error("verify not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "verify failed");
  }
}

/** Verify mac. */
export async function verifyMac(message: Uint8Array, keyId: string, macAlgorithm: string, mac: Uint8Array): Promise<VerifyMacResult> {
  try {
    // TODO: implement verify_mac
    throw new Error("verify_mac not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "verify_mac failed");
  }
}
