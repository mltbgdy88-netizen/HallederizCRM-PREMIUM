import { RouteSkeletonPage } from "../../../../src/components/page-system/route-skeleton-page";

export default function FactoryStocksPage() {
  return (
    <RouteSkeletonPage
      title="Fabrika Stoklari"
      description="Fabrika bazli urun stok gorunurlugu ve son senkron durumunu izleyin."
      actions={["Senkron Baslat", "Snapshot Indir", "Hata Kayitlari"]}
      filters={[
        { label: "Urun Kodu / Ad", type: "text", placeholder: "Urun ara" },
        { label: "Fabrika", type: "select", options: ["Ankara", "Izmir"] },
        { label: "Senkron Durumu", type: "select", options: ["Synced", "Stale", "Not Connected"] }
      ]}
      tableColumns={["Urun Kodu", "Urun Adi", "Fabrika", "Mevcut Stok", "Son Senkron"]}
      tableRows={[
        ["DK-1001", "Linen Soft Ivory", "Ankara", "420", "28.04.2026 08:00"],
        ["DK-2022", "Geo Line Ash", "Izmir", "168", "28.04.2026 05:30"],
        ["DK-3308", "Concrete Mist", "Ankara", "310", "- / bagli degil"]
      ]}
      metrics={[
        { title: "Synced Kayit", value: "312", detail: "Fabrika stok satiri", tone: "success" },
        { title: "Stale Kayit", value: "24", detail: "Yeniden cekim gerekli", tone: "warning" },
        { title: "Bagli Degil", value: "6", detail: "Entegrasyon eksigi", tone: "danger" },
        { title: "Senkron Suresi", value: "7dk", detail: "Ortalama", tone: "info" }
      ]}
    />
  );
}
