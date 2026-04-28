export interface StockToolbarProps {
  onActionClick?: (action: string) => void;
}

const ACTIONS = [
  { key: "create", label: "Yeni Urun" },
  { key: "bulk-update", label: "Toplu Guncelle" },
  { key: "import", label: "Ice Aktar" },
  { key: "export", label: "Disa Aktar" },
  { key: "scan", label: "Barkod Okut" }
];

export function StockToolbar({ onActionClick }: StockToolbarProps) {
  return (
    <section className="hz-action-toolbar stock-toolbar">
      {ACTIONS.map((action, index) => (
        <button
          key={action.key}
          type="button"
          className={`hz-btn hz-toolbar-btn ${index === 0 ? "hz-btn-primary" : "hz-btn-secondary"}`}
          onClick={() => onActionClick?.(action.key)}
        >
          {action.label}
        </button>
      ))}
    </section>
  );
}
