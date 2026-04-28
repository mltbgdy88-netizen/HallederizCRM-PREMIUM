import type { OrderChannel, OrderDeliveryStatus, OrderPaymentStatus, OrderSourcePreference, SaleOrderStatus } from "@hallederiz/types";
import { FilterBar } from "@hallederiz/ui";
import type { OrderFilters } from "../schemas/order-filter-schema";

export function OrderFilterBar({
  filters,
  onFilterChange,
  onReset
}: {
  filters: OrderFilters;
  onFilterChange: <Key extends keyof OrderFilters>(key: Key, value: OrderFilters[Key]) => void;
  onReset: () => void;
}) {
  return (
    <FilterBar>
      <div className="hz-filter-grid">
        <label>
          Musteri / Siparis
          <input value={filters.customer} onChange={(event) => onFilterChange("customer", event.target.value)} placeholder="SO-2481 veya cari adi" />
        </label>
        <label>
          Siparis Durumu
          <select value={filters.status} onChange={(event) => onFilterChange("status", event.target.value as "all" | SaleOrderStatus)}>
            <option value="all">Tum durumlar</option>
            <option value="draft">Taslak</option>
            <option value="confirmed">Onaylandi</option>
            <option value="waiting_stock">Stok Bekliyor</option>
            <option value="in_preparation">Hazirlaniyor</option>
            <option value="ready">Hazir</option>
            <option value="completed">Tamamlandi</option>
          </select>
        </label>
        <label>
          Odeme Durumu
          <select value={filters.paymentStatus} onChange={(event) => onFilterChange("paymentStatus", event.target.value as "all" | OrderPaymentStatus)}>
            <option value="all">Tum odemeler</option>
            <option value="unpaid">Odenmedi</option>
            <option value="partial">Kismi</option>
            <option value="paid">Odendi</option>
            <option value="overpaid">Fazla Odeme</option>
          </select>
        </label>
        <label>
          Teslim Durumu
          <select value={filters.deliveryStatus} onChange={(event) => onFilterChange("deliveryStatus", event.target.value as "all" | OrderDeliveryStatus)}>
            <option value="all">Tum teslimler</option>
            <option value="none">Baslamadi</option>
            <option value="preparing">Hazirlaniyor</option>
            <option value="ready">Hazir</option>
            <option value="partial">Kismi</option>
            <option value="delivered">Teslim</option>
          </select>
        </label>
        <label>
          Kanal
          <select value={filters.channel} onChange={(event) => onFilterChange("channel", event.target.value as "all" | OrderChannel)}>
            <option value="all">Tum kanallar</option>
            <option value="field">Saha</option>
            <option value="phone">Telefon</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="offer_conversion">Teklif Donusumu</option>
          </select>
        </label>
        <label>
          Kaynak Turu
          <select value={filters.sourceType} onChange={(event) => onFilterChange("sourceType", event.target.value as "all" | OrderSourcePreference)}>
            <option value="all">Tum kaynaklar</option>
            <option value="warehouse">Merkez</option>
            <option value="factory">Fabrika</option>
            <option value="split">Split</option>
            <option value="auto">Otomatik</option>
          </select>
        </label>
        <label className="hz-toggle">
          <input
            type="checkbox"
            checked={filters.openOperationsOnly}
            onChange={(event) => onFilterChange("openOperationsOnly", event.target.checked)}
          />
          Acik operasyonlar
        </label>
      </div>
      <div className="stock-filter-actions hz-margin-top-sm">
        <button type="button" className="hz-btn hz-btn-secondary hz-toolbar-btn" onClick={onReset}>
          Filtreleri Sifirla
        </button>
      </div>
    </FilterBar>
  );
}
