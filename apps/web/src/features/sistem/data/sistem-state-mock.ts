// @ts-nocheck
export const DEMO_MODAL = {
  title: "DEMO MODU",
  lead: "Bu bir demo ortamdır. Gerçek veriler kullanılmamaktadır.",
  bullets: [
    { id: "1", text: "Tüm veriler örnek (sandbox) verilerden oluşur." },
    { id: "2", text: "Herhangi bir işlem gerçek kayıtlarda değişiklik oluşturmaz." },
    { id: "3", text: "Dilediğiniz gibi keşfedebilir ve deneyimleyebilirsiniz." }
  ],
  toggleLabel: "Demo Modu",
  toggleValue: "AÇIK",
  exit: "Çıkış"
};

export const LIVE_EMPTY = {
  title: "Canlı Veri Yok",
  desc: "Sistem canlı verilere bağlanıyor. Lütfen kısa bir süre bekleyin.",
  connecting: "Bağlanıyor..."
};

export const OFFLINE_SHELL_NAV = [
  { id: "dashboard", label: "Gösterge Paneli", href: "/offline-api" },
  { id: "customers", label: "Müşteriler", href: "#" },
  { id: "opportunities", label: "Fırsatlar", href: "#" },
  { id: "tasks", label: "Görevler", href: "#" },
  { id: "calendar", label: "Takvim", href: "#" },
  { id: "email", label: "E-postalar", href: "#" },
  { id: "reports", label: "Raporlar", href: "#" },
  { id: "settings", label: "Ayarlar", href: "#" },
  { id: "integrations", label: "Entegrasyonlar", href: "#" },
  { id: "help", label: "Yardım", href: "#" }
] as const;

export const OFFLINE_SHELL_HEADER = {
  title: "Gösterge Paneli",
  searchPlaceholder: "Ara...",
  userName: "Yönetici",
  userRole: "Premium CRM",
  notifications: 3
};

export const OFFLINE_SHELL_FOOTER = {
  title: "ÇEVRİMDI�?I MOD",
  hint: "Bazı özellikler sınırlı olabilir.",
  link: "Detaylar >"
};

export const OFFLINE_STATE = {
  title: "API Bağlantısı Yok",
  desc: "Sunucuya şu anda ulaşılamıyor. Lütfen internet bağlantınızı kontrol edin veya daha sonra yeniden deneyin.",
  retry: "Yeniden Dene",
  badge: "OFFLINE MOD",
  note: "�?u anda çevrimdışısınız. Verileriniz yerel olarak saklanıyor. Bağlantı sağlandığında otomatik olarak senkronize edilecektir.",
  banner: "Bağlantı Sorunu. İnternet bağlantınızı kontrol edin veya ağ yöneticinizle iletişime geçin.",
  bannerAction: "Bağlantı Durumunu Kontrol Et"
};

export const UNAUTHORIZED_STATE = {
  title: "Yetkiniz Yok",
  desc: "Bu sayfaya erişim yetkiniz bulunmamaktadır. Lütfen yetkili bir kullanıcı ile iletişime geçin.",
  back: "Geri Dön",
  home: "Ana Sayfa"
};

