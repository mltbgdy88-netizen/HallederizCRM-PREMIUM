// @ts-nocheck
"use client";

import { useCallback, type MouseEvent } from "react";
import { markReferenceClickHandled } from "@/lib/reference/reference-page-interaction";
import { useToast } from "@/providers/toast-provider";

export function useReferenceToast() {
  const { pushToast } = useToast();

  return useCallback(
    (message: string, target?: EventTarget | null) => {
      markReferenceClickHandled(target ?? null);
      pushToast(message);
    },
    [pushToast]
  );
}

export function useReferenceDemoAction() {
  const pushReferenceToast = useReferenceToast();

  return useCallback(
    (label: string, event?: MouseEvent<HTMLElement>) => {
      pushReferenceToast(
        `${label} — demo modunda gerçek CRM işlemi yapılmaz.`,
        event?.currentTarget ?? null
      );
    },
    [pushReferenceToast]
  );
}


