"use client";

import dynamic from "next/dynamic";

const DashboardGostergePaneliPage = dynamic(
  () =>
    import("../../src/features/dashboard/components/DashboardGostergePaneliPage").then(
      (mod) => mod.DashboardGostergePaneliPage
    ),
  {
    ssr: false,
    loading: () => (
      <div style={{ padding: 24, fontFamily: "Inter, system-ui, sans-serif" }}>
        Gösterge paneli yükleniyor...
      </div>
    )
  }
);

export default function GostergePaneliTestClient() {
  return <DashboardGostergePaneliPage />;
}
