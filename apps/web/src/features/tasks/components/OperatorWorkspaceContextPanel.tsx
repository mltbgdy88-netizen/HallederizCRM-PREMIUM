"use client";

import type { Task } from "@hallederiz/types";
import { DetailPanel, UiButton } from "@hallederiz/ui";
import { useRouter } from "next/navigation";

const priorityLabels: Record<Task["priority"], string> = {
  low: "Dusuk",
  normal: "Normal",
  high: "Yuksek",
  critical: "Kritik"
};

const statusLabels: Record<Task["status"], string> = {
  open: "Acik",
  in_progress: "Devam",
  done: "Tamam",
  cancelled: "Iptal",
  overdue: "Gecikti"
};

function priorityBadgeClass(priority: Task["priority"]) {
  return priority === "critical"
    ? "hz-badge hz-badge-danger"
    : priority === "high"
      ? "hz-badge hz-badge-warning"
      : "hz-badge hz-badge-info";
}

function formatDt(value: string): string {
  return new Date(value).toLocaleString("tr-TR");
}

/** AI yalnizca oneri; bu metinler demo/ozet amacli, mutation yapmaz. */
function taskAiExplanation(task: Task): string {
  if (task.source !== "ai") {
    return "Bu gorev sistem veya workflow kaynaklidir. AI odakli risk veya firsat ozeti bu kartta gosterilmez; ilgili modulden takip edin.";
  }
  switch (task.type) {
    case "ai_risk":
      return "AI risk sinyali: cari veya belge tarafinda gecikme / tutarsizlik paterni tespit edildi. Karar oncesi ilgili kaydi ve onay kuyrugunu kontrol edin.";
    case "ai_payment_priority":
      return "AI tahsilat onceligi: vadesi yakin veya yuksek bakiyeli cari odakli operasyon onerisi. Tahsilat veya vade gorusmesi planlanabilir.";
    case "ai_sales_opportunity":
      return "AI satis firsati: tekrar siparis veya capraz satis potansiyeli. Teklif / siparis akisina yonlendirme degerlendirin.";
    case "ai_operation_reminder":
      return "AI operasyon hatirlatmasi: SLA veya teslimat penceresi acisindan aksiyon zamanlamasi onerilir.";
    case "ai_stockout_prediction":
      return "AI stok riski: kritik stok veya kesinti ihtimali. Stok / siparis tarafinda onleyici adim onerilir.";
    default:
      return "AI kaynakli gorev: oncelik ve baglam ilgili modulde dogrulanmali; bu alan salt okunur ozet sunar.";
  }
}

export function OperatorWorkspaceContextPanel({
  task,
  onOpenDetail
}: {
  task: Task | null;
  onOpenDetail: (taskId: string) => void;
}) {
  const router = useRouter();

  if (!task) {
    return (
      <DetailPanel className="hz-tasks-ws-detail">
        <p className="hz-tasks-ws-muted">Liste yuklendiginde ilk gorev secilir.</p>
      </DetailPanel>
    );
  }

  return (
    <DetailPanel className="hz-tasks-ws-detail" aria-labelledby="hz-tasks-ws-detail-title">
      <header className="hz-tasks-ws-detail-head">
        <p className="hz-tasks-ws-eyebrow">{task.taskNo}</p>
        <h2 id="hz-tasks-ws-detail-title" className="hz-tasks-ws-detail-title">
          {task.title}
        </h2>
        {task.description ? <p className="hz-tasks-ws-muted">{task.description}</p> : null}
        <div className="hz-tasks-ws-badges">
          <span className={priorityBadgeClass(task.priority)}>{priorityLabels[task.priority]}</span>
          <span className="hz-badge hz-badge-info">{statusLabels[task.status]}</span>
          <span className="hz-tasks-ws-source-pill">{task.source === "ai" ? "AI" : "Sistem"}</span>
        </div>
      </header>

      <section className="hz-tasks-ws-card" aria-label="Kayit bilgisi">
        <h3 className="hz-tasks-ws-card-title">Baglam</h3>
        <dl className="hz-tasks-ws-meta">
          <div>
            <dt>Cari / kayit</dt>
            <dd>{task.customerName ?? task.entityNo}</dd>
          </div>
          <div>
            <dt>Entity</dt>
            <dd>
              {task.entityType} · {task.entityNo}
            </dd>
          </div>
          <div>
            <dt>Atanan</dt>
            <dd>{task.assigneeName ?? "-"}</dd>
          </div>
          <div>
            <dt>Bitis</dt>
            <dd>{formatDt(task.dueAt)}</dd>
          </div>
          {task.approvalId ? (
            <div className="hz-tasks-ws-meta-span">
              <dt>Onay</dt>
              <dd>
                <button type="button" className="hz-tasks-ws-link" onClick={() => router.push("/onaylar")}>
                  Onay inbox
                </button>
              </dd>
            </div>
          ) : null}
        </dl>
      </section>

      <section className="hz-tasks-ws-card hz-tasks-ws-card--ai" aria-label="AI aciklamasi">
        <h3 className="hz-tasks-ws-card-title">AI aciklamasi</h3>
        <p className="hz-tasks-ws-ai-copy">{taskAiExplanation(task)}</p>
        <p className="hz-tasks-ws-muted hz-tasks-ws-ai-foot">
          AI dogrudan CRM verisini degistirmez; onay ve politika zinciri disinda execution yapilmaz.
        </p>
      </section>

      <section className="hz-tasks-ws-card" aria-label="Zaman cizelgesi">
        <h3 className="hz-tasks-ws-card-title">Zaman cizelgesi</h3>
        <ol className="hz-tasks-ws-timeline">
          <li>
            <span className="hz-tasks-ws-timeline-k">Olusturuldu</span>
            <span className="hz-tasks-ws-timeline-v">{formatDt(task.createdAt)}</span>
          </li>
          <li>
            <span className="hz-tasks-ws-timeline-k">Son guncelleme</span>
            <span className="hz-tasks-ws-timeline-v">{formatDt(task.updatedAt)}</span>
          </li>
          <li>
            <span className="hz-tasks-ws-timeline-k">Hedef bitis</span>
            <span className="hz-tasks-ws-timeline-v">{formatDt(task.dueAt)}</span>
          </li>
        </ol>
      </section>

      <footer className="hz-tasks-ws-detail-foot">
        <UiButton variant="primary" type="button" onClick={() => onOpenDetail(task.id)}>
          Tam detay
        </UiButton>
        {task.approvalId ? (
          <UiButton variant="secondary" type="button" onClick={() => router.push("/onaylar")}>
            Onaylara git
          </UiButton>
        ) : null}
      </footer>
    </DetailPanel>
  );
}
