export type MemoryKind = "photo" | "video" | "text";
export type DatePrecision = "day" | "month" | "year" | "none";
export type MemoryAspect = "portrait" | "landscape" | "square" | "note";
export type MediaStatus = "queued" | "processing" | "ready" | "failed";
export type Coordinates = [longitude: number, latitude: number];

export type MemoryItem = {
  id: string;
  kind: MemoryKind;
  date: string | null;
  dateLabel: string;
  datePrecision: DatePrecision;
  title: string;
  body?: string;
  image?: string;
  display?: string;
  mediaStatus?: MediaStatus;
  alt?: string;
  aspect: MemoryAspect;
};

export type MemoryLocation = {
  id: string;
  label: string;
  coordinates: Coordinates;
};

export type MemoryDay = {
  date: string;
  dateLabel: string;
  items: MemoryItem[];
  locations: MemoryLocation[];
};

export type CalendarView = "day" | "month" | "year";
export type ViewMode = CalendarView | "map";

export type DateCursor = {
  year: number;
  month: number;
  day: number;
};
