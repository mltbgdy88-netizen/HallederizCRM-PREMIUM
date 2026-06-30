"use client";

import type { FactoryOrder, FactoryStockItem, IntegrationLog } from "@hallederiz/types";
import { Pagination } from "@hallederiz/ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { LucideIcon } from "../../../components/icons/lucide-icons";
import { useToast } from "../../../providers/toast-provider";
import { useFactoryChannel } from "../hooks/use-factory-channel";
import { useFactoryOrderData } from "../hooks/use-factory-order-data";
import { useFactoryOrderDetail } from "../hooks/use-factory-order-detail";
import { useFactoryStockData } from "../hooks/use-factory-stock-data";
import { sendFactoryOrderMutation, syncFactoryStockMutation, testFactoryChannelSyncMutation } from "../mutations";
import type { FactoryStockData } from "../queries";
import { canOperateFactoryRecord } from "../utils/map-factory-channel-view";
import { latestFactoryOrderLog, logsForFactoryOrderRecord } from "../utils/sort-factory-integration-logs";
import { FactoryChannelBand } from "./FactoryChannelBand";
import { FactoryFeedbackState } from "./FactoryFeedbackState";

function FactoryStatusBanner({
  useDemo,
  channel
}: {
  useDemo: boolean;
  channel: ReturnType<typeof useFactoryChannel>;
}) {
  if (useDemo) {
    return (
      <p className="fabf-band" role="status">
        Senkron ve snapshot aksiyonları entegrasyon bağlantısı açıldığında canlı hale gelir.
      </p>
    );
  }
  if (channel.error) {
    return (
      <FactoryFeedbackState tone="error" message={channel.error} onRetry={() => void channel.refresh()} />
    );
  }
  return <FactoryChannelBand channelView={channel.channelView} loading={channel.loading} />;
}

function integrationBadgeClass(status: FactoryStockItem["integrationStatus"]) {
  if (status === "active") return "fabf-badge fabf-badge--success";
  if (status === "error") return "fabf-badge fabf-badge--danger";
  return "fabf-badge fabf-badge--warning";
}

function FactoryStockSidePanel({ item }: { item: FactoryStockItem | null }) {
  const router = useRouter();
  if (!item) {
    return (
      <aside className="fabf-side">
        <p className="fabf-side-empty">Kayıt seçilmedi.</p>
      </aside>
    );
  }
  return (
    <aside className="fabf-side">
      <p className="fabf-side-eyebrow">Fabrika stok</p>
      <h3>{item.productCode}</h3>
      <p>{item.productName}</p>
      <ul className="fabf-side-list">
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
      <button className="fabf-btn fabf-btn--outline" type="button" onClick={() => router.push("/stok")}>
        Ürün kartını aç
      </button>
    </aside>
  );
}

function FactoryIntegrationHealthCard({
  health
}: {
  health: { status: string; message: string; warningCount: number; errorCount: number; lastSyncedAt?: string };
}) {
  return (
    <aside className="fabf-side">
      <p className="fabf-side-eyebrow">Entegrasyon durumu</p>
      <h3>{health.status}</h3>
      <p className="fabf-section-desc">{health.message}</p>
      <ul className="fabf-side-list">
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

function FactoryStockFilters() {
  return (
    <section className="fabf-filters" aria-label="Fabrika stok filtreleri">
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
        Son senkron
        <select defaultValue="">
          <option value="">Tüm durumlar</option>
          <option value="active">Aktif</option>
          <option value="error">Hata</option>
        </select>
      </label>
      <p className="fabf-filters-note">Filtreler görünürlük amaçlıdır; canlı fabrika yazımı bu ekrandan başarı üretmez.</p>
    </section>
  );
}

export function FactoryStocksPage() {
  const channel = useFactoryChannel();
  const stock = useFactoryStockData();
  const { pushToast } = useToast();
  const [page, setPage] = useState(1);
  const [selectedStockId, setSelectedStockId] = useState<string | null>(null);
  const [syncPending, setSyncPending] = useState(false);
  const [testPending, setTestPending] = useState(false);
  const pageSize = 12;

  const data: FactoryStockData = stock.data ?? {
    factories: [],
    brands: [],
    integrations: [],
    items: [],
    snapshots: [],
    health: {
      status: "healthy",
      activeConnectionCount: 0,
      warningCount: 0,
      errorCount: 0,
      message: "Yükleniyor…"
    }
  };

  const showLoading = stock.loading && !stock.data;
  const kpiPlaceholder = showLoading ? "…" : undefined;
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

  const syncTargetFactoryId = selected?.factoryId ?? data.factories[0]?.id ?? null;
  const syncEnabled =
    Boolean(syncTargetFactoryId) &&
    canOperateFactoryRecord(data.factories.find((factory) => factory.id === syncTargetFactoryId), stock.useDemo) &&
    (channel.canOperate || stock.useDemo) &&
    !showLoading &&
    !stock.error;

  const testEnabled =
    Boolean(syncTargetFactoryId) &&
    (channel.canOperate || stock.useDemo) &&
    !showLoading &&
    !stock.error;

  const handleTest = async () => {
    if (!testEnabled || testPending) return;
    setTestPending(true);
    const result = await testFactoryChannelSyncMutation(syncTargetFactoryId ?? undefined, {
      useDemoData: stock.useDemo,
      pushToast
    });
    if (result || stock.useDemo) {
      await channel.refresh();
    }
    setTestPending(false);
  };

  const handleSync = async () => {
    if (!syncTargetFactoryId || !syncEnabled || syncPending) return;
    setSyncPending(true);
    const result = await syncFactoryStockMutation(syncTargetFactoryId, {
      useDemoData: stock.useDemo,
      pushToast
    });
    if (result || stock.useDemo) {
      await Promise.all([stock.refresh(), channel.refresh()]);
    }
    setSyncPending(false);
  };

  return (
    <div className="fabf-page" data-page="fabrika-stok-reference">
      <div className="fabf-shell">
        <header className="fabf-head">
          <div className="fabf-head-text">
            <h1>Fabrika Stok Operasyon Masası</h1>
            <p>Ürün bazlı fabrika stok görünürlüğü, son senkron ve entegrasyon durumunu izleyin.</p>
          </div>
          <div className="fabf-head-actions">
            <Link href="/fabrikalar/siparisler" className="fabf-btn fabf-btn--outline">
              <LucideIcon name="factory" size={14} />
              Fabrika Siparişleri
            </Link>
            <button
              type="button"
              className="fabf-btn fabf-btn--outline"
              disabled={!testEnabled || testPending}
              title={testEnabled ? "Fabrika bağlantı testi" : channel.channelView.note}
              onClick={() => void handleTest()}
            >
              <LucideIcon name="zap" size={14} />
              {testPending ? "Test…" : "Bağlantı testi"}
            </button>
            <button
              type="button"
              className="fabf-btn fabf-btn--outline"
              disabled={!syncEnabled || syncPending}
              title={syncEnabled ? "Seçili fabrika stok senkronu" : channel.channelView.note}
              onClick={() => void handleSync()}
            >
              <LucideIcon name="rotate-ccw" size={14} />
              {syncPending ? "Senkron…" : "Senkron"}
            </button>
          </div>
        </header>

        <div className="fabf-kpi-row" aria-label="Fabrika stok özeti">
          <div className="fabf-kpi">
            <span className="fabf-kpi-label">Snapshot</span>
            <span className="fabf-kpi-value">{kpiPlaceholder ?? data.snapshots.length}</span>
          </div>
          <div className="fabf-kpi">
            <span className="fabf-kpi-label">Stok satırı</span>
            <span className="fabf-kpi-value">{kpiPlaceholder ?? data.items.length}</span>
          </div>
          <div className="fabf-kpi">
            <span className="fabf-kpi-label">Uyarı</span>
            <span className="fabf-kpi-value">{kpiPlaceholder ?? data.health.warningCount}</span>
          </div>
          <div className="fabf-kpi">
            <span className="fabf-kpi-label">Hata</span>
            <span className="fabf-kpi-value">{kpiPlaceholder ?? data.health.errorCount}</span>
          </div>
        </div>

        <FactoryStatusBanner useDemo={stock.useDemo} channel={channel} />

        <FactoryStockFilters />

        <div className="fabf-workspace">
          <div className="fabf-main">
            <div className="fabf-list-wrap">
              {showLoading ? (
                <FactoryFeedbackState tone="loading" message="Fabrika stok verileri yükleniyor…" />
              ) : stock.error ? (
                <FactoryFeedbackState tone="error" message={stock.error} onRetry={() => void stock.refresh()} />
              ) : data.items.length === 0 ? (
                <p className="fabf-empty">Fabrika stok kaydı bulunamadı. Canlı veri bekleniyor.</p>
              ) : (
                <>
                  <div className="fabf-table-head fabf-stocks-grid" role="row">
                    <span>Ürün kodu</span>
                    <span>Ürün adı</span>
                    <span>Fabrika</span>
                    <span>Mevcut</span>
                    <span>Son senkron</span>
                    <span>Entegrasyon</span>
                    <span>AKSİYON</span>
                  </div>
                  <div className="fabf-table-body">
                    {pagedItems.map((item) => (
                      <div
                        key={item.id}
                        role="row"
                        className={`fabf-table-row fabf-stocks-grid${selectedStockId === item.id ? " fabf-table-row--selected" : ""}`}
                        onClick={() => setSelectedStockId(item.id)}
                        tabIndex={0}
                      >
                        <span>{item.productCode}</span>
                        <span>{item.productName}</span>
                        <span>{item.factoryId}</span>
                        <span>{item.availableQuantity}</span>
                        <span>{item.lastSyncedAt ? new Date(item.lastSyncedAt).toLocaleString("tr-TR") : "—"}</span>
                        <span>
                          <span className={integrationBadgeClass(item.integrationStatus)}>{item.integrationStatus}</span>
                        </span>
                        <span>
                          <button
                            type="button"
                            className="fabf-action-btn"
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
                  <div className="fabf-pagination">
                    <Pagination totalItems={data.items.length} pageSize={pageSize} currentPage={page} onPageChange={setPage} />
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="fabf-side-stack">
            <FactoryStockSidePanel item={selected} />
            <FactoryIntegrationHealthCard health={data.health} />
          </div>
        </div>
      </div>
    </div>
  );
}

function FactoryOrderFilters() {
  return (
    <section className="fabf-filters" aria-label="Fabrika sipariş filtreleri">
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
      <p className="fabf-filters-note">Filtreler operasyon görünürlüğü içindir; canlı execute tamamlanmadan başarı durumu verilmez.</p>
    </section>
  );
}

function FactoryOrderSidePanel({ order, logs }: { order: FactoryOrder | null; logs: IntegrationLog[] }) {
  if (!order) {
    return (
      <aside className="fabf-side">
        <p className="fabf-side-empty">Listeden bir sipariş seçin.</p>
      </aside>
    );
  }
  const latestLog = latestFactoryOrderLog(logs, order);
  return (
    <aside className="fabf-side">
      <p className="fabf-side-eyebrow">Fabrika siparişi</p>
      <h3>{order.factoryOrderNo}</h3>
      <p className="fabf-section-desc">Bağlı satış: {order.saleOrderNo ?? "—"}</p>
      <ul className="fabf-side-list">
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
      {latestLog ? (
        <div className="fabf-log-item" style={{ marginTop: 10 }}>
          <strong>{latestLog.level}</strong>
          <span>{latestLog.message}</span>
          <small>{new Date(latestLog.createdAt).toLocaleString("tr-TR")}</small>
        </div>
      ) : (
        <p className="fabf-section-desc">Entegrasyon günlüğü kaydı yok.</p>
      )}
    </aside>
  );
}

export function FactoryOrdersPage() {
  const router = useRouter();
  const channel = useFactoryChannel();
  const ordersDesk = useFactoryOrderData();
  const { pushToast } = useToast();
  const [page, setPage] = useState(1);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [sendPending, setSendPending] = useState(false);
  const [testPending, setTestPending] = useState(false);
  const pageSize = 12;
  const orders = ordersDesk.orders;
  const logs = ordersDesk.logs;

  const showLoading = ordersDesk.loading && orders.length === 0 && !ordersDesk.error;
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

  const sendEnabled =
    Boolean(selected) &&
    (channel.canOperate || ordersDesk.useDemo) &&
    !showLoading &&
    !ordersDesk.error;

  const testTargetFactoryId = selected?.factoryId ?? orders[0]?.factoryId ?? null;
  const testEnabled =
    Boolean(testTargetFactoryId) &&
    (channel.canOperate || ordersDesk.useDemo) &&
    !showLoading &&
    !ordersDesk.error;

  const handleTestChannel = async () => {
    if (!testEnabled || testPending) return;
    setTestPending(true);
    const result = await testFactoryChannelSyncMutation(testTargetFactoryId ?? undefined, {
      useDemoData: ordersDesk.useDemo,
      pushToast
    });
    if (result || ordersDesk.useDemo) {
      await channel.refresh();
    }
    setTestPending(false);
  };

  const handleSendOrder = async () => {
    if (!selected || !sendEnabled || sendPending) return;
    setSendPending(true);
    const result = await sendFactoryOrderMutation(selected.id, {
      useDemoData: ordersDesk.useDemo,
      pushToast
    });
    if (result || ordersDesk.useDemo) {
      await Promise.all([ordersDesk.refresh(), channel.refresh()]);
    }
    setSendPending(false);
  };

  return (
    <div className="fabf-page" data-page="fabrika-siparis-reference">
      <div className="fabf-shell">
        <header className="fabf-head">
          <div className="fabf-head-text">
            <h1>Fabrika Sipariş Operasyon Masası</h1>
            <p>Fabrikaya açılan siparişleri, bağlı satış ve entegrasyon durumunu tek ekranda izleyin.</p>
          </div>
          <div className="fabf-head-actions">
            <Link href="/fabrikalar/stoklar" className="fabf-btn fabf-btn--outline">
              <LucideIcon name="package" size={14} />
              Fabrika Stokları
            </Link>
            <button
              type="button"
              className="fabf-btn fabf-btn--outline"
              disabled={!testEnabled || testPending}
              title={testEnabled ? "Fabrika bağlantı testi" : channel.channelView.note}
              onClick={() => void handleTestChannel()}
            >
              <LucideIcon name="zap" size={14} />
              {testPending ? "Test…" : "Bağlantı testi"}
            </button>
            <button
              type="button"
              className="fabf-btn fabf-btn--outline"
              disabled={!sendEnabled || sendPending}
              title={sendEnabled ? "Seçili siparişi fabrikaya ilet" : channel.channelView.note}
              onClick={() => void handleSendOrder()}
            >
              <LucideIcon name="send" size={14} />
              {sendPending ? "İletiliyor…" : "Sipariş İlet"}
            </button>
          </div>
        </header>

        <div className="fabf-transmit" aria-label="İletim ve fabrika geri bildirimi">
          <span className="fabf-transmit-pill">İletim: entegrasyon hazırlığı</span>
          <span className="fabf-transmit-pill">Durum kanalı: webhook / kuyruk</span>
          <span className="fabf-transmit-pill" title={transmissionHint}>
            Geri bildirim: {transmissionHint}
          </span>
        </div>

        <FactoryStatusBanner useDemo={ordersDesk.useDemo} channel={channel} />

        <FactoryOrderFilters />

        <div className="fabf-workspace">
          <div className="fabf-main">
            <div className="fabf-list-wrap">
              {showLoading ? (
                <FactoryFeedbackState tone="loading" message="Fabrika sipariş verileri yükleniyor…" />
              ) : ordersDesk.error ? (
                <FactoryFeedbackState tone="error" message={ordersDesk.error} onRetry={() => void ordersDesk.refresh()} />
              ) : orders.length === 0 ? (
                <p className="fabf-empty">Fabrika sipariş kaydı bulunamadı. Canlı veri bekleniyor.</p>
              ) : (
                <>
                  <div className="fabf-table-head fabf-orders-grid" role="row">
                    <span>Sipariş no</span>
                    <span>Fabrika</span>
                    <span>Bağlı satış</span>
                    <span>Satır</span>
                    <span>Durum</span>
                    <span>Son güncelleme</span>
                    <span>AKSİYON</span>
                  </div>
                  <div className="fabf-table-body">
                    {pagedOrders.map((order) => (
                      <div
                        key={order.id}
                        role="row"
                        className={`fabf-table-row fabf-orders-grid${selectedOrderId === order.id ? " fabf-table-row--selected" : ""}`}
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
                            className="fabf-action-btn"
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
                  <div className="fabf-pagination">
                    <Pagination totalItems={orders.length} pageSize={pageSize} currentPage={page} onPageChange={setPage} />
                  </div>
                </>
              )}
            </div>
          </div>
          <FactoryOrderSidePanel order={selected} logs={logs} />
        </div>
      </div>
    </div>
  );
}

export function FactoryOrderDetailPage({ factoryOrderId }: { factoryOrderId: string }) {
  const router = useRouter();
  const channel = useFactoryChannel();
  const detail = useFactoryOrderDetail(factoryOrderId);
  const { pushToast } = useToast();
  const [approveDone, setApproveDone] = useState(false);
  const [sendDone, setSendDone] = useState(false);
  const [sendPending, setSendPending] = useState(false);

  const order = detail.order;
  const relatedLogs = logsForFactoryOrderRecord(detail.logs, order);

  const handleSend = async () => {
    if (!order || sendPending || sendDone) return;
    setSendPending(true);
    const result = await sendFactoryOrderMutation(order.id, {
      useDemoData: detail.useDemo,
      pushToast
    });
    if (result || detail.useDemo) {
      setSendDone(true);
      await Promise.all([detail.refresh(), channel.refresh()]);
    }
    setSendPending(false);
  };

  if (detail.loading && !order) {
    return (
      <div className="fabf-page" data-page="fabrika-siparis-detay-reference">
        <div className="fabf-shell fabf-shell--detail">
          <FactoryFeedbackState tone="loading" message="Fabrika sipariş detayı yükleniyor…" />
        </div>
      </div>
    );
  }

  if (detail.error || !order) {
    return (
      <div className="fabf-page" data-page="fabrika-siparis-detay-reference">
        <div className="fabf-shell fabf-shell--detail">
          <FactoryFeedbackState
            tone="error"
            message={detail.error ?? "Fabrika siparişi bulunamadı."}
            onRetry={() => void detail.refresh()}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="fabf-page" data-page="fabrika-siparis-detay-reference">
      <div className="fabf-shell fabf-shell--detail">
        <header className="fabf-head">
          <div className="fabf-head-text">
            <p className="fabf-crumb">Fabrikalar / {order.factoryOrderNo}</p>
            <h1>Fabrika Sipariş Detayı</h1>
            <p>Fabrika satırları, gönderim geçmişi ve bağlı satış.</p>
          </div>
          <div className="fabf-head-actions">
            <button type="button" className="fabf-btn fabf-btn--outline" onClick={() => router.push("/fabrikalar/siparisler")}>
              <LucideIcon name="chevron-left" size={14} />
              Sipariş listesi
            </button>
          </div>
        </header>

        <FactoryStatusBanner useDemo={detail.useDemo} channel={channel} />

        <div className="fabf-detail-workspace">
          <div className="fabf-detail-main">
            <section className="fabf-section">
              <p className="fabf-side-eyebrow">{order.factoryOrderNo}</p>
              <h2>{order.factoryName}</h2>
              <p className="fabf-section-desc">Bağlı satış: {order.saleOrderNo ?? "—"}</p>
              <span className="fabf-badge fabf-badge--info">{order.status}</span>
            </section>

            <section className="fabf-section">
              <h3>Ürün satırları</h3>
              <div className="fabf-table-wrap">
                <table className="fabf-table">
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

            <section className="fabf-section">
              <h3>Entegrasyon günlüğü</h3>
              {relatedLogs.length === 0 ? (
                <p className="fabf-section-desc">Bu sipariş için entegrasyon kaydı yok.</p>
              ) : (
                relatedLogs.map((log) => (
                  <div key={log.id} className="fabf-log-item">
                    <strong>{log.level}</strong>
                    <span>{log.message}</span>
                    <small>{new Date(log.createdAt).toLocaleString("tr-TR")}</small>
                  </div>
                ))
              )}
            </section>
          </div>

          <aside className="fabf-detail-side">
            <section className="fabf-section">
              <h3>İşlemler</h3>
              <p className="fabf-section-desc">Gönderim ve durum güncelleme entegrasyon bağlantısı ile ilerler.</p>
              <div className="fabf-actions">
                <button
                  className="fabf-btn fabf-btn--primary"
                  type="button"
                  disabled={approveDone}
                  onClick={() => {
                    pushToast("Onaya gönderme talebi demo olarak kaydedildi; kalıcı mutation yok.");
                    setApproveDone(true);
                  }}
                >
                  {approveDone ? "Onaya iletildi" : "Onaya gönder"}
                </button>
                <button
                  className="fabf-btn fabf-btn--outline"
                  type="button"
                  disabled={sendDone || sendPending || (!channel.canOperate && !detail.useDemo)}
                  onClick={() => void handleSend()}
                >
                  {sendPending ? "Gönderiliyor…" : sendDone ? "Gönderildi" : "Gönder"}
                </button>
                <button
                  className="fabf-btn fabf-btn--outline"
                  type="button"
                  onClick={() => pushToast("Durum sorgusu entegrasyon API'si bağlandığında çalışır.")}
                >
                  Durum güncelle
                </button>
                {order.saleOrderId ? (
                  <button className="fabf-btn fabf-btn--outline" type="button" onClick={() => router.push(`/siparisler/${order.saleOrderId}`)}>
                    İlgili siparişe git
                  </button>
                ) : null}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
