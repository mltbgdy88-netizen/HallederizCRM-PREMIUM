import type { OfferFollowUp } from "@hallederiz/types";

export interface OfferFollowUpSummary {
  latestNote: string;
  latestChannel: OfferFollowUp["contactChannel"] | null;
  latestState: OfferFollowUp["responseState"] | null;
  nextPlannedAt: string | null;
  completedCount: number;
}

export function buildOfferFollowUpSummary(followUps: OfferFollowUp[]): OfferFollowUpSummary {
  const sorted = [...followUps].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const latest = sorted[0];
  const nextPlanned = followUps
    .filter((followUp) => !followUp.completedAt)
    .sort((a, b) => a.plannedAt.localeCompare(b.plannedAt))[0];

  return {
    latestNote: latest?.note ?? "Follow-up kaydi yok.",
    latestChannel: latest?.contactChannel ?? null,
    latestState: latest?.responseState ?? null,
    nextPlannedAt: nextPlanned?.plannedAt ?? null,
    completedCount: followUps.filter((followUp) => Boolean(followUp.completedAt)).length
  };
}
