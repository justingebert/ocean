import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CircleStackIcon } from "@heroicons/react/24/outline";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Database } from "../../types/database";
import { User, UserProperties } from "../../types/user";
import { UpstreamCreateRoleProperties } from "../../types/role";
import { Invitation, UpstreamCreateInvitationProperties } from "../../types/invitation";
import { DatabasesNavigation } from "../../constants/menu.ts";
import { deleteModalContent } from "../../constants/modals";
import { getDetailViewTabsFor } from "../../constants/tabs";
import { InvitationClient } from "../../api/invitationClient";
import { RoleClient } from "../../api/roleClient";
import { UserClient } from "../../api/userClient";
import { DatabaseClient } from "../../api/databaseClient";
import { getDatabaseEngineTitle } from "../../components/DatabaseList/databaseListFormat";
import AppLayout from "../../layouts/AppLayout";
import ActionDropdown from "../../components/ActionDropdown";
import CreateRoleModal from "../../components/modals/CreateRoleModal";
import DeleteModal from "../../components/DeleteModal";
import Headline from "../../components/Headline";
import { InvitationList } from "../../components/Lists/InvitationList/InvitationList";
import Notification from "../../components/Notification/Notification";
import OverviewCard from "../../components/OverviewCard";
import RoleList from "../../components/RoleList/RoleList";
import UserSelector from "../../components/UserSelector/UserSelector";
import { Tabs } from "../../components/Navigation/Tabs/Tabs";
import { Button } from "../../components/ui/button";

const DatabaseDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const parsedId = id ? Number.parseInt(id) : undefined;
  const navigate = useNavigate();

  const [activeId, setActiveId] = useState<number>(1);

  const [openDeleteDatabaseModal, setDeleteDatabaseOpenModal] = useState<boolean>(false);
  const [openCreateRoleModal, setOpenCreateRoleModal] = useState<boolean>(false);

  const [showUserAddSuccessNotification, setShowUserAddSuccessNotification] =
    useState<boolean>(false);
  const [showUserAddFailedNotification, setShowUserAddFailedNotification] =
    useState<boolean>(false);
  const [showUserDeleteSuccessNotification, setShowUserDeleteSuccessNotification] =
    useState<boolean>(false);
  const [showUserDeleteFailedNotification, setShowUserDeleteFailedNotification] =
    useState<boolean>(false);
  const [showInvitationAddSuccessNotification, setShowInvitationAddSuccessNotification] =
    useState<boolean>(false);
  const [showInvitationAddFailedNotification, setShowInvitationAddFailedNotification] =
    useState<boolean>(false);
  const [showInvitationDeleteSuccessNotification, setShowInvitationDeleteSuccessNotification] =
    useState<boolean>(false);
  const [showInvitationDeleteFailedNotification, setShowInvitationDeleteFailedNotification] =
    useState<boolean>(false);

  const queryClient = useQueryClient();

  const { data: database } = useQuery({
    queryKey: ["database", parsedId],
    queryFn: () => (parsedId ? DatabaseClient.getDatabase(parsedId) : Promise.resolve(null)),
    enabled: !!parsedId,
  });

  const { data: roles } = useQuery({
    queryKey: ["roles", parsedId],
    queryFn: () => (parsedId ? RoleClient.getRolesForDatabase(parsedId) : Promise.resolve([])),
    enabled: !!parsedId,
  });

  const { data: invitations } = useQuery({
    queryKey: ["invitations", parsedId],
    queryFn: () =>
      parsedId ? InvitationClient.getInvitationsForDatabase(parsedId) : Promise.resolve([]),
    enabled: !!parsedId,
  });

  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: () => UserClient.getUsers(),
  });

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => UserClient.getUser(),
  });

  const createRoleMutation = useMutation({
    mutationFn: (role: UpstreamCreateRoleProperties) => RoleClient.createRoleForDatabase(role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      setOpenCreateRoleModal(false);
      setShowUserAddSuccessNotification(true);
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      setOpenCreateRoleModal(false);
      setShowUserAddFailedNotification(true);
    },
  });

  const deleteRoleMutation = useMutation({
    mutationFn: (id: number) => RoleClient.deleteRoleForDatabase(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      setShowUserDeleteSuccessNotification(true);
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      setShowUserDeleteFailedNotification(true);
    },
  });

  const createInvitationMutation = useMutation({
    mutationFn: (invitation: UpstreamCreateInvitationProperties) =>
      InvitationClient.createInvitationForDatabase(invitation),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
      setShowInvitationAddSuccessNotification(true);
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
      setShowInvitationAddFailedNotification(true);
    },
  });

  const deleteInvitationMutation = useMutation({
    mutationFn: (id: number) => InvitationClient.deleteInvitationForDatabase(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
      setShowInvitationDeleteSuccessNotification(true);
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
      setShowInvitationDeleteFailedNotification(true);
    },
  });

  const deleteDatabaseMutation = useMutation({
    mutationFn: (id: number) => DatabaseClient.deleteDatabase(id),
    onSuccess: () => {
      setDeleteDatabaseOpenModal(false);
      queryClient.invalidateQueries({ queryKey: ["databases"] });
      navigate("/databases");
    },
  });

  const otherUsers = (users || []).filter((_) => _.id !== user?.id);

  const onDeleteInvitation = (value: UserProperties) => {
    if (invitations) {
      const invitation = invitations.find((invitation) => invitation.userId === value.id);
      if (invitation) {
        deleteInvitationMutation.mutate(invitation.id);
      }
    }
  };

  const renderTabContent = (): React.ReactNode => {
    if (activeId === 1) {
      return (
        <OverviewCard
          database={database ? new Database(database) : undefined}
          user={user}
          mongoUser={roles?.find((role) => role.name === database?.name)}
        />
      );
    } else if (activeId === 2) {
      return (
        <div className="mt-6">
          <div className="flex items-center justify-between flex-wrap sm:flex-nowrap pb-8">
            <div>
              <Headline title="Users" size="medium" />
              <p className="mt-1 text-sm text-gray-500">Only for this database</p>
            </div>
            <div className="flex-shrink-0">
              <Button
                className="relative"
                disabled={createRoleMutation.isPending}
                onClick={() => setOpenCreateRoleModal(true)}
              >
                Add new user
              </Button>
            </div>
          </div>
          <RoleList roles={roles || []} onDelete={(role) => deleteRoleMutation.mutate(role.id)} />
        </div>
      );
    } else if (activeId === 3) {
      return (
        <div className="z-50">
          <UserSelector
            users={otherUsers}
            selectedUserIds={Invitation.getUserIds(invitations)}
            onSelect={(value) => {
              const parsedId = id ? Number.parseInt(id) : undefined;
              if (parsedId !== undefined) {
                createInvitationMutation.mutate({ instanceId: parsedId, userId: value.id });
              }
            }}
            onDeselect={onDeleteInvitation}
          />
          <div className="my-5">
            <Headline title="Invitations" size="medium" />
            <p className="mt-1 text-sm text-gray-500">Invite other people</p>
          </div>
          <InvitationList
            invitedUsers={User.getInvitedUsers(otherUsers, invitations || [])}
            onDelete={(user) => onDeleteInvitation({ ...user, employeeType: "", mail: "" })}
          />
        </div>
      );
    }
  };

  const renderModals = (): React.ReactElement => {
    return (
      <div>
        <DeleteModal
          open={openDeleteDatabaseModal}
          modalContent={deleteModalContent}
          onSubmit={() => {
            const parsedId = id ? Number.parseInt(id) : undefined;
            if (parsedId !== undefined) {
              deleteDatabaseMutation.mutate(parsedId);
            }
          }}
          onClose={() => setDeleteDatabaseOpenModal(false)}
        />
        <CreateRoleModal
          database={database ?? undefined}
          open={openCreateRoleModal}
          onSubmit={(value) => createRoleMutation.mutate(value)}
          onClose={() => setOpenCreateRoleModal(false)}
        />
      </div>
    );
  };

  const renderNotifications = (): React.ReactElement => {
    return (
      <div>
        <Notification
          show={showUserAddSuccessNotification}
          title="Successfully created!"
          description="User was added to the database"
          onClose={() => setShowUserAddSuccessNotification(false)}
        />
        <Notification
          show={showUserAddFailedNotification}
          title="Something went wrong :("
          description="User was not added to the database"
          variant="error"
          onClose={() => setShowUserAddFailedNotification(false)}
        />
        <Notification
          show={showUserDeleteSuccessNotification}
          title="Successfully deleted!"
          description="User was deleted"
          onClose={() => setShowUserDeleteSuccessNotification(false)}
        />
        <Notification
          show={showUserDeleteFailedNotification}
          title="Something went wrong :("
          description="User was not deleted from the database"
          variant="error"
          onClose={() => setShowUserDeleteFailedNotification(false)}
        />
        <Notification
          show={showInvitationAddSuccessNotification}
          title="Successfully created!"
          description="Invitation was added to the database"
          onClose={() => setShowInvitationAddSuccessNotification(false)}
        />
        <Notification
          show={showInvitationAddFailedNotification}
          title="Something went wrong :("
          description="Invitation was not added to the database"
          variant="error"
          onClose={() => setShowInvitationAddFailedNotification(false)}
        />
        <Notification
          show={showInvitationDeleteSuccessNotification}
          title="Successfully delete!"
          description="Invitation was deleted to the database"
          onClose={() => setShowInvitationDeleteSuccessNotification(false)}
        />
        <Notification
          show={showInvitationDeleteFailedNotification}
          title="Something went wrong :("
          description="Invitation was not deleted from the database"
          variant="error"
          onClose={() => setShowInvitationDeleteFailedNotification(false)}
        />
      </div>
    );
  };

  return (
    <AppLayout selectedNavigation={DatabasesNavigation.name}>
      <div className="flex space-x-3 mb-4">
        <div className="flex-shrink-0">
          <CircleStackIcon className="h-10 w-10 rounded-full text-cyan-600" />
        </div>
        <div className="min-w-0 flex-1">
          {database ? (
            <div className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              {database.name}
            </div>
          ) : (
            <div className="animate-pulse mt-1 h-6 w-36 bg-gray-200" />
          )}
          {database ? (
            <div className="text-sm text-gray-500">{getDatabaseEngineTitle(database.engine)}</div>
          ) : (
            <div className="animate-pulse mt-1 h-4 w-24 bg-gray-200" />
          )}
        </div>
        <div className="flex-shrink-0 self-center flex">
          <ActionDropdown onDelete={() => setDeleteDatabaseOpenModal(true)} />
        </div>
      </div>
      <Tabs
        tabs={getDetailViewTabsFor(database?.engine)}
        activeId={activeId}
        onSelect={(value) => setActiveId(value)}
      />
      <div className="mt-4">{renderTabContent()}</div>
      {renderModals()}
      {renderNotifications()}
    </AppLayout>
  );
};

export default DatabaseDetailView;
