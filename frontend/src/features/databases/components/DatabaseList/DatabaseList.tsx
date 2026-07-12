import React from "react";
import { compareDesc } from "date-fns";
import { ChevronRight } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { getDatabaseCreatedAt, getDatabaseEngineTitle } from "./databaseListFormat.ts";
import DatabaseEngineLogo from "./DatabaseEngineLogo.tsx";
import { DatabaseProperties } from "@/features/databases/model/database.ts";

export interface DatabaseListProps {
  databases: ReadonlyArray<DatabaseProperties>;

  onClick?: (id: number) => void;
}

const DatabaseList: React.FC<DatabaseListProps> = ({ databases, onClick }) => {
  const sortedDatabases = databases
    .slice(0)
    .sort((left, right) => compareDesc(left.createdAt, right.createdAt));

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Engine</TableHead>
          <TableHead className="hidden text-right md:table-cell">Created</TableHead>
          <TableHead className="w-0" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedDatabases.map((database) => (
          <TableRow
            key={database.id}
            onClick={() => onClick?.(database.id)}
            className="cursor-pointer"
          >
            <TableCell className="font-medium">
              <div className="flex items-center gap-2">
                <DatabaseEngineLogo className="size-5" engine={database.engine} />
                <span className="truncate">{database.name}</span>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="secondary">{getDatabaseEngineTitle(database.engine)}</Badge>
            </TableCell>
            <TableCell className="hidden text-right text-muted-foreground md:table-cell">
              <time dateTime={database.createdAt.toLocaleString()}>
                {getDatabaseCreatedAt(database.createdAt)}
              </time>
            </TableCell>
            <TableCell className="text-right">
              <ChevronRight className="size-4 text-muted-foreground" aria-hidden="true" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default DatabaseList;
