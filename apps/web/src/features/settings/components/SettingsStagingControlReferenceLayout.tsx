"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { formatUserFacingHealthStatus, formatUserFacingMode, formatUserFacingServiceName } from "../../../lib/user-facing-labels";
import { useToast } from "../../../providers/toast-provider";
import {
  getIntegrationHealthSummaryApi,
  type IntegrationsHealthSummary,
  type ServiceHealthRecord
} from "../../../services/api/health.service";
import { runStagingIntegrationServiceTest } from "../utils/run-staging-integration-test";

const SERVICE_ORDER = ["ai", "whatsapp", "erp", "factory", "local-agent"] as const;

type RunState = "idle" | "running" | "ok" | "error";

function runLabel(state: RunState) {
  if (state === "running") return "Çalışıyor";
  if (state === "ok") return "Tamam";
  if (state === "error") return "Başarısız";
  return "Hazır";
}

function getBadgeClass(status: ServiceHealthRecord["status"]) {
  if (status === "healthy") return "setf-badge setf-badge--success";
  if (status === "degraded" || status === "fallback") return "setf-badge setf-badge--warning";
  if (status === "error" || status === "misconfigured") return "setf-badge setf-badge--danger";
  return "setf-badge setf-badge--info";
}

function statusDisplayLabel(status: ServiceHealthRecord["status"]) {
  if (status === "healthy") return "Hazır";
  if (status === "fallback" || status === "degraded") return "Yedek görünüm";
  if (status === "misconfigured") return "Yapılandırma eksik";
  if (status === "disabled") return "Devre dışı";
  return "Hata";
}

export function SettingsStagingControlReferenceLayout() {
  const { pushToast } = useToast();
  const [summary, setSummary] = useState<IntegrationsHealthSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [runState, setRunState] = useState<Record<string, RunState>>({});

  const services = useMemo(() => {
    if (!summary) return [] as ServiceHealthRecord[];
    const map = new Map(summary.services.map((item) => [item.service, item]));
    return SERVICE_ORDER.map((service) => map.get(service)).filter((item): item is ServiceHealthRecord => Boolean(item));
  }, [summary]);

  const reload = () => {
    setLoading(true);
    setFeedback(null);
    void getIntegrationHealthSummaryApi()
      .then(setSummary)
      .catch((error) => {
        setFeedback(error instanceof Error ? error.message : "Servis sağlığı bilgisi alınamadı.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    reload();
  }, []);

  const runTest = async (service: string) => {
    setRunState((previous) => ({ ...previous, [service]: "running" }));
    setFeedback(null);
    try {
      await runStagingIntegrationServiceTest(service);
      const message =
        service === "local-agent"
          ? "Yerel araç deneme testi tamamlandı. Canlı yazdırma yerine güvenli simülasyon doğrulamasıdır."
          : `${formatUserFacingServiceName(service)} testi tamamlandı.`;
      setFeedback(message);
      pushToast(message);
      setRunState((previous) => ({ ...previous, [service]: "ok" }));
      reload();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : `${formatUserFacingServiceName(service)} testi başarısız oldu.`;
      setFeedback(message);
      pushToast(message);
      setRunState((previous) => ({ ...previous, [service]: "error" }));
      reload();
    }
  };

  return (
    <div className="setf-home" data-page="settings-staging-control-reference" aria-live="polite">
      <p className="setf-crumb">
        <Link href="/ayarlar" className="setf-crumb-link">
          Ayarlar
        </Link>
        <span className="setf-crumb-sep" aria-hidden>
          /
        </span>
        <span>Hazırlık kontrolü</span>
      </p>

      <header className="setf-head">
        <div className="setf-head-text">
          <h1>Hazırlık Kontrolü</h1>
          <p>Servis sağlığı ve entegrasyon doğrulama paneli — staging ortamı için operasyon görünümü.</p>
        </div>
        <div className="setf-head-actions">
          <button type="button" className="setf-btn setf-btn--primary" disabled={loading} onClick={reload}>
            {loading ? "Yükleniyor…" : "Yenile"}
          </button>
        </div>
      </header>

      <p className="setf-demo-band" role="status">
        Test butonları backend dry-run/ping endpointlerini çağırır; kritik mutation onaysız çalışmaz.
      </p>

      <section className="setf-kpi-row" aria-label="Servis özeti">
        <article className="setf-kpi">
          <span className="setf-kpi-label">Genel durum</span>
          <span className="setf-kpi-value">{summary ? formatUserFacingHealthStatus(summary.status) : "—"}</span>
        </article>
        <article className="setf-kpi">
          <span className="setf-kpi-label">Yapılandırılmış</span>
          <span className="setf-kpi-value">{summary?.configuredCount ?? 0}</span>
        </article>
        <article className="setf-kpi">
          <span className="setf-kpi-label">Canlı</span>
          <span className="setf-kpi-value">{summary?.liveCount ?? 0}</span>
        </article>
        <article className="setf-kpi">
          <span className="setf-kpi-label">Yedek görünüm</span>
          <span className="setf-kpi-value">{summary?.fallbackCount ?? 0}</span>
        </article>
      </section>

      <div className="setf-workspace setf-workspace--single">
        <section className="setf-main">
          <div className="setf-main-scroll">
            {feedback ? <p role="alert">{feedback}</p> : null}
            {loading ? <p role="status">Servis durumu yükleniyor…</p> : null}

            <div
              className="setf-list-header"
              style={{ gridTemplateColumns: "0.8fr 0.7fr 0.7fr 1.4fr 0.7fr" }}
            >
              <div>Servis</div>
              <div>Durum</div>
              <div>Mod</div>
              <div>Not</div>
              <div>Test</div>
            </div>
            <div className="setf-list-body">
              {services.map((service) => (
                <div
                  key={service.service}
                  className="setf-list-row"
                  style={{ gridTemplateColumns: "0.8fr 0.7fr 0.7fr 1.4fr 0.7fr" }}
                >
                  <div className="admf-cell-strong">{formatUserFacingServiceName(service.service)}</div>
                  <div>
                    <span className={getBadgeClass(service.status)}>{statusDisplayLabel(service.status)}</span>
                  </div>
                  <div>{formatUserFacingMode(service.mode)}</div>
                  <div>{service.reason}</div>
                  <div>
                    <button
                      type="button"
                      className="setf-btn setf-btn--outline"
                      disabled={runState[service.service] === "running"}
                      onClick={() => void runTest(service.service)}
                    >
                      Test ({runLabel(runState[service.service] ?? "idle")})
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
