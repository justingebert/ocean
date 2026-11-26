import ActionDropdown from "./ActionDropdown.tsx";
import DatabaseEngineLogo from "@/features/databases/components/DatabaseList/DatabaseEngineLogo";
import { getDatabaseEngineTitle } from "@/features/databases/components/DatabaseList/databaseListFormat";
import { Skeleton } from "@/components/ui/skeleton";
import { DatabaseProperties } from "@/features/databases/model/database.ts";

interface DatabaseDetailHeaderProps {
  database?: DatabaseProperties;
  onDelete: () => void;
}

export function DatabaseDetailHeader({ database, onDelete }: DatabaseDetailHeaderProps) {
  return (
    <header className="mb-6 flex items-center gap-3">
      {database ? (
        <DatabaseEngineLogo className="size-8" engine={database.engine} />
      ) : (
        <Skeleton className="size-8 rounded-md" />
      )}
      <div className="min-w-0 flex-1">
        {database ? (
          <h1 className="truncate font-heading text-xl font-semibold tracking-tight text-foreground">
            {database.name}
          </h1>
        ) : (
          <Skeleton className="h-6 w-36" />
        )}
        {database ? (
          <p className="text-sm text-muted-foreground">{getDatabaseEngineTitle(database.engine)}</p>
        ) : (
          <Skeleton className="mt-1 h-4 w-24" />
        )}
      </div>
      <ActionDropdown onDelete={onDelete} />
    </header>
  );
}
