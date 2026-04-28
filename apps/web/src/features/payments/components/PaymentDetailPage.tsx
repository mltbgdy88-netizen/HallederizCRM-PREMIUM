"use client";

import { EmptyState, LoadingState, PageHeader, SplitContentLayout } from "@hallederiz/ui";
import type { Customer, PaymentReceipt } from "@hallederiz/types";
import { useEffect, useMemo, useState } from "react";
import { PaymentActionsBar } from "./PaymentActionsBar";
import { PaymentAllocationTable } from "./PaymentAllocationTable";
import { PaymentDocumentPanel } from "./PaymentDocumentPanel";
import { PaymentSummaryCards } from "./PaymentSummaryCards";
import { getPaymentDetail } from "../queries/get-payments";

export function PaymentDetailPage({ paymentId }: { paymentId?: string }) {
  const [payment, setPayment] = useState<PaymentReceipt | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getPaymentDetail(paymentId)
      .then((result) => {
        if (mounted) {
          setPayment(result.payment);
          setCustomers(result.customers);
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [paymentId]);

  const customer = useMemo(() => customers.find((item) => item.id === payment?.customerId) ?? null, [customers, payment?.customerId]);

  if (loading) {
    return <LoadingState title="Tahsilat yukleniyor" message="Fis, allocation ve belge baglantilari hazirlaniyor." />;
  }

  if (!payment) {
    return <EmptyState title="Tahsilat Bulunamadi" message="Secilen tahsilat kaydi bulunamadi." />;
  }

  return (
    <div className="hz-page-stack">
      <PageHeader
        title={paymentId ? "Tahsilat Detayi" : "Yeni Tahsilat"}
        description="Tahsilat girisi, allocation dagitimi ve belge paneli."
      />
      <PaymentSummaryCards payment={payment} />
      <PaymentActionsBar />
      <SplitContentLayout
        main={
          <div className="hz-page-stack">
            <section className="hz-content-card">
              <h3>Tahsilat Bilgileri</h3>
              <div className="hz-filter-grid hz-margin-top-sm">
                <label>Musteri<input readOnly value={customer?.name ?? payment.customerId} /></label>
                <label>Odeme Yontemi<select defaultValue={payment.method}><option value="transfer">Havale/EFT</option><option value="cash">Nakit</option><option value="card">Kart</option><option value="check">Cek</option></select></label>
                <label>Tutar<input type="number" defaultValue={payment.amount} /></label>
                <label>Referans No<input defaultValue={payment.referenceNo ?? ""} /></label>
                <label>Aciklama<input defaultValue={payment.description ?? ""} /></label>
              </div>
            </section>
            <PaymentAllocationTable allocations={payment.allocations} />
          </div>
        }
        side={<PaymentDocumentPanel payment={payment} />}
      />
    </div>
  );
}
