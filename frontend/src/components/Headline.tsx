/* This example requires Tailwind CSS v2.0+ */
import React from "react";

/**
 * Props for the `Headline` component.
 */
export interface HeadlineProps {
  /** The text content of the headline. */
  title: string;
  /** Determines the size of the headline (`"small"`, `"medium"`, or `"large"`). */
  size: "small" | "medium" | "large";
}
/**
 * Renders a headline with dynamic sizes.
 * - Supports `"small"`, `"medium"`, and `"large"` sizes.
 * - Uses Tailwind CSS for styling.
 *
 * @param title - The text content of the headline.
 * @param size - Determines the size of the headline.
 */
const Headline: React.FC<HeadlineProps> = ({ title, size }) => {
  /**
   * Renders the headline based on the specified size.
   *
   * @returns A React element containing the styled headline.
   */
  const renderInternal = (): React.ReactElement => {
    if (size === "small") {
      return <div className="text-l text-gray-600 sm:text-xl mb-1">{title}</div>;
    } else if (size === "medium") {
      return <div className="text-xl  text-gray-600 sm:text-2xl mb-3">{title}</div>;
    } else {
      return <div className="text-3xl text-gray-600 sm:text-4xl mb-5">{title}</div>;
    }
  };

  return renderInternal();
};

export default Headline;
