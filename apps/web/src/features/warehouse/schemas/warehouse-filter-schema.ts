import type { WarehouseOrderStatus, WarehouseTaskStatus } from "@hallederiz/types";

export type WarehousePrepListTab = "bekleyenler" | "hazirlananlar" | "eksikler" | "tumu";

/** Filtre satırı durum seçimi; chip sekmeleriyle birlikte AND uygulanır. */
export type WarehousePrepDisplayFilter = "all" | "beklemede" | "hazirlandi" | "eksik";

export interface WarehouseTaskFilters {
  warehouse: string;
  /** Belge no, sipariş no veya cari adı araması */
  documentQuery: string;
  status: "all" | WarehouseOrderStatus | WarehouseTaskStatus;
  assignee: string;
  criticalOnly: boolean;
  readyOnly: boolean;
  overdueOnly: boolean;
  prepTab: WarehousePrepListTab;
  prepDisplayFilter: WarehousePrepDisplayFilter;
  datePreset: "all" | "today";
}

export const defaultWarehouseTaskFilters: WarehouseTaskFilters = {
  warehouse: "",
  documentQuery: "",
  status: "all",
  assignee: "",
  criticalOnly: false,
  readyOnly: false,
  overdueOnly: false,
  prepTab: "bekleyenler",
  prepDisplayFilter: "all",
  datePreset: "all"
};

