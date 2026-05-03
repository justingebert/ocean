describe("DatabasesView Test", () => {
    const loginApiUrl = "http://databases.f4.htw-berlin.de:9000/v1/auth/signin"; // Login endpoint
    const userApiUrl = "http://databases.f4.htw-berlin.de:9000/v1/user"; // User data endpoint
    const databasesApiUrl = "http://databases.f4.htw-berlin.de:9000/v1/databases"; // Get databases endpoint

    // Mock API responses for user authentication and database retrieval
    beforeEach(() => {
        // Simulate login process by intercepting authentication request
        // @ts-ignore
        cy.intercept("POST", loginApiUrl, {
            statusCode: 200,
            body: {
                token: "mocked-jwt-token",
                user: { id: 1, name: "Test User", email: "testuser@example.com" },
            },
        }).as("signinRequest");

        // Intercept user API call
        // @ts-ignore
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

        // Mock API response to return a list of test databases
        // @ts-ignore
        cy.intercept("GET", databasesApiUrl, {
            statusCode: 200,
            body: [
                { id: 1, name: "Test Database 1", engine: "postgresql", createdAt: 1737991327596, userId: 1 },
                { id: 2, name: "Test Database 2", engine: "mongodb", createdAt: 1737905926459, userId: 2},
            ],
        }).as("getDatabases");
    });

    it("shows EmptyState when there are no databases", () => {
        // Visit the login page
        cy.visit("http://localhost:5173/login");

        // Log in with valid credentials
        cy.get('input[name="username"]').type("testuser");
        cy.get('input[name="password"]').type("password123");
        cy.get('button[type="submit"]').click();
        // Intercept the GET databases API with an empty response
        cy.get('a[href="/databases/"]').click();

        // Simulate scenario where no databases exist, expecting an empty state UI
        // @ts-ignore
        cy.intercept("GET", databasesApiUrl, {
            statusCode: 200,
            body: [],
        }).as("getDatabases");

        // Wait for the databases API to complete
        cy.wait("@getDatabases");

        // Verify the headline
        cy.contains("Databases").should("exist");

        // Verify EmptyState is displayed
        // Ensure the UI correctly displays an empty state message
        cy.contains("No databases").should("exist"); // Adjust based on EmptyState text
        cy.contains('button', 'New database').click();

        // Verify navigation to the Create Database page
        cy.url().should("include", "/databases/new");
    });

    it("shows DatabaseList when databases exist", () => {
        // Visit the login page
        cy.visit("http://localhost:5173/login");

        // Log in with valid credentials
        cy.get('input[name="username"]').type("testuser");
        cy.get('input[name="password"]').type("password123");
        cy.get('button[type="submit"]').click();
        cy.get('a[href="/databases/"]').click();

        cy.wait("@getDatabases");

        // Verify the headline
        cy.contains("Databases").should("exist");

        // Verify DatabaseList is displayed
        // Verify that existing databases are listed on the page
        cy.contains("Test Database 1").should("exist");
        cy.contains("Test Database 2").should("exist");
        // Click on the first database
        // Select a database and verify navigation to its details page
        cy.contains('p', 'Test Database 1').click();

        // Verify navigation to the database details page
        cy.url().should("include", "/databases/1");
    });
});
