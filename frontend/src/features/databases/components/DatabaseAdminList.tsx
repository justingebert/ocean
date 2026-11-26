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
import { Button } from "@/components/ui/button.tsx";
import { Switch } from "@/components/ui/switch";
import { cn } from "cn";
import { Database } from "@/features/databases/model/database.ts";
import { DeleteDatabaseDialog } from "@/features/databases/components/DeleteDatabaseDialog";
import {
  getDatabaseEngineTitle,
  isExpiringSoon,
} from "@/features/databases/components/DatabaseList/databaseListFormat";
import { formatDate } from "@/lib/format";
import { ExpiryDate } from "@/features/databases/components/DatabaseList/DatabaseList";

export interface DatabaseAdminListProps {
  databases: ReadonlyArray<Database>;
  onDelete?: (database: Database) => Promise<unknown> | void;
  onNeverExpiresChange?: (database: Database, neverExpires: boolean) => void;
  /** Shows the owner's username instead of their numeric id when known. */
  getOwnerName?: (userId: number) => string | undefined;
}

export const DatabaseAdminList: React.FC<DatabaseAdminListProps> = ({
  databases,
  onDelete,
  onNeverExpiresChange,
  getOwnerName,
}) => {
  // Kept after closing so the title doesn't change during the close animation.
  const [databaseToDelete, setDatabaseToDelete] = useState<Database>();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const sortedDatabases = databases
    .slice(0)
    .sort((left, right) => compareDesc(left.createdAt, right.createdAt));

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Owner</TableHead>
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
              <TableCell className="text-muted-foreground">
                {getOwnerName?.(database.userId) ?? database.userId}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {getDatabaseEngineTitle(database.engine)}
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
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setDatabaseToDelete(database);
                    setConfirmOpen(true);
                  }}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <DeleteDatabaseDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        databaseName={databaseToDelete?.name}
        onConfirm={() => databaseToDelete && onDelete?.(databaseToDelete)}
      />
    </div>
  );
};
