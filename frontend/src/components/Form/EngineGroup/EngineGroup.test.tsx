import React from "react";
import { render } from "@testing-library/react";
import { describe, it } from "vitest";

import { EngineGroup } from "./EngineGroup";
import { engineOptions } from "../../../constants/engines";
// Tests for EngineGroup component to ensure it renders correctly
describe("<EngineGroup />", () => {
    // Ensure the EngineGroup component mounts successfully without errors
    it("renders without crashing", () => {
        // Render the EngineGroup component with default engine options and no selected value
        render(<EngineGroup engineOptions={engineOptions} selectedValue="" />);
    });
});
