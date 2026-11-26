import React from "react";
import { mount } from "cypress/react";
import "@/index.css";
import AppLayout from "./AppLayout";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "@/features/auth/AuthProvider";
import { navigation } from "@/app/navigation/navigation";
import { routePaths } from "@/app/navigation/routes";
import { ThemeProvider } from "@/app/theme-provider";

const queryClient = new QueryClient();

const mockUser = { firstName: "John", lastName: "Doe", employeeType: "Staff" };

describe("AppLayout Tests", () => {
  beforeEach(() => {
    cy.viewport(1280, 800);
    cy.intercept("GET", "/v1/user", { body: mockUser }).as("getUser");
    localStorage.setItem("accessToken", "test-access-token");
    localStorage.removeItem("theme");
    window.history.pushState({}, "", routePaths.databases);

    mount(
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
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
        </QueryClientProvider>
      </ThemeProvider>,
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
    cy.get("button[aria-label='Open sidebar']").should("not.be.visible");
  });

  it("highlights the selected desktop navigation item", () => {
    cy.viewport(1280, 800);
    cy.wait("@getUser");

    cy.get("nav[aria-label='Sidebar'] a[aria-current='page']")
      .should("contain.text", "Databases")
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
    cy.contains("button", "Open user menu").click();

    cy.contains("Profile").should("exist").and("have.attr", "href", routePaths.settings);

    cy.contains("Profile").click({ force: true });
    cy.url().should("include", routePaths.settings);
    cy.contains("button", "Open user menu").click();

    cy.contains("Sign out").should("exist").click();
  });

  it("toggles dark mode from the profile menu and remembers the choice", () => {
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    cy.contains("button", "Open user menu").click();

    cy.contains('[role="menuitemcheckbox"]', "Dark mode")
      .should("have.attr", "aria-checked", String(systemDark))
      .click();

    cy.contains('[role="menuitemcheckbox"]', "Dark mode").should(
      "have.attr",
      "aria-checked",
      String(!systemDark),
    );
    cy.get("html").should(systemDark ? "not.have.class" : "have.class", "dark");
    cy.window()
      .its("localStorage.theme")
      .should("eq", systemDark ? "light" : "dark");
  });
});
