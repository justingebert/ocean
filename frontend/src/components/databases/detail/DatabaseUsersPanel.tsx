import { useId, useState } from "react";
import { CopyIcon, EyeIcon, EyeOffIcon } from "lucide-react";
import { toast } from "sonner";

import Headline from "@/components/Headline";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
      <Table className="min-w-160 table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="w-80">Password</TableHead>
            <TableHead className="w-24">
              <span className="sr-only">Action</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {roles.map((role) => (
            <RoleTableRow key={role.id} role={role} onDelete={onDeleteRole} />
          ))}
        </TableBody>
      </Table>
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
  const passwordId = useId();

  const copyPassword = async () => {
    try {
      await navigator.clipboard.writeText(role.password);
      toast.success("Password copied");
    } catch {
      toast.error("Could not copy password");
    }
  };

  return (
    <TableRow>
      <TableCell className="font-medium">{role.name}</TableCell>
      <TableCell>
        <InputGroup>
          <InputGroupInput
            id={passwordId}
            aria-label={`Password for ${role.name}`}
            type={showPassword ? "text" : "password"}
            value={role.password}
            readOnly
            spellCheck={false}
            autoComplete="off"
          />
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              size="icon-xs"
              aria-label={`${showPassword ? "Hide" : "Show"} password for ${role.name}`}
              aria-controls={passwordId}
              aria-pressed={showPassword}
              title={`${showPassword ? "Hide" : "Show"} password`}
              onClick={() => setShowPassword((isShown) => !isShown)}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </InputGroupButton>
            <InputGroupButton
              size="icon-xs"
              aria-label={`Copy password for ${role.name}`}
              title="Copy password"
              onClick={copyPassword}
            >
              <CopyIcon />
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </TableCell>
      <TableCell className="text-right">
        <Button variant="destructive" size="sm" onClick={() => onDelete(role.id)}>
          Delete
        </Button>
      </TableCell>
    </TableRow>
  );
}
