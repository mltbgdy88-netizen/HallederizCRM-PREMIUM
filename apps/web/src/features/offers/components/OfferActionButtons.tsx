"use client";

import { useToast } from "../../../providers/toast-provider";

export function OfferActionButtons({
  onSend,
  onConvert,
  layout = "default"
}: {
  onSend: () => void;
  onConvert: () => void;
  layout?: "default" | "reference";
}) {
  const { pushToast } = useToast();

  if (layout === "reference") {
    return (
      <section className="ofd-actions" aria-label="Teklif hızlı aksiyonları">
        <h3 className="ofd-actions__title">Teklif aksiyonları</h3>
        <div className="ofd-actions__grid">
          <button
            type="button"
            className="ofd-actions__btn ofd-actions__btn--primary"
            onClick={() => pushToast("Kayıt canlıda onay zincirine bağlıdır; bu adım henüz bağlı değil.")}
          >
            Kaydet
          </button>
          <button
            type="button"
            className="ofd-actions__btn"
            onClick={() => pushToast("Belge önizlemesi hazırlanır; canlı gönderim henüz bağlı değil.")}
          >
            PDF Önizle
          </button>
          <button type="button" className="ofd-actions__btn" onClick={onSend}>
            Gönder
          </button>
          <button
            type="button"
            className="ofd-actions__btn"
            onClick={() => pushToast("Follow-up kaydı taslak olarak eklenir; canlı hatırlatma henüz bağlı değil.")}
          >
            Follow-up Ekle
          </button>
          <button type="button" className="ofd-actions__btn ofd-actions__btn--gold" onClick={onConvert}>
            Siparişe Dönüştür
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="hz-action-toolbar">
      <button
        type="button"
        className="hz-btn hz-btn-primary hz-toolbar-btn"
        onClick={() => pushToast("Kayıt canlıda onay zincirine bağlıdır; bu adım henüz bağlı değil.")}
      >
        Kaydet
      </button>
      <button
        type="button"
        className="hz-btn hz-btn-secondary hz-toolbar-btn"
        onClick={() => pushToast("Belge önizlemesi hazırlanır; canlı gönderim henüz bağlı değil.")}
      >
        PDF Önizle
      </button>
      <button type="button" className="hz-btn hz-btn-secondary hz-toolbar-btn" onClick={onSend}>
        Gönder
      </button>
      <button
        type="button"
        className="hz-btn hz-btn-secondary hz-toolbar-btn"
        onClick={() => pushToast("Follow-up kaydı taslak olarak eklenir; canlı hatırlatma henüz bağlı değil.")}
      >
        Follow-up Ekle
      </button>
      <button type="button" className="hz-btn hz-btn-secondary hz-toolbar-btn" onClick={onConvert}>
        Siparişe Dönüştür
      </button>
    </section>
  );
}
