import React from "react";
import { mount } from "cypress/react";
import { UserAdminList, UserAdminListProps } from "./UserAdminList";
import { UserProperties } from "../../types/user";

describe("UserAdminList Component", () => {
    // Mock data representing a list of users with different roles for testing rendering and ordering
    const mockUsers: ReadonlyArray<UserProperties> = [
        { id: 3, firstName: "John", lastName: "Doe", username: "johndoe", mail:"aaa", employeeType: "Admin" },
        { id: 1, firstName: "Jane", lastName: "Smith", username: "janesmith", mail:"bbb", employeeType: "Staff" },
        { id: 2, firstName: "Alice", lastName: "Brown", username: "alicebrown", mail:"ccc", employeeType: "Guest" },
    ];
    // Default props for rendering the UserAdminList component in tests
    const defaultProps: UserAdminListProps = {
        users: mockUsers,
    };
    // Mount the component before each test to ensure a fresh instance
    beforeEach(() => {
        // Mount the component
        mount(<UserAdminList {...defaultProps} />);
    });
    // Ensure the component renders a table with the expected column headers
    it("renders the table with headers", () => {
        // Verify that the table element exists in the document
        cy.get("table").should("exist");
        // Confirm that the "User ID" column header is displayed
        cy.contains("thead th", "User ID").should("exist");
        cy.contains("thead th", "Firstname").should("exist");
        cy.contains("thead th", "Lastname").should("exist");
        cy.contains("thead th", "Username").should("exist");
        cy.contains("thead th", "Employee").should("exist");
    });
    // Ensure that users are displayed in descending order of their ID values
    it("renders users in descending order of ID", () => {
        // Verify that the first row corresponds to the user with the highest ID (3)
        cy.get("tbody tr").eq(0).contains("td", "3");
        // Verify that the second row corresponds to the user with the second-highest ID (2)
        cy.get("tbody tr").eq(1).contains("td", "2");
        cy.get("tbody tr").eq(2).contains("td", "1");
    });
    // Ensure that each row displays the correct user details
    it("displays the correct user data", () => {
        // Check that the first row contains the correct data for user ID 3
        cy.get("tbody tr").eq(0).within(() => {
            cy.contains("td", "John");
            cy.contains("td", "Doe");
            cy.contains("td", "johndoe");
        });
        // Check that the second row contains the correct data for user ID 2
        cy.get("tbody tr").eq(1).within(() => {
            cy.contains("td", "Alice");
            cy.contains("td", "Brown");
            cy.contains("td", "alicebrown");
        });
        // Check that the third row contains the correct data for user ID 1
        cy.get("tbody tr").eq(2).within(() => {
            cy.contains("td", "Jane");
            cy.contains("td", "Smith");
            cy.contains("td", "janesmith");
        });
    });
    // Ensure employee type badges have the expected styling classes
    it("applies correct styles to employee type badges", () => {
        // Verify that the "Admin" role badge has the correct background and text colors
        cy.get("tbody tr").eq(0).contains("td", "Admin").within(() => {
            cy.get("span")
                // Check that the badge has the expected background color for Admin roles
                .should("have.class", "bg-green-100")
                // Confirm that the badge text color matches the expected style for Admin roles
                .and("have.class", "text-green-800")
                // Ensure the badge has rounded edges for styling consistency
                .and("have.class", "rounded-full");
        });
    });
});
