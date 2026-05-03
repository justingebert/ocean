import React from "react";
import { mount } from "cypress/react";
import Layout from "./UserLayout";

// Tests for UserLayout component to ensure it renders correctly and displays children
describe("Layout Component", () => {
  it("renders the component without crashing", () => {
    // Mount the Layout component with empty content
    mount(<Layout>Test Content</Layout>);

    // Verify that the Layout renders successfully
    cy.get("div").should("exist");
  });
  // Ensure the Layout component mounts successfully without errors
  it("renders the children passed to it", () => {
    // Define the child content
    const childContent = "Hello, this is a child component!";

    // Mount the Layout component with child content
    mount(
        <Layout>
          <div>{childContent}</div>
        </Layout>
    );

    // Verify that the child content is rendered correctly
    cy.contains(childContent).should("exist");
  });
});
