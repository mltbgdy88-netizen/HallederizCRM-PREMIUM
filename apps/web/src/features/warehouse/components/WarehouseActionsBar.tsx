export function WarehouseActionsBar() {
  return (
    <section className="hz-action-toolbar">
      <button type="button" className="hz-btn hz-btn-primary hz-toolbar-btn">Hazırlığa Başla</button>
      <button type="button" className="hz-btn hz-btn-secondary hz-toolbar-btn">Hazırlandı İşaretle</button>
      <button type="button" className="hz-btn hz-btn-secondary hz-toolbar-btn">İptal Et</button>
      <button type="button" className="hz-btn hz-btn-secondary hz-toolbar-btn" disabled title="WhatsApp görevi API ile gönderilir">
        WhatsApp görevi
      </button>
    </section>
  );
}
