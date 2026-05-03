# User Stories

## Authentication & Token Management

### User Story 1: Successful Login
**As a** registered user  
**I want to** log in with valid credentials  
**So that** I can access the application  
#### Acceptance Criteria:
- Given I am on the login page,
- When I enter valid credentials and submit,
- Then I should be redirected to the Overview page.

### User Story 2: Failed Login
**As a** user  
**I want to** see an error message if I enter incorrect login details  
**So that** I am informed about incorrect credentials  
#### Acceptance Criteria:
- Given I am on the login page,
- When I enter invalid credentials and submit,
- Then an error message should appear.

### User Story 3: Token Refresh
**As a** logged-in user  
**I want to** have my access token refreshed automatically when it expires  
**So that** I can continue using the application without interruption  
#### Acceptance Criteria:
- Given my session is active but my token has expired,
- When I navigate to a protected resource,
- Then my token should be refreshed automatically.

### User Story 4: Handling Network Errors
**As a** user  
**I want to** see an error message when the login request fails due to network issues  
**So that** I am aware that the issue is network-related  
#### Acceptance Criteria:
- Given I am on the login page,
- When I attempt to log in and the network fails,
- Then I should see a "Network Error" message.

## Navigation & Views

### User Story 5: Navigating to the Overview Page
**As a** logged-in user  
**I want to** be redirected to the Overview page after logging in  
**So that** I can see an overview of the application  
#### Acceptance Criteria:
- Given I successfully log in,
- When my authentication is verified,
- Then I should be redirected to the Overview page.

### User Story 6: Navigating to the FAQ Page
**As a** user  
**I want to** access the FAQ page through the sidebar  
**So that** I can read frequently asked questions  
#### Acceptance Criteria:
- Given I am logged in,
- When I click on the "Open sidebar" button and select "FAQ",
- Then the FAQ page should load successfully.

### User Story 7: Navigating to the Settings Page
**As a** logged-in user  
**I want to** access my account settings  
**So that** I can manage my user profile and preferences  
#### Acceptance Criteria:
- Given I am logged in,
- When I open the user menu and select "Settings",
- Then the Settings page should load successfully.

### User Story 8: Viewing Database List
**As a** user  
**I want to** see a list of available databases  
**So that** I can manage my database instances  
#### Acceptance Criteria:
- Given I am logged in,
- When I navigate to the "Databases" page,
- Then I should see a list of existing databases or an empty state if none exist.

### User Story 9: Creating a New Database
**As a** user  
**I want to** create a new database  
**So that** I can manage my data more effectively  
#### Acceptance Criteria:
- Given I am logged in,
- When I fill out the "Create Database" form and submit,
- Then a new database should be created and listed under "Databases."

### User Story 10: Viewing Database Details
**As a** user  
**I want to** view detailed information about a selected database  
**So that** I can manage its configurations and users  
#### Acceptance Criteria:
- Given I am on the "Databases" page,
- When I click on a database entry,
- Then I should be redirected to its detail view with relevant information.

### User Story 11: Managing Database Roles and Users
**As an** admin user  
**I want to** add and remove users and roles from a database  
**So that** I can control database access  
#### Acceptance Criteria:
- Given I am on a database detail page,
- When I navigate to the "Users" tab,
- Then I should be able to add, remove, and modify roles for the database.

### User Story 12: Handling 404 Errors
**As a** user  
**I want to** see a custom 404 page when I visit a non-existent route  
**So that** I know the page is unavailable  
#### Acceptance Criteria:
- Given I enter an invalid URL,
- When the requested page does not exist,
- Then I should see a "404 - Page Not Found" message.

### User Story 13: Navigating from the 404 Page
**As a** user  
**I want to** return to the home page from the 404 error page  
**So that** I can continue using the application  
#### Acceptance Criteria:
- Given I am on the 404 error page,
- When I click "Go back home" or "Contact support",
- Then I should be redirected to the login page.
