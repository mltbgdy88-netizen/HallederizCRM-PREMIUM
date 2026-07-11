"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ErrorState, UiButton } from "@hallederiz/ui";
import { buildSettingsLoginHref } from "../utils/resolve-settings-load-error";

type SettingsSessionRecoveryPanelProps = {
  onRetry: () => void;
  layout?: "settings" | "reference" | "inline";
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
  title = "Oturum doğrulanamadı",
  message = "Oturumunuz sona ermiş veya geçersiz. Ayarları görüntülemek için tekrar giriş yapın."
}: SettingsSessionRecoveryPanelProps) {
  const loginHref = useSettingsReturnLoginHref();

  if (layout === "reference") {
    return (
      <div className="setf-session-recovery" role="alert">
        <h2 className="setf-session-recovery-title">{title}</h2>
        <p className="setf-session-recovery-message">{message}</p>
        <div className="setf-session-recovery-actions">
          <Link href={loginHref} className="setf-btn setf-btn--primary">
            Tekrar giriş yap
          </Link>
          <button type="button" className="setf-btn setf-btn--outline" onClick={onRetry} disabled={retrying}>
            {retrying ? "Deneniyor…" : "Tekrar dene"}
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
            Tekrar giriş yap
          </Link>
          <button type="button" className="hz-settings-session-recovery-retry" onClick={onRetry} disabled={retrying}>
            {retrying ? "Deneniyor…" : "Tekrar dene"}
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
            Tekrar giriş yap
          </Link>
          <UiButton type="button" variant="secondary" size="md" onClick={onRetry} disabled={retrying}>
            {retrying ? "Deneniyor…" : "Tekrar dene"}
          </UiButton>
        </>
      }
    />
  );
}
