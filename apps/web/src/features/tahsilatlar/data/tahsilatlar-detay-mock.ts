// @ts-nocheck
export const THDM_PAGE = {
  breadcrumb: ["Tahsilatlar", "Tahsilat TH-1192"],
  title: "Tahsilat Detay Masası"
} as const;

export const THDM_SUMMARY = {
  number: "TH-1192",
  date: "24.05.2025 14:32",
  customer: "ABC İnşaat San. ve Tic. A.�?.",
  customerCode: "CAR-00078",
  amount: "₺68.750,00",
  method: "Havale / EFT",
  methodDetail: "Ziraat Bankası · TR12 0001 0000 0000 0000 0000 01",
  status: "Tamamlandı"
} as const;

export const THDM_STEPS = [
  { id: "1", title: "Tahsilat Oluşturuldu", time: "24.05.2025 14:32", actor: "Yusuf Kaya" },
  { id: "2", title: "Ödeme Kaydedildi", time: "24.05.2025 14:33", actor: "Yusuf Kaya" },
  { id: "3", title: "Otomatik Eşleştirme", time: "24.05.2025 14:33", actor: "Sistem" },
  { id: "4", title: "Dekont Yüklendi", time: "24.05.2025 14:34", actor: "Yusuf Kaya" },
  { id: "5", title: "Tahsilat Tamamlandı", time: "24.05.2025 14:34", actor: "Sistem" }
] as const;

export const THDM_INFO = [
  { label: "Tahsilat No", value: "TH-1192" },
  { label: "Tarih", value: "24.05.2025 14:32" },
  { label: "Cari Ünvan", value: "ABC İnşaat San. ve Tic. A.�?." },
  { label: "Cari Kodu", value: "CAR-00078" },
  { label: "Ödeme Yöntemi", value: "Havale / EFT" },
  { label: "Banka Hesabı", value: "Ziraat Bankası · TR12 0001 0000 0000 0000 0000 01" },
  { label: "Açıklama", value: "Mayıs 2025 ödeme", full: true }
] as const;

export const THDM_RECEIPT = {
  fileName: "dekont_th1192.pdf",
  label: "Dekont"
} as const;

export type ThdmInvoiceStatus = "Ödendi" | "Kısmi";

export const THDM_INVOICES = [
  {
    id: "1",
    docNo: "FAT-2025-0487",
    date: "10.05.2025",
    dueDate: "20.05.2025",
    original: "₺28.450,00",
    remaining: "₺0,00",
    collected: "₺28.450,00",
    status: "Ödendi" as ThdmInvoiceStatus
  },
  {
    id: "2",
    docNo: "FAT-2025-0501",
    date: "12.05.2025",
    dueDate: "22.05.2025",
    original: "₺24.300,00",
    remaining: "₺1.000,00",
    collected: "₺23.300,00",
    status: "Kısmi" as ThdmInvoiceStatus
  },
  {
    id: "3",
    docNo: "FAT-2025-0512",
    date: "15.05.2025",
    dueDate: "25.05.2025",
    original: "₺32.000,00",
    remaining: "₺15.000,00",
    collected: "₺17.000,00",
    status: "Kısmi" as ThdmInvoiceStatus
  }
] as const;

export const THDM_DIST_FOOTER = {
  collected: "₺68.750,00",
  original: "₺68.750,00",
  remaining: "₺15.000,00",
  matchStatus: "Kısmi Eşleşti"
} as const;

export const THDM_CONTEXT = {
  title: "Tahsilat Bağlamı",
  customer: "ABC İnşaat San. ve Tic. A.�?.",
  status: "Aktif",
  taxId: "1234567890",
  phone: "+90 212 555 12 34",
  email: "info@abcinsaat.com",
  address: "Maslak Mah. Büyükdere Cad. No:123 Sarıyer / İstanbul"
} as const;

export const THDM_LINKED = [
  { id: "1", docNo: "FAT-2025-0487", amount: "₺28.450,00" },
  { id: "2", docNo: "FAT-2025-0501", amount: "₺23.300,00" },
  { id: "3", docNo: "FAT-2025-0512", amount: "₺17.000,00" }
] as const;

export const THDM_OVERVIEW = [
  { label: "Toplam Tahsilat", value: "₺68.750,00" },
  { label: "Toplam Fatura", value: "₺84.750,00" },
  { label: "Eşleşen Tutar", value: "₺53.750,00" },
  { label: "Kalan Tutar", value: "₺15.000,00" },
  { label: "İskonto Tutarı", value: "₺0,00" }
] as const;

export const THDM_NOTES = {
  placeholder: "Tahsilat ile ilgili not ekleyin...",
  saveLabel: "Notu Kaydet",
  systemNote:
    "Tahsilat otomatik eşleştirme ile ilişkilendirildi. 24.05.2025 14:33 — Sistem"
} as const;

