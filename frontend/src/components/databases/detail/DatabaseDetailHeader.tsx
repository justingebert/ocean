import ActionDropdown from "../../ActionDropdown";
import DatabaseEngineLogo from "@/components/databases/DatabaseList/DatabaseEngineLogo";
import { getDatabaseEngineTitle } from "@/components/databases/DatabaseList/databaseListFormat.ts";
import { DatabaseProperties } from "@/types/database.ts";

interface DatabaseDetailHeaderProps {
  database?: DatabaseProperties;
  onDelete: () => void;
}

export function DatabaseDetailHeader({ database, onDelete }: DatabaseDetailHeaderProps) {
  return (
    <div className="mb-4 flex space-x-3">
      <div className="flex-shrink-0">
        {database ? (
          <DatabaseEngineLogo className="h-10 w-10" engine={database.engine} />
        ) : (
          <div className="h-10 w-10 animate-pulse rounded-full " />
        )}
      </div>
      <div className="min-w-0 flex-1">
        {database ? (
          <div className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl">
            {database.name}
          </div>
        ) : (
          <div className="mt-1 h-6 w-36 animate-pulse bg-gray-200" />
        )}
        {database ? (
          <div className="text-sm text-gray-500">{getDatabaseEngineTitle(database.engine)}</div>
        ) : (
          <div className="mt-1 h-4 w-24 animate-pulse bg-gray-200" />
        )}
      </div>
      <div className="flex flex-shrink-0 self-center">
        <ActionDropdown onDelete={onDelete} />
      </div>
    </div>
  );
}
