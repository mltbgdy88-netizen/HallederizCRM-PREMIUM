import type { HTMLAttributes } from "react";

export type UiSkeletonProps = HTMLAttributes<HTMLDivElement> & {
  /** Birden fazla satır iskeleti */
  lines?: number;
};

export function UiSkeleton({ className = "", lines = 1, style, ...rest }: UiSkeletonProps) {
  if (lines <= 1) {
    return <div className={["hz-ui-skeleton", className].filter(Boolean).join(" ")} style={style} aria-hidden {...rest} />;
  }

  return (
    <div className={["hz-ui-skeleton-stack", className].filter(Boolean).join(" ")} aria-hidden {...rest}>
      {Array.from({ length: lines }, (_, index) => (
        <div
          key={index}
          className="hz-ui-skeleton hz-ui-skeleton-line"
          style={{ width: `${Math.max(40, 100 - index * 14)}%` }}
        />
      ))}
    </div>
  );
}

