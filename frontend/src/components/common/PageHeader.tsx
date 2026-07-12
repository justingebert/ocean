import { cn } from "@/lib/utils";

export interface PageHeaderProps {
  title: string;
  description?: string;
  className?: string;
}

export function PageHeader({ title, description, className }: PageHeaderProps) {
  return (
    <header className={cn("mb-8", className)}>
      <h1 className="font-heading text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-4xl">
        {title}
      </h1>
      {description ? <p className="mt-2 text-pretty text-muted-foreground">{description}</p> : null}
    </header>
  );
}
