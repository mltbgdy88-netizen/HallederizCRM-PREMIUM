import type { WarehouseOrder } from "@hallederiz/types";

export function WhatsappTaskStatusPanel({ warehouseOrder }: { warehouseOrder: WarehouseOrder }) {
  return (
    <section className="hz-content-card">
      <h3>WhatsApp Gorev Durumu</h3>
      <ul className="hz-side-list hz-margin-top-sm">
        <li>Atanan: {warehouseOrder.assignedTo ?? "Depo Ekibi"}</li>
        <li>Gonderim: placeholder hazir</li>
        <li>Geri bildirim: personel mesajlari warehouse task kaydina baglanacak.</li>
        <li>Fallback: teslim tarihi yaklasirsa yonetici uyarisi uretilir.</li>
      </ul>
    </section>
  );
}
