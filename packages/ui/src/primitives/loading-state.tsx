import { UiSkeleton } from "./skeleton";

export type LoadingStateProps = {
  title?: string;
  message: string;
  className?: string;
};

export function LoadingState({ title = "Yükleniyor", message, className = "" }: LoadingStateProps) {
  return (
    <div className={["hz-ui-empty hz-ui-empty--loading", className].filter(Boolean).join(" ")} role="status" aria-busy="true">
      <UiSkeleton lines={2} />
      <h4 className="hz-ui-empty-title">{title}</h4>
      <p className="hz-ui-empty-message">{message}</p>
    </div>
  );
}
