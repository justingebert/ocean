import { Card } from "../../ui/card";
import { getDatabaseEngineTitle } from "../../DatabaseList/databaseListFormat";
import { Database } from "@/types/database.ts";
import { EngineType } from "@/types/engine.ts";
import { RoleProperties } from "@/types/role.ts";
import { UserProperties } from "@/types/user.ts";

const MONGODB_COMPASS_DOWNLOAD_URL = "https://www.mongodb.com/try/download/compass";

interface DatabaseOverviewPanelProps {
  database?: Database;
  user?: UserProperties;
  mongoUser?: RoleProperties;
}

export function DatabaseOverviewPanel({ database, user, mongoUser }: DatabaseOverviewPanelProps) {
  const connectionString = getEngineConnectionString(database, user, mongoUser);
  const adminToolUrl =
    database?.engine === EngineType.MongoDB ? connectionString : database?.adminUrl || "#";
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
              <dd className="mt-1 h-6 w-48 animate-pulse bg-gray-200" />
            )}
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Hostname</dt>
            {database ? (
              <dd className="mt-1 text-sm text-gray-900">{database.hostname}</dd>
            ) : (
              <dd className="mt-1 h-6 w-48 animate-pulse bg-gray-200" />
            )}
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Port</dt>
            {database ? (
              <dd className="mt-1 text-sm text-gray-900">{database.port.toString()}</dd>
            ) : (
              <dd className="mt-1 h-6 w-24 animate-pulse bg-gray-200" />
            )}
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Engine</dt>
            {database ? (
              <dd className="mt-1 text-sm text-gray-900">
                {getDatabaseEngineTitle(database.engine)}
              </dd>
            ) : (
              <dd className="mt-1 h-6 w-32 animate-pulse bg-gray-200" />
            )}
          </div>
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-gray-500">Connection String</dt>
            {database && user ? (
              <dd className="mt-2 text-sm text-gray-900">
                <div className="flex flex-col space-y-2">
                  <div>
                    <span className="rounded bg-gray-200 px-2 py-1">{connectionString}</span>
                  </div>
                  <div>
                    <button
                      className="mr-2 rounded border border-gray-200 px-2 font-sans text-sm font-medium text-gray-400 hover:border-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      onClick={() => navigator.clipboard.writeText(connectionString)}
                    >
                      Strg-C
                    </button>
                    <a
                      href={adminToolUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded border border-gray-200 px-2 font-sans text-sm font-medium text-gray-400 hover:border-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      {database.adminToolName}
                    </a>
                    {shouldShowMongoCompassDownload && (
                      <span className="ml-2 text-sm text-gray-500">
                        <a
                          href={MONGODB_COMPASS_DOWNLOAD_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-indigo-600 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                          Download Compass
                        </a>
                      </span>
                    )}
                  </div>
                </div>
              </dd>
            ) : (
              <dd className="mt-1 h-6 w-64 animate-pulse bg-gray-200" />
            )}
          </div>
        </dl>
      </div>
    </Card>
  );
}

function getEngineConnectionString(
  database?: Database,
  user?: UserProperties,
  mongoUser?: RoleProperties,
): string {
  if (database?.engine === EngineType.PostgreSQL) {
    return database.connectionString(user?.username || "");
  } else if (database?.engine === EngineType.MongoDB) {
    return database.connectionString(mongoUser?.name, mongoUser?.password) || "";
  } else if (database === undefined) {
    return "..";
  } else {
    const assertNever = (_: never): string => "";
    return assertNever(database.engine);
  }
}
