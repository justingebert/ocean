import { describe, it, expect, vi } from "vitest";
import { axiosInstance, decodeJwt, setBearerToken } from "./client";
import { config } from "../config";
import MockAdapter from "axios-mock-adapter";

Object.defineProperty(global, "localStorage", {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  },
});

describe("Axios Client (Real Axios)", () => {
  it("should have the correct default configuration", () => {
    expect(axiosInstance.defaults.baseURL).toBe(config.apiUrl);
    expect(axiosInstance.defaults.headers["Content-Type"]).toBe("application/json");
    expect(axiosInstance.defaults.headers["Access-Control-Allow-Origin"]).toBe("*");
  });

  it("should make a successful GET request to a mock server", async () => {
    const mockAxios = new MockAdapter(axiosInstance);
    mockAxios.onGet("/todos/1").reply(200, { id: 1 });

    try {
      const response = await axiosInstance.get("/todos/1");
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("id", 1);
    } finally {
      mockAxios.restore();
    }
  });

  it("should decode a valid JWT", () => {
    const validToken =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMywicm9sZSI6ImFkbWluIn0.sK2He6p2U24QmNCTMB1ekJgMBV6fmbvlHjsXJbn0yW4";
    const expectedPayload = { userId: 123, role: "admin" };

    const result = decodeJwt(validToken);
    expect(result).toEqual(expectedPayload);
  });

  it("should return null and log an error for an invalid JWT", () => {
    const invalidToken = "invalid.token";
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const result = decodeJwt(invalidToken);
    expect(result).toBeNull();
    expect(consoleErrorSpy).toHaveBeenCalledWith("Failed to decode JWT:", expect.any(Error));

    consoleErrorSpy.mockRestore();
  });

  it("should return null and log an error for an empty string", () => {
    const emptyToken = "";
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const result = decodeJwt(emptyToken);
    expect(result).toBeNull();
    expect(consoleErrorSpy).toHaveBeenCalledWith("Failed to decode JWT:", expect.any(Error));

    consoleErrorSpy.mockRestore();
  });

  it("should return null if token is null", () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const result = decodeJwt(null as unknown as string);
    expect(result).toBeNull();

    consoleErrorSpy.mockRestore();
  });

  it("should set the Authorization header when a valid token is provided", () => {
    const token = "mockAccessToken";

    setBearerToken(token);

    expect(axiosInstance.defaults.headers.common.Authorization).toBe(`Bearer ${token}`);
  });

  it("should remove the Authorization header when an empty token is provided", () => {
    axiosInstance.defaults.headers.common.Authorization = "Bearer existingToken";

    setBearerToken("");

    expect(axiosInstance.defaults.headers.common.Authorization).toBeUndefined();
  });
});
