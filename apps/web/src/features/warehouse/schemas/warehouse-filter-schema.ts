import type { WarehouseOrderStatus, WarehouseTaskStatus } from "@hallederiz/types";

export interface WarehouseTaskFilters {
  warehouse: string;
  status: "all" | WarehouseOrderStatus | WarehouseTaskStatus;
  assignee: string;
  criticalOnly: boolean;
  readyOnly: boolean;
  overdueOnly: boolean;
}

export const defaultWarehouseTaskFilters: WarehouseTaskFilters = {
  warehouse: "",
  status: "all",
  assignee: "",
  criticalOnly: false,
  readyOnly: false,
  overdueOnly: false
};
