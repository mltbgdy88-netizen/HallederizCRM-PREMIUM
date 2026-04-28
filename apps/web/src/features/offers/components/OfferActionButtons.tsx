export function OfferActionButtons({
  onSend,
  onConvert
}: {
  onSend: () => void;
  onConvert: () => void;
}) {
  return (
    <section className="hz-action-toolbar">
      <button type="button" className="hz-btn hz-btn-primary hz-toolbar-btn">Kaydet</button>
      <button type="button" className="hz-btn hz-btn-secondary hz-toolbar-btn">PDF Onizle</button>
      <button type="button" className="hz-btn hz-btn-secondary hz-toolbar-btn" onClick={onSend}>Gonder</button>
      <button type="button" className="hz-btn hz-btn-secondary hz-toolbar-btn">Follow-up Ekle</button>
      <button type="button" className="hz-btn hz-btn-secondary hz-toolbar-btn" onClick={onConvert}>Siparise Donustur</button>
    </section>
  );
}
