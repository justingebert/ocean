import { BaseModel } from "./models";
import {EngineType, EngineTypeValues} from "./engine";

const {
  VITE_POSTGRESQL_HOSTNAME,
  VITE_POSTGRESQL_PORT,
  VITE_MONGODB_HOSTNAME,
  VITE_MONGODB_PORT,
  VITE_ADMINER_URL,
} = import.meta.env;
/**
 * Defines the properties of a database.
 */
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
export type UpstreamDatabaseProperties = Pick<
  DatabaseProperties,
  "name" | "engine"
>;
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
      return VITE_POSTGRESQL_HOSTNAME || "";
    } else if (this.props.engine === EngineType.MongoDB) {
      return VITE_MONGODB_HOSTNAME || "";
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
      return Number.parseInt(VITE_POSTGRESQL_PORT || "5432");
    } else if (this.props.engine === EngineType.MongoDB) {
      return Number.parseInt(VITE_MONGODB_PORT || "27017");
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
      return `psql "postgresql://${psqlUsername}@${this.hostname}:${this.port}/${this.props.name}?sslmode=verify-full"`;
    } else if (this.props.engine === EngineType.MongoDB) {
      return `mongodb://${this.hostname}:${this.port.toString()}/?authSource=${
        this.props.name
      }&tls=true`;
    } else {
      const assertNever = (_: never): string => "";
      return assertNever(this.props.engine);
    }
  }
  /**
   * Retrieves the Adminer URL for database management.
   * @returns The Adminer URL as a string.
   */
  public get adminerUrl(): string {
    return VITE_ADMINER_URL || "";
  }
}
