import type { Product } from "@hallederiz/types";
import { updateProductRecord } from "../../../services/api/stock.service";

export async function updateStockItem(params: {
  productId: string;
  payload: Partial<Product>;
}): Promise<{ success: boolean; productId: string }> {
  await updateProductRecord(params.productId, params.payload);
  return {
    success: true,
    productId: params.productId
  };
}
