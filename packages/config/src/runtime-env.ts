export type RuntimeEnvironment = Record<string, string | undefined>;

export interface RuntimeEnvValidationIssue {
  code: string;
  message: string;
  field?: string;
}

export interface RuntimeEnvValidationResult {
  ok: boolean;
  issues: RuntimeEnvValidationIssue[];
}

export interface RuntimeEnvOptions {
  isProduction?: boolean;
  strictProduction?: boolean;
}

export function parseBooleanEnv(value: string | undefined, defaultValue = false): boolean {
  if (value === undefined || value === "") return defaultValue;
  const normalized = value.trim().toLowerCase();
  return normalized === "true" || normalized === "1" || normalized === "yes";
}

export function normalizeNodeEnv(value: string | undefined): string {
  const normalized = (value ?? "development").trim().toLowerCase();
  if (normalized === "production" || normalized === "test" || normalized === "development") {
    return normalized;
  }
  return "development";
}

export function readRuntimeEnv(source: NodeJS.ProcessEnv = process.env): RuntimeEnvironment {
  const env: RuntimeEnvironment = {};
  for (const [key, value] of Object.entries(source)) {
    env[key] = value;
  }
  return env;
}

function issue(code: string, message: string, field?: string): RuntimeEnvValidationIssue {
  return { code, message, field };
}

function isTruthyDemoFlag(env: RuntimeEnvironment, key: string): boolean {
  return parseBooleanEnv(env[key], false);
}

function requiresWhatsAppLive(env: RuntimeEnvironment): boolean {
  const provider = (env.WHATSAPP_PROVIDER ?? "mock").trim().toLowerCase();
  return provider === "live" || provider === "meta" || provider === "graph";
}

function requiresMetaLive(env: RuntimeEnvironment): boolean {
  const provider = (env.OMNICHANNEL_PROVIDER ?? env.META_PROVIDER ?? "").trim().toLowerCase();
  return provider === "live" || provider === "meta" || provider === "facebook" || provider === "instagram";
}

export function validateRuntimeEnv(env: RuntimeEnvironment, options: RuntimeEnvOptions = {}): RuntimeEnvValidationResult {
  const nodeEnv = normalizeNodeEnv(env.NODE_ENV);
  const isProduction = options.isProduction ?? nodeEnv === "production";
  const strictProduction = options.strictProduction ?? isProduction;
  const issues: RuntimeEnvValidationIssue[] = [];

  if (strictProduction) {
    if (isTruthyDemoFlag(env, "DEMO_AUTH_ENABLED")) {
      issues.push(issue("demo_auth_forbidden", "Production ortamında DEMO_AUTH_ENABLED açık olamaz.", "DEMO_AUTH_ENABLED"));
    }
    if (isTruthyDemoFlag(env, "NEXT_PUBLIC_ENABLE_DEMO_AUTH")) {
      issues.push(
        issue("demo_auth_public_forbidden", "Production ortamında NEXT_PUBLIC_ENABLE_DEMO_AUTH açık olamaz.", "NEXT_PUBLIC_ENABLE_DEMO_AUTH")
      );
    }
    if (isTruthyDemoFlag(env, "LOCAL_PILOT_AUTH_ENABLED")) {
      issues.push(
        issue("local_pilot_auth_forbidden", "Production ortamında LOCAL_PILOT_AUTH_ENABLED açık olamaz.", "LOCAL_PILOT_AUTH_ENABLED")
      );
    }
    if (isTruthyDemoFlag(env, "NEXT_PUBLIC_USE_DEMO_DATA")) {
      issues.push(
        issue("demo_data_forbidden", "Production ortamında NEXT_PUBLIC_USE_DEMO_DATA açık olamaz.", "NEXT_PUBLIC_USE_DEMO_DATA")
      );
    }
    if (isTruthyDemoFlag(env, "ALLOW_DEMO_FALLBACK")) {
      issues.push(issue("demo_fallback_forbidden", "Production ortamında ALLOW_DEMO_FALLBACK açık olamaz.", "ALLOW_DEMO_FALLBACK"));
    }
    if (!(env.TENANT_ENCRYPTION_KEY ?? "").trim()) {
      issues.push(issue("tenant_encryption_required", "Production ortamında TENANT_ENCRYPTION_KEY zorunludur.", "TENANT_ENCRYPTION_KEY"));
    }
  }

  const persistenceMode = (env.PERSISTENCE_MODE ?? "demo").trim().toLowerCase();
  if (strictProduction && persistenceMode === "demo") {
    issues.push(issue("persistence_demo_forbidden", "Production ortamında PERSISTENCE_MODE=demo kullanılamaz.", "PERSISTENCE_MODE"));
  }
  if (persistenceMode === "postgres") {
    const postgresUrl = (env.POSTGRES_URL ?? env.DATABASE_URL ?? "").trim();
    if (!postgresUrl) {
      issues.push(issue("postgres_url_missing", "PERSISTENCE_MODE=postgres için POSTGRES_URL veya DATABASE_URL zorunludur.", "POSTGRES_URL"));
    }
  }

  if (requiresWhatsAppLive(env)) {
    if (!(env.WHATSAPP_WEBHOOK_VERIFY_TOKEN ?? "").trim()) {
      issues.push(issue("whatsapp_verify_token_missing", "WHATSAPP_PROVIDER=live için WHATSAPP_WEBHOOK_VERIFY_TOKEN zorunludur.", "WHATSAPP_WEBHOOK_VERIFY_TOKEN"));
    }
    if (!(env.WHATSAPP_WEBHOOK_APP_SECRET ?? "").trim()) {
      issues.push(issue("whatsapp_webhook_secret_missing", "WHATSAPP_PROVIDER=live için WHATSAPP_WEBHOOK_APP_SECRET zorunludur.", "WHATSAPP_WEBHOOK_APP_SECRET"));
    }
    if (!(env.WHATSAPP_API_BASE_URL ?? env.WHATSAPP_PROVIDER_URL ?? "").trim()) {
      issues.push(issue("whatsapp_api_base_missing", "WHATSAPP_PROVIDER=live için WHATSAPP_API_BASE_URL zorunludur.", "WHATSAPP_API_BASE_URL"));
    }
    if (!(env.WHATSAPP_API_TOKEN ?? "").trim()) {
      issues.push(issue("whatsapp_api_token_missing", "WHATSAPP_PROVIDER=live için WHATSAPP_API_TOKEN zorunludur.", "WHATSAPP_API_TOKEN"));
    }
    if (!(env.WHATSAPP_PHONE_NUMBER_ID ?? "").trim()) {
      issues.push(issue("whatsapp_phone_id_missing", "WHATSAPP_PROVIDER=live için WHATSAPP_PHONE_NUMBER_ID zorunludur.", "WHATSAPP_PHONE_NUMBER_ID"));
    }
  }

  if (requiresMetaLive(env) && !(env.META_WEBHOOK_APP_SECRET ?? "").trim()) {
    issues.push(issue("meta_webhook_secret_missing", "Meta/omnichannel live için META_WEBHOOK_APP_SECRET zorunludur.", "META_WEBHOOK_APP_SECRET"));
  }

  return { ok: issues.length === 0, issues };
}

export function assertRuntimeEnv(env: RuntimeEnvironment, options: RuntimeEnvOptions = {}): void {
  const result = validateRuntimeEnv(env, options);
  if (result.ok) return;
  const summary = result.issues.map((item) => `${item.code}:${item.field ?? "env"}`).join(", ");
  throw new Error(`runtime_env_validation_failed:${summary}`);
}
