"use client";

import { useToast } from "../../../providers/toast-provider";

export function OrderActionButtons({
  onSourcing,
  onApproval,
  onPayment,
  onWarehouse,
  onDelivery,
  onInvoice,
  layout = "default"
}: {
  onSourcing: () => void;
  onApproval: () => void;
  onPayment: () => void;
  onWarehouse: () => void;
  onDelivery: () => void;
  onInvoice: () => void;
  layout?: "default" | "reference";
}) {
  const { pushToast } = useToast();

  if (layout === "reference") {
    return (
      <section className="spd-actions" aria-label="Sipariş hızlı aksiyonları">
        <h3 className="spd-actions__title">Operasyon aksiyonları</h3>
        <div className="spd-actions__grid">
          <button
            type="button"
            className="spd-actions__btn spd-actions__btn--primary"
            onClick={() => pushToast("Kayıt canlıda onay zincirine bağlıdır; bu adım henüz bağlı değil.")}
          >
            Kaydet
          </button>
          <button
            type="button"
            className="spd-actions__btn"
            onClick={() => pushToast("Onay canlıda politika ve onay kuyruğuna bağlıdır; bu adım henüz bağlı değil.")}
          >
            Onayla
          </button>
          <button type="button" className="spd-actions__btn" onClick={onSourcing}>
            Kaynak planla
          </button>
          <button type="button" className="spd-actions__btn" onClick={onPayment}>
            Tahsilat ekle
          </button>
          <button type="button" className="spd-actions__btn" onClick={onWarehouse}>
            Depo emri
          </button>
          <button type="button" className="spd-actions__btn" onClick={onDelivery}>
            Teslim
          </button>
          <button type="button" className="spd-actions__btn" onClick={onInvoice}>
            Fatura
          </button>
          <button type="button" className="spd-actions__btn" onClick={onApproval}>
            Onay özeti
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
        onClick={() => pushToast("Onay canlıda politika ve onay kuyruğuna bağlıdır; bu adım henüz bağlı değil.")}
      >
        Onayla
      </button>
      <button type="button" className="hz-btn hz-btn-secondary hz-toolbar-btn" onClick={onSourcing}>
        Kaynak planla
      </button>
      <button type="button" className="hz-btn hz-btn-secondary hz-toolbar-btn" onClick={onPayment}>
        Tahsilat ekle
      </button>
      <button type="button" className="hz-btn hz-btn-secondary hz-toolbar-btn" onClick={onWarehouse}>
        Depo emri oluştur
      </button>
      <button type="button" className="hz-btn hz-btn-secondary hz-toolbar-btn" onClick={onDelivery}>
        Teslim oluştur
      </button>
      <button type="button" className="hz-btn hz-btn-secondary hz-toolbar-btn" onClick={onInvoice}>
        Fatura oluştur
      </button>
      <button type="button" className="hz-btn hz-btn-secondary hz-toolbar-btn" onClick={onApproval}>
        Onay özeti
      </button>
    </section>
  );
}
