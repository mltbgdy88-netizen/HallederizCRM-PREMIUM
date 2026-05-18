import { WhatsAppPage } from "../../../src/features/whatsapp/components";

export default function WhatsAppRoutePage({ searchParams }: { searchParams?: { customer?: string } }) {
  return <WhatsAppPage initialCustomerId={searchParams?.customer ?? null} />;
}
