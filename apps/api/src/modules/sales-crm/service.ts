import type { Customer, CustomerAddress, CustomerContact, CustomerPricingProfile, Offer, OfferFollowUp, OfferLine } from "@hallederiz/types";
import type { RequestContext } from "../../shared/request-context";
import { SalesCrmRepository } from "./repository";

export class SalesCrmService {
  private readonly repository: SalesCrmRepository;

  constructor(context: RequestContext) {
    this.repository = new SalesCrmRepository(context);
  }

  listCustomers() {
    return this.repository.listCustomers();
  }
  getCustomer(id: string) {
    return this.repository.getCustomer(id);
  }
  createCustomer(payload: Partial<Customer>) {
    return this.repository.createCustomer(payload);
  }
  patchCustomer(id: string, payload: Partial<Customer>) {
    return this.repository.patchCustomer(id, payload);
  }
  getAccountSummary(id: string) {
    return this.repository.getAccountSummary(id);
  }
  getLedger(id: string) {
    return this.repository.getLedger(id);
  }
  addContact(id: string, payload: Partial<CustomerContact>) {
    return this.repository.addContact(id, payload);
  }
  addAddress(id: string, payload: Partial<CustomerAddress>) {
    return this.repository.addAddress(id, payload);
  }
  patchPricingProfile(id: string, payload: Partial<CustomerPricingProfile>) {
    return this.repository.patchPricingProfile(id, payload);
  }
  listOffers() {
    return this.repository.listOffers();
  }
  getOffer(id: string) {
    return this.repository.getOffer(id);
  }
  createOffer(payload: Partial<Offer>) {
    return this.repository.createOffer(payload);
  }
  patchOffer(id: string, payload: Partial<Offer>) {
    return this.repository.patchOffer(id, payload);
  }
  addOfferLine(id: string, payload: Partial<OfferLine>) {
    return this.repository.addOfferLine(id, payload);
  }
  patchOfferLine(id: string, lineId: string, payload: Partial<OfferLine>) {
    return this.repository.patchOfferLine(id, lineId, payload);
  }
  addOfferFollowUp(id: string, payload: Partial<OfferFollowUp>) {
    return this.repository.addOfferFollowUp(id, payload);
  }
  sendOffer(id: string) {
    return this.repository.sendOffer(id);
  }
  convertOffer(id: string) {
    return this.repository.convertOffer(id);
  }
}
