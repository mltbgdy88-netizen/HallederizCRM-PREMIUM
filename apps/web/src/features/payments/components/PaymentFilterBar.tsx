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
          Müşteri / fiş
          <input value={filters.customer} onChange={(event) => onFilterChange("customer", event.target.value)} placeholder="PAY-930 veya cari adı" />
        </label>
        <label>
          Yöntem
          <select value={filters.method} onChange={(event) => onFilterChange("method", event.target.value as "all" | PaymentMethod)}>
            <option value="all">Tüm yöntemler</option>
            <option value="cash">Nakit</option>
            <option value="card">Kart</option>
            <option value="transfer">Havale/EFT</option>
            <option value="check">Çek</option>
            <option value="mixed">Karma</option>
          </select>
        </label>
        <label>
          Durum
          <select value={filters.status} onChange={(event) => onFilterChange("status", event.target.value as "all" | PaymentStatus)}>
            <option value="all">Tüm durumlar</option>
            <option value="draft">Taslak</option>
            <option value="confirmed">Doğrulandı</option>
            <option value="partially_allocated">Kısmi tahsis</option>
            <option value="allocated">Dağıtıldı</option>
            <option value="reversed">Ters kayıt</option>
          </select>
        </label>
        <label>
          Tarih aralığı
          <select value={filters.dateRange} onChange={(event) => onFilterChange("dateRange", event.target.value as PaymentFilters["dateRange"])}>
            <option value="all">Tüm tarihler</option>
            <option value="today">Bugün</option>
            <option value="week">Bu hafta</option>
            <option value="month">Bu ay</option>
          </select>
        </label>
        <label>
          Belge tipi
          <select value={filters.documentType} onChange={(event) => onFilterChange("documentType", event.target.value as PaymentFilters["documentType"])}>
            <option value="all">Tüm belgeler</option>
            <option value="order">Sipariş</option>
            <option value="invoice">Fatura</option>
            <option value="open_account">Açık hesap</option>
          </select>
        </label>
        <label className="hz-toggle">
          <input type="checkbox" checked={filters.openOnly} onChange={(event) => onFilterChange("openOnly", event.target.checked)} />
          Açık tahsilatlar
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
