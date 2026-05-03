import {mount} from "cypress/react";
import CreateRoleForm from "./CreateRoleForm";
import {EngineType} from "../../types/engine";

describe("CreateRoleForm Component", () => {
  // Mock database object to simulate a real database instance for testing
  const mockDatabase = {
    name: "testDB",
    id: 1234,
    engine: EngineType.PostgreSQL,
    createdAt: new Date("2023-01-01T00:00:00Z"),
    userId: 5678,
  };
  // Declare stub variables to track form submission and cancel button interactions
  let mockOnSubmit: Cypress.Agent<sinon.SinonSpy>; // Declare variables for stubs
  let mockOnClose: Cypress.Agent<sinon.SinonSpy>;
  // Setup stubs, mock API responses, and mount the component before each test
  beforeEach(() => {
    // Create a stub for form submission to track when it gets called
    mockOnSubmit = cy.stub().as("onSubmit");
    // Create a stub for closing the form to track when the cancel button is clicked
    mockOnClose = cy.stub().as("onClose");

    // Mock API response to check if a role name is available or already registered
    cy.intercept("POST", "/v1/roles/_availability_", (req) => {
      const { instanceId, roleName } = req.body;
      if (instanceId === mockDatabase.id && roleName === "validrole") {
        req.reply({ statusCode: 200, body: { availability: true } });
      } else {
        req.reply({ statusCode: 200, body: { availability: false } });
      }
    }).as("checkRoleAvailability");

    // Mount the CreateRoleForm component with the mock database and stub functions
    mount(
        <CreateRoleForm
            database={mockDatabase}
            onSubmit={mockOnSubmit}
            onClose={mockOnClose}
        />
    );
  });
  // Ensure validation errors are displayed for empty, short, or incorrectly formatted role names
  it("displays validation errors for invalid input", () => {
    // Submit the form with an empty role name
    cy.get("button[type='submit']").click();
    // Verify that an error message appears when the role name is empty
    cy.contains("Name is required").should("exist");

    // Enter a role name with fewer than 4 characters
    cy.get("input#roleName").type("abc");
    cy.get("button[type='submit']").click();
    // Confirm that an error message is displayed for short role names
    cy.contains("Name should be of minimum 4 characters length").should("exist");

    // Enter a role name with an invalid format
    cy.get("input#roleName").clear().type("1invalid");
    cy.get("button[type='submit']").click();
    // Ensure the form enforces correct role name formatting
    cy.contains("Name must begin with a letter (a-z)").should("exist");
  });
  // Ensure the form prevents submission when the role name is already registered
  it("disables form submission for unavailable roles", () => {
    // Enter an unavailable role name
    cy.get("input#roleName").type("unavailablerole");
    cy.get("button[type='submit']").click();

    // Wait for the API call
    cy.wait("@checkRoleAvailability");

    // Ensure the error message for unavailable role is displayed
    cy.contains("Name is already registered").should("exist");
  });
  // Ensure the form closes when the cancel button is clicked
  it("calls onClose when the cancel button is clicked", () => {
    // Simulate clicking the cancel button to close the form
    cy.contains("Cancel").click();
    // Verify that the onClose function was triggered
    cy.get("@onClose").should("have.been.called");
  });
});

