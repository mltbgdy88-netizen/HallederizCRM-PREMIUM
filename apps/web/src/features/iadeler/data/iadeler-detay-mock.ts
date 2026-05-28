// @ts-nocheck
export const IDM_PAGE = {
  title: "İadeler Detay Masası",
  subtitle: "İade talebinin detaylarını görüntüleyin, onay sürecini yönetin ve stok etkisini takip edin.",
  listBtn: "İadeler Listesi"
} as const;

export const IDM_HERO = {
  returnId: "İade ID-221",
  status: "Onay Bekliyor",
  created: "15.05.2025 14:32",
  creator: "Yusuf Kaya",
  orderNo: "SIP-2025-1587",
  orderDate: "10.05.2025",
  customer: "ABC Otomasyon San. ve Tic. Ltd. �?ti.",
  reason: "Arızalı / Çalışmıyor",
  note: "Cihaz çalışmıyor, ekran hiç açılmıyor."
} as const;

export const IDM_STOCK_KPIS = [
  { label: "Toplam Kalem", value: "3 adet" },
  { label: "Toplam Miktar", value: "4 adet" },
  { label: "Stok Artışı", value: "4 adet" },
  { label: "Toplam Tutar", value: "₺10.425,00" },
  { label: "Etkilenen Depo", value: "Merkez Depo" }
] as const;

export const IDM_STOCK_ALERT =
  "Onay sonrası stoklar ilgili depoya iade edilecektir.";

export const IDM_LINES = [
  {
    no: "1",
    product: "Hava Filtresi",
    brand: "FiltreX",
    model: "AF-261",
    serial: "HF261-2505-001",
    qty: "1 adet",
    unitPrice: "₺210,00",
    discount: "%0",
    total: "₺210,00",
    status: "Kontrol Ediliyor"
  },
  {
    no: "2",
    product: "Basınç Sensörü 0-250 Bar",
    brand: "DijiSens",
    model: "Z-24",
    serial: "DSZ24-2504-117",
    qty: "1 adet",
    unitPrice: "₺450,00",
    discount: "%0",
    total: "₺450,00",
    status: "Kontrol Ediliyor"
  },
  {
    no: "3",
    product: "Elektrik Motoru 7.5 kW",
    brand: "VoltDrive",
    model: "EM7.5-4",
    serial: "EM754-2503-089",
    qty: "2 adet",
    unitPrice: "₺4.882,50",
    discount: "%0",
    total: "₺9.765,00",
    status: "Kontrol Ediliyor"
  }
] as const;

export const IDM_LINES_FOOT = {
  qty: "4 adet",
  total: "₺10.425,00"
} as const;

export const IDM_HISTORY = {
  title: "İade Geçmişi",
  items: [
    { title: "Talep Oluşturuldu", time: "15.05.2025 14:32" },
    { title: "Kontrol Bekleniyor", time: "15.05.2025 14:35" }
  ]
} as const;

export const IDM_ACTIONS = {
  title: "İade İşlemleri",
  buttons: ["Not Ekle", "Dosya Ekle", "Para İadesi Başlat", "İadeyi İptal Et"]
} as const;

export const IDM_CONTEXT = {
  title: "İade Bağlamı",
  rows: [
    { label: "İade Tipi", value: "Satış İadesi" },
    { label: "Durum", value: "Onay Bekliyor" },
    { label: "Öncelik", value: "Normal" },
    { label: "Yöntem", value: "Depo İadesi" },
    { label: "Tutar", value: "₺10.425,00" }
  ]
} as const;

export const IDM_APPROVAL = {
  title: "Onay Süreci",
  steps: [
    { label: "Talep Oluşturuldu", state: "done" as const },
    { label: "Kontrol Ediliyor", state: "done" as const },
    { label: "Onay Bekliyor", state: "current" as const },
    { label: "Tamamlandı", state: "pending" as const }
  ]
} as const;

export const IDM_WAREHOUSE = {
  title: "Depo ve Notlar",
  warehouse: "Merkez Depo",
  location: "İade Alanı - A01",
  note: "Ürün arızalı olarak iade edilmiştir.",
  file: { name: "ariza-videosu.mp4", size: "23.6 MB" }
} as const;

