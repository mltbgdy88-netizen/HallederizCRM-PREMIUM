import assert from "node:assert/strict";
import test from "node:test";
import type { CustomerAccount } from "@hallederiz/types";
import { isCustomerFinanceLinked } from "../utils/customer-finance";

test("isCustomerFinanceLinked is false without account", () => {
  assert.equal(isCustomerFinanceLinked(null), false);
  assert.equal(isCustomerFinanceLinked(undefined), false);
});

test("isCustomerFinanceLinked accepts account with balance fields", () => {
  const account = {
    id: "acc_1",
    tenantId: "tenant_1",
    customerId: "customer_1",
    balance: 0,
    currency: "TRY",
    overdueAmount: 0,
    openOfferCount: 0,
    openOrderCount: 0
  } satisfies CustomerAccount;

  assert.equal(isCustomerFinanceLinked(account), true);
});
