import Link from "next/link";
import { listPolicyActions } from "@hallederiz/domain";
import {
  getApprovalPolicyProductNote,
  mapPolicyActionTypeTr,
  mapPolicyCriticalityTr,
  mapPolicyEffectTr
} from "../policy-matrix-notes";

export function ApprovalPolicyMatrixPage() {
  const rows = listPolicyActions()
    .filter((a) => a.approvalRequired || Boolean(a.approvalPolicyKey))
    .sort((a, b) => {
      if (a.approvalRequired !== b.approvalRequired) return a.approvalRequired ? -1 : 1;
      return a.actionKey.localeCompare(b.actionKey, "tr");
    });

  return (
    <div className="hz-approvals-policy-page">
      <header className="hz-approvals-policy-head">
        <p className="hz-approvals-inbox-eyebrow">Onaylar</p>
        <h1 className="hz-approvals-policy-title">Politika matrisi</h1>
        <p className="hz-approvals-policy-lead">
          Domain policy kayıtlarından türetilmiş özet: hangi aksiyonların insan onayı, politika anahtarı ve varsayılan
          etkisi olduğu tek tabloda görünür. Üretimde gerçek karar motoru API ve tenant yapılandırması ile birleşir.
        </p>
        <Link className="hz-approvals-policy-back" href="/onaylar">
          Onay kutusuna dön
        </Link>
      </header>

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
                <th scope="col">Ürün notu</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.actionKey}>
                  <td className="hz-approvals-policy-mono">{row.actionKey}</td>
                  <td>{mapPolicyActionTypeTr(row.actionType)}</td>
                  <td>{mapPolicyEffectTr(row.defaultEffect)}</td>
                  <td>{row.approvalRequired ? "Evet" : "Hayır"}</td>
                  <td>{mapPolicyCriticalityTr(row.criticality)}</td>
                  <td className="hz-approvals-policy-mono">{row.approvalPolicyKey ?? "—"}</td>
                  <td className="hz-approvals-policy-note">{getApprovalPolicyProductNote(row)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
