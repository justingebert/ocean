import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import DatabaseList from "./DatabaseList";
import { DatabaseProperties } from "../../types/database";
import { engineOptions } from "../../constants/engines";
import { EngineTypeValues } from "../../types/engine";

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
  it("renders a list of databases in mobile view", () => {
    render(
      <MemoryRouter>
        <DatabaseList databases={mockData} />
      </MemoryRouter>,
    );

    const mobileContainer = screen.getByRole("list");
    const mobileDatabaseItems = within(mobileContainer).getAllByRole("listitem");

    expect(mobileDatabaseItems).toHaveLength(mockData.length);

    const database1Item = mobileDatabaseItems.find((item) =>
      within(item).queryByText("Database 1"),
    );
    const database2Item = mobileDatabaseItems.find((item) =>
      within(item).queryByText("Database 2"),
    );
    const database3Item = mobileDatabaseItems.find((item) =>
      within(item).queryByText("Database 3"),
    );

    expect(database1Item).toBeDefined();
    expect(within(database1Item!).getByText("PostgreSQL")).toBeInTheDocument();
    expect(within(database1Item!).getByAltText("PostgreSQL logo")).toBeInTheDocument();

    expect(database2Item).toBeDefined();
    expect(within(database2Item!).getByText("MongoDB")).toBeInTheDocument();
    expect(within(database2Item!).getByAltText("MongoDB logo")).toBeInTheDocument();

    expect(database3Item).toBeDefined();
    expect(within(database3Item!).getByText("Unknown")).toBeInTheDocument();
  });

  it("renders a list of databases in desktop view", () => {
    render(
      <MemoryRouter>
        <DatabaseList databases={mockData} />
      </MemoryRouter>,
    );

    const desktopContainer = screen.getByRole("table");
    const desktopDatabaseRows = within(desktopContainer).getAllByRole("row");

    const databaseRows = desktopDatabaseRows.slice(1);

    expect(databaseRows).toHaveLength(mockData.length);

    const database1Row = databaseRows.find((row) => within(row).queryByText("Database 1"));
    const database2Row = databaseRows.find((row) => within(row).queryByText("Database 2"));
    const database3Row = databaseRows.find((row) => within(row).queryByText("Database 3"));

    expect(database1Row).toBeDefined();
    expect(within(database1Row!).getByText("PostgreSQL")).toBeInTheDocument();
    expect(within(database1Row!).getByAltText("PostgreSQL logo")).toBeInTheDocument();

    expect(database2Row).toBeDefined();
    expect(within(database2Row!).getByText("MongoDB")).toBeInTheDocument();
    expect(within(database2Row!).getByAltText("MongoDB logo")).toBeInTheDocument();

    expect(database3Row).toBeDefined();
    expect(within(database3Row!).getByText("Unknown")).toBeInTheDocument();
  });

  it("renders empty containers when no databases are available", () => {
    render(
      <MemoryRouter>
        <DatabaseList databases={[]} />
      </MemoryRouter>,
    );

    const mobileContainer = screen.getByRole("list");

    expect(within(mobileContainer).queryAllByRole("listitem")).toHaveLength(0);

    const desktopContainer = screen.getByRole("table");
    const desktopRows = within(desktopContainer).queryAllByRole("row");

    expect(desktopRows).toHaveLength(1);
  });

  it("calls onClick when a database is clicked", async () => {
    const mockOnClick = vi.fn();

    render(
      <MemoryRouter>
        <DatabaseList databases={mockData} onClick={mockOnClick} />
      </MemoryRouter>,
    );

    const databaseElements = screen.getAllByText(/Database 1/i);

    await userEvent.click(databaseElements[0]);

    expect(mockOnClick).toHaveBeenCalledWith(1);
  });

  it("calls onClick when a row is clicked in desktop view", async () => {
    const mockOnClick = vi.fn();

    render(
      <MemoryRouter>
        <DatabaseList databases={mockData} onClick={mockOnClick} />
      </MemoryRouter>,
    );

    const desktopContainer = screen.getByRole("table");
    const desktopDatabaseRows = within(desktopContainer).getAllByRole("row");

    const databaseRows = desktopDatabaseRows.slice(1);

    const database1Row = databaseRows.find((row) => within(row).queryByText("Database 1"));

    expect(database1Row).toBeDefined();

    await userEvent.click(database1Row!);

    expect(mockOnClick).toHaveBeenCalledWith(1);
  });
});
