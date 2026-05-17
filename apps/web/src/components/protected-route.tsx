"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "../providers/auth-provider";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { state } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (state === "anonymous") {
      const nextPath = pathname ? `?next=${encodeURIComponent(pathname)}` : "";
      router.replace(`/login${nextPath}`);
    }
  }, [pathname, router, state]);

  if (state === "loading") {
    return (
      <div className="auth-loading">
        <div className="card">
          <h2>Oturum kontrol ediliyor</h2>
          <p>Platform Core kimlik doğrulaması yükleniyor.</p>
        </div>
      </div>
    );
  }

  if (state === "anonymous") {
    return null;
  }

  return <>{children}</>;
}
