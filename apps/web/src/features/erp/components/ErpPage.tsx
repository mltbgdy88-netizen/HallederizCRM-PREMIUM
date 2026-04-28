"use client";

import type { ErpConnection } from "@hallederiz/types";
import { MetricCard, PageHeader, Pagination, PrimaryActionToolbar, TabSwitcher } from "@hallederiz/ui";
import { useMemo, useState } from "react";
import { getErpIntegrationData } from "../queries";

const typeLabel = { api: "API", excel: "Excel" } as const;
const modeLabel = { import_only: "Import", export_only: "Export", bidirectional: "Cift Yonlu" } as const;

function paginate<T>(items: T[], page: number, pageSize: number): T[] {
  return items.slice((page - 1) * pageSize, page * pageSize);
}

export function ErpHealthPanel({ health }: { health: ReturnType<typeof getErpIntegrationData>["health"] }) {
  return (
    <section className="hz-content-card">
      <p className="drawer-eyebrow">Health</p>
      <h3>{health.status}</h3>
      <p className="muted">{health.message}</p>
      <div className="detail-list">
        <span>Aktif baglanti</span>
        <strong>{health.activeConnectionCount}</strong>
        <span>Uyari</span>
        <strong>{health.warningCount}</strong>
        <span>Hata</span>
        <strong>{health.errorCount}</strong>
        <span>Son senkron</span>
        <strong>{health.lastSyncedAt ? new Date(health.lastSyncedAt).toLocaleString("tr-TR") : "-"}</strong>
      </div>
    </section>
  );
}

export function ErpConnectionCard({ connection }: { connection: ErpConnection }) {
  return (
    <article className="hz-content-card">
      <div className="hz-card-header">
        <div>
          <p className="drawer-eyebrow">
            {typeLabel[connection.type]} / {modeLabel[connection.mode]}
          </p>
          <h3>{connection.name}</h3>
        </div>
        <span
          className={`hz-badge ${
            connection.status === "healthy"
              ? "hz-badge-success"
              : connection.status === "warning"
                ? "hz-badge-warning"
                : "hz-badge-danger"
          }`}
        >
          {connection.status}
        </span>
      </div>
      <p className="muted">
        Test: {connection.lastTestResult} / Son senkron:{" "}
        {connection.lastSyncedAt ? new Date(connection.lastSyncedAt).toLocaleString("tr-TR") : "-"}
      </p>
      <div className="hz-inline-actions">
        <button className="hz-btn hz-btn-secondary" type="button">
          Duzenle
        </button>
        <button className="hz-btn hz-btn-secondary" type="button">
          Test Et
        </button>
        <button className="hz-btn hz-btn-secondary" type="button">
          Senkron Baslat
        </button>
        <button className="hz-btn hz-btn-secondary" type="button">
          Pasiflestir
        </button>
      </div>
    </article>
  );
}

export function ErpConnectionModal() {
  return (
    <section className="hz-content-card">
      <p className="drawer-eyebrow">Yeni Baglanti Foundation</p>
      <h3>API veya Excel baglantisi</h3>
      <p className="muted">
        Gercek secret ve dosya yukleme sonraki adapter katmanina baglanacak; burada connection contract, mod ve
        test/sync aksiyonlari sabitlenir.
      </p>
      <div className="task-center-filter-grid">
        <label>
          Baglanti Adi
          <input placeholder="ERP Merkez" />
        </label>
        <label>
          Tur
          <select defaultValue="api">
            <option value="api">API</option>
            <option value="excel">Excel</option>
          </select>
        </label>
        <label>
          Mod
          <select defaultValue="bidirectional">
            <option value="import_only">Import</option>
            <option value="export_only">Export</option>
            <option value="bidirectional">Cift Yonlu</option>
          </select>
        </label>
        <label>
          Test URL / Dosya Klasoru
          <input placeholder="https:// veya \\\\server\\erp" />
        </label>
      </div>
      <div className="hz-inline-actions">
        <button className="hz-btn hz-btn-primary" type="button">
          Kaydet
        </button>
        <button className="hz-btn hz-btn-secondary" type="button">
          Test Et
        </button>
      </div>
    </section>
  );
}

export function ErpMappingTable({ mappings }: { mappings: ReturnType<typeof getErpIntegrationData>["mappings"] }) {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const paged = useMemo(() => paginate(mappings, page, pageSize), [mappings, page]);

  return (
    <section className="hz-content-card">
      <h3>Eslemeler</h3>
      <div className="table-wrap hz-table-wrap">
        <table className="table hz-table">
          <thead>
            <tr>
              <th>Entity</th>
              <th>Local Field</th>
              <th>Remote Field</th>
              <th>Durum</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((mapping) => (
              <tr key={mapping.id}>
                <td>{mapping.entityType}</td>
                <td>{mapping.localField}</td>
                <td>{mapping.remoteField}</td>
                <td>{mapping.active ? "Aktif" : "Pasif"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination totalItems={mappings.length} pageSize={pageSize} currentPage={page} onPageChange={setPage} />
    </section>
  );
}

export function ErpSyncLogTable({ logs }: { logs: ReturnType<typeof getErpIntegrationData>["logs"] }) {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const paged = useMemo(() => paginate(logs, page, pageSize), [logs, page]);

  return (
    <section className="hz-content-card">
      <h3>Senkron Gecmisi</h3>
      <div className="table-wrap hz-table-wrap">
        <table className="table hz-table">
          <thead>
            <tr>
              <th>Tarih</th>
              <th>Yon</th>
              <th>Entity</th>
              <th>Durum</th>
              <th>Kayit</th>
              <th>Mesaj</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((log) => (
              <tr key={log.id}>
                <td>{new Date(log.startedAt).toLocaleString("tr-TR")}</td>
                <td>{log.direction}</td>
                <td>{log.entityType}</td>
                <td>{log.status}</td>
                <td>{log.recordCount}</td>
                <td>{log.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination totalItems={logs.length} pageSize={pageSize} currentPage={page} onPageChange={setPage} />
    </section>
  );
}

export function ErpTemplatePanel({ templates }: { templates: ReturnType<typeof getErpIntegrationData>["templates"] }) {
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const paged = useMemo(() => paginate(templates, page, pageSize), [templates, page]);

  return (
    <>
      <section className="hz-grid-two">
        {paged.map((template) => (
          <article key={template.key} className="hz-content-card">
            <p className="drawer-eyebrow">{template.entityType}</p>
            <h3>{template.title}</h3>
            <p className="muted">Son kullanim: {template.lastUsedAt}</p>
            <div className="hz-inline-actions">
              <button className="hz-btn hz-btn-secondary" type="button">
                Indir
              </button>
              <button className="hz-btn hz-btn-secondary" type="button">
                Ornek Gor
              </button>
            </div>
          </article>
        ))}
      </section>
      <Pagination totalItems={templates.length} pageSize={pageSize} currentPage={page} onPageChange={setPage} />
    </>
  );
}

export function ErpPage() {
  const data = getErpIntegrationData();
  const [tab, setTab] = useState("connections");
  const [connectionsPage, setConnectionsPage] = useState(1);
  const connectionsPageSize = 4;
  const pagedConnections = useMemo(
    () => paginate(data.connections, connectionsPage, connectionsPageSize),
    [connectionsPage, data.connections]
  );

  return (
    <div className="hz-page-stack">
      <PageHeader
        title="ERP"
        description="API ve Excel tabanli ERP baglantilarini, eslemeleri, health ve sync loglarini tek merkezde yonetin."
      />

      <section className="hz-metric-grid">
        <MetricCard title="Aktif Baglanti" value={String(data.health.activeConnectionCount)} detail="API + Excel" tone="info" />
        <MetricCard title="Uyari" value={String(data.health.warningCount)} detail="Stale veya kontrol" tone="warning" />
        <MetricCard title="Hata" value={String(data.health.errorCount)} detail="Mudahale" tone="danger" />
        <MetricCard
          title="Mapping"
          value={String(data.mappings.filter((mapping) => mapping.active).length)}
          detail="Aktif esleme"
          tone="success"
        />
      </section>

      <PrimaryActionToolbar>
        <button className="hz-btn hz-toolbar-btn hz-btn-primary" type="button">
          Yeni Baglanti
        </button>
        <button className="hz-btn hz-toolbar-btn hz-btn-secondary" type="button">
          Senkron Baslat
        </button>
        <button className="hz-btn hz-toolbar-btn hz-btn-secondary" type="button">
          Excel Sablonu
        </button>
      </PrimaryActionToolbar>

      <TabSwitcher
        activeKey={tab}
        onChange={setTab}
        items={[
          { key: "connections", label: "Baglantilar" },
          { key: "mappings", label: "Eslemeler" },
          { key: "logs", label: "Senkron Gecmisi" },
          { key: "templates", label: "Excel Sablonlari" },
          { key: "errors", label: "Hatalar" }
        ]}
      />

      <section className="hz-filter-card">
        <div className="hz-filter-grid">
          <label>
            Ara
            <input placeholder="Baglanti, modul veya kayit ID" />
          </label>
          <label>
            Tur
            <select defaultValue="">
              <option value="">Tum turler</option>
              <option value="api">API</option>
              <option value="excel">Excel</option>
            </select>
          </label>
          <label>
            Durum
            <select defaultValue="">
              <option value="">Tum durumlar</option>
              <option value="healthy">Saglikli</option>
              <option value="warning">Uyari</option>
              <option value="error">Hata</option>
            </select>
          </label>
          <label>
            Yon
            <select defaultValue="">
              <option value="">Tum yonler</option>
              <option value="import">Import</option>
              <option value="export">Export</option>
            </select>
          </label>
        </div>
        <div className="hz-filter-actions">
          <button type="button" className="hz-btn hz-btn-secondary">
            Filtrele
          </button>
          <button type="button" className="reset-btn">
            Temizle
          </button>
        </div>
      </section>

      {tab === "connections" ? (
        <>
          <ErpHealthPanel health={data.health} />
          <ErpConnectionModal />
          <section className="hz-grid-two">
            {pagedConnections.map((connection) => (
              <ErpConnectionCard key={connection.id} connection={connection} />
            ))}
          </section>
          <Pagination
            totalItems={data.connections.length}
            pageSize={connectionsPageSize}
            currentPage={connectionsPage}
            onPageChange={setConnectionsPage}
          />
        </>
      ) : null}
      {tab === "mappings" ? <ErpMappingTable mappings={data.mappings} /> : null}
      {tab === "logs" ? <ErpSyncLogTable logs={data.logs} /> : null}
      {tab === "templates" ? <ErpTemplatePanel templates={data.templates} /> : null}
      {tab === "errors" ? <ErpSyncLogTable logs={data.logs.filter((log) => log.status !== "success")} /> : null}
    </div>
  );
}
