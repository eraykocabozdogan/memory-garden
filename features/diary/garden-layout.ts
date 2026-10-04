import type { DiaryGardenFlower } from "./types";

export const DIARY_GARDEN_START_DAY = "2026-08-30";
export const DIARY_GARDEN_START_AT = new Date("2026-08-29T21:00:00.000Z");

const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

const dayKeyFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Istanbul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export type GardenDay = {
  dayKey: string;
  index: number;
  flowers: DiaryGardenFlower[];
};

export type GardenCoordinate = {
  x: number;
  y: number;
};

export function istanbulDayKey(value: string | Date) {
  const parts = dayKeyFormatter.formatToParts(typeof value === "string" ? new Date(value) : value);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;
  return `${year}-${month}-${day}`;
}

function dayNumber(dayKey: string) {
  const [year, month, day] = dayKey.split("-").map(Number);
  return Date.UTC(year, month - 1, day) / DAY_IN_MILLISECONDS;
}

function dayKeyFromNumber(value: number) {
  return new Date(value * DAY_IN_MILLISECONDS).toISOString().slice(0, 10);
}

export function buildGardenDays(now: string | Date, flowers: DiaryGardenFlower[]) {
  const today = istanbulDayKey(now);
  const startDayNumber = dayNumber(DIARY_GARDEN_START_DAY);
  const todayNumber = dayNumber(today);
  if (todayNumber < startDayNumber) return [];

  const flowersByDay = new Map<string, DiaryGardenFlower[]>();
  for (const flower of flowers) {
    const dayKey = istanbulDayKey(flower.plantedAt);
    if (dayKey < DIARY_GARDEN_START_DAY || dayKey > today) continue;
    const dayFlowers = flowersByDay.get(dayKey) ?? [];
    dayFlowers.push(flower);
    flowersByDay.set(dayKey, dayFlowers);
  }
  for (const dayFlowers of flowersByDay.values()) {
    dayFlowers.sort((left, right) => left.plantedAt.localeCompare(right.plantedAt));
  }

  return Array.from({ length: todayNumber - startDayNumber + 1 }, (_, index): GardenDay => {
    const dayKey = dayKeyFromNumber(startDayNumber + index);
    return { dayKey, index, flowers: flowersByDay.get(dayKey) ?? [] };
  });
}

export function spiralCoordinate(index: number): GardenCoordinate {
  if (index <= 0) return { x: 0, y: 0 };

  let x = 0;
  let y = 0;
  let directionIndex = 0;
  let legLength = 1;
  let legProgress = 0;
  let completedLegs = 0;
  const directions: GardenCoordinate[] = [
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
    { x: 0, y: -1 },
  ];

  for (let step = 0; step < index; step += 1) {
    x += directions[directionIndex].x;
    y += directions[directionIndex].y;
    legProgress += 1;

    if (legProgress === legLength) {
      legProgress = 0;
      directionIndex = (directionIndex + 1) % directions.length;
      completedLegs += 1;
      if (completedLegs % 2 === 0) legLength += 1;
    }
  }

  return { x, y };
}
