import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

import { deleteModalContent } from "@/constants/modals.ts";
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
          <AlertDialogMedia className="bg-red-100 text-red-600">
            <ExclamationTriangleIcon className="h-6 w-6" aria-hidden="true" />
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
