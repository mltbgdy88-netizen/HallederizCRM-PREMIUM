import type { Customer, CustomerAccount, CustomerAddress, CustomerContact, CustomerLedgerEntry, CustomerPricingProfile, Offer, OfferFollowUp, OfferLine } from "@hallederiz/types";
import type { RequestContext } from "../../shared/request-context";
import { buildRepositoryRuntime } from "../../shared/db-runtime";
import {
  addAddress,
  addContact,
  addOfferFollowUp,
  addOfferLine,
  convertOffer,
  createCustomer as createCustomerMock,
  createOffer as createOfferMock,
  getAccountSummary,
  getCustomer as getCustomerMock,
  getLedger,
  getOffer as getOfferMock,
  listCustomers as listCustomersMock,
  listOffers as listOffersMock,
  patchCustomer as patchCustomerMock,
  patchOffer as patchOfferMock,
  patchOfferLine,
  patchPricingProfile,
  sendOffer
} from "../../sales-crm/mock-store";

type Row = Record<string, unknown>;

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" ? value : fallback;
}

function asBoolean(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function mapCustomerRowToEntity(row: Row): Customer {
  const tenantId = asString(row.tenant_id, "tenant_1");
  const customerId = asString(row.id);
  return {
    id: customerId,
    tenantId,
    code: asString(row.code),
    name: asString(row.name),
    type: (asString(row.type, "bayi") as Customer["type"]),
    phone: asString(row.phone, "-"),
    email: asString(row.email, undefined),
    city: asString(row.city, "-"),
    addressLine: asString(row.address_line, "-"),
    taxOffice: asString(row.tax_office, undefined),
    taxNumber: asString(row.tax_number, undefined),
    district: asString(row.district, undefined),
    active: asBoolean(row.is_active, true),
    riskLevel: (asString(row.risk_level, "low") as Customer["riskLevel"]),
    whatsappMatched: asBoolean(row.whatsapp_matched, false),
    lastOrderAt: asString(row.last_order_at, undefined),
    createdAt: asString(row.created_at, new Date().toISOString()),
    updatedAt: asString(row.updated_at, new Date().toISOString()),
    pricingProfile: {
      id: asString(row.pricing_profile_id, `${customerId}_pricing`),
      tenantId,
      customerId,
      selectedPriceSlotNo: Number(asNumber(row.selected_price_slot_no, 1)) as CustomerPricingProfile["selectedPriceSlotNo"],
      assignedPriceSlot: Number(asNumber(row.selected_price_slot_no, 1)) as CustomerPricingProfile["assignedPriceSlot"],
      priceSlotLabelSnapshot: asString(row.price_slot_label_snapshot, "Fiyat Alani 1"),
      active: true
    }
  };
}

function mapOfferRowToEntity(row: Row): Offer {
  return {
    id: asString(row.id),
    tenantId: asString(row.tenant_id, "tenant_1"),
    offerNo: asString(row.offer_no),
    customerId: asString(row.customer_id),
    status: asString(row.status, "draft") as Offer["status"],
    validUntil: asString(row.valid_until, new Date().toISOString()),
    note: asString(row.note, undefined),
    priceSlotNoSnapshot: Number(asNumber(row.price_slot_no_snapshot, 1)) as Offer["priceSlotNoSnapshot"],
    priceSlotLabelSnapshot: asString(row.price_slot_label_snapshot, "Fiyat Alani 1"),
    currency: asString(row.currency, "TRY") as Offer["currency"],
    subtotal: asNumber(row.subtotal, 0),
    discountTotal: asNumber(row.discount_total, 0),
    taxRate: asNumber(row.tax_rate, 20),
    taxTotal: asNumber(row.tax_total, 0),
    grandTotal: asNumber(row.grand_total, 0),
    createdBy: asString(row.created_by, "user_admin"),
    createdAt: asString(row.created_at, new Date().toISOString()),
    updatedAt: asString(row.updated_at, new Date().toISOString()),
    sentAt: asString(row.sent_at, undefined),
    convertedOrderDraftId: asString(row.converted_order_draft_id, undefined),
    lines: [],
    followUps: [],
    documentStatus: asString(row.document_status, "not_created") as Offer["documentStatus"]
  };
}

export class SalesCrmRepository {
  constructor(private readonly context: RequestContext) {}

  private runtime() {
    return buildRepositoryRuntime(this.context);
  }

  async listCustomers(): Promise<Customer[]> {
    const runtime = this.runtime();
    if (!runtime.dbEnabled) return listCustomersMock();
    try {
      const rows = await runtime.executor.query<Row>(
        `select c.id, c.tenant_id, c.code, c.name, c.type, c.phone, c.email, c.city, c.address_line, c.tax_office, c.tax_number, c.district,
                c.is_active, c.risk_level, c.whatsapp_matched, c.last_order_at, c.created_at, c.updated_at,
                cpp.id as pricing_profile_id, cpp.selected_price_slot_no, cpp.price_slot_label_snapshot
         from customers c
         left join customer_pricing_profiles cpp on cpp.customer_id = c.id and cpp.tenant_id = c.tenant_id
         where c.tenant_id = $1
         order by c.created_at desc`,
        [this.context.tenantId]
      );
      return rows.map(mapCustomerRowToEntity);
    } catch {
      return listCustomersMock();
    }
  }

  async getCustomer(id: string): Promise<Customer | undefined> {
    const runtime = this.runtime();
    if (!runtime.dbEnabled) return getCustomerMock(id) ?? undefined;
    try {
      const rows = await runtime.executor.query<Row>(
        `select c.id, c.tenant_id, c.code, c.name, c.type, c.phone, c.email, c.city, c.address_line, c.tax_office, c.tax_number, c.district,
                c.is_active, c.risk_level, c.whatsapp_matched, c.last_order_at, c.created_at, c.updated_at,
                cpp.id as pricing_profile_id, cpp.selected_price_slot_no, cpp.price_slot_label_snapshot
         from customers c
         left join customer_pricing_profiles cpp on cpp.customer_id = c.id and cpp.tenant_id = c.tenant_id
         where c.tenant_id = $1 and c.id = $2
         limit 1`,
        [this.context.tenantId, id]
      );
      return rows[0] ? mapCustomerRowToEntity(rows[0]) : undefined;
    } catch {
      return getCustomerMock(id) ?? undefined;
    }
  }

  async createCustomer(payload: Partial<Customer>): Promise<Customer> {
    const runtime = this.runtime();
    if (!runtime.dbEnabled) return createCustomerMock(payload);
    try {
      const created = await runtime.executor.transaction(async (tx) => {
        const id = payload.id ?? `customer_${Date.now()}`;
        const now = new Date().toISOString();
        await tx.query(
          `insert into customers
           (id, tenant_id, code, name, type, phone, email, city, district, address_line, tax_office, tax_number, is_active, risk_level, whatsapp_matched, created_at, updated_at)
           values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)`,
          [
            id,
            this.context.tenantId,
            payload.code ?? `CUS-${Date.now()}`,
            payload.name ?? "Yeni Cari",
            payload.type ?? "bayi",
            payload.phone ?? "-",
            payload.email ?? null,
            payload.city ?? "-",
            payload.district ?? null,
            payload.addressLine ?? "-",
            payload.taxOffice ?? null,
            payload.taxNumber ?? null,
            payload.active ?? true,
            payload.riskLevel ?? "low",
            payload.whatsappMatched ?? false,
            now,
            now
          ]
        );
        await tx.query(
          `insert into customer_pricing_profiles (id, tenant_id, customer_id, selected_price_slot_no, price_slot_label_snapshot, active)
           values ($1,$2,$3,$4,$5,$6)
           on conflict (id) do update set selected_price_slot_no = excluded.selected_price_slot_no, price_slot_label_snapshot = excluded.price_slot_label_snapshot`,
          [
            `${id}_pricing`,
            this.context.tenantId,
            id,
            payload.pricingProfile?.selectedPriceSlotNo ?? 1,
            payload.pricingProfile?.priceSlotLabelSnapshot ?? "Fiyat Alani 1",
            true
          ]
        );
        const row = (await tx.query<Row>(
          `select c.id, c.tenant_id, c.code, c.name, c.type, c.phone, c.email, c.city, c.address_line, c.tax_office, c.tax_number, c.district,
                  c.is_active, c.risk_level, c.whatsapp_matched, c.last_order_at, c.created_at, c.updated_at,
                  cpp.id as pricing_profile_id, cpp.selected_price_slot_no, cpp.price_slot_label_snapshot
           from customers c
           left join customer_pricing_profiles cpp on cpp.customer_id = c.id and cpp.tenant_id = c.tenant_id
          where c.id = $1 and c.tenant_id = $2`,
          [id, this.context.tenantId]
        ))[0];
        if (!row) {
          throw new Error("Inserted customer could not be reloaded.");
        }
        return mapCustomerRowToEntity(row);
      });
      return created;
    } catch {
      return createCustomerMock(payload);
    }
  }

  async patchCustomer(id: string, payload: Partial<Customer>): Promise<Customer | null> {
    const runtime = this.runtime();
    if (!runtime.dbEnabled) return patchCustomerMock(id, payload);
    try {
      const now = new Date().toISOString();
      await runtime.executor.query(
        `update customers set
           code = coalesce($3, code),
           name = coalesce($4, name),
           type = coalesce($5, type),
           phone = coalesce($6, phone),
           email = coalesce($7, email),
           city = coalesce($8, city),
           district = coalesce($9, district),
           address_line = coalesce($10, address_line),
           tax_office = coalesce($11, tax_office),
           tax_number = coalesce($12, tax_number),
           is_active = coalesce($13, is_active),
           risk_level = coalesce($14, risk_level),
           whatsapp_matched = coalesce($15, whatsapp_matched),
           updated_at = $16
         where tenant_id = $1 and id = $2`,
        [
          this.context.tenantId,
          id,
          payload.code ?? null,
          payload.name ?? null,
          payload.type ?? null,
          payload.phone ?? null,
          payload.email ?? null,
          payload.city ?? null,
          payload.district ?? null,
          payload.addressLine ?? null,
          payload.taxOffice ?? null,
          payload.taxNumber ?? null,
          payload.active ?? null,
          payload.riskLevel ?? null,
          payload.whatsappMatched ?? null,
          now
        ]
      );
      const updated = await this.getCustomer(id);
      return updated ?? null;
    } catch {
      return patchCustomerMock(id, payload);
    }
  }

  async getAccountSummary(id: string): Promise<CustomerAccount | null> {
    const runtime = this.runtime();
    if (!runtime.dbEnabled) return getAccountSummary(id) ?? null;
    try {
      const rows = await runtime.executor.query<Row>(
        `select id, tenant_id, customer_id, balance, currency, credit_limit, overdue_amount, open_offer_count, open_order_count, last_payment_at
         from customer_accounts where tenant_id = $1 and customer_id = $2 limit 1`,
        [this.context.tenantId, id]
      );
      const row = rows[0];
      if (!row) return null;
      return {
        id: asString(row.id),
        tenantId: asString(row.tenant_id, this.context.tenantId),
        customerId: asString(row.customer_id),
        balance: asNumber(row.balance),
        currency: asString(row.currency, "TRY") as CustomerAccount["currency"],
        creditLimit: asNumber(row.credit_limit, 0),
        overdueAmount: asNumber(row.overdue_amount, 0),
        openOfferCount: asNumber(row.open_offer_count, 0),
        openOrderCount: asNumber(row.open_order_count, 0),
        lastPaymentAt: asString(row.last_payment_at, undefined)
      };
    } catch {
      return getAccountSummary(id) ?? null;
    }
  }

  async getLedger(id: string): Promise<CustomerLedgerEntry[]> {
    const runtime = this.runtime();
    if (!runtime.dbEnabled) return getLedger(id);
    try {
      const rows = await runtime.executor.query<Row>(
        `select id, tenant_id, customer_id, direction, amount, currency, description, reference_type, reference_id, occurred_at
         from customer_ledgers where tenant_id = $1 and customer_id = $2 order by occurred_at desc`,
        [this.context.tenantId, id]
      );
      return rows.map((row) => ({
        id: asString(row.id),
        tenantId: asString(row.tenant_id, this.context.tenantId),
        customerId: asString(row.customer_id),
        direction: asString(row.direction, "debit") as CustomerLedgerEntry["direction"],
        amount: asNumber(row.amount, 0),
        currency: asString(row.currency, "TRY") as CustomerLedgerEntry["currency"],
        description: asString(row.description, "-"),
        referenceType: asString(row.reference_type, "manual") as CustomerLedgerEntry["referenceType"],
        referenceId: asString(row.reference_id, undefined),
        occurredAt: asString(row.occurred_at, new Date().toISOString())
      }));
    } catch {
      return getLedger(id);
    }
  }

  addContact(id: string, payload: Partial<CustomerContact>) { return addContact(id, payload); }
  addAddress(id: string, payload: Partial<CustomerAddress>) { return addAddress(id, payload); }
  patchPricingProfile(id: string, payload: Partial<CustomerPricingProfile>) { return patchPricingProfile(id, payload); }

  async listOffers(): Promise<Offer[]> {
    const runtime = this.runtime();
    if (!runtime.dbEnabled) return listOffersMock();
    try {
      const rows = await runtime.executor.query<Row>(
        `select id, tenant_id, offer_no, customer_id, status, valid_until, note, price_slot_no_snapshot, price_slot_label_snapshot,
                currency, subtotal, discount_total, tax_rate, tax_total, grand_total, created_by, created_at, updated_at, sent_at, converted_order_draft_id, document_status
         from offers where tenant_id = $1 order by created_at desc`,
        [this.context.tenantId]
      );
      return rows.map(mapOfferRowToEntity);
    } catch {
      return listOffersMock();
    }
  }

  async getOffer(id: string): Promise<Offer | undefined> {
    const runtime = this.runtime();
    if (!runtime.dbEnabled) return getOfferMock(id) ?? undefined;
    try {
      const rows = await runtime.executor.query<Row>(
        `select id, tenant_id, offer_no, customer_id, status, valid_until, note, price_slot_no_snapshot, price_slot_label_snapshot,
                currency, subtotal, discount_total, tax_rate, tax_total, grand_total, created_by, created_at, updated_at, sent_at, converted_order_draft_id, document_status
         from offers where tenant_id = $1 and id = $2 limit 1`,
        [this.context.tenantId, id]
      );
      return rows[0] ? mapOfferRowToEntity(rows[0]) : undefined;
    } catch {
      return getOfferMock(id) ?? undefined;
    }
  }

  createOffer(payload: Partial<Offer>) { return createOfferMock(payload); }
  patchOffer(id: string, payload: Partial<Offer>) { return patchOfferMock(id, payload); }
  addOfferLine(id: string, payload: Partial<OfferLine>) { return addOfferLine(id, payload); }
  patchOfferLine(id: string, lineId: string, payload: Partial<OfferLine>) { return patchOfferLine(id, lineId, payload); }
  addOfferFollowUp(id: string, payload: Partial<OfferFollowUp>) { return addOfferFollowUp(id, payload); }
  sendOffer(id: string) { return sendOffer(id); }
  convertOffer(id: string) { return convertOffer(id); }
}
