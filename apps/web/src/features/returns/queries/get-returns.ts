import type { Customer, Return } from "@hallederiz/types";
import { customers } from "../../customers/queries/customer-mock-data";
import { getReturnById, getReturnMockData } from "./return-mock-data";

export async function getReturns(): Promise<{ returns: Return[]; customers: Customer[] }> {
  return {
    returns: await getReturnMockData(),
    customers
  };
}

export async function getReturnDetail(returnId?: string): Promise<{ returnRecord: Return | null; returns: Return[]; customers: Customer[] }> {
  return {
    returnRecord: await getReturnById(returnId),
    returns: await getReturnMockData(),
    customers
  };
}
