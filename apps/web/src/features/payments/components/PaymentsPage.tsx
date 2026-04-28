"use client";

import { LoadingState, MetricCard, PageHeader, PrimaryActionToolbar, SplitContentLayout } from "@hallederiz/ui";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
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
  const selectedPayment = useMemo(
    () => filteredPayments.find((payment) => payment.id === selectedPaymentId) ?? filteredPayments[0] ?? null,
    [filteredPayments, selectedPaymentId]
  );
  const selectedCustomer = useMemo(
    () => customers.find((customer) => customer.id === selectedPayment?.customerId) ?? null,
    [customers, selectedPayment?.customerId]
  );

  return (
    <div className="hz-page-stack">
      <PageHeader title="Tahsilatlar" description="Tahsilat fisleri, allocation dagitimlari ve belge baglantilarini yonetin." />
      <section className="hz-metric-grid">
        <MetricCard title="Tahsilat" value={String(filteredPayments.length)} detail="Filtre kapsaminda" tone="info" />
        <MetricCard title="Allocation Bekleyen" value={String(filteredPayments.filter((payment) => payment.allocations.length === 0).length)} detail="Dagitim gerekli" tone="warning" />
        <MetricCard title="Dagitildi" value={String(filteredPayments.filter((payment) => payment.status === "allocated").length)} detail="Tamamlanan" tone="success" />
        <MetricCard title="Ters Kayit" value={String(filteredPayments.filter((payment) => payment.status === "reversed").length)} detail="Kontrol" tone="danger" />
      </section>
      <PrimaryActionToolbar>
        <button type="button" className="hz-btn hz-btn-primary hz-toolbar-btn" onClick={() => router.push("/tahsilatlar/yeni")}>Yeni Tahsilat</button>
        <button type="button" className="hz-btn hz-btn-secondary hz-toolbar-btn">Toplu Dogrula</button>
        <button type="button" className="hz-btn hz-btn-secondary hz-toolbar-btn">PDF Gonder</button>
      </PrimaryActionToolbar>
      <PaymentFilterBar filters={filters} onFilterChange={updateFilter} onReset={resetFilters} />
      <SplitContentLayout
        main={
          loading ? (
            <LoadingState title="Tahsilatlar yukleniyor" message="Fisler, allocation satirlari ve belge durumlari hazirlaniyor." />
          ) : (
            <PaymentTable
              rows={rows}
              selectedPaymentId={selectedPayment?.id ?? null}
              onSelectPayment={setSelectedPaymentId}
              onOpenPayment={(paymentId) => router.push(`/tahsilatlar/${paymentId}`)}
            />
          )
        }
        side={<PaymentPreviewPanel payment={selectedPayment} customer={selectedCustomer} />}
      />
    </div>
  );
}
