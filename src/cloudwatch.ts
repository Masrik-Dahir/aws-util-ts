/**
 * aws-util/cloudwatch — High-level Amazon CloudWatch and CloudWatch Logs utilities.
 *
 * Provides typed helpers for publishing metrics, creating alarms, and
 * managing log groups/streams including real-time tailing.
 *
 * All functions obtain clients via {@link getClient} and wrap errors
 * through {@link wrapAwsError}.
 *
 * @example
 * ```ts
 * import { putMetric, createLogGroup, putLogEvents } from "./cloudwatch.js";
 *
 * await putMetric("MyApp", "RequestCount", 1, "Count");
 * await createLogGroup("/my-app/prod", 30);
 * ```
 *
 * @module
 */

import { z } from "zod";
import {
  CloudWatchClient,
  PutMetricDataCommand,
  GetMetricStatisticsCommand,
  PutMetricAlarmCommand,
} from "@aws-sdk/client-cloudwatch";
import {
  CloudWatchLogsClient,
  CreateLogGroupCommand,
  PutRetentionPolicyCommand,
  CreateLogStreamCommand,
  PutLogEventsCommand,
  GetLogEventsCommand,
} from "@aws-sdk/client-cloudwatch-logs";
import { getClient } from "./client.js";
import { wrapAwsError } from "./exceptions.js";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/**
 * All valid CloudWatch metric unit strings.
 *
 * @see https://docs.aws.amazon.com/AmazonCloudWatch/latest/APIReference/API_MetricDatum.html
 */
export const VALID_CLOUDWATCH_UNITS = [
  "Seconds",
  "Microseconds",
  "Milliseconds",
  "Bytes",
  "Kilobytes",
  "Megabytes",
  "Gigabytes",
  "Terabytes",
  "Bits",
  "Kilobits",
  "Megabits",
  "Gigabits",
  "Terabits",
  "Percent",
  "Count",
  "Bytes/Second",
  "Kilobytes/Second",
  "Megabytes/Second",
  "Gigabytes/Second",
  "Terabytes/Second",
  "Bits/Second",
  "Kilobits/Second",
  "Megabits/Second",
  "Gigabits/Second",
  "Terabits/Second",
  "Count/Second",
  "None",
] as const;

// ---------------------------------------------------------------------------
// Zod schemas & inferred types
// ---------------------------------------------------------------------------

/** Schema for a CloudWatch metric dimension. */
export const MetricDimensionSchema = z.object({
  name: z.string(),
  value: z.string(),
});

/** A CloudWatch metric dimension. */
export type MetricDimension = z.infer<typeof MetricDimensionSchema>;

/** Schema for a CloudWatch metric datum. */
export const MetricDatumSchema = z.object({
  namespace: z.string(),
  metricName: z.string(),
  value: z.number(),
  unit: z.string().default("None"),
  dimensions: z.array(MetricDimensionSchema).default([]),
  timestamp: z.date().optional(),
});

/** A CloudWatch metric datum. */
export type MetricDatum = z.infer<typeof MetricDatumSchema>;

/** Schema for a CloudWatch Logs log event. */
export const LogEventSchema = z.object({
  timestamp: z.number(),
  message: z.string(),
});

/** A CloudWatch Logs log event. */
export type LogEvent = z.infer<typeof LogEventSchema>;

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
 * Sleep for the given number of milliseconds.
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// Metrics
// ---------------------------------------------------------------------------

/**
 * Publish a single metric data point to CloudWatch.
 *
 * @param namespace - The CloudWatch namespace (e.g. `"MyApp"`).
 * @param metricName - The metric name.
 * @param value - The metric value.
 * @param unit - The metric unit (default `"None"`).
 * @param dimensions - Optional array of dimensions.
 * @param region - AWS region override.
 */
export async function putMetric(
  namespace: string,
  metricName: string,
  value: number,
  unit: string = "None",
  dimensions: MetricDimension[] = [],
  region?: string,
): Promise<void> {
  try {
    await cw(region).send(
      new PutMetricDataCommand({
        Namespace: namespace,
        MetricData: [
          {
            MetricName: metricName,
            Value: value,
            Unit: unit,
            Dimensions: dimensions.map((d) => ({
              Name: d.name,
              Value: d.value,
            })),
            Timestamp: new Date(),
          },
        ],
      }),
    );
  } catch (err) {
    throw wrapAwsError(err, `putMetric ${namespace}/${metricName}`);
  }
}

/**
 * Publish multiple metric data points to CloudWatch in batches of 20.
 *
 * CloudWatch accepts a maximum of 20 metric data points per
 * PutMetricData request. This function automatically chunks the input.
 *
 * @param metrics - Array of metric data points.
 * @param region - AWS region override.
 */
export async function putMetrics(
  metrics: MetricDatum[],
  region?: string,
): Promise<void> {
  // Group metrics by namespace for correct batching
  const byNamespace = new Map<string, MetricDatum[]>();
  for (const m of metrics) {
    const parsed = MetricDatumSchema.parse(m);
    const existing = byNamespace.get(parsed.namespace);
    if (existing) {
      existing.push(parsed);
    } else {
      byNamespace.set(parsed.namespace, [parsed]);
    }
  }

  try {
    for (const [namespace, nsMetrics] of byNamespace) {
      // Chunk by 20 (CloudWatch API limit)
      for (let i = 0; i < nsMetrics.length; i += 20) {
        const chunk = nsMetrics.slice(i, i + 20);
        await cw(region).send(
          new PutMetricDataCommand({
            Namespace: namespace,
            MetricData: chunk.map((m) => ({
              MetricName: m.metricName,
              Value: m.value,
              Unit: m.unit,
              Dimensions: m.dimensions.map((d) => ({
                Name: d.name,
                Value: d.value,
              })),
              Timestamp: m.timestamp ?? new Date(),
            })),
          }),
        );
      }
    }
  } catch (err) {
    throw wrapAwsError(err, "putMetrics");
  }
}

/**
 * Retrieve metric statistics from CloudWatch.
 *
 * @param namespace - The CloudWatch namespace.
 * @param metricName - The metric name.
 * @param startTime - Start of the time range.
 * @param endTime - End of the time range.
 * @param period - The granularity in seconds.
 * @param statistics - Array of statistic names (e.g. `["Average", "Sum"]`).
 * @param dimensions - Optional dimension filter.
 * @param region - AWS region override.
 * @returns Sorted array of `{ timestamp, value }` data points.
 */
export async function getMetricStatistics(
  namespace: string,
  metricName: string,
  startTime: Date,
  endTime: Date,
  period: number,
  statistics: string[],
  dimensions: MetricDimension[] = [],
  region?: string,
): Promise<Array<{ timestamp: Date; value: number }>> {
  try {
    const resp = await cw(region).send(
      new GetMetricStatisticsCommand({
        Namespace: namespace,
        MetricName: metricName,
        StartTime: startTime,
        EndTime: endTime,
        Period: period,
        Statistics: statistics,
        Dimensions: dimensions.map((d) => ({
          Name: d.name,
          Value: d.value,
        })),
      }),
    );

    const datapoints = (resp.Datapoints ?? []).map((dp) => {
      // Pick the first available statistic value
      const value =
        dp.Average ??
        dp.Sum ??
        dp.Minimum ??
        dp.Maximum ??
        dp.SampleCount ??
        0;
      return {
        timestamp: dp.Timestamp ?? new Date(),
        value,
      };
    });

    // Sort by timestamp ascending
    datapoints.sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
    );

    return datapoints;
  } catch (err) {
    throw wrapAwsError(
      err,
      `getMetricStatistics ${namespace}/${metricName}`,
    );
  }
}

/**
 * Create a CloudWatch metric alarm.
 *
 * @param alarmName - Name for the alarm.
 * @param namespace - The CloudWatch namespace.
 * @param metricName - The metric to alarm on.
 * @param threshold - The threshold value.
 * @param comparisonOperator - Comparison operator (e.g. `"GreaterThanThreshold"`).
 * @param period - Evaluation period in seconds (default 300).
 * @param evaluationPeriods - Number of periods to evaluate (default 1).
 * @param statistic - The statistic to apply (default `"Average"`).
 * @param alarmActions - Optional list of ARNs to notify.
 * @param region - AWS region override.
 */
export async function createAlarm(
  alarmName: string,
  namespace: string,
  metricName: string,
  threshold: number,
  comparisonOperator: string,
  period: number = 300,
  evaluationPeriods: number = 1,
  statistic: string = "Average",
  alarmActions: string[] = [],
  region?: string,
): Promise<void> {
  try {
    await cw(region).send(
      new PutMetricAlarmCommand({
        AlarmName: alarmName,
        Namespace: namespace,
        MetricName: metricName,
        Threshold: threshold,
        ComparisonOperator: comparisonOperator,
        Period: period,
        EvaluationPeriods: evaluationPeriods,
        Statistic: statistic,
        AlarmActions: alarmActions.length > 0 ? alarmActions : undefined,
      }),
    );
  } catch (err) {
    throw wrapAwsError(err, `createAlarm ${alarmName}`);
  }
}

// ---------------------------------------------------------------------------
// Logs — group and stream management
// ---------------------------------------------------------------------------

/**
 * Create a CloudWatch Logs log group, optionally setting a retention policy.
 *
 * If `retentionDays` is provided, a retention policy is set immediately
 * after group creation.
 *
 * @param logGroupName - The log group name.
 * @param retentionDays - Optional retention period in days.
 * @param region - AWS region override.
 */
export async function createLogGroup(
  logGroupName: string,
  retentionDays?: number,
  region?: string,
): Promise<void> {
  try {
    await cwLogs(region).send(
      new CreateLogGroupCommand({ logGroupName }),
    );

    if (retentionDays !== undefined) {
      await cwLogs(region).send(
        new PutRetentionPolicyCommand({
          logGroupName,
          retentionInDays: retentionDays,
        }),
      );
    }
  } catch (err) {
    throw wrapAwsError(err, `createLogGroup ${logGroupName}`);
  }
}

/**
 * Create a CloudWatch Logs log stream within an existing log group.
 *
 * @param logGroupName - The parent log group name.
 * @param logStreamName - The log stream name.
 * @param region - AWS region override.
 */
export async function createLogStream(
  logGroupName: string,
  logStreamName: string,
  region?: string,
): Promise<void> {
  try {
    await cwLogs(region).send(
      new CreateLogStreamCommand({ logGroupName, logStreamName }),
    );
  } catch (err) {
    throw wrapAwsError(
      err,
      `createLogStream ${logGroupName}/${logStreamName}`,
    );
  }
}

// ---------------------------------------------------------------------------
// Logs — put and get events
// ---------------------------------------------------------------------------

/**
 * Write log events to a CloudWatch Logs stream.
 *
 * @param logGroupName - The log group name.
 * @param logStreamName - The log stream name.
 * @param events - Array of log events to write.
 * @param sequenceToken - Optional sequence token for the next expected write.
 * @param region - AWS region override.
 * @returns The next sequence token, or `undefined`.
 */
export async function putLogEvents(
  logGroupName: string,
  logStreamName: string,
  events: LogEvent[],
  sequenceToken?: string,
  region?: string,
): Promise<string | undefined> {
  try {
    const resp = await cwLogs(region).send(
      new PutLogEventsCommand({
        logGroupName,
        logStreamName,
        logEvents: events.map((e) => ({
          timestamp: e.timestamp,
          message: e.message,
        })),
        sequenceToken,
      }),
    );
    return resp.nextSequenceToken;
  } catch (err) {
    throw wrapAwsError(
      err,
      `putLogEvents ${logGroupName}/${logStreamName}`,
    );
  }
}

/**
 * Retrieve log events from a CloudWatch Logs stream.
 *
 * @param logGroupName - The log group name.
 * @param logStreamName - The log stream name.
 * @param startTime - Optional start timestamp (epoch ms).
 * @param endTime - Optional end timestamp (epoch ms).
 * @param limit - Maximum number of events to return (default 10000).
 * @param region - AWS region override.
 * @returns Array of log events.
 */
export async function getLogEvents(
  logGroupName: string,
  logStreamName: string,
  startTime?: number,
  endTime?: number,
  limit: number = 10000,
  region?: string,
): Promise<LogEvent[]> {
  try {
    const resp = await cwLogs(region).send(
      new GetLogEventsCommand({
        logGroupName,
        logStreamName,
        startTime,
        endTime,
        limit,
        startFromHead: true,
      }),
    );

    return (resp.events ?? []).map((e) =>
      LogEventSchema.parse({
        timestamp: e.timestamp ?? 0,
        message: e.message ?? "",
      }),
    );
  } catch (err) {
    throw wrapAwsError(
      err,
      `getLogEvents ${logGroupName}/${logStreamName}`,
    );
  }
}

// ---------------------------------------------------------------------------
// Logs — tail (poll-based)
// ---------------------------------------------------------------------------

/**
 * Tail a CloudWatch Logs stream by polling for new events.
 *
 * Yields log events as they arrive, polling at the specified interval.
 * The generator runs for `duration` milliseconds, then stops.
 *
 * @param logGroupName - The log group name.
 * @param logStreamName - The log stream name.
 * @param duration - How long to tail in milliseconds (default 60000).
 * @param pollInterval - Polling interval in milliseconds (default 2000).
 * @param region - AWS region override.
 * @yields Log events as they arrive.
 */
export async function* tailLogStream(
  logGroupName: string,
  logStreamName: string,
  duration: number = 60000,
  pollInterval: number = 2000,
  region?: string,
): AsyncGenerator<LogEvent> {
  const client = cwLogs(region);
  const endAt = Date.now() + duration;
  let nextForwardToken: string | undefined;

  while (Date.now() < endAt) {
    try {
      const resp = await client.send(
        new GetLogEventsCommand({
          logGroupName,
          logStreamName,
          startFromHead: true,
          nextToken: nextForwardToken,
        }),
      );

      const events = resp.events ?? [];
      for (const e of events) {
        yield LogEventSchema.parse({
          timestamp: e.timestamp ?? 0,
          message: e.message ?? "",
        });
      }

      // When the token is unchanged and no events were returned, we are
      // caught up — wait before polling again.
      const newToken = resp.nextForwardToken;
      if (newToken === nextForwardToken && events.length === 0) {
        const remaining = endAt - Date.now();
        if (remaining > 0) {
          await sleep(Math.min(pollInterval, remaining));
        }
      }
      nextForwardToken = newToken;
    } catch (err) {
      throw wrapAwsError(
        err,
        `tailLogStream ${logGroupName}/${logStreamName}`,
      );
    }
  }
}

// ---------------------------------------------------------------------------
// Additional types (auto-generated)
// ---------------------------------------------------------------------------

/** Result of delete_insight_rules. */
export type DeleteInsightRulesResult = {
  failures?: Record<string, unknown>[];
};

/** Result of describe_alarm_contributors. */
export type DescribeAlarmContributorsResult = {
  alarmContributors?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_alarm_history. */
export type DescribeAlarmHistoryResult = {
  alarmHistoryItems?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_alarms. */
export type DescribeAlarmsResult = {
  compositeAlarms?: Record<string, unknown>[];
  metricAlarms?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_alarms_for_metric. */
export type DescribeAlarmsForMetricResult = {
  metricAlarms?: Record<string, unknown>[];
};

/** Result of describe_anomaly_detectors. */
export type DescribeAnomalyDetectorsResult = {
  anomalyDetectors?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of describe_insight_rules. */
export type DescribeInsightRulesResult = {
  nextToken?: string | undefined;
  insightRules?: Record<string, unknown>[];
};

/** Result of disable_insight_rules. */
export type DisableInsightRulesResult = {
  failures?: Record<string, unknown>[];
};

/** Result of enable_insight_rules. */
export type EnableInsightRulesResult = {
  failures?: Record<string, unknown>[];
};

/** Result of get_dashboard. */
export type GetDashboardResult = {
  dashboardArn?: string | undefined;
  dashboardBody?: string | undefined;
  dashboardName?: string | undefined;
};

/** Result of get_insight_rule_report. */
export type GetInsightRuleReportResult = {
  keyLabels?: string[];
  aggregationStatistic?: string | undefined;
  aggregateValue?: number | undefined;
  approximateUniqueCount?: number | undefined;
  contributors?: Record<string, unknown>[];
  metricDatapoints?: Record<string, unknown>[];
};

/** Result of get_metric_data. */
export type GetMetricDataResult = {
  metricDataResults?: Record<string, unknown>[];
  nextToken?: string | undefined;
  messages?: Record<string, unknown>[];
};

/** Result of get_metric_stream. */
export type GetMetricStreamResult = {
  arn?: string | undefined;
  name?: string | undefined;
  includeFilters?: Record<string, unknown>[];
  excludeFilters?: Record<string, unknown>[];
  firehoseArn?: string | undefined;
  roleArn?: string | undefined;
  state?: string | undefined;
  creationDate?: string | undefined;
  lastUpdateDate?: string | undefined;
  outputFormat?: string | undefined;
  statisticsConfigurations?: Record<string, unknown>[];
  includeLinkedAccountsMetrics?: boolean | undefined;
};

/** Result of get_metric_widget_image. */
export type GetMetricWidgetImageResult = {
  metricWidgetImage?: Uint8Array | undefined;
};

/** Result of list_dashboards. */
export type ListDashboardsResult = {
  dashboardEntries?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_managed_insight_rules. */
export type ListManagedInsightRulesResult = {
  managedRules?: Record<string, unknown>[];
  nextToken?: string | undefined;
};

/** Result of list_metric_streams. */
export type ListMetricStreamsResult = {
  nextToken?: string | undefined;
  entries?: Record<string, unknown>[];
};

/** Result of list_metrics. */
export type ListMetricsResult = {
  metrics?: Record<string, unknown>[];
  nextToken?: string | undefined;
  owningAccounts?: string[];
};

/** Result of list_tags_for_resource. */
export type ListTagsForResourceResult = {
  tags?: Record<string, unknown>[];
};

/** Result of put_dashboard. */
export type PutDashboardResult = {
  dashboardValidationMessages?: Record<string, unknown>[];
};

/** Result of put_managed_insight_rules. */
export type PutManagedInsightRulesResult = {
  failures?: Record<string, unknown>[];
};

/** Result of put_metric_stream. */
export type PutMetricStreamResult = {
  arn?: string | undefined;
};


// ---------------------------------------------------------------------------
// Additional functions (auto-generated)
// ---------------------------------------------------------------------------

/** Tail a CloudWatch Logs stream and yield new log events as they arrive. */
export async function tailLogStream(logGroupName: string, logStreamName: string, pollInterval: number, durationSeconds: number, regionName?: string | undefined): Promise<Generator[LogEvent, None, None]> {
  try {
    // TODO: implement tail_log_stream
    throw new Error("tail_log_stream not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "tail_log_stream failed");
  }
}

/** Delete alarms. */
export async function deleteAlarms(alarmNames: string[], regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_alarms
    throw new Error("delete_alarms not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_alarms failed");
  }
}

/** Delete anomaly detector. */
export async function deleteAnomalyDetector(): Promise<void> {
  try {
    // TODO: implement delete_anomaly_detector
    throw new Error("delete_anomaly_detector not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_anomaly_detector failed");
  }
}

/** Delete dashboards. */
export async function deleteDashboards(dashboardNames: string[], regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_dashboards
    throw new Error("delete_dashboards not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_dashboards failed");
  }
}

/** Delete insight rules. */
export async function deleteInsightRules(ruleNames: string[], regionName?: string | undefined): Promise<DeleteInsightRulesResult> {
  try {
    // TODO: implement delete_insight_rules
    throw new Error("delete_insight_rules not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_insight_rules failed");
  }
}

/** Delete metric stream. */
export async function deleteMetricStream(name: string, regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement delete_metric_stream
    throw new Error("delete_metric_stream not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "delete_metric_stream failed");
  }
}

/** Describe alarm contributors. */
export async function describeAlarmContributors(alarmName: string): Promise<DescribeAlarmContributorsResult> {
  try {
    // TODO: implement describe_alarm_contributors
    throw new Error("describe_alarm_contributors not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_alarm_contributors failed");
  }
}

/** Describe alarm history. */
export async function describeAlarmHistory(): Promise<DescribeAlarmHistoryResult> {
  try {
    // TODO: implement describe_alarm_history
    throw new Error("describe_alarm_history not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_alarm_history failed");
  }
}

/** Describe alarms. */
export async function describeAlarms(): Promise<DescribeAlarmsResult> {
  try {
    // TODO: implement describe_alarms
    throw new Error("describe_alarms not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_alarms failed");
  }
}

/** Describe alarms for metric. */
export async function describeAlarmsForMetric(metricName: string, namespace: string): Promise<DescribeAlarmsForMetricResult> {
  try {
    // TODO: implement describe_alarms_for_metric
    throw new Error("describe_alarms_for_metric not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_alarms_for_metric failed");
  }
}

/** Describe anomaly detectors. */
export async function describeAnomalyDetectors(): Promise<DescribeAnomalyDetectorsResult> {
  try {
    // TODO: implement describe_anomaly_detectors
    throw new Error("describe_anomaly_detectors not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_anomaly_detectors failed");
  }
}

/** Describe insight rules. */
export async function describeInsightRules(): Promise<DescribeInsightRulesResult> {
  try {
    // TODO: implement describe_insight_rules
    throw new Error("describe_insight_rules not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "describe_insight_rules failed");
  }
}

/** Disable alarm actions. */
export async function disableAlarmActions(alarmNames: string[], regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement disable_alarm_actions
    throw new Error("disable_alarm_actions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disable_alarm_actions failed");
  }
}

/** Disable insight rules. */
export async function disableInsightRules(ruleNames: string[], regionName?: string | undefined): Promise<DisableInsightRulesResult> {
  try {
    // TODO: implement disable_insight_rules
    throw new Error("disable_insight_rules not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "disable_insight_rules failed");
  }
}

/** Enable alarm actions. */
export async function enableAlarmActions(alarmNames: string[], regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement enable_alarm_actions
    throw new Error("enable_alarm_actions not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "enable_alarm_actions failed");
  }
}

/** Enable insight rules. */
export async function enableInsightRules(ruleNames: string[], regionName?: string | undefined): Promise<EnableInsightRulesResult> {
  try {
    // TODO: implement enable_insight_rules
    throw new Error("enable_insight_rules not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "enable_insight_rules failed");
  }
}

/** Get dashboard. */
export async function getDashboard(dashboardName: string, regionName?: string | undefined): Promise<GetDashboardResult> {
  try {
    // TODO: implement get_dashboard
    throw new Error("get_dashboard not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_dashboard failed");
  }
}

/** Get insight rule report. */
export async function getInsightRuleReport(ruleName: string, startTime: string, endTime: string, period: number): Promise<GetInsightRuleReportResult> {
  try {
    // TODO: implement get_insight_rule_report
    throw new Error("get_insight_rule_report not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_insight_rule_report failed");
  }
}

/** Get metric data. */
export async function getMetricData(metricDataQueries: Record<string, unknown>[], startTime: string, endTime: string): Promise<GetMetricDataResult> {
  try {
    // TODO: implement get_metric_data
    throw new Error("get_metric_data not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_metric_data failed");
  }
}

/** Get metric stream. */
export async function getMetricStream(name: string, regionName?: string | undefined): Promise<GetMetricStreamResult> {
  try {
    // TODO: implement get_metric_stream
    throw new Error("get_metric_stream not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_metric_stream failed");
  }
}

/** Get metric widget image. */
export async function getMetricWidgetImage(metricWidget: string): Promise<GetMetricWidgetImageResult> {
  try {
    // TODO: implement get_metric_widget_image
    throw new Error("get_metric_widget_image not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "get_metric_widget_image failed");
  }
}

/** List dashboards. */
export async function listDashboards(): Promise<ListDashboardsResult> {
  try {
    // TODO: implement list_dashboards
    throw new Error("list_dashboards not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_dashboards failed");
  }
}

/** List managed insight rules. */
export async function listManagedInsightRules(resourceArn: string): Promise<ListManagedInsightRulesResult> {
  try {
    // TODO: implement list_managed_insight_rules
    throw new Error("list_managed_insight_rules not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_managed_insight_rules failed");
  }
}

/** List metric streams. */
export async function listMetricStreams(): Promise<ListMetricStreamsResult> {
  try {
    // TODO: implement list_metric_streams
    throw new Error("list_metric_streams not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_metric_streams failed");
  }
}

/** List metrics. */
export async function listMetrics(): Promise<ListMetricsResult> {
  try {
    // TODO: implement list_metrics
    throw new Error("list_metrics not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "list_metrics failed");
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

/** Put anomaly detector. */
export async function putAnomalyDetector(): Promise<void> {
  try {
    // TODO: implement put_anomaly_detector
    throw new Error("put_anomaly_detector not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_anomaly_detector failed");
  }
}

/** Put composite alarm. */
export async function putCompositeAlarm(alarmName: string, alarmRule: string): Promise<void> {
  try {
    // TODO: implement put_composite_alarm
    throw new Error("put_composite_alarm not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_composite_alarm failed");
  }
}

/** Put dashboard. */
export async function putDashboard(dashboardName: string, dashboardBody: string, regionName?: string | undefined): Promise<PutDashboardResult> {
  try {
    // TODO: implement put_dashboard
    throw new Error("put_dashboard not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_dashboard failed");
  }
}

/** Put insight rule. */
export async function putInsightRule(ruleName: string, ruleDefinition: string): Promise<void> {
  try {
    // TODO: implement put_insight_rule
    throw new Error("put_insight_rule not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_insight_rule failed");
  }
}

/** Put managed insight rules. */
export async function putManagedInsightRules(managedRules: Record<string, unknown>[], regionName?: string | undefined): Promise<PutManagedInsightRulesResult> {
  try {
    // TODO: implement put_managed_insight_rules
    throw new Error("put_managed_insight_rules not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_managed_insight_rules failed");
  }
}

/** Put metric alarm. */
export async function putMetricAlarm(alarmName: string, evaluationPeriods: number, comparisonOperator: string): Promise<void> {
  try {
    // TODO: implement put_metric_alarm
    throw new Error("put_metric_alarm not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_metric_alarm failed");
  }
}

/** Put metric data. */
export async function putMetricData(namespace: string): Promise<void> {
  try {
    // TODO: implement put_metric_data
    throw new Error("put_metric_data not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_metric_data failed");
  }
}

/** Put metric stream. */
export async function putMetricStream(name: string, firehoseArn: string, roleArn: string, outputFormat: string): Promise<PutMetricStreamResult> {
  try {
    // TODO: implement put_metric_stream
    throw new Error("put_metric_stream not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "put_metric_stream failed");
  }
}

/** Set alarm state. */
export async function setAlarmState(alarmName: string, stateValue: string, stateReason: string): Promise<void> {
  try {
    // TODO: implement set_alarm_state
    throw new Error("set_alarm_state not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "set_alarm_state failed");
  }
}

/** Start metric streams. */
export async function startMetricStreams(names: string[], regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement start_metric_streams
    throw new Error("start_metric_streams not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "start_metric_streams failed");
  }
}

/** Stop metric streams. */
export async function stopMetricStreams(names: string[], regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement stop_metric_streams
    throw new Error("stop_metric_streams not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "stop_metric_streams failed");
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

/** Untag resource. */
export async function untagResource(resourceArn: string, tagKeys: string[], regionName?: string | undefined): Promise<void> {
  try {
    // TODO: implement untag_resource
    throw new Error("untag_resource not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "untag_resource failed");
  }
}
