import { ModalContent } from "../components/DeleteModal";
/**
 * Predefined content for the delete database modal.
 * This object provides the modal title, description, and button texts.
 */
export const deleteModalContent: ModalContent = {
  title: "Delete database",
  description:
    "Are you sure you want to delete your database? All of your data will be permanently removed from our servers forever. This action cannot be undone.",
  submitText: "Delete",
  cancelText: "Cancel",
};
