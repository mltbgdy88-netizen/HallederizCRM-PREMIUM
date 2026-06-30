import { sdk } from "../../../lib/data-source";
import type {
  DashboardAnnouncementVideo,
  DashboardAnnouncementVideoKind
} from "../../dashboard/data/dashboard-announcement-videos";

export type AnnouncementVideoTargetMode = "all" | "plan" | "tenants";

export type OperatorAnnouncementVideoRecord = DashboardAnnouncementVideo & {
  published: boolean;
  targetMode: AnnouncementVideoTargetMode;
  targetPlanCodes: string[];
  targetTenantSlugs: string[];
};

export type OperatorTenantSummary = {
  id: string;
  slug: string;
  name: string;
  status: string;
  planCode: string;
  modules: string[];
};

export async function listOperatorTenants(): Promise<OperatorTenantSummary[]> {
  const response = await sdk.operator.listTenants();
  return (response.items ?? []) as OperatorTenantSummary[];
}

export async function listOperatorAnnouncementVideos(): Promise<OperatorAnnouncementVideoRecord[]> {
  const response = await sdk.operator.listAnnouncementVideos();
  return (response.items ?? []) as OperatorAnnouncementVideoRecord[];
}

export async function createOperatorAnnouncementVideo(
  input: Omit<OperatorAnnouncementVideoRecord, "id" | "publishedAt"> & { publishedAt?: string }
): Promise<OperatorAnnouncementVideoRecord> {
  const response = await sdk.operator.createAnnouncementVideo(input);
  return response.item as OperatorAnnouncementVideoRecord;
}

export async function updateOperatorAnnouncementVideo(
  id: string,
  patch: Partial<OperatorAnnouncementVideoRecord>
): Promise<OperatorAnnouncementVideoRecord> {
  const response = await sdk.operator.updateAnnouncementVideo(id, patch);
  return response.item as OperatorAnnouncementVideoRecord;
}

export async function deleteOperatorAnnouncementVideo(id: string): Promise<void> {
  await sdk.operator.deleteAnnouncementVideo(id);
}

export type { DashboardAnnouncementVideoKind };
