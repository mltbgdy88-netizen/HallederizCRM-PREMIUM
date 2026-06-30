"use client";

import type { Approval } from "@hallederiz/types";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LucideIcon } from "../../../components/icons/lucide-icons";
import type { DashboardAnnouncementVideo } from "../data/dashboard-announcement-videos";
import { useDashboardApprovalAlert } from "../hooks/use-dashboard-approval-alert";
import { getDashboardAnnouncementVideos } from "../queries/get-dashboard-announcement-videos";

const PREVIEW_APPROVAL: Approval = {
  id: "approval_preview",
  tenantId: "tenant_1",
  approvalNo: "APR-PREVIEW",
  type: "ai_action_proposal",
  status: "pending",
  entityType: "ai_proposal",
  entityId: "preview",
  entityNo: "PREVIEW",
  requestedBy: "user_admin",
  requestedByName: "Admin",
  requestedRole: "Yonetici",
  createdAt: new Date().toISOString(),
  payloadSummary: "Önizleme: WhatsApp tahsilat hatırlatması gönder",
  payload: {},
  policySnapshot: {
    policyId: "preview",
    requiredRole: "Yonetici",
    minApproverCount: 1,
    reason: "preview",
    serverActionKey: "preview"
  },
  execution: { executable: true }
};

function formatClock(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const whole = Math.floor(seconds);
  const mins = Math.floor(whole / 60);
  const secs = whole % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function kindLabel(kind: DashboardAnnouncementVideo["kind"]): string {
  if (kind === "promo") return "Tanıtım";
  if (kind === "training") return "Eğitim";
  return "Duyuru";
}

function approvalHeadline(approval: Approval): string {
  if (approval.type === "ai_action_proposal") return "AI işlemi onay bekliyor";
  if (approval.type === "delivery_payment_missing") return "Teslimat onayı gerekli";
  if (approval.type === "order_high_value") return "Sipariş onayı gerekli";
  if (approval.type === "return_approval") return "İade onayı gerekli";
  if (approval.type === "price_override") return "Fiyat değişikliği onayı gerekli";
  return "Onay gerektiren işlem";
}

function ApprovalAlertScreen({
  approval,
  onOpen
}: {
  approval: Approval;
  onOpen: (approval: Approval) => void;
}) {
  return (
    <button
      type="button"
      className="hz-promo-player__alert"
      onClick={() => onOpen(approval)}
      aria-label={`${approval.approvalNo} onayını incele`}
    >
      <span className="hz-promo-player__alert-flash" aria-hidden />
      <span className="hz-promo-player__alert-shimmer" aria-hidden />
      <span className="hz-promo-player__alert-glow" aria-hidden />
      <span className="hz-promo-player__alert-beacon" aria-hidden />
      <span className="hz-promo-player__alert-icon" aria-hidden>
        <LucideIcon name="bell-ring" size={30} strokeWidth={2.35} />
      </span>
      <span className="hz-promo-player__alert-eyebrow">
        <span className="hz-promo-player__alert-dot" aria-hidden />
        Acil onay
      </span>
      <strong className="hz-promo-player__alert-title">{approvalHeadline(approval)}</strong>
      <span className="hz-promo-player__alert-ref">{approval.approvalNo}</span>
      <span className="hz-promo-player__alert-copy">{approval.payloadSummary}</span>
      <span className="hz-promo-player__alert-cta">İncelemek için tıklayın →</span>
    </button>
  );
}

export function DashboardAnnouncementVideoPanel() {
  return (
    <Suspense
      fallback={
        <article className="hz-dash-card hz-promo-card" aria-busy="true">
          <div className="hz-promo-player">
            <p className="hz-promo-player__empty" role="status">
              Yükleniyor…
            </p>
          </div>
        </article>
      }
    >
      <DashboardAnnouncementVideoPanelInner />
    </Suspense>
  );
}

function DashboardAnnouncementVideoPanelInner() {
  const searchParams = useSearchParams();
  const forceVideoPreview = searchParams.get("videoPreview") === "1";
  const forceAlertPreview = searchParams.get("onayUyari") === "1";
  const { alert: approvalAlert, loading: alertLoading, openApproval } = useDashboardApprovalAlert();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const screenRef = useRef<HTMLDivElement | null>(null);

  const [feed, setFeed] = useState<{ items: DashboardAnnouncementVideo[]; source: "live" | "demo" }>({
    items: [],
    source: "demo"
  });
  const [videoLoading, setVideoLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(true);

  const selected = feed.items[selectedIndex] ?? null;
  const progress = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  useEffect(() => {
    let active = true;
    const load = async () => {
      setVideoLoading(true);
      try {
        const response = await getDashboardAnnouncementVideos();
        if (!active) return;
        setFeed(response);
        setSelectedIndex(0);
      } finally {
        if (active) setVideoLoading(false);
      }
    };    void load();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    video.currentTime = 0;
    if (selected?.videoUrl) {
      video.load();
    }
  }, [selected?.id, selected?.videoUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) video.muted = muted;
  }, [muted, selected?.id]);

  const togglePlay = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !selected?.videoUrl) return;
    if (video.paused) {
      try {
        await video.play();
        setPlaying(true);
      } catch {
        setPlaying(false);
      }
    } else {
      video.pause();
      setPlaying(false);
    }
  }, [selected?.videoUrl]);

  const seekToRatio = useCallback(
    (ratio: number) => {
      const video = videoRef.current;
      if (!video || !duration) return;
      const next = Math.max(0, Math.min(duration, duration * ratio));
      video.currentTime = next;
      setCurrentTime(next);
    },
    [duration]
  );

  const goTo = useCallback(
    (index: number) => {
      if (feed.items.length === 0) return;
      const next = (index + feed.items.length) % feed.items.length;
      setSelectedIndex(next);
    },
    [feed.items.length]
  );

  const toggleFullscreen = useCallback(async () => {
    const target = screenRef.current;
    if (!target) return;
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }
    await target.requestFullscreen();
  }, []);

  const timeLabel = useMemo(() => {
    if (selected?.durationLabel && !duration) return selected.durationLabel;
    return `${formatClock(currentTime)} / ${formatClock(duration)}`;
  }, [currentTime, duration, selected?.durationLabel]);

  const activeApproval = forceAlertPreview ? PREVIEW_APPROVAL : approvalAlert;
  const showApprovalAlert = !forceVideoPreview && Boolean(activeApproval) && (forceAlertPreview || !alertLoading);

  return (
    <article
      className={`hz-dash-card hz-promo-card${showApprovalAlert ? " is-alert" : ""}`}
      aria-label={showApprovalAlert ? "Onay uyarı ekranı" : "Tanıtım ve duyuru videoları"}
    >
      <div className="hz-promo-player">
        {showApprovalAlert && activeApproval ? (
          <ApprovalAlertScreen approval={activeApproval} onOpen={openApproval} />
        ) : alertLoading || videoLoading ? (
          <p className="hz-promo-player__empty" role="status">
            Yükleniyor…
          </p>
        ) : !selected ? (
          <p className="hz-promo-player__empty" role="status">
            Yayında video yok. Admin panelinden tanıtım veya duyuru videosu ekleyin.
          </p>
        ) : (
          <div
            ref={screenRef}
            className={`hz-promo-player__screen${playing ? " is-playing" : ""}`}
          >
            {selected.videoUrl ? (
              <video
                ref={videoRef}
                className="hz-promo-player__video"
                src={selected.videoUrl}
                poster={selected.posterUrl}
                muted={muted}
                playsInline
                preload="metadata"
                onClick={() => void togglePlay()}
                onLoadedMetadata={(event) => setDuration(event.currentTarget.duration || 0)}
                onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onEnded={() => {
                  setPlaying(false);
                  if (feed.items.length > 1) goTo(selectedIndex + 1);
                }}
              />
            ) : null}

            <span className="hz-promo-player__vignette" aria-hidden />

            <span className="hz-promo-player__title-badge">
              <span className="hz-promo-player__kind">{kindLabel(selected.kind)}</span>
              <strong>{selected.title}</strong>
            </span>

            {!playing ? (
              <button
                type="button"
                className="hz-promo-player__play hz-promo-player__play--center"
                aria-label="Oynat"
                onClick={() => void togglePlay()}
              >
                <LucideIcon name="play" size={20} strokeWidth={2.5} />
              </button>
            ) : null}

            <div className="hz-promo-player__overlay">
              <button
                type="button"
                className="hz-promo-player__track"
                aria-label="Video konumu"
                onClick={(event) => {
                  event.stopPropagation();
                  const rect = event.currentTarget.getBoundingClientRect();
                  const ratio = rect.width > 0 ? (event.clientX - rect.left) / rect.width : 0;
                  seekToRatio(ratio);
                }}
              >
                <span className="hz-promo-player__fill" style={{ width: `${progress}%` }} />
                <span className="hz-promo-player__thumb" style={{ left: `${progress}%` }} />
              </button>

              <div className="hz-promo-player__controls">
                {feed.items.length > 1 ? (
                  <button
                    type="button"
                    className="hz-promo-player__ctrl"
                    aria-label="Önceki video"
                    onClick={(event) => {
                      event.stopPropagation();
                      goTo(selectedIndex - 1);
                    }}
                  >
                    <LucideIcon name="chevron-left" size={14} strokeWidth={2.5} />
                  </button>
                ) : null}

                <button
                  type="button"
                  className="hz-promo-player__ctrl"
                  aria-label={playing ? "Duraklat" : "Oynat"}
                  onClick={(event) => {
                    event.stopPropagation();
                    void togglePlay();
                  }}
                >
                  <LucideIcon name={playing ? "pause" : "play"} size={14} strokeWidth={2.5} />
                </button>

                {feed.items.length > 1 ? (
                  <button
                    type="button"
                    className="hz-promo-player__ctrl"
                    aria-label="Sonraki video"
                    onClick={(event) => {
                      event.stopPropagation();
                      goTo(selectedIndex + 1);
                    }}
                  >
                    <LucideIcon name="chevron-right" size={14} strokeWidth={2.5} />
                  </button>
                ) : null}

                <span className="hz-promo-player__time">{timeLabel}</span>

                <button
                  type="button"
                  className="hz-promo-player__ctrl hz-promo-player__ctrl--end"
                  aria-label={muted ? "Sesi aç" : "Sesi kapat"}
                  onClick={(event) => {
                    event.stopPropagation();
                    setMuted((value) => !value);
                  }}
                >
                  <LucideIcon name={muted ? "volume-x" : "volume-2"} size={14} strokeWidth={2.25} />
                </button>

                <button
                  type="button"
                  className="hz-promo-player__ctrl"
                  aria-label="Tam ekran"
                  onClick={(event) => {
                    event.stopPropagation();
                    void toggleFullscreen();
                  }}
                >
                  <LucideIcon name="maximize-2" size={14} strokeWidth={2.25} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
