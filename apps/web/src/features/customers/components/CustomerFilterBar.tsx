import type { PriceSlotConfig } from "@hallederiz/types";
import type { CustomerFilters, CustomerWhatsappFilter } from "../schemas/customer-filter-schema";
import { IconRotateCcw } from "../../dashboard/components/dashboard-inline-icons";

export interface CustomerFilterBarProps {
  filters: CustomerFilters;
  cities: string[];
  priceSlots: PriceSlotConfig[];
  onFilterChange: <Key extends keyof CustomerFilters>(key: Key, value: CustomerFilters[Key]) => void;
  onReset: () => void;
}

export function CustomerFilterBar({ filters, cities, priceSlots, onFilterChange, onReset }: CustomerFilterBarProps) {
  return (
    <div className="hz-customers-filter-bar" role="search" aria-label="Cari filtreleri">
      <div className="hz-customers-filter-row hz-customers-filter-row--primary">
        <label className="hz-customers-filter-field hz-customers-filter-field--grow">
          <span className="hz-customers-filter-label">Ara</span>
          <input
            className="hz-customers-filter-input"
            value={filters.searchText}
            onChange={(event) => onFilterChange("searchText", event.target.value)}
            placeholder="Cari adı, kod, telefon veya vergi no"
          />
        </label>
        <label className="hz-customers-filter-field">
          <span className="hz-customers-filter-label">Şehir</span>
          <select className="hz-customers-filter-select" value={filters.city} onChange={(event) => onFilterChange("city", event.target.value)}>
            <option value="">Tümü</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </label>
        <label className="hz-customers-filter-field">
          <span className="hz-customers-filter-label">Fiyat grubu</span>
          <select
            className="hz-customers-filter-select"
            value={filters.priceSlotNo === "" ? "" : String(filters.priceSlotNo)}
            onChange={(event) =>
              onFilterChange(
                "priceSlotNo",
                event.target.value ? (Number(event.target.value) as CustomerFilters["priceSlotNo"]) : ""
              )
            }
          >
            <option value="">Tümü</option>
            {priceSlots.map((slot) => (
              <option key={slot.slotNumber} value={slot.slotNumber}>
                {slot.slotName}
              </option>
            ))}
          </select>
        </label>
        <label className="hz-customers-filter-field">
          <span className="hz-customers-filter-label">Risk</span>
          <select
            className="hz-customers-filter-select"
            value={filters.riskLevel}
            onChange={(event) => onFilterChange("riskLevel", event.target.value as CustomerFilters["riskLevel"])}
          >
            <option value="">Tümü</option>
            <option value="low">Düşük</option>
            <option value="medium">Orta</option>
            <option value="high">Yüksek</option>
            <option value="blocked">Blokeli</option>
          </select>
        </label>
        <label className="hz-customers-filter-field">
          <span className="hz-customers-filter-label">WhatsApp</span>
          <select
            className="hz-customers-filter-select"
            value={filters.whatsappMatch}
            onChange={(event) => onFilterChange("whatsappMatch", event.target.value as CustomerWhatsappFilter)}
          >
            <option value="all">Tümü</option>
            <option value="matched">Eşleşti</option>
            <option value="unmatched">Eşleşmedi</option>
          </select>
        </label>
        <button type="button" className="hz-customers-filter-reset" onClick={onReset} title="Filtreleri sıfırla" aria-label="Filtreleri sıfırla">
          <IconRotateCcw size={14} />
          Sıfırla
        </button>
      </div>
    </div>
  );
}
