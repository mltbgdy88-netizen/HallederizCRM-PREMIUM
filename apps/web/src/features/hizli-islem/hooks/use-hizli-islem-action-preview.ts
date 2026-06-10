"use client";

import { useCallback, useState } from "react";
import type { QuickOperationPreviewResponse } from "@hallederiz/types";
import {
  mapPreviewActionError,
  mapPreviewNotice,
  sanitizePreviewImpacts
} from "../../quick-operations/utils/quick-operation-preview-feedback";
import type { HizliActionCard } from "../data/hizli-islem-mock";
import { fetchHizliIslemActionPreview, resolveHizliIslemOperationType } from "../lib/hizli-islem-action-preview";

export function useHizliIslemActionPreview() {
  const [activeCard, setActiveCard] = useState<HizliActionCard | null>(null);
  const [preview, setPreview] = useState<QuickOperationPreviewResponse | null>(null);
  const [previewNotice, setPreviewNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPreview = useCallback(async (card: HizliActionCard) => {
    setActiveCard(card);
    setError(null);
    setPreview(null);
    setPreviewNotice(null);

    if (!resolveHizliIslemOperationType(card.id)) {
      setPreviewNotice("Etki analizi için ayrı ekranı kullanın.");
      return;
    }

    setLoading(true);
    try {
      const result = await fetchHizliIslemActionPreview(card);
      if (!result) {
        setPreviewNotice("Bu işlem türü için önizleme kullanılamıyor.");
        return;
      }
      const sanitized: QuickOperationPreviewResponse = {
        ...result,
        workflowImpacts: sanitizePreviewImpacts(result.workflowImpacts)
      };
      setPreview(sanitized);
      setPreviewNotice(mapPreviewNotice(sanitized));
    } catch (previewError) {
      setError(mapPreviewActionError(previewError));
    } finally {
      setLoading(false);
    }
  }, []);

  const clearPreview = useCallback(() => {
    setActiveCard(null);
    setPreview(null);
    setPreviewNotice(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    activeCard,
    preview,
    previewNotice,
    loading,
    error,
    loadPreview,
    clearPreview
  };
}

