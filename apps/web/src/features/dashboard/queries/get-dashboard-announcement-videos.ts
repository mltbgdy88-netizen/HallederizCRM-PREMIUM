import { dataSourceConfig, sdk } from "../../../lib/data-source";
import {
  DASHBOARD_ANNOUNCEMENT_VIDEOS_DEMO,
  type DashboardAnnouncementVideo
} from "../data/dashboard-announcement-videos";

export type DashboardAnnouncementFeed = {
  items: DashboardAnnouncementVideo[];
  source: "live" | "demo";
};

/**
 * Platform operatör konsolundan hedeflenen tanıtım/duyuru videoları (kiracı salt okunur).
 */
export async function getDashboardAnnouncementVideos(): Promise<DashboardAnnouncementFeed> {
  try {
    const response = await sdk.dashboard.announcementVideos();
    if (Array.isArray(response.items) && response.items.length > 0) {
      return { items: response.items as DashboardAnnouncementVideo[], source: "live" };
    }
    if (!dataSourceConfig.useDemoData) {
      return { items: [], source: "live" };
    }
  } catch {
    if (!dataSourceConfig.useDemoData) {
      return { items: [], source: "live" };
    }
  }

  return { items: DASHBOARD_ANNOUNCEMENT_VIDEOS_DEMO, source: "demo" };
}
