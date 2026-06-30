import assert from "node:assert/strict";
import test from "node:test";
import {
  ORDERED_SQL_MIGRATION_FILES,
  buildOrderedDatabaseMigrations,
  createDatabasePlatformAnnouncementVideoRepository,
  type QueryExecutor,
  type QueryResultRow
} from "@hallederiz/database";

class FakeQueryExecutor implements QueryExecutor {
  public readonly calls: Array<{ sql: string; params?: unknown[] }> = [];

  constructor(
    private readonly handler: (sql: string, params: unknown[] | undefined) => Promise<QueryResultRow[]>
  ) {}

  async query<T extends QueryResultRow = QueryResultRow>(
    sql: string,
    params?: unknown[]
  ): Promise<T[]> {
    this.calls.push({ sql, params });
    const rows = await this.handler(sql, params);
    return rows as T[];
  }

  async transaction<T>(operation: (executor: QueryExecutor) => Promise<T>): Promise<T> {
    return operation(this);
  }
}

test("migration registry includes platform operator tables", () => {
  assert.ok(ORDERED_SQL_MIGRATION_FILES.includes("0016_platform_operator.sql"));
  const corpus = buildOrderedDatabaseMigrations()
    .map((migration) => migration.sql)
    .join("\n");
  assert.ok(corpus.includes("platform_announcement_videos"));
  assert.ok(corpus.includes("plan_code"));
});

test("platform announcement video repository requires postgres mode", async () => {
  const executor = new FakeQueryExecutor(async () => []);
  const repository = createDatabasePlatformAnnouncementVideoRepository({
    executor,
    persistenceMode: "demo"
  });
  await assert.rejects(() => repository.listAll(), /db_repository_postgres_mode_required/);
});

test("platform announcement video repository maps list rows", async () => {
  const executor = new FakeQueryExecutor(async () => [
    {
      id: "ann_test_1",
      title: "Test",
      subtitle: null,
      video_url: "https://example.com/video.mp4",
      poster_url: null,
      duration_label: "0:10",
      cta_label: null,
      cta_href: null,
      published_at: "2026-06-29T10:00:00.000Z",
      kind: "promo",
      published: true,
      target_mode: "all",
      target_plan_codes: [],
      target_tenant_slugs: [],
      created_at: "2026-06-29T10:00:00.000Z",
      updated_at: "2026-06-29T10:00:00.000Z"
    }
  ]);
  const repository = createDatabasePlatformAnnouncementVideoRepository({
    executor,
    persistenceMode: "postgres"
  });
  const items = await repository.listAll();
  assert.equal(items.length, 1);
  assert.equal(items[0]?.videoUrl, "https://example.com/video.mp4");
  assert.equal(items[0]?.targetMode, "all");
});
