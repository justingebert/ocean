describe("Login and Navigate to FAQ", () => {
  beforeEach(() => {
    cy.intercept("POST", "**/v1/auth/signin", (req) => {
      if (req.body.username === "testuser" && req.body.password === "password123") {
        req.reply({
          statusCode: 200,
          body: {
            accessToken: "mocked-access-token",
            refreshToken: "mocked-refresh-token",
          },
        });
      } else {
        req.reply({
          statusCode: 401,
          body: { message: "Invalid username or password" },
        });
      }
    }).as("signinRequest");

    cy.intercept("GET", "**/v1/user", {
      statusCode: 200,
      body: {
        id: 1,
        username: "TestUser",
        firstName: "Test",
        lastName: "User",
        mail: "testuser@example.com",
        employeeType: "Admin",
      },
    }).as("getUser");
  });

  it("logs in, navigates to the FAQ, and expands its answers", () => {
    cy.visit("http://localhost:5173/login");

    cy.get('input[name="username"]').type("testuser");
    cy.get('input[name="password"]').type("password123");
    cy.get('button[type="submit"]').click();

    cy.wait("@signinRequest").its("response.statusCode").should("eq", 200);
    cy.wait("@getUser").its("response.statusCode").should("eq", 200);

    cy.contains("span", "Open sidebar").click({ force: true });
    cy.get('a[href="/faq"]:visible').click();
    cy.url().should("include", "/faq");
    cy.contains("Frequently asked questions").should("be.visible");

    cy.contains("button", "Wo finde ich die Datenschutzerklärung?").click();

    cy.contains("https://www.htw-berlin.de/datenschutz/").should("be.visible");

    cy.contains("button", "Wo finde ich die Datenschutzerklärung?").click();
    cy.contains("https://www.htw-berlin.de/datenschutz/").should("not.be.visible");

    cy.contains("button", "Wo finde ich das Impressum?").click();

    cy.contains("https://www.htw-berlin.de/impressum/").should("be.visible");
  });
});
