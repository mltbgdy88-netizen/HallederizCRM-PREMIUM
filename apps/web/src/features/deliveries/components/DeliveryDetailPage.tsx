// @ts-nocheck
"use client";

import { EmptyState, EntityDetailLayout, LoadingState, PageHeader } from "@hallederiz/ui";
import type { Customer, Delivery } from "@hallederiz/types";
import { useEffect, useMemo, useState } from "react";
import { getDeliveryDetail } from "../queries/get-deliveries";
import { getDeliveryStatusLabel } from "../queries/delivery-mock-data";
import { useToast } from "../../../providers/toast-provider";

export function DeliveryHeaderInfo({ delivery, customer }: { delivery: Delivery; customer: Customer | null }) {
  return (
    <section className="hz-content-card hz-deliveries-detail-summary">
      <p className="drawer-eyebrow">Teslimat</p>
      <h2>{delivery.deliveryNo}</h2>
      <p className="muted">
        {customer?.name ?? "â€”"} Â· {delivery.orderNo}
      </p>
      <div className="hz-inline-actions">
        <span className="hz-badge hz-badge-info">{getDeliveryStatusLabel(delivery.status)}</span>
        <span className="hz-badge hz-badge-warning">{delivery.documentStatus}</span>
      </div>
    </section>
  );
}

export function DeliveryActionsBar({ onRollback }: { onRollback: () => void }) {
  const { pushToast } = useToast();
  const [confirmed, setConfirmed] = useState(false);
  const [completed, setCompleted] = useState(false);

  function handleConfirm() {
    setConfirmed(true);
    pushToast("Taslak hazÄ±rlandÄ±: doÄŸrulama onay zincirine iletildi.");
  }

  function handleComplete() {
    setCompleted(true);
    pushToast("Taslak hazÄ±rlandÄ±: teslim tamamlama yetkilendirme akÄ±ÅŸÄ±na aktarÄ±ldÄ±.");
  }

  return (
    <section className="hz-content-card hz-deliveries-detail-actions">
      <h3>Ä°ÅŸlemler</h3>
      <p className="muted">Teslimat doÄŸrulama ve belge adÄ±mlarÄ± mevcut iÅŸ akÄ±ÅŸÄ±yla ilerler.</p>
      <div className="hz-inline-actions">
        <button
          className="hz-btn hz-btn-primary hz-toolbar-btn"
          type="button"
          onClick={handleConfirm}
          disabled={confirmed}
        >
          {confirmed ? "DoÄŸrulandÄ±" : "DoÄŸrula"}
        </button>
        <button
          className="hz-btn hz-btn-secondary hz-toolbar-btn"
          type="button"
          onClick={handleComplete}
          disabled={completed}
        >
          {completed ? "TamamlandÄ±" : "Teslimi tamamla"}
        </button>
        <button
          className="hz-btn hz-btn-secondary hz-toolbar-btn"
          type="button"
          onClick={onRollback}
        >
          Geri al
        </button>
        <button
          className="hz-btn hz-btn-secondary hz-toolbar-btn"
          type="button"
          onClick={() => pushToast("Taslak hazÄ±rlandÄ±: mÃ¼ÅŸteri bildirim mesajÄ± onay sonrasÄ± iletilecek.")}
        >
          MÃ¼ÅŸteriye haber ver
        </button>
        <button
          className="hz-btn hz-btn-secondary hz-toolbar-btn"
          type="button"
          onClick={() => pushToast("Taslak hazÄ±rlandÄ±: teslim fiÅŸi belge servisine yÃ¶nlendirildi.")}
        >
          Teslim fiÅŸi
        </button>
        <button
          className="hz-btn hz-btn-secondary hz-toolbar-btn"
          type="button"
          onClick={() => pushToast("Taslak hazÄ±rlandÄ±: irsaliye belge servisine yÃ¶nlendirildi.")}
        >
          Ä°rsaliye
        </button>
      </div>
    </section>
  );
}

export function DeliveryValidationPanel({ delivery }: { delivery: Delivery }) {
  const validation = delivery.validation;
  return (
    <section className="hz-content-card">
      <h3>Teslim doÄŸrulama</h3>
      <ul className="hz-side-list hz-margin-top-sm">
        <li>MÃ¼ÅŸteri doÄŸrulandÄ±: {validation.customerVerified ? "Evet" : "HayÄ±r"}</li>
        <li>SipariÅŸ eÅŸleÅŸmesi: {validation.orderMatched ? "DoÄŸru" : "Kontrol gerekli"}</li>
        <li>Depo emri hazÄ±r: {validation.warehouseReady ? "Evet" : "HayÄ±r"}</li>
        <li>Eksik Ã¶deme: {validation.paymentMissing ? "Var" : "Yok"}</li>
        <li>Onay gerekiyor: {validation.approvalRequired ? "Evet" : "HayÄ±r"}</li>
        <li>Risk notu: {validation.riskNote || "â€”"}</li>
      </ul>
    </section>
  );
}

export function DeliveryLineTable({ delivery }: { delivery: Delivery }) {
  return (
    <section className="hz-content-card">
      <h3>Teslim satÄ±rlarÄ±</h3>
      <div className="table-wrap hz-table-wrap">
        <table className="table hz-table">
          <thead>
            <tr>
              <th>ÃœrÃ¼n kodu</th>
              <th>ÃœrÃ¼n adÄ±</th>
              <th>SipariÅŸ adedi</th>
              <th>HazÄ±rlanan</th>
              <th>Teslim edilen</th>
            </tr>
          </thead>
          <tbody>
            {delivery.lines.map((line) => (
              <tr key={line.id}>
                <td>{line.productCode}</td>
                <td>{line.productName}</td>
                <td>{line.orderedQuantity}</td>
                <td>{line.preparedQuantity}</td>
                <td>{line.deliveredQuantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function CustomerNotificationCard({ delivery }: { delivery: Delivery }) {
  return (
    <section className="hz-content-card">
      <h3>MÃ¼ÅŸteri bildirimi</h3>
      <p className="hz-content-card-description">Teslim bilgisi kanal politikasÄ±na gÃ¶re iletilir.</p>
      <ul className="hz-side-list">
        <li>Bildirim: {delivery.confirmation?.customerNotified ? "GÃ¶nderildi" : "Taslak"}</li>
        <li>Kanal: WhatsApp</li>
        <li>Yedek: PDF baÄŸlantÄ±sÄ± ve operatÃ¶r notu</li>
      </ul>
    </section>
  );
}

export function DeliveryDocumentPanel({ delivery }: { delivery: Delivery }) {
  return (
    <section className="hz-content-card">
      <h3>Belge</h3>
      <ul className="hz-side-list">
        <li>Teslim fiÅŸi: {delivery.documentStatus}</li>
        <li>Ä°rsaliye: {delivery.documentStatus === "missing" ? "Ãœretilecek" : "HazÄ±r"}</li>
        <li>Belge kaydÄ± teslimat ile iliÅŸkilidir.</li>
      </ul>
      <p className="muted hz-margin-top-sm">PDF Ã¶nizleme baÄŸlantÄ±sÄ± canlÄ± belge servisi bekleniyor.</p>
    </section>
  );
}

export function DeliveryRollbackDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { pushToast } = useToast();
  const [confirmed, setConfirmed] = useState(false);

  function handleConfirm() {
    setConfirmed(true);
    pushToast("Taslak hazÄ±rlandÄ±: geri alma iÅŸlemi onay ve denetim kaydÄ±yla iletildi.");
    setTimeout(onClose, 800);
  }

  if (!open) return null;
  return (
    <div className="hz-modal-overlay" onClick={onClose}>
      <section className="hz-modal offer-small-modal" onClick={(event) => event.stopPropagation()}>
        <header className="hz-modal-header">
          <div>
            <p className="drawer-eyebrow">Geri alma</p>
            <h3>Teslim geri alma</h3>
            <p className="muted">Geri alma iÅŸlemi onay ve denetim kaydÄ± ile ilerler.</p>
          </div>
          <button className="hz-btn hz-btn-secondary" type="button" onClick={onClose}>
            Kapat
          </button>
        </header>
        <div className="hz-modal-content">
          <button
            className="hz-btn hz-btn-primary hz-toolbar-btn"
            type="button"
            onClick={handleConfirm}
            disabled={confirmed}
          >
            {confirmed ? "Ä°letildi" : "Onayla"}
          </button>
        </div>
      </section>
    </div>
  );
}

export function DeliveryDetailPage({ deliveryId }: { deliveryId?: string }) {
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [rollbackOpen, setRollbackOpen] = useState(false);

  useEffect(() => {
    getDeliveryDetail(deliveryId)
      .then((result) => {
        setDelivery(result.delivery);
        setCustomers(result.customers);
      })
      .finally(() => setLoading(false));
  }, [deliveryId]);

  const customer = useMemo(
    () => customers.find((item) => item.id === delivery?.customerId) ?? null,
    [customers, delivery?.customerId]
  );

  if (loading) {
    return <LoadingState title="Teslimat yÃ¼kleniyor" message="DoÄŸrulama ve satÄ±rlar hazÄ±rlanÄ±yor." />;
  }
  if (!delivery) {
    return <EmptyState title="Teslimat bulunamadÄ±" message="SeÃ§ilen teslimat kaydÄ± bulunamadÄ±." />;
  }

  return (
    <EntityDetailLayout
      className="hz-commercial-entity-detail-page hz-deliveries-detail-page"
      header={
        <PageHeader
          title={deliveryId ? "Teslimat detayÄ±" : "Yeni teslimat"}
          description="Teslim doÄŸrulama, bildirim, belge ve geri alma adÄ±mlarÄ±."
          breadcrumb={delivery.deliveryNo}
        />
      }
      summary={<DeliveryHeaderInfo delivery={delivery} customer={customer} />}
      sections={
        <>
          <DeliveryActionsBar onRollback={() => setRollbackOpen(true)} />
          <DeliveryValidationPanel delivery={delivery} />
          <DeliveryLineTable delivery={delivery} />
          <CustomerNotificationCard delivery={delivery} />
        </>
      }
      sidebar={<DeliveryDocumentPanel delivery={delivery} />}
      footer={<DeliveryRollbackDialog open={rollbackOpen} onClose={() => setRollbackOpen(false)} />}
    />
  );
}

