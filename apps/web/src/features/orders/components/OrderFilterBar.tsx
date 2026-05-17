import type { OrderChannel, OrderDeliveryStatus, OrderPaymentStatus, OrderSourcePreference, SaleOrderStatus } from "@hallederiz/types";
import { FilterActions, FilterBar, FilterGrid, FilterResetButton } from "@hallederiz/ui";
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
      <FilterGrid>
        <label>
          Müşteri / Sipariş
          <input value={filters.customer} onChange={(event) => onFilterChange("customer", event.target.value)} placeholder="SO-2481 veya cari adı" />
        </label>
        <label>
          Sipariş Durumu
          <select value={filters.status} onChange={(event) => onFilterChange("status", event.target.value as "all" | SaleOrderStatus)}>
            <option value="all">Tüm durumlar</option>
            <option value="draft">Taslak</option>
            <option value="confirmed">Onaylandı</option>
            <option value="waiting_stock">Stok Bekliyor</option>
            <option value="in_preparation">Hazırlanıyor</option>
            <option value="ready">Hazır</option>
            <option value="completed">Tamamlandı</option>
          </select>
        </label>
        <label>
          Ödeme Durumu
          <select value={filters.paymentStatus} onChange={(event) => onFilterChange("paymentStatus", event.target.value as "all" | OrderPaymentStatus)}>
            <option value="all">Tüm ödemeler</option>
            <option value="unpaid">Ödenmedi</option>
            <option value="partial">Kısmi</option>
            <option value="paid">Ödendi</option>
            <option value="overpaid">Fazla Ödeme</option>
          </select>
        </label>
        <label>
          Teslim Durumu
          <select value={filters.deliveryStatus} onChange={(event) => onFilterChange("deliveryStatus", event.target.value as "all" | OrderDeliveryStatus)}>
            <option value="all">Tüm teslimler</option>
            <option value="none">Başlamadı</option>
            <option value="preparing">Hazırlanıyor</option>
            <option value="ready">Hazır</option>
            <option value="partial">Kısmi</option>
            <option value="delivered">Teslim</option>
          </select>
        </label>
        <label>
          Kanal
          <select value={filters.channel} onChange={(event) => onFilterChange("channel", event.target.value as "all" | OrderChannel)}>
            <option value="all">Tüm kanallar</option>
            <option value="field">Saha</option>
            <option value="phone">Telefon</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="offer_conversion">Teklif Dönüşümü</option>
          </select>
        </label>
        <label>
          Kaynak Türü
          <select value={filters.sourceType} onChange={(event) => onFilterChange("sourceType", event.target.value as "all" | OrderSourcePreference)}>
            <option value="all">Tüm kaynaklar</option>
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
          Açık operasyonlar
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
