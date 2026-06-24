import { BaseModel } from "./models";
import { EngineType, EngineTypeValues } from "./engine";
import { config } from "../config";

export interface DatabaseProperties {
  id: number;
  name: string;
  engine: EngineTypeValues;
  createdAt: Date;
  userId: number;
}
/**
 * Defines the required properties for creating a new database.
 */
export type UpstreamDatabaseProperties = Pick<DatabaseProperties, "name" | "engine">;
/**
 * Represents a Database model with extended functionalities.
 */
export class Database extends BaseModel {
  public readonly props: DatabaseProperties;

  public readonly name: string;
  public readonly engine: EngineTypeValues;
  public readonly createdAt: Date;
  public readonly userId: number;
  /**
   * Initializes a new `Database` instance.
   * @param props - The properties of the database.
   */
  constructor(props: DatabaseProperties) {
    super({ id: props.id });
    this.props = props;

    this.name = props.name;
    this.engine = props.engine;
    this.createdAt = props.createdAt;
    this.userId = props.userId;
  }
  /**
   * Retrieves the hostname for the database based on its engine type.
   * @returns The hostname as a string.
   */
  public get hostname(): string {
    if (this.props.engine === EngineType.PostgreSQL) {
      return config.postgresqlHostname;
    } else if (this.props.engine === EngineType.MongoDB) {
      return config.mongodbHostname;
    } else {
      const assertNever = (_: never): string => "";
      return assertNever(this.props.engine);
    }
  }
  /**
   * Retrieves the port number for the database based on its engine type.
   * @returns The port number as a number.
   */
  public get port(): number {
    if (this.props.engine === EngineType.PostgreSQL) {
      return Number.parseInt(config.postgresqlPort);
    } else if (this.props.engine === EngineType.MongoDB) {
      return Number.parseInt(config.mongodbPort);
    } else {
      const assertNever = (_: never): number => NaN;
      return assertNever(this.props.engine);
    }
  }
  /**
   * Generates the connection string for the database.
   * @param username - DB user (PostgreSQL: LDAP username; MongoDB: the role/login name).
   * @param password - MongoDB login password, embedded so the string is copy-paste ready.
   * @returns A connection string for PostgreSQL or MongoDB.
   */
  public connectionString(username?: string, password?: string): string {
    if (this.props.engine === EngineType.PostgreSQL) {
      return `psql "postgresql://${username}@${this.hostname}:${this.port}/${this.props.name}?sslmode=verify-full&sslrootcert=system"`;
    } else if (this.props.engine === EngineType.MongoDB) {
      const credentials =
        username && password
          ? `${encodeURIComponent(username)}:${encodeURIComponent(password)}@`
          : "";
      const tls = config.mongodbTls ? "?tls=true" : "";
      return `mongodb://${credentials}${this.hostname}:${this.port}/${this.props.name}${tls}`;
    } else {
      const assertNever = (_: never): string => "";
      return assertNever(this.props.engine);
    }
  }
  private buildUrl(baseUrl: string, searchParams?: URLSearchParams): string {
    if (!baseUrl) {
      return "";
    }

    try {
      const url = new URL(baseUrl);
      searchParams?.forEach((value, key) => url.searchParams.set(key, value));
      return url.toString();
    } catch {
      if (searchParams === undefined) {
        return baseUrl;
      }

      const separator = baseUrl.includes("?") ? "&" : "?";
      return `${baseUrl}${separator}${searchParams.toString()}`;
    }
  }

  private buildAdminerUrl(searchParams: URLSearchParams): string {
    return this.buildUrl(config.adminerUrl, searchParams);
  }

  /**
   * Retrieves the admin UI URL for database management.
   * @returns The admin UI URL as a string.
   */
  public get adminUrl(): string {
    if (this.props.engine === EngineType.PostgreSQL) {
      const adminerServer = config.adminerPostgresqlServer || `${this.hostname}:${this.port}`;
      const searchParams = new URLSearchParams({
        pgsql: adminerServer,
        db: this.props.name,
      });

      return this.buildAdminerUrl(searchParams);
    } else if (this.props.engine === EngineType.MongoDB) {
      return this.connectionString();
    } else {
      const assertNever = (_: never): string => "";
      return assertNever(this.props.engine);
    }
  }

  /**
   * Backwards-compatible alias for existing call sites and tests.
   */
  public get adminerUrl(): string {
    return this.adminUrl;
  }

  public get adminToolName(): string {
    if (this.props.engine === EngineType.PostgreSQL) {
      return "Adminer";
    } else if (this.props.engine === EngineType.MongoDB) {
      return "MongoDB Compass";
    } else {
      const assertNever = (_: never): string => "";
      return assertNever(this.props.engine);
    }
  }
}
