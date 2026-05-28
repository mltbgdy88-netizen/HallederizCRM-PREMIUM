// @ts-nocheck
export const TYH_PAGE = {
  breadcrumb: ["Teklifler", "Yeni Teklif"],
  title: "Yeni Teklif Oluştur",
  subtitle: "İhtiyacınıza uygun teklif türünü seçerek hızlıca başlayın",
  listButton: "Teklifler Listesi"
} as const;

export const TYH_HUB = {
  title: "Yeni Teklif Oluştur",
  subtitle:
    "Müşterilerinize profesyonel teklifler sunmak için ihtiyacınıza uygun teklif türünü seçin."
} as const;

export const TYH_OPTIONS = [
  {
    id: "quick",
    title: "Hızlı Teklif",
    description: "Hızlı ve basit teklif oluşturun. Temel bilgilerle hemen başlayın.",
    icon: "bolt" as const
  },
  {
    id: "detail",
    title: "Detaylı Teklif",
    description: "Tüm detaylarıyla kapsamlı teklif oluşturun. Kalem kalem düzenleyin.",
    icon: "doc" as const
  }
] as const;

export const TYH_DRAFTS = [
  {
    id: "1",
    code: "TEK-2025-0047",
    customer: "ABC Makine A.Ş.",
    datetime: "12.05.2025 14:30",
    amount: "₺125.000,00"
  },
  {
    id: "2",
    code: "TEK-2025-0046",
    customer: "XYZ Otomotiv Ltd.",
    datetime: "12.05.2025 11:15",
    amount: "₺85.750,00"
  },
  {
    id: "3",
    code: "TEK-2025-0045",
    customer: "Mega İnşaat A.Ş.",
    datetime: "12.05.2025 09:45",
    amount: "₺210.500,00"
  }
] as const;

export const TYH_TIP =
  "İpucu: Hızlı teklif ile zamandan tasarruf edin veya detaylı teklif ile tüm ihtiyaçlarınızı karşılayın.";
