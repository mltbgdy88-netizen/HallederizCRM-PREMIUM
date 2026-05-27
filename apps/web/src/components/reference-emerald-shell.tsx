// @ts-nocheck
"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { EG_NAV } from "../features/dashboard/data/ana-sayfa-emerald-gold-mock";
import {
  IconBell,
  IconChevronDown,
  IconMessage,
  IconSearch,
  IconZap
} from "./reference/icons";

function EgNavIcon({ id }: { id: string }) {
  const cls = "eg-nav-icon";
  const paths: Record<string, ReactNode> = {
    home: (
      <svg className={cls} width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5z" />
      </svg>
    ),
    quick: (
      <svg className={cls} width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <path d="M13 2 3 14h8l-1 8 10-12h-8l1-8z" />
      </svg>
    ),
    default: (
      <svg className={cls} width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <circle cx="12" cy="12" r="8" />
      </svg>
    )
  };
  return <>{paths[id] ?? paths.default}</>;
}

function userInitials(fullName: string | undefined): string {
  const parts = fullName?.trim().split(/\s+/).filter(Boolean) ?? [];
  if (parts.length === 0) return "MK";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

function isNavActive(pathname: string, href: string, fallbackActive?: boolean): boolean {
  if (href === "#" || !href.startsWith("/")) return false;
  if (pathname === href || pathname.startsWith(`${href}/`)) return true;
  return Boolean(fallbackActive);
}

export function ReferenceEmeraldShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const session = {
    user: {
      fullName: "Mevlüt K.",
      title: "Operasyon Yöneticisi"
    }
  };
  const logout = () => {};
  const theme = "dark";
  const toggleTheme = () => {};

  const displayName = session?.user.fullName?.trim() || "MevlÃ¼t K.";
  const displayRole = session?.user.title?.trim() || "Operasyon YÃ¶neticisi";
  const initials = userInitials(session?.user.fullName);

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <div className="eg-shell">
      <aside className="eg-sidebar" aria-label="Ana menÃ¼">
        <div className="eg-sidebar-brand">
          <span className="eg-sidebar-monogram" aria-hidden>
            H
          </span>
          <div className="eg-sidebar-brand-text">
            <p>HALLEDERÄ°Z</p>
            <p>CRM PREMIUM</p>
          </div>
        </div>

        <nav className="eg-sidebar-nav">
          {EG_NAV.map((item) => {
            const active = isNavActive(pathname, item.href, item.active);
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`eg-sidebar-item${active ? " eg-sidebar-item--active" : ""}`}
                aria-current={active ? "page" : undefined}
              >
                <EgNavIcon id={item.id} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="eg-sidebar-footer" aria-hidden>
          <span className="eg-sidebar-footer-line" />
          <span className="eg-sidebar-footer-mark">H</span>
          <span className="eg-sidebar-footer-line" />
        </div>
      </aside>

      <div className="eg-main">
        <header className="eg-header">
          <h1 className="eg-header-title">Ana Sayfa</h1>
          <div className="eg-header-search">
            <IconSearch className="eg-header-search-icon" />
            <input type="search" placeholder="Arama yapÄ±n..." aria-label="Arama" readOnly />
          </div>

          <div className="eg-header-actions">
            <button type="button" className="eg-header-quick">
              <IconZap className="eg-header-quick-icon" />
              HÄ±zlÄ± Ä°ÅŸlem
              <IconChevronDown className="eg-header-chevron" />
            </button>

            <button type="button" className="eg-header-icon-btn" aria-label="Bildirimler">
              <IconBell className="eg-header-icon-svg" />
              <span className="eg-header-badge eg-header-badge--red">3</span>
            </button>

            <button type="button" className="eg-header-icon-btn" aria-label="Mesajlar">
              <IconMessage className="eg-header-icon-svg" />
              <span className="eg-header-badge eg-header-badge--gold">1</span>
            </button>

            <button type="button" className="eg-header-quick" onClick={toggleTheme} aria-label="Tema deÄŸiÅŸtir">
              Tema: {theme === "dark" ? "Koyu" : "AÃ§Ä±k"}
            </button>

            <button type="button" className="eg-header-user" onClick={handleLogout}>
              <span className="eg-header-avatar" aria-hidden>
                {initials}
              </span>
              <span className="eg-header-user-lines">
                <strong>{displayName}</strong>
                <span>{displayRole}</span>
              </span>
              <IconChevronDown className="eg-header-chevron" />
            </button>
          </div>
        </header>

        <main className="eg-page">{children}</main>
      </div>
    </div>
  );
}


