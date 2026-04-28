import type { PaymentMethod, PaymentStatus } from "@hallederiz/types";
import { FilterActions, FilterBar, FilterGrid, FilterResetButton } from "@hallederiz/ui";
import type { PaymentFilters } from "../schemas/payment-filter-schema";

export function PaymentFilterBar({
  filters,
  onFilterChange,
  onReset
}: {
  filters: PaymentFilters;
  onFilterChange: <Key extends keyof PaymentFilters>(key: Key, value: PaymentFilters[Key]) => void;
  onReset: () => void;
}) {
  return (
    <FilterBar>
      <FilterGrid>
        <label>
          Musteri / Fis
          <input value={filters.customer} onChange={(event) => onFilterChange("customer", event.target.value)} placeholder="PAY-930 veya cari adi" />
        </label>
        <label>
          Yontem
          <select value={filters.method} onChange={(event) => onFilterChange("method", event.target.value as "all" | PaymentMethod)}>
            <option value="all">Tum yontemler</option>
            <option value="cash">Nakit</option>
            <option value="card">Kart</option>
            <option value="transfer">Havale/EFT</option>
            <option value="check">Cek</option>
            <option value="mixed">Karma</option>
          </select>
        </label>
        <label>
          Durum
          <select value={filters.status} onChange={(event) => onFilterChange("status", event.target.value as "all" | PaymentStatus)}>
            <option value="all">Tum durumlar</option>
            <option value="draft">Taslak</option>
            <option value="confirmed">Dogrulandi</option>
            <option value="partially_allocated">Kismi Dagitim</option>
            <option value="allocated">Dagitildi</option>
            <option value="reversed">Ters Kayit</option>
          </select>
        </label>
        <label>
          Tarih Araligi
          <select value={filters.dateRange} onChange={(event) => onFilterChange("dateRange", event.target.value as PaymentFilters["dateRange"])}>
            <option value="all">Tum tarihler</option>
            <option value="today">Bugun</option>
            <option value="week">Bu hafta</option>
            <option value="month">Bu ay</option>
          </select>
        </label>
        <label>
          Belge Tipi
          <select value={filters.documentType} onChange={(event) => onFilterChange("documentType", event.target.value as PaymentFilters["documentType"])}>
            <option value="all">Tum belgeler</option>
            <option value="order">Siparis</option>
            <option value="invoice">Fatura</option>
            <option value="open_account">Acik Hesap</option>
          </select>
        </label>
        <label className="hz-toggle">
          <input type="checkbox" checked={filters.openOnly} onChange={(event) => onFilterChange("openOnly", event.target.checked)} />
          Acik tahsilatlar
        </label>
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
