import type { Customer, SaleOrder } from "@hallederiz/types";
import { getOrderChannelLabel } from "../queries/order-mock-data";

export function OrderTopForm({ order, customer }: { order: SaleOrder; customer: Customer | null }) {
  return (
    <section className="hz-content-card">
      <h3>Ust Bilgi</h3>
      <div className="hz-filter-grid hz-margin-top-sm">
        <label>
          Musteri
          <input readOnly value={customer?.name ?? order.customerId} />
        </label>
        <label>
          Teklif Baglantisi
          <input readOnly value={order.offerId ?? "Yok"} />
        </label>
        <label>
          Teslimat Tipi
          <select defaultValue={order.deliveryType}>
            <option value="warehouse">Depodan</option>
            <option value="factory">Fabrikadan</option>
            <option value="hybrid">Hibrit</option>
          </select>
        </label>
        <label>
          Siparis Kanali
          <input readOnly value={getOrderChannelLabel(order.channel)} />
        </label>
        <label>
          Fiyat Grubu Snapshot
          <input readOnly value={order.priceSlotLabelSnapshot} />
        </label>
        <label>
          Not
          <input defaultValue={order.note ?? ""} />
        </label>
      </div>
    </section>
  );
}
