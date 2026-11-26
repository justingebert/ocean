import { cn } from "cn";

export interface OceanLogoProps {
  className?: string;
  alt?: string;
}

/** The logo is dark navy on transparent; in dark mode it sits on a white tile to stay visible. */
export function OceanLogo({ className, alt = "Ocean logo" }: OceanLogoProps) {
  return (
    <img
      className={cn("size-7 shrink-0 rounded-md dark:bg-white dark:p-0.5", className)}
      src="/ocean-logo.png"
      alt={alt}
    />
  );
}
