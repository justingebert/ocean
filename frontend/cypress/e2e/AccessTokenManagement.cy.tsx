import { SignJWT, jwtVerify, decodeJwt } from "jose";

const SECRET_KEY = new TextEncoder().encode("your_test_secret_key"); // Use the same key as your backend
const EXPIRED_SECRET_KEY = new TextEncoder().encode("expired_test_secret_key");

// Function to generate a valid JWT
const generateValidJWT = async (userId) => {
    return await new SignJWT({ userId })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("1h") // Expires in 1 hour
        .setIssuedAt()
        .sign(SECRET_KEY);
};

// Function to generate an expired JWT
const generateExpiredJWT = async (userId) => {
    return await new SignJWT({ userId })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime(Math.floor(Date.now() / 1000) - 60) // Expired 1 min ago
        .setIssuedAt(Math.floor(Date.now() / 1000) - 3600) // Issued 1 hour ago
        .sign(EXPIRED_SECRET_KEY);
};


describe("Access token management tests", () => {
    it("should log in and store tokens", () => {
        cy.clearLocalStorage();
        // Use cy.wrap() to properly handle async token generation
        cy.wrap(generateValidJWT(1)).then((validAccessToken) => {
            cy.wrap(generateValidJWT(1)).then((validRefreshToken) => {
                // Mock login API to return valid access and refresh tokens
                cy.intercept("POST", "http://databases.f4.htw-berlin.de:9000/v1/auth/signin", (req) => {
                    if (req.body.username === "testuser" && req.body.password === "password123") {
                        req.reply({
                            statusCode: 200,
                            body: {
                                "accessToken": validAccessToken,
                                "refreshToken": validRefreshToken
                            }
                        });
                    } else {
                        req.reply({
                            statusCode: 401,
                            body: { message: "Invalid username or password" },
                        });
                    }
                }).as("signinRequest");

                // Visit the login page
                cy.visit("http://localhost:5173/login");

                // Log in with valid credentials
                cy.get('input[name="username"]').type("testuser");
                cy.get('input[name="password"]').type("password123");
                cy.get('button[type="submit"]').click();

                // Wait for the login API call and verify success
                cy.wait("@signinRequest").its("response.statusCode").should("eq", 200);
                cy.wait(1000);

                // Verify tokens are stored
                cy.window().then((win) => {
                    expect(win.localStorage.getItem("accessToken")).to.equal(validAccessToken);
                    expect(win.localStorage.getItem("refreshToken")).to.equal(validRefreshToken);
                });

                // Verify redirection
                cy.url().should("include", "/overview");
            });
        });
    });

    // Test scenario where access token expires and is refreshed using a valid refresh token
    it("should refresh the token when access token expires", () => {
        // Generate tokens before running Cypress commands
        cy.wrap(generateExpiredJWT(1)).then((expiredAccessToken) => {
            cy.wrap(generateValidJWT(1)).then((validRefreshToken) => {
                cy.wrap(generateValidJWT(1)).then((newAccessToken) => {
                    // Now intercept requests with the dynamically generated tokens
                    cy.intercept("POST", "http://databases.f4.htw-berlin.de:9000/v1/auth/refresh-token", {
                        statusCode: 200,
                        body: {
                            accessToken: newAccessToken,
                            refreshToken: validRefreshToken
                        }
                    }).as("refreshTokenRequest");

                    cy.intercept("GET", "http://databases.f4.htw-berlin.de:9000/v1/user", (req) => {
                        if (req.headers.authorization === `Bearer ${expiredAccessToken}`) {
                            req.reply({ statusCode: 401 }); // Simulate expired access token
                        } else {
                            req.reply({
                                statusCode: 200,
                                body: {
                                    id: 1,
                                    username: "user01",
                                    firstName: "Protected",
                                    lastName: "User",
                                    mail: "mail@example.com",
                                    employeeType: "Admin"
                                }
                            });
                        }
                    }).as("protectedRequest");

                    cy.intercept("POST", "http://databases.f4.htw-berlin.de:9000/v1/auth/signin", (req) => {
                        if (req.body.username === "testuser" && req.body.password === "password123") {
                            req.reply({
                                statusCode: 200,
                                body: {
                                    "accessToken": expiredAccessToken,
                                    "refreshToken": validRefreshToken
                                }
                            });
                        } else {
                            req.reply({
                                statusCode: 401,
                                body: { message: "Invalid username or password" },
                            });
                        }
                    }).as("signinRequest");

                    // Cypress test flow starts here
                    cy.clearLocalStorage();

                    // Step 1: Visit the login page
                    cy.visit("http://localhost:5173/login");

                    // Step 2: Log in with valid credentials
                    cy.get('input[name="username"]').type("testuser");
                    cy.get('input[name="password"]').type("password123");
                    cy.get('button[type="submit"]').click();

                    // Step 3: Wait for the login API call and verify success
                    cy.wait("@signinRequest").its("response.statusCode").should("eq", 200);
                    cy.wait(1000);

                    // Open user menu and navigate to settings (triggers /user API request)
                    cy.contains('button', 'Open user menu for').click();
                    cy.get('a[role="menuitem"][href="/settings"]').click();

                    // Step 4: Verify access token refresh occurs
                    cy.wait("@protectedRequest");
                    cy.wait("@refreshTokenRequest");

                    // Verify that the new token was stored
                    cy.window().then((win) => {
                        expect(win.localStorage.getItem("accessToken")).to.equal(newAccessToken);
                    });

                    // Verify that the API request was retried successfully
                    cy.wait("@protectedRequest").its("response.statusCode").should("eq", 200);

                    cy.contains('PU').click();
                    cy.contains('div', 'Logout').click();

                    // Verify tokens were cleared
                    cy.window().then((win) => {
                        expect(win.localStorage.getItem("accessToken")).to.be.null;
                        expect(win.localStorage.getItem("refreshToken")).to.be.null;
                    });

                    // Verify redirection to login
                    cy.url().should("include", "/login");
                });
            });
        });
    });

    // Simulate network failure to test error handling in authentication
    it("should handle network errors in axiosInstance", () => {
        cy.intercept("POST", "http://databases.f4.htw-berlin.de:9000/v1/auth/signin", {
            forceNetworkError: true // Simulate network failure
        }).as("networkError");

        cy.visit("http://localhost:5173/login");

        cy.get('input[name="username"]').type("testuser");
        cy.get('input[name="password"]').type("password123");
        cy.get('button[type="submit"]').click();

        cy.wait("@networkError");

        // Verify that the error is handled properly
        cy.contains("Network Error").should("exist");
    });
});


