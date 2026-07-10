import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import DatabaseList from "./DatabaseList.tsx";
import { DatabaseProperties } from "../../../types/database.ts";
import { engineOptions } from "../../../constants/engines.ts";
import { EngineTypeValues } from "../../../types/engine.ts";

const mockData: readonly DatabaseProperties[] = [
  {
    id: 1,
    name: "Database 1",
    engine: engineOptions.find((e) => e.label === "PostgreSQL")?.value as EngineTypeValues,
    createdAt: new Date("2023-01-01T00:00:00Z"),
    userId: 100,
  },
  {
    id: 2,
    name: "Database 2",
    engine: engineOptions.find((e) => e.label === "MongoDB")?.value as EngineTypeValues,
    createdAt: new Date("2023-02-01T00:00:00Z"),
    userId: 101,
  },
  {
    id: 3,
    name: "Database 3",
    engine: "X" as EngineTypeValues,
    createdAt: new Date("2023-03-01T00:00:00Z"),
    userId: 102,
  },
];

describe("<DatabaseList />", () => {
  it("renders a row per database with its engine and logo", () => {
    render(
      <MemoryRouter>
        <DatabaseList databases={mockData} />
      </MemoryRouter>,
    );

    const table = screen.getByRole("table");
    const rows = within(table).getAllByRole("row").slice(1); // drop the header row

    expect(rows).toHaveLength(mockData.length);

    const database1Row = rows.find((row) => within(row).queryByText("Database 1"));
    const database2Row = rows.find((row) => within(row).queryByText("Database 2"));
    const database3Row = rows.find((row) => within(row).queryByText("Database 3"));

    expect(database1Row).toBeDefined();
    expect(within(database1Row!).getByText("PostgreSQL")).toBeInTheDocument();
    expect(within(database1Row!).getByAltText("PostgreSQL logo")).toBeInTheDocument();

    expect(database2Row).toBeDefined();
    expect(within(database2Row!).getByText("MongoDB")).toBeInTheDocument();
    expect(within(database2Row!).getByAltText("MongoDB logo")).toBeInTheDocument();

    expect(database3Row).toBeDefined();
    expect(within(database3Row!).getByText("Unknown")).toBeInTheDocument();
  });

  it("renders only the header row when no databases are available", () => {
    render(
      <MemoryRouter>
        <DatabaseList databases={[]} />
      </MemoryRouter>,
    );

    const table = screen.getByRole("table");

    expect(within(table).getAllByRole("row")).toHaveLength(1);
  });

  it("calls onClick with the database id when its row is clicked", async () => {
    const mockOnClick = vi.fn();

    render(
      <MemoryRouter>
        <DatabaseList databases={mockData} onClick={mockOnClick} />
      </MemoryRouter>,
    );

    const table = screen.getByRole("table");
    const rows = within(table).getAllByRole("row").slice(1);
    const database1Row = rows.find((row) => within(row).queryByText("Database 1"));

    expect(database1Row).toBeDefined();

    await userEvent.click(database1Row!);

    expect(mockOnClick).toHaveBeenCalledWith(1);
  });
});
