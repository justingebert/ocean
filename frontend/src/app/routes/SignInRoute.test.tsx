import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import SignInRoute from "./SignInRoute";

vi.mock("@/features/auth/authContext", () => ({
  useAuth: () => ({
    status: "authenticated",
    loginPending: false,
    loginError: null,
    login: vi.fn(),
  }),
}));

function renderSignIn(state?: unknown) {
  render(
    <MemoryRouter initialEntries={[{ pathname: "/login", state }]}>
      <Routes>
        <Route path="/login" element={<SignInRoute />} />
        <Route path="/databases" element={<div>databases</div>} />
        <Route path="/databases/:id" element={<div>database page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("SignInRoute", () => {
  it("returns to the page that required sign-in", async () => {
    renderSignIn({ from: { pathname: "/databases/42", search: "" } });

    expect(await screen.findByText("database page")).toBeInTheDocument();
  });

  it("goes to the databases without a requested page", async () => {
    renderSignIn();

    expect(await screen.findByText("databases")).toBeInTheDocument();
  });
});
