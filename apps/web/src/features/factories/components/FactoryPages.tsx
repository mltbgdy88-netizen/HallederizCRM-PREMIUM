"use client";

import type { FactoryOrder, FactoryStockItem, IntegrationLog } from "@hallederiz/types";
import { EntityDetailLayout, EntityListPageTemplate, PageHeader, Pagination } from "@hallederiz/ui";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export function FactoryIntegrationHealthCard({
  health
}: {
  health: { status: string; message: string; warningCount: number; errorCount: number; lastSyncedAt?: string };
}) {
  return (
    <aside className="hz-factory-side">
      <p className="drawer-eyebrow">Entegrasyon durumu</p>
      <h3>{health.status}</h3>
      <p className="muted">{health.message}</p>
      <ul className="hz-factory-side-list">
        <li>
          <strong>Uyarı:</strong> {health.warningCount}
        </li>
        <li>
          <strong>Hata:</strong> {health.errorCount}
        </li>
        <li>
          <strong>Son senkron:</strong>{" "}
          {health.lastSyncedAt ? new Date(health.lastSyncedAt).toLocaleString("tr-TR") : "—"}
        </li>
      </ul>
    </aside>
  );
}

export function FactoryStockFilterBar() {
  return (
    <section className="hz-filter-card hz-factory-filter">
      <div className="hz-filter-grid">
        <label>
          Fabrika
          <select defaultValue="">
            <option value="">Tüm fabrikalar</option>
          </select>
        </label>
        <label>
          Ürün kodu
          <input placeholder="Ürün kodu ara" />
        </label>
        <label>
          Marka
          <select defaultValue="">
            <option value="">Tüm markalar</option>
          </select>
        </label>
        <label>
          Koleksiyon
          <input placeholder="Koleksiyon" />
        </label>
        <label>
          Son senkron
          <select defaultValue="">
            <option value="">Tüm durumlar</option>
            <option value="active">Aktif</option>
            <option value="error">Hata</option>
          </select>
        </label>
      </div>
      <p className="muted">Filtreler görünürlük amaçlıdır; canlı fabrika yazımı bu ekrandan başarı üretmez.</p>
    </section>
  );
}

function FactoryStockPreviewPanel({ item }: { item: FactoryStockItem | null }) {
  const router = useRouter();
  if (!item) {
    return (
      <aside className="hz-factory-side">
        <p className="hz-factory-side-empty">Listeden bir ürün seçin.</p>
      </aside>
    );
  }
  return (
    <aside className="hz-factory-side">
      <p className="drawer-eyebrow">Fabrika stok</p>
      <h3>{item.productCode}</h3>
      <p>{item.productName}</p>
      <ul className="hz-factory-side-list">
        <li>
          <strong>Mevcut:</strong> {item.availableQuantity}
        </li>
        <li>
          <strong>Rezerve:</strong> {item.reservedQuantity}
        </li>
        <li>
          <strong>Durum:</strong> {item.integrationStatus}
        </li>
      </ul>
      <button className="hz-btn hz-btn-secondary hz-margin-top-sm" type="button" onClick={() => router.push("/stok")}>
        Ürün kartını aç
      </button>
    </aside>
  );
}

export function FactoryStocksPage({ data }: { data: Awaited<ReturnType<typeof import("../queries").getFactoryStockData>> }) {
  const [page, setPage] = useState(1);
  const [selectedStockId, setSelectedStockId] = useState<string | null>(null);
  const pageSize = 12;
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

  const integrationBadge = (status: FactoryStockItem["integrationStatus"]) => {
    if (status === "active") return "hz-badge hz-badge-success";
    if (status === "error") return "hz-badge hz-badge-danger";
    return "hz-badge hz-badge-warning";
  };

  return (
    <EntityListPageTemplate
      className="hz-factory-page hz-factory-stocks-page"
      header={
        <>
          <header className="hz-factory-topbar">
            <div>
              <h1 className="hz-factory-topbar-title">Fabrika stokları</h1>
              <p className="hz-factory-topbar-sub">
                Ürün bazlı fabrika stok görünürlüğü, son senkron ve entegrasyon durumunu izleyin.
              </p>
            </div>
          </header>
          <div className="hz-factory-kpi-strip" aria-label="Fabrika stok özeti">
            <div className="hz-factory-kpi">
              <span className="hz-factory-kpi-label">Snapshot</span>
              <span className="hz-factory-kpi-value">{data.snapshots.length}</span>
            </div>
            <div className="hz-factory-kpi">
              <span className="hz-factory-kpi-label">Stok satırı</span>
              <span className="hz-factory-kpi-value">{data.items.length}</span>
            </div>
            <div className="hz-factory-kpi">
              <span className="hz-factory-kpi-label">Uyarı</span>
              <span className="hz-factory-kpi-value">{data.health.warningCount}</span>
            </div>
            <div className="hz-factory-kpi">
              <span className="hz-factory-kpi-label">Hata</span>
              <span className="hz-factory-kpi-value">{data.health.errorCount}</span>
            </div>
          </div>
          <p className="hz-factory-preview-band" role="status">
            Senkron ve snapshot aksiyonları entegrasyon bağlantısı açıldığında canlı hale gelir.
          </p>
        </>
      }
      filters={<FactoryStockFilterBar />}
      list={
        <div className="hz-factory-list-wrap">
          {data.items.length === 0 ? (
            <p className="muted">Fabrika stok kaydı bulunamadı. Canlı veri bekleniyor.</p>
          ) : (
            <>
              <div className="hz-factory-table-head hz-factory-stocks-table-head" role="row">
                <span>Ürün kodu</span>
                <span>Ürün adı</span>
                <span>Fabrika</span>
                <span>Mevcut</span>
                <span>Son senkron</span>
                <span>Entegrasyon</span>
                <span>AKSİYON</span>
              </div>
              <div className="hz-factory-table-body">
                {pagedItems.map((item) => (
                  <div
                    key={item.id}
                    role="row"
                    className={`hz-factory-table-row hz-factory-stocks-table-row${selectedStockId === item.id ? " is-selected" : ""}`}
                    onClick={() => setSelectedStockId(item.id)}
                    tabIndex={0}
                  >
                    <span>{item.productCode}</span>
                    <span>{item.productName}</span>
                    <span>{item.factoryId}</span>
                    <span>{item.availableQuantity}</span>
                    <span>{item.lastSyncedAt ? new Date(item.lastSyncedAt).toLocaleString("tr-TR") : "—"}</span>
                    <span>
                      <span className={integrationBadge(item.integrationStatus)}>{item.integrationStatus}</span>
                    </span>
                    <span>
                      <button
                        type="button"
                        className="hz-factory-action-btn"
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedStockId(item.id);
                        }}
                      >
                        İncele
                      </button>
                    </span>
                  </div>
                ))}
              </div>
              <Pagination totalItems={data.items.length} pageSize={pageSize} currentPage={page} onPageChange={setPage} />
            </>
          )}
        </div>
      }
      preview={
        <>
          <FactoryStockPreviewPanel item={selected} />
          <FactoryIntegrationHealthCard health={data.health} />
        </>
      }
    />
  );
}

export function FactoryOrderFilterBar() {
  return (
    <section className="hz-filter-card hz-factory-filter">
      <div className="hz-filter-grid">
        <label>
          Fabrika
          <select defaultValue="">
            <option value="">Tüm fabrikalar</option>
          </select>
        </label>
        <label>
          Durum
          <select defaultValue="">
            <option value="">Tüm durumlar</option>
            <option value="sent">Gönderildi</option>
            <option value="producing">Üretimde</option>
          </select>
        </label>
        <label>
          Bağlı satış
          <input placeholder="Sipariş no" />
        </label>
        <label>
          Tarih
          <input type="date" />
        </label>
      </div>
      <p className="muted">Filtreler operasyon görünürlüğü içindir; canlı execute tamamlanmadan başarı durumu verilmez.</p>
    </section>
  );
}

function FactoryOrderPreviewPanel({ order }: { order: FactoryOrder | null }) {
  if (!order) {
    return (
      <aside className="hz-factory-side">
        <p className="hz-factory-side-empty">Listeden bir sipariş seçin.</p>
      </aside>
    );
  }
  return (
    <aside className="hz-factory-side">
      <p className="drawer-eyebrow">Fabrika siparişi</p>
      <h3>{order.factoryOrderNo}</h3>
      <p className="muted">Bağlı satış: {order.saleOrderNo ?? "—"}</p>
      <ul className="hz-factory-side-list">
        <li>
          <strong>Durum:</strong> {order.status}
        </li>
        <li>
          <strong>Satır:</strong> {order.lineCount}
        </li>
        <li>
          <strong>Fabrika:</strong> {order.factoryName}
        </li>
      </ul>
    </aside>
  );
}

export function FactoryOrdersPage({ orders }: { orders: FactoryOrder[] }) {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const pageSize = 12;
  const pagedOrders = useMemo(() => orders.slice((page - 1) * pageSize, page * pageSize), [orders, page]);
  const selected = useMemo(() => {
    if (!orders.length || !selectedOrderId) return null;
    return orders.find((order) => order.id === selectedOrderId) ?? null;
  }, [orders, selectedOrderId]);

  const transmissionHint = useMemo(() => {
    if (!orders.length) return "Liste boş — geri bildirim bekleniyor.";
    const sorted = [...orders].sort((a, b) => Date.parse(b.lastUpdatedAt) - Date.parse(a.lastUpdatedAt));
    const newest = sorted[0];
    if (!newest) return "Liste boş — geri bildirim bekleniyor.";
    return `Son kayıt: ${new Date(newest.lastUpdatedAt).toLocaleString("tr-TR")}`;
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
    <EntityListPageTemplate
      className="hz-factory-page hz-factory-orders-page"
      header={
        <>
          <header className="hz-factory-topbar">
            <div>
              <h1 className="hz-factory-topbar-title">Fabrika siparişleri</h1>
              <p className="hz-factory-topbar-sub">
                Fabrikaya açılan siparişleri, bağlı satış ve entegrasyon durumuyla takip edin.
              </p>
            </div>
          </header>
          <section className="hz-factory-transmit" aria-label="İletim ve fabrika geri bildirimi">
            <span className="hz-factory-transmit-pill">İletim: entegrasyon hazırlığı</span>
            <span className="hz-factory-transmit-pill">Durum kanalı: webhook / kuyruk</span>
            <span className="hz-factory-transmit-pill" title={transmissionHint}>
              Geri bildirim: {transmissionHint}
            </span>
          </section>
          <p className="hz-factory-preview-band" role="status">
            Sipariş açma ve durum sorgu aksiyonları entegrasyon bağlantısı açıldığında canlı hale gelir.
          </p>
        </>
      }
      filters={<FactoryOrderFilterBar />}
      list={
        <div className="hz-factory-list-wrap">
          {orders.length === 0 ? (
            <p className="muted">Fabrika sipariş kaydı bulunamadı. Canlı veri bekleniyor.</p>
          ) : (
            <>
              <div className="hz-factory-table-head hz-factory-orders-table-head" role="row">
                <span>Sipariş no</span>
                <span>Fabrika</span>
                <span>Bağlı satış</span>
                <span>Satır</span>
                <span>Durum</span>
                <span>Son güncelleme</span>
                <span>AKSİYON</span>
              </div>
              <div className="hz-factory-table-body">
                {pagedOrders.map((order) => (
                  <div
                    key={order.id}
                    role="row"
                    className={`hz-factory-table-row hz-factory-orders-table-row${selectedOrderId === order.id ? " is-selected" : ""}`}
                    onClick={() => setSelectedOrderId(order.id)}
                    onDoubleClick={() => router.push(`/fabrikalar/siparisler/${order.id}`)}
                    tabIndex={0}
                  >
                    <span>{order.factoryOrderNo}</span>
                    <span>{order.factoryName}</span>
                    <span>{order.saleOrderNo ?? "—"}</span>
                    <span>{order.lineCount}</span>
                    <span>{order.status}</span>
                    <span>{new Date(order.lastUpdatedAt).toLocaleString("tr-TR")}</span>
                    <span>
                      <button
                        type="button"
                        className="hz-factory-action-btn"
                        onClick={(event) => {
                          event.stopPropagation();
                          router.push(`/fabrikalar/siparisler/${order.id}`);
                        }}
                      >
                        İncele
                      </button>
                    </span>
                  </div>
                ))}
              </div>
              <Pagination totalItems={orders.length} pageSize={pageSize} currentPage={page} onPageChange={setPage} />
            </>
          )}
        </div>
      }
      preview={<FactoryOrderPreviewPanel order={selected} />}
    />
  );
}

export function FactoryOrderHeaderInfo({ order }: { order: FactoryOrder }) {
  return (
    <section className="hz-content-card">
      <p className="drawer-eyebrow">{order.factoryOrderNo}</p>
      <h2>{order.factoryName}</h2>
      <p className="muted">Bağlı satış: {order.saleOrderNo ?? "—"}</p>
      <span className="hz-badge hz-badge-info">{order.status}</span>
    </section>
  );
}

export function FactoryOrderLineTable({ order }: { order: FactoryOrder }) {
  return (
    <section className="hz-content-card">
      <h3>Ürün satırları</h3>
      <div className="table-wrap hz-table-wrap">
        <table className="table hz-table">
          <thead>
            <tr>
              <th>Ürün kodu</th>
              <th>Ürün adı</th>
              <th>Miktar</th>
              <th>Not</th>
            </tr>
          </thead>
          <tbody>
            {order.lines.map((line) => (
              <tr key={line.id}>
                <td>{line.productCode}</td>
                <td>{line.productName}</td>
                <td>{line.quantity}</td>
                <td>{line.note ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function FactoryOrderActionsBar({ order }: { order: FactoryOrder }) {
  const router = useRouter();
  return (
    <section className="hz-content-card">
      <h3>İşlemler</h3>
      <p className="muted">Gönderim ve durum güncelleme entegrasyon bağlantısı ile ilerler.</p>
      <div className="hz-inline-actions">
        <button className="hz-btn hz-btn-primary" type="button" disabled title="Entegrasyon bekleniyor">
          Onaya gönder
        </button>
        <button className="hz-btn hz-btn-secondary" type="button" disabled title="Entegrasyon bekleniyor">
          Gönder
        </button>
        <button className="hz-btn hz-btn-secondary" type="button" disabled title="Entegrasyon bekleniyor">
          Durum güncelle
        </button>
        {order.saleOrderId ? (
          <button
            className="hz-btn hz-btn-secondary"
            type="button"
            onClick={() => router.push(`/siparisler/${order.saleOrderId}`)}
          >
            İlgili siparişe git
          </button>
        ) : null}
      </div>
    </section>
  );
}

export function FactoryOrderDetailPage({ order, logs }: { order: FactoryOrder; logs: IntegrationLog[] }) {
  const relatedLogs = logs.filter((log) => log.entityId === order.id);
  return (
    <EntityDetailLayout
      className="hz-factory-detail-page"
      header={
        <PageHeader
          title="Fabrika sipariş detayı"
          description="Fabrika satırları, gönderim geçmişi ve bağlı satış."
          breadcrumb={order.factoryOrderNo}
        />
      }
      summary={<FactoryOrderHeaderInfo order={order} />}
      sections={
        <>
          <FactoryOrderLineTable order={order} />
          <section className="hz-content-card">
            <h3>Entegrasyon günlüğü</h3>
            {relatedLogs.length === 0 ? (
              <p className="muted">Bu sipariş için entegrasyon kaydı yok.</p>
            ) : (
              relatedLogs.map((log) => (
                <div key={log.id} className="hz-list-item">
                  <strong>{log.level}</strong>
                  <span>{log.message}</span>
                  <small>{new Date(log.createdAt).toLocaleString("tr-TR")}</small>
                </div>
              ))
            )}
          </section>
        </>
      }
      sidebar={<FactoryOrderActionsBar order={order} />}
    />
  );
}
