import { useEffect, useState } from "react";

export type AvailabilityStatus = "idle" | "checking" | "available" | "unavailable" | "error";

interface UseDebouncedAvailabilityOptions {
  check: () => Promise<boolean>;
  delay?: number;
  enabled: boolean;
  key: string;
}

interface AvailabilityState {
  key: string;
  status: AvailabilityStatus;
}

export function useDebouncedAvailability({
  check,
  delay = 250,
  enabled,
  key,
}: UseDebouncedAvailabilityOptions): AvailabilityStatus {
  const [state, setState] = useState<AvailabilityState>({ key: "", status: "idle" });

  useEffect(() => {
    if (!enabled) {
      setState({ key, status: "idle" });
      return;
    }

    let active = true;
    setState({ key, status: "checking" });

    const timeout = window.setTimeout(() => {
      void check()
        .then((available) => {
          if (active) {
            setState({ key, status: available ? "available" : "unavailable" });
          }
        })
        .catch(() => {
          if (active) {
            setState({ key, status: "error" });
          }
        });
    }, delay);

    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, [check, delay, enabled, key]);

  return state.key === key ? state.status : "idle";
}
