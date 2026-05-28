import {
  InMemoryOmnichannelConversationRepository,
  InMemoryOmnichannelMessageRepository,
  type ChannelProviderAdapter,
  type OmnichannelConversationRepository,
  type OmnichannelMessageRepository
} from "@hallederiz/domain";
import {
  createQueryExecutor,
  createDatabaseAiChatSessionRepository,
  createDatabaseAiReplyJobRepository,
  createDatabaseAiReplySuggestionRepository,
  createDatabaseChannelCredentialRepository,
  DatabaseOmnichannelConversationRepository,
  DatabaseOmnichannelMessageRepository,
  createDatabaseOmnichannelConversationRepository,
  createDatabaseOmnichannelMessageRepository,
  createDatabaseSocialContactRepository,
  createDatabaseSocialMediaAccountRepository,
  createDatabaseWebhookEventRepository,
  type DatabaseAiChatSessionRepository,
  type DatabaseAiReplyJobRepository,
  type DatabaseAiReplySuggestionRepository,
  type DatabaseChannelCredentialRepository,
  type DatabaseSocialContactRepository,
  type DatabaseSocialMediaAccountRepository,
  type DatabaseWebhookEventRepository
} from "@hallederiz/database";
import { getAuthMode } from "./auth-mode";
import type { RequestContext } from "./request-context";
import { buildProviderFactoryConfigSync, createProvidersFromConfig } from "./omnichannel-provider-runtime";

export type OmnichannelPersistenceMode = "memory" | "postgres" | "unsupported";

export interface OmnichannelRuntimeResolution {
  conversationRepository: OmnichannelConversationRepository | null;
  messageRepository: OmnichannelMessageRepository | null;
  socialMediaAccountRepository: DatabaseSocialMediaAccountRepository | null;
  channelCredentialRepository: DatabaseChannelCredentialRepository | null;
  webhookEventRepository: DatabaseWebhookEventRepository | null;
  socialContactRepository: DatabaseSocialContactRepository | null;
  aiChatSessionRepository: DatabaseAiChatSessionRepository | null;
  aiReplySuggestionRepository: DatabaseAiReplySuggestionRepository | null;
  aiReplyJobRepository: DatabaseAiReplyJobRepository | null;
  providers: Map<string, ChannelProviderAdapter>;
  mode: OmnichannelPersistenceMode;
  reasons: string[];
}

let cachedPostgresConversations: OmnichannelConversationRepository | null = null;
let cachedPostgresMessages: OmnichannelMessageRepository | null = null;
let cachedPostgresUrl: string | null = null;
let cachedPostgresExtras: Omit<OmnichannelRuntimeResolution, "conversationRepository" | "messageRepository" | "providers" | "mode" | "reasons"> | null = null;
let cachedMemoryConversations: InMemoryOmnichannelConversationRepository | null = null;
let cachedMemoryMessages: InMemoryOmnichannelMessageRepository | null = null;
let cachedProviderMap: Map<string, ChannelProviderAdapter> | null = null;

function getPostgresUrl() {
  return process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
}

function resolveProviders(): Map<string, ChannelProviderAdapter> {
  if (!cachedProviderMap) {
    cachedProviderMap = createProvidersFromConfig(buildProviderFactoryConfigSync());
  }
  return cachedProviderMap;
}

function resolvePostgresRepositories(): OmnichannelRuntimeResolution {
  const postgresUrl = getPostgresUrl();
  if (!postgresUrl) {
    return {
      conversationRepository: null,
      messageRepository: null,
      socialMediaAccountRepository: null,
      channelCredentialRepository: null,
      webhookEventRepository: null,
      socialContactRepository: null,
      aiChatSessionRepository: null,
      aiReplySuggestionRepository: null,
      aiReplyJobRepository: null,
      providers: resolveProviders(),
      mode: "unsupported",
      reasons: ["omnichannel_postgres_url_missing"]
    };
  }

  if (!cachedPostgresConversations || !cachedPostgresMessages || cachedPostgresUrl !== postgresUrl) {
    const executor = createQueryExecutor({ mode: "postgres", postgresUrl });
    cachedPostgresConversations = new DatabaseOmnichannelConversationRepository({
      executor,
      persistenceMode: "postgres"
    });
    cachedPostgresMessages = new DatabaseOmnichannelMessageRepository({
      executor,
      persistenceMode: "postgres"
    });
    cachedPostgresExtras = {
      socialMediaAccountRepository: createDatabaseSocialMediaAccountRepository({ executor, persistenceMode: "postgres" }),
      channelCredentialRepository: createDatabaseChannelCredentialRepository({ executor, persistenceMode: "postgres" }),
      webhookEventRepository: createDatabaseWebhookEventRepository({ executor, persistenceMode: "postgres" }),
      socialContactRepository: createDatabaseSocialContactRepository({ executor, persistenceMode: "postgres" }),
      aiChatSessionRepository: createDatabaseAiChatSessionRepository({ executor, persistenceMode: "postgres" }),
      aiReplySuggestionRepository: createDatabaseAiReplySuggestionRepository({ executor, persistenceMode: "postgres" }),
      aiReplyJobRepository: createDatabaseAiReplyJobRepository({ executor, persistenceMode: "postgres" })
    };
    cachedPostgresUrl = postgresUrl;
  }

  return {
    conversationRepository: cachedPostgresConversations,
    messageRepository: cachedPostgresMessages,
    socialMediaAccountRepository: cachedPostgresExtras!.socialMediaAccountRepository,
    channelCredentialRepository: cachedPostgresExtras!.channelCredentialRepository,
    webhookEventRepository: cachedPostgresExtras!.webhookEventRepository,
    socialContactRepository: cachedPostgresExtras!.socialContactRepository,
    aiChatSessionRepository: cachedPostgresExtras!.aiChatSessionRepository,
    aiReplySuggestionRepository: cachedPostgresExtras!.aiReplySuggestionRepository,
    aiReplyJobRepository: cachedPostgresExtras!.aiReplyJobRepository,
    providers: resolveProviders(),
    mode: "postgres",
    reasons: []
  };
}

export function resolveOmnichannelRuntime(_context?: RequestContext): OmnichannelRuntimeResolution {
  const authMode = getAuthMode();
  const persistenceMode = _context?.persistenceMode ?? authMode.persistenceMode;

  if (persistenceMode === "postgres") {
    return resolvePostgresRepositories();
  }

  if (authMode.isProduction) {
    return {
      conversationRepository: null,
      messageRepository: null,
      socialMediaAccountRepository: null,
      channelCredentialRepository: null,
      webhookEventRepository: null,
      socialContactRepository: null,
      aiChatSessionRepository: null,
      aiReplySuggestionRepository: null,
      aiReplyJobRepository: null,
      providers: resolveProviders(),
      mode: "unsupported",
      reasons: ["omnichannel_memory_fallback_forbidden_in_production"]
    };
  }

  if (!cachedMemoryConversations) {
    cachedMemoryConversations = new InMemoryOmnichannelConversationRepository();
  }
  if (!cachedMemoryMessages) {
    cachedMemoryMessages = new InMemoryOmnichannelMessageRepository();
  }

  return {
    conversationRepository: cachedMemoryConversations,
    messageRepository: cachedMemoryMessages,
    socialMediaAccountRepository: null,
    channelCredentialRepository: null,
    webhookEventRepository: null,
    socialContactRepository: null,
    aiChatSessionRepository: null,
    aiReplySuggestionRepository: null,
    aiReplyJobRepository: null,
    providers: resolveProviders(),
    mode: "memory",
    reasons: []
  };
}

export function resetOmnichannelRuntimeForTests() {
  cachedPostgresConversations = null;
  cachedPostgresMessages = null;
  cachedPostgresUrl = null;
  cachedPostgresExtras = null;
  cachedMemoryConversations = null;
  cachedMemoryMessages = null;
  cachedProviderMap = null;
}
