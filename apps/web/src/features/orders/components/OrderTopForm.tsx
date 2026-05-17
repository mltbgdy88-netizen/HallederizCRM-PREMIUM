import type { Customer, SaleOrder } from "@hallederiz/types";
import { getOrderChannelLabel } from "../queries/order-mock-data";

export function OrderTopForm({ order, customer }: { order: SaleOrder; customer: Customer | null }) {
  return (
    <section className="hz-content-card">
      <h3>Üst bilgi</h3>
      <div className="hz-filter-grid hz-margin-top-sm">
        <label>
          Müşteri
          <input readOnly value={customer?.name ?? order.customerId} />
        </label>
        <label>
          Teklif bağlantısı
          <input readOnly value={order.offerId ?? "—"} />
        </label>
        <label>
          Teslimat tipi
          <select defaultValue={order.deliveryType} disabled>
            <option value="warehouse">Depodan</option>
            <option value="factory">Fabrikadan</option>
            <option value="hybrid">Hibrit</option>
          </select>
        </label>
        <label>
          Sipariş kanalı
          <input readOnly value={getOrderChannelLabel(order.channel)} />
        </label>
        <label>
          Fiyat grubu özeti
          <input readOnly value={order.priceSlotLabelSnapshot} />
        </label>
        <label>
          Not
          <input defaultValue={order.note ?? ""} readOnly />
        </label>
      </div>
    </section>
  );
}
