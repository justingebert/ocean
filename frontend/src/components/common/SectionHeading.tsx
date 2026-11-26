import type { ReactNode } from "react";

import { cn } from "cn";

export interface SectionHeadingProps {
  children: ReactNode;
  className?: string;
}

export function SectionHeading({ children, className }: SectionHeadingProps) {
  return (
    <h2 className={cn("font-heading text-base font-semibold text-foreground", className)}>
      {children}
    </h2>
  );
}
