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
    <div className="mb-4 flex gap-3">
      <div className="shrink-0">
        {database ? (
          <DatabaseEngineLogo className="size-10" engine={database.engine} />
        ) : (
          <Skeleton className="size-10 rounded-full" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        {database ? (
          <div className="text-2xl font-bold leading-7 text-foreground sm:truncate sm:text-3xl">
            {database.name}
          </div>
        ) : (
          <Skeleton className="mt-1 h-6 w-36" />
        )}
        {database ? (
          <div className="text-sm text-muted-foreground">
            {getDatabaseEngineTitle(database.engine)}
          </div>
        ) : (
          <Skeleton className="mt-1 h-4 w-24" />
        )}
      </div>
      <div className="flex shrink-0 self-center">
        <ActionDropdown onDelete={onDelete} />
      </div>
    </div>
  );
}
