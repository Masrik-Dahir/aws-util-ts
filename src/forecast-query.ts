import { ForecastQueryClient } from "@aws-sdk/client-forecastquery";
import { getClient } from "./client";
import { wrapAwsError } from "./exceptions";

/** Result of a forecast query. */
export type ForecastQueryResult = {
  forecast?: Record<string, unknown>;
};

/** Query a generated forecast for a specific item and time range. */
export async function queryForecast(forecastArn: string, filters: Record<string, unknown>): Promise<ForecastQueryResult> {
  try {
    // TODO: implement query_forecast
    throw new Error("query_forecast not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "query_forecast failed");
  }
}

/** Query a what-if forecast for a specific item and time range. */
export async function queryWhatIfForecast(whatIfForecastArn: string, filters: Record<string, unknown>): Promise<ForecastQueryResult> {
  try {
    // TODO: implement query_what_if_forecast
    throw new Error("query_what_if_forecast not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "query_what_if_forecast failed");
  }
}
