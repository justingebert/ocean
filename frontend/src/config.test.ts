import { afterEach, describe, expect, it, vi } from "vitest";

describe("config", () => {
  afterEach(() => {
    delete window.__OCEAN_CONFIG__;
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("uses Vite env values as a local development fallback", async () => {
    vi.stubEnv("VITE_API_URL", "/v1");

    const { config } = await import("./config");

    expect(config.apiUrl).toBe("/v1");
  });

  it("prefers runtime config over build-time env values", async () => {
    vi.stubEnv("VITE_POSTGRESQL_HOSTNAME", "built.example.test");
    window.__OCEAN_CONFIG__ = { postgresqlHostname: "runtime.example.test" };

    const { config } = await import("./config");

    expect(config.postgresqlHostname).toBe("runtime.example.test");
  });

  it("derives the Adminer URL from the runtime PostgreSQL hostname", async () => {
    vi.stubEnv("VITE_ADMINER_URL", "");
    window.__OCEAN_CONFIG__ = { postgresqlHostname: "pg.example.test" };

    const { config } = await import("./config");

    expect(config.adminerUrl).toBe("https://pg.example.test/");
  });

  it("parses MongoDB TLS from runtime config before build-time env", async () => {
    vi.stubEnv("VITE_MONGODB_TLS", "false");
    window.__OCEAN_CONFIG__ = { mongodbTls: true };

    const { config } = await import("./config");

    expect(config.mongodbTls).toBe(true);
  });
});
