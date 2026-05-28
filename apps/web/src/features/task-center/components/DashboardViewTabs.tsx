"use client";

import { TabSwitcher } from "@hallederiz/ui";

export type DashboardView = "system" | "ai" | "all";

export function DashboardViewTabs({ view, onChange }: { view: DashboardView; onChange: (view: DashboardView) => void }) {
  return (
    <TabSwitcher
      items={[
        { key: "system", label: "Sistem" },
        { key: "ai", label: "Yapay Zeka" },
        { key: "all", label: "Tumu" }
      ]}
      activeKey={view}
      onChange={(nextView) => onChange(nextView as DashboardView)}
    />
  );
}
