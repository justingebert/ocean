import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import DatabaseList from "./DatabaseList";
import { DatabaseProperties } from "../../types/database";
import { engineOptions } from "../../constants/engines";
import { EngineTypeValues } from "../../types/engine";

// Mock database data used for testing different rendering and interaction scenarios
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
        engine: "X" as EngineTypeValues, // Unsupported engine value
        createdAt: new Date("2023-03-01T00:00:00Z"),
        userId: 102,
    },
];
// Tests for DatabaseList component to ensure proper rendering, interactivity, and behavior
describe("<DatabaseList />", () => {
    // Ensure the component renders correctly in mobile view using a list-based layout
    it("renders a list of databases in mobile view", () => {
        render(
            <MemoryRouter>
                <DatabaseList databases={mockData} />
            </MemoryRouter>
        );
        // Select the mobile list container (assumed to be a <ul> element)
        const mobileContainer = screen.getByRole("list"); // Assuming <ul> is used for mobile view
        const mobileDatabaseItems = within(mobileContainer).getAllByRole("listitem");
        // Ensure the number of displayed databases matches the mock data
        expect(mobileDatabaseItems).toHaveLength(mockData.length);

        const database1Item = mobileDatabaseItems.find((item) =>
            within(item).queryByText("Database 1")
        );
        const database2Item = mobileDatabaseItems.find((item) =>
            within(item).queryByText("Database 2")
        );
        const database3Item = mobileDatabaseItems.find((item) =>
            within(item).queryByText("Database 3")
        );

        expect(database1Item).toBeDefined();
        expect(within(database1Item!).getByText("PostgreSQL")).toBeInTheDocument();

        expect(database2Item).toBeDefined();
        expect(within(database2Item!).getByText("MongoDB")).toBeInTheDocument();
        // Verify that an unsupported engine type displays "Unknown"
        expect(database3Item).toBeDefined();
        expect(within(database3Item!).getByText("Unknown")).toBeInTheDocument();
    });
    // Ensure the component renders correctly in desktop view using a table-based layout
    it("renders a list of databases in desktop view", () => {
        render(
            <MemoryRouter>
                <DatabaseList databases={mockData} />
            </MemoryRouter>
        );
        // Select the table container for desktop view
        const desktopContainer = screen.getByRole("table");
        const desktopDatabaseRows = within(desktopContainer).getAllByRole("row");
        // Exclude the header row when checking database rows
        const databaseRows = desktopDatabaseRows.slice(1);

        expect(databaseRows).toHaveLength(mockData.length);

        const database1Row = databaseRows.find((row) =>
            within(row).queryByText("Database 1")
        );
        const database2Row = databaseRows.find((row) =>
            within(row).queryByText("Database 2")
        );
        const database3Row = databaseRows.find((row) =>
            within(row).queryByText("Database 3")
        );

        expect(database1Row).toBeDefined();
        expect(within(database1Row!).getByText("PostgreSQL")).toBeInTheDocument();

        expect(database2Row).toBeDefined();
        expect(within(database2Row!).getByText("MongoDB")).toBeInTheDocument();
        // Ensure that unsupported engine types are displayed as "Unknown"
        expect(database3Row).toBeDefined();
        expect(within(database3Row!).getByText("Unknown")).toBeInTheDocument();
    });
    // Ensure the component handles empty database lists gracefully
    it("renders empty containers when no databases are available", () => {
        render(
            <MemoryRouter>
                <DatabaseList databases={[]} />
            </MemoryRouter>
        );

        const mobileContainer = screen.getByRole("list");
        // Confirm that no list items are rendered in mobile view when there are no databases
        expect(within(mobileContainer).queryAllByRole("listitem")).toHaveLength(0);

        const desktopContainer = screen.getByRole("table");
        const desktopRows = within(desktopContainer).queryAllByRole("row");
        // Ensure that only the table header row is rendered when the database list is empty
        expect(desktopRows).toHaveLength(1); // Only the header row should be present
    });
    // Ensure clicking a database triggers the onClick callback with the correct ID
    it("calls onClick when a database is clicked", async () => {
        // Mock the onClick function to track calls and validate correct behavior
        const mockOnClick = vi.fn(); // Replace jest.fn() with vi.fn()

        render(
            <MemoryRouter>
                <DatabaseList databases={mockData} onClick={mockOnClick} />
            </MemoryRouter>
        );

        const databaseElements = screen.getAllByText(/Database 1/i);
        // Simulate clicking on a database entry
        await userEvent.click(databaseElements[0]);
        // Verify that the correct database ID is passed to the onClick handler
        expect(mockOnClick).toHaveBeenCalledWith(1);
    });
    // Ensure clicking a database row in desktop view triggers the onClick callback
    it("calls onClick when a row is clicked in desktop view", async () => {
        const mockOnClick = vi.fn(); // Replace jest.fn() with vi.fn()

        render(
            <MemoryRouter>
                <DatabaseList databases={mockData} onClick={mockOnClick} />
            </MemoryRouter>
        );
        // Select the desktop table container
        const desktopContainer = screen.getByRole("table");
        const desktopDatabaseRows = within(desktopContainer).getAllByRole("row");

        const databaseRows = desktopDatabaseRows.slice(1);

        const database1Row = databaseRows.find((row) =>
            within(row).queryByText("Database 1")
        );

        expect(database1Row).toBeDefined();
        // Simulate clicking on the first database row
        await userEvent.click(database1Row!);
        // Confirm that clicking a row calls onClick with the correct database ID
        expect(mockOnClick).toHaveBeenCalledWith(1);
    });
});
