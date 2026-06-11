"use client";

import Link from "next/link";
import type { ReactNode } from "react";

/** B2 — `/ayarlar/genel` için hub uyumlu dış çerçeve; SettingsPage iç mantığına dokunmaz. */
export function SettingsGeneralAreaFrame({ children }: { children: ReactNode }) {
  return (
    <div className="asa-home asa-home--embedded" data-page="settings-general-area">
      <header className="asa-head">
        <p className="asa-crumb">
          <Link href="/ayarlar" className="asa-crumb-link">
            Ayarlar
          </Link>
          <span className="asa-crumb-sep" aria-hidden>
            /
          </span>
          <span>Genel</span>
        </p>
      </header>
      <div className="asa-body">{children}</div>
    </div>
  );
}
