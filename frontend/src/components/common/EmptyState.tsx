import React from "react";
import { DatabaseIcon, PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export interface EmptyStateProps {
  title: string;
  description: string;
  buttonText: string;
  onClick: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ title, description, buttonText, onClick }) => {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <DatabaseIcon aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button onClick={onClick}>
          <PlusIcon data-icon="inline-start" aria-hidden="true" />
          {buttonText}
        </Button>
      </EmptyContent>
    </Empty>
  );
};

export default EmptyState;
