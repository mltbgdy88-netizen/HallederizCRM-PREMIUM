import { OmnichannelConversationDetailPage } from "../../../../../src/features/inbox/components/OmnichannelConversationDetailPage";

type PageProps = {
  params: { conversationId: string };
};

export default function GelenKutuKonusmaPage({ params }: PageProps) {
  return <OmnichannelConversationDetailPage conversationId={params.conversationId} />;
}
