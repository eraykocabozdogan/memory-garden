import type { DatePrecision } from "./types";

export type ParsedMemoryDate = {
  precision: DatePrecision;
  dayDate: string | null;
  year: number | null;
  month: number | null;
};

export function parseMemoryDate(
  precision: unknown,
  value: unknown,
): ParsedMemoryDate | null {
  if (
    precision !== "none" &&
    precision !== "year" &&
    precision !== "month" &&
    precision !== "day"
  ) {
    return null;
  }

  if (precision === "none") {
    if (value !== undefined && value !== null && value !== "") return null;
    return { precision, dayDate: null, year: null, month: null };
  }

  if (typeof value !== "string") return null;

  if (precision === "year") {
    if (!/^\d{4}$/.test(value) || value === "0000") return null;
    return { precision, dayDate: null, year: Number(value), month: null };
  }

  if (precision === "month") {
    const match = /^(\d{4})-(\d{2})$/.exec(value);
    if (!match || match[1] === "0000") return null;
    const month = Number(match[2]);
    if (month < 1 || month > 12) return null;
    return { precision, dayDate: null, year: Number(match[1]), month };
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith("0000-")) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) return null;
  return { precision, dayDate: value, year: null, month: null };
}
