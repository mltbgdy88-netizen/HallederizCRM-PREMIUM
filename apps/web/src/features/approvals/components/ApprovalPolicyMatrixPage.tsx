"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { listPolicyActions } from "@hallederiz/domain";

type PolicyRow = ReturnType<typeof listPolicyActions>[number];
import {
  getApprovalPolicyProductNote,
  mapPolicyActionTypeTr,
  mapPolicyCriticalityTr,
  mapPolicyEffectTr
} from "../policy-matrix-notes";

export function ApprovalPolicyMatrixPage() {
  const rows = useMemo(
    () =>
      listPolicyActions()
        .filter((a) => a.approvalRequired || Boolean(a.approvalPolicyKey))
        .sort((a, b) => {
          if (a.approvalRequired !== b.approvalRequired) return a.approvalRequired ? -1 : 1;
          return a.actionKey.localeCompare(b.actionKey, "tr");
        }),
    []
  );

  const [selectedKey, setSelectedKey] = useState<string | null>(rows[0]?.actionKey ?? null);
  const [draftNote, setDraftNote] = useState("");
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const selected: PolicyRow | null = rows.find((r) => r.actionKey === selectedKey) ?? null;

  const handleSelect = (key: string) => {
    setSelectedKey(key);
    setValidationMessage(null);
    setSubmitted(false);
    const row = rows.find((r) => r.actionKey === key);
    setDraftNote(row ? getApprovalPolicyProductNote(row) : "");
  };

  const handleSave = () => {
    if (!selected) {
      setValidationMessage("Düzenlemek için tablodan bir kural seçin.");
      return;
    }
    if (draftNote.trim().length < 3) {
      setValidationMessage("Ürün notu en az 3 karakter olmalıdır.");
      setSubmitted(false);
      return;
    }
    setValidationMessage(null);
    setSubmitted(true);
  };

  return (
    <div className="hz-approvals-policy-page">
      <header className="hz-approvals-policy-head">
        <p className="hz-approvals-inbox-eyebrow">Onaylar</p>
        <h1 className="hz-approvals-policy-title">Onay kuralları</h1>
        <p className="hz-approvals-policy-lead">
          Domain policy kayıtlarından türetilmiş özet: hangi aksiyonların insan onayı, politika anahtarı ve varsayılan
          etkisi olduğu tek tabloda görünür. Canlı yapılandırma API bağlantısı bekleniyor.
        </p>
        <Link className="hz-approvals-policy-back" href="/onaylar">
          Onay kutusuna dön
        </Link>
      </header>

      <div className="hz-approvals-policy-layout">
        <section className="hz-approvals-policy-card" aria-label="Onay gerektiren aksiyonlar">
          <div className="hz-approvals-policy-table-wrap">
            <table className="hz-approvals-policy-table">
              <thead>
                <tr>
                  <th scope="col">Aksiyon anahtarı</th>
                  <th scope="col">Tür</th>
                  <th scope="col">Varsayılan etki</th>
                  <th scope="col">İnsan onayı</th>
                  <th scope="col">Kritiklik</th>
                  <th scope="col">Politika anahtarı</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.actionKey}
                    className={selectedKey === row.actionKey ? "is-selected" : ""}
                    onClick={() => handleSelect(row.actionKey)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        handleSelect(row.actionKey);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-selected={selectedKey === row.actionKey}
                  >
                    <td className="hz-approvals-policy-mono">{row.actionKey}</td>
                    <td>{mapPolicyActionTypeTr(row.actionType)}</td>
                    <td>{mapPolicyEffectTr(row.defaultEffect)}</td>
                    <td>{row.approvalRequired ? "Evet" : "Hayır"}</td>
                    <td>{mapPolicyCriticalityTr(row.criticality)}</td>
                    <td className="hz-approvals-policy-mono">{row.approvalPolicyKey ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="hz-approvals-policy-edit" aria-label="Kural düzenleme paneli">
          {selected ? (
            <>
              <p className="hz-approvals-inbox-eyebrow">Seçili kural</p>
              <h2 className="hz-approvals-policy-title" style={{ fontSize: "1.1rem" }}>
                {selected.actionKey}
              </h2>
              <div className="detail-list">
                <span>Tür</span>
                <strong>{mapPolicyActionTypeTr(selected.actionType)}</strong>
                <span>Kritiklik</span>
                <strong>{mapPolicyCriticalityTr(selected.criticality)}</strong>
                <span>Politika</span>
                <strong>{selected.approvalPolicyKey ?? "—"}</strong>
              </div>
              <label className="hz-login-field">
                Ürün notu (yerel taslak)
                <textarea
                  rows={4}
                  value={draftNote}
                  onChange={(event) => {
                    setDraftNote(event.target.value);
                    setSubmitted(false);
                    setValidationMessage(null);
                  }}
                  aria-invalid={validationMessage ? true : undefined}
                />
              </label>
              {validationMessage ? (
                <p className="hz-approvals-policy-validation" role="alert">
                  {validationMessage}
                </p>
              ) : null}
              {submitted ? (
                <p className="muted" role="status">
                  Not yerelde doğrulandı; canlı kayıt API bağlantısı bekleniyor.
                </p>
              ) : null}
              <button type="button" className="hz-btn hz-btn-primary" onClick={handleSave}>
                Doğrula
              </button>
            </>
          ) : (
            <p className="hz-approvals-policy-edit-empty">Düzenlemek için tablodan bir kural seçin.</p>
          )}
        </aside>
      </div>
    </div>
  );
}

