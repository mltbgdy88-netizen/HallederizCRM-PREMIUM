"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

export type UiModalProps = {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  footer?: ReactNode;
  /** Kapat düğmesi aria etiketi */
  closeLabel?: string;
};

export function UiModal({ open, title, children, onClose, footer, closeLabel = "Kapat" }: UiModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const reactId = useId();
  const titleId = `hz-ui-modal-title-${reactId.replace(/:/g, "")}`;

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const id = window.requestAnimationFrame(() => {
      panelRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(id);
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="hz-ui-modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        className="hz-ui-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="hz-ui-modal-header">
          <h2 id={titleId} className="hz-ui-modal-title">
            {title}
          </h2>
          <button type="button" className="hz-ui-modal-close" onClick={onClose} aria-label={closeLabel}>
            ×
          </button>
        </header>
        <div className="hz-ui-modal-body">{children}</div>
        {footer ? <footer className="hz-ui-modal-footer">{footer}</footer> : null}
      </div>
    </div>
  );
}
