describe("PageNotFoundView Test", () => {
    const notFoundPageUrl = "http://localhost:5173/nonexistent"; // A nonexistent route for testing the 404 page

    it("renders the 404 Page correctly", () => {
        // Visit a nonexistent page
        cy.visit(notFoundPageUrl); // Prevent Cypress from failing on 404 status

        // Verify the "404" text is displayed
        cy.contains("404").should("exist");

        // Verify the "Page not found" heading
        cy.contains("Page not found").should("exist");

        // Verify the instruction text
        cy.contains("Please check the URL in the address bar and try again.").should("exist");

        // Verify the "Go back home" button
        cy.contains("Go back home").should("exist");

        // Verify the "Contact support" button
        cy.contains("Contact support").should("exist");
    });

    it("navigates back to the home page when clicking 'Go back home'", () => {
        // Visit a nonexistent page
        cy.visit(notFoundPageUrl);

        // Click the "Go back home" button
        cy.contains("Go back home").click();

        // Verify navigation to the home page
        cy.url().should("eq", "http://localhost:5173/login");
    });

    it("navigates to the home page when clicking 'Contact support'", () => {
        // Visit a nonexistent page
        cy.visit(notFoundPageUrl);

        // Click the "Contact support" button
        cy.contains("Contact support").click();

        // Verify navigation to the home page
        cy.url().should("eq", "http://localhost:5173/login");
    });
});
