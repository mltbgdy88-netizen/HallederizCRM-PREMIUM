"use client";

import type { WhatsAppConversation, WhatsAppMessage } from "@hallederiz/types";
import { useCallback, useEffect, useMemo, useState } from "react";
import { dataSourceConfig, sdk } from "../../../lib/data-source";
import { getCustomerById } from "../../customers/queries/customer-mock-data";
import { getWhatsAppConversationById, getWhatsAppConversations } from "../queries/whatsapp-mock-data";
import { buildWhatsAppApiPageDetail, type WhatsAppPageDetail } from "../utils/build-whatsapp-api-page-detail";
import { mapWhatsAppDetailError, mapWhatsAppInboxError } from "../utils/whatsapp-action-feedback";

function pickConversationId(list: WhatsAppConversation[], customerId: string | null | undefined, useDemo: boolean): string {
  if (customerId) {
    const match = list.find((item) => item.relatedCustomerId === customerId);
    if (match) {
      return match.id;
    }
  }
  if (useDemo) {
    return list[0]?.id ?? "";
  }
  return "";
}

export function useWhatsAppInbox(initialCustomerId?: string | null) {
  const useDemo = dataSourceConfig.useDemoData;
  const demoList = useMemo(() => getWhatsAppConversations(), []);

  const [apiList, setApiList] = useState<WhatsAppConversation[]>([]);
  const [listLoading, setListLoading] = useState(!useDemo);
  const [listError, setListError] = useState<string | null>(null);

  const [selectedId, setSelectedId] = useState<string>(() => pickConversationId(demoList, initialCustomerId, useDemo));

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
      .catch((error: unknown) => {
        setApiList([]);
        setListError(mapWhatsAppInboxError(error));
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
    const pool = initialCustomerId
      ? apiList.filter((item) => item.relatedCustomerId === initialCustomerId)
      : apiList;
    if (!pool.length) {
      setSelectedId("");
      return;
    }
    setSelectedId((cur) => (cur && pool.some((c) => c.id === cur) ? cur : pool[0]!.id));
  }, [useDemo, apiList, initialCustomerId]);

  useEffect(() => {
    if (!initialCustomerId) {
      return;
    }
    const match = conversations.find((item) => item.relatedCustomerId === initialCustomerId);
    if (match) {
      setSelectedId(match.id);
    } else if (!useDemo) {
      setSelectedId("");
    }
  }, [initialCustomerId, conversations, useDemo]);

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
          setDetailError(mapWhatsAppDetailError(new Error("not_found")));
          return;
        }
        setApiMessages(bundle.messages ?? []);
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setApiMessages([]);
          setDetailError(mapWhatsAppDetailError(error));
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

  const contextCustomer = useMemo(() => {
    if (!initialCustomerId) {
      return null;
    }
    return getCustomerById(initialCustomerId) ?? null;
  }, [initialCustomerId]);

  const customerScopedConversations = useMemo(() => {
    if (!initialCustomerId) {
      return conversations;
    }
    return conversations.filter((item) => item.relatedCustomerId === initialCustomerId);
  }, [conversations, initialCustomerId]);

  return {
    useDemo,
    conversations: customerScopedConversations,
    allConversations: conversations,
    initialCustomerId: initialCustomerId ?? null,
    contextCustomer,
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
