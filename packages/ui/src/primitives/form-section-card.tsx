import type { ReactNode } from "react";
import { useId } from "react";

export type FormSectionCardProps = {
  title: string;
  description?: string;
  helperText?: string;
  children: ReactNode;
  className?: string;
};

/** Task 17 — bölüm kartı: başlık, isteğe bağlı açıklama ve yardım metni. */
export function FormSectionCard({ title, description, helperText, children, className = "" }: FormSectionCardProps) {
  const titleId = useId();
  return (
    <section className={["hz-form-section-card", className].filter(Boolean).join(" ")} aria-labelledby={titleId}>
      <header className="hz-form-section-card-head">
        <h2 id={titleId} className="hz-form-section-card-title">
          {title}
        </h2>
        {description ? <p className="hz-form-section-card-desc">{description}</p> : null}
      </header>
      <div className="hz-form-section-card-body">{children}</div>
      {helperText ? <p className="hz-form-section-card-helper">{helperText}</p> : null}
    </section>
  );
}
