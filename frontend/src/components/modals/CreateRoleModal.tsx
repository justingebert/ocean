import React, { Fragment } from "react";
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";

import { DatabaseProperties } from "../../types/database";
import { UpstreamCreateRoleProperties } from "../../types/role";
import CreateRoleForm from "../forms/CreateRoleForm";

/**
 * Props for the `CreateRoleModal` component.
 */
export interface CreateRoleModalProps {
  /** The database where the new role will be created (optional). */
  database?: DatabaseProperties;
  /** Boolean flag indicating whether the modal is open. */
  open: boolean;
  /** Callback function triggered when the form is submitted. */
  onSubmit: (value: UpstreamCreateRoleProperties) => void;
  /** Callback function triggered when the modal is closed. */
  onClose: () => void;
}

/**
 * Modal component for creating a new user role within a database.
 * - Displays a form to enter role details.
 * - Uses `headlessui` transitions for smooth modal animations.
 *
 * @param database - The target database for the new role.
 * @param open - Controls modal visibility.
 * @param onSubmit - Function to handle role creation.
 * @param onClose - Function to handle modal closure.
 */
const CreateRoleModal: React.FC<CreateRoleModalProps> = ({ database, open, onSubmit, onClose }) => {
  return (
    <Transition show={open} as={Fragment}>
      <Dialog as="div" className="fixed z-10 inset-0 overflow-y-auto" open={open} onClose={onClose}>
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          {/* Replacing Dialog.Overlay with a div */}
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </TransitionChild>

          {/* Trick to center modal */}
          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
            &#8203;
          </span>

          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            {/* Wrap content inside Dialog.Panel */}
            <DialogPanel className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mt-3 sm:mt-5">
                  <DialogTitle
                    as="h3"
                    className="text-center text-lg leading-6 font-medium text-gray-900"
                  >
                    Create a user
                  </DialogTitle>
                  <div className="mt-2">
                    <CreateRoleForm database={database} onSubmit={onSubmit} onClose={onClose} />
                  </div>
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
};

export default CreateRoleModal;
