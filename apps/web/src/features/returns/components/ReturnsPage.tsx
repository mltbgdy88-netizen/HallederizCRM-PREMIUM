"use client";

import { EntityListPageTemplate, EmptyState, LoadingState, Pagination } from "@hallederiz/ui";
import type { Customer, Return } from "@hallederiz/types";
import { calculateReturnImpact } from "@hallederiz/domain";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { dataSourceConfig } from "../../../lib/data-source";
import { dateLabel } from "../utils";
import { getReturns } from "../queries/get-returns";
import { getReturnStatusLabel } from "../queries/return-mock-data";

function ReturnFilterBar() {
  return (
    <section className="hz-filter-card hz-returns-filter">
      <div className="hz-filter-grid">
        <label>
          Müşteri
          <input placeholder="Cari veya iade no ara" />
        </label>
        <label>
          Durum
          <select defaultValue="">
            <option value="">Tüm durumlar</option>
            <option>Taslak</option>
            <option>Onaylandı</option>
            <option>Tamamlandı</option>
          </select>
        </label>
        <label>
          Bağlı sipariş
          <input placeholder="Sipariş no" />
        </label>
        <label>
          Tarih
          <select defaultValue="month">
            <option value="today">Bugün</option>
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
  customerName
}: {
  returnRecord: Return | null;
  customerName: string | null;
}) {
  if (!returnRecord) {
    return (
      <aside className="hz-commercial-entity-side hz-returns-side">
        <p className="hz-commercial-entity-side-empty">Listeden bir iade seçin.</p>
      </aside>
    );
  }
  const impact = calculateReturnImpact(returnRecord);
  return (
    <aside className="hz-commercial-entity-side hz-returns-side">
      <h3>İade önizleme</h3>
      <ul className="hz-commercial-entity-side-list">
        <li>
          <strong>İade:</strong> {returnRecord.returnNo}
        </li>
        <li>
          <strong>Sipariş:</strong> {returnRecord.orderNo ?? "—"}
        </li>
        <li>
          <strong>Cari:</strong> {customerName ?? "—"}
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
    </aside>
  );
}

export function ReturnsPage() {
  const router = useRouter();
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
      className="hz-commercial-entity-page hz-returns-page"
      header={
        <>
          <header className="hz-commercial-entity-topbar">
            <div>
              <h1 className="hz-commercial-entity-topbar-title">İadeler</h1>
              <p className="hz-commercial-entity-topbar-sub">
                Sipariş veya teslim bağlantılı iade akışını stok ve belge etkisiyle yönetin.
              </p>
            </div>
          </header>
          <div className="hz-commercial-entity-kpi-strip" aria-label="İade özeti">
            <div className="hz-commercial-entity-kpi">
              <span className="hz-commercial-entity-kpi-label">Kayıt</span>
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
              <span className="hz-commercial-entity-kpi-value">{returns.length > 0 ? "Var" : "—"}</span>
            </div>
          </div>
          {dataSourceConfig.useDemoData ? (
            <p className="hz-commercial-entity-preview-band" role="status">
              Örnek veri modu: liste kayıtları demo amaçlıdır; canlı operasyon sonucu değildir.
            </p>
          ) : null}
        </>
      }
      filters={<ReturnFilterBar />}
      list={
        <div className="hz-commercial-entity-list-wrap">
          {loading ? (
            <LoadingState title="İadeler yükleniyor" message="İade etkileri ve belge durumları hazırlanıyor." />
          ) : loadError ? (
            <EmptyState title="İade listesi alınamadı" message="Bağlantı kurulamadı. Lütfen tekrar deneyin." />
          ) : returns.length === 0 ? (
            <EmptyState title="İade bulunamadı" message="Kayıt yok veya filtre sonucu boş." />
          ) : (
            <>
              <div className="hz-commercial-entity-table-head hz-returns-table-head" role="row">
                <span>İade no</span>
                <span>Cari</span>
                <span>Sipariş</span>
                <span>Durum</span>
                <span>Tarih</span>
                <span>Etki</span>
                <span>AKSİYON</span>
              </div>
              <div className="hz-commercial-entity-table-body">
                {pagedReturns.map((returnRecord) => {
                  const impact = calculateReturnImpact(returnRecord);
                  const customerName = customers.find((c) => c.id === returnRecord.customerId)?.name ?? "—";
                  return (
                    <div
                      key={returnRecord.id}
                      role="row"
                      className={`hz-commercial-entity-table-row hz-returns-table-row${selectedId === returnRecord.id ? " is-selected" : ""}`}
                      onClick={() => setSelectedId(returnRecord.id)}
                      tabIndex={0}
                    >
                      <span>{returnRecord.returnNo}</span>
                      <span>{customerName}</span>
                      <span>{returnRecord.orderNo ?? "—"}</span>
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
                          İncele
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
      preview={<ReturnPreviewPanel returnRecord={selected} customerName={selectedCustomerName} />}
    />
  );
}
