"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "../providers/auth-provider";
import { hasOperatorConsoleAccess } from "../features/operator/utils/has-operator-access";

export function OperatorProtectedRoute({ children }: { children: React.ReactNode }) {
  const { state, session } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (state === "anonymous") {
      const fullPath =
        typeof window !== "undefined"
          ? `${window.location.pathname}${window.location.search}`
          : pathname || "/operator";
      router.replace(`/login?next=${encodeURIComponent(fullPath)}`);
      return;
    }

    if (state === "authenticated" && !hasOperatorConsoleAccess(session)) {
      router.replace("/unauthorized");
    }
  }, [pathname, router, session, state]);

  if (state === "loading") {
    return (
      <div className="auth-loading">
        <div className="card">
          <h2>Operatör oturumu kontrol ediliyor</h2>
          <p>SaaS kontrol paneli yetkisi doğrulanınca sayfa açılacak.</p>
        </div>
      </div>
    );
  }

  if (state === "anonymous" || !hasOperatorConsoleAccess(session)) {
    return null;
  }

  return <>{children}</>;
}
