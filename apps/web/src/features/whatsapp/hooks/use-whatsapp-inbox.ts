"use client";

import type { WhatsAppConversation, WhatsAppMessage } from "@hallederiz/types";
import { useCallback, useEffect, useMemo, useState } from "react";
import { dataSourceConfig, sdk } from "../../../lib/data-source";
import { getWhatsAppConversationById, getWhatsAppConversations } from "../queries/whatsapp-mock-data";
import { buildWhatsAppApiPageDetail, type WhatsAppPageDetail } from "../utils/build-whatsapp-api-page-detail";

export function useWhatsAppInbox() {
  const useDemo = dataSourceConfig.useDemoData;
  const demoList = useMemo(() => getWhatsAppConversations(), []);

  const [apiList, setApiList] = useState<WhatsAppConversation[]>([]);
  const [listLoading, setListLoading] = useState(!useDemo);
  const [listError, setListError] = useState<string | null>(null);

  const [selectedId, setSelectedId] = useState<string>(() => (useDemo ? demoList[0]?.id ?? "" : ""));

  const [apiMessages, setApiMessages] = useState<WhatsAppMessage[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const conversations = useDemo ? demoList : apiList;

  const reloadList = useCallback(() => {
    if (useDemo) {
      return;
    }
    setListLoading(true);
    setListError(null);
    sdk.whatsapp
      .listConversations()
      .then((res) => {
        setApiList(res.items ?? []);
      })
      .catch((e: Error) => {
        setApiList([]);
        setListError(e.message ?? "Konuşma listesi alınamadı");
      })
      .finally(() => {
        setListLoading(false);
      });
  }, [useDemo]);

  useEffect(() => {
    reloadList();
  }, [reloadList]);

  useEffect(() => {
    if (useDemo || !apiList.length) {
      return;
    }
    setSelectedId((cur) => (cur && apiList.some((c) => c.id === cur) ? cur : apiList[0]!.id));
  }, [useDemo, apiList]);

  useEffect(() => {
    if (useDemo || !selectedId) {
      setApiMessages([]);
      setDetailError(null);
      setDetailLoading(false);
      return;
    }
    let cancelled = false;
    setDetailLoading(true);
    setDetailError(null);
    sdk.whatsapp
      .getConversation(selectedId)
      .then((res) => {
        if (cancelled) return;
        const bundle = res.item;
        if (!bundle?.conversation) {
          setApiMessages([]);
          setDetailError("Konuşma bulunamadı");
          return;
        }
        setApiMessages(bundle.messages ?? []);
      })
      .catch((e: Error) => {
        if (!cancelled) {
          setApiMessages([]);
          setDetailError(e.message ?? "Konuşma detayı alınamadı");
        }
      })
      .finally(() => {
        if (!cancelled) setDetailLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [useDemo, selectedId]);

  const detail: WhatsAppPageDetail = useMemo(() => {
    if (useDemo) {
      const d = getWhatsAppConversationById(selectedId || undefined);
      return {
        conversation: d.conversation ?? null,
        contact: d.contact,
        messages: d.messages,
        richBlocks: d.richBlocks,
        customer: d.customer ?? null,
        suggestedReply: d.suggestedReply,
        actionRequests: d.actionRequests,
        detectedIntent: d.detectedIntent
      };
    }
    const conv = apiList.find((c) => c.id === selectedId);
    return buildWhatsAppApiPageDetail(conv, apiMessages);
  }, [useDemo, selectedId, apiList, apiMessages]);

  return {
    useDemo,
    conversations,
    selectedId,
    setSelectedId,
    detail,
    listLoading,
    listError,
    detailLoading,
    detailError,
    reloadList
  };
}
