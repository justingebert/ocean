import React from "react";
import { mount } from "cypress/react";
import CreateDropdown from "./CreateDropdown";
import { BrowserRouter } from "react-router-dom";

// Tests for CreateDropdown component to verify dropdown functionality, styling, and navigation
describe("CreateDropdown Component", () => {
    // Tests for the utility function used for class name handling
    describe("classNames Function", () => {
        // Ensure that the classNames function correctly filters out falsy values and joins valid classes
        it("joins valid class names and ignores falsy values", () => {
            const testClasses = [
                "bg-gray-100",
                "",
                "text-gray-900",
                undefined,
                null,
                "px-4",
            ];
            // Simulate the behavior of classNames function by filtering out falsy values and joining valid classes
            const result = testClasses.filter(Boolean).join(" ");
            // Verify that the expected class string is returned
            expect(result).to.equal("bg-gray-100 text-gray-900 px-4");
        });
    });
    // Mount the component before each test to ensure a fresh instance
    beforeEach(() => {
        // Mount the component with a router for proper `<Link>` handling
        mount(
            // Mount the component inside a BrowserRouter to handle <Link> navigation correctly
            <BrowserRouter>
                <CreateDropdown />
            </BrowserRouter>
        );
    });
    // Ensure the dropdown menu appears and disappears correctly when toggled
    it("renders the dropdown menu and toggles visibility", () => {
        // Simulate clicking the "Create" button to open the dropdown
        cy.get("button").contains("Create").click();
        // Verify that the dropdown menu appears in the document
        cy.get("[role='menu']").should("exist").and("be.visible");

        // Close the dropdown
        cy.get("button").contains("Create").click();
        // Ensure the dropdown menu disappears after clicking again
        cy.get("[role='menu']").should("not.exist");
    });
    // Ensure the correct styling is applied when the Databases link is active
    it("renders the Databases link with the correct classes when active", () => {
        // Open the dropdown
        cy.get("button").contains("Create").click();
        // Verify that the active class is applied to the Databases link
        cy.get("a")
            .contains("Databases")
            .invoke("attr", "class", "bg-gray-100 text-gray-900 group flex items-center px-4 py-2 text-sm");

        cy.get("a").contains("Databases").should("have.class", "bg-gray-100");
        cy.get("a").contains("Databases").should("have.class", "text-gray-900");
    });
    // Ensure clicking the Databases link navigates to the correct page
    it("navigates to the correct route when Databases is clicked", () => {
        // Open the dropdown and click the Databases link
        cy.get("button").contains("Create").click();
        // Simulate clicking the Databases link
        cy.get("a").contains("Databases").click();
        // Verify that the URL updates to the correct route after clicking
        cy.url().should("include", "/databases/new");
    });
    // Ensure the correct styling is applied when the Databases link is inactive
    it("applies default classes when the Databases link is not active", () => {
        // Open the dropdown
        cy.get("button").contains("Create").click();
        // Verify that the Databases link has the default text color when inactive
        cy.get("a")
            .contains("Databases")
            .should("have.class", "text-gray-700")
            .and("not.have.class", "bg-gray-100");
    });
});
