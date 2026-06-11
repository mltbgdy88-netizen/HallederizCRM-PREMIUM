"use client";

import { OmnichannelThreePanelPage } from "./OmnichannelThreePanelPage";

type Props = {
  conversationId: string;
};

export function OmnichannelConversationDetailPage({ conversationId }: Props) {
  return <OmnichannelThreePanelPage initialConversationId={conversationId} />;
}
