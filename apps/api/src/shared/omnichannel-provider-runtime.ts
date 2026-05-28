import {
  createProviderAdapters,
  type ProviderAccountBinding,
  type ProviderFactoryConfig
} from "@hallederiz/domain";
import {
  createQueryExecutor,
  createDatabaseChannelCredentialRepository,
  createDatabaseSocialMediaAccountRepository,
  type DatabaseSocialMediaAccountRepository
} from "@hallederiz/database";
import { getAuthMode } from "./auth-mode";

let cachedAccounts: DatabaseSocialMediaAccountRepository | null = null;
let cachedAccountsUrl: string | null = null;

function getPostgresUrl() {
  return process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
}

async function loadAccountBindings(): Promise<ProviderAccountBinding[]> {
  const postgresUrl = getPostgresUrl();
  if (!postgresUrl) return [];

  if (!cachedAccounts || cachedAccountsUrl !== postgresUrl) {
    const executor = createQueryExecutor({ mode: "postgres", postgresUrl });
    cachedAccounts = createDatabaseSocialMediaAccountRepository({ executor, persistenceMode: "postgres" });
    cachedAccountsUrl = postgresUrl;
  }

  // Foundation: bindings loaded per-tenant on demand in webhook routing; factory uses env flags.
  return [];
}

export async function buildProviderFactoryConfig(): Promise<ProviderFactoryConfig> {
  const authMode = getAuthMode();
  const accounts = await loadAccountBindings();

  return {
    isProduction: authMode.isProduction,
    allowMock: !authMode.isProduction && process.env.OMNICHANNEL_ALLOW_MOCK_PROVIDERS === "true",
    metaAppSecret: process.env.META_WEBHOOK_APP_SECRET,
    whatsappAccessTokenRef: process.env.WHATSAPP_ACCESS_TOKEN_REF,
    whatsappPhoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
    accounts
  };
}

export function buildProviderFactoryConfigSync(): ProviderFactoryConfig {
  const authMode = getAuthMode();
  return {
    isProduction: authMode.isProduction,
    allowMock: !authMode.isProduction && process.env.OMNICHANNEL_ALLOW_MOCK_PROVIDERS === "true",
    metaAppSecret: process.env.META_WEBHOOK_APP_SECRET,
    whatsappAccessTokenRef: process.env.WHATSAPP_ACCESS_TOKEN_REF,
    whatsappPhoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
    accounts: []
  };
}

export function createProvidersFromConfig(config: ProviderFactoryConfig) {
  return createProviderAdapters(config);
}

export function resetOmnichannelProviderRuntimeForTests() {
  cachedAccounts = null;
  cachedAccountsUrl = null;
}
