import type { OfferContactChannel, OfferFollowUp, OfferResponseState } from "@hallederiz/types";

const channelLabels: Record<OfferContactChannel, string> = {
  whatsapp: "WhatsApp",
  phone: "Telefon",
  email: "E-posta",
  face_to_face: "Yuz yuze"
};

const stateLabels: Record<OfferResponseState, string> = {
  planned: "Planlandi",
  waiting: "Cevap bekliyor",
  positive: "Olumlu",
  negative: "Olumsuz",
  no_response: "Cevap yok"
};

export function OfferFollowupPanel({ followUps }: { followUps: OfferFollowUp[] }) {
  return (
    <div className="hz-tab-content">
      <h3>Follow-up</h3>
      <div className="hz-filter-grid hz-margin-top-sm">
        <label>
          Kanal
          <select defaultValue="whatsapp">
            <option value="whatsapp">WhatsApp</option>
            <option value="phone">Telefon</option>
            <option value="email">E-posta</option>
            <option value="face_to_face">Yuz yuze</option>
          </select>
        </label>
        <label>
          Response State
          <select defaultValue="planned">
            <option value="planned">Planlandi</option>
            <option value="waiting">Cevap bekliyor</option>
            <option value="positive">Olumlu</option>
            <option value="negative">Olumsuz</option>
            <option value="no_response">Cevap yok</option>
          </select>
        </label>
        <label>
          Not
          <input placeholder="Follow-up notu" />
        </label>
        <label>
          Planlanan Tarih
          <input type="datetime-local" />
        </label>
      </div>

      <div className="stock-filter-actions hz-margin-top-sm">
        <button type="button" className="hz-btn hz-btn-primary hz-toolbar-btn">Follow-up Ekle</button>
      </div>

      <div className="table-wrap hz-table-wrap">
        <table className="table hz-table">
          <thead><tr><th>Tarih</th><th>Kanal</th><th>Durum</th><th>Not</th><th>Olusturan</th></tr></thead>
          <tbody>
            {followUps.map((followUp) => (
              <tr key={followUp.id}>
                <td>{new Date(followUp.plannedAt).toLocaleString("tr-TR")}</td>
                <td>{channelLabels[followUp.contactChannel]}</td>
                <td>{stateLabels[followUp.responseState]}</td>
                <td>{followUp.note}</td>
                <td>{followUp.createdBy}</td>
              </tr>
            ))}
            {followUps.length === 0 ? (
              <tr><td colSpan={5}><div className="table-empty">Follow-up kaydi henuz yok.</div></td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
