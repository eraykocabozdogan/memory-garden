"use client";

import { Flower2, Sprout } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

import { getFlowerById } from "@/features/flowers/catalog";
import { buildGardenDays, istanbulDayKey, spiralCoordinate } from "./garden-layout";
import type { DiaryGardenFlower } from "./types";

type DiaryGardenProps = {
  flowers: DiaryGardenFlower[];
  now: string;
};

const TILE_WIDTH = 154;
const TILE_HEIGHT = 82;
const CANVAS_MARGIN = 116;

const gardenDateFormatter = new Intl.DateTimeFormat("tr-TR", {
  timeZone: "Europe/Istanbul",
  day: "numeric",
  month: "long",
  year: "numeric",
});

function formatGardenDay(dayKey: string) {
  return gardenDateFormatter.format(new Date(`${dayKey}T12:00:00+03:00`));
}

export function DiaryGarden({ flowers, now }: DiaryGardenProps) {
  const days = useMemo(() => buildGardenDays(now, flowers), [flowers, now]);
  const todayKey = istanbulDayKey(now);
  const [selectedDayKey, setSelectedDayKey] = useState(() => days.at(-1)?.dayKey);
  const scrollRef = useRef<HTMLDivElement>(null);
  const effectiveSelectedDayKey = days.some((day) => day.dayKey === selectedDayKey)
    ? selectedDayKey
    : days.at(-1)?.dayKey;

  const layout = useMemo(() => {
    const rawPositions = days.map((day) => {
      const coordinate = spiralCoordinate(day.index);
      return {
        ...day,
        ...coordinate,
        screenX: (coordinate.x - coordinate.y) * (TILE_WIDTH / 2),
        screenY: (coordinate.x + coordinate.y) * (TILE_HEIGHT / 2),
      };
    });
    const xValues = rawPositions.map((position) => position.screenX);
    const yValues = rawPositions.map((position) => position.screenY);
    const minX = Math.min(...xValues, 0);
    const maxX = Math.max(...xValues, 0);
    const minY = Math.min(...yValues, 0);
    const maxY = Math.max(...yValues, 0);

    return {
      width: Math.max(360, maxX - minX + TILE_WIDTH + CANVAS_MARGIN * 2),
      height: Math.max(330, maxY - minY + 220 + CANVAS_MARGIN * 2),
      positions: rawPositions.map((position) => ({
        ...position,
        left: position.screenX - minX + CANVAS_MARGIN,
        top: position.screenY - minY + CANVAS_MARGIN,
      })),
    };
  }, [days]);

  useEffect(() => {
    const scrollArea = scrollRef.current;
    if (!scrollArea || !effectiveSelectedDayKey) return;
    const tileButton = scrollArea.querySelector<HTMLElement>(`[data-garden-day="${effectiveSelectedDayKey}"]`);
    const tile = tileButton?.parentElement;
    if (!tile) return;
    scrollArea.scrollTo({
      left: tile.offsetLeft - scrollArea.clientWidth / 2 + tile.offsetWidth / 2,
      top: tile.offsetTop - scrollArea.clientHeight / 2 + tile.offsetHeight / 2,
      behavior: "smooth",
    });
  }, [effectiveSelectedDayKey, layout]);

  const selectedDay = days.find((day) => day.dayKey === effectiveSelectedDayKey) ?? days.at(-1);
  const flowerDayCount = days.filter((day) => day.flowers.length > 0).length;

  return (
    <section className="diary-garden" aria-labelledby="diary-garden-heading">
      <header className="diary-garden-heading">
        <div>
          <p className="eyebrow">30 Ağustos 2026&apos;dan beri</p>
          <h2 id="diary-garden-heading">Ortak çiçek bahçemiz</h2>
          <p>Her gün merkezden dışarı doğru büyür. Çiçek bırakılmayan günler çimen olarak kalır.</p>
        </div>
        <div className="diary-garden-counts" aria-label={`${days.length} günün ${flowerDayCount} tanesinde çiçek var`}>
          <strong>{days.length}</strong>
          <span>gün</span>
          <strong>{flowerDayCount}</strong>
          <span>çiçekli gün</span>
        </div>
      </header>

      <div className="diary-garden-scroll" ref={scrollRef}>
        <div
          className="diary-garden-canvas"
          style={{ width: layout.width, height: layout.height }}
          data-testid="diary-garden-canvas"
        >
          {layout.positions.map((day) => {
            const flowerDetails = day.flowers
              .map((gardenFlower) => getFlowerById(gardenFlower.flowerId))
              .filter((flower) => flower !== undefined);
            const flowerNames = flowerDetails.map((flower) => flower.name);
            const isSelected = day.dayKey === selectedDay?.dayKey;
            const label = `${formatGardenDay(day.dayKey)}: ${flowerNames.length > 0 ? flowerNames.join(", ") : "çiçek yok"}`;

            return (
              <div
                key={day.dayKey}
                className={`diary-garden-tile${isSelected ? " diary-garden-tile-selected" : ""}${day.dayKey === todayKey ? " diary-garden-tile-today" : ""}`}
                style={{ left: day.left, top: day.top, zIndex: 100 + day.x + day.y }}
              >
                <span className="diary-garden-ground" aria-hidden="true" />
                <button
                  type="button"
                  className="diary-garden-tile-hit"
                  data-garden-day={day.dayKey}
                  data-spiral-index={day.index}
                  data-grid-x={day.x}
                  data-grid-y={day.y}
                  aria-label={label}
                  aria-pressed={isSelected}
                  onClick={() => setSelectedDayKey(day.dayKey)}
                />
                {flowerDetails.length > 0 ? (
                  <span className="diary-garden-plants" aria-hidden="true">
                    {flowerDetails.slice(0, 3).map((flower, index) => (
                      <span className="diary-garden-plant" key={`${day.dayKey}-${flower.id}`} style={{ "--plant-index": index } as React.CSSProperties}>
                        {flower.artwork ? <Image src={flower.artwork.src} alt="" fill sizes="64px" /> : <Flower2 />}
                      </span>
                    ))}
                    {flowerDetails.length > 3 ? <span className="diary-garden-plant-more">+{flowerDetails.length - 3}</span> : null}
                  </span>
                ) : (
                  <Sprout className="diary-garden-empty-sprout" aria-hidden="true" />
                )}
                <span className="diary-garden-day-label">{day.dayKey.slice(8, 10)}.{day.dayKey.slice(5, 7)}</span>
              </div>
            );
          })}
        </div>
      </div>

      {selectedDay ? (
        <div className="diary-garden-selection" aria-live="polite">
          <div>
            <p className="eyebrow">Seçili gün</p>
            <h3>{formatGardenDay(selectedDay.dayKey)}</h3>
          </div>
          {selectedDay.flowers.length > 0 ? (
            <div className="diary-garden-selection-flowers">
              {selectedDay.flowers.map((gardenFlower) => {
                const flower = getFlowerById(gardenFlower.flowerId);
                if (!flower) return null;
                return (
                  <div key={gardenFlower.entryId}>
                    <span aria-hidden="true">
                      {flower.artwork ? <Image src={flower.artwork.src} alt="" fill sizes="44px" /> : <Flower2 />}
                    </span>
                    <p><strong>{flower.name}</strong><small>{flower.meaning}</small></p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="diary-garden-grass-note"><Sprout /> Bu gün çimen olarak kaldı.</p>
          )}
        </div>
      ) : null}
    </section>
  );
}
