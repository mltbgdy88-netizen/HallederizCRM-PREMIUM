import type { ChannelConversation, ChannelMessage, ConversationStatus } from "./model";

export interface OmnichannelConversationRepository {
  listByTenant(tenantId: string, filters?: { channel?: string; status?: ConversationStatus }): Promise<ChannelConversation[]>;
  getById(tenantId: string, conversationId: string): Promise<ChannelConversation | undefined>;
  save(conversation: ChannelConversation): Promise<ChannelConversation>;
  assign(tenantId: string, conversationId: string, assignedUserId: string): Promise<ChannelConversation | undefined>;
  resolve(tenantId: string, conversationId: string): Promise<ChannelConversation | undefined>;
}

export interface OmnichannelMessageRepository {
  listByConversation(tenantId: string, conversationId: string): Promise<ChannelMessage[]>;
  append(message: ChannelMessage): Promise<ChannelMessage>;
}

function nowIso() {
  return new Date().toISOString();
}

export class InMemoryOmnichannelConversationRepository implements OmnichannelConversationRepository {
  private readonly items = new Map<string, ChannelConversation[]>();

  async listByTenant(tenantId: string, filters?: { channel?: string; status?: ConversationStatus }): Promise<ChannelConversation[]> {
    const source = this.items.get(tenantId) ?? [];
    return source.filter((item) => {
      if (filters?.channel && item.channel !== filters.channel) return false;
      if (filters?.status && item.status !== filters.status) return false;
      return true;
    });
  }

  async getById(tenantId: string, conversationId: string): Promise<ChannelConversation | undefined> {
    return (this.items.get(tenantId) ?? []).find((item) => item.id === conversationId);
  }

  async save(conversation: ChannelConversation): Promise<ChannelConversation> {
    const list = this.items.get(conversation.tenantId) ?? [];
    const idx = list.findIndex((item) => item.id === conversation.id);
    const prepared: ChannelConversation = {
      ...conversation,
      updatedAt: conversation.updatedAt || nowIso(),
      createdAt: conversation.createdAt || nowIso(),
      tags: conversation.tags ?? [],
      metadata: conversation.metadata ?? {}
    };
    if (idx >= 0) {
      list[idx] = prepared;
    } else {
      list.push(prepared);
    }
    this.items.set(conversation.tenantId, list);
    return prepared;
  }

  async assign(tenantId: string, conversationId: string, assignedUserId: string): Promise<ChannelConversation | undefined> {
    const current = await this.getById(tenantId, conversationId);
    if (!current) return undefined;
    const next = { ...current, assignedUserId, updatedAt: nowIso() };
    await this.save(next);
    return next;
  }

  async resolve(tenantId: string, conversationId: string): Promise<ChannelConversation | undefined> {
    const current = await this.getById(tenantId, conversationId);
    if (!current) return undefined;
    const next = { ...current, status: "resolved" as const, updatedAt: nowIso() };
    await this.save(next);
    return next;
  }
}

export class InMemoryOmnichannelMessageRepository implements OmnichannelMessageRepository {
  private readonly items = new Map<string, ChannelMessage[]>();

  async listByConversation(tenantId: string, conversationId: string): Promise<ChannelMessage[]> {
    return (this.items.get(tenantId) ?? []).filter((item) => item.conversationId === conversationId);
  }

  async append(message: ChannelMessage): Promise<ChannelMessage> {
    const list = this.items.get(message.tenantId) ?? [];
    const prepared: ChannelMessage = {
      ...message,
      attachments: message.attachments ?? [],
      metadata: message.metadata ?? {},
      createdAt: message.createdAt || nowIso()
    };
    list.push(prepared);
    this.items.set(message.tenantId, list);
    return prepared;
  }
}
