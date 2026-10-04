"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { LoaderCircle, MapPin, Play, RotateCcw, TriangleAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { type CSSProperties, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { precisionLabel } from "./memory-selectors";
import { retryMedia } from "./retry-media";
import type { MemoryItem } from "./types";

const rowSpans = {
  landscape: 35,
  portrait: 55,
  square: 44,
  note: 33,
};

type MemoryTileProps = {
  item: MemoryItem;
  locationLabel?: string;
  compact?: boolean;
  pointerExpanded?: boolean;
  onOpen: (item: MemoryItem) => void;
};

export function MemoryTile({
  item,
  locationLabel,
  compact = false,
  pointerExpanded = false,
  onOpen,
}: MemoryTileProps) {
  const [longPressExpanded, setLongPressExpanded] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const router = useRouter();
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressed = useRef(false);
  const expanded = pointerExpanded || longPressExpanded;

  function beginPress() {
    longPressed.current = false;
    longPressTimer.current = setTimeout(() => {
      longPressed.current = true;
      setLongPressExpanded(true);
    }, 420);
  }

  function endPress() {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    longPressTimer.current = null;
    window.setTimeout(() => setLongPressExpanded(false), 180);
  }

  return (
    <motion.button
      layout
      data-testid={`memory-${item.id}`}
      data-memory-id={item.id}
      data-expanded={expanded || undefined}
      aria-label={
        item.mediaStatus === "failed"
          ? `${item.title}, işleme başarısız, yeniden dene`
          : `${item.title}, ${item.dateLabel}`
      }
      onPointerDown={beginPress}
      onPointerUp={endPress}
      onPointerCancel={endPress}
      onContextMenu={(event) => event.preventDefault()}
      onClick={async () => {
        if (longPressed.current) return;
        if (item.mediaStatus === "failed") {
          setRetrying(true);
          try {
            await retryMedia(item.id);
            router.refresh();
          } catch {
            router.refresh();
          } finally {
            setRetrying(false);
          }
          return;
        }
        onOpen(item);
      }}
      style={
        {
          "--tile-span": rowSpans[item.aspect],
          "--tile-span-expanded": rowSpans[item.aspect] + 12,
        } as CSSProperties
      }
      className={cn("memory-tile group text-left", compact && "memory-tile-compact")}
      transition={{ layout: { duration: 0.28, ease: [0.22, 1, 0.36, 1] } }}
    >
      <span
        className={cn(
          "memory-frame relative block h-full overflow-hidden",
          item.kind === "text" && "memory-note",
        )}
      >
        {item.image ? (
          <Image
            src={item.image}
            alt={item.alt ?? ""}
            fill
            unoptimized={item.image.startsWith("/api/media/")}
            sizes="(max-width: 640px) 50vw, (max-width: 1100px) 33vw, 24vw"
            className="object-cover transition-transform duration-500 group-data-[expanded]:scale-[1.035]"
          />
        ) : item.kind === "text" ? (
          <span className="flex h-full flex-col justify-between p-5 sm:p-6">
            <span className="font-handwriting text-[1.65rem] leading-none text-accent-ink">not</span>
            <span className="font-serif text-[1.15rem] leading-snug text-foreground sm:text-[1.35rem]">
              “{item.body}”
            </span>
            <span className="h-px w-8 bg-accent-ink/60" />
          </span>
        ) : (
          <span className="flex h-full flex-col items-center justify-center gap-3 bg-muted/60 p-5 text-center text-muted-foreground">
            {item.mediaStatus === "failed" ? (
              retrying ? <LoaderCircle className="size-6 animate-spin" /> : <TriangleAlert className="size-6" />
            ) : (
              <LoaderCircle className="size-6 animate-spin" />
            )}
            <span className="text-sm font-medium">
              {item.mediaStatus === "failed" ? "İşlenemedi" : "İşleniyor"}
            </span>
            {item.mediaStatus === "failed" ? (
              <span className="flex items-center gap-1 text-xs">
                <RotateCcw className="size-3" /> Yeniden dene
              </span>
            ) : null}
          </span>
        )}

        {item.kind === "video" ? (
          <span className="absolute left-3 top-3 grid size-9 place-items-center rounded-full bg-paper/90 text-foreground backdrop-blur-sm">
            <Play className="ml-0.5 size-4 fill-current" />
          </span>
        ) : null}

        <span className="memory-caption">
          <span className="min-w-0">
            <span className="block truncate font-medium">{item.title}</span>
            <span className="mt-0.5 block text-xs text-muted-foreground">
              {item.dateLabel} · {precisionLabel(item.datePrecision)}
            </span>
          </span>
          {locationLabel ? (
            <span title={locationLabel}>
              <MapPin className="mt-0.5 size-3.5 shrink-0" />
            </span>
          ) : null}
        </span>
      </span>
    </motion.button>
  );
}
