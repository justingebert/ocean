import type { ReactNode } from "react";
import { cn } from "cn";

export interface PageHeaderProps {
  title: string;
  description?: string;
  /** Shown before the title, e.g. an engine logo. */
  icon?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({ title, description, icon, actions, className }: PageHeaderProps) {
  return (
    <header className={cn("mb-6 flex flex-wrap items-center justify-between gap-4", className)}>
      <div className="flex min-w-0 items-center gap-3">
        {icon}
        <div className="min-w-0">
          <h1 className="font-heading text-xl font-semibold tracking-tight text-balance text-foreground">
            {title}
          </h1>
          {description ? (
            <p className="mt-1 text-sm text-pretty text-muted-foreground">{description}</p>
          ) : null}
        </div>
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </header>
  );
}
