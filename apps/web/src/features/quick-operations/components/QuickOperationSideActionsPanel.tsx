import type { QuickOperationDocumentPreview, QuickOperationWhatsappDraft } from "../types";

interface Props {
  documentPreview?: QuickOperationDocumentPreview;
  whatsappDraft?: QuickOperationWhatsappDraft;
  documentPreviewVisible: boolean;
  whatsappDraftVisible: boolean;
  onCloseDocumentPreview: () => void;
  onCloseWhatsappDraft: () => void;
}

function money(value: number): string {
  return `${value.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL`;
}

export function QuickOperationSideActionsPanel({
  documentPreview,
  whatsappDraft,
  documentPreviewVisible,
  whatsappDraftVisible,
  onCloseDocumentPreview,
  onCloseWhatsappDraft
}: Props) {
  if (!documentPreviewVisible && !whatsappDraftVisible) {
    return null;
  }

  return (
    <section className="hz-content-card">
      <div className="crm-identity-header">
        <h3>Yan aksiyon taslakları</h3>
        <span className="hz-badge hz-badge-warning">Önizleme</span>
      </div>
      <p className="hz-content-card-description">
        Bu turda yalnızca taslak ve önizleme hazırlanır; gerçek gönderim ve PDF çıktısı onay zincirinden sonra etkinleşir.
      </p>

      {documentPreviewVisible && documentPreview ? (
        <div className="hz-state-card tone-info hz-margin-top-sm">
          <div className="crm-identity-header">
            <h4>{documentPreview.title}</h4>
            <button type="button" className="hz-btn hz-btn-secondary" onClick={onCloseDocumentPreview}>
              Kapat
            </button>
          </div>
          <p className="hz-content-card-description">
            Ref: {documentPreview.referenceNo} · Cari: {documentPreview.customerName}
          </p>
          <ul className="hz-side-list">
            {documentPreview.lines.slice(0, 5).map((line) => (
              <li key={`${documentPreview.referenceNo}_${line.no}`}>
                #{line.no} {line.productCode} · {line.productName} · {line.quantity} x {money(line.unitPrice)} = {money(line.lineTotal)}
              </li>
            ))}
          </ul>
          <p className="hz-content-card-description">
            Toplam: {money(documentPreview.totals.grandTotal)}
            {documentPreview.previewText ? ` · ${documentPreview.previewText}` : ""}
          </p>
        </div>
      ) : null}

      {whatsappDraftVisible && whatsappDraft ? (
        <div className="hz-state-card tone-warning hz-margin-top-sm">
          <div className="crm-identity-header">
            <h4>WhatsApp Taslagi</h4>
            <button type="button" className="hz-btn hz-btn-secondary" onClick={onCloseWhatsappDraft}>
              Kapat
            </button>
          </div>
          <p className="hz-content-card-description">{whatsappDraft.message}</p>
          <p className="hz-content-card-description">
            Intent: {whatsappDraft.intent} · Onay Gerekli: {whatsappDraft.requiresApproval ? "Evet" : "Hayir"} · Gonderim:{" "}
            {whatsappDraft.sendEnabled ? "Etkin" : "Kapali"}
          </p>
        </div>
      ) : null}
    </section>
  );
}

