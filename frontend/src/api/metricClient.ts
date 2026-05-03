import { axiosInstance } from "./client";
import { MetricProperties } from "../types/metrics";

export class MetricClient {
  /**
   * Fetches system metrics.
   * This endpoint provides relevant performance and operational data.
   * @returns A promise that resolves to the retrieved metric properties.
   */
  public static getMetrics = async (): Promise<MetricProperties> => {
    const { data } = await axiosInstance.get<MetricProperties>("/metrics");
    return data;
  };
}
