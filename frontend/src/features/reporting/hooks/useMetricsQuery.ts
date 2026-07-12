import { useQuery, UseQueryOptions } from "@tanstack/react-query";

import { MetricClient } from "@/features/reporting/api/metricClient";
import { MetricProperties } from "@/features/reporting/types";

export const useMetricsQuery = (options?: UseQueryOptions<MetricProperties>) => {
  return useQuery({
    queryKey: ["metrics"],
    queryFn: async () => {
      return await MetricClient.getMetrics();
    },
    meta: { errorMessage: "Couldn't load metrics" },
    ...options,
  });
};
