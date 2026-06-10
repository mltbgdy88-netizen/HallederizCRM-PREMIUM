"use client";

import { useEffect, type ReactNode } from "react";

export interface AppShellProps {
  sidebar: ReactNode;
  header: ReactNode;
  children: ReactNode;
  mobileSidebarOpen: boolean;
  onMobileSidebarOpenChange: (open: boolean) => void;
}

const MOBILE_NAV_ID = "hz-shell-mobile-nav";

export function AppShell({
  sidebar,
  header,
  children,
  mobileSidebarOpen,
  onMobileSidebarOpenChange
}: AppShellProps) {
  useEffect(() => {
    if (!mobileSidebarOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onMobileSidebarOpenChange(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileSidebarOpen, onMobileSidebarOpenChange]);

  return (
    <div className="hz-shell">
      <div className="hz-shell-frame">
        <aside className="hz-shell-sidebar hz-shell-sidebar-desktop" aria-label="Ana menü">
          {sidebar}
        </aside>

        <div className="hz-shell-main">
          <div className="hz-shell-workspace">
            <header className="hz-shell-header">
              <button
                type="button"
                className="hz-shell-hamburger"
                onClick={() => onMobileSidebarOpenChange(!mobileSidebarOpen)}
                aria-label={mobileSidebarOpen ? "Menüyü kapat" : "Menüyü aç"}
                aria-expanded={mobileSidebarOpen}
                aria-controls={MOBILE_NAV_ID}
              >
                <span />
                <span />
                <span />
              </button>

              <div className="hz-shell-header-content">{header}</div>
            </header>

            <main className="hz-shell-content">
              <div className="hz-shell-content-frame">{children}</div>
            </main>
          </div>
        </div>
      </div>

      <div
        className={`hz-shell-mobile-backdrop ${mobileSidebarOpen ? "is-open" : ""}`}
        onClick={() => onMobileSidebarOpenChange(false)}
        role="presentation"
        aria-hidden={!mobileSidebarOpen}
      />

      <aside
        id={MOBILE_NAV_ID}
        className={`hz-shell-sidebar hz-shell-sidebar-mobile ${mobileSidebarOpen ? "is-open" : ""}`}
        role="navigation"
        aria-label="Ana menü"
        aria-hidden={!mobileSidebarOpen}
      >
        {sidebar}
      </aside>
    </div>
  );
}

