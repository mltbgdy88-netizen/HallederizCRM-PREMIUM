import type { ApprovalClientError } from "../types";
import { mapApprovalUiErrorMessage } from "../utils/inbox-helpers";
import { EmptyState as UiEmptyState, ErrorState as UiErrorState, LoadingState as UiLoadingState, UiButton } from "@hallederiz/ui";

/** Onay gelen kutusu liste/detay yükleme göstergesi. */
export function ApprovalInboxLoading({ label = "Onay kayıtları yükleniyor…" }: { label?: string }) {
  return (
    <UiLoadingState title="Yükleniyor" message={label} className="hz-approvals-inbox-state hz-approvals-inbox-state--loading" />
  );
}

export function ApprovalInboxError({ error, onRetry }: { error: ApprovalClientError; onRetry?: () => void }) {
  return (
    <UiErrorState
      title="Onay verisi alınamadı"
      message={mapApprovalUiErrorMessage(error)}
      className="hz-approvals-inbox-state hz-approvals-inbox-state--error"
      details={
        error.reasons?.length ? (
          <ul className="hz-approvals-inbox-state-reasons">
            {error.reasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        ) : null
      }
      actions={
        onRetry ? (
          <UiButton type="button" variant="secondary" size="sm" onClick={onRetry}>
            Yeniden dene
          </UiButton>
        ) : null
      }
    />
  );
}

export function ApprovalInboxEmpty({ title = "Bekleyen onay bulunamadı", description }: { title?: string; description?: string }) {
  return (
    <UiEmptyState
      title={title}
      message={description ?? "Filtre veya arama kriterlerini değiştirin."}
      className="hz-approvals-inbox-state hz-approvals-inbox-state--empty"
    />
  );
}
