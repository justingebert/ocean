import React from "react";

export interface IEngineOption {
  id: number;
  value: string;
  label: string;
  imageSrc: string;
  alt: string;
}

export interface EngineOptionprops {
  engineOption: IEngineOption;

  selected?: boolean;

  onSelect?: (value: string) => void;
}

export const EngineOption: React.FC<EngineOptionprops> = ({ engineOption, selected, onSelect }) => {
  const selectStyle: "selected" | "unselected" = selected ? "selected" : "unselected";

  return (
    <div
      className={`cursor-pointer shadow-lg rounded-md ${backgroundStyles[selectStyle]} ${borderStyles[selectStyle]}`}
      onClick={() => onSelect && onSelect(engineOption.value)}
    >
      <div className="px-4 py-5 sm:p-6 ">
        <img className="w-36 h-16" src={engineOption.imageSrc} alt={engineOption.alt} />
      </div>
      <div className={`px-4 py-4 sm:px-6 text-center ${textStyles[selectStyle]}`}>
        {engineOption.label}
      </div>
    </div>
  );
};

const backgroundStyles: Record<"selected" | "unselected", string> = {
  selected: "divide-y divide-blue-500 border-2 border-blue-500",
  unselected: "divide-y divide-gray-300",
};

const borderStyles: Record<"selected" | "unselected", string> = {
  selected: "hover:bg-blue-100",
  unselected: "hover:bg-gray-100",
};

const textStyles: Record<"selected" | "unselected", string> = {
  selected: "text-blue-500 hover:text-blue-800",
  unselected: "text-gray-600 hover:text-gray-800",
};
