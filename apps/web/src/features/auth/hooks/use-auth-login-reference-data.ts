"use client";

import { useReferenceData } from "../../../lib/hooks/use-reference-data";
import {
  AUTH_LOGIN_REFERENCE_INITIAL,
  loadAuthLoginReferenceDemo,
  loadAuthLoginReferenceLive
} from "../adapters/auth-login-reference-adapter";

export function useAuthLoginReferenceData() {
  return useReferenceData({
    loadDemo: loadAuthLoginReferenceDemo,
    loadLive: loadAuthLoginReferenceLive,
    initialData: AUTH_LOGIN_REFERENCE_INITIAL
  });
}
