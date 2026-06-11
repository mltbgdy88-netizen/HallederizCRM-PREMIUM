"use client";

import type { FactoryOrder, FactoryStockItem, IntegrationLog } from "@hallederiz/types";
import { Pagination } from "@hallederiz/ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { LucideIcon } from "../../../components/icons/lucide-icons";
import { useToast } from "../../../providers/toast-provider";

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

export function FactoryStocksPage({ data }: { data: Awaited<ReturnType<typeof import("../queries").getFactoryStockData>> }) {
  const { pushToast } = useToast();
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
            <button type="button" className="fabf-btn fabf-btn--outline" onClick={() => pushToast("Senkron talebi entegrasyon bağlantısı ile açılacak (demo).")}>
              <LucideIcon name="rotate-ccw" size={14} />
              Senkron
            </button>
          </div>
        </header>

        <div className="fabf-kpi-row" aria-label="Fabrika stok özeti">
          <div className="fabf-kpi">
            <span className="fabf-kpi-label">Snapshot</span>
            <span className="fabf-kpi-value">{data.snapshots.length}</span>
          </div>
          <div className="fabf-kpi">
            <span className="fabf-kpi-label">Stok satırı</span>
            <span className="fabf-kpi-value">{data.items.length}</span>
          </div>
          <div className="fabf-kpi">
            <span className="fabf-kpi-label">Uyarı</span>
            <span className="fabf-kpi-value">{data.health.warningCount}</span>
          </div>
          <div className="fabf-kpi">
            <span className="fabf-kpi-label">Hata</span>
            <span className="fabf-kpi-value">{data.health.errorCount}</span>
          </div>
        </div>

        <p className="fabf-band" role="status">
          Senkron ve snapshot aksiyonları entegrasyon bağlantısı açıldığında canlı hale gelir.
        </p>

        <FactoryStockFilters />

        <div className="fabf-workspace">
          <div className="fabf-main">
            <div className="fabf-list-wrap">
              {data.items.length === 0 ? (
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

function FactoryOrderSidePanel({ order }: { order: FactoryOrder | null }) {
  if (!order) {
    return (
      <aside className="fabf-side">
        <p className="fabf-side-empty">Listeden bir sipariş seçin.</p>
      </aside>
    );
  }
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
    </aside>
  );
}

export function FactoryOrdersPage({ orders }: { orders: FactoryOrder[] }) {
  const router = useRouter();
  const { pushToast } = useToast();
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

  const fireSendDemo = useCallback(() => {
    pushToast("Sipariş iletimi entegrasyon onayı sonrası kuyruğa alınır (demo).");
  }, [pushToast]);

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
            <button type="button" className="fabf-btn fabf-btn--outline" onClick={fireSendDemo}>
              <LucideIcon name="send" size={14} />
              Sipariş İlet
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

        <p className="fabf-band" role="status">
          Sipariş açma ve durum sorgu aksiyonları entegrasyon bağlantısı açıldığında canlı hale gelir.
        </p>

        <FactoryOrderFilters />

        <div className="fabf-workspace">
          <div className="fabf-main">
            <div className="fabf-list-wrap">
              {orders.length === 0 ? (
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
          <FactoryOrderSidePanel order={selected} />
        </div>
      </div>
    </div>
  );
}

export function FactoryOrderDetailPage({ order, logs }: { order: FactoryOrder; logs: IntegrationLog[] }) {
  const router = useRouter();
  const { pushToast } = useToast();
  const [approveDone, setApproveDone] = useState(false);
  const [sendDone, setSendDone] = useState(false);
  const relatedLogs = logs.filter((log) => log.entityId === order.id);

  const fireDemo = useCallback(
    (msg: string, setter?: () => void) => {
      pushToast(msg);
      setter?.();
    },
    [pushToast]
  );

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
                  onClick={() => fireDemo("Onaya gönderme talebi demo olarak kaydedildi; kalıcı mutation yok.", () => setApproveDone(true))}
                >
                  {approveDone ? "Onaya iletildi" : "Onaya gönder"}
                </button>
                <button
                  className="fabf-btn fabf-btn--outline"
                  type="button"
                  disabled={sendDone}
                  onClick={() => fireDemo("Fabrika gönderim kuyruğu demo toast ile simüle edildi.", () => setSendDone(true))}
                >
                  {sendDone ? "Gönderildi" : "Gönder"}
                </button>
                <button
                  className="fabf-btn fabf-btn--outline"
                  type="button"
                  onClick={() => fireDemo("Durum sorgusu entegrasyon API'si bağlandığında çalışır (demo).")}
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
