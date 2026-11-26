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
import { EllipsisIcon, Trash2Icon } from "lucide-react";

import { Button } from "@/components/ui/button.tsx";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { Database } from "@/features/databases/model/database.ts";
import { DeleteDatabaseDialog } from "@/features/databases/components/DeleteDatabaseDialog";
import { getDatabaseEngineTitle } from "@/features/databases/components/DatabaseList/databaseListFormat";
import { formatDate } from "@/lib/format";
import { ExpiryStatus } from "@/features/databases/components/ExpiryStatus";

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
              <TableCell className="text-muted-foreground">
                <ExpiryStatus expiresAt={database.expiresAt} />
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Actions: ${database.name}`}
                      />
                    }
                  >
                    <EllipsisIcon />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuCheckboxItem
                      checked={database.expiresAt === null}
                      onCheckedChange={(checked) => onNeverExpiresChange?.(database, checked)}
                    >
                      Never expires
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => {
                        setDatabaseToDelete(database);
                        setConfirmOpen(true);
                      }}
                    >
                      <Trash2Icon />
                      Delete database
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
