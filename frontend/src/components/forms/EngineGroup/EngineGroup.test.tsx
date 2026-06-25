import { render } from "@testing-library/react";
import { describe, it } from "vitest";

import { EngineGroup } from "./EngineGroup";
import { engineOptions } from "../../../constants/engines";

describe("<EngineGroup />", () => {
  it("renders without crashing", () => {
    render(<EngineGroup engineOptions={engineOptions} selectedValue="" />);
  });
});
