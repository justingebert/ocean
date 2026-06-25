import { SignJWT } from "jose";

const SECRET_KEY = new TextEncoder().encode("your_test_secret_key");
const EXPIRED_SECRET_KEY = new TextEncoder().encode("expired_test_secret_key");

const generateValidJWT = async (userId: number) => {
  return await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1h")
    .setIssuedAt()
    .sign(SECRET_KEY);
};

const generateExpiredJWT = async (userId: number) => {
  return await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(Math.floor(Date.now() / 1000) - 60)
    .setIssuedAt(Math.floor(Date.now() / 1000) - 3600)
    .sign(EXPIRED_SECRET_KEY);
};

describe("Access token management tests", () => {
  it("should log in and store tokens", () => {
    cy.clearLocalStorage();

    cy.wrap(generateValidJWT(1)).then((validAccessToken) => {
      cy.wrap(generateValidJWT(1)).then((validRefreshToken) => {
        cy.intercept("POST", "http://databases.f4.htw-berlin.de:9000/v1/auth/signin", (req) => {
          if (req.body.username === "testuser" && req.body.password === "password123") {
            req.reply({
              statusCode: 200,
              body: {
                accessToken: validAccessToken,
                refreshToken: validRefreshToken,
              },
            });
          } else {
            req.reply({
              statusCode: 401,
              body: { message: "Invalid username or password" },
            });
          }
        }).as("signinRequest");

        cy.visit("http://localhost:5173/login");

        cy.get('input[name="username"]').type("testuser");
        cy.get('input[name="password"]').type("password123");
        cy.get('button[type="submit"]').click();

        cy.wait("@signinRequest").its("response.statusCode").should("eq", 200);
        cy.wait(1000);

        cy.window().then((win) => {
          expect(win.localStorage.getItem("accessToken")).to.equal(validAccessToken);
          expect(win.localStorage.getItem("refreshToken")).to.equal(validRefreshToken);
        });

        cy.url().should("include", "/overview");
      });
    });
  });

  it("should refresh the token when access token expires", () => {
    cy.wrap(generateExpiredJWT(1)).then((expiredAccessToken) => {
      cy.wrap(generateValidJWT(1)).then((validRefreshToken) => {
        cy.wrap(generateValidJWT(1)).then((newAccessToken) => {
          cy.intercept("POST", "http://databases.f4.htw-berlin.de:9000/v1/auth/refresh-token", {
            statusCode: 200,
            body: {
              accessToken: newAccessToken,
              refreshToken: validRefreshToken,
            },
          }).as("refreshTokenRequest");

          cy.intercept("GET", "http://databases.f4.htw-berlin.de:9000/v1/user", (req) => {
            if (req.headers.authorization === `Bearer ${expiredAccessToken}`) {
              req.reply({ statusCode: 401 });
            } else {
              req.reply({
                statusCode: 200,
                body: {
                  id: 1,
                  username: "user01",
                  firstName: "Protected",
                  lastName: "User",
                  mail: "mail@example.com",
                  employeeType: "Admin",
                },
              });
            }
          }).as("protectedRequest");

          cy.intercept("POST", "http://databases.f4.htw-berlin.de:9000/v1/auth/signin", (req) => {
            if (req.body.username === "testuser" && req.body.password === "password123") {
              req.reply({
                statusCode: 200,
                body: {
                  accessToken: expiredAccessToken,
                  refreshToken: validRefreshToken,
                },
              });
            } else {
              req.reply({
                statusCode: 401,
                body: { message: "Invalid username or password" },
              });
            }
          }).as("signinRequest");

          cy.clearLocalStorage();

          cy.visit("http://localhost:5173/login");

          cy.get('input[name="username"]').type("testuser");
          cy.get('input[name="password"]').type("password123");
          cy.get('button[type="submit"]').click();

          cy.wait("@signinRequest").its("response.statusCode").should("eq", 200);
          cy.wait(1000);

          cy.contains("button", "Open user menu for").click();
          cy.get('a[role="menuitem"][href="/settings"]').click();

          cy.wait("@protectedRequest");
          cy.wait("@refreshTokenRequest");

          cy.window().then((win) => {
            expect(win.localStorage.getItem("accessToken")).to.equal(newAccessToken);
          });

          cy.wait("@protectedRequest").its("response.statusCode").should("eq", 200);

          cy.contains("PU").click();
          cy.contains("div", "Logout").click();

          cy.window().then((win) => {
            expect(win.localStorage.getItem("accessToken")).to.equal(null);
            expect(win.localStorage.getItem("refreshToken")).to.equal(null);
          });

          cy.url().should("include", "/login");
        });
      });
    });
  });

  it("should handle network errors in axiosInstance", () => {
    cy.intercept("POST", "http://databases.f4.htw-berlin.de:9000/v1/auth/signin", {
      forceNetworkError: true,
    }).as("networkError");

    cy.visit("http://localhost:5173/login");

    cy.get('input[name="username"]').type("testuser");
    cy.get('input[name="password"]').type("password123");
    cy.get('button[type="submit"]').click();

    cy.wait("@networkError");

    cy.contains("Network Error").should("exist");
  });
});
