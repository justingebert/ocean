import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { DatabaseAdminList } from "./DatabaseAdminList.tsx";
import { Database } from "@/features/databases/model/database.ts";
import { EngineType } from "@/features/databases/model/engine.ts";

const mockData: ReadonlyArray<Database> = [
  new Database({
    id: 1,
    name: "Database 1",
    engine: EngineType.PostgreSQL,
    createdAt: new Date("2023-01-01T00:00:00Z"),
    expiresAt: null,
    userId: 100,
  }),
  new Database({
    id: 2,
    name: "Database 2",
    engine: EngineType.MongoDB,
    createdAt: new Date("2023-02-01T00:00:00Z"),
    expiresAt: null,
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

  it("calls onDelete only after the delete is confirmed", async () => {
    const mockOnDelete = vi.fn();

    render(<DatabaseAdminList databases={mockData} onDelete={mockOnDelete} />);

    const database1Row = screen
      .getAllByRole("row")
      .find((row) => within(row).queryByText("Database 1"));

    await userEvent.click(
      within(database1Row!).getByRole("button", { name: "Actions: Database 1" }),
    );
    await userEvent.click(await screen.findByRole("menuitem", { name: "Delete database" }));
    expect(mockOnDelete).not.toHaveBeenCalled();

    const dialog = await screen.findByRole("alertdialog");
    await userEvent.click(within(dialog).getByRole("button", { name: "Delete" }));

    expect(mockOnDelete).toHaveBeenCalledWith(mockData[0]);
  });

  it("renders databases sorted by createdAt in descending order", () => {
    render(<DatabaseAdminList databases={mockData} />);

    const rows = screen.getAllByRole("row").slice(1);
    const databaseNames = rows.map((row) => within(row).getByText(/Database \d+/).textContent);

    expect(databaseNames).toEqual(["Database 2", "Database 1"]);
  });

  it("shows Never in the Expires column for databases without an expiry date", () => {
    render(<DatabaseAdminList databases={[mockData[0]]} />);

    expect(screen.getByRole("cell", { name: "Never" })).toBeInTheDocument();
  });

  it("checks Never expires in the row menu only for databases without an expiry date", async () => {
    const databases = [
      new Database({ ...mockData[0].props, expiresAt: new Date(2027, 4, 6) }),
      mockData[1],
    ];

    render(<DatabaseAdminList databases={databases} />);

    await userEvent.click(screen.getByRole("button", { name: "Actions: Database 1" }));
    expect(
      await screen.findByRole("menuitemcheckbox", { name: "Never expires" }),
    ).not.toBeChecked();
    await userEvent.keyboard("{Escape}");

    await userEvent.click(screen.getByRole("button", { name: "Actions: Database 2" }));
    expect(await screen.findByRole("menuitemcheckbox", { name: "Never expires" })).toBeChecked();
  });

  it("calls onNeverExpiresChange when Never expires is toggled", async () => {
    const onNeverExpiresChange = vi.fn();
    const database = new Database({ ...mockData[0].props, expiresAt: new Date(2027, 4, 6) });

    render(
      <DatabaseAdminList databases={[database]} onNeverExpiresChange={onNeverExpiresChange} />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Actions: Database 1" }));
    await userEvent.click(await screen.findByRole("menuitemcheckbox", { name: "Never expires" }));

    expect(onNeverExpiresChange).toHaveBeenCalledWith(database, true);
  });

  it("shows the owner's username when it is known", () => {
    render(
      <DatabaseAdminList
        databases={mockData}
        getOwnerName={(userId) => (userId === 100 ? "ada" : undefined)}
      />,
    );

    const rows = screen.getAllByRole("row").slice(1);
    const database1Row = rows.find((row) => within(row).queryByText("Database 1"));
    const database2Row = rows.find((row) => within(row).queryByText("Database 2"));

    expect(within(database1Row!).getByText("ada")).toBeInTheDocument();
    expect(within(database2Row!).getByText("101")).toBeInTheDocument();
  });
});
