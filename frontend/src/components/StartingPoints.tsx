import React from "react";
import { Link } from "react-router-dom";

import { StartingPoint } from "../constants/starting";
import { cn } from "../lib/utils.ts";

export interface StartingPointsProps {
  startingPoints: StartingPoint[];
}

const StartingPoints: React.FC<StartingPointsProps> = ({ startingPoints }) => {
  return (
    <div>
      <div className="mt-6 py-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {startingPoints.map((item, itemIdx) => (
          <div key={itemIdx} className="flow-root">
            <div className="relative -m-2 p-2 flex items-center space-x-4 rounded-xl hover:bg-muted focus-within:ring-2 focus-within:ring-ring">
              <div
                className={cn(
                  item.background,
                  "flex-shrink-0 flex items-center justify-center h-16 w-16 rounded-lg",
                )}
              >
                <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-foreground">
                  <Link to={item.to} className="focus:outline-none">
                    <span className="absolute inset-0" aria-hidden="true" />
                    {item.title}
                    <span aria-hidden="true"> &rarr;</span>
                  </Link>
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StartingPoints;
