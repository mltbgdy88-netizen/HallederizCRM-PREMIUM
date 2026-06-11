"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { LucideIcon } from "../../../components/icons/lucide-icons";
import { dataSourceConfig } from "../../../lib/data-source";
import { useToast } from "../../../providers/toast-provider";
import { ARCHIVED_DOCUMENT_DEMO_ROWS } from "../data/document-template-demo-data";
import { dateLabel } from "../utils";

export function DocumentArchivePage() {
  const { pushToast } = useToast();
  const [query, setQuery] = useState("");
  const [restoredIds, setRestoredIds] = useState<string[]>([]);

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("tr-TR");
    if (!q) return ARCHIVED_DOCUMENT_DEMO_ROWS;
    return ARCHIVED_DOCUMENT_DEMO_ROWS.filter(
      (row) =>
        row.documentNo.toLocaleLowerCase("tr-TR").includes(q) ||
        row.title.toLocaleLowerCase("tr-TR").includes(q) ||
        row.customerName.toLocaleLowerCase("tr-TR").includes(q)
    );
  }, [query]);

  function handleRestore(id: string) {
    if (restoredIds.includes(id)) return;
    setRestoredIds((prev) => [...prev, id]);
    pushToast("Demo modda arşivden geri yükleme talebi alındı. Kalıcı silme bu ekranda yoktur.");
  }

  return (
    <section className="docf-page hz-documents-archive-page">
      <div className="docf-shell">
        <header className="docf-header">
          <div className="docf-header__main">
            <span className="docf-header__icon" aria-hidden>
              <LucideIcon name="clipboard-check" size={20} />
            </span>
            <div>
              <p className="docf-header__eyebrow">Belgeler</p>
              <h1>Belge Arşivi</h1>
              <p className="docf-header__meta">Arşivlenmiş belgeler; geri yükleme toast-only, kalıcı silme yok.</p>
            </div>
          </div>
          <Link href="/belgeler" className="docf-header__back">
            ← Belgelere dön
          </Link>
        </header>

        {dataSourceConfig.useDemoData ? (
          <p className="docf-demo-band" role="status">
            Örnek veri modu: arşiv kayıtları demo listedir.
          </p>
        ) : null}

        <section className="docf-section" aria-label="Arşiv filtresi">
          <div className="docf-field-grid">
            <label className="docf-field docf-field--full">
              <span>Arama</span>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Belge no, başlık veya cari" />
            </label>
          </div>
        </section>

        <main className="docf-layout">
          <section className="docf-main">
            <div className="docf-table-wrap">
              <table className="docf-table">
                <thead>
                  <tr>
                    <th>Belge no</th>
                    <th>Başlık</th>
                    <th>Tip</th>
                    <th>Cari</th>
                    <th>Bağlı kayıt</th>
                    <th>Arşiv tarihi</th>
                    <th>Aksiyon</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row) => (
                    <tr key={row.id}>
                      <td>{row.documentNo}</td>
                      <td>{row.title}</td>
                      <td>{row.type}</td>
                      <td>{row.customerName}</td>
                      <td>{row.entityNo}</td>
                      <td>{dateLabel(row.archivedAt)}</td>
                      <td>
                        <button
                          type="button"
                          className="docf-actions__btn"
                          onClick={() => handleRestore(row.id)}
                          disabled={restoredIds.includes(row.id)}
                        >
                          {restoredIds.includes(row.id) ? "Geri yüklendi" : "Geri yükle"}
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
                <h3>Not</h3>
              </header>
              <p className="docf-section__desc">Kalıcı silme bu yüzeyde sunulmaz. Geri yükleme canlı API bağlandığında onay zincirinden geçecektir.</p>
              <div className="docf-actions__grid">
                <Link href="/belgeler/yeni" className="docf-actions__btn">
                  Yeni belge
                </Link>
              </div>
            </section>
          </aside>
        </main>
      </div>
    </section>
  );
}
