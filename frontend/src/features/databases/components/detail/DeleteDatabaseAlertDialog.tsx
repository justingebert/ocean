import { TriangleAlertIcon } from "lucide-react";

import { deleteModalContent } from "@/features/databases/constants/modals";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog.tsx";

interface DeleteDatabaseAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  processing?: boolean;
}

export function DeleteDatabaseAlertDialog({
  open,
  onOpenChange,
  onConfirm,
  processing = false,
}: DeleteDatabaseAlertDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive">
            <TriangleAlertIcon aria-hidden="true" />
          </AlertDialogMedia>
          <AlertDialogTitle>{deleteModalContent.title}</AlertDialogTitle>
          <AlertDialogDescription>{deleteModalContent.description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel variant="outline" size="default" disabled={processing}>
            {deleteModalContent.cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            size="default"
            disabled={processing}
            onClick={(event) => {
              event.preventDefault();
              onConfirm();
            }}
          >
            {deleteModalContent.submitText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
