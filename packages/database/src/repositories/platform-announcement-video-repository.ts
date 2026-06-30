import type { QueryExecutor, QueryResultRow } from "../types";

export type DbAnnouncementVideoKind = "promo" | "announcement" | "training";
export type DbAnnouncementVideoTargetMode = "all" | "plan" | "tenants";

export interface DbPlatformAnnouncementVideoRecord {
  id: string;
  title: string;
  subtitle?: string;
  videoUrl: string;
  posterUrl?: string;
  durationLabel?: string;
  ctaLabel?: string;
  ctaHref?: string;
  publishedAt: string;
  kind: DbAnnouncementVideoKind;
  published: boolean;
  targetMode: DbAnnouncementVideoTargetMode;
  targetPlanCodes: string[];
  targetTenantSlugs: string[];
  createdAt: string;
  updatedAt: string;
}

interface VideoRow extends QueryResultRow {
  id: string;
  title: string;
  subtitle: string | null;
  video_url: string;
  poster_url: string | null;
  duration_label: string | null;
  cta_label: string | null;
  cta_href: string | null;
  published_at: string;
  kind: string;
  published: boolean;
  target_mode: string;
  target_plan_codes: unknown;
  target_tenant_slugs: unknown;
  created_at: string;
  updated_at: string;
}

interface DatabaseRepositoryOptions {
  executor: QueryExecutor;
  persistenceMode: "demo" | "postgres";
}

function parseStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
    } catch {
      return [];
    }
  }
  return [];
}

function mapRow(row: VideoRow): DbPlatformAnnouncementVideoRecord {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle ?? undefined,
    videoUrl: row.video_url,
    posterUrl: row.poster_url ?? undefined,
    durationLabel: row.duration_label ?? undefined,
    ctaLabel: row.cta_label ?? undefined,
    ctaHref: row.cta_href ?? undefined,
    publishedAt: row.published_at,
    kind: row.kind as DbAnnouncementVideoKind,
    published: row.published,
    targetMode: row.target_mode as DbAnnouncementVideoTargetMode,
    targetPlanCodes: parseStringArray(row.target_plan_codes),
    targetTenantSlugs: parseStringArray(row.target_tenant_slugs),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

const SELECT_COLUMNS = `
  id, title, subtitle, video_url, poster_url, duration_label, cta_label, cta_href,
  published_at, kind, published, target_mode, target_plan_codes, target_tenant_slugs,
  created_at, updated_at
`;

export class DatabasePlatformAnnouncementVideoRepository {
  private readonly executor: QueryExecutor;
  private readonly persistenceMode: "demo" | "postgres";

  constructor(options: DatabaseRepositoryOptions) {
    this.executor = options.executor;
    this.persistenceMode = options.persistenceMode;
  }

  private assertPersistenceSupported() {
    if (this.persistenceMode !== "postgres") {
      throw new Error("db_repository_postgres_mode_required");
    }
  }

  async listAll(): Promise<DbPlatformAnnouncementVideoRecord[]> {
    this.assertPersistenceSupported();
    const rows = await this.executor.query<VideoRow>(
      `SELECT ${SELECT_COLUMNS}
       FROM platform_announcement_videos
       ORDER BY published_at DESC`
    );
    return rows.map(mapRow);
  }

  async listPublished(): Promise<DbPlatformAnnouncementVideoRecord[]> {
    this.assertPersistenceSupported();
    const rows = await this.executor.query<VideoRow>(
      `SELECT ${SELECT_COLUMNS}
       FROM platform_announcement_videos
       WHERE published = TRUE
         AND btrim(video_url) <> ''
       ORDER BY published_at DESC`
    );
    return rows.map(mapRow);
  }

  async create(input: Omit<DbPlatformAnnouncementVideoRecord, "createdAt" | "updatedAt">): Promise<DbPlatformAnnouncementVideoRecord> {
    this.assertPersistenceSupported();
    const now = new Date().toISOString();
    const rows = await this.executor.query<VideoRow>(
      `INSERT INTO platform_announcement_videos (
        id, title, subtitle, video_url, poster_url, duration_label, cta_label, cta_href,
        published_at, kind, published, target_mode, target_plan_codes, target_tenant_slugs,
        created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8,
        $9::timestamptz, $10, $11, $12, $13::jsonb, $14::jsonb,
        $15::timestamptz, $16::timestamptz
      )
      RETURNING ${SELECT_COLUMNS}`,
      [
        input.id,
        input.title,
        input.subtitle ?? null,
        input.videoUrl,
        input.posterUrl ?? null,
        input.durationLabel ?? null,
        input.ctaLabel ?? null,
        input.ctaHref ?? null,
        input.publishedAt,
        input.kind,
        input.published,
        input.targetMode,
        JSON.stringify(input.targetPlanCodes),
        JSON.stringify(input.targetTenantSlugs),
        now,
        now
      ]
    );
    if (!rows[0]) throw new Error("platform_announcement_video_create_failed");
    return mapRow(rows[0]);
  }

  async update(
    id: string,
    patch: Partial<Omit<DbPlatformAnnouncementVideoRecord, "id" | "createdAt" | "updatedAt">>
  ): Promise<DbPlatformAnnouncementVideoRecord | null> {
    this.assertPersistenceSupported();
    const existing = await this.executor.query<VideoRow>(
      `SELECT ${SELECT_COLUMNS} FROM platform_announcement_videos WHERE id = $1 LIMIT 1`,
      [id]
    );
    if (!existing[0]) return null;
    const current = mapRow(existing[0]);
    const next: DbPlatformAnnouncementVideoRecord = {
      ...current,
      ...patch,
      id: current.id,
      createdAt: current.createdAt,
      updatedAt: new Date().toISOString()
    };
    const rows = await this.executor.query<VideoRow>(
      `UPDATE platform_announcement_videos
       SET title = $2,
           subtitle = $3,
           video_url = $4,
           poster_url = $5,
           duration_label = $6,
           cta_label = $7,
           cta_href = $8,
           published_at = $9::timestamptz,
           kind = $10,
           published = $11,
           target_mode = $12,
           target_plan_codes = $13::jsonb,
           target_tenant_slugs = $14::jsonb,
           updated_at = $15::timestamptz
       WHERE id = $1
       RETURNING ${SELECT_COLUMNS}`,
      [
        id,
        next.title,
        next.subtitle ?? null,
        next.videoUrl,
        next.posterUrl ?? null,
        next.durationLabel ?? null,
        next.ctaLabel ?? null,
        next.ctaHref ?? null,
        next.publishedAt,
        next.kind,
        next.published,
        next.targetMode,
        JSON.stringify(next.targetPlanCodes),
        JSON.stringify(next.targetTenantSlugs),
        next.updatedAt
      ]
    );
    return rows[0] ? mapRow(rows[0]) : null;
  }

  async delete(id: string): Promise<boolean> {
    this.assertPersistenceSupported();
    const rows = await this.executor.query<{ id: string }>(
      `DELETE FROM platform_announcement_videos WHERE id = $1 RETURNING id`,
      [id]
    );
    return Boolean(rows[0]);
  }
}

export function createDatabasePlatformAnnouncementVideoRepository(options: DatabaseRepositoryOptions) {
  return new DatabasePlatformAnnouncementVideoRepository(options);
}
