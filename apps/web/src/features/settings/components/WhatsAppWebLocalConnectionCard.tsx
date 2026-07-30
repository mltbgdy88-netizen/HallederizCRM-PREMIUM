"use client";

import type { UseWhatsAppWebLocalControlResult } from "../hooks/use-whatsapp-web-local-control";
import { formatWhatsAppWebLocalCheckedAt } from "../utils/whatsapp-web-local-view";
import { SettingsSessionRecoveryPanel } from "./SettingsSessionRecoveryPanel";

export type WhatsAppWebLocalConnectionCardProps = {
  control: UseWhatsAppWebLocalControlResult;
  layout: "settings" | "reference";
};

function badgeClass(tone: string, layout: "settings" | "reference"): string {
  const prefix =
    layout === "reference" ? "setf-wa-conn-badge" : "hz-settings-wa-conn-badge";
  return `${prefix} ${prefix}--${tone}`;
}

export function WhatsAppWebLocalConnectionCard({
  control,
  layout
}: WhatsAppWebLocalConnectionCardProps) {
  const {
    snapshot,
    view,
    loading,
    mutating,
    activeAction,
    sessionError,
    errorMessage,
    refresh,
    start,
    refreshPairing,
    disconnect,
    logout
  } = control;
  const rootClass =
    layout === "reference" ? "setf-wa-conn" : "hz-settings-wa-conn";
  const cardClass = `${rootClass}-card`;
  const busy = loading || mutating;
  const controlsBlocked = busy || Boolean(errorMessage);
  const checkedAt = formatWhatsAppWebLocalCheckedAt(snapshot?.checkedAt);
  const runAvailableAction = (
    enabled: boolean,
    action: () => Promise<void>
  ): void => {
    if (!enabled || controlsBlocked) {
      return;
    }
    void action();
  };

  return (
    <article className={`${cardClass} ${cardClass}--muted`} role="listitem">
      <header className={`${cardClass}-head`}>
        <div>
          <h3 className={`${cardClass}-title`}>WhatsApp Web Yerel Beta</h3>
          <p className={`${cardClass}-subtitle`}>
            Yerel eşleştirme denemesi — production yolu değil
          </p>
        </div>
        <span className={badgeClass("beta", layout)}>Beta / yerel</span>
      </header>

      <div
        className={`${cardClass}-status`}
        role="status"
        aria-live="polite"
        aria-busy={busy}
      >
        <span
          className={`${rootClass}-dot ${rootClass}-dot--${view.dotTone}`}
          aria-hidden
        />
        <span>
          {loading && !snapshot
            ? "Yerel beta durumu yükleniyor…"
            : view.statusText}
        </span>
        <span className={badgeClass(view.badgeTone, layout)}>
          {view.badgeLabel}
        </span>
      </div>

      <p className={`${cardClass}-body`}>{view.description}</p>
      {checkedAt && snapshot ? (
        <p className={`${cardClass}-body`}>
          Son kontrol: <time dateTime={snapshot.checkedAt}>{checkedAt}</time>
        </p>
      ) : null}

      <div className={`${cardClass}-qr-frame`}>
        <div className={`${cardClass}-qr-placeholder`}>
          <span className={`${cardClass}-qr-icon`} aria-hidden />
          <span>{view.qrPlaceholderText}</span>
        </div>
      </div>

      {sessionError ? (
        <SettingsSessionRecoveryPanel
          layout="inline"
          onRetry={() => void refresh()}
          retrying={busy}
          message={errorMessage ?? undefined}
        />
      ) : null}
      {!sessionError && errorMessage ? (
        <div className={`${rootClass}-note ${rootClass}-note--warn`} role="alert">
          <p>{errorMessage}</p>
          <button
            type="button"
            className={`${rootClass}-btn`}
            onClick={() => void refresh()}
            disabled={busy}
          >
            {loading ? "Durum kontrol ediliyor…" : "Tekrar dene"}
          </button>
        </div>
      ) : null}

      <p className={`${cardClass}-body`}>{view.actionHint}</p>
      {busy ? (
        <p className={`${cardClass}-body`} role="status" aria-live="polite">
          İşlem tamamlanana kadar diğer yerel kontroller kilitlidir.
        </p>
      ) : null}

      <div className={`${cardClass}-actions`}>
        {view.actions.start.visible ? (
          <button
            type="button"
            className={`${rootClass}-btn`}
            onClick={() => runAvailableAction(view.actions.start.enabled, start)}
            disabled={!view.actions.start.enabled || controlsBlocked}
          >
            {activeAction === "start" ? "Başlatılıyor…" : "Yerel betayı başlat"}
          </button>
        ) : null}
        {view.actions.status.visible ? (
          <button
            type="button"
            className={`${rootClass}-btn`}
            onClick={() => runAvailableAction(view.actions.status.enabled, refresh)}
            disabled={!view.actions.status.enabled || controlsBlocked}
          >
            {activeAction === "status" ? "Durum kontrol ediliyor…" : "Durumu yenile"}
          </button>
        ) : null}
        {view.actions.refresh_pairing.visible ? (
          <button
            type="button"
            className={`${rootClass}-btn`}
            onClick={() =>
              runAvailableAction(
                view.actions.refresh_pairing.enabled,
                refreshPairing
              )
            }
            disabled={!view.actions.refresh_pairing.enabled || controlsBlocked}
          >
            {activeAction === "refresh_pairing"
              ? "Eşleştirme yenileniyor…"
              : "Eşleştirmeyi yenile"}
          </button>
        ) : null}
        {view.actions.disconnect.visible ? (
          <button
            type="button"
            className={`${rootClass}-btn`}
            onClick={() =>
              runAvailableAction(view.actions.disconnect.enabled, disconnect)
            }
            disabled={!view.actions.disconnect.enabled || controlsBlocked}
          >
            {activeAction === "disconnect"
              ? "Bağlantı kesiliyor…"
              : "Bağlantıyı kes"}
          </button>
        ) : null}
        {view.actions.logout.visible ? (
          <button
            type="button"
            className={`${rootClass}-btn`}
            onClick={() => runAvailableAction(view.actions.logout.enabled, logout)}
            disabled={!view.actions.logout.enabled || controlsBlocked}
          >
            {activeAction === "logout"
              ? "Yerel durum kapatılıyor…"
              : "Yerel oturumdan çık"}
          </button>
        ) : null}
      </div>

      <ul className={`${cardClass}-checklist`}>
        <li>Bu özellik Beta / Yerel&apos;dir.</li>
        <li>Production go-live sağlamaz.</li>
        <li>GATE-P0-WA durumunu değiştirmez.</li>
        <li>Resmi production yolu Meta WhatsApp Cloud API&apos;dir.</li>
        <li>Mesaj gönderimi kapalıdır.</li>
      </ul>
      <p className={`${cardClass}-body ${cardClass}-body--emphasis`}>
        Gerçek QR, sağlayıcı, session saklama ve canlı mesaj gönderimi bu kapsamda yoktur.
      </p>
    </article>
  );
}
