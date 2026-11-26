import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { DatabaseClient } from "@/features/databases/api/databaseClient";
import { InvitationClient } from "@/features/databases/api/invitationClient";
import { RoleClient } from "@/features/databases/api/roleClient";
import { UserClient } from "@/api/userClient.ts";
import { formatDate } from "@/features/databases/components/DatabaseList/databaseListFormat";
import { Database } from "@/features/databases/model/database.ts";
import {
  Invitation,
  UpstreamCreateInvitationProperties,
} from "@/features/databases/model/invitation";
import { UpstreamCreateRoleProperties } from "@/features/databases/model/role";

interface UseDatabaseDetailOptions {
  onDeleted?: () => void;
}

export function useDatabaseDetail(databaseId: number, options: UseDatabaseDetailOptions = {}) {
  const queryClient = useQueryClient();

  const databaseQuery = useQuery({
    queryKey: ["database", databaseId],
    queryFn: () => DatabaseClient.getDatabase(databaseId),
    meta: { errorMessage: "Couldn't load database" },
  });

  const rolesQuery = useQuery({
    queryKey: ["roles", databaseId],
    queryFn: () => RoleClient.getRolesForDatabase(databaseId),
  });

  const invitationsQuery = useQuery({
    queryKey: ["invitations", databaseId],
    queryFn: () => InvitationClient.getInvitationsForDatabase(databaseId),
  });

  const usersQuery = useQuery({
    queryKey: ["users"],
    queryFn: () => UserClient.getUsers(),
  });

  const currentUserQuery = useQuery({
    queryKey: ["user"],
    queryFn: () => UserClient.getUser(),
  });

  const createRoleMutation = useMutation({
    mutationFn: (role: UpstreamCreateRoleProperties) => RoleClient.createRoleForDatabase(role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.success("User added");
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.error("Couldn't add user");
    },
  });

  const deleteRoleMutation = useMutation({
    mutationFn: (roleId: number) => RoleClient.deleteRoleForDatabase(roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.success("User deleted");
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.error("Couldn't delete user");
    },
  });

  const createInvitationMutation = useMutation({
    mutationFn: (invitation: UpstreamCreateInvitationProperties) =>
      InvitationClient.createInvitationForDatabase(invitation),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
      toast.success("Invitation added");
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
      toast.error("Couldn't add invitation");
    },
  });

  const deleteInvitationMutation = useMutation({
    mutationFn: (invitationId: number) =>
      InvitationClient.deleteInvitationForDatabase(invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
      toast.success("Invitation removed");
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
      toast.error("Couldn't remove invitation");
    },
  });

  const deleteDatabaseMutation = useMutation({
    mutationFn: () => DatabaseClient.deleteDatabase(databaseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["databases"] });
      options.onDeleted?.();
    },
    onError: () => {
      toast.error("Couldn't delete database");
    },
  });

  const renewDatabaseMutation = useMutation({
    mutationFn: () => DatabaseClient.renewDatabase(databaseId),
    onSuccess: (renewed) => {
      queryClient.setQueryData(["database", databaseId], renewed);
      queryClient.invalidateQueries({ queryKey: ["databases"] });
      toast.success("Database renewed", {
        description: renewed.expiresAt ? `Expires on ${formatDate(renewed.expiresAt)}` : undefined,
      });
    },
    onError: () => {
      toast.error("Couldn't renew database");
    },
  });

  const users = usersQuery.data ?? [];
  const currentUser = currentUserQuery.data;
  const roles = rolesQuery.data ?? [];
  const invitations = invitationsQuery.data ?? [];
  const database = databaseQuery.data;
  const databaseModel = database ? new Database(database) : undefined;
  const otherUsers = users.filter((user) => user.id !== currentUser?.id);
  const invitedUsers = Invitation.getInvitedUsers(otherUsers, invitations);
  const selectedInvitationUserIds = Invitation.getUserIds(invitations);
  const mongoUser = roles.find((role) => role.name === database?.name);
  const isOwner = database !== undefined && database.userId === currentUser?.id;

  const deleteInvitationForUser = (userId: number) => {
    const invitation = invitations.find((value) => value.userId === userId);
    if (invitation) {
      deleteInvitationMutation.mutate(invitation.id);
    }
  };

  return {
    isLoading: databaseQuery.isPending,
    isError: databaseQuery.isError,
    refetch: () => databaseQuery.refetch(),
    database,
    databaseModel,
    currentUser,
    otherUsers,
    roles,
    invitations,
    invitedUsers,
    selectedInvitationUserIds,
    mongoUser,
    isOwner,
    isCreatingRole: createRoleMutation.isPending,
    isDeletingDatabase: deleteDatabaseMutation.isPending,
    isRenewingDatabase: renewDatabaseMutation.isPending,
    createRole: (role: UpstreamCreateRoleProperties) => createRoleMutation.mutate(role),
    deleteRole: (roleId: number) => deleteRoleMutation.mutate(roleId),
    createInvitation: (userId: number) =>
      createInvitationMutation.mutate({ instanceId: databaseId, userId }),
    deleteInvitationForUser,
    deleteDatabase: () => deleteDatabaseMutation.mutate(),
    renewDatabase: () => renewDatabaseMutation.mutate(),
  };
}
