export type MuhasebeHubCard = {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: "invoices" | "payments" | "returns";
};

export const MUHASEBE_HUB_TITLE = "Muhasebe";
export const MUHASEBE_HUB_SUBTITLE =
  "Fatura, tahsilat ve iade işlemlerine tek kapıdan erişin. Açık finans kayıtları buradan yönetilir.";

export const MUHASEBE_HUB_CARDS: MuhasebeHubCard[] = [
  {
    id: "invoices",
    title: "Faturalar",
    description: "Kesilen ve bekleyen faturalar, fatura detayı ve belge bağlantıları.",
    href: "/faturalar",
    icon: "invoices"
  },
  {
    id: "payments",
    title: "Tahsilatlar",
    description: "Tahsilat fişleri, kısmi ödemeler, cari allocation ve vade takibi.",
    href: "/tahsilatlar",
    icon: "payments"
  },
  {
    id: "returns",
    title: "İadeler",
    description: "İade talepleri, stok/finans etkisi ve onay bekleyen iade kayıtları.",
    href: "/iadeler",
    icon: "returns"
  }
];

