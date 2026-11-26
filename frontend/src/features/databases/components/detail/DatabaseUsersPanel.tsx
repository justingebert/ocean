import { useId, useState } from "react";
import { EyeIcon, EyeOffIcon, KeyRoundIcon, PlusIcon } from "lucide-react";

import { ConfirmDeleteDialog } from "@/components/common/ConfirmDeleteDialog";
import { CopyButton } from "@/components/common/CopyButton";
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
  onDeleteRole: (roleId: number) => Promise<unknown> | void;
}

export function DatabaseUsersPanel({
  roles,
  isCreatingRole,
  onAddUser,
  onDeleteRole,
}: DatabaseUsersPanelProps) {
  // Kept after closing so the title doesn't change during the close animation.
  const [roleToDelete, setRoleToDelete] = useState<RoleProperties>();
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <Card>
      <CardContent className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Each user logs in to this database with its own password.
          </p>
          <Button disabled={isCreatingRole} onClick={onAddUser}>
            <PlusIcon data-icon="inline-start" />
            Add user
          </Button>
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
                <RoleTableRow
                  key={role.id}
                  role={role}
                  onDelete={(role) => {
                    setRoleToDelete(role);
                    setConfirmOpen(true);
                  }}
                />
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
      <ConfirmDeleteDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={`Delete ${roleToDelete?.name ?? "user"}?`}
        description="Anything connecting as this user loses access. This can't be undone."
        onConfirm={() => roleToDelete && onDeleteRole(roleToDelete.id)}
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
            <CopyButton
              value={role.password}
              aria-label={`Copy password for ${role.name}`}
              title="Copy password"
            />
          </InputGroupAddon>
        </InputGroup>
      </TableCell>
      <TableCell className="text-right">
        <Button variant="ghost" size="sm" onClick={() => onDelete(role)}>
          Delete
        </Button>
      </TableCell>
    </TableRow>
  );
}
