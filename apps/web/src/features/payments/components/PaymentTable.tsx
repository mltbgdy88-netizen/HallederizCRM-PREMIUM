import { LucideIcon } from "../../../components/icons/lucide-icons";
import type { PaymentRow } from "../mappers/map-payment-row";

function badgeClass(tone: PaymentRow["statusTone"]): string {
  if (tone === "success") return "hz-tahsilatlar-badge hz-tahsilatlar-badge--success";
  if (tone === "warning") return "hz-tahsilatlar-badge hz-tahsilatlar-badge--warning";
  if (tone === "danger") return "hz-tahsilatlar-badge hz-tahsilatlar-badge--danger";
  if (tone === "info") return "hz-tahsilatlar-badge hz-tahsilatlar-badge--info";
  return "hz-tahsilatlar-badge hz-tahsilatlar-badge--muted";
}

export function PaymentTable({
  rows,
  selectedPaymentId,
  onSelectPayment,
  onOpenPayment,
  onMakbuz,
  onReminder
}: {
  rows: PaymentRow[];
  selectedPaymentId: string | null;
  onSelectPayment: (paymentId: string) => void;
  onOpenPayment: (paymentId: string) => void;
  onMakbuz: (paymentId: string) => void;
  onReminder: (paymentId: string) => void;
}) {
  return (
    <table className="hz-tahsilatlar-table">
      <thead>
        <tr>
          <th>Tahsilat No</th>
          <th>Cari</th>
          <th>Tarih</th>
          <th>Yöntem</th>
          <th>Tutar</th>
          <th>Kalan Borç</th>
          <th>Durum</th>
          <th>Belge</th>
          <th>Aksiyon</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr
            key={row.paymentId}
            className={`hz-tahsilatlar-row${selectedPaymentId === row.paymentId ? " is-selected" : ""}`}
            onClick={() => onSelectPayment(row.paymentId)}
          >
            <td>
              <span className="hz-tahsilatlar-row__no">{row.receiptNo}</span>
            </td>
            <td>
              <span className="hz-tahsilatlar-row__cari">{row.customerName}</span>
            </td>
            <td>{row.dateOnlyLabel}</td>
            <td>{row.methodLabel}</td>
            <td>
              <span className="hz-tahsilatlar-row__amount">{row.amountLabel}</span>
            </td>
            <td>
              <span
                className={`hz-tahsilatlar-row__remaining${row.remainingBalanceLabel === "₺0,00" ? " is-zero" : ""}`}
              >
                {row.remainingBalanceLabel}
              </span>
            </td>
            <td>
              <span className={badgeClass(row.statusTone)}>{row.statusLabel}</span>
            </td>
            <td className="hz-tahsilatlar-td-center">
              {row.documentCountLabel !== "—" ? (
                <span className="hz-tahsilatlar-row__doccount">{row.documentCountLabel}</span>
              ) : (
                <span className="hz-tahsilatlar-row__doccount hz-tahsilatlar-row__doccount--none">—</span>
              )}
            </td>
            <td>
              <div className="hz-tahsilatlar-row__actions">
                <button
                  type="button"
                  className="hz-tahsilatlar-icon-action"
                  title="Detayı Aç"
                  aria-label="Detayı Aç"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenPayment(row.paymentId);
                  }}
                >
                  <LucideIcon name="eye" size={14} />
                </button>
                <button
                  type="button"
                  className="hz-tahsilatlar-icon-action"
                  title="Makbuz"
                  aria-label="Makbuz"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMakbuz(row.paymentId);
                  }}
                >
                  <LucideIcon name="file-text" size={14} />
                </button>
                <button
                  type="button"
                  className="hz-tahsilatlar-icon-action"
                  title="Hatırlatma Gönder"
                  aria-label="Hatırlatma Gönder"
                  onClick={(e) => {
                    e.stopPropagation();
                    onReminder(row.paymentId);
                  }}
                >
                  <LucideIcon name="bell" size={14} />
                </button>
              </div>
            </td>
          </tr>
        ))}
        {rows.length === 0 ? (
          <tr>
            <td colSpan={9}>
              <div className="hz-tahsilatlar-list__empty">Filtrelere uygun tahsilat bulunamadı.</div>
            </td>
          </tr>
        ) : null}
      </tbody>
    </table>
  );
}
