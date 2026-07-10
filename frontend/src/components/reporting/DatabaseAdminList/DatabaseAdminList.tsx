import React from "react";
import { compareDesc } from "date-fns";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Database } from "../../../types/database.ts";
import {
  getDatabaseCreatedAt,
  getDatabaseEngineTitle,
} from "../../databases/DatabaseList/databaseListFormat.ts";

export interface DatabaseAdminListProps {
  databases: ReadonlyArray<Database>;
  onDelete?: (database: Database) => void;
}

export const DatabaseAdminList: React.FC<DatabaseAdminListProps> = ({ databases, onDelete }) => {
  const sortedDatabases = databases
    .slice(0)
    .sort((left, right) => compareDesc(left.createdAt, right.createdAt));

  return (
    <div className="mt-8">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Owner ID</TableHead>
            <TableHead>Engine</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-0" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedDatabases.map((database) => (
            <TableRow key={database.id}>
              <TableCell className="font-medium">{database.name}</TableCell>
              <TableCell className="text-muted-foreground">{database.userId}</TableCell>
              <TableCell>
                <Badge variant="secondary">{getDatabaseEngineTitle(database.engine)}</Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                <time dateTime={database.createdAt.toLocaleString()}>
                  {getDatabaseCreatedAt(database.createdAt)}
                </time>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="destructive" size="sm" onClick={() => onDelete?.(database)}>
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
