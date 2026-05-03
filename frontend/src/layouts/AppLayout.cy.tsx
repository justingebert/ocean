import React from "react";
import { mount } from "cypress/react";
import AppLayout, { AppLayoutProps } from "./AppLayout";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "../redux/store";
import {navigation, SettingsNavigation} from "../constants/menu.";

// Initialize a new QueryClient instance for React Query
const queryClient = new QueryClient();
// Mock user data to simulate API response for user permissions
const mockUser = { firstName: "John", lastName: "Doe", employeeType: "Staff" }; // Mock user with "Staff" permission

// Tests for AppLayout component, verifying navigation, layout, and user interactions
describe("AppLayout Tests", () => {
  // Default properties for rendering the AppLayout component
  const defaultProps: AppLayoutProps = {
    children: <div>Test Content</div>,
    selectedNavigation: "Overview",
  };
  // Mock API response for fetching user details and mount the component
  beforeEach(() => {
    cy.intercept("GET", "/v1/user", { body: mockUser }).as("getUser");

    mount(
        // Wrap the component with necessary providers: Redux store, QueryClient, and Router
        <Provider store={store}>
          <QueryClientProvider client={queryClient}>
            <Router>
              <AppLayout {...defaultProps} />
            </Router>
          </QueryClientProvider>
        </Provider>
    );
  });
  // Verify that navigation items appear based on user permissions
  it("renders all navigation items for users with permissions", () => {
    cy.wait("@getUser");
    // Loop through navigation items and check visibility based on permissions
    navigation.forEach((item) => {
      if (item.requiredPermission === undefined || item.requiredPermission === mockUser.employeeType) {
        cy.contains(item.name).should("exist");
      } else {
        cy.contains(item.name).should("not.exist");
      }
    });
  });
  // Ensure sidebar is always visible on large screen sizes
  it("renders static sidebar on larger screens", () => {
    // Simulate desktop resolution to verify sidebar rendering
    cy.viewport(1280, 800); // Desktop resolution
    cy.get("nav[aria-label='Sidebar']").should("exist");
    cy.get("button[aria-label='Open sidebar']").should("not.exist");
  });
  // Ensure AppLayout correctly renders its child content
  it("renders children content", () => {
    cy.contains("Test Content").should("exist");
  });
  // Verify profile dropdown interactions, including Settings navigation and Logout
  it("handles profile dropdown actions", () => {
    // Open the user menu dropdown
    cy.get("button").contains("Open user menu").click(); // Adjust the button text or accessibility label if needed

    // Verify the Settings link
    cy.contains("Settings")
        .should("exist") // Confirm the link is present
        .and("have.attr", "href", SettingsNavigation.to); // Verify the correct path

    // Click the Settings link and ensure navigation
    cy.contains("Settings").click({ force: true });
    cy.url().should("include", SettingsNavigation.to);
    cy.get("button").contains("Open user menu").click();

    // Verify the Logout button
    cy.contains("Logout")
        .should("exist") // Confirm the button is present
        .click(); // Trigger the logout action
  });
});
