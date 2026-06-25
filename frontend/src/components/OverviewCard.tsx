import React from "react";
import { Database } from "../types/database";
import { UserProperties } from "../types/user";
import { RoleProperties } from "../types/role";
import { getDatabaseEngineTitle } from "./DatabaseList/databaseListFormat";
import { EngineType } from "../types/engine";
import { Card } from "./ui/card";

const MONGODB_COMPASS_DOWNLOAD_URL = "https://www.mongodb.com/try/download/compass";

export interface OverviewCardProps {
  /** The database object containing its details (optional). */
  database?: Database;
  /** The user object associated with the database (optional). */
  user?: UserProperties;
  /** The default MongoDB login role, used to build a credentialed connection string. */
  mongoUser?: RoleProperties;
}
/**
 * Renders an overview card displaying database details.
 * - Displays database name, hostname, port, engine type, and connection string.
 * - Provides an option to copy the connection string and open the database admin UI.
 *
 * @param database - The database object containing details.
 * @param user - The user object to personalize the connection string.
 */
const OverviewCard: React.FC<OverviewCardProps> = ({ database, user, mongoUser }) => {
  /**
   * Retrieves the appropriate connection string based on the database engine.
   *
   * @returns A formatted connection string.
   */
  const getEngineConnectionString = (): string => {
    if (database?.engine === EngineType.PostgreSQL) {
      return database.connectionString(user?.username || "");
    } else if (database?.engine === EngineType.MongoDB) {
      return database.connectionString(mongoUser?.name, mongoUser?.password) || "";
    } else if (database === undefined) {
      return "..";
    } else {
      const assertNever = (_: never): string => "";
      return assertNever(database?.engine);
    }
  };

  const getAdminToolUrl = (): string => {
    if (database?.engine === EngineType.MongoDB) {
      return getEngineConnectionString();
    }

    return database?.adminUrl || "#";
  };

  const shouldShowMongoCompassDownload = database?.engine === EngineType.MongoDB;

  return (
    <Card className="overflow-hidden">
      <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Database</dt>
            {database ? (
              <dd className="mt-1 text-sm text-gray-900">{database.name}</dd>
            ) : (
              <dd className="animate-pulse mt-1 h-6 w-48 bg-gray-200" />
            )}
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Hostname</dt>
            {database ? (
              <dd className="mt-1 text-sm text-gray-900">{database.hostname}</dd>
            ) : (
              <dd className="animate-pulse mt-1 h-6 w-48 bg-gray-200" />
            )}
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Port</dt>
            {database ? (
              <dd className="mt-1 text-sm text-gray-900">{database.port.toString()}</dd>
            ) : (
              <dd className="animate-pulse mt-1 h-6 w-24 bg-gray-200" />
            )}
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Engine</dt>
            {database ? (
              <dd className="mt-1 text-sm text-gray-900">
                {getDatabaseEngineTitle(database.engine)}
              </dd>
            ) : (
              <dd className="animate-pulse mt-1 h-6 w-32 bg-gray-200" />
            )}
          </div>
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-gray-500">Connection String</dt>
            {database && user ? (
              <dd className="mt-2 text-sm text-gray-900">
                <div className="flex flex-col space-y-2">
                  <div>
                    <span className="px-2 py-1 rounded bg-gray-200">
                      {getEngineConnectionString()}
                    </span>
                  </div>
                  <div>
                    <button
                      className="mr-2 border border-gray-200 rounded px-2 text-sm font-sans font-medium text-gray-400 hover:border-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      onClick={() => navigator.clipboard.writeText(getEngineConnectionString())}
                    >
                      Strg-C
                    </button>
                    <a
                      href={getAdminToolUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border border-gray-200 rounded px-2 text-sm font-sans font-medium text-gray-400 hover:border-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      {database.adminToolName}
                    </a>
                    {shouldShowMongoCompassDownload && (
                      <span className="ml-2 text-sm text-gray-500">
                        <a
                          href={MONGODB_COMPASS_DOWNLOAD_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-indigo-600 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Download Compass
                        </a>
                      </span>
                    )}
                  </div>
                </div>
              </dd>
            ) : (
              <dd className="animate-pulse mt-1 h-6 w-64 bg-gray-200" />
            )}
          </div>
        </dl>
      </div>
    </Card>
  );
};

export default OverviewCard;
