import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { DatabaseProperties } from "./database";
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
    vi.resetModules();
  });

  const createPostgresDatabase = async (name = "customer_db") => {
    vi.resetModules();
    const { Database } = await import("./database");
    const props: DatabaseProperties = {
      id: 1,
      name,
      engine: EngineType.PostgreSQL,
      createdAt: new Date(),
      userId: 1,
    };

    return new Database(props);
  };

  it("prefills Adminer with PostgreSQL server and database values", async () => {
    const database = await createPostgresDatabase();

    expect(database.adminerUrl).toBe(
      "http://localhost:8080/?pgsql=pg_cluster%3A5432&db=customer_db",
    );
  });

  it("does not include credentials in the Adminer URL", async () => {
    const database = await createPostgresDatabase();

    const adminerUrl = new URL(database.adminerUrl);

    expect(adminerUrl.searchParams.has("username")).toBe(false);
    expect(adminerUrl.searchParams.has("password")).toBe(false);
  });

  it("uses the default internal Adminer PostgreSQL server when no override is set", async () => {
    vi.stubEnv("VITE_ADMINER_POSTGRESQL_SERVER", "");

    const database = await createPostgresDatabase();

    expect(database.adminerUrl).toBe(
      "http://localhost:8080/?pgsql=pg_cluster%3A5432&db=customer_db",
    );
  });
});
