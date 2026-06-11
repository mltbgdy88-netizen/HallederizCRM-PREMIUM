"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useToast } from "../../../providers/toast-provider";
import { QUICK_OPERATION_SALES_DESK_HREF } from "../data/quick-operation-hub-data";
import {
  QUICK_OPERATION_IMPACT_DEMO_SECTIONS,
  QUICK_OPERATION_IMPACT_RISK_NOTES
} from "../utils/quick-operation-result-context";

function toneClass(tone: "info" | "success" | "warning" | "danger"): string {
  if (tone === "success") return "qop-result-badge--success";
  if (tone === "warning") return "qop-result-badge--warning";
  if (tone === "danger") return "qop-result-badge--danger";
  return "qop-result-badge--info";
}

export function QuickOperationImpactReferenceLayout() {
  const { pushToast } = useToast();
  const sections = useMemo(() => QUICK_OPERATION_IMPACT_DEMO_SECTIONS, []);

  return (
    <section className="qop-result-page qop-result-page--impact" data-page="hizli-islem-etki-analizi-reference">
      <div className="qop-result-shell">
        <header className="qop-result-header">
          <div className="qop-result-header__main">
            <p className="qop-result-header__eyebrow">Hızlı İşlem</p>
            <h1 className="qop-result-header__title">Hızlı İşlem Etki Analizi</h1>
            <p className="qop-result-header__meta">
              Stok, cari, tahsilat, teslimat ve belge etkilerinin operasyon önizlemesi.
            </p>
          </div>
          <Link href={QUICK_OPERATION_SALES_DESK_HREF} className="qop-result-header__back">
            Masaya dön
          </Link>
        </header>

        <p className="qop-result-demo-band" role="status">
          Canlı etki analizi motoru sonraki entegrasyon fazında bağlanacak.
        </p>

        <main className="qop-result-layout">
          <section className="qop-result-main">
            <section className="qop-result-kpi-strip" aria-label="Etki özeti">
              {sections.map((section) => (
                <div key={section.id} className="qop-result-kpi">
                  <span className="qop-result-kpi__label">{section.title}</span>
                  <span className="qop-result-kpi__value">{section.value}</span>
                </div>
              ))}
            </section>

            <div className="qop-result-impact-grid">
              {sections.map((section) => (
                <article key={section.id} className="qop-result-card">
                  <header className="qop-result-card__head">
                    <h2>{section.title}</h2>
                    <span className={`qop-result-badge ${toneClass(section.tone)}`}>Önizleme</span>
                  </header>
                  <p className="qop-result-card__desc">{section.detail}</p>
                  <button
                    type="button"
                    className="qop-result-btn qop-result-btn--ghost"
                    onClick={() => pushToast(`${section.title} detayı canlı motor bağlandığında açılacaktır.`)}
                  >
                    Detayı gör (toast)
                  </button>
                </article>
              ))}
            </div>
          </section>

          <aside className="qop-result-side">
            <section className="qop-result-side-card qop-result-side-card--risk" aria-label="Risk ve uyarılar">
              <header className="qop-result-side-card__head">
                <h3>Risk / uyarı paneli</h3>
              </header>
              <ul className="qop-result-risk-list">
                {QUICK_OPERATION_IMPACT_RISK_NOTES.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </section>

            <section className="qop-result-side-card" aria-label="Bağlantılar">
              <header className="qop-result-side-card__head">
                <h3>İlgili ekranlar</h3>
              </header>
              <div className="qop-result-actions">
                <Link href="/stok" className="qop-result-btn qop-result-btn--secondary">
                  Stok operasyonu
                </Link>
                <Link href="/tahsilatlar" className="qop-result-btn qop-result-btn--secondary">
                  Tahsilatlar
                </Link>
                <Link href="/teslimatlar" className="qop-result-btn qop-result-btn--secondary">
                  Teslimatlar
                </Link>
                <Link href="/belgeler" className="qop-result-btn qop-result-btn--secondary">
                  Belgeler
                </Link>
              </div>
            </section>
          </aside>
        </main>
      </div>
    </section>
  );
}
