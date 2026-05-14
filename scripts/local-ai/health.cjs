#!/usr/bin/env node
const localAiBaseUrl = (process.env.LOCAL_AI_SERVICE_URL || "http://127.0.0.1:8008").replace(/\/+$/, "");
const ollamaBaseUrl = (process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434").replace(/\/+$/, "");
const degradedOk = process.argv.includes("--degraded-ok");
const timeoutMs = Number(process.env.LOCAL_AI_TIMEOUT_MS || 30000);

async function fetchJson(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { accept: "application/json" },
      signal: controller.signal
    });
    const text = await response.text();
    let json = null;
    if (text) {
      try {
        json = JSON.parse(text);
      } catch {
        json = null;
      }
    }
    return { ok: response.ok, status: response.status, text, json };
  } finally {
    clearTimeout(timeout);
  }
}

async function main() {
  const result = {
    ok: false,
    status: "degraded",
    reason: "local_ai_degraded",
    localAiService: {
      baseUrl: localAiBaseUrl,
      ok: false,
      status: "down",
      reason: "unreachable"
    },
    ollama: {
      baseUrl: ollamaBaseUrl,
      ok: false,
      status: "down",
      reason: "unreachable",
      models: []
    }
  };

  try {
    const [localHealth, ollamaTags] = await Promise.allSettled([
      fetchJson(`${localAiBaseUrl}/health`),
      fetchJson(`${ollamaBaseUrl}/api/tags`)
    ]);

    if (localHealth.status === "fulfilled") {
      const payload = localHealth.value;
      if (payload.ok) {
        result.localAiService = {
          baseUrl: localAiBaseUrl,
          ok: true,
          status: "healthy",
          reason: "ok",
          detail: payload.json ?? payload.text
        };
      } else {
        result.localAiService = {
          baseUrl: localAiBaseUrl,
          ok: false,
          status: "degraded",
          reason: `http_${payload.status}`,
          detail: payload.text || undefined
        };
      }
    } else {
      result.localAiService = {
        baseUrl: localAiBaseUrl,
        ok: false,
        status: "degraded",
        reason: localHealth.reason instanceof Error ? localHealth.reason.message : String(localHealth.reason)
      };
    }

    if (ollamaTags.status === "fulfilled") {
      const payload = ollamaTags.value;
      if (payload.ok) {
        const models = Array.isArray(payload.json?.models)
          ? payload.json.models.map((model) => model?.name).filter((name) => typeof name === "string")
          : [];
        result.ollama = {
          baseUrl: ollamaBaseUrl,
          ok: true,
          status: "healthy",
          reason: "ok",
          models
        };
      } else {
        result.ollama = {
          baseUrl: ollamaBaseUrl,
          ok: false,
          status: "degraded",
          reason: `http_${payload.status}`,
          models: []
        };
      }
    } else {
      result.ollama = {
        baseUrl: ollamaBaseUrl,
        ok: false,
        status: "degraded",
        reason: ollamaTags.reason instanceof Error ? ollamaTags.reason.message : String(ollamaTags.reason),
        models: []
      };
    }

    if (result.localAiService.ok && result.ollama.ok) {
      result.ok = true;
      result.status = "healthy";
      result.reason = "local_ai_service_and_ollama_ready";
    } else if (!result.localAiService.ok && result.ollama.ok) {
      result.ok = false;
      result.status = "degraded";
      result.reason = "ollama_available_service_missing";
    } else if (result.localAiService.ok && !result.ollama.ok) {
      result.ok = false;
      result.status = "degraded";
      result.reason = "local_ai_service_up_ollama_unavailable";
    } else {
      result.ok = false;
      result.status = "degraded";
      result.reason = "local_ai_service_and_ollama_unavailable";
    }

    console.log(JSON.stringify(result, null, 2));
    process.exitCode = result.ok || degradedOk ? 0 : 1;
  } catch (error) {
    console.log(
      JSON.stringify(
        {
          ...result,
          ok: false,
          status: "degraded",
          reason: error instanceof Error ? error.message : String(error)
        },
        null,
        2
      )
    );
    process.exitCode = degradedOk ? 0 : 1;
  }
}

main();
