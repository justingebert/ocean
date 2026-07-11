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
    <div className="mt-8">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User ID</TableHead>
            <TableHead>Firstname</TableHead>
            <TableHead>Lastname</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Employee</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedUsers.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.id}</TableCell>
              <TableCell>{user.firstName}</TableCell>
              <TableCell>{user.lastName}</TableCell>
              <TableCell>{user.username}</TableCell>
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
