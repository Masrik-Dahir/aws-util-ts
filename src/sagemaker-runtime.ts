import { SagemakerRuntimeClient } from "@aws-sdk/client-sagemaker-runtime";
import { getClient } from "./client";
import { wrapAwsError } from "./exceptions";

/** Response from a real-time SageMaker endpoint invocation. */
export type InvokeEndpointResult = {
  body: string;
  contentType?: string;
  invokedProductionVariant?: string;
  customAttributes?: string;
};

/** Response from an asynchronous SageMaker endpoint invocation. */
export type InvokeEndpointAsyncResult = {
  inferenceId?: string;
  outputLocation?: string;
  failureLocation?: string;
};

/** Invoke a SageMaker real-time endpoint. */
export async function invokeEndpoint(endpointName: string, body: unknown, contentType: string, accept: string, targetModel?: string, targetVariant?: string, inferenceId?: string, customAttributes?: string, regionName?: string): Promise<InvokeEndpointResult> {
  try {
    // TODO: implement invoke_endpoint
    throw new Error("invoke_endpoint not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "invoke_endpoint failed");
  }
}

/** Invoke a SageMaker async inference endpoint. */
export async function invokeEndpointAsync(endpointName: string, inputLocation: string, contentType: string, accept: string, inferenceId?: string, customAttributes?: string, regionName?: string): Promise<InvokeEndpointAsyncResult> {
  try {
    // TODO: implement invoke_endpoint_async
    throw new Error("invoke_endpoint_async not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "invoke_endpoint_async failed");
  }
}

/** Invoke a SageMaker endpoint with response streaming. */
export async function invokeEndpointWithResponseStream(endpointName: string, body: unknown, contentType: string, accept: string, targetVariant?: string, inferenceId?: string, customAttributes?: string, regionName?: string): Promise<Uint8Array[]> {
  try {
    // TODO: implement invoke_endpoint_with_response_stream
    throw new Error("invoke_endpoint_with_response_stream not yet implemented");
  } catch (err) {
    throw wrapAwsError(err as Error, "invoke_endpoint_with_response_stream failed");
  }
}
