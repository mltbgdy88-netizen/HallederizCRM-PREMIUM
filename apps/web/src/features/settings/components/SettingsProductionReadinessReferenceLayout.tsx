"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  formatProductionOverallStatus,
  formatUserFacingEnvironment,
  formatUserFacingMode,
  formatYesNo
} from "../../../lib/user-facing-labels";
import type { ProductionReadinessSummary } from "../../../services/api";
import { getProductionReadinessData } from "../queries";

function statusBadgeClass(status: ProductionReadinessSummary["overallStatus"]) {
  if (status === "ready") return "setf-badge setf-badge--success";
  if (status === "degraded") return "setf-badge setf-badge--warning";
  return "setf-badge setf-badge--danger";
}

const statusLabel = formatProductionOverallStatus;

export function SettingsProductionReadinessReferenceLayout() {
  const [data, setData] = useState<ProductionReadinessSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    setError(null);
    void getProductionReadinessData()
      .then(setData)
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : "Canlı hazırlık bilgisi alınamadı.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="setf-home" data-page="settings-production-readiness-reference" aria-live="polite">
      <p className="setf-crumb">
        <Link href="/ayarlar" className="setf-crumb-link">
          Ayarlar
        </Link>
        <span className="setf-crumb-sep" aria-hidden>
          /
        </span>
        <span>Canlıya hazırlık</span>
      </p>

      <header className="setf-head">
        <div className="setf-head-text">
          <h1>Canlı Kullanım Hazırlığı</h1>
          <p>Demo/mock/foundation davranışlarının canlı ortamda gerçek başarı gibi görünmesini engelleyen canlıya hazırlık kontrol paneli.</p>
        </div>
        <div className="setf-head-actions">
          <button type="button" className="setf-btn setf-btn--primary" disabled={loading} onClick={load}>
            {loading ? "Yükleniyor…" : "Yenile"}
          </button>
        </div>
      </header>

      <p className="setf-demo-band" role="status">
        Canlıya hazırlık kontrolleri bilgilendirme amaçlıdır; canlı geçiş kararı operasyon ve güvenlik onayı gerektirir.
      </p>

      <section className="setf-kpi-row" aria-label="Canlı hazırlık özeti">
        <article className="setf-kpi">
          <span className="setf-kpi-label">Genel durum</span>
          <span className="setf-kpi-value">{data ? statusLabel(data.overallStatus) : "—"}</span>
        </article>
        <article className="setf-kpi">
          <span className="setf-kpi-label">Blokaj</span>
          <span className="setf-kpi-value">{data?.blockers.length ?? 0}</span>
        </article>
        <article className="setf-kpi">
          <span className="setf-kpi-label">Uyarı</span>
          <span className="setf-kpi-value">{data?.warnings.length ?? 0}</span>
        </article>
        <article className="setf-kpi">
          <span className="setf-kpi-label">Eksik ortam değişkeni</span>
          <span className="setf-kpi-value">{data?.missingEnv.length ?? 0}</span>
        </article>
      </section>

      <div className="setf-workspace setf-workspace--single">
        <section className="setf-main">
          <div className="setf-main-scroll">
            {error ? <p role="alert">{error}</p> : null}
            {loading ? <p role="status">Canlı hazırlık verisi yükleniyor…</p> : null}

            {data ? (
              <>
                <div className="setf-section-head">
                  <h2>
                    Durum özeti{" "}
                    <span className={statusBadgeClass(data.overallStatus)}>{statusLabel(data.overallStatus)}</span>
                  </h2>
                  <p>
                    Kiracı: {data.tenantId} · Ortam: {formatUserFacingEnvironment(data.environment.nodeEnv)}
                  </p>
                </div>

                <div className="setf-detail-grid" style={{ marginBottom: 12 }}>
                  <div>
                    <span className="setf-field-label">Kalıcılık</span>
                    <strong>{formatUserFacingMode(data.persistence.mode)}</strong>
                  </div>
                  <div>
                    <span className="setf-field-label">Onay çalıştırma</span>
                    <strong>{formatUserFacingMode(data.approvalExecution.mode)}</strong>
                  </div>
                  <div>
                    <span className="setf-field-label">Çalışan servis modu</span>
                    <strong>{formatUserFacingMode(data.workerOutbox.workerMode)}</strong>
                  </div>
                  <div>
                    <span className="setf-field-label">Veritabanı</span>
                    <strong>{formatYesNo(data.database.configured)}</strong>
                  </div>
                </div>

                {data.blockers.length > 0 ? (
                  <>
                    <div className="setf-section-head">
                      <h3>Bloklayıcılar</h3>
                    </div>
                    <ul className="setf-side-list">
                      {data.blockers.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </>
                ) : null}

                {data.warnings.length > 0 ? (
                  <>
                    <div className="setf-section-head" style={{ marginTop: 12 }}>
                      <h3>Uyarılar</h3>
                    </div>
                    <ul className="setf-side-list">
                      {data.warnings.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </>
                ) : null}

                {data.missingEnv.length > 0 ? (
                  <>
                    <div className="setf-section-head" style={{ marginTop: 12 }}>
                      <h3>Eksik ortam değişkenleri</h3>
                    </div>
                    <ul className="setf-side-list">
                      {data.missingEnv.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </>
                ) : null}
              </>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
