// @ts-nocheck
export const SDM_PAGE = {
  breadcrumb: ["Siparişler", "Sipariş Detayı"],
  title: "Sipariş",
  orderId: "SP-24031",
  status: "Onaylandı",
  orderDate: "Sipariş Tarihi: 24.05.2025 14:35"
} as const;

export const SDM_FIN_KPIS = [
  { id: "amount", label: "Sipariş Tutarı", value: "₺89.350,00", tone: "green" as const },
  { id: "discount", label: "İskonto Toplamı", value: "₺4.850,00", tone: "gold" as const },
  { id: "tax", label: "Vergi Toplamı", value: "₺15.121,50", tone: "teal" as const },
  { id: "gross", label: "KDV Dahil Toplam", value: "₺99.471,50", tone: "green" as const },
  { id: "paid", label: "Ödenen Tutar", value: "₺50.000,00", tone: "blue" as const },
  { id: "remaining", label: "Kalan Tutar", value: "₺49.471,50", tone: "orange" as const }
] as const;

export const SDM_TABS = [
  "Özet",
  "Satırlar",
  "Ödeme",
  "Teslimat",
  "Fatura",
  "İade",
  "Depo",
  "Timeline"
] as const;

export type SdmTab = (typeof SDM_TABS)[number];

export const SDM_INFO_LEFT = [
  { label: "Sipariş No", value: "SP-24031" },
  { label: "Sipariş Tarihi", value: "24.05.2025 14:35" },
  { label: "Müşteri", value: "ABC Makina San. ve Tic. A.Ş." },
  { label: "Cari Kodu", value: "C-1024" },
  { label: "İletişim", value: "Ahmet Yılmaz" },
  { label: "Telefon", value: "+90 212 555 15 20" },
  { label: "E-posta", value: "ahmet.yilmaz@abcmakina.com" },
  { label: "Adres", value: "İkitelli OSB Mah. İsteks San. Sitesi T Blok No:12 Başakşehir / İstanbul" },
  { label: "Sipariş Kaynağı", value: "Web Sitesi" },
  { label: "Açıklama", value: "Otomasyon projesi ekipman tedariği.", full: true }
] as const;

export const SDM_INFO_RIGHT = [
  { label: "Durum", value: "Onaylandı", badge: "ok" as const },
  { label: "Öncelik", value: "Normal" },
  { label: "Para Birimi", value: "TRY" },
  { label: "Kur", value: "1,0000" },
  { label: "Fiyat Listesi", value: "Standart Fiyat Listesi" },
  { label: "Ödeme Koşulu", value: "30 Gün" },
  { label: "Teslimat Koşulu", value: "Kısmi Teslimat" },
  { label: "Oluşturan", value: "Yusuf Kaya", avatar: "YK" },
  { label: "Son Güncelleyen", value: "Yusuf Kaya", avatar: "YK" }
] as const;

export const SDM_LINES = [
  { no: "1", code: "UR-10001", name: "Rulman 6205 2RS", qty: "10", unit: "Adet", price: "₺85,00", disc: "5,00", tax: "18", total: "₺807,50" },
  { no: "2", code: "UR-10003", name: "Elektrik Motoru 7.5 kW", qty: "2", unit: "Adet", price: "₺8.750,00", disc: "0,00", tax: "18", total: "₺17.500,00" },
  { no: "3", code: "UR-10004", name: "Hava Filtresi AF-261", qty: "4", unit: "Adet", price: "₺210,00", disc: "10,00", tax: "18", total: "₺756,00" },
  { no: "4", code: "UR-10006", name: "Dişli Çark Z-24", qty: "3", unit: "Adet", price: "₺450,00", disc: "5,00", tax: "18", total: "₺1.282,50" },
  { no: "5", code: "UR-10007", name: "Hidrolik Yağ 46 20L", qty: "6", unit: "Adet", price: "₺320,00", disc: "0,00", tax: "18", total: "₺1.920,00" },
  { no: "6", code: "UR-10008", name: "Basınç Sensörü 0-250 Bar", qty: "2", unit: "Adet", price: "₺1.250,00", disc: "0,00", tax: "18", total: "₺2.500,00" },
  { no: "7", code: "UR-10009", name: "Küresel Vana DN25", qty: "4", unit: "Adet", price: "₺180,00", disc: "5,00", tax: "18", total: "₺684,00" },
  { no: "8", code: "UR-10010", name: "SPB 1600 Endüstriyel Valf", qty: "1", unit: "Adet", price: "₺12.500,00", disc: "0,00", tax: "18", total: "₺12.500,00" }
] as const;

export const SDM_LINE_TOTALS = [
  { label: "Ara Toplam", value: "₺75.650,00" },
  { label: "İndirim Toplamı", value: "₺4.850,00" },
  { label: "Vergi Toplamı", value: "₺15.121,50" },
  { label: "KDV Dahil Toplam", value: "₺99.471,50", strong: true },
  { label: "Ödenen Tutar", value: "₺50.000,00" },
  { label: "Kalan Tutar", value: "₺49.471,50", warn: true }
] as const;

export const SDM_APPROVAL = [
  { title: "Sipariş Oluşturuldu", time: "24.05.2025 14:35", done: true },
  { title: "Onay Bekliyor", time: "24.05.2025 14:37", done: true },
  { title: "Onaylandı", time: "24.05.2025 14:40", done: true, active: true }
] as const;

export const SDM_DELIVERY = {
  status: "Kısmi Teslimat",
  planned: "28.05.2025",
  progress: "2 / 8 satır teslim edildi",
  cta: "Teslimatları Görüntüle"
} as const;

export const SDM_INVOICE = {
  text: "Fatura oluşturulmadı",
  cta: "Fatura Oluştur"
} as const;

export const SDM_NOTES = {
  placeholder: "İç not ekleyin...",
  sample: "Müşteri proje kapsamında düzenli alım yapmaktadır."
} as const;
