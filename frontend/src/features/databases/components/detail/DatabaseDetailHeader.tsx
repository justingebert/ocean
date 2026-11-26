import ActionDropdown from "./ActionDropdown.tsx";
import DatabaseEngineLogo from "@/features/databases/components/DatabaseList/DatabaseEngineLogo";
import { getDatabaseEngineTitle } from "@/features/databases/components/DatabaseList/databaseListFormat";
import { PageHeader } from "@/components/common/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { DatabaseProperties } from "@/features/databases/model/database.ts";

interface DatabaseDetailHeaderProps {
  database?: DatabaseProperties;
  onDelete: () => void;
}

export function DatabaseDetailHeader({ database, onDelete }: DatabaseDetailHeaderProps) {
  if (!database) {
    return (
      <div className="mb-6 flex items-center gap-3">
        <Skeleton className="size-8 rounded-md" />
        <div>
          <Skeleton className="h-6 w-36" />
          <Skeleton className="mt-1 h-4 w-24" />
        </div>
      </div>
    );
  }

  return (
    <PageHeader
      icon={<DatabaseEngineLogo className="size-8" engine={database.engine} alt="" />}
      title={database.name}
      description={getDatabaseEngineTitle(database.engine)}
      actions={<ActionDropdown onDelete={onDelete} />}
    />
  );
}
