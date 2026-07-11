import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect } from "vitest";
import Headline, { HeadlineProps } from "./Headline";

describe("Headline Component", () => {
  const renderHeadline = (props: HeadlineProps) => render(<Headline {...props} />);

  it("renders without crashing", () => {
    const props: HeadlineProps = { title: "Test Title", size: "medium" };
    renderHeadline(props);
    expect(screen.getByText("Test Title")).toBeInTheDocument();
  });

  it("renders the small headline with the correct class", () => {
    const props: HeadlineProps = { title: "Small Title", size: "small" };
    renderHeadline(props);
    const element = screen.getByText("Small Title");

    expect(element).toHaveClass("text-l text-gray-600 sm:text-xl mb-1");
  });

  it("renders the medium headline with the correct class", () => {
    const props: HeadlineProps = { title: "Medium Title", size: "medium" };
    renderHeadline(props);

    const element = screen.getByText("Medium Title");
    expect(element).toHaveClass("text-xl text-gray-600 sm:text-2xl mb-3");
  });

  it("renders the large headline with the correct class", () => {
    const props: HeadlineProps = { title: "Large Title", size: "large" };
    renderHeadline(props);

    const element = screen.getByText("Large Title");
    expect(element).toHaveClass("text-3xl text-gray-600 sm:text-4xl mb-5");
  });
});
