"use client";

import type { ErpConnection, ErpMapping, ErpSyncLog, IntegrationHealthSummary } from "@hallederiz/types";
import { useEffect, useMemo, useState } from "react";
import { formatUserFacingStatus } from "../../../lib/user-facing-labels";
import { useToast } from "../../../providers/toast-provider";
import type { ErpIntegrationData } from "../queries";
import { useErpChannel } from "../hooks/use-erp-channel";
import { useErpIntegrationData } from "../hooks/use-erp-integration-data";
import { ErpChannelBand } from "./ErpChannelBand";
import { ErpFeedbackState } from "./ErpFeedbackState";
import { syncErpConnectionMutation, testErpConnectionMutation } from "../mutations";
import { canOperateErpConnection } from "../utils/map-erp-channel-view";

const typeLabel = { api: "API", excel: "Excel" } as const;
const modeLabel = { import_only: "İçe aktarım", export_only: "Dışa aktarım", bidirectional: "Çift yönlü" } as const;
const statusLabel: Record<string, string> = {
  healthy: "Sağlıklı",
  warning: "Uyarı",
  error: "Hata",
  passive: "Pasif"
};

function statusBadgeClass(status: string): string {
  if (status === "healthy") return "erpf-badge--success";
  if (status === "warning") return "erpf-badge--warn";
  if (status === "error" || status === "failed") return "erpf-badge--danger";
  return "";
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("tr-TR");
  } catch {
    return "—";
  }
}

export function ErpHealthPanel({
  health,
  connection
}: {
  health: IntegrationHealthSummary;
  connection?: ErpConnection;
}) {
  return (
    <section className="erpf-card erpf-side-card">
      <h3>Bağlantı sağlığı</h3>
      <p className="erpf-side-note">{health.message}</p>
      <ul className="erpf-side-list">
        <li>
          <span>Genel durum</span>
          <strong>{formatUserFacingStatus(health.status)}</strong>
        </li>
        <li>
          <span>Aktif bağlantı</span>
          <strong>{health.activeConnectionCount}</strong>
        </li>
        <li>
          <span>Uyarı</span>
          <strong>{health.warningCount}</strong>
        </li>
        <li>
          <span>Hata</span>
          <strong>{health.errorCount}</strong>
        </li>
        <li>
          <span>Son senkron</span>
          <strong>{formatDate(health.lastSyncedAt)}</strong>
        </li>
      </ul>
      {connection ? (
        <>
          <h3 style={{ marginTop: 12 }}>Seçili bağlantı</h3>
          <ul className="erpf-side-list">
            <li>
              <span>Ad</span>
              <strong>{connection.name}</strong>
            </li>
            <li>
              <span>Tür / mod</span>
              <strong>
                {typeLabel[connection.type]} · {modeLabel[connection.mode]}
              </strong>
            </li>
            <li>
              <span>Test</span>
              <strong>{formatUserFacingStatus(connection.lastTestResult)}</strong>
            </li>
            <li>
              <span>Son senkron</span>
              <strong>{formatDate(connection.lastSyncedAt)}</strong>
            </li>
          </ul>
        </>
      ) : null}
      <p className="erpf-side-note">Kritik yazım işlemleri onay ve denetim zincirinden geçer; bu panel salt okunurdur.</p>
    </section>
  );
}

export function ErpConnectionCard({
  connection,
  selected,
  onSelect,
  onTest,
  onSync,
  canTest,
  canSync,
  actionPending
}: {
  connection: ErpConnection;
  selected?: boolean;
  onSelect?: () => void;
  onTest?: () => void;
  onSync?: () => void;
  canTest?: boolean;
  canSync?: boolean;
  actionPending?: "test" | "sync" | null;
}) {
  return (
    <article
      className={`erpf-card erpf-conn-card${selected ? " is-selected" : ""}`}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") onSelect?.();
      }}
      role="button"
      tabIndex={0}
      aria-pressed={selected}
    >
      <div className="erpf-conn-card__head">
        <div>
          <p className="erpf-topbar__eyebrow">
            {typeLabel[connection.type]} / {modeLabel[connection.mode]}
          </p>
          <h3 className="erpf-conn-card__name">{connection.name}</h3>
        </div>
        <span className={`erpf-badge ${statusBadgeClass(connection.status)}`}>
          {statusLabel[connection.status] ?? formatUserFacingStatus(connection.status)}
        </span>
      </div>
      <p className="erpf-conn-card__meta">
        Test: {formatUserFacingStatus(connection.lastTestResult)} · Son senkron: {formatDate(connection.lastSyncedAt)}
      </p>
      <div className="erpf-conn-card__actions">
        <button
          className="erpf-btn erpf-btn--ghost"
          type="button"
          disabled
          title="Bağlantı düzenleme sonraki fazda API ile yapılacaktır"
          onClick={(event) => event.stopPropagation()}
        >
          Düzenle
        </button>
        <button
          className="erpf-btn erpf-btn--ghost"
          type="button"
          disabled={!canTest || actionPending === "test"}
          title={canTest ? "Bağlantıyı test et" : "Bağlantı testi için aktif bağlantı gerekir"}
          onClick={(event) => {
            event.stopPropagation();
            onTest?.();
          }}
        >
          {actionPending === "test" ? "Test…" : "Test et"}
        </button>
        <button
          className="erpf-btn erpf-btn--primary"
          type="button"
          disabled={!canSync || actionPending === "sync"}
          title={canSync ? "Senkron başlat" : "Senkron için aktif bağlantı gerekir"}
          onClick={(event) => {
            event.stopPropagation();
            onSync?.();
          }}
        >
          {actionPending === "sync" ? "Senkron…" : "Senkron"}
        </button>
      </div>
    </article>
  );
}

function ErpSyncStatusTable({ logs }: { logs: ErpSyncLog[] }) {
  return (
    <section className="erpf-card">
      <header className="erpf-section-head">
        <h2>Senkron durumu</h2>
      </header>
      <div className="erpf-table-wrap">
        <table className="erpf-table">
          <thead>
            <tr>
              <th>Tarih</th>
              <th>Yön</th>
              <th>Varlık</th>
              <th>Durum</th>
              <th>Kayıt</th>
            </tr>
          </thead>
          <tbody>
            {logs.slice(0, 6).map((log) => (
              <tr key={log.id} className={log.status !== "success" ? "is-error" : undefined}>
                <td>{formatDate(log.startedAt)}</td>
                <td>{log.direction}</td>
                <td>{log.entityType}</td>
                <td>{formatUserFacingStatus(log.status)}</td>
                <td>{log.recordCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ErpErrorQueue({ logs }: { logs: ErpSyncLog[] }) {
  const errors = logs.filter((log) => log.status !== "success");
  return (
    <section className="erpf-card">
      <header className="erpf-section-head">
        <h2>Hata kuyruğu</h2>
        <span className="erpf-badge erpf-badge--danger">{errors.length} kayıt</span>
      </header>
      <div className="erpf-table-wrap">
        <table className="erpf-table">
          <thead>
            <tr>
              <th>Tarih</th>
              <th>Varlık</th>
              <th>Mesaj</th>
            </tr>
          </thead>
          <tbody>
            {errors.length === 0 ? (
              <tr>
                <td colSpan={3}>Açık hata kaydı yok.</td>
              </tr>
            ) : (
              errors.map((log) => (
                <tr key={log.id} className="is-error">
                  <td>{formatDate(log.startedAt)}</td>
                  <td>{log.entityType}</td>
                  <td>{log.message}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ErpMappingPanel({
  mappings,
  selectedId,
  onSelect
}: {
  mappings: ErpMapping[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <section className="erpf-card">
      <header className="erpf-section-head">
        <h2>Modül eşlemeleri</h2>
        <span className="erpf-badge erpf-badge--info">{mappings.filter((m) => m.active).length} aktif</span>
      </header>
      <div className="erpf-table-wrap">
        <table className="erpf-table">
          <thead>
            <tr>
              <th>Varlık</th>
              <th>Yerel alan</th>
              <th>Uzak alan</th>
              <th>Durum</th>
            </tr>
          </thead>
          <tbody>
            {mappings.map((mapping) => (
              <tr
                key={mapping.id}
                className={mapping.id === selectedId ? "is-selected" : undefined}
                onClick={() => onSelect(mapping.id)}
              >
                <td>{mapping.entityType}</td>
                <td>{mapping.localField}</td>
                <td>{mapping.remoteField}</td>
                <td>{mapping.active ? "Aktif" : "Pasif"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function ErpPage() {
  const channel = useErpChannel();
  const integration = useErpIntegrationData();
  const { pushToast } = useToast();
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
  const [selectedMappingId, setSelectedMappingId] = useState<string | null>(null);
  const [actionPending, setActionPending] = useState<"test" | "sync" | null>(null);
  const [pendingConnectionId, setPendingConnectionId] = useState<string | null>(null);

  const data: ErpIntegrationData = integration.data ?? {
    connections: [],
    mappings: [],
    logs: [],
    templates: [],
    health: {
      status: "healthy",
      activeConnectionCount: 0,
      warningCount: 0,
      errorCount: 0,
      message: "Yükleniyor…"
    },
    previews: []
  };

  useEffect(() => {
    if (!integration.data) return;
    setSelectedConnectionId((current) => current ?? integration.data?.connections[0]?.id ?? null);
    setSelectedMappingId((current) => current ?? integration.data?.mappings[0]?.id ?? null);
  }, [integration.data]);

  const selectedConnection = useMemo(
    () => data.connections.find((connection) => connection.id === selectedConnectionId) ?? data.connections[0],
    [data.connections, selectedConnectionId]
  );

  const activeMappings = useMemo(() => data.mappings.filter((mapping) => mapping.active).length, [data.mappings]);

  const runConnectionTest = async (connectionId: string) => {
    if (!channel.canOperate && !integration.useDemo) return;
    setActionPending("test");
    setPendingConnectionId(connectionId);
    const result = await testErpConnectionMutation(connectionId, { useDemoData: integration.useDemo, pushToast });
    if (result || integration.useDemo) {
      await Promise.all([integration.refresh(), channel.refresh()]);
    }
    setActionPending(null);
    setPendingConnectionId(null);
  };

  const runConnectionSync = async (connectionId: string) => {
    if (!channel.canOperate && !integration.useDemo) return;
    setActionPending("sync");
    setPendingConnectionId(connectionId);
    const result = await syncErpConnectionMutation(connectionId, { useDemoData: integration.useDemo, pushToast });
    if (result || integration.useDemo) {
      await Promise.all([integration.refresh(), channel.refresh()]);
    }
    setActionPending(null);
    setPendingConnectionId(null);
  };

  const topSyncEnabled =
    Boolean(selectedConnection) &&
    canOperateErpConnection(selectedConnection, integration.useDemo) &&
    (channel.canOperate || integration.useDemo) &&
    !integration.loading &&
    !integration.error;

  const showIntegrationLoading = integration.loading && !integration.data;
  const kpiPlaceholder = showIntegrationLoading ? "…" : undefined;

  return (
    <div className="erpf-page">
      {integration.useDemo ? (
        <p className="erpf-demo-band" role="status">
          ERP entegrasyon hazırlığı: bağlantı izleme aktif; yazım işlemleri onay ve denetim zincirinden geçer.
        </p>
      ) : channel.error ? (
        <ErpFeedbackState
          tone="error"
          message={channel.error}
          onRetry={() => void channel.refresh()}
        />
      ) : (
        <ErpChannelBand channelView={channel.channelView} loading={channel.loading} />
      )}

      <div className="erpf-layout">
        <div className="erpf-main">
          <header className="erpf-card erpf-topbar">
            <div>
              <p className="erpf-topbar__eyebrow">ERP entegrasyon hazırlığı</p>
              <h1 className="erpf-topbar__title">ERP Entegrasyon Merkezi</h1>
              <p className="erpf-topbar__sub">
                Bağlantı sağlığı, senkron geçmişi ve eşleme durumu mevcut entegrasyon verisine göre gösterilir.
              </p>
            </div>
            <div className="erpf-topbar__actions">
              <button
                className="erpf-btn erpf-btn--primary erpf-btn--pending"
                type="button"
                disabled
                title="Yeni bağlantı tanımı entegrasyon API bağlandığında etkinleşir"
              >
                Yeni bağlantı
              </button>
              <button
                className="erpf-btn erpf-btn--ghost erpf-btn--pending"
                type="button"
                disabled={!topSyncEnabled || actionPending === "sync"}
                title={
                  topSyncEnabled
                    ? "Seçili bağlantı için senkron başlat"
                    : channel.channelView.note
                }
                onClick={() => selectedConnection && void runConnectionSync(selectedConnection.id)}
              >
                {actionPending === "sync" && pendingConnectionId === selectedConnection?.id
                  ? "Senkron…"
                  : "Senkron başlat"}
              </button>
              <button
                className="erpf-btn erpf-btn--ghost erpf-btn--pending"
                type="button"
                disabled={data.templates.length === 0}
                title={
                  data.templates.length > 0
                    ? `${data.templates.length} Excel şablonu tanımlı`
                    : "Şablon listesi boş"
                }
                onClick={() =>
                  pushToast(
                    data.templates[0]
                      ? `Şablon: ${data.templates[0].title} (salt okunur önizleme)`
                      : "Excel şablonu bulunamadı."
                  )
                }
              >
                Excel şablonu
              </button>
            </div>
          </header>

          <div className="erpf-kpi-strip" aria-label="Entegrasyon özetleri">
            <article className="erpf-card erpf-kpi erpf-kpi--success">
              <span className="erpf-kpi__label">Aktif bağlantı</span>
              <span className="erpf-kpi__value">{kpiPlaceholder ?? data.health.activeConnectionCount}</span>
            </article>
            <article className="erpf-card erpf-kpi erpf-kpi--warn">
              <span className="erpf-kpi__label">Uyarı</span>
              <span className="erpf-kpi__value">{kpiPlaceholder ?? data.health.warningCount}</span>
            </article>
            <article className="erpf-card erpf-kpi erpf-kpi--danger">
              <span className="erpf-kpi__label">Hata</span>
              <span className="erpf-kpi__value">{kpiPlaceholder ?? data.health.errorCount}</span>
            </article>
            <article className="erpf-card erpf-kpi">
              <span className="erpf-kpi__label">Aktif eşleme</span>
              <span className="erpf-kpi__value">{kpiPlaceholder ?? activeMappings}</span>
            </article>
          </div>

          <section className="erpf-card erpf-readiness" aria-label="Entegrasyon hazırlık kontrol listesi">
            <h2 className="erpf-readiness__title">Hazırlık kontrol listesi</h2>
            <p className="erpf-readiness__note">
              Aşağıdaki adımlar tamamlandığında ERP yazım ve senkron işlemleri onay zinciri üzerinden açılır.
            </p>
            <ul className="erpf-readiness__list">
              <li className="erpf-readiness__item">
                <span className="erpf-readiness__badge">Aktif</span>
                <div>
                  <strong>Bağlantı izleme</strong>
                  Mevcut bağlantılar ve sağlık durumu listeleniyor.
                </div>
              </li>
              <li className="erpf-readiness__item">
                <span className="erpf-readiness__badge">Aktif</span>
                <div>
                  <strong>Senkron geçmişi</strong>
                  Log ve hata kuyruğu salt okunur görüntüleniyor.
                </div>
              </li>
              <li className="erpf-readiness__item">
                <span className="erpf-readiness__badge">Aktif</span>
                <div>
                  <strong>Canlı bağlantı testi</strong>
                  Seçili bağlantı için test ve senkron API üzerinden başlatılabilir.
                </div>
              </li>
              <li className="erpf-readiness__item">
                <span className="erpf-readiness__badge erpf-readiness__badge--pending">Bekliyor</span>
                <div>
                  <strong>Canlı filtre ve arama</strong>
                  Gelişmiş sorgu bağlandığında etkinleşir.
                </div>
              </li>
              <li className="erpf-readiness__item">
                <span className="erpf-readiness__badge erpf-readiness__badge--pending">Bekliyor</span>
                <div>
                  <strong>Yazım mutasyonları</strong>
                  Onay, denetim ve politika zinciri gerektirir.
                </div>
              </li>
            </ul>
          </section>

          <div className="erpf-body">
            <div className="erpf-scroll">
              {showIntegrationLoading ? (
                <ErpFeedbackState tone="loading" message="ERP entegrasyon verileri yükleniyor…" />
              ) : integration.error ? (
                <ErpFeedbackState
                  tone="error"
                  message={integration.error}
                  onRetry={() => void integration.refresh()}
                />
              ) : (
                <>
              <div className="erpf-conn-grid">
                {data.connections.length === 0 ? (
                  <p className="erpf-side-note" role="status">
                    Tanımlı bağlantı yok.
                  </p>
                ) : (
                  data.connections.map((connection) => (
                    <ErpConnectionCard
                      key={connection.id}
                      connection={connection}
                      selected={connection.id === selectedConnection?.id}
                      onSelect={() => setSelectedConnectionId(connection.id)}
                      canTest={
                        canOperateErpConnection(connection, integration.useDemo) &&
                        (channel.canOperate || integration.useDemo)
                      }
                      canSync={
                        canOperateErpConnection(connection, integration.useDemo) &&
                        (channel.canOperate || integration.useDemo)
                      }
                      actionPending={pendingConnectionId === connection.id ? actionPending : null}
                      onTest={() => void runConnectionTest(connection.id)}
                      onSync={() => void runConnectionSync(connection.id)}
                    />
                  ))
                )}
              </div>
              <ErpSyncStatusTable logs={data.logs} />
              <ErpErrorQueue logs={data.logs} />
              <ErpMappingPanel
                mappings={data.mappings}
                selectedId={selectedMappingId}
                onSelect={setSelectedMappingId}
              />
                </>
              )}
            </div>
          </div>
        </div>

        <aside className="erpf-side">
          <ErpHealthPanel health={data.health} connection={selectedConnection} />
          <section className="erpf-card erpf-side-card">
            <h3>Entegrasyon politikası</h3>
            <p className="erpf-side-note">
              Varsayılan güvenli mod: okuma ve log izleme. ERP tarafına yazım yalnız politika, onay ve denetim kaydı
              sonrasında yürütülür.
            </p>
            <div className="erpf-conn-card__actions">
              <button
                className="erpf-btn erpf-btn--ghost"
                type="button"
                onClick={() => pushToast("Politika detayı salt okunur gösterilir.")}
              >
                Politikayı gör
              </button>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
