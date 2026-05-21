"use client";

import { PlatformRouteError } from "../../../src/components/platform-route-error";

export default function WhatsAppError({ reset }: { error: Error; reset: () => void }) {
  return <PlatformRouteError error={new Error()} reset={reset} classPrefix="hz-route-error" />;
}
