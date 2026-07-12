import React from "react";
import { mount } from "cypress/react";
import AppLayout from "./AppLayout";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "@/features/auth/AuthProvider";
import { navigation, ProfileNavigation } from "@/app/navigation/navigation";
import { routePaths } from "@/app/navigation/routes";

const queryClient = new QueryClient();

const mockUser = { firstName: "John", lastName: "Doe", employeeType: "Staff" };

describe("AppLayout Tests", () => {
  beforeEach(() => {
    cy.intercept("GET", "/v1/user", { body: mockUser }).as("getUser");
    localStorage.setItem("accessToken", "test-access-token");
    window.history.pushState({}, "", routePaths.overview);

    mount(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<AppLayout />}>
                <Route path="*" element={<div>Test Content</div>} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>,
    );
  });

  it("renders all navigation items for users with permissions", () => {
    cy.wait("@getUser");

    navigation.forEach((item) => {
      if (
        item.requiredPermission === undefined ||
        item.requiredPermission === mockUser.employeeType
      ) {
        cy.contains(item.name).should("exist");
      } else {
        cy.contains(item.name).should("not.exist");
      }
    });
  });

  it("renders static sidebar on larger screens", () => {
    cy.viewport(1280, 800);
    cy.get("nav[aria-label='Sidebar']").should("exist");
    cy.get("button[aria-label='Open sidebar']").should("not.exist");
  });

  it("highlights the selected desktop navigation item", () => {
    cy.viewport(1280, 800);
    cy.wait("@getUser");

    cy.get("nav[aria-label='Sidebar'] a[aria-current='page']")
      .should("contain.text", "Home")
      .and("have.attr", "data-active");

    cy.get("nav[aria-label='Sidebar'] a[aria-current='page'] svg").should("exist");
  });

  [routePaths.createDatabase, "/databases/42"].forEach((path) => {
    it(`keeps Databases selected for ${path}`, () => {
      cy.viewport(1280, 800);
      cy.wait("@getUser");
      cy.window().then((window) => {
        window.history.pushState({}, "", path);
        window.dispatchEvent(new PopStateEvent("popstate"));
      });

      cy.get("nav[aria-label='Sidebar'] a[aria-current='page']").should(
        "contain.text",
        "Databases",
      );
    });
  });

  it("renders children content", () => {
    cy.contains("Test Content").should("exist");
  });

  it("handles profile dropdown actions", () => {
    cy.get("button").contains("Open user menu").click();

    cy.contains("Profile").should("exist").and("have.attr", "href", ProfileNavigation.to);

    cy.contains("Profile").click({ force: true });
    cy.url().should("include", ProfileNavigation.to);
    cy.get("button").contains("Open user menu").click();

    cy.contains("Logout").should("exist").click();
  });
});
