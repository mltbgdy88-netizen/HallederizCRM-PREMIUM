"use client";

import { LoadingState } from "@hallederiz/ui";
import type { Customer, WarehouseOrder, WarehouseOrderLine } from "@hallederiz/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  IconArchive,
  IconArrowLeft,
  IconArrowRightCircle,
  IconBarChart3,
  IconBot,
  IconCheckCircle,
  IconClipboardList,
  IconEdit3,
  IconExternalLink,
  IconListRows,
  IconPlus,
  IconPrinter,
  IconRotateCcw,
  IconSparkles,
  IconTrash2,
  IconTruck,
  IconXCircle
} from "../../dashboard/components/dashboard-inline-icons";
import { useToast } from "../../../providers/toast-provider";
import type { WarehousePrepListTab, WarehouseTaskFilters } from "../schemas/warehouse-filter-schema";
import { useWarehouseTaskFilters } from "../hooks/use-warehouse-task-filters";
import { useWarehouseTasksData } from "../hooks/use-warehouse-tasks-data";
import { filterWarehouseOrders } from "../utils/filter-warehouse-tasks";
import { getWarehouseOrderDetail } from "../queries/get-warehouse-orders";
import { getWarehouseOrderStatusLabel } from "../queries/warehouse-mock-data";
import { dateLabel } from "../utils";
import {
  getPrepDisplayStatus,
  getWarehouseOrderPrepLabel,
  lineShortage,
  orderHasShortage,
  orderPreparedTotal,
  orderShortageTotal,
  orderTotalRollUnits
} from "../utils/warehouse-prep-status";

function isSameLocalDay(iso: string, ref: Date): boolean {
  const d = new Date(iso);
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth() && d.getDate() === ref.getDate();
}

function nextStepCopy(order: WarehouseOrder): string {
  const prep = getPrepDisplayStatus(order);
  if (prep === "beklemede") return "Depo görevlisi hazırlığı tamamlayınca teslim bekleyen aşamasına geçer.";
  if (prep === "hazirlandi") return "Hızlı İşlem > Ürün Teslimi ekranında teslim edilebilir.";
  if (prep === "eksik") return "Eksik ürün için satış veya operasyon kontrolü gerekir.";
  if (prep === "iptal") return "Bu belge iptal edildi.";
  if (prep === "teslim_edildi") return "Teslim tamamlandı; Ürün Teslim Fişi arşivde yer alır.";
  return "";
}

function pickingSubnote(order: WarehouseOrder): string | null {
  if (order.status !== "picking") return null;
  if (orderHasShortage(order)) {
    return "Toplama sürüyor; tüm satırlar tamamlanınca fişi Hazırlandı olarak işaretleyebilirsiniz.";
  }
  return "Toplama başladı; satır adetleri tamamlandıysa fişi Hazırlandı olarak işaretleyebilirsiniz.";
}

function prepPillClass(order: WarehouseOrder): string {
  const status = getPrepDisplayStatus(order);
  if (status === "hazirlandi") return "whf-pill whf-pill--ok";
  if (status === "eksik") return "whf-pill whf-pill--danger";
  if (status === "beklemede") return "whf-pill whf-pill--warn";
  if (status === "iptal") return "whf-pill whf-pill--muted";
  return "whf-pill whf-pill--info";
}

function lineNote(line: WarehouseOrderLine): string {
  if (lineShortage(line) > 0) return "Eksik";
  if (line.preparedQuantity >= line.requestedQuantity && line.requestedQuantity > 0) return "Tamam";
  return "Beklemede";
}

export function WarehouseTasksPage() {
  const router = useRouter();
  const { pushToast } = useToast();
  const { filters, updateFilter, resetFilters } = useWarehouseTaskFilters();
  const { loading, customers, filteredWarehouseOrders, warehouseOrders } = useWarehouseTasksData(filters);
  const [selectedWarehouseOrderId, setSelectedWarehouseOrderId] = useState<string | null>(null);
  const [manualDemoDone, setManualDemoDone] = useState(false);

  const kpiScope = useMemo(
    () => filterWarehouseOrders(warehouseOrders, { ...filters, prepTab: "tumu", prepDisplayFilter: "all" }, customers),
    [warehouseOrders, filters, customers]
  );

  const now = useMemo(() => new Date(), []);

  const kpis = useMemo(() => {
    const bekleyen = kpiScope.filter((o) => getPrepDisplayStatus(o) === "beklemede").length;
    const hazirlanan = kpiScope.filter((o) => getPrepDisplayStatus(o) === "hazirlandi").length;
    const eksik = kpiScope.filter((o) => getPrepDisplayStatus(o) === "eksik").length;
    const bugunHazirlanacak = kpiScope.filter((o) => {
      const prep = getPrepDisplayStatus(o);
      if (prep !== "beklemede" && prep !== "eksik") return false;
      return isSameLocalDay(o.createdAt, now) || isSameLocalDay(o.dueAt, now) || isSameLocalDay(o.updatedAt, now);
    }).length;
    const toplamRulo = kpiScope.reduce((sum, o) => sum + orderTotalRollUnits(o), 0);
    return { bekleyen, hazirlanan, eksik, bugunHazirlanacak, toplamRulo, teslimBekleyen: hazirlanan };
  }, [kpiScope, now]);

  useEffect(() => {
    if (!selectedWarehouseOrderId && filteredWarehouseOrders[0]) {
      setSelectedWarehouseOrderId(filteredWarehouseOrders[0].id);
      return;
    }
    if (selectedWarehouseOrderId && !filteredWarehouseOrders.some((o) => o.id === selectedWarehouseOrderId)) {
      setSelectedWarehouseOrderId(filteredWarehouseOrders[0]?.id ?? null);
    }
  }, [filteredWarehouseOrders, selectedWarehouseOrderId]);

  const selectedWarehouseOrder = useMemo(
    () => filteredWarehouseOrders.find((o) => o.id === selectedWarehouseOrderId) ?? filteredWarehouseOrders[0] ?? null,
    [filteredWarehouseOrders, selectedWarehouseOrderId]
  );

  const selectedCustomer = useMemo(
    () => customers.find((c) => c.id === selectedWarehouseOrder?.customerId) ?? null,
    [customers, selectedWarehouseOrder?.customerId]
  );

  const setPrepTab = useCallback(
    (tab: WarehousePrepListTab) => {
      updateFilter("prepTab", tab);
      updateFilter("prepDisplayFilter", "all");
    },
    [updateFilter]
  );

  const fireDemo = useCallback((msg: string) => pushToast(msg), [pushToast]);

  return (
    <div className="whf-page" data-page="depo-hazirlik-reference">
      <div className="whf-layout">
        <div className="whf-main">
          <header className="whf-head">
            <div className="whf-head-text">
              <h1>Depo Hazırlık Operasyon Masası</h1>
              <p>Satılan ürünlerin depo toplama, raf kontrolü ve teslim öncesi hazırlık sürecini yönetin.</p>
            </div>
            <div className="whf-head-actions">
              <button type="button" className="whf-btn whf-btn--outline" onClick={() => fireDemo("Toplama listesi PDF/Excel bağlantısı yakında (demo).")}>
                <IconListRows size={16} aria-hidden />
                Toplama Listesi
              </button>
              <button type="button" className="whf-btn whf-btn--outline" onClick={() => fireDemo("Hazırlık raporu oluşturma yakında (demo).")}>
                <IconBarChart3 size={16} aria-hidden />
                Hazırlık Raporu
              </button>
              <button
                type="button"
                className="whf-btn whf-btn--primary"
                disabled={manualDemoDone}
                onClick={() => {
                  pushToast("Manuel fiş oluşturma bu sürümde demo; backend işlemi başlatılmadı.");
                  setManualDemoDone(true);
                }}
              >
                <IconPlus size={16} aria-hidden />
                Yeni Manuel Fiş
              </button>
            </div>
          </header>

          <div className="whf-kpi-row" aria-label="Depo hazırlık KPI">
            <div className="whf-kpi whf-kpi--warn">
              <span className="whf-kpi-label">Bekleyen</span>
              <span className="whf-kpi-value">{kpis.bekleyen}</span>
            </div>
            <div className="whf-kpi whf-kpi--ok">
              <span className="whf-kpi-label">Hazırlanan</span>
              <span className="whf-kpi-value">{kpis.hazirlanan}</span>
            </div>
            <div className="whf-kpi whf-kpi--danger">
              <span className="whf-kpi-label">Eksik</span>
              <span className="whf-kpi-value">{kpis.eksik}</span>
            </div>
            <div className="whf-kpi whf-kpi--info">
              <span className="whf-kpi-label">Bugün hazırlanacak</span>
              <span className="whf-kpi-value">{kpis.bugunHazirlanacak}</span>
            </div>
            <div className="whf-kpi whf-kpi--neutral">
              <span className="whf-kpi-label-stack">
                <span className="whf-kpi-label">Toplam</span>
                <span className="whf-kpi-label-sub">Rulo/adet</span>
              </span>
              <span className="whf-kpi-value">{kpis.toplamRulo}</span>
            </div>
            <div className="whf-kpi whf-kpi--primary">
              <span className="whf-kpi-label">Teslim bekleyen</span>
              <span className="whf-kpi-value">{kpis.teslimBekleyen}</span>
            </div>
          </div>

          <div className="whf-filters" role="search">
            <input
              className="whf-filter-input whf-filter-input--grow"
              value={filters.documentQuery}
              onChange={(e) => updateFilter("documentQuery", e.target.value)}
              placeholder="Belge no, sipariş no veya cari ara…"
              aria-label="Belge veya cari ara"
            />
            <label className="whf-filter-field">
              <span>Durum</span>
              <select
                className="whf-filter-select"
                value={filters.prepDisplayFilter}
                onChange={(e) => updateFilter("prepDisplayFilter", e.target.value as WarehouseTaskFilters["prepDisplayFilter"])}
              >
                <option value="all">Tümü</option>
                <option value="beklemede">Beklemede</option>
                <option value="hazirlandi">Hazırlandı</option>
                <option value="eksik">Eksik</option>
              </select>
            </label>
            <label className="whf-filter-field">
              <span>Tarih</span>
              <select
                className="whf-filter-select"
                value={filters.datePreset}
                onChange={(e) => updateFilter("datePreset", e.target.value as WarehouseTaskFilters["datePreset"])}
              >
                <option value="all">Tümü</option>
                <option value="today">Bugün</option>
              </select>
            </label>
            <input
              className="whf-filter-input"
              value={filters.assignee}
              onChange={(e) => updateFilter("assignee", e.target.value)}
              placeholder="Depo görevlisi"
              aria-label="Depo görevlisi"
            />
            <button type="button" className="whf-icon-btn" aria-label="Filtreleri sıfırla" onClick={resetFilters}>
              <IconRotateCcw size={16} aria-hidden />
            </button>
          </div>

          <div className="whf-chips" role="tablist" aria-label="Liste görünümü">
            {(
              [
                ["bekleyenler", "Bekleyenler"],
                ["hazirlananlar", "Hazırlananlar"],
                ["eksikler", "Eksikler"],
                ["tumu", "Tüm kayıtlar"]
              ] as const
            ).map(([tab, label]) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={filters.prepTab === tab}
                className={`whf-chip${filters.prepTab === tab ? " whf-chip--active" : ""}`}
                onClick={() => setPrepTab(tab)}
              >
                {label}
              </button>
            ))}
          </div>

          {loading ? (
            <LoadingState title="Depo hazırlık listesi yükleniyor" message="Fişler ve satır özetleri hazırlanıyor." />
          ) : (
            <div className="whf-list-wrap">
              <div className="whf-list-head" aria-hidden>
                <span>Belge No</span>
                <span>Tarih</span>
                <span>Cari</span>
                <span className="whf-th-rulo">
                  <span>Rulo</span>
                  <span className="whf-th-rulo-sub">/ adet</span>
                </span>
                <span>Durum</span>
                <span className="whf-list-head-actions">İşlem</span>
              </div>
              <div className="whf-list-body">
                {filteredWarehouseOrders.length === 0 ? (
                  <div className="whf-empty">Bu görünümde kayıt yok; filtreleri gevşetin.</div>
                ) : (
                  filteredWarehouseOrders.map((order) => {
                    const selected = selectedWarehouseOrder?.id === order.id;
                    return (
                      <button
                        key={order.id}
                        type="button"
                        className={`whf-list-row${selected ? " whf-list-row--selected" : ""}`}
                        onClick={() => setSelectedWarehouseOrderId(order.id)}
                      >
                        <span className="whf-cell-strong">{order.warehouseOrderNo}</span>
                        <span className="whf-cell-muted">{dateLabel(order.createdAt)}</span>
                        <span className="whf-cell-truncate">{customers.find((c) => c.id === order.customerId)?.name ?? order.customerId}</span>
                        <span className="whf-cell-rulo">
                          <span className="whf-cell-rulo-num">{orderTotalRollUnits(order)}</span>
                          <span className="whf-cell-rulo-sub">talep</span>
                        </span>
                        <span>
                          <span className={prepPillClass(order)}>{getWarehouseOrderPrepLabel(order)}</span>
                        </span>
                        <span className="whf-cell-actions">
                          <span
                            role="link"
                            tabIndex={0}
                            className="whf-link-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/depo/emirler/${order.id}`);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                e.stopPropagation();
                                router.push(`/depo/emirler/${order.id}`);
                              }
                            }}
                          >
                            <IconExternalLink size={14} aria-hidden />
                            Detay
                          </span>
                          <button
                            type="button"
                            className="whf-danger-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              pushToast("Silme işlemi bu ortamda kapalı; kayıt korunuyor (demo).");
                            }}
                          >
                            <IconTrash2 size={14} aria-hidden />
                            Sil
                          </button>
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        <aside className="whf-side" aria-label="Hazırlık radarı">
          <div className="whf-side-inner">
            <h2 className="whf-side-title">Hazırlık Radarı</h2>
            {!selectedWarehouseOrder ? (
              <p className="whf-side-muted">Listeden bir fiş seçin.</p>
            ) : (
              <>
                <section className="whf-block">
                  <h3 className="whf-block-h">Belge özeti</h3>
                  <dl className="whf-dl">
                    <div>
                      <dt>Belge No</dt>
                      <dd>{selectedWarehouseOrder.warehouseOrderNo}</dd>
                    </div>
                    <div>
                      <dt>Sipariş No</dt>
                      <dd>{selectedWarehouseOrder.orderNo}</dd>
                    </div>
                    <div>
                      <dt>Cari</dt>
                      <dd>{selectedCustomer?.name ?? selectedWarehouseOrder.customerId}</dd>
                    </div>
                    <div>
                      <dt>Durum</dt>
                      <dd>
                        <span className={prepPillClass(selectedWarehouseOrder)}>{getWarehouseOrderPrepLabel(selectedWarehouseOrder)}</span>
                      </dd>
                    </div>
                  </dl>
                </section>

                <section className="whf-block">
                  <h3 className="whf-block-h">Hazırlık özeti</h3>
                  <dl className="whf-dl">
                    <div>
                      <dt>Toplam rulo/adet</dt>
                      <dd>{orderTotalRollUnits(selectedWarehouseOrder)}</dd>
                    </div>
                    <div>
                      <dt>Hazırlanan</dt>
                      <dd>{orderPreparedTotal(selectedWarehouseOrder)}</dd>
                    </div>
                    <div>
                      <dt>Eksik (açık)</dt>
                      <dd>{orderShortageTotal(selectedWarehouseOrder)}</dd>
                    </div>
                  </dl>
                </section>

                <section className="whf-block">
                  <h3 className="whf-block-h">Sonraki adım</h3>
                  <p className="whf-block-text">{nextStepCopy(selectedWarehouseOrder)}</p>
                  {pickingSubnote(selectedWarehouseOrder) ? <p className="whf-block-sub">{pickingSubnote(selectedWarehouseOrder)}</p> : null}
                </section>

                <section className="whf-block">
                  <h3 className="whf-block-h">Hızlı aksiyonlar</h3>
                  <div className="whf-quick-actions">
                    <button type="button" className="whf-quick-btn" onClick={() => router.push(`/depo/emirler/${selectedWarehouseOrder.id}`)}>
                      <IconArrowRightCircle size={16} aria-hidden />
                      Fişi aç
                    </button>
                    <button type="button" className="whf-quick-btn" onClick={() => fireDemo("Toplama listesi bu fiş için hazırlanacak (demo).")}>
                      <IconClipboardList size={16} aria-hidden />
                      Toplama listesi
                    </button>
                    <button type="button" className="whf-quick-btn" onClick={() => router.push("/hizli-islem/satis-masasi")}>
                      <IconTruck size={16} aria-hidden />
                      Hızlı işlemde teslim et
                    </button>
                    <button type="button" className="whf-quick-btn" onClick={() => router.push("/archive")}>
                      <IconArchive size={16} aria-hidden />
                      Arşiv kayıtları
                    </button>
                  </div>
                  <p className="whf-footnote">Hazırlandı durumundaki fişler Ürün Teslimi işleminde otomatik çağrılır.</p>
                </section>

                <section className="whf-block whf-block--soft">
                  <h3 className="whf-block-h">İş akışı</h3>
                  <p className="whf-block-text">
                    Sipariş kendi stoğundan karşılanacaksa Depo Hazırlık Belgesi oluşur. Hazırlandı denince teslim aşaması açılır; teslim sonrası belgeler arşivlenir.
                  </p>
                </section>
              </>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

export function WarehouseOrderDetailPage({ warehouseOrderId }: { warehouseOrderId?: string }) {
  const router = useRouter();
  const { pushToast } = useToast();
  const [warehouseOrder, setWarehouseOrder] = useState<WarehouseOrder | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [shortagePanelOpen, setShortagePanelOpen] = useState(false);
  const [prepDoneDemo, setPrepDoneDemo] = useState(false);

  useEffect(() => {
    let mounted = true;
    getWarehouseOrderDetail(warehouseOrderId)
      .then((result) => {
        if (mounted) {
          setWarehouseOrder(result.warehouseOrder);
          setCustomers(result.customers);
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [warehouseOrderId]);

  const customer = useMemo(() => customers.find((item) => item.id === warehouseOrder?.customerId) ?? null, [customers, warehouseOrder?.customerId]);
  const shortageLines = useMemo(() => warehouseOrder?.lines.filter((line) => lineShortage(line) > 0) ?? [], [warehouseOrder]);

  const handlePrint = useCallback(() => {
    if (typeof window === "undefined") return;
    window.print();
  }, []);

  if (loading) {
    return (
      <div className="whf-page whf-page--detail">
        <LoadingState title="Depo Hazırlık Fişi yükleniyor" message="Satır, raf ve durum bilgileri hazırlanıyor." />
      </div>
    );
  }

  if (!warehouseOrder) {
    return (
      <div className="whf-page whf-page--detail">
        <div className="whf-state">
          <h2>Fiş bulunamadı</h2>
          <p>Seçilen Depo Hazırlık fişi bulunamadı.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="whf-page whf-page--detail" data-page="depo-hazirlik-detay-reference">
      <div className="whf-layout">
        <div className="whf-detail-main">
          <header>
            <button type="button" className="whf-back" onClick={() => router.push("/depo")}>
              <IconArrowLeft size={18} aria-hidden />
              Depo Hazırlık
            </button>
            <div className="whf-detail-heading">
              <div>
                <p className="whf-eyebrow">Depo Hazırlık Belgesi</p>
                <h1 className="whf-detail-title">Depo Hazırlık Fişi</h1>
                <p className="whf-detail-lead">
                  Sipariş kendi stoğundan karşılanacaksa bu belge oluşur. <strong>Hazırlandı</strong> denince teslim aşaması açılır.
                </p>
              </div>
              <span className={prepPillClass(warehouseOrder)}>{getWarehouseOrderPrepLabel(warehouseOrder)}</span>
            </div>
          </header>

          <section className="whf-doc-card" aria-label="Fiş üst bilgisi">
            <div className="whf-doc-grid">
              <div>
                <span className="whf-doc-k">Belge No</span>
                <span className="whf-doc-v">{warehouseOrder.warehouseOrderNo}</span>
              </div>
              <div>
                <span className="whf-doc-k">Sipariş No</span>
                <span className="whf-doc-v">{warehouseOrder.orderNo}</span>
              </div>
              <div>
                <span className="whf-doc-k">Tarih</span>
                <span className="whf-doc-v">{dateLabel(warehouseOrder.createdAt)}</span>
              </div>
              <div>
                <span className="whf-doc-k">Cari</span>
                <span className="whf-doc-v">{customer?.name ?? warehouseOrder.customerId}</span>
              </div>
              <div>
                <span className="whf-doc-k">Depo görevlisi</span>
                <span className="whf-doc-v">{warehouseOrder.assignedTo ?? "—"}</span>
              </div>
              <div>
                <span className="whf-doc-k">Durum (sistem)</span>
                <span className="whf-doc-v">{getWarehouseOrderStatusLabel(warehouseOrder.status)}</span>
              </div>
              <div className="whf-doc-grid-wide">
                <span className="whf-doc-k">Not</span>
                <span className="whf-doc-v">{warehouseOrder.note ?? "—"}</span>
              </div>
            </div>
          </section>

          <section className="whf-lines-card" aria-label="Ürün satırları">
            <h2 className="whf-lines-title">Ürün satırları</h2>
            <div className="whf-lines-scroll">
              <table className="whf-lines-table">
                <thead>
                  <tr>
                    <th>Ürün kodu</th>
                    <th>Ürün adı</th>
                    <th>Depo</th>
                    <th>Raf / lokasyon</th>
                    <th>İstenen</th>
                    <th>Hazırlanan</th>
                    <th>Eksik</th>
                    <th>Not / durum</th>
                  </tr>
                </thead>
                <tbody>
                  {warehouseOrder.lines.map((line) => (
                    <tr key={line.id}>
                      <td>{line.productCode}</td>
                      <td>{line.productName}</td>
                      <td>{line.warehouseName}</td>
                      <td>
                        {line.rackNo ?? "—"} / {line.locationCode ?? "—"}
                      </td>
                      <td>{line.requestedQuantity}</td>
                      <td>{line.preparedQuantity}</td>
                      <td>{lineShortage(line)}</td>
                      <td>{lineNote(line)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {shortagePanelOpen ? (
            <section className="whf-shortage-panel" aria-live="polite">
              <h3 className="whf-block-h">Eksik ürün özeti</h3>
              {shortageLines.length === 0 ? (
                <p className="whf-side-muted">Bu fişte satır bazında eksik görünmüyor.</p>
              ) : (
                <ul className="whf-shortage-list">
                  {shortageLines.map((line) => (
                    <li key={line.id}>
                      <strong>{line.productCode}</strong> — {lineShortage(line)} adet açık.
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ) : null}

          <p className="whf-print-hint">PDF arşiv motoru bağlanana kadar fiş yazdırma tarayıcı üzerinden yapılır.</p>

          <footer className="whf-detail-footer">
            <button
              type="button"
              className="whf-footer-btn whf-footer-btn--primary"
              disabled={prepDoneDemo}
              onClick={() => {
                pushToast("Hazırlandı işareti demo; kalıcı kayıt yok.");
                setPrepDoneDemo(true);
              }}
            >
              <IconCheckCircle size={18} aria-hidden />
              Hazırlandı
            </button>
            <button
              type="button"
              className="whf-footer-btn whf-footer-btn--warn"
              onClick={() => {
                setShortagePanelOpen(true);
                pushToast("Eksik satırlar panelde listelenir (demo).");
              }}
            >
              <IconXCircle size={18} aria-hidden />
              Eksik ürün
            </button>
            <button type="button" className="whf-footer-btn whf-footer-btn--outline" onClick={() => pushToast("Düzenleme backend onayı ile açılacak (demo).")}>
              <IconEdit3 size={18} aria-hidden />
              Düzenle
            </button>
            <button type="button" className="whf-footer-btn" title="Depo hazırlık fişini yazdır" onClick={handlePrint}>
              <IconPrinter size={18} aria-hidden />
              Belgeyi Yazdır
            </button>
          </footer>
        </div>

        <aside className="whf-side" aria-label="Fiş asistanı">
          <div className="whf-side-inner">
            <h2 className="whf-side-title">Fiş asistanı</h2>

            <section className="whf-block">
              <h3 className="whf-block-h">Hazırlık durumu</h3>
              <p className="whf-block-text">
                Toplam <strong>{orderTotalRollUnits(warehouseOrder)}</strong> rulo/adet; hazırlanan <strong>{orderPreparedTotal(warehouseOrder)}</strong>.
              </p>
            </section>

            <section className="whf-block">
              <h3 className="whf-block-h">Eksik ürünler</h3>
              {shortageLines.length === 0 ? (
                <p className="whf-side-muted">Satır bazında eksik yok.</p>
              ) : (
                <ul className="whf-bullet-list">
                  {shortageLines.map((line) => (
                    <li key={line.id}>
                      {line.productCode}: {lineShortage(line)} adet
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="whf-block">
              <h3 className="whf-block-h">Teslim etkisi</h3>
              <p className="whf-block-text">Hazırlandı durumundaki fişler Ürün Teslimi sırasında seçilebilir.</p>
              <Link href="/hizli-islem/satis-masasi" className="whf-inline-link">
                <IconTruck size={16} aria-hidden />
                Hızlı İşlem — Ürün Teslimi
                <IconExternalLink size={14} aria-hidden />
              </Link>
            </section>

            <section className="whf-block">
              <h3 className="whf-block-h">Belge / arşiv</h3>
              <div className="whf-archive-actions">
                <button type="button" className="whf-quick-btn" onClick={handlePrint}>
                  <IconPrinter size={16} aria-hidden />
                  Belgeyi yazdır
                </button>
                <button type="button" className="whf-quick-btn" onClick={() => router.push("/archive")}>
                  <IconArchive size={16} aria-hidden />
                  Arşivi aç
                </button>
              </div>
            </section>

            <section className="whf-block whf-block--soft">
              <h3 className="whf-block-h">
                <IconSparkles size={16} aria-hidden /> AI notu
              </h3>
              <p className="whf-block-text whf-ai-line">
                <IconBot size={16} aria-hidden />
                <span>AI yalnızca özet üretir; depo hazırlık insan onayıyla yapılır.</span>
              </p>
            </section>
          </div>
        </aside>
      </div>
    </div>
  );
}
