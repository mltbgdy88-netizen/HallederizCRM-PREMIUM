"use client";

import { useSettingsHubState } from "../hooks/use-settings-hub-state";
import { HubIcon, IconClose } from "./settings-hub-reference-icons";

export function SettingsHubReferenceLayout() {
  const hub = useSettingsHubState();

  const statusBandClass =
    hub.statusBand.kind === "error"
      ? "ahb-mode-band ahb-mode-band--error"
      : hub.statusBand.kind === "info"
        ? "ahb-mode-band ahb-mode-band--info"
        : "ahb-demo-banner";

  if (hub.loading) {
    return (
      <div className="ahb-home ahb-home--embedded" data-page="settings-hub-reference" aria-live="polite">
        <header className="ahb-head">
          <h1>{hub.pageCopy.title}</h1>
          <p>{hub.pageCopy.subtitle}</p>
        </header>
        <div className="ahb-state" role="status">
          Ayar hub özeti yükleniyor…
        </div>
      </div>
    );
  }

  return (
    <div className="ahb-home ahb-home--embedded" data-page="settings-hub-reference" aria-live="polite">
      <header className="ahb-head">
        <h1>{hub.pageCopy.title}</h1>
        <p>{hub.pageCopy.subtitle}</p>
      </header>

      {hub.showDemoBanner ? (
        <div className="ahb-demo-banner" role="status">
          <span>{hub.statusBand.message}</span>
          <button type="button" className="ahb-demo-close" aria-label="Bildirimi kapat" onClick={hub.dismissDemoBanner}>
            <IconClose />
          </button>
        </div>
      ) : (
        <div className={statusBandClass} role="status">
          <span>{hub.statusBand.message}</span>
        </div>
      )}

      <div className="ahb-grid">
        {hub.cards.map((card) => (
          <button
            key={card.id}
            type="button"
            className="ahb-card"
            onClick={() => hub.handleCardActivate(card)}
          >
            <span className="ahb-card-icon" aria-hidden>
              <HubIcon icon={card.icon} />
            </span>
            <h2>{card.title}</h2>
            <p>{card.description}</p>
            <span className="ahb-card-arrow" aria-hidden>
              →
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
