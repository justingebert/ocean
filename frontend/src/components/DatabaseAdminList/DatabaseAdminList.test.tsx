import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { DatabaseAdminList } from "./DatabaseAdminList";
import { Database } from "../../types/database";
import { EngineType } from "../../types/engine";

const mockData: ReadonlyArray<Database> = [
  new Database({
    id: 1,
    name: "Database 1",
    engine: EngineType.PostgreSQL,
    createdAt: new Date("2023-01-01T00:00:00Z"),
    userId: 100,
  }),
  new Database({
    id: 2,
    name: "Database 2",
    engine: EngineType.MongoDB,
    createdAt: new Date("2023-02-01T00:00:00Z"),
    userId: 101,
  }),
];

describe("<DatabaseAdminList />", () => {
  it("renders a list of databases with correct details", () => {
    render(<DatabaseAdminList databases={mockData} />);

    const rows = screen.getAllByRole("row").slice(1);
    expect(rows).toHaveLength(mockData.length);

    const database1Row = rows.find((row) => within(row).queryByText("Database 1"));

    expect(database1Row).toBeDefined();

    expect(within(database1Row!).getByText("100")).toBeInTheDocument();
    expect(within(database1Row!).getByText("PostgreSQL")).toBeInTheDocument();
  });

  it("renders no rows when the database list is empty", () => {
    render(<DatabaseAdminList databases={[]} />);

    const rows = screen.queryAllByRole("row").slice(1);
    expect(rows).toHaveLength(0);
  });

  it("calls onDelete with the correct database when 'Delete' is clicked", async () => {
    const mockOnDelete = vi.fn();

    render(<DatabaseAdminList databases={mockData} onDelete={mockOnDelete} />);

    const database1Row = screen
      .getAllByRole("row")
      .find((row) => within(row).queryByText("Database 1"));

    const deleteAction = within(database1Row!).getByText("Delete");
    await userEvent.click(deleteAction);

    expect(mockOnDelete).toHaveBeenCalledWith(mockData[0]);
  });

  it("renders databases sorted by createdAt in descending order", () => {
    render(<DatabaseAdminList databases={mockData} />);

    const rows = screen.getAllByRole("row").slice(1);
    const databaseNames = rows.map((row) => within(row).getByText(/Database \d+/).textContent);

    expect(databaseNames).toEqual(["Database 2", "Database 1"]);
  });
});
