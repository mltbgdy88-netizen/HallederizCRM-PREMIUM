export interface TabItem {
  key: string;
  label: string;
}

export interface TabSwitcherProps {
  items: TabItem[];
  activeKey: string;
  onChange: (key: string) => void;
}

export function TabSwitcher({ items, activeKey, onChange }: TabSwitcherProps) {
  return (
    <nav className="hz-tab-switcher">
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          className={item.key === activeKey ? "is-active" : ""}
          onClick={() => onChange(item.key)}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}
