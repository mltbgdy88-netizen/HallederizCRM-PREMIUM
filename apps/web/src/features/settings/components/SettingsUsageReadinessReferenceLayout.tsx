"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { formatUserFacingHealthStatus, formatUserFacingStatus } from "../../../lib/user-facing-labels";
import { useToast } from "../../../providers/toast-provider";
import type { PilotReadinessItem } from "../../../services/api";
import { getPilotReadinessData } from "../queries";

const GROUP_LABELS: Record<PilotReadinessItem["group"], string> = {
  company_tenant: "Şirket ve kiracı",
  pricing_category_currency: "Fiyat / Kategori / Döviz",
  warehouses_stock: "Depolar ve Stok",
  users_roles: "Kullanıcılar ve Roller",
  data_import: "Veri Yükleme",
  documents_print: "Belge / Yazdırma",
  integrations: "Entegrasyonlar",
  ai_operations: "AI ve Operasyon"
};

function priorityBadgeClass(priority: PilotReadinessItem["priority"]) {
  if (priority === "critical") return "setf-badge setf-badge--danger";
  if (priority === "warning") return "setf-badge setf-badge--warning";
  if (priority === "ready") return "setf-badge setf-badge--success";
  return "setf-badge setf-badge--info";
}

function statusBadgeClass(status: PilotReadinessItem["status"]) {
  if (status === "tamam") return "setf-badge setf-badge--success";
  if (status === "uyari") return "setf-badge setf-badge--warning";
  return "setf-badge setf-badge--danger";
}

export function SettingsUsageReadinessReferenceLayout() {
  const { pushToast } = useToast();
  const [data, setData] = useState<Awaited<ReturnType<typeof getPilotReadinessData>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = () => {
    setLoading(true);
    setError(null);
    void getPilotReadinessData()
      .then(setData)
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : "Hazırlık verisi alınamadı.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    reload();
  }, []);

  const criticalItems = useMemo(() => (data?.items ?? []).filter((i) => i.priority === "critical"), [data]);
  const warningItems = useMemo(() => (data?.items ?? []).filter((i) => i.priority === "warning"), [data]);

  return (
    <div className="setf-home" data-page="settings-usage-readiness-reference" aria-live="polite">
      <p className="setf-crumb">
        <Link href="/ayarlar" className="setf-crumb-link">
          Ayarlar
        </Link>
        <span className="setf-crumb-sep" aria-hidden>
          /
        </span>
        <span>Kullanım hazırlığı</span>
      </p>

      <header className="setf-head">
        <div className="setf-head-text">
          <h1>Kullanım Hazırlığı Merkezi</h1>
          <p>Kritik eksikler, onboarding adımları ve servis sağlık durumlarıyla canlı kullanım kararını tek panelden verin.</p>
        </div>
        <div className="setf-head-actions">
          <button type="button" className="setf-btn setf-btn--primary" disabled={loading} onClick={reload}>
            {loading ? "Yükleniyor…" : "Yenile"}
          </button>
          <Link href="/ayarlar/staging-kontrol" className="setf-btn setf-btn--outline">
            Servis sağlığı
          </Link>
        </div>
      </header>

      <p className="setf-demo-band" role="status">
        Hazırlık paneli salt okunur özet sunar; go-live kararı insan onayı ve backend policy ile verilir.
      </p>

      <section className="setf-kpi-row setf-kpi-row--6" aria-label="Hazırlık özeti">
        <article className="setf-kpi">
          <span className="setf-kpi-label">Tamamlanma</span>
          <span className="setf-kpi-value">{data?.completionRate ?? 0}%</span>
        </article>
        <article className="setf-kpi">
          <span className="setf-kpi-label">Kritik</span>
          <span className="setf-kpi-value">{criticalItems.length}</span>
        </article>
        <article className="setf-kpi">
          <span className="setf-kpi-label">Uyarı</span>
          <span className="setf-kpi-value">{warningItems.length}</span>
        </article>
        <article className="setf-kpi">
          <span className="setf-kpi-label">Entegrasyon</span>
          <span className="setf-kpi-value">{data?.integrationHealth.status ?? "—"}</span>
        </article>
        <article className="setf-kpi">
          <span className="setf-kpi-label">Canlı servis</span>
          <span className="setf-kpi-value">{data?.integrationHealth.liveCount ?? 0}</span>
        </article>
        <article className="setf-kpi">
          <span className="setf-kpi-label">Tutarlılık uyarısı</span>
          <span className="setf-kpi-value">{data?.consistencyWarnings.length ?? 0}</span>
        </article>
      </section>

      <div className="setf-workspace setf-workspace--single">
        <section className="setf-main">
          <div className="setf-main-scroll">
            {error ? <p role="alert">{error}</p> : null}
            {loading ? <p role="status">Hazırlık verisi yükleniyor…</p> : null}

            {!loading && criticalItems.length > 0 ? (
              <>
                <div className="setf-section-head">
                  <h2>Bloklayıcılar</h2>
                </div>
                <div className="setf-card-grid">
                  {criticalItems.map((item) => (
                    <article key={item.id} className="setf-card">
                      <h4>
                        {item.title} <span className={priorityBadgeClass(item.priority)}>Kritik</span>
                      </h4>
                      <p>{item.reason}</p>
                      <p>Sonraki adım: {item.recommendedNextStep}</p>
                      <Link href={item.actionHref} className="setf-btn setf-btn--primary">
                        {item.actionLabel}
                      </Link>
                    </article>
                  ))}
                </div>
              </>
            ) : null}

            <div className="setf-section-head" style={{ marginTop: 12 }}>
              <h2>Tüm hazırlık maddeleri</h2>
            </div>
            <div
              className="setf-list-header"
              style={{ gridTemplateColumns: "1.2fr 0.9fr 0.7fr 0.7fr 0.8fr" }}
            >
              <div>Başlık</div>
              <div>Grup</div>
              <div>Durum</div>
              <div>Öncelik</div>
              <div>Aksiyon</div>
            </div>
            <div className="setf-list-body">
              {(data?.items ?? []).map((item) => (
                <div
                  key={item.id}
                  className="setf-list-row"
                  style={{ gridTemplateColumns: "1.2fr 0.9fr 0.7fr 0.7fr 0.8fr" }}
                >
                  <div className="admf-cell-strong">{item.title}</div>
                  <div>{GROUP_LABELS[item.group]}</div>
                  <div>
                    <span className={statusBadgeClass(item.status)}>{formatUserFacingStatus(item.status)}</span>
                  </div>
                  <div>
                    <span className={priorityBadgeClass(item.priority)}>{formatUserFacingStatus(item.priority)}</span>
                  </div>
                  <div>
                    <button
                      type="button"
                      className="setf-btn setf-btn--ghost"
                      onClick={() => pushToast(`Demo: ${item.actionLabel} sonraki fazda bağlanacak.`)}
                    >
                      {item.actionLabel}
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
