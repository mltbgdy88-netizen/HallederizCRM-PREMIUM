import type { WarehouseOrderStatus, WarehouseTaskStatus } from "@hallederiz/types";
import { FilterActions, FilterBar, FilterGrid, FilterResetButton } from "@hallederiz/ui";
import type { WarehouseTaskFilters } from "../schemas/warehouse-filter-schema";

export function WarehouseTaskFilterBar({
  filters,
  onFilterChange,
  onReset
}: {
  filters: WarehouseTaskFilters;
  onFilterChange: <Key extends keyof WarehouseTaskFilters>(key: Key, value: WarehouseTaskFilters[Key]) => void;
  onReset: () => void;
}) {
  return (
    <FilterBar>
      <FilterGrid>
        <label>Depo<input value={filters.warehouse} onChange={(event) => onFilterChange("warehouse", event.target.value)} placeholder="Merkez Depo" /></label>
        <label>
          Görev durumu
          <select value={filters.status} onChange={(event) => onFilterChange("status", event.target.value as "all" | WarehouseOrderStatus | WarehouseTaskStatus)}>
            <option value="all">Tum durumlar</option>
            <option value="waiting">Bekliyor</option>
            <option value="picking">Toplaniyor</option>
            <option value="prepared">Hazirlandi</option>
            <option value="open">Acik gorev</option>
            <option value="done">Tamam</option>
            <option value="overdue">Gecikti</option>
          </select>
        </label>
        <label>Atanan Kisi<input value={filters.assignee} onChange={(event) => onFilterChange("assignee", event.target.value)} placeholder="Depocu adi" /></label>
        <label className="hz-toggle"><input type="checkbox" checked={filters.criticalOnly} onChange={(event) => onFilterChange("criticalOnly", event.target.checked)} />Kritik isler</label>
        <label className="hz-toggle"><input type="checkbox" checked={filters.readyOnly} onChange={(event) => onFilterChange("readyOnly", event.target.checked)} />Hazir olanlar</label>
        <label className="hz-toggle"><input type="checkbox" checked={filters.overdueOnly} onChange={(event) => onFilterChange("overdueOnly", event.target.checked)} />Gecikenler</label>
      </FilterGrid>
      <FilterActions>
        <button type="button" className="hz-btn hz-btn-secondary">
          Filtrele
        </button>
        <FilterResetButton onClick={onReset} label="Temizle" />
      </FilterActions>
    </FilterBar>
  );
}
