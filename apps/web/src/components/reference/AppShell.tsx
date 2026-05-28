"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, USER } from "@/features/dashboard/data/dashboard-reference-mock";
import {
  IconBell,
  IconChevronDown,
  IconMenu,
  IconSearch,
  IconSun,
  NavIcon,
  NAV_ICON_MAP,
  ShieldLogo
} from "./icons";

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

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="ref-shell">
      <aside className="ref-sidebar" aria-label="Ana menü">
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
            <a
              key={item.id}
              href={item.href}
              className={`ref-sidebar-item${active ? " ref-sidebar-item--active" : ""}`}
              aria-current={active ? "page" : undefined}
            >
              <NavIcon id={item.id as keyof typeof NAV_ICON_MAP} className="ref-sidebar-item-icon" />
              <span className="ref-sidebar-item-label">{item.label}</span>
              {item.badge ? <span className="ref-sidebar-badge">{item.badge}</span> : null}
            </a>
          );
          })}
        </nav>

        <footer className="ref-sidebar-footer">
          <p>Premium CRM v2.6.1</p>
          <p>© 2025 Tüm hakları saklıdır.</p>
        </footer>
      </aside>

      <div className="ref-main">
        <header className="ref-header">
          <button type="button" className="ref-header-menu" aria-label="Menü">
            <IconMenu className="ref-header-menu-icon" />
          </button>

          <div className="ref-header-search">
            <IconSearch className="ref-header-search-icon" />
            <input type="search" placeholder="Arama yapın..." aria-label="Arama" readOnly />
          </div>

          <div className="ref-header-actions">
            <button type="button" className="ref-theme-toggle">
              <IconSun className="ref-theme-toggle-icon" />
              <span>Tema: Açık</span>
              <IconChevronDown className="ref-theme-toggle-chevron" />
            </button>

            <button type="button" className="ref-header-bell-btn" aria-label="Bildirimler">
              <IconBell className="ref-header-bell-icon" />
              <span className="ref-header-bell-badge">3</span>
            </button>

            <div className="ref-header-user">
              <span className="ref-header-avatar">{USER.initials}</span>
              <div className="ref-header-user-text">
                <strong>{USER.name}</strong>
                <span>{USER.role}</span>
              </div>
            </div>
          </div>
        </header>

        <main className="ref-page">{children}</main>
      </div>
    </div>
  );
}
