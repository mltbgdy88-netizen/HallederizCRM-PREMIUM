"use client";

import Link from "next/link";
import { useFaturalarYeniFormReferenceData } from "@/features/faturalar/hooks/use-faturalar-yeni-form-reference-data";

export function FaturalarYeniFormPage() {
  const {
    data: {
      page: FYF_PAGE,
      actions: FYF_ACTIONS,
      cari: FYF_CARI,
      invoice: FYF_INVOICE,
      other: FYF_OTHER,
      lineColumns: FYF_LINE_COLUMNS,
      lines: FYF_LINES,
      lineActions: FYF_LINE_ACTIONS,
      vatRows: FYF_VAT_ROWS,
      totals: FYF_TOTALS,
      info: FYF_INFO
    }
  } = useFaturalarYeniFormReferenceData();

  return (
    <div className="fyf-home">
      <header className="fyf-head">
        <div className="fyf-head-copy">
          <Link href="/faturalar" className="fyf-back" aria-label="Faturalara dön">
            ←
          </Link>
          <div>
            <h1>{FYF_PAGE.title}</h1>
            <p>{FYF_PAGE.subtitle}</p>
          </div>
        </div>
        <div className="fyf-head-actions">
          <button type="button" className="fyf-btn fyf-btn--outline">
            {FYF_ACTIONS.draft}
          </button>
          <button type="button" className="fyf-btn fyf-btn--outline">
            {FYF_ACTIONS.preview}
          </button>
          <button type="button" className="fyf-btn fyf-btn--primary">
            {FYF_ACTIONS.create}
          </button>
        </div>
      </header>

      <div className="fyf-scroll">
        <div className="fyf-top-grid">
          <section className="fyf-card">
            <h2>{FYF_CARI.title}</h2>
            {FYF_CARI.fields.map((field) => (
              <label key={field.label} className="fyf-field">
                <span>{field.label}</span>
                {field.type === "textarea" ? (
                  <textarea readOnly rows={2} aria-label={field.label} />
                ) : field.type === "select" ? (
                  <select defaultValue="" aria-label={field.label}>
                    <option value="">{field.placeholder}</option>
                  </select>
                ) : (
                  <input type="text" readOnly aria-label={field.label} />
                )}
              </label>
            ))}
          </section>

          <section className="fyf-card">
            <h2>{FYF_INVOICE.title}</h2>
            {FYF_INVOICE.fields.map((field) => (
              <label key={field.label} className="fyf-field">
                <span>{field.label}</span>
                <input type="text" readOnly defaultValue={field.value} aria-label={field.label} />
              </label>
            ))}
          </section>

          <section className="fyf-card">
            <h2>{FYF_OTHER.title}</h2>
            {FYF_OTHER.fields.map((field) => (
              <label key={field.label} className="fyf-field">
                <span>{field.label}</span>
                <input type="text" readOnly placeholder={field.placeholder} aria-label={field.label} />
              </label>
            ))}
          </section>
        </div>

        <section className="fyf-card fyf-card--lines">
          <h2>Fatura Satırları</h2>
          <div className="fyf-lines-wrap">
            <table className="fyf-lines-table">
              <thead>
                <tr>
                  {FYF_LINE_COLUMNS.map((col) => (
                    <th key={col}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FYF_LINES.map((line) => (
                  <tr key={line.no}>
                    <td>{line.no}</td>
                    <td>
                      <select defaultValue="" aria-label="Ürün">
                        <option>{line.product}</option>
                      </select>
                    </td>
                    <td>
                      <input type="text" readOnly defaultValue={line.description} aria-label="Açıklama" />
                    </td>
                    <td>
                      <input type="text" readOnly defaultValue={line.qty} aria-label="Miktar" />
                    </td>
                    <td>
                      <select defaultValue={line.unit} aria-label="Birim">
                        <option>{line.unit}</option>
                      </select>
                    </td>
                    <td>
                      <input type="text" readOnly defaultValue={line.price} aria-label="Birim fiyat" />
                    </td>
                    <td>
                      <input type="text" readOnly defaultValue={line.discountPct} aria-label="İskonto yüzde" />
                    </td>
                    <td>{line.discountAmt}</td>
                    <td>
                      <select defaultValue={line.vatRate} aria-label="KDV">
                        <option>{line.vatRate}</option>
                      </select>
                    </td>
                    <td>{line.vatAmt}</td>
                    <td>{line.total}</td>
                    <td>
                      <button type="button" className="fyf-trash" aria-label="Satırı sil">
                        <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
                          <path d="M3 6h18M8 6V4h8v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="fyf-line-actions">
            {FYF_LINE_ACTIONS.map((label) => (
              <button key={label} type="button" className="fyf-mini-btn">
                {label}
              </button>
            ))}
          </div>
        </section>

        <footer className="fyf-footer">
          <p className="fyf-info">{FYF_INFO}</p>
          <table className="fyf-vat-table">
            <thead>
              <tr>
                <th>KDV</th>
                <th>Vergi Matrahı</th>
                <th>KDV Tutarı</th>
              </tr>
            </thead>
            <tbody>
              {FYF_VAT_ROWS.map((row) => (
                <tr key={row.rate}>
                  <td>{row.rate}</td>
                  <td>{row.base}</td>
                  <td>{row.vat}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <dl className="fyf-totals">
            <div>
              <dt>Ara Toplam</dt>
              <dd>{FYF_TOTALS.subtotal}</dd>
            </div>
            <div>
              <dt>Toplam İskonto</dt>
              <dd>{FYF_TOTALS.discount}</dd>
            </div>
            <div>
              <dt>Vergi Matrahı</dt>
              <dd>{FYF_TOTALS.taxBase}</dd>
            </div>
            <div>
              <dt>Toplam KDV</dt>
              <dd>{FYF_TOTALS.totalVat}</dd>
            </div>
            <div className="fyf-totals-grand">
              <dt>Genel Toplam</dt>
              <dd>{FYF_TOTALS.grand}</dd>
            </div>
          </dl>
        </footer>
      </div>
    </div>
  );
}
