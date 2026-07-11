import { mount } from "cypress/react";

import "@/index.css";
import { DatabaseUsersPanel } from "./DatabaseUsersPanel";
import { RoleProperties } from "@/features/databases/model/role";

const roles: RoleProperties[] = [
  {
    id: 7,
    instanceId: 3,
    name: "reader",
    password: "secret-password-with-a-long-value",
  },
];

describe("DatabaseUsersPanel", () => {
  beforeEach(() => {
    mount(
      <DatabaseUsersPanel
        roles={roles}
        isCreatingRole={false}
        onAddUser={cy.stub()}
        onDeleteRole={cy.stub()}
      />,
    );
  });

  it("keeps the password column width stable when revealing a password", () => {
    cy.get("tbody tr td")
      .eq(1)
      .then(($passwordCell) => {
        const widthBeforeReveal = $passwordCell[0].getBoundingClientRect().width;

        cy.get('button[aria-label="Show password for reader"]').click();

        cy.get("tbody tr td")
          .eq(1)
          .then(($revealedPasswordCell) => {
            expect($revealedPasswordCell[0].getBoundingClientRect().width).to.be.closeTo(
              widthBeforeReveal,
              0.5,
            );
          });
      });
  });

  it("copies the password without revealing it", () => {
    cy.window().then((window) => {
      const writeText = cy.stub().resolves();
      Object.defineProperty(window.navigator, "clipboard", {
        configurable: true,
        value: { writeText },
      });
      cy.wrap(writeText).as("writeText");
    });

    cy.get('button[aria-label="Copy password for reader"]').click();

    cy.get("@writeText").should("have.been.calledOnceWith", roles[0].password);
    cy.get('input[aria-label="Password for reader"]').should("have.attr", "type", "password");
    cy.contains("secret-password-with-a-long-value").should("not.exist");
  });
});
