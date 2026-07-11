import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import ProfileCard from "./ProfileCard";

describe("ProfileCard Component", () => {
  const mockUser = {
    id: 1,
    username: "ada.lovelace",
    firstName: "Ada",
    lastName: "Lovelace",
    mail: "ada@example.com",
    employeeType: "Engineer",
  };

  it("renders loading state correctly", () => {
    const { container } = render(<ProfileCard loading={true} />);

    expect(container.querySelectorAll('[data-slot="skeleton"]')).toHaveLength(4);
  });

  it("renders the user details correctly", () => {
    render(<ProfileCard user={mockUser} loading={false} />);

    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
    expect(screen.getByText("Engineer")).toBeInTheDocument();
    expect(screen.getByText("ada@example.com")).toBeInTheDocument();
    expect(screen.getByText("ada.lovelace")).toBeInTheDocument();
  });

  it("renders fallback text for missing user data", () => {
    render(<ProfileCard loading={false} user={undefined} />);

    expect(screen.getAllByText("..").length).toBe(4);
  });
});
