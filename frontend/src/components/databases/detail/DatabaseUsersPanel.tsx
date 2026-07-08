import { useState } from "react";

import Headline from "../../Headline";
import { Button } from "../../ui/button";
import { RoleProperties } from "@/types/role.ts";

interface DatabaseUsersPanelProps {
  roles: RoleProperties[];
  isCreatingRole: boolean;
  onAddUser: () => void;
  onDeleteRole: (roleId: number) => void;
}

export function DatabaseUsersPanel({
  roles,
  isCreatingRole,
  onAddUser,
  onDeleteRole,
}: DatabaseUsersPanelProps) {
  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center justify-between pb-8 sm:flex-nowrap">
        <div>
          <Headline title="Users" size="medium" />
          <p className="mt-1 text-sm text-gray-500">Only for this database</p>
        </div>
        <div className="flex-shrink-0">
          <Button className="relative" disabled={isCreatingRole} onClick={onAddUser}>
            Add new user
          </Button>
        </div>
      </div>
      <div className="flex flex-col">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden border-b border-gray-200 shadow sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                    >
                      Password
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Action</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {roles.map((role) => (
                    <RoleTableRow key={role.id} role={role} onDelete={onDeleteRole} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RoleTableRow({
  role,
  onDelete,
}: {
  role: RoleProperties;
  onDelete: (roleId: number) => void;
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <tr>
      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{role.name}</td>
      <td className="whitespace-nowrap px-6 py-4">
        {showPassword ? (
          <div className="text-sm">
            <span className="text-gray-500">{role.password}</span>
            <span
              className="ml-2 cursor-pointer text-blue-500"
              onClick={() => setShowPassword(false)}
            >
              hide
            </span>
          </div>
        ) : (
          <div
            className="cursor-pointer text-sm text-blue-500"
            onClick={() => setShowPassword(true)}
          >
            show
          </div>
        )}
      </td>
      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
        <div
          className="cursor-pointer text-red-600 hover:text-red-900"
          onClick={() => onDelete(role.id)}
        >
          Delete
        </div>
      </td>
    </tr>
  );
}
