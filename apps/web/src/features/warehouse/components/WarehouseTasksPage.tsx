// @ts-nocheck
"use client";

import { LoadingState } from "@hallederiz/ui";
import type { WarehouseOrder } from "@hallederiz/types";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  IconArchive,
  IconArrowRightCircle,
  IconBarChart3,
  IconClipboardList,
  IconExternalLink,
  IconListRows,
  IconPlus,
  IconRotateCcw,
  IconTrash2,
  IconTruck
} from "../../dashboard/components/dashboard-inline-icons";
import { useToast } from "../../../providers/toast-provider";
import type { WarehousePrepListTab, WarehouseTaskFilters } from "../schemas/warehouse-filter-schema";
import { useWarehouseTaskFilters } from "../hooks/use-warehouse-task-filters";
import { useWarehouseTasksData } from "../hooks/use-warehouse-tasks-data";
import { filterWarehouseOrders } from "../utils/filter-warehouse-tasks";
import {
  getPrepDisplayStatus,
  getWarehouseOrderPrepLabel,
  getWarehouseOrderPrepPillClass,
  orderHasShortage,
  orderPreparedTotal,
  orderShortageTotal,
  orderTotalRollUnits
} from "../utils/warehouse-prep-status";
import { dateLabel } from "../utils";

function isSameLocalDay(iso: string, ref: Date): boolean {
  const d = new Date(iso);
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth() && d.getDate() === ref.getDate();
}

function nextStepCopy(order: WarehouseOrder): string {
  const prep = getPrepDisplayStatus(order);
  if (prep === "beklemede") {
    return "Depo gÃ¶revlisi hazÄ±rlÄ±ÄŸÄ± tamamlayÄ±nca teslim bekleyen aÅŸamasÄ±na geÃ§er.";
  }
  if (prep === "hazirlandi") {
    return "HÄ±zlÄ± Ä°ÅŸlem > ÃœrÃ¼n Teslimi ekranÄ±nda teslim edilebilir.";
  }
  if (prep === "eksik") {
    return "Eksik Ã¼rÃ¼n iÃ§in satÄ±ÅŸ veya operasyon kontrolÃ¼ gerekir; tamamlanÄ±nca yeniden hazÄ±rlÄ±k baÅŸlatÄ±labilir.";
  }
  if (prep === "iptal") {
    return "Bu belge iptal edildi.";
  }
  if (prep === "teslim_edildi") {
    return "Teslim tamamlandÄ±; ÃœrÃ¼n Teslim FiÅŸi arÅŸivde yer alÄ±r.";
  }
  return "";
}

function pickingSubnote(order: WarehouseOrder): string | null {
  if (order.status !== "picking") return null;
  if (orderHasShortage(order)) {
    return "Toplama sÃ¼rÃ¼yor; hazÄ±rlanan adetler arttÄ±kÃ§a gÃ¼ncellenir. TÃ¼m satÄ±rlar tamamlanÄ±nca fiÅŸi HazÄ±rlandÄ± olarak iÅŸaretleyebilirsiniz.";
  }
  return "Toplama baÅŸladÄ±; satÄ±r adetleri tamamlandÄ±ysa fiÅŸi HazÄ±rlandÄ± olarak iÅŸaretleyebilirsiniz.";
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
    const teslimBekleyen = hazirlanan;
    const bugunHazirlanacak = kpiScope.filter((o) => {
      const prep = getPrepDisplayStatus(o);
      if (prep !== "beklemede" && prep !== "eksik") return false;
      return isSameLocalDay(o.createdAt, now) || isSameLocalDay(o.dueAt, now) || isSameLocalDay(o.updatedAt, now);
    }).length;
    const toplamRulo = kpiScope.reduce((sum, o) => sum + orderTotalRollUnits(o), 0);
    return { bekleyen, hazirlanan, eksik, bugunHazirlanacak, toplamRulo, teslimBekleyen };
  }, [kpiScope, now]);

  useEffect(() => {
    if (!selectedWarehouseOrderId && filteredWarehouseOrders[0]) {
      setSelectedWarehouseOrderId(filteredWarehouseOrders[0].id);
      return;
    }
    if (
      selectedWarehouseOrderId &&
      !filteredWarehouseOrders.some((warehouseOrder) => warehouseOrder.id === selectedWarehouseOrderId)
    ) {
      setSelectedWarehouseOrderId(filteredWarehouseOrders[0]?.id ?? null);
    }
  }, [filteredWarehouseOrders, selectedWarehouseOrderId]);

  const selectedWarehouseOrder = useMemo(
    () => filteredWarehouseOrders.find((warehouseOrder) => warehouseOrder.id === selectedWarehouseOrderId) ?? filteredWarehouseOrders[0] ?? null,
    [filteredWarehouseOrders, selectedWarehouseOrderId]
  );

  const selectedCustomer = useMemo(
    () => customers.find((customer) => customer.id === selectedWarehouseOrder?.customerId) ?? null,
    [customers, selectedWarehouseOrder?.customerId]
  );

  const setPrepTab = useCallback(
    (tab: WarehousePrepListTab) => {
      updateFilter("prepTab", tab);
      updateFilter("prepDisplayFilter", "all");
    },
    [updateFilter]
  );

  const fireDemo = useCallback(
    (msg: string) => {
      pushToast(msg);
    },
    [pushToast]
  );

  return (
    <div className="hz-warehouse-prep-page hz-depo-desk">
      <div className="hz-warehouse-prep-layout">
        <div className="hz-warehouse-prep-main">
          <header className="hz-warehouse-prep-topbar">
            <div className="hz-warehouse-prep-topbar-text">
              <h1 className="hz-warehouse-prep-topbar-title">Depo HazÄ±rlÄ±k Operasyon MasasÄ±</h1>
              <p className="hz-warehouse-prep-topbar-sub">
                SatÄ±lan Ã¼rÃ¼nlerin depo toplama, raf kontrolÃ¼ ve teslim Ã¶ncesi hazÄ±rlÄ±k sÃ¼recini yÃ¶netin.
              </p>
            </div>
            <div className="hz-warehouse-prep-topbar-actions">
              <button type="button" className="hz-warehouse-prep-toolbar-btn hz-warehouse-prep-toolbar-btn--outline" onClick={() => fireDemo("Toplama listesi PDF/Excel baÄŸlantÄ±sÄ± yakÄ±nda (demo).")}>
                <IconListRows size={16} aria-hidden />
                Toplama Listesi
              </button>
              <button type="button" className="hz-warehouse-prep-toolbar-btn hz-warehouse-prep-toolbar-btn--outline" onClick={() => fireDemo("HazÄ±rlÄ±k raporu oluÅŸturma yakÄ±nda (demo).")}>
                <IconBarChart3 size={16} aria-hidden />
                HazÄ±rlÄ±k Raporu
              </button>
              <button
                type="button"
                className="hz-warehouse-prep-toolbar-btn hz-warehouse-prep-toolbar-btn--primary"
                disabled={manualDemoDone}
                onClick={() => {
                  pushToast("Manuel fiÅŸ oluÅŸturma bu sÃ¼rÃ¼mde demo; backend iÅŸlemi baÅŸlatÄ±lmadÄ±.");
                  setManualDemoDone(true);
                }}
              >
                <IconPlus size={16} aria-hidden />
                Yeni Manuel FiÅŸ
              </button>
            </div>
          </header>

          <div className="hz-warehouse-prep-kpi-strip" aria-label="Depo hazÄ±rlÄ±k KPI">
            <div className="hz-warehouse-prep-kpi hz-warehouse-prep-kpi--warn">
              <span className="hz-warehouse-prep-kpi-label">Bekleyen</span>
              <span className="hz-warehouse-prep-kpi-value">{kpis.bekleyen}</span>
            </div>
            <div className="hz-warehouse-prep-kpi hz-warehouse-prep-kpi--ok">
              <span className="hz-warehouse-prep-kpi-label">HazÄ±rlanan</span>
              <span className="hz-warehouse-prep-kpi-value">{kpis.hazirlanan}</span>
            </div>
            <div className="hz-warehouse-prep-kpi hz-warehouse-prep-kpi--danger">
              <span className="hz-warehouse-prep-kpi-label">Eksik</span>
              <span className="hz-warehouse-prep-kpi-value">{kpis.eksik}</span>
            </div>
            <div className="hz-warehouse-prep-kpi hz-warehouse-prep-kpi--info">
              <span className="hz-warehouse-prep-kpi-label">BugÃ¼n hazÄ±rlanacak</span>
              <span className="hz-warehouse-prep-kpi-value">{kpis.bugunHazirlanacak}</span>
            </div>
            <div className="hz-warehouse-prep-kpi hz-warehouse-prep-kpi--neutral">
              <span className="hz-warehouse-prep-kpi-label-stack">
                <span className="hz-warehouse-prep-kpi-label-line">Toplam</span>
                <span className="hz-warehouse-prep-kpi-label-sub">Rulo/adet</span>
              </span>
              <span className="hz-warehouse-prep-kpi-value">{kpis.toplamRulo}</span>
            </div>
            <div className="hz-warehouse-prep-kpi hz-warehouse-prep-kpi--primary">
              <span className="hz-warehouse-prep-kpi-label">Teslim bekleyen</span>
              <span className="hz-warehouse-prep-kpi-value">{kpis.teslimBekleyen}</span>
            </div>
          </div>

          <div className="hz-warehouse-prep-filter-row" role="search">
            <input
              className="hz-warehouse-prep-filter-input hz-warehouse-prep-filter-input--grow"
              value={filters.documentQuery}
              onChange={(e) => updateFilter("documentQuery", e.target.value)}
              placeholder="Belge no, sipariÅŸ no veya cari araâ€¦"
              aria-label="Belge veya cari ara"
            />
            <label className="hz-warehouse-prep-filter-field">
              <span className="hz-warehouse-prep-filter-label">Durum</span>
              <select
                className="hz-warehouse-prep-filter-select"
                value={filters.prepDisplayFilter}
                onChange={(e) => updateFilter("prepDisplayFilter", e.target.value as WarehouseTaskFilters["prepDisplayFilter"])}
              >
                <option value="all">TÃ¼mÃ¼</option>
                <option value="beklemede">Beklemede</option>
                <option value="hazirlandi">HazÄ±rlandÄ±</option>
                <option value="eksik">Eksik</option>
              </select>
            </label>
            <label className="hz-warehouse-prep-filter-field">
              <span className="hz-warehouse-prep-filter-label">Tarih</span>
              <select
                className="hz-warehouse-prep-filter-select"
                value={filters.datePreset}
                onChange={(e) => updateFilter("datePreset", e.target.value as WarehouseTaskFilters["datePreset"])}
              >
                <option value="all">TÃ¼mÃ¼</option>
                <option value="today">BugÃ¼n</option>
              </select>
            </label>
            <input
              className="hz-warehouse-prep-filter-input"
              value={filters.assignee}
              onChange={(e) => updateFilter("assignee", e.target.value)}
              placeholder="Depo gÃ¶revlisi"
              aria-label="Depo gÃ¶revlisi"
            />
            <button type="button" className="hz-warehouse-prep-icon-btn" aria-label="Filtreleri sÄ±fÄ±rla" onClick={resetFilters}>
              <IconRotateCcw size={16} aria-hidden />
            </button>
          </div>

          <div className="hz-warehouse-prep-chip-row" role="tablist" aria-label="Liste gÃ¶rÃ¼nÃ¼mÃ¼">
            {(
              [
                ["bekleyenler", "Bekleyenler"],
                ["hazirlananlar", "HazÄ±rlananlar"],
                ["eksikler", "Eksikler"],
                ["tumu", "TÃ¼m kayÄ±tlar"]
              ] as const
            ).map(([tab, label]) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={filters.prepTab === tab}
                className={`hz-warehouse-prep-chip${filters.prepTab === tab ? " hz-warehouse-prep-chip--active" : ""}`}
                onClick={() => setPrepTab(tab)}
              >
                {label}
              </button>
            ))}
          </div>

          {loading ? (
            <LoadingState title="Depo hazÄ±rlÄ±k listesi yÃ¼kleniyor" message="FiÅŸler ve satÄ±r Ã¶zetleri hazÄ±rlanÄ±yor." />
          ) : (
            <div className="hz-warehouse-prep-list-wrap">
              <div className="hz-warehouse-prep-list-header" aria-hidden>
                <span>Belge No</span>
                <span>Tarih</span>
                <span>Cari</span>
                <span className="hz-warehouse-prep-th-rulo">
                  <span className="hz-warehouse-prep-th-rulo-main">Rulo</span>
                  <span className="hz-warehouse-prep-th-rulo-sub">/ adet</span>
                </span>
                <span>Durum</span>
                <span className="hz-warehouse-prep-list-header--actions">Ä°ÅŸlem</span>
              </div>
              <div className="hz-warehouse-prep-list-body">
                {filteredWarehouseOrders.length === 0 ? (
                  <div className="hz-warehouse-prep-empty">Bu gÃ¶rÃ¼nÃ¼mde kayÄ±t yok; filtreleri gevÅŸetin.</div>
                ) : (
                  filteredWarehouseOrders.map((order) => {
                    const selected = selectedWarehouseOrder?.id === order.id;
                    return (
                      <button
                        key={order.id}
                        type="button"
                        className={`hz-warehouse-prep-row${selected ? " hz-warehouse-prep-row--selected" : ""}`}
                        onClick={() => setSelectedWarehouseOrderId(order.id)}
                      >
                        <span className="hz-warehouse-prep-cell hz-warehouse-prep-cell--strong">{order.warehouseOrderNo}</span>
                        <span className="hz-warehouse-prep-cell hz-warehouse-prep-cell--muted">{dateLabel(order.createdAt)}</span>
                        <span className="hz-warehouse-prep-cell hz-warehouse-prep-cell--truncate">{customers.find((c) => c.id === order.customerId)?.name ?? order.customerId}</span>
                        <span className="hz-warehouse-prep-cell hz-warehouse-prep-cell-rulo">
                          <span className="hz-warehouse-prep-cell-rulo-num">{orderTotalRollUnits(order)}</span>
                          <span className="hz-warehouse-prep-cell-rulo-sub">talep</span>
                        </span>
                        <span className="hz-warehouse-prep-cell">
                          <span className={getWarehouseOrderPrepPillClass(order)}>{getWarehouseOrderPrepLabel(order)}</span>
                        </span>
                        <span className="hz-warehouse-prep-cell hz-warehouse-prep-cell--actions">
                          <span
                            role="link"
                            tabIndex={0}
                            className="hz-warehouse-prep-link-btn"
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
                            className="hz-warehouse-prep-danger-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              pushToast("Silme iÅŸlemi bu ortamda kapalÄ±; kayÄ±t korunuyor (demo).");
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

        <aside className="hz-warehouse-prep-side" aria-label="HazÄ±rlÄ±k radarÄ±">
          <div className="hz-warehouse-prep-side-inner">
            <h2 className="hz-warehouse-prep-side-title">HazÄ±rlÄ±k RadarÄ±</h2>
            {!selectedWarehouseOrder ? (
              <p className="hz-warehouse-prep-side-muted">Listeden bir fiÅŸ seÃ§in.</p>
            ) : (
              <>
                <section className="hz-warehouse-prep-radar-block">
                  <h3 className="hz-warehouse-prep-radar-h">Belge Ã¶zeti</h3>
                  <dl className="hz-warehouse-prep-dl">
                    <div>
                      <dt>Belge No</dt>
                      <dd>{selectedWarehouseOrder.warehouseOrderNo}</dd>
                    </div>
                    <div>
                      <dt>SipariÅŸ No</dt>
                      <dd>{selectedWarehouseOrder.orderNo}</dd>
                    </div>
                    <div>
                      <dt>Cari</dt>
                      <dd>{selectedCustomer?.name ?? selectedWarehouseOrder.customerId}</dd>
                    </div>
                    <div>
                      <dt>Durum</dt>
                      <dd>
                        <span className={getWarehouseOrderPrepPillClass(selectedWarehouseOrder)}>{getWarehouseOrderPrepLabel(selectedWarehouseOrder)}</span>
                      </dd>
                    </div>
                  </dl>
                </section>

                <section className="hz-warehouse-prep-radar-block">
                  <h3 className="hz-warehouse-prep-radar-h">HazÄ±rlÄ±k Ã¶zeti</h3>
                  <dl className="hz-warehouse-prep-dl">
                    <div>
                      <dt className="hz-warehouse-prep-dt-stack">
                        <span className="hz-warehouse-prep-dt-main">Toplam</span>
                        <span className="hz-warehouse-prep-dt-sub">Rulo / adet</span>
                      </dt>
                      <dd>{orderTotalRollUnits(selectedWarehouseOrder)}</dd>
                    </div>
                    <div>
                      <dt>HazÄ±rlanan</dt>
                      <dd>{orderPreparedTotal(selectedWarehouseOrder)}</dd>
                    </div>
                    <div>
                      <dt>Eksik (aÃ§Ä±k)</dt>
                      <dd>{orderShortageTotal(selectedWarehouseOrder)}</dd>
                    </div>
                  </dl>
                </section>

                <section className="hz-warehouse-prep-radar-block">
                  <h3 className="hz-warehouse-prep-radar-h">Depo / Raf</h3>
                  <p className="hz-warehouse-prep-side-muted">
                    Depo: <strong>{selectedWarehouseOrder.warehouseName}</strong>
                    <br />
                    Raflar: {selectedWarehouseOrder.lines.map((l) => l.rackNo ?? "â€”").join(", ")}
                  </p>
                </section>

                <section className="hz-warehouse-prep-radar-block">
                  <h3 className="hz-warehouse-prep-radar-h">Sonraki adÄ±m</h3>
                  <p className="hz-warehouse-prep-radar-text">{nextStepCopy(selectedWarehouseOrder)}</p>
                  {pickingSubnote(selectedWarehouseOrder) ? <p className="hz-warehouse-prep-radar-sub">{pickingSubnote(selectedWarehouseOrder)}</p> : null}
                </section>

                <section className="hz-warehouse-prep-radar-block">
                  <h3 className="hz-warehouse-prep-radar-h">HÄ±zlÄ± aksiyonlar</h3>
                  <div className="hz-warehouse-prep-quick-actions">
                    <button type="button" className="hz-warehouse-prep-quick-btn" onClick={() => router.push(`/depo/emirler/${selectedWarehouseOrder.id}`)}>
                      <IconArrowRightCircle size={16} aria-hidden />
                      FiÅŸi aÃ§
                    </button>
                    <button type="button" className="hz-warehouse-prep-quick-btn" onClick={() => fireDemo("Toplama listesi bu fiÅŸ iÃ§in hazÄ±rlanacak (demo).")}>
                      <IconClipboardList size={16} aria-hidden />
                      Toplama listesi
                    </button>
                    <button type="button" className="hz-warehouse-prep-quick-btn" onClick={() => router.push("/hizli-islem")}>
                      <IconTruck size={16} aria-hidden />
                      HÄ±zlÄ± iÅŸlemde teslim et
                    </button>
                    <button type="button" className="hz-warehouse-prep-quick-btn" onClick={() => router.push("/archive")}>
                      <IconArchive size={16} aria-hidden />
                      ArÅŸiv kayÄ±tlarÄ±
                    </button>
                  </div>
                  <p className="hz-warehouse-prep-radar-footnote">HazÄ±rlandÄ± durumundaki fiÅŸler ÃœrÃ¼n Teslimi iÅŸleminde otomatik Ã§aÄŸrÄ±lÄ±r.</p>
                </section>

                <section className="hz-warehouse-prep-radar-block hz-warehouse-prep-radar-block--soft">
                  <h3 className="hz-warehouse-prep-radar-h">Ä°ÅŸ akÄ±ÅŸÄ±</h3>
                  <p className="hz-warehouse-prep-radar-text">
                    SipariÅŸ kendi stoÄŸundan karÅŸÄ±lanacaksa Depo HazÄ±rlÄ±k Belgesi oluÅŸur. Depo gÃ¶revlisi Ã¼rÃ¼nleri rafa gÃ¶re hazÄ±rlar; HazÄ±rlandÄ± denince gÃ¶rev kapanÄ±r ve teslim
                    aÅŸamasÄ± aÃ§Ä±lÄ±r. MÃ¼ÅŸteriye Ã¼rÃ¼n verildiÄŸinde fiÅŸ listeden Ã§Ä±kar; Depo HazÄ±rlÄ±k Belgesi ve ÃœrÃ¼n Teslim FiÅŸi arÅŸivlenir.
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

