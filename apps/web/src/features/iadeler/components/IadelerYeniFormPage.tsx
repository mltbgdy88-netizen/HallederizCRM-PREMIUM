"use client";

import Link from "next/link";
import { useIadelerYeniFormReferenceData } from "@/features/iadeler/hooks/use-iadeler-yeni-form-reference-data";

export function IadelerYeniFormPage() {
  const {
    data: {
      page: IYF_PAGE,
      steps: IYF_STEPS,
      order: IYF_ORDER,
      lines: IYF_LINES,
      selectedTotal: IYF_SELECTED_TOTAL,
      info: IYF_INFO,
      warn: IYF_WARN,
      why: IYF_WHY,
      preview: IYF_PREVIEW
    }
  } = useIadelerYeniFormReferenceData();

  return (
    <div className="iyf-home">
      <header className="iyf-head">
        <nav className="iyf-crumb" aria-label="Konum">
          {IYF_PAGE.breadcrumb.map((part, i) => (
            <span key={part}>
              {i > 0 ? <span className="iyf-crumb-sep">›</span> : null}
              <span className={i === IYF_PAGE.breadcrumb.length - 1 ? "iyf-crumb-current" : ""}>{part}</span>
            </span>
          ))}
        </nav>
        <div className="iyf-head-actions">
          <Link href="/iadeler" className="iyf-btn iyf-btn--outline">
            {IYF_PAGE.cancel}
          </Link>
          <button type="button" className="iyf-btn iyf-btn--primary">
            {IYF_PAGE.save}
          </button>
        </div>
      </header>

      <ol className="iyf-steps" aria-label="İade adımları">
        {IYF_STEPS.map((step, index) => (
          <li key={step} className={index === 0 ? "iyf-step iyf-step--active" : "iyf-step"}>
            <span className="iyf-step-num">{index + 1}</span>
            <span>{step}</span>
          </li>
        ))}
      </ol>

      <div className="iyf-body">
        <div className="iyf-main">
          <section className="iyf-card">
            <h2>{IYF_ORDER.title}</h2>
            <dl className="iyf-order-grid">
              {IYF_ORDER.fields.map((field) => (
                <div key={field.label}>
                  <dt>{field.label}</dt>
                  <dd>{field.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="iyf-card iyf-card--table">
            <h2>Sipariş Satırları</h2>
            <div className="iyf-table-wrap">
              <table className="iyf-table">
                <thead>
                  <tr>
                    <th />
                    <th>Ürün</th>
                    <th>Varyant</th>
                    <th>Birim Fiyat</th>
                    <th>Sipariş Miktarı</th>
                    <th>İade Edilebilir</th>
                    <th>İade Miktarı</th>
                    <th>Birim</th>
                    <th>Toplam İade Tutarı</th>
                  </tr>
                </thead>
                <tbody>
                  {IYF_LINES.map((line) => (
                    <tr key={line.id}>
                      <td>
                        <input type="checkbox" defaultChecked={line.selected} readOnly aria-label={`${line.name} seç`} />
                      </td>
                      <td>
                        <span className="iyf-product-code">{line.code}</span>
                        <span className="iyf-product-name">{line.name}</span>
                      </td>
                      <td>{line.variant}</td>
                      <td>{line.unitPrice}</td>
                      <td>{line.orderQty}</td>
                      <td>{line.returnable}</td>
                      <td>
                        <input type="text" readOnly defaultValue={line.returnQty} aria-label="İade miktarı" />
                      </td>
                      <td>{line.unit}</td>
                      <td>{line.lineTotal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="iyf-table-foot">
              <button type="button" className="iyf-link-btn">
                Tümünü Seç
              </button>
              <button type="button" className="iyf-link-btn">
                Seçimi Temizle
              </button>
              <strong>{IYF_SELECTED_TOTAL}</strong>
            </div>
            <p className="iyf-info">{IYF_INFO}</p>
            <p className="iyf-warn">{IYF_WARN}</p>
          </section>
        </div>

        <aside className="iyf-aside">
          <section className="iyf-card">
            <h3>{IYF_WHY.title}</h3>
            <ul className="iyf-why-list">
              {IYF_WHY.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </section>

          <section className="iyf-card iyf-preview">
            <h3>{IYF_PREVIEW.title}</h3>
            <label className="iyf-field">
              <span>Hedef Depo</span>
              <select defaultValue="merkez" aria-label="Hedef depo">
                <option value="merkez">{IYF_PREVIEW.warehouse}</option>
              </select>
            </label>
            <dl className="iyf-preview-stats">
              {IYF_PREVIEW.stats.map((stat) => (
                <div key={stat.label}>
                  <dt>{stat.label}</dt>
                  <dd>{stat.value}</dd>
                </div>
              ))}
            </dl>
            <ul className="iyf-preview-details">
              {IYF_PREVIEW.details.map((detail) => (
                <li key={detail}>{detail}</li>
              ))}
            </ul>
            <button type="button" className="iyf-btn iyf-btn--primary iyf-btn--block">
              {IYF_PREVIEW.continue} →
            </button>
            <p className="iyf-continue-hint">{IYF_PREVIEW.continueHint}</p>
          </section>
        </aside>
      </div>
    </div>
  );
}

