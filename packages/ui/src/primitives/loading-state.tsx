import { UiSkeleton } from "./skeleton";

export type LoadingStateProps = {
  title?: string;
  /** Ek açıklama; verilmezse yalnızca başlık gösterilir. */
  message?: string;
  className?: string;
};

export function LoadingState({ title = "Yükleniyor", message, className = "" }: LoadingStateProps) {
  return (
    <div className={["hz-ui-empty hz-ui-empty--loading", className].filter(Boolean).join(" ")} role="status" aria-busy="true" aria-live="polite">
      <UiSkeleton lines={2} />
      <h4 className="hz-ui-empty-title">{title}</h4>
      {message ? <p className="hz-ui-empty-message">{message}</p> : null}
    </div>
  );
}

