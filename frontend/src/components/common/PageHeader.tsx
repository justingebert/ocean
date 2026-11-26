import { cn } from "cn";

export interface PageHeaderProps {
  title: string;
  description?: string;
  className?: string;
}

export function PageHeader({ title, description, className }: PageHeaderProps) {
  return (
    <header className={cn("mb-6", className)}>
      <h1 className="font-heading text-xl font-semibold tracking-tight text-balance text-foreground">
        {title}
      </h1>
      {description ? <p className="mt-1 text-sm text-pretty text-muted-foreground">{description}</p> : null}
    </header>
  );
}
