import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DatabaseOverviewPanel } from "./DatabaseOverviewPanel";
import { Database } from "@/features/databases/model/database";
import { EngineType } from "@/features/databases/model/engine";
import { UserProperties } from "@/types/user";

const user: UserProperties = {
  id: 1,
  username: "owner",
  firstName: "O",
  lastName: "Wner",
  mail: "owner@example.com",
  employeeType: "Student",
};

const database = (expiresAt: Date | null) =>
  new Database({
    id: 1,
    name: "customer_db",
    engine: EngineType.PostgreSQL,
    createdAt: new Date(2026, 0, 1),
    expiresAt,
    userId: 1,
  });

describe("<DatabaseOverviewPanel /> expiry", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 10, 6));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows the expiry as relative time and lets the owner renew", async () => {
    const onRenew = vi.fn();

    render(
      <DatabaseOverviewPanel
        database={database(new Date(2027, 4, 6))}
        user={user}
        canRenew
        onRenew={onRenew}
      />,
    );

    expect(screen.getByText("in 6 months")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Renew" }));
    expect(onRenew).toHaveBeenCalledOnce();
  });

  it("hides Renew for non-owners", () => {
    render(<DatabaseOverviewPanel database={database(new Date(2027, 4, 6))} user={user} />);

    expect(screen.queryByRole("button", { name: "Renew" })).not.toBeInTheDocument();
  });

  it("shows Never expires without a Renew button", () => {
    render(<DatabaseOverviewPanel database={database(null)} user={user} canRenew />);

    expect(screen.getByText("Never expires")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Renew" })).not.toBeInTheDocument();
  });
});
