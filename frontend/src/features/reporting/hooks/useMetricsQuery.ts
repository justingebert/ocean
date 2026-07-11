import { UseQueryOptions, useQuery } from "@tanstack/react-query";

import { MetricClient } from "@/features/reporting/api/metricClient";
import { MetricProperties } from "@/features/reporting/types";

export const useMetricsQuery = (options?: UseQueryOptions<MetricProperties>) => {
  return useQuery({
    queryKey: ["metrics"],
    queryFn: async () => {
      const data = await MetricClient.getMetrics();
      return data;
    },
    ...options,
  });
};
