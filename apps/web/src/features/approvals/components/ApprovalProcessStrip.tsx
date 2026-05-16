"use client";

const STEPS = [
  { id: "1", label: "WhatsApp mesajı", hint: "Kanal mesajı veya komut" },
  { id: "2", label: "Otomatik yakalama", hint: "Sistem tarafından işaretlenir" },
  { id: "3", label: "Onay gereksinimi", hint: "Policy / gate" },
  { id: "4", label: "Operatör onayı", hint: "İnsan kararı" },
  { id: "5", label: "Execution & Outbox", hint: "İşlenmiş iş kuyruğu" }
] as const;

/** Eğitim amaçlı statik akış; operasyonel durum göstermez. */
export function ApprovalProcessStrip() {
  return (
    <section className="hz-approvals-inbox-process" aria-label="Onay süreci nasıl çalışır">
      <header className="hz-approvals-inbox-process-head">
        <h2 className="hz-approvals-inbox-process-title">Onay süreci nasıl çalışır?</h2>
        <p className="hz-approvals-inbox-muted">Bilgilendirme amaçlıdır; canlı iş akışı durumu değildir.</p>
      </header>
      <ol className="hz-approvals-inbox-process-track">
        {STEPS.map((step, index) => (
          <li key={step.id} className="hz-approvals-inbox-process-step">
            <span className="hz-approvals-inbox-process-ico" aria-hidden>
              {index + 1}
            </span>
            <span className="hz-approvals-inbox-process-label">{step.label}</span>
            <span className="hz-approvals-inbox-process-hint">{step.hint}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
