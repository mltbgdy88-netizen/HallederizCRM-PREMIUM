import type { ReactNode } from "react";

export interface AppShellProps {
  sidebar: ReactNode;
  header: ReactNode;
  children: ReactNode;
  mobileSidebarOpen: boolean;
  onMobileSidebarOpenChange: (open: boolean) => void;
}

export function AppShell({
  sidebar,
  header,
  children,
  mobileSidebarOpen,
  onMobileSidebarOpenChange
}: AppShellProps) {
  return (
    <div className="hz-shell">
      <div className="hz-shell-frame">
        <aside className="hz-shell-sidebar hz-shell-sidebar-desktop">{sidebar}</aside>

        <div className="hz-shell-main">
          <div className="hz-shell-workspace">
            <header className="hz-shell-header">
              <button
                type="button"
                className="hz-shell-hamburger"
                onClick={() => onMobileSidebarOpenChange(!mobileSidebarOpen)}
                aria-label="Menuyu ac/kapat"
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
        role="button"
        aria-label="Kenar menuyu kapat"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            onMobileSidebarOpenChange(false);
          }
        }}
      />

      <aside className={`hz-shell-sidebar hz-shell-sidebar-mobile ${mobileSidebarOpen ? "is-open" : ""}`}>
        {sidebar}
      </aside>
    </div>
  );
}
