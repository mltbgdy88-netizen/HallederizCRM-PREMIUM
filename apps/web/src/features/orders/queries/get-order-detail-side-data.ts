import type { Delivery, Invoice, PaymentReceipt, WarehouseOrder } from "@hallederiz/types";
import { dataSourceConfig, sdk } from "../../../lib/data-source";
import { getDeliveryMockData } from "../../deliveries/queries/delivery-mock-data";
import { getInvoiceMockData } from "../../invoices/queries/invoice-mock-data";
import { getPaymentMockData } from "../../payments/queries/payment-mock-data";
import { getWarehouseOrderMockData } from "../../warehouse/queries/warehouse-mock-data";

export interface OrderDetailSideData {
  payments: PaymentReceipt[];
  warehouseOrders: WarehouseOrder[];
  deliveries: Delivery[];
  invoices: Invoice[];
}

/** Tahsilat / depo / teslim / fatura özetleri: demo modda mock; canlı modda ilgili listelerden siparişe göre süzülür. */
export async function getOrderDetailSideData(orderId: string | undefined): Promise<OrderDetailSideData> {
  if (!orderId) {
    return { payments: [], warehouseOrders: [], deliveries: [], invoices: [] };
  }

  if (dataSourceConfig.useDemoData) {
    const [payments, warehouseOrders, deliveries, invoices] = await Promise.all([
      getPaymentMockData(),
      getWarehouseOrderMockData(),
      getDeliveryMockData(),
      getInvoiceMockData()
    ]);
    return { payments, warehouseOrders, deliveries, invoices };
  }

  try {
    const [payRes, whRes, delRes, invRes] = await Promise.all([
      sdk.payments.list(),
      sdk.warehouse.list(),
      sdk.deliveries.list(),
      sdk.invoices.list()
    ]);

    const payments = payRes.items.filter((p) =>
      p.allocations.some((a) => a.targetType === "order" && a.targetId === orderId)
    );
    const warehouseOrders = whRes.items.filter((w) => w.orderId === orderId);
    const deliveries = delRes.items.filter((d) => d.orderId === orderId);
    const invoices = invRes.items.filter((i) => i.orderId === orderId);

    return { payments, warehouseOrders, deliveries, invoices };
  } catch {
    return { payments: [], warehouseOrders: [], deliveries: [], invoices: [] };
  }
}
