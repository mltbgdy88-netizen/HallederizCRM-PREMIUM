export type QuickOperationHubIcon =
  | "order"
  | "offer"
  | "collection"
  | "delivery"
  | "return"
  | "impact";

export type QuickOperationHubCard = {
  id: string;
  title: string;
  description: string;
  icon: QuickOperationHubIcon;
  href: string;
};

export const QUICK_OPERATION_HUB_PAGE = {
  title: "Hızlı İşlem Merkezi",
  subtitle: "Günlük işlemlerinizi hızlı ve kolay bir şekilde gerçekleştirin.",
  historyLabel: "İşlem Geçmişi",
  historyHref: "/archive"
} as const;

export const QUICK_OPERATION_HUB_CARDS: QuickOperationHubCard[] = [
  {
    id: "order",
    title: "Sipariş",
    description: "Yeni sipariş oluşturun ve siparişlerinizi yönetin.",
    icon: "order",
    href: "/hizli-islem/satis-masasi?tab=order"
  },
  {
    id: "offer",
    title: "Teklif",
    description: "Yeni teklif hazırlayın ve tekliflerinizi takip edin.",
    icon: "offer",
    href: "/hizli-islem/satis-masasi?tab=offer"
  },
  {
    id: "collection",
    title: "Tahsilat",
    description: "Tahsilat kaydı oluşturun ve tahsilatlarınızı yönetin.",
    icon: "collection",
    href: "/hizli-islem/satis-masasi?tab=payment"
  },
  {
    id: "delivery",
    title: "Teslim",
    description: "Teslimat kaydı oluşturun ve teslimatları takip edin.",
    icon: "delivery",
    href: "/hizli-islem/satis-masasi?tab=delivery"
  },
  {
    id: "return",
    title: "İade",
    description: "İade kaydı oluşturun ve iadelerinizi yönetin.",
    icon: "return",
    href: "/hizli-islem/satis-masasi?tab=return"
  },
  {
    id: "impact",
    title: "Etki Analizi",
    description: "Fiyat ve stok değişim etkilerini analiz edin.",
    icon: "impact",
    href: "/hizli-islem/etki-analizi"
  }
];

export const QUICK_OPERATION_SALES_DESK_HREF = "/hizli-islem/satis-masasi";
