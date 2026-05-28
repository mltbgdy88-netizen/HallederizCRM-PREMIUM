// @ts-nocheck
export type HizliActionCard = {
  id: string;
  title: string;
  description: string;
  icon: "order" | "offer" | "collection" | "delivery" | "return" | "impact";
};

export type HizliRecentItem = {
  id: string;
  type: string;
  ref: string;
  customer: string;
  timeAgo: string;
  status: "Tamamlandı" | "Beklemede";
  icon: HizliActionCard["icon"];
  iconTone: "green" | "gold";
};

export const HI_PAGE = {
  title: "Hızlı İşlem Merkezi",
  subtitle: "Günlük işlemlerinizi hızlı ve kolay bir şekilde gerçekleştirin.",
  historyLabel: "İşlem Geçmişi"
};

export const HI_ACTION_CARDS: HizliActionCard[] = [
  {
    id: "order",
    title: "Sipariş",
    description: "Yeni sipariş oluşturun ve siparişlerinizi yönetin.",
    icon: "order"
  },
  {
    id: "offer",
    title: "Teklif",
    description: "Yeni teklif hazırlayın ve tekliflerinizi takip edin.",
    icon: "offer"
  },
  {
    id: "collection",
    title: "Tahsilat",
    description: "Tahsilat kaydı oluşturun ve tahsilatlarınızı yönetin.",
    icon: "collection"
  },
  {
    id: "delivery",
    title: "Teslim",
    description: "Teslimat kaydı oluşturun ve teslimatları takip edin.",
    icon: "delivery"
  },
  {
    id: "return",
    title: "İade",
    description: "İade kaydı oluşturun ve iadelerinizi yönetin.",
    icon: "return"
  },
  {
    id: "impact",
    title: "Etki Analizi",
    description: "Fiyat ve stok değişim etkilerini analiz edin.",
    icon: "impact"
  }
];

export const HI_RECENT: HizliRecentItem[] = [
  {
    id: "1",
    type: "Sipariş",
    ref: "SO-2025-0248",
    customer: "ABC A.Ş.",
    timeAgo: "2 dk önce",
    status: "Tamamlandı",
    icon: "order",
    iconTone: "green"
  },
  {
    id: "2",
    type: "Tahsilat",
    ref: "TAH-2025-0187",
    customer: "XYZ Ltd. Şti.",
    timeAgo: "15 dk önce",
    status: "Tamamlandı",
    icon: "collection",
    iconTone: "green"
  },
  {
    id: "3",
    type: "Teslim",
    ref: "TES-2025-0096",
    customer: "DEF Ticaret",
    timeAgo: "1 saat önce",
    status: "Tamamlandı",
    icon: "delivery",
    iconTone: "green"
  },
  {
    id: "4",
    type: "Teklif",
    ref: "TEK-2025-0315",
    customer: "GHI Pazarlama",
    timeAgo: "2 saat önce",
    status: "Beklemede",
    icon: "offer",
    iconTone: "gold"
  },
  {
    id: "5",
    type: "İade",
    ref: "IA-2025-0062",
    customer: "JKL Elektronik",
    timeAgo: "3 saat önce",
    status: "Tamamlandı",
    icon: "return",
    iconTone: "gold"
  }
];
