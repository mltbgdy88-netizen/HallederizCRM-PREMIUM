import { create } from 'zustand';
import { activePilotPattern } from '../data/pilotPatterns';

const firstVariant = activePilotPattern.variants[0];

type ShowroomState = {
  activePatternId: string;
  activeVariantId: string;
  setActiveVariant: (variantId: string) => void;
};

export const useShowroomStore = create<ShowroomState>((set) => ({
  activePatternId: activePilotPattern.id,
  activeVariantId: firstVariant.id,
  setActiveVariant: (variantId) => set({ activeVariantId: variantId })
}));
