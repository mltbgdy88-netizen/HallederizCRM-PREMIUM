"use client";

import Link from "next/link";
import { dataSourceConfig } from "../../../lib/data-source";
import type { PilotWeeklyStatus } from "../data/operational-observability-mock";
import { OPS_TRACE_PREVIEW_ROWS, PILOT_WEEKLY_PREVIEW_ROWS } from "../data/operational-observability-mock";

function pilotWeeklyBadgeClass(status: PilotWeeklyStatus): string {
  if (status === "pozitif") return "setf-badge setf-badge--success";
  if (status === "risk") return "setf-badge setf-badge--danger";
  return "setf-badge setf-badge--warning";
}

function pilotWeeklyBadgeLabel(status: PilotWeeklyStatus): string {
  if (status === "pozitif") return "Pozitif";
  if (status === "risk") return "Risk";
  return "Beklemede";
}

export function SettingsOperationalObservabilityReferenceLayout() {
  return (
    <div className="setf-home" data-page="settings-ops-obs-reference" aria-live="polite">
      <p className="setf-crumb">
        <Link href="/ayarlar" className="setf-crumb-link">
          Ayarlar
        </Link>
        <span className="setf-crumb-sep" aria-hidden>
          /
        </span>
        <span>Operasyon ve gözlem</span>
      </p>

      <header className="setf-head">
        <div className="setf-head-text">
          <h1>Operasyon ve Gözlem</h1>
          <p>İstek zincirinde kiracı bağlamı ile iz/span korelasyonu; metrik ve log hattı için temel operasyon gözlemi görünümü.</p>
        </div>
      </header>

      {dataSourceConfig.useDemoData ? (
        <p className="setf-demo-band" role="status">
          Demo veri: aşağıdaki izleme satırları örnek; canlı ortamda OpenTelemetry / log hattı tenant_id + trace_id (kiracı kimliği + izleme kimliği) taşır.
        </p>
      ) : null}

      <section className="setf-kpi-row" aria-label="Operasyon metrikleri">
        <article className="setf-kpi">
          <span className="setf-kpi-label">Örnek iz</span>
          <span className="setf-kpi-value">{OPS_TRACE_PREVIEW_ROWS.length}</span>
          <span className="setf-kpi-detail">Son istekler (demo)</span>
        </article>
        <article className="setf-kpi">
          <span className="setf-kpi-label">Kiracı kapsamı</span>
          <span className="setf-kpi-value">Zorunlu</span>
          <span className="setf-kpi-detail">API koruması + bağlam</span>
        </article>
        <article className="setf-kpi">
          <span className="setf-kpi-label">Örnek p99</span>
          <span className="setf-kpi-value">118 ms</span>
          <span className="setf-kpi-detail">Çalışan servis dağıtımı</span>
        </article>
        <article className="setf-kpi">
          <span className="setf-kpi-label">Korelasyon</span>
          <span className="setf-kpi-value">trace_id</span>
          <span className="setf-kpi-detail">W3C + kiracı kimliği</span>
        </article>
      </section>

      <div className="setf-workspace setf-workspace--single">
        <section className="setf-main" aria-label="İz ve haftalık özet">
          <div className="setf-main-scroll">
            <div className="setf-section-head">
              <h2>Kiracı korelasyonu (salt okunur)</h2>
              <p>
                Her HTTP isteğinde tenant_id (kiracı kimliği) oturum / koruma katmanından gelir; log ve metriklerde
                trace_id (izleme kimliği) ile birlikte tutulursa destek ve denetim tek satırda birleştirilebilir.
              </p>
            </div>
            <div className="setf-table-wrap">
              <table className="setf-table">
                <thead>
                  <tr>
                    <th>trace_id</th>
                    <th>span_id</th>
                    <th>tenant_id</th>
                    <th>Kullanıcı</th>
                    <th>Rota</th>
                    <th>HTTP</th>
                    <th>ms</th>
                    <th>Zaman</th>
                  </tr>
                </thead>
                <tbody>
                  {OPS_TRACE_PREVIEW_ROWS.map((row) => (
                    <tr key={row.id}>
                      <td className="setf-mono">{row.traceId.slice(0, 12)}…</td>
                      <td className="setf-mono">{row.spanId.slice(0, 12)}…</td>
                      <td>{row.tenantId}</td>
                      <td>{row.principal}</td>
                      <td>{row.route}</td>
                      <td>{row.httpStatus}</td>
                      <td>{row.latencyMs}</td>
                      <td>{new Date(row.occurredAt).toLocaleString("tr-TR")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="setf-section-head" style={{ marginTop: 14 }}>
              <h2>Pilot haftalık deneme özeti</h2>
              <p>Kiracı bazlı operasyon denemelerinin haftalık durum özeti (temel görünüm).</p>
            </div>
            <div className="setf-card-grid">
              {PILOT_WEEKLY_PREVIEW_ROWS.map((row) => (
                <article key={row.id} className="setf-card">
                  <h4>
                    {row.tenantLabel}{" "}
                    <span className={pilotWeeklyBadgeClass(row.status)}>{pilotWeeklyBadgeLabel(row.status)}</span>
                  </h4>
                  <p>
                    Hafta: {new Date(row.weekEnding).toLocaleDateString("tr-TR")} · {row.summary}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
