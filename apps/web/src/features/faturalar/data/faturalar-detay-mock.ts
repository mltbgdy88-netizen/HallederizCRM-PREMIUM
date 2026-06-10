// @ts-nocheck
export const FDM_PAGE = {
  breadcrumb: ["Faturalar", "Fatura Detay"],
  title: "Fatura Detay",
  backLabel: "Geri Dön"
} as const;

export const FDM_HERO = {
  invoiceId: "FT-992",
  invoiceDate: "14.05.2025, Çarşamba 10:45",
  dueDate: "28.05.2025",
  dueNote: "14 gün kaldı",
  currency: "TRY Türk Lirası",
  status: "Ödendi",
  statusNote: "İşlem Tamamlandı",
  creator: "Yusuf Kaya",
  creatorRole: "Yönetici"
} as const;

export const FDM_TABS = ["Özet", "Kalemler", "Ödemeler"] as const;
export type FdmTab = (typeof FDM_TABS)[number];

export const FDM_CUSTOMER = {
  title: "Müşteri Bilgileri",
  detailBtn: "Müşteri Detay",
  fields: [
    { label: "Müşteri", value: "ABC Teknoloji A.�?." },
    { label: "Cari Kodu", value: "ABC001" },
    { label: "Vergi Dairesi", value: "Büyük Mükellefler VD." },
    { label: "Vergi Numarası", value: "123 456 7890" },
    { label: "E-Posta", value: "info@abcteknoloji.com" },
    { label: "Telefon", value: "+90 (212) 555 10 10" }
  ]
} as const;

export const FDM_DESCRIPTION = {
  title: "Fatura Açıklaması",
  text: "Mayıs 2025 dönemi ürün ve hizmet bedeli faturası."
} as const;

export const FDM_NOTES = {
  title: "Notlar",
  text: "Teşekkür ederiz."
} as const;

export const FDM_TOTALS = {
  title: "Fatura Toplamları",
  rows: [
    { label: "Mal Hizmet Toplam Tutarı", value: "₺81.250,00" },
    { label: "İskonto Tutarı", value: "- ₺2.500,00" },
    { label: "Ara Toplam", value: "₺78.750,00" },
    { label: "KDV %20", value: "₺15.750,00" },
    { label: "Diğer Vergiler", value: "₺0,00" }
  ],
  grandTotal: "₺94.500,00"
} as const;

export const FDM_PAYMENT = {
  title: "Ödeme Bilgileri",
  fields: [
    { label: "Ödeme Durumu", value: "Ödendi", tone: "success" as const },
    { label: "Ödenen Tutar", value: "₺94.500,00" },
    { label: "Ödeme Yöntemi", value: "Havale / EFT" },
    { label: "Ödeme Tarihi", value: "15.05.2025" },
    { label: "İşlem Referansı", value: "TR150520250000992" }
  ],
  historyBtn: "Ödeme Geçmişi"
} as const;

export const FDM_CONTEXT = {
  title: "Fatura Bağlamı",
  eInvoice: "E-Fatura (GİB) — E-Fatura başarıyla iletildi",
  rows: [
    { label: "Fatura No", value: "FT-992" },
    { label: "Fatura Tarihi", value: "14.05.2025" },
    { label: "Vade Tarihi", value: "28.05.2025" },
    { label: "Belge No", value: "A1B2C3D4E5F6" },
    { label: "Senaryo", value: "TICARIFATURA" },
    { label: "Fatura Tipi", value: "SATI�?" },
    { label: "Oluşturan", value: "Yusuf Kaya" },
    { label: "Oluşturma Zamanı", value: "14.05.2025 10:45" },
    { label: "Son Güncelleme", value: "15.05.2025 09:12" }
  ],
  actions: [
    { label: "PDF İndir", tone: "primary" as const },
    { label: "E-Fatura Görüntüle", tone: "outline" as const },
    { label: "Yazdır", tone: "outline" as const },
    { label: "Fatura İptal Et", tone: "warn" as const },
    { label: "Fatura Sil", tone: "danger" as const }
  ]
} as const;

