// @ts-nocheck
import { markReferenceClickHandled } from "./reference-page-interaction";

export function useReferenceToast() {
  return function pushReferenceToast(message: string, target?: EventTarget | null) {
    markReferenceClickHandled(target);

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("hallederiz:reference-toast", {
          detail: { message }
        })
      );
    }

    console.info("[reference-toast]", message);
  };
}
