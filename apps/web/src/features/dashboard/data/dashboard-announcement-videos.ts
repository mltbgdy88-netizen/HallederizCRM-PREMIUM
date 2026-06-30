export type DashboardAnnouncementVideoKind = "promo" | "announcement" | "training";

export type DashboardAnnouncementVideo = {
  id: string;
  title: string;
  subtitle?: string;
  videoUrl: string;
  posterUrl?: string;
  durationLabel?: string;
  ctaLabel?: string;
  ctaHref?: string;
  publishedAt: string;
  kind: DashboardAnnouncementVideoKind;
};

/** Admin panelden yayınlanacak videolar için demo katalog (canlı API yokken). */
export const DASHBOARD_ANNOUNCEMENT_VIDEOS_DEMO: DashboardAnnouncementVideo[] = [
  {
    id: "ann-demo-1",
    title: "HallederizCRM Premium Tanıtım",
    subtitle: "Operasyon masası, onay akışı ve hızlı işlem özeti",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    durationLabel: "0:15",
    publishedAt: "2026-06-01T09:00:00.000Z",
    kind: "promo",
    ctaLabel: "Hızlı İşlem",
    ctaHref: "/hizli-islem/satis-masasi"
  },
  {
    id: "ann-demo-2",
    title: "Haziran Duyurusu — Onay ve Tahsilat",
    subtitle: "Kritik işlemlerde onay zorunluluğu hatırlatması",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    durationLabel: "0:15",
    publishedAt: "2026-06-15T08:30:00.000Z",
    kind: "announcement"
  }
];
