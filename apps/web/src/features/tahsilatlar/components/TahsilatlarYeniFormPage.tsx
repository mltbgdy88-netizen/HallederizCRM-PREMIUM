"use client";

import Link from "next/link";
import { StokOperasyonPage } from "@/features/stok/components/StokOperasyonPage";
import { useTahsilatlarYeniFormReferenceData } from "@/features/tahsilatlar/hooks/use-tahsilatlar-yeni-form-reference-data";

function IconDoc({ className }: { className?: string }) {
  return (
    <svg className={className} width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
    </svg>
  );
}

function IconClose({ className }: { className?: string }) {
  return (
    <svg className={className} width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

function IconSave({ className }: { className?: string }) {
  return (
    <svg className={className} width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <path d="M17 21v-8H7v8M7 3v5h8" />
    </svg>
  );
}

function IconSend({ className }: { className?: string }) {
  return (
    <svg className={className} width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="m22 2-7 20-4-9-9-4 20-7z" />
    </svg>
  );
}

function IconTrash({ className }: { className?: string }) {
  return (
    <svg className={className} width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M3 6h18M8 6V4h8v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    </svg>
  );
}

export function TahsilatlarYeniFormPage() {
  const {
    data: {
      title: THYF_TITLE,
      amountDefault: THYF_AMOUNT_DEFAULT,
      dateDefault: THYF_DATE_DEFAULT,
      cariPlaceholder: THYF_CARI_PLACEHOLDER,
      descPlaceholder: THYF_DESC_PLACEHOLDER,
      descCounter: THYF_DESC_COUNTER,
      distributionRows: THYF_DISTRIBUTION_ROWS,
      summary: THYF_SUMMARY
    }
  } = useTahsilatlarYeniFormReferenceData();

  return (
    <div className="thyf-scene">
      <div className="thyf-backdrop" aria-hidden>
        <StokOperasyonPage />
      </div>

      <div className="thyf-modal" role="dialog" aria-modal="true" aria-labelledby="thyf-title">
        <header className="thyf-modal-head">
          <h1 id="thyf-title">
            <span className="thyf-modal-icon">
              <IconDoc />
            </span>
            {THYF_TITLE}
          </h1>
          <Link href="/tahsilatlar" className="thyf-modal-close" aria-label="Kapat">
            <IconClose />
          </Link>
        </header>

        <div className="thyf-modal-body">
          <div className="thyf-form-row thyf-form-row--3">
            <label className="thyf-field">
              <span>
                Tahsilat Tutarı <em aria-hidden>*</em>
              </span>
              <div className="thyf-input-wrap">
                <span className="thyf-currency">₺</span>
                <input type="text" readOnly defaultValue={THYF_AMOUNT_DEFAULT} aria-label="Tahsilat tutarı" />
              </div>
            </label>
            <label className="thyf-field">
              <span>
                Yöntem <em aria-hidden>*</em>
              </span>
              <select defaultValue="" aria-label="Yöntem">
                <option value="">Seçiniz</option>
              </select>
            </label>
            <label className="thyf-field">
              <span>
                Tarih <em aria-hidden>*</em>
              </span>
              <input type="text" readOnly defaultValue={THYF_DATE_DEFAULT} aria-label="Tarih" />
            </label>
          </div>

          <label className="thyf-field thyf-field--full">
            <span>
              Cari <em aria-hidden>*</em>
            </span>
            <div className="thyf-cari-row">
              <input type="text" readOnly placeholder={THYF_CARI_PLACEHOLDER} aria-label="Cari" />
              <button type="button" className="thyf-cari-add" aria-label="Yeni cari ekle">
                +
              </button>
            </div>
          </label>

          <label className="thyf-field thyf-field--full">
            <span>Açıklama</span>
            <div className="thyf-textarea-wrap">
              <textarea readOnly placeholder={THYF_DESC_PLACEHOLDER} aria-label="Açıklama" rows={3} />
              <span className="thyf-counter">{THYF_DESC_COUNTER}</span>
            </div>
          </label>

          <section className="thyf-dist" aria-label="Tahsilat dağılımı">
            <h2>Tahsilat Dağılımı</h2>
            <div className="thyf-dist-table-wrap">
              <table className="thyf-dist-table">
                <thead>
                  <tr>
                    <th>Belge Türü</th>
                    <th>Belge No</th>
                    <th>Vade Tarihi</th>
                    <th>Para Birimi</th>
                    <th>Bakiye</th>
                    <th>Tahsilat Tutarı</th>
                    <th aria-label="İşlem" />
                  </tr>
                </thead>
                <tbody>
                  {THYF_DISTRIBUTION_ROWS.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <select defaultValue={row.docType} aria-label="Belge türü">
                          <option>{row.docType}</option>
                        </select>
                      </td>
                      <td>
                        <input type="text" readOnly defaultValue={row.docNo} aria-label="Belge no" />
                      </td>
                      <td>
                        <input type="text" readOnly defaultValue={row.dueDate} aria-label="Vade tarihi" />
                      </td>
                      <td>
                        <select defaultValue={row.currency} aria-label="Para birimi">
                          <option>{row.currency}</option>
                        </select>
                      </td>
                      <td className="thyf-readonly">{row.balance}</td>
                      <td>
                        <input type="text" readOnly defaultValue={row.amount} aria-label="Tahsilat tutarı" />
                      </td>
                      <td>
                        <button type="button" className="thyf-row-delete" aria-label="Satırı sil">
                          <IconTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button type="button" className="thyf-add-row">
              + Satır Ekle
            </button>
          </section>

          <div className="thyf-summary">
            <div>
              <span>Toplam Bakiye</span>
              <strong>{THYF_SUMMARY.totalBalance}</strong>
            </div>
            <div>
              <span>Tahsilat Toplamı</span>
              <strong>{THYF_SUMMARY.collectionTotal}</strong>
            </div>
            <div>
              <span>Kalan Bakiye</span>
              <strong>{THYF_SUMMARY.remainingBalance}</strong>
            </div>
          </div>
        </div>

        <footer className="thyf-modal-foot">
          <Link href="/tahsilatlar" className="thyf-btn thyf-btn--ghost">
            İptal
          </Link>
          <button type="button" className="thyf-btn thyf-btn--primary">
            <IconSave />
            Kaydet
          </button>
          <button type="button" className="thyf-btn thyf-btn--gold">
            <IconSend />
            Onaya Gönder
          </button>
        </footer>
      </div>
    </div>
  );
}
