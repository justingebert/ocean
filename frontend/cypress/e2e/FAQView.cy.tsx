describe("Login and Navigate to FAQ", () => {
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

  it("logs in and navigates to the settings page using the Open sidebar button", () => {
    cy.visit("http://localhost:5173/login");

    cy.get('input[name="username"]').type("testuser");
    cy.get('input[name="password"]').type("password123");
    cy.get('button[type="submit"]').click();

    cy.wait("@signinRequest").its("response.statusCode").should("eq", 200);
    cy.wait(1000);

    cy.contains("span", "Open sidebar").click({ force: true });
    cy.wait(1000);
    cy.get('a[href="/faq"]').click({ multiple: true, force: true });
    cy.wait(1000);
    cy.contains("Frequently asked questions").should("exist");

    cy.contains("Wo finde ich die Datenschutzerklärung?").should("exist");
    cy.contains("Wo finde ich das Impressum?").should("exist");
    cy.contains("Wo finde ich die Datenschutzerklärung?").click();
    cy.wait(1000);

    cy.contains("https://www.htw-berlin.de/datenschutz/").should("be.visible");

    cy.contains("Wo finde ich die Datenschutzerklärung?").click();

    cy.contains("Wo finde ich das Impressum?").click();
    cy.wait(1000);

    cy.contains("https://www.htw-berlin.de/impressum/").should("be.visible");
  });
});
