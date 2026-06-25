describe("Login and OverviewView Test", () => {
  const loginApiUrl = "http://databases.f4.htw-berlin.de:9000/v1/auth/signin";
  const overviewPageUrl = "http://localhost:5173/overview";

  beforeEach(() => {
    cy.intercept("POST", loginApiUrl, (req) => {
      if (req.body.username === "testuser" && req.body.password === "password123") {
        req.reply({
          statusCode: 200,
          body: {
            token: "mocked-jwt-token",
            user: { id: 1, name: "Test User" },
          },
        });
      } else {
        req.reply({
          statusCode: 401,
          body: { message: "Invalid username or password" },
        });
      }
    }).as("signinRequest");
  });

  it("logs in as a normal user and redirects to OverviewView", () => {
    cy.visit("http://localhost:5173/login");

    cy.get('input[name="username"]').type("testuser");
    cy.get('input[name="password"]').type("password123");
    cy.get('button[type="submit"]').click();

    cy.wait("@signinRequest").its("response.statusCode").should("eq", 200);

    cy.url().should("eq", overviewPageUrl);

    cy.contains("Overview").should("exist");

    cy.contains("Getting started").should("exist");
    cy.contains("Get started by selecting a template.").should("exist");
  });
});
