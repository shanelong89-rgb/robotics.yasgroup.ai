"use client";

import { ReactNode } from "react";

// Privy is disabled until a real App ID is configured.
// Replace NEXT_PUBLIC_PRIVY_APP_ID in .env.local with a real Privy App ID from https://dashboard.privy.io
// Then uncomment the PrivyProvider below.

export function Providers({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
