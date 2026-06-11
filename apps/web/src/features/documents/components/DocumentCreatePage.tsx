"use client";

import Link from "next/link";
import { useState } from "react";
import { LucideIcon } from "../../../components/icons/lucide-icons";
import { dataSourceConfig } from "../../../lib/data-source";
import { useToast } from "../../../providers/toast-provider";
import { DOCUMENT_TEMPLATE_DEMO_ROWS } from "../data/document-template-demo-data";

const DOCUMENT_TYPES = [
  { value: "offer_pdf", label: "Teklif PDF" },
  { value: "order_pdf", label: "Sipariş PDF" },
  { value: "delivery_note_pdf", label: "Teslim fişi" },
  { value: "payment_receipt_pdf", label: "Tahsilat makbuzu" },
  { value: "invoice_pdf", label: "Fatura PDF" },
  { value: "return_note_pdf", label: "İade notu" }
];

const ENTITY_TYPES = [
  { value: "offer", label: "Teklif" },
  { value: "order", label: "Sipariş" },
  { value: "payment", label: "Tahsilat" },
  { value: "delivery", label: "Teslimat" },
  { value: "invoice", label: "Fatura" },
  { value: "return", label: "İade" }
];

export function DocumentCreatePage() {
  const { pushToast } = useToast();
  const [saved, setSaved] = useState(false);
  const [docType, setDocType] = useState("offer_pdf");
  const [entityType, setEntityType] = useState("offer");
  const [entityRef, setEntityRef] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [templateId, setTemplateId] = useState(DOCUMENT_TEMPLATE_DEMO_ROWS[0]?.id ?? "");

  function handleSave() {
    if (!title.trim() && !entityRef.trim()) {
      pushToast("Başlık veya ilişkili kayıt referansı girin.");
      return;
    }
    setSaved(true);
    pushToast("Demo modda belge taslağı kaydedildi. Gerçek üretim/upload sonraki fazda bağlanacaktır.");
  }

  return (
    <section className="docf-page docf-page--form hz-documents-create-page">
      <div className="docf-shell docf-shell--form">
        <header className="docf-header">
          <div className="docf-header__main">
            <span className="docf-header__icon" aria-hidden>
              <LucideIcon name="file-text" size={20} />
            </span>
            <div>
              <p className="docf-header__eyebrow">Belgeler</p>
              <h1>Yeni Belge</h1>
              <p className="docf-header__meta">Belge taslağı oluşturun; dosya yükleme ve PDF üretimi sonraki fazda bağlanacaktır.</p>
            </div>
          </div>
          <Link href="/belgeler" className="docf-header__back">
            ← Listeye dön
          </Link>
        </header>

        {dataSourceConfig.useDemoData ? (
          <p className="docf-demo-band" role="status">
            Örnek veri modu: kayıt yalnızca demo toast üretir; gerçek belge üretimi bağlı değildir.
          </p>
        ) : (
          <p className="docf-demo-band docf-demo-band--info" role="status">
            Canlı belge servisi henüz bağlanmadı; form taslak olarak çalışır.
          </p>
        )}

        <main className="docf-form-layout">
          <section className="docf-form-main">
            <section className="docf-section" aria-label="Belge bilgileri">
              <header className="docf-section__head">
                <h2>Belge bilgileri</h2>
              </header>
              <div className="docf-field-grid">
                <label className="docf-field">
                  <span>Belge tipi</span>
                  <select value={docType} onChange={(event) => setDocType(event.target.value)}>
                    {DOCUMENT_TYPES.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="docf-field">
                  <span>İlişkili kayıt türü</span>
                  <select value={entityType} onChange={(event) => setEntityType(event.target.value)}>
                    {ENTITY_TYPES.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="docf-field docf-field--full">
                  <span>İlişkili kayıt no</span>
                  <input value={entityRef} onChange={(event) => setEntityRef(event.target.value)} placeholder="Örn. TKL-2026-0042" />
                </label>
                <label className="docf-field docf-field--full">
                  <span>Başlık</span>
                  <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Belge başlığı" />
                </label>
                <label className="docf-field docf-field--full">
                  <span>Açıklama</span>
                  <textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="İç not veya açıklama" />
                </label>
                <label className="docf-field docf-field--full">
                  <span>Şablon seçimi</span>
                  <select value={templateId} onChange={(event) => setTemplateId(event.target.value)}>
                    {DOCUMENT_TEMPLATE_DEMO_ROWS.filter((row) => row.active).map((row) => (
                      <option key={row.id} value={row.id}>
                        {row.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </section>

            <section className="docf-section" aria-label="Dosya yükleme">
              <header className="docf-section__head">
                <h2>Dosya yükleme</h2>
              </header>
              <p className="docf-section__desc">Dosya yükleme alanı placeholder; gerçek upload API bağlantısı sonraki fazda yapılacaktır.</p>
              <div className="docf-field docf-field--full">
                <input type="file" disabled title="Dosya yükleme sonraki fazda" aria-label="Dosya yükleme (henüz bağlı değil)" />
              </div>
            </section>
          </section>

          <aside className="docf-form-side">
            <section className="docf-side-card" aria-label="Kayıt işlemleri">
              <header className="docf-side-card__head">
                <h3>İşlemler</h3>
              </header>
              <div className="docf-actions__grid">
                <button type="button" className="docf-actions__btn docf-actions__btn--primary" onClick={handleSave} disabled={saved}>
                  {saved ? "Taslak kaydedildi" : "Kaydet"}
                </button>
                <button type="button" className="docf-actions__btn" onClick={() => pushToast("PDF üretimi sonraki fazda bağlanacaktır.")}>
                  PDF üret
                </button>
                <Link href="/belgeler/sablonlar" className="docf-actions__link">
                  Şablonları gör
                </Link>
              </div>
            </section>
          </aside>
        </main>
      </div>
    </section>
  );
}
