# Frontend

## Overview
This is a frontend project built using **React 19**, **Vite**, and **TailwindCSS**. It utilizes **Redux Toolkit** for state management, **React Router** for navigation, and **TanStack Query** for data fetching.

## Installation
### Prerequisites
- **Node.js** (Latest LTS version recommended)
- **npm** (Bundled with Node.js)

### Setup
Clone the repository and install dependencies:
```sh
git clone https://github.com/buayanil/ocean.git
cd frontend
npm install
```

## Scripts
The following scripts are available:

### Development
```sh
npm run dev
```
Runs the development server using **Vite**.

### Build
```sh
npm run build
```
Compiles the application for production.

### Preview
```sh
npm run preview
```
Serves the built project for preview.

### Storybook
```sh
npm run storybook
```
Starts Storybook for component development.

### Generate Documentation
```sh
npm run docs
```
Generates TypeScript documentation using TypeDoc. The documentation will be output to docs/typedoc/.

### Run Tests
#### Unit & Component Tests (Vitest)
```sh
npm run vitest
```
Runs unit and component tests using **Vitest**.

#### Coverage Report
```sh
npm run vitest:coverage
```
Generates a coverage report for the test suite.

#### Cypress Component Tests
Make sure that the development server is not running
```sh
npm run cypress:component
```
Runs component tests using **Cypress**.

#### End-to-End (E2E) Tests
Make sure that the development server is running
```sh
npm run test:e2e
```
Runs E2E tests using **Cypress**.

#### Run Tests
```sh
npm run test
```
Runs both **Vitest** and **Cypress** component tests.

### Generate Code Coverage
```sh
npm run generate-coverage-report
```
Generates a comprehensive coverage report using NYC, providing both text and HTML output in the coverage/total directory.

If you want to unify the vitest and cypress test coverage, copy the coverage-final.json from coverage/vitest to .nyc_output and then run the command

## Linting
```sh
npm run lint
```
Runs ESLint on the project.

## Dependency Management with Renovate
This project uses **Renovate** for automated dependency updates. Renovate is configured to monitor dependencies and create pull requests when updates are available.

### Running Renovate with Docker
To manually trigger Renovate, run the following command:
```sh
docker run --rm -e RENOVATE_TOKEN="your renovate token" renovate/renovate buayanil/ocean
```
Ensure that the **RENOVATE_TOKEN** is set up with the required GitHub or GitLab permissions to allow Renovate to access and update the repository.

## Dependencies
### Core Dependencies
- **React 19**, **React DOM 19**
- **Redux Toolkit**, **React Redux**, **Redux Saga**
- **React Router DOM 7**
- **TanStack Query 5**
- **TailwindCSS 4**, **@headlessui/react**, **@heroicons/react**
- **Formik**, **Yup** (for form handling & validation)
- **Axios** (for HTTP requests)
- **Date-fns** (for date utilities)
- **Jose** (for JWT handling)

### Dev Dependencies
- **Vite 6**, **TypeScript**
- **Vitest**, **@testing-library/react**, **Jest DOM**
- **Cypress** (E2E & component testing)
- **Storybook** (UI component development)
- **ESLint**, **TypeScript ESLint**
