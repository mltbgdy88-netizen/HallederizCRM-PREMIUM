"use client";

import Link from "next/link";
import { useState } from "react";
import type { GdmTab } from "@/features/gorevler/data/gorevler-detay-mock";
import { useGorevlerDetayReferenceData } from "@/features/gorevler/hooks/use-gorevler-detay-reference-data";

export function GorevlerDetayPage() {
  const {
    data: {
      page: GDM_PAGE,
      summary: GDM_SUMMARY,
      tabs: GDM_TABS,
      description: GDM_DESCRIPTION,
      checklist: GDM_CHECKLIST,
      comments: GDM_COMMENTS,
      linked: GDM_LINKED,
      related: GDM_RELATED,
      info: GDM_INFO,
      tags: GDM_TAGS,
      reminder: GDM_REMINDER
    }
  } = useGorevlerDetayReferenceData();
  const [activeTab, setActiveTab] = useState<GdmTab>("Genel Bakış");
  const checklistDone = GDM_CHECKLIST.filter((i) => i.done).length;

  return (
    <div className="gdm-home">
      <header className="gdm-head">
        <nav className="gdm-crumb" aria-label="Konum">
          {GDM_PAGE.breadcrumb.map((part, i) => (
            <span key={part}>
              {i > 0 ? <span className="gdm-crumb-sep">›</span> : null}
              {i === 0 ? <Link href="/gorevler">{part}</Link> : <span>{part}</span>}
            </span>
          ))}
        </nav>
        <div className="gdm-title-row">
          <h1>{GDM_PAGE.title}</h1>
          <span className="gdm-status-badge">{GDM_PAGE.status}</span>
        </div>
        <p className="gdm-subtitle">{GDM_PAGE.subtitle}</p>
        <div className="gdm-head-actions">
          <button type="button" className="gdm-btn gdm-btn--primary">
            Düzenle
          </button>
          <button type="button" className="gdm-btn gdm-btn--gold">
            Tamamlandı Olarak İşaretle
          </button>
          <button type="button" className="gdm-btn gdm-btn--outline">
            Diğer ▾
          </button>
        </div>
      </header>

      <section className="gdm-summary-row" aria-label="Görev özeti">
        {GDM_SUMMARY.map((item) => (
          <article key={item.label} className="gdm-summary-card">
            <span className="gdm-summary-label">{item.label}</span>
            <strong>{item.value}</strong>
            {item.sub ? <span className="gdm-summary-sub">{item.sub}</span> : null}
          </article>
        ))}
      </section>

      <div className="gdm-workspace">
        <div className="gdm-main">
          <div className="gdm-tabs" role="tablist">
            {GDM_TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={activeTab === tab}
                className={`gdm-tab${activeTab === tab ? " gdm-tab--active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === "Genel Bakış" ? (
            <>
              <article className="gdm-card">
                <h2>Görev Açıklaması</h2>
                <p>{GDM_DESCRIPTION}</p>
              </article>

              <article className="gdm-card">
                <header className="gdm-check-head">
                  <h2>Checklist</h2>
                  <span>
                    {checklistDone} / {GDM_CHECKLIST.length} Tamamlandı
                  </span>
                </header>
                <div className="gdm-check-bar" aria-hidden>
                  <span style={{ width: `${(checklistDone / GDM_CHECKLIST.length) * 100}%` }} />
                </div>
                <ul className="gdm-checklist">
                  {GDM_CHECKLIST.map((item) => (
                    <li key={item.label}>
                      <input type="checkbox" checked={item.done} readOnly />
                      <span className={item.done ? "gdm-check-done" : undefined}>{item.label}</span>
                    </li>
                  ))}
                </ul>
              </article>

              <article className="gdm-card">
                <h2>Yorumlar</h2>
                <div className="gdm-comment-input">
                  <input type="text" placeholder="Yorum yazın..." readOnly aria-label="Yorum" />
                  <button type="button" className="gdm-btn gdm-btn--primary">
                    Gönder
                  </button>
                </div>
                <ul className="gdm-comments">
                  {GDM_COMMENTS.map((c) => (
                    <li key={c.time}>
                      <header>
                        <strong>{c.author}</strong>
                        <span>{c.time}</span>
                      </header>
                      <p>{c.text}</p>
                      <button type="button">Yanıtla</button>
                    </li>
                  ))}
                </ul>
              </article>
            </>
          ) : null}
        </div>

        <aside className="gdm-context" aria-label="Görev bağlamı">
          <article className="gdm-side-card">
            <h2>Görev Bağlamı</h2>
            <h3>Bağlantılı Kayıtlar</h3>
            <ul className="gdm-linked">
              {GDM_LINKED.map((row) => (
                <li key={row.label}>
                  <span>{row.label}</span>
                  <a href="#">{row.value}</a>
                </li>
              ))}
            </ul>
            <h3>İlişkili Görevler</h3>
            <ul className="gdm-related">
              {GDM_RELATED.map((task) => (
                <li key={task.title}>
                  <span>{task.title}</span>
                  <span className={`gdm-rel-badge gdm-rel-badge--${task.tone}`}>{task.status}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="gdm-side-card">
            <h2>Görev Bilgileri</h2>
            <dl className="gdm-info-dl">
              {GDM_INFO.map((row) => (
                <div key={row.label}>
                  <dt>{row.label}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>
            <div className="gdm-tags">
              {GDM_TAGS.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
            <p className="gdm-reminder">g��� Hatırlatma: {GDM_REMINDER}</p>
          </article>

          <button type="button" className="gdm-delete-btn">
            Görevi Sil
          </button>
        </aside>
      </div>
    </div>
  );
}

