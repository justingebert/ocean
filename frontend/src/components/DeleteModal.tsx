import React, { Fragment } from 'react'
import {Dialog, DialogPanel, DialogTitle, Transition, TransitionChild} from '@headlessui/react';
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

/**
 * Defines the content structure for the delete confirmation modal.
 */
export interface ModalContent {
    /** The title displayed in the modal. */
    title: string;
    /** The description providing details about the action. */
    description: string;
    /** The text for the submit (confirm) button. */
    submitText: string;
    /** The text for the cancel button. */
    cancelText: string;
}
/**
 * Props for the `DeleteModal` component.
 */
export interface DeleteModalProps {
    /** The content to display in the modal. */
    modalContent: ModalContent;
    /** Boolean flag indicating whether the modal is open. */
    open: boolean;
    /** Callback function triggered when the confirm button is clicked. */
    onSubmit: () => void;
    /** Callback function triggered when the modal is closed. */
    onClose: () => void;
}
/**
 * A modal component for confirming deletion actions.
 * - Displays a warning message with a confirmation and cancel button.
 * - Uses `headlessui` for accessibility and smooth transitions.
 *
 * @param modalContent - The content for the modal (title, description, button texts).
 * @param open - Controls whether the modal is displayed.
 * @param onSubmit - Function triggered when the user confirms the deletion.
 * @param onClose - Function triggered when the modal is closed.
 */
const DeleteModal: React.FC<DeleteModalProps> = ({ modalContent, open, onSubmit, onClose }) => {
    return (
        <Transition show={open} as={Fragment}>
            <Dialog as="div" className="fixed z-10 inset-0 overflow-y-auto" open={open} onClose={onClose}>
                <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
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

                    {/* Trick to center modal in older browsers */}
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
                            {/* Close button */}
                            <div className="hidden sm:block absolute top-0 right-0 pt-4 pr-4">
                                <button
                                    type="button"
                                    className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    onClick={onClose}
                                >
                                    <span className="sr-only">Close</span>
                                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="sm:flex sm:items-start">
                                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                    <ExclamationTriangleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                                </div>
                                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                    <DialogTitle as="h3" className="text-lg leading-6 font-medium text-gray-900">
                                        {modalContent.title}
                                    </DialogTitle>
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-500">{modalContent.description}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                                <button
                                    type="button"
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                                    onClick={onSubmit}
                                >
                                    {modalContent.submitText}
                                </button>
                                <button
                                    type="button"
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                                    onClick={onClose}
                                >
                                    {modalContent.cancelText}
                                </button>
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </Dialog>
        </Transition>
    )
}

export default DeleteModal;