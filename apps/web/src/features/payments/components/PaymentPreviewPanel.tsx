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
  return `â‚º${amount.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function statusToneClass(status: PaymentReceipt["status"]): string {
  if (status === "allocated") return "hz-tahsilatlar-badge hz-tahsilatlar-badge--success";
  if (status === "partially_allocated") return "hz-tahsilatlar-badge hz-tahsilatlar-badge--warning";
  if (status === "confirmed") return "hz-tahsilatlar-badge hz-tahsilatlar-badge--info";
  if (status === "reversed") return "hz-tahsilatlar-badge hz-tahsilatlar-badge--danger";
  return "hz-tahsilatlar-badge hz-tahsilatlar-badge--muted";
}

function getNextStep(payment: PaymentReceipt): string {
  if (payment.status === "confirmed") return "Tahsilat eÅŸleÅŸmesi yapÄ±n ve belge tahsis edin.";
  if (payment.status === "partially_allocated") {
    const daysOverdue = getDaysOverdue(payment);
    if (daysOverdue > 5) return "MÃ¼ÅŸteri ile hatÄ±rlatma gÃ¶rÃ¼ÅŸmesi planla.";
    return "Kalan bakiye iÃ§in sipariÅŸ tahsisini tamamlayÄ±n.";
  }
  if (payment.status === "allocated") return "Tahsilat tamamlandÄ± â€” makbuz gÃ¶nderilmedi ise gÃ¶nderin.";
  if (payment.status === "reversed") return "Ters kayÄ±t iÅŸlemini kontrol edin ve dÃ¼zeltme yapÄ±n.";
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
      <aside className="hz-tahsilatlar-preview hz-tahsilatlar-card" aria-label="Tahsilat baÄŸlamÄ±">
        <div className="hz-tahsilatlar-preview__empty">
          <LucideIcon name="circle-dollar-sign" size={28} />
          <p className="hz-tahsilatlar-preview__empty-title">Tahsilat seÃ§in</p>
          <p className="hz-tahsilatlar-preview__empty-desc">
            Listeden bir kayÄ±t seÃ§tiÄŸinizde baÄŸlam ve aksiyon paneli burada gÃ¶rÃ¼nÃ¼r.
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
    <aside className="hz-tahsilatlar-preview hz-tahsilatlar-card" aria-label="Tahsilat baÄŸlamÄ±">
      {/* Header */}
      <header className="hz-tahsilatlar-preview__header">
        <div className="hz-tahsilatlar-preview__head-top">
          <div className="hz-tahsilatlar-preview__eyebrow">Tahsilat BaÄŸlamÄ±</div>
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
                Vadesi geÃ§en: {daysOverdue} gÃ¼n
              </p>
              {lastReminderDate && (
                <p className="hz-tahsilatlar-preview-section__line">
                  Son hatÄ±rlatma: {lastReminderDate}
                </p>
              )}
            </>
          ) : (
            <p className="hz-tahsilatlar-preview-section__line">Vade aÅŸÄ±mÄ± yok</p>
          )}
        </section>

        {/* BaÄŸlÄ± Belgeler */}
        <section className="hz-tahsilatlar-preview-section">
          <h3>
            <LucideIcon name="link-2" size={13} />
            BaÄŸlÄ± Belgeler
          </h3>
          {linkedOrder || linkedInvoice ? (
            <>
              {linkedOrder && (
                <div className="hz-tahsilatlar-preview-section__doc-row">
                  <span className="hz-tahsilatlar-preview-section__doc-type">SipariÅŸ</span>
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
            <p className="hz-tahsilatlar-preview-section__line">BaÄŸlÄ± belge yok â€” tahsis bekliyor</p>
          )}
        </section>

        {/* Ã–deme YÃ¶ntemi */}
        <section className="hz-tahsilatlar-preview-section">
          <h3>
            <LucideIcon name="credit-card" size={13} />
            Ã–deme YÃ¶ntemi
          </h3>
          <p className="hz-tahsilatlar-preview-section__line">
            {payment.method === "transfer" ? "Havale" : payment.method === "cash" ? "Nakit" : payment.method === "card" ? "Kredi KartÄ±" : payment.method === "check" ? "Ã‡ek" : "Karma"}
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

        {/* Sonraki AdÄ±m */}
        <section className="hz-tahsilatlar-preview-section">
          <h3>
            <LucideIcon name="flag" size={13} />
            Sonraki AdÄ±m
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
          {isApproved ? "Onaya GÃ¶nderildi" : "TahsilatÄ± Onayla"}
        </button>
        <button
          type="button"
          className="hz-tahsilatlar-button-secondary"
          onClick={onReminder}
        >
          <LucideIcon name="mail" size={14} />
          HatÄ±rlatma GÃ¶nder
        </button>
        <button
          type="button"
          className="hz-tahsilatlar-button-secondary"
          onClick={() => onOpenDetail(payment.id)}
        >
          <LucideIcon name="external-link" size={14} />
          DetayÄ± AÃ§
        </button>
      </div>
    </aside>
  );
}

