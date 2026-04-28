export function OrderActionButtons({
  onSourcing,
  onApproval,
  onPayment,
  onWarehouse,
  onDelivery,
  onInvoice
}: {
  onSourcing: () => void;
  onApproval: () => void;
  onPayment: () => void;
  onWarehouse: () => void;
  onDelivery: () => void;
  onInvoice: () => void;
}) {
  return (
    <section className="hz-action-toolbar">
      <button type="button" className="hz-btn hz-btn-primary hz-toolbar-btn">Kaydet</button>
      <button type="button" className="hz-btn hz-btn-secondary hz-toolbar-btn">Onayla</button>
      <button type="button" className="hz-btn hz-btn-secondary hz-toolbar-btn" onClick={onSourcing}>Kaynak Planla</button>
      <button type="button" className="hz-btn hz-btn-secondary hz-toolbar-btn" onClick={onPayment}>Tahsilat Ekle</button>
      <button type="button" className="hz-btn hz-btn-secondary hz-toolbar-btn" onClick={onWarehouse}>Depo Emri Olustur</button>
      <button type="button" className="hz-btn hz-btn-secondary hz-toolbar-btn" onClick={onDelivery}>Teslim Olustur</button>
      <button type="button" className="hz-btn hz-btn-secondary hz-toolbar-btn" onClick={onInvoice}>Fatura Olustur</button>
      <button type="button" className="hz-btn hz-btn-secondary hz-toolbar-btn" onClick={onApproval}>Approval Ozeti</button>
    </section>
  );
}
