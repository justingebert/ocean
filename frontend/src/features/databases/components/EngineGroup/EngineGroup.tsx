import React from "react";

import type { DatabaseEngineOption } from "@/features/databases/constants/engines";
import type { EngineTypeValues } from "@/features/databases/model/engine.ts";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group.tsx";

export interface EngineSelectorProps {
  engineOptions: ReadonlyArray<DatabaseEngineOption>;

  selectedValue: EngineTypeValues;

  onSelect?: (value: EngineTypeValues) => void;
}

export const EngineGroup: React.FC<EngineSelectorProps> = ({
  engineOptions,
  selectedValue,
  onSelect,
}) => {
  return (
    <ToggleGroup
      value={[selectedValue]}
      onValueChange={(values) => {
        const nextValue = values[0] as EngineTypeValues | undefined;
        if (nextValue) {
          onSelect?.(nextValue);
        }
      }}
      variant="outline"
      size="lg"
      spacing={2}
      aria-label="Database engine"
      className="grid w-full grid-cols-1 sm:grid-cols-2"
    >
      {engineOptions.map((engineOption) => (
        <ToggleGroupItem
          key={engineOption.id}
          value={engineOption.value}
          className="h-auto w-full flex-col gap-3 p-4"
        >
          <img className="h-12 w-auto" src={engineOption.imageSrc} alt="" aria-hidden="true" />
          <span>{engineOption.label}</span>
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
};
