"use client";

import type { EntityTimelineItem } from "@hallederiz/types";
import { useEffect, useState } from "react";
import { dataSourceConfig, sdk } from "../../../lib/data-source";

type PanelState = "loading" | "ready" | "empty" | "error";

function formatWhen(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export function EntityTimelinePanel({
  entityType,
  entityId,
  title = "İşlem geçmişi"
}: {
  entityType: string;
  entityId: string;
  title?: string;
}) {
  const [state, setState] = useState<PanelState>("loading");
  const [items, setItems] = useState<EntityTimelineItem[]>([]);

  useEffect(() => {
    if (!entityId || dataSourceConfig.useDemoData) {
      setItems([]);
      setState("empty");
      return;
    }

    let mounted = true;
    setState("loading");

    sdk.platform
      .listEntityTimeline(entityType, entityId)
      .then((response) => {
        if (!mounted) {
          return;
        }
        const list = response.items ?? [];
        setItems(list);
        setState(list.length > 0 ? "ready" : "empty");
      })
      .catch(() => {
        if (mounted) {
          setItems([]);
          setState("error");
        }
      });

    return () => {
      mounted = false;
    };
  }, [entityType, entityId]);

  return (
    <section className="hz-content-card hz-entity-timeline-panel" aria-label={title}>
      <header className="hz-entity-timeline-panel__head">
        <h3>{title}</h3>
      </header>
      {state === "loading" ? <p className="hz-muted">İşlem geçmişi yükleniyor…</p> : null}
      {state === "empty" ? <p className="hz-muted">Bu kayıt için işlem geçmişi bulunmuyor.</p> : null}
      {state === "error" ? <p className="hz-muted">İşlem geçmişi şu anda alınamıyor.</p> : null}
      {state === "ready" ? (
        <ul className="hz-entity-timeline-panel__list">
          {items.map((item) => (
            <li key={item.id} className="hz-entity-timeline-panel__item">
              <div className="hz-entity-timeline-panel__meta">
                <strong>{item.title}</strong>
                <span>{formatWhen(item.createdAt)}</span>
              </div>
              <p>{item.description}</p>
              <span className="hz-entity-timeline-panel__actor">{item.actorLabel}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

