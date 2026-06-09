import React from "react";

/**
 * Represents the structure of a single tab.
 */
export interface ITab {
  id: number;
  name: string;
}
/**
 * Props for the `Tab` component.
 */
export interface TabProps {
  /** The tab object containing its `id` and `name`. */
  tab: ITab;
  /** Boolean flag indicating whether the tab is active. */
  active: boolean;
  /** Optional callback function triggered when the tab is selected. */
  onSelect?: (id: number) => void;
}

/**
 * Renders a single tab in a navigation bar.
 * - Displays the tab name with different styles depending on its active state.
 * - Calls `onSelect` when clicked.
 *
 * @param tab - The tab object containing `id` and `name`.
 * @param active - Determines if the tab is highlighted as selected.
 * @param onSelect - Callback function triggered when the tab is clicked.
 */
export const Tab: React.FC<TabProps> = ({ tab, active, onSelect }) => {
  const activeStyle: "active" | "inactive" = active ? "active" : "inactive";

  return (
    <div
      key={tab.id}
      className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm cursor-pointer ${borderStyles[activeStyle]} ${textStyles[activeStyle]}`}
      aria-current={active ? "page" : undefined}
      onClick={() => onSelect && onSelect(tab.id)}
    >
      {tab.name}
    </div>
  );
};
/**
 * Border styles based on the tab's active state.
 */
const borderStyles: Record<"active" | "inactive", string> = {
  active: "border-cyan-500",
  inactive: "border-transparent hover:border-gray-300",
};
/**
 * Text styles based on the tab's active state.
 */
const textStyles: Record<"active" | "inactive", string> = {
  active: "text-cyan-600",
  inactive: "text-gray-500 hover:text-gray-700",
};
