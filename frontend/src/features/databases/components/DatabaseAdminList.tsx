import React, { useState } from "react";
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
import { Switch } from "@/components/ui/switch";
import { ConfirmDeleteDialog } from "@/components/common/ConfirmDeleteDialog";
import { cn } from "cn";
import { Database } from "@/features/databases/model/database.ts";
import {
  formatDate,
  getDatabaseEngineTitle,
  isExpiringSoon,
} from "@/features/databases/components/DatabaseList/databaseListFormat";
import { ExpiryDate } from "@/features/databases/components/DatabaseList/DatabaseList";

export interface DatabaseAdminListProps {
  databases: ReadonlyArray<Database>;
  onDelete?: (database: Database) => void;
  onNeverExpiresChange?: (database: Database, neverExpires: boolean) => void;
}

export const DatabaseAdminList: React.FC<DatabaseAdminListProps> = ({
  databases,
  onDelete,
  onNeverExpiresChange,
}) => {
  const [databaseToDelete, setDatabaseToDelete] = useState<Database>();
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
            <TableHead>Expires</TableHead>
            <TableHead>Never expires</TableHead>
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
                <time dateTime={new Date(database.createdAt).toISOString()}>
                  {formatDate(database.createdAt)}
                </time>
              </TableCell>
              <TableCell
                className={cn(
                  "text-muted-foreground",
                  isExpiringSoon(database.expiresAt) && "font-medium text-destructive",
                )}
              >
                <ExpiryDate expiresAt={database.expiresAt} />
              </TableCell>
              <TableCell>
                <Switch
                  aria-label={`Never expires: ${database.name}`}
                  checked={database.expiresAt === null}
                  onCheckedChange={(checked) => onNeverExpiresChange?.(database, checked)}
                />
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDatabaseToDelete(database)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <ConfirmDeleteDialog
        open={databaseToDelete !== undefined}
        onOpenChange={(open) => !open && setDatabaseToDelete(undefined)}
        title={`Delete ${databaseToDelete?.name ?? "database"}?`}
        description="All data in this database is permanently removed. This can't be undone."
        onConfirm={() => {
          if (databaseToDelete) onDelete?.(databaseToDelete);
          setDatabaseToDelete(undefined);
        }}
      />
    </div>
  );
};
