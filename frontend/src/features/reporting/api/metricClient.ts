import { axiosInstance } from "@/api/client";
import { MetricProperties } from "@/features/reporting/types";

export class MetricClient {
  public static getMetrics = async (): Promise<MetricProperties> => {
    const { data } = await axiosInstance.get<MetricProperties>("/metrics");
    return data;
  };
}
