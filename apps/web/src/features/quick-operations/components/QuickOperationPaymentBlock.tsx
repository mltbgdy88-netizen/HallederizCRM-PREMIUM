// @ts-nocheck
"use client";

import type { PaymentMethod } from "@hallederiz/types";

const PAYMENT_METHODS: Array<{ value: PaymentMethod; label: string }> = [
  { value: "cash", label: "Nakit" },
  { value: "transfer", label: "Havale / EFT" },
  { value: "card", label: "Kredi kartı" },
  { value: "check", label: "Çek / senet" },
  { value: "mixed", label: "Diğer" }
];

export type QuickOperationPaymentFormState = {
  enabled: boolean;
  amount: number;
  method: PaymentMethod;
  receivedAt: string;
  referenceNo: string;
  note: string;
  allocateToOrder: boolean;
};

type Props = {
  state: QuickOperationPaymentFormState;
  onChange: (patch: Partial<QuickOperationPaymentFormState>) => void;
  grandTotal: number;
  showAllocateToggle: boolean;
  disabled?: boolean;
};

function money(value: number): string {
  return value.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function QuickOperationPaymentBlock({ state, onChange, grandTotal, showAllocateToggle, disabled }: Props) {
  const paymentHint =
    grandTotal > 0
      ? state.amount >= grandTotal
        ? "Tam tahsilat"
        : state.amount > 0
          ? "Kısmi tahsilat"
          : "Tutar girin"
      : state.amount > 0
        ? "Tutar girildi"
        : null;

  return (
    <section className="hz-qop-payment-block" aria-label="Ödeme bilgileri">
      <div className="hz-qop-payment-block-head">
        <h2 className="hz-qop-wb-conditions-title">Ödeme / tahsilat</h2>
      </div>

      <div className="hz-qop-payment-fields">
          <label className="hz-qop-field">
            <span className="hz-qop-label">Tahsilat tutarı (₺)</span>
            <input
              className="hz-qop-input hz-qop-cell-num"
              type="number"
              min={0}
              step={0.01}
              max={grandTotal > 0 ? grandTotal : undefined}
              value={state.amount || ""}
              disabled={disabled}
              onChange={(e) => onChange({ amount: Math.max(0, Number(e.target.value || 0)) })}
            />
          </label>
          <label className="hz-qop-field">
            <span className="hz-qop-label">Ödeme yöntemi</span>
            <select
              className="hz-qop-input"
              value={state.method}
              disabled={disabled}
              onChange={(e) => onChange({ method: e.target.value as PaymentMethod })}
            >
              {PAYMENT_METHODS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label className="hz-qop-field">
            <span className="hz-qop-label">Tahsilat tarihi</span>
            <input
              className="hz-qop-input"
              type="date"
              value={state.receivedAt.slice(0, 10)}
              disabled={disabled}
              onChange={(e) => onChange({ receivedAt: e.target.value ? `${e.target.value}T12:00:00.000Z` : new Date().toISOString() })}
            />
          </label>
          <label className="hz-qop-field">
            <span className="hz-qop-label">Referans no</span>
            <input
              className="hz-qop-input"
              value={state.referenceNo}
              disabled={disabled}
              onChange={(e) => onChange({ referenceNo: e.target.value })}
              placeholder="Dekont / fiş no"
            />
          </label>
          <label className="hz-qop-field hz-qop-field--grow">
            <span className="hz-qop-label">Açıklama</span>
            <input
              className="hz-qop-input"
              value={state.note}
              disabled={disabled}
              onChange={(e) => onChange({ note: e.target.value })}
              placeholder="Tahsilat açıklaması"
            />
          </label>
          {showAllocateToggle ? (
            <label className="hz-qop-payment-toggle hz-qop-payment-toggle--inline">
              <input
                type="checkbox"
                checked={state.allocateToOrder}
                disabled={disabled}
                onChange={(e) => onChange({ allocateToOrder: e.target.checked })}
              />
              <span>Tahsilatı bu siparişe bağla</span>
            </label>
          ) : null}
          {paymentHint ? (
            <p className="hz-qop-payment-hint" role="status">
              {paymentHint}
              {grandTotal > 0 ? ` · Sipariş toplamı: ₺${money(grandTotal)}` : null}
            </p>
          ) : null}
      </div>
    </section>
  );
}


