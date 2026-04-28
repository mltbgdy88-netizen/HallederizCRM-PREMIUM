import type { WarehouseOrder } from "@hallederiz/types";

export function PickingInstructionsPanel({ warehouseOrder }: { warehouseOrder: WarehouseOrder }) {
  const totalRequested = warehouseOrder.lines.reduce((total, line) => total + line.requestedQuantity, 0);

  return (
    <section className="hz-content-card">
      <h3>Picking Talimatlari</h3>
      <ul className="hz-side-list hz-margin-top-sm">
        <li>Toplam hazirlanacak urun adedi: {totalRequested}</li>
        <li>Once kritik ve teslim tarihi yakin satirlar toplanir.</li>
        <li>Raf/lokasyon kontrolu barkod okutma adimiyla dogrulanacak.</li>
        <li>Not: {warehouseOrder.note ?? "Operasyon notu yok."}</li>
      </ul>
    </section>
  );
}
