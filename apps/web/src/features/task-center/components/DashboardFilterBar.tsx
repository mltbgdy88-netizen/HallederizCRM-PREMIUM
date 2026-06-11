import { FilterBar } from "@hallederiz/ui";

export function DashboardFilterBar() {
  return (
    <FilterBar>
      <div className="task-center-filter-grid">
        <label>Rol<select defaultValue=""><option value="">Tüm roller</option><option value="sales">Satış</option><option value="finance">Muhasebe</option><option value="warehouse">Depo</option><option value="manager">Yönetici</option></select></label>
        <label>Öncelik<select defaultValue=""><option value="">Tüm öncelikler</option><option value="critical">Kritik</option><option value="high">Yüksek</option><option value="normal">Normal</option></select></label>
        <label>Görev tipi<select defaultValue=""><option value="">Tüm tipler</option><option value="order">Sipariş</option><option value="payment">Tahsilat</option><option value="warehouse">Depo</option><option value="ai">Yapay Zekâ</option></select></label>
        <label>Depo<select defaultValue=""><option value="">Tüm depolar</option><option value="merkez">Merkez</option><option value="avrupa">Avrupa</option><option value="anadolu">Anadolu</option></select></label>
        <label>Fabrika<select defaultValue=""><option value="">Tüm fabrikalar</option><option value="ankara">Ankara</option><option value="izmir">İzmir</option></select></label>
        <label className="hz-toggle"><input type="checkbox" />Sadece kritikler</label>
      </div>
    </FilterBar>
  );
}
