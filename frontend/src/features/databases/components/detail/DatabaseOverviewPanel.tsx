import { useState } from "react";
import { DownloadIcon, ExternalLinkIcon, EyeIcon, EyeOffIcon } from "lucide-react";

import { CopyButton } from "@/components/common/CopyButton";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { InputGroupButton } from "@/components/ui/input-group";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ExpiryStatus } from "@/features/databases/components/ExpiryStatus";
import { Database } from "@/features/databases/model/database.ts";
import { EngineType } from "@/features/databases/model/engine.ts";
import { RoleProperties } from "@/features/databases/model/role";
import { UserProperties } from "@/types/user.ts";

const MONGODB_COMPASS_DOWNLOAD_URL = "https://www.mongodb.com/try/download/compass";
const MASK = "•".repeat(12);

type ConnectionView = "string" | "parameters";

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
  const [view, setView] = useState<ConnectionView>("string");
  const [revealed, setRevealed] = useState(false);

  const connectionString = getEngineConnectionString(database, user, mongoUser);
  const isMongo = database?.engine === EngineType.MongoDB;
  const password = isMongo ? mongoUser?.password : undefined;
  const encodedPassword = password ? encodeURIComponent(password) : "";
  const hasSecret = encodedPassword.length > 0;
  const displayedConnectionString =
    hasSecret && !revealed ? connectionString.replace(encodedPassword, MASK) : connectionString;

  const adminToolUrl = isMongo ? connectionString : database?.adminUrl || "#";

  const revealButton = hasSecret ? (
    <InputGroupButton
      size="icon-xs"
      aria-label={revealed ? "Hide password" : "Reveal password"}
      aria-pressed={revealed}
      title={revealed ? "Hide password" : "Reveal password"}
      onClick={() => setRevealed((shown) => !shown)}
    >
      {revealed ? <EyeOffIcon /> : <EyeIcon />}
    </InputGroupButton>
  ) : null;

  const parameters = database
    ? [
        { label: "Host", value: database.hostname },
        { label: "Port", value: database.port.toString() },
        { label: "Database", value: database.name },
        { label: "User", value: (isMongo ? mongoUser?.name : user?.username) ?? "" },
      ]
    : [];

  return (
    <Card>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-sm font-medium text-foreground">Connect</h2>
          <ToggleGroup
            value={[view]}
            onValueChange={(values) => {
              const next = values[0] as ConnectionView | undefined;
              if (next) {
                setView(next);
              }
            }}
            variant="outline"
            size="sm"
            spacing={0}
            aria-label="Connection format"
          >
            <ToggleGroupItem value="string">String</ToggleGroupItem>
            <ToggleGroupItem value="parameters">Parameters</ToggleGroupItem>
          </ToggleGroup>
        </div>
        {!database || !user ? (
          <Skeleton className="h-8 w-full" />
        ) : view === "string" ? (
          <div className="flex items-start gap-2 rounded-lg border bg-muted/50 py-1 pr-1 pl-3">
            <code className="min-w-0 flex-1 py-0.5 font-mono text-xs leading-5 break-all whitespace-pre-wrap">
              {displayedConnectionString}
            </code>
            <div className="flex shrink-0 items-center gap-0.5">
              {revealButton}
              <CopyButton
                value={connectionString}
                aria-label="Copy connection string"
                title="Copy connection string"
              />
            </div>
          </div>
        ) : (
          <dl className="divide-y rounded-lg border bg-muted/50">
            {parameters.map((parameter) => (
              <ParameterRow key={parameter.label} {...parameter} />
            ))}
            {password ? (
              <ParameterRow
                label="Password"
                value={password}
                displayedValue={revealed ? password : MASK}
                extraAction={revealButton}
              />
            ) : null}
          </dl>
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
      </CardContent>
      <CardFooter className="min-h-14 justify-between gap-4 py-3">
        {!database ? (
          <Skeleton className="h-5 w-40" />
        ) : database.expiresAt === null ? (
          <span className="text-foreground">Never expires</span>
        ) : (
          <>
            <ExpiryStatus expiresAt={database.expiresAt} verb className="tabular-nums" />
            {canRenew ? (
              <Button variant="outline" size="sm" onClick={onRenew} disabled={isRenewing}>
                Renew
              </Button>
            ) : null}
          </>
        )}
      </CardFooter>
    </Card>
  );
}

function ParameterRow({
  label,
  value,
  displayedValue = value,
  extraAction,
}: {
  label: string;
  value: string;
  displayedValue?: string;
  extraAction?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-4 py-1 pr-1 pl-3">
      <dt className="w-20 shrink-0 text-muted-foreground">{label}</dt>
      <dd className="flex min-w-0 flex-1 items-center gap-0.5">
        <span className="min-w-0 flex-1 font-mono text-xs break-all">{displayedValue}</span>
        {extraAction}
        <CopyButton
          value={value}
          aria-label={`Copy ${label.toLowerCase()}`}
          title={`Copy ${label.toLowerCase()}`}
        />
      </dd>
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
