describe("Login and Navigate to FAQ", () => {
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

    it("logs in and navigates to the settings page using the Open sidebar button", () => {
        // Visit the login page
        cy.visit("http://localhost:5173/login");

        // Log in with valid credentials
        cy.get('input[name="username"]').type("testuser");
        cy.get('input[name="password"]').type("password123");
        cy.get('button[type="submit"]').click();

        // Wait for the login API call and verify success
        cy.wait("@signinRequest").its("response.statusCode").should("eq", 200);
        cy.wait(1000)
        // Click the "Open sidebar" button
        cy.contains('span', 'Open sidebar').click({ force: true });
        cy.wait(1000);
        cy.get('a[href="/faq"]').click({multiple: true, force: true});
        cy.wait(1000);
        cy.contains("Frequently asked questions").should("exist");

        // Expand the first FAQ question to check its content
        cy.contains("Wo finde ich die Datenschutzerklärung?").should("exist");
        cy.contains("Wo finde ich das Impressum?").should("exist");
        cy.contains("Wo finde ich die Datenschutzerklärung?").click();
        cy.wait(1000)
        // Verify that the answer is displayed
        cy.contains("https://www.htw-berlin.de/datenschutz/").should("be.visible");

        // Collapse the first FAQ item
        cy.contains("Wo finde ich die Datenschutzerklärung?").click();

        // Expand the second FAQ item
        cy.contains("Wo finde ich das Impressum?").click();
        cy.wait(1000)
        // Verify that the answer is displayed
        cy.contains("https://www.htw-berlin.de/impressum/").should("be.visible");
    });
});
