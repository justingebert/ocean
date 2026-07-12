import { useState } from "react";
import { CopyIcon, DownloadIcon, ExternalLinkIcon, EyeIcon, EyeOffIcon } from "lucide-react";
import { toast } from "sonner";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
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

  const copyConnectionString = async () => {
    try {
      await navigator.clipboard.writeText(connectionString);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Could not copy connection string");
    }
  };

  return (
    <Card>
      <CardContent className="flex flex-col gap-6">
        <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          <DetailField label="Host" value={database?.hostname} skeletonWidth="w-40" />
          <DetailField
            label="Port"
            value={database ? database.port.toString() : undefined}
            skeletonWidth="w-16"
          />
        </dl>

        <div>
          <div className="mb-1.5 text-sm font-medium text-muted-foreground">Connection string</div>
          {database && user ? (
            <InputGroup>
              <InputGroupInput
                aria-label="Connection string"
                className="font-mono text-xs"
                value={displayedConnectionString}
                readOnly
                spellCheck={false}
                autoComplete="off"
              />
              <InputGroupAddon align="inline-end">
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
                <InputGroupButton
                  size="icon-xs"
                  aria-label="Copy connection string"
                  title="Copy connection string"
                  onClick={copyConnectionString}
                >
                  <CopyIcon />
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          ) : (
            <Skeleton className="h-9 w-full" />
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {database ? (
            <>
              <a
                href={adminToolUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                <ExternalLinkIcon />
                Open {database.adminToolName}
              </a>
              {isMongo ? (
                <a
                  href={MONGODB_COMPASS_DOWNLOAD_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonVariants({ variant: "ghost", size: "sm" })}
                >
                  <DownloadIcon />
                  Download Compass
                </a>
              ) : null}
            </>
          ) : (
            <Skeleton className="h-8 w-32" />
          )}
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
      <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
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
