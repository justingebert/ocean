import { useEffect, useState } from "react";

import { AppShellLoading } from "./AppShellLoading";

const INDICATOR_DELAY_MS = 200;

export function AuthLoadingScreen() {
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => setShowIndicator(true), INDICATOR_DELAY_MS);

    return () => window.clearTimeout(timeout);
  }, []);

  if (!showIndicator) {
    return <div className="min-h-screen bg-background" />;
  }

  return <AppShellLoading label="Checking session" />;
}
