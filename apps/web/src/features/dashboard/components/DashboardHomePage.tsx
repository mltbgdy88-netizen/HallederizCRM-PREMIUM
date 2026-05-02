"use client";

import { MetricCard, PageHeader, SplitContentLayout } from "@hallederiz/ui";
import { useState } from "react";
import { useToast } from "../../../providers/toast-provider";
import { DashboardAiAssistantPanel } from "./DashboardAiAssistantPanel";

const MOCK_APPROVALS = [
  { id: "1", title: "Fiyat revizyonu — ABC Ltd.", risk: "Orta" },
  { id: "2", title: "Stok negatif düzeltme", risk: "Yüksek" },
  { id: "3", title: "İade onayı #4521", risk: "Düşük" }
];

const MOCK_COLLECTIONS = [
  { id: "1", customer: "Delta A.Ş.", amount: "₺ 42.300", due: "2 gün" },
  { id: "2", customer: "Nova Gıda", amount: "₺ 8.950", due: "Bugün" },
  { id: "3", customer: "Kuzey Lojistik", amount: "₺ 120.000", due: "5 gün" }
];

const MOCK_ACTIVITY = [
  { id: "1", line: "Teklif #T-902 onaya gönderildi", time: "10:12" },
  { id: "2", line: "Sipariş #S-4411 depo emrine bağlandı", time: "09:48" },
  { id: "3", line: "Tahsilat kaydı oluşturuldu (₺ 15.000)", time: "09:05" },
  { id: "4", line: "WhatsApp: müşteri yanıtlandı (taslak)", time: "08:51" }
];

export function DashboardHomePage() {
  const { pushToast } = useToast();
  const [demoSaved, setDemoSaved] = useState(false);

  return (
    <div className="hz-page-stack hz-dashboard-page">
      <PageHeader
        title="Gösterge Paneli"
        description="Günlük operasyon özeti, onay ve tahsilat bekleyenleri ve hızlı başlangıç kartları."
        breadcrumb="Gösterge Paneli"
      />

      <SplitContentLayout
        main={
          <>
            <section className="hz-metric-grid hz-dashboard-metrics">
              <MetricCard title="Bugünkü ciro" value="₺ 186.400" detail="Demo veri" tone="info" />
              <MetricCard title="Bekleyen tahsilat" value="₺ 71.250" detail="3 cari" tone="warning" />
              <MetricCard title="WhatsApp talepleri" value="12" detail="Yanıt bekleyen" tone="neutral" />
              <MetricCard title="Onay bekleyen" value="7" detail="Risk dağılımı" tone="warning" />
              <MetricCard title="Stok riski" value="4" detail="Kritik SKU" tone="danger" />
            </section>

            <section className="hz-dashboard-demo-actions">
              <p className="hz-dashboard-demo-hint">Demo: başarılı işlem sonrası bildirim ve buton kilidi.</p>
              <div className="hz-dashboard-demo-row">
                <button
                  type="button"
                  className={`hz-btn hz-btn-primary ${demoSaved ? "hz-btn-demo-done" : ""}`}
                  disabled={demoSaved}
                  onClick={() => {
                    pushToast("Kaydedildi");
                    setDemoSaved(true);
                  }}
                >
                  {demoSaved ? "Kaydedildi" : "Kaydet (demo)"}
                </button>
                <button
                  type="button"
                  className="hz-btn hz-btn-secondary"
                  onClick={() => {
                    pushToast("Gönderildi");
                  }}
                >
                  Gönder (demo)
                </button>
              </div>
            </section>

            <div className="hz-dashboard-grid-2">
              <article className="hz-content-card hz-dashboard-card">
                <header className="hz-dashboard-card-head">
                  <h2>Onay bekleyen işlemler</h2>
                </header>
                <ul className="hz-dashboard-list">
                  {MOCK_APPROVALS.map((row) => (
                    <li key={row.id}>
                      <span className="hz-dashboard-list-title">{row.title}</span>
                      <span className="hz-dashboard-list-meta">{row.risk}</span>
                    </li>
                  ))}
                </ul>
              </article>

              <article className="hz-content-card hz-dashboard-card">
                <header className="hz-dashboard-card-head">
                  <h2>Tahsilat bekleyen</h2>
                </header>
                <ul className="hz-dashboard-list">
                  {MOCK_COLLECTIONS.map((row) => (
                    <li key={row.id}>
                      <span className="hz-dashboard-list-title">{row.customer}</span>
                      <span className="hz-dashboard-list-meta">
                        {row.amount} · {row.due}
                      </span>
                    </li>
                  ))}
                </ul>
              </article>
            </div>

            <article className="hz-content-card hz-dashboard-card">
              <header className="hz-dashboard-card-head">
                <h2>Günlük özet</h2>
              </header>
              <p className="hz-dashboard-summary">
                Bugün <strong>24</strong> sipariş satırı işlendi, <strong>6</strong> teslimat planlandı, tahsilat hedefinin{" "}
                <strong>%68</strong>&apos;i gerçekleşti (demo metin).
              </p>
            </article>

            <div className="hz-dashboard-grid-2">
              <article className="hz-content-card hz-dashboard-card">
                <header className="hz-dashboard-card-head">
                  <h2>Son işlemler</h2>
                </header>
                <ul className="hz-dashboard-feed">
                  {MOCK_ACTIVITY.map((row) => (
                    <li key={row.id}>
                      <span className="hz-dashboard-feed-time">{row.time}</span>
                      <span className="hz-dashboard-feed-line">{row.line}</span>
                    </li>
                  ))}
                </ul>
              </article>

              <article className="hz-content-card hz-dashboard-card">
                <header className="hz-dashboard-card-head">
                  <h2>Hızlı işlem</h2>
                </header>
                <div className="hz-dashboard-quick">
                  <button type="button" className="hz-dashboard-quick-tile">
                    Sipariş oluştur
                  </button>
                  <button type="button" className="hz-dashboard-quick-tile">
                    Tahsilat işle
                  </button>
                  <button type="button" className="hz-dashboard-quick-tile">
                    Stok sorgula
                  </button>
                  <button type="button" className="hz-dashboard-quick-tile">
                    Fiyat ver
                  </button>
                </div>
              </article>
            </div>
          </>
        }
        side={<DashboardAiAssistantPanel />}
      />
    </div>
  );
}
