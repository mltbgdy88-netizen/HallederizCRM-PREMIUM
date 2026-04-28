import type { ErpConnection, ErpEntityType, ErpMapping } from "@hallederiz/types";
import type { RequestContext } from "../../../shared/request-context";
import {
  createErpConnection,
  getErpConnection,
  listErpConnections,
  listErpLogs,
  listErpMappings,
  listErpTemplates,
  patchErpConnection,
  patchErpMappings,
  syncErpConnection,
  testErpConnection
} from "../../../integrations/mock-store";

const previewByEntity: Record<ErpEntityType, string[]> = {
  customer: ["code", "name", "phone", "city"],
  product: ["code", "name", "brand", "category"],
  stock: ["productCode", "warehouse", "quantity"],
  price: ["productCode", "slot", "price", "currency"],
  payment: ["receiptNo", "customer", "amount", "method"],
  invoice: ["invoiceNo", "customer", "total", "status"],
  order: ["orderNo", "customer", "total", "deliveryType"],
  return: ["returnNo", "customer", "reason", "status"]
};

export class ErpAdapter {
  constructor(private readonly context: RequestContext) {}

  listConnections() {
    return listErpConnections().filter((item) => item.tenantId === this.context.tenantId);
  }

  getConnection(id: string) {
    const item = getErpConnection(id);
    return item?.tenantId === this.context.tenantId ? item : null;
  }

  createConnection(payload: Partial<ErpConnection>) {
    return createErpConnection(payload);
  }

  patchConnection(id: string, payload: Partial<ErpConnection>) {
    return patchErpConnection(id, payload);
  }

  testConnection(id: string) {
    return testErpConnection(id);
  }

  syncConnection(id: string) {
    const result = syncErpConnection(id);
    if (!result) return null;
    const entityType = result.log?.entityType ?? "customer";
    const direction = result.log?.direction ?? "import";
    return {
      ...result,
      preview: {
        direction,
        entityType,
        fields: previewByEntity[entityType]
      }
    };
  }

  listMappings() {
    return listErpMappings().filter((item) => item.tenantId === this.context.tenantId);
  }

  patchMappings(payload: ErpMapping[]) {
    return patchErpMappings(payload);
  }

  listLogs() {
    return listErpLogs().filter((item) => item.tenantId === this.context.tenantId);
  }

  listTemplates() {
    return listErpTemplates();
  }
}
