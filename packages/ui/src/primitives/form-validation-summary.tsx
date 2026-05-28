export type FormValidationSummaryProps = {
  /** Boşsa hiçbir şey çizilmez. */
  messages: string[];
  title?: string;
  /** `danger`: role=alert; `info`: role=status (bilgilendirme). */
  variant?: "danger" | "info";
};

/** Task 17 — doğrulama / uyarı özeti (liste). */
export function FormValidationSummary({
  messages,
  title = "Formda düzeltilmesi gereken alanlar var.",
  variant = "danger"
}: FormValidationSummaryProps) {
  if (!messages.length) {
    return null;
  }
  const role = variant === "danger" ? "alert" : "status";
  const mod = variant === "info" ? "hz-form-validation-summary--info" : "";
  return (
    <div role={role} className={["hz-form-validation-summary", mod].filter(Boolean).join(" ")}>
      <h3 className="hz-form-validation-summary-title">{title}</h3>
      <ul className="hz-form-validation-summary-list">
        {messages.map((text, index) => (
          <li key={index}>{text}</li>
        ))}
      </ul>
    </div>
  );
}

