// @ts-nocheck
"use client";

import Link from "next/link";
import { useCallback, type MouseEvent, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { NAV_ITEMS } from "../features/dashboard/data/dashboard-reference-mock";
import { handleReferencePageClick } from "@/lib/reference/reference-page-interaction";
import { useAuth } from "../providers/auth-provider";
import { useTheme } from "../providers/theme-provider";
import { useToast } from "../providers/toast-provider";
import {
  IconBell,
  IconChevronDown,
  IconMenu,
  IconSearch,
  IconSun,
  NavIcon,
  NAV_ICON_MAP,
  ShieldLogo
} from "./reference/icons";

function isNavActive(pathname: string, href: string): boolean {
  if (href === "#" || !href.startsWith("/")) return false;
  if (href === "/dashboard") {
    return pathname === "/dashboard" || pathname.startsWith("/dashboard/");
  }
  if (href === "/hizli-islem") {
    return (
      pathname === href ||
      pathname.startsWith("/hizli-islem/") ||
      pathname === "/hizli-satis" ||
      pathname.startsWith("/hizli-satis/")
    );
  }
  if (href === "/ai") {
    return pathname === "/ai" || pathname.startsWith("/ai/");
  }
  if (href === "/stok") {
    return (
      pathname === href ||
      pathname.startsWith(`${href}/`) ||
      pathname === "/demo-mode" ||
      pathname === "/live-empty"
    );
  }
  if (href === "/whatsapp") {
    return (
      pathname === "/whatsapp" ||
      pathname.startsWith("/whatsapp/") ||
      pathname === "/gelen-kutu" ||
      pathname.startsWith("/gelen-kutu/")
    );
  }
  if (href === "/onaylar") {
    return pathname === "/onaylar" || pathname.startsWith("/onaylar/");
  }
  if (href === "/ayarlar") {
    return (
      pathname === "/ayarlar" ||
      pathname.startsWith("/ayarlar/") ||
      pathname === "/kullanicilar" ||
      pathname.startsWith("/kullanicilar/") ||
      pathname === "/erp" ||
      pathname.startsWith("/erp/")
    );
  }
  if (href === "/muhasebe") {
    return (
      pathname === "/muhasebe" ||
      pathname.startsWith("/faturalar") ||
      pathname.startsWith("/tahsilatlar") ||
      pathname.startsWith("/iadeler")
    );
  }
  if (href === "/fabrikalar/siparis") {
    return pathname.startsWith("/fabrikalar");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function userInitials(fullName: string | undefined): string {
  const parts = fullName?.trim().split(/\s+/).filter(Boolean) ?? [];
  if (parts.length === 0) return "MK";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

export function ReferenceAppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { session, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { pushToast } = useToast();

  const displayName = session?.user.fullName?.trim() || "MevlÃ¼t K.";
  const displayRole = session?.user.title?.trim() || "Operasyon YÃ¶neticisi";
  const initials = userInitials(session?.user.fullName);

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  const handlePageInteraction = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      handleReferencePageClick(event, router, pushToast, pathname);
    },
    [pathname, pushToast, router]
  );

  return (
    <div className="ref-shell">
      <aside className="ref-sidebar" aria-label="Ana menÃ¼">
        <div className="ref-sidebar-brand">
          <div className="ref-sidebar-logo-row">
            <ShieldLogo>P</ShieldLogo>
            <div>
              <p className="ref-sidebar-logo-title">PREMIUM</p>
              <p className="ref-sidebar-logo-sub">CRM</p>
            </div>
          </div>
        </div>

        <nav className="ref-sidebar-nav">
          {NAV_ITEMS.map((item) => {
            const active = isNavActive(pathname, item.href);
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`ref-sidebar-item${active ? " ref-sidebar-item--active" : ""}`}
                aria-current={active ? "page" : undefined}
              >
                <NavIcon id={item.id as keyof typeof NAV_ICON_MAP} className="ref-sidebar-item-icon" />
                <span className="ref-sidebar-item-label">{item.label}</span>
                {item.badge ? <span className="ref-sidebar-badge">{item.badge}</span> : null}
              </Link>
            );
          })}
        </nav>

        <footer className="ref-sidebar-footer">
          <p>Premium CRM v2.6.1</p>
          <p>Â© 2025 TÃ¼m haklarÄ± saklÄ±dÄ±r.</p>
        </footer>
      </aside>

      <div className="ref-main">
        <header className="ref-header">
          <button
            type="button"
            className="ref-header-menu"
            aria-label="MenÃ¼"
            data-ref-skip-fallback
            onClick={() => pushToast("Kenar menÃ¼ daraltma demo modunda.")}
          >
            <IconMenu className="ref-header-menu-icon" />
          </button>

          <div className="ref-header-search">
            <IconSearch className="ref-header-search-icon" />
            <input type="search" placeholder="Arama yapÄ±n..." aria-label="Arama" readOnly />
          </div>

          <div className="ref-header-actions">
            <button type="button" className="ref-theme-toggle" onClick={toggleTheme}>
              <IconSun className="ref-theme-toggle-icon" />
              <span>Tema: {theme === "dark" ? "Koyu" : "AÃ§Ä±k"}</span>
              <IconChevronDown className="ref-theme-toggle-chevron" />
            </button>

            <button
              type="button"
              className="ref-header-bell-btn"
              aria-label="Bildirimler"
              data-ref-skip-fallback
              onClick={() => pushToast("3 okunmamÄ±ÅŸ bildirim (demo).")}
            >
              <IconBell className="ref-header-bell-icon" />
              <span className="ref-header-bell-badge">3</span>
            </button>

            <button type="button" className="ref-header-user" data-ref-skip-fallback onClick={handleLogout}>
              <span className="ref-header-avatar">{initials}</span>
              <div className="ref-header-user-text">
                <strong>{displayName}</strong>
                <span>{displayRole}</span>
              </div>
            </button>
          </div>
        </header>

        <main className="ref-page" onClick={handlePageInteraction}>
          {children}
        </main>
      </div>
    </div>
  );
}

