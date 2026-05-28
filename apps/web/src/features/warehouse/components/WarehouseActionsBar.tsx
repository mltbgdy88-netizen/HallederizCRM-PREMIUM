export function WarehouseActionsBar() {
  return (
    <section className="hz-action-toolbar">
      <button type="button" className="hz-btn hz-btn-primary hz-toolbar-btn">Hazirliga Basla</button>
      <button type="button" className="hz-btn hz-btn-secondary hz-toolbar-btn">Hazirlandi Isaretle</button>
      <button type="button" className="hz-btn hz-btn-secondary hz-toolbar-btn">Iptal Et</button>
      <button type="button" className="hz-btn hz-btn-secondary hz-toolbar-btn" disabled title="WhatsApp görevi API ile gönderilir">
        WhatsApp görevi
      </button>
    </section>
  );
}

