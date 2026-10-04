"use client";

import { LocateFixed, Minus, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type {
  Map as MapLibreMap,
  Marker as MapLibreMarker,
  StyleSpecification,
} from "maplibre-gl";

import type { Coordinates, MemoryDay } from "../types";

const memoryBounds: [Coordinates, Coordinates] = [
  [22.8, 34.1],
  [46.1, 44.2],
];

const prototypeMapStyle: StyleSpecification = {
  version: 8,
  sources: {
    openStreetMap: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors",
      maxzoom: 19,
    },
  },
  layers: [{ id: "base-map", type: "raster", source: "openStreetMap" }],
};

const seaPositions: Coordinates[] = [
  [23.9, 37.4],
  [30.7, 34.5],
  [35.6, 43.4],
  [42.8, 43.1],
];

type MapViewProps = {
  days: MemoryDay[];
  rangeLabel: string;
  onOpenDay: (day: MemoryDay) => void;
};

function seaPositionFor(date: string) {
  const seed = date.split("").reduce((total, character) => total + character.charCodeAt(0), 0);
  return seaPositions[seed % seaPositions.length];
}

function createStopMarker(index: number, label: string) {
  const element = document.createElement("div");
  element.className = "map-stop";
  element.textContent = String(index + 1);
  element.title = label;
  element.setAttribute("aria-label", `${index + 1}. durak: ${label}`);
  return element;
}

function createDayCard(day: MemoryDay, isFloating: boolean, onOpen: () => void) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "map-memory-card";
  button.dataset.testid = `map-card-${day.date}`;
  button.setAttribute("aria-label", `${day.dateLabel} anılarını aç`);

  const preview = day.items.find((item) => item.image)?.image;
  if (preview) {
    const image = document.createElement("img");
    image.src = preview;
    image.alt = "";
    button.append(image);
  }

  const copy = document.createElement("span");
  copy.className = "map-memory-copy";

  const date = document.createElement("strong");
  date.textContent = day.dateLabel.replace(/\s\d{4}$/, "");
  copy.append(date);

  const detail = document.createElement("small");
  detail.textContent = isFloating
    ? `${day.items.length} parça · konumsuz`
    : `${day.items.length} parça · ${day.locations.at(-1)?.label}`;
  copy.append(detail);
  button.append(copy);

  let timer: ReturnType<typeof setTimeout> | undefined;
  let longPressed = false;
  button.addEventListener("pointerdown", () => {
    longPressed = false;
    timer = setTimeout(() => {
      longPressed = true;
      button.dataset.expanded = "true";
    }, 420);
  });
  const release = () => {
    if (timer) clearTimeout(timer);
    timer = undefined;
    window.setTimeout(() => delete button.dataset.expanded, 180);
  };
  button.addEventListener("pointerup", release);
  button.addEventListener("pointercancel", release);
  button.addEventListener("pointerleave", release);
  button.addEventListener("contextmenu", (event) => event.preventDefault());
  button.addEventListener("click", () => {
    if (!longPressed) onOpen();
  });

  return button;
}

export function MapView({ days, rangeLabel, onOpenDay }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<MapLibreMarker[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    let disposed = false;
    let resizeObserver: ResizeObserver | undefined;

    async function mountMap() {
      const maplibregl = await import("maplibre-gl");
      if (disposed || !containerRef.current) return;

      const map = new maplibregl.Map({
        container: containerRef.current,
        style: prototypeMapStyle,
        bounds: memoryBounds,
        fitBoundsOptions: { padding: 44 },
        minZoom: 3.6,
        maxZoom: 14,
        attributionControl: false,
      });
      mapRef.current = map;
      map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");
      resizeObserver = new ResizeObserver(() => map.resize());
      resizeObserver.observe(containerRef.current);
      requestAnimationFrame(() => map.resize());

      days.forEach((day) => {
        const isFloating = day.locations.length === 0;
        const cardPosition = isFloating
          ? seaPositionFor(day.date)
          : day.locations.at(-1)!.coordinates;
        const card = createDayCard(day, isFloating, () => onOpenDay(day));
        const cardMarker = new maplibregl.Marker({
          element: card,
          anchor: isFloating ? "center" : "bottom-left",
          offset: isFloating ? [0, 0] : [12, -12],
        })
          .setLngLat(cardPosition)
          .addTo(map);
        markersRef.current.push(cardMarker);

        day.locations.forEach((location, index) => {
          const centerIndex = (day.locations.length - 1) / 2;
          const stopMarker = new maplibregl.Marker({
            element: createStopMarker(index, location.label),
            anchor: "center",
            offset: [(index - centerIndex) * 18, index % 2 === 0 ? 7 : -7],
          })
            .setLngLat(location.coordinates)
            .addTo(map);
          markersRef.current.push(stopMarker);
        });
      });

      map.once("style.load", () => {
        if (disposed) return;

        days.forEach((day) => {
          if (day.locations.length < 2) return;
          const sourceId = `route-${day.date}`;
          map.addSource(sourceId, {
            type: "geojson",
            data: {
              type: "Feature",
              properties: {},
              geometry: {
                type: "LineString",
                coordinates: day.locations.map((location) => location.coordinates),
              },
            },
          });
          map.addLayer({
            id: sourceId,
            type: "line",
            source: sourceId,
            layout: { "line-cap": "round", "line-join": "round" },
            paint: {
              "line-color": "#9f625f",
              "line-width": 2.4,
              "line-dasharray": [1.4, 2.2],
              "line-opacity": 0.92,
            },
          });
        });

        setReady(true);
        map.resize();
      });
    }

    void mountMap();

    return () => {
      disposed = true;
      resizeObserver?.disconnect();
      markersRef.current = [];
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [days, onOpenDay]);

  return (
    <div className="map-journal" data-testid="map-view">
      <div className="map-journal-heading">
        <div>
          <p className="eyebrow">Seyahat defteri</p>
          <h2 className="mt-1 font-serif text-2xl sm:text-3xl">{rangeLabel}</h2>
        </div>
        <p className="max-w-sm text-xs leading-5 text-muted-foreground">
          Bir gün, bir anı kartı. Numaralı duraklar gün içindeki sırayı; kesikli çizgi yolculuğu gösterir.
        </p>
      </div>

      <div className="map-stage">
        <div ref={containerRef} className="memory-map" aria-label="Anıların Türkiye haritası" />
        {!ready ? <div className="map-loading">Harita hazırlanıyor…</div> : null}
        <div className="map-controls" aria-label="Harita kontrolleri">
          <button type="button" aria-label="Yakınlaştır" onClick={() => mapRef.current?.zoomIn()}>
            <Plus />
          </button>
          <button type="button" aria-label="Uzaklaştır" onClick={() => mapRef.current?.zoomOut()}>
            <Minus />
          </button>
          <button
            type="button"
            aria-label="Türkiye görünümüne dön"
            onClick={() => mapRef.current?.fitBounds(memoryBounds, { padding: 44, duration: 700 })}
          >
            <LocateFixed />
          </button>
        </div>
        <div className="map-legend">
          <span><i className="map-legend-stop">1</i> durak</span>
          <span><i className="map-legend-route" /> yolculuk</span>
          <span><i className="map-legend-card" /> anı günü</span>
        </div>
      </div>
    </div>
  );
}
