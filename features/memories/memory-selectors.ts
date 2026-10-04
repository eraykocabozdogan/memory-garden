import type {
  CalendarView,
  DateCursor,
  DatePrecision,
  MemoryDay,
  MemoryItem,
} from "./types";

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

function itemInterval(item: MemoryItem): [start: string, end: string] | null {
  if (!item.date || item.datePrecision === "none") return null;

  if (item.datePrecision === "year") {
    return [`${item.date}-01-01`, `${item.date}-12-31`];
  }

  if (item.datePrecision === "month") {
    const [year, month] = item.date.split("-").map(Number);
    const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
    return [`${item.date}-01`, `${item.date}-${String(lastDay).padStart(2, "0")}`];
  }

  return [item.date, item.date];
}

function rangeInterval(view: CalendarView, cursor: DateCursor): [start: string, end: string] {
  const year = String(cursor.year);
  const month = String(cursor.month).padStart(2, "0");
  const day = String(cursor.day).padStart(2, "0");

  if (view === "year") return [`${year}-01-01`, `${year}-12-31`];
  if (view === "month") {
    const lastDay = new Date(Date.UTC(cursor.year, cursor.month, 0)).getUTCDate();
    return [`${year}-${month}-01`, `${year}-${month}-${String(lastDay).padStart(2, "0")}`];
  }
  return [`${year}-${month}-${day}`, `${year}-${month}-${day}`];
}

export function itemMatchesRange(
  item: MemoryItem,
  view: CalendarView,
  cursor: DateCursor,
): boolean {
  if (view === "day") {
    return item.datePrecision === "day" && item.date === toIsoDate(cursor);
  }

  const itemRange = itemInterval(item);
  if (!itemRange) return false;
  const selectedRange = rangeInterval(view, cursor);
  return itemRange[0] <= selectedRange[1] && itemRange[1] >= selectedRange[0];
}

export function getItemsForRange(
  items: MemoryItem[],
  view: CalendarView,
  cursor: DateCursor,
): MemoryItem[] {
  return items.filter((item) => itemMatchesRange(item, view, cursor));
}

export function hasActiveMediaProcessing(items: MemoryItem[]): boolean {
  return items.some(
    (item) => item.mediaStatus === "queued" || item.mediaStatus === "processing",
  );
}

export function buildMemoryDays(
  items: MemoryItem[],
  locationsByDate: Record<string, MemoryDay["locations"]> = {},
): MemoryDay[] {
  const groups = new Map<string, MemoryItem[]>();

  items.forEach((item) => {
    if (item.datePrecision !== "day" || !item.date) return;
    const group = groups.get(item.date) ?? [];
    group.push(item);
    groups.set(item.date, group);
  });

  return Array.from(groups.entries())
    .sort(([first], [second]) => first.localeCompare(second))
    .map(([date, dayItems]) => ({
      date,
      dateLabel: dayItems[0].dateLabel,
      items: dayItems,
      locations: locationsByDate[date] ?? [],
    }));
}

export function getDaysForRange(
  items: MemoryItem[],
  view: CalendarView,
  cursor: DateCursor,
  locationsByDate: Record<string, MemoryDay["locations"]> = {},
): MemoryDay[] {
  return buildMemoryDays(items, locationsByDate).filter((day) => {
    const dayItem = day.items[0];
    return itemMatchesRange(dayItem, view, cursor);
  });
}

export function toIsoDate(cursor: DateCursor): string {
  return `${cursor.year}-${String(cursor.month).padStart(2, "0")}-${String(cursor.day).padStart(2, "0")}`;
}

export function cursorFromIso(date: string): DateCursor {
  const [year, month, day] = date.split("-").map(Number);
  return { year, month, day };
}

export function shiftCursor(
  cursor: DateCursor,
  view: CalendarView,
  amount: -1 | 1,
): DateCursor {
  const date = new Date(Date.UTC(cursor.year, cursor.month - 1, cursor.day));

  if (view === "year") date.setUTCFullYear(date.getUTCFullYear() + amount);
  if (view === "month") date.setUTCMonth(date.getUTCMonth() + amount);
  if (view === "day") date.setUTCDate(date.getUTCDate() + amount);

  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  };
}

export function formatCursor(view: CalendarView, cursor: DateCursor) {
  if (view === "year") {
    return { label: String(cursor.year), range: `1 Ocak — 31 Aralık` };
  }

  if (view === "month") {
    const lastDay = new Date(Date.UTC(cursor.year, cursor.month, 0)).getUTCDate();
    return {
      label: `${monthNames[cursor.month - 1]} ${cursor.year}`,
      range: `1—${lastDay} ${monthNames[cursor.month - 1]}`,
    };
  }

  return {
    label: `${cursor.day} ${monthNames[cursor.month - 1]} ${cursor.year}`,
    range: "Tek bir gün",
  };
}

export function precisionLabel(precision: DatePrecision) {
  if (precision === "year") return "Yıl anısı";
  if (precision === "month") return "Ay anısı";
  if (precision === "none") return "Tarihsiz";
  return "Gün anısı";
}
