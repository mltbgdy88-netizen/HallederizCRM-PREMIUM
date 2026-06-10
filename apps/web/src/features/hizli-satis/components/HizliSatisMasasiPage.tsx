"use client";

import {
  HSM_APPROVAL,
  HSM_DOC_ACTIONS,
  HSM_FOOTER_ACTIONS,
  HSM_FORM,
  HSM_HEADER_ACTIONS,
  HSM_INFO_BANNERS,
  HSM_LINES,
  HSM_PAYMENT,
  HSM_SUBTITLE,
  HSM_SUMMARY,
  HSM_TITLE
} from "@/features/hizli-satis/data/hizli-satis-masasi-mock";
import { IconSearch } from "@/components/reference/icons";

function HeaderActionIcon({ kind }: { kind: (typeof HSM_HEADER_ACTIONS)[number]["icon"] }) {
  const props = {
    className: "hsm-btn-icon",
    width: 14,
    height: 14,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    "aria-hidden": true as const
  };
  if (kind === "eye") {
    return (
      <svg {...props}>
        <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }
  if (kind === "plus") {
    return (
      <svg {...props}>
        <path d="M12 5v14M5 12h14" />
      </svg>
    );
  }
  return (
    <svg {...props}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16l8-4 8 4V4a2 2 0 0 0-2-2z" />
    </svg>
  );
}

function FooterActionIcon({ kind }: { kind: (typeof HSM_FOOTER_ACTIONS)[number]["icon"] }) {
  const props = {
    className: "hsm-footer-icon",
    width: 15,
    height: 15,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    "aria-hidden": true as const
  };
  switch (kind) {
    case "cancel":
      return (
        <svg {...props}>
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      );
    case "save":
      return (
        <svg {...props}>
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
          <path d="M17 21v-8H7v8M7 3v5h8" />
        </svg>
      );
    case "doc":
      return (
        <svg {...props}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16l8-4 8 4V4a2 2 0 0 0-2-2z" />
        </svg>
      );
    case "wallet":
      return (
        <svg {...props}>
          <path d="M21 12V7H5a2 2 0 0 1 0-4h14v2" />
          <path d="M3 7v10a2 2 0 0 0 2 2h16v-5" />
          <path d="M18 12a2 2 0 0 0 0 4h4v-4h-4z" />
        </svg>
      );
    default:
      return (
        <svg {...props}>
          <path d="m22 2-7 20-4-9-9-4 20-7z" />
        </svg>
      );
  }
}

function RowActionIcons() {
  return (
    <span className="hsm-row-actions">
      <button type="button" className="hsm-row-btn" aria-label="Düzenle">
        <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
          <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
        </svg>
      </button>
      <button type="button" className="hsm-row-btn hsm-row-btn--danger" aria-label="Sil">
        <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
          <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
        </svg>
      </button>
    </span>
  );
}

export function HizliSatisMasasiPage() {
  return (
    <div className="hsm-home">
      <header className="hsm-head">
        <div className="hsm-head-text">
          <h1>{HSM_TITLE}</h1>
          <p>{HSM_SUBTITLE}</p>
        </div>
        <div className="hsm-head-actions">
          {HSM_HEADER_ACTIONS.map((action) => (
            <button key={action.id} type="button" className="hsm-btn hsm-btn--outline">
              <HeaderActionIcon kind={action.icon} />
              {action.label}
            </button>
          ))}
        </div>
      </header>

      <section className="hsm-form-block" aria-label="Fiş bilgileri">
        <div className="hsm-form-row">
          <label className="hsm-field hsm-field--grow">
            <span>{HSM_FORM.customerLabel}</span>
            <span className="hsm-input-wrap">
              <IconSearch className="hsm-input-icon" />
              <input type="search" placeholder={HSM_FORM.customerPlaceholder} readOnly aria-label={HSM_FORM.customerLabel} />
            </span>
            <button type="button" className="hsm-field-link">
              {HSM_FORM.newCustomerLink}
            </button>
          </label>
          <label className="hsm-field">
            <span>{HSM_FORM.phoneLabel}</span>
            <span className="hsm-input-wrap">
              <svg className="hsm-input-icon" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <input type="text" defaultValue={HSM_FORM.phoneValue} readOnly aria-label={HSM_FORM.phoneLabel} />
            </span>
          </label>
          <label className="hsm-field">
            <span>{HSM_FORM.repLabel}</span>
            <span className="hsm-input-wrap hsm-input-wrap--select">
              <svg className="hsm-input-icon" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <select defaultValue="demo" aria-label={HSM_FORM.repLabel}>
                <option value="demo">{HSM_FORM.repValue}</option>
              </select>
            </span>
          </label>
          <label className="hsm-field">
            <span>{HSM_FORM.warehouseLabel}</span>
            <span className="hsm-input-wrap hsm-input-wrap--select">
              <svg className="hsm-input-icon" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <path d="M9 22V12h6v10" />
              </svg>
              <select defaultValue="center" aria-label={HSM_FORM.warehouseLabel}>
                <option value="center">{HSM_FORM.warehouseValue}</option>
              </select>
            </span>
          </label>
        </div>
        <div className="hsm-banners">
          {HSM_INFO_BANNERS.map((text) => (
            <p key={text} className="hsm-banner" role="status">
              {text}
            </p>
          ))}
        </div>
      </section>

      <div className="hsm-workspace">
        <section className="hsm-table-panel" aria-label="Ürün ve hizmet satırları">
          <div className="hsm-table-wrap">
            <table className="hsm-table">
              <thead>
                <tr>
                  <th className="hsm-th-drag" aria-label="Sıra" />
                  <th>Kod</th>
                  <th>Ürün / Hizmet</th>
                  <th>Birim</th>
                  <th>Miktar</th>
                  <th>Kaynak</th>
                  <th>Depo</th>
                  <th>Raf</th>
                  <th>Birim Fiyat</th>
                  <th>KDV</th>
                  <th>Tutar</th>
                  <th>İşlem</th>
                </tr>
              </thead>
              <tbody>
                {HSM_LINES.map((row) => (
                  <tr key={row.id}>
                    <td className="hsm-cell-drag">
                      <span className="hsm-drag" aria-hidden>
                        ⋮⋮
                      </span>
                    </td>
                    <td className="hsm-cell-code">{row.code}</td>
                    <td className="hsm-cell-product">{row.product}</td>
                    <td>{row.unit}</td>
                    <td>{row.qty}</td>
                    <td>{row.source}</td>
                    <td>{row.warehouse}</td>
                    <td>{row.shelf}</td>
                    <td className="hsm-cell-num">{row.unitPrice}</td>
                    <td>{row.vat}</td>
                    <td className="hsm-cell-num hsm-cell-total">{row.total}</td>
                    <td>
                      <RowActionIcons />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="hsm-table-foot">
            <button type="button" className="hsm-btn hsm-btn--outline hsm-btn--sm">
              + Ürün / Hizmet Ekle
            </button>
            <button type="button" className="hsm-btn hsm-btn--outline hsm-btn--sm">
              Excel&apos;den Yükle
            </button>
          </div>
        </section>

        <aside className="hsm-rail" aria-label="Özet ve ödeme">
          <article className="hsm-card">
            <h2>Toplam Özeti</h2>
            <ul className="hsm-summary-list">
              {HSM_SUMMARY.map((row) => (
                <li key={row.label} className={row.highlight ? "hsm-summary-row--total" : undefined}>
                  <span>{row.label}</span>
                  <strong>{row.value}</strong>
                </li>
              ))}
            </ul>
          </article>

          <article className="hsm-card">
            <h2>Ödeme Bilgisi</h2>
            <label className="hsm-rail-field">
              <span>{HSM_PAYMENT.methodLabel}</span>
              <select defaultValue="havale" aria-label={HSM_PAYMENT.methodLabel}>
                <option value="havale">{HSM_PAYMENT.methodValue}</option>
              </select>
            </label>
            <label className="hsm-rail-field">
              <span>{HSM_PAYMENT.dueLabel}</span>
              <input type="text" defaultValue={HSM_PAYMENT.dueValue} readOnly aria-label={HSM_PAYMENT.dueLabel} />
            </label>
            <label className="hsm-rail-field">
              <span>{HSM_PAYMENT.amountLabel}</span>
              <input type="text" defaultValue={HSM_PAYMENT.amountValue} readOnly aria-label={HSM_PAYMENT.amountLabel} />
            </label>
          </article>

          <article className="hsm-card hsm-card--status">
            <h2>{HSM_APPROVAL.title}</h2>
            <p className="hsm-status-line">
              {HSM_APPROVAL.statusLabel}{" "}
              <span className="hsm-badge">{HSM_APPROVAL.statusValue}</span>
            </p>
            <p className="hsm-status-line">
              {HSM_APPROVAL.approverLabel} {HSM_APPROVAL.approverValue}
            </p>
            <p className="hsm-status-line">
              {HSM_APPROVAL.dateLabel} {HSM_APPROVAL.dateValue}
            </p>
          </article>

          <div className="hsm-doc-actions">
            {HSM_DOC_ACTIONS.map((action) => (
              <button key={action.id} type="button" className="hsm-btn hsm-btn--outline hsm-btn--block">
                {action.label}
              </button>
            ))}
          </div>
        </aside>
      </div>

      <footer className="hsm-footer" aria-label="Fiş işlemleri">
        {HSM_FOOTER_ACTIONS.map((action) => (
          <button
            key={action.id}
            type="button"
            className={`hsm-footer-btn hsm-footer-btn--${action.tone}`}
          >
            <FooterActionIcon kind={action.icon} />
            {action.label}
          </button>
        ))}
      </footer>
    </div>
  );
}

