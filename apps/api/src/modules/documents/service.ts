import type { Document, DocumentType } from "@hallederiz/types";
import type { RequestContext } from "../../shared/request-context";
import { getDocument, renderDocument } from "../../commercial-operations/mock-store";

interface RenderInput {
  type: DocumentType;
  entityType: Document["entityType"];
  entityId: string;
  entityNo: string;
  customerId?: string;
}

const documentTitleMap: Record<DocumentType, string> = {
  offer_pdf: "Teklif Belgesi",
  order_pdf: "Siparis Belgesi",
  payment_receipt_pdf: "Tahsilat Fisi",
  warehouse_note_pdf: "Depo Hazirlik Notu",
  delivery_note_pdf: "Teslim Fisi",
  dispatch_note_pdf: "Irsaliye",
  invoice_pdf: "Fatura",
  statement_pdf: "Ekstre",
  return_note_pdf: "Iade Belgesi"
};

export class DocumentGenerationService {
  constructor(private readonly context: RequestContext) {}

  render(input: RenderInput) {
    const result = renderDocument(input);
    return {
      ...result,
      title: `${documentTitleMap[input.type]} - ${input.entityNo}`,
      previewText: this.generatePreview(input)
    };
  }

  regenerate(documentId: string) {
    const source = getDocument(documentId);
    if (!source || source.tenantId !== this.context.tenantId) return null;
    return this.render({
      type: source.type,
      entityType: source.entityType,
      entityId: source.entityId,
      entityNo: source.entityNo,
      customerId: source.customerId
    });
  }

  private generatePreview(input: RenderInput) {
    const header = documentTitleMap[input.type];
    return `${header} | Kayit: ${input.entityNo} | Uretim: ${new Date().toLocaleString("tr-TR")}`;
  }
}
