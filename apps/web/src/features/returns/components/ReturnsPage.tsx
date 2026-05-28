// @ts-nocheck
"use client";

import { EntityListPageTemplate, EmptyState, LoadingState, Pagination } from "@hallederiz/ui";
import type { Customer, Return } from "@hallederiz/types";
import { calculateReturnImpact } from "@hallederiz/domain";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { LucideIcon } from "../../../components/icons/lucide-icons";
import { dataSourceConfig } from "../../../lib/data-source";
import { useToast } from "../../../providers/toast-provider";
import { CommercialOperasyonDeskIntro } from "../../ui-inventory/components/CommercialOperasyonDeskIntro";
import { dateLabel } from "../utils";
import { getReturns } from "../queries/get-returns";
import { getReturnStatusLabel } from "../queries/return-mock-data";

function ReturnFilterBar() {
  return (
    <section className="hz-filter-card hz-returns-filter">
      <div className="hz-filter-grid">
        <label>
          MÃ¼ÅŸteri
          <input placeholder="Cari veya iade no ara" />
        </label>
        <label>
          Durum
          <select defaultValue="">
            <option value="">TÃ¼m durumlar</option>
            <option>Taslak</option>
            <option>OnaylandÄ±</option>
            <option>TamamlandÄ±</option>
          </select>
        </label>
        <label>
          BaÄŸlÄ± sipariÅŸ
          <input placeholder="SipariÅŸ no" />
        </label>
        <label>
          Tarih
          <select defaultValue="month">
            <option value="today">BugÃ¼n</option>
            <option value="week">Bu hafta</option>
            <option value="month">Bu ay</option>
          </select>
        </label>
      </div>
    </section>
  );
}

function ReturnPreviewPanel({
  returnRecord,
  customerName,
  onNavigate
}: {
  returnRecord: Return | null;
  customerName: string | null;
  onNavigate: (id: string) => void;
}) {
  const { pushToast } = useToast();

  if (!returnRecord) {
    return (
      <aside className="hz-commercial-entity-side hz-returns-side">
        <p className="hz-commercial-entity-side-empty">KayÄ±t seÃ§ilmedi.</p>
      </aside>
    );
  }

  const impact = calculateReturnImpact(returnRecord);

  return (
    <aside className="hz-commercial-entity-side hz-returns-side">
      <h3>Ä°ade Ã¶nizleme</h3>
      <ul className="hz-commercial-entity-side-list">
        <li>
          <strong>Ä°ade:</strong> {returnRecord.returnNo}
        </li>
        <li>
          <strong>SipariÅŸ:</strong> {returnRecord.orderNo ?? "â€”"}
        </li>
        <li>
          <strong>Cari:</strong> {customerName ?? "â€”"}
        </li>
        <li>
          <strong>Durum:</strong> {getReturnStatusLabel(returnRecord.status)}
        </li>
        <li>
          <strong>Stok etkisi:</strong> {impact.stockImpact} adet
        </li>
        <li>
          <strong>Onay:</strong> {impact.approvalRequired ? "Gerekli" : "Standart"}
        </li>
      </ul>
      <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
        <button
          type="button"
          className="hz-btn hz-btn-primary hz-toolbar-btn"
          style={{ flex: 1 }}
          onClick={() => onNavigate(returnRecord.id)}
        >
          Detay
        </button>
        <button
          type="button"
          className="hz-btn hz-btn-secondary hz-toolbar-btn"
          style={{ flex: 1 }}
          onClick={() => pushToast("Taslak hazÄ±rlandÄ±: iade onaya gÃ¶nderildi.")}
        >
          Onaya gÃ¶nder
        </button>
      </div>
    </aside>
  );
}

export function ReturnsPage() {
  const router = useRouter();
  const { pushToast } = useToast();
  const [returns, setReturns] = useState<Return[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 12;

  useEffect(() => {
    setLoadError(false);
    getReturns()
      .then((result) => {
        setReturns(result.returns);
        setCustomers(result.customers);
      })
      .catch(() => {
        setReturns([]);
        setCustomers([]);
        setLoadError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (loading || returns.length === 0) {
      if (!loading && returns.length === 0) setSelectedId(null);
      return;
    }
    if (!selectedId || !returns.some((r) => r.id === selectedId)) {
      setSelectedId(returns[0]?.id ?? null);
    }
  }, [loading, returns, selectedId]);

  const selected = useMemo(() => returns.find((r) => r.id === selectedId) ?? null, [returns, selectedId]);
  const selectedCustomerName = useMemo(
    () => (selected ? customers.find((c) => c.id === selected.customerId)?.name ?? null : null),
    [customers, selected]
  );
  const pagedReturns = useMemo(() => returns.slice((page - 1) * pageSize, page * pageSize), [returns, page]);

  const statusBadgeClass = (status: Return["status"]) => {
    if (status === "completed") return "hz-badge hz-badge-success";
    if (status === "cancelled") return "hz-badge hz-badge-danger";
    return "hz-badge hz-badge-warning";
  };

  return (
    <EntityListPageTemplate
      className="hz-commercial-entity-page hz-returns-page hz-iadeler-desk"
      previewSideWidth="detail"
      header={
        <>
          <CommercialOperasyonDeskIntro
            title="Ä°ade Operasyon MasasÄ±"
            subtitle="Ä°ade sÃ¼recini stok, onay ve belge etkisiyle tek ekranda yÃ¶netin."
            icon="rotate-ccw"
            actions={
              <>
                <Link href="/iadeler/yeni" className="hz-commercial-desk-btn hz-commercial-desk-btn--primary">
                  <LucideIcon name="plus" size={14} />
                  Yeni Ä°ade
                </Link>
                <Link href="/hizli-islem/iade" className="hz-commercial-desk-btn hz-commercial-desk-btn--secondary">
                  <LucideIcon name="zap" size={14} />
                  HÄ±zlÄ± Ä°ade
                </Link>
                <button
                  type="button"
                  className="hz-commercial-desk-btn hz-commercial-desk-btn--secondary"
                  onClick={() => pushToast("DÄ±ÅŸa aktarma backend onay akÄ±ÅŸÄ±na baÄŸlÄ±dÄ±r; demo modunda simÃ¼le edildi.")}
                >
                  <LucideIcon name="download" size={14} />
                  DÄ±ÅŸa Aktar
                </button>
              </>
            }
          />
          <div className="hz-commercial-entity-kpi-strip" aria-label="Ä°ade Ã¶zeti">
            <div className="hz-commercial-entity-kpi">
              <span className="hz-commercial-entity-kpi-label">KayÄ±t</span>
              <span className="hz-commercial-entity-kpi-value">{returns.length}</span>
            </div>
            <div className="hz-commercial-entity-kpi">
              <span className="hz-commercial-entity-kpi-label">Onay bekleyen</span>
              <span className="hz-commercial-entity-kpi-value">
                {returns.filter((item) => item.status === "draft" || item.status === "approved").length}
              </span>
            </div>
            <div className="hz-commercial-entity-kpi">
              <span className="hz-commercial-entity-kpi-label">Tamamlanan</span>
              <span className="hz-commercial-entity-kpi-value">
                {returns.filter((item) => item.status === "completed").length}
              </span>
            </div>
            <div className="hz-commercial-entity-kpi">
              <span className="hz-commercial-entity-kpi-label">Belge notu</span>
              <span className="hz-commercial-entity-kpi-value">{returns.length > 0 ? "Var" : "â€”"}</span>
            </div>
          </div>
          {dataSourceConfig.useDemoData ? (
            <p className="hz-commercial-entity-preview-band" role="status">
              Ã–rnek veri modu: liste kayÄ±tlarÄ± demo amaÃ§lÄ±dÄ±r; canlÄ± operasyon sonucu deÄŸildir.
            </p>
          ) : null}
        </>
      }
      filters={<ReturnFilterBar />}
      list={
        <div className="hz-commercial-entity-list-wrap">
          {loading ? (
            <LoadingState title="Ä°adeler yÃ¼kleniyor" message="Ä°ade etkileri ve belge durumlarÄ± hazÄ±rlanÄ±yor." />
          ) : loadError ? (
            <EmptyState title="Ä°ade listesi alÄ±namadÄ±" message="BaÄŸlantÄ± kurulamadÄ±. LÃ¼tfen tekrar deneyin." />
          ) : returns.length === 0 ? (
            <EmptyState title="Ä°ade bulunamadÄ±" message="KayÄ±t yok veya filtre sonucu boÅŸ." />
          ) : (
            <>
              <div className="hz-commercial-entity-table-head hz-returns-table-head" role="row">
                <span>Ä°ade no</span>
                <span>Cari</span>
                <span>SipariÅŸ</span>
                <span>Durum</span>
                <span>Tarih</span>
                <span>Etki</span>
                <span>AKSÄ°YON</span>
              </div>
              <div className="hz-commercial-entity-table-body">
                {pagedReturns.map((returnRecord) => {
                  const impact = calculateReturnImpact(returnRecord);
                  const customerName = customers.find((c) => c.id === returnRecord.customerId)?.name ?? "â€”";
                  return (
                    <div
                      key={returnRecord.id}
                      role="row"
                      className={`hz-commercial-entity-table-row hz-returns-table-row${selectedId === returnRecord.id ? " is-selected" : ""}`}
                      onClick={() => setSelectedId(returnRecord.id)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") setSelectedId(returnRecord.id);
                      }}
                      tabIndex={0}
                    >
                      <span>{returnRecord.returnNo}</span>
                      <span>{customerName}</span>
                      <span>{returnRecord.orderNo ?? "â€”"}</span>
                      <span>
                        <span className={statusBadgeClass(returnRecord.status)}>
                          {getReturnStatusLabel(returnRecord.status)}
                        </span>
                      </span>
                      <span>{dateLabel(returnRecord.createdAt)}</span>
                      <span>{impact.stockImpact} adet</span>
                      <span>
                        <button
                          type="button"
                          className="hz-commercial-entity-action-btn"
                          onClick={(event) => {
                            event.stopPropagation();
                            router.push(`/iadeler/${returnRecord.id}`);
                          }}
                        >
                          Ä°ncele
                        </button>
                      </span>
                    </div>
                  );
                })}
              </div>
              <Pagination totalItems={returns.length} pageSize={pageSize} currentPage={page} onPageChange={setPage} />
            </>
          )}
        </div>
      }
      preview={
        <ReturnPreviewPanel
          returnRecord={selected}
          customerName={selectedCustomerName}
          onNavigate={(id) => router.push(`/iadeler/${id}`)}
        />
      }
    />
  );
}

