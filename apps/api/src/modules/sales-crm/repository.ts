import { calculateOfferTotals, convertOfferToOrderDraft, validateOfferTransition } from "@hallederiz/domain";
import type { QueryExecutor } from "@hallederiz/database";
import type {
  Customer,
  CustomerAccount,
  CustomerAddress,
  CustomerContact,
  CustomerLedgerEntry,
  CustomerPricingProfile,
  Offer,
  OfferFollowUp,
  OfferLine
} from "@hallederiz/types";
import { ApiDomainError, assertOptimisticConcurrency } from "../../shared/errors";
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

const asString = (value: unknown, fallback = ""): string => (typeof value === "string" ? value : fallback);
const asNumber = (value: unknown, fallback = 0): number => (typeof value === "number" ? value : fallback);
const asBoolean = (value: unknown, fallback = false): boolean => (typeof value === "boolean" ? value : fallback);
const nowIso = (): string => new Date().toISOString();

function ensurePriceSlot(value: number): CustomerPricingProfile["selectedPriceSlotNo"] {
  const slot = Math.max(1, Math.min(6, Math.trunc(value || 1)));
  return slot as CustomerPricingProfile["selectedPriceSlotNo"];
}

function mapCustomerRowToEntity(row: Row): Customer {
  const tenantId = asString(row.tenant_id, "tenant_1");
  const customerId = asString(row.id);
  const selectedSlot = ensurePriceSlot(asNumber(row.selected_price_slot_no, 1));
  return {
    id: customerId,
    tenantId,
    code: asString(row.code),
    name: asString(row.name),
    type: asString(row.type, "bayi") as Customer["type"],
    phone: asString(row.phone, "-"),
    email: asString(row.email, undefined),
    city: asString(row.city, "-"),
    addressLine: asString(row.address_line, "-"),
    taxOffice: asString(row.tax_office, undefined),
    taxNumber: asString(row.tax_number, undefined),
    district: asString(row.district, undefined),
    active: asBoolean(row.is_active, true),
    riskLevel: asString(row.risk_level, "low") as Customer["riskLevel"],
    whatsappMatched: asBoolean(row.whatsapp_matched, false),
    lastOrderAt: asString(row.last_order_at, undefined),
    createdAt: asString(row.created_at, nowIso()),
    updatedAt: asString(row.updated_at, nowIso()),
    pricingProfile: {
      id: asString(row.pricing_profile_id, `${customerId}_pricing`),
      tenantId,
      customerId,
      selectedPriceSlotNo: selectedSlot,
      assignedPriceSlot: selectedSlot,
      priceSlotLabelSnapshot: asString(row.price_slot_label_snapshot, `Fiyat Alani ${selectedSlot}`),
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
    validUntil: asString(row.valid_until, nowIso()),
    note: asString(row.note, undefined),
    priceSlotNoSnapshot: ensurePriceSlot(asNumber(row.price_slot_no_snapshot, 1)),
    priceSlotLabelSnapshot: asString(row.price_slot_label_snapshot, "Fiyat Alani 1"),
    currency: asString(row.currency, "TRY") as Offer["currency"],
    subtotal: asNumber(row.subtotal, 0),
    discountTotal: asNumber(row.discount_total, 0),
    taxRate: asNumber(row.tax_rate, 20),
    taxTotal: asNumber(row.tax_total, 0),
    grandTotal: asNumber(row.grand_total, 0),
    createdBy: asString(row.created_by, "user_admin"),
    createdAt: asString(row.created_at, nowIso()),
    updatedAt: asString(row.updated_at, nowIso()),
    sentAt: asString(row.sent_at, undefined),
    convertedOrderDraftId: asString(row.converted_order_draft_id, undefined),
    lines: [],
    followUps: [],
    documentStatus: asString(row.document_status, "not_created") as Offer["documentStatus"]
  };
}

function mapOfferLineRow(row: Row): OfferLine {
  return {
    id: asString(row.id),
    offerId: asString(row.offer_id),
    productId: asString(row.product_id),
    productCode: asString(row.product_code),
    productName: asString(row.product_name),
    quantity: asNumber(row.quantity, 0),
    priceSlotNo: ensurePriceSlot(asNumber(row.price_slot_no, 1)),
    priceSlotLabelSnapshot: asString(row.price_slot_label_snapshot, "Fiyat Alani 1"),
    unitPrice: asNumber(row.unit_price, 0),
    currency: asString(row.currency, "TRY") as OfferLine["currency"],
    exchangeRate: asNumber(row.exchange_rate, 1),
    discountPercent: asNumber(row.discount_percent, 0),
    lineTotal: asNumber(row.line_total, 0),
    sourcePreference: asString(row.source_preference, "warehouse") as OfferLine["sourcePreference"],
    centerStockSnapshot: asNumber(row.center_stock_snapshot, 0),
    factoryStockSnapshot: asNumber(row.factory_stock_snapshot, 0),
    priceOverride: asBoolean(row.price_override, false),
    pricingWarning: asString(row.pricing_warning, undefined)
  };
}

function mapOfferFollowupRow(row: Row): OfferFollowUp {
  return {
    id: asString(row.id),
    offerId: asString(row.offer_id),
    contactChannel: asString(row.contact_channel, "whatsapp") as OfferFollowUp["contactChannel"],
    responseState: asString(row.response_state, "planned") as OfferFollowUp["responseState"],
    note: asString(row.note),
    plannedAt: asString(row.planned_at, nowIso()),
    completedAt: asString(row.completed_at, undefined),
    createdBy: asString(row.created_by, "user_admin"),
    createdAt: asString(row.created_at, nowIso())
  };
}

export class SalesCrmRepository {
  constructor(private readonly context: RequestContext) {}

  private runtime() {
    return buildRepositoryRuntime(this.context);
  }

  private async loadOfferAggregate(executor: QueryExecutor, offerId: string): Promise<Offer | undefined> {
    const offerRows = await executor.query<Row>(
      `select id, tenant_id, offer_no, customer_id, status, valid_until, note, price_slot_no_snapshot, price_slot_label_snapshot,
              currency, subtotal, discount_total, tax_rate, tax_total, grand_total, created_by, created_at, updated_at, sent_at, converted_order_draft_id, document_status
       from offers where tenant_id = $1 and id = $2 limit 1`,
      [this.context.tenantId, offerId]
    );
    const offerRow = offerRows[0];
    if (!offerRow) return undefined;

    const [lineRows, followupRows] = await Promise.all([
      executor.query<Row>(`select * from offer_lines where tenant_id = $1 and offer_id = $2 order by id asc`, [this.context.tenantId, offerId]),
      executor.query<Row>(`select * from offer_followups where tenant_id = $1 and offer_id = $2 order by created_at desc`, [this.context.tenantId, offerId])
    ]);

    return {
      ...mapOfferRowToEntity(offerRow),
      lines: lineRows.map(mapOfferLineRow),
      followUps: followupRows.map(mapOfferFollowupRow)
    };
  }

  private async saveOfferLinesTx(tx: QueryExecutor, offerId: string, lines: OfferLine[]) {
    await tx.query(`delete from offer_lines where tenant_id = $1 and offer_id = $2`, [this.context.tenantId, offerId]);
    for (const line of lines) {
      const computedLineTotal = Number((line.quantity * line.unitPrice * (1 - line.discountPercent / 100)).toFixed(2));
      await tx.query(
        `insert into offer_lines
         (id, tenant_id, offer_id, product_id, product_code, product_name, quantity, price_slot_no, price_slot_label_snapshot,
          unit_price, currency, exchange_rate, discount_percent, line_total, source_preference, center_stock_snapshot, factory_stock_snapshot, price_override, pricing_warning)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)`,
        [
          line.id,
          this.context.tenantId,
          offerId,
          line.productId,
          line.productCode,
          line.productName,
          line.quantity,
          line.priceSlotNo,
          line.priceSlotLabelSnapshot,
          line.unitPrice,
          line.currency,
          line.exchangeRate,
          line.discountPercent,
          computedLineTotal,
          line.sourcePreference,
          line.centerStockSnapshot,
          line.factoryStockSnapshot,
          line.priceOverride,
          line.pricingWarning ?? null
        ]
      );
    }
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
      return await runtime.executor.transaction(async (tx) => {
        const id = payload.id ?? `customer_${Date.now()}`;
        const now = nowIso();
        const customerCode = payload.code ?? `CUS-${Date.now()}`;

        const duplicateCode = await tx.query<Row>(
          `select id from customers where tenant_id = $1 and code = $2 limit 1`,
          [this.context.tenantId, customerCode]
        );
        if (duplicateCode[0]) {
          throw new ApiDomainError("validation_error", "Ayni cari kodu zaten mevcut.", { field: "code" });
        }

        await tx.query(
          `insert into customers
           (id, tenant_id, code, name, type, phone, email, city, district, address_line, tax_office, tax_number, is_active, risk_level, whatsapp_matched, created_at, updated_at)
           values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)`,
          [
            id,
            this.context.tenantId,
            customerCode,
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
           values ($1,$2,$3,$4,$5,$6)`,
          [
            `${id}_pricing`,
            this.context.tenantId,
            id,
            ensurePriceSlot(payload.pricingProfile?.selectedPriceSlotNo ?? 1),
            payload.pricingProfile?.priceSlotLabelSnapshot ?? "Fiyat Alani 1",
            true
          ]
        );

        const row = (await tx.query<Row>(
          `select c.*, cpp.id as pricing_profile_id, cpp.selected_price_slot_no, cpp.price_slot_label_snapshot
           from customers c
           left join customer_pricing_profiles cpp on cpp.customer_id = c.id and cpp.tenant_id = c.tenant_id
           where c.id = $1 and c.tenant_id = $2`,
          [id, this.context.tenantId]
        ))[0];
        if (!row) throw new ApiDomainError("not_found", "Musteri olusturuldu ancak okunamadi.");
        return mapCustomerRowToEntity(row);
      });
    } catch (error) {
      if (error instanceof ApiDomainError) throw error;
      return createCustomerMock(payload);
    }
  }

  async patchCustomer(id: string, payload: Partial<Customer>): Promise<Customer | null> {
    const runtime = this.runtime();
    if (!runtime.dbEnabled) return patchCustomerMock(id, payload);
    try {
      return await runtime.executor.transaction(async (tx) => {
        const existing = (await tx.query<Row>(`select id, updated_at from customers where tenant_id = $1 and id = $2 limit 1`, [this.context.tenantId, id]))[0];
        if (!existing) return null;

        assertOptimisticConcurrency({
          expectedUpdatedAt: payload.updatedAt,
          currentUpdatedAt: asString(existing.updated_at, undefined),
          resource: "customer",
          resourceId: id
        });

        await tx.query(
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
            nowIso()
          ]
        );

        const row = (await tx.query<Row>(
          `select c.*, cpp.id as pricing_profile_id, cpp.selected_price_slot_no, cpp.price_slot_label_snapshot
           from customers c
           left join customer_pricing_profiles cpp on cpp.customer_id = c.id and cpp.tenant_id = c.tenant_id
           where c.tenant_id = $1 and c.id = $2`,
          [this.context.tenantId, id]
        ))[0];
        return row ? mapCustomerRowToEntity(row) : null;
      });
    } catch (error) {
      if (error instanceof ApiDomainError) throw error;
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
        occurredAt: asString(row.occurred_at, nowIso())
      }));
    } catch {
      return getLedger(id);
    }
  }

  async addContact(id: string, payload: Partial<CustomerContact>) {
    const runtime = this.runtime();
    if (!runtime.dbEnabled) return addContact(id, payload);
    try {
      return await runtime.executor.transaction(async (tx) => {
        const customer = (await tx.query<Row>(`select id from customers where tenant_id = $1 and id = $2 limit 1`, [this.context.tenantId, id]))[0];
        if (!customer) throw new ApiDomainError("not_found", "Customer not found");

        const contactId = payload.id ?? `contact_${Date.now()}`;
        await tx.query(
          `insert into customer_contacts (id, tenant_id, customer_id, full_name, title, phone, email, is_primary)
           values ($1,$2,$3,$4,$5,$6,$7,$8)`,
          [contactId, this.context.tenantId, id, payload.fullName ?? "Yeni Yetkili", payload.title ?? null, payload.phone ?? "", payload.email ?? null, payload.isPrimary ?? false]
        );
        const row = (await tx.query<Row>(`select * from customer_contacts where tenant_id = $1 and id = $2`, [this.context.tenantId, contactId]))[0];
        if (!row) throw new ApiDomainError("validation_error", "Contact insert failed");
        return {
          id: asString(row.id),
          tenantId: asString(row.tenant_id, this.context.tenantId),
          customerId: asString(row.customer_id),
          fullName: asString(row.full_name),
          title: asString(row.title, undefined),
          phone: asString(row.phone),
          email: asString(row.email, undefined),
          isPrimary: asBoolean(row.is_primary, false)
        } satisfies CustomerContact;
      });
    } catch (error) {
      if (error instanceof ApiDomainError) throw error;
      return addContact(id, payload);
    }
  }

  async addAddress(id: string, payload: Partial<CustomerAddress>) {
    const runtime = this.runtime();
    if (!runtime.dbEnabled) return addAddress(id, payload);
    try {
      return await runtime.executor.transaction(async (tx) => {
        const customer = (await tx.query<Row>(`select id from customers where tenant_id = $1 and id = $2 limit 1`, [this.context.tenantId, id]))[0];
        if (!customer) throw new ApiDomainError("not_found", "Customer not found");

        const addressId = payload.id ?? `address_${Date.now()}`;
        await tx.query(
          `insert into customer_addresses (id, tenant_id, customer_id, type, title, city, district, line, is_default)
           values ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
          [addressId, this.context.tenantId, id, payload.type ?? "delivery", payload.title ?? "Yeni Adres", payload.city ?? "", payload.district ?? null, payload.line ?? "", payload.isDefault ?? false]
        );
        const row = (await tx.query<Row>(`select * from customer_addresses where tenant_id = $1 and id = $2`, [this.context.tenantId, addressId]))[0];
        if (!row) throw new ApiDomainError("validation_error", "Address insert failed");
        return {
          id: asString(row.id),
          tenantId: asString(row.tenant_id, this.context.tenantId),
          customerId: asString(row.customer_id),
          type: asString(row.type, "delivery") as CustomerAddress["type"],
          title: asString(row.title),
          city: asString(row.city),
          district: asString(row.district, undefined),
          line: asString(row.line),
          isDefault: asBoolean(row.is_default, false)
        } satisfies CustomerAddress;
      });
    } catch (error) {
      if (error instanceof ApiDomainError) throw error;
      return addAddress(id, payload);
    }
  }

  async patchPricingProfile(id: string, payload: Partial<CustomerPricingProfile>) {
    const runtime = this.runtime();
    if (!runtime.dbEnabled) return patchPricingProfile(id, payload);
    try {
      return await runtime.executor.transaction(async (tx) => {
        const customer = (await tx.query<Row>(`select id from customers where tenant_id = $1 and id = $2 limit 1`, [this.context.tenantId, id]))[0];
        if (!customer) return null;

        await tx.query(
          `insert into customer_pricing_profiles (id, tenant_id, customer_id, selected_price_slot_no, price_slot_label_snapshot, active)
           values ($1,$2,$3,$4,$5,$6)
           on conflict (id) do update set
             selected_price_slot_no = excluded.selected_price_slot_no,
             price_slot_label_snapshot = excluded.price_slot_label_snapshot,
             active = excluded.active`,
          [
            payload.id ?? `${id}_pricing`,
            this.context.tenantId,
            id,
            ensurePriceSlot(payload.selectedPriceSlotNo ?? 1),
            payload.priceSlotLabelSnapshot ?? `Fiyat Alani ${payload.selectedPriceSlotNo ?? 1}`,
            payload.active ?? true
          ]
        );

        const row = (await tx.query<Row>(
          `select c.*, cpp.id as pricing_profile_id, cpp.selected_price_slot_no, cpp.price_slot_label_snapshot
           from customers c
           left join customer_pricing_profiles cpp on cpp.customer_id = c.id and cpp.tenant_id = c.tenant_id
           where c.tenant_id = $1 and c.id = $2`,
          [this.context.tenantId, id]
        ))[0];
        return row ? mapCustomerRowToEntity(row) : null;
      });
    } catch (error) {
      if (error instanceof ApiDomainError) throw error;
      return patchPricingProfile(id, payload);
    }
  }

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
      const offers = rows.map(mapOfferRowToEntity);
      for (const offer of offers) {
        const lines = await runtime.executor.query<Row>(`select * from offer_lines where tenant_id = $1 and offer_id = $2`, [this.context.tenantId, offer.id]);
        const followups = await runtime.executor.query<Row>(`select * from offer_followups where tenant_id = $1 and offer_id = $2 order by created_at desc`, [this.context.tenantId, offer.id]);
        offer.lines = lines.map(mapOfferLineRow);
        offer.followUps = followups.map(mapOfferFollowupRow);
      }
      return offers;
    } catch {
      return listOffersMock();
    }
  }

  async getOffer(id: string): Promise<Offer | undefined> {
    const runtime = this.runtime();
    if (!runtime.dbEnabled) return getOfferMock(id) ?? undefined;
    try {
      return await this.loadOfferAggregate(runtime.executor, id);
    } catch {
      return getOfferMock(id) ?? undefined;
    }
  }

  async createOffer(payload: Partial<Offer>) {
    const runtime = this.runtime();
    if (!runtime.dbEnabled) return createOfferMock(payload);
    try {
      return await runtime.executor.transaction(async (tx) => {
        const id = payload.id ?? `offer_${Date.now()}`;
        const now = nowIso();
        const lines = (payload.lines ?? []).map((line, index) => ({
          id: line.id ?? `offer_line_${Date.now()}_${index}`,
          offerId: id,
          productId: line.productId ?? "",
          productCode: line.productCode ?? "",
          productName: line.productName ?? "",
          quantity: line.quantity ?? 0,
          priceSlotNo: ensurePriceSlot(line.priceSlotNo ?? payload.priceSlotNoSnapshot ?? 1),
          priceSlotLabelSnapshot: line.priceSlotLabelSnapshot ?? payload.priceSlotLabelSnapshot ?? "Fiyat Alani 1",
          unitPrice: line.unitPrice ?? 0,
          currency: line.currency ?? payload.currency ?? "TRY",
          exchangeRate: line.exchangeRate ?? 1,
          discountPercent: line.discountPercent ?? 0,
          lineTotal: line.lineTotal ?? 0,
          sourcePreference: line.sourcePreference ?? "warehouse",
          centerStockSnapshot: line.centerStockSnapshot ?? 0,
          factoryStockSnapshot: line.factoryStockSnapshot ?? 0,
          priceOverride: line.priceOverride ?? false,
          pricingWarning: line.pricingWarning
        })) satisfies OfferLine[];

        const totals = calculateOfferTotals({ lines, taxRate: payload.taxRate ?? 20, currency: payload.currency ?? "TRY" });

        await tx.query(
          `insert into offers
           (id, tenant_id, offer_no, customer_id, status, valid_until, note, price_slot_no_snapshot, price_slot_label_snapshot,
            currency, subtotal, discount_total, tax_rate, tax_total, grand_total, created_by, created_at, updated_at, sent_at, converted_order_draft_id, document_status)
           values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)`,
          [
            id,
            this.context.tenantId,
            payload.offerNo ?? `OFF-${Date.now().toString().slice(-6)}`,
            payload.customerId ?? "customer_1",
            payload.status ?? "draft",
            payload.validUntil ?? now,
            payload.note ?? null,
            ensurePriceSlot(payload.priceSlotNoSnapshot ?? 1),
            payload.priceSlotLabelSnapshot ?? "Fiyat Alani 1",
            totals.currency,
            totals.subtotal,
            totals.discountTotal,
            totals.taxRate,
            totals.taxTotal,
            totals.grandTotal,
            payload.createdBy ?? this.context.userId,
            now,
            now,
            payload.sentAt ?? null,
            payload.convertedOrderDraftId ?? null,
            payload.documentStatus ?? "not_created"
          ]
        );

        await this.saveOfferLinesTx(tx, id, lines);
        const aggregate = await this.loadOfferAggregate(tx, id);
        if (!aggregate) throw new ApiDomainError("validation_error", "Teklif kaydi okunamadi.");
        return aggregate;
      });
    } catch (error) {
      if (error instanceof ApiDomainError) throw error;
      return createOfferMock(payload);
    }
  }

  async patchOffer(id: string, payload: Partial<Offer>) {
    const runtime = this.runtime();
    if (!runtime.dbEnabled) return patchOfferMock(id, payload);
    try {
      return await runtime.executor.transaction(async (tx) => {
        const existing = await this.loadOfferAggregate(tx, id);
        if (!existing) return null;

        assertOptimisticConcurrency({
          expectedUpdatedAt: payload.updatedAt,
          currentUpdatedAt: existing.updatedAt,
          resource: "offer",
          resourceId: id
        });

        const nextStatus = payload.status ?? existing.status;
        const transition = validateOfferTransition(existing.status, nextStatus);
        if (!transition.valid) {
          throw new ApiDomainError("validation_error", transition.reason ?? "Teklif durum gecisi gecersiz.");
        }

        const nextLines = (payload.lines ?? existing.lines).map((line) => ({ ...line, offerId: id }));
        const totals = calculateOfferTotals({
          lines: nextLines,
          taxRate: payload.taxRate ?? existing.taxRate,
          currency: payload.currency ?? existing.currency
        });

        await tx.query(
          `update offers set
             offer_no = coalesce($3, offer_no),
             customer_id = coalesce($4, customer_id),
             status = $5,
             valid_until = coalesce($6, valid_until),
             note = coalesce($7, note),
             price_slot_no_snapshot = coalesce($8, price_slot_no_snapshot),
             price_slot_label_snapshot = coalesce($9, price_slot_label_snapshot),
             currency = $10,
             subtotal = $11,
             discount_total = $12,
             tax_rate = $13,
             tax_total = $14,
             grand_total = $15,
             updated_at = $16,
             sent_at = coalesce($17, sent_at),
             converted_order_draft_id = coalesce($18, converted_order_draft_id),
             document_status = coalesce($19, document_status)
           where tenant_id = $1 and id = $2`,
          [
            this.context.tenantId,
            id,
            payload.offerNo ?? null,
            payload.customerId ?? null,
            nextStatus,
            payload.validUntil ?? null,
            payload.note ?? null,
            payload.priceSlotNoSnapshot ?? null,
            payload.priceSlotLabelSnapshot ?? null,
            totals.currency,
            totals.subtotal,
            totals.discountTotal,
            totals.taxRate,
            totals.taxTotal,
            totals.grandTotal,
            nowIso(),
            payload.sentAt ?? null,
            payload.convertedOrderDraftId ?? null,
            payload.documentStatus ?? null
          ]
        );

        await this.saveOfferLinesTx(tx, id, nextLines);
        return this.loadOfferAggregate(tx, id) ?? null;
      });
    } catch (error) {
      if (error instanceof ApiDomainError) throw error;
      return patchOfferMock(id, payload);
    }
  }

  async addOfferLine(id: string, payload: Partial<OfferLine>) {
    const runtime = this.runtime();
    if (!runtime.dbEnabled) return addOfferLine(id, payload);
    const existing = await this.getOffer(id);
    if (!existing) return null;
    const nextLine: OfferLine = {
      id: payload.id ?? `offer_line_${Date.now()}`,
      offerId: id,
      productId: payload.productId ?? "",
      productCode: payload.productCode ?? "",
      productName: payload.productName ?? "",
      quantity: payload.quantity ?? 0,
      priceSlotNo: ensurePriceSlot(payload.priceSlotNo ?? existing.priceSlotNoSnapshot),
      priceSlotLabelSnapshot: payload.priceSlotLabelSnapshot ?? existing.priceSlotLabelSnapshot,
      unitPrice: payload.unitPrice ?? 0,
      currency: payload.currency ?? existing.currency,
      exchangeRate: payload.exchangeRate ?? 1,
      discountPercent: payload.discountPercent ?? 0,
      lineTotal: payload.lineTotal ?? 0,
      sourcePreference: payload.sourcePreference ?? "warehouse",
      centerStockSnapshot: payload.centerStockSnapshot ?? 0,
      factoryStockSnapshot: payload.factoryStockSnapshot ?? 0,
      priceOverride: payload.priceOverride ?? false,
      pricingWarning: payload.pricingWarning
    };
    return this.patchOffer(id, { updatedAt: existing.updatedAt, lines: [...existing.lines, nextLine] });
  }

  async patchOfferLine(id: string, lineId: string, payload: Partial<OfferLine>) {
    const runtime = this.runtime();
    if (!runtime.dbEnabled) return patchOfferLine(id, lineId, payload);
    const existing = await this.getOffer(id);
    if (!existing) return null;
    return this.patchOffer(id, {
      updatedAt: existing.updatedAt,
      lines: existing.lines.map((line) => (line.id === lineId ? { ...line, ...payload, id: line.id, offerId: id } : line))
    });
  }

  async addOfferFollowUp(id: string, payload: Partial<OfferFollowUp>) {
    const runtime = this.runtime();
    if (!runtime.dbEnabled) return addOfferFollowUp(id, payload);
    try {
      return await runtime.executor.transaction(async (tx) => {
        const existing = await this.loadOfferAggregate(tx, id);
        if (!existing) return null;

        const followupId = payload.id ?? `followup_${Date.now()}`;
        await tx.query(
          `insert into offer_followups (id, tenant_id, offer_id, contact_channel, response_state, note, planned_at, completed_at, created_by, created_at)
           values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
          [
            followupId,
            this.context.tenantId,
            id,
            payload.contactChannel ?? "whatsapp",
            payload.responseState ?? "planned",
            payload.note ?? "",
            payload.plannedAt ?? nowIso(),
            payload.completedAt ?? null,
            payload.createdBy ?? this.context.userId,
            nowIso()
          ]
        );
        return this.loadOfferAggregate(tx, id) ?? existing;
      });
    } catch (error) {
      if (error instanceof ApiDomainError) throw error;
      return addOfferFollowUp(id, payload);
    }
  }

  async sendOffer(id: string) {
    const existing = await this.getOffer(id);
    if (!existing) return null;
    return this.patchOffer(id, {
      updatedAt: existing.updatedAt,
      status: "sent",
      sentAt: nowIso(),
      documentStatus: "sent"
    });
  }

  async convertOffer(id: string) {
    const offer = await this.getOffer(id);
    if (!offer) return null;
    const draft = convertOfferToOrderDraft(offer);
    await this.patchOffer(id, {
      updatedAt: offer.updatedAt,
      status: "converted",
      convertedOrderDraftId: draft.id
    });
    return draft;
  }
}
