"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useToast } from "../../../providers/toast-provider";
import type { DashboardAnnouncementVideoKind } from "../../dashboard/data/dashboard-announcement-videos";
import {
  createAnnouncementVideoAdmin,
  deleteAnnouncementVideoAdmin,
  listAnnouncementVideosAdmin,
  updateAnnouncementVideoAdmin,
  type AnnouncementVideoAdminRecord
} from "../queries/announcement-videos-admin";

const KIND_OPTIONS: Array<{ value: DashboardAnnouncementVideoKind; label: string }> = [
  { value: "promo", label: "Tanıtım" },
  { value: "announcement", label: "Duyuru" },
  { value: "training", label: "Eğitim" }
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
  published: true
};

export function SettingsAnnouncementVideosPage() {
  const { pushToast } = useToast();
  const [rows, setRows] = useState<AnnouncementVideoAdminRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const items = await listAnnouncementVideosAdmin();
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
    if (!form.title.trim() || !form.videoUrl.trim()) {
      pushToast("Başlık ve video URL zorunludur.");
      return;
    }
    setSaving(true);
    try {
      await createAnnouncementVideoAdmin({
        ...form,
        title: form.title.trim(),
        videoUrl: form.videoUrl.trim()
      });
      setForm(EMPTY_FORM);
      pushToast("Video yayına alındı.");
      await load();
    } catch {
      pushToast("Video kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  }

  async function togglePublished(row: AnnouncementVideoAdminRecord) {
    setSaving(true);
    try {
      await updateAnnouncementVideoAdmin(row.id, { published: !row.published });
      pushToast(row.published ? "Video yayından kaldırıldı." : "Video yayınlandı.");
      await load();
    } catch {
      pushToast("Yayın durumu güncellenemedi.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setSaving(true);
    try {
      await deleteAnnouncementVideoAdmin(id);
      pushToast("Video silindi.");
      await load();
    } catch {
      pushToast("Video silinemedi.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="setf-page" data-page="settings-announcement-videos">
      <header className="setf-head">
        <div>
          <p className="setf-crumb">
            <Link href="/ayarlar" className="setf-crumb-link">
              Ayarlar
            </Link>
            <span aria-hidden> / </span>
            <span>Duyuru Videoları</span>
          </p>
          <h1>Duyuru Videoları</h1>
          <p className="setf-lead">
            Dashboard sağ panelindeki video oynatıcıda gösterilecek tanıtım ve duyuru videolarını yönetin.
          </p>
        </div>
        <Link href="/dashboard?videoPreview=1" className="hz-btn hz-btn-secondary">
          Önizleme
        </Link>
      </header>

      <section className="setf-panel">
        <h2>Yeni video ekle</h2>
        <form className="setf-form-grid" onSubmit={handleCreate}>
          <label className="setf-field">
            Başlık
            <input
              className="setf-input"
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              required
            />
          </label>
          <label className="setf-field">
            Tür
            <select
              className="setf-input"
              value={form.kind}
              onChange={(e) => setForm((prev) => ({ ...prev, kind: e.target.value as DashboardAnnouncementVideoKind }))}
            >
              {KIND_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="setf-field setf-field--full">
            Video URL
            <input
              className="setf-input"
              value={form.videoUrl}
              onChange={(e) => setForm((prev) => ({ ...prev, videoUrl: e.target.value }))}
              placeholder="https://..."
              required
            />
          </label>
          <label className="setf-field setf-field--full">
            Alt başlık
            <input
              className="setf-input"
              value={form.subtitle}
              onChange={(e) => setForm((prev) => ({ ...prev, subtitle: e.target.value }))}
            />
          </label>
          <label className="setf-field">
            Poster URL
            <input
              className="setf-input"
              value={form.posterUrl}
              onChange={(e) => setForm((prev) => ({ ...prev, posterUrl: e.target.value }))}
            />
          </label>
          <label className="setf-field">
            Süre etiketi
            <input
              className="setf-input"
              value={form.durationLabel}
              onChange={(e) => setForm((prev) => ({ ...prev, durationLabel: e.target.value }))}
              placeholder="0:30"
            />
          </label>
          <label className="setf-field">
            CTA etiketi
            <input
              className="setf-input"
              value={form.ctaLabel}
              onChange={(e) => setForm((prev) => ({ ...prev, ctaLabel: e.target.value }))}
            />
          </label>
          <label className="setf-field">
            CTA link
            <input
              className="setf-input"
              value={form.ctaHref}
              onChange={(e) => setForm((prev) => ({ ...prev, ctaHref: e.target.value }))}
              placeholder="/hizli-islem/satis-masasi"
            />
          </label>
          <label className="setf-field setf-field--checkbox">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => setForm((prev) => ({ ...prev, published: e.target.checked }))}
            />
            Yayında
          </label>
          <div className="setf-field setf-field--full">
            <button type="submit" className="hz-btn hz-btn-primary" disabled={saving}>
              {saving ? "Kaydediliyor…" : "Video ekle"}
            </button>
          </div>
        </form>
      </section>

      <section className="setf-panel">
        <h2>Yayın listesi ({rows.length})</h2>
        {loading ? (
          <p className="setf-empty" role="status">
            Liste yükleniyor…
          </p>
        ) : rows.length === 0 ? (
          <p className="setf-empty">Henüz video yok.</p>
        ) : (
          <div className="setf-table-wrap">
            <table className="setf-table">
              <thead>
                <tr>
                  <th>Başlık</th>
                  <th>Tür</th>
                  <th>Durum</th>
                  <th>İşlem</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <strong>{row.title}</strong>
                      <span className="setf-table-sub">{row.videoUrl}</span>
                    </td>
                    <td>{row.kind}</td>
                    <td>{row.published ? "Yayında" : "Taslak"}</td>
                    <td className="setf-table-actions">
                      <button
                        type="button"
                        className="hz-btn hz-btn-secondary"
                        disabled={saving}
                        onClick={() => void togglePublished(row)}
                      >
                        {row.published ? "Yayından kaldır" : "Yayınla"}
                      </button>
                      <button
                        type="button"
                        className="hz-btn hz-btn-secondary"
                        disabled={saving}
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

      <p className="setf-note" role="status">
        Onay uyarısı önizlemesi: <Link href="/dashboard?onayUyari=1">/dashboard?onayUyari=1</Link>
      </p>
    </div>
  );
}
