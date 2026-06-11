import { WhatsAppReferenceLayout } from "../../../src/features/whatsapp/components/WhatsAppReferenceLayout";

export default function WhatsAppRoutePage({ searchParams }: { searchParams?: { customer?: string } }) {
  return <WhatsAppReferenceLayout initialCustomerId={searchParams?.customer ?? null} />;
}
