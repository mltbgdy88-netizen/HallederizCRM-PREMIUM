// @ts-nocheck
import {
  DEMO_MODAL,
  LIVE_EMPTY,
  OFFLINE_STATE,
  UNAUTHORIZED_STATE
} from "../data/sistem-state-mock";

export type SistemStateReferenceSnapshot = {
  demoModal: typeof DEMO_MODAL;
  liveEmpty: typeof LIVE_EMPTY;
  offline: typeof OFFLINE_STATE;
  unauthorized: typeof UNAUTHORIZED_STATE;
};

const build = (): SistemStateReferenceSnapshot => ({
  demoModal: DEMO_MODAL,
  liveEmpty: LIVE_EMPTY,
  offline: OFFLINE_STATE,
  unauthorized: UNAUTHORIZED_STATE
});

export const SISTEM_STATE_REFERENCE_INITIAL = build();
export const loadSistemStateReferenceDemo = () => build();
export const loadSistemStateReferenceLive = async () => build();
