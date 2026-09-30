/**
 * aws-util/acm — High-level AWS Certificate Manager (ACM) utilities.
 *
 * Provides typed, ergonomic wrappers around the AWS SDK v3 ACM client for
 * common operations: certificate listing, requesting, describing, deleting,
 * and polling for issuance.
 *
 * All functions obtain an ACMClient via {@link getClient} and wrap errors
 * through {@link wrapAwsError}.
 *
 * @module
 */

import { z } from "zod";
import {
  ACMClient,
  ListCertificatesCommand,
  DescribeCertificateCommand,
  RequestCertificateCommand,
  DeleteCertificateCommand,
  GetCertificateCommand,
} from "@aws-sdk/client-acm";
import type { CertificateStatus } from "@aws-sdk/client-acm";
import { getClient } from "./client.js";
import {
  wrapAwsError,
  AwsNotFoundError,
  AwsTimeoutError,
} from "./exceptions.js";

// ---------------------------------------------------------------------------
// Zod schemas & inferred types
// ---------------------------------------------------------------------------

/** Schema for an ACM certificate. */
export const ACMCertificateSchema = z.object({
  certificateArn: z.string(),
  domainName: z.string(),
  status: z.string(),
  type: z.string().optional(),
  issuer: z.string().optional(),
  notBefore: z.date().optional(),
  notAfter: z.date().optional(),
  subjectAlternativeNames: z.array(z.string()).optional(),
});
/** An ACM certificate. */
export type ACMCertificate = z.infer<typeof ACMCertificateSchema>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Get a cached ACMClient for the given region.
 */
function acm(region?: string): ACMClient {
  return getClient(ACMClient, region);
}

// ---------------------------------------------------------------------------
// List / Describe
// ---------------------------------------------------------------------------

/**
 * List ACM certificates, auto-paginating through all pages.
 *
 * @param statuses - Optional array of certificate statuses to filter by
 *   (e.g. `["ISSUED", "PENDING_VALIDATION"]`).
 * @param region - AWS region override.
 * @returns An array of {@link ACMCertificate} entries.
 */
export async function listCertificates(
  statuses?: string[],
  region?: string,
): Promise<ACMCertificate[]> {
  const results: ACMCertificate[] = [];
  let nextToken: string | undefined;

  try {
    do {
      const resp = await acm(region).send(
        new ListCertificatesCommand({
          ...(statuses
            ? {
                CertificateStatuses:
                  statuses as CertificateStatus[],
              }
            : {}),
          ...(nextToken ? { NextToken: nextToken } : {}),
        }),
      );
      for (const cert of resp.CertificateSummaryList ?? []) {
        results.push(
          ACMCertificateSchema.parse({
            certificateArn: cert.CertificateArn ?? "",
            domainName: cert.DomainName ?? "",
            status: cert.Status ?? "UNKNOWN",
            type: cert.Type,
            subjectAlternativeNames:
              cert.SubjectAlternativeNameSummaries,
          }),
        );
      }
      nextToken = resp.NextToken;
    } while (nextToken);
  } catch (err) {
    throw wrapAwsError(err, "listCertificates");
  }

  return results;
}

/**
 * Describe a single ACM certificate by ARN.
 *
 * Returns `null` if the certificate does not exist rather than throwing.
 *
 * @param certificateArn - The certificate ARN.
 * @param region - AWS region override.
 * @returns The {@link ACMCertificate}, or `null` if not found.
 */
export async function describeCertificate(
  certificateArn: string,
  region?: string,
): Promise<ACMCertificate | null> {
  try {
    const resp = await acm(region).send(
      new DescribeCertificateCommand({
        CertificateArn: certificateArn,
      }),
    );
    const cert = resp.Certificate;
    if (!cert) {
      return null;
    }
    return ACMCertificateSchema.parse({
      certificateArn: cert.CertificateArn ?? certificateArn,
      domainName: cert.DomainName ?? "",
      status: cert.Status ?? "UNKNOWN",
      type: cert.Type,
      issuer: cert.Issuer,
      notBefore: cert.NotBefore,
      notAfter: cert.NotAfter,
      subjectAlternativeNames: cert.SubjectAlternativeNames,
    });
  } catch (err) {
    const wrapped = wrapAwsError(
      err,
      `describeCertificate(${certificateArn})`,
    );
    if (wrapped instanceof AwsNotFoundError) {
      return null;
    }
    throw wrapped;
  }
}

// ---------------------------------------------------------------------------
// Request / Delete
// ---------------------------------------------------------------------------

/**
 * Request a new ACM certificate.
 *
 * @param domainName - The primary domain name for the certificate.
 * @param subjectAlternativeNames - Optional additional domain names (SANs).
 * @param validationMethod - Validation method: `"DNS"` (default) or `"EMAIL"`.
 * @param region - AWS region override.
 * @returns The ARN of the newly requested certificate.
 */
export async function requestCertificate(
  domainName: string,
  subjectAlternativeNames?: string[],
  validationMethod?: "DNS" | "EMAIL",
  region?: string,
): Promise<string> {
  try {
    const resp = await acm(region).send(
      new RequestCertificateCommand({
        DomainName: domainName,
        ...(subjectAlternativeNames
          ? { SubjectAlternativeNames: subjectAlternativeNames }
          : {}),
        ValidationMethod: validationMethod ?? "DNS",
      }),
    );
    if (!resp.CertificateArn) {
      throw new Error("RequestCertificate returned no CertificateArn");
    }
    return resp.CertificateArn;
  } catch (err) {
    throw wrapAwsError(
      err,
      `requestCertificate(${domainName})`,
    );
  }
}

/**
 * Delete an ACM certificate by ARN.
 *
 * @param certificateArn - The certificate ARN to delete.
 * @param region - AWS region override.
 */
export async function deleteCertificate(
  certificateArn: string,
  region?: string,
): Promise<void> {
  try {
    await acm(region).send(
      new DeleteCertificateCommand({
        CertificateArn: certificateArn,
      }),
    );
  } catch (err) {
    throw wrapAwsError(
      err,
      `deleteCertificate(${certificateArn})`,
    );
  }
}

// ---------------------------------------------------------------------------
// Polling
// ---------------------------------------------------------------------------

/**
 * Poll an ACM certificate until it reaches ISSUED status.
 *
 * Useful after {@link requestCertificate} once DNS/email validation is
 * complete and you need to wait for AWS to issue the certificate.
 *
 * @param certificateArn - The certificate ARN to poll.
 * @param timeout - Maximum wait time in milliseconds (default 300000 = 5 min).
 * @param pollInterval - Polling interval in milliseconds (default 10000 = 10 sec).
 * @param region - AWS region override.
 * @returns The fully issued {@link ACMCertificate}.
 * @throws {AwsTimeoutError} If the certificate does not reach ISSUED before timeout.
 */
export async function waitForCertificate(
  certificateArn: string,
  timeout = 300_000,
  pollInterval = 10_000,
  region?: string,
): Promise<ACMCertificate> {
  const deadline = Date.now() + timeout;

  while (Date.now() < deadline) {
    const cert = await describeCertificate(certificateArn, region);
    if (cert && cert.status === "ISSUED") {
      return cert;
    }
    if (Date.now() + pollInterval > deadline) {
      break;
    }
    await new Promise((resolve) =>
      setTimeout(resolve, pollInterval),
    );
  }

  throw new AwsTimeoutError(
    `Certificate ${certificateArn} did not reach ISSUED within ${timeout}ms`,
  );
}

// ---------------------------------------------------------------------------
// Convenience helpers
// ---------------------------------------------------------------------------

/**
 * Find a certificate by domain name.
 *
 * Lists all certificates and returns the first one whose domain name
 * matches the given value. Returns `null` if no match is found.
 *
 * @param domainName - The domain name to search for.
 * @param region - AWS region override.
 * @returns The matching {@link ACMCertificate}, or `null` if not found.
 */
export async function findCertificateByDomain(
  domainName: string,
  region?: string,
): Promise<ACMCertificate | null> {
  const certs = await listCertificates(undefined, region);
  const match = certs.find(
    (c) => c.domainName === domainName,
  );
  if (!match) {
    return null;
  }
  // Fetch full details via describe for complete metadata
  return describeCertificate(match.certificateArn, region);
}

/**
 * Retrieve the PEM-encoded certificate body and chain.
 *
 * @param certificateArn - The certificate ARN.
 * @param region - AWS region override.
 * @returns An object with `certificate` (PEM body) and `chain` (PEM chain).
 */
export async function getCertificatePem(
  certificateArn: string,
  region?: string,
): Promise<{ certificate: string; chain: string }> {
  try {
    const resp = await acm(region).send(
      new GetCertificateCommand({
        CertificateArn: certificateArn,
      }),
    );
    return {
      certificate: resp.Certificate ?? "",
      chain: resp.CertificateChain ?? "",
    };
  } catch (err) {
    throw wrapAwsError(
      err,
      `getCertificatePem(${certificateArn})`,
    );
  }
}

// ---------------------------------------------------------------------------
// Additional types (auto-generated)
// ---------------------------------------------------------------------------

/** Result of export_certificate. */
export type ExportCertificateResult = {
  certificate?: string | undefined;
  certificateChain?: string | undefined;
  privateKey?: string | undefined;
};

/** Result of get_account_configuration. */
export type GetAccountConfigurationResult = {
  expiryEvents?: Record<string, unknown>;
};

/** Result of get_certificate. */
export type GetCertificateResult = {
  certificate?: string | undefined;
  certificateChain?: string | undefined;
};

/** Result of import_certificate. */
export type ImportCertificateResult = {
  certificateArn?: string | undefined;
};

/** Result of list_tags_for_certificate. */
export type ListTagsForCertificateResult = {
  tags?: Record<string, unknown>[];
};

/** Result of revoke_certificate. */
export type RevokeCertificateResult = {
  certificateArn?: string | undefined;
};


// ---------------------------------------------------------------------------
// Additional functions (auto-generated)
// ---------------------------------------------------------------------------

/** Add tags to certificate. */
export async function addTagsToCertificate(certificateArn: string, tags: Record<string, unknown>[], regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement add_tags_to_certificate
    throw new Error("add_tags_to_certificate not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "add_tags_to_certificate failed");
  }
}

/** Export certificate. */
export async function exportCertificate(certificateArn: string, passphrase: Uint8Array, regionName?: string | undefined): Promise<ExportCertificateResult> {
  try {
    // TODO: implement export_certificate
    throw new Error("export_certificate not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "export_certificate failed");
  }
}

/** Get account configuration. */
export async function getAccountConfiguration(regionName?: string | undefined): Promise<GetAccountConfigurationResult> {
  try {
    // TODO: implement get_account_configuration
    throw new Error("get_account_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_account_configuration failed");
  }
}

/** Get certificate. */
export async function getCertificate(certificateArn: string, regionName?: string | undefined): Promise<GetCertificateResult> {
  try {
    // TODO: implement get_certificate
    throw new Error("get_certificate not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_certificate failed");
  }
}

/** Import certificate. */
export async function importCertificate(certificate: Uint8Array, privateKey: Uint8Array): Promise<ImportCertificateResult> {
  try {
    // TODO: implement import_certificate
    throw new Error("import_certificate not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "import_certificate failed");
  }
}

/** List tags for certificate. */
export async function listTagsForCertificate(certificateArn: string, regionName?: string | undefined): Promise<ListTagsForCertificateResult> {
  try {
    // TODO: implement list_tags_for_certificate
    throw new Error("list_tags_for_certificate not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_tags_for_certificate failed");
  }
}

/** Put account configuration. */
export async function putAccountConfiguration(idempotencyToken: string): Promise<void> {
  try {
    // TODO: implement put_account_configuration
    throw new Error("put_account_configuration not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_account_configuration failed");
  }
}

/** Remove tags from certificate. */
export async function removeTagsFromCertificate(certificateArn: string, tags: Record<string, unknown>[], regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement remove_tags_from_certificate
    throw new Error("remove_tags_from_certificate not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "remove_tags_from_certificate failed");
  }
}

/** Renew certificate. */
export async function renewCertificate(certificateArn: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement renew_certificate
    throw new Error("renew_certificate not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "renew_certificate failed");
  }
}

/** Resend validation email. */
export async function resendValidationEmail(certificateArn: string, domain: string, validationDomain: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement resend_validation_email
    throw new Error("resend_validation_email not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "resend_validation_email failed");
  }
}

/** Revoke certificate. */
export async function revokeCertificate(certificateArn: string, revocationReason: string, regionName?: string | undefined): Promise<RevokeCertificateResult> {
  try {
    // TODO: implement revoke_certificate
    throw new Error("revoke_certificate not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "revoke_certificate failed");
  }
}

/** Update certificate options. */
export async function updateCertificateOptions(certificateArn: string, options: Record<string, unknown>, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement update_certificate_options
    throw new Error("update_certificate_options not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_certificate_options failed");
  }
}
