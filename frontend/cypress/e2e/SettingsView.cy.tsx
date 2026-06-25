describe("Login and Navigate to Settings", () => {
  const loginApiUrl = "http://databases.f4.htw-berlin.de:9000/v1/auth/signin";
  const userApiUrl = "http://databases.f4.htw-berlin.de:9000/v1/user";

  beforeEach(() => {
    cy.intercept("POST", loginApiUrl, (req) => {
      if (req.body.username === "testuser" && req.body.password === "password123") {
        req.reply({
          statusCode: 200,
          body: {
            token: "mocked-jwt-token",
            user: { id: 1, name: "Test User", email: "testuser@example.com" },
          },
        });
      } else {
        req.reply({
          statusCode: 401,
          body: { message: "Invalid username or password" },
        });
      }
    }).as("signinRequest");

    cy.intercept("GET", userApiUrl, {
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

  it("logs in and navigates to the settings page", () => {
    cy.visit("http://localhost:5173/login");

    cy.get('input[name="username"]').type("testuser");
    cy.get('input[name="password"]').type("password123");
    cy.get('button[type="submit"]').click();

    cy.wait("@signinRequest").its("response.statusCode").should("eq", 200);

    cy.wait(5000);

    cy.contains("button", "Open user menu for").click();

    cy.get('a[role="menuitem"][href="/settings"]').click();

    cy.wait("@getUser").its("response.body").should("deep.equal", {
      id: 1,
      username: "TestUser",
      firstName: "Test",
      lastName: "User",
      mail: "testuser@example.com",
      employeeType: "Admin",
    });

    cy.contains("Settings").should("exist");
    cy.wait(5000);

    cy.contains("Test User").should("exist");
    cy.contains("testuser@example.com").should("exist");
    cy.contains("Admin").should("exist");
  });
});
