"use client";

import Link from "next/link";
import type { PlatformSettings } from "@hallederiz/types";
import { useWhatsAppChannel } from "../../whatsapp/hooks/use-whatsapp-channel";
import { useWhatsAppWebLocalControl } from "../hooks/use-whatsapp-web-local-control";
import {
  isAlternateProviderSelected,
  resolveAlternateProviderLabel,
  resolveMetaCloudBadge
} from "../utils/whatsapp-connection-methods";
import { formatWhatsAppWebLocalCheckedAt } from "../utils/whatsapp-web-local-view";
import { SettingsSessionRecoveryPanel } from "./SettingsSessionRecoveryPanel";

type WhatsAppConnectionMethodsSectionProps = {
  settings: PlatformSettings;
  onChange: (next: PlatformSettings) => void;
  layout?: "settings" | "reference";
};

function badgeClass(tone: string, layout: "settings" | "reference"): string {
  const prefix = layout === "reference" ? "setf-wa-conn-badge" : "hz-settings-wa-conn-badge";
  return `${prefix} ${prefix}--${tone}`;
}

export function WhatsAppConnectionMethodsSection({
  settings,
  onChange,
  layout = "settings"
}: WhatsAppConnectionMethodsSectionProps) {
  const { channelView, health, loading, error, useDemo, refresh } = useWhatsAppChannel();
  const {
    snapshot: localSnapshot,
    view: localView,
    loading: localLoading,
    mutating: localMutating,
    activeAction: localActiveAction,
    sessionError: localSessionError,
    errorMessage: localErrorMessage,
    refresh: refreshLocalStatus,
    start: startLocalPairing,
    refreshPairing,
    disconnect: disconnectLocalPairing,
    logout: logoutLocalPairing
  } = useWhatsAppWebLocalControl();
  const metaBadge = resolveMetaCloudBadge(health, useDemo);
  const alternateActive = isAlternateProviderSelected(settings.whatsapp.provider);
  const rootClass = layout === "reference" ? "setf-wa-conn" : "hz-settings-wa-conn";
  const cardClass = `${rootClass}-card`;
  const gridClass = `${rootClass}-grid`;
  const localBusy = localLoading || localMutating;
  const localControlsBlocked = localBusy || Boolean(localErrorMessage);
  const localCheckedAt = formatWhatsAppWebLocalCheckedAt(localSnapshot?.checkedAt);

  return (
    <div className={rootClass}>
      <div className={`${rootClass}-intro`}>
        <p>
          Resmi production yolu Meta WhatsApp Cloud API&apos;dir. Secret ve token değerleri bu ekranda
          gösterilmez; yalnızca hazırlık durumu ve yönetici kurulum adımları listelenir.
        </p>
        {error ? (
          <p className={`${rootClass}-note ${rootClass}-note--warn`} role="status">
            {error}
          </p>
        ) : null}
      </div>

      <div className={gridClass} role="list" aria-label="WhatsApp bağlantı yöntemleri">
        <article className={`${cardClass} ${cardClass}--featured`} role="listitem">
          <header className={`${cardClass}-head`}>
            <div>
              <h3 className={`${cardClass}-title`}>Meta Cloud API</h3>
              <p className={`${cardClass}-subtitle`}>Resmi ve önerilen production bağlantı yolu</p>
            </div>
            <span className={badgeClass("recommended", layout)}>Önerilen</span>
          </header>
          <div className={`${cardClass}-status`}>
            <span className={`${rootClass}-dot ${rootClass}-dot--${channelView.dotTone}`} aria-hidden />
            <span>{loading ? "Durum yükleniyor…" : channelView.statusLine}</span>
            <span className={badgeClass(metaBadge.tone, layout)}>{metaBadge.label}</span>
          </div>
          <p className={`${cardClass}-body`}>{channelView.note}</p>
          <ul className={`${cardClass}-checklist`}>
            <li>Secret manager: verify token, app secret, API token, phone number id</li>
            <li>Webhook imza doğrulaması fail-closed kalır</li>
            <li>
              Hazırlık kontrolü:{" "}
              <Link href="/ayarlar/staging-kontrol">Staging kontrol</Link>
            </li>
          </ul>
          <div className={`${cardClass}-actions`}>
            <button type="button" className={`${rootClass}-btn`} onClick={() => void refresh()}>
              Durumu yenile
            </button>
            <Link href="/whatsapp" className={`${rootClass}-link`}>
              Operasyon masası
            </Link>
          </div>
        </article>

        <article className={cardClass} role="listitem">
          <header className={`${cardClass}-head`}>
            <div>
              <h3 className={`${cardClass}-title`}>Embedded Signup</h3>
              <p className={`${cardClass}-subtitle`}>Meta uygulama içi rehberli kurulum</p>
            </div>
            <span className={badgeClass("planned", layout)}>Planlandı</span>
          </header>
          <p className={`${cardClass}-body`}>
            Meta Business uygulaması ve izinli redirect URI yapılandırması gerektirir. Backend desteği
            tamamlanana kadar bu yöntem devre dışıdır; mevcut kurulumlar Cloud API üzerinden yapılır.
          </p>
          <button type="button" className={`${rootClass}-btn ${rootClass}-btn--disabled`} disabled>
            Yakında — yapılandırma gerekli
          </button>
        </article>

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
            aria-busy={localBusy}
          >
            <span
              className={`${rootClass}-dot ${rootClass}-dot--${localView.dotTone}`}
              aria-hidden
            />
            <span>
              {localLoading && !localSnapshot
                ? "Yerel beta durumu yükleniyor…"
                : localView.statusText}
            </span>
            <span className={badgeClass(localView.badgeTone, layout)}>
              {localView.badgeLabel}
            </span>
          </div>

          <p className={`${cardClass}-body`}>{localView.description}</p>
          {localCheckedAt && localSnapshot ? (
            <p className={`${cardClass}-body`}>
              Son kontrol: <time dateTime={localSnapshot.checkedAt}>{localCheckedAt}</time>
            </p>
          ) : null}

          <div className={`${cardClass}-qr-frame`}>
            <div className={`${cardClass}-qr-placeholder`}>
              <span className={`${cardClass}-qr-icon`} aria-hidden />
              <span>{localView.qrPlaceholderText}</span>
            </div>
          </div>

          {localSessionError ? (
            <SettingsSessionRecoveryPanel
              layout="inline"
              onRetry={() => void refreshLocalStatus()}
              retrying={localBusy}
              message={localErrorMessage ?? undefined}
            />
          ) : null}
          {!localSessionError && localErrorMessage ? (
            <div className={`${rootClass}-note ${rootClass}-note--warn`} role="alert">
              <p>{localErrorMessage}</p>
              <button
                type="button"
                className={`${rootClass}-btn`}
                onClick={() => void refreshLocalStatus()}
                disabled={localBusy}
              >
                {localLoading ? "Durum kontrol ediliyor…" : "Tekrar dene"}
              </button>
            </div>
          ) : null}

          <p className={`${cardClass}-body`}>{localView.actionHint}</p>
          {localBusy ? (
            <p className={`${cardClass}-body`} role="status" aria-live="polite">
              İşlem tamamlanana kadar diğer yerel kontroller kilitlidir.
            </p>
          ) : null}

          <div className={`${cardClass}-actions`}>
            {localView.actions.start.visible ? (
              <button
                type="button"
                className={`${rootClass}-btn`}
                onClick={() => void startLocalPairing()}
                disabled={!localView.actions.start.enabled || localControlsBlocked}
              >
                {localActiveAction === "start" ? "Başlatılıyor…" : "Yerel betayı başlat"}
              </button>
            ) : null}
            {localView.actions.status.visible ? (
              <button
                type="button"
                className={`${rootClass}-btn`}
                onClick={() => void refreshLocalStatus()}
                disabled={!localView.actions.status.enabled || localControlsBlocked}
              >
                {localActiveAction === "status" ? "Durum kontrol ediliyor…" : "Durumu yenile"}
              </button>
            ) : null}
            {localView.actions.refresh_pairing.visible ? (
              <button
                type="button"
                className={`${rootClass}-btn`}
                onClick={() => void refreshPairing()}
                disabled={
                  !localView.actions.refresh_pairing.enabled || localControlsBlocked
                }
              >
                {localActiveAction === "refresh_pairing"
                  ? "Eşleştirme yenileniyor…"
                  : "Eşleştirmeyi yenile"}
              </button>
            ) : null}
            {localView.actions.disconnect.visible ? (
              <button
                type="button"
                className={`${rootClass}-btn`}
                onClick={() => void disconnectLocalPairing()}
                disabled={!localView.actions.disconnect.enabled || localControlsBlocked}
              >
                {localActiveAction === "disconnect"
                  ? "Bağlantı kesiliyor…"
                  : "Bağlantıyı kes"}
              </button>
            ) : null}
            {localView.actions.logout.visible ? (
              <button
                type="button"
                className={`${rootClass}-btn`}
                onClick={() => void logoutLocalPairing()}
                disabled={!localView.actions.logout.enabled || localControlsBlocked}
              >
                {localActiveAction === "logout"
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

        <article
          className={`${cardClass}${alternateActive ? ` ${cardClass}--active` : ""}`}
          role="listitem"
        >
          <header className={`${cardClass}-head`}>
            <div>
              <h3 className={`${cardClass}-title`}>Twilio / Özel sağlayıcı</h3>
              <p className={`${cardClass}-subtitle`}>Alternatif omnichannel sağlayıcı yolu</p>
            </div>
            {alternateActive ? (
              <span className={badgeClass("neutral", layout)}>{resolveAlternateProviderLabel(settings.whatsapp.provider)}</span>
            ) : (
              <span className={badgeClass("neutral", layout)}>İsteğe bağlı</span>
            )}
          </header>
          <p className={`${cardClass}-body`}>
            Twilio veya özel HTTP sağlayıcı entegrasyonu için platform sağlayıcı seçimini kullanın.
            Production onayı ayrı operasyon ve credential kanıtı gerektirir.
          </p>
          <label className={`${rootClass}-field`}>
            <span>Platform sağlayıcı seçimi</span>
            <select
              className={layout === "reference" ? "setf-select" : "hz-settings-select"}
              value={settings.whatsapp.provider}
              onChange={(e) =>
                onChange({
                  ...settings,
                  whatsapp: {
                    ...settings.whatsapp,
                    provider: e.target.value as PlatformSettings["whatsapp"]["provider"]
                  }
                })
              }
            >
              <option value="meta">Meta Cloud API (önerilen)</option>
              <option value="twilio">Twilio</option>
              <option value="custom">Özel sağlayıcı</option>
            </select>
          </label>
        </article>
      </div>

      <section className={`${rootClass}-ops`} aria-label="Kanal operasyon ayarları">
        <h3 className={`${rootClass}-ops-title`}>Kanal operasyon ayarları</h3>
        <div className={layout === "reference" ? "setf-form-grid" : "hz-settings-form-grid"}>
          <label className={layout === "reference" ? "setf-field" : "hz-settings-label"}>
            {layout === "reference" ? "Kanal etkin" : "WhatsApp açık"}
            {layout === "reference" ? (
              <select
                className="setf-select"
                value={settings.whatsapp.enabled ? "yes" : "no"}
                onChange={(e) =>
                  onChange({
                    ...settings,
                    whatsapp: { ...settings.whatsapp, enabled: e.target.value === "yes" }
                  })
                }
              >
                <option value="yes">Açık</option>
                <option value="no">Kapalı</option>
              </select>
            ) : (
              <input
                type="checkbox"
                checked={settings.whatsapp.enabled}
                onChange={(e) =>
                  onChange({
                    ...settings,
                    whatsapp: { ...settings.whatsapp, enabled: e.target.checked }
                  })
                }
              />
            )}
          </label>
          <label className={layout === "reference" ? "setf-field" : "hz-settings-label"}>
            Gönderen adı
            <input
              className={layout === "reference" ? "setf-input" : "hz-settings-input"}
              value={settings.whatsapp.defaultSenderName}
              onChange={(e) =>
                onChange({
                  ...settings,
                  whatsapp: { ...settings.whatsapp, defaultSenderName: e.target.value }
                })
              }
            />
          </label>
          <label className={layout === "reference" ? "setf-field" : "hz-settings-label"}>
            Mesajda onay iste
            {layout === "reference" ? (
              <select
                className="setf-select"
                value={settings.whatsapp.approvalRequired ? "yes" : "no"}
                onChange={(e) =>
                  onChange({
                    ...settings,
                    whatsapp: { ...settings.whatsapp, approvalRequired: e.target.value === "yes" }
                  })
                }
              >
                <option value="yes">Evet</option>
                <option value="no">Hayır</option>
              </select>
            ) : (
              <input
                type="checkbox"
                checked={settings.whatsapp.approvalRequired}
                onChange={(e) =>
                  onChange({
                    ...settings,
                    whatsapp: { ...settings.whatsapp, approvalRequired: e.target.checked }
                  })
                }
              />
            )}
          </label>
        </div>
      </section>
    </div>
  );
}
