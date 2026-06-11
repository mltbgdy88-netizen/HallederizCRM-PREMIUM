"use client";

import Link from "next/link";
import type { Customer, Return } from "@hallederiz/types";
import { calculateReturnImpact } from "@hallederiz/domain";
import { useEffect, useMemo, useState } from "react";
import { dataSourceConfig } from "../../../lib/data-source";
import { getReturnDetail } from "../queries/get-returns";
import { getReturnStatusLabel } from "../queries/return-mock-data";
import { useToast } from "../../../providers/toast-provider";
import { getOrders } from "../../orders/queries/get-orders";
import {
  buildReturnHeaderMeta,
  buildReturnInfoFields,
  buildReturnReferenceKpis,
  evaluateReturnWindowFromIso,
  reasonCategoryLabel
} from "../utils/map-return-detail-to-reference";

export function ReturnHeaderInfo({
  returnRecord,
  customer,
  variant = "legacy"
}: {
  returnRecord: Return;
  customer: Customer | null;
  variant?: "legacy" | "reference";
}) {
  if (variant === "reference") {
    const fields = buildReturnInfoFields(returnRecord, customer);
    return (
      <section className="idf-section" aria-label="İade bilgileri">
        <header className="idf-section__head">
          <h2>İade bilgileri</h2>
          <span className="idf-badge idf-badge--info">{getReturnStatusLabel(returnRecord.status)}</span>
        </header>
        <div className="idf-field-grid">
          {fields.map((field) => (
            <label key={field.label} className={`idf-field${field.full ? " idf-field--full" : ""}`}>
              <span>{field.label}</span>
              <strong>{field.value}</strong>
            </label>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="hz-content-card hz-returns-detail-summary">
      <p className="drawer-eyebrow">İade</p>
      <h2>{returnRecord.returnNo}</h2>
      <p className="muted">
        {customer?.name ?? "—"} · {returnRecord.orderNo ?? returnRecord.deliveryNo ?? "Bağlantı seçilecek"}
      </p>
      <span className="hz-badge hz-badge-info">{getReturnStatusLabel(returnRecord.status)}</span>
    </section>
  );
}

export function ReturnActionsBar({ variant = "legacy" }: { variant?: "legacy" | "reference" }) {
  const { pushToast } = useToast();
  const [saved, setSaved] = useState(false);
  const [received, setReceived] = useState(false);
  const [finished, setFinished] = useState(false);

  function handleSave() {
    setSaved(true);
    pushToast("Taslak hazırlandı: iade kaydı oluşturma onay akışına iletildi.");
  }

  function handleReceive() {
    setReceived(true);
    pushToast("Taslak hazırlandı: teslim alındı kaydı onay akışına iletildi.");
  }

  function handleFinish() {
    setFinished(true);
    pushToast("Taslak hazırlandı: iade tamamlama onay akışına iletildi.");
  }

  function handleStockPreview() {
    pushToast("Taslak hazırlandı: stok geri giriş hareketi onay akışına iletilecek.");
  }

  if (variant === "reference") {
    return (
      <section className="idf-actions" aria-label="İade işlemleri">
        <h3 className="idf-actions__title">İşlemler</h3>
        <div className="idf-actions__grid">
          <button type="button" className="idf-actions__btn idf-actions__btn--primary" onClick={handleSave} disabled={saved}>
            {saved ? "Taslak hazırlandı" : "Kaydet"}
          </button>
          <button type="button" className="idf-actions__btn" onClick={() => pushToast("Taslak hazırlandı: iade onaya gönderildi.")}>
            Onaya gönder
          </button>
          <button type="button" className="idf-actions__btn" onClick={handleReceive} disabled={received}>
            {received ? "Alındı kaydedildi" : "Teslim alındı"}
          </button>
          <button type="button" className="idf-actions__btn" onClick={handleFinish} disabled={finished}>
            {finished ? "Tamamlandı" : "Tamamla"}
          </button>
          <button type="button" className="idf-actions__btn" disabled title="Stok hareketi sonraki fazda bağlanacak" onClick={handleStockPreview}>
            Stok önizleme
          </button>
          <button type="button" className="idf-actions__btn" onClick={() => pushToast("Taslak hazırlandı: iptal işlemi onay akışına iletildi.")}>
            İptal et
          </button>
        </div>
        <p className="idf-actions__note">Aksiyonlar demo/sonraki fazdır; canlı mutation bağlı değildir.</p>
      </section>
    );
  }

  return (
    <section className="hz-content-card hz-returns-detail-actions">
      <h3>İşlemler</h3>
      <p className="muted">İade onay ve tamamlama adımları mevcut iş akışıyla ilerler.</p>
      <div className="hz-inline-actions">
        <button className="hz-btn hz-btn-primary hz-toolbar-btn" type="button" onClick={handleSave} disabled={saved}>
          {saved ? "Taslak hazırlandı" : "Kaydet"}
        </button>
        <button className="hz-btn hz-btn-secondary hz-toolbar-btn" type="button" onClick={() => pushToast("Taslak hazırlandı: iade onaya gönderildi.")}>
          Onaya gönder
        </button>
        <button className="hz-btn hz-btn-secondary hz-toolbar-btn" type="button" onClick={handleReceive} disabled={received}>
          {received ? "Alındı kaydedildi" : "Teslim alındı"}
        </button>
        <button className="hz-btn hz-btn-secondary hz-toolbar-btn" type="button" onClick={handleFinish} disabled={finished}>
          {finished ? "Tamamlandı" : "Tamamla"}
        </button>
        <button className="hz-btn hz-btn-secondary hz-toolbar-btn" type="button" onClick={() => pushToast("Taslak hazırlandı: iptal işlemi onay akışına iletildi.")}>
          İptal et
        </button>
      </div>
    </section>
  );
}

export function ReturnLineTable({
  returnRecord,
  variant = "legacy"
}: {
  returnRecord: Return;
  variant?: "legacy" | "reference";
}) {
  if (variant === "reference") {
    return (
      <section className="idf-section" aria-label="İade satırları">
        <header className="idf-section__head">
          <h2>İade satırları</h2>
        </header>
        <div className="idf-table-wrap">
          <table className="idf-table">
            <thead>
              <tr>
                <th>Ürün kodu</th>
                <th>Ürün adı</th>
                <th>Adet</th>
                <th>Sebep</th>
                <th>Not</th>
              </tr>
            </thead>
            <tbody>
              {returnRecord.lines.length === 0 ? (
                <tr>
                  <td colSpan={5} className="idf-table__empty">
                    Satır kaydı yok.
                  </td>
                </tr>
              ) : (
                returnRecord.lines.map((line) => (
                  <tr key={line.id}>
                    <td>{line.productCode}</td>
                    <td>{line.productName}</td>
                    <td>{line.quantity}</td>
                    <td>{reasonCategoryLabel(line.reasonCategory)}</td>
                    <td>{line.note ?? "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    );
  }

  return (
    <section className="hz-content-card">
      <h3>İade satırları</h3>
      <div className="hz-filter-grid hz-margin-top-sm">
        <label>
          Sipariş / teslim
          <input readOnly value={returnRecord.orderNo ?? returnRecord.deliveryNo ?? ""} />
        </label>
        <label>
          Ürün
          <select defaultValue={returnRecord.lines[0]?.productCode ?? ""}>
            {returnRecord.lines.map((line) => (
              <option key={line.id}>{line.productCode}</option>
            ))}
          </select>
        </label>
        <label>
          Adet
          <input type="number" defaultValue={returnRecord.lines[0]?.quantity ?? 1} />
        </label>
        <label>
          Sebep
          <select defaultValue={returnRecord.lines[0]?.reasonCategory ?? "damaged"}>
            <option value="damaged">Hasar</option>
            <option value="wrong_product">Yanlış ürün</option>
            <option value="quality">Kalite</option>
            <option value="customer_request">Müşteri talebi</option>
          </select>
        </label>
        <label>
          Not
          <input defaultValue={returnRecord.note ?? ""} />
        </label>
      </div>
    </section>
  );
}

export function ReturnImpactPanel({
  returnRecord,
  variant = "legacy"
}: {
  returnRecord: Return;
  variant?: "legacy" | "reference";
}) {
  const impact = calculateReturnImpact(returnRecord);

  if (variant === "reference") {
    return (
      <section className="idf-section" aria-label="Stok ve finans etkisi">
        <header className="idf-section__head">
          <h2>Stok / finans etkisi</h2>
        </header>
        <ul className="idf-check-list">
          {impact.messages.map((message) => (
            <li key={message}>{message}</li>
          ))}
          <li>Belge etkisi: {impact.documentImpact}</li>
          <li>Onay gereksinimi: {impact.approvalRequired ? "Evet" : "Hayır"}</li>
        </ul>
      </section>
    );
  }

  return (
    <section className="hz-content-card">
      <h3>İade etkisi</h3>
      <ul className="hz-side-list">
        {impact.messages.map((message) => (
          <li key={message}>{message}</li>
        ))}
        <li>Belge etkisi: {impact.documentImpact}</li>
      </ul>
    </section>
  );
}

function ReturnReferenceKpiStrip({ kpis }: { kpis: ReturnType<typeof buildReturnReferenceKpis> }) {
  return (
    <section className="idf-kpi-strip idf-kpi-strip--six" aria-label="İade özeti">
      {kpis.map((kpi) => (
        <div
          key={kpi.id}
          className={`idf-kpi${kpi.tone === "success" ? " idf-kpi--success" : kpi.tone === "warning" ? " idf-kpi--warning" : ""}`}
        >
          <span className="idf-kpi__label">{kpi.label}</span>
          <span className="idf-kpi__value">{kpi.value}</span>
          {kpi.hint ? <span className="idf-kpi__hint">{kpi.hint}</span> : null}
        </div>
      ))}
    </section>
  );
}

export function ReturnDetailPage({ returnId }: { returnId: string }) {
  const [returnRecord, setReturnRecord] = useState<Return | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orderCreatedAt, setOrderCreatedAt] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getReturnDetail(returnId)
      .then((result) => {
        if (!mounted) return;
        setReturnRecord(result.returnRecord);
        setCustomers(result.customers);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [returnId]);

  useEffect(() => {
    if (!returnRecord?.orderId) return;
    let active = true;
    getOrders().then((result) => {
      if (!active) return;
      const order = result.orders.find((item) => item.id === returnRecord.orderId);
      setOrderCreatedAt(order?.createdAt);
    });
    return () => {
      active = false;
    };
  }, [returnRecord?.orderId]);

  const customer = useMemo(
    () => customers.find((item) => item.id === returnRecord?.customerId) ?? null,
    [customers, returnRecord?.customerId]
  );

  const kpis = useMemo(() => (returnRecord ? buildReturnReferenceKpis(returnRecord) : []), [returnRecord]);
  const returnWindow = useMemo(() => evaluateReturnWindowFromIso(orderCreatedAt), [orderCreatedAt]);
  const impact = useMemo(() => (returnRecord ? calculateReturnImpact(returnRecord) : null), [returnRecord]);

  if (loading) {
    return (
      <section className="idf-page hz-returns-detail-page">
        <div className="idf-state" role="status" aria-live="polite">
          <div className="idf-state__spinner" aria-hidden />
          <h2>İade yükleniyor</h2>
          <p>Satırlar ve etki paneli hazırlanıyor.</p>
        </div>
      </section>
    );
  }

  if (!returnRecord) {
    return (
      <section className="idf-page hz-returns-detail-page">
        <div className="idf-state" role="alert">
          <h2>İade bulunamadı</h2>
          <p>Seçilen iade kaydı bulunamadı veya erişim kapsamında değil.</p>
          <Link href="/iadeler" className="idf-state__link">
            İadeler listesine dön
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="idf-page hz-returns-detail-page">
      <div className="idf-shell">
        <header className="idf-header">
          <div className="idf-header__main">
            <p className="idf-header__eyebrow">İadeler</p>
            <h1>İade Detayı</h1>
            <p className="idf-header__meta">{buildReturnHeaderMeta(returnRecord, customer)}</p>
          </div>
          <Link href="/iadeler" className="idf-header__back">
            ← Listeye dön
          </Link>
        </header>

        {dataSourceConfig.useDemoData ? (
          <p className="idf-demo-band" role="status">
            Örnek veri modu: bu kayıt demo amaçlıdır; kaydet, tamamla veya stok hareketi canlıda bağlı değildir.
          </p>
        ) : null}

        {returnRecord.orderId && returnWindow === "expired" ? (
          <p className="idf-warning-band idf-warning-band--inline" role="status">
            Bu iadenin bağlı sipariş tarihinden itibaren 15 gün geçmiş olabilir. Yetkili onayı gerekebilir; karar
            mutation değildir.
          </p>
        ) : null}

        {returnRecord.orderId && returnWindow === "unknown" ? (
          <p className="idf-info-band" role="status">
            15 gün iade kontrolü, sipariş satış tarihi yüklendiğinde kesinleşir.
          </p>
        ) : null}

        <ReturnReferenceKpiStrip kpis={kpis} />

        <main className="idf-layout">
          <section className="idf-main">
            <ReturnHeaderInfo returnRecord={returnRecord} customer={customer} variant="reference" />
            <ReturnLineTable returnRecord={returnRecord} variant="reference" />
            <ReturnImpactPanel returnRecord={returnRecord} variant="reference" />
            {returnRecord.note ? (
              <section className="idf-section" aria-label="İade açıklaması">
                <header className="idf-section__head">
                  <h2>İade nedeni / açıklama</h2>
                </header>
                <p className="idf-section__desc">{returnRecord.note}</p>
              </section>
            ) : null}
          </section>
          <aside className="idf-side">
            <section className="idf-side-card" aria-label="Durum paneli">
              <header className="idf-side-card__head">
                <h3>Durum</h3>
                <span className="idf-badge idf-badge--info">{getReturnStatusLabel(returnRecord.status)}</span>
              </header>
              <ul className="idf-side-list">
                <li>
                  <span>İade durumu</span>
                  <strong>{getReturnStatusLabel(returnRecord.status)}</strong>
                </li>
                <li>
                  <span>Onay</span>
                  <strong>{impact?.approvalRequired ? "Gerekli" : "Standart"}</strong>
                </li>
              </ul>
            </section>

            <section className="idf-side-card" aria-label="Cari paneli">
              <header className="idf-side-card__head">
                <h3>Cari</h3>
              </header>
              <ul className="idf-side-list">
                <li>
                  <span>Ad</span>
                  <strong>{customer?.name ?? "—"}</strong>
                </li>
              </ul>
            </section>

            <section className="idf-side-card" aria-label="İlişkili sipariş">
              <header className="idf-side-card__head">
                <h3>Sipariş</h3>
              </header>
              <ul className="idf-side-list">
                <li>
                  <span>Sipariş no</span>
                  <strong>{returnRecord.orderNo ?? "—"}</strong>
                </li>
                <li>
                  <span>Teslim no</span>
                  <strong>{returnRecord.deliveryNo ?? "—"}</strong>
                </li>
              </ul>
              {returnRecord.orderId ? (
                <Link href={`/siparisler/${returnRecord.orderId}`} className="idf-side-link">
                  Sipariş detayına git
                </Link>
              ) : null}
            </section>

            <section className="idf-side-card" aria-label="Stok geri giriş">
              <header className="idf-side-card__head">
                <h3>Stok geri giriş</h3>
              </header>
              <ul className="idf-side-list">
                <li>
                  <span>Etki</span>
                  <strong>{impact && impact.stockImpact > 0 ? `${impact.stockImpact} adet` : "—"}</strong>
                </li>
                <li>
                  <span>Lokasyon</span>
                  <strong>Depo akışı (placeholder)</strong>
                </li>
                <li>
                  <span>Hareket</span>
                  <strong>Oluşturulmadı</strong>
                </li>
              </ul>
              <p className="idf-side-note">Stok hareketi onay sonrası depo modülüne bağlanacaktır.</p>
            </section>

            <ReturnActionsBar variant="reference" />
          </aside>
        </main>
      </div>
    </section>
  );
}
