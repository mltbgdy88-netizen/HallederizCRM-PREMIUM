"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { LucideIcon } from "../../../components/icons/lucide-icons";
import { useToast } from "../../../providers/toast-provider";
import { usePaymentFilters } from "../hooks/use-payment-filters";
import { usePaymentsData } from "../hooks/use-payments-data";
import { PaymentFilterBar } from "./PaymentFilterBar";
import { PaymentPreviewPanel } from "./PaymentPreviewPanel";
import { PaymentTable } from "./PaymentTable";

const PAGE_SIZE = 10;

function buildKpiStats(payments: import("@hallederiz/types").PaymentReceipt[]) {
  const today = new Date("2026-05-26T00:00:00.000Z");
  const todayPayments = payments.filter((p) => {
    const d = new Date(p.receivedAt);
    return d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth() && d.getDate() === today.getDate();
  });
  const todayTotal = todayPayments.reduce((s, p) => s + p.amount, 0);

  const pendingPayments = payments.filter(
    (p) => p.status === "confirmed" || p.status === "partially_allocated"
  );
  const pendingTotal = pendingPayments.reduce((s, p) => {
    const alloc = p.allocations.reduce((a, b) => a + b.allocatedAmount, 0);
    return s + Math.max(p.amount - alloc, 0);
  }, 0);

  const overduePayments = pendingPayments.filter((p) => {
    const received = new Date(p.receivedAt);
    const diff = (today.getTime() - received.getTime()) / (1000 * 60 * 60 * 24);
    return diff > 5;
  });
  const overdueTotal = overduePayments.reduce((s, p) => {
    const alloc = p.allocations.reduce((a, b) => a + b.allocatedAmount, 0);
    return s + Math.max(p.amount - alloc, 0);
  }, 0);

  const monthPayments = payments.filter((p) => {
    const d = new Date(p.receivedAt);
    return d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth();
  });
  const monthTotal = monthPayments.reduce((s, p) => s + p.amount, 0);

  const totalRemaining = payments.reduce((s, p) => {
    const alloc = p.allocations.reduce((a, b) => a + b.allocatedAmount, 0);
    return s + Math.max(p.amount - alloc, 0);
  }, 0);

  return {
    todayTotal,
    todayCount: todayPayments.length,
    pendingTotal,
    pendingCount: pendingPayments.length,
    overdueTotal,
    overdueCount: overduePayments.length,
    monthTotal,
    totalRemaining
  };
}

function fmtTry(amount: number): string {
  return `₺${amount.toLocaleString("tr-TR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function PaymentsPage() {
  const router = useRouter();
  const { pushToast } = useToast();
  const { filters, updateFilter, resetFilters } = usePaymentFilters();
  const { loading, payments, customers, filteredPayments, rows } = usePaymentsData(filters);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [approvedIds, setApprovedIds] = useState<Set<string>>(new Set());

  const pagedRows = useMemo(
    () => rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [page, rows]
  );

  const totalPages = Math.ceil(rows.length / PAGE_SIZE);

  const selectedPayment = useMemo(
    () => filteredPayments.find((p) => p.id === selectedPaymentId) ?? filteredPayments[0] ?? null,
    [filteredPayments, selectedPaymentId]
  );

  const selectedCustomer = useMemo(
    () => customers.find((c) => c.id === selectedPayment?.customerId) ?? null,
    [customers, selectedPayment?.customerId]
  );

  const kpi = useMemo(() => buildKpiStats(payments), [payments]);

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

  function handleMakbuz(paymentId: string) {
    pushToast(`Makbuz taslağı hazırlandı. (${paymentId}) Demo modunda gerçek PDF gönderimi yapılmaz.`);
  }

  function handleApprove(paymentId: string) {
    setApprovedIds((prev) => new Set([...prev, paymentId]));
    pushToast("Tahsilat onay zincirine gönderildi. Demo modunda gerçek onay işlemi yapılmaz.");
  }

  function handleReminder() {
    pushToast("Hatırlatma gönderme backend onay akışına bağlıdır; demo modunda simüle edildi.");
  }

  return (
    <main className="hz-tahsilatlar-page hz-tahsilatlar-desk" aria-live="polite">
      {/* Top section: intro + KPI */}
      <div className="hz-tahsilatlar-desk__top">
        {/* Intro header */}
        <div className="hz-tahsilatlar-intro">
          <div className="hz-tahsilatlar-intro__left">
            <div className="hz-tahsilatlar-intro__icon" aria-hidden="true">
              <LucideIcon name="circle-dollar-sign" size={22} />
            </div>
            <div>
              <h1 className="hz-tahsilatlar-intro__title">Tahsilat Operasyon Masası</h1>
              <p className="hz-tahsilatlar-intro__subtitle">
                Tahsilat akışını, bekleyen ödemeleri ve cari bakiyelerini tek ekranda yönetin
              </p>
            </div>
          </div>
          <div className="hz-tahsilatlar-intro__actions">
            <button
              type="button"
              className="hz-tahsilatlar-intro-btn hz-tahsilatlar-intro-btn--primary"
              onClick={() => router.push("/tahsilatlar/yeni")}
            >
              <LucideIcon name="plus" size={15} />
              Yeni Tahsilat
            </button>
            <button
              type="button"
              className="hz-tahsilatlar-intro-btn hz-tahsilatlar-intro-btn--secondary"
              onClick={() => router.push("/hizli-islem/tahsilat")}
            >
              <LucideIcon name="zap" size={14} />
              Hızlı Tahsilat
            </button>
            <button
              type="button"
              className="hz-tahsilatlar-intro-btn hz-tahsilatlar-intro-btn--secondary"
              onClick={() => pushToast("Dışa aktarma backend onay akışına bağlıdır; demo modunda simüle edildi.")}
            >
              <LucideIcon name="download" size={14} />
              Dışa Aktar
            </button>
          </div>
        </div>

        {/* 5 KPI cards */}
        <div className="hz-tahsilatlar-stats">
          <div className="hz-tahsilatlar-stat hz-tahsilatlar-stat--emerald">
            <div className="hz-tahsilatlar-stat__icon">
              <LucideIcon name="wallet" size={16} />
            </div>
            <div className="hz-tahsilatlar-stat__body">
              <p className="hz-tahsilatlar-stat__label">Bugün Tahsilat</p>
              <p className="hz-tahsilatlar-stat__value">{fmtTry(kpi.todayTotal)}</p>
              <p className="hz-tahsilatlar-stat__subtitle">({kpi.todayCount} işlem)</p>
            </div>
          </div>

          <div className="hz-tahsilatlar-stat hz-tahsilatlar-stat--info">
            <div className="hz-tahsilatlar-stat__icon">
              <LucideIcon name="clock" size={16} />
            </div>
            <div className="hz-tahsilatlar-stat__body">
              <p className="hz-tahsilatlar-stat__label">Bekleyen Tahsilat</p>
              <p className="hz-tahsilatlar-stat__value">{fmtTry(kpi.pendingTotal)}</p>
              <p className="hz-tahsilatlar-stat__subtitle">({kpi.pendingCount} kayıt)</p>
            </div>
          </div>

          <div className="hz-tahsilatlar-stat hz-tahsilatlar-stat--gold">
            <div className="hz-tahsilatlar-stat__icon">
              <LucideIcon name="alert-triangle" size={16} />
            </div>
            <div className="hz-tahsilatlar-stat__body">
              <p className="hz-tahsilatlar-stat__label">Vadesi Geçen</p>
              <p className="hz-tahsilatlar-stat__value hz-tahsilatlar-stat__value--gold">
                {fmtTry(kpi.overdueTotal)}
              </p>
              <p className="hz-tahsilatlar-stat__subtitle">({kpi.overdueCount} cari)</p>
            </div>
          </div>

          <div className="hz-tahsilatlar-stat hz-tahsilatlar-stat--emerald">
            <div className="hz-tahsilatlar-stat__icon">
              <LucideIcon name="calendar" size={16} />
            </div>
            <div className="hz-tahsilatlar-stat__body">
              <p className="hz-tahsilatlar-stat__label">Bu Ay Toplam</p>
              <p className="hz-tahsilatlar-stat__value">{fmtTry(kpi.monthTotal)}</p>
            </div>
          </div>

          <div className="hz-tahsilatlar-stat hz-tahsilatlar-stat--muted">
            <div className="hz-tahsilatlar-stat__icon">
              <LucideIcon name="users" size={16} />
            </div>
            <div className="hz-tahsilatlar-stat__body">
              <p className="hz-tahsilatlar-stat__label">Açık Bakiye</p>
              <p className="hz-tahsilatlar-stat__value">{fmtTry(kpi.totalRemaining)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main grid: list + preview */}
      <div className="hz-tahsilatlar-desk__grid">
        {/* List card */}
        <div className="hz-tahsilatlar-card hz-tahsilatlar-list">
          {/* Filter bar */}
          <div className="hz-tahsilatlar-toolbar">
            <PaymentFilterBar filters={filters} onFilterChange={updateFilter} onReset={resetFilters} />
          </div>

          {/* Table */}
          <div className="hz-tahsilatlar-table-wrap">
            {loading ? (
              <p className="hz-tahsilatlar-list__loading">Tahsilatlar yükleniyor…</p>
            ) : (
              <PaymentTable
                rows={pagedRows}
                selectedPaymentId={selectedPayment?.id ?? null}
                onSelectPayment={setSelectedPaymentId}
                onOpenPayment={(id) => router.push(`/tahsilatlar/${id}`)}
                onMakbuz={handleMakbuz}
                onReminder={(id) => handleReminder()}
              />
            )}
          </div>

          {/* Footer / pagination */}
          {!loading && rows.length > 0 && (
            <div className="hz-tahsilatlar-list__footer">
              <span>
                {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, rows.length)} / {rows.length} kayıt
              </span>
              <div className="hz-tahsilatlar-pagination">
                <button
                  type="button"
                  className="hz-tahsilatlar-page-btn"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  aria-label="Önceki sayfa"
                >
                  <LucideIcon name="chevron-left" size={13} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={`hz-tahsilatlar-page-btn${p === page ? " is-active" : ""}`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                ))}
                <button
                  type="button"
                  className="hz-tahsilatlar-page-btn"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  aria-label="Sonraki sayfa"
                >
                  <LucideIcon name="chevron-right" size={13} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right panel */}
        <PaymentPreviewPanel
          payment={selectedPayment}
          customer={selectedCustomer}
          approvedIds={approvedIds}
          onApprove={handleApprove}
          onReminder={handleReminder}
          onOpenDetail={(id) => router.push(`/tahsilatlar/${id}`)}
        />
      </div>
    </main>
  );
}
