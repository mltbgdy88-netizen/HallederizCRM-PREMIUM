"use client";

import type { FactoryOrder, FactoryStockItem, IntegrationLog } from "@hallederiz/types";
import { MetricCard, PageHeader, Pagination, PrimaryActionToolbar, SplitContentLayout } from "@hallederiz/ui";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export function FactoryIntegrationHealthCard({ health }: { health: { status: string; message: string; warningCount: number; errorCount: number; lastSyncedAt?: string } }) {
  return <section className="hz-content-card"><p className="drawer-eyebrow">Integration Health</p><h3>{health.status}</h3><p className="muted">{health.message}</p><div className="detail-list"><span>Uyari</span><strong>{health.warningCount}</strong><span>Hata</span><strong>{health.errorCount}</strong><span>Son senkron</span><strong>{health.lastSyncedAt ? new Date(health.lastSyncedAt).toLocaleString("tr-TR") : "-"}</strong></div></section>;
}

export function FactoryStockFilterBar() { return <section className="hz-content-card"><div className="task-center-filter-grid"><label>Fabrika<select defaultValue=""><option value="">Tum fabrikalar</option><option>Ankara</option><option>Izmir</option></select></label><label>Urun Kodu<input placeholder="DK-1001" /></label><label>Marka<select defaultValue=""><option value="">Tum markalar</option></select></label><label>Koleksiyon<input placeholder="Koleksiyon" /></label><label>Son Senkron<select defaultValue=""><option value="">Tum durumlar</option><option>active</option><option>error</option></select></label></div><p className="muted">Filtre paneli görünürlük amaçlıdır. Canlı fabrika yazımı bu ekrandan başarı varsayımı üretmez.</p></section>; }

export function FactoryStockTable({ items, selectedId, onSelect }: { items: FactoryStockItem[]; selectedId: string | null; onSelect: (id: string) => void }) {
  return <section className="hz-content-card"><div className="table-wrap hz-table-wrap"><table className="table hz-table hz-table-sticky"><thead><tr><th>Urun Kodu</th><th>Urun Adi</th><th>Fabrika</th><th>Mevcut Stok</th><th>Son Senkron</th><th>Entegrasyon</th><th>Aksiyon</th></tr></thead><tbody>{items.map((item) => <tr key={item.id} className={`stock-table-row ${selectedId === item.id ? "is-selected-row" : ""}`} onClick={() => onSelect(item.id)}><td>{item.productCode}</td><td>{item.productName}</td><td>{item.factoryId}</td><td>{item.availableQuantity}</td><td>{item.lastSyncedAt ? new Date(item.lastSyncedAt).toLocaleString("tr-TR") : "-"}</td><td><span className={`hz-badge ${item.integrationStatus === "active" ? "hz-badge-success" : item.integrationStatus === "error" ? "hz-badge-danger" : "hz-badge-warning"}`}>{item.integrationStatus}</span></td><td><button className="hz-btn hz-btn-secondary" type="button" onClick={() => onSelect(item.id)}>Ac</button></td></tr>)}</tbody></table></div></section>;
}

export function FactoryStockPreviewPanel({ item }: { item: FactoryStockItem | null }) {
  const router = useRouter();
  if (!item) return <aside className="hz-side-panel"><p className="muted">Urun secimi bekleniyor.</p></aside>;
  return <aside className="hz-side-panel"><p className="drawer-eyebrow">Fabrika Stok</p><h3>{item.productCode}</h3><p>{item.productName}</p><div className="detail-list"><span>Mevcut</span><strong>{item.availableQuantity}</strong><span>Rezerve</span><strong>{item.reservedQuantity}</strong><span>Durum</span><strong>{item.integrationStatus}</strong></div><button className="hz-btn hz-btn-secondary" type="button" onClick={() => router.push("/stok")}>Urun Kartini Ac</button></aside>;
}

export function FactoryStocksPage({ data }: { data: Awaited<ReturnType<typeof import("../queries").getFactoryStockData>> }) {
  const [page, setPage] = useState(1);
  const [selectedStockId, setSelectedStockId] = useState<string | null>(null);
  const pageSize = 10;
  const pagedItems = useMemo(() => data.items.slice((page - 1) * pageSize, page * pageSize), [data.items, page]);
  const selected = useMemo(() => {
    if (!data.items.length || !selectedStockId) return null;
    return data.items.find((item) => item.id === selectedStockId) ?? null;
  }, [data.items, selectedStockId]);
  useEffect(() => {
    if (!data.items.length) {
      setSelectedStockId(null);
      return;
    }
    if (!selectedStockId || !data.items.some((item) => item.id === selectedStockId)) {
      setSelectedStockId(data.items[0]?.id ?? null);
    }
  }, [data.items, selectedStockId]);
  return <div className="hz-page-stack"><PageHeader title="Fabrika Stoklari" description="Urun bazli fabrika stok gorunurlugu, son senkron ve integration health durumunu izleyin." /><section className="hz-metric-grid"><MetricCard title="Snapshot" value={String(data.snapshots.length)} detail="Fabrika" tone="info" /><MetricCard title="Stok Satiri" value={String(data.items.length)} detail="Urun/fabrika" tone="success" /><MetricCard title="Uyari" value={String(data.health.warningCount)} detail="Stale" tone="warning" /><MetricCard title="Hata" value={String(data.health.errorCount)} detail="Integration" tone="danger" /></section><PrimaryActionToolbar><button className="hz-btn hz-toolbar-btn hz-btn-primary" type="button" disabled>Senkron Baslat (Foundation)</button><button className="hz-btn hz-toolbar-btn hz-btn-secondary" type="button" disabled>Snapshot Indir (Foundation)</button><button className="hz-btn hz-toolbar-btn hz-btn-secondary" type="button" disabled>Hata Kayitlari (Foundation)</button></PrimaryActionToolbar><section className="hz-content-card"><p className="muted">Not: Bu toolbar aksiyonlari foundation modundadir; canli fabrika adapteri aktif oldugunda operasyonel etki uretir.</p></section><FactoryStockFilterBar /><SplitContentLayout main={<><FactoryStockTable items={pagedItems} selectedId={selectedStockId} onSelect={setSelectedStockId} /><Pagination totalItems={data.items.length} pageSize={pageSize} currentPage={page} onPageChange={setPage} /></>} side={<><FactoryIntegrationHealthCard health={data.health} /><FactoryStockPreviewPanel item={selected} /></>} /></div>;
}

export function FactoryOrderFilterBar() { return <section className="hz-content-card"><div className="task-center-filter-grid"><label>Fabrika<select defaultValue=""><option value="">Tum fabrikalar</option><option>Ankara</option><option>Izmir</option></select></label><label>Durum<select defaultValue=""><option value="">Tum durumlar</option><option>sent</option><option>producing</option></select></label><label>Bagli Satis<input placeholder="SO-2481" /></label><label>Tarih Araligi<input type="date" /></label></div><p className="muted">Bu filtreler operasyon görünürlüğü içindir; canlı execute tamamlanmadan başarı durumu verilmez.</p></section>; }

export function FactoryOrderTable({ orders, selectedId, onSelect, onOpen }: { orders: FactoryOrder[]; selectedId: string | null; onSelect: (id: string) => void; onOpen: (id: string) => void }) {
  return <section className="hz-content-card"><div className="table-wrap hz-table-wrap"><table className="table hz-table hz-table-sticky"><thead><tr><th>Siparis No</th><th>Fabrika</th><th>Bagli Satis</th><th>Satir</th><th>Durum</th><th>Son Guncelleme</th><th>Aksiyon</th></tr></thead><tbody>{orders.map((order) => <tr key={order.id} className={`stock-table-row ${selectedId === order.id ? "is-selected-row" : ""}`} onClick={() => onSelect(order.id)} onDoubleClick={() => onOpen(order.id)}><td>{order.factoryOrderNo}</td><td>{order.factoryName}</td><td>{order.saleOrderNo ?? "-"}</td><td>{order.lineCount}</td><td>{order.status}</td><td>{new Date(order.lastUpdatedAt).toLocaleString("tr-TR")}</td><td><button className="hz-btn hz-btn-secondary" type="button" onClick={(event) => { event.stopPropagation(); onOpen(order.id); }}>Detay</button></td></tr>)}</tbody></table></div></section>;
}

export function FactoryOrderPreviewPanel({ order }: { order: FactoryOrder | null }) { return <aside className="hz-side-panel"><p className="drawer-eyebrow">Fabrika Siparisi</p><h3>{order?.factoryOrderNo ?? "-"}</h3><p className="muted">Bagli satis: {order?.saleOrderNo ?? "-"}</p><div className="detail-list"><span>Durum</span><strong>{order?.status ?? "-"}</strong><span>Satir</span><strong>{order?.lineCount ?? 0}</strong><span>Fabrika</span><strong>{order?.factoryName ?? "-"}</strong></div></aside>; }

export function FactoryOrdersPage({ orders }: { orders: FactoryOrder[] }) {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const pageSize = 10;
  const pagedOrders = useMemo(() => orders.slice((page - 1) * pageSize, page * pageSize), [orders, page]);
  const selected = useMemo(() => {
    if (!orders.length || !selectedOrderId) return null;
    return orders.find((order) => order.id === selectedOrderId) ?? null;
  }, [orders, selectedOrderId]);
  const transmissionHint = useMemo(() => {
    if (!orders.length) return "Liste bos - geri bildirim bekleniyor.";
    const sorted = [...orders].sort((a, b) => Date.parse(b.lastUpdatedAt) - Date.parse(a.lastUpdatedAt));
    const newest = sorted[0];
    if (!newest) return "Liste bos - geri bildirim bekleniyor.";
    return `Son kayit guncellemesi: ${new Date(newest.lastUpdatedAt).toLocaleString("tr-TR")}`;
  }, [orders]);
  useEffect(() => {
    if (!orders.length) {
      setSelectedOrderId(null);
      return;
    }
    if (!selectedOrderId || !orders.some((order) => order.id === selectedOrderId)) {
      setSelectedOrderId(orders[0]?.id ?? null);
    }
  }, [orders, selectedOrderId]);
  return (
    <div className="hz-page-stack hz-factory-orders-page">
      <PageHeader
        title="Fabrika Siparisleri"
        description="Fabrikaya acilan siparisleri, bagli satis ve entegrasyon durumuyla takip edin."
      />
      <section className="hz-factory-orders-transmit" aria-label="Iletim ve fabrika geri bildirimi">
        <span className="hz-factory-orders-transmit-pill">Iletim: adapter foundation</span>
        <span className="hz-factory-orders-transmit-pill">Durum kanali: webhook / queue (tenant)</span>
        <span className="hz-factory-orders-transmit-pill hz-factory-orders-transmit-pill--meta" title={transmissionHint}>
          Geri bildirim: {transmissionHint}
        </span>
      </section>
      <PrimaryActionToolbar>
        <button className="hz-btn hz-toolbar-btn hz-btn-primary" type="button" disabled>
          Yeni Fabrika Siparisi (Foundation)
        </button>
        <button className="hz-btn hz-toolbar-btn hz-btn-secondary" type="button" disabled>
          Durum Sorgula (Foundation)
        </button>
        <button className="hz-btn hz-toolbar-btn hz-btn-secondary" type="button" disabled>
          Senkron Loglari (Foundation)
        </button>
      </PrimaryActionToolbar>
      <section className="hz-content-card">
        <p className="muted">
          Not: Siparis acma/durum sorgu aksiyonlari foundation modundadir. Gercek adapter baglantisi acildiginda canli hale
          gelir.
        </p>
      </section>
      <FactoryOrderFilterBar />
      <SplitContentLayout
        main={
          <>
            <FactoryOrderTable
              orders={pagedOrders}
              selectedId={selectedOrderId}
              onSelect={setSelectedOrderId}
              onOpen={(id) => router.push(`/fabrikalar/siparisler/${id}`)}
            />
            <Pagination totalItems={orders.length} pageSize={pageSize} currentPage={page} onPageChange={setPage} />
          </>
        }
        side={<FactoryOrderPreviewPanel order={selected} />}
      />
    </div>
  );
}

export function FactoryOrderHeaderInfo({ order }: { order: FactoryOrder }) { return <section className="hz-content-card"><p className="drawer-eyebrow">{order.factoryOrderNo}</p><h2>{order.factoryName}</h2><p className="muted">Bagli satis: {order.saleOrderNo ?? "-"}</p><span className="hz-badge hz-badge-info">{order.status}</span></section>; }
export function FactoryOrderLineTable({ order }: { order: FactoryOrder }) { return <section className="hz-content-card"><h3>Urun Satirlari</h3><div className="table-wrap hz-table-wrap"><table className="table hz-table"><thead><tr><th>Urun Kodu</th><th>Urun Adi</th><th>Miktar</th><th>Not</th></tr></thead><tbody>{order.lines.map((line) => <tr key={line.id}><td>{line.productCode}</td><td>{line.productName}</td><td>{line.quantity}</td><td>{line.note ?? "-"}</td></tr>)}</tbody></table></div></section>; }
export function FactoryOrderActionsBar({ order }: { order: FactoryOrder }) {
  const router = useRouter();
  return <section className="hz-content-card"><h3>Aksiyonlar</h3><div className="hz-inline-actions"><button className="hz-btn hz-btn-primary" type="button" disabled>Onaya Gonder (Foundation)</button><button className="hz-btn hz-btn-secondary" type="button" disabled>Gonder (Foundation)</button><button className="hz-btn hz-btn-secondary" type="button" disabled>Durum Guncelle (Foundation)</button><button className="hz-btn hz-btn-secondary" type="button" disabled>Tamamla (Foundation)</button><button className="hz-btn hz-btn-secondary" type="button" disabled>Hatayi Goruntule (Foundation)</button>{order.saleOrderId ? <button className="hz-btn hz-btn-secondary" type="button" onClick={() => router.push(`/siparisler/${order.saleOrderId}`)}>Ilgili Siparise Git</button> : null}</div></section>;
}

export function FactoryOrderDetailPage({ order, logs }: { order: FactoryOrder; logs: IntegrationLog[] }) {
  const relatedLogs = logs.filter((log) => log.entityId === order.id);
  return <div className="hz-page-stack"><PageHeader title="Fabrika Siparis Detayi" description="Fabrika satirlari, gonderim/onay/hata gecmisi ve bagli satis foundation'i." /><FactoryOrderHeaderInfo order={order} /><SplitContentLayout main={<><FactoryOrderLineTable order={order} /><section className="hz-content-card"><h3>Entegrasyon Logu</h3>{relatedLogs.map((log) => <div key={log.id} className="hz-list-item"><strong>{log.level}</strong><span>{log.message}</span><small>{new Date(log.createdAt).toLocaleString("tr-TR")}</small></div>)}</section></>} side={<FactoryOrderActionsBar order={order} />} /></div>;
}
