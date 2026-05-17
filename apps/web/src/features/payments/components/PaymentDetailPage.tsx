"use client";

import {
  EmptyState,
  EntityDetailLayout,
  FormPageShell,
  FormSectionCard,
  LoadingState,
  PageHeader
} from "@hallederiz/ui";
import type { Customer, PaymentReceipt } from "@hallederiz/types";
import { useEffect, useMemo, useState } from "react";
import { dataSourceConfig } from "../../../lib/data-source";
import { PaymentActionsBar } from "./PaymentActionsBar";
import { PaymentAllocationTable } from "./PaymentAllocationTable";
import { PaymentDocumentPanel } from "./PaymentDocumentPanel";
import { PaymentSummaryCards } from "./PaymentSummaryCards";
import { getPaymentDetail } from "../queries/get-payments";
import { getPaymentMethodLabel } from "../queries/payment-mock-data";

export function PaymentDetailPage({ paymentId }: { paymentId: string }) {
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
    return <LoadingState title="Tahsilat yükleniyor" message="Fiş, tahsis satırları ve belge bağlantıları hazırlanıyor." />;
  }

  if (!payment) {
    return <EmptyState title="Tahsilat bulunamadı" message="Seçilen tahsilat kaydı bulunamadı veya erişim kapsamında değil." />;
  }

  return (
    <div className="hz-tahsilatlar-detail-page">
      {dataSourceConfig.useDemoData ? (
        <p className="hz-payments-preview-band hz-payments-preview-band--detail" role="status">
          Örnek veri modu: bu kayıt demo amaçlıdır; kaydet, doğrula veya gönderim canlıda bağlı değildir.
        </p>
      ) : null}
      <EntityDetailLayout
        summary={
          <>
            <PageHeader title="Tahsilat detayı" description="Tahsilat girişi, tahsis dağıtımı ve belge paneli." />
            <PaymentSummaryCards payment={payment} />
            <PaymentActionsBar />
          </>
        }
        sections={
          <FormPageShell className="hz-tahsilatlar-form">
            <FormSectionCard
              title="Tahsilat bilgileri"
              description="Fiş üst bilgileri; canlı doğrulama kiracı kurallarına bağlıdır."
              helperText="Tahsis satırları kayıt sonrası dağıtım ekranından yönetilir."
            >
              <div className="hz-form-field-grid">
                <label>
                  Müşteri
                  <input readOnly value={customer?.name ?? payment.customerId} />
                </label>
                <label>
                  Ödeme yöntemi
                  <input readOnly value={getPaymentMethodLabel(payment.method)} />
                </label>
                <label>
                  Tutar
                  <input readOnly value={payment.amount} />
                </label>
                <label>
                  Referans no
                  <input readOnly value={payment.referenceNo ?? ""} />
                </label>
                <label>
                  Açıklama
                  <input readOnly value={payment.description ?? ""} />
                </label>
              </div>
            </FormSectionCard>
            <PaymentAllocationTable allocations={payment.allocations} />
          </FormPageShell>
        }
        sidebar={<PaymentDocumentPanel payment={payment} />}
      />
    </div>
  );
}
