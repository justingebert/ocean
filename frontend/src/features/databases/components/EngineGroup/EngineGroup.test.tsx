import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { EngineGroup } from "./EngineGroup";
import { engineOptions } from "@/features/databases/constants/engines";
import { EngineType } from "@/features/databases/model/engine";

describe("<EngineGroup />", () => {
  it("renders the engines as an accessible single-selection toggle group", () => {
    render(<EngineGroup engineOptions={engineOptions} selectedValue={EngineType.PostgreSQL} />);

    expect(screen.getByRole("group", { name: /database engine/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "PostgreSQL" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "MongoDB" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("reports the selected engine", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <EngineGroup
        engineOptions={engineOptions}
        selectedValue={EngineType.PostgreSQL}
        onSelect={onSelect}
      />,
    );

    await user.click(screen.getByRole("button", { name: "MongoDB" }));

    expect(onSelect).toHaveBeenCalledWith(EngineType.MongoDB);
  });
});
