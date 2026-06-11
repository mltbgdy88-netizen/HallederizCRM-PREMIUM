/** API ve teknik ham değerlerin kullanıcıya görünen Türkçe karşılıkları. */

const STATUS_LABELS: Record<string, string> = {
  pending: "Bekliyor",
  draft: "Taslak",
  approved: "Onaylandı",
  rejected: "Reddedildi",
  completed: "Tamamlandı",
  failed: "Başarısız",
  success: "Başarılı",
  warning: "Uyarı",
  error: "Hata",
  active: "Aktif",
  inactive: "Pasif",
  enabled: "Etkin",
  disabled: "Devre dışı",
  running: "Çalışıyor",
  paused: "Duraklatıldı",
  queued: "Kuyrukta",
  processing: "İşleniyor",
  done: "Tamamlandı",
  cancelled: "İptal edildi",
  canceled: "İptal edildi",
  manual: "Manuel",
  automatic: "Otomatik",
  system: "Sistem",
  demo: "Örnek veri",
  live: "Canlı",
  mock: "Örnek veri",
  fallback: "Yedek görünüm",
  readiness: "Hazırlık durumu",
  import: "İçe aktarma",
  export: "Dışa aktar",
  applied: "Uygulandı",
  ready: "Hazır",
  degraded: "Kısmi sorun var",
  blocked: "Engellendi",
  healthy: "Sağlıklı",
  unhealthy: "Sağlıksız",
  misconfigured: "Yapılandırma eksik",
  valid: "Geçerli",
  preview: "Önizleme",
  foundation: "Temel mod",
  tamam: "Tamam",
  eksik: "Eksik",
  uyari: "Uyarı",
  critical: "Kritik",
  info: "Bilgi",
  waiting: "Bekliyor",
  waiting_approval: "Onay bekliyor",
  superseded: "Geçersiz kılındı",
  executed: "Yürütüldü",
  expired: "Süresi doldu",
  not_configured: "Yapılandırılmadı",
  passive: "Pasif",
  ok: "Tamam",
  fail: "Başarısız",
  skipped: "Atlandı",
  neutral: "Bekleyen",
  partial: "Kısmi",
  overdue: "Gecikmiş",
  in_progress: "Devam ediyor",
  open: "Açık",
  picking: "Toplanıyor",
  prepared: "Hazırlandı",
  not_tested: "Test edilmedi"
};

const HEALTH_STATUS_LABELS: Record<string, string> = {
  healthy: "Sağlıklı",
  degraded: "Kısmi sorun var",
  not_configured: "Yapılandırılmadı",
  blocked: "Engellendi",
  unhealthy: "Sağlıksız",
  misconfigured: "Yapılandırma eksik",
  fallback: "Yedek görünüm",
  error: "Hata"
};

const MODE_LABELS: Record<string, string> = {
  foundation: "Temel mod",
  memory: "Bellek",
  postgres: "PostgreSQL",
  postgresql: "PostgreSQL",
  "db-backed": "Veritabanı destekli",
  durable: "Kalıcı",
  inline: "Satır içi",
  dispatcher: "Dağıtıcı",
  worker: "Çalışan servis",
  transactional: "İşlemsel",
  "safe-mode": "Güvenli mod",
  safemode: "Güvenli mod"
};

const ENV_LABELS: Record<string, string> = {
  production: "Canlı ortam",
  staging: "Hazırlık ortamı",
  development: "Geliştirme ortamı",
  test: "Test ortamı"
};

const TYPE_LABELS: Record<string, string> = {
  customers: "Cariler",
  products: "Ürünler",
  pricing: "Fiyatlar",
  warehouses: "Depolar",
  "stock-locations": "Stok / Lokasyon",
  stock: "Stok",
  payments: "Tahsilatlar",
  orders: "Siparişler",
  offers: "Teklifler",
  documents: "Belgeler",
  users: "Kullanıcılar",
  roles: "Roller",
  customer: "Cari",
  product: "Ürün",
  price: "Fiyat",
  payment: "Tahsilat",
  order: "Sipariş",
  invoice: "Fatura"
};

const SERVICE_NAME_LABELS: Record<string, string> = {
  ai: "Yapay Zekâ",
  whatsapp: "WhatsApp",
  database: "Veritabanı",
  storage: "Depolama",
  worker: "Çalışan servis",
  api: "API",
  erp: "ERP",
  factory: "Fabrika",
  "local-agent": "Yerel araç"
};

const READINESS_STATE_LABELS: Record<string, string> = {
  "go-live-blocker": "Canlıya geçiş engeli",
  go_live_blocker: "Canlıya geçiş engeli",
  "demo-gap": "Örnek veri boşluğu",
  demo_gap: "Örnek veri boşluğu",
  warning: "Uyarı",
  ready: "Hazır"
};

function normalizeKey(value: string): string {
  return value.trim().toLowerCase();
}

function lookup(map: Record<string, string>, value: string, fallback: string): string {
  const key = normalizeKey(value);
  if (map[key]) return map[key];
  const dashed = key.replace(/_/g, "-");
  if (map[dashed]) return map[dashed];
  return fallback;
}

export function formatUserFacingStatus(value: string | null | undefined, fallback = "Bilinmeyen durum"): string {
  if (value == null || value === "") return "—";
  return lookup(STATUS_LABELS, value, fallback);
}

export function formatUserFacingMode(value: string | null | undefined, fallback = "Tanımsız mod"): string {
  if (value == null || value === "") return "—";
  const key = normalizeKey(value);
  return MODE_LABELS[key] ?? STATUS_LABELS[key] ?? lookup(MODE_LABELS, value, lookup(STATUS_LABELS, value, fallback));
}

export function formatUserFacingEnvironment(value: string | null | undefined): string {
  if (value == null || value === "") return "—";
  return lookup(ENV_LABELS, value, lookup(STATUS_LABELS, value, "Tanımsız ortam"));
}

export function formatUserFacingType(value: string | null | undefined): string {
  if (value == null || value === "") return "—";
  const key = normalizeKey(value);
  return TYPE_LABELS[key] ?? TYPE_LABELS[key.replace(/_/g, "-")] ?? formatUserFacingStatus(value, "Tanımsız tür");
}

export function formatUserFacingServiceName(value: string | null | undefined): string {
  if (value == null || value === "") return "—";
  const key = normalizeKey(value);
  return SERVICE_NAME_LABELS[key] ?? SERVICE_NAME_LABELS[key.replace(/_/g, "-")] ?? value;
}

export function formatUserFacingReadinessState(value: string | null | undefined): string {
  if (value == null || value === "") return "—";
  return lookup(READINESS_STATE_LABELS, value, formatUserFacingStatus(value, "Tanımsız hazırlık durumu"));
}

export function formatUserFacingHealthStatus(value: string | null | undefined): string {
  if (value == null || value === "") return "—";
  const key = normalizeKey(value);
  return HEALTH_STATUS_LABELS[key] ?? lookup(HEALTH_STATUS_LABELS, value, formatUserFacingStatus(value, "Bilinmeyen sağlık durumu"));
}

export function formatUserFacingBoolean(value: boolean): string {
  return value ? "Evet" : "Hayır";
}

export function formatYesNo(value: boolean): string {
  return formatUserFacingBoolean(value);
}

export function formatProductionOverallStatus(value: "ready" | "degraded" | "blocked"): string {
  if (value === "ready") return "Hazır";
  if (value === "degraded") return "Eksik";
  return "Bloklu";
}
