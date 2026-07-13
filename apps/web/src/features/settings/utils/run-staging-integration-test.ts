async function loadHealthServiceApi() {
  return import("../../../services/api/health.service");
}

/** Dry-run / ping testleri — staging hazırlık kontrolü için ortak çağrı zinciri. */
export async function runStagingIntegrationServiceTest(service: string): Promise<void> {
  if (service === "ai") {
    const { runAiTestChatApi, runAiTestSttApi, runAiTestTtsApi } = await loadHealthServiceApi();
    await runAiTestChatApi();
    await runAiTestSttApi();
    await runAiTestTtsApi();
    return;
  }
  if (service === "whatsapp") {
    const { runWhatsAppTestSendApi } = await loadHealthServiceApi();
    await runWhatsAppTestSendApi();
    return;
  }
  if (service === "erp") {
    const { runErpTestApi } = await loadHealthServiceApi();
    await runErpTestApi();
    return;
  }
  if (service === "factory") {
    const { runFactoryTestSyncApi } = await loadHealthServiceApi();
    await runFactoryTestSyncApi();
    return;
  }
  if (service === "local-agent") {
    const { runLocalAgentPrintDryRunApi, runLocalAgentSaveDryRunApi } = await loadHealthServiceApi();
    await runLocalAgentSaveDryRunApi();
    await runLocalAgentPrintDryRunApi();
    return;
  }
  throw new Error(`Bilinmeyen servis: ${service}`);
}
