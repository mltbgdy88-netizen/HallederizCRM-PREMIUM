export type AnnouncementVideoKind = "promo" | "announcement" | "training";

export type AnnouncementVideoRecord = {
  id: string;
  tenantId: string;
  title: string;
  subtitle?: string;
  videoUrl: string;
  posterUrl?: string;
  durationLabel?: string;
  ctaLabel?: string;
  ctaHref?: string;
  publishedAt: string;
  kind: AnnouncementVideoKind;
  published: boolean;
};

export type AnnouncementVideoInput = Omit<AnnouncementVideoRecord, "id" | "tenantId" | "publishedAt"> & {
  id?: string;
  publishedAt?: string;
};

const store = new Map<string, AnnouncementVideoRecord[]>();

function seedForTenant(tenantId: string): AnnouncementVideoRecord[] {
  const now = new Date().toISOString();
  return [
    {
      id: `ann_${tenantId}_1`,
      tenantId,
      title: "HallederizCRM Premium Tanıtım",
      subtitle: "Operasyon masası, onay akışı ve hızlı işlem özeti",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
      durationLabel: "0:15",
      publishedAt: now,
      kind: "promo",
      published: true,
      ctaLabel: "Hızlı İşlem",
      ctaHref: "/hizli-islem/satis-masasi"
    },
    {
      id: `ann_${tenantId}_2`,
      tenantId,
      title: "Haziran Duyurusu — Onay ve Tahsilat",
      subtitle: "Kritik işlemlerde onay zorunluluğu hatırlatması",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      durationLabel: "0:15",
      publishedAt: now,
      kind: "announcement",
      published: true
    }
  ];
}

function ensureTenant(tenantId: string): AnnouncementVideoRecord[] {
  if (!store.has(tenantId)) {
    store.set(tenantId, seedForTenant(tenantId));
  }
  return store.get(tenantId)!;
}

export function listPublishedAnnouncementVideos(tenantId: string): AnnouncementVideoRecord[] {
  return ensureTenant(tenantId)
    .filter((item) => item.published && item.videoUrl.trim().length > 0)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

export function listAllAnnouncementVideos(tenantId: string): AnnouncementVideoRecord[] {
  return [...ensureTenant(tenantId)].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

export function createAnnouncementVideo(tenantId: string, input: AnnouncementVideoInput): AnnouncementVideoRecord {
  const items = ensureTenant(tenantId);
  const record: AnnouncementVideoRecord = {
    id: input.id ?? `ann_${tenantId}_${Date.now()}`,
    tenantId,
    title: input.title.trim(),
    subtitle: input.subtitle?.trim() || undefined,
    videoUrl: input.videoUrl.trim(),
    posterUrl: input.posterUrl?.trim() || undefined,
    durationLabel: input.durationLabel?.trim() || undefined,
    ctaLabel: input.ctaLabel?.trim() || undefined,
    ctaHref: input.ctaHref?.trim() || undefined,
    publishedAt: input.publishedAt ?? new Date().toISOString(),
    kind: input.kind,
    published: input.published
  };
  items.unshift(record);
  return record;
}

export function updateAnnouncementVideo(
  tenantId: string,
  id: string,
  patch: Partial<AnnouncementVideoInput>
): AnnouncementVideoRecord | null {
  const items = ensureTenant(tenantId);
  const index = items.findIndex((item) => item.id === id);
  if (index < 0) return null;
  const current = items[index]!;
  const next: AnnouncementVideoRecord = {
    ...current,
    ...patch,
    title: patch.title !== undefined ? patch.title.trim() : current.title,
    subtitle: patch.subtitle !== undefined ? patch.subtitle?.trim() || undefined : current.subtitle,
    videoUrl: patch.videoUrl !== undefined ? patch.videoUrl.trim() : current.videoUrl,
    posterUrl: patch.posterUrl !== undefined ? patch.posterUrl?.trim() || undefined : current.posterUrl,
    durationLabel: patch.durationLabel !== undefined ? patch.durationLabel?.trim() || undefined : current.durationLabel,
    ctaLabel: patch.ctaLabel !== undefined ? patch.ctaLabel?.trim() || undefined : current.ctaLabel,
    ctaHref: patch.ctaHref !== undefined ? patch.ctaHref?.trim() || undefined : current.ctaHref,
    publishedAt: patch.publishedAt ?? current.publishedAt,
    kind: patch.kind ?? current.kind,
    published: patch.published ?? current.published
  };
  items[index] = next;
  return next;
}

export function deleteAnnouncementVideo(tenantId: string, id: string): boolean {
  const items = ensureTenant(tenantId);
  const index = items.findIndex((item) => item.id === id);
  if (index < 0) return false;
  items.splice(index, 1);
  return true;
}

export function toPublicVideo(record: AnnouncementVideoRecord) {
  return {
    id: record.id,
    title: record.title,
    subtitle: record.subtitle,
    videoUrl: record.videoUrl,
    posterUrl: record.posterUrl,
    durationLabel: record.durationLabel,
    ctaLabel: record.ctaLabel,
    ctaHref: record.ctaHref,
    publishedAt: record.publishedAt,
    kind: record.kind
  };
}
