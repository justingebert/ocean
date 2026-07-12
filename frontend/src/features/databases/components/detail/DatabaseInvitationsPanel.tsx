import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox.tsx";
import { Field, FieldLabel } from "@/components/ui/field.tsx";

import { SectionHeading } from "@/components/common/SectionHeading";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { InvitedUserProperties } from "@/features/databases/model/invitation";
import { User, type UserProperties } from "@/types/user.ts";

interface DatabaseInvitationsPanelProps {
  users: UserProperties[];
  invitedUsers: InvitedUserProperties[];
  selectedUserIds: number[];
  onSelectUser: (userId: number) => void;
  onDeselectUser: (userId: number) => void;
}

export function DatabaseInvitationsPanel({
  users,
  invitedUsers,
  selectedUserIds,
  onSelectUser,
  onDeselectUser,
}: DatabaseInvitationsPanelProps) {
  return (
    <div>
      <InvitationUserSelector
        users={users}
        selectedUserIds={selectedUserIds}
        onSelect={onSelectUser}
        onDeselect={onDeselectUser}
      />
      <div className="my-5">
        <SectionHeading>Invitations</SectionHeading>
        <p className="mt-1 text-sm text-muted-foreground">Invite other people</p>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Username</TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="w-0">
              <span className="sr-only">Action</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invitedUsers.map((invitedUser) => (
            <TableRow key={invitedUser.invitationId}>
              <TableCell className="font-medium">{invitedUser.username}</TableCell>
              <TableCell className="text-muted-foreground">
                {User.getDisplayName({ ...invitedUser, mail: "", employeeType: "" })}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDeselectUser(invitedUser.id)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function InvitationUserSelector({
  users,
  selectedUserIds,
  onSelect,
  onDeselect,
}: {
  users: UserProperties[];
  selectedUserIds: number[];
  onSelect: (userId: number) => void;
  onDeselect: (userId: number) => void;
}) {
  const selectedUsers = users.filter((user) => selectedUserIds.includes(user.id));

  const onChange = (nextSelectedUsers: UserProperties[]) => {
    const selectedUser = nextSelectedUsers.find((user) => !selectedUserIds.includes(user.id));
    if (selectedUser) {
      onSelect(selectedUser.id);
      return;
    }

    const nextSelectedUserIds = new Set(nextSelectedUsers.map((user) => user.id));
    const deselectedUserId = selectedUserIds.find((userId) => !nextSelectedUserIds.has(userId));
    if (deselectedUserId !== undefined) onDeselect(deselectedUserId);
  };

  return (
    <Field>
      <FieldLabel htmlFor="invitation-user">Select to invite</FieldLabel>
      <Combobox
        multiple
        items={users}
        value={selectedUsers}
        onValueChange={onChange}
        itemToStringLabel={(user: UserProperties) =>
          `${User.getDisplayName(user)} ${user.username}`
        }
        itemToStringValue={(user: UserProperties) => user.username}
        isItemEqualToValue={(user, value) => user.id === value.id}
      >
        <ComboboxInput
          id="invitation-user"
          className="w-full"
          placeholder="Search users..."
          autoComplete="off"
        />
        <ComboboxContent>
          <ComboboxEmpty>No users found.</ComboboxEmpty>
          <ComboboxList>
            {(user) => (
              <ComboboxItem key={user.id} value={user}>
                <span className="truncate">{User.getDisplayName(user)}</span>
                <span className="truncate text-muted-foreground">{user.username}</span>
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </Field>
  );
}
