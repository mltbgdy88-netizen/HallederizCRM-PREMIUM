import { RouteSkeletonPage } from "../../../../../src/components/page-system/route-skeleton-page";

export default function FactoryOrderDetailPage() {
  return (
    <RouteSkeletonPage
      title="Fabrika Siparis Detayi"
      description="Fabrika satirlari, bagli satis baglami ve durum degisimlerini izleyin."
      actions={["Durum Guncelle", "Satir Senkron", "Iptal"]}
      tabs={["Genel", "Satirlar", "Senkron", "Timeline"]}
      filters={[{ label: "Satir Arama", type: "text", placeholder: "Urun ara" }]}
      tableColumns={["Urun", "Miktar", "Durum", "Termin", "Not"]}
      tableRows={[
        ["DK-1001", "20", "Hazirlaniyor", "30.04.2026", "Uretimde"],
        ["DK-2022", "12", "Planlandi", "01.05.2026", "Hammadde bekliyor"],
        ["DK-3308", "15", "Yeni", "02.05.2026", "Onay bekliyor"]
      ]}
      sideTitle="Senkron ve Operasyon"
      sideItems={[
        "Bagli Satis: SO-2481",
        "Son Senkron: 28.04.2026 10:40",
        "Hata Kaydi: Yok",
        "Aksiyon: Durum guncellemesi onay gerektirir"
      ]}
    />
  );
}
