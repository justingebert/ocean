import { UseQueryOptions, useQuery } from "@tanstack/react-query";

import { MetricClient } from "../api/metricClient";
import { MetricProperties } from "../types/metrics";

/**
 * Custom hook to fetch system metrics.
 * Uses `react-query` to manage API calls and caching.
 *
 * @param options - Optional query configuration (e.g., refetch intervals, caching behavior).
 * @returns A `useQuery` result containing system metrics.
 */
export const useMetricsQuery = (
    options?: UseQueryOptions<MetricProperties>
) => {
    return useQuery({
        queryKey: ["metrics"], // Unique query key for caching
        queryFn: async () => {
            const data = await MetricClient.getMetrics();
            return data;
        },
        ...options,
    });
};
