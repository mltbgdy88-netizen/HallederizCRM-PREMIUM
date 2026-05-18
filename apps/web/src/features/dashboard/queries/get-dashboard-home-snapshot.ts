import { getOfferMockData } from "../../offers/queries/offer-mock-data";
import { getOrderMockData } from "../../orders/queries/order-mock-data";
import {
  buildDashboardHomeSnapshot,
  type DashboardHomeSnapshot
} from "../utils/build-dashboard-home-snapshot";
import { getOperationsEngineData } from "./operations-engine-mock-data";

export async function getDashboardHomeSnapshot(): Promise<DashboardHomeSnapshot> {
  const [engine, offers, orders] = await Promise.all([
    getOperationsEngineData(),
    getOfferMockData(),
    getOrderMockData()
  ]);
  return buildDashboardHomeSnapshot(engine, offers, orders);
}

export type { DashboardHomeSnapshot };
