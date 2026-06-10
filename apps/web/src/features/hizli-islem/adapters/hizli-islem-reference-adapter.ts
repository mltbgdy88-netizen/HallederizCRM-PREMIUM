import type { Customer, Offer, PaymentReceipt, SaleOrder } from "@hallederiz/types";
import { mapOfferToRow } from "../../offers/mappers/map-offer-row";
import { getOffers } from "../../offers/queries/get-offers";
import { mapOrderRow } from "../../orders/mappers/map-order-row";
import { getOrders } from "../../orders/queries/get-orders";
import { mapPaymentRow } from "../../payments/mappers/map-payment-row";
import { getPayments } from "../../payments/queries/get-payments";
import { REFERENCE_DEMO_BANNER } from "../../../lib/reference/constants";
import { formatRelativeTimeAgo } from "../../../lib/reference/formatters";
import {
  HI_ACTION_CARDS,
  HI_PAGE,
  HI_RECENT,
  type HizliActionCard,
  type HizliRecentItem
} from "../data/hizli-islem-mock";

export type HizliActionCardView = HizliActionCard & { href: string };

const ACTION_CARD_HREFS: Record<HizliActionCard["id"], string> = {
  order: "/hizli-islem/satis-masasi",
  offer: "/hizli-islem/satis-masasi",
  collection: "/tahsilatlar",
  delivery: "/teslimatlar",
  return: "/iadeler",
  impact: "/raporlar"
};

export type HizliIslemMerkeziSnapshot = {
  page: typeof HI_PAGE;
  actionCards: HizliActionCardView[];
  recent: HizliRecentItem[];
  demoBanner: string | null;
};

type RecentFeedEntry = {
  at: number;
  item: HizliRecentItem;
};

function recentStatusCompleted(done: boolean): HizliRecentItem["status"] {
  return done ? "Tamamlandı" : "Beklemede";
}

function recentTone(done: boolean): HizliRecentItem["iconTone"] {
  return done ? "green" : "gold";
}

function orderRecentDone(order: SaleOrder): boolean {
  return order.status === "completed" || order.status === "delivered";
}

function offerRecentDone(offer: Offer): boolean {
  return offer.status === "approved" || offer.status === "converted";
}

function paymentRecentDone(payment: PaymentReceipt): boolean {
  return payment.status === "allocated" || payment.status === "partially_allocated";
}

function mapOrderRecent(order: SaleOrder, customers: Customer[]): RecentFeedEntry {
  const row = mapOrderRow(order, customers);
  const done = orderRecentDone(order);
  return {
    at: new Date(order.updatedAt || order.createdAt).getTime(),
    item: {
      id: `order-${order.id}`,
      type: "Sipariş",
      ref: row.orderNo,
      customer: row.customerName,
      timeAgo: formatRelativeTimeAgo(order.updatedAt || order.createdAt),
      status: recentStatusCompleted(done),
      icon: "order",
      iconTone: recentTone(done)
    }
  };
}

function mapOfferRecent(offer: Offer, customers: Customer[]): RecentFeedEntry {
  const row = mapOfferToRow(offer, customers.find((c) => c.id === offer.customerId));
  const done = offerRecentDone(offer);
  return {
    at: new Date(offer.updatedAt || offer.createdAt).getTime(),
    item: {
      id: `offer-${offer.id}`,
      type: "Teklif",
      ref: row.offerNo,
      customer: row.customerName,
      timeAgo: formatRelativeTimeAgo(offer.updatedAt || offer.createdAt),
      status: recentStatusCompleted(done),
      icon: "offer",
      iconTone: recentTone(done)
    }
  };
}

function mapPaymentRecent(payment: PaymentReceipt, customers: Customer[]): RecentFeedEntry {
  const row = mapPaymentRow(payment, customers);
  const done = paymentRecentDone(payment);
  const atIso = payment.receivedAt || payment.createdAt;
  return {
    at: new Date(atIso).getTime(),
    item: {
      id: `payment-${payment.id}`,
      type: "Tahsilat",
      ref: row.receiptNo,
      customer: row.customerName,
      timeAgo: formatRelativeTimeAgo(atIso),
      status: recentStatusCompleted(done),
      icon: "collection",
      iconTone: recentTone(done)
    }
  };
}

function mapDeliveryRecentFromOrder(order: SaleOrder, customers: Customer[]): RecentFeedEntry | null {
  if (order.deliveryStatus === "none") {
    return null;
  }
  const row = mapOrderRow(order, customers);
  const done = order.deliveryStatus === "delivered";
  return {
    at: new Date(order.updatedAt || order.createdAt).getTime(),
    item: {
      id: `delivery-${order.id}`,
      type: "Teslim",
      ref: row.orderNo,
      customer: row.customerName,
      timeAgo: formatRelativeTimeAgo(order.updatedAt || order.createdAt),
      status: recentStatusCompleted(done),
      icon: "delivery",
      iconTone: recentTone(done)
    }
  };
}

function buildLiveRecent(
  orders: SaleOrder[],
  offers: Offer[],
  payments: PaymentReceipt[],
  customers: Customer[]
): HizliRecentItem[] {
  const feed: RecentFeedEntry[] = [
    ...orders.map((order) => mapOrderRecent(order, customers)),
    ...offers.map((offer) => mapOfferRecent(offer, customers)),
    ...payments.map((payment) => mapPaymentRecent(payment, customers)),
    ...orders
      .map((order) => mapDeliveryRecentFromOrder(order, customers))
      .filter((entry): entry is RecentFeedEntry => entry != null)
  ];

  return feed
    .sort((a, b) => b.at - a.at)
    .slice(0, 5)
    .map((entry) => entry.item);
}

function withActionHrefs(cards: HizliActionCard[]): HizliActionCardView[] {
  return cards.map((card) => ({
    ...card,
    href: ACTION_CARD_HREFS[card.id] ?? "/hizli-islem"
  }));
}

export function loadHizliIslemMerkeziDemo(): HizliIslemMerkeziSnapshot {
  return {
    page: HI_PAGE,
    actionCards: withActionHrefs(HI_ACTION_CARDS),
    recent: HI_RECENT,
    demoBanner: REFERENCE_DEMO_BANNER
  };
}

export async function loadHizliIslemMerkeziLive(): Promise<HizliIslemMerkeziSnapshot> {
  const [{ orders, customers: orderCustomers }, { offers, customers: offerCustomers }, { payments, customers: paymentCustomers }] =
    await Promise.all([getOrders(), getOffers(), getPayments()]);

  const customers = orderCustomers.length
    ? orderCustomers
    : offerCustomers.length
      ? offerCustomers
      : paymentCustomers;

  return {
    page: HI_PAGE,
    actionCards: withActionHrefs(HI_ACTION_CARDS),
    recent: buildLiveRecent(orders, offers, payments, customers),
    demoBanner: null
  };
}

export const HIZLI_ISLEM_MERKEZI_INITIAL = loadHizliIslemMerkeziDemo();

