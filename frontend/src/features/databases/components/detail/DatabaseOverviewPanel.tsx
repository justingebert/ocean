import { Card, CardContent } from "@/components/ui/card";
import { getDatabaseEngineTitle } from "@/features/databases/components/DatabaseList/databaseListFormat";
import { Skeleton } from "@/components/ui/skeleton";
import { Database } from "@/features/databases/model/database.ts";
import { EngineType } from "@/features/databases/model/engine.ts";
import { RoleProperties } from "@/features/databases/model/role";
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
      <CardContent className="p-5 sm:px-6">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-muted-foreground">Database</dt>
            {database ? (
              <dd className="mt-1 text-sm text-foreground">{database.name}</dd>
            ) : (
              <dd className="mt-1">
                <Skeleton className="h-6 w-48" />
              </dd>
            )}
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-muted-foreground">Hostname</dt>
            {database ? (
              <dd className="mt-1 text-sm text-foreground">{database.hostname}</dd>
            ) : (
              <dd className="mt-1">
                <Skeleton className="h-6 w-48" />
              </dd>
            )}
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-muted-foreground">Port</dt>
            {database ? (
              <dd className="mt-1 text-sm text-foreground">{database.port.toString()}</dd>
            ) : (
              <dd className="mt-1">
                <Skeleton className="h-6 w-24" />
              </dd>
            )}
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-muted-foreground">Engine</dt>
            {database ? (
              <dd className="mt-1 text-sm text-foreground">
                {getDatabaseEngineTitle(database.engine)}
              </dd>
            ) : (
              <dd className="mt-1">
                <Skeleton className="h-6 w-32" />
              </dd>
            )}
          </div>
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-muted-foreground">Connection String</dt>
            {database && user ? (
              <dd className="mt-2 text-sm text-foreground">
                <div className="flex flex-col gap-2">
                  <div>
                    <span className="rounded bg-muted px-2 py-1">{connectionString}</span>
                  </div>
                  <div>
                    <button
                      className="mr-2 rounded border border-border px-2 font-sans text-sm font-medium text-muted-foreground hover:border-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      onClick={() => navigator.clipboard.writeText(connectionString)}
                    >
                      Strg-C
                    </button>
                    <a
                      href={adminToolUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded border border-border px-2 font-sans text-sm font-medium text-muted-foreground hover:border-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                      {database.adminToolName}
                    </a>
                    {shouldShowMongoCompassDownload && (
                      <span className="ml-2 text-sm text-muted-foreground">
                        <a
                          href={MONGODB_COMPASS_DOWNLOAD_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-primary hover:text-primary/80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        >
                          Download Compass
                        </a>
                      </span>
                    )}
                  </div>
                </div>
              </dd>
            ) : (
              <dd className="mt-1">
                <Skeleton className="h-6 w-64" />
              </dd>
            )}
          </div>
        </dl>
      </CardContent>
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
