// @ts-nocheck
import type { Customer, PaymentReceipt } from "@hallederiz/types";
import { LucideIcon } from "../../../components/icons/lucide-icons";
import {
  getDaysOverdue,
  getPaymentBankLabel,
  getPaymentStatusLabel,
  getPaymentSummary
} from "../queries/payment-mock-data";

function padTwo(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return `${padTwo(d.getDate())}.${padTwo(d.getMonth() + 1)}.${d.getFullYear()}`;
}

function fmtTry(amount: number): string {
  return `₺${amount.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function statusToneClass(status: PaymentReceipt["status"]): string {
  if (status === "allocated") return "hz-tahsilatlar-badge hz-tahsilatlar-badge--success";
  if (status === "partially_allocated") return "hz-tahsilatlar-badge hz-tahsilatlar-badge--warning";
  if (status === "confirmed") return "hz-tahsilatlar-badge hz-tahsilatlar-badge--info";
  if (status === "reversed") return "hz-tahsilatlar-badge hz-tahsilatlar-badge--danger";
  return "hz-tahsilatlar-badge hz-tahsilatlar-badge--muted";
}

function getNextStep(payment: PaymentReceipt): string {
  if (payment.status === "confirmed") return "Tahsilat eşleşmesi yapın ve belge tahsis edin.";
  if (payment.status === "partially_allocated") {
    const daysOverdue = getDaysOverdue(payment);
    if (daysOverdue > 5) return "Müşteri ile hatırlatma görüşmesi planla.";
    return "Kalan bakiye için sipariş tahsisini tamamlayın.";
  }
  if (payment.status === "allocated") return "Tahsilat tamamlandı — makbuz gönderilmedi ise gönderin.";
  if (payment.status === "reversed") return "Ters kayıt işlemini kontrol edin ve düzeltme yapın.";
  return "Durumu kontrol edin.";
}

type PreviewProps = {
  payment: PaymentReceipt | null;
  customer: Customer | null;
  approvedIds: Set<string>;
  onApprove: (id: string) => void;
  onReminder: () => void;
  onOpenDetail: (id: string) => void;
};

export function PaymentPreviewPanel({
  payment,
  customer,
  approvedIds,
  onApprove,
  onReminder,
  onOpenDetail
}: PreviewProps) {
  if (!payment) {
    return (
      <aside className="hz-tahsilatlar-preview hz-tahsilatlar-card" aria-label="Tahsilat bağlamı">
        <div className="hz-tahsilatlar-preview__empty">
          <LucideIcon name="circle-dollar-sign" size={28} />
          <p className="hz-tahsilatlar-preview__empty-title">Tahsilat seçin</p>
          <p className="hz-tahsilatlar-preview__empty-desc">
            Listeden bir kayıt seçtiğinizde bağlam ve aksiyon paneli burada görünür.
          </p>
        </div>
      </aside>
    );
  }

  const summary = getPaymentSummary(payment);
  const daysOverdue = getDaysOverdue(payment);
  const bankLabel = getPaymentBankLabel(payment.method, payment.referenceNo);
  const nextStep = getNextStep(payment);
  const isApproved = approvedIds.has(payment.id);

  const linkedOrder = payment.allocations.find((a) => a.targetType === "order");
  const linkedInvoice = payment.allocations.find((a) => a.targetType === "invoice");

  const lastReminderDate = daysOverdue > 0 ? fmtDate(payment.receivedAt) : null;

  return (
    <aside className="hz-tahsilatlar-preview hz-tahsilatlar-card" aria-label="Tahsilat bağlamı">
      {/* Header */}
      <header className="hz-tahsilatlar-preview__header">
        <div className="hz-tahsilatlar-preview__head-top">
          <div className="hz-tahsilatlar-preview__eyebrow">Tahsilat Bağlamı</div>
          <div className="hz-tahsilatlar-preview__meta-row">
            <span className="hz-tahsilatlar-preview__receipt-no">{payment.receiptNo}</span>
            <span className="hz-tahsilatlar-preview__date">{fmtDate(payment.receivedAt)}</span>
          </div>
          <div className="hz-tahsilatlar-preview__customer">
            <LucideIcon name="building-2" size={13} />
            {customer?.name ?? "Cari bilgisi bekleniyor"}
          </div>
        </div>
        <div className="hz-tahsilatlar-preview__amount-row">
          <span className="hz-tahsilatlar-preview__amount">{fmtTry(payment.amount)}</span>
          <span className={statusToneClass(payment.status)}>{getPaymentStatusLabel(payment.status)}</span>
        </div>
      </header>

      {/* Body: 4 cards */}
      <div className="hz-tahsilatlar-preview__body">
        {/* Vade Bilgileri */}
        <section className="hz-tahsilatlar-preview-section">
          <h3>
            <LucideIcon name="calendar" size={13} />
            Vade Bilgileri
          </h3>
          {daysOverdue > 0 ? (
            <>
              <p className="hz-tahsilatlar-preview-section__line hz-tahsilatlar-preview-section__line--warn">
                Vadesi geçen: {daysOverdue} gün
              </p>
              {lastReminderDate && (
                <p className="hz-tahsilatlar-preview-section__line">
                  Son hatırlatma: {lastReminderDate}
                </p>
              )}
            </>
          ) : (
            <p className="hz-tahsilatlar-preview-section__line">Vade aşımı yok</p>
          )}
        </section>

        {/* Bağlı Belgeler */}
        <section className="hz-tahsilatlar-preview-section">
          <h3>
            <LucideIcon name="link-2" size={13} />
            Bağlı Belgeler
          </h3>
          {linkedOrder || linkedInvoice ? (
            <>
              {linkedOrder && (
                <div className="hz-tahsilatlar-preview-section__doc-row">
                  <span className="hz-tahsilatlar-preview-section__doc-type">Sipariş</span>
                  <span className="hz-tahsilatlar-preview-section__doc-no">{linkedOrder.targetNo}</span>
                </div>
              )}
              {linkedInvoice && (
                <div className="hz-tahsilatlar-preview-section__doc-row">
                  <span className="hz-tahsilatlar-preview-section__doc-type">Fatura</span>
                  <span className="hz-tahsilatlar-preview-section__doc-no">{linkedInvoice.targetNo}</span>
                </div>
              )}
            </>
          ) : (
            <p className="hz-tahsilatlar-preview-section__line">Bağlı belge yok — tahsis bekliyor</p>
          )}
        </section>

        {/* Ödeme Yöntemi */}
        <section className="hz-tahsilatlar-preview-section">
          <h3>
            <LucideIcon name="credit-card" size={13} />
            Ödeme Yöntemi
          </h3>
          <p className="hz-tahsilatlar-preview-section__line">
            {payment.method === "transfer" ? "Havale" : payment.method === "cash" ? "Nakit" : payment.method === "card" ? "Kredi Kartı" : payment.method === "check" ? "Çek" : "Karma"}
          </p>
          <p className="hz-tahsilatlar-preview-section__line hz-tahsilatlar-preview-section__line--muted">
            {bankLabel}
          </p>
          {payment.referenceNo && (
            <p className="hz-tahsilatlar-preview-section__line hz-tahsilatlar-preview-section__line--muted">
              Ref: {payment.referenceNo}
            </p>
          )}
        </section>

        {/* Sonraki Adım */}
        <section className="hz-tahsilatlar-preview-section">
          <h3>
            <LucideIcon name="flag" size={13} />
            Sonraki Adım
          </h3>
          <p className="hz-tahsilatlar-preview-section__line">{nextStep}</p>
          {summary.remainingAmount > 0 && (
            <p className="hz-tahsilatlar-preview-section__line hz-tahsilatlar-preview-section__line--warn">
              Kalan: {fmtTry(summary.remainingAmount)}
            </p>
          )}
        </section>
      </div>

      {/* Action stack */}
      <div className="hz-tahsilatlar-action-stack">
        <button
          type="button"
          className="hz-tahsilatlar-button-primary"
          disabled={isApproved || payment.status === "allocated" || payment.status === "reversed"}
          onClick={() => onApprove(payment.id)}
        >
          <LucideIcon name="check-circle-2" size={14} />
          {isApproved ? "Onaya Gönderildi" : "Tahsilatı Onayla"}
        </button>
        <button
          type="button"
          className="hz-tahsilatlar-button-secondary"
          onClick={onReminder}
        >
          <LucideIcon name="mail" size={14} />
          Hatırlatma Gönder
        </button>
        <button
          type="button"
          className="hz-tahsilatlar-button-secondary"
          onClick={() => onOpenDetail(payment.id)}
        >
          <LucideIcon name="external-link" size={14} />
          Detayı Aç
        </button>
      </div>
    </aside>
  );
}


