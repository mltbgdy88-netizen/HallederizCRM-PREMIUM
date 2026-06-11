import { WhatsAppReferenceLayout } from "../../../src/features/whatsapp/components/WhatsAppReferenceLayout";

export default async function WhatsAppRoutePage({ searchParams }: { searchParams?: Promise<{ customer?: string }> }) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  return <WhatsAppReferenceLayout initialCustomerId={resolvedSearchParams?.customer ?? null} />;
}
