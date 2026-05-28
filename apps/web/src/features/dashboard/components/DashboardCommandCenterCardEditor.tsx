"use client";

import { UiButton, UiModal } from "@hallederiz/ui";
import { useMemo } from "react";
import { LucideIcon, type LucideIconName } from "../../../components/icons/lucide-icons";
import {
  COMMAND_CENTER_PANELS,
  type CommandCenterPanelDef,
  type CommandCenterPanelId
} from "../utils/dashboard-command-center-panels";

const PANEL_ICONS: Record<CommandCenterPanelId, LucideIconName> = {
  alerts: "bell-ring",
  tasks: "clipboard-check",
  flow: "bar-chart-3",
  recent: "file-text",
  quick: "grid-3x3"
};

type Props = {
  open: boolean;
  draftIds: CommandCenterPanelId[];
  onClose: () => void;
  onToggle: (id: CommandCenterPanelId) => void;
  onSave: () => void;
};

export function DashboardCommandCenterCardEditor({ open, draftIds, onClose, onToggle, onSave }: Props) {
  const grouped = useMemo(() => {
    const groups: Record<CommandCenterPanelDef["category"], CommandCenterPanelDef[]> = {
      "Üst bölüm": [],
      "Orta bölüm": [],
      "Alt bölüm": []
    };
    for (const panel of COMMAND_CENTER_PANELS) {
      groups[panel.category].push(panel);
    }
    return groups;
  }, []);

  return (
    <UiModal
      open={open}
      title="Kartları düzenle"
      onClose={onClose}
      closeLabel="Kapat"
      footer={
        <>
          <UiButton type="button" variant="ghost" size="sm" onClick={onClose}>
            Vazgeç
          </UiButton>
          <UiButton type="button" variant="primary" size="sm" onClick={onSave} disabled={draftIds.length < 1}>
            Kaydet
          </UiButton>
        </>
      }
    >
      <p className="hz-dash-card-editor-lead">Ana sayfada görmek istediğiniz bölümleri seçin.</p>
      <div className="hz-dash-card-editor-body">
        <section className="hz-dash-card-editor-options">
          {(Object.keys(grouped) as Array<CommandCenterPanelDef["category"]>).map((group) => (
            <div key={group} className="hz-dash-card-editor-group">
              <h3>{group}</h3>
              <ul>
                {grouped[group].map((panel) => (
                  <li key={panel.id}>
                    <label className="hz-dash-card-option">
                      <span className="hz-dash-card-option-main">
                        <span className="hz-dash-card-option-ico hz-cc-panel-option-ico" aria-hidden>
                          <LucideIcon name={PANEL_ICONS[panel.id]} size={15} strokeWidth={2.25} />
                        </span>
                        <span>
                          <strong>{panel.title}</strong>
                          <small>{panel.description}</small>
                        </span>
                      </span>
                      <input
                        type="checkbox"
                        checked={draftIds.includes(panel.id)}
                        onChange={() => onToggle(panel.id)}
                        aria-label={`${panel.title} bölümünü göster`}
                      />
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <aside className="hz-dash-card-editor-preview">
          <h3>Seçili bölümler</h3>
          <p>Bu bölümler ana sayfada görünecek.</p>
          <ol>
            {draftIds.map((id) => {
              const panel = COMMAND_CENTER_PANELS.find((item) => item.id === id);
              if (!panel) return null;
              return (
                <li key={id}>
                  <span className="hz-dash-card-order-ico">
                    <LucideIcon name={PANEL_ICONS[id]} size={14} strokeWidth={2.25} />
                  </span>
                  <span>{panel.title}</span>
                </li>
              );
            })}
          </ol>
        </aside>
      </div>
    </UiModal>
  );
}

