import type { Customer, OfferStatus } from "@hallederiz/types";
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
    <section className="hz-filter-card">
      <div className="hz-filter-grid">
        <label>
          Musteri
          <select value={filters.customerId} onChange={(event) => onFilterChange("customerId", event.target.value)}>
            <option value="">Tum musteriler</option>
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
            <option value="">Tum durumlar</option>
            <option value="draft">Taslak</option>
            <option value="sent">Gonderildi</option>
            <option value="waiting_response">Cevap Bekliyor</option>
            <option value="approved">Onaylandi</option>
            <option value="rejected">Reddedildi</option>
            <option value="expired">Suresi Doldu</option>
            <option value="converted">Siparise Donustu</option>
          </select>
        </label>

        <label>
          Tarih Araligi
          <select value={filters.dateRange} onChange={(event) => onFilterChange("dateRange", event.target.value as OfferFilters["dateRange"])}>
            <option value="all">Tum tarihler</option>
            <option value="today">Bugun</option>
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
            <option value="all">Tum follow-up</option>
            <option value="planned">Planli</option>
            <option value="waiting">Cevap bekliyor</option>
            <option value="completed">Tamamlandi</option>
          </select>
        </label>

        <label className="hz-toggle">
          <input
            type="checkbox"
            checked={filters.convertedOnly}
            onChange={(event) => onFilterChange("convertedOnly", event.target.checked)}
          />
          Satisa donusenler
        </label>
      </div>

      <div className="stock-filter-actions">
        <button type="button" className="reset-btn" onClick={onReset}>
          Filtreleri Temizle
        </button>
      </div>
    </section>
  );
}
