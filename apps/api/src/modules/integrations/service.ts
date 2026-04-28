import type { ErpConnection, ErpMapping, FactoryOrder, WhatsAppActionRequest, WhatsAppMessage } from "@hallederiz/types";
import type { RequestContext } from "../../shared/request-context";
import { ErpAdapter } from "./adapters/erp-adapter";
import { FactoryAdapter } from "./adapters/factory-adapter";
import { WhatsAppAdapter } from "./adapters/whatsapp-adapter";

export class IntegrationsService {
  private readonly whatsappAdapter: WhatsAppAdapter;
  private readonly erpAdapter: ErpAdapter;
  private readonly factoryAdapter: FactoryAdapter;

  constructor(context: RequestContext) {
    this.whatsappAdapter = new WhatsAppAdapter(context);
    this.erpAdapter = new ErpAdapter(context);
    this.factoryAdapter = new FactoryAdapter(context);
  }

  listWhatsAppConversations() {
    return this.whatsappAdapter.listConversations();
  }

  getWhatsAppConversation(id: string) {
    return this.whatsappAdapter.getConversation(id);
  }

  receiveWhatsAppInbound(payload: Partial<WhatsAppMessage>) {
    return this.whatsappAdapter.inbound(payload);
  }

  sendWhatsAppOutbound(payload: Partial<WhatsAppMessage>) {
    return this.whatsappAdapter.outbound(payload);
  }

  createWhatsAppActionRequest(payload: Partial<WhatsAppActionRequest>) {
    return this.whatsappAdapter.createActionRequest(payload);
  }

  confirmWhatsAppActionRequest(id: string) {
    return this.whatsappAdapter.confirmActionRequest(id);
  }

  rejectWhatsAppActionRequest(id: string) {
    return this.whatsappAdapter.rejectActionRequest(id);
  }

  listWhatsAppTemplates() {
    return this.whatsappAdapter.listTemplates();
  }

  listErpConnections() {
    return this.erpAdapter.listConnections();
  }

  getErpConnection(id: string) {
    return this.erpAdapter.getConnection(id);
  }

  createErpConnection(payload: Partial<ErpConnection>) {
    return this.erpAdapter.createConnection(payload);
  }

  patchErpConnection(id: string, payload: Partial<ErpConnection>) {
    return this.erpAdapter.patchConnection(id, payload);
  }

  testErpConnection(id: string) {
    return this.erpAdapter.testConnection(id);
  }

  syncErpConnection(id: string) {
    return this.erpAdapter.syncConnection(id);
  }

  listErpMappings() {
    return this.erpAdapter.listMappings();
  }

  patchErpMappings(payload: ErpMapping[]) {
    return this.erpAdapter.patchMappings(payload);
  }

  listErpLogs() {
    return this.erpAdapter.listLogs();
  }

  listErpTemplates() {
    return this.erpAdapter.listTemplates();
  }

  listFactories() {
    return this.factoryAdapter.listFactories();
  }

  listFactoryStocks(factoryId: string) {
    return this.factoryAdapter.listStocks(factoryId);
  }

  syncFactoryStock(factoryId: string) {
    return this.factoryAdapter.syncStock(factoryId);
  }

  listFactoryOrders() {
    return this.factoryAdapter.listOrders();
  }

  getFactoryOrder(id: string) {
    return this.factoryAdapter.getOrder(id);
  }

  createFactoryOrder(payload: Partial<FactoryOrder>) {
    return this.factoryAdapter.createOrder(payload);
  }

  sendFactoryOrder(id: string) {
    return this.factoryAdapter.sendOrder(id);
  }

  confirmFactoryOrder(id: string) {
    return this.factoryAdapter.confirmOrder(id);
  }

  markFactoryOrderShipped(id: string) {
    return this.factoryAdapter.markShipped(id);
  }

  completeFactoryOrder(id: string) {
    return this.factoryAdapter.completeOrder(id);
  }

  getFactoryIntegrationHealth() {
    return this.factoryAdapter.getHealth();
  }
}
