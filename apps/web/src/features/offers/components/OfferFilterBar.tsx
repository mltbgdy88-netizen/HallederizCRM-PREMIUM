// @ts-nocheck
import type { Customer, OfferStatus } from "@hallederiz/types";
import { LucideIcon } from "../../../components/icons/lucide-icons";
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
    <div className="hz-offers-filter-bar" role="search" aria-label="Teklif filtreleri">
      <label className="hz-offers-filter-field hz-offers-filter-field--search">
        <span className="hz-offers-filter-search-shell">
          <LucideIcon name="search" size={14} />
          <select value={filters.customerId} onChange={(event) => onFilterChange("customerId", event.target.value)}>
            <option value="">Teklif no, cari veya aÃ§Ä±klama ile ara</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>
        </span>
      </label>

      <label className="hz-offers-filter-field">
        <span>Durum</span>
        <select value={filters.status} onChange={(event) => onFilterChange("status", event.target.value as OfferStatus | "")}>
          <option value="">TÃ¼mÃ¼</option>
          <option value="draft">Taslak</option>
          <option value="sent">GÃ¶nderildi</option>
          <option value="waiting_response">Cevap Bekliyor</option>
          <option value="approved">OnaylandÄ±</option>
          <option value="rejected">Reddedildi</option>
          <option value="expired">SÃ¼resi Doldu</option>
          <option value="converted">SipariÅŸe DÃ¶nÃ¼ÅŸtÃ¼</option>
        </select>
      </label>

      <label className="hz-offers-filter-field">
        <span>GeÃ§erlilik</span>
        <select value={filters.dateRange} onChange={(event) => onFilterChange("dateRange", event.target.value as OfferFilters["dateRange"])}>
          <option value="all">TÃ¼mÃ¼</option>
          <option value="today">BugÃ¼n</option>
          <option value="week">Bu hafta</option>
          <option value="month">Bu ay</option>
        </select>
      </label>

      <label className="hz-offers-filter-field">
        <span>Temsilci</span>
        <select
          value={filters.followUpState}
          onChange={(event) => onFilterChange("followUpState", event.target.value as OfferFilters["followUpState"])}
        >
          <option value="all">TÃ¼mÃ¼</option>
          <option value="planned">Aktif temsilci</option>
          <option value="waiting">YanÄ±t bekleyenler</option>
          <option value="completed">Tamamlananlar</option>
        </select>
      </label>

      <label className="hz-offers-filter-field">
        <span>Fiyat Grubu</span>
        <select
          value={filters.convertedOnly ? "converted" : "all"}
          onChange={(event) => onFilterChange("convertedOnly", event.target.value === "converted")}
        >
          <option value="all">TÃ¼mÃ¼</option>
          <option value="converted">SÃ¶zleÅŸmeli</option>
        </select>
      </label>

      <button type="button" className="hz-offers-filter-reset" onClick={onReset} title="Filtreleri sÄ±fÄ±rla" aria-label="Filtreleri sÄ±fÄ±rla">
        <LucideIcon name="x" size={13} />
      </button>
    </div>
  );
}

