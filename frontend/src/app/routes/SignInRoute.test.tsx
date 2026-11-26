import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import SignInRoute from "./SignInRoute";

let authStatus: "authenticated" | "unauthenticated" = "authenticated";

vi.mock("@/features/auth/authContext", () => ({
  useAuth: () => ({
    status: authStatus,
    loginPending: false,
    loginError: null,
    login: vi.fn(),
  }),
}));

// Decorative canvas; jsdom has no 2D context to draw it with.
vi.mock("@/features/auth/components/OceanGraphic", () => ({ OceanGraphic: () => null }));

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
  beforeEach(() => {
    authStatus = "authenticated";
  });

  it("returns to the page that required sign-in", async () => {
    renderSignIn({ from: { pathname: "/databases/42", search: "" } });

    expect(await screen.findByText("database page")).toBeInTheDocument();
  });

  it("goes to the databases without a requested page", async () => {
    renderSignIn();

    expect(await screen.findByText("databases")).toBeInTheDocument();
  });

  it("links to the legal notice and privacy policy on the sign-in page", () => {
    authStatus = "unauthenticated";
    renderSignIn();

    const legalNotice = screen.getByRole("link", { name: "Legal notice" });
    expect(legalNotice).toHaveAttribute("href", "https://www.htw-berlin.de/impressum/");
    expect(legalNotice).toHaveAttribute("target", "_blank");
    expect(legalNotice).toHaveAttribute("rel", "noopener noreferrer");

    const privacyPolicy = screen.getByRole("link", { name: "Privacy policy" });
    expect(privacyPolicy).toHaveAttribute("href", "https://www.htw-berlin.de/datenschutz/");
    expect(privacyPolicy).toHaveAttribute("target", "_blank");
    expect(privacyPolicy).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("links the HTW Berlin logo to the university website", () => {
    authStatus = "unauthenticated";
    renderSignIn();

    const htw = screen.getByRole("link", { name: "HTW Berlin" });
    expect(htw).toHaveAttribute("href", "https://www.htw-berlin.de/");
    expect(htw).toHaveAttribute("target", "_blank");
    expect(htw).toHaveAttribute("rel", "noopener noreferrer");
  });
});
