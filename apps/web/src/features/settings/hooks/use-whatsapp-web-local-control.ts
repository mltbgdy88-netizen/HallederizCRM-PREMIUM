"use client";

import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";
import {
  WhatsAppWebLocalControlError,
  type WhatsAppWebLocalControlClient,
  type WhatsAppWebLocalControlSnapshot,
  whatsappWebLocalControlClient
} from "../services/whatsapp-web-local-control";
import {
  resolveWhatsAppWebLocalView,
  type WhatsAppWebLocalView
} from "../utils/whatsapp-web-local-view";

export type WhatsAppWebLocalControlAction =
  | "status"
  | "start"
  | "refresh_pairing"
  | "disconnect"
  | "logout";

export type WhatsAppWebLocalControlState = {
  snapshot: WhatsAppWebLocalControlSnapshot | null;
  loading: boolean;
  mutating: boolean;
  activeAction: WhatsAppWebLocalControlAction | null;
  sessionError: boolean;
  errorMessage: string | null;
};

export type WhatsAppWebLocalControlController = {
  subscribe(listener: () => void): () => void;
  getState(): WhatsAppWebLocalControlState;
  mount(): Promise<void>;
  dispose(): void;
  refreshStatus(): Promise<void>;
  startPairing(): Promise<void>;
  refreshPairing(): Promise<void>;
  disconnect(): Promise<void>;
  logout(): Promise<void>;
};

export type UseWhatsAppWebLocalControlResult = WhatsAppWebLocalControlState & {
  view: WhatsAppWebLocalView;
  refresh(): Promise<void>;
  start(): Promise<void>;
  refreshPairing(): Promise<void>;
  disconnect(): Promise<void>;
  logout(): Promise<void>;
};

const INITIAL_STATE: WhatsAppWebLocalControlState = {
  snapshot: null,
  loading: false,
  mutating: false,
  activeAction: null,
  sessionError: false,
  errorMessage: null
};

function safeErrorState(error: unknown): Pick<
  WhatsAppWebLocalControlState,
  "sessionError" | "errorMessage"
> {
  if (error instanceof WhatsAppWebLocalControlError) {
    return {
      sessionError: error.status === 401,
      errorMessage: error.message
    };
  }
  return {
    sessionError: false,
    errorMessage: "Yerel bağlantı işlemi güvenli biçimde tamamlanamadı. Durumu tekrar kontrol edin."
  };
}

export function createWhatsAppWebLocalControlController(
  client: WhatsAppWebLocalControlClient
): WhatsAppWebLocalControlController {
  let state: WhatsAppWebLocalControlState = INITIAL_STATE;
  let mounted = false;
  let disposed = false;
  let sequence = 0;
  let scheduledMount: Promise<void> | undefined;
  let activeRequest:
    | {
        id: number;
        controller: AbortController;
      }
    | undefined;
  const listeners = new Set<() => void>();

  const emit = () => {
    if (disposed) {
      return;
    }
    for (const listener of listeners) {
      listener();
    }
  };

  const updateState = (patch: Partial<WhatsAppWebLocalControlState>) => {
    state = { ...state, ...patch };
    emit();
  };

  const isCurrentRequest = (requestId: number): boolean =>
    !disposed && activeRequest?.id === requestId && sequence === requestId;

  const runRequest = async (
    action: WhatsAppWebLocalControlAction,
    request: (signal: AbortSignal) => Promise<WhatsAppWebLocalControlSnapshot>
  ): Promise<void> => {
    if (!mounted || disposed || activeRequest) {
      return;
    }

    const requestId = ++sequence;
    const controller = new AbortController();
    activeRequest = { id: requestId, controller };
    const isStatus = action === "status";
    updateState({
      loading: isStatus,
      mutating: !isStatus,
      activeAction: action,
      sessionError: false,
      errorMessage: null
    });

    try {
      const nextSnapshot = await request(controller.signal);
      if (!isCurrentRequest(requestId)) {
        return;
      }
      if (!state.snapshot || nextSnapshot.generation >= state.snapshot.generation) {
        updateState({ snapshot: nextSnapshot });
      }
    } catch (error) {
      if (!isCurrentRequest(requestId) || controller.signal.aborted) {
        return;
      }
      updateState(safeErrorState(error));
    } finally {
      if (isCurrentRequest(requestId)) {
        activeRequest = undefined;
        updateState({
          loading: false,
          mutating: false,
          activeAction: null
        });
      }
    }
  };

  const refreshStatus = () =>
    runRequest("status", (signal) => client.getStatus(signal));
  const startPairing = () =>
    runRequest("start", (signal) => client.start(signal));
  const refreshPairing = () =>
    runRequest("refresh_pairing", (signal) => client.refreshPairing(signal));
  const disconnect = () =>
    runRequest("disconnect", (signal) => client.disconnect(signal));
  const logout = () =>
    runRequest("logout", (signal) => client.logout(signal));

  return {
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getState() {
      return state;
    },
    mount() {
      if (mounted && !disposed) {
        return scheduledMount ?? Promise.resolve();
      }
      mounted = true;
      disposed = false;
      scheduledMount ??= Promise.resolve().then(() => {
        scheduledMount = undefined;
        if (!mounted || disposed) {
          return;
        }
        return refreshStatus();
      });
      return scheduledMount;
    },
    dispose() {
      mounted = false;
      disposed = true;
      sequence += 1;
      activeRequest?.controller.abort();
      activeRequest = undefined;
      state = {
        ...state,
        loading: false,
        mutating: false,
        activeAction: null
      };
    },
    refreshStatus,
    startPairing,
    refreshPairing,
    disconnect,
    logout
  };
}

export function useWhatsAppWebLocalControl(
  client: WhatsAppWebLocalControlClient = whatsappWebLocalControlClient
): UseWhatsAppWebLocalControlResult {
  const controller = useMemo(
    () => createWhatsAppWebLocalControlController(client),
    [client]
  );
  const state = useSyncExternalStore(
    controller.subscribe,
    controller.getState,
    controller.getState
  );

  useEffect(() => {
    void controller.mount();
    return () => controller.dispose();
  }, [controller]);

  const refresh = useCallback(() => controller.refreshStatus(), [controller]);
  const start = useCallback(() => controller.startPairing(), [controller]);
  const refreshPairing = useCallback(
    () => controller.refreshPairing(),
    [controller]
  );
  const disconnect = useCallback(() => controller.disconnect(), [controller]);
  const logout = useCallback(() => controller.logout(), [controller]);
  const view = useMemo(() => resolveWhatsAppWebLocalView(state.snapshot), [state.snapshot]);

  return {
    ...state,
    view,
    refresh,
    start,
    refreshPairing,
    disconnect,
    logout
  };
}
