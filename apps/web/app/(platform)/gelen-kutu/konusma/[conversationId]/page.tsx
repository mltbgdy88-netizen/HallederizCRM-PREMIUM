import { OmnichannelConversationDetailPage } from "../../../../../src/features/inbox/components/OmnichannelConversationDetailPage";

type PageProps = {
  params: Promise<{ conversationId: string }>;
};

export default async function GelenKutuKonusmaPage({ params }: PageProps) {
  const resolvedParams = await params;
  return <OmnichannelConversationDetailPage conversationId={resolvedParams.conversationId} />;
}
