import {
  ConfirmDeleteDialog,
  type ConfirmDeleteDialogProps,
} from "@/components/common/ConfirmDeleteDialog";

export interface DeleteDatabaseDialogProps extends Omit<
  ConfirmDeleteDialogProps,
  "title" | "description"
> {
  databaseName: string | undefined;
}

export function DeleteDatabaseDialog({ databaseName, ...props }: DeleteDatabaseDialogProps) {
  return (
    <ConfirmDeleteDialog
      {...props}
      title={`Delete ${databaseName ?? "database"}?`}
      description="All data in this database is permanently removed. This can't be undone."
    />
  );
}
