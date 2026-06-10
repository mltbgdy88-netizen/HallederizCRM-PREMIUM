'use client';

import { useMemo } from 'react';
import { activePilotPattern } from '../../data/pilotPatterns';
import { useShowroomStore } from '../../stores/showroomStore';
import { ColorSwatchBar } from './ColorSwatchBar';
import { StockBadge } from './StockBadge';

export function ProductPanel() {
  const activeVariantId = useShowroomStore((state) => state.activeVariantId);
  const activeVariant = useMemo(
    () => activePilotPattern.variants.find((variant) => variant.id === activeVariantId) ?? activePilotPattern.variants[0],
    [activeVariantId]
  );

  return (
    <aside className="absolute bottom-6 right-6 z-20 w-[360px] rounded-3xl border border-[#b48a5a]/30 bg-[#171412]/85 p-5 text-[#f4eee4] shadow-2xl backdrop-blur-xl">
      <p className="text-xs uppercase tracking-[0.32em] text-[#b48a5a]">Wallpaper Gallery Corridor</p>
      <h2 className="mt-3 text-2xl font-semibold">{activePilotPattern.patternName}</h2>
      <p className="mt-1 text-sm text-[#d8cdbd]">{activePilotPattern.collectionName}</p>
      <ColorSwatchBar />
      <div className="mt-5 space-y-3 rounded-2xl bg-black/25 p-4 text-sm">
        <div className="flex justify-between gap-4"><span className="text-[#d8cdbd]">Seçili renk</span><strong>{activeVariant.colorName}</strong></div>
        <div className="flex justify-between gap-4"><span className="text-[#d8cdbd]">SKU</span><strong className="text-right text-xs">{activeVariant.sku}</strong></div>
        <div className="grid grid-cols-2 gap-3 pt-1">
          <StockBadge label="Bayi stoğu" value={activeVariant.stock.dealerStock} tone="dealer" />
          <StockBadge label="Fabrika stoğu" value={activeVariant.stock.factoryStock} tone="factory" />
        </div>
        <div className="flex justify-between gap-4"><span className="text-[#d8cdbd]">Termin</span><strong>{activeVariant.stock.leadTimeDays} gün</strong></div>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <button className="rounded-full bg-[#b48a5a] px-4 py-3 text-sm font-semibold text-[#171412]">Numune İste</button>
        <button className="rounded-full border border-[#b48a5a]/60 px-4 py-3 text-sm font-semibold text-[#f4eee4]">Teklif Al</button>
      </div>
    </aside>
  );
}
