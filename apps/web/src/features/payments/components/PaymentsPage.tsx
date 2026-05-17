"use client";

import { EntityListPageTemplate, LoadingState, MetricCard, Pagination, PrimaryActionToolbar } from "@hallederiz/ui";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { PaymentFilterBar } from "./PaymentFilterBar";
import { PaymentPreviewPanel } from "./PaymentPreviewPanel";
import { PaymentTable } from "./PaymentTable";
import { usePaymentFilters } from "../hooks/use-payment-filters";
import { usePaymentsData } from "../hooks/use-payments-data";

export function PaymentsPage() {
  const router = useRouter();
  const { filters, updateFilter, resetFilters } = usePaymentFilters();
  const { loading, customers, filteredPayments, rows } = usePaymentsData(filters);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const pagedRows = useMemo(() => rows.slice((page - 1) * pageSize, page * pageSize), [page, rows]);
  const selectedPayment = useMemo(
    () => filteredPayments.find((payment) => payment.id === selectedPaymentId) ?? filteredPayments[0] ?? null,
    [filteredPayments, selectedPaymentId]
  );
  const selectedCustomer = useMemo(
    () => customers.find((customer) => customer.id === selectedPayment?.customerId) ?? null,
    [customers, selectedPayment?.customerId]
  );

  useEffect(() => {
    setPage(1);
  }, [filters]);

  useEffect(() => {
    if (!filteredPayments.length) {
      setSelectedPaymentId(null);
      return;
    }
    const first = filteredPayments[0];
    if (!first) {
      setSelectedPaymentId(null);
      return;
    }
    if (!selectedPaymentId || !filteredPayments.some((p) => p.id === selectedPaymentId)) {
      setSelectedPaymentId(first.id);
    }
  }, [filteredPayments, selectedPaymentId]);

  return (
    <EntityListPageTemplate
      className="hz-tahsilatlar-page"
      header={
        <div className="hz-tahsilatlar-head">
          <div className="hz-tahsilatlar-head-text">
            <h1 className="hz-tahsilatlar-head-title">Tahsilatlar</h1>
            <p className="hz-tahsilatlar-head-sub">Tahsilat fişleri, allocation dağıtımları ve belge bağlantılarını yönetin.</p>
          </div>
          <section className="hz-metric-grid">
            <MetricCard title="Tahsilat" value={String(filteredPayments.length)} detail="Filtre kapsamında" tone="info" />
            <MetricCard
              title="Allocation bekleyen"
              value={String(filteredPayments.filter((payment) => payment.allocations.length === 0).length)}
              detail="Dağıtım gerekli"
              tone="warning"
            />
            <MetricCard
              title="Dağıtıldı"
              value={String(filteredPayments.filter((payment) => payment.status === "allocated").length)}
              detail="Tamamlanan"
              tone="success"
            />
            <MetricCard
              title="Ters kayıt"
              value={String(filteredPayments.filter((payment) => payment.status === "reversed").length)}
              detail="Kontrol"
              tone="danger"
            />
          </section>
          <PrimaryActionToolbar>
            <button type="button" className="hz-btn hz-btn-primary hz-toolbar-btn" onClick={() => router.push("/tahsilatlar/yeni")}>
              Yeni tahsilat
            </button>
            <button type="button" className="hz-btn hz-btn-secondary hz-toolbar-btn">
              Toplu doğrula
            </button>
            <button type="button" className="hz-btn hz-btn-secondary hz-toolbar-btn">
              PDF gönder
            </button>
          </PrimaryActionToolbar>
        </div>
      }
      filters={<PaymentFilterBar filters={filters} onFilterChange={updateFilter} onReset={resetFilters} />}
      list={
        loading ? (
          <LoadingState title="Tahsilatlar yükleniyor" message="Fişler, allocation satırları ve belge durumları hazırlanıyor." />
        ) : (
          <PaymentTable
            rows={pagedRows}
            selectedPaymentId={selectedPayment?.id ?? null}
            onSelectPayment={setSelectedPaymentId}
            onOpenPayment={(paymentId) => router.push(`/tahsilatlar/${paymentId}`)}
          />
        )
      }
      pagination={
        loading ? null : <Pagination totalItems={rows.length} pageSize={pageSize} currentPage={page} onPageChange={setPage} />
      }
      preview={
        <div className="hz-tahsilatlar-side">
          <PaymentPreviewPanel payment={selectedPayment} customer={selectedCustomer} />
        </div>
      }
    />
  );
}
