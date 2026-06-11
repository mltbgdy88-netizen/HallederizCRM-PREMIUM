"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Customer, Delivery } from "@hallederiz/types";
import { LucideIcon } from "../../../components/icons/lucide-icons";
import { dataSourceConfig } from "../../../lib/data-source";
import { useToast } from "../../../providers/toast-provider";
import { getDeliveries } from "../queries/get-deliveries";
import { buildQuickDeliveryContinueHref } from "../utils/map-delivery-detail-to-reference";
import {
  buildDeliveryRouteKpis,
  buildDeliveryRouteStops,
  buildDeliveryRouteSummary,
  type DeliveryRouteStop
} from "../utils/map-delivery-route-operations";

function DeliveryRouteMapPanel({ stops }: { stops: DeliveryRouteStop[] }) {
  return (
    <section className="drp-section drp-map-panel" aria-label="Rota haritası">
      <header className="drp-section__head">
        <h2>Rota Haritası</h2>
      </header>
      <p className="drp-section__desc">
        Harita ve rota optimizasyon motoru sonraki entegrasyon fazında bağlanacak. Bu ekran rota planlama
        operasyon yüzeyidir.
      </p>
      <div className="drp-map-canvas">
        <div className="drp-map-canvas__origin">
          <span className="drp-map-canvas__badge">Depo çıkış</span>
          <strong>Merkez depo — planlama noktası</strong>
        </div>
        <ol className="drp-map-route">
          {stops.length === 0 ? (
            <li className="drp-map-route__empty">Planlanacak durak yok.</li>
          ) : (
            stops.map((stop) => (
              <li key={stop.delivery.id} className={stop.isRisky ? "drp-map-route__item is-risky" : "drp-map-route__item"}>
                <span className="drp-map-route__seq">{stop.sequence}</span>
                <div className="drp-map-route__body">
                  <strong>{stop.delivery.deliveryNo}</strong>
                  <span>
                    {stop.customerName} · {stop.addressSummary}
                  </span>
                </div>
              </li>
            ))
          )}
        </ol>
      </div>
    </section>
  );
}

function DeliveryRouteStopList({
  stops,
  onReorder
}: {
  stops: DeliveryRouteStop[];
  onReorder: () => void;
}) {
  return (
    <section className="drp-section drp-stop-list" aria-label="Teslimat durakları">
      <header className="drp-section__head">
        <h2>Teslimat durakları</h2>
        <button type="button" className="drp-inline-btn" onClick={onReorder}>
          Sıralamayı güncelle
        </button>
      </header>
      <div className="drp-stop-scroll">
        {stops.length === 0 ? (
          <p className="drp-stop-empty">Teslimat kaydı bulunamadı.</p>
        ) : (
          stops.map((stop) => {
            const quickHref =
              stop.delivery.orderId && stop.delivery.customerId
                ? buildQuickDeliveryContinueHref(stop.delivery.orderId, stop.delivery.customerId)
                : null;

            return (
              <article
                key={stop.delivery.id}
                className={`drp-stop-card${stop.isRisky ? " drp-stop-card--risky" : ""}${stop.isCompleted ? " drp-stop-card--done" : ""}`}
              >
                <div className="drp-stop-card__head">
                  <span className="drp-stop-card__seq">{stop.sequence}</span>
                  <div>
                    <strong>{stop.delivery.deliveryNo}</strong>
                    <p>{stop.customerName}</p>
                  </div>
                  <span className={`drp-badge${stop.isRisky ? " drp-badge--warning" : " drp-badge--info"}`}>{stop.statusLabel}</span>
                </div>
                <ul className="drp-stop-card__meta">
                  <li>
                    <span>Adres</span>
                    <strong>{stop.addressSummary}</strong>
                  </li>
                  <li>
                    <span>Plan</span>
                    <strong>{stop.plannedLabel}</strong>
                  </li>
                  <li>
                    <span>Satır</span>
                    <strong>{stop.lineCount > 0 ? String(stop.lineCount) : "—"}</strong>
                  </li>
                  <li>
                    <span>Risk</span>
                    <strong>{stop.riskLabel}</strong>
                  </li>
                </ul>
                <div className="drp-stop-card__actions">
                  <Link href={`/teslimatlar/${stop.delivery.id}`} className="drp-stop-card__link">
                    Detay
                  </Link>
                  {quickHref ? (
                    <Link href={quickHref} className="drp-stop-card__link drp-stop-card__link--muted">
                      Hızlı teslim
                    </Link>
                  ) : null}
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}

function DeliveryRouteVehiclePanel() {
  return (
    <section className="drp-side-card" aria-label="Araç ve sürücü">
      <header className="drp-side-card__head">
        <h3>Araç / sürücü</h3>
      </header>
      <div className="drp-field-grid drp-field-grid--stack">
        <label className="drp-field">
          <span>Araç</span>
          <select disabled defaultValue="">
            <option value="">Araç seçimi (sonraki faz)</option>
            <option value="demo-1">34 ABC 123 — Panelvan (demo)</option>
          </select>
        </label>
        <label className="drp-field">
          <span>Sürücü</span>
          <select disabled defaultValue="">
            <option value="">Sürücü seçimi (sonraki faz)</option>
            <option value="demo-1">Mehmet K. (demo)</option>
          </select>
        </label>
        <label className="drp-field">
          <span>Kapasite</span>
          <input readOnly value="—" />
        </label>
        <label className="drp-field">
          <span>Rota başlangıç</span>
          <input type="time" defaultValue="09:00" disabled />
        </label>
        <label className="drp-field">
          <span>Planlama durumu</span>
          <input readOnly value="Taslak planlama" />
        </label>
      </div>
      <p className="drp-side-note">Araç/sürücü canlı atama sonraki fazda bağlanacak.</p>
    </section>
  );
}

function DeliveryRouteSummaryPanel({ stops }: { stops: DeliveryRouteStop[] }) {
  const summary = buildDeliveryRouteSummary(stops);

  return (
    <section className="drp-side-card" aria-label="Rota özeti">
      <header className="drp-side-card__head">
        <h3>Rota özeti</h3>
      </header>
      <ul className="drp-side-list">
        <li>
          <span>Toplam durak</span>
          <strong>{summary.totalStops > 0 ? String(summary.totalStops) : "—"}</strong>
        </li>
        <li>
          <span>Tamamlanan</span>
          <strong>{summary.completed > 0 ? String(summary.completed) : "—"}</strong>
        </li>
        <li>
          <span>Bekleyen</span>
          <strong>{summary.pending > 0 ? String(summary.pending) : "—"}</strong>
        </li>
        <li>
          <span>Riskli / geciken</span>
          <strong>{summary.risky > 0 ? String(summary.risky) : "—"}</strong>
        </li>
        <li>
          <span>Adresi eksik</span>
          <strong>{summary.addressMissing > 0 ? String(summary.addressMissing) : "—"}</strong>
        </li>
        <li>
          <span>Rota hazır mı?</span>
          <strong>{summary.readyLabel}</strong>
        </li>
      </ul>
      <p className="drp-side-note">Süre ve mesafe optimizasyonu sonraki fazda bağlanacaktır.</p>
    </section>
  );
}

function DeliveryRouteActionsPanel({ onPlan, onExport }: { onPlan: () => void; onExport: () => void }) {
  return (
    <section className="drp-actions" aria-label="Rota işlemleri">
      <h3 className="drp-actions__title">İşlemler</h3>
      <div className="drp-actions__stack">
        <button type="button" className="drp-actions__btn drp-actions__btn--primary" onClick={onPlan}>
          Rota planını hazırla
        </button>
        <button type="button" className="drp-actions__btn" disabled title="Canlı bildirim sonraki fazda">
          Sürücüye gönder
        </button>
        <button type="button" className="drp-actions__btn" onClick={onExport}>
          Planı dışa aktar
        </button>
        <Link href="/teslimatlar" className="drp-actions__link">
          Teslimat listesine dön
        </Link>
      </div>
      <p className="drp-actions__note">Planlama aksiyonları demo/sonraki fazdır; canlı mutation bağlı değildir.</p>
    </section>
  );
}

export function DeliveryRouteOperationsPage() {
  const { pushToast } = useToast();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getDeliveries()
      .then((result) => {
        if (!mounted) return;
        setDeliveries(result.deliveries);
        setCustomers(result.customers);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const stops = useMemo(() => buildDeliveryRouteStops(deliveries, customers), [deliveries, customers]);
  const kpis = useMemo(() => buildDeliveryRouteKpis(stops), [stops]);

  function handleReorder() {
    pushToast("Taslak hazırlandı: durak sıralaması sonraki fazda kaydedilecek.");
  }

  function handlePlan() {
    pushToast("Taslak hazırlandı: rota planı onay akışına iletildi.");
  }

  function handleExport() {
    pushToast("Demo modda rota planı dışa aktarımı simüle edildi.");
  }

  if (loading) {
    return (
      <section className="drp-page hz-deliveries-route-page">
        <div className="drp-state" role="status" aria-live="polite">
          <div className="drp-state__spinner" aria-hidden />
          <h2>Rota operasyon masası yükleniyor</h2>
          <p>Teslimat durakları ve plan özeti hazırlanıyor.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="drp-page hz-deliveries-route-page">
      <div className="drp-shell">
        <header className="drp-header">
          <div className="drp-header__main">
            <span className="drp-header__icon" aria-hidden>
              <LucideIcon name="truck" size={20} />
            </span>
            <div>
              <p className="drp-header__eyebrow">Teslimatlar</p>
              <h1>Teslimat Rota Operasyon Masası</h1>
              <p className="drp-header__meta">Günlük teslimat durakları, araç/sürücü planı ve rota takibi.</p>
            </div>
          </div>
          <div className="drp-header__actions">
            <Link href="/teslimatlar" className="drp-header__action">
              Teslimat listesi
            </Link>
            <Link href="/teslimatlar/yeni" className="drp-header__action">
              Yeni teslimat
            </Link>
            <Link href="/hizli-islem/satis-masasi?tab=delivery" className="drp-header__action drp-header__action--primary">
              Hızlı teslimat
            </Link>
          </div>
        </header>

        {dataSourceConfig.useDemoData ? (
          <p className="drp-demo-band" role="status">
            Örnek veri modu: duraklar mevcut teslimat listesinden türetilmiştir; harita ve araç atama canlıda bağlı
            değildir.
          </p>
        ) : (
          <p className="drp-demo-band drp-demo-band--info" role="status">
            Harita entegrasyonu ve rota optimizasyonu sonraki fazda bağlanacaktır.
          </p>
        )}

        <section className="drp-kpi-strip" aria-label="Rota özeti">
          {kpis.map((kpi) => (
            <div
              key={kpi.id}
              className={`drp-kpi${kpi.tone === "success" ? " drp-kpi--success" : kpi.tone === "warning" ? " drp-kpi--warning" : ""}`}
            >
              <span className="drp-kpi__label">{kpi.label}</span>
              <span className="drp-kpi__value">{kpi.value}</span>
            </div>
          ))}
        </section>

        <main className="drp-layout">
          <section className="drp-main">
            <DeliveryRouteMapPanel stops={stops} />
            <DeliveryRouteStopList stops={stops} onReorder={handleReorder} />
          </section>
          <aside className="drp-side">
            <DeliveryRouteVehiclePanel />
            <DeliveryRouteSummaryPanel stops={stops} />
            <DeliveryRouteActionsPanel onPlan={handlePlan} onExport={handleExport} />
          </aside>
        </main>
      </div>
    </section>
  );
}
