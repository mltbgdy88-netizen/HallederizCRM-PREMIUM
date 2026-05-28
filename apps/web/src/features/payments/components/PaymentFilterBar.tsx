import type { PaymentMethod, PaymentStatus } from "@hallederiz/types";
import { LucideIcon } from "../../../components/icons/lucide-icons";
import type { CustomerGroupFilter, PaymentFilters } from "../schemas/payment-filter-schema";

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
    <div className="hz-tahsilatlar-filterbar">
      <div className="hz-tahsilatlar-search-wrap">
        <LucideIcon name="search" size={14} />
        <input
          className="hz-tahsilatlar-search"
          type="search"
          value={filters.customer}
          onChange={(e) => onFilterChange("customer", e.target.value)}
          placeholder="Cari, tahsilat no veya açıklama ara..."
          aria-label="Ara"
        />
      </div>

      <select
        className="hz-tahsilatlar-filter-select"
        value={filters.method}
        onChange={(e) => onFilterChange("method", e.target.value as "all" | PaymentMethod)}
        aria-label="Yöntem"
      >
        <option value="all">Yöntem (Tümü)</option>
        <option value="cash">Nakit</option>
        <option value="card">Kredi Kartı</option>
        <option value="transfer">Havale</option>
        <option value="check">Çek</option>
        <option value="mixed">Karma</option>
      </select>

      <select
        className="hz-tahsilatlar-filter-select"
        value={filters.dateRange}
        onChange={(e) => onFilterChange("dateRange", e.target.value as PaymentFilters["dateRange"])}
        aria-label="Tarih Aralığı"
      >
        <option value="all">Tarih (Tümü)</option>
        <option value="today">Bugün</option>
        <option value="week">Son 7 Gün</option>
        <option value="month">Bu Ay</option>
      </select>

      <select
        className="hz-tahsilatlar-filter-select"
        value={filters.customerGroup}
        onChange={(e) => onFilterChange("customerGroup", e.target.value as CustomerGroupFilter)}
        aria-label="Cari Grubu"
      >
        <option value="all">Cari Grubu (Tümü)</option>
        <option value="bayi">Bayi</option>
        <option value="kurumsal">Kurumsal</option>
        <option value="mimar">Mimar</option>
        <option value="perakende">Perakende</option>
      </select>

      <select
        className="hz-tahsilatlar-filter-select"
        value={filters.status}
        onChange={(e) => onFilterChange("status", e.target.value as "all" | PaymentStatus)}
        aria-label="Durum"
      >
        <option value="all">Durum (Tümü)</option>
        <option value="allocated">Tahsil Edildi</option>
        <option value="partially_allocated">Kısmi</option>
        <option value="confirmed">Bekliyor</option>
        <option value="draft">Taslak</option>
        <option value="reversed">Ters Kayıt</option>
      </select>

      <button
        type="button"
        className="hz-tahsilatlar-filter-reset"
        onClick={onReset}
        title="Filtreleri sıfırla"
        aria-label="Filtreleri sıfırla"
      >
        <LucideIcon name="rotate-ccw" size={14} />
      </button>
    </div>
  );
}
