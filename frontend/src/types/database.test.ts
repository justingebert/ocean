import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Database } from "./database";
import { EngineType } from "./engine";

describe("Database", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_ADMINER_URL", "http://localhost:8080/");
    vi.stubEnv("VITE_ADMINER_POSTGRESQL_SERVER", "pg_cluster:5432");
    vi.stubEnv("VITE_POSTGRESQL_HOSTNAME", "localhost");
    vi.stubEnv("VITE_POSTGRESQL_PORT", "5555");
    vi.stubEnv("VITE_MONGODB_HOSTNAME", "localhost");
    vi.stubEnv("VITE_MONGODB_PORT", "27017");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("prefills Adminer with PostgreSQL server and database values", () => {
    const database = new Database({
      id: 1,
      name: "customer_db",
      engine: EngineType.PostgreSQL,
      createdAt: new Date(),
      userId: 1,
    });

    expect(database.adminerUrl).toBe(
      "http://localhost:8080/?pgsql=pg_cluster%3A5432&db=customer_db",
    );
  });

  it("does not include credentials in the Adminer URL", () => {
    const database = new Database({
      id: 1,
      name: "customer_db",
      engine: EngineType.PostgreSQL,
      createdAt: new Date(),
      userId: 1,
    });

    const adminerUrl = new URL(database.adminerUrl);

    expect(adminerUrl.searchParams.has("username")).toBe(false);
    expect(adminerUrl.searchParams.has("password")).toBe(false);
  });

  it("falls back to the database host and port when no Adminer server override is set", () => {
    vi.stubEnv("VITE_ADMINER_POSTGRESQL_SERVER", "");

    const database = new Database({
      id: 1,
      name: "customer_db",
      engine: EngineType.PostgreSQL,
      createdAt: new Date(),
      userId: 1,
    });

    expect(database.adminerUrl).toBe(
      "http://localhost:8080/?pgsql=localhost%3A5555&db=customer_db",
    );
  });
});
