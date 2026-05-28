"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function PanelRedirectClient() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);

  return (
    <main className="hz-panel-redirect" aria-busy="true" aria-live="polite">
      <div className="hz-panel-redirect-spinner" role="presentation" />
      <p className="hz-panel-redirect-text">Gösterge paneline yönlendiriliyorsunuz.</p>
    </main>
  );
}
