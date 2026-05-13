import React from 'react'

import { EngineOption, IEngineOption } from './EngineOption';

/**
 * Props for the `EngineGroup` component.
 */
export interface EngineSelectorProps {
    /**
     * List of engines options.
     */
    engineOptions: ReadonlyArray<IEngineOption>;
    /**
     * The selected engine options.
     */
    selectedValue: string;
    /**
     * The function called when the engine option state changes.
     */
    onSelect?: (value: string) => void;
}
/**
 * Renders a group of selectable engine options.
 * - Displays engine options in a horizontal layout.
 * - Calls `onSelect` when an engine option is selected.
 *
 * @param engineOptions - The list of engine options available for selection.
 * @param selectedValue - The currently selected engine option.
 * @param onSelect - Callback function triggered when an option is selected.
 */
export const EngineGroup: React.FC<EngineSelectorProps> = ({ engineOptions, selectedValue, onSelect }) => {
    return (
        <div className="flex flex-col space-y-3">
            <div className="flex flex-row space-x-4">
                {engineOptions.map((engineOption, index) => (
                    <EngineOption key={index.toString()}
                        engineOption={engineOption}
                        selected={engineOption.value === selectedValue}
                        onSelect={onSelect} />
                ))}
            </div>
        </div>
    )
}
