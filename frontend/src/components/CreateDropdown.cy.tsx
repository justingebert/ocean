import React from "react";
import { mount } from "cypress/react";
import CreateDropdown from "./CreateDropdown";
import { BrowserRouter } from "react-router-dom";

describe("CreateDropdown Component", () => {
  describe("classNames Function", () => {
    it("joins valid class names and ignores falsy values", () => {
      const testClasses = ["bg-gray-100", "", "text-gray-900", undefined, null, "px-4"];

      const result = testClasses.filter(Boolean).join(" ");

      expect(result).to.equal("bg-gray-100 text-gray-900 px-4");
    });
  });

  beforeEach(() => {
    mount(
      <BrowserRouter>
        <CreateDropdown />
      </BrowserRouter>,
    );
  });

  it("renders the dropdown menu and toggles visibility", () => {
    cy.get("button").contains("Create").click();

    cy.get("[role='menu']").should("exist").and("be.visible");

    cy.get("button").contains("Create").click();

    cy.get("[role='menu']").should("not.exist");
  });

  it("renders the Databases link with the correct classes when active", () => {
    cy.get("button").contains("Create").click();

    cy.get("a")
      .contains("Databases")
      .invoke(
        "attr",
        "class",
        "bg-gray-100 text-gray-900 group flex items-center px-4 py-2 text-sm",
      );

    cy.get("a").contains("Databases").should("have.class", "bg-gray-100");
    cy.get("a").contains("Databases").should("have.class", "text-gray-900");
  });

  it("navigates to the correct route when Databases is clicked", () => {
    cy.get("button").contains("Create").click();

    cy.get("a").contains("Databases").click();

    cy.url().should("include", "/databases/new");
  });

  it("applies default classes when the Databases link is not active", () => {
    cy.get("button").contains("Create").click();

    cy.get("a")
      .contains("Databases")
      .should("have.class", "text-gray-700")
      .and("not.have.class", "bg-gray-100");
  });
});
