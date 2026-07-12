import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface SectionHeadingProps {
  children: ReactNode;
  className?: string;
}

export function SectionHeading({ children, className }: SectionHeadingProps) {
  return (
    <h2
      className={cn(
        "font-heading text-xl font-semibold tracking-tight text-foreground",
        className,
      )}
    >
      {children}
    </h2>
  );
}
