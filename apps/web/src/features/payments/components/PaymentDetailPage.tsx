"use client";

import {
  EmptyState,
  EntityDetailLayout,
  FormPageShell,
  FormSectionCard,
  FormValidationSummary,
  LoadingState,
  PageHeader
} from "@hallederiz/ui";
import type { Customer, PaymentReceipt } from "@hallederiz/types";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useToast } from "../../../providers/toast-provider";
import { PaymentActionsBar } from "./PaymentActionsBar";
import { PaymentAllocationTable } from "./PaymentAllocationTable";
import { PaymentDocumentPanel } from "./PaymentDocumentPanel";
import { PaymentSummaryCards } from "./PaymentSummaryCards";
import { getPaymentDetail } from "../queries/get-payments";

export function PaymentDetailPage({ paymentId }: { paymentId?: string }) {
  const router = useRouter();
  const { pushToast } = useToast();
  const [payment, setPayment] = useState<PaymentReceipt | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [draftSaved, setDraftSaved] = useState(false);

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

  useEffect(() => {
    setDraftSaved(false);
  }, [paymentId]);

  const customer = useMemo(() => customers.find((item) => item.id === payment?.customerId) ?? null, [customers, payment?.customerId]);

  const newFormHints = useMemo(
    () =>
      !paymentId
        ? ["Örnek veri: taslak kaydet yalnızca arayüz demosudur; canlı tahsilat policy ve onay zincirinden geçer."]
        : [],
    [paymentId]
  );

  if (loading) {
    return <LoadingState title="Tahsilat yukleniyor" message="Fis, allocation ve belge baglantilari hazirlaniyor." />;
  }

  if (!payment) {
    return <EmptyState title="Tahsilat Bulunamadi" message="Secilen tahsilat kaydi bulunamadi." />;
  }

  return (
    <div className="hz-tahsilatlar-detail-page">
      <EntityDetailLayout
        summary={
          <>
            <PageHeader
              title={paymentId ? "Tahsilat detayı" : "Yeni tahsilat"}
              description="Tahsilat girişi, allocation dağıtımı ve belge paneli."
            />
            <PaymentSummaryCards payment={payment} />
            <PaymentActionsBar />
          </>
        }
        sections={
          <FormPageShell
            className="hz-tahsilatlar-form"
            stickyActions={
              !paymentId ? (
                <>
                  <button type="button" className="hz-btn hz-btn-secondary hz-toolbar-btn" onClick={() => router.push("/tahsilatlar")}>
                    Vazgeç
                  </button>
                  <button
                    type="button"
                    className="hz-btn hz-btn-primary hz-toolbar-btn"
                    disabled={draftSaved}
                    onClick={() => {
                      pushToast("Taslak kaydedildi (demo). Canlı ortamda policy ve onay sonrası oluşturulur.");
                      setDraftSaved(true);
                    }}
                  >
                    Taslak kaydet
                  </button>
                </>
              ) : undefined
            }
          >
            <FormValidationSummary
              variant="info"
              title="Bilgi"
              messages={newFormHints}
            />
            <FormSectionCard
              title="Tahsilat bilgileri"
              description="Fiş üst bilgileri; canlı doğrulama tenant kurallarına bağlıdır."
              helperText="Allocation satırları kayıt sonrası dağıtım ekranından yönetilir."
            >
              <div className="hz-form-field-grid">
                <label>
                  Müşteri
                  <input readOnly value={customer?.name ?? payment.customerId} />
                </label>
                <label>
                  Ödeme yöntemi
                  <select defaultValue={payment.method}>
                    <option value="transfer">Havale/EFT</option>
                    <option value="cash">Nakit</option>
                    <option value="card">Kart</option>
                    <option value="check">Çek</option>
                  </select>
                </label>
                <label>
                  Tutar
                  <input type="number" defaultValue={payment.amount} />
                </label>
                <label>
                  Referans no
                  <input defaultValue={payment.referenceNo ?? ""} />
                </label>
                <label>
                  Açıklama
                  <input defaultValue={payment.description ?? ""} />
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
