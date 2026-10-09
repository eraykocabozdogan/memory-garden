import { type ParsedMemoryDate, parseMemoryDate } from "./date-value";

export type ParsedMemoryUpdateInput = {
  date: ParsedMemoryDate;
  textContent?: string;
};

export function parseMemoryUpdateInput(
  value: Record<string, unknown>,
): ParsedMemoryUpdateInput | null {
  const date = parseMemoryDate(value.datePrecision, value.date);
  if (!date) return null;

  if (value.locations !== undefined) return null;

  if (value.textContent === undefined) return { date };
  if (typeof value.textContent !== "string") return null;

  const textContent = value.textContent.trim();
  if (!textContent) return null;
  return { date, textContent };
}
