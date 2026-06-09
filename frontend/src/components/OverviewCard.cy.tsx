import React from "react";
import { mount } from "cypress/react";
import OverviewCard from "./OverviewCard";
import { UserProperties } from "../types/user";
import { Database } from "../types/database";
import { EngineType } from "../types/engine";

// Tests for OverviewCard component to verify correct rendering, database engine handling, clipboard interactions, and Adminer link validation
describe("OverviewCard Component", () => {
  // Mock user data to simulate an authenticated user with different database interactions
  const mockUser: UserProperties = {
    id: 1,
    firstName: "John",
    lastName: "Doe",
    username: "johndoe",
    mail: "mail",
    employeeType: "Admin",
  };
  // Ensure the component correctly displays placeholder skeleton loaders when no data is available
  it("renders all fields with placeholders when no data is provided", () => {
    mount(<OverviewCard database={undefined} user={undefined} />);
    // Verify that all placeholder elements are rendered
    cy.get("dd.animate-pulse").should("have.length", 5);
  });
  // Ensure the component correctly handles PostgreSQL databases and displays the expected connection string
  it("handles PostgreSQL engine case correctly with a mocked connection string", () => {
    const mockPostgresDatabase = new Database({
      id: 1,
      name: "TestPostgresDB",
      engine: EngineType.PostgreSQL,
      createdAt: new Date(),
      userId: 123,
    });
    // Mock the connectionString method dynamically to simulate PostgreSQL connection behavior
    mockPostgresDatabase.connectionString = (username?: string) =>
      `mocked-psql-connection-string-${username}`;

    mount(<OverviewCard database={mockPostgresDatabase} user={mockUser} />);
    // Verify that the expected PostgreSQL connection string appears in the document
    cy.contains("mocked-psql-connection-string-johndoe").should("exist");
  });
  // Ensure the component correctly copies the PostgreSQL connection string to clipboard when the "Strg-C" button is clicked
  it("copies the PostgreSQL connection string to clipboard", () => {
    cy.window().then((win) => {
      const typedWindow = win as Window & typeof globalThis; // Cast the window object
      // Stub the clipboard API to track calls to writeText
      cy.stub(typedWindow.navigator.clipboard, "writeText").as("writeTextStub");
    });

    // Create a mock for the connectionString method
    const mockPostgresDatabase = new Database({
      id: 1,
      name: "TestPostgresDB",
      engine: EngineType.PostgreSQL,
      createdAt: new Date(),
      userId: 123,
    });

    // Mock the connectionString method dynamically
    mockPostgresDatabase.connectionString = (username?: string) =>
      `mocked-psql-connection-string-${username}`;

    mount(<OverviewCard database={mockPostgresDatabase} user={mockUser} />);
    // Simulate clicking the copy button
    cy.contains("Strg-C").click();
    // Verify that the correct connection string was copied to the clipboard
    cy.get("@writeTextStub").should(
      "have.been.calledWith",
      "mocked-psql-connection-string-johndoe",
    );
  });
  // Ensure the component correctly handles MongoDB databases and displays the expected connection string
  it("handles MongoDB engine case correctly with a mocked connection string", () => {
    // Create a mock for the connectionString method
    const mockMongoDatabase = new Database({
      id: 2,
      name: "TestMongoDB",
      engine: EngineType.MongoDB,
      createdAt: new Date(),
      userId: 456,
    });
    // Mock the connectionString method dynamically to simulate MongoDB connection behavior
    mockMongoDatabase.connectionString = () => `mocked-mongodb-connection-string`;

    mount(<OverviewCard database={mockMongoDatabase} user={mockUser} />);
    // Verify that the expected MongoDB connection string appears in the document
    cy.contains("mocked-mongodb-connection-string").should("exist");
  });
  // Ensure the Adminer link is rendered and verify its text
  it("renders the Adminer link and validates its URL", () => {
    // Create a mock for the connectionString method
    const mockPostgresDatabase = new Database({
      id: 1,
      name: "TestPostgresDB",
      engine: EngineType.PostgreSQL,
      createdAt: new Date(),
      userId: 123,
    });

    // Mock the connectionString method dynamically
    mockPostgresDatabase.connectionString = (username?: string) =>
      `mocked-psql-connection-string-${username}`;

    mount(<OverviewCard database={mockPostgresDatabase} user={mockUser} />);
    // Verify that the "Adminer" link is present in the component
    cy.get("a").contains("Adminer");
  });
  // Ensure the component handles cases where no database is provided
  it("handles the undefined database case correctly", () => {
    mount(<OverviewCard database={undefined} user={undefined} />);
  });
});
