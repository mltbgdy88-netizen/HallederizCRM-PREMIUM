import type { PriceSlotConfig } from "@hallederiz/types";
import type { CustomerFilters } from "../schemas/customer-filter-schema";

export interface CustomerFilterBarProps {
  filters: CustomerFilters;
  cities: string[];
  priceSlots: PriceSlotConfig[];
  onFilterChange: <Key extends keyof CustomerFilters>(key: Key, value: CustomerFilters[Key]) => void;
  onReset: () => void;
}

export function CustomerFilterBar({ filters, cities, priceSlots, onFilterChange, onReset }: CustomerFilterBarProps) {
  return (
    <section className="hz-filter-card">
      <div className="hz-filter-grid">
        <label>
          Arama
          <input
            value={filters.searchText}
            onChange={(event) => onFilterChange("searchText", event.target.value)}
            placeholder="Cari kodu, ad, telefon veya yetkili"
          />
        </label>

        <label>
          Musteri Tipi
          <select
            value={filters.customerType}
            onChange={(event) => onFilterChange("customerType", event.target.value as CustomerFilters["customerType"])}
          >
            <option value="">Tum tipler</option>
            <option value="bayi">Bayi</option>
            <option value="perakende">Perakende</option>
            <option value="mimar">Mimar</option>
            <option value="usta">Usta</option>
            <option value="kurumsal">Kurumsal</option>
            <option value="ozel">Ozel</option>
          </select>
        </label>

        <label>
          Sehir
          <select value={filters.city} onChange={(event) => onFilterChange("city", event.target.value)}>
            <option value="">Tum sehirler</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </label>

        <label>
          Risk Seviyesi
          <select
            value={filters.riskLevel}
            onChange={(event) => onFilterChange("riskLevel", event.target.value as CustomerFilters["riskLevel"])}
          >
            <option value="">Tum riskler</option>
            <option value="low">Dusuk</option>
            <option value="medium">Orta</option>
            <option value="high">Yuksek</option>
            <option value="blocked">Blokeli</option>
          </select>
        </label>

        <label>
          Bakiye Durumu
          <select
            value={filters.balanceState}
            onChange={(event) => onFilterChange("balanceState", event.target.value as CustomerFilters["balanceState"])}
          >
            <option value="all">Tum bakiyeler</option>
            <option value="open_balance">Acik bakiye</option>
            <option value="credit">Alacakli</option>
            <option value="zero">Sifir bakiye</option>
          </select>
        </label>

        <label>
          Durum
          <select
            value={filters.activeState}
            onChange={(event) => onFilterChange("activeState", event.target.value as CustomerFilters["activeState"])}
          >
            <option value="all">Tum durumlar</option>
            <option value="active">Aktif</option>
            <option value="inactive">Pasif</option>
          </select>
        </label>

        <label>
          Fiyat Grubu
          <select
            value={filters.priceSlotNo}
            onChange={(event) =>
              onFilterChange(
                "priceSlotNo",
                event.target.value ? (Number(event.target.value) as CustomerFilters["priceSlotNo"]) : ""
              )
            }
          >
            <option value="">Tum gruplar</option>
            {priceSlots.map((slot) => (
              <option key={slot.slotNumber} value={slot.slotNumber}>
                {slot.slotName}
              </option>
            ))}
          </select>
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
