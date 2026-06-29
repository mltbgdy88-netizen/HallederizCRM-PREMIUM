"use client";

import { useCallback, useEffect, useState } from "react";
import type { PaymentReceipt, PaymentReversalLineRecord } from "@hallederiz/types";
import { dataSourceConfig, sdk } from "../../../lib/data-source";
import { useToast } from "../../../providers/toast-provider";

function money(amount: number, currency: string): string {
  const prefix = currency === "TRY" ? "₺" : `${currency} `;
  return `${prefix}${amount.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return "—";
  }
  return d.toLocaleDateString("tr-TR");
}

export function PaymentReversalsPanel({ payment }: { payment: PaymentReceipt }) {
  const { pushToast } = useToast();
  const [items, setItems] = useState<PaymentReversalLineRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const loadReversals = useCallback(async () => {
    setLoading(true);
    try {
      const response = await sdk.payments.listReversals(payment.id);
      setItems(response.items ?? []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [payment.id]);

  useEffect(() => {
    void loadReversals();
  }, [loadReversals]);

  const handleCreateReversal = async () => {
    if (dataSourceConfig.useDemoData) {
      pushToast("Demo modda ters kayıt oluşturulamaz.");
      return;
    }
    if (!reason.trim()) {
      pushToast("Ters kayıt nedeni zorunludur.");
      return;
    }
    if (submitted) {
      return;
    }

    setSubmitting(true);
    try {
      const response = await sdk.payments.createReversal(payment.id, {
        amount: payment.amount,
        currency: payment.currency,
        reason: reason.trim()
      });
      const body = response as { approvalRequestId?: string; item?: PaymentReversalLineRecord };
      if (body.approvalRequestId) {
        pushToast("Ters kayıt onay kuyruğuna alındı.");
        setSubmitted(true);
        return;
      }
      if (body.item) {
        pushToast("Ters kayıt oluşturuldu.");
        setSubmitted(true);
        setReason("");
        await loadReversals();
        return;
      }
      pushToast("Ters kayıt şu anda oluşturulamadı.");
    } catch {
      pushToast("Ters kayıt şu anda oluşturulamadı.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="tdf-section" aria-label="Ters kayıtlar">
      <header className="tdf-section__head">
        <h2>Ters kayıtlar</h2>
      </header>
      <p className="tdf-section__desc">Tahsilat iptali veya düzeltme hareketleri; onay gerektirebilir.</p>

      {loading ? (
        <p className="tdf-section__desc">Yükleniyor…</p>
      ) : items.length === 0 ? (
        <p className="tdf-section__desc">Kayıtlı ters kayıt yok.</p>
      ) : (
        <div className="tdf-reversals-table" role="table" aria-label="Ters kayıt listesi">
          <div className="tdf-reversals-table__head" role="row">
            <span role="columnheader">Tarih</span>
            <span role="columnheader">Tutar</span>
            <span role="columnheader">Durum</span>
          </div>
          {items.map((item) => (
            <div key={item.id} className="tdf-reversals-table__row" role="row">
              <span role="cell">{fmtDate(item.createdAt)}</span>
              <span role="cell">{money(item.amount, item.currency)}</span>
              <span role="cell">{item.status}</span>
            </div>
          ))}
        </div>
      )}

      {payment.status === "confirmed" || payment.status === "allocated" || payment.status === "partially_allocated" ? (
        <div className="tdf-reversals-form">
          <label className="tdf-field tdf-field--full">
            <span>Ters kayıt nedeni</span>
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows={2}
              disabled={submitting || submitted}
              placeholder="Örn. yanlış tahsilat, iade sonrası düzeltme"
            />
          </label>
          <button
            type="button"
            className="hz-btn hz-btn-secondary hz-toolbar-btn"
            disabled={submitting || submitted || dataSourceConfig.useDemoData}
            onClick={() => void handleCreateReversal()}
          >
            {submitted ? "Talep gönderildi" : submitting ? "Gönderiliyor…" : "Ters kayıt talebi oluştur"}
          </button>
        </div>
      ) : null}
    </section>
  );
}
