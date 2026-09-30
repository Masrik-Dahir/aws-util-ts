/**
 * aws-util/observability — Multi-service observability and monitoring.
 *
 * Provides typed helpers for structured logging, X-Ray tracing, EMF
 * metric emission, CloudWatch alarm creation, Log Insights queries,
 * dashboard generation, error aggregation, Synthetics canary management,
 * and X-Ray service map construction.
 *
 * Multi-service: CloudWatch + X-Ray + CloudWatch Logs + Synthetics.
 *
 * All functions obtain clients via {@link getClient} and wrap errors
 * through {@link wrapAwsError}.
 *
 * @example
 * ```ts
 * import {
 *   createStructuredLogger,
 *   createXrayTrace,
 *   emitEmfMetric,
 *   createLambdaAlarms,
 * } from "./observability.js";
 *
 * const logger = createStructuredLogger("my-service", "info");
 * logger.info("Request processed", { userId: "123" });
 *
 * const trace = await createXrayTrace("my-segment", { userId: "123" });
 * const alarms = await createLambdaAlarms("my-function", topicArn);
 * ```
 *
 * @module
 */

import { z } from "zod";
import {
  CloudWatchClient,
  PutMetricAlarmCommand,
  PutDashboardCommand,
} from "@aws-sdk/client-cloudwatch";
import {
  CloudWatchLogsClient,
  StartQueryCommand,
  GetQueryResultsCommand,
} from "@aws-sdk/client-cloudwatch-logs";
import {
  XRayClient,
  PutTraceSegmentsCommand,
  GetServiceGraphCommand,
} from "@aws-sdk/client-xray";
import {
  SyntheticsClient,
  CreateCanaryCommand,
  DeleteCanaryCommand,
} from "@aws-sdk/client-synthetics";
import { getClient } from "./client.js";
import { wrapAwsError } from "./exceptions.js";

// ---------------------------------------------------------------------------
// Zod schemas & inferred types
// ---------------------------------------------------------------------------

/** Schema for a structured log entry. */
export const StructuredLogEntrySchema = z.object({
  level: z.string(),
  message: z.string(),
  timestamp: z.string(),
  service: z.string().optional(),
  traceId: z.string().optional(),
  extra: z.record(z.string(), z.unknown()).optional(),
});

/** A structured log entry. */
export type StructuredLogEntry = z.infer<typeof StructuredLogEntrySchema>;

/** Schema for a structured logger configuration. */
export const StructuredLoggerSchema = z.object({
  serviceName: z.string(),
  logLevel: z.string(),
  traceId: z.string().optional(),
});

/** Structured logger configuration. */
export type StructuredLoggerConfig = z.infer<typeof StructuredLoggerSchema>;

/** Schema for an X-Ray trace result. */
export const TraceResultSchema = z.object({
  traceId: z.string(),
  segmentId: z.string(),
});

/** X-Ray trace result. */
export type TraceResult = z.infer<typeof TraceResultSchema>;

/** Schema for an EMF metric result. */
export const EMFMetricResultSchema = z.object({
  namespace: z.string(),
  metricName: z.string(),
  value: z.number(),
  unit: z.string(),
  dimensions: z.record(z.string(), z.string()).optional(),
});

/** EMF metric result. */
export type EMFMetricResult = z.infer<typeof EMFMetricResultSchema>;

/** Schema for an alarm factory result. */
export const AlarmFactoryResultSchema = z.object({
  alarmName: z.string(),
  alarmArn: z.string().optional(),
});

/** Alarm factory result. */
export type AlarmFactoryResult = z.infer<typeof AlarmFactoryResultSchema>;

/** Schema for a Log Insights query result. */
export const LogInsightsQueryResultSchema = z.object({
  queryId: z.string(),
  status: z.string(),
  results: z.array(z.record(z.string(), z.string())),
});

/** Log Insights query result. */
export type LogInsightsQueryResult = z.infer<
  typeof LogInsightsQueryResultSchema
>;

/** Schema for a dashboard result. */
export const DashboardResultSchema = z.object({
  dashboardName: z.string(),
  dashboardArn: z.string().optional(),
});

/** Dashboard result. */
export type DashboardResult = z.infer<typeof DashboardResultSchema>;

/** Schema for an individual error digest entry. */
export const ErrorDigestSchema = z.object({
  errorMessage: z.string(),
  count: z.number(),
  firstSeen: z.string(),
  lastSeen: z.string(),
});

/** An individual error digest entry. */
export type ErrorDigest = z.infer<typeof ErrorDigestSchema>;

/** Schema for the error aggregator result. */
export const ErrorAggregatorResultSchema = z.object({
  logGroup: z.string(),
  errors: z.array(ErrorDigestSchema),
  totalErrors: z.number(),
});

/** Error aggregator result. */
export type ErrorAggregatorResult = z.infer<
  typeof ErrorAggregatorResultSchema
>;

/** Schema for a Synthetics canary result. */
export const CanaryResultSchema = z.object({
  canaryName: z.string(),
  status: z.string(),
  canaryArn: z.string().optional(),
});

/** Synthetics canary result. */
export type CanaryResult = z.infer<typeof CanaryResultSchema>;

/** Schema for a single service map node. */
export const ServiceMapNodeSchema = z.object({
  name: z.string(),
  type: z.string(),
  edges: z.array(z.string()),
});

/** A single service map node. */
export type ServiceMapNode = z.infer<typeof ServiceMapNodeSchema>;

/** Schema for the service map result. */
export const ServiceMapResultSchema = z.object({
  nodes: z.array(ServiceMapNodeSchema),
  startTime: z.string(),
  endTime: z.string(),
});

/** Service map result. */
export type ServiceMapResult = z.infer<typeof ServiceMapResultSchema>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Get a cached CloudWatchClient for the given region.
 */
function cw(region?: string): CloudWatchClient {
  return getClient(CloudWatchClient, region);
}

/**
 * Get a cached CloudWatchLogsClient for the given region.
 */
function cwLogs(region?: string): CloudWatchLogsClient {
  return getClient(CloudWatchLogsClient, region);
}

/**
 * Get a cached XRayClient for the given region.
 */
function xray(region?: string): XRayClient {
  return getClient(XRayClient, region);
}

/**
 * Get a cached SyntheticsClient for the given region.
 */
function synthetics(region?: string): SyntheticsClient {
  return getClient(SyntheticsClient, region);
}

/**
 * Sleep for a given number of milliseconds.
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Log level numeric ordering for filtering. */
const LOG_LEVELS: Record<string, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/**
 * Generate a random hex string of the given byte length.
 */
function randomHex(bytes: number): string {
  const arr = new Uint8Array(bytes);
  if (typeof globalThis.crypto !== "undefined") {
    globalThis.crypto.getRandomValues(arr);
  } else {
    for (let i = 0; i < bytes; i++) {
      arr[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Structured logger interface with typed log methods. */
export interface StructuredLogger {
  /** Logger service name. */
  serviceName: string;
  /** Logger minimum log level. */
  logLevel: string;
  /** Optional trace ID attached to all entries. */
  traceId?: string;
  /** Log at info level. */
  info: (
    msg: string,
    extra?: Record<string, unknown>,
  ) => StructuredLogEntry;
  /** Log at warn level. */
  warn: (
    msg: string,
    extra?: Record<string, unknown>,
  ) => StructuredLogEntry;
  /** Log at error level. */
  error: (
    msg: string,
    extra?: Record<string, unknown>,
  ) => StructuredLogEntry;
  /** Log at debug level. */
  debug: (
    msg: string,
    extra?: Record<string, unknown>,
  ) => StructuredLogEntry;
}

/**
 * Create a structured logger that produces JSON log entries.
 *
 * Each log method returns a {@link StructuredLogEntry} and prints it
 * to stdout as JSON so that CloudWatch Logs can parse it automatically.
 *
 * @param serviceName - The service name to embed in every log entry.
 * @param logLevel - Minimum log level: `"debug"`, `"info"`, `"warn"`, or `"error"` (default `"info"`).
 * @param traceId - Optional X-Ray trace ID to embed in every log entry.
 * @returns A structured logger object with `info`, `warn`, `error`, and `debug` methods.
 */
export function createStructuredLogger(
  serviceName: string,
  logLevel?: string,
  traceId?: string,
): StructuredLogger {
  const minLevel = LOG_LEVELS[logLevel ?? "info"] ?? 1;

  function makeEntry(
    level: string,
    msg: string,
    extra?: Record<string, unknown>,
  ): StructuredLogEntry {
    const entry: StructuredLogEntry = {
      level,
      message: msg,
      timestamp: new Date().toISOString(),
      service: serviceName,
      traceId,
      extra,
    };
    const numeric = LOG_LEVELS[level] ?? 0;
    if (numeric >= minLevel) {
      const output = JSON.stringify(entry);
      process.stdout.write(output + "\n");
    }
    return entry;
  }

  return {
    serviceName,
    logLevel: logLevel ?? "info",
    traceId,
    info: (msg, extra) => makeEntry("info", msg, extra),
    warn: (msg, extra) => makeEntry("warn", msg, extra),
    error: (msg, extra) => makeEntry("error", msg, extra),
    debug: (msg, extra) => makeEntry("debug", msg, extra),
  };
}

/**
 * Create an X-Ray trace segment and send it to the X-Ray daemon.
 *
 * Builds a minimal X-Ray segment document with optional annotations and
 * metadata, then sends it via `PutTraceSegmentsCommand`.
 *
 * @param segmentName - The name of the trace segment.
 * @param annotations - Optional key-value annotations (indexed by X-Ray).
 * @param metadata - Optional key-value metadata (not indexed).
 * @param region - AWS region override.
 * @returns The trace result with generated trace ID and segment ID.
 */
export async function createXrayTrace(
  segmentName: string,
  annotations?: Record<string, string>,
  metadata?: Record<string, unknown>,
  region?: string,
): Promise<TraceResult> {
  const now = Date.now() / 1000;
  const traceId = `1-${Math.floor(now).toString(16)}-${randomHex(12)}`;
  const segmentId = randomHex(8);

  const segment: Record<string, unknown> = {
    name: segmentName,
    id: segmentId,
    trace_id: traceId,
    start_time: now,
    end_time: now + 0.001,
    in_progress: false,
  };

  if (annotations) {
    segment.annotations = annotations;
  }
  if (metadata) {
    segment.metadata = { default: metadata };
  }

  try {
    await xray(region).send(
      new PutTraceSegmentsCommand({
        TraceSegmentDocuments: [JSON.stringify(segment)],
      }),
    );
  } catch (err) {
    throw wrapAwsError(
      err,
      `Failed to create X-Ray trace segment ${segmentName}`,
    );
  }

  return TraceResultSchema.parse({ traceId, segmentId });
}

/**
 * Emit an Embedded Metric Format (EMF) metric to stdout.
 *
 * Produces a structured JSON document that CloudWatch Logs automatically
 * extracts as a custom metric. This is a synchronous operation — the
 * metric is printed to stdout for the CloudWatch agent to pick up.
 *
 * @param namespace - CloudWatch metric namespace.
 * @param metricName - The metric name.
 * @param value - The metric value.
 * @param unit - CloudWatch metric unit (default `"Count"`).
 * @param dimensions - Optional key-value dimensions.
 * @param region - AWS region (included in EMF metadata, but no API call is made).
 * @returns The EMF metric result.
 */
export function emitEmfMetric(
  namespace: string,
  metricName: string,
  value: number,
  unit?: string,
  dimensions?: Record<string, string>,
  region?: string,
): EMFMetricResult {
  const metricUnit = unit ?? "Count";
  const dimensionKeys = dimensions ? Object.keys(dimensions) : [];

  const emf: Record<string, unknown> = {
    _aws: {
      Timestamp: Date.now(),
      CloudWatchMetrics: [
        {
          Namespace: namespace,
          Dimensions: dimensionKeys.length > 0 ? [dimensionKeys] : [],
          Metrics: [{ Name: metricName, Unit: metricUnit }],
        },
      ],
    },
    [metricName]: value,
    ...dimensions,
  };

  if (region) {
    (emf._aws as Record<string, unknown>).Region = region;
  }

  process.stdout.write(JSON.stringify(emf) + "\n");

  return EMFMetricResultSchema.parse({
    namespace,
    metricName,
    value,
    unit: metricUnit,
    dimensions,
  });
}

/**
 * Create CloudWatch alarms for a Lambda function.
 *
 * Creates three alarms: errors, duration (P99), and throttles. Each
 * alarm optionally publishes to an SNS topic when in ALARM state.
 *
 * @param functionName - The Lambda function name.
 * @param snsTopicArn - Optional SNS topic ARN for alarm notifications.
 * @param thresholds - Optional thresholds: `{ errors?, durationMs?, throttles? }`.
 * @param region - AWS region override.
 * @returns An array of alarm factory results, one per alarm created.
 */
export async function createLambdaAlarms(
  functionName: string,
  snsTopicArn?: string,
  thresholds?: {
    errors?: number;
    durationMs?: number;
    throttles?: number;
  },
  region?: string,
): Promise<AlarmFactoryResult[]> {
  const errorThreshold = thresholds?.errors ?? 1;
  const durationThreshold = thresholds?.durationMs ?? 10000;
  const throttleThreshold = thresholds?.throttles ?? 1;

  const alarmDefs = [
    {
      suffix: "Errors",
      metricName: "Errors",
      threshold: errorThreshold,
      statistic: "Sum",
    },
    {
      suffix: "Duration-P99",
      metricName: "Duration",
      threshold: durationThreshold,
      statistic: "p99",
    },
    {
      suffix: "Throttles",
      metricName: "Throttles",
      threshold: throttleThreshold,
      statistic: "Sum",
    },
  ];

  const results: AlarmFactoryResult[] = [];

  for (const def of alarmDefs) {
    const alarmName = `${functionName}-${def.suffix}`;
    try {
      await cw(region).send(
        new PutMetricAlarmCommand({
          AlarmName: alarmName,
          Namespace: "AWS/Lambda",
          MetricName: def.metricName,
          Dimensions: [
            { Name: "FunctionName", Value: functionName },
          ],
          Statistic:
            def.statistic === "p99" ? undefined : def.statistic,
          ExtendedStatistic:
            def.statistic === "p99" ? "p99" : undefined,
          Period: 300,
          EvaluationPeriods: 1,
          Threshold: def.threshold,
          ComparisonOperator: "GreaterThanOrEqualToThreshold",
          TreatMissingData: "notBreaching",
          AlarmActions: snsTopicArn ? [snsTopicArn] : undefined,
          OKActions: snsTopicArn ? [snsTopicArn] : undefined,
        }),
      );

      results.push(
        AlarmFactoryResultSchema.parse({ alarmName }),
      );
    } catch (err) {
      throw wrapAwsError(
        err,
        `Failed to create alarm ${alarmName}`,
      );
    }
  }

  return results;
}

/**
 * Create a CloudWatch alarm for SQS dead-letter queue depth.
 *
 * @param queueName - The SQS queue name (not URL).
 * @param threshold - Message count threshold (default 100).
 * @param snsTopicArn - Optional SNS topic ARN for alarm notifications.
 * @param region - AWS region override.
 * @returns The alarm factory result.
 */
export async function createDlqDepthAlarm(
  queueName: string,
  threshold?: number,
  snsTopicArn?: string,
  region?: string,
): Promise<AlarmFactoryResult> {
  const alarmName = `${queueName}-DLQ-Depth`;
  const maxMessages = threshold ?? 100;

  try {
    await cw(region).send(
      new PutMetricAlarmCommand({
        AlarmName: alarmName,
        Namespace: "AWS/SQS",
        MetricName: "ApproximateNumberOfMessagesVisible",
        Dimensions: [{ Name: "QueueName", Value: queueName }],
        Statistic: "Maximum",
        Period: 300,
        EvaluationPeriods: 1,
        Threshold: maxMessages,
        ComparisonOperator: "GreaterThanOrEqualToThreshold",
        TreatMissingData: "notBreaching",
        AlarmActions: snsTopicArn ? [snsTopicArn] : undefined,
        OKActions: snsTopicArn ? [snsTopicArn] : undefined,
      }),
    );
  } catch (err) {
    throw wrapAwsError(
      err,
      `Failed to create DLQ depth alarm for ${queueName}`,
    );
  }

  return AlarmFactoryResultSchema.parse({ alarmName });
}

/**
 * Run a CloudWatch Logs Insights query and wait for results.
 *
 * Starts the query and polls until the query completes or fails, then
 * returns the parsed results.
 *
 * @param logGroupName - The log group name to query.
 * @param query - The Logs Insights query string.
 * @param startTime - Start time as epoch seconds.
 * @param endTime - End time as epoch seconds.
 * @param limit - Maximum number of results (default 100).
 * @param region - AWS region override.
 * @returns The query result with status and result records.
 */
export async function runLogInsightsQuery(
  logGroupName: string,
  query: string,
  startTime: number,
  endTime: number,
  limit?: number,
  region?: string,
): Promise<LogInsightsQueryResult> {
  let queryId: string;
  try {
    const resp = await cwLogs(region).send(
      new StartQueryCommand({
        logGroupName,
        queryString: query,
        startTime,
        endTime,
        limit: limit ?? 100,
      }),
    );
    queryId = resp.queryId ?? "";
  } catch (err) {
    throw wrapAwsError(
      err,
      `Failed to start Log Insights query on ${logGroupName}`,
    );
  }

  // Poll for completion
  const maxAttempts = 60;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await sleep(1000);

    try {
      const resp = await cwLogs(region).send(
        new GetQueryResultsCommand({ queryId }),
      );

      const status = resp.status ?? "Unknown";
      if (
        status === "Complete" ||
        status === "Failed" ||
        status === "Cancelled"
      ) {
        const results = (resp.results ?? []).map((row) => {
          const record: Record<string, string> = {};
          for (const field of row) {
            if (field.field && field.value !== undefined) {
              record[field.field] = field.value;
            }
          }
          return record;
        });

        return LogInsightsQueryResultSchema.parse({
          queryId,
          status,
          results,
        });
      }
    } catch (err) {
      throw wrapAwsError(
        err,
        `Failed to get Log Insights query results for ${queryId}`,
      );
    }
  }

  return LogInsightsQueryResultSchema.parse({
    queryId,
    status: "Timeout",
    results: [],
  });
}

/**
 * Generate a CloudWatch dashboard for one or more Lambda functions.
 *
 * Creates a dashboard with widgets for invocations, errors, duration,
 * and throttles metrics for each function.
 *
 * @param functionNames - Array of Lambda function names.
 * @param dashboardName - The dashboard name to create or update.
 * @param region - AWS region override.
 * @returns The dashboard result with name and ARN.
 */
export async function generateLambdaDashboard(
  functionNames: string[],
  dashboardName: string,
  region?: string,
): Promise<DashboardResult> {
  const widgets: unknown[] = [];
  const metrics = ["Invocations", "Errors", "Duration", "Throttles"];

  for (let i = 0; i < metrics.length; i++) {
    const metricWidgets = functionNames.map((fn) => [
      "AWS/Lambda",
      metrics[i],
      "FunctionName",
      fn,
    ]);

    widgets.push({
      type: "metric",
      x: 0,
      y: i * 6,
      width: 24,
      height: 6,
      properties: {
        title: metrics[i],
        metrics: metricWidgets,
        period: 300,
        stat: metrics[i] === "Duration" ? "p99" : "Sum",
        region: region ?? "",
      },
    });
  }

  const dashboardBody = JSON.stringify({ widgets });

  try {
    await cw(region).send(
      new PutDashboardCommand({
        DashboardName: dashboardName,
        DashboardBody: dashboardBody,
      }),
    );

    return DashboardResultSchema.parse({
      dashboardName,
      dashboardArn: undefined,
    });
  } catch (err) {
    throw wrapAwsError(
      err,
      `Failed to create dashboard ${dashboardName}`,
    );
  }
}

/**
 * Aggregate errors from CloudWatch Logs using a Logs Insights query.
 *
 * Runs a query that groups log entries containing "ERROR" by message,
 * counting occurrences and tracking first/last seen timestamps.
 *
 * @param logGroupName - The log group to search.
 * @param startTime - Start time as epoch seconds.
 * @param endTime - End time as epoch seconds.
 * @param region - AWS region override.
 * @returns The aggregation result with error digests and total count.
 */
export async function aggregateErrors(
  logGroupName: string,
  startTime: number,
  endTime: number,
  region?: string,
): Promise<ErrorAggregatorResult> {
  const query = `
    filter @message like /ERROR/
    | stats count(*) as count,
            min(@timestamp) as firstSeen,
            max(@timestamp) as lastSeen
      by @message
    | sort count desc
    | limit 50
  `.trim();

  const queryResult = await runLogInsightsQuery(
    logGroupName,
    query,
    startTime,
    endTime,
    50,
    region,
  );

  const errors: ErrorDigest[] = queryResult.results.map((row) =>
    ErrorDigestSchema.parse({
      errorMessage: row["@message"] ?? "Unknown",
      count: parseInt(row.count ?? "0", 10),
      firstSeen: row.firstSeen ?? "",
      lastSeen: row.lastSeen ?? "",
    }),
  );

  const totalErrors = errors.reduce((sum, e) => sum + e.count, 0);

  return ErrorAggregatorResultSchema.parse({
    logGroup: logGroupName,
    errors,
    totalErrors,
  });
}

/**
 * Create a CloudWatch Synthetics canary.
 *
 * Creates a canary using the Synthetics API with the specified S3
 * artifact location, handler, and schedule.
 *
 * @param canaryName - The canary name.
 * @param s3Bucket - S3 bucket for canary artifacts.
 * @param s3Key - S3 key for the canary script ZIP.
 * @param handler - The canary handler function (e.g. `"index.handler"`).
 * @param scheduleExpression - CloudWatch Events schedule expression (e.g. `"rate(5 minutes)"`).
 * @param runtimeVersion - Synthetics runtime version (default `"syn-nodejs-puppeteer-6.2"`).
 * @param region - AWS region override.
 * @returns The canary result with name, status, and ARN.
 */
export async function createCanary(
  canaryName: string,
  s3Bucket: string,
  s3Key: string,
  handler: string,
  scheduleExpression: string,
  runtimeVersion?: string,
  region?: string,
): Promise<CanaryResult> {
  const runtime = runtimeVersion ?? "syn-nodejs-puppeteer-6.2";

  try {
    const resp = await synthetics(region).send(
      new CreateCanaryCommand({
        Name: canaryName,
        Code: {
          S3Bucket: s3Bucket,
          S3Key: s3Key,
          Handler: handler,
        },
        ArtifactS3Location: `s3://${s3Bucket}/canary-artifacts/${canaryName}`,
        ExecutionRoleArn: "", // Must be provided by caller in real usage
        Schedule: { Expression: scheduleExpression },
        RuntimeVersion: runtime,
      }),
    );

    return CanaryResultSchema.parse({
      canaryName,
      status: resp.Canary?.Status?.State ?? "CREATING",
      canaryArn: resp.Canary?.Id,
    });
  } catch (err) {
    throw wrapAwsError(
      err,
      `Failed to create canary ${canaryName}`,
    );
  }
}

/**
 * Delete a CloudWatch Synthetics canary.
 *
 * @param canaryName - The canary name to delete.
 * @param region - AWS region override.
 */
export async function deleteCanary(
  canaryName: string,
  region?: string,
): Promise<void> {
  try {
    await synthetics(region).send(
      new DeleteCanaryCommand({ Name: canaryName }),
    );
  } catch (err) {
    throw wrapAwsError(
      err,
      `Failed to delete canary ${canaryName}`,
    );
  }
}

/**
 * Build a service map from X-Ray trace data.
 *
 * Calls the X-Ray `GetServiceGraph` API and transforms the result into
 * a simplified list of service nodes with their edges.
 *
 * @param startTime - Start time as a Date or ISO string.
 * @param endTime - End time as a Date or ISO string.
 * @param region - AWS region override.
 * @returns The service map result with nodes and time range.
 */
export async function buildServiceMap(
  startTime: Date | string,
  endTime: Date | string,
  region?: string,
): Promise<ServiceMapResult> {
  const start =
    typeof startTime === "string" ? new Date(startTime) : startTime;
  const end =
    typeof endTime === "string" ? new Date(endTime) : endTime;

  try {
    const resp = await xray(region).send(
      new GetServiceGraphCommand({
        StartTime: start,
        EndTime: end,
      }),
    );

    const nodes: ServiceMapNode[] = (resp.Services ?? []).map(
      (svc) => {
        const edges = (svc.Edges ?? [])
          .map((e) => e.ReferenceId?.toString() ?? "")
          .filter(Boolean);

        return ServiceMapNodeSchema.parse({
          name: svc.Name ?? "Unknown",
          type: svc.Type ?? "Unknown",
          edges,
        });
      },
    );

    return ServiceMapResultSchema.parse({
      nodes,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
    });
  } catch (err) {
    throw wrapAwsError(err, "Failed to build service map from X-Ray");
  }
}

// ---------------------------------------------------------------------------
// Additional functions (auto-generated)
// ---------------------------------------------------------------------------

/** Send multiple X-Ray trace segment documents in a single call. */
export async function batchPutTraceSegments(segments: Record<string, unknown>[], regionName?: string | undefined): Promise<TraceResult[]> {
  try {
    // TODO: implement batch_put_trace_segments
    throw new Error("batch_put_trace_segments not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "batch_put_trace_segments failed");
  }
}

/** Emit multiple EMF metrics in a single structured log line. */
export async function emitEmfMetricsBatch(namespace: string, metrics: Record<string, unknown>[], dimensions?: Record<string, unknown>): Promise<EMFMetricResult[]> {
  try {
    // TODO: implement emit_emf_metrics_batch
    throw new Error("emit_emf_metrics_batch not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "emit_emf_metrics_batch failed");
  }
}

/** Retrieve X-Ray trace summaries for a time range. */
export async function getTraceSummaries(startTime: number, endTime: number, filterExpression: string, regionName?: string | undefined): Promise<Record<string, unknown>[]> {
  try {
    // TODO: implement get_trace_summaries
    throw new Error("get_trace_summaries not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_trace_summaries failed");
  }
}

// ---------------------------------------------------------------------------
// Extended observability schemas
// ---------------------------------------------------------------------------

/** Schema for a Kinesis Analytics alarm manager result. */
export const KinesisAnalyticsAlarmManagerResultSchema = z.object({
  applicationName: z.string(),
  alarmsCreated: z.number(),
  alarmNames: z.array(z.string()),
});
/** Kinesis Analytics alarm manager result. */
export type KinesisAnalyticsAlarmManagerResult = z.infer<typeof KinesisAnalyticsAlarmManagerResultSchema>;

/** Schema for a DMS task monitor result. */
export const DmsTaskMonitorResultSchema = z.object({
  replicationTaskArn: z.string(),
  status: z.string(),
  tablesLoaded: z.number(),
  tablesLoading: z.number(),
  tablesErrored: z.number(),
  alertSent: z.boolean(),
});
/** DMS task monitor result. */
export type DmsTaskMonitorResult = z.infer<typeof DmsTaskMonitorResultSchema>;

/** Schema for a Health event to Teams result. */
export const HealthEventToTeamsResultSchema = z.object({
  eventArn: z.string(),
  service: z.string(),
  statusCode: z.string(),
  webhookSent: z.boolean(),
  affectedResources: z.number(),
});
/** Health event to Teams result. */
export type HealthEventToTeamsResult = z.infer<typeof HealthEventToTeamsResultSchema>;

/** Schema for a Service Quota monitor result. */
export const ServiceQuotaMonitorResultSchema = z.object({
  serviceCode: z.string(),
  quotasChecked: z.number(),
  quotasBreaching: z.array(z.object({
    quotaName: z.string(),
    quotaCode: z.string(),
    usagePercent: z.number();
    limit: z.number();
    used: z.number();
  })),
  alertSent: z.boolean(),
});
/** Service Quota monitor result. */
export type ServiceQuotaMonitorResult = z.infer<typeof ServiceQuotaMonitorResultSchema>;

// ---------------------------------------------------------------------------
// Extended observability functions
// ---------------------------------------------------------------------------

/** Create CloudWatch alarms for Kinesis Data Analytics application metrics. */
export async function kinesisAnalyticsAlarmManager(
  applicationName: string,
  snsTopicArn?: string,
  thresholds?: { millisBehindLatest?: number; downtime?: number; kpusThreshold?: number },
  region?: string,
): Promise<KinesisAnalyticsAlarmManagerResult> {
  const client = cw(region);
  try {
    // TODO: implement kinesisAnalyticsAlarmManager
    throw new Error("kinesisAnalyticsAlarmManager not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "kinesisAnalyticsAlarmManager failed");
  }
}

/** Monitor a DMS replication task and alert on errors or lag. */
export async function dmsTaskMonitor(
  replicationTaskArn: string,
  lagThresholdSeconds?: number,
  snsTopicArn?: string,
  region?: string,
): Promise<DmsTaskMonitorResult> {
  const client = cw(region);
  try {
    // TODO: implement dmsTaskMonitor
    throw new Error("dmsTaskMonitor not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "dmsTaskMonitor failed");
  }
}

/** Forward AWS Health events to a Microsoft Teams channel via webhook. */
export async function healthEventToTeams(
  eventArn: string,
  teamsWebhookUrl: string,
  region?: string,
): Promise<HealthEventToTeamsResult> {
  const client = cw(region);
  try {
    // TODO: implement healthEventToTeams
    throw new Error("healthEventToTeams not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "healthEventToTeams failed");
  }
}

/** Monitor Service Quota usage and alert when utilization exceeds a threshold. */
export async function serviceQuotaMonitor(
  serviceCode: string,
  usageThresholdPercent?: number,
  snsTopicArn?: string,
  region?: string,
): Promise<ServiceQuotaMonitorResult> {
  const client = cw(region);
  try {
    // TODO: implement serviceQuotaMonitor
    throw new Error("serviceQuotaMonitor not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "serviceQuotaMonitor failed");
  }
}
