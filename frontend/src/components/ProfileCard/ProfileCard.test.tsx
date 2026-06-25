import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import ProfileCard from "./ProfileCard";

describe("ProfileCard Component", () => {
  const mockUser = {
    id: 1,
    username: "string",
    firstName: "string",
    lastName: "string",
    mail: "string",
    employeeType: "string",
  };

  it("renders loading state correctly", () => {
    const { container } = render(<ProfileCard loading={true} />);

    expect(container.querySelector(".animate-pulse.h-4.w-32.bg-gray-200")).toBeInTheDocument();
  });

  it("renders the user details correctly", () => {
    const { container } = render(<ProfileCard user={mockUser} loading={false} />);

    const fullNameElement = container.querySelector(".mt-1.text-sm.text-gray-900");

    expect(fullNameElement).toHaveTextContent("string string");
  });

  it("renders fallback text for missing user data", () => {
    render(<ProfileCard loading={false} user={undefined} />);

    expect(screen.getAllByText("..").length).toBe(4);
  });
});
