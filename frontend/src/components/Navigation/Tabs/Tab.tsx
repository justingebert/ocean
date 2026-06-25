import React from "react";

export interface ITab {
  id: number;
  name: string;
}

export interface TabProps {
  tab: ITab;

  active: boolean;

  onSelect?: (id: number) => void;
}

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

const borderStyles: Record<"active" | "inactive", string> = {
  active: "border-primary",
  inactive: "border-transparent hover:border-gray-300",
};

const textStyles: Record<"active" | "inactive", string> = {
  active: "text-foreground",
  inactive: "text-gray-500 hover:text-gray-700",
};
