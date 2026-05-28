"use client";

import Link from "next/link";
import { useTeslimatlarYeniFormReferenceData } from "@/features/teslimatlar/hooks/use-teslimatlar-yeni-form-reference-data";

function IconTruck() {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M1 3h15v13H1zM16 8h4l3 4v4h-7V8z" />
      <circle cx="6" cy="18" r="2" />
      <circle cx="18" cy="18" r="2" />
    </svg>
  );
}

export function TeslimatlarYeniFormPage() {
  const {
    data: {
      form: TSYF_FORM,
      topFields: TSYF_TOP_FIELDS,
      productRow: TSYF_PRODUCT_ROW,
      summary: TSYF_SUMMARY,
      salesLink: TSYF_SALES_LINK,
      actions: TSYF_ACTIONS
    }
  } = useTeslimatlarYeniFormReferenceData();

  return (
    <div className="tsyf-home">
      <article className="tsyf-card">
        <header className="tsyf-head">
          <div className="tsyf-head-icon">
            <IconTruck />
          </div>
          <h1>{TSYF_FORM.title}</h1>
          <p>{TSYF_FORM.subtitle}</p>
          <div className="tsyf-divider" aria-hidden />
        </header>

        <div className="tsyf-body">
          <div className="tsyf-grid-4">
            {TSYF_TOP_FIELDS.map((field) => (
              <div key={field.id} className="tsyf-field">
                <span>{field.label}</span>
                {"value" in field ? (
                  <input type="text" readOnly defaultValue={field.value} aria-label={field.label} />
                ) : (
                  <select defaultValue="" aria-label={field.label}>
                    <option value="">{field.placeholder}</option>
                  </select>
                )}
                {"addLabel" in field ? (
                  <button type="button" className="tsyf-add-btn">
                    {field.addLabel}
                  </button>
                ) : null}
              </div>
            ))}
          </div>

          <section className="tsyf-products" aria-label="Teslimat ürünleri">
            <h2>Teslimat Ürünleri</h2>
            <div className="tsyf-table-wrap">
              <table className="tsyf-table">
                <thead>
                  <tr>
                    <th>Ürün</th>
                    <th>Merkez Stok</th>
                    <th>Miktar</th>
                    <th>Birim</th>
                    <th>Birim Fiyat</th>
                    <th>Toplam</th>
                    <th>Aksiyon</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <select defaultValue="" aria-label="Ürün">
                        <option value="">{TSYF_PRODUCT_ROW.product}</option>
                      </select>
                    </td>
                    <td>{TSYF_PRODUCT_ROW.stock}</td>
                    <td>
                      <input type="text" readOnly placeholder={TSYF_PRODUCT_ROW.quantity} aria-label="Miktar" />
                    </td>
                    <td>
                      <select defaultValue="" aria-label="Birim">
                        <option value="">{TSYF_PRODUCT_ROW.unit}</option>
                      </select>
                    </td>
                    <td>
                      <input type="text" readOnly defaultValue={TSYF_PRODUCT_ROW.unitPrice} aria-label="Birim fiyat" />
                    </td>
                    <td>{TSYF_PRODUCT_ROW.total}</td>
                    <td>
                      <button type="button" className="tsyf-add-row" aria-label="Satırı sil">
                        Sil
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <button type="button" className="tsyf-add-row">
              + Satır Ekle
            </button>
          </section>

          <div className="tsyf-bottom">
            <label className="tsyf-textarea">
              <span>Açıklama</span>
              <textarea readOnly placeholder="Teslimat hakkında not ekleyin..." rows={3} aria-label="Açıklama" />
            </label>
            <label className="tsyf-field">
              <span>{TSYF_SALES_LINK.label}</span>
              <select defaultValue="" aria-label={TSYF_SALES_LINK.label}>
                <option value="">{TSYF_SALES_LINK.placeholder}</option>
              </select>
              <small>{TSYF_SALES_LINK.hint}</small>
            </label>
            <div className="tsyf-summary">
              <div>
                <span>Ara Toplam</span>
                <strong>{TSYF_SUMMARY.subtotal}</strong>
              </div>
              <div>
                <span>KDV (%20)</span>
                <strong>{TSYF_SUMMARY.vat}</strong>
              </div>
              <div className="tsyf-grand">
                <span>Genel Toplam</span>
                <strong>{TSYF_SUMMARY.grand}</strong>
              </div>
            </div>
          </div>
        </div>

        <footer className="tsyf-foot">
          <Link href="/teslimatlar" className="tsyf-btn tsyf-btn--ghost">
            {TSYF_ACTIONS.cancel}
          </Link>
          <button type="button" className="tsyf-btn tsyf-btn--primary">
            {TSYF_ACTIONS.submit}
          </button>
        </footer>
      </article>
    </div>
  );
}
