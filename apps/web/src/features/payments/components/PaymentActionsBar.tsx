"use client";

import { useToast } from "../../../providers/toast-provider";

export function PaymentActionsBar() {
  const { pushToast } = useToast();

  return (
    <section className="tdf-actions" aria-label="Tahsilat aksiyonları">
      <h3 className="tdf-actions__title">Hızlı aksiyonlar</h3>
      <div className="tdf-actions__grid">
        <button
          type="button"
          className="tdf-actions__btn tdf-actions__btn--primary"
          onClick={() => pushToast("Tahsilat kaydı henüz canlı kullanıma bağlı değil.")}
        >
          Kaydet
        </button>
        <button
          type="button"
          className="tdf-actions__btn"
          onClick={() => pushToast("Tahsilat doğrulaması onay zincirine bağlıdır; bu adım henüz bağlı değil.")}
        >
          Doğrula
        </button>
        <button
          type="button"
          className="tdf-actions__btn"
          onClick={() => pushToast("Ters kayıt yetkili onayı gerektirir; canlı işlem henüz bağlı değil.")}
        >
          Ters kayıt
        </button>
        <button
          type="button"
          className="tdf-actions__btn"
          onClick={() => pushToast("Belge önizlemesi hazırlanır; canlı PDF gönderimi henüz bağlı değil.")}
        >
          PDF / Makbuz
        </button>
      </div>
      <p className="tdf-actions__note">Bu aksiyonlar demo/sonraki fazdır; canlı mutation bağlı değildir.</p>
    </section>
  );
}
