import React from "react";
import { Link } from "react-router-dom";
import { ArrowRightIcon } from "lucide-react";

import { StartingPoint } from "../constants/starting";
import { Card } from "./ui/card";

export interface StartingPointsProps {
  startingPoints: StartingPoint[];
}

const StartingPoints: React.FC<StartingPointsProps> = ({ startingPoints }) => {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {startingPoints.map(({ title, description, icon: Icon, to }) => (
        <Link
          key={to}
          to={to}
          className="group rounded-4xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <Card className="h-full border border-border px-6 shadow-xs ring-0 transition duration-200 group-hover:-translate-y-1 group-hover:border-primary/50 group-hover:shadow-lg motion-reduce:transition-none motion-reduce:group-hover:translate-y-0">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/10 transition-colors duration-200 group-hover:bg-primary/15">
              <Icon className="size-6" aria-hidden="true" />
            </div>
            <div className="flex items-end justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-heading text-base font-medium text-foreground">{title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
              </div>
              <ArrowRightIcon
                className="mb-0.5 size-4 shrink-0 text-muted-foreground transition-all duration-200 group-hover:translate-x-1 group-hover:text-primary motion-reduce:transition-none"
                aria-hidden="true"
              />
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
};

export default StartingPoints;
