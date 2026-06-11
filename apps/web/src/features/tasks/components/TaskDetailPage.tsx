"use client";

import type { Task } from "@hallederiz/types";
import Link from "next/link";
import { useMemo, useState } from "react";
import { dataSourceConfig } from "../../../lib/data-source";
import { formatUserFacingStatus } from "../../../lib/user-facing-labels";
import { useToast } from "../../../providers/toast-provider";
import {
  TASK_CHECKLIST_DEMO,
  buildTaskHeaderMeta,
  buildTaskInfoFields,
  buildTaskReferenceKpis,
  resolveTaskEntityHref
} from "../utils/map-task-detail-to-reference";

export function TaskDetailPage({ task }: { task: Task }) {
  const { pushToast } = useToast();
  const [completed, setCompleted] = useState(false);
  const [deferred, setDeferred] = useState(false);
  const [checklist, setChecklist] = useState(TASK_CHECKLIST_DEMO);

  const kpis = useMemo(() => buildTaskReferenceKpis(task), [task]);
  const infoFields = useMemo(() => buildTaskInfoFields(task), [task]);
  const entityHref = useMemo(() => resolveTaskEntityHref(task), [task]);

  function handleComplete() {
    setCompleted(true);
    pushToast("Demo modda görev tamamlandı olarak işaretlendi. Canlı atama motoru bağlı değildir.");
  }

  function handleDefer() {
    setDeferred(true);
    pushToast("Demo modda erteleme talebi alındı. Canlı görev motoru bağlı değildir.");
  }

  function toggleChecklist(id: string) {
    setChecklist((prev) => prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item)));
    pushToast("Kontrol listesi demo modda güncellendi.");
  }

  return (
    <section className="tskf-page hz-tasks-detail-page">
      <div className="tskf-shell">
        <header className="tskf-header">
          <div className="tskf-header__main">
            <p className="tskf-header__eyebrow">Görevler</p>
            <h1>Görev Detayı</h1>
            <p className="tskf-header__meta">{buildTaskHeaderMeta(task)}</p>
          </div>
          <Link href="/gorevler" className="tskf-header__back">
            ← Listeye dön
          </Link>
        </header>

        {dataSourceConfig.useDemoData ? (
          <p className="tskf-demo-band" role="status">
            Örnek veri modu: görev aksiyonları toast-only çalışır; canlı atama/tamamlama bağlı değildir.
          </p>
        ) : null}

        <section className="tskf-kpi-strip" aria-label="Görev özeti">
          {kpis.map((kpi) => (
            <div
              key={kpi.id}
              className={`tskf-kpi${kpi.tone === "warning" ? " tskf-kpi--warning" : kpi.tone === "success" ? " tskf-kpi--success" : ""}`}
            >
              <span className="tskf-kpi__label">{kpi.label}</span>
              <span className="tskf-kpi__value">{kpi.value}</span>
            </div>
          ))}
        </section>

        <main className="tskf-layout">
          <section className="tskf-main">
            <section className="tskf-section" aria-label="Görev bilgileri">
              <header className="tskf-section__head">
                <h2>Görev bilgileri</h2>
              </header>
              <div className="tskf-field-grid">
                {infoFields.map((field) => (
                  <label key={field.label} className={`tskf-field${field.full ? " tskf-field--full" : ""}`}>
                    <span>{field.label}</span>
                    <strong>{field.value}</strong>
                  </label>
                ))}
              </div>
            </section>

            <section className="tskf-section" aria-label="Kontrol listesi">
              <header className="tskf-section__head">
                <h2>Kontrol listesi</h2>
              </header>
              <ul className="tskf-check-list">
                {checklist.map((item) => (
                  <li key={item.id}>
                    <button type="button" className="tskf-actions__btn" onClick={() => toggleChecklist(item.id)}>
                      {item.done ? "✓" : "○"} {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </section>

            <section className="tskf-section" aria-label="Yorumlar ve notlar">
              <header className="tskf-section__head">
                <h2>Yorumlar / notlar</h2>
              </header>
              <p className="tskf-section__desc">Canlı görev yorum servisi bağlandığında burada listelenecektir.</p>
              <p className="tskf-section__desc">Henüz yorum kaydı yok.</p>
            </section>

            <section className="tskf-section" aria-label="Hareket geçmişi">
              <header className="tskf-section__head">
                <h2>Zaman Akışı</h2>
              </header>
              <ul className="tskf-side-list">
                <li>
                  <span>Oluşturuldu</span>
                  <strong>{new Date(task.createdAt).toLocaleString("tr-TR")}</strong>
                </li>
                <li>
                  <span>Son güncelleme</span>
                  <strong>{new Date(task.updatedAt).toLocaleString("tr-TR")}</strong>
                </li>
                <li>
                  <span>Kaynak</span>
                  <strong>{task.source}</strong>
                </li>
              </ul>
            </section>
          </section>

          <aside className="tskf-side">
            <section className="tskf-side-card" aria-label="Durum paneli">
              <header className="tskf-side-card__head">
                <h3>Durum</h3>
                <span className="tskf-badge tskf-badge--info">{formatUserFacingStatus(task.status)}</span>
              </header>
              <ul className="tskf-side-list">
                <li>
                  <span>Öncelik</span>
                  <strong>{formatUserFacingStatus(task.priority)}</strong>
                </li>
                <li>
                  <span>Atanan</span>
                  <strong>{task.assigneeName ?? "—"}</strong>
                </li>
                <li>
                  <span>Son tarih</span>
                  <strong>{new Date(task.dueAt).toLocaleString("tr-TR")}</strong>
                </li>
              </ul>
            </section>

            <section className="tskf-side-card" aria-label="İlişkili kayıtlar">
              <header className="tskf-side-card__head">
                <h3>İlişkili kayıt</h3>
              </header>
              {entityHref ? (
                <Link href={entityHref} className="tskf-side-link">
                  İlişkili kayda git →
                </Link>
              ) : (
                <p className="tskf-side-note">Bağlantı üretilemedi.</p>
              )}
              {task.approvalId ? (
                <Link href="/onaylar" className="tskf-side-link">
                  Onay inbox →
                </Link>
              ) : null}
              <Link href="/ayarlar/operasyon-gozlem" className="tskf-side-link">
                Operasyon ve gözlem →
              </Link>
            </section>

            <section className="tskf-actions" aria-label="Görev işlemleri">
              <h3 className="tskf-actions__title">İşlemler</h3>
              <div className="tskf-actions__grid">
                <button type="button" className="tskf-actions__btn tskf-actions__btn--primary" onClick={handleComplete} disabled={completed}>
                  {completed ? "Tamamlandı" : "Tamamlandı işaretle"}
                </button>
                <button type="button" className="tskf-actions__btn" onClick={() => pushToast("Atama değişikliği canlı görev motorunda bağlanacaktır.")} disabled>
                  Atama değiştir
                </button>
                <button type="button" className="tskf-actions__btn" onClick={() => pushToast("Öncelik değişikliği canlı görev motorunda bağlanacaktır.")} disabled>
                  Öncelik değiştir
                </button>
                <button type="button" className="tskf-actions__btn" onClick={handleDefer} disabled={deferred}>
                  {deferred ? "Ertelendi" : "Ertele"}
                </button>
              </div>
            </section>
          </aside>
        </main>
      </div>
    </section>
  );
}
