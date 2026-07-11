import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { UserClient } from "@/api/userClient";
import { AuthProvider } from "./AuthProvider";
import { type AuthStatus, useAuth } from "./authContext";

vi.mock("@/api/client", () => ({
  setBearerToken: vi.fn(),
  setupRequestInterceptors: vi.fn(() => vi.fn()),
}));

vi.mock("@/api/userClient", () => ({
  UserClient: {
    getUser: vi.fn(),
  },
}));

const observedStatuses: AuthStatus[] = [];
const storedValues = new Map<string, string>();

const storage: Storage = {
  get length() {
    return storedValues.size;
  },
  clear: () => storedValues.clear(),
  getItem: (key) => storedValues.get(key) ?? null,
  key: (index) => Array.from(storedValues.keys())[index] ?? null,
  removeItem: (key) => storedValues.delete(key),
  setItem: (key, value) => storedValues.set(key, value),
};

function StatusProbe() {
  const { status } = useAuth();
  observedStatuses.push(status);

  return <div>{status}</div>;
}

function renderProvider() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StatusProbe />
      </AuthProvider>
    </QueryClientProvider>,
  );
}

describe("AuthProvider", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", storage);
  });

  afterEach(() => {
    localStorage.clear();
    observedStatuses.length = 0;
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it("starts unauthenticated without flashing the checking state when no token is stored", () => {
    renderProvider();

    expect(observedStatuses[0]).toBe("unauthenticated");
    expect(screen.getByText("unauthenticated")).toBeInTheDocument();
    expect(UserClient.getUser).not.toHaveBeenCalled();
  });

  it("checks and restores a stored session", async () => {
    localStorage.setItem("accessToken", "stored-access-token");
    vi.mocked(UserClient.getUser).mockResolvedValue({
      id: 1,
      username: "student",
      firstName: "Student",
      lastName: "User",
      mail: "student@example.com",
      employeeType: "student",
    });

    renderProvider();

    expect(observedStatuses[0]).toBe("checking");
    await waitFor(() => expect(screen.getByText("authenticated")).toBeInTheDocument());
  });
});
