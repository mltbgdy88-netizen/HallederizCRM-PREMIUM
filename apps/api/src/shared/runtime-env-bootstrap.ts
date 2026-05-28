import { assertRuntimeEnv, normalizeNodeEnv, readRuntimeEnv } from "@hallederiz/config";

export function bootstrapRuntimeEnvValidation() {
  const nodeEnv = normalizeNodeEnv(process.env.NODE_ENV);
  if (nodeEnv === "test") {
    return { validated: false, skipped: true, reason: "test_environment" };
  }

  const env = readRuntimeEnv(process.env);
  assertRuntimeEnv(env, {
    isProduction: nodeEnv === "production",
    strictProduction: nodeEnv === "production"
  });

  return { validated: true, skipped: false, nodeEnv };
}
