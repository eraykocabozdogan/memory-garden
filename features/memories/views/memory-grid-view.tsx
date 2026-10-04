"use client";

import { MapPin } from "lucide-react";
import { useState } from "react";

import { MemoryTile } from "../memory-tile";
import type { MemoryDay, MemoryItem } from "../types";

type MemoryGridViewProps = {
  items: MemoryItem[];
  locationsByDate: Record<string, MemoryDay["locations"]>;
  mode: "month" | "year";
  onOpen: (item: MemoryItem) => void;
};

export function MemoryGridView({ items, locationsByDate, mode, onOpen }: MemoryGridViewProps) {
  const [hoveredItemId, setHoveredItemId] = useState<string>();

  if (items.length === 0) {
    return (
      <div className="empty-state" data-testid={`${mode}-empty`}>
        <span className="font-handwriting text-3xl text-accent-ink">henüz boş</span>
        <p>Bu tarih aralığına ait bir anı bulunmuyor.</p>
      </div>
    );
  }

  return (
    <>
      {mode === "year" ? (
        <div className="year-intro">
          <p className="font-serif text-lg">Yılın bütün parçaları</p>
          <p className="text-xs leading-5 text-muted-foreground">
            Gün, ay ve yalnızca yıl bilgisi olan her öğe burada ayrı ayrı yer alır.
          </p>
        </div>
      ) : null}
      <div
        className={mode === "year" ? "memory-grid memory-grid-year" : "memory-grid"}
        data-testid={`${mode}-grid`}
        onPointerMove={(event) => {
          if (event.pointerType !== "mouse") return;
          const target = event.target instanceof Element ? event.target : null;
          const itemId = target?.closest<HTMLElement>("[data-memory-id]")?.dataset.memoryId;
          setHoveredItemId(itemId);
        }}
        onPointerLeave={() => setHoveredItemId(undefined)}
      >
        {items.map((item) => {
          const location = item.date ? locationsByDate[item.date]?.[0]?.label : undefined;
          return (
            <MemoryTile
              key={item.id}
              item={item}
              locationLabel={location}
              compact={mode === "year"}
              pointerExpanded={hoveredItemId === item.id}
              onOpen={onOpen}
            />
          );
        })}
      </div>
      <p className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
        <MapPin className="size-3.5" />
        Konum işareti, öğenin değil o günün konum bilgisini gösterir.
      </p>
    </>
  );
}
