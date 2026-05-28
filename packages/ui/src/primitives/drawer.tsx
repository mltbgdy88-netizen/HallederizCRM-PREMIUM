"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

export type UiDrawerProps = {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  side?: "left" | "right";
  closeLabel?: string;
};

export function UiDrawer({ open, title, children, onClose, side = "right", closeLabel = "Kapat" }: UiDrawerProps) {
  const panelRef = useRef<HTMLElement>(null);
  const reactId = useId();
  const titleId = `hz-ui-drawer-title-${reactId.replace(/:/g, "")}`;

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
    <>
      <div
        className="hz-ui-drawer-backdrop"
        role="presentation"
        aria-hidden
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) onClose();
        }}
      />
      <aside
        ref={panelRef}
        className={`hz-ui-drawer hz-ui-drawer--${side}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="hz-ui-drawer-header">
          <h2 id={titleId} className="hz-ui-drawer-title">
            {title}
          </h2>
          <button type="button" className="hz-ui-modal-close" onClick={onClose} aria-label={closeLabel}>
            ×
          </button>
        </header>
        <div className="hz-ui-drawer-body">{children}</div>
      </aside>
    </>
  );
}
