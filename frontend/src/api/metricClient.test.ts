import { describe, it, expect, afterEach, vi } from "vitest";
import { MetricClient } from "./metricClient";
import { axiosInstance } from "./client";
import { MetricProperties } from "../types/metrics";

// Mock axiosInstance to prevent real API requests and allow controlled responses
vi.mock("./client", () => ({
    axiosInstance: {
        get: vi.fn(),
    },
}));

// Tests for MetricClient methods that interact with the API
describe("MetricClient", () => {
    // Clear all mocks after each test to ensure test isolation
    afterEach(() => {
        vi.clearAllMocks();
    });
    // Verify that getMetrics() correctly retrieves metric data from the API
    it("should fetch metrics successfully", async () => {
        // Mock data representing the expected API response for metrics
        const mockMetrics: MetricProperties = {
            totalInstances: 50,
            totalUsers: 150,
        };

        // Simulate a successful API response with mock metrics data
        (axiosInstance.get as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: mockMetrics });

        const result = await MetricClient.getMetrics();
        // Ensure the API call was made to the correct endpoint
        expect(axiosInstance.get).toHaveBeenCalledWith("/metrics");
        expect(result).toEqual(mockMetrics);
    });
    // Verify that getMetrics() correctly propagates API errors
    it("should propagate errors from the API call", async () => {
        // Mock an API failure scenario
        const mockError = new Error("Network error");

        // Simulate a network failure when fetching metrics
        (axiosInstance.get as unknown as ReturnType<typeof vi.fn>).mockRejectedValueOnce(mockError);

        await expect(MetricClient.getMetrics()).rejects.toThrow("Network error");
        expect(axiosInstance.get).toHaveBeenCalledWith("/metrics");
    });
});
