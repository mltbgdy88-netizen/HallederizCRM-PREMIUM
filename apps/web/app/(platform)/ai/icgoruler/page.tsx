import { RouteSkeletonPage } from "../../../../src/components/page-system/route-skeleton-page";

export default function AiInsightsPage() {
  return (
    <RouteSkeletonPage
      title="AI Icgoruler"
      description="Risk, firsat, performans ve ozet kartlarini operasyon baglaminda izleyin."
      actions={["Icgoru Yenile", "Rapor Uret", "Export"]}
      filters={[
        { label: "Modul", type: "select", options: ["Satis", "Stok", "Tahsilat", "Depo"] },
        { label: "Donem", type: "select", options: ["Bugun", "Bu Hafta", "Bu Ay"] },
        { label: "Kritikler", type: "toggle" }
      ]}
      tableColumns={["Baslik", "Kategori", "Etki", "Guven", "Aksiyon"]}
      tableRows={[
        ["Geciken tahsilat riski", "Finans", "Yuksek", "%84", "Onaya Gonder"],
        ["Capraz satis firsati", "Satis", "Orta", "%78", "Teklif Olustur"],
        ["Kritik stok trendi", "Stok", "Yuksek", "%81", "Tedarik Planla"]
      ]}
      metrics={[
        { title: "AI Risk", value: "12", detail: "Mudahale gerekli", tone: "danger" },
        { title: "AI Firsat", value: "19", detail: "Aksiyonlanabilir", tone: "success" },
        { title: "Onay Kuyrugu", value: "5", detail: "Beklemede", tone: "warning" },
        { title: "Guven Skoru", value: "%80", detail: "Ortalama", tone: "info" }
      ]}
    />
  );
}
