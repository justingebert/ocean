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
   * @param psqlUsername - The PostgreSQL username (optional, required for PostgreSQL).
   * @returns A connection string for PostgreSQL or MongoDB.
   */
  public connectionString(psqlUsername?: string): string {
    if (this.props.engine === EngineType.PostgreSQL) {
      return `psql "postgresql://${psqlUsername}@${this.hostname}:${this.port}/${this.props.name}?sslmode=verify-full&sslrootcert=system"`;
    } else if (this.props.engine === EngineType.MongoDB) {
      return `mongodb://${this.hostname}:${this.port.toString()}/?authSource=${
        this.props.name
      }&tls=true`;
    } else {
      const assertNever = (_: never): string => "";
      return assertNever(this.props.engine);
    }
  }
  private buildAdminerUrl(searchParams: URLSearchParams): string {
    const baseUrl = config.adminerUrl;

    if (!baseUrl) {
      return "";
    }

    try {
      const url = new URL(baseUrl);
      searchParams.forEach((value, key) => url.searchParams.set(key, value));
      return url.toString();
    } catch {
      const separator = baseUrl.includes("?") ? "&" : "?";
      return `${baseUrl}${separator}${searchParams.toString()}`;
    }
  }
  /**
   * Retrieves the Adminer URL for database management.
   * @returns The Adminer URL as a string.
   */
  public get adminerUrl(): string {
    if (this.props.engine === EngineType.PostgreSQL) {
      const adminerServer = config.adminerPostgresqlServer || `${this.hostname}:${this.port}`;
      const searchParams = new URLSearchParams({
        pgsql: adminerServer,
        db: this.props.name,
      });

      return this.buildAdminerUrl(searchParams);
    } else if (this.props.engine === EngineType.MongoDB) {
      return config.adminerUrl;
    } else {
      const assertNever = (_: never): string => "";
      return assertNever(this.props.engine);
    }
  }
}
