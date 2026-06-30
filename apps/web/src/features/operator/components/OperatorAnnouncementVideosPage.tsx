"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useToast } from "../../../providers/toast-provider";
import {
  createOperatorAnnouncementVideo,
  deleteOperatorAnnouncementVideo,
  listOperatorAnnouncementVideos,
  updateOperatorAnnouncementVideo,
  type AnnouncementVideoTargetMode,
  type DashboardAnnouncementVideoKind,
  type OperatorAnnouncementVideoRecord
} from "../queries/announcement-videos-operator";
import { hasOperatorConsoleWrite } from "../utils/has-operator-access";
import { useAuth } from "../../../providers/auth-provider";

const KIND_OPTIONS: Array<{ value: DashboardAnnouncementVideoKind; label: string }> = [
  { value: "promo", label: "Tanıtım" },
  { value: "announcement", label: "Duyuru" },
  { value: "training", label: "Eğitim" }
];

const TARGET_OPTIONS: Array<{ value: AnnouncementVideoTargetMode; label: string }> = [
  { value: "all", label: "Tüm kiracılar" },
  { value: "plan", label: "Paket hedefi" },
  { value: "tenants", label: "Seçili kiracılar" }
];

const EMPTY_FORM = {
  title: "",
  subtitle: "",
  videoUrl: "",
  posterUrl: "",
  durationLabel: "",
  ctaLabel: "",
  ctaHref: "",
  kind: "promo" as DashboardAnnouncementVideoKind,
  published: true,
  targetMode: "all" as AnnouncementVideoTargetMode,
  targetPlanCodes: "premium,enterprise",
  targetTenantSlugs: "hallederiz"
};

function formatTargetLabel(row: OperatorAnnouncementVideoRecord): string {
  if (row.targetMode === "all") return "Tüm kiracılar";
  if (row.targetMode === "plan") return `Paket: ${row.targetPlanCodes.join(", ") || "—"}`;
  return `Kiracı: ${row.targetTenantSlugs.join(", ") || "—"}`;
}

export function OperatorAnnouncementVideosPage() {
  const { pushToast } = useToast();
  const { session } = useAuth();
  const canWrite = hasOperatorConsoleWrite(session);
  const [rows, setRows] = useState<OperatorAnnouncementVideoRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const items = await listOperatorAnnouncementVideos();
      setRows(items);
    } catch {
      pushToast("Video listesi yüklenemedi.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [pushToast]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    if (!canWrite) {
      pushToast("Yazma yetkiniz yok.");
      return;
    }
    if (!form.title.trim() || !form.videoUrl.trim()) {
      pushToast("Başlık ve video URL zorunludur.");
      return;
    }
    setSaving(true);
    try {
      await createOperatorAnnouncementVideo({
        ...form,
        title: form.title.trim(),
        videoUrl: form.videoUrl.trim(),
        targetPlanCodes:
          form.targetMode === "plan"
            ? form.targetPlanCodes
                .split(",")
                .map((value) => value.trim())
                .filter(Boolean)
            : [],
        targetTenantSlugs:
          form.targetMode === "tenants"
            ? form.targetTenantSlugs
                .split(",")
                .map((value) => value.trim())
                .filter(Boolean)
            : []
      });
      setForm(EMPTY_FORM);
      pushToast("Platform videosu yayına alındı.");
      await load();
    } catch {
      pushToast("Video kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  }

  async function togglePublished(row: OperatorAnnouncementVideoRecord) {
    if (!canWrite) return;
    setSaving(true);
    try {
      await updateOperatorAnnouncementVideo(row.id, { published: !row.published });
      pushToast(row.published ? "Video yayından kaldırıldı." : "Video yayınlandı.");
      await load();
    } catch {
      pushToast("Yayın durumu güncellenemedi.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!canWrite) return;
    setSaving(true);
    try {
      await deleteOperatorAnnouncementVideo(id);
      pushToast("Video silindi.");
      await load();
    } catch {
      pushToast("Video silinemedi.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="hz-operator-page" data-page="operator-announcement-videos">
      <header className="hz-operator-page-head">
        <p className="hz-operator-crumb">
          <Link href="/operator">SaaS Kontrol</Link>
          <span aria-hidden> / </span>
          <span>Duyuru Videoları</span>
        </p>
        <h2>Platform duyuru videoları</h2>
        <p>
          Tanıtım ve duyuru videolarını tüm kiracılara veya seçili paket/kiracı hedeflerine yayınlayın. Kiracı
          dashboard&apos;u yalnızca okur.
        </p>
        <Link href="/dashboard?videoPreview=1" className="hz-btn hz-btn-secondary">
          Dashboard önizleme
        </Link>
      </header>

      {!canWrite ? (
        <p className="hz-operator-note" role="status">
          Bu hesapta yalnızca okuma yetkisi var. Yayın yönetimi için <code>platform.operator.write</code> gerekir.
        </p>
      ) : null}

      <section className="hz-operator-panel">
        <h3>Yeni platform videosu</h3>
        <form className="hz-operator-form-grid" onSubmit={handleCreate}>
          <label className="hz-operator-field">
            Başlık
            <input
              className="hz-operator-input"
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              required
              disabled={!canWrite}
            />
          </label>
          <label className="hz-operator-field">
            Tür
            <select
              className="hz-operator-input"
              value={form.kind}
              onChange={(e) => setForm((prev) => ({ ...prev, kind: e.target.value as DashboardAnnouncementVideoKind }))}
              disabled={!canWrite}
            >
              {KIND_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="hz-operator-field">
            Hedef
            <select
              className="hz-operator-input"
              value={form.targetMode}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, targetMode: e.target.value as AnnouncementVideoTargetMode }))
              }
              disabled={!canWrite}
            >
              {TARGET_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          {form.targetMode === "plan" ? (
            <label className="hz-operator-field hz-operator-field--full">
              Paket kodları (virgülle)
              <input
                className="hz-operator-input"
                value={form.targetPlanCodes}
                onChange={(e) => setForm((prev) => ({ ...prev, targetPlanCodes: e.target.value }))}
                placeholder="core,premium,enterprise"
                disabled={!canWrite}
              />
            </label>
          ) : null}
          {form.targetMode === "tenants" ? (
            <label className="hz-operator-field hz-operator-field--full">
              Kiracı slug listesi (virgülle)
              <input
                className="hz-operator-input"
                value={form.targetTenantSlugs}
                onChange={(e) => setForm((prev) => ({ ...prev, targetTenantSlugs: e.target.value }))}
                placeholder="hallederiz,duvar-dekor"
                disabled={!canWrite}
              />
            </label>
          ) : null}
          <label className="hz-operator-field hz-operator-field--full">
            Video URL
            <input
              className="hz-operator-input"
              value={form.videoUrl}
              onChange={(e) => setForm((prev) => ({ ...prev, videoUrl: e.target.value }))}
              placeholder="https://..."
              required
              disabled={!canWrite}
            />
          </label>
          <label className="hz-operator-field hz-operator-field--full">
            Alt başlık
            <input
              className="hz-operator-input"
              value={form.subtitle}
              onChange={(e) => setForm((prev) => ({ ...prev, subtitle: e.target.value }))}
              disabled={!canWrite}
            />
          </label>
          <label className="hz-operator-field">
            CTA etiketi
            <input
              className="hz-operator-input"
              value={form.ctaLabel}
              onChange={(e) => setForm((prev) => ({ ...prev, ctaLabel: e.target.value }))}
              disabled={!canWrite}
            />
          </label>
          <label className="hz-operator-field">
            CTA link
            <input
              className="hz-operator-input"
              value={form.ctaHref}
              onChange={(e) => setForm((prev) => ({ ...prev, ctaHref: e.target.value }))}
              disabled={!canWrite}
            />
          </label>
          <label className="hz-operator-field hz-operator-field--checkbox">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => setForm((prev) => ({ ...prev, published: e.target.checked }))}
              disabled={!canWrite}
            />
            Yayında
          </label>
          <div className="hz-operator-field hz-operator-field--full">
            <button type="submit" className="hz-btn hz-btn-primary" disabled={saving || !canWrite}>
              {saving ? "Kaydediliyor…" : "Platform videosu ekle"}
            </button>
          </div>
        </form>
      </section>

      <section className="hz-operator-panel">
        <h3>Yayın listesi ({rows.length})</h3>
        {loading ? (
          <p className="hz-operator-empty" role="status">
            Liste yükleniyor…
          </p>
        ) : rows.length === 0 ? (
          <p className="hz-operator-empty">Henüz platform videosu yok.</p>
        ) : (
          <div className="hz-operator-table-wrap">
            <table className="hz-operator-table">
              <thead>
                <tr>
                  <th>Başlık</th>
                  <th>Hedef</th>
                  <th>Durum</th>
                  <th>İşlem</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <strong>{row.title}</strong>
                      <span className="hz-operator-table-sub">{row.videoUrl}</span>
                    </td>
                    <td>{formatTargetLabel(row)}</td>
                    <td>{row.published ? "Yayında" : "Taslak"}</td>
                    <td className="hz-operator-table-actions">
                      <button
                        type="button"
                        className="hz-btn hz-btn-secondary"
                        disabled={saving || !canWrite}
                        onClick={() => void togglePublished(row)}
                      >
                        {row.published ? "Yayından kaldır" : "Yayınla"}
                      </button>
                      <button
                        type="button"
                        className="hz-btn hz-btn-secondary"
                        disabled={saving || !canWrite}
                        onClick={() => void handleDelete(row.id)}
                      >
                        Sil
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
