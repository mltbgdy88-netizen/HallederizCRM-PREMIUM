// @ts-nocheck
export type GkopChannelTab = "all" | "whatsapp" | "mail" | "sms";

export type GkopConversation = {
  id: string;
  name: string;
  initials: string;
  avatarTone?: "green" | "slate" | "blue";
  channel: "whatsapp" | "mail" | "sms";
  preview: string;
  time: string;
  unread?: number;
  read?: boolean;
  selected?: boolean;
};

export type GkopChatMessage = {
  id: string;
  direction: "in" | "out";
  text: string;
  time: string;
  read?: boolean;
};

export type GkopOrder = {
  id: string;
  product: string;
  status: "Tamamlandı" | "Kargoda";
  price: string;
  date: string;
};

export const GKOP_PAGE = {
  title: "Gelen Kutusu",
  subtitle: "Tüm kanallardan gelen mesajları yönetin ve müşterilerinizle iletişimde kalın.",
  filterLabel: "Tümü",
  listTitle: "Gelen Kutusu",
  listFooter: "Toplam 12 sohbet",
  pagination: "1 / 2"
};

export const GKOP_TABS: { id: GkopChannelTab; label: string; count: number; icon?: "whatsapp" | "mail" | "sms" }[] = [
  { id: "all", label: "Tümü", count: 12 },
  { id: "whatsapp", label: "", count: 8, icon: "whatsapp" },
  { id: "mail", label: "", count: 3, icon: "mail" },
  { id: "sms", label: "", count: 1, icon: "sms" }
];

export const GKOP_CONVERSATIONS: GkopConversation[] = [
  {
    id: "1",
    name: "Ahmet Yılmaz",
    initials: "AY",
    channel: "whatsapp",
    preview: "Merhaba, UR-10001 kodlu ürünün fiyatı nedir?",
    time: "10:24",
    unread: 2,
    selected: true
  },
  {
    id: "2",
    name: "Mehmet Demir",
    initials: "MD",
    channel: "whatsapp",
    preview: "Teşekkürler, ödeme planını onayladım.",
    time: "10:18",
    read: true
  },
  {
    id: "3",
    name: "Zeynep Kaya",
    initials: "ZK",
    avatarTone: "slate",
    channel: "whatsapp",
    preview: "Kargo takip numarasını paylaşır mısınız?",
    time: "09:52",
    unread: 1
  },
  {
    id: "4",
    name: "+90 553 123 45 67",
    initials: "55",
    channel: "whatsapp",
    preview: "Sipariş durumumu öğrenebilir miyim?",
    time: "Dün",
    read: true
  },
  {
    id: "5",
    name: "info@ornek.com",
    initials: "@",
    avatarTone: "blue",
    channel: "mail",
    preview: "Fiyat teklifi talebi — UR-10008",
    time: "Dün",
    unread: 3
  },
  {
    id: "6",
    name: "Berat Özkan",
    initials: "B",
    channel: "whatsapp",
    preview: "Stok listesini WhatsApp üzerinden ilettik.",
    time: "Dün",
    read: true
  },
  {
    id: "7",
    name: "Nova İnşaat Ltd.",
    initials: "Nİ",
    channel: "sms",
    preview: "SMS: Teslimat adresi güncellendi.",
    time: "22.05",
    read: true
  },
  {
    id: "8",
    name: "Elif Yıldız",
    initials: "EY",
    channel: "whatsapp",
    preview: "Revize fiyat listesini bekliyorum.",
    time: "21.05",
    read: true
  }
];

export const GKOP_ACTIVE_CHAT = {
  initials: "AY",
  name: "Ahmet Yılmaz",
  phone: "+90 532 123 45 67",
  tag: "Müşteri",
  dateLabel: "Bugün"
};

export const GKOP_MESSAGES: GkopChatMessage[] = [
  {
    id: "1",
    direction: "in",
    text: "Merhaba, UR-10001 kodlu ürünün fiyatı nedir?",
    time: "10:24"
  },
  {
    id: "2",
    direction: "out",
    text: "Merhaba Ahmet Bey, UR-10001 kodlu ürünümüzün fiyatı ₺85,00'dir.",
    time: "10:25",
    read: true
  },
  {
    id: "3",
    direction: "in",
    text: "Stokta mevcut mu?",
    time: "10:26"
  },
  {
    id: "4",
    direction: "out",
    text: "Evet, stokta 2.450 adet mevcuttur.",
    time: "10:27",
    read: true
  },
  {
    id: "5",
    direction: "in",
    text: "Sipariş vermek istiyorum.",
    time: "10:28"
  }
];

export const GKOP_CUSTOMER = {
  initials: "AY",
  name: "Ahmet Yılmaz",
  tag: "Müşteri",
  phone: "+90 532 123 45 67",
  email: "ahmet.yilmaz@example.com",
  location: "İstanbul, Türkiye",
  viewProfile: "Profili Görüntüle"
};

export const GKOP_ORDERS: GkopOrder[] = [
  {
    id: "SO-2025-000123",
    product: "UR-10001 · 2 adet",
    status: "Tamamlandı",
    price: "₺2.550,00",
    date: "15.05.2025"
  },
  {
    id: "SO-2025-000098",
    product: "UR-10002 · 1 adet",
    status: "Tamamlandı",
    price: "₺1.250,00",
    date: "02.05.2025"
  },
  {
    id: "SO-2025-000075",
    product: "UR-10008 · 2 adet",
    status: "Kargoda",
    price: "₺680,00",
    date: "18.04.2025"
  }
];

export const GKOP_SUMMARY = {
  totalOrders: "8 adet",
  totalSpend: "₺12.450,00",
  averageOrder: "₺1.556,25",
  lastOrder: "15.05.2025",
  rating: 4.5
};

export const GKOP_QUICK_ACTIONS = [
  { id: "order", label: "Yeni Sipariş Oluştur", icon: "order" as const },
  { id: "offer", label: "Teklif Oluştur", icon: "offer" as const },
  { id: "note", label: "Müşteri Notu Ekle", icon: "note" as const }
];

export const GKOP_COMPOSER = {
  replyTab: "Yanıtla",
  noteTab: "Not Ekle",
  placeholder: "Mesajınızı yazın...",
  hint: "Enter ile gönder, Shift + Enter ile yeni satır"
};

