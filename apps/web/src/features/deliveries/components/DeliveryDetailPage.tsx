"use client";

import Link from "next/link";
import type { Customer, Delivery } from "@hallederiz/types";
import { useEffect, useMemo, useState } from "react";
import { dataSourceConfig } from "../../../lib/data-source";
import { getDeliveryDetail } from "../queries/get-deliveries";
import { getDeliveryStatusLabel } from "../queries/delivery-mock-data";
import { useToast } from "../../../providers/toast-provider";
import {
  buildDeliveryHeaderMeta,
  buildDeliveryInfoFields,
  buildDeliveryReferenceKpis
} from "../utils/map-delivery-detail-to-reference";

export function DeliveryHeaderInfo({
  delivery,
  customer,
  variant = "legacy"
}: {
  delivery: Delivery;
  customer: Customer | null;
  variant?: "legacy" | "reference";
}) {
  if (variant === "reference") {
    const fields = buildDeliveryInfoFields(delivery, customer);
    return (
      <section className="dlf-section" aria-label="Teslimat bilgileri">
        <header className="dlf-section__head">
          <h2>Teslimat bilgileri</h2>
          <span className="dlf-badge dlf-badge--info">{getDeliveryStatusLabel(delivery.status)}</span>
        </header>
        <div className="dlf-field-grid">
          {fields.map((field) => (
            <label key={field.label} className={`dlf-field${field.full ? " dlf-field--full" : ""}`}>
              <span>{field.label}</span>
              <strong>{field.value}</strong>
            </label>
          ))}
        </div>
      </section>
    );
  }

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

export function DeliveryActionsBar({
  onRollback,
  variant = "legacy"
}: {
  onRollback: () => void;
  variant?: "legacy" | "reference";
}) {
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

  if (variant === "reference") {
    return (
      <section className="dlf-actions" aria-label="Teslimat işlemleri">
        <h3 className="dlf-actions__title">İşlemler</h3>
        <div className="dlf-actions__grid">
          <button type="button" className="dlf-actions__btn dlf-actions__btn--primary" onClick={handleConfirm} disabled={confirmed}>
            {confirmed ? "Doğrulandı" : "Doğrula"}
          </button>
          <button type="button" className="dlf-actions__btn" onClick={handleComplete} disabled={completed}>
            {completed ? "Tamamlandı" : "Teslimi tamamla"}
          </button>
          <button type="button" className="dlf-actions__btn" onClick={onRollback}>
            Geri al
          </button>
          <button
            type="button"
            className="dlf-actions__btn"
            onClick={() => pushToast("Taslak hazırlandı: müşteri bildirim mesajı onay sonrası iletilecek.")}
          >
            Müşteriye haber ver
          </button>
          <button
            type="button"
            className="dlf-actions__btn"
            onClick={() => pushToast("Taslak hazırlandı: teslim fişi belge servisine yönlendirildi.")}
          >
            Teslim fişi
          </button>
          <button
            type="button"
            className="dlf-actions__btn"
            onClick={() => pushToast("Taslak hazırlandı: irsaliye belge servisine yönlendirildi.")}
          >
            İrsaliye
          </button>
        </div>
        <p className="dlf-actions__note">Aksiyonlar demo/sonraki fazdır; canlı mutation bağlı değildir.</p>
      </section>
    );
  }

  return (
    <section className="hz-content-card hz-deliveries-detail-actions">
      <h3>İşlemler</h3>
      <p className="muted">Teslimat doğrulama ve belge adımları mevcut iş akışıyla ilerler.</p>
      <div className="hz-inline-actions">
        <button className="hz-btn hz-btn-primary hz-toolbar-btn" type="button" onClick={handleConfirm} disabled={confirmed}>
          {confirmed ? "Doğrulandı" : "Doğrula"}
        </button>
        <button className="hz-btn hz-btn-secondary hz-toolbar-btn" type="button" onClick={handleComplete} disabled={completed}>
          {completed ? "Tamamlandı" : "Teslimi tamamla"}
        </button>
        <button className="hz-btn hz-btn-secondary hz-toolbar-btn" type="button" onClick={onRollback}>
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

export function DeliveryValidationPanel({
  delivery,
  variant = "legacy"
}: {
  delivery: Delivery;
  variant?: "legacy" | "reference";
}) {
  const validation = delivery.validation;

  if (variant === "reference") {
    return (
      <section className="dlf-section" aria-label="Teslim doğrulama">
        <header className="dlf-section__head">
          <h2>Teslim doğrulama</h2>
        </header>
        <ul className="dlf-check-list">
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

export function DeliveryLineTable({
  delivery,
  variant = "legacy"
}: {
  delivery: Delivery;
  variant?: "legacy" | "reference";
}) {
  if (variant === "reference") {
    return (
      <section className="dlf-section" aria-label="Teslim satırları">
        <header className="dlf-section__head">
          <h2>Teslim satırları</h2>
        </header>
        <div className="dlf-table-wrap">
          <table className="dlf-table">
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
                  <td>{line.preparedQuantity ?? "—"}</td>
                  <td>{line.deliveredQuantity ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    );
  }

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

export function CustomerNotificationCard({
  delivery,
  variant = "legacy"
}: {
  delivery: Delivery;
  variant?: "legacy" | "reference";
}) {
  if (variant === "reference") {
    return (
      <section className="dlf-section" aria-label="Müşteri bildirimi">
        <header className="dlf-section__head">
          <h2>Müşteri bildirimi</h2>
        </header>
        <p className="dlf-section__desc">Teslim bilgisi kanal politikasına göre iletilir.</p>
        <ul className="dlf-check-list">
          <li>Bildirim: {delivery.confirmation?.customerNotified ? "Gönderildi" : "Taslak"}</li>
          <li>Kanal: WhatsApp</li>
          <li>Yedek: PDF bağlantısı ve operatör notu</li>
        </ul>
      </section>
    );
  }

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

export function DeliveryDocumentPanel({
  delivery,
  variant = "legacy"
}: {
  delivery: Delivery;
  variant?: "legacy" | "reference";
}) {
  if (variant === "reference") {
    return (
      <section className="dlf-side-card" aria-label="Belge paneli">
        <header className="dlf-side-card__head">
          <h3>Belge</h3>
        </header>
        <ul className="dlf-side-list">
          <li>
            <span>Teslim fişi</span>
            <strong>{delivery.documentStatus}</strong>
          </li>
          <li>
            <span>İrsaliye</span>
            <strong>{delivery.documentStatus === "missing" ? "Üretilecek" : "Hazır"}</strong>
          </li>
        </ul>
        <p className="dlf-side-note">PDF önizleme canlı belge servisi bekleniyor.</p>
      </section>
    );
  }

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
    <div className="dlf-modal-overlay" onClick={onClose}>
      <section className="dlf-modal" onClick={(event) => event.stopPropagation()}>
        <header className="dlf-modal__head">
          <div>
            <p className="dlf-modal__eyebrow">Geri alma</p>
            <h3>Teslim geri alma</h3>
            <p className="dlf-modal__desc">Geri alma işlemi onay ve denetim kaydı ile ilerler.</p>
          </div>
          <button className="dlf-actions__btn" type="button" onClick={onClose}>
            Kapat
          </button>
        </header>
        <div className="dlf-modal__body">
          <button type="button" className="dlf-actions__btn dlf-actions__btn--primary" onClick={handleConfirm} disabled={confirmed}>
            {confirmed ? "İletildi" : "Onayla"}
          </button>
        </div>
      </section>
    </div>
  );
}

function DeliveryReferenceKpiStrip({ kpis }: { kpis: ReturnType<typeof buildDeliveryReferenceKpis> }) {
  return (
    <section className="dlf-kpi-strip" aria-label="Teslimat özeti">
      {kpis.map((kpi) => (
        <div
          key={kpi.id}
          className={`dlf-kpi${kpi.tone === "success" ? " dlf-kpi--success" : kpi.tone === "warning" ? " dlf-kpi--warning" : ""}`}
        >
          <span className="dlf-kpi__label">{kpi.label}</span>
          <span className="dlf-kpi__value">{kpi.value}</span>
          {kpi.hint ? <span className="dlf-kpi__hint">{kpi.hint}</span> : null}
        </div>
      ))}
    </section>
  );
}

export function DeliveryDetailPage({ deliveryId }: { deliveryId: string }) {
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [rollbackOpen, setRollbackOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    getDeliveryDetail(deliveryId)
      .then((result) => {
        if (!mounted) return;
        setDelivery(result.delivery);
        setCustomers(result.customers);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [deliveryId]);

  const customer = useMemo(
    () => customers.find((item) => item.id === delivery?.customerId) ?? null,
    [customers, delivery?.customerId]
  );

  const kpis = useMemo(() => (delivery ? buildDeliveryReferenceKpis(delivery) : []), [delivery]);

  if (loading) {
    return (
      <section className="dlf-page hz-deliveries-detail-page">
        <div className="dlf-state" role="status" aria-live="polite">
          <div className="dlf-state__spinner" aria-hidden />
          <h2>Teslimat yükleniyor</h2>
          <p>Doğrulama ve satırlar hazırlanıyor.</p>
        </div>
      </section>
    );
  }

  if (!delivery) {
    return (
      <section className="dlf-page hz-deliveries-detail-page">
        <div className="dlf-state" role="alert">
          <h2>Teslimat bulunamadı</h2>
          <p>Seçilen teslimat kaydı bulunamadı veya erişim kapsamında değil.</p>
          <Link href="/teslimatlar" className="dlf-state__link">
            Teslimatlar listesine dön
          </Link>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="dlf-page hz-deliveries-detail-page">
        <div className="dlf-shell">
          <header className="dlf-header">
            <div className="dlf-header__main">
              <p className="dlf-header__eyebrow">Teslimatlar</p>
              <h1>Teslimat Detayı</h1>
              <p className="dlf-header__meta">{buildDeliveryHeaderMeta(delivery, customer)}</p>
            </div>
            <Link href="/teslimatlar" className="dlf-header__back">
              ← Listeye dön
            </Link>
          </header>

          {dataSourceConfig.useDemoData ? (
            <p className="dlf-demo-band" role="status">
              Örnek veri modu: bu kayıt demo amaçlıdır; doğrula, tamamla veya geri al canlıda bağlı değildir.
            </p>
          ) : null}

          <DeliveryReferenceKpiStrip kpis={kpis} />

          <main className="dlf-layout">
            <section className="dlf-main">
              <DeliveryHeaderInfo delivery={delivery} customer={customer} variant="reference" />
              <DeliveryLineTable delivery={delivery} variant="reference" />
              <DeliveryValidationPanel delivery={delivery} variant="reference" />
              <CustomerNotificationCard delivery={delivery} variant="reference" />
            </section>
            <aside className="dlf-side">
              <section className="dlf-side-card" aria-label="Durum paneli">
                <header className="dlf-side-card__head">
                  <h3>Durum</h3>
                  <span className="dlf-badge dlf-badge--info">{getDeliveryStatusLabel(delivery.status)}</span>
                </header>
                <ul className="dlf-side-list">
                  <li>
                    <span>Teslim durumu</span>
                    <strong>{getDeliveryStatusLabel(delivery.status)}</strong>
                  </li>
                  <li>
                    <span>Belge</span>
                    <strong>{delivery.documentStatus}</strong>
                  </li>
                  <li>
                    <span>Bildirim</span>
                    <strong>{delivery.confirmation?.customerNotified ? "Gönderildi" : "Taslak"}</strong>
                  </li>
                </ul>
              </section>

              <section className="dlf-side-card" aria-label="Cari paneli">
                <header className="dlf-side-card__head">
                  <h3>Cari</h3>
                </header>
                <ul className="dlf-side-list">
                  <li>
                    <span>Ad</span>
                    <strong>{customer?.name ?? "—"}</strong>
                  </li>
                  <li>
                    <span>Sipariş</span>
                    <strong>{delivery.orderNo ?? "—"}</strong>
                  </li>
                </ul>
                {delivery.orderId ? (
                  <Link href={`/siparisler/${delivery.orderId}`} className="dlf-side-link">
                    Sipariş detayına git
                  </Link>
                ) : null}
              </section>

              <DeliveryDocumentPanel delivery={delivery} variant="reference" />
              <DeliveryActionsBar onRollback={() => setRollbackOpen(true)} variant="reference" />
            </aside>
          </main>
        </div>
      </section>

      <DeliveryRollbackDialog open={rollbackOpen} onClose={() => setRollbackOpen(false)} />
    </>
  );
}
