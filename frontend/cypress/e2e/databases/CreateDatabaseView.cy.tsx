describe("Login and Create a Database", () => {
    const loginApiUrl = "http://databases.f4.htw-berlin.de:9000/v1/auth/signin"; // Login endpoint
    const userApiUrl = "http://databases.f4.htw-berlin.de:9000/v1/user"; // User data endpoint
    const createDatabaseApiUrl = "http://databases.f4.htw-berlin.de:9000/v1/databases"; // Create database endpoint
    const checkAvailabilityApiUrl = "http://databases.f4.htw-berlin.de:9000/v1/databases/_availability_"; // Check availability endpoint
    const getDatabasesUrl = "http://databases.f4.htw-berlin.de:9000/v1/databases"
    let wasPostRequestBodyRight = false; // Global boolean flag

    // Set up API intercepts to mock backend responses and control test scenarios
    beforeEach(() => {
        // Mock login API to simulate authentication responses
        // @ts-ignore
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

        // Mock user data retrieval after successful login
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

        // Mock API response when creating a new database
        // @ts-ignore
        cy.intercept("POST", createDatabaseApiUrl, (req) => {
            console.log("POST Request Body:", req.body);
            if (req.body.name === "testdatabase") {
                wasPostRequestBodyRight = true;
                req.reply({
                    statusCode: 201,
                    body: { name: "testdatabase",
                            engine: "postgresql"},
                });
            } else {
                wasPostRequestBodyRight = false;
                req.reply({
                    statusCode: 400,
                    body: { message: "Invalid database name" },
                });
            }
        }).as("createDatabase");

        // Intercept availability check API call
        // @ts-ignore
        cy.intercept("POST", checkAvailabilityApiUrl, (req) => {
            req.reply({
                statusCode: 200,
                body: { availability: true },
            });
        }).as("checkAvailability");

        // @ts-ignore
        cy.intercept("GET", getDatabasesUrl, {
            statusCode: 200
        });
    });

    it("logs in and creates a database", () => {
        // Visit the login page
        cy.visit("http://localhost:5173/login");

        // Log in with valid credentials
        cy.get('input[name="username"]').type("testuser");
        cy.get('input[name="password"]').type("password123");
        cy.get('button[type="submit"]').click();

        // Wait for the login API and user data
        cy.wait("@signinRequest").its("response.statusCode").should("eq", 200);
        cy.wait("@getUser");

        // Navigate to database creation page
        cy.contains('a', 'Create a Database').click();

        // Fill out the form and submit
        cy.get('input[name="name"]').type("testdatabase");
        cy.get('button[type="submit"]').click({force: true});
        // Verify redirection to the database list
        cy.url().should("include", "/databases");
    });
});
