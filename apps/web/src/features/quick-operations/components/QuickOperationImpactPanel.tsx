import type { QuickOperationImpact } from "../types";

interface Props {
  impacts: QuickOperationImpact[];
}

const toneClass: Record<QuickOperationImpact["tone"], string> = {
  info: "hz-badge-info",
  success: "hz-badge-success",
  warning: "hz-badge-warning",
  danger: "hz-badge-danger"
};

export function QuickOperationImpactPanel({ impacts }: Props) {
  return (
    <section className="hz-side-panel">
      <h3>Operasyon Etkisi</h3>
      <p className="hz-content-card-description">Bu panel sadece frontend onizleme etkilerini gosterir; backend write sonraki batch'te baglanir.</p>
      <ul className="hz-side-list">
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
    </section>
  );
}
