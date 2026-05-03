# Functional Requirements

## 1. Authentication & Authorization

### 1.1 User Login
- The system must allow users to log in using a username and password.
- Authentication must be verified against a backend service.
- Successful login redirects the user to the Overview page.
- If login fails, an appropriate error message should be displayed.
- The login process should complete within a reasonable time, typically under **2 seconds**.

### 1.2 Token Management
- The system must store access and refresh tokens securely in local storage.
- The system must automatically refresh the access token when expired.
- If token refresh fails, the user must be logged out and redirected to the login page.
- Token refresh requests should be completed seamlessly without noticeable delays.

## 2. Navigation & Views

### 2.1 Overview Page
- Users must be redirected to the Overview page after a successful login.
- The Overview page must display relevant starting points for users.

### 2.2 FAQ Page
- Users must be able to access the FAQ page via the sidebar navigation.
- The FAQ page must display a list of frequently asked questions and their answers.

### 2.3 Settings Page
- Users must be able to access their account settings via the user menu.
- The Settings page must display user details, including name, email, and role.

## 3. Database Management

### 3.1 Viewing Database List
- The system must display a list of available databases for the logged-in user.
- If no databases are available, an appropriate empty state must be shown.
- The database list must be retrieved efficiently to ensure a **smooth user experience**.

### 3.2 Creating a New Database
- Users must be able to create a new database using a provided form.
- The system must validate the database name before submission.
- Upon successful creation, the user must be redirected to the database list.
- Database creation should not take more than **a few seconds**.

### 3.3 Viewing Database Details
- Users must be able to click on a database entry to view detailed information.
- The details page must include database configuration information.
- Fetching database details, roles, and invitations should occur without noticeable lag.

### 3.4 Managing Database Users & Roles
- Admin users must be able to add and remove users from a database.
- Admin users must be able to assign and remove roles for database users.
- Role changes must be updated in the system immediately.
- Managing users and roles should be performed **with minimal delays**.

## 4. Error Handling

### 4.1 Handling Network Errors
- If a network failure occurs during login, a "Network Error" message must be displayed.
- Users must be able to retry the login attempt.
- Failed API requests should be **handled gracefully** to maintain a responsive UI.

### 4.2 Handling 404 Errors
- If a user navigates to a non-existent route, a "404 - Page Not Found" message must be displayed.
- Users must have the option to return to the home page from the 404 page.

## 5. Security & Session Management

### 5.1 Session Expiry
- The system must automatically log users out when their session expires.
- Users must be redirected to the login page after session expiration.

### 5.2 Logout Functionality
- Users must be able to log out manually via the user menu.
- Logging out must clear all authentication tokens from local storage.