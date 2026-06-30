export function ErpFeedbackState({
  tone,
  message,
  onRetry,
  retryLabel = "Yeniden dene"
}: {
  tone: "loading" | "error";
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}) {
  return (
    <section className={`erpf-state erpf-state--${tone}`} role={tone === "error" ? "alert" : "status"}>
      <p>{message}</p>
      {tone === "error" && onRetry ? (
        <button type="button" className="erpf-btn erpf-btn--ghost" onClick={onRetry}>
          {retryLabel}
        </button>
      ) : null}
    </section>
  );
}
