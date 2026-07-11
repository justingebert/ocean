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
    vi.stubEnv("VITE_MONGODB_TLS", "true");
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

  const createMongoDatabase = async (name = "customer_docs") => {
    vi.resetModules();
    const { Database } = await import("./database");
    const props: DatabaseProperties = {
      id: 2,
      name,
      engine: EngineType.MongoDB,
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

  it("uses MongoDB Compass as the MongoDB admin tool", async () => {
    const database = await createMongoDatabase();

    expect(database.adminToolName).toBe("MongoDB Compass");
    expect(database.adminUrl).toBe("mongodb://localhost:27017/customer_docs?tls=true");
  });

  it("uses Adminer as the PostgreSQL admin UI", async () => {
    const database = await createPostgresDatabase();

    expect(database.adminToolName).toBe("Adminer");
  });

  it("builds a MongoDB connection string with embedded credentials and database auth", async () => {
    const database = await createMongoDatabase("customer_docs");

    expect(database.connectionString("customer_docs", "s3cret")).toBe(
      "mongodb://customer_docs:s3cret@localhost:27017/customer_docs?tls=true",
    );
  });

  it("omits credentials from the MongoDB connection string when the login is unknown", async () => {
    const database = await createMongoDatabase("customer_docs");

    expect(database.connectionString()).toBe("mongodb://localhost:27017/customer_docs?tls=true");
  });

  it("drops tls from the MongoDB connection string when TLS is disabled", async () => {
    vi.stubEnv("VITE_MONGODB_TLS", "false");
    const database = await createMongoDatabase("customer_docs");

    expect(database.connectionString("customer_docs", "s3cret")).toBe(
      "mongodb://customer_docs:s3cret@localhost:27017/customer_docs",
    );
  });
});
