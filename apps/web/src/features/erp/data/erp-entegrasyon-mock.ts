// @ts-nocheck
export type EemKpiTone = "green" | "red" | "gold" | "teal" | "blue" | "slate";

export type EemKpi = { id: string; label: string; value: string; sub?: string; tone: EemKpiTone };

export type EemTab = { id: string; label: string; count?: number };

export type EemEventStatus = "Başarılı" | "Hata" | "Bekliyor";

export type EemTableRow = {
  id: string;
  erp: string;
  erpLogo: string;
  eventType: string;
  status: EemEventStatus;
  time: string;
};

export type EemConnection = {
  id: string;
  name: string;
  online: boolean;
  endpoint: string;
  responseMs?: string;
  lastCheck: string;
};

export const EEM_TITLE = "ERP Entegrasyon Merkezi";
export const EEM_SUBTITLE = "ERP entegrasyon süreçlerini izleyin, yönetin ve hataları giderin.";

export const EEM_KPIS: EemKpi[] = [
  { id: "sync", label: "Senkronizasyon Durumu", value: "%98,6", sub: "Başarılı", tone: "green" },
  { id: "errors", label: "Hata Sayısı", value: "12", sub: "Bugün", tone: "red" },
  { id: "pending", label: "Bekleyen İşlem", value: "86", sub: "Kuyrukta", tone: "gold" },
  { id: "success", label: "Başarılı İşlem", value: "12.458", sub: "Bugün", tone: "teal" },
  { id: "latency", label: "Ortalama Yanıt Süresi", value: "420 ms", sub: "İyi", tone: "blue" },
  { id: "last", label: "Son Senkronizasyon", value: "2 dk önce", tone: "slate" }
];

export const EEM_TABS: EemTab[] = [
  { id: "summary", label: "Senkronizasyon Özeti" },
  { id: "errors", label: "Hata Kuyruğu", count: 12 },
  { id: "pending", label: "Bekleyen Kuyruk", count: 86 },
  { id: "history", label: "Entegrasyon Geçmişi" }
];

export const EEM_TABLE_ROWS: EemTableRow[] = [
  {
    id: "1",
    erp: "LOGO Tiger 3",
    erpLogo: "LG",
    eventType: "Stok Senkronizasyonu",
    status: "Başarılı",
    time: "27.05.2025 09:28"
  },
  {
    id: "2",
    erp: "SAP Business One",
    erpLogo: "SAP",
    eventType: "Fatura Aktarımı",
    status: "Hata",
    time: "27.05.2025 09:15"
  },
  {
    id: "3",
    erp: "NETSİS 3 Entegre",
    erpLogo: "NT",
    eventType: "Tahsilat Aktarımı",
    status: "Başarılı",
    time: "27.05.2025 08:52"
  },
  {
    id: "4",
    erp: "SAP Business One",
    erpLogo: "SAP",
    eventType: "Sipariş Senkronizasyonu",
    status: "Bekliyor",
    time: "27.05.2025 08:40"
  },
  {
    id: "5",
    erp: "LOGO Tiger 3",
    erpLogo: "LG",
    eventType: "Cari Aktarımı",
    status: "Başarılı",
    time: "27.05.2025 08:22"
  }
];

export const EEM_TABLE_TOTAL = "Toplam 1.246 kayıt";
export const EEM_PAGE_NUMBERS = ["1", "2", "3", "…", "125"];

export const EEM_CONNECTIONS: EemConnection[] = [
  {
    id: "1",
    name: "LOGO Tiger 3",
    online: true,
    endpoint: "https://api.logo.local/v3",
    responseMs: "320 ms",
    lastCheck: "27.05.2025 09:30"
  },
  {
    id: "2",
    name: "SAP Business One",
    online: true,
    endpoint: "https://sap.premium.local/b1",
    responseMs: "410 ms",
    lastCheck: "27.05.2025 09:30"
  },
  {
    id: "3",
    name: "NETSİS 3 Entegre",
    online: false,
    endpoint: "https://netsis.premium.local/api",
    lastCheck: "27.05.2025 08:45"
  }
];

export const EEM_HEALTH = [
  { label: "Entegrasyon Servisi", status: "Sağlıklı", tone: "green" },
  { label: "Kuyruk Servisi", status: "Sağlıklı", tone: "green" },
  { label: "Veritabanı", status: "Sağlıklı", tone: "green" },
  { label: "API Servisi", status: "Uyarı", tone: "orange" }
];

export function eemStatusClass(status: EemEventStatus): string {
  if (status === "Başarılı") return " eem-badge--ok";
  if (status === "Hata") return " eem-badge--err";
  return " eem-badge--wait";
}

