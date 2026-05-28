"use client";

import type { ReactNode } from "react";
import { EG_NAV, EG_USER } from "@/features/dashboard/data/ana-sayfa-emerald-gold-mock";
import {
  IconBell,
  IconChevronDown,
  IconMessage,
  IconSearch,
  IconZap
} from "./icons";

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

export function AppShellEmeraldGold({ children }: { children: ReactNode }) {
  return (
    <div className="eg-shell">
      <aside className="eg-sidebar" aria-label="Ana menü">
        <div className="eg-sidebar-brand">
          <span className="eg-sidebar-monogram" aria-hidden>
            H
          </span>
          <div className="eg-sidebar-brand-text">
            <p>HALLEDERİZ</p>
            <p>CRM PREMIUM</p>
          </div>
        </div>

        <nav className="eg-sidebar-nav">
          {EG_NAV.map((item) => (
            <a
              key={item.id}
              href={item.href}
              className={`eg-sidebar-item${item.active ? " eg-sidebar-item--active" : ""}`}
              aria-current={item.active ? "page" : undefined}
            >
              <EgNavIcon id={item.id} />
              <span>{item.label}</span>
            </a>
          ))}
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
            <input type="search" placeholder="Arama yapın..." aria-label="Arama" readOnly />
          </div>

          <div className="eg-header-actions">
            <button type="button" className="eg-header-quick">
              <IconZap className="eg-header-quick-icon" />
              Hızlı İşlem
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

            <button type="button" className="eg-header-icon-btn" aria-label="Saat">
              <svg className="eg-header-icon-svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
                <circle cx="12" cy="12" r="8" />
                <path d="M12 8v4l3 2" />
              </svg>
            </button>

            <button type="button" className="eg-header-user">
              <span className="eg-header-avatar" aria-hidden />
              <span className="eg-header-user-lines">
                <strong>{EG_USER.name}</strong>
                <span>{EG_USER.role}</span>
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
