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
        ["Tahsilat Gecikme", "Gunluk", "4 cari", "Hazirlaniyor", "28.04.2026"],
        ["Fabrika Teslim Gecikmesi", "Haftalik", "3 siparis", "Hazir", "27.04.2026"],
        ["Belge Gonderim Basarisi", "Aylik", "%96", "Hazir", "27.04.2026"],
        ["Iade Etki Ozeti", "Aylik", "12 kayit", "Hazir", "27.04.2026"],
        ["Cari Risk Dagilimi", "Aylik", "9 kritik", "Hazir", "26.04.2026"],
        ["Depo Hazirlama Verimi", "Haftalik", "%91", "Hazir", "26.04.2026"],
        ["Operasyon SLA", "Gunluk", "%93", "Hazir", "26.04.2026"],
        ["ERP Senkron Kalitesi", "Gunluk", "%98", "Hazir", "26.04.2026"],
        ["AI Tahsilat Onerileri", "Haftalik", "18 oner", "Hazir", "25.04.2026"],
        ["WhatsApp Action Sonuclari", "Haftalik", "27 aksiyon", "Hazir", "25.04.2026"]
      ]}
      sideTitle="Rapor Ozeti"
      sideItems={[
        "Secili rapor: Satis Performans",
        "Son calistirma: 28.04.2026 10:15",
        "Kapsam: Tum depolar",
        "Durum: Hazir",
        "Hizli aksiyon: Raporu olustur"
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
