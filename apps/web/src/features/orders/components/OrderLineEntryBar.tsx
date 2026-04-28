import type { SaleOrder } from "@hallederiz/types";

export function OrderLineEntryBar({ order }: { order: SaleOrder }) {
  return (
    <section className="hz-content-card">
      <h3>Satir Ekleme</h3>
      <p className="hz-content-card-description">Fiyat slotu varsayilan olarak cari snapshotindan gelir, satir bazinda override edilebilir.</p>
      <div className="hz-filter-grid hz-margin-top-sm">
        <label>
          Urun Kodu / Barkod / QR
          <input placeholder="Urun ara" />
        </label>
        <label>
          Adet
          <input type="number" defaultValue={1} min={1} />
        </label>
        <label>
          Fiyat Slotu
          <select defaultValue={order.priceSlotNoSnapshot}>
            <option value={1}>Perakende</option>
            <option value={2}>Proje</option>
            <option value={3}>Mimar</option>
            <option value={4}>Bayi</option>
          </select>
        </label>
        <label>
          Kaynak Tercihi
          <select defaultValue="auto">
            <option value="auto">Otomatik</option>
            <option value="warehouse">Merkez</option>
            <option value="factory">Fabrika</option>
            <option value="split">Split</option>
          </select>
        </label>
      </div>
      <div className="stock-filter-actions hz-margin-top-sm">
        <button type="button" className="hz-btn hz-btn-primary hz-toolbar-btn">Satira Ekle</button>
        <span className="hz-badge hz-badge-info">Kaynak plan sonraki adimda netlesir</span>
      </div>
    </section>
  );
}
