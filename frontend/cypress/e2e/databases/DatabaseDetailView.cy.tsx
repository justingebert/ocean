describe("DatabaseDetailView Test", () => {
    const loginApiUrl = "http://databases.f4.htw-berlin.de:9000/v1/auth/signin"; // Login endpoint
    const userApiUrl = "http://databases.f4.htw-berlin.de:9000/v1/user"; // User data endpoint
    const databasesApiUrl = "http://databases.f4.htw-berlin.de:9000/v1/databases"; // Get databases endpoint
    const databasesRolesApiUrl = "http://databases.f4.htw-berlin.de:9000/v1/databases/1/roles";
    const databaseInvitationsApiUrl = "http://databases.f4.htw-berlin.de:9000/v1/databases/1/invitations";
    const usersApiUrl = "http://databases.f4.htw-berlin.de:9000/v1/users";
    const database1ApiUrl = "http://databases.f4.htw-berlin.de:9000/v1/databases/1";
    const checkRolesAvailabilityApiUrl = "http://databases.f4.htw-berlin.de:9000/v1/roles/_availability_";
    const rolesApiUrl ="http://databases.f4.htw-berlin.de:9000/v1/roles"
    const invitationsApiUrl = "http://databases.f4.htw-berlin.de:9000/v1/invitations";

    // Intercept API calls to simulate backend behavior for database details
    beforeEach(() => {
        // Intercept login API call
        // @ts-ignore
        cy.intercept("POST", loginApiUrl, {
            statusCode: 200,
            body: {
                token: "mocked-jwt-token",
                user: { id: 1, name: "Test User", email: "testuser@example.com" },
            },
        }).as("signinRequest");

        // Mock user API response to ensure correct user details
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

        // Mock API response for fetching the list of databases
        // @ts-ignore
        cy.intercept("GET", databasesApiUrl, {
            statusCode: 200,
            body: [
                { id: 1, name: "Test Database 1", engine: "P", createdAt: 1737991327596, userId: 1 },
                { id: 2, name: "Test Database 2", engine: "M", createdAt: 1737905926459, userId: 2},
            ],
        }).as("getDatabases");

        // Mock get database number 1
        // @ts-ignore
        cy.intercept("GET", database1ApiUrl, {
            statusCode: 200,
            body: {
                id: 1,
                userId: 1,
                name: "Test Database 1",
                engine: "P",
                createdAt: 1737991327596
            },
        }).as("getDatabase1");

        // Mock get roles
        // @ts-ignore
        cy.intercept("GET", databasesRolesApiUrl, {
            statusCode: 200,
            body: [
                {
                    "id": 4,
                    "instanceId": 4,
                    "name": "aaaa_aaxx",
                    "password": "4nv9teJGD"
                }
            ],
        }).as("getRoles");

        // Mock get database invitations
        // @ts-ignore
        cy.intercept("GET", databaseInvitationsApiUrl, {
            statusCode: 200,
            body: [{
                "id": 1,
                "instanceId": 1,
                "userId": 1,
                "createdAt": 1737991327596
                },
                {
                    "id": 2,
                    "instanceId": 2,
                    "userId": 2,
                    "createdAt": 1737991327596
                },
            ],
        }).as("getDatabaseInvitations");

        // Mock get users
        // @ts-ignore
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

        // @ts-ignore
        // Mock successful deletion of a database
        cy.intercept("DELETE", database1ApiUrl, {
            statusCode: 200,
        }).as("deleteDatabase1");

        // Intercept availability check API call
        // @ts-ignore
        cy.intercept("POST", checkRolesAvailabilityApiUrl, (req) => {
            req.reply({
                statusCode: 200,
                body: { availability: true },
            });
        }).as("checkAvailability");

        // Intercept create a new Role API call
        // @ts-ignore
        cy.intercept("POST", rolesApiUrl, (req) => {
            req.reply({
                statusCode: 200,
                body: {
                    "id": 3,
                    "instanceId": 3,
                    "userId": 3,
                    "createdAt": 1737991327596
                },
            });
        }).as("createRole");

        // Intercept create a new Invitation API call
        // @ts-ignore
        cy.intercept("POST", invitationsApiUrl, (req) => {
            req.reply({
                statusCode: 200,
                body: {
                    "instanceId": 0,
                    "roleName": "new_role"
                },
            });
        }).as("createInvitation");
    });

    it("Fails to create a new invitation", () => {
        // Simulate a failed invitation creation request
        // @ts-ignore
        cy.intercept("POST", invitationsApiUrl, {
            statusCode: 400, // Simulate good request
            body: { message: "Failed to create invitation" },
        }).as("createInvitationError");

        // Visit the login page
        cy.visit("http://localhost:5173/login");

        // Log in with valid credentials
        cy.get('input[name="username"]').type("testuser");
        cy.get('input[name="password"]').type("password123");
        cy.get('button[type="submit"]').click();
        cy.get('a[href="/databases/"]').click();

        cy.wait("@getDatabases");

        // Click on the first database
        cy.contains('p', 'Test Database 1').click();

        // Wait for the API calls to complete
        cy.wait("@getRoles");
        cy.wait("@getDatabaseInvitations");
        cy.wait("@getUsers");
        // Switch to Users tab
        cy.contains("Invitations").click();
        cy.get('button.relative.w-full[aria-haspopup="listbox"]').click();
        cy.get('[role="option"]').contains('O. User1').click();
        // Verify the invitation creation request
        cy.wait("@createInvitationError").its("response.statusCode").should("eq", 400);

        // Verify that an error message is displayed when the request fails
        cy.contains('p', 'Something went wrong :(').should("exist");
        cy.contains('button', 'Close').click();
    });

    it("Successfully delete an invitation", () => {
        // @ts-ignore
        cy.intercept("DELETE", `${invitationsApiUrl}/2`, {
            statusCode: 200, // Simulate good request
            body: { message: "" },
        }).as("deleteInvitation2");

        // Visit the login page
        cy.visit("http://localhost:5173/login");

        // Log in with valid credentials
        cy.get('input[name="username"]').type("testuser");
        cy.get('input[name="password"]').type("password123");
        cy.get('button[type="submit"]').click();
        cy.get('a[href="/databases/"]').click();

        cy.wait("@getDatabases");

        // Click on the first database
        cy.contains('p', 'Test Database 1').click();

        // Wait for the API calls to complete
        cy.wait("@getRoles");
        cy.wait("@getDatabaseInvitations");
        cy.wait("@getUsers");

        // Switch to Invitations tab
        cy.contains("Invitations").click();

        // Click the delete button
        cy.contains('div', 'Delete').click();
        // Ensure the deletion request was successful
        cy.wait("@deleteInvitation2").its("response.statusCode").should("eq", 200);
        cy.contains('p', 'Successfully delete!').should("exist");
        cy.contains('button', 'Close').click();
    });

    it("Fails to delete an invitation", () => {
        // @ts-ignore
        cy.intercept("DELETE", `${invitationsApiUrl}/2`, {
            statusCode: 400, // Simulate bad request
            body: { message: "" },
        }).as("deleteInvitation2");

        // Visit the login page
        cy.visit("http://localhost:5173/login");

        // Log in with valid credentials
        cy.get('input[name="username"]').type("testuser");
        cy.get('input[name="password"]').type("password123");
        cy.get('button[type="submit"]').click();
        cy.get('a[href="/databases/"]').click();

        cy.wait("@getDatabases");

        // Click on the first database
        cy.contains('p', 'Test Database 1').click();

        // Wait for the API calls to complete
        cy.wait("@getRoles");
        cy.wait("@getDatabaseInvitations");
        cy.wait("@getUsers");

        // Switch to Invitations tab
        cy.contains("Invitations").click();

        // Click the delete button
        cy.contains('div', 'Delete').click();
        // Verify the delete role request
        cy.wait("@deleteInvitation2").its("response.statusCode").should("eq", 400);

        // Verify that an error message is displayed when the request fails
        cy.contains('p', 'Something went wrong :(').should("exist");
        cy.contains('button', 'Close').click();
    });

    it("Successfully delete a user", () => {
        // @ts-ignore
        cy.intercept("DELETE", `${rolesApiUrl}/4`, {
            statusCode: 200, // Simulate good request
            body: { message: "" },
        }).as("deleteRole");

        // Visit the login page
        cy.visit("http://localhost:5173/login");

        // Log in with valid credentials
        cy.get('input[name="username"]').type("testuser");
        cy.get('input[name="password"]').type("password123");
        cy.get('button[type="submit"]').click();
        cy.get('a[href="/databases/"]').click();

        cy.wait("@getDatabases");

        // Click on the first database
        cy.contains('p', 'Test Database 1').click();

        // Wait for the API calls to complete
        cy.wait("@getRoles");
        cy.wait("@getDatabaseInvitations");
        cy.wait("@getUsers");

        // Switch to Users tab
        cy.contains("Users").click();

        // Click the delete button
        cy.contains('div', 'Delete').click();
        // Verify the delete role request
        cy.wait("@deleteRole").its("response.statusCode").should("eq", 200);
        cy.contains('p', 'Successfully deleted!').should("exist");
        cy.contains('button', 'Close').click();
    });

    it("Fails to delete a user", () => {
        // @ts-ignore
        cy.intercept("DELETE", `${rolesApiUrl}/4`, {
            statusCode: 400, // Simulate good request
            body: { message: "Failed to create role" },
        }).as("deleteRole");

        // Visit the login page
        cy.visit("http://localhost:5173/login");

        // Log in with valid credentials
        cy.get('input[name="username"]').type("testuser");
        cy.get('input[name="password"]').type("password123");
        cy.get('button[type="submit"]').click();
        cy.get('a[href="/databases/"]').click();

        cy.wait("@getDatabases");

        // Click on the first database
        cy.contains('p', 'Test Database 1').click();

        // Wait for the API calls to complete
        cy.wait("@getRoles");
        cy.wait("@getDatabaseInvitations");
        cy.wait("@getUsers");

        // Switch to Users tab
        cy.contains("Users").click();

        // Click the delete button
        cy.contains('div', 'Delete').click();
        // Verify the delete role request
        cy.wait("@deleteRole").its("response.statusCode").should("eq", 400);

        // Verify that an error message is displayed when the request fails
        cy.contains('p', 'Something went wrong').should("exist");
        cy.contains('button', 'Close').click();
    });

    it("Fails to create new user", () => {
        // @ts-ignore
        cy.intercept("POST", rolesApiUrl, {
            statusCode: 400, // Simulate bad request
            body: { message: "Failed to create role" },
        }).as("createRoleError");

        // Visit the login page
        cy.visit("http://localhost:5173/login");

        // Log in with valid credentials
        cy.get('input[name="username"]').type("testuser");
        cy.get('input[name="password"]').type("password123");
        cy.get('button[type="submit"]').click();
        cy.get('a[href="/databases/"]').click();

        cy.wait("@getDatabases");

        // Click on the first database
        cy.contains('p', 'Test Database 1').click();

        // Verify navigation to the database details page
        cy.url().should("include", "/databases/1");
        // Wait for the API calls to complete
        cy.wait("@getRoles");
        cy.wait("@getDatabaseInvitations");
        cy.wait("@getUsers");

        // Switch to Users tab
        cy.contains("Users").click();

        // Add a new user role
        cy.contains("Add new user").click();
        cy.get('input[name="roleName"]').type("new_role"); // Replace with actual input name
        cy.wait(1000)
        cy.get('button.bg-indigo-600').contains('Create').click();

        // Verify the role creation request
        cy.wait("@createRoleError").its("response.statusCode").should("eq", 400);

        // Verify that an error message is displayed when the request fails
        cy.contains('p', 'Something went wrong :(').should("exist");
        cy.contains('button', 'Close').click();
    });

    it("Login and visit the detail db view", () => {
        // Visit the login page
        cy.visit("http://localhost:5173/login");

        // Log in with valid credentials
        cy.get('input[name="username"]').type("testuser");
        cy.get('input[name="password"]').type("password123");
        cy.get('button[type="submit"]').click();
        cy.get('a[href="/databases/"]').click();

        cy.wait("@getDatabases");

        // Click on the first database
        cy.contains('p', 'Test Database 1').click();

        // Verify navigation to the database details page
        cy.url().should("include", "/databases/1");
        // Wait for the API calls to complete
        cy.wait("@getRoles");
        cy.wait("@getDatabaseInvitations");
        cy.wait("@getUsers");

        // Verify the database details are displayed
        cy.contains("Test Database 1").should("exist");
        cy.contains("PostgreSQL").should("exist");

        // Verify the tabs
        cy.contains("Overview").should("exist");
        cy.contains("Users").should("exist");
        cy.contains("Invitations").should("exist");

        // Switch to Users tab
        cy.contains("Users").click();
        cy.contains("Add new user").should("exist");

        // Switch to Invitations tab
        cy.contains("Invitations").click();
        cy.contains("Invite other people").should("exist");

        // Switch back to Overview tab
        cy.get('div.whitespace-nowrap.cursor-pointer').contains('Overview').click();
        cy.contains("Test Database").should("exist");

        // Open delete modal
        cy.contains('button', 'Actions').click();
        cy.contains("Delete").click();

        //Ensure the close button works
        cy.contains('button', 'Close').click();

        // Open delete modal again
        cy.contains('button', 'Actions').click();
        cy.contains("Delete").click();

        // Confirm delete
        cy.contains('button', 'Delete').click();

        // Verify the delete request
        cy.wait("@deleteDatabase1").its("response.statusCode").should("eq", 200);

        // Verify redirection
        cy.url().should("include", "/databases");

        cy.contains('p', 'Test Database 1').click();

        // Switch to Users tab
        cy.contains("Users").click();

        // Add a new user role
        cy.contains("Add new user").click();

        //Ensure the cancel button works
        cy.contains('button', 'Cancel').click();

        //Open the modal again
        cy.contains("Add new user").click();

        cy.get('input[name="roleName"]').type("new_role"); // Replace with actual input name
        cy.wait(1000)
        cy.get('button.bg-indigo-600').contains('Create').click();

        // Verify the role creation request
        cy.wait("@createRole").its("response.statusCode").should("eq", 200);
        cy.contains('p', 'Successfully created!').should("exist");
        cy.contains('button', 'Close').click();

        // Switch to Users tab
        cy.contains("Invitations").click();
        cy.get('button.relative.w-full[aria-haspopup="listbox"]').click();
        cy.get('[role="option"]').contains('O. User1').click();
        // Verify the invitation creation request
        cy.wait("@createInvitation").its("response.statusCode").should("eq", 200);
        cy.contains('p', 'Successfully created!').should("exist");
        cy.contains('button', 'Close').click();
    });
});
