export type AnnouncementVideoKind = "promo" | "announcement" | "training";

export type AnnouncementVideoTargetMode = "all" | "plan" | "tenants";

export type PlatformAnnouncementVideoRecord = {
  id: string;
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
  targetMode: AnnouncementVideoTargetMode;
  targetPlanCodes: string[];
  targetTenantSlugs: string[];
};

export type PlatformAnnouncementVideoInput = Omit<
  PlatformAnnouncementVideoRecord,
  "id" | "publishedAt" | "targetPlanCodes" | "targetTenantSlugs"
> & {
  id?: string;
  publishedAt?: string;
  targetPlanCodes?: string[];
  targetTenantSlugs?: string[];
};

export type TenantAnnouncementContext = {
  tenantId: string;
  tenantSlug: string;
  planCode?: string;
};

const store: PlatformAnnouncementVideoRecord[] = seedPlatformVideos();

function seedPlatformVideos(): PlatformAnnouncementVideoRecord[] {
  const now = new Date().toISOString();
  return [
    {
      id: "ann_platform_1",
      title: "HallederizCRM Premium Tanıtım",
      subtitle: "Operasyon masası, onay akışı ve hızlı işlem özeti",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
      durationLabel: "0:15",
      publishedAt: now,
      kind: "promo",
      published: true,
      targetMode: "all",
      targetPlanCodes: [],
      targetTenantSlugs: [],
      ctaLabel: "Hızlı İşlem",
      ctaHref: "/hizli-islem/satis-masasi"
    },
    {
      id: "ann_platform_2",
      title: "Haziran Duyurusu — Onay ve Tahsilat",
      subtitle: "Kritik işlemlerde onay zorunluluğu hatırlatması",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      durationLabel: "0:15",
      publishedAt: now,
      kind: "announcement",
      published: true,
      targetMode: "all",
      targetPlanCodes: [],
      targetTenantSlugs: []
    }
  ];
}

function normalizeSlugList(values: string[] | undefined): string[] {
  return (values ?? [])
    .map((value) => value.trim().toLowerCase())
    .filter((value) => value.length > 0);
}

function normalizePlanList(values: string[] | undefined): string[] {
  return (values ?? [])
    .map((value) => value.trim().toLowerCase())
    .filter((value) => value.length > 0);
}

function matchesTenantTarget(record: PlatformAnnouncementVideoRecord, context: TenantAnnouncementContext): boolean {
  if (record.targetMode === "all") {
    return true;
  }

  if (record.targetMode === "tenants") {
    const slug = context.tenantSlug.trim().toLowerCase();
    return record.targetTenantSlugs.includes(slug);
  }

  const planCode = (context.planCode ?? "core").trim().toLowerCase();
  return record.targetPlanCodes.includes(planCode);
}

export function listPublishedAnnouncementVideosForTenant(
  context: TenantAnnouncementContext
): PlatformAnnouncementVideoRecord[] {
  return store
    .filter((item) => item.published && item.videoUrl.trim().length > 0 && matchesTenantTarget(item, context))
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

export function listAllPlatformAnnouncementVideos(): PlatformAnnouncementVideoRecord[] {
  return [...store].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

export function createPlatformAnnouncementVideo(input: PlatformAnnouncementVideoInput): PlatformAnnouncementVideoRecord {
  const record: PlatformAnnouncementVideoRecord = {
    id: input.id ?? `ann_platform_${Date.now()}`,
    title: input.title.trim(),
    subtitle: input.subtitle?.trim() || undefined,
    videoUrl: input.videoUrl.trim(),
    posterUrl: input.posterUrl?.trim() || undefined,
    durationLabel: input.durationLabel?.trim() || undefined,
    ctaLabel: input.ctaLabel?.trim() || undefined,
    ctaHref: input.ctaHref?.trim() || undefined,
    publishedAt: input.publishedAt ?? new Date().toISOString(),
    kind: input.kind,
    published: input.published,
    targetMode: input.targetMode,
    targetPlanCodes: normalizePlanList(input.targetPlanCodes),
    targetTenantSlugs: normalizeSlugList(input.targetTenantSlugs)
  };
  store.unshift(record);
  return record;
}

export function updatePlatformAnnouncementVideo(
  id: string,
  patch: Partial<PlatformAnnouncementVideoInput>
): PlatformAnnouncementVideoRecord | null {
  const index = store.findIndex((item) => item.id === id);
  if (index < 0) return null;
  const current = store[index]!;
  const next: PlatformAnnouncementVideoRecord = {
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
    published: patch.published ?? current.published,
    targetMode: patch.targetMode ?? current.targetMode,
    targetPlanCodes:
      patch.targetPlanCodes !== undefined ? normalizePlanList(patch.targetPlanCodes) : current.targetPlanCodes,
    targetTenantSlugs:
      patch.targetTenantSlugs !== undefined ? normalizeSlugList(patch.targetTenantSlugs) : current.targetTenantSlugs
  };
  store[index] = next;
  return next;
}

export function deletePlatformAnnouncementVideo(id: string): boolean {
  const index = store.findIndex((item) => item.id === id);
  if (index < 0) return false;
  store.splice(index, 1);
  return true;
}

export function toPublicVideo(record: PlatformAnnouncementVideoRecord) {
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
