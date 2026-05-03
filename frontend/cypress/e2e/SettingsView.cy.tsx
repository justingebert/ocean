describe("Login and Navigate to Settings", () => {
    const loginApiUrl = "http://databases.f4.htw-berlin.de:9000/v1/auth/signin"; // Login endpoint
    const userApiUrl = "http://databases.f4.htw-berlin.de:9000/v1/user"; // User data endpoint

    beforeEach(() => {
        // Intercept login API call
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

        // Intercept user API call for settings
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
    });

    it("logs in and navigates to the settings page", () => {
        // Visit the login page
        cy.visit("http://localhost:5173/login");

        // Log in with valid credentials
        cy.get('input[name="username"]').type("testuser");
        cy.get('input[name="password"]').type("password123");
        cy.get('button[type="submit"]').click();

        // Wait for the login API call and verify success
        cy.wait("@signinRequest").its("response.statusCode").should("eq", 200);

        cy.wait(5000)

        // Open user menu to access settings
        cy.contains('button', 'Open user menu for').click();

        cy.get('a[role="menuitem"][href="/settings"]').click();

        // Wait for the user API call and verify user data is loaded
        cy.wait("@getUser").its("response.body").should("deep.equal", {
            id: 1,
            username: "TestUser",
            firstName: "Test",
            lastName: "User",
            mail: "testuser@example.com",
            employeeType: "Admin",
        });

        // Verify SettingsView components
        // Check for the headline
        cy.contains("Settings").should("exist");
        cy.wait(5000)


        // Check for user profile card
        cy.contains("Test User").should("exist");
        cy.contains("testuser@example.com").should("exist");
        cy.contains("Admin").should("exist");
    });
});
