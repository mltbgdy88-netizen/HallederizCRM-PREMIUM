"use client";

import { useSearchParams } from "next/navigation";
import { REFERENCE_ROUTE_IDS } from "@/lib/reference/reference-route-ids";
import { useOnaylarReferenceData } from "@/features/onaylar/hooks/use-onaylar-reference-data";

export function OnaylarDetayKararPage() {
  const searchParams = useSearchParams();
  const approvalId = (searchParams.get("approvalId") ?? searchParams.get("id") ?? REFERENCE_ROUTE_IDS.approvalId).trim() || REFERENCE_ROUTE_IDS.approvalId;
  const { getDetailForId } = useOnaylarReferenceData();
  const detail = getDetailForId(approvalId);
  const productFields = detail.productFields ?? [];
  const relatedFields = detail.extraFields ?? [];
  const history = detail.history ?? [];
  const status = detail.priority === "Yüksek" ? "Bekliyor" : "İncelemede";

  return (
    <div className="odk-home">
      <header className="odk-head">
        <div>
          <p className="odk-crumb">Onaylar &gt; Onay Detayı</p>
          <h1>Onay Karar Masası</h1>
        </div>
        <div className="odk-head-meta">
          <span>Onay No: {approvalId}</span>
          <span className="odk-badge odk-badge--type">Tek Onay</span>
        </div>
      </header>

      <div className="odk-workspace">
        <div className="odk-main">
          <article className="odk-product-card">
            <header>
              <span className="odk-badge odk-badge--wait">{status}</span>
              <span className="odk-meta">
                Oluşturulma: {detail.dateTime} · {detail.requester}
              </span>
            </header>
            <div className="odk-product-hero">
              <span className="odk-thumb" aria-hidden />
              <div>
                <span className="odk-product-code">{detail.ref}</span>
                <h2>{detail.title}</h2>
                <span className="odk-badge odk-badge--stock">{detail.department}</span>
              </div>
            </div>
            <dl className="odk-fields-grid">
              {productFields.map((f) => (
                <div key={f.label}>
                  <dt>{f.label}</dt>
                  <dd>{f.value}</dd>
                </div>
              ))}
            </dl>
          </article>

          <section className="odk-price-section">
            <h3>Fiyat Karşılaştırması</h3>
            <div className="odk-price-row">
              <article>
                <span>Mevcut Kayıt</span>
                <strong>—</strong>
                <small>{detail.department}</small>
              </article>
              <article className="odk-price-diff">
                <span>Fiyat Farkı</span>
                <strong>—</strong>
              </article>
              <article>
                <span>Talep Edilen Değişiklik</span>
                <strong>—</strong>
                <small>{detail.requesterRole}</small>
              </article>
            </div>
          </section>

          <section className="odk-reason">
            <h3>Gerekçe</h3>
            <p>{detail.description}</p>
          </section>

          <section className="odk-attachments">
            <h3>Ekler</h3>
            <ul>
              {[{ name: `${approvalId}.pdf`, size: "—" }].map((a) => (
                <li key={a.name}>
                  <span>{a.name}</span>
                  <span>{a.size}</span>
                  <button type="button" aria-label={`${a.name} indir`}>
                    ↓
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className="odk-related">
            <h3>İlgili Bilgiler</h3>
            <dl className="odk-related-grid">
              {relatedFields.map((r) => (
                <div key={r.label}>
                  <dt>{r.label}</dt>
                  <dd>{r.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>

        <aside className="odk-side">
          <article className="odk-panel">
            <h3>Risk Özeti</h3>
            <ul className="odk-risk-list">
              {[
                { label: "Risk Önceliği", value: detail.priority, tone: detail.priority === "Yüksek" ? "orange" : "green" as const },
                { label: "Departman", value: detail.department, tone: "green" as const },
                { label: "Talep Eden Rol", value: detail.requesterRole, tone: "green" as const },
                { label: "Durum", value: status, tone: "green" as const }
              ].map((r) => (
                <li key={r.label}>
                  <span className={`odk-dot odk-dot--${r.tone}`} aria-hidden />
                  <span>{r.label}</span>
                  <strong>{r.value}</strong>
                </li>
              ))}
            </ul>
          </article>
          <article className="odk-panel">
            <h3>Tutar Etkisi</h3>
            <dl className="odk-impact-dl">
              {[
                { label: "Onay Önceliği", value: detail.priority },
                { label: "Kayıt Referansı", value: detail.ref },
                { label: "Talep Zamanı", value: detail.dateTime },
                { label: "Durum", value: status, negative: detail.priority === "Yüksek" }
              ].map((i) => (
                <div key={i.label}>
                  <dt>{i.label}</dt>
                  <dd className={i.negative ? "odk-negative" : undefined}>{i.value}</dd>
                </div>
              ))}
            </dl>
          </article>
          <article className="odk-panel">
            <h3>Denetim Geçmişi</h3>
            <ol className="odk-history">
              {history.map((h) => (
                <li key={h.id}>
                  <strong>{detail.requester}</strong>
                  <span>
                    {h.title} · {h.time}
                  </span>
                </li>
              ))}
            </ol>
            <button type="button" className="odk-btn odk-btn--ghost odk-btn--block">
              Tüm Geçmişi Gör
            </button>
          </article>
        </aside>
      </div>

      <footer className="odk-action-bar">
        <button type="button" className="odk-btn odk-btn--approve">
          Onayla
        </button>
        <button type="button" className="odk-btn odk-btn--reject">
          Reddet
        </button>
        <button type="button" className="odk-btn odk-btn--review">
          İncele
        </button>
      </footer>
    </div>
  );
}
