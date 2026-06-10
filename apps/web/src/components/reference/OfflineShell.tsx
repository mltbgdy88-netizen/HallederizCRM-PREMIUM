// @ts-nocheck
"use client";

import type { ReactNode } from "react";
import {
  OFFLINE_SHELL_FOOTER,
  OFFLINE_SHELL_HEADER,
  OFFLINE_SHELL_NAV
} from "@/features/sistem/data/sistem-state-mock";
import { IconBell, IconChevronDown, IconMenu, IconSearch, ShieldLogo } from "./icons";

export function OfflineShell({ children }: { children: ReactNode }) {
  return (
    <div className="ref-shell offline-shell">
      <aside className="ref-sidebar offline-shell-sidebar" aria-label="Çevrimdışı menü">
        <div className="ref-sidebar-brand">
          <div className="ref-sidebar-logo-row">
            <ShieldLogo>P</ShieldLogo>
            <div>
              <p className="ref-sidebar-logo-title">PREMIUM</p>
              <p className="ref-sidebar-logo-sub">CRM</p>
              <p className="offline-shell-sys">YÖNETİM SİSTEMİ</p>
            </div>
          </div>
        </div>

        <nav className="ref-sidebar-nav">
          {OFFLINE_SHELL_NAV.map((item) => (
            <a
              key={item.id}
              href={item.href}
              className={`ref-sidebar-item${item.id === "dashboard" ? " ref-sidebar-item--active" : ""}`}
              aria-current={item.id === "dashboard" ? "page" : undefined}
            >
              <span className="ref-sidebar-item-label">{item.label}</span>
            </a>
          ))}
        </nav>

        <footer className="offline-shell-offline-foot">
          <span className="offline-shell-offline-icon" aria-hidden>
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
              <path d="m16 16 4 4M18 18l4 4" />
            </svg>
          </span>
          <div>
            <strong>{OFFLINE_SHELL_FOOTER.title}</strong>
            <p>
              {OFFLINE_SHELL_FOOTER.hint} {OFFLINE_SHELL_FOOTER.link}
            </p>
          </div>
        </footer>
      </aside>

      <div className="ref-main">
        <header className="ref-header offline-shell-header">
          <button type="button" className="ref-header-menu" aria-label="Menü">
            <IconMenu className="ref-header-menu-icon" />
          </button>
          <h1 className="offline-shell-page-title">{OFFLINE_SHELL_HEADER.title}</h1>

          <div className="ref-header-search offline-shell-search-wrap">
            <IconSearch className="ref-header-search-icon" />
            <input
              type="search"
              placeholder={OFFLINE_SHELL_HEADER.searchPlaceholder}
              aria-label="Arama"
              readOnly
            />
          </div>

          <div className="ref-header-actions">
            <button type="button" className="offline-shell-add" aria-label="Yeni">
              +
            </button>
            <button type="button" className="ref-header-bell-btn" aria-label="Bildirimler">
              <IconBell className="ref-header-bell-icon" />
              <span className="ref-header-bell-badge">{OFFLINE_SHELL_HEADER.notifications}</span>
            </button>
            <div className="ref-header-user">
              <span className="ref-header-avatar">P</span>
              <div className="ref-header-user-text">
                <strong>{OFFLINE_SHELL_HEADER.userName}</strong>
                <span>{OFFLINE_SHELL_HEADER.userRole}</span>
              </div>
              <IconChevronDown className="offline-shell-user-chevron" />
            </div>
          </div>
        </header>

        <main className="ref-page offline-shell-page">{children}</main>
      </div>
    </div>
  );
}


