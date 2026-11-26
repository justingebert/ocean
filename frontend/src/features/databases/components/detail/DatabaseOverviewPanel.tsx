import { useState } from "react";
import {
  ChevronRightIcon,
  DownloadIcon,
  ExternalLinkIcon,
  EyeIcon,
  EyeOffIcon,
} from "lucide-react";

import { CopyButton } from "@/components/common/CopyButton";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { InputGroupButton } from "@/components/ui/input-group";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ExpiryStatus } from "@/features/databases/components/ExpiryStatus";
import { Database } from "@/features/databases/model/database.ts";
import { EngineType } from "@/features/databases/model/engine.ts";
import { RoleProperties } from "@/features/databases/model/role";
import { UserProperties } from "@/types/user.ts";

const MONGODB_COMPASS_DOWNLOAD_URL = "https://www.mongodb.com/try/download/compass";

interface DatabaseOverviewPanelProps {
  database?: Database;
  user?: UserProperties;
  mongoUser?: RoleProperties;
  canRenew?: boolean;
  isRenewing?: boolean;
  onRenew?: () => void;
}

export function DatabaseOverviewPanel({
  database,
  user,
  mongoUser,
  canRenew = false,
  isRenewing = false,
  onRenew,
}: DatabaseOverviewPanelProps) {
  const [revealed, setRevealed] = useState(false);

  const connectionString = getEngineConnectionString(database, user, mongoUser);
  const isMongo = database?.engine === EngineType.MongoDB;
  const encodedPassword =
    isMongo && mongoUser?.password ? encodeURIComponent(mongoUser.password) : "";
  const hasSecret = encodedPassword.length > 0;
  const displayedConnectionString =
    hasSecret && !revealed
      ? connectionString.replace(encodedPassword, "•".repeat(12))
      : connectionString;

  const adminToolUrl = isMongo ? connectionString : database?.adminUrl || "#";

  return (
    <Card>
      <CardContent className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-medium text-foreground">Connection string</h2>
          {database && user ? (
            <div className="flex items-start gap-2 rounded-lg border bg-muted/50 py-1 pr-1 pl-3">
              <code className="min-w-0 flex-1 py-0.5 font-mono text-xs leading-5 break-all whitespace-pre-wrap">
                {displayedConnectionString}
              </code>
              <div className="flex shrink-0 items-center gap-0.5">
                {hasSecret ? (
                  <InputGroupButton
                    size="icon-xs"
                    aria-label={revealed ? "Hide password" : "Reveal password"}
                    aria-pressed={revealed}
                    title={revealed ? "Hide password" : "Reveal password"}
                    onClick={() => setRevealed((shown) => !shown)}
                  >
                    {revealed ? <EyeOffIcon /> : <EyeIcon />}
                  </InputGroupButton>
                ) : null}
                <CopyButton
                  value={connectionString}
                  aria-label="Copy connection string"
                  title="Copy connection string"
                />
              </div>
            </div>
          ) : (
            <Skeleton className="h-8 w-full" />
          )}
          <div className="flex flex-wrap items-center gap-2">
            {database ? (
              <>
                <a
                  href={adminToolUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonVariants({ size: "sm" })}
                >
                  <ExternalLinkIcon data-icon="inline-start" />
                  Open {database.adminToolName}
                </a>
                {isMongo ? (
                  <a
                    href={MONGODB_COMPASS_DOWNLOAD_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonVariants({ variant: "ghost", size: "sm" })}
                  >
                    <DownloadIcon data-icon="inline-start" />
                    Download Compass
                  </a>
                ) : null}
              </>
            ) : (
              <Skeleton className="h-7 w-32" />
            )}
          </div>
        </div>

        <Separator />

        <div className="flex flex-col gap-3">
          {database ? (
            <p className="flex flex-wrap items-center gap-x-2 text-sm text-foreground">
              {database.expiresAt === null ? (
                "Never expires"
              ) : (
                <>
                  <ExpiryStatus expiresAt={database.expiresAt} verb className="tabular-nums" />
                  {canRenew ? (
                    <>
                      <span aria-hidden className="text-muted-foreground">
                        ·
                      </span>
                      <Button
                        variant="link"
                        size="xs"
                        className="h-auto px-0 text-sm"
                        onClick={onRenew}
                        disabled={isRenewing}
                      >
                        Renew
                      </Button>
                    </>
                  ) : null}
                </>
              )}
            </p>
          ) : (
            <Skeleton className="h-5 w-48" />
          )}

          <details className="group">
            <summary className="flex w-fit cursor-pointer list-none items-center gap-1 rounded-sm text-sm text-muted-foreground outline-none select-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 [&::-webkit-details-marker]:hidden">
              <ChevronRightIcon
                aria-hidden
                className="size-4 transition-transform group-open:rotate-90 motion-reduce:transition-none"
              />
              Details
            </summary>
            <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-4 pl-5 sm:grid-cols-3">
              <DetailField label="Host" value={database?.hostname} skeletonWidth="w-40" />
              <DetailField
                label="Port"
                value={database ? database.port.toString() : undefined}
                skeletonWidth="w-16"
              />
            </dl>
          </details>
        </div>
      </CardContent>
    </Card>
  );
}

function DetailField({
  label,
  value,
  skeletonWidth,
}: {
  label: string;
  value?: string;
  skeletonWidth: string;
}) {
  return (
    <div>
      <dt className="text-sm text-muted-foreground">{label}</dt>
      {value !== undefined ? (
        <dd className="mt-1 text-sm text-foreground">{value}</dd>
      ) : (
        <dd className="mt-1">
          <Skeleton className={`h-5 ${skeletonWidth}`} />
        </dd>
      )}
    </div>
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
