import "server-only";

import { asc, eq } from "drizzle-orm";

import { getDatabase } from "@/db";
import {
  mediaAssets,
  memoryDayLocations,
  memoryDays,
  memoryItems as memoryItemsTable,
} from "@/db/schema";
import type { DatePrecision, MemoryAspect, MemoryItem, MemoryLocation } from "./types";

const monthNames = [
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
  "Haziran",
  "Temmuz",
  "Ağustos",
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık",
];

function itemDate(
  precision: DatePrecision,
  dayDate: string | null,
  year: number | null,
  month: number | null,
) {
  if (precision === "day") return dayDate;
  if (precision === "month" && year && month) {
    return `${year}-${String(month).padStart(2, "0")}`;
  }
  if (precision === "year" && year) return String(year);
  return null;
}

function dateLabel(date: string | null, precision: DatePrecision) {
  if (!date || precision === "none") return "Tarihsiz";
  if (precision === "year") return date;

  const [year, month, day] = date.split("-").map(Number);
  if (precision === "month") return `${monthNames[month - 1]} ${year}`;
  return `${day} ${monthNames[month - 1]} ${year}`;
}

function mediaAspect(
  kind: "photo" | "video" | "text",
  width: number | null,
  height: number | null,
): MemoryAspect {
  if (kind === "text") return "note";
  if (!width || !height || width === height) return "square";
  return width > height ? "landscape" : "portrait";
}

export async function getMemoryArchive() {
  const database = getDatabase();
  const rows = await database
    .select({
      id: memoryItemsTable.id,
      kind: memoryItemsTable.kind,
      precision: memoryItemsTable.datePrecision,
      dayDate: memoryDays.memoryDate,
      year: memoryItemsTable.memoryYear,
      month: memoryItemsTable.memoryMonth,
      text: memoryItemsTable.textContent,
      originalFileName: mediaAssets.originalFileName,
      mediaStatus: mediaAssets.status,
      width: mediaAssets.width,
      height: mediaAssets.height,
      sortOrder: memoryItemsTable.sortOrder,
      createdAt: memoryItemsTable.createdAt,
    })
    .from(memoryItemsTable)
    .leftJoin(memoryDays, eq(memoryItemsTable.memoryDayId, memoryDays.id))
    .leftJoin(mediaAssets, eq(memoryItemsTable.id, mediaAssets.memoryItemId))
    .orderBy(asc(memoryItemsTable.sortOrder), asc(memoryItemsTable.createdAt));

  const items: MemoryItem[] = rows.map((row) => {
    const date = itemDate(row.precision, row.dayDate, row.year, row.month);
    const fallbackTitle =
      row.kind === "text" ? "Metin" : row.kind === "photo" ? "Fotoğraf" : "Video";

    return {
      id: row.id,
      kind: row.kind,
      date,
      dateLabel: dateLabel(date, row.precision),
      datePrecision: row.precision,
      title: row.originalFileName || fallbackTitle,
      body: row.text ?? undefined,
      image:
        row.kind !== "text" && row.mediaStatus === "ready"
          ? `/api/media/${row.id}?variant=preview`
          : undefined,
      display:
        row.kind !== "text" && row.mediaStatus === "ready"
          ? `/api/media/${row.id}?variant=display`
          : undefined,
      mediaStatus: row.kind === "text" ? undefined : (row.mediaStatus ?? "failed"),
      alt: row.originalFileName || fallbackTitle,
      aspect: mediaAspect(row.kind, row.width, row.height),
    };
  });

  const locationRows = await database
    .select({
      id: memoryDayLocations.id,
      date: memoryDays.memoryDate,
      provinceCode: memoryDayLocations.provinceCode,
      provinceName: memoryDayLocations.provinceName,
      districtCode: memoryDayLocations.districtCode,
      districtName: memoryDayLocations.districtName,
      longitude: memoryDayLocations.longitude,
      latitude: memoryDayLocations.latitude,
    })
    .from(memoryDayLocations)
    .innerJoin(memoryDays, eq(memoryDayLocations.memoryDayId, memoryDays.id))
    .orderBy(asc(memoryDays.memoryDate), asc(memoryDayLocations.sortOrder));

  const locationsByDate: Record<string, MemoryLocation[]> = {};
  const locationSelectionsByDate: Record<
    string,
    Array<{ provinceCode: string; districtCode?: string }>
  > = {};
  locationRows.forEach((row) => {
    const location: MemoryLocation = {
      id: row.id,
      label: row.districtName
        ? `${row.provinceName} · ${row.districtName}`
        : row.provinceName,
      coordinates: [row.longitude, row.latitude],
    };
    (locationsByDate[row.date] ??= []).push(location);
    (locationSelectionsByDate[row.date] ??= []).push({
      provinceCode: row.provinceCode,
      districtCode: row.districtCode ?? undefined,
    });
  });

  return { items, locationsByDate, locationSelectionsByDate };
}
