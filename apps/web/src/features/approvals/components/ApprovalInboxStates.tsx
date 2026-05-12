import type { ApprovalClientError } from "../types";

export function LoadingState({ label = "Onay kayitlari yukleniyor..." }: { label?: string }) {
  return (
    <div className="hz-approvals-inbox-state hz-approvals-inbox-state--loading" role="status" aria-live="polite">
      <p>{label}</p>
    </div>
  );
}

export function ErrorState({ error, onRetry }: { error: ApprovalClientError; onRetry?: () => void }) {
  return (
    <div className="hz-approvals-inbox-state hz-approvals-inbox-state--error" role="alert">
      <p className="hz-approvals-inbox-state-title">Onay verisi alinamadi</p>
      <p className="hz-approvals-inbox-state-message">{error.message}</p>
      {error.reasons?.length ? (
        <ul className="hz-approvals-inbox-state-reasons">
          {error.reasons.map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>
      ) : null}
      {onRetry ? (
        <button type="button" className="hz-approvals-inbox-btn hz-approvals-inbox-btn--secondary" onClick={onRetry}>
          Yeniden Dene
        </button>
      ) : null}
    </div>
  );
}

export function EmptyState({ title = "Bekleyen onay bulunamadi", description }: { title?: string; description?: string }) {
  return (
    <div className="hz-approvals-inbox-state hz-approvals-inbox-state--empty">
      <p className="hz-approvals-inbox-state-title">{title}</p>
      {description ? <p className="hz-approvals-inbox-state-message">{description}</p> : null}
    </div>
  );
}
