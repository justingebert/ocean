import React from "react";
import { compareDesc } from "date-fns";
import { Link } from "react-router-dom";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.tsx";
import { cn } from "cn";
import { formatDate, getDatabaseEngineTitle, isExpiringSoon } from "./databaseListFormat.ts";
import DatabaseEngineLogo from "./DatabaseEngineLogo.tsx";
import { DatabaseProperties } from "@/features/databases/model/database.ts";

export interface DatabaseListProps {
  databases: ReadonlyArray<DatabaseProperties>;
  getHref: (id: number) => string;
}

const DatabaseList: React.FC<DatabaseListProps> = ({ databases, getHref }) => {
  const sortedDatabases = databases
    .slice(0)
    .sort((left, right) => compareDesc(left.createdAt, right.createdAt));

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead className="hidden sm:table-cell">Engine</TableHead>
          <TableHead className="hidden text-right md:table-cell">Created</TableHead>
          <TableHead className="text-right">Expires</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedDatabases.map((database) => (
          <TableRow key={database.id} className="relative">
            <TableCell className="font-medium">
              <Link
                to={getHref(database.id)}
                className="flex items-center gap-2 outline-none after:absolute after:inset-0 focus-visible:after:rounded-md focus-visible:after:ring-2 focus-visible:after:ring-ring"
              >
                <DatabaseEngineLogo className="size-4" engine={database.engine} />
                <span className="truncate">{database.name}</span>
              </Link>
            </TableCell>
            <TableCell className="hidden text-muted-foreground sm:table-cell">
              {getDatabaseEngineTitle(database.engine)}
            </TableCell>
            <TableCell className="hidden text-right text-muted-foreground tabular-nums md:table-cell">
              <time dateTime={new Date(database.createdAt).toISOString()}>
                {formatDate(database.createdAt)}
              </time>
            </TableCell>
            <TableCell
              className={cn(
                "text-right text-muted-foreground tabular-nums",
                isExpiringSoon(database.expiresAt) && "font-medium text-destructive",
              )}
            >
              <ExpiryDate expiresAt={database.expiresAt} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export function ExpiryDate({ expiresAt }: { expiresAt: Date | null }) {
  if (expiresAt === null) {
    return <>Never</>;
  }

  return <time dateTime={new Date(expiresAt).toISOString()}>{formatDate(expiresAt)}</time>;
}

export default DatabaseList;
