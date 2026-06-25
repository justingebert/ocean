describe("Login and Create a Database", () => {
  const loginApiUrl = "http://databases.f4.htw-berlin.de:9000/v1/auth/signin";
  const userApiUrl = "http://databases.f4.htw-berlin.de:9000/v1/user";
  const createDatabaseApiUrl = "http://databases.f4.htw-berlin.de:9000/v1/databases";
  const checkAvailabilityApiUrl =
    "http://databases.f4.htw-berlin.de:9000/v1/databases/_availability_";
  const getDatabasesUrl = "http://databases.f4.htw-berlin.de:9000/v1/databases";

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

    cy.intercept("POST", createDatabaseApiUrl, (req) => {
      console.log("POST Request Body:", req.body);
      if (req.body.name === "testdatabase") {
        req.reply({
          statusCode: 201,
          body: { name: "testdatabase", engine: "postgresql" },
        });
      } else {
        req.reply({
          statusCode: 400,
          body: { message: "Invalid database name" },
        });
      }
    }).as("createDatabase");

    cy.intercept("POST", checkAvailabilityApiUrl, (req) => {
      req.reply({
        statusCode: 200,
        body: { availability: true },
      });
    }).as("checkAvailability");

    cy.intercept("GET", getDatabasesUrl, {
      statusCode: 200,
    });
  });

  it("logs in and creates a database", () => {
    cy.visit("http://localhost:5173/login");

    cy.get('input[name="username"]').type("testuser");
    cy.get('input[name="password"]').type("password123");
    cy.get('button[type="submit"]').click();

    cy.wait("@signinRequest").its("response.statusCode").should("eq", 200);
    cy.wait("@getUser");

    cy.contains("a", "Create a Database").click();

    cy.get('input[name="name"]').type("testdatabase");
    cy.get('button[type="submit"]').click({ force: true });

    cy.url().should("include", "/databases");
  });
});
