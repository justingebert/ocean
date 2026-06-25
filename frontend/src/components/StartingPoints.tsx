import React from "react";
import { Link } from "react-router-dom";

import { StartingPoint } from "../constants/starting";

export interface StartingPointsProps {
  title: string;

  description: string;

  startingPoints: StartingPoint[];
}

const StartingPoints: React.FC<StartingPointsProps> = ({ title, description, startingPoints }) => {
  const classNames = (...classes: string[]): string => {
    return classes.filter(Boolean).join(" ");
  };

  return (
    <div>
      <h2 className="text-lg font-medium text-gray-900">{title}</h2>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
      <div className="mt-6 border-t border-b border-gray-200 py-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {startingPoints.map((item, itemIdx) => (
          <div key={itemIdx} className="flow-root">
            <div className="relative -m-2 p-2 flex items-center space-x-4 rounded-xl hover:bg-gray-50 focus-within:ring-2 focus-within:ring-indigo-500">
              <div
                className={classNames(
                  item.background,
                  "flex-shrink-0 flex items-center justify-center h-16 w-16 rounded-lg",
                )}
              >
                <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">
                  <Link to={item.to} className="focus:outdivne-none">
                    <span className="absolute inset-0" aria-hidden="true" />
                    {item.title}
                    <span aria-hidden="true"> &rarr;</span>
                  </Link>
                </h3>
                <p className="mt-1 text-sm text-gray-500">{item.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StartingPoints;
