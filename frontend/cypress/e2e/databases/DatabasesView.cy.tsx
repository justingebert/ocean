describe("DatabasesView Test", () => {
  const loginApiUrl = "http://databases.f4.htw-berlin.de:9000/v1/auth/signin";
  const userApiUrl = "http://databases.f4.htw-berlin.de:9000/v1/user";
  const databasesApiUrl = "http://databases.f4.htw-berlin.de:9000/v1/databases";

  beforeEach(() => {
    cy.intercept("POST", loginApiUrl, {
      statusCode: 200,
      body: {
        token: "mocked-jwt-token",
        user: { id: 1, name: "Test User", email: "testuser@example.com" },
      },
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

    cy.intercept("GET", databasesApiUrl, {
      statusCode: 200,
      body: [
        {
          id: 1,
          name: "Test Database 1",
          engine: "postgresql",
          createdAt: 1737991327596,
          userId: 1,
        },
        { id: 2, name: "Test Database 2", engine: "mongodb", createdAt: 1737905926459, userId: 2 },
      ],
    }).as("getDatabases");
  });

  it("shows EmptyState when there are no databases", () => {
    cy.visit("http://localhost:5173/login");

    cy.get('input[name="username"]').type("testuser");
    cy.get('input[name="password"]').type("password123");
    cy.get('button[type="submit"]').click();

    cy.get('a[href="/databases"]').click();

    cy.intercept("GET", databasesApiUrl, {
      statusCode: 200,
      body: [],
    }).as("getDatabases");

    cy.wait("@getDatabases");

    cy.contains("Databases").should("exist");

    cy.contains("No databases").should("exist");
    cy.contains("button", "New database").click();

    cy.url().should("include", "/databases/new");
  });

  it("shows DatabaseList when databases exist", () => {
    cy.visit("http://localhost:5173/login");

    cy.get('input[name="username"]').type("testuser");
    cy.get('input[name="password"]').type("password123");
    cy.get('button[type="submit"]').click();
    cy.get('a[href="/databases"]').click();

    cy.wait("@getDatabases");

    cy.contains("Databases").should("exist");

    cy.contains("Test Database 1").should("exist");
    cy.contains("Test Database 2").should("exist");

    cy.contains("p", "Test Database 1").click();

    cy.url().should("include", "/databases/1");
  });
});
