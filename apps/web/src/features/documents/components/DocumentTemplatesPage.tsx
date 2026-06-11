"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { LucideIcon } from "../../../components/icons/lucide-icons";
import { dataSourceConfig } from "../../../lib/data-source";
import { useToast } from "../../../providers/toast-provider";
import { DOCUMENT_TEMPLATE_DEMO_ROWS } from "../data/document-template-demo-data";
import { dateLabel } from "../utils";

export function DocumentTemplatesPage() {
  const { pushToast } = useToast();
  const [typeFilter, setTypeFilter] = useState("");
  const [usedIds, setUsedIds] = useState<string[]>([]);

  const filtered = useMemo(() => {
    if (!typeFilter) return DOCUMENT_TEMPLATE_DEMO_ROWS;
    return DOCUMENT_TEMPLATE_DEMO_ROWS.filter((row) => row.type === typeFilter);
  }, [typeFilter]);

  const types = useMemo(() => [...new Set(DOCUMENT_TEMPLATE_DEMO_ROWS.map((row) => row.type))], []);

  function handleUse(id: string) {
    if (usedIds.includes(id)) return;
    setUsedIds((prev) => [...prev, id]);
    pushToast("Demo modda şablon seçildi. Yeni belge formuna yönlendirilebilirsiniz.");
  }

  return (
    <section className="docf-page hz-documents-templates-page">
      <div className="docf-shell">
        <header className="docf-header">
          <div className="docf-header__main">
            <span className="docf-header__icon" aria-hidden>
              <LucideIcon name="clipboard-list" size={20} />
            </span>
            <div>
              <p className="docf-header__eyebrow">Belgeler</p>
              <h1>Belge Şablonları</h1>
              <p className="docf-header__meta">Şablon listesi, önizleme ve kullanım; canlı şablon motoru sonraki fazda bağlanacaktır.</p>
            </div>
          </div>
          <Link href="/belgeler" className="docf-header__back">
            ← Belgelere dön
          </Link>
        </header>

        {dataSourceConfig.useDemoData ? (
          <p className="docf-demo-band" role="status">
            Örnek veri modu: şablonlar demo listedir; Kullan aksiyonu toast-only çalışır.
          </p>
        ) : null}

        <section className="docf-section" aria-label="Şablon filtresi">
          <div className="docf-field-grid">
            <label className="docf-field">
              <span>Şablon tipi</span>
              <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
                <option value="">Tüm tipler</option>
                {types.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <main className="docf-layout">
          <section className="docf-main">
            <div className="docf-table-wrap">
              <table className="docf-table">
                <thead>
                  <tr>
                    <th>Şablon</th>
                    <th>Tip</th>
                    <th>Son kullanım</th>
                    <th>Durum</th>
                    <th>Önizleme</th>
                    <th>Aksiyon</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row) => (
                    <tr key={row.id}>
                      <td>{row.name}</td>
                      <td>{row.type}</td>
                      <td>{dateLabel(row.lastUsedAt)}</td>
                      <td>
                        <span className={`docf-badge${row.active ? " docf-badge--ok" : ""}`}>{row.active ? "Aktif" : "Pasif"}</span>
                      </td>
                      <td>{row.previewNote}</td>
                      <td>
                        <button
                          type="button"
                          className="docf-actions__btn"
                          onClick={() => handleUse(row.id)}
                          disabled={!row.active || usedIds.includes(row.id)}
                        >
                          {usedIds.includes(row.id) ? "Seçildi" : "Kullan"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          <aside className="docf-side">
            <section className="docf-side-card">
              <header className="docf-side-card__head">
                <h3>Hızlı bağlantılar</h3>
              </header>
              <div className="docf-actions__grid">
                <Link href="/belgeler/yeni" className="docf-actions__btn docf-actions__btn--primary">
                  Yeni belge
                </Link>
                <Link href="/belgeler/arsiv" className="docf-actions__btn">
                  Arşiv
                </Link>
              </div>
            </section>
          </aside>
        </main>
      </div>
    </section>
  );
}
