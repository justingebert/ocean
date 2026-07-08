import CreateRoleForm from "../../forms/CreateRoleForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../ui/dialog";
import { DatabaseProperties } from "@/types/database.ts";
import { UpstreamCreateRoleProperties } from "@/types/role.ts";

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
