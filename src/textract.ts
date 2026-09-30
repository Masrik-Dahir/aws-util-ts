/**
 * aws-util/textract — High-level Amazon Textract utilities.
 *
 * Provides typed helpers for synchronous document text detection, document
 * analysis (tables, forms, signatures), asynchronous multi-page jobs with
 * polling, and high-level extractors for text, tables, and form fields.
 *
 * @example
 * ```ts
 * import { extractText, extractTables, extractAll } from "./textract.js";
 *
 * const text = await extractText({ s3Bucket: "docs", s3Key: "invoice.pdf" });
 * ```
 *
 * @module
 */

import { z } from "zod";
import {
  TextractClient,
  DetectDocumentTextCommand,
  AnalyzeDocumentCommand,
  StartDocumentTextDetectionCommand,
  GetDocumentTextDetectionCommand,
} from "@aws-sdk/client-textract";
import { getClient } from "./client.js";
import {
  wrapAwsError,
  AwsTimeoutError,
} from "./exceptions.js";

// ---------------------------------------------------------------------------
// Zod schemas
// ---------------------------------------------------------------------------

/** Schema for a single block in a Textract response. */
export const TextractBlockSchema = z.object({
  blockType: z.string(),
  text: z.string().optional(),
  confidence: z.number().optional(),
  id: z.string().optional(),
  relationships: z
    .array(
      z.object({
        type: z.string().optional(),
        ids: z.array(z.string()).optional(),
      }),
    )
    .optional(),
  rowIndex: z.number().optional(),
  columnIndex: z.number().optional(),
  rowSpan: z.number().optional(),
  columnSpan: z.number().optional(),
  page: z.number().optional(),
});

/** A single block in a Textract response. */
export type TextractBlock = z.infer<typeof TextractBlockSchema>;

/** Schema for the result of an asynchronous Textract job. */
export const TextractJobResultSchema = z.object({
  jobId: z.string(),
  status: z.string(),
  blocks: z.array(TextractBlockSchema).optional(),
});

/** Result of an asynchronous Textract job. */
export type TextractJobResult = z.infer<typeof TextractJobResultSchema>;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Document input: either an S3 reference or raw bytes. */
export type DocumentInput =
  | { s3Bucket: string; s3Key: string }
  | { bytes: Uint8Array };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Terminal statuses for async jobs. */
const TERMINAL_STATUSES = new Set([
  "SUCCEEDED",
  "FAILED",
  "PARTIAL_SUCCESS",
]);

/**
 * Get a cached TextractClient for the given region.
 */
function textract(region?: string): TextractClient {
  return getClient(TextractClient, region);
}

/**
 * Convert a {@link DocumentInput} to the Textract Document structure.
 */
function toDocument(doc: DocumentInput): Record<string, unknown> {
  if ("bytes" in doc) {
    return { Bytes: doc.bytes };
  }
  return { S3Object: { Bucket: doc.s3Bucket, Name: doc.s3Key } };
}

/**
 * Parse raw Textract blocks into typed {@link TextractBlock} objects.
 */
function parseBlocks(
  raw: Array<Record<string, unknown>>,
): TextractBlock[] {
  return raw.map((b) =>
    TextractBlockSchema.parse({
      blockType: b["BlockType"] ?? "",
      text: b["Text"],
      confidence: b["Confidence"],
      id: b["Id"],
      relationships: Array.isArray(b["Relationships"])
        ? (b["Relationships"] as Array<Record<string, unknown>>).map(
            (r) => ({
              type: r["Type"],
              ids: r["Ids"],
            }),
          )
        : undefined,
      rowIndex: b["RowIndex"],
      columnIndex: b["ColumnIndex"],
      rowSpan: b["RowSpan"],
      columnSpan: b["ColumnSpan"],
      page: b["Page"],
    }),
  );
}

// ---------------------------------------------------------------------------
// Public API — synchronous
// ---------------------------------------------------------------------------

/**
 * Synchronously detect all text in a document (max 10 MB / 1 page for bytes).
 *
 * @param document - Document input (S3 reference or raw bytes).
 * @param region - AWS region override.
 * @returns A list of {@link TextractBlock} objects with detected text.
 */
export async function detectDocumentText(
  document: DocumentInput,
  region?: string,
): Promise<TextractBlock[]> {
  try {
    const resp = await textract(region).send(
      new DetectDocumentTextCommand({
        Document: toDocument(document),
      }),
    );
    return parseBlocks(
      (resp.Blocks ?? []) as Array<Record<string, unknown>>,
    );
  } catch (err: unknown) {
    throw wrapAwsError(err, "detectDocumentText");
  }
}

/**
 * Synchronously analyse a document for forms, tables, and/or signatures.
 *
 * @param document - Document input (S3 reference or raw bytes).
 * @param featureTypes - Analysis features to enable (`"TABLES"`, `"FORMS"`,
 *   `"SIGNATURES"`).
 * @param region - AWS region override.
 * @returns A list of {@link TextractBlock} objects.
 */
export async function analyzeDocument(
  document: DocumentInput,
  featureTypes: ("TABLES" | "FORMS" | "SIGNATURES")[] = [
    "TABLES",
    "FORMS",
  ],
  region?: string,
): Promise<TextractBlock[]> {
  try {
    const resp = await textract(region).send(
      new AnalyzeDocumentCommand({
        Document: toDocument(document),
        FeatureTypes: featureTypes,
      }),
    );
    return parseBlocks(
      (resp.Blocks ?? []) as Array<Record<string, unknown>>,
    );
  } catch (err: unknown) {
    throw wrapAwsError(err, "analyzeDocument");
  }
}

// ---------------------------------------------------------------------------
// Public API — asynchronous
// ---------------------------------------------------------------------------

/**
 * Start an asynchronous Textract text detection job for multi-page documents.
 *
 * @param s3Bucket - Source S3 bucket containing the document.
 * @param s3Key - Source S3 object key (PDF or TIFF).
 * @param snsTopicArn - Optional SNS topic ARN for completion notification.
 * @param roleArn - Optional IAM role ARN for SNS notifications.
 * @param region - AWS region override.
 * @returns The Textract job ID.
 */
export async function startDocumentTextDetection(
  s3Bucket: string,
  s3Key: string,
  snsTopicArn?: string,
  roleArn?: string,
  region?: string,
): Promise<string> {
  try {
    const input: {
      DocumentLocation: { S3Object: { Bucket: string; Name: string } };
      NotificationChannel?: { SNSTopicArn: string; RoleArn: string };
    } = {
      DocumentLocation: {
        S3Object: { Bucket: s3Bucket, Name: s3Key },
      },
    };
    if (snsTopicArn && roleArn) {
      input.NotificationChannel = {
        SNSTopicArn: snsTopicArn,
        RoleArn: roleArn,
      };
    }
    const resp = await textract(region).send(
      new StartDocumentTextDetectionCommand(input),
    );
    return resp.JobId ?? "";
  } catch (err: unknown) {
    throw wrapAwsError(
      err,
      `startDocumentTextDetection(s3://${s3Bucket}/${s3Key})`,
    );
  }
}

/**
 * Fetch the results of an asynchronous Textract text detection job.
 *
 * Handles pagination automatically.
 *
 * @param jobId - Job ID returned by {@link startDocumentTextDetection}.
 * @param region - AWS region override.
 * @returns A {@link TextractJobResult} with current status and all blocks.
 */
export async function getDocumentTextDetection(
  jobId: string,
  region?: string,
): Promise<TextractJobResult> {
  const allBlocks: TextractBlock[] = [];
  let status = "IN_PROGRESS";
  let nextToken: string | undefined;

  try {
    do {
      const resp = await textract(region).send(
        new GetDocumentTextDetectionCommand({
          JobId: jobId,
          NextToken: nextToken,
        }),
      );
      status = resp.JobStatus ?? "IN_PROGRESS";
      allBlocks.push(
        ...parseBlocks(
          (resp.Blocks ?? []) as Array<Record<string, unknown>>,
        ),
      );
      nextToken = resp.NextToken;
    } while (nextToken);
  } catch (err: unknown) {
    throw wrapAwsError(
      err,
      `getDocumentTextDetection(${jobId})`,
    );
  }

  return TextractJobResultSchema.parse({
    jobId,
    status,
    blocks: allBlocks.length > 0 ? allBlocks : undefined,
  });
}

/**
 * Poll until a Textract text detection job completes.
 *
 * @param jobId - Job ID to wait for.
 * @param timeout - Maximum milliseconds to wait (default `600000` = 10 min).
 * @param pollInterval - Milliseconds between status checks (default `5000`).
 * @param region - AWS region override.
 * @returns The final {@link TextractJobResult}.
 */
export async function waitForDocumentTextDetection(
  jobId: string,
  timeout: number = 600_000,
  pollInterval: number = 5_000,
  region?: string,
): Promise<TextractJobResult> {
  const deadline = Date.now() + timeout;

  while (true) {
    const result = await getDocumentTextDetection(jobId, region);
    if (TERMINAL_STATUSES.has(result.status)) {
      return result;
    }
    if (Date.now() >= deadline) {
      throw new AwsTimeoutError(
        `Textract job ${jobId} did not finish within ${timeout}ms`,
      );
    }
    await new Promise((resolve) => setTimeout(resolve, pollInterval));
  }
}

// ---------------------------------------------------------------------------
// Public API — high-level extractors
// ---------------------------------------------------------------------------

/**
 * Extract all raw text from a document as a single string.
 *
 * Calls {@link detectDocumentText} and joins all LINE-type blocks.
 *
 * @param document - Document input (S3 reference or raw bytes).
 * @param region - AWS region override.
 * @returns All detected text as a newline-separated string.
 */
export async function extractText(
  document: DocumentInput,
  region?: string,
): Promise<string> {
  const blocks = await detectDocumentText(document, region);
  const lines = blocks
    .filter((b) => b.blockType === "LINE" && b.text)
    .map((b) => b.text!);
  return lines.join("\n");
}

/**
 * Extract tables from a document as nested arrays.
 *
 * Each table is a list of rows; each row is a list of cell strings. Empty or
 * undetected cells are represented as empty strings.
 *
 * @param document - Document input (S3 reference or raw bytes).
 * @param region - AWS region override.
 * @returns A list of tables. Each table is `string[][]`.
 */
export async function extractTables(
  document: DocumentInput,
  region?: string,
): Promise<string[][][]> {
  const blocks = await analyzeDocument(document, ["TABLES"], region);
  const cells = blocks.filter((b) => b.blockType === "CELL");
  if (cells.length === 0) return [];

  // Group cells by page
  const pages = new Map<number, TextractBlock[]>();
  for (const cell of cells) {
    const page = cell.page ?? 1;
    if (!pages.has(page)) pages.set(page, []);
    pages.get(page)!.push(cell);
  }

  const tables: string[][][] = [];
  for (const pageCells of pages.values()) {
    const maxRow = Math.max(
      ...pageCells.map((c) => c.rowIndex ?? 0),
    );
    const maxCol = Math.max(
      ...pageCells.map((c) => c.columnIndex ?? 0),
    );
    const grid: string[][] = Array.from({ length: maxRow }, () =>
      Array.from({ length: maxCol }, () => ""),
    );
    for (const cell of pageCells) {
      const r = (cell.rowIndex ?? 1) - 1;
      const c = (cell.columnIndex ?? 1) - 1;
      if (r >= 0 && r < maxRow && c >= 0 && c < maxCol) {
        grid[r][c] = cell.text ?? "";
      }
    }
    tables.push(grid);
  }

  return tables;
}

/**
 * Extract key-value form fields from a document.
 *
 * Calls {@link analyzeDocument} with `FORMS` feature and pairs each KEY block
 * with its associated VALUE block using block relationships.
 *
 * @param document - Document input (S3 reference or raw bytes).
 * @param region - AWS region override.
 * @returns A dict mapping form field key to value (both as strings).
 */
export async function extractFormFields(
  document: DocumentInput,
  region?: string,
): Promise<Record<string, string>> {
  const blocks = await analyzeDocument(document, ["FORMS"], region);

  // Build lookup: id -> block
  const blockMap = new Map<string, TextractBlock>();
  for (const b of blocks) {
    if (b.id) blockMap.set(b.id, b);
  }

  const result: Record<string, string> = {};

  // KEY_VALUE_SET blocks with a "KEY" entity type reference VALUE blocks
  const keyBlocks = blocks.filter(
    (b) => b.blockType === "KEY_VALUE_SET",
  );

  for (const kb of keyBlocks) {
    // Collect key text from CHILD relationships
    let keyText = "";
    let valueText = "";

    if (kb.relationships) {
      for (const rel of kb.relationships) {
        if (rel.type === "CHILD" && rel.ids) {
          const words = rel.ids
            .map((id) => blockMap.get(id))
            .filter((b) => b && b.blockType === "WORD")
            .map((b) => b!.text ?? "");
          keyText = words.join(" ");
        }
        if (rel.type === "VALUE" && rel.ids) {
          // Follow to VALUE KEY_VALUE_SET, then its CHILD words
          for (const valId of rel.ids) {
            const valBlock = blockMap.get(valId);
            if (valBlock?.relationships) {
              for (const vRel of valBlock.relationships) {
                if (vRel.type === "CHILD" && vRel.ids) {
                  const words = vRel.ids
                    .map((id) => blockMap.get(id))
                    .filter((b) => b && b.blockType === "WORD")
                    .map((b) => b!.text ?? "");
                  valueText = words.join(" ");
                }
              }
            }
          }
        }
      }
    }

    if (keyText) {
      result[keyText] = valueText;
    }
  }

  return result;
}

/**
 * Extract text, tables, and form fields from a document in one call.
 *
 * Runs {@link analyzeDocument} once with all features enabled and returns
 * a combined result.
 *
 * @param document - Document input (S3 reference or raw bytes).
 * @param region - AWS region override.
 * @returns An object with `text`, `tables`, and `formFields` keys.
 */
export async function extractAll(
  document: DocumentInput,
  region?: string,
): Promise<{
  text: string;
  tables: string[][][];
  formFields: Record<string, string>;
}> {
  const blocks = await analyzeDocument(
    document,
    ["TABLES", "FORMS"],
    region,
  );

  // --- text ---
  const lines = blocks
    .filter((b) => b.blockType === "LINE" && b.text)
    .map((b) => b.text!);
  const text = lines.join("\n");

  // --- tables ---
  const cells = blocks.filter((b) => b.blockType === "CELL");
  const tables: string[][][] = [];
  if (cells.length > 0) {
    const pages = new Map<number, TextractBlock[]>();
    for (const cell of cells) {
      const page = cell.page ?? 1;
      if (!pages.has(page)) pages.set(page, []);
      pages.get(page)!.push(cell);
    }
    for (const pageCells of pages.values()) {
      const maxRow = Math.max(
        ...pageCells.map((c) => c.rowIndex ?? 0),
      );
      const maxCol = Math.max(
        ...pageCells.map((c) => c.columnIndex ?? 0),
      );
      const grid: string[][] = Array.from({ length: maxRow }, () =>
        Array.from({ length: maxCol }, () => ""),
      );
      for (const cell of pageCells) {
        const r = (cell.rowIndex ?? 1) - 1;
        const c = (cell.columnIndex ?? 1) - 1;
        if (r >= 0 && r < maxRow && c >= 0 && c < maxCol) {
          grid[r][c] = cell.text ?? "";
        }
      }
      tables.push(grid);
    }
  }

  // --- form fields ---
  const blockMap = new Map<string, TextractBlock>();
  for (const b of blocks) {
    if (b.id) blockMap.set(b.id, b);
  }
  const formFields: Record<string, string> = {};
  const keyBlocks = blocks.filter(
    (b) => b.blockType === "KEY_VALUE_SET",
  );
  for (const kb of keyBlocks) {
    let keyText = "";
    let valueText = "";
    if (kb.relationships) {
      for (const rel of kb.relationships) {
        if (rel.type === "CHILD" && rel.ids) {
          const words = rel.ids
            .map((id) => blockMap.get(id))
            .filter((b) => b && b.blockType === "WORD")
            .map((b) => b!.text ?? "");
          keyText = words.join(" ");
        }
        if (rel.type === "VALUE" && rel.ids) {
          for (const valId of rel.ids) {
            const valBlock = blockMap.get(valId);
            if (valBlock?.relationships) {
              for (const vRel of valBlock.relationships) {
                if (vRel.type === "CHILD" && vRel.ids) {
                  const words = vRel.ids
                    .map((id) => blockMap.get(id))
                    .filter((b) => b && b.blockType === "WORD")
                    .map((b) => b!.text ?? "");
                  valueText = words.join(" ");
                }
              }
            }
          }
        }
      }
    }
    if (keyText) {
      formFields[keyText] = valueText;
    }
  }

  return { text, tables, formFields };
}

// ---------------------------------------------------------------------------
// Additional types (auto-generated)
// ---------------------------------------------------------------------------

/** Result of analyze_expense. */
export type AnalyzeExpenseResult = {
  documentMetadata?: Record<string, unknown>;
  expenseDocuments?: Record<string, unknown>[];
};

/** Result of analyze_id. */
export type AnalyzeIdResult = {
  identityDocuments?: Record<string, unknown>[];
  documentMetadata?: Record<string, unknown>;
  analyzeIdModelVersion?: string | undefined;
};

/** Result of create_adapter. */
export type CreateAdapterResult = {
  adapterId?: string | undefined;
};

/** Result of create_adapter_version. */
export type CreateAdapterVersionResult = {
  adapterId?: string | undefined;
  adapterVersion?: string | undefined;
};

/** Result of get_adapter. */
export type GetAdapterResult = {
  adapterId?: string | undefined;
  adapterName?: string | undefined;
  creationTime?: string | undefined;
  description?: string | undefined;
  featureTypes?: string[];
  autoUpdate?: string | undefined;
  tags?: Record<string, unknown>;
};

/** Result of get_adapter_version. */
export type GetAdapterVersionResult = {
  adapterId?: string | undefined;
  adapterVersion?: string | undefined;
  creationTime?: string | undefined;
  featureTypes?: string[];
  status?: string | undefined;
  statusMessage?: string | undefined;
  datasetConfig?: Record<string, unknown>;
  kmsKeyId?: string | undefined;
  outputConfig?: Record<string, unknown>;
  evaluationMetrics?: Record<string, unknown>[];
  tags?: Record<string, unknown>;
};

/** Result of get_document_analysis. */
export type GetDocumentAnalysisResult = {
  documentMetadata?: Record<string, unknown>;
  jobStatus?: string | undefined;
  nextToken?: string | undefined;
  blocks?: Record<string, unknown>[];
  warnings?: Record<string, unknown>[];
  statusMessage?: string | undefined;
  analyzeDocumentModelVersion?: string | undefined;
};

/** Result of get_expense_analysis. */
export type GetExpenseAnalysisResult = {
  documentMetadata?: Record<string, unknown>;
  jobStatus?: string | undefined;
  nextToken?: string | undefined;
  expenseDocuments?: Record<string, unknown>[];
  warnings?: Record<string, unknown>[];
  statusMessage?: string | undefined;
  analyzeExpenseModelVersion?: string | undefined;
};

/** Result of get_lending_analysis. */
export type GetLendingAnalysisResult = {
  documentMetadata?: Record<string, unknown>;
  jobStatus?: string | undefined;
  nextToken?: string | undefined;
  results?: Record<string, unknown>[];
  warnings?: Record<string, unknown>[];
  statusMessage?: string | undefined;
  analyzeLendingModelVersion?: string | undefined;
};

/** Result of get_lending_analysis_summary. */
export type GetLendingAnalysisSummaryResult = {
  documentMetadata?: Record<string, unknown>;
  jobStatus?: string | undefined;
  summary?: Record<string, unknown>;
  warnings?: Record<string, unknown>[];
  statusMessage?: string | undefined;
  analyzeLendingModelVersion?: string | undefined;
};

/** Result of list_adapter_versions. */
export type ListAdapterVersionsResult = {
  adapterVersions?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_adapters. */
export type ListAdaptersResult = {
  adapters?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_tags_for_resource. */
export type ListTagsForResourceResult = {
  tags?: Record<string, unknown>;
};

/** Result of start_document_analysis. */
export type StartDocumentAnalysisResult = {
  jobId?: string | undefined;
};

/** Result of start_expense_analysis. */
export type StartExpenseAnalysisResult = {
  jobId?: string | undefined;
};

/** Result of start_lending_analysis. */
export type StartLendingAnalysisResult = {
  jobId?: string | undefined;
};

/** Result of update_adapter. */
export type UpdateAdapterResult = {
  adapterId?: string | undefined;
  adapterName?: string | undefined;
  creationTime?: string | undefined;
  description?: string | undefined;
  featureTypes?: string[];
  autoUpdate?: string | undefined;
};


// ---------------------------------------------------------------------------
// Additional functions (auto-generated)
// ---------------------------------------------------------------------------

/** Analyze expense. */
export async function analyzeExpense(document: Record<string, unknown>, regionName?: string | undefined): Promise<AnalyzeExpenseResult> {
  try {
    // TODO: implement analyze_expense
    throw new Error("analyze_expense not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "analyze_expense failed");
  }
}

/** Analyze id. */
export async function analyzeId(documentPages: Record<string, unknown>[], regionName?: string | undefined): Promise<AnalyzeIdResult> {
  try {
    // TODO: implement analyze_id
    throw new Error("analyze_id not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "analyze_id failed");
  }
}

/** Create adapter. */
export async function createAdapter(adapterName: string, featureTypes: string[]): Promise<CreateAdapterResult> {
  try {
    // TODO: implement create_adapter
    throw new Error("create_adapter not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_adapter failed");
  }
}

/** Create adapter version. */
export async function createAdapterVersion(adapterId: string, datasetConfig: Record<string, unknown>, outputConfig: Record<string, unknown>): Promise<CreateAdapterVersionResult> {
  try {
    // TODO: implement create_adapter_version
    throw new Error("create_adapter_version not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "create_adapter_version failed");
  }
}

/** Delete adapter. */
export async function deleteAdapter(adapterId: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_adapter
    throw new Error("delete_adapter not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_adapter failed");
  }
}

/** Delete adapter version. */
export async function deleteAdapterVersion(adapterId: string, adapterVersion: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_adapter_version
    throw new Error("delete_adapter_version not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_adapter_version failed");
  }
}

/** Get adapter. */
export async function getAdapter(adapterId: string, regionName?: string | undefined): Promise<GetAdapterResult> {
  try {
    // TODO: implement get_adapter
    throw new Error("get_adapter not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_adapter failed");
  }
}

/** Get adapter version. */
export async function getAdapterVersion(adapterId: string, adapterVersion: string, regionName?: string | undefined): Promise<GetAdapterVersionResult> {
  try {
    // TODO: implement get_adapter_version
    throw new Error("get_adapter_version not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_adapter_version failed");
  }
}

/** Get document analysis. */
export async function getDocumentAnalysis(jobId: string): Promise<GetDocumentAnalysisResult> {
  try {
    // TODO: implement get_document_analysis
    throw new Error("get_document_analysis not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_document_analysis failed");
  }
}

/** Get expense analysis. */
export async function getExpenseAnalysis(jobId: string): Promise<GetExpenseAnalysisResult> {
  try {
    // TODO: implement get_expense_analysis
    throw new Error("get_expense_analysis not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_expense_analysis failed");
  }
}

/** Get lending analysis. */
export async function getLendingAnalysis(jobId: string): Promise<GetLendingAnalysisResult> {
  try {
    // TODO: implement get_lending_analysis
    throw new Error("get_lending_analysis not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_lending_analysis failed");
  }
}

/** Get lending analysis summary. */
export async function getLendingAnalysisSummary(jobId: string, regionName?: string | undefined): Promise<GetLendingAnalysisSummaryResult> {
  try {
    // TODO: implement get_lending_analysis_summary
    throw new Error("get_lending_analysis_summary not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_lending_analysis_summary failed");
  }
}

/** List adapter versions. */
export async function listAdapterVersions(): Promise<ListAdapterVersionsResult> {
  try {
    // TODO: implement list_adapter_versions
    throw new Error("list_adapter_versions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_adapter_versions failed");
  }
}

/** List adapters. */
export async function listAdapters(): Promise<ListAdaptersResult> {
  try {
    // TODO: implement list_adapters
    throw new Error("list_adapters not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_adapters failed");
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

/** Start document analysis. */
export async function startDocumentAnalysis(documentLocation: Record<string, unknown>, featureTypes: string[]): Promise<StartDocumentAnalysisResult> {
  try {
    // TODO: implement start_document_analysis
    throw new Error("start_document_analysis not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_document_analysis failed");
  }
}

/** Start expense analysis. */
export async function startExpenseAnalysis(documentLocation: Record<string, unknown>): Promise<StartExpenseAnalysisResult> {
  try {
    // TODO: implement start_expense_analysis
    throw new Error("start_expense_analysis not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_expense_analysis failed");
  }
}

/** Start lending analysis. */
export async function startLendingAnalysis(documentLocation: Record<string, unknown>): Promise<StartLendingAnalysisResult> {
  try {
    // TODO: implement start_lending_analysis
    throw new Error("start_lending_analysis not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_lending_analysis failed");
  }
}

/** Tag resource. */
export async function tagResource(resourceArn: string, tags: Record<string, unknown>, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement tag_resource
    throw new Error("tag_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "tag_resource failed");
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

/** Update adapter. */
export async function updateAdapter(adapterId: string): Promise<UpdateAdapterResult> {
  try {
    // TODO: implement update_adapter
    throw new Error("update_adapter not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "update_adapter failed");
  }
}
