"use client";

import Link from "next/link";
import type { ThdmInvoiceStatus } from "@/features/tahsilatlar/data/tahsilatlar-detay-mock";
import { useTahsilatlarDetayReferenceData } from "@/features/tahsilatlar/hooks/use-tahsilatlar-detay-reference-data";
import { IconChevronDown } from "@/components/reference/icons";
import { useToast } from "@/providers/toast-provider";

function BtnIcon({ kind }: { kind: "plus" | "print" | "more" }) {
  const props = {
    className: "thdm-btn-icon",
    width: 14,
    height: 14,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    "aria-hidden": true as const
  };
  if (kind === "plus") {
    return (
      <svg {...props}>
        <path d="M12 5v14M5 12h14" />
      </svg>
    );
  }
  if (kind === "print") {
    return (
      <svg {...props}>
        <path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
        <rect x="6" y="14" width="12" height="7" />
      </svg>
    );
  }
  return (
    <svg {...props}>
      <circle cx="12" cy="6" r="1.25" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.25" fill="currentColor" stroke="none" />
      <circle cx="12" cy="18" r="1.25" fill="currentColor" stroke="none" />
    </svg>
  );
}

function invoiceStatusClass(status: ThdmInvoiceStatus): string {
  return status === "Ödendi" ? " thdm-inv-badge--paid" : " thdm-inv-badge--partial";
}

export function TahsilatlarDetayMasasiPage({ paymentId }: { paymentId?: string } = {}) {
  const { pushToast } = useToast();
  const { data } = useTahsilatlarDetayReferenceData(paymentId);
  const { demoBanner, page, summary, steps, info, receipt, invoices, distFooter, context, linked, overview, notes } =
    data;

  const demoAction = (label: string) => () => {
    pushToast(`${label} — demo modunda gerçek CRM işlemi yapılmaz.`);
  };

  return (
    <div className="thdm-home">
      {demoBanner ? (
        <p className="thdm-demo-banner" role="status">
          {demoBanner}
        </p>
      ) : null}
      <header className="thdm-head">
        <div className="thdm-head-copy">
          <nav className="thdm-crumb" aria-label="Konum">
            {page.breadcrumb.map((part, i) => (
              <span key={part}>
                {i > 0 ? <span className="thdm-crumb-sep">›</span> : null}
                <span className={i === page.breadcrumb.length - 1 ? "thdm-crumb-current" : ""}>{part}</span>
              </span>
            ))}
          </nav>
          <h1>{page.title}</h1>
        </div>
        <div className="thdm-head-actions">
          <Link href="/tahsilatlar/yeni" className="thdm-btn thdm-btn--primary">
            <BtnIcon kind="plus" />
            Yeni Tahsilat
          </Link>
          <button type="button" className="thdm-btn thdm-btn--outline" onClick={demoAction("Yazdır")}>
            <BtnIcon kind="print" />
            Yazdır
          </button>
          <button type="button" className="thdm-btn thdm-btn--outline" onClick={demoAction("Diğer işlemler")}>
            <BtnIcon kind="more" />
            Diğer İşlemler
            <IconChevronDown className="thdm-btn-chevron" />
          </button>
        </div>
      </header>

      <section className="thdm-summary" aria-label="Tahsilat özeti">
        <div>
          <span className="thdm-summary-label">Tahsilat No</span>
          <strong>{summary.number}</strong>
        </div>
        <div>
          <span className="thdm-summary-label">Tarih</span>
          <strong>{summary.date}</strong>
        </div>
        <div>
          <span className="thdm-summary-label">Cari</span>
          <strong>{summary.customer}</strong>
          <span className="thdm-summary-sub">{summary.customerCode}</span>
        </div>
        <div>
          <span className="thdm-summary-label">Tutar</span>
          <strong>{summary.amount}</strong>
        </div>
        <div>
          <span className="thdm-summary-label">Yöntem</span>
          <strong>{summary.method}</strong>
          <span className="thdm-summary-sub">{summary.methodDetail}</span>
        </div>
        <div>
          <span className="thdm-summary-label">Durum</span>
          <span className="thdm-status-badge">{summary.status}</span>
        </div>
      </section>

      <section className="thdm-stepper" aria-label="Tahsilat geçmişi">
        <h2 className="thdm-section-title">Tahsilat Geçmişi</h2>
        <ol className="thdm-steps">
          {steps.map((step, index) => (
            <li key={step.id} className={index === steps.length - 1 ? "thdm-step thdm-step--active" : "thdm-step"}>
              <span className="thdm-step-dot" aria-hidden />
              <div>
                <strong>{step.title}</strong>
                <span>
                  {step.time} · {step.actor}
                </span>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <div className="thdm-grid">
        <section className="thdm-panel" aria-labelledby="thdm-info-title">
          <h2 id="thdm-info-title">Tahsilat Bilgileri</h2>
          <dl className="thdm-fields">
            {info.map((field) => (
              <div key={field.label} className={"full" in field && field.full ? "thdm-field thdm-field--full" : "thdm-field"}>
                <dt>{field.label}</dt>
                <dd>{field.value}</dd>
              </div>
            ))}
          </dl>
          <div className="thdm-receipt">
            <span>{receipt.label}</span>
            <button type="button" className="thdm-receipt-link" onClick={demoAction("Dekont görüntüle")}>
              {receipt.fileName}
            </button>
          </div>
        </section>

        <section className="thdm-panel thdm-panel--table" aria-labelledby="thdm-dist-title">
          <h2 id="thdm-dist-title">Tahsilat Dağılımı</h2>
          <div className="thdm-table-wrap">
            <table className="thdm-table">
              <thead>
                <tr>
                  <th>Belge No</th>
                  <th>Tarih</th>
                  <th>Vade</th>
                  <th>Orijinal</th>
                  <th>Kalan</th>
                  <th>Tahsil</th>
                  <th>Durum</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((row) => (
                  <tr key={row.id}>
                    <td>{row.docNo}</td>
                    <td>{row.date}</td>
                    <td>{row.dueDate}</td>
                    <td>{row.original}</td>
                    <td>{row.remaining}</td>
                    <td>{row.collected}</td>
                    <td>
                      <span className={`thdm-inv-badge${invoiceStatusClass(row.status)}`}>{row.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <footer className="thdm-dist-foot">
            <div>
              <span>Toplam Tahsil</span>
              <strong>{distFooter.collected}</strong>
            </div>
            <div>
              <span>Toplam Orijinal</span>
              <strong>{distFooter.original}</strong>
            </div>
            <div>
              <span>Toplam Kalan</span>
              <strong>{distFooter.remaining}</strong>
            </div>
            <div>
              <span>Eşleşme Durumu</span>
              <strong>{distFooter.matchStatus}</strong>
            </div>
          </footer>
        </section>

        <aside className="thdm-aside">
          <section className="thdm-side-card" aria-labelledby="thdm-ctx-title">
            <h3 id="thdm-ctx-title">{context.title}</h3>
            <p className="thdm-side-customer">{context.customer}</p>
            <span className="thdm-side-badge">{context.status}</span>
            <dl className="thdm-side-dl">
              <div>
                <dt>Vergi No</dt>
                <dd>{context.taxId}</dd>
              </div>
              <div>
                <dt>Telefon</dt>
                <dd>{context.phone}</dd>
              </div>
              <div>
                <dt>E-posta</dt>
                <dd>{context.email}</dd>
              </div>
              <div className="thdm-side-dl--full">
                <dt>Adres</dt>
                <dd>{context.address}</dd>
              </div>
            </dl>
          </section>

          <section className="thdm-side-card" aria-labelledby="thdm-linked-title">
            <div className="thdm-side-head">
              <h3 id="thdm-linked-title">Tahsilata Bağlı Faturalar</h3>
              <button type="button" className="thdm-link-btn" onClick={demoAction("Bağlı faturalar")}>
                Tümünü Gör
              </button>
            </div>
            <ul className="thdm-linked-list">
              {linked.map((item) => (
                <li key={item.id}>
                  <span>{item.docNo}</span>
                  <strong>{item.amount}</strong>
                </li>
              ))}
            </ul>
          </section>

          <section className="thdm-side-card" aria-labelledby="thdm-overview-title">
            <h3 id="thdm-overview-title">Tahsilat Özeti</h3>
            <dl className="thdm-side-dl">
              {overview.map((row) => (
                <div key={row.label}>
                  <dt>{row.label}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        </aside>
      </div>

      <footer className="thdm-notes">
        <section className="thdm-notes-user" aria-label="Notlar">
          <h2>Notlar</h2>
          <textarea readOnly placeholder={notes.placeholder} rows={3} aria-label="Not" />
          <button type="button" className="thdm-btn thdm-btn--primary" onClick={demoAction(notes.saveLabel)}>
            {notes.saveLabel}
          </button>
        </section>
        <section className="thdm-notes-system" aria-label="Sistem notu">
          <h2>Sistem Notu</h2>
          <p>{notes.systemNote}</p>
        </section>
      </footer>
    </div>
  );
}

