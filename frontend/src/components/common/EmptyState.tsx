import React from "react";
import { Link } from "react-router-dom";
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
  /** Where the button links to. */
  to: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ title, description, buttonText, to }) => {
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
        <Button render={<Link to={to} />}>
          <PlusIcon data-icon="inline-start" aria-hidden="true" />
          {buttonText}
        </Button>
      </EmptyContent>
    </Empty>
  );
};

export default EmptyState;
