export async function withEnv(env: Record<string, string | undefined>, run: () => Promise<void> | void) {
  const snapshot: Record<string, string | undefined> = {};
  for (const key of Object.keys(env)) {
    snapshot[key] = process.env[key];
    const value = env[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }

  try {
    await run();
  } finally {
    for (const key of Object.keys(env)) {
      const value = snapshot[key];
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

export function withDemoAuth(run: () => Promise<void> | void) {
  return withEnv(
    {
      DEMO_AUTH_ENABLED: "true",
      NODE_ENV: "development",
      PERSISTENCE_MODE: "demo"
    },
    run
  );
}

export function hasPostgresTestHarness(): boolean {
  return Boolean(process.env.DATABASE_URL ?? process.env.POSTGRES_URL);
}

export function withPostgresAuth(run: () => Promise<void> | void) {
  const postgresUrl = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
  return withEnv(
    {
      DEMO_AUTH_ENABLED: "false",
      NEXT_PUBLIC_ENABLE_DEMO_AUTH: "false",
      ALLOW_DEMO_FALLBACK: "false",
      NODE_ENV: "test",
      PERSISTENCE_MODE: "postgres",
      POSTGRES_URL: postgresUrl,
      DATABASE_URL: postgresUrl,
      AUTH_SESSION_SECRET: process.env.AUTH_SESSION_SECRET ?? "test-session-secret-32chars-minimum"
    },
    run
  );
}
