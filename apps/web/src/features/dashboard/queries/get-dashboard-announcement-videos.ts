import { sdk } from "../../../lib/data-source";
import {
  DASHBOARD_ANNOUNCEMENT_VIDEOS_DEMO,
  type DashboardAnnouncementVideo
} from "../data/dashboard-announcement-videos";

export type DashboardAnnouncementFeed = {
  items: DashboardAnnouncementVideo[];
  source: "live" | "demo";
};

/**
 * Admin panelden tenant kapsamında yayınlanan tanıtım/duyuru videoları.
 */
export async function getDashboardAnnouncementVideos(): Promise<DashboardAnnouncementFeed> {
  try {
    const response = await sdk.dashboard.announcementVideos();
    if (Array.isArray(response.items) && response.items.length > 0) {
      return { items: response.items as DashboardAnnouncementVideo[], source: "live" };
    }
  } catch {
    // API kapalı — demo fallback
  }

  return { items: DASHBOARD_ANNOUNCEMENT_VIDEOS_DEMO, source: "demo" };
}
