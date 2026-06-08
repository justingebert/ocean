import React from "react";

import { ITab, Tab } from "./Tab";

/**
 * Props for the `Tabs` component.
 */
export interface TabsProps {
  /**
   * List of tabs.
   */
  tabs: ReadonlyArray<ITab>;
  /**
   * The active tab.
   */
  activeId: number;
  /**
   * The function called when the tab state changes.
   */
  onSelect?: (id: number) => void;
}

/**
 * Renders a set of navigation tabs.
 * - Highlights the active tab.
 * - Calls `onSelect` when a tab is clicked.
 *
 * @param tabs - The list of tabs to display.
 * @param activeId - The ID of the currently active tab.
 * @param onSelect - Callback function triggered when a tab is selected.
 */
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
