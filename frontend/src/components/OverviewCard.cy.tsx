import React from "react";
import { mount } from "cypress/react";
import OverviewCard from "./OverviewCard";
import { UserProperties } from "../types/user";
import { Database } from "../types/database";
import { EngineType } from "../types/engine";

describe("OverviewCard Component", () => {
  const mockUser: UserProperties = {
    id: 1,
    firstName: "John",
    lastName: "Doe",
    username: "johndoe",
    mail: "mail",
    employeeType: "Admin",
  };

  it("renders all fields with placeholders when no data is provided", () => {
    mount(<OverviewCard database={undefined} user={undefined} />);

    cy.get("dd.animate-pulse").should("have.length", 5);
  });

  it("handles PostgreSQL engine case correctly with a mocked connection string", () => {
    const mockPostgresDatabase = new Database({
      id: 1,
      name: "TestPostgresDB",
      engine: EngineType.PostgreSQL,
      createdAt: new Date(),
      userId: 123,
    });

    mockPostgresDatabase.connectionString = (username?: string) =>
      `mocked-psql-connection-string-${username}`;

    mount(<OverviewCard database={mockPostgresDatabase} user={mockUser} />);

    cy.contains("mocked-psql-connection-string-johndoe").should("exist");
  });

  it("copies the PostgreSQL connection string to clipboard", () => {
    cy.window().then((win) => {
      const typedWindow = win as Window & typeof globalThis;

      cy.stub(typedWindow.navigator.clipboard, "writeText").as("writeTextStub");
    });

    const mockPostgresDatabase = new Database({
      id: 1,
      name: "TestPostgresDB",
      engine: EngineType.PostgreSQL,
      createdAt: new Date(),
      userId: 123,
    });

    mockPostgresDatabase.connectionString = (username?: string) =>
      `mocked-psql-connection-string-${username}`;

    mount(<OverviewCard database={mockPostgresDatabase} user={mockUser} />);

    cy.contains("Strg-C").click();

    cy.get("@writeTextStub").should(
      "have.been.calledWith",
      "mocked-psql-connection-string-johndoe",
    );
  });

  it("handles MongoDB engine case correctly with a mocked connection string", () => {
    const mockMongoDatabase = new Database({
      id: 2,
      name: "TestMongoDB",
      engine: EngineType.MongoDB,
      createdAt: new Date(),
      userId: 456,
    });

    mockMongoDatabase.connectionString = () => `mocked-mongodb-connection-string`;

    mount(<OverviewCard database={mockMongoDatabase} user={mockUser} />);

    cy.contains("mocked-mongodb-connection-string").should("exist");
  });

  it("renders the Adminer link for PostgreSQL and validates its URL", () => {
    const mockPostgresDatabase = new Database({
      id: 1,
      name: "TestPostgresDB",
      engine: EngineType.PostgreSQL,
      createdAt: new Date(),
      userId: 123,
    });

    mockPostgresDatabase.connectionString = (username?: string) =>
      `mocked-psql-connection-string-${username}`;
    const expectedAdminerUrl = mockPostgresDatabase.adminUrl || "#";

    mount(<OverviewCard database={mockPostgresDatabase} user={mockUser} />);
    cy.get("a").contains("Adminer").should("have.attr", "href", expectedAdminerUrl);
  });
  it("renders the MongoDB Compass link with the credentialed connection string", () => {
    const mockMongoDatabase = new Database({
      id: 2,
      name: "TestMongoDB",
      engine: EngineType.MongoDB,
      createdAt: new Date(),
      userId: 456,
    });

    const mongoUser = {
      id: 1,
      instanceId: 2,
      name: "TestMongoDB",
      password: "secret",
    };

    mount(<OverviewCard database={mockMongoDatabase} user={mockUser} mongoUser={mongoUser} />);
    cy.get("a")
      .contains("MongoDB Compass")
      .should(
        "have.attr",
        "href",
        mockMongoDatabase.connectionString(mongoUser.name, mongoUser.password),
      );
    cy.get("a")
      .contains("Download Compass")
      .should("have.attr", "href", "https://www.mongodb.com/try/download/compass");
  });
  it("does not render the Compass download link for PostgreSQL", () => {
    const mockPostgresDatabase = new Database({
      id: 1,
      name: "TestPostgresDB",
      engine: EngineType.PostgreSQL,
      createdAt: new Date(),
      userId: 123,
    });

    mount(<OverviewCard database={mockPostgresDatabase} user={mockUser} />);
    cy.contains("Download Compass").should("not.exist");
  });

  it("handles the undefined database case correctly", () => {
    mount(<OverviewCard database={undefined} user={undefined} />);
  });
});
