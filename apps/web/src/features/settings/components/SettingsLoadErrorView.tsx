"use client";

import { ErrorState, UiButton } from "@hallederiz/ui";
import type { SettingsLoadFailure } from "../utils/resolve-settings-load-error";
import { SettingsSessionRecoveryPanel } from "./SettingsSessionRecoveryPanel";

type SettingsLoadErrorViewProps = {
  failure: SettingsLoadFailure;
  onRetry: () => void;
  layout?: "settings" | "reference";
  retrying?: boolean;
  genericTitle?: string;
};

export function SettingsLoadErrorView({
  failure,
  onRetry,
  layout = "settings",
  retrying = false,
  genericTitle = "Bilgi alınamadı"
}: SettingsLoadErrorViewProps) {
  if (failure.kind === "session") {
    return (
      <SettingsSessionRecoveryPanel onRetry={onRetry} layout={layout} retrying={retrying} message={failure.message} />
    );
  }

  if (layout === "reference") {
    return (
      <div className="setf-state" role="alert">
        <p>{failure.message}</p>
        <button type="button" className="setf-btn setf-btn--outline" onClick={onRetry} disabled={retrying}>
          {retrying ? "Deneniyor…" : "Tekrar dene"}
        </button>
      </div>
    );
  }

  return (
    <ErrorState
      title={genericTitle}
      message={failure.message}
      actions={
        <UiButton type="button" variant="secondary" size="md" onClick={onRetry} disabled={retrying}>
          {retrying ? "Deneniyor…" : "Tekrar dene"}
        </UiButton>
      }
    />
  );
}
