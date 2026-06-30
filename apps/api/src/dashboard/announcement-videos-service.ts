import type { DbPlatformAnnouncementVideoRecord } from "@hallederiz/database";
import {
  createPlatformAnnouncementVideo as createMemoryPlatformAnnouncementVideo,
  deletePlatformAnnouncementVideo as deleteMemoryPlatformAnnouncementVideo,
  listAllPlatformAnnouncementVideos as listAllMemoryPlatformAnnouncementVideos,
  listPublishedAnnouncementVideosForTenant as listPublishedMemoryAnnouncementVideosForTenant,
  updatePlatformAnnouncementVideo as updateMemoryPlatformAnnouncementVideo,
  type PlatformAnnouncementVideoInput,
  type PlatformAnnouncementVideoRecord,
  type TenantAnnouncementContext
} from "./announcement-videos-store";
import { assertOperatorPostgresRuntime, isOperatorPostgresEnabled } from "../shared/operator-persistence-runtime";

function fromDbRecord(record: DbPlatformAnnouncementVideoRecord): PlatformAnnouncementVideoRecord {
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
    kind: record.kind,
    published: record.published,
    targetMode: record.targetMode,
    targetPlanCodes: record.targetPlanCodes,
    targetTenantSlugs: record.targetTenantSlugs
  };
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

function buildCreatePayload(input: PlatformAnnouncementVideoInput): Omit<DbPlatformAnnouncementVideoRecord, "createdAt" | "updatedAt"> {
  return {
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
}

function buildUpdatePayload(
  current: PlatformAnnouncementVideoRecord,
  patch: Partial<PlatformAnnouncementVideoInput>
): Partial<Omit<DbPlatformAnnouncementVideoRecord, "id" | "createdAt" | "updatedAt">> {
  return {
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

export async function listAllPlatformAnnouncementVideos(): Promise<PlatformAnnouncementVideoRecord[]> {
  if (!isOperatorPostgresEnabled()) {
    return listAllMemoryPlatformAnnouncementVideos();
  }
  const runtime = assertOperatorPostgresRuntime();
  const items = await runtime.videos.listAll();
  return items.map(fromDbRecord);
}

export async function listPublishedAnnouncementVideosForTenant(
  context: TenantAnnouncementContext
): Promise<PlatformAnnouncementVideoRecord[]> {
  if (!isOperatorPostgresEnabled()) {
    return listPublishedMemoryAnnouncementVideosForTenant(context);
  }
  const runtime = assertOperatorPostgresRuntime();
  const items = (await runtime.videos.listPublished()).map(fromDbRecord);
  return items.filter((item) => matchesTenantTarget(item, context));
}

export async function createPlatformAnnouncementVideo(
  input: PlatformAnnouncementVideoInput
): Promise<PlatformAnnouncementVideoRecord> {
  if (!isOperatorPostgresEnabled()) {
    return createMemoryPlatformAnnouncementVideo(input);
  }
  const runtime = assertOperatorPostgresRuntime();
  const created = await runtime.videos.create(buildCreatePayload(input));
  return fromDbRecord(created);
}

export async function updatePlatformAnnouncementVideo(
  id: string,
  patch: Partial<PlatformAnnouncementVideoInput>
): Promise<PlatformAnnouncementVideoRecord | null> {
  if (!isOperatorPostgresEnabled()) {
    return updateMemoryPlatformAnnouncementVideo(id, patch);
  }
  const runtime = assertOperatorPostgresRuntime();
  const all = await runtime.videos.listAll();
  const current = all.find((item) => item.id === id);
  if (!current) return null;
  const updated = await runtime.videos.update(id, buildUpdatePayload(fromDbRecord(current), patch));
  return updated ? fromDbRecord(updated) : null;
}

export async function deletePlatformAnnouncementVideo(id: string): Promise<boolean> {
  if (!isOperatorPostgresEnabled()) {
    return deleteMemoryPlatformAnnouncementVideo(id);
  }
  const runtime = assertOperatorPostgresRuntime();
  return runtime.videos.delete(id);
}
