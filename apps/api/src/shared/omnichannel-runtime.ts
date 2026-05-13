import {
  InMemoryOmnichannelConversationRepository,
  InMemoryOmnichannelMessageRepository,
  getDefaultProviderAdapters,
  type ChannelProviderAdapter,
  type OmnichannelConversationRepository,
  type OmnichannelMessageRepository
} from "@hallederiz/domain";
import {
  createQueryExecutor,
  DatabaseOmnichannelConversationRepository,
  DatabaseOmnichannelMessageRepository
} from "@hallederiz/database";
import { getAuthMode } from "./auth-mode";
import type { RequestContext } from "./request-context";

export type OmnichannelPersistenceMode = "memory" | "postgres" | "unsupported";

export interface OmnichannelRuntimeResolution {
  conversationRepository: OmnichannelConversationRepository | null;
  messageRepository: OmnichannelMessageRepository | null;
  providers: Map<string, ChannelProviderAdapter>;
  mode: OmnichannelPersistenceMode;
  reasons: string[];
}

let cachedPostgresConversations: OmnichannelConversationRepository | null = null;
let cachedPostgresMessages: OmnichannelMessageRepository | null = null;
let cachedPostgresUrl: string | null = null;
let cachedMemoryConversations: InMemoryOmnichannelConversationRepository | null = null;
let cachedMemoryMessages: InMemoryOmnichannelMessageRepository | null = null;

function getPostgresUrl() {
  return process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
}

function resolvePostgresRepositories(): OmnichannelRuntimeResolution {
  const postgresUrl = getPostgresUrl();
  if (!postgresUrl) {
    return {
      conversationRepository: null,
      messageRepository: null,
      providers: getDefaultProviderAdapters(),
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
    cachedPostgresUrl = postgresUrl;
  }

  return {
    conversationRepository: cachedPostgresConversations,
    messageRepository: cachedPostgresMessages,
    providers: getDefaultProviderAdapters(),
    mode: "postgres",
    reasons: []
  };
}

export function resolveOmnichannelRuntime(context?: RequestContext): OmnichannelRuntimeResolution {
  const authMode = getAuthMode();
  const persistenceMode = context?.persistenceMode ?? authMode.persistenceMode;

  if (persistenceMode === "postgres") {
    return resolvePostgresRepositories();
  }

  if (authMode.isProduction) {
    return {
      conversationRepository: null,
      messageRepository: null,
      providers: getDefaultProviderAdapters(),
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
    providers: getDefaultProviderAdapters(),
    mode: "memory",
    reasons: []
  };
}

export function resetOmnichannelRuntimeForTests() {
  cachedPostgresConversations = null;
  cachedPostgresMessages = null;
  cachedPostgresUrl = null;
  cachedMemoryConversations = null;
  cachedMemoryMessages = null;
}
