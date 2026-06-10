"use client";

import Link from "next/link";
import { useBelgelerYeniFormReferenceData } from "@/features/belgeler/hooks/use-belgeler-yeni-form-reference-data";

export function BelgelerYeniFormPage() {
  const {
    data: {
      page: BYM_PAGE,
      fields: BYM_FIELDS,
      settings: BYM_SETTINGS,
      uploadHint: BYM_UPLOAD_HINT,
      uploadInfo: BYM_UPLOAD_INFO,
      secure: BYM_SECURE
    }
  } = useBelgelerYeniFormReferenceData();

  return (
    <div className="bym-home">
      <header className="bym-head">
        <div>
          <h1>{BYM_PAGE.title}</h1>
          <p>{BYM_PAGE.subtitle}</p>
        </div>
        <div className="bym-head-actions">
          <Link href="/belgeler" className="bym-btn bym-btn--outline">
            ✕ İptal
          </Link>
          <button type="button" className="bym-btn bym-btn--primary">
            g��� Kaydet
          </button>
        </div>
      </header>

      <div className="bym-workspace">
        <div className="bym-form-col">
          <section className="bym-fields-grid">
            {BYM_FIELDS.map((field) => (
              <label key={field.id} className={field.id === "desc" ? "bym-field bym-field--wide" : "bym-field"}>
                <span>{field.label}</span>
                {field.value ? (
                  <input type="text" defaultValue={field.value} readOnly aria-label={field.label} />
                ) : (
                  <input type="text" placeholder={field.placeholder} readOnly aria-label={field.label} />
                )}
              </label>
            ))}
          </section>

          <section className="bym-upload-zone" aria-label="Belge yükleme">
            <div className="bym-upload-inner">
              <span className="bym-upload-icon" aria-hidden>
                ☁
              </span>
              <p>Dosyalarınızı buraya sürükleyin veya</p>
              <button type="button" className="bym-btn bym-btn--outline">
                Dosya Seç
              </button>
              <p className="bym-upload-hint">{BYM_UPLOAD_HINT}</p>
            </div>
          </section>

          <section className="bym-settings-grid">
            <h2>Belge Ayarları</h2>
            {BYM_SETTINGS.map((field) => (
              <label key={field.id} className="bym-field">
                <span>{field.label}</span>
                <input
                  type="text"
                  defaultValue={field.value}
                  placeholder={field.placeholder}
                  readOnly
                  aria-label={field.label}
                />
              </label>
            ))}
          </section>
        </div>

        <aside className="bym-side" aria-label="Yükleme paneli">
          <header className="bym-list-head">
            <h2>Yükleme Listesi (0/10)</h2>
            <button type="button" className="bym-clear">
              Temizle
            </button>
          </header>
          <div className="bym-empty">
            <span aria-hidden>g���</span>
            <p>Henüz dosya eklenmedi. Dosyalar buraya eklendiğinde listelenecektir.</p>
          </div>

          <article className="bym-info-card">
            <h3>Yükleme Bilgileri</h3>
            <dl>
              {BYM_UPLOAD_INFO.map((row) => (
                <div key={row.label}>
                  <dt>{row.label}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>
          </article>

          <article className="bym-secure">
            <strong>g��� Güvenli Yükleme</strong>
            <p>{BYM_SECURE}</p>
          </article>
        </aside>
      </div>
    </div>
  );
}

