import { useState } from "react";

import { getDetailViewTabsFor } from "@/constants/tabs.ts";
import { useDatabaseDetail } from "@/hooks/databases/useDatabaseDetail.ts";
import { Tabs } from "../../Navigation/Tabs/Tabs";
import { CreateRoleDialog } from "./CreateRoleDialog";
import { DatabaseDetailHeader } from "./DatabaseDetailHeader";
import { DatabaseInvitationsPanel } from "./DatabaseInvitationsPanel";
import { DatabaseOverviewPanel } from "./DatabaseOverviewPanel";
import { DatabaseUsersPanel } from "./DatabaseUsersPanel";
import { DeleteDatabaseAlertDialog } from "./DeleteDatabaseAlertDialog";

interface DatabaseDetailPageProps {
  databaseId: number;
  onDeleted: () => void;
}

export function DatabaseDetailPage({ databaseId, onDeleted }: DatabaseDetailPageProps) {
  const [activeId, setActiveId] = useState<number>(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [createRoleDialogOpen, setCreateRoleDialogOpen] = useState(false);
  const detail = useDatabaseDetail(databaseId, { onDeleted });

  return (
    <>
      <DatabaseDetailHeader database={detail.database} onDelete={() => setDeleteDialogOpen(true)} />
      <Tabs
        tabs={getDetailViewTabsFor(detail.database?.engine)}
        activeId={activeId}
        onSelect={setActiveId}
      />
      <div className="mt-4">{renderTabContent()}</div>
      <DeleteDatabaseAlertDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={detail.deleteDatabase}
        processing={detail.isDeletingDatabase}
      />
      <CreateRoleDialog
        database={detail.database}
        open={createRoleDialogOpen}
        onOpenChange={setCreateRoleDialogOpen}
        onSubmit={detail.createRole}
      />
    </>
  );

  function renderTabContent() {
    if (activeId === 1) {
      return (
        <DatabaseOverviewPanel
          database={detail.databaseModel}
          user={detail.currentUser}
          mongoUser={detail.mongoUser}
        />
      );
    } else if (activeId === 2) {
      return (
        <DatabaseUsersPanel
          roles={detail.roles}
          isCreatingRole={detail.isCreatingRole}
          onAddUser={() => setCreateRoleDialogOpen(true)}
          onDeleteRole={detail.deleteRole}
        />
      );
    } else if (activeId === 3) {
      return (
        <DatabaseInvitationsPanel
          users={detail.otherUsers}
          invitedUsers={detail.invitedUsers}
          selectedUserIds={detail.selectedInvitationUserIds}
          onSelectUser={detail.createInvitation}
          onDeselectUser={detail.deleteInvitationForUser}
        />
      );
    }

    return null;
  }
}
