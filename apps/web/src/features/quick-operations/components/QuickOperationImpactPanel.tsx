import type { QuickOperationAiInsight, QuickOperationImpact } from "../types";

interface Props {
  impacts: QuickOperationImpact[];
  aiInsight?: QuickOperationAiInsight;
  layout?: "card" | "bare";
}

const toneClass: Record<QuickOperationImpact["tone"], string> = {
  info: "hz-badge-info",
  success: "hz-badge-success",
  warning: "hz-badge-warning",
  danger: "hz-badge-danger"
};

export function QuickOperationImpactPanel({ impacts, aiInsight, layout = "card" }: Props) {
  const body = (
    <>
      {layout === "card" ? <p className="hz-content-card-description">Bu panel operasyon etkilerini ve AI operasyon notunu gosterir.</p> : null}
      {aiInsight ? (
        <div className={`hz-state-card tone-warning${layout === "bare" ? " hz-qop-ai-insight" : ""} hz-margin-top-sm`}>
          <h4>AI Operasyon Notu ({aiInsight.source})</h4>
          <p className="hz-content-card-description">{aiInsight.summary}</p>
          {aiInsight.warnings.length > 0 ? <p className="hz-content-card-description">Uyarilar: {aiInsight.warnings.join(" | ")}</p> : null}
          {aiInsight.recommendations.length > 0 ? (
            <p className="hz-content-card-description">Oneriler: {aiInsight.recommendations.join(" | ")}</p>
          ) : null}
        </div>
      ) : null}
      <ul className={layout === "bare" ? "hz-qop-impact-list" : "hz-side-list"}>
        {impacts.map((impact) => (
          <li key={impact.id}>
            <div className="crm-identity-header">
              <strong style={{ color: "var(--hz-text-strong)" }}>{impact.title}</strong>
              <span className={`hz-badge ${toneClass[impact.tone]}`}>{impact.tone}</span>
            </div>
            <p className="hz-content-card-description hz-margin-top-sm">{impact.description}</p>
          </li>
        ))}
      </ul>
    </>
  );

  if (layout === "bare") {
    return <div className="hz-qop-impact-bare">{body}</div>;
  }

  return (
    <section className="hz-side-panel">
      <h3>Operasyon Etkisi</h3>
      {body}
    </section>
  );
}
