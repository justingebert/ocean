import React from "react";
import { mount } from "cypress/react";
import { UserAdminList, UserAdminListProps } from "./UserAdminList";
import { UserProperties } from "../../types/user";

describe("UserAdminList Component", () => {
  const mockUsers: ReadonlyArray<UserProperties> = [
    {
      id: 3,
      firstName: "John",
      lastName: "Doe",
      username: "johndoe",
      mail: "aaa",
      employeeType: "Admin",
    },
    {
      id: 1,
      firstName: "Jane",
      lastName: "Smith",
      username: "janesmith",
      mail: "bbb",
      employeeType: "Staff",
    },
    {
      id: 2,
      firstName: "Alice",
      lastName: "Brown",
      username: "alicebrown",
      mail: "ccc",
      employeeType: "Guest",
    },
  ];

  const defaultProps: UserAdminListProps = {
    users: mockUsers,
  };

  beforeEach(() => {
    mount(<UserAdminList {...defaultProps} />);
  });

  it("renders the table with headers", () => {
    cy.get("table").should("exist");

    cy.contains("thead th", "User ID").should("exist");
    cy.contains("thead th", "Firstname").should("exist");
    cy.contains("thead th", "Lastname").should("exist");
    cy.contains("thead th", "Username").should("exist");
    cy.contains("thead th", "Employee").should("exist");
  });

  it("renders users in descending order of ID", () => {
    cy.get("tbody tr").eq(0).contains("td", "3");

    cy.get("tbody tr").eq(1).contains("td", "2");
    cy.get("tbody tr").eq(2).contains("td", "1");
  });

  it("displays the correct user data", () => {
    cy.get("tbody tr")
      .eq(0)
      .within(() => {
        cy.contains("td", "John");
        cy.contains("td", "Doe");
        cy.contains("td", "johndoe");
      });

    cy.get("tbody tr")
      .eq(1)
      .within(() => {
        cy.contains("td", "Alice");
        cy.contains("td", "Brown");
        cy.contains("td", "alicebrown");
      });

    cy.get("tbody tr")
      .eq(2)
      .within(() => {
        cy.contains("td", "Jane");
        cy.contains("td", "Smith");
        cy.contains("td", "janesmith");
      });
  });

  it("applies correct styles to employee type badges", () => {
    cy.get("tbody tr")
      .eq(0)
      .contains("td", "Admin")
      .within(() => {
        cy.get("span")

          .should("have.class", "bg-green-100")

          .and("have.class", "text-green-800")

          .and("have.class", "rounded-full");
      });
  });
});
