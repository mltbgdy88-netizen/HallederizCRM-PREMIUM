"use client";

import type { ErpConnection } from "@hallederiz/types";
import { MetricCard, PageHeader, PrimaryActionToolbar, TabSwitcher } from "@hallederiz/ui";
import { useState } from "react";
import { getErpIntegrationData } from "../queries";

const typeLabel = { api: "API", excel: "Excel" } as const;
const modeLabel = { import_only: "Import", export_only: "Export", bidirectional: "Cift Yonlu" } as const;

export function ErpHealthPanel({ health }: { health: ReturnType<typeof getErpIntegrationData>["health"] }) {
  return <section className="hz-content-card"><p className="drawer-eyebrow">Health</p><h3>{health.status}</h3><p className="muted">{health.message}</p><div className="detail-list"><span>Aktif baglanti</span><strong>{health.activeConnectionCount}</strong><span>Uyari</span><strong>{health.warningCount}</strong><span>Hata</span><strong>{health.errorCount}</strong><span>Son senkron</span><strong>{health.lastSyncedAt ? new Date(health.lastSyncedAt).toLocaleString("tr-TR") : "-"}</strong></div></section>;
}

export function ErpConnectionCard({ connection }: { connection: ErpConnection }) {
  return <article className="hz-content-card"><div className="hz-card-header"><div><p className="drawer-eyebrow">{typeLabel[connection.type]} / {modeLabel[connection.mode]}</p><h3>{connection.name}</h3></div><span className={`hz-badge ${connection.status === "healthy" ? "hz-badge-success" : connection.status === "warning" ? "hz-badge-warning" : "hz-badge-danger"}`}>{connection.status}</span></div><p className="muted">Test: {connection.lastTestResult} / Son senkron: {connection.lastSyncedAt ? new Date(connection.lastSyncedAt).toLocaleString("tr-TR") : "-"}</p><div className="hz-inline-actions"><button className="hz-btn hz-btn-secondary" type="button">Duzenle</button><button className="hz-btn hz-btn-secondary" type="button">Test Et</button><button className="hz-btn hz-btn-secondary" type="button">Senkron Baslat</button><button className="hz-btn hz-btn-secondary" type="button">Pasiflestir</button></div></article>;
}

export function ErpConnectionList({ connections }: { connections: ErpConnection[] }) { return <section className="hz-grid-two">{connections.map((connection) => <ErpConnectionCard key={connection.id} connection={connection} />)}</section>; }
export function ErpConnectionModal() {
  return <section className="hz-content-card"><p className="drawer-eyebrow">Yeni Baglanti Foundation</p><h3>API veya Excel baglantisi</h3><p className="muted">Gercek secret ve dosya yukleme sonraki adapter katmanina baglanacak; burada connection contract, mod ve test/sync aksiyonlari sabitlenir.</p><div className="task-center-filter-grid"><label>Baglanti Adi<input placeholder="ERP Merkez" /></label><label>Tur<select defaultValue="api"><option value="api">API</option><option value="excel">Excel</option></select></label><label>Mod<select defaultValue="bidirectional"><option value="import_only">Import</option><option value="export_only">Export</option><option value="bidirectional">Cift Yonlu</option></select></label><label>Test URL / Dosya Klasoru<input placeholder="https:// veya \\\\server\\erp" /></label></div><div className="hz-inline-actions"><button className="hz-btn hz-btn-primary" type="button">Kaydet</button><button className="hz-btn hz-btn-secondary" type="button">Test Et</button></div></section>;
}

export function ErpMappingTable({ mappings }: { mappings: ReturnType<typeof getErpIntegrationData>["mappings"] }) {
  return <section className="hz-content-card"><h3>Eslemeler</h3><div className="table-wrap hz-table-wrap"><table className="table hz-table"><thead><tr><th>Entity</th><th>Local Field</th><th>Remote Field</th><th>Durum</th></tr></thead><tbody>{mappings.map((mapping) => <tr key={mapping.id}><td>{mapping.entityType}</td><td>{mapping.localField}</td><td>{mapping.remoteField}</td><td>{mapping.active ? "Aktif" : "Pasif"}</td></tr>)}</tbody></table></div></section>;
}

export function ErpSyncLogTable({ logs }: { logs: ReturnType<typeof getErpIntegrationData>["logs"] }) {
  return <section className="hz-content-card"><h3>Senkron Gecmisi</h3><div className="table-wrap hz-table-wrap"><table className="table hz-table"><thead><tr><th>Tarih</th><th>Yon</th><th>Entity</th><th>Durum</th><th>Kayit</th><th>Mesaj</th></tr></thead><tbody>{logs.map((log) => <tr key={log.id}><td>{new Date(log.startedAt).toLocaleString("tr-TR")}</td><td>{log.direction}</td><td>{log.entityType}</td><td>{log.status}</td><td>{log.recordCount}</td><td>{log.message}</td></tr>)}</tbody></table></div></section>;
}

export function ErpTemplatePanel({ templates }: { templates: ReturnType<typeof getErpIntegrationData>["templates"] }) {
  return <section className="hz-grid-two">{templates.map((template) => <article key={template.key} className="hz-content-card"><p className="drawer-eyebrow">{template.entityType}</p><h3>{template.title}</h3><p className="muted">Son kullanim: {template.lastUsedAt}</p><div className="hz-inline-actions"><button className="hz-btn hz-btn-secondary" type="button">Indir</button><button className="hz-btn hz-btn-secondary" type="button">Ornek Gor</button></div></article>)}</section>;
}

export function ErpPage() {
  const data = getErpIntegrationData();
  const [tab, setTab] = useState("connections");
  return <div className="hz-page-stack"><PageHeader title="ERP" description="API ve Excel tabanli ERP baglantilarini, eslemeleri, health ve sync loglarini tek merkezde yonetin." /><section className="hz-metric-grid"><MetricCard title="Aktif Baglanti" value={String(data.health.activeConnectionCount)} detail="API + Excel" tone="info" /><MetricCard title="Uyari" value={String(data.health.warningCount)} detail="Stale veya kontrol" tone="warning" /><MetricCard title="Hata" value={String(data.health.errorCount)} detail="Mudahale" tone="danger" /><MetricCard title="Mapping" value={String(data.mappings.filter((m) => m.active).length)} detail="Aktif esleme" tone="success" /></section><PrimaryActionToolbar><button className="hz-btn hz-toolbar-btn hz-btn-primary" type="button">Yeni Baglanti</button><button className="hz-btn hz-toolbar-btn hz-btn-secondary" type="button">Senkron Baslat</button><button className="hz-btn hz-toolbar-btn hz-btn-secondary" type="button">Excel Sablonu</button></PrimaryActionToolbar><TabSwitcher activeKey={tab} onChange={setTab} items={[{ key: "connections", label: "Baglantilar" }, { key: "mappings", label: "Eslemeler" }, { key: "logs", label: "Senkron Gecmisi" }, { key: "templates", label: "Excel Sablonlari" }, { key: "errors", label: "Hatalar" }]} />{tab === "connections" ? <><ErpHealthPanel health={data.health} /><ErpConnectionModal /><ErpConnectionList connections={data.connections} /></> : null}{tab === "mappings" ? <ErpMappingTable mappings={data.mappings} /> : null}{tab === "logs" ? <ErpSyncLogTable logs={data.logs} /> : null}{tab === "templates" ? <ErpTemplatePanel templates={data.templates} /> : null}{tab === "errors" ? <ErpSyncLogTable logs={data.logs.filter((log) => log.status !== "success")} /> : null}</div>;
}
