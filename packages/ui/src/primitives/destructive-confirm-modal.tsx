import type { ReactNode } from "react";
import { UiButton } from "./button";
import { UiModal } from "./modal";

export type DestructiveConfirmModalProps = {
  open: boolean;
  title: string;
  /** Ana uyarı metni (ör. silme sonucu). */
  message: string;
  children?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
  /** Onay sırasında çift tıklamayı engelle. */
  busy?: boolean;
  closeLabel?: string;
};

/**
 * Sil / kalıcı iptal gibi yıkıcı işlemler için ortak onay diyaloğu.
 * İçerik değişikliği yapmaz; yalnızca onay UI’si sağlar.
 */
export function DestructiveConfirmModal({
  open,
  title,
  message,
  children,
  confirmLabel = "Onayla",
  cancelLabel = "Vazgeç",
  onConfirm,
  onClose,
  busy = false,
  closeLabel = "Kapat"
}: DestructiveConfirmModalProps) {
  return (
    <UiModal
      open={open}
      title={title}
      onClose={onClose}
      closeLabel={closeLabel}
      footer={
        <div className="hz-ui-modal-footer-row hz-ui-modal-footer-row--destructive">
          <UiButton type="button" variant="secondary" size="md" disabled={busy} onClick={onClose}>
            {cancelLabel}
          </UiButton>
          <UiButton type="button" variant="danger" size="md" loading={busy} onClick={onConfirm}>
            {confirmLabel}
          </UiButton>
        </div>
      }
    >
      <p className="hz-ui-modal-destructive-lead">{message}</p>
      {children}
    </UiModal>
  );
}

