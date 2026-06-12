"use client";

import { AppShell, Header, PageContent, Sidebar, ThemeToggle } from "@hallederiz/ui";
import type { AppShellNavItem } from "@hallederiz/ui";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ApprovalsShellLeading } from "../features/approvals/components/ApprovalsShellLeading";
import { ShellUserMenu } from "./shell-user-menu";
import { DashboardHeaderCardsButton } from "./dashboard-header-cards-button";
import { buildCommandCenterSidebarNavSections } from "./command-center-sidebar-nav";
import { normalizeShellPathname, resolveShellHeaderOptions } from "./platform-route-meta";
import { useAuth } from "../providers/auth-provider";
import { useTheme } from "../providers/theme-provider";

function resolveActiveHref(pathname: string, items: AppShellNavItem[]): string {
  const p = normalizeShellPathname(pathname);
  const sorted = [...items].sort((a, b) => b.href.length - a.href.length);
  for (const item of sorted) {
    if (p === item.href || p.startsWith(`${item.href}/`)) {
      return item.href;
    }
  }
  return "";
}

export function PlatformShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { session, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname]);

  const navSections = useMemo(() => buildCommandCenterSidebarNavSections(), []);

  const allNavItems = useMemo(() => navSections.flatMap((s) => s.items), [navSections]);

  const normalizedPath = useMemo(() => normalizeShellPathname(pathname), [pathname]);
  const headerOptions = useMemo(() => resolveShellHeaderOptions(pathname), [pathname]);
  const activeHref = resolveActiveHref(pathname, allNavItems);
  const isDashboard = normalizedPath === "/dashboard";
  const isApprovalsDesk = normalizedPath === "/onaylar";

  const displayFirstName = session?.user.fullName?.trim().split(" ")[0] ?? "Mevlüt";
  const displayShortName = session?.user.fullName?.trim() || "Mevlüt K.";

  const dashboardLeading = (
    <div className="hz-header-cc-leading">
      <h2 className="hz-header-cc-title">Ana Sayfa</h2>
      <p className="hz-header-cc-sub">Hoş geldiniz, {displayFirstName}</p>
    </div>
  );

  return (
    <AppShell
      mobileSidebarOpen={mobileSidebarOpen}
      onMobileSidebarOpenChange={setMobileSidebarOpen}
      sidebar={
        <Sidebar
          appTitle="HallederizCRM"
          navSections={navSections}
          activeHref={activeHref}
          variant="command-center"
          onNavigate={(href) => router.push(href)}
        />
      }
      header={
        <Header
          layout={headerOptions.layout}
          variant={isDashboard ? "command" : "default"}
          suppressPageMeta={headerOptions.suppressPageMeta}
          title={headerOptions.pageMeta.title}
          subtitle={headerOptions.pageMeta.subtitle}
          breadcrumb={headerOptions.pageMeta.breadcrumb}
          leadingSlot={
            isDashboard ? dashboardLeading : isApprovalsDesk ? <ApprovalsShellLeading /> : undefined
          }
          searchPlaceholder={headerOptions.searchPlaceholder}
          searchMode="passive"
          toolbarSlot={isDashboard ? <DashboardHeaderCardsButton /> : null}
          notificationSlot={
            <>
              <button
                type="button"
                className="hz-header-icon-button hz-header-icon-button--ghost hz-header-icon-button--bell"
                aria-label="Bildirimler"
              >
                <span className="hz-header-bell" aria-hidden />
                <span className="hz-sr-only">Bildirimler</span>
              </button>
              <button
                type="button"
                className="hz-header-icon-button hz-header-icon-button--ghost"
                aria-label="Yardım"
              >
                <span aria-hidden>?</span>
                <span className="hz-sr-only">Yardım</span>
              </button>
            </>
          }
          themeSlot={<ThemeToggle mode={theme} onToggle={toggleTheme} compact={isDashboard} />}
          userSlot={
            <ShellUserMenu
              fullName={displayShortName}
              roleLabel={session?.roles[0]?.name ?? "Yönetici"}
              onLogout={logout}
            />
          }
        />
      }
    >
      <PageContent>{children}</PageContent>
    </AppShell>
  );
}
