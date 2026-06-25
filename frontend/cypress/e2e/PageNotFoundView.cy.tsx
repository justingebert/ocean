describe("PageNotFoundView Test", () => {
  const notFoundPageUrl = "http://localhost:5173/nonexistent";

  it("renders the 404 Page correctly", () => {
    cy.visit(notFoundPageUrl);

    cy.contains("404").should("exist");

    cy.contains("Page not found").should("exist");

    cy.contains("Please check the URL in the address bar and try again.").should("exist");

    cy.contains("Go back home").should("exist");

    cy.contains("Contact support").should("exist");
  });

  it("navigates back to the home page when clicking 'Go back home'", () => {
    cy.visit(notFoundPageUrl);

    cy.contains("Go back home").click();

    cy.url().should("eq", "http://localhost:5173/login");
  });

  it("navigates to the home page when clicking 'Contact support'", () => {
    cy.visit(notFoundPageUrl);

    cy.contains("Contact support").click();

    cy.url().should("eq", "http://localhost:5173/login");
  });
});
