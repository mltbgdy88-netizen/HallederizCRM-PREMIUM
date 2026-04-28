import { RouteSkeletonPage } from "../../../src/components/page-system/route-skeleton-page";

export default function ErpPage() {
  return (
    <RouteSkeletonPage
      title="ERP"
      description="API baglantilari, eslemeler, senkron gecmisi ve hata yonetimi tek panelde."
      tabs={["API Baglantilari", "Excel Sablonlari", "Eslemeler", "Senkron Gecmisi", "Hatalar"]}
      actions={["Yeni Baglanti", "Senkron Baslat", "Hata Raporu"]}
      filters={[
        { label: "Baglanti Adi", type: "text", placeholder: "ERP baglantisi ara" },
        { label: "Tur", type: "select", options: ["REST", "SOAP", "Dosya"] },
        { label: "Mod", type: "select", options: ["Canli", "Test"] },
        { label: "Durum", type: "select", options: ["Aktif", "Pasif", "Hata"] }
      ]}
      tableColumns={["Baglanti Adi", "Tur", "Mod", "Durum", "Son Senkron"]}
      tableRows={[
        ["ERP Merkez", "REST", "Canli", "Aktif", "28.04.2026 09:40"],
        ["ERP Test", "REST", "Test", "Pasif", "27.04.2026 11:20"],
        ["Muhasebe Aktarim", "Dosya", "Canli", "Hata", "28.04.2026 08:30"]
      ]}
    />
  );
}
