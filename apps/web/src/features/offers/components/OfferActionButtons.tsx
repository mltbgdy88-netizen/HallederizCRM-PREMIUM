"use client";

import { useToast } from "../../../providers/toast-provider";

export function OfferActionButtons({
  onSend,
  onConvert
}: {
  onSend: () => void;
  onConvert: () => void;
}) {
  const { pushToast } = useToast();

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
