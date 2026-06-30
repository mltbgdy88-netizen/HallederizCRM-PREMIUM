export type SettingsAreaRouteMeta = {
  section: string;
};

export const SETTINGS_AREA_ROUTE_META: Record<string, SettingsAreaRouteMeta> = {
  "/ayarlar/genel": { section: "Genel" },
  "/ayarlar/duyuru-videolari": { section: "Duyuru Videoları" },
  "/ayarlar/veri-yukleme": { section: "Veri yükleme" },
  "/ayarlar/staging-kontrol": { section: "Hazırlık kontrolü" },
  "/ayarlar/kullanim-hazirligi": { section: "Kullanım hazırlığı" },
  "/ayarlar/operasyon-gozlem": { section: "Operasyon ve gözlem" },
  "/ayarlar/canli-kullanim-hazirligi": { section: "Canlıya hazırlık" }
};

export function resolveSettingsAreaSection(pathname: string): string | null {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  return SETTINGS_AREA_ROUTE_META[normalized]?.section ?? null;
}
