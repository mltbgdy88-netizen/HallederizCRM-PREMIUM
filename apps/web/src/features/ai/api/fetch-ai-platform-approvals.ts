import type { Approval } from "@hallederiz/types";
import { dataSourceConfig } from "../../../lib/data-source";
import { createApprovalClient, type ApprovalClientConfig } from "../../approvals/api/approval-client";
import { normalizeApproval } from "../../approvals/utils/inbox-helpers";
import { mapPlatformApprovalToInboxRecord } from "../../approvals/utils/map-platform-approval-to-inbox";
import { isAiRelatedApprovalAction } from "../utils/is-ai-related-approval";

/** Loads AI-related rows from the platform approval queue (live mode). */
export async function fetchAiPlatformApprovals(config: ApprovalClientConfig): Promise<Approval[]> {
  const client = createApprovalClient(config);
  const result = await client.listApprovals();
  if (!result.ok) {
    return [];
  }
  return (result.data.items ?? [])
    .map(normalizeApproval)
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .filter((item) => isAiRelatedApprovalAction(item.actionKey))
    .map((item) => mapPlatformApprovalToInboxRecord(item, dataSourceConfig.userId).raw);
}
