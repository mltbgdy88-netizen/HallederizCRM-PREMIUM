import type { SaleOrder } from "@hallederiz/types";

export function OrderLineEntryBar({ order }: { order: SaleOrder }) {
  return (
    <section className="hz-content-card">
      <h3>Satır ekleme</h3>
      <p className="hz-content-card-description">
        Fiyat slotu varsayılan olarak cari özetinden gelir; satır bazında değiştirilebilir.
      </p>
      <div className="hz-filter-grid hz-margin-top-sm">
        <label>
          Ürün Kodu / Barkod / QR
          <input placeholder="Ürün ara" readOnly />
        </label>
        <label>
          Adet
          <input type="number" defaultValue={1} min={1} readOnly />
        </label>
        <label>
          Fiyat Slotu
          <select defaultValue={order.priceSlotNoSnapshot} disabled>
            <option value={1}>Perakende</option>
            <option value={2}>Proje</option>
            <option value={3}>Mimar</option>
            <option value={4}>Bayi</option>
          </select>
        </label>
        <label>
          Kaynak Tercihi
          <select defaultValue="auto" disabled>
            <option value="auto">Otomatik</option>
            <option value="warehouse">Merkez</option>
            <option value="factory">Fabrika</option>
            <option value="split">Split</option>
          </select>
        </label>
      </div>
      <div className="stock-filter-actions hz-margin-top-sm">
        <button type="button" className="hz-btn hz-btn-primary hz-toolbar-btn" disabled>
          Satıra ekle
        </button>
        <span className="hz-badge hz-badge-info">Kaynak planı sonraki adımda netleşir</span>
      </div>
    </section>
  );
}
