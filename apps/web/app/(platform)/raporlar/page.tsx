import { RouteSkeletonPage } from "../../../src/components/page-system/route-skeleton-page";

export default function ReportsPage() {
  return (
    <RouteSkeletonPage
      title="Raporlar"
      description="Operasyon, satis, tahsilat ve stok metriklerini karar destek formatinda inceleyin."
      actions={["Rapor Uret", "Zamanlanmis Rapor", "Export"]}
      filters={[
        { label: "Rapor Tipi", type: "select", options: ["Satis", "Stok", "Tahsilat", "Operasyon"] },
        { label: "Donem", type: "select", options: ["Gunluk", "Haftalik", "Aylik"] },
        { label: "Depo", type: "select", options: ["Tum depolar", "Merkez", "Avrupa", "Anadolu"] }
      ]}
      tableColumns={["Rapor", "Donem", "Olcum", "Durum", "Son Guncelleme"]}
      tableRows={[
        ["Satis Performans", "Aylik", "12.4M TRY", "Hazir", "28.04.2026"],
        ["Stok Kritik Trend", "Haftalik", "7 urun", "Hazir", "28.04.2026"],
        ["Tahsilat Gecikme", "Gunluk", "4 cari", "Hazirlaniyor", "28.04.2026"]
      ]}
      metrics={[
        { title: "Net Satis", value: "12.4M", detail: "Aylik", tone: "success" },
        { title: "Tahsilat Orani", value: "%87", detail: "Aylik", tone: "info" },
        { title: "Kritik Stok", value: "7", detail: "Anlik", tone: "danger" },
        { title: "Operasyon SLA", value: "%93", detail: "Hedef uyumu", tone: "warning" }
      ]}
    />
  );
}
