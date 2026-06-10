export type CommandCenterPanelId = "alerts" | "tasks" | "flow" | "recent" | "quick";

export type CommandCenterPanelDef = {
  id: CommandCenterPanelId;
  title: string;
  description: string;
  category: "Üst bölüm" | "Orta bölüm" | "Alt bölüm";
};

export const COMMAND_CENTER_PANEL_STORAGE_KEY = "hz:dashboard:command-center-panels:v1";

export const COMMAND_CENTER_PANELS: CommandCenterPanelDef[] = [
  {
    id: "alerts",
    title: "Acil Durumlar & Uyarılar",
    description: "Vadesi geçen tahsilat, onay, stok ve teslimat uyarı şeridi.",
    category: "Üst bölüm"
  },
  {
    id: "tasks",
    title: "Bugünkü Görevlerim",
    description: "Günün görev listesi ve öncelik rozetleri.",
    category: "Orta bölüm"
  },
  {
    id: "flow",
    title: "Operasyon Akış Özeti",
    description: "Sipariş, sevkiyat, tahsilat, iade ve teklif özetleri.",
    category: "Orta bölüm"
  },
  {
    id: "recent",
    title: "Son İşlemler",
    description: "Son tahsilat, sipariş ve teklif hareketleri tablosu.",
    category: "Alt bölüm"
  },
  {
    id: "quick",
    title: "Hızlı İşlemler",
    description: "Sipariş, tahsilat, teklif ve cari kısayol şeridi.",
    category: "Alt bölüm"
  }
];

export const DEFAULT_COMMAND_CENTER_PANELS: CommandCenterPanelId[] = [
  "alerts",
  "tasks",
  "flow",
  "recent",
  "quick"
];

export function isCommandCenterPanelId(value: unknown): value is CommandCenterPanelId {
  return typeof value === "string" && COMMAND_CENTER_PANELS.some((panel) => panel.id === value);
}

export function loadCommandCenterPanels(): CommandCenterPanelId[] {
  if (typeof window === "undefined") return DEFAULT_COMMAND_CENTER_PANELS;
  try {
    const raw = window.localStorage.getItem(COMMAND_CENTER_PANEL_STORAGE_KEY);
    if (!raw) return DEFAULT_COMMAND_CENTER_PANELS;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_COMMAND_CENTER_PANELS;
    const valid = parsed.filter(isCommandCenterPanelId);
    return valid.length > 0 ? valid : DEFAULT_COMMAND_CENTER_PANELS;
  } catch {
    return DEFAULT_COMMAND_CENTER_PANELS;
  }
}

export function saveCommandCenterPanels(ids: CommandCenterPanelId[]): void {
  try {
    window.localStorage.setItem(COMMAND_CENTER_PANEL_STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // noop
  }
}

export function buildCommandCenterGridRows(visible: Record<CommandCenterPanelId, boolean>): string {
  const rows: string[] = [];
  if (visible.alerts) rows.push("minmax(52px, 58px)");
  if (visible.tasks || visible.flow) rows.push("minmax(0, 1.45fr)");
  if (visible.recent) rows.push("minmax(0, 1fr)");
  if (visible.quick) rows.push("auto");
  return rows.length > 0 ? rows.join(" ") : "minmax(0, 1fr)";
}

export function panelsToVisibility(ids: CommandCenterPanelId[]): Record<CommandCenterPanelId, boolean> {
  const set = new Set(ids);
  return {
    alerts: set.has("alerts"),
    tasks: set.has("tasks"),
    flow: set.has("flow"),
    recent: set.has("recent"),
    quick: set.has("quick")
  };
}

