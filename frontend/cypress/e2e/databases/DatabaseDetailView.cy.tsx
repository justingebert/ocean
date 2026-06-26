describe("DatabaseDetailView Test", () => {
  const loginApiUrl = "http://databases.f4.htw-berlin.de:9000/v1/auth/signin";
  const userApiUrl = "http://databases.f4.htw-berlin.de:9000/v1/user";
  const databasesApiUrl = "http://databases.f4.htw-berlin.de:9000/v1/databases";
  const databasesRolesApiUrl = "http://databases.f4.htw-berlin.de:9000/v1/databases/1/roles";
  const databaseInvitationsApiUrl =
    "http://databases.f4.htw-berlin.de:9000/v1/databases/1/invitations";
  const usersApiUrl = "http://databases.f4.htw-berlin.de:9000/v1/users";
  const database1ApiUrl = "http://databases.f4.htw-berlin.de:9000/v1/databases/1";
  const checkRolesAvailabilityApiUrl =
    "http://databases.f4.htw-berlin.de:9000/v1/roles/_availability_";
  const rolesApiUrl = "http://databases.f4.htw-berlin.de:9000/v1/roles";
  const invitationsApiUrl = "http://databases.f4.htw-berlin.de:9000/v1/invitations";

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
        { id: 1, name: "Test Database 1", engine: "P", createdAt: 1737991327596, userId: 1 },
        { id: 2, name: "Test Database 2", engine: "M", createdAt: 1737905926459, userId: 2 },
      ],
    }).as("getDatabases");

    cy.intercept("GET", database1ApiUrl, {
      statusCode: 200,
      body: {
        id: 1,
        userId: 1,
        name: "Test Database 1",
        engine: "P",
        createdAt: 1737991327596,
      },
    }).as("getDatabase1");

    cy.intercept("GET", databasesRolesApiUrl, {
      statusCode: 200,
      body: [
        {
          id: 4,
          instanceId: 4,
          name: "aaaa_aaxx",
          password: "4nv9teJGD",
        },
      ],
    }).as("getRoles");

    cy.intercept("GET", databaseInvitationsApiUrl, {
      statusCode: 200,
      body: [
        {
          id: 1,
          instanceId: 1,
          userId: 1,
          createdAt: 1737991327596,
        },
        {
          id: 2,
          instanceId: 2,
          userId: 2,
          createdAt: 1737991327596,
        },
      ],
    }).as("getDatabaseInvitations");

    cy.intercept("GET", usersApiUrl, {
      statusCode: 200,
      body: [
        {
          id: 1,
          username: "TestUser",
          firstName: "Test",
          lastName: "User",
          mail: "testuser@example.com",
          employeeType: "Admin",
        },
        {
          id: 2,
          username: "OtherUser",
          firstName: "Other",
          lastName: "User",
          mail: "otheruser@example.com",
          employeeType: "Admin",
        },
        {
          id: 3,
          username: "OtherUser1",
          firstName: "Other1",
          lastName: "User1",
          mail: "otheruser1@example.com",
          employeeType: "Admin",
        },
      ],
    }).as("getUsers");

    cy.intercept("DELETE", database1ApiUrl, {
      statusCode: 200,
    }).as("deleteDatabase1");

    cy.intercept("POST", checkRolesAvailabilityApiUrl, (req) => {
      req.reply({
        statusCode: 200,
        body: { availability: true },
      });
    }).as("checkAvailability");

    cy.intercept("POST", rolesApiUrl, (req) => {
      req.reply({
        statusCode: 200,
        body: {
          id: 3,
          instanceId: 3,
          userId: 3,
          createdAt: 1737991327596,
        },
      });
    }).as("createRole");

    cy.intercept("POST", invitationsApiUrl, (req) => {
      req.reply({
        statusCode: 200,
        body: {
          instanceId: 0,
          roleName: "new_role",
        },
      });
    }).as("createInvitation");
  });

  it("Fails to create a new invitation", () => {
    cy.intercept("POST", invitationsApiUrl, {
      statusCode: 400,
      body: { message: "Failed to create invitation" },
    }).as("createInvitationError");

    cy.visit("http://localhost:5173/login");

    cy.get('input[name="username"]').type("testuser");
    cy.get('input[name="password"]').type("password123");
    cy.get('button[type="submit"]').click();
    cy.get('a[href="/databases"]').click();

    cy.wait("@getDatabases");

    cy.contains("p", "Test Database 1").click();

    cy.wait("@getRoles");
    cy.wait("@getDatabaseInvitations");
    cy.wait("@getUsers");

    cy.contains("Invitations").click();
    cy.get('button.relative.w-full[aria-haspopup="listbox"]').click();
    cy.get('[role="option"]').contains("O. User1").click();

    cy.wait("@createInvitationError").its("response.statusCode").should("eq", 400);

    cy.contains("p", "Something went wrong :(").should("exist");
    cy.contains("button", "Close").click();
  });

  it("Successfully delete an invitation", () => {
    cy.intercept("DELETE", `${invitationsApiUrl}/2`, {
      statusCode: 200,
      body: { message: "" },
    }).as("deleteInvitation2");

    cy.visit("http://localhost:5173/login");

    cy.get('input[name="username"]').type("testuser");
    cy.get('input[name="password"]').type("password123");
    cy.get('button[type="submit"]').click();
    cy.get('a[href="/databases"]').click();

    cy.wait("@getDatabases");

    cy.contains("p", "Test Database 1").click();

    cy.wait("@getRoles");
    cy.wait("@getDatabaseInvitations");
    cy.wait("@getUsers");

    cy.contains("Invitations").click();

    cy.contains("div", "Delete").click();

    cy.wait("@deleteInvitation2").its("response.statusCode").should("eq", 200);
    cy.contains("p", "Successfully delete!").should("exist");
    cy.contains("button", "Close").click();
  });

  it("Fails to delete an invitation", () => {
    cy.intercept("DELETE", `${invitationsApiUrl}/2`, {
      statusCode: 400,
      body: { message: "" },
    }).as("deleteInvitation2");

    cy.visit("http://localhost:5173/login");

    cy.get('input[name="username"]').type("testuser");
    cy.get('input[name="password"]').type("password123");
    cy.get('button[type="submit"]').click();
    cy.get('a[href="/databases"]').click();

    cy.wait("@getDatabases");

    cy.contains("p", "Test Database 1").click();

    cy.wait("@getRoles");
    cy.wait("@getDatabaseInvitations");
    cy.wait("@getUsers");

    cy.contains("Invitations").click();

    cy.contains("div", "Delete").click();

    cy.wait("@deleteInvitation2").its("response.statusCode").should("eq", 400);

    cy.contains("p", "Something went wrong :(").should("exist");
    cy.contains("button", "Close").click();
  });

  it("Successfully delete a user", () => {
    cy.intercept("DELETE", `${rolesApiUrl}/4`, {
      statusCode: 200,
      body: { message: "" },
    }).as("deleteRole");

    cy.visit("http://localhost:5173/login");

    cy.get('input[name="username"]').type("testuser");
    cy.get('input[name="password"]').type("password123");
    cy.get('button[type="submit"]').click();
    cy.get('a[href="/databases"]').click();

    cy.wait("@getDatabases");

    cy.contains("p", "Test Database 1").click();

    cy.wait("@getRoles");
    cy.wait("@getDatabaseInvitations");
    cy.wait("@getUsers");

    cy.contains("Users").click();

    cy.contains("div", "Delete").click();

    cy.wait("@deleteRole").its("response.statusCode").should("eq", 200);
    cy.contains("p", "Successfully deleted!").should("exist");
    cy.contains("button", "Close").click();
  });

  it("Fails to delete a user", () => {
    cy.intercept("DELETE", `${rolesApiUrl}/4`, {
      statusCode: 400,
      body: { message: "Failed to create role" },
    }).as("deleteRole");

    cy.visit("http://localhost:5173/login");

    cy.get('input[name="username"]').type("testuser");
    cy.get('input[name="password"]').type("password123");
    cy.get('button[type="submit"]').click();
    cy.get('a[href="/databases"]').click();

    cy.wait("@getDatabases");

    cy.contains("p", "Test Database 1").click();

    cy.wait("@getRoles");
    cy.wait("@getDatabaseInvitations");
    cy.wait("@getUsers");

    cy.contains("Users").click();

    cy.contains("div", "Delete").click();

    cy.wait("@deleteRole").its("response.statusCode").should("eq", 400);

    cy.contains("p", "Something went wrong").should("exist");
    cy.contains("button", "Close").click();
  });

  it("Fails to create new user", () => {
    cy.intercept("POST", rolesApiUrl, {
      statusCode: 400,
      body: { message: "Failed to create role" },
    }).as("createRoleError");

    cy.visit("http://localhost:5173/login");

    cy.get('input[name="username"]').type("testuser");
    cy.get('input[name="password"]').type("password123");
    cy.get('button[type="submit"]').click();
    cy.get('a[href="/databases"]').click();

    cy.wait("@getDatabases");

    cy.contains("p", "Test Database 1").click();

    cy.url().should("include", "/databases/1");

    cy.wait("@getRoles");
    cy.wait("@getDatabaseInvitations");
    cy.wait("@getUsers");

    cy.contains("Users").click();

    cy.contains("Add new user").click();
    cy.get('input[name="roleName"]').type("new_role");
    cy.wait(1000);
    cy.get("button.bg-indigo-600").contains("Create").click();

    cy.wait("@createRoleError").its("response.statusCode").should("eq", 400);

    cy.contains("p", "Something went wrong :(").should("exist");
    cy.contains("button", "Close").click();
  });

  it("Login and visit the detail db view", () => {
    cy.visit("http://localhost:5173/login");

    cy.get('input[name="username"]').type("testuser");
    cy.get('input[name="password"]').type("password123");
    cy.get('button[type="submit"]').click();
    cy.get('a[href="/databases"]').click();

    cy.wait("@getDatabases");

    cy.contains("p", "Test Database 1").click();

    cy.url().should("include", "/databases/1");

    cy.wait("@getRoles");
    cy.wait("@getDatabaseInvitations");
    cy.wait("@getUsers");

    cy.contains("Test Database 1").should("exist");
    cy.contains("PostgreSQL").should("exist");

    cy.contains("Overview").should("exist");
    cy.contains("Users").should("exist");
    cy.contains("Invitations").should("exist");

    cy.contains("Users").click();
    cy.contains("Add new user").should("exist");

    cy.contains("Invitations").click();
    cy.contains("Invite other people").should("exist");

    cy.get("div.whitespace-nowrap.cursor-pointer").contains("Overview").click();
    cy.contains("Test Database").should("exist");

    cy.contains("button", "Actions").click();
    cy.contains("Delete").click();

    cy.contains("button", "Close").click();

    cy.contains("button", "Actions").click();
    cy.contains("Delete").click();

    cy.contains("button", "Delete").click();

    cy.wait("@deleteDatabase1").its("response.statusCode").should("eq", 200);

    cy.url().should("include", "/databases");

    cy.contains("p", "Test Database 1").click();

    cy.contains("Users").click();

    cy.contains("Add new user").click();

    cy.contains("button", "Cancel").click();

    cy.contains("Add new user").click();

    cy.get('input[name="roleName"]').type("new_role");
    cy.wait(1000);
    cy.get("button.bg-indigo-600").contains("Create").click();

    cy.wait("@createRole").its("response.statusCode").should("eq", 200);
    cy.contains("p", "Successfully created!").should("exist");
    cy.contains("button", "Close").click();

    cy.contains("Invitations").click();
    cy.get('button.relative.w-full[aria-haspopup="listbox"]').click();
    cy.get('[role="option"]').contains("O. User1").click();

    cy.wait("@createInvitation").its("response.statusCode").should("eq", 200);
    cy.contains("p", "Successfully created!").should("exist");
    cy.contains("button", "Close").click();
  });
});
