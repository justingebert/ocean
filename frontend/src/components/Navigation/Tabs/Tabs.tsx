import React from "react";

import { ITab, Tab } from "./Tab";

export interface TabsProps {
  tabs: ReadonlyArray<ITab>;

  activeId: number;

  onSelect?: (id: number) => void;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeId, onSelect }) => {
  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8" aria-label="Tabs">
        {tabs.map((tab, index) => (
          <Tab key={index.toString()} tab={tab} active={tab.id === activeId} onSelect={onSelect} />
        ))}
      </nav>
    </div>
  );
};
