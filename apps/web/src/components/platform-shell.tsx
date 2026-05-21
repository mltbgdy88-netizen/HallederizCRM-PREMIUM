"use client";

import {
  AppShell,
  Header,
  PageContent,
  Sidebar,
  ThemeToggle,
  UserMenu,
  type AppShellNavItem
} from "@hallederiz/ui";
import type { SidebarNavSection } from "@hallederiz/ui";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { buildProductSidebarNavSections } from "./product-sidebar-nav";
import { normalizeShellPathname, resolveShellHeaderOptions } from "./platform-route-meta";
import { useAuth } from "../providers/auth-provider";
import { useTheme } from "../providers/theme-provider";

/** Sidebar’da sayı badge’i gösterilmez (PR #31); kaynak veride olsa bile kaldırılır. */
function stripNavBadges(sections: SidebarNavSection[]): SidebarNavSection[] {
  return sections.map((section) => ({
    ...section,
    items: section.items.map(({ badge: _removed, ...rest }) => rest)
  }));
}

const NAV_SECTIONS_FOR_SHELL = stripNavBadges(buildProductSidebarNavSections());

const ALL_SHELL_NAV_ITEMS: AppShellNavItem[] = NAV_SECTIONS_FOR_SHELL.flatMap((s) => s.items);

function resolveActiveHref(pathname: string): string {
  const p = normalizeShellPathname(pathname);
  const items = [...ALL_SHELL_NAV_ITEMS].sort((a, b) => b.href.length - a.href.length);
  for (const item of items) {
    if (p === item.href || p.startsWith(`${item.href}/`)) {
      return item.href;
    }
  }
  return "";
}

function formatDashboardDateLine(): string {
  return new Intl.DateTimeFormat("tr-TR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(new Date());
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

  const normalizedPath = useMemo(() => normalizeShellPathname(pathname), [pathname]);
  const headerOptions = useMemo(() => resolveShellHeaderOptions(pathname), [pathname]);
  const activeHref = resolveActiveHref(pathname);
  const isDashboard = normalizedPath === "/dashboard";

  const dashboardGreeting = useMemo(() => {
    const display = session?.user.fullName?.trim() || "Ahmet Yılmaz";
    return (
      <div className="hz-header-greeting">
        <p className="hz-header-greeting-line">Günaydın, {display}</p>
        <p className="hz-header-greeting-date">{formatDashboardDateLine()}</p>
      </div>
    );
  }, [session?.user.fullName]);

  return (
    <AppShell
      mobileSidebarOpen={mobileSidebarOpen}
      onMobileSidebarOpenChange={setMobileSidebarOpen}
      sidebar={
        <Sidebar
          logoMarkLabel="LOGO ALANI"
          appTitle="HallederizCRM Premium"
          navSections={NAV_SECTIONS_FOR_SHELL}
          activeHref={activeHref}
          companyCard={{ name: "Hallederiz A.Ş.", branch: "Merkez", status: "Çevrimiçi" }}
          onNavigate={(href) => router.push(href)}
        />
      }
      header={
        <Header
          layout={headerOptions.layout}
          suppressPageMeta={headerOptions.suppressPageMeta}
          title={headerOptions.pageMeta.title}
          subtitle={headerOptions.pageMeta.subtitle}
          breadcrumb={headerOptions.pageMeta.breadcrumb}
          leadingSlot={isDashboard ? dashboardGreeting : undefined}
          searchPlaceholder={headerOptions.searchPlaceholder}
          toolbarSlot={
            isDashboard ? (
              <button
                type="button"
                className="hz-header-quick-primary"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent("dashboard:open-card-editor"));
                }}
              >
                Kartları Düzenle
              </button>
            ) : null
          }
          notificationSlot={
            <>
              <button type="button" className="hz-header-icon-button hz-header-icon-button--ghost" aria-label="Bildirimler">
                <span className="hz-header-bell" aria-hidden />
                <span className="hz-sr-only">Bildirimler</span>
              </button>
              <button
                type="button"
                className="hz-header-icon-button hz-header-icon-button--ghost"
                aria-label="WhatsApp"
                onClick={() => router.push("/whatsapp")}
              >
                <span className="hz-header-wa" aria-hidden />
                <span className="hz-sr-only">WhatsApp</span>
              </button>
            </>
          }
          themeSlot={<ThemeToggle mode={theme} onToggle={toggleTheme} compact={isDashboard} />}
          userSlot={
            <UserMenu
              fullName={session?.user.fullName ?? "Bilinmeyen Kullanıcı"}
              roleLabel={session?.roles[0]?.name ?? "Rol tanımsız"}
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
