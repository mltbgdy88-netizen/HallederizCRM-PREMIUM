import { FilterBar } from "@hallederiz/ui";

export function DashboardFilterBar() {
  return (
    <FilterBar>
      <div className="task-center-filter-grid">
        <label>Rol<select defaultValue=""><option value="">Tum roller</option><option value="sales">Satis</option><option value="finance">Muhasebe</option><option value="warehouse">Depo</option><option value="manager">Yonetici</option></select></label>
        <label>Oncelik<select defaultValue=""><option value="">Tum oncelikler</option><option value="critical">Kritik</option><option value="high">Yuksek</option><option value="normal">Normal</option></select></label>
        <label>Gorev Tipi<select defaultValue=""><option value="">Tum tipler</option><option value="order">Siparis</option><option value="payment">Tahsilat</option><option value="warehouse">Depo</option><option value="ai">AI</option></select></label>
        <label>Depo<select defaultValue=""><option value="">Tum depolar</option><option value="merkez">Merkez</option><option value="avrupa">Avrupa</option><option value="anadolu">Anadolu</option></select></label>
        <label>Fabrika<select defaultValue=""><option value="">Tum fabrikalar</option><option value="ankara">Ankara</option><option value="izmir">Izmir</option></select></label>
        <label className="hz-toggle"><input type="checkbox" />Sadece kritikler</label>
      </div>
    </FilterBar>
  );
}
