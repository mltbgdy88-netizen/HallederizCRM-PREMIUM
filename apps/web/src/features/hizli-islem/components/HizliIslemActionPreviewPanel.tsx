"use client";

import type { QuickOperationPreviewResponse } from "@hallederiz/types";
import type { HizliActionCard } from "../data/hizli-islem-mock";

type Props = {
  card: HizliActionCard;
  preview: QuickOperationPreviewResponse | null;
  notice: string | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onSubmitIntent: () => void;
};

function formatTry(amount: number): string {
  return amount.toLocaleString("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 });
}

export function HizliIslemActionPreviewPanel({
  card,
  preview,
  notice,
  loading,
  error,
  onClose,
  onSubmitIntent
}: Props) {
  return (
    <section className="hi-preview-panel" aria-label={`${card.title} önizleme`}>
      <header className="hi-preview-head">
        <div>
          <p className="hi-preview-eyebrow">Salt okunur önizleme</p>
          <h2>{card.title}</h2>
        </div>
        <button type="button" className="hi-preview-close" onClick={onClose} aria-label="Önizlemeyi kapat">
          ×
        </button>
      </header>

      {loading ? (
        <p className="hi-preview-status" role="status">
          Önizleme hazırlanıyor…
        </p>
      ) : null}

      {error ? (
        <p className="hi-preview-status hi-preview-status--error" role="alert">
          {error}
        </p>
      ) : null}

      {notice && !loading ? (
        <p className="hi-preview-status" role="status">
          {notice}
        </p>
      ) : null}

      {preview && !loading ? (
        <div className="hi-preview-body">
          <dl className="hi-preview-totals">
            <div>
              <dt>Ara toplam</dt>
              <dd>{formatTry(preview.totals.subtotal)}</dd>
            </div>
            <div>
              <dt>KDV</dt>
              <dd>{formatTry(preview.totals.taxTotal)}</dd>
            </div>
            <div>
              <dt>Genel toplam</dt>
              <dd>{formatTry(preview.totals.grandTotal)}</dd>
            </div>
          </dl>

          {preview.workflowImpacts.length > 0 ? (
            <ul className="hi-preview-impacts">
              {preview.workflowImpacts.map((impact) => (
                <li key={impact.id}>
                  <strong>{impact.title}</strong>
                  <span>{impact.description}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <footer className="hi-preview-foot">
        <button type="button" className="hi-preview-btn hi-preview-btn--ghost" onClick={onClose}>
          Kapat
        </button>
        <button
          type="button"
          className="hi-preview-btn hi-preview-btn--primary"
          disabled={loading || Boolean(error)}
          onClick={onSubmitIntent}
        >
          İşleme başla
        </button>
      </footer>
    </section>
  );
}
