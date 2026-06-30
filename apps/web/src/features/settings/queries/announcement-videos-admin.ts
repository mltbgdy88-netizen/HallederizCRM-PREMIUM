import { sdk } from "../../../lib/data-source";
import type { DashboardAnnouncementVideo } from "../../dashboard/data/dashboard-announcement-videos";

export type AnnouncementVideoAdminRecord = DashboardAnnouncementVideo & {
  published: boolean;
};

export async function listAnnouncementVideosAdmin(): Promise<AnnouncementVideoAdminRecord[]> {
  const response = await sdk.platform.listAnnouncementVideos();
  return (response.items ?? []) as AnnouncementVideoAdminRecord[];
}

export async function createAnnouncementVideoAdmin(
  input: Omit<AnnouncementVideoAdminRecord, "id" | "publishedAt"> & { publishedAt?: string }
): Promise<AnnouncementVideoAdminRecord> {
  const response = await sdk.platform.createAnnouncementVideo(input);
  return response.item as AnnouncementVideoAdminRecord;
}

export async function updateAnnouncementVideoAdmin(
  id: string,
  patch: Partial<AnnouncementVideoAdminRecord>
): Promise<AnnouncementVideoAdminRecord> {
  const response = await sdk.platform.updateAnnouncementVideo(id, patch);
  return response.item as AnnouncementVideoAdminRecord;
}

export async function deleteAnnouncementVideoAdmin(id: string): Promise<void> {
  await sdk.platform.deleteAnnouncementVideo(id);
}

export async function listDashboardAnnouncementVideosLive(): Promise<DashboardAnnouncementVideo[]> {
  const response = await sdk.dashboard.announcementVideos();
  return (response.items ?? []) as DashboardAnnouncementVideo[];
}
