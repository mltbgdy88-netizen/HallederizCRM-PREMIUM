"use client";

import { MetricCard, PageHeader, PrimaryActionToolbar, SplitContentLayout } from "@hallederiz/ui";
import { useEffect, useMemo, useState } from "react";
import {
  getIntegrationHealthSummaryApi,
  runAiTestChatApi,
  runAiTestSttApi,
  runAiTestTtsApi,
  runErpTestApi,
  runFactoryTestSyncApi,
  runLocalAgentPrintDryRunApi,
  runLocalAgentSaveDryRunApi,
  runWhatsAppTestSendApi,
  type IntegrationsHealthSummary,
  type ServiceHealthRecord
} from "../../../services/api/health.service";

type RunState = "idle" | "running" | "ok" | "error";

const SERVICE_ORDER = ["ai", "whatsapp", "erp", "factory", "local-agent"] as const;

function getStatusTone(status: ServiceHealthRecord["status"]): "info" | "success" | "warning" | "danger" | "neutral" {
  if (status === "healthy") return "success";
  if (status === "degraded" || status === "fallback") return "warning";
  if (status === "error" || status === "misconfigured") return "danger";
  return "neutral";
}

function getBadgeClass(status: ServiceHealthRecord["status"]) {
  if (status === "healthy") return "hz-badge hz-badge-success";
  if (status === "degraded" || status === "fallback") return "hz-badge hz-badge-warning";
  if (status === "error" || status === "misconfigured") return "hz-badge hz-badge-danger";
  return "hz-badge hz-badge-info";
}

function statusDisplayLabel(status: ServiceHealthRecord["status"]) {
  if (status === "healthy") return "Hazir";
  if (status === "fallback" || status === "degraded") return "Yerel Gelistirme / Fallback";
  if (status === "misconfigured") return "Yapilandirma Eksik";
  if (status === "disabled") return "Devre Disi";
  return "Hata";
}

function renderServiceReason(service: ServiceHealthRecord) {
  if (service.service !== "ai") return service.reason;
  const localStatus = String(service.details?.localStatus ?? "unknown");
  const externalStatus = String(service.details?.externalStatus ?? "unknown");
  const active = String(service.details?.activeProviderMode ?? service.mode);
  return `${service.reason} | Local: ${localStatus} | External: ${externalStatus} | Aktif: ${active}`;
}

function runLabel(state: RunState) {
  if (state === "running") return "Calisiyor...";
  if (state === "ok") return "Basarili";
  if (state === "error") return "Basarisiz";
  return "Hazir";
}

export function StagingValidationPage() {
  const [summary, setSummary] = useState<IntegrationsHealthSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [runState, setRunState] = useState<Record<string, RunState>>({});

  const services = useMemo(() => {
    if (!summary) return [] as ServiceHealthRecord[];
    const map = new Map(summary.services.map((item) => [item.service, item]));
    return SERVICE_ORDER.map((service) => map.get(service)).filter((item): item is ServiceHealthRecord => Boolean(item));
  }, [summary]);

  const reload = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const result = await getIntegrationHealthSummaryApi();
      setSummary(result);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Servis sagligi bilgisi alinamadi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void reload();
  }, []);

  const runTest = async (service: string) => {
    setRunState((previous) => ({ ...previous, [service]: "running" }));
    try {
      if (service === "ai") {
        await runAiTestChatApi();
        await runAiTestSttApi();
        await runAiTestTtsApi();
      } else if (service === "whatsapp") {
        await runWhatsAppTestSendApi();
      } else if (service === "erp") {
        await runErpTestApi();
      } else if (service === "factory") {
        await runFactoryTestSyncApi();
      } else if (service === "local-agent") {
        await runLocalAgentSaveDryRunApi();
        await runLocalAgentPrintDryRunApi();
      }
      setFeedback(
        service === "local-agent"
          ? "LOCAL-AGENT dry-run testi tamamlandi. Bu sonuc canli yazdirma yerine guvenli simulasyon dogrulamasidir."
          : `${service.toUpperCase()} testi tamamlandi.`
      );
      setRunState((previous) => ({ ...previous, [service]: "ok" }));
      await reload();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : `${service.toUpperCase()} testi basarisiz oldu.`);
      setRunState((previous) => ({ ...previous, [service]: "error" }));
      await reload();
    }
  };

  return (
    <div className="hz-page-stack">
      <PageHeader
        title="Staging Kontrol"
        description="Canli baglantiya gecis oncesi AI, WhatsApp, ERP, Fabrika ve Local Agent servis sagligini dogrulayin."
      />

      <section className="hz-metric-grid">
        <MetricCard title="Genel Durum" value={summary?.status ?? "-"} detail="Toplu health sonucu" tone={getStatusTone(summary?.status ?? "fallback")} />
        <MetricCard title="Live Servis" value={String(summary?.liveCount ?? 0)} detail="Canli moda hazir" tone="success" />
        <MetricCard title="Fallback" value={String(summary?.fallbackCount ?? 0)} detail="Guvenli yedek mod" tone="warning" />
        <MetricCard title="Disabled" value={String(summary?.disabledCount ?? 0)} detail="Devre disi servis" tone="neutral" />
      </section>

      <PrimaryActionToolbar>
        <button className="hz-btn hz-toolbar-btn hz-btn-primary" type="button" onClick={() => void reload()} disabled={loading}>
          {loading ? "Yukleniyor..." : "Saglik Durumunu Yenile"}
        </button>
      </PrimaryActionToolbar>

      {feedback ? (
        <section className="hz-content-card">
          <p className="muted">{feedback}</p>
        </section>
      ) : null}

      <SplitContentLayout
        main={
          <section className="hz-content-card">
            <h3>Servis Sagligi ve Test Aksiyonlari</h3>
            <div className="table-wrap hz-table-wrap">
              <table className="table hz-table">
                <thead>
                  <tr>
                    <th>Servis</th>
                    <th>Durum</th>
                    <th>Mod</th>
                    <th>Configured</th>
                    <th>Son Kontrol</th>
                    <th>Mesaj</th>
                    <th>Test</th>
                  </tr>
                </thead>
                <tbody>
                  {services.length === 0 ? (
                    <tr>
                      <td className="table-empty" colSpan={7}>Servis sagligi bilgisi bekleniyor.</td>
                    </tr>
                  ) : (
                    services.map((service) => (
                      <tr key={service.service}>
                        <td>{service.service}</td>
                        <td>
                          <span className={getBadgeClass(service.status)}>{statusDisplayLabel(service.status)}</span>
                        </td>
                        <td>{service.mode}</td>
                        <td>{service.configured ? "Evet" : "Hayir"}</td>
                        <td>{new Date(service.lastCheckedAt).toLocaleString("tr-TR")}</td>
                        <td>{renderServiceReason(service)}</td>
                        <td>
                          <button
                            className="hz-btn hz-btn-secondary"
                            type="button"
                            onClick={() => void runTest(service.service)}
                            disabled={runState[service.service] === "running"}
                          >
                            Test Et ({runLabel(runState[service.service] ?? "idle")})
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        }
        side={
          <div className="hz-page-stack">
            <aside className="hz-side-panel">
              <h3>Fallback Durumu</h3>
              <p className="muted">AI local-first calisir; external provider opsiyoneldir. Live olmayan servisler fallback veya disabled modda calisir. Kritik mutationlar onaysiz canliya gitmez.</p>
              <p className="muted">Not: Bazi testler dry-run/foundation seviyesinde sadece zincir dogrulama yapar; canli operasyon etkisi uretmez.</p>
              <div className="detail-list">
                <span>Configured Servis</span>
                <strong>{summary?.configuredCount ?? 0}</strong>
                <span>Son Kontrol</span>
                <strong>{summary?.lastCheckedAt ? new Date(summary.lastCheckedAt).toLocaleString("tr-TR") : "-"}</strong>
              </div>
            </aside>
            <aside className="hz-side-panel">
              <h3>Son Kontrol Listesi</h3>
              <ul className="hz-side-list">
                {services.slice(0, 5).map((service) => (
                  <li key={`${service.service}-last`}>
                    <strong>{service.service}</strong>
                    <div>{service.reason}</div>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        }
      />
    </div>
  );
}
