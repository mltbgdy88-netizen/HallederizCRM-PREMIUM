"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { LucideIcon } from "../../../components/icons/lucide-icons";
import { dataSourceConfig } from "../../../lib/data-source";
import { useToast } from "../../../providers/toast-provider";
import { getOrders } from "../../orders/queries/get-orders";

const INVOICE_TYPES = [
  { value: "sales", label: "Satış faturası" },
  { value: "export", label: "İhracat faturası" },
  { value: "other", label: "Diğer" }
];

const E_DOCUMENT_SCENARIOS = [
  { value: "einvoice", label: "e-Fatura (placeholder)" },
  { value: "earchive", label: "e-Arşiv (placeholder)" },
  { value: "paper", label: "Kağıt / manuel" }
];

export function InvoiceCreatePage({ sourceOrderId }: { sourceOrderId?: string | null }) {
  const { pushToast } = useToast();
  const initialSyncRef = useRef(false);
  const [loading, setLoading] = useState(true);
  const [draftSaved, setDraftSaved] = useState(false);
  const [customers, setCustomers] = useState<Array<{ id: string; name: string }>>([]);
  const [orders, setOrders] = useState<Array<{ id: string; orderNo: string; customerId: string }>>([]);

  const [customerId, setCustomerId] = useState("");
  const [orderId, setOrderId] = useState(sourceOrderId ?? "");
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState("");
  const [invoiceType, setInvoiceType] = useState("sales");
  const [eDocumentScenario, setEDocumentScenario] = useState("einvoice");
  const [note, setNote] = useState("");
  const [documentNote, setDocumentNote] = useState("");

  useEffect(() => {
    let active = true;
    getOrders()
      .then((result) => {
        if (!active) return;
        setCustomers(result.customers.map((customer) => ({ id: customer.id, name: customer.name })));
        setOrders(
          result.orders.map((order) => ({
            id: order.id,
            orderNo: order.orderNo,
            customerId: order.customerId
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
    if (initialSyncRef.current || loading) return;
    if (!sourceOrderId) return;
    const matched = orders.find((order) => order.id === sourceOrderId);
    if (matched) {
      setOrderId(matched.id);
      setCustomerId(matched.customerId);
      initialSyncRef.current = true;
    }
  }, [sourceOrderId, orders, loading]);

  const selectedOrder = useMemo(() => orders.find((order) => order.id === orderId) ?? null, [orderId, orders]);
  const selectedCustomerName = useMemo(
    () => customers.find((customer) => customer.id === customerId)?.name ?? "—",
    [customers, customerId]
  );

  function handleCustomerChange(nextCustomerId: string) {
    setCustomerId(nextCustomerId);
    if (!orderId) return;
    const linked = orders.find((order) => order.id === orderId);
    if (linked && linked.customerId !== nextCustomerId) {
      setOrderId("");
    }
  }

  function handleDraftSave() {
    if (!customerId && !orderId) {
      pushToast("Cari veya sipariş bağlamı seçin.");
      return;
    }
    setDraftSaved(true);
    pushToast("Demo modda fatura taslağı kaydedildi. Canlı oluşturma bağlı değildir.");
  }

  if (loading) {
    return (
      <section className="invf-page invf-page--form hz-invoices-create-page">
        <div className="invf-state" role="status" aria-live="polite">
          <div className="invf-state__spinner" aria-hidden />
          <h2>Yeni fatura formu hazırlanıyor</h2>
          <p>Sipariş ve cari bağlamı kontrol ediliyor.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="invf-page invf-page--form hz-invoices-create-page">
      <div className="invf-shell invf-shell--form">
        <header className="invf-header">
          <div className="invf-header__main">
            <span className="invf-header__icon" aria-hidden>
              <LucideIcon name="file-text" size={20} />
            </span>
            <div>
              <p className="invf-header__eyebrow">Faturalar</p>
              <h1>Yeni Fatura</h1>
              <p className="invf-header__meta">Fatura taslağı oluşturun; satır prefill sonraki fazda bağlanacaktır.</p>
            </div>
          </div>
          <Link href="/faturalar" className="invf-header__back">
            ← Listeye dön
          </Link>
        </header>

        {dataSourceConfig.useDemoData ? (
          <p className="invf-demo-band" role="status">
            Örnek veri modu: bu form canlı fatura oluşturmaz; kaydet yalnızca demo taslak bildirimi verir.
          </p>
        ) : (
          <p className="invf-demo-band invf-demo-band--info" role="status">
            Canlı fatura oluşturma bu ekranda bağlı değildir; kesim onay akışı sonraki fazda bağlanacaktır.
          </p>
        )}

        {sourceOrderId ? (
          <p className="invf-order-band" role="status">
            Sipariş bağlantısı alındı: {selectedOrder?.orderNo ?? sourceOrderId}. Gerçek satır prefill sonraki fazda
            bağlanacak.
          </p>
        ) : null}

        <main className="invf-form-layout">
          <section className="invf-form-main">
            <section className="invf-section" aria-label="Fatura bağlamı">
              <header className="invf-section__head">
                <h2>Fatura bağlamı</h2>
              </header>
              <div className="invf-field-grid">
                <label className="invf-field">
                  <span>Cari</span>
                  <select value={customerId} onChange={(event) => handleCustomerChange(event.target.value)}>
                    <option value="">Cari seçin</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="invf-field">
                  <span>Sipariş</span>
                  <select value={orderId} onChange={(event) => setOrderId(event.target.value)}>
                    <option value="">Sipariş seçin (opsiyonel)</option>
                    {(customerId ? orders.filter((order) => order.customerId === customerId) : orders).map((order) => (
                      <option key={order.id} value={order.id}>
                        {order.orderNo}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="invf-field">
                  <span>Fatura tarihi</span>
                  <input type="date" value={invoiceDate} onChange={(event) => setInvoiceDate(event.target.value)} />
                </label>
                <label className="invf-field">
                  <span>Vade tarihi</span>
                  <input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
                </label>
                <label className="invf-field">
                  <span>Fatura tipi</span>
                  <select value={invoiceType} onChange={(event) => setInvoiceType(event.target.value)}>
                    {INVOICE_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="invf-field">
                  <span>e-Belge senaryosu</span>
                  <select value={eDocumentScenario} onChange={(event) => setEDocumentScenario(event.target.value)}>
                    {E_DOCUMENT_SCENARIOS.map((scenario) => (
                      <option key={scenario.value} value={scenario.value}>
                        {scenario.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="invf-field invf-field--full">
                  <span>Açıklama</span>
                  <textarea rows={2} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Fatura notu" />
                </label>
              </div>
            </section>

            <section className="invf-section" aria-label="Fatura satırları">
              <header className="invf-section__head">
                <h2>Fatura satırları</h2>
              </header>
              <p className="invf-section__desc">
                {selectedOrder
                  ? `${selectedOrder.orderNo} siparişi için satır prefill sonraki fazda bağlanacak.`
                  : "Sipariş seçildiğinde satırlar burada listelenecek."}
              </p>
              <div className="invf-table-wrap">
                <table className="invf-table">
                  <thead>
                    <tr>
                      <th>Ürün kodu</th>
                      <th>Ürün adı</th>
                      <th>Adet</th>
                      <th>Toplam</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={4} className="invf-table__empty">
                        Henüz satır yüklenmedi — sipariş bağlantısı sonrası prefill eklenecek.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="invf-section" aria-label="Belge notu">
              <header className="invf-section__head">
                <h2>Belge notu</h2>
              </header>
              <label className="invf-field invf-field--full">
                <span>PDF / e-belge notu</span>
                <textarea
                  rows={2}
                  value={documentNote}
                  onChange={(event) => setDocumentNote(event.target.value)}
                  placeholder="Belge üretim notu (opsiyonel)"
                />
              </label>
            </section>
          </section>

          <aside className="invf-form-side">
            <section className="invf-side-card" aria-label="Özet">
              <header className="invf-side-card__head">
                <h3>Özet</h3>
              </header>
              <ul className="invf-side-list">
                <li>
                  <span>Cari</span>
                  <strong>{selectedCustomerName}</strong>
                </li>
                <li>
                  <span>Sipariş</span>
                  <strong>{selectedOrder?.orderNo ?? "—"}</strong>
                </li>
                <li>
                  <span>Fatura tarihi</span>
                  <strong>{invoiceDate || "—"}</strong>
                </li>
                <li>
                  <span>Vade</span>
                  <strong>{dueDate || "—"}</strong>
                </li>
              </ul>
            </section>

            <section className="invf-actions" aria-label="Form aksiyonları">
              <h3 className="invf-actions__title">İşlemler</h3>
              <div className="invf-actions__stack">
                <button type="button" className="invf-actions__btn invf-actions__btn--primary" onClick={handleDraftSave} disabled={draftSaved}>
                  {draftSaved ? "Taslak hazırlandı" : "Fatura taslağı hazırla"}
                </button>
                {orderId ? (
                  <Link href={`/siparisler/${orderId}`} className="invf-actions__link">
                    Siparişe dön
                  </Link>
                ) : null}
                <Link href="/faturalar" className="invf-actions__link invf-actions__link--muted">
                  Faturalar listesine dön
                </Link>
              </div>
              <p className="invf-actions__note">Kaydet canlı mutation çalıştırmaz. PDF/gönderim sonraki fazda bağlanacaktır.</p>
            </section>
          </aside>
        </main>
      </div>
    </section>
  );
}
