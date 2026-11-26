import { isBefore } from "date-fns";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "cn";
import {
  formatExpiry,
  isExpiringSoon,
} from "@/features/databases/components/DatabaseList/databaseListFormat";
import { formatDate } from "@/lib/format";

/**
 * Expiry as relative time with a status dot ("in 6 months", amber "in 12 days").
 * The exact date is in a tooltip.
 */
export function ExpiryStatus({
  expiresAt,
  className,
}: {
  expiresAt: Date | null;
  className?: string;
}) {
  if (expiresAt === null) {
    return <span className={className}>Never</span>;
  }

  const now = new Date();
  const expired = isBefore(expiresAt, now);
  const soon = isExpiringSoon(expiresAt, now);

  return (
    <Tooltip>
      <TooltipTrigger
        render={<span />}
        className={cn("inline-flex items-center gap-2", soon && "text-foreground", className)}
      >
        <span
          aria-hidden
          className={cn(
            "size-1.5 shrink-0 rounded-full bg-muted-foreground/40",
            soon && "bg-warning",
            expired && "bg-destructive",
          )}
        />
        <time dateTime={new Date(expiresAt).toISOString()}>{formatExpiry(expiresAt, now)}</time>
      </TooltipTrigger>
      <TooltipContent>{formatDate(expiresAt)}</TooltipContent>
    </Tooltip>
  );
}
