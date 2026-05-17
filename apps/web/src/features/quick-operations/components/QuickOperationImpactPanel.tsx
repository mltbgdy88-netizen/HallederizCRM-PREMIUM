import type { QuickOperationAiInsight, QuickOperationImpact } from "../types";

interface Props {
  impacts: QuickOperationImpact[];
  aiInsight?: QuickOperationAiInsight;
  layout?: "card" | "bare" | "workflow" | "ai-only";
}

const toneClass: Record<QuickOperationImpact["tone"], string> = {
  info: "hz-badge-info",
  success: "hz-badge-success",
  warning: "hz-badge-warning",
  danger: "hz-badge-danger"
};

function toneLabel(tone: QuickOperationImpact["tone"]) {
  if (tone === "warning") return "Uyarı";
  if (tone === "success") return "Uygun";
  if (tone === "danger") return "Risk";
  return "Bilgi";
}

export function QuickOperationImpactPanel({ impacts, aiInsight, layout = "card" }: Props) {
  if (layout === "ai-only" && aiInsight) {
    return (
      <div className="hz-qop-wb-ai-note">
        <p>{aiInsight.summary}</p>
        {aiInsight.warnings.length > 0 ? <p className="hz-qop-wb-muted">Uyarı: {aiInsight.warnings.join(" · ")}</p> : null}
        {aiInsight.recommendations.length > 0 ? (
          <p className="hz-qop-wb-muted">Öneri: {aiInsight.recommendations.join(" · ")}</p>
        ) : null}
      </div>
    );
  }

  if (layout === "workflow") {
    return (
      <ul className="hz-qop-wb-flow-list">
        {impacts.map((impact) => (
          <li key={impact.id}>
            <span className="hz-qop-wb-flow-title">{impact.title}</span>
            <span className={`hz-badge ${toneClass[impact.tone]}`}>{toneLabel(impact.tone)}</span>
            <p className="hz-qop-wb-muted">{impact.description}</p>
          </li>
        ))}
      </ul>
    );
  }

  const body = (
    <>
      {layout === "card" ? (
        <p className="hz-content-card-description">Bu panel operasyon etkilerini ve AI operasyon notunu gösterir.</p>
      ) : null}
      {aiInsight ? (
        <div className={`hz-state-card tone-warning${layout === "bare" ? " hz-qop-ai-insight" : ""} hz-margin-top-sm`}>
          <h4>AI Operasyon Notu</h4>
          <p className="hz-content-card-description">{aiInsight.summary}</p>
          {aiInsight.warnings.length > 0 ? (
            <p className="hz-content-card-description">Uyarılar: {aiInsight.warnings.join(" | ")}</p>
          ) : null}
          {aiInsight.recommendations.length > 0 ? (
            <p className="hz-content-card-description">Öneriler: {aiInsight.recommendations.join(" | ")}</p>
          ) : null}
        </div>
      ) : null}
      <ul className={layout === "bare" ? "hz-qop-impact-list" : "hz-side-list"}>
        {impacts.map((impact) => (
          <li key={impact.id}>
            <div className="crm-identity-header">
              <strong style={{ color: "var(--hz-text-strong)" }}>{impact.title}</strong>
              <span className={`hz-badge ${toneClass[impact.tone]}`}>{toneLabel(impact.tone)}</span>
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
