import React from "react";

/**
 * Props for the `Layout` component.
 */
export interface LayoutProps {
  /** The child components to be rendered inside the layout. */
  children: React.ReactNode;
}
/**
 * A simple layout wrapper component.
 * Wraps the children inside a `div` container.
 *
 * @param children - The content to be wrapped inside the layout.
 */
const Layout: React.FC<LayoutProps> = ({ children }) => {
  return <div className="">{children}</div>;
};

export default Layout;
