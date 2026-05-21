"use client";

import type { ErpConnection } from "@hallederiz/types";
import { MetricCard, PageHeader, Pagination, PrimaryActionToolbar, TabSwitcher } from "@hallederiz/ui";
import { useMemo, useState } from "react";
import { getErpIntegrationData } from "../queries";

const typeLabel = { api: "API", excel: "Excel" } as const;
const modeLabel = { import_only: "İçe aktarım", export_only: "Dışa aktarım", bidirectional: "Çift yönlü" } as const;
const statusLabel: Record<string, string> = {
  healthy: "Sağlıklı",
  warning: "Uyarı",
  error: "Hata"
};

function paginate<T>(items: T[], page: number, pageSize: number): T[] {
  return items.slice((page - 1) * pageSize, page * pageSize);
}

export function ErpHealthPanel({ health }: { health: ReturnType<typeof getErpIntegrationData>["health"] }) {
  return (
    <section className="hz-content-card">
      <p className="drawer-eyebrow">Bağlantı özeti</p>
      <h3>{health.status}</h3>
      <p className="muted">{health.message}</p>
      <div className="detail-list">
        <span>Aktif bağlantı</span>
        <strong>{health.activeConnectionCount}</strong>
        <span>Uyarı</span>
        <strong>{health.warningCount}</strong>
        <span>Hata</span>
        <strong>{health.errorCount}</strong>
        <span>Son senkron</span>
        <strong>{health.lastSyncedAt ? new Date(health.lastSyncedAt).toLocaleString("tr-TR") : "—"}</strong>
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
          {statusLabel[connection.status] ?? connection.status}
        </span>
      </div>
      <p className="muted">
        Test: {connection.lastTestResult} · Son senkron:{" "}
        {connection.lastSyncedAt ? new Date(connection.lastSyncedAt).toLocaleString("tr-TR") : "—"}
      </p>
      <div className="hz-inline-actions">
        <button className="hz-btn hz-btn-secondary" type="button" disabled title="Bağlantı düzenleme API ile yapılır">
          Düzenle
        </button>
        <button className="hz-btn hz-btn-secondary" type="button" disabled title="Test işlemi API ile yapılır">
          Test et
        </button>
        <button className="hz-btn hz-btn-secondary" type="button" disabled title="Senkron API ve onay ile yapılır">
          Senkron başlat
        </button>
        <button className="hz-btn hz-btn-secondary" type="button" disabled title="Pasifleştirme API ile yapılır">
          Pasifleştir
        </button>
      </div>
    </article>
  );
}

export function ErpConnectionModal() {
  return (
    <section className="hz-content-card">
      <p className="drawer-eyebrow">Yeni bağlantı</p>
      <h3>API veya Excel bağlantısı</h3>
      <p className="muted">
        Bağlantı tanımı ve gizli anahtarlar adapter katmanında yönetilir; bu form yalnızca görünüm şablonudur ve canlı
        kayıt üretmez.
      </p>
      <div className="task-center-filter-grid">
        <label>
          Bağlantı adı
          <input placeholder="Bağlantı adı" disabled />
        </label>
        <label>
          Tür
          <select defaultValue="api" disabled>
            <option value="api">API</option>
            <option value="excel">Excel</option>
          </select>
        </label>
        <label>
          Mod
          <select defaultValue="bidirectional" disabled>
            <option value="import_only">İçe aktarım</option>
            <option value="export_only">Dışa aktarım</option>
            <option value="bidirectional">Çift yönlü</option>
          </select>
        </label>
        <label>
          Uç nokta / dosya yolu
          <input placeholder="API adresi veya dosya klasörü" disabled />
        </label>
      </div>
      <div className="hz-inline-actions">
        <button className="hz-btn hz-btn-primary" type="button" disabled title="Kayıt API üzerinden oluşturulur">
          Kaydet
        </button>
        <button className="hz-btn hz-btn-secondary" type="button" disabled title="Test API üzerinden yapılır">
          Test et
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
      <h3>Eşlemeler</h3>
      <div className="table-wrap hz-table-wrap">
        <table className="table hz-table">
          <thead>
            <tr>
              <th>Varlık</th>
              <th>Yerel alan</th>
              <th>Uzak alan</th>
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
      <h3>Senkron geçmişi</h3>
      <div className="table-wrap hz-table-wrap">
        <table className="table hz-table">
          <thead>
            <tr>
              <th>Tarih</th>
              <th>Yön</th>
              <th>Varlık</th>
              <th>Durum</th>
              <th>Kayıt</th>
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
            <p className="muted">Son kullanım: {template.lastUsedAt}</p>
            <div className="hz-inline-actions">
              <button className="hz-btn hz-btn-secondary" type="button" disabled title="İndirme API ile yapılır">
                İndir
              </button>
              <button className="hz-btn hz-btn-secondary" type="button" disabled title="Örnek görüntüleme API ile yapılır">
                Örnek gör
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
    <div className="hz-erp-page hz-page-stack">
      <header className="hz-erp-topbar">
        <div>
          <h1 className="hz-erp-topbar-title">ERP entegrasyonu</h1>
          <p className="hz-erp-topbar-sub">
            Bağlantı ve senkron durumu mevcut entegrasyon verisine göre gösterilir; sahte bağlı veya başarı durumu
            üretilmez.
          </p>
        </div>
      </header>
      <p className="hz-erp-preview-band" role="status">
        ERP bağlantısı tamamlandığında durum burada gösterilecek. Kritik yazım işlemleri onay zincirinden geçer.
      </p>
      <section className="hz-content-card hz-erp-write-policy">
        <p className="drawer-eyebrow">Entegrasyon politikası</p>
        <h3>Salt okunur senkron, kontrollü yazım</h3>
        <p className="muted">
          Varsayılan güvenli mod: okuma ve log izleme. ERP tarafına yazım yalnız politika, onay ve denetim kaydı
          sonrasında yürütülür; bu ekran canlı execute üretmez.
        </p>
      </section>

      <section className="hz-metric-grid">
        <MetricCard title="Aktif bağlantı" value={String(data.health.activeConnectionCount)} detail="API + Excel" tone="info" />
        <MetricCard title="Uyarı" value={String(data.health.warningCount)} detail="Güncellenmeli" tone="warning" />
        <MetricCard title="Hata" value={String(data.health.errorCount)} detail="Müdahale" tone="danger" />
        <MetricCard
          title="Eşleme"
          value={String(data.mappings.filter((mapping) => mapping.active).length)}
          detail="Aktif eşleme"
          tone="success"
        />
      </section>

      <PrimaryActionToolbar>
        <button className="hz-btn hz-toolbar-btn hz-btn-primary" type="button" disabled title="Yeni bağlantı API ile tanımlanır">
          Yeni bağlantı
        </button>
        <button className="hz-btn hz-toolbar-btn hz-btn-secondary" type="button" disabled title="Senkron API ve onay ile yapılır">
          Senkron başlat
        </button>
        <button className="hz-btn hz-toolbar-btn hz-btn-secondary" type="button" disabled title="Şablon API ile sunulur">
          Excel şablonu
        </button>
      </PrimaryActionToolbar>

      <section className="hz-content-card">
        <p className="muted">
          Araç çubuğu işlemleri yetki ve canlı provider yapılandırmasına bağlıdır; bağlantı yoksa düğmeler pasif kalır.
        </p>
      </section>

      <TabSwitcher
        activeKey={tab}
        onChange={setTab}
        items={[
          { key: "connections", label: "Bağlantılar" },
          { key: "mappings", label: "Eşlemeler" },
          { key: "logs", label: "Senkron geçmişi" },
          { key: "templates", label: "Excel şablonları" },
          { key: "errors", label: "Hatalar" }
        ]}
      />

      <section className="hz-filter-card">
        <div className="hz-filter-grid">
          <label>
            Ara
            <input placeholder="Bağlantı, modül veya kayıt no" disabled />
          </label>
          <label>
            Tür
            <select defaultValue="" disabled>
              <option value="">Tüm türler</option>
              <option value="api">API</option>
              <option value="excel">Excel</option>
            </select>
          </label>
          <label>
            Durum
            <select defaultValue="" disabled>
              <option value="">Tüm durumlar</option>
              <option value="healthy">Sağlıklı</option>
              <option value="warning">Uyarı</option>
              <option value="error">Hata</option>
            </select>
          </label>
          <label>
            Yön
            <select defaultValue="" disabled>
              <option value="">Tüm yönler</option>
              <option value="import">İçe aktarım</option>
              <option value="export">Dışa aktarım</option>
            </select>
          </label>
        </div>
        <div className="hz-filter-actions">
          <button type="button" className="hz-btn hz-btn-secondary" disabled title="Filtre API sorgusuna bağlanacak">
            Filtrele
          </button>
          <button type="button" className="reset-btn" disabled>
            Temizle
          </button>
        </div>
        <p className="muted">Filtreler canlı API sorgusuna bağlandığında listeyi daraltır; şu an yalnızca görünüm şablonudur.</p>
      </section>

      {tab === "connections" ? (
        <>
          <ErpHealthPanel health={data.health} />
          <ErpConnectionModal />
          <section className="hz-grid-two">
            {pagedConnections.length === 0 ? (
              <p className="muted" role="status">
                Canlı veri bekleniyor veya tanımlı bağlantı yok.
              </p>
            ) : (
              pagedConnections.map((connection) => <ErpConnectionCard key={connection.id} connection={connection} />)
            )}
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
