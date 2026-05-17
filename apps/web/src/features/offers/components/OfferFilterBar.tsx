import type { Customer, OfferStatus } from "@hallederiz/types";
import { FilterActions, FilterBar, FilterGrid, FilterResetButton } from "@hallederiz/ui";
import type { OfferFilters } from "../schemas/offer-filter-schema";

export function OfferFilterBar({
  filters,
  customers,
  onFilterChange,
  onReset
}: {
  filters: OfferFilters;
  customers: Customer[];
  onFilterChange: <Key extends keyof OfferFilters>(key: Key, value: OfferFilters[Key]) => void;
  onReset: () => void;
}) {
  return (
    <FilterBar>
      <FilterGrid>
        <label>
          Müşteri
          <select value={filters.customerId} onChange={(event) => onFilterChange("customerId", event.target.value)}>
            <option value="">Tüm müşteriler</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Durum
          <select value={filters.status} onChange={(event) => onFilterChange("status", event.target.value as OfferStatus | "")}>
            <option value="">Tüm durumlar</option>
            <option value="draft">Taslak</option>
            <option value="sent">Gönderildi</option>
            <option value="waiting_response">Cevap Bekliyor</option>
            <option value="approved">Onaylandı</option>
            <option value="rejected">Reddedildi</option>
            <option value="expired">Süresi Doldu</option>
            <option value="converted">Siparişe Dönüştü</option>
          </select>
        </label>

        <label>
          Tarih Aralığı
          <select value={filters.dateRange} onChange={(event) => onFilterChange("dateRange", event.target.value as OfferFilters["dateRange"])}>
            <option value="all">Tüm tarihler</option>
            <option value="today">Bugün</option>
            <option value="week">Bu hafta</option>
            <option value="month">Bu ay</option>
          </select>
        </label>

        <label>
          Follow-up Durumu
          <select
            value={filters.followUpState}
            onChange={(event) => onFilterChange("followUpState", event.target.value as OfferFilters["followUpState"])}
          >
            <option value="all">Tüm follow-up</option>
            <option value="planned">Planlı</option>
            <option value="waiting">Cevap bekliyor</option>
            <option value="completed">Tamamlandı</option>
          </select>
        </label>

        <label className="hz-toggle">
          <input
            type="checkbox"
            checked={filters.convertedOnly}
            onChange={(event) => onFilterChange("convertedOnly", event.target.checked)}
          />
          Satışa dönüşenler
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
