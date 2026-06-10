// @ts-nocheck
export type KumKpiTone = "green" | "teal" | "gold" | "blue" | "slate";

export type KumKpi = { id: string; label: string; value: string; tone: KumKpiTone };

export type KumRole = "Yönetici" | "Operasyon Müdürü" | "Satış Temsilcisi" | "Depo Sorumlusu" | "Muhasebe";

export type KumStatus = "Aktif" | "Pasif";

export type KumTableRow = {
  id: string;
  name: string;
  email: string;
  role: KumRole;
  lastLogin: string;
  status: KumStatus;
};

export const KUM_TITLE = "Kullanıcılar";
export const KUM_SUBTITLE =
  "Sisteme erişimi olan kullanıcıları yönetin, rollerini ve yetkilerini düzenleyin.";

export const KUM_KPIS: KumKpi[] = [
  { id: "total", label: "Toplam Kullanıcı", value: "24", tone: "green" },
  { id: "active", label: "Aktif Kullanıcı", value: "5", tone: "teal" },
  { id: "admin", label: "Yönetici", value: "4", tone: "gold" },
  { id: "standard", label: "Standart Kullanıcı", value: "18", tone: "blue" },
  { id: "passive", label: "Pasif Kullanıcı", value: "1", tone: "slate" }
];

export const KUM_FILTER_SEARCH = "Kullanıcı ara (ad, e-posta, rol)...";

export const KUM_FILTERS = [
  { id: "role", label: "Rol", options: [{ label: "Tümü", value: "all" }] },
  { id: "status", label: "Durum", options: [{ label: "Tümü", value: "all" }] }
];

export const KUM_TABLE_ROWS: KumTableRow[] = [
  {
    id: "1",
    name: "Yusuf Kaya",
    email: "yusuf.kaya@premiumcrm.com",
    role: "Yönetici",
    lastLogin: "23.05.2025 14:35",
    status: "Aktif"
  },
  {
    id: "2",
    name: "Ali Yılmaz",
    email: "ali.yilmaz@premiumcrm.com",
    role: "Operasyon Müdürü",
    lastLogin: "23.05.2025 11:20",
    status: "Aktif"
  },
  {
    id: "3",
    name: "Ayşe Demir",
    email: "ayse.demir@premiumcrm.com",
    role: "Satış Temsilcisi",
    lastLogin: "22.05.2025 16:45",
    status: "Aktif"
  },
  {
    id: "4",
    name: "Mehmet Yılmaz",
    email: "mehmet.yilmaz@premiumcrm.com",
    role: "Depo Sorumlusu",
    lastLogin: "22.05.2025 09:30",
    status: "Aktif"
  },
  {
    id: "5",
    name: "Can Öztürk",
    email: "can.ozturk@premiumcrm.com",
    role: "Muhasebe",
    lastLogin: "21.05.2025 15:10",
    status: "Aktif"
  },
  {
    id: "6",
    name: "Dilara �?en",
    email: "dilara.sen@premiumcrm.com",
    role: "Satış Temsilcisi",
    lastLogin: "20.05.2025 14:22",
    status: "Aktif"
  },
  {
    id: "7",
    name: "Mehmet Demir",
    email: "mehmet.demir@premiumcrm.com",
    role: "Depo Sorumlusu",
    lastLogin: "19.05.2025 10:05",
    status: "Aktif"
  },
  {
    id: "8",
    name: "Ayşe Yılmaz",
    email: "ayse.yilmaz@premiumcrm.com",
    role: "Satış Temsilcisi",
    lastLogin: "18.05.2025 13:40",
    status: "Aktif"
  },
  {
    id: "9",
    name: "Burcu Güneş",
    email: "burcu.gunes@premiumcrm.com",
    role: "Muhasebe",
    lastLogin: "12.05.2025 08:15",
    status: "Pasif"
  },
  {
    id: "10",
    name: "Zeynep Arslan",
    email: "zeynep.arslan@premiumcrm.com",
    role: "Satış Temsilcisi",
    lastLogin: "17.05.2025 16:55",
    status: "Aktif"
  }
];

export const KUM_TABLE_TOTAL = "Toplam 24 kayıt";
export const KUM_PAGE_NUMBERS = ["1", "2", "3"];

export function getKumContext(selectedId: string) {
  const row = KUM_TABLE_ROWS.find((r) => r.id === selectedId) ?? KUM_TABLE_ROWS[0];
  return {
    name: row.name,
    email: row.email,
    status: row.status,
    role: row.role,
    department: row.role === "Yönetici" ? "Yönetim" : "Operasyon",
    lastLogin: row.id === "1" ? "23.05.2025 14:35" : row.lastLogin,
    created: row.id === "1" ? "10.01.2025 09:15" : "15.01.2025 10:30",
    permissions: [
      { label: "Toplam Modül", value: "28" },
      { label: "Toplam Yetki", value: "156" },
      { label: "Tam Erişim", value: "120" },
      { label: "Kısmi Erişim", value: "28" },
      { label: "Salt Okunur", value: "8" },
      { label: "Erişim Yok", value: "0" }
    ],
    rolePerms: [
      "Tüm modüllere tam erişim",
      "Kullanıcı ve rol yönetimi",
      "Sistem ayarları düzenleme",
      "Onay kuralları yönetimi",
      "Entegrasyon ayarları"
    ]
  };
}

export function kumRoleClass(role: KumRole): string {
  if (role === "Yönetici") return " kum-badge--admin";
  if (role === "Operasyon Müdürü") return " kum-badge--ops";
  return " kum-badge--std";
}

