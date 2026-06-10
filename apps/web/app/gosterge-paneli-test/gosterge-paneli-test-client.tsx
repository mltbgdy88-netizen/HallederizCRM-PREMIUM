// @ts-nocheck
"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, type MouseEvent, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { NAV_ITEMS } from "@/features/dashboard/data/dashboard-reference-mock";
import {
  GOSTERGE_PANELI_TEST_CONVERSATIONS,
  GOSTERGE_PANELI_TEST_PAGINATION,
  GOSTERGE_PANELI_TEST_SNAPSHOT
} from "@/features/dashboard/data/gosterge-paneli-test-data";
import { GOSTERGE_PANELI_UI } from "@/features/dashboard/data/gosterge-paneli-ui-text";
import { handleReferencePageClick, referenceHref } from "@/lib/reference/reference-page-interaction";
import { useReferenceToast } from "@/lib/reference/use-reference-demo-action";
import { useToast } from "@/providers/toast-provider";
import {
  IconBell,
  IconChevronDown,
  IconMenu,
  IconSearch,
  IconSun,
  NavIcon,
  NAV_ICON_MAP,
  ShieldLogo
} from "@/components/reference/icons";

const ui = GOSTERGE_PANELI_UI;

const DashboardGostergePaneliPage = dynamic(
  () =>
    import("@/features/dashboard/components/DashboardGostergePaneliPage").then((mod) => ({
      default: mod.DashboardGostergePaneliPage
    })),
  {
    ssr: false,
    loading: () => (
      <div className="gosterge-paneli-test-loading" role="status" aria-live="polite">
        {ui.loading}
      </div>
    )
  }
);

function isNavActive(pathname: string, href: string): boolean {
  if (href === "#" || !href.startsWith("/")) return false;
  if (href === "/dashboard" || href === "/gosterge-paneli-test") {
    return pathname === "/dashboard" || pathname.startsWith("/dashboard/") || pathname === "/gosterge-paneli-test";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function GostergePaneliTestShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const pushReferenceToast = useReferenceToast();
  const { pushToast } = useToast();

  const handlePageInteraction = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      handleReferencePageClick(event, router, pushToast, pathname);
    },
    [pathname, pushToast, router]
  );

  return (
    <div className="ref-shell gosterge-paneli-test-shell">
      <aside className="ref-sidebar" aria-label={ui.sidebarAria}>
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
            const href =
              item.id === "dashboard" ? "/gosterge-paneli-test" : referenceHref(item.href);
            const active = isNavActive(pathname, href);
            const label =
              item.id === "dashboard"
                ? "G\u00f6sterge Paneli"
                : item.id === "quick"
                  ? "H\u0131zl\u0131 \u0130\u015flem"
                  : item.id === "archive"
                    ? "Ar\u015fiv"
                    : item.id === "customers"
                      ? "Cariler"
                      : item.id === "stock"
                        ? "\u00dcr\u00fcn / Stok"
                        : item.id === "settings"
                          ? "Ayarlar"
                          : item.label;
            return (
              <Link
                key={item.id}
                href={href}
                className={`ref-sidebar-item${active ? " ref-sidebar-item--active" : ""}`}
                aria-current={active ? "page" : undefined}
              >
                <NavIcon id={item.id as keyof typeof NAV_ICON_MAP} className="ref-sidebar-item-icon" />
                <span className="ref-sidebar-item-label">{label}</span>
                {item.badge ? <span className="ref-sidebar-badge">{item.badge}</span> : null}
              </Link>
            );
          })}
        </nav>

        <footer className="ref-sidebar-footer">
          <p>Premium CRM v2.6.1</p>
          <p>{ui.copyright}</p>
        </footer>
      </aside>

      <div className="ref-main gosterge-paneli-test-main">
        <header className="ref-header">
          <button
            type="button"
            className="ref-header-menu"
            aria-label={ui.menu}
            data-ref-skip-fallback
            onClick={() => pushReferenceToast("Kenar menu daraltma demo modunda.")}
          >
            <IconMenu className="ref-header-menu-icon" />
          </button>

          <div className="ref-header-search">
            <IconSearch className="ref-header-search-icon" />
            <input type="search" placeholder={ui.searchPlaceholder} aria-label="Arama" readOnly />
          </div>

          <div className="ref-header-actions">
            <button
              type="button"
              className="ref-theme-toggle"
              data-ref-skip-fallback
              onClick={() => pushReferenceToast("Tema degistirme bu test ekraninda devre disi.")}
            >
              <IconSun className="ref-theme-toggle-icon" />
              <span>{ui.themeLight}</span>
              <IconChevronDown className="ref-theme-toggle-chevron" />
            </button>

            <button
              type="button"
              className="ref-header-bell-btn"
              aria-label={ui.notifications}
              data-ref-skip-fallback
              onClick={() => pushReferenceToast("3 okunmamis bildirim (demo).")}
            >
              <IconBell className="ref-header-bell-icon" />
              <span className="ref-header-bell-badge">3</span>
            </button>

            <div className="ref-header-user" aria-label="Demo kullanici">
              <span className="ref-header-avatar">YK</span>
              <div className="ref-header-user-text">
                <strong>Yusuf K.</strong>
                <span>{ui.demoUserRole}</span>
              </div>
            </div>
          </div>
        </header>

        <main className="ref-page gosterge-paneli-test-page" onClick={handlePageInteraction}>
          {children}
        </main>
      </div>
    </div>
  );
}

export function GostergePaneliTestClient() {
  return (
    <GostergePaneliTestShell>
      <div className="gosterge-paneli-test-root">
        <p className="gosterge-paneli-test-banner" role="status">
          {ui.demoBanner}
        </p>
        <DashboardGostergePaneliPage
          demoOnly
          compact
          staticSnapshot={GOSTERGE_PANELI_TEST_SNAPSHOT}
          staticWhatsapp={{
            conversations: GOSTERGE_PANELI_TEST_CONVERSATIONS,
            pagination: GOSTERGE_PANELI_TEST_PAGINATION
          }}
        />
      </div>
    </GostergePaneliTestShell>
  );
}

