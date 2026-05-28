// @ts-nocheck
export type KpiCard = {
  id: string;
  label: string;
  value: string;
  tone: "green" | "gold" | "teal" | "orange";
};

export type FlowItem = {
  id: string;
  title: string;
  detail: string;
  time: string;
  status: "Başarılı" | "Uyarı" | "Bilgi";
  icon: "plus" | "alert" | "transfer" | "price" | "shelf" | "system";
};

export type AiQuickAction = {
  id: string;
  label: string;
};

export type NavItem = {
  id: string;
  label: string;
  href: string;
  active?: boolean;
  badge?: string;
};

export const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Gösterge Paneli", href: "/dashboard" },
  { id: "quick", label: "Hızlı İşlem", href: "/hizli-islem" },
  { id: "ai", label: "Yapay Zeka", href: "/ai" },
  { id: "approvals", label: "Onaylar", href: "/onaylar", badge: "7" },
  { id: "whatsapp", label: "WhatsApp", href: "/whatsapp" },
  { id: "customers", label: "Cariler", href: "/cariler" },
  { id: "offers", label: "Teklifler", href: "/teklifler" },
  { id: "orders", label: "Siparişler", href: "/siparisler" },
  { id: "stock", label: "Ürün / Stok", href: "/stok" },
  { id: "factory", label: "Fabrika", href: "/fabrikalar/siparis" },
  { id: "accounting", label: "Muhasebe", href: "/muhasebe" },
  { id: "archive", label: "Arşiv", href: "/archive" },
  { id: "reports", label: "Raporlar", href: "/raporlar" },
  { id: "settings", label: "Ayarlar", href: "/ayarlar" }
];

export const KPI_CARDS: KpiCard[] = [
  { id: "total", label: "Toplam Ürün", value: "2.458", tone: "green" },
  { id: "critical", label: "Kritik Stok", value: "86", tone: "gold" },
  { id: "center", label: "Merkez Stok", value: "125.430", tone: "green" },
  { id: "factory", label: "Fabrika Stok", value: "98.210", tone: "teal" },
  { id: "shelf", label: "Depo Raf", value: "76.880", tone: "green" },
  { id: "price", label: "Fiyat Grubu", value: "12", tone: "orange" }
];

export const FLOW_ITEMS: FlowItem[] = [
  {
    id: "1",
    title: "Yeni Ürün Eklendi",
    detail: "UR-10008 kodlu ürün sisteme eklendi.",
    time: "10:24",
    status: "Başarılı",
    icon: "plus"
  },
  {
    id: "2",
    title: "Kritik Stok Uyarısı",
    detail: "UR-10006 ürünü kritik stok seviyesinin altına düştü.",
    time: "09:58",
    status: "Uyarı",
    icon: "alert"
  },
  {
    id: "3",
    title: "Stok Girişi Gerçekleştirildi",
    detail: "UR-10001 ürünü için 850 adet stok girişi yapıldı.",
    time: "09:35",
    status: "Başarılı",
    icon: "plus"
  },
  {
    id: "4",
    title: "Transfer Talebi Oluşturuldu",
    detail: "Merkez Depo -> Fabrika Stok için transfer talebi oluşturuldu.",
    time: "09:12",
    status: "Bilgi",
    icon: "transfer"
  },
  {
    id: "5",
    title: "Depo Raf Güncellendi",
    detail: "A-01-01 lokasyonundaki raf bilgisi güncellendi.",
    time: "08:47",
    status: "Bilgi",
    icon: "shelf"
  },
  {
    id: "6",
    title: "Fiyat Güncellemesi",
    detail: "Hidrolik Yay 46 20L ürününün fiyatı güncellendi.",
    time: "08:15",
    status: "Başarılı",
    icon: "price"
  },
  {
    id: "7",
    title: "Rapor Oluşturuldu",
    detail: "Günlük stok hareket raporu oluşturuldu.",
    time: "Dün 17:45",
    status: "Bilgi",
    icon: "system"
  },
  {
    id: "8",
    title: "Transfer Tamamlandı",
    detail: "Transfer talebi başarıyla tamamlandı.",
    time: "Dün 16:30",
    status: "Başarılı",
    icon: "transfer"
  }
];

export const AI_QUICK_ACTIONS: AiQuickAction[] = [
  { id: "1", label: "Kritik stokları göster" },
  { id: "2", label: "Günlük stok özetini hazırla" },
  { id: "3", label: "Bekleyen transfer talepleri" },
  { id: "4", label: "En çok hareket gören ürünler" }
];

export const USER = {
  initials: "YK",
  name: "Yusuf Kaya",
  role: "Yönetici"
};
