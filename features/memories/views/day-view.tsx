"use client";

import Image from "next/image";
import { LoaderCircle, MapPin, Pencil, Route, RotateCcw, TriangleAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { cn } from "@/lib/utils";
import { retryMedia } from "../retry-media";
import type { MemoryDay, MemoryItem } from "../types";

type DayViewProps = {
  day?: MemoryDay;
  focusedItemId?: string;
  canEdit?: boolean;
  onEdit?: (item: MemoryItem) => void;
  onEditRoute?: () => void;
};

function DayPiece({
  item,
  focused,
  canEdit,
  onEdit,
}: {
  item: MemoryItem;
  focused: boolean;
  canEdit: boolean;
  onEdit?: (item: MemoryItem) => void;
}) {
  const router = useRouter();
  const [retrying, setRetrying] = useState(false);

  async function retry() {
    setRetrying(true);
    try {
      await retryMedia(item.id);
      router.refresh();
    } catch {
      router.refresh();
    } finally {
      setRetrying(false);
    }
  }

  return (
    <article
      id={`day-piece-${item.id}`}
      data-testid={`day-piece-${item.id}`}
      className={cn(
        "day-piece",
        `day-piece-${item.aspect}`,
        item.kind === "text" && "day-piece-text",
        focused && "day-piece-focused",
      )}
    >
      {canEdit ? (
        <button
          type="button"
          className="day-piece-edit"
          aria-label={`${item.title} anısını düzenle`}
          onClick={() => onEdit?.(item)}
        >
          <Pencil />
        </button>
      ) : null}
      {item.kind === "video" && item.image && item.display ? (
        <>
          <video
            src={item.display}
            poster={item.image}
            controls
            preload="metadata"
            className="absolute inset-0 size-full object-cover"
          />
          <span className="day-piece-caption">{item.title}</span>
        </>
      ) : item.image && item.display ? (
        <>
          <Image
            src={item.display}
            alt={item.alt ?? ""}
            fill
            unoptimized={item.image.startsWith("/api/media/")}
            sizes="(max-width: 760px) 92vw, 40vw"
            className="object-cover"
          />
          <span className="day-piece-caption">{item.title}</span>
        </>
      ) : item.kind === "text" ? (
        <div className="flex h-full flex-col justify-between p-6 sm:p-8">
          <span className="font-handwriting text-3xl text-accent-ink">o gün</span>
          <blockquote className="font-serif text-2xl leading-snug sm:text-3xl">“{item.body}”</blockquote>
          <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{item.title}</span>
        </div>
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-3 bg-muted/60 p-6 text-center text-muted-foreground">
          {item.mediaStatus === "failed" ? (
            retrying ? <LoaderCircle className="size-7 animate-spin" /> : <TriangleAlert className="size-7" />
          ) : (
            <LoaderCircle className="size-7 animate-spin" />
          )}
          <p className="font-medium">
            {item.mediaStatus === "failed" ? "Medya işlenemedi" : "Medya işleniyor"}
          </p>
          {item.mediaStatus === "failed" ? (
            <button className="flex items-center gap-2 text-sm underline" onClick={retry} disabled={retrying}>
              <RotateCcw className="size-4" /> Yeniden dene
            </button>
          ) : null}
        </div>
      )}
    </article>
  );
}

export function DayView({
  day,
  focusedItemId,
  canEdit = false,
  onEdit,
  onEditRoute,
}: DayViewProps) {
  if (!day) {
    return (
      <div className="empty-state" data-testid="day-empty">
        <span className="font-handwriting text-3xl text-accent-ink">sessiz bir gün</span>
        <p>Bu gün için bir anı öğesi bulunmuyor.</p>
      </div>
    );
  }

  return (
    <article className="day-entry" data-testid="day-entry">
      <header className="day-entry-header">
        <div>
          <p className="eyebrow">Anı günü</p>
          <h2 className="mt-1 font-handwriting text-4xl leading-none text-accent-ink sm:text-5xl">
            {day.dateLabel}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">{day.items.length} parça, tek bir günlük girdi</p>
        </div>
        <div className="day-route-panel">
          <ol className="day-locations" aria-label="Günün konum rotası">
            {day.locations.length > 0 ? (
              day.locations.map((location, index) => (
                <li key={location.id}>
                  <span>{index + 1}</span>
                  {location.label}
                </li>
              ))
            ) : (
              <li className="text-muted-foreground">
                <MapPin className="size-3.5" />
                Konum eklenmemiş
              </li>
            )}
          </ol>
          {canEdit ? (
            <button type="button" className="day-route-edit" onClick={onEditRoute}>
              <Route />
              Rotayı düzenle
            </button>
          ) : null}
        </div>
      </header>
      <div className="day-collage">
        {day.items.map((item) => (
          <DayPiece
            key={item.id}
            item={item}
            focused={item.id === focusedItemId}
            canEdit={canEdit}
            onEdit={onEdit}
          />
        ))}
      </div>
      <footer className="day-entry-footer">
        <span className="font-handwriting text-2xl text-accent-ink">bizden, bize.</span>
        <span>{day.dateLabel}</span>
      </footer>
    </article>
  );
}
