"use client";

import { MetricCard, PageHeader, PrimaryActionToolbar, SplitContentLayout } from "@hallederiz/ui";
import { formatUserFacingHealthStatus, formatUserFacingMode, formatUserFacingServiceName } from "../../../lib/user-facing-labels";
import { SettingsAreaShell } from "./SettingsAreaShell";
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
  if (status === "healthy") return "Sağlıklı";
  if (status === "fallback" || status === "degraded") return "Yerel geliştirme / yedek görünüm";
  if (status === "misconfigured") return "Yapilandirma Eksik";
  if (status === "disabled") return "Devre dışı";
  return "Hata";
}

function renderServiceReason(service: ServiceHealthRecord) {
  if (service.service !== "ai") return service.reason;
  const localStatus = String(service.details?.localStatus ?? "unknown");
  const externalStatus = String(service.details?.externalStatus ?? "unknown");
  const active = String(service.details?.activeProviderMode ?? service.mode);
  return `${service.reason} | Yerel: ${formatUserFacingHealthStatus(localStatus)} | Dış: ${formatUserFacingHealthStatus(externalStatus)} | Aktif: ${formatUserFacingMode(active)}`;
}

function runLabel(state: RunState) {
  if (state === "running") return "Çalışıyor…";
  if (state === "ok") return "Başarılı";
  if (state === "error") return "Başarısız";
  return "Hazır";
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
      setFeedback(error instanceof Error ? error.message : "Servis sağlığı bilgisi alınamadı.");
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
          ? "Yerel araç deneme testi tamamlandı. Bu sonuç canlı yazdırma yerine güvenli simülasyon doğrulamasıdır."
          : `${formatUserFacingServiceName(service)} testi tamamlandı.`
      );
      setRunState((previous) => ({ ...previous, [service]: "ok" }));
      await reload();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : `${formatUserFacingServiceName(service)} testi başarısız oldu.`);
      setRunState((previous) => ({ ...previous, [service]: "error" }));
      await reload();
    }
  };

  return (
    <SettingsAreaShell>
      <div className="hz-page-stack">
      <PageHeader
        title="Hazırlık kontrolü"
        description="Canlı bağlantıya geçiş öncesi AI, WhatsApp, ERP, fabrika ve yerel aracı servis sağlığını doğrulayın."
      />

      <section className="hz-metric-grid">
        <MetricCard title="Genel Durum" value={summary ? formatUserFacingHealthStatus(summary.status) : "—"} detail="Toplu sağlık durumu sonucu" tone={getStatusTone(summary?.status ?? "fallback")} />
        <MetricCard title="Canlı servis" value={String(summary?.liveCount ?? 0)} detail="Canlı moda hazır" tone="success" />
        <MetricCard title="Yedek görünüm" value={String(summary?.fallbackCount ?? 0)} detail="Güvenli yedek mod" tone="warning" />
        <MetricCard title="Devre dışı" value={String(summary?.disabledCount ?? 0)} detail="Devre dışı servis" tone="neutral" />
      </section>

      <PrimaryActionToolbar>
        <button className="hz-btn hz-toolbar-btn hz-btn-primary" type="button" onClick={() => void reload()} disabled={loading}>
          {loading ? "Yükleniyor…" : "Sağlık durumunu yenile"}
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
            <h3>Servis sağlığı ve test aksiyonları</h3>
            <div className="table-wrap hz-table-wrap">
              <table className="table hz-table">
                <thead>
                  <tr>
                    <th>Servis</th>
                    <th>Durum</th>
                    <th>Mod</th>
                    <th>Yapılandırıldı</th>
                    <th>Son kontrol</th>
                    <th>Mesaj</th>
                    <th>Test</th>
                  </tr>
                </thead>
                <tbody>
                  {services.length === 0 ? (
                    <tr>
                      <td className="table-empty" colSpan={7}>Servis sağlığı bilgisi bekleniyor.</td>
                    </tr>
                  ) : (
                    services.map((service) => (
                      <tr key={service.service}>
                        <td>{formatUserFacingServiceName(service.service)}</td>
                        <td>
                          <span className={getBadgeClass(service.status)}>{statusDisplayLabel(service.status)}</span>
                        </td>
                        <td>{formatUserFacingMode(service.mode)}</td>
                        <td>{service.configured ? "Evet" : "Hayır"}</td>
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
              <h3>Yedek görünüm durumu</h3>
              <p className="muted">Yapay zekâ yerel öncelikli çalışır; dış sağlayıcı isteğe bağlıdır. Canlı olmayan servisler yedek görünüm veya devre dışı modda çalışır. Kritik işlemler onaysız canlıya gitmez.</p>
              <p className="muted">Not: Bazı testler kuru çalıştırma/temel mod seviyesinde yalnızca zincir doğrulaması yapar; canlı operasyon etkisi üretmez.</p>
              <div className="detail-list">
                <span>Yapılandırılmış servis</span>
                <strong>{summary?.configuredCount ?? 0}</strong>
                <span>Son kontrol</span>
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
    </SettingsAreaShell>
  );
}
