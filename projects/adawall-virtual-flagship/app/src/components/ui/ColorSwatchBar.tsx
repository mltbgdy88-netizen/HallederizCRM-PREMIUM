'use client';

import { activePilotPattern } from '../../data/pilotPatterns';
import { useShowroomStore } from '../../stores/showroomStore';

export function ColorSwatchBar() {
  const activeVariantId = useShowroomStore((state) => state.activeVariantId);
  const setActiveVariant = useShowroomStore((state) => state.setActiveVariant);

  return (
    <div className="mt-4 flex gap-3">
      {activePilotPattern.variants.map((variant) => (
        <button
          key={variant.id}
          type="button"
          aria-label={variant.colorName}
          onClick={() => setActiveVariant(variant.id)}
          className={`h-9 w-9 rounded-full border-2 transition ${activeVariantId === variant.id ? 'border-[#f4eee4]' : 'border-[#b48a5a]/40'}`}
          style={{ backgroundColor: variant.swatchHex }}
        />
      ))}
    </div>
  );
}
