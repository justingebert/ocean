import { describe, it, expect, afterEach, vi } from "vitest";
import { MetricClient } from "./metricClient";
import { axiosInstance } from "./client";
import { MetricProperties } from "../types/metrics";

vi.mock("./client", () => ({
  axiosInstance: {
    get: vi.fn(),
  },
}));

describe("MetricClient", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch metrics successfully", async () => {
    const mockMetrics: MetricProperties = {
      totalInstances: 50,
      totalUsers: 150,
    };

    (axiosInstance.get as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: mockMetrics,
    });

    const result = await MetricClient.getMetrics();

    expect(axiosInstance.get).toHaveBeenCalledWith("/metrics");
    expect(result).toEqual(mockMetrics);
  });

  it("should propagate errors from the API call", async () => {
    const mockError = new Error("Network error");

    (axiosInstance.get as unknown as ReturnType<typeof vi.fn>).mockRejectedValueOnce(mockError);

    await expect(MetricClient.getMetrics()).rejects.toThrow("Network error");
    expect(axiosInstance.get).toHaveBeenCalledWith("/metrics");
  });
});
