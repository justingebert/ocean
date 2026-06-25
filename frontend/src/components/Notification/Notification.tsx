import { Fragment } from "react";
import { Transition } from "@headlessui/react";
import { CheckCircleIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { XMarkIcon } from "@heroicons/react/20/solid";

export interface NotificationProps {
  show: boolean;
  title: string;
  description: string;
  variant?: "success" | "error";
  onClose?: () => void;
}

const Notification: React.FC<NotificationProps> = ({
  show,
  title,
  description,
  variant = "success",
  onClose,
}) => {
  const renderIcon = (): React.ReactElement => {
    if (variant === "success") {
      return <CheckCircleIcon className="h-6 w-6 text-success" aria-hidden="true" />;
    } else {
      return <ExclamationTriangleIcon className="h-6 w-6 text-destructive" aria-hidden="true" />;
    }
  };

  return (
    <div
      aria-live="assertive"
      className="fixed inset-0 z-50 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start"
    >
      <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
        <Transition
          show={show}
          as={Fragment}
          enter="transform ease-out duration-300 transition"
          enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
          enterTo="translate-y-0 opacity-100 sm:translate-x-0"
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="max-w-sm w-full bg-card shadow-lg rounded-lg pointer-events-auto ring-1 ring-border overflow-hidden">
            <div className="p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">{renderIcon()}</div>
                <div className="ml-3 w-0 flex-1 pt-0.5">
                  <p className="text-sm font-medium text-card-foreground">{title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                </div>
                <div className="ml-4 flex-shrink-0 flex">
                  <button
                    className="bg-card rounded-md inline-flex text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  );
};

export default Notification;
