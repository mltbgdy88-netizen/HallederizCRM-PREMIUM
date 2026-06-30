"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo } from "react";
import { ThemeToggle } from "@hallederiz/ui";
import { useAuth } from "../providers/auth-provider";
import { useTheme } from "../providers/theme-provider";

const NAV_ITEMS: Array<{ href: string; label: string; exact?: boolean }> = [
  { href: "/operator", label: "Özet", exact: true },
  { href: "/operator/kiracilar", label: "Kiracılar" },
  { href: "/operator/paketler", label: "Paketler" },
  { href: "/operator/duyuru-videolari", label: "Duyuru Videoları" }
] as const;

function normalizePath(pathname: string): string {
  return pathname.replace(/\/+$/, "") || "/";
}

export function OperatorShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { session, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const normalizedPath = normalizePath(pathname);

  const displayName = session?.user.fullName ?? "Operatör";

  const activeHref = useMemo(() => {
    const match = [...NAV_ITEMS]
      .sort((a, b) => b.href.length - a.href.length)
      .find((item) =>
        item.exact === true
          ? normalizedPath === item.href
          : normalizedPath === item.href || normalizedPath.startsWith(`${item.href}/`)
      );
    return match?.href ?? "/operator";
  }, [normalizedPath]);

  return (
    <div className="hz-operator-shell" data-page="operator-console">
      <aside className="hz-operator-sidebar" aria-label="SaaS kontrol menüsü">
        <div className="hz-operator-brand">
          <span className="hz-operator-brand-mark" aria-hidden>
            HZ
          </span>
          <div>
            <strong>SaaS Kontrol</strong>
            <span>Hallederiz operatör paneli</span>
          </div>
        </div>
        <nav className="hz-operator-nav">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`hz-operator-nav-link${activeHref === item.href ? " is-active" : ""}`}
              aria-current={activeHref === item.href ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hz-operator-sidebar-foot">
          <Link href="/dashboard" className="hz-operator-nav-link hz-operator-nav-link--ghost">
            CRM&apos;e dön
          </Link>
        </div>
      </aside>

      <div className="hz-operator-main">
        <header className="hz-operator-topbar">
          <div>
            <p className="hz-operator-topbar-kicker">Platform operatörü</p>
            <h1 className="hz-operator-topbar-title">SaaS Yönetim Konsolu</h1>
          </div>
          <div className="hz-operator-topbar-actions">
            <ThemeToggle mode={theme} onToggle={toggleTheme} compact />
            <span className="hz-operator-user">{displayName}</span>
            <button
              type="button"
              className="hz-btn hz-btn-secondary"
              onClick={() => {
                logout();
                router.push("/login");
              }}
            >
              Çıkış
            </button>
          </div>
        </header>
        <main className="hz-operator-content">{children}</main>
      </div>
    </div>
  );
}
