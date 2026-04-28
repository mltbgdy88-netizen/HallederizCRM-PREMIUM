import type { Product } from "@hallederiz/types";

export async function updateStockItem(params: {
  productId: string;
  payload: Partial<Product>;
}): Promise<{ success: boolean; productId: string }> {
  // TODO: Replace with PATCH /products/:id
  void params.payload;
  return {
    success: true,
    productId: params.productId
  };
}
