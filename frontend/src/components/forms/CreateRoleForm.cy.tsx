import { mount } from "cypress/react";
import CreateRoleForm from "./CreateRoleForm";
import { EngineType } from "../../types/engine";

describe("CreateRoleForm Component", () => {
  const mockDatabase = {
    name: "testDB",
    id: 1234,
    engine: EngineType.PostgreSQL,
    createdAt: new Date("2023-01-01T00:00:00Z"),
    userId: 5678,
  };

  let mockOnSubmit: Cypress.Agent<sinon.SinonSpy>;
  let mockOnClose: Cypress.Agent<sinon.SinonSpy>;

  beforeEach(() => {
    mockOnSubmit = cy.stub().as("onSubmit");

    mockOnClose = cy.stub().as("onClose");

    cy.intercept("POST", "/v1/roles/_availability_", (req) => {
      const { instanceId, roleName } = req.body;
      if (instanceId === mockDatabase.id && roleName === "validrole") {
        req.reply({ statusCode: 200, body: { availability: true } });
      } else {
        req.reply({ statusCode: 200, body: { availability: false } });
      }
    }).as("checkRoleAvailability");

    mount(<CreateRoleForm database={mockDatabase} onSubmit={mockOnSubmit} onClose={mockOnClose} />);
  });

  it("displays validation errors for invalid input", () => {
    cy.get("button[type='submit']").click();

    cy.contains("Name is required").should("exist");

    cy.get("input#roleName").type("abc");
    cy.get("button[type='submit']").click();

    cy.contains("Name should be of minimum 4 characters length").should("exist");

    cy.get("input#roleName").clear().type("1invalid");
    cy.get("button[type='submit']").click();

    cy.contains("Name must begin with a letter (a-z)").should("exist");
  });

  it("disables form submission for unavailable roles", () => {
    cy.get("input#roleName").type("unavailablerole");
    cy.get("button[type='submit']").click();

    cy.wait("@checkRoleAvailability");

    cy.contains("Name is already registered").should("exist");
  });

  it("calls onClose when the cancel button is clicked", () => {
    cy.contains("Cancel").click();

    cy.get("@onClose").should("have.been.called");
  });
});
