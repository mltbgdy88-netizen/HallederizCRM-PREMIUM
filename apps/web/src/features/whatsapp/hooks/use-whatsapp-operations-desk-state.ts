"use client";

import { useEffect, useMemo, useState } from "react";
import { getCustomerById } from "../../customers/queries/customer-mock-data";
import {
  deskStatusForConversation,
  mapConversationToDetailPanel,
  mapConversationToTableRow,
  mapConversationsToReferenceKpis,
  type WopReferenceDetail
} from "../utils/map-conversation-to-reference-desk";
import { useWhatsAppInbox } from "./use-whatsapp-inbox";

export type WhatsAppDeskStatusFilter = "all" | "pending" | "approval" | "active";

export function useWhatsAppOperationsDeskState(initialCustomerId?: string | null) {
  const inbox = useWhatsAppInbox(initialCustomerId);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<WhatsAppDeskStatusFilter>("all");
  const [channel, setChannel] = useState("all");
  const [agent, setAgent] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filteredConversations = useMemo(() => {
    const q = search.trim().toLowerCase();
    return inbox.conversations.filter((conversation) => {
      const status = deskStatusForConversation(conversation);
      if (statusFilter === "approval" && status.tone !== "approval") return false;
      if (statusFilter === "pending" && status.tone !== "pending") return false;
      if (statusFilter === "active" && status.tone !== "ok") return false;
      if (channel !== "all" && channel !== "whatsapp") return false;
      if (agent !== "all" && agent !== "emre") return false;
      if (!q) return true;
      const customer = conversation.relatedCustomerId ? getCustomerById(conversation.relatedCustomerId) : null;
      const blob = `${conversation.title} ${conversation.lastMessagePreview} ${customer?.name ?? ""} ${conversation.id}`.toLowerCase();
      return blob.includes(q);
    });
  }, [inbox.conversations, search, statusFilter, channel, agent]);

  const pagedConversations = useMemo(
    () => filteredConversations.slice((page - 1) * pageSize, page * pageSize),
    [filteredConversations, page, pageSize]
  );

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, channel, agent]);

  useEffect(() => {
    if (!filteredConversations.length) return;
    if (!inbox.selectedId || !filteredConversations.some((item) => item.id === inbox.selectedId)) {
      inbox.setSelectedId(filteredConversations[0]!.id);
    }
  }, [filteredConversations, inbox.selectedId, inbox.setSelectedId]);

  const selectedConversation = useMemo(
    () =>
      filteredConversations.find((item) => item.id === inbox.selectedId) ??
      inbox.conversations.find((item) => item.id === inbox.selectedId) ??
      null,
    [filteredConversations, inbox.conversations, inbox.selectedId]
  );

  const tableRows = useMemo(() => pagedConversations.map(mapConversationToTableRow), [pagedConversations]);

  const kpis = useMemo(
    () => mapConversationsToReferenceKpis(inbox.allConversations, inbox.useDemo),
    [inbox.allConversations, inbox.useDemo]
  );

  const detailPanel = useMemo(
    (): WopReferenceDetail | null => mapConversationToDetailPanel(selectedConversation, inbox.detail),
    [selectedConversation, inbox.detail]
  );

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setChannel("all");
    setAgent("all");
  };

  const paginationLabel = useMemo(() => {
    if (!filteredConversations.length) return "0 konuşma";
    const start = (page - 1) * pageSize + 1;
    const end = Math.min(page * pageSize, filteredConversations.length);
    return `${start}–${end} / ${filteredConversations.length} konuşma`;
  }, [filteredConversations.length, page, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredConversations.length / pageSize));

  return {
    ...inbox,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    channel,
    setChannel,
    agent,
    setAgent,
    page,
    setPage,
    pageSize,
    totalPages,
    paginationLabel,
    filteredConversations,
    pagedConversations,
    selectedConversation,
    tableRows,
    kpis,
    detailPanel,
    resetFilters
  };
}

export type WhatsAppOperationsDeskState = ReturnType<typeof useWhatsAppOperationsDeskState>;
