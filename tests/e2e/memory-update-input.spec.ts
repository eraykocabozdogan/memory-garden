import { expect, test } from "@playwright/test";

import { parseMemoryUpdateInput } from "../../features/memories/memory-update-input";

test("accepts every date precision without coupling items to day locations", () => {
  expect(parseMemoryUpdateInput({ datePrecision: "none" })).toMatchObject({
    date: { precision: "none", dayDate: null, year: null, month: null },
  });
  expect(parseMemoryUpdateInput({ datePrecision: "year", date: "2026" })).toMatchObject({
    date: { precision: "year", dayDate: null, year: 2026, month: null },
  });
  expect(parseMemoryUpdateInput({ datePrecision: "month", date: "2026-05" })).toMatchObject({
    date: { precision: "month", dayDate: null, year: 2026, month: 5 },
  });
  expect(
    parseMemoryUpdateInput({
      datePrecision: "day",
      date: "2026-05-15",
    }),
  ).toMatchObject({
    date: { precision: "day", dayDate: "2026-05-15", year: null, month: null },
  });
});

test("normalizes text and rejects invalid update input", () => {
  expect(
    parseMemoryUpdateInput({
      datePrecision: "year",
      date: "2026",
      textContent: "  Yeni metin  ",
    })?.textContent,
  ).toBe("Yeni metin");
  expect(parseMemoryUpdateInput({ datePrecision: "day", date: "2026-02-30" })).toBeNull();
  expect(parseMemoryUpdateInput({ datePrecision: "none", textContent: "   " })).toBeNull();
  expect(parseMemoryUpdateInput({ datePrecision: "month", date: "2026-13" })).toBeNull();
  expect(
    parseMemoryUpdateInput({
      datePrecision: "day",
      date: "2026-05-15",
      locations: [{ provinceCode: "35" }],
    }),
  ).toBeNull();
});
