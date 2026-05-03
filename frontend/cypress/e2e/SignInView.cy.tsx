describe("SignInView E2E Test", () => {
  const signinApiUrl = "http://databases.f4.htw-berlin.de:9000/v1/auth/signin"; // Match the full API endpoint
  const overviewPage = "/overview"; // Redirect page after successful login

  beforeEach(() => {
    // Intercept the fetch request to the signin endpoint
    // @ts-ignore
    cy.intercept("POST", signinApiUrl, (req) => {
      // Mock response based on the body of the request
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
    }).as("signinRequest"); // Alias for tracking the request
  });

  it("logs in successfully and redirects to the overview page", () => {
    cy.visit("http://localhost:5173/login");

    // Fill out the form with valid credentials
    cy.get('input[name="username"]').type("testuser");
    cy.get('input[name="password"]').type("password123");
    cy.get('button[type="submit"]').click();

    // Wait for the signin request to complete
    cy.wait("@signinRequest") // Use the alias to wait for the request
        .its("request.body") // Assert the body of the request
        .should("deep.equal", {
          username: "testuser",
          password: "password123",
        });

    // Assert redirection to the overview page
    cy.url().should("include", overviewPage);
  });

  it("shows an error message on failed login", () => {
    cy.visit("http://localhost:5173/login");

    // Fill out the form with invalid credentials
    cy.get('input[name="username"]').type("wronguser");
    cy.get('input[name="password"]').type("wrongpassword");
    cy.get('button[type="submit"]').click();

    // Wait for the signin request and assert the response
    cy.wait("@signinRequest") // Wait for the aliased request
        .its("response.statusCode") // Assert the response status code
        .should("eq", 401);

    // Assert error message is displayed
    cy.contains("Error").should("exist");
  });
});
