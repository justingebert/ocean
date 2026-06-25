import React from "react";
import { PlusIcon, CircleStackIcon } from "@heroicons/react/20/solid";

import { Button } from "./ui/button";

export interface EmptyStateProps {
  title: string;

  description: string;

  buttonText: string;

  onClick: () => void;
}

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
