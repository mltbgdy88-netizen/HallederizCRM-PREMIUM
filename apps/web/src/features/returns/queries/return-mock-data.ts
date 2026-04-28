import { buildReturnFromDelivery } from "@hallederiz/domain";
import type { Return, ReturnStatus } from "@hallederiz/types";
import { customers } from "../../customers/queries/customer-mock-data";
import { getDeliveryMockData } from "../../deliveries/queries/delivery-mock-data";

export async function getReturnMockData(): Promise<Return[]> {
  const deliveries = await getDeliveryMockData();
  const first = deliveries[0];
  const second = deliveries[2] ?? deliveries[0];

  if (!first || !second) {
    return [];
  }

  return [
    {
      ...buildReturnFromDelivery(first),
      id: "return_1",
      returnNo: "RET-102",
      status: "approved",
      note: "Hasar nedeniyle onayli iade."
    },
    {
      ...buildReturnFromDelivery(second),
      id: "return_2",
      returnNo: "RET-100",
      status: "completed",
      note: "Yanlis urun iadesi tamamlandi.",
      lines: buildReturnFromDelivery(second).lines.map((line) => ({ ...line, reasonCategory: "wrong_product" }))
    }
  ];
}

export async function getReturnById(returnId?: string): Promise<Return | null> {
  if (!returnId) {
    const deliveries = await getDeliveryMockData();
    return deliveries[0] ? buildReturnFromDelivery(deliveries[0]) : null;
  }

  const returns = await getReturnMockData();
  return returns.find((returnRecord) => returnRecord.id === returnId || returnRecord.returnNo === returnId) ?? null;
}

export function getReturnStatusLabel(status: ReturnStatus): string {
  const labels: Record<ReturnStatus, string> = {
    draft: "Taslak",
    approved: "Onaylandi",
    received: "Teslim Alindi",
    completed: "Tamamlandi",
    cancelled: "Iptal"
  };
  return labels[status];
}

export { customers };
