"use client";

import type { ReactNode } from "react";
import { SettingsLayout } from "@hallederiz/ui";
import { SettingsSubNav } from "./SettingsSubNav";

/** Task 20 — `/ayarlar/*` alt sayfaları: sol iç nav + içerik. */
export function SettingsAreaShell({ children }: { children: ReactNode }) {
  return (
    <div className="hz-settings-page">
      <SettingsLayout
        nav={<SettingsSubNav />}
        children={<div className="hz-settings-aux-body hz-page-stack">{children}</div>}
      />
    </div>
  );
}
