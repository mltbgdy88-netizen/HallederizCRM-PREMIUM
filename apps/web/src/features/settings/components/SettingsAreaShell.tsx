"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { SettingsLayout } from "@hallederiz/ui";
import { resolveSettingsAreaSection } from "../utils/settings-area-route-meta";
import { SettingsSubNav } from "./SettingsSubNav";

/** Task 20 — `/ayarlar/*` alt sayfaları: hub uyumlu shell + sol iç nav + içerik. */
export function SettingsAreaShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";
  const section = resolveSettingsAreaSection(pathname);

  return (
    <div className="asa-home asa-home--embedded hz-settings-page" data-page="settings-area-reference">
      <header className="asa-head">
        <p className="asa-crumb">
          <Link href="/ayarlar" className="asa-crumb-link">
            Ayarlar
          </Link>
          {section ? (
            <>
              <span className="asa-crumb-sep" aria-hidden>
                /
              </span>
              <span>{section}</span>
            </>
          ) : null}
        </p>
      </header>
      <div className="asa-body">
        <SettingsLayout
          nav={<SettingsSubNav />}
          children={
            <div className="hz-settings-aux-body hz-page-stack">
              <p className="hz-settings-context-band asa-context-band" role="status">
                Ayarlar kiracı yapılandırmasını gösterir; sahte kayıt veya otomatik başarı mesajı üretilmez.
              </p>
              {children}
            </div>
          }
        />
      </div>
    </div>
  );
}
