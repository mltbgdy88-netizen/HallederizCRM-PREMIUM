"use client";

import { useToast } from "../../../providers/toast-provider";

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

