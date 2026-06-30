export function FactoryFeedbackState({
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
    <section className={`fabf-state fabf-state--${tone}`} role={tone === "error" ? "alert" : "status"}>
      <p>{message}</p>
      {tone === "error" && onRetry ? (
        <button type="button" className="fabf-btn fabf-btn--outline" onClick={onRetry}>
          {retryLabel}
        </button>
      ) : null}
    </section>
  );
}
