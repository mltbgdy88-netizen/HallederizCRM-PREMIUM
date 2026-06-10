export function LoadingScreen() {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#171412] text-[#f4eee4]">
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.45em] text-[#b48a5a]">ADAWALL</p>
        <p className="mt-3 text-lg font-medium">Virtual Flagship yükleniyor</p>
        <div className="mx-auto mt-5 h-1 w-44 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-[#b48a5a]" />
        </div>
      </div>
    </div>
  );
}
