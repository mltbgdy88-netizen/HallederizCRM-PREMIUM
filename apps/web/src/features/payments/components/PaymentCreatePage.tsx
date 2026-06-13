"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Customer, PaymentMethod } from "@hallederiz/types";
import { LucideIcon } from "../../../components/icons/lucide-icons";
import { dataSourceConfig } from "../../../lib/data-source";
import { useToast } from "../../../providers/toast-provider";
import { getOrders } from "../../orders/queries/get-orders";
import { getPayments } from "../queries/get-payments";
import {
  createPaymentIdempotencyKey,
  PAYMENT_CREATE_MSG
} from "../utils/payment-create-feedback";
import { submitPaymentCreate } from "../utils/payment-create-submit";
import {
  formatTurkishAmountInput,
  hasBlockingValidationIssues,
  parseTurkishAmountInput,
  PAYMENT_HIGH_AMOUNT_THRESHOLD,
  validatePaymentCreateForm
} from "../utils/payment-create-validation";

const METHODS: Array<{ value: PaymentMethod; label: string; hint?: string }> = [
  { value: "cash", label: "Nakit" },
  { value: "transfer", label: "Havale / EFT" },
  { value: "card", label: "Kredi kartı" },
  { value: "check", label: "Çek / senet", hint: "Ek belge akışı gerekebilir" },
  { value: "mixed", label: "Diğer" }
];

const RISK_LABELS: Record<Customer["riskLevel"], string> = {
  low: "Düşük risk",
  medium: "Orta risk",
  high: "Yüksek risk",
  blocked: "Blokeli"
};

type DeskOrderRow = {
  id: string;
  orderNo: string;
  customerId: string;
  grandTotal: number;
  paidTotal: number;
};

type SubmitOutcomeState =
  | { type: "idle" }
  | { type: "created"; paymentId: string }
  | { type: "approval"; approvalRequestId?: string }
  | { type: "demo_blocked" };

function money(value: number): string {
  return value.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function resolveOrderOpenBalance(order: DeskOrderRow): number {
  return Math.max(0, order.grandTotal - order.paidTotal);
}

export function PaymentCreatePage({
  customerId: initialCustomerId,
  sourceOrderId
}: {
  customerId: string | null;
  sourceOrderId: string | null;
}) {
  const { pushToast } = useToast();
  const initialSyncRef = useRef(false);
  const paymentIdempotencyKeyRef = useRef(createPaymentIdempotencyKey());
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<DeskOrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitOutcome, setSubmitOutcome] = useState<SubmitOutcomeState>({ type: "idle" });
  const [showValidationSummary, setShowValidationSummary] = useState(false);

  const [customerId, setCustomerId] = useState(initialCustomerId ?? "");
  const [orderId, setOrderId] = useState(sourceOrderId ?? "");
  const [amount, setAmount] = useState(0);
  const [amountInput, setAmountInput] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("transfer");
  const [receivedAt, setReceivedAt] = useState(new Date().toISOString().slice(0, 10));
  const [referenceNo, setReferenceNo] = useState("");
  const [accountingRef, setAccountingRef] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([getPayments(), getOrders()])
      .then(([paymentsResult, ordersResult]) => {
        if (!active) return;
        setCustomers(paymentsResult.customers);
        setOrders(
          ordersResult.orders.map((order) => ({
            id: order.id,
            orderNo: order.orderNo,
            customerId: order.customerId,
            grandTotal: order.grandTotal,
            paidTotal: order.paidTotal
          }))
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (initialSyncRef.current) return;
    if (loading) return;

    if (sourceOrderId) {
      const matchedOrder = orders.find((order) => order.id === sourceOrderId);
      if (matchedOrder) {
        setOrderId(matchedOrder.id);
        setCustomerId(matchedOrder.customerId);
        const open = resolveOrderOpenBalance(matchedOrder);
        if (open > 0) {
          setAmount((current) => (current <= 0 ? open : current));
          setAmountInput((current) => (current ? current : formatTurkishAmountInput(open)));
        }
        initialSyncRef.current = true;
        return;
      }
    }

    if (initialCustomerId) {
      setCustomerId(initialCustomerId);
      initialSyncRef.current = true;
    }
  }, [sourceOrderId, initialCustomerId, orders, loading]);

  const customerOrders = useMemo(
    () => orders.filter((order) => !customerId || order.customerId === customerId),
    [customerId, orders]
  );

  const selectedOrder = useMemo(() => orders.find((order) => order.id === orderId) ?? null, [orderId, orders]);

  const selectedCustomer = useMemo(
    () => customers.find((customer) => customer.id === customerId) ?? null,
    [customers, customerId]
  );

  useEffect(() => {
    if (!selectedOrder) return;
    const open = resolveOrderOpenBalance(selectedOrder);
    if (open > 0 && amount <= 0) {
      setAmount(open);
      setAmountInput(formatTurkishAmountInput(open));
    }
  }, [selectedOrder, amount]);

  const openAmount = selectedOrder ? resolveOrderOpenBalance(selectedOrder) : null;
  const remainingBalance = openAmount !== null ? Math.max(0, openAmount - amount) : null;

  const validationIssues = useMemo(
    () =>
      validatePaymentCreateForm({
        customerId,
        amount,
        method,
        receivedAt,
        openAmount,
        orderSelected: Boolean(selectedOrder)
      }),
    [customerId, amount, method, receivedAt, openAmount, selectedOrder]
  );

  const blockingIssues = useMemo(
    () => validationIssues.filter((issue) => issue.severity === "error"),
    [validationIssues]
  );

  const warningIssues = useMemo(
    () => validationIssues.filter((issue) => issue.severity === "warning"),
    [validationIssues]
  );

  const requiresApprovalHint =
    amount >= PAYMENT_HIGH_AMOUNT_THRESHOLD ||
    warningIssues.some((issue) => issue.id === "high_amount") ||
    selectedCustomer?.riskLevel === "high" ||
    selectedCustomer?.riskLevel === "blocked";

  function handleCustomerChange(nextCustomerId: string) {
    setCustomerId(nextCustomerId);
    if (!orderId) return;
    const linkedOrder = orders.find((order) => order.id === orderId);
    if (linkedOrder && linkedOrder.customerId !== nextCustomerId) {
      setOrderId("");
    }
  }

  function handleAmountInputChange(raw: string) {
    setAmountInput(raw);
    const parsed = parseTurkishAmountInput(raw);
    setAmount(parsed > 0 ? parsed : 0);
  }

  function handleAmountInputBlur() {
    if (amount > 0) {
      setAmountInput(formatTurkishAmountInput(amount));
    }
  }

  const handleSubmit = async (mode: "save" | "draft") => {
    setShowValidationSummary(true);
    if (hasBlockingValidationIssues(validationIssues)) {
      pushToast(blockingIssues[0]?.message ?? "Formu kontrol edin.");
      return;
    }

    if (dataSourceConfig.useDemoData) {
      pushToast(PAYMENT_CREATE_MSG.DEMO_BLOCKED);
      setSubmitOutcome({ type: "demo_blocked" });
      return;
    }

    setSaving(true);
    try {
      const result = await submitPaymentCreate({
        customerId,
        orderId,
        amount,
        method,
        receivedAt,
        referenceNo,
        accountingRef,
        note,
        idempotencyKey: paymentIdempotencyKeyRef.current,
        mode
      });

      if (result.outcome === "error") {
        pushToast(result.toast);
        if (result.rotateIdempotencyKey) {
          paymentIdempotencyKeyRef.current = createPaymentIdempotencyKey();
        }
        return;
      }

      pushToast(result.toast);
      if (result.outcome === "created") {
        setSubmitOutcome({ type: "created", paymentId: result.paymentId });
      } else if (result.outcome === "approval") {
        setSubmitOutcome({ type: "approval", approvalRequestId: result.approvalRequestId });
      } else if (result.outcome === "demo_blocked") {
        setSubmitOutcome({ type: "demo_blocked" });
      }
    } finally {
      setSaving(false);
    }
  };

  if (submitOutcome.type === "created") {
    return (
      <section className="thf-page thf-page--success thf-page--enterprise" aria-live="polite">
        <div className="thf-shell">
          <header className="thf-header">
            <div className="thf-header__main">
              <span className="thf-header__icon" aria-hidden>
                <LucideIcon name="check-circle-2" size={20} />
              </span>
              <div>
                <p className="thf-header__eyebrow">Tahsilatlar</p>
                <h1>Tahsilat hazırlandı</h1>
                <p className="thf-header__lead">Kayıt işlendi. Detayı inceleyebilir veya listeye dönebilirsiniz.</p>
              </div>
            </div>
          </header>

          <div className="thf-card">
            <div className="thf-card__body">
              <p className="thf-success-lead">Tahsilat kaydı oluşturuldu. Sonraki adımı seçin.</p>
            </div>
            <footer className="thf-actions">
              <Link className="thf-btn thf-btn--primary" href={`/tahsilatlar/${encodeURIComponent(submitOutcome.paymentId)}`}>
                Tahsilat detayına git
              </Link>
              {orderId ? (
                <Link className="thf-btn" href={`/siparisler/${encodeURIComponent(orderId)}`}>
                  Kaynak siparişe git
                </Link>
              ) : null}
              <Link className="thf-btn" href="/tahsilatlar">
                Tahsilat listesine dön
              </Link>
            </footer>
          </div>
        </div>
      </section>
    );
  }

  if (submitOutcome.type === "approval") {
    const approvalsHref = submitOutcome.approvalRequestId
      ? `/onaylar/${encodeURIComponent(submitOutcome.approvalRequestId)}`
      : "/onaylar";
    return (
      <section className="thf-page thf-page--success thf-page--enterprise" aria-live="polite">
        <div className="thf-shell">
          <header className="thf-header">
            <div className="thf-header__main">
              <span className="thf-header__icon" aria-hidden>
                <LucideIcon name="shield-check" size={20} />
              </span>
              <div>
                <p className="thf-header__eyebrow">Tahsilatlar</p>
                <h1>Onay kuyruğuna alındı</h1>
                <p className="thf-header__lead">Tahsilat kaydı onay sürecine iletildi. Onaylar ekranından takip edebilirsiniz.</p>
              </div>
            </div>
          </header>

          <div className="thf-card">
            <div className="thf-card__body">
              <p className="thf-success-lead">{PAYMENT_CREATE_MSG.APPROVAL_QUEUED}</p>
            </div>
            <footer className="thf-actions">
              <Link className="thf-btn thf-btn--primary" href={approvalsHref}>
                Onaylar ekranına git
              </Link>
              <Link className="thf-btn" href="/tahsilatlar">
                Tahsilat listesine dön
              </Link>
            </footer>
          </div>
        </div>
      </section>
    );
  }

  if (submitOutcome.type === "demo_blocked") {
    return (
      <section className="thf-page thf-page--success thf-page--enterprise" aria-live="polite">
        <div className="thf-shell">
          <header className="thf-header">
            <div className="thf-header__main">
              <span className="thf-header__icon" aria-hidden>
                <LucideIcon name="alert-triangle" size={20} />
              </span>
              <div>
                <p className="thf-header__eyebrow">Tahsilatlar</p>
                <h1>Demo taslak hazır</h1>
                <p className="thf-header__lead">Canlı tahsilat oluşturulmadı. Form bilgileri yalnızca önizleme amaçlıdır.</p>
              </div>
            </div>
          </header>

          <div className="thf-card">
            <div className="thf-card__body">
              <p className="thf-success-lead">{PAYMENT_CREATE_MSG.DEMO_BLOCKED}</p>
            </div>
            <footer className="thf-actions">
              <Link className="thf-btn thf-btn--primary" href="/tahsilatlar">
                Tahsilat listesine dön
              </Link>
              <button
                type="button"
                className="thf-btn"
                onClick={() => setSubmitOutcome({ type: "idle" })}
              >
                Forma geri dön
              </button>
            </footer>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="thf-page thf-page--enterprise" aria-live="polite">
      <div className="thf-shell">
        <header className="thf-header">
          <div className="thf-header__main">
            <span className="thf-header__icon" aria-hidden>
              <LucideIcon name="circle-dollar-sign" size={20} />
            </span>
            <div>
              <p className="thf-header__eyebrow">Tahsilatlar</p>
              <h1>Yeni Tahsilat</h1>
              <p className="thf-header__lead">
                Cari veya siparişe bağlı tahsilat kaydı oluşturun. Tutar, yöntem ve referans bilgilerini kontrol edin.
              </p>
            </div>
          </div>
          <Link className="thf-header__back" href="/tahsilatlar">
            Tahsilatlara dön
          </Link>
        </header>

        {dataSourceConfig.useDemoData ? (
          <p className="thf-preview-band" role="status">
            Demo mod: form doldurulabilir; canlı kayıt oluşturulmaz.
          </p>
        ) : null}

        {loading ? (
          <p className="thf-loading" role="status">
            Yükleniyor…
          </p>
        ) : (
          <form
            className="thf-card thf-card--enterprise"
            onSubmit={(event) => {
              event.preventDefault();
              void handleSubmit("save");
            }}
          >
            <div className="thf-card__body">
              <div className="thf-layout">
                <div className="thf-main">
                  {showValidationSummary && validationIssues.length > 0 ? (
                    <div
                      className={`thf-validation${blockingIssues.length > 0 ? " thf-validation--error" : " thf-validation--warn"}`}
                      role="alert"
                    >
                      <p className="thf-validation__title">Form kontrolü</p>
                      <ul className="thf-validation__list">
                        {validationIssues.map((issue) => (
                          <li key={issue.id}>{issue.message}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  <div className="thf-form-grid">
                    <label className="thf-field thf-field--span-12">
                      <span className="thf-field__label thf-field__label-required">Cari</span>
                      <span className="thf-field__control">
                        <select
                          value={customerId}
                          onChange={(event) => handleCustomerChange(event.target.value)}
                          required
                        >
                          <option value="">Cari seçiniz…</option>
                          {customers.map((customer) => (
                            <option key={customer.id} value={customer.id}>
                              {customer.name}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          className="thf-field__addon"
                          disabled
                          title="Cari oluşturma ayrı ekranda yapılacak"
                          aria-label="Cari oluşturma ayrı ekranda yapılacak"
                        >
                          <LucideIcon name="plus" size={14} />
                        </button>
                      </span>
                    </label>

                    <label className="thf-field thf-field--span-12">
                      <span className="thf-field__label">Sipariş veya belge referansı (isteğe bağlı)</span>
                      <span className="thf-field__control">
                        <select value={orderId} onChange={(event) => setOrderId(event.target.value)}>
                          <option value="">Genel tahsilat — sipariş bağlantısı yok</option>
                          {customerOrders.map((order) => (
                            <option key={order.id} value={order.id}>
                              {order.orderNo} · Açık: ₺{money(resolveOrderOpenBalance(order))}
                            </option>
                          ))}
                        </select>
                      </span>
                    </label>

                    {openAmount !== null ? (
                      <p className="thf-hint" role="status">
                        Sipariş açık bakiye: <strong>₺{money(openAmount)}</strong>
                      </p>
                    ) : (
                      <p className="thf-hint" role="status">
                        Genel tahsilat: belge tahsisi yapılmadan cari hesaba kayıt hazırlanır.
                      </p>
                    )}

                    <label className="thf-field thf-field--span-4">
                      <span className="thf-field__label thf-field__label-required">Tahsilat tutarı</span>
                      <span className="thf-field__control">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={amountInput}
                          onChange={(event) => handleAmountInputChange(event.target.value)}
                          onBlur={handleAmountInputBlur}
                          placeholder="0,00"
                          required
                          aria-label="Tahsilat tutarı"
                        />
                      </span>
                    </label>

                    <label className="thf-field thf-field--span-4">
                      <span className="thf-field__label thf-field__label-required">Para birimi</span>
                      <span className="thf-field__control">
                        <input type="text" value="TRY — Türk Lirası" readOnly aria-readonly="true" />
                      </span>
                    </label>

                    <label className="thf-field thf-field--span-4">
                      <span className="thf-field__label thf-field__label-required">Ödeme yöntemi</span>
                      <span className="thf-field__control">
                        <select value={method} onChange={(event) => setMethod(event.target.value as PaymentMethod)}>
                          {METHODS.map((item) => (
                            <option key={item.value} value={item.value}>
                              {item.label}
                            </option>
                          ))}
                        </select>
                      </span>
                      {METHODS.find((item) => item.value === method)?.hint ? (
                        <span className="thf-field__hint">{METHODS.find((item) => item.value === method)?.hint}</span>
                      ) : null}
                    </label>

                    <label className="thf-field thf-field--span-4">
                      <span className="thf-field__label thf-field__label-required">Tahsilat tarihi</span>
                      <span className="thf-field__control">
                        <input
                          type="date"
                          value={receivedAt}
                          onChange={(event) => setReceivedAt(event.target.value)}
                          required
                        />
                      </span>
                    </label>

                    <label className="thf-field thf-field--span-4">
                      <span className="thf-field__label">Muhasebe / işlem referansı (isteğe bağlı)</span>
                      <span className="thf-field__control">
                        <input
                          value={accountingRef}
                          onChange={(event) => setAccountingRef(event.target.value)}
                          placeholder="İşlem veya muhasebe kodu"
                        />
                      </span>
                    </label>

                    <label className="thf-field thf-field--span-4">
                      <span className="thf-field__label">Dekont / belge referansı (isteğe bağlı)</span>
                      <span className="thf-field__control">
                        <input
                          value={referenceNo}
                          onChange={(event) => setReferenceNo(event.target.value)}
                          placeholder="Dekont veya belge no"
                        />
                      </span>
                    </label>

                    <label className="thf-field thf-field--span-12">
                      <span className="thf-field__label">Açıklama / not</span>
                      <span className="thf-field__control">
                        <textarea
                          value={note}
                          onChange={(event) => setNote(event.target.value)}
                          placeholder="Tahsilat açıklaması giriniz…"
                          rows={2}
                        />
                      </span>
                    </label>

                    <label className="thf-field thf-field--span-6">
                      <span className="thf-field__label">Sistem belge no</span>
                      <span className="thf-field__control">
                        <input
                          type="text"
                          value="Kayıt sonrası atanır"
                          readOnly
                          aria-readonly="true"
                          title="Belge numarası kayıt sonrası oluşturulur"
                        />
                      </span>
                    </label>
                  </div>

                  <section className="thf-allocation" aria-label="Tahsilat dağılımı">
                    <h2 className="thf-section-title">Tahsilat Dağılımı</h2>
                    {selectedOrder ? (
                      <div className="thf-allocation-table-wrap">
                        <table className="thf-allocation-table">
                          <thead>
                            <tr>
                              <th>Belge türü</th>
                              <th>Belge no</th>
                              <th>Cari</th>
                              <th>Açık bakiye</th>
                              <th>Tahsis tutarı</th>
                              <th>Durum</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>Sipariş</td>
                              <td>{selectedOrder.orderNo}</td>
                              <td>{selectedCustomer?.name ?? "—"}</td>
                              <td>₺{money(openAmount ?? 0)}</td>
                              <td>₺{money(amount)}</td>
                              <td>
                                <span className="thf-badge">Bağlı</span>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="thf-allocation-empty">
                        Bağımsız tahsilat olarak kaydedilecek. Belge tahsisi yapılmadı.
                      </p>
                    )}
                  </section>
                </div>

                <aside className="thf-aside" aria-label="Tahsilat özeti">
                  {!selectedCustomer ? (
                    <div className="thf-aside-card thf-aside-card--empty">
                      <p className="thf-aside-card__title">Özet için cari seçin</p>
                      <p className="thf-aside-card__text">
                        Tahsilat bağlamını görmek için önce cari seçin. Sipariş bağlantısı isteğe bağlıdır.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="thf-aside-card">
                        <p className="thf-aside-card__title">Seçili cari</p>
                        <p className="thf-aside-card__value">{selectedCustomer.name}</p>
                        <p className="thf-aside-card__meta">
                          Risk: {RISK_LABELS[selectedCustomer.riskLevel]}
                          {selectedCustomer.lastOrderAt
                            ? ` · Son sipariş: ${new Date(selectedCustomer.lastOrderAt).toLocaleDateString("tr-TR")}`
                            : ""}
                        </p>
                      </div>

                      <div className="thf-aside-card">
                        <p className="thf-aside-card__title">Belge bağlamı</p>
                        <p className="thf-aside-card__value">
                          {selectedOrder ? `Sipariş ${selectedOrder.orderNo}` : "Genel tahsilat"}
                        </p>
                        <p className="thf-aside-card__meta">
                          {selectedOrder
                            ? "Tahsilat sipariş açık bakiyesine tahsis edilir."
                            : "Belge seçilmedi; cari hesaba genel tahsilat kaydı hazırlanır."}
                        </p>
                      </div>

                      <div className="thf-aside-card thf-aside-card--metrics">
                        <div className="thf-aside-metric">
                          <span>Ödenecek / açık</span>
                          <strong>₺{money(openAmount ?? 0)}</strong>
                        </div>
                        <div className="thf-aside-metric">
                          <span>Tahsilat tutarı</span>
                          <strong>₺{money(amount)}</strong>
                        </div>
                        <div className="thf-aside-metric">
                          <span>Kalan</span>
                          <strong className={remainingBalance !== null && remainingBalance > 0 ? "thf-aside-metric--warn" : ""}>
                            ₺{money(remainingBalance ?? 0)}
                          </strong>
                        </div>
                      </div>

                      {selectedCustomer.riskLevel === "high" || selectedCustomer.riskLevel === "blocked" ? (
                        <div className="thf-aside-card thf-aside-card--risk" role="status">
                          <p className="thf-aside-card__title">Risk uyarısı</p>
                          <p className="thf-aside-card__text">
                            Seçili cari {RISK_LABELS[selectedCustomer.riskLevel]} seviyesinde. Tahsilat onay gerektirebilir.
                          </p>
                        </div>
                      ) : null}

                      <div className="thf-aside-card">
                        <p className="thf-aside-card__title">Tahsilat durumu</p>
                        <p className="thf-aside-card__value">{requiresApprovalHint ? "Onay gerekebilir" : "Kayda hazır"}</p>
                        <p className="thf-aside-card__meta">
                          {requiresApprovalHint
                            ? "Yüksek tutar veya riskli cari nedeniyle onay akışı tetiklenebilir."
                            : "Form doğrulandığında güvenli gönderim yapılır."}
                        </p>
                      </div>

                      <div className="thf-aside-card thf-aside-card--secure">
                        <p className="thf-aside-card__title">Güvenli gönderim</p>
                        <p className="thf-aside-card__text">
                          Her gönderim benzersiz bir anahtarla korunur; çift tıklama ve yinelenen kayıt engellenir.
                        </p>
                      </div>
                    </>
                  )}
                </aside>
              </div>
            </div>

            <footer className="thf-actions thf-actions--sticky">
              <Link className="thf-btn" href="/tahsilatlar">
                İptal
              </Link>
              <button
                type="button"
                className="thf-btn"
                disabled={saving}
                onClick={() => void handleSubmit("draft")}
                title={saving ? "Gönderim devam ediyor" : "Taslak olarak hazırla"}
              >
                {saving ? "İşleniyor…" : "Taslak olarak hazırla"}
              </button>
              <button
                type="submit"
                className="thf-btn thf-btn--primary"
                disabled={saving}
                title={
                  saving
                    ? "Gönderim devam ediyor"
                    : requiresApprovalHint
                      ? "Onaya gönder veya tahsilatı kaydet"
                      : "Tahsilatı kaydet"
                }
              >
                <LucideIcon name="receipt" size={14} />
                {saving
                  ? "Gönderiliyor…"
                  : requiresApprovalHint
                    ? "Onaya gönder"
                    : "Tahsilatı kaydet"}
              </button>
            </footer>
          </form>
        )}
      </div>
    </section>
  );
}
