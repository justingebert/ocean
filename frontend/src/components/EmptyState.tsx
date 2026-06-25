import React from "react";
import { PlusIcon, CircleStackIcon } from "@heroicons/react/20/solid";

import { Button } from "./ui/button";

/**
 * Props for the `EmptyState` component.
 */
export interface EmptyStateProps {
  /** The title displayed in the empty state. */
  title: string;
  /** A brief description explaining the empty state. */
  description: string;
  /** The text displayed on the action button. */
  buttonText: string;
  /** Callback function triggered when the button is clicked. */
  onClick: () => void;
}
/**
 * Displays an empty state message with an action button.
 * - Encourages users to create new data when no content is available.
 * - Uses Tailwind CSS for styling.
 *
 * @param title - The title displayed in the empty state.
 * @param description - A short explanation of why the state is empty.
 * @param buttonText - The text on the action button.
 * @param onClick - Callback function triggered when the button is clicked.
 */
const EmptyState: React.FC<EmptyStateProps> = ({ title, description, buttonText, onClick }) => {
  return (
    <div className="text-center">
      <CircleStackIcon className="mx-auto h-12 w-12 text-gray-400" aria-hidden="true" />
      <h3 className="mt-2 text-sm font-medium text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
      <div className="mt-6">
        <Button onClick={onClick}>
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          {buttonText}
        </Button>
      </div>
    </div>
  );
};

export default EmptyState;
