"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ErrorState, UiButton } from "@hallederiz/ui";
import {
  buildSettingsLoginHref,
  SETTINGS_SESSION_RECOVERY_COPY
} from "../utils/resolve-settings-load-error";

type SettingsSessionRecoveryPanelProps = {
  onRetry: () => void;
  layout?: "settings" | "reference" | "inline" | "hub";
  retrying?: boolean;
  title?: string;
  message?: string;
};

function useSettingsReturnLoginHref(): string {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const returnPath = query ? `${pathname}?${query}` : pathname;
  return buildSettingsLoginHref(returnPath);
}

export function SettingsSessionRecoveryPanel({
  onRetry,
  layout = "settings",
  retrying = false,
  title = SETTINGS_SESSION_RECOVERY_COPY.title,
  message = SETTINGS_SESSION_RECOVERY_COPY.message
}: SettingsSessionRecoveryPanelProps) {
  const loginHref = useSettingsReturnLoginHref();

  if (layout === "hub") {
    return (
      <div className="ahb-session-recovery" role="alert">
        <h2 className="ahb-session-recovery-title">{title}</h2>
        <p className="ahb-session-recovery-message">{message}</p>
        <div className="ahb-session-recovery-actions">
          <Link href={loginHref} className="ahb-session-recovery-primary">
            {SETTINGS_SESSION_RECOVERY_COPY.loginAction}
          </Link>
          <button type="button" className="ahb-session-recovery-secondary" onClick={onRetry} disabled={retrying}>
            {retrying ? SETTINGS_SESSION_RECOVERY_COPY.retryingAction : SETTINGS_SESSION_RECOVERY_COPY.retryAction}
          </button>
        </div>
      </div>
    );
  }

  if (layout === "reference") {
    return (
      <div className="setf-session-recovery" role="alert">
        <h2 className="setf-session-recovery-title">{title}</h2>
        <p className="setf-session-recovery-message">{message}</p>
        <div className="setf-session-recovery-actions">
          <Link href={loginHref} className="setf-btn setf-btn--primary">
            {SETTINGS_SESSION_RECOVERY_COPY.loginAction}
          </Link>
          <button type="button" className="setf-btn setf-btn--outline" onClick={onRetry} disabled={retrying}>
            {retrying ? SETTINGS_SESSION_RECOVERY_COPY.retryingAction : SETTINGS_SESSION_RECOVERY_COPY.retryAction}
          </button>
        </div>
      </div>
    );
  }

  if (layout === "inline") {
    return (
      <div className="hz-settings-session-recovery hz-settings-session-recovery--inline" role="alert">
        <p className="hz-settings-session-recovery-message">
          <strong>{title}.</strong> {message}
        </p>
        <div className="hz-settings-session-recovery-actions">
          <Link href={loginHref} className="hz-settings-session-recovery-link">
            {SETTINGS_SESSION_RECOVERY_COPY.loginAction}
          </Link>
          <button type="button" className="hz-settings-session-recovery-retry" onClick={onRetry} disabled={retrying}>
            {retrying ? SETTINGS_SESSION_RECOVERY_COPY.retryingAction : SETTINGS_SESSION_RECOVERY_COPY.retryAction}
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorState
      title={title}
      message={message}
      actions={
        <>
          <Link href={loginHref} className="hz-btn hz-btn-primary">
            {SETTINGS_SESSION_RECOVERY_COPY.loginAction}
          </Link>
          <UiButton type="button" variant="secondary" size="md" onClick={onRetry} disabled={retrying}>
            {retrying ? SETTINGS_SESSION_RECOVERY_COPY.retryingAction : SETTINGS_SESSION_RECOVERY_COPY.retryAction}
          </UiButton>
        </>
      }
    />
  );
}
