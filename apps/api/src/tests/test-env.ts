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
