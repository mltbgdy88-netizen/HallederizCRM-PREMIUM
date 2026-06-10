type StockBadgeProps = {
  label: string;
  value: number;
  tone?: 'dealer' | 'factory';
};

export function StockBadge({ label, value, tone = 'dealer' }: StockBadgeProps) {
  const toneClass = tone === 'factory' ? 'border-emerald-300/30 bg-emerald-300/10 text-emerald-100' : 'border-[#b48a5a]/40 bg-[#b48a5a]/10 text-[#f4eee4]';

  return (
    <div className={`rounded-2xl border px-3 py-2 ${toneClass}`}>
      <p className="text-[10px] uppercase tracking-[0.22em] opacity-70">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}
