export interface MetricCardProps {
  title: string;
  value: string;
  detail?: string;
  tone?: "info" | "success" | "warning" | "danger" | "neutral";
  pulse?: boolean;
}

export function MetricCard({ title, value, detail, tone = "neutral", pulse = false }: MetricCardProps) {
  return (
    <article className={`hz-metric-card tone-${tone} ${pulse ? "is-pulse" : ""}`}>
      <p className="hz-metric-title">{title}</p>
      <p className="hz-metric-value">{value}</p>
      {detail ? <p className="hz-metric-detail">{detail}</p> : null}
    </article>
  );
}
