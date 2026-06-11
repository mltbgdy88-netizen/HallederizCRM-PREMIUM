"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { listPolicyActions } from "@hallederiz/domain";
import { useToast } from "../../../providers/toast-provider";
import {
  getApprovalPolicyProductNote,
  mapPolicyActionTypeTr,
  mapPolicyCriticalityTr,
  mapPolicyEffectTr
} from "../policy-matrix-notes";

type PolicyRow = ReturnType<typeof listPolicyActions>[number];

export function ApprovalPolicyMatrixPage() {
  const { pushToast } = useToast();
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
  const [draftNote, setDraftNote] = useState(() => (rows[0] ? getApprovalPolicyProductNote(rows[0]) : ""));
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
    pushToast("Demo: politika notu doğrulandı; canlı kayıt API bağlantısı bekleniyor.");
  };

  return (
    <section className="apvf-policy-page" data-page="approvals-policy-matrix-reference">
      <div className="apvf-policy-shell">
        <header className="apvf-policy-header">
          <div>
            <p className="apvf-policy-header__eyebrow">Onaylar</p>
            <h1>Onay kuralları</h1>
            <p className="apvf-policy-header__meta">
              Domain policy kayıtlarından türetilmiş özet: hangi aksiyonların insan onayı, politika anahtarı ve
              varsayılan etkisi olduğu tek tabloda görünür.
            </p>
          </div>
          <Link className="apvf-policy-header__back" href="/onaylar">
            ← Onay masası
          </Link>
        </header>

        <p className="apvf-policy-demo-band" role="status">
          Canlı yapılandırma API bağlantısı bekleniyor; not doğrulama toast-only ve yerel taslaktır.
        </p>

        <div className="apvf-policy-layout">
          <section className="apvf-policy-table-card" aria-label="Onay gerektiren aksiyonlar">
            <div className="apvf-policy-table-wrap">
              <table className="apvf-policy-table">
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
                      <td className="apvf-policy-mono">{row.actionKey}</td>
                      <td>{mapPolicyActionTypeTr(row.actionType)}</td>
                      <td>{mapPolicyEffectTr(row.defaultEffect)}</td>
                      <td>{row.approvalRequired ? "Evet" : "Hayır"}</td>
                      <td>{mapPolicyCriticalityTr(row.criticality)}</td>
                      <td className="apvf-policy-mono">{row.approvalPolicyKey ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <aside className="apvf-policy-edit" aria-label="Kural düzenleme paneli">
            {selected ? (
              <>
                <p className="apvf-policy-header__eyebrow">Seçili kural</p>
                <h2>{selected.actionKey}</h2>
                <div className="apvf-policy-detail-grid">
                  <div>
                    <span>Tür</span>
                    <strong>{mapPolicyActionTypeTr(selected.actionType)}</strong>
                  </div>
                  <div>
                    <span>Kritiklik</span>
                    <strong>{mapPolicyCriticalityTr(selected.criticality)}</strong>
                  </div>
                  <div>
                    <span>Politika</span>
                    <strong>{selected.approvalPolicyKey ?? "—"}</strong>
                  </div>
                  <div>
                    <span>İnsan onayı</span>
                    <strong>{selected.approvalRequired ? "Evet" : "Hayır"}</strong>
                  </div>
                </div>
                <label className="apvf-policy-field">
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
                  <p className="apvf-policy-validation" role="alert">
                    {validationMessage}
                  </p>
                ) : null}
                {submitted ? (
                  <p className="apvf-policy-status" role="status">
                    Not yerelde doğrulandı; canlı kayıt API bağlantısı bekleniyor.
                  </p>
                ) : null}
                <button type="button" className="apvf-policy-btn" onClick={handleSave}>
                  Doğrula
                </button>
              </>
            ) : (
              <p className="apvf-policy-edit-empty">Düzenlemek için tablodan bir kural seçin.</p>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
}
