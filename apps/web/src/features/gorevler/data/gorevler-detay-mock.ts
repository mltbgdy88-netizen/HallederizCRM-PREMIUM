// @ts-nocheck
export type GdmTab = "Genel Bakış" | "Checklist" | "Yorumlar (2)" | "Zaman Çizelgesi";

export const GDM_PAGE = {
  breadcrumb: ["Görevler", "Görev Detayı"],
  title: "Stok Sayımı ve Raporlama",
  status: "Açık",
  subtitle: "Aylık depo stok sayımı yapılacak ve raporlanacaktır.",
  taskId: "TSK-2025-000142"
};

export const GDM_SUMMARY = [
  { label: "Atanan Kişi", value: "Yusuf Kaya", sub: "Yönetici", icon: "user" },
  { label: "Son Tarih", value: "25 May 2025", sub: "Pazar", icon: "calendar" },
  { label: "Öncelik", value: "Orta", icon: "flag" },
  { label: "Oluşturulma Tarihi", value: "20 May 2025 09:30", sub: "Yusuf Kaya", icon: "clock" },
  { label: "Görev ID", value: "TSK-2025-000142", icon: "id" }
];

export const GDM_TABS: GdmTab[] = ["Genel Bakış", "Checklist", "Yorumlar (2)", "Zaman Çizelgesi"];

export const GDM_DESCRIPTION =
  "Merkez depoda aylık stok sayımı gerçekleştirilecek. Sayım sonuçları sisteme girilecek, farklar analiz edilecek ve yönetime rapor sunulacaktır.";

export const GDM_CHECKLIST = [
  { label: "Depo hazırlıklarının tamamlanması", done: true },
  { label: "Stok sayımının yapılması", done: true },
  { label: "Sayım sonuçlarının sisteme girilmesi", done: false },
  { label: "Fark raporunun oluşturulması", done: false }
];

export const GDM_COMMENTS = [
  {
    author: "Yusuf Kaya",
    time: "20 May 2025 10:15",
    text: "Depo hazırlıkları tamamlandı, ekip sayım için hazır."
  },
  {
    author: "Ayşe Aydın",
    time: "21 May 2025 14:40",
    text: "Sayım işlemi başladı, akşama kadar tamamlanması bekleniyor."
  }
];

export const GDM_LINKED = [
  { label: "Depo", value: "Merkez Depo" },
  { label: "Ürün Stok", value: "UR-10001" },
  { label: "Rapor", value: "Aylık Stok Sayım Raporu" }
];

export const GDM_RELATED = [
  { title: "Depo Temizliği", status: "Tamamlandı", tone: "green" },
  { title: "Stok Girişi Kontrolü", status: "Devam Ediyor", tone: "blue" },
  { title: "Stok Raporu Analizi", status: "Beklemede", tone: "slate" }
];

export const GDM_INFO = [
  { label: "Durum", value: "Açık" },
  { label: "Öncelik", value: "Orta" },
  { label: "Kategori", value: "Operasyon" },
  { label: "Oluşturan", value: "Yusuf Kaya" }
];

export const GDM_TAGS = ["stok", "sayım", "depo"];
export const GDM_REMINDER = "24 May 2025 09:00";
