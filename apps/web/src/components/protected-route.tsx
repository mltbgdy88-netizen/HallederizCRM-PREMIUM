"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "../providers/auth-provider";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { state } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (state !== "anonymous") {
      return;
    }

    const fullPath =
      typeof window !== "undefined"
        ? `${window.location.pathname}${window.location.search}`
        : pathname || "/dashboard";
    router.replace(`/login?next=${encodeURIComponent(fullPath)}`);
  }, [pathname, router, state]);

  if (state === "loading") {
    return (
      <div className="auth-loading">
        <div className="card">
          <h2>Oturum bilgileri kontrol ediliyor</h2>
          <p>Kimlik doğrulaması tamamlanınca sayfa açılacak.</p>
        </div>
      </div>
    );
  }

  if (state === "anonymous") {
    return null;
  }

  return <>{children}</>;
}
