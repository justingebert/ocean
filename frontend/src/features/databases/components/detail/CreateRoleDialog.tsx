import CreateRoleForm from "@/features/databases/components/CreateRoleForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DatabaseProperties } from "@/features/databases/model/database.ts";
import { UpstreamCreateRoleProperties } from "@/features/databases/model/role";

interface CreateRoleDialogProps {
  database?: DatabaseProperties;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (value: UpstreamCreateRoleProperties) => void;
}

export function CreateRoleDialog({
  database,
  open,
  onOpenChange,
  onSubmit,
}: CreateRoleDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a user</DialogTitle>
        </DialogHeader>
        <CreateRoleForm
          database={database}
          onSubmit={(value) => {
            onSubmit(value);
            onOpenChange(false);
          }}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
