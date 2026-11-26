import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";
import DatabaseList from "./DatabaseList.tsx";
import { DatabaseProperties } from "@/features/databases/model/database.ts";
import { engineOptions } from "@/features/databases/constants/engines";
import { EngineTypeValues } from "@/features/databases/model/engine.ts";

const mockData: readonly DatabaseProperties[] = [
  {
    id: 1,
    name: "Database 1",
    engine: engineOptions.find((e) => e.label === "PostgreSQL")?.value as EngineTypeValues,
    createdAt: new Date("2023-01-01T00:00:00Z"),
    expiresAt: null,
    userId: 100,
  },
  {
    id: 2,
    name: "Database 2",
    engine: engineOptions.find((e) => e.label === "MongoDB")?.value as EngineTypeValues,
    createdAt: new Date("2023-02-01T00:00:00Z"),
    expiresAt: null,
    userId: 101,
  },
  {
    id: 3,
    name: "Database 3",
    engine: "X" as EngineTypeValues,
    createdAt: new Date("2023-03-01T00:00:00Z"),
    expiresAt: null,
    userId: 102,
  },
];

const href = (id: number) => `/databases/${id}`;

describe("<DatabaseList />", () => {
  it("renders a row per database with its engine", () => {
    render(
      <MemoryRouter>
        <DatabaseList databases={mockData} getHref={href} />
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
    // The logo is decorative, so the link is named by the database alone.
    expect(within(database1Row!).getByRole("link", { name: "Database 1" })).toBeInTheDocument();

    expect(database2Row).toBeDefined();
    expect(within(database2Row!).getByText("MongoDB")).toBeInTheDocument();
    expect(within(database2Row!).getByRole("link", { name: "Database 2" })).toBeInTheDocument();

    expect(database3Row).toBeDefined();
    expect(within(database3Row!).getByText("Unknown")).toBeInTheDocument();
  });

  it("renders only the header row when no databases are available", () => {
    render(
      <MemoryRouter>
        <DatabaseList databases={[]} getHref={href} />
      </MemoryRouter>,
    );

    const table = screen.getByRole("table");

    expect(within(table).getAllByRole("row")).toHaveLength(1);
  });

  it("links each database name to its page", () => {
    render(
      <MemoryRouter>
        <DatabaseList databases={mockData} getHref={href} />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: /Database 1/ })).toHaveAttribute(
      "href",
      "/databases/1",
    );
  });

  it("shows the expiry as relative time, or Never for databases that never expire", () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 10, 6));

    const databases: DatabaseProperties[] = [
      { ...mockData[0], expiresAt: new Date(2027, 4, 6) },
      { ...mockData[1], expiresAt: null },
    ];

    render(
      <MemoryRouter>
        <DatabaseList databases={databases} getHref={href} />
      </MemoryRouter>,
    );

    const rows = within(screen.getByRole("table")).getAllByRole("row").slice(1);
    const database1Row = rows.find((row) => within(row).queryByText("Database 1"));
    const database2Row = rows.find((row) => within(row).queryByText("Database 2"));

    expect(within(database1Row!).getByText("in 6 months")).toBeInTheDocument();
    expect(within(database2Row!).getByText("Never")).toBeInTheDocument();

    vi.useRealTimers();
  });
});
