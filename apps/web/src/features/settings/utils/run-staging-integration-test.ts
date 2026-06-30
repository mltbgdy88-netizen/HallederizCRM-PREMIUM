import {
  runAiTestChatApi,
  runAiTestSttApi,
  runAiTestTtsApi,
  runErpTestApi,
  runFactoryTestSyncApi,
  runLocalAgentPrintDryRunApi,
  runLocalAgentSaveDryRunApi,
  runWhatsAppTestSendApi
} from "../../../services/api/health.service";

/** Dry-run / ping testleri — staging hazırlık kontrolü için ortak çağrı zinciri. */
export async function runStagingIntegrationServiceTest(service: string): Promise<void> {
  if (service === "ai") {
    await runAiTestChatApi();
    await runAiTestSttApi();
    await runAiTestTtsApi();
    return;
  }
  if (service === "whatsapp") {
    await runWhatsAppTestSendApi();
    return;
  }
  if (service === "erp") {
    await runErpTestApi();
    return;
  }
  if (service === "factory") {
    await runFactoryTestSyncApi();
    return;
  }
  if (service === "local-agent") {
    await runLocalAgentSaveDryRunApi();
    await runLocalAgentPrintDryRunApi();
    return;
  }
  throw new Error(`Bilinmeyen servis: ${service}`);
}
