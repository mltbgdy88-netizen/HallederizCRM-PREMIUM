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
        {customer?.name ?? "—"} · {delivery.orderNo}
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
    pushToast("Taslak hazırlandı: doğrulama onay zincirine iletildi.");
  }

  function handleComplete() {
    setCompleted(true);
    pushToast("Taslak hazırlandı: teslim tamamlama yetkilendirme akışına aktarıldı.");
  }

  return (
    <section className="hz-content-card hz-deliveries-detail-actions">
      <h3>İşlemler</h3>
      <p className="muted">Teslimat doğrulama ve belge adımları mevcut iş akışıyla ilerler.</p>
      <div className="hz-inline-actions">
        <button
          className="hz-btn hz-btn-primary hz-toolbar-btn"
          type="button"
          onClick={handleConfirm}
          disabled={confirmed}
        >
          {confirmed ? "Doğrulandı" : "Doğrula"}
        </button>
        <button
          className="hz-btn hz-btn-secondary hz-toolbar-btn"
          type="button"
          onClick={handleComplete}
          disabled={completed}
        >
          {completed ? "Tamamlandı" : "Teslimi tamamla"}
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
          onClick={() => pushToast("Taslak hazırlandı: müşteri bildirim mesajı onay sonrası iletilecek.")}
        >
          Müşteriye haber ver
        </button>
        <button
          className="hz-btn hz-btn-secondary hz-toolbar-btn"
          type="button"
          onClick={() => pushToast("Taslak hazırlandı: teslim fişi belge servisine yönlendirildi.")}
        >
          Teslim fişi
        </button>
        <button
          className="hz-btn hz-btn-secondary hz-toolbar-btn"
          type="button"
          onClick={() => pushToast("Taslak hazırlandı: irsaliye belge servisine yönlendirildi.")}
        >
          İrsaliye
        </button>
      </div>
    </section>
  );
}

export function DeliveryValidationPanel({ delivery }: { delivery: Delivery }) {
  const validation = delivery.validation;
  return (
    <section className="hz-content-card">
      <h3>Teslim doğrulama</h3>
      <ul className="hz-side-list hz-margin-top-sm">
        <li>Müşteri doğrulandı: {validation.customerVerified ? "Evet" : "Hayır"}</li>
        <li>Sipariş eşleşmesi: {validation.orderMatched ? "Doğru" : "Kontrol gerekli"}</li>
        <li>Depo emri hazır: {validation.warehouseReady ? "Evet" : "Hayır"}</li>
        <li>Eksik ödeme: {validation.paymentMissing ? "Var" : "Yok"}</li>
        <li>Onay gerekiyor: {validation.approvalRequired ? "Evet" : "Hayır"}</li>
        <li>Risk notu: {validation.riskNote || "—"}</li>
      </ul>
    </section>
  );
}

export function DeliveryLineTable({ delivery }: { delivery: Delivery }) {
  return (
    <section className="hz-content-card">
      <h3>Teslim satırları</h3>
      <div className="table-wrap hz-table-wrap">
        <table className="table hz-table">
          <thead>
            <tr>
              <th>Ürün kodu</th>
              <th>Ürün adı</th>
              <th>Sipariş adedi</th>
              <th>Hazırlanan</th>
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
      <h3>Müşteri bildirimi</h3>
      <p className="hz-content-card-description">Teslim bilgisi kanal politikasına göre iletilir.</p>
      <ul className="hz-side-list">
        <li>Bildirim: {delivery.confirmation?.customerNotified ? "Gönderildi" : "Taslak"}</li>
        <li>Kanal: WhatsApp</li>
        <li>Yedek: PDF bağlantısı ve operatör notu</li>
      </ul>
    </section>
  );
}

export function DeliveryDocumentPanel({ delivery }: { delivery: Delivery }) {
  return (
    <section className="hz-content-card">
      <h3>Belge</h3>
      <ul className="hz-side-list">
        <li>Teslim fişi: {delivery.documentStatus}</li>
        <li>İrsaliye: {delivery.documentStatus === "missing" ? "Üretilecek" : "Hazır"}</li>
        <li>Belge kaydı teslimat ile ilişkilidir.</li>
      </ul>
      <p className="muted hz-margin-top-sm">PDF önizleme bağlantısı canlı belge servisi bekleniyor.</p>
    </section>
  );
}

export function DeliveryRollbackDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { pushToast } = useToast();
  const [confirmed, setConfirmed] = useState(false);

  function handleConfirm() {
    setConfirmed(true);
    pushToast("Taslak hazırlandı: geri alma işlemi onay ve denetim kaydıyla iletildi.");
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
            <p className="muted">Geri alma işlemi onay ve denetim kaydı ile ilerler.</p>
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
            {confirmed ? "İletildi" : "Onayla"}
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
    return <LoadingState title="Teslimat yükleniyor" message="Doğrulama ve satırlar hazırlanıyor." />;
  }
  if (!delivery) {
    return <EmptyState title="Teslimat bulunamadı" message="Seçilen teslimat kaydı bulunamadı." />;
  }

  return (
    <EntityDetailLayout
      className="hz-commercial-entity-detail-page hz-deliveries-detail-page"
      header={
        <PageHeader
          title={deliveryId ? "Teslimat detayı" : "Yeni teslimat"}
          description="Teslim doğrulama, bildirim, belge ve geri alma adımları."
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


