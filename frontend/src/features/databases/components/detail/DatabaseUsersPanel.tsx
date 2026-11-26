import { useId, useState } from "react";
import { CopyIcon, EyeIcon, EyeOffIcon, KeyRoundIcon } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDeleteDialog } from "@/components/common/ConfirmDeleteDialog";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RoleProperties } from "@/features/databases/model/role";

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
  const [roleToDelete, setRoleToDelete] = useState<RoleProperties>();

  return (
    <Card>
      <CardContent className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4 sm:flex-nowrap">
          <div>
            <SectionHeading>Users</SectionHeading>
            <p className="mt-1 text-sm text-muted-foreground">Only for this database</p>
          </div>
          <div className="flex-shrink-0">
            <Button className="relative" disabled={isCreatingRole} onClick={onAddUser}>
              Add new user
            </Button>
          </div>
        </div>
        {roles.length === 0 ? (
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <KeyRoundIcon aria-hidden="true" />
              </EmptyMedia>
              <EmptyTitle>No users yet</EmptyTitle>
              <EmptyDescription>
                Add a user to connect to this database with its own password.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
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
                <RoleTableRow key={role.id} role={role} onDelete={setRoleToDelete} />
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
      <ConfirmDeleteDialog
        open={roleToDelete !== undefined}
        onOpenChange={(open) => !open && setRoleToDelete(undefined)}
        title={`Delete ${roleToDelete?.name ?? "user"}?`}
        description="Anything connecting as this user loses access. This can't be undone."
        onConfirm={() => {
          if (roleToDelete) onDeleteRole(roleToDelete.id);
          setRoleToDelete(undefined);
        }}
      />
    </Card>
  );
}

function RoleTableRow({
  role,
  onDelete,
}: {
  role: RoleProperties;
  onDelete: (role: RoleProperties) => void;
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
        <Button variant="destructive" size="sm" onClick={() => onDelete(role)}>
          Delete
        </Button>
      </TableCell>
    </TableRow>
  );
}
