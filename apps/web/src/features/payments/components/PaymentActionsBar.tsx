"use client";

import { useToast } from "../../../providers/toast-provider";

export function PaymentActionsBar() {
  const { pushToast } = useToast();

  return (
    <section className="hz-action-toolbar">
      <button
        type="button"
        className="hz-btn hz-btn-primary hz-toolbar-btn"
        onClick={() => pushToast("Tahsilat kaydı henüz canlı kullanıma bağlı değil.")}
      >
        Kaydet
      </button>
      <button
        type="button"
        className="hz-btn hz-btn-secondary hz-toolbar-btn"
        onClick={() => pushToast("Tahsilat doğrulaması onay zincirine bağlıdır; bu adım henüz bağlı değil.")}
      >
        Doğrula
      </button>
      <button
        type="button"
        className="hz-btn hz-btn-secondary hz-toolbar-btn"
        onClick={() => pushToast("Ters kayıt yetkili onayı gerektirir; canlı işlem henüz bağlı değil.")}
      >
        Ters kayıt
      </button>
      <button
        type="button"
        className="hz-btn hz-btn-secondary hz-toolbar-btn"
        onClick={() => pushToast("Belge önizlemesi hazırlanır; canlı PDF gönderimi henüz bağlı değil.")}
      >
        PDF gönder
      </button>
    </section>
  );
}

