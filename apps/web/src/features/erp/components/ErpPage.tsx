"use client";

import type { ErpConnection, ErpMapping, ErpSyncLog } from "@hallederiz/types";
import { useMemo, useState } from "react";
import { formatUserFacingStatus } from "../../../lib/user-facing-labels";
import { useToast } from "../../../providers/toast-provider";
import { getErpIntegrationData } from "../queries";

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
  health: ReturnType<typeof getErpIntegrationData>["health"];
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
  onSelect
}: {
  connection: ErpConnection;
  selected?: boolean;
  onSelect?: () => void;
}) {
  const { pushToast } = useToast();

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
          onClick={(event) => {
            event.stopPropagation();
            pushToast("Bağlantı düzenleme sonraki fazda API ile yapılacaktır.");
          }}
        >
          Düzenle
        </button>
        <button
          className="erpf-btn erpf-btn--ghost"
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            pushToast("Bağlantı testi demo modda toast-only çalışır.");
          }}
        >
          Test et
        </button>
        <button
          className="erpf-btn erpf-btn--primary"
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            pushToast("Senkron başlatma onay zinciri bağlandığında aktif olacaktır.");
          }}
        >
          Senkron
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
  const data = getErpIntegrationData();
  const { pushToast } = useToast();
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(data.connections[0]?.id ?? null);
  const [selectedMappingId, setSelectedMappingId] = useState<string | null>(data.mappings[0]?.id ?? null);

  const selectedConnection = useMemo(
    () => data.connections.find((connection) => connection.id === selectedConnectionId) ?? data.connections[0],
    [data.connections, selectedConnectionId]
  );

  const activeMappings = useMemo(() => data.mappings.filter((mapping) => mapping.active).length, [data.mappings]);

  return (
    <div className="erpf-page">
      <p className="erpf-demo-band" role="status">
        Entegrasyon operasyon masası: senkron ve bağlantı mutationları sonraki fazda bağlanacaktır.
      </p>

      <div className="erpf-layout">
        <div className="erpf-main">
          <header className="erpf-card erpf-topbar">
            <div>
              <p className="erpf-topbar__eyebrow">ERP entegrasyonu</p>
              <h1 className="erpf-topbar__title">Entegrasyon Operasyon Masası</h1>
              <p className="erpf-topbar__sub">
                Bağlantı, senkron ve eşleme durumu mevcut entegrasyon verisine göre gösterilir.
              </p>
            </div>
            <div className="erpf-topbar__actions">
              <button
                className="erpf-btn erpf-btn--primary"
                type="button"
                onClick={() => pushToast("Yeni bağlantı tanımı sonraki fazda API ile yapılacaktır.")}
              >
                Yeni bağlantı
              </button>
              <button
                className="erpf-btn erpf-btn--ghost"
                type="button"
                onClick={() => pushToast("Senkron başlatma onay zinciri bağlandığında aktif olacaktır.")}
              >
                Senkron başlat
              </button>
              <button
                className="erpf-btn erpf-btn--ghost"
                type="button"
                onClick={() => pushToast("Excel şablonu indirme sonraki fazda bağlanacaktır.")}
              >
                Excel şablonu
              </button>
            </div>
          </header>

          <div className="erpf-kpi-strip" aria-label="Entegrasyon özetleri">
            <article className="erpf-card erpf-kpi erpf-kpi--success">
              <span className="erpf-kpi__label">Aktif bağlantı</span>
              <span className="erpf-kpi__value">{data.health.activeConnectionCount}</span>
            </article>
            <article className="erpf-card erpf-kpi erpf-kpi--warn">
              <span className="erpf-kpi__label">Uyarı</span>
              <span className="erpf-kpi__value">{data.health.warningCount}</span>
            </article>
            <article className="erpf-card erpf-kpi erpf-kpi--danger">
              <span className="erpf-kpi__label">Hata</span>
              <span className="erpf-kpi__value">{data.health.errorCount}</span>
            </article>
            <article className="erpf-card erpf-kpi">
              <span className="erpf-kpi__label">Aktif eşleme</span>
              <span className="erpf-kpi__value">{activeMappings}</span>
            </article>
          </div>

          <div className="erpf-card erpf-filter">
            <label className="erpf-field">
              <span>Ara</span>
              <input placeholder="Bağlantı, modül veya kayıt no" readOnly aria-readonly="true" />
            </label>
            <label className="erpf-field">
              <span>Tür</span>
              <select defaultValue="" disabled aria-disabled="true">
                <option value="">Tüm türler</option>
                <option value="api">API</option>
                <option value="excel">Excel</option>
              </select>
            </label>
            <label className="erpf-field">
              <span>Durum</span>
              <select defaultValue="" disabled aria-disabled="true">
                <option value="">Tüm durumlar</option>
                <option value="healthy">Sağlıklı</option>
                <option value="warning">Uyarı</option>
                <option value="error">Hata</option>
              </select>
            </label>
            <label className="erpf-field">
              <span>Yön</span>
              <select defaultValue="" disabled aria-disabled="true">
                <option value="">Tüm yönler</option>
                <option value="import">İçe aktarım</option>
                <option value="export">Dışa aktarım</option>
              </select>
            </label>
            <div className="erpf-filter__actions">
              <button
                className="erpf-btn erpf-btn--ghost"
                type="button"
                title="Filtreleri sıfırla"
                aria-label="Filtreleri sıfırla"
                onClick={() => pushToast("Filtreler canlı API sorgusuna bağlandığında aktif olacaktır.")}
              >
                Sıfırla
              </button>
            </div>
          </div>

          <div className="erpf-body">
            <div className="erpf-scroll">
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
