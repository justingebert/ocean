describe("SignInView E2E Test", () => {
  const signinApiUrl = "http://databases.f4.htw-berlin.de:9000/v1/auth/signin";
  const overviewPage = "/overview";

  beforeEach(() => {
    cy.intercept("POST", signinApiUrl, (req) => {
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

  it("logs in successfully and redirects to the overview page", () => {
    cy.visit("http://localhost:5173/login");

    cy.get('input[name="username"]').type("testuser");
    cy.get('input[name="password"]').type("password123");
    cy.get('button[type="submit"]').click();

    cy.wait("@signinRequest").its("request.body").should("deep.equal", {
      username: "testuser",
      password: "password123",
    });

    cy.url().should("include", overviewPage);
  });

  it("shows an error message on failed login", () => {
    cy.visit("http://localhost:5173/login");

    cy.get('input[name="username"]').type("wronguser");
    cy.get('input[name="password"]').type("wrongpassword");
    cy.get('button[type="submit"]').click();

    cy.wait("@signinRequest").its("response.statusCode").should("eq", 401);

    cy.contains("Error").should("exist");
  });
});
