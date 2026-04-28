"use client";

import { EmptyState, LoadingState, PageHeader, SplitContentLayout } from "@hallederiz/ui";
import type { Customer, WarehouseOrder } from "@hallederiz/types";
import { useEffect, useMemo, useState } from "react";
import { PickingInstructionsPanel } from "./PickingInstructionsPanel";
import { WarehouseActionsBar } from "./WarehouseActionsBar";
import { WarehouseOrderHeader } from "./WarehouseOrderHeader";
import { WarehouseOrderLinesTable } from "./WarehouseOrderLinesTable";
import { WhatsappTaskStatusPanel } from "./WhatsappTaskStatusPanel";
import { getWarehouseOrderDetail } from "../queries/get-warehouse-orders";

export function WarehouseOrderDetailPage({ warehouseOrderId }: { warehouseOrderId?: string }) {
  const [warehouseOrder, setWarehouseOrder] = useState<WarehouseOrder | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getWarehouseOrderDetail(warehouseOrderId)
      .then((result) => {
        if (mounted) {
          setWarehouseOrder(result.warehouseOrder);
          setCustomers(result.customers);
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [warehouseOrderId]);

  const customer = useMemo(() => customers.find((item) => item.id === warehouseOrder?.customerId) ?? null, [customers, warehouseOrder?.customerId]);

  if (loading) {
    return <LoadingState title="Depo emri yukleniyor" message="Toplama satirlari, raf bilgileri ve WhatsApp gorev durumu hazirlaniyor." />;
  }

  if (!warehouseOrder) {
    return <EmptyState title="Depo Emri Bulunamadi" message="Secilen depo hazirlik emri bulunamadi." />;
  }

  return (
    <div className="hz-page-stack">
      <PageHeader title="Depo Emir Detayi" description="Siparis bagli toplama satirlari, raf/lokasyon ve personel gorev akisi." />
      <WarehouseOrderHeader warehouseOrder={warehouseOrder} customer={customer} />
      <WarehouseActionsBar />
      <SplitContentLayout
        main={
          <div className="hz-page-stack">
            <WarehouseOrderLinesTable lines={warehouseOrder.lines} />
            <PickingInstructionsPanel warehouseOrder={warehouseOrder} />
          </div>
        }
        side={<WhatsappTaskStatusPanel warehouseOrder={warehouseOrder} />}
      />
    </div>
  );
}
