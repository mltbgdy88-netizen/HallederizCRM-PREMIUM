// @ts-nocheck
export const WFT_PAGE = {
  breadcrumb: "Ürün Stok > UR-10001 - Rulman 6205 2RS",
  productCode: "UR-10001",
  productName: "Rulman 6205 2RS",
  status: "Stokta",
  barcode: "8690000001234",
  brand: "SKF",
  category: "Rulmanlar",
  price: "₺85,00",
  unit: "Adet",
  timelineTitle: "Evrensel Zaman Çizelgesi",
  timelineSubtitle: "Kayıt üzerindeki tüm onay, stok ve fiyat olayları."
};

export const WFT_EVENTS = [
  {
    id: "1",
    time: "24.05.2025 14:32:18",
    title: "Onay Oluşturuldu",
    status: "Onay",
    desc: "UR-10001 kodlu ürün için stok güncelleme onay süreci oluşturuldu. Onay No: ONY-2025-000124",
    user: "Yusuf Kaya"
  },
  {
    id: "2",
    time: "24.05.2025 14:35:02",
    title: "Onay Gönderildi",
    status: "Beklemede",
    desc: "Onay süreci ilgili onaylayıcılara gönderildi. Onaylayıcılar: Ahmet Yılmaz, Zeynep Demir",
    user: "Yusuf Kaya"
  },
  {
    id: "3",
    time: "24.05.2025 14:41:44",
    title: "Onaylandı",
    status: "Onaylandı",
    desc: "İlgili onaylayıcı tarafından onaylandı. Onaylayan: Ahmet Yılmaz",
    user: "Ahmet Yılmaz (Satınalma Müdürü)"
  },
  {
    id: "4",
    time: "24.05.2025 14:45:05",
    title: "Stok Güncellendi",
    status: "Sistem",
    desc: "Ürün stok bilgileri güncellendi. İşlem: Stok Miktarı 2.400 → 2.450",
    user: "Sistem (Otomatik İşlem)"
  },
  {
    id: "5",
    time: "24.05.2025 15:02:33",
    title: "Değişiklik Yapıldı",
    status: "Güncelleme",
    desc: "Ürün fiyat bilgisi güncellendi. Fiyat: ₺82,00 → ₺85,00",
    user: "Yusuf Kaya"
  }
];

export const WFT_CONTEXT = {
  recordType: "Ürün Stok",
  recordId: "UR-10001",
  created: "10.05.2025 · Yusuf Kaya",
  updated: "24.05.2025 15:02 · Yusuf Kaya",
  status: "Aktif",
  centerStock: "2.450 adet",
  factoryStock: "1.120 adet",
  shelf: "A-01-01",
  capacity: "Kapasite: 1.250 / 1.860 adet (%68)",
  lastActivity: "24.05.2025 14:45 — Stok Güncellendi"
};
