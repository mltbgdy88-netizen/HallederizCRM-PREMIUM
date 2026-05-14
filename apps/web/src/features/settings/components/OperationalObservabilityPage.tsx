"use client";

import { MetricCard, PageHeader } from "@hallederiz/ui";
import { dataSourceConfig } from "../../../lib/data-source";
import { OPS_TRACE_PREVIEW_ROWS } from "../data/operational-observability-mock";
import { SettingsAreaShell } from "./SettingsAreaShell";

export function OperationalObservabilityPage() {
  return (
    <SettingsAreaShell>
      <div className="hz-page-stack hz-ops-obs-page">
        <PageHeader
          title="Operasyon ve gozlem"
          description="Istek zincirinde tenant baglami ile trace/span korelasyonu; metrik ve log hatlari icin foundation gorunumu."
        />

        {dataSourceConfig.useDemoData ? (
          <div className="hz-ops-obs-preview-band" role="status">
            Demo veri: asagidaki trace satirlari ornek; canli ortamda OpenTelemetry / log pipeline tenant_id + trace_id tasir.
          </div>
        ) : null}

        <section className="hz-metric-grid hz-ops-obs-metrics">
          <MetricCard title="Ornek trace" value={String(OPS_TRACE_PREVIEW_ROWS.length)} detail="Son istekler (demo)" tone="info" />
          <MetricCard title="Tenant scope" value="Zorunlu" detail="API guard + context" tone="success" />
          <MetricCard title="Ornek p99" value="118 ms" detail="Worker dispatch" tone="warning" />
          <MetricCard title="Korelasyon" value="trace_id" detail="W3C + tenant_id" tone="neutral" />
        </section>

        <section className="hz-content-card hz-ops-obs-card">
          <h3>Tenant korelasyonu (salt okunur)</h3>
          <p className="muted hz-ops-obs-lead">
            Her HTTP isteginde <strong>tenant_id</strong> oturum / guard katmanindan gelir; log ve metriklerde{" "}
            <strong>trace_id</strong> ile birlikte tutulursa destek ve denetim tek satirda birlestirilebilir. Ham approval
            tokeni veya hassas PII loglanmamalidir.
          </p>
          <div className="table-wrap hz-table-wrap hz-ops-obs-table-wrap">
            <table className="table hz-table">
              <thead>
                <tr>
                  <th>trace_id (on ek)</th>
                  <th>span_id</th>
                  <th>tenant_id</th>
                  <th>principal</th>
                  <th>Route</th>
                  <th>HTTP</th>
                  <th>ms</th>
                  <th>Zaman</th>
                </tr>
              </thead>
              <tbody>
                {OPS_TRACE_PREVIEW_ROWS.map((row) => (
                  <tr key={row.id}>
                    <td className="hz-ops-obs-mono">{row.traceId.slice(0, 12)}…</td>
                    <td className="hz-ops-obs-mono">{row.spanId.slice(0, 12)}…</td>
                    <td>{row.tenantId}</td>
                    <td>{row.principal}</td>
                    <td className="hz-ops-obs-route">{row.route}</td>
                    <td>{row.httpStatus}</td>
                    <td>{row.latencyMs}</td>
                    <td>{new Date(row.occurredAt).toLocaleString("tr-TR")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="hz-content-card hz-ops-obs-card">
          <h3>Release ve pilot kabul</h3>
          <p className="muted">
            Tam kontrol listeleri repoda: <code className="hz-ops-obs-code">docs/development/RELEASE_CHECKLIST.md</code>,{" "}
            <code className="hz-ops-obs-code">docs/implementation/016-pilot-acceptance-checklist.md</code>.
          </p>
          <ul className="hz-ops-obs-checklist">
            <li>CI: typecheck, lint, test ve smoke komutlari yesil.</li>
            <li>Production: demo/mock auth kapali; tenant isolation ve permission guard regresyonu yok.</li>
            <li>WhatsApp: imza ve secret fail-closed; ham onay tokeni loglanmiyor.</li>
            <li>AI: proposal-only; onaysiz execution yok; audit/timeline yazimi biliniyor.</li>
            <li>Entegrasyon: canli yoksa kontrollu hata; sessiz basari yok.</li>
            <li>Operasyon: rollback plani; pilot durum dokumanlari guncel.</li>
          </ul>
          <p className="muted hz-ops-obs-foot">
            Haftalik pilot geri bildirimi is sureci; bu ekran teknik hazirlik ve korelasyon politikasini hatirlatir.
          </p>
        </section>
      </div>
    </SettingsAreaShell>
  );
}
