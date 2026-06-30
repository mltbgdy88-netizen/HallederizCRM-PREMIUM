/** Platform approval rows that belong to the AI proposal / operator flow. */
export function isAiRelatedApprovalAction(actionKey: string): boolean {
  const key = actionKey.toLowerCase();
  return key.includes("ai") || key.startsWith("platform.ai");
}
