export function TopOverlay() {
  return (
    <header className="pointer-events-none absolute left-0 top-0 z-10 flex w-full items-start justify-between p-6">
      <div>
        <p className="text-xs uppercase tracking-[0.45em] text-[#b48a5a]">ADAWALL</p>
        <h1 className="mt-2 text-2xl font-semibold text-[#f4eee4]">Virtual Flagship</h1>
        <p className="mt-1 max-w-xl text-sm text-[#d8cdbd]">T plan ana mağaza ve Wallpaper Gallery Corridor pilot prototipi.</p>
      </div>
      <div className="rounded-full border border-[#b48a5a]/40 bg-black/30 px-4 py-2 text-xs text-[#f4eee4] backdrop-blur">
        Pilot: 1 loca / 3 renk varyasyonu
      </div>
    </header>
  );
}
