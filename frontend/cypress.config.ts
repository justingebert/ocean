import { defineConfig } from "cypress";
import codeCoverageTask from "@cypress/code-coverage/task";

export default defineConfig({
  env:{
    "VITE_POSTGRESQL_HOSTNAME": "localhost",
    "VITE_POSTGRESQL_PORT": "5432",
    "VITE_MONGODB_HOSTNAME": "localhost",
    "VITE_MONGODB_PORT": "27017",
    "VITE_ADMINER_URL": "http://localhost:8080"
  },
  component: {
    devServer: {
      framework: "react",
      bundler: "vite",
    },
    setupNodeEvents(on, config) {
      console.log("Registering code coverage task...");
      codeCoverageTask(on, config); // Register the code coverage task here
      return config;
    },
    specPattern: "src/**/*.cy.{js,jsx,ts,tsx}",
  },

  e2e: {
    setupNodeEvents(on, config) {
      console.log("Registering code coverage task...");
      codeCoverageTask(on, config); // Register the code coverage task here
      return config;
    },
  },
});
