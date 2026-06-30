-- Platform operator console: announcement videos + tenant plan metadata
BEGIN;

ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS plan_code TEXT NOT NULL DEFAULT 'core';

UPDATE tenants
SET plan_code = 'premium',
    status = 'active'
WHERE LOWER(slug) IN ('hallederiz', 'tenant_1')
   OR id IN ('tenant_1', 'tenant_hallederiz');

CREATE TABLE IF NOT EXISTS platform_announcement_videos (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  video_url TEXT NOT NULL,
  poster_url TEXT,
  duration_label TEXT,
  cta_label TEXT,
  cta_href TEXT,
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  kind TEXT NOT NULL,
  published BOOLEAN NOT NULL DEFAULT FALSE,
  target_mode TEXT NOT NULL DEFAULT 'all',
  target_plan_codes JSONB NOT NULL DEFAULT '[]'::jsonb,
  target_tenant_slugs JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT platform_announcement_videos_kind_chk
    CHECK (kind IN ('promo', 'announcement', 'training')),
  CONSTRAINT platform_announcement_videos_target_mode_chk
    CHECK (target_mode IN ('all', 'plan', 'tenants'))
);

CREATE INDEX IF NOT EXISTS platform_announcement_videos_published_idx
  ON platform_announcement_videos (published, published_at DESC);

INSERT INTO platform_announcement_videos (
  id,
  title,
  subtitle,
  video_url,
  duration_label,
  published_at,
  kind,
  published,
  target_mode,
  target_plan_codes,
  target_tenant_slugs,
  cta_label,
  cta_href
)
SELECT
  'ann_platform_1',
  'HallederizCRM Premium Tanıtım',
  'Operasyon masası, onay akışı ve hızlı işlem özeti',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  '0:15',
  NOW(),
  'promo',
  TRUE,
  'all',
  '[]'::jsonb,
  '[]'::jsonb,
  'Hızlı İşlem',
  '/hizli-islem/satis-masasi'
WHERE NOT EXISTS (SELECT 1 FROM platform_announcement_videos WHERE id = 'ann_platform_1');

INSERT INTO platform_announcement_videos (
  id,
  title,
  subtitle,
  video_url,
  duration_label,
  published_at,
  kind,
  published,
  target_mode,
  target_plan_codes,
  target_tenant_slugs
)
SELECT
  'ann_platform_2',
  'Haziran Duyurusu — Onay ve Tahsilat',
  'Kritik işlemlerde onay zorunluluğu hatırlatması',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  '0:15',
  NOW(),
  'announcement',
  TRUE,
  'all',
  '[]'::jsonb,
  '[]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM platform_announcement_videos WHERE id = 'ann_platform_2');

COMMIT;
