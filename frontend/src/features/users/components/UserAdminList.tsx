import React from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { UserProperties } from "@/types/user.ts";

export interface UserAdminListProps {
  users: ReadonlyArray<UserProperties>;
}

export const UserAdminList: React.FC<UserAdminListProps> = ({ users }) => {
  const sortedUsers = users.slice(0).sort((left, right) => right.id - left.id);

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Type</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedUsers.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="text-muted-foreground tabular-nums">{user.id}</TableCell>
              <TableCell className="font-medium">
                {user.firstName} {user.lastName}
              </TableCell>
              <TableCell className="text-muted-foreground">{user.username}</TableCell>
              <TableCell>
                <Badge variant="secondary" className="capitalize">
                  {user.employeeType}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
