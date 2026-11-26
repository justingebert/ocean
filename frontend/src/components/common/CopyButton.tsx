import { useEffect, useState, type ComponentProps } from "react";
import { CheckIcon, CopyIcon } from "lucide-react";
import { toast } from "sonner";

import { InputGroupButton } from "@/components/ui/input-group";

/** How long the check mark stays after copying. */
const COPIED_MS = 1500;

/**
 * Copy button for an InputGroup. Confirms in place: the icon turns into a
 * check for a moment. Only a failure shows a toast.
 */
export function CopyButton({
  value,
  ...props
}: { value: string } & Omit<ComponentProps<typeof InputGroupButton>, "onClick" | "children">) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) {
      return;
    }
    const timeout = setTimeout(() => setCopied(false), COPIED_MS);
    return () => clearTimeout(timeout);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch {
      toast.error("Couldn't copy to the clipboard");
    }
  };

  return (
    <>
      <InputGroupButton size="icon-xs" data-copied={copied || undefined} onClick={copy} {...props}>
        {copied ? <CheckIcon /> : <CopyIcon />}
      </InputGroupButton>
      <span aria-live="polite" className="sr-only">
        {copied ? "Copied" : ""}
      </span>
    </>
  );
}
