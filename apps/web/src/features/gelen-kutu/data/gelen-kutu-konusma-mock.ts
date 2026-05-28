// @ts-nocheck
export const GKK_PAGE = {
  title: "Gelen Kutu",
  subtitle: "Ürün bağlamlı konuşmaları yönetin."
};

export const GKK_THREADS = [
  {
    id: "1",
    code: "UR-10001",
    name: "Rulman 6205 2RS",
    preview: "Merhaba, Rulman 6205 2RS ürününüzün fiyatı nedir?",
    time: "10:24",
    unread: 2,
    selected: true
  },
  {
    id: "2",
    code: "UR-10002",
    name: "V Kayışı SPB 1600",
    preview: "Stok durumu nedir?",
    time: "10:12",
    unread: 1
  },
  {
    id: "3",
    code: "UR-10003",
    name: "Elektrik Motoru 7.5 kW",
    preview: "Teslimat süresi kaç gün?",
    time: "09:48",
    unread: 0
  },
  {
    id: "4",
    code: "UR-10004",
    name: "Hava Filtresi AF-261",
    preview: "Toplu alım için fiyat teklifi alabilir miyim?",
    time: "Dün",
    unread: 0
  },
  {
    id: "5",
    code: "UR-10005",
    name: "Hidrolik Yağ 46 20L",
    preview: "Kampanya fiyatı geçerli mi?",
    time: "Dün",
    unread: 1
  },
  {
    id: "6",
    code: "UR-10006",
    name: "Kontrol Paneli",
    preview: "Teknik şartname paylaşır mısınız?",
    time: "2 gün önce",
    unread: 0
  },
  {
    id: "7",
    code: "UR-10007",
    name: "Küresel Vana DN25",
    preview: "DN25 vana için stok bilgisi?",
    time: "2 gün önce",
    unread: 0
  },
  {
    id: "8",
    code: "UR-10008",
    name: "Basınç Sensörü 0-250 Bar",
    preview: "Kalibrasyon sertifikası var mı?",
    time: "3 gün önce",
    unread: 0
  }
];

export const GKK_ACTIVE = {
  code: "UR-10001",
  name: "Rulman 6205 2RS",
  tag: "Müşteri",
  barcode: "8681234567890",
  brand: "SKF",
  category: "Rulmanlar",
  price: "₺85,00",
  priceGroup: "Standart",
  unit: "Adet"
};

export const GKK_MESSAGES = [
  { id: "1", dir: "in" as const, text: "Merhaba, Rulman 6205 2RS ürününüzün fiyatı nedir?", time: "10:21" },
  { id: "2", dir: "out" as const, text: "Merhaba, Rulman 6205 2RS ürününüzün güncel fiyatı ₺85,00'dır.", time: "10:22", read: true },
  {
    id: "3",
    dir: "out" as const,
    text: "100 adet ve üzeri alımlarda %10 indirim uygulanmaktadır.",
    time: "10:22",
    read: true
  },
  { id: "4", dir: "in" as const, text: "Stokta mevcut mu?", time: "10:23" },
  {
    id: "5",
    dir: "out" as const,
    text: "Evet, şu anda 850 adet stokta mevcuttur. Aynı gün kargo yapılabilir.",
    time: "10:23",
    read: true
  },
  { id: "6", dir: "in" as const, text: "Tamam, 50 adet sipariş vermek istiyorum.", time: "10:24" },
  {
    id: "7",
    dir: "out" as const,
    text: "Siparişiniz alınmıştır. En kısa sürede sizinle iletişime geçeceğiz. 😊",
    time: "10:24",
    read: true
  }
];

export const GKK_QUICK = [
  "Yeni Teklif",
  "Yeni Sipariş",
  "Stok Kontrol",
  "Fatura Oluştur",
  "Not Ekle",
  "Takip Oluştur"
];

export const GKK_INTERACTIONS = [
  { id: "SO-10015", label: "Sipariş #SO-10015", status: "Onaylandı", date: "12.05.2025" },
  { id: "TE-10023", label: "Teklif #TE-10023", status: "Gönderildi", date: "10.05.2025" },
  { id: "FA-10008", label: "Fatura #FA-10008", status: "Kesildi", date: "05.05.2025" }
];

export const GKK_NOTE = "Toplu alım hedefi var. İndirim oranlarına duyarlı.";
