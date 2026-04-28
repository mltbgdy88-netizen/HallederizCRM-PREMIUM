import { RouteSkeletonPage } from "../../../src/components/page-system/route-skeleton-page";

export default function SettingsPage() {
  return (
    <RouteSkeletonPage
      title="Ayarlar"
      description="Tenant bazli platform konfigurasyonlari, kur/fiyat alanlari ve entegrasyon parametreleri."
      tabs={[
        "Sirket",
        "Tema",
        "Doviz",
        "Fiyat Alanlari",
        "Kategori Alanlari",
        "ERP",
        "WhatsApp",
        "AI",
        "Yazdirma/Kayit",
        "Belge Sablonlari"
      ]}
      actions={["Kaydet", "Varsayilana Don", "Konfigurasyon Export"]}
      filters={[
        { label: "MB USD/EUR Satis", type: "toggle" },
        { label: "Ek Kur Farki", type: "text", placeholder: "% fark" },
        { label: "Fiyat Slot Adlari", type: "text", placeholder: "6 slot" },
        { label: "Kategori Alan Adlari", type: "text", placeholder: "4 slot" },
        { label: "Yerel Klasor Kaydet", type: "toggle" },
        { label: "Otomatik Yazdirma", type: "toggle" }
      ]}
      tableTitle="Ayar Parametre Ozetleri"
      tableColumns={["Alan", "Deger", "Durum", "Son Guncelleme"]}
      tableRows={[
        ["Kur Politikasi", "MB satis + %0.5", "Aktif", "28.04.2026"],
        ["Fiyat Slotlari", "6 slot tanimli", "Aktif", "27.04.2026"],
        ["Kategori Alanlari", "4 slot tanimli", "Aktif", "27.04.2026"],
        ["Yazici Profili", "Ofis-Laser-01", "Pasif", "20.04.2026"]
      ]}
    />
  );
}
