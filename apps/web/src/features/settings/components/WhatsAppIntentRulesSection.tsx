"use client";

import { useCallback, useMemo } from "react";
import type {
  RuleDecision,
  RuleDecisionSetting,
  WhatsAppIntent,
  WhatsAppIntentRule,
  WhatsAppIntentRulesConfig
} from "@hallederiz/types";

const DECISION_KEYS = [
  { key: "registeredPhone" as const, title: "Kayıtlı telefon" },
  { key: "linkedCustomer" as const, title: "Cari eşleşmesi" },
  { key: "autoReply" as const, title: "Otomatik cevap" },
  { key: "customerConfirmation" as const, title: "Müşteri teyidi" },
  { key: "internalApproval" as const, title: "İç onay" },
  { key: "salesApproval" as const, title: "Satış onayı" },
  { key: "accountingApproval" as const, title: "Muhasebe onayı" },
  { key: "crmApproval" as const, title: "CRM / Yönetici onayı" }
];

const TEMPLATE_VARS = "{cari}, {ürün}, {belge_no}, {saat}, {grup}, {ürünler}";

const ROW_DISPLAY: Record<WhatsAppIntent, string> = {
  stok: "Stok",
  fiyat: "Fiyat",
  ekstre: "Ekstre",
  siparis: "Sipariş",
  odeme: "Ödeme",
  iade: "İade",
  fatura: "Fatura",
  hatali_urun: "Hatalı ürün",
  diger: "Diğer"
};

function decisionLabel(v: RuleDecision): string {
  if (v === "yes") return "Evet";
  if (v === "no") return "Hayır";
  return "Koşullu";
}

function decisionValClass(v: RuleDecision): string {
  const base = "hz-settings-rule-val";
  if (v === "yes") return `${base} hz-settings-rule-val--ok`;
  if (v === "conditional") return `${base} hz-settings-rule-val--warn`;
  return base;
}

function templatePreview(text: string, max = 60): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t || "—";
  return `${t.slice(0, max)}…`;
}

function countApprovalIntents(intents: WhatsAppIntentRule[]): number {
  const keys = ["internalApproval", "salesApproval", "accountingApproval", "crmApproval"] as const;
  return intents.filter((row) =>
    keys.some((k) => {
      const v = (row[k] as RuleDecisionSetting).value;
      return v === "yes" || v === "conditional";
    })
  ).length;
}

function autoReplySummary(intents: WhatsAppIntentRule[]): string {
  const vals = intents.map((r) => r.autoReply.value);
  if (vals.every((v) => v === "no")) return "Kapalı";
  if (vals.some((v) => v === "yes")) return "Açık";
  return "Sınırlı";
}

export function WhatsAppIntentRulesSection({
  value,
  selectedIntentId,
  onSelectIntent,
  onEditIntent,
  aiHumanApprovalRequired
}: {
  value: WhatsAppIntentRulesConfig;
  selectedIntentId: WhatsAppIntent;
  onSelectIntent: (id: WhatsAppIntent) => void;
  /** Satırda Düzenle: seç + sağ panelde düzenleme modu */
  onEditIntent: (id: WhatsAppIntent) => void;
  aiHumanApprovalRequired: boolean;
}) {
  const stats = useMemo(() => {
    const intents = value.intents;
    return {
      intentCount: intents.length,
      approvalHeavy: countApprovalIntents(intents),
      autoReplyLabel: autoReplySummary(intents),
      aiSafety: aiHumanApprovalRequired ? "İnsan onaylı" : "Dikkat"
    };
  }, [value.intents, aiHumanApprovalRequired]);

  return (
    <div className="hz-settings-rule-matrix">
      <div className="hz-settings-rule-summary">
        <div className="hz-settings-rule-summary-head">
          <h3 className="hz-settings-rule-summary-title">Kural ve Onay Yönetimi</h3>
          <p className="hz-settings-rule-summary-desc">
            WhatsApp ve AI işlemlerinde hangi taleplerin otomatik cevaplanacağını, hangilerinin insan onayına düşeceğini
            yönetin.
          </p>
        </div>
        <details className="hz-settings-rule-summary-details">
          <summary>Özet sayaçlar</summary>
          <div className="hz-settings-rule-summary-strip" role="list">
            <div className="hz-settings-rule-summary-chip" role="listitem">
              <span className="hz-settings-rule-summary-chip-label">Güvenli varsayılan</span>
              <span className="hz-settings-rule-summary-chip-value hz-settings-rule-summary-chip-value--ok">Aktif</span>
            </div>
            <div className="hz-settings-rule-summary-chip" role="listitem">
              <span className="hz-settings-rule-summary-chip-label">Talep türü</span>
              <span className="hz-settings-rule-summary-chip-value">{stats.intentCount}</span>
            </div>
            <div className="hz-settings-rule-summary-chip" role="listitem">
              <span className="hz-settings-rule-summary-chip-label">Onay isteyen</span>
              <span className="hz-settings-rule-summary-chip-value">{stats.approvalHeavy}</span>
            </div>
            <div className="hz-settings-rule-summary-chip" role="listitem">
              <span className="hz-settings-rule-summary-chip-label">Otomatik cevap</span>
              <span className="hz-settings-rule-summary-chip-value">{stats.autoReplyLabel}</span>
            </div>
            <div className="hz-settings-rule-summary-chip" role="listitem">
              <span className="hz-settings-rule-summary-chip-label">AI güvenliği</span>
              <span className="hz-settings-rule-summary-chip-value">{stats.aiSafety}</span>
            </div>
          </div>
        </details>
      </div>

      <article className="hz-settings-info-card hz-settings-info-card--muted hz-settings-rule-security-inline">
        <h4 className="hz-settings-rule-security-inline-title">Şablon güvenliği</h4>
        <p className="hz-settings-rule-security-inline-text">
          Kesin fiyat / stok / termin taahhüdü vermeyin. Kritik işlemler onaydan sonra gider. Değişkenler: {"{cari}"},{" "}
          {"{ürün}"}, {"{belge_no}"}, {"{saat}"}.
        </p>
      </article>

      <div className="hz-settings-rule-table-wrap">
        <div className="hz-settings-rule-table" role="table" aria-label="WhatsApp talep türü kuralları">
          <div className="hz-settings-rule-head hz-settings-rule-grid-row" role="row">
            <div className="hz-settings-rule-name hz-settings-rule-th" role="columnheader">
              Talep
            </div>
            <div className="hz-settings-rule-risk hz-settings-rule-th" role="columnheader">
              Risk / özet
            </div>
            <div className="hz-settings-rule-th hz-settings-rule-th-pill" role="columnheader" title="Kayıtlı telefon">
              Kayıtlı tel.
            </div>
            <div className="hz-settings-rule-th hz-settings-rule-th-pill" role="columnheader" title="Cari eşleşmesi">
              Cari eşl.
            </div>
            <div className="hz-settings-rule-th hz-settings-rule-th-pill" role="columnheader" title="Otomatik cevap">
              Oto. cevap
            </div>
            <div className="hz-settings-rule-th hz-settings-rule-th-pill" role="columnheader" title="Müşteri teyidi">
              Teyit
            </div>
            <div className="hz-settings-rule-th hz-settings-rule-th-pill" role="columnheader" title="İç onay">
              İç onay
            </div>
            <div className="hz-settings-rule-th hz-settings-rule-th-pill" role="columnheader" title="Satış onayı">
              Satış onay
            </div>
            <div className="hz-settings-rule-th hz-settings-rule-th-pill" role="columnheader" title="Muhasebe onayı">
              Muh. onay
            </div>
            <div className="hz-settings-rule-th hz-settings-rule-th-pill" role="columnheader" title="CRM onayı">
              CRM onay
            </div>
            <div className="hz-settings-rule-preview hz-settings-rule-th" role="columnheader">
              Şablon
            </div>
            <div className="hz-settings-rule-actions hz-settings-rule-th" role="columnheader">
              İşlem
            </div>
          </div>

          {value.intents.map((row) => {
            const selected = row.intentId === selectedIntentId;
            return (
              <div
                key={row.intentId}
                className={`hz-settings-rule-row hz-settings-rule-grid-row${selected ? " hz-settings-rule-row--selected" : ""}`}
                role="row"
              >
                <button
                  type="button"
                  className="hz-settings-rule-name hz-settings-rule-cell-btn"
                  onClick={() => onSelectIntent(row.intentId)}
                  title="Detayı sağ panelde aç"
                >
                  {ROW_DISPLAY[row.intentId]}
                </button>
                <div className="hz-settings-rule-risk" title={row.riskTag}>
                  {row.riskTag}
                </div>
                {DECISION_KEYS.map(({ key, title }) => {
                  const setting = row[key] as RuleDecisionSetting;
                  const tip =
                    setting.value === "conditional" && setting.note?.trim()
                      ? `${title}: ${setting.note}`
                      : `${title}: ${decisionLabel(setting.value)}`;
                  return (
                    <span key={key} className={decisionValClass(setting.value)} title={tip} role="cell">
                      {decisionLabel(setting.value)}
                    </span>
                  );
                })}
                <div className="hz-settings-rule-preview" title={row.templateText}>
                  {row.templateText.trim() ? templatePreview(row.templateText) : "—"}
                </div>
                <div className="hz-settings-rule-actions">
                  <button type="button" className="hz-settings-rule-action-btn" onClick={() => onSelectIntent(row.intentId)}>
                    Detay
                  </button>
                  <button type="button" className="hz-settings-rule-action-btn" onClick={() => onEditIntent(row.intentId)}>
                    Düzenle
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function IntentRuleAssistantPanel({
  rule,
  editMode,
  onEditMode,
  onChangeRule
}: {
  rule: WhatsAppIntentRule | undefined;
  editMode: boolean;
  onEditMode: (next: boolean) => void;
  onChangeRule: (patch: Partial<WhatsAppIntentRule>) => void;
}) {
  const setDecision = useCallback(
    (fieldKey: (typeof DECISION_KEYS)[number]["key"], nextValue: RuleDecision, note?: string) => {
      if (!rule) return;
      const prev = rule[fieldKey] as RuleDecisionSetting;
      const nextSetting: RuleDecisionSetting =
        nextValue === "conditional"
          ? { value: "conditional", note: note ?? prev.note ?? "" }
          : { value: nextValue };
      onChangeRule({ [fieldKey]: nextSetting } as Partial<WhatsAppIntentRule>);
    },
    [onChangeRule, rule]
  );

  if (!rule) {
    return (
      <article className="hz-settings-side-card">
        <p className="hz-settings-side-muted">Kural bulunamadı.</p>
      </article>
    );
  }

  const conditionalNotes = DECISION_KEYS.map(({ key, title }) => {
    const st = rule[key] as RuleDecisionSetting;
    if (st.value !== "conditional" || !st.note?.trim()) return null;
    return (
      <li key={key}>
        <strong>{title}:</strong> {st.note}
      </li>
    );
  }).filter(Boolean);

  return (
    <>
      <article className="hz-settings-side-card hz-settings-rule-detail">
        <h3 className="hz-settings-side-card-title">Seçili talep türü</h3>
        <p className="hz-settings-rule-detail-name">{ROW_DISPLAY[rule.intentId]}</p>
        <p className="hz-settings-rule-detail-risk">Risk: {rule.riskTag}</p>
        <p className="hz-settings-rule-detail-lead">Özet tabloda kısa kullanıcı dili görünür; ayrıntılı Evet / Hayır / Koşullu seçimleri düzenleme modunda yönetilir.</p>
      </article>

      <article className="hz-settings-side-card">
        <h3 className="hz-settings-side-card-title">Koşullu notlar</h3>
        {conditionalNotes.length > 0 ? (
          <ul className="hz-settings-rule-detail-notes">{conditionalNotes}</ul>
        ) : (
          <p className="hz-settings-side-muted">Bu talep türünde kayıtlı koşullu not yok.</p>
        )}
      </article>

      <article className="hz-settings-side-card">
        <h3 className="hz-settings-side-card-title">Mesaj şablonu</h3>
        {editMode ? (
          <>
            <textarea
              className="hz-settings-textarea hz-settings-rule-template"
              rows={5}
              value={rule.templateText}
              onChange={(e) => onChangeRule({ templateText: e.target.value })}
              spellCheck={false}
            />
            <p className="hz-settings-rule-template-hint">Değişkenler: {TEMPLATE_VARS}</p>
          </>
        ) : (
          <p className="hz-settings-rule-template-readonly">{rule.templateText.trim() || "—"}</p>
        )}
      </article>

      <article className="hz-settings-side-card">
        <h3 className="hz-settings-side-card-title">Kararlar</h3>
        {editMode ? (
          <div className="hz-settings-rule-side-editor">
            {DECISION_KEYS.map(({ key, title }) => {
              const setting = rule[key] as RuleDecisionSetting;
              return (
                <div key={key} className="hz-settings-rule-editor-row">
                  <span className="hz-settings-rule-editor-label">{title}</span>
                  <div className="hz-settings-segment" role="group" aria-label={title}>
                    {(["yes", "no", "conditional"] as const).map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        className={`hz-settings-segment-btn${setting.value === opt ? " hz-settings-segment-btn--active" : ""}`}
                        onClick={() => setDecision(key, opt, setting.note)}
                      >
                        {decisionLabel(opt)}
                      </button>
                    ))}
                  </div>
                  {setting.value === "conditional" ? (
                    <label className="hz-settings-rule-note-label">
                      Koşul notu
                      <input
                        className="hz-settings-input hz-settings-rule-note-input"
                        value={setting.note ?? ""}
                        onChange={(e) =>
                          onChangeRule({
                            [key]: { value: "conditional", note: e.target.value }
                          } as Partial<WhatsAppIntentRule>)
                        }
                        placeholder="Koşul açıklaması"
                      />
                    </label>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="hz-settings-side-muted">Okuma modu. Düzenlemek için aşağıdaki düğmeye basın.</p>
        )}
        <div className="hz-settings-rule-side-actions">
          {editMode ? (
            <button type="button" className="hz-settings-toolbar-btn hz-settings-toolbar-btn--outline" onClick={() => onEditMode(false)}>
              Okuma moduna dön
            </button>
          ) : (
            <button type="button" className="hz-settings-toolbar-btn hz-settings-toolbar-btn--primary" onClick={() => onEditMode(true)}>
              Düzenle
            </button>
          )}
        </div>
      </article>

      <article className="hz-settings-side-card hz-settings-rule-detail-security">
        <h3 className="hz-settings-side-card-title">Güvenlik</h3>
        <p className="hz-settings-risk-note">AI tek başına kayıt değiştirmez.</p>
        <p className="hz-settings-risk-note">Kritik işlemler Onaylar ekranına düşer.</p>
      </article>
    </>
  );
}
