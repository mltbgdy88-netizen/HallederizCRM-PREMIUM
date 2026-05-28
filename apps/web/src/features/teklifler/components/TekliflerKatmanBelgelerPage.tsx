"use client";

import { TeklifBadge } from "./TekliflerKatmanShared";
import { useTekliflerKatmanReferenceData } from "@/features/teklifler/hooks/use-teklifler-katman-reference-data";

function PdfIcon() {
  return (
    <span className="tkm-pdf-icon" aria-hidden>
      <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M7 3h7l5 5v13H7z" />
        <path d="M14 3v5h5" />
        <path d="M9 12h6M9 16h4" />
      </svg>
    </span>
  );
}

export function TekliflerKatmanBelgelerPage() {
  const { data } = useTekliflerKatmanReferenceData();
  const { header, layer } = data;

  return (
    <div className="tkm-home tkm-home--belgeler">
      <header className="tkm-page-head">
        <div className="tkm-page-head-top">
          <nav className="tkm-breadcrumb" aria-label="Breadcrumb">
            {header.breadcrumb.map((part, i) => (
              <span key={part}>
                {i > 0 ? <span className="tkm-breadcrumb-sep">/</span> : null}
                {part}
              </span>
            ))}
          </nav>
          <div className="tkm-head-actions">
            <a className="tkm-back" href="/teklifler">
              ← Geri Dön
            </a>
            <button type="button" className="tkm-btn tkm-btn--outline">
              Düzenle
            </button>
            <button type="button" className="tkm-btn tkm-btn--outline">
              Yazdır
            </button>
            <button type="button" className="tkm-btn tkm-btn--outline" aria-label="Diğer">
              ···
            </button>
            <button type="button" className="tkm-btn tkm-btn--primary">
              Durum Değiştir ▾
            </button>
          </div>
        </div>

        <div className="tkm-belgeler-hero">
          <div>
            <div className="tkm-quote-id-row">
              <h1>{header.quoteId}</h1>
              <TeklifBadge tone="ok">{header.status}</TeklifBadge>
            </div>
            <p className="tkm-quote-meta">{header.customer}</p>
          </div>
          <dl className="tkm-belgeler-stats">
            <div>
              <dt>Teklif Tarihi</dt>
              <dd>{header.offerDate}</dd>
            </div>
            <div>
              <dt>Geçerlilik Tarihi</dt>
              <dd>{header.validUntil}</dd>
            </div>
            <div>
              <dt>Para Birimi</dt>
              <dd>{header.currency}</dd>
            </div>
            <div>
              <dt>Toplam Tutar</dt>
              <dd className="tkm-belgeler-total">{header.total}</dd>
            </div>
          </dl>
        </div>
      </header>

      <nav className="tkm-hub-tabs tkm-hub-tabs--quote" aria-label="Teklif detay sekmeleri">
        {layer.belgelerDetailTabs.map((tab) => (
          <span
            key={tab.label}
            className={tab.active ? "tkm-hub-tab tkm-hub-tab--active" : "tkm-hub-tab"}
          >
            {tab.label}
            {tab.badge ? <span className="tkm-hub-badge">{tab.badge}</span> : null}
          </span>
        ))}
      </nav>

      <div className="tkm-workspace tkm-workspace--belgeler">
        <section className="tkm-belgeler-main">
          <header className="tkm-belgeler-head">
            <div>
              <h2>Teklif Belgeleri</h2>
              <p>Teklife ait belgeleri buradan yönetebilirsiniz.</p>
            </div>
            <button type="button" className="tkm-btn tkm-btn--primary">
              + Belge Yükle
            </button>
          </header>

          <div className="tkm-table-wrap">
            <table className="tkm-table tkm-table--belgeler">
              <thead>
                <tr>
                  <th>Belge Adı</th>
                  <th>Belge Türü</th>
                  <th>Yüklendiği Tarih</th>
                  <th>Yükleyen</th>
                  <th>Boyut</th>
                  <th>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {layer.belgelerDocuments.map((doc) => (
                  <tr key={doc.id} className={doc.selected ? "tkm-row--selected" : undefined}>
                    <td>
                      <span className="tkm-doc-name">
                        <PdfIcon />
                        {doc.name}
                      </span>
                    </td>
                    <td>{doc.type}</td>
                    <td>{doc.uploadedAt}</td>
                    <td>{doc.uploader}</td>
                    <td>{doc.size}</td>
                    <td>
                      <span className="tkm-cell-actions" aria-label="İşlemler">
                        <button type="button" title="Görüntüle">
                          g���
                        </button>
                        <button type="button" title="İndir">
                          ↓
                        </button>
                        <button type="button" title="Diğer">
                          ···
                        </button>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <footer className="tkm-table-foot">
            <span>Toplam 5 kayıt</span>
          </footer>
        </section>

        <aside className="tkm-preview-panel" aria-label="Belge önizleme">
          <header className="tkm-preview-head">
            <h2>Belge Önizleme</h2>
            <button type="button" className="tkm-preview-close" aria-label="Kapat">
              ×
            </button>
          </header>
          <p className="tkm-preview-file">
            <strong>{layer.belgelerPreview.filename}</strong>
            <span>{layer.belgelerPreview.size}</span>
          </p>
          <div className="tkm-preview-toolbar">
            <span>{layer.belgelerPreview.page}</span>
            <span>{layer.belgelerPreview.zoom}</span>
            <span className="tkm-preview-tools" aria-hidden>
              − + g��� ↓ ⤢
            </span>
          </div>
          <div className="tkm-preview-canvas">
            <div className="tkm-preview-doc">
              <div className="tkm-preview-doc-logo">PREMIUM CRM</div>
              <h3>TEKLİF</h3>
            <p className="tkm-preview-doc-id">{header.quoteId}</p>
            <p className="tkm-muted">{header.customer}</p>
              <dl className="tkm-preview-doc-meta">
                <div>
                  <dt>Teklif Tarihi</dt>
                <dd>{header.offerDate}</dd>
                </div>
                <div>
                  <dt>Geçerlilik</dt>
                <dd>{header.validUntil}</dd>
                </div>
              </dl>
              <p className="tkm-preview-doc-total">
              Toplam: <strong>{header.total}</strong>
              </p>
              <p className="tkm-preview-doc-foot">Yusuf Kaya · info@premiumcrm.com</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

