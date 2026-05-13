"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MetricCard, PageHeader } from "@hallederiz/ui";
import type { ProductionReadinessSummary } from "../../../services/api";
import { getProductionReadinessData } from "../queries";

function statusBadgeClass(status: ProductionReadinessSummary["overallStatus"]) {
  if (status === "ready") return "hz-badge hz-badge-success";
  if (status === "degraded") return "hz-badge hz-badge-warning";
  return "hz-badge hz-badge-danger";
}

function statusLabel(status: ProductionReadinessSummary["overallStatus"]) {
  if (status === "ready") return "Hazir";
  if (status === "degraded") return "Eksik";
  return "Bloklu";
}

export function ProductionReadinessPage() {
  const [data, setData] = useState<ProductionReadinessSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await getProductionReadinessData());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Production readiness bilgisi alinamadi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="hz-page-stack">
      <PageHeader
        title="Canli Kullanim Hazirligi"
        description="Demo/mock/foundation davranislarinin production'da gercek basari gibi gorunmesini engelleyen readiness kontrol paneli."
        actions={
          <div className="hz-inline-actions">
            <button type="button" className="hz-btn hz-btn-primary" onClick={() => void load()} disabled={loading}>
              {loading ? "Yukleniyor..." : "Yenile"}
            </button>
            <Link href="/ayarlar" className="hz-btn hz-btn-secondary">
              Ayarlara Don
            </Link>
          </div>
        }
      />

      {error ? (
        <section className="hz-content-card">
          <p className="muted">{error}</p>
        </section>
      ) : null}

      <section className="hz-metric-grid">
        <MetricCard title="Genel Durum" value={data ? statusLabel(data.overallStatus) : "-"} detail="Ready/Degraded/Blocked" tone={data?.overallStatus === "ready" ? "success" : data?.overallStatus === "degraded" ? "warning" : "danger"} />
        <MetricCard title="Blokaj" value={String(data?.blockers.length ?? 0)} detail="Canli acilisi durduran kritikler" tone={(data?.blockers.length ?? 0) > 0 ? "danger" : "success"} />
        <MetricCard title="Uyari" value={String(data?.warnings.length ?? 0)} detail="Acilis oncesi giderilmesi onerilenler" tone={(data?.warnings.length ?? 0) > 0 ? "warning" : "success"} />
        <MetricCard title="Eksik ENV" value={String(data?.missingEnv.length ?? 0)} detail="Runtime zorunlu env eksikleri" tone={(data?.missingEnv.length ?? 0) > 0 ? "danger" : "success"} />
      </section>

      {data ? (
        <>
          <section className="hz-content-card">
            <div className="hz-inline-actions" style={{ justifyContent: "space-between" }}>
              <h3>Durum Ozeti</h3>
              <span className={statusBadgeClass(data.overallStatus)}>{statusLabel(data.overallStatus)}</span>
            </div>
            <div className="detail-list">
              <span>Environment</span>
              <strong>{data.environment.nodeEnv}</strong>
              <span>Persistence</span>
              <strong>{data.persistence.mode}</strong>
              <span>DB Config</span>
              <strong>{data.database.configured ? "Var" : "Yok"}</strong>
              <span>Approval Execution</span>
              <strong>{data.approvalExecution.mode}</strong>
              <span>Worker Mode</span>
              <strong>{data.workerOutbox.workerMode}</strong>
            </div>
          </section>

          <section className="hz-content-card">
            <h3>Gercek Calisir Mi?</h3>
            <ul className="hz-side-list">
              <li>Approval execution: {data.approvalExecution.ready ? "Evet" : "Hayir"}</li>
              <li>Worker durable outbox: {data.workerOutbox.ready ? "Evet" : "Hayir"}</li>
              <li>Tenant usage DB-backed: {data.tenantUsage.ready ? "Evet" : "Hayir"}</li>
              <li>Omnichannel DB-backed: {data.omnichannel.ready ? "Evet" : "Hayir"}</li>
              <li>WhatsApp live env: {data.whatsapp.liveEnvConfigured ? "Evet" : "Hayir"}</li>
              <li>Local AI configured: {data.localAi.configured ? "Evet" : "Degil"}</li>
              <li>Local-agent configured: {data.localAgent.configured ? "Evet" : "Degil"}</li>
            </ul>
          </section>

          <section className="hz-content-card">
            <h3>Eksik ve Riskler</h3>
            <div className="hz-compact-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
              <article className="hz-side-panel">
                <h4>Blockerlar</h4>
                <ul className="hz-side-list">
                  {data.blockers.length === 0 ? <li>Kritik blocker yok.</li> : data.blockers.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </article>
              <article className="hz-side-panel">
                <h4>Uyarilar</h4>
                <ul className="hz-side-list">
                  {data.warnings.length === 0 ? <li>Uyari yok.</li> : data.warnings.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </article>
              <article className="hz-side-panel">
                <h4>Eksik Env</h4>
                <ul className="hz-side-list">
                  {data.missingEnv.length === 0 ? <li>Eksik env yok.</li> : data.missingEnv.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </article>
              <article className="hz-side-panel">
                <h4>Unsafe fallback</h4>
                <ul className="hz-side-list">
                  {data.unsafeFallbacks.length === 0 ? <li>Unsafe fallback yok.</li> : data.unsafeFallbacks.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </article>
            </div>
          </section>

          <section className="hz-content-card">
            <h3>Provider Durumu</h3>
            <div className="table-wrap hz-table-wrap">
              <table className="table hz-table">
                <thead>
                  <tr>
                    <th>Kanal</th>
                    <th>Mode</th>
                    <th>Hazir</th>
                  </tr>
                </thead>
                <tbody>
                  {data.omnichannel.providerModes.map((provider) => (
                    <tr key={provider.kind}>
                      <td>{provider.kind}</td>
                      <td>{provider.mode}</td>
                      <td>{provider.ok ? "Evet" : "Hayir"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}

