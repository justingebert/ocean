import { useState } from "react";

import {
  getDetailViewTabsFor,
  type DatabaseDetailTabValue,
} from "@/features/databases/constants/tabs";
import { useDatabaseDetail } from "@/features/databases/hooks/useDatabaseDetail";
import ErrorState from "@/components/common/ErrorState";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.tsx";
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
  const [activeTab, setActiveTab] = useState<DatabaseDetailTabValue>("overview");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [createRoleDialogOpen, setCreateRoleDialogOpen] = useState(false);
  const detail = useDatabaseDetail(databaseId, { onDeleted });
  const availableTabs = getDetailViewTabsFor(detail.database?.engine);

  if (detail.isError) {
    return <ErrorState title="Couldn't load database" onRetry={() => detail.refetch()} />;
  }

  return (
    <>
      <DatabaseDetailHeader database={detail.database} onDelete={() => setDeleteDialogOpen(true)} />
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as DatabaseDetailTabValue)}
      >
        <TabsList variant="line" aria-label="Database details">
          {availableTabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.name}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="overview" className="mt-4">
          <DatabaseOverviewPanel
            database={detail.databaseModel}
            user={detail.currentUser}
            mongoUser={detail.mongoUser}
          />
        </TabsContent>
        <TabsContent value="users" className="mt-4">
          <DatabaseUsersPanel
            roles={detail.roles}
            isCreatingRole={detail.isCreatingRole}
            onAddUser={() => setCreateRoleDialogOpen(true)}
            onDeleteRole={detail.deleteRole}
          />
        </TabsContent>
        <TabsContent value="invitations" className="mt-4">
          <DatabaseInvitationsPanel
            users={detail.otherUsers}
            invitedUsers={detail.invitedUsers}
            selectedUserIds={detail.selectedInvitationUserIds}
            onSelectUser={detail.createInvitation}
            onDeselectUser={detail.deleteInvitationForUser}
          />
        </TabsContent>
      </Tabs>
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
}
