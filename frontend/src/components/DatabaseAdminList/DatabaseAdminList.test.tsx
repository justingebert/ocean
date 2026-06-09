import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { DatabaseAdminList } from "./DatabaseAdminList";
import { Database } from "../../types/database";
import { EngineType } from "../../types/engine";
// Mock database data used for testing component rendering and interactions
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
// Tests for DatabaseAdminList component, ensuring it correctly displays, sorts, and handles user interactions
describe("<DatabaseAdminList />", () => {
  // Verify that the component correctly renders database rows with expected details
  it("renders a list of databases with correct details", () => {
    render(<DatabaseAdminList databases={mockData} />);
    // Select all database rows while excluding the header row
    const rows = screen.getAllByRole("row").slice(1); // Exclude the header row
    expect(rows).toHaveLength(mockData.length);

    const database1Row = rows.find((row) => within(row).queryByText("Database 1"));
    // Ensure that the first database entry exists in the table
    expect(database1Row).toBeDefined();
    // Verify that the owner ID of the database is displayed correctly
    expect(within(database1Row!).getByText("100")).toBeInTheDocument(); // Owner ID
    expect(within(database1Row!).getByText("PostgreSQL")).toBeInTheDocument();
  });
  // Ensure the component handles an empty database list gracefully
  it("renders no rows when the database list is empty", () => {
    render(<DatabaseAdminList databases={[]} />);
    // Select rows but expect none when the database list is empty
    const rows = screen.queryAllByRole("row").slice(1); // Exclude the header row
    expect(rows).toHaveLength(0);
  });
  // Verify that clicking 'Delete' triggers the onDelete callback with the correct database
  it("calls onDelete with the correct database when 'Delete' is clicked", async () => {
    // Mock the onDelete function to track calls and validate correct behavior
    const mockOnDelete = vi.fn(); // Replace jest.fn() with vi.fn()

    render(<DatabaseAdminList databases={mockData} onDelete={mockOnDelete} />);

    const database1Row = screen
      .getAllByRole("row")
      .find((row) => within(row).queryByText("Database 1"));
    // Locate the 'Delete' button within the first database row
    const deleteAction = within(database1Row!).getByText("Delete");
    await userEvent.click(deleteAction);
    // Ensure that the correct database entry was passed to the onDelete callback
    expect(mockOnDelete).toHaveBeenCalledWith(mockData[0]);
  });
  // Ensure that databases are displayed in descending order based on createdAt
  it("renders databases sorted by createdAt in descending order", () => {
    render(<DatabaseAdminList databases={mockData} />);

    const rows = screen.getAllByRole("row").slice(1); // Exclude the header row
    const databaseNames = rows.map((row) => within(row).getByText(/Database \d+/).textContent);
    // Confirm that the sorting logic correctly arranges databases from newest to oldest
    expect(databaseNames).toEqual(["Database 2", "Database 1"]); // Descending order
  });
});
